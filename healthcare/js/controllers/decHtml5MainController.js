/**
 * @ngdoc controller
 * @name decHtml5MainController
 *
 * @description
 *
 * HTML5 Main Controller
 *
 * **Note:** load data source, handle route params
 *
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .controller('decHtml5MainController', ['$scope', 'hxRouteParams', '$injector', 'HisVisibilitySettingsService', 'decHtml5VisibilitySettingsService',
            function ($scope, hxRouteParams, $injector, HisVisibilitySettingsService, decHtml5VisibilitySettingsService) {

                var searchCriteria = {};

                $scope.episodeKey = hxRouteParams.episodeKey;
                $scope.orgUnitId  = hxRouteParams.orgUnitId;

                HisVisibilitySettingsService.getVisibilitySettings('/g3/his/dec/search/VisibilitySettings').then(function (savedSettings) {

                    if (!savedSettings || !savedSettings.criteria) {
                        var settings = decHtml5VisibilitySettingsService.getDefaultVisibilitySettings();
                        settings.associationRowId = savedSettings && savedSettings.associationRowId || null;
                        HisVisibilitySettingsService.setVisibilitySettings('/g3/his/dec/search/VisibilitySettings', settings);
                        savedSettings = settings;
                    }

                    $scope.commentSource = new helix.ds.ProcedureDataSource($injector, '/g3/his/dec/search/DecursusSearch.search')
                        .asCrud({
                            findRowProcedure: '/g3/his/dec/search/DecursusSearch.search',
                            countProcedure  : '/g3/his/dec/search/DecursusSearch.countEntries',
                            createProcedure : '/g3/his/dec/manipulate/DecursusGateway.createEntry',
                            updateProcedure : '/g3/his/dec/manipulate/DecursusGateway.editEntry',
                            deleteProcedure : '/g3/his/dec/manipulate/DecursusGateway.deleteEntry',
                            schemaType      : '/g3/his/dec/manipulate/DecursusGateway'
                        });

                    $scope.commentSource.idKey('entryId');

                    savedSettings.criteria.episodeId = $scope.episodeKey;
                    savedSettings.criteria.orgUnitId = $scope.orgUnitId;

                    searchCriteria = decHtml5VisibilitySettingsService.prepareSearchCriteria(savedSettings.criteria);

                    $scope.commentSource.paramsInterceptor({
                        fetch: function (params) {
                            params.criteria = searchCriteria;
                            return params;
                        },
                        count: function (params) {
                            params.criteria = searchCriteria;
                            return params;
                        }
                    });

                    $scope.commentSource.observe('dataChanged', function() {

                        setTimeout(function() {
                            adjustTableRowHeight();
                        }, 300);

                    });

                });


                $scope.$on('decVisibilityChange', function (event, data) {

                    data.criteria.episodeId = $scope.episodeKey;
                    data.criteria.orgUnitId = $scope.orgUnitId;

                    searchCriteria = decHtml5VisibilitySettingsService.prepareSearchCriteria(data.criteria);

                    if (searchCriteria.referenceDate === 'REGISTRATION_DATE') {
                        $scope.commentSource.sort({
                            sortConditions: [{ elementName: 'systemDate', ordering: 'ASCENDING', caseSensitive: true }]
                        });
                    }

                    if (searchCriteria.referenceDate === 'ACTION_DATE') {
                        $scope.commentSource.sort({
                            sortConditions: [{ elementName: 'actionDate', ordering: 'ASCENDING', caseSensitive: true }]
                        });
                    }

                    $scope.$emit('decReloadComments');

                });


                $scope.$on('decReloadComments', function () {

                    if ($scope.commentSource && $scope.commentSource._executors.fetch) {
                        $scope.commentSource.refresh().then(function () {
                                $scope.commentSource.rows().then(function () {

                                    var event = {
                                        type: 'dataChanged',
                                        reason: 'filter',
                                        data: {},
                                        fullRefresh: true
                                    };

                                    $scope.commentSource.notify('dataChanged', [event]);

                                    adjustTableRowHeight();

                                });

                        });
                    }
                });

                $(window).resize(function () {
                    setTimeout(function() {
                        adjustTableRowHeight();
                    }, 300);
                }).resize();

                function adjustTableRowHeight() {

                    $('.dec-html5-table-priority', '#decTable').each(function () {

                        $(this).height($(this).parent().height());

                    });
                }


            }]);

})(angular);
