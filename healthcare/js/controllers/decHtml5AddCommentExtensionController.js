(function (angular) {
    'use strict';

    angular
        .module('dec')
        .controller('decHtml5AddCommentExtensionController', ['$scope', 'MsgDialog', 'I18N',
            'MsgToast', 'MsgToastConfig', '$timeout', '$injector', '$base', '$q',
            function ($scope, MsgDialog, I18N, MsgToast, MsgToastConfig, $timeout, $injector, $base, $q) {

                var editor = $base;

                // extend saving function to check if the save is required
                editor.commands.save.__execute = _.wrap(editor.commands.save.__execute, function (superFn, data) {
                    if ($scope.editor.states.isDirty()) {
                        return superFn(data);
                    } else {
                        $scope.closeAddCommentWindow(false);
                    }
                });

                //=============================================
                // Saving the Comment
                //=============================================
                editor.crud.doBeforeSave = _.wrap(editor.crud.doBeforeSave, function (superFn, data) {
                    var defer = $q.defer();
                    // Success Toast
                    $scope.config = MsgToastConfig.createDefaultConfig();
                    $scope.config.message = '/g3/his/dec/decursusList.commentSaved.label';
                    $scope.config.severity = 'ok';
                    $scope.showToast = function () {
                        MsgToast.show(angular.copy($scope.config));
                    };

                    // Error Dialog (MsgDialog)
                    $scope.dialogOptions = {
                        severity: 'warning',
                        dialogSize: 'medium'
                    };

                    var dataToSend = {};

                    if ($scope.createMode) {
                        dataToSend.episodeId = $scope.editor.data.patientField.episodeId;
                        dataToSend.priority = $scope.editor.data.priority.id;
                        dataToSend.actionDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        dataToSend.information = $scope.editor.data.information;
                        dataToSend.groupId = '000000000000000000';
                        dataToSend.source = {};
                    }

                    if ($scope.editMode) {

                        dataToSend.entryId = $scope.entryId;
                        dataToSend.episodeId = $scope.episodeKey;
                        dataToSend.priority = $scope.editor.data.priority.id;
                        dataToSend.actionDateTime = moment().format('YYYY-MM-DD HH:mm:ss');
                        dataToSend.information = $scope.editor.data.information;

                        $scope.editor._exitEditMode();
                        $scope.editor.setEditObject(dataToSend);

                    }

                    if (data) {
                        if ($scope.createMode) {
                            defer.resolve(dataToSend);
                        }
                        if ($scope.editMode) {
                            $scope.editor.setEditObject(dataToSend);
                            defer.resolve(dataToSend);
                        }
                    } else {
                        MsgDialog.show({
                            windowTitle: '/g3/his/dec/decursusList.addComment.label',
                            messageTitle: '/g3/his/dec/decursusList.commentNotSaved.label',
                            message: '/g3/his/wma/bedmanagement/Others.technicalProblems.label',
                            dialogSize: $scope.dialogOptions.dialogSize,
                            severity: $scope.dialogOptions.severity
                        });
                        defer.reject(data);
                    }

                    return defer.promise;
                });

                editor.crud.doAfterSave = _.wrap(editor.crud.doAfterSave, function (superFn, data) {

                    $scope.showToast();

                    $scope.closeAddCommentWindow(true);

                    var defer = $q.defer();

                    defer.resolve(data);

                    return defer.promise;
                });


                editor.crud.discard = _.wrap(editor.crud.discard, function (superFn, data) {
                    return superFn(data).then(function () {
                        $scope.closeAddCommentWindow();
                    });
                });


                return editor;


            }]);
})(angular);