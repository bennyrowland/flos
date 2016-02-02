/**
 * Created by ben on 21/01/16.
 */
angular.module('flos.run', [])
    .factory('runService', ['$http', '$httpParamSerializer', '$q', '$rootScope', function ($http, $httpParamSerializer, $q, $rootScope) {
        var runFunctions = {};

        var runResults = {};

        runFunctions.runGraph = function (graphId, inportParameters) {
            var deferred = $q.defer();

            // convert the graph id and dictionary of parameters to the calling url
            var queryString = $httpParamSerializer(inportParameters);
            var postUrl = "/api/graphs/" + graphId + "?" + queryString;
            console.log(queryString);

            // submit the request to the server for processing
            $http.post(postUrl).then(function (reply) {

                // the reply we get is the channel for the socket.io namespace the graph output is broadcast on
                var graphChannel = reply.data;

                runResults[graphChannel] = {
                    running: true,
                    output: ""
                };

                var socket = io('/' + graphChannel);

                socket.on('data', function (data) {
                    console.log(data);
                    $rootScope.$apply(function () {
                        runResults[graphChannel].output += data;
                    });
                });
                socket.on('disconnect', function (reason) {
                    console.log('socket disconnected because ' + reason);
                    runResults[graphChannel].running = false;
                });

                deferred.resolve(runResults[graphChannel]);
            }, function (err) {});

            return deferred.promise;
        };

        return runFunctions;
    }]);