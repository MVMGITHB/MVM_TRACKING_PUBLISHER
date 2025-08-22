// helper/baseurl.js

import axios from "axios";

// Create an axios instance with your base URL
const api = axios.create({
  baseURL: "https://trakingbackend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export default api;
