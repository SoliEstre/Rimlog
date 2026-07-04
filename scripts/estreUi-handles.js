/*
    EstreUI rimwork — Handle Base + Stock Handles
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Handle Base -- EstreHandle, registerCustomHandle
// ======================================================================



/**
 * Base class for UI handles (widgets). Parent of all stock/custom handles.
 * Static methods manage handle registration, initialization, and release; instances are bound to DOM elements.
 * @class
 */
class EstreHandle {

    // constants
    /** @type {Object<string, typeof EstreHandle>} Handle specifier → handle class mapping (stock handles). */
    static #handles = {
        get [uis.unifiedCalendar]() { return EstreUnifiedCalendarHandle; },
        get [uis.dedicatedCalendar]() { return EstreDedicatedCalendarHandle; },

        get [uis.scalable]() { return EstreScalableHandle; },
        get [uis.collapsible]() { return EstreCollapsibleHandle; },
        get [uis.toggleBlock]() { return EstreToggleBlockHandle; },
        get [uis.toggleTabBlock]() { return EstreToggleTabBlockHandle; },
        get [uis.tabBlock]() { return EstreTabBlockHandle; },
        
        get [uis.dynamicSectionBlock]() { return EstreDynamicSectionBlockHandle; },

        get [uis.numKeypad]() { return EstreNumKeypadHandle; },

        get [uis.checkboxSet]() { return EstreCheckboxSetHandle; },
        get [uis.checkboxAlly]() { return EstreCheckboxAllyHandle; },

        get [uis.toasterSlot]() { return EstreToasterSlotHandle; },
        get [uis.multiDialSlot]() { return EstreMultiDialSlotHandle; },

        get [uis.customSelectorBar]() { return EstreCustomSelectorBarHandle; },
        get [uis.monthSelectorBar]() { return EstreMonthSelectorBarHandle; },


        get [uis.dateShower]() { return EstreDateShowerHandle; },
        get [uis.liveTimestamp]() { return EstreLiveTimestampHandle; },

        get [uis.onClickSetText]() { return EstreOnClickSetTextHandle; },
        get [uis.onClickSetHtml]() { return EstreOnClickSetHtmlHandle; },

        get [uis.exportedContent]() { return EstreExportedContentHandle; },
        get [uis.dataHelpAlert]() { return EstreHelpAlertHandle; },

        get [uis.ezHidable]() { return EstreEzHidableHandle; },
        get [uis.fixedAccess]() { return EstreFixedAccessHandle; },
    }
    static get handles() { return this.#handles; }

    /** @type {Object<string, typeof EstreHandle>} Custom-registered handle classes (merged into #handles on commit). */
    static #registeredHandles = {};

    /** @type {boolean} true after commit() has been called. No further handle registration allowed. */
    static #handleCommitted = false;
    static get handleCommited() { return this.#handleCommitted; }

    /** @type {jQuery} Handle prototype template container. */
    static get $handlePrototypes() { return doc.$b.find(c.c + se + eid + "handlePrototypes"); }


    // class property
    /** @type {Object<string, Set<EstreHandle>>} specifier → active handle instance Set. */
    static #activeHandle = {};
    static get activeHandle() { return this.#activeHandle; }

    // class methods
    /**
     * Looks up a prototype template element by handle name.
     * @param {string} handleName - Handle name (uis registry key).
     * @returns {Element|undefined}
     */
    static getHandlePrototype(handleName) {
        return this.$handlePrototypes.find(c.c + ar + c.c + tmp + aiv(eds.handle, handleName)).let(it => it[it.length - 1]);
    }

    /**
     * Registers a custom handle class. Can only be called before commit().
     * @param {string} handleName - Name to register in the uis registry.
     * @param {string} handleSpecfier - CSS-selector-format handle specifier.
     * @param {typeof EstreHandle} handleClass - Handle class.
     */
    static registerCustomHandle(handleName, handleSpecfier, handleClass) {
        if (!this.#handleCommitted) {
            if (uis[handleName] == null) {
                if (this.handles[handleSpecfier] == null) {
                    if (handleClass.handleName == null) handleClass.handleName = handleName;
                    uis[handleName] = handleSpecfier;
                    this.#registeredHandles[handleSpecfier] = handleClass;
                } else if (window.isLogging) console.log("Cannot override exist stock handle specfier");
            } else if (window.isLogging) console.log("Cannot override exist handle name");
        } else if (window.isLogging) console.log("Cannot register handle after commit");
    }

    /** Commits handle registration. Subsequent registerCustomHandle() calls are ignored. */
    static commit() {
        this.#handleCommitted = true;

        for (var handleSpecfier in this.#handles) {
            const handle = this.#handles[handleSpecfier];
            if (handle.handleName == null) {
                const handleName = uis.keyOf(handleSpecfier);
                if (handleName != null) handle.handleName = handleName;
            }
        }
        for (var handleSpecfier in this.#registeredHandles) this.#handles[handleSpecfier] = this.#registeredHandles[handleSpecfier];
    }

    /**
     * Releases all handles within a host.
     * @param {jQuery} $host - Host jQuery wrapper.
     * @param {*} host - Host object (component/container/article).
     */
    static releaseHandles($host, host) {
        for (var specifier in this.handles) {
            this.releaseHandle($host, host, specifier);
        }
    }

    /**
     * Releases handles of a specific specifier within a host.
     * @param {jQuery} $host - Host jQuery wrapper.
     * @param {*} host - Host object.
     * @param {string} specifier - Handle specifier.
     */
    static releaseHandle($host, host, specifier) {
        if ($host.is(specifier)) this.unregisterHandle(host.host, host, specifier);
        const $bounds = $host.find(specifier);
        for (var bound of $bounds) this.unregisterHandle(bound, host, specifier);
    }

    /**
     * Initializes all handles within a host.
     * @param {jQuery} $host - Host jQuery wrapper.
     * @param {*} host - Host object.
     * @param {boolean} [replace=false] - If true, replaces existing handles.
     */
    static initHandles($host, host, replace = false) {
        for (var specifier in this.handles) {
            this.initHandle($host, host, specifier, this.handles[specifier], replace);
        }
    }

    /**
     * Initializes handles of a specific specifier within a host.
     * @param {jQuery} $host - Host jQuery wrapper.
     * @param {*} host - Host object.
     * @param {string} specifier - Handle specifier.
     * @param {typeof EstreHandle} handleClass - Handle class.
     * @param {boolean} [replace=false] - If true, replaces existing handles.
     */
    static initHandle($host, host, specifier, handleClass, replace = false) {
        if ($host.is(specifier)) this.registerHandle(host.host, host, specifier, handleClass, replace);
        const $bounds = $host.find(specifier);
        for (var bound of $bounds) this.registerHandle(bound, host, specifier, handleClass, replace);
    }

    /**
     * Creates and registers a handle instance on a single element.
     * @param {Element} element - Target DOM element to bind.
     * @param {*} host - Host object.
     * @param {string} specifier - Handle specifier.
     * @param {typeof EstreHandle} handleClass - Handle class.
     * @param {boolean} [replace=false] - If true, replaces existing handles.
     */
    static registerHandle(element, host, specifier, handleClass, replace = false) {
        if (element.handle != null) {
            if (replace) this.unregisterHandle(element, host, specifier);
            else return;
        }
        const handle = new handleClass(element, host);
        host.registerHandle(specifier, handle);
        var loaded = this.activeHandle[specifier];
        if (loaded == null) {
            loaded = new Set();
            this.#activeHandle[specifier] = loaded;
        }
        loaded.add(handle);
        handle.init();
    }

    /**
     * Releases and removes a handle from an element.
     * @param {Element} element - Bound DOM element.
     * @param {*} host - Host object.
     * @param {string} specifier - Handle specifier.
     */
    static unregisterHandle(element, host, specifier) {
        host.unregisterHandle(specifier, element.handle);
        const loaded = this.activeHandle[specifier];
        if (loaded != null) loaded.delete(element.handle);
        element.handle?.release();
    }


    // instance property
    /** @type {*} The host object this handle belongs to (component/container/article). */
    host = null;
    /** @type {Element|null} The bound DOM element. */
    bound = null;
    /** @type {jQuery|null} jQuery wrapper for bound. */
    $bound = null;
    /** @type {DOMStringMap|null} Reference to bound.dataset. */
    data = null;

    /** @type {Element|undefined} The prototype template element for this handle. */
    get prototypeTemplate() { return this.constructor.handleName?.let(it => EstreHandle.getHandlePrototype(it)); }

    /**
     * @param {Element} bound - Target DOM element to bind.
     * @param {*} host - Host object.
     */
    constructor(bound, host) {
        this.host = host;
        this.bound = bound;
        this.$bound = $(bound);
        this.data = bound.dataset;
    }

    /**
     * Releases the handle and cleans up references.
     * @param {boolean} [remove] - true to remove from DOM, false to empty, undefined to leave as-is.
     */
    release(remove) {
        this.host = null;
        this.bound.handle = null;
        this.bound = null;
        if (remove === true) this.$bound.remove();
        else if (remove === false) this.$bound.empty();
        this.$bound = null;
        this.data = null;
    }

    /** Initializes the handle. If an existing handle is present, releases it first. Applies prototype if data-set-prototype is set. */
    init() {
        if (this.bound.handle != null) this.bound.handle.release();
        this.bound.handle = this;
        if (this.bound.dataset.setPrototype == t1) this.applyPrototype();
    }

    /** Applies the prototype template's classes, attributes, and child nodes to the bound element. */
    applyPrototype() {
        this.prototypeTemplate?.let(temp => {
            const bound = this.bound;
            bound.dataset.setPrototype = "";

            const classes = new Set();
            bound.classList.forEach(c => classes.add(c));
            const styles = bound.getAttribute("style")?.let(it => Doctre.getStyleObject(it));
            const attributes = {};
            for (const attr of bound.attributes) equalCase(attr.name, {
                "class": _ => _,
                "style": _ => _,
                [def]: name => { attributes[name] = attr.value; }
            });

            for (const c of temp.classList) classes.add(c);
            bound.className = [...classes].join(" ");
            for (const attr of temp.attributes) equalCase(attr.name, {
                "class": _ => _,
                [def]: name => bound.setAttribute(name, attr.value)
            });
            if (styles != null) for (const [name, value] of styles.entire) bound.style[name] = value;
            for (const name in attributes) bound.setAttribute(name, attributes[name]);
            
            temp.content.cloneNode(true).let(clone => bound.prepend(clone));
        });
    }
}


// ======================================================================
// MODULE: Stock Handles -- built-in handle classes (Calendar, Scalable,
//         Collapsible, Tab, Toggle, DynamicSection, NumKeypad, etc.)
// ======================================================================




/**
 * Unified calendar handler
 */
class EstreUnifiedCalendarHandle extends EstreHandle {
    // constants


    // class property


    // instance property
    $calendarArea = null;
    $scheduleList = null;

    calendar = null;
    scheduler = null;

    $dateIndicateArea = null;
    $dateIndicator = null;
    $scalers = null;
    $todayToggle = null;
    $showToday = null;

    maxSize = -1;

    resizeObserver = null;

    constructor(unical, host) {
        super(unical, host);
        this.maxSize = this.data.maxSize;
    }

    release() {
        super.release();

        this.releaseResizeObserver();
    }

    init() {
        super.init();

        if (isNullOrEmpty(this.$bound.attr("lang"))) this.$bound.attr("lang", this.lang);

        this.$calendarArea = this.$bound.find(c.c + uis.calendarArea);
        this.$scheduleList = this.$bound.find(c.c + uis.scheduleList);

        this.calendar = new EstreVariableCalendar(this.$calendarArea.find(c.c + uis.variableCalendar)[0], this.$calendarArea[0], this);
        this.calendar.init();
        this.scheduler = new EstreUnifiedScheduler(this.$scheduleList.find(c.c + uis.unifiedScheduler)[0], this.$scheduleList[0], this.calendar, this).init();


        //this.setEvent();

        this.setResizeObserver();


        return this;
    }

    releaseResizeObserver() {
        if (this.resizeObserver != null) {
            this.resizeObserver.unobserver();
            this.resizeObserver = null;
        }
    }

    setResizeObserver() {
        this.resizeObserver = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry == this.bound) {
                    this.calendar.beginTransition();
                    setTimeout(_ => this.calendar.endTransition(), this.calendar.transitionTime);
                }
            }
        });
        this.resizeObserver.observe(this.bound);
    }
    
    // getter and setter
    get lang() { return this.$bound.attr("lang") ?? EsLocale.currentLocale ?? "en"; }

}

class EstreYear {
    calendar = null;
    year = null;
    $year = null;
    months = null;
    $months = null;
    subMonths = [];
    month = null;
    
    constructor(calendar, year, month = {}, months = year.querySelector(uis.months)) {
        this.calendar = calendar;
        this.year = year;
        this.$year = $(year);
        this.months = months;
        this.$months = $(months);
        this.setMonth(month);
    }

    isAttached() {
        return this.year.isConnected;
    }

    isLoaded() {
        return this.month != null && this.subMonths.length > 0;
    }

    setMonth(month) {
        this.month = month;
        this.subMonths = [];
        if (month != null) for (var mt in month) this.subMonths.push(month[mt]);
    }

    releaseNode() {
        if (this.months.isConnected) this.$months.remove();
    }

    setNode() {
        if (!this.months.isConnected) {
            this.year.append(this.months);
            return true;
        } return false;
    }

    getYear() {
        return this.$year.attr(eds.year);
    }

    getYearInt() {
        return parseInt(this.getYear());
    }

    getDays(date, month, year) {
        const days = [];

        if (month != null) {
            var m = this.month[month];
            if (m != null) {
                const ds = m.getDays(date, month, year);
                days.push(...ds);
            }

            m = this.month[month > 1 ? month - 1 : 12];
            if (m != null) {
                const w = m.getEndWeek();
                if (w != null) {
                    const d = w.getDay(date, month, year);
                    if (d != null) days.push(d);
                }
            }

            m = this.month[month < 12 ? month + 1 : 1];
            if (m != null) {
                const w = m.getBeginWeek();
                if (w != null) {
                    const d = w.getDay(date, month, year);
                    if (d != null) days.push(d);
                }
            }
        } else for (var m of this.month) {
            const ds = m.getDays(date, month, year);
            days.push(...ds);
        }

        return days;
    }

    forDays(work, date, month, year) {
        work(this.getDays(date, month, year));
    }
}

class EstreMonth {
    calendar = null;
    month = null;
    $month = null;
    weeks = null;
    $weeks = null;
    daysSubject = null;
    $daysSubject = null;
    subWeeks = [];
    week = null;
    
    constructor(calendar, month, week = {}, weeks = month.querySelector(uis.weeks), daysSubject = month.querySelector(uis.daysSubjects)) {
        this.calendar = calendar;
        this.month = month;
        this.$month = $(month);
        this.weeks = weeks;
        this.$weeks = $(weeks);
        this.daysSubject = daysSubject;
        this.$daysSubject = $(daysSubject);
        this.setWeek(week);
    }

    isAttached() {
        return this.month.isConnected;
    }

    isLoaded() {
        return this.week != null && this.subWeeks.length > 0;
    }

    setWeek(week) {
        this.week = week;
        this.subWeeks = [];
        if (week != null) for (var wk in week) this.subWeeks.push(week[wk]);
    }

    releaseNode() {
        if (this.weeks.isConnected) this.$weeks.remove();
    }

    setNode() {
        if (!this.weeks.isConnected) {
            this.month.append(this.weeks);
            return true;
        } else return false;
    }

    getYear() {
        return this.$month.attr(eds.year);
    }

    getYearInt() {
        return parseInt(this.getYear());
    }

    getMonth() {
        return this.$month.attr(eds.month);
    }

    getMonthInt() {
        return parseInt(this.getMonth());
    }

    getMonth0() {
        return this.getMonthInt() - 1;
    }

    getYM() {
        const year = this.getYear();
        const month = this.getMonth();
        const monthInt = parseInt(month);
        return {
            year: year,
            yearInt: parseInt(year),
            month: month,
            monthInt: monthInt,
            month0: monthInt - 1
        };
    }

    getBeginWeek() {
        return this.subWeeks[0];
    }

    getEndWeek() {
        return this.subWeeks[this.subWeeks.length - 1];
    }

    getFirstWeek() {
        return this.week[1];
    }

    getLastWeek() {
        for (var w=this.subWeeks.length-1; w>0; w--) {
            const wk = this.subWeeks[w];
            if (wk.$week.attr(eds.week) != "") return wk;
        }
        return null;
    }

    getDays(date, month, year) {
        const days = [];

        if (this.week != null) {
            for (var w of this.subWeeks) if (w.day != null) {
                const day = w.getDay(date, month, year);
                if (day != null) days.push(day);
            }
        }

        return days;
    }

}

class EstreWeek {
    calendar = null;
    week = null;
    $week = null;
    days = null;
    $days = null;
    subDays = [];
    day = null;
    
    constructor(calendar, week, day = {}, days = week.querySelector(uis.days)) {
        this.calendar = calendar;
        this.week = week;
        this.$week = $(week);
        this.days = days;
        this.$days = $(days);
        this.setDay(day);
    }

    isAttached() {
        return this.week.isConnected;
    }

    isLoaded() {
        return this.day != null && this.subDays.length > 0;
    }

    setDay(day) {
        this.day = day;
        this.subDays = [];
        if (day != null) for (var dy in day) this.subDays.push(day[dy]);
    }

    releaseNode() {
        if (this.days.isConnected) this.$days.remove();
    }

    setNode() {
        if (!this.days.isConnected) {
            this.week.append(this.days);
            return true;
        } else return false;
    }

    getYear() {
        return this.$week.attr(eds.year);
    }

    getYearInt() {
        return parseInt(this.getYear());
    }

    getMonth() {
        return this.$week.attr(eds.month);
    }

    getMonthInt() {
        return parseInt(this.getMonth());
    }

    getMonth0() {
        return this.getMonthInt() - 1;
    }

    getWeek() {
        return this.$week.attr(eds.week);
    }

    getWeekInt() {
        return parseInt(this.getWeek());
    }

    getYMW() {
        const year = this.getYear();
        const month = this.getMonth();
        const monthInt = parseInt(month);
        const week = this.getWeek();
        return {
            year: year,
            yearInt: parseInt(year),
            month: month,
            monthInt: monthInt,
            month0: monthInt - 1,
            week: week,
            weekInt: parseInt(week)
        };
    }

    getDay(date, month, year) {
        if (this.day != null) {
            const day = this.day[date];
            if (day != null) {
                if (month == null || day.$day.attr(eds.month) == month) {
                    if (year == null || day.$day.attr(eds.year) == year) {
                        return day;
                    }
                }
            }
        }
        return null;
    }

    forDay(work, date, month, year) {
        work(this.getDay(date, month, year));
    }

    forIfDay(work, date, month, year) {
        const day = this.getDay(date, month, year);
        if (day != null) work(day);
    }
}

class EstreDay {
    calendar = null;
    day = null;
    $day = null;
    scheduleds = null;
    $scheduleds = null;
    subScheduleds = [];
    scheduled = null;
    
    constructor(calendar, day, scheduled = {}, scheduleds = day.querySelectorAll(uis.scheduled)) {
        this.calendar = calendar;
        this.day = day;
        this.$day = $(day);
        this.scheduleds = scheduleds;
        this.$scheduleds = $(scheduleds);
        this.setScheduled(scheduled);
    }

    isAttached() {
        return this.day.isConnected;
    }

    isLoaded() {
        return this.scheduled != null && this.subScheduleds.length > 0;
    }

    setScheduled(scheduled) {
        this.scheduled = scheduled;
        this.subScheduleds = [];
        if (scheduled != null) for (var sd in scheduled) this.subScheduleds.push(scheduled[sd]);
    }

    getYear() {
        return this.$day.attr(eds.year);
    }

    getYearInt() {
        return parseInt(this.getYear());
    }

    getMonth() {
        return this.$day.attr(eds.month);
    }

    getMonthInt() {
        return parseInt(this.getMonth());
    }

    getMonth0() {
        return this.getMonthInt() - 1;
    }

    getDay() {
        return this.$day.attr(eds.day);
    }

    getDayInt() {
        return parseInt(this.getDay());
    }

    getDate() {
        return this.$day.attr(eds.date);
    }

    getDateInt() {
        return parseInt(this.getDate());
    }

    getYMD() {
        const year = this.getYear();
        const month = this.getMonth();
        const monthInt = parseInt(month);
        const day = this.getDay();
        const date = this.getDate();
        return {
            year: year,
            yearInt: parseInt(year),
            month: month,
            monthInt: monthInt,
            month0: monthInt - 1,
            day: day,
            dayInt: parseInt(day),
            date: date,
            dateInt: parseInt(date)
        };
    }

    buildItem(data, dataType) {
        const isData = typeof data == "string";
        const item = doc.ce(li);
        if (!isData && data.category != null) item.setAttribute(eds.category, data.category);
        if (dataType != null) item.setAttribute(eds.type, dataType);
        const span = doc.ce(sp);
        if (isData) span.innerHTML = data;
        else if (data.subject != null) span.innerText = data.subject;
        item.append(span);
        return item;
    }

    buildCustomItem(data, dataType) {
        const item = doc.ce(li);
        item.setAttribute(m.cls, "custom_item");
        if (dataType != null) item.setAttribute(eds.type, dataType);
        for (var info of data) {
            const span = doc.ce(sp);
            span.setAttribute(eds.id, info.id);
            if (info.text != null) span.innerText = info.text;
            else if (info.html != null) span.innerHTML = info.html;
            item.append(span);
        }
        return item;
    }

    buildGroup(name) {
        const scheduled = doc.ce(ul);
        scheduled.setAttribute(m.cls, "scheduled");
        scheduled.setAttribute(eds.group, name);
        return scheduled;
    }

    appendGroup(name) {
        const scheduled = this.buildGroup(name);
        this.scheduled[name] = scheduled;
        this.subScheduleds.push(scheduled);
        this.day.append(scheduled);
        const scheduleds = this.day.querySelectorAll(uis.scheduled);
        this.scheduleds = scheduleds;
        this.$scheduleds = $(scheduleds);
        return scheduled;
    }

    pushSchedule(listGrouped) {
        for (var groupId in listGrouped) {
            const divided = groupId.split("|");
            const group = divided[0];
            const originId = divided[1];
            var target = this.scheduled[group];
            if (target == null) target = this.appendGroup(group);
            else $(target).empty();

            const list = listGrouped[groupId];
            if (group == "data") {
                const dataTypeSet = scheduleDataSet.dataHandler?.getDataTypeSet(originId);
                const dataType = dataTypeSet?.dataType;
                const converted = scheduleDataSet.dataHandler?.convertDataToDisplay(list, dataType);
                if (converted != null) switch (typeof converted) {
                    case "string":
                        const item = this.buildItem(converted, dataType);
                        target.append(item);
                        break;

                    case "object":
                        if (converted instanceof Array) {
                            for (var dataSet of converted) {
                                const item = this.buildCustomItem(dataSet, dataType);
                                target.append(item);
                            }
                        }
                        break
                }
            } else for (var data of list) {
                const item = this.buildItem(data);
                target.append(item);
            }
        }
    }

    clearScheduled(groups) {
        for (var group of groups) {
            const target = this.scheduled[group];
            if (target != null) $(target).empty();
        }
    }
}

class EstreCalendar {
    // constants


    // class property


    // instance property
    #unical = null;

    #schedulers = [];

    #scale = null;

    #focusedYear = null;
    #focusedMonth = null;
    #focusedWeek = null;
    #focusedDay = null;

    #origins = {};


    constructor(unical) {
        this.unical = unical;
    }

    init(today = new Date(), scale = 3) {
        this.setSelectedDay(today.getFullYear(), today.getMonth() + 1, today.getDate());

        this.initScale(scale);

        return this;
    }

    release(remove) {

    }

    registerScheduler(scheduler) {
        this.#schedulers.push(scheduler);
    }

    unregisterScheduler(scheduler) {
        const index = this.#schedulers.indexOf(scheduler);
        this.#schedulers.splice(index, 1);
    }

    initScale(scale = 3) {
        this.setScale(scale);
    }

    //getter and setter
    get lang() { return this.$bound.attr("lang") ?? this.unical.lang ?? "en"; }

    get scale() {
        return this.#scale + "";
    }
    
    get scaleInt() {
        return this.#scale;
    }

    setScale(tv) {
        this.#scale = parseInt(tv);
    }

    get basicOrigin() {
        return this.#origins["basic"];
    }

    setBasicOrigin(origin) {
        this.#origins["basic"] = origin;
    }

    get dataOrigin() {
        return this.#origins["data"];
    }

    setDataOrigin(origin) {
        this.#origins["data"] = origin;
    }

    getScheduleOrigin(originBase) {
        return this.#origins[originBase];
    }

    setScheduleOrigin(originBase, origin) {
        this.#origins[originBase] = origin;
    }

    
    //checker
    isSelectedYear(year) {
        const fd = this.dateFocused;
        return fd.getFullYear() == year;
    }

    isSelectedMonth(year, month) {
        const fd = this.dateFocused;
        return fd.getFullYear() == year && fd.getMonth() + 1 == month;
    }

    isSelectedWeek(year, month, week) {
        const fd = this.dateFocused;
        return fd.getFullYear() == year && fd.getMonth() + 1 == month && Ecal.getWeek(fd) == week;
    }

    isSelectedDate(year, month, date) {
        const fd = this.dateFocused;
        return fd.getDate() == date && fd.getMonth() + 1 == month && fd.getFullYear() == year;
    }


    //common
    get lastDayFocused() {
        var year = this.yearIntFocused;
        var month = this.month0IntFocused;
        if (month < 0) {
            year--;
            month = 11;
        }
        return Ecal.getLastDay(year, month).getDate();
    }

    get weekFocused() {
        return Ecal.getWeek(this.dateFocused);
    }

    get dateSetFocused() {
        return Ecal.getDateSet(this.dateFocused, this.lang);
    }

    get dateFocused() {
        const year = this.yearIntFocused;
        const month = this.month0IntFocused;
        const date = Math.min(this.dateIntFocused, Ecal.getLastDay(year, month));

        return new Date(year, month, date);
    }

