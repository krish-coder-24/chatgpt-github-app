import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

// Create the context
const AuthContext = createContext();

// Initial state
const initialState = {
  user: null,
  token: localStorage.getItem('vitalai_token'),
  isLoading: true,
  error: null,
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
        error: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isLoading: false,
        error: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios interceptor for token
  useEffect(() => {
    const token = state.token;
    
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('vitalai_token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('vitalai_token');
    }
  }, [state.token]);

  // Add response interceptor for token expiration
  useEffect(() => {
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          logout();
          toast.error('Session expired. Please login again.');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Check if user is logged in on app start
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('vitalai_token');
      
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get('/api/auth/me');
          
          dispatch({
            type: 'LOGIN_SUCCESS',
            payload: {
              user: response.data.data.user,
              token,
            },
          });
        } catch (error) {
          console.error('Auth check failed:', error);
          localStorage.removeItem('vitalai_token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await axios.post('/api/auth/login', {
        email,
        password,
      });

      const { user, token } = response.data.data;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome back, ${user.profile.firstName}!`);
      return { success: true };

    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });

      const response = await axios.post('/api/auth/register', userData);
      const { user, token } = response.data.data;

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user, token },
      });

      toast.success(`Welcome to VitalAI, ${user.profile.firstName}!`);
      return { success: true };

    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'SET_ERROR', payload: message });
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    }

    dispatch({ type: 'LOGOUT' });
    toast.success('Logged out successfully');
  };

  // Update user profile
  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  // Refresh token
  const refreshToken = async () => {
    try {
      const response = await axios.post('/api/auth/refresh');
      const { token } = response.data.data;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: state.user,
          token,
        },
      });

      return { success: true };
    } catch (error) {
      logout();
      return { success: false };
    }
  };

  const value = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};