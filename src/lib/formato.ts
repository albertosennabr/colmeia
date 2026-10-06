import type { Ciclo } from './supabase'

function hora(d: Date, timeZone: string) {
  return d.toLocaleTimeString('pt-BR', { timeZone, hour: '2-digit', minute: '2-digit' }).replace(':00', 'h').replace(/^0/, '')
}

// "Quinta, 4 de março"
export function diaRoda(iso: string) {
  const s = new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', weekday: 'long', day: 'numeric', month: 'long' }).replace('-feira', '')
  return s.charAt(0).toUpperCase() + s.slice(1)
}

// "17h em Brasília · 20h em Lisboa": a comunidade é dos dois lados do Atlântico
export function horaRoda(iso: string) {
  const d = new Date(iso)
  return `${hora(d, 'America/Sao_Paulo')} em Brasília · ${hora(d, 'Europe/Lisbon')} em Lisboa`
}

export function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo', day: 'numeric', month: 'short' }).replace('.', '')
}

export function mesAno(data: string) {
  return new Date(data + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
}

export function periodoCiclo(c: Ciclo) {
  const ini = new Date(c.inicio + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'long' })
  return `${ini} a ${mesAno(c.fim)}`
}

export function haQuanto(iso: string) {
  const min = Math.round((Date.now() - new Date(iso).getTime()) / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.round(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.round(h / 24)
  if (d === 1) return 'ontem'
  if (d < 30) return `há ${d} dias`
  return dataCurta(iso)
}
