import { reservasRepository } from '../repositories/reservas.repository.js';
import { emailValido, enteroPositivo } from '../utils/validaciones.js';

const ESTADOS_RESERVA = ['vigente', 'concretada', 'vencida', 'cancelada'];

export const reservasController = {
  // POST /api/v1/reservas (público: reserva una cita por 48 hs, sin cuenta)
  async crear(req, res) {
    const { idMoto, nombre_interesado, email_interesado, telefono_interesado, horario_preferido, comentarios } = req.body;

    if (!idMoto || !nombre_interesado || !email_interesado || !telefono_interesado) {
      return res.status(400).json({
        error: 'El ID de la moto, el nombre, el email y el teléfono del interesado son obligatorios',
      });
    }
    if (!enteroPositivo(idMoto)) {
      return res.status(400).json({ error: 'El ID de la moto debe ser un número entero positivo' });
    }
    if (!emailValido(email_interesado)) {
      return res.status(400).json({ error: 'El email no tiene un formato válido' });
    }

    const { resultado, reserva } = await reservasRepository.crear({
      idMoto, nombre_interesado, email_interesado, telefono_interesado, horario_preferido, comentarios,
    });

    if (resultado === 'moto_inexistente') {
      return res.status(404).json({ error: 'La moto solicitada no existe o está inactiva' });
    }
    if (resultado === 'sin_unidades') {
      return res.status(409).json({ error: 'No hay unidades disponibles para reservar esta moto' });
    }

    res.status(201).json({ mensaje: 'Reserva de cita registrada con éxito por 48 horas', reserva });
  },

  // GET /api/v1/reservas (vendedor o admin, filtro ?estado=)
  async listar(req, res) {
    const estado = req.query.estado?.trim().toLowerCase();
    if (estado && !ESTADOS_RESERVA.includes(estado)) {
      return res.status(400).json({ error: 'Estado de reserva no válido' });
    }
    res.json(await reservasRepository.listar({ estado }));
  },

  // PATCH /api/v1/reservas/:id (vendedor o admin)
  async cambiarEstado(req, res) {
    const estado = String(req.body.estado_reserva ?? '').trim().toLowerCase();
    if (!ESTADOS_RESERVA.includes(estado)) {
      return res.status(400).json({ error: 'Estado de reserva no válido' });
    }

    const actualizada = await reservasRepository.cambiarEstado(req.params.id, estado);
    if (!actualizada) return res.status(404).json({ error: 'Reserva no encontrada' });

    res.json({ mensaje: `Reserva actualizada a estado ${estado}` });
  },
};
