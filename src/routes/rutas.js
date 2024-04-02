  const express = require("express");
const pool = require("../../database/conexion");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const {
  vistaregiadmin,
  registrarUsuarios,
} = require("../controllers/registraradmincontrollers");
const { vistalogin } = require("../controllers/logincontrollers");
const { vistaadmin } = require("../controllers/vistaadmincontrollers");
const {
  vistasegperfil,
} = require("../controllers/controladmin/segperfilcontrollers");
const {
  vistasegusuarios,
  vistausuariosid,
  updateusuariosPUT,
  deleteUsuarios,
  actusuario,
} = require("../controllers/controladmin/segusuariocontrollers");
const {
  vistasegreguser,
  segreguser,
} = require("../controllers/controladmin/segregusercontrollers");
const {
  vistasegpasword,
  vistapasswordid,
  updatepasswordPUT,
} = require("../controllers/controladmin/segpasswordcontrollers");
const {
  vistaproveedores,
  regisproveedor,
  vistaproveedorid,
  updateproveedoresPUT,
  deleteproveedores,
  actproveedor,
} = require("../controllers/controladmincompras/proveedorescontrollers");

const {
  vistacategoria,
  regiscategoria,
  vistacategoriaid,
  updatecategoriaPUT,
  deletecategoria,
  actcategoria,
} = require("../controllers/contoladminalamcen/categoriacontrollers");
const {
  vistaunidad,
  regisunidad,
  vistaunidadid,
  updateunidadPUT,
  deleteunidad,
  actunidad,
} = require("../controllers/contoladminalamcen/unidadcontrollers");
const {
  vistaclientes,
  regisclientes,
  vistaclientesid,
  updateclientesPUT,
  deleteclientes,
  actclientes,
} = require("../controllers/controladminventas/clientescontrollers");
const {
  vistaproducto,
  regisproducto,
  updateproductoPUT,
  vistaproductoid,
  deleteproducto,
  actproducto,
} = require("../controllers/contoladminalamcen/productocontrollers");
const {
  vistagalpon,
  regisgalpon,
  vistagalponid,
  updategalponPUT,
  deletegalpon,
  actgalpon,
  regiscontrol,
  patchcontrolgalpon,
} = require("../controllers/controladminlote/galponcontrollers");
const {
  vistaregiscompras, sumarcantidades, regcompras, regcompras2, productosporcate,
} = require("../controllers/controladmincompras/regiscomprascontrollers");

