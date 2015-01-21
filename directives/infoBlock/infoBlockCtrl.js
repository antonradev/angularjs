'use strict';

angular.module('ngdirectives')
        .config(function ($stateProvider, stateFactory) {
            $stateProvider.state('index', stateFactory('Index', {
                url: '/'
            }));
        })
        .controller('IndexCtrl', function ($scope, $localStorage) {

            $scope.infoBlockData = [
                {
                    itemId: 1,
                    itemTitle: 'Title from controller scope',
                    itemContent: 'I am content displayed from the controller scope data',
                    itemUrl: '/lorem-ipsum',
                    itemIcon: 'fa-android'
                },
                {
                    itemId: 2,
                    itemTitle: 'I am from the Controller Data as well',
                    itemContent: 'Just a paragraph with Lorem ipsum content',
                    itemUrl: '/lorem2',
                    itemIcon: 'fa-user'
                },
                {
                    itemId: 3,
                    itemTitle: 'Hi from the Controller data',
                    itemContent: 'This is just another block with some data inside of it',
                    itemUrl: '/hi-controller',
                    itemIcon: 'fa-paper-plane'
                },
                {
                    itemId: 4,
                    itemTitle: 'And the winner is the Fourth box',
                    itemContent: 'Let me put just one more lorem ipsum paragraph here',
                    itemUrl: '/lorem3',
                    itemIcon: 'fa-line-chart'
                }
            ];

            // Default Local Storage values
            $scope.$storage = $localStorage.$default({
                markedItems: []
            });

            $scope.markedItems = $localStorage.markedItems;


        });
