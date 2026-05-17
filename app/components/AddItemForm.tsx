'use client'

import { useState, useEffect } from 'react'
import { CATEGORIES, PriceHistory } from '@/lib/types'

type Props = {
  onAdd: (name: string, categoryId: string, quantity: number, price?: number) => void
  priceHistory: PriceHistory
}

export default function AddItemForm({ onAdd, priceHistory }: Props) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('other')
  const [quantity, setQuantity] = useState(1)
  const [price, setPrice] = useState('')
  const [open, setOpen] = useState(false)

  // 商品名が変わったら前回金額を自動補完
  useEffect(() => {
    const key = name.trim().toLowerCase()
    if (key && priceHistory[key] !== undefined) {
      setPrice(String(priceHistory[key]))
    }
  }, [name, priceHistory])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    const parsedPrice = price !== '' ? Number(price) : undefined
    onAdd(trimmed, categoryId, quantity, parsedPrice)
    setName('')
    setPrice('')
    setQuantity(1)
  }

  const itemCategories = CATEGORIES.filter(c => c.id !== 'all')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => {
          if (o) { setName(''); setCategoryId('other'); setQuantity(1); setPrice('') }
          return !o
        })}
        className="w-full flex items-center justify-between px-4 py-3.5 text-left"
      >
        <div className="flex items-center gap-2 text-indigo-600 font-semibold">
          <span className="text-xl">+</span>
          <span>商品を追加</span>
        </div>
        <span className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open && (
        <form onSubmit={handleSubmit} className="border-t border-gray-100 px-4 py-3 space-y-3">
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="商品名を入力..."
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
              <label className="text-xs text-gray-500 px-1">
                金額（任意）
                {name.trim() && priceHistory[name.trim().toLowerCase()] !== undefined && (
                  <span className="ml-1 text-indigo-400">前回から自動入力</span>
                )}
              </label>
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

          <div className="flex flex-wrap gap-2">
            {itemCategories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategoryId(cat.id)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-all ${
                  categoryId === cat.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full bg-indigo-500 disabled:bg-gray-200 text-white disabled:text-gray-400 rounded-xl py-2.5 font-semibold text-base transition-colors"
          >
            追加する
          </button>
        </form>
      )}
    </div>
  )
}
