"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Home, PlusCircle, Compass, User, ShoppingCart, Utensils, LogOut, Loader2 } from "lucide-react"
import { ModeToggle } from "./mode-toggle"
import { useAuth } from "@/context/auth-context"
import { useToast } from "./ui/use-toast"

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, signOut, loading, userProfile } = useAuth()
  const { toast } = useToast()

  const handleSignOut = async () => {
    try {
      await signOut()
      toast({ title: "Signed Out", description: "You have been successfully signed out." })
      router.push("/")
    } catch {
      toast({ title: "Sign Out Failed", description: "Could not sign out. Please try again.", variant: "destructive" })
    }
  }

  const navLinks = [
    { href: "/",        label: "Home",    icon: Home },
    { href: "/recipes", label: "Recipes", icon: Compass,   requiresAuth: true },
    { href: "/upload",  label: "Upload",  icon: PlusCircle, requiresAuth: true },
  ]

  const activeCls   = "text-brand font-semibold"
  const inactiveCls = "text-muted-foreground hover:text-brand transition-colors"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-nav border-b border-nav-border shadow-sm">
      <div className="container mx-auto py-3 px-4 flex justify-between items-center">

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <Utensils className="h-7 w-7 text-brand" />
          <span className="text-xl font-bold text-foreground">
            NoName <span className="text-brand">Recipes</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks.map((link) => {
            if (link.requiresAuth && !user && !loading) return null
            if (link.requiresAuth && loading) {
              return (
                <div key={link.href} className="flex items-center space-x-1 text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{link.label}</span>
                </div>
              )
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center space-x-1 ${pathname === link.href ? activeCls : inactiveCls}`}
              >
                <link.icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            )
          })}
          {user && !loading && (
            <Link
              href="/profile"
              className={`flex items-center space-x-1 ${pathname === "/profile" ? activeCls : inactiveCls}`}
            >
              <User className="h-4 w-4" />
              <span>{userProfile?.firstName || "Profile"}</span>
            </Link>
          )}
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <Button variant="ghost" size="icon" aria-label="Shopping Cart" asChild>
            <Link href="/cart"><ShoppingCart className="h-5 w-5" /></Link>
          </Button>
          <ModeToggle />
          {loading ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
          ) : user ? (
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-1">
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </Button>
          ) : (
            <Button className="hidden sm:inline-flex bg-brand hover:bg-brand-hover text-brand-foreground" asChild>
              <Link href="/signin">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
