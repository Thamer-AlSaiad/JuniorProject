// src/pages/reset-password.tsx
"use client"

import type React from "react"

import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { toast } from "../components/ui/toast-wrapper"
import { motion } from "framer-motion"
import resetpasswordil from "../assets/Reset password-il.svg"
import logo from "../assets/logo.svg"


export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { token } = useParams<{ token: string }>()
  const { resetPassword } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!password || !confirmPassword) {
      toast.error("Validation error", {
        description: "Please fill in all fields"
      })
      return
    }

    if (password !== confirmPassword) {
      toast.error("Validation error", {
        description: "Passwords do not match"
      })
      return
    }

    if (!token) {
      toast.error("Invalid token", {
        description: "The reset token is missing or invalid"
      })
      return
    }

    try {
      setIsLoading(true)
      await resetPassword(token, password)
      navigate("/dashboard")
    } catch (error) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2e283c] to-[#1a1625] relative overflow-hidden">
  <Link to="/" className="absolute top-6 left-6 z-20">
    <img src={logo} alt="logo" className="h-28 w-28" />
  </Link>
      <div className="absolute left-0 top-0 w-[500px] h-[500px] rounded-full bg-[#593797]/10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-full bg-[#593797]/10 translate-x-1/2 translate-y-1/2" />
      
      <div className="w-full max-w-[800px] p-6 relative z-10">
        <div className="bg-[#f8f5ff] rounded-3xl shadow-xl flex overflow-hidden">
          <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
            <div className="w-full max-w-[350px]">
              <CardHeader className="space-y-2 pb-2 px-0">
                <CardTitle className="text-3xl font-bold text-center text-[#2e283c] font-heading">Reset Password</CardTitle>
                <CardDescription className="text-center text-[#4a4358] text-base">
                  Create a new password for your account
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-[#2e283c] font-medium">New Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 border-[#d4cce2] focus:border-[#593797] focus:ring-[#593797]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="text-[#2e283c] font-medium">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="h-11 border-[#d4cce2] focus:border-[#593797] focus:ring-[#593797]"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-11 bg-[#2e283c] hover:bg-[#3d3651] text-white font-medium text-base" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Resetting..." : "Reset password"}
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex justify-center border-t border-[#d4cce2] pt-4 px-0">
                <div className="text-base text-[#4a4358]">
                  Remember your password?{" "}
                  <Link to="/login" className="text-[#593797] hover:text-[#593797]/80 font-medium">
                    Sign in
                  </Link>
                </div>
              </CardFooter>
            </div>
          </div>
          
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2e283c] to-[#593797] p-8 items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-6">
                <motion.img
                  src={resetpasswordil}
                  alt="Reset password illustration"
                  className="w-full max-w-[300px] mx-auto object-contain"
                  animate={{ 
                    y: [0, -15, 0] 
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Create New Password</h3>
              <p className="text-[#d4cce2]">
                Set a strong password to keep your account secure
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}