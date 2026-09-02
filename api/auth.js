import supabase from './db-client.js';

const ROLES = new Set(['Admin', 'Dentist', 'Receptionist', 'Accountant']);

function setCors(req, res) {
  const origin = process.env.APP_ORIGIN;
  if (origin) {
    res.setHeader('Vary', 'Origin');
  }
}

export function handleOptions(req, res) {
  setCors(req, res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}

function unauthorized(res, message = 'Authentication required') {
  return res.status(401).json({ error: message });
}

function forbidden(res, message = 'You do not have permission to perform this action') {
  return res.status(403).json({ error: message });
}

export async function requireAuth(req, res, allowedRoles = null) {
  setCors(req, res);

  const header = req.headers.authorization || '';
  const match = header.match(/^Bearer\s+(.+)$/i);
  if (!match) return unauthorized(res);

  const token = match[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) return unauthorized(res, 'Invalid or expired session');

  const authUser = data.user;
  let role = authUser.app_metadata?.role;
  let name = authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email || 'User';

  if (!ROLES.has(role)) {
    const { data: staff, error: staffError } = await supabase
      .from('clinic_staff')
      .select('name, role, status')
      .eq('email', authUser.email)
      .eq('status', 'Active')
      .maybeSingle();

    if (!staffError && staff && ROLES.has(staff.role)) {
      role = staff.role;
      name = staff.name || name;
    }
  }

  if (!ROLES.has(role)) {
    return forbidden(res, 'Your account is authenticated but has no active clinic role. Ask an administrator to assign your role.');
  }

  const user = { id: authUser.id, email: authUser.email, name, role };
  if (allowedRoles && !allowedRoles.includes(role)) return forbidden(res);

  req.auth = { user, supabaseUser: authUser };
  return req.auth;
}

export { setCors };
