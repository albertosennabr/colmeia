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

export type Encontro = {
  id: number
  ciclo: number
  ordem: number
  titulo: string
  pilar_slug: string | null
  data: string
  link_ao_vivo: string | null
  gravacao_url: string | null
}

export type Conteudo = {
  id: number
  tipo: 'audio' | 'meditacao' | 'video' | 'apostila'
  titulo: string
  descricao: string
  pilar_slug: string | null
  duracao_min: number | null
  arquivo: string | null
  url: string | null
  destaque: boolean
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
