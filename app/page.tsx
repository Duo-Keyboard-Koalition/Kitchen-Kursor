import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, UploadCloud, ShoppingBasket, TrendingUp, Users, DollarSign, AlertTriangle, Leaf, ChefHat, Handshake } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="bg-gray-50 dark:bg-neutral-900 text-neutral-800 dark:text-white">

      {/* Crisis Banner */}
      <div className="bg-neutral-900 dark:bg-neutral-950 text-yellow-400 py-3 px-4 text-center text-sm font-medium">
        <AlertTriangle className="inline w-4 h-4 mr-2 mb-0.5" />
        Canadian grocery prices are up <strong>3–5%</strong> in 2025. Meanwhile stores throw away <strong>30%</strong> of their stock. We fix both.
      </div>

      {/* Hero Section */}
      <section className="py-16 md:py-24 bg-yellow-400 dark:bg-yellow-600">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/placeholder.svg?width=120&height=120"
              alt="NoName Recipes Logo"
              width={120}
              height={120}
              className="rounded-full bg-white p-2 shadow-lg"
            />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-4">
            Cook It. Share It.<br />Waste Nothing.
          </h1>
          <p className="text-lg md:text-xl text-neutral-800 max-w-2xl mx-auto mb-8">
            NoName Recipes connects students with budget recipes, surplus grocery ingredients, and PCO rewards —
            so every dollar you spend on food actually feeds you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/recipes">
              <Button size="lg" className="bg-neutral-800 hover:bg-neutral-700 text-white">
                Explore Recipes
              </Button>
            </Link>
            <Link href="/upload">
              <Button
                size="lg"
                variant="outline"
                className="bg-neutral-800 hover:bg-neutral-700 text-white"
              >
                Share a Recipe
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="py-10 bg-neutral-800 dark:bg-neutral-950 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <StatItem value="30%" label="of all grocery stock is thrown away" />
            <StatItem value="$762" label="wasted per person on food yearly" />
            <StatItem value="38%" label="of students face food insecurity" />
            <StatItem value="16B lbs" label="of food waste from U.S. stores yearly" />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-muted-foreground max-w-xl mx-auto mb-12">
            Three steps. Students save money. Stores reduce waste. Everyone wins.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<ChefHat className="w-10 h-10 text-yellow-500" />}
              title="Cook It Yourself"
              description="Cooking at home costs 5x less than eating out. Upload or discover recipes built for student kitchens — quick, cheap, and made with ingredients you can actually buy."
            />
            <FeatureCard
              icon={<Handshake className="w-10 h-10 text-yellow-500" />}
              title="Share With Your Campus"
              description="Every recipe you share connects your peers to affordable meals — and helps grocery stores move near-expiry stock before it becomes waste."
            />
            <FeatureCard
              icon={<Leaf className="w-10 h-10 text-yellow-500" />}
              title="Waste Nothing, Earn More"
              description="Recipes matched to near-expiry NoName ingredients earn bonus PCO points. You get a deal. The store avoids throwing it out. The planet wins too."
            />
          </div>
        </div>
      </section>

      {/* Three-Way Win Section */}
      <section className="py-16 md:py-24 bg-neutral-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">One Platform. Three Problems Solved.</h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Rising prices, food insecurity, and grocery waste are three symptoms of the same broken system.
              NoName Recipes connects the people who need food with the food that would otherwise be wasted.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PriceCard
              icon={<ChefHat className="w-8 h-8 text-yellow-400" />}
              title="Students Cook More"
              description="Home cooking costs 5x less than restaurants. Every recipe you follow instead of ordering out puts real money back in your pocket — $200–$400/month for a typical student."
            />
            <PriceCard
              icon={<Handshake className="w-8 h-8 text-yellow-400" />}
              title="Stores Waste Less"
              description="Grocery stores throw away 30% of their stock. When students cook recipes built around near-expiry NoName ingredients, stores sell what they'd otherwise bin — at a discount that benefits everyone."
            />
            <PriceCard
              icon={<Leaf className="w-8 h-8 text-yellow-400" />}
              title="Less Goes to Landfill"
              description="16 billion pounds of food hit U.S. landfills from stores every year. Every recipe that uses surplus produce is a meal that didn't become waste — and a PCO bonus for the student who cooked it."
            />
          </div>
        </div>
      </section>

      {/* For Students Section */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-neutral-800">
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
                description="Eating out as a student costs 5x what cooking at home does. Every recipe you follow instead of ordering puts real money back in your pocket."
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

      {/* Call to Action */}
      <section className="py-16 md:py-24 bg-yellow-500 dark:bg-yellow-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-neutral-900 mb-4">Cook More. Waste Less. Share Everything.</h2>
          <p className="text-lg text-neutral-800 max-w-xl mx-auto mb-8">
            Join your campus community. Share recipes, rescue near-expiry ingredients, and earn PCO points
            while you fight food waste — one meal at a time.
          </p>
          <Link href="/get-started">
            <Button size="lg" className="bg-neutral-800 hover:bg-neutral-700 text-white px-10 py-6 text-lg">
              Join Free — Start Cooking
            </Button>
          </Link>
          <p className="text-sm text-neutral-700 mt-4">Free forever for students. No subscription. No fees.</p>
        </div>
      </section>
    </div>
  )
}

function StatItem({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl md:text-4xl font-bold text-yellow-400 mb-1">{value}</p>
      <p className="text-sm text-neutral-400">{label}</p>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Card className="bg-white dark:bg-neutral-800 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="items-center text-center">
        <div className="p-4 bg-yellow-100 dark:bg-yellow-500/20 rounded-full inline-block mb-4">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground text-center">{description}</p>
      </CardContent>
    </Card>
  )
}

function PriceCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="p-6 bg-neutral-800 dark:bg-neutral-900 border border-neutral-700 rounded-lg">
      <div className="mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-neutral-400 text-sm">{description}</p>
    </div>
  )
}

function InfoPill({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-6 bg-white dark:bg-neutral-700 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold text-yellow-600 dark:text-yellow-500 mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}
