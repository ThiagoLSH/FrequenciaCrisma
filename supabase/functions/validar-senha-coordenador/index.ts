import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { nomeCompleto, senhaDigitada } = await req.json();

    if (!nomeCompleto || !senhaDigitada) {
      return new Response(
        JSON.stringify({ valido: false, erro: 'Dados incompletos' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const SUFIXO = Deno.env.get('SUFIXO_COORDENADOR') ?? 'CRI4SM4SH2026';
    const iniciais = nomeCompleto.trim().slice(0, 2).toUpperCase();
    const senhaEsperada = iniciais + SUFIXO;
    const valido = senhaEsperada === senhaDigitada.trim();

    return new Response(
      JSON.stringify({ valido }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valido: false, erro: 'Erro interno' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
