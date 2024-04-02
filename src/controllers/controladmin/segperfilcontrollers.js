const pool=require("../../../database/conexion");
const bcrypt=require("bcryptjs");
const vistasegperfil = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
const perfil = req.session.user.nombreperfil;
   // Consulta SQL para obtener perfiles
   const sql = 'SELECT * FROM perfil';

   // Ejecuta la consulta SQL
   pool.query(sql, (err, results) => {
     if (err) {
       console.error('Error al ejecutar la consulta SQL:', err);
       res.status(500).send('Error en la consulta SQL');
       return;
     }
     console.log(results);
     console.log("idusuariologueado:", nombre);
     console.log("idusuariologueado",perfil);
 
     // Envía los resultados de la consulta a la vista
     res.render('vistaadmin/seguridad/segperfil', { segperfil: results ,  nombre: nombre,
      perfil: perfil});
   });
   };

  module.exports = { vistasegperfil};