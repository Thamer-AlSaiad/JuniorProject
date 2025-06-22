"use client"

import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster 
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 shadow-lg rounded-lg",
          title: "font-semibold text-sm",
          description: "text-sm text-gray-500 dark:text-gray-400",
          actionButton: "bg-primary text-primary-foreground text-sm px-3 py-1 rounded-md",
          cancelButton: "bg-muted text-muted-foreground text-sm px-3 py-1 rounded-md",
        }
      }}
    />
  )
}

// Re-export toast function from sonner for convenience
export { toast } from "sonner"