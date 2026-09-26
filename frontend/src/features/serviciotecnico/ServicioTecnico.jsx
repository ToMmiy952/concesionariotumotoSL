import services from "../../../../backend/data/servicios.json"
function ServicioTecnico(){
    return(
        <>
        <main className="container my-5">
  <h2 className="mb-3">
    Cronograma de Servicios Oficiales y Garantia
  </h2>

  <p className="text-secondary mb-4">
    Realiza los servicios tecnicos correspondientes en talleres autorizados para mantener la garantia de tu moto.
  </p>

  <div className="contenedor-de-tabla table-responsive">
    <table className="table table-bordered align-middle">
      <caption id="titulo-tabla-service">
        Plan de mantenimiento preventivo y precios oficiales sugeridos
      </caption>

      <thead>
        <tr>
          <th scope="col">Marca</th>
          <th scope="col">Modelo</th>
          <th scope="col">Service</th>
          <th scope="col">Intervalo Sugerido</th>
          <th scope="col">Tareas de Mantenimiento</th>
          <th scope="col">Precio Estimado</th>
          <th scope="col">Garantia</th>
        </tr>
      </thead>
      {/**quedo medio complejo para entender pero bueno, hay que leer el json para que se aclare un poco... */}
      <tbody>
        {services.map((moto) => (
          moto.servicios.map((srv, index) => (
            <tr key={srv.id}>
              {index === 0 && (
                <>
                  <th
                    scope="row"
                    rowSpan={moto.servicios.length}
                    className="fw-bold text-center"
                  >
                    {moto.marca}
                  </th>

                  <td
                    rowSpan={moto.servicios.length}
                    className="text-center"
                  >
                    {moto.modelo}
                  </td>
                </>
              )}

              <td>{srv.service}</td>
              <td>{srv.intervalo}</td>
              <td>{srv.tareas}</td>
              <td>{srv.precio}</td>
              <td>{srv.garantia}</td>
            </tr>
          ))
        ))}
      </tbody>
    </table>
  </div>
</main>
        </>
    )
}
export default ServicioTecnico