    get yearIntFocused() {
        return parseInt(this.$structure.attr(eds.focusYear));
    }

    get monthIntFocused() {
        return parseInt(this.$structure.attr(eds.focusMonth));
    }

    get month0IntFocused() {
        return parseInt(this.$structure.attr(eds.focusMonth)) - 1;
    }

    get weekIntFocused() {
        return parseInt(this.$structure.attr(eds.focusWeek));
    }

    get dateIntFocused() {
        return parseInt(this.$structure.attr(eds.focusDay));
    }

    get dahyIntFocused() {
        return this.dateFocused.getDay();
    }

    get unitCurrentScale() {
        return Ecal.getUnitFrom(this.scaleInt);
    }

    get scopeCurrentScale() {
        return Ecal.getScopeFrom(this.scaleInt);
    }

    getNearPositionFocused(offset = 0, unit = this.unitCurrentScale) {
        return Ecal.getNearPosition(this.dateFocused, offset, unit);
    }

    getDateSetNearPositionFocused(offset = 0, unit = this.unitCurrentScale) {
        return Ecal.getDateSetNearPosition(this.dateFocused, offset, unit);
    }


    //handles
    setSelectedYear(selected, toScaledBe) {
        this.#focusedYear = selected;
        if (toScaledBe != null) this.setScale(toScaledBe);
    }
    
    setSelectedMonth(year, month, toScaledBe) {
        this.#focusedYear = year;
        this.#focusedMonth = month;
        if (toScaledBe != null) this.setScale(toScaledBe);
    }
    
    setSelectedWeek(year, month, week, adjoin, toScaledBe) {
        year = parseInt(year);
        month = parseInt(month);
        if (week == "") {
            const isPrevMonth = parseInt(adjoin) < month;
            month += isPrevMonth ? -1 : 1
            week = isPrevMonth ? Ecal.getLastWeek(year, month - 1) : 1;
        }
        const date = Ecal.getDateSundayOfWeek(year, month - 1, parseInt(week));
        
        const focused = this.dateFocused;
        date.setDate(date.getDate() + focused.getDay());

        const td = Ecal.getDateSet(date);
        this.#focusedYear = td.year;
        this.#focusedMonth = td.month;
        this.#focusedDay = td.date;
        this.#focusedWeek = td.week;
        
        if (toScaledBe != null) this.setScale(toScaledBe);
    }

    setSelectedDay(year, month, date, toScaledBe) {
        this.$structure.attr(eds.focusYear, year);
        this.$structure.attr(eds.focusMonth, month);
        this.$structure.attr(eds.focusDay, date);

        const fd = this.dateSetFocused;
        const focusedWeek = fd.ymw.week;
        this.$structure.attr(eds.focusWeek, "" + focusedWeek);

        if (toScaledBe != null) this.setScale(toScaledBe);
    }

    // for scheduler
    pushUpdateFocused(forceUpdate = false) {
        if (this.unical != null && this.unical.scheduler != null) {
            const scopes = ["yearly", "monthly", "weekly", "daily"];
            
            for (var scope of scopes) this.unical.scheduler.initPages(scope, forceUpdate);
        }
    }

    pushScopeChanged(scope) {
        const scale = this.scaleInt;

        switch (scope) {
            case "yearly":
                if (scale > 2) this.setScale(2);
                break;
                
            case "monthly":
                if (scale > 3) this.setScale(3);
                break;

            case "weekly":
                if (scale > 5) this.setScale(5);
                break;

            case "daily":
                if (scale < 2) this.setScale(2);
                break;
        }
    }
    
    notifyBoundChanged(bound, scope) {
        const d = Escd.parseBound(bound, scope);

        switch (scope) {
            case "yearly":
                this.setSelectedYear(d.year);
                break;
                
            case "monthly":
                this.setSelectedMonth(d.year, d.month);
                break;

            case "weekly":
                this.setSelectedWeek(d.year, d.month, d.week);
                break;

            case "daily":
                this.setSelectedDay(d.year, d.month, d.date);
                break;
        }
    }
}


class EstreVoidCalendarStructure {
    
    calendar = null;
    get commonGroups() { return this.calendar.commonGroups; }

    $structure = null;

    swipeHandler = null;

    constructor($structure, calendar) {
        this.$structure = $structure;
        this.calendar = calendar;
    }

    release(empty = true) {
        this.calendar = null;

        this.releaseSwipeHandler();

        if (this.$structure != null) {
            if (empty) this.$structure.empty();
            this.$structure = null;
        }
    }

    init() {
        this.$structure.empty();
        
        this.setSwipeHandler();

        return new Date();
    }

    // getter and setter
    get lang() { return this.calendar.lang ?? "en"; }


    // event handler
    releaseSwipeHandler() {
        if (this.swipeHandler != null) {
            this.swipeHandler.release();
            this.swipeHandler = null;
        }
    }

    setSwipeHandler() {
        this.releaseSwipeHandler();
        const inst = this;
        this.swipeHandler = new EstreSwipeHandler(this.$structure, false, false).setOnUp(function(grabX, grabY, handled, canceled, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / canceled: " + canceled + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            const handledDirection = this.handledDirection;
            if (window.isVerbosely) console.log("handledDirection: " + handledDirection);
            if (handledDirection != null) {
                var isNext;
                switch (handledDirection) {
                    case "left":
                    case "up":
                        isNext = true;
                        break;

                    case "right":
                    case "down":
                        isNext = false;
                        break;
                }
                const unit = inst.calendar.unitCurrentScale;
                if (unit == null) return;
                const offset = isNext ? 1 : -1;
                const dn = inst.calendar.getDateSetNearPositionFocused(offset, unit);
                const offsetText = offset > 0 ? "+" + offset : offset;

                inst.calendar.beginTransition();
                switch (unit) {
                    case "year":
                        if (window.isVerbosely) console.log(unit + " " + offsetText + " - setSelectedYear(" + dn.year + ")");
                        inst.calendar.setSelectedYear(dn.year);
                        break;

                    case "month":
                        if (window.isVerbosely) console.log(unit + " " + offsetText + " - setSelectedMonth(" + dn.year + ", " + dn.month + ")");
                        inst.calendar.setSelectedMonth(dn.year, dn.month);
                        break;

                    case "week":
                    case "day":
                        if (window.isVerbosely) console.log(unit + " " + offsetText + " - setSelectedDay(" + dn.year + ", " + dn.month + ", " + dn.date + ")");
                        inst.calendar.setSelectedDay(dn.year, dn.month, dn.date);
                        break;
                }
                setTimeout(_ => inst.calendar.endTransition(), inst.calendar.transitionTime);
            }
        }).setOnMove(function(grabX, grabY, handled, dropped, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / dropped: " + dropped + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            // to do implement action preview feedback
        });
    }

    // for calendar
    releaseDateSelected(fd = this.calendar.dateSetFocused) {

    }

    releaseToday(td = Ecal.getDateSet()) {

    }

    checkLoadCalendarStructure(toScaledBe, date) {
        if (toScaledBe == null) toScaledBe = this.calendar.scaleInt;

        return false;
    }

    checkRelaseUnusedCalendarStructure(td, fd, scale) {

    }

    clearScheduled(groups, year) {

    }

    pushDailySchedule(listGrouped, dateId) {

    }

}

class EstreSimpleCalendarStructure extends EstreVoidCalendarStructure {
    
    constructor($structure, calendar) {
        super($structure, calendar);

        // to do implement
    }

    release(empty = true) {
        // to do implement

        super.release(empty);
    }

    init() {
        this.$structure.empty();
        
        this.setSwipeHandler();
        
        // to do implement
        return new Date();
    }

    // for calendar
    releaseDateSelected(fd = this.calendar.dateSetFocused) {
        // to do implement
    }

    releaseToday(td = Ecal.getDateSet()) {
        // to do implement
    }

    checkLoadCalendarStructure(toScaledBe, date) {
        if (toScaledBe == null) toScaledBe = this.calendar.scaleInt;

        // to do implement

        return false;
    }

    checkRelaseUnusedCalendarStructure(td, fd, scale) {
        // to do implement
    }

    clearScheduled(groups, year) {
        // to do implement
    }

    pushDailySchedule(listGrouped, dateId) {
        // to do implement
    }
}

class EstreMassiveCalendarStructure extends EstreVoidCalendarStructure {

    $years = null;
    $year = null;

    year = {};//[2024] = EstreYear { year, $year, $months, months, isAttached: true, isLoaded: fasle }

    $months = null;
    $month = null;
    $daysSubj = null;
    $weeks = null;
    $week = null;
    $days = null;
    $day = null;
    $scheduled = null;

    eachDay = [];


    constructor($structure, calendar) {
        super($structure, calendar);
    }

    release(empty = true) {
        this.$years = null;
        this.$year = null;

        this.year = null;

        this.$months = null;
        this.$month = null;
        this.$daysSubj = null;
        this.$weeks = null;
        this.$week = null;
        this.$days = null;
        this.$day = null;
        this.$scheduled = null;

        super.release(empty);
    }

    init() {
        this.$structure.empty();
        const years = doc.ce(div, "years");
        this.$structure.append(years);
        this.$years = $(years);
        const today = this.initYears();


        //this.setEventStructure();

        this.setSwipeHandler();

        return today;
    }

    initYears(today) {
        var init = false;
        if (today == null) {
            today = new Date();
            init = true;
        }

        const year = today.getFullYear();

        if (init) {
            this.$years.empty();
            for (var y=year-4; y<=year+4; y++) {
                const isJust = y == year;
                const isRange = y == year - 1 || y == year + 1;
                const ey = this.initYear(y, true, isJust ? true : (isRange ? null : false));
                if (this.calendar.isSelectedYear(y)) ey.$year.attr(eds.selected, t1);
                this.year[y] = ey;
                this.$years.append(ey.year);
                this.setEventYear(ey);
            }
        } else {
            const min = parseInt($(this.$year[0]).attr(eds.year));
            const max = parseInt($(this.$year[this.$year.length-1]).attr(eds.year));
            const just = this.$year.filter(aiv(eds.year, year));

            if (year < min) {
                for (var y=min-1; y>=year-1; y--) {
                    const isJust = y == year;
                    const isRange = y == year - 1 || y == year + 1;
                    const ey = this.initYear(y, true, isJust ? true : (isRange ? today : false));
                    if (this.calendar.isSelectedYear(y)) ey.$year.attr(eds.selected, t1);
                    this.year[y] = ey;
                    this.$years.prepend(ey.year);
                    this.setEventYear(ey);
                }
            } else if (year > max) {
                for (var y=max+1; y<=year+1; y++) {
                    const isJust = y == year;
                    const isRange = y == year - 1 || y == year + 1;
                    const ey = this.initYear(y, true, isJust ? true : (isRange ? today : false));
                    if (this.calendar.isSelectedYear(y)) ey.$year.attr(eds.selected, t1);
                    this.year[y] = ey;
                    this.$years.append(ey.year);
                    this.setEventYear(ey);
                }
            } else if (just.length > 0) this.checkLoadCalendarStructure(null, today);
        }

        this.releaseStructureHandler();
        this.$years.attr(eds.loaded, t1);

        return today;
    }

    initYear(year, initMonth = false, withWeek) {
        const yr = this.buildYear(year);
        const ms = yr.querySelector(uis.months);
        const months = initMonth ? this.initMonths(ms, year, withWeek) : null;
        return new EstreYear(this, yr, months, ms);
    }

    initMonths(months, year, withWeek = false) {
        var isNew  = true;
        if (months instanceof jQuery) {
            isNew = false;
            months.empty();
        }

        const monthset = {}
        for (var month=1; month<=12; month++) {
            var initWeek = false;
            var withDay = null;
            if (withWeek !== false) {
                if (withWeek == null) {
                    initWeek = true;
                    withDay = null;
                } else if (withWeek === true) {
                    initWeek = true;
                    withDay = true;
                } else if (withWeek instanceof Date) {
                    const dy = withWeek.getFullYear();
                    const dm = withWeek.getMonth();
                    const month0 = month - 1;
                    const isJust = month0 == dm && year == dy;
                    const isPrevMonth = month0 == (dm + 11) % 12 && year == dy - 1;
                    const isNextMonth = month0 == (dm + 1) % 12 && year == dy + 1;
                    const isRange = isPrevMonth || isNextMonth;
                    if (isJust || isRange) {
                        initWeek = true;
                        withDay = true;
                    }
                } else if (!isNaN(withWeek) && month == withWeek) {
                    initWeek = true;
                    withDay = true;
                }
            }
            const em = this.initMonth(year, month, initWeek, withDay);
            if (this.calendar.isSelectedMonth(year, month)) em.$month.attr(eds.selected, t1);
            monthset[month] = em;
            months.append(em.month);
            this.setEventMonth(em);
        }

        if (!isNew) {
            this.releaseStructureHandler("month");
            months.attr(eds.loaded, t1);
        } else months.setAttribute(eds.loaded, t1);

        return monthset;
    }

    initMonth(year, month, initWeek, withDay) {
        const mt = this.buildMonth(year, month);
        const ws = mt.querySelector(uis.weeks);
        const weeks = initWeek ? this.initWeeks(ws, year, month, withDay) : null;
        return new EstreMonth(this, mt, weeks, ws);
    }

    initWeeks(weeks, year, month, withDay = false) {
        var isNew  = true;
        if (weeks instanceof jQuery) {
            isNew = false;
            weeks.empty();
        }

        const month0 = month - 1;

        const bdw = Ecal.getBeginSundayAndWeek(year, month0);
        const bday = bdw.date;
        var week = bdw.week;
        var weekOrigin = week;
        var bdy = bday.getFullYear();
        var bdm = bday.getMonth();
        var bdd = bday.getDate();

        const weekset = {};
        do {
            const isEndPrevYear = bdy == year - 1;
            const isEndPrevMonth = isEndPrevYear || bdm + 1 < month;
            const prevMonth = isEndPrevYear ? 12 : month0
            const endDate = new Date(year, bdm, bdd + 6);
            const isBeginNextYear = endDate.getFullYear() == year + 1;
            const isBeginNextMonth = isBeginNextYear || endDate.getMonth() == month;
            const nextMonth = isBeginNextYear ? 1 : parseInt(month) + 1;
            const adjoin = isEndPrevMonth ? prevMonth : (isBeginNextMonth ? nextMonth : null);
            const fd = this.calendar.dateSetFocused;
            const checkSelected = (fd.year == year && (fd.month == month || (isEndPrevMonth && fd.month == prevMonth) || (isBeginNextMonth && fd.month == nextMonth))) ||
                (isEndPrevYear && fd.year == year - 1 && fd.month && prevMonth && week > 3) || (isBeginNextYear && fd.year == year + 1 && fd.month && nextMonth && week < 2);

            const ew = this.initWeek(year, month, week, adjoin, withDay, bdy, bdm, bdd, checkSelected);
            if (fd.year == year && (this.calendar.isSelectedWeek(year, month, week) || (isEndPrevMonth && this.calendar.isSelectedWeek(year, prevMonth, week)) || (isBeginNextMonth && this.calendar.isSelectedWeek(year, nextMonth, week))) ||
                (isEndPrevYear && this.calendar.isSelectedWeek(year - 1, prevMonth, week)) || (isBeginNextYear && this.calendar.isSelectedWeek(year + 1, nextMonth, week))) ew.$week.attr(eds.selected, t1);
            weekset[weekOrigin] = ew;
            weeks.append(ew.week);
            this.setEventWeek(ew);
            
            bday.setDate(bdd + 7);
            bdy = bday.getFullYear();
            bdm = bday.getMonth();
            bdd = bday.getDate();
            week++;
            weekOrigin = week;
            if (week > Ecal.getLastWeek(year, month0)) week = "";
        } while (bdm == month0);

        if (!isNew) {
            this.releaseStructureHandler("week");
            weeks.attr(eds.loaded, t1);
        } else weeks.setAttribute(eds.loaded, t1);

        return weekset;
    }

    initWeek(year, month, week, adjoin, initDay, bdy, bdm, bdd, checkSelected = false) {
        const wk = this.buildWeek(year, month, week, adjoin);
        const ds = wk.querySelector(uis.days);
        const days = initDay ? this.initDays(ds, bdy, bdm, bdd, checkSelected) : null;
        return new EstreWeek(this, wk, days, ds);
    }

    initDays(days, bdy, bdm, bdd, checkSelected = false) {
        var isNew  = true;
        if (days instanceof jQuery) {
            isNew = false;
            days.empty();
        }

        const bday = new Date(bdy, bdm, bdd);

        const dayset = {};
        for (var day=0; day<7; day++) {
            if (day > 0) bday.setDate(bday.getDate() + 1);
            const set = Ecal.getDateSet(bday);
            const ed = this.initDay(set.year, set.month, day, set.date);
            if (checkSelected) {
                if(this.calendar.isSelectedDate(set.year, set.month, set.date)) ed.$day.attr(eds.selected, t1);
            }
            this.setEachDay(ed, set.year, set.month - 1, set.date);
            dayset[set.date] = ed;
            days.append(ed.day);
            this.setEventDay(ed);
        }

        if (!isNew) {
            this.releaseStructureHandler("week");
            days.attr(eds.loaded, t1);
        } else days.setAttribute(eds.loaded, t1);

        return dayset;
    }

    initDay(year, month, day, date) {
        const dy = this.buildDay(year, month, day, date);
        const sd = dy.querySelectorAll(uis.scheduled);
        const groups = {};
        for (var scd of sd) groups[scd.dataset.group] = scd;
        return new EstreDay(this, dy, groups, sd);
    }

    releaseStructureHandler(scale) {
        switch(scale) {
            default:
            case "year":
                this.$year = this.$years.find(c.c + uis.year);
                this.$months = this.$year.find(c.c + uis.months);
            case "month":
                this.$month = this.$months.find(c.c + uis.month);
                this.$daysSubj = this.$month.find(c.c + uis.daysSubjects);
                this.$weeks = this.$month.find(c.c + uis.weeks);
            case "week":
                this.$week = this.$weeks.find(c.c + uis.week);
                this.$days = this.$week.find(c.c + uis.days);
            case "day":
                this.$day = this.$days.find(c.c + uis.day);
                this.$scheduled = this.$day.find(c.c + uis.scheduled);
                break;
        }
    }

    //builder
    buildYear(year) {
        const yr = doc.ce(div);
        yr.setAttribute(m.cls, "year");
        yr.setAttribute(eds.year, year);
        const lb = doc.ce(lbl);
        lb.innerText = "" + year;
        yr.append(lb);
        const mts = doc.ce(div);
        mts.setAttribute(m.cls, "months");
        yr.append(mts);
        return yr;
    }

    buildMonth(year, month) {
        const mt = doc.ce(div);
        mt.setAttribute(m.cls, "month");
        mt.setAttribute(eds.year, year);
        mt.setAttribute(eds.month, month);
        const lb = doc.ce(lbl);
        lb.innerText = "" + month;
        mt.append(lb);
        mt.append(this.buildDaysSubjects(month));
        const wks = doc.ce(div);
        wks.setAttribute(m.cls, "weeks");
        mt.append(wks);
        return mt;
    }

    buildWeek(year, month, week, adjoin) {
        const adjoinWeek = week === "" ? 1 : (week === 0 ? Ecal.getLastWeek(year, adjoin - 1) : week);
        // if (week === 0) {
        //     week = "";
        // }
        const wk = doc.ce(div);
        wk.setAttribute(m.cls, "week");
        wk.setAttribute(eds.year, year);
        wk.setAttribute(eds.month, month);
        wk.setAttribute(eds.week, week);
        if (adjoin != null) {
            wk.setAttribute(eds.adjoin, adjoin);
            wk.setAttribute(eds.adjoinWeek, adjoinWeek);
        }
        const lb = doc.ce(lbl);
        lb.innerText = week === 0 ? "" : "" + week;
        if (week === 0 || week === "") {
            lb.setAttribute(eds.prefix, EsLocale.get("monthPrefix", this.lang) + EsLocale.get("months", this.lang)[adjoin-1] + EsLocale.get("monthSuffix", this.lang));
            lb.setAttribute(eds.suffix, EsLocale.get("weekSequencePrefix", this.lang).toLowerCase() + adjoinWeek + EsLocale.get("weekSequenceSuffix", this.lang).toLowerCase());
        }
        wk.append(lb);
        const ds = doc.ce(div);
        ds.setAttribute(m.cls, "days v_scroll");
        wk.append(ds);
        return wk;
    }

    buildDay(year, month, day, date) {
        // dateInfo = { isHoliday: number, subjects: "something's day" }
        const dateInfo = scheduleDataSet.dataHandler?.getLocalizedDateInfo?.(year, month - 1, date);

        const dy = doc.ce(div);
        dy.setAttribute(m.cls, "day");
        dy.setAttribute(eds.year, year);
        dy.setAttribute(eds.month, month);
        dy.setAttribute(eds.day, day);
        dy.setAttribute(eds.date, date);
        if (dateInfo?.holidays != null && dateInfo.holidays > 0) {
            dy.setAttribute(eds.holiday, dateInfo.holidays);
        }
        const lb = doc.ce(lbl);
        lb.innerText = "" + date;
        dy.append(lb);
        if (dateInfo?.subjects != null) {
            const sj = doc.ce(sp);
            sj.setAttribute(m.cls, "subjects");
            sj.innerText = dateInfo.subjects;
            dy.append(sj);
        }
        const basic = doc.ce(ul);
        basic.setAttribute(m.cls, "scheduled");
        basic.setAttribute(eds.group, "basic");
        dy.append(basic);
        for (const group of this.commonGroups) {
            const block = doc.ce(ul);
            block.setAttribute(m.cls, "scheduled");
            block.setAttribute(eds.group, group);
            dy.append(block);
        }
        const data = doc.ce(ul);
        data.setAttribute(m.cls, "scheduled");
        data.setAttribute(eds.group, "data");
        dy.append(data);
        return dy;
    }

    buildDaysSubjects(month = "") {
        const ds = doc.ce(div);
        ds.setAttribute(m.cls, "days_subjects");
        const dh = doc.ce(div);
        dh.setAttribute(m.cls, "days_holder");
        const lb = doc.ce(lbl);
        const s = doc.ce(sp);
        s.innerText = "" + EsLocale.get("months", this.lang)[month-1];
        lb.append(s);
        dh.append(lb);
        const days = doc.ce(div);
        days.setAttribute(m.cls, "days");
        for (var d=0; d<7; d++) days.append(this.buildDaySubject(d));
        dh.append(days);
        ds.append(dh);
        return ds;
    }

    buildDaySubject(day) {
        const d = doc.ce(div);
        d.setAttribute(m.cls, "day");
        d.setAttribute(eds.day, day);
        const lb = doc.ce(lbl);
        lb.setAttribute(eds.fore, Ecal.getDayEmoji(day));
        lb.innerText = EsLocale.get("weekdaysShort", this.lang)[day].toUpperCase();
        d.append(lb);
        return d;
    }

    //getter and setter
    getMonth(year, month) {
        const y = this.year[year];
        if (y != null) return y.month[month];
        return null;
    }

    forMonth(year, month, work) {
        const m = this.getMonth(year, month);
        if (m != null) work(m);
    }

    getDays(year, month, date) {
        const days = [];
        const ds = this.year[year].getDays(date, month, year);
        if (ds != null) days.push(...ds);
        if (date < 7) {
            if (month < 2) {
                const y = this.year[year - 1];
                if (y != null) {
                    const ds = y.getDays(date, month, year);
                    if (ds != null) days.push(...ds);
                }
            }
        } else if (date > 22) {
            if (month > 11) {
                const y = this.year[year + 1];
                if (y != null) {
                    const ds = y.getDays(date, month, year);
                    if (ds != null) days.push(...ds);
                }
            }
        }
        return days;
    }

    forDays(work, year, month, date) {
        work(this.getDays(year, month, date));
    }

    setEachDay(ed, year, month, date) {
        const dateId = Ecal.getDateOffset(year, month, date);
        if (this.eachDay[dateId] == null) this.eachDay[dateId] = new Set();
        const daySet = this.eachDay[dateId];
        daySet.add(ed);
    }

    getEachDay(year, month, date) {
        return this.getEachDayBy(Ecal.getDateOffset(year, month, date));
    }

    getEachDayBy(dateId) {
        const set = this.eachDay[dateId];
        if (set != null) return Array.from(set.values());
        else [];
    }

