import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, SELECT_POST, type Post } from '../../lib/supabase'
import { pilarPorSlug, useColmeia } from '../../lib/contexto'
import { haQuanto } from '../../lib/formato'

export function AdminComunidade() {
  const { pilares, avisar } = useColmeia()
  const [posts, setPosts] = useState<Post[]>([])

  async function carregar() {
    const { data } = await supabase.from('posts').select(SELECT_POST).order('criado_em', { ascending: false }).limit(100)
    setPosts((data as unknown as Post[]) ?? [])
  }
  useEffect(() => { carregar() }, [])

  async function apagar(p: Post) {
    if (!confirm('Apagar esta publicação e as respostas dela?')) return
    await supabase.from('posts').delete().eq('id', p.id)
    avisar('Publicação apagada')
    carregar()
  }

  return (
    <div className="secao" style={{ gap: 16, paddingTop: 8 }}>
      <p className="suave" style={{ fontSize: 15 }}>As publicações mais recentes. Use para cuidar dos combinados da Colmeia.</p>
      {posts.length === 0 && <p className="vazio">Nenhuma publicação ainda.</p>}
      <div className="tabela-caixa">
        <table className="tabela">
          <thead><tr><th>Quem</th><th>Publicação</th><th>Conversa</th><th>Quando</th><th>Respostas</th><th></th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td><b>{p.perfis?.nome}</b></td>
                <td style={{ maxWidth: 420 }}><Link to={`/post/${p.id}`} style={{ color: 'var(--espresso)' }}>{p.texto.length > 140 ? p.texto.slice(0, 140) + '…' : p.texto}</Link></td>
                <td className="suave">{pilarPorSlug(pilares, p.pilar_slug)?.nome ?? 'Geral'}</td>
                <td className="suave" style={{ whiteSpace: 'nowrap' }}>{haQuanto(p.criado_em)}</td>
                <td>{p.respostas[0]?.count ?? 0}</td>
                <td><button className="botao-texto botao-perigo" style={{ fontSize: 14 }} onClick={() => apagar(p)}>Apagar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
