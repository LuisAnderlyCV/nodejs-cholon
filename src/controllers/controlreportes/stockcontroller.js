const pool = require("../../../database/conexion");
const bcrypt = require("bcryptjs");
const vistareporstock = async (req, res) => {
    const nombre = req.session.user.nombreusuario;
    const perfil = req.session.user.nombreperfil;
    // Consulta SQL para obtener perfiles
    const sql = 'SELECT productos.codigo_producto, productos.nombre_producto, categoria.nombre_categoria, unidad.nombre_unidad, productos.stock FROM productos JOIN categoria ON productos.idcategoria = categoria.idcategoria JOIN unidad ON productos.idunidad = unidad.idunidad';



    // Ejecuta la consulta SQL
    pool.query(sql, (err, results) => {
        if (err) {
            console.error('Error al ejecutar la consulta SQL:', err);
            res.status(500).send('Error en la consulta SQL');
            return;
        }
        // Envía los resultados de la consulta a la vista
        res.render('vistaadmin/reportes/reporstock', {
            reporstock: results, nombre: nombre,
            perfil: perfil
        });
    });
};

module.exports = { vistareporstock };