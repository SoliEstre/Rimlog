/*
    EstreUI rimwork

    Author: Estre Soliette
    Established: 2024.06.10

    NOTE: Required jQuery latest version

    Visit this rim-work's official site(GitHub)
    https://estreui.mpsolutions.kr
*/

// initializing essential states

// ======================================================================
// MODULE: Core -- registries, constants, typedefs
// ======================================================================

// ──────────────────────────────────────────────
// @typedef — reusable type shapes
// ──────────────────────────────────────────────

/**
 * Intent object passed to page handlers during navigation.
 * Properties vary by page type; the fields below are the common base.
 * @typedef {Object} EstreIntent
 * @property {string} [action] - Intent action identifier.
 * @property {*} [data] - Arbitrary payload. Shape depends on the target page.
 * @property {EstreIntentBringOnBack} [bringOnBack] - Intent to execute when navigating back.
 * @property {EstreIntentAction[]} [onBring] - Actions to run on bring.
 * @property {EstreIntentAction[]} [onOpen] - Actions to run on open.
 * @property {EstreIntentAction[]} [onShow] - Actions to run on show.
 * @property {EstreIntentAction[]} [onFocus] - Actions to run on focus.
 * @property {EstreIntentAction[]} [onIntentUpdated] - Actions to run on intent update.
 * @property {EstreIntentAction[]} [onBlur] - Actions to run on blur.
 * @property {EstreIntentAction[]} [onHide] - Actions to run on hide.
 * @property {EstreIntentAction[]} [onClose] - Actions to run on close.
 * @property {EstreIntentAction[]} [onRelease] - Actions to run on release.
 * @property {Function} [onDissmiss] - Callback when dismissed (dialog pages).
 * @property {Function} [onOk] - Confirm callback (alert dialog).
 * @property {Function} [onPositive] - Positive callback (confirm dialog).
 * @property {Function} [onNegative] - Negative callback (confirm dialog).
 * @property {Function} [onNeutral] - Neutral callback (confirm dialog).
 * @property {Function} [onConfirm] - Confirm callback (prompt/selection/dials dialog).
 * @property {Function} [onAnother] - Another-action callback (selection/dials dialog).
 * @property {Function} [onSelected] - Option selected callback (option dialog).
 * @property {Function} [onSelect] - Item select callback (selection/dials dialog).
 * @property {Function} [resolver] - Promise resolver for programmatic intent completion.
 */

/**
 * Back-navigation intent embedded in an EstreIntent.
 * @typedef {Object} EstreIntentBringOnBack
 * @property {string} pid - PID to navigate to on back.
 * @property {string} [hostType] - Host type scope ("component"|"container"|"article").
 */

/**
 * Declarative lifecycle action entry within an EstreIntent.
 * @typedef {Object} EstreIntentAction
 * @property {string} from - Host type that triggers this action ("component"|"container"|"article").
 * @property {string} action - Action identifier (e.g. "autoClose", "closePage").
 * @property {boolean} [disabled] - If true, this action is skipped.
 * @property {string} [host] - Target host type for autoClose.
 * @property {number|string} [time] - Delay in ms for autoClose.
 * @property {string} [targetPid] - Target PID for closePage.
 */


/**
 * UI specifier constants — CSS-selector-based UI widget identifier registry.
 * EstreHandle uses these values as specifiers when searching for handles in the DOM.
 * Access via `uis.calendar`, `uis.collapsible`, etc.
 * @type {Object<string, string>}
 */
