/**
 * @ngdoc service
 * @name decHtml5CommentsDialog
 *
 * @description
 *
 * Provides dialogs for comments actions: adding, editing and deleting
 *
 * ### Usage
 * ```javascript
 *
 * decHtml5CommentsDialog.commentDialog({ scope: scope, windowTitle: 'Dialog Name');
 * decHtml5CommentsDialog.deleteDialog();
 *
 * ```
 */

(function (angular) {
    'use strict';

    angular
        .module('dec')

        .service('decHtml5CommentsDialog', ['Dialog', 'TaskDialog', 'I18N',
            function (Dialog, TaskDialog, I18N) {

                /**
                 * @ngdoc method
                 * @name decHtml5CommentsDialog#commentDialog
                 * @param {object} Options: { windowTitle: '', windowScope: {} }
                 * @return {Promise} Return a promise when, the dialog is initialized and ready
                 *
                 * @description
                 *
                 * Create ADD or EDIT dialog and return promise
                 */

                function commentDialog (options) {
                    
                    var titles = {
                            add : '/g3/his/dec/decrsDetails.add.label',
                            edit: '/g3/his/dec/decrsDetails.edit.label'
                        },
                        addOrEditAsStr,
                        addCommentAsStr = I18N.translate('/g3/his/dec/decrsDetails.add.label'),
                        editCommentAsStr = I18N.translate('/g3/his/dec/decrsDetails.edit.label');

                    if (options.title) {
                        if (options.title === editCommentAsStr) {
                            addOrEditAsStr = editCommentAsStr;
                        }

                        if (options.title === addCommentAsStr) {
                            addOrEditAsStr = addCommentAsStr;
                        }
                    }

                    return Dialog.showDialog({
                        scope        : options.scope,
                        windowTitle  : addOrEditAsStr ? addOrEditAsStr : titles[options.type],
                        controller   : 'decHtml5AddCommentController',
                        templateUrl  : helix.modules.resolvePath('dec-html5-client', 'features/dec/views/comments/decHtml5TableCommentWindow.html'),
                        dialogSize   : 'medium',
                        noChildScope : false,
                        noCloseButton: true
                    });

                }


                /**
                 * @ngdoc method
                 * @name decHtml5CommentsDialog#deleteDialog
                 * @param none
                 * @return {Promise} Return a promise, when the dialog is initialized and ready
                 *
                 * @description
                 *
                 * Creates DELETE dialog and return promise with data: ('yes' || 'no')
                 */

                function deleteDialog () {

                    return TaskDialog.show({
                        windowTitle  : '/g3/his/dec/decrsSnippet.deleteComment.header',
                        messageTitle : '/g3/his/dec/decrsSnippet.deleteCommentTitle.header',
                        message      : '/g3/his/dec/decrsSnippet.deleteCommentMessage.label',
                        severity     : 'warning',
                        dialogSize   : 'small',
                        noCloseButton: true,
                        commands     : [
                            {
                                name       : 'yes',
                                label      : '/Button.delete.label',
                                description: '/g3/his/dec/decrsSnippet.deleteCommentCommandYesDescription.label'
                            },
                            {
                                default    : true,
                                name       : 'no',
                                label      : '/Button.cancel.label',
                                description: '/g3/his/dec/decrsSnippet.deleteCommentCommandNoDescription.label'

                            }
                        ]
                    });

                }

                return {
                    commentDialog: commentDialog,
                    deleteDialog : deleteDialog
                };

            }]);

})(angular);
