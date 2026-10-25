-- Eliminar tablas si existen para reiniciar el esquema limpiamente
DROP TABLE IF EXISTS detalle_venta CASCADE;
DROP TABLE IF EXISTS ventas CASCADE;
DROP TABLE IF EXISTS item_carrito CASCADE;
DROP TABLE IF EXISTS carritos CASCADE;
DROP TABLE IF EXISTS reservas CASCADE;
DROP TABLE IF EXISTS accesorios CASCADE;
DROP TABLE IF EXISTS motos CASCADE;
DROP TABLE IF EXISTS productos CASCADE;
DROP TABLE IF EXISTS administradores CASCADE;
DROP TABLE IF EXISTS vendedores CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- ENUMs para tipos fijos 
CREATE TYPE rol_usuario AS ENUM ('CLIENTE', 'VENDEDOR', 'ADMINISTRADOR');
CREATE TYPE tipo_producto AS ENUM ('MOTO', 'ACCESORIO');
CREATE TYPE estado_moto AS ENUM ('Disponible', 'Reservada');
CREATE TYPE estado_reserva AS ENUM ('vigente', 'concretada', 'vencida', 'cancelada');

-- 1.  USUARIOS
CREATE TABLE usuarios (
    id_usuario INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(150) NOT NULL,
    rol rol_usuario NOT NULL,
    esta_activo BOOLEAN NOT NULL DEFAULT true,
    creado_en TIMESTAMP NOT NULL DEFAULT now()
);

-- 2. Herencia de USUARIOS (Herencia PK = FK)
CREATE TABLE clientes (
    id_usuario INT PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    telefono VARCHAR(30),
    direccion VARCHAR(50) NOT NULL,
    cod_postal INT NOT NULL,
    provincia VARCHAR(30) NOT NULL
);

CREATE TABLE vendedores (
    id_usuario INT PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
    fecha_contratacion DATE NOT NULL
);

CREATE TABLE administradores (
    id_usuario INT PRIMARY KEY REFERENCES usuarios(id_usuario) ON DELETE CASCADE
);

-- 3.  PRODUCTOS
CREATE TABLE productos (
    id_producto INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    marca VARCHAR(50) NOT NULL,
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    descripcion TEXT,
    imagen VARCHAR(255),
    precio DECIMAL(12, 2) NOT NULL CHECK (precio > 0),
    tipo tipo_producto NOT NULL,
    esta_activo BOOLEAN NOT NULL DEFAULT true
);

-- 4 herencia de productos (Herencia PK = FK)
CREATE TABLE motos (
    id_producto INT PRIMARY KEY REFERENCES productos(id_producto) ON DELETE CASCADE,
    modelo VARCHAR(100) NOT NULL,
    cilindrada INT,
    estado estado_moto NOT NULL DEFAULT 'Disponible'
);

CREATE TABLE accesorios (
    id_producto INT PRIMARY KEY REFERENCES productos(id_producto) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    categoria VARCHAR(30) NOT NULL,
    talle VARCHAR(50)
);

-- 5. RESERVAS (Sin DELETE CASCADE para llevar el  historial de solicitudes)
CREATE TABLE reservas (
    id_reserva INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_moto INT NOT NULL REFERENCES motos(id_producto),
    nombre_interesado VARCHAR(100) NOT NULL,
    email_interesado VARCHAR(100) NOT NULL,
    telefono_interesado VARCHAR(30) NOT NULL,
    fecha_reserva TIMESTAMP NOT NULL DEFAULT now(),
    fecha_vencimiento TIMESTAMP NOT NULL,
    horario_preferido VARCHAR(30),
    estado_reserva estado_reserva NOT NULL DEFAULT 'vigente',
    comentarios TEXT
);

-- 6 CARRITO 
CREATE TABLE carritos (
    id_carrito INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_cliente INT NOT NULL UNIQUE REFERENCES clientes(id_usuario) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT now(),
    fecha_actualizacion TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE item_carrito (
    id_item_carrito INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_carrito INT NOT NULL REFERENCES carritos(id_carrito) ON DELETE CASCADE,
    id_accesorio INT NOT NULL REFERENCES accesorios(id_producto),
    cantidad INT NOT NULL CHECK (cantidad > 0)
);

-- 7. VENTAS Y DETALLE HISTÓRICO (Sin DELETE CASCADE en referencias a productos/usuarios)
CREATE TABLE ventas (
    id_venta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha TIMESTAMP NOT NULL DEFAULT now(),
    monto_total DECIMAL(12, 2) NOT NULL CHECK (monto_total >= 0),
    tipo_venta VARCHAR(30) NOT NULL CHECK (tipo_venta IN ('Moto', 'Accesorio Online', 'Accesorio Presencial')),
    id_cliente INT REFERENCES clientes(id_usuario),
    id_vendedor INT REFERENCES vendedores(id_usuario),
    CONSTRAINT chk_reglas_venta CHECK (
        (tipo_venta = 'Moto' AND id_vendedor IS NOT NULL AND id_cliente IS NULL) OR
        (tipo_venta = 'Accesorio Online' AND id_cliente IS NOT NULL AND id_vendedor IS NULL) OR
        (tipo_venta = 'Accesorio Presencial' AND id_cliente IS NULL AND id_vendedor IS NULL)
    )
);

CREATE TABLE detalle_venta (
    id_detalle_venta INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    id_venta INT NOT NULL REFERENCES ventas(id_venta) ON DELETE CASCADE,
    id_producto INT NOT NULL REFERENCES productos(id_producto), -- Mantiene la referencia intacta
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario_historico DECIMAL(12, 2) NOT NULL CHECK (precio_unitario_historico > 0)
);