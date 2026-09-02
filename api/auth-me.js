import { handleOptions, requireAuth } from './auth.js';

export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const auth = await requireAuth(req, res);
    if (!auth) return;
    return res.status(200).json({ user: auth.user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Unable to load user profile' });
  }
}
