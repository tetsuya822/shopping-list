'use client'

import { CATEGORIES } from '@/lib/types'

type Props = {
  selected: string
  onChange: (id: string) => void
  counts: Record<string, number>
}

export default function CategoryFilter({ selected, onChange, counts }: Props) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {CATEGORIES.map(cat => {
        const count = cat.id === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[cat.id] ?? 0)
        const isActive = selected === cat.id
        return (
          <button
            key={cat.id}
            onClick={() => onChange(cat.id)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              isActive
                ? 'bg-indigo-500 text-white shadow-sm'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span className={`text-xs rounded-full px-1.5 py-0.5 ${
                isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
