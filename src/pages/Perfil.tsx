import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useColmeia } from '../lib/contexto'
import { IconeVoltar } from '../components/Icones'

export function PaginaPerfil() {
  const { sessao, perfil, recarregarPerfil } = useColmeia()
  const [nome, setNome] = useState(perfil?.nome ?? '')
  const [salvo, setSalvo] = useState(false)

  useEffect(() => { if (perfil) setNome(perfil.nome) }, [perfil])

  async function salvar(e: FormEvent) {
    e.preventDefault()
    await supabase.from('perfis').update({ nome: nome.trim() }).eq('id', sessao.user.id)
    await recarregarPerfil()
    setSalvo(true)
  }

  return (
    <div className="secao" style={{ gap: 22, maxWidth: 560 }}>
        <Link to="/" className="voltar so-celular" aria-label="Voltar ao início"><IconeVoltar /></Link>
        <h1>O meu perfil</h1>

        <form onSubmit={salvar} className="secao">
          <div className="campo">
            <label htmlFor="nome">Como quer ser chamada na Colmeia</label>
            <input id="nome" className="entrada" value={nome} onChange={(e) => { setNome(e.target.value); setSalvo(false) }} maxLength={60} required />
          </div>
          <button className="botao" type="submit">{salvo ? 'Salvo' : 'Salvar'}</button>
        </form>

        <p className="suave">Entrou como {sessao.user.email}</p>

        <div className="aviso">
          <b>Coloque a Colmeia na tela do celular.</b> Ela abre como um aplicativo.<br />
          No iPhone: no Safari, toque em Compartilhar e depois em “Adicionar à Tela de Início”.<br />
          No Android: no Chrome, toque nos três pontinhos e depois em “Adicionar à tela inicial”.
        </div>

        {perfil?.admin && <Link to="/painel" className="botao botao-mel">Abrir o painel de administração</Link>}

        <button className="botao-texto" style={{ alignSelf: 'flex-start' }} onClick={() => supabase.auth.signOut()}>Sair da conta</button>
    </div>
  )
}
