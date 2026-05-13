import './Loading.css'

function Loading({ label = 'Cargando productos' }) {
  return (
    <div className="loading" role="status">
      <span></span>
      <p>{label}</p>
    </div>
  )
}

export default Loading
