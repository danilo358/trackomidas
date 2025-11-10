import { Star } from 'lucide-react'

const avals = [
  { id:'a1', nota:5, autor:'Paula', texto:'Entrega rápida e pizza excelente!' },
  { id:'a2', nota:4, autor:'Diego', texto:'Muito bom, só atrasou 10 min.' },
]

export default function ReviewsPage(){
  return (
    <section className="grid gap-4">
      <h2 className="text-xl font-semibold">Avaliações</h2>
      <div className="grid gap-3">
        {avals.map(a => (
          <article key={a.id} className="card">
            <div className="flex items-center gap-2">
              {Array.from({length:a.nota}).map((_,i)=>(<Star key={i} className="size-4 text-amber-300 fill-amber-300"/>))}
              <span className="text-sm opacity-70">por {a.autor}</span>
            </div>
            <p className="mt-2 opacity-90">{a.texto}</p>
          </article>
        ))}
      </div>
    </section>
  )
}