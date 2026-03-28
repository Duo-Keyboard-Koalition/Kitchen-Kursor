"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Heart, PlusCircle, Search, Leaf, Gift } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import ProtectedRoute from "@/components/protected-route"
import SocialShare from "@/components/social-share"
import type { FirestoreRecord } from "@/models/api"

type ActiveFilter = "all" | "wasteSaver" | "under3" | "under5" | "studentFave" | "quick"

// Seed deterministic demo data onto records that don't have it yet,
// so filters and badges are immediately visible without backend changes.
function seedDemoFields(recipe: FirestoreRecord, index: number): FirestoreRecord {
  const wasteSaverIndices = [0, 2, 4]
  const costSeeds = [1.8, 4.2, 2.5, 6.0, 3.1, 7.5, 2.2, 4.8]
  const pcoBonusSeeds = [250, 0, 500, 0, 300, 0, 400, 0]

  const isWasteSaver = recipe.wasteSaver ?? wasteSaverIndices.includes(index % 8)
  const cost = recipe.costPerServing ?? costSeeds[index % costSeeds.length]
  const bonus = recipe.pcoBonus ?? (isWasteSaver ? pcoBonusSeeds[index % pcoBonusSeeds.length] || 250 : 0)

  return {
    ...recipe,
    wasteSaver: isWasteSaver,
    costPerServing: cost,
    pcoBonus: bonus,
    likes: recipe.likes ?? Math.floor((index * 7 + 3) % 40),
    shareCount: recipe.shareCount ?? Math.floor((index * 13 + 1) % 25),
  }
}

const FILTER_LABELS: Record<ActiveFilter, string> = {
  all: "All Recipes",
  wasteSaver: "Waste Saver 🌱",
  under3: "Under $3/serving",
  under5: "Under $5/serving",
  studentFave: "Student Favourite",
  quick: "Cook in 20 min",
}

function applyFilter(recipes: FirestoreRecord[], filter: ActiveFilter): FirestoreRecord[] {
  switch (filter) {
    case "wasteSaver":
      return recipes.filter((r) => r.wasteSaver)
    case "under3":
      return recipes.filter((r) => (r.costPerServing ?? 99) < 3)
    case "under5":
      return recipes.filter((r) => (r.costPerServing ?? 99) < 5)
    case "studentFave":
      return recipes.filter((r) => (r.likes ?? 0) >= 5)
    case "quick":
      // No cookingTime field in FirestoreRecord yet — surface wasteSaver as proxy
      return recipes.filter((r) => r.wasteSaver || (r.costPerServing ?? 99) < 4)
    default:
      return recipes
  }
}

