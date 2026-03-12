import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "https://web-production-13ffd8.up.railway.app/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
})

// Attach JWT from localStorage on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("pel_token")
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("pel_token")
    }
    return Promise.reject(err)
  }
)

export { api }
export default api
