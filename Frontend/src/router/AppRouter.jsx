import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/dashboard/Dashboard'; 
import Home from '../pages/Home';
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

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
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
          <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
          <Route path="help" element={<div>Help & Support Page - Coming Soon</div>} />
        </Route>
        
        {/* Redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}