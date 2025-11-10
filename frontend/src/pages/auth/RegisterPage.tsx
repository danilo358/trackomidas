import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../lib/api'
import { useAuthStore } from '../../stores/auth'

export default function RegisterPage() {
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [loading, setLoading] = useState(false)
  const nav = useNavigate()
  const fetchMe = useAuthStore(s=>s.fetchMe)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      await api.post('/auth/register', { nome, email, senha })
      await fetchMe()
      nav('/cliente', { replace: true })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell grid place-items-center">
      <div className="login-bg" />
      <div className="w-full max-w-md mx-auto p-6 card relative">
        <h1 className="text-2xl font-semibold mb-1">Criar conta</h1>
        <p className="opacity-70 mb-6">Registre-se para começar a pedir.</p>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label className="label">Nome</label>
            <input className="input" value={nome} onChange={e=>setNome(e.target.value)} placeholder="Seu nome" required />
          </div>
          <div>
            <label className="label">E-mail</label>
            <input className="input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="voce@exemplo.com" required />
          </div>
          <div>
            <label className="label">Senha</label>
            <input className="input" type="password" value={senha} onChange={e=>setSenha(e.target.value)} placeholder="••••••••" required />
          </div>
          <div className="flex gap-2">
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? 'Criando…' : 'Criar conta'}</button>
            <a className="btn-ghost" href="/login">Já tenho conta</a>
          </div>
        </form>
      </div>
    </div>
  )
}
