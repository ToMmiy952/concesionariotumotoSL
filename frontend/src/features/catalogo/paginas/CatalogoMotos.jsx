import motosData from "../../../../../backend/data/motos.json"
import ImagenSeccion from "../../../shared/components/ImagenSeccion"
import foto from "../../../assets/fotocatalogo.png"
import GrillaProductos from "../componentes/GrillaMotos"
import { useState } from "react"

function Catalogo() {
    const [ordenSeleccionado, setOrdenSeleccionado] = useState("Relevancia"); //Por defecto el orden es relevancia, se pone como viene en json

    //ahora creo una copia de motosData, porque no quiero modificar directamente el aareglo que viene del json
    const motosOrdenadas = [...motosData];

    //Ordena de forma ascendente, si a-b da negativo, significa que b es mas cara, entonces a se coloca antes que b
    if (ordenSeleccionado === "Precio: menor a mayor") {
        motosOrdenadas.sort((a, b) => a.precio - b.precio);
    }
    if (ordenSeleccionado === "Precio: mayor a menor"){
        motosOrdenadas.sort((a,b)=> b.precio - a.precio)
    }


    return <>
        {/**Todo este codigo es solo para poner el texto sobre la imagen */}
        
       <ImagenSeccion foto={foto} descripcion={"Motos"}/>

        <main>
            <h2>Elegi la moto que siempre quisiste!</h2>
            <p>Explora nuestras unidades disponibles y ponte en contacto con un asesor de inmediato.</p>

            <section id="catalogo">
                <h3>Nuestro catalogo</h3>
                {/**Esto es el filtrado, quizas tenga que ir en otro jsx aparte, pero no se donde... */}
                <div class="d-flex justify-content-between align-items-center gap-3">
                    <div>
                        <b>{motosOrdenadas.length}</b> <span style={{ color: "gray" }}>PRODUCTOS</span>
                    </div>
                    <div className="d-flex align-items-center gap-2">
                        <span>ORDENAR POR</span>
                        <div className="dropdown">
                            <button className="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                                {ordenSeleccionado}
                            </button>

                            <ul className="dropdown-menu">
                                <li><button class="dropdown-item" type="button" onClick={()=> setOrdenSeleccionado("Relevancia")}>Relevancia</button></li>
                                <li><button class="dropdown-item" type="button" onClick={()=> setOrdenSeleccionado("Precio: menor a mayor")}>Precio: menor a mayor</button></li>
                                <li><button class="dropdown-item" type="button" onClick={()=> setOrdenSeleccionado("Precio: mayor a menor")}>Precio: mayor a menor</button></li>
                            </ul>
                        </div>
                    </div>
                </div>

                <GrillaProductos motosOrdenadas={motosOrdenadas}/>{/**Es para mostrar las tarjetas de motos */}
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
            <section id="info-catalogo-ante-footer">
                <h4 > Motos 0 Km</h4>
                <p>Cycles es la elección definitiva para adquirir tu Moto 0KM.
                    Descubrí las marcas líderes del mercado como Zanella, Benelli, Motomel, Bajaj, Kymco, Corven y
                    Yamaha y los últimos lanzamientos de sus modelos.</p>

                <p>Explorá la variedad de estilos, desde las elegantes Naked y deportivas Cross hasta las versátiles Scooter,
                    Ciclos, Touring, Chopper, Deportivas, ATV, UTV y otros. También te ofrecemos nuestra sección de motos Usadas.</p>

            </section>
        </main>
    </>
}
export default Catalogo
