(function (angular) {
    angular
        .module('dec')
        .controller('decHtml5AddCommentController', ['$scope', 'Dialog', 'I18N', 'decHtml5DataService',
            '$timeout', '$injector', 'EpisodeInfoService', 'decHtml5EpisodeComponentService', '$filter',
            function ($scope, Dialog, I18N, decHtml5DataService, $timeout, $injector, EpisodeInfoService, decHtml5EpisodeComponentService, $filter) {

                // Fixing  Dismiss dialog when it appears on not needed cases
                function dismissDialogFix () {
                    $scope.editor._setDirty();
                    $scope.editor._setPristine();
                }


                // Using I18N.translate and its promise-translating behaviour.
                // Important: Everything needed for the comment saving happens inside I18N then() function Re-work..?
                I18N.translate({
                    key: '/Button.add.label',
                    resultAsPromise: true
                }).then(function () {

                    //=============================================
                    // Priorities drop-down
                    //=============================================
                    var prioritiesLabels = {
                        veryImportant: I18N.translate('/g3/his/dec/priority.VERY_IMPORTANT.label'),
                        attention: I18N.translate('/g3/his/dec/priority.ATTENTION.label'),
                        normal: I18N.translate('/g3/his/dec/priority.NORMAL.label'),
                        requiredField: I18N.translate('/g3/his/dec/decursusDetails.fieldRequired.label')
                    };
                    // Available Priorities list used as a data-source by <hx-array-data-source> in the view
                    $scope.priorities = [
                        {'id': 'VERY_IMPORTANT', name: prioritiesLabels.veryImportant},
                        {'id': 'ATTENTION', name: prioritiesLabels.attention},
                        {'id': 'NORMAL', name: prioritiesLabels.normal}
                    ];


                    //=============================================
                    // Validating Comment field
                    //=============================================
                    $scope.validateCommentField = {
                        method: function (input) {

                            if (input) {
                                if ($('<div>' + input + '</div>').text().trim().length > 0) {
                                    $scope.tinyMCEerror = false;
                                    return true;
                                }
                            }

                            $scope.tinyMCEerror = true;
                            return false;
                        },
                        message: prioritiesLabels.requiredField,
                        kind: 'error'
                    };


                }); // Ends I18N.translate().then()


                //=============================================
                // CGM Editor
                //=============================================
                $timeout(function () {

                    $scope.editor.crud.create().then(function () {

                        // Makes CGM editor in edit mode
                        $scope.editor._enterEditMode();

                        //=============================================
                        // Add Comment Window
                        //=============================================
                        if ($scope.createMode) {

                            //=============================================
                            // Patient by Episode Key
                            //=============================================
                            if ($scope.episodeKey && !$scope.orgUnitId) {

                                decHtml5EpisodeComponentService.getByKey($scope.episodeKey).then(function (patient) {

                                    // The drop-down needs to show a string of the name + the id in brackets
                                    // "editor.data.patientField" is used by the ng-model in the view
                                    $scope.editor.data.patientField = patient.patientField;

                                    // Patient needs to be visible also if the drop-down is expanded.
                                    // Creating a single object for it. "orgPatients" is the source name in the view. <hx-array-data-source> needs it.
                                    $scope.orgPatients = [];
                                    $scope.orgPatients.push({
                                        id: $scope.editor.data.patientField.id,
                                        name: $scope.editor.data.patientField.name,
                                        episodeId: patient.patientField.episodeId
                                    });

                                    dismissDialogFix();

                                });
                            }

                            //=============================================
                            // All Patients by Org Unit
                            //=============================================
                            if ($scope.orgUnitId && !$scope.episodeKey) {

                                decHtml5EpisodeComponentService.findByLastCareOrOutpatientDepartmentOrgUnit($scope.orgUnitId)
                                    .then(function (patients) {
                                        // patientsData {Array} - containing data for all the patients in the orgUnit

                                        // The drop-down source to show all the patients.
                                        // Used by <hx-array-data-source> in the view
                                        $scope.orgPatients = [];

                                        angular.forEach(patients, function (item) {

                                            $scope.orgPatients.push({
                                                id: item.id,
                                                name: item.patient.person.givenName + ' ' +
                                                    item.patient.person.familyName + ' (' + item.key + ')',
                                                episodeId: item.key
                                            });
                                        });

                                        dismissDialogFix();

                                    });
                            }


                        }

                        //=============================================
                        // Edit Comment Window
                        //=============================================
                        if ($scope.editMode) {

                            $scope.editor.data.information = $scope.commentData.decComment; // (String) - the comment itself

                            //=============================================
                            // Patient by Episode Key
                            //=============================================
                            if ($scope.episodeKey && !$scope.orgUnitId) {

                                decHtml5EpisodeComponentService.getByKey($scope.episodeKey).then(function (patient) {

                                    // The non-editable printed values in the view: Patient, id, Author, role...
                                    $scope.patientData = patient;

                                    if ($scope.commentData.id) {
                                        $scope.entryId = $scope.commentData.id;
                                        $scope.editFromTableContext = true;
                                        $scope.commentData.decTimeReal = {
                                            date: $filter('decTime')($scope.commentData.systemDate),
                                            time: $filter('decTime')($scope.commentData.systemDate)
                                        };
                                        $scope.commentData.decShift = $filter('decShift')($scope.commentData.systemDate);
                                        $scope.commentData.decAuthorFullName = $scope.commentData.authorFullName;
                                        $scope.commentData.decAuthorRoleName = $scope.commentData.authorRoleName;
                                        $scope.editor.data.information = $scope.commentData.information;
                                    }

                                    // The drop-down needs to show a string of the name + the id in brackets
                                    // "editor.data.patientField" is used by the ng-model in the view
                                    $scope.editor.data.patientField = patient.patientField;

                                    // Patient needs to be visible also if the drop-down is expanded.
                                    // Creating a single object for it. "orgPatients" is the source name in the view. <hx-array-data-source> needs it.
                                    $scope.orgPatients = [];
                                    $scope.orgPatients.push({
                                        id: $scope.editor.data.patientField.id,
                                        name: $scope.editor.data.patientField.name,
                                        episodeId: patient.patientField.episodeId
                                    });

                                    // Filled Priority field
                                    var priorityVal = $scope.commentData.decPriority || $scope.commentData.priority;

                                    if (priorityVal === 'ATTENTION' || priorityVal.style === 'high') {
                                        $scope.editor.data.priority = $scope.priorities[1];
                                    }
                                    else if (priorityVal === 'VERY_IMPORTANT' || priorityVal.style === 'highest') {
                                        $scope.editor.data.priority = $scope.priorities[0];
                                    }
                                    else {
                                        $scope.editor.data.priority = $scope.priorities[2];
                                    }

                                    dismissDialogFix();

                                });

                            }


                            //=============================================
                            // All Patients by Org Unit
                            //=============================================
                            if ($scope.orgUnitId && !$scope.episodeKey) {

                                decHtml5EpisodeComponentService.findByLastCareOrOutpatientDepartmentOrgUnit($scope.orgUnitId)
                                    .then(function (patients) {
                                        // patientsData {Array} - containing data for all the patients in the orgUnit

                                        // The drop-down source to show all the patients.
                                        // Used by <hx-array-data-source> in the view
                                        $scope.orgPatients = [];

                                        angular.forEach(patients, function (item) {

                                            $scope.orgPatients.push({
                                                id: item.id,
                                                name: item.patient.person.givenName + ' ' +
                                                    item.patient.person.familyName + ' (' + item.key + ')',
                                                episodeId: item.key
                                            });
                                        });

                                        // Filled Priority field
                                        var priorityVal = $scope.commentData.decPriority || $scope.commentData.priority;

                                        if (priorityVal === 'ATTENTION' || priorityVal.style === 'high') {
                                            $scope.editor.data.priority = $scope.priorities[1];
                                        }
                                        else if (priorityVal === 'VERY_IMPORTANT' || priorityVal.style === 'highest') {
                                            $scope.editor.data.priority = $scope.priorities[0];
                                        }
                                        else {
                                            $scope.editor.data.priority = $scope.priorities[2];
                                        }
                                        dismissDialogFix();

                                    });

                                if ($scope.commentData.id) {
                                    $scope.entryId = $scope.commentData.id;
                                    $scope.editFromTableContext = true;
                                    $scope.commentData.decTimeReal = {
                                        date: $filter('decTime')($scope.commentData.systemDate),
                                        time: $filter('decTime')($scope.commentData.systemDate)
                                    };
                                    $scope.commentData.decShift = $filter('decShift')($scope.commentData.systemDate);
                                    $scope.commentData.decAuthorFullName = $scope.commentData.authorFullName;
                                    $scope.commentData.decAuthorRoleName = $scope.commentData.authorRoleName;
                                    $scope.editor.data.information = $scope.commentData.information;
                                }

                            }

                        } // End of if ($scope.editMode)

                    }); // End of $scope.editor.crud.create().then()

                }, 400); // End of $timeout() function for editor initializing


                //=============================================
                // Closing Modal
                //=============================================
                $scope.closeAddCommentWindow = function (refresh) {
                    $scope.$$dialogInstance.close(refresh);
                    $scope.$destroy();
                };


                $scope.tinyMCEerror = false;

                //=============================================
                // TinyMCE
                //=============================================
                /*jshint camelcase: true */
                $scope.tinymceOptions = {
                    menubar: false,
                    statusbar: false,
                    resize: false,
                    /*jshint camelcase: false */
                    forced_root_block: false,
                    toolbar: [
                        'undo redo | bold italic underline | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent'
                    ]
                };


            }]);
})(angular);