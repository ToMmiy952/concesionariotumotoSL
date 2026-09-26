import { Link } from "react-router";

function TarjetaMoto({ id, marca, modelo, precio, cilindrada, imagen }) {
    return (
        <div>
            <Link
                to={`/catalogo/${id}`} //SI o SI son esas comillas dobladas, las simples no funcionan
                className="tarjeta-moto text-decoration-none d-block h-100 p-3 bg-white rounded shadow-sm text-dark position-relative text-center"
            >
                <span
                    className="favorito position-absolute top-0 end-0 p-2 text-secondary fs-5"
                    aria-hidden="true"
                />

                <img
                    src={imagen}
                    alt={`${marca} ${modelo}`}
                    className="img-fluid mb-3"
                />

                <h4 className="fs-6 fw-normal text-secondary mb-1">
                    {marca} {modelo}
                </h4>

                {cilindrada && (
                    <p className="text-muted small mb-2">
                        {cilindrada}
                    </p>
                )}

                <p className="precio fs-5 fw-bold text-dark mb-1">
                    {"$"}{precio}
                </p>
            </Link>
        </div>
    );
}

export default TarjetaMoto;