    //event handler
    setEventYear(year) {
        const inst = this;

        year.$year.off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const selected = $this.attr(eds.year);
            const isSelected = $this.attr(eds.selected) == t1;

            var toScaledBe = null;
            if (inst.calendar.scaleInt < 2 && isSelected) toScaledBe = t2;

            inst.calendar.setSelectedYear(selected, toScaledBe);

            return false;
        });

        year.$year.find(c.c + "label").off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const $parent = $this.parent();
            const selected = $parent.attr(eds.year);

            var toScaledBe = null;
            if (inst.calendar.scaleInt < 2) toScaledBe = t2;
            else toScaledBe = t1;

            inst.calendar.setSelectedYear(selected, toScaledBe);

            return false;
        });
    }

    setEventMonth(month, count = 0) {
        const inst = this;
        if (!month.isAttached()) {
            if (count < 3) setTimeout(_ => inst.setEventMonth(month, count+1), 0);
            return;
        }

        month.$month.off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const year = $this.attr(eds.year);
            const month = $this.attr(eds.month);
            const isSelected = $this.attr(eds.selected) == t1;

            var toScaledBe = null;
            if (inst.calendar.scaleInt < 3 && isSelected) toScaledBe = t3;

            inst.calendar.setSelectedMonth(year, month, toScaledBe);

            return false;
        });

        month.$month.find(c.c + "label" + cor + uis.daysSubjects + c.c + uis.daysHolder + c.c + "label").off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const $parent = $this.parent();
            const year = $parent.attr(eds.year);
            const month = $parent.attr(eds.month);

            var toScaledBe = null;
            if (inst.calendar.scaleInt < 3) toScaledBe = t3;
            else toScaledBe = t2;

            inst.calendar.setSelectedMonth(year, month, toScaledBe);

            return false;
        });
    }

    setEventWeek(week, count = 0) {
        const inst = this;
        if (!week.isAttached()) {
            if (count < 3) setTimeout(_ => inst.setEventWeek(week, count+1), 0);
            return;
        }

        week.$week.off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const year = $this.attr(eds.year);
            const month = $this.attr(eds.month);
            const week = $this.attr(eds.week);
            const adjoin = $this.attr(eds.adjoin);
            const isSelected = $this.attr(eds.selected) == t1;

            var toScaledBe = null;
            const currentScele = inst.calendar.scaleInt;
            if (currentScele < 3 && isSelected) toScaledBe = t3;//t4;
            else if (currentScele == 4) toScaledBe = t3;
            else if (currentScele > 4) toScaledBe = t3;//t4;

            inst.calendar.setSelectedWeek(year, month, week, adjoin, toScaledBe);

            return false;
        });

        week.$week.find(c.c + "label").off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const $parent = $this.parent();
            const year = $parent.attr(eds.year);
            const month = $parent.attr(eds.month);
            const week = $parent.attr(eds.week);
            const adjoin = $parent.attr(eds.adjoin);
            const isSelected = $parent.attr(eds.selected) == t1;

            var toScaledBe = null;
            const currentScele = inst.calendar.scaleInt;
            if (currentScele < 3) toScaledBe = t3;//t4;
            else if (currentScele == 4) toScaledBe = t3;
            else if (currentScele > 4) toScaledBe = t3;//t4;
            else {
                if (e.originalEvent.pointerType != "touch") {
                    toScaledBe = t5;
                } else if (isSelected) {
                    toScaledBe = t5;
                }
            }

            inst.calendar.setSelectedWeek(year, month, week, adjoin, toScaledBe);

            return false;
        });
    }

    setEventDay(day, count = 0) {
        const inst = this;
        if (!day.isAttached()) {
            if (count < 3) setTimeout(_ => inst.setEventDay(day, count+1), 0);
            return;
        }

        day.$day.off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const year = $this.attr(eds.year);
            const month = $this.attr(eds.month);
            const date = $this.attr(eds.date);
            const isSelected = $this.attr(eds.selected) == t1;

            var toScaledBe = null;
            const currentScele = inst.calendar.scaleInt;
            if (isSelected) {
                if (currentScele < 3) toScaledBe = t3;
                //if (currentScele < 4) toScaledBe = t4;
                //else if (currentScele < 5) toScaledBe = t5;
                //else if (currentScele < 6) toScaledBe = t6;
                //else ;// 스케줄 팝업
            }

            inst.calendar.setSelectedDay(year, month, date, toScaledBe);

            return false;
        });

        day.$day.find(c.c + "label").off("click").click(function (e) {
            e.preventDefault();

            const $this = $(this);
            const $parent = $this.parent();
            const year = $parent.attr(eds.year);
            const month = $parent.attr(eds.month);
            const date = $parent.attr(eds.date);
            const isSelected = $parent.attr(eds.selected) == t1;

            var toScaledBe = null;
            const currentScele = inst.calendar.scaleInt;
            if (currentScele < 3) toScaledBe = t3;
            else {
                if (e.originalEvent.pointerType != "touch") {
                    if (!isSelected) {
                        //if (currentScele < 5) toScaledBe = t5;
                    } //else if (currentScele < 6) toScaledBe = t6;
                    else if (currentScele < 5) toScaledBe = t5;
                } else if (isSelected) {
                    //if (currentScele < 4) toScaledBe = t4;
                    //else
                    if (currentScele < 5) toScaledBe = t5;
                    //else if (currentScele < 6) toScaledBe = t6;
                }
            }

            inst.calendar.setSelectedDay(year, month, date, toScaledBe);

            return false;
        });
    }

    // for calendar
    releaseDateSelected(fd = this.calendar.dateSetFocused) {
        this.$year.filter(aiv(eds.selected, t1) + naiv(eds.year, fd.year)).attr(eds.selected, "");
        // const year = this.$year.filter(aiv(eds.year, fd.year));
        const year = this.year[fd.year];
        if (year != null) year.$year.attr(eds.selected, t1);

        this.$month.filter(aiv(eds.selected, t1) + nto + aiv(eds.year, fd.year) + aiv(eds.month, fd.month) + cps).attr(eds.selected, "");
        // const month = year.find(uis.month + aiv(eds.month, fd.month));
        const month = year.month != null ? year.month[fd.month] : null;
        if (month != null) month.$month.attr(eds.selected, t1);

        this.$week.filter(aiv(eds.selected, t1) + nto + aiv(eds.year, fd.year) + aiv(eds.month, fd.month) + aiv(eds.week, fd.week) + cps).attr(eds.selected, "");
        //const week = month.find(uis.week + aiv(eds.week, fd.week));
        if (month != null && month.week != null) {
            const week = month.week[fd.week];
            if (week != null) week.$week.attr(eds.selected, t1);
        }
                
        this.$day.filter(aiv(eds.selected, t1) + nto + aiv(eds.year, fd.year) + aiv(eds.month, fd.month) + aiv(eds.date, fd.date) + cps).attr(eds.selected, "");
        // const dateSpecfier = uis.day + aiv(eds.year, fd.year) + aiv(eds.month, fd.month) + aiv(eds.date, fd.date);
        // month.$month.find(dateSpecfier).attr(eds.selected, t1);
        // if (fd.date < 7) {
        //     if (fd.month < 2) this.$year.filter(aiv(eds.year, fd.year - 1)).find(dateSpecfier).attr(eds.selected, t1);
        //     else year.$year.find(uis.month + aiv(eds.month, fd.month - 1)).find(dateSpecfier).attr(eds.selected, t1);
        // } else if (fd.date > 22) {
        //     if (fd.month > 11) this.$year.filter(aiv(eds.year, fd.year + 1)).find(dateSpecfier).attr(eds.selected, t1);
        //     else year.$year.find(uis.month + aiv(eds.month, fd.month + 1)).find(dateSpecfier).attr(eds.selected, t1);
        // }
        this.forDays((days) => {
            for (var day of days) day.$day.attr(eds.selected, t1);
        }, fd.year, fd.month, fd.date);
    }

    releaseToday(td = Ecal.getDateSet()) {
        const tdy = this.$year.filter(aiv(eds.today, t1));
        if (tdy.length == 0 || tdy.length > 1 || tdy.attr(eds.year) != td.year) {
            tdy.attr(eds.today, null);
            this.$year.filter(aiv(eds.year, td.year)).attr(eds.today, t1);
        }

        const tdm = this.$month.filter(aiv(eds.today, t1));
        const isDiffTM = tdm.attr(eds.year) != td.year || tdm.attr(eds.month) != td.month;
        if (tdm.length == 0 || tdm.length > 1 || isDiffTM) {
            tdm.attr(eds.today, null);
            this.$month.filter(aiv(eds.year, td.year) + aiv(eds.month, td.month)).attr(eds.today, t1);
        }

        const tdw = this.$week.filter(aiv(eds.today, t1));
        const isDiffTW = tdw.attr(eds.year) != td.year || tdw.attr(eds.month) != td.month || tdw.attr(eds.week) != td.week;
        if (tdw.length == 0 || tdw.length > 1 || isDiffTW) {
            tdw.attr(eds.today, null);
            this.$week.filter(aiv(eds.year, td.year) + aiv(eds.month, td.month) + aiv(eds.week, td.week)).attr(eds.today, t1);
        }

        const tdd = this.$day.filter(aiv(eds.today, t1));
        var isDiffTD = false;
        for (var tddi of tdd) {
            tddi = $(tddi);
            if (tddi.attr(eds.year) != td.year || tddi.attr(eds.month) != td.month || tddi.attr(eds.date) != td.date) {
                isDiffTD = true;
                break;
            }
        }
        if (tdd.length == 0 || tdd.length > 2 || isDiffTD) {
            tdd.attr(eds.today, null);
            this.$day.filter(aiv(eds.year, td.year) + aiv(eds.month, td.month) + aiv(eds.date, td.date)).attr(eds.today, t1);
        }
    }

    checkLoadCalendarStructure(toScaledBe, date) {
        if (toScaledBe == null) toScaledBe = this.calendar.scaleInt;
        const td = Ecal.getDateSet(date);
        const isNeedLoadDaysSelectedYear = toScaledBe > 0;//toScaledBe > 1;

        const year = this.year[td.year];
        if (year == null) {
            this.initYears(date);
            return true;
        } else {
            var isNeedCareYear = false;
            var isNeedCareMonth = false;
            if (year.setNode()) {
                isNeedCareYear = true;
                for (var month of year.subMonths) this.setEventMonth(month);
            }
            if (!year.isLoaded()) {
                const months = this.initMonths(year.$months, td.year, isNeedLoadDaysSelectedYear ? true : null);
                year.setMonth(months);
                this.releaseStructureHandler("month");
                return true;
            } else if (isNeedLoadDaysSelectedYear) {
                var isLoaded = false;
                for (var mo in year.month) {
                    const month = year.month[mo];
                    if (month.setNode()) {
                        isNeedCareMonth = true;
                        for (var week of month.subWeeks) {
                            this.setEventWeek(week);
                            for (var day of week.subDays) this.setEventDay(day);
                        }
                    }
                    if (!month.isLoaded()) {
                        const weeks = this.initWeeks(month.$weeks, td.year, mo, true);
                        month.setWeek(weeks);
                        isLoaded = true;
                    } else {
                        let dayLoaded = true;
                        for (var week of month.subWeeks) if (!week.isLoaded()) {
                            dayLoaded = false;
                            break;
                        } else for (var day of week.subDays) if (!day.isLoaded()) {
                            dayLoaded = false;
                            break;
                        }

                        if (!dayLoaded) {
                            const weeks = this.initWeeks(month.$weeks, td.year, mo, true);
                            month.setWeek(weeks);
                            isLoaded = true;
                        }
                    }
                    
                }

                if (isLoaded) {
                    this.releaseStructureHandler("month");
                    return true;
                }
            }
            if (isNeedCareYear) this.releaseStructureHandler("year");
            else if (isNeedCareMonth) this.releaseStructureHandler("month");
        }
        return false;
    }

    checkRelaseUnusedCalendarStructure(td, fd, scale) {
        for (var y in this.year) {
            const year = this.year[y];
            if (scale == 1) {
                if (year.setNode()) {
                    for (var month of year.subMonths) this.setEventMonth(month);
                    this.releaseStructureHandler("year");
                }
            } else if (scale >= 2) {
                if (y == td.year || y == fd.year || y == fd.year - 1 || y == fd.year + 1) {
                    const isNeedCareYear = year.setNode();
                    var isNeedCareMonth = false;
                    for (var m in year.month) {
                        const month = year.month[m];
                        if (isNeedCareYear) this.setEventMonth(month);
                        if (y == td.year || y == fd.year ||//if ((y == td.year && m == td.month) || (y == fd.year && m == fd.month) ||
                            (fd.month == 1 && y == fd.year - 1 && m == 12) ||
                            (fd.month == 12 && y == fd.year + 1 && m == 1)) {

                            if (month.setNode()) {
                                isNeedCareMonth = true;
                                for (var week of month.subWeeks) {
                                    this.setEventWeek(week);
                                    for (var day of week.subDays) this.setEventDay(day);
                                }
                            }
                        } else {
                            month.releaseNode();
                        }
                    }
                    if (isNeedCareYear) this.releaseStructureHandler("year");
                    else if (isNeedCareMonth) this.releaseStructureHandler("month");
                } else {
                    year.releaseNode();
                }
            }
        }
    }

    clearScheduled(groups, year) {
        if (year == null) for (var group of groups) this.$scheduled.filter(aiv(eds.group, group)).empty();
        else {
            const begin = Ecal.getDateOffset(year, 0, 1);
            const end = Ecal.getDateOffset(year, 11, 31);
            for (var i=begin; i<=end; i++) {
                const days = this.getEachDayBy(i);
                for (var day of days) day.clearScheduled(groups);
            }
        }
    }

    pushDailySchedule(listGrouped, dateId) {
        const set = this.getEachDayBy(dateId);
        for (var day of set) day.pushSchedule(listGrouped);
    }

}

class EstreVariableCalendar extends EstreCalendar {
    // constants


    // class property


    // instance property
    area = null;
    $area = null;

    bound = null;
    $bound = null;
    data = null;

    $dateIndicateArea = null;
    $dateIndicator = null;
    $scalers = null;
    $todayToggle = null;
    $showToday = null;

    $structure = null;

    $calendarBar = null;

    $scheduleFilter = null;
    $filterFixed = null;
    $filterVariable = null;

    $controlArea = null;
    $settings = null;
    $settingsPanel = null;

    $areaHandler = null;
    $areaToSmaller = null;
    $areaToLarger = null;
    $areaResizer = null;


    commonGroups = ["whole", "timely"];

    structure = null;

    areaResizeHandler = null;


    scheduleRequestedYearly = [];//[year] = Set(groups)
    scheduleRequestedMonthly = [];
    scheduleRequestedDaily = [];

    prevFocusedYear = null;
    prevScheduleBasicOrigin = "";
    prevScheduleDataOrigin = "";

    maxScale = 6;

    constructor(calendar, area = calendar.closest(uis.calendarArea), unical) {
        super(unical);

        this.area = area;
        this.$area = $(area);

        this.bound = calendar;
        this.$bound = $(calendar);
        this.data = calendar.dataset;

        this.$dateIndicateArea = this.$bound.find(c.c + uis.dateIndicateArea);
        this.$dateIndicator = this.$dateIndicateArea.find(c.c + uis.dateIndicator);
        this.$scalers = this.$dateIndicator.find(c.c + uis.scaler);
        this.$todayToggle = this.$dateIndicator.find(c.c + uis.today);
        this.$showToday = this.$todayToggle.find(c.c + uis.unicalShowToday);

        this.$structure = this.$bound.find(c.c + uis.calendarStructure);

        this.$calendarBar = this.$bound.find(c.c + uis.calendarBar);

        this.$scheduleFilter = this.$calendarBar.find(c.c + div + c.c + uis.scheduleFilter);
        this.$filterFixed = this.$scheduleFilter.find(c.c + uis.filterFixed);
        this.$filterVariable = this.$scheduleFilter.find(c.c + uis.filterVariable);

        this.$controlArea = this.$calendarBar.find(c.c + uis.controlArea);
        this.$settings = this.$controlArea.find(c.c + uis.settings);
        this.$settingsPanel = this.$controlArea.find(c.c + nv + uis.settingsPanel);

        this.$areaHandler = this.$controlArea.find(c.c + uis.areaHandler);
        this.$areaToSmaller = this.$areaHandler.find(c.c + uis.toSmaller);
        this.$areaToLarger = this.$areaHandler.find(c.c + uis.toLarger);

        this.$areaResizer = this.$bound.find(c.c + uis.areaResizer);


    }

    init() {
        if (ua.isAndroid) this.setNoTransition();

        this.initCalendarBar();

        this.setEventScaler();

        this.setEventSettings();

        this.setEventAreaHandles();
        
        const today = this.initStructure();

        this.$bound.attr(eds.showToday, "");
        this.$showToday[0].checked = false;

        super.init(today);

        this.releaseScheduleDataFilter();

        return this;
    }

    release(remove) {
        super.remove(remove);

        this.releaseStructure();

        scheduleDataSet.releaseCaller(this);

        //to do implement
    }

    releaseStructure() {
        if (this.structure != null) {
            this.structure.release();
            this.structure = null;
        }
    }

    initStructure(type = "auto") {
        switch (type) {
            case "auto":
                type = "massive";
                // if (ua.isAppleMobile) {
                //     const iosVersion = ua.iOsVersion;
                //     if (iosVersion != null) {
                //         if (parseInt(iosVersion.split(".")[0]) < 16) type = "simple";
                //     }
                // }
                if (!csc(csm.containerQuery)) type = "simple";

                return this.initStructure(type);

            case "void":
                this.structure = new EstreVoidCalendarStructure(this.$structure, this);
                break;

            case "simple":
                this.structure = new EstreSimpleCalendarStructure(this.$structure, this);
                break;
                
            case "massive":
                this.structure = new EstreMassiveCalendarStructure(this.$structure, this);
                break;
        }
        this.setStructureType(type);
        return this.structure.init();
    }

    initScale(scale = this.$bound.attr(eds.beginScale)) {
        super.initScale(scale);
    }


    initCalendarBar() {
        scheduleDataSet.dataHandler?.initScheduleCommonFilter(this);
    }


    //getter and setter
    get structureType() { return this.$structure.attr(eds.structureType); }

    setStructureType(type = null) {
        this.$structure.attr(eds.structureType, type);
    }
    
    get scale() {
        return this.$bound.attr(eds.scale);
    }
    
    get scaleInt() {
        return parseInt(this.scale);
    }

    setScale(tv) {
        super.setScale(tv);

        const inst = this;
        const currentScale = this.scaleInt;
        const v = parseInt(tv);
        this.beginTransition();
        if (currentScale > 3 && v < 3) {
            setTimeout(_ => {
                inst.$bound.attr(eds.scale, tv + "");
                setTimeout(_ => {
                    inst.checkRelaseUnusedCalendarStructure();
                    inst.endTransition();
                    inst.checkLoadSchedule();
                }, this.transitionTime / 2);
            }, cvt.t2ms(this.unical.$calendarArea.css(a.trdr)));
        } else {
            this.$bound.attr(eds.scale, tv + "");
            setTimeout(_ => {
                inst.checkRelaseUnusedCalendarStructure();
                inst.endTransition();
                inst.checkLoadSchedule();
            }, v > currentScale ? inst.transitionTime : this.transitionTime / 2);
        }
        const isSetFit = v > 3;
        // const isCurrent = this.unical.$calendarArea.attr(eds.fitCalendar) == t1;
        // if (isSetFit != isCurrent) this.unical.$calendarArea.attr(eds.fitCalendar, isSetFit ? t1 : "");
        this.unical.$calendarArea.attr(eds.scaleOverride, isSetFit ? "" + tv : "");
    }

    get basicOrigin() {
        return this.$bound.attr(eds.currentScheduleBasicOrigin);
    }

    setBasicOrigin(origin) {
        super.setBasicOrigin(origin);
        this.$bound.attr(eds.currentScheduleBasicOrigin, origin);
    }

    get dataOrigin() {
        return this.$bound.attr(eds.currentScheduleDataOrigin);
    }

    setDataOrigin(origin) {
        super.setDataOrigin(origin);
        this.$bound.attr(eds.currentScheduleDataOrigin, origin);
    }

    getScheduleOrigin(originBase) {
        return this.$bound.attr(eds.currentScheduleOrigin(originBase));
    }

    setScheduleOrigin(originBase, origin) {
        super.setScheduleOrigin(originBase, origin);
        this.$bound.attr(eds.currentScheduleOrigin(originBase), origin);
    }

    //event handler
    setEventScaler() {
        const inst = this;

        this.$scalers.click(function(e) {
            const $this = $(this);
            const scaleId = $this.attr(eds.scaleId);
            if (scaleId != null && scaleId != "") {
                inst.setScale(scaleId);
                $this.attr(eds.scaleSelected, t1);
            }
        });    

        this.$showToday.change(function(e) {
            inst.beginTransition();
            inst.$bound.attr(eds.showToday, this.checked ? t1 : "");
            setTimeout(_ => inst.endTransition(), inst.transitionTime);
        });    
    }

    setEventSettings() {
        const inst = this;

        this.$settings.click(function (e) {
            inst.$settingsPanel.attr(eds.show, inst.$settingsPanel.attr(eds.show) == t1 ? "" : t1);
        });

        const $inputs = this.$settingsPanel.find(inp + aiv("type", "checkbox"));
        $inputs.filter(eid + "hide_weekage").prop("checked", this.$structure.attr(eds.hideWeekage)).change(function (e) {
            inst.$structure.attr(eds.hideWeekage, this.checked ? t1 : "");
        });
        $inputs.filter(eid + "hide_weekend").prop("checked", this.$structure.attr(eds.hideWeekend)).change(function (e) {
            inst.$structure.attr(eds.hideWeekend, this.checked ? t1 : "");
        });
    }

    setEventAreaHandles() {
        const inst = this;

        this.$areaToSmaller.click(function (e) {
            var current = inst.$area.attr(eds.size);
            if (current == "") {
                inst.beginTransition();
                inst.$area.attr(eds.size, 0);
                setTimeout(_ => inst.endTransition(), inst.transitionTime);
            } else {
                current = parseInt(current);
                if (current > 0) {
                    inst.beginTransition();
                    inst.$area.attr(eds.size, current - 1);
                    setTimeout(_ => inst.endTransition(), inst.transitionTime);
                }
            }
        });

        this.$areaToLarger.click(function (e) {
            var current = inst.$area.attr(eds.size);
            if (current == "") {
                inst.$area.attr(eds.size, 3);
            } else {
                current = parseInt(current);
                if (current < 3) {
                    inst.$area.attr(eds.size, current + 1);
                }
            }
        });

        this.setAreaResizeHandler();
    }

    releaseAreaResieHandler() {
        if (this.areaResizeHandler != null) this.areaResizeHandler.release();
    }