const { vistavisucompra, vistavisuacompraid, updatevisuacompraPUT, deletecompra, actcompra } = require("../controllers/controladmincompras/visuacomprascontrollers");
const { vistaprueba } = require("../controllers/controladminlote/pruebacontrollers");
const { vistareporcompras } = require("../controllers/controlreportes/compracontroller");
const { vistareporventas } = require("../controllers/controlreportes/ventacontroller");
const { vistaregistrocontrol, regiscontrolpollos, regismedicamento, regisalimento } = require("../controllers/controladminlote/regisgalponcobtrolers");
const { vistareporusuarios } = require("../controllers/controlreportes/usuariocontroller");
const { vistareporstock } = require("../controllers/controlreportes/stockcontroller");
const { vistasupervisor } = require("../controllers/controladorsupervisor/vitasupervisorController");
const { vistaregisventas, regventas, regventas2, restarcantidades } = require("../controllers/controladminventas/ventascontrollers");
const { vistasuperproveedores, regissuperproveedors, vistasuperproveedorids, updatesuperproveedoresPUTs, deletesuperproveedoress, actsuperproveedors } = require("../controllers/controlsupercompras/proveedoressupercontrollers");
const { vistasuperregiscompras, sumarsupercantidades, regsupercompras, regsupercompras2 } = require("../controllers/controlsupercompras/regiscomprassupercontrollers");
const { vistasupervisucompra, vistasupervisuacompraid, updatesupervisuacompraPUT, deletesupercompra, actsupercompra } = require("../controllers/controlsupercompras/visuacomprascontrollers");
const { vistasupercategoria, regissupercategoria, vistasupercategoriaid, updatesupercategoriaPUT, deletesupercategoria, actsupercategoria } = require("../controllers/controlsuperalmacen/categoriacontrollers");
const { vistasuperunidad, regissuperunidad, vistasuperunidadid, updatesuperunidadPUT, deletesuperunidad, actsuperunidad } = require("../controllers/controlsuperalmacen/unidadcontrollers");
const { vistasuperproducto, regissuperproducto, vistasuperproductoid, updatesuperproductoPUT, deletesuperproducto, actsuperproducto } = require("../controllers/controlsuperalmacen/productocontrollers");
const { vistasupergalpon, regissupergalpon, vistasupergalponid, updatesupergalponPUT, deletesupergalpon, actsupergalpon, regissupercontrol, patsuperchcontrolgalpon } = require("../controllers/controlsuperlote/galponcontrollers");
const { vistasuperprueba } = require("../controllers/controlsuperlote/pruebacontrollers");
const { vistasuperregistrocontrol, regissupercontrolpollos, regissupermedicamento, regissuperalimento } = require("../controllers/controlsuperlote/regisgalponcontrollers");
const { vistagerente } = require("../controllers/controlgerente/vistagerentecontroller");
const { vistagerereporcompras } = require("../controllers/controlgerentereportes/compracontroller");
const { vistagerereporventas } = require("../controllers/controlgerentereportes/ventacontroller");
const { vistagerereporusuarios } = require("../controllers/controlgerentereportes/usuariocontroller");
const { vistagerereporstock } = require("../controllers/controlgerentereportes/stockcontroller");
const { vistacaja } = require("../controllers/controlcaja/vistacajacontroller");
const { vistacajaclientes, regiscajaclientes, vistacajaclientesid, updatecajaclientesPUT, deletecajaclientes, actcajaclientes } = require("../controllers/controlcajaventas/clientescontrollers");
const { vistavisuaventas, vistavisuaventaid, updatevisuaventaPUT, deleteventa, actventa, updatevisuaventacontadoPUT, updatevisuaventacreditoPUT, updatevisuaventapagoPUT, cantidadpollos } = require("../controllers/controladminventas/visuaventascontrollers");
const { vistareporgalpon } = require("../controllers/controlreportes/galponcontroller");
const { vistacajaregisventas, restarcajacantidades, regcajaventas, regcajaventas2 } = require("../controllers/controlcajaventas/ventascontrollers");
const { vistagerentereporgalpon } = require("../controllers/controlgerentereportes/galponcontroller");


const router = express.Router();

//PARA PROTEGER LAS RUTAS SI NO ESTA LOGEADO LML
function protegerRutas(req, res, next) {
  const datosdelaSessiondeUsuario = req.session.user; // Obtener los datos del usuario de la sesión

  if (!datosdelaSessiondeUsuario) {
    // Si el usuario no ha iniciado sesión, redirigir a la página de login
    return res.redirect("/login");
  }

  const idperfil = datosdelaSessiondeUsuario.idperfil; // Corregir el acceso al campo 'cargo' en lugar de 'idperfil'
  const idusuario = datosdelaSessiondeUsuario.idusuario;
  if (
    (idperfil === 1 && req.path.startsWith("/admin")) ||
    (idperfil === 2 && req.path.startsWith("/caja")) ||
    (idperfil === 3 && req.path.startsWith("/supervisor")) ||
    (idperfil === 4 && req.path.startsWith("/gerente"))
  ) {
    req.idperfil = idperfil;
    req.idusuario = idusuario; // Agregar el ID del usuario // Agregar el ID del usuario al objeto de solicitud (req)
    next(); // Permitir el acceso
  } else {
    // Perfil no autorizado para acceder a esta ruta
    res.redirect("/login");
  }
}

