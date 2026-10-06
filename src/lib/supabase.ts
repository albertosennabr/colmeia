import { createClient } from '@supabase/supabase-js'

// Chave publicável: pode ficar no código. A proteção dos dados está nas
// regras de acesso (RLS) do banco.
const URL = 'https://frqvfqomrpqlmibcwicp.supabase.co'
const CHAVE = 'sb_publishable_itcU6lslhfamfQw99AUu-w_-KXb2VY_'

export const supabase = createClient(URL, CHAVE, {
  auth: { flowType: 'implicit', detectSessionInUrl: true, persistSession: true },
})

export type Pilar = {
  slug: string
  ordem: number
  nome: string
  descricao: string
  frase: string
  cor: string
  tinta: string
}

export type StatusCiclo = 'em_breve' | 'inscricoes' | 'em_andamento' | 'encerrado'

export type Ciclo = {
  id: number
  numero: number
  titulo: string
  tema: string
  pilares: string[]
  inicio: string
  fim: string
  vagas: number | null
  status: StatusCiclo
}

export type Roda = {
  id: number
  ciclo_id: number
  ordem: number
  titulo: string
  descricao: string
  pratica: string
  grao_de_polen: string
  pilar_slug: string | null
  data: string
  link_ao_vivo: string | null
  gravacao_url: string | null
}

export type TipoConteudo = 'grao' | 'audio' | 'meditacao' | 'video' | 'apostila'

export type Conteudo = {
  id: number
  tipo: TipoConteudo
  titulo: string
  descricao: string
  pilar_slug: string | null
  ciclo_id: number | null
  duracao_min: number | null
  arquivo: string | null
  url: string | null
  destaque: boolean
  criado_em: string
}

export type Perfil = { id: string; nome: string; admin: boolean }

export type Post = {
  id: number
  texto: string
  criado_em: string
  pilar_slug: string | null
  autora: string
  perfis: { nome: string } | null
  respostas: { count: number }[]
}

export const SELECT_POST = 'id, texto, criado_em, pilar_slug, autora, perfis(nome), respostas(count)'

export const NOMES_TIPO: Record<TipoConteudo, string> = {
  grao: 'Grão de Pólen',
  audio: 'Áudio',
  meditacao: 'Meditação',
  video: 'Vídeo',
  apostila: 'Apostila',
}

export const NOMES_STATUS: Record<StatusCiclo, string> = {
  em_breve: 'Em breve',
  inscricoes: 'Inscrições abertas',
  em_andamento: 'Em andamento',
  encerrado: 'Encerrado',
}
