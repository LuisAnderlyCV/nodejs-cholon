
const pool = require("../../../database/conexion")
const vistasupergalpon = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;
  // Consulta SQL
  const sqlActivo = `SELECT 
  galpon.idgalpon,
  galpon.nombregalpon,
  galpon.estadogalpon,
  CASE
      WHEN galpon.estadogalpon = 1 THEN 'Disponible'
      WHEN galpon.estadogalpon = 2 THEN 'Ocupado'
      WHEN galpon.estadogalpon = 0 THEN 'Mantenimiento'
      ELSE 'Desconocido'
    END AS disponibilidad
  FROM galpon
  WHERE estadogalpon = 1 OR estadogalpon= 2;
  `
// Consulta SQL 
const sqlInactivo = `SELECT 
galpon.idgalpon,
galpon.nombregalpon,
galpon.estadogalpon,
CASE
      WHEN galpon.estadogalpon = 1 THEN 'Disponible'
      WHEN galpon.estadogalpon = 2 THEN 'Ocupado'
      WHEN galpon.estadogalpon = 0 THEN 'Mantenimiento'
      ELSE 'Desconocido'
    END AS disponibilidad
FROM galpon
WHERE estadogalpon = 0;`; 
const sqlproducto = `SELECT
productos.idproducto,
productos.codigo_producto,
productos.nombre_producto,
categoria.nombre_categoria,
unidad.nombre_unidad,
productos.descripcion,
productos.stock,
productos.estado_producto
FROM
productos
JOIN
categoria ON productos.idcategoria = categoria.idcategoria
JOIN
unidad ON productos.idunidad = unidad.idunidad
WHERE
productos.estado_producto = 1
AND categoria.nombre_categoria = 'POLLO';

`;

  // Ejecuta ambas consultas 
  try {
    const [galpon, galponInactivos, producto] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlInactivo),
      pool.promise().query(sqlproducto),
    ]);

    console.log("Galpon Activos:", galpon[0]);
    console.log("Galpon Inactivos:", galponInactivos[0]);
    console.log("Galpon Inactivos:", producto[0]);

 

    // Envía los resultados
    res.render("vistasupervisor/lotes/galpon", {
      galpon: galpon[0],
      galponInactivos: galponInactivos[0],
      producto: producto[0],
       nombre: nombre,
      perfil: perfil 
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};
const regissupercontrol = async (req, res) => {
  try {
    const { idgalpon, cantidadpollo, fechallegada, idproducto, mortalidadpollos, descripcion } = req.body;
    const estadocontrolgalpon = 1;

    // Inserta el control galpon en la base de datos
    pool.query(
      "INSERT INTO controlgalpon (idgalpon, cantidadpollo, fechallegada, idproducto, mortalidadpollos, descripcion, estadocontrolgalpon) VALUES (?,?,?,?,?,?,?)",
      [idgalpon, cantidadpollo, fechallegada, idproducto, mortalidadpollos, descripcion, estadocontrolgalpon],
      (error, results) => {
        if (error) {
          console.error("Error al registrar el control galpon:", error);
          res.status(500).json({ message: "Error al registrar el control galpon" });
        } else {
          // Obtiene el ID del control galpon recién insertado
          const idControlGalpon = results.insertId;

          console.log("Control Galpon registrado correctamente con ID:", idControlGalpon);

          // Actualiza el estado del galpon a 2
          pool.query(
            "UPDATE galpon SET estadogalpon = 2 WHERE idgalpon = ?",
            [idgalpon],
            (updateError) => {
              if (updateError) {
                console.error("Error al actualizar el estado del galpon:", updateError);
                res.status(500).json({ message: "Error al actualizar el estado del galpon" });
              } else {
                console.log("Estado del galpon actualizado correctamente a 2");

                // Actualiza el stock en la tabla de productos
                pool.query(
                  "UPDATE productos SET stock = stock - ? WHERE idproducto = ?",
                  [cantidadpollo, idproducto],
                  (stockUpdateError) => {
                    if (stockUpdateError) {
                      console.error("Error al actualizar el stock en la tabla de productos:", stockUpdateError);
                      res.status(500).json({ message: "Error al actualizar el stock en la tabla de productos" });
                    } else {
                      console.log("Stock en la tabla de productos actualizado correctamente");
                      // Devuelve el ID del control galpon
                      res.status(200).json({ message: "Control Galpon registrado, estado del galpon actualizado y stock en la tabla de productos actualizado correctamente", idControlGalpon });
                    }
                  }
                );
              }
            }
          );
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro del control galpon:", error);
    res.status(500).json({ message: "Error en el registro del control galpon" });
  }
};

const regissupergalpon = async (req, res) => {
  try {
    const { nombregalpon,disponibilidad } = req.body;
    const estadogalpon = 1;

    pool.query(
      "INSERT INTO galpon (nombregalpon,estadogalpon,disponibilidad ) VALUES (?,?,?)",
      [nombregalpon,estadogalpon,disponibilidad],
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

const vistasupergalponid = async (req, res) => {
  // Obtén el ID del perfil de los parámetros de la URL
  const idgalpon = req.params.id;

  // Consulta SQL para obtener un perfil por su ID
  const sql = 'SELECT * FROM galpon WHERE idgalpon = ?';
  
  // Ejecuta la consulta SQL
  pool.query(sql, [idgalpon], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }
    console.log(results);
    // Comprueba si se encontró un perfil con el ID proporcionado
    if (results.length === 0) {
      res.status(404).json({ error: 'Galpon no encontrado' });
      return;
    }

    // Envía los resultados en formato JSON
    res.json(results[0]);
  });
};

const updatesupergalponPUT = async (req, res) => {
 
  const idgalponobtenido = req.params.id;
  const { nombregalpon1} = req.body;

  const sql = 'UPDATE galpon SET nombregalpon=?, estadogalpon = 1 WHERE idgalpon = ?';

  pool.query(sql, [nombregalpon1,idgalponobtenido], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Galpon no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Categoria actualizado con éxito' });

  });
};


const deletesupergalpon = async (req, res) => {

  const idgalpon = req.params.id;

  const sql = 'UPDATE galpon SET estadogalpon = 0 WHERE idgalpon = ?';

  pool.query(sql, [idgalpon], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Usuario eliminado con éxito' });

 
  });
};
const actsupergalpon = async (req, res) => {

  const idgalpon = req.params.id;

  const sql = 'UPDATE galpon SET estadogalpon = 1 WHERE idgalpon = ?';

  pool.query(sql, [idgalpon], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ mensaje: 'Usuario restablecido con éxito' });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado o no se realizó ninguna actualización' });
    }


  });
};

const patsuperchcontrolgalpon = async (req, res) => {
  try {

    const idControlGalpon = req.params.id;

    const sql = 'UPDATE controlgalpon SET filtro = ? WHERE idControlGalpon = ?';

    pool.query(sql, [idControlGalpon, idControlGalpon], (error, results) => {
      if (error) {
        console.error('Error al ejecutar la consulta SQL:', error);
        res.status(500).json({ error: 'Error en la consulta SQL' });
        return;
      }

      if (results.affectedRows > 0) {
        res.status(200).json({ mensaje: 'Control Galpon actualizado con éxito' });
      } else {
        res.status(404).json({ error: 'Control Galpon no encontrado o no se realizó ninguna actualización' });
      }
    });
  } catch (error) {
    console.error('Error en el controlador de actualización:', error);
    res.status(500).json({ error: 'Error en el controlador de actualización' });
  }
};

module.exports = { vistasupergalpon, regissupergalpon,vistasupergalponid,updatesupergalponPUT, deletesupergalpon, actsupergalpon, regissupercontrol, patsuperchcontrolgalpon };