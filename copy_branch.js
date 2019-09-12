// ==UserScript==
// @name         Branch name quick copy button for Bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Tested on Bitbucket 5.3 and Chrome 76.0.3809.132 (Official Build) (64-bit)
// @author       Kamil Sienkiewicz
// @match        https://*/projects/*/repos/*/pull-requests/*/overview*
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
  'use strict';

  function copyToClipboard(text) {
    const input = $('<input>');
    $('body').append(input);
    input.val(text).select();
    document.execCommand('copy');
    input.remove();
  }

  $(document).ready(function() {
    const meta = $('.pull-request-metadata');
    meta.find('.branch-from-to .ref-name').each(function() {
      const branch = $(this).find('.branch-name');
      const copyButton = $('<span class="aui-icon aui-icon-small aui-iconfont-copy-clipboard" />');
      copyButton.css({
        'margin-left': 5,
        'cursor': 'pointer'
      });
      copyButton.click(() => copyToClipboard(branch.text()));
      copyButton.appendTo($(this));
    });
  });
})();
