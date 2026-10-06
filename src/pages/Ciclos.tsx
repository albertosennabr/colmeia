import { useColmeia } from '../lib/contexto'
import { CabecalhoPagina, CartaoCiclo } from '../components/Partes'

export function Ciclos() {
  const { pilares, ciclos } = useColmeia()
  const grupos: [string, typeof ciclos][] = [
    ['Agora', ciclos.filter((c) => c.status === 'em_andamento' || c.status === 'inscricoes')],
    ['Em breve', ciclos.filter((c) => c.status === 'em_breve')],
    ['Já vividos', ciclos.filter((c) => c.status === 'encerrado')],
  ]

  return (
    <>
      <CabecalhoPagina rotulo="A jornada" titulo="Os ciclos">
        <p className="texto" style={{ maxWidth: 720 }}>
          Cada ciclo dura quatro meses, tem um tema próprio e é formado por oito rodas quinzenais. Os pilares de cada ciclo mostram onde ele aprofunda.
        </p>
      </CabecalhoPagina>
      {grupos.map(([titulo, lista]) => lista.length > 0 && (
        <section key={titulo} className="secao">
          <h2>{titulo}</h2>
          <div className="grade-2" style={{ gap: 16 }}>
            {lista.map((c) => <CartaoCiclo key={c.id} ciclo={c} pilares={pilares} escuro={titulo === 'Agora'} />)}
          </div>
        </section>
      ))}
    </>
  )
}
