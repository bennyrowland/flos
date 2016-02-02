/**
 * Created by ben on 14/01/16.
 */
'use strict';
var Joi = require('joi');
var Db = require('nano')('http://localhost:5984/pyflo_graphs');
var Spawn = require('child_process').spawn;
var Socket = require('../socket');
var Boom = require('boom');

const internals = {};

internals.runGraph = function(graphName, inputParameters) {
    console.log(inputParameters);

    // turn input parameters dictionary into array of command line strings

    const cliArgs = [graphName];
    for (var arg in inputParameters) {
        if (inputParameters[arg] !== "") {
            console.log(inputParameters[arg][1]);
            console.log(inputParameters[arg]);
            console.log(inputParameters[arg].replace("\\n", "\n"));
            cliArgs.push('--' + arg + '=' + inputParameters[arg].replace("\\n", "\n"));
        }
    }
    console.log(cliArgs);

    // add the loader parameter for accessing the database of graphs
    cliArgs.push('--loaders={"couchdb": {"url": "http://localhost:5984", "db": "pyflo_graphs"}}');

    var output = "";

    // create a new socket.io namespace where the output from this graph will be sent
    var nsp = Socket.io.of('1');

    // when we get a connection, start by sending the output we have built up so far
    nsp.on('connection', function(socket) {
        socket.emit('data', output);
    });

    // launch the pyflo graph

    var process = Spawn('pyflo', cliArgs);
    process.stdout.on('data', function(data) {
        output += data;
        nsp.emit('data', "" + data);
        console.log("data" + data);
    });
    process.stderr.on('data', function(data) {
        console.log("err" + data);
        nsp.emit('err', 'stderr: ' + data);
    });
    process.on('close', function (code) {
        console.log("pyflo graph " + graphName + " finished running with code " + code);
        output = "";

        // disconnect all sockets connected to our namespace
        //console.log(nsp.connected);
        for (var socketId in nsp.connected) {
            if (nsp.connected.hasOwnProperty(socketId)) {
                var socket = nsp.connected[socketId];
                socket.disconnect(true);
            }
        }
    });


    return 1;
};

module.exports.getGraphNames = {
    tags: ['api'],
    description: 'Get the list of graphs in the database',
    notes: 'Returns an array containing the names and ids of all graphs in the database',
    validate: {
        query: {
            limit: Joi.number().integer().min(1).max(50).default(10),
            offset: Joi.number().integer().min(0).default(0)
        }
    },
    /*response: {
        schema: Joi.object({
            offset: Joi.number().required().description('The offset in the total list of patient names'),
            total_rows: Joi.number().required().description('The total number of rows'),
            entities: Joi.array()
        })
    },*/
    handler: function (request, reply) {
        //return reply("hello world");
        Db.view('graphs', 'by_name', function(err, body) {
            return reply(body);
        });
    }
};

module.exports.getGraph = {
    tags: ['api'],
    handler: function (request, reply) {
        Db.get(request.params.graphId, function(err, body) {
            if (!err) {
                var graphSpec = {
                    id: body._id,
                    name: body.name,
                    specification: body.specification,
                    _rev: body._rev
                };
                return reply(graphSpec);
            }
            else {
                return reply(Boom.notFound("no graph with id " + request.params.graphId));
            }
        });
    }
};

module.exports.putGraph = {
    tags: ['api'],
    handler: function (request, reply) {
        request.payload.type = "graph";
        Db.insert(request.payload, request.params.graphId, function (err, body) {
            if (!err) {
                Db.get(request.params.graphId, function (err, body) {
                    if (!err) {
                        var graphSpec = {
                            id: body._id,
                            name: body.name,
                            specification: body.specification,
                            _rev: body._rev
                        };
                        return reply(graphSpec);
                    }
                    else {
                        return reply(Boom.unauthorized());
                    }
                });
            }
            else {
                return reply(Boom.unauthorized());
            }
        });
    }
};

module.exports.runGraph = {
    tags: ['api'],
    handler: function (request, reply) {
        console.log(request.params);
        console.log(request.query);
        const runId = internals.runGraph(request.params.graphId, request.query);
        return reply(runId);
    }
};