import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useColmeia } from '../../lib/contexto'
import { dataCurta, haQuanto } from '../../lib/formato'

type Membra = { id: string; nome: string; email: string; admin: boolean; criado_em: string; ultimo_acesso: string | null; posts: number }

export function AdminMembras() {
  const { sessao, avisar } = useColmeia()
  const [membras, setMembras] = useState<Membra[] | null>(null)
  const [busca, setBusca] = useState('')

  async function carregar() {
    const { data, error } = await supabase.rpc('membras_para_admin')
    if (error) avisar('Não carregou: ' + error.message)
    setMembras((data as Membra[]) ?? [])
  }
  useEffect(() => { carregar() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function alternarAdmin(m: Membra) {
    if (m.id === sessao.user.id) { avisar('Você não pode tirar o seu próprio acesso.'); return }
    if (!confirm(m.admin ? `Tirar o acesso ao painel de ${m.nome}?` : `Dar acesso ao painel para ${m.nome}? Ela poderá publicar, editar e apagar conteúdos.`)) return
    const { error } = await supabase.from('perfis').update({ admin: !m.admin }).eq('id', m.id)
    avisar(error ? 'Não mudou: ' + error.message : 'Acesso atualizado')
    carregar()
  }

  const termo = busca.trim().toLowerCase()
  const lista = (membras ?? []).filter((m) => !termo || m.nome.toLowerCase().includes(termo) || m.email.toLowerCase().includes(termo))

  return (
    <div className="secao" style={{ gap: 16, paddingTop: 8 }}>
      <div className="linha-titulo" style={{ alignItems: 'center' }}>
        <p className="suave" style={{ fontSize: 15 }}>{membras?.length ?? 0} pessoas cadastradas. Os e-mails só aparecem para quem cuida da casa.</p>
        <input className="entrada" style={{ maxWidth: 280 }} type="search" placeholder="Buscar por nome ou e-mail" aria-label="Buscar membras" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <div className="tabela-caixa">
        <table className="tabela">
          <thead><tr><th>Nome</th><th>E-mail</th><th>Entrou</th><th>Último acesso</th><th>Publicações</th><th>Painel</th></tr></thead>
          <tbody>
            {lista.map((m) => (
              <tr key={m.id}>
                <td><b>{m.nome}</b></td>
                <td>{m.email}</td>
                <td className="suave">{dataCurta(m.criado_em)}</td>
                <td className="suave">{m.ultimo_acesso ? haQuanto(m.ultimo_acesso) : '–'}</td>
                <td>{m.posts}</td>
                <td>
                  <button className="botao-texto" style={{ fontSize: 14 }} onClick={() => alternarAdmin(m)}>
                    {m.admin ? 'Tem acesso · tirar' : 'Dar acesso'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
