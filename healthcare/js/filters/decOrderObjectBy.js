/**
 * @ngdoc filter
 * @name decOrderObjectBy
 *
 * @description
 *
 * Shift Filter
 *
 * ### Usage
 * ```javascript
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .filter('decOrderObjectBy', [function () {

            return function(input, attribute) {
                if (!angular.isObject(input)) {
                    return input;
                }

                var array = [];
                for (var objectKey in input) {
                    array.push(input[objectKey]);
                }

                array.sort(function(a, b){
                    a = parseInt(a[attribute]);
                    b = parseInt(b[attribute]);
                    return a - b;
                });

                return array;
            };

        }]);

})(angular);