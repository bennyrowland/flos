/**
 * Created by ben on 18/01/16.
 */

var SocketIO = require('socket.io');

exports.register = function (server, options, next) {
    exports.io = SocketIO(server.select('api').listener);
    exports.io.on('connection', function(socket) {
        console.log('new socket.io connection');
    });

    next();
};

exports.register.attributes = {
    name: 'socket',
    version: require(__dirname + '/../../../package.json').version
};
