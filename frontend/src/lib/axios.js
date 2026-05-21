import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000',
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && error.response?.data?.error === 'Token expired' && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.get(`${api.defaults.baseURL}/api/auth/refresh`, {
                    withCredentials: true
                });
                
                if (res.data.success) {
                    localStorage.setItem('token', res.data.token);
                    originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401 && error.response?.data?.error === 'Token expired') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

// Apply the same response interceptor to global axios for backward compatibility
// until all components are migrated to use this new 'api' instance.
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && error.response?.data?.error === 'Token expired' && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const res = await axios.get(`${api.defaults.baseURL}/api/auth/refresh`, {
                    withCredentials: true
                });
                
                if (res.data.success) {
                    localStorage.setItem('token', res.data.token);
                    originalRequest.headers.Authorization = `Bearer ${res.data.token}`;
                    return axios(originalRequest);
                }
            } catch (refreshError) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }

        if (error.response?.status === 401 && error.response?.data?.error === 'Token expired') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;
