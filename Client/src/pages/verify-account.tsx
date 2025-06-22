"use client"

import { useEffect, useRef, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { useAuth } from "../contexts/auth-context"
import { Button } from "../components/ui/button"
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../components/ui/card"
import { CheckCircle, XCircle } from "lucide-react"
import { motion } from "framer-motion"
import amico from "../assets/amico.svg"
import logo from "../assets/logo.svg"

export default function VerifyAccountPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isVerified, setIsVerified] = useState(false)
  const [error, setError] = useState("")
  const { token } = useParams<{ token: string }>()
  const { verifyAccount } = useAuth()
  const navigate = useNavigate()
  const hasRun = useRef(false)

  useEffect(() => {
    const verify = async () => {
      if (hasRun.current) return
      hasRun.current = true

      try {
        if (!token) {
          setError("Invalid verification token")
          setIsLoading(false)
          return
        }

        await verifyAccount(token)
        setIsVerified(true)

        setTimeout(() => {
          navigate("/profile")
        }, 2000)
      } catch (error: any) {
        setError(
          error.response?.data?.message || "An error occurred during verification"
        )
      } finally {
        setIsLoading(false)
      }
    }

    verify()
  }, [token, verifyAccount, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2e283c] to-[#1a1625] relative overflow-hidden">
        <Link to="/" className="absolute top-6 left-6 z-20">
        <img src={logo} alt="logo" className="h-28 w-28" />
        </Link>
        <div className="absolute left-0 top-0 w-[500px] h-[500px] rounded-full bg-[#593797]/10 -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-full bg-[#593797]/10 translate-x-1/2 translate-y-1/2" />
        <div className="w-full max-w-md p-6 text-center relative z-10">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-6 text-white text-lg font-medium">Verifying your account...</p>
        </div>
      </div>
    )
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
                  Account Verification
                </CardTitle>
                <CardDescription className="text-center text-[#4a4358] text-base">
                  {isVerified ? "Your account has been verified" : "Verification status"}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center space-y-6 pt-4 px-0">
                {isVerified ? (
                  <>
                    <div className="w-20 h-20 rounded-full bg-[#593797]/10 flex items-center justify-center">
                      <CheckCircle className="w-12 h-12 text-[#593797]" />
                    </div>
                    <CardDescription className="text-center text-lg text-[#4a4358]">
                      Your account has been successfully verified. You will be redirected to your profile.
                    </CardDescription>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 rounded-full bg-[#593797]/10 flex items-center justify-center">
                      <XCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <CardDescription className="text-center text-lg text-[#4a4358]">
                      {error || "Verification failed. The link may have expired or is invalid."}
                    </CardDescription>
                    {!isVerified && (
                      <div className="text-center mt-4">
                        <p className="text-[#4a4358] mb-2">Verification link expired, please login with you account information to send a new verification link</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
              <CardFooter className="flex justify-center pt-4 px-0">
                {isVerified ? (
                  <Button
                    onClick={() => navigate("/profile")}
                    className="bg-[#2e283c] hover:bg-[#3d3651] text-white px-8 py-2 text-base font-medium"
                  >
                    Go to profile
                  </Button>
                ) : (
                  <Link to="/login">
                    <Button className="bg-[#2e283c] hover:bg-[#3d3651] text-white px-8 py-2 text-base font-medium">
                      Go to Login
                    </Button>
                  </Link>
                )}
              </CardFooter>
            </div>
          </div>
          
          <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#2e283c] to-[#593797] p-8 items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-6">
                <motion.img
                  src={amico}
                  alt="Account verification illustration"
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
              <h3 className="text-2xl font-bold mb-2 text-white">Email Verification</h3>
              <p className="text-[#d4cce2]">
                Thank you for verifying your email address
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
