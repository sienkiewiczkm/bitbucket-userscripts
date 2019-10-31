// ==UserScript==
// @name         Quote selected text functionality for Bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tested on Bitbucket 6.6 and Chrome 77.0.3865.120 (Official Build) (64-bit)
// @author       Tamas Dioszegi
// @match        https://*/projects/*/repos/*/pull-requests/*/overview*
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
  'use strict';

  const config = Object.freeze({
    // if true, the current selection is only added when it is part of the comment being replied to
    onlyForDirectReply: true
  });

  $(document).ready(function() {
    // we extract the selection on mousedown, because it is cleared by the time click handlers would run
    $(document).on('mousedown', 'button.reply', function() {
      const selectedText = window.getSelection().toString().trim();
      const messageRepliedTo = $(this).closest('.content').find('.message')[0];
      const isDirectReply = window.getSelection().containsNode(messageRepliedTo, true); //second param stands for partial containment

      if (config.onlyForDirectReply && !isDirectReply) {
        return;
      }

      if (selectedText === '') {
        return;
      }

      // we need to add a markdown quotation sign for every paragraph
      const markdownQuotedSelection = selectedText.split('\n')
        .filter(function(s) {return s!=='';})
        .map(function(s) {return '> ' + s;})
        .join('\n');

      // (This is ugly, but it's easier than finding an appropriate DOM insertion or bitbucket-internal event)
      // After a short timeout, we append the saved selection to the currently-focused reply textbox
      setTimeout(function(){
        const commentBox = $('form.new-comment-form textarea:focus');
        const end = markdownQuotedSelection.length + 1;
        commentBox.text(markdownQuotedSelection + '\n');
        commentBox[0].setSelectionRange(end, end);
      }, 150);
    });
  });
})();
