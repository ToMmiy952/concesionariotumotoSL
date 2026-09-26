import TarjetaMoto from "../../shared/components/TarjetaMoto"
import motosData from "../../../../backend/data/motos.json"

function Catalogo() {
    return <>
        <main>
            <h2>Elegi la moto que siempre quisiste!</h2>
            <p>Explora nuestras unidades disponibles y ponte en contacto con un asesor de inmediato.</p>

            <section id="catalogo">
                <div className="catalogo-motos">
                    <h3>Nuestro catalogo</h3>
                    {motosData.map((moto) => (
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
            </section>
            <section id="como-comprar-tu-moto">
                <h3>Pasos para comprar una moto</h3>

                <ol>
                    <li>
                        <span className="titulo-paso">Elegi tu modelo ideal</span>
                        <p>Explora nuestro catalogo y selecciona la moto que se adapte a vos</p>
                    </li>

                    <li>
                        <span className="titulo-paso">
                            Completa el formulario online con tus datos
                        </span>
                        <p>Carga tus datos de contacto y un vendedor se comunicara con vos</p>
                    </li>

                    <li>
                        <span className="titulo-paso">Coordinacion y acuerdo de venta</span>
                        <p>
                            Te acercas a nuestra concesionaria para arreglar metodo de pago
                            y firmar la documentacion
                        </p>
                    </li>

                    <li>
                        <span className="titulo-paso">Listo!!!</span>
                        <p>Te llevas tu moto al instante</p>
                    </li>
                </ol>
            </section>
        </main>
    </>
}
export default Catalogo
