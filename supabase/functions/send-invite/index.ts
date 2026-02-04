import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const RESEND_FROM_EMAIL = Deno.env.get('RESEND_FROM_EMAIL') ?? 'no-reply@yourdomain.com';
const APP_BASE_URL = Deno.env.get('APP_BASE_URL') ?? 'http://localhost:5173';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ sent: false, error: 'Missing Supabase config' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const authHeader = req.headers.get('Authorization') ?? '';
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const { data: userData } = await supabase.auth.getUser();
    if (!userData?.user) {
      return new Response(JSON.stringify({ sent: false, error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id)
      .maybeSingle();
    if (roleError || !roleData || !['invites', 'super_admin'].includes(roleData.role)) {
      return new Response(JSON.stringify({ sent: false, error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { email, token, role } = await req.json();
    if (!email || !token) {
      return new Response(JSON.stringify({ sent: false, error: 'Missing email or token' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ sent: false, error: 'Missing RESEND_API_KEY' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const inviteUrl = `${APP_BASE_URL}/register/${token}`;
    const subject = 'Zaproszenie do rejestracji administracyjnej';
    const html = `
      <div style="font-family: ui-sans-serif, system-ui; line-height:1.6; color:#0f172a;">
        <h2>Zaproszenie do panelu reguł</h2>
        <p>Otrzymałeś zaproszenie na rolę <strong>${role ?? 'admin'}</strong>.</p>
        <p>Kliknij w link, aby dokończyć rejestrację:</p>
        <p><a href="${inviteUrl}">${inviteUrl}</a></p>
        <p>Jeśli nie spodziewałeś się tej wiadomości, zignoruj ją.</p>
      </div>
    `;

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: RESEND_FROM_EMAIL,
        to: [email],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(JSON.stringify({ sent: false, error: text }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ sent: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (_err) {
    return new Response(JSON.stringify({ sent: false, error: 'Server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
