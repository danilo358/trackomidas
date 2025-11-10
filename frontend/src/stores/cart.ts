import { create } from 'zustand'

export type CartItem = { itemId: string; nome: string; qtd: number; preco: number }
export type CartState = {
  restaurantId?: string
  items: CartItem[]
  distanceKm: number
  setRestaurant: (id: string) => void
  addItem: (i: CartItem) => void
  removeItem: (itemId: string) => void
  setDistance: (km: number) => void
  clear: () => void
}

export const useCart = create<CartState>((set) => ({
  restaurantId: undefined,
  items: [],
  distanceKm: 0,
  setRestaurant: (id) => set({ restaurantId: id, items: [] }),
  addItem: (i) => set((s) => {
    const exists = s.items.find(x => x.itemId === i.itemId)
    if (exists) {
      return { items: s.items.map(x => x.itemId === i.itemId ? { ...x, qtd: x.qtd + i.qtd } : x) }
    }
    return { items: [...s.items, i] }
  }),
  removeItem: (itemId) => set((s) => ({ items: s.items.filter(x => x.itemId !== itemId) })),
  setDistance: (km) => set({ distanceKm: km }),
  clear: () => set({ restaurantId: undefined, items: [], distanceKm: 0 })
}))
