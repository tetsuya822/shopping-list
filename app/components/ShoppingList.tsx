'use client'

import { useState, useMemo } from 'react'
import { ShoppingItem as Item, PriceHistory } from '@/lib/types'
import { useLocalStorage } from '@/lib/useLocalStorage'
import CategoryFilter from './CategoryFilter'
import AddItemForm from './AddItemForm'
import ShoppingItemRow from './ShoppingItem'
import EditItemModal from './EditItemModal'
import Calendar, { toDateKey } from './Calendar'

function isShoppingItemArray(data: unknown): data is Item[] {
  return (
    Array.isArray(data) &&
    data.every(item =>
      typeof item === 'object' &&
      item !== null &&
      typeof (item as Item).id === 'string' &&
      typeof (item as Item).name === 'string' &&
      typeof (item as Item).categoryId === 'string' &&
      typeof (item as Item).checked === 'boolean' &&
      typeof (item as Item).createdAt === 'number' &&
      ((item as Item).quantity === undefined || typeof (item as Item).quantity === 'number') &&
      ((item as Item).price === undefined || typeof (item as Item).price === 'number'),
    )
  )
}

function isPriceHistory(data: unknown): data is PriceHistory {
  return (
    typeof data === 'object' &&
    data !== null &&
    Object.values(data as object).every(v => typeof v === 'number')
  )
}

