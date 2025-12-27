import axios from 'axios';

const getBaseURL = () => {
    const host = import.meta.env.VITE_API_HOST;
    const port = import.meta.env.VITE_API_PORT;
    if (host) {
        return `https://${host}`; // Render internal or external host
    }
    return import.meta.env.VITE_API_URL || 'http://localhost:3000';
};

const api = axios.create({
    baseURL: getBaseURL(),
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
