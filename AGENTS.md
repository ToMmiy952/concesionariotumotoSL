# AGENTS.md

Aplicación en español para un concesionario de motocicletas. Dos proyectos independientes de npm (sin workspace en la raíz): API Express en backend/, SPA React en frontend/, scripts de PostgreSQL en database/, colección de API en postman/.
## 🌐 Idioma
- Toda la comunicación, explicaciones, comentarios de código y respuestas del agente deben ser exclusivamente en **español**.

## Ejecutar localmente

Ejecutar desde la raíz del repositorio; el backend y el frontend necesitan terminales separadas.

# 1. Reiniciar la base de datos. schema.sql ELIMINA y vuelve a crear todas las tablas.
$env:PGPASSWORD = "<contraseña de postgres>"   # dropdb/psql deben estar en PATH
dropdb -U postgres --if-exists tumotosl_db
createdb -U postgres tumotosl_db
psql -U postgres -d tumotosl_db -f database/schema.sql
psql -U postgres -d tumotosl_db -f database/seed.sql

# 2. Backend
npm --prefix backend install
# Solo en una clonación nueva: copiar backend/.env.example a backend/.env y luego completar PG* y JWT_SECRET.
npm --prefix backend run dev                   # node --watch, http://localhost:3000

# 3. Frontend
npm --prefix frontend install
npm --prefix frontend run dev                  # http://localhost:5173

backend/src/config/env.js genera un error al iniciar si falta JWT_SECRET; .env está excluido de Git mediante .gitignore.

process.loadEnvFile() requiere Node >= 20.12, a pesar de que el README indica que se necesita Node 18+.

Credenciales de acceso de prueba: cliente@tumoto.com, vendedor@tumoto.com, admin@tumoto.com — contraseña 123.

La ruta base de la API es /api/v1; el endpoint de verificación de estado es GET /api/health.

La colección de Postman postman/TuMotoSL.postman_collection.json tiene baseUrl configurada de antemano como http://localhost:3000/api/v1.

## Verificaciones

npm --prefix frontend run lint — el único paso de lint del repositorio.

npm --prefix frontend run build — compilación de producción.

No existe ningún ejecutor de pruebas, formateador, verificador de tipos, CI ni script de lint/compilación para el backend; no inventar comandos.

Verificación manual del backend: iniciarlo y acceder a /api/health (o utilizar la colección de Postman).

## Backend

Punto de entrada: src/server.js → src/app.js, donde todos los routers se montan bajo /api/v1. Registrar allí los nuevos routers.

Flujo: routes/*.routes.js → controllers/*.controller.js → config/db.js (pool, conTransaccion). Utilizar conTransaccion para escrituras que abarquen tablas relacionadas; utilizar router.param('id', validarId) para :id.

Autenticación: verificarToken completa req.usuario = { id_usuario, email, rol }; a continuación, utilizar permitirRoles('ADMINISTRADOR'), etc. Utilizar router.use(...) para routers completamente protegidos.

Errores: responder con res.status(n).json({ error }); los errores inesperados llegan a middlewares/manejarErrores.js, que también traduce los códigos de PG (23505 → 409, 23503 → 409).

El esquema utiliza herencia de tablas: productos + motos/accesorios, y usuarios + clientes/vendedores/administradores. Insertar/actualizar ambas filas dentro de una misma transacción. Las eliminaciones de productos son lógicas (soft deletes) (productos.esta_activo = false).

Las columnas numeric/DECIMAL son devueltas por pg como cadenas de texto; convertirlas con Number(...) antes de realizar operaciones aritméticas o calcular totales.

Los cuerpos de las solicitudes utilizan formatos mixtos: el carrito/las ventas usan camelCase (idAccesorio, idMoto, cantidad); las reservas/los usuarios mantienen snake_case (nombre_interesado, estado_reserva, cod_postal). Adaptarse al controlador que se modifique; las respuestas utilizan mayormente snake_case de la base de datos.

La comisión es del 10% (config/negocio.js), se calcula al leer los datos en metricas.controller.js; no se almacena en la base de datos.

## Frontend

React 19 + Vite 8, JSX puro (sin TypeScript); las importaciones utilizan react-router (v8), no react-router-dom.

Las rutas y los guards se encuentran en src/router.jsx: las páginas públicas están bajo LayoutPublico, las páginas del personal bajo /gestor; los guards son route loaders (protegerRuta([...]) en features/auth/loaders.js).

Utilizar src/shared/utils/api.js: apiJson devuelve { ok, status, data } y nunca lanza excepciones; apiFetch devuelve un Response. La URL base es VITE_API_URL o http://localhost:3000/api/v1; el valor de la variable de entorno debe incluir /api/v1.

La sesión se encuentra en sessionStorage, clave sesion. Los roles del frontend están en minúsculas (cliente/vendedor/administrador); los roles de la API/JWT están en mayúsculas.

Estructura de funcionalidades: src/features/<domain>/; el diseño, los componentes y los estilos compartidos se encuentran en src/shared/.

**La persistencia está dividida.** API/PostgreSQL: catálogo público de motos y accesorios (listado/detalle), alta/edición/baja de motos desde /gestor/productos (features/admin/motosService.js), alta/edición/baja de accesorios desde /gestor/accesorios (features/admin/accesoriosService.js), carrusel de motos de Home (features/catalogo/servicios/motoService.js), consulta de stock y venta presencial de motos desde /gestor/stock (POST /ventas/motos), reservas, carrito, proceso de compra, pedidos de vendedores, pedidos de clientes, métricas de administración. JSON estático heredado: ServicioTecnico.jsx importa backend/data/servicios.json (se mantiene a propósito). Priorizar los servicios de API para los nuevos desarrollos.

Los textos visibles para el usuario y la mayoría de los comentarios están en español (voseo argentino). Mantener en español los nuevos textos de la interfaz.

🎯 **OBJETIVO DE MIGRACIÓN:**
Queremos eliminar gradualmente toda la persistencia en archivos JSON y localStorage para que **TODOS** los módulos del frontend consuman directamente la base de datos PostgreSQL a través de la API Express (utilizando la arquitectura por capas `routes -> controllers ->  PostgreSQL`).