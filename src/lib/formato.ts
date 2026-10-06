const fuso = 'America/Sao_Paulo'

export function dataEncontro(iso: string) {
  const d = new Date(iso)
  const dia = d.toLocaleDateString('pt-BR', { timeZone: fuso, weekday: 'long', day: 'numeric', month: 'long' })
  const hora = d.toLocaleTimeString('pt-BR', { timeZone: fuso, hour: '2-digit', minute: '2-digit' }).replace(':00', 'h')
  return `${dia.replace('-feira', '')} · ${hora} (Brasília)`
}

export function dataCurta(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { timeZone: fuso, day: 'numeric', month: 'short' }).replace('.', '')
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