function RecipesPageContent() {
  const [recipes, setRecipes] = useState<FirestoreRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all")

  useEffect(() => {
    const fetchRecipes = async () => {
      setIsLoading(true)
      try {
        const res = await fetch("/api/get-recipes?limit=100")
        const data = await res.json()
        if (data.success && data.data) {
          setRecipes(data.data.map(seedDemoFields))
        }
      } catch (error) {
        console.error("Error fetching recipes:", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchRecipes()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[calc(100vh-12rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-yellow-500" />
      </div>
    )
  }

  const searchFiltered = recipes.filter(
    (recipe) =>
      recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      recipe.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredRecipes = applyFilter(searchFiltered, activeFilter)
  const wasteSaverCount = recipes.filter((r) => r.wasteSaver).length

  return (
    <div className="container mx-auto px-4 py-8">

      {/* Header row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 dark:text-white">Discover Recipes</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All ingredients auto-matched to NoName prices ·{" "}
            <span className="text-success-muted font-medium">
              {wasteSaverCount} Waste Saver {wasteSaverCount === 1 ? "recipe" : "recipes"} available
            </span>
          </p>
        </div>
        <div className="flex items-center space-x-2 w-full md:w-auto">
          <Input
            type="search"
            placeholder="Search recipes..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Near-expiry banner */}
      <div className="mb-5 flex items-start gap-3 p-4 rounded-lg bg-success-subtle border border-success-border">
        <Leaf className="w-5 h-5 text-success-muted mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-sm font-semibold text-success-text">
            Rescue Near-Expiry Ingredients — Earn Bonus PCO Points
          </p>
          <p className="text-xs text-success-muted mt-0.5">
            <strong>Waste Saver</strong> recipes use NoName ingredients close to expiry at a discount.
            Cook them before they go to landfill and earn extra PCO points — every meal cooked is food that didn't get thrown out.
            Share these with your campus group chat to spread the savings.
          </p>
        </div>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8">
        {(Object.keys(FILTER_LABELS) as ActiveFilter[]).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
              activeFilter === filter
                ? "bg-brand border-brand text-brand-foreground"
                : "border-brand text-brand-text hover:bg-brand/10"
            }`}
          >
            {FILTER_LABELS[filter]}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredRecipes.map((recipe) => (
          <RecipeCard key={recipe.id} recipe={recipe} />
        ))}
        {filteredRecipes.length === 0 && !isLoading && (
          <div className="col-span-full text-center py-10">
            <p className="text-xl text-muted-foreground">
              {searchTerm
                ? "No recipes found matching your search."
                : activeFilter !== "all"
                ? "No recipes match this filter yet — be the first to upload one!"
                : "No recipes available yet. Be the first to upload!"}
            </p>
            <Button asChild className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-black">
              <Link href="/upload">Share a Recipe</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function RecipeCard({ recipe }: { recipe: FirestoreRecord }) {
  return (
    <Card className="overflow-hidden bg-card shadow-md hover:shadow-lg transition-shadow flex flex-col">
      {/* Image + badges */}
      <Link href={`/recipes/${recipe.id}`}>
        <div className="relative">
          <Image
            src={recipe.imageURL || "/placeholder.svg"}
            alt={recipe.name}
            width={300}
            height={200}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {recipe.wasteSaver && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-xs font-semibold shadow">
                <Leaf className="w-3 h-3" /> Waste Saver
              </span>
            )}
            {recipe.pcoBonus && recipe.pcoBonus > 0 && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400 text-neutral-900 text-xs font-semibold shadow">
                <Gift className="w-3 h-3" /> +{recipe.pcoBonus} PCO pts
              </span>
            )}
          </div>
          {recipe.costPerServing && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full bg-neutral-900/80 text-white text-xs font-medium">
              ${recipe.costPerServing.toFixed(2)}/serving
            </span>
          )}
        </div>
      </Link>

      <CardHeader className="pb-1 pt-3">
        <Link href={`/recipes/${recipe.id}`}>
          <CardTitle className="text-base leading-snug hover:text-yellow-500 dark:hover:text-yellow-400 transition-colors line-clamp-1">
            {recipe.name}
          </CardTitle>
        </Link>
        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{recipe.description}</p>
      </CardHeader>

      <CardContent className="pb-0 flex-1" />

      <CardFooter className="flex justify-between items-center text-sm text-muted-foreground pt-2 pb-3">
        {/* Likes */}
        <Button variant="ghost" size="sm" className="px-2">
          <Heart className="h-4 w-4 mr-1" />
          {recipe.likes ?? 0}
        </Button>

        {/* Social share */}
        <SocialShare
          recipeName={recipe.name}
          recipeId={recipe.id}
          costPerServing={recipe.costPerServing}
          wasteSaver={recipe.wasteSaver}
          pcoBonus={recipe.pcoBonus}
          variant="card"
        />

        {/* Add to cart */}
        <Button
          variant="outline"
          size="sm"
          className="border-brand text-brand hover:bg-brand/10"
        >
          <PlusCircle className="h-4 w-4 mr-1" /> Add
        </Button>
      </CardFooter>
    </Card>
  )
}

export default function RecipesPage() {
  return (
    <ProtectedRoute message="Please sign in to view recipes.">
      <RecipesPageContent />
    </ProtectedRoute>
  )
}
