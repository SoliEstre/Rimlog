/*
    EstreUI rimwork — estreStruct, estreUi singleton, DOM init
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Main -- estreStruct, estreUi singleton, DOM initialization
// ======================================================================



const estreStruct = {
    structureSuffix: ".json",
}

const estreUi = {

    //constant
    overlaySections: {},
    overlaySectionList: [],

    blindSections: {},
    blindSectionList: [],

    mainSections: {},
    mainSectionList: [],

    menuSections: {},
    menuSectionList: [],
    get menuArea() { return this.menuSections["menuArea"]; },

    panelSections: {},
    panelSectionList: [],
    get quickPanel() { return this.panelSections["quickPanel"]; },
    get timeline() { return this.panelSections["timeline"]; },

    headerSections: {},
    headerSectionList: [],
    get appbar() { return this.headerSections["appbar"]; },


    //static property
    overlayCurrentOnTop: null,
    blindedCurrentOnTop: null,
    mainCurrentOnTop: null,
    menuCurrentOnTop: null,
    panelCurrentOnTop: null,
    headerCurrentOnTop: null,

    // External back handler stack — host-mounted external embeds register navigation
    // steps here so native back input flows through them before EstreUI's section
    // stack. Roadmap #011 / push-pop API.
    externalBackStack: [],
    nextBackHandlerToken: 1,

    //static getter
    get currentTopComponent() {
        return this.blindedCurrentOnTop ?? (this.isOpenMainMenu ? this.menuCurrentOnTop : null) ?? this.mainCurrentOnTop;
    },
    get currentTopPage() {
        return this.currentTopComponent?.currentTop?.currentTop;
    },
    get currentTopPid() {
        return EstreUiPage.from(this.currentTopPage)?.pid;
    },


    get showingOverlayTopArticle() {
        const currentTopArticle = this.overlayCurrentOnTop?.currentTop?.currentTop;
        if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
    },

    get showingBlindedTopArticle() {
        const currentTopArticle = this.blindedCurrentOnTop?.currentTop?.currentTop;
        if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
    },

    get showingMenuTopArticle() {
        if (this.isOpenMainMenu) {
            const currentTopArticle = this.menuCurrentOnTop?.currentTop?.currentTop;
            if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
        }
    },

    get showingMainTopArticle() {
        const currentTopArticle = this.mainCurrentOnTop?.currentTop?.currentTop;
        if (currentTopArticle != null && currentTopArticle.isShowing) return currentTopArticle;
    },

    get showingTopArticle() {
        return this.showingOverlayTopArticle ?? this.showingBlindedTopArticle ?? this.showingMenuTopArticle ?? this.showingMainTopArticle;
    },


    //elements
    $fixedBottom: null,
    $tabsbar: null,
    $rootbar: null,
    $rootTabs: null,

    $overlayArea: null,
    get $overlaySections() { return this.$overlayArea.find(c.c + se); },
    
    $blindArea: null,
    get $blindSections() { return this.$blindArea.find(c.c + se); },

    $mainArea: null,
    get $mainSections() { return this.$mainArea.find(c.c + se); },
    
    $mainMenu: null,
    get $menuSections() { return this.$mainMenu.find(c.c + se); },
    $menuArea: null,
    $grabArea: null,

    $overwatchPanel: null,
    $topLayer: null,
    get $panelSections() { return this.$panelBlock?.find(c.c + se + uis.blockItem) ?? $(); },
    $panelHeader: null,
    $panelHost: null,
    $panelBlock: null,
    $panelClock: null,
    $panelDate: null,
    $panelGrabArea: null,
    $panelTrigger: null,

    $fixedTop: null,
    get $headerSections() { return this.$fixedTop.find(c.c + se); },
    $appbar: null,
    $homeBtn: null,
    $mainMenuBtn: null,
    $mainMenuBtnLottie: null,

    $more: null,
    $sessionManager: null,
    $sessionGroupHolder: null,
    $fixedPages: null,
    $fixedPageList: null,
    $openedPages: null,
    $openedPageList: null,

    $handlePrototypes: null,

    //handles
    menuSwipeHandler: null,
    panelOpenSwipeHandler: null,
    panelCloseSwipeHandler: null,
    panelClockTimeoutId: null,
    panelClockIntervalId: null,
    darkModeMql: null,

    //properties
    euiState: "exit",
    initialHistoryOffset: null,
    isBackwardFlow: false,


    prevRootTabIds: new Set(),
    get latestRootTabId() { return [...this.prevRootTabIds].pop(); },
    get prevRootTabId() {
        const rootTabIds = this.mainSections.ways;
        let latestRootTabId = null;
        while (latestRootTabId = this.latestRootTabId) {
            this.prevRootTabIds.delete(latestRootTabId);
            if (rootTabIds.includes(latestRootTabId)) return latestRootTabId;
        }
        return null;
    },
    set prevRootTabId(id) {
        if (id == null) return;
        if (this.prevRootTabIds.has(id)) this.prevRootTabIds.delete(id);
        this.prevRootTabIds.add(id);
    },

    prevBlindedIds: new Set(),
    get latestBlindedId() { return [...this.prevBlindedIds].pop(); },
    get prevBlindedId() {
        const blindedIds = this.blindSections.ways;
        let latestBlindedId = null;
        while (latestBlindedId = this.latestBlindedId) {
            this.prevBlindedIds.delete(latestBlindedId);
            if (blindedIds.includes(latestBlindedId)) return latestBlindedId;
        }
        return null;
    },
    set prevBlindedId(id) {
        if (id == null) return;
        if (this.prevBlindedIds.has(id)) this.prevBlindedIds.delete(id);
        this.prevBlindedIds.add(id);
    },


    //getter and setter
    get isOpenMainMenu() { return this.$mainMenu.attr(eds.opened) == t1; },

    get isOpenOverwatchPanel() { return this.$overwatchPanel.attr(eds.opened) == t1; },

    get darkMode() {
        const stored = localStorage.getItem("estreUi.darkMode");
        if (stored == "1") return true;
        if (stored == "0") return false;
        return null;
    },
    get isDarkMode() { return document.body.dataset.darkMode == t1; },

    // Cover bar — desktop-class viewport with a pointing device that can hover.
    // Static environment check; matches the media query that gates the cover
    // bar UI surface in CSS. See roadmap entry (forthcoming) for the wider
    // host-integration design.
    get isWideHoverViewport() {
        return matchMedia("(min-width: 1025px) and (min-height: 769px) and (hover: hover) and (pointer: fine)").matches;
    },

    // Cover bar — whether the rootbar is currently in its extended layout, i.e.,
    // the non-rootbar nav siblings under fixedBottom (`customFixedSections`,
    // `instantSections`) take flex-grow:1 per estreUiCore.css's `@media all and
    // (min-height: 700px) and (min-width: 740px)` block, AND the cover-bar
    // handle is initialized. Combines static media-query state with dynamic
    // bootstrap state.
    get rootBarExtended() {
        if (this.coverBarHandle == null) return false;
        const fb = this.$fixedBottom?.[0] ?? this.$fixedBottom;
        const nav = fb?.querySelector?.("nav:not(#rootbar)");
        if (nav == null) return false;
        return getComputedStyle(nav).flexGrow === "1";
    },

    // Cover bar — composite readiness: the environment supports the bar (wide
    // viewport with hover) AND the rootbar is in its extended layout with a
    // handle already initialized. Cover entries should only be pushed when
    // this returns true; the handle itself is idempotent against pushes that
    // arrive while still false.
    get isInstantBarReady() {
        return this.isWideHoverViewport && this.rootBarExtended;
    },

    // Placeholder for the cover-bar handle introduced in Phase 1C. Held at null
    // so rootBarExtended can short-circuit before initialization. Naming follows
    // EstreUI's stock handle convention (EstreHandle, EstreSwipeHandler, etc.)
    // even though the cover bar isn't DOM-attached the same way.
    coverBarHandle: null,



    //links (object redirection)
    get unifiedCalendar() { return this.mainSections.calendar.containers.root.articles.main.handles[uis.unifiedCalendar][0]; },
    get stockCalendar() { return this.unifiedCalendar.calendar; },
    get stockScheduler() { return this.unifiedCalendar.scheduler; },

    //inits
    init(setOnReady = true) {
        EstreHandle.commit();
        EstreUiPage.commit();
        scheduleDataSet.commit();

        this.$blindArea = $("main#instantDoc");
        
        this.$mainArea = $("main#staticDoc");
        
        this.$overlayArea = $("nav#managedOverlay");

        this.$mainMenu = $("nav#mainMenu");

        this.$overwatchPanel = $("nav#overwatchPanel");
        this.$panelTrigger = $("section#panelTrigger");

        this.$fixedTop = $("header#fixedTop");

        this.$fixedBottom = $("#fixedBottom");

        this.$topLayer = $("#topLayer");

        this.$handlePrototypes = $("section#handlePrototypes");

        
        // events
        this.setReload();
        this.setBackNavigation();
        this.setMenuSwipeHandler();
        this.setupDarkMode();


        const onLoadedFixedBottom = async _ => {
            this.$tabsbar = this.$fixedBottom.find(".tabsbar");
            this.$rootbar = this.$fixedBottom.find("nav#rootbar");
            this.initRootbar();
            this.initCoverBar();
        }

        const onLoadedFixedTop = subTerm => {
            this.$appbar = this.$fixedTop.find("section#appbar");
            this.$homeBtn = this.$appbar.find("button#home");
            this.$mainMenuBtn = this.$appbar.find("button#mainMenuBtn");
            this.$mainMenuBtnLottie = this.$mainMenuBtn.find(uis.dotlottiePlayer);

            this.$mainMenuBtn.click(this.mainMenuBtnOnClick);
            return this.initHeaderBars(subTerm);
        }

        const onLoadedStaticDoc = subTerm => {
            return this.initStaticContents(subTerm);
        }

        const onLoadedInstantDoc = subTerm => {
            return this.initInstantContents(subTerm);
        }

        const onLoadedManagedOverlay = subTerm => {
            return this.initOverlayContents(subTerm);
        }

        const onLoadedMainMenu = subTerm => {
            this.$menuArea = this.$mainMenu.find("section#menuArea");
            this.$grabArea = this.$mainMenu.find("section#grabArea");

            this.$grabArea.click(this.mainMenuGrabAreaOnclick);
            return this.initStaticMenus(subTerm);
        }

        const onLoadedOverwatchPanel = subTerm => {
            this.$panelHeader = this.$overwatchPanel.find("header#panelHeader");
            this.$panelHost = this.$overwatchPanel.find(uis.dynamicSectionHost);
            this.$panelBlock = this.$overwatchPanel.find(uis.dynamicSectionBlock);
            this.$panelClock = this.$panelHeader.find("#panelClock");
            this.$panelDate = this.$panelHeader.find("#panelDate");
            this.$panelGrabArea = this.$overwatchPanel.find("section#panelGrabArea");

            this.$panelGrabArea.click(this.overwatchPanelGrabAreaOnclick);
            this.setPanelSwipeHandler();
            this.scheduleOverwatchPanelClock();
            this.initOverwatchPanelHandles();
            this.initOverwatchPanelTimeline();
            this.updateDarkModeToggleWidgets();
            return this.initStaticPanels(subTerm);
        }


        const loadExported = url => fetch(url).then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.text();
        });


        let loadExportedFixedBottom;
        loadExportedFixedBottom = (_, attempt = 0) => loadExported("fixedBottom.html").then(htmlContent => {
            this.$fixedBottom.prepend(htmlContent);
            return onLoadedFixedBottom();
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for fixedBottom: ", error);
            console.log(`Retrying to load fixedBottom in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedFixedBottom(_, attempt + 1));
        });

        let loadExportedFixedTop;
        loadExportedFixedTop = (subTerm, attempt = 0) => loadExported("fixedTop.html").then(htmlContent => {
            this.$fixedTop.prepend(htmlContent);
            return onLoadedFixedTop(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for fixedTop: ", error);
            console.log(`Retrying to load fixedTop in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedFixedTop(subTerm, attempt + 1));
        });

        let loadExportedStaticDoc;
        loadExportedStaticDoc = (subTerm, attempt = 0) => loadExported("staticDoc.html").then(htmlContent => {
            this.$mainArea.prepend(htmlContent);
            return onLoadedStaticDoc(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for staticDoc: ", error);
            console.log(`Retrying to load staticDoc in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedStaticDoc(subTerm, attempt + 1));
        });

        let loadExportedInstantDoc;
        loadExportedInstantDoc = (subTerm, attempt = 0) => loadExported("instantDoc.html").then(htmlContent => {
            this.$blindArea.prepend(htmlContent);
            return onLoadedInstantDoc(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for instantDoc: ", error);
            console.log(`Retrying to load instantDoc in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedInstantDoc(subTerm, attempt + 1));
        });

        let loadExportedManagedOverlay;
        loadExportedManagedOverlay = (subTerm, attempt = 0) => loadExported("managedOverlay.html").then(htmlContent => {
            this.$overlayArea.prepend(htmlContent);
            return onLoadedManagedOverlay(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for managedOverlay: ", error);
            console.log(`Retrying to load managedOverlay in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedManagedOverlay(subTerm, attempt + 1));
        });

        let loadExportedMainMenu;
        loadExportedMainMenu = (subTerm, attempt = 0) => loadExported("mainMenu.html").then(htmlContent => {
            this.$mainMenu.prepend(htmlContent);
            return onLoadedMainMenu(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for mainMenu: ", error);
            console.log(`Retrying to load mainMenu in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedMainMenu(subTerm, attempt + 1));
        });

        let loadExportedOverwatchPanel;
        loadExportedOverwatchPanel = (subTerm, attempt = 0) => loadExported("overwatchPanel.html").then(htmlContent => {
            this.$overwatchPanel.prepend(htmlContent);
            return onLoadedOverwatchPanel(subTerm);
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for overwatchPanel: ", error);
            console.log(`Retrying to load overwatchPanel in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedOverwatchPanel(subTerm, attempt + 1));
        });

        let loadExportedStockHandlePrototypes;
        loadExportedStockHandlePrototypes = (_, attempt = 0) => loadExported("stockHandlePrototypes.html").then(htmlContent => {
            this.$handlePrototypes.prepend(htmlContent);
            return true;
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for stockHandlePrototypes: ", error);
            console.log(`Retrying to load stockHandlePrototypes in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedStockHandlePrototypes(_, attempt + 1));
        });

        let loadExportedCustomHandlePrototypes;
        loadExportedCustomHandlePrototypes = (_, attempt = 0) => loadExported("customHandlePrototypes.html").then(htmlContent => {
            this.$handlePrototypes.append(htmlContent);
            return true;
        }).catch(error => {
            const delay = Math.min(1000 * Math.pow(2, attempt), 30000);
            console.error("There has been a problem with your fetch operation for customHandlePrototypes: ", error);
            console.log(`Retrying to load customHandlePrototypes in ${delay}ms...`);
            return postPromise(resolve => setTimeout(resolve, delay))
                .then(() => loadExportedCustomHandlePrototypes(_, attempt + 1));
        });


        //common element initializing
        const term = 1;//isIPhone ? 1000 : 1;
        const subTerm = 0;//isIPhone ? 200 : 0;
        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        return postAsyncQueue(async _ => {
            // await delayer();
            const handlePrototypesLoader = [];
            if (this.$handlePrototypes.attr(eds.exported) == t1) {
                handlePrototypesLoader.push(loadExportedStockHandlePrototypes());
                handlePrototypesLoader.push(loadExportedCustomHandlePrototypes());
            }
            await Promise.all(handlePrototypesLoader);

            pageManager.init();

            const topBottomLoader = [
                this.$fixedBottom.attr(eds.exported) == t1 ? loadExportedFixedBottom() : onLoadedFixedBottom(),
                this.$fixedTop.attr(eds.exported) == t1 ? loadExportedFixedTop(subTerm) : onLoadedFixedTop(subTerm),
            ];

            const mainLoader = [
                this.$overlayArea.attr(eds.exported) == t1 ? loadExportedManagedOverlay(subTerm) : onLoadedManagedOverlay(subTerm),
                postAsyncQueue(async _ => {
                    await Promise.all(topBottomLoader);
                    return await (this.$mainArea.attr(eds.exported) == t1 ? loadExportedStaticDoc(subTerm) : onLoadedStaticDoc(subTerm));
                }),
                this.$blindArea.attr(eds.exported) == t1 ? loadExportedInstantDoc(subTerm) : onLoadedInstantDoc(subTerm),
            ];

            await Promise.all(mainLoader);

            await (this.$mainMenu.attr(eds.exported) == t1 ? loadExportedMainMenu(subTerm) : onLoadedMainMenu(subTerm));
            await (this.$overwatchPanel.attr(eds.exported) == t1 ? loadExportedOverwatchPanel(subTerm) : onLoadedOverwatchPanel(subTerm));

            this.initSessionManager();

            
            // $("#splashRoot").css("z-index", null);

            window.addEventListener("focus", (e) => {
                // note("onFocus");
                this.onFocus();
            });
            window.addEventListener("blur", (e) => {
                // note("onBlur");
                this.onBlur();
            });

            // C (roadmap #006) — visibilitychange routes to onFocus/onBlur.
            // More reliable on mobile browsers than window focus/blur, especially
            // on Android WebView where native focus changes may not surface as JS events.
            // Idempotent via the pageHandle.isFocused guard, so duplication with
            // window focus/blur is harmless.
            document.addEventListener("visibilitychange", () => {
                if (window.isDebug) console.log(`[visibilitychange] state=${document.visibilityState} hasFocus=${document.hasFocus()}`);
                if (document.visibilityState === "visible") this.onFocus();
                else this.onBlur();
            });

            // A (roadmap #006) — track lastFocusedElement on the topmost showing handle.
            // focusin bubbles (unlike blur), so a single document-level capture covers
            // every page. Used by phase B's autoFocus to restore the prior focus point.
            document.addEventListener("focusin", (e) => {
                const topHandle = this.showingTopArticle ?? this.mainCurrentOnTop;
                if (topHandle != null && topHandle.host?.contains(e.target)) {
                    topHandle.lastFocusedElement = e.target;
                }
            }, true);

            if (setOnReady) this.checkOnReady();
        });
    },

    setReload() {
        const inst = this;
        $(window).on("keydown", function (e) {
            if ((e.which || e.keyCode) == 116) {
                if (!e.ctrlKey) {
                    e.preventDefault();
                    inst.onReload();
                    return false;
                }
            }
        });
    },

    setBackNavigation() {
        const inst = this;
        window.addEventListener("popstate", async function (e) {
            const state = e.state;

            if (state?.offset != null && state?.offset <= history.length) {
                inst.isBackwardFlow = true;

                if (await inst.onBack()) {
                    // note("[" + history.length + "] poped - " + history.state?.euiState + " / [" + history.state?.offset + "] " + history.state?.currentTopPid);

                } else {
                    if (history.length < inst.initialHistoryOffset + 1 || state?.euiState == "initializing") {
                        note(EsLocale.get("exitApplicationWhenPressBackAgain"));
                        // inst.pushCurrentState(inst.currentTopPage, state);
                    }
                }

                inst.isBackwardFlow = false;
            }
        }, false);

        // window.addEventListener("pageshow", async function (e) {
        //     if (await inst.onBack()) {
        //         e.preventDefault();
        //         note("prevented");
        //         return false;
        //     }
        // });

        // $(window).on("beforeunload", async function(e) {
        //     if (await inst.onBack()) {
        //         e.preventDefault();
        //         e.returnValue = "";
        //         return false;
        //     } else {
        //         alert(e.type);
        //     }
        // });
    },

    pushCurrentState(pageHandle = this.currentTopPage, currentState = history.state) {
        if (this.isBackwardFlow) return false;
        let currentTopPid = currentState?.currentTopPid;

        if (pageHandle != null && currentTopPid == null) {
            const sectionBound = pageHandle.sectionBound;
            if (sectionBound != "main" && sectionBound != "blind" && sectionBound != "menu") return false;

            currentTopPid = pageHandle != null ? EstreUiPage.from(pageHandle)?.pid : null;
        }
        // if (currentTopPid == null) currentTopPid = this.currentTopPid;
        if (currentTopPid == null) return false;

        const euiState = currentState?.euiState ?? this.euiState;
        const offset = currentState?.offset ?? history.length;
        history.pushState({ euiState, currentTopPid, offset }, null);
        // note("[" + history.length + "] pushed - " + euiState + " / [" + offset + "] " + currentTopPid);

        return true;
    },

    replaceCurrentState(pageHandle = this.currentTopPage) {
        if (pageHandle != null) {
            const sectionBound = pageHandle.sectionBound;
            if (sectionBound != "main" && sectionBound != "blind" && sectionBound != "menu") return false;

        }

        let currentTopPid = pageHandle != null ? EstreUiPage.from(pageHandle)?.pid : null;
        // if (currentTopPid == null) currentTopPid = this.currentTopPid;

        if (currentTopPid != null) {
            if (currentTopPid == history.state?.currentTopPid) return false;

            if (history.state != null) this.pushCurrentState();
        }

        const euiState = this.euiState;
        const offset = history.length;
        history.replaceState({ euiState, currentTopPid, offset }, null);
        // note("[" + history.length + "] replaced - " + euiState + " / [" + offset + "] "  + currentTopPid);

        return true;
    },


    //dark mode
    setupDarkMode() {
        if (window.matchMedia) {
            this.darkModeMql = window.matchMedia("(prefers-color-scheme: dark)");
            const onChange = _ => { if (this.darkMode == null) this.applyDarkMode(); };
            if (this.darkModeMql.addEventListener) this.darkModeMql.addEventListener("change", onChange);
            else this.darkModeMql.addListener(onChange);
        }
        this.applyDarkMode();
    },

    setDarkMode(value) {
        let pref;
        if (value == null) pref = null;
        else if (value === false || value === 0 || value === "0") pref = false;
        else pref = true;

        if (pref == null) localStorage.removeItem("estreUi.darkMode");
        else localStorage.setItem("estreUi.darkMode", pref ? "1" : "0");

        this.applyDarkMode();
        return this.isDarkMode;
    },

    applyDarkMode() {
        const pref = this.darkMode;
        const active = (pref == null) ? (this.darkModeMql?.matches ?? false) : pref;
        if (active) document.body.dataset.darkMode = "1";
        else delete document.body.dataset.darkMode;
        this.updateDarkModeToggleWidgets();
    },

    // Cycle auto -> light -> dark -> auto (single-button 3-state control)
    cycleDarkMode() {
        const pref = this.darkMode;
        if (pref == null) this.setDarkMode(false);
        else if (pref === false) this.setDarkMode(true);
        else this.setDarkMode(null);
        return this.darkMode;
    },

    /**
     * Register a tile in the quickPanel section of overwatchPanel.
     * Host projects call this after estreUi.init to append custom toggles/shortcuts.
     *
     * @param {Object} config
     * @param {string} config.id unique DOM id for the tile
     * @param {string} [config.icon] short glyph or emoji shown in the .tile_icon span
     * @param {string} [config.label] text label shown in the .tile_label span
     * @param {Function} [config.onClick] click handler; receives the jQuery event
     * @returns {HTMLElement|null} the tile element, or null if quickPanel is not ready / id collides
     */
    registerOverwatchPanelTile(config) {
        if (config == null || config.id == null) return null;
        const $tiles = this.$overwatchPanel?.find("#quickPanel .quick_tiles");
        if ($tiles == null || $tiles.length < 1) return null;
        if ($tiles.find("#" + config.id).length > 0) return null;
        const $tile = $("<button>").addClass("quick_tile").attr("type", "button").attr("id", config.id);
        $tile.append($("<span>").addClass("tile_icon").attr("aria-hidden", "true").text(config.icon ?? ""));
        $tile.append($("<span>").addClass("tile_label").text(config.label ?? ""));
        if (typeof config.onClick == "function") $tile.on("click", config.onClick);
        $tiles.append($tile);
        return $tile[0];
    },

    unregisterOverwatchPanelTile(id) {
        if (id == null) return false;
        const $tile = this.$overwatchPanel?.find("#quickPanel .quick_tiles #" + id);
        if ($tile == null || $tile.length < 1) return false;
        $tile.off("click").remove();
        return true;
    },

    updateDarkModeToggleWidgets() {
        const $widgets = $("#darkModeToggle");
        if ($widgets.length < 1) return;
        const pref = this.darkMode;
        const state = (pref == null) ? "auto" : (pref ? "dark" : "light");
        const icon = state == "light" ? "\u2600\uFE0F" : (state == "dark" ? "\u263D" : "\u{1F313}");
        const label = state.charAt(0).toUpperCase() + state.slice(1);
        $widgets.each(function() {
            const $w = $(this);
            $w.attr("data-dark-mode-state", state);
            $w.find(".tile_icon").text(icon);
            $w.find(".tile_label").text(label);
        });
    },


    //mainMenu
    setMenuSwipeHandler() {
        if (this.$mainMenu.length > 0) {
            this.releaseMenuSwipeHandler();
            const ui = this;
            this.menuSwipeHandler = new EstreSwipeHandler(this.$mainMenu).unuseY().setOnUp(function(grabX, grabY, handled, canceled, directed) {
                if (window.isVerbosely) console.log("grabX: " + grabX + ", grabY: " + grabY + ", lastX: " + this.lastX + ", startX: " + this.startX);
                if (handled) {
                    const isOpen = ui.$mainMenu.hasClass("right") ? grabX < 0 : grabX > 0;
                    setTimeout(_ => {
                        if (isOpen) ui.openMainMenu();
                        else ui.closeMainMenu();
                    }, 0);
                }
            });
        }
    },

    releaseMenuSwipeHandler() {
        if (this.menuSwipeHandler != null) this.menuSwipeHandler.release();
    },


    //overwatchPanel
    setPanelSwipeHandler() {
        if (this.$overwatchPanel.length < 1) return;
        this.releasePanelSwipeHandler();
        const ui = this;
        if (this.$panelTrigger.length > 0) {
            this.panelOpenSwipeHandler = new EstreSwipeHandler(this.$panelTrigger[0]).unuseX()
                .setResponseBound(this.$overwatchPanel)
                .setOnUp(function(grabX, grabY, handled, canceled, directed) {
                    if (handled && grabY > 0 && !ui.isOpenOverwatchPanel) {
                        setTimeout(_ => ui.openOverwatchPanel(), 0);
                    }
                });
        }
        if (this.$panelGrabArea.length > 0) {
            this.panelCloseSwipeHandler = new EstreSwipeHandler(this.$panelGrabArea[0]).unuseX()
                .setResponseBound(this.$overwatchPanel)
                .setOnUp(function(grabX, grabY, handled, canceled, directed) {
                    if (handled && grabY < 0 && ui.isOpenOverwatchPanel) {
                        setTimeout(_ => ui.closeOverwatchPanel(), 0);
                    }
                });
        }
    },

    releasePanelSwipeHandler() {
        if (this.panelOpenSwipeHandler != null) { this.panelOpenSwipeHandler.release(); this.panelOpenSwipeHandler = null; }
        if (this.panelCloseSwipeHandler != null) { this.panelCloseSwipeHandler.release(); this.panelCloseSwipeHandler = null; }
    },

    // The .dynamic_section_block inside overwatchPanel lives outside any <article>,
    // so the standard article-scoped handle init never reaches it. Attach the handle
    // here with the panel itself acting as a minimal host.
    initOverwatchPanelHandles() {
        if (this.$overwatchPanel.length < 1) return;
        const $block = this.$panelBlock;
        if ($block == null || $block.length < 1) return;
        const host = { $host: this.$overwatchPanel };
        new EstreDynamicSectionBlockHandle($block[0], host).init();
    },

    // Mounts EstreTimelineView onto overwatchPanel #timeline slot (roadmap #010).
    // Timeline persists entries left by checkOut()ed noti banners.
    initOverwatchPanelTimeline() {
        if (typeof EstreTimelineView === "undefined") return;
        if (this.$overwatchPanel == null || this.$overwatchPanel.length < 1) return;
        const $timeline = this.$overwatchPanel.find("#timeline");
        if ($timeline.length < 1) return;
        this.timelineView = new EstreTimelineView($timeline);
    },

    setOverwatchPanelClock() {
        if (this.$panelClock == null) return;
        const now = new Date();
        if (this.$panelClock.length > 0) {
            const hh = String(now.getHours()).padStart(2, "0");
            const mm = String(now.getMinutes()).padStart(2, "0");
            this.$panelClock.text(hh + ":" + mm);
        }
        if (this.$panelDate.length > 0) {
            const fmt = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });
            this.$panelDate.text(fmt.format(now));
        }
    },

    scheduleOverwatchPanelClock() {
        this.releaseOverwatchPanelClock();
        this.setOverwatchPanelClock();
        const now = new Date();
        const msToNext = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
        this.panelClockTimeoutId = setTimeout(_ => {
            this.setOverwatchPanelClock();
            this.panelClockIntervalId = setInterval(_ => this.setOverwatchPanelClock(), 60000);
        }, msToNext);
    },

    releaseOverwatchPanelClock() {
        if (this.panelClockTimeoutId != null) { clearTimeout(this.panelClockTimeoutId); this.panelClockTimeoutId = null; }
        if (this.panelClockIntervalId != null) { clearInterval(this.panelClockIntervalId); this.panelClockIntervalId = null; }
    },

    mainMenuBtnOnClick(e) {
        estreUi.toggleMainMenuButton();
    },

    mainMenuGrabAreaOnclick(e) {
        estreUi.closeMainMenu();
    },

    overwatchPanelGrabAreaOnclick(e) {
        estreUi.closeOverwatchPanel();
    },

    toggleMainMenuButton() {
        if (this.isOpenMainMenu) return this.closeMainMenu();
        else return this.openMainMenu();
    },

    openMainMenu() {
        if (!this.isOpenMainMenu) {
            this.$mainMenu.attr(eds.opened, t1);
            const $top = this.$menuSections.filter(asv(eds.onTop, t1));
            const menuCurrentTop = $top[$top.length - 1]?.pageHandle;//?.focus();
            if (menuCurrentTop != null) {
                this.menuCurrentOnTop = menuCurrentTop;
                menuCurrentTop.show();
            }

            const lottie = this.getMainMenuLottie();
            if (lottie != null) {
                lottie.pause();
                lottie.setDirection(1);
                lottie.setSegment(0, 30);
                lottie.goToAndPlay(0, true);
            }
            return true;
        } else return false;
    },

    closeMainMenu() {
        if (this.isOpenMainMenu) {
            this.$mainMenu.attr(eds.opened, "");
            // const $top = this.$menuSections.filter(asv(eds.onTop, t1));
            // $top[$top.length - 1]?.pageHandle?.blur();
            this.menuCurrentOnTop?.onHide();

            const lottie = this.getMainMenuLottie();
            if (lottie != null) {
                lottie.pause();
                lottie.setDirection(-1);
                lottie.goToAndPlay(30, true);
            }
            return true;
        } else return false;
    },

    getMainMenuLottie() {
        return this.$mainMenuBtnLottie[0]?.getLottie?.();
    },


    //overwatchPanel
    toggleOverwatchPanel(sectionId) {
        if (this.isOpenOverwatchPanel) return this.closeOverwatchPanel();
        else return this.openOverwatchPanel(sectionId);
    },

    openOverwatchPanel(sectionId) {
        if (!this.isOpenOverwatchPanel) {
            this.$overwatchPanel.attr(eds.opened, t1);
            if (sectionId != null) this.showOverwatchPanelSection(sectionId);
            else {
                const $top = this.$panelSections.filter(asv(eds.onTop, t1));
                const panelCurrentTop = $top[$top.length - 1]?.pageHandle;
                if (panelCurrentTop != null) {
                    this.panelCurrentOnTop = panelCurrentTop;
                    panelCurrentTop.show(false);
                }
            }
            return true;
        } else if (sectionId != null) {
            this.showOverwatchPanelSection(sectionId);
            return true;
        } else return false;
    },

    closeOverwatchPanel() {
        if (this.isOpenOverwatchPanel) {
            this.$overwatchPanel.attr(eds.opened, "");
            this.panelCurrentOnTop?.onHide();
            return true;
        } else return false;
    },

    showOverwatchPanelSection(id) {
        const $target = this.$panelSections.filter(eid + id);
        if ($target.length < 1) return false;
        const targetEl = $target[$target.length - 1];
        targetEl.scrollIntoView({ behavior: "smooth", block: "start", inline: "start" });
        const targetComponent = targetEl.pageHandle;
        if (targetComponent != null) {
            targetComponent.show(false);
            this.panelCurrentOnTop = targetComponent;
        }
        return true;
    },


    //rootbar
    initRootbar() {
        this.$rootTabs = this.$tabsbar.find(c.c + btn);
        this.$rootTabs.attr(eds.active, "");

        var topId = null;
        const topSection = this.$mainSections.filter(asv(eds.onTop, t1));
        if (topSection.length > 0) topId = topSection.attr("id");

        if (topId != null) {
            this.$rootTabs.filter(aiv(eds.tabId, topId)).attr(eds.active, t1);
        }

        this.$rootTabs.filter(ax(eds.tabId)).click(this.rootTabOnClick);
    },

    // Cover bar — instantiates the handle bound to the loaded fixedBottom
    // markup. Idempotent: subsequent calls noop, so reload paths are safe.
    // Phase 1C-2/1C-3 add lifecycle hooks and entry rendering on top of this.
    initCoverBar() {
        if (this.coverBarHandle != null) return;
        if (this.$fixedBottom == null || this.$fixedBottom.length === 0) return;
        this.coverBarHandle = new EstreCoverBarHandle(this.$fixedBottom, this.$topLayer);
    },

    showExactAppbar(component, container, article) {
        const appbar = this.appbar;
        if (appbar == null) return;
        const currentExactComponent = this.isOpenMainMenu ? this.menuCurrentOnTop : this.mainCurrentOnTop;
        if (component == null) component = currentExactComponent;
        if (component == null) return;
        if (container != null && component != currentExactComponent) return null;
        const currentExactContainer = currentExactComponent.currentOnTop;
        if (article != null && container != currentExactContainer) return null;

        const isHomeComponent = component.isHome;
        const topContainer = component.currentTop;
        const isRootContainer = topContainer != null ? topContainer?.isRoot ?? false : true;
        const isSingleContainer = component.isSingleContainer;
        const isRootOrSingle = isRootContainer || isSingleContainer;

        const topArticle = topContainer?.currentTop;
        const isMainArticle = topArticle != null ? topArticle?.isMain ?? false : true;
        const isSingleArticle = container?.isSingleArticle ?? topContainer?.isSingleArticle ?? true;
        const isMainOrSingle = isMainArticle || isSingleArticle;

        let success = false;
        if (!success && topArticle != null) success = appbar.showContainer("article_" + topArticle.id);
        if (!success && topContainer != null) success = appbar.showContainer("container_" + topContainer.id);
        if (!success && isRootContainer) success = appbar.showContainer(component.id);
        if (!success && isHomeComponent && isRootOrSingle && isMainOrSingle) success = appbar.showContainer("home");
        if (!success && isMainArticle) success = appbar.showContainer("main");
        if (!success && isRootContainer) success = appbar.showContainer("root");
        if (!success && (!isHomeComponent || !isRootContainer)) success = appbar.showContainer("sub");
        estreUi.releaseAppbarPageTitle();
        estreUi.releaseAppbarLeftToolSet();
        estreUi.releaseAppbarRightToolSet();

        return success;
    },

    setAppbarPageTitle(text) {
        this.appbar?.handler?.setPageTitle(text);
    },

    releaseAppbarPageTitle() {
        this.setAppbarPageTitle(this.isOpenMainMenu ? this.menuCurrentOnTop?.title ?? "" : this.mainCurrentOnTop?.title ?? "");
    },

    setAppbarLeftToolSet(frostOrCold, matchReplacer, dataName = "frozen") {
        if (typeFunction(frostOrCold)) return frostOrCold(feed => this.appbar?.handler?.setAppbarLeftToolSet(feed, matchReplacer, dataName));
        else return $(this.appbar?.handler?.setAppbarLeftToolSet(frostOrCold, matchReplacer, dataName));
    },

    releaseAppbarLeftToolSet() {
        const appbarFeed = this.isOpenMainMenu ? this.menuCurrentOnTop?.appbarLeftFeed : this.mainCurrentOnTop?.appbarLeftFeed;
        return this.setAppbarLeftToolSet(appbarFeed);
    },

    setAppbarRightToolSet(frostOrCold, matchReplacer, dataName = "frozen") {
        if (typeFunction(frostOrCold)) return frostOrCold(feed => this.appbar?.handler?.setAppbarRightToolSet(feed, matchReplacer, dataName));
        else return $(this.appbar?.handler?.setAppbarRightToolSet(frostOrCold, matchReplacer, dataName));
    },

    releaseAppbarRightToolSet() {
        const appbarFeed = this.isOpenMainMenu ? this.menuCurrentOnTop?.appbarRightFeed : this.mainCurrentOnTop?.appbarRightFeed;
        return this.setAppbarRightToolSet(appbarFeed);
    },

    rootTabOnClick(e) {
        const target = this.tagName == BTN ? this : (e.target.tagName == BTN ? e.target : e.target.parentElement);
        estreUi.switchRootTab(target);
    },

    switchRootTab($target, intent) {
        switch (typeof $target) {
            case "number":
                if ($target < this.$rootTabs.length) return this.switchRootTab(this.$rootTabs[$target], intent);
                break;

            case "string":
                const targets = this.$rootTabs.filter(aiv(eds.tabId, $target));
                if ($target.length < 1) $target = this.$fixedPageList.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));
                if (targets.length > 0) return this.switchRootTab(targets[0], intent);
                break;

            case "object":
                if ($target instanceof jQuery) ;//do nothing
                else $target = $($target);

                const id = $target.attr(eds.tabId);
                const $targetSection = this.$mainSections.filter(eid + id);
                const isModal = $targetSection.hasClass("modal");

                var unhandled = false;
                if (isModal) {
                    if ($targetSection[0]?.pageHandle?.isOnTop) {
                        return this.closeModalTab(id, $targetSection);
                    } else return this.openModalTab(id, $targetSection, intent);
                }

                //단일 탭 사용 기준 구현
                const $elseSections = this.$mainSections.filter(asv(eds.onTop, t1) + nti(id));
                if ($elseSections.length > 0) {
                    for (var section of $elseSections) section.pageHandle?.hide();

                    const currentTopHandle = this.mainCurrentOnTop;
                    const currentTopHandleId = currentTopHandle?.id;
                    if (id != currentTopHandleId && currentTopHandleId != this.latestRootTabId) {
                        this.prevRootTabId = currentTopHandleId;
    
                        // if (estreUi.euiState == "onReady" && currentTopHandle != null) {
                        //     estreUi.pushCurrentState(currentTopHandle);
                        // }
                    }
                }
                this.$rootTabs.filter(aiv(eds.active, t1) + naiv(eds.tabId, id)).attr(eds.active, "");

                const targetComponent = this.mainSections[id];
                if (targetComponent.isOnTop) {
                    unhandled = true;
                    
                    //현재 선택된 탭을 다시 선택했을 때
                    targetComponent.back();
                    // history.back();
                } else {
                    targetComponent.pushIntent(intent);
                    targetComponent.show(false);
                    this.mainCurrentOnTop = targetComponent;

                    this.showExactAppbar(targetComponent);
                }

                this.$rootTabs.blur();

                if ($target.attr(eds.active) == t1) {
                    //do nothing //추후 방향에 따라 섹션 새로고침 등 구현
                } else {
                    $target.attr(eds.active, t1);
                }

                return !unhandled;
                //break;
        }
    },

    switchRootTabPrev() {
        const prev = this.prevRootTabId;
        if (prev != null) {
            const processed = this.switchRootTab(prev);
            return processed;
        } else return false;
    },

    openInstantBlinded(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id);
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$blindArea.append(page.live);
        const $section = this.$blindSections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initInstantContent($section[$section.length - 1], intent, instanceOrigin);
        if (component.isOnTop) component.show(false);
        return component;
    },

    showInstantBlinded(id, intent, instanceOrigin) {
        let $targetSection = this.$blindSections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$blindSections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }

        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$blindSections, $targetSection, intent);
        }

        const $elseSections = this.$blindSections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);

            const currentTopHandle = this.blindedCurrentOnTop;
            const currentTopHandleId = currentTopHandle?.id;
            if (id != currentTopHandleId && currentTopHandleId != this.latestBlindedId) {
                this.prevBlindedId = currentTopHandleId;

                // if (estreUi.euiState == "onReady" && currentTopHandle != null) {
                //     estreUi.pushCurrentState(currentTopHandle);
                // }
            }
        }

        let targetComponent = this.blindSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.blindSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.blindSections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.blindedCurrentOnTop = targetComponent;
        }

        return !unhandled;
    },

    async closeInstantBlinded(id, instanceOrigin, isTermination) {
        let component = this.blindSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.blindSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.blindSections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$blindSections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            if (!component.$host.hasClass("home")) {
                isTermination ??= !component.isStatic;
                const closed = await component.close(false, isTermination);
                setTimeout(async _ => {
                    const $components = this.$blindSections.filter(naiv(m.id, id));
                    if ($components.length > 0) {
                        const prevComponent = this.prevBlindedId?.let(it => this.blindSections[it]);
                        if (prevComponent != null) await prevComponent.show();
                        else await $components[$components.length - 1]?.pageHandle?.show();
                    }
                }, 0);
                if (isTermination) await this.releaseInstantContent(component);
                return closed;
            } else return false;
        }
    },

    openMenuArea(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id);
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$mainMenu.append(page.live);
        const $section = this.$menuSections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initStaticMenu($section[$section.length - 1], intent, instanceOrigin);
        if (component.isOnTop) component.show(false);
        return component;
    },

    showMenuArea(id, intent, instanceOrigin) {
        let $targetSection = this.$menuSections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$menuSections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }
        
        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$menuSections, $targetSection, intent);
        }

        const $elseSections = this.$menuSections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);
        }

        let targetComponent = this.menuSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.menuSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.menuSections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.menuCurrentOnTop = targetComponent;

            this.showExactAppbar(targetComponent);
        }

        return !unhandled;
    },

    async closeMenuArea(id, instanceOrigin, isTermination) {
        let component = this.menuSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.menuSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.menuSections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$menuSections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            isTermination ??= !component.isStatic;
            const closed = await component.close(false, isTermination);
            if (isTermination) await this.releaseInstantContent(component);
            return closed;
        }
    },

    openHeaderBar(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id);
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$headerArea.append(page.live);
        const $section = this.$headerSections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initHeaderBar($section[$section.length - 1], intent, instanceOrigin);
        // if (component.isOnTop) component.show(false);
        return component;
    },

    showHeaderBar(id, intent, instanceOrigin) {
        let $targetSection = this.$headerSections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$headerSections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }

        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$headerSections, $targetSection, intent);
        }

        const $elseSections = this.$headerSections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);
        }

        let targetComponent = this.headerSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.headerSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.headerSections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.headerCurrentOnTop = targetComponent;
        }

        return !unhandled;
    },

    async closeHeaderBar(id, instanceOrigin, isTermination) {
        let component = this.headerSections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.headerSections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.headerSections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$headerSections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            isTermination ??= !component.isStatic;
            const closed = await component.close(false, isTermination);
            if (isTermination) await this.releaseInstantContent(component);
            return closed;
        }
    },

    openManagedOverlay(id, intent, instanceOrigin) {
        const page = pageManager.getComponent(id, "overlay");
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$overlayArea.append(page.live);
        const $section = this.$overlaySections.filter(eid + id);
        if ($section == null || $section.length < 1) return null;
        const component = this.initOverlayContent($section[$section.length - 1], intent, instanceOrigin);
        // if (component.isOnTop) component.show(false);
        return component;
    },

    showManagedOverlay(id, intent, instanceOrigin) {
        let $targetSection = this.$overlaySections.filter(eid + id + (instanceOrigin?.let(it => aiv(eds.instanceOrigin, it)) ?? ""));

        if ($targetSection.length < 1) {
            if (instanceOrigin != null) return false;
            $targetSection = this.$overlaySections.filter(eid + id);
            if ($targetSection.length < 1) return false;
            $targetSection = $($targetSection[$targetSection.length - 1]);
        }

        const isModal = $targetSection.hasClass("modal");

        var unhandled = false;
        if (isModal) {
            const onTop = $targetSection.attr(eds.onTop);
            if (onTop == t1 || onTop == "1*") {
                //do nothing
            } else return this.openModalSection(id, this.$overlaySections, $targetSection, intent);
        }

        const $elseSections = this.$overlaySections.filter(asv(eds.onTop, t1) + nti(id));
        if ($elseSections.length > 0) {
            for (var section of $elseSections) section.pageHandle?.hide(false);
        }

        let targetComponent = this.overlaySections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (targetComponent == null) {
            if (instanceOrigin != null) return false;
            const componentIds = this.overlaySections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return false;
            targetComponent = this.overlaySections[componentIds[componentIds.length - 1]];
        }
        targetComponent.pushIntent(intent);
        if (targetComponent.isOnTop) {
            unhandled = true;
        } else {
            targetComponent.show(false);
            this.overlayCurrentOnTop = targetComponent;
        }

        return !unhandled;
    },

    async closeManagedOverlay(id, instanceOrigin, isTermination) {
        let component = this.overlaySections[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
        if (component == null) {
            if (instanceOrigin != null) return null;
            const componentIds = this.overlaySections.ways.filter(it => it.startsWith(id + "^"));
            if (componentIds.length < 1) return null;
            component = this.overlaySections[componentIds[componentIds.length - 1]];
        }
        const $targetSection = component.$host;
        const isModal = $targetSection.hasClass("modal");

        if (isModal) {
            if (component.isOnTop) {
                const closed = await this.closeModalSection(id, this.$overlaySections, $targetSection);
                if (!component.isStatic) await this.releaseInstantContent(component);
                return closed;
            } else return null;
        } else {
            isTermination ??= !component.isStatic;
            const closed = await component.close(false, isTermination);
            if (isTermination) await this.releaseInstantContent(component);
            return closed;
        }
    },

    openModalTab(id, $targetSection, intent = null, $sectionSet = this.$mainSections) {
        var $target = this.$fixedBottom.find(btn + aiv(eds.tabId, id));
        if ($target.length < 1) $target = this.$sessionGroupHolder.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));

        $target.attr(eds.active, t1);

        return this.openModalSection(id, $sectionSet, $targetSection, intent);
    },

    openModalSection(id, $sectionSet = this.$mainSections, $targetSection, intent = null) {
        var $target = this.$fixedBottom.find(btn + aiv(eds.tabId, id));
        if ($target.length < 1) $target = this.$sessionGroupHolder.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));

        if ($targetSection == null) $targetSection = $sectionSet.filter(eid + id);

        const isMainSection = $sectionSet == this.$mainSections;
        const isBlildSection = $sectionSet == this.$blindSections;
        const isMenuSection = $sectionSet == this.$menuSections;
        const isOverlaySection = $sectionSet == this.$overlaySections;
        const isHeaderSection = $sectionSet == this.$headerSections;
        const component = isMainSection ? this.mainSections[id] : (isBlildSection ? this.blindSections[id] : (isMenuSection ? this.menuSections[id] : (isOverlaySection ? this.overlaySections[id] : (isHeaderSection ? this.headerSections[id] : null))));

        // if (isMainSection && this.mainCurrentOnTop != null) this.prevRootTabId = this.mainCurrentOnTop.id;

        component?.pushIntent(intent);
        
        $targetSection.off("click");
        $targetSection.click(function(e) {
            e.preventDefault();

            estreUi.closeModalTab(this.id, $targetSection, $sectionSet);

            return false;
        });
        const $container = $targetSection.find(c.c + div + uis.container);
        $container.off("click");
        $container.click(function(e) {
            e.preventDefault();

            return false;
        });

        return $targetSection[0]?.pageHandle?.show(false);
    },

    closeModalTab(id, $targetSection, $sectionSet = this.$mainSections) {
        var $target = this.$fixedBottom.find(btn + aiv(eds.tabId, id));
        if ($target.length < 1) $target = this.$sessionGroupHolder.find(btn + aiv(eds.contained, "root") + aiv(eds.containerId, id));

        $target.attr(eds.active, "");

        return this.closeModalSection(id, $sectionSet, $targetSection);
    },

    closeModalSection(id, $sectionSet = this.$mainSections, $targetSection) {
        if ($targetSection == null) $targetSection = $sectionSet.filter(eid + id);

        // if ($sectionSet == this.$mainSections) this.prevRootTabId = $targetSection.attr("id");

        $targetSection.off("click");
        $targetSection.find(c.c + div + uis.container).off("click");
        
        return $targetSection[0]?.pageHandle?.close(false);
    },

    async initOverlayContents(term = 0) {
        const $oss = this.$overlaySections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$oss.length; i++) {
            this.initOverlayContent($oss[i], null, u, true);
            await delayer();
        }

        // let $top = this.$overlaySections.filter(asv(eds.onTop, t1));
        // if ($top.length < 1) $top = this.$overlaySections;
        // $top[$top.length - 1]?.pageHandle?.show(false);
    },

    releaseOverlayContent(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.blindSections[instanceId] != null) delete this.overlaySections[instanceId];
        const index = this.overlaySectionList.indexOf(component);
        if (index > -1) this.overlaySectionList.splice(index, 1);
    },

    initOverlayContent(bound, intent = null, instanceOrigin, init = false) {
        this.releaseOverlayContent(bound.pageHandle);
        const component = new EstreOverlayComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.overlaySections[component.instanceId] = component;
            this.overlaySectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop && component.isStatic) component.show(false);
        return component;
    },

    async initInstantContents(term = 0) {
        const $bss = this.$blindSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$bss.length; i++) {
            this.initInstantContent($bss[i], null, u, true);
            await delayer();
        }

        const $top = this.$blindSections.filter(asv(eds.onTop, t1));
        // if ($top.length < 1) $top = this.$blindSections;
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.blindedCurrentOnTop = targetComponent;
        }
    },

    releaseInstantContent(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.blindSections[instanceId] != null) delete this.blindSections[instanceId];
        const index = this.blindSectionList.indexOf(component);
        if (index > -1) this.blindSectionList.splice(index, 1);
    },

    initInstantContent(bound, intent = null, instanceOrigin, init = false) {
        this.releaseInstantContent(bound.pageHandle);
        const component = new EstreInstantComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.blindSections[component.instanceId] = component;
            this.blindSectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop && component.isStatic) component.show(false);
        return component;
    },

    async initStaticContents(term = 0) {
        const $mss = this.$mainSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$mss.length; i++) {
            this.initStaticContent($mss[i], null, u, true);
            await delayer();
        }

        let $top = this.$mainSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$mainSections.filter(eid + "home");
        if ($top.length < 1) $top = this.$mainSections.filter(cls + "home");
        if ($top.length < 1) $top = this.$mainSections;
        if ($top.length > 0) {
            const targetComponent = $top[0].pageHandle;
            targetComponent?.show(false);
            this.mainCurrentOnTop = targetComponent;
        }
    },

    releaseStaticContent(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.mainSections[instanceId] != null) delete this.mainSections[instanceId];
        const index = this.mainSectionList.indexOf(component);
        if (index > -1) this.mainSectionList.splice(index, 1);
    },

    initStaticContent(bound, intent = null, instanceOrigin, init = false) {
        this.releaseStaticContent(bound.pageHandle);
        const component = new EstreComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.mainSections[component.instanceId] = component;
            this.mainSectionList.push(component);
        }
        component.init(intent);
        // var $sections = this.$mainSections.filter(asv(eds.onTop, t1));
        // if ($sections.length < 1) $sections = this.$mainSections;
        // if (component.isOnTop && component.isStatic && (!init || bound == $sections[$sections.length - 1])) component.show(false);
        return component;
    },

    async initStaticMenus(term = 0) {
        const $mss = this.$menuSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$mss.length; i++) {
            this.initStaticMenu($mss[i], null, u, true);
            await delayer();
        }

        let $top = this.$menuSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$menuSections.filter(eid + "menuArea");
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.menuCurrentOnTop = targetComponent;
        }
    },

    releaseStaticMenu(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.menuSections[instanceId] != null) delete this.menuSections[instanceId];
        const index = this.menuSectionList.indexOf(component);
        if (index > -1) this.menuSectionList.splice(index, 1);
    },

    initStaticMenu(bound, intent = null, instanceOrigin, init = false) {
        this.releaseStaticMenu(bound.pageHandle);
        const component = new EstreMenuComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.menuSections[component.instanceId] = component;
            this.menuSectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop) component.show(false);
        return component;
    },

    async initStaticPanels(term = 0) {
        const $pss = this.$panelSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$pss.length; i++) {
            this.initStaticPanel($pss[i], null, u, true);
            await delayer();
        }

        let $top = this.$panelSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$panelSections.filter(eid + "quickPanel");
        if ($top.length < 1) $top = this.$panelSections;
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.panelCurrentOnTop = targetComponent;
        }
    },

    releaseStaticPanel(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.panelSections[instanceId] != null) delete this.panelSections[instanceId];
        const index = this.panelSectionList.indexOf(component);
        if (index > -1) this.panelSectionList.splice(index, 1);
    },

    initStaticPanel(bound, intent = null, instanceOrigin, init = false) {
        this.releaseStaticPanel(bound.pageHandle);
        const component = new EstrePanelComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.panelSections[component.instanceId] = component;
            this.panelSectionList.push(component);
        }
        component.init(intent);
        return component;
    },

    async initHeaderBars(term = 0) {
        const $hss = this.$headerSections;

        const delayer = (delay = term) => postPromise(resolve => setTimeout(resolve, delay));
        for (var i=0; i<$hss.length; i++) {
            this.initHeaderBar($hss[i], null, u, true);
            await delayer();
        }

        let $top = this.$headerSections.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$headerSections.filter(eid + "appbar");
        if ($top.length < 1) $top = this.$headerSections;
        if ($top.length > 0) {
            const targetComponent = $top[$top.length - 1].pageHandle;
            targetComponent?.show(false);
            this.headerCurrentOnTop = targetComponent;
        }
    },

    releaseHeaderBar(component) {
        if (component == null) return;
        const instanceId = component.instanceId;
        component.release(component.isStatic ? null : true);
        if (this.headerSections[instanceId] != null) delete this.headerSections[instanceId];
        const index = this.headerSectionList.indexOf(component);
        if (index > -1) this.headerSectionList.splice(index, 1);
    },

    initHeaderBar(bound, intent = null, instanceOrigin, init = false) {
        this.releaseHeaderBar(bound.pageHandle);
        const component = new EstreHeaderComponent(bound, instanceOrigin);
        if (!init || component.isStatic) {
            this.headerSections[component.instanceId] = component;
            this.headerSectionList.push(component);
        }
        component.init(intent);
        // if (component.isOnTop) component.show(false);
        return component;
    },

   initSessionManager() {
        this.$more = this.$mainSections.filter("#more");
        this.$sessionManager = this.$more.find(".session_manager");
        this.$sessionGroupHolder = this.$more.find(".session_group_holder");
        this.$fixedPages = this.$sessionGroupHolder.find(c.c + ".fixed_pages");
        this.$fixedPageList = this.$fixedPages.find(".session_list");
        this.$openedPages = this.$sessionGroupHolder.find(c.c + ".opened_pages");
        this.$openedPageList = this.$openedPages.find(".session_list");

        this.initSessionList(this.$fixedPageList);  
        this.initSessionList(this.$openedPageList);  
    },

    initSessionList($listHolder) {
        const $list = $listHolder.find(uis.pageShortCut);
        for (var item of $list) {
            this.setEventSessionItem($(item));
        }
    },

    setEventSessionItem($item) {
        if (!($item instanceof jQuery)) {
            this.setEventSessionItem($($item));
            return;
        }

        const inst = this;
        $item.find(btn).click(function(e) {
            const $this = $(this);
            const $item = $this.closest(".page_short_cut");
            const contained = $item.attr(eds.contained);
            const containerType = $item.attr(eds.containerType);
            const containerId = $item.attr(eds.containerId);

            switch(contained) {
                case "root":
                    if (containerType == "root_tab_content") inst.switchRootTab(containerId);
                    break;

                default:
                    if (containerType == "sub_page") {
                        const section = inst.mainSections[contained];
                        if (section.showContainer(containerId)) inst.switchRootTab(contained);
                    }
                    break;
            }
        });
    },


    focus(article) {
        const currentTopArticle = this.showingTopArticle;

        if (article == null && currentTopArticle == null) {
            let $top = this.$mainSections.filter(eid + "home");
            if ($top.length < 1) this.$mainSections.filter(cls + "home");
            if ($top.length < 1) this.$mainSections.filter(asv(eds.onTop, t1));
            if ($top.length < 1) this.$mainSections;
            const top = $top[0]?.pageHandle;
            if (top != null) {
                this.mainCurrentOnTop = top;
                top.focus();
            }
        } else if (article == currentTopArticle) return article.container.component.focus();
        else if (article == null) return currentTopArticle.container.component.focus();
    },

    reload() {
        return this.onReload();
    },

    back() {
        return this.onBack();
    },

    closeContainer() {
        return this.onCloseContainer();
    },

    
    async onReload() {
        return this.isOpenMainMenu ? await this.onReloadMenu() : false ||
            await this.onReloadBlinded() || await this.onReloadMain();
    },

    async onBack() {
        // External handler stack first (LIFO). Each entry can absorb the back
        // input by returning truthy; falsy lets the next entry (and finally the
        // EstreUI section stack below) try. Errors are isolated and logged.
        for (let i = this.externalBackStack.length - 1; i >= 0; i--) {
            try {
                if (await this.externalBackStack[i].handler()) return true;
            } catch (e) {
                if (window.isLogging) console.warn("[estreUi] external back handler error", e);
            }
        }
        if (await this.onBackOverlay()) return true;
        if (onBackWhile()) return true;
        if (this.isOpenMainMenu) {
            return await this.onBackMenu() || await this.closeMainMenu();
        }
        return await this.onBackBlinded() || await this.onBackMain();
    },

    /**
     * Register a back handler from a host-mounted external embed.
     *
     * Handlers are consumed LIFO — the most recent push runs first on the next
     * `back()` / popstate. Returning `true` (or a Promise resolving truthy)
     * stops the chain and absorbs the back input; returning a falsy value lets
     * the previous entry (or the EstreUI section stack) try.
     *
     * Re-entry is fine: the same `handler` may be pushed multiple times; each
     * push gets a separate token and counts as a separate stack entry.
     *
     * @param {() => boolean | Promise<boolean>} handler
     * @returns {number | null} Token for `popBackHandler`, or `null` if `handler` is invalid.
     */
    pushBackHandler(handler) {
        if (typeof handler !== "function") {
            if (window.isLogging) console.warn("[estreUi] pushBackHandler — handler must be a function");
            return null;
        }
        const token = this.nextBackHandlerToken++;
        this.externalBackStack.push({ token, handler });
        return token;
    },

    /**
     * Remove a previously pushed handler. Out-of-order pop is allowed —
     * tokens identify entries independently of their stack position.
     *
     * @param {number} token
     * @returns {boolean} `true` if an entry was removed, `false` if the token was unknown.
     */
    popBackHandler(token) {
        const idx = this.externalBackStack.findIndex(it => it.token === token);
        if (idx < 0) {
            if (window.isLogging) console.warn("[estreUi] popBackHandler — token not found:", token);
            return false;
        }
        this.externalBackStack.splice(idx, 1);
        return true;
    },

    /**
     * Drop every external back handler — fallback cleanup for embed teardown
     * paths that cannot match tokens individually. Embeds should prefer paired
     * push/pop and reach for this only as a safety net.
     */
    clearAllExternalBackHandlers() {
        this.externalBackStack.length = 0;
    },


    // ─── instantSections — external embed hook (cover bar, Phase 3) ───
    //
    // Light-DOM-mounted embeds (external talk widgets, future docked tools…) can
    // surface their own windows in the right-side cover bar (instantSections)
    // using these four wrappers. Internally they delegate to the singleton
    // EstreCoverBarHandle managed by initCoverBar(); each push returns a
    // monotone positive integer token. The user's intent is reported back
    // through the per-entry `onAction(action)` callback, where `action` is
    // one of "focus" / "minimize" / "restore" / "close". The embed owns the
    // actual window transition — the bar only routes intent.

    /**
     * Register an external cover-bar entry. Returns a token; pass it back to
     * `updateInstantSectionEntry` / `removeInstantSectionEntry` /
     * `setInstantSectionActiveByToken`.
     *
     * With `closable: true` an ✕ button is rendered on the entry; clicking
     * it fires `onAction("close")`. The embed is responsible for the actual
     * close (so async confirm / server roundtrip can run first) and must
     * call `removeInstantSectionEntry` once the close completes.
     *
     * @param {object} data
     * @param {string} [data.title]
     * @param {string|null|undefined} [data.icon] — empty / undefined → sectionBound default, "none" / null → text-only, "<url>" → that URL
     * @param {string} [data.sectionBound] — "main" | "blind" | "overlay", drives the default icon
     * @param {(action: "focus"|"minimize"|"restore"|"close") => void} [data.onAction]
     * @param {boolean} [data.closable] — render an ✕ that fires onAction("close")
     * @param {number} [data.badge] — unread / notification count (0 or null → no badge, 1 → dot, 2-99 → numeric, >99 → "99+")
     * @returns {number|null} token, or `null` if the cover bar isn't initialised
     */
    pushInstantSectionEntry(data) {
        if (this.coverBarHandle == null) {
            if (window.isLogging) console.warn("[estreUi] pushInstantSectionEntry — coverBarHandle not initialised");
            return null;
        }
        return this.coverBarHandle.pushEntry({
            title: data?.title,
            icon: data?.icon,
            sectionBound: data?.sectionBound,
            onAction: data?.onAction,
            closable: data?.closable,
            badge: data?.badge,
        });
    },

    /**
     * Patch an existing external entry. `partial` may carry any of `title`,
     * `icon`, `onAction`, `closable`. Returns false if the token is unknown
     * or the cover bar isn't initialised.
     *
     * @param {number} token
     * @param {object} partial
     * @returns {boolean}
     */
    updateInstantSectionEntry(token, partial) {
        return this.coverBarHandle?.updateEntry(token, partial) ?? false;
    },

    /**
     * Remove an external entry. The bar detaches the DOM and forgets the
     * state; `activeToken` is cleared if the removed entry was active.
     *
     * @param {number} token
     * @returns {boolean}
     */
    removeInstantSectionEntry(token) {
        return this.coverBarHandle?.removeEntry(token) ?? false;
    },

    /**
     * Mark an external entry active (visually highlighted on the bar).
     * Call this from the embed when its window gains focus through some
     * other path than a bar click — e.g., the user clicked inside the
     * embed itself.
     *
     * @param {number} token
     * @returns {boolean}
     */
    setInstantSectionActiveByToken(token) {
        return this.coverBarHandle?.setActiveByToken(token) ?? false;
    },

    /**
     * Mark an external entry minimized / restored. Call this from the embed
     * when its window's visibility changes through a path other than a bar
     * click — e.g., the embed exposed its own minimize control.
     *
     * @param {number} token
     * @param {boolean} minimized
     * @returns {boolean}
     */
    setInstantSectionMinimizedByToken(token, minimized) {
        return this.coverBarHandle?.setMinimizedByToken(token, minimized) ?? false;
    },

    async onCloseContainer() {
        return this.isOpenMainMenu ? await this.menuCurrentOnTop?.onCloseContainer() ?? false : false ||
            await this.mainCurrentOnTop?.onCloseContainer();
    },


    onReloadHeader() {
        const currentOnTop = this.headerCurrentOnTop;
        return currentOnTop?.onReload() ?? false;
    },

    onReloadMenu() {
        const currentOnTop = this.menuCurrentOnTop;
        return currentOnTop?.onReload() ?? false;
    },

    onReloadBlinded() {
        if (this.$blindSections.filter(asv(eds.onTop, t1)).length > 0) {
            return this.blindedCurrentOnTop?.onReload() ?? false;
        } else return false;
    },

    onReloadMain() {
        const currentOnTop = this.mainCurrentOnTop;
        return currentOnTop?.onReload() ?? false;
    },


    onBackOverlay() {
        if (this.$overlaySections.filter(asv(eds.onTop, t1)).length > 0) {
            return this.overlayCurrentOnTop?.onBack() ?? false;
        } else return false;
    },

    onBackMenu() {
        const currentOnTop = this.menuCurrentOnTop ?? this.menuArea;
        return currentOnTop?.onBack() ?? false;
    },

    async onBackBlinded() {
        const currentOnTop = this.blindedCurrentOnTop;
        let processed = false;
        if (currentOnTop != null) processed = await currentOnTop.onBack();
        const prevBlindedId = this.prevBlindedId;
        if (!processed && prevBlindedId != null) {
            processed = await this.showInstantBlinded(prevBlindedId);
        }
        return processed;
    },

    async onBackMain() {
        const currentOnTop = this.mainCurrentOnTop;
        let processed = false;
        if (currentOnTop != null) processed = await currentOnTop.onBack();
        if (!processed) {
            if (!currentOnTop.isHome) processed = await this.switchRootTabPrev();
            else if (currentOnTop.intent?.bringOnBack != n) {
                const bringOnBack = currentOnTop.intent?.bringOnBack;
                if (bringOnBack.pid != n && bringOnBack.hostType == currentOnTop.hostType) {
                    processed = t;
                    const pid = bringOnBack.pid;
                    if (window.isDebug) console.log("Bringing on back to " + pid);
                    delete currentOnTop.intent.bringOnBack;
                    pageManager.bringPage(pid);
                }
            }
        }
        return processed;
    },


    async onFocus() {
        const top = this.showingTopArticle ?? this.mainCurrentOnTop;
        if (window.isDebug) console.log(`[estreUi.onFocus] visibility=${document.visibilityState} hasFocus=${document.hasFocus()} top=${top?.pid ?? "(none)"}`);
        top?.focus();
    },

    async onBlur() {
        const top = this.showingTopArticle ?? this.mainCurrentOnTop;
        if (window.isDebug) console.log(`[estreUi.onBlur] visibility=${document.visibilityState} hasFocus=${document.hasFocus()} top=${top?.pid ?? "(none)"}`);
        await top?.blur();
    },


    onReady() {
        this.initialHistoryOffset = history.length;
        // note("[" + history.length + "] initial - null / null");
        this.euiState = "initializing";
        this.replaceCurrentState(null);
        this.euiState = "onReady";
        this.replaceCurrentState();

        this.focus();

        this.setUiOnReady();
    },


    async checkOnReady(awaitAsyncTasks = t, transitionDelay = 500, linkTimeout = 8000, imageTimeout = 3000) {
        // lazy load of links
        const head = doc.h;
        const lazyLinks = head.querySelectorAll(m1 + aiv(lk, lz));
        for (const lazy of lazyLinks) {
            const link = doc.ce(lk);
            for (const attr of lazy.attributes) {
                if (attr.name == "link") continue;
                link.setAttribute(attr.name, attr.value);
            }
            lazy.after(link);
            lazy.remove();
        }


        const waiters = [];

        waiters.push(EUX.setOnLinksFullyLoaded(_ => {
            if (isStandalone) {
                // is PWA

            } else {
                // isn't PWA
                updateInsets({ type: "init"});
                // setTimeout(() => updateInsets(), 3000);
                window.addEventListener("load", updateInsets);
                window.addEventListener('resize', updateInsets);
                window.addEventListener('orientationchange', updateInsets);
                document.addEventListener('scrollend', updateInsets);
            }
            
            setTimeout(() => $("main#splashRoot").css("z-index", null), 0);
        }, linkTimeout));

        waiters.push(EUX.setOnImagesFullyLoaded(_ => {
            // do nothing
        }, imageTimeout));


        if (awaitAsyncTasks) waiters.push(postPromise(resolve => {
            const callback = _ => {
                EstreAsyncManager.removeOnFinishedCurrentWorks(callback);
                resolve();
            };

            EstreAsyncManager.setOnFinishedCurrentWorks(callback);
        }));


        await Promise.all(waiters);

        setTimeout(_ => this.onReady(), transitionDelay);
    },

    setUiOnReady() {
        doc.$b.attr(eds.onReady, t0);
        setTimeout(_ => doc.$b.attr(eds.onReady, t1), cvt.t2ms($("main#splashRoot").css(a.trdr)));
    },

    unsetUiOnReady() {
        doc.$b.attr(eds.onReady, t0);
        setTimeout(_ => doc.$b.attr(eds.onReady, ""), cvt.t2ms($("main#splashRoot").css(a.trdr)));
    },

    eoo: eoo
}

