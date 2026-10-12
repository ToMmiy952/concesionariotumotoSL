import { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router';
import SelectorTalles from '../componentes/SelectorTalles';
import { obtenerSesion } from '../../auth/authService';
import { obtenerAccesorioPorId } from '../servicios/accesorioService';

function DetalleAccesorio() {
    const [mostrarAlerta, setMostrarAlerta] = useState(false);
    const [talleElegido, setTalleElegido] = useState(null);

    const { agregarProducto } = useOutletContext(); // Hook para agregar productos al carrito
    const { id } = useParams();

    const [accesorio, setAccesorio] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Cargar la información mediante el service al montar o al cambiar el ID de la URL
    useEffect(() => {
        async function cargarDetalle() {
            try {
                setCargando(true);
                setError(null);
                const data = await obtenerAccesorioPorId(id);
                setAccesorio(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        }

        cargarDetalle();
    }, [id]);

    // Pantalla de carga mientras espera la promesa
    if (cargando) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-secondary">Cargando accesorio...</p>
            </div>
        );
    }

    if (error ||!accesorio) {
        return (
            <div className="container my-5 text-center">
                <h2>Accesorio no encontrado</h2>
                <p className="text-secondary">
                    No encontramos ningún accesorio con el identificador ingresado.
                </p>
                <Link to="/accesorios" className="btn btn-primary mt-3">
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    const precioFormateado = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(accesorio.precio);

    function manejadorComprar() {
        const sesion = obtenerSesion();

        if (!sesion) {
            setMostrarAlerta(true);
            return;
        }

        setMostrarAlerta(false);
        alert(`Compraste: ${accesorio.nombre} (Talle ${talleElegido})`);

        // Agregar el producto al carrito
        agregarProducto({
            id: accesorio.id,
            nombre: accesorio.nombre,
            precio: accesorio.precio,
            imagen: accesorio.imagen,
            talle: talleElegido
        });

    }

    return (
        <main className="container my-5">
            <div className="row mb-5 align-items-center">
                <div className="col-12 col-md-6 text-center">
                    <img
                        src={accesorio.imagen}
                        alt={`${accesorio.nombre}`}
                        className="foto-moto img-fluid rounded shadow-sm"
                        style={{ maxHeight: "350px", objectFit: "contain" }}
                    />
                </div>

                <div className="col-12 col-md-6 mt-4 mt-md-0">
                    <h2 className="fw-bold mb-2">
                        {accesorio.nombre}
                    </h2>

                    <p className="text-muted">
                        {accesorio.descripcion}
                    </p>

                    <SelectorTalles tallesDisponibles={accesorio.talle} onSeleccionar={setTalleElegido} />

                    <ul className="list-group list-group-flush mb-4">
                        <li className="list-group-item px-0">
                            <strong>Stock disponible:</strong> {accesorio.stock} unidades
                        </li>

                        <li className="list-group-item px-0 fs-4 fw-bold text-primary">
                            Precio: {precioFormateado}
                        </li>
                    </ul>

                    <div className="mt-3">
                        {mostrarAlerta && (
                            <div className="alert alert-danger alert-dismissible fade show my-2 small" role="alert">
                                <strong>¡Atención!</strong> Para comprar este accesorio debés iniciar sesión primero.
                                <Link to="/login" className="alert-link ms-1">
                                    Ingresá aquí
                                </Link>.
                                <button
                                    type="button"
                                    className="btn-close"
                                    aria-label="Cerrar"
                                    onClick={() => setMostrarAlerta(false)}
                                ></button>
                            </div>
                        )}

                        <button id='comprar' type="button" className="btn btn-primary btn-lg w-100 mt-3" disabled={!talleElegido} onClick={manejadorComprar}>
                            {talleElegido ? "Comprar" : "Elegí un talle"}
                        </button>
                    </div>
                </div>
            </div>
        </main>
    );
}

export default DetalleAccesorio;