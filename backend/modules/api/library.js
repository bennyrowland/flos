/**
 * Created by ben on 01/02/16.
 */

'use strict';

const Joi = require('joi');
var Db = require('nano')('http://localhost:5984/pyflo_graphs');
var Spawn = require('child_process').spawn;

module.exports.getGraphConfig = {
    tags: ['api'],
    description: 'Get the config for all the graphs in the database',
    notes: 'Returns an array containing the names, ids and config of all graphs in the database',
    /*validate: {
        query: {
            limit: Joi.number().integer().min(1).max(50).default(10),
            offset: Joi.number().integer().min(0).default(0)
        }
    },*/
    /*response: {
     schema: Joi.object({
     offset: Joi.number().required().description('The offset in the total list of patient names'),
     total_rows: Joi.number().required().description('The total number of rows'),
     entities: Joi.array()
     })
     },*/
    handler: function (request, reply) {
        //return reply("hello world");
        Db.view('graphs', 'config', function(err, body) {
            const keys = body.rows.map(function (entry) {
                return entry.key;
            });
            return reply(keys);
        });
    }
};

module.exports.getProcessConfig = {
    tags: ['api'],
    description: 'Get the config for all the processes installed for pyflo',
    notes: 'Returns an array containing all the names and config for pyflo processes',
    handler: function (request, reply) {
        var output = "";

        var process = Spawn('pyflo-library');
        process.stdout.on('data', function(data) {
            output += data;
        });
        process.on('close', function (code) {
            if (code !== 0) {
                console.log("error running pyflo-library");
                return reply("Error");
            }
            return reply(JSON.parse(output));
        });
    }
};