/**
 * Cover bar handle — owns the bottom-bar entry list that mirrors opt-in pages
 * (instantDoc / managedOverlay sections marked with `data-cover-mount`) and,
 * in Phase 3, external-embed windows registered via the public push API.
 *
 * Named with the `Handle` suffix to align with EstreUI's stock handle
 * convention (EstreHandle, EstreSwipeHandler, etc.) even though this one
 * isn't DOM-element-attached — it manages the bar surface as a single owner.
 *
 * Phase 1C-1 scope: scaffolding only — area refs cached, entry CRUD comes in
 * 1C-2 and entry rendering in 1C-3. The handle is instantiated by
 * estreUi.initCoverBar() during fixedBottom load (see onLoadedFixedBottom).
 */
class EstreCoverBarHandle {

    /**
     * Reusable 14x14 SVG glyphs for the context menu. Same stroke weight and
     * currentColor convention as the hide-all toggle / overflow sentinel, so
     * host code can grab the same icons when opening its own menus via
     * openContextMenu(). New icons should follow the same 14x14 viewBox +
     * stroke-only / currentColor pattern.
     *
     *   center   → 4-directional inward arrows pointing at the middle (cross
     *              shape so users don't confuse it with the diagonal-X close)
     *   minimize → single low bar (Windows-style _)
     *   restore  → outlined rect (window frame)
     *   close    → diagonal-X
     */
    static menuIcons = {
        center:
            '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">'
            + '<path d="M7 1.5v3.5M5.5 3.5L7 5l1.5-1.5"/>'
            + '<path d="M7 12.5V9M5.5 10.5L7 9l1.5 1.5"/>'
            + '<path d="M1.5 7h3.5M3.5 5.5L5 7l-1.5 1.5"/>'
            + '<path d="M12.5 7H9M10.5 5.5L9 7l1.5 1.5"/>'
            + '</svg>',
        minimize:
            '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">'
            + '<path d="M3 10h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
            + '</svg>',
        restore:
            '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">'
            + '<rect x="3" y="3" width="8" height="8" rx="1" stroke="currentColor" stroke-width="1.5"/>'
            + '</svg>',
        close:
            '<svg viewBox="0 0 14 14" fill="none" aria-hidden="true" focusable="false">'
            + '<path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>'
            + '</svg>',
    };

