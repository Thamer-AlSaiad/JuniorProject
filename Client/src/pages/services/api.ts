import axios from "axios"
import { toast } from "../../components/ui/toast-wrapper"

const API_URL = import.meta.env.VITE_API_URL;

export const TOKEN_STORAGE_KEY = "token";
export const USER_STORAGE_KEY = "user";

const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  
  const parts = token.split('.');
  return parts.length === 3;
};

export const directApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  }
});

directApi.interceptors.request.use(config => {
  if (config.url && (
    config.url.includes('/progress') || 
    config.url.includes('/complete') ||
    config.url.includes('/auth/')
  )) {
    config.params = {
      ...config.params,
      _t: new Date().getTime()
    };
  }
  return config;
});

const originalAlert = window.alert;
window.alert = function(message) {
  if (message && typeof message === 'string' && 
     (message.includes("session") || 
      message.includes("expired") || 
      message.includes("Your session has expired") ||
      message.includes("log in again"))) {
    return;
  }
  
  originalAlert(message);
};

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

const publicEndpoints = [
  '/auth/register',
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-account',
  '/auth/resend-verification',
];

const publicGetEndpoints = [
  '/curriculum/paths',
  '/curriculum/courses',
  '/curriculum/sections',
  '/curriculum/lessons',
];

const criticalAuthEndpoints = [
  '/users/profile',
  '/users/settings',
  '/users/subscription',
  '/users/billing',
  '/users/me',
  '/settings/'
];


const isProgressEndpoint = (url: string): boolean => {
  if (url.includes('/complete-lesson') || url.includes('/lesson/complete')) return true;
  
  if (url.includes('/progress')) return true;
  
  if (/\/curriculum\/(paths|sections)\/[^\/]+\/progress/.test(url)) return true;
  
  return false;
};

api.interceptors.request.use(
  (config) => {
    const currentUrl = config.url || '';
    const method = config.method?.toLowerCase() || 'get';
    
    if (currentUrl.includes('/progress') || currentUrl.includes('/complete') || currentUrl.includes('/auth/')) {
      config.params = {
        ...config.params,
        _t: new Date().getTime()
      };
    }
    
    if (isProgressEndpoint(currentUrl)) {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      
      if (token && isValidToken(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        if (token && !isValidToken(token)) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
      return config;
    }
    
    if (method === 'get' && publicGetEndpoints.some(endpoint => currentUrl.includes(endpoint))) {
      if (currentUrl.includes('/progress/') || currentUrl.includes('/complete-lesson')) {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (token && isValidToken(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        } else if (token && !isValidToken(token)) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } else {
        return config;
      }
    } 
    else if (publicEndpoints.some(endpoint => currentUrl.includes(endpoint))) {
      return config;
    }
    else {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);
      if (token && isValidToken(token)) {
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        if (token && !isValidToken(token)) {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (!error.response) {
      return Promise.reject(error);
    }
    
    if (error.response.status === 401) {
      const currentUrl = error.config.url || '';
      
      if (currentUrl.includes('/curriculum/')) {
        return Promise.reject(error);
      }
      
      let shouldRedirect = false;
      
      for (const pattern of criticalAuthEndpoints) {
        if (currentUrl.includes(pattern)) {
          shouldRedirect = true;
          break;
        }
      }
      
      if (shouldRedirect) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        window.location.href = "/login";
      }
    }
    
    return Promise.reject(error);
  }
);

export const handleApiError = (error: any, customMessage?: string) => {
  if (!error.response) {
    toast.error("Network Error", {
      description: "Check your internet connection and try again."
    });
    return;
  }
  
  const message = error.response?.data?.message || customMessage || "An error occurred";
  
  switch (error.response.status) {
    case 400:
      toast.error("Invalid Request", {
        description: message
      });
      break;
    case 401:
      toast.error("Authentication Error", {
        description: "Please log in to continue"
      });
      break;
    case 403:
      toast.error("Access Denied", {
        description: "You don't have permission to access this resource"
      });
      break;
    case 404:
      toast.error("Not Found", {
        description: "The requested resource was not found"
      });
      break;
    case 429:
      toast.error("Too Many Requests", {
        description: "Please try again later"
      });
      break;
    case 500:
    case 502:
    case 503:
    case 504:
      toast.error("Server Error", {
        description: "Please try again later"
      });
      break;
    default:
      toast.error("Error", {
        description: message
      });
  }
};


