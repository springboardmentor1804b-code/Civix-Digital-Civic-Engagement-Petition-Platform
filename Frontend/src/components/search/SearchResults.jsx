import React from 'react';
import { Box, Typography, Paper, Chip, Divider, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import EditIcon from '@mui/icons-material/Edit';
import ReportIcon from '@mui/icons-material/Report';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CloseIcon from '@mui/icons-material/Close';
import { highlightSearchTerm } from '../../services/searchService';

const SearchResults = ({ results, searchQuery, onClose, onItemClick }) => {
  const navigate = useNavigate();

  const getIcon = (type) => {
    switch (type) {
      case 'poll': return <HowToVoteIcon sx={{ color: '#3B82F6' }} />;
      case 'petition': return <EditIcon sx={{ color: '#10B981' }} />;
      case 'report': return <ReportIcon sx={{ color: '#F59E0B' }} />;
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

  const handleItemClick = (item) => {
    onItemClick?.(item);
    
    // Navigate with search parameters to highlight and prioritize the clicked item
    const searchParams = new URLSearchParams({
      search: searchQuery,
      highlight: item._id || item.id,
      from: 'search'
    });

    // Navigate to the appropriate page with search context
    switch (item.type) {
      case 'poll':
        navigate(`/dashboard/polls?${searchParams.toString()}`);
        break;
      case 'petition':
        navigate(`/dashboard/petitions?${searchParams.toString()}`);
        break;
      case 'report':
        navigate(`/dashboard/reports?${searchParams.toString()}`);
        break;
      default:
        navigate(item.url);
    }
    
    onClose();
  };

  if (!results || results.total === 0) {
    return (
      <Paper
        elevation={8}
        sx={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          mt: 1,
          maxHeight: 400,
          overflow: 'auto',
          zIndex: 1000,
          border: '1px solid #E5E7EB'
        }}
      >
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            {searchQuery ? `No results found for "${searchQuery}"` : 'Start typing to search...'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Search across polls and petitions
          </Typography>
        </Box>
      </Paper>
    );
  }

  const allResults = [
    ...results.polls,
    ...results.petitions,
    ...results.reports
  ].slice(0, 8); // Limit to 8 results

  return (
    <Paper
      elevation={8}
      sx={{
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        mt: 1,
        maxHeight: 500,
        overflow: 'auto',
        zIndex: 1000,
        border: '1px solid #E5E7EB'
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, bgcolor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1F2937' }}>
            Search Results ({results.total})
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Found {results.polls.length} polls, {results.petitions.length} petitions, {results.reports.length} reports
        </Typography>
      </Box>

      {/* Results */}
      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {allResults.map((item, index) => (
          <Box key={`${item.type}-${item._id || item.id || index}`}>
            <Box
              sx={{
                p: 2,
                cursor: 'pointer',
                '&:hover': { bgcolor: '#F3F4F6' },
                transition: 'background-color 0.2s',
                position: 'relative'
              }}
              onClick={() => handleItemClick(item)}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                {/* Icon */}
                <Box sx={{ mt: 0.5 }}>
                  {getIcon(item.type)}
                </Box>

                {/* Content */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Title with highlighting */}
                  <Typography
                    variant="subtitle2"
                    sx={{ 
                      fontWeight: 600, 
                      color: '#1F2937',
                      mb: 0.5,
                      '& mark': {
                        backgroundColor: '#ADFF2F !important',
                        padding: '1px 2px',
                        borderRadius: '2px'
                      }
                    }}
                    dangerouslySetInnerHTML={{
                      __html: highlightSearchTerm(item.title, searchQuery)
                    }}
                  />

                  {/* Snippet with highlighting */}
                  {item.snippet && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ 
                        mb: 1,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        '& mark': {
                          backgroundColor: '#ADFF2F !important',
                          padding: '1px 2px',
                          borderRadius: '2px'
                        }
                      }}
                      dangerouslySetInnerHTML={{
                        __html: highlightSearchTerm(
                          item.snippet.length > 100 
                            ? item.snippet.substring(0, 100) + '...' 
                            : item.snippet, 
                          searchQuery
                        )
                      }}
                    />
                  )}

                  {/* Metadata */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Chip
                      label={item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                      size="small"
                      sx={{
                        bgcolor: getTypeColor(item.type),
                        color: 'white',
                        fontSize: '0.75rem',
                        height: 20
                      }}
                    />
                    
                    {item.location && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOnIcon sx={{ fontSize: 14, color: '#6B7280' }} />
                        <Typography variant="caption" color="text.secondary">
                          {item.location}
                        </Typography>
                      </Box>
                    )}

                    {item.status && (
                      <Chip
                        label={item.status}
                        size="small"
                        variant="outlined"
                        sx={{ height: 20, fontSize: '0.7rem' }}
                      />
                    )}
                  </Box>

                  {/* Highlights */}
                  {item.highlights && item.highlights.length > 0 && (
                    <Box sx={{ mt: 1 }}>
                      {item.highlights.slice(0, 2).map((highlight, idx) => (
                        <Typography
                          key={idx}
                          variant="caption"
                          sx={{
                            display: 'block',
                            color: '#6B7280',
                            fontStyle: 'italic',
                            '& mark': {
                              backgroundColor: '#ADFF2F !important',
                              padding: '1px 2px',
                              borderRadius: '2px'
                            }
                          }}
                          dangerouslySetInnerHTML={{
                            __html: `${highlight.field}: ${highlightSearchTerm(highlight.text, searchQuery)}`
                          }}
                        />
                      ))}
                    </Box>
                  )}
                </Box>

                {/* Click indicator */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 8, 
                  right: 8,
                  bgcolor: '#F3F4F6',
                  borderRadius: '50%',
                  p: 0.5,
                  opacity: 0.7
                }}>
                  <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '10px' }}>
                    Click to view
                  </Typography>
                </Box>
              </Box>
            </Box>
            {index < allResults.length - 1 && <Divider />}
          </Box>
        ))}

        {/* View All Results */}
        {results.total > 8 && (
          <>
            <Divider />
            <Box sx={{ p: 2, textAlign: 'center', bgcolor: '#F9FAFB' }}>
              <Typography
                variant="body2"
                sx={{ color: '#3B82F6', cursor: 'pointer', fontWeight: 500 }}
                onClick={() => {
                  const searchParams = new URLSearchParams({
                    search: searchQuery,
                    from: 'search'
                  });
                  navigate(`/search?${searchParams.toString()}`);
                  onClose();
                }}
              >
                View all {results.total} results →
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Paper>
  );
};

export default SearchResults;