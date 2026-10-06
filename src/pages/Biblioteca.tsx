import { useEffect, useState } from 'react'
import { supabase, type Conteudo, type TipoConteudo } from '../lib/supabase'
import { useColmeia } from '../lib/contexto'
import { Player } from '../components/Player'
import { CabecalhoPagina, Esqueleto } from '../components/Partes'

const SECOES: [TipoConteudo, string, string][] = [
  ['grao', 'Grãos de Pólen', 'Áudios curtos da Paula, entre uma roda e outra.'],
  ['meditacao', 'Meditações', ''],
  ['audio', 'Áudios e falas das rodas', ''],
  ['video', 'Vídeos', ''],
  ['apostila', 'Apostilas', ''],
]

export function Biblioteca() {
  const { pilares } = useColmeia()
  const [conteudos, setConteudos] = useState<Conteudo[] | null>(null)
  const [filtro, setFiltro] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('conteudos').select('*').order('criado_em', { ascending: false }).then(({ data }) => setConteudos(data ?? []))
  }, [])

  const visiveis = (conteudos ?? []).filter((c) => !filtro || c.pilar_slug === filtro)

  return (
    <>
      <CabecalhoPagina rotulo="Para ouvir, ler e praticar" titulo="Biblioteca" />

      <div className="chips" role="group" aria-label="Filtrar por pilar">
        <button className={`chip ${!filtro ? 'chip-ativo' : ''}`} aria-pressed={!filtro} onClick={() => setFiltro(null)}>Tudo</button>
        {pilares.map((p) => (
          <button key={p.slug} className={`chip ${filtro === p.slug ? 'chip-ativo' : ''}`} aria-pressed={filtro === p.slug} onClick={() => setFiltro(p.slug)}>{p.nome}</button>
        ))}
      </div>

      {conteudos === null && <div className="grade-2"><Esqueleto altura={200} /><Esqueleto altura={200} /></div>}
      {conteudos && visiveis.length === 0 && <p className="vazio">Nada aqui ainda para este pilar.</p>}

      <div className="grade-2">
        {SECOES.map(([tipo, titulo, sub]) => {
          const itens = visiveis.filter((c) => c.tipo === tipo)
          if (!itens.length) return null
          return (
            <section key={tipo} className="secao">
              <div className="secao" style={{ gap: 2 }}>
                <h2>{titulo}</h2>
                {sub && <span className="suave">{sub}</span>}
              </div>
              {itens.map((c) => <Player key={c.id} c={c} />)}
            </section>
          )
        })}
      </div>
    </>
  )
}
