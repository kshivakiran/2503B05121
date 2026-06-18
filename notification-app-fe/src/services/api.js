import axios from 'axios';

const api = axios.create({
  baseURL: 'http://4.224.186.213',
  timeout: 10000,
});

// Request interceptor for logging & auth
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`, {
    params: config.params,
    headers: config.headers
  });
  return config;
}, (error) => {
  console.error('[API Request Error]', error);
  return Promise.reject(error);
});

api.interceptors.response.use((response) => {
  console.log(`[Logging Middleware] [API Response] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
  return response;
}, (error) => {
  console.error('[Logging Middleware] [API Response Error]', error);
  return Promise.reject(error);
});

export const fetchNotifications = async (page = 1, limit = 20, notificationType = '') => {
  try {
    const params = { page, limit };
    if (notificationType && notificationType !== 'All') {
      params.notification_type = notificationType;
    }
    const response = await api.get('/evaluation-service/notifications', { params });
    // Assuming the API returns an array directly, or an object containing the array.
    // Adjust this based on actual API response structure if needed.
    return Array.isArray(response.data) ? response.data : (response.data.notifications || []);
  } catch (error) {
    console.error("Error fetching notifications", error);
    return [];
  }
};

export default api;
