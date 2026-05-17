'use client'

import { useState } from 'react'
import { CATEGORIES } from '@/lib/types'

type Props = {
  onAdd: (name: string, categoryId: string) => void
}

export default function AddItemForm({ onAdd }: Props) {
  const [name, setName] = useState('')
  const [categoryId, setCategoryId] = useState('other')
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    onAdd(trimmed, categoryId)
    setName('')
  }

  const itemCategories = CATEGORIES.filter(c => c.id !== 'all')

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
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
