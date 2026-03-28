"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Share2, Copy, Check, MessageCircle } from "lucide-react"

interface SocialShareProps {
  recipeName: string
  recipeId: string
  costPerServing?: number
  wasteSaver?: boolean
  pcoBonus?: number
  variant?: "card" | "full"
}

export default function SocialShare({
  recipeName,
  recipeId,
  costPerServing,
  wasteSaver,
  pcoBonus,
  variant = "card",
}: SocialShareProps) {
  const [copied, setCopied] = useState(false)

  const recipeUrl = typeof window !== "undefined"
    ? `${window.location.origin}/recipes/${recipeId}`
    : `/recipes/${recipeId}`

  const shareText = wasteSaver && pcoBonus
    ? `🌱 Just found a Waste Saver recipe on NoName Recipes — "${recipeName}"${costPerServing ? ` for $${costPerServing.toFixed(2)}/serving` : ""}. Earns ${pcoBonus} bonus PCO points! Cook it before it's gone 👇`
    : `🍳 Check out "${recipeName}" on NoName Recipes${costPerServing ? ` — only $${costPerServing.toFixed(2)}/serving` : ""}! Budget cooking for students 👇`

  const handleNativeShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: recipeName,
          text: shareText,
          url: recipeUrl,
        })
      } catch {
        // User cancelled or share not supported — fall through
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareText}\n${recipeUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
    }
  }

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${recipeUrl}`)}`

  if (variant === "card") {
    return (
      <div className="flex items-center gap-1">
        {/* WhatsApp — most-used student sharing channel */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Share on WhatsApp"
        >
          <Button variant="ghost" size="sm" className="px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20">
            <MessageCircle className="h-4 w-4" />
          </Button>
        </a>

        {/* Native share (Instagram, iMessage, etc. on mobile) */}
        {typeof navigator !== "undefined" && navigator.share && (
          <Button variant="ghost" size="sm" className="px-2" onClick={handleNativeShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        )}

        {/* Copy link */}
        <Button variant="ghost" size="sm" className="px-2" onClick={handleCopyLink}>
          {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    )
  }

  // Full variant — used on recipe detail page
  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Share this recipe</p>
      <div className="flex flex-wrap gap-2">
        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
            <MessageCircle className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
        </a>

        {typeof navigator !== "undefined" && navigator.share && (
          <Button variant="outline" size="sm" onClick={handleNativeShare}>
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}

        <Button variant="outline" size="sm" onClick={handleCopyLink}>
          {copied
            ? <><Check className="h-4 w-4 mr-2 text-green-500" />Copied!</>
            : <><Copy className="h-4 w-4 mr-2" />Copy Link</>
          }
        </Button>
      </div>
      {wasteSaver && pcoBonus && (
        <p className="text-xs text-green-600 dark:text-green-400">
          🌱 Sharing earns your friends <strong>{pcoBonus} bonus PCO points</strong> — and rescues near-expiry ingredients from the bin.
        </p>
      )}
    </div>
  )
}
