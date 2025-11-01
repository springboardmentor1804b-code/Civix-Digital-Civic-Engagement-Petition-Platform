import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../axios/user";
import { toast, Bounce } from "react-toastify";
<<<<<<< HEAD
=======
import {Spinner} from "../components/Spinner"; 
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    location: "",
  });
  const [errors, setErrors] = useState({});
  const [otpStep, setOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
<<<<<<< HEAD
=======
  const [loading, setLoading] = useState(false); // ✅ Spinner control
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  const navigate = useNavigate();

  const validatePassword = (password) =>
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/.test(password);

  const validateField = (name, value) => {
    let error = "";
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    switch (name) {
      case "name":
        if (!value) error = "Name is required.";
        break;
      case "email":
        if (!value) error = "Email is required.";
        else if (!/\S+@\S+\.\S+/.test(value)) error = "Invalid email.";
        break;
      case "password":
        if (!value) error = "Password is required.";
        else if (!validatePassword(value))
          error =
<<<<<<< HEAD
            "Password must be 8+ chars, include upper, lower, number & special char.";
=======
            "Password must include upper, lower, number & special character.";
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        break;
      case "role":
        if (!value) error = "Role is required.";
        break;
      case "location":
        if (!value) error = "Location is required.";
        break;
      default:
        break;
    }
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
<<<<<<< HEAD

    const errorMsg = validateField(name, value);
    setErrors({ ...errors, [name]: errorMsg });
=======
    setErrors({ ...errors, [name]: validateField(name, value) });
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let tempErrors = {};
    Object.keys(formData).forEach((key) => {
      const errorMsg = validateField(key, formData[key]);
      if (errorMsg) tempErrors[key] = errorMsg;
    });
<<<<<<< HEAD

=======
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
    setErrors(tempErrors);

    if (Object.keys(tempErrors).length === 0) {
      if (formData.role === "official") {
        if (!formData.email.endsWith("@civix.gov.in")) {
<<<<<<< HEAD
          toast.error("Invalid email. Officials must use @civix.gov.in", {
            position: "top-right",
            autoClose: 5000,
=======
          toast.error("Officials must use @civix.gov.in email.", {
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            theme: "dark",
            transition: Bounce,
          });
          return;
        }
<<<<<<< HEAD

        if (!otpStep) {
          setOtpStep(true);
          toast.info("Enter OTP sent to your official email", {
            position: "top-right",
            autoClose: 4000,
=======
        if (!otpStep) {
          setOtpStep(true);
          toast.info("Enter OTP sent to your official email.", {
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            theme: "dark",
            transition: Bounce,
          });
          return;
        }
<<<<<<< HEAD

        if (otp !== "123456") {
          toast.error("Invalid OTP. Please try again.", {
            position: "top-right",
            autoClose: 4000,
=======
        if (otp !== "123456") {
          toast.error("Invalid OTP. Try again.", {
            theme: "dark",
            transition: Bounce,
          });
          return;
        }
      } else {
        if (!otpStep) {
          setOtpStep(true);
          toast.info("Enter OTP sent to your email.", {
            theme: "dark",
            transition: Bounce,
          });
          return;
        }
        if (otp !== "23456") {
          toast.error("Invalid OTP. Try again.", {
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
            theme: "dark",
            transition: Bounce,
          });
          return;
        }
      }

<<<<<<< HEAD
      const result = await signup(formData);

      if (!result.found) {
        toast.error(result.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
          transition: Bounce,
        });
        return;
      } else {
        localStorage.setItem("token", result.token);
        toast.success(result.message, {
          position: "top-right",
          autoClose: 5000,
          theme: "dark",
          transition: Bounce,
        });
        navigate("/home/dashboard");
=======
      try {
        setLoading(true); // ✅ show spinner
        const result = await signup(formData);
        setLoading(false); // ✅ hide spinner

        if (!result.found) {
          toast.error(result.message, { theme: "dark", transition: Bounce });
        } else {
          localStorage.setItem("token", result.token);
          toast.success(result.message, { theme: "dark", transition: Bounce });
          navigate("/home/dashboard");
        }
      } catch (error) {
        setLoading(false);
        toast.error("Something went wrong. Please try again.", {
          theme: "dark",
          transition: Bounce,
        });
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
      }
    }
  };

<<<<<<< HEAD
  return (
    <div className="flex items-center justify-center w-full">
      <div className="flex w-full max-w-5xl bg-white/10 backdrop-blur-md rounded-md shadow-xl overflow-hidden py-2">

        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-[#e6b380] text-gray-800 rounded-l-xl">
          <h1 className="text-3xl font-bold">CIVIX</h1>
          <p className="mb-4">Digital civic engagement platform</p>
          <img
            src="/images/parliament.avif"
            alt="Parliament"
            className="rounded-lg shadow-lg w-sm-xl"
          />
        </div>

 
        <div className="flex-1 flex items-center flex-col justify-center py-4 px-2 bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-gray-800 shadow-lg rounded-r-xl">
          <div className="flex flex-1 flex-col items-center justify-center text-white md:hidden">
            <h1 className="text-3xl font-bold mb-2">CIVIX</h1>
            <p className="mb-4 text-center">Digital civic engagement platform</p>
          </div>

          <div className="w-full max-w-sm text-white">
            <h2 className="text-2xl font-bold mb-6">Signup</h2>
            <form onSubmit={handleSubmit} noValidate>
              {!otpStep && (
                <>
                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      className={`w-full px-4 py-2 rounded-lg text-black bg-white outline-none ${
                        errors.name ? "border border-red-400 bg-red-50" : ""
                      }`}
                      value={formData.name}
                      onChange={handleChange}
                    />
                    {errors.name && (
                      <p className="text-sm text-red-300 mt-1">{errors.name}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      className={`w-full px-4 py-2 rounded-lg text-black bg-white outline-none ${
                        errors.email ? "border border-red-400 bg-red-50" : ""
                      }`}
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-300 mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Password <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="password"
                      name="password"
                      className={`w-full px-4 py-2 rounded-lg text-black bg-white outline-none ${
                        errors.password ? "border border-red-400 bg-red-50" : ""
                      }`}
                      autoComplete="current-password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    {errors.password && (
                      <p className="text-sm text-red-300 mt-1">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="role"
                      className={`w-full px-4 py-2 rounded-lg text-black bg-white outline-none ${
                        errors.role ? "border border-red-400 bg-red-50" : ""
                      }`}
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="">Select Role</option>
                      <option value="citizen">Citizen</option>
                      <option value="official">Official</option>
                    </select>
                    {errors.role && (
                      <p className="text-sm text-red-300 mt-1">{errors.role}</p>
                    )}
                  </div>

                  <div className="mb-4">
                    <label className="block mb-1 font-medium">
                      Location <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="location"
                      className={`w-full px-4 py-2 rounded-lg text-black bg-white outline-none ${
                        errors.location ? "border border-red-400 bg-red-50" : ""
                      }`}
                      value={formData.location}
                      onChange={handleChange}
                    />
                    {errors.location && (
                      <p className="text-sm text-red-300 mt-1">
                        {errors.location}
                      </p>
                    )}
                  </div>
                </>
              )}

              {otpStep && (
                <div className="mb-4">
                  <label className="block mb-1 font-medium">
                    Enter OTP <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="otp"
                    className="w-full px-4 py-2 rounded-lg text-black bg-white outline-none"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-[#22c55e] hover:bg-[#2e9827] transition font-semibold cursor-pointer"
              >
                {otpStep ? "Verify OTP" : "Signup"}
              </button>
            </form>

            {!otpStep && (
              <p className="text-center text-sm mt-4">
                Already have an account?{" "}
                <Link to="/login" className="text-red-300 hover:underline">
                  Login here
                </Link>
              </p>
            )}
          </div>
=======
  // ✅ Show spinner while backend call is in progress
  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F5EDE2]">
      <div className="flex flex-col md:flex-row bg-[#EADDC7] rounded-lg shadow-2xl overflow-hidden w-full max-w-5xl">
        {/* Left Section */}
        <div className="md:w-1/2 relative flex items-center justify-center">
          <img
            src="/images/parliament.avif"
            alt="Signup Visual"
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute top-6 text-center text-white drop-shadow-md">
            <h1 className="text-4xl font-extrabold text-[#F9F3ED]">CIVIX</h1>
            <p className="text-[#EFE2D0] text-sm mt-1">
              Digital civic engagement platform
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 flex flex-col justify-center p-10 text-[#5B3A29]">
          <h2 className="text-3xl font-bold mb-6 text-[#4A2E1F] text-center">
            Signup
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!otpStep ? (
              <>
                {["name", "email", "password", "role", "location"].map(
                  (field) => (
                    <div key={field}>
                      <label className="block text-sm font-medium mb-1 capitalize">
                        {field} <span className="text-[#9C6B3B]">*</span>
                      </label>
                      {field === "role" ? (
                        <select
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg bg-[#FDFBF8] border ${
                            errors[field]
                              ? "border-red-400 bg-red-50"
                              : "border-[#D7C3A9]"
                          } focus:ring-2 focus:ring-[#B68B60] outline-none text-[#4A2E1F]`}
                        >
                          <option value="">Select Role</option>
                          <option value="citizen">Citizen</option>
                          <option value="official">Official</option>
                        </select>
                      ) : (
                        <input
                          type={field === "password" ? "password" : "text"}
                          name={field}
                          value={formData[field]}
                          onChange={handleChange}
                          className={`w-full px-4 py-2 rounded-lg bg-[#FDFBF8] border ${
                            errors[field]
                              ? "border-red-400 bg-red-50"
                              : "border-[#D7C3A9]"
                          } focus:ring-2 focus:ring-[#B68B60] outline-none text-[#4A2E1F]`}
                        />
                      )}
                      {errors[field] && (
                        <p className="text-sm text-red-400 mt-1">
                          {errors[field]}
                        </p>
                      )}
                    </div>
                  )
                )}
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enter OTP <span className="text-[#9C6B3B]">*</span>
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#FDFBF8] border border-[#D7C3A9] focus:ring-2 focus:ring-[#B68B60] outline-none text-[#4A2E1F]"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#B68B60] hover:bg-[#A47650] text-white font-semibold py-2 rounded-lg shadow-md transition-all duration-300"
            >
              {otpStep ? "Verify OTP" : "Signup"}
            </button>
          </form>

          {!otpStep && (
            <p className="text-center text-sm mt-4 text-[#5B3A29]">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-[#9C6B3B] hover:underline font-semibold"
              >
                Login here
              </Link>
            </p>
          )}
>>>>>>> 27173ba (Updated project files and improvements for Civix platform)
        </div>
      </div>
    </div>
  );
};

export default Signup;
