const pool = require("../../../database/conexion");
//caja
const vistacajaregisventas = async (req, res) => {
  const idusuario = req.session.user.idusuario;
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL (estado=1)
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
  // Consulta 
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

  // Ejecuta ambas consultas
  try {
    const [cliente, precio, productos, fechainicio] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlprecio),
      pool.promise().query(sqlproductos),
      pool.promise().query(sqlfechainicio),
    ]);

    console.log("CLIENTES Activos:", cliente[0]);
    console.log("PRODUCTOS:", productos[0]);
    console.log("PRECIO:", precio[0]);
    console.log("idusuariologueado:", idusuario);
    console.log("FECHA INICIO:", fechainicio[0]);

    // Envía los resultados
    res.render("vistacajero/ventas/ventas", {
      cliente: cliente[0],
      preciosData: JSON.stringify(precio[0]),
      fechainicio: JSON.stringify(fechainicio[0]),
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



const restarcajacantidades = async (req, res) => {
  try {
    const { productos } = req.body;
    const estado = 1;
    const mortalidad = 0;
    const descripcion = "SE HIZO UNA VENTA";

    // Verifica si productos 
    if (!Array.isArray(productos)) {
      throw new Error("Productos no es un array iterable");
    }

    // Inserta los productos 
    const insertDetalleCompraQuery = `
    INSERT INTO controlgalpon (idgalpon,cantidadpollo ,fechallegada, estadocontrolgalpon, idproducto, mortalidadpollos,descripcion, filtro  ) VALUES (?,?,?,?,?,?,?,?)
    `;

    // Recorre la lista de productos
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

const regcajaventas = async (req, res) => {
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

const regcajaventas2 = async (req, res) => {
  const { productos } = req.body;

  console.log(productos);

  const insertDetalleCompraQuery = `
      INSERT INTO detalleventa (idventa, cantidadvendida, precio, total, idcontrolgalpon)
      VALUES (?, ?, ?, ?, ?);
  `;

  try {

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
  vistacajaregisventas,
  restarcajacantidades,
  regcajaventas,
  regcajaventas2,
};
