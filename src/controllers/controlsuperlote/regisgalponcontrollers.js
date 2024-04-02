const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");

const vistasuperregistrocontrol = async (req, res) => {
  const idgalpon = req.query.idgalpon;
  const filtro = req.query.filtro;

  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  const sqlcontrol = `
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
      AND controlgalpon.idgalpon = ?
      AND controlgalpon.filtro = ?
      AND controlgalpon.idcontrolgalpon = (
        SELECT MAX(idcontrolgalpon)
        FROM controlgalpon
        WHERE idgalpon = ?
      )
  `;

  const sqlAlimento = "SELECT * FROM productos WHERE idcategoria=2";
  const sqlMedicamento = "SELECT * FROM productos WHERE idcategoria=3";

  try {
    const [controlResult] = await pool.promise().query(sqlcontrol, [idgalpon, filtro, idgalpon]);
    const [alimentoResult] = await pool.promise().query(sqlAlimento);
    const [medicamentoResult] = await pool.promise().query(sqlMedicamento);

    const control = controlResult;
    const alimentos = alimentoResult;
    const medicamentos = medicamentoResult;

    console.log("Galpon Activos:", control);
    console.log("Alimentos:", alimentos);
    console.log("Medicamentos:", medicamentos);

    res.render("vistasupervisor/lotes/controlregistro", {
      control: control,
      alimentos: alimentos,
      medicamentos: medicamentos,
      nombre: nombre,
      perfil: perfil,
      idgalpon: idgalpon,
      filtro: filtro
    });
  } catch (err) {
    console.error("Error al ejecutar la consulta SQL:", err);
    res.status(500).send("Error en la consulta SQL");
  }
};


const regissupercontrolpollos = async (req, res) => {
  try {
    const { idgalpon, cantidad, fecha, idproducto, mortalidad, descripcion, filtro } = req.body;
    const estado = 1;

    // Inserta el usuario y la contraseña en la base de datos
    pool.query(
      "INSERT INTO controlgalpon (idgalpon,cantidadpollo ,fechallegada, estadocontrolgalpon, idproducto, mortalidadpollos,descripcion, filtro  ) VALUES (?,?,?,?,?,?,?,?)",
      [idgalpon, cantidad, fecha, estado, idproducto, mortalidad, descripcion, filtro],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el usuario:", error);
          res.status(500).json({ message: "Error al registrar el usuario" });
        } else {
          console.log("Usuario registrado correctamente");
          res.status(200).json({ message: "Usuario registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ message: "Error en el registro de usuario" });
  }
};

const regissupermedicamento = async (req, res) => {
  try {
    const { cantidad, fecha, idproducto, descripcion, idgalpon, filtro } = req.body;
    const estado = 1;

    // Inserta el usuario y la contraseña en la base de datos
    pool.query(
      "INSERT INTO controlmedicamento (cantidadmedicamentos,fechallegada,idproducto,descripcion,idgalpon,estado,filtro) VALUES (?,?,?,?,?,?,?)",
      [cantidad, fecha, idproducto, descripcion, idgalpon, estado, filtro],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el usuario:", error);
          res.status(500).json({ message: "Error al registrar el usuario" });
        } else {
          console.log("Usuario registrado correctamente");
          res.status(200).json({ message: "Usuario registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ message: "Error en el registro de usuario" });
  }
};

const regissuperalimento = async (req, res) => {
  try {
    const { cantidad, fecha, idproducto, descripcion, idgalpon, filtro } = req.body;
    const estado = 1;


    // Inserta el usuario y la contraseña en la base de datos
    pool.query(
      "INSERT INTO controlalimento (cantidadalimento,fechallegada,idproducto,descripcion,idgalpon, estado, filtro ) VALUES (?,?,?,?,?,?,?)",
      [cantidad, fecha, idproducto, descripcion, idgalpon, estado, filtro],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el usuario:", error);
          res.status(500).json({ message: "Error al registrar el usuario" });
        } else {
          console.log("Usuario registrado correctamente");
          res.status(200).json({ message: "Usuario registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro de usuario:", error);
    res.status(500).json({ message: "Error en el registro de usuario" });
  }
};

module.exports = { vistasuperregistrocontrol, regissuperalimento, regissupercontrolpollos, regissupermedicamento };
