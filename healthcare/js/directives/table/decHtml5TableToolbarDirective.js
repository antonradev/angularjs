/**
 * @ngdoc directive
 * @name decHtml5TableToolbar
 * @element dec-html5-table-toolbar
 * @restrict E
 * @templateUrl features/dec/views/table/decHtml5TableToolbarDirective.html
 * @controller decHtml5TableToolbarController
 * @require ^decHtml5Dispatcher
 *
 * @description
 *
 * Display toolbar with action buttons above the table
 *
 * @example
 *
 * <dec-html5-table-toolbar></dec-html5-table-toolbar>
 *
 */


(function (angular) {
    'use strict';

    angular
        .module('dec')

        .directive('decHtml5TableToolbar', function () {

            return {
                restrict: 'E',
                templateUrl: modules.resolvePath('dec-html5-client', 'features/dec/views/table/decHtml5TableToolbarDirective.html'),
                controller: 'decHtml5TableToolbarController'
            };

        });

})(angular);
