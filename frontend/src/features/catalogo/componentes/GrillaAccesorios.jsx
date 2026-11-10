import TarjetaAccesorios from "./TarjetaAccesorios"
function GrillaAccesorios({accesoriosOrdenados}){
    
    return(
        <>
        <div className="catalogo-motos mt-3">
                    {accesoriosOrdenados.map((accesorio) => (
                        <TarjetaAccesorios
                            key={accesorio.id_producto}
                            id={accesorio.id_producto}
                            nombre={accesorio.nombre}                            
                            precio={accesorio.precio}
                            imagen={accesorio.imagen}
                        />
                    ))}
                </div>
        </>
    )
}
export default GrillaAccesorios