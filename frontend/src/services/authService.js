import api from './api';

// Authentication service

/**
 * Login user
 * @param {Object} loginData - { email, password }
 * @returns {Object} - { access_token, token_type, user }
 */
export const loginUser = async (loginData) => {
  console.log("loginUser called with:", loginData);
  try {
    const response = await api.post('/auth/login', loginData);

    console.log("loginUser response:", response.data);

    // Strukturë e standardizuar për frontend
    return {
      access_token: response.data.access_token,
      token_type: response.data.token_type,
      user: response.data.user
    };
  } catch (err) {
    console.error("loginUser error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Register a new user
 * @param {Object} userData - user details
 * @returns {Object} - created user
 */
export const registerUser = async (userData) => {
  console.log("registerUser called with:", userData);
  try {
    const response = await api.post('/users/create', userData);
    console.log("registerUser response:", response.data);
    return response.data;
  } catch (err) {
    console.error("registerUser error:", err.response?.data || err.message);
    throw err;
  }
};

/**
 * Get currently logged in user
 * @returns {Object} - current user
 */
export const getCurrentUser = async () => {
  console.log("getCurrentUser called");
  try {
    const response = await api.get('/auth/me');
    console.log("getCurrentUser response:", response.data);
    return response.data;
  } catch (err) {
    console.error("getCurrentUser error:", err.response?.data || err.message);
    throw err;
  }
};
