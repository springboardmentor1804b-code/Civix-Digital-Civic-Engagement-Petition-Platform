import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://civix-82h0.onrender.com/api",
  withCredentials: true,
});

export default api;
