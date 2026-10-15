import { useParams, Link } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { obtenerMotoPorId } from '../servicios/motoService';
import { crearReserva } from '../../vendedor/consultasService';

function DetalleMoto() {
    const { id } = useParams(); // Obtengo el ID que viene en la URL

    // Estados para la carga asíncrona de la moto
    const [moto, setMoto] = useState(null);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState(null);

    // Estados para el formulario de consulta
    const [formulario, setFormulario] = useState({
        nombre: "",
        email: "",
        telefono: "",
        fecha: "",
        horario: "",
        comentario: ""
    });

    // Objeto para guardar qué campos tienen error y sus mensajes
    const [errores, setErrores] = useState({});
    const [consultaEnviada, setConsultaEnviada] = useState(false);
    const [errorReserva, setErrorReserva] = useState(null);

    // Referencia al elemento <form> para enfocar el primer campo con error
    const formularioRef = useRef(null);

    // Cargar la moto usando la capa de servicio
    useEffect(() => {
        async function cargarDetalle() {
            try {
                setCargando(true);
                setError(null);
                const data = await obtenerMotoPorId(id);
                setMoto(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setCargando(false);
            }
        }

        cargarDetalle();
    }, [id]);


    //Aca uso un unico manejador de cambios para todos los campos del form
    function handleChange(e) {
        const { name, value } = e.target;

        // Actualizar el valor en el estado
        setFormulario({
            ...formulario,
            [name]: value
        });

        // Limpiar el error del campo a medida que el usuario escribe
        if (errores[name]) {
            setErrores({
                ...errores,
                [name]: null
            });
        }
    }

    function validarCampos(valores) {
        const nuevosErrores = {};

        // Comprobar campos obligatorios vacíos (trim() elimina espacios sobrantes)
        if (!valores.nombre.trim()) {
            nuevosErrores.nombre = "El nombre es obligatorio.";
        }

        if (!valores.email.trim()) {
            nuevosErrores.email = "El correo electrónico es obligatorio.";
        } else if (!valores.email.includes("@")) {
            nuevosErrores.email = "Ingresá un correo electrónico válido.";
        }

        if (!valores.telefono.trim()) {
            nuevosErrores.telefono = "El teléfono es obligatorio.";
        } else if (valores.telefono.replace(/\D/g, "").length < 8) {
            nuevosErrores.telefono = "Ingresá un teléfono válido (mínimo 8 dígitos).";
        }

        if (!valores.horario) {
            nuevosErrores.horario = "Debes seleccionar un momento del día para el contacto.";
        }

        return nuevosErrores;
    }
    function manejarEnvio(e) {
        e.preventDefault(); // Evita recargar la página al enviar

        // Validar datos ingresados
        const erroresDetectados = validarCampos(formulario);
        setErrores(erroresDetectados);

        // Si hay errores, enfocar el primer campo con problema y detener el envío[cite: 1]
        const camposConError = Object.keys(erroresDetectados);
        if (camposConError.length > 0) {
            const primerCampo = camposConError[0];
            if (formularioRef.current && formularioRef.current.elements[primerCampo]) {
                formularioRef.current.elements[primerCampo].focus(); // Lleva el cursor directamente al campo faltante[cite: 1]
            }
            setConsultaEnviada(false);
            return;
        }
        // Registro la reserva por 48 hs (la moto pasa a "Reservada")
        const resultado = crearReserva(moto.id, formulario);
        if (!resultado.ok) {
            setErrorReserva(resultado.error);
            setConsultaEnviada(false);
            return;
        }

        // Limpio el formulario
        setFormulario({
            nombre: "",
            email: "",
            telefono: "",
            fecha: "",
            horario: "",
            comentario: ""
        });

        // Muestro mensaje de éxito y actualizo el estado de la moto en pantalla
        setErrorReserva(null);
        setConsultaEnviada(true);
        obtenerMotoPorId(moto.id).then(setMoto).catch(() => {});
    }

    // Visualización durante la carga
    if (cargando) {
        return (
            <div className="container my-5 text-center">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
                <p className="mt-2 text-secondary">Cargando información de la moto...</p>
            </div>
        );
    }

    // Si hubo error o no se encontró la moto
    if (error || !moto) {
        return (
            <div className="container my-5 text-center">
                <h2>Moto no encontrada</h2>
                <p className="text-secondary">
                    {error || 'No encontramos ninguna moto con el identificador ingresado.'}
                </p>
                <Link to="/catalogo" className="btn btn-primary mt-3">
                    Volver al catálogo
                </Link>
            </div>
        );
    }

    const precioFormateado = new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        maximumFractionDigits: 0
    }).format(moto.precio);


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
                <section className="bg-light p-4 rounded shadow-sm">
                    <h3 className="mb-3">¿Te interesa esta moto? Reservá tu cita de compra</h3>
                    <p className="text-muted">
                        Dejanos tus datos y la moto queda reservada por 48 horas. Un vendedor se va a comunicar con vos.
                    </p>

                    {/* Mensaje de confirmación exitosa */}
                    {consultaEnviada && (
                        <div className="alert alert-success" role="alert">
                            ¡Tu reserva fue registrada! La moto queda reservada por 48 horas y te contactaremos pronto.
                        </div>
                    )}

                    {/* Error al reservar (por ejemplo, sin stock) */}
                    {errorReserva && (
                        <div className="alert alert-danger" role="alert">{errorReserva}</div>
                    )}

                    {/* Sin stock no se puede reservar */}
                    {moto.stock <= 0 && (
                        <div className="alert alert-warning" role="alert">
                            Esta moto está agotada por el momento, por eso no se pueden registrar nuevas reservas.
                        </div>
                    )}

                    {/* Alerta general si hay campos vacíos al enviar */}
                    {Object.keys(errores).length > 0 && (
                        <div className="alert alert-danger" role="alert">
                            Por favor, completa todos los campos obligatorios indicados.
                        </div>
                    )}

                    <form ref={formularioRef} onSubmit={manejarEnvio} noValidate>
                        {/* Campo Nombre */}
                        <div className="mb-3">
                            <label htmlFor="nombre" className="form-label">
                                Nombre <span className="text-danger">*</span>
                            </label>
                            <input
                                type="text"
                                id="nombre"
                                name="nombre"
                                className={`form-control ${errores.nombre ? 'is-invalid' : ''}`}
                                value={formulario.nombre}
                                onChange={handleChange}
                            />
                            {errores.nombre && (
                                <div className="invalid-feedback">{errores.nombre}</div>
                            )}
                        </div>

                        {/* Campo Email */}
                        <div className="mb-3">
                            <label htmlFor="email" className="form-label">
                                Email <span className="text-danger">*</span>
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                className={`form-control ${errores.email ? 'is-invalid' : ''}`}
                                value={formulario.email}
                                onChange={handleChange}
                            />
                            {errores.email && (
                                <div className="invalid-feedback">{errores.email}</div>
                            )}
                        </div>

                        {/* Campo Teléfono */}
                        <div className="mb-3">
                            <label htmlFor="telefono" className="form-label">
                                Teléfono <span className="text-danger">*</span>
                            </label>
                            <input
                                type="tel"
                                id="telefono"
                                name="telefono"
                                className={`form-control ${errores.telefono ? 'is-invalid' : ''}`}
                                value={formulario.telefono}
                                onChange={handleChange}
                            />
                            {errores.telefono && (
                                <div className="invalid-feedback">{errores.telefono}</div>
                            )}
                        </div>

                        {/* Campo Fecha (Opcional) */}
                        <div className="mb-3">
                            <label htmlFor="fecha" className="form-label">Fecha preferida de contacto:</label>
                            <input
                                type="date"
                                id="fecha"
                                name="fecha"
                                className="form-control"
                                value={formulario.fecha}
                                onChange={handleChange}
                            />
                        </div>

                        {/* Campo Horario */}
                        <div className="mb-3">
                            <label htmlFor="horario" className="form-label">
                                ¿En qué momento querés que te contactemos? <span className="text-danger">*</span>
                            </label>
                            <select
                                id="horario"
                                name="horario"
                                className={`form-select ${errores.horario ? 'is-invalid' : ''}`}
                                value={formulario.horario}
                                onChange={handleChange}
                            >
                                <option value="">Seleccioná un horario...</option>
                                <option value="manana">Mañana</option>
                                <option value="tarde">Tarde</option>
                                <option value="noche">Noche</option>
                            </select>
                            {errores.horario && (
                                <div className="invalid-feedback">{errores.horario}</div>
                            )}
                        </div>

                        {/* Campo Comentario (Opcional) */}
                        <div className="mb-3">
                            <label htmlFor="comentario" className="form-label">
                                ¿Te gustaría hacer alguna aclaración antes de la llamada?
                            </label>
                            <textarea
                                id="comentario"
                                name="comentario"
                                className="form-control"
                                rows="3"
                                value={formulario.comentario}
                                onChange={handleChange}
                            ></textarea>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={moto.stock <= 0}>
                            Reservar cita
                        </button>
                    </form>
                </section>
            </main>
        </>
    )
}
export default DetalleMoto
