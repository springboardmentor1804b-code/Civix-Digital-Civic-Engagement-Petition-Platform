import React, { useEffect, useMemo, useState } from 'react';
import { Card, Row, Col, Button, Table, Spin, message, Select } from 'antd';
import {
  DownloadOutlined,
  PrinterOutlined,
  RiseOutlined,
  FallOutlined,
  PieChartOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { getPetitions } from '../../services/api';
import { pollService } from '../../services/pollService';
import './Reports.css';

const { Option } = Select;

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

const KPI = ({ title, value, percent, isUp }) => (
  <Card 
    className="kpi-card" 
    styles={{ body: { padding: '16px 24px' } }}
  >
    <div className="kpi-title">{title}</div>
    <div className="kpi-value">{value}</div>
  </Card>
);

export default function Reports({ allPolls = [] }) {
  const [allPetitions, setAllPetitions] = useState([]);
  const [realTimePolls, setRealTimePolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pollsLoading, setPollsLoading] = useState(false);
  const [petitionsLoading, setPetitionsLoading] = useState(false);
  const [selectedPollId, setSelectedPollId] = useState(null);
  const [selectedPetitionId, setSelectedPetitionId] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch real-time polls from backend
  const fetchRealTimePolls = async (showLoading = true) => {
    try {
      if (showLoading) setPollsLoading(true);
      
      const response = await pollService.getPolls();
      
      // Transform backend data to include vote analytics
      const pollsWithAnalytics = response.map(poll => {
        let totalVotes = 0;
        let voteBreakdown = {};

        // Handle different vote data structures from backend
        if (poll.votes) {
          if (Array.isArray(poll.votes)) {
            // If votes is an array of vote objects
            totalVotes = poll.votes.length;
            poll.votes.forEach(vote => {
              const option = vote.option || vote.choice;
              voteBreakdown[option] = (voteBreakdown[option] || 0) + 1;
            });
          } else if (typeof poll.votes === 'object') {
            // If votes is an object with option counts
            voteBreakdown = { ...poll.votes };
            totalVotes = Object.values(poll.votes).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
          }
        }

        // Calculate engagement metrics
        const createdAt = new Date(poll.createdAt || Date.now());
        const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        const engagementRate = hoursAgo > 0 ? (totalVotes / Math.max(hoursAgo, 1)).toFixed(2) : 0;

        return {
          ...poll,
          totalVotes,
          voteBreakdown,
          engagementRate: parseFloat(engagementRate),
          lastFetched: new Date().toISOString()
        };
      });

      setRealTimePolls(pollsWithAnalytics);
      setLastUpdated(new Date());

      // Auto-select the most voted poll if none selected
      if (!selectedPollId && pollsWithAnalytics.length > 0) {
        const mostVotedPoll = pollsWithAnalytics.reduce((prev, current) => 
          current.totalVotes > prev.totalVotes ? current : prev
        );
        setSelectedPollId(mostVotedPoll._id || mostVotedPoll.id);
      }

    } catch (error) {
      console.error('Error fetching real-time polls:', error);
      message.error('Failed to load real-time poll data');
    } finally {
      if (showLoading) setPollsLoading(false);
    }
  };

  // Fetch petitions from backend with analytics
  const fetchRealTimePetitions = async (showLoading = true) => {
    try {
      if (showLoading) setPetitionsLoading(true);
      
      const response = await getPetitions();
      const petitionsData = Array.isArray(response) ? response : response.petitions || [];
      
      // Transform petition data to include signature analytics
      const petitionsWithAnalytics = petitionsData.map(petition => {
        const signaturesCount = petition.signaturesCount || petition.signatures?.length || 0;
        const signatureGoal = petition.signatureGoal || 100;
        
        // Calculate engagement metrics
        const createdAt = new Date(petition.createdAt || Date.now());
        const hoursAgo = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
        const engagementRate = hoursAgo > 0 ? (signaturesCount / Math.max(hoursAgo, 1)).toFixed(2) : 0;
        const completionRate = ((signaturesCount / signatureGoal) * 100).toFixed(1);
        
        return {
          ...petition,
          signaturesCount,
          signatureGoal,
          engagementRate: parseFloat(engagementRate),
          completionRate: parseFloat(completionRate),
          lastFetched: new Date().toISOString()
        };
      });
      
      setAllPetitions(petitionsWithAnalytics);
      setLastUpdated(new Date());
      
      // Auto-select the most signed petition if none selected
      if (!selectedPetitionId && petitionsWithAnalytics.length > 0) {
        const mostSignedPetition = petitionsWithAnalytics.reduce((prev, current) => 
          current.signaturesCount > prev.signaturesCount ? current : prev
        );
        setSelectedPetitionId(mostSignedPetition._id || mostSignedPetition.id);
      }
      
    } catch (err) {
      console.error('Error fetching petitions:', err);
      message.error("Failed to load petitions");
    } finally {
      if (showLoading) setPetitionsLoading(false);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRealTimePetitions();
    fetchRealTimePolls();
  }, []);

  // Auto-select "Overall Review" for petitions if none selected
  useEffect(() => {
    if (!selectedPetitionId && allPetitions.length > 0) {
      setSelectedPetitionId('overall');
    }
  }, [allPetitions, selectedPetitionId]);

  // Auto-refresh setup
  useEffect(() => {
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchRealTimePolls(false);
        fetchRealTimePetitions(false);
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const pollsData = realTimePolls.length > 0 ? realTimePolls : allPolls;

  // Compute stats from real-time data
  const { 
    pollStats, 
    petitionStats, 
    topPolls, 
    topPetitions,
    pollBarData, 
    petitionBarData,
    pollResultData, 
    petitionResultData,
    selectedPoll,
    selectedPetition 
  } = useMemo(() => {
    // Poll Stats
    const pollStats = {
      total: pollsData.length,
      active: pollsData.filter((p) => p.status === 'active').length,
      closed: pollsData.filter((p) => p.status === 'closed' || p.status === 'completed').length,
      underReview: pollsData.filter((p) => p.status === 'under_review').length,
    };

    // Petition Stats
    const petitionStats = {
      total: allPetitions.length,
      active: allPetitions.filter((p) => p.status === 'active').length,
      closed: allPetitions.filter((p) => p.status === 'closed' || p.status === 'successful').length,
      underReview: allPetitions.filter((p) => p.status === 'under_review').length,
    };

    // Top Polls
    const topPolls = [...pollsData]
      .map((p) => ({
        id: p._id || p.id,
        title: p.title || p.question || 'Untitled Poll',
        votes: p.totalVotes || 0,
        engagementRate: p.engagementRate || 0
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);

    // Top Petitions
    const topPetitions = [...allPetitions]
      .map((p) => ({
        id: p._id || p.id,
        title: p.title || 'Untitled Petition',
        signatures: p.signaturesCount || 0,
        engagementRate: p.engagementRate || 0,
        completionRate: p.completionRate || 0
      }))
      .sort((a, b) => b.signatures - a.signatures)
      .slice(0, 5);

    // Poll Monthly Creation
    const pollMonthCounts = Array(12).fill(0);
    pollsData.forEach((poll) => {
      const date = new Date(poll.createdAt || poll.date || Date.now());
      pollMonthCounts[date.getMonth()]++;
    });
    
    const pollBarData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{ 
        label: 'Polls Created', 
        data: pollMonthCounts, 
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        borderWidth: 1
      }],
    };

    // Petition Monthly Creation
    const petitionMonthCounts = Array(12).fill(0);
    allPetitions.forEach((petition) => {
      const date = new Date(petition.createdAt || Date.now());
      petitionMonthCounts[date.getMonth()]++;
    });
    
    const petitionBarData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{ 
        label: 'Petitions Created', 
        data: petitionMonthCounts, 
        backgroundColor: '#52c41a',
        borderColor: '#52c41a',
        borderWidth: 1
      }],
    };

    // Selected Poll Data
    const selectedPoll = pollsData.find(poll => poll._id === selectedPollId || poll.id === selectedPollId);
    let pollResultData = null;

    if (selectedPoll && selectedPoll.options && (selectedPoll.voteBreakdown || selectedPoll.votes)) {
      const voteData = selectedPoll.voteBreakdown || selectedPoll.votes || {};
      const totalVotes = selectedPoll.totalVotes || Object.values(voteData).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
      
      if (totalVotes > 0 && selectedPoll.options.length > 0) {
        const optionData = selectedPoll.options.map((option, index) => {
          let optionVotes = 0;
          
          // Try different ways to get vote count for this option
          if (voteData[option] !== undefined) {
            optionVotes = voteData[option];
          } else if (voteData[index] !== undefined) {
            optionVotes = voteData[index];
          } else if (voteData[option.text] !== undefined) {
            optionVotes = voteData[option.text];
          }
          
          const percentage = totalVotes > 0 ? ((optionVotes / totalVotes) * 100).toFixed(1) : 0;
          
          return {
            option: typeof option === 'string' ? option : option.text || option,
            votes: typeof optionVotes === 'number' ? optionVotes : 0,
            percentage: parseFloat(percentage)
          };
        });

        pollResultData = {
          labels: optionData.map(item => `${item.option} (${item.percentage}%)`),
          datasets: [{
            data: optionData.map(item => item.votes),
            backgroundColor: [
              '#52c41a', '#ff4d4f', '#faad14', '#1890ff', '#722ed1', '#13c2c2', '#eb2f96', '#f759ab', '#40a9ff', '#73d13d',
            ],
            borderColor: '#fff',
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 10,
          }]
        };
      }
    }

    // Selected Petition Data
    const selectedPetition = allPetitions.find(petition => petition._id === selectedPetitionId || petition.id === selectedPetitionId);
    let petitionResultData = null;

    // Check if "Overall Review" is selected (use a special ID like 'overall')
    if (selectedPetitionId === 'overall') {
      // Show overall petition status breakdown
      petitionResultData = {
        labels: [
          `Active (${((petitionStats.active / petitionStats.total) * 100).toFixed(1)}%)`,
          `Closed (${((petitionStats.closed / petitionStats.total) * 100).toFixed(1)}%)`,
          `Under Review (${((petitionStats.underReview / petitionStats.total) * 100).toFixed(1)}%)`
        ],
        datasets: [{
          data: [petitionStats.active, petitionStats.closed, petitionStats.underReview],
          backgroundColor: ['#52c41a', '#ff4d4f', '#faad14'],
          borderColor: '#fff',
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 10,
        }]
      };
    } else if (selectedPetition) {
      // Show individual petition progress
      const signaturesCount = selectedPetition.signaturesCount || 0;
      const signatureGoal = selectedPetition.signatureGoal || 100;
      const remaining = Math.max(0, signatureGoal - signaturesCount);
      
      petitionResultData = {
        labels: [
          `Signed (${((signaturesCount / signatureGoal) * 100).toFixed(1)}%)`,
          `Remaining (${((remaining / signatureGoal) * 100).toFixed(1)}%)`
        ],
        datasets: [{
          data: [signaturesCount, remaining],
          backgroundColor: ['#52c41a', '#d9d9d9'],
          borderColor: '#fff',
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 10,
        }]
      };
    }

    return { 
      pollStats, 
      petitionStats, 
      topPolls, 
      topPetitions,
      pollBarData, 
      petitionBarData,
      pollResultData, 
      petitionResultData,
      selectedPoll,
      selectedPetition 
    };
  }, [pollsData, allPetitions, selectedPollId, selectedPetitionId]);

  const pieData = (src) => ({
    labels: ['Active', 'Closed', 'Under Review'],
    datasets: [
      { 
        data: [src.active, src.closed, src.underReview], 
        backgroundColor: ['#52c41a', '#ff4d4f', '#faad14'],
        borderColor: '#fff',
        borderWidth: 2
      },
    ],
  });

  const handleExport = () => {
    const csv = [
      ['Type', 'Total', 'Active', 'Closed', 'Under Review'],
      ['Polls', pollStats.total, pollStats.active, pollStats.closed, pollStats.underReview],
      ['Petitions', petitionStats.total, petitionStats.active, petitionStats.closed, petitionStats.underReview],
      [],
      ['Top Signed Petitions'],
      ['Title', 'Signatures', 'Engagement Rate', 'Completion Rate'],
      ...topPetitions.map(p => [p.title, p.signatures, `${p.engagementRate}/hr`, `${p.completionRate}%`]),
    ];

    if (selectedPoll && pollResultData) {
      csv.push([]);
      csv.push([`Poll Results: ${selectedPoll.question || selectedPoll.title}`]);
      csv.push(['Option', 'Votes', 'Percentage']);
      
      if (selectedPoll.options) {
        selectedPoll.options.forEach((option, index) => {
          const voteData = selectedPoll.voteBreakdown || selectedPoll.votes || {};
          const votes = voteData[option] || voteData[index] || voteData[option.text] || 0;
          const totalVotes = selectedPoll.totalVotes || 0;
          const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
          csv.push([typeof option === 'string' ? option : option.text || option, votes, `${percentage}%`]);
        });
      }
    }

    if (selectedPetition) {
      csv.push([]);
      csv.push([`Petition: ${selectedPetition.title}`]);
      csv.push(['Signatures', selectedPetition.signaturesCount]);
      csv.push(['Goal', selectedPetition.signatureGoal]);
      csv.push(['Completion Rate', `${selectedPetition.completionRate}%`]);
      csv.push(['Engagement Rate', `${selectedPetition.engagementRate} signatures/hour`]);
    }

    csv.push([]);
    csv.push(['Last Updated', lastUpdated ? lastUpdated.toLocaleString() : 'N/A']);

    const csvContent = csv.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `CivixReports_${new Date().toISOString().split('T')[0]}.csv`,
    });
    a.click();
  };

  const handlePrint = () => window.print();

  const handleRefresh = () => {
    fetchRealTimePolls(true);
    fetchRealTimePetitions(true);
    message.success('Data refreshed');
  };

  const chartOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  if (loading) {
    return <div className="reports-wrapper"><Spin size="large" style={{ marginTop: 100 }} /></div>;
  }

  return (
    <div className="reports-wrapper">
      {/* HEADER */}
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }} wrap>
        <Col>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center sm:text-left mt-[70px] sm:mt-0">
            Reports & Analytics
          </h1>
          {lastUpdated && (
            <p style={{ color: '#666', fontSize: 14, margin: 0 }}>
              Last updated: {lastUpdated.toLocaleTimeString()} 
              <span style={{ 
                marginLeft: 8, 
                padding: '2px 6px', 
                backgroundColor: autoRefresh ? '#f6ffed' : '#fff2e8',
                color: autoRefresh ? '#52c41a' : '#fa8c16',
                borderRadius: 4,
                fontSize: 12
              }}>
                {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
              </span>
            </p>
          )}
        </Col>
        <Col className="mt-4 sm:mt-0">
          <Button 
            icon={<ReloadOutlined spin={pollsLoading || petitionsLoading} />} 
            onClick={handleRefresh}
            disabled={pollsLoading || petitionsLoading}
            style={{ marginRight: 8 }}
          >
            Refresh
          </Button>
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport} style={{ marginRight: 8 }}>
            Export Data
          </Button>
          <Button type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>Print</Button>
        </Col>
      </Row>

      {/* KPI CARDS */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}><KPI title="Total Polls" value={pollStats.total} /></Col>
        <Col xs={24} sm={8}><KPI title="Total Petitions" value={petitionStats.total} /></Col>
        <Col xs={24} sm={8}><KPI title="Active Engagement" value={pollStats.active + petitionStats.active} /></Col>
      </Row>

      {/* POLL & PETITION STATUS CHARTS */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card 
            className="chart-card" 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PieChartOutlined />
                  Poll Result Distribution
                  {pollsLoading && <Spin size="small" />}
                </span>
                <Select
                  style={{ width: 200 }}
                  placeholder="Select a poll"
                  value={selectedPollId}
                  onChange={setSelectedPollId}
                  showSearch
                  optionFilterProp="children"
                  loading={pollsLoading}
                >
                  {pollsData
                    .filter(poll => poll.totalVotes > 0)
                    .map(poll => (
                      <Option key={poll._id || poll.id} value={poll._id || poll.id}>
                        {poll.question || poll.title || 'Untitled Poll'} ({poll.totalVotes || 0} votes)
                      </Option>
                    ))}
                </Select>
              </div>
            }
          >
            <div style={{ height: 320 }}>
              {pollResultData ? (
                <Pie data={pollResultData} options={chartOptions} />
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  <PieChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>No poll data available</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            className="chart-card" 
            title={
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <PieChartOutlined />
                  Petition Progress
                  {petitionsLoading && <Spin size="small" />}
                </span>
                <Select
                  style={{ width: 200 }}
                  placeholder="Select a petition"
                  value={selectedPetitionId}
                  onChange={setSelectedPetitionId}
                  showSearch
                  optionFilterProp="children"
                  loading={petitionsLoading}
                >
                  <Option key="overall" value="overall">
                    Overall Petition Review
                  </Option>
                  {allPetitions
                    .filter(petition => petition.signaturesCount > 0)
                    .map(petition => (
                      <Option key={petition._id || petition.id} value={petition._id || petition.id}>
                        {petition.title} ({petition.signaturesCount || 0} signatures)
                      </Option>
                    ))}
                </Select>
              </div>
            }
          >
            <div style={{ height: 320 }}>
              {petitionResultData ? (
                <Pie data={petitionResultData} options={chartOptions} />
              ) : (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                  <PieChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>No petition data available</p>
                </div>
              )}
            </div>
          </Card>
        </Col>
      </Row>

      {/* MONTHLY CREATION CHARTS */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Monthly Poll Creation">
            <div style={{ height: 240 }}>
              <Bar data={pollBarData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Monthly Petition Creation">
            <div style={{ height: 240 }}>
              <Bar data={petitionBarData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* TOP ITEMS TABLES */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Top Voted Polls">
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              loading={pollsLoading}
              scroll={{ x: 'max-content', y: 300 }}
              columns={[
                { 
                  title: 'Poll', 
                  dataIndex: 'title',
                  width: 200,
                  ellipsis: true,
                  render: (text, record) => (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setSelectedPollId(record.id)}
                      style={{ padding: 0, height: 'auto', textAlign: 'left', width: '100%' }}
                    >
                      {text}
                    </Button>
                  )
                },
                { 
                  title: 'Votes', 
                  dataIndex: 'votes',
                  width: 80,
                  align: 'center',
                  sorter: (a, b) => b.votes - a.votes,
                  render: (votes) => (
                    <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                      {votes.toLocaleString()}
                    </span>
                  )
                },
                { 
                  title: 'Rate', 
                  dataIndex: 'engagementRate',
                  width: 70,
                  align: 'center',
                  render: (rate) => `${rate}/hr`
                },
              ]}
              dataSource={topPolls}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Top Signed Petitions">
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              loading={petitionsLoading}
              scroll={{ x: 'max-content', y: 300 }}
              columns={[
                { 
                  title: 'Petition', 
                  dataIndex: 'title',
                  width: 200,
                  ellipsis: true,
                  render: (text, record) => (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setSelectedPetitionId(record.id)}
                      style={{ padding: 0, height: 'auto', textAlign: 'left', width: '100%' }}
                    >
                      {text}
                    </Button>
                  )
                },
                { 
                  title: 'Signatures', 
                  dataIndex: 'signatures',
                  width: 100,
                  align: 'center',
                  sorter: (a, b) => b.signatures - a.signatures,
                  render: (sigs) => (
                    <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
                      {sigs.toLocaleString()}
                    </span>
                  )
                },
                { 
                  title: 'Progress', 
                  dataIndex: 'completionRate',
                  width: 80,
                  align: 'center',
                  render: (rate) => (
                    <span style={{ 
                      color: rate >= 100 ? '#52c41a' : rate >= 50 ? '#faad14' : '#ff4d4f',
                      fontWeight: 'bold'
                    }}>
                      {rate}%
                    </span>
                  )
                },
              ]}
              dataSource={topPetitions}
            />
          </Card>
        </Col>
      </Row>

      {/* SELECTED ITEM DETAILS */}
      {(selectedPoll || (selectedPetition && selectedPetitionId !== 'overall')) && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          {selectedPoll && pollResultData && (
            <Col xs={24} lg={12}>
              <Card className="chart-card" title="Selected Poll Details">
                <div style={{ padding: '16px 0' }}>
                  <h4 style={{ marginBottom: 16, color: '#1890ff' }}>
                    {selectedPoll.question || selectedPoll.title}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <p><strong>Status:</strong> <span style={{ color: selectedPoll.status === 'active' ? '#52c41a' : '#666', textTransform: 'capitalize' }}>{selectedPoll.status}</span></p>
                    <p><strong>Total Votes:</strong> {selectedPoll.totalVotes}</p>
                    <p><strong>Engagement:</strong> {selectedPoll.engagementRate} votes/hr</p>
                    <p><strong>Created:</strong> {new Date(selectedPoll.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </Col>
          )}
          
          {selectedPetition && selectedPetitionId !== 'overall' && petitionResultData && (
            <Col xs={24} lg={12}>
              <Card className="chart-card" title="Selected Petition Details">
                <div style={{ padding: '16px 0' }}>
                  <h4 style={{ marginBottom: 16, color: '#52c41a' }}>
                    {selectedPetition.title}
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 16 }}>
                    <p><strong>Status:</strong> <span style={{ color: selectedPetition.status === 'active' ? '#52c41a' : '#666', textTransform: 'capitalize' }}>{selectedPetition.status}</span></p>
                    <p><strong>Signatures:</strong> {selectedPetition.signaturesCount} / {selectedPetition.signatureGoal}</p>
                    <p><strong>Progress:</strong> <span style={{ color: selectedPetition.completionRate >= 100 ? '#52c41a' : '#faad14' }}>{selectedPetition.completionRate}%</span></p>
                    <p><strong>Engagement:</strong> {selectedPetition.engagementRate} signs/hr</p>
                    <p><strong>Location:</strong> {selectedPetition.location || 'N/A'}</p>
                    <p><strong>Created:</strong> {new Date(selectedPetition.createdAt || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* OVERALL PETITION REVIEW DETAILS */}
      {selectedPetitionId === 'overall' && (
        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card className="chart-card" title="Overall Petition Statistics">
              <div style={{ padding: '16px 0' }}>
                <h4 style={{ marginBottom: 16, color: '#52c41a' }}>
                  📊 Petition Status Overview
                </h4>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#f6ffed', borderRadius: 8 }}>
                      <div style={{ fontSize: 32, fontWeight: 'bold', color: '#52c41a' }}>{petitionStats.active}</div>
                      <div style={{ color: '#666', marginTop: 8 }}>Active Petitions</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {((petitionStats.active / petitionStats.total) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fff2e8', borderRadius: 8 }}>
                      <div style={{ fontSize: 32, fontWeight: 'bold', color: '#faad14' }}>{petitionStats.underReview}</div>
                      <div style={{ color: '#666', marginTop: 8 }}>Under Review</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {((petitionStats.underReview / petitionStats.total) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={8}>
                    <div style={{ textAlign: 'center', padding: '16px', backgroundColor: '#fff1f0', borderRadius: 8 }}>
                      <div style={{ fontSize: 32, fontWeight: 'bold', color: '#ff4d4f' }}>{petitionStats.closed}</div>
                      <div style={{ color: '#666', marginTop: 8 }}>Closed Petitions</div>
                      <div style={{ fontSize: 12, color: '#999', marginTop: 4 }}>
                        {((petitionStats.closed / petitionStats.total) * 100).toFixed(1)}% of total
                      </div>
                    </div>
                  </Col>
                </Row>
                <div style={{ marginTop: 24, padding: '16px', backgroundColor: '#f5f5f5', borderRadius: 8 }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <p style={{ margin: 0 }}><strong>Total Petitions:</strong> {petitionStats.total}</p>
                    </Col>
                    <Col xs={24} sm={12}>
                      <p style={{ margin: 0 }}><strong>Total Signatures:</strong> {allPetitions.reduce((sum, p) => sum + (p.signaturesCount || 0), 0).toLocaleString()}</p>
                    </Col>
                    <Col xs={24} sm={12}>
                      <p style={{ margin: 0 }}><strong>Avg. Engagement Rate:</strong> {(allPetitions.reduce((sum, p) => sum + (p.engagementRate || 0), 0) / allPetitions.length).toFixed(2)} signs/hr</p>
                    </Col>
                    <Col xs={24} sm={12}>
                      <p style={{ margin: 0 }}><strong>Last Updated:</strong> {lastUpdated ? lastUpdated.toLocaleString() : 'N/A'}</p>
                    </Col>
                  </Row>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
