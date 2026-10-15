//Aca el <a href=... se convierte en NavLinkto
import { NavLink } from "react-router";
function Navbar({enlaces}) { {/**con shift+alt+f ordeno todo el codigo identacion */}


    return (
            <nav className="navbar navbar-expand-lg p-0 navbar-bootstrap" >
                <div className="container-fluid">
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-center" id="navbarSupportedContent">
                        <ul className="navbar-nav mb-2 mb-lg-0">
                            {enlaces.map((enlace) => (
                                <li className="nav-item" key={enlace.id}> {/**el atributo KEY ES NECESARIO!! para que el map funcione bien */}
                                    <NavLink className="nav-link" to={enlace.destino} end={enlace.destino === '/'}>{enlace.texto}</NavLink>
                                </li>
                            ))}
                        </ul>                        
                    </div>
                </div>
            </nav>
    );
}
export default Navbar;