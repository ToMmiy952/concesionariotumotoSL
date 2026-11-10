import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { obtenerMoto, crearMoto, actualizarMoto } from './motosService'

const vacio = { marca: '', modelo: '', precio: '', cilindrada: '', stock: '', estado: 'Disponible', imagen: '', descripcion: '' }

const ESTADOS = ['Disponible', 'Reservada', 'Agotado']

function ProductoFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(vacio)
  const [cargando, setCargando] = useState(Boolean(id))
  const [error, setError] = useState(null) // error al cargar la moto a editar
  const [errorGuardar, setErrorGuardar] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelado = false
    async function cargar() {
      const r = await obtenerMoto(id)
      if (cancelado) return
      if (r.ok) {
        const m = r.moto
        setDatos({
          marca: m.marca ?? '',
          modelo: m.modelo ?? '',
          precio: String(m.precio),
          cilindrada: m.cilindrada === null ? '' : String(m.cilindrada),
          stock: String(m.stock),
          estado: m.estado ?? 'Disponible',
          imagen: m.imagen ?? '',
          descripcion: m.descripcion ?? '',
        })
      } else {
        setError(r.error)
      }
      setCargando(false)
    }
    cargar()
    return () => { cancelado = true }
  }, [id])

  function manejarCambio(e) {
    setDatos({ ...datos, [e.target.name]: e.target.value })
  }

  async function manejarSubmit(e) {
    e.preventDefault()
    setErrorGuardar(null)
    setGuardando(true)

    // Si el stock queda vacío: 0 al crear o null al editar (null conserva el valor anterior)
    const stock = datos.stock === '' ? (id ? null : 0) : Number(datos.stock)
    // La cilindrada vacía viaja como null (al editar conserva la anterior)
    const cilindrada = datos.cilindrada === '' ? null : Number(datos.cilindrada)

    // El estado acompaña al stock: sin unidades queda Agotado y con unidades deja de estarlo
    let estado = datos.estado
    if (stock === 0) estado = 'Agotado'
    else if (stock !== null && estado === 'Agotado') estado = 'Disponible'

    const listo = {
      marca: datos.marca.trim(),
      modelo: datos.modelo.trim(),
      precio: Number(datos.precio),
      cilindrada,
      stock,
      estado,
      imagen: datos.imagen.trim(),
      descripcion: datos.descripcion.trim(),
    }

    const r = id ? await actualizarMoto(id, listo) : await crearMoto(listo)
    setGuardando(false)
    if (!r.ok) {
      setErrorGuardar(r.error)
      return
    }
    navigate('/gestor/productos')
  }

  if (cargando) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-secondary">Cargando moto...</p>
      </div>
    )
  }

  if (error) {
    return (
      <section>
        <div className="alert alert-danger" role="alert">{error}</div>
        <Link to="/gestor/productos" className="btn btn-outline-secondary">Volver a motos</Link>
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-3">{id ? 'Editar moto' : 'Nueva moto'}</h2>

      {errorGuardar && <div className="alert alert-danger" role="alert">{errorGuardar}</div>}

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
            <input name="precio" type="number" min="1" step="0.01" className="form-control" value={datos.precio} onChange={manejarCambio} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Cilindrada (cc)</label>
            <input name="cilindrada" type="number" min="1" step="1" className="form-control" placeholder="Ej: 200" value={datos.cilindrada} onChange={manejarCambio} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Stock</label>
            <input name="stock" type="number" min="0" step="1" className="form-control" value={datos.stock} onChange={manejarCambio} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Estado</label>
            <select name="estado" className="form-select" value={datos.estado} onChange={manejarCambio} disabled={!id}>
              {ESTADOS.map(e => <option key={e}>{e}</option>)}
            </select>
            {!id && <div className="form-text">Al crear, la moto queda en estado Disponible.</div>}
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
          <button type="submit" className="btn btn-primary" disabled={guardando}>
            {guardando ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/gestor/productos')}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

export default ProductoFormPage
