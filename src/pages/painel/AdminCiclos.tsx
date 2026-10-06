import { useEffect, useState, type FormEvent } from 'react'
import { supabase, NOMES_STATUS, type Ciclo, type Roda, type StatusCiclo } from '../../lib/supabase'
import { useColmeia } from '../../lib/contexto'
import { diaRoda } from '../../lib/formato'

// O Brasil não tem mais horário de verão: Brasília é sempre UTC-3.
const paraCampo = (iso: string) => {
  const d = new Date(new Date(iso).getTime() - 3 * 3600e3)
  return d.toISOString().slice(0, 16)
}
const doCampo = (v: string) => new Date(`${v}:00-03:00`).toISOString()

type FormCiclo = Omit<Ciclo, 'id'> & { id?: number }

const vazio = (numero: number): FormCiclo => ({
  numero, titulo: '', tema: '', pilares: [], inicio: '', fim: '', vagas: 30, status: 'em_breve',
})

export function AdminCiclos() {
  const { pilares, ciclos, recarregarBase, avisar } = useColmeia()
  const [selecionado, setSelecionado] = useState<number | 'novo'>(ciclos[0]?.id ?? 'novo')
  const ciclo = ciclos.find((c) => c.id === selecionado)
  const [form, setForm] = useState<FormCiclo>(ciclo ?? vazio(ciclos.length + 1))
  const [rodas, setRodas] = useState<Roda[]>([])
  const [aberta, setAberta] = useState<number | null>(null)

  useEffect(() => {
    setForm(ciclo ?? vazio(ciclos.length + 1))
    if (ciclo) supabase.from('rodas').select('*').eq('ciclo_id', ciclo.id).order('ordem').then(({ data }) => setRodas(data ?? []))
    else setRodas([])
  }, [selecionado, ciclos]) // eslint-disable-line react-hooks/exhaustive-deps

  const muda = <K extends keyof FormCiclo>(k: K, v: FormCiclo[K]) => setForm((f) => ({ ...f, [k]: v }))
  const alternaPilar = (slug: string) => muda('pilares', form.pilares.includes(slug) ? form.pilares.filter((s) => s !== slug) : [...form.pilares, slug])

  async function salvarCiclo(e: FormEvent) {
    e.preventDefault()
    const { id, ...dados } = form
    const r = id
      ? await supabase.from('ciclos').update(dados).eq('id', id).select().single()
      : await supabase.from('ciclos').insert(dados).select().single()
    if (r.error) { avisar('Não salvou: ' + r.error.message); return }
    await recarregarBase()
    setSelecionado(r.data.id)
    avisar('Ciclo salvo')
  }

  async function apagarCiclo() {
    if (!ciclo || !confirm(`Apagar o ciclo ${ciclo.numero} e todas as rodas dele?`)) return
    await supabase.from('ciclos').delete().eq('id', ciclo.id)
    await recarregarBase()
    setSelecionado('novo')
    avisar('Ciclo apagado')
  }

  async function novaRoda() {
    if (!ciclo) return
    const ultima = rodas[rodas.length - 1]
    const data = ultima ? new Date(new Date(ultima.data).getTime() + 14 * 864e5).toISOString() : doCampo(`${ciclo.inicio}T17:00`)
    const { data: nova, error } = await supabase.from('rodas').insert({ ciclo_id: ciclo.id, ordem: (ultima?.ordem ?? 0) + 1, titulo: 'Nova roda', data }).select().single()
    if (error) { avisar('Não criou: ' + error.message); return }
    setRodas([...rodas, nova])
    setAberta(nova.id)
  }

  async function salvarRoda(r: Roda) {
    const { id, ...dados } = r
    const { error } = await supabase.from('rodas').update(dados).eq('id', id)
    avisar(error ? 'Não salvou: ' + error.message : 'Roda salva')
  }

  async function apagarRoda(r: Roda) {
    if (!confirm(`Apagar a roda “${r.titulo}”?`)) return
    await supabase.from('rodas').delete().eq('id', r.id)
    setRodas(rodas.filter((x) => x.id !== r.id))
    avisar('Roda apagada')
  }

  const mudaRoda = (id: number, campo: keyof Roda, valor: string | null) =>
    setRodas(rodas.map((r) => (r.id === id ? { ...r, [campo]: valor } : r)))

  return (
    <div className="secao" style={{ gap: 24, paddingTop: 8 }}>
      <div className="chips" role="group" aria-label="Escolher ciclo">
        {ciclos.map((c) => (
          <button key={c.id} className={`chip ${selecionado === c.id ? 'chip-ativo' : ''}`} onClick={() => setSelecionado(c.id)}>Ciclo {c.numero} · {c.titulo}</button>
        ))}
        <button className={`chip ${selecionado === 'novo' ? 'chip-ativo' : ''}`} onClick={() => setSelecionado('novo')}>+ Novo ciclo</button>
      </div>

      <form onSubmit={salvarCiclo} className="cartao" style={{ gap: 18 }}>
        <h2>{ciclo ? `Ciclo ${ciclo.numero}` : 'Novo ciclo'}</h2>
        <div className="formulario formulario-2">
          <div className="campo">
            <label htmlFor="c-titulo">Título do ciclo</label>
            <input id="c-titulo" className="entrada" value={form.titulo} onChange={(e) => muda('titulo', e.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor="c-num">Número</label>
            <input id="c-num" className="entrada" type="number" min={1} value={form.numero} onChange={(e) => muda('numero', Number(e.target.value))} required />
          </div>
          <div className="campo ocupa-tudo">
            <label htmlFor="c-tema">Tema: o que este ciclo propõe</label>
            <textarea id="c-tema" className="entrada" value={form.tema} onChange={(e) => muda('tema', e.target.value)} />
          </div>
          <fieldset className="campo ocupa-tudo" style={{ border: 'none', padding: 0, margin: 0 }}>
            <legend className="legenda" style={{ paddingBottom: 6 }}>Pilares que o ciclo aprofunda</legend>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {pilares.map((p) => {
                const ativo = form.pilares.includes(p.slug)
                return (
                  <button type="button" key={p.slug} aria-pressed={ativo} onClick={() => alternaPilar(p.slug)} className="chip"
                    style={ativo ? { background: p.cor, color: p.tinta, borderColor: p.cor } : undefined}>{p.nome}</button>
                )
              })}
            </div>
          </fieldset>
          <div className="campo">
            <label htmlFor="c-ini">Começa em</label>
            <input id="c-ini" className="entrada" type="date" value={form.inicio} onChange={(e) => muda('inicio', e.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor="c-fim">Termina em</label>
            <input id="c-fim" className="entrada" type="date" value={form.fim} onChange={(e) => muda('fim', e.target.value)} required />
          </div>
          <div className="campo">
            <label htmlFor="c-vagas">Vagas</label>
            <input id="c-vagas" className="entrada" type="number" min={1} value={form.vagas ?? ''} onChange={(e) => muda('vagas', e.target.value ? Number(e.target.value) : null)} />
          </div>
          <div className="campo">
            <label htmlFor="c-status">Situação</label>
            <select id="c-status" className="entrada" value={form.status} onChange={(e) => muda('status', e.target.value as StatusCiclo)}>
              {Object.entries(NOMES_STATUS).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <button className="botao" type="submit">{ciclo ? 'Salvar ciclo' : 'Criar ciclo'}</button>
          {ciclo && <button type="button" className="botao-texto botao-perigo" onClick={apagarCiclo}>Apagar ciclo</button>}
        </div>
      </form>

      {ciclo && (
        <section className="secao">
          <div className="linha-titulo">
            <h2>As rodas do ciclo {ciclo.numero}</h2>
            <button className="botao botao-claro botao-pequeno" onClick={novaRoda}>+ Nova roda</button>
          </div>
          <p className="suave">As rodas são os encontros quinzenais que formam o ciclo. Horários em Brasília; o app mostra Lisboa sozinho.</p>
          {rodas.map((r) => (
            <div key={r.id} className="cartao" style={{ gap: 12 }}>
              <button onClick={() => setAberta(aberta === r.id ? null : r.id)} aria-expanded={aberta === r.id}
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: 'none', border: 'none', padding: 0, textAlign: 'left' }}>
                <span><b>{r.ordem} · {r.titulo}</b><br /><span className="suave">{diaRoda(r.data)}{r.link_ao_vivo ? '' : ' · sem link'}{r.gravacao_url ? ' · com gravação' : ''}</span></span>
                <span className="suave">{aberta === r.id ? 'Fechar' : 'Editar'}</span>
              </button>
              {aberta === r.id && (
                <div className="formulario formulario-2">
                  <div className="campo"><label htmlFor={`r-t-${r.id}`}>Tema da roda</label><input id={`r-t-${r.id}`} className="entrada" value={r.titulo} onChange={(e) => mudaRoda(r.id, 'titulo', e.target.value)} /></div>
                  <div className="campo"><label htmlFor={`r-d-${r.id}`}>Data e hora (Brasília)</label><input id={`r-d-${r.id}`} className="entrada" type="datetime-local" value={paraCampo(r.data)} onChange={(e) => e.target.value && mudaRoda(r.id, 'data', doCampo(e.target.value))} /></div>
                  <div className="campo"><label htmlFor={`r-p-${r.id}`}>Pilar em foco</label>
                    <select id={`r-p-${r.id}`} className="entrada" value={r.pilar_slug ?? ''} onChange={(e) => mudaRoda(r.id, 'pilar_slug', e.target.value || null)}>
                      <option value="">Nenhum em especial</option>
                      {pilares.map((p) => <option key={p.slug} value={p.slug}>{p.nome}</option>)}
                    </select>
                  </div>
                  <div className="campo"><label htmlFor={`r-o-${r.id}`}>Ordem</label><input id={`r-o-${r.id}`} className="entrada" type="number" min={1} value={r.ordem} onChange={(e) => mudaRoda(r.id, 'ordem', e.target.value)} /></div>
                  <div className="campo ocupa-tudo"><label htmlFor={`r-ds-${r.id}`}>Sobre a roda</label><textarea id={`r-ds-${r.id}`} className="entrada" value={r.descricao} onChange={(e) => mudaRoda(r.id, 'descricao', e.target.value)} /></div>
                  <div className="campo"><label htmlFor={`r-pr-${r.id}`}>A prática</label><textarea id={`r-pr-${r.id}`} className="entrada" value={r.pratica} onChange={(e) => mudaRoda(r.id, 'pratica', e.target.value)} /></div>
                  <div className="campo"><label htmlFor={`r-g-${r.id}`}>Grão de Pólen</label><textarea id={`r-g-${r.id}`} className="entrada" value={r.grao_de_polen} onChange={(e) => mudaRoda(r.id, 'grao_de_polen', e.target.value)} /></div>
                  <div className="campo"><label htmlFor={`r-l-${r.id}`}>Link da roda ao vivo</label><input id={`r-l-${r.id}`} className="entrada" type="url" placeholder="https://meet.google.com/…" value={r.link_ao_vivo ?? ''} onChange={(e) => mudaRoda(r.id, 'link_ao_vivo', e.target.value || null)} /></div>
                  <div className="campo"><label htmlFor={`r-g2-${r.id}`}>Link da gravação da fala</label><input id={`r-g2-${r.id}`} className="entrada" type="url" value={r.gravacao_url ?? ''} onChange={(e) => mudaRoda(r.id, 'gravacao_url', e.target.value || null)} /></div>
                  <div className="ocupa-tudo" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <button className="botao botao-pequeno" onClick={() => salvarRoda(r)}>Salvar roda</button>
                    <button className="botao-texto botao-perigo" onClick={() => apagarRoda(r)}>Apagar roda</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </section>
      )}
    </div>
  )
}
