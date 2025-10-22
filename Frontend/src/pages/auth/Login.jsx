import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../../services/authService';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import MailIcon from '@mui/icons-material/Mail';
import LoginImage from "../../assets/images/govImg.jpeg";

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Login submission:', formData.email);
      
      const result = await authService.login(formData.email, formData.password);
      
      console.log('Login successful:', result.message);
      
      // Verify token is stored
      const storedToken = localStorage.getItem('token');
      console.log('Token stored after login:', storedToken ? 'Yes' : 'No');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-200 flex justify-center items-center">
      <div className="flex max-w-4xl w-full h-[85vh] bg-white rounded-lg shadow-lg overflow-hidden mx-auto ">
        
        {/* Form */}
        <div className="flex-1 p-8 flex flex-col justify-center">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-extrabold text-blue-600">Welcome to Civix</h1>
            <p className="text-gray-500 text-sm mt-2">Join our platform to make your voice heard in local governance</p>
          </div>

          <form className="flex flex-col space-y-4 mt-4" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            <TextField
              label="Email"
              variant="outlined"
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              fullWidth
              disabled={loading}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <MailIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Password"
              variant="outlined"
              type="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              fullWidth
              disabled={loading}
            />

            <button 
              type="submit" 
              disabled={loading}
              className={`w-full py-3 font-semibold rounded transition ${
                loading 
                  ? "bg-gray-400 text-gray-200 cursor-not-allowed" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <p className="text-center text-gray-500 text-sm mt-2">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-600 font-medium hover:underline">Register now</Link>
            </p>
          </form>
        </div>

        {/* Image */}
        <div className="flex-1 bg-cover bg-center hidden md:block"
             style={{ backgroundImage: `url(${LoginImage})`, borderTopLeftRadius: 60, borderBottomLeftRadius: 60 }}>
        </div>
      </div>
    </div>
  );
};

export default Login;
