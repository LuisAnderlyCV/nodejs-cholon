const pool = require("../../../database/conexion")
const vistaclientes = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL
  // (estado =1)
  const sqlActivo = `
  SELECT 
  cliente.idcliente,
  cliente.rucydni,
  cliente.nombre,
  cliente.telefono,
  cliente.direccion
  FROM cliente
  WHERE estadocliente = 1;`;

  // (estado =0)
  const sqlInactivo = `SELECT 
  cliente.idcliente,
  cliente.rucydni,
  cliente.nombre,
  cliente.telefono,
  cliente.direccion
  FROM cliente
  WHERE estadocliente = 0;`;

  
  // Ejecuta ambas consultas
  try {
    const [clientes, clientesInactivos] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlInactivo),
    ]);

    console.log("Habitacion Activos:", clientes[0]);
    console.log("Habitacion Inactivos:", clientesInactivos[0]);
 

    // Envía los resultados
    res.render("vistaadmin/ventas/clientes", {
      clientes: clientes[0],
      clientesInactivos: clientesInactivos[0],
      nombre: nombre,
      perfil: perfil  
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

const regisclientes = async (req, res) => {
  try {
    const { rucydni, nombre, razonsocial, telefono,direccion } = req.body;
    const estadocliente = 1;

    pool.query(
      "INSERT INTO cliente (rucydni, nombre,telefono,direccion,estadocliente ) VALUES (?,?,?,?,?)",
      [rucydni, nombre, telefono,direccion,estadocliente],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el Cliente:", error);
          res.status(500).json({ message: "Error al registrar el Cliente" });
        } else {
          console.log("Cliente registrado correctamente");
          res.status(200).json({ message: "Cliente registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro de Cliente:", error);
    res.status(500).json({ message: "Error en el registro de Cliente" });
  }
};

const vistaclientesid = async (req, res) => {
  // Obtén el ID
  const idcliente = req.params.id;

  const sql = 'SELECT * FROM cliente WHERE idcliente = ?';

  pool.query(sql, [idcliente], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }
    console.log(results);

    if (results.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    // Envía los resultados 
    res.json(results[0]);
  });
};

const updateclientesPUT = async (req, res) => {

  const idclienteobtenido = req.params.id;
  const { rucydni1,nombre1,razonsocial1,telefono1,direccion1 } = req.body;

  const sql = 'UPDATE cliente SET rucydni=?, nombre=?, telefono=?, direccion=?, estadocliente = 1 WHERE idcliente = ?';

  pool.query(sql, [ rucydni1, nombre1,telefono1,direccion1,idclienteobtenido], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Cliente actualizado con éxito' });

  });
};


const deleteclientes = async (req, res) => {
  const idcliente = req.params.id;

  const sql = 'UPDATE cliente SET estadocliente = 0 WHERE idcliente = ?';

  pool.query(sql, [idcliente], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Cliente no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Cliente eliminado con éxito' });

 
  });
};
const actclientes = async (req, res) => {

  const idcliente = req.params.id;

  const sql = 'UPDATE cliente SET estadocliente = 1 WHERE idcliente = ?';

  pool.query(sql, [idcliente], (err, results) => {
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

module.exports = { vistaclientes, regisclientes,vistaclientesid,updateclientesPUT, deleteclientes, actclientes };