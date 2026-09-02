import supabase from './db-client.js';
import { handleOptions, requireAuth } from './auth.js';
export default async function handler(req,res){
  if (handleOptions(req, res)) return;
  try{
    if (req.method === 'GET') {
      const auth = await requireAuth(req, res, ['Admin']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'POST') {
      const auth = await requireAuth(req, res, ['Admin']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'PUT') {
      const auth = await requireAuth(req, res, ['Admin']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'DELETE') {
      const auth = await requireAuth(req, res, ['Admin']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if(req.method==='GET'){
      const { role, status }=req.query;
      let q=supabase.from('clinic_staff').select('*').order('id', {ascending:true});
      if(role && role!=='all') q=q.eq('role', role);
      if(status && status!=='all') q=q.eq('status', status);
      const { data, error }=await q;
      if(error) throw error;
      return res.status(200).json(data);
    }
    if(req.method==='POST'){
      const b=req.body;
      const { data, error }=await supabase.from('clinic_staff').insert({
        name:b.name,
        email:b.email,
        role:b.role,
        specialty:b.specialty||null,
        phone:b.phone||null,
        status:b.status||'Active'
      }).select().single();
      if(error) throw error;
      return res.status(201).json(data);
    }
    if(req.method==='PUT'){
      const {id,...rest}=req.body;
      const {data,error}=await supabase.from('clinic_staff').update(rest).eq('id',id).select().single();
      if(error) throw error;
      return res.status(200).json(data);
    }
    if(req.method==='DELETE'){
      const {id}=req.body;
      const {error}=await supabase.from('clinic_staff').delete().eq('id',id);
      if(error) throw error;
      return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
