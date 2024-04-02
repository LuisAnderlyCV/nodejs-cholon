const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const util = require("util");

// Promisificar la función query del pool
const queryAsync = util.promisify(pool.query).bind(pool);

const obtenerDatosCompras = async () => {
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
    ORDER BY compras.fecha_compra ASC;
  `;

  try {
    const resultados = await queryAsync(sql);
    return resultados;
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL:", error);
    throw new Error("Error en la consulta SQL");
  }
};

const vistareporcompras = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  try {
    // Obtén los datos de compras utilizando la función obtenerDatosCompras
    const compras = await obtenerDatosCompras();

    // Consulta SQL para obtener perfiles
    const sql = 'SELECT *, TIME_FORMAT(compras.horacompra, "%h:%i %p") AS horacompra_12h FROM compras';

    // Ejecuta la consulta SQL
    pool.query(sql, (err, results) => {
      if (err) {
        console.error('Error al ejecutar la consulta SQL:', err);
        res.status(500).send('Error en la consulta SQL');
        return;
      }

      // Envía los resultados de la consulta a la vista
      res.render('vistaadmin/reportes/reporcompras', {
        compras,
        reporcompras: results,
        nombre: nombre,
        perfil: perfil
      });
    });
  } catch (error) {
    console.error("Error al obtener los datos de compras:", error);
    res.status(500).send('Error al obtener los datos de compras');
  }
};

module.exports = { vistareporcompras };
