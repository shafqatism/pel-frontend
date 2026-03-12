import { Attachment } from "./common"

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
  attachments?: Attachment[]
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
  attachments?: Attachment[]
}
