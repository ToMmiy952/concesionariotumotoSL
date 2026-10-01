function ImagenSeccion({foto, descripcion}){
    return(
        <>
         <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img
                        src={foto}
                        alt="Descripción"
                    />
                    <p style={{
                        position: 'absolute',
                        top: '50%',
                        left: '5rem',
                        transform: 'translate(-50%, -50%)',  // centra exacto
                        color: 'white',
                        fontSize: '2.5rem',
                        fontWeight: 'bold',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)',  // para que se lea
                        margin: 0,
                    }}>
                       {descripcion}
                    </p>
                </div>
        </>
    )
}
export default ImagenSeccion