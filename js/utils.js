const SUFIXO_COORDENADOR = 'CRI4SM4SH2026';

export function gerarSenhaCoordenador(nomeCompleto) {
  const iniciais = nomeCompleto.trim().slice(0, 2).toUpperCase();
  return iniciais + SUFIXO_COORDENADOR;
}

export function validarSenhaCoordenador(nomeCompleto, senhaDigitada) {
  return gerarSenhaCoordenador(nomeCompleto) === senhaDigitada.trim();
}

export function formatarData(dataStr) {
  if (!dataStr) return '';
  const d = new Date(dataStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function formatarDataCurta(dataStr) {
  if (!dataStr) return '';
  const d = new Date(dataStr + 'T12:00:00');
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export function hojeISO() {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

export function iniciais(nome) {
  if (!nome) return '?';
  const partes = nome.trim().split(' ');
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function getStatusBadge(faltas) {
  if (faltas >= 7) return { classe: 'badge-vermelho', label: `${faltas}/7` };
  if (faltas >= 5) return { classe: 'badge-amarelo', label: `${faltas}/7` };
  return { classe: 'badge-verde', label: `${faltas}/7` };
}

export function getProgressClasse(faltas) {
  if (faltas >= 7) return 'vermelho';
  if (faltas >= 5) return 'amarelo';
  return 'verde';
}

export function showToast(msg, tipo = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = `toast ${tipo}`;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 3000);
}

export function gerarDatasCrismaAteHoje(diaSemanaCrisma, dataInicioTurma) {
  const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const targetDia = diasSemana.indexOf(diaSemanaCrisma.toLowerCase());
  if (targetDia === -1) return [];
  const datas = [];
  let atual = new Date(dataInicioTurma + 'T12:00:00');
  const hoje = new Date();
  while (atual <= hoje) {
    if (atual.getDay() === targetDia) {
      datas.push(atual.toISOString().split('T')[0]);
    }
    atual.setDate(atual.getDate() + 1);
  }
  return datas;
}

export function proximaDataCrisma(diaSemanaCrisma) {
  const diasSemana = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  const target = diasSemana.indexOf(diaSemanaCrisma.toLowerCase());
  if (target === -1) return hojeISO();
  const hoje = new Date();
  const diff = (target - hoje.getDay() + 7) % 7;
  const proxima = new Date(hoje);
  proxima.setDate(hoje.getDate() + diff);
  return proxima.toISOString().split('T')[0];
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}
