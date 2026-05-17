export type Category = {
  id: string
  label: string
  emoji: string
  color: string
}

export type ShoppingItem = {
  id: string
  name: string
  categoryId: string
  checked: boolean
  createdAt: number
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'すべて', emoji: '🛒', color: 'bg-gray-100 text-gray-700' },
  { id: 'vegetable', label: '野菜・果物', emoji: '🥦', color: 'bg-green-100 text-green-700' },
  { id: 'meat', label: '肉・魚', emoji: '🥩', color: 'bg-red-100 text-red-700' },
  { id: 'dairy', label: '乳製品・卵', emoji: '🥛', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'bread', label: 'パン・米', emoji: '🍞', color: 'bg-orange-100 text-orange-700' },
  { id: 'drink', label: '飲み物', emoji: '🧃', color: 'bg-blue-100 text-blue-700' },
  { id: 'snack', label: 'お菓子', emoji: '🍫', color: 'bg-pink-100 text-pink-700' },
  { id: 'daily', label: '日用品', emoji: '🧴', color: 'bg-purple-100 text-purple-700' },
  { id: 'other', label: 'その他', emoji: '📦', color: 'bg-gray-100 text-gray-600' },
]
