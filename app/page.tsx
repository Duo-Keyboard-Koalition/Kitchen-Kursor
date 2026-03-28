import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, UploadCloud, TrendingUp, Users, DollarSign, AlertTriangle, Leaf, ChefHat, Handshake } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="bg-background text-foreground">

      {/* Crisis Banner */}
      <div className="bg-overlay text-brand py-3 px-4 text-center text-sm font-medium">
        <AlertTriangle className="inline w-4 h-4 mr-2 mb-0.5" />
        Canadian grocery prices are up <strong>3–5%</strong> in 2025. Meanwhile stores throw away <strong>30%</strong> of their stock. We fix both.
      </div>

      {/* Hero */}
      <section className="py-16 md:py-24 bg-brand">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/placeholder.svg?width=120&height=120"
              alt="NoName Recipes Logo"
              width={120}
              height={120}
              className="rounded-full bg-card p-2 shadow-lg"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-brand-foreground mb-4">
            Cook It. Share It.<br />Waste Nothing.
          </h1>
          <p className="text-lg md:text-xl text-brand-foreground/80 max-w-2xl mx-auto mb-8">
            NoName Recipes connects students with budget recipes, surplus grocery ingredients, and PCO rewards —
            so every dollar you spend on food actually feeds you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/recipes">
              <Button size="lg" className="bg-overlay hover:bg-overlay/90 text-overlay-foreground">
                Explore Recipes
              </Button>
            </Link>
            <Link href="/upload">
              <Button size="lg" variant="outline" className="border-brand-foreground text-brand-foreground hover:bg-brand-foreground/10">
                Share a Recipe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 bg-overlay text-overlay-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatItem value="30%"     label="of all grocery stock is thrown away" />
            <StatItem value="$762"    label="wasted per person on food yearly" />
            <StatItem value="38%"     label="of students face food insecurity" />
            <StatItem value="16B lbs" label="of food waste from U.S. stores yearly" />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
            Three steps. Students save money. Stores reduce waste. Everyone wins.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ChefHat className="w-10 h-10 text-brand" />}
              title="Cook It Yourself"
              description="Cooking at home costs 5× less than eating out. Upload or discover recipes built for student kitchens — quick, cheap, and made with ingredients you can actually buy."
            />
            <FeatureCard
              icon={<Handshake className="w-10 h-10 text-brand" />}
              title="Share With Your Campus"
              description="Every recipe you share connects your peers to affordable meals — and helps grocery stores move near-expiry stock before it becomes waste."
            />
            <FeatureCard
              icon={<Leaf className="w-10 h-10 text-brand" />}
              title="Waste Nothing, Earn More"
              description="Recipes matched to near-expiry NoName ingredients earn bonus PCO points. You get a deal. The store avoids throwing it out. The planet wins too."
            />
          </div>
        </div>
      </section>

      {/* Three-Way Win */}
      <section className="py-16 md:py-24 bg-overlay text-overlay-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">One Platform. Three Problems Solved.</h2>
            <p className="text-lg text-overlay-foreground/60 max-w-2xl mx-auto">
              Rising prices, food insecurity, and grocery waste are three symptoms of the same broken system.
              NoName Recipes connects the people who need food with the food that would otherwise be wasted.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <OverlayCard
              icon={<ChefHat className="w-8 h-8 text-brand" />}
              title="Students Cook More"
              description="Home cooking costs 5× less than restaurants. Every recipe you follow instead of ordering out puts real money back in your pocket — $200–$400/month for a typical student."
            />
            <OverlayCard
              icon={<Handshake className="w-8 h-8 text-brand" />}
              title="Stores Waste Less"
              description="Grocery stores throw away 30% of their stock. When students cook recipes built around near-expiry NoName ingredients, stores sell what they'd otherwise bin."
            />
            <OverlayCard
              icon={<Leaf className="w-8 h-8 text-brand" />}
              title="Less Goes to Landfill"
              description="16 billion pounds of food hit U.S. landfills from stores every year. Every recipe that uses surplus produce is a meal that didn't become waste."
            />
          </div>
        </div>
      </section>

      {/* For Students */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Built for Students. Free Forever.</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              38% of university students face food insecurity. Two-thirds never ask for help because asking feels like
              admitting defeat. NoName Recipes never frames saving money as a problem — it frames it as a skill.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <Image
                src="/placeholder.svg?width=500&height=350"
                alt="Students cooking"
                width={500}
                height={350}
                className="rounded-lg shadow-lg mx-auto"
              />
            </div>
            <div className="space-y-6">
              <InfoPill
                title="Cook It Yourself — Save $200+/month"
                description="Eating out as a student costs 5× what cooking at home does. Every recipe you follow instead of ordering puts real money back in your pocket."
              />
              <InfoPill
                title="Share Recipes, Reduce Campus Waste"
                description="When you share a recipe using near-expiry NoName ingredients, you earn bonus PCO points and help your campus store sell what it would have thrown out."
              />
              <InfoPill
                title="Campus Pickup Hubs"
                description="No car? No problem. NoName ingredients — including discounted near-expiry items — delivered to on-campus hubs. Designed for dorm life."
              />
              <InfoPill
                title="Zero Stigma"
                description="This is a recipe app that happens to fight food waste and save you money — not a food bank. Cook confidently. Waste nothing. Earn rewards."
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-brand">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-brand-foreground mb-4">Cook More. Waste Less. Share Everything.</h2>
          <p className="text-lg text-brand-foreground/80 max-w-xl mx-auto mb-8">
            Join your campus community. Share recipes, rescue near-expiry ingredients, and earn PCO points
            while you fight food waste — one meal at a time.
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-overlay hover:bg-overlay/90 text-overlay-foreground px-10 py-6 text-lg">
              Join Free — Start Cooking
            </Button>
          </Link>
          <p className="text-sm text-brand-foreground/70 mt-4">Free forever for students. No subscription. No fees.</p>
        </div>
      </section>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold text-brand mb-1">{value}</p>
      <p className="text-sm text-overlay-foreground/60">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-card shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="items-center text-center">
        <div className="p-4 bg-brand-subtle rounded-full inline-block mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">{description}</p>
      </CardContent>
    </Card>
  )
}

function OverlayCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-overlay-foreground/5 border border-overlay-foreground/10 rounded-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-overlay-foreground mb-2">{title}</h3>
      <p className="text-overlay-foreground/60 text-sm">{description}</p>
    </div>
  )
}

function InfoPill({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-card rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-brand-text mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
