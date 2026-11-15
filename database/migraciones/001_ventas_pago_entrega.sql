-- Migración 001: método de pago y entrega de las compras online.
-- Se puede correr sobre una base que YA tiene datos (no borra nada) y es seguro volver a correrla.
--   psql -h localhost -U <usuario> -d <base> -f database/migraciones/001_ventas_pago_entrega.sql

-- Todo en una transacción: si algún paso falla, no queda la tabla a medio modificar
BEGIN;

ALTER TABLE ventas ADD COLUMN IF NOT EXISTS metodo_pago VARCHAR(20);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS tipo_entrega VARCHAR(20);
ALTER TABLE ventas ADD COLUMN IF NOT EXISTS direccion_entrega VARCHAR(150);

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_metodo_pago_check;
ALTER TABLE ventas ADD CONSTRAINT ventas_metodo_pago_check
    CHECK (metodo_pago IN ('Credito', 'Debito', 'Mercado Pago'));

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS ventas_tipo_entrega_check;
ALTER TABLE ventas ADD CONSTRAINT ventas_tipo_entrega_check
    CHECK (tipo_entrega IN ('Domicilio', 'Retiro'));

ALTER TABLE ventas DROP CONSTRAINT IF EXISTS chk_direccion_entrega;
ALTER TABLE ventas ADD CONSTRAINT chk_direccion_entrega
    CHECK (tipo_entrega = 'Domicilio' OR direccion_entrega IS NULL);

COMMIT;
