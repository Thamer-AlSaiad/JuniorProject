"use client"

import { Link } from "react-router-dom"
import { Button } from "./ui/button"
import { useAuth } from "../contexts/auth-context"
import { BarChart2, LogIn, LogOut, Menu, UserCircle, X } from "lucide-react"
import logo from "../assets/logo.svg"
import { useState } from "react"

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="px-4 sm:px-6 py-0 h-28 flex items-center bg-gradient-to-r from-[#2e283c] to-[#462b78] text-white shadow-md relative">
      <Link to="/" className="flex items-center justify-center">
        <img src={logo} alt="logo" className="h-24 w-24" />
      </Link>
      
      <button 
        className="md:hidden ml-auto text-white p-2"
        onClick={toggleMenu}
        aria-label="Toggle menu"
      >
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
        <Link to="/visualize">
          <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
            <BarChart2 className="mr-2 h-4 w-4" />
            Visualize Algorithms
          </Button>
        </Link>
        
        {isAuthenticated ? (
          <>
            <Link to="/profile">
              <Button variant="outline" className="bg-white/10 hover:bg-white/20 border-white/20 text-white">
                <UserCircle className="mr-2 h-4 w-4" />
                My Profile
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="bg-white/10 hover:bg-white/20 border-white/20 text-white" 
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link to="/login">
              <Button variant="ghost" className="text-white bg-[#f8f5ff] text-[#2e283c] hover:bg-[#f8f5ff]/90">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          </>
        )}
      </nav>

      {isMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#2e283c] shadow-md p-4 flex flex-col gap-3 md:hidden z-50">
          <Link to="/visualize" onClick={() => setIsMenuOpen(false)}>
            <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white">
              <BarChart2 className="mr-2 h-4 w-4" />
              Visualize Algorithms
            </Button>
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                <Button variant="outline" className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white">
                  <UserCircle className="mr-2 h-4 w-4" />
                  My Profile
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                className="w-full bg-white/10 hover:bg-white/20 border-white/20 text-white" 
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)}>
              <Button variant="ghost" className="w-full text-white bg-[#f8f5ff] text-[#2e283c] hover:bg-[#f8f5ff]/90">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      )}
    </header>
  )
}