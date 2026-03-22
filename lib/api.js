import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor per aggiungere token a tutte le richieste
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Interceptor per gestire refresh token
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/api/auth/refresh`, {
          refreshToken,
        });

        const { token } = response.data;
        localStorage.setItem('token', token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================
// AUTH
// ============================
export const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
};

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};

// ============================
// SHOPPING LIST
// ============================
export const getShoppingList = async () => {
  const response = await api.get('/shopping');
  return response.data;
};

export const createShoppingItem = async (itemData) => {
  const response = await api.post('/shopping', itemData);
  return response.data;
};

export const updateShoppingItem = async (id, itemData) => {
  const response = await api.patch(`/shopping/${id}`, itemData);
  return response.data;
};

export const deleteShoppingItem = async (id) => {
  const response = await api.delete(`/shopping/${id}`);
  return response.data;
};

// ============================
// PANTRY
// ============================
export const getPantry = async () => {
  const response = await api.get('/pantry');
  return response.data;
};

export const getExpiringItems = async () => {
  const response = await api.get('/pantry/expiring');
  return response.data;
};

export const createPantryItem = async (itemData) => {
  const response = await api.post('/pantry', itemData);
  return response.data;
};

export const updatePantryItem = async (id, itemData) => {
  const response = await api.patch(`/pantry/${id}`, itemData);
  return response.data;
};

export const deletePantryItem = async (id) => {
  const response = await api.delete(`/pantry/${id}`);
  return response.data;
};

// ============================
// RECIPES
// ============================
export const getRecipeSuggestions = async () => {
  const response = await api.get('/recipes/suggestions');
  return response.data;
};

export const getRecipes = async () => {
  const response = await api.get('/recipes');
  return response.data;
};

export const createRecipe = async (recipeData) => {
  const response = await api.post('/recipes', recipeData);
  return response.data;
};

// ============================
// DEADLINES
// ============================
export const getDeadlines = async () => {
  const response = await api.get('/deadlines');
  return response.data;
};

export const getUpcomingDeadlines = async () => {
  const response = await api.get('/deadlines/upcoming');
  return response.data;
};

export const createDeadline = async (deadlineData) => {
  const response = await api.post('/deadlines', deadlineData);
  return response.data;
};

export const updateDeadline = async (id, deadlineData) => {
  const response = await api.patch(`/deadlines/${id}`, deadlineData);
  return response.data;
};

export const deleteDeadline = async (id) => {
  const response = await api.delete(`/deadlines/${id}`);
  return response.data;
};

// ============================
// IOT DEVICES
// ============================
export const getIoTDevices = async () => {
  const response = await api.get('/iot/devices');
  return response.data;
};

export const createIoTDevice = async (deviceData) => {
  const response = await api.post('/iot/devices', deviceData);
  return response.data;
};

export const updateIoTDevice = async (id, deviceData) => {
  const response = await api.patch(`/iot/devices/${id}`, deviceData);
  return response.data;
};

export const deleteIoTDevice = async (id) => {
  const response = await api.delete(`/iot/devices/${id}`);
  return response.data;
};

export default api;