    setAreaResizeHandler() {
        this.releaseAreaResieHandler();
        const inst = this;
        var startHeight = null;
        var fallbackSize = null;
        this.areaResizeHandler = new EstreSwipeHandler(this.$areaResizer).unuseX().setThresholdY(1).setDropStrayed(false).setPreventDefault().setPreventAll().setOnDown(function(startX, startY) {
            if (window.isVerbosely) console.log("startX: " + startX + " / startY: " + startY);
            inst.beginTransition();
            $(document.body).attr(eds.onResizing, "v");
            startHeight = inst.$area.height();//.offsetHeight;
            fallbackSize = inst.$area.attr(eds.size);
        }).setOnUp(function(grabX, grabY, handled, canceled, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / canceled: " + canceled + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            $(document.body).attr(eds.onResizing, null);
            const height = parseInt(startHeight + grabY);
            if (handled) {
                if (window.isVerbosely) console.log("fixed - height: " + height + " / startHeight: " + startHeight);
                inst.$area.css("--height", height + "px");
                if (inst.$area.attr(eds.size) != "") inst.$area.attr(eds.size, "");
            } else {
                if (window.isVerbosely) console.log("finally fallbacked - startHeight: " + startHeight + ", fallbackSize: " + fallbackSize);
                if (fallbackSize != "") {
                    inst.$area.css("--height", "0px");
                    inst.$area.attr(eds.size, fallbackSize);
                } else inst.$area.css("--height", height + "px");
            }
            setTimeout(_ => inst.endTransition(), inst.transitionTime);
            startHeight = null;
            fallbackSize = null;
        }).setOnMove(function(grabX, grabY, handled, dropped, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / dropped: " + dropped + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            if (startHeight != null) {
                const height = parseInt(startHeight + grabY);
                if (handled) {
                    if (window.isVerbosely) console.log("height: " + height + " / startHeight: " + startHeight);
                    inst.$area.css("--height", height + "px");
                    if (inst.$area.attr(eds.size) != "") inst.$area.attr(eds.size, "");
                } else {
                    if (window.isVerbosely) console.log("fallback - startHeight: " + startHeight + ", fallbackSize: " + fallbackSize);
                    if (fallbackSize != "") {
                        inst.$area.css("--height", "0px");
                        inst.$area.attr(eds.size, fallbackSize);
                    } else inst.$area.css("--height", height + "px");
                }
            } else if (window.isVerbosely) console.log("ignored");
        });
    }


    //common
    get isNoTransition() { return this.$bound.attr(eds.noTransition) == t1; }
    
    setNoTransition(enable = true) {
        this.$bound.attr(eds.noTransition, enable ? t1 : null);
        return this;
    }

    get transitionTime() {
        return this.isNoTransition ? 0 : 800;
    }


    //handles
    setSelectedYear(selected, toScaledBe) {
        super.setSelectedYear(selected);

        this.$structure.attr(eds.focusYear, selected);
        this.beginTransition();
        this.checkSetDayFocused(toScaledBe);
        setTimeout(_ => this.endTransition(), this.transitionTime);
    }
    
    setSelectedMonth(year, month, toScaledBe) {
        super.setSelectedMonth(year, month);

        this.$structure.attr(eds.focusYear, year);
        this.$structure.attr(eds.focusMonth, month);
        this.beginTransition();
        this.checkSetDayFocused(toScaledBe);
        setTimeout(_ => this.endTransition(), this.transitionTime);
    }
    
    setSelectedWeek(year, month, week, adjoin, toScaledBe) {
        super.setSelectedWeek(year, month, week, adjoin);

        year = parseInt(year);
        month = parseInt(month);
        if (week == "") {
            const isPrevMonth = parseInt(adjoin) < month;
            month += isPrevMonth ? -1 : 1
            week = isPrevMonth ? Ecal.getLastWeek(year, month - 1) : 1;
        }
        const date = Ecal.getDateSundayOfWeek(year, month - 1, parseInt(week));
        
        const focused = this.dateFocused;
        date.setDate(date.getDate() + focused.getDay());
        const monthBefore = focused.getMonth();

        const td = Ecal.getDateSet(date);
        this.$structure.attr(eds.focusYear, td.year);
        this.$structure.attr(eds.focusMonth, td.month);
        this.$structure.attr(eds.focusDay, td.date);
        this.$structure.attr(eds.focusWeek, td.week);
        
        const onTransition = toScaledBe == null && (this.dateFocused.getMonth() != monthBefore || this.scaleInt > 3);
        if (onTransition) this.beginTransition();
        this.checkSetDayFocused(toScaledBe);
        if (onTransition) setTimeout(_ => this.endTransition(), this.transitionTime);
    }

    setSelectedDay(year, month, date, toScaledBe) {
        super.setSelectedDay(year, month, date);

        const fdb = this.dateSetFocused; 
        const monthBefore = fdb.month0;
        const weekBefore = fdb.ymw.week;
        this.$structure.attr(eds.focusYear, year);
        this.$structure.attr(eds.focusMonth, month);
        this.$structure.attr(eds.focusDay, date);

        const fd = this.dateSetFocused;
        const focusedWeek = fd.ymw.week;
        this.$structure.attr(eds.focusWeek, "" + focusedWeek);

        const currentScale = this.scaleInt;
        const onTransition = toScaledBe == null && (fd.month0 != monthBefore || (currentScale == 5 && focusedWeek != weekBefore) || currentScale > 5);
        if (onTransition) this.beginTransition();
        this.checkSetDayFocused(toScaledBe);
        if (onTransition) setTimeout(_ => this.endTransition(), this.transitionTime);
    }

    checkSetDayFocused(toScaledBe) {
        const fd = this.dateSetFocused;
        this.setYearIndic(fd.ymw.year);
        this.setMonthIndic(EsLocale.get("months", this.lang)[fd.ymw.month0]);
        this.setWeekIndic(fd.ymw.week);
        this.setDateIndic(fd);
        this.setDayIndic(fd.dayText);

        this.releaseDate(toScaledBe);
    }

    releaseSelectedDay() {
        this.setDayIndic(Ecal.getDayText(this.dateFocused.getDay()));
    }

    setYearIndic(year) {
        const yearIndic = this.$scalers.filter(uis.years).find(c.c + "label");
        yearIndic.text(year);
    }

    setMonthIndic(month) {
        const monthIndic = this.$scalers.filter(uis.months).find(c.c + "label");
        monthIndic.text(month);
    }

    setWeekIndic(week) {
        const weekIndic = this.$scalers.filter(uis.weeks).find(c.c + "label");
        weekIndic.text(week);
    }

    setDayIndic(day) {
        const dayIndic = this.$scalers.filter(uis.days).find(c.c + "label");
        dayIndic.text(day);
    }

    setDateIndic(dateSet) {
        const dateIndic = this.$scalers.filter(uis.date).find(c.c + "label");
        dateIndic.text(dateSet.date2d);
        const divider = EsLocale.get("dateDivider", this.lang);
        const seq = [...EsLocale.get("dateSequence", this.lang)].join(divider);
        const prefix = seq.substring(0, seq.indexOf("d"));
        const suffix = seq.substring(seq.indexOf("d") + 1);
        dateIndic.attr(eds.prefix, prefix.replace("y", dateSet.year2d).replace("m", dateSet.month2d));
        dateIndic.attr(eds.suffix, suffix.replace("y", dateSet.year2d).replace("m", dateSet.month2d));
    }    

    releaseDate(toScaledBe, fd = this.dateSetFocused) {
        const inst = this;
        if (this.checkLoadCalendarStructure(toScaledBe)) setTimeout(_ => {
            inst.structure.releaseDateSelected(fd);
            inst.releaseToday();

            if (toScaledBe != null) inst.setScale(toScaledBe);
            else inst.checkLoadSchedule();

            inst.pushUpdateFocused();
        }, 0);
        else {
            this.structure.releaseDateSelected(fd);
            this.releaseToday();

            if (toScaledBe != null) this.setScale(toScaledBe);
            else this.checkLoadSchedule();

            this.pushUpdateFocused();
        }
    }

    releaseToday() {
        const td = Ecal.getDateSet();

        this.releaseDateIndicator(td);

        this.structure.releaseToday(td);
    }

    releaseDateIndicator(td) {
        const $year = this.$scalers.filter(uis.years);
        const year = parseInt($year.find(c.c + "label").text());
        const isTodayYear = year == td.year;
        $year.attr(eds.today, isTodayYear ? t1 : "");

        const $month = this.$scalers.filter(uis.months);
        const month = parseInt($month.find(c.c + "label").text());
        const isTodayMonth = month == td.month;
        $month.attr(eds.today, isTodayMonth ? t1 : "");

        const $week = this.$scalers.filter(uis.weeks);
        const week = parseInt($week.find(c.c + "label").text());
        const isTodayWeek = week == td.week;
        $week.attr(eds.today, isTodayWeek ? t1 : "");

        const $day = this.$scalers.filter(uis.days);
        const day = $day.find(c.c + "label").text();
        const isTodayDay = day == td.dayText;
        $day.attr(eds.today, isTodayDay ? t1 : "");

        const $date = this.$scalers.filter(uis.date);
        const date = parseInt($date.find(c.c + "label").text());
        const isTodayDate = date == td.date;
        $date.attr(eds.today, isTodayDate ? t1 : "");

        const isToday = isTodayYear && isTodayMonth && isTodayDate;

        //this.$showToday[0].checked = isToday;
    }

    checkLoadCalendarStructure(toScaledBe, date = this.dateFocused) {
        if (toScaledBe == null) toScaledBe = this.scaleInt;
        return this.structure.checkLoadCalendarStructure(toScaledBe, date);
    }

    checkRelaseUnusedCalendarStructure() {
        const td = Ecal.getDateSet();
        const fd = this.dateSetFocused;
        const scale = this.scaleInt;
        this.structure.checkRelaseUnusedCalendarStructure(td, fd, scale);
    }

    hideDataOfScheduled() {
        this.$scheduled.filter(aiv(eds.group, "data")).hide();
    }

    showDataOfScheduled() {
        this.$scheduled.filter(aiv(eds.group, "data")).show();
    }

    beginTransition() {
        let current = this.$structure.attr(eds.transition);
        if (current == null || current == "") current = 0;
        else current = parseInt(current);
        this.$structure.attr(eds.transition, current + 1);
    }

    endTransition() {
        let current = this.$structure.attr(eds.transition);
        if (current == null || current == "") current = 0;
        else current = parseInt(current);
        this.$structure.attr(eds.transition, Math.max(current - 1, 0));
    }

    checkLoadSchedule(forceReload = false) {
        const focusedYear = this.yearIntFocused;
        const basicOrigin = this.basicOrigin;
        const dataOrigin = this.dataOrigin;
        const dateBeginEnd = Escd.getDateBeginEndFrom(focusedYear);
        if (forceReload || focusedYear != this.prevFocusedYear) {
            const tag = basicOrigin != null && basicOrigin != "" ? "|" + basicOrigin : "";
            const groups = ["basic" + tag, ...this.commonGroups];
            if (dataOrigin != "") groups.push("data|" + dataOrigin);
            const forClear = [...this.commonGroups];
            if (this.prevScheduleBasicOrigin != "") forClear.unshift("basic");
            if (this.prevScheduleDataOrigin != "") forClear.push("data");
            this.structure.clearScheduled(forClear, focusedYear);
            // this.setScheduleRequestedYearly(focusedYear, groups);
            // scheduleDataSet.requestPushDataYear(focusedYear, this, groups);
            scheduleDataSet.requestPushData(dateBeginEnd.beginDate, dateBeginEnd.endDate, groups, this);
            this.prevFocusedYear = focusedYear;
            if (this.prevFocusedYear == "") {
                this.prevScheduleBasicOrigin = basicOrigin;
                this.prevScheduleDataOrigin = dataOrigin;
            }
        } else {
            if (basicOrigin != this.prevScheduleBasicOrigin) {
                const tag = basicOrigin != null && basicOrigin != "" ? "|" + basicOrigin : "";
                const groups = ["basic" + tag];
                if (this.prevScheduleBasicOrigin != "") this.structure.clearScheduled(["basic"], focusedYear);
                // this.setScheduleRequestedYearly(focusedYear, groups);
                // scheduleDataSet.requestPushDataYear(focusedYear, this, groups);
                scheduleDataSet.requestPushData(dateBeginEnd.beginDate, dateBeginEnd.endDate, groups, this);
                this.prevScheduleBasicOrigin = basicOrigin;
            } else if (dataOrigin != this.prevScheduleDataOrigin) {
                if (this.prevScheduleDataOrigin != "") this.structure.clearScheduled(["data"], focusedYear);
                if (dataOrigin != "") {
                    const groups = ["data|" + dataOrigin];
                    // this.setScheduleRequestedYearly(focusedYear, groups);
                    // scheduleDataSet.requestPushDataYear(focusedYear, this, groups);
                    scheduleDataSet.requestPushData(dateBeginEnd.beginDate, dateBeginEnd.endDate, groups, this);
                }
                this.prevScheduleDataOrigin = dataOrigin;
            }
        }
    }

    releaseCalendarChanges(forceReload = false) {
        this.releaseToday();

        this.checkLoadSchedule(forceReload);

        this.pushUpdateFocused(true);
    }

    async releaseScheduleDataFilter() {
        await scheduleDataSet.dataHandler?.initScheduledDataFilter(this);
    }


    // from scheduleDataSet
    pushDailySchedule(listGrouped, dateId) {
        this.structure.pushDailySchedule(listGrouped, dateId);
    }


    // for scheduler
    notifyBoundChanged(bound, scope) {
        this.beginTransition();
        super.notifyBoundChanged(bound, scope);
        setTimeout(_ => { this.endTransition(); }, this.transitionTime);
    }
    
}


class EstreUnifiedScheduler {
    // constants


    // class property


    // instance property
    unical = null;
    calendar = null;
    get commonGroups() { return this.calendar?.commonGroups ?? []; }
    area = null;
    $area = null;

    bound = null;
    $bound = null;
    data = null;

    scopedTab = null;

    content = {};
    titleSpan = {};
    currentScope = null;

    registeredBound = new Set();

    constructor(scheduler, area = scheduler.parentElement, calendar, unical) {
        this.unical = unical;
        this.calendar = calendar;
        this.area = area;
        this.$area = $(area);

        this.bound = scheduler;
        this.$bound = $(scheduler);
        this.data = calendar.dataset;

    }

    release(remove = false) {
        scheduleDataSet.releaseCaller(this);

        this.unical = null;

        this.calendar.unregisterScheduler(this);
        this.calendar = null;
        this.area = null;
        this.$area = null;

        this.bound = null;
        if (remove) this.$bound.remove();
        this.$bound = null;
        this.data = null;

        this.scopedTab.release(remove);
        this.scopedTab = null;

        this.content = null;
        this.titleSpan = null;
        this.currentScope = null;
    }

    init() {
        this.calendar.registerScheduler(this);

        this.scopedTab = new EstreScopedTabBlock(this.bound, this).init();


        return this;
    }    


    // getter and setter
    get lang() { return this.$bound.attr("lang") ?? this.unical.lang ?? "en"; }


    // common
    
    registerScope(content, scope = content.dataset.scope, titleSpan) {
        this.content[scope] = content;
        if (titleSpan != null) this.titleSpan[scope] = titleSpan;
    }

    initScopes() {
        for (var scope in this.content) {
            const content = this.content[scope];

            this.initPages(scope);
        }
    }

    initPages(scope, forceUpdate = false, bounds = Escd.getBounds(scope, this.calendar.dateFocused)) {
        const content = this.content[scope];
        const selected = content.find(c.c + c.w + aiv(eds.pageSelected, t1));
        if (!forceUpdate && selected.find(c.c + c.w).length > 0 && bounds[0] == selected.attr(eds.bound)) return;
        if (content != null) {
            const $content = $(content);
            const preload = $content.attr(eds.preload) == t1;
            const $pages = $content.find(c.c + c.w);
            const length = $pages.length;
            const offsetAdjust = parseInt(length / 2) + (1 - (length % 2));
            for (var i=0; i<length; i++) {
                const offset = i - offsetAdjust;
                const page = $pages[i];
                const $page = $(page);
                const bound = bounds[offset];
                this.boundHasGone($page.attr(eds.bound));
                $page.attr(eds.bound, bound);
                this.constructBound($page, scope, bound);
                if (preload || offset == 0) {
                    this.requestPushDataForPage($page, scope, bound, offset);
                    if (offset == 0) {
                        $page.attr(eds.pageSelected, t1);
                        this.pushScopeTitle(bound, scope);
                    }
                } else $page.attr(eds.pageSelected, "");
            }
        }
    }

    registerBound(bound) {
        this.registeredBound.add(bound);
    }

    isExistBound(bound) {
        return this.registeredBound.has(bound);
    }

    boundHasGone(bound) {
        this.registeredBound.delete(bound);
    }

    constructBound($page, scope, bound) {
        $page.empty();
        const division = doc.ce(li);
        division.setAttribute(eds.division, "schedule");
        division.setAttribute(eds.count, t0);
        division.append(this.buildPlaceholder());

        const d = Escd.getDateBeginEndFrom(bound, scope);
        for (var dateId=d.beginDate; dateId<=d.endDate; dateId++) {
            var holder = doc.ce(ul, "schedule_holder");
            holder.setAttribute(eds.group, "basic");
            holder.setAttribute(eds.dateId, dateId);
            division.append(holder);

            for (const group of this.commonGroups) {
                const holder = doc.ce(ul, "schedule_holder");
                holder.setAttribute(eds.group, group);
                holder.setAttribute(eds.dateId, dateId);
                division.append(holder);
            }
        }

        $page.append(division);
    }

    buildPlaceholder(content = EsLocale.get("noSchedule", this.lang)) {
        const block = doc.ce(div, "schedule_placeholder");
        const span = doc.ce(sp, null, content);
        block.append(span);
        return block;
    }

    buildScheduleItem(info, dateSet) {
        const dateInfo = scheduleDataSet.dataHandler?.getLocalizedDateInfo?.(dateSet.year, dateSet.month0, dateSet.date);
        
        const item = doc.ce(li, "division_block schedule_item");
        item.setAttribute(eds.scheduleId, info.id);
        if (info.category != null) item.setAttribute(eds.category, info.category);
        if (dateInfo?.holidays != null && dateInfo.holidays > 0) item.setAttribute(eds.holiday, dateInfo.holidays);
        const icon = doc.ce(div, "fit_width max_height event_type");
        var span = doc.ce(sp);
        icon.append(span);
        item.append(icon);
        const content = doc.ce(div, "block content");
        const datetime = doc.ce(div, "line_block datetime");
        const ruby = doc.ce(rb);
        ruby.append(doc.ce(sp, "month", dateSet.month));
        ruby.append(doc.ce(sp, "date", dateSet.date));
        ruby.append(doc.ce(sp, "space", "&nbsp; "));
        ruby.append(doc.ce(sp, "day", dateSet.dayText));
        const rubytext = doc.ce(rt, "week");
        //rubytext.append(doc.ce(sp, "year", info.ymw.year));
        rubytext.append(doc.ce(sp, "month", dateSet.ymw.month));
        rubytext.append(doc.ce(sp, "week", dateSet.ymw.week));
        ruby.append(rubytext);
        datetime.append(ruby);
        var span = doc.ce(sp, "timespan");
        if (info.timeset.isWhole) span.innerText = EsLocale.get("wholeDayShort", this.lang);
        else {
            if (info.timeset.begin != null) span.append(dic.ce(sp, "time_begin", info.timeset.begin));
            if (info.timeset.end != null) span.append(dic.ce(sp, "time_begin", info.timeset.end));
        }
        content.append(datetime);
        content.append(doc.ce(sp, "block subject", info.subject));
        item.append(content);
        return item;
    }

    // to scopedTab
    pushPageData(scope, bound, group, dateId, list) {
        const $content = $(this.content[scope]);
        const $page = $content.find(c.c + c.w + aiv(eds.bound, bound));
        const $division = $page.find(c.c + li + aiv(eds.division, "schedule"));
        const $holder = $division.find(c.c + uis.scheduleHolder + aiv(eds.group, group) + aiv(eds.dateId, dateId));
        $division.attr(eds.count, parseInt($division.attr(eds.count)) + list.length);

        if (window.isVerbosely) console.log("data to holder - scope: " + scope + ", bound: " + bound + ", group: " + group + ", dateID: " + dateId, list, $content, $page, $division, $holder);
        // if (scope == "monthly" && bound == "2024.03") throw new Error();
        if ($holder.length > 0) {
            $holder.empty();
            for (var info of list) {
                $holder.append(this.buildScheduleItem(info, Ecal.getDateSetFrom(dateId)));
            }
        }
    }

    pushScopeTitle(bound, scope) {
        const titleSpan = this.titleSpan[scope];
        if (titleSpan != null) {
            const dateSeq = EsLocale.get("dateSequence", this.lang);
            const d = Escd.parseBound(bound, scope, this.lang);
            const monthTextFull = EsLocale.get("months", this.lang)[d.month0];
            const monthBlock = EsLocale.get("monthPrefix", this.lang) + monthTextFull + EsLocale.get("monthSuffix", this.lang);
            const monthSeqBlock = EsLocale.get("monthSequencePrefix", this.lang) + monthTextFull + EsLocale.get("monthSequenceSuffix", this.lang);
            var title;
            switch (scope) {
                case "yearly":
                    title = EsLocale.get("yearSequencePrefix", this.lang) + d.year + EsLocale.get("yearSequenceSuffix", this.lang);
                    break;
                    
                case "monthly":
                    const yearBock = EsLocale.get("yearPrefix", this.lang) + d.year + EsLocale.get("yearSuffix", this.lang);
                    title = [...dateSeq.replace("d", "")].join(" ").replace("y", yearBock).replace("m", monthSeqBlock);
                    break;
    
                case "weekly":
                    const weekBlock = EsLocale.get("weekSequencePrefix", this.lang).toLowerCase() + d.week + EsLocale.get("weekSequenceSuffix", this.lang).toLowerCase();
                    title = monthBlock + " " + weekBlock;
                    break;
    
                case "daily":
                    const dateSeqBlock = EsLocale.get("daySequencePrefix", this.lang).toLowerCase() + d.date + EsLocale.get("daySequenceSuffix", this.lang).toLowerCase();
                    const dayBlock = EsLocale.get("weekdayShortPrefix", this.lang) + d.day + EsLocale.get("weekdayShortSuffix", this.lang);
                    title = [...dateSeq.replace("y", "")].join(" ").replace("m", monthBlock).replace("d", dateSeqBlock) + " " + dayBlock;
                    break;
            }
            titleSpan.innerText = title;
        }
    }

    // from scopedTab
    requestInitScopes() {
        this.initScopes();
    }

    requestPushDataForPage($page, scope, bound, offset, isRecycle = false) {
        if (isRecycle) {
            bound = Escd.getBoundBy(offset, bound, scope);
            $page.attr(eds.bound, bound);
            this.constructBound($page, scope, bound);
            if (window.isVerbosely) console.log("requestPushDataForPage - scope: " + scope + ", bound: " + bound + ", offset: " + offset + ", isRecycle: " + isRecycle);
        }
        this.requestPushDataForScheduler(scope, bound);
    }

    requestPushDataForScheduler(scope, bound) {
        this.registerBound(bound);

        const basicOrigin = this.calendar.basicOrigin;
        // const dataOrigin = this.calendar.dataOrigin;
        const tag = basicOrigin != null && basicOrigin != "" ? "|" + basicOrigin : "";
        const groups = ["basic" + tag, ...this.commonGroups];
        // if (dataOrigin != "") groups.push("data|" + dataOrigin);

        const dateBeginEnd = Escd.getDateBeginEndFrom(bound, scope);
        if (window.isVerbosely) console.log("requestPushData(" + dateBeginEnd.beginDate + ", " + dateBeginEnd.endDate + ", " + groups + ", this);");
        scheduleDataSet.requestPushData(dateBeginEnd.beginDate, dateBeginEnd.endDate, groups, this);
        
    }


    notifyScopeChanged(scope) {
        if (this.unical != null && this.unical.calendar != null) {
            this.unical.calendar.pushScopeChanged(scope);
        }
    }

    notifyBoundChanged(bound, scope) {
        if (this.unical != null && this.unical.calendar != null) {
            this.unical.calendar.notifyBoundChanged(bound, scope);
        }

        this.pushScopeTitle(bound, scope);
    }


    // from scheduleDataSet
/*
    pushYearlySchedule(datas, year, groups) {
        for (var dateId in datas) {
            const data = datas[dateId];
            this.pushDailySchedule(data, dateId);
        }
    }
*/

    pushDailySchedule(listGrouped, dateId) {
        for (var bound of this.registeredBound) {
            const d = Escd.getDateBeginEndFrom(bound);
            if (dateId >= d.beginDate && dateId <= d.endDate) {
                const scope = Escd.getScopeBy(bound);
                for (var groupId in listGrouped) {
                    const divided = groupId.split("|");
                    const group = divided[0];
                    const originId = divided[1];
                    if (window.isVerbosely) console.log("pushPageData(" + scope + ", " + bound + ", " + group + ", " + dateId + ", " + listGrouped[groupId] + ");", listGrouped[groupId]);
                    this.pushPageData(scope, bound, group, dateId, listGrouped[groupId]);
                }
            }
        }
    }
}


class ScheduleDataSet {

