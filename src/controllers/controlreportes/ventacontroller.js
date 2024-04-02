const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const util = require("util");

// Promisificar la función query del pool
const queryAsync = util.promisify(pool.query).bind(pool);

const obtenerDatosVentas = async () => {
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
    ORDER BY venta.fechaventa ASC;
  `;

  try {
    const resultados = await queryAsync(sql);
    return resultados;
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL de ventas:", error);
    throw new Error("Error en la consulta SQL de ventas");
  }
};

const vistareporventas = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  try {
    // Obtén los datos de ventas utilizando la función obtenerDatosVentas
    const ventas = await obtenerDatosVentas();

    // Consulta SQL para obtener perfiles
    const sql = 'SELECT *, TIME_FORMAT(venta.horaventa, "%h:%i %p") AS horaventa_12h FROM venta';

    // Ejecuta la consulta SQL
    pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta SQL de ventas:', err);
        res.status(500).send('Error en la consulta SQL de ventas');
        return;
      }

      // Envía los resultados de la consulta a la vista
      res.render('vistaadmin/reportes/reporventas', {
        ventas,
        reporventas: results,
        nombre,
        perfil
      });
    });
  } catch (error) {
    console.error("Error al obtener los datos de ventas:", error);
    res.status(500).send('Error al obtener los datos de ventas');
  }
};

module.exports = { vistareporventas };
