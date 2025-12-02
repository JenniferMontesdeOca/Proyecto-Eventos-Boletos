import { useState, useEffect } from 'react'
import { Api } from '../api'

export default function Filters({ onApply }){
  const [cats, setCats] = useState([])
  const [v, setV] = useState({ category:'', search:'', date_from:'', date_to:'', location:'' })
  useEffect(()=>{ Api.categories().then(setCats).catch(()=>{}) },[])

  function apply(){
    const q = new URLSearchParams()
    if(v.category) q.set('category', v.category)
    if(v.search) q.set('search', v.search)
    if(v.date_from) q.set('date_from', v.date_from)
    if(v.date_to) q.set('date_to', v.date_to)
    if(v.location) q.set('location', v.location)
    onApply('?'+q.toString())
  }

  return (
    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      <select className="select" value={v.category} onChange={e=>setV(s=>({...s,category:e.target.value}))}>
        <option value="">Todas</option>
        {cats.map(c=> <option key={c.id} value={c.id}>{c.nombre}</option>)}
      </select>
      <input className="input" placeholder="Buscar texto…" value={v.search} onChange={e=>setV(s=>({...s,search:e.target.value}))}/>
      <input className="input" type="date" value={v.date_from} onChange={e=>setV(s=>({...s,date_from:e.target.value}))}/>
      <input className="input" type="date" value={v.date_to} onChange={e=>setV(s=>({...s,date_to:e.target.value}))}/>
      <input className="input" placeholder="Ubicación" value={v.location} onChange={e=>setV(s=>({...s,location:e.target.value}))}/>
      <button className="btn-primary" onClick={apply}>Aplicar filtros</button>
    </div>
  )
}
