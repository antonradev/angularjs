/**
 * @ngdoc service
 * @name decHtml5DataService
 * @description
 *
 * Contains data for the snippet

 */
(function (angular) {
    'use strict';

    angular
        .module('dec')
        .factory('decHtml5DataService', ['$rootScope', '$q', 'Component', '$filter',
            function ($rootScope, $q, Component, $filter) {

                var decSearch = Component.get('/g3/his/dec/search/DecrsSearch'),
                    decGateway = Component.get('/g3/his/dec/manipulate/DecrsGateway');

                var postProcess = function (data, params) {

                    var I18N = params.I18N,

                        formatFull = 'YYYY/MM/DD HH:mm', // TODO: must be taken from the api, atm we do not have presented one
                        dateToday = moment(),
                        labelToday = 'Today',
                        labelDay = 'day',
                        labelNight = 'night',
                        dayShift = { from: 5, to: 18 },
                        decShifts = {
                            day: I18N.translate('/g3/his/dec/decrsShift.DAY_SHIFT.label'),
                            night: I18N.translate('/g3/his/dec/decrsShift.NIGHT_SHIFT.label')
                        },
                        decStates = {
                            styles: {
                                ADDED: '',
                                MODIFIED: 'edit',
                                DELETED: 'delete'
                            },
                            labels: {
                                ADDED: 'Added',
                                MODIFIED: 'Modified',
                                DELETED: 'Deleted'
                            }
                        },
                        decPriorities = {
                            styles: {
                                ATTENTION: 'high',
                                VERY_IMPORTANT: 'highest'
                            },
                            labels: {
                                NORMAL: I18N.translate('/g3/his/dec/priority.NORMAL.label'),
                                ATTENTION: I18N.translate('/g3/his/dec/priority.ATTENTION.label'),
                                VERY_IMPORTANT: I18N.translate('/g3/his/dec/priority.VERY_IMPORTANT.label')
                            }

                        };

                    var temp = [];

                    angular.forEach(data, function (item) {


                        var decId = item.hasOwnProperty('id') ? item.id : '',
                            decMomentReg = moment(item.hasOwnProperty('systemDate') ? item.systemDate : false),
                            decTimeReg = $filter('date')(item.systemDate, 'shortTime'),
                            decDateReg = decMomentReg.isSame(dateToday, 'day') ? labelToday : $filter('date')(item.systemDate, 'shortDate'),
                            decTimeRegVal = decMomentReg.format(formatFull),
                            decHour = parseInt(decMomentReg.format('HH')),
                            decShift = decHour > dayShift.from && decHour < dayShift.to ? labelDay : labelNight,
                            decShiftVal = decShifts[decShift],
                            decMomentReal = moment(item.hasOwnProperty('actionDate') ? item.actionDate : false),
                            decTimeReal = $filter('date')(item.actionDate, 'shortTime'),
                            decDateReal = decMomentReal.isSame(dateToday, 'day') ? labelToday : $filter('date')(item.actionDate, 'shortDate'),
                            decTimeRealVal = decMomentReal.format(formatFull),
                            hasState = item.hasOwnProperty('state'),
                            decState = hasState && decStates.styles.hasOwnProperty(item.state) ? decStates.styles[item.state] : '',
                            decStateVal = hasState && decStates.labels.hasOwnProperty(item.state) ? decStates.labels[item.state] : '',
                            decDeletion = item.hasOwnProperty('deletionReason') && item.deletionReason ? item.deletionReason : '',
                            hasPriority = item.hasOwnProperty('priority'),
                            decPriority = hasPriority && decPriorities.styles.hasOwnProperty(item.priority) ? decPriorities.styles[item.priority] : '',
                            decPriorityVal = hasPriority && decPriorities.labels.hasOwnProperty(item.priority) ? decPriorities.labels[item.priority] : '',
                            decComment = item.hasOwnProperty('information') ? item.information.replace(/<(?:.|\n)*?>/gm, '') : '',
                            decSource = item.hasOwnProperty('sourceId') ? item.sourceLabels : '',
                            decGroup = item.hasOwnProperty('groupName') ? item.groupName : '',
                            decAuthor = item.hasOwnProperty('authorFullName') ? item.authorFullName : '',
                            decRole = item.hasOwnProperty('authorRoleName') ? item.authorRoleName : '',
                            decPatient = item.hasOwnProperty('patientFullName') ? item.patientFullName : 'Robert Parson';

                        temp.push({
                            decId: decId,
                            decShift: decShift,
                            decShiftVal: decShiftVal,
                            decTimeReg: decTimeReg,
                            decDateReg: decDateReg,
                            decTimeRegVal: decTimeRegVal,
                            decTimeReal: decTimeReal,
                            decDateReal: decDateReal,
                            decTimeRealVal: decTimeRealVal,
                            decState: decState,
                            decStateVal: decStateVal,
                            decDeletion: decDeletion,
                            decPriority: decPriority,
                            decPriorityVal: decPriorityVal,
                            decComment: decComment,
                            decSource: decSource,
                            decGroup: decGroup,
                            decAuthor: decAuthor,
                            decRole: decRole,
                            decPatient: decPatient
                        });

                    });
                    return temp;
                };

                return {

                    get: function (params) {
                        var deferred = $q.defer(),
                            criteria = {
                                includeDeleted: true
                            };

                        if (params.criteria.episodeId) {
                            criteria.episodeId = params.criteria.episodeId;
                        } else {
                            criteria.orgUnitId = params.criteria.orgUnitId;
                        }

                        decSearch.$invoke('search', { criteria: criteria })
                            .success(function (data) {
                                deferred.resolve(postProcess(data, params));
                            })
                            .error(function (error) {

                                deferred.reject(error);

                            });

                        return deferred.promise;

                    },

                    /**
                     * @ngdoc method
                     * @name decHtml5DataService#addComment
                     * @param {object} params Needed parameters for the API call {episodeId: , information: , priority: , actionDateTime: , groupId: }
                     * @return {Promise} (Optional) A promise returns the resolved data after the inserted comment record
                     *
                     * @description
                     *
                     * Creates new comment record in the Decrs comments list
                     *
                     * ### Usage
                     * ```javascript
                     *
                     * decHtml5DataService.addComment({
                     *
                     *       episodeId: $scope.episodeId,
                     *       information: $scope.addCommentModelData.comment,
                     *       priority: $scope.addCommentModelData.selectedPriority.id,
                     *       actionDateTime: nowDateTime,
                     *       groupId: '000000000000000000',
                     *       source: {
                     *           labels: ['Something unknown here', 'some source label'],
                     *           type: 'A-Type', id: '111222333444'
                     *       }
                     *
                     *   }).then(function (result) {
                     *       $scope.receivedData = result;
                     *   });
                     *
                     * ```
                     */
                    addComment: function (params) {

                        var deferred = $q.defer();


                        decGateway.$invoke('createEntry', { command: params })
                            .success(function (data) {
                                deferred.resolve(data);
                            })
                            .error(function (data) {
                                //console.log(data);
                                deferred.reject(data);
                            });

                        return deferred.promise;

                    },

                    /**
                     * @ngdoc method
                     * @name decHtml5DataService#editComment
                     * @param {object} params Needed parameters for the API call {episodeId: , entryId: , information: , priority:, actionDateTime: }
                     * @return {Promise} (Optional) A promise returns the resolved data after the inserted comment record
                     *
                     * @description
                     *
                     * Edits existing comment record in the Decrs comments list
                     *
                     * ### Usage
                     * ```javascript
                     *
                     * decHtml5DataService.editComment({
                     *
                     *       entryId: $scope.entryId,
                     *       episodeId: $scope.episodeId,
                     *       information: $scope.informationField',
                     *       priority: $scope.addCommentModelData.selectedPriority.id,
                     *       actionDateTime: nowDateTime
                     *
                     *   }).then(function (result) {
                     *       $scope.receivedData = result;
                     *   });
                     *
                     * ```
                     */
                    editComment: function (params) {

                        var deferred = $q.defer();

                        decGateway
                            .$invoke('editEntry', { command: params })
                            .success(function (data) {
                                deferred.resolve(data);
                            })
                            .error(function (data) {
                                //console.log(data);
                                deferred.reject(data);
                            });

                        return deferred.promise;

                    },


                    /**
                     * @ngdoc method
                     * @name decHtml5DataService#deleteComment
                     * @param {object} params Needed parameters for the API call {entryId:}
                     * @return {Promise} (Optional) A promise returns the resolved data after the inserted comment record
                     *
                     * @description
                     *
                     * Edits existing comment record in the Decrs comments list
                     *
                     * ### Usage
                     * ```javascript
                     *
                     * decHtml5DataService.deleteComment({
                     *
                     *       entryId: $scope.entryId
                     *
                     *   }).then(function (result) {
                     *       $scope.receivedData = result;
                     *   });
                     *
                     */
                    deleteComment: function (params) {

                        var deferred = $q.defer();

                        decGateway
                            .$invoke('deleteEntry', { command: params })
                            .success(function (data) {
                                deferred.resolve(data);
                            })
                            .error(function (data) {
                                deferred.reject(data);
                            });

                        return deferred.promise;

                    },

                    set: function (data) {

                        var deferred = $q.defer();

                        deferred.resolve(data);

                        return deferred.promise;

                    },

                    del: function (data) {

                        var deferred = $q.defer();

                        deferred.resolve(data);

                        return deferred.promise;

                    },

                    /**
                     * @ngdoc method
                     * @name decHtml5DataService#getMockData
                     * @param {object} params Needed parameters for the API call {episodeId: , information: , priority: , actionDateTime: , groupId: }
                     * @return {Promise} A promise returns the resolved data
                     *
                     * @description
                     *
                     * Creates new comment record in the Decrs comments list
                     *
                     * ### Usage
                     * ```javascript
                     *
                     * decHtml5DataService.addComment({
                     *
                     *       episodeId: $scope.episodeId,
                     *       information: $scope.addCommentModelData.comment,
                     *       priority: $scope.addCommentModelData.selectedPriority.id,
                     *       actionDateTime: nowDateTime,
                     *       groupId: '000000000000000000',
                     *       source: {
                     *           labels: ['Something unknown here', 'some source label'],
                     *           type: 'A-Type', id: '111222333444'
                     *       }
                     *
                     *   }).then(function (result) {
                     *       $scope.receivedData = result;
                     *   });
                     *
                     * ```
                     */
                    getMockData: function () {
                        var deferred = $q.defer();

                        decSearch.$invoke('getEntriesForSnippetPreviewMode', {})
                            .success(function (data) {
                                // deferred.resolve(postProcess(data, params));
                                deferred.resolve(data);
                            })
                            .error(function (error) {
                                deferred.reject(error);
                            });

                        return deferred.promise;

                    }


                };

            }]);

})(angular);