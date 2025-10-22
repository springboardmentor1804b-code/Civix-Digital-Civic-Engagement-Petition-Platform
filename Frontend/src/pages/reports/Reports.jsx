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
  const [selectedPollId, setSelectedPollId] = useState(null);
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

  // Fetch petitions from backend
  useEffect(() => {
    const fetchPetitions = async () => {
      try {
        const data = await getPetitions();
        setAllPetitions(Array.isArray(data) ? data : data.petitions || []);
      } catch (err) {
        message.error("Failed to load petitions");
      } finally {
        setLoading(false);
      }
    };
    fetchPetitions();
  }, []);

  // Initial fetch and auto-refresh setup for polls
  useEffect(() => {
    fetchRealTimePolls();

    // Auto-refresh every 30 seconds if enabled
    let interval;
    if (autoRefresh) {
      interval = setInterval(() => {
        fetchRealTimePolls(false); // Don't show loading for background updates
      }, 30000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  // Use real-time data instead of props
  const pollsData = realTimePolls.length > 0 ? realTimePolls : allPolls;

  // Compute stats from real-time data
  const { pollStats, petitionStats, topPolls, barData, pollResultData, selectedPoll } = useMemo(() => {
    const pollStats = {
      total: pollsData.length,
      active: pollsData.filter((p) => p.status === 'active').length,
      closed: pollsData.filter((p) => p.status === 'closed' || p.status === 'completed').length,
      underReview: pollsData.filter((p) => p.status === 'under_review').length,
    };

    const petitionStats = {
      total: allPetitions.length,
      active: allPetitions.filter((p) => p.status === 'active').length,
      closed: allPetitions.filter((p) => p.status === 'closed' || p.status === 'successful').length,
      underReview: allPetitions.filter((p) => p.status === 'under_review').length,
    };

    const topPolls = [...pollsData]
      .map((p) => ({
        id: p._id || p.id,
        title: p.title || p.question || 'Untitled Poll',
        votes: p.totalVotes || 0,
        engagementRate: p.engagementRate || 0
      }))
      .sort((a, b) => b.votes - a.votes)
      .slice(0, 5);

    const monthCounts = Array(12).fill(0);
    pollsData.forEach((poll) => {
      const date = new Date(poll.createdAt || poll.date || Date.now());
      monthCounts[date.getMonth()]++;
    });
    
    const barData = {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      datasets: [{ 
        label: 'Polls Created', 
        data: monthCounts, 
        backgroundColor: '#1890ff',
        borderColor: '#1890ff',
        borderWidth: 1
      }],
    };

    // Find selected poll and create real-time result distribution data
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
              '#52c41a', // Green
              '#ff4d4f', // Red  
              '#faad14', // Orange
              '#1890ff', // Blue
              '#722ed1', // Purple
              '#13c2c2', // Cyan
              '#eb2f96', // Magenta
              '#f759ab', // Pink
              '#40a9ff', // Light Blue
              '#73d13d', // Light Green
            ],
            borderColor: '#fff',
            borderWidth: 2,
            hoverBorderWidth: 3,
            hoverOffset: 10,
          }]
        };
      }
    }

    return { pollStats, petitionStats, topPolls, barData, pollResultData, selectedPoll };
  }, [pollsData, allPetitions, selectedPollId]);

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
    ];

    // Add selected poll results if available
    if (selectedPoll && pollResultData) {
      csv.push([]);
      csv.push([`Poll Results: ${selectedPoll.question || selectedPoll.title}`]);
      csv.push(['Option', 'Votes', 'Percentage']);
      
      if (selectedPoll.options) {
        selectedPoll.options.forEach((option, index) => {
          const voteData = selectedPoll.voteBreakdown || selectedPoll.votes || {};
          const votes = voteData[option] || voteData[index] || voteData[option.text] || 0;
          const totalVotes = selectedPoll.totalVotes || Object.values(voteData).reduce((sum, count) => sum + (typeof count === 'number' ? count : 0), 0);
          const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
          csv.push([typeof option === 'string' ? option : option.text || option, votes, `${percentage}%`]);
        });
      }
      
      csv.push([]);
      csv.push(['Total Votes', selectedPoll.totalVotes || 0]);
      csv.push(['Engagement Rate', `${selectedPoll.engagementRate || 0} votes/hour`]);
      csv.push(['Last Updated', lastUpdated ? lastUpdated.toLocaleString() : 'N/A']);
    }

    const csvContent = csv.map((r) => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const a = Object.assign(document.createElement('a'), {
      href: URL.createObjectURL(blob),
      download: `CivixReports_${new Date().toISOString().split('T')[0]}.csv`,
    });
    a.click();
  };

  const handlePrint = () => window.print();

  const handleRefreshPolls = () => {
    fetchRealTimePolls(true);
    message.success('Poll data refreshed');
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
          font: {
            size: 12
          },
          generateLabels: function(chart) {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => ({
                text: label,
                fillStyle: data.datasets[0].backgroundColor[i],
                strokeStyle: data.datasets[0].borderColor,
                lineWidth: data.datasets[0].borderWidth,
                pointStyle: 'circle',
                hidden: false,
                index: i
              }));
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} votes (${percentage}%)`;
          },
          afterBody: function(context) {
            if (selectedPoll && selectedPoll.engagementRate) {
              return [`Engagement: ${selectedPoll.engagementRate} votes/hour`];
            }
            return [];
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
        hoverBorderWidth: 4
      }
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 1000
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
          <h1 className="page-heading">Reports & Analytics</h1>
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
        <Col>
          <Button 
            icon={<ReloadOutlined spin={pollsLoading} />} 
            onClick={handleRefreshPolls}
            disabled={pollsLoading}
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
        <Col xs={24} sm={8}><KPI title="Total Polls" value={pollStats.total}  /></Col>
        <Col xs={24} sm={8}><KPI title="Total Petitions" value={petitionStats.total}  /></Col>
        <Col xs={24} sm={8}><KPI title="Active Engagement" value={pollStats.active + petitionStats.active}  /></Col>
      </Row>

      {/* CHARTS */}
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
                    .filter(poll => poll.totalVotes > 0 || (poll.votes && Object.keys(poll.votes).length > 0))
                    .map(poll => (
                      <Option key={poll._id || poll.id} value={poll._id || poll.id}>
                        {poll.question || poll.title || 'Untitled Poll'} ({poll.totalVotes || 0} votes)
                      </Option>
                    ))}
                </Select>
              </div>
            }
            extra={
              <Button 
                size="small" 
                type="text"
                onClick={() => setAutoRefresh(!autoRefresh)}
                style={{ color: autoRefresh ? '#52c41a' : '#999' }}
              >
                {autoRefresh ? 'Live' : 'Static'}
              </Button>
            }
          >
            <div style={{ height: 320 }}>
              {pollResultData ? (
                <>
                  
                  <Pie data={pollResultData} options={chartOptions} />
                </>
              ) : (
                <div style={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  color: '#999'
                }}>
                  <PieChartOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>No poll data available</p>
                  <p style={{ fontSize: 12 }}>Select a poll with votes to view results</p>
                  {pollsLoading && <Spin style={{ marginTop: 16 }} />}
                </div>
              )}
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Petition Status Breakdown">
            <div style={{ height: 320 }}>
              <Pie data={pieData(petitionStats)} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
            </div>
          </Card>
        </Col>
      </Row>
<Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={24}>
          {selectedPoll && pollResultData && (
            <Card className="chart-card" title="Selected Poll Details">
              <div style={{ padding: '16px 0' }}>
                <h4 style={{ marginBottom: 16, color: '#1890ff' }}>
                  {selectedPoll.question || selectedPoll.title}
                </h4>
                <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                  <p><strong>Status:</strong> <span style={{ 
                    color: selectedPoll.status === 'active' ? '#52c41a' : '#666',
                    textTransform: 'capitalize'
                  }}>{selectedPoll.status}</span></p>
                  <p><strong>Location:</strong> {selectedPoll.location || 'Not specified'}</p>
                  <p><strong>Created:</strong> {new Date(selectedPoll.createdAt || Date.now()).toLocaleDateString()}</p>
                  <p><strong>Engagement Rate:</strong> {selectedPoll.engagementRate} votes/hour</p>
                  <p><strong>Total Votes:</strong> {selectedPoll.totalVotes}</p>
                  <p><strong>Last Updated:</strong> {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}</p>
                </div>
                <div>
                  <h5 style={{ marginBottom: 12 }}>Live Vote Breakdown:</h5>
                  {selectedPoll.options && selectedPoll.options.map((option, index) => {
                    const voteData = selectedPoll.voteBreakdown || selectedPoll.votes || {};
                    const votes = voteData[option] || voteData[index] || voteData[option.text] || 0;
                    const totalVotes = selectedPoll.totalVotes || 0;
                    const percentage = totalVotes > 0 ? ((votes / totalVotes) * 100).toFixed(1) : 0;
                    
                    return (
                      <div key={index} style={{ marginBottom: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span>{typeof option === 'string' ? option : option.text || option}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <span style={{ fontWeight: 'bold' }}>{votes}</span>
                            <span style={{ color: '#666', fontSize: '12px' }}>({percentage}%)</span>
                          </div>
                        </div>
                        <div style={{ 
                          width: '100%', 
                          height: 8, 
                          backgroundColor: '#f0f0f0', 
                          borderRadius: 4, 
                          overflow: 'hidden' 
                        }}>
                          <div style={{ 
                            width: `${percentage}%`, 
                            height: '100%', 
                            backgroundColor: ['#52c41a', '#ff4d4f', '#faad14', '#1890ff', '#722ed1'][index % 5],
                            transition: 'width 0.5s ease-in-out'
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Monthly Poll Creation">
            <div style={{ height: 240 }}>
              <Bar data={barData} options={{ maintainAspectRatio: false }} />
            </div>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card className="chart-card" title="Top Voted Polls">
            <Table
              rowKey="id"
              size="small"
              pagination={false}
              loading={pollsLoading}
              scroll={{ 
                x: 'max-content', // Horizontal scroll for small screens
                y: 300 // Vertical scroll with fixed height
              }}
              columns={[
                { 
                  title: 'Poll', 
                  dataIndex: 'title',
                  align: 'center',
                  width: 200, // Fixed width instead of percentage for better scroll behavior
                  ellipsis: true,
                  render: (text, record) => (
                    <Button 
                      type="link" 
                      size="small" 
                      onClick={() => setSelectedPollId(record.id)}
                      style={{ 
                        padding: 0, 
                        height: 'auto', 
                        textAlign: 'left',
                        fontSize: window.innerWidth < 768 ? '12px' : '14px',
                        lineHeight: '1.2',
                        width: '100%' // Full width of column
                      }}
                    >
                      <span style={{ 
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%' // Use full column width
                      }}>
                        {text}
                      </span>
                    </Button>
                  )
                },
                { 
                  title: 'Votes', 
                  dataIndex: 'votes',
                  width: 80, // Fixed width for votes column
                  align: 'center',
                  sorter: (a, b) => b.votes - a.votes,
                  render: (votes) => (
                    <span style={{ 
                      fontWeight: 'bold', 
                      color: '#1890ff',
                      fontSize: window.innerWidth < 768 ? '11px' : '13px'
                    }}>
                      {votes.toLocaleString()}
                    </span>
                  )
                },
                { 
                  title: 'Rate', 
                  dataIndex: 'engagementRate',
                  width: 70, // Fixed width for rate column
                  align: 'center',
                  render: (rate) => (
                    <span style={{ 
                      fontSize: window.innerWidth < 768 ? '10px' : '12px',
                      color: '#666'
                    }}>
                      {rate}/hr
                    </span>
                  )
                },
              ]}
              dataSource={topPolls}
              style={{
                fontSize: window.innerWidth < 768 ? '12px' : '14px'
              }}
              className="responsive-table"
            />
          </Card>
        </Col>
      </Row>

      
    </div>
  );
}
