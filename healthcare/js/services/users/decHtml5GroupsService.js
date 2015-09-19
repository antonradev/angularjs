/**
 * @ngdoc service
 * @name decHtml5GroupsService
 *
 * @description
 *
 * Gets all groups
 *
 * ### Usage
 * ```javascript
 *
 * decHtml5GroupsService.then(function(data) {
 *  userRoles = data;
 * });
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .service('decHtml5GroupsService', ['Component', '$q', function (Component, $q) {

            var deferred = $q.defer();

            Component.get('/g3/his/dec/groups/Groups').$invoke('all')
                .success(function (data) {
                    deferred.resolve(data);
                })
                .error(function (error) {

                    deferred.reject(error);

                });

            return deferred.promise;

        }]);

})(angular);
