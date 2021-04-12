var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

//import modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

//mideware
app.use(fileUpload());
//Rutas
app.put('/:tipo/:id', (request, response) => {
    var tipo = request.params.tipo;
    var id = request.params.id;

    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no es válida',
            errors: { message: 'Tipo de colección no es válida' }
        });
    }

    if (!request.files) {
        return response.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            errors: { message: 'Debe seleccionar una imgen ' }
        });
    }

    //Obtener nombre del archivo
    var file = request.files.imagen;
    var nameShort = file.name.split('.');
    var extensionarchivo = nameShort[nameShort.length - 1];

    var extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    if (extensionesValidas.indexOf(extensionarchivo) < 0) {
        return response.status(400).json({
            ok: false,
            mensaje: 'Extension no válida',
            errors: { message: 'Las extensiones válidas son ' + extensionesValidas.join(', ') }
        });
    }

    var nombreArchivo = `${ id }-${new Date().getMilliseconds()}.${extensionarchivo}`;
    var path = `./uploads/${ tipo }/${ nombreArchivo }`;

    file.mv(path, (error) => {
        if (error) {
            return response.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errors: error
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, response);
        // response.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido',
        //     extensionarchivo: extensionarchivo
        // });
    });



});

function subirPorTipo(tipo, id, nombreArchivo, response) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (error, usuarioDB) => {
                if (!usuarioDB) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Usuario no existe',
                        errors: { message: 'Usuario con el id ' + id + ' no existe' }
                    });
                }
                var pathViejo = './uploads/usuarios/' + usuarioDB.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }
                usuarioDB.img = nombreArchivo;
                usuarioDB.save((error, usuarioSave) => {
                    if (error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error actualizar imagen usuario',
                            errors: { message: 'Error al actualizar la imagen del usuario' }
                        });
                    }
                    usuarioSave.password = ';)';
                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada',
                        usuario: usuarioSave
                    });
                });

            });
            break;
        case 'hospitales':
            Hospital.findById(id, (error, hospitalDB) => {

                if (!hospitalDB) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Hospital no existe',
                        errors: { message: 'Hospital con el id ' + id + ' no existe' }
                    });
                }
                var pathViejo = './uploads/hospitales/' + hospitalDB.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }
                hospitalDB.img = nombreArchivo;
                hospitalDB.save((error, hospitalSave) => {
                    if (error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error actualizar imagen hospital',
                            errors: { message: 'Error al actualizar la imagen del hospital' }
                        });
                    }
                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada',
                        hospital: hospitalSave
                    });
                });
            });

            break;
        case 'medicos':
            Medico.findById(id, (error, medicoDB) => {
                if (!medicoDB) {
                    return response.status(400).json({
                        ok: false,
                        mensaje: 'Medico no existe',
                        errors: { message: 'Medico con el id ' + id + ' no existe' }
                    });
                }
                var pathViejo = './uploads/medicos/' + medicoDB.img;
                if (fs.existsSync(pathViejo)) {
                    fs.unlink(pathViejo);
                }
                medicoDB.img = nombreArchivo;
                medicoDB.save((error, medicoSave) => {
                    if (error) {
                        return response.status(500).json({
                            ok: false,
                            mensaje: 'Error actualizar imagen medico',
                            errors: { message: 'Error al actualizar la imagen del medico' }
                        });
                    }
                    return response.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada',
                        medico: medicoSave
                    });
                });
            });
            break;
    }
}

module.exports = app;