    #dataHandler = null;
    get dataHandler() { return this.#dataHandler; }

    #dataHandlerCommitted = false;


    dataMatrix = new Map();//key = origin, value = [dateId] = data
 
    /** this value has when exist any request */
    requestIssuer = null;

    /** append caller when null data in pendings */
    dataRequests = new Map();//key = origin, value = [dateId] = Set(caller)

    /** append caller when null data in matrix */
    dataPendings = new Map();//key = origin, value = [dateId] = Set(caller)


    init(dataHandler) {
        if (!this.#dataHandlerCommitted) this.#dataHandler = dataHandler;

        return this;
    }

    commit() {
        this.#dataHandlerCommitted = true;
    }


    issueRequest(delayed = false) {
        if (this.requestIssuer == null) {
            this.requestIssuer = setTimeout(async _ => await this.requestProcessor(), delayed ? 100 : 0);
        }
    }

    async requestProcessor() {
        this.requestIssuer = null;

        for (const [origin, requests] of this.dataRequests) {
            const pendings = this.dataPendings.get(origin);
            
            if (pendings != null && pendings.length > 0) {
                this.issueRequest(true);
                continue;
            }

            this.dataPendings.set(origin, requests);
            this.dataRequests.delete(origin);

            const ranges = [];
            var current = null;
            for (var dateId in requests) {
                if (current == null) {
                    current = { begin: dateId, end: dateId };
                } else if (dateId == current.end + 1) {
                    current.end = dateId;
                } else {
                    ranges.push(current);
                    current = { begin: dateId, end: dateId };
                }
            }

            for (var range of ranges) {
                await this.dataHandler?.notifyRequestData(origin, range.begin, range.end);
            }
        }

    }

    getDataBy(origin) {
        return this.dataMatrix.get(origin);
    }

    getData(origin, dateId) {
        const datas = this.getDataBy(origin);

        if (datas != null) return datas[dateId];

        return null;//not exist in dataMatrix
    }

    setData(origin, dateId, data) {
        var datas = this.getDataBy(origin);

        if (datas == null) {
            datas = [];
            this.dataMatrix.set(origin, datas);
        }

        datas[dateId] = data;
    }

    getDataPending(origin) {
        const pending = this.dataPendings.get(origin);
        if (pending != null) return pending;
        else {
            const newer = [];
            this.dataPendings.set(origin, newer);
            return newer;
        }
    }

    getExistsPending(origin) {
        const pending = this.dataPendings.get(origin);
        if (pending != null) {
            var count = 0;
            if (pending.length == 0) count--;
            else for (var v of pending) if (v != null) count++;
            return count;
        } else null;
    }

    checkClearPending(origin) {
        if (this.getExistsPending(origin) === 0) {
            this.dataPendings.delete(origin);
        }
    }

    clearDataPending(origin, dateId) {
        const pendings = this.getDataPending(origin);
        pendings[dateId] = null;
        this.checkClearPending(origin);
    }

    removeDataPending(origin) {
        return this.dataPendings.delete(origin);
    }

    setDataRequest(origin, dateId, caller) {
        var requestOrigin = this.dataRequests.get(origin);

        if (requestOrigin == null) {
            requestOrigin = [];
            this.dataRequests.set(origin, requestOrigin);
        }

        let requests = requestOrigin[dateId];

        if (requests == null) {
            requests = new Set([caller]);
            requestOrigin[dateId] = requests
        } else requests.add(caller);

        this.issueRequest();
    }

    requestData(origin, dateId, caller) {
        const pending = this.getDataPending(origin)[dateId];

        if (pending != null && pending.length > 0) {
            pending.add(caller);
        } else {
            this.setDataRequest(origin, dateId, caller);
        }
    }

    // from caller
    requestPushData(beginDateId, endDateId, groups, caller, forced = false) {
        for (var group of groups) {
            for (var i=beginDateId; i<=endDateId; i++) {

                const data = forced ? null : this.getData(group, i);

                if (data != null) {
                    const listGrouped = {};
                    listGrouped[group] = data;
                    if (window.isVerbosely) console.log("pushData(" + caller + ", " + listGrouped + ", " + i + ");", caller, data);
                    this.pushData(caller, listGrouped, i);
                } else {
                    if (window.isVerbosely) console.log("requestData(" + group + ", " + i + ", " + caller + ");", caller);
                    this.requestData(group, i, caller);
                }
            }
        }
    }
    
    // to caller
    pushDataBy(caller, dataSet, dateId, groups) {
        const groupSet = new Set(groups);
        const set = {};
        for (var group in dataSet) if (groupSet.has(group)) set[group] = dataSet[group];
        this.pushData(caller, set, dateId);
    }

    pushData(caller, data, dateId) {
        if (caller != null) try {
            caller.pushDailySchedule(data, dateId);
        } catch (ex) {
            if (window.isLogging) console.error(ex);
        }
    }

    // from data handler
    incomeData(group, datas) {
        const pendings = this.getDataPending(group);

        for (var dateId in datas) {
            const data = datas[dateId];

            const callerSet = pendings[dateId];

            if (callerSet != null) {
                const callers = Array.from(callerSet);

                this.setData(group, dateId, data);
                const listGrouped = {};
                listGrouped[group] = data;
                for (var caller of callers) this.pushData(caller, listGrouped, dateId);
                this.clearDataPending(group, dateId);
            }
        }

        this.removeDataPending(group);
    }



    //old methods
    dataArray = [];
    
    callers = new Set();

    dataRequestsYear = [];
    dataReadyYear = [];

    getCalendar() {
        return estreUi.stockCalendar;
    }

    releaseCaller(caller) {
        this.callers.delete(caller);
    }
    
    requestPushDataYear(year, caller, groups = ["basic", ...caller.commonGroups]) {
        if (caller != null) this.callers.add(caller);
        
        const dataReady = this.dataReadyYear[year];
        
        const forPush = [];
        const forRequest = [];
        for (var group of groups) {
            if (dataReady == null || !dataReady.has(group)) forRequest.push(group);
            else forPush.push(group);
        }

        // var dataRequests = this.dataRequestsYear[year];
        // if (dataRequests == null) {
        //     const set = new Set();
        //     this.dataRequestsYear[year] = set;
        //     dataRequests = set;
        // }

        // for (var group of forRequest) dataRequests.add(group);

        if (forPush.length > 0) this.pushDataAlreadyHas(caller, forPush, year);
        if (forRequest.length > 0) this.requestDataYear(year, forRequest);
    }

    requestDataYear(year, groups) {

        var dataRequests = this.dataRequestsYear[year];
        if (dataRequests == null) {
            const set = new Set();
            dataRequests = set;
            this.dataRequestsYear[year] = set;
        }

        for (var group of groups) dataRequests.add(group);

        this.dataHandler?.notifyRequestYear(year);
    }

    pushDataAlreadyHas(caller, groups, year, month, date) {
        if (date != null) {
            const dateId = Ecal.getDateOffset(year, month, date);
            this.pushDataBy(caller, dataSet, dateId, groups);
        } else if (month != null) {
            const monthBegin = Ecal.getDateOffset(year, month, 1);
            const monthEnd = Ecal.getDateOffset(year, month, Ecal.getLastDate(year, month));
            for (dateId=monthBegin; dateId<=monthEnd; dateId++) {
                const dataSet = this.dataArray[dateId];
                this.pushDataBy(caller, dataSet, dateId, groups);
            }
        } else if (year != null) {
            const yearBegin = Ecal.getDateOffset(year, 0, 1);
            const yearEnd = Ecal.getDateOffset(year, 11, 31);
            const yearly = [];
            const groupSet = new Set();
            for (dateId=yearBegin; dateId<=yearEnd; dateId++) {
                // const dataSet = this.dataArray[dateId];
                // this.pushDataBy(caller, dataSet, dateId, groups);
                const data = this.dataArray[dateId];
                const set = {}
                for (var group in data) if (groups.indexOf(group) > -1) {
                    set[group] = data[group];
                    groupSet.add(group);
                }
                yearly[dateId] = set;
            }
            this.pushDataYearly(caller, yearly, year, Array.from(groupSet.values()));
        } else {
            for (var dateId in dataMatrix) {
                const dataSet = this.dataArray[dateId];
                this.pushDataBy(caller, dataSet, dateId, groups);
            }
        }
    }

    pushDataYearly(caller, datas, year, groups) {
        try {
            caller.pushYearlySchedule(datas, year, groups);
        } catch (ex) {
            if (window.isLogging) console.error(ex.name + "\n" + ex.message);
        }
    }

    incomeDataYear(year, group, datas) {
        const callers = Array.from(this.callers.values());
        const dataSet = [];
        for (var dateId in datas) {
            const data = datas[dateId];
            const dataGrouped = {};
            dataGrouped[group] = data;

            //for (var caller of callers) this.pushData(caller, dataGrouped, dateId);
            this.insertData(dateId, group, data);
            dataSet[dateId] = dataGrouped;
        }
        for (var caller of callers) this.pushDataYearly(caller, dataSet, year, [group]);

        const requests = this.dataRequestsYear[year];
        if (requests != null) requests.delete(group);
        const dataReady = this.dataReadyYear[year];
        if (dataReady != null) dataReady.add(group);
        else this.dataReadyYear[year] = new Set([group]);
    }

    insertData(dateId, group, data) {
        var dataSet = this.dataArray[dateId];
        if (dataSet == null) {
            dataSet = {};
            this.dataArray[dateId] = dataSet;
        }
        dataSet[group] = data;
    }
}

const scheduleDataSet = new ScheduleDataSet();




class EstreDedicatedCalendarHandle extends EstreHandle {

    // constants


    // statics


    // open property
    $calendarBlock;
    $scheduleBlock;
    
    // enclosed property

    calendar;
    scheduler;

    // getter and setter
    get lang() { return this.$bound.attr("lang") ?? EsLocale.currentLocale ?? "en"; }


    constructor(element, host) {
        super(element, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        if (isNullOrEmpty(this.$bound.attr("lang"))) this.$bound.attr("lang", this.lang);

        this.$calendarBlock = this.$bound.find(c.c + uis.calendarBlock);
        this.$scheduleBlock = this.$bound.find(c.c + uis.scheduleBlock);

        this.calendar = new EstreMicroCalendar(this.$calendarBlock.find(c.c + uis.microCalendar)[0], this.$calendarBlock[0], this);
        this.calendar.init();
        this.$scheduleBlock.find(c.c + uis.minimalScheduler)[0]?.let(it => {
            this.scheduler = new EstreMinimalScheduler(it, this.$scheduleBlock[0], this.calendar, this);
            this.scheduler.init();
        });

        return this;
    }
}

class EstreMicroCalendar {

    // constants


    // statics


    // open property
    area;
    $area;

    bound;
    $bound;
    data;

    $structure;
    structure;

    $stretchHandle;

    // enclosed property
    #dediCal;

    #stretchSwipeHandler;

    #selectedYear;
    #selectedMonth;
    #selectedWeek;
    #selectedDay;

    #setBoundCallback;
    #showEachDayCallback;
    #selectionChangedCallback;
    #selectedDayByUserCallback;
    #collapsedChangedCallback;

    #isCollapsed;

    // getter and setter
    get focusedYear() { return this.$structure.attr(eds.focusYear)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) }
    get focusedMonth() { return this.$structure.attr(eds.focusMonth)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) }
    get focusedWeek() { return this.$structure.attr(eds.focusWeek)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) }
    get focusedDay() { return this.$structure.attr(eds.focusDay)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) }

    get dateFocused() {
        const year = this.focusedYear;
        const month = this.focusedMonth;
        const date = this.focusedDay;

        if (year == null || month == null || date == null) return null;

        const month0 = month - 1;
        return new Date(year, month0, date);
    }
    get weekDayFocused() { return this.dateFocused?.getDay(); }

    get boundYear() { return this.$structure.attr(eds.boundYear)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) }
    get boundMonth() { return this.$structure.attr(eds.boundMonth)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) }
    get boundWeek() { return this.$structure.attr(eds.boundWeek)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) }


    get isCollapsed() { return this.$bound.attr(eds.collapsed) == t1; }


    constructor(element, area, dediCal) {
        this.#dediCal = dediCal;

        this.area = area;
        this.$area = $(area);

        this.bound = element;
        this.$bound = $(element);

        this.$structure = this.$bound.find(c.c + uis.calendarStructure);

        this.$stretchHandle = this.$bound.find(c.c + uis.stretchHandle + c.c + uis.handle);

    }

    init() {
        this.setStretchSwipeHandler();

        const today = this.initStructure();

        this.setSelectedDay(today.year, today.month, today.date);

        return this;
    }

    release(remove) {
        super.remove(remove);

        this.structure?.release(remove);
    }

    setStretchSwipeHandler() {
        this.#isCollapsed = this.isCollapsed;

        if (this.$stretchHandle.length == 0) return;

        this.releaseStretchSwipeHandler();

        const stratchThreshold = 40;
        this.#stretchSwipeHandler = new EstreSwipeHandler(this.$stretchHandle).setStopPropagation().setPreventDefault().setPreventAll().unuseX().setResponseBound(this.$bound).setThresholdY(8).setOnUp((grabX, grabY, handled, canceled, directed) => {
            if (handled) {
                let collapsed;
                if (this.#isCollapsed) {
                    collapsed = grabY < stratchThreshold;
                } else {
                    collapsed = grabY <= -stratchThreshold;
                }
                if (collapsed != this.isCollapsed) {
                    this.$bound.attr(eds.collapsed, collapsed ? t1 : "");
                }
                if (collapsed != this.#isCollapsed) {
                    this.#isCollapsed = collapsed;
                    this.#collapsedChangedCallback?.(collapsed, this);
                }
            }
        }).setOnMove((grabX, grabY, handled, dropped, directed) => {
            if (handled) {
                let collapsed;
                if (this.#isCollapsed) {
                    collapsed = grabY < stratchThreshold;
                } else {
                    collapsed = grabY <= -stratchThreshold;
                }
                if (collapsed != this.isCollapsed) {
                    this.$bound.attr(eds.collapsed, collapsed ? t1 : "");
                }
            }
        });
    }

    releaseStretchSwipeHandler() {
        if (this.#stretchSwipeHandler != null) {
            this.#stretchSwipeHandler.release();
            this.#stretchSwipeHandler = null;
        }
    }

    initStructure(type = this.$structure.attr(eds.structureType)) {
        this.structure = matchCase(type, {
            "weekfloor": _ => new EstreWeekFloorStructure(this.$structure, this),
            [def]: _ => {
                this.$structure.attr(eds.structureType, "weekfloor");
                return new EstreWeekFloorStructure(this.$structure, this)
            },
        });

        return this.structure.init();
    }

    selectToday() {
        const today = new Date();

        this.setSelectedDay(today.getFullYear(), today.getMonth() + 1, today.getDate());
    }

    setSelectedYear(year) {
        this.#selectedYear = year;

        const month = this.#selectedMonth ?? 1;
        const month0 = this.#selectedMonth - 1;

        const dateSet = Ecal.getDateSet(new Date(year, month0, this.#selectedDay));
        const lastDay = Ecal.getLastDay(year, month0);
        if (dateSet.date > lastDay) dateSet = Ecal.getDateSet(new Date(year, month0, lastDay));

        this.#selectedWeek = dateSet.week;

        this.$structure.attr(eds.focusYear, year);
        this.$structure.attr(eds.focusMonth, month);
        this.$structure.attr(eds.focusWeek, dateSet.week);
        this.$structure.attr(eds.focusDay, dateSet.date);

        this.checkSetDayFocused(dateSet);
    }

    setSelectedMonth(year, month) {
        this.#selectedYear = year;
        this.#selectedMonth = month;

        const month0 = month - 1;
        const isWeekly = this.boundWeek != null;

        const dateSet = Ecal.getDateSet(new Date(year, month0, this.#selectedDay));
        const lastDay = Ecal.getLastDay(year, month0);
        if (dateSet.date > lastDay) dateSet = Ecal.getDateSet(new Date(year, month, lastDay));

        this.#selectedWeek = dateSet.week;

        this.$structure.attr(eds.focusYear, year);
        this.$structure.attr(eds.focusMonth, month);
        this.$structure.attr(eds.focusWeek, dateSet.week);
        this.$structure.attr(eds.focusDay, dateSet.date);

        this.setBound(year, month, isWeekly ? dateSet.week : u);

        this.checkSetDayFocused(dateSet);
    }

    setSelectedWeek(year, month, week) {
        this.#selectedYear = year;

        const month0 = month - 1;

        const day = this.weekDayFocused ?? 0;
        const justday = Ecal.getDateSundayOfWeek(year, month0, week);
        if (day > 0) justday.setDate(justday.getDate() + day);
        const dateSet = Ecal.getDateSet(justday);

        this.#selectedMonth = dateSet.month;
        this.#selectedWeek = dateSet.week;
        this.#selectedDay = dateSet.date;

        this.$structure.attr(eds.focusYear, dateSet.year);
        this.$structure.attr(eds.focusMonth, dateSet.month);
        this.$structure.attr(eds.focusWeek, dateSet.week);
        this.$structure.attr(eds.focusDay, dateSet.date);

        this.checkSetDayFocused(dateSet);
    }

    setSelectedDay(year, month, date) {
        this.#selectedYear = year;
        this.#selectedMonth = month;
        this.#selectedDay = date;

        const month0 = month - 1;

        const dateSet = Ecal.getDateSet(new Date(year, month0, date));

        this.#selectedWeek = dateSet.week;

        this.$structure.attr(eds.focusYear, dateSet.year);
        this.$structure.attr(eds.focusMonth, dateSet.month);
        this.$structure.attr(eds.focusWeek, dateSet.week);
        this.$structure.attr(eds.focusDay, dateSet.date);

        this.checkSetDayFocused();
    }
    
    checkSetDayFocused(dateSet = Ecal.getDateSet(this.dateFocused ?? new Date())) {
        this.$structure.find(uis.day + aiv(eds.selected, t1)).removeAttr(eds.selected);

        const isWeekly = this.boundWeek != null;

        const findDay = () => this.$structure.find(uis.day + aiv(eds.year, dateSet.year) + aiv(eds.month, dateSet.month) + aiv(eds.date, dateSet.date));

        const $day = findDay();
        if ($day.length > 0) $day.attr(eds.selected, t1);
        else {
            if (isWeekly) {
                const ymw = dateSet.ymw;
                this.structure.setBound(ymw.year, ymw.month, ymw.week);
            } else {
                this.structure.setBound(dateSet.year, dateSet.month);
            }

            findDay().attr(eds.selected, t1);
        }

        this.#selectionChangedCallback?.(dateSet, isWeekly, this, this.structure);

        this.#dediCal.scheduler?.setDateSelected(dateSet.year, dateSet.month, dateSet.date);
    }

    resetBound() {
        this.structure.resetBound();
        this.checkSetDayFocused();

        return this;
    }

    setBound(year, month, week) {
        if (ts(year) && year.includes("-")) {
            const [y, m, w] = year.split("-");
            year = parseInt(y).let(it => isNaN(it) ? null : it);
            month = parseInt(m).let(it => isNaN(it) ? null : it);
            week = w != null ? parseInt(w).let(it => isNaN(it) ? null : it) : null;
        }

        this.structure.setBound(year, month, week);
    }

    setBoundScale(isWeekly) {
        if (isWeekly == null) isWeekly = this.boundWeek == null;

        if (isWeekly) {
            const dateSet = Ecal.getDateSet(this.dateFocused);
            this.structure.setBound(dateSet.year, dateSet.month, dateSet.week);
            this.checkSetDayFocused();

            return true;
        } else {
            this.structure.setBound(this.boundYear, this.boundMonth);
            this.checkSetDayFocused();

            return false;
        }
    }

    onSetBound(year, month, week) {
        this.#setBoundCallback?.(year, month, week, this, this.structure);
    }

    setOnSetBound(callback = (year, month, week, calendar, structure) => {}) {
        this.#setBoundCallback = callback;

        return this;
    }

    setOnShowEachDay(callback = ($day, year, month, date, calendar, structure) => {}) {
        this.#showEachDayCallback = callback;

        return this;
    }

    onShowEachDay(day) {
        if (this.#showEachDayCallback == null) return;

        const $day = $(day);

        const year = $day.attr(eds.year)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));
        const month = $day.attr(eds.month)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));
        const date = $day.attr(eds.date)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));

        if (year != null && month != null && date != null) {
            this.#showEachDayCallback($day, year, month, date, this, this.structure);
        }
    }

    requestCallShowDayCallbacks() {
        this.structure.callShowDayCallbacks();
    }

    setOnSelectionChanged(callback = (dateSet, isWeekly, calendar, structure) => {}) {
        this.#selectionChangedCallback = callback;

        return this;
    }

    onDaySelected($day) {
        const year = $day.attr(eds.year)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));
        const month = $day.attr(eds.month)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));
        const date = $day.attr(eds.date)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));

        if (year != null && month != null && date != null) {
            this.setSelectedDay(year, month, date);
        }
    }

    setOnSelectedDayByUser(callback = async ($day, year, month, date, calendar, structure) => {}) {
        this.#selectedDayByUserCallback = callback;

        return this;
    }

    async onDaySelectedByUser(day) {
        const $day = $(day);

        const year = $day.attr(eds.year)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));
        const month = $day.attr(eds.month)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));
        const date = $day.attr(eds.date)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));

        if (year != null && month != null && date != null) {
            const isHandled = await this.#selectedDayByUserCallback?.($day, year, month, date, this, this.structure);
            if (!isHandled) this.setSelectedDay(year, month, date);
        }
    }

    selectPrevDay() {
        const year = this.focusedYear;
        const month = this.focusedMonth;
        const day = this.focusedDay;

        if (year == null || month == null || day == null) return;

        const month0 = month - 1;

        const date = new Date(year, month0, day);
        date.setDate(date.getDate() - 1);

        this.setSelectedDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    selectNextDay() {
        const year = this.focusedYear;
        const month = this.focusedMonth;
        const day = this.focusedDay;

        if (year == null || month == null || day == null) return;

        const month0 = month - 1;

        const date = new Date(year, month0, day);
        date.setDate(date.getDate() + 1);

        this.setSelectedDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    selectPrevWeekDay() {
        const year = this.focusedYear;
        const month = this.focusedMonth;
        const day = this.focusedDay;

        if (year == null || month == null || day == null) return;

        const month0 = month - 1;

        const date = new Date(year, month0, day);
        date.setDate(date.getDate() - 7);

        this.setSelectedDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    selectNextWeekDay() {
        const year = this.focusedYear;
        const month = this.focusedMonth;
        const day = this.focusedDay;

        if (year == null || month == null || day == null) return;

        const month0 = month - 1;

        const date = new Date(year, month0, day);
        date.setDate(date.getDate() + 7);

        this.setSelectedDay(date.getFullYear(), date.getMonth() + 1, date.getDate());
    }

    setOnCollapseChanged(callback = (collapsed, calendar) => {}) {
        this.#collapsedChangedCallback = callback;

        return this;
    }

    setCollapsed(collapsed) {
        collapsed = !!collapsed;
        this.$bound.attr(eds.collapsed, collapsed ? t1 : "");
        this.#isCollapsed = collapsed;
        this.#collapsedChangedCallback?.(collapsed, this);

        return this;
    }
}

class EstreWeekFloorStructure {
    // constants


    // statics


    // open property
    calendar;

    $structure;

    $weeks;

    // enclosed property


    // getter and setter

    constructor($structure, calendar) {
        this.$structure = $structure;
        this.calendar = calendar;

        this.$weeks = this.$structure.find(c.c + uis.weeks);
    }

    release(remove) {
        this.calendar = null;

        if (remove) this.$structure.remove();
        else if (remove === false) this.$structure.empty();


        this.$structure = null;
    }

    init() {
        return this.resetBound();
    }

    resetBound() {
        const now = new Date();
        const year = this.$structure.attr(eds.boundYear)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) ?? now.getFullYear();
        const month = this.$structure.attr(eds.boundMonth)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it)) ?? (now.getMonth() + 1);
        const week = this.$structure.attr(eds.boundWeek)?.let(it => parseInt(it).let(it => isNaN(it) ? null : it));

        return this.setBound(year, month, week);
    }

    setBound(year, month, week) {
        this.calendar.onSetBound(year, month, week);

        this.$weeks.empty();

        this.$structure.attr(eds.boundYear, year);
        this.$structure.attr(eds.boundMonth, month);
        this.$structure.attr(eds.boundWeek, week ?? "");

        const month0 = month - 1;

        if (week == null) {
            const firstOfNextMonth = Ecal.getNextMonth(year, month);
            const firstTimeOfNextMonth = firstOfNextMonth.getTime();
            const bdw = Ecal.getBeginSundayAndWeek(year, month0);
            const weekOrigin = bdw.week;
            var week = weekOrigin;
            var bds = Ecal.getDateSet(bdw.date);

            do {
                const ymw = bds.ymw;
                const bdy = ymw.year;
                const bdm = ymw.month0;
                const bdw = ymw.week;

                const weekBlock = this.buildWeek(bdy, bdm, bdw, year, month0);
                this.$weeks.append(weekBlock);

                week++;
                bds = Ecal.getDateSetSundayOfWeek(year, month0, week);
            } while (bds.time < firstTimeOfNextMonth);
        } else {
            const weekBlock = this.buildWeek(year, month0, week);
            this.$weeks.append(weekBlock);
        }

        this.callShowDayCallbacks();

        const inst = this;
        this.$structure.find(uis.day).click(function (e) {
            e.preventDefault();

            inst.calendar.onDaySelectedByUser(this);

            return false;
        });

        return this.releaseToday();
    }

    buildWeek(year, month0, week, boundYear = year, boundMonth0 = month0) {
        var dateSet = Ecal.getDateSetSundayOfWeek(year, month0, week);
        const lastDay = Ecal.getDateSet(new Date(dateSet.year, dateSet.month0, dateSet.date + 6));

        const weekBlock = doc.ce(div, "week");
        weekBlock.setAttribute(eds.year, dateSet.year);
        weekBlock.setAttribute(eds.month, dateSet.month);
        weekBlock.setAttribute(eds.week, dateSet.week);
        const daysHolder = doc.ce(div, "days_holder");
        const days = doc.ce(div, "days");

        if (dateSet.year != lastDay.year) weekBlock.setAttribute(eds.boundYear, dateSet.year != boundYear ? dateSet.year : lastDay.year);
        if (dateSet.month != lastDay.month) weekBlock.setAttribute(eds.adjoinMonth, dateSet.month0 != boundMonth0 ? dateSet.month : lastDay.month);
        if (dateSet.week != lastDay.week) weekBlock.setAttribute(eds.adjoinWeek, dateSet.week != week ? dateSet.week : lastDay.week);

        do {
            days.append(this.buildDay(dateSet, year, month0, week));

            dateSet = Ecal.getDateSet(new Date(dateSet.year, dateSet.month0, dateSet.date + 1));
        } while (dateSet.day > 0);
        
        daysHolder.append(days);
        weekBlock.append(daysHolder);

        return weekBlock;
    }

    buildDay(dateSet, boundYear, boundMonth0, boundWeek) {
        const dayBlock = doc.ce(div, "day");
        dayBlock.setAttribute(eds.year, dateSet.year);
        dayBlock.setAttribute(eds.month, dateSet.month);
        dayBlock.setAttribute(eds.week, dateSet.week);
        dayBlock.setAttribute(eds.date, dateSet.date);
        dayBlock.setAttribute(eds.day, dateSet.day);

        if (dateSet.year != boundYear) dayBlock.setAttribute(eds.adjoinYear, dateSet.year);
        if (dateSet.month0 != boundMonth0) dayBlock.setAttribute(eds.adjoinMonth, dateSet.month);
        if (dateSet.week != boundWeek) dayBlock.setAttribute(eds.adjoinWeek, dateSet.week);

        const label = doc.ce(div, "label");
        label.append(doc.ce(lbl, n, dateSet.date));
        dayBlock.append(label);
        const subject = doc.ce(div, "subject");
        subject.append(doc.ce(sp));
        dayBlock.append(subject);
        const scheduled = doc.ce(div, "scheduled");
        const list = doc.ce(ul);
        scheduled.append(list);
        dayBlock.append(scheduled);

        return dayBlock;
    }

    callShowDayCallbacks() {
        const days = this.$weeks.find(uis.day);
        for (const day of days) this.calendar.onShowEachDay(day);
    }

    releaseToday(today = Ecal.getDateSet()) {
        this.$structure.attr(eds.todayYear, today.year);
        this.$structure.attr(eds.todayMonth, today.month);
        this.$structure.attr(eds.todayWeek, today.week);
        this.$structure.attr(eds.todayDay, today.date);

        this.$weeks.find(uis.day + aiv(eds.today, t1)).removeAttr(eds.today);

        const $day = this.$weeks.find(uis.day + aiv(eds.year, today.year) + aiv(eds.month, today.month) + aiv(eds.date, today.date));
        $day.attr(eds.today, t1);

        return today;
    }
}


class EstreMinimalScheduler {
    // constants


    // statics
    

    // open property
    dediCal;
    calendar;

    area
    $area;

    bound;
    $bound;

    $scheduleList;
    scheduleList;

    // enclosed property
    #onShowSelectedDayCallback;


    // getter and setter
    get $scheduleItems() { return this.$scheduleList.find(c.c + uis.scheduleItem); }

    constructor(scheduler, area, calendar, dediCal) {
        this.bound = scheduler;
        this.$bound = $(scheduler);
        this.area = area;
        this.$area = $(area);

        this.dediCal = dediCal;
        this.calendar = calendar;

        this.$scheduleList = this.$bound.find(c.c + uis.minimalScheduleList);
        this.scheduleList = this.$scheduleList[0];
    }

    release(remove) {

        if (remove) this.$bound.remove();
        else if (remove === false) this.$scheduleList.empty();

        this.area = null;
        this.$area = null;

        this.bound = null;
        this.$bound = null;

        this.calendar = null;
        this.dediCal = null;
    }

    init() {
        const $placeholder = this.$scheduleList.find(c.c + uis.placeholder);
        if (this.$scheduleList.attr(eds.frozenPlaceholder) == null) {
            $placeholder.find(".message").html("|message|");
            const solidPlaceholder = $placeholder.length > 0 ? $placeholder[0].stringified() : (new Doctre("div.placeholder", [["span.message", "|message|"]])).toString();
            this.$scheduleList.attr(eds.frozenPlaceholder, solidPlaceholder);
        }

        const message = this.$scheduleList.attr(eds.messageOnNoSelection) ?? "Select a day to view schedule";
        this.scheduleList.melt({ message }, "frozenPlaceholder");

        return this;
    }

    setOnShowSelectedDay(callback = (year, month, date, scheduler, calendar) => {}) {
        this.#onShowSelectedDayCallback = callback;

        return this;
    }

    setDateSelected(year, month, date) {
        const message = this.$scheduleList.attr(eds.messageOnLoading) ?? "Loading schedule...";
        this.scheduleList.melt({ message }, "frozenPlaceholder");
        

        postAsyncQueue(async _ => {
            const documentFragment = await this.#onShowSelectedDayCallback?.(year, month, date, this, this.calendar);
            this.$scheduleList.empty();
            if (documentFragment != null) this.$scheduleList.append(documentFragment);

            if (this.$scheduleItems.length < 1) {
                const message = this.$scheduleList.attr(eds.messageOnNoData) ?? "No schedule available for this day";
                this.scheduleList.melt({ message }, "frozenPlaceholder");
            }
        });
    }

