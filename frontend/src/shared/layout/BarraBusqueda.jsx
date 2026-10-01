import { useState } from "react";

function BarraBusqueda({ titulo, logo, onAbrirCarrito }) {
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
            <div className="d-flex align-items-center gap-2">
                <button className="btn btn-primary" onClick={onAbrirCarrito}>
                    <i className="bi bi-cart4"></i> {/**Logo de carrito */}
                </button>
            </div>
           
            <div className="d-flex align-items-center flex-nowrap gap-2">
                <button className="btn btn-primary">
                    <i className="bi bi-person"></i> <span style={{ fontSize: '0.75rem', lineHeight: '1.2' }}>Mi cuenta</span> {/**Logo de inicio sesion */}
                </button>
            </div>
        </header>
    );
}
export default BarraBusqueda;