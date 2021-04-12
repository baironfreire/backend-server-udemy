var express = require('express');

var mdAutenticacion = require('../middlewares/autenticacion');

//Inicializar Variables
var app = express();

//Modelos
var Medico = require('../models/medico');

//===========================================================
// Obtener todos los medicos
//============================================================
app.get('/', (request, response) => {
    var from = request.query.from || 0;
    from = Number(from);
    Medico.find({})
        .skip(from)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((error, medicos) => {

            if (error) {
                return response.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: error
                });
            }

            Medico.count({}, (error, cont) => {
                response.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: cont
                });

            });

        });
});

//===========================================================
// Actualizar un medico
//============================================================
app.put('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    var body = request.body;

    Medico.findById(id, (error, medicoDB) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el medico'
            });

        }

        if (!medicoDB) {
            return response.status(400).json({
                ok: false,
                mensaje: 'El usuario con el id ' + id + ' no existe',
                errors: { message: 'No existe un usuario con ese  ID' }
            });
        }

        medicoDB.nombre = body.nombre;
        medicoDB.usuario = request.usuario._id;
        medicoDB.hospital = body.hospital;

        medicoDB.save((error, medicoSave) => {
            if (error) {
                return response.status(400).json({
                    ok: false,
                    mensaje: 'Erro al actualizar medico',
                    errors: error
                });
            }

            response.status(200).json({
                ok: true,
                medico: medicoSave
            });
        });

    });
});

//===========================================================
// Crear un medico
//============================================================
app.post('/', mdAutenticacion.verificaToken, (request, response) => {
    var body = request.body;
    var medico = new Medico({
        nombre: body.nombre,
        img: body.img,
        usuario: request.usuario._id,
        hospital: body.hospital

    });
    medico.save((error, medicoSave) => {
        if (error) {
            response.status(400).json({
                ok: false,
                mensaje: 'Erro al crear el medico',
                error: error
            });
        }

        response.status(200).json({
            ok: true,
            medico: medicoSave
        });
    });
});

//===========================================================
// Eliminar un medico
//============================================================
app.delete('/:id', mdAutenticacion.verificaToken, (request, response) => {
    var id = request.params.id;
    Medico.findByIdAndRemove(id, (error, medicoRemove) => {
        if (error) {
            response.status(400).json({
                ok: false,
                mensaje: 'Erro al eliminar el medico',
                error: error
            });
        }

        if (!medicoRemove) {
            return response.status(400).json({
                ok: false,
                mensaje: 'No existe un medico con ese id ',
                errors: { message: 'No existe un medico con ese id' }
            });
        }


        response.status(200).json({
            ok: true,
            medico: medicoRemove
        });
    });


});
module.exports = app;