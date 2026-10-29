import TarjetaMoto from "./TarjetaMoto";
function GrillaProductos({motosOrdenadas}){
    
    return(
        <>
        <div className="row g-4 mt-3">
                    {motosOrdenadas.map((moto) => (
                        <TarjetaMoto
                            key={moto.id_producto}
                            id={moto.id_producto}
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