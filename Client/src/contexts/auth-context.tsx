"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "../types/user"
import { api, directApi } from "../pages/services/api"
import { toast } from "../components/ui/toast-wrapper"

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>
  logout: () => void
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, password: string) => Promise<void>
  verifyAccount: (token: string) => Promise<void>
  updateProfile: (data: { firstName: string; lastName: string; email: string }) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  resendVerification: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const TOKEN_STORAGE_KEY = "token";
const USER_STORAGE_KEY = "user";

const isValidToken = (token: string | null): boolean => {
  if (!token) return false;
  const parts = token.split('.');
  return parts.length === 3;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    
    if (token && isValidToken(token)) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      directApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      checkAuthStatus();
    } else {
      if (token && !isValidToken(token)) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      }
      setIsLoading(false);
    }
  }, []);
  
  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY)
      if (!token) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      directApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const timestamp = new Date().getTime();
      
      const response = await api.get(`/auth/current-user?_t=${timestamp}`);
      
      if (response.data && response.data.user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
        
        setUser(response.data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearAuth = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    api.defaults.headers.common["Authorization"] = "";
    directApi.defaults.headers.common["Authorization"] = "";
    setUser(null);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/auth/login", { email, password });
      
      if (!response.data.token) {
        toast.error("Login failed", {
          description: "No authentication token received"
        });
        return false;
      }
      
      const token = response.data.token;
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      directApi.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      const user = response.data.user;
      
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }
      
      setUser(user);
      
      toast.success("Login successful", {
        description: "Welcome back!"
      });
      
      return true;
    } catch (error: any) {
      clearAuth();
      
      throw error;
    }
  }

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    try {
      await api.post("/auth/register", { firstName, lastName, email, password })

      toast.success("Registration successful", {
        description: "Please check your email to verify your account"
      })
    } catch (error: any) {
      toast.error("Registration failed", {
        description: error.response?.data?.message || "An error occurred during registration"
      })
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    api.defaults.headers.common["Authorization"] = ""
    setUser(null)

    toast.success("Logged out", {
      description: "You have been successfully logged out"
    })
  }

  const forgotPassword = async (email: string) => {
    try {
      await api.post("/auth/forgot-password", { email })

      toast.success("Password reset email sent", {
        description: "If an account exists with that email, you will receive password reset instructions"
      })
    } catch (error: any) {
      
      toast.success("Password reset email sent", {
        description: "If an account exists with that email, you will receive password reset instructions"
      })
    }
  }

  const resetPassword = async (token: string, password: string) => {
    try {
      const response = await api.post("/auth/reset-password", { token, password })
      
      if (response.data.token && response.data.user) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token)
        
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
        directApi.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
        
        setUser(response.data.user)
      }
      
      toast.success("Password reset successful", {
        description: "Your password has been reset. You have been logged in automatically."
      })
    } catch (error: any) {
      toast.error("Password reset failed", {
        description: error.response?.data?.message || "An error occurred"
      })
      throw error
    }
  }

  const verifyAccount = async (token: string) => {
    try {
      const response = await api.post("/auth/verify-account", { token });
      
      if (response.data.token && response.data.user) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
        
        api.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        directApi.defaults.headers.common["Authorization"] = `Bearer ${response.data.token}`;
        
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
        
        setUser(response.data.user);
      }
      
      toast.success("Account verified", {
        description: "Your account has been verified successfully."
      });
    } catch (error: any) {
      toast.error("Verification failed", {
        description: error.response?.data?.message || "The verification token is invalid or has expired"
      });
      throw error;
    }
  }
  
  const updateProfile = async (data: { firstName: string; lastName: string; email: string }) => {
    try {
      const response = await api.put("/auth/profile", data);
      
      if (response.data.user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(response.data.user));
        
        setUser(response.data.user);
        
        toast.success("Profile updated", {
          description: "Your profile information has been updated successfully"
        });
      }
    } catch (error: any) {
      toast.error("Profile update failed", {
        description: error.response?.data?.message || "An error occurred while updating your profile"
      });
      throw error;
    }
  };
  
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      await api.put("/auth/change-password", { currentPassword, newPassword });
      
      toast.success("Password changed", {
        description: "Your password has been changed successfully"
      });
    } catch (error: any) {
      toast.error("Password change failed", {
        description: error.response?.data?.message || "An error occurred while changing your password"
      });
      throw error;
    }
  };
  
  const resendVerification = async (email: string) => {
    try {
      await api.post("/auth/resend-verification", { email });
      
      toast.success("Verification email sent", {
        description: "If an account exists with that email, you will receive a verification email"
      });
    } catch (error: any) {
      toast.success("Verification email sent", {
        description: "If an account exists with that email, you will receive a verification email"
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
        verifyAccount,
        updateProfile,
        changePassword,
        resendVerification
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}