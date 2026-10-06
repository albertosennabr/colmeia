import { useState } from 'react'
import { supabase, type Conteudo } from '../lib/supabase'
import { IconePlay } from './Icones'

// Um item da biblioteca. Toca o arquivo guardado no storage (link temporário),
// abre um link externo, ou avisa que o conteúdo ainda não foi enviado.
export function Player({ c, subtitulo }: { c: Conteudo; subtitulo?: string }) {
  const [src, setSrc] = useState<string | null>(null)
  const [aviso, setAviso] = useState('')

  async function abrir() {
    if (c.url) {
      window.open(c.url, '_blank', 'noopener')
      return
    }
    if (!c.arquivo) {
      setAviso('Este conteúdo ainda não foi enviado.')
      return
    }
    const { data, error } = await supabase.storage.from('biblioteca').createSignedUrl(c.arquivo, 60 * 60)
    if (error || !data) {
      setAviso('Não foi possível abrir agora.')
      return
    }
    if (c.tipo === 'apostila') window.open(data.signedUrl, '_blank', 'noopener')
    else setSrc(data.signedUrl)
  }

  const ehMidia = c.tipo === 'audio' || c.tipo === 'meditacao' || c.tipo === 'video'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button className="item" onClick={abrir} aria-label={`Abrir ${c.titulo}`}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {ehMidia && <span style={{ color: 'var(--terracota)', display: 'flex' }}><IconePlay /></span>}
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <b style={{ fontSize: 15 }}>{c.titulo}</b>
            {subtitulo && <span className="suave" style={{ fontSize: 13 }}>{subtitulo}</span>}
          </span>
        </span>
        {c.duracao_min && <span className="suave">{c.duracao_min} min</span>}
      </button>
      {src && c.tipo !== 'video' && <audio src={src} controls autoPlay />}
      {src && c.tipo === 'video' && <video src={src} controls autoPlay style={{ width: '100%', borderRadius: 14 }} />}
      {aviso && <p className="suave" style={{ paddingLeft: 4 }}>{aviso}</p>}
    </div>
  )
}
