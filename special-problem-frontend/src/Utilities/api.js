import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api'
});

api.interceptors.request.use(config => {
    const token = sessionStorage.getItem('access_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default api;