    buildScheduleItem(subject, time, origin, associated, itemAdditionalClass) {
        const item = doc.ce(li, uis.scheduleItem);
        if (itemAdditionalClass != n) kindCase(itemAdditionalClass, {
            [STRING]: _ => item.className += " " + itemAdditionalClass,
            [_ARRAY]: _ => itemAdditionalClass.forEach(cls => item.classList.add(cls)),
        });
        const block = doc.ce(div, uis.schedule);
        const subjectLine = doc.ce(div, "subject_line");
        subjectLine.append(doc.ce(sp, "subject", subject));
        subjectLine.append(doc.ce(sp, "origin", origin ?? ""));
        block.append(subjectLine);
        const timeLine = doc.ce(div, "time_line");
        timeLine.append(doc.ce(sp, "time", time ?? ""));
        timeLine.append(doc.ce(sp, "associated", associated ?? ""));
        block.append(timeLine);
        item.append(block);
        return item;
    }
}



/**
 * Scalable element handler
 */
class EstreScalableHandle extends EstreHandle {
    // constants


    // class property


    // instance property
    $toggle = null;
    $toggleIndic = null;

    maxScale = -1;


    // getter and setter
    #$wind = $(window);
    get $wind() { return this.#$wind };
    get isOnSwipe() { return this.$wind.attr(eds.onSwipe) == t1; };


    constructor(scalable, host) {
        super(scalable, host);
        this.$toggle = this.$bound.find(this.getToggleSpecifier());
        this.$toggleIndic = this.$bound.find(this.getToggleIndicatorSpecifier());
        const maxScale = this.data.maxScale;
        this.maxScale = maxScale == "" ? 0 : parseInt(maxScale);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        this.setEventToggleBtn();

        return this;
    }

    //getter and setter
    getToggleSpecifier() {
        return c.c + uis.toggle + cor + c.c + uis.summary + c.c + uis.toggle;// "> .toggle, > .summary > .toggle"
    }

    getToggleIndicatorSpecifier() {
        return c.c + uis.summary + c.c + uis.toggleBtn;// "> .summary > button.toggle"
    }

    //event handler
    setEventToggleBtn() {
        const inst = this;

        this.$toggle.off("click");

        this.$toggle.click(function(e) {
            if (!inst.isOnSwipe) {
                e.preventDefault();

                inst.toggleScaler();

                return false;
            }
        });
    }
    
    //handles
    toggleScaler() {
        const lookScale = this.data.lookScale;
        const current = lookScale == "" ? 0 : parseInt(lookScale);

        this.setScale(current + 1);
    }

    setScaler(scaler) {
        this.setScale(scaler == "" || isNaN(scaler) ? 0 : parseInt(scaler));
    }

    setScale(scale) {
        if (scale > this.maxScale) {
            if (this.$bound.css(v.scalableMethod) == "vertical") scale = 1;
            else scale = 0;
        }
        this.$bound.attr(eds.lookScale, "" + scale);
    }
}


/**
 * Collapsible element handler
 */
class EstreCollapsibleHandle extends EstreHandle {
    // constants


    // class property

    // instance property
    $toggle = null;
    parent = null;
    $parent = null;
    parentData = null;


    // getter and setter
    #$wind = $(window);
    get $wind() { return this.#$wind };
    get isOnSwipe() { return this.$wind.attr(eds.onSwipe) == t1; };


    constructor(collapsible, host) {
        super(collapsible, host);
        this.$toggle = this.$bound.find(this.getToggleSpecifier());
        const parent = collapsible.parentElement;
        if (parent != null && parent.dataset.contentCollapsed != null) {
            this.parent = parent;
            this.$parent = $(parent);
            this.parentData = parent.dataset;
        }
    }

    release() {
        super.release();
    }

    init() {
        super.init();
        
        this.setEventToggleBtn();

        return this;
    }

    //getter and setter
    getToggleSpecifier() {
        return c.c + uis.toggleBtn;// "> button.toggle"
    }

    //event handler
    setEventToggleBtn($btn) {
        const inst = this;

        this.$toggle.off("click");

        this.$toggle.click(function(e) {
            if (!inst.isOnSwipe) {
                e.preventDefault();

                inst.toggleCollapser();

                return false;
            }
        });

        var $base = this.$bound;
        if (this.parent != null) $base = this.$parent;

        $base.off("click");

        $base.click(function(e) {
            if (!inst.isOnSwipe) {
                e.preventDefault();

                inst.toggleCollapser();

                return false;
            }
        });
        
    }
    
    //handles
    toggleCollapser() {
        const collapsed = this.data.collapsed;
        const nonBasics = this.$bound.find(c.c + uis.notBasicAndToggle);
        var isShowing = false;
        for (var i=0; i<nonBasics.length; i++) {
            const display = $(nonBasics[i]).css("opacity");//$(nonBasics[i]).css("display");
            if (display !== t0) {//"none"
                isShowing = true;
                break;
            }
        }
        this.setCollapsed(isShowing ? (collapsed == t1 ? "" : t1) : t0);
    }

    setCollapsed(collapsed) {
        this.$bound.attr(eds.collapsed, collapsed);
        if (this.parent != null) this.$parent.attr(eds.contentCollapsed, collapsed);
    }
}


/**
 * Toggle block element handler
 */
class EstreToggleBlockHandle extends EstreHandle {
    // constants

    // class property

    // instance property
    $toggle = null;
    parent = null;
    $parent = null;
    parentData = null;


    // getter and setter
    #$wind = $(window);
    get $wind() { return this.#$wind; };
    get isOnSwipe() { return this.$wind.attr(eds.onSwipe) == t1; };


    constructor(toggleBlock, host) {
        super(toggleBlock, host);
        this.$toggle = this.$bound.find(this.getToggleSpecifier());
        const parent = toggleBlock.parentElement;
        if (parent != null && parent.dataset.contentCollapsed != null) {
            this.parent = parent;
            this.$parent = $(parent);
            this.parentData = parent.dataset;
            if (this.$toggle == null) this.$toggle = this.$parent.find(this.getToggleSpecifier());
        }
    }

    release(remove) {
        this.$toggle = null;
        this.parent = null;
        this.$parent = null;
        this.parentData = null;

        super.release(remove);
    }

    init() {
        super.init();
        
        this.setEventToggleBtn();

        return this;
    }

    //getter and setter
    getToggleSpecifier() {
        return c.c + uis.toggleBtn + cor + c.c + uis.basic + c.c + uis.toggleBtn;// " > button.toggle, > .basic > button.toggle"
    }

    isCollapsed() {
        return this.data.collapsed == t1;
    }

    //event handler
    setEventToggleBtn($btn) {
        const inst = this;

        this.$toggle.off("click");

        this.$toggle.click(function(e) {
            if (!inst.isOnSwipe) {
                e.preventDefault();

                inst.toggleCollapser();

                return false;
            }
        });

        var $base = this.$bound;
        if (this.parent != null) $base = this.$parent;

        $base.off("click");

        $base.click(function(e) {
            if (!inst.isOnSwipe) {
                e.preventDefault();

                inst.toggleCollapser();

                return false;
            }
        });

    }
    
    //handles
    toggleCollapser() {
        const collapsed = this.data.collapsed;
        this.setCollapsed(collapsed == t1 ? t0 : t1);
    }

    setCollapsed(collapsed) {
        this.$bound.attr(eds.collapsed, collapsed);
        if (this.parent != null) this.$parent.attr(eds.contentCollapsed, collapsed);
    }
}


/**
 * Toggle tab block element handler
 */
class EstreToggleTabBlockHandle extends EstreToggleBlockHandle {
    // constants


    // class property

    // instance property
    $ttb = null;
    $tabSet = null;
    $tabs = null;

    $ssb = null;
    $subjects = null;

    $tcb = null;
    $contents = null;


    swipeHandler = null;

    
    //getter and setter
    get $tabs() {
        return this.$tabSet.find(c.c + li + ax(eds.tabId));
    }

    get selected() {
        return parseInt(this.$tabSet.find(c.c + li + ax(eds.tabId) + aiv(eds.tabSelected, t1)).attr(eds.tabId));
    }


    constructor(toggleTabBlock, host) {
        super(toggleTabBlock, host);
    }

    release(remove) {
        this.releaseSwipeHandler();

        this.$ttb = null;
        this.$tabSet = null;
        this.$tabs = null;

        this.$ssb = null;
        this.$subjects = null;

        this.$tcb = null;
        this.$contents = null;

        super.release(remove);
    }

    init() {
        super.init();
        this.initTab();

        return this;
    }

    initTab() {
        this.$ttb = this.$bound.find(c.c + uis.titledTabBlock);
        this.$tabSet = this.$ttb.find(c.c + uis.tabSet);
        this.$tabs = this.$tabSet.find(c.c + li);

        this.$ssb = this.$bound.find(c.c + uis.slidingSubjectBlock);
        this.$subjects = this.$ssb.find(c.c + div);

        this.$tcb = this.$bound.find(c.c + uis.tabContentBlocks);
        this.$contents = this.$tcb.find(c.c + div);

        this.initTabSelection();
        this.setEventTabItems();
        this.setSwipeHandler();
    }

    initTabSelection() {
        var selected = this.$bound.attr(eds.beginTab);

        if (selected == null || selected == "") {
            const list = this.$tabs.toArray();
            var s = 0;
            while (list.length > 1) {
                if (s % 2 == 0) list.splice(-1);
                else list.shift();
                s++;
            }
            selected = $(list[0]).attr(eds.tabId);
        }

        this.selectTab(selected, true);
    }

    //getter and setter
    getToggleSpecifier() {
        return c.c + uis.titledTabBlock + c.c + uis.toggleBtn;// "> .titled_tab_block > button.toggle"
    }

    //event handler
    setEventTabItems() {
        const inst = this;

        this.$tabs.off("click");

        this.$tabs.click(function(e) {
            e.preventDefault();

            inst.selectTab($(this).attr(eds.tabId));

            return false;
        });
    }

    releaseSwipeHandler() {
        if (this.swipeHandler != null) this.swipeHandler.release();
    }

    setSwipeHandler() {
        this.releaseSwipeHandler();
        const inst = this;
        const applyToSSB = this.$ssb.length > 0;
        const $feedbackTarget = applyToSSB ? this.$subjects : this.$contents;
        this.swipeHandler = new EstreSwipeHandler(this.$tcb).unuseY().setResponseBound(applyToSSB ? this.$ssb : this.$tcb).setOnUp(function(grabX, grabY, handled, canceled, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / canceled: " + canceled + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            if (handled) {
                const isNext = grabX < 0;
                setTimeout(_ => {
                    if (isNext) inst.selectNextTab();
                    else inst.selectPrevTab();
                }, 0);
                return { delay: cvt.t2ms($feedbackTarget.filter(naiv(eds.slide, t1)).css(a.trdr)), callback: () => setTimeout(_ => $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null), 0) };
            } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
        }).setOnMove(function(grabX, grabY, handled, dropped, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / dropped: " + dropped + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            const isNext = grabX < 0;
            if (grabX !== 0) {
                const targetId = isNext ? inst.getNextTabId() : inst.getPrevTabId();
                if (targetId != inst.selected) {
                    $feedbackTarget.filter(ax(eds.slide) + naiv(eds.tabId, targetId)).attr(eds.slide, null);
                    $feedbackTarget.filter(aiv(eds.tabId, targetId)).attr(eds.slide, t1);
                } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
            } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
        });

    }


    //commons
    getTabs($tabs = this.$tabs) {
        const tabs = [];
        for (var tab of $tabs) tabs[parseInt($(tab).attr(eds.tabId))] = tab;
        return tabs;
    }


    //handles
    selectTab(id, isInit) {
        const intId = parseInt(id);
        if (id != null && id != "" && !isNaN(id) && intId > 0 && intId <= this.$tabs.length) {
            this.applyTabSelected(id);
            this.applySubjectSelected(id);
            this.applyContentSelected(id);

            if (!isInit && this.isCollapsed) this.setCollapsed(t0);
        }
    }

    getPrevTabId() {
        const tabs = this.getTabs();
        const selected = this.selected;
        
        const target = selected - 1;
        if (window.isVerbosely) console.log("selectPrevTab - current: " + selected + ", target: " + target);
        return target > -1 ? target : 0;
    }

    selectPrevTab() {
        const target = this.getPrevTabId();
        if (target != this.selected) this.selectTab(target);
    }

    getNextTabId() {
        const tabs = this.getTabs();
        const selected = this.selected;
        
        const target = selected + 1;
        if (window.isVerbosely) console.log("selectNextTab - current: " + selected + ", target: " + target);
        return target < tabs.length ? target : tabs.length - 1;
    }

    selectNextTab() {
        const target = this.getNextTabId();
        if (target != this.selected) this.selectTab(target);
    }

    applyTabSelected(id) {
        this.$tabs.filter(obk + eds.tabId + equ + v4(id) + cbk).attr(eds.tabSelected, t1);
        this.$tabs.filter(nto + obk + eds.tabId + equ + v4(id) + cbk + cps).attr(eds.tabSelected, "");
    }

    applySubjectSelected(id) {
        this.$subjects.filter(obk + eds.tabId + equ + v4(id) + cbk).attr(eds.tabSelected, t1);
        this.$subjects.filter(nto + obk + eds.tabId + equ + v4(id) + cbk + cps).attr(eds.tabSelected, "");
    }

    applyContentSelected(id) {
        this.$contents.filter(obk + eds.tabId + equ + v4(id) + cbk).attr(eds.tabSelected, t1);
        this.$contents.filter(nto + obk + eds.tabId + equ + v4(id) + cbk + cps).attr(eds.tabSelected, "");
    }
    
}



/**
 * Tab block element handler
 */
class EstreTabBlockHandle extends EstreHandle {
    // constants


    // class property

    // instance property
    $ttb = null;
    $tabSet = null;
    $tabs = null;

    $ssb = null;
    $subjects = null;

    $tcb = null;
    $contents = null;


    swipeHandler = null;

    
    //getter and setter
    get $tabs() {
        return this.$tabSet.find(c.c + li + ax(eds.tabId));
    }

    get selected() {
        return parseInt(this.$tabSet.find(c.c + li + ax(eds.tabId) + aiv(eds.tabSelected, t1)).attr(eds.tabId));
    }


    constructor(tabBlock, host) {
        super(tabBlock, host);

        this.$ttb = this.$bound.find(c.c + uis.titledTabBlock);
        this.$tabSet = this.$ttb.find(c.c + uis.tabSet);
        this.$tabs = this.$tabSet.find(c.c + li);

        this.$ssb = this.$bound.find(c.c + uis.slidingSubjectBlock);
        this.$subjects = this.$ssb.find(c.c + div);

        this.$tcb = this.$bound.find(c.c + uis.tabContentBlocks);
        this.$contents = this.$tcb.find(c.c + div);
    }

    release(remove) {
        this.releaseSwipeHandler();

        this.$ttb = null;
        this.$tabSet = null;
        this.$tabs = null;

        this.$ssb = null;
        this.$subjects = null;

        this.$tcb = null;
        this.$contents = null;

        super.release(remove);
    }

    init() {
        super.init();

        this.initTabSelection();
        this.setEventTabItems();
        this.setSwipeHandler();

        return this;
    }

    initTabSelection() {
        var selected = this.$bound.attr(eds.beginTab);

        if (selected == null || selected == "") {
            const list = this.$tabs.toArray();
            var s = 0;
            while (list.length > 1) {
                if (s % 2 == 0) list.splice(-1);
                else list.shift();
                s++;
            }
            selected = $(list[0]).attr(eds.tabId);
        }

        this.selectTab(selected, true);
    }

    //event handler
    setEventTabItems() {
        const inst = this;

        this.$tabs.off("click");

        this.$tabs.click(function(e) {
            e.preventDefault();

            inst.selectTab($(this).attr(eds.tabId));

            return false;
        });
    }

    releaseSwipeHandler() {
        if (this.swipeHandler != null) this.swipeHandler.release();
    }

    setSwipeHandler() {
        this.releaseSwipeHandler();
        const inst = this;
        const applyToSSB = this.$ssb.length > 0;
        const $feedbackTarget = applyToSSB ? this.$subjects : this.$contents;
        this.swipeHandler = new EstreSwipeHandler(this.$tcb).unuseY().setResponseBound(applyToSSB ? this.$ssb : this.$tcb).setOnUp(function(grabX, grabY, handled, canceled, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / canceled: " + canceled + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            if (handled) {
                const isNext = grabX < 0;
                setTimeout(_ => {
                    if (isNext) inst.selectNextTab();
                    else inst.selectPrevTab();
                }, 0);
                return { delay: cvt.t2ms($feedbackTarget.filter(naiv(eds.slide, t1)).css(a.trdr)), callback: () => setTimeout(_ => $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null), 0) };
            } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
        }).setOnMove(function(grabX, grabY, handled, dropped, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / dropped: " + dropped + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            const isNext = grabX < 0;
            if (grabX !== 0) {
                const targetId = isNext ? inst.getNextTabId() : inst.getPrevTabId();
                if (targetId != inst.selected) {
                    $feedbackTarget.filter(ax(eds.slide) + naiv(eds.tabId, targetId)).attr(eds.slide, null);
                    $feedbackTarget.filter(aiv(eds.tabId, targetId)).attr(eds.slide, t1);
                } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
            } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
        });

    }


    //commons
    getTabs($tabs = this.$tabs) {
        const tabs = [];
        for (var tab of $tabs) tabs[parseInt($(tab).attr(eds.tabId))] = tab;
        return tabs;
    }


    //handles
    selectTab(id, isInit = false) {
        const intId = parseInt(id);
        if (id != null && id != "" && !isNaN(id) && intId > 0 && intId <= this.$tabs.length) {
            this.applyTabSelected(id);
            this.applySubjectSelected(id);
            this.applyContentSelected(id);
            this.notifyTabSelected(id, isInit);
        }
    }

    getPrevTabId() {
        const tabs = this.getTabs();
        const selected = this.selected;
        
        const target = selected - 1;
        if (window.isVerbosely) console.log("selectPrevTab - current: " + selected + ", target: " + target);
        return target > -1 ? target : 0;
    }

    selectPrevTab() {
        const target = this.getPrevTabId();
        if (target != this.selected) this.selectTab(target);
    }

    getNextTabId() {
        const tabs = this.getTabs();
        const selected = this.selected;
        
        const target = selected + 1;
        if (window.isVerbosely) console.log("selectNextTab - current: " + selected + ", target: " + target);
        return target < tabs.length ? target : tabs.length - 1;
    }

    selectNextTab() {
        const target = this.getNextTabId();
        if (target != this.selected) this.selectTab(target);
    }

    applyTabSelected(id) {
        this.$tabs.filter(obk + eds.tabId + equ + v4(id) + cbk).attr(eds.tabSelected, t1);
        this.$tabs.filter(nto + obk + eds.tabId + equ + v4(id) + cbk + cps).attr(eds.tabSelected, "");
    }

    applySubjectSelected(id) {
        this.$subjects.filter(obk + eds.tabId + equ + v4(id) + cbk).attr(eds.tabSelected, t1);
        this.$subjects.filter(nto + obk + eds.tabId + equ + v4(id) + cbk + cps).attr(eds.tabSelected, "");
    }

    applyContentSelected(id) {
        this.$contents.filter(obk + eds.tabId + equ + v4(id) + cbk).attr(eds.tabSelected, t1);
        this.$contents.filter(nto + obk + eds.tabId + equ + v4(id) + cbk + cps).attr(eds.tabSelected, "");
    }

    notifyTabSelected(id, isInit) {
        //do nothing (for derived class)
    }
    
}


/**
 * Scoped Tab block element handler
 * 
 * is only construct by scope handler
 */
class EstreScopedTabBlock extends EstreTabBlockHandle {
    // constants


    // class property

    // instance property
    handler = null;

    boundSwipeHandler = null;

    $contentScope = {};

    $pageHandles = null;
    $toPrevPage = null;
    $toNextPage = null;

    constructor(scopedTabBlock, scopeHandler) {
        super(scopedTabBlock);

        this.handler = scopeHandler;

    }

    release(remove) {
        this.handler = null;

        this.$contentScope = null;

        this.$pageHandles = null;
        this.$toPrevPage = null;
        this.$toNextPage = null;
        super.release(remove);
    }

    init() {
        super.init();

        this.initScope();
        this.initPager();

        return this;
    }

    initScope() {
        for (var scope of this.$contents) {
            const $scope = $(scope);
            this.$contentScope[$scope.attr(eds.scope)] = $scope;
        }

        this.initScopes();
    }

    initScopes() {
        for (var scope in this.$contentScope) {
            const $content = this.$contentScope[scope];
            const $title = this.$subjects.filter(aiv(eds.scope, scope));
            const titleSpan = $title.find(sp);
            $content.find(c.c + uis.boundHost).attr(eds.bound, "");
            this.handler.registerScope($content, scope, titleSpan[0]);
        }

        this.handler.requestInitScopes();
    }

    initPager() {
        this.$pageHandles = this.$ssb.find(uis.pageHandle);
        this.$toPrevPage = this.$pageHandles.filter(aiv(eds.direction, "prev"));
        this.$toNextPage = this.$pageHandles.filter(aiv(eds.direction, "next"));


        this.setPagerEvent();
    }    

    setPagerEvent() {
        const inst = this;

        this.$toPrevPage.click(function (e) {
            e.preventDefault();

            inst.showPagePrev();

            return false;
        });
        this.$toNextPage.click(function (e) {
            e.preventDefault();

            inst.showPageNext();

            return false;
        });
    }

    releaseSwipeHandler() {
        if (this.swipeHandler != null) this.swipeHandler.release();
        if (this.boundSwipeHandler != null) this.boundSwipeHandler.release();
    }

    setSwipeHandler() {
        this.releaseSwipeHandler();
        const inst = this;
        const $feedbackTarget = this.$subjects;
        this.swipeHandler = new EstreSwipeHandler(this.$ssb).unuseY().setResponseBound(this.$ssb).setOnUp(function(grabX, grabY, handled, canceled, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / canceled: " + canceled + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            if (handled) {
                const isNext = grabX < 0;
                setTimeout(_ => {
                    if (isNext) inst.selectNextTab();
                    else inst.selectPrevTab();
                }, 0);
                return { delay: cvt.t2ms($feedbackTarget.filter(naiv(eds.slide, t1)).css(a.trdr)), callback: () => setTimeout(_ => $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null), 0) };
            } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
        }).setOnMove(function(grabX, grabY, handled, dropped, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / dropped: " + dropped + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            const isNext = grabX < 0;
            if (grabX !== 0) {
                const targetId = isNext ? inst.getNextTabId() : inst.getPrevTabId();
                if (targetId != inst.selected) {
                    $feedbackTarget.filter(ax(eds.slide) + naiv(eds.tabId, targetId)).attr(eds.slide, null);
                    $feedbackTarget.filter(aiv(eds.tabId, targetId)).attr(eds.slide, t1);
                } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
            } else $feedbackTarget.filter(ax(eds.slide)).attr(eds.slide, null);
        });

        this.boundSwipeHandler = new EstreSwipeHandler(this.$tcb).unuseY().setResponseBound(this.$tcb).setOnUp(function(grabX, grabY, handled, canceled, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / canceled: " + canceled + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            const $boundHosts = inst.getCurrentContentScope().find(c.c + uis.boundHost);
            if (handled) {
                const isNext = grabX < 0;
                setTimeout(_ => {
                    if (isNext) inst.showPageNext();
                    else inst.showPagePrev();
                }, 0);
                return { delay: cvt.t2ms($boundHosts.filter(naiv(eds.slide, t1)).css(a.trdr)), callback: () => setTimeout(_ => $boundHosts.filter(ax(eds.slide)).attr(eds.slide, null), 0) };
            } else $boundHosts.filter(ax(eds.slide)).attr(eds.slide, null);
        }).setOnMove(function(grabX, grabY, handled, dropped, directed) {
            if (window.isVerbosely) console.log("handled: " + handled + " / dropped: " + dropped + " / directed: " + directed + " / grab: " + grabX + ", " + grabY + " / lastX: " + this.lastX + ", " + this.lastY + " / startX: " + this.startX + ", " + this.startY);
            const $boundHosts = inst.getCurrentContentScope().find(c.c + uis.boundHost);
            const isNext = grabX < 0;
            if (grabX !== 0) {
                const targetIndex = isNext ? $boundHosts.length - 1 : 0;
                for (var i=0; i<$boundHosts.length; i++) {
                    const $boundHost = $($boundHosts[i]);
                    if ($boundHost.is(ax(eds.slide)) && i != targetIndex) $boundHost.attr(eds.slide, null);
                }
                $($boundHosts[targetIndex]).attr(eds.slide, t1);
            } else $boundHosts.filter(ax(eds.slide)).attr(eds.slide, null);
        });

    }


    getCurrentScope($content = this.getCurrentContentScope()) {
        return $content.attr(eds.scope);
    }

    getCurrentContentScope() {
        return this.$contents.filter(aiv(eds.tabSelected, t1));
    }

    selectScope(scope) {
        const $content = this.$contentScope[scope];
        if ($content != null) {
            const tabId = $content.attr(eds.tabId);
            this.selectTab(tabId, null);
        }
    }


    showPagePrev(byHandler = false, scope = this.getCurrentScope()) {
        this.shiftPage(scope, -1, byHandler);
    }

    showPageNext(byHandler = false, scope = this.getCurrentScope()) {
        this.shiftPage(scope, 1, byHandler);
    }

    shiftPage(scope, offset, byHandler = false) {
        const isBackward = offset < 0;
        const $content = this.$contentScope[scope];
        const preload = $content.attr(eds.preload) == t1;
        const pages = $content.find(c.c + c.w);

        pages.filter(aiv(eds.pageSelected, t1)).attr(eds.pageSelected, "");

        const $selected = $(pages[isBackward ? 0 : pages.length - 1]);
        const selectedBound = $selected.attr(eds.bound);
        $selected.attr(eds.pageSelected, t1);
        if (!preload) this.handler.requestPushDataForPage($selected, scope, selectedBound, 0);

        const $forRecycle = $(pages[isBackward ? pages.length - 1 : 0]);
        this.handler.boundHasGone($forRecycle.attr(eds.bound), scope);
        $forRecycle.remove();
        $forRecycle.attr(eds.bound, "");
        if (isBackward) $content.prepend($forRecycle);
        else $content.append($forRecycle);
        if (preload) this.handler.requestPushDataForPage($forRecycle, scope, selectedBound, offset, true);

        if (!byHandler) this.handler.notifyBoundChanged(selectedBound, scope);
    }

    notifyTabSelected(id, isInit = false) {
        super.notifyTabSelected(id, isInit);

        const $content = this.$contents.filter(obk + eds.tabId + equ + v4(id) + cbk);
        const scope = $content.attr(eds.scope);
        this.handler.notifyScopeChanged(scope);
    }
}



