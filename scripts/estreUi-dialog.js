/*
    EstreUI rimwork — Dialog API: popup, toast, alert, confirm, prompt
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Dialog API -- popup browser, toast, alert, confirm, prompt,
//         wait/stedy/go, notification helpers
// ======================================================================

// Popup browser
function estrePopupBrowser(options = {}, instanceOrigin) {
    return new Promise((resolve) => pageManager.bringPage("!popupBrowser", {
        data: options,
        onBeforeAttach(handle, iframe) {
            this?.data?.callbackBeforeAttach?.(handle, iframe);
        },
        onAfterAttach(handle, iframe, url) {
            this?.data?.callbackAfterAttach?.(handle, iframe, url);
        },
        onLoad(handle, iframe, url) {
            this?.data?.callbackLoad?.(handle, iframe, url);
        },
        onClosePopup(handle, iframe, url) {
            this?.data?.callbackClose?.(handle, iframe, url);
            resolve();
        },
        onClickRefresh(handle, iframe, url) {
            return this?.data?.callbackRefresh?.(handle, iframe, url);
        },
        onClickBack(handle, iframe, url) {
            return this?.data?.callbackBack?.(handle, iframe, url);
        },
        onClickForward(handle, iframe, url) {
            return this?.data?.callbackForward?.(handle, iframe, url);
        },
    }, instanceOrigin));
}

const popupBrowser = (src = "about:blank", name = "webview",
    callbackBeforeAttach = (handle, iframe) => {},
    callbackAfterAttach = (handle, iframe) => {},
    callbackClose = (handle, iframe, url) => {},
    fixedTitle = null,
    callbackLoad = (handle, iframe, url) => {},
    hideRefresh = false,
    callbackRefresh = (handle, iframe, url) => false,
    hideBack = false,
    callbackBack = (handle, iframe, url) => false,
    hideForward = false,
    callbackForward = (handle, iframe, url) => false,
    hideHome = false,
) => estrePopupBrowser({ src, name, callbackBeforeAttach, callbackAfterAttach, callbackClose, fixedTitle, callbackLoad, hideRefresh, callbackRefresh, hideBack, callbackBack, hideForward, callbackForward, hideHome });


const closePopupBrowserWhenOnTop = async () => {
    const container = estreUi.showingOverlayTopArticle?.container;
    if (container?.handler.id == "popupBrowser") return await container.close();
}


// Toast up slide dialog
function estreToastAlert(options = {}, instanceOrigin) {
    return new Promise((resolve) => pageManager.bringPage("!toastAlert", {
        data: options,
        onOk() {
            this?.data?.callbackOk?.();
            resolve(true);
        },
        onDissmiss() {
            this?.data?.callbackDissmiss?.();
            resolve(undefined);
        },
     }, instanceOrigin));
}

const toastAlert = (title, message,
    callbackOk = () => {},
    callbackDissmiss = () => {},
    ok = isKorean() ? "확인" : "OK",
) => estreToastAlert({ title, message, callbackOk, callbackDissmiss, ok });


function estreToastConfirm(options = {}, instanceOrigin) {
    return new Promise((resolve) => pageManager.bringPage("!toastConfirm", {
        data: options,
        onPositive() {
            this?.data?.callbackPositive?.();
            resolve(true);
        },
        onNegative() {
            this?.data?.callbackNegative?.();
            resolve(false);
        },
        onNeutral() {
            this?.data?.callbackNeutral?.();
            resolve(null);
        },
        onDissmiss() {
            this?.data?.callbackDissmiss?.();
            resolve(undefined);
        },
    }, instanceOrigin));
}

const toastConfirm = (title, message,
    callbackPositive = () => {},
    callbackNegative = () => {},
    callbackDissmiss = () => {},
    callbackNeutral = null,
    positive = isKorean() ? "예" : "OK",
    negative = isKorean() ? "아니오" : "NO",
    neutral = isKorean() ? "나중에" : "Later",
) => estreToastConfirm({ title, message, callbackPositive, callbackNegative, callbackDissmiss, callbackNeutral, positive, negative, neutral });


function estreToastPrompt(options = {}) {
    return new Promise((resolve) => pageManager.bringPage("!toastPrompt", {
        data: options,
        onPromptFocus(input, text, event) {
            this?.data?.callbackFocus?.(input, text, event);
        },
        onPromptInput(input, text, event) {
            this?.data?.callbackInput?.(input, text, event);
        },
        onPromptPaste(input, pasteText, text, event) {
            this?.data?.callbackPaste?.(input, pasteText, text, event);
        },
        onPromptChange(input, text, event) {
            this?.data?.callbackChange?.(input, text, event);
        },
        onPromptBlur(input, text, event) {
            this?.data?.callbackBlur?.(input, text, event);
        },
        onConfirm(text) {
            this?.data?.callbackConfirm?.(text);
            resolve(text);
        },
        onDissmiss() {
            this?.data?.callbackDissmiss?.();
            resolve(undefined);
        },
     }));
}

const toastPrompt = (title,
    value = "",
    message,
    callbackConfirm = (text) => {},
    callbackDissmiss = () => {},
    confirm = isKorean() ? "확인" : "Confirm",
    placeholder = "",
    type = "text",//number, password
) => estreToastPrompt({ title, message, callbackConfirm, callbackDissmiss, confirm, placeholder, type, value });


function estreToastOption(options = {}, instanceOrigin) {
    return new Promise((resolve) => pageManager.bringPage("!toastOption", {
        data: options,
        onSelected(key, value) {
            this?.data?.callbackSelected?.(key, value);
            resolve(key);
        },
        onDissmiss() {
            this?.data?.callbackDissmiss?.();
            resolve(undefined);
        },
    }, instanceOrigin));
}

const toastOption = (title = "", message = "",
    options = ["option A", "option B", "option C"],
    callbackSelected = (key, value) => {},
    callbackDissmiss = () => {},
) => estreToastOption({ title, message, options, callbackSelected, callbackDissmiss });

const optionToast = (options = ["option A", "option B", "option C"],
    callbackSelected = (key, value) => {},
    callbackDissmiss = () => {},
    title = "", message = "",
) => toastOption(title, message, options, callbackSelected, callbackDissmiss);


function estreToastSelection(options = {}) {
    return new Promise((resolve) => pageManager.bringPage("!toastSelection", {
        data: options,
        onConfirm(selections, keys, values) {
            this.data?.callbackConfirm?.(selections, keys, values);
            resolve(selections)
        },
        onSelect(selected, key, value, selections, keys, values) {
            this?.data?.callbackSelect?.(selected, key, value, selections, keys, values);
        },
        onAnother(selections, keys, values) {
            this?.data?.callbackAnother?.(selections, keys, values);
            resolve(false);
        },
        onDissmiss(selections, keys, values) {
            this?.data?.callbackDissmiss?.(selections, keys, values);
            resolve(undefined);
        },
    }));
}

const toastSelection = (title = "", message = "",
    minSelection = 1,
    maxSelection = -1,
    options = ["option A", "option B", "option C"],
    defaultSelected = [],
    callbackConfirm = (selections, keys, values) => {},
    callbackSelect = (selected, key, value, selections, keys, values) => {},
    callbackDissmiss = (selections, keys, values) => {},
    callbackAnother = null,
    confirm = isKorean() ? "확인" : "Confirm",
    another = isKorean() ? "나중에" : "later",
) => estreToastSelection({ title, message, options, minSelection, maxSelection, defaultSelected, callbackConfirm, callbackSelect, callbackDissmiss, callbackAnother, confirm, another });

const selectionToast = (options = ["option A", "option B", "option C"],
    minSelection = 1,
    maxSelection = -1,
    defaultSelected = [],
    title = "", message = "",
    callbackConfirm = (selections, keys, values) => {},
    confirm = isKorean() ? "확인" : "Confirm",
    callbackAnother = null,
    another = isKorean() ? "나중에" : "later",
    callbackDissmiss = (selections, keys, values) => {},
    callbackSelect = (selected, key, value, selections, keys, values) => {},
) => toastSelection(title, message, minSelection, maxSelection, options, defaultSelected, callbackConfirm, callbackSelect, callbackDissmiss, callbackAnother, confirm, another);


function estreToastDials(options = {}, instanceOrigin) {
    const arrays = [c.table, c.initial, c.aligns, c.prefixes, c.suffixes, c.dividers];
    for (const name of arrays) if (!typeString(options[name])) options[name] = Jcodd.coddify(options[name]);
    options.stretch = !options.stretch ? "" : t1;
    options.hideScrollbar = !options.hideScrollbar ? "" : t1;
    let intent;
    new Promise((resolve) => {
        intent = {
            data: options,
            onConfirm(selections, keys, values) {
                this.data?.callbackConfirm?.(selections, keys, values);
                resolve(selections)
            },
            onSelect(boundIndex, index, value, selectionIndexes, selectionValues) {
                this?.data?.callbackSelect?.(boundIndex, index, value, selectionIndexes, selectionValues);
            },
            onAnother(selections, keys, values) {
                this?.data?.callbackAnother?.(selections, keys, values);
                resolve(false);
            },
            onDissmiss(selections, keys, values) {
                this?.data?.callbackDissmiss?.(selections, keys, values);
                resolve(undefined);
            },
        };
        return pageManager.bringPage("!toastDials", intent, instanceOrigin);
    });
    return new class {
        get data() { return intent.data; }
        get handle() { return intent.handle; }
    }();
}

const toastDials = (title = "", message = "",
    table = [[]],
    initial = [],
    callbackConfirm = (selections, keys, values) => {},
    callbackSelect = (boundIndex, index, value, selectionIndexes, selectionValues) => {},
    callbackDissmiss = (selections, keys, values) => {},
    callbackAnother = null,
    confirm = isKorean() ? "닫기" : "Close",
    another = isKorean() ? "되돌리기" : "rollback",
    aligns = [],
    prefixes = [],
    suffixes = [],
    dividers = [],
    stretch = t,
    hideScrollbar = t,
) => estreToastDials({ title, message, table, initial, aligns, prefixes, suffixes, dividers, stretch, hideScrollbar, callbackConfirm, callbackSelect, callbackDissmiss, callbackAnother, confirm, another });

const dialsToast = (table = [[]],
    initial = [],
    title = "", message = "",
    callbackConfirm = (selections, keys, values) => {},
    confirm = isKorean() ? "닫기" : "Close",
    callbackAnother = null,
    another = isKorean() ? "되돌리기" : "rollback",
    callbackDissmiss = (selections, keys, values) => {},
    callbackSelect = (boundIndex, index, value, selectionIndexes, selectionValues) => {},
    aligns = [],
    prefixes = [],
    suffixes = [],
    dividers = [],
    stretch = t,
    hideScrollbar = t,
) => toastDials(title, message, table, initial, callbackConfirm, callbackSelect, callbackDissmiss, callbackAnother, confirm, another, aligns, prefixes, suffixes, dividers, stretch, hideScrollbar);




//override global(window) methods
classicAlert = alert;
classicConfirm = confirm;
classicPrompt = prompt;


function estreAlert(options = {}, instanceOrigin) {
    return new Promise((resolve) => pageManager.bringPage("!alert", {
        data: options,
        onOk() {
            this?.data?.callbackOk?.();
            resolve(true);
        },
        onDissmiss() {
            this?.data?.callbackDissmiss?.();
            resolve(undefined);
        },
     }, instanceOrigin));
}

alert = (title, message,
    callbackOk = () => {},
    callbackDissmiss = () => {},
    ok = isKorean() ? "확인" : "OK",
) => tu(title) ? classicAlert() : estreAlert({ title, message, callbackOk, callbackDissmiss, ok });


function estreConfirm(options = {}, instanceOrigin) {
    return new Promise((resolve) => pageManager.bringPage("!confirm", {
        data: options,
        onPositive() {
            this?.data?.callbackPositive?.();
            resolve(true);
        },
        onNegative() {
            this?.data?.callbackNegative?.();
            resolve(false);
        },
        onNeutral() {
            this?.data?.callbackNeutral?.();
            resolve(null);
        },
        onDissmiss() {
            this?.data?.callbackDissmiss?.();
            resolve(undefined);
        },
    }, instanceOrigin));
}

confirm = (title, message,
    callbackPositive = () => {},
    callbackNegative = () => {},
    callbackDissmiss = () => {},
    callbackNeutral = null,
    positive = isKorean() ? "예" : "OK",
    negative = isKorean() ? "아니오" : "NO",
    neutral = isKorean() ? "나중에" : "Later",
) => {
    if (typeof message == UNDEFINED) return classicConfirm(title + (message != null ? "\n" + message : ""));
    else return estreConfirm({ title, message, callbackPositive, callbackNegative, callbackDissmiss, callbackNeutral, positive, negative, neutral });
}


function estrePrompt(options = {}, instanceOrigin) {
    return new Promise((resolve) => pageManager.bringPage("!prompt", {
        data: options,
        onPromptFocus(input, text, event) {
            this?.data?.callbackFocus?.(input, text, event);
        },
        onPromptInput(input, text, event) {
            this?.data?.callbackInput?.(input, text, event);
        },
        onPromptPaste(input, pasteText, text, event) {
            this?.data?.callbackPaste?.(input, pasteText, text, event);
        },
        onPromptChange(input, text, event) {
            this?.data?.callbackChange?.(input, text, event);
        },
        onPromptBlur(input, text, event) {
            this?.data?.callbackBlur?.(input, text, event);
        },
        onConfirm(text) {
            this?.data?.callbackConfirm?.(text);
            resolve(text);
        },
        onDissmiss() {
            this?.data?.callbackDissmiss?.();
            resolve(undefined);
        },
     }, instanceOrigin));
}

prompt = (title,
    value = "",
    message,
    callbackConfirm = (text) => {},
    callbackDissmiss = () => {},
    confirm = isKorean() ? "확인" : "Confirm",
    placeholder = "",
    type = "text",//number, password
) => {
    if (typeof message == UNDEFINED) return classicPrompt(title + (message != null ? "\n" + message : ""));
    else return estrePrompt({ title, message, callbackConfirm, callbackDissmiss, confirm, placeholder, type, value });
}


// Infinite loop and prograss meter
const waitings = new Set();
// let latestIO = null;
let backHolds = 0;

/**
 * Show infinite loop wait indicator
 * 
 * @param {instanceOrigin: string} / instance access origin code
 */
