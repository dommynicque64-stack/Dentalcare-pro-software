import supabase from './db-client.js';
import { handleOptions, requireAuth } from './auth.js';
export default async function handler(req,res){
  if (handleOptions(req, res)) return;
  try{
    if (req.method === 'GET') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'POST') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'PUT') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if (req.method === 'DELETE') {
      const auth = await requireAuth(req, res, ['Admin', 'Receptionist']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    if(req.method==='GET'){
      const { date, dentist_id, status, patient_id } = req.query;
      let q = supabase.from('appointments').select('*').order('date', {ascending:true}).order('start_time', {ascending:true});
      if(date) q=q.eq('date', date);
      if(dentist_id) q=q.eq('dentist_id', dentist_id);
      if(status && status!=='all') q=q.eq('status', status);
      if(patient_id) q=q.eq('patient_id', patient_id);
      const {data, error} = await q;
      if(error) throw error;
      return res.status(200).json(data);
    }
    if(req.method==='POST'){
      const b = req.body || {};
      if (!b.patient_id || !b.dentist_id || !b.date || !b.start_time || !b.end_time) return res.status(400).json({ error:'patient_id, dentist_id, date, start_time and end_time are required' });
      // overlap check for same dentist same date
      const { data: existing, error: exErr } = await supabase.from('appointments').select('*').eq('dentist_id', b.dentist_id).eq('date', b.date).neq('status','Cancelled');
      if(exErr) throw exErr;
      const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
      const ns = toMin(b.start_time); const ne = toMin(b.end_time);
      if (!Number.isFinite(ns) || !Number.isFinite(ne) || ne <= ns) return res.status(400).json({ error:'Invalid appointment time range' });
      for(const ap of existing||[]){
        const s=toMin(ap.start_time); const e=toMin(ap.end_time);
        if(ns < e && ne > s){
          return res.status(409).json({ error:`Overlaps with ${ap.start_time}-${ap.end_time} for this dentist` });
        }
      }
      const payload = {
        patient_id: b.patient_id,
        dentist_id: b.dentist_id,
        dentist_name: b.dentist_name,
        date: b.date,
        start_time: b.start_time,
        end_time: b.end_time,
        duration: b.duration || (ne-ns),
        type: b.type,
        status: b.status || 'Scheduled',
        notes: b.notes || null,
        patient_name: b.patient_name || null
      };
      const { data, error } = await supabase.from('appointments').insert(payload).select().single();
      if(error) throw error;
      return res.status(201).json(data);
    }
    if(req.method==='PUT'){
      const { id, ...rest } = req.body;
      if(!id) return res.status(400).json({error:'id required'});
      // if time/dentist changed, recheck overlap
      if(rest.start_time && rest.end_time && rest.dentist_id && rest.date){
        const { data: existing } = await supabase.from('appointments').select('*').eq('dentist_id', rest.dentist_id).eq('date', rest.date).neq('id', id).neq('status','Cancelled');
        const toMin = t => { const [h,m]=t.split(':').map(Number); return h*60+m; };
        const ns=toMin(rest.start_time); const ne=toMin(rest.end_time);
        for(const ap of existing||[]){
          const s=toMin(ap.start_time); const e=toMin(ap.end_time);
          if(ns<e && ne>s) return res.status(409).json({error:'Time slot overlaps for this dentist'});
        }
      }
      const { data, error } = await supabase.from('appointments').update(rest).eq('id', id).select().single();
      if(error) throw error;
      return res.status(200).json(data);
    }
    if(req.method==='DELETE'){
      const { id }=req.body;
      const { error }=await supabase.from('appointments').delete().eq('id', id);
      if(error) throw error;
      return res.status(200).json({ok:true});
    }
    return res.status(405).json({error:'Method not allowed'});
  }catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
}
