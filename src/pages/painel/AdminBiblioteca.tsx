import { useEffect, useRef, useState, type DragEvent, type FormEvent } from 'react'
import { supabase, NOMES_TIPO, type Conteudo, type TipoConteudo } from '../../lib/supabase'
import { pilarPorSlug, useColmeia } from '../../lib/contexto'
import { dataCurta } from '../../lib/formato'
import { IconeEnviar } from '../../components/Icones'

const ACEITA = 'audio/*,video/*,application/pdf'
const LIMITE_MB = 50

function caminhoDoArquivo(nome: string) {
  const limpo = nome.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9.]+/g, '-').toLowerCase()
  return `${Date.now()}-${limpo}`
}

function tipoPeloArquivo(f: File): TipoConteudo {
  if (f.type === 'application/pdf') return 'apostila'
  if (f.type.startsWith('video/')) return 'video'
  return 'audio'
}

// Lê a duração de um áudio ou vídeo no próprio navegador, para a Paula não precisar digitar.
function duracaoEmMinutos(f: File): Promise<number | null> {
  if (!f.type.startsWith('audio/') && !f.type.startsWith('video/')) return Promise.resolve(null)
  return new Promise((ok) => {
    const el = document.createElement(f.type.startsWith('video/') ? 'video' : 'audio')
    el.preload = 'metadata'
    el.onloadedmetadata = () => { ok(Math.max(1, Math.round(el.duration / 60))); URL.revokeObjectURL(el.src) }
    el.onerror = () => ok(null)
    el.src = URL.createObjectURL(f)
  })
}

export async function enviarArquivo(f: File) {
  if (f.size > LIMITE_MB * 1024 * 1024) throw new Error(`O arquivo tem mais de ${LIMITE_MB} MB. Comprima ou divida antes de enviar.`)
  const caminho = caminhoDoArquivo(f.name)
  const { error } = await supabase.storage.from('biblioteca').upload(caminho, f, { contentType: f.type })
  if (error) throw new Error(error.message)
  return caminho
}

