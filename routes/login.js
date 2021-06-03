var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var SEED = require('../setting/setting').SEED;

//Inicializar Variables
var app = express();

var Usuario = require('../models/usuario');

app.post('/', (request, response) => {
    var body = request.body;
    Usuario.findOne({ email: body.email }, (error, usuarioDB) => {

        if (error) {
            return reponse.status(500).json({
                ok: false,
                type: 'error',
                message: 'Error al buscar usuario',
                errors: error
            });
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                type: 'error',
                message: 'Credenciales incorrectas - email',
                errors: error
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return response.status(400).json({
                ok: false,
                type: 'error',
                message: 'Credenciales incorrectas - password',
                errors: error
            });
        }

        //crear un token!!
        usuarioDB.password = ';)';
        var token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 }); // 4hours

        response.status(200).json({
            ok: true,
            type: 'success',
            message: 'Usuario autenticado con éxito',
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });
    });

});

module.exports = app;