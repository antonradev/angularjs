/**
 * @ngdoc directive
 * @name decHtml5Snippet
 * @restrict E
 * @param {Object} decSnippetData All the data coming from the data service/controller
 * @param {Object} contextMenuData Data and functionality for the right-click button context menu
 *
 * @description
 *
 * Display snippet box directive holding nested directive for the comments
 *
 * ## Example
 *
 * *HTML*
 * ```html
 *  <dec-html5-snippet dec-snippet-data="snippetData"
 *      context-menu-data="contextMenuData"></dec-html5-snippet>
 * ```
 */


(function (angular) {
    'use strict';

    angular.module('dec').directive('decHtml5Snippet', ['decHtml5DataService', 'I18N',
        'decHtml5UserPermissionsService', '$injector', '$filter','$q',
        '$sce', 'decHtml5CommentsDialog', 'decHtml5UserRoleService', 'decHtml5PermissionService',
        'AuditSupportCommandService', 'AuditSupportDialogService', 'HisVisibilitySettingsDialogService',
        'decHtml5VisibilitySettingsService', 'HisVisibilitySettingsService', 'decConf', 'timeService',
        function (decHtml5DataService, I18N, decHtml5UserPermissionsService, $injector, $filter,$q,
                  $sce, decHtml5CommentsDialog, decHtml5UserRoleService, decHtml5PermissionService,
                  AuditSupportCommandService, AuditSupportDialogService, HisVisibilitySettingsDialogService,
                  decHtml5VisibilitySettingsService, HisVisibilitySettingsService, decConf, timeService) {

            var _link = function (scope) {

                var searchCriteria = {};

                scope.decSnippetData = null; // object with snippet data will be filled later in data service call

                scope.addCommentHeading = null;

                scope.referenceDate = '';

                scope.snippetDateTooltip = function (reg, real) {

                    var labelReg  = I18N.translate('/g3/his/dec/decrsSettings.registration.label'),
                        labelReal = I18N.translate('/g3/his/dec/decrsSettings.realization.label'),
                        concatenate = [labelReg, ': ', reg.time, ' ', reg.date, '<br>', labelReal, ': ', real.time, ' ', real.date];

                    return concatenate.join('');

                }


                HisVisibilitySettingsService.getVisibilitySettings('/g3/his/dec/search/SnippetVisibilitySettings').then(function (savedSettings) {

                    if (!savedSettings || !savedSettings.criteria) {
                        var settings = decHtml5VisibilitySettingsService.getDefaultVisibilitySettings();
                        settings.associationRowId = savedSettings && savedSettings.associationRowId || null;
                        HisVisibilitySettingsService.setVisibilitySettings('/g3/his/dec/search/SnippetVisibilitySettings', settings);
                        savedSettings = settings;
                    }

                    scope.referenceDate = savedSettings.criteria.referenceDate;

                    scope.decSnippetDataSource = new ds.ProcedureDataSource($injector, '/g3/his/dec/search/DescrSearch.search')
                        .asCrud({
                            findRowProcedure: '/g3/his/dec/search/DescrSearch.search',
                            countProcedure  : '/g3/his/dec/search/DescrSearch.countEntries',
                            createProcedure : '/g3/his/dec/manipulate/DescrGateway.createEntry',
                            updateProcedure : '/g3/his/dec/manipulate/DescrGateway.editEntry',
                            deleteProcedure : '/g3/his/dec/manipulate/DescrGateway.deleteEntry',
                            schemaType      : '/g3/his/dec/manipulate/DescrGateway'
                        });

                    scope.decSnippetDataSource.idKey('entryId');


                    savedSettings.criteria.episodeId = scope.params.episodeKey;
                    savedSettings.criteria.orgUnitId = scope.params.orgUnitId;

                    searchCriteria = decHtml5VisibilitySettingsService.prepareSearchCriteria(savedSettings.criteria);

                    scope.decSnippetDataSource.paramsInterceptor({
                        fetch: function (params) {
                            params.criteria = searchCriteria;
                            return params;
                        },
                        count: function (params) {
                            params.criteria = searchCriteria;
                            return params;
                        }
                    });


                    scope.decSnippetDataSource.init().then(function () {
                        scope.decSnippetDataSource.refresh();
                    });

                    scope.decSnippetDataSource.observe('dataChanged', function () {
                        scope.decSnippetDataSource.init().then(function () {
                            scope.decSnippetDataSource.refresh().then(function () {
                                scope.decSnippetDataSource.rows().then(function (rows) {
                                        scope.decSnippetData = parseData(rows);
                                    }
                                );
                            });
                        });
                    });


                    function commentToDecComment(comment) {
                        return {
                            decId             : comment.id,
                            decShift          : $filter('decShift')(comment.systemDate),
                            decTimeReg        : $filter('decTime')(comment.systemDate),
                            decTimeReal       : $filter('decTime')(comment.actionDate),
                            decTimeUnFormatted: comment.systemDate,
                            decState          : $filter('decState')(comment.state),
                            decPriority       : $filter('decPriority')(comment.priority),
                            decSource         : comment.sourceLabels,
                            decGroupName      : comment.groupName,
                            decAuthorRoleName : comment.authorRoleName,
                            decAuthorFullName : comment.authorFullName,
                            decDeletionReason : $sce.trustAsHtml(comment.deletionReason),
                            decComment        : $sce.trustAsHtml(comment.information).toString(),
                            decPatientName    : comment.patientName,
                            decEpisodeId      : comment.episodeId,
                            authorId          : comment.authorId,
                            groupId           : comment.groupId,
                            state             : comment.state
                        }
                    }

                    //=============================================
                    // Parsing Snippet Comments Data
                    //=============================================
                    function parseData(rows) {

                        var tempDataObject = [];
                        var snippetGroupedData = {};

                        for (var i = 0; i < Object.keys(rows).length; i++) {
                            tempDataObject.push(commentToDecComment(rows[i]));
                        }


                        if (scope.params.orgUnitId) {

                            for (var ii = 0; ii < Object.keys(rows).length; ii++) {

                                var item = rows[ii];

                                if (!snippetGroupedData[item.episodeId]) {
                                    snippetGroupedData[item.episodeId] = {
                                        decEpisodeId: item.episodeId,
                                        decPatient: item.patientName,
                                        isExpanded: true,
                                        decTimeUnFormatted: item.systemDate,
                                        patientNameAndEpisodeId: item.patientName +
                                            ' (' +  item.episodeId + ')',
                                        items: []
                                    };
                                }

                                snippetGroupedData[item.episodeId].items.push(commentToDecComment(item));
                            }
                        }

                        if (scope.params.episodeKey) {
                            return tempDataObject;
                        }
                        if (scope.params.orgUnitId) {
                            return $filter('decOrderObjectBy')(snippetGroupedData);
                        }
                        else {
                            return tempDataObject;
                        }

                    }


                    //=============================================
                    // Loading Snippet Comments
                    //=============================================
                    function loadSnippetComments() {

                        scope.decSnippetDataSource.init().then(function () {
                            scope.snippetLoading = true;
                            scope.decSnippetDataSource.refresh().then(function () {

                                scope.decSnippetDataSource.rows().then(function (rows) {

                                    var event = {
                                        type: 'dataChanged',
                                        reason: 'filter',
                                        data: {},
                                        fullRefresh: true
                                    };

                                    scope.decSnippetDataSource.notify('dataChanged', [event]);

                                    scope.snippetLoading = false;
                                    scope.decSnippetData = parseData(rows);

                                });

                            });
                        });

                        if (scope.params.dataUpdated) {
                            scope.params.dataUpdated.call();
                        }

                    }


                    scope.$on('decReloadComments', function () {
                        loadSnippetComments();
                    });


                    //=============================================
                    // Getting Mock data for the Snippet
                    //=============================================
                    var loadMockSnippets = function () {
                        decHtml5DataService.getMockData({I18N: I18N})
                            .then(function (result) {
                                scope.decSnippetData = parseData(result);
                            });
                    };

                    //=============================================
                    // Shows Real Comments or Mock Snippet
                    //=============================================
                    if (scope.params.previewMode) {
                        loadMockSnippets();
                    }

                    //=============================================
                    // Context Menu Actions and Labels
                    //=============================================
                    $q.all([I18N.translate({
                        key: '/Button.add.label',
                        resultAsPromise: true
                    }), I18N.translate({
                        key: '/g3/his/dec/decrsSnippet.details.label',
                        resultAsPromise: true
                    })]).then(function () {

                        // I18n the context menu labels
                        var contextMenuLabels = {
                            edit: I18N.translate('/Button.edit.label'),
                            delete: I18N.translate('/Button.delete.label'),
                            details: I18N.translate('/g3/his/dec/decrsList.Details.label'),
                            history: I18N.translate('/g3/his/dec/decrsList.showHistoryTooltip.label')
                        };

                        scope.addCommentHeading = I18N.translate('/g3/his/dec/decrsDetails.add.label');


                        //=============================================
                        // Get Permissions
                        //=============================================
                        decHtml5UserRoleService.then(function (data) {
                            decHtml5PermissionService.user(data.employeeId);
                        });

                        scope.can = {
                            add: false,
                            view: false,
                            edit: {
                                own: false,
                                other: false
                            },
                            delete: {
                                own: false,
                                other: false
                            }
                        };

                        scope.snippetContextMenu = {
                            permissions: {}
                        };

                        decHtml5UserPermissionsService().then(function (access) {

                            scope.can.add = access[0];
                            scope.can.view = access[1];
                            scope.can.edit.own = access[2];
                            scope.can.edit.other = access[3];
                            scope.can.delete.own = access[4];
                            scope.can.delete.other = access[5];
                            scope.snippetContextMenu.permissions.add = scope.can.add;
                            scope.snippetContextMenu.permissions.view = scope.can.view;

                            if (scope.can.view) {
                                if (!scope.params.previewMode) {
                                    loadSnippetComments();
                                }

                                scope.snippetContextMenu.permissions.edit = true;
                                scope.snippetContextMenu.permissions.delete = true;
                                scope.snippetContextMenu.permissions.editShownState = (scope.can.edit.own || scope.can.edit.other);
                                scope.snippetContextMenu.permissions.deleteShownState = (scope.can.delete.own || scope.can.delete.other);
                            }

                            var actions = {
                                vis: {
                                    label: '/g3/his/htmlshell/Button.showVisibilitySettings.toolTip',
                                    icon: 'ico-outline-tb-show',
                                    enabled: !scope.params.previewMode,
                                    execute: function () {

                                        var defaults = decHtml5VisibilitySettingsService.getDefaultVisibilitySettings({
                                            snippet: true
                                        });

                                        HisVisibilitySettingsDialogService.showVisibilitySettingsDialog(
                                            scope,
                                            '/g3/his/dec/search/SnippetVisibilitySettings',
                                            scope.applyVisibilitySettings,
                                            scope.beforeVisibilitySettingsSave,
                                            modules.resolvePath('dec-html5-client', 'features/dec/views/settings/visibilitySettingsModal.html'),
                                            defaults
                                        );

                                    }
                                }
                            };


                            scope.beforeVisibilitySettingsSave = decHtml5VisibilitySettingsService.handleBeforeSaveActions;

                            scope.applyVisibilitySettings = function() {

                                if (scope.visibilitySettingsData.criteria.dates.intervalStart === null) {
                                    scope.visibilitySettingsData.criteria.dates.intervalStart = timeService.yearFromStart;
                                }

                                if (scope.visibilitySettingsData.criteria.dates.intervalEnd === null) {
                                    scope.visibilitySettingsData.criteria.dates.intervalEnd = timeService.currentTime;
                                }

                                if (_.has(scope.visibilitySettingsData.criteria, 'realGroups') && _.isArray(scope.visibilitySettingsData.criteria.realGroups)) {
                                    scope.visibilitySettingsData.criteria.groups = scope.visibilitySettingsData.criteria.realGroups;
                                    delete scope.visibilitySettingsData.criteria.realGroups;
                                }

                                reloadSnippetData(scope.visibilitySettingsData);

                            };

                            scope.$on('visibilitySettingsChanged', function(event, data) {
                                scope.visibilitySettingsData = data;
                            });


                            function reloadSnippetData(data){

                                scope.referenceDate = data.criteria.referenceDate;

                                data.criteria.episodeId = scope.params.episodeKey;
                                data.criteria.orgUnitId = scope.params.orgUnitId;

                                searchCriteria = decHtml5VisibilitySettingsService.prepareSearchCriteria(data.criteria);

                                if (searchCriteria.referenceDate === 'REGISTRATION_DATE') {
                                    scope.decSnippetDataSource.sort({
                                        sortConditions: [{ elementName: 'systemDate', ordering: 'ASCENDING', caseSensitive: true }]
                                    });
                                }

                                if (searchCriteria.referenceDate === 'ACTION_DATE') {
                                    scope.decSnippetDataSource.sort({
                                        sortConditions: [{ elementName: 'actionDate', ordering: 'ASCENDING', caseSensitive: true }]
                                    });
                                }

                                loadSnippetComments();

                            }


                            if ( scope.can.add ) {

                                actions.add = {
                                    label: '/g3/his/dec/decrsList.addComment.label',
                                    icon: 'ico-outline-tb-plus',
                                    enabled: isAddIconEnabled,
                                    execute: function () {

                                        var newScope = scope.$new(false, scope.$parent);
                                        newScope.episodeKey = scope.params.episodeKey;
                                        newScope.orgUnitId = scope.params.orgUnitId;

                                        newScope.createMode    = true;
                                        newScope.commentSource = scope.decSnippetDataSource;
                                        decHtml5CommentsDialog
                                            .commentDialog({
                                                scope: newScope,
                                                title: scope.addCommentHeading
                                            }).then(function (refresh) {
                                                if (refresh === true) {
                                                    scope.$emit('decReloadComments');
                                                }
                                            });
                                    }
                                }

                            }

                            //if we have been passed initParent function means interactions between snippet and parent container
                            //is enabled so we pass initObject based on convention
                            if (scope.params.initParent) {
                                scope.params.initParent({
                                    actions: actions,
                                    refreshFn: loadSnippetComments
                                });
                            }

                        });


                        scope.contextMenuActions = function (commentProperties) {

                            var menuItems,
                                deleteSpliceIndex = 1;

                            if (scope.params.previewMode) {
                                return [];
                            }

                            scope.snippetContextMenu.permissions.delete = decHtml5PermissionService.check(commentProperties, {
                                other: scope.can.delete.other,
                                own:   scope.can.delete.own
                            });
                            scope.snippetContextMenu.permissions.edit = decHtml5PermissionService.check(commentProperties, {
                                other: scope.can.edit.other,
                                own:   scope.can.edit.own
                            });

                            menuItems = [
                                {
                                    label: contextMenuLabels.edit,
                                    action: scope.editComment,
                                    actionArgs: commentProperties,
                                    disabled: !scope.snippetContextMenu.permissions.edit
                                },
                                {
                                    label: contextMenuLabels.delete,
                                    action: scope.deleteComment,
                                    actionArgs: commentProperties,
                                    disabled: !scope.snippetContextMenu.permissions.delete
                                },
                                {
                                    label: contextMenuLabels.details,
                                    action: scope.openCommentDetails,
                                    actionArgs: '',
                                    disabled: true
                                },
                                {
                                    label: contextMenuLabels.history,
                                    action: scope.history,
                                    actionArgs: commentProperties
                                }
                            ];

                            if ( !scope.snippetContextMenu.permissions.editShownState ) {
                                menuItems.splice(0, 1);
                                deleteSpliceIndex = 0;
                            }

                            if ( !scope.snippetContextMenu.permissions.deleteShownState ) {
                                menuItems.splice(deleteSpliceIndex, 1);
                            }

                            return menuItems;

                        };


                        //=============================================
                        // Snippet Actions buttons
                        //=============================================
                        var isAddIconEnabled = null;

                        if (scope.params.previewMode) {
                            isAddIconEnabled = false;
                        }
                        else {
                            isAddIconEnabled = !scope.can.add;
                        }

                    }); // End of I18N.translate().then() function


                    //=============================================
                    // History Window
                    //=============================================
                    scope.history = function (_scope, args) {

                        var command = AuditSupportCommandService.createCommand(_scope, function () {

                            var component = '/g3/his/dec/audittrail/AuditTrailService',
                                procedure = 'getAuditTrailForEntrySnapshot',
                                params    = { entryId: args.decId};

                            AuditSupportDialogService.showHistory(_scope, component, procedure, params);

                        });

                        command.__execute();

                    };

                    //=============================================
                    // Edit Comment
                    //=============================================
                    scope.editComment = function (_scope, args) {

                        var doubleClickCommentData = null,
                            _commentRow;

                        if (arguments[0].decId) {
                            if (arguments[0].decState.style === 'delete') {
                                return;
                            }
                            doubleClickCommentData = arguments[0];
                        }

                        _commentRow = doubleClickCommentData || args;

                        scope.doubleClickPermisionsForEdit = decHtml5PermissionService.check(_commentRow, {
                            other: scope.can.edit.other,
                            own: scope.can.edit.own
                        });

                        if (scope.params.previewMode || !scope.doubleClickPermisionsForEdit) {
                            return;
                        }


                        var newScope = scope.$new(false, scope.$parent);
                        newScope.episodeKey = scope.params.episodeKey;
                        newScope.orgUnitId = scope.params.orgUnitId;
                        newScope.commentData = args || doubleClickCommentData;

                        if (doubleClickCommentData === undefined || doubleClickCommentData === null) {
                            newScope.entryId = args.decId;
                        }
                        else {
                            newScope.entryId = doubleClickCommentData.decId
                        }
                        newScope.editMode = true;
                        newScope.commentSource = scope.decSnippetDataSource;

                        var editOptions = {
                            scope: newScope,
                            title: I18N.translate('/g3/his/dec/decrsDetails.edit.label')
                        };

                        decHtml5CommentsDialog.commentDialog(editOptions);

                    };

                    //=============================================
                    // Deleting Comment
                    //=============================================
                    scope.deleteComment = function (_scope, args) {

                        if (scope.params.previewMode) {
                            return;
                        }

                        decHtml5CommentsDialog
                            .deleteDialog().then(function (result) {

                                if (result === 'yes') {

                                    scope.decSnippetDataSource.delete({
                                        entryId: args.decId,
                                        reason: ''
                                    }).then(function () {

                                        scope.decSnippetDataSource.refresh();

                                        scope.$broadcast('decReloadComments');
                                        scope.$emit('decReloadComments');

                                    });

                                }

                            });

                    };

                });


            };

            return {
                restrict: 'EA',
                templateUrl: modules.resolvePath('dec-html5-client',
                    'features/dec/views/snippet/decHtml5SnippetDirective.html'),
                scope: {
                    'params': '='
                },
                link: _link
            };

        }]);

})(angular);