export function AdminBiblioteca() {
  const { pilares, ciclos, avisar } = useColmeia()
  const [conteudos, setConteudos] = useState<Conteudo[]>([])
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [arrastando, setArrastando] = useState(false)
  const [tipo, setTipo] = useState<TipoConteudo>('grao')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [pilar, setPilar] = useState('')
  const [ciclo, setCiclo] = useState('')
  const [duracao, setDuracao] = useState('')
  const [destaque, setDestaque] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState('')
  const seletor = useRef<HTMLInputElement>(null)

  async function carregar() {
    const { data } = await supabase.from('conteudos').select('*').order('criado_em', { ascending: false })
    setConteudos(data ?? [])
  }
  useEffect(() => { carregar() }, [])

  async function escolher(f: File | undefined) {
    if (!f) return
    setArquivo(f)
    setErro('')
    if (f.type === 'application/pdf') setTipo('apostila')
    else if (tipo === 'apostila') setTipo(tipoPeloArquivo(f))
    if (!titulo) setTitulo(f.name.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' '))
    const min = await duracaoEmMinutos(f)
    if (min) setDuracao(String(min))
  }

  function soltar(e: DragEvent) {
    e.preventDefault()
    setArrastando(false)
    escolher(e.dataTransfer.files[0])
  }

  async function publicar(e: FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro('')
    try {
      const caminho = arquivo ? await enviarArquivo(arquivo) : null
      if (destaque) await supabase.from('conteudos').update({ destaque: false }).eq('destaque', true)
      const { error } = await supabase.from('conteudos').insert({
        tipo, titulo: titulo.trim(), descricao: descricao.trim(), pilar_slug: pilar || null, ciclo_id: ciclo ? Number(ciclo) : null,
        duracao_min: duracao ? Number(duracao) : null, arquivo: caminho, destaque,
      })
      if (error) throw new Error(error.message)
      setArquivo(null); setTitulo(''); setDescricao(''); setDuracao(''); setDestaque(false)
      avisar('Publicado na biblioteca')
      carregar()
    } catch (err) {
      setErro((err as Error).message)
    } finally {
      setEnviando(false)
    }
  }

  async function trocarArquivo(c: Conteudo, f: File) {
    try {
      const caminho = await enviarArquivo(f)
      if (c.arquivo) await supabase.storage.from('biblioteca').remove([c.arquivo])
      const min = await duracaoEmMinutos(f)
      await supabase.from('conteudos').update({ arquivo: caminho, ...(min ? { duracao_min: min } : {}) }).eq('id', c.id)
      avisar('Arquivo enviado')
      carregar()
    } catch (err) {
      avisar((err as Error).message)
    }
  }

  async function destacar(c: Conteudo) {
    await supabase.from('conteudos').update({ destaque: false }).eq('destaque', true)
    if (!c.destaque) await supabase.from('conteudos').update({ destaque: true }).eq('id', c.id)
    avisar(c.destaque ? 'Tirado do destaque' : 'Agora é o destaque da semana')
    carregar()
  }

  async function apagar(c: Conteudo) {
    if (!confirm(`Apagar “${c.titulo}” da biblioteca? Isso não pode ser desfeito.`)) return
    if (c.arquivo) await supabase.storage.from('biblioteca').remove([c.arquivo])
    await supabase.from('conteudos').delete().eq('id', c.id)
    avisar('Apagado')
    carregar()
  }

  return (
    <div className="secao" style={{ gap: 28, paddingTop: 8 }}>
      <form onSubmit={publicar} className="cartao" style={{ gap: 18 }}>
        <h2>Publicar na biblioteca</h2>

        <div
          className={`soltar ${arrastando ? 'arrastando' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setArrastando(true) }}
          onDragLeave={() => setArrastando(false)}
          onDrop={soltar}
          onClick={() => seletor.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); seletor.current?.click() } }}
          aria-label="Escolher arquivo"
        >
          <IconeEnviar />
          {arquivo
            ? <><b>{arquivo.name}</b><span className="suave">{(arquivo.size / 1024 / 1024).toFixed(1)} MB · clique para trocar</span></>
            : <><b>Arraste o arquivo para cá ou clique para escolher</b><span className="suave">Áudio, vídeo ou PDF, até {LIMITE_MB} MB. Também dá para publicar sem arquivo e enviar depois.</span></>}
          <input ref={seletor} type="file" accept={ACEITA} hidden onChange={(e) => escolher(e.target.files?.[0])} />
        </div>

        <div className="formulario formulario-2">
          <div className="campo">
            <label htmlFor="b-tipo">Tipo</label>
            <select id="b-tipo" className="entrada" value={tipo} onChange={(e) => setTipo(e.target.value as TipoConteudo)}>
              {Object.entries(NOMES_TIPO).map(([v, n]) => <option key={v} value={v}>{n}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="b-titulo">Título</label>
            <input id="b-titulo" className="entrada" value={titulo} onChange={(e) => setTitulo(e.target.value)} required />
          </div>
          <div className="campo ocupa-tudo">
            <label htmlFor="b-desc">Descrição curta</label>
            <input id="b-desc" className="entrada" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Ex.: Grão de Pólen da roda 2" />
          </div>
          <div className="campo">
            <label htmlFor="b-pilar">Pilar</label>
            <select id="b-pilar" className="entrada" value={pilar} onChange={(e) => setPilar(e.target.value)}>
              <option value="">Nenhum em especial</option>
              {pilares.map((p) => <option key={p.slug} value={p.slug}>{p.nome}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="b-ciclo">Ciclo</label>
            <select id="b-ciclo" className="entrada" value={ciclo} onChange={(e) => setCiclo(e.target.value)}>
              <option value="">Material geral</option>
              {ciclos.map((c) => <option key={c.id} value={c.id}>Ciclo {c.numero} · {c.titulo}</option>)}
            </select>
          </div>
          <div className="campo">
            <label htmlFor="b-dur">Duração (minutos)</label>
            <input id="b-dur" className="entrada" type="number" min={1} value={duracao} onChange={(e) => setDuracao(e.target.value)} />
            <span className="ajuda">Preenchida sozinha quando o arquivo é áudio ou vídeo.</span>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 700, fontSize: 15, alignSelf: 'center' }}>
            <input type="checkbox" checked={destaque} onChange={(e) => setDestaque(e.target.checked)} style={{ width: 20, height: 20 }} />
            Destacar no início como “para ouvir esta semana”
          </label>
        </div>

        {erro && <p className="erro" role="alert">{erro}</p>}
        <button className="botao" type="submit" disabled={enviando || !titulo.trim()} style={{ alignSelf: 'flex-start' }}>
          {enviando ? (arquivo ? 'Enviando o arquivo…' : 'Publicando…') : 'Publicar'}
        </button>
      </form>

      <section className="secao">
        <h2>O que está na biblioteca</h2>
        <div className="tabela-caixa">
          <table className="tabela">
            <thead><tr><th>Título</th><th>Tipo</th><th>Pilar / ciclo</th><th>Arquivo</th><th>Publicado</th><th><span className="sr">Ações</span></th></tr></thead>
            <tbody>
              {conteudos.map((c) => (
                <tr key={c.id}>
                  <td><b>{c.titulo}</b>{c.destaque && <span className="etiqueta" style={{ background: 'var(--mel)', marginLeft: 8 }}>Destaque</span>}</td>
                  <td>{NOMES_TIPO[c.tipo]}</td>
                  <td className="suave">{[pilarPorSlug(pilares, c.pilar_slug)?.nome, c.ciclo_id && `Ciclo ${ciclos.find((x) => x.id === c.ciclo_id)?.numero}`].filter(Boolean).join(' · ') || 'Geral'}</td>
                  <td>
                    <label style={{ color: c.arquivo ? 'var(--musgo)' : 'var(--terracota)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', whiteSpace: 'nowrap' }}>
                      {c.arquivo ? 'Trocar' : 'Enviar'}
                      <input type="file" accept={ACEITA} hidden onChange={(e) => e.target.files?.[0] && trocarArquivo(c, e.target.files[0])} />
                    </label>
                  </td>
                  <td className="suave" style={{ whiteSpace: 'nowrap' }}>{dataCurta(c.criado_em)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="botao-texto" style={{ fontSize: 14, marginRight: 14 }} onClick={() => destacar(c)}>{c.destaque ? 'Tirar destaque' : 'Destacar'}</button>
                    <button className="botao-texto botao-perigo" style={{ fontSize: 14 }} onClick={() => apagar(c)}>Apagar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
