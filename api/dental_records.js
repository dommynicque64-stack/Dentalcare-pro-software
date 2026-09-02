import supabase from './db-client.js';
import { handleOptions, requireAuth } from './auth.js';
export default async function handler(req,res){
  if (handleOptions(req, res)) return;
  try{
    if (req.method === 'GET') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'POST') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'PUT') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'DELETE') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if(req.method==='GET'){
      const {patient_id}=req.query;
      let q=supabase.from('dental_records').select('*').order('created_at',{ascending:false});
      if(patient_id) q=q.eq('patient_id', patient_id);
      const {data,error}=await q;
      if(error) throw error; return res.status(200).json(data);
    }
    if(req.method==='POST'){
      const b=req.body;
      const {data,error}=await supabase.from('dental_records').insert({
        patient_id:b.patient_id, tooth:b.tooth, diagnosis:b.diagnosis, procedure:b.procedure, notes:b.notes||null, dentist_name:b.dentist_name||null, date:b.date|| new Date().toISOString().split('T')[0]
      }).select().single();
      if(error) throw error; return res.status(201).json(data);
    }
    if(req.method==='PUT'){
      const {id,...rest}=req.body;
      const {data,error}=await supabase.from('dental_records').update(rest).eq('id',id).select().single();
      if(error) throw error; return res.status(200).json(data);
    }
    if(req.method==='DELETE'){
      const {id}=req.body;
      const {error}=await supabase.from('dental_records').delete().eq('id',id);
      if(error) throw error; return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){return res.status(500).json({error:e.message});}
}
