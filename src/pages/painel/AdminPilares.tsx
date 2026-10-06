import { useEffect, useState } from 'react'
import { supabase, type Pilar } from '../../lib/supabase'
import { useColmeia } from '../../lib/contexto'

export function AdminPilares() {
  const { pilares, recarregarBase, avisar } = useColmeia()
  const [lista, setLista] = useState<Pilar[]>(pilares)
  useEffect(() => setLista(pilares), [pilares])

  const muda = (slug: string, campo: 'nome' | 'descricao' | 'frase', valor: string) =>
    setLista(lista.map((p) => (p.slug === slug ? { ...p, [campo]: valor } : p)))

  async function salvar(p: Pilar) {
    const { error } = await supabase.from('pilares').update({ nome: p.nome, descricao: p.descricao, frase: p.frase }).eq('slug', p.slug)
    avisar(error ? 'Não salvou: ' + error.message : `${p.nome} salvo`)
    recarregarBase()
  }

  return (
    <div className="secao" style={{ gap: 16, paddingTop: 8 }}>
      <p className="suave" style={{ fontSize: 15 }}>Os seis pilares são a base permanente da Colmeia. O texto daqui aparece na página de cada pilar e em “Como funciona”.</p>
      <div className="grade-2" style={{ gap: 16 }}>
        {lista.map((p) => (
          <div key={p.slug} className="cartao" style={{ gap: 12, borderTop: `6px solid ${p.cor}` }}>
            <div className="campo"><label htmlFor={`p-n-${p.slug}`}>Nome</label><input id={`p-n-${p.slug}`} className="entrada" value={p.nome} onChange={(e) => muda(p.slug, 'nome', e.target.value)} /></div>
            <div className="campo"><label htmlFor={`p-d-${p.slug}`}>O que o pilar trata</label><textarea id={`p-d-${p.slug}`} className="entrada" value={p.descricao} onChange={(e) => muda(p.slug, 'descricao', e.target.value)} /></div>
            <div className="campo"><label htmlFor={`p-f-${p.slug}`}>Frase</label><input id={`p-f-${p.slug}`} className="entrada" value={p.frase} onChange={(e) => muda(p.slug, 'frase', e.target.value)} /></div>
            <button className="botao botao-pequeno" style={{ alignSelf: 'flex-start' }} onClick={() => salvar(p)}>Salvar</button>
          </div>
        ))}
      </div>
    </div>
  )
}
