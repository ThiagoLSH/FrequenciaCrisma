import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// @ts-ignore
import webpush from 'npm:web-push';

serve(async (_req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  // Busca todas as turmas ativas e suas configs
  const { data: turmas } = await supabase
    .from('turmas')
    .select('id, nome')
    .eq('ativa', true);

  if (!turmas?.length) return new Response('Sem turmas ativas', { status: 200 });

  const agora = new Date();
  // Ajusta para horário de Brasília (UTC-3)
  const agoraBrasilia = new Date(agora.getTime() - 3 * 60 * 60 * 1000);
  const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const diaSemanaHoje = diasSemana[agoraBrasilia.getDay()];
  const horaAtual = agoraBrasilia.toTimeString().slice(0, 5);
  const dataFormatada = agoraBrasilia.toLocaleDateString('pt-BR');

  for (const turma of turmas) {
    const { data: config } = await supabase
      .from('configuracao_turma')
      .select('*')
      .eq('turma_id', turma.id)
      .maybeSingle();

    if (!config) continue;
    if (diaSemanaHoje !== config.dia_semana_crisma) continue;
    if (horaAtual < config.horario_fim) continue;

    // Busca subscriptions dos usuários desta turma
    const { data: subs } = await supabase
      .from('push_subscriptions')
      .select('*, usuarios!inner(nome_completo, turma_id)')
      .eq('usuarios.turma_id', turma.id);

    if (!subs?.length) continue;

    webpush.setVapidDetails(
      'mailto:' + (Deno.env.get('VAPID_EMAIL') ?? 'admin@crisma.com'),
      Deno.env.get('VAPID_PUBLIC_KEY') ?? '',
      Deno.env.get('VAPID_PRIVATE_KEY') ?? ''
    );

    for (const sub of subs) {
      const payload = JSON.stringify({
        title: 'Lembrete de Frequência',
        body: `Olá ${sub.usuarios.nome_completo}, a crisma do dia ${dataFormatada} já está finalizando, lembre-se de enviar a frequência do dia.`
      });

      try {
        await webpush.sendNotification(sub.subscription_json, payload);
      } catch (_) {
        // Subscription expirada — remove
        await supabase.from('push_subscriptions').delete().eq('id', sub.id);
      }
    }
  }

  return new Response('Notificações enviadas', { status: 200 });
});
