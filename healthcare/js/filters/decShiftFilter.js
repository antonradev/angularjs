/**
 * @ngdoc filter
 * @name decShift
 *
 * @description
 *
 * Shift Filter
 *
 * ### Usage
 * ```javascript
 *
 * var filtered = $filter('decShift')(value),
 *     style = filtered.style,
 *     title = filtered.title;
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .filter('decShift', ['I18N', function (I18N) {

            var dayShift   = { from: 5, to: 18 },
                styleDay   = 'day',
                styleNight = 'night',
                decShifts  = {
                    day  : I18N.translate('/g3/his/cam/dbenums.DAY_SHIFT.label'),
                    night: I18N.translate('/g3/his/cam/dbenums.NIGHT_SHIFT.label')
                };

            return function (value) {

                var decTimeMoment = moment(value || new Date()),
                    decShiftHour  = parseInt(decTimeMoment.format('HH')),
                    decShiftStyle = decShiftHour > dayShift.from && decShiftHour < dayShift.to ? styleDay : styleNight,
                    decShiftTitle = decShifts[decShiftStyle];

                return {
                    style: decShiftStyle,
                    title: decShiftTitle
                };

            };

        }]);

})(angular);