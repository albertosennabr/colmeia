import { useEffect, useState } from 'react'
import { supabase, type Conteudo } from '../lib/supabase'
import { useColmeia, pilarPorSlug } from '../lib/contexto'
import { Nav } from '../components/Nav'
import { Player } from '../components/Player'

const SECOES: [Conteudo['tipo'], string][] = [
  ['apostila', 'Apostila'],
  ['meditacao', 'Meditações'],
  ['audio', 'Áudios da Paula'],
  ['video', 'Vídeos'],
]

export function Biblioteca() {
  const { pilares } = useColmeia()
  const [conteudos, setConteudos] = useState<Conteudo[]>([])

  useEffect(() => {
    supabase.from('conteudos').select('*').order('criado_em').then(({ data }) => setConteudos(data ?? []))
  }, [])

  return (
    <>
      <main className="tela tela-com-nav">
        <h1>Biblioteca</h1>
        {SECOES.map(([tipo, titulo]) => {
          const itens = conteudos.filter((c) => c.tipo === tipo)
          if (!itens.length) return null
          return (
            <div key={tipo} className="secao">
              <h2>{titulo}</h2>
              {itens.map((c) => (
                <Player key={c.id} c={c} subtitulo={c.descricao || pilarPorSlug(pilares, c.pilar_slug)?.nome} />
              ))}
            </div>
          )
        })}
      </main>
      <Nav />
    </>
  )
}
