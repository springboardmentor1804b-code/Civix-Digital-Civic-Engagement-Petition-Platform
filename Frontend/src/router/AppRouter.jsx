import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Import pages
import Home from '../pages/Home';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard';
import HelpSupport from '../pages/help&support/helpsupport';
import DashboardCard from '../components/dashboard/DashboardCard';
import PetitionList from '../pages/petitions/PetitionList';
import CreatePetition from '../pages/petitions/CreatePetition';
import PollList from '../pages/polls/PollList';
import CreatePoll from '../pages/polls/CreatePoll';
import OfficialDashboard from '../components/official/OfficialDashboard';
import OfficialAnalytics from '../pages/analytics/OfficialAnalytics';
import Reports from '../pages/reports/Reports';
import ResultsDashboard from '../pages/results/ResultsDashboard';
import SearchPage from '../pages/search/SearchPage';
import Settings from '../pages/settings/settings';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return user ? children : <Navigate to="/login" />;
};

const AppRouter = () => {
  return (
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes */}
        <Route path="/dashboard/*" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/help-support" element={<ProtectedRoute><HelpSupport /></ProtectedRoute>} />
        
        {/* Search route - accessible without dashboard wrapper */}
        <Route path="/search" element={<SearchPage />} />
        
        {/* Dashboard routes */}
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardCard />} />
          
          {/* Petitions routes */}
          <Route path="petitions" element={<PetitionList />} />
          <Route path="petitions/create" element={<CreatePetition />} />
          <Route path="petitions/edit/:id" element={<CreatePetition />} />

          {/* Polls routes */}
          <Route path="polls" element={<PollList />} />
          <Route path="polls/create" element={<CreatePoll />} />
          <Route path="polls/edit/:id" element={<CreatePoll />} />

          {/* Official routes - only accessible to public officials */}
          <Route path="official" element={<OfficialDashboard />} />
          <Route path="analytics" element={<OfficialAnalytics />} />
          <Route path="official/review" element={<PetitionList />} />

          {/* Results route */}
          <Route path="results" element={<ResultsDashboard />} />

          {/* Other routes */}          
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="help" element={<HelpSupport />} />
        </Route>
        
        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
};

export default AppRouter;