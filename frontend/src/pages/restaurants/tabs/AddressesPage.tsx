import { useState } from 'react'
import { Plus } from 'lucide-react'
import api from '../../../lib/api'

export default function AddressesPage(){
  const [enderecos] = useState([
    { id:'e1', apelido:'Matriz', cep:'79000-000', rua:'Rua A', numero:'100', cidade:'Campo Grande', uf:'MS', freteFixo:5, freteKm:2.5 },
  ])

  async function addAddress(){
    await api.post('/restaurants/me/addresses', {
      apelido: 'Matriz',
      cep: '79000-000',
      rua: 'Rua A',
      numero: '100',
      cidade: 'Campo Grande',
      uf: 'MS',
      freteFixo: 5,
      freteKm: 2.5
    })
    alert('Endereço criado na API!')
  }

  return (
    <section className="grid gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Endereços de Retirada/Entrega</h2>
        <button className="btn-primary" onClick={addAddress}><Plus className="size-4"/>Novo endereço</button>
      </header>
      <div className="grid gap-3">
        {enderecos.map(e => (
          <article key={e.id} className="card grid gap-2">
            <div className="flex flex-wrap gap-2 text-sm">
              <span className="font-semibold">{e.apelido}</span>
              <span className="opacity-70">CEP {e.cep}</span>
              <span className="opacity-70">{e.rua}, {e.numero} — {e.cidade}/{e.uf}</span>
            </div>
            <div className="text-sm opacity-80">
              Frete: R$ {e.freteFixo.toFixed(2)} (fixo) + R$ {e.freteKm.toFixed(2)} / km
            </div>
          </article>
        ))}
      </div>
      <p className="text-sm opacity-70">(O cálculo final usará a distância da API de rotas; integração será adicionada na próxima etapa.)</p>
    </section>
  )
}