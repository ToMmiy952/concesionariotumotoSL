export const permitirRoles = (...rolesPermitidos) => {
  return (req, res, next) => {
    // req.usuario es cargado previamente por verificarToken
    if (!req.usuario) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    if (!rolesPermitidos.includes(req.usuario.rol)) {
      return res.status(403).json({ 
        error: 'Acceso denegado. No posee los permisos necesarios para esta acción' 
      });
    }

    next(); // El rol está autorizado
  };
};