/**
 * @ngdoc filter
 * @name decTime
 *
 * @description
 *
 * Time Filter
 *
 *  **Note:** return 'Today' as a string label
 *
 * ### Usage
 * ```javascript
 *
 * var filtered = $filter('decTime')(value),
 *     time = filtered.time,
 *     date = filtered.date;
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .filter('decTime', function (dateFilter, I18N) {

            var momentToday = moment(),
                labelToday  = I18N.translate('/controls/DateField.today.label'),
                formatTime  = 'shortTime',
                formatDate  = 'shortDate';

            return function (value) {

                var momentValue   = moment(value),
                    formattedDate = momentValue.isSame(momentToday, 'day') ? labelToday : dateFilter(momentValue, formatDate),
                    formattedTime = dateFilter(momentValue, formatTime);

                return {
                    time: formattedTime,
                    date: formattedDate
                };

            }

        });

})(angular);