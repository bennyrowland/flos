/**
 * Created by ben on 19/01/16.
 */
angular.module('flos.db', [])
    .factory('dbservice', ['$http', '$q', function ($http, $q) {
        var dbFunctions = {};

        dbFunctions.getGraph = function (graphId) {
            return $http.get('/api/graphs/' + graphId);
        };

        dbFunctions.saveGraph = function (graphId, graphData) {
            console.log(graphId, graphData);
            return $http.put('/api/graphs/' + graphId, graphData);
        };

        return dbFunctions;
    }]);