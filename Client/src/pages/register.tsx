"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { toast } from "../components/ui/toast-wrapper"
import { motion } from "framer-motion"
import signup from "../assets/signup-il.svg"
import logo from "../assets/logo.svg"

export default function RegisterPage() {
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!firstName || !lastName || !email || !password) {
      toast.error("Validation error", {
        description: "Please fill in all fields"
      })
      return
    }

    try {
      setIsLoading(true)
      await register(firstName, lastName, email, password)
      navigate("/login")
    } catch (error: any) {
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2e283c] to-[#1a1625] relative overflow-hidden">
      <Link to="/" className="absolute top-6 left-6 z-20 ">
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
              <h1 className="text-2xl font-bold text-[#2e283c]">Sign up</h1>
              <p className="text-[#4a4358] mt-2">Create your account to get started</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[#2e283c]">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#d4cce2] focus:ring-2 focus:ring-[#593797] focus:border-transparent"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[#2e283c]">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-[#d4cce2] focus:ring-2 focus:ring-[#593797] focus:border-transparent"
                    required
                  />
                </div>
              </div>

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
                <Label htmlFor="password" className="text-[#2e283c]">Password</Label>
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
                  {isLoading ? "Creating account..." : "Create account"}
                </Button>
              </motion.div>
            </form>

            <p className="text-center text-sm text-[#4a4358]">
              Already have an account?{' '}
              <Link to="/login" className="text-[#593797] hover:text-[#593797]/80 font-medium">
                Log in
              </Link>
            </p>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2e283c] to-[#593797] p-8 items-center justify-center">
          <div className="text-center text-white">
            <div className="mb-6">
              <motion.img
                src={signup}
                alt="Sign up illustration"
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
            <h3 className="text-2xl font-bold mb-2 text-white">Join Our Community</h3>
            <p className="text-[#d4cce2]">
              Create an account and start your journey with us
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}