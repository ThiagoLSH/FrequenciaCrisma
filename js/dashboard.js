import { supabase } from './supabaseClient.js';
import { buscarSaudeFrequencia } from './frequencia.js';
import { getStatusBadge, getProgressClasse } from './utils.js';

export async function carregarDashboard(turmaId) {
  const dados = await buscarSaudeFrequencia(turmaId);

  const total    = dados.length;
  const atencao  = dados.filter(d => d.status_saude === 'atencao').length;
  const reprovados = dados.filter(d => d.status_saude === 'reprovado').length;
  const { data: pendentes } = await supabase
    .from('frequencia')
    .select('id', { count: 'exact' })
    .eq('status_justificativa', 'pendente')
    .eq('turma_id', turmaId);

  return { dados, total, atencao, reprovados, pendentes: pendentes?.length || 0 };
}

export function renderizarLinhaDashboard(crismando) {
  const { classe, label } = getStatusBadge(crismando.faltas_nao_justificaveis);
  const progClasse = getProgressClasse(crismando.faltas_nao_justificaveis);
  const pct = Math.min((crismando.faltas_nao_justificaveis / 7) * 100, 100);

  return `
    <div class="crismando-card" onclick="window.location.href='/crismando-detalhe.html?id=${crismando.crismando_id}'">
      <div style="flex:1">
        <div class="nome">${crismando.nome_completo}</div>
        <div class="progress-bar" style="margin-top:8px">
          <div class="progress-fill ${progClasse}" style="width:${pct}%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;margin-top:4px">
          <span style="font-size:12px;color:var(--cinza-texto)">Justificadas: ${crismando.faltas_justificadas}</span>
          <span style="font-size:12px;color:var(--cinza-texto)">Pendentes: ${crismando.justificativas_pendentes}</span>
        </div>
      </div>
      <span class="badge ${classe}" style="flex-shrink:0">${label}</span>
    </div>
  `;
}

export function renderizarGrafico(dados) {
  const ok        = dados.filter(d => d.status_saude === 'ok').length;
  const atencao   = dados.filter(d => d.status_saude === 'atencao').length;
  const reprovado = dados.filter(d => d.status_saude === 'reprovado').length;

  const ctx = document.getElementById('grafico-saude')?.getContext('2d');
  if (!ctx) return;
  if (window.__dashChart) window.__dashChart.destroy();

  window.__dashChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['OK', 'Atenção', 'Reprovado'],
      datasets: [{
        data: [ok, atencao, reprovado],
        backgroundColor: ['#16A34A', '#FACC15', '#DC2626'],
        borderWidth: 0,
        hoverOffset: 6
      }]
    },
    options: {
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { family: 'Barlow Condensed', size: 14, weight: '600' }, padding: 16 }
        }
      }
    }
  });
}
