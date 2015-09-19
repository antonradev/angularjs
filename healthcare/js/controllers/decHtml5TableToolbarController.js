/**
 * @ngdoc controller
 * @name decHtml5TableToolbarController
 *
 * @description
 *
 * HTML5 Table Toolbar Controller
 *
 * **Note:** handle toolbar actions and events, restrict permissions
 *
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')
        .controller('decHtml5TableToolbarController', ['$scope', 'Dialog', 'I18N', 'Command',
            'decHtml5UserRoleService', 'decHtml5UserPermissionsService',  'decHtml5CommentsDialog', 'AuditSupportCommandService','AuditSupportDialogService',
            'decHtml5PermissionService', 'decHtml5VisibilitySettingsService', 'timeService', '$q',

            function($scope, Dialog, I18N, Command, decHtml5UserRoleService,
                     decHtml5UserPermissionsService, decHtml5CommentsDialog, AuditSupportCommandService, AuditSupportDialogService,
                     decHtml5PermissionService, decHtml5VisibilitySettingsService, timeService, $q) {

                $scope.defaultEpisodeEventVisibilitySettings = decHtml5VisibilitySettingsService.getDefaultSettings;

                $scope.beforeVisibilitySettingsSave = decHtml5VisibilitySettingsService.handleBeforeSaveActions;

                $scope.applyVisibilitySettings = function() {
                    if ($scope.visibilitySettingsData.criteria.dates.intervalStart === null) {
                        $scope.visibilitySettingsData.criteria.dates.intervalStart = timeService.yearFromStart;
                    }

                    if ($scope.visibilitySettingsData.criteria.dates.intervalEnd === null) {
                        $scope.visibilitySettingsData.criteria.dates.intervalEnd = timeService.currentTime;
                    }

                    if (_.has($scope.visibilitySettingsData.criteria, 'realGroups') && _.isArray($scope.visibilitySettingsData.criteria.realGroups)) {
                        $scope.visibilitySettingsData.criteria.groups = $scope.visibilitySettingsData.criteria.realGroups;
                        delete $scope.visibilitySettingsData.criteria.realGroups;
                    }

                    $scope.$emit('decVisibilityChange', $scope.visibilitySettingsData);
                };

                $scope.$on('visibilitySettingsChanged', function(event, data) {
                    $scope.visibilitySettingsData = data;
                });


                $scope.toolbarActions = {

                    add: function () {

                        var newScope           = $scope.$new(false, $scope.$parent);

                        newScope.createMode    = true;
                        newScope.episodeKey    = $scope.episodeKey;
                        newScope.orgUnitId     = $scope.orgUnitId;
                        newScope.commentSource = $scope.commentSource;

                        var options = {
                            type : 'add',
                            scope: newScope
                        };

                        decHtml5CommentsDialog
                            .commentDialog(options).then(function () {

                                $('#decMainFeature:visible .jqx-grid').jqxGrid('selectrow', 0);

                                $scope.disableActionButtons();
                            });

                    },

                    edit: function (row) {

                        if( !$scope.actionButtons.edit && !$scope.contextButtons.edit ) {
                            return;
                        }

                        var newScope         = $scope.$new(false, $scope.$parent),
                            selectedRow      = row && row.uid ? row : $scope.selectedRow.left;

                        newScope.editMode    = true;
                        newScope.entryId     = selectedRow.id;
                        newScope.episodeKey  = $scope.episodeKey;
                        newScope.orgUnitId   = $scope.orgUnitId;
                        newScope.commentData = selectedRow;

                        var options = {
                            type : 'edit',
                            scope: newScope
                        };

                        decHtml5CommentsDialog
                            .commentDialog(options).then(function () {
                                $('#decMainFeature:visible .jqx-grid').jqxGrid('selectrow', 0);
                                $scope.disableActionButtons();
                            });

                    },

                    delete: function (row) {

                        if( !$scope.actionButtons.delete && !$scope.contextButtons.delete ) {
                            return;
                        }

                        decHtml5CommentsDialog
                            .deleteDialog().then(function (result) {

                                if (result === 'yes') {

                                    var selectedRow = row && row.uid ? row : $scope.selectedRow.left,
                                        decId = selectedRow.decId || selectedRow.id;

                                    $scope.commentSource.delete({
                                        entryId: decId,
                                        reason: ''
                                    }).then(function () {
                                        $scope.$broadcast('decReloadComments');
                                        $scope.$emit('decReloadComments');
                                        $scope.disableActionButtons();
                                    });

                                }

                            });

                    },

                    details: function () {},

                    history: function (row) {

                        var selectedRow = row || $scope.selectedRow.left,
                            decId = selectedRow.decId || selectedRow.id;

                        var command = AuditSupportCommandService.createCommand($scope, function () {

                            var component = '/g3/his/dec/audittrail/AuditTrailService',
                                procedure = 'getAuditTrailForEntrySnapshot',
                                params    = { entryId: decId };

                            AuditSupportDialogService.showHistory($scope, component, procedure, params);

                        });

                        command.__execute();

                    },

                    reload: function () {

                        $scope.$emit('decReloadComments');
                        $scope.disableActionButtons();

                    }

                };


                $scope.actionButtons = {};
                $scope.contextButtons = {};

                $scope.selectedRow = {};

                $scope.disableActionButtons = function () {
                    $scope.actionButtons.edit = false;
                    $scope.actionButtons.delete = false;
                    $scope.actionButtons.details = false;
                    $scope.actionButtons.history = false;
                };


                decHtml5UserRoleService.then(function(data) {
                    decHtml5PermissionService.user(data.employeeId);
                });


                var can =
                    {
                        add : false,
                        view: false,
                        edit: {
                            own  : false,
                            other: false
                        },
                        delete: {
                            own  : false,
                            other: false
                        }
                    };

                decHtml5UserPermissionsService().then(function(access){

                    can.add          = access[0];
                    can.view         = access[1];
                    can.edit.own     = access[2];
                    can.edit.other   = access[3];
                    can.delete.own   = access[4];
                    can.delete.other = access[5];

                    $scope.commandAdd.permissionGranted     = can.add;
//                    $scope.commandDetails.permissionGranted = can.view;
                    $scope.commandEdit.permissionGranted    = (can.edit.own || can.edit.other);
                    $scope.commandDelete.permissionGranted  = (can.delete.own || can.delete.other);

                });


                $scope.$on('decTableSelectRow', function (event, data) {

                    //only active for non-grups (level = 1);
                    var isGroup = data.row.subGroups !== undefined;
                    $scope.contextButtons.history = !isGroup;
                    $scope.actionButtons.history = !isGroup;

                    if (isGroup) {
                        $('#decMainFeature:visible .jqx-grid').jqxGrid('selectrow', 0);
                        $scope.actionButtons.edit = false;
                        $scope.actionButtons.delete = false;
                    }

                    if ( data.rightclick ) {

                        $scope.selectedRow.left  = data.row;
                        $scope.selectedRow.right = data.row;

                        $scope.contextButtons.edit = !isGroup && decHtml5PermissionService.check($scope.selectedRow.right, {
                            other: can.edit.other,
                            own:   can.edit.own
                        });

                        $scope.contextButtons.delete = !isGroup && decHtml5PermissionService.check($scope.selectedRow.right, {
                            other: can.delete.other,
                            own:   can.delete.own
                        });

                    } else {
                        $scope.selectedRow.left  = data.row;
                        $scope.selectedRow.right = false;

//                        if ( $scope.commandDetails.permissionGranted ) {
//                            $scope.actionButtons.details = true;
//                        }

                        $scope.actionButtons.edit = !isGroup && decHtml5PermissionService.check($scope.selectedRow.left, {
                            other: can.edit.other,
                            own:   can.edit.own
                        });

                        $scope.actionButtons.delete = !isGroup && decHtml5PermissionService.check($scope.selectedRow.left, {
                            other: can.delete.other,
                            own:   can.delete.own
                        });

                    }

                    $scope.decTableContext = [
                        { action: contextActions, actionArgs: 'edit',    label: $scope.labels.edit,   disabled: !$scope.contextButtons.edit },
                        { action: contextActions, actionArgs: 'delete',  label: $scope.labels.delete, disabled: !$scope.contextButtons.delete },
                        { action: contextActions, actionArgs: 'details', label: $scope.labels.details, disabled: true},
                        { action: contextActions, actionArgs: 'history', label: $scope.labels.history, disabled: !$scope.contextButtons.history }
                    ];

                    var deleteSpliceIndex = 1;

                    if ( !$scope.commandEdit.permissionGranted ) {
                        $scope.decTableContext.splice(0, 1);
                        deleteSpliceIndex = 0;
                    }

                    if ( !$scope.commandDelete.permissionGranted ) {
                        $scope.decTableContext.splice(deleteSpliceIndex, 1);
                    }

                });

                function contextActions (scope, args) {
                    if ($scope.toolbarActions[args]) {
                        $scope.toolbarActions[args]($scope.selectedRow.right);
                    }
                }


                var commandManager = Command.manager($scope);

                $scope.commandAdd = commandManager.command('commandAdd', {
                    icon: 'ico-24pt ico-outline-tb-plus',
                    execute: $scope.toolbarActions.add
                });

                $scope.commandEdit = commandManager.command('commandEdit', {
                    icon: 'ico-24pt ico-outline-tb-edit',
                    execute: $scope.toolbarActions.edit,
                    enabled: function () {
                        return $scope.actionButtons.edit;
                    }
                });

                $scope.commandDelete = commandManager.command('commandDelete', {
                    icon: 'ico-24pt ico-outline-tb-delete',
                    execute: $scope.toolbarActions.delete,
                    enabled: function () {
                        return $scope.actionButtons.delete;
                    }
                });

                $scope.commandDetails = commandManager.command('commandDetails', {
                    icon: 'ico-24pt ico-outline-ch-calendar',
                    execute: $scope.toolbarActions.details(),
                    enabled: function () {
                        return $scope.actionButtons.details;
                    }
                });

                $scope.toolbarCommands = ['commandAdd', 'commandEdit', 'commandDelete', 'commandDetails'];


                $q.all([
                    I18N.translate({
                        key: '/Button.add.label',
                        resultAsPromise: true
                    }),
                    I18N.translate({
                        key: '/g3/his/dec/decursusList.Details.label',
                        resultAsPromise: true
                    })
                ]).then(function (labelAdd) {

                    $scope.labels = {
                        add    : labelAdd[0],
                        edit   : I18N.translate('/Button.edit.label'),
                        delete : I18N.translate('/Button.delete.label'),
                        details: labelAdd[1],
                        history: I18N.translate('/g3/his/dec/decursusList.showHistoryTooltip.label')

                    };

                    $scope.commandAdd.label     = $scope.labels.add;
                    $scope.commandEdit.label    = $scope.labels.edit;
                    $scope.commandDelete.label  = $scope.labels.delete;
                    $scope.commandDetails.label = $scope.labels.details;

                });

                $scope.$on('decFeatureReactivated', $scope.disableActionButtons);
            }]);

})(angular);
