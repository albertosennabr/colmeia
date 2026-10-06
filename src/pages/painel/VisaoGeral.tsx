import { useEffect, useState } from 'react'
import { supabase, type Roda } from '../../lib/supabase'
import { cicloAtual, useColmeia } from '../../lib/contexto'
import { diaRoda, horaRoda } from '../../lib/formato'
import { IconeEnviar } from '../../components/Icones'

type Numeros = { membras: number; postsSemana: number; materiais: number; semArquivo: number }

export function VisaoGeral({ irPara }: { irPara: (aba: string) => void }) {
  const { ciclos } = useColmeia()
  const ciclo = cicloAtual(ciclos)
  const [n, setN] = useState<Numeros | null>(null)
  const [proxima, setProxima] = useState<Roda | null>(null)

  useEffect(() => {
    const semana = new Date(Date.now() - 7 * 864e5).toISOString()
    Promise.all([
      supabase.from('perfis').select('id', { count: 'exact', head: true }),
      supabase.from('posts').select('id', { count: 'exact', head: true }).gte('criado_em', semana),
      supabase.from('conteudos').select('id', { count: 'exact', head: true }),
      supabase.from('conteudos').select('id', { count: 'exact', head: true }).is('arquivo', null).is('url', null),
    ]).then(([a, b, c, d]) => setN({ membras: a.count ?? 0, postsSemana: b.count ?? 0, materiais: c.count ?? 0, semArquivo: d.count ?? 0 }))
    supabase.from('rodas').select('*').gte('data', new Date().toISOString()).order('data').limit(1).then(({ data }) => setProxima(data?.[0] ?? null))
  }, [])

  return (
    <div className="secao" style={{ gap: 28, paddingTop: 8 }}>
      <div className="numeros">
        <div className="numero"><span className="suave">Membras</span><b>{n?.membras ?? '–'}</b></div>
        <div className="numero"><span className="suave">Publicações na semana</span><b>{n?.postsSemana ?? '–'}</b></div>
        <div className="numero"><span className="suave">Materiais na biblioteca</span><b>{n?.materiais ?? '–'}</b></div>
        <div className="numero"><span className="suave">Materiais sem arquivo</span><b style={{ color: n?.semArquivo ? 'var(--terracota)' : undefined }}>{n?.semArquivo ?? '–'}</b></div>
      </div>

      <div className="grade-2">
        <div className="cartao" style={{ gap: 12 }}>
          <span className="rotulo">Atalhos</span>
          <button className="botao" onClick={() => irPara('biblioteca')}><IconeEnviar />Enviar um áudio ou material</button>
          <button className="botao botao-claro" onClick={() => irPara('ciclos')}>Editar ciclos e rodas</button>
          <button className="botao botao-claro" onClick={() => irPara('membras')}>Ver as membras</button>
        </div>
        <div className="cartao" style={{ gap: 8 }}>
          <span className="rotulo">Ciclo da vez</span>
          {ciclo ? <b style={{ fontFamily: 'Petrona, serif', fontSize: 22 }}>{ciclo.numero} · {ciclo.titulo}</b> : <span className="suave">Nenhum ciclo cadastrado.</span>}
          {proxima && (
            <>
              <span className="rotulo" style={{ paddingTop: 10 }}>Próxima roda</span>
              <b>{proxima.ordem} · {proxima.titulo}</b>
              <span className="suave">{diaRoda(proxima.data)} · {horaRoda(proxima.data)}</span>
              {!proxima.link_ao_vivo && <span style={{ color: 'var(--terracota)', fontWeight: 700, fontSize: 14 }}>Ainda sem link da roda ao vivo.</span>}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
