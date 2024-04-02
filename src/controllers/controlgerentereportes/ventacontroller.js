const pool=require("../../../database/conexion");
const bcrypt=require("bcryptjs");
const vistagerereporventas = async (req, res) => {
const nombre = req.session.user.nombreusuario;
const perfil = req.session.user.nombreperfil;
   // Consulta SQL para obtener perfiles
   const sql = 'SELECT *, TIME_FORMAT(venta.horaventa, "%h:%i %p") AS horaventa_12h FROM venta';


   // Ejecuta la consulta SQL
   pool.query(sql, (err, results) => {
     if (err) {
       console.error('Error al ejecutar la consulta SQL:', err);
       res.status(500).send('Error en la consulta SQL');
       return;
     }
     // Envía los resultados de la consulta a la vista
     res.render('vistagerente/reportes/reporventas', { reporventas: results ,  nombre: nombre,
      perfil: perfil});
   });
   };

  module.exports = { vistagerereporventas};