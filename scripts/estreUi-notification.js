/*
    EstreUI rimwork — Notification Banner
    Part of the split from estreUi.js (roadmap #002 phase 2; roadmap #009).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Notification -- EstreNotificationManager, noti(), push adapters
// ======================================================================

/**
 * iOS-style notification banner queue manager.
 * Mirrors EstreNotationManager (note toast) — one-at-a-time, per-item showTime.
 */
class EstreNotificationManager {

    // static
    static #page = "popNoti";

    static #queue = [];
    static current = null;

    static postHandle = null;

    /** Default auto-dismiss ms for banners (longer than note toast). */
    static defaultShowTime = 4500;

    static get noInteraction() { return (intent) => {}; }

    /**
     * Enqueue a banner.
     * @param {object} options - Normalized banner options (see EstreNotificationManager#data).
     * @returns {Promise<EstreNotificationManager>|undefined}
     */
    static post(options) {
        if (options != null && typeof options === "object") {
            if (this.#isTimelineVisible()) {
                this.#appendToTimelineDirect(options);
                return Promise.resolve(null);
            }
            return new Promise((resolve) => {
                const it = new EstreNotificationManager(options, resolve);
                this.#queue.push(it);
                if (window.isDebug) console.log(this.#page + " posted: ", it);
                postQueue(_ => this.postHandler());
            });
        }
    }

    /**
     * True when the overwatchPanel is open and the timeline section is currently showing.
     * In that case banner posts are diverted into the timeline list directly (iOS behavior).
     * @returns {boolean}
     */
    static #isTimelineVisible() {
        if (typeof estreUi === "undefined" || !estreUi.isOpenOverwatchPanel) return false;
        if (typeof EstreTimelineStore === "undefined") return false;
        return estreUi.$overwatchPanel.find('.host_item[data-showing="1"][data-id="timeline"]').length > 0;
    }

