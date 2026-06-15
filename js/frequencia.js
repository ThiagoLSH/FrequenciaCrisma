import { supabase } from './supabaseClient.js';

export async function registrarFalta(crismandoId, dataFalta, justificativa, usuarioId, turmaId) {
  const { data, error } = await supabase.from('frequencia').insert({
    crismando_id: crismandoId,
    data_falta: dataFalta,
    justificativa: justificativa?.trim() || null,
    registrado_por: usuarioId,
    turma_id: turmaId
  }).select().single();
  if (error) throw error;
  return data;
}

export async function removerFalta(faltaId) {
  const { error } = await supabase.from('frequencia').delete().eq('id', faltaId);
  if (error) throw error;
}

export async function decidirJustificativa(faltaId, decisao) {
  const { error } = await supabase
    .from('frequencia')
    .update({ status_justificativa: decisao })
    .eq('id', faltaId);
  if (error) throw error;
}

export async function buscarFaltasPorData(data, turmaId) {
  const { data: registros, error } = await supabase
    .from('frequencia')
    .select('*, crismandos(nome_completo)')
    .eq('data_falta', data)
    .eq('turma_id', turmaId);
  if (error) throw error;
  return registros || [];
}

export async function buscarSaudeFrequencia(turmaId) {
  const { data, error } = await supabase
    .from('vw_saude_frequencia')
    .select('*')
    .eq('turma_id', turmaId)
    .order('faltas_nao_justificaveis', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function buscarJustificativasPendentes(turmaId) {
  const { data, error } = await supabase
    .from('frequencia')
    .select('*, crismandos(nome_completo), usuarios(nome_completo)')
    .eq('status_justificativa', 'pendente')
    .eq('turma_id', turmaId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function buscarHistoricoCrismando(crismandoId) {
  const { data, error } = await supabase
    .from('frequencia')
    .select('*')
    .eq('crismando_id', crismandoId)
    .order('data_falta', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function buscarContagemFaltas(crismandoId) {
  const { data, error } = await supabase
    .from('vw_saude_frequencia')
    .select('faltas_nao_justificaveis, faltas_justificadas, justificativas_pendentes, status_saude')
    .eq('crismando_id', crismandoId)
    .single();
  if (error) return { faltas_nao_justificaveis: 0, faltas_justificadas: 0, justificativas_pendentes: 0, status_saude: 'ok' };
  return data;
}
