// frontend/src/context/AuthContext.jsx
import { createContext, useReducer, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../services/api';

// Initial state
const initialState = {
  user: null,
  loading: true,
  error: null
};

// Action types
const AUTH_ACTIONS = {
  AUTH_REQUEST: 'AUTH_REQUEST',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_LOADING: 'SET_LOADING'
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.AUTH_REQUEST:
      return { ...state, loading: true, error: null };
    case AUTH_ACTIONS.AUTH_SUCCESS:
      return { ...state, loading: false, user: action.payload, error: null };
    case AUTH_ACTIONS.AUTH_FAILURE:
      return { ...state, loading: false, error: action.payload };
    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null };
    case AUTH_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: parsedUser });
          // Set default auth header
          api.setAuthToken(parsedUser.token);
        } else {
          // If no user, explicitly set loading to false
          dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        localStorage.removeItem('user');
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false });
      }
    };

    initializeAuth();
  }, []);

  // Helper method to set authenticated user directly (for 2FA success)
  const setAuthenticatedUser = useCallback((userData) => {
    dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: userData });
    localStorage.setItem('user', JSON.stringify(userData));
    api.setAuthToken(userData.token);
    toast.success('Login successful!');
    
    // Navigate to appropriate dashboard
    const redirectPath = userData.role === 'admin' 
      ? '/admin/dashboard' 
      : userData.role === 'employer' 
        ? '/employer/dashboard' 
        : '/freelancer/dashboard';
    
    navigate(redirectPath);
  }, [navigate]);

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData) => api.user.register(userData),
    onSuccess: (data) => {
      const userData = data.data;
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: userData });
      localStorage.setItem('user', JSON.stringify(userData));
      api.setAuthToken(userData.token);
      toast.success('Registration successful!');
      navigate(`/${userData.role}/dashboard`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: message });
      toast.error(message);
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password, twoFactorCode }) => api.user.login(email, password, twoFactorCode),
    onSuccess: (data) => {
      const userData = data.data;
      // Check if 2FA is required
      if (userData.requiresTwoFactor) {
        // Don't dispatch success yet, just return the response
        return;
      }
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: userData });
      localStorage.setItem('user', JSON.stringify(userData));
      api.setAuthToken(userData.token);
      toast.success('Login successful!');
      navigate(`/${userData.role}/dashboard`);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: message });
      toast.error(message);
    }
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (userData) => api.user.updateProfile(userData),
    onSuccess: (data) => {
      const updatedUser = data.data;
      // Update user in state and localStorage
      const newUserData = { ...state.user, ...updatedUser };
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: newUserData });
      localStorage.setItem('user', JSON.stringify(newUserData));
      toast.success('Profile updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Profile update failed';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: message });
      toast.error(message);
    }
  });

  // Upload profile picture mutation
  const uploadProfilePictureMutation = useMutation({
    mutationFn: (imageData) => api.user.uploadProfilePicture(imageData),
    onSuccess: (data) => {
      // Update user in state and localStorage
      const newUserData = { 
        ...state.user, 
        profilePicture: data.data.profilePicture 
      };
      dispatch({ type: AUTH_ACTIONS.AUTH_SUCCESS, payload: newUserData });
      localStorage.setItem('user', JSON.stringify(newUserData));
      toast.success('Profile picture updated');
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Image upload failed';
      dispatch({ type: AUTH_ACTIONS.AUTH_FAILURE, payload: message });
      toast.error(message);
    }
  });

  // Logout function - wrapped in useCallback
  const logout = useCallback(() => {
    localStorage.removeItem('user');
    api.removeAuthToken();
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
    // Clear all queries from cache
    queryClient.clear();
    toast.success('Logged out successfully');
    navigate('/');
  }, [navigate, queryClient]);

  // Clear error - wrapped in useCallback
  const clearError = useCallback(() => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR });
  }, []);

  // Memoize the register function
  const register = useCallback((userData) => {
    registerMutation.mutate(userData);
  }, [registerMutation]);

  // Memoize the login function
  const login = useCallback((credentials) => {
    loginMutation.mutate(credentials);
  }, [loginMutation]);

  // Memoize the updateProfile function
  const updateProfile = useCallback((userData) => {
    updateProfileMutation.mutate(userData);
  }, [updateProfileMutation]);

  // Memoize the uploadProfilePicture function
  const uploadProfilePicture = useCallback((imageData) => {
    uploadProfilePictureMutation.mutate(imageData);
  }, [uploadProfilePictureMutation]);

  // Memoize the isAuthLoading value
  const isAuthLoading = 
    registerMutation.isPending || 
    loginMutation.isPending || 
    updateProfileMutation.isPending || 
    uploadProfilePictureMutation.isPending;

  return (
    <AuthContext.Provider
      value={{
        ...state,
        register,
        login,
        logout,
        updateProfile,
        uploadProfilePicture,
        clearError,
        setAuthenticatedUser, // Add the new helper method
        isAuthLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;