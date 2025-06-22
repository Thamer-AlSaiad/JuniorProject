"use client"

import type React from "react"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { motion } from "framer-motion"
import forgotpasswordil from "../assets/Forgot password-il.svg"
import logo from "../assets/logo.svg"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { forgotPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      return
    }

    try {
      setIsLoading(true)
      await forgotPassword(email)
      setIsSubmitted(true)
    } catch (error) {
      setIsSubmitted(true) 
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
                <CardTitle className="text-3xl font-bold text-center text-[#2e283c] font-heading">Forgot Password</CardTitle>
                <CardDescription className="text-center text-[#4a4358] text-base">
                  Enter your email address and we'll send you a link to reset your password
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 px-0">
                {isSubmitted ? (
                  <div className="space-y-6 text-center">
                    <div className="p-6 bg-[#f8f5ff] rounded-lg border border-[#d4cce2]">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 mx-auto text-[#593797] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-[#2e283c] text-lg font-medium">
                        Reset Link Sent!
                      </p>
                      <p className="text-[#4a4358] mt-2">
                        If an account exists with that email, we've sent password reset instructions to your email address.
                      </p>
                    </div>
                    <Link to="/login">
                      <Button variant="outline" className="w-full h-11 text-[#593797] border-[#d4cce2] hover:bg-[#593797]/5">
                        Back to login
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#2e283c] font-medium">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 border-[#d4cce2] focus:border-[#593797] focus:ring-[#593797]"
                      />
                    </div>
                    <Button 
                      type="submit" 
                      className="w-full h-11 bg-[#2e283c] hover:bg-[#3d3651] text-white font-medium text-base" 
                      disabled={isLoading}
                    >
                      {isLoading ? "Sending..." : "Send reset link"}
                    </Button>
                  </form>
                )}
              </CardContent>
              {!isSubmitted && (
                <CardFooter className="flex justify-center border-t pt-4 border-[#d4cce2] px-0">
                  <div className="text-base text-[#4a4358]">
                    Remember your password?{" "}
                    <Link to="/login" className="text-[#593797] hover:text-[#593797]/80 font-medium">
                      Sign in
                    </Link>
                  </div>
                </CardFooter>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2e283c] to-[#593797] p-8 items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-6">
                <motion.img
                  src={forgotpasswordil}
                  alt="Forgot password illustration"
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
              <h3 className="text-2xl font-bold mb-2 text-white">Password Recovery</h3>
              <p className="text-[#d4cce2]">
                We'll help you reset your password and get back to your account
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}