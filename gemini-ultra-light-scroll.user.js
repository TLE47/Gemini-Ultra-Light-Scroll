// ==UserScript==
// @name         Gemini Ultra-Light Scroll 
// @namespace    http://tampermonkey.net/
// @version      2.4
// @description  Only scrolls if the CURRENT/LATEST message contains a code block.
// @match        https://gemini.google.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let cachedContainer = null;
    let autoScrollEnabled = true;

    const init = () => {
        cachedContainer = document.querySelector('infinite-scroller[data-test-id="chat-history-container"]');

        if (cachedContainer) {
            console.log('Gemini Scroll v2.4: Targeting Latest Message Code Blocks');
            setupObserver();
        } else {
            setTimeout(init, 1000);
        }
    };

    const setupObserver = () => {
        const observer = new MutationObserver(() => {
            if (!autoScrollEnabled || !cachedContainer) return;

            // 1. Find all messages (usually 'message-content' or 'model-response')
            const messages = cachedContainer.querySelectorAll('div.message-content, model-response');
            if (messages.length === 0) return;

            // 2. Target only the very last message in the chat
            const lastMessage = messages[messages.length - 1];

            // 3. Check if THAT specific message has a code block
            const hasCodeBlock = lastMessage.querySelector('pre, code-block, .copy-code-button');

            if (hasCodeBlock) {
                cachedContainer.scrollTo({
                    top: cachedContainer.scrollHeight,
                    behavior: 'auto'
                });
            }
        });

        observer.observe(cachedContainer, {
            childList: true,
            subtree: true,
            characterData: true
        });

        cachedContainer.addEventListener('wheel', () => {
            const offset = cachedContainer.scrollHeight - cachedContainer.scrollTop - cachedContainer.clientHeight;
            if (offset > 100) {
                autoScrollEnabled = false;
                clearTimeout(window.resumeScrollTimer);
                window.resumeScrollTimer = setTimeout(() => { autoScrollEnabled = true; }, 5000);
            } else {
                autoScrollEnabled = true;
            }
        });
    };

    if (document.readyState === 'complete') {
        init();
    } else {
        window.addEventListener('load', init);
    }
})();
