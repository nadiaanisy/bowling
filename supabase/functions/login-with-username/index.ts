import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import '@supabase/functions-js/edge-runtime.d.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const jsonResponse = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const { username, password } = await req.json();

    if (
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !username.trim() ||
      !password ||
      username.length > 100 ||
      password.length > 1024
    ) {
      return jsonResponse({ error: 'Invalid username or password' }, 400);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const secretKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !secretKey) {
      console.error('Required Supabase environment configuration is missing');
      return jsonResponse({ error: 'Login service unavailable' }, 500);
    }

    if (!secretKey) {
      console.error('No Supabase secret API key is configured');
      return jsonResponse({ error: 'Login service unavailable' }, 500);
    }

    const adminClient = createClient(supabaseUrl, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: email, error: lookupError } = await adminClient.rpc(
      'lookup_auth_email_for_username',
      { p_username: username.trim() },
    );

    if (lookupError || typeof email !== 'string' || !email) {
      return jsonResponse({ error: 'Invalid username or password' }, 401);
    }

    // Use a separate client for password verification and session creation.
    // Never return the secret key to the browser.
    const publicKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!publicKey) {
      console.error('No Supabase publishable API key is configured');
      return jsonResponse({ error: 'Login service unavailable' }, 500);
    }

    const authClient = createClient(supabaseUrl, publicKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data, error: authError } = await authClient.auth.signInWithPassword(
      {
        email,
        password,
      },
    );

    if (authError || !data.session || !data.user) {
      return jsonResponse({ error: 'Invalid username or password' }, 401);
    }

    return jsonResponse(
      {
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
        },
        user: {
          id: data.user.id,
          email: data.user.email,
        },
      },
      200,
    );
  } catch (error) {
    console.error('Username login failed', error);
    return jsonResponse({ error: 'Login service unavailable' }, 500);
  }
});
