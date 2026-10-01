import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { obtenerMoto, crearMoto, editarMoto } from './productosService'

const vacio = { marca: '', modelo: '', precio: '', cilindrada: '', imagen: '', stock: '', estado: 'Disponible', descripcion: '' }

function ProductoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(() => (id && obtenerMoto(id)) || vacio)

  function manejarCambio(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  function manejarSubmit(e) {
    e.preventDefault()
    const listo = { ...datos, precio: Number(datos.precio), stock: Number(datos.stock) }
    if (id) editarMoto(id, listo)
    else crearMoto(listo)
    navigate('/gestor/productos')
  }

  return (
    <section>
      <h2 className="mb-3">{id ? 'Editar moto' : 'Nueva moto'}</h2>
      <form onSubmit={manejarSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Marca</label>
            <input name="marca" className="form-control" value={datos.marca} onChange={manejarCambio} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Modelo</label>
            <input name="modelo" className="form-control" value={datos.modelo} onChange={manejarCambio} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Precio</label>
            <input name="precio" type="number" className="form-control" value={datos.precio} onChange={manejarCambio} required />
          </div>
          <div className="col-md-6">
  <label className="form-label">Cilindrada</label>
  <input name="cilindrada" className="form-control" placeholder="Ej: 200 cc" value={datos.cilindrada} onChange={manejarCambio} required />
</div>
<div className="col-md-6">
  <label className="form-label">Stock</label>
  <input name="stock" type="number" min="0" className="form-control" value={datos.stock} onChange={manejarCambio} required />
</div>
<div className="col-md-6">
  <label className="form-label">Estado</label>
  <select name="estado" className="form-select" value={datos.estado} onChange={manejarCambio}>
    <option>Disponible</option>
    <option>Agotado</option>
    <option>Próximamente</option>
  </select>
</div>
<div className="col-12">
  <label className="form-label">Imagen (ruta)</label>
  <input name="imagen" className="form-control" placeholder="/img/productos/mi-moto.jpg" value={datos.imagen} onChange={manejarCambio} />
</div>
<div className="col-12">
  <label className="form-label">Descripción</label>
  <textarea name="descripcion" rows="3" className="form-control" value={datos.descripcion} onChange={manejarCambio} />
</div>
        </div>

        <div className="d-flex gap-2 mt-3">
          <button type="submit" className="btn btn-primary">Guardar</button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/gestor/productos')}>Cancelar</button>
        </div>
      </form>
    </section>
  )
}
export default ProductoFormPage