/**
 * Estre dynamic section block handle
 */
class EstreDynamicSectionBlockHandle extends EstreHandle {

    // constants

    // statics

    // open property
    $dynamicSectionHost;
    $hostItems;

    $blockItems;
    
    // enclosed property

    // getter and setter


    constructor(dynamicSectionBlock, host) {
        super(dynamicSectionBlock, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        this.$dynamicSectionHost = this.host.$host.find(uis.dynamicSectionHost);
        this.$hostItems = this.$dynamicSectionHost.find(uis.hostItem);

        this.$blockItems = this.$bound.find(uis.blockItem);

        this.setEvent();

        return this;
    }

    setEvent() {
        const inst = this;

        this.$hostItems.click(function (e) {
            e.preventDefault();

            const id = this.dataset.id;
            inst.$blockItems.filter(aiv(eds.id, id))[0].scrollIntoView({ behavior: "smooth", block: "start" });

            return false;
        });

        const rootMargin = this.$bound.attr(eds.intersectionRootMargin)?.ifEmpty(it => n) ?? "0px";
        const threshold = this.$bound.attr(eds.intersectionThreshold)?.ifEmpty(it => n, it => parseFloat(it)) ?? 0.45;

        const biio = new IntersectionObserver(entries => {
            for (const entry of entries) {
                const id = entry.target.dataset.id;
                const isShowing = entry.isIntersecting ? t1 : "";
                this.$hostItems.filter(aiv(eds.id, id)).attr(eds.showing, isShowing);
                this.host.$host.attr(eds.showing + hp + id, isShowing);
            }
        }, {
            root: this.bound,
            rootMargin,
            threshold
        });

        for (const item of this.$blockItems) biio.observe(item);
    }
}


/**
 * Estre number keypad handler
 */
class EstreNumKeypadHandle extends EstreHandle {

    // constants
    get onTrigger() { return new CustomEvent("trigger"); }

    // statics


    // open property

    
    // enclosed property
    #$input = null;
    #input = null;
    #$keys = null;
    #keys = [];
    #key = {};

    lengthLimit = null;
    autoDivider = null;
    autoDividerPos = null;


    // getter and setter



    constructor(numKeypad, host) {
        super(numKeypad, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        const inputId = this.$bound.attr(eds.for);
        if (inputId == null || inputId == "") return null;

        this.#input = doc.ebi(inputId);
        this.#$input = $(this.#input);

        const lengthLimit = this.$bound.attr("data-limit-length");
        if (lengthLimit != null && lengthLimit != "" && !isNaN(lengthLimit)) {
            this.lengthLimit = parseInt(lengthLimit);
        }

        const autoDivider = this.$bound.attr("data-auto-divider");
        if (autoDivider != null && autoDivider != "") {
            this.autoDivider = autoDivider;
        }
        const autoDividerPos = this.$bound.attr("data-auto-divider-pos");
        if (autoDividerPos != null && autoDividerPos != "") {
            const poses = autoDividerPos.split(",");
            const posesInt = [];
            for (var pos of poses) if (!isNaN(pos)) posesInt.push(parseInt(pos));
            this.autoDividerPos = posesInt;
        }


        this.#$keys = this.$bound.find("button");
        for (var key of this.#$keys) {
            this.#keys.push(key);
            const type = key.dataset.type;
            switch (type) {
                case "number":
                    this.#key[key.dataset.number] = key;
                    break;

                case "action":
                    this.#key[key.dataset.action] = key;
                    break;
                    
            }
        }

        this.setEvent();

        return this;
    }

    setEvent() {
        const inst = this;

        if (this.$bound.attr("data-prevent-direct") == t1) this.#$input.focus(function(e) {
            e.preventDefault();
            this.blur();
            return false; 
        });
        this.#$input.on("input paste cut propertychange change", function(e) {
            const value = this.value;
            const length = value.length;

            if (inst.lengthLimit != null) {
                if (length > inst.lengthLimit) {
                    this.value = value.substr(0, inst.lengthLimit);
                    return false;
                }
            }

            if (inst.autoDivider != null && inst.autoDividerPos != null && inst.autoDividerPos.length > 0) {
                for (var pos of inst.autoDividerPos) if (pos == length) {
                    try {
                        this.value += inst.autoDivider;
                    } catch (ex) {
                        if (window.isLogging) console.error(ex.name + "\n" + ex.message);
                    }
                }
            }

        });
        
        this.#$keys.click(function(e) {
            const input = inst.#input;
            var changed = false;
            switch (this.dataset.type) {
                case "number":
                    input.value += this.dataset.number;
                    changed = true;
                    break;

                case "action":
                    switch (this.dataset.action) {
                        case "CLR":
                            input.value = "";
                            changed = true;
                            break;

                        case "BS":
                            const val = input.value;
                            let back = 1;
                            if (inst.autoDivider != null) {
                                const dividerLength = inst.autoDivider.length;
                                if (val.substr(dividerLength * -1) == inst.autoDivider) back += dividerLength;
                            }
                            input.value = val.substring(0, val.length - back);
                            changed = true;
                            break;

                        case "ENTER":
                            input.trigger({ type: "keypress", which: 13, keyCode: 13 });
                            break;
                    }
                    break;
            }
            if (changed) input.dispatchEvent(new Event("change"));
        });
    }

}



/**
 * Estre checkbox set handler
 */
class EstreCheckboxSetHandle extends EstreHandle {

    // constants


    // statics


    // open property
    name = null;
    selection = null;
    
    // enclosed property


    // getter and setter
    $checkboxes = null;


    constructor(checkboxSet, host) {
        super(checkboxSet, host);
    }

    release(remove) {
        super.release(remove);
    }

    init() {
        super.init();

        this.name = this.$bound.attr(eds.name);
        const selection = this.$bound.attr(eds.checkboxSelection);
        if (selection == null || isNaN(selection)) this.selection = 0;
        else this.selection = parseInt(selection);

        this.$checkboxes = this.$bound.find(inp + aiv("type", "checkbox") + aiv("name", this.name));

        this.setEvent();

        return this;
    }

    setEvent() {
        const inst = this;
        
        this.$checkboxes.change(function (e) {
            if (inst.selection === 1) {
                for (const checkbox of inst.$checkboxes) if (checkbox != this) checkbox.checked = false;
            } else if (inst.selection > 1) {
                if (inst.$checkboxes.filter(":checked").length >= inst.selection) inst.$checkboxes.filter(":not(:checked)").prop("disabled", true);
                else inst.$checkboxes.filter(":disabled").prop("disabled", false);
            }
        });
    }
}

/**
 * Estre checkbox ally handler
 */
class EstreCheckboxAllyHandle extends EstreHandle {

    // constants


    // statics


    // open property
    ally = null;
    name = null;
    
    // enclosed property


    // getter and setter
    $checkboxAlly = null;
    $checkboxes = null;


    constructor(checkboxAlly, host) {
        super(checkboxAlly, host);
    }

    release(remove) {
        super.release(remove);
    }

    init() {
        super.init();

        this.ally = this.$bound.attr(eds.ally);
        this.name = this.$bound.attr(eds.name);

        this.$checkboxAlly = this.$bound.find(inp + aiv("type", "checkbox") + aiv("name", this.ally));
        this.$checkboxes = this.$bound.find(inp + aiv("type", "checkbox") + aiv("name", this.name));

        this.setEvent();
    }

    setEvent() {
        const inst = this;

        this.$checkboxAlly.change(function (e) {
            inst.$checkboxes.prop("checked", this.checked).change();
        });
        
        this.$checkboxes.change(function (e) {
            const isAlly = inst.$checkboxes.filter(":checked").length == inst.$checkboxes.length;
            inst.$checkboxAlly.prop("checked", isAlly);
        });
    }
}


/**
 * Multi dial slot handle
 */
class EstreMultiDialSlotHandle extends EstreHandle {

    // constants


    // statics


    // open property
    $dialHolder;
    dialHolder;
    $dialBounds;
    $dialHosts;
    $dialPrefixes;
    $dialSuffixes;
    $dialDividers;


    // enclosed property
    #itemTableOrigin = [];
    #itemAlignsOrigin = [];
    #itemPrefixesOrigin = [];
    #itemSuffixesOrigin = [];
    #itemDividersOrigin = [];

    #itemSelectionObserver = [];
    #itemTableProxy = [];

    #itemTable;
    #itemAligns;
    #itemPrefixes;
    #itemSuffixes;
    #itemDividers;

    #initialItemSelectionIndexes = [];
    #itemSelectionIndexes = [];
    #itemSelectionValues = [];

    #itemSelectionIndexesProxy = [];
    #itemSelectionValuesProxy = [];

    #onSelectionChanged;

    #isInit = f;
    

    // getter and setter
    get itemTable() { return this.#itemTable; }
    set itemTable(value) { this.updateItemTable(value); }
    get itemAligns() { return this.#itemAligns; }
    set itemAligns(value) { this.updateItemAligns(value); }
    get itemPrefixes() { return this.#itemPrefixes; }
    set itemPrefixes(value) { this.updateItemPrefixes(value); }
    get itemSuffixes() { return this.#itemSuffixes; }
    set itemSuffixes(value) { this.updateItemSuffixes(value); }
    get itemDividers() { return this.#itemDividers; }
    set itemDividers(value) { this.updateItemDividers(value); }

    get dataset() { return new Proxy({
        table: this.#itemTable,
        aligns: this.#itemAligns,
        prefixes: this.#itemPrefixes,
        suffixes: this.#itemSuffixes,
        dividers: this.#itemDividers,
    }, {
        set: (target, property, value) => {
            equalCase(property, {
                table: _ => this.updateItemTable(value),
                aligns: _ => this.updateItemAligns(value),
                prefixes: _ => this.updateItemPrefixes(value),
                suffixes: _ => this.updateItemSuffixes(value),
                dividers: _ => this.updateItemDividers(value),
                [def]: _ => target[property] = value,
            });
            return true;
        }
    }); }
    set dataset(value) { this.setDataset(value); }

    get itemSelectionIndexes() { return this.#itemSelectionIndexesProxy; }
    set itemSelectionIndexes(value) { this.#setSelectionIndexes(value); }
    get itemSelectionValues() { return this.#itemSelectionValuesProxy; }
    set itemSelectionValues(value) { this.#setSelectionValues(value); }
    get itemSelections() {
        const selections = [];
        for (let i=0; i<this.#itemSelectionIndexes.length; i++) {
            selections.push([this.#itemSelectionIndexes[i], this.#itemSelectionValues[i]]);
        }
        return selections;
    }


    constructor(multiDialSlot, host) {
        super(multiDialSlot, host);
    }

    release(remove) {
        super.release(remove);
    }

    init() {
        super.init();
        
        this.$dialHolder = this.$bound.find(uis.dialHolder);
        this.dialHolder = this.$dialHolder[0];
        this.$dialBounds = this.$dialHolder.find(uis.dialBound);
        this.$dialHosts = this.$dialBounds.find(uis.dialHost);

        this.$dialHosts[0].solid();
        const divider = this.$dialHolder.find(li + cls + c.divider).stringified();
        this.$dialHolder.attr("data-frozen-divider", divider);
        this.$dialHolder[0].solid();

        this.loadDataset();
    }

    loadDataset() {
        try {
            const dataItemTable = this.$bound.attr(eds.itemTable);
            if (nne(dataItemTable)) this.#itemTableOrigin = Jcodd.parse(dataItemTable);
        } catch (e) {
            if (window.isLogging) console.error(e);
        }

        try {
            const dataInitial = this.$bound.attr(eds.initial);
            if (nne(dataInitial)) this.#itemSelectionIndexes = Jcodd.parse(dataInitial);
        } catch (e) {
            if (window.isLogging) console.error(e);
        }
        
        try {
            const dataItemAligns = this.$bound.attr(eds.itemAligns);
            if (nne(dataItemAligns)) this.#itemAlignsOrigin = Jcodd.parse(dataItemAligns);
        } catch (e) {
            if (window.isLogging) console.error(e);
        }

        try {
            const dataItemPrefixes = this.$bound.attr(eds.itemPrefixes);
            if (nne(dataItemPrefixes)) this.#itemPrefixesOrigin = Jcodd.parse(dataItemPrefixes);
        } catch (e) {
            if (window.isLogging) console.error(e);
        }

        try {
            const dataItemSuffixes = this.$bound.attr(eds.itemSuffixes);
            if (nne(dataItemSuffixes)) this.#itemSuffixesOrigin = Jcodd.parse(dataItemSuffixes);
        } catch (e) {
            if (window.isLogging) console.error(e);
        }

        try {
            const dataItemDividers = this.$bound.attr(eds.itemDividers);
            if (nne(dataItemDividers)) this.#itemDividersOrigin = Jcodd.parse(dataItemDividers);
        } catch (e) {
            if (window.isLogging) console.error(e);
        }

        this.updateAll();
    }

    get$dialHost(boundIndex) {
        return this.$dialHosts[boundIndex]?.let(it => $(it));
    }

    getDialItems(boundIndex) {
        return this.get$dialHost(boundIndex).find(c.c + li);
    }

    setDataset(dataset = { table: [[]], initial: [], aligns: [], prefixes: [], suffixes: [], dividers: [] }) {
        this.#itemTableOrigin = dataset.table;
        this.#itemSelectionIndexes = dataset.initial;
        this.#itemAlignsOrigin = dataset.aligns;
        this.#itemPrefixesOrigin = dataset.prefixes;
        this.#itemSuffixesOrigin = dataset.suffixes;
        this.#itemDividersOrigin = dataset.dividers;
        this.updateAll();
    }

    updateAll() {
        this.updateItemTable();
        this.updateItemAligns();
        this.updateItemPrefixes();
        this.updateItemSuffixes();
        this.updateItemDividers();
    }

    updateItemTable(itemTable = this.#itemTableOrigin, itemSelectionIndexes = this.#itemSelectionIndexes) {
        const isInit = this.#isInit;
        if (!isInit) this.#isInit = t;

        itemTable ??= [];
        const isNew = itemTable != this.#itemTableOrigin;
        if (isNew) {
            this.#itemTableOrigin = itemTable;
            this.#itemTableProxy = [];
            this.#itemSelectionObserver = [];
        }

        if (itemSelectionIndexes.length != itemTable.length) {
            itemSelectionIndexes = [];
            for (let i=itemSelectionIndexes.length; i<itemTable.length; i++) itemSelectionIndexes[i] = 0;
        }
        if (itemSelectionIndexes != this.#itemSelectionIndexes) this.#itemSelectionIndexes = itemSelectionIndexes;
        this.#itemSelectionIndexesProxy = new Proxy(itemSelectionIndexes, {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                if (isIndex) this.#scrollInstant(this.getDialItems(index)[value]);
                else target[property] = value;
                return true;
            }
        });

        const itemSelectionValues = []
        this.#itemSelectionValues = itemSelectionValues;
        for (const [index, i] of itemSelectionIndexes.entries()) {
            const value = this.#itemTableOrigin[index]?.[i];
            this.#itemSelectionValues[index] = value;
        }
        this.#itemSelectionValuesProxy = new Proxy(itemSelectionValues, {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                if (isIndex) {
                    const itemIndex = this.#itemTableOrigin[index]?.indexOf(value);
                    if (itemIndex > -1) this.#scrollInstant(this.getDialItems(index)[itemIndex]);
                } else target[property] = value;
                return true;
            }
        });

        this.$dialHolder.empty();
        this.dialHolder.worm({ offset: 0 }, c.frozenDivider);
        for (var [index, list] of itemTable.entries()) {
            this.dialHolder.worm({ boundIndex: index });
            this.dialHolder.worm({ offset: index + 1 }, c.frozenDivider);
        }
        const updateBoundLinks = _ => {
            this.$dialBounds = this.$dialHolder.find(uis.dialBound);
            this.$dialHosts = this.$dialBounds.find(c.c + uis.dialHost);
            this.$dialPrefixes = this.$dialHolder.find(c.c + li + c.c + uis.prefix + c.c + sp);
            this.$dialSuffixes = this.$dialHolder.find(c.c + li + c.c + uis.suffix + c.c + sp);
            this.$dialDividers = this.$dialHolder.find(c.c + uis.divider + c.c + sp);
        }
        updateBoundLinks();

        for (var [index, list] of itemTable.entries()) {
            this.#setItemBoundEvents(index);
            this.updateItemBound(index, list);
        }

        if (!isInit) this.#isInit = f;

        return this.#itemTable = new Proxy(this.#itemTableProxy, {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                target[property] = isIndex ? this.#setItemTableProxy(index, value) : value;
                if (isIndex) {
                    const boundLength = this.$dialBounds.length;
                    if (boundLength > index) this.updateItemBound(index, value);
                    else {
                        for (let i=boundLength; i<=index; i++) {
                            this.dialHolder.worm({ boundIndex: i });
                            this.dialHolder.worm({ offset: i + 1 }, c.frozenDivider);
                        }
                        updateBoundLinks();

                        for (let i=boundLength; i<=index; i++) {
                            this.#setItemBoundEvents(i);
                            this.updateItemBound(i, i == index ? value : []);
                        }
                    }
                }
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                if (isIndex) {
                    this.$dialBounds[index].remove();
                    this.$dialHolder.find(c.c + uis.dialDivider)[index + 1].remove();
                    const dividerLength = this.#itemDividers.length;
                    const dividerCount = this.$dialDividers.length;
                    updateBoundLinks();
                    this.#itemTableProxy.splice(index, 1);
                    this.#itemAlignsOrigin.splice(index, 1);
                    this.#itemPrefixesOrigin.splice(index, 1);
                    this.#itemSuffixesOrigin.splice(index, 1);
                    this.#itemSelectionObserver.splice(index, 1);
                    if (dividerLength == 3 && dividerCount != 3) this.updateItemDividers();
                    else this.#itemDividersOrigin.splice(index + 1, 1);
                }
                return true;
            }
        });
    }

    #setItemBoundEvents(index, itemBound = this.$dialBounds[index]) {
        const inst = this;
        const $itemBound = $(itemBound);

        $itemBound.on(c.wheel, function (e) {
            e.preventDefault();

            const delta = Math.sign(e.originalEvent.deltaY);
            const selected = parseInt(this.dataset.selected);
            const $item = $(this).find(c.c + ul + c.c + li + aiv(eds.index, Math.min(Math.max(0, selected + delta), inst.#itemTable[index].length - 1) ) );
            $item.click();

            return false;
        });


        const threshold = 0.99;
        const rootMargin = "0px";

        this.#itemSelectionObserver[index] = new IntersectionObserver(entries => {
            let best = n;
            for (const entry of entries) {
                if (entry.intersectionRatio > (best?.intersectionRatio ?? 0)) best = entry;
            }
            if (best != n && best.intersectionRatio >= threshold) {
                const idx = best.target.dataset.index;
                const i = parseInt(idx);
                itemBound.dataset.selected = idx;
                this.#onSelected(index, i);
            }
        }, {
            root: itemBound,
            rootMargin,
            threshold
        });
        
        const ro = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const items = this.getDialItems(index);
                const itemHeight = items[0]?.offsetHeight ?? 0;
                const halfHeight = parseInt(itemHeight / 2);
                const padding = getComputedStyle(entry.target.querySelector(ul)).padding;
                const paddings = padding.split(s).map(it => parseInt(it));
                for (let i=0; i<paddings.length; i+=2) paddings[i] = Math.max(paddings[i] - halfHeight, 0);
                const rootMargin = paddings.map(it => hp + it + c.px).join(s);

                const current = this.#itemSelectionObserver[index];

                if (current != null) for (const elem of items) current.unobserve(elem);

                this.#itemSelectionObserver[index] = new IntersectionObserver(entries => {
                    let best = n;
                    for (const entry of entries) {
                        if (entry.intersectionRatio > (best?.intersectionRatio ?? 0)) best = entry;
                    }
                    if (best != n && best.intersectionRatio >= threshold) {
                        const idx = best.target.dataset.index;
                        const i = parseInt(idx);
                        itemBound.dataset.selected = idx;
                        this.#onSelected(index, i);
                    }
                }, {
                    root: itemBound,
                    rootMargin,
                    threshold
                });

                for (const item of items) this.#setItemEvent(index, item.dataset.index.int, item);
            }
        });

        ro.observe(itemBound);

        // Safari/WebKit does not re-evaluate IntersectionObserver entries
        // when scrolling occurs in an intermediate scroll container (dialHost)
        // between the IO root (dialBound) and the observed targets (li items).
        // Force IO re-evaluation on scroll by cycling unobserve/observe.
        {
            const dialHost = this.$dialHosts[index];
            let scrollRaf = 0;
            dialHost?.addEventListener("scroll", () => {
                cancelAnimationFrame(scrollRaf);
                scrollRaf = requestAnimationFrame(() => {
                    const observer = this.#itemSelectionObserver[index];
                    if (observer == n) return;
                    const items = this.getDialItems(index);
                    for (const item of items) {
                        observer.unobserve(item);
                        observer.observe(item);
                    }
                });
            }, { passive: true });
        }

        return ro;
    }

    updateItemBound(index, list) {
        const host = this.$dialHosts[index];
        if (host != n) {
            const isInit = this.#isInit;
            if (!isInit) this.#isInit = t;

            const $host = $(host);
            const align = typeCase(list?.[0]?.let(it => parseFloat(it).let(num => isNaN(num) ? it : num)), {
                [NUMBER]: "right",
                [STRING]: "left",
                [DEFAULT]: c.center,
            });
            $host.attr(eds.align, align);
            if (list.length < 1) host.melt({ index: "0", value: "-" });
            else {
                $host.empty();
                for (const [index, value] of list.entries()) {
                    host.worm({ index, value, dataPlaceholder: "" });
                }
                const $items = $host.find(c.c + li);
                for (let idx = 0; idx < $items.length; idx++) {
                    this.#setItemEvent(index, idx, $items[idx]);
                }
            }

            const $items = $host.find(c.c + li);
            const selectedIndex = Math.min(Math.max(0, this.#itemSelectionIndexes[index] ?? 0), $items.length - 1);
            this.#scrollInstant($items[selectedIndex]);

            if (!isInit) this.#isInit = f;

            return this.#setItemTableProxy(index, list);
        } else return this.#itemTable[index];
    }

    #setItemTableProxy(boundIndex, list) {
        return this.#itemTableProxy[boundIndex] = new Proxy(list ?? [], {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                target[property] = value;
                if (isIndex) {
                    const host = this.$dialHosts[boundIndex];
                    const $host = $(host);
                    const $items = $host.find(c.c + li);
                    const length = $items.length;
                    if (length > index) {
                        const $item = $($items[index]);
                        const $span = $item.find(c.c + sp);
                        $span.html(value);
                    } else for (let i=length; i<=index; i++) {
                        host.worm({ index: i, value: i == index ? value : "" });
                        this.#setItemEvent(boundIndex, i);
                    }
                }
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                if (isIndex) this.getDialItems(boundIndex)[index].remove();
                return true;
            }
        });
    }

    #setItemEvent(boundIndex, index, item = this.getDialItems(boundIndex)[index], observer = this.#itemSelectionObserver[boundIndex]) {
        const inst = this;
        observer.observe(item);
        $(item).off(c.click).click(function (e) {
            e.preventDefault();
            inst.#scrollSmooth(this);

            return false;
        });
    }

    updateItemAligns(itemAligns = this.#itemAlignsOrigin) {
        itemAligns ??= [];
        if (itemAligns != this.#itemAlignsOrigin) this.#itemAlignsOrigin = itemAligns;
        for (const [index, value] of itemAligns.entries()) {
            const align = typeUndefined(value) ? "" : value == n ? c.center : value ? c.right : c.left;
            this.get$dialHost(index).attr(eds.align, align);
        }
        this.#itemAligns = new Proxy(itemAligns, {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                target[property] = value;
                if (isIndex && index < this.$dialHosts.length) {
                    const align = typeUndefined(value) ? "" : value == n ? c.center : value ? c.right : c.left;
                    this.get$dialHost(index).attr(eds.align, align);
                }
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                return true;
            }
        });
    }

    updateItemPrefixes(itemPrefixes = this.#itemPrefixesOrigin) {
        itemPrefixes ??= [];
        if (itemPrefixes != this.#itemPrefixesOrigin) this.#itemPrefixesOrigin = itemPrefixes;
        for (const [index, value] of itemPrefixes.entries()) {
            $(this.$dialPrefixes[index]).html(value);
        }
        this.#itemPrefixes = new Proxy(itemPrefixes, {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                target[property] = value;
                if (isIndex && index < this.$dialPrefixes.length) {
                    $(this.$dialPrefixes[index]).html(value);
                }
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                return true;
            }
        });
    }

    updateItemSuffixes(itemSuffixes = this.#itemSuffixesOrigin) {
        itemSuffixes ??= [];
        if (itemSuffixes != this.#itemSuffixesOrigin) this.#itemSuffixesOrigin = itemSuffixes;
        for (const [index, value] of itemSuffixes.entries()) {
            $(this.$dialSuffixes[index]).html(value);
        }
        this.#itemSuffixes = new Proxy(itemSuffixes, {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                target[property] = value;
                if (isIndex && index < this.$dialSuffixes.length) {
                    $(this.$dialSuffixes[index]).html(value);
                }
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                return true;
            }
        });
    }

    updateItemDividers(itemDividers = this.#itemDividersOrigin) {
        itemDividers ??= [];
        if (itemDividers != this.#itemDividersOrigin) this.#itemDividersOrigin = itemDividers;
        if (itemDividers.length == 3) {
            const lastIndex = this.$dialDividers.length - 1;
            for (let i=0; i<this.$dialDividers.length; i++) {
                if (i == 0) $(this.$dialDividers[i]).html(itemDividers[0]);
                else if (i == lastIndex) $(this.$dialDividers[i]).html(itemDividers[2]);
                else $(this.$dialDividers[i]).html(itemDividers[1]);
            }
        } else for (const [index, value] of itemDividers.entire) {
            $(this.$dialDividers[index]).html(value);
        }
        this.#itemDividers = new Proxy(itemDividers, {
            set: (target, property, value) => {
                const index = parseInt(property);
                const isIndex = !isNaN(index);
                target[property] = value;
                if (isIndex) {
                    if (target.length == 3 && index > 0) {
                        const lastIndex = this.$dialDividers.length - 1;
                        if (index == 3) $(this.$dialDividers[lastIndex]).html(value);
                        else if (index == 2) for (let i=1; i<lastIndex; i++) $(this.$dialDividers[i]).html(value);
                    } else if (index < this.$dialDividers.length) {
                        $(this.$dialDividers[index]).html(value);
                    }
                }
                return true;
            },
            deleteProperty: (target, property) => {
                delete target[property];
                return true;
            }
        });
    }


    setOnSelected(callback = (boundIndex, index, value, selectionIndexes, selectionValues) => {}) {
        this.#onSelectionChanged = callback;
    }

    #onSelected(boundIndex, index, value = this.#itemTable[boundIndex][index]) {
        if (this.#initialItemSelectionIndexes[boundIndex] == n) {
            const idx = this.#itemSelectionIndexes[boundIndex];
            if (idx != n) {
                const item = this.getDialItems(boundIndex)?.[idx];
                if (item != n && this.$dialBounds[boundIndex].dataset.selected != idx) {
                    const isInit = this.#isInit;
                    if (!isInit) this.#isInit = t;
                    this.#scrollInstant(item);
                    if (!isInit) this.#isInit = f;
                    return;
                }
            }
            this.#initialItemSelectionIndexes[boundIndex] = index;
        }
        if (!this.isInit) {
            if (window.isVerbosely) console.log("Item selected: [" + idx + "] " + value);
            this.#itemSelectionIndexes[boundIndex] = index;
            this.#itemSelectionValues[boundIndex] = value;
            
            const selectionIndexes = this.#itemSelectionIndexes.mock;
            const selectionValues = this.#itemSelectionValues.mock;
            this.#onSelectionChanged?.(boundIndex, index, value, selectionIndexes, selectionValues);
        }
    }

    #setSelectionIndexes(selectionIndexes = [], setByEvent = t) {
        const isInit = this.#isInit;
        const isInitializing = !setByEvent;
        const isSingleEvent = setByEvent == n;
        if (isInitializing && !isInit) this.#isInit = t;
        for (let i=0; i<this.#itemTableOrigin.length; i++) {
            const index = selectionIndexes[i];
            if (index != n) {
                if (isInitializing) {
                    this.#itemSelectionIndexes[i] = index;
                    this.#itemSelectionValues[i] = this.#itemTableOrigin[i]?.[index];
                }
                if (this.$dialBounds[i].dataset.selected != index) {
                    const items = this.getDialItems(i);
                    this.#scrollInstant(items[index]);
                }
            }
        }
        if (isInitializing && !isInit) this.#isInit = f;
        if (isSingleEvent) this.#onSelectionChanged?.(n, n, n, this.#itemSelectionIndexes.mock, this.itemSelectionValues.mock);
        return this.itemSelectionIndexes;
    }

    #setSelectionValues(selectionValues = [], setByEvent = t) {
        const isInit = this.#isInit;
        const isInitializing = !setByEvent;
        const isSingleEvent = setByEvent == n;
        if (isInitializing && !isInit) this.#isInit = t;
        for (let i=0; i<this.#itemTableOrigin.length; i++) {
            const value = selectionValues[i];
            if (value != n) {
                const index = this.#itemTableOrigin[i]?.indexOf(value);
                if (index != n) {
                    if (isInitializing) {
                        this.#itemSelectionIndexes[i] = index;
                        this.#itemSelectionValues[i] = value;
                    }
                    if (index > -1 && this.$dialBounds[i].dataset.selected != index) {
                        const items = this.getDialItems(i);
                        this.#scrollInstant(items[index]);
                    }
                }
            }
        }
        if (isInitializing && !isInit) this.#isInit = f;
        if (isSingleEvent) this.#onSelectionChanged?.(n, n, n, this.#itemSelectionIndexes.mock, this.itemSelectionValues.mock);
        return this.itemSelectionValues;
    }

    setSelectionsByIndexes(selectionIndexes = [], isUpdateOnly = n) {
        return this.#setSelectionIndexes(selectionIndexes, isUpdateOnly?.let(it => !it));
    }

    setSelectionsByValues(selectionValues = [], isUpdateOnly = n) {
        return this.#setSelectionValues(selectionValues, isUpdateOnly?.let(it => !it));
    }

    #scrollInstant(elem, host = elem?.parentElement) {
        // elem?.scrollIntoView({ behavior: c.instant, block: c.center });
        if (elem != n && host != n) {
            host.scrollTop = host.scrollTop;

            postQueue(_ => {
                const hostRect = host.getBoundingClientRect();
                const elemRect = elem.getBoundingClientRect();

                const offset = elemRect.top - hostRect.top - (hostRect.height / 2) + (elemRect.height / 2);
                host.scrollTop += offset;
            });
        }
    }

    #scrollSmooth(elem, host = elem?.parentElement) {
        // elem?.scrollIntoView({ behavior: c.smooth, block: c.center });
        if (elem != n && host != n) {
            const hostRect = host.getBoundingClientRect();
            const elemRect = elem.getBoundingClientRect();

            host.scrollBy({
                top: elemRect.top - hostRect.top - (hostRect.height / 2) + (elemRect.height / 2),
                behavior: c.smooth
            });
        }
    }
}


