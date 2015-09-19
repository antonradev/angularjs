(function (angular) {
    angular
        .module('dec')

        .controller('visibilitySettingsController', ['$scope', 'decHtml5UserRolesService', 'decHtml5UsersService', 'decHtml5GroupsService', '$q', '$filter', 'HxI18N', 'decHtml5VisibilitySettingsService', 'timeService',
            function ($scope, decHtml5UserRolesService, decHtml5UsersService, decHtml5GroupsService, $q, $filter, HxI18N, decHtml5VisibilitySettingsService, timeService) {

                $scope.visibilitySettingsTemp = {};
                $scope.visibilitySettingsTemp.dateDisabled = null;

                $scope.labels = {};

                decHtml5VisibilitySettingsService.setVisibilitySettingsValidation($scope.visibilitySettingsForm);

                $q.all([decHtml5UserRolesService, decHtml5UsersService, decHtml5GroupsService]).then(function (data) {

                    var roles = data[0],
                        rolesTemp = {},
                        rolesTempDropDown = [],
                        users = data[1],
                        usersTemp = {},
                        usersTempDropDown = [],
                        groups = data[2],
                        groupsTemp = {},
                        groupsTempAll = [],
                        groupsTempChild = [],
                        groupsTempTree = [],
                        groupsComponentTree;


                    angular.forEach(roles, function (role) {
                        rolesTemp[role.id] = {id: role.id, label: role.name};
                        rolesTempDropDown.push({id: role.id, label: role.name});
                    });

                    $scope.rolesTemp = rolesTemp;
                    $scope.rolesDataSourceData = rolesTempDropDown;


                    angular.forEach(users, function (user) {
                        //adding users with null IDs causes unexpected results and is generally wrong
                        if (user.defaultEmployeeId !== null) {
                            usersTemp[user.defaultEmployeeId] = {id: user.defaultEmployeeId, label: user.displayName};
                            usersTempDropDown.push({id: user.defaultEmployeeId, label: user.displayName});
                        }
                    });

                    $scope.usersTemp = usersTemp;
                    $scope.usersDataSourceData = usersTempDropDown;


                    angular.forEach(groups, function (group) {

                        groupsTempAll.push(group.id);

                        if (!group.parentId) {
                            groupsTemp[group.id] = {
                                title: group.id, label: group.name, key: group.id, children: []
                            };
                        }
                        else {
                            groupsTempChild.push(group);
                        }
                    });

                    angular.forEach(groupsTempChild, function (child) {
                        if (groupsTemp[child.parentId]) {
                            groupsTemp[child.parentId].children.push({title: child.id, label: child.name, key: child.id});
                        }
                        else {
                            // We need to handle this
                        }
                    });

                    angular.forEach(groupsTemp, function (group) {
                        groupsTempTree.push(group);
                    });


                    $scope.groupsDataSourceData = groupsTempTree;

                    if ($scope.visibilitySettings.criteria.groups === null) {
                        $scope.visibilitySettings.criteria.groups = groupsTempAll;
                    }

                    $scope.visibilitySettings.criteria.realGroups = $scope.visibilitySettings.criteria.groups;
                    if (_.isEqual($scope.visibilitySettings.criteria.dates.intervalStart, timeService.yearFromStart)) {
                        $scope.visibilitySettings.criteria.dates.intervalStart = null;
                    }

                    if (_.isEqual($scope.visibilitySettings.criteria.dates.intervalEnd, timeService.currentTime)) {
                        $scope.visibilitySettings.criteria.dates.intervalEnd = null;
                    }
                    $scope.$watch(function () {
                        return $scope.visibilitySettings.criteria.groups;

                    }, function (newVal, oldVal) {
                        if(!_.isEqual(newVal, oldVal)) {
                            groupsComponentTree = $('.groups-container .cgm-tree-container').fancytree('getTree');
                            $scope.visibilitySettings.criteria.realGroups = _.pluck(groupsComponentTree.getSelectedNodes(), 'key');
                        }
                    });

                    $scope.$watch('$scope.visibilitySettings', function () {

                        $scope.$emit('visibilitySettingsChanged', $scope.visibilitySettings);

                        $scope.visibilitySettings.criteria.priorities[0] = $scope.visibilitySettings.criteria.priorities[0] === '1';

                        $scope.visibilitySettings.criteria.priorities[1] = $scope.visibilitySettings.criteria.priorities[1] === '1';

                        $scope.visibilitySettings.criteria.priorities[2] = $scope.visibilitySettings.criteria.priorities[2] === '1';

                        $scope.visibilitySettingsTemp.roleId = $scope.rolesTemp[$scope.visibilitySettings.criteria.roleId];

                        $scope.visibilitySettingsTemp.authorEmployeeId = $scope.usersTemp[$scope.visibilitySettings.criteria.authorEmployeeId];

                    });

                });


                var today = $filter('decShift')(new Date()),
                    todayStart,
                    todayEnd;


                if (today.style === 'day') {

                    $scope.visibilitySettingsTemp.timePeriodValue = { id: 'currentShift', label: 'Current shift'};

                }

                if (today.style === 'night') {

                    $scope.visibilitySettingsTemp.timePeriodValue = { id: 'currentShift', label: 'Current shift'};

                }


                $scope.$watch('visibilitySettingsTemp.authorEmployeeId', function (newVal) {

                    if (newVal && newVal.id) {
                        $scope.visibilitySettings.criteria.authorEmployeeId = newVal.id;
                    }
                    else if (newVal === null) {
                        $scope.visibilitySettings.criteria.authorEmployeeId = null;
                    }
                });

                $scope.$watch('visibilitySettingsTemp.roleId', function (newVal) {
                    if (newVal && newVal.id) {
                        $scope.visibilitySettings.criteria.roleId = newVal.id;
                    }
                    else if (newVal === null) {
                        $scope.visibilitySettings.criteria.roleId = null;
                    }
                });



                $scope.$watch('visibilitySettings.criteria.referenceDate', function (newVal) {
                    $scope.visibilitySettings.criteria.referenceDate = newVal;
                });


                $scope.displayedItemsLabelFunction = function (data) {
                    return data.label;
                };
                HxI18N.translate({
                    key: '/cgm/g3/his/sma/TaskListFilterFormFeature.customTimePeriod.label',
                    resultAsPromise: true
                }).then(function () {

                    $scope.labels.customPeriod = HxI18N.translate('/cgm/g3/his/sma/TaskListFilterFormFeature.customTimePeriod.label');
                    $scope.labels.currentShift = HxI18N.translate('/cgm/g3/his/sma/Shifts.currentShift.label');
                    $scope.labels.prevShift = HxI18N.translate('/cgm/g3/his/sma/Shifts.previousShift.label');

                    $scope.timePeriodDataSourceData = [
                        { id: 'currentShift', label: $scope.labels.currentShift},
                        { id: 'previousShift', label: $scope.labels.prevShift},
                        { id: 'customPeriod', label: $scope.labels.customPeriod}
                    ];


                    $scope.visibilitySettingsTemp.timePeriodValue.id = $scope.visibilitySettings.timePeriod;

                    $scope.$watch('visibilitySettingsTemp.timePeriodValue', function (newVal) {


                        if ($scope.visibilitySettingsTemp.timePeriodValue.id === 'currentShift') {
                            $scope.visibilitySettingsTemp.timePeriodValue.label = $scope.timePeriodDataSourceData[0].label;
                        }

                        if ($scope.visibilitySettingsTemp.timePeriodValue.id === 'previousShift') {
                            $scope.visibilitySettingsTemp.timePeriodValue.label = $scope.timePeriodDataSourceData[1].label;
                        }

                        if ($scope.visibilitySettingsTemp.timePeriodValue.id === 'customPeriod') {
                            $scope.visibilitySettingsTemp.timePeriodValue.label = $scope.timePeriodDataSourceData[2].label;
                        }


                        var shift = newVal.id;

                        if (shift === 'currentShift') {

                            if (moment().format('HH') > 6 && moment().format('HH') < 18) {
                                todayStart = new Date(moment().hour(6).minute(0));
                                todayEnd = new Date(moment().hour(18).minute(0));
                            }
                            else if (moment().format('HH') > 0 && moment().format('HH') < 6) {
                                todayStart = new Date(moment().hour(18).minute(0).subtract(1, 'days'));
                                todayEnd = new Date(moment().hour(6).minute(0));
                            }
                            else {
                                todayStart = new Date(moment().hour(18).minute(0));
                                todayEnd = new Date(moment().hour(6).minute(0).add(1, 'days'));
                            }
                            $scope.visibilitySettingsTemp.dateDisabled = true;
                        }
                        else if (shift === 'previousShift') {
                            if (moment().format('HH') > 6 && moment().format('HH') < 18) {
                                todayStart = new Date(moment().hour(18).minute(0).subtract(1, 'days'));
                                todayEnd = new Date(moment().hour(6).minute(0));
                            }
                            else if (moment().format('HH') > 0 && moment().format('HH') < 6) {
                                todayStart = new Date(moment().hour(6).minute(0).subtract(1, 'days'));
                                todayEnd = new Date(moment().hour(18).minute(0).subtract(1, 'days'));
                            }
                            else {
                                todayStart = new Date(moment().hour(6).minute(0));
                                todayEnd = new Date(moment().hour(18).minute(0));
                            }
                            $scope.visibilitySettingsTemp.dateDisabled = true;
                        }
                        else {
                            todayStart = $scope.visibilitySettings.criteria.dates.intervalStart;
                            todayEnd = $scope.visibilitySettings.criteria.dates.intervalEnd;
                            $scope.visibilitySettingsTemp.dateDisabled = false;
                        }

                        $scope.visibilitySettings.timePeriod = $scope.visibilitySettingsTemp.timePeriodValue.id;

                        $scope.visibilitySettings.criteria.dates = {
                            intervalStart: todayStart,
                            intervalEnd: todayEnd
                        }

                    });


                }); // Ends HxI18N.translate().then()


                $scope.dateEarlierThan = {
                    method: function (startDate, endDate) {
                        if (startDate && endDate) {
                            return startDate <= endDate;
                        }
                        return true;
                    },
                    message: '/cgm/g3/his/sma/SchedulingValidationRuleSet.startDateCannotBeLaterThanEndDate.label'
                };

                $scope.dateLaterThan = {
                    method: function (startDate, endDate) {
                        if (startDate && endDate) {
                            return startDate >= endDate;
                        }
                        return true;
                    },
                    message: '/cgm/g3/his/sma/SchedulingValidationRuleSet.endDateCannotBeEarlierThanStartDate.label'
                };
                
            }]);

})(angular);