const uis = {
    // lottie player //
    dotlottiePlayer: "dotlottie-player",
    dotlottieLoader: "dotlottie-loader",

    // rim ui //
    prefix: ".prefix",
    suffix: ".suffix",
    divider: ".divider",
    
    // component //
    container: ".container",
    rootTabContent: "root_tab_content",

    // container //
    stepNavigation: ".step_navigation",
    stepTitleBar: ".step_title_bar",
    stepIndicator: ".step_indicator",
    stepPointer: ".step_pointer",
    stepDivider: ".step_divider",

    // session manager //
    pageShortCut: ".page_short_cut",

    // common
    section: "section",
    toggle: ".toggle",
    toggleArea: "div.toggle",
    toggleBtn: "button.toggle",
    basic: ".basic",
    settings: ".settings",
    settingsPanel: ".settings_panel",
    toSmaller: ".to_smaller",
    toLarger: ".to_larger",
    controlArea: ".control_area",
    areaHandler: ".area_handler",
    areaResizer: ".area_resizer",
    placeholder: ".placeholder",

    // unified calendar
    unifiedCalendar: ".unified_calendar",
    calendarArea: "section.calendar_area",
    scheduleList: "section.schedule_list",

    // variable calendar
    variableCalendar: ".variable_calendar",
    dateIndicateArea: ".date_indicate_area",
    dateIndicator: ".date_indicator",

    calendarStructure: ".calendar_structure",
    unicalShowToday: "input#unicalShowToday",

    calendarBar: ".calendar_bar",
    scheduleFilter: ".schedule_filter",
    filterFixed: "ul.fixed",
    filterVariable: "ul.variable",
    dataSelection: "ul.data_selection",
    
    // unified scheduler
    unifiedScheduler: ".unified_scheduler",
    scheduleHolder: ".schedule_holder",
    scheduleItem: ".schedule_item",

    // dedicated calendar
    dedicatedCalendar: ".dedicated_calendar",
    calendarBlock: ".calendar_block",
    scheduleBlock: ".schedule_block",

    // micro calendar
    microCalendar: ".micro_calendar",
    stretchHandle: ".stretch_handle",
    handle: ".handle",

    // minimal scheduler
    minimalScheduler: ".minimal_scheduler",
    minimalScheduleList: ".schedule_list",
    schedule: ".schedule",
    
    // calendar common
    scaler: ".scaler",
    daysSubjects: ".days_subjects",
    daysHolder: ".days_holder",
    years: ".years",
    year: ".year",
    months: ".months",
    month: ".month",
    weeks: ".weeks",
    week: ".week",
    days: ".days",
    day: ".day",
    dday: ".dday",
    today: ".today",
    date: ".date",
    scheduled: ".scheduled",


    // scalable
    scalable: ".scalable",
    summary: ".summary",

    // collapsible
    collapsible: ".collapsible",
    notBasic: ":not(.basic)",
    notBasicAndToggle: ":not(.basic, button.toggle)",

    // toggle block
    toggleBlock: ".toggle_block",

    // tab block and toggle tab block
    tabBlock: ".tab_block",
    toggleTabBlock: ".toggle_tab_block",
    titledTabBlock: ".titled_tab_block",
    tabSet: "ul.tab_set",
    slidingSubjectBlock: ".sliding_subject_block",
    tabContentBlocks: ".tab_content_blocks",

    // scoped tab block
    pageHandle: "button.page_handle",
    infiniteHPager: ".infinite_h_pager",
    boundHost: ".bound_host",


    // dynamic section block
    dynamicSectionHost: ".dynamic_section_host",
    dynamicSectionBlock: ".dynamic_section_block",
    hostItem: ".host_item",
    blockItem: ".block_item",


    // custom selector bar
    customSelectorBar: ".custom_selector_bar",

    // month selector bar
    monthSelectorBar: ".month_selector_bar",


    // date shower
    dateShower: ".date_shower",
    dateReplacer: ".dete_replacer",
    fullYear: ".full_year",
    year2d: ".year_2d",
    month2d: ".month_2d",
    date2d: ".date_2d",
    paddedMonth: ".padded_month",
    paddedDate: ".padded_date",
    shortDay: ".short_day",

    // live timestamp
    liveTimestamp: "[data-live-timestamp]",


    // on click set text
    onClickSetText: "[data-on-click-set-text]",

    // on click set html
    onClickSetHtml: "[data-on-click-set-html]",


    // help alert
    dataHelpAlert: "[data-help-alert]",

    // num keypad
    numKeypad: ".num_keypad",

    // checkbox set
    checkboxSet: ".checkbox_set",

    // checkbox ally
    checkboxAlly: ".checkbox_ally",

    // toaster slot
    toasterSlot: ".toaster_slot",

    // multi dial slot
    multiDialSlot: ".multi_dial_slot",
    dialHolder: ".dialHolder",
    dialBound: ".dial_bound",
    dialHost: ".dial_host",
    

    // exported content
    exportedContent: ".exported_content",


    // quick transitions
    ezHidable: ".ez_hidable",
    fixedAccess: ".fixed_access",


    // swipe handler
    allowSwipe: ".allow_swipe",
    blockSwipe: ".block_swipe",
    blockSwipeFilter: "*:not(.block_swipe)",
    


    // data related using //


    eoo: eoo
};

