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

    // Caso 1: O item JÁ existe no carrinho
    if (exists) {
      const newQty = exists.qtd + i.qtd // Calcula a nova quantidade

      // Se a nova quantidade for 0 ou menor, remove o item
      if (newQty <= 0) {
        return { items: s.items.filter(x => x.itemId !== i.itemId) }
      }

      // Senão, apenas atualiza a quantidade
      return { 
        items: s.items.map(x => x.itemId === i.itemId ? { ...x, qtd: newQty } : x) 
      }
    }

    // Caso 2: O item NÃO existe no carrinho
    // Só adiciona se a quantidade inicial for positiva
    if (i.qtd > 0) {
      return { items: [...s.items, i] }
    }
    
    // Se não existe e a qtd é <= 0, não faz nada
    return s
  }),
  removeItem: (itemId) => set((s) => ({ items: s.items.filter(x => x.itemId !== itemId) })),
  setDistance: (km) => set({ distanceKm: km }),
  clear: () => set({ restaurantId: undefined, items: [], distanceKm: 0 })
}))
