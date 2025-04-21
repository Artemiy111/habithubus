"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Github } from "lucide-react"

interface GitHubButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  isLoading?: boolean
}

export default function GitHubButton({ variant = "outline", isLoading = false }: GitHubButtonProps) {
  const [loading, setLoading] = useState(isLoading)

  const handleGitHubLogin = () => {
    setLoading(true)
    window.location.href = "/api/auth/github"
  }

  return (
    <Button variant={variant} onClick={handleGitHubLogin} disabled={loading} className="w-full flex items-center gap-2">
      {loading ? (
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        <Github className="h-4 w-4" />
      )}
      {loading ? "Перенаправление..." : "Войти через GitHub"}
    </Button>
  )
}

