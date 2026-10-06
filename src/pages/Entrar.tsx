import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'

const fundo: [string, number, number, number][] = [
  ['var(--ouro)', -40, 70, 150],
  ['var(--mel)', 70, 140, 96],
  ['var(--terracota)', 10, 250, 96],
  ['var(--violeta)', 120, 50, 52],
]

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
    <div style={{ flex: 1, background: 'var(--espresso)', color: 'var(--creme)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', minHeight: '100dvh' }}>
      {fundo.map(([cor, direita, topo, largura]) => (
        <div key={cor} className="hex" aria-hidden="true" style={{ position: 'absolute', right: direita, top: topo, width: largura, height: largura * 1.155, background: cor }} />
      ))}

      <div style={{ padding: '36px 28px 0', display: 'flex', alignItems: 'center', gap: 10, position: 'relative' }}>
        <div className="hex" style={{ width: 26, height: 30, background: 'var(--mel)' }} />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontFamily: 'Petrona, serif', fontWeight: 700, fontSize: 20 }}>Colmeia</span>
          <span style={{ fontSize: 12, color: 'var(--mel)', letterSpacing: 1.5, textTransform: 'uppercase' }}>Casa de Rainhas</span>
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 200 }} />

      <div style={{ padding: '0 28px 36px', display: 'flex', flexDirection: 'column', gap: 18, position: 'relative' }}>
        <h1 style={{ fontSize: 34, lineHeight: 1.15 }}>A colmeia oculta o maior segredo sobre a liberdade da mulher.</h1>
        <p style={{ fontSize: 17, lineHeight: 1.5, color: '#EADFC8' }}>Autonomia e independência feminina através da sabedoria das abelhas.</p>

        {estado === 'enviado' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
            <p style={{ fontSize: 18, fontWeight: 700 }}>Confira o seu e-mail.</p>
            <p style={{ fontSize: 16, lineHeight: 1.5, color: '#EADFC8' }}>
              Mandamos um link de acesso para <b>{email}</b>. Toque nele neste mesmo aparelho para entrar.
            </p>
            <button className="botao-texto" style={{ color: 'var(--mel)', alignSelf: 'flex-start', paddingLeft: 0 }} onClick={() => setEstado('inicio')}>Usar outro e-mail</button>
          </div>
        ) : (
          <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
            <label htmlFor="email" style={{ fontSize: 15, fontWeight: 700 }}>Entre com o seu e-mail</label>
            <input id="email" className="entrada" type="email" required autoComplete="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ color: 'var(--espresso)' }} />
            {erro && <p style={{ color: '#F2B8A0', fontSize: 15 }}>{erro}</p>}
            <button className="botao botao-mel" type="submit" disabled={estado === 'enviando'}>
              {estado === 'enviando' ? 'Enviando…' : 'Receber link de acesso'}
            </button>
            <p style={{ fontSize: 14, color: '#CDBFA5', textAlign: 'center' }}>Sem senha: você recebe um link no e-mail a cada entrada.</p>
          </form>
        )}

        <p style={{ fontFamily: 'Petrona, serif', fontStyle: 'italic', fontSize: 16, color: 'var(--mel)', textAlign: 'center', paddingTop: 8 }}>Bem me quer, mal me quer? Bem me quero!</p>
      </div>
    </div>
  )
}
