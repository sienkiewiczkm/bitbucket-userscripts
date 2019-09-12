// ==UserScript==
// @name         Pseudo-resolve for Bitbucket
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  Resolve threads with ":white-check-mark:" emoji. Tested on Bitbucket Server 5.3
// @author       Kamil Sienkiewicz
// @match        https://*/projects/*/repos/*/pull-requests/*/overview
// @grant        none
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// ==/UserScript==

(function() {
  'use strict';

  $(document).ready(function() {
    setTimeout(function init() {
      update();
      setInterval(update, 5000);
    }, 500);
  });

  const COMMENT_DETECTED_CLASS = 'custom-script-comment-detected';
  const COMMENT_RESOLVED_CLASS = 'custom-script-comment-resolved';
  const RESOLVED_MESSAGE_CLASS = 'custom-script-message';
  const RESOLVE_EMOJI = '✅';

  const CUSTOM_CSS = `
    .${COMMENT_RESOLVED_CLASS} {
      height: 18px;
      box-sizing: border-box;
      padding: 0 !important;
      overflow: hidden;
      position: relative;
      border: none !important;
      margin-bottom: 8px;
    }

    .${RESOLVED_MESSAGE_CLASS} {
      position: absolute;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;
      font-size: 12px;
      background: #a6ec79;
      color: #5e9609;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
    }
  `;

  $('head').append(`<style type="text/css">${CUSTOM_CSS}</style>`);

  function update() {
    $(`ol.pull-request-activity > li:not(.${COMMENT_DETECTED_CLASS}) p:contains(${RESOLVE_EMOJI})`).each(function() {
      if ($(this).closest('.comment-form-container').length !== 0) {
        return;
      }

      var section = $(this).closest('.pull-request-activity > li');
      if (section.hasClass(COMMENT_DETECTED_CLASS)) {
        // Duplicated marker in the section. Abort.
        return;
      }

      section.addClass(COMMENT_DETECTED_CLASS);

      let dtResolve = null;
      section.find(`p:contains(${RESOLVE_EMOJI})`).each(function() {
        const sDateTime = $(this).closest('.content').find('.info .times time').attr('datetime');
        const dt = new Date(sDateTime);
        if (dtResolve === null) {
          dtResolve = dt;
        } else if (dtResolve.getTime() < dt.getTime()) {
          dtResolve = dt;
        }
      });

      let bResolveIsNewest = true;
      section.find('.info .times time').each(function() {
        const sDateTime = $(this).closest('.content').find('.info .times time').attr('datetime');
        const dt = new Date(sDateTime);
        if (dt > dtResolve) {
          bResolveIsNewest = false;
        }
      });

      if (!bResolveIsNewest) {
        // There is a reply or something. Ignore.
        return;
      }

      // "Resolve"
      section.addClass(COMMENT_RESOLVED_CLASS);
      var message = $('<div class="custom-script-message">Resolved. Click to show.</div>');
      section.append(message);
      message.on('click', function() {
        message.remove();
        section.removeClass(COMMENT_RESOLVED_CLASS);
      });
    });
  }
})();

