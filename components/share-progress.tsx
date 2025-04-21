'use client'
import { Share2, Twitter, Facebook, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { Habit, HabitCompletion } from '@/lib/types'

interface ShareProgressProps {
  habits: Habit[]
  completions: HabitCompletion[]
  shareEnabled: boolean
}

export default function ShareProgress({ habits, completions, shareEnabled }: ShareProgressProps) {
  if (!shareEnabled) {
    return null
  }

  // Calculate overall stats for sharing
  const totalHabits = habits.length
  const totalCompletions = completions.length

  // Calculate completion rate
  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)

  const recentCompletions = completions.filter(c => new Date(c.date) >= last30Days).length

  // Generate share text
  const shareText = `Я выполнил(а) ${totalCompletions} привычек в своем пути! Сейчас отслеживаю ${totalHabits} привычек с ${recentCompletions} выполнениями за последние 30 дней. #HabitHubus`

  // Generate share URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''

  // Generate social media share links
  const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    shareText,
  )}&url=${encodeURIComponent(shareUrl)}`
  const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    shareUrl,
  )}&quote=${encodeURIComponent(shareText)}`
  const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    shareUrl,
  )}`

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Поделиться прогрессом
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Поделиться прогрессом</DialogTitle>
          <DialogDescription>
            Поделитесь своим путем формирования привычек с друзьями и семьей
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <p className="text-sm text-muted-foreground mb-4">{shareText}</p>

          <div className="flex justify-center gap-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={twitterShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#1DA1F2] text-white p-3 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xl text-green-400">Поделиться в Twitter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={facebookShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#4267B2] text-white p-3 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <Facebook className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Поделиться в Facebook</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    href={linkedinShareUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0A66C2] text-white p-3 rounded-full hover:opacity-90 transition-opacity"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Поделиться в LinkedIn</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

