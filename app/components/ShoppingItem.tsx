'use client'

import { memo } from 'react'
import { ShoppingItem as Item, CATEGORIES } from '@/lib/types'

type Props = {
  item: Item
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (item: Item) => void
}

const ShoppingItem = memo(function ShoppingItem({ item, onToggle, onDelete, onEdit }: Props) {
  const category = CATEGORIES.find(c => c.id === item.categoryId)
  const qty = item.quantity ?? 1

  return (
    <div className={`flex items-center gap-3 px-4 py-3 transition-opacity ${item.checked ? 'opacity-50' : ''}`}>
      <button
        onClick={() => onToggle(item.id)}
        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
          item.checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
        }`}
      >
        {item.checked && <span className="text-white text-xs">✓</span>}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p className={`text-base truncate ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
            {item.name}
          </p>
          {qty > 1 && <span className="flex-shrink-0 text-sm text-gray-500">×{qty}</span>}
        </div>

        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
          {category && (
            <span className={`inline-flex items-center gap-0.5 text-xs px-1.5 py-0.5 rounded-full ${category.color}`}>
              {category.emoji} {category.label}
            </span>
          )}
          {item.price !== undefined && (
            <span className="text-xs text-gray-500">
              ¥{item.price.toLocaleString()}
              {qty > 1 && (
                <span className="text-gray-400"> × {qty} = ¥{(item.price * qty).toLocaleString()}</span>
              )}
            </span>
          )}
          <span className="text-xs text-gray-400">
            {new Date(item.createdAt).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
          </span>
        </div>
      </div>

      {/* 編集ボタン */}
      <button
        onClick={() => onEdit(item)}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-indigo-400 transition-colors rounded-full hover:bg-indigo-50"
        aria-label="編集"
      >
        ✎
      </button>

      {/* 削除ボタン */}
      <button
        onClick={() => onDelete(item.id)}
        className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-gray-300 hover:text-red-400 transition-colors rounded-full hover:bg-red-50"
        aria-label="削除"
      >
        ✕
      </button>
    </div>
  )
})

export default ShoppingItem
