import { useParams, Link } from 'react-router';
import SelectorTalles from '../componentes/SelectorTalles';
import { useState } from 'react';

import accesoriosData from "../../../../../backend/data/accesorios.json"
function DetalleAccesorio() {


    //este codigo seguro hay que modularizarlo, ver despues!!!
    const { id } = useParams();//obtengo el id que viene en la url
    const accesorio = accesoriosData.find((item) => item.id === Number(id));//la busco en el json 
    if (!accesorio) { //si la moto no esta:
        return (
            <div className="container my-5 text-center">
                <h2>Accesorio no encontrado </h2>
                <p className="text-secondary">
                    No encontramos ningun accesorio con el identificador ingresado.
                </p>
                <Link to="/accesorios" className="btn btn-primary mt-3">
                    Volver al catálogo
                </ Link>
            </ div>
        );
    }
    const precioFormateado = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(accesorio.precio);

    const [talleElegido, setTalleElegido] = useState(null)


    return (
        <>
            <main className="container my-5">
                {/* SECCIN ESPECIFICA DE LA MOTO */}
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
                        <button id='comprar'
                            type="button"
                            className="btn btn-primary btn-lg w-100 mt-3"
                            disabled={!talleElegido}
                            onClick={() => {
                                alert(`Compraste: ${accesorio.nombre} (Talle ${talleElegido})`);
                                // acá después harías la lógica real: agregar al carrito, ir a checkout, etc.
                            }}
                        >
                            {talleElegido ? `Comprar ` : "Elegí un talle"}
                            {/**? es verdadero : es falso, por eso el texto cambia segun si hay o no talle elegido */}
                        </button>
                    </div>
                </div>
            </main>
        </>
    )
}

export default DetalleAccesorio