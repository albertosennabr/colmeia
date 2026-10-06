import { Link } from 'react-router-dom'
import { cicloAtual, useColmeia } from '../lib/contexto'
import { Hexagono } from '../components/Hexagono'
import { CabecalhoPagina, CartaoCiclo } from '../components/Partes'

const FORMATO_RODA: [string, string, string][] = [
  ['10 min', 'Ritual Bem me quero', 'Acende-se uma luz, mão no peito, e cada uma diz o nome e completa “bem me quero porque…”.'],
  ['15 min', 'A fala da Paula', 'Uma ideia só. É a única parte gravada, e vira material na biblioteca.'],
  ['25 min', 'A prática', 'Algo que se faz, não que se escuta.'],
  ['20 min', 'Roda de voz', 'Um minuto para cada uma, sem ninguém comentar. Não é gravada, para que todas possam falar de verdade.'],
  ['10 min', 'Grão de Pólen e fechamento', 'Uma pequena tarefa para levar até a próxima roda.'],
]

export function Proposta() {
  const { pilares, ciclos } = useColmeia()
  const ciclo = cicloAtual(ciclos)

  return (
    <>
      <CabecalhoPagina rotulo="Como funciona" titulo="Uma casa onde se fazem rainhas">
        <p className="texto" style={{ maxWidth: 720 }}>
          A Colmeia é uma comunidade de mulheres que buscam autonomia e independência, afetiva e financeira, através da sabedoria das abelhas.
          A rainha não manda em ninguém: a colmeia inteira trabalha para que ela seja livre. E quando uma rainha está plena, leva a colmeia junto.
        </p>
      </CabecalhoPagina>

      <section className="grade-2" aria-labelledby="t-pilares" style={{ alignItems: 'center' }}>
        <div className="secao">
          <span className="rotulo">1 · A base</span>
          <h2 id="t-pilares">Os seis pilares</h2>
          <p className="texto">
            Inspirada no hexágono do favo, a Colmeia se apoia em seis pilares. Eles são permanentes: estão em tudo o que fazemos aqui, em todos os ciclos.
            Toque em um pilar para conhecer o que ele trata, os materiais e a conversa dele.
          </p>
          <ol style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6, fontSize: 16, lineHeight: 1.45 }}>
            {pilares.map((p) => <li key={p.slug}><Link to={`/pilar/${p.slug}`} style={{ fontWeight: 700 }}>{p.nome}</Link>: {p.descricao.split('.')[0].toLowerCase()}.</li>)}
          </ol>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Hexagono pilares={pilares} largura={110} centro={{ rotulo: 'Os seis', titulo: 'pilares', para: '/proposta' }} />
        </div>
      </section>

      <section className="grade-2" aria-labelledby="t-ciclos">
        <div className="secao">
          <span className="rotulo">2 · A jornada</span>
          <h2 id="t-ciclos">Os ciclos</h2>
          <p className="texto">
            A Colmeia caminha em ciclos de quatro meses, com começo, meio e fim. Cada ciclo tem um tema próprio e aprofunda um ou mais pilares:
            alguns atravessam vários, outros mergulham num pilar só.
          </p>
          <p className="texto">
            As vagas de cada ciclo são fechadas e as inscrições têm data para acabar. Assim, quem começa junto termina junto.
          </p>
          <Link to="/ciclos" style={{ fontWeight: 700 }}>Ver todos os ciclos</Link>
        </div>
        {ciclo && <CartaoCiclo ciclo={ciclo} pilares={pilares} escuro />}
      </section>

      <section className="secao" aria-labelledby="t-rodas">
        <span className="rotulo">3 · O encontro</span>
        <h2 id="t-rodas">As rodas</h2>
        <p className="texto" style={{ maxWidth: 720 }}>
          Cada ciclo tem oito rodas, uma a cada quinze dias, ao vivo e on-line, sempre com o mesmo formato de 80 minutos. É a repetição que transforma reunião em casa.
        </p>
        <div className="grade-3" style={{ gap: 12 }}>
          {FORMATO_RODA.map(([tempo, nome, texto]) => (
            <div key={nome} className="cartao" style={{ gap: 4 }}>
              <span className="rotulo">{tempo}</span>
              <h3>{nome}</h3>
              <p style={{ fontSize: 15, lineHeight: 1.5, color: 'var(--texto-medio)' }}>{texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grade-3" aria-label="Entre as rodas">
        <div className="cartao cartao-areia">
          <span className="rotulo">Entre as rodas</span>
          <h3>Grãos de Pólen</h3>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>Áudios curtos da Paula, de 5 a 10 minutos, para a conversa não parar entre uma roda e outra.</p>
        </div>
        <div className="cartao cartao-areia">
          <span className="rotulo">Sempre aberta</span>
          <h3>A comunidade</h3>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>Um lugar só nosso, fora das redes sociais, com uma conversa para cada pilar.</p>
        </div>
        <div className="cartao cartao-areia">
          <span className="rotulo">No seu bolso</span>
          <h3>O Desafio da Colmeia</h3>
          <p style={{ fontSize: 15, lineHeight: 1.5 }}>Guardar um valor por semana, numa conta sua. O dinheiro é sempre seu e fica com você.</p>
        </div>
      </section>

      <p className="aviso" style={{ maxWidth: 720 }}>
        <b>Um cuidado.</b> As rodas acolhem, mas não são terapia. Se alguma coisa pesar demais, fale com a Paula: ela indica profissionais de confiança no Brasil e em Portugal.
      </p>
    </>
  )
}
