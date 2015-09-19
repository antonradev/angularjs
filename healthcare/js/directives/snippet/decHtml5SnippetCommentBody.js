/**
 * @ngdoc directive
 * @name decHtml5SnippetCommentBody
 * @restrict E
 * @param {Object} comment All the data for the snippet content
 *
 * @description
 *
 * Displays the comment contents inside the snippet box
 *
 * ## Example
 *
 * *HTML*
 * ```html
 *  <dec-html5-snippet-comment-body comment="comment"></dec-html5-snippet-comment-body>
 * ```
 */
(function (angular) {
    'use strict';

    angular.module('dec').directive('decHtml5SnippetCommentBody', [function () {
        return {
            restrict: 'E',
            templateUrl: modules.resolvePath('dec-html5-client',
                'features/dec/views/snippet/decHtml5SnippetCommentBody.html')
        };
    }]);

})(angular);