// helper/baseurl.js

import axios from "axios";

// Create an axios instance with your base URL
const api = axios.create({
  baseURL: "https://offer.mvmtracking.com/api",
  // baseURL: "http://localhost:5011/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export function setAuthToken(token) {
  if (token) api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  else delete api.defaults.headers.common["Authorization"];
}

export default api;
