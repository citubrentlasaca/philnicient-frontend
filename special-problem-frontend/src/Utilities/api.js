import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:5000/api',
    headers: {
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE',
    },
});

export default api;
