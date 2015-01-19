'use strict';

angular.module('ngdirectives')
        .config(function ($stateProvider, stateFactory) {
            $stateProvider.state('index', stateFactory('Index', {
                url: '/'
            }));
        })
        .controller('IndexCtrl', function ($scope) {

            $scope.infoBlockData = [
                {
                    itemTitle: 'Title from controller scope',
                    itemContent: 'I am content displayed from the controller scope data',
                    itemUrl: '/lorem-ipsum',
                    itemIcon: 'fa-android'
                },
                {
                    itemTitle: 'I am from the Controller Data as well',
                    itemContent: 'Just a paragraph with Lorem ipsum content',
                    itemUrl: '/lorem2',
                    itemIcon: 'fa-user'
                }
            ];

        });
