export type ViaCepResponse = {
  cep: string
  logradouro: string
  bairro: string
  localidade: string
  uf: string
  erro?: boolean
}

export async function fetchCep(cep: string): Promise<ViaCepResponse> {
  const clean = cep.replace(/\D/g, '')
  const r = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
  return r.json() as Promise<ViaCepResponse>
}
