import axios from 'axios';

const API = axios.create({
    baseURL: 'https://newpush.onrender.com/api',
    // baseURL: 'http://localhost:5000/api', // Use this for local development
});

// 1. Attach Token from Session Storage
API.interceptors.request.use((req) => {
    // CHANGE: localStorage -> sessionStorage
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
});

// 2. Handle Unauthorized Access
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && (error.response.status === 401 || error.response.status === 403)) {
            if (window.location.pathname !== '/') {
                // CHANGE: localStorage -> sessionStorage
                sessionStorage.removeItem('user');
                sessionStorage.removeItem('token');
                window.location.href = '/';
            }
        }
        return Promise.reject(error);
    }
);

export default API;