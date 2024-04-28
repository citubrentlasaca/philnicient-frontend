import axios from 'axios';

const api = axios.create({
    baseURL: 'https://philnicient-backend-62b6dbc61488.herokuapp.com/api'
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