    /**
     * Build a timeline entry directly from noti options and append to the store.
     * Mirrors the shape used in checkOut().
     */
    static #appendToTimelineDirect(options) {
        const ui = options.ui ?? {};
        EstreTimelineStore.append({
            postedAt: Date.now(),
            title: options.title,
            body: options.body,
            subtitle: options.subtitle,
            iconSrc: options.icon,
            largeIconSrc: options.largeIcon,
            url: options.url,
            payload: options.data,
            bgColor: ui.bgColor,
            textColor: ui.textColor,
        });
    }

    static postHandler() {
        if (window.isDebug) console.log("queue: ", this.#queue);
        if (this.postHandle == null && this.current == null && this.#queue.length > 0) {
            const handle = Date.now();
            this.postHandle = handle;
            const current = this.#queue.splice(0, 1)[0];
            current.data.posted = handle;
            if (window.isDebug) console.log(this.#page + " bring: ", current);
            return pageManager.bringPage("!" + this.#page, current, handle);
        }
    }

    /** True when at least one banner is waiting to be brought. */
    static get hasQueued() { return this.#queue.length > 0; }

    /**
     * Release the queue lock at close-start so the next banner can begin its
     * enter animation in parallel with the outgoing banner's exit animation.
     * Does the timeline-append + resolver work; checkOut() becomes a noop
     * afterwards via the `_earlyCheckedOut` flag.
     */
    static beginCheckOut(intent) {
        if (intent == null || intent._earlyCheckedOut) return;
        if (intent.data.posted != null && this.postHandle == intent.data.posted) {
            if (this.current == intent) this.current = null;
            this.postHandle = null;
            if (typeof EstreTimelineStore !== "undefined") {
                const d = intent.data;
                EstreTimelineStore.append({
                    postedAt: d.posted,
                    title: d.contentTitle,
                    body: d.content,
                    subtitle: d.subtitle,
                    iconSrc: d.iconSrc,
                    largeIconSrc: d.largeIconSrc,
                    url: d.url,
                    payload: d.payload,
                    bgColor: d.bgColor,
                    textColor: d.textColor,
                });
            }
            intent._earlyCheckedOut = true;
            intent.resolver?.(intent);
            if (window.isDebug) console.log(this.#page + " early checked out: ", intent);
            postQueue(_ => this.postHandler());
        }
    }

    static checkOut(intent) {
        if (intent?._earlyCheckedOut) return;
        if (intent.data.posted != null && this.postHandle == intent.data.posted) {
            if (this.current == intent) {
                this.current = null;
            }
            this.postHandle = null;
            if (window.isDebug) console.log(this.#page + " checked out: ", intent);
            postQueue(_ => this.postHandler());
        }
        if (typeof EstreTimelineStore !== "undefined") {
            const d = intent.data;
            EstreTimelineStore.append({
                postedAt: d.posted,
                title: d.contentTitle,
                body: d.content,
                subtitle: d.subtitle,
                iconSrc: d.iconSrc,
                largeIconSrc: d.largeIconSrc,
                url: d.url,
                payload: d.payload,
                bgColor: d.bgColor,
                textColor: d.textColor,
            });
        }
        intent.resolver?.(intent);
    }


    // instance property
    data = {
        posted: undefined,
        contentTitle: undefined,
        subtitle: undefined,
        content: undefined,
        showTime: undefined,
        interactive: undefined,

        // icons
        iconSrc: undefined,      // small / sub icon
        largeIconSrc: undefined, // large / main icon (subIconSrc naming kept for template)

        // payload / routing
        buttons: undefined,
        url: undefined,
        payload: undefined,

        // visual tokens
        textSize: undefined,
        textWeight: undefined,
        textColor: undefined,
        bgColor: undefined,
    };

    onTakeInteraction = undefined;
    resolver = undefined;

    /**
     * @param {object} options - Normalized banner options.
     * @param {Function} resolver - Promise resolver injected by post().
     */
    constructor(options, resolver) {
        const d = this.data;
        d.contentTitle = options.title;
        d.content = options.body;
        d.subtitle = options.subtitle;
        d.iconSrc = options.icon;
        d.largeIconSrc = options.largeIcon;
        d.buttons = options.buttons;
        d.url = options.url;
        d.payload = options.data;

        const ui = options.ui ?? {};
        d.showTime = ui.showTime ?? EstreNotificationManager.defaultShowTime;
        d.textSize = ui.textSize;
        d.textWeight = ui.textWeight;
        d.textColor = ui.textColor;
        d.bgColor = ui.bgColor;

        this.onTakeInteraction = options.onTakeInteraction ?? EstreNotificationManager.noInteraction;
        const hasInteraction = this.onTakeInteraction !== EstreNotificationManager.noInteraction
            || options.url != null
            || (Array.isArray(options.buttons) && options.buttons.length > 0);
        d.interactive = (ui.interactive ?? hasInteraction) ? "" : undefined;

        this.resolver = resolver;
    }
}

/**
 * Post an iOS-style notification banner.
 *
 * Positional form (frequency-first, matches the original stub):
 *   noti(title, body, onTakeInteraction, mainIconSrc, subIconSrc)
 *
 * Object overload — passes through to EstreNotificationManager.post():
 *   noti({ title, body, subtitle, icon, largeIcon, data, url, buttons, onTakeInteraction, ui })
 *
 * @param {string|object} title - Title text, or the full options object (overload).
 * @param {string} [body] - Body text (HTML-capable).
 * @param {Function} [onTakeInteraction] - Tap callback. intent is passed.
 * @param {string} [mainIconSrc] - Large/leading icon src (maps to largeIcon).
 * @param {string} [subIconSrc] - Small/trailing icon src (maps to icon).
 * @returns {Promise<EstreNotificationManager>|undefined}
 */
const noti = function (title, body, onTakeInteraction, mainIconSrc, subIconSrc) {
    if (title != null && typeof title === "object") {
        return EstreNotificationManager.post(title);
    }
    return EstreNotificationManager.post({
        title,
        body,
        onTakeInteraction,
        largeIcon: mainIconSrc,
        icon: subIconSrc,
    });
}

/**
 * FCM payload adapter.
 * Accepts either the full message (`{ notification, data }`) or the `notification` object directly.
 * @param {object} payload
 */
noti.fromFcm = function (payload) {
    if (payload == null) return;
    const n = payload.notification ?? payload;
    const data = payload.data ?? (payload !== n ? undefined : undefined);
    return noti({
        title: n.title,
        body: n.body,
        icon: n.icon,
        largeIcon: n.image,
        url: n.click_action ?? payload.fcm_options?.link,
        data,
    });
}

/**
 * APNs payload adapter.
 * Accepts the outer aps-bearing object (`{ aps: { alert: ... }, ...custom }`).
 * `alert` may be a string or object.
 * @param {object} payload
 */
noti.fromApns = function (payload) {
    if (payload == null) return;
    const aps = payload.aps ?? {};
    const alert = typeof aps.alert === "string" ? { body: aps.alert } : (aps.alert ?? {});
    return noti({
        title: alert.title,
        body: alert.body,
        subtitle: alert.subtitle,
        data: payload,
    });
}

/**
 * OneSignal payload adapter.
 * `headings` / `contents` may be locale maps; first value is picked.
 * @param {object} payload
 */
noti.fromOneSignal = function (payload) {
    if (payload == null) return;
    const pick = (v) => (v != null && typeof v === "object") ? Object.values(v)[0] : v;
    return noti({
        title: pick(payload.headings),
        body: pick(payload.contents),
        subtitle: pick(payload.subtitle),
        largeIcon: payload.big_picture ?? payload.chrome_big_picture,
        icon: payload.small_icon ?? payload.chrome_icon,
        url: payload.url,
        data: payload.data ?? payload.additionalData,
    });
}


/**
 * Persistent history for dismissed notification banners (roadmap #010).
 * Backed by ECLS (localStorage, JSON). Retains up to maxEntries for ttlMs.
 */
class EstreTimelineStore {

    static #key = "timelineEntries";
    static maxEntries = 100;
    static ttlMs = 7 * 24 * 60 * 60 * 1000;

    static #listeners = new Set();

    /** @returns {Array<object>} entries newest-first, TTL-pruned. */
    static load() {
        const raw = ECLS.get(this.#key, []);
        if (!Array.isArray(raw)) return [];
        const now = Date.now();
        return raw.filter(it => it != null && (now - (it.postedAt ?? 0)) < this.ttlMs);
    }

    static save(entries) {
        ECLS.set(this.#key, entries);
    }

    /**
     * Append an entry (newest-first). Assigns id/postedAt if missing. Enforces cap + TTL.
     * @param {object} entry
     */
    static append(entry) {
        if (entry == null) return;
        const now = Date.now();
        const normalized = { ...entry,
            id: entry.id ?? String(entry.postedAt ?? now),
            postedAt: entry.postedAt ?? now,
        };
        const entries = this.load().filter(it => it.id !== normalized.id);
        entries.unshift(normalized);
        if (entries.length > this.maxEntries) entries.length = this.maxEntries;
        this.save(entries);
        this.#emit();
    }

    static remove(id) {
        const entries = this.load().filter(it => it.id !== id);
        this.save(entries);
        this.#emit();
    }

    static clear() {
        this.save([]);
        this.#emit();
    }

    /**
     * Subscribe to store changes. Callback receives the current entries array.
     * @param {Function} cb
     * @returns {Function} unsubscribe
     */
    static subscribe(cb) {
        this.#listeners.add(cb);
        return () => this.#listeners.delete(cb);
    }

    static #emit() {
        const entries = this.load();
        for (const cb of this.#listeners) {
            try { cb(entries); } catch (ex) { if (window.isLogging) console.error(ex); }
        }
    }
}


/**
 * Renders EstreTimelineStore entries into a host element (e.g. overwatchPanel #timeline).
 * Groups by date bucket (Today / Yesterday / Older), item visuals share banner styles.
 */
class EstreTimelineView {

    #$host;
    #unsubscribe;
    #lastIds = new Set();

    /**
     * @param {Element|JQuery} host - Container element for the list.
     */
    constructor(host) {
        this.#$host = host instanceof jQuery ? host : $(host);
        this.#$host.addClass("timeline_host");
        this.render(EstreTimelineStore.load());
        this.#unsubscribe = EstreTimelineStore.subscribe((entries) => this.render(entries));
    }

    destroy() {
        this.#unsubscribe?.();
        this.#$host.empty();
        this.#$host.removeClass("timeline_host");
    }

    render(entries) {
        const $host = this.#$host;
        $host.empty();

        if (!entries || entries.length === 0) {
            this.#lastIds = new Set();
            $host.append('<div class="timeline_empty">No notifications</div>');
            return;
        }

        const currentIds = new Set(entries.map(e => e.id));
        const lastIds = this.#lastIds;
        const isFirstRender = lastIds.size === 0;

        const groups = this.#groupByDate(entries);
        for (let gi = 0; gi < groups.length; gi++) {
            const group = groups[gi];
            const $group = $('<div class="timeline_group"></div>');
            const $header = $('<div class="timeline_group_header"></div>');
            $header.append($('<span class="timeline_group_label"></span>').text(group.label));
            if (gi === 0) {
                const $btn = $('<button type="button" class="timeline_clear_all">Clear All</button>');
                $btn.on("click", (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.#clearAllWithCascade();
                });
                $header.append($btn);
            }
            $group.append($header);
            for (const entry of group.entries) {
                const isNew = !isFirstRender && !lastIds.has(entry.id);
                $group.append(this.#buildItem(entry, isNew));
            }
            $host.append($group);
        }

        this.#lastIds = currentIds;
    }

    #clearAllWithCascade() {
        const $items = this.#$host.find(".timeline_item");
        if ($items.length === 0) {
            EstreTimelineStore.clear();
            return;
        }
        const stagger = 50;
        const maxDelay = 400;
        $items.each(function (i) {
            const delay = Math.min(i * stagger, maxDelay);
            $(this).css("--exit-delay", delay + "ms").addClass("timeline_item_exit");
        });
        setTimeout(() => EstreTimelineStore.clear(), maxDelay + 300);
    }

    #groupByDate(entries) {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000;

        const today = [], yesterday = [], older = [];
        for (const entry of entries) {
            const t = entry.postedAt ?? 0;
            if (t >= startOfToday) today.push(entry);
            else if (t >= startOfYesterday) yesterday.push(entry);
            else older.push(entry);
        }

        const groups = [];
        if (today.length) groups.push({ label: "Today", entries: today });
        if (yesterday.length) groups.push({ label: "Yesterday", entries: yesterday });
        if (older.length) groups.push({ label: "Older", entries: older });
        return groups;
    }

    #buildItem(entry, isNew = false) {
        const $item = $('<div class="h_icon_set post_block timeline_item"></div>');
        $item.attr("data-id", entry.id);
        if (entry.bgColor) $item.css("--bg-color", entry.bgColor);
        if (isNew) $item.addClass("timeline_item_enter");

        if (entry.largeIconSrc) {
            const $mainIcon = $('<div class="icon_place"></div>');
            $mainIcon.append($('<img />').attr("src", entry.largeIconSrc));
            $item.append($mainIcon);
        }

        const $content = $('<div class="content_place"></div>');
        if (entry.title) $content.append($('<div class="title_line"></div>').append($('<span></span>').text(entry.title)));
        if (entry.subtitle) $content.append($('<div class="subtitle_line"></div>').append($('<span></span>').text(entry.subtitle)));
        if (entry.body || entry.iconSrc) {
            const $area = $('<div class="content_area"></div>');
            if (entry.body) {
                const $body = $('<div class="content_place"></div>').html(entry.body);
                if (entry.textColor) $body.css("--color", entry.textColor);
                $area.append($body);
            }
            if (entry.iconSrc) {
                const $subIcon = $('<div class="icon_place"></div>');
                $subIcon.append($('<img />').attr("src", entry.iconSrc));
                $area.append($subIcon);
            }
            $content.append($area);
        }
        $item.append($content);

        $item.on("click", (e) => {
            e.preventDefault();
            if (entry.url) {
                window.open(entry.url, "_blank", "noopener");
            }
        });

        // Left→right swipe to delete. Opposite direction to the parent's horizontal
        // scroll-snap (quick panel switch), so the two gestures don't collide.
        if (typeof EstreSwipeHandler !== "undefined") {
            new EstreSwipeHandler($item)
                .setStopPropagation()
                .unuseY()
                .setThresholdX(1)
                .setDropStrayed(false)
                .setResponseBound($item)
                .setOnUp(function (grabX, grabY, handled, canceled, directed) {
                    if (!handled) return;
                    if (this.handledDirection === "right" && grabX > 80) {
                        $item.css("--exit-delay", "0ms").addClass("timeline_item_exit");
                        setTimeout(() => EstreTimelineStore.remove(entry.id), 300);
                    }
                });
        }

        return $item;
    }
}


// ======================================================================
