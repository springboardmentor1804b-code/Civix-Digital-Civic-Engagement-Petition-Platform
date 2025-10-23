import React from "react";
import threelionBackground from "../assets/lion.png";
import civixLogo from "../assets/civix_logo.png";

const AuthLayout = ({ children }) => {
  return (
    <div
      className="flex items-center justify-center min-h-screen w-full p-5"
      style={{
        fontFamily: '"Poppins", sans-serif',
        background: 'url("/parliment1.png") center/cover no-repeat fixed',
      }}
    >
      <div className="bg-white rounded-3xl shadow-[0_25px_50px_rgba(0,0,0,0.25)] overflow-hidden w-full max-w-4xl min-h-[550px] flex relative backdrop-blur-sm">
        {/* Left Panel */}
        <div
          className="flex-1 flex-col items-center justify-center text-center text-white px-10 py-15 relative hidden md:flex"
          style={{
            clipPath: "polygon(0 0, 80% 0, 95% 100%, 0% 100%)",
            backgroundImage: `url(${threelionBackground})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundColor: "rgba(255, 255, 255, 0.2)",
            backgroundBlendMode: "overlay",
          }}
        ></div>

        {/* Right Panel (Form + Logo) */}
        <div className="flex-1 px-6 py-8 flex flex-col justify-center relative bg-white md:px-12">
          <div className="flex items-center justify-center mb-8">
            <img src={civixLogo} alt="Civix Logo" className="w-12 h-12 mr-4" />
            <h1 className="text-4xl font-extrabold text-[#2D3E50] tracking-tight">
              Civix
            </h1>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
