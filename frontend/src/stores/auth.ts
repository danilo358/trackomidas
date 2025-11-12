import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Role = 'ADMIN'|'RESTAURANTE'|'ENTREGADOR'|'CLIENTE'
export type User = { id: string; nome: string; role: Role }
const API = import.meta.env.VITE_API ?? 'http://localhost:3333'

type State = {
  user?: User
  role?: Role
  ready: boolean
  login: (email: string, senha: string) => Promise<void>
  check: () => Promise<void>
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<State>()(
  persist(
    (set, get) => ({
      user: undefined,
      role: undefined,
      ready: false,

      async login(email, senha) {
        const r = await fetch(`${API}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, senha }),
          credentials: 'include',
        })
        if (!r.ok) {
          const err = await r.json().catch(() => ({}))
          throw new Error(err?.error || 'Falha no login')
        }
        const u = (await r.json()) as User
        set({ user: u, role: u.role })
      },

      async check() {
        try {
          const r = await fetch(`${API}/auth/me`, { credentials: 'include' })
          if (r.ok) {
            const u = (await r.json()) as User
            set({ user: u, role: u.role, ready: true })
          } else {
            set({ user: undefined, role: undefined, ready: true })
          }
        } catch {
          set({ ready: true })
        }
      },

      async fetchMe() {
        return get().check()
      },

      async logout() {
        await fetch(`${API}/auth/logout`, { method: 'POST', credentials: 'include' })
        set({ user: undefined, role: undefined })
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({ user: s.user, role: s.role }),
    }
  )
)
