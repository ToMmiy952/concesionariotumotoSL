-- database/seed.sql
-- =============================================================================
-- SCRIPT DE POBLADO DE DATOS INICIALES (SEED) - tuMotoSL
-- =============================================================================

-- llenado de usuarios (Clientes, Vendedores y Administradores)
-- Contraseña '123' encriptada con hash bcryptjs
INSERT INTO usuarios (id_usuario, nombre, email, password, rol, esta_activo) OVERRIDING SYSTEM VALUE VALUES --se agrega para poder enviar id manualmente usando el script
(101, 'Juan Pérez', 'cliente@tumoto.com', '$2a$10$2B2U8eC2p8A0L4H9T1Z70uV3fX.Y0Q4/9aN.mO3aR7pP1e3K5s6M.', 'CLIENTE', true),
(102, 'Carlos Vendedor', 'vendedor@tumoto.com', '$2a$10$2B2U8eC2p8A0L4H9T1Z70uV3fX.Y0Q4/9aN.mO3aR7pP1e3K5s6M.', 'VENDEDOR', true),
(103, 'Ana Administradora', 'admin@tumoto.com', '$2a$10$2B2U8eC2p8A0L4H9T1Z70uV3fX.Y0Q4/9aN.mO3aR7pP1e3K5s6M.', 'ADMINISTRADOR', true)
ON CONFLICT (id_usuario) DO NOTHING;

-- Sincronizar secuencia de usuarios
SELECT setval(pg_get_serial_sequence('usuarios', 'id_usuario'), COALESCE(MAX(id_usuario), 1)) FROM usuarios;


-- llenado de motos (Productos base + Subtabla Motos)

-- Productos base del tipo 'MOTO'
INSERT INTO productos (id_producto, marca, stock, descripcion, imagen, precio, tipo, esta_activo) OVERRIDING SYSTEM VALUE VALUES
(1, 'Bajaj', 3, 'Moto urbana deportiva con motor de triple bujía, refrigeración líquida y gran agilidad para la ciudad.', '/img/productos/Bajaj-New-Rouser-NS-200.png', 4200000.00, 'MOTO', true),
(2, 'Benelli', 2, 'Maxitrail touring diseñada para viajes largos, con postura ergonómica, gran parabrisas y protección de motor.', '/img/productos/Benelli-TRK-502.png', 12500000.00, 'MOTO', true),
(3, 'Yamaha', 1, 'Scooter de diseño clásico y retro con tecnología de motor eficiente, liviano e ideal para el tránsito diario.', '/img/productos/Yamaha-Fascino-125.jpg', 3100000.00, 'MOTO', true),
(4, 'Yamaha', 4, 'Street de 250cc equipada con frenos ABS monocanal, excelente torque a bajas revoluciones y estética agresiva.', '/img/productos/Yamaha-FZ-25-ABS.jpg', 5800000.00, 'MOTO', true),
(5, 'Yamaha', 2, 'Naked de la familia Hyper Naked con motor bicilíndrico, horquilla invertida y estilo dinámico de alta respuesta.', '/img/productos/Yamaha-MT-03.jpg', 9900000.00, 'MOTO', true),
(6, 'Yamaha', 2, 'On-Off polivalente y resistente, perfecta tanto para asfalto como para caminos de tierra o terrenos irregulares.', '/img/productos/Yamaha-XTZ-125.jpg', 3600000.00, 'MOTO', true),
(7, 'Yamaha', 2, 'On-Off polivalente y resistente, perfecta tanto para asfalto como para caminos de tierra o terrenos irregulares.', '/img/productos/Yamaha-XTZ-125.jpg', 3600000.00, 'MOTO', true),
(8, 'Yamaha', 2, 'On-Off polivalente y resistente, perfecta tanto para asfalto como para caminos de tierra o terrenos irregulares.', '/img/productos/Yamaha-XTZ-125.jpg', 3600000.00, 'MOTO', true)
ON CONFLICT (id_producto) DO NOTHING;

-- Subtabla Motos
INSERT INTO motos (id_producto, modelo, cilindrada, estado) VALUES
(1, 'New Rouser NS 200', 200, 'Disponible'),
(2, 'TRK 502', 500, 'Disponible'),
(3, 'Fascino 125', 125, 'Disponible'),
(4, 'FZ 25 ABS', 250, 'Disponible'),
(5, 'MT 03', 321, 'Disponible'),
(6, 'XTZ 125', 125, 'Disponible'),
(7, 'XTZ 125', 125, 'Disponible'),
(8, 'XTZ 125', 125, 'Disponible')
ON CONFLICT (id_producto) DO NOTHING;


--  llenado de accesorios (Productos base + Subtabla Accesorios)

-- Productos base del tipo 'ACCESORIO'
INSERT INTO productos (id_producto, marca, stock, descripcion, imagen, precio, tipo, esta_activo)
OVERRIDING SYSTEM VALUE
VALUES
(9, 'LS2', 12, 'Casco integral con certificación DOT, liviano y ventilado.', '/img/accesorios/casco-sport.jpg', 85000.00, 'ACCESORIO', true),
(10, 'Alpine', 20, 'Guantes de cuero reforzado con protección en nudillos.', '/img/accesorios/guantes-racing.jpg', 25000.00, 'ACCESORIO', true),
(11, 'Joe Rocket', 8, 'Campera impermeable with protecciones en hombros y codos.', '/img/accesorios/campera-touring.jpg', 120000.00, 'ACCESORIO', true),
(12, 'tuMotoSL', 30, 'Remera de algodón con estampa del club motero.', '/img/accesorios/remera-club.jpg', 15000.00, 'ACCESORIO', true),
(13, 'LS2', 15, 'Casco abierto ideal para ciudad, con visor transparente.', '/img/accesorios/casco-urban.jpg', 60000.00, 'ACCESORIO', true),
(14, 'Fourstroke', 25, 'Guantes livianos con malla ventilada para días calurosos.', '/img/accesorios/guantes-verano.jpg', 18000.00, 'ACCESORIO', true)
ON CONFLICT (id_producto) DO NOTHING;

-- Subtabla Accesorios
INSERT INTO accesorios (id_producto, nombre, categoria, talle) VALUES
(9, 'Casco Integral Sport', 'Cascos', 'L'),
(10, 'Guantes de Cuero Racing', 'Guantes', 'M'),
(11, 'Campera Impermeable Touring', 'Indumentaria', 'XL'),
(12, 'Remera Moto Club', 'Indumentaria', 'L'),
(13, 'Casco Abierto Urban', 'Cascos', 'M'),
(14, 'Guantes de Verano Ventilados', 'Guantes', 'L')
ON CONFLICT (id_producto) DO NOTHING;


-- Sincronizar secuencia autoincremental de productos
SELECT setval(pg_get_serial_sequence('productos', 'id_producto'), COALESCE(MAX(id_producto), 1)) FROM productos;