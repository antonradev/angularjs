/**
 * @ngdoc filter
 * @name decPriority
 *
 * @description
 *
 * Priority Filter
 *
 * ### Usage
 * ```javascript
 *
 * var filtered = $filter('decPriority')(value),
 *     style = filtered.style,
 *     title = filtered.title;
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .filter('decPriority', ['I18N', function (I18N) {

            var decPriorities = {
                    styles: {
                        NORMAL        : '',
                        ATTENTION     : 'high',
                        VERY_IMPORTANT: 'highest'
                    },
                    titles: {
                        NORMAL        : I18N.translate('/g3/his/dec/priority.NORMAL.label'),
                        ATTENTION     : I18N.translate('/g3/his/dec/priority.ATTENTION.label'),
                        VERY_IMPORTANT: I18N.translate('/g3/his/dec/priority.VERY_IMPORTANT.label')
                    }

                };

            return function (value) {

                var decPriorityStyle = decPriorities.styles.hasOwnProperty(value) ? decPriorities.styles[value] : '',
                    decPriorityTitle = decPriorities.titles.hasOwnProperty(value) ? decPriorities.titles[value] : '';

                return {
                    style: decPriorityStyle,
                    title: decPriorityTitle
                };

            };

        }]);

})(angular);