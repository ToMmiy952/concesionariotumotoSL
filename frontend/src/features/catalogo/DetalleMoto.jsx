import { useParams, Link } from 'react-router';
import { useState } from 'react';

import motosData from '../../../../backend/data/motos.json'
function DetalleMoto() {
    const { id } = useParams();//obtengo el id que viene en la url
    const moto = motosData.find((item) => item.id === Number(id));//la busco en el json 
    if (!moto) { //si la moto no esta:
        return (
            <div className="container my-5 text-center">
                <h2>Moto no encontrada </h2>
                <p className="text-secondary">
                    No encontramos ninguna moto con el identificador ingresado.
                </p>
                <Link to="/catalogo" className="btn btn-primary mt-3">
                    Volver al catálogo
                </ Link>
            </ div>
        );
    }
    const precioFormateado = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(moto.precio);

    //creo el estado del formulario
    const [formulario, setFormulario] = useState({
        nombre: "",
        email: "",
        fecha: "",
        horario: "",
        comentario: ""
    })

    function manejarEnvio(e) { //esta es la funcion que se ejecuta al oprimir el submit, boton
        e.preventDefault(); //para que no recargue la pagina al enviar 

        //ahora creo la consulta que voy a guardar.
        const nuevaConsulta = {
            idMoto: id,
            ...formulario//uso ...formulario porque esto ya contiene todos los datos estructurados del form, es como un objeto
        };
        const consultasGuardadas =
            JSON.parse(localStorage.getItem("consultas")) || []; //Se usa PARSE para leer, esto convierte el texto a un array que se pueda usar
        //La parte de || [] es para que devuelva un array en lugar de "null" si no hay consultas guardadas
        const consultasTotales = [
            ...consultasGuardadas, //Los 3 puntos "..." es la clave, coloca en este array todo lo que estaba, mas la nueva consulta, 
            nuevaConsulta          //de lo contrario pisaria los valores que ya estaban
        ];

        //Una vez actualizadas las consultas, las guardo en localStorage
        localStorage.setItem("consultas", JSON.stringify(consultasTotales))

        console.log("Consultas totales:", consultasTotales);

    }


    return (
        <>
            <main className="container my-5">
                {/* SECCIN ESPECIFICA DE LA MOTO */}
                <div className="row mb-5 align-items-center">
                    <div className="col-12 col-md-6 text-center">
                        <img
                            src={moto.imagen}
                            alt={`${moto.marca} ${moto.modelo}`}
                            className="foto-moto img-fluid rounded shadow-sm"
                            style={{ maxHeight: "350px", objectFit: "contain" }}
                        />
                    </div>

                    <div className="col-12 col-md-6 mt-4 mt-md-0">
                        <h2 className="fw-bold mb-2">
                            {moto.marca} {moto.modelo}
                        </h2>

                        <p className="text-muted">
                            {moto.descripcion}
                        </p>

                        <ul className="list-group list-group-flush mb-4">
                            <li className="list-group-item px-0">
                                <strong>Cilindrada:</strong> {moto.cilindrada}
                            </li>

                            <li className="list-group-item px-0">
                                <strong>Estado:</strong> {moto.estado}
                            </li>

                            <li className="list-group-item px-0">
                                <strong>Stock disponible:</strong> {moto.stock} unidades
                            </li>

                            <li className="list-group-item px-0 fs-4 fw-bold text-primary">
                                Precio: {precioFormateado}
                            </li>
                        </ul>
                    </div>
                </div>

                <hr className="my-5" />

                {/* SECCIÓN FIJA: FORMULARIO */}
                <div className="row justify-content-center">
                    <div className="col-12 col-md-8">
                        <h3 className="mb-4 text-center">
                            ¿Te interesa esta moto? Dejanos tus datos
                        </h3>

                        <form className="row g-3" onSubmit={manejarEnvio}>
                            <div className="col-md-6">
                                <label htmlFor="nombre" className="form-label">
                                    Nombre:
                                </label>

                                <input
                                    type="text"
                                    id="nombre"
                                    name="nombre-c"
                                    className="form-control"
                                    value={formulario.nombre}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            nombre: e.target.value
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="email" className="form-label">
                                    Email:
                                </label>

                                <input
                                    type="email"
                                    id="email"
                                    name="email-c"
                                    className="form-control"
                                    value={formulario.email}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            email: e.target.value
                                        })
                                    }
                                    required
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="fecha" className="form-label">
                                    Fecha preferida de contacto:
                                </label>

                                <input
                                    type="date"
                                    id="fecha"
                                    name="fecha-c"
                                    className="form-control"
                                    value={formulario.fecha}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            fecha: e.target.value
                                        })
                                    }
                                />
                            </div>

                            <div className="col-md-6">
                                <label htmlFor="horario" className="form-label">
                                    ¿En qué momento querés que te contactemos?
                                </label>

                                <select
                                    name="horario-c"
                                    id="horario"
                                    className="form-select"
                                    value={formulario.horario}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            horario: e.target.value
                                        })
                                    }
                                >
                                    <option value="" disabled>
                                        Seleccioná un horario
                                    </option>

                                    <option value="manana">Mañana</option>
                                    <option value="tarde">Tarde</option>
                                    <option value="noche">Noche</option>
                                </select>
                            </div>

                            <div className="col-12">
                                <label htmlFor="comentario" className="form-label">
                                    ¿Te gustaría hacer alguna aclaración antes de la llamada?
                                </label>

                                <textarea
                                    name="comentario-c"
                                    id="comentario"
                                    className="form-control"
                                    rows="3"
                                    value={formulario.comentario}
                                    onChange={(e) =>
                                        setFormulario({
                                            ...formulario,
                                            comentario: e.target.value
                                        })
                                    }
                                ></textarea>
                            </div>

                            <div className="col-12 text-center mt-4">
                                <button
                                    type="submit"
                                    className="btn btn-primary px-4 py-2"
                                >
                                    Enviar consulta
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    )
}
export default DetalleMoto