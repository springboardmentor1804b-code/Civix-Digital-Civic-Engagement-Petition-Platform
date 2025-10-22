import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from "../../services/authService";
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import PlaceIcon from '@mui/icons-material/Place';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';

import RegisterImage from '../../assets/images/govImg.jpeg';

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    role: "citizen",
    department: "",
    position: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const hasNumber = (str) => /\d/.test(str);
  const hasWhitespace = (str) => /\s/.test(str);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (hasNumber(formData.name)) {
      setError("Name cannot contain numbers.");
      setLoading(false);
      return;
    }
    if (hasWhitespace(formData.password)) {
      setError("Password cannot contain whitespace.");
      setLoading(false);
      return;
    }
    if (!formData.role) {
      setError("Please select a role.");
      setLoading(false);
      return;
    }

    try {
      const result = await authService.register(formData);
      
      if (result.success) {
        if (formData.role === 'public-official') {
          alert("Public Official account created successfully! Please wait for verification.");
        }
        navigate("/login");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("An error occurred during registration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-200 flex justify-center items-center">
      <div className="flex max-w-4xl h-[85vh] w-full bg-white rounded-lg shadow-lg overflow-hidden mx-auto ">
        
        {/* Left Image */}
        <div className="flex-1 bg-cover bg-center hidden md:block"
             style={{ backgroundImage: `url(${RegisterImage})`, borderTopRightRadius: 60, borderBottomRightRadius: 60 }}>
        </div>

        {/* Right Form */}
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
              label="Name"
              name="name"
              variant="outlined"
              value={formData.name}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <AccountCircleIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Email"
              name="email"
              variant="outlined"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              fullWidth
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
              name="password"
              variant="outlined"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Location"
              name="location"
              variant="outlined"
              type="text"
              value={formData.location}
              onChange={handleChange}
              required
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <PlaceIcon color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* Role Selection */}
            <div className="flex flex-col space-y-2">
              <label className="font-medium text-gray-700">I am registering as:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="role" 
                    value="citizen"
                    checked={formData.role === "citizen"}
                    onChange={() => setFormData({ ...formData, role: "citizen" })}
                    className="accent-blue-600" 
                  /> 
                  Citizen
                </label>
                <label className="flex items-center gap-2">
                  <input 
                    type="radio" 
                    name="role" 
                    value="public-official"
                    checked={formData.role === "public-official"}
                    onChange={() => setFormData({ ...formData, role: "public-official" })}
                    className="accent-blue-600" 
                  /> 
                  Public Official
                </label>
              </div>
            </div>

            {/* Public Official specific fields */}
            {formData.role === 'public-official' && (
              <>
                <TextField
                  label="Department"
                  name="department"
                  variant="outlined"
                  type="text"
                  value={formData.department}
                  onChange={handleChange}
                  required={formData.role === 'public-official'}
                  fullWidth
                  placeholder="e.g., Public Works, Education"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <BusinessIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Position"
                  name="position"
                  variant="outlined"
                  type="text"
                  value={formData.position}
                  onChange={handleChange}
                  required={formData.role === 'public-official'}
                  fullWidth
                  placeholder="e.g., Deputy Commissioner, Director"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <WorkIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </>
            )}
            
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-3 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
  
            <p className="text-center text-gray-500 text-sm mt-2">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600 font-medium hover:underline">Sign In</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}