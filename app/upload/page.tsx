"use client"

import type React from "react"
import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  UploadCloud,
  Wand2,
  Edit3,
  CheckCircle,
  AlertTriangle,
  Loader2,
  PlusCircle,
  Trash2,
  Clock,
  ChefHat,
  Globe,
  Leaf,
  Gift,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Image from "next/image"
import { useAuth } from "@/context/auth-context"
import { useRouter } from "next/navigation"
import { aiService, type AIRecipeAnalysis } from "@/lib/ai-service"
import ProtectedRoute from "@/components/protected-route"

interface Ingredient {
  id: string
  name: string
  quantity: string
  storeProduct?: StoreProduct
}

interface StoreProduct {
  id: string
  name: string
  price: string
  imageUrl: string
}

function UploadRecipePageContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [recipeName, setRecipeName] = useState("")
  const [recipeDescription, setRecipeDescription] = useState("")
  const [recipeImage, setRecipeImage] = useState<File | null>(null)
  const [recipeImageUrl, setRecipeImageUrl] = useState<string | null>(null)
  const [briefIngredients, setBriefIngredients] = useState("")
  const [generatedRecipe, setGeneratedRecipe] = useState<string | null>(null)
  const [extractedIngredients, setExtractedIngredients] = useState<Ingredient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isEditingRecipe, setIsEditingRecipe] = useState(false)
  const [editedRecipe, setEditedRecipe] = useState("")
  const [aiAnalysis, setAiAnalysis] = useState<AIRecipeAnalysis | null>(null)
  const [isWasteSaver, setIsWasteSaver] = useState(false)
  const [costPerServing, setCostPerServing] = useState("")

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0]
      if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid File Type", description: "Please select a valid image file.", variant: "destructive" })
        return
      }
      const maxFileSize = 5 * 1024 * 1024
      if (file.size > maxFileSize) {
        toast({ title: "File Too Large", description: "Image file must be smaller than 5MB.", variant: "destructive" })
        return
      }
      setRecipeImage(file)
      setRecipeImageUrl(URL.createObjectURL(file))
    }
  }

  const handleUploadRecipe = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast({ title: "Not Authenticated", description: "Please sign in first.", variant: "destructive" })
      return
    }
    if (!recipeName.trim() || !recipeDescription.trim() || !recipeImage) {
      toast({
        title: "Missing Information",
        description: "Please provide recipe name, description, and image.",
        variant: "destructive",
      })
      return
    }
    setIsLoading(true)
    try {
      const analysis = await aiService.analyzeIngredients(briefIngredients, recipeName)
      setAiAnalysis(analysis)
      const aiGeneratedRecipe = generateRecipeFromAnalysis(analysis, recipeName)
      setGeneratedRecipe(aiGeneratedRecipe)
      setEditedRecipe(aiGeneratedRecipe)
      const ingredients: Ingredient[] = analysis.ingredients.map((aiIng, index) => ({
        id: `ing-${index}-${Date.now()}`,
        name: aiIng.name,
        quantity: `${aiIng.quantity} ${aiIng.unit}`,
        storeProduct: analysis.productMatches.find((match) => match.category === aiIng.category)
          ? {
              id: analysis.productMatches.find((match) => match.category === aiIng.category)!.id,
              name: analysis.productMatches.find((match) => match.category === aiIng.category)!.name,
              price: analysis.productMatches.find((match) => match.category === aiIng.category)!.price,
              imageUrl: analysis.productMatches.find((match) => match.category === aiIng.category)!.imageUrl,
            }
          : undefined,
      }))
      setExtractedIngredients(ingredients)
      toast({
        title: "AI Recipe Generated!",
        description: "Our AI has analyzed your ingredients and generated a smart recipe with product matches.",
      })
    } catch (error) {
      console.error("Error generating recipe:", error)
      toast({ title: "Generation Failed", description: "Could not generate recipe. Please try again.", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const generateRecipeFromAnalysis = (analysis: AIRecipeAnalysis, name: string): string => {
    const { ingredients, cookingTime, difficulty, cuisine, dietaryInfo } = analysis
    let recipe = `# ${name}\n\n`
    recipe += `**Cuisine:** ${cuisine} | **Difficulty:** ${difficulty} | **Time:** ${cookingTime}\n`
    if (dietaryInfo.length > 0) {
      recipe += `**Dietary:** ${dietaryInfo.join(", ")}\n\n`
    }
    recipe += `## Ingredients\n`
    ingredients.forEach((ing) => {
      recipe += `- ${ing.quantity} ${ing.unit} ${ing.name} (${ing.category})\n`
    })
    recipe += `\n## Instructions\n`
    recipe += `1. Prepare all ingredients as listed above.\n`
    recipe += `2. Follow standard cooking procedures for ${cuisine.toLowerCase()} cuisine.\n`
    recipe += `3. Cook for approximately ${cookingTime}.\n`
    recipe += `4. Season to taste and serve hot.\n\n`
    recipe += `**Tip:** This ${difficulty.toLowerCase()} recipe is perfect for ${cuisine.toLowerCase()} cuisine lovers!`
    return recipe
  }

  const handleEditIngredient = (id: string, field: keyof Ingredient, value: string) => {
    setExtractedIngredients((prev) => prev.map((ing) => (ing.id === id ? { ...ing, [field]: value } : ing)))
  }

  const handleRemoveIngredient = (id: string) => {
    setExtractedIngredients((prev) => prev.filter((ing) => ing.id !== id))
  }

  const handleAddIngredient = () => {
    setExtractedIngredients((prev) => [...prev, { id: `ing-${Date.now()}`, name: "", quantity: "" }])
  }

  const handleSwapIngredient = (_id: string) => {
    toast({ title: "Ingredient Swapped!", variant: "default" })
  }

  const handleSubmitRecipe = async () => {
    if (!user || !recipeImage) return
    setIsUploading(true)
    try {
      const token = await user.getIdToken()
      const formData = new FormData()
      formData.append("name", recipeName.trim())
      formData.append("description", editedRecipe || recipeDescription.trim())
      formData.append("image", recipeImage)
      formData.append("userId", user.uid)
      formData.append("wasteSaver", String(isWasteSaver))
      formData.append("pcoBonus", isWasteSaver ? "250" : "0")
      if (costPerServing) formData.append("costPerServing", costPerServing)

      const response = await fetch("/api/upload-recipe-complete", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      const result = await response.json()
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to upload recipe")
      }

      toast({ title: "Recipe Submitted!", description: `Your recipe "${recipeName}" is now live!`, variant: "default" })
      router.push("/recipes")
    } catch (error) {
      console.error("Error uploading recipe:", error)
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "Could not upload your recipe. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto bg-white dark:bg-neutral-800">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <UploadCloud className="w-6 h-6 mr-2 text-yellow-500" />
            Share a Recipe
          </CardTitle>
          <CardDescription>
            Every recipe you share helps a student cook at home instead of ordering out — and moves NoName
            ingredients that would otherwise go to waste. Cook it. Share it. Earn points for it.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUploadRecipe} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recipeName">Recipe Name *</Label>
              <Input
                id="recipeName"
                value={recipeName}
                onChange={(e) => setRecipeName(e.target.value)}
                placeholder="e.g., Grandma's Apple Pie"
                required
                disabled={isLoading}
                className="bg-gray-50 dark:bg-neutral-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="briefIngredients">Key Ingredients (for AI analysis)</Label>
              <Input
                id="briefIngredients"
                value={briefIngredients}
                onChange={(e) => setBriefIngredients(e.target.value)}
                placeholder="e.g., chicken, garlic, lemon, herbs"
                disabled={isLoading}
                className="bg-gray-50 dark:bg-neutral-700"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipeDescription">Recipe Description *</Label>
              <Textarea
                id="recipeDescription"
                value={recipeDescription}
                onChange={(e) => setRecipeDescription(e.target.value)}
                placeholder="Describe your recipe, ingredients, and cooking instructions..."
                required
                rows={6}
                disabled={isLoading}
                className="bg-gray-50 dark:bg-neutral-700"
              />
              <p className="text-xs text-muted-foreground">
                Provide a detailed description including ingredients and cooking steps.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipeImage">Recipe Image *</Label>
              <Input
                id="recipeImage"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                required
                disabled={isLoading}
                className="bg-gray-50 dark:bg-neutral-700"
              />
              <p className="text-xs text-muted-foreground">Maximum file size: 5MB. Supported formats: JPG, PNG, GIF, WebP</p>
              {recipeImageUrl && (
                <div className="mt-3">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <Image
                    src={recipeImageUrl || "/placeholder.svg"}
                    alt="Recipe preview"
                    width={300}
                    height={200}
                    className="rounded-md object-cover border border-gray-200 dark:border-neutral-600"
                  />
                </div>
              )}
            </div>

            {/* Cost per serving */}
            <div className="space-y-2">
              <Label htmlFor="costPerServing">Estimated Cost per Serving ($)</Label>
              <Input
                id="costPerServing"
                type="number"
                min="0"
                step="0.25"
                value={costPerServing}
                onChange={(e) => setCostPerServing(e.target.value)}
                placeholder="e.g. 2.50"
                disabled={isLoading}
                className="bg-gray-50 dark:bg-neutral-700 max-w-[160px]"
              />
              <p className="text-xs text-muted-foreground">
                Helps students filter by budget. Under $5/serving recipes get featured.
              </p>
            </div>

            {/* Waste Saver toggle */}
            <div className="p-4 rounded-lg border-2 border-dashed border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/20 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Leaf className="w-5 h-5 text-green-600" />
                  <Label htmlFor="wasteSaver" className="text-green-800 dark:text-green-300 font-semibold cursor-pointer">
                    Waste Saver Recipe
                  </Label>
                </div>
                <button
                  type="button"
                  id="wasteSaver"
                  role="switch"
                  aria-checked={isWasteSaver}
                  onClick={() => setIsWasteSaver((v) => !v)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                    isWasteSaver ? "bg-green-500" : "bg-neutral-300 dark:bg-neutral-600"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isWasteSaver ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <p className="text-xs text-green-700 dark:text-green-400">
                Mark this if your recipe uses ingredients that are near expiry or on discount at NoName stores.
                Waste Saver recipes earn <strong>bonus PCO points</strong> for every student who cooks it — and help stores sell stock before it goes to landfill.
              </p>
              {isWasteSaver && (
                <div className="flex items-center gap-2 pt-1">
                  <Gift className="w-4 h-4 text-yellow-600" />
                  <span className="text-xs font-semibold text-yellow-700 dark:text-yellow-400">
                    +250 bonus PCO points will be awarded to students who cook this recipe
                  </span>
                </div>
              )}
            </div>

            <Button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-600 text-black" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing with AI...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Analyze & Generate Recipe
                </>
              )}
            </Button>
          </form>

          {generatedRecipe && (
            <div className="space-y-6 pt-6 border-t dark:border-neutral-700">
              {aiAnalysis && (
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 p-4 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <h3 className="text-lg font-semibold mb-3 flex items-center">
                    <Wand2 className="w-5 h-5 mr-2 text-yellow-600" />
                    AI Analysis Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cooking Time</p>
                        <p className="font-medium">{aiAnalysis.cookingTime}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <ChefHat className="w-4 h-4 text-green-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Difficulty</p>
                        <p className="font-medium">{aiAnalysis.difficulty}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4 text-purple-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Cuisine</p>
                        <p className="font-medium">{aiAnalysis.cuisine}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Leaf className="w-4 h-4 text-emerald-500" />
                      <div>
                        <p className="text-xs text-muted-foreground">Dietary</p>
                        <p className="font-medium">
                          {aiAnalysis.dietaryInfo.length > 0 ? aiAnalysis.dietaryInfo.join(", ") : "Standard"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold flex items-center">
                    <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                    Generated Recipe
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setIsEditingRecipe(!isEditingRecipe)}>
                    <Edit3 className="w-4 h-4 mr-1" /> {isEditingRecipe ? "Save" : "Edit"}
                  </Button>
                </div>
                {isEditingRecipe ? (
                  <Textarea
                    value={editedRecipe}
                    onChange={(e) => setEditedRecipe(e.target.value)}
                    rows={10}
                    className="bg-gray-50 dark:bg-neutral-700"
                  />
                ) : (
                  <div className="p-4 bg-gray-50 dark:bg-neutral-700 rounded-md whitespace-pre-wrap text-sm">
                    {editedRecipe}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                  AI-Enhanced Ingredients
                </h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Our AI has intelligently parsed your ingredients and matched them with NoName products.
                </p>
                <div className="space-y-3">
                  {extractedIngredients.map((ing) => {
                    const aiIngredient = aiAnalysis?.ingredients.find((ai) => ai.name === ing.name)
                    return (
                      <Card key={ing.id} className="p-3 bg-gray-50 dark:bg-neutral-700/50">
                        <div className="flex flex-col sm:flex-row gap-2 items-start">
                          <div className="flex-grow space-y-1">
                            <Input
                              value={ing.name}
                              onChange={(e) => handleEditIngredient(ing.id, "name", e.target.value)}
                              placeholder="Ingredient Name"
                              className="text-sm"
                            />
                            <Input
                              value={ing.quantity}
                              onChange={(e) => handleEditIngredient(ing.id, "quantity", e.target.value)}
                              placeholder="Quantity (e.g. 2 cups)"
                              className="text-sm"
                            />
                            {aiIngredient && (
                              <div className="text-xs text-muted-foreground">
                                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-2 py-1 rounded mr-2">
                                  {aiIngredient.category}
                                </span>
                                <span>{aiIngredient.description}</span>
                              </div>
                            )}
                          </div>
                          <div className="sm:w-48 flex-shrink-0">
                            {ing.storeProduct ? (
                              <div className="flex items-center space-x-2 p-2 border dark:border-neutral-600 rounded-md bg-white dark:bg-neutral-800">
                                <Image
                                  src={ing.storeProduct.imageUrl || "/placeholder.svg"}
                                  alt={ing.storeProduct.name}
                                  width={30}
                                  height={30}
                                  className="rounded"
                                />
                                <div className="text-xs">
                                  <p className="font-medium">{ing.storeProduct.name}</p>
                                  <p className="text-muted-foreground">{ing.storeProduct.price}</p>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2 p-2 border border-dashed dark:border-neutral-600 rounded-md text-xs text-muted-foreground">
                                <AlertTriangle className="w-4 h-4 text-orange-400" />
                                <span>No match found</span>
                              </div>
                            )}
                            <Button
                              variant="link"
                              size="sm"
                              onClick={() => handleSwapIngredient(ing.id)}
                              className="text-xs text-yellow-600 dark:text-yellow-500 p-1"
                            >
                              Swap Product
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveIngredient(ing.id)}
                            className="text-red-500 hover:text-red-600 flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddIngredient}
                    className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    <PlusCircle className="w-4 h-4 mr-2" /> Add Ingredient
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleSubmitRecipe}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-4 w-4" />
                )}
                Confirm & Submit Recipe
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default function UploadRecipePage() {
  return (
    <ProtectedRoute message="Please sign in to upload a recipe.">
      <UploadRecipePageContent />
    </ProtectedRoute>
  )
}
