import supabase from './db-client.js';
import { handleOptions, requireAuth } from './auth.js';
function monthlyStartDate(){
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 5);
  return d.toISOString().split('T')[0];
}

export default async function handler(req,res){
  if (handleOptions(req, res)) return;
  try{
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    if (req.method === 'GET') {
      const auth = await requireAuth(req, res, ['Admin', 'Dentist', 'Receptionist', 'Accountant']);
      if (!auth) return;
      req.authUser = auth.user;
    }
    const today = new Date().toISOString().split('T')[0];
    // total patients
    const { count: totalPatients } = await supabase.from('patients').select('*', {count:'exact', head:true});
    // today's appointments
    const { data: todayApts } = await supabase.from('appointments').select('*').eq('date', today);
    const todayCount = todayApts?.length||0;
    const pending = todayApts?.filter(a=>a.status==='Scheduled'||a.status==='Confirmed').length||0;
    // outstanding payments sum
    const { data: invoices } = await supabase.from('invoices').select('amount,paid');
    const outstanding = invoices?.reduce((s,i)=> s + (Number(i.amount)-Number(i.paid)),0) || 0;
    // today revenue
    const { data: paymentsToday } = await supabase.from('payments').select('amount').eq('date', today);
    const todayRevenue = paymentsToday?.reduce((s,p)=> s+Number(p.amount),0) || 0;
    // recent patients
    const { data: recentPatients } = await supabase
      .from('patients')
      .select('id,patient_id,first_name,last_name,phone,last_visit,outstanding_balance,status')
      .order('created_at', {ascending:false})
      .limit(5);
    // revenue chart last 7 days
    const dates=[]; for(let i=6;i>=0;i--){ const d=new Date(); d.setDate(d.getDate()-i); dates.push(d.toISOString().split('T')[0]); }
    const monthlyStart = monthlyStartDate();
    const { data: allPayments } = await supabase.from('payments').select('amount,date').gte('date', monthlyStart);
    const revenueByDay = dates.map(d=>({ date: d.slice(5), revenue: (allPayments||[]).filter(p=>p.date===d).reduce((s,p)=>s+Number(p.amount),0) }));
    // monthly revenue last 6 months
    const monthly=[]; for(let i=5;i>=0;i--){ const d=new Date(); d.setMonth(d.getMonth()-i); const m=d.toISOString().slice(0,7); monthly.push(m); }
    const monthlyRevenue = monthly.map(m=>({ month: m, revenue: (allPayments||[]).filter(p=>p.date.startsWith(m)).reduce((s,p)=>s+Number(p.amount),0)}));
    return res.status(200).json({
      kpis:{ totalPatients: totalPatients||0, todayCount, pending, outstanding, todayRevenue },
      recentPatients: recentPatients||[],
      revenueByDay,
      monthlyRevenue,
      todayAppointments: todayApts||[]
    });
  }catch(e){ console.error(e); return res.status(500).json({error:e.message}); }
}
