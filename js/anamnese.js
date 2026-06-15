import { supabase } from './supabaseClient.js';

export async function salvarConfiguracaoTurma({ diaSemana, horarioInicio, horarioFim, turmaId }) {
  const { error } = await supabase.from('configuracao_turma').upsert({
    turma_id: turmaId,
    dia_semana_crisma: diaSemana,
    horario_inicio: horarioInicio,
    horario_fim: horarioFim,
    updated_at: new Date().toISOString()
  }, { onConflict: 'turma_id' });
  if (error) throw error;
}

export async function buscarConfiguracaoTurma(turmaId) {
  const { data, error } = await supabase
    .from('configuracao_turma')
    .select('*')
    .eq('turma_id', turmaId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function buscarTurmaAtiva() {
  const { data, error } = await supabase
    .from('turmas')
    .select('*')
    .eq('ativa', true)
    .limit(1)
    .single();
  if (error) return null;
  return data;
}
