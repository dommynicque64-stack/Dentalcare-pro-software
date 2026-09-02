import supabase from './db-client.js';
import { handleOptions, requireAuth } from './auth.js';
export default async function handler(req, res) {
  if (handleOptions(req, res)) return;
  try {
    if (req.method === 'GET') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist', 'Receptionist', 'Accountant']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'POST') {
      const auth = await requireAuth(req, res, ['Admin', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'PUT') {
      const auth = await requireAuth(req, res, ['Admin', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'DELETE') {
      const auth = await requireAuth(req, res, ['Admin']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'GET') {
      const { search, status, gender, page='1', limit='10', sort='id', order='asc' } = req.query;
      let query = supabase.from('patients').select('*', { count: 'exact' });
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,patient_id.ilike.%${search}%,phone.ilike.%${search}%`);
      }
      if (status && status!=='all') query = query.eq('status', status);
      if (gender && gender!=='all') query = query.eq('gender', gender);
      const pg = Math.max(1, Math.min(10000, Number.parseInt(page, 10) || 1));
      const lim = Math.max(1, Math.min(100, Number.parseInt(limit, 10) || 10));
      const from = (pg-1)*lim; const to = from+lim-1;
      const allowedSorts = new Set(['id','patient_id','first_name','last_name','dob','gender','status','last_visit','created_at']);
      const safeSort = allowedSorts.has(sort) ? sort : 'id';
      const isAsc = order==='asc';
      query = query.order(safeSort, { ascending: isAsc }).range(from, to);
      const { data, error, count } = await query;
      if (error) throw error;
      return res.status(200).json({ data, count, page: pg, limit: lim });
    }
    if (req.method === 'POST') {
      const body = req.body;
      // generate patient_id
      const { count } = await supabase.from('patients').select('*', { count:'exact', head:true });
      const num = (count||0)+1;
      const pid = `PT-${new Date().getFullYear()}-${String(num).padStart(4,'0')}`;
      const payload = {
        patient_id: pid,
        first_name: body.first_name,
        last_name: body.last_name,
        phone: body.phone,
        email: body.email || null,
        dob: body.dob,
        gender: body.gender,
        address: body.address || null,
        insurance: body.insurance || null,
        allergies: body.allergies || null,
        medical_history: body.medical_history || null,
        status: body.status || 'Active',
        outstanding_balance: body.outstanding_balance || 0,
        last_visit: body.last_visit || new Date().toISOString(),
      };
      const { data, error } = await supabase.from('patients').insert(payload).select().single();
      if (error) throw error;
      return res.status(201).json(data);
    }
    if (req.method === 'PUT') {
      const { id, ...rest } = req.body;
      if (!id) return res.status(400).json({ error: 'id required' });
      const { data, error } = await supabase.from('patients').update(rest).eq('id', id).select().single();
      if (error) throw error;
      return res.status(200).json(data);
    }
    if (req.method === 'DELETE') {
      const { id } = req.body;
      const { error } = await supabase.from('patients').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ ok:true });
    }
    return res.status(405).json({ error:'Method not allowed' });
  } catch(e){ console.error(e); return res.status(500).json({ error:e.message }); }
}