//GUARDA SESION DE USUARIO
// Configurar express-session
router.use(
  session({
    secret: "secreto",
    resave: false,
    saveUninitialized: true,
  })
);

//ADMIN
router.get("/registro", vistaregiadmin);
router.post("/registro", registrarUsuarios);

//ADMINSEGURIDADGPERFIL
router.get("/admin/perfiles", protegerRutas, vistasegperfil);

//ADMINSEGURIDADUSUARIO
router.get("/admin/usuarios", protegerRutas, vistasegusuarios);
router.get("/admin/usuarios/:id", protegerRutas, vistausuariosid);
router.put("/admin/usuarios/:id", protegerRutas, updateusuariosPUT);
router.delete("/admin/usuarios/:id", protegerRutas, deleteUsuarios);
router.delete("/admin/borrausuario/:id", protegerRutas, actusuario);
//ADMINSEGREGISTRARUSUARIO
router.get("/admin/reguser", protegerRutas, vistasegreguser);
router.post("/admin/reguser", protegerRutas, segreguser);
//ADMINSEGPASSWORD
router.get("/admin/password", protegerRutas, vistasegpasword);
router.get("/admin/password/:id", protegerRutas, vistapasswordid);
router.put("/admin/password/:id", protegerRutas, updatepasswordPUT);

//ADMINCOMPRAS-PROVEEDORES
router.get("/admin/proveedores",protegerRutas, vistaproveedores);
router.post("/admin/proveedores",protegerRutas, regisproveedor);
router.get("/admin/proveedores/:id",protegerRutas, vistaproveedorid);
router.put("/admin/proveedores/:id",protegerRutas, updateproveedoresPUT);
router.delete("/admin/proveedores/:id",protegerRutas, deleteproveedores);
router.delete("/admin/borraproveedor/:id", protegerRutas, actproveedor);

//ADMIALMACEN-CATEGORIAS
router.get("/admin/categoria", protegerRutas, vistacategoria);
router.post("/admin/categoria",protegerRutas, regiscategoria);
router.get("/admin/categoria/:id", protegerRutas, vistacategoriaid);
router.put("/admin/categoria/:id",protegerRutas, updatecategoriaPUT);
router.delete("/admin/categoria/:id",protegerRutas, deletecategoria);
router.delete("/admin/borracategoria/:id",protegerRutas, actcategoria);

//PRODUCTO
router.get("/admin/producto",protegerRutas, vistaproducto);
router.post("/admin/producto",protegerRutas, regisproducto);
router.get("/admin/producto/:id",protegerRutas, vistaproductoid);
router.put("/admin/producto/:id",protegerRutas, updateproductoPUT);
router.delete("/admin/producto/:id",protegerRutas, deleteproducto);
router.delete("/admin/borraproducto/:id",protegerRutas, actproducto);

//ADMIALMACEN-UNIDAD
router.get("/admin/unidad",protegerRutas, vistaunidad);
router.post("/admin/unidad",protegerRutas, regisunidad);
router.get("/admin/unidad/:id",protegerRutas, vistaunidadid);
router.put("/admin/unidad/:id",protegerRutas, updateunidadPUT);
router.delete("/admin/unidad/:id",protegerRutas, deleteunidad);
router.delete("/admin/borraunidad/:id",protegerRutas, actunidad);

//CLIENTES
router.get("/admin/clientes",protegerRutas, vistaclientes);
router.post("/admin/clientes",protegerRutas, regisclientes);
router.get("/admin/clientes/:id",protegerRutas, vistaclientesid);
router.put("/admin/clientes/:id",protegerRutas, updateclientesPUT);
router.delete("/admin/clientes/:id",protegerRutas, deleteclientes);
router.delete("/admin/borracliente/:id",protegerRutas, actclientes);

