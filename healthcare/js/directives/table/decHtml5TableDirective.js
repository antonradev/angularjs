/**
 * @ngdoc directive
 * @name decHtml5Table
 * @element dec-html5-table
 * @restrict E
 * @templateUrl features/dec/views/table/decHtml5TableDirective.html
 * @controller decHtml5TableController
 *
 * @description
 *
 * HTML5 Table Component
 *
 *
 * @example
 *
 * <dec-html5-table></dec-html5-table>
 *
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .directive('decHtml5Table', function () {

            return {
                restrict: 'E',
                templateUrl: modules.resolvePath('dec-html5-client', 'features/dec/views/table/decHtml5TableDirective.html'),
                controller: 'decHtml5TableController'
            };

        });

})(angular);