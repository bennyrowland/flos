/**
 * Created by ben on 14/01/16.
 */
'use strict';

var Glue = require('glue');

Glue.compose(require('../manifest.json'), { relativeTo: __dirname + '/modules'}, function (err, server) {
    if (err) {
        console.log('glue.compose error: ', err);
    }

    server.route({
        method: 'GET',
        path: '/{path*}',
        config: {
            handler: {directory: {path: __dirname + '/../app/'}}
        }
    });

    server.start(function () {
        // server is running
        console.log('Server is listening on ' + server.info.uri.toLowerCase());
    });
});
