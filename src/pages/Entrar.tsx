import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Simbolo } from '../components/Layout'

// A marca completa, como no manual: símbolo, COLMEIA espaçado e o lema.
function MarcaGrande({ tamanho, fundoEscuro }: { tamanho: number; fundoEscuro: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tamanho * 0.22 }}>
      <Simbolo tamanho={tamanho} fundoEscuro={fundoEscuro} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: tamanho * 0.08 }}>
        <span className="marca-palavra" style={{ fontSize: tamanho * 0.42, lineHeight: 1, paddingLeft: '0.42em', color: fundoEscuro ? 'var(--creme)' : 'var(--espresso)' }}>Colmeia</span>
        <span className="marca-lema" style={{ fontSize: tamanho * 0.13, paddingLeft: '0.28em', color: fundoEscuro ? 'var(--texto-claro)' : 'var(--espresso)' }}>autonomia feminina</span>
      </div>
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
        <div className="so-celular" style={{ justifyContent: 'center', paddingTop: 24 }}><MarcaGrande tamanho={92} fundoEscuro /></div>
        <div className="so-desktop" />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 460 }}>
          <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.08, fontWeight: 400 }}>A colmeia oculta o maior segredo sobre a liberdade da mulher.</h1>
          <p style={{ fontSize: 17, lineHeight: 1.55, color: 'var(--texto-claro)', fontWeight: 300 }}>Uma comunidade de mulheres que buscam autonomia afetiva e financeira, inspirada na sabedoria das abelhas.</p>

          {estado === 'enviado' ? (
            <div role="status" style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
              <p style={{ fontSize: 19, fontWeight: 600 }}>Confira o seu e-mail.</p>
              <p style={{ fontSize: 16, lineHeight: 1.5, color: 'var(--texto-claro)' }}>
                Mandamos um link de acesso para <b>{email}</b>. Toque nele para entrar. Se não chegar em dois minutos, olhe a caixa de spam.
              </p>
              <button className="botao-texto" style={{ color: 'var(--mel)', alignSelf: 'flex-start' }} onClick={() => setEstado('inicio')}>Usar outro e-mail</button>
            </div>
          ) : (
            <form onSubmit={enviar} style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8 }}>
              <label htmlFor="email" style={{ fontSize: 15, fontWeight: 600 }}>Entre com o seu e-mail</label>
              <input id="email" className="entrada" type="email" required autoComplete="email" inputMode="email" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} style={{ color: 'var(--espresso)' }} />
              {erro && <p role="alert" style={{ color: '#FFD3C4', fontSize: 15 }}>{erro}</p>}
              <button className="botao" type="submit" disabled={estado === 'enviando'} style={{ background: 'var(--creme)', color: 'var(--vinho)' }}>
                {estado === 'enviando' ? 'Enviando…' : 'Receber link de acesso'}
              </button>
              <p style={{ fontSize: 14, color: 'var(--texto-claro)', opacity: 0.85 }}>Sem senha: a cada entrada você recebe um link no e-mail.</p>
            </form>
          )}
        </div>

        <p style={{ fontStyle: 'italic', fontWeight: 300, fontSize: 16, color: 'var(--rosa)' }}>Bem me quer, mal me quer? Bem me quero!</p>
      </div>

      <div className="entrar-arte so-desktop">
        <MarcaGrande tamanho={170} fundoEscuro={false} />
      </div>
    </div>
  )
}
