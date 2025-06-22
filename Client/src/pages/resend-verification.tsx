"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../components/ui/card"
import { toast } from "../components/ui/toast-wrapper"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import verifiedil from "../assets/Verified-il.svg"
import logo from "../assets/logo.svg"

export default function ResendVerificationPage() {
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { resendVerification } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email)
    }
  }, [location.state])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      toast.error("Email required", {
        description: "Please enter your email address"
      })
      return
    }

    try {
      setIsSubmitting(true)
      await resendVerification(email)
      setIsSubmitted(true)
    } catch (error) {
    } finally {
      setIsSubmitting(false)
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
                <CardTitle className="text-3xl font-bold text-center text-[#2e283c] font-heading">
                  Verify Your Account
                </CardTitle>
                <CardDescription className="text-center text-[#4a4358] text-base">
                  {isSubmitted
                    ? "We've sent a new verification link"
                    : "Enter your email to get a new verification link"}
                </CardDescription>
              </CardHeader>

              {isSubmitted ? (
                <CardContent className="flex flex-col items-center space-y-6 py-6 px-0">
                  <div className="w-16 h-16 bg-[#593797]/10 rounded-full flex items-center justify-center mb-2">
                    <svg className="w-8 h-8 text-[#593797]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-center text-[#4a4358]">
                    If an account exists with that email, we've sent a verification link. 
                    Please check your inbox and follow the instructions.
                  </p>
                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-11 bg-[#2e283c] hover:bg-[#3d3651] text-white font-medium text-base"
                  >
                    Return to Login
                  </Button>
                </CardContent>
              ) : (
                <form onSubmit={handleSubmit}>
                  <CardContent className="space-y-4 pt-4 px-0">
                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-[#2e283c] font-medium">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="h-11 bg-white border-[#d4cce2] focus:border-[#593797] focus:ring-[#593797] text-[#2e283c]"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-col space-y-3 px-0">
                    <Button
                      type="submit"
                      className="w-full h-11 bg-[#2e283c] hover:bg-[#3d3651] text-white font-medium text-base mt-3"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        "Send Verification Link"
                      )}
                    </Button>
                    <div className="text-center text-sm">
                      <Link to="/login" className="text-[#593797] hover:text-[#593797]/80 font-medium">
                        Back to login
                      </Link>
                    </div>
                  </CardFooter>
                </form>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2e283c] to-[#593797] p-8 items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-6">
                <motion.img
                  src={verifiedil}
                  alt="Email verification illustration"
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
              <h3 className="text-2xl font-bold mb-2 text-white">Verify Your Email</h3>
              <p className="text-[#d4cce2]">
                A verified email helps secure your account and recover it if needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 