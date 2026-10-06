import { useState } from 'react'
import { supabase, NOMES_TIPO, type Conteudo } from '../lib/supabase'
import { pilarPorSlug, useColmeia } from '../lib/contexto'
import { IconePlay } from './Icones'

// Um item da biblioteca. Toca o arquivo guardado no storage (link temporário),
// abre um link externo, ou avisa que o conteúdo ainda não foi enviado.
export function Player({ c }: { c: Conteudo }) {
  const { pilares } = useColmeia()
  const [src, setSrc] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  async function abrir() {
    if (src) { setSrc(null); return }
    if (c.url) { window.open(c.url, '_blank', 'noopener'); return }
    if (!c.arquivo) { setAviso('Este conteúdo ainda não foi enviado.'); return }
    const { data, error } = await supabase.storage.from('biblioteca').createSignedUrl(c.arquivo, 60 * 60)
    if (error || !data) { setAviso('Não foi possível abrir agora. Tente de novo.'); return }
    if (c.tipo === 'apostila') window.open(data.signedUrl, '_blank', 'noopener')
    else setSrc(data.signedUrl)
  }

  const ehMidia = c.tipo !== 'apostila'
  const pilar = pilarPorSlug(pilares, c.pilar_slug)
  const sub = [c.descricao || NOMES_TIPO[c.tipo], pilar?.nome].filter(Boolean).join(' · ')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button className="item" onClick={abrir} aria-label={`${src ? 'Fechar' : 'Abrir'} ${c.titulo}`}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ flex: 'none', width: 38, height: 38, borderRadius: 19, background: ehMidia ? 'var(--terracota)' : 'var(--violeta)', color: 'var(--branco)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {ehMidia ? <IconePlay /> : <b style={{ fontSize: 13 }}>PDF</b>}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <b style={{ fontSize: 15 }}>{c.titulo}</b>
            <span className="suave" style={{ fontSize: 13 }}>{sub}</span>
          </span>
        </span>
        {c.duracao_min && <span className="suave" style={{ flex: 'none' }}>{c.duracao_min} min</span>}
      </button>
      {src && c.tipo !== 'video' && <audio src={src} controls autoPlay />}
      {src && c.tipo === 'video' && <video src={src} controls autoPlay style={{ width: '100%', borderRadius: 14 }} />}
      {aviso && <p className="suave" style={{ paddingLeft: 4 }}>{aviso}</p>}
    </div>
  )
}
