const pool=require("../../../database/conexion");
const bcrypt=require("bcryptjs");
const vistareporusuarios = async (req, res) => {
const nombre = req.session.user.nombreusuario;
const perfil = req.session.user.nombreperfil;
   // Consulta SQL para obtener perfiles
   const sql = 'SELECT usuario.dni, usuario.nombre, usuario.correo, perfil.perfil, usuario.estado FROM usuario JOIN perfil ON usuario.idperfil = perfil.idperfil';



   // Ejecuta la consulta SQL
   pool.query(sql, (err, results) => {
     if (err) {
       console.error('Error al ejecutar la consulta SQL:', err);
       res.status(500).send('Error en la consulta SQL');
       return;
     }
     // Envía los resultados de la consulta a la vista
     res.render('vistaadmin/reportes/reporusuarios', { reporusuarios: results ,  nombre: nombre,
      perfil: perfil});
   });
   };

  module.exports = { vistareporusuarios};