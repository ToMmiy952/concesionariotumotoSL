function BarraBusqueda({titulo, logo}) {
    return (
        <header id="header-principal" class="d-flex justify-content-between align-items-center">
            <div class="d-flex align-items-center gap-2">
                <img src={logo} alt="Logo" class="logo"/>
                <h1>{titulo}</h1>
            </div>
            <div>
                <form class="d-flex flex-nowrap align-items-center m-0 p-0" role="search">
                    <div class="input-group"> {/*<!--agregue este div porque no podia poner el boton al lado del buscador-->*/}
                        <input class="form-control" type="search" placeholder="Buscar..."/>
                            <button class="btn btn-primary text-nowrap" type="submit">lupa</button>
                    </div>
                </form>
            </div>
            <div class="d-flex align-items-center flex-nowrap gap-2"> <h4>logo de favoritos y el carrito</h4></div>
        </header>
    );
}
export default BarraBusqueda;