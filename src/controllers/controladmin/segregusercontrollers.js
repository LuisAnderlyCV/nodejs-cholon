const pool=require("../../../database/conexion");
const bcrypt=require("bcryptjs");

const vistasegreguser = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
try{
    res.render("vistaadmin/seguridad/segreguser",{ nombre: nombre,perfil: perfil });
}catch (err) {
    console.error('Error al ejecutar las consultas SQL:', err);
    res.status(500).send('Error en las consultas SQL');
  }
};
  

const segreguser = async (req, res) => {
    try {

      const { dni, nombre, correo, password, idperfil } = req.body;
      const estado = 1;
  
  
      // Encripta la contraseña
      const passwordEncryptado = await bcrypt.hash(password, 10);
  
      // Inserta el usuario y la contraseña en la base de datos
      pool.query(
        "INSERT INTO usuario (dni, nombre, correo, password, idperfil, estado) VALUES (?, ?,?,?,?,?)",
        [dni, nombre, correo, passwordEncryptado, idperfil, estado],
        (error, results) => {
          if (error) {
            console.error("Error al registrar el usuario:", error);
            res.status(500).json({ message: "Error al registrar el usuario" });
          } else {
            console.log("Usuario registrado correctamente");
            res.status(200).json({ message: "Usuario registrado correctamente" });
          }
        }
      );
    } catch (error) {
      console.error("Error en el registro de usuario:", error);
      res.status(500).json({ message: "Error en el registro de usuario" });
    }
  };

 
  module.exports = { vistasegreguser, segreguser};