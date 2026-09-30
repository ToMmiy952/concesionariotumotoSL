import comprasegura from '../../assets/comprasegura.png'
import debcredito from '../../assets/debcredito.png'
import img1pcarrusel from '../../assets/img1pcarrusel.png'
import elegisiemprequisiste from '../../assets/elegisiemprequisiste.png'
import img2pcarru from '../../assets/img2pcarru.png'
import TarjetaMoto from '../../shared/components/TarjetaMoto'
import motosData from '../../../../backend/data/motos.json'
import plan from '../../assets/plan.png'
function Home() {
    const motosPorPagina = 4;
    const paginasCarrusel = [];

    for (let i = 0; i < motosData.length; i += motosPorPagina) {
        paginasCarrusel.push(motosData.slice(i, i + motosPorPagina));
    }
    return (
        <>
            <div id="carruselPromo" className="carousel carousel-dark slide" data-bs-ride="carousel">
                <div className="carousel-indicators">
                    <button
                        type="button"
                        data-bs-target="#carruselPromo"
                        data-bs-slide-to="0"
                        className="active"
                        aria-current="true"
                        aria-label="Slide 1"
                    ></button>

                    <button
                        type="button"
                        data-bs-target="#carruselPromo"
                        data-bs-slide-to="1"
                        aria-label="Slide 2"
                    ></button>

                    <button
                        type="button"
                        data-bs-target="#carruselPromo"
                        data-bs-slide-to="2"
                        aria-label="Slide 3"
                    ></button>
                </div>

                <div className="carousel-inner">
                    <div className="carousel-item active">
                        <img
                            src={img1pcarrusel}
                            className="d-block w-100"
                            alt="img1pcarrusel"
                        />
                    </div>

                    <div className="carousel-item">
                        <img
                            src={img2pcarru}
                            className="d-block w-100"
                            alt="img2pcarru"
                        />
                    </div>
                </div>

                <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#carruselPromo"
                    data-bs-slide="prev"
                >
                    <span
                        className="carousel-control-prev-icon"
                        aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Previous</span>
                </button>

                <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#carruselPromo"
                    data-bs-slide="next"
                >
                    <span
                        className="carousel-control-next-icon"
                        aria-hidden="true"
                    ></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            {/* Cinta bajo carrusel */}
            <div className="d-flex justify-content-center align-items-center gap-3 cinta-bajo-carrusel">
                <div>
                    <img src={debcredito} alt="Forma-pago" />
                </div>

                <div>
                    <img src={comprasegura} alt="Forma-pago" />
                </div>
            </div>

            {/* Este div encierra todo: título y carrusel */}
            <div className="container border rounded p-4 my-4 bg-white shadow-sm">
                {/* Promociones */}
                <h4 className="ms-3" id="titulo-promocion">
                    ¡Aprovecha nuestras Promociones!
                </h4>

                {/* Carrusel de promociones */}
                <div
                    id="carrusel-promocion"
                    className="carousel carousel-dark slide"
                    data-bs-ride="carousel">

                    <div className="carousel-inner">
                        {paginasCarrusel.map((grupoDeCuatro, indicePagina) => (
                            <div
                                key={indicePagina}
                                className={`carousel-item ${indicePagina === 0 ? "active" : ""}`}
                            >
                                {/* Contiene las 4 tarjetas juntas en una fila */}
                                <div className="row g-3">
                                    {grupoDeCuatro.map((moto) => (
                                        <TarjetaMoto
                                            key={moto.id}
                                            id={moto.id}
                                            marca={moto.marca}
                                            modelo={moto.modelo}
                                            precio={moto.precio}
                                            cilindrada={moto.cilindrada}
                                            imagen={moto.imagen}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Botón Anterior */}
                    <button
                        className="carousel-control-prev"
                        type="button"
                        data-bs-target="#carrusel-promocion"
                        data-bs-slide="prev"
                    >
                        <span
                            className="carousel-control-prev-icon"
                            aria-hidden="true"
                        />
                        <span className="visually-hidden">
                            Anterior
                        </span>
                    </button>

                    {/* Botón Siguiente */}
                    <button
                        className="carousel-control-next w-auto pe-2"
                        type="button"
                        data-bs-target="#carrusel-promocion"
                        data-bs-slide="next"
                    >
                        <span
                            className="carousel-control-next-icon"
                            aria-hidden="true"
                        />
                        <span className="visually-hidden">
                            Siguiente
                        </span>
                    </button>


                </div>
            </div>

            <img
                src={elegisiemprequisiste}
                className="d-block w-100"
                alt="imgSiemprequisiste"
            />

            <div className="container border rounded p-4 my-4 bg-white shadow-sm">
                <h4 className="ms-3" id="titulo-promocion">
                    ¡Dale un vistazo a la nueva Honda!
                </h4>

                <div className="row justify-content-center">
                    <div className="col-12 col-md-8 text-center">
                        <div className="ratio ratio-16x9">
                            {/* ratio 16x9 es para que sea responsivo */}
                            <iframe
                                width="560"
                                height="315"
                                src="https://www.youtube.com/embed/gh6kBl9Qs24?si=gISo1ck5cNKvBORB"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </div>
                </div>                                                  
            </div>
             <img
                src={plan}
                className="d-block w-100"
                alt="imgSiemprequisiste"
            />
        </>
    );
}

export default Home

