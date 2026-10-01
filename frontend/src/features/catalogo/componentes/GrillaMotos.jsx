import TarjetaMoto from "./TarjetaMoto";
function GrillaProductos({motosOrdenadas}){
    
    return(
        <>
        <div className="catalogo-motos mt-3">
                    {motosOrdenadas.map((moto) => (
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
        </>
    )
}
export default GrillaProductos