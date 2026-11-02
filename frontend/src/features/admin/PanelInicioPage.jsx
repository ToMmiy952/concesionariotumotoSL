import { useEffect, useState } from 'react'
import { obtenerMetricasAdmin } from './metricasService'
import { contarReservasVigentes } from '../vendedor/reservasService'
import { obtenerMotos } from '../catalogo/servicios/motoService'
import { mesActual, mesDeFecha } from '../../shared/utils/fechas'

const pesos = n => n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })

// "2026-10-05" (fecha del período que manda la API) a un texto corto
const fechaCorta = iso => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
const nombreMes = iso => new Date(`${iso.slice(0, 10)}T00:00:00`).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })

// Tabla simple para los reportes: columnas = [{ titulo, valor(fila), derecha }]
function TablaReporte({ titulo, filas, columnas }) {
  return (
    <div className="tarjeta-tabla mb-4">
      <h3 className="h5 mb-3">{titulo}</h3>
      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead>
            <tr>{columnas.map(c => <th key={c.titulo} className={c.derecha ? 'text-end' : ''}>{c.titulo}</th>)}</tr>
          </thead>
          <tbody>
            {filas.length === 0 && <tr><td colSpan={columnas.length} className="text-muted">Sin datos todavía.</td></tr>}
            {filas.map((f, i) => (
              <tr key={i}>
                {columnas.map(c => <td key={c.titulo} className={c.derecha ? 'text-end' : ''}>{c.valor(f)}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PanelInicioPage() {
  const [metricas, setMetricas] = useState(null) // null mientras carga
  const [error, setError] = useState(null)
  const [reservasVigentes, setReservasVigentes] = useState(null) // null mientras carga o si la API falla
  const [sinStock, setSinStock] = useState(null)

  useEffect(() => {
    obtenerMetricasAdmin().then(r => (r.ok ? setMetricas(r.metricas) : setError(r.error)))
    contarReservasVigentes().then(setReservasVigentes)
    obtenerMotos().then(motos => setSinStock(motos.filter(m => m.stock === 0).length)).catch(() => {})
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!metricas) return <p className="text-secondary">Cargando panel...</p>

  // la API devuelve las ventas por mes de los últimos 12: el del mes actual es el que interesa en las tarjetas
  const delMes = metricas.ventas_mensuales.find(v => mesDeFecha(v.periodo) === mesActual())
  const ventasMes = delMes?.cantidad_ventas ?? 0
  const ingresosMes = delMes?.monto_total ?? 0

  return (
    <section>
      <h2 className="mb-4">Panel de control</h2>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xl-3">
          <div className="tarjeta-metrica">
            <i className="bi bi-bag-check icono"></i>
            <div><h3>Ventas del mes</h3><p>{ventasMes}</p></div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="tarjeta-metrica">
            <i className="bi bi-cash-coin icono"></i>
            <div><h3>Ingresos del mes</h3><p>{pesos(ingresosMes)}</p></div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="tarjeta-metrica">
            <i className="bi bi-hourglass-split icono"></i>
            <div><h3>Reservas vigentes</h3><p>{reservasVigentes ?? '—'}</p></div>
          </div>
        </div>
        <div className="col-12 col-md-6 col-xl-3">
          <div className="tarjeta-metrica">
            <i className="bi bi-exclamation-triangle icono"></i>
            <div><h3>Motos sin stock</h3><p>{sinStock ?? '—'}</p></div>
          </div>
        </div>
      </div>

      <TablaReporte
        titulo="Ventas semanales (últimas 8 semanas)"
        filas={metricas.ventas_semanales}
        columnas={[
          { titulo: 'Semana del', valor: f => fechaCorta(f.periodo) },
          { titulo: 'Ventas', valor: f => f.cantidad_ventas, derecha: true },
          { titulo: 'Monto', valor: f => pesos(f.monto_total), derecha: true },
        ]}
      />

      <TablaReporte
        titulo="Ventas mensuales (últimos 12 meses)"
        filas={metricas.ventas_mensuales}
        columnas={[
          { titulo: 'Mes', valor: f => nombreMes(f.periodo) },
          { titulo: 'Ventas', valor: f => f.cantidad_ventas, derecha: true },
          { titulo: 'Monto', valor: f => pesos(f.monto_total), derecha: true },
        ]}
      />

      <div className="row">
        <div className="col-12 col-xl-6">
          <TablaReporte
            titulo="Accesorios más vendidos"
            filas={metricas.accesorios_mas_vendidos}
            columnas={[
              { titulo: 'Accesorio', valor: f => f.nombre },
              { titulo: 'Unidades', valor: f => f.unidades_vendidas, derecha: true },
              { titulo: 'Monto', valor: f => pesos(f.monto_total), derecha: true },
            ]}
          />
        </div>
        <div className="col-12 col-xl-6">
          <TablaReporte
            titulo="Motos más vendidas"
            filas={metricas.motos_mas_vendidas}
            columnas={[
              { titulo: 'Moto', valor: f => f.moto },
              { titulo: 'Unidades', valor: f => f.unidades_vendidas, derecha: true },
              { titulo: 'Monto', valor: f => pesos(f.monto_total), derecha: true },
            ]}
          />
        </div>
      </div>

      <TablaReporte
        titulo="Desempeño de vendedores"
        filas={metricas.desempeno_vendedores}
        columnas={[
          { titulo: 'Vendedor', valor: f => f.nombre },
          { titulo: 'Ventas', valor: f => f.cantidad_ventas, derecha: true },
          { titulo: 'Monto', valor: f => pesos(f.monto_total), derecha: true },
          { titulo: 'Comisión', valor: f => pesos(f.comision_total), derecha: true },
        ]}
      />
    </section>
  )
}
export default PanelInicioPage
