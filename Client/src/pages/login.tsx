"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { toast } from "../components/ui/toast-wrapper"
import { motion } from "framer-motion"
import amico from "../assets/amico.svg"
import logo from "../assets/logo.svg"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("Validation error", {
        description: "Please fill in all fields"
      })
      return
    }

    try {
      setIsLoading(true)
      const success = await login(email, password)
      if (success) {
        navigate("/profile")
      }
    } catch (error: any) {
      toast.error("Login failed", {
        description: error.response?.data?.message || "Invalid email or password"
      })
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
      
      <div className="bg-[#f8f5ff] rounded-3xl shadow-xl w-full max-w-[800px] flex overflow-hidden m-4 relative z-10">
        <div className="w-full md:w-1/2 p-8 flex items-center justify-center">
          <div className="space-y-6 w-full max-w-[350px]">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-center"
            >
              <h1 className="text-2xl font-bold text-[#2e283c]">Log in</h1>
              <p className="text-[#4a4358] mt-2">Welcome back! Please enter your details.</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2e283c]">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#d4cce2] focus:ring-2 focus:ring-[#593797] focus:border-transparent"
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[#2e283c]">Password</Label>
                  <Link to="/forgot-password" className="text-sm text-[#593797] hover:text-[#593797]/80">
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-[#d4cce2] focus:ring-2 focus:ring-[#593797] focus:border-transparent"
                  required
                />
              </div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  className="w-full bg-[#2e283c] hover:bg-[#3d3651] text-white py-2 rounded-lg transition-colors"
                  disabled={isLoading}
                  type="submit"
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </motion.div>
            </form>

            <p className="text-center text-sm text-[#4a4358]">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#593797] hover:text-[#593797]/80 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2e283c] to-[#593797] p-8 items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-6">
              <motion.img
                src={ amico }
                alt="Login illustration"
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
            <h3 className="text-2xl font-bold mb-2 text-white">Welcome Back!</h3>
            <p className="text-[#d4cce2]">
              Sign in to access your account and continue your journey
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}