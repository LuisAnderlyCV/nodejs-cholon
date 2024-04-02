const pool = require("../../../database/conexion");

const vistavisuaventas = async (req, res) => {
  const idusuario = req.session.user.idusuario;
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL 
  // (estado =1)
  const sqlActivo = `
  SELECT
  venta.idventa,
  venta.fechaventa,
  venta.tipocomprobante,
  venta.documento,
  venta.serie,
  venta.numerocorrelativo,
  venta.subtotal,
  venta.igv,
  venta.totalventa,
  venta.montocancelado,
  venta.vuelto,
  usuario.nombre AS nombre_usuario,
  cliente.nombre AS nombre_cliente,
  venta.estadoventa,
  TIME_FORMAT(venta.horaventa, '%h:%i %p') AS horaventa_12h,
  venta.metodopago,
  venta.montoinicial,
  venta.debe
FROM venta
JOIN cliente ON venta.idcliente = cliente.idcliente
JOIN usuario ON venta.idusuario = usuario.idusuario
WHERE venta.estadoventa = 1
  AND venta.metodopago = 'CREDITO'
ORDER BY venta.idventa DESC;


`;
  const sqlActivo1 = `
SELECT
venta.idventa,
venta.fechaventa,
venta.tipocomprobante,
venta.documento,
venta.serie,
venta.numerocorrelativo,
venta.subtotal,
venta.igv,
venta.totalventa,
venta.montocancelado,
venta.vuelto,
usuario.nombre,
cliente.nombre,
venta.estadoventa,
TIME_FORMAT(venta.horaventa, '%h:%i %p') AS horaventa_12h,
venta.metodopago,
venta.montoinicial,
venta.debe
FROM venta
JOIN cliente ON venta.idcliente = cliente.idcliente
JOIN usuario ON venta.idusuario = usuario.idusuario
WHERE venta.estadoventa = 1
AND venta.metodopago = 'CONTADO'
ORDER BY venta.idventa DESC;


`;
  const sqlInactivo = `
SELECT
venta.idventa,
venta.fechaventa,
venta.tipocomprobante,
venta.documento,
venta.serie,
venta.numerocorrelativo,
venta.subtotal,
venta.igv,
venta.totalventa,
venta.montocancelado,
venta.vuelto,
usuario.nombre,
cliente.nombre,
venta.estadoventa,
TIME_FORMAT(venta.horaventa, '%h:%i %p') AS horaventa_12h,
venta.metodopago,
venta.montoinicial,
venta.debe
FROM venta
JOIN cliente ON venta.idcliente = cliente.idcliente
JOIN usuario ON venta.idusuario = usuario.idusuario
WHERE venta.estadoventa = 0
`;

  const sqlprecio = `
SELECT
  detalle_compras.iddetalle,
  detalle_compras.idcompra,
  detalle_compras.idproducto,
  detalle_compras.cantidad,
  detalle_compras.precio_compra,
  detalle_compras.total
FROM detalle_compras
`;

  const sqlproductos = ` SELECT * FROM (
    SELECT 
      controlgalpon.idcontrolgalpon,
      galpon.nombregalpon,
      controlgalpon.cantidadpollo,
      DATE_FORMAT(controlgalpon.fechallegada, '%Y-%m-%d') AS fechallegada,
      productos.nombre_producto,
      controlgalpon.mortalidadpollos,
      controlgalpon.descripcion,
      controlgalpon.estadocontrolgalpon,
      controlgalpon.idgalpon,
      controlgalpon.idproducto,
      controlgalpon.filtro,
      ROW_NUMBER() OVER (PARTITION BY controlgalpon.idgalpon ORDER BY controlgalpon.idcontrolgalpon DESC) AS rn
    FROM controlgalpon
    JOIN galpon ON controlgalpon.idgalpon = galpon.idgalpon
    JOIN productos ON controlgalpon.idproducto = productos.idproducto
    WHERE controlgalpon.estadocontrolgalpon = 1
  ) AS t
  WHERE rn = 1;
`
    ;

  const sqlfechainicio = `
SELECT * FROM (
  SELECT 
    controlgalpon.idcontrolgalpon,
    galpon.nombregalpon,
    controlgalpon.cantidadpollo,
    DATE_FORMAT(controlgalpon.fechallegada, '%Y-%m-%d') AS fechallegada,
    productos.nombre_producto,
    controlgalpon.mortalidadpollos,
    controlgalpon.descripcion,
    controlgalpon.estadocontrolgalpon,
    controlgalpon.idgalpon,
    controlgalpon.idproducto,
    controlgalpon.filtro,
    ROW_NUMBER() OVER (PARTITION BY controlgalpon.idgalpon ORDER BY controlgalpon.fechallegada ASC) AS rn
  FROM controlgalpon
  JOIN galpon ON controlgalpon.idgalpon = galpon.idgalpon
  JOIN productos ON controlgalpon.idproducto = productos.idproducto
  WHERE controlgalpon.estadocontrolgalpon = 1
) AS t
WHERE rn = 1;

`;
  const sqlCliente = `
SELECT * FROM  cliente

WHERE estadocliente = 1;
`;
  // Ejecuta ambas consultas 
  try {
    const [venta, contado, ventaInactivo, precio, productos, fechainicio, cliente] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlActivo1),
      pool.promise().query(sqlInactivo),
      pool.promise().query(sqlprecio),
      pool.promise().query(sqlproductos),
      pool.promise().query(sqlfechainicio),
      pool.promise().query(sqlCliente),

    ]);

    console.log("CLIENTES Activos:", venta[0]);
    console.log("PRODUCTOS:", contado[0]);
    console.log("CLIENTES Activos:", ventaInactivo[0]);
    console.log("PRODUCTOS:", productos[0]);
    console.log("PRECIO:", precio[0]);
    console.log("idusuariologueado:", idusuario);
    console.log("FECHA INICIO:", fechainicio[0]);
    console.log("FECHA INICIO:", cliente[0]);

    // Envía los resultados
    res.render("vistaadmin/ventas/visuaventas", {
      venta: venta[0],
      contado: contado[0],
      ventaInactivo: ventaInactivo[0],
      preciosData: JSON.stringify(precio[0]),
      fechainicio: JSON.stringify(fechainicio[0]),
      cliente: cliente[0],
      productos: productos[0],
      idusuario: idusuario,
      nombre: nombre,
      perfil: perfil,

    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

//
const vistavisuaventaid = async (req, res) => {
  // Obtén el ID 
  const idventa = req.params.id;

  const sql = 'SELECT * FROM venta WHERE idventa = ?';

  pool.query(sql, [idventa], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }
    console.log(results);
    // Comprueba 
    if (results.length === 0) {
      res.status(404).json({ error: 'Compra no encontrado' });
      return;
    }

    // Envía los resultados
    res.json(results[0]);
  });
};

const updatevisuaventacontadoPUT = async (req, res) => {

  const idventaobtenido = req.params.id;
  const { fechaventa2, tipocomprobante2, documento2, totalventa2, idcliente2, montocancelado2, vuelto2, horaventa2 } = req.body;
  console.log(idcliente2,montocancelado2);

  const sql = 'UPDATE venta SET fechaventa=?, tipocomprobante=?,documento=?, totalventa=?,montocancelado=?,vuelto=?,idcliente=?,horaventa=? WHERE idventa= ?';

  pool.query(sql, [fechaventa2, tipocomprobante2, documento2, totalventa2, montocancelado2, vuelto2, idcliente2, horaventa2, idventaobtenido], (err, results) => {
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
//
const updatevisuaventacreditoPUT = async (req, res) => {

  const idventaobtenido = req.params.id;
  const { fechaventa2, tipocomprobante2, documento2, totalventa2, idcliente2, montoinicial2, debe2, horaventa2 } = req.body;
  console.log(fechaventa2, tipocomprobante2, documento2, totalventa2, idcliente2, montoinicial2, debe2, horaventa2);

  const sql = 'UPDATE venta SET fechaventa=?, tipocomprobante=?,documento=?, totalventa=?,montoinicial=?,debe=?,idcliente=?,horaventa=? WHERE idventa= ?';

  pool.query(sql, [fechaventa2, tipocomprobante2, documento2, totalventa2, montoinicial2, debe2, idcliente2, horaventa2, idventaobtenido], (err, results) => {
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
const updatevisuaventapagoPUT = async (req, res) => {

  const idventaobtenido = req.params.id;
  const { fechaventa3, totalventa3, idcliente3, montoinicial3, debe3, horaventa3 } = req.body;
  console.log(fechaventa3, totalventa3, idcliente3, montoinicial3, debe3, horaventa3,idventaobtenido);

  const sql = 'UPDATE venta SET fechaventa=?, totalventa=?,montoinicial=?,debe=?,idcliente=?,horaventa=? WHERE idventa= ?';

  pool.query(sql, [fechaventa3, totalventa3, montoinicial3, debe3, idcliente3, horaventa3, idventaobtenido], (err, results) => {
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
const deleteventa = async (req, res) => {
  try {
    const idventa = req.params.id;

    // Obtener datos de venta
    const selectSql = 'SELECT idcontrolgalpon, cantidadvendida FROM detalleventa WHERE idventa = ?';
    pool.query(selectSql, [idventa], (selectError, selectResults) => {
      if (selectError) {
        console.error('Error al obtener datos de detalleventa:', selectError);
        res.status(500).json({ error: 'Error al obtener datos de detalleventa' });
        return;
      }

      if (selectResults.length === 0) {
        res.status(404).json({ error: 'Venta no encontrada en detalleventa' });
        return;
      }

      const { idcontrolgalpon, cantidadvendida } = selectResults[0];

      // Actualizar estadoventa a 0 en venta
      const updateSql = 'UPDATE venta SET estadoventa = 0 WHERE idventa = ?';
      pool.query(updateSql, [idventa], (updateError, updateResults) => {
        if (updateError) {
          console.error('Error al actualizar estadoventa en venta:', updateError);
          res.status(500).json({ error: 'Error al actualizar estadoventa en venta' });
          return;
        }

        if (updateResults.affectedRows === 0) {
          res.status(404).json({ error: 'Venta no encontrada en venta' });
          return;
        }

        // Actualizar cantidadpollo en controlgalpon sumando la cantidadvendida
        const updateControlGalponSql = 'UPDATE controlgalpon SET cantidadpollo = cantidadpollo + ? WHERE idcontrolgalpon = ?';
        pool.query(updateControlGalponSql, [cantidadvendida, idcontrolgalpon], (updateCGError, updateCGResults) => {
          if (updateCGError) {
            console.error('Error al actualizar cantidadpollo en controlgalpon:', updateCGError);
            res.status(500).json({ error: 'Error al actualizar cantidadpollo en controlgalpon' });
            return;
          }

          if (updateCGResults.affectedRows === 0) {
            res.status(404).json({ error: 'Controlgalpon no encontrado en controlgalpon' });
            return;
          }

          res.status(200).json({ mensaje: 'Venta eliminada con éxito y cantidadpollo actualizada' });
        });
      });
    });
  } catch (error) {
    console.error('Error en la operación de eliminación de venta:', error);
    res.status(500).json({ error: 'Error en la operación de eliminación de venta' });
  }
};

const actventa = async (req, res) => {

  const idventa = req.params.id;

  const sql = 'UPDATE venta SET estadoventa = 1 WHERE idventa = ?';

  pool.query(sql, [idventa], (err, results) => {
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
const cantidadpollos = async (req, res) => {
  try {
    const { idcontrolgalpon, cantidadvendida } = req.body;
    const estado = 1;

    // Obtener datos de controlgalpon
    pool.query(
      "SELECT idgalpon, cantidadpollo FROM controlgalpon WHERE idcontrolgalpon = ?",
      [idcontrolgalpon],
      (error, results) => {
        if (error) {
          console.error("Error al obtener datos de controlgalpon:", error);
          res.status(500).json({ message: "Error al obtener datos de controlgalpon" });
        } else {
          if (results.length > 0) {
            const { idgalpon, cantidadpollo } = results[0];

            // Insertar en detalleventa con los datos obtenidos
            pool.query(
              "INSERT INTO detalleventa (idcontrolgalpon, idgalpon, cantidadpollo, cantidadvenida) VALUES (?, ?, ?, ?)",
              [idcontrolgalpon, idgalpon, cantidadpollo, cantidadvendida],
              (error, results) => {
                if (error) {
                  console.error("Error al registrar el detalle de venta:", error);
                  res.status(500).json({ message: "Error al registrar el detalle de venta" });
                } else {
                  console.log("Detalle de venta registrado correctamente");
                  res.status(200).json({ message: "Detalle de venta registrado correctamente" });
                }
              }
            );
          } else {
            console.error("No se encontraron datos en controlgalpon con el id proporcionado");
            res.status(404).json({ message: "No se encontraron datos en controlgalpon con el id proporcionado" });
          }
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ message: "Error en el registro de usuario" });
  }
};


module.exports = {
  vistavisuaventas,
  vistavisuaventaid,
  updatevisuaventacontadoPUT,
  updatevisuaventacreditoPUT,
  updatevisuaventapagoPUT,
   deleteventa, actventa, cantidadpollos
};
