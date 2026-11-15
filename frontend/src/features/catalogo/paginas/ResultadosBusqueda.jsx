import { useSearchParams } from "react-router"
import { useEffect, useState } from "react"
import ImagenSeccion from "../../../shared/components/ImagenSeccion"
import { normalizarTexto } from "../../../shared/utils/texto"
import { obtenerMotos } from "../servicios/motoService"
import { obtenerAccesorios } from "../servicios/accesorioService"
import GrillaMotos from "../componentes/GrillaMotos"
import GrillaAccesorios from "../componentes/GrillaAccesorios"
import foto from "../../../assets/fotocatalogo.png"

// Página de resultados: muestra todas las tarjetas de motos y accesorios que coinciden con "q"
function ResultadosBusqueda() {
    const [parametros] = useSearchParams()
    const consulta = normalizarTexto(parametros.get("q")).trim()

    const [motos, setMotos] = useState([])
    const [accesorios, setAccesorios] = useState([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        async function cargarDatos() {
            try {
                setCargando(true)
                setError(null)
                const [datosMotos, datosAccesorios] = await Promise.all([
                    obtenerMotos(),
                    obtenerAccesorios(),
                ])
                setMotos(datosMotos)
                setAccesorios(datosAccesorios)
            } catch (err) {
                setError(err.message)
            } finally {
                setCargando(false)
            }
        }
        cargarDatos()
    }, [])

    const motosEncontradas = consulta === ""
        ? []
        : motos.filter((moto) =>
            normalizarTexto(`${moto.marca} ${moto.modelo} ${moto.cilindrada} ${moto.descripcion}`).includes(consulta)
        )

    const accesoriosEncontrados = consulta === ""
        ? []
        : accesorios.filter((accesorio) =>
            normalizarTexto(`${accesorio.nombre} ${accesorio.categoria} ${accesorio.marca} ${accesorio.talle}`).includes(consulta)
        )

    if (cargando) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Buscando...</span>
                </div>
                <p className="mt-2 text-secondary">Buscando...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div className="container my-5 text-center">
                <div className="alert alert-danger" role="alert">
                    <strong>Ocurrió un error:</strong> {error}
                </div>
            </div>
        )
    }

    return (
        <>
            <ImagenSeccion foto={foto} descripcion={"Resultados de búsqueda"} />

            <main>
                <h2>Resultados para "{parametros.get("q") || ""}"</h2>

                {consulta === "" ? (
                    <p className="text-muted">Escribí algo en el buscador para encontrar motos y accesorios.</p>
                ) : motosEncontradas.length === 0 && accesoriosEncontrados.length === 0 ? (
                    <div className="alert alert-warning" role="alert">
                        No se encontraron resultados
                    </div>
                ) : (
                    <>
                        <p className="text-muted">
                            <b>{motosEncontradas.length + accesoriosEncontrados.length}</b>{" "}
                            <span style={{ color: "gray" }}>PRODUCTOS ENCONTRADOS</span>
                        </p>

                        {motosEncontradas.length > 0 && (
                            <section id="catalogo">                                
                                <GrillaMotos motosOrdenadas={motosEncontradas} />
                            </section>
                        )}

                        {accesoriosEncontrados.length > 0 && (
                            <section id="accesorios">
                                <h3>Accesorios ({accesoriosEncontrados.length})</h3>
                                <GrillaAccesorios accesoriosOrdenados={accesoriosEncontrados} />
                            </section>
                        )}
                    </>
                )}
            </main>
        </>
    )
}

export default ResultadosBusqueda
