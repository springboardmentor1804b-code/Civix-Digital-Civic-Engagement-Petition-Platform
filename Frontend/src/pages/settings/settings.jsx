import React, { useState } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
} from "@mui/material";
import { PhotoCamera } from "@mui/icons-material";

export default function Settings() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
  });
  const [preview, setPreview] = useState("");
  const [openDelete, setOpenDelete] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handlePic = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Saved (frontend-only)!\n" + JSON.stringify(form, null, 2));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto lg:ml-8 lg:mr-4 px-4 sm:px-6 lg:px-8 pt-4 pb-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Settings</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Update your profile and account preferences.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-6">
            {/* Avatar + Label */}
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-24 h-24 sm:w-36 sm:h-36">
                {/* Avatar circle */}
                <div className="w-full h-full rounded-full border-2 border-gray-200 overflow-hidden flex items-center justify-center bg-gray-100">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <PhotoCamera className="text-gray-400 w-8 h-8 sm:w-12 sm:h-12" />
                  )}
                </div>

                {/* Blue edit icon - bottom-right */}
                <label className="absolute bottom-0 right-0 w-8 h-8 sm:w-10 sm:h-10 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition">
                  <PhotoCamera className="text-white w-4 h-4 sm:w-5 sm:h-5" />
                  <input hidden accept="image/*" type="file" onChange={handlePic} />
                </label>
              </div>

              <span className="text-sm text-gray-500">Update profile pic</span>
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:text-base">
                Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:text-base">
                Email
              </label>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:text-base">
                New Password
              </label>
              <input
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Leave blank to keep current"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 sm:text-base">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="City, State"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                required
              />
            </div>

            {/* Save Button */}
            <div className="pt-4 border-t border-gray-200">
              <button
                type="submit"
                className="w-full px-4 py-3 text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors font-semibold text-sm sm:text-base"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg shadow-sm border border-red-300 mt-6">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg font-semibold text-red-700 mb-2 sm:text-xl">
              Danger Zone
            </h2>
            <p className="text-sm text-red-600 mb-4 sm:text-base">
              Deleting your Civix account is permanent. All polls, petitions, and
              contributions will be forever erased. You will lose access to every
              Civix service and your profile will vanish. Are you sure you want
              to continue?
            </p>
            <button
              onClick={() => setOpenDelete(true)}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all"
            >
              Delete My Account
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog - Responsive */}
      <Dialog 
        open={openDelete} 
        onClose={() => setOpenDelete(false)}
        fullWidth
        maxWidth="sm"
        sx={{
          '& .MuiDialog-paper': {
            margin: '16px',
            width: '100%',
            maxWidth: 'calc(100% - 32px)',
          }
        }}
      >
        <DialogTitle sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
          Confirm Deletion
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            Deleting your Civix account is permanent. All polls, petitions, and
            contributions will be forever erased. You will lose access to every
            Civix service and your profile will vanish. Are you sure you want to
            continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ 
          padding: '16px 24px',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 1, sm: 0 }
        }}>
          <Button 
            onClick={() => setOpenDelete(false)}
            fullWidth={window.innerWidth < 640}
            sx={{ 
              minWidth: { xs: '100%', sm: 'auto' },
              marginBottom: { xs: 1, sm: 0 }
            }}
          >
            Cancel
          </Button>
          <Button
            color="error"
            onClick={() => {
              alert("Account deleted (frontend-only)!");
              setOpenDelete(false);
            }}
            fullWidth={window.innerWidth < 640}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Yes, delete
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}