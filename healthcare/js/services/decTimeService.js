(function() {
    'use strict';

    var decModule = angular.module('dec');

    decModule.constant('timeService', {
        currentTime: new Date(moment('3000-12-31')),
        yearFromStart: new Date(moment('1989-01-01'))
    });

}).call(angular);