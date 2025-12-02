import { useState } from 'react'
import { Api } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register(){
  const [form,setForm] = useState({ nombre:'', email:'', password:'' })
  const [msg,setMsg] = useState('')
  const nav = useNavigate()
  async function onSubmit(e){
    e.preventDefault();
    try{ await Api.register(form); setMsg('Cuenta creada. Ahora inicia sesión.'); setTimeout(()=>nav('/login'),800) }
    catch(e){ setMsg(e.message) }
  }
  return (
    <div className="container py-12 grid place-items-center">
      <form onSubmit={onSubmit} className="card w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Crear cuenta</h2>
        <input className="input" placeholder="Nombre" value={form.nombre} onChange={e=>setForm(s=>({...s,nombre:e.target.value}))} />
        <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm(s=>({...s,email:e.target.value}))} />
        <input type="password" className="input" placeholder="Contraseña" value={form.password} onChange={e=>setForm(s=>({...s,password:e.target.value}))} />
        {msg && <p className="text-sm text-slate-600">{msg}</p>}
        <button className="btn-primary w-full">Registrarme</button>
      </form>
    </div>
  )
}
