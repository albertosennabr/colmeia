import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

const PILARES: [string, string, string][] = [
  ['Geleia Real', '#DDB85B', '#33251A'],
  ['Voo da Autonomia', '#B15E36', '#FFFFFF'],
  ['Colmeia Viva', '#7E46A0', '#FFFFFF'],
  ['Voo da Independência', '#5F6C36', '#FFFFFF'],
  ['Favo de Mel', '#87611E', '#FFFFFF'],
  ['Voo Nupcial', '#BE9540', '#33251A'],
]

// Arte da porta de entrada: o favo dos seis pilares, sem links (quem chega ainda não entrou).
function Favo({ w }: { w: number }) {
  const h = w * 1.1547, sx = w + 6, sy = 0.75 * h + 5
  const desloc: [number, number][] = [[-sx / 2, -sy], [sx / 2, -sy], [sx, 0], [sx / 2, sy], [-sx / 2, sy], [-sx, 0]]
  const pos = (x: number, y: number) => ({ position: 'absolute' as const, left: sx + x, top: sy + y, width: w, height: h })
  return (
    <div aria-hidden="true" style={{ position: 'relative', width: 2 * sx + w, height: h + 2 * sy }}>
      {PILARES.map(([nome, cor, tinta], i) => (
        <div key={nome} className="hex" style={{ ...pos(desloc[i][0], desloc[i][1]), background: cor, color: tinta, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 14px', fontWeight: 700, fontSize: Math.round(w * 0.12) }}>{nome}</div>
      ))}
      <div className="hex" style={{ ...pos(0, 0), background: 'var(--creme)' }} />
    </div>
  )
}

export function Entrar() {
  const [email, setEmail] = useState('')
  const [estado, setEstado] = useState<'inicio' | 'enviando' | 'enviado'>('inicio')
  const [erro, setErro] = useState('')

  async function enviar(e: FormEvent) {
    e.preventDefault()
    setErro('')
    setEstado('enviando')
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: window.location.origin + window.location.pathname },
    })
    if (error) {
      setErro('Não conseguimos enviar o link agora. Confira o e-mail e tente de novo em alguns minutos.')
      setEstado('inicio')
    } else {
      setEstado('enviado')
    }
  }

  return (
    <div className="entrar">
      <div className="entrar-texto">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="hex" style={{ width: 26, height: 30, background: 'var(--mel)' }} />
          <span style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontFamily: 'Petrona, serif', fontWeight: 700, fontSize: 20 }}>Colmeia</span>
            <span style={{ fontSize: 11, color: 'var(--mel)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Casa de Rainhas</span>
          </span>
        </div>

        <div className="so-celular" style={{ justifyContent: 'center', padding: '28px 0 8px' }}><Favo w={84} /></div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 460 }}>
          <h1 style={{ fontSize: 'clamp(30px, 4vw, 44px)', lineHeight: 1.12 }}>A colmeia oculta o maior segredo sobre a liberdade da mulher.</h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--texto-claro)' }}>Autonomia e independência feminina através da sabedoria das abelhas.</p>

          {estado === 'enviado' ? (
            <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
              <p style={{ fontSize: 19, fontWeight: 700 }}>Confira o seu e-mail.</p>
              <p style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--texto-claro)' }}>
                Mandamos um link de acesso para <b>{email}</b>. Toque nele para entrar. Se não chegar em dois minutos, olhe a caixa de spam.
              </p>
              <button className="botao-texto" style={{ color: 'var(--mel)', alignSelf: 'flex-start' }} onClick={() => setEstado('inicio')}>Usar outro e-mail</button>
            </div>
          ) : (
            <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <label htmlFor="email" style={{ fontSize: 15, fontWeight: 700 }}>Entre com o seu e-mail</label>
              <input id="email" className="entrada" type="email" required autoComplete="email" inputMode="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ color: 'var(--espresso)' }} />
              {erro && <p role="alert" style={{ color: '#F2B8A0', fontSize: 15 }}>{erro}</p>}
              <button className="botao botao-mel" type="submit" disabled={estado === 'enviando'}>
                {estado === 'enviando' ? 'Enviando…' : 'Receber link de acesso'}
              </button>
              <p style={{ fontSize: 14, color: '#CDBFA5' }}>Sem senha: a cada entrada você recebe um link no e-mail.</p>
            </form>
          )}
        </div>

        <p style={{ fontFamily: 'Petrona, serif', fontStyle: 'italic', fontSize: 16, color: 'var(--mel)' }}>Bem me quer, mal me quer? Bem me quero!</p>
      </div>

      <div className="entrar-arte so-desktop">
        <Favo w={150} />
      </div>
    </div>
  )
}
