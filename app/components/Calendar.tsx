'use client'

import { useState, useMemo } from 'react'

type Props = {
  itemDates: Set<string>       // 'YYYY-MM-DD' 形式
  selectedDate: Date | null
  onSelectDate: (date: Date | null) => void
}

const MONTH_NAMES = ['1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月']
const DAY_NAMES   = ['日','月','火','水','木','金','土']

export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export default function Calendar({ itemDates, selectedDate, onSelectDate }: Props) {
  const today = useMemo(() => new Date(), [])
  const [viewYear, setViewYear] = useState(() => (selectedDate ?? today).getFullYear())
  const [viewMonth, setViewMonth] = useState(() => (selectedDate ?? today).getMonth())

  const cells = useMemo(() => {
    const firstDow = new Date(viewYear, viewMonth, 1).getDay()
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate()
    const result: (Date | null)[] = Array(firstDow).fill(null)
    for (let d = 1; d <= daysInMonth; d++) {
      result.push(new Date(viewYear, viewMonth, d))
    }
    return result
  }, [viewYear, viewMonth])

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0) }
    else setViewMonth(m => m + 1)
  }

  const todayKey = toDateKey(today)
  const selectedKey = selectedDate ? toDateKey(selectedDate) : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3 select-none">
      {/* ヘッダー：月ナビゲーション */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-lg"
        >
          ‹
        </button>
        <span className="font-semibold text-gray-800 text-sm">
          {viewYear}年 {MONTH_NAMES[viewMonth]}
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 text-lg"
        >
          ›
        </button>
      </div>

      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 mb-1">
        {DAY_NAMES.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? 'text-red-400' : i === 6 ? 'text-blue-400' : 'text-gray-400'
            }`}
          >
            {d}
          </div>
        ))}
      </div>

      {/* 日付グリッド */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />

          const key = toDateKey(date)
          const isSelected = key === selectedKey
          const isToday = key === todayKey
          const hasItems = itemDates.has(key)
          const dow = date.getDay()

          return (
            <button
              key={key}
              onClick={() => onSelectDate(isSelected ? null : date)}
              className={`flex flex-col items-center py-0.5 rounded-lg transition-colors ${
                isSelected ? 'bg-indigo-500' : 'hover:bg-gray-50'
              }`}
            >
              <span
                className={`w-7 h-7 flex items-center justify-center rounded-full text-sm ${
                  isSelected
                    ? 'text-white font-bold'
                    : isToday
                    ? 'border-2 border-indigo-400 text-indigo-600 font-semibold'
                    : dow === 0
                    ? 'text-red-400'
                    : dow === 6
                    ? 'text-blue-400'
                    : 'text-gray-700'
                }`}
              >
                {date.getDate()}
              </span>
              {/* 商品がある日はドット */}
              <span
                className={`w-1 h-1 rounded-full mt-0.5 ${
                  hasItems
                    ? isSelected ? 'bg-white' : 'bg-indigo-400'
                    : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>

      {/* 絞り込み解除 */}
      {selectedDate && (
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => onSelectDate(null)}
            className="text-xs text-indigo-400 underline"
          >
            絞り込みを解除
          </button>
        </div>
      )}
    </div>
  )
}
