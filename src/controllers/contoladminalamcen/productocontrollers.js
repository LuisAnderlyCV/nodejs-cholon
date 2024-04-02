const pool = require("../../../database/conexion")
const vistaproducto = async (req, res) => {
  const nombre = req.session.user.nombreusuario;
  const perfil = req.session.user.nombreperfil;

  // Consulta SQL 

  // (estado_piso=1)
  const sqlActivo = `
  SELECT 
  productos.idproducto,
  productos.codigo_producto,
  productos.nombre_producto,
  categoria.nombre_categoria,
  unidad.nombre_unidad ,
  productos.descripcion,
  productos.stock,
  productos.estado_producto
FROM productos
JOIN categoria ON productos.idcategoria = categoria.idcategoria
JOIN unidad ON productos.idunidad = unidad.idunidad
WHERE productos.estado_producto = 1;
`;

  // (estado_piso=0)
  const sqlInactivo = `SELECT 
  productos.idproducto,
  productos.codigo_producto,
  productos.nombre_producto,
  categoria.nombre_categoria,
  unidad.nombre_unidad ,
  productos.descripcion,
  productos.stock,
  productos.estado_producto
FROM productos
JOIN categoria ON productos.idcategoria = categoria.idcategoria
JOIN unidad ON productos.idunidad = unidad.idunidad
WHERE productos.estado_producto = 0;
`;

// obtener categorias 
const sqlCategoria = `
SELECT * FROM  categoria
WHERE estado_categoria = 1;
`;

// obtener unidad 
const sqlUnidad = `
SELECT * FROM  unidad
WHERE estado_unidad = 1;
`;
  
  // Ejecuta ambas consultas
  try {
    const [producto, productoInactivos,categoria,unidad] = await Promise.all([
      pool.promise().query(sqlActivo),
      pool.promise().query(sqlInactivo),
      pool.promise().query(sqlCategoria),
      pool.promise().query(sqlUnidad),
    ]);

    console.log("Producto Activos:", producto[0]);
    console.log("Producto Inactivos:", productoInactivos[0]);
    console.log("Categoria:", categoria[0]);
    console.log("Unidad:", unidad[0]);

    // Envía los resultados
    res.render("vistaadmin/almacen/produc", {
      producto: producto[0],
      productoInactivos: productoInactivos[0],
      categoria: categoria[0],
      unidad: unidad[0],
      nombre: nombre,
      perfil: perfil 
    });
  } catch (err) {
    console.error("Error al ejecutar las consultas SQL:", err);
    res.status(500).send("Error en las consultas SQL");
  }
};

const regisproducto = async (req, res) => {
  try {
    const { codigo_producto, nombre_producto,idcategoria, idunidad,descripcion,stock } = req.body;
    const estado_producto = 1;


    // Inserta el usuario y la contraseña en la base de datos
    pool.query(
      "INSERT INTO productos (codigo_producto, nombre_producto,idcategoria, idunidad,descripcion,stock, estado_producto ) VALUES (?,?,?,?,?,?,?)",
      [codigo_producto, nombre_producto,idcategoria, idunidad,descripcion,stock, estado_producto],
      (error, results) => {
        if (error) {
          console.error("Error al registrar Productos:", error);
          res.status(500).json({ message: "Error al registrar Producto" });
        } else {
          console.log("Producto registrado correctamente");
          res.status(200).json({ message: "Producto registrado correctamente" });
        }
      }
    );
  } catch (error) {
    console.error("Error en el registro de Producto:", error);
    res.status(500).json({ message: "Error en el registro de Producto" });
  }
};

const vistaproductoid = async (req, res) => {
  // Obtén el ID 
  const idproducto = req.params.id;

  // Consulta
  const sql = 'SELECT * FROM productos WHERE idproducto = ?';
  
  // Ejecuta
  pool.query(sql, [idproducto], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }
    console.log(results);
    // Comprueba
    if (results.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    // Envía los resultados
    res.json(results[0]);
  });
};

const updateproductoPUT = async (req, res) => {

  const idproductoobtenido = req.params.id;
  const { codigo_producto1, nombre_producto1,idcategoria1, idunidad1,descripcion1,stock1 } = req.body;


  const sql = 'UPDATE productos SET codigo_producto = ?, nombre_producto = ? ,idcategoria = ?, idunidad = ?,descripcion = ?,stock = ?, estado_producto = 1 WHERE idproducto = ?';

  pool.query(sql, [ codigo_producto1, nombre_producto1,idcategoria1, idunidad1,descripcion1,stock1, idproductoobtenido], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Producto actualizado con éxito' });

  });
};


const deleteproducto = async (req, res) => {
  const idproducto = req.params.id;

  const sql = 'UPDATE productos SET estado_producto = 0 WHERE idproducto = ?';

  pool.query(sql, [idproducto], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.length === 0) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.status(200).json({ mensaje: 'Producto eliminado con éxito' });

 
  });
};
const actproducto = async (req, res) => {

  const idproducto = req.params.id;


  const sql = 'UPDATE productos SET estado_producto = 1 WHERE idproducto = ?';

  pool.query(sql, [idproducto], (err, results) => {
    if (err) {
      console.error('Error al ejecutar la consulta SQL:', err);
      res.status(500).json({ error: 'Error en la consulta SQL' });
      return;
    }

    if (results.affectedRows > 0) {
      res.status(200).json({ mensaje: 'Producto restablecido con éxito' });
    } else {
      res.status(404).json({ error: 'Producto no encontrado o no se realizó ninguna actualización' });
    }


  });
};

module.exports = { vistaproducto, regisproducto,vistaproductoid,updateproductoPUT, deleteproducto, actproducto };