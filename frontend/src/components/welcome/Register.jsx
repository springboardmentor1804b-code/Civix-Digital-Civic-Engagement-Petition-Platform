import { useState } from "react";
import govt_image from "../../assets/govt_of_india.jpg";


function Register({ setPage, onSubmit, loading }) {

    const init = {
        name: "",
        email: "",
        password: "",
        location: "",
        role: ""
    }

    const [formData, setFormData] = useState(init)
    const [errors, setErrors] = useState({});

    const handelChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value })
    }

    const handelSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            // UPDATED THIS LINE
            onSubmit(formData, "register"); 
        }
    }

    const validate = () => {
        let newErrors = {};

        if (!formData.name) {
            newErrors.name = "Name is required";
        }

        if (!formData.email) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Enter a valid email address";
        }

        if (!formData.password) {
            newErrors.password = "Password is required";
        } else if (formData.password.length < 6) {
            newErrors.password = "Password must be at least 6 characters long";
        }

        if (!formData.role) {
            newErrors.role = "Please select one";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };



    return (
        <div className="min-h-screen  flex  items-center justify-center bg-sky-200">
            <div className="bg-gradient-to-b from-sky-300 to-gray-500 w-[900px] h-[800px] rounded-lg shadow-xl flex  justify-center ">

                {/* Left Side - Form  */}
                <div className="hidden sm:flex w-[40%] flex-col items-center justify-center">
                    <img
                        src={govt_image}
                        alt="building"
                        className="m-6 rounded-[50%] px-2 h-[200px] w-[200px] object-cover "
                    />
                    <div>
                        <div className="mt-8">
                            <div
                                className="w-full mt-2 px-4 py-2 text-2xl font-bold flex text-center flax justify-center text-[#3c3838]"
                            >Digital Civix <br /> Engagement Platform</div>
                        </div>

                        <div className="mt-8 ">
                            <div
                                className="w-full mt-2 px-4 py-2 text-2sm flex text-center text-[#eeeeee] text-shadow-lg"
                            >Civix enables citizens to engage in local governance through petitions, voting, and tracking officials responses. Join our platform to make your voice heard and drive positive change in your community.</div>
                        </div>
                        <div className="mt-8 ">
                            <div
                                className="w-full mt-2 px-4 py-2 text-2xl font-bold flex text-center text-[#3c3838]"
                            ></div>
                        </div>
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className="w-full sm:w-[60%] min-w-90 max-w-125  flex flex-col justify-center px-10">
                    <h1 className="text-3xl font-semibold text-center text-gray-800">
                        Welcome to Civix
                    </h1>
                    <p className="font-bold text-center text-gray-700 mt-2">
                        Join our platform to make your voice heard in local governance
                    </p>

                    <div className="flex justify-center gap-4 mt-6 p-2 border border-gray-600 rounded-full bg-[#a1c0c8]">
                        <button onClick={() => setPage("login")} className="font-bold flex-grow px-6 py-2 rounded-full border border-gray-700  bg-white hover:bg-gray-400 cursor-pointer">
                            Login
                        </button>
                        <button className="font-bold flex-grow px-6 py-2 rounded-full border border-gray-700  bg-gray-300 hover:bg-gray-400 cursor-pointer ">
                            Register
                        </button>
                    </div>
                    <form onSubmit={handelSubmit}>
                        <div className="mt-2">
                            <label className="text-lg block text-white font-medium text-shadow-lg/20">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                placeholder="Your full name....."
                                value={formData.name}
                                onChange={handelChange}
                                className="w-full mt-2 px-4 py-2 bg-gray-200 text-xl border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                            <div className="min-h-[24px]">
                                {errors.name && (
                                    <p className="text-red-600 text-md text-shadow-white font-medium">{errors.name}</p>
                                )}
                            </div>
                        </div>

                        <div className="">
                            <label className="text-lg block text-white font-medium text-shadow-lg/20">Email</label>
                            <input
                                type="text"
                                name="email"
                                placeholder="Your@email.com"
                                value={formData.email}
                                onChange={handelChange}
                                className="w-full mt-2 px-4 py-2 bg-gray-200 text-xl border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                            <div className="min-h-[24px]">
                                {errors.email && (
                                    <p className="text-red-600 text-md text-shadow-white font-medium">{errors.email}</p>
                                )}
                            </div>
                        </div>

                        <div className="">
                            <label className="text-lg block text-white font-medium text-shadow-lg/20">Password</label>
                            <input
                                type="password"
                                name="password"
                                placeholder="********"
                                value={formData.password}
                                onChange={handelChange}
                                className="w-full mt-2 px-4 py-2  bg-gray-200  text-xl border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                            <div className="min-h-[24px]">
                                {errors.password && (
                                    <p className="text-red-600 text-md text-shadow-white font-medium">{errors.password}</p>
                                )}
                            </div>
                        </div>

                        <div className="">
                            <label className="text-lg block text-white font-medium text-shadow-lg/20">Location</label>
                            <input
                                type="text"
                                name="location"
                                placeholder="Potland or...."
                                value={formData.location}
                                onChange={handelChange}
                                className="w-full mt-2 px-4 py-2 bg-gray-200 text-xl border border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-400"
                            />
                        </div>

                        <div className="mt-1 text-white flex items-center text-shadow-lg/20" >
                            <span className="text-lg font-medium "> I am registering as: </span>
                            <label className="m-2 font-medium"><input
                                type="radio"
                                name="role"
                                value="citizen"
                                checked={formData.role === "citizen"}
                                onChange={handelChange}
                                className="w-4 h-4 accent-sky-500 " /> Citizen</label>

                            <label className="m-2 font-medium"><input
                                type="radio"
                                name="role"
                                value="Public_officer"
                                checked={formData.role === "Public_officer"}
                                onChange={handelChange}
                                className="w-4 h-4 accent-sky-500" /> Public officer</label>
                        </div>
                        <div className="min-h-[24px]">
                            {errors.role && (
                                <p className="text-red-600 text-md text-shadow-white font-medium">{errors.role}</p>
                            )}
                        </div>

                        <button type="submit" className="w-1/2 mt-3 ml-[25%] bg-sky-500 border border-gray-600 hover:bg-sky-600 text-white py-2 rounded-full font-medium">
                            {loading ? "Creating account..." : "Create Account"}
                        </button>
                    </form>

                    <p className="text-center text-blue-100 mt-3 mb-1">
                        Already have an account?{" "}
                        <a onClick={() => setPage("login")} className="text-blue-800 font-bold cursor-pointer">
                            Sign in
                        </a>
                    </p>

                </div>
            </div>
        </div>

    )
}

export default Register;