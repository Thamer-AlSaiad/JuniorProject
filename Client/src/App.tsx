"use client"

import type React from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"

import { AuthProvider } from "./contexts/auth-context"
import { Toaster } from "sonner"
import "./index.css" 

import HomePage from "./pages/home"
import LoginPage from "./pages/login"
import RegisterPage from "./pages/register"
import VerifyAccountPage from "./pages/verify-account"
import ForgotPasswordPage from "./pages/forgot-password"
import ResetPasswordPage from "./pages/reset-password"
import ProfilePage from "./pages/profile"
import ResendVerificationPage from "./pages/resend-verification"
import NotFoundPage from "./pages/not-found"
import PathPage from "./pages/path"
import LessonPage from "./pages/lesson"
import VisualizePage from "./pages/visualize"

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem("token")
  
  if (!token) {
    return <Navigate to="/login" replace />
  }
  
  return <>{children}</>
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-account/:token" element={<VerifyAccountPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/resend-verification" element={<ResendVerificationPage />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route path="/paths/:slug" element={<PathPage />} />
          <Route path="/paths/:pathSlug/sections/:sectionSlug/lessons/:lessonSlug" element={<LessonPage />} />
          <Route path="/visualize" element={<VisualizePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <Toaster position="top-right" />
      </Router>
    </AuthProvider>
  )
}

export default App