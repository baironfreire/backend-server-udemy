var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

var mdAutenticacion = require('../middlewares/autenticacion');

//Inicializar Variables
var app = express();

var Usuario = require('../models/usuario');

//Rutas
app.get('/', (request, response, next) => {
    var from = request.query.from || 0;
    from = Number(from);
    Usuario.find({}, 'nombre email img role')
        .skip(from)
        .limit(5)
        .exec(
            (error, usuarios) => {
                if (error) {
                    return response.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuario',
                        errors: error
                    });
                }

                Usuario.count({}, (error, cont) => {
                    response.status(200).json({
                        ok: true,
                        usuarios: usuarios,
                        total: cont
                    });

                });
            }

        );

});

//===========================================================
// Actualizar usuario
//============================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;
    var usuario = Usuario.findById(id, (error, usuarioDB) => {

        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar  usuario',
                errors: error
            });
        }

        if (!usuarioDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        usuarioDB.nombre = body.nombre;
        usuarioDB.email = body.email;
        usuarioDB.role = body.role;

        usuarioDB.save((error, usuarioSave) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar  usuario',
                    errors: error
                });
            }

            response.status(200).json({
                ok: true,
                usuario: usuarioSave
            });


        });
    });
});

//===========================================================
// Crear usuario
//============================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        img: body.img,
        role: body.role
    });

    usuario.save((error, usuarioDB) => {
        if (error) {
            return response.status(400).json({
                ok: false,
                mensaje: 'Error al crear  usuario',
                errors: error
            });
        }

        response.status(201).json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

//===========================================================
// Eliminar usuario
//============================================================

app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    Usuario.findByIdAndRemove(id, (error, usuarioRemove) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al borrar  usuario',
                errors: error
            });
        }

        if (!usuarioRemove) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un usuario con ese id ',
                errors: { message: 'No existe un suario con ese id' }
            });
        }

        response.status(200).json({
            ok: true,
            usuario: usuarioRemove
        });
    });
});

module.exports = app;