const pool = require("../../../database/conexion");
const vistaproveedores = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL 
  // (estado_piso=1)
  const sqlActivo = `
  SELECT
  proveedor.idproveedor,
  proveedor.nombre_empresa,
  proveedor.ruc,
  proveedor.direccion,
  proveedor.ciudad,
  proveedor.pais,
  proveedor.telefono,
  proveedor.email,
  categoria.nombre_categoria
FROM proveedor
JOIN categoria ON proveedor.idcategoria = categoria.idcategoria
WHERE proveedor.estado_proveedor = 1;
  `;

  // Consulta SQL 
  // (estado_piso=0)
  const sqlInactivo = `SELECT
  proveedor.idproveedor,
  proveedor.nombre_empresa,
  proveedor.ruc,
  proveedor.direccion,
  proveedor.ciudad,
  proveedor.pais,
  proveedor.telefono,
  proveedor.email,
  categoria.nombre_categoria
FROM proveedor
JOIN categoria ON proveedor.idcategoria = categoria.idcategoria
WHERE proveedor.estado_proveedor = 0;
  `;

  // tipos de habitacion
  const sqlcategoria = `SELECT *
    FROM categoria
    WHERE estado_categoria = 1;
  `;


  // Ejecuta ambas consultas
  try {
    const [proveedores, proveedoresInactivos, categoria] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlInactivo),
      pool.promise().query(sqlcategoria),
    ]);

    console.log("Habitacion Activos:", proveedores[0]);
    console.log("Habitacion Inactivos:", proveedoresInactivos[0]);
    console.log("tipo:", categoria[0]);

    // Envía los resultados 
    res.render("vistaadmin/compras/proveedores", {
      proveedores: proveedores[0],
      proveedoresInactivos: proveedoresInactivos[0],
      categoria: categoria[0],
      nombre: nombre,
      perfil: perfil 
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

const regisproveedor = async (req, res) => {
  try {
    const { ruc, nombre_empresa, direccion, ciudad, pais, telefono, email, nombre_categoria } =
      req.body;
    const estado_proveedor = 1;

    // Inserta el usuario y la contraseña en la base de datos
    pool.query(
      "INSERT INTO proveedor (nombre_empresa, ruc, direccion, ciudad, pais, telefono, email, estado_proveedor,idcategoria ) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        nombre_empresa,
        ruc,
        direccion,
        ciudad,
        pais,
        telefono,
        email,
        estado_proveedor,
        nombre_categoria
      ],
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

const vistaproveedorid = async (req, res) => {
  // Obtén el ID
  const idproveedor = req.params.id;

  // Consulta
  const sql = "SELECT * FROM proveedor WHERE idproveedor = ?";

  // Ejecuta 
  pool.query(sql, [idproveedor], (err, results) => {
    if (err) {
      console.error("Error al ejecutar la consulta SQL:", err);
      res.status(500).json({ error: "Error en la consulta SQL" });
      return;
    }
    console.log(results);
    // Comprueba si se encontró un perfil con el ID proporcionado
    if (results.length === 0) {
      res.status(404).json({ error: "Proveedor no encontrado" });
      return;
    }

    // Envía los resultados 
    res.json(results[0]);
  });
};

const updateproveedoresPUT = async (req, res) => {
  
  const idproveedorobtenido = req.params.id;
  const { nombre_empresa1, direccion1, ciudad1, pais1, telefono1, email1, nombre_categoria1 } =
    req.body;

  
  const sql =
    "UPDATE proveedor SET nombre_empresa=?, direccion = ?, ciudad=?, pais=?, telefono=?, email=?, estado_proveedor = 1, idcategoria=? WHERE idproveedor = ?";

 
  pool.query(
    sql,
    [
      nombre_empresa1,
      direccion1,
      ciudad1,
      pais1,
      telefono1,
      email1,
      nombre_categoria1,
      idproveedorobtenido,
    ],
    (err, results) => {
      if (err) {
        console.error("Error al ejecutar la consulta SQL:", err);
        res.status(500).json({ error: "Error en la consulta SQL" });
        return;
      }

      
      if (results.length === 0) {
        res.status(404).json({ error: "Proveedor no encontrado" });
        return;
      }

      res.status(200).json({ mensaje: "Proveedor actualizado con éxito" });
    }
  );
};

const deleteproveedores = async (req, res) => {

  const idproveedor = req.params.id;
  const sql = "UPDATE proveedor SET estado_proveedor = 0 WHERE idproveedor = ?";

  pool.query(sql, [idproveedor], (err, results) => {
    if (err) {
      console.error("Error al ejecutar la consulta SQL:", err);
      res.status(500).json({ error: "Error en la consulta SQL" });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: "Usuario no encontrado" });
      return;
    }

    res.status(200).json({ mensaje: "Usuario eliminado con éxito" });
  });
};

const actproveedor = async (req, res) => {

  const idproveedor = req.params.id;

  const sql = 'UPDATE proveedor SET estado_proveedor = 1 WHERE idproveedor = ?';

  pool.query(sql, [idproveedor], (err, results) => {
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

module.exports = {
  vistaproveedores,
  regisproveedor,
  vistaproveedorid,
  updateproveedoresPUT,
  deleteproveedores,
  actproveedor
};
