"use client"

import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { motion } from "framer-motion"
import logo from "../assets/logo.svg"
import notFoundIl from "../assets/404-il.svg"

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#2e283c] to-[#1a1625] relative overflow-hidden">
    <Link to="/" className="absolute top-6 left-6 z-20">
      <img src={logo} alt="logo" className="h-28 w-28" />
    </Link>
      <div className="absolute left-0 top-0 w-[500px] h-[500px] rounded-full bg-[#593797]/10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-0 bottom-0 w-[300px] h-[300px] rounded-full bg-[#593797]/10 translate-x-1/2 translate-y-1/2" />
      
      <div className="relative z-10 w-full max-w-[800px] p-6 mt-10">
        <div className="bg-[#f8f5ff] rounded-3xl shadow-xl p-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center space-y-8"
          >
            <motion.div
              animate={{ 
                y: [0, -15, 0] 
              }}
              transition={{ 
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="w-full max-w-[400px] mx-auto"
            >
              <img 
                src={notFoundIl} 
                alt="Page not found" 
                className="w-full h-auto"
              />
            </motion.div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-[#2e283c]">404 - Page Not Found</h1>
              <p className="text-[#4a4358] text-lg max-w-[500px] mx-auto">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            
            <div className="pt-4">
              <Link to="/">
                <Button className="bg-[#2e283c] hover:bg-[#3d3651] text-white px-8 py-2 rounded-lg">
                  Back to Home
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
