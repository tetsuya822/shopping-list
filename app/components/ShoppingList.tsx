'use client'

import { useState } from 'react'
import { ShoppingItem as Item, CATEGORIES } from '@/lib/types'
import { useLocalStorage } from '@/lib/useLocalStorage'
import CategoryFilter from './CategoryFilter'
import AddItemForm from './AddItemForm'
import ShoppingItemRow from './ShoppingItem'

export default function ShoppingList() {
  const [items, setItems, loaded] = useLocalStorage<Item[]>('shopping-list-items', [])
  const [selectedCategory, setSelectedCategory] = useState('all')

  const addItem = (name: string, categoryId: string) => {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name,
      categoryId,
      checked: false,
      createdAt: Date.now(),
    }
    setItems(prev => [newItem, ...prev])
  }

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, checked: !item.checked } : item))
  }

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const clearChecked = () => {
    setItems(prev => prev.filter(item => !item.checked))
  }

  const counts: Record<string, number> = {}
  for (const item of items) {
    if (!item.checked) {
      counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1
    }
  }

  const filtered = selectedCategory === 'all'
    ? items
    : items.filter(item => item.categoryId === selectedCategory)

  const unchecked = filtered.filter(i => !i.checked)
  const checked = filtered.filter(i => i.checked)
  const totalChecked = items.filter(i => i.checked).length

  if (!loaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-400 text-lg">読み込み中...</div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-100 px-4 pt-safe-top">
        <div className="py-4">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-gray-900">🛒 買い物リスト</h1>
            {totalChecked > 0 && (
              <button
                onClick={clearChecked}
                className="text-sm text-red-400 hover:text-red-500 font-medium"
              >
                購入済みを削除
              </button>
            )}
          </div>
          <p className="text-sm text-gray-500">
            残り {items.filter(i => !i.checked).length} 品
            {totalChecked > 0 && ` / 購入済み ${totalChecked} 品`}
          </p>
        </div>
        <div className="pb-3">
          <CategoryFilter
            selected={selectedCategory}
            onChange={setSelectedCategory}
            counts={counts}
          />
        </div>
      </header>

      {/* Body */}
      <main className="flex-1 px-4 py-4 space-y-4">
        <AddItemForm onAdd={addItem} />

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">🛍️</p>
            <p className="text-base">商品がありません</p>
            <p className="text-sm mt-1">上のフォームから追加してください</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {unchecked.map(item => (
              <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
            ))}

            {checked.length > 0 && (
              <>
                {unchecked.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50">
                    <span className="text-xs text-gray-400 font-medium">購入済み</span>
                  </div>
                )}
                {checked.map(item => (
                  <ShoppingItemRow key={item.id} item={item} onToggle={toggleItem} onDelete={deleteItem} />
                ))}
              </>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