//GALPON
router.get("/admin/galpon",protegerRutas, vistagalpon);
router.post("/admin/galpon",protegerRutas, regisgalpon);
router.get("/galpon/:id", vistagalponid);
router.put("/admin/galpon/:id",protegerRutas, updategalponPUT);
router.delete("/admin/galpon/:id",protegerRutas, deletegalpon);
router.delete("/admin/borragalpon/:id",protegerRutas, actgalpon);
router.post("/admin/controlgalpon",protegerRutas, regiscontrol);
router.patch('/admin/controlgalpon/:id', patchcontrolgalpon);

//prueba
router.get("/admin/prueba",protegerRutas,vistaprueba);
router.get("/admin/registrocontrol",protegerRutas, vistaregistrocontrol);
router.post("/admin/polloscontrol",protegerRutas, regiscontrolpollos);
router.post("/admin/medicamentocontrol",protegerRutas, regismedicamento);
router.post("/admin/alimentocontrol",protegerRutas, regisalimento);


//REPORTES
router.get("/admin/reportes_compras", protegerRutas, vistareporcompras);
router.get("/admin/reportes_ventas", protegerRutas, vistareporventas);
router.get("/admin/reportes_usuarios", protegerRutas, vistareporusuarios);
router.get("/admin/reportes_stock", protegerRutas, vistareporstock);
router.get("/admin/reportes_galpon", protegerRutas, vistareporgalpon);

//CONTROL COMPRAS
router.get("/admin/regcompras", protegerRutas,vistaregiscompras);
router.patch("/admin/sumarcantidad",protegerRutas, sumarcantidades);
router.post("/admin/regcompras",protegerRutas, regcompras);
router.post("/admin/regcompras2",protegerRutas, regcompras2);
//vista compras
router.get("/admin/vistacompra", protegerRutas, vistavisucompra);
router.get("/admin/vistacompra/:id",protegerRutas, vistavisuacompraid);
router.put("/admin/vistacompra/:id",protegerRutas, updatevisuacompraPUT);
router.delete("/admin/vistacompra/:id",protegerRutas, deletecompra);
router.delete("/admin/borravistacompra/:id",protegerRutas, actcompra);

//CONTROL VENTAS
router.get("/admin/regventas", protegerRutas,vistaregisventas);
router.post("/admin/restarcantidad",protegerRutas, restarcantidades);
router.post("/admin/regventas",protegerRutas, regventas);
router.post("/admin/regventas2",protegerRutas, regventas2);
//VISUA VENTAS
router.get("/admin/visuaventas", protegerRutas,vistavisuaventas);
router.get("/admin/visuaventas/:id",protegerRutas, vistavisuaventaid);
router.patch("/admin/visuaventas/:id",protegerRutas, updatevisuaventacontadoPUT);
router.patch("/admin/visuaventascredito/:id",protegerRutas, updatevisuaventacreditoPUT);
router.patch("/admin/visuaventaspago/:id",protegerRutas, updatevisuaventapagoPUT);
router.put("/admin/cantidadpollo",protegerRutas, cantidadpollos);
router.delete("/admin/visuaventas/:id",protegerRutas, deleteventa);
router.delete("/admin/borravisuaventa/:id",protegerRutas, actventa);






// vista de SUPERVISOR HECHO POR UN INSANO TLV NO EDITES
//SUPER PROVEEDORES
router.get("/supervisor/proveedores", protegerRutas, vistasuperproveedores);
router.post("/supervisor/proveedores", protegerRutas, regissuperproveedors);
router.get("/supervisor/proveedores/:id", protegerRutas, vistasuperproveedorids);
router.put("/supervisor/proveedores/:id", protegerRutas, updatesuperproveedoresPUTs);
router.delete("/supervisor/proveedores/:id", protegerRutas, deletesuperproveedoress);
router.delete("/supervisor/borraproveedor/:id", protegerRutas, actsuperproveedors);

