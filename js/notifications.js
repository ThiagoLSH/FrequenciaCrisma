import { supabase } from './supabaseClient.js';
import { urlBase64ToUint8Array } from './utils.js';

const VAPID_PUBLIC_KEY = 'BK9VGIHTTQBpc7lTwerEtrAYL94qJKKx8XvUVQ2T_jTmGQVKOAMOI8iCwatgEqdayOwqIhCec0lmznIwyttIT8U';

export async function ativarNotificacoes(usuarioId) {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    return { ok: false, motivo: 'Navegador não suporta notificações' };
  }

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    return { ok: false, motivo: 'Permissão negada pelo usuário' };
  }

  const reg = await navigator.serviceWorker.ready;
  const existing = await reg.pushManager.getSubscription();
  if (existing) await existing.unsubscribe();

  const subscription = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
  });

  const { error } = await supabase.from('push_subscriptions').insert({
    usuario_id: usuarioId,
    subscription_json: subscription.toJSON()
  });

  if (error) return { ok: false, motivo: 'Erro ao salvar subscription' };
  return { ok: true };
}

export async function verificarPermissaoNotificacao() {
  if (!('Notification' in window)) return 'unavailable';
  return Notification.permission;
}
