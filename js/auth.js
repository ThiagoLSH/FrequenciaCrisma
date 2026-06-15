import { supabase } from './supabaseClient.js';
import { validarSenhaCoordenador, showToast } from './utils.js';

export async function getUsuarioAtual() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from('usuarios').select('*').eq('id', user.id).single();
  return data;
}

export async function logout() {
  await supabase.auth.signOut();
  window.location.href = '/index.html';
}

export async function protegerPagina(requerCoordenador = false) {
  const usuario = await getUsuarioAtual();
  if (!usuario) {
    window.location.href = '/index.html';
    return null;
  }
  if (requerCoordenador && usuario.tipo_acesso !== 'coordenador') {
    window.location.href = '/dashboard.html';
    return null;
  }
  return usuario;
}

export async function redirecionarAposLogin(usuario) {
  if (!usuario.onboarding_visto) {
    window.location.href = '/onboarding.html';
    return;
  }
  const { data: config } = await supabase
    .from('configuracao_turma')
    .select('id')
    .eq('turma_id', usuario.turma_id)
    .maybeSingle();

  if (!config && usuario.tipo_acesso === 'coordenador') {
    window.location.href = '/anamnese.html';
    return;
  }
  window.location.href = '/dashboard.html';
}

export async function fazerLogin(email, senha) {
  const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
  if (error) throw error;
  const usuario = await getUsuarioAtual();
  await redirecionarAposLogin(usuario);
}

export async function loginGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/auth-callback.html' }
  });
  if (error) showToast('Erro ao iniciar login com Google', 'error');
}

export async function cadastrar({ nomeCompleto, email, senha, isCoordenador, senhaCoordenador, nucleo, turmaId }) {
  if (isCoordenador) {
    const res = await fetch('/api/validar-coordenador', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeCompleto, senhaDigitada: senhaCoordenador })
    });

    let valido = false;
    if (res.ok) {
      const json = await res.json();
      valido = json.valido;
    } else {
      valido = validarSenhaCoordenador(nomeCompleto, senhaCoordenador);
    }

    if (!valido) {
      throw new Error('Senha de coordenador inválida. Verifique com a coordenação.');
    }
  }

  const { data: authData, error: authErr } = await supabase.auth.signUp({ email, password: senha });
  if (authErr) throw authErr;

  const userId = authData.user?.id;
  if (!userId) throw new Error('Erro ao criar conta. Tente novamente.');

  const { error: insertErr } = await supabase.from('usuarios').insert({
    id: userId,
    nome_completo: nomeCompleto,
    email,
    tipo_acesso: isCoordenador ? 'coordenador' : 'nucleo',
    nucleo: isCoordenador ? null : (nucleo || null),
    turma_id: turmaId || null,
    anamnese_completa: false,
    onboarding_visto: false
  });
  if (insertErr) throw insertErr;

  return authData;
}

export async function recuperarSenha(email) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/index.html'
  });
  if (error) throw error;
}