//SUPER CONTROL COMPRAS
router.get("/supervisor/regcompras", protegerRutas,vistasuperregiscompras);
router.patch("/supervisor/sumarcantidad",protegerRutas, sumarsupercantidades);
router.post("/supervisor/regcompras",protegerRutas, regsupercompras);
router.post("/supervisor/regcompras2",protegerRutas, regsupercompras2);

// SUPER VISTA COMPRAS
router.get("/supervisor/visuacompra", protegerRutas, vistasupervisucompra);
router.get("/supervisor/visuacompra/:id", protegerRutas, vistasupervisuacompraid);
router.put("/supervisor/visuacompra/:id", protegerRutas, updatesupervisuacompraPUT);
router.delete("/supervisor/visuacompra/:id", protegerRutas, deletesupercompra);
router.delete("/supervisor/visuacompra/:id", protegerRutas,actsupercompra);

// SUPER ALMACEN-CATEGORIAS
router.get("/supervisor/categoria", protegerRutas, vistasupercategoria);
router.post("/supervisor/categoria",protegerRutas, regissupercategoria);
router.get("/supervisor/categoria/:id", protegerRutas, vistasupercategoriaid);
router.put("/supervisor/categoria/:id",protegerRutas, updatesupercategoriaPUT);
router.delete("/supervisor/categoria/:id",protegerRutas, deletesupercategoria);
router.delete("/supervisor/borracategoria/:id",protegerRutas, actsupercategoria);

//SUPER - ALMACEN-UNIDAD
router.get("/supervisor/unidad",protegerRutas, vistasuperunidad);
router.post("/supervisor/unidad",protegerRutas, regissuperunidad);
router.get("/supervisor/unidad/:id",protegerRutas, vistasuperunidadid);
router.put("/supervisor/unidad/:id",protegerRutas, updatesuperunidadPUT);
router.delete("/supervisor/unidad/:id",protegerRutas, deletesuperunidad);
router.delete("/supervisor/borraunidad/:id",protegerRutas, actsuperunidad);

//SUPER PRODUCTO
router.get("/supervisor/producto",protegerRutas, vistasuperproducto);
router.post("/supervisor/producto",protegerRutas, regissuperproducto);
router.get("/supervisor/producto/:id",protegerRutas, vistasuperproductoid);
router.put("/supervisor/producto/:id",protegerRutas, updatesuperproductoPUT);
router.delete("/supervisor/producto/:id",protegerRutas, deletesuperproducto);
router.delete("/supervisor/borraproducto/:id",protegerRutas, actsuperproducto);

//SUPER GALPON
router.get("/supervisor/galpon",protegerRutas, vistasupergalpon);
router.post("/supervisor/galpon",protegerRutas, regissupergalpon);
router.get("/galponsuper/:id", vistasupergalponid);
router.put("/supervisor/galpon/:id",protegerRutas, updatesupergalponPUT);
router.delete("/supervisor/galpon/:id",protegerRutas, deletesupergalpon);
router.delete("/supervisor/borragalpon/:id",protegerRutas, actsupergalpon);
router.post("/supervisor/controlgalpon",protegerRutas, regissupercontrol);
router.patch('/supervisor/controlgalpon/:id', patsuperchcontrolgalpon);

//SUPER prueba
router.get("/supervisor/prueba",protegerRutas,vistasuperprueba);

router.get("/supervisor/registrocontrol",protegerRutas, vistasuperregistrocontrol);
router.post("/supervisor/polloscontrol",protegerRutas, regissupercontrolpollos);
router.post("/supervisor/medicamentocontrol",protegerRutas, regissupermedicamento);
router.post("/supervisor/alimentocontrol",protegerRutas, regissuperalimento);

//Vista del GERENTE

