/**
 * @ngdoc filter
 * @name decText
 *
 * @description
 *
 * Text Filter
 *
 * ### Usage
 * ```javascript
 *
 * var filteredText = $filter('decText')(value);
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .filter('decText', function () {

            return function (value) {

                return (value || '').replace(/<(?:.|\n)*?>/gm, '');

            }

        });

})(angular);