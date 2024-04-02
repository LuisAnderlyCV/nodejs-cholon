const express = require('express');
const pool = require('./database/conexion');
const app = express();
const path = require('path');

// Configurar middleware para procesar datos del formulario
app.use(express.urlencoded({ extended: true }));
/*----------------------------------------------------------------------------------------------------------------*/
app.use(express.json());
// ACA PONES EL MOTOR O FORMATO DEL HTML QUE VAS A USAR EJS SERIA EL MAS COMUN
app.set('view engine', 'ejs');

// ACA VAS A PONER DE DONDE VA BUSCAR EL HTML O EL EJS MAS DICHO AHI TE DEJO
app.set('views', path.join(__dirname, 'src', 'views'));

// ESTO ES PARA INDICAR DESDE DONDE VAS A LLAMAR LOS LINKS PARA TU HTML : ejmplos -> /src/views/vistaadmin/css/estilos.css -- para llamar css que esta dentro de carpeta vistaadmin , entras usuarios.ejs para que te des cuenta como llamo links como css ejemplo
app.use('/src', express.static('src'))

//PARA PODER AGARRAR DATS DEL FORMULARIO LOGIN
app.use(express.urlencoded({ extended: true }));

// RUTAS EN GENERAL SON ESTO
const rutas = require('./src/routes/rutas');
app.use(rutas);

// PRUEBA DE LA CONEXION A LA BASE DE DATOS MYSQL
pool.getConnection((err, connection) => {
    if (err) {
      console.error('Error al conectar a la base de datos:', err);
      return;
    } else {
        console.log('Conexión a la base de datos de MySQL con éxito!');
    }
});

app.listen(3000, () => {
    console.log('El servidor está corriendo en el puerto 3000 ---> http://localhost:3000/');
});
