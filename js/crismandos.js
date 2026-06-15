import { supabase } from './supabaseClient.js';

export async function listarCrismandos(turmaId, apenasAtivos = true) {
  let query = supabase
    .from('crismandos')
    .select('*')
    .eq('turma_id', turmaId)
    .order('nome_completo');
  if (apenasAtivos) query = query.eq('ativo', true);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function cadastrarCrismando({ nomeCompleto, dataNascimento, responsavelNome, responsavelTelefone, turmaId }) {
  const { data, error } = await supabase.from('crismandos').insert({
    nome_completo: nomeCompleto,
    data_nascimento: dataNascimento || null,
    responsavel_nome: responsavelNome || null,
    responsavel_telefone: responsavelTelefone || null,
    turma_id: turmaId,
    ativo: true
  }).select().single();
  if (error) throw error;
  return data;
}

export async function editarCrismando(id, campos) {
  const { error } = await supabase.from('crismandos').update(campos).eq('id', id);
  if (error) throw error;
}

export async function toggleAtivoCrismando(id, ativo) {
  const { error } = await supabase.from('crismandos').update({ ativo }).eq('id', id);
  if (error) throw error;
}

export async function buscarCrismando(id) {
  const { data, error } = await supabase
    .from('crismandos')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}
