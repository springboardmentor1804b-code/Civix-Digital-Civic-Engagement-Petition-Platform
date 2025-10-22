import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Chip, 
  CircularProgress,
  Card,
  CardContent,
  Divider,
  IconButton,
  Tabs,
  Tab
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EditIcon from '@mui/icons-material/Edit';
import ReportIcon from '@mui/icons-material/Report';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import { searchService, highlightSearchTerm } from '../../services/searchService';

const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Polls, 2: Petitions, 3: Reports
  const [sortBy, setSortBy] = useState('relevance'); // relevance, date, title
  
  useEffect(() => {
    const query = searchParams.get('search');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setResults(null);
      return;
    }

    setLoading(true);
    try {
      const searchResults = await searchService.searchAll(query.trim());
      setResults(searchResults);
    } catch (error) {
      console.error('Search error:', error);
      setResults({ polls: [], petitions: [], reports: [], total: 0, error: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ search: searchQuery.trim() });
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const getFilteredResults = () => {
    if (!results) return [];

    let filtered = [];
    switch (activeTab) {
      case 0: // All
        filtered = [
          ...results.polls.map(p => ({ ...p, type: 'poll' })),
          ...results.petitions.map(p => ({ ...p, type: 'petition' })),
          ...results.reports.map(p => ({ ...p, type: 'report' }))
        ];
        break;
      case 1: // Polls
        filtered = results.polls.map(p => ({ ...p, type: 'poll' }));
        break;
      case 2: // Petitions
        filtered = results.petitions.map(p => ({ ...p, type: 'petition' }));
        break;
      case 3: // Reports
        filtered = results.reports.map(p => ({ ...p, type: 'report' }));
        break;
      default:
        filtered = [];
    }

    // Apply sorting
    if (sortBy === 'date') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === 'title') {
      filtered.sort((a, b) => (a.title || a.question || '').localeCompare(b.title || b.question || ''));
    }

    return filtered;
  };

  const handleItemClick = (item) => {
    switch (item.type) {
      case 'poll':
        navigate(`/dashboard/polls?highlight=${item._id}`);
        break;
      case 'petition':
        navigate(`/dashboard/petitions?highlight=${item._id}`);
        break;
      case 'report':
        navigate(`/dashboard/reports?highlight=${item._id}`);
        break;
      default:
        break;
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'poll': return <HowToVoteIcon sx={{ color: '#3B82F6', fontSize: 28 }} />;
      case 'petition': return <EditIcon sx={{ color: '#10B981', fontSize: 28 }} />;
      case 'report': return <ReportIcon sx={{ color: '#F59E0B', fontSize: 28 }} />;
      default: return null;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'poll': return '#3B82F6';
      case 'petition': return '#10B981';
      case 'report': return '#F59E0B';
      default: return '#6B7280';
    }
  };

  const filteredResults = getFilteredResults();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#F9FAFB', pt: 4, pb: 8 }}>
      <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
            Search Results
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Find polls, petitions, and reports across Civix
          </Typography>
        </Box>

        {/* Search Bar */}
        <Box component="form" onSubmit={handleSearchSubmit} sx={{ mb: 4 }}>
          <TextField
            fullWidth
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for polls, petitions, reports..."
            variant="outlined"
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6B7280' }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSearchQuery('');
                      setResults(null);
                      setSearchParams({});
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
              sx: {
                bgcolor: 'white',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#E5E7EB'
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#3B82F6'
                }
              }
            }}
          />
        </Box>

        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Results */}
        {!loading && results && (
          <>
            {/* Stats and Filters */}
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="body1" color="text.secondary">
                  Found <strong>{results.total}</strong> results for "<strong>{searchQuery}</strong>"
                </Typography>
                
                {/* Sort Options */}
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <FilterListIcon sx={{ color: '#6B7280', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                    Sort by:
                  </Typography>
                  {['relevance', 'date', 'title'].map(sort => (
                    <Chip
                      key={sort}
                      label={sort.charAt(0).toUpperCase() + sort.slice(1)}
                      size="small"
                      onClick={() => setSortBy(sort)}
                      sx={{
                        bgcolor: sortBy === sort ? '#3B82F6' : '#F3F4F6',
                        color: sortBy === sort ? 'white' : '#6B7280',
                        fontWeight: sortBy === sort ? 600 : 400,
                        cursor: 'pointer',
                        '&:hover': {
                          bgcolor: sortBy === sort ? '#2563EB' : '#E5E7EB'
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Tabs */}
              <Tabs
                value={activeTab}
                onChange={handleTabChange}
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '0.95rem'
                  }
                }}
              >
                <Tab label={`All (${results.total})`} />
                <Tab label={`Polls (${results.polls.length})`} />
                <Tab label={`Petitions (${results.petitions.length})`} />
                <Tab label={`Reports (${results.reports.length})`} />
              </Tabs>
              <Divider />
            </Box>

            {/* Results List */}
            {filteredResults.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No results found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search terms or filters
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {filteredResults.map((item, index) => (
                  <Card
                    key={`${item.type}-${item._id || index}`}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      '&:hover': {
                        boxShadow: 4,
                        transform: 'translateY(-2px)'
                      }
                    }}
                    onClick={() => handleItemClick(item)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        {/* Icon */}
                        <Box sx={{ pt: 0.5 }}>
                          {getIcon(item.type)}
                        </Box>

                        {/* Content */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          {/* Title */}
                          <Typography
                            variant="h6"
                            sx={{
                              fontWeight: 600,
                              color: '#1F2937',
                              mb: 1,
                              '& mark': {
                                backgroundColor: '#ADFF2F',
                                padding: '2px 4px',
                                borderRadius: '2px',
                                fontWeight: 700
                              }
                            }}
                            dangerouslySetInnerHTML={{
                              __html: highlightSearchTerm(item.title || item.question, searchQuery)
                            }}
                          />

                          {/* Snippet */}
                          {item.snippet && (
                            <Typography
                              variant="body2"
                              color="text.secondary"
                              sx={{
                                mb: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                '& mark': {
                                  backgroundColor: '#ADFF2F',
                                  padding: '1px 2px',
                                  borderRadius: '2px'
                                }
                              }}
                              dangerouslySetInnerHTML={{
                                __html: highlightSearchTerm(
                                  item.snippet.length > 200 
                                    ? item.snippet.substring(0, 200) + '...' 
                                    : item.snippet,
                                  searchQuery
                                )
                              }}
                            />
                          )}

                          {/* Metadata */}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                            <Chip
                              label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                              size="small"
                              sx={{
                                bgcolor: getTypeColor(item.type),
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                            />

                            {item.status && (
                              <Chip
                                label={item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}

                            {item.location && (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <LocationOnIcon sx={{ fontSize: 16, color: '#6B7280' }} />
                                <Typography variant="caption" color="text.secondary">
                                  {item.location}
                                </Typography>
                              </Box>
                            )}

                            {item.category && (
                              <Chip
                                label={item.category}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: '0.7rem' }}
                              />
                            )}

                            {item.createdAt && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </Typography>
                            )}
                          </Box>

                          {/* Highlights */}
                          {item.highlights && item.highlights.length > 0 && (
                            <Box sx={{ mt: 2, pl: 2, borderLeft: '3px solid #E5E7EB' }}>
                              {item.highlights.slice(0, 2).map((highlight, idx) => (
                                <Typography
                                  key={idx}
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    color: '#6B7280',
                                    fontStyle: 'italic',
                                    mb: 0.5,
                                    '& mark': {
                                      backgroundColor: '#ADFF2F',
                                      padding: '1px 2px',
                                      borderRadius: '2px'
                                    }
                                  }}
                                  dangerouslySetInnerHTML={{
                                    __html: `<strong>${highlight.field}:</strong> ${highlightSearchTerm(highlight.text, searchQuery)}`
                                  }}
                                />
                              ))}
                            </Box>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            )}
          </>
        )}

        {/* No Search Query */}
        {!loading && !results && !searchQuery && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <SearchIcon sx={{ fontSize: 64, color: '#D1D5DB', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Search Civix
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Enter a search term to find polls, petitions, and reports
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SearchPage;
