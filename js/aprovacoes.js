import { buscarJustificativasPendentes, decidirJustificativa } from './frequencia.js';
import { formatarData, showToast } from './utils.js';

export async function carregarAprovacoes(turmaId) {
  return await buscarJustificativasPendentes(turmaId);
}

export function renderizarAprovacao(item, onDecisao) {
  const div = document.createElement('div');
  div.className = 'aprovacao-card fade-in-up';
  div.dataset.id = item.id;
  div.innerHTML = `
    <div class="data">${formatarData(item.data_falta)} — registrado por ${item.usuarios?.nome_completo || 'desconhecido'}</div>
    <div class="nome" style="font-size:17px;font-weight:700">${item.crismandos?.nome_completo}</div>
    <div class="justificativa-text">"${item.justificativa}"</div>
    <div class="aprovacao-actions">
      <button class="btn-success" data-action="aprovada">✓ Aprovar</button>
      <button class="btn-danger"  data-action="recusada">✗ Recusar</button>
    </div>
  `;

  div.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const decisao = btn.dataset.action;
      btn.disabled = true;
      try {
        await decidirJustificativa(item.id, decisao);
        div.style.opacity = '0';
        div.style.transition = 'opacity 0.3s ease';
        setTimeout(() => div.remove(), 300);
        showToast(decisao === 'aprovada' ? 'Justificativa aprovada' : 'Justificativa recusada',
                  decisao === 'aprovada' ? 'success' : 'error');
        if (onDecisao) onDecisao();
      } catch (e) {
        showToast('Erro ao processar decisão', 'error');
        btn.disabled = false;
      }
    });
  });

  return div;
}
