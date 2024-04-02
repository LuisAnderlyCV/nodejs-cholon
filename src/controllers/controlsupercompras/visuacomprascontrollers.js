const pool = require("../../../database/conexion")
const vistasupervisucompra = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL (estado=1)
  const sqlActivo = `SELECT 
  compras.idcompra,
  compras.fecha_compra,
  compras.tipo_comprobante,
  compras.serie,
  compras.numero_correlativo,
  compras.subtotal,
  compras.igv,
  compras.totalcompra,
  compras.estado_compra,
  proveedor.nombre_empresa,
  usuario.nombre,
  TIME_FORMAT(compras.horacompra, '%h:%i %p') AS horacompra_12h
FROM compras
JOIN proveedor ON compras.idproveedor = proveedor.idproveedor
JOIN usuario ON compras.idusuario = usuario.idusuario
WHERE compras.estado_compra = 1
ORDER BY compras.fecha_compra DESC;

`;
//
const sqlInactivo = `SELECT 
  compras.idcompra,
  compras.fecha_compra,
  compras.tipo_comprobante,
  compras.serie,
  compras.numero_correlativo,
  compras.subtotal,
  compras.igv,
  compras.totalcompra,
  compras.estado_compra,
  proveedor.nombre_empresa,
  usuario.nombre,
  TIME_FORMAT(compras.horacompra, '%h:%i %p') AS horacompra_12h
FROM compras
JOIN proveedor ON compras.idproveedor = proveedor.idproveedor
JOIN usuario ON compras.idusuario = usuario.idusuario
WHERE compras.estado_compra = 0
ORDER BY compras.fecha_compra DESC;

`;
 // Consulta SQL 
 const sqlproductos = `SELECT 
 detalle_compras.iddetalle,
 detalle_compras.idcompra,
 productos.nombre_producto,
 categoria.nombre_categoria,
 detalle_compras.cantidad,
 detalle_compras.precio_compra,
 detalle_compras.total
FROM 
 detalle_compras
JOIN 
 productos ON detalle_compras.idproducto = productos.idproducto
JOIN 
 categoria ON productos.idcategoria = categoria.idcategoria;

`;
// Consulta SQL
const sqlProveedor = `
SELECT * FROM  proveedor

WHERE estado_proveedor = 1;
`;
// Consulta SQL
const sqlUsuario = `
SELECT * FROM  usuario

WHERE estado = 1;
`;
  // Ejecuta ambas consultas 
  try {
    const [compras, comprasinactivas,proveedor,usuario,productos] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlInactivo),
      pool.promise().query(sqlProveedor),
      pool.promise().query(sqlUsuario),
      pool.promise().query(sqlproductos),

    ]);

    console.log("Compras Activos:", compras[0]);
    console.log("Compras Inactivos:", comprasinactivas[0]);
    console.log("Proveedor:",proveedor [0]);
    console.log("Usuario:", usuario[0]);
    console.log("Tipo:", productos[0]);

    // Envía los resultados 
    res.render("vistasupervisor/compras/visuacompras", {
      compras: compras[0],
      comprasinactivas: comprasinactivas[0],
      proveedor:proveedor[0],
      usuario: usuario[0],
      productos: productos[0],
      nombre: nombre,
      perfil: perfil 
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};
//
const vistasupervisuacompraid = async (req, res) => {
  // Obtén el ID del perfil de los parámetros de la URL
  const idcompra = req.params.id;

  // Consulta SQL para obtener un perfil por su ID
  const sql = 'SELECT * FROM compras WHERE idcompra = ?';
  
  // Ejecuta la consulta SQL
  pool.query(sql, [idcompra], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }
    console.log(results);
    // Comprueba si se encontró un perfil con el ID proporcionado
    if (results.length === 0) {
      res.status(404).json({ error: 'Compra no encontrado' });
      return;
    }

    // Envía los resultados en formato JSON
    res.json(results[0]);
  });
};

const updatesupervisuacompraPUT = async (req, res) => {

  const idcompraobtenido = req.params.id;
  const { fecha_compra1, tipo_comprobante1, serie1, numero_correlativo1, subtotal1, igv1, totalcompra1, idproveedor1, idusuario1,horacompra1 } = req.body;

  const sql = 'UPDATE compras SET fecha_compra=?, tipo_comprobante=?, serie=?, numero_correlativo=?, subtotal=?, igv=?, totalcompra=?, estado_compra =1 WHERE idcompra = ?, idproveedor =?, idusuario=?,horacompra =?';

  pool.query(sql, [ fecha_compra1, tipo_comprobante1, serie1, numero_correlativo1, subtotal1, igv1, totalcompra1, idproveedor1, idusuario1,horacompra1, idcompraobtenido], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Compra no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Compra actualizado con éxito' });

  });
};


const deletesupercompra = async (req, res) => {
 
  const idcompra = req.params.id;

  const sql = 'UPDATE compras SET estado_compra = 0 WHERE idcompra = ?';

  pool.query(sql, [idcompra], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Compra no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Compra eliminado con éxito' });

 
  });
};
const actsupercompra = async (req, res) => {

  const idcompra = req.params.id;

  const sql = 'UPDATE compras SET estado_compra = 1 WHERE idcompra = ?';

  pool.query(sql, [idcompra], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ mensaje: 'Compra restablecido con éxito' });
    } else {
      res.status(404).json({ error: 'Compra no encontrado o no se realizó ninguna actualización' });
    }


  });
};

module.exports = { vistasupervisucompra,vistasupervisuacompraid,updatesupervisuacompraPUT,deletesupercompra,actsupercompra};