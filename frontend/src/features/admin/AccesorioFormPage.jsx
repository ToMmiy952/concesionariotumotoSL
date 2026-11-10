import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { obtenerAccesorio, crearAccesorio, actualizarAccesorio } from './accesoriosService'

const vacio = { nombre: '', categoria: '', marca: '', precio: '', stock: '', talle: '', imagen: '', descripcion: '' }

// Sugerencias de categorías ya usadas en el catálogo (el campo admite texto libre)
const CATEGORIAS = ['Cascos', 'Guantes', 'Indumentaria', 'Calzado', 'Repuestos', 'Accesorios']

function AccesorioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [datos, setDatos] = useState(vacio)
  const [cargando, setCargando] = useState(Boolean(id))
  const [error, setError] = useState(null) // error al cargar el accesorio a editar
  const [errorGuardar, setErrorGuardar] = useState(null)
  const [guardando, setGuardando] = useState(false)

  useEffect(() => {
    if (!id) return
    let cancelado = false
    async function cargar() {
      const r = await obtenerAccesorio(id)
      if (cancelado) return
      if (r.ok) {
        const a = r.accesorio
        setDatos({
          nombre: a.nombre ?? '',
          categoria: a.categoria ?? '',
          marca: a.marca ?? '',
          precio: String(a.precio),
          stock: String(a.stock),
          talle: a.talle ?? '',
          imagen: a.imagen ?? '',
          descripcion: a.descripcion ?? '',
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
    const listo = {
      nombre: datos.nombre.trim(),
      categoria: datos.categoria.trim(),
      marca: datos.marca.trim(),
      precio: Number(datos.precio),
      stock,
      talle: datos.talle.trim(),
      imagen: datos.imagen.trim(),
      descripcion: datos.descripcion.trim(),
    }

    const r = id ? await actualizarAccesorio(id, listo) : await crearAccesorio(listo)
    setGuardando(false)
    if (!r.ok) {
      setErrorGuardar(r.error)
      return
    }
    navigate('/gestor/accesorios')
  }

  if (cargando) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
        <p className="mt-2 text-secondary">Cargando accesorio...</p>
      </div>
    )
  }

  if (error) {
    return (
      <section>
        <div className="alert alert-danger" role="alert">{error}</div>
        <Link to="/gestor/accesorios" className="btn btn-outline-secondary">Volver a accesorios</Link>
      </section>
    )
  }

  return (
    <section>
      <h2 className="mb-3">{id ? 'Editar accesorio' : 'Nuevo accesorio'}</h2>

      {errorGuardar && <div className="alert alert-danger" role="alert">{errorGuardar}</div>}

      <form onSubmit={manejarSubmit}>
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">Nombre</label>
            <input name="nombre" className="form-control" value={datos.nombre} onChange={manejarCambio} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Categoría</label>
            <input name="categoria" className="form-control" list="categorias-accesorio" value={datos.categoria} onChange={manejarCambio} required />
            <datalist id="categorias-accesorio">
              {CATEGORIAS.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
          <div className="col-md-6">
            <label className="form-label">Marca</label>
            <input name="marca" className="form-control" placeholder="Ej: LS2 (vacía queda como Genérica)" value={datos.marca} onChange={manejarCambio} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Precio</label>
            <input name="precio" type="number" min="1" step="0.01" className="form-control" value={datos.precio} onChange={manejarCambio} required />
          </div>
          <div className="col-md-6">
            <label className="form-label">Stock</label>
            <input name="stock" type="number" min="0" className="form-control" value={datos.stock} onChange={manejarCambio} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Talle</label>
            <input name="talle" className="form-control" placeholder="Ej: M, L, XL, 42" value={datos.talle} onChange={manejarCambio} />
          </div>
          <div className="col-12">
            <label className="form-label">Imagen (ruta)</label>
            <input name="imagen" className="form-control" placeholder="/img/accesorios/mi-accesorio.jpg" value={datos.imagen} onChange={manejarCambio} />
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
          <button type="button" className="btn btn-outline-secondary" onClick={() => navigate('/gestor/accesorios')}>
            Cancelar
          </button>
        </div>
      </form>
    </section>
  )
}

export default AccesorioFormPage