/**
 * Element data specifier constants — `data-*` attribute name registry.
 * Used to reference DOM data attributes in Active Struct bindings, page manager, handles, etc.
 * Access via `eds.bind`, `eds.active`, `eds.exported`, etc.
 * @type {Object<string, string>}
 */
const eds = {
    // for rim ui
    onReady: "data-on-ready",
    opened: "data-opened",
    tabId: "data-tab-id",
    active: "data-active",
    onTop: "data-on-top",
    static: "data-static",
    exported: "data-exported",
    multiInstance: "data-multi-instance",
    instanceOrigin: "data-instance-origin",

    // for bind data
    index: "data-index",

    // for container
    articleStepsId: "data-article-steps-id",

    // for article
    wideDynamicSection: "data-wide-dynamic-section",

    // for page manager

    // for session manager
    containerType: "data-container-type",
    containerId: "data-container-id",
    articleId: "data-article-id",

    // for page handle
    appbarLeft: "data-appbar-left",
    appbarCenter: "data-appbar-center",
    appbarRight: "data-appbar-right",
    bind: "data-bind",
    bindAmount: "data-bind-amount",
    bindValue: "data-bind-value",
    bindAttr: "data-bind-attr",
    bindStyle: "data-bind-style",
    bindArray: "data-bind-array",
    bindArrayItem: "data-bind-array-item",
    bindArrayAmount: "data-bind-array-amount",
    bindArrayValue: "data-bind-array-value",
    bindArrayAttr: "data-bind-array-attr",
    bindArrayStyle: "data-bind-array-style",
    bindArrayIndex: "data-bind-array-index",
    bindArrayIndexAmount: "data-bind-array-index-amount",
    bindArrayIndexValue: "data-bind-array-index-value",
    bindArrayIndexAttr: "data-bind-array-index-attr",
    bindObjectArrayItem: "data-bind-object-array-item",
    bindObjectArrayAmount: "data-bind-object-array-amount",
    bindObjectArrayValue: "data-bind-object-array-value",
    bindObjectArrayAttr: "data-bind-object-array-attr",
    bindObjectArrayStyle: "data-bind-object-array-style",
    showOnExists: "data-show-on-exists",
    showOnNotExists: "data-show-on-not-exists",
    showOnEquals: "data-show-on-equals",
    showOnExistsObjectArrayItem: "data-show-on-exists-object-array-item",
    showOnNotExistsObjectArrayItem: "data-show-on-not-exists-object-array-item",
    showOnEqualsObjectArrayItem: "data-show-on-equals-object-array-item",

    frozenPlaceholder: "data-frozen-placeholder",
    frozenItem: "data-frozen-item",

    // for handle
    handle: "data-handle",

    // for estre ui attribute
    lead: "data-lead",
    trail: "data-trail",
    prefix: "data-prefix",
    suffix: "data-suffix",
    fore: "data-fore",
    hind: "data-hind",
    nose: "data-nose",
    tail: "data-tail",
    hat: "data-hat",
    shoe: "data-shoe",

    // for common
    id: "data-id",
    size: "data-size",
    count: "data-count",
    contained: "data-contained",
    noTransition: "data-no-transition",
    year: "data-year",
    month: "data-month",
    adjoin: "data-adjoin",
    adjoinYear: "data-adjoin-year",
    adjoinMonth: "data-adjoin-month",
    adjoinWeek: "data-adjoin-week",
    week: "data-week",
    day: "data-day",
    date: "data-date",
    holiday: "data-holiday",
    dateY: "data-date-y",
    dateM: "data-date-m",
    dateD: "data-date-d",
    today: "data-today",
    selected: "data-selected",
    category: "data-category",
    group: "data-group",
    origin: "data-origin",
    selection: "data-selection",
    slide: "data-slide",
    subject: "data-subject",
    type: "data-type",
    transition: "data-transition",
    satisfy: "data-satisfy",
    show: "data-show",
    showing: "data-showing",
    length: "data-length",
    title: "data-title",
    icon: "data-icon",
    coverMount: "data-cover-mount",
    for: "data-for",
    name: "data-name",
    ally: "data-ally",
    current: "data-current",
    autoInit: "data-auto-init",
    placeholder: "data-placeholder",
    options: "data-options",
    code: "data-code",
    value: "data-value",
    align: "data-align",
    initial: "data-initial",
    intersectionRootMargin: "data-intersection-root-margin",
    intersectionThreshold: "data-intersection-threshold",

    // message datas
    messageOnNoSelection: "data-message-on-no-selection",
    messageOnLoading: "data-message-on-loading",
    messageOnNoData: "data-message-on-no-data",

    // body global switch
    onResizing: "data-on-resizing",
    onMoving: "data-on-moving",
    notAllowed: "data-not-allowed",

    // for component
    focusOnBring: "data-focus-on-bring",

    // for unified calendar
    fitCalendar: "data-fit-calendar",
    scaleOverride: "data-scale-override",

    // for variable calendar
    structureType: "data-structure-type",
    showSchedulePrefix: "data-show-schedule-",
    /** @type {function(string): string} Generates origin-specific schedule attribute name. */
    currentScheduleOrigin: (origin) => "data-current-schedule-" + origin + "-origin",
    currentScheduleBasicOrigin: "data-current-schedule-basic-origin",
    currentScheduleDataOrigin: "data-current-schedule-data-origin",
    scale: "data-scale",
    scaleId: "data-scale-id",
    scaleSelected: "data-scale-selected",
    beginScale: "data-begin-scale",
    showToday: "data-show-today",
    loaded: "data-loaded",
    scheduleUnit: "data-schedule-unit",
    
    // for calendar structure
    todayYear: "data-today-y",
    todayMonth: "data-today-m",
    todayWeek: "data-today-w",
    todayDay: "data-today-d",
    focusYear: "data-focus-y",
    focusMonth: "data-focus-m",
    focusWeek: "data-focus-w",
    focusDay: "data-focus-d",
    boundYear: "data-bound-y",
    boundMonth: "data-bound-m",
    boundWeek: "data-bound-w",
    hideWeekage: "data-hide-weekage",
    hideWeekend: "data-hide-weekend",

    // for scheduler
    preload: "data-preload",
    division: "data-division",
    dateId: "data-date-id",
    scheduleId: "data-schedule-id",

    // for scelable
    lookScale: "data-look-scale",
    maxScale: "data-max-scale",

    // for collapsible & toggle blocks
    collapsed: "data-collapsed",
    contentCollapsed: "data-content-collapsed",

    // for toggle tab block
    beginTab: "data-begin-tab",
    tabSelected: "data-tab-selected",

    // for scoped tab block
    scope: "data-scope",
    direction: "data-direction",
    bound: "data-bound",
    pageSelected: "data-page-selected",


    // for checkbox set
    checkboxSelection: "data-checkbox-selection",

    // for toaster slot
    toast: "data-toast",
    customToast: "data-custom-toast",
    toastTitle: "data-toast-title",
    toastMessage: "data-toast-message",


    // for date shower
    dateFrom: "data-date-from",
    withPrefix: "data-with-prefix",
    withSuffix: "data-with-suffix",

    // for live timestamp
    liveTimestamp: "data-live-timestamp",
    shortSuffix: "data-short-suffix",


    // for on click set text
    onClickSetText: "data-on-click-set-text",

    // for on click set html
    onClickSetHtml: "data-on-click-set-html",


    // for month selector bar
    dropdownOpen: "data-dropdown-open",
    showFuture: "data-show-future",
    usePopupSelector: "data-use-popup-selector",


    // multi dial slot
    itemTable: "data-item-table", // [['item1', 'item2', 'item3', ...], ['item1', 'item2', 'item3', ...], ...]
    itemAligns: "data-item-aligns", // [t, n, f, ...] :: f: left, n: center, t: right
    itemPrefixes: "data-item-prefixes", // ['prefix1', 'prefix2', ...]
    itemSuffixes: "data-item-suffixes", // ['suffix1', 'suffix2', ...]
    itemDividers: "data-item-dividers", // ['before', 'dividerForAll', 'after'] / ['divider0', 'divider1', ...]


    // for solid point
    solid: "data-solid",

    // for internal link and page link
    openTarget: "data-open-target",
    openContainer: "data-open-container",
    openId: "data-open-id",
    openPage: "data-open-page",
    showPage: "data-show-page",
    closePage: "data-close-page",
    openAction: "data-open-action",
    openBringOnBack: "data-open-bring-on-back",
    openData: "data-open-data",
    showAction: "data-show-action",
    showBringOnBack: "data-show-bring-on-back",
    showData: "data-show-data",


    // for swipe handler
    onSwipe: "data-on-swipe",
    onGrab: "data-on-grab",


    // data related using //
    // common
    registered: "data-registered",


    eoo: eoo
}



// ======================================================================