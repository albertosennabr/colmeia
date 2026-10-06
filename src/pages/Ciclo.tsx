import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, type Conteudo, type Roda } from '../lib/supabase'
import { cicloAtual, pilarPorSlug, useColmeia } from '../lib/contexto'
import { diaRoda, horaRoda, periodoCiclo } from '../lib/formato'
import { Hexagono } from '../components/Hexagono'
import { Player } from '../components/Player'
import { EtiquetaPilar, EtiquetaStatus, Esqueleto } from '../components/Partes'

export function PaginaCiclo() {
  const { numero } = useParams()
  const { pilares, ciclos } = useColmeia()
  const ciclo = numero ? ciclos.find((c) => c.numero === Number(numero)) : cicloAtual(ciclos)
  const [rodas, setRodas] = useState<Roda[] | null>(null)
  const [materiais, setMateriais] = useState<Conteudo[]>([])
  const [aberta, setAberta] = useState<number | null>(null)

  useEffect(() => {
    if (!ciclo) return
    setRodas(null)
    supabase.from('rodas').select('*').eq('ciclo_id', ciclo.id).order('ordem').then(({ data }) => setRodas(data ?? []))
    supabase.from('conteudos').select('*').eq('ciclo_id', ciclo.id).order('criado_em').then(({ data }) => setMateriais(data ?? []))
  }, [ciclo])

  if (!ciclo) return <p className="vazio">Ainda não há ciclos.</p>

  const agora = Date.now()
  const lista = rodas ?? []
  const feitas = lista.filter((r) => new Date(r.data).getTime() < agora).length
  const pct = lista.length ? Math.round((feitas / lista.length) * 100) : 0
  const abertaId = aberta ?? lista[feitas]?.id ?? null

  return (
    <>
      <header style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="rotulo">Ciclo {ciclo.numero} · {periodoCiclo(ciclo)}</span>
          <EtiquetaStatus status={ciclo.status} />
        </div>
        <h1>{ciclo.titulo}</h1>
        <p className="texto" style={{ maxWidth: 720 }}>{ciclo.tema}</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="suave" style={{ alignSelf: 'center', marginRight: 4 }}>Pilares deste ciclo:</span>
          {ciclo.pilares.map((s) => <EtiquetaPilar key={s} pilar={pilarPorSlug(pilares, s)} />)}
        </div>
      </header>

      <div className="grade-lado">
        <section className="secao" aria-labelledby="t-rodas">
          <div className="linha-titulo">
            <h2 id="t-rodas">As {lista.length || 8} rodas do ciclo</h2>
            <span className="suave">{feitas} de {lista.length} feitas</span>
          </div>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--linha)', overflow: 'hidden' }} role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso do ciclo">
            <div style={{ width: `${pct}%`, height: 8, background: 'var(--ouro)' }} />
          </div>

          {rodas === null && <><Esqueleto /><Esqueleto /><Esqueleto /></>}

          <ol style={{ listStyle: 'none', margin: 0, padding: 0 }}>
            {lista.map((r, i) => {
              const pilar = pilarPorSlug(pilares, r.pilar_slug)
              const estado = i < feitas ? 'feita' : i === feitas ? 'proxima' : 'depois'
              const cor = estado === 'depois' ? 'var(--linha)' : pilar?.cor ?? 'var(--espresso)'
              const tinta = estado === 'depois' ? 'var(--texto-suave)' : pilar?.tinta ?? 'var(--creme)'
              const expandida = abertaId === r.id
              return (
                <li key={r.id} style={{ display: 'flex', gap: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 36, flex: 'none' }}>
                    <div className="hex" style={{ width: 36, height: 42, background: cor, color: tinta, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, flex: 'none' }}>{r.ordem}</div>
                    {i < lista.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 10, background: estado === 'feita' ? 'var(--ouro)' : 'var(--linha)' }} />}
                  </div>
                  <div style={{
                    flex: 1, minWidth: 0, marginBottom: 12, borderRadius: 16,
                    background: expandida ? 'var(--branco)' : 'transparent',
                    border: `2px solid ${estado === 'proxima' ? 'var(--terracota)' : expandida ? 'var(--linha)' : 'transparent'}`,
                  }}>
                    <button
                      onClick={() => setAberta(expandida ? -1 : r.id)}
                      aria-expanded={expandida}
                      style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 4 }}
                    >
                      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'flex-start' }}>
                        <span style={{ fontFamily: 'Petrona, serif', fontWeight: 700, fontSize: 18, lineHeight: 1.25 }}>{r.titulo}</span>
                        {estado === 'proxima' && <span className="etiqueta" style={{ background: 'var(--terracota)', color: 'var(--branco)' }}>Próxima</span>}
                        {estado === 'feita' && <span className="etiqueta" style={{ background: 'var(--areia)', color: 'var(--musgo)' }}>Feita</span>}
                      </span>
                      <span className="suave">{diaRoda(r.data)} · {horaRoda(r.data)}</span>
                    </button>
                    {expandida && (
                      <div style={{ padding: '0 14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {pilar && <div><EtiquetaPilar pilar={pilar} /></div>}
                        {r.descricao && <p style={{ fontSize: 16, lineHeight: 1.5 }}>{r.descricao}</p>}
                        {r.pratica && <p style={{ fontSize: 15, lineHeight: 1.5 }}><b>A prática:</b> {r.pratica}</p>}
                        {r.grao_de_polen && <p style={{ fontSize: 15, lineHeight: 1.5 }}><b>Grão de Pólen:</b> {r.grao_de_polen}</p>}
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                          {r.link_ao_vivo && estado !== 'feita' && <a className="botao botao-pequeno" href={r.link_ao_vivo} target="_blank" rel="noopener">Entrar na roda</a>}
                          {r.gravacao_url && <a className="botao botao-claro botao-pequeno" href={r.gravacao_url} target="_blank" rel="noopener">Ouvir a fala da Paula</a>}
                          {!r.link_ao_vivo && estado !== 'feita' && <span className="suave">O link da roda aparece aqui perto da data.</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              )
            })}
          </ol>
        </section>

        <aside className="secao" style={{ gap: 20 }}>
          <div className="cartao" style={{ alignItems: 'center', gap: 12 }}>
            <span className="rotulo" style={{ alignSelf: 'flex-start' }}>Onde este ciclo pousa</span>
            <Hexagono pilares={pilares} largura={72} foco={ciclo.pilares} centro={{ rotulo: 'Ciclo', titulo: String(ciclo.numero), para: '/proposta' }} />
          </div>
          {materiais.length > 0 && (
            <section className="secao" aria-labelledby="t-materiais">
              <h2 id="t-materiais">Materiais do ciclo</h2>
              {materiais.map((c) => <Player key={c.id} c={c} />)}
            </section>
          )}
          <Link to="/ciclos" style={{ fontWeight: 700 }}>Ver todos os ciclos</Link>
        </aside>
      </div>
    </>
  )
}
