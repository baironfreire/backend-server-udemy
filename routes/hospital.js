var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

//Inicializar Variables
var app = express();

//Modelos
var Hospital = require('../models/hospital');

//===========================================================
// Obtener todos los hospitales
//============================================================
app.get('/', (request, response) => {
    var from = request.query.from || 0;
    from = Number(from);
    Hospital.find({})
        .skip(from)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((error, hospitales) => {
            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospitales',
                    errors: error
                });
            }

            Hospital.count({}, (error, cont) => {
                response.status(200).json({
                    ok: true,
                    hospitales: hospitales,
                    total: cont
                });

            });

        });

});

//===========================================================
// Actualizar un hospital
//============================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Hospital.findById(id, (error, hospitalDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el hospital'
            });

        }

        if (!hospitalDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese  ID' }
            });
        }

        hospitalDB.nombre = body.nombre;
        hospitalDB.usuario = request.usuario._id;

        hospitalDB.save((error, hospitalSave) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Erro al actualizar hospital',
                    errors: error
                });
            }

            response.status(200).json({
                ok: true,
                hospital: hospitalSave
            });
        });

    });
});

//===========================================================
// Crear un hospital
//============================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario._id
    });
    hospital.save((error, hospitalSave) => {
        if (error) {
            response.status(400).json({
                ok: false,
                mensaje: 'Erro al crear el hospital',
                error: error
            });
        }

        response.status(200).json({
            ok: true,
            hospital: hospitalSave
        });
    });
});

//===========================================================
// Eliminar un hospital
//============================================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    Hospital.findByIdAndRemove(id, (error, hospitalRemove) => {
        if (error) {
            response.status(400).json({
                ok: false,
                mensaje: 'Erro al eliminar el hospital',
                error: error
            });
        }

        if (!hospitalRemove) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id ',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }


        response.status(200).json({
            ok: true,
            hospital: hospitalRemove
        });
    });


});
module.exports = app;