'use client'

import { useState } from 'react'
import { ShoppingItem as Item, CATEGORIES } from '@/lib/types'

type Updates = Pick<Item, 'name' | 'categoryId' | 'quantity' | 'price'>

type Props = {
  item: Item
  onSave: (id: string, updates: Updates) => void
  onCancel: () => void
}

export default function EditItemModal({ item, onSave, onCancel }: Props) {
  const [name, setName] = useState(item.name)
  const [categoryId, setCategoryId] = useState(item.categoryId)
  const [quantity, setQuantity] = useState(item.quantity ?? 1)
  const [price, setPrice] = useState(item.price !== undefined ? String(item.price) : '')

  const itemCategories = CATEGORIES.filter(c => c.id !== 'all')

  const handleSave = () => {
    const trimmed = name.trim()
    if (!trimmed) return
    onSave(item.id, {
      name: trimmed,
      categoryId,
      quantity,
      price: price !== '' ? Number(price) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Bottom sheet */}
      <div className="relative bg-white rounded-t-2xl px-4 pt-5 pb-8 space-y-3 max-h-[90vh] overflow-y-auto">
        {/* Handle bar */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-10 h-1 bg-gray-200 rounded-full" />

        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-gray-800">商品を編集</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 flex items-center justify-center text-gray-400 rounded-full hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="商品名"
          autoFocus
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />

        <div className="flex gap-2">
          {/* 数量 */}
          <div className="flex flex-col gap-1 w-28">
            <label className="text-xs text-gray-500 px-1">数量</label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
                className="w-9 h-10 flex items-center justify-center text-gray-500 text-lg active:bg-gray-100"
              >
                −
              </button>
              <input
                type="number"
                value={quantity}
                onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                className="flex-1 text-center text-base outline-none w-0"
              />
              <button
                type="button"
                onClick={() => setQuantity(q => q + 1)}
                className="w-9 h-10 flex items-center justify-center text-gray-500 text-lg active:bg-gray-100"
              >
                +
              </button>
            </div>
          </div>

          {/* 金額 */}
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500 px-1">金額（任意）</label>
            <div className="flex items-center border border-gray-200 rounded-xl px-3 h-10 gap-1 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100">
              <span className="text-gray-400 text-sm">¥</span>
              <input
                type="number"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0"
                min={0}
                className="flex-1 text-base outline-none w-0"
              />
            </div>
          </div>
        </div>

        {/* カテゴリ */}
        <div className="flex flex-wrap gap-2">
          {itemCategories.map(cat => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategoryId(cat.id)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                categoryId === cat.id ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-2.5 font-semibold"
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim()}
            className="flex-1 bg-indigo-500 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl py-2.5 font-semibold"
          >
            保存する
          </button>
        </div>
      </div>
    </div>
  )
}
