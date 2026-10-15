import { Link, useNavigate } from "react-router";
import { obtenerSesion, logout, rutaInicial } from "../../features/auth/authService";

function BarraBusqueda({ titulo, logo, onAbrirCarrito, cantidadItems }) {
    const usuario = obtenerSesion();
    const navigate = useNavigate(); //useNavigate permite ir a otra ruta sin tener que hacer click usando un link, si no que vamos por codigo

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
                <form className="d-flex m-0 p-0" role="search">
                    <div className="input-group w-100"> {/*<!--agregue este div porque no podia poner el boton al lado del buscador-->*/}
                        <input className="form-control" type="search" placeholder="Buscar..." />
                        <button className="btn btn-primary text-nowrap" type="submit">
                            <i className="bi bi-search"></i> {/**Logo de lupa busqueda */}
                        </button>
                    </div>
                </form>
            </div>
            {/**Esto es el boton de carrito, si no hay sesion no aparece, si hay sesion aparece el boton de carrito 
             * usuario &&, evalua, si usuario es null o undefined, no hace nada, si usuario tiene un valor, ejecuta lo que sigue, osea renderiza el codigo del carrito
            */}
            <div className="d-flex align-items-center gap-2">
                {usuario &&( 
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
                            aria-expanded="false" >
                                
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