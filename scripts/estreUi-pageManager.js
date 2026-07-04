/*
    EstreUI rimwork — Page Manager
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Page Manager -- EstreUiPageManager, EstreUiCustomPageManager
// ======================================================================


/**
 * Pages operation manager
 */
/**
 * Internal page manager handling page navigation, showing, hiding, and closing.
 * Pages are identified by PID (Page IDentifier) strings, with `!` prefix (managed) and `*` prefix (external) alias mapping.
 * @class
 */
class EstreUiPageManager {

    // class property


    // static methods


    // constants


    // instnace property
    /** @type {Object<string, EstreUiPage>} PID → EstreUiPage instance map. */
    #pages = {};

    /** @type {Object<string, EstreUiPage>} */
    get pages() { return this.#pages; }

    /** @type {Object<string, string>} Built-in managed page alias → actual PID mapping. Access via `!alert`, `!confirm`, etc. */
    #managedPidMap = {
        get appbar() { return "$s&h=appbar"; },



        get popupBrowser() { return "$i&o=functional#popupBrowser^"; },


        get toastAlert() { return "$i&o=toastUpSlide#alert^"; },
        get toastConfirm() { return "$i&o=toastUpSlide#confirm^"; },
        get toastPrompt() { return "$i&o=toastUpSlide#prompt^"; },
        get toastOption() { return "$i&o=toastUpSlide#option^"; },
        get toastSelection() { return "$i&o=toastUpSlide#selection^"; },
        get toastDials() { return "$i&o=toastUpSlide#dials^"; },


        get onRunning() { return "$i&o=interaction#onRunning^"; },
        get onProgress() { return "$i&o=interaction#onProgress^"; },

        get alert() { return "$i&o=interaction#alert^"; },
        get confirm() { return "$i&o=interaction#confirm^"; },
        get prompt() { return "$i&o=interaction#prompt^"; },
        get option() { return "$i&o=interaction#option^"; },
        get selection() { return "$i&o=interaction#selection^"; },

        get popNoti() { return "$i&o=notification#noti@noti^"; },
        get popNote() { return "$i&o=notification#note@note^"; },
        
        get timeline() { return "$s&o=operation#root@timeline"; },
        get quickPanel() { return "$s&o=operation#root@quickPanel"; },
    }

