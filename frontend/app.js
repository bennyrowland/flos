/**
 * Created by ben on 19/01/16.
 */
angular.module('flosApp', [
    'ngRoute',
    'ui.bootstrap',
    'flowchart',
    'graph'
])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
            .when('/graph/:graphId', {
                templateUrl: 'components/graph/graph.html',
                controller: 'graphCtrl',
                resolve: {
                    initialData: function (preloader, $route) {
                        return preloader.loadData($route.current);
                    }
                }
            });
    }]);