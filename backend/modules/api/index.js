/**
 * Created by ben on 14/01/16.
 */

var Flo = require('./flo.js');
var Library = require('./library.js');

exports.register = function (server, options, next) {
    server.route({
        path: '/graphs',
        method: 'GET',
        config: Flo.getGraphNames
    });

    server.route({
        path: '/graphs/{graphId}',
        method: 'POST',
        config: Flo.runGraph
    });

    server.route({
        path: '/graphs/{graphId}',
        method: 'PUT',
        config: Flo.putGraph
    });

    server.route({
        path: '/graphs/{graphId}',
        method: 'GET',
        config: Flo.getGraph
    });

    server.route({
        path: '/library/graphs',
        method: 'GET',
        config: Library.getGraphConfig
    });

    server.route({
        path: '/library/processes',
        method: 'GET',
        config: Library.getProcessConfig
    });

    next();
};

exports.register.attributes = {
    name: 'api',
    version: require(__dirname + '/../../../package.json').version
};