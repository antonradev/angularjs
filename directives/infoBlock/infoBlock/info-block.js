'use strict';

angular.module('ngdirectives')
        .directive('infoBlock', function ($localStorage) {

            var _linkFn = function link(scope, element, attrs) {

                if (!attrs.blockUrl) {
                    element.find('h3').find('a').addClass('no-ui-sref');
                }

                element.find('.mark-block').click(function () {
                    if ($localStorage.markedItems.indexOf(scope.blockid) === -1) {
                        $localStorage.markedItems.push(parseInt(scope.blockid));
                        element.addClass('block-is-marked');
                        scope.$apply();
                    }
                    this.remove();
                });

                // It's outside of the directive scope and the function is not called from the directive
                scope.$parent.clearItem = function (id) {

                    var i = $localStorage.markedItems.indexOf(id);
                    if (i !== -1) {
                        $localStorage.markedItems.splice(i, 1);
                    }
                };


            };

            return {
                restrict: 'EA',
                templateUrl: '/scripts/directives/infoBlock/info-block.html',
                scope: {
                    blockid: '@',
                    blockTitle: '@',
                    blockContent: '@',
                    blockIcon: '@',
                    blockUrl: '@'
                },
                link: _linkFn
            };

        });
