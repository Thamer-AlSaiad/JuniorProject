// src/pages/home.tsx
"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { ArrowRight, LogIn } from "lucide-react"
import { motion } from "framer-motion"
import homeIllustration from "../assets/home-il.svg"
import Navbar from "../components/Navbar"
import PathCard from "../components/PathCard"
import { Path, pathService } from "./services/pathService"

export default function HomePage() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPaths() {
      try {
        setLoading(true);
        const fetchedPaths = await pathService.getAllPaths();
        
        if (fetchedPaths && fetchedPaths.length > 0) {
          const sortedPaths = [...fetchedPaths].sort((a, b) => {
            if (a.title.toLowerCase().includes('python')) return -1;
            if (b.title.toLowerCase().includes('python')) return 1;
            return 0;
          });
          
          setPaths(sortedPaths);
          setError(null);
        } else {
          setError("No learning paths available at the moment.");
        }
      } catch (err) {
        console.error("Error fetching paths:", err);
        setError("Failed to load learning paths. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchPaths();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <section className="w-full py-12 lg:py-24 bg-gradient-to-b from-[#2e283c] to-[#1a1625] text-white display">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid md:grid-cols-2 gap-6 items-center">
              <motion.div 
                className="flex flex-col space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-4">
                  <motion.h1 
                    className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl/none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    Start Your AI Journey Today!
                  </motion.h1>
                  <motion.p 
                    className="max-w-[700px] text-xl text-[#d4cce2]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    We provide structured curriculum and hands-on projects to build your skills from the ground up in a fun and interactive way.
                  </motion.p>
                </div>
                <motion.div 
                  className="flex flex-col sm:flex-row gap-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <Link to="/register">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button size="lg" className="bg-[#f8f5ff] text-[#2e283c] hover:bg-[#f8f5ff]/90 text-lg px-8">
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </motion.div>
                  </Link>
                  <Link to="/login">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10 text-lg px-8">
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </Button>
                    </motion.div>
                  </Link>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="hidden md:flex justify-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}
              >
                <motion.img
                  src={homeIllustration}
                  alt="Coding illustration"
                  className="w-full max-w-[400px]"
                  animate={{ 
                    y: [0, -15, 0] 
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-16 md:py-24 bg-[#f8f5ff]">
          <div className="container px-4 md:px-6 mx-auto">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12 text-[#2e283c]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Our Learning Paths
            </motion.h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#593797]"></div>
              </div>
            ) : error ? (
              <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-700">{error}</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            ) : paths.length === 0 ? (
              <div className="text-center p-8 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-700">No learning paths available at the moment. Check back soon!</p>
              </div>
            ) : (
              <div className="grid gap-10 lg:grid-cols-2 items-start">
                {paths.map((path, index) => (
                  <PathCard key={path._id} path={path} delay={0.1 * (index + 1)} />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <footer className="py-6 px-6 border-t border-[#ffffff1a] text-center text-[#d4cce2] bg-[#2e283c]">
        <p>© {new Date().getFullYear()} - The Visualization Project. All rights reserved.</p>
      </footer>
    </div>
  )
}