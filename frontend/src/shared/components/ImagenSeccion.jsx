function ImagenSeccion({ foto, descripcion }) {
    return (
        <>
            <div style={{ position: 'relative', display: 'inline-block' }}>
                <img src={foto} alt="Descripción" />

                <p style={{
                    position: 'absolute',
                    top: '50%',
                    left: '5rem',                    
                    transform: 'translateY(-50%)',   
                    color: 'white',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                    margin: 0,
                    textAlign: 'left',               
                }}>
                    {descripcion}
                </p>
            </div>
        </>
    )
}
export default ImagenSeccion