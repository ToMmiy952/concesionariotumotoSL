import accesoriosData from "../../../../../backend/data/accesorios.json"
import TarjetaAccesorios from "../componentes/TarjetaAccesorios"
import ImagenSeccion from "../../../shared/components/ImagenSeccion"
import GrillaAccesorios from "../componentes/GrillaAccesorios"
import foto from "../../../assets/seccionAccesorios.png"
import { useState } from "react"

function CatalogoAccesorios(){
     const [ordenSeleccionado, setOrdenSeleccionado] = useState("Relevancia"); //Por defecto el orden es relevancia, se pone como viene en json

    //ahora creo una copia de motosData, porque no quiero modificar directamente el aareglo que viene del json
    const accesoriosOrdenados = [...accesoriosData];
     //Ordena de forma ascendente, si a-b da negativo, significa que b es mas cara, entonces a se coloca antes que b
    if (ordenSeleccionado === "Precio: menor a mayor") {
        accesoriosOrdenados.sort((a, b) => a.precio - b.precio);
    }
    if (ordenSeleccionado === "Precio: mayor a menor"){
        accesoriosOrdenados.sort((a,b)=> b.precio - a.precio)
    }
    return(
        <>
        <ImagenSeccion foto={foto} descripcion={"Accesorios"}/>

        <main>                        

            <section id="catalogo">
                <h3>Equipate con lo mejor para vos!.</h3>
                {/**Esto es el filtrado, quizas tenga que ir en otro jsx aparte, pero no se donde... */}
                <div class="d-flex justify-content-between align-items-center gap-3">
                    <div>
                        <b>{accesoriosOrdenados.length}</b> <span style={{ color: "gray" }}>PRODUCTOS</span>
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
                
                <GrillaAccesorios accesoriosOrdenados={accesoriosOrdenados}/>{/**Es para mostrar las tarjetas de motos */}
            </section>            
            <section id="info-catalogo-ante-footer">
                <h4 > Tu seguridad empieza por los detalles</h4>
                <p>Cascos, guantes, camperas y todo lo que necesitás para rodar cómodo y protegido. Consultanos si no encontrás tu talle.</p>

                <h6>¿No encontrás lo que buscás?</h6>
                <p>Escribinos y te ayudamos a conseguir el accesorio que necesitás. Envíos a todo el país.</p>
            </section>
        </main>
        </>
    )
}
export default CatalogoAccesorios
