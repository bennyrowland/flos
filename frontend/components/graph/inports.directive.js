/**
 * Created by ben on 21/01/16.
 */
angular.module('graph')
    .directive('inports', ['$httpParamSerializer', function ($httpParamSerializer) {
        var link = function (scope, element, attrs) {
            scope.$watch('inportList', function () {

                // do nothing if the list doesn't exist
                if (scope.inportList === undefined) {
                    return;
                }

                // inportList has changed, have to update parameterValues accordingly
                // the list might have just been modified, so we want to keep any parameters
                // which were in the old list and still in the new list

                var newParams = {};
                for (var i = 0; i < scope.inportList.length; i++) {
                    inport = scope.inportList[i];
                    if (scope.parameterValues.hasOwnProperty(inport.name)) {
                        newParams[inport.name] = scope.parameterValues[inport.name];
                    }
                    else {
                        newParams[inport.name] = undefined;
                    }
                }
                scope.parameterValues = newParams;
            });

            scope.parameterValues = {
                //separator: "\n",
                source: "/home/ben/Documents/dal makhani.txt"
            };
        };
        return {
            restrict: 'E',
            scope: {
                inportList: '=',
                parameterValues: '='
            },
            link: link,
            templateUrl: 'components/graph/inports.template.html'
        };
    }]);