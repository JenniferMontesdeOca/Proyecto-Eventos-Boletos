export default function Pagination({ page, limit, total, onChange }){
  const pages = Math.ceil(total/limit)||1
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button className="btn-ghost" disabled={page<=1} onClick={()=>onChange(page-1)}>Anterior</button>
      <span className="badge">{page} / {pages}</span>
      <button className="btn-ghost" disabled={page>=pages} onClick={()=>onChange(page+1)}>Siguiente</button>
    </div>
  )
}