    #instantSections = null;
    #customFixedSections = null;
    #topLayer = null;
    #instantSentinel = null;
    #customFixedSentinel = null;
    #resizeObserver = null;
    #entries = [];
    #nextToken = 1;
    #activeToken = null;
    #openDropdown = null;
    #openContextMenu = null;
    #onDocumentPointerDown = null;
    #onDocumentKeydown = null;

    constructor($fixedBottom, $topLayer) {
        // Accept either a jQuery wrapper or a native element; the cover bar is
        // intentionally jQuery-agnostic internally so it stays usable under the
        // estreU0EEOZ jQuery fallback (jsdom test environment) as well as the
        // real jQuery in browsers.
        const fb = $fixedBottom?.[0] ?? $fixedBottom;
        this.#instantSections = fb?.querySelector?.("nav#instantSections") ?? null;
        this.#customFixedSections = fb?.querySelector?.("nav#customFixedSections") ?? null;
        // Top-layer host for overflow dropdowns (Phase 2C). Optional — falls
        // back to null when the host hasn't mounted the slot. The bar still
        // renders entries; overflow dropdowns simply do not appear.
        const tl = $topLayer?.[0] ?? $topLayer;
        this.#topLayer = tl ?? null;

        // Overflow sentinels — a ⌃-caret button at the leading edge of each
        // area. Always appended once; visibility flips via the `hidden` attr
        // as #recomputeOverflow measures area space against entry width.
        // instantSections is right-aligned (justify-content: flex-end) so
        // the sentinel ends up at the left edge of the visible cluster —
        // i.e., it points at the overflowed (clipped) side. The sentinel
        // is prepended so newly pushed entries (appended) always render to
        // its trailing side.
        if (this.#instantSections != null) {
            this.#instantSentinel = this.#createSentinel("instant");
            this.#instantSections.appendChild(this.#instantSentinel);
        }
        if (this.#customFixedSections != null) {
            this.#customFixedSentinel = this.#createSentinel("custom-fixed");
            this.#customFixedSections.appendChild(this.#customFixedSentinel);
        }

        // ResizeObserver watches both areas so overflow recomputes when the
        // host viewport changes or the bar's siblings adjust. Falls back to a
        // no-op if the API isn't available (rare; jsdom recent versions ship
        // ResizeObserver). Push/remove/update paths call #recomputeOverflow
        // directly so the bar stays in sync even without observer events.
        if (typeof ResizeObserver !== "undefined") {
            this.#resizeObserver = new ResizeObserver(() => this.#recomputeOverflow());
            if (this.#instantSections != null) this.#resizeObserver.observe(this.#instantSections);
            if (this.#customFixedSections != null) this.#resizeObserver.observe(this.#customFixedSections);
        }

        // Global listeners — close the overflow dropdown on outside click or
        // Escape. Capture phase so an embed cannot swallow the pointerdown
        // before we see it (the dropdown lives in #topLayer and the user's
        // intent in clicking anywhere else is unambiguously "dismiss").
        const self = this;
        this.#onDocumentPointerDown = (event) => {
            const path = typeof event.composedPath === "function" ? event.composedPath() : [];
            // Dropdown close exception list: its own element, its sentinel, and
            // any currently-open context menu (a context menu opened from a
            // dropdown row mounts as a sibling in #topLayer, so the dropdown
            // shouldn't treat clicks on the menu as "outside").
            if (self.#openDropdown != null
                && !path.includes(self.#openDropdown.element)
                && !path.includes(self.#openDropdown.sentinel)
                && (self.#openContextMenu == null || !path.includes(self.#openContextMenu.element))) {
                self.#closeDropdown();
            }
            if (self.#openContextMenu != null
                && !path.includes(self.#openContextMenu.element)) {
                self.#closeContextMenu();
            }
        };
        this.#onDocumentKeydown = (event) => {
            if (event.key !== "Escape") return;
            if (self.#openContextMenu != null) self.#closeContextMenu();
            else if (self.#openDropdown != null) self.#closeDropdown();
        };
        document.addEventListener("pointerdown", this.#onDocumentPointerDown, true);
        document.addEventListener("keydown", this.#onDocumentKeydown);
    }

    get instantSections() { return this.#instantSections; }
    get customFixedSections() { return this.#customFixedSections; }
    get topLayer() { return this.#topLayer; }
    /** @deprecated jQuery-flavoured getter kept for legacy callers; prefer `instantSections`. */
    get $instantSections() { return this.#instantSections == null ? null : $(this.#instantSections); }
    /** @deprecated jQuery-flavoured getter kept for legacy callers; prefer `customFixedSections`. */
    get $customFixedSections() { return this.#customFixedSections == null ? null : $(this.#customFixedSections); }
    get entries() { return this.#entries; }
    get activeToken() { return this.#activeToken; }

    /**
     * Register a new cover-bar entry and render its DOM into `instantSections`.
     * @param {object} data
     * @param {EstrePageHandle} [data.pageHandle] — page bound to this entry (null for external embeds in Phase 3)
     * @param {string} [data.sectionBound] — main / blind / overlay etc., drives the default icon
     * @param {string} [data.title]
     * @param {string|null|undefined} [data.icon]
     * @returns {number} token
     */
    pushEntry(data) {
        const token = this.#nextToken++;
        const entry = {
            token,
            pageHandle: data.pageHandle ?? null,
            sectionBound: data.sectionBound ?? null,
            title: data.title ?? null,
            icon: data.icon,
            // External-embed wiring (Phase 3). pageHandle and onAction are
            // mutually exclusive at the click-routing level: when pageHandle
            // is set, clicks call show/hide on it; otherwise onAction fires
            // with one of "focus" / "minimize" / "restore" / "close".
            onAction: typeof data.onAction === "function" ? data.onAction : null,
            closable: data.closable === true,
            badge: typeof data.badge === "number" ? data.badge : null,
            minimized: false,
            element: null,
        };
        this.#entries.push(entry);
        this.#renderEntry(entry);
        this.#refreshEntryBadge(entry);
        this.#recomputeOverflow();
        return token;
    }

    removeEntry(token) {
        const idx = this.#entries.findIndex(e => e.token === token);
        if (idx < 0) return false;
        const entry = this.#entries[idx];
        entry.element?.remove();
        this.#entries.splice(idx, 1);
        if (this.#activeToken === token) this.#activeToken = null;
        this.#recomputeOverflow();
        return true;
    }

    setActiveByToken(token) {
        // Passing null / undefined clears the active state. Useful for
        // cumulative-state reconcile flows where the payload may legitimately
        // have no active entry; without this the previously-active entry
        // would stay highlighted indefinitely.
        if (token == null) {
            if (this.#activeToken == null) return true;
            const prev = this.#entries.find(e => e.token === this.#activeToken);
            prev?.element?.setAttribute("data-active", "");
            this.#activeToken = null;
            return true;
        }
        if (this.#entries.findIndex(e => e.token === token) < 0) return false;
        if (this.#activeToken != null && this.#activeToken !== token) {
            const prev = this.#entries.find(e => e.token === this.#activeToken);
            prev?.element?.setAttribute("data-active", "");
        }
        this.#activeToken = token;
        const entry = this.#entries.find(e => e.token === token);
        entry?.element?.setAttribute("data-active", "1");
        return true;
    }

    setMinimizedByToken(token, minimized) {
        const entry = this.#entries.find(e => e.token === token);
        if (entry == null) return false;
        entry.minimized = !!minimized;
        entry.element?.setAttribute("data-minimized", entry.minimized ? "1" : "");
        return true;
    }

    updateEntry(token, partial) {
        const entry = this.#entries.find(e => e.token === token);
        if (entry == null) return false;
        if ("title" in partial) {
            entry.title = partial.title;
            const label = entry.element?.querySelector(":scope > label");
            if (label != null) label.textContent = entry.title ?? "";
            // Mirror the title attr (native tooltip) so hover stays in sync
            // with the visible label.
            if (entry.element != null) {
                if (entry.title != null) entry.element.setAttribute("title", entry.title);
                else                     entry.element.removeAttribute("title");
            }
        }
        if ("icon" in partial) {
            entry.icon = partial.icon;
            this.#refreshEntryIcon(entry);
        }
        if ("onAction" in partial) {
            entry.onAction = typeof partial.onAction === "function" ? partial.onAction : null;
        }
        if ("closable" in partial) {
            entry.closable = partial.closable === true;
            this.#refreshEntryClose(entry);
        }
        if ("badge" in partial) {
            entry.badge = typeof partial.badge === "number" ? partial.badge : null;
            this.#refreshEntryBadge(entry);
        }
        this.#recomputeOverflow();
        return true;
    }

    /** Lookup entry by token. Returns the live object — callers should treat it as read-only. */
    findEntry(token) {
        return this.#entries.find(e => e.token === token) ?? null;
    }

    /**
     * Resolve the icon URL for an entry per the cover-icon fallback rules:
     *   - icon === undefined → unset → sectionBound default
     *   - icon === ""        → explicit blank → sectionBound default
     *   - icon === "none"    → text-only (returns null)
     *   - icon === null      → text-only (returns null)
     *   - icon === "<url>"   → that URL
     */
    #resolveIconUrl(entry) {
        const icon = entry.icon;
        if (icon === "none" || icon === null) return null;
        if (icon === "" || icon === undefined) return this.#defaultIconForSection(entry.sectionBound);
        return icon;
    }

    #defaultIconForSection(sectionBound) {
        if (sectionBound === "main") return "./vectors/cover-icon-default-static.svg";
        if (sectionBound === "blind") return "./vectors/cover-icon-default-instant.svg";
        if (sectionBound === "overlay") return "./vectors/cover-icon-default-overlay.svg";
        return null;
    }

    #renderEntry(entry) {
        if (this.#instantSections == null) return;
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "clean cover_entry";
        btn.setAttribute("data-cover-token", entry.token);
        if (entry.sectionBound != null) btn.setAttribute("data-section-bound", entry.sectionBound);
        // Full title surfaces as the native tooltip — the visible label is
        // ellipsis-clipped on narrow tiles, but hovering reveals the rest.
        if (entry.title != null) btn.setAttribute("title", entry.title);

        const iconUrl = this.#resolveIconUrl(entry);
        if (iconUrl != null) {
            const span = document.createElement("span");
            span.className = "cover_icon";
            const img = document.createElement("img");
            img.alt = "";
            img.src = iconUrl;
            span.appendChild(img);
            btn.appendChild(span);
        }

        const label = document.createElement("label");
        label.textContent = entry.title ?? "";
        btn.appendChild(label);

        const self = this;
        btn.addEventListener("click", () => self.#onEntryClicked(entry.token));
        btn.addEventListener("contextmenu", (event) => self.#onEntryContextMenu(entry.token, event));

        entry.element = btn;
        this.#instantSections.appendChild(btn);
        if (entry.closable) this.#refreshEntryClose(entry);
    }

    /**
     * Add / remove the close ✕ on an entry to match `entry.closable`. Idempotent
     * so it can be called from #renderEntry (initial paint) and updateEntry
     * (state change). The ✕ click fires onAction("close") only — the embed is
     * responsible for the actual close (so an async confirm / server roundtrip
     * can run first) and must call removeInstantSectionEntry afterwards.
     */
    #refreshEntryClose(entry) {
        if (entry.element == null) return;
        const existing = entry.element.querySelector(":scope > .cover_entry_close");
        if (!entry.closable) {
            existing?.remove();
            return;
        }
        if (existing != null) return;
        const close = document.createElement("span");
        close.className = "cover_entry_close";
        close.setAttribute("role", "button");
        close.setAttribute("aria-label", "Close");
        close.textContent = "✕";
        close.addEventListener("click", (event) => {
            event.stopPropagation();
            if (typeof entry.onAction === "function") entry.onAction("close");
        });
        entry.element.appendChild(close);
    }

    /**
     * Cover-bar entry click handler. Routes to one of two surfaces based on
     * whether the entry has a page handle or an external onAction callback.
     * The state-to-intent mapping is the same in both branches — it mirrors
     * how task-switcher-style docks behave:
     *
     *   - active & visible  → hide / "minimize"
     *   - inactive          → show + focus / "focus"
     *   - active & minimized → show + focus / "restore"
     *
     * For internal page entries the handle's own show/hide is invoked. For
     * external embed entries (Phase 3) the registered onAction callback is
     * fired with the corresponding action token; the embed owns the actual
     * focus/minimize/restore transition. Entries with neither route configured
     * noop on click.
     */
    #onEntryClicked(token) {
        const entry = this.#entries.find(e => e.token === token);
        if (entry == null) return;
        if (entry.pageHandle != null) {
            if (this.#activeToken === token && !entry.minimized) {
                entry.pageHandle.hide();
            } else {
                entry.pageHandle.show(true, true);
            }
            return;
        }
        if (typeof entry.onAction === "function") {
            let action;
            if (this.#activeToken === token && !entry.minimized) action = "minimize";
            else if (this.#activeToken === token && entry.minimized) action = "restore";
            else action = "focus";
            entry.onAction(action);
        }
    }

    #refreshEntryIcon(entry) {
        if (entry.element == null) return;
        entry.element.querySelector(":scope > .cover_icon")?.remove();
        const iconUrl = this.#resolveIconUrl(entry);
        if (iconUrl == null) return;
        const span = document.createElement("span");
        span.className = "cover_icon";
        const img = document.createElement("img");
        img.alt = "";
        img.src = iconUrl;
        span.appendChild(img);
        entry.element.insertBefore(span, entry.element.firstChild);
    }

    /**
     * Apply the project-wide [data-badge] attribute convention (see
     * estreUi.css `article [data-badge]::after`) to an element. Display
     * rules — kept consistent with host-side badge setters (e.g. `setPushNotificationBadge`)
     * elsewhere in the host so themes can override `--badge-color` once:
     *   - count null / 0 / negative → attribute removed
     *   - count === 1               → data-badge="" → dot (CSS :empty variant)
     *   - 2 ≤ count ≤ 99            → data-badge="<count>" → numeric pill
     *   - count > 99                → data-badge="99+"
     */
    #setBadgeAttr(target, count) {
        if (count == null || count <= 0) {
            target.removeAttribute("data-badge");
            return;
        }
        target.setAttribute("data-badge",
            count === 1 ? "" :
            count > 99  ? "99+" :
                          String(count));
    }

    /**
     * Sync the per-entry unread badge with `entry.badge`. The badge is
     * surfaced as a [data-badge] attribute on the entry's .cover_icon —
     * styled via the cover-bar-scoped ::after rule that mirrors the
     * project-wide article [data-badge] convention. Text-only entries
     * (icon: "none" / no .cover_icon host) silently no-op.
     */
    #refreshEntryBadge(entry) {
        if (entry.element == null) return;
        const iconHost = entry.element.querySelector(":scope > .cover_icon");
        if (iconHost == null) return; // text-only entries can't host the badge
        this.#setBadgeAttr(iconHost, entry.badge);
    }

    /**
     * Create the per-area overflow sentinel button. Hidden by default; the
     * recompute pass flips `hidden` based on whether entries fit. Clicking
     * toggles the area's overflow dropdown (Phase 2C).
     *
     * The caret is rendered as an inline SVG so it can be precisely sized and
     * positioned (top-aligned on a narrow button) regardless of the platform
     * font. The shape mirrors the rootbar's chevron affordances — a thin
     * upward chevron stroked in currentColor so hover / data-opened states
     * pick up the surrounding color transitions for free.
     */
    #createSentinel(areaKey) {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "clean cover_overflow_sentinel";
        btn.setAttribute("data-area", areaKey);
        btn.setAttribute("aria-label", "Show overflowed entries");
        btn.innerHTML =
            '<svg viewBox="0 0 12 8" aria-hidden="true" focusable="false">' +
            '<polyline points="2,6 6,2 10,6" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>' +
            '</svg>';
        btn.hidden = true;
        const self = this;
        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            self.#toggleDropdown(areaKey);
        });
        return btn;
    }

    /**
     * Re-evaluate overflow for both areas. Cheap: short loop guided by
     * `area.scrollWidth > area.clientWidth`. Called from push / remove /
     * update / ResizeObserver. Hidden entries (data-overflowed="1") drop
     * out of layout via CSS, so subsequent measurements reflect the new
     * width budget.
     */
    #recomputeOverflow() {
        // Both areas hide from the trailing (DOM-end / most-recently-pushed)
        // side. The sentinel sits at the trailing edge of the visible cluster
        // (`order: 1`), so the entries that disappear are the ones closest to
        // it — most-recently-pushed first. Users opening a fresh window see it
        // get pushed into the dropdown as the bar fills up; older windows
        // stay visible on the leading side where they were first placed.
        this.#recomputeAreaOverflow(this.#instantSections, this.#instantSentinel, "trailing");
        this.#recomputeAreaOverflow(this.#customFixedSections, this.#customFixedSentinel, "trailing");
        if (this.#openDropdown != null) this.#refreshOpenDropdown();
    }

    /**
     * Hide entries one at a time from the chosen end until the cluster fits.
     *   - leading  → hide from index 0 forward  (oldest first, suited to
     *                flex-end areas where the leading edge is clipped)
     *   - trailing → hide from index N-1 backward (newest first, suited to
     *                flex-start areas where the trailing edge is clipped)
     */
    #recomputeAreaOverflow(area, sentinel, hideFrom) {
        if (area == null || sentinel == null) return;
        const entries = this.#entriesForArea(area);
        for (const e of entries) e.element?.removeAttribute("data-overflowed");
        sentinel.hidden = true;
        if (entries.length === 0) return;
        if (area.scrollWidth <= area.clientWidth) return;

        // Reveal the sentinel so its width counts toward the budget; then
        // hide entries until the remaining cluster fits alongside it.
        sentinel.hidden = false;
        const indices = hideFrom === "leading"
            ? entries.map((_, i) => i)
            : entries.map((_, i) => entries.length - 1 - i);
        for (const i of indices) {
            if (area.scrollWidth <= area.clientWidth) return;
            entries[i].element?.setAttribute("data-overflowed", "1");
        }
    }

    /** Currently only `instantSections` hosts cover-bar entries. customFixedSections
     *  is reserved for future user-pinned items (see PM/002 task ledger §Phase 4+). */
    #entriesForArea(area) {
        if (area === this.#instantSections) return this.#entries;
        return [];
    }

    /**
     * Open / close / toggle the overflow dropdown for an area. Single open
     * dropdown at a time; opening one while another is open swaps them.
     * No-op when the top-layer host slot is missing.
     */
    #toggleDropdown(areaKey) {
        if (this.#openDropdown != null && this.#openDropdown.areaKey === areaKey) {
            this.#closeDropdown();
            return;
        }
        this.#openDropdown != null && this.#closeDropdown();
        this.#openDropdown = this.#openDropdownFor(areaKey);
    }

    #openDropdownFor(areaKey) {
        if (this.#topLayer == null) return null;
        const sentinel = areaKey === "instant" ? this.#instantSentinel : this.#customFixedSentinel;
        const area = areaKey === "instant" ? this.#instantSections : this.#customFixedSections;
        if (sentinel == null || area == null) return null;

        const dropdown = document.createElement("div");
        dropdown.className = "cover_overflow_dropdown";
        dropdown.setAttribute("data-area", areaKey);
        this.#topLayer.appendChild(dropdown);
        sentinel.setAttribute("data-opened", "1");

        const state = { areaKey, sentinel, area, element: dropdown };
        // Render and position after attaching so size can be measured.
        this.#renderDropdownRows(state);
        this.#positionDropdown(state);
        return state;
    }

    #closeDropdown() {
        if (this.#openDropdown == null) return;
        this.#openDropdown.element.remove();
        this.#openDropdown.sentinel?.removeAttribute("data-opened");
        this.#openDropdown = null;
    }

    /** Re-render rows + re-position the open dropdown. Called when the set
     *  of overflowed entries changes (e.g. resize) while it's open. */
    #refreshOpenDropdown() {
        if (this.#openDropdown == null) return;
        // If the sentinel went away (everything fits again), drop the dropdown.
        if (this.#openDropdown.sentinel?.hidden) {
            this.#closeDropdown();
            return;
        }
        this.#renderDropdownRows(this.#openDropdown);
        this.#positionDropdown(this.#openDropdown);
    }

    #renderDropdownRows(state) {
        const { element, area } = state;
        element.replaceChildren();
        // Newest hidden entries surface first — visually they sat closest to
        // the sentinel before being pushed off, so the user reads them at
        // the top of the dropdown. We hide from the trailing edge (most-
        // recently-pushed first), so reversing the natural DOM order lines
        // the dropdown rows up "newest → older" top to bottom.
        const entries = this.#entriesForArea(area)
            .filter(e => e.element?.getAttribute("data-overflowed") === "1")
            .reverse();
        for (const entry of entries) {
            const row = document.createElement("button");
            row.type = "button";
            row.className = "clean cover_entry";
            row.setAttribute("data-cover-token", entry.token);
            if (entry.sectionBound != null) row.setAttribute("data-section-bound", entry.sectionBound);
            if (this.#activeToken === entry.token) row.setAttribute("data-active", "1");
            if (entry.minimized) row.setAttribute("data-minimized", "1");
            if (entry.title != null) row.setAttribute("title", entry.title);

            const iconUrl = this.#resolveIconUrl(entry);
            if (iconUrl != null) {
                const span = document.createElement("span");
                span.className = "cover_icon";
                const img = document.createElement("img");
                img.alt = "";
                img.src = iconUrl;
                span.appendChild(img);
                this.#setBadgeAttr(span, entry.badge);
                row.appendChild(span);
            }
            const label = document.createElement("label");
            label.textContent = entry.title ?? "";
            row.appendChild(label);

            const self = this;
            row.addEventListener("click", (event) => {
                event.stopPropagation();
                self.#closeDropdown();
                self.#onEntryClicked(entry.token);
            });
            // Right-click inside the overflow dropdown opens the entry's
            // context menu on top of it — the dropdown stays open so the user
            // can pick another row after dismissing the menu. The document-
            // level pointerdown handler also exempts the open context menu
            // from closing the dropdown (see constructor).
            row.addEventListener("contextmenu", (event) => {
                self.#onEntryContextMenu(entry.token, event);
            });
            if (entry.closable) {
                const close = document.createElement("span");
                close.className = "cover_entry_close";
                close.setAttribute("role", "button");
                close.setAttribute("aria-label", "Close");
                close.textContent = "✕";
                close.addEventListener("click", (event) => {
                    event.stopPropagation();
                    if (typeof entry.onAction === "function") entry.onAction("close");
                });
                row.appendChild(close);
            }
            element.appendChild(row);
        }
    }

    #positionDropdown(state) {
        const { element, sentinel, areaKey } = state;
        const rect = sentinel.getBoundingClientRect();
        // Anchor above the sentinel — fixedBottom sits at the screen base, so
        // the dropdown opens upward. Use `bottom` rather than `top` so the
        // dropdown grows up from the anchor as more rows are added.
        const gap = 6;
        element.style.bottom = `${Math.max(0, window.innerHeight - rect.top + gap)}px`;
        element.style.top = "auto";
        if (areaKey === "instant") {
            // Right-align to the area's right edge so the dropdown stays
            // within the host margin even when the sentinel itself sits
            // anywhere along the bar's leading edge.
            const areaRect = state.area.getBoundingClientRect();
            element.style.right = `${Math.max(0, window.innerWidth - areaRect.right)}px`;
            element.style.left = "auto";
        } else {
            const areaRect = state.area.getBoundingClientRect();
            element.style.left = `${Math.max(0, areaRect.left)}px`;
            element.style.right = "auto";
        }
    }

    /**
     * Right-click on a cover-bar entry opens a small context menu in #topLayer:
     *
     *   ── title ──────────────────
     *   화면 가운데로 이동           (placeholder until the embed exposes the API)
     *   최소화 / 복원                (label flips on entry.minimized)
     *   닫기                          (fires onAction("close"))
     *
     * Internal page-handle entries don't get the menu — they have their own
     * navigation surface already. External-embed entries (onAction !== null)
     * are the target audience. The menu is single-instance: opening one closes
     * any prior open instance, and outside pointerdown / Escape close it (see
     * the document-level listeners in the constructor).
     */
    #onEntryContextMenu(token, event) {
        const entry = this.#entries.find(e => e.token === token);
        if (entry == null || typeof entry.onAction !== "function") return;
        if (this.#topLayer == null) return;
        event.preventDefault();
        if (this.#openContextMenu != null) this.#closeContextMenu();
        this.#openContextMenu = this.#openContextMenuFor(entry, event.clientX, event.clientY);
    }

    #openContextMenuFor(entry, x, y) {
        // SVG glyphs picked for visual parity with the hide-all toggle and the
        // overflow sentinel — same stroke weight (1.6 ~ 1.8) and 14x14 viewBox,
        // all in currentColor so hover / disabled inherit the menu's text tone.
        const SVG = EstreCoverBarHandle.menuIcons;
        const items = [
            { label: "화면 가운데로 이동", action: "center", svg: SVG.center },
            entry.minimized
                ? { label: "복원", action: "restore", svg: SVG.restore }
                : { label: "최소화", action: "minimize", svg: SVG.minimize },
            { label: "닫기", action: "close", svg: SVG.close },
        ];
        return this.openContextMenu({
            x, y,
            title: entry.title,
            items,
            onAction: (action) => this.#onContextMenuAction(entry.token, action),
            anchorData: { "data-cover-token": entry.token },
        });
    }

    /**
     * Public context-menu surface — opens a menu in #topLayer at the cursor,
     * matching the chrome the cover-bar uses internally for entry right-click.
     * Host code (e.g. for a rootbar tab) calls this directly with its own
     * items / onAction, instead of routing through a cover_entry.
     *
     * Items are `{ label, action, svg?, disabled? }`. The menu is single-
     * instance — opening one closes any prior open menu. Outside pointerdown
     * and Escape close it; both branches are wired in the constructor.
     *
     * Returns the menu state object (or null if #topLayer is missing).
     */
    openContextMenu({ x, y, title, items, onAction, anchorData }) {
        if (this.#topLayer == null) return null;
        if (this.#openContextMenu != null) this.#closeContextMenu();

        const menu = document.createElement("div");
        menu.className = "cover_entry_menu";
        if (anchorData != null) {
            for (const [k, v] of Object.entries(anchorData)) menu.setAttribute(k, v);
        }

        if (title != null) {
            const titleEl = document.createElement("header");
            titleEl.className = "cover_menu_title";
            titleEl.textContent = title;
            menu.appendChild(titleEl);
        }

        const self = this;
        for (const it of items ?? []) {
            const item = document.createElement("button");
            item.type = "button";
            item.className = "clean cover_menu_item";
            item.setAttribute("data-action", it.action);
            const iconSpan = document.createElement("span");
            iconSpan.className = "cover_menu_item_icon";
            if (it.svg != null) iconSpan.innerHTML = it.svg;
            item.appendChild(iconSpan);
            const labelSpan = document.createElement("span");
            labelSpan.className = "cover_menu_item_label";
            labelSpan.textContent = it.label;
            item.appendChild(labelSpan);
            if (it.disabled) item.disabled = true;
            item.addEventListener("click", (ev) => {
                ev.stopPropagation();
                self.#closeContextMenu();
                onAction?.(it.action);
            });
            menu.appendChild(item);
        }

        const state = { element: menu };
        this.#topLayer.appendChild(menu);
        this.#positionContextMenu(state, x, y);
        this.#openContextMenu = state;
        return state;
    }

    /**
     * Anchor the context menu at the cursor and pick a quadrant so it always
     * opens *toward* the viewport center — bottom-right click → menu pinned to
     * its bottom-right (= grows up-and-left), top-left click → menu pinned
     * top-left (= grows down-and-right), etc. The transform-origin custom
     * property is set inline so the scale-grow open animation pivots at the
     * click point.
     */
    #positionContextMenu(state, x, y) {
        const { element } = state;
        const w = window.innerWidth;
        const h = window.innerHeight;
        const isRight = x > w / 2;
        const isBottom = y > h / 2;
        element.style.left = isRight ? "auto" : `${x}px`;
        element.style.right = isRight ? `${Math.max(0, w - x)}px` : "auto";
        element.style.top = isBottom ? "auto" : `${y}px`;
        element.style.bottom = isBottom ? `${Math.max(0, h - y)}px` : "auto";
        // Origin corner = the cursor-anchored corner; CSS uses keywords (`top`
        // / `bottom` / `left` / `right`) for transform-origin so it stays
        // pixel-exact regardless of layout shifts during animation.
        const vert = isBottom ? "bottom" : "top";
        const horiz = isRight ? "right" : "left";
        element.style.setProperty("--menu-origin", `${vert} ${horiz}`);
    }

    /**
     * Fade the menu out (0.2s ease) before detaching, so the close looks like
     * a deliberate dismiss rather than a pop. The element is removed on the
     * transitionend; null-ing the state first prevents a re-entrant close from
     * doubling up the fade.
     */
    #closeContextMenu() {
        if (this.#openContextMenu == null) return;
        const el = this.#openContextMenu.element;
        this.#openContextMenu = null;
        el.setAttribute("data-closing", "1");
        const remove = () => el.remove();
        el.addEventListener("transitionend", remove, { once: true });
        // Safety fallback — if the animation is interrupted (e.g. element no
        // longer in DOM), still detach after the expected duration.
        setTimeout(remove, 260);
    }

    /** Route a context-menu click to the right action. The first three actions
     *  delegate to the same onAction surface as bar-click intent (so embed
     *  wirings only need one handler); "center" is a placeholder action that
     *  the embed may wire later as a window-center transition. */
    #onContextMenuAction(token, action) {
        const entry = this.#entries.find(e => e.token === token);
        if (entry == null || typeof entry.onAction !== "function") return;
        entry.onAction(action);
    }
}


// Expose estreUi on window so ES-module-realm host integrations (external embeds
// loaded as <script type="module">) can reach the public API. Same-realm classic
// scripts already see the lexical const; this line only adds the cross-realm
// surface. See review #011.
window.estreUi = estreUi;

// review #011 후속 — 페이지 시스템 공개 표면도 module-realm 에 노출한다. <script type="module">
// 임베드(EstreUX estreui 변종 등)가 EstrePageHandler 를 상속해 페이지 핸들러를 정의하고,
// pageManager 로 등록·bring 하며, 필요 시 커스텀 매니저/핸들까지 쓸 수 있도록. classic 스크립트는
// 기존처럼 lexical const 로 그대로 접근하고, 이 줄들은 cross-realm 표면만 추가한다(호환성 영향 0).
window.pageManager = pageManager;
window.EstrePageHandler = EstrePageHandler;
window.EstreUiCustomPageManager = EstreUiCustomPageManager;
window.EstreHandle = EstreHandle;

