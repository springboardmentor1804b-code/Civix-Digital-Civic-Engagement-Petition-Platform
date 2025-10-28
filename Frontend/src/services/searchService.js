import { pollService } from './pollService';
import petitionService from './petitionService';
import { reportService } from './reportService';

export const searchService = {
  // Search across all content types
  searchAll: async (query, filters = {}) => {
    if (!query || query.trim().length < 2) {
      return { polls: [], petitions: [], reports: [], total: 0 };
    }

    const searchTerm = query.toLowerCase().trim();
    const results = { polls: [], petitions: [], reports: [], total: 0 };

    try {
      // Search polls
      try {
        const polls = await pollService.getPolls();
        results.polls = polls.filter(poll => {
          const matchesSearch = 
            poll.question?.toLowerCase().includes(searchTerm) ||
            poll.description?.toLowerCase().includes(searchTerm) ||
            poll.location?.toLowerCase().includes(searchTerm) ||
            poll.category?.toLowerCase().includes(searchTerm) ||
            poll.options?.some(option => 
              (typeof option === 'string' ? option : option.text)?.toLowerCase().includes(searchTerm)
            );
          
          // Apply filters
          if (filters.status && poll.status !== filters.status) return false;
          if (filters.location && poll.location !== filters.location) return false;
          if (filters.category && poll.category !== filters.category) return false;
          
          return matchesSearch;
        }).map(poll => ({
          ...poll,
          type: 'poll',
          title: poll.question,
          snippet: poll.description,
          url: `/dashboard/polls`,
          highlights: getHighlights(poll, searchTerm, 'poll')
        }));
      } catch (err) {
        console.error('Poll search error:', err);
      }

      // Search petitions
      try {
        const response = await petitionService.searchPetitions(searchTerm, filters);
        if (response.success) {
          results.petitions = response.results.map(petition => ({
            ...petition,
            type: 'petition',
            title: petition.title,
            snippet: petition.description,
            url: `/dashboard/petitions`,
            highlights: getHighlights(petition, searchTerm, 'petition')
          }));
        }
      } catch (err) {
        console.error('Petition search error:', err);
      }

      // Search reports
      try {
        if (reportService && reportService.getReports) {
          const reports = await reportService.getReports();
          results.reports = reports.filter(report => {
            const matchesSearch =
              report.title?.toLowerCase().includes(searchTerm) ||
              report.description?.toLowerCase().includes(searchTerm) ||
              report.location?.toLowerCase().includes(searchTerm) ||
              report.category?.toLowerCase().includes(searchTerm);
            
            // Apply filters
            if (filters.status && report.status !== filters.status) return false;
            if (filters.location && report.location !== filters.location) return false;
            if (filters.category && report.category !== filters.category) return false;
            
            return matchesSearch;
          }).map(report => ({
            ...report,
            type: 'report',
            title: report.title,
            snippet: report.description,
            url: `/dashboard/reports`,
            highlights: getHighlights(report, searchTerm, 'report')
          }));
        }
      } catch (err) {
        console.error('Report search error:', err);
      }

      results.total = results.polls.length + results.petitions.length + results.reports.length;
      
      // Sort by relevance (number of matches)
      const sortByRelevance = (a, b) => {
        const aScore = calculateRelevanceScore(a, searchTerm);
        const bScore = calculateRelevanceScore(b, searchTerm);
        return bScore - aScore;
      };

      results.polls.sort(sortByRelevance);
      results.petitions.sort(sortByRelevance);
      results.reports.sort(sortByRelevance);

      return results;

    } catch (error) {
      console.error('Search error:', error);
      return { polls: [], petitions: [], reports: [], total: 0, error: error.message };
    }
  },

  // Get search suggestions
  getSuggestions: async (query) => {
    if (!query || query.trim().length < 2) return [];

    try {
      const results = await searchService.searchAll(query);
      const suggestions = [];

      // Get unique titles/questions
      [...results.polls, ...results.petitions, ...results.reports]
        .slice(0, 5)
        .forEach(item => {
          const title = item.title || item.question;
          if (title && !suggestions.includes(title)) {
            suggestions.push(title);
          }
        });

      return suggestions;
    } catch (error) {
      console.error('Suggestions error:', error);
      return [];
    }
  }
};

// Calculate relevance score based on search term matches
const calculateRelevanceScore = (item, searchTerm) => {
  let score = 0;
  const term = searchTerm.toLowerCase();

  // Title/Question matches are worth more
  const title = (item.title || item.question || '').toLowerCase();
  if (title.includes(term)) {
    score += 10;
    // Exact match bonus
    if (title === term) score += 20;
    // Starting with term bonus
    if (title.startsWith(term)) score += 5;
  }

  // Description matches
  const description = (item.description || '').toLowerCase();
  if (description.includes(term)) {
    score += 5;
  }

  // Location matches
  const location = (item.location || '').toLowerCase();
  if (location.includes(term)) {
    score += 3;
  }

  // Category matches
  const category = (item.category || '').toLowerCase();
  if (category.includes(term)) {
    score += 3;
  }

  return score;
};

// Helper function to get highlighted text matches
const getHighlights = (item, searchTerm, type) => {
  const highlights = [];
  
  const fields = type === 'poll' 
    ? [
        { key: 'question', label: 'Question' },
        { key: 'description', label: 'Description' },
        { key: 'location', label: 'Location' },
        { key: 'category', label: 'Category' }
      ]
    : [
        { key: 'title', label: 'Title' },
        { key: 'description', label: 'Description' },
        { key: 'location', label: 'Location' },
        { key: 'category', label: 'Category' }
      ];

  fields.forEach(field => {
    if (item[field.key] && item[field.key].toLowerCase().includes(searchTerm)) {
      const text = item[field.key];
      const index = text.toLowerCase().indexOf(searchTerm);
      const start = Math.max(0, index - 40);
      const end = Math.min(text.length, index + searchTerm.length + 40);
      let snippet = text.substring(start, end);
      
      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';
      
      highlights.push({
        field: field.label,
        text: snippet,
        searchTerm
      });
    }
  });

  return highlights;
};

// Helper function to highlight search term in text
export const highlightSearchTerm = (text, searchTerm) => {
  if (!text || !searchTerm) return text;
  
  const regex = new RegExp(`(${searchTerm})`, 'gi');
  return text.replace(regex, '<mark style="background-color: #ADFF2F; padding: 1px 2px; border-radius: 2px;">$1</mark>');
};