//GERENTE REPORTES
router.get("/gerente/reportes_compras", protegerRutas, vistagerereporcompras);
router.get("/gerente/reportes_ventas", protegerRutas, vistagerereporventas);
router.get("/gerente/reportes_usuarios", protegerRutas, vistagerereporusuarios);
router.get("/gerente/reportes_stock", protegerRutas, vistagerereporstock);
router.get("/gerente/reportes_galpon", protegerRutas, vistagerentereporgalpon);

//Vista del CAJERO

//CLIENTES
router.get("/caja/clientes",protegerRutas, vistacajaclientes);
router.post("/caja/clientes",protegerRutas, regiscajaclientes);
router.get("/caja/clientes/:id",protegerRutas, vistacajaclientesid);
router.put("/caja/clientes/:id",protegerRutas, updatecajaclientesPUT);
router.delete("/caja/clientes/:id",protegerRutas, deletecajaclientes);
router.delete("/caja/borracliente/:id",protegerRutas, actcajaclientes);

//CONTROL VENTAS
router.get("/caja/regventas", protegerRutas,vistacajaregisventas);
router.post("/caja/restarcantidad",protegerRutas, restarcajacantidades);
router.post("/caja/regventas",protegerRutas, regcajaventas);
router.post("/caja/regventas2",protegerRutas, regcajaventas2);


//LOGIN
router.get("/", vistalogin);
router.get("/login", vistalogin);
//POST DE LOGIN PARA COMPARA LOS DATOOS DE LOGIN
router.post("/login", async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Busca el usuario en la base de datos por nombre de usuario
    pool.query(
      "SELECT * FROM usuario WHERE correo = ?"
      ,
      [correo],
      async (error, results) => {
        console.log(results);
        if (error) {
          console.error("Error en el servidor:", error);
          res.render("login", { message: "Error al buscar Usuario" });
        } else if (results.length === 0) {
          // El usuario no existe
          res.render("login", { message: "Correo no encontrado" });
        } else if (results[0].estado === 0) {
          // El usuario no existe
          res.render("login", { message: "Este correo esta Inactivo" });
        } else {
          // Compara la contraseña proporcionada con la almacenada en la base de datos
          const resultadodetablausuario = results[0];
          const contrasenaValida = await bcrypt.compare(
            password,
            resultadodetablausuario.password
          );

          if (contrasenaValida) {
            req.session.user = {
              idperfil: resultadodetablausuario.idperfil,
              nombreperfil: resultadodetablausuario.perfil,
              idusuario: resultadodetablausuario.idusuario,
              nombreusuario: resultadodetablausuario.nombre,
            };
            console.log(resultadodetablausuario.idperfil,resultadodetablausuario.perfil,resultadodetablausuario.idusuario,resultadodetablausuario.nombre);
            switch (resultadodetablausuario.idperfil) {
              case 1 :  // Cambiado de "1" a 1
                res.redirect("/admin");
                break;
              case 2: // Cambiado de "2" a 2
                res.redirect("/caja");
                break;
              case 3: // Cambiado de "3" a 3
                res.redirect("/supervisor");
                break;
              default:
                res.redirect("/gerente");
            }
          } else {
            // Contraseña incorrecta
            res.render("login", { message: "Contraseña Incorrecta" });
          }
        }
      }
    );
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    res.status(500).json({ message: "Error en el inicio de sesión" });
  }
});

//VISTA DEL ADMIN DESPUES LOGEADO
router.get("/admin", protegerRutas, vistaadmin);
router.get("/supervisor",protegerRutas, vistasupervisor)
router.get("/gerente",protegerRutas, vistagerente)
router.get("/caja",protegerRutas, vistacaja)


//PARA CERRAR SESION
router.get("/salir", (req, res) => {
  // Eliminar la sesión del usuario
  req.session.destroy((error) => {
    if (error) {
      console.error(error);
      return res.status(500).send("Internal Server Error");
    }

    // Redirigir al usuario a la página de inicio de sesión
    res.redirect("/login");
  });
});

//

module.exports = router;
