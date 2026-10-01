import { Link } from "react-router";

function TarjetaAccesorios({ id, nombre, precio, imagen }) {
    
    return (
        <div>
            <Link
                to={`/accesorios/${id}`} //SI o SI son esas comillas dobladas, las simples no funcionan
                className="tarjeta-moto text-decoration-none d-block h-100 p-3 bg-white rounded shadow-sm text-dark position-relative text-center"
            >
                <span
                    className="favorito position-absolute top-0 end-0 p-2 text-secondary fs-5"
                    aria-hidden="true"
                />

                <img
                    src={imagen}
                    alt={`${nombre}`}
                    className="img-fluid mb-3"
                />

                <h4 className="fs-6 fw-normal text-secondary mb-1">
                    {nombre} 
                </h4>                

                <p className="precio fs-5 fw-bold text-dark mb-1">
                    {"$"}{precio}
                </p>
            </Link>
        </div>
    );
}

export default TarjetaAccesorios;