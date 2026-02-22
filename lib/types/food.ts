export interface FoodMessRecord {
  id: string
  date: string
  mealType: "breakfast" | "lunch" | "dinner"
  headCount: number
  menuItems?: string
  costPerHead: number
  totalCost: number
  site?: string
  rating?: number
  remarks?: string
  preparedBy?: string
  createdAt: string
  updatedAt: string
}

export interface CreateFoodMessDto {
  date: string
  mealType: "breakfast" | "lunch" | "dinner"
  headCount: number
  menuItems?: string
  costPerHead?: number
  totalCost?: number
  site?: string
  rating?: number
  remarks?: string
  preparedBy?: string
}
