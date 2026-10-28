import { ventasRepository } from '../repositories/ventas.repository.js';
import { enteroPositivo, fechaValida } from '../utils/validaciones.js';

export const ventasController = {
  // POST /api/v1/ventas/online (cliente: paga su carrito)
  async crearOnline(req, res) {
    const { resultado, idVenta, producto } = await ventasRepository.crearVentaOnline(req.usuario.id_usuario);

    if (resultado === 'carrito_vacio') {
      return res.status(400).json({ error: 'El carrito está vacío' });
    }
    if (resultado === 'sin_stock') {
      return res.status(400).json({ error: `No hay stock suficiente de "${producto}"` });
    }
    res.status(201).json(await ventasRepository.buscarConDetalle(idVenta));
  },

  // POST /api/v1/ventas/motos (vendedor: venta presencial de una moto, opcionalmente desde una reserva)
  async crearMoto(req, res) {
    const { idMoto, idReserva } = req.body;

    if (!enteroPositivo(idMoto) || (idReserva != null && !enteroPositivo(idReserva))) {
      return res.status(400).json({ error: 'idMoto (y idReserva, si se envía) deben ser enteros positivos' });
    }

    const { resultado, idVenta } = await ventasRepository.crearVentaMoto({
      idVendedor: req.usuario.id_usuario,
      idMoto: Number(idMoto),
      idReserva: idReserva == null ? null : Number(idReserva),
    });

    const errores = {
      moto_inexistente: [404, 'La moto no existe o está inactiva'],
      reserva_inexistente: [404, 'La reserva no existe'],
      sin_stock: [400, 'La moto no tiene stock disponible'],
      reserva_ajena: [400, 'La reserva corresponde a otra moto'],
      reserva_no_vigente: [400, 'La reserva no está vigente'],
    };
    if (errores[resultado]) {
      const [estado, error] = errores[resultado];
      return res.status(estado).json({ error });
    }

    res.status(201).json(await ventasRepository.buscarConDetalle(idVenta));
  },

  // GET /api/v1/ventas (cliente: las suyas, vendedor: las suyas, admin: todas; filtro ?desde= ?hasta=)
  async listar(req, res) {
    const { desde, hasta } = req.query;
    if ((desde && !fechaValida(desde)) || (hasta && !fechaValida(hasta))) {
      return res.status(400).json({ error: 'Las fechas deben tener formato YYYY-MM-DD' });
    }

    res.json(await ventasRepository.listar({
      rol: req.usuario.rol,
      idUsuario: req.usuario.id_usuario,
      desde,
      hasta,
    }));
  },

  // GET /api/v1/ventas/:id
  async obtenerPorId(req, res) {
    const venta = await ventasRepository.buscarConDetalle(req.params.id);
    if (!venta) return res.status(404).json({ error: 'Venta no encontrada' });

    const { rol, id_usuario } = req.usuario;
    const esSuya = venta.id_cliente === id_usuario || venta.id_vendedor === id_usuario;
    if (rol !== 'ADMINISTRADOR' && !esSuya) {
      return res.status(403).json({ error: 'Acceso denegado. No posee los permisos necesarios para esta acción' });
    }
    res.json(venta);
  },
};
