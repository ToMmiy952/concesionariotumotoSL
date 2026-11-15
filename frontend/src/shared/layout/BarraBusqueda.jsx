import { Link, useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { obtenerSesion, logout, rutaInicial } from "../../features/auth/authService";
import { obtenerMotos } from "../../features/catalogo/servicios/motoService";
import { obtenerAccesorios } from "../../features/catalogo/servicios/accesorioService";
import { normalizarTexto } from "../utils/texto";

// Cantidad máxima de coincidencias que se muestran en el desplegable
const MAX_RESULTADOS = 6;

function BarraBusqueda({ titulo, logo, onAbrirCarrito, cantidadItems }) {
    const usuario = obtenerSesion();
    const navigate = useNavigate(); //useNavigate permite ir a otra ruta sin tener que hacer click usando un link, si no que vamos por codigo

    // Estado del buscador
    const [texto, setTexto] = useState("");
    const [productos, setProductos] = useState([]); // Motos y accesorios para buscar
    const [abierto, setAbierto] = useState(false); // Muestra/oculta el desplegable
    const buscadorRef = useRef(null);

    // Cargo una sola vez el catálogo de motos y accesorios desde la API
    useEffect(() => {
        let activo = true;

        Promise.all([obtenerMotos(), obtenerAccesorios()])
            .then(([motos, accesorios]) => {
                if (!activo) return;
                setProductos([
                    ...motos.map((m) => ({
                        id: `moto-${m.id_producto}`,
                        nombre: `${m.marca} ${m.modelo}`,
                        detalle: m.cilindrada ? `${m.cilindrada} cc` : "",
                        tipo: "Moto",
                        ruta: `/catalogo/${m.id_producto}`
                    })),
                    ...accesorios.map((a) => ({
                        id: `accesorio-${a.id_producto}`,
                        nombre: a.nombre,
                        detalle: a.categoria || "",
                        tipo: "Accesorio",
                        ruta: `/accesorios/${a.id_producto}`
                    }))
                ]);
            })
            .catch(() => {
                if (activo) setProductos([]);
            });

        return () => { activo = false; };
    }, []);

    // Cierro el desplegable al hacer click fuera del buscador
    useEffect(() => {
        function alHacerClickFuera(e) {
            if (buscadorRef.current && !buscadorRef.current.contains(e.target)) {
                setAbierto(false);
            }
        }
        document.addEventListener("mousedown", alHacerClickFuera);
        return () => document.removeEventListener("mousedown", alHacerClickFuera);
    }, []);

    const consulta = normalizarTexto(texto).trim();

    // Coincidencias por nombre, detalle o tipo (máximo MAX_RESULTADOS)
    const resultados = consulta === ""
        ? []
        : productos
            .filter((p) => normalizarTexto(`${p.nombre} ${p.detalle} ${p.tipo}`).includes(consulta))
            .slice(0, MAX_RESULTADOS);

    function manejarEnvio(e) {
        e.preventDefault();
        if (consulta === "") return;

        // Llevo a la página de resultados con todas las coincidencias
        navigate(`/buscar?q=${encodeURIComponent(texto.trim())}`);
        limpiarBusqueda();
    }

    function limpiarBusqueda() {
        setTexto("");
        setAbierto(false);
    }

    function manejarLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header id="header-principal" className="d-flex align-items-center gap-3">
            <div className="d-flex align-items-center gap-2">
                <img src={logo} alt="Logo" className="logo" />
                <h1>{titulo}</h1>
            </div>
            <div className="flex-grow-1">
                <form className="d-flex m-0 p-0" role="search" onSubmit={manejarEnvio}>
                    <div className="input-group w-100 position-relative" ref={buscadorRef}>
                        <input
                            className="form-control"
                            type="search"
                            placeholder="Buscar motos o accesorios..."
                            value={texto}
                            onChange={(e) => {
                                setTexto(e.target.value);
                                setAbierto(true);
                            }}
                            onFocus={() => setAbierto(true)}
                            aria-label="Buscar"
                        />
                        <button className="btn btn-primary text-nowrap" type="submit">
                            <i className="bi bi-search"></i> {/**Logo de lupa busqueda */}
                        </button>

                        {/* Desplegable de coincidencias */}
                        {abierto && consulta !== "" && (
                            <ul
                                className="list-group position-absolute w-100 shadow"
                                style={{ top: "100%", left: 0, zIndex: 1050, maxHeight: "320px", overflowY: "auto" }}
                            >
                                {resultados.length > 0 ? (
                                    resultados.map((p) => (
                                        <li key={p.id} className="list-group-item p-0">
                                            <Link
                                                to={p.ruta}
                                                className="d-flex justify-content-between align-items-center px-3 py-2 text-decoration-none text-dark"
                                                onClick={limpiarBusqueda}
                                            >
                                                <span>
                                                    <strong>{p.nombre}</strong>
                                                    {p.detalle && <span className="text-muted ms-2">{p.detalle}</span>}
                                                </span>
                                                <span className="badge bg-secondary">{p.tipo}</span>
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li className="list-group-item text-muted">
                                        No se encontraron resultados
                                    </li>
                                )}

                                {/* Ver la página completa con todas las coincidencias */}
                                <li className="list-group-item p-0">
                                    <Link
                                        to={`/buscar?q=${encodeURIComponent(texto.trim())}`}
                                        className="d-block px-3 py-2 text-center fw-semibold text-decoration-none"
                                        onClick={limpiarBusqueda}
                                    >
                                        Ver todos los resultados
                                    </Link>
                                </li>
                            </ul>
                        )}
                    </div>
                </form>
            </div>
            {/**Esto es el boton de carrito, si no hay sesion no aparece, si hay sesion aparece el boton de carrito
             * usuario &&, evalua, si usuario es null o undefined, no hace nada, si usuario tiene un valor, ejecuta lo que sigue, osea renderiza el codigo del carrito
            */}
            <div className="d-flex align-items-center gap-2">
                {usuario && (
                    <button className="btn btn-primary position-relative" onClick={onAbrirCarrito} aria-label="Abrir carrito">
                        <i className="bi bi-cart4"></i> {/**Logo de carrito */}
                        {cantidadItems > 0 && (
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                                {cantidadItems}
                            </span>
                        )}
                    </button>)}
            </div>

            {/**Esto es el boton de mi cuenta, si no hay sesion aparece mi cuenta, si hay sesion muestra el nombre con un desplegable */}
            <div className="d-flex align-items-center flex-nowrap gap-2">
                {/**Si no hay sesion, osea nadie esta logueado, nos lleva al login, luego :( , esa seria la rama falsa
                 * Si hay sesion, nos muestra un boton con el nombre del usuario logueado y un menu desplegable
                 */}
                {!usuario ? (
                    <Link to="/login" className="btn btn-primary d-inline-flex align-items-center gap-1">
                        <i className="bi bi-person"></i>
                        <span style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>Mi cuenta</span>
                    </Link>
                ) : (
                    <div className="dropdown">
                        <button
                            className="btn btn-primary dropdown-toggle d-inline-flex align-items-center gap-1"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false">

                            <i className="bi bi-person-check"></i>
                            <span style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>
                                Hola, {usuario.nombre || usuario.email}
                            </span>
                        </button>

                        <ul className="dropdown-menu dropdown-menu-end">
                            <li>
                                {usuario.rol === 'cliente' ? (
                                    <Link className="dropdown-item" to="/mis-pedidos">
                                        <i className="bi bi-bag me-2"></i>
                                        Mis pedidos
                                    </Link>
                                ) : (
                                    <Link className="dropdown-item" to={rutaInicial(usuario.rol)}>
                                        <i className="bi bi-speedometer2 me-2"></i>
                                        Ir al panel de gestión
                                    </Link>
                                )}
                            </li>
                            <li>
                                <hr className="dropdown-divider" />
                            </li>
                            <li>
                                <button className="dropdown-item text-danger" type="button" onClick={manejarLogout}>
                                    <i className="bi bi-box-arrow-right me-2"></i>
                                    Cerrar sesión
                                </button>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </header>
    );
}
export default BarraBusqueda;
