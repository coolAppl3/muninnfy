import axios from 'axios';

const { VITE_API_DEV_URL, VITE_API_PROD_URL, MODE } = import.meta.env;

const axiosInstance = axios.create({
  baseURL: MODE === 'development' ? VITE_API_DEV_URL : VITE_API_PROD_URL,
  withCredentials: true,
});

export default axiosInstance;
