
const pool = require("../../../database/conexion")
const vistasupercategoria = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL
  const sqlActivo = `SELECT *
  FROM categoria
  WHERE estado_categoria = 1;
  `
// (estado=0)
const sqlInactivo = `SELECT *
FROM categoria
WHERE estado_categoria = 0;`;

  // Ejecuta ambas consultas
  try {
    const [categoria, categoriaInactivos] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlInactivo),
    ]);

    console.log("Galpon Activos:", categoria[0]);
    console.log("Galpon Inactivos:", categoriaInactivos[0]);
 

    // Envía los resultados
    res.render("vistasupervisor/almacen/categoria", {
      categoria:categoria[0],
      categoriaInactivos: categoriaInactivos[0],
      nombre: nombre,
      perfil: perfil

    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};
const regissupercategoria = async (req, res) => {
  try {
    const { nombre_categoria } = req.body;
    const estado_categoria = 1;

    pool.query(
      "INSERT INTO categoria (nombre_categoria,estado_categoria ) VALUES (?,?)",
      [nombre_categoria,estado_categoria],
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

const vistasupercategoriaid = async (req, res) => {
  // Obtén el ID del perfil de los parámetros de la URL
  const idcategoria = req.params.id;

  // Consulta SQL para obtener un perfil por su ID
  const sql = 'SELECT * FROM categoria WHERE idcategoria = ?';
  
  // Ejecuta la consulta SQL
  pool.query(sql, [idcategoria], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }
    console.log(results);
    // Comprueba si se encontró un perfil con el ID proporcionado
    if (results.length === 0) {
      res.status(404).json({ error: 'Categoria no encontrado' });
      return;
    }

    // Envía los resultados en formato JSON
    res.json(results[0]);
  });
};

const updatesupercategoriaPUT = async (req, res) => {

  const idcategoriaobtenido = req.params.id;
  const { nombre_categoria1} = req.body;

  const sql = 'UPDATE categoria SET nombre_categoria=?, estado_categoria = 1 WHERE idcategoria = ?';

  pool.query(sql, [nombre_categoria1,idcategoriaobtenido], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Categoria no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Categoria actualizado con éxito' });

  });
};


const deletesupercategoria = async (req, res) => {

  const idcategoria = req.params.id;

  const sql = 'UPDATE categoria SET estado_categoria = 0 WHERE idcategoria = ?';

  pool.query(sql, [idcategoria], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Usuario eliminado con éxito' });

 
  });
};
const actsupercategoria = async (req, res) => {

  const idcategoria = req.params.id;

  const sql = 'UPDATE categoria SET estado_categoria = 1 WHERE idcategoria = ?';

  pool.query(sql, [idcategoria], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ mensaje: 'Usuario restablecido con éxito' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado o no se realizó ninguna actualización' });
    }


  });
};


module.exports = { vistasupercategoria, regissupercategoria,vistasupercategoriaid,updatesupercategoriaPUT, deletesupercategoria, actsupercategoria };