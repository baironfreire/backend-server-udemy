var express = require('express');
var fs = require('fs');
var path = require('path');

var app = express();


//Rutas
app.get('/:tipo/:img', (request, response, next) => {
    var tipo = request.params.tipo;
    var img = request.params.img;
    var url = `./uploads/${ tipo }/${ img }`;
    console.log('path', url);
    fs.exists(url, existe => {
        if (!existe) {
            url = './assets/no-img.jpg';
        }

        response.sendFile(path.resolve(url));
    });
});

module.exports = app;