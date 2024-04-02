const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");

const vistaprueba = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  const sqlcontrol = `SELECT * FROM (
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
`;

  const sqlgalpon = `SELECT 
    galpon.idgalpon,
    galpon.nombregalpon,
    galpon.estadogalpon
    FROM galpon
    WHERE estadogalpon = 2;`;

  try {
    // Crear un array de promesas para cada consulta SQL
    const [controlResult, galponResult] = await Promise.all([
      pool.promise().query(sqlcontrol),
      pool.promise().query(sqlgalpon)
    ]);

    const control = controlResult[0];
    const galpon = galponResult[0];

    console.log("Galpon Activos:", control);
    console.log("Galpon Activos:", galpon);

    // Envía los resultados de ambas consultas a la vista con los nombres pisosActivos y pisosInactivos
    res.render("vistaadmin/lotes/prueba", {
      control: control,
      galpon: galpon,
      nombre: nombre,
      perfil: perfil,
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

module.exports = { vistaprueba };
