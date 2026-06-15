import { supabase } from './supabaseClient.js';

let slideAtual = 0;
const slides   = document.querySelectorAll('.slide');
const dots     = document.querySelectorAll('.dot');
const btnProximo = document.getElementById('btnProximo');
const btnPular   = document.getElementById('btnPular');

function mostrarSlide(index) {
  slides.forEach((s, i) => s.classList.toggle('active', i === index));
  dots.forEach((d, i) => d.classList.toggle('active', i === index));
  btnProximo.textContent = index === slides.length - 1 ? 'Começar' : 'Próximo';
}

btnProximo?.addEventListener('click', async () => {
  if (slideAtual < slides.length - 1) {
    slideAtual++;
    mostrarSlide(slideAtual);
  } else {
    await finalizarOnboarding();
  }
});

btnPular?.addEventListener('click', finalizarOnboarding);

async function finalizarOnboarding() {
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('usuarios').update({ onboarding_visto: true }).eq('id', user.id);
  }
  localStorage.setItem('onboarding_visto', 'true');
  window.location.href = '/dashboard.html';
}

mostrarSlide(0);
