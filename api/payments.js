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
    if (req.method === 'DELETE') {
      const auth = await requireAuth(req, res, ['Admin', 'Accountant']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if(req.method==='GET'){
      const { patient_id, invoice_id }=req.query;
      let q=supabase.from('payments').select('*').order('date', {ascending:false});
      if(patient_id) q=q.eq('patient_id', patient_id);
      if(invoice_id) q=q.eq('invoice_id', invoice_id);
      const { data, error }=await q;
      if(error) throw error;
      return res.status(200).json(data);
    }
    if(req.method==='POST'){
      const b=req.body || {};
      const amount = Number(b.amount);
      if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ error:'amount must be a positive number' });
      const { data, error }=await supabase.from('payments').insert({
        invoice_id:b.invoice_id||null,
        patient_id:b.patient_id,
        patient_name:b.patient_name||null,
        amount,
        method:b.method||'Cash',
        date:b.date|| new Date().toISOString().split('T')[0],
        reference:b.reference||null
      }).select().single();
      if(error) throw error;
      // also update invoice paid amount if linked
      if(b.invoice_id){
        const { data: inv } = await supabase.from('invoices').select('*').eq('id', b.invoice_id).single();
        if(inv){
          const newPaid = Number(inv.paid||0)+amount;
          const newStatus = newPaid >= Number(inv.amount) ? 'Paid' : newPaid>0 ? 'Partial' : 'Unpaid';
          await supabase.from('invoices').update({ paid:newPaid, status:newStatus }).eq('id', b.invoice_id);
        }
      }
      // update patient outstanding
      if(b.patient_id){
        const { data: pats } = await supabase.from('patients').select('*').eq('id', b.patient_id).single();
        if(pats){
          const newBal = Math.max(0, Number(pats.outstanding_balance||0)-amount);
          await supabase.from('patients').update({ outstanding_balance:newBal }).eq('id', b.patient_id);
        }
      }
      return res.status(201).json(data);
    }
    if(req.method==='DELETE'){
      const {id}=req.body;
      const {error}=await supabase.from('payments').delete().eq('id',id);
      if(error) throw error;
      return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){ return res.status(500).json({error:e.message}); }
}
