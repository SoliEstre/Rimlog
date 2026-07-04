/*
    EstreUI rimwork — Page Handle + Handler + Model (tightly coupled)
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Page Handle -- EstrePageHandle, EstrePageHostHandle,
//         EstreComponent variants, EstreContainer, EstreArticle
// ======================================================================

/**
 * Common page handle model
 */
class EstrePageHandle {

    hostType = "unknown";

    #host = null;
    get host() { return this.#host; }
    #$host = null;
    get $host() { return this.#$host; }

    id = null;
    get instanceId() { return !this.isStatic && this.isMultiInstance ? this.id + "^" + this.instanceOrigin : this.id; }
    get instanceOrigin() { return !this.isStatic && this.isMultiInstance ? this.$host?.attr(eds.instanceOrigin)?.ifEmpty(_ => u) : u; }
    set instanceOrigin(value) { if (!this.isStatic && this.isMultiInstance) this.$host?.attr(eds.instanceOrigin, value ?? ""); }

    #page = null;
    get page() { return this.#page; }
    get pid() { return this.page?.pid; }
    get instancePid() { return this.page?.instancePid; }

    get isStatic() { return this.$host?.attr(eds.static) == t1; }
    get isFullyStatic() { return this.isStatic; }
    get isModal() { return this.$host?.hasClass("modal"); }
    get isOnTop() {
        const onTop = this.$host?.attr(eds.onTop);
        return onTop == t1 || onTop == "1*";
    }
    get isMultiInstance() { return this.$host?.attr(eds.multiInstance) == t1; }

    get isCanBack() { return false; }

    get title() { return this.$host?.attr(eds.title); }

    /**
     * Cover-bar entry label override. Falls back to `title` (= `data-title`) when unset.
     * Set via `setCoverTitle(value)`; pass `undefined` to clear the override.
     * @type {string|undefined}
     */
    #coverTitle = undefined;
    get coverTitle() { return this.#coverTitle ?? this.title; }
    setCoverTitle(value) {
        this.#coverTitle = value;
        if (this.#coverEntryToken != null) {
            estreUi.coverBarHandle?.updateEntry(this.#coverEntryToken, { title: this.coverTitle });
        }
    }

    /**
     * Cover-bar entry icon override. Distinguishes "unset" (falls back to
     * `data-icon`) from explicit set values via #isCoverIconSet — `undefined`,
     * `null`, `""`, `"none"`, and an arbitrary URL are all distinct outcomes
     * the bar's fallback branch interprets in Phase 1C.
     * @type {string|null|undefined}
     */
    #coverIcon = undefined;
    #isCoverIconSet = false;
    get coverIcon() {
        if (this.#isCoverIconSet) return this.#coverIcon;
        return this.$host?.attr(eds.icon);
    }
    setCoverIcon(value) {
        this.#coverIcon = value;
        this.#isCoverIconSet = true;
        if (this.#coverEntryToken != null) {
            estreUi.coverBarHandle?.updateEntry(this.#coverEntryToken, { icon: this.coverIcon });
        }
    }

    /**
     * Opt-in flag for cover-bar mounting. `data-cover-mount="1"` on the page
     * section enables this; sub-class handlers can override the getter for
     * programmatic opt-in (Phase 1C will also expose a constructor option).
     */
    get coverMount() { return this.$host?.attr(eds.coverMount) == t1; }

    /**
     * Token returned by `estreUi.coverBarHandle.pushEntry()` when this handle's
     * page was registered in the cover bar. `null` whenever no entry is live
     * (page closed / cover bar not ready / coverMount opt-out).
     */
    #coverEntryToken = null;
    get coverEntryToken() { return this.#coverEntryToken; }

    /**
     * Internal — push an entry for this handle into the cover bar when opt-in
     * is set and the bar is ready. Re-entry-safe: noop if already registered.
     */
    #registerCoverEntry() {
        if (this.#coverEntryToken != null) return;
        if (!this.coverMount) return;
        const handle = estreUi.coverBarHandle;
        if (handle == null) return;
        this.#coverEntryToken = handle.pushEntry({
            pageHandle: this,
            sectionBound: this.sectionBound,
            title: this.coverTitle,
            icon: this.coverIcon,
        });
    }

    /** Internal — remove this handle's cover-bar entry, if any. */
    #releaseCoverEntry() {
        if (this.#coverEntryToken == null) return;
        estreUi.coverBarHandle?.removeEntry(this.#coverEntryToken);
        this.#coverEntryToken = null;
    }

    #appbarLeft = null;
    #appbarRight = null;
    #appbarCenter = null;
    get appbarLeft() { return val(this.#appbarLeft, it => it ?? val(this.$host?.attr(eds.appbarLeft)?.trim(), aa => isNully(aa) || aa.length < 2 ? it : (aa == "tp" ? undefined : aa))); }
    set appbarLeft(value) { this.#appbarLeft = value; } //this.$host?.attr(eds.appbarLeft, Doctre.stringify(value)); }
    get appbarRight() { return val(this.#appbarRight, it => it ?? val(this.$host?.attr(eds.appbarRight)?.trim(), aa => isNully(aa) || aa.length < 2 ? it : (aa == "tp" ? undefined : aa))); }
    set appbarRight(value) { this.#appbarRight = value; } //this.$host?.attr(eds.appbarRight, Doctre.stringify(value)); }
    get appbarCenter() { return val(this.#appbarCenter, it => it ?? val(this.$host?.attr(eds.appbarCenter)?.trim(), aa => isNully(aa) || aa.length < 2 ? it : (aa == "tp" ? undefined : aa))); }
    set appbarCenter(value) { this.#appbarCenter = value; } //this.$host?.attr(eds.appbarCenter, Doctre.stringify(value)); }
    get isAppbarLeftAssigned() { return this.hostType != "component" && !(this.isStatic && !this.isFullyStatic) && (this.$host.let(it => it.hasClass("constraint") || (it.hasClass("fwvs") && !EUX.isExtensive))) ? !typeUndefined(this.appbarLeft) : isNotNully(this.appbarLeft); }
    get isAppbarRightAssigned() { return this.hostType != "component" && !(this.isStatic && !this.isFullyStatic) && (this.$host.let(it => it.hasClass("constraint") || (it.hasClass("fwvs") && !EUX.isExtensive))) ? !typeUndefined(this.appbarRight) : isNotNully(this.appbarRight); }
    get isAppbarCenterAssigned() { return this.hostType != "component" && !(this.isStatic && !this.isFullyStatic) && (this.$host.let(it => it.hasClass("constraint") || (it.hasClass("fwvs") && !EUX.isExtensive))) ? !typeUndefined(this.appbarCenter) : isNotNully(this.appbarCenter); }
    get appbarLeftFeed() { return setter => {
        const $set = setter(this.appbarLeft)?.let(it => $(it));
        this.$appbarLeft = $set;
        this.onInitAppbarLeft($set);
        return $set;
    } }
    get appbarRightFeed() { return setter => {
        const $set = setter(this.appbarRight)?.let(it => $(it));
        this.$appbarRight = $set;
        this.onInitAppbarRight($set);
        return $set;
    } }
    get appbarCenterFeed() { return setter => {
        const $set = setter(this.appbarCenter)?.let(it => $(it));
        this.$appbarCenter = $set;
        this.onInitAppbarCenter($set);
        return $set;
    } }
    $appbarLeft;
    $appbarRight;
    $appbarCenter;
    onInitAppbarLeft = $appbarLeft => {};
    onInitAppbarRight = $appbarRight => {};
    onInitAppbarCenter = $appbarCenter => {};

    get isFullyHided() {
        const onTop = this.$host?.attr(eds.onTop);
        return onTop == "" || onTop == t0;
    }

    #handler = null;
    get handler() { return this.#handler; }

    #intent = null;
    get intent() { return this.#intent; }
    
    #isOpened = false;
    get isOpened() { return this.#isOpened; }
    #isShowing = false;
    get isShowing() { return this.isOpened && this.#isShowing; }
    #isFocused = false;
    get isFocused() { return this.isShowing && this.#isFocused; }
    #everFocused = false;
    get everFocused() { return this.#everFocused; }

    #isHiding = false;
    get isHiding() { return this.#isHiding; }
    #isClosing = false;
    get isClosing() { return this.#isClosing; }
    #isReleasing = false;
    get isReleasing() { return this.#isReleasing; }

    #currentOnTop = null;
    get currentOnTop() { return this.#currentOnTop; };
    set currentOnTop(handle) {
        this.#currentOnTop = handle;
    }

    #intentProxy;
    #intentDataProxy;
    #intentDataBindProxy = {};
    // #revokeIntentProxy;
    // #revokeIntentDataProxy;
    // #revokeIntentDataBindProxy = {};

    #isProcessing = f;
    get isProcessing() { return this.#isProcessing; }

    lastFocusedElement = null;

    get mainArticle() { return this; }


    constructor(host, instanceOrigin) {
        this.#host = host;
        this.#$host = $(host);

        if (host.pageHandle != null && host.pageHandle != this) {
            try {
            host.pageHandle.release();
            } catch (ex) {
                if (window.isLogging) console.error(ex.name + "\n", ex.message);
            }
        }
        this.#host.pageHandle = this;
        if (!this.isStatic && this.isMultiInstance) this.instanceOrigin = instanceOrigin ?? "ai_" + Date.now();
    }

    release(remove) {
        this.onRelease(remove);

        if (this.host != null) delete this.host.pageHandle;

        if (remove === true) this.$host?.remove();
        else {
            if (remove === false) this.$host?.empty();
            this.#host = n;
            this.#$host = n;
        }
    }

    init(page, intent) {
        this.#page = page;
        page.fetchHandler(this);
        if (this.handler == null) this.setHandler(new EstrePageHandler(this));

        this.pushIntent(intent, true);

        this.onBring();

        return this;
    }

    setHandler(handler) {
        if (this.#handler == null) this.#handler = handler;
    }

    takeOnPageIntent(intent = {}) {
        // this.#revokeIntentProxy?.();
        if (nn(intent?.data) && !intent.data.isProxy) intent.data = this.takeOnPageData(intent.data);
        // const { proxy, revoke } = nn(intent) ? Proxy.revocable(intent, {
        const proxy = nn(intent) ? new Proxy(intent, {
            get: (target, prop) => prop == "isProxy" ? t : target[prop],
            set: (target, prop, value) => {
                if (prop == "data") {
                    target.data = this.takeOnPageData(value);
                    if (!this.mainArticle.isProcessing) this.mainArticle.applyActiveStruct(this.mainArticle.$host, this);
                } else target[prop] = value;
                return t;
            },
            deleteProperty: (target, prop) => {
                if (prop == "data") {
                    this.takeOnPageData(u);
                    delete target.data;
                } else delete target[prop];
                if (!this.mainArticle.isProcessing) this.mainArticle.applyActiveStruct(this.mainArticle.$host, this);
                return t;
            },
        }) : u;//{ proxy: u, revoke: u };
        this.#intentProxy = proxy;
        // this.#revokeIntentProxy = revoke;
        return proxy ?? intent;
    }

    takeOnPageData(data = {}) {
        // this.#revokeIntentDataProxy?.();
        const isObject = nn(data) && tj(data);
        if (isObject) for (const key in data) if (!data[key]?.isProxy) data[key] = this.takeOnPageBind(key, data[key]);
        // const { proxy, revoke } = isObject ? Proxy.revocable(data, {
        const proxy = isObject ? new Proxy(data, {
            get: (target, prop) => prop == "isProxy" ? t : target[prop],
            set: (target, prop, value) => {
                target[prop] = this.takeOnPageBind(prop, value);
                if (!this.mainArticle.isProcessing) this.mainArticle.applyActiveStruct(this.mainArticle.$host, this);
                return t;
            },
            deleteProperty: (target, prop) => {
                this.takeOnPageBind(prop, u);
                delete target[prop];
                if (!this.mainArticle.isProcessing) this.mainArticle.applyActiveStruct(this.mainArticle.$host, this);
                return t;
            },
        }) : u;//{ proxy: u, revoke: u };
        this.#intentDataProxy = proxy;
        // this.#revokeIntentDataProxy = revoke;
        return proxy ?? data;
    }

    takeOnPageBind(pr, bind) {
        // const rv = this.#revokeIntentDataBindProxy[pr];
        // if (tf(rv)) rv();
        if (nn(bind) && tj(bind)) {
            // const { proxy, revoke } = Proxy.revocable(bind, {
            const proxy = new Proxy(bind, {
                get: (target, prop) => prop == "isProxy" ? t : target[prop],
                set: (target, prop, value) => {
                    target[prop] = value;
                    if (!this.mainArticle.isProcessing) this.mainArticle.applyActiveStruct(this.mainArticle.$host, this);
                    return t;
                },
                deleteProperty: (target, prop) => {
                    delete target[prop];
                    if (!this.mainArticle.isProcessing) this.mainArticle.applyActiveStruct(this.mainArticle.$host, this);
                    return t;
                },
            });
            this.#intentDataBindProxy[pr] = proxy;
            // this.#revokeIntentDataBindProxy[pr] = revoke;
            return proxy;
        } else {
            delete this.#intentDataBindProxy[pr];
            // delete this.#revokeIntentDataBindProxy[pr];
            return bind;
        }
    }

    apply(process = (data, intent) => {}, $bound = this.mainArticle.$host, handle = this) {
        if (this.mainArticle != this) return this.mainArticle.apply(process, $bound, this);
        const isAlreadyProcessing = this.#isProcessing;
        if (!isAlreadyProcessing) this.#isProcessing = t;
        this.placeIntentData();
        process(this.intent.data, this.intent);
        if (!isAlreadyProcessing) this.#isProcessing = f;
        return this.applyActiveStruct($bound, handle);
    }

    async applyAsync(process = async (data, intent) => {}, $bound = this.mainArticle.$host, handle = this) {
        if (this.mainArticle != this) return await this.mainArticle.applyAsync(process, $bound, handle);
        const isAlreadyProcessing = this.#isProcessing;
        if (!isAlreadyProcessing) this.#isProcessing = t;
        this.placeIntentData();
        await process(this.intent.data, this.intent);
        if (!isAlreadyProcessing) this.#isProcessing = f;
        return await this.applyActiveStruct($bound, handle);
    }

    placeIntent(intent = {}) {
        return this.#intent ??= this.takeOnPageIntent(intent);
    }
    
    placeIntentData(data = {}) {
        this.placeIntent();
        return this.#intent.data ??= data;
    }
    
    pushIntent(intent, onInit = false) {
        if (intent != n) {
            const push = _ => {
                if (intent === f) this.#intent = n;
                else if (this.intent == n) this.#intent = this.takeOnPageIntent(intent.isProxy ? intent.clone : intent);
                else for (const key in intent) this.intent[key] = intent[key];

                if (window.isVerbosely) console.log("pushed intent on " + this.hostType + " " + EstreUiPage.from(this).pid + "\n", this.intent);
                else if (window.isDebug) console.log("pushed intent on " + this.hostType + " " + EstreUiPage.from(this).pid + "\n");
                this.onIntentUpdated(this, intent);
            };
            if (this.#isOpened) this.apply(push);
            else push();
            return true;
        } else false;
    }


    show(isRequest = false, setFocus = true) {
        if (!this.isShowing) {
            this.onOpen();
            this.onShow();
            this.$host.attr(eds.onTop, t1 + "*");
            setTimeout(async _ => {
                const $host = this?.$host;
                if ($host != null && $host.attr(eds.onTop) == t1 + "*") {
                    $host.attr(eds.onTop, t1);
                    if (setFocus && this != null && this.hostType == "article") await estreUi.focus(this);//this?.focus();
                }
            }, 0);
            return true;
        } else return false;
    }

    focus() {
        if (!this.isFocused) {
            this.onFocus();
            return true;
        } else return false;
    }

    reload(isRequest = true) {
        if (isRequest) return this.onReload();
        else if (this.#isOpened) {
            const onTop = this.currentOnTop;
            const onReload = this.handler?.onReload;
            return (onTop != null && onTop.onReload()) || (onReload != null && (handle => {
                if (window.isVerbosely) console.log("[performReload] " + this.sectionBound + " " + this.hostType + " " + this.pid, this.host);
                else if (window.isDebug) console.log("[performReload] " + this.sectionBound + " " + this.hostType + " " + this.pid);
                return handle?.handler?.onReload(this);
            })(this));
        } else return false;
    }

    async back(isRequest = true) {
        if (isRequest) return await this.onBack();
        else if (this.isShowing) {
            const onTop = this.currentOnTop;
            const onBack = this.handler?.onBack;
            return (onTop != null && await onTop.onBack()) || (onBack != null && await (async (handle) => {
                if (window.isVerbosely) console.log("[performBack] " + this.sectionBound + " " + this.hostType + " " + this.pid, this.host);
                else if (window.isDebug) console.log("[performBack] " + this.sectionBound + " " + this.hostType + " " + this.pid);
                return await handle?.handler?.onBack(this);
            })(this));
        } else return false;
    }

    blur() {
        if (this.isFocused) {
            return this.onBlur();
        } else return false;
    }

    async hide(fullyHide = true) {
        if ((!this.isHiding && this.isShowing) || (fullyHide && !this.isFullyHided)) {
            this.#isHiding = true;
            await this.blur();
            await this.onHide(fullyHide);
            if (fullyHide) {
                this.$host.attr(eds.onTop, t0);
                const delay = cvt.t2ms(this.$host.css(a.trdr));
                return new Promise(async (resolve) => {
                    setTimeout(_ =>{
                        const $host = this?.$host;
                        if ($host != null && $host.attr(eds.onTop) == t0) {
                            $host.attr(eds.onTop, "");
                            resolve(true);
                        } else resolve(false);
                    }, delay);
                });
            } else {
                this.$host.attr(eds.onTop, t0 + "*");
                return true;
            }
        } else return false;
    }

    close(isTermination = false, isOnRelease = false) {
        if (this.isOpened) {
            if (this.isOpened && (isOnRelease || isTermination || !this.isStatic)) this.#isClosing = true;
            const task = this.hide();
            return postAsyncQueue(async _ => {
                await task;
                const result = await this.onClose(isTermination, isOnRelease);
                this.#isClosing = false;
                return result;
            });
        } else return false;
    }


    onBring() {
        if (window.isDebug) console.log("[onBring] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
        if (this.handler?.onBring != null) this.handler.onBring(this);
        if (this.intent?.onBring != null) for (var item of this.intent.onBring) if (item.from == this.hostType && !item.disabled) this.processAction(item);
    }

    onOpen() {
        if (!this.isOpened) {
            if (window.isDebug) console.log("[onOpen] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            this.#isOpened = true;
            this.#registerCoverEntry();
            if (this.handler?.onOpen != null) this.handler.onOpen(this);
            if (this.intent?.onOpen != null) for (var item of this.intent.onOpen) if (item.from == this.hostType && !item.disabled) this.processAction(item);
            return true;
        } else return false;
    }

    onShow() {
        if (this.isOpened && !this.isShowing) {
            if (window.isVerbosely) console.log("[onShow] " + this.sectionBound + " " + this.hostType + " " + this.pid, this.host);
            else if (window.isDebug) console.log("[onShow] " + this.sectionBound + " " + this.hostType + " " + this.pid);
            this.#isShowing = true;
            if (this.#coverEntryToken != null) estreUi.coverBarHandle?.setMinimizedByToken(this.#coverEntryToken, false);
            if (this.handler?.onShow != null) this.handler.onShow(this);
            if (this.intent?.onShow != null) for (var item of this.intent.onShow) if (item.from == this.hostType && !item.disabled) this.processAction(item);
            return true;
        } else return false;
    }

    onFocus() {
        if (!this.isFocused) {
            const isFirstFocus = !this.#everFocused;
            if (window.isDebug) console.log("[onFocus] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            this.#isFocused = true;
            this.#everFocused = true;
            if (this.#coverEntryToken != null) estreUi.coverBarHandle?.setActiveByToken(this.#coverEntryToken);
            const handled = this.handler?.onFocus?.(this, isFirstFocus);
            if (this.intent?.onFocus != null) for (var item of this.intent.onFocus) if (item.from == this.hostType && !item.disabled) this.processAction(item);
            if (handled === true) {
                // Snapshot activeElement so a later refocus (e.g. background→foreground)
                // can restore whatever the handler focused, even if focusin didn't record it.
                const ae = document.activeElement;
                if (ae != null && ae !== document.body && this.host?.contains(ae)) this.lastFocusedElement = ae;
            } else pageManager.autoFocus?.(this, isFirstFocus);
            return true;
        } else return false;
    }

    onIntentUpdated(handle, intent) {
        if (this.isOpened) {
            if (window.isDebug) console.log("[onIntentUpdated] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            if (this.handler?.onIntentUpdated != null) this.handler.onIntentUpdated(this, intent);
            if (this.intent?.onIntentUpdated != null) for (var item of this.intent.onIntentUpdated) if (item.from == this.hostType && !item.disabled) this.processAction(item);
        }
    }

    onReload() {
        if (this.isOpened) {
            if (window.isDebug) console.log("[onReload] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            return this.reload(false);
        } else return false;
    }

    async onBack() {
        if (this.isShowing) {
            if (window.isDebug) console.log("[onBack] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            return await this.back(false);
        } else return false;
    }

    async onBlur() {
        if (this.isShowing) {
            this.#isFocused = false;
            if (window.isDebug) console.log("[onBlur] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            if (this.intent?.onBlur != null) for (var item of this.intent.onBlur) if (item.from == this.hostType && !item.disabled) await this.processAction(item);
            await this.handler?.onBlur?.(this, this.isClosing);
            return true;
        } else return false;
    }

    async onHide(fullyHide) {
        if (this.isShowing) {
            this.#isShowing = false;
            if (window.isVerbosely) console.log("[onHide] " + this.sectionBound + " " + this.hostType + " " + this.pid, this.host);
            else if (window.isDebug) console.log("[onHide] " + this.sectionBound + " " + this.hostType + " " + this.pid);
            if (this.#coverEntryToken != null) estreUi.coverBarHandle?.setMinimizedByToken(this.#coverEntryToken, true);
            if (this.intent?.onHide != null) for (var item of this.intent.onHide) if (item.from == this.hostType && !item.disabled) await this.processAction(item);
            if (this.handler?.onHide != null) await this.handler.onHide(this, fullyHide);
            if (this.intent?.bringOnBack != null && this.intent.bringOnBack.pid != n) {
                const bringOnBack = this.intent.bringOnBack;
                const isNotAssignedHostType = bringOnBack.hostType == n;
                const isMatchHostType = bringOnBack.hostType == this.hostType;
                if ((this.isStatic && isMatchHostType) || this.isClosing && (isNotAssignedHostType || isMatchHostType)) {
                    const pid = bringOnBack.pid;
                    delete this.intent.bringOnBack;
                    if (window.isDebug) console.log("Bringing on back to " + pid);
                    postQueue(_ => pageManager.bringPage(pid));
                }
            }
            this.#isHiding = false;
            return true;
        } else return false;
    }

    async onClose(isTermination = false, isOnRelease = false) {
        if (this.isOpened && (isOnRelease || !this.isStatic)) {
            this.#isOpened = false;
            this.#everFocused = false;
            this.lastFocusedElement = null;
            if (window.isDebug) console.log("[onClose] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            this.#releaseCoverEntry();
            if (this.intent?.onClose != null) for (var item of this.intent.onClose) if (item.from == this.hostType && !item.disabled) await this.processAction(item);
            if (this.handler?.onClose != null) await this.handler.onClose(this);
            if (this.intent?.bringOnBack != null && this.intent.bringOnBack.pid != n) {
                const bringOnBack = this.intent.bringOnBack;
                const isNotAssignedHostType = bringOnBack.hostType == n;
                const isMatchHostType = bringOnBack.hostType == this.hostType;
                if (isNotAssignedHostType || isMatchHostType) {
                    const pid = bringOnBack.pid;
                    delete this.intent.bringOnBack;
                    if (window.isDebug) console.log("Bringing on back to " + pid);
                    postQueue(_ => pageManager.bringPage(pid));
                }
            }
            return true;
        } else return false;
    }

    async onRelease(remove) {
        if (!this.isReleasing) {
            this.#isReleasing = true;
            if (this.isStatic) await this.close(false, true);
            const removal = remove == null ? "leave" : (remove ? "remove" : "empty")
            if (window.isDebug) console.log("[onRelease(" + removal + ")] " + this.sectionBound + " " + this.hostType + " " + this.pid);//, this.host);
            if (this.handler?.onRelease != null) await this.handler.onRelease(this, remove);
            if (this.intent?.onRelease != null) for (var item of this.intent.onRelease) if (item.from == this.hostType && !item.disabled) await this.processAction(item);

            // for (const revoke of this.#revokeIntentDataBindProxy.looks) try {
            //     revoke?.();
            // } catch (ex) {}
            // this.#revokeIntentDataProxy?.();
            // this.#revokeIntentProxy?.();
            return true;
        } else return false;
    }


    processAction(data) {
        if (data?.from == this.hostType) {
            switch (data.action) {
                case "autoClose":
                    if (data.host != null) {
                        const handle = this.getHost(data.host);
                        if (data.time != null && !isNaN(data.time)) {
                            setTimeout(_ => handle?.close(), parseInt(data.time));
                        }
                    }
                    break;

                case "closePage":
                    if (data.targetPid != null) {
                        pageManager.closePage(data.targetPid);
                    }
                    break;
            }
        }
    }

    getHost(hostType) {
        return this;
    }



    // active struct master
    applyActiveStruct($host = this.$host, handle = this, replaceHandles = false) {
        this.initContentBrokers($host);
        this.initLiveElement($host, replaceHandles);

        const applied = this.handler.onApplied?.(this, this.intent?.data, this.intent, $host, replaceHandles);
        if (handle != this) handle.handler.onApplied?.(handle, handle.intent?.data, handle.intent, $host, replaceHandles);
        return applied;
    }

    applyActiveStructLocalBind($host = this.$host) {
        this.initDataBind($host);
    }

    applyActiveStructAfterBind($host = this.$host, replaceHandles = false) {
        this.initContentBrokersAfterBind($host);
        this.initLiveElement($host, replaceHandles);
    }

    // content brokers
    initContentBrokers($host = this.$host) {
        this.initDataBind($host);
        this.initContentBrokersAfterBind($host);
    }

    initContentBrokersAfterBind($host = this.$host) {
        this.initSolidPoint($host);
        this.initLocalStyle($host);
    }

    initDataBind($host = this.$host) {
        const eachTarget = ($elem, attrId, each = (target, prefix = "", suffix = "") => {}) => {
            const specifier = $elem.attr(attrId);
            if (specifier != null && specifier != "") {
                const targets = specifier.split(s);
                for (let target of targets) {
                    let prefix = "", suffix = "";
                    if (target.indexOf(cf) > -1) [target, prefix] = target.split(cf);
                    if (target.indexOf(ds) > -1) [suffix, target] = target.split(ds);
                    each(target, prefix, suffix);
                }
            }
        }
        const eachTargetFor = ($elem, attrId, each = (targetItem, targetName, prefix = "", suffix = "") => {}) => {
            const specifier = $elem.attr(attrId);
            if (specifier != null && specifier != "") {
                const targets = specifier.split(s);
                for (const target of targets) {
                    let [targetItem, targetName] = target.split(at);
                    let prefix = "", suffix = "";
                    if (targetItem.indexOf(cf) > -1) [targetItem, prefix] = targetItem.split(cf);
                    if (targetItem.indexOf(ds) > -1) [suffix, targetItem] = targetItem.split(ds);
                    each(targetItem, targetName, prefix, suffix);
                }
            }
        }

        if (this.intent != null) {
            const data = this.intent.data;

            if (data != null) for (var item in data) {
                const value = data[item];

                if (isNully(value)) continue;

                if ($host.is(aiv(eds.bind, item))) $host.html(value);
                if ($host.is(aiv(eds.bindAmount, item))) $host.html(v2a(value));
                if ($host.is(aiv(eds.bindValue, item))) $host.val(value);
                $host.find(aiv(eds.bind, item)).html(value);
                $host.find(aiv(eds.bindAmount, item)).html(v2a(value));
                $host.find(aiv(eds.bindValue, item)).val(value);

                if ($host.is(acv(eds.bindAttr, item) + acv(eds.bindAttr, at))) eachTargetFor($host, eds.bindAttr, (targetItem, targetAttr, prefix = "", suffix = "") => {
                    if (targetItem == item) $host.attr(targetAttr, prefix + value + suffix);
                });
                $host.find(acv(eds.bindAttr, item) + acv(eds.bindAttr, at)).each((i, elem) => {
                    const $elem = $(elem);
                    eachTargetFor($elem, eds.bindAttr, (targetItem, targetAttr, prefix = "", suffix = "") => {
                        if (targetItem == item) $elem.attr(targetAttr, prefix + value + suffix);
                    });
                });

                if ($host.find(acv(eds.bindStyle, item) + acv(eds.bindStyle, at))) eachTargetFor($host, eds.bindStyle, (targetItem, targetStyle, prefix = "", suffix = "") => {
                    if (targetItem == item) $host.css(targetStyle, prefix + value + suffix);
                });
                $host.find(acv(eds.bindStyle, item) + acv(eds.bindStyle, at)).each((i, elem) => {
                    const $elem = $(elem);
                    eachTargetFor($elem, eds.bindStyle, (targetItem, targetStyle, prefix = "", suffix = "") => {
                        if (targetItem == item) $elem.css(targetStyle, prefix + value + suffix);
                    });
                });

                if (value instanceof Array) $host.find(aiv(eds.bindArray, item)).each((i, elem) => {
                    const $elem = $(elem);

                    const placeholderMessage = $elem.attr(eds.placeholder);
                    const $placeholder = $elem.find(uis.placeholder);
                    // $placeholder.remove();
                    if (elem.dataset.frozenPlaceholder == null) {
                        $placeholder.find(".message").html("|message|");
                        const solidPlaceholder = $placeholder.length > 0 ? $placeholder[0].stringified() : (new Doctre("div.placeholder", [["span.message", "|message|"]])).toString();
                        $elem.attr(eds.frozenPlaceholder, solidPlaceholder);
                    }

                    // const liHtml = $elem.first().html().trim();
                    // $elem.empty();
                    if (elem.dataset.frozenItem == null) elem.solid("frozenItem");
                    else $elem.empty();
                    
                    if (value.length < 1) {
                        // if ($placeholder.length > 0) {
                        //     if (nne(placeholderMessage)) $placeholder.find(".message").html(placeholderMessage);
                        //     $elem.append($placeholder);
                        // } else {
                        //     const placeholder = doc.ce(div, "placeholder");
                        //     const message = doc.ce(sp, "message", nne(placeholderMessage) ? placeholderMessage : "No data");
                        //     placeholder.append(message);
                        //     $elem.append(placeholder);
                        // }
                        elem.melt({ "message": (isNotNullAndEmpty(placeholderMessage) ? placeholderMessage : "No data") }, "frozenPlaceholder");
                    } else for (var index in value) {
                        const arrayItem = value[index];

                        // const li = $.parseHTML(liHtml);
                        // const $li = $(li);
                        const $li = $(elem.hot({}, "frozenItem")).children();
                        $elem.append($li);

                        const valueIsObject = typeof arrayItem == "object";

                        var arrayItemValue = arrayItem;

                        if (isNotNully(arrayItemValue)) {
                            if (valueIsObject) {
                                arrayItemValue = JSON.stringify(arrayItem);

                                for (var objItem in arrayItem) {
                                    const value = arrayItem[objItem];

                                    if (isNully(value)) continue;

                                    if ($li.is(aiv(eds.bindObjectArrayItem, objItem))) $li.html(value);
                                    if ($li.is(aiv(eds.bindObjectArrayAmount, objItem))) $li.html(v2a(value));
                                    if ($li.is(aiv(eds.bindObjectArrayValue, objItem))) $li.val(value);
                                    $li.find(aiv(eds.bindObjectArrayItem, objItem)).html(value);
                                    $li.find(aiv(eds.bindObjectArrayAmount, objItem)).html(v2a(value));
                                    $li.find(aiv(eds.bindObjectArrayValue, objItem)).val(value);

                                    if ($li.is(acv(eds.bindObjectArrayAttr, objItem) + acv(eds.bindObjectArrayAttr, at))) eachTargetFor($li, eds.bindObjectArrayAttr, (targetItem, targetAttr, prefix = "", suffix = "") => {
                                        if (targetItem == objItem) $li.attr(targetAttr, prefix + value + suffix);
                                    });
                                    $li.find(acv(eds.bindObjectArrayAttr, objItem) + acv(eds.bindObjectArrayAttr, at)).each((i, elem) => {
                                        const $elem = $(elem);
                                        eachTargetFor($elem, eds.bindObjectArrayAttr, (targetItem, targetAttr, prefix = "", suffix = "") => {
                                            if (targetItem == objItem) $elem.attr(targetAttr, prefix + value + suffix);
                                        });
                                    });

                                    const styleValue = isEmpty(value) ? "unset" : value;

                                    if ($li.is(acv(eds.bindObjectArrayStyle, objItem) + acv(eds.bindObjectArrayStyle, at))) eachTargetFor($li, eds.bindObjectArrayStyle, (targetItem, targetStyle, prefix = "", suffix = "") => {
                                        if (targetItem == objItem) $li.css(targetStyle, prefix + styleValue + suffix);
                                    });
                                    $li.find(acv(eds.bindObjectArrayStyle, objItem) + acv(eds.bindObjectArrayStyle, at)).each((i, elem) => {
                                        const $elem = $(elem);
                                        eachTargetFor($elem, eds.bindObjectArrayStyle, (targetItem, targetStyle, prefix = "", suffix = "") => {
                                            if (targetItem == objItem) $elem.css(targetStyle, prefix + styleValue + suffix);
                                        });
                                    });
                                }
                            }

                            if ($li.is(ax(eds.bindArrayItem))) $li.html(arrayItemValue);
                            if ($li.is(ax(eds.bindArrayAmount))) $li.html(v2a(arrayItemValue));
                            if ($li.is(ax(eds.bindArrayValue))) $li.val(arrayItemValue);
                            $li.find(ax(eds.bindArrayItem)).html(arrayItemValue);
                            $li.find(ax(eds.bindArrayAmount)).html(v2a(arrayItemValue));
                            $li.find(ax(eds.bindArrayValue)).val(arrayItemValue);

                            if ($li.is(ax(eds.bindArrayIndex))) $li.html(index);
                            if ($li.is(ax(eds.bindArrayIndexAmount))) $li.html(v2a(index));
                            if ($li.is(ax(eds.bindArrayIndexValue))) $li.val(index);
                            $li.find(ax(eds.bindArrayIndex)).html(index);
                            $li.find(ax(eds.bindArrayIndexAmount)).html(v2a(index));
                            $li.find(ax(eds.bindArrayIndexValue)).val(index);
                            
                            if (valueIsObject) arrayItemValue = btoa(Jcodd.toCodd(arrayItemValue));


                            if ($li.is(ax(eds.bindArrayIndexAttr))) eachTarget($li, eds.bindArrayIndexAttr, (target, prefix = "", suffix = "") => {
                                $li.attr(target, prefix + index + suffix);
                            });
                            $li.find(ax(eds.bindArrayIndexAttr)).each((i, elem) => {
                                const $elem = $(elem);
                                eachTarget($elem, eds.bindArrayIndexAttr, (target, prefix = "", suffix = "") => {
                                    $elem.attr(target, prefix + index + suffix);
                                });
                            });


                            if ($li.is(ax(eds.bindArrayAttr))) eachTarget($li, eds.bindArrayAttr, (target, prefix = "", suffix = "") => {
                                $li.attr(target, prefix + arrayItemValue + suffix);
                            });
                            $li.find(ax(eds.bindArrayAttr)).each((i, elem) => {
                                const $elem = $(elem);
                                eachTarget($elem, eds.bindArrayAttr, (target, prefix = "", suffix = "") => {
                                    $elem.attr(target, prefix + arrayItemValue + suffix);
                                });
                            });

                            const styleArrayItemValue = isEmpty(value) ? "unset" : value;

                            if ($li.find(ax(eds.bindArrayStyle))) eachTarget($li, eds.bindArrayStyle, (target, prefix = "", suffix = "") => {
                                $li.css(target, prefix + styleArrayItemValue + suffix);
                            });
                            $li.find(ax(eds.bindArrayStyle)).each((i, elem) => {
                                const $elem = $(elem);
                                eachTarget($elem, eds.bindArrayStyle, (target, prefix = "", suffix = "") => {
                                    $elem.css(target, prefix + styleArrayItemValue + suffix);
                                });
                            });
                        }


                        if ($li.is(ax(eds.showOnExistsObjectArrayItem))) {
                            if (isNully(arrayItem) || isNully(arrayItem[$li.attr(eds.showOnExistsObjectArrayItem)])) $li.css("display", "none");
                            else $li.css("display", "");
                        }
                        $li.find(ax(eds.showOnExistsObjectArrayItem)).each((i, elem) => {
                            if (isNully(arrayItem) || isNully(arrayItem[elem.dataset.showOnExistsObjectArrayItem])) $(elem).css("display", "none");
                            else $(elem).css("display", "");
                        });
            
                        if ($li.is(ax(eds.showOnNotExistsObjectArrayItem))) {
                            if (isNotNully(arrayItem) && isNotNully(arrayItem[$li.attr(eds.showOnNotExistsObjectArrayItem)])) $li.css("display", "none");
                            else $li.css("display", "");
                        }
                        $li.find(ax(eds.showOnNotExistsObjectArrayItem)).each((i, elem) => {
                            if (isNotNully(arrayItem) && isNotNully(arrayItem[elem.dataset.showOnNotExistsObjectArrayItem])) $(elem).css("display", "none");
                            else $(elem).css("display", "");
                        });
            
                        if ($li.is(acv(eds.showOnEqualsObjectArrayItem, "="))) {
                            const [objItem, matchValue] = $li.attr(eds.showOnEqualsObjectArrayItem).split("=");
                            if (isNully(arrayItem) || arrayItem[objItem] != matchValue) $li.css("display", "none");
                            else $li.css("display", "");
                        }
                        $li.find(acv(eds.showOnEqualsObjectArrayItem, "=")).each((i, elem) => {
                            const [objItem, matchValue] = elem.dataset.showOnEqualsObjectArrayItem.split("=");
                            if (isNully(arrayItem) || arrayItem[objItem] != matchValue) $(elem).css("display", "none");
                            else $(elem).css("display", "");
                        });            
                    }
                });
            }

            if ($host.is(ax(eds.showOnExists))) {
                if (isNully(data) || isNully(data[$host.attr(eds.showOnExists)])) $host.css("display", "none");
                else $host.css("display", "");
            }
            $host.find(ax(eds.showOnExists)).each((i, elem) => {
                if (isNully(data) || isNully(data[elem.dataset.showOnExists])) $(elem).css("display", "none");
                else $(elem).css("display", "");
            });

            if ($host.is(ax(eds.showOnNotExists))) {
                if (isNotNully(data) && isNotNully(data[$host.attr(eds.showOnNotExists)])) $host.css("display", "none");
                else $host.css("display", "");
            }
            $host.find(ax(eds.showOnNotExists)).each((i, elem) => {
                if (isNotNully(data) && isNotNully(data[elem.dataset.showOnNotExists])) $(elem).css("display", "none");
                else $(elem).css("display", "");
            });

            if ($host.is(acv(eds.showOnEquals, "="))) {
                const [item, matchValue] = $host.attr(eds.showOnEquals).split("=");
                if (isNully(data) || data[item] != matchValue) $host.css("display", "none");
            }            
            $host.find(acv(eds.showOnEquals, "=")).each((i, elem) => {
                const [item, matchValue] = elem.dataset.showOnEquals.split("=");
                if (isNully(data) || data[item] != matchValue) $(elem).css("display", "none");
            });            
        }
    }

    initSolidPoint($host = this.$host) {
        const $solidPoint = $host.find(ax(eds.solid));

        const points = [];
        for (const point of $solidPoint) {
            const val = point.dataset.solid;
            if (isNotNullAndEmpty(val?.trim()) && !isNaN(val)) {
                const priority = parseInt(val);
                if (points[priority] == null) points[priority] = [];
                points[priority].push(point);
            }
        }

        for (const index of points.ways.reverse()) {
            const pointSet = points[index];
            if (pointSet != null) for (var i = pointSet.length - 1; i >= 0; i--) {
                const point = pointSet[i];
                if (isNullOrEmpty(point.dataset.frozen) && point.solid?.() != null) point.dataset.solid = "";
            }
        }
    }

    // local styler
    initLocalStyle($host = this.$host) {
        const $localStyles = $host.find("local-style");
        for (const elem of $localStyles) LocalStyle.localize(elem);
    }
    

    // live element
    initLiveElement($host = this.$host, replaceHandles = false) {
        this.initHandles($host, replaceHandles);
        this.initPassiveLinks($host);
        this.initLottieLoaders($host);
    }

    releaseHandles($host = this.$host) {
        if ($host != null) EstreHandle.releaseHandles($host, this);
    }

    initHandles($host = this.$host, replace = false) {
        EstreHandle.initHandles($host, this, replace);
    }

    // passive links
    initPassiveLinks($host = this.$host) {
        this.initInternalLink($host);
        this.initPageLink($host);
    }

    initInternalLink($host = this.$host) {
        if ($host.is(ax(eds.openTarget) + ax(eds.openContainer) + ax(eds.openId))) this.setEventInternalLink($host[0]);
        const $links = $host.find(ax(eds.openTarget) + ax(eds.openContainer) + ax(eds.openId));
        for (const item of $links) this.setEventInternalLink(item);
    }

    initPageLink($host = this.$host) {
        if ($host.is(ax(eds.closePage))) this.setEventPageCloseLink($host[0]);
        const $closeLinks = $host.find(ax(eds.closePage));
        for (const item of $closeLinks) this.setEventPageCloseLink(item);
        
        if ($host.is(ax(eds.openPage))) this.setEventPageOpenLink($host[0]);
        const $openLinks = $host.find(ax(eds.openPage));
        for (const item of $openLinks) this.setEventPageOpenLink(item);

        if ($host.is(ax(eds.showPage))) this.setEventPageShowLink($host[0]);
        const $showLinks = $host.find(ax(eds.showPage));
        for (const item of $showLinks) this.setEventPageShowLink(item);
    }

    initLottieLoaders($host = this.$host) {
        const $loaders = $host.find(uis.dotlottieLoader);
        for (const loader of $loaders) {
            const player = doc.ce(dlp);
            for (const { name, value } of loader.attributes) player.setAttribute(name, value);
            loader.after(player);
            loader.remove();
        }
    }


    // event handlers
    #internalLinkEvent = null;
    #pageOpenLinkEvent = null;
    #pageCloseLinkEvent = null;
    #pageShowLinkEvent = null;

    setEventInternalLink(item) {
        const handle = this;

        this.#internalLinkEvent ??= async function(e) {
            e.preventDefault();

            const $this = $(this);

            const targetSet = $this.attr(eds.openTarget).split("@");
            const target = targetSet.length < 2 ? "self" : targetSet[0];//$this.closest(se + uis.rootTabContent).attr("id")
            const targetBound = targetSet[targetSet.length < 2 ? 0 : 1];
            const container = $this.attr(eds.openContainer);
            const id = $this.attr(eds.openId);
            const action = $this.attr(eds.openAction)?.let(it => isEmpty(it) ? n : it);
            const data = $this.attr(eds.openData)?.let(it => isEmpty(it) ? n : it.let(_ => {
                try {
                    return Jcodd.parse(it);
                } catch (exc) {
                    return Jcodd.parse(it.replace(/'/g, '"'));
                }
            }));
            const bringOnBackPid = $this.attr(eds.openBringOnBack)?.let(it => isEmpty(it) ? n : it == t1 ? handle.pid : it);

            let intent = nn(action) ? (nn(data) ? { data, action } : { action }) : nn(data) ? { data } : u;
            if (nn(bringOnBackPid)) {
                const bringOnBack = { pid: bringOnBackPid, hostType: container };
                if (tu(intent)) intent = { bringOnBack };
                else intent.bringOnBack = bringOnBack;
            }
            let pushedIntent = typeof intent == U;

            switch (targetBound) {
                case "root":
                    switch (container) {
                        case "component":
                            let component;
                            switch (handle.sectionBound) {
                                case "main":
                                    if (pushedIntent) estreUi.switchRootTab(id);
                                    else {
                                        estreUi.switchRootTab(id, intent);
                                        pushedIntent = true;
                                    }
                                    break;
                    
                                case "blind":
                                    component = estreUi.blindSections[id];
                                    if (component == null) {
                                        if (pushedIntent) estreUi.openInstantBlinded(id);
                                        else {
                                            estreUi.openInstantBlinded(id, intent);
                                            pushedIntent = true;
                                        }
                                        component = estreUi.blindSections[id];
                                    }
                                    if (component != null) {
                                        if (pushedIntent) estreUi.showInstantBlinded(id);
                                        else estreUi.showInstantBlinded(id, intent);
                                    }
                                    break;
                    
                                case "overlay":
                                    component = estreUi.overlaySections[id];
                                    if (component == null) {
                                        if (pushedIntent) estreUi.openManagedOverlay(id);
                                        else {
                                            estreUi.openManagedOverlay(id, intent);
                                            pushedIntent = true;
                                        }
                                        component = estreUi.overlaySections[id];
                                    }
                                    if (component != null) {
                                        if (pushedIntent) estreUi.showManagedOverlay(id);
                                        else estreUi.showManagedOverlay(id, intent);
                                    }
                                    break;
                    
                                case "menu":
                                    component = estreUi.menuSections[id];
                                    if (component == null) {
                                        if (pushedIntent) estreUi.openMenuArea(id);
                                        else {
                                            estreUi.openMenuArea(id, intent);
                                            pushedIntent = true;
                                        }
                                        component = estreUi.menuSections[id];
                                    }
                                    if (component != null) {
                                        if (pushedIntent) estreUi.showMenuArea(id);
                                        else estreUi.showMenuArea(id, intent);
                                    }
                                    break;
                    
                                case "header":
                                    component = estreUi.headerSections[id];
                                    if (component == null) {
                                        if (pushedIntent) estreUi.openHeaderBar(id);
                                        else {
                                            estreUi.openHeaderBar(id, intent);
                                            pushedIntent = true;
                                        }
                                        component = estreUi.headerSections[id];
                                    }
                                    if (component != null) {
                                        if (pushedIntent) estreUi.showHeaderBar(id);
                                        else estreUi.showHeaderBar(id, intent);
                                    }
                                    break;
                            }
                            break;
                    }
                    break;

                case "component":
                    switch (container) {
                        case "container":
                            const isSelf = target == "self";
                            const thisComponent = handle.container.component;
                            let component;
                            if (isSelf) component = thisComponent;
                            else switch (thisComponent.sectionBound) {
                                case "main":
                                    component = estreUi.mainSections[target];
                                    if (component == null) {
                                        //estreUi.switchRootTab(target);
                                        component = estreUi.mainSections[target];
                                    }
                                    break;
                    
                                case "blind":
                                    component = estreUi.blindSections[target];
                                    if (component == null) {
                                        estreUi.openInstantBlinded(target);
                                        component = estreUi.blindSections[target];
                                    }
                                    break;
                    
                                case "overlay":
                                    component = estreUi.overlaySections[target];
                                    if (component == null) {
                                        estreUi.openManagedOverlay(target);
                                        component = estreUi.overlaySections[target];
                                    }
                                    break;
                    
                                case "menu":
                                    component = estreUi.menuSections[target];
                                    if (component == null) {
                                        estreUi.openMenuArea(target);
                                        component = estreUi.menuSections[target];
                                    }
                                    break;
                    
                                case "header":
                                    component = estreUi.headerSections[target];
                                    if (component == null) {
                                        estreUi.openHeaderBar(target);
                                        component = estreUi.headerSections[target];
                                    }
                                    break;
                            }
                            if (component != null) {
                                let targetContainer = component.containers[id];
                                if (targetContainer == null) {
                                    if (pushedIntent) component.openContainer(id);
                                    else {
                                        component.openContainer(id, intent);
                                        pushedIntent = true;
                                    }
                                    targetContainer = component.containers[id];
                                }
                                if (targetContainer != null) {
                                    let success = pushedIntent ? targetContainer.show() : component.showContainer(id, intent);
                                    if (success && !isSelf) switch (component.sectionBound) {
                                        case "main":
                                            estreUi.switchRootTab(target);
                                            break;
                                            
                                        case "blind":
                                            estreUi.showInstantBlinded(target);
                                            break;

                                        case "overlay":
                                            estreUi.showManagedOverlay(target);
                                            break;

                                        case "menu":
                                            estreUi.showMenuArea(target);
                                            break;

                                        case "header":
                                            estreUi.showHeaderBar(target);
                                            break;
                                    }
                                }
                            }
                            break;
                    }
                    break;

                case "container":
                    switch (container) {
                        case "article":
                            const isSelf = target == "self";
                            const component = handle.container.component;
                            let targetContainer = isSelf ? handle.container : component.containers[target];
                            if (targetContainer == null) {
                                component.openContainer(target);
                                targetContainer = component.containers[target];
                            }
                            if (targetContainer != null) {
                                let article = targetContainer.articles[id];
                                if (article == null) {
                                    if (pushedIntent) targetContainer.openArticle(id);
                                    else {
                                        targetContainer.openArticle(id, intent);
                                        pushedIntent = true;
                                    }
                                    article = targetContainer.articles[id];
                                }
                                if (article != null) {
                                    let success = pushedIntent ? article.show() : targetContainer.showArticle(id, intent);
                                    if (success) targetContainer.show();
                                }
                            }
                            break;
                    }
                    break;

            }

            return false;
        };

        $(item).off("click", this.#internalLinkEvent).click(this.#internalLinkEvent);
    }

    setEventPageOpenLink(item) {
        const handle = this;

        this.#pageOpenLinkEvent ??= function(e) {
            e.stopPropagation();

            const $this = $(this);

            const pid = $this.attr(eds.openPage);
            const action = $this.attr(eds.openAction)?.let(it => isEmpty(it) ? n : it);
            const data = $this.attr(eds.openData)?.let(it => isEmpty(it) ? n : it.let(_ => {
                try {
                    return Jcodd.parse(it);
                } catch (exc) {
                    return Jcodd.parse(it.replace(/'/g, '"'));
                }
            }));
            const bringOnBackPid = $this.attr(eds.openBringOnBack)?.let(it => isEmpty(it) ? n : it == t1 ? handle.pid : it);

            let intent = nn(action) ? (nn(data) ? { data, action } : { action }) : nn(data) ? { data } : u;
            if (nn(bringOnBackPid)) {
                const bringOnBack = { pid: bringOnBackPid };
                if (tu(intent)) intent = { bringOnBack };
                else intent.bringOnBack = bringOnBack;
            }
            let intentReady = typeof intent != UNDEFINED;

            if (intentReady) pageManager.bringPage(pid, intent);
            else pageManager.bringPage(pid);
        };

        $(item).off("click", this.#pageOpenLinkEvent).click(this.#pageOpenLinkEvent);
    }

    setEventPageShowLink(item) {
        const handle = this;

        this.#pageShowLinkEvent ??= function(e) {
            e.stopPropagation();

            const $this = $(this);

            const pid = $this.attr(eds.showPage);
            const action = $this.attr(eds.showAction)?.let(it => isEmpty(it) ? n : it);
            const data = $this.attr(eds.showData)?.let(it => isEmpty(it) ? n : it.let(_ => {
                try {
                    return Jcodd.parse(it);
                } catch (exc) {
                    return Jcodd.parse(it.replace(/'/g, '"'));
                }
            }));
            const bringOnBackPid = $this.attr(eds.showBringOnBack)?.let(it => isEmpty(it) ? n : it == t1 ? handle.pid : it);

            let intent = nn(action) ? (nn(data) ? { data, action } : { action }) : nn(data) ? { data } : u;
            if (nn(bringOnBackPid)) {
                const bringOnBack = { pid: bringOnBackPid };
                if (tu(intent)) intent = { bringOnBack };
                else intent.bringOnBack = bringOnBack;
            }
            let intentReady = typeof intent != UNDEFINED;

            if (intentReady) pageManager.showPage(pid, intent);
            else pageManager.showPage(pid);
        };

        $(item).off("click", this.#pageShowLinkEvent).click(this.#pageShowLinkEvent);
    }

    setEventPageCloseLink(item) {
        this.#pageCloseLinkEvent ??= function(e) {
            e.stopPropagation();

            const $this = $(this);

            const pid = $this.attr(eds.closePage);

            pageManager.closePage(pid);
        };

        $(item).off("click", this.#pageCloseLinkEvent).click(this.#pageCloseLinkEvent);
    }
}


/**
 * Page host's handle (page handles sub pages)
 */
class EstrePageHostHandle extends EstrePageHandle {

    get title() { return this.currentOnTop?.title ?? this.$host?.attr(eds.title); }

    // get appbarLeft() { return val(this.currentOnTop?.appbarLeft, it => tu(it) ? super.appbarLeft : it); }
    // set appbarLeft(value) { super.appbarLeft = value; }
    // get appbarRight() { return val(this.currentOnTop?.appbarRight, it => tu(it) ? super.appbarRight : it); }
    // set appbarRight(value) { super.appbarRight = value; }
    // get appbarCenter() { return val(this.currentOnTop?.appbarCenter, it => tu(it) ? super.appbarCenter : it); }
    // set appbarCenter(value) { super.appbarCenter = value; }
    get isAppbarLeftAssigned() { return this.currentOnTop?.isAppbarLeftAssigned || super.isAppbarLeftAssigned; }
    get isAppbarRightAssigned() { return this.currentOnTop?.isAppbarRightAssigned || super.isAppbarRightAssigned; }
    get isAppbarCenterAssigned() { return this.currentOnTop?.isAppbarCenterAssigned || super.isAppbarCenterAssigned; }
    get appbarLeftFeed() { return this.currentOnTop?.isAppbarLeftAssigned ? this.currentOnTop?.appbarLeftFeed : super.appbarLeftFeed; }
    get appbarRightFeed() { return this.currentOnTop?.isAppbarRightAssigned ? this.currentOnTop?.appbarRightFeed : super.appbarRightFeed; }
    get appbarCenterFeed() { return this.currentOnTop?.isAppbarCenterAssigned ? this.currentOnTop?.appbarCenterFeed : super.appbarCenterFeed; }

    get subPages() { return {}; }
    get subPageList() { return []; }
    get $subPages() { return $(); }
    get $subPage() { return {}; }

    get isSingleSubPage() { return this.$subPages.length === 1; }
    get isMultiSubPages() { return this.$subPages.length > 1; }

    get currentTop() { return this.currentOnTop ?? this.subPageList.at(-1); }

    #prevSubPageIds = new Set();
    get latestSubPageId() { return [...this.#prevSubPageIds].pop(); }
    get prevSubPageId() {
        const subPageIds = this.subPages.ways;
        let latestSubPageId = null;
        while (latestSubPageId = this.latestSubPageId) {
            this.#prevSubPageIds.delete(latestSubPageId);
            if (subPageIds.includes(latestSubPageId)) return latestSubPageId;
        }
        return null;
    };
    set prevSubPageId(id) {
        if (id == null) return;
        if (this.#prevSubPageIds.has(id)) this.#prevSubPageIds.delete(id);
        this.#prevSubPageIds.add(id);
    };

    get isAvailablePrevSubPage() {
        const latestSubPageId = this.latestSubPageId;
        return latestSubPageId != null && this.subPages[latestSubPageId] != null;
    }


    initSubPages(intent) {

    }

    registerSubPage(element, intent) {

    }

    unregisterSubPage(pageHandle) {

    }


    showSubPage(id, intent, instanceOrigin) {
        return false;
    }

    openSubPage(id, intent, instanceOrigin) {
        return false;
    }

    bringSubPage(id, intent, instanceOrigin) {
        return false;
    }

    closeSubPage(id, instanceOrigin, isTermination = false) {

    }

    terminate() {

    }

    close(isTermination = false) {
        return super.close(isTermination);
    }

    focus() {
        const processed = super.focus();
        let subPageProcessed = false;
        if (this.isFocused) subPageProcessed = this.currentTop?.focus();
        return processed || subPageProcessed;
    }

}


/**
 * Component page handle for main sections & menu sections
 */
class EstreComponent extends EstrePageHostHandle {
    // constants
    hostType = "component";
    get sectionBound() { return "main" };

    // class property
    static components = {};
    static componentList = [];


    // static methods;
    static register(component) {
        const registered = EstreUiPage.registerOrCommitFrom(component);
        if (registered === false) return false;
        this.unregister(component);
        this.componentList.push(component);
        this.components[component.instanceId] = component;
        return registered;
    }

    static unregister(component) {
        const instanceId = component.instanceId;
        if (this.components[instanceId] != null) delete this.components[instanceId];
        const index = this.componentList.indexOf(component);
        if (index > -1) this.componentList.splice(index, 1);
        return EstreUiPage.unregisterFrom(component);
    }


    // instance property
    get isCanBack() { switch (this.sectionBound) {
            case "main":
                const latestRootTabId = estreUi.latestRootTabId;
                return !this.isHome && ((latestRootTabId != null && estreUi.mainSections[latestRootTabId] != null) || estreUi.mainSections["home"] != null);

            case "blind":
            case "menu":
            case "overlay":
            case "header":
            case "panel":
                return false;
        }
    }

    get subPages() { return this.containers; }
    get subPageList() { return this.containerList; }
    get $subPages() { return this.$containers; }
    get $subPage() { return this.$container; }

    containers = {};
    containerList = [];
    get $containers() { return this.$host?.find(c.c + uis.container); };
    $container = {};

    get rootContainer() { return this.containers.root; }
    get mainArticle() { return this.rootContainer?.mainArticle; }

    get isSingleContainer() { return this.isSingleSubPage; }
    get isMultiContainer() { return this.isMultiSubPages; }

    get isAvailableRootContainer() { return this.rootContainer != null; }
    get isExistBackContainer() { return this.isMultiSubPages && (this.isAvailablePrevSubPage || ((this.currentTop?.isSub ?? false) && this.isAvailableRootContainer)); }

    get isContainersAllyStatic() {
        for (var container of this.containerList) if (!container.isStatic) return false;
        return true;
    }

    get $articles() { return this.$host.find(c.c + uis.container + c.c + uis.article); };

    get isHome() { return this.id == "home" || this.$host.hasClass("home"); }

    constructor(component, instanceOrigin) {
        super(component, instanceOrigin);
        this.id = component.id;
    }

    release(remove) {
            
        this.unregister();

        return super.release(remove);
    }

    init(intent) {
        const page = this.register();
        if (page === false) return true;

        super.init(page, intent);

        this.initContainers(intent);

        return this;
    }

    register() {
        return EstreComponent.register(this);
    }

    unregister() {
        EstreComponent.unregister(this);
    }

    
    initSubPages(intent) {
        return this.initContainers(intent);
    }

    registerSubPage(element, intent, instanceOrigin) {
        return this.registerContainer(element, intent, instanceOrigin);
    }

    unregisterSubPage(pageHandle) {
        return this.unregisterConatiner(pageHandle);
    }

    initContainers(intent) {
        for (var container of this.$containers) {
            const $container = $(container);
            this.$container[$container.attr(eds.containerId)] = $container;
            this.registerContainer(container, intent);
        }

        let $top = this.$containers.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$containers.filter(aiv(eds.containerId, "root"));
        if ($top.length < 1) $top = this.$containers;
        $top[$top.length - 1]?.pageHandle?.show(false, false);
    }

    registerContainer(element, intent, instanceOrigin) {
        this.unregisterConatiner(element.pageHandle);
        const container = new EstreContainer(element, this, instanceOrigin);
        const instanceId = container.instanceId;
        this.$container[instanceId] = container.$host;
        this.containers[instanceId] = container;
        this.containerList.push(container);
        const registered = EstreUiPage.registerOrCommitFrom(container);
        container.init(registered, intent);
        //if (container.isOnTop) container.show(false, false);
        return container;
    }

    unregisterConatiner(container) {
        if (container == null) return;
        const instanceId = container.instanceId;
        const unregitered = EstreUiPage.unregisterFrom(container);
        container.release(!container.isStatic ? true : null);
        if (this.$container[instanceId] != null) delete this.$container[instanceId];
        if (this.containers[instanceId] != null) delete this.containers[instanceId];
        const index = this.containerList.indexOf(container);
        if (index > -1) this.containerList.splice(index, 1);
        return unregitered;
    }


    // handles
    showSubPage(id, intent, instanceOrigin) {
        return this.showContainer(id, intent, instanceOrigin);
    }

    openSubPage(id, intent, instanceOrigin) {
        return this.openContainer(id, intent, instanceOrigin);
    }

    bringSubPage(id, intent, instanceOrigin) {
        return this.bringContainer(id, intent, instanceOrigin);
    }

    closeSubPage(id, instanceOrigin, isTermination = false) {
        return this.closeContainer(id, instanceOrigin, isTermination);
    }

    showContainer(id, intent, instanceOrigin) {
        if (id != null && !this.isClosing) {
            const show = container => {
                const currentTopHandle = this.currentTop;
                const currentTopHandleId = currentTopHandle.instanceId;
                if (id != currentTopHandleId && currentTopHandleId != this.latestSubPageId) {
                    this.prevSubPageId = currentTopHandleId;

                    // if (estreUi.euiState == "onReady" && currentTopHandle != null) switch (currentTopHandle.sectionBound) {
                    //     case "blind":
                    //     case "menu":
                    //     case "main":
                    //         estreUi.pushCurrentState(currentTopHandle);
                    //         break;
                    // }
                }
                for (var current of this.containerList) if (current.isOnTop && current != container) {
                    current.hide();
                }
                container.pushIntent(intent);
                container.show(false);
                this.currentOnTop = container;

                switch (this.sectionBound) {
                    case "menu":
                    case "main":
                        estreUi.showExactAppbar(this, container);
                        break;
                }
                return true;
            };
            
            const container = this.containers[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
            if (container != null) return show(container);
            else if (instanceOrigin == n) {
                const containerIds = this.containers.ways.filter(it => it.startsWith(id + "^"));
                if (containerIds.length > 0) {
                    const containerId = containerIds[containerIds.length - 1];
                    const container = this.containers[containerId];
                    if (container != null) return show(container);
                }
            }
        }
        return false;
    }

    openContainer(id, intent, instanceOrigin) {
        if (this.isClosing) return false;
        const page = pageManager.getContainer(id, this.id, this.sectionBound);
        if (page == null) return null;
        if (page.statement == "static") return null;
        this.$host.append(page.live);
        const $container = this.$containers.filter(aiv(eds.containerId, id));
        if ($container == null || $container.length < 1) return null;
        return this.registerContainer($container[$container.length - 1], intent, instanceOrigin);
    }

    closeContainer(id, instanceOrigin, isTermination = false) {
        if (id != null) {
            const close = container => {
                const task = container.close(false, isTermination || !container.isStatic);
                if (!isTermination && !this.isClosing) postAsyncQueue(async _ => {
                    if (this.isClosing) return;
                    const target = this.subPages[id];
                    const subPageList = this.subPageList.filter(it => !it.isClosing && it != target);
                    if (subPageList.length > 0) {
                        const prev = this.prevSubPageId;
                        if (prev != null) this.showSubPage(prev);
                        else subPageList[subPageList.length - 1].show();
                    } else {
                        await task;
                        if (!this.isClosing && !this.isStatic && subPageList.length < 1) this.close(true, true);
                    };
                });
                return postAsyncQueue(async _ => {
                    const result = await task;
                    if (isTermination || !container.isStatic) this.unregisterConatiner(container);
                    return result;
                });
            };

            const container = this.containers[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
            if (container != null) return close(container);
            else if (instanceOrigin == n) {
                const containerIds = this.containers.ways.filter(it => it.startsWith(id + "^"));
                if (containerIds.length > 0) {
                    const containerId = containerIds[containerIds.length - 1];
                    const container = this.containers[containerId];
                    return close(container);
                }
            }
        }
        return null;
    }

    bringContainer(id, intent, instanceOrigin) {
        if (this.containers[id] == null) {
            if (this.openContainer(id, intent, instanceOrigin)) return this.showContainer(id, u, instanceOrigin);
            else return false;
        } else return this.showContainer(id, intent, instanceOrigin);
    }

    onCloseContainer() {
        return this.currentOnTop?.close();
    }

    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return estreUi.switchRootTab(estreUi.$rootTabs.filter(aiv(eds.tabId, this.id)));
        } else return super.show(false, setFocus);
    }

    // focus() {
    //     if (this.isShowing) {
    //         const $containers = this.$containers;
    //         let $top = $containers.filter(asv(eds.onTop, t1));
    //         var $targetContainer = null;
    //         if ($top != null) $targetContainer = $top;
    //         else if ($containers.length > 0) $targetContainer = $($containers[$containers.length-1]);

    //         let processed = false;
    //         if ($targetContainer != null) {
    //             processed = $targetContainer[$targetContainer.length - 1]?.pageHandle?.focus();
    //         }
            
    //         super.focus();

    //         return processed;
    //     } else false;
    // }

    back(isRequest = true) {
        return super.back(isRequest);// || (this.sectionBound == "main" && this.isShowing && this.id != "home" && estreUi.switchRootTab("home"));
    }

    blur() {
        super.blur()

        const $containers = this.$containers;
        let $top = $containers.filter(asv(eds.onTop, t1));
        var $targetContainer = null;
        if ($top != null && $top.length > 0) $targetContainer = $top;
        else if ($containers.length > 0) $targetContainer = $($containers[$containers.length-1]);

        if ($targetContainer != null) return postAsyncQueue(async _ => {
            var processed = false
            for (var container of $targetContainer) processed |= await container.pageHandle?.blur();
            return processed;
        });
        else return false;
    }

    close(isRequest = true, isTermination = !this.isStatic) {
        if (isRequest) {
            if (this.isModal) {
                return this.onTop ? estreUi.closeModalTab(this.id, this.$host) : false;
            } else return false;
        } else return super.close(isTermination);
    }


    onShow() {
        const processed = super.onShow();
        let $top = this.$containers.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$containers;
        const container = $top[$top.length - 1]?.pageHandle;
        if (container != null) {
            container.onShow();
            this.currentOnTop = container;
            // container.onFocus();
        }
        return processed;
    }

    async onHide() {
        if (this.$containers != n) {
            let $top = this.$containers.filter(asv(eds.onTop, t1));
            if ($top.length < 1) $top = this.$containers;
            const container = $top[$top.length - 1]?.pageHandle;
            if (container != null) {
                await container.onBlur();
                await container.onHide();
            }
        }
        return await super.onHide();
    }

    async onClose(isTermination = false, isOnRelease = false) {
        const closer = [];

        for (var container of this.containerList.reverse()) closer.push(container.close(true, isTermination));

        await Promise.all(closer);

        return await super.onClose(isTermination, isOnRelease);
    }
}



/**
 * Component page handle for menu sections
 */
class EstreMenuComponent extends EstreComponent {
    // constants
    get sectionBound() { return "menu"; };

    // class property
    static components = {};
    static componentList = [];


    // static methods
    


    // instance property




    constructor(component, instanceOrigin) {
        super(component, instanceOrigin);
    }

    release(remove) {


        return super.release(remove);
    }

    init(intent) {


        super.init(intent);

        

        return this;
    }

    register() {
        return EstreMenuComponent.register(this);
    }

    unregister() {
        EstreMenuComponent.unregister(this);
    }

    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return estreUi.showMenuArea(this.id);
        } else super.show(false, setFocus);
    }

    close(isRequest = true, isTermination = !this.isStatic) {
        if (isRequest) {
            return estreUi.closeMenuArea(this.id, this.instanceOrigin, isTermination);
        } else return super.close(false, isTermination);
    }
}



/**
 * Component page handle for overwatchPanel sections (quickPanel, timeline).
 * Sections live inside the panel's dynamic_section_block and switch by horizontal scroll-snap;
 * opening or closing the whole panel is a shell-level operation on estreUi.
 */
class EstrePanelComponent extends EstreComponent {
    // constants
    get sectionBound() { return "panel"; };

    // class property
    static components = {};
    static componentList = [];


    constructor(component, instanceOrigin) {
        super(component, instanceOrigin);
    }

    release(remove) {
        return super.release(remove);
    }

    init(intent) {
        super.init(intent);
        return this;
    }

    register() {
        return EstrePanelComponent.register(this);
    }

    unregister() {
        EstrePanelComponent.unregister(this);
    }

    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return estreUi.showOverwatchPanelSection(this.id);
        } else super.show(false, setFocus);
    }

    // close() falls through to super — dismissing an individual panel section is not meaningful;
    // call estreUi.closeOverwatchPanel() to close the shell.
}



/**
 * Component page handle for header sections
 */
class EstreHeaderComponent extends EstreComponent {
    // constants
    get sectionBound() { return "header"; };

    // class property
    static components = {};
    static componentList = [];


    // static methods
    


    // instance property




    constructor(component, instanceOrigin) {
        super(component, instanceOrigin);
    }

    release(remove) {


        return super.release(remove);
    }

    init(intent) {


        super.init(intent);

        

        return this;
    }

    register() {
        return EstreHeaderComponent.register(this);
    }

    unregister() {
        EstreHeaderComponent.unregister(this);
    }

    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return estreUi.showHeaderBar(this.id);
        } else super.show(false, setFocus);
    }

    close(isRequest = true, isTermination = !this.isStatic) {
        if (isRequest) {
            return estreUi.closeHeaderBar(this.id, this.instanceOrigin, isTermination);
        } else return super.close(false, isTermination);
    }
}



/**
 * Component page handle for blinded sections
 */
class EstreInstantComponent extends EstreComponent {
    // constants
    get sectionBound() { return "blind"; };

    // class property
    static components = {};
    static componentList = [];


    // static methods
    


    // instance property




    constructor(component, instanceOrigin) {
        super(component, instanceOrigin);
    }

    release(remove) {


        return super.release(remove);
    }

    init(intent) {


        super.init(intent);

        

        return this;
    }

    register() {
        return EstreInstantComponent.register(this);
    }

    unregister() {
        EstreInstantComponent.unregister(this);
    }

    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return estreUi.showInstantBlinded(this.id);
        } else super.show(false, setFocus);
    }

    close(isRequest = true, isTermination = !this.isStatic) {
        if (isRequest) {
            return estreUi.closeInstantBlinded(this.id, this.instanceOrigin, isTermination);
        } else return super.close(false, isTermination);
    }
}



/**
 * Component page handle for managed overlay sections
 */
class EstreOverlayComponent extends EstreInstantComponent {
    // constants
    get sectionBound() { return "overlay"; };

    // class property
    static components = {};
    static componentList = [];


    // static methods
    


    // instance property




    constructor(component, instanceOrigin) {
        super(component, instanceOrigin);
    }

    release(remove) {


        return super.release(remove);
    }

    init(intent) {


        super.init(intent);

        

        return this;
    }

    register() {
        return EstreOverlayComponent.register(this);
    }

    unregister() {
        EstreOverlayComponent.unregister(this);
    }

    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return estreUi.showManagedOverlay(this.id);
        } else super.show(false, setFocus);
    }

    close(isRequest = true, isTermination = !this.isStatic) {
        if (isRequest) {
            return estreUi.closeManagedOverlay(this.id, this.instanceOrigin, isTermination);
        } else return super.close(false, isTermination);
    }
}


/**
 * Container page handle
 */
class EstreContainer extends EstrePageHostHandle {
    
    hostType = "container";

    get sectionBound() { return this.component.sectionBound; }

    component = null;

    #articleStepsId = null;

    #$stepNavigation = null;
    #$stepNavTitleName = null;
    #$stepIndicator = null;
    get #$stepPointers() { return this.#$stepIndicator.find(c.c + uis.stepPointer); }
    get #$stepDividers() { return this.#$stepIndicator.find(c.c + uis.stepDivider); }

    #$masterFloat = null;
    #$masterFloatPad = null;
    #$masterButton = null;
    #$masterButtonTitle = null;

    #onMasterButtonClick = null;

    get isFullyStatic() { return this.component.isFullyStatic && this.isStatic; }

    get isCanBack() { return this.component.isExistBackContainer; }

    get isRoot() { return this.id == "root"; }
    get isSub() { return this.id != "root"; }
    get isStepNavigation() { return this.$host.hasClass("v_stack") || this.$host.hasClass("h_stack"); }

    get subPages() { return this.articles; }
    get subPageList() { return this.articleList; }
    get $subPages() { return this.$articles; }
    get $subPage() { return this.$article; }

    articles = {};
    articleList = [];
    get $articles() { return this.$host?.find(c.c + ar); };
    $article = {};

    get mainArticle() { return this.articles.main; }

    get isSingleArticle() { return this.isSingleSubPage; }
    get isMultiArticle() { return this.isMultiSubPages; }

    get isAvailableMainArticle() { return this.mainArticle != null; }
    get isExistBackArticle() { return this.isMultiSubPages && (this.isAvailablePrevSubPage || ((this.currentTop?.isSub ?? false) && this.isAvailableMainArticle)); }

    get isArticlesAllyStatic() {
        for (var article of this.articleList) if (!article.isStatic) return false;
        return true;
    }

    get $currentArticle() {
        const $articles = this.$articles;
        const $onTop = $articles.filter(asv(eds.onTop, t1));
        if ($onTop.length < 1) return $($articles[$articles.length - 1]);
        else if ($onTop.length > 1) return $($onTop[$onTop.length - 1]);
        else return $onTop;
    }
    get currentArticleStepIndex() {
        return this.getArticleStepIndex(this.$currentArticle);
    }
    get stepPagesLength() { return pageManager.getStepPagesLength(this.#articleStepsId, this.id, this.component.id, this.component.sectionBound); }

    constructor(container, component, instanceOrigin) {
        super(container, instanceOrigin);
        this.component = component;
        this.id = this.$host.attr(eds.containerId);
    }
    
    release(remove) {

        super.release(remove);
    }

    init(page, intent) {
        super.init(page, intent);

        this.setEventHandle();

        this.initArticles(intent);

        return this;
    }

    setEventHandle() {
        const inst = this;
        
        this.$host.find(".back_navigation").click(function (e) {
            e.preventDefault();

            inst.backStep();

            return false;
        });
        
        this.$host.find(".container_closer").click(function (e) {
            e.preventDefault();

            inst.close();

            return false;
        });

        const $masterFloat = this.$host.find(".container_master_float");
        if ($masterFloat.length > 0) {
            this.#$masterFloat = $masterFloat;
            const $masterButton = $masterFloat.find(".container_master_button");
            if ($masterButton.length > 0) {
                this.#$masterButton = $masterButton;
                this.#$masterButtonTitle = $masterButton.find(".container_master_action");

                $masterButton.click(function (e) {
                    e.preventDefault();

                    postAsyncQueue(_ => {
                        const handled = (inst.#onMasterButtonClick?.(e, this)) ?? null;
                        if (handled !== true) {
                            const articleStepsId = inst.#articleStepsId;
                            if (articleStepsId != null) {
                                const current = inst.currentArticleStepIndex;
                                if (current != NaN) {
                                    const length = inst.stepPagesLength;
                                    const next = current + 1;
                                    const nextId = articleStepsId + "%" + next;
                                    if (next < length) pageManager.bringPage(EstreUiPage.getPidArticle(nextId, inst.id, inst.component.id, inst.component.sectionBound), handled);
                                }
                            }
                        }
                    });

                    return false;
                });
            }

            this.#$masterFloat.before(doc.ce(div, "master_float_pad"));
            this.#$masterFloatPad = this.$host.find(".master_float_pad");
            setTimeout(_ => this.#$masterFloatPad.css("height",  + this.#$masterFloat.height() + "px"), 0);
        }
    }
    
    initSubPages(intent) {
        return this.initArticles(intent);
    }

    registerSubPage(element, intent, instanceOrigin) {
        return this.registerArticle(element, intent, instanceOrigin);
    }

    unregisterConatiner(pageHandle) {
        return this.unregisterArticle(pageHandle);
    }

    initArticles(intent) {

        const articleStepsId = this.$host.attr(eds.articleStepsId);
        if (articleStepsId != null && articleStepsId != "") this.#initStepNavigation(articleStepsId);

        for (var article of this.$articles) this.registerArticle(article, intent);

        const $scalables = this.$host.find(c.c + ar + uis.scalable);
        if (this.host.innerWidth >= 740) {//반응형 와이드 모드 기본값 적용
            $scalables.attr(eds.lookScale, t2);
        } else switch ($scalables.length) { //섹션 컴포넌트의 메인 항목 갯수에 따른 초기 표시 모드 적용
            case 0: //해당 없음 - 기본적으로 학생 등록 항목 노출
                break;
                
            case 1: //신규 등록 항목만 노출될 때
            case 2: //등록된 항목 1건
                // $scalables.attr(eds.lookScale, t2);
                // break;

            // case 3: //등록된 항목 2건
                $scalables.attr(eds.lookScale, t1);
            break;

            default: //등록된 항목 3건 이상
                $scalables.attr(eds.lookScale, t0);
                break;
        }

        $scalables.filter(obk + eds.registered + equ + v0 + cbk).attr(eds.lookScale, t0);

        let $top = this.$articles.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$articles.filter(aiv(eds.articleId, "main"));
        if ($top.length < 1) $top = this.$articles;
        const handle = $top[$top.length - 1]?.pageHandle;
        
        if (handle != null) {
            if (handle.show(false, false)) {
                if (estreUi.euiState == "onReady") {
                    estreUi.replaceCurrentState(handle);
                }
            }
        }
    }

    registerArticle(element, intent, instanceOrigin) {
        this.unregisterArticle(element.pageHandle);
        const article = new EstreArticle(element, this, instanceOrigin);
        const instanceId = article.instanceId;
        this.$article[instanceId] = article.$host;
        this.articles[instanceId] = article;
        this.articleList.push(article);
        const registered = EstreUiPage.registerOrCommitFrom(article);
        article.init(registered, intent);
        //if (article.isOnTop) await article.show(false, false);
        return article;
    }

    unregisterArticle(article) {
        if (article == null) return;
        const instanceId = article.instanceId;
        const unregistered = EstreUiPage.unregisterFrom(article);
        article.release(!article.isStatic ? true : null);
        if (this.$article[instanceId] != null) delete this.$article[instanceId];
        if (this.articles[instanceId] != null) delete this.articles[instanceId];
        const index = this.articleList.indexOf(article);
        if (index > -1) this.articleList.splice(index, 1);
        return unregistered;
    }

    #initStepNavigation(articleStepsId) {
        this.#articleStepsId = articleStepsId;
        this.#$stepNavigation = this.$host.find(c.c + uis.stepNavigation);
        this.#$stepNavTitleName = this.#$stepNavigation.find(".cur_step_name");
        this.#$stepIndicator = this.#$stepNavigation.find(uis.stepIndicator);

        this.#$stepIndicator.empty();
        this.#updateStepNavigation(articleStepsId);
    }

    #updateStepNavigation(articleStepsId = this.#articleStepsId) {
        const $currentArticle = this.$currentArticle;

        if (this.#$stepIndicator != null) { 
            const $articleSteps = this.$host.find(asv(eds.articleId, articleStepsId + "%"));
            const $stepPointers = this.#$stepPointers;
            const $stepDividers = this.#$stepDividers;
            const length = Math.max(this.stepPagesLength, $articleSteps.length);
            var steps = $stepPointers.length;
            if ($stepDividers.length != steps - 1) {
                this.#$stepIndicator.empty();
                steps = 0;
            }
            if (steps < length) for (var i=steps; i<length; i++) {
                if (i > 0) this.#$stepIndicator.append(doc.ce(div, "step_divider"));
                this.#$stepIndicator.append(doc.ce(div, "step_pointer"));
            } else if (steps > length) {
                const diff = steps - length;
                for (var i=0; i<diff; i++) {
                    this.#$stepIndicator.last().remove();
                    if (this.#$stepPointers.length > 0) this.#$stepIndicator.last().remove();
                }
            }

            const index = this.currentArticleStepIndex;
            const $pointers = this.#$stepPointers;
            if (index != NaN) {
                $pointers.filter(aiv(eds.active, t1)).attr(eds.active, null);
                $($pointers[index]).attr(eds.active, t1);
            }
        }

        if ($currentArticle.length > 0) this.setCurrentStepName($currentArticle.attr(eds.title));
    }

    setCurrentStepName(title) {
        if (this.#$stepNavTitleName != null) this.#$stepNavTitleName.text(title);
    }

    focusMasterButton() {
        this.#$masterButton?.focus();
    }

    performClickMasterButton() {
        this.#$masterButton?.click();
    }

    setOnClickMasterButton(onClick = null) {
        this.#onMasterButtonClick = onClick;
    }

    setMasterButtonDisabled(disabled) {
        this.#$masterButton?.prop("disabled", disabled);
    }

    setMasterButtonText(text) {
        this.#$masterButtonTitle?.text(text);
    }

    getHost(hostType) {
        if (this.hostType == hostType) return this;
        else return this.component.getHost(hostType);
    }

    backStep() {
        if (this.isStepNavigation) {
            const index = this.currentArticleStepIndex;
            if (index != NaN) {
                const prevIndex = index - 1;
                if (prevIndex > -1) this.showArticle(this.#articleStepsId + "%" + prevIndex);
            }
        }
    }

    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return this.component.showContainer(this.id);
        } else return super.show(false, setFocus);
    }

    // focus() {
    //     if (this.isShowing) {
    //         const $articles = this.$articles;
    //         let $top = $articles.filter(asv(eds.onTop, t1));
    //         var $targetArticle = null;
    //         if ($top != null && $top.length > 0) $targetArticle = $top;
    //         else if ($articles.length > 0) $targetArticle = $($articles[$articles.length-1]);

    //         let processed = false;
    //         if ($targetArticle != null) {
    //             processed = $targetArticle[$targetArticle.length - 1]?.pageHandle?.focus();
    //         }

    //         super.focus();

    //         return processed;
    //     } else return false;
    // }

    blur() {
        this.onBlur();

        const $articles = this.$articles;
        let $top = $articles.filter(asv(eds.onTop, t1));
        var $targetArticle = null;
        if ($top != null && $top.length > 0) $targetArticle = $top;
        else if ($articles.length > 0) $targetArticle = $($articles[$articles.length-1]);

        if ($targetArticle != null) return postAsyncQueue(async _ => {
            var processed = false;
            for (var article of $targetArticle) processed |= await article.pageHandle?.blur();
            return processed;
        });
        return false;
    }

    close(isRequest = true, isTermination = false) {
        if (isRequest) {
            return this.component.closeContainer(this.id, this.instanceOrigin, isTermination) ?? super.close(isTermination);
        } else return super.close(isTermination);
    }

    onShow() {
        const processed = super.onShow();
        let $top = this.$articles.filter(asv(eds.onTop, t1));
        if ($top.length < 1) $top = this.$articles;
        const article = $top[$top.length - 1]?.pageHandle;
        if (article != null) {
            const processed = article.onShow();
            this.currentOnTop = article;
            // article.onFocus();

            if (estreUi.euiState == "onReady" && processed) {
                estreUi.replaceCurrentState(article);
            }
        }
        return processed;
    }

    async onHide() {
        if (this.$articles != n) {
            let $top = this.$articles.filter(asv(eds.onTop, t1));
            if ($top.length < 1) $top = this.$articles;
            const article = $top[$top.length - 1]?.pageHandle;
            if (article != null) {
                await article.onBlur();
                await article.onHide();
            }
        }
        return await super.onHide();
    }

    async onClose(isTermination = false, isOnRelease = false) {
        const stepped = [];
        for (var id in this.articles) if (id.indexOf(this.#articleStepsId + "%") === 0) stepped.push(id);

        const closer = [];

        if (stepped.length > 0) {
            const sorted = stepped.sort();
            for (var i=sorted.length-1; i>-1; i--) closer.push(this.closeArticle(sorted[i], u, isTermination));
        } else {
            for (var article of this.articleList.reverse()) closer.push(article.close(true, isTermination));
        }

        await Promise.all(closer);

        return super.onClose(isTermination, isOnRelease);
    }


    // handles
    showSubPage(id, intent, instanceOrigin) {
        return this.showArticle(id, intent, instanceOrigin);
    }

    openSubPage(id, intent, instanceOrigin) {
        return this.openArticle(id, intent, instanceOrigin);
    }

    bringSubPage(id, intent) {
        return this.bringArticle(id, intent, instanceOrigin);
    }

    closeSubPage(id, instanceOrigin, isTermination = false) {
        return this.closeArticle(id, instanceOrigin, isTermination);
    }

    showArticle(id, intent, instanceOrigin) {
        if (id != null && !this.isClosing) {
            const show = $target => {
                const onlyOne = this.$articles.filter(ntc("dummy")).length === 1;
                const $currentTop = this.$articles.filter(asv(eds.onTop, t1));
                //console.log("current top: ", $currentTop);
                const currentTopHandle = this.currentTop;
                const currentTopHandleId = currentTopHandle.id;
                if (id != currentTopHandleId && currentTopHandleId != this.latestSubPageId) {
                    this.prevSubPageId = currentTopHandleId;

                    // if (estreUi.euiState == "onReady" && currentTopHandle != null) estreUi.pushCurrentState(currentTopHandle);
                }
                if (this.isStepNavigation) {
                    $target[0]?.pageHandle?.pushIntent(intent);
                    const current = this.currentArticleStepIndex;
                    const target = this.getArticleStepIndex($target);
                    const isNext = onlyOne || target > current;
                    const currentOnTop1 = isNext ? "-1" : "+1";
                    const targetOnTop1 = isNext ? "+1" : "-1";
                    const targetOnTop2 = isNext ? "+" : "-";
                    if ($currentTop.length > 0) {
                        $currentTop.attr(eds.onTop, currentOnTop1);
                        setTimeout(async _ => {
                            for (var currentTop of $currentTop) if (currentTop.dataset.onTop == currentOnTop1) {
                                await currentTop.pageHandle?.blur();
                                await currentTop.pageHandle?.onHide();
                                //currentTop.dataset.onTop = "";
                            }
                            $currentTop.attr(eds.onTop, null);
                        }, cvt.t2ms($currentTop.css(a.trdr)));
                    }
                    $target.attr(eds.onTop, targetOnTop1);
                    setTimeout(_ => {
                        if ($target?.attr(eds.onTop) == targetOnTop1) {
                            $target?.[0].pageHandle?.onOpen();
                            $target?.[0].pageHandle?.onShow();
                            $target?.attr(eds.onTop, targetOnTop2);
                            setTimeout(_ => {
                                if ($target?.attr(eds.onTop) == targetOnTop2) {
                                    $target?.attr(eds.onTop, t1);
                                    $target?.[0].pageHandle?.focus();
                                    this.#updateStepNavigation();
                                }
                            }, cvt.t2ms($target?.css(a.trdr)) + cvt.t2ms($target?.css(a.trdl)));
                        }
                    }, 0);
                    const targetArticle = $target.pageHandle;
                    this.currentOnTop = targetArticle;

                    if (estreUi.euiState == "onReady" && targetArticle != null) estreUi.replaceCurrentState(targetArticle);
                    switch (this.sectionBound) {
                        case "menu":
                        case "main":
                            estreUi.showExactAppbar(this, this.container, targetArticle);
                            break;
                    }
                    return true;
                } else {
                    const targetArticle = $target[0]?.pageHandle;
                    for (var currentTop of $currentTop) {
                        const article = currentTop.pageHandle
                        if (article != null && (targetArticle == null || article != targetArticle)) {
                            article.hide();
                        }
                    }
                    targetArticle?.pushIntent(intent);
                    targetArticle?.show(false);
                    this.currentOnTop = targetArticle;


                    if (estreUi.euiState == "onReady" && targetArticle != null) estreUi.replaceCurrentState(targetArticle);
                    switch (this.sectionBound) {
                        case "menu":
                        case "main":
                            estreUi.showExactAppbar(this.component, this, targetArticle);
                            break;
                    }
                    return true;
                }
            };
            
            const $target = this.$article[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
            if ($target != null && $target.length > 0) return show($target);
            else if (instanceOrigin == n) {
                const articleIds = this.$article.ways.filter(it => it.startsWith(id + "^"));
                if (articleIds.length > 0) {
                    const articleId = articleIds[articleIds.length - 1];
                    const $target = this.$article[articleId];
                    if ($target != null && $target.length > 0) return show($target);
                }
            }
        }
        return false;
    }

    openArticle(id, intent, instanceOrigin) {
        if (this.isClosing) return false;
        const page = pageManager.getArticle(id, this.id, this.component.id, this.component.sectionBound);
        if (page == null) return null;
        if (page.statement == "static") return null;
        if (!page.isMultiInstance) {
            var $exist = this.$articles.filter(aiv(eds.articleId, id));
            if ($exist.length > 0) {
                this.closeArticle(id);
                var $exist = this.$articles.filter(aiv(eds.articleId, id));
                if ($exist.length > 0) {
                    if ($exist[0].pageHandle != null) $exist[0].pageHandle.release(true);
                    else $exist.remove();
                }
            }
        }
        const $articles = this.$articles;
        //this.$articles.filter(aiv(eds.onTop, t1)).attr(eds.onTop, "");
        if ($articles.length > 0) $($articles[$articles.length - 1]).after(page.live);
        else this.$host.append(page.live);
        const $article = this.$articles.filter(aiv(eds.articleId, id));
        if ($article == null || $article.length < 1) return null;
        const article = this.registerArticle($article[$article.length - 1], intent, instanceOrigin);
        //this.#updateStepNavigation();
        return article;
    }

    bringArticle(id, intent, instanceOrigin) {
        if (this.articles[id] == null) {
            if (this.openArticle(id, intent, instanceOrigin)) return this.showArticle(id);
            else return false;
        } else return this.showArticle(id, intent);
    }

    closeArticle(id, instanceOrigin, isTermination = false) {
        if (id != null) {
            const close = article => {
                const task = article.close(false, isTermination || !article.isStatic);
                if (!isTermination && !this.isClosing) postAsyncQueue(async _ => {
                    if (this.isClosing) return;
                    const target = this.subPages[id];
                    const subPageList = this.subPageList.filter(it => !it.isClosing && it != target);
                    if (subPageList.length > 0) {
                        const prev = this.prevSubPageId;
                        if (prev != null) this.showSubPage(prev);
                        else subPageList[subPageList.length - 1].show();
                    } else {
                        await task;
                        if (!this.isClosing && !this.isStatic && subPageList.length < 1) this.close(true, true);
                    };
                });
                return postAsyncQueue(async _ => {
                    const result = await task;
                    if (isTermination || !article.isStatic) this.unregisterArticle(article);
                    return result;
                });
            };

            const article = this.articles[id + (instanceOrigin?.let(it => "^" + it) ?? "")];
            if (article != null) return close(article);
            else if (instanceOrigin == n) {
                const articleIds = this.$article.ways.filter(it => it.startsWith(id + "^"));
                if (articleIds.length > 0) {
                    const articleId = articleIds[articleIds.length - 1];
                    const article = this.articles[articleId];
                    return close(article);
                }
            }
        }
        return null;
    }
    
    getArticleStepIndex($article) {
        if ($article.length > 0) {
            return parseInt($article.attr(eds.articleId).split("%")[1]);
        } else return -1;
    }
}


/**
 * Article page handle
 */
class EstreArticle extends EstrePageHandle {

    hostType = "article";

    get sectionBound() { return this.container.component.sectionBound; }

    container = null;

    get isFullyStatic() { return this.container.isFullyStatic && this.isStatic; }

    get isMain() { return this.id == "main"; }
    get isSub() { return this.id != "main"; }

    get isCanBack() { return this.container.isExistBackArticle; }


    handles = [];
    

    unifiedCalendars = [];

    scalables = [];
    collapsibles = [];
    toggleBlocks = [];
    toggleTabBlocks = [];
    tabBlocks = [];

    dateShowers = [];

    constructor(article, container, instanceOrigin) {
        super(article, instanceOrigin);
        this.container = container;
        this.id = this.$host.attr(eds.articleId);
    }


    release(remove) {
        this.releaseHandles();

        return super.release(remove);
    }

    init(page, intent) {
        super.init(page, intent);

        this.applyActiveStructAfterBind();
        return this;
    }

    pushIntent(intent, onInit = false) {
        if (super.pushIntent(intent, onInit)) {
            if (window.isDebug) console.log("on called data bind - " + this.pid);
            this.applyActiveStruct();
        }
    }

    registerHandle(specifier, handle) {
        if (this.handles[specifier] == null) this.handles[specifier] = [];
        this.handles[specifier].push(handle);
    }

    unregisterHandle(specifier, handle) {
        const index = this.handles[specifier]?.indexOf(handle);
        this.handles[specifier]?.splice(index, 1);
    }


    show(isRequest = true, setFocus = true) {
        if (isRequest) {
            return this.container.showArticle(this.id);
        } else return super.show(false, setFocus);
    }

    close(isRequest = true, isTermination = false) {
        if (isRequest) {
            return this.container.closeArticle(this.id, this.instanceOrigin, isTermination) ?? super.close(isTermination);
        } else return super.close(isTermination);
    }


    focus() {
        if (this.isShowing) {
            const $target = this.$host.find(ax(eds.focusOnBring));
            var bigger = 0;
            for (var item of $target) {
                const index = parseInt($(item).attr(eds.focusOnBring));
                if (index > bigger) bigger = index;
            }

            for (var i=0; i<=bigger; i++) {
                const $found = $target.filter(aiv(eds.focusOnBring, i));
                if ($found.length > 0) {
                    $($found[0]).focus();
                    break;
                }
            }

            super.focus();

            return true;
        } else return false;
    }


    getHost(hostType) {
        if (this.hostType == hostType) return this;
        else return this.container.getHost(hostType);
    }
}



// ======================================================================
// MODULE: Page Handler -- EstrePageHandler, EstreLottieAnimatedHandler,
//         Dialog page handlers (Alert, Confirm, Prompt, Option, etc.)
// ======================================================================
/**
 * Base class defining page lifecycle callbacks.
 * Subclass in your project to override onBring, onShow, onHide, onClose, etc.
 * @class
 */
class EstrePageHandler {

    /** @type {*} The provider that registered this handler (set by EstreUiCustomPageManager). */
    #provider = null;
    get provider() { return this.#provider; }

    /** @type {EstrePageHandle} The page handle instance this handler is bound to. */
    #handle = null;
    /** @type {EstrePageHandle} */
    get handle() { return this.#handle; }
    /** @type {EstreIntent|undefined} Current intent object. */
    get intent() { return this.handle.intent; }
    /** @type {string|undefined} The action field of the intent. */
    get intentAction() { return this.intent?.action; }
    /** @type {*} The data field of the intent. */
    get intentData() { return this.intent?.data; }

    /** Cover-bar entry label — see EstrePageHandle.coverTitle. */
    get coverTitle() { return this.handle?.coverTitle; }
    /** Cover-bar entry icon — see EstrePageHandle.coverIcon. */
    get coverIcon() { return this.handle?.coverIcon; }
    /** Cover-bar opt-in flag — see EstrePageHandle.coverMount. */
    get coverMount() { return this.handle?.coverMount ?? false; }
    /** Updates the cover-bar entry label for this handler's page. */
    setCoverTitle(value) { return this.handle?.setCoverTitle(value); }
    /** Updates the cover-bar entry icon for this handler's page. See EstrePageHandle.coverIcon for unset/empty/"none"/URL semantics. */
    setCoverIcon(value) { return this.handle?.setCoverIcon(value); }

    /**
     * @param {EstrePageHandle} handle - The page handle to bind.
     * @param {*} [provider] - The provider that registered this handler.
     */
    constructor (handle, provider) {
        this.#handle = handle;
        this.#provider = provider;
    }


    /**
     * Called when the page is first navigated (brought). Use for initial setup such as DOM reference caching.
     * @param {EstrePageHandle} handle - The page handle.
     */
    onBring(handle) {

    }

    /**
     * Called when the component/container/article is opened. Use for event binding, etc.
     * @param {EstrePageHandle} handle - The page handle.
     */
    onOpen(handle) {

    }

    /**
     * Called when the page is shown. Use for starting animations, refreshing data, etc.
     * @param {EstrePageHandle} handle - The page handle.
     */
    onShow(handle) {

    }

    /**
     * Called when the page receives focus.
     * @param {EstrePageHandle} handle - The page handle.
     */
    onFocus(handle) {

    }

    /**
     * Called on a reload request. Default behavior is to close and re-bring.
     * @param {EstrePageHandle} handle - The page handle.
     * @returns {Promise<boolean>|boolean} Whether the reload succeeded.
     */
    onReload(handle) {
        // Rebuild(close and bring) is default action
        if (!handle.isStatic) {
            const pid = EstreUiPage.from(handle).pid;
            const intent = handle.intent;
            return postAsyncQueue(async _ => {
                if (await handle.close()) {
                    return pageManager.bringPage(pid, intent);
                } else {
                    handle.show();
                    return false;
                }
            });
        } else return false;
    }

    /**
     * Called on a back request. Default behavior attempts to close based on hostType and sectionBound.
     * @param {EstrePageHandle} handle - The page handle.
     * @returns {Promise<boolean>} Whether the back action was handled.
     */
    async onBack(handle) {
        return handle.hostType != "component" ? (handle.isCanBack ? (handle.isStatic ? await handle.close() != null : await handle.close()) : false) : (
            handle.sectionBound == "blind" || !handle.isStatic ? await handle.close() : false);
    }

    /**
     * Called when the page is hidden.
     * @param {EstrePageHandle} handle - The page handle.
     * @param {boolean} fullyHide - Whether to fully hide the page.
     */
    async onHide(handle, fullyHide) {

    }

    /**
     * Called when the page is closed. Use for resource cleanup.
     * @param {EstrePageHandle} handle - The page handle.
     */
    async onClose(handle) {

    }

    /**
     * Called when the page is released. Final cleanup before DOM removal.
     * @param {EstrePageHandle} handle - The page handle.
     * @param {boolean|undefined} remove - true to remove from DOM, false to empty.
     */
    async onRelease(handle, remove) {

    }
}

class EstreLottieAnimatedHandler extends EstrePageHandler {
    $container;
    $article;
    $lottie;
    get lottie() { return this.$lottie?.[0]; }
    get player() { return this.lottie?.getLottie(); }

    async onBring(handle) {
        this.$container = handle.$host;
        this.$article = this.$container.find(ar + aiv(eds.articleId, "main"));
    }

    onOpen(handle) {
        this.$lottie = this.$article.find(dlp);
    }

    onShow(handle) {
        const player = this.player;
        if (player != n) player.play();
        else this.lottie?.addEventListener("ready", e => { e.target.play(); })
    }

    onHide(handle) {
        this.player?.pause();
    }

    onClose(handle) {
        this.player?.stop();
        this.player?.destroy();
    }
}

class EstreDialogPageHandler extends EstrePageHandler {
    $container;
    $article;
    $dialog;
    $handle
    $title;
    $backer;
    $closer;
    $content;
    $message;
    $options;
    $actions;

    handleSwipeHandler;

    onBring(handle) {
        this.$container = handle.$host;
        this.$article = this.$container.find(ar + aiv(eds.articleId, "main"));
        this.$dialog = this.$article.find(div + cls + "dialog");
        this.$handle = this.$dialog.find(div + cls + "handle");
        this.$title = this.$dialog.find(div + cls + "title");
        this.$backer = this.$title.find(btn + cls + "back");
        this.$closer = this.$title.find(btn + cls + "close");
        this.$message = this.$dialog.find(div + cls + "message");
        this.$options = this.$dialog.find(div + cls + "options");
        this.$content = this.$dialog.find(div + cls + "content");
        if (this.$message.length < 1) this.$message = this.$content.find(div + cls + "message");
        if (this.$options.length < 1) this.$options = this.$content.find(div + cls + "options");
        this.$actions = this.$dialog.find(div + cls + "actions");

        if (handle.intent?.data?.backButton === true) this.$dialog.attr("data-back", t1);
        if (handle.intent?.data?.closeButton === true) this.$dialog.attr("data-close", t1);
    }

    onOpen(handle) {
        this.$container.click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            handle?.close();
            
            return false;
        });
        this.$dialog.click(function (e) {
            // e.preventDefault();
            e.stopPropagation();
            
            // return false;
        });
        this.$dialog.keydown(function (e) {
            if (e.keyCode == 27) {
                e.preventDefault();
                handle.close();
                return false;
            }
        });
        this.$backer.click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            handle.close();

            return false;
        });
        this.$closer.click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            handle.close();

            return false;
        });
        if (this.$handle.length > 0) this.handleSwipeHandler = new EstreSwipeHandler(this.$handle).setStopPropagation().setPreventDefault().setPreventAll().unuseX().setThresholdY(1).setDropStrayed(false).setResponseBound(this.$dialog).setOnUp(function (grabX, grabY, handled, canceled, directed) {
            const handledDirection = this.handledDirection;
            if (handled && handledDirection == "down" && Math.abs(grabY) > 80) handle.close();
        });
        this.$actions.find(inp + cor + btn).on("keydown", function (e) {
            if (e.keyCode == 27) {
                e.preventDefault();

                handle?.close();

                return false;
            }
        });

        
        const data = this.intentData;
        if (data?.containerBlindColor != n) this.$container.css("background-color", data.containerBlindColor);
        if (data?.articleBlindColor != n) this.$article.css("background-color", data.articleBlindColor);
        if (data?.bgColor != n) this.$dialog.css("background-color", data.bgColor);
    }

    onIntentUpdated(handle, intent) {
        const data = intent?.data;
        if (data?.containerBlindColor != n) this.$container.css("background-color", data.containerBlindColor);
        if (data?.articleBlindColor != n) this.$article.css("background-color", data.articleBlindColor);
        if (data?.bgColor != n) this.$dialog.css("background-color", data.bgColor);
    }

    async onBack(handle) {
        return await handle.close();
    }

    onClose(handle) {
        if (handle?.intent?.onDissmiss != null) handle.intent.onDissmiss();
    }
}

class EstreAlertDialogPageHandler extends EstreDialogPageHandler {
    $confirm;

    onBring(handle) {
        super.onBring(handle);

        this.$confirm = this.$actions.find(btn + cls + "confirm");
    }

    onOpen(handle) {
        super.onOpen(handle);

        this.$confirm.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            handle?.intent?.onOk?.();
            handle?.close();
            return false;
        });

        this.$confirm.focus();
    }

    onFocus(handle) {
        this.$confirm.focus();
        return true;
    }
}

class EstreConfirmDialogPageHandler extends EstreDialogPageHandler {
    $positive;
    $negative;
    $neutral;

    onBring(handle) {
        super.onBring(handle);

        this.$positive = this.$actions.find(btn + cls + "positive");
        this.$negative = this.$actions.find(btn + cls + "negative");
        this.$neutral = this.$actions.find(btn + cls + "neutral");
    }

    onOpen(handle) {
        super.onOpen(handle);

        this.$positive.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            handle?.intent?.onPositive?.();
            handle?.close();
            return false;
        });
        this.$negative.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            handle?.intent?.onNegative?.();
            handle?.close();
            return false;
        });
        if (handle?.intent?.data?.callbackNeutral == null) this.$neutral.remove();
        else this.$neutral.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            handle?.intent?.onNeutral?.();
            handle?.close();
            return false;
        });

        this.$negative.focus();
    }

    onFocus(handle) {
        this.$negative.focus();
        return true;
    }
}

class EstrePromptDialogPageHandler extends EstreDialogPageHandler {
    $input;
    $confirm;

    onBring(handle) {
        super.onBring(handle);

        this.$input = this.$actions.find(inp);
        this.$confirm = this.$actions.find(btn + cls + "confirm");
    }

    onOpen(handle) {
        super.onOpen(handle);

        this.$input.on("keydown", function (e) {
            if (e.keyCode == 13) {
                e.preventDefault();

                handle?.handler?.$confirm?.click();

                return false;
            }
        });
        this.$input.on("focus", function (e) {
            handle?.intent?.onPromptFocus?.(this, this.value, e);
        });
        this.$input.on("input paste cut", function (e) {
            handle?.intent?.onPromptInput?.(this, this.value, e);
        });
        this.$input.on("paste", function (e) {
            try {
                const pasteText = e.originalEvent.clipboardData.getData('text/plain');
                handle?.intent?.onPromptPaste?.(this, pasteText, this.value, e);
            } catch (err) {
                console.error(err);
            }
        });
        this.$input.on("change", function (e) {
            handle?.intent?.onPromptChange?.(this, this.value, e);
        });
        this.$input.on("blur", function (e) {
            handle?.intent?.onPromptBlur?.(this, this.value, e);
        });
        this.$confirm.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            handle?.intent?.onConfirm?.(handle?.handler?.$input?.val());
            handle?.close();
            return false;
        });

        this.$input.focus();
    }

    onFocus(handle) {
        this.$input.focus();
        return true;
    }
}

class EstreOptionDialogPageHandler extends EstreDialogPageHandler {
    $optionItems;

    onBring(handle) {
        super.onBring(handle);
    }

    onOpen(handle) {
        super.onOpen(handle);

        this.$optionItems = this.$options.find(c.c + btn);
        this.$optionItems.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            const index = this.dataset.index;
            const value = handle?.intent?.data?.options?.[index];
            handle?.intent?.onSelected?.(index, value);
            handle?.close();
            return false;
        });

        this.$optionItems[0]?.focus();
    }

    onFocus(handle) {
        this.$optionItems[0]?.focus();
        return true;
    }
}

class EstreSelectionDialogPageHandler extends EstreDialogPageHandler {
    $optionItems;
    $optionCheckboxes;

    $confirm;
    $another;

    get $selected() {
        return this.$optionCheckboxes.filter(ckd);
    }
    get $unselected() {
        return this.$optionCheckboxes.filter(ncd);
    }
    get $disabled() {
        return this.$optionCheckboxes.filter(dad);
    }

    get selected() {
        const options = this.intentData?.options;
        const selected = {};
        if (options != null) for (const checkbox of this.$selected) {
            const $checkbox = $(checkbox);
            const index = $checkbox.attr(eds.index);
            if (index != null) selected[index] = options[index];
        }
        return selected;
    }

    onBring(handle) {
        super.onBring(handle);

        this.$confirm = this.$actions.find(btn + cls + "confirm");
        this.$another = this.$actions.find(btn + cls + "another");
    }

    onOpen(handle) {
        super.onOpen(handle);

        const defaultSelected = this.intentData?.defaultSelected;
        if (isNotNully(defaultSelected)) forkv(defaultSelected, (k, v) => {
            switch(to(v)) {
                case BOOLEAN:
                    this.$optionCheckboxes.filter(aiv(eds.index, k)).prop(m.v, v);
                    break;
                
                case NUMBER:
                    this.$optionCheckboxes.filter(aiv(eds.index, v)).prop(m.v, true);
                    break;
            }
        });

        const handler = this;

        this.$optionItems = this.$options.find(c.c + btn);
        this.$optionItems.click(function (e) {
            e.preventDefault();
            e.stopPropagation();

            $(this).find(itc(_v)).let(it => {
                if (!it.prop(m.d)) it.prop(m.v, !it.prop(m.v)).change();
            });

            return false;
        });

        this.$optionCheckboxes = this.$optionItems.find(itc(_v));
        this.$optionCheckboxes.change(function (e) {
            const index = this.dataset.index;
            const value = handle?.intent?.data?.options?.[index] ?? this.value;
            const checked = this.checked;
            const fineChecked = handler.checkValidSelectAction(handle, handler, index, value, checked);
            if (fineChecked) {
                if (checked) handle?.intent?.onSelect?.(index, value);
            } else this.checked = !checked;
        });

        this.$confirm.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            handle?.intent?.onConfirm?.(handler.selected);
            handle?.close();
            return false;
        });
        if (handle?.intent?.data?.callbackAnother == null) this.$another.remove();
        else this.$another.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            handle?.intent?.onAnother?.(handler.selected);
            handle?.close();
            return false;
        });

        const min = this.intentData?.minSelection ?? 0;
        if (min > 0 && this.$selected.length < min) this.$confirm.prop(m.d, true);

        this.$confirm.focus();
    }

    onFocus(handle) {
        this.$confirm.focus();
        return true;
    }

    checkValidSelectAction(handle, handler, index, value, checked) {
        const intentData = handler.intentData;
        const min = intentData?.minSelection ?? 0;
        const max = intentData?.maxSelection ?? -1;
        const $selected = this.$selected;
        const length = $selected.length;

        if (max > -1) {
            if (length >= max) this.$unselected.prop(m.d, true);
            else this.$disabled.prop(m.d, false);
        }
        this.$confirm.prop(m.d, length < min);

        return checked ? max < 0 || length <= max : true;
    }
}

class EstreDialsDialogPageHandler extends EstreDialogPageHandler {
    $dial;
    dialHandle;

    $confirm;
    $another;

    onBring(handle) {
        super.onBring(handle);

        this.$dial = handle.$host.find(uis.multiDialSlot);

        this.$confirm = this.$actions.find(btn + cls + "confirm");
        this.$another = this.$actions.find(btn + cls + "another");
    }

    onOpen(handle) {
        super.onOpen(handle);

        this.intent.handle = this.dialHandle = this.$dial[0].handle;

        handle.intent?.onSelect?.let(it => this.dialHandle.setOnSelected(it));

        handle.intent?.data?.let(it => {
            this.$dial.css("--font-size", it.fontSize ?? "2rem");
            if (it.fontWeight != n) this.$dial.css("--font-weight", it.fontWeight);
            this.$dial.css("--item-height", it.itemHeight ?? "1.2em");
            this.$dial.css("--holder-pad", it.holderPad ?? "var(--basic-ui-inset-h)");
            if (it.holderPadL != n) this.$dial.css("--holder-pad-l", it.holderPadL);
            if (it.holderPadR != n) this.$dial.css("--holder-pad-r", it.holderPadR);
            if (it.colGap != n) this.$dial.css("--col-gap", it.colGap);
            if (it.boundGap != n) this.$dial.css("--bound-gap", it.boundGap);
        });

        const handler = this;

        this.$confirm.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            const { itemSelectionIndexes, itemSelectionValues } = handler.dialHandle;
            handle?.intent?.onConfirm?.(itemSelectionIndexes.mock, itemSelectionValues.mock, handle.intent?.data?.initial);
            handle?.close();
            return false;
        });
        if (handle?.intent?.data?.callbackAnother == null) this.$another.remove();
        else this.$another.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            const { itemSelectionIndexes, itemSelectionValues } = handler.dialHandle;
            handle?.intent?.onAnother?.(itemSelectionIndexes.mock, itemSelectionValues.mock, handle.intent?.data?.initial);
            handle?.close();
            return false;
        });

        this.$confirm.focus();
    }

    onFocus(handle) {
        this.$confirm.focus();
        return true;
    }

    onClose(handle) {
        const { itemSelectionIndexes, itemSelectionValues } = this.dialHandle;
        handle?.intent?.onDissmiss(handle.intent?.data?.initial, itemSelectionIndexes.mock, itemSelectionValues.mock);
    }
}


// ======================================================================
// MODULE: Page Model -- EstreUiPage (PID parsing, page data model)
// ======================================================================

/**
 * Pages profiling manager
 */
/**
 * EstreUI page model. Identified by a PID (Page IDentifier) string, encapsulating the
 * component/container/article hierarchy, sectionBound (main/blind/menu/overlay/header),
 * statement (static/instant), and multi-instance status.
 *
 * PID format: `$<statement>&<sectionBound>=<component>[^][#<container>[^][@<article>[^][%<step>]]]`
 * - `$s` = static, `$i` = instant
 * - `&m` = main, `&b` = blind, `&o` = overlay, `&h` = header, `&u` = menu
 * - `^` = multi-instance
 * @class
 */
class EstreUiPage {

    /** @type {Object<string, typeof EstrePageHandler>} PID → page handler class mapping (built-in handlers). */
    static #pageHandlers = {
        "$s&h=appbar": class extends EstrePageHandler {
            $appTitleBtn;
            $mainMenuBtn;
            $backNavigation;
            $containerCloser;

            $pageTitleHolder;
            $pageTitle;

            onBring(handle) {
                this.$appTitleBtn = handle.$host.find("#appTitleBtn");
                this.$mainMenuBtn = handle.$host.find("#mainMenuBtn");
                this.$backNavigation = handle.$host.find(".back_navigation");
                this.$containerCloser = handle.$host.find(".container_closer");

                this.$pageTitleHolder = handle.$host.find(".page_title_holder");
                this.$pageTitle = this.$pageTitleHolder.find("#pageTitle");
            }

            onOpen(handle) {
                this.$backNavigation.click(function (e) {
                    e.preventDefault();

                    estreUi.back();
                    // history.back();

                    return false;
                });
                this.$containerCloser.click(function (e) {
                    e.preventDefault();

                    estreUi.closeContainer();

                    return false;
                });
            }

            setPageTitle(title) {
                this.$pageTitle.html(title);
            }

            setAppbarLeftToolSet(frostOrCold, matchReplacer, dataName = "frozen") {
                const exactContainer = this.handle.currentOnTop;
                const $exactArticle = exactContainer?.$article?.["left"];
                const $exactToolSet = $exactArticle?.find(nv + cls + "tool_set");
                if ($exactToolSet != null) {
                    const nodes = [];
                    if (isNotNully(frostOrCold)) {
                        for (const toolset of $exactToolSet) toolset.alone(frostOrCold, matchReplacer)?.let(it => nodes.push(...it));
                    } else {
                        for (const toolset of $exactToolSet) toolset.melt(matchReplacer, dataName)?.let(it => nodes.push(...it));
                    }
                    this.handle.applyActiveStructAfterBind($exactToolSet);
                    return nodes;
                } return null;
            }

            setAppbarRightToolSet(frostOrCold, matchReplacer, dataName = "frozen") {
                const exactContainer = this.handle.currentOnTop;
                const $exactArticle = exactContainer?.$article?.["right"];
                const $exactToolSet = $exactArticle?.find(nv + cls + "tool_set");
                if ($exactToolSet != null) {
                    const nodes = [];
                    if (isNotNully(frostOrCold)) {
                        for (const toolset of $exactToolSet) toolset.alone(frostOrCold, matchReplacer)?.let(it => nodes.push(...it));
                    } else {
                        for (const toolset of $exactToolSet) toolset.melt(matchReplacer, dataName)?.let(it => nodes.push(...it));
                    }
                    this.handle.applyActiveStructAfterBind($exactToolSet);
                    return nodes;
                } return null;
            }
        },


        "$i&o=functional#popupBrowser^": class extends EstrePageHandler {
            id = "popupBrowser";

            $browserArea
            iframe;
            get cw() { return this.iframe.contentWindow; }
            get history() {
                try {
                    return this.cw?.history;
                } catch (ex) {
                    if (window.isLogging) console.error(ex);
                    return null;
                }
            }
            get location() {
                try {
                    return this.cw?.location;
                } catch (ex) {
                    if (window.isLogging) console.error(ex);
                    return null;
                }
            }
            get url() { return this.loction?.href; }

            $iframe;
            
            $back;
            $forward;
            $home;
            $title;
            $refresh;
            $close;

            onBring(handle) {
                const handler = this;

                this.$browserArea = handle.$host.find(".browser_area");
                this.iframe = doc.ce("iframe", "webView");
                this.iframe.setAttribute("name", this.intentData.name ?? "webview");
                if (this.intentData.src != null) this.iframe.setAttribute("src", this.intentData.src);
                this.$iframe = $(this.iframe);

                this.$back = handle.$host.find("button.back");
                this.$forward = handle.$host.find("button.forward");
                this.$home = handle.$host.find("button.home");
                this.$title = handle.$host.find("span.pageTitle");
                this.$refresh = handle.$host.find("button.refresh");
                this.$close = handle.$host.find("button.close");

                // if (this.intentData.name != null) this.$iframe.prop("name", this.intentData.name);

                this.$iframe.on("load", function (e) {
                    let url = null;
                    try {
                        url = this.contentWindow.location.href;
                    } catch (ex) {
                        if (window.isLogging) console.error(ex);
                    }
                    let title = "";
                    try {
                        title = this.contentWindow.document.title;
                    } catch (ex) {
                        if (window.isLogging) console.error(ex);
                    }

                    if (handler.intentData.fixedTitle == null) handler.$title.text(title);

                    handle.intent.onLoad(handle, this, url);
                });

                if (this.intentData.hideBack) this.$back.hide();
                if (this.intentData.hideForward) this.$forward.hide();
                if (this.intentData.hideHome || this.intentData.src == null) this.$home.hide();
                if (this.intentData.hideRefresh) this.$refresh.hide();
            }

            onOpen(handle) {
                const handler = this;

                if (this.intentData.fixedTitle != null) this.$title.text(this.intentData.fixedTitle);

                this.$back.click(function (e) {
                    if (!handler.intent.onClickBack?.(handle, handler.iframe, handler.url)) handler.history?.back();
                });
                this.$forward.click(function (e) {
                    if (!handler.intent.onClickForward?.(handle, handler.iframe, handler.url)) handler.history?.forward();
                });
                this.$home.click(function (e) {
                    handler.iframe.src = handler.intentData.src;
                });
                this.$refresh.click(function (e) {
                    if (!handler.intent.onClickRefresh?.(handle, handler.iframe, handler.url)) handler.history?.reload();
                });
                this.$close.click(function (e) {
                    handle.close();
                });

                this.intent.onBeforeAttach(handle, this.iframe);
                this.$browserArea.append(this.$iframe);
                this.intent.onAfterAttach(handle, this.iframe, this.url);
            }

            onReload(handle) {
                if (this.intentData.hideRefresh || this.intent.onClickRefresh(handle, this.iframe, this.url)) this.history?.reload();

                return true;
            }

            async onBack(handle) {
                return await handle.close();
            }

            onClose(handle) {
                this.intent.onClosePopup?.(handle, this.iframe, this.url);
            }
        },

        "$i&o=toastUpSlide#alert^": class extends EstreAlertDialogPageHandler {

        },
        "$i&o=toastUpSlide#confirm^": class extends EstreConfirmDialogPageHandler {

        },
        "$i&o=toastUpSlide#prompt^": class extends EstrePromptDialogPageHandler {

        },
        "$i&o=toastUpSlide#option^": class extends EstreOptionDialogPageHandler {

        },
        "$i&o=toastUpSlide#selection^": class extends EstreSelectionDialogPageHandler {

        },
        "$i&o=toastUpSlide#dials^": class extends EstreDialsDialogPageHandler {

        },

        "$i&o=interaction#onRunning^": class extends EstreLottieAnimatedHandler {
            isTriggeredCancellation = f;

            onBack(handle) {
                const cancellationExceeds = this.intentData?.cancellationExceeds ?? 3;
                if (this.isTriggeredCancellation || this.intentData?.blockBack) {
                    return true;
                } else if (backHolds < cancellationExceeds - 1) {
                    return onBackWhile(handle);
                } else if (backHolds == cancellationExceeds - 1) {
                    // const instanceOrigin = latestIO;
                    backHolds = 0;
                    this.isTriggeredCancellation = t;
                    this.intentData?.callbackCancellation?.();
                    // postQueue(_ => go(instanceOrigin));
                    return handle.close();
                }
            }
        },
        "$i&o=interaction#onProgress^": class extends EstreLottieAnimatedHandler {
            get perfectValue()      { return 1000; }    // 100% value
            get zeroPosition()      { return 15; }      // 0% frame
            get halfPosition()      { return 75; }      // 50% frame
            get perfectPosition()   { return 105; }     // 100% frame
            get finishPosition()    { return 251; }     // complete frame

            get halfValue()         { return this.perfectValue / 2; }   // 50% value
            get interFrames()       { return this.perfectPosition - this.zeroPosition; } // progress frames
            get preFrames()         { return this.halfPosition - this.zeroPosition; }    // second half frames
            get postFrames()        { return this.perfectPosition - this.halfPosition; } // second half frames

            isRunning = false;

            onBring(handle) {
                super.onBring(handle);

                const intentData = handle.intent.data;
                intentData.binded = new class {
                    instanceOrigin = intentData.instanceOrigin;
                    #current = intentData.current ?? 0;

                    get current() { return this.#current; }
                    set current(value) {
                        handle.handler.applyProgress(value, this.#current);
                        this.#current = value;
                    }
                }
            }

            onOpen(handle) {
                this.lottie?.addEventListener("ready", function (e) {
                    const player = this.getLottie();
                    if (player != null) {
                        player.setSegment(0, handle.handler.zeroPosition);
                        player.addEventListener("complete", function (e) {
                            handle.handler.isRunning = false;
                            if (window.isVerbosely) console.log("onComplete: ", player.firstFrame + player.currentFrame);
                            if (handle.intent.data.binded?.current == null) {
                                handle.close();
                            }
                        });
                        player.goToAndPlay(0, true);
                        handle.handler.isRunning = true;
                    }
                });
            }

            onShow(handle) {
                if (this.isRunning) this.player?.play();
            }

            onHide(handle) {
                if (this.isRunning) this.player?.pause();
            }

            applyProgress(value, current) {
                const val = parseInt(value);
                const player = this.player;

                if (player != null) {
                    player.pause();
                    if (window.isVerbosely) console.log(value, current, player.firstFrame, player.currentFrame, player.firstFrame + player.currentFrame);

                    const begin = player.firstFrame + player.currentFrame;//this.zeroPosition + parseInt(this.interFrames * (parseInt(current) / this.perfectValue));
                    const end = value != null ?
                        this.zeroPosition + (val < this.halfValue ?
                            parseInt(this.preFrames * (val / this.halfValue)) :
                            this.preFrames + parseInt(this.postFrames * ((val - this.halfValue) / this.halfValue))
                        ) : this.finishPosition;

                    const isForward = end >= begin;

                    if (window.isVerbosely) console.log("begin: " + begin + ", end: " + end + ", isForward: " + isForward);

                    if (isForward) player.setSegment(begin, end);
                    else player.setSegment(end, begin);
                    player.setDirection(isForward ? 1 : -1);
                    player.goToAndPlay(isForward ? 0 : player.totalFrames, true);
                    this.isRunning = true;
                }
            }
        },

        "$i&o=interaction#alert^": class extends EstreAlertDialogPageHandler {

        },
        "$i&o=interaction#confirm^": class extends EstreConfirmDialogPageHandler {

        },
        "$i&o=interaction#prompt^": class extends EstrePromptDialogPageHandler {

        },
        "$i&o=interaction#option^": class extends EstreOptionDialogPageHandler {

        },
        "$i&o=interaction#selection^": class extends EstreSelectionDialogPageHandler {

        },

        "$i&o=notification#noti@noti^": class extends EstrePageHandler {
            $postBlock;
            $mainIconPlace;
            $subIconPlace;
            $titleLine;
            $subtitleLine;
            $contentLine;
            swipeHandler;
            #closeTimer;
            #closing = false;

            #applyIntentToBlock(intent) {
                const data = intent?.data ?? {};
                this.$mainIconPlace.toggle(data.largeIconSrc != null && data.largeIconSrc !== "");
                this.$subIconPlace.toggle(data.iconSrc != null && data.iconSrc !== "");
                this.$titleLine.toggle(data.contentTitle != null && data.contentTitle !== "");
                this.$subtitleLine.toggle(data.subtitle != null && data.subtitle !== "");
                this.$contentLine.toggle(data.content != null && data.content !== "");
            }

            #resetCloseTimer(handle) {
                if (this.#closeTimer != null) {
                    clearTimeout(this.#closeTimer);
                    this.#closeTimer = null;
                }
                const showTime = handle.intent?.data?.showTime ?? EstreNotificationManager.defaultShowTime;
                this.#closeTimer = setTimeout(_ => this.#beginClose(handle), showTime);
            }

            #beginClose(handle) {
                if (this.#closing) return;
                this.#closing = true;
                if (this.#closeTimer != null) {
                    clearTimeout(this.#closeTimer);
                    this.#closeTimer = null;
                }

                if (!EstreNotificationManager.hasQueued) {
                    handle.close();
                    return;
                }

                const $block = this.$postBlock;
                const blockEl = $block[0];
                if (blockEl == null) { handle.close(); return; }
                const $article = $block.parent();
                const articleEl = $article[0];
                const rect = blockEl.getBoundingClientRect();
                const articleRect = articleEl.getBoundingClientRect();
                const $ghost = $block.clone(false).removeClass("banner_incoming");
                $ghost.addClass("banner_ghost_exit");
                $ghost.css({
                    position: "absolute",
                    left: (rect.left - articleRect.left) + "px",
                    top: (rect.top - articleRect.top) + "px",
                    width: rect.width + "px",
                    margin: 0,
                    pointerEvents: "none",
                });
                $article.append($ghost);
                setTimeout(() => $ghost.remove(), 550);

                $block.css({ visibility: "hidden", pointerEvents: "none" });

                EstreNotificationManager.beginCheckOut(handle.intent);
            }

            onBring(handle) {
                const $host = handle.$host;
                this.$postBlock = $host.find(".post_block");
                this.$mainIconPlace = this.$postBlock.children(".icon_place");
                this.$titleLine = this.$postBlock.find("> .content_place > .title_line");
                this.$subtitleLine = this.$postBlock.find("> .content_place > .subtitle_line");
                this.$contentLine = this.$postBlock.find("> .content_place > .content_area > .content_place");
                this.$subIconPlace = this.$postBlock.find("> .content_place > .content_area > .icon_place");

                this.#applyIntentToBlock(handle.intent);

                EstreNotificationManager.current = handle.intent;
                if (window.isVerbosely) console.log("pushed", handle.intent);
            }

            onOpen(handle) {
                this.#closing = false;
                this.$postBlock.click((e) => {
                    e.preventDefault();

                    if (window.isVerbosely) console.log("clicked: ", handle.intent);
                    handle.intent?.onTakeInteraction?.(handle.intent);
                    this.#beginClose(handle);

                    return false;
                });

                const self = this;
                this.swipeHandler = new EstreSwipeHandler(this.$postBlock)
                    .setStopPropagation()
                    .setPreventDefault()
                    .unuseX()
                    .setThresholdY(1)
                    .setDropStrayed(false)
                    .setResponseBound(this.$postBlock)
                    .setOnUp(function (grabX, grabY, handled, canceled, directed) {
                        if (!handled) return;
                        if (this.handledDirection === "up" && Math.abs(grabY) > 20) {
                            self.#beginClose(handle);
                        } else if (this.handledDirection === "down" && Math.abs(grabY) > 40) {
                            handle.intent?.onTakeInteraction?.(handle.intent);
                            self.#beginClose(handle);
                        }
                    });

                this.#resetCloseTimer(handle);
                if (window.isVerbosely) console.log("showing: ", handle.intent);
            }

            onIntentUpdated(handle, intent) {
                // Queue-chain handover: previous banner's exit is playing on a
                // detached ghost clone; this article reuses the same DOM with
                // fresh content + a restart-triggered enter animation.
                this.#closing = false;
                if (intent?.data != null) this.#applyIntentToBlock(intent);
                EstreNotificationManager.current = handle.intent;

                const $block = this.$postBlock;
                $block.css({ visibility: "", pointerEvents: "" });
                $block.removeClass("banner_incoming");
                void $block[0]?.offsetWidth;
                $block.addClass("banner_incoming");

                this.#resetCloseTimer(handle);
            }

            onClose(handle) {
                if (this.#closeTimer != null) {
                    clearTimeout(this.#closeTimer);
                    this.#closeTimer = null;
                }
                EstreNotificationManager.checkOut(handle.intent);
            }
        },
        "$i&o=notification#note@note^": class extends EstrePageHandler {
            $postBlock;

            onBring(handle) {
                this.$postBlock = handle.$host.find(".post_block");
                EstreNotationManager.current = handle.intent;
                if (window.isVerbosely) console.log("pushed", handle.intent);
            }

            onOpen(handle) {
                this.$postBlock.click(function (e) {
                    e.preventDefault();

                    if (window.isVerbosely) console.log("clicked: ", handle.intent);
                    handle.intent?.onTakeInteraction?.(handle.intent);

                    return false;
                });

                if (window.isVerbosely) console.log("showing: ", handle.intent);
                setTimeout(_ => handle.close(), handle.intent?.data?.showTime ?? 3000);
            }

            onClose(handle) {
                EstreNotationManager.checkOut(handle.intent);
            }
        },
        
        "$s&o=operation#root@timeline": class extends EstrePageHandler { },
        "$s&o=operation#root@quickPanel": class extends EstrePageHandler { },

    };
    /** @type {Object<string, typeof EstrePageHandler>} Custom-registered page handlers (merged into #pageHandlers on commit). */
    static #registeredPageHandlers = {};

    /** @type {*} Custom page provider (registered by EstreUiCustomPageManager). */
    static #customPagesProvider = null;
    static get provider() { return this.#customPagesProvider; }

    /** @type {boolean} true after commit() has been called. */
    static #handlerCommited = false;
    static get handlerCommited() { return this.#handlerCommited; }

    /**
     * Registers a custom page provider. Can only be called once, before commit.
     * @param {*} provider - The provider object.
     */
    static registerProvider(provider) {
        if (!this.#handlerCommited && this.#customPagesProvider == null) {
            this.#customPagesProvider = provider;
        }
    }

    /**
     * Registers a page handler for a PID. Can only be called before commit.
     * @param {string} pid - Target PID.
     * @param {typeof EstrePageHandler} handler - Page handler class.
     */
    static registerHandler(pid, handler) {
        if (!this.#handlerCommited && this.#registeredPageHandlers[pid] == null) {
            this.#registeredPageHandlers[pid] = handler;
        }
    }

    /** Commits handler registration. Subsequent registerHandler() calls are ignored. */
    static commit() {
        this.#handlerCommited = true;

        for (const pid in this.#registeredPageHandlers) this.#pageHandlers[pid] = this.#registeredPageHandlers[pid];
    }


    /**
     * Strips the statement prefix (`$s`, `$i`) from a PID.
     * @param {string} pid
     * @returns {string}
     */
    static getPidStatementless(pid) {
        return pid.replace(/^\$\w/, "");
    }

    /**
     * Strips the instance origin (everything after `^`) from a PID.
     * @param {string} pid
     * @returns {string}
     */
    static getPidOriginless(pid) {
        return pid.split("^")[0];
    }

    /**
     * Strips both the statement prefix and instance origin from a PID.
     * @param {string} pid
     * @returns {string}
     */
    static getPidSeamless(pid) {
        return this.getPidOriginless(this.getPidStatementless(pid));
    }

    /**
     * Searches for a handler class matching the PID. Falls back: full PID → statementless → originless → seamless.
     * @param {string} pid
     * @returns {typeof EstrePageHandler|undefined}
     */
    static foundHandler(pid) {
        let handler = this.#pageHandlers[pid];
        if (handler != null) return handler;
        const slpid = this.getPidStatementless(pid)
        handler = this.#pageHandlers[slpid];
        if (handler != null) return handler;
        const olpid = this.getPidOriginless(pid);
        handler = this.#pageHandlers[olpid];
        if (handler != null) return handler;
        const spid = this.getPidOriginless(slpid);
        handler = this.#pageHandlers[spid];
        return handler;
    }

    /**
     * Returns the handler class matching the PID.
     * @param {string} pid
     * @returns {typeof EstrePageHandler|undefined}
     */
    static getHandler(pid) {
        return this.foundHandler(pid);
    }


    /** @type {Element|null} The original (raw) DOM element. */
    #raw = null;
    get raw() { return this.#raw; }
    /** @type {*} Doctre cold format data. */
    #cold = null;
    get cold() { return this.#cold; }
    /** @type {Element|undefined} The cold data restored to a live DOM element. */
    get live() { return this.cold?.let(it => Doctre.live(it)); }

    #componentStatement = null;//static/instant
    #containerStatement = null;//static/instant
    #articleStatement = null;//static/instant

    get componentStatement() { return this.#componentStatement; }
    get containerStatement() { return this.#containerStatement; }
    get articleStatement() { return this.#articleStatement; }

    get componentIsInatant() { return this.componentStatement == "instant"; }
    get componentIsStatic() { return this.componentStatement == "static"; }
    get containerIsInatant() { return this.containerStatement == "instant"; }
    get containerIsStatic() { return this.containerStatement == "static"; }
    get articleIsInatant() { return this.articleStatement == "instant"; }
    get articleIsStatic() { return this.articleStatement == "static"; }

    get statement() {
        if (this.#articleStatement != null) return this.#articleStatement;
        else if (this.#containerStatement != null) return this.#containerStatement;
        else if (this.#componentStatement != null) return this.#componentStatement;
        else return null;
    }
    get isInstant() { return this.statement == "instant"; }
    get isStatic() { return this.statement == "static"; }
    get isFullyStatic() {
        switch (this.hostType) {
            case "article":
                if (this.articleStatement == null) return null;
                else if (this.articleStatement != "static") return false;
            case "container":
                if (this.containerStatement == null) return null;
                else if (this.containerStatement != "static") return false;
            case "component":
                if (this.componentStatement == null) return null;
                else if (this.componentStatement != "static") return false;
                return true;

            default:
                return null;
        }
    }

    #componentIsMultiInstance = null;
    #containerIsMultiInstance = null;
    #articleIsMultiInstance = null;

    get componentIsMultiInstance() { return this.#componentIsMultiInstance; }
    get containerIsMultiInstance() { return this.#containerIsMultiInstance; }
    get articleIsMultiInstance() { return this.#articleIsMultiInstance; }

    get isMultiInstance() {
        if (this.#articleIsMultiInstance != null) return this.#articleIsMultiInstance;
        else if (this.#containerIsMultiInstance != null) return this.#containerIsMultiInstance;
        else if (this.#componentIsMultiInstance != null) return this.#componentIsMultiInstance;
        else return null;
    }

    #sectionBound = null;//main/blind/menu/overlay
    get sectionBound() { return this.#sectionBound; }
    get isOverlay() { return this.sectionBound == "overlay"; }
    get isBlinded() { return this.sectionBound == "blind"; }
    get isMain() { return this.sectionBound == "main"; }
    get isMenu() { return this.sectionBound == "menu"; }
    get isHeader() { return this.sectionBound == "header"; }

    get sections() {
        switch (this.sectionBound) {
            case "overlay":
                return estreUi.overlaySections;

            case "blind":
                return estreUi.blindSections;

            case "main":
                return estreUi.mainSections;

            case "menu":
                return estreUi.menuSections;

            case "header":
                return estreUi.headerSections;
        }
    }

    #component = null;
    #container = null;
    #article = null;

    get component() { return this.#component; }
    get container() { return this.#container; }
    get article() { return this.#article; }

    get isComponent() { return this.component != null && this.container == null && this.article == null; }
    get isContainer() { return this.component != null && this.container != null && this.article == null; }
    get isArticle() { return this.component != null && this.container != null && this.article != null; }

    get id() {
        if (this.#article != null) return this.#article;
        else if (this.#container != null) return this.#container;
        else if (this.#component != null) return this.#component;
        else return null;
    }

    #componentInstanceOrigin;
    #containerInstanceOrigin;
    #articleInstanceOrigin;

    get componentInstanceOrigin() { return this.#componentInstanceOrigin; }
    get containerInstanceOrigin() { return this.#containerInstanceOrigin; }
    get articleInstanceOrigin() { return this.#articleInstanceOrigin; }

    get instanceOrigin() {
        if (this.#article != null) return this.#articleInstanceOrigin;
        else if (this.#container != null) return this.#containerInstanceOrigin;
        else if (this.#component != null) return this.#componentInstanceOrigin;
        else return null;
    }

    get componentInstanceId() { return this.#componentIsMultiInstance ? this.#component + "^" + this.#componentInstanceOrigin : this.component; }
    get containerInstanceId() { return this.#containerIsMultiInstance ? this.#container + "^" + this.#containerInstanceOrigin : this.container; }
    get articleInstanceId() { return this.#articleIsMultiInstance ? this.#article + "^" + this.#articleInstanceOrigin : this.article; }

    #instances = [];
    get instances() { return this.#instances; }

    #$component = null;
    #$container = null;
    #$article = null;

    get componentRefer() {
        switch (this.#sectionBound) {
            case "header":
                return estreUi.headerSections[this.id];

            case "menu":
                return estreUi.menuSections[this.id];

            case "main":
                return estreUi.mainSections[this.id];

            case "blind":
                return estreUi.blindSections[this.id];

            case "overlay":
                return estreUi.overlaySections[this.id];

            default:
                return null;
        }
    }
    get $component() { return this.#$component; }
    get $container() { return this.#$container; }
    get $article() { return this.#$article; }

    get $element() {
        if (this.#article != null) return this.#$article;
        else if (this.#container != null) return this.#$container;
        else if (this.#component != null) return this.#$component;
        else return null;
    }
    get hostType() {
        if (this.#article != null) return "article";
        else if (this.#container != null) return "container";
        else if (this.#component != null) return "component";
        else return null;
    }


    #commited = false;

    get pid() {
        var pid = "";
        pid += "$" + (this.statement == "static" ? "s" : (this.statement == "instant" ? "i" : ""));
        pid += "&" + (this.sectionBound == "main" ? "m" : (this.sectionBound == "blind" ? "b" : (this.sectionBound == "overlay" ? "o" : (this.sectionBound == "header" ? "h" : (this.sectionBound == "menu" ? "u" : "")))));
        pid += "=";
        pid += this.#component;
        if (this.#componentIsMultiInstance) pid += "^";
        if (this.#container != null) {
            pid += "#" + this.#container;
            if (this.#containerIsMultiInstance) pid += "^";
        }
        if (this.#article != null) {
            pid += "@" + this.#article;
            if (this.#articleIsMultiInstance) pid += "^";
        }
        return pid;
    }

    get instancePid() {
        var pid = "";
        pid += "$" + (this.statement == "static" ? "s" : (this.statement == "instant" ? "i" : ""));
        pid += "&" + (this.sectionBound == "main" ? "m" : (this.sectionBound == "blind" ? "b" : (this.sectionBound == "overlay" ? "o" : (this.sectionBound == "header" ? "h" : (this.sectionBound == "menu" ? "u" : "")))));
        pid += "=";
        pid += this.componentInstanceId;
        if (this.#container != null) pid += "#" + this.containerInstanceId;
        if (this.#article != null) pid += "@" + this.articleInstanceId;
        return pid;
    }

    /**
     * Builds a component-level PID.
     * @param {string} id - Component ID.
     * @param {string} sectionBound - Section bound ("main"|"blind"|"overlay"|"header"|"menu").
     * @param {string} [statement] - "instant" or "static".
     * @returns {string|null} The generated PID, or null if invalid.
     */
    static getPidComponent(id, sectionBound, statement) {
        const stc = statement == "instant" ? "$i" : (statement == "static" ? "$s" : "");
        const sbc = sectionBound == "main" ? "&m" : (sectionBound == "blind" ? "&b" : (sectionBound == "overlay" ? "&o" : (sectionBound == "header" ? "&h" : (sectionBound == "menu" ? "&u" : null))));
        if (id != null && id != "" && sbc != null) return stc + sbc + "=" + id;
        else return null;
    }

    /**
     * Builds a container-level PID.
     * @param {string} id - Container ID.
     * @param {string} componentId - Parent component ID.
     * @param {string} [sectionBound] - Section bound.
     * @param {string} [statement] - "instant" or "static".
     * @returns {string|undefined}
     */
    static getPidContainer(id, componentId, sectionBound, statement) {
        const basePid = this.getPidComponent(componentId, sectionBound, statement);
        if (basePid != null) return basePid + "#" + id;
    }

    /**
     * Builds an article-level PID.
     * @param {string} id - Article ID.
     * @param {string} containerId - Parent container ID.
     * @param {string} componentId - Parent component ID.
     * @param {string} [sectionBound] - Section bound.
     * @param {string} [statement] - "instant" or "static".
     * @returns {string|undefined}
     */
    static getPidArticle(id, containerId, componentId, sectionBound, statement) {
        const basePid = this.getPidContainer(containerId, componentId, sectionBound, statement);
        if (basePid != null) return basePid + "@" + id;
    }

    /**
     * Creates an EstreUiPage from a DOM element and registers or commits it.
     * @param {jQuery|Element} $element - Target element.
     * @returns {EstreUiPage}
     */
    static registerOrCommitFrom($element) {
        return this.registerOrCommit(this.from($element));
    }

    /**
     * Registers an EstreUiPage with the page manager, or adds an instance if already registered.
     * @param {EstreUiPage} euiPage - Target page.
     * @returns {EstreUiPage}
     */
    static registerOrCommit(euiPage) {
        const exist = pageManager.get(euiPage.pid);
        if (exist == null) return euiPage.commit();
        else if (euiPage.statement == "instant") return exist.register(euiPage.$element);
        else return euiPage;
    }

    /**
     * Unregisters a page instance from a DOM element or page handle.
     * @param {jQuery|Element|EstrePageHandle} $element - Target element or handle.
     * @param {string} [pid] - PID (auto-extracted when an EstrePageHandle is passed).
     * @returns {boolean}
     */
    static unregisterFrom($element, pid) {
        if ($element instanceof EstrePageHandle) {
            pid = $element.pid;
            $element = $element.$host;
        } else this.from($element)?.let(euiPage => {
            pid = euiPage.pid;
            $element = euiPage.$element;
        });
        if (pid == null || $element == null) return false;
        const exist = pageManager.get(pid);
        return exist?.unregister($element);
    }

    /**
     * Reverse-constructs an EstreUiPage from a DOM element (section/div.container/article).
     * @param {jQuery|Element|EstrePageHandle} $element - Target element.
     * @returns {EstreUiPage|null}
     */
    static from($element) {
        let element;
        if ($element instanceof EstrePageHandle) {
            element = $element.host;
            $element = $element.$host;
        } else if ($element instanceof jQuery) element = $element[0];
        else {
            element = $element;
            $element = $($element);
        }

        if (element != null) {
            const page = new EstreUiPage();
            switch (element.tagName) {
                case AR:
                    page.setArticleRefer($element);
                    break;

                case DIV:
                    if (!$element.hasClass("container")) break;
                    page.setContainerRefer($element);
                    break;

                case SE:
                    page.setComponentRefer($element);
                    break;
            }
            
            return page;
        } else return null;
    }

    constructor() {}

    /**
     * Sets the section bound. Only callable before commit.
     * @param {string} sectionBound - "main"|"blind"|"menu"|"overlay"|"header".
     * @returns {this|false} this for chaining, or false if already committed.
     */
    setSectionBound(sectionBound) {
        if (this.#commited) return false;
        this.#sectionBound = sectionBound;
        return this;
    }

    /**
     * Sets the component ID. Only callable before commit and when not yet set.
     * @param {string} componentId
     * @returns {this|false}
     */
    setComponent(componentId) {
        if (this.#commited) return false;
        if (this.#component == null) this.#component = componentId;
        return this;
    }

    /**
     * Sets the container ID. Only callable before commit and when not yet set.
     * @param {string} containerId
     * @returns {this|false}
     */
    setContainer(containerId) {
        if (this.#commited) return false;
        if (this.#container == null) this.#container = containerId;
        return this;
    }

    /**
     * Sets the article ID. Only callable before commit and when not yet set.
     * @param {string} articleId
     * @returns {this|false}
     */
    setArticle(articleId) {
        if (this.#commited) return false;
        if (this.#article == null) this.#article = articleId;
        return this;
    }

    /**
     * Sets the multi-instance origin. If an array, order is [component, container, article]; otherwise distributed by hostType.
     * @param {string|string[]} [instanceOrigin] - Instance origin.
     */
    setInstanceOrigin(instanceOrigin) {
        if (isArray(instanceOrigin)) {
            this.#componentInstanceOrigin = instanceOrigin[0];
            this.#containerInstanceOrigin = instanceOrigin[1];
            this.#articleInstanceOrigin = instanceOrigin[2];
        } else equalCase(this.hostType, {
            "component": _ => this.#componentInstanceOrigin = instanceOrigin,
            "container": _ => this.#containerInstanceOrigin = instanceOrigin,
            "article": _ => this.#articleInstanceOrigin = instanceOrigin,
        });
    }

    setComponentRefer($component) {
        if (this.#commited) return false;

        try {
            this.setComponent($component[0].id);
        } catch (ex) {
            if (window.isDebug) console.error(ex);
            return null;
        }

        this.#componentStatement = $component.attr(eds.static) == t1 ? "static" : "instant";
        this.#componentIsMultiInstance = $component.attr(eds.multiInstance) == t1;
        this.#componentInstanceOrigin = $component.attr(eds.instanceOrigin)?.ifEmpty(_ => u);

        if (this.#sectionBound == null) {
            const $componentHost = $component.closest("main, nav, header, footer");
            const hostId = $componentHost.attr("id");
            const sectionBound = hostId == "staticDoc" ? "main" : (hostId == "instantDoc" ? "blind" : (hostId == "managedOverlay" ? "overlay" : (hostId == "mainMenu" ? "menu" : (hostId == "fixedTop" ? "header" : (hostId == "overwatchPanel" ? "panel" : null)))));
            this.setSectionBound(sectionBound);
        }

        this.#$component = $component;

        return this;
    }

    setContainerRefer($container, $component) {
        if (this.#commited) return false;

        try {
            this.setContainer($container.attr(eds.containerId));
        } catch (ex) {
            if (window.isDebug) console.error(ex);
            return null;
        }

        this.#containerStatement = $container.attr(eds.static) == t1 ? "static" : "instant";
        this.#containerIsMultiInstance = $container.attr(eds.multiInstance) == t1;
        this.#containerInstanceOrigin = $container.attr(eds.instanceOrigin)?.ifEmpty(_ => u);

        if ($component == null) $component = $container.closest("section");

        this.setComponentRefer($component);

        this.#$container = $container;

        return this;
    }

    setArticleRefer($article, $container, $component) {
        if (this.#commited) return false;

        try {
            this.setArticle($article.attr(eds.articleId));
        } catch (ex) {
            if (window.isDebug) console.error(ex);
            return null;
        }

        this.#articleStatement = $article.attr(eds.static) == t1 ? "static" : "instant";
        this.#articleIsMultiInstance = $article.attr(eds.multiInstance) == t1;
        this.#articleInstanceOrigin = $article.attr(eds.instanceOrigin)?.ifEmpty(_ => u);

        if ($container == null) $container = $article.closest("div.container");

        this.setContainerRefer($container, $component);

        this.#$article = $article;

        return this;
    }

    #checkRegisterSubPages() {
        if (this.#commited) return false;
        let $subPages;
        if (this.#container == null) $subPages = this.#$component.find(c.c + div + uis.container);
        else if (this.#article == null) $subPages = this.#$container.find(c.c + ar);
        else return;

        for (var page of $subPages) EstreUiPage.registerOrCommitFrom(page);
    }

    #pushInstance(host) {
        let $host;
        if (host instanceof jQuery) {
            $host = host;
            host = $host[0];
        } else $host = $(host);

        this.#instances.push(host);

        this.fetchHandler(host.pageHandle);
    }

    fetchHandler(pageHandle) {
        const handler = EstreUiPage.getHandler(this.pid);
        if (window.isVerbosely) console.log("pushInstance - " + this.pid + "[" + handle?.handler + "]", handle, handler);
        if (pageHandle != null && handler != null && typeof handler == "function") {
            return pageHandle.setHandler(new handler(pageHandle, EstreUiPage.provider));
        }
    }

    #sampleHTML() {
        if (this.#commited || this.#raw != null) return false;
        const $element = this.$element;
        const element = $element[0];
        this.#raw = element.outerHTML;
        this.#cold = element.coldify(true, true, false, false);
        if (this.statement == "instant") {
            $element.remove();
            return null;
        } else return this.#raw;
    }

    commit() {
        if (this.#commited) return false;
        pageManager.register(this);
        if (this.isFullyStatic) this.#pushInstance(this.$element);
        if (this.#article == null) this.#checkRegisterSubPages();
        const removed = this.#sampleHTML() == null;
        this.#commited = true;
        if (removed) return false;
        else return this;
    }

    register($instance) {
        if (this.isFullyStatic) return false;
        if ($instance instanceof jQuery) for (var item of $instance) this.#pushInstance(item);
        else if ($instance instanceof Element) this.#pushInstance($instance);
        else return;
        return this;
    }

    unregister($instance) {
        if (this.isFullyStatic) return false;
        if ($instance instanceof jQuery) for (var item of $instance) this.unregister(item);
        else if ($instance instanceof Element) {
            const index = this.#instances.indexOf($instance);
            this.#instances.splice(index, 1);
        } else return;
        return this.#instances;
    }

}


// ======================================================================