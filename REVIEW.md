# コードレビュー: shopping-list

レビュー対象: `app/` および `lib/` 配下の全ファイル

---

## 1. バグチェック

### 🔴 高: `useLocalStorage` の `key` 変更時に古い値が残る

**ファイル:** `lib/useLocalStorage.ts:9-19`

```ts
useEffect(() => {
  const stored = localStorage.getItem(key)
  if (stored !== null) {
    setValue(JSON.parse(stored))
  }
  setLoaded(true)
}, [key])
```

`key` が変わったとき、`setValue` で新しいキーの値に上書きするが、`loaded` は既に `true` のままのため再度 `false` にリセットされない。現状は `key` が固定なので顕在化していないが、フック仕様として不完全。

**修正案:** `key` 変更時に `setLoaded(false)` をリセットする。

---

### 🟡 中: `useLocalStorage` の `set` 関数が毎レンダーで再生成される

**ファイル:** `lib/useLocalStorage.ts:21-31`

`set` 関数は `useCallback` でメモ化されていないため、親コンポーネントの再レンダー時に毎回新しい参照が生成される。`ShoppingList` では `addItem` / `toggleItem` / `deleteItem` がすべて `setItems` に依存しているため、子コンポーネントへのプロップス変化が連鎖する。

**修正案:** `set` を `useCallback` でラップする。

---

### 🟡 中: `AddItemForm` — フォームを閉じても入力途中の状態が残る

**ファイル:** `app/components/AddItemForm.tsx:28`

フォームのトグルボタンで `open` を `false` にしても `name` と `categoryId` の state はリセットされない。次に開いたとき前回の入力が残った状態になる。

**修正案:** `setOpen(false)` 時に `setName('')` と `setCategoryId('other')` を同時にリセットする。

---

### 🟡 中: `ShoppingList` — 毎レンダーで `items.filter` を3回実行

**ファイル:** `app/components/ShoppingList.tsx:45-54`

```ts
const filtered = (...).slice().sort(...)
const unchecked = filtered.filter(i => !i.checked)
const checked = filtered.filter(i => i.checked)
const totalChecked = items.filter(i => i.checked).length  // ← 別途もう1回
```

`totalChecked` は `checked.length` で代替できるが、`filtered` はカテゴリ絞り込み後の配列のため `items` 全体の購入済み数と一致しないケースがある（カテゴリフィルター中）。現状の `items.filter` は正しい挙動だが、`unchecked` と `checked` の分割は `reduce` 1回にまとめられる。

---

### 🟢 低: `crypto.randomUUID()` の互換性

**ファイル:** `app/components/ShoppingList.tsx:17`

`crypto.randomUUID()` は iOS 15.4 未満・Android Chrome 92 未満で未サポート。ターゲットが古い端末の場合は `uuid` ライブラリや `Math.random()` ベースのフォールバックが必要。

---

## 2. セキュリティチェック

### 🟢 問題なし: XSS リスク

React の JSX はデフォルトでエスケープを行うため、`item.name` 等のユーザー入力が直接 DOM に挿入されても XSS は発生しない。`dangerouslySetInnerHTML` は使用されていない。

---

### 🟡 中: `localStorage` のデータ検証なし

**ファイル:** `lib/useLocalStorage.ts:12-13`

```ts
setValue(JSON.parse(stored))
```

`localStorage` の値は外部から書き換え可能（DevTools・拡張機能等）。壊れたJSON や型が異なるデータをそのまま `setValue` しているため、実行時エラーや予期しない挙動の原因になりうる。

**修正案:** `zod` 等でパース後にスキーマ検証を行い、不正データは `initialValue` にフォールバックする。

---

### 🟡 中: `localStorage` のストレージ容量超過が無音で失敗する

**ファイル:** `lib/useLocalStorage.ts:25`

```ts
} catch {
  // ignore
}
```

`localStorage.setItem` は容量超過（通常5MB）で `QuotaExceededError` を投げるが、現実装ではサイレントに無視している。ユーザーには保存が失敗したことが伝わらない。

**修正案:** エラーをキャッチしてトースト通知などでユーザーに通知する。

---

### 🟢 低: `maximumScale: 1` によるアクセシビリティ制限

**ファイル:** `app/layout.tsx:13`

```ts
maximumScale: 1,
```

視力の弱いユーザーがブラウザのピンチズームを使えなくなる。WCAG 2.1 の Success Criterion 1.4.4 に抵触する可能性がある。

**修正案:** 削除するか `maximumScale: 5` に変更する。

---

## 3. パフォーマンスチェック

### 🟡 中: ソートが毎レンダーで実行される

**ファイル:** `app/components/ShoppingList.tsx:45-50`

`filtered` の生成（filter + slice + sort）はレンダーのたびに実行される。アイテム数が少ない現状では問題ないが、`useMemo` でメモ化するのが望ましい。

```ts
const filtered = useMemo(() => (
  (selectedCategory === 'all' ? items : items.filter(...))
    .slice()
    .sort(...)
), [items, selectedCategory, sortOrder])
```

---

### 🟡 中: `ShoppingItem` が `React.memo` でラップされていない

**ファイル:** `app/components/ShoppingItem.tsx`

`ShoppingList` のいずれかのアイテムをチェックすると `items` 配列全体が新しい参照になり、全 `ShoppingItemRow` が再レンダーされる。`React.memo` でラップすることで、変更されたアイテムのみ再レンダーに絞れる。

---

### 🟢 低: `CategoryFilter` の `counts` 計算が毎レンダーで実行される

**ファイル:** `app/components/ShoppingList.tsx:38-43`

`counts` オブジェクトの生成は `useMemo` でメモ化できる。

---

### 🟢 低: フォントの最適化未設定

`next/font` が使用されていないため、システムフォントにフォールバックしている。明示的に指定する場合は `next/font/google` を利用するとフォント最適化（preload・self-hosting）が自動で行われる。

---

## 4. 改善提案

| 優先度 | 提案 | 対象ファイル |
|--------|------|------------|
| 高 | `localStorage` のデータをスキーマ検証する（`zod` 推奨） | `lib/useLocalStorage.ts` |
| 高 | ストレージ保存失敗をユーザーに通知する | `lib/useLocalStorage.ts` |
| 中 | `filtered` と `counts` を `useMemo` でメモ化する | `ShoppingList.tsx` |
| 中 | `ShoppingItem` を `React.memo` でラップする | `ShoppingItem.tsx` |
| 中 | フォームを閉じたときに入力をリセットする | `AddItemForm.tsx` |
| 中 | `maximumScale: 1` を削除しアクセシビリティを確保する | `layout.tsx` |
| 低 | `crypto.randomUUID()` にフォールバックを追加する | `ShoppingList.tsx` |
| 低 | `useLocalStorage` の `set` を `useCallback` でメモ化する | `lib/useLocalStorage.ts` |
| 低 | 商品名の最大文字数制限を追加する（UX改善） | `AddItemForm.tsx` |
| 低 | 削除ボタンに確認ダイアログを追加する（誤操作防止） | `ShoppingItem.tsx` |