export default function ShoppingList() {
  const [items, setItems, loaded, storageError] = useLocalStorage<Item[]>(
    'shopping-list-items',
    [],
    isShoppingItemArray,
  )
  const [priceHistory, setPriceHistory] = useLocalStorage<PriceHistory>(
    'shopping-list-price-history',
    {},
    isPriceHistory,
  )
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [showCalendar, setShowCalendar] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const addItem = (name: string, categoryId: string, quantity: number, price?: number) => {
    const newItem: Item = {
      id: crypto.randomUUID(),
      name,
      categoryId,
      quantity,
      price,
      checked: false,
      createdAt: Date.now(),
    }
    setItems(prev => [newItem, ...prev])
    if (price !== undefined) {
      setPriceHistory(prev => ({ ...prev, [name.trim().toLowerCase()]: price }))
    }
  }

  const editItem = (id: string, updates: Pick<Item, 'name' | 'categoryId' | 'quantity' | 'price'>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item))
    if (updates.price !== undefined) {
      setPriceHistory(prev => ({ ...prev, [updates.name.trim().toLowerCase()]: updates.price! }))
    }
    setEditingItem(null)
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

  const handleSelectDate = (date: Date | null) => {
    setSelectedDate(date)
    if (date) setShowCalendar(false)
  }

  // カテゴリ別の未購入数
  const counts = useMemo(() => {
    const result: Record<string, number> = {}
    for (const item of items) {
      if (!item.checked) {
        result[item.categoryId] = (result[item.categoryId] ?? 0) + 1
      }
    }
    return result
  }, [items])

  // 商品が存在する日付の Set（カレンダーの印用）
  const itemDates = useMemo(() => {
    const set = new Set<string>()
    for (const item of items) {
      set.add(toDateKey(new Date(item.createdAt)))
    }
    return set
  }, [items])

  // フィルタリング・ソート
  const filtered = useMemo(() => {
    let result = selectedCategory === 'all'
      ? items
      : items.filter(item => item.categoryId === selectedCategory)

    if (selectedDate) {
      const key = toDateKey(selectedDate)
      result = result.filter(item => toDateKey(new Date(item.createdAt)) === key)
    }

    return result.slice().sort((a, b) =>
      sortOrder === 'newest' ? b.createdAt - a.createdAt : a.createdAt - b.createdAt
    )
  }, [items, selectedCategory, selectedDate, sortOrder])

  const unchecked = filtered.filter(i => !i.checked)
  const checked = filtered.filter(i => i.checked)
  const totalChecked = items.filter(i => i.checked).length

  // 未購入アイテムの合計金額
  const { total, partialCount } = useMemo(() => {
    let sum = 0, withPrice = 0, withoutPrice = 0
    for (const item of unchecked) {
      const qty = item.quantity ?? 1
      if (item.price !== undefined) { sum += item.price * qty; withPrice++ }
      else withoutPrice++
    }
    return { total: sum, partialCount: withoutPrice > 0 && withPrice > 0 ? withoutPrice : 0 }
  }, [unchecked])

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
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
                className="text-xs text-gray-500 border border-gray-200 rounded-full px-2.5 py-1"
              >
                {sortOrder === 'newest' ? '↓ 新しい順' : '↑ 古い順'}
              </button>
              {totalChecked > 0 && (
                <button onClick={clearChecked} className="text-sm text-red-400 font-medium">
                  購入済みを削除
                </button>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500">
            残り {items.filter(i => !i.checked).length} 品
            {totalChecked > 0 && ` / 購入済み ${totalChecked} 品`}
          </p>
        </div>

        <div className="pb-2">
          <CategoryFilter selected={selectedCategory} onChange={setSelectedCategory} counts={counts} />
        </div>

        {/* 合計金額 */}
        {unchecked.length > 0 && (
          <div className="flex items-baseline justify-end gap-2 pb-3">
            {partialCount > 0 && (
              <span className="text-xs text-gray-400">{partialCount}品は金額未入力</span>
            )}
            <span className="text-sm text-gray-500">合計</span>
            <span className="text-lg font-bold text-indigo-600">¥{total.toLocaleString()}</span>
          </div>
        )}
      </header>

      {/* Storage error banner */}
      {storageError && (
        <div className="mx-4 mt-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
          ⚠️ {storageError}
        </div>
      )}

      {/* Body */}
      <main className="flex-1 px-4 py-4 space-y-4">

        {/* カレンダートグル */}
        <div>
          <button
            onClick={() => setShowCalendar(v => !v)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl border text-sm font-medium transition-colors ${
              selectedDate
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                : 'bg-white border-gray-100 text-gray-600'
            }`}
          >
            <span className="flex items-center gap-2">
              <span>📅</span>
              {selectedDate
                ? `${selectedDate.getFullYear()}年${selectedDate.getMonth() + 1}月${selectedDate.getDate()}日の商品`
                : 'カレンダーで日付絞り込み'}
            </span>
            <span className={`text-gray-400 transition-transform ${showCalendar ? 'rotate-180' : ''}`}>▼</span>
          </button>

          {showCalendar && (
            <div className="mt-2">
              <Calendar
                itemDates={itemDates}
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
              />
            </div>
          )}

          {selectedDate && !showCalendar && (
            <div className="mt-1 flex justify-end">
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-indigo-400 underline"
              >
                絞り込みを解除
              </button>
            </div>
          )}
        </div>

        <AddItemForm onAdd={addItem} priceHistory={priceHistory} />

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-5xl mb-3">{selectedDate ? '📅' : '🛍️'}</p>
            <p className="text-base">商品がありません</p>
            <p className="text-sm mt-1">
              {selectedDate ? 'この日に追加した商品はありません' : '上のフォームから追加してください'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-50">
            {unchecked.map(item => (
              <ShoppingItemRow
                key={item.id}
                item={item}
                onToggle={toggleItem}
                onDelete={deleteItem}
                onEdit={setEditingItem}
              />
            ))}

            {checked.length > 0 && (
              <>
                {unchecked.length > 0 && (
                  <div className="px-4 py-2 bg-gray-50">
                    <span className="text-xs text-gray-400 font-medium">購入済み</span>
                  </div>
                )}
                {checked.map(item => (
                  <ShoppingItemRow
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    onEdit={setEditingItem}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </main>

      {/* 編集モーダル */}
      {editingItem && (
        <EditItemModal
          item={editingItem}
          onSave={editItem}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  )
}
