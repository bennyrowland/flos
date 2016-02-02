/**
 * Created by ben on 01/02/16.
 */

angular.module('graph')
    .factory('preloader', ['$q', '$http', function($q, $http) {
        preloaderFunctions = {};

        preloaderFunctions.getGraph = function (graphId) {
            return $http.get('/api/graphs/' + graphId).then(function (response) {
                return response.data;
            }, function (error) {
                if (error.status == 404) {
                    console.log("requested graph does not exist, creating a new one");
                    var newGraph = {
                        id: graphId,
                        name: "My New Graph",
                        specification: {
                            properties: {},
                            processes: {},
                            connections: []
                        }
                    };
                    return $http.put('/api/graphs/' + graphId, newGraph).then(function (response) {
                        console.log("created new graph with id " + graphId);
                        return response.data;
                    }, function (error) {
                        console.log("could not create a new graph with id " + graphId + " because " + error.statusText);
                        console.log(error);
                        return undefined;
                    });
                }
            });
        };

        preloaderFunctions.getProcessConfig = function () {
            return $http.get('/api/library/processes').then(function (response) {
                return response.data;
            });
        };

        preloaderFunctions.getGraphConfig = function () {
            return $http.get('/api/library/graphs').then(function (response) {
                return response.data;
            });
        };

        preloaderFunctions.loadData = function (path) {
            return $q.all([
                preloaderFunctions.getGraph(path.params.graphId),
                preloaderFunctions.getProcessConfig(),
                preloaderFunctions.getGraphConfig()
            ]).then(function (results) {
                return {
                    graph: results[0],
                    processConfig: results[1],
                    graphConfig: results[2]
                };
            });
        };

        return preloaderFunctions;
    }]);