const wait = function (options, instanceOrigin = "wait_" + Date.now()) {
    // if (instanceOrigin != n) waitings.add(instanceOrigin);
    // latestIO = instanceOrigin;
    pageManager.bringPage("!onRunning", { data: options }, instanceOrigin);
    return instanceOrigin;
}

/**
 * Show infinite loop wait indicator before stedy specified delay time for go()
 * 
 * @param {delay: Number} / wait go() before bring wait indicator (ms, default is 600)
 * @param {instanceOrigin: string} / instance access origin code (default is to be auto generated)
 */
const stedy = function (options, delay = 600, instanceOrigin = "stedy_" + Date.now()) {
    if (instanceOrigin != n) waitings.add(instanceOrigin);
    // latestIO = instanceOrigin;
    setTimeout(_ => {
        if (waitings.has(instanceOrigin)) {
            waitings.delete(instanceOrigin);
            wait(options, instanceOrigin);
        }
    }, delay);
    return instanceOrigin;
}

const onBackWhile = function (handle) {
    if (handle != n) {// || latestIO != n) {
        backHolds++;
        return t;
    }
    return f;
}

/**
 * Hide infinite loop wait indicator
 * 
 * @param {instanceOrigin} / instance access origin code
 */
const go = function (instanceOrigin) {
    // if (instanceOrigin != n) {
    //     if (waitings.has(instanceOrigin) == f) return;
    //     waitings.delete(instanceOrigin);
    //     if (latestIO != instanceOrigin && waitings.size > 0) return;
    // }
    if (instanceOrigin != n && waitings.has(instanceOrigin)) {
        waitings.delete(instanceOrigin);
        // return instanceOrigin;
    }
    const aio = pageManager.closePage("!onRunning", f, instanceOrigin);
    // latestIO = n;
    if (backHolds > 0) postAsyncQueue(async _ => {
        const holds = backHolds;
        backHolds = 0;
        await aio;
        if (window.isLogging) console.log("Release holded back requests");
        for (let i=0; i<holds; i++) await estreUi.onBack();
        // await estreUi.onBack();
    })
    return aio;
}


/**
 * Show progress bar(or own custom shape)
 * 
 * @param {meter: object} { current: is 0 to 1000, null to finish } is binded to UI
 * @param {instanceOrigin: string} / instance access origin code
 * 
 * @returns {bindedHandle: object} Adjust bindedHandle.current value to progress animation
 */
const going = function (meter = { current: 0 }, instanceOrigin) {
    meter.instanceOrigin = instanceOrigin;
    return pageManager.bringPage("!onProgress", { data: meter }, instanceOrigin) ? meter.binded : undefined;
}

/**
 * Hide progress bar(or own custom shape)
 * 
 * @param {instanceOrigin: string} / instance access origin code
 */
const arrived = function (instanceOrigin) {
    return pageManager.closePage("!onProgress", false, instanceOrigin);
}


// noti() moved to estreUi-notification.js (roadmap #009).


// ======================================================================