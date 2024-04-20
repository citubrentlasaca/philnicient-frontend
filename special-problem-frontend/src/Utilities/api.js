import axios from 'axios';

const api = axios.create({
    baseURL: 'https://philnicient-backend-62b6dbc61488.herokuapp.com/api',
    headers: {
        'Authorization': 'Bearer YOUR_ACCESS_TOKEN_HERE',
    },
});

export default api;
