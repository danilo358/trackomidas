import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../stores/auth'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const login = useAuthStore(s => s.login)
  const nav = useNavigate()
  const { state } = useLocation() as { state?: { from?: string } }

  async function doLogin(e: FormEvent) {
    e.preventDefault()
    await login(email, senha)
    const role = useAuthStore.getState().role
    const destino =
    role === 'RESTAURANTE' ? '/restaurante/pedidos'
    : role === 'ENTREGADOR'  ? '/entregador/pedidos'
    : '/restaurantes'
    nav(state?.from || destino, { replace: true })
    }

  return (
    <div className="app-shell grid place-items-center">
      <div className="login-bg" />
      <div className="w-full max-w-md mx-auto p-6 card relative">
        <h1 className="text-2xl font-semibold mb-1">Entrar</h1>
        <p className="opacity-70 mb-6">Acesse sua conta para gerenciar pedidos.</p>
        <form className="space-y-4" onSubmit={doLogin}>
          <div>
            <label className="label">E-mail</label>
            <input className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="voce@exemplo.com" />
          </div>
          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button className="btn-primary" type="submit">Entrar</button>
            <a href="/register" className="btn-ghost">Criar conta</a>
          </div>
        </form>
      </div>
    </div>
  )
}