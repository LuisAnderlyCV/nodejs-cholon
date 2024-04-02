const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const util = require("util");

const obtenerDatosgalpon = async () => {
  const sql = `
    SELECT 
      controlgalpon.idcontrolgalpon,
      DATE_FORMAT(controlgalpon.fechallegada, '%Y-%m-%d') AS fechallegada,
      galpon.nombregalpon,
      controlgalpon.cantidadpollo,
      productos.nombre_producto,
      controlgalpon.mortalidadpollos,
      controlgalpon.descripcion
    FROM controlgalpon
    JOIN galpon ON controlgalpon.idgalpon = galpon.idgalpon
    JOIN productos ON controlgalpon.idproducto = productos.idproducto
    WHERE controlgalpon.estadocontrolgalpon = 1
    ORDER BY controlgalpon.fechallegada DESC;
  `;

  try {
    const [resultados] = await pool.promise().query(sql);
    return resultados;
  } catch (error) {
    console.error("Error al ejecutar la consulta SQL:", error);
    throw new Error("Error en la consulta SQL");
  }
};

const vistareporgalpon = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  try {
    const galpon = await obtenerDatosgalpon();
    // Envía los resultados de la consulta a la vista
    res.render('vistaadmin/reportes/reporgalpon', {
      galpon,
      nombre,
      perfil
    });
  } catch (error) {
    console.error('Error en la función vistareporgalpon:', error);
    res.status(500).send('Error en la aplicación');
  }
};

module.exports = { vistareporgalpon };
