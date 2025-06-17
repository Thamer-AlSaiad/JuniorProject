"use client"
import { useState } from "react"
import { useAuth } from "../contexts/auth-context"
import { Link } from "react-router-dom"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import logo from "../assets/logo.svg"

const colors = {
  primary: '#593797',
  dark: '#2e283c',
  medium: '#4a4358',
  light: '#d4cce2',
  background: '#f8f5ff',
  gold: {
    light: '#593797',
    dark: '#2e283c'
  },
  accent: '#593797'
}

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth()
  const [mode, setMode] = useState<'view' | 'edit' | 'password'>('view')
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  const [error, setError] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (mode === 'edit') {
      await updateProfile({
          firstName: formData.firstName, 
          lastName: formData.lastName, 
          email: user?.email || "" 
        })
      } else {
        if (formData.newPassword !== formData.confirmPassword) {
          setError("Passwords don't match")
          return
        }
        await changePassword(formData.currentPassword, formData.newPassword)
      }
      setMode('view')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #2e283c, #1a1625)' }}
    >
      <Link to="/" className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
        <img src={logo} alt="logo" className="h-28 w-28" />
      </Link>
      
      <div className="absolute left-0 top-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] rounded-full bg-[#593797]/10 -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute right-0 bottom-0 w-[200px] sm:w-[300px] h-[200px] sm:h-[300px] rounded-full bg-[#593797]/10 translate-x-1/2 translate-y-1/2" />
      
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-3xl backdrop-blur-sm relative z-10"
      >
        <Card className="w-full mt-16 sm:mt-24 md:mt-10 relative overflow-visible shadow-xl hover:shadow-2xl transition-all duration-300" 
          style={{ 
            borderColor: colors.light,
            backgroundColor: colors.background,
            boxShadow: `0 0 25px rgba(99,102,241,0.2),
                        0 0 45px rgba(99,102,241,0.1),
                        0 0 65px rgba(99,102,241,0.05),
                        inset 0 0 25px rgba(99,102,241,0.05)`
          }}>
          <CardHeader className="text-center relative">
            <AnimatePresence>
              <motion.div
                key={mode}
                initial={{ 
                  y: mode === 'view' ? 0 : -20,
                  opacity: mode === 'view' ? 1 : 0.9,
                  scale: mode === 'view' ? 1 : 0.98
                }}
                animate={{ 
                  y: 0,
                  opacity: 1,
                  scale: 1
                }}
                transition={{ 
                  type: "spring", 
                  stiffness: 400,
                  damping: 15
                }}
                className="flex flex-col items-center -mt-10 sm:-mt-16 md:-mt-20"
              >
                <motion.div 
                  className="mb-4 sm:mb-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Avatar className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 border-4 border-white shadow-xl">
                    <AvatarFallback className="text-white text-2xl sm:text-3xl md:text-5xl font-light" style={{ 
                      background: `linear-gradient(45deg, ${colors.dark}, ${colors.primary})`
                    }}>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
                
                <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight" style={{ color: colors.dark }}>
                  {user?.firstName} {user?.lastName}
                </CardTitle>
                
                <motion.div 
                  className="mt-2 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm backdrop-blur-md bg-white/30"
                  style={{ 
                    backgroundColor: `${colors.primary}15`,
                    color: colors.primary
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user?.email}
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </CardHeader>

          <CardContent className="px-4 sm:px-6 md:px-10 pb-6 sm:pb-8 relative">
            {mode === 'view' ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 sm:mt-8 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4"
              >
                <motion.div
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        firstName: user?.firstName || "",
                        lastName: user?.lastName || ""
                      })
                      setMode('edit')
                    }}
                    style={{ 
                      backgroundColor: colors.dark,
                      color: 'white'
                    }}
                    className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2.5 rounded-full shadow-md hover:shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                  >
                    <span>📝</span> Edit Profile
                  </Button>
                </motion.div>
                
                <motion.div
                  whileHover={{ y: -3, scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto"
                >
                  <Button 
                    onClick={() => {
                      setFormData({
                        ...formData,
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: ""
                      })
                      setMode('password')
                    }}
                    variant="outline"
                    style={{ 
                      borderColor: colors.primary,
                      color: colors.primary
                    }}
                    className="w-full sm:w-auto px-4 sm:px-8 py-2 sm:py-2.5 rounded-full hover:bg-opacity-10 shadow-sm hover:shadow-md flex items-center justify-center gap-2 text-xs sm:text-sm font-medium"
                  >
                    <span>🔐</span> Change Password
                  </Button>
                </motion.div>
              </motion.div>
            ) : mode === 'edit' ? (
              <AnimatePresence>
                <motion.div
                  key="edit"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="space-y-4 sm:space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <Label className="block mb-1 sm:mb-2 text-base sm:text-lg font-medium" style={{ color: colors.dark }}>
                        First Name
                      </Label>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg rounded-lg transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-[#593797]"
                        style={{ 
                          borderColor: colors.light,
                          backgroundColor: 'white'
                        }}
                      />
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <Label className="block mb-1 sm:mb-2 text-base sm:text-lg font-medium" style={{ color: colors.dark }}>
                        Last Name
                      </Label>
                        <Input
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        className="px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg rounded-lg transition-all duration-200 hover:shadow-md focus:shadow-lg focus:ring-2 focus:ring-[#593797]"
                        style={{ 
                          borderColor: colors.light,
                          backgroundColor: 'white'
                        }}
                      />
                    </motion.div>
                    </div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl space-y-3 sm:space-y-4 border border-gray-100 shadow-sm"
                  >
                    <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4" style={{ color: colors.dark }}>
                      Profile Completion
                    </h3>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="flex-1 h-1.5 sm:h-2 bg-gray-200/50 backdrop-blur-sm rounded-full overflow-hidden shadow-inner">
                        <motion.div
                          className="h-full"
                          style={{ backgroundColor: colors.primary }}
                          initial={{ width: '0%' }}
                          animate={{ width: `${((formData.firstName ? 1 : 0) + (formData.lastName ? 1 : 0)) * 50}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                      <span className="text-xs sm:text-sm font-medium" style={{ color: colors.medium }}>
                        {((formData.firstName ? 1 : 0) + (formData.lastName ? 1 : 0)) * 50}%
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-2 sm:mt-4">
                      <motion.div
                        className={`p-2 sm:p-3 rounded-lg border ${formData.firstName ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                        animate={{ scale: formData.firstName ? 1 : 0.98 }}
                      >
                        <div className="text-xs sm:text-sm font-medium">First Name</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{formData.firstName ? 'Completed' : 'Required'}</div>
                      </motion.div>
                      <motion.div
                        className={`p-2 sm:p-3 rounded-lg border ${formData.lastName ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                        animate={{ scale: formData.lastName ? 1 : 0.98 }}
                      >
                        <div className="text-xs sm:text-sm font-medium">Last Name</div>
                        <div className="text-[10px] sm:text-xs text-gray-500">{formData.lastName ? 'Completed' : 'Required'}</div>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="flex justify-end gap-3 sm:gap-4 pt-3 sm:pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={() => setMode('view')}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-md rounded-lg shadow-sm"
                        style={{ 
                          borderColor: colors.medium,
                          color: colors.dark
                        }}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-md rounded-lg shadow-lg hover:shadow-xl"
                        onClick={handleSave}
                        disabled={isSaving}
                        style={{ 
                          backgroundColor: colors.dark,
                          color: 'white'
                        }}
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="inline-block"
                            >
                              🔄
                            </motion.span>
                            Saving...
                          </span>
                        ) : "Save Changes"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            ) : (
              <AnimatePresence>
                <motion.div
                  key="password"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 50 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="space-y-4 sm:space-y-6"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white/80 backdrop-blur-sm p-3 sm:p-4 rounded-lg border border-gray-100 shadow-sm"
                  >
                    <h3 className="text-xs sm:text-sm font-medium mb-1 sm:mb-2" style={{ color: colors.dark }}>
                      Password Requirements
                    </h3>
                    <div className="flex flex-col xs:flex-row items-start xs:items-center xs:space-x-4 space-y-1 xs:space-y-0 text-[10px] xs:text-xs" style={{ color: colors.medium }}>
                      <div className="flex items-center gap-1">
                        <span className={formData.newPassword.length >= 8 ? 'text-green-500' : 'text-gray-400'}>✓</span>
                        <span>8+ characters</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className={/[0-9]/.test(formData.newPassword) ? 'text-green-500' : 'text-gray-400'}>✓</span>
                        <span>Contains a number</span>
                      </div>
                    </div>
                  </motion.div>

                  <div className="space-y-3 sm:space-y-4">
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="relative group mb-4 sm:mb-6"
                    >
                      <Label className="block mb-1 sm:mb-2 text-sm sm:text-md font-medium flex items-center gap-2" style={{ color: colors.dark }}>
                        <span>🔐</span>
                        Current Password
                      </Label>
                        <Input
                          type="password"
                        value={formData.currentPassword}
                        onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                        className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg pr-8 sm:pr-10 transition-all duration-300 group-hover:shadow-lg focus:ring-2 focus:ring-[#593797]"
                        style={{ 
                          borderColor: colors.light,
                          backgroundColor: 'white'
                        }}
                      />
                    </motion.div>

                    <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="relative group flex-1"
                      >
                        <Label className="block mb-1 sm:mb-2 text-sm sm:text-md font-medium flex items-center gap-2" style={{ color: colors.dark }}>
                          <span>🗝</span>
                          New Password
                        </Label>
                        <Input
                          type="password"
                          value={formData.newPassword}
                          onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                          className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg pr-8 sm:pr-10 transition-all duration-300 group-hover:shadow-lg focus:ring-2 focus:ring-[#593797]"
                          style={{ 
                            borderColor: colors.light,
                            backgroundColor: 'white'
                          }}
                        />
                        {formData.newPassword && (
                          <div className="mt-1 sm:mt-2">
                            <div className="flex gap-1 sm:gap-2 h-1 sm:h-2">
                              <div className={`flex-1 rounded-full ${
                                formData.newPassword.length >= 8 ? 'bg-yellow-500' : 'bg-gray-200'
                              }`}/>
                              <div className={`flex-1 rounded-full ${
                                /[0-9]/.test(formData.newPassword) ? 'bg-orange-500' : 'bg-gray-200'
                              }`}/>
                              <div className={`flex-1 rounded-full ${
                                /[!@#$%^&*]/.test(formData.newPassword) ? 'bg-green-500' : 'bg-gray-200'
                              }`}/>
                            </div>
                            <p className="text-[10px] xs:text-xs mt-0.5 sm:mt-1" style={{ color: colors.medium }}>
                              {formData.newPassword.length < 8 && "Add 8+ characters"}
                              {formData.newPassword.length >= 8 && !(/[0-9]/.test(formData.newPassword)) && "Add numbers"}
                              {formData.newPassword.length >= 8 && /[0-9]/.test(formData.newPassword) && !(/[!@#$%^&*]/.test(formData.newPassword)) && "Add symbols"}
                              {formData.newPassword.length >= 8 && /[0-9]/.test(formData.newPassword) && /[!@#$%^&*]/.test(formData.newPassword) && "Strong password"}
                            </p>
                      </div>
                        )}
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="relative group flex-1"
                      >
                        <Label className="block mb-1 sm:mb-2 text-sm sm:text-md font-medium flex items-center gap-2" style={{ color: colors.dark }}>
                          <span>✔️</span>
                          Confirm Password
                        </Label>
                        <div className="relative">
                        <Input
                          type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="px-3 sm:px-4 py-2 sm:py-3 rounded-lg pr-8 sm:pr-10 transition-all duration-300 group-hover:shadow-lg focus:ring-2 focus:ring-[#593797]"
                            style={{ 
                              borderColor: formData.newPassword && 
                                formData.confirmPassword && 
                                formData.newPassword !== formData.confirmPassword ? 
                                '#ef4444' : colors.light,
                              backgroundColor: 'white'
                            }}
                          />
                          {formData.newPassword && formData.confirmPassword && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2"
                            >
                              {formData.newPassword === formData.confirmPassword ? (
                                <span className="text-green-500">✓</span>
                              ) : (
                                <span className="text-red-500">✗</span>
                              )}
                            </motion.div>
                          )}
                        </div>
                        {formData.newPassword && 
                          formData.confirmPassword && 
                          formData.newPassword !== formData.confirmPassword && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-[10px] xs:text-xs text-red-500 mt-0.5 sm:mt-1"
                            >
                              Passwords don't match
                            </motion.p>
                        )}
                      </motion.div>
                    </div>
                  </div>
                  {error && (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-sm sm:text-md px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
                      style={{ 
                        color: '#ef4444',
                        backgroundColor: '#fee2e2'
                      }}
                    >
                      {error}
                    </motion.p>
                  )}

                  <motion.div 
                    className="flex justify-end gap-3 sm:gap-4 pt-3 sm:pt-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        variant="outline" 
                        onClick={() => setMode('view')}
                        className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-md rounded-lg shadow-sm"
                        style={{ 
                          borderColor: colors.medium,
                          color: colors.dark
                        }}
                      >
                        Cancel
                      </Button>
                    </motion.div>
                    <motion.div 
                      whileHover={{ scale: 1.03 }} 
                      whileTap={{ scale: 0.97 }}
                    >
                      <Button 
                        className="px-4 sm:px-6 py-1.5 sm:py-2 text-sm sm:text-md rounded-lg shadow-lg hover:shadow-xl"
                        onClick={handleSave}
                        disabled={
                          isSaving || 
                          !formData.currentPassword || 
                          !formData.newPassword || 
                          formData.newPassword !== formData.confirmPassword
                        }
                        style={{ 
                          backgroundColor: colors.dark,
                          color: 'white'
                        }}
                      >
                        {isSaving ? (
                          <span className="flex items-center gap-2">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                              className="inline-block"
                            >
                              🔄
                            </motion.span>
                            Updating...
                          </span>
                        ) : "Change Password"}
                      </Button>
                    </motion.div>
                  </motion.div>
                </motion.div>
              </AnimatePresence>
            )}
            </CardContent>
          </Card>
      </motion.div>
    </div>
  )
}