/**
 * Toaster slot handle
 */
class EstreToasterSlotHandle extends EstreHandle {

    // constants


    // statics


    // open property
    
    // enclosed property


    // getter and setter


    constructor(toasterSlot, host) {
        super(toasterSlot, host);
    }

    release(remove) {
        super.release(remove);
    }

    init() {
        super.init();

        this.setEvent();
    }

    setEvent() {
        const inst = this;

        this.$bound.click(function (e) {
            e.preventDefault();

            switch (this.dataset.toast) {
                case "option":
                const options = this.dataset.options;
                try {
                    const parsed = JSON.parse(options);
                    toastOption(this.dataset.toastTitle ?? "", this.dataset.toastMessage ?? "", parsed, (index, value) => this.onselected?.(index, value));
                } catch (e) {
                    if (window.isLogging) console.error(e);
                }
                break;

                // <= 케이스 추가 구현
            }

            return false;
        });

    }
}



/**
 * Estre custom selector bar handle
 */
class EstreCustomSelectorBarHandle extends EstreHandle {

    // constants


    // statics


    // open property
    $selectorBtn;

    $prevBtn;
    $nextBtn;

    $selectionsList;
    
    // enclosed property
    #selections = [];
    #currentIndex;

    #onBuildSelector = $selectorBtn => doc.ce(sp);
    #onBuildSelectionsItem = (index, id, item, button) => doc.ce(sp, n, id);

    #onSelected = (index, id, $selectorBtn, isUpdateOnly) => $selectorBtn.find(sp).html(id);


    // getter and setter
    get prev() { return this.#currentIndex - 1; }
    get current() { return this.#currentIndex; }
    get next() { return this.#currentIndex + 1; }
    
    get prevId() { return this.#currentIndex > 0 ? this.#selections[this.prev] : n; }
    get currentId() { return this.#selections[this.current]; }
    get nextId() { return this.#currentIndex < this.#selections.length - 1 ? this.#selections[this.next] : n; }

    get isUsePopupSelector() { return this.$bound.attr(eds.usePopupSelector) == t1; }


    constructor(checkboxAlly, host) {
        super(checkboxAlly, host);
    }

    release(remove) {
        super.release(remove);
    }

    init() {
        super.init();

        this.$selectorBtn = this.$bound.find(c.c + cls + "bar_side" + c.c + btn + cls + "selector");

        this.$prevBtn = this.$bound.find(c.c + cls + "bar_side" + c.c + btn + cls + "prev");
        this.$nextBtn = this.$bound.find(c.c + cls + "bar_side" + c.c + btn + cls + "next");

        this.$selectionsList = this.$bound.find(c.c + cls + "float_selections" + c.c + ul + cls + "selections");

        this.setEvent();

        return this;
    }

    setEvent() {
        const inst = this;

        this.$selectorBtn.click(function (e) {
            e.preventDefault();

            inst.toggleSelector();

            return false;
        });

        this.$prevBtn.click(function (e) {
            e.preventDefault();

            inst.selectedIndex(inst.prev);

            return false;
        });
        this.$nextBtn.click(function (e) {
            e.preventDefault();

            inst.selectedIndex(inst.next);

            return false;
        });
    }

    setOnBuildSelector(callback = $selectorBtn => doc.ce(sp)) {
        this.#onBuildSelector = callback;

        return this;
    }

    setOnBuildSelectionsItem(callback = (index, id, isCurrent, item, button) => doc.ce(sp, n, id)) {
        this.#onBuildSelectionsItem = callback;

        return this;
    }

    setOnSelected(callback = (index, id, $selectorBtn, isUpdateOnly) => $selectorBtn.find(sp).html(id)) {
        this.#onSelected = callback;

        return this;
    }

    initSelections(selections, initIndex = 0, isUpdateOlny = false) {
        this.#selections = selections;

        this.#onBuildSelector?.let(it => {
            this.$selectorBtn.empty();
            this.$selectorBtn.append(it(this.$selectorBtn));
        });

        this.$selectionsList.empty();
        
        for (const [index, id] of selections.entire) this.$selectionsList.append(this.buildSelectionsItem(index, id, index == initIndex));

        this.setEventSelections();

        this.selectedIndex(initIndex, isUpdateOlny);
    }

    buildSelectionsItem(index, id, isCurrent = false) {
        const item = doc.ce(li);
        item.dataset.index = index;
        item.dataset.id = id;
        const button = doc.ce(btn, "tp_tiled_btn");
        button.dataset.index = index;
        button.dataset.id = id;
        button.append(this.#onBuildSelectionsItem(index, id, isCurrent, item, button));
        item.append(button);
        return item;
    }

    setEventSelections() {
        const inst = this;

        this.$selectionsList.find(li + c.c + btn).click(function (e) {
            e.preventDefault();

            inst.selectedIndex(this.dataset.index);

            return false;
        });
    }

    toggleSelector() {
        if (this.isUsePopupSelector) {
            // to do implement
        } else this.$bound.attr(eds.dropdownOpen, this.$bound.attr(eds.dropdownOpen) == t1 ? "" : t1);
    }

    openSelector() {
        this.$bound.attr(eds.dropdownOpen, t1);
    }

    closeSelector() {
        this.$bound.attr(eds.dropdownOpen, "");
    }

    selected(id, isUpdateOnly = false) {
        const index = this.#selections.indexOf(id);
        if (index < 0) return;
        this.selectedIndex(index, isUpdateOnly);
    }

    selectedIndex(index, isUpdateOnly = false) {
        this.closeSelector();
        const handled = this.#onSelected(index, this.#selections[index], this.$selectorBtn, isUpdateOnly);
        if (!handled) {
            this.#currentIndex = index;
            this.$selectionsList.find(c.c + li + aiv(eds.selected, t1)).removeAttr(eds.selected);
            this.$selectionsList.find(c.c + li + aiv(eds.index, index)).attr(eds.selected, t1);
        }
    }
}



/**
 * Estre month selector bar handle
 */
class EstreMonthSelectorBarHandle extends EstreHandle {

    // constants


    // statics


    // open property
    $selectorInput;

    $selectorBtn;
    $selectorCurrent;

    $prevBtn;
    $nextBtn;

    $monthesList;

    monthesItemLimit = 12;
    forMonthesItemShow = (month) => month.replace("-", ".");


    onSelectedMonth = (month) => {};

    onBuildMonthesItem = (month, isCurrent, item, button) => button.if(isCurrent, it => $(it).addClass("font_semi_bold"));

    
    // enclosed property


    // getter and setter
    get prev() { return Ecal.getPrevMonth(this.current); }
    get current() { return this.currentMonth.let(it => {
        const [year, month] = it.split("-");
        return new Date(parseInt(year), parseInt(month) - 1);
    }); }
    get next() { return Ecal.getNextMonth(this.current); }

    get prevMonth() { return Ecal.getDateSet(this.prev).let(it => it.year + "-" + it.month2d); }
    get currentMonth() { return this.$bound.attr(eds.current); }
    set currentMonth(value) { this.$bound.attr(eds.current, value); }
    get nextMonth() { return Ecal.getDateSet(this.next).let(it => it.year + "-" + it.month2d); }

    get isShowFuture() { return this.$bound.attr(eds.showFuture) == t1; }
    get isUsePopupSelector() { return this.$bound.attr(eds.usePopupSelector) == t1; }


    constructor(checkboxAlly, host) {
        super(checkboxAlly, host);
    }

    release(remove) {
        super.release(remove);
    }

    init() {
        super.init();

        this.$selectorInput = this.$bound.find(inp + aiv("type", "month"));

        this.$selectorBtn = this.$bound.find(c.c + cls + "bar_side" + c.c + btn + cls + "selector");
        this.$selectorCurrent = this.$selectorBtn.find(sp + cls + "current");

        this.$prevBtn = this.$bound.find(c.c + cls + "bar_side" + c.c + btn + cls + "prev");
        this.$nextBtn = this.$bound.find(c.c + cls + "bar_side" + c.c + btn + cls + "next");

        this.$monthesList = this.$bound.find(c.c + cls + "float_selections" + c.c + ul + cls + "monthes");

        this.setEvent();

        if (this.$bound.attr(eds.autoInit) == t1) this.monthSelected();

        return this;
    }

    setEvent() {
        const inst = this;

        this.$selectorInput.change(function (e) {
            const value = this.value;
            if (value == "") this.value = inst.currentMonth;
            else inst.monthSelected(value);
        });

        this.$selectorBtn.click(function (e) {
            e.preventDefault();

            inst.toggleSelector();

            return false;
        });

        this.$prevBtn.click(function (e) {
            e.preventDefault();

            inst.monthSelected(inst.prevMonth);

            return false;
        });
        this.$nextBtn.click(function (e) {
            e.preventDefault();

            inst.monthSelected(inst.nextMonth);

            return false;
        });
    }

    initMonthes(initMonth) {
        if (initMonth != null) this.currentMonth = initMonth;
        else if (isNullOrEmpty(this.currentMonth)) this.currentMonth = Ecal.getDateSet().let(it => it.year + "-" + it.month2d);

        this.$monthesList.empty();
        
        const month = this.currentMonth;

        const currentDate = this.current;
        const currentOffset = Ecal.getMonthOffset(currentDate);

        const today = new Date();
        const todayOffset = Ecal.getMonthOffset(today);
        // const todayMonth = Ecal.getDateSet(today).let(it => it.year + "-" + v2d(it.month));

        const othersCount = this.monthesItemLimit - 1;
        const halfCount = parseInt(othersCount / 2);

        const prevLimit = this.isShowFuture ? halfCount : Math.min(Math.max(todayOffset - currentOffset, 0), halfCount);
        const nextLimit = othersCount - prevLimit;

        let count = 0;
        this.$monthesList.append(this.buildMonthesItem(month, true));
        for (var i = 1; i <= prevLimit; i++) this.$monthesList.prepend(this.buildMonthesItem(Ecal.getDateSetFromMonth(currentOffset + i).let(it => it.year + "-" + v2d(it.month))));
        for (var i = 1; i <= nextLimit; i++) this.$monthesList.append(this.buildMonthesItem(Ecal.getDateSetFromMonth(currentOffset - i).let(it => it.year + "-" + v2d(it.month))));

        this.setEventMonthes();
    }

    buildMonthesItem(month, isCurrent = false) {
        const item = doc.ce(li);
        const button = doc.ce(btn, "tp_tiled_btn");
        button.setAttribute(eds.month, month);
        button.append(doc.ce(sp, null, this.forMonthesItemShow?.(month) ?? month));
        item.append(button);

        this.onBuildMonthesItem?.(month, isCurrent, item, button);
        return item;
    }

    setEventMonthes() {
        const inst = this;

        this.$monthesList.find(li + c.c + btn).click(function (e) {
            e.preventDefault();

            inst.monthSelected(this.dataset.month);

            return false;
        });
    }

    toggleSelector() {
        if (this.isUsePopupSelector && (isAndroid || isAppleMobile)) {
            if (isAppleMobile) this.$selectorInput.focus();
            if (isAndroid) this.$selectorInput.click();
        } else this.$bound.attr(eds.dropdownOpen, this.$bound.attr(eds.dropdownOpen) == t1 ? "" : t1);
    }

    openSelector() {
        this.$bound.attr(eds.dropdownOpen, t1);
    }

    closeSelector() {
        this.$bound.attr(eds.dropdownOpen, "");
    }

    monthSelected(month, preventCallback = false) {
        if (month != null) this.currentMonth = month;
        else {
            if (isNullOrEmpty(this.currentMonth)) this.currentMonth = Ecal.getDateSet().let(it => it.year + hp +it.month2d);
            month = this.currentMonth;
        }

        this.closeSelector();
        this.$selectorInput.val(month);
        this.$selectorCurrent.html(this.forMonthesItemShow?.(month) ?? month);
        if (!preventCallback) this.onSelectedMonth?.(month);
        this.initMonthes();
    }
}


// showers

class EstreDateShowerHandle extends EstreHandle {

    // constants


    // statics


    // open property

    
    // enclosed property
    #date = null;


    // getter and setter
    get date() { return new Date(this.#date); }

    get from() { return this.$bound.attr(eds.dateFrom); }


    constructor(dateShower, host) {
        super(dateShower, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        this.releaseDate();

        this.setEvent();

        return this;
    }

    setEvent() {
        const inst = this;

        this.$bound.find(uis.dateReplacer).click(function(e) {
            inst.releaseDate();
        });
    }

    releaseDate() {
        const from = this.from;
        switch (from) {
            case undefined:
            case null:
            case "":
            case "today":
                this.#date = new Date();
                break;

            default:
                this.#date = new Date(from);
                break;
        }

       if (this.#date != null) {
            const ds = Ecal.getDateSet(this.#date);
            const $bound = this.$bound;

            $bound.attr(eds.dateY, ds.year);
            $bound.attr(eds.dateM, ds.month2d);
            $bound.attr(eds.dateD, ds.date2d);
            $bound.attr(eds.dateId, Ecal.getDateOffset(this.#date, this.lang));

            $bound.find(uis.fullYear).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("yearPrefix");
                text += ds.year;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("yearSuffix");
                el.innerText = text;
            });
            $bound.find(uis.year2d).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("yearPrefix");
                text += ds.year2d;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("yearSuffix");
                el.innerText = text;
            });

            $bound.find(uis.month).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("monthPrefix");
                text += ds.monthText;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("monthSuffix");
                el.innerText = text;
            });
            $bound.find(uis.month2d + cor + uis.paddedMonth).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("monthPrefix");
                text += ds.month2d;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("monthSuffix");
                el.innerText = text;
            });

            $bound.find(uis.date).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("dayPrefix");
                text += ds.date;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("daySuffix");
                el.innerText = text;
            });
            $bound.find(uis.date2d + cor + uis.paddedDate).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("dayPrefix");
                text += ds.date2d;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("daySuffix");
                el.innerText = text;
            });

            $bound.find(uis.day).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("weekdayPrefix");
                text += ds.dayText;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("weekdaySuffix");
                el.innerText = text;
            });
            $bound.find(uis.shortDay).each((i, el) => {
                var text = "";
                if ($(el).attr(eds.withPrefix) == t1) text += EsLocale.get("weekdayShortPrefix");
                text += ds.dayTextShort;
                if ($(el).attr(eds.withSuffix) == t1) text += EsLocale.get("weekdayShortSuffix");
                el.innerText = text;
            });
        }
    }
}

class EstreLiveTimestampHandle extends EstreHandle {

    // constants


    // statics


    // open property

    
    // enclosed property
    #date;
    
    #timeout;


    #nextTimeout = 1000;


    // getter and setter
    get date() { return new Date(this.#date); }

    get from() { return this.$bound.attr(eds.liveTimestamp).int; }

    get isShortSuffix() { return this.$bound.attr(eds.shortSuffix) == t1; }


    constructor(liveTimestamp, host) {
        super(liveTimestamp, host);
    }

    release() {
        clearTimeout(this.#timeout);
        this.#timeout = n;

        super.release();
    }

    init() {
        super.init();

        this.#date = new Date(this.from).time;

        if (!isNaN(this.#date)) {
            this.updateDisplay();

            this.setLive();
        }

        return this;
    }

    setLive() {
        if (this.#timeout != n) {
            clearTimeout(this.#timeout);
            this.#timeout = n;
        }

        const postTimeout = _ => this.#timeout = setTimeout(_ => {
            if (!this.bound.isConnected) {
                clearTimeout(this.#timeout);
                this.#timeout = n
                return;
            }
            this.updateDisplay();
            if (this.#nextTimeout != n) postTimeout();
            else this.#timeout = n;
        }, this.#nextTimeout);

        if (this.#nextTimeout != n) postTimeout();
        else this.#timeout = n;
    }

    updateDisplay() {
        const suffixType = this.isShortSuffix ? "ShortSuffix" : "Suffix";
        const now = dt.t;
        const time = this.#date;
        const diff = now - time;
        let text = "";
        let nextTimeout = n;
        if (diff < 10000) {
            text = EsLocale.get("now");
            nextTimeout = 10000 - diff;
        } else {
            const texts = [];
            const ago = EsLocale.get("ago");
            if (diff < 20000) {
                texts.push(EsLocale.get("just"));
                nextTimeout = 20000 - diff;
            } else if (diff < 60000) {
                texts.push(Math.floor(diff / 1000) + EsLocale.get("seconds" + suffixType));
                nextTimeout = 10000;
            } else if (diff < 3600000) {
                texts.push(Math.floor(diff / 60000) + EsLocale.get("minutes" + suffixType));
                nextTimeout = 60000;
            } else if (diff < 86400000) {
                texts.push(Math.floor(diff / 3600000) + EsLocale.get("hours" + suffixType));
                nextTimeout = 3600000;
            } else if (diff < 604800000) {
                texts.push(Math.floor(diff / 86400000) + EsLocale.get("days" + suffixType));
                nextTimeout = 86400000;
            } else if (diff < 2592000000) texts.push(Math.floor(diff / 604800000) + EsLocale.get("weeks" + suffixType));
            else if (diff < 31104000000) texts.push(Math.floor(diff / 2592000000) + EsLocale.get("months" + suffixType));
            else texts.push(Math.floor(diff / 31104000000) + EsLocale.get("years" + suffixType));
            texts.push(ago);
            text = texts.join(s);
        }
        this.#nextTimeout = nextTimeout;
        this.$bound.html(text);
    }
}



// on click set text
class EstreOnClickSetTextHandle extends EstreHandle {
    // constants

    // statics

    // open property

    // enclosed property

    // getter and setter


    constructor(bound, host) {
        super(bound, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        this.$bound.click(function (e) {
            e.preventDefault();

            const text = this.dataset.onClickSetText;
            $(this).text(text);

            return false;
        });
    }

}

// on click set html
class EstreOnClickSetHtmlHandle extends EstreHandle {
    // constants

    // statics

    // open property

    // enclosed property

    // getter and setter


    constructor(bound, host) {
        super(bound, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        this.$bound.click(function (e) {
            e.preventDefault();

            const text = this.dataset.onClickSetHtml;
            $(this).html(text);

            return false;
        });
    }

}



// exported content
class EstreExportedContentHandle extends EstreHandle {

    // constants


    // statics


    // open property

    
    // enclosed property
    #src;
    #placeholder;


    // getter and setter



    constructor(bound, host) {
        super(bound, host);
    }


    release() {
        super.release();
    }

    init() {
        super.init();

        if (xu(this.#src)) this.#src = this.bound.dataset.src;
        if (xu(this.#placeholder)) this.#placeholder = this.bound.dataset.placeholder?.let(it => it.length > 0 ? it : n) ?? "Please wait...";

        this.loadContent();
    }

    loadContent() {
        const src = this.#src;
        const placeholder = this.#placeholder;
        this.bound.innerHTML = placeholder;
        if (nne(src)) fetch(src).then(response => response.text()).then(data => {
            this.bound.innerHTML = data;
        });
    }
}

class EstreHelpAlertHandle extends EstreHandle {

    // constants

    // statics


    // open property


    // enclosed property


    // getter and setter


    constructor(bound, host) {
        super(bound, host);
    }

    release() {
        super.release();
    }

    init() {
        super.init();

        this.$bound.click(function (e) {
            e.preventDefault();

            alert(this.dataset.helpAlertTitle?.replace(/\\n/g, "<br />") ?? "", this.dataset.helpAlert.replace(/\\n/g, "<br />") ?? "");

            return false;
        });
    }
}



// quick transitions
class EstreEzHidableHandle extends EstreHandle {

    // constants


    // statics


    // open property

    
    // enclosed property


    // getter and setter



    constructor(bound, host) {
        super(bound, host);
    }


    release() {
        delete this.bound.hide;
        delete this.bound.show;

        super.release();
    }

    init() {
        super.init();

        this.setTrigger();
    }

    setTrigger() {
        this.bound.hide = function() {
            if (this.dataset.hide != null && this.dataset.hide != "0") {
                this.dataset.hide = "0";
                setTimeout(_ => {
                    if (this.dataset.hide == "") this.dataset.hide = "1";
                }, cvt.t2ms($(this).css(a.trdr)));
            }
        };

        this.bound.show = function() {
            const appear = () => {
                this.dataset.hide = "";
                setTimeout(_ => {
                    if (this.dataset.hide == "") delete this.dataset.hide;
                }, cvt.t2ms($(this).css(a.trdr)));
            };
            
            if (this.dataset.hide == "0") appear();
            else if (this.dataset.hide == "1") {
                this.dataset.hide = "0";
                setTimeout(_ => {
                    if (this.dataset.hide == "0") appear();
                }, 0);
            }
        };
    }
}

class EstreFixedAccessHandle extends EstreEzHidableHandle {

}



// handlers


// ======================================================================