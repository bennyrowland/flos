/**
 * Created by ben on 19/01/16.
 */
angular.module('graph')
    .controller('graphCtrl', [
        '$scope',
        '$http',
        '$httpParamSerializer',
        'dbservice',
        'runService',
        'flowLibrary',
        'initialData',
        function($scope, $http, $httpParamSerializer, dbservice, runService, flowLibrary, initialData) {

            $scope.foo = initialData.graphConfig;

            $scope.graphSpec = initialData.graph;
            flowLibrary.setComponentLibrary(initialData.processConfig);
            flowLibrary.setGraphLibrary(initialData.graphConfig);

            /*dbservice.getGraph('first_graph').then(function (graph) {
                $scope.graphSpec = graph.data;
            }, function (err) {
                console.log('error loading graph');
            });*/

            $scope.runGraph = function() {
                /*$scope.queryString = $httpParamSerializer($scope.inports.parameterValues);
                var postUrl = "/api/graphs/first_graph?" + $scope.queryString;
                console.log(postUrl);
                $http.post(postUrl).then(function (reply) {
                    console.log("graph channel is " + reply.data);
                }, function (err) {});*/
                console.log("running graph");
                console.log($scope.graphSpec.id);
                runService.runGraph($scope.graphSpec.id, $scope.inports.parameterValues).then(function (output) {
                    $scope.graphOutput = output;
                });
            };

            $scope.$watch('graphSpec', function () {
                console.log('graphSpec changed');
            });

            $scope.saveGraph = function () {
                dbservice.saveGraph($scope.graphSpec.id, $scope.graphSpec).then(function (response) {
                    console.log("saved graph");
                    console.log(response);
                    $scope.graphSpec._rev = response.data._rev;
                });
            };

            $scope.inports = {parameterValues: "thing"};
        }]);