var express = require('express');
var app = express();

//import modelos
var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

//========================================================
// Busquedad por colección
//========================================================
app.get('/coleccion/:tabla/:busqueda', (request, response) => {
    var tabla = request.params.tabla;
    var busqueda = request.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    switch (tabla) {
        case 'usuarios':
            promise = buscarUsuario(busqueda, regex);
            break;
        case 'medicos':
            promise = buscarMedico(busqueda, regex);
            break;
        case 'hospitales':
            promise = buscarHospital(busqueda, regex);
            break;
        default:
            return response.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                errors: { message: 'Tipo de tabla/coleccion no válido' }
            });
    }

    promise.then(data => {
        response.status(200).json({
            ok: true,
            [tabla]: data
        });
    })


});

//========================================================
// Busquedad General
//========================================================
app.get('/todo/:busqueda', (request, response, next) => {
    var busqueda = request.params.busqueda;
    var regex = new RegExp(busqueda, 'i');

    Promise.all([buscarHospital(busqueda, regex), buscarMedico(busqueda, regex), buscarUsuario(busqueda, regex)]).then(
        (respuestas) => {

            response.status(200).json({
                ok: true,
                hospitales: respuestas[0],
                medicos: respuestas[1],
                usuarios: respuestas[2]
            });
        }
    );

});

function buscarUsuario(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role')
            .or([{ nombre: regex }, { email: regex }])
            .exec((error, usuarios) => {
                if (error) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(usuarios);
                }
            });
    });
}

function buscarMedico(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((error, medicos) => {
                if (error) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });

    });
}

function buscarHospital(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((error, hospitales) => {
                if (error) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });

    });
}

module.exports = app;