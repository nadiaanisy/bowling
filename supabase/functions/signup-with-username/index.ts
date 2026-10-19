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
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const { name, username, password } = body ?? {};

    if (
      typeof name !== 'string' ||
      typeof username !== 'string' ||
      typeof password !== 'string' ||
      !name.trim() ||
      !username.trim() ||
      password.length < 3 ||
      password.length > 1024 ||
      name.trim().length > 100 ||
      username.trim().length > 100
    ) {
      return jsonResponse(
        {
          error:
            'Please provide a valid name, username and password (at least 3 characters).',
        },
        400,
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
      console.error('Signup environment configuration is missing');
      return jsonResponse({ error: 'Signup service unavailable' }, 500);
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });

    const cleanName = name.trim();
    const cleanUsername = username.trim();
    const normalizedUsername = cleanUsername.toLowerCase();

    // Check username uniqueness.
    const { data: existingUser, error: existingError } = await adminClient
      .from('user')
      .select('id')
      .ilike('user_name', normalizedUsername)
      .limit(1)
      .maybeSingle();

    if (existingError) {
      console.error('Username availability check failed', existingError);
      return jsonResponse({ error: 'Signup service unavailable' }, 500);
    }

    if (existingUser) {
      return jsonResponse({ error: 'That username is already in use.' }, 409);
    }

    const internalEmail = `${normalizedUsername}@users.bowling-project.invalid`;

    // Create the Supabase Auth account.
    const { data: authData, error: authError } =
      await adminClient.auth.admin.createUser({
        email: internalEmail,
        password,
        email_confirm: true,
      });

    if (authError || !authData.user) {
      if (authError?.message.toLowerCase().includes('already')) {
        return jsonResponse({ error: 'That username is already in use.' }, 409);
      }

      console.error('Auth account creation failed', authError);
      return jsonResponse({ error: 'Unable to create account.' }, 400);
    }

    // Create the Bowling Project profile.
    const { data: profile, error: profileError } = await adminClient
      .from('user')
      .insert({
        name: cleanName,
        user_name: cleanUsername,
        auth_user_id: authData.user.id,
        password: null,
      })
      .select('id, name, user_name, created_at, updated_at')
      .single();

    if (profileError || !profile) {
      console.error('Profile creation failed', profileError);

      await adminClient.auth.admin.deleteUser(authData.user.id);

      if (profileError?.code === '23505') {
        return jsonResponse({ error: 'That username is already in use.' }, 409);
      }

      return jsonResponse({ error: 'Unable to create account profile.' }, 500);
    }

    // Create the username-to-email lookup used by login.
    const { error: lookupError } = await adminClient.rpc(
      'create_username_auth_lookup',
      {
        p_username: normalizedUsername,
        p_auth_email: internalEmail,
        p_auth_user_id: authData.user.id,
      },
    );

    if (lookupError) {
      console.error('Username lookup creation failed', lookupError);

      // Roll back the profile and Auth account.
      await adminClient.from('user').delete().eq('id', profile.id);

      await adminClient.auth.admin.deleteUser(authData.user.id);

      return jsonResponse({ error: 'Unable to finish account setup.' }, 500);
    }

    // Return the profile only; do not create a frontend session.
    return jsonResponse({ profile }, 201);
  } catch (error) {
    console.error('Signup failed', error);
    return jsonResponse({ error: 'Signup service unavailable' }, 500);
  }
});
