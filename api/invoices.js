import supabase from './db-client.js';
import { handleOptions, requireAuth } from './auth.js';
export default async function handler(req,res){
  if (handleOptions(req, res)) return;
  try{
    if (req.method === 'GET') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist', 'Receptionist', 'Accountant']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'POST') {
      const auth = await requireAuth(req, res, ['Admin', 'Accountant', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'PUT') {
      const auth = await requireAuth(req, res, ['Admin', 'Accountant', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'DELETE') {
      const auth = await requireAuth(req, res, ['Admin', 'Accountant']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if(req.method==='GET'){
      const { patient_id, status }=req.query;
      let q=supabase.from('invoices').select('*').order('created_at', {ascending:false});
      if(patient_id) q=q.eq('patient_id', patient_id);
      if(status && status!=='all') q=q.eq('status', status);
      const { data, error }=await q;
      if(error) throw error;
      return res.status(200).json(data);
    }
    if(req.method==='POST'){
      const b=req.body || {};
      const amount = Number(b.amount);
      if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error:'amount must be a positive number' });
      const invoice_no = `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
      const { data, error }=await supabase.from('invoices').insert({
        invoice_no,
        patient_id:b.patient_id,
        patient_name:b.patient_name||null,
        amount,
        paid:b.paid||0,
        status:b.status||'Unpaid',
        due_date:b.due_date|| new Date().toISOString().split('T')[0],
        items:b.items|| null,
        notes:b.notes||null
      }).select().single();
      if(error) throw error;
      return res.status(201).json(data);
    }
    if(req.method==='PUT'){
      const {id,...rest}=req.body;
      const {data,error}=await supabase.from('invoices').update(rest).eq('id',id).select().single();
      if(error) throw error;
      return res.status(200).json(data);
    }
    if(req.method==='DELETE'){
      const {id}=req.body;
      const {error}=await supabase.from('invoices').delete().eq('id',id);
      if(error) throw error;
      return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
