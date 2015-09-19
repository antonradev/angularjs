/**
 * @ngdoc filter
 * @name decState
 *
 * @description
 *
 * State Filter
 *
 * ### Usage
 * ```javascript
 *
 * var filtered = $filter('decState')(value),
 *     style = filtered.style,
 *     title = filtered.title;
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .filter('decState', ['I18N', function(I18N) {

            var decStates = {
                    styles: {
                        ADDED   : '',
                        MODIFIED: 'edit',
                        DELETED : 'delete'
                    },
                    titles: {
                        ADDED   : I18N.translate('/g3/his/dec/decrsList.decStateAdded.label'),
                        MODIFIED: I18N.translate('/g3/his/dec/decrsList.decStateModified.label'),
                        DELETED : I18N.translate('/g3/his/dec/decrsList.decStateDeleted.label')
                    }
                };

            return function (value) {

                var stateStyle = decStates.styles.hasOwnProperty(value) ? decStates.styles[value] : '',
                    stateTitle = decStates.titles.hasOwnProperty(value) ? decStates.titles[value] : '';

                return {
                    style: stateStyle,
                    title: stateTitle
                };

            };

        }]);

})(angular);