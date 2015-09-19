/**
 * @ngdoc service
 * @name decHtml5EpisodeComponentService
 * @description
 *
 * Gets patients data by episodeKey or by Org Unit

 */
(function () {
    'use strict';

    angular.module('dec').factory('decHtml5EpisodeComponentService', ['$q', 'Component', 'PacEpisodeService',
        function ($q, Component, PacEpisodeService) {

        return {

            /**
             * @ngdoc method
             * @name decHtml5EpisodeComponentService#findByLastCareOrgUnit
             * @param {string} lastCareOrgUnitId Needed parameter for the API call
             * @return {Promise} A promise returns the data for all the patients in the Org Unit
             *
             * @description
             *
             * Returns data for all patients in in the Org Unit in getting patients by episodeId context
             *
             * ### Usage
             * ```javascript
             *
             * decHtml5EpisodeComponentService.findByLastCareOrgUnit($scope.orgUnitId).then(function (patients) {
             *        ...
             *   });
             *
             * ```
             */
            findByLastCareOrOutpatientDepartmentOrgUnit: function (lastCareOrgUnitId) {
                var deferred = $q.defer();

                Component.get('/g3/pac/episode/external/EpisodeComponent')
                    .$invoke('findByLastCareOrOutpatientDepartmentOrgUnit', {lastCareOrOutpatientDepartmentOrgUnitId: lastCareOrgUnitId, episodeTypeAndStates: [
                        {episodeState: 'DISCHARGED', episodeTypeId:'/g3/pac/episode/EpisodeType.OUTPATIENT'},
                        {episodeState: 'REGISTERED', episodeTypeId:'/g3/pac/episode/EpisodeType.OUTPATIENT'},
                        {episodeState: 'ADMITTED', episodeTypeId:'/g3/pac/episode/EpisodeType.OUTPATIENT'},
                        {episodeState: 'DISCHARGED', episodeTypeId:'/g3/pac/episode/EpisodeType.INPATIENT'},
                        {episodeState: 'REGISTERED', episodeTypeId:'/g3/pac/episode/EpisodeType.INPATIENT'},
                        {episodeState: 'ADMITTED', episodeTypeId:'/g3/pac/episode/EpisodeType.INPATIENT'}
                    ]})
                    .success(function (data) {
                        deferred.resolve(data);
                    })
                    .error(function (error) {

                        deferred.reject(error);

                    });

                return deferred.promise;

            },

            /**
             * @ngdoc method
             * @name decHtml5EpisodeComponentService#getByKey
             * @param {string} episodeId Needed parameter for the API call
             * @return {Promise} A promise returns the resolved all the patient data
             *
             * @description
             *
             * Returns all the data for a single patient in getting patient by episodeId context
             *
             * ### Usage
             * ```javascript
             *
             * decHtml5EpisodeComponentService.getByKey($scope.episodeKey).then(function (patient) {
             *        ...
             *     });
             *
             * ```
             */
            getByKey: function (episodeId) {

                return PacEpisodeService.getByKey(episodeId).then(function(episode) {

                    /**
                     * episode {id: "EPI-200000003", key: "200000003", patient: {id:, "PAT-100000003", key: "100000003", person: {givenName: "Andreas", familyName: "Busch"}}…}
                     */
                    // Creating object based of the returned "episode" obj, used for patient model data and saving the comment
                    var episodeInfo = {};
                    episodeInfo.patient = episode.patient;
                    episodeInfo.patientKey = episode.key;

                    episodeInfo.patientInfo = {
                        name: episodeInfo.patient.person.givenName + ' ' +
                            episodeInfo.patient.person.familyName,
                        id: episodeInfo.patientKey
                    };

                    episodeInfo.patientField = {
                        id: episodeInfo.patientInfo.id,
                        name: episodeInfo.patientInfo.name + ' (' + episodeInfo.patientInfo.id + ')',
                        episodeId: episodeInfo.patientKey
                    };

                    return episodeInfo;


                });
            }

        };


    }]);

})();
