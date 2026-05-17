'use client'

import { useState, useEffect, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (data: unknown) => data is T,
) {
  const [value, setValue] = useState<T>(initialValue)
  const [loaded, setLoaded] = useState(false)
  const [storageError, setStorageError] = useState<string | null>(null)

  useEffect(() => {
    setLoaded(false)
    try {
      const stored = localStorage.getItem(key)
      if (stored !== null) {
        const parsed: unknown = JSON.parse(stored)
        if (validate && !validate(parsed)) {
          setValue(initialValue)
        } else {
          setValue(parsed as T)
        }
      } else {
        setValue(initialValue)
      }
    } catch {
      setValue(initialValue)
    }
    setLoaded(true)
  // initialValue を deps に含めると参照型で無限ループになるため除外
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const set = useCallback((newValue: T | ((prev: T) => T)) => {
    setValue(prev => {
      const next = typeof newValue === 'function' ? (newValue as (prev: T) => T)(prev) : newValue
      try {
        setStorageError(null)
        localStorage.setItem(key, JSON.stringify(next))
      } catch (e) {
        if (e instanceof DOMException && e.name === 'QuotaExceededError') {
          setStorageError('ストレージの空き容量が不足しています。購入済み商品を削除してください。')
        }
      }
      return next
    })
  }, [key])

  return [value, set, loaded, storageError] as const
}
