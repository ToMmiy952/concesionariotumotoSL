import { pool } from '../config/db.js';

export const motosController = {
    // 1. GET /api/v1/motos (Vidriera pública con filtros por query)
    async listar(req, res, next) {
        const { marca, estado } = req.query;

        try {
            let query = `
        SELECT p.id_producto, p.marca, m.modelo, p.precio, m.cilindrada, 
               p.descripcion, p.imagen, p.stock, m.estado, p.esta_activo
        FROM productos p
        INNER JOIN motos m ON p.id_producto = m.id_producto
        WHERE p.esta_activo = true
      `;
            const params = [];

            if (marca) {
                params.push(`%${marca}%`);
                query += ` AND p.marca ILIKE $${params.length}`;
            }

            if (estado) {
                params.push(estado);
                query += ` AND m.estado = $${params.length}`;
            }

            query += ` ORDER BY p.id_producto DESC`;

            const result = await pool.query(query, params);
            return res.json(result.rows);
        } catch (error) {
            next(error);
        }
    },

    // 2. GET /api/v1/motos/:id (Obtener detalle de una moto)
    async obtenerPorId(req, res, next) {
        const { id } = req.params;

        try {
            const result = await pool.query(
                `SELECT p.id_producto, p.marca, m.modelo, p.precio, m.cilindrada, 
                p.descripcion, p.imagen, p.stock, m.estado, p.esta_activo
         FROM productos p
         INNER JOIN motos m ON p.id_producto = m.id_producto
         WHERE p.id_producto = $1 AND p.esta_activo = true`,
                [id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Moto no encontrada' });
            }

            return res.json(result.rows[0]);
        } catch (error) {
            next(error);
        }
    },

    // 3. POST /api/v1/motos (Alta de moto - Exclusivo Admin)
    async crear(req, res, next) {
        const { marca, modelo, precio, cilindrada, descripcion, imagen, stock = 0 } = req.body;

        if (!marca || !modelo || !precio) {
            return res.status(400).json({ error: 'Marca, modelo y precio son obligatorios' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const prodResult = await client.query(
                `INSERT INTO productos (marca, stock, descripcion, imagen, precio, tipo)
         VALUES ($1, $2, $3, $4, $5, 'MOTO')
         RETURNING id_producto`,
                [marca, stock, descripcion || null, imagen || null, precio]
            );

            const idProducto = prodResult.rows[0].id_producto;

            await client.query(
                `INSERT INTO motos (id_producto, modelo, cilindrada, estado)
         VALUES ($1, $2, $3, 'Disponible')`,
                [idProducto, modelo, cilindrada || null]
            );

            await client.query('COMMIT');

            return res.status(201).json({
                mensaje: 'Moto creada con éxito',
                id_producto: idProducto
            });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    // 4. PUT /api/v1/motos/:id (Modificar moto - Exclusivo Admin)
    async actualizar(req, res, next) {
        const { id } = req.params;
        const { marca, modelo, precio, cilindrada, descripcion, imagen, stock, estado } = req.body;

        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            const prodResult = await client.query(
                `UPDATE productos 
         SET marca = COALESCE($1, marca),
             precio = COALESCE($2, precio),
             descripcion = COALESCE($3, descripcion),
             imagen = COALESCE($4, imagen),
             stock = COALESCE($5, stock)
         WHERE id_producto = $6 AND esta_activo = true
         RETURNING id_producto`,
                [marca, precio, descripcion, imagen, stock, id]
            );

            if (prodResult.rows.length === 0) {
                await client.query('ROLLBACK');
                return res.status(404).json({ error: 'Moto no encontrada para actualizar' });
            }

            await client.query(
                `UPDATE motos 
         SET modelo = COALESCE($1, modelo),
             cilindrada = COALESCE($2, cilindrada),
             estado = COALESCE($3, estado)
         WHERE id_producto = $4`,
                [modelo, cilindrada, estado, id]
            );

            await client.query('COMMIT');
            return res.json({ mensaje: 'Moto actualizada correctamente' });
        } catch (error) {
            await client.query('ROLLBACK');
            next(error);
        } finally {
            client.release();
        }
    },

    // 5. DELETE /api/v1/motos/:id (Baja lógica - Exclusivo Admin)
    async eliminar(req, res, next) {
        const { id } = req.params;

        try {
            const result = await pool.query(
                `UPDATE productos SET esta_activo = false WHERE id_producto = $1 AND esta_activo = true`,
                [id]
            );

            if (result.rowCount === 0) {
                return res.status(404).json({ error: 'Moto no encontrada o ya estaba dada de baja' });
            }

            return res.status(200).json({ 
            mensaje: 'Moto dada de baja exitosamente' 
        });
        } catch (error) {
            next(error);
        }
    }
};