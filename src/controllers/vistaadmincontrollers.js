const pool = require("../../database/conexion");
const { promisify } = require("util");
const bcrypt = require("bcryptjs");

const queryAsync = promisify(pool.query).bind(pool);

const obtenerCompras = async () => {
  const sql = `
    SELECT 
      compras.idcompra,
      DATE_FORMAT(compras.fecha_compra, '%Y-%m-%d') AS fecha_compra,
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

  try {
    const resultados = await queryAsync(sql);
    return resultados;
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL:", error);
    throw new Error("Error en la consulta SQL");
  }
};
const obtenerVentas = async () => {
  const sql = `
  SELECT
  venta.idventa,
  DATE_FORMAT(venta.fechaventa, '%Y-%m-%d') AS fechaventa,
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
  `;

  try {
    const resultados = await queryAsync(sql);
    return resultados;
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL:", error);
    throw new Error("Error en la consulta SQL");
  }
};
const obtenergalpon = async()=>{
  const sql = `SELECT * FROM (
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
  WHERE rn = 1
;
  `;
  try {
    const resultados = await queryAsync(sql);
    return resultados;
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL:", error);
    throw new Error("Error en la consulta SQL");
  }

};
const obtenerDetallesCompra = async () => {
  const sql = `
  SELECT 
  productos.idproducto,
  productos.codigo_producto,
  productos.nombre_producto,
  categoria.nombre_categoria,
  productos.idunidad,
  productos.descripcion,
  productos.stock,
  productos.estado_producto
FROM 
  productos
JOIN 
  unidad ON productos.idunidad = unidad.idunidad
JOIN 
  categoria ON productos.idcategoria = categoria.idcategoria
WHERE 
  productos.estado_producto = 1;


  `;

  try {
    const resultados = await queryAsync(sql);
    return resultados;
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL:", error);
    throw new Error("Error en la consulta SQL");
  }
};

const vistaadmin = async (req, res) => {
  const idusuario = req.session.user.idusuario;
  const idperfil = req.session.user.idperfil;
  const nombre = req.session.user.nombreusuario;
  let perfil = "";

  switch (idperfil) {
    case 1:
      perfil = "ADMINISTRADOR";
      break;
    case 2:
      perfil = "CAJERO";
      break;
    case 3:
      perfil = "SUPERVISOR";
      break;
    default:
      perfil = "GERENTE";
  }

  try {
    const compras = await obtenerCompras();
    const ventas = await obtenerVentas();
    const productos = await obtenerDetallesCompra();
const galpon = await obtenergalpon();
    res.render("vistaadmin/vistaadmin", {
      idusuario,
      idperfil,
      nombre,
      perfil,
      compras,
      ventas,
      productos,
      galpon,
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

module.exports = { vistaadmin };
