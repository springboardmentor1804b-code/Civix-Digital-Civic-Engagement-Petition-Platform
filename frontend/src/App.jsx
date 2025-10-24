import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Register from "./components/Register";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardContent from "./components/DashboardContent";
import Petitions from "./components/Petitions";
import CreatePetition from "./components/CreatePetition";
import SinglePetition from "./components/SinglePetition";
import EditPetition from "./components/EditPetition";
import Polls from "./components/Polls";
import CreatePoll from "./components/CreatePoll";
import EditPoll from "./components/EditPoll"; // 1. Import EditPoll
import Reports from "./components/Reports";
import Settings from "./components/Settings";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} theme="light" />
      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* --- PROTECTED ROUTES --- */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Dashboard />}>
              <Route path="/dashboard" element={<DashboardContent />} />
              <Route path="/petitions" element={<Petitions />} />
              <Route path="/petitions/create" element={<CreatePetition />} />
              <Route path="/petitions/:id" element={<SinglePetition />} />
              <Route path="/petitions/:id/edit" element={<EditPetition />} />
              <Route path="/polls" element={<Polls />} />
              <Route path="/polls/create" element={<CreatePoll />} />
              {/* 2. Add the route for editing a single poll */}
              <Route path="/polls/:id/edit" element={<EditPoll />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