    /** @type {Object<string, string>|null} External (custom) page alias → actual PID mapping. Access via `*home`, etc. Set by EstreUiCustomPageManager.init(). */
    #extPidMap = null;
    /** @type {Object<string, string>|null} */
    get extPidMap() { return this.#extPidMap; }
    /** @param {Object<string, string>} value — Can only be set once. */
    set extPidMap(value) {
        if (this.#extPidMap == null) this.#extPidMap = value;
    }

    constructor() {}

    /** Initialization hook. Override in subclasses. */
    init() {

    }

    /**
     * Registers an EstreUiPage instance with the manager.
     * @param {EstreUiPage} euiPage - The page object to register.
     */
    register(euiPage) {
        const pid = euiPage.pid;
        if (this.#pages[pid] == null) {
            this.#pages[pid] = euiPage;

        }
    }
    

    /**
     * Finds a full PID from a PID with the statement prefix (`$i`, `$s`) omitted.
     * @param {string|null} pid - Full or partial PID.
     * @returns {string|null} The matching full PID, or null.
     */
    findPid(pid) {
        if (pid == null) return null;
        else if (this.get(pid) != null) return pid;
        else if (this.get("$i" + pid) != null) return "$i" + pid;
        else if (this.get("$s" + pid) != null) return "$s" + pid;
        else if (this.get("$i" + pid + "^") != null) return "$i" + pid + "^";
        else if (this.get("$s" + pid + "^") != null) return "$s" + pid + "^";
        else return null;
    }

    /**
     * Looks up a page by PID.
     * @param {string} pid - Full PID.
     * @returns {EstreUiPage|undefined}
     */
    get(pid) {
        return this.pages[pid];
    }

    /**
     * Looks up a page by component ID.
     * @param {string} id - Component ID.
     * @param {string} [sectionBound="blind"] - Section bound ("main"|"blind"|"menu"|"overlay"|"header").
     * @param {string} [statement] - "static" or "instant".
     * @returns {EstreUiPage|null}
     */
    getComponent(id, sectionBound = "blind", statement) {
        var pid = this.findPid(EstreUiPage.getPidComponent(id, sectionBound, statement));
        if (pid != null) return this.get(pid);
        else return null;
    }

    /**
     * Looks up a page by container ID.
     * @param {string} id - Container ID.
     * @param {string} componentId - Parent component ID.
     * @param {string} [sectionBound] - Section bound.
     * @param {string} [statement] - "static" or "instant".
     * @returns {EstreUiPage|null}
     */
    getContainer(id, componentId, sectionBound, statement) {
        var pid = this.findPid(EstreUiPage.getPidContainer(id, componentId, sectionBound, statement));
        if (pid != null) return this.get(pid);
        else return null;
    }

    /**
     * Looks up a page by article ID.
     * @param {string} id - Article ID.
     * @param {string} containerId - Parent container ID.
     * @param {string} componentId - Parent component ID.
     * @param {string} [sectionBound] - Section bound.
     * @param {string} [statement] - "static" or "instant".
     * @returns {EstreUiPage|null}
     */
    getArticle(id, containerId, componentId, sectionBound, statement) {
        var pid = this.findPid(EstreUiPage.getPidArticle(id, containerId, componentId, sectionBound, statement));
        if (pid != null) return this.get(pid);
        else return null;
    }

    /**
     * Returns the total number of step article pages.
     * @param {string} articleStepsId - Base ID for the step articles (e.g. "step").
     * @param {string} containerId - Parent container ID.
     * @param {string} componentId - Parent component ID.
     * @param {string} [sectionBound] - Section bound.
     * @returns {number} Number of step pages.
     */
    getStepPagesLength(articleStepsId, containerId, componentId, sectionBound) {
        var pid0 = this.findPid(EstreUiPage.getPidArticle(articleStepsId + "%0", containerId, componentId, sectionBound));
        var pidPrefix = pid0.split("%")[0];
        var length = 0;
        for (var pid in this.pages) if (pid.indexOf(pidPrefix) === 0) length++;

        return length;
    }

    /**
     * Navigates (brings) a page by PID. Creates (opens) the component/container/article if absent, or shows it if already present.
     * `!` prefix resolves via managedPidMap, `*` prefix via extPidMap.
     * @param {string} pid - Full PID, or `!`/`*` prefixed alias.
     * @param {EstreIntent} [intent] - Intent data passed to the page handler.
     * @param {string|string[]} [instanceOrigin] - Instance origin for multi-instance pages.
     * @returns {*|null|false} Result for the target hostType. null if page not found, false if cannot open.
     */
    bringPage(pid, intent, instanceOrigin) {
        if (pid.indexOf("!") > -1) pid = this.#managedPidMap[pid.replace(/^\!/, "")];
        if (pid == null) return null;
        if (pid.indexOf("*") > -1) pid = this.extPidMap[pid.replace(/^\*/, "")];
        if (pid == null) return null;
        if (pid.indexOf("$") < 0) pid = this.findPid(pid);
        const page = this.get(pid);
        if (page == null) return null;
        page.setInstanceOrigin(instanceOrigin);
        const sections = page.sections;
        if (sections == null) return null;

        if (intent?.bringOnBack != n && intent.bringOnBack.hostType == n) intent.bringOnBack.hostType = page.hostType;

        //check open component
        const isIntentNone = typeof intent == UNDEFINED;
        const componentInstanceOrigin = page.componentInstanceOrigin;
        var componentIntentPushed = false;
        var component = sections[page.componentInstanceId];
        var existComponent = false;
        if (component == null) {
            if (page.componentIsInatant) {
                if (page.isMenu) {
                    if (page.isComponent) {
                        component = estreUi.openMenuArea(page.component, intent, componentInstanceOrigin);
                        componentIntentPushed = true;
                    } else component = estreUi.openMenuArea(page.component, u, componentInstanceOrigin);
                } else if (page.isBlinded) {
                    if (page.isComponent) {
                        component = estreUi.openInstantBlinded(page.component, intent, componentInstanceOrigin);
                        componentIntentPushed = true;
                    } else component = estreUi.openInstantBlinded(page.component, u, componentInstanceOrigin);
                } else if (page.isOverlay) {
                    if (page.isComponent) {
                        component = estreUi.openManagedOverlay(page.component, intent, componentInstanceOrigin);
                        componentIntentPushed = true;
                    } else component = estreUi.openManagedOverlay(page.component, u, componentInstanceOrigin);
                } else if (page.isHeader) {
                    if (page.isComponent) {
                        component = estreUi.openHeaderBar(page.component, intent, componentInstanceOrigin);
                        componentIntentPushed = true;
                    } else component = estreUi.openHeaderBar(page.component, u, componentInstanceOrigin);
                } else return false;
            } else return false;
        } else existComponent = true;
        if (component == null) return null;
        const containerInstanceOrigin = page.containerInstanceOrigin;
        const articleInstanceOrigin = page.articleInstanceOrigin;
        var containerIntentPushed = false;
        var articleIntentPushed = false;
        var container = null;
        var article = null;
        var existContainer = false;
        var existArticle = false;
        if (page.container != null) {
            //check open container
            container = component.containers[page.containerInstanceId];
            if (container == null) {
                if (page.containerIsInatant) {
                    if (page.isArticle || page.isContainer || page.container == "root") {
                        container = component.openContainer(page.container, intent, containerInstanceOrigin);
                        containerIntentPushed = true;
                    } else container = component.openContainer(page.container, u, containerInstanceOrigin);
                } else if (page.isContainer) return false;//static container is cannot open
                else {
                    
                }
            } else existContainer = true;
            if (container == null) return null;

            if (page.article != null) {
                //check open article
                article = container.articles[page.articleInstanceId];
                if (article == null) {
                    if (page.articleIsInatant) {
                        if (page.isArticle || page.article == "main") {
                            article = container.openArticle(page.article, intent, articleInstanceOrigin);
                            articleIntentPushed = true;
                        } else article = container.openArticle(page.article, u, articleInstanceOrigin);
                    } else return false;//static article is cannot open
                } else existArticle = true;
                if (article == null) return null;
            }
        }
        var success = true;
        var targetProcessed = { component: null, container: null, article: null };
        const isRootMain = page.container == "root" && page.article == "main";
        switch (page.hostType) {
            case "article":
                if (!isIntentNone && existArticle && (page.isArticle || page.article == "main")) targetProcessed.article = container.showArticle(page.article, intent, articleInstanceOrigin);
                else targetProcessed.article = article.show();
                success = targetProcessed.article;
                // falls through
            case "container":
                if (success) {
                    if (!isIntentNone && existContainer && (page.isContainer || isRootMain)) targetProcessed.container = component.showContainer(page.container, intent, containerInstanceOrigin);
                    else targetProcessed.container = container.show();
                    success = targetProcessed.container;
                }
                // falls through
            case "component":
                if (success) {
                    if (page.isHeader) {
                        if (!isIntentNone && existComponent && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.showHeaderBar(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.showHeaderBar(page.component, u, componentInstanceOrigin);
                    } else if (page.isMenu) {
                        if (!isIntentNone && existComponent && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.showMenuArea(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.showMenuArea(page.component, u, componentInstanceOrigin);
                    } else if (page.isOverlay) {
                        if (!isIntentNone && existComponent && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.showManagedOverlay(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.showManagedOverlay(page.component, u, componentInstanceOrigin);
                    } else if (page.isBlinded) {
                        if (!isIntentNone && existComponent && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.showInstantBlinded(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.showInstantBlinded(page.component, u, componentInstanceOrigin);
                    } else if (component.isModal) {
                        if (!isIntentNone && existComponent && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.openModalTab(page.component, component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.openModalTab(page.component, u, componentInstanceOrigin);
                    } else {
                        if (!isIntentNone && existComponent && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.switchRootTab(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.mainCurrentOnTop == component || estreUi.switchRootTab(page.component, u, componentInstanceOrigin);
                    }
                    success = targetProcessed.component;
                }
        }
        if (window.isVerbosely) console.log("[bringPage] targetProcessed: ", targetProcessed);
        return targetProcessed[page.hostType];
    }

    /**
     * Shows an already-existing page. Returns null if the component/container/article does not exist.
     * @param {string} pid - Full PID, or `!`/`*` prefixed alias.
     * @param {EstreIntent} [intent] - Intent data passed to the page handler.
     * @param {string|string[]} [instanceOrigin] - Instance origin for multi-instance pages.
     * @returns {*|null} Result for the target hostType. null if page not found.
     */
    showPage(pid, intent, instanceOrigin) {
        if (pid.indexOf("!") > -1) pid = this.#managedPidMap[pid.replace(/^\!/, "")];
        if (pid == null) return null;
        if (pid.indexOf("*") > -1) pid = this.extPidMap[pid.replace(/^\*/, "")];
        if (pid == null) return null;
        if (pid.indexOf("$") < 0) pid = this.findPid(pid);
        const page = this.get(pid);
        if (page == null) return null;
        page.setInstanceOrigin(instanceOrigin);
        const sections = page.sections;
        if (sections == null) return null;

        if (intent?.bringOnBack != n && intent.bringOnBack.hostType == n) intent.bringOnBack.hostType = page.hostType;

        const isIntentNone = typeof intent == UNDEFINED;
        var component = sections[page.componentInstanceId];
        if (component == null) return null;
        const componentInstanceOrigin = page.componentInstanceOrigin;
        const containerInstanceOrigin = page.containerInstanceOrigin;
        const articleInstanceOrigin = page.articleInstanceOrigin;
        var container = null;
        var article = null;
        if (page.container != null) {
            container = component.containers[page.containerInstanceId];
            if (container == null) return null;
            if (page.article != null) {
                article = container.articles[page.articleInstanceId];
                if (article == null) return null;
            }
        }
        var success = true;
        var targetProcessed = { component: null, container: null, article: null };
        switch (page.hostType) {
            case "article":
                if (!isIntentNone && (page.isArticle || page.article == "main")) targetProcessed.article = container.showArticle(page.article, intent, articleInstanceOrigin);
                else targetProcessed.article = article.show();
                success = targetProcessed.article;
                // falls through
            case "container":
                if (success) {
                    if (!isIntentNone && (page.isContainer || (page.article == "main" && page.container == "root"))) targetProcessed.container = component.showContainer(page.container, intent, containerInstanceOrigin);
                    else targetProcessed.container = container.show();
                    success = targetProcessed.container;
                }
                // falls through
            case "component":
                if (success) {
                    const isRootMain = page.container == "root" && page.article == "main";
                    if (page.isOverlay) {
                        if (!isIntentNone && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.showManagedOverlay(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.showManagedOverlay(page.component, u, componentInstanceOrigin);
                    } else if (page.isMenu) {
                        if (!isIntentNone && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.showMenuArea(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.showMenuArea(page.component, u, componentInstanceOrigin);
                    } else if (page.isBlinded) {
                        if (!isIntentNone && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.showInstantBlinded(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.showInstantBlinded(page.component, u, componentInstanceOrigin);
                    } else if (component.isModal) {
                        if (!isIntentNone && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.openModalTab(page.component, component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.openModalTab(page.component, component, u, componentInstanceOrigin);
                    } else {
                        if (!isIntentNone && (page.isComponent || isRootMain)) targetProcessed.component = estreUi.switchRootTab(page.component, intent, componentInstanceOrigin);
                        else targetProcessed.component = estreUi.mainCurrentOnTop == component || estreUi.switchRootTab(page.component, intent, u, componentInstanceOrigin);
                    }
                    success = targetProcessed.component;
                }
        }
        if (window.isVerbosely) console.log("[showPage] targetProcessed: ", targetProcessed);
        return targetProcessed[page.hostType];
    }

    /**
     * Attempts showPage first; falls back to bringPage if the result is falsy.
     * @param {string} pid - Full PID, or `!`/`*` prefixed alias.
     * @param {EstreIntent} [intent] - Intent data passed to the page handler.
     * @param {string|string[]} [instanceOrigin] - Instance origin for multi-instance pages.
     * @returns {*|null|false}
     */
    showOrBringPage(pid, intent, instanceOrigin) {
        return this.showPage(pid, intent, instanceOrigin) || this.bringPage(pid, intent, instanceOrigin);
    }

    /**
     * Hides a page. Sequentially hides the article/container/component based on hostType.
     * @param {string} pid - Full PID, or `!`/`*` prefixed alias.
     * @param {boolean} [hideHost=false] - If true, also hides the parent host.
     * @param {string|string[]|null} [instanceOrigin=null] - Instance origin for multi-instance pages.
     * @returns {*|null} Result for the target hostType.
     */
    hidePage(pid, hideHost = false, instanceOrigin = null) {
        if (pid.indexOf("!") > -1) pid = this.#managedPidMap[pid.replace(/^\!/, "")];
        if (pid == null) return null;
        if (pid.indexOf("*") > -1) pid = this.extPidMap[pid.replace(/^\*/, "")];
        if (pid == null) return null;
        if (pid.indexOf("$") < 0) pid = this.findPid(pid);
        const page = this.get(pid);
        if (page == null) return null;
        page.setInstanceOrigin(instanceOrigin);
        const sections = page.sections;
        if (sections == null) return null;

        var component = sections[page.componentInstanceId];
        if (component == null) return null;
        var container = null;
        var article = null;
        const componentInstanceOrigin = page.componentInstanceOrigin;
        const containerInstanceOrigin = page.containerInstanceOrigin;
        const articleInstanceOrigin = page.articleInstanceOrigin;
        var targetProcessed = { component: null, container: null, article: null };
        if (page.container != null) {
            container = component.containers[page.containerInstanceId];
            if (container != null) {
                if (page.article != null) {
                    article = container.articles[page.articleInstanceId];
                    if (article != null) {
                        targetProcessed.article = article.hide();
                    }
                }
                if (page.isContainer || hideHost || (page.isArticle && page.articleIsStatic && container.isArticlesAllyStatic)) {
                    targetProcessed.container = container.hide();
                }
            }
        }
        if (page.isComponent || hideHost || (!page.isComponent && page.containerIsStatic && component.isContainersAllyStatic)) {
            if (page.isOverlay || page.isMenu || page.isBlinded) {
                targetProcessed.component = component.hide();
            } else if (component.isModal) {
                targetProcessed.component = estreUi.closeModalTab(page.component, $(component));
            } else {
                targetProcessed.component = estreUi.switchRootTab("home");
            }
        }
        if (window.isVerbosely) console.log("[hidePage] targetProcessed: ", targetProcessed);
        return targetProcessed[page.hostType];
    }

    /**
     * Closes a page (async). Sequentially closes the article/container/component based on hostType.
     * @param {string} pid - Full PID, or `!`/`*` prefixed alias.
     * @param {boolean} [closeHost=false] - If true, also closes the parent host.
     * @param {string|string[]} [instanceOrigin] - Instance origin for multi-instance pages.
     * @returns {Promise<*|null>} Result for the target hostType.
     */
    closePage(pid, closeHost = false, instanceOrigin) {
        return postPromise(resolve => {
            postQueue(async _ => {
                if (pid.indexOf("!") > -1) pid = this.#managedPidMap[pid.replace(/^\!/, "")];
                if (pid == null) return resolve(null);
                if (pid.indexOf("*") > -1) pid = this.extPidMap[pid.replace(/^\*/, "")];
                if (pid == null) return resolve(null);
                if (pid.indexOf("$") < 0) pid = this.findPid(pid);
                const page = this.get(pid);
                if (page == null) return resolve(null);
                page.setInstanceOrigin(instanceOrigin);
                const sections = page.sections;
                if (sections == null) return resolve(null);

                var component = sections[page.componentInstanceId];
                if (component == null) return resolve(null);
                var container = null;
                var article = null;
                const componentInstanceOrigin = page.componentInstanceOrigin;
                const containerInstanceOrigin = page.containerInstanceOrigin;
                const articleInstanceOrigin = page.articleInstanceOrigin;
                var targetProcessed = { component: null, container: null, article: null };
                if (page.container != null) {
                    container = component.containers[page.containerInstanceId];
                    if (container != null) {
                        if (page.article != null) {
                            article = container.articles[page.articleInstanceId];
                            if (article != null) {
                                targetProcessed.article = await container.closeArticle(page.article, articleInstanceOrigin);
                            }
                        }
                        if (page.isContainer || closeHost || (page.isArticle && page.articleIsStatic && container.isArticlesAllyStatic)) {
                            targetProcessed.container = await component.closeContainer(page.container, containerInstanceOrigin);
                        }
                    }
                }
                if (page.isComponent || closeHost || (!page.isComponent && page.containerIsStatic && component.isContainersAllyStatic)) {
                    if (page.isOverlay) {
                        targetProcessed.component = await estreUi.closeManagedOverlay(page.component, componentInstanceOrigin);
                    } else if (page.isMenu) {
                        targetProcessed.component = await estreUi.closeMenuArea(page.component, componentInstanceOrigin);
                    } else if (page.isBlinded) {
                        targetProcessed.component = await estreUi.closeInstantBlinded(page.component, componentInstanceOrigin);
                    } else if (component.isModal) {
                        targetProcessed.component = await estreUi.closeModalTab(page.component, $(component), componentInstanceOrigin);
                    } else {
                        targetProcessed.component = await estreUi.switchRootTab("home");
                    }
                }
                if (window.isVerbosely) console.log("[closePage] targetProcessed: ", targetProcessed);
                resolve(targetProcessed[page.hostType]);
            });
        });
    }

    /**
     * Default auto-focus policy for a newly-focused page handle.
     * Priority:
     *   1. On repeat focus, restore `handle.lastFocusedElement` if still in the DOM.
     *   2. First `[data-autofocus]` element inside the host.
     *   3. First tab-reachable focusable element inside the host.
     *   4. Otherwise no-op.
     * Invoked from `pageHandle.onFocus()` when `handler.onFocus` does not return true.
     * Projects can override on an `EstreUiCustomPageManager` subclass if a different policy is needed.
     * @param {EstrePageHandle} handle - The page handle receiving focus.
     * @param {boolean} isFirstFocus - True on the first focus after onOpen; false on subsequent focuses.
     * @returns {boolean} Whether a focus() call succeeded.
     */
    autoFocus(handle, isFirstFocus) {
        const host = handle?.host;
        if (host == null) return false;

        if (!isFirstFocus) {
            const last = handle.lastFocusedElement;
            if (last != null && host.contains(last) && document.body.contains(last)) {
                last.focus();
                if (document.activeElement === last) return true;
            }
        }

        const markedTarget = host.querySelector("[data-autofocus]");
        if (markedTarget != null && !markedTarget.hasAttribute("disabled") && !markedTarget.hidden) {
            markedTarget.focus();
            if (document.activeElement === markedTarget) return true;
        }

        const candidates = host.querySelectorAll(
            'input:not([disabled]),textarea:not([disabled]),select:not([disabled]),button:not([disabled]),[tabindex]:not([tabindex="-1"])'
        );
        for (const el of candidates) {
            if (el.hidden) continue;
            el.focus();
            if (document.activeElement === el) return true;
        }
        return false;
    }
}

const pageManager = new EstreUiPageManager();



/**
 * Base format for project-specific custom page managers.
 * Registers extPidMap and pageHandlers, delegating page navigation via `*` prefixed aliases.
 * @class
 */
class EstreUiCustomPageManager {

    // class property


    // static methods


    // constants


    // instnace property


    constructor() {}


    /**
     * Initializes the custom page manager. Must be called after estreUi initialization.
     * @param {Object<string, string>} extPidMap - Alias → actual PID mapping (e.g. `{ home: "$s&m=home#root@main" }`).
     * @param {Object<string, EstrePageHandler>} pageHandlers - Alias → page handler instance mapping.
     * @returns {this} this for chaining.
     */
    init(extPidMap, pageHandlers) {
        pageManager.extPidMap = extPidMap;
        EstreUiPage.registerProvider(pageHandlers);
        for (var id in pageHandlers) EstreUiPage.registerHandler(extPidMap[id], pageHandlers[id]);

        return this;
    }


    /**
     * Brings a page by external alias ID.
     * @param {string} id - Alias registered in extPidMap.
     * @param {EstreIntent} [intent] - Intent data passed to the page handler.
     * @param {string|string[]} [instanceOrigin] - Multi-instance origin.
     * @returns {*|null|false}
     */
    bringPage(id, intent, instanceOrigin) {
        return pageManager.bringPage("*" + id, intent, instanceOrigin);
    }

    /**
     * Shows a page by external alias ID.
     * @param {string} id - Alias registered in extPidMap.
     * @param {EstreIntent} [intent] - Intent data.
     * @param {string|string[]} [instanceOrigin] - Multi-instance origin.
     * @returns {*|null}
     */
    showPage(id, intent, instanceOrigin) {
        return pageManager.showPage("*" + id, intent, instanceOrigin);
    }

    /**
     * Attempts showPage; falls back to bringPage on failure.
     * @param {string} id - Alias registered in extPidMap.
     * @param {EstreIntent} [intent] - Intent data.
     * @param {string|string[]} [instanceOrigin] - Multi-instance origin.
     * @returns {*|null|false}
     */
    showOrBringPage(id, intent, instanceOrigin) {
        return pageManager.showOrBringPage("*" + id, intent, instanceOrigin);
    }

    /**
     * Hides a page by external alias ID.
     * @param {string} id - Alias registered in extPidMap.
     * @param {boolean} [hideHost=false] - Whether to also hide the parent host.
     * @param {string|string[]|null} [instanceOrigin=null] - Multi-instance origin.
     * @returns {*|null}
     */
    hidePage(id, hideHost = false, instanceOrigin = null) {
        return pageManager.hidePage("*" + id, hideHost, instanceOrigin);
    }

    /**
     * Closes a page by external alias ID (async).
     * @param {string} id - Alias registered in extPidMap.
     * @param {boolean} [closeHost=false] - Whether to also close the parent host.
     * @param {string|string[]|null} [instanceOrigin=null] - Multi-instance origin.
     * @returns {Promise<*|null>}
     */
    closePage(id, closeHost = false, instanceOrigin = null) {
        return pageManager.closePage("*" + id, closeHost, instanceOrigin);
    }

}


// ======================================================================