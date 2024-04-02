const pool = require("../../../database/conexion");

const vistaregisventas = async (req, res) => {
  const idusuario = req.session.user.idusuario;
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL
  // (estado_piso=1)
  const sqlActivo = `
  SELECT
  cliente.idcliente,
  cliente.rucydni,
  cliente.nombre,
  cliente.telefono,
  cliente.direccion
FROM cliente
WHERE cliente.estadocliente = 1;

`;
  const sqlprecio = `
  SELECT
  dc.iddetalle,
  dc.idcompra,
  dc.idproducto,
  dc.cantidad,
  dc.precio_compra,
  dc.total
FROM detalle_compras dc
JOIN (
  SELECT
    idproducto,
    MAX(idcompra) AS ultima_compra
  FROM detalle_compras
  GROUP BY idproducto
) ultima_compra_producto
ON dc.idproducto = ultima_compra_producto.idproducto
AND dc.idcompra = ultima_compra_producto.ultima_compra;
`;
  // Consulta SQL
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
WHERE rn = 1 AND cantidadpollo > 0;
`
    ;

  const sqlfechainicio = `
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
  controlgalpon.filtro
FROM controlgalpon
JOIN galpon ON controlgalpon.idgalpon = galpon.idgalpon
JOIN productos ON controlgalpon.idproducto = productos.idproducto
WHERE controlgalpon.estadocontrolgalpon = 1
AND controlgalpon.idcontrolgalpon = controlgalpon.filtro
AND controlgalpon.fechallegada = (
  SELECT MIN(fechallegada)
  FROM controlgalpon AS c
  WHERE c.idcontrolgalpon = controlgalpon.filtro
);

`;

  const sqlcodigoventaruc = `
  SELECT numerocorrelativo
FROM venta
WHERE tipocomprobante = 'ruc'and estadoventa = 1;

`;

  const sqlcodigoventaboleta = `
  SELECT numerocorrelativo
FROM venta
WHERE tipocomprobante = 'boleta'and estadoventa = 1;

`;



  // Ejecuta ambas consultas
  try {
    const [cliente, precio, productos, fechainicio, codigoventaruc, codigoventaboleta] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlprecio),
      pool.promise().query(sqlproductos),
      pool.promise().query(sqlfechainicio),
      pool.promise().query(sqlcodigoventaruc),
      pool.promise().query(sqlcodigoventaboleta),
    ]);

    console.log("CLIENTES Activos:", cliente[0]);
    console.log("PRODUCTOS:", productos[0]);
    console.log("PRECIO:", precio[0]);
    console.log("idusuariologueado:", idusuario);
    console.log("FECHA INICIO:", fechainicio[0]);
    console.log("CODIGOS VENTA DE RUC:", codigoventaruc[0]);
    console.log("CODIGOS VENTA DE BOLETA:", codigoventaboleta[0]);

    // Envía los resultados
    res.render("vistaadmin/ventas/ventas", {
      cliente: cliente[0],
      preciosData: JSON.stringify(precio[0]),
      fechainicio: JSON.stringify(fechainicio[0]),
      codigoventaruc: JSON.stringify(codigoventaruc[0]),
      codigoventaboleta: JSON.stringify(codigoventaboleta[0]),
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



const restarcantidades = async (req, res) => {
  try {
    const { productos } = req.body;
    const estado = 1;
    const mortalidad = 0;
    const descripcion = "SE HIZO UNA VENTA";

    // Verifica si productos es un objeto y no un array
    if (!Array.isArray(productos)) {
      throw new Error("Productos no es un array iterable");
    }

    // Inserta los productos
    const insertDetalleCompraQuery = `
    INSERT INTO controlgalpon (idgalpon,cantidadpollo ,fechallegada, estadocontrolgalpon, idproducto, mortalidadpollos,descripcion, filtro  ) VALUES (?,?,?,?,?,?,?,?)
    `;

    // Recorre la lista de productos y realiza la inserción en la base de datos
    for (const producto of productos) {
      await pool
        .promise()
        .execute(insertDetalleCompraQuery, [
          producto.idgalpon,
          producto.cantidadgalpon,
          producto.fechasalida,
          estado,
          producto.idproducto,
          mortalidad,
          descripcion,
          producto.filtro,
        ]);
    }

    // Envía una respuesta exitosa
    res.json({ success: true });
  } catch (error) {
    console.error("Error al insertar los productos:", error);
    res.status(500).json({ error: "Error al insertar los productos" });
  }
};

const regventas = async (req, res) => {
  const {
    fecha,
    idtipodoc,
    documento,
    serie,
    correlativo,
    subtotal,
    igv,
    total,
    montocancelado,
    vuelto,
    idusuario,
    idcliente,
    hora,
    metodopago,
    montoinicial,
    debe
  } = req.body;

  const insertCompraQuery = `
      INSERT INTO venta (fechaventa, tipocomprobante, documento, serie, numerocorrelativo, subtotal, igv, totalventa, montocancelado, vuelto, idusuario, idcliente, estadoventa, horaventa, metodopago, montoinicial, debe)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?);
  `;

  try {
    const [result] = await pool
      .promise()
      .execute(insertCompraQuery, [
        fecha,
        idtipodoc,
        documento,
        serie,
        correlativo,
        subtotal,
        igv,
        total,
        montocancelado,
        vuelto,
        idusuario,
        idcliente,
        hora,
        metodopago,
        montoinicial,
        debe
      ]);
    const idventa = result.insertId;

    res.json({ idventa: idventa });
    console.log("Query:", insertCompraQuery);
  } catch (error) {
    console.error("Error al insertar la compra:", error);
    res.status(500).json({ error: "Error al insertar la compra" });
  }
};

const regventas2 = async (req, res) => {
  const { productos } = req.body;

  console.log(productos);

  const insertDetalleCompraQuery = `
      INSERT INTO detalleventa (idventa, cantidadvendida, precio, total, idcontrolgalpon)
      VALUES (?, ?, ?, ?, ?);
  `;

  try {
    // Recorre la lista de productos y realiza la inserción en la base de datos
    for (const producto of productos) {
      await pool
        .promise()
        .execute(insertDetalleCompraQuery, [
          producto.idventa,
          producto.cantidad,
          producto.precio,
          producto.subtotal,
          producto.idcontrolgalpon
        ]);
    }

    // Envía una respuesta exitosa
    res.json({ success: true });
    console.log("Query:", insertDetalleCompraQuery);
  } catch (error) {
    console.error("Error al insertar los productos:", error);
    res.status(500).json({ error: "Error al insertar los productos" });
  }
};

module.exports = {
  vistaregisventas,
  restarcantidades,
  regventas,
  regventas2,
};
