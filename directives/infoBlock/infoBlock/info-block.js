'use strict';

angular.module('ngdirectives')
        .directive('infoBlock', function () {

            var _linkFn = function link(scope, element, attrs) {

                if (!attrs.blockUrl) {
                    element.find('h3').find('a').addClass('no-ui-sref');
                }


            };

            return {
                restrict: 'EA',
                templateUrl: 'scripts/directives/infoBlock/info-block.html',
                scope: {
                    blockTitle: '@',
                    blockContent: '@',
                    blockIcon: '@',
                    blockUrl: '@'
                },
                link: _linkFn
            };

        });
