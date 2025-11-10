import { create } from 'zustand'
import api from '../lib/api'

export type Role = 'ADMIN' | 'RESTAURANTE' | 'CLIENTE' | 'ENTREGADOR' | null

type AuthState = {
  role: Role
  nome?: string
  token?: string
  login: (email: string, senha: string) => Promise<void>
  loginDev: (r: Exclude<Role, null>, nome?: string) => void
  fetchMe: () => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  role: null,
  token: undefined,
  async login(email, senha) {
    const r = await api.post('/auth/login', { email, senha })
    set({ role: r.data.role, nome: r.data.nome })
  },
  loginDev: (r, nome) => set({ role: r, nome }),
  async fetchMe() {
    const r = await api.get('/auth/me')
    if (r.data?.user) set({ role: r.data.user.role, nome: r.data.user.nome })
  },
  async logout() {
    await api.post('/auth/logout')
    set({ role: null, token: undefined, nome: undefined })
  }
}))