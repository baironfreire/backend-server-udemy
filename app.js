// Requires
var express = require('express');
var mongose = require('mongoose');


//Inicializar variables
var app = express();

app.use(express.json());
app.use(express.urlencoded({
    extended: true
}));

//Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario.js');
var loginRoutes = require('./routes/login.js');

//Conexion de la base de datos
mongose.connection.openUri('mongodb://localhost:27017/hospitalDB', (error, response) => {
    if (error) throw error;
    console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online');
});

//Rutas
app.use('/login', loginRoutes);
app.use('/usuario', usuarioRoutes);
app.use('/', appRoutes);

//Escuchar peticiones
app.listen(3000, () => {
    console.log('Expres server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});