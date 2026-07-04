/*

MIT License

Copyright (c) 2025 Estre Soliette (SoliEstre)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

     

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

// Modernism.js - Estre Modernism javascript patch //
// 
// Collections of bypass for process codes takes be inline,
// and monkey patching like as modern languages.
// 
// v0.7.2    / release 2026.04.18
// 
// Author: Estre Soliette
// Established: 2025.01.05


/** @type {Object} Global object (globalThis / window / global). */
const _global = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : global);
/**
 * Defines a read-only global constant.
 * @param {string} name - Global property name.
 * @param {*} value - Value.
 */
const defineGlobal = (name, value) => Object.defineProperty(_global, name, {
    value: value,
    writable: false,
    configurable: false,
    enumerable: false
});

// primitive types alias constant
const UNDEFINED = "undefined";
const NULL = "null";
const TRUE = "true";
const FALSE = "false";

// prototype of primitive types alias constant
const FUNCTION = "function";
const BOOLEAN = "boolean";
const STRING = "string";
const SYMBOL = "symbol";
const NUMBER = "number";
const BIGINT = "bigint";
const OBJECT = "object";

// class names of primitive types constant
const _FUNCTION = "Function";
const _BOOLEAN = "Boolean";
const _STRING = "String";
const _SYMBOL = "Symbol";
const _NUMBER = "Number";
const _BIG_INT = "BigInt";
const _OBJECT = "Object";

// frequent object types alias constant
const _DATE = "Date";
const _TIME = "Time";

const _ARRAY = "Array";
const _SET = "Set";
const _MAP = "Map";


// frequent assign types alias constant
const FORE_NOT_DEFAULT = "foreNotDefault";
const MORE_NOT_DEFAULT = "moreNotDefault";
const DEFAULT = "default";
const FINALLY = "finally";


// bypass constant — conditional execution utilities
/**
 * Executes work if condition is true, ornot if false.
 * @param {boolean} bool - Condition.
 * @param {Function} [work] - Function to execute when true.
 * @param {Array} [args=[]] - Arguments to pass to work/ornot.
 * @param {Function} [ornot] - Function to execute when false.
 * @returns {*} Execution result.
 */
const executeIf = (bool, work = () => {}, args = [], ornot = () => {}) => {
    if (bool) return work(...args);
    else return ornot(...args);
};
const executeWhen = (args = [], isTrue = args => 1 == "0", work = args => {}, ornot = () => {}) => {
    if (isTrue(...args)) return work(...args);
    else return ornot(...args);
};

const ifReturn = (bool, returns, orNot) => bool ? returns : orNot;

const ifReturnOrEmptyNumber = (bool, returns) => ifReturn(bool, returns, 0);
const ifReturnOrEmptyString = (bool, returns) => ifReturn(bool, returns, "");
const ifReturnOrEmptyArray = (bool, returns) => ifReturn(bool, returns, []);
const ifReturnOrEmptyObject = (bool, returns) => ifReturn(bool, returns, {});

const valet = (value, process = it => it) => process(value);


// common process shortcut constant
const forZeroToBefore = (toward, work = i => { return false; }) => {
    for (let i=0; i<toward; i++) if (work(i)) break;
};
const forZeroToReach = (toward, work = i => { return false; }) => {
    for (let i=0; i<=toward; i++) if (work(i)) break;
};

const forToZeroFrom = (begins, work = i => { return false; }) => {
    for (let i=begins; i>=0; i--) if (work(i)) break;
};
const forToPrimeFrom = (begins, work = i => { return false; }) => {
    for (let i=begins; i>0; i--) if (work(i)) break;
};

const forForward = (from, work = i => { return false; }) => {
    for (let i=0; i<from.length; i++) if (work(i, from[i])) break;
};
const forBackward = (from, work = i => { return false; }) => {
    for (let i=from.length-1; i>=0; i--) if (work(i, from[i])) break;
};

const forin = (from, work = (k, v) => { return false; }) => {
    for (const k in from) if (work(k, from[k])) break;
};
const forinner = (from, work = v => { return false; }) => {
    for (const k in from) if (work(from[k])) break;
};

const forof = (from, work = v => { return false; }) => {
    for (const v of from) if (work(v)) break;
};
const forkv = (from, work = (k, v) => { return false; }) => {
    for (const [k, v] of Object.entries(from)) if (work(k, v)) break;
};

const whileIn = function (cond = function (self) { return true; }, work = function (self, count) { return false; }, self = {}) {
    forinner(self, (i, v) => this[i] = v);
    this.origin = self;
    this.cond = cond;
    this.work = work;
    let count = 0;
    while (this.cond(this)) if (this.work(this, count++)) break;
    return this;
};
const doWhileIn = function (cond = function (self) { return true; }, work = function (self, count) { return false; }, self = {}) {
    forinner(self, (i, v) => this[i] = v);
    this.origin = self;
    this.cond = cond;
    this.work = work;
    let count = 0;
    do if (this.work(this, count++)) break;
    while (this.cond(this));
    return this;
};


// meaning comparator constant
const typeOf = it => it === null ? NULL : typeof it;

const typeMatch = (it, type) => typeOf(it) == type;

const typeUndefined = it => typeMatch(it, UNDEFINED);
const typeFunction = it => typeMatch(it, FUNCTION);
const typeBoolean = it => typeMatch(it, BOOLEAN);
const typeString = it => typeMatch(it, STRING);
const typeSymbol = it => typeMatch(it, SYMBOL);
const typeNumber = it => typeMatch(it, NUMBER);
const typeBigint = it => typeMatch(it, BIGINT);
const typeObject = it => typeMatch(it, OBJECT);
const typeNull = it => typeMatch(it, NULL);

const instanceMatch = (it, cls = Object) => it instanceof cls;
const isObject = it => instanceMatch(it) && it !== null;
const isArray = it => instanceMatch(it, Array);
const isString = it => instanceMatch(it, String);
const isNumber = it => instanceMatch(it, Number);
const isSet = it => instanceMatch(it, Set);
const isMap = it => instanceMatch(it, Map);

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const differ = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

const exact = (...values) => values.reduce((accrue, value, index, array) => array[index-1] === value ? true : array.splice(index + 1) && false);
const notExact = (...values) => values.reduce((accrue, value, index, array) => array[index-1] !== value ? !(array.splice(index + 1) && false) : false);
const exactlyNot = (...values) => { let match = undefined; forToPrimeFrom(values.length - 1, i => !(match = values.includes(values.pop()))); return !match; };
const exactMatches = exact;
const notExactMatches = notExact;
const exactlyNotMatches = exactlyNot;

const equals = (a, b) => a == b;
const notEquals = (a, b) => a != b;

const gatherThan = (a, b) => a > b;
const lessThan = (a, b) => a < b;
const notGatherThan = (a, b) => !(a > b);
const notLessThan = (a, b) => !(a < b);

const gatherOrEquals = (a, b) => a >= b;
const lessOrEquals = (a, b) => a <= b;
const notGatherAndEquals = (a, b) => !(a >= b);
const notLessAndEquals = (a, b) => !(a <= b);

const isFalseCase = it => !it;
const isTrueCase = it => !!it;
const isNotFalseCase = it => !!it;

const isUndefined = it => it === undefined;
const isNull = it => it === null;
const isExactTrue = it => it === true;
const isExactFalse = it => it === false;

const isNotUndefined = it => it !== undefined;
const isNotNull = it => it !== null;
const isNotTrue = it => it !== true;
const isNotFalse = it => it !== false;

/** Checks whether the value is null or undefined. @param {*} it @returns {boolean} */
const isNully = it => it == null;
/** Checks whether the value is truthy. @param {*} it @returns {boolean} */
const isTruely = it => it == true;
/** Checks whether the value is falsy. @param {*} it @returns {boolean} */
const isFalsely = it => it == false;
/**
 * Checks whether the value is empty by type. undefined/null → true, string → length, array/object → length/size/keys.
 * @param {*} it - Value to check.
 * @param {number} [numberEmptyMatch=0] - Values at or below this number are considered empty.
 * @returns {boolean}
 */
const isEmpty = (it, numberEmptyMatch = 0) => typeCase(it, {
    [UNDEFINED]: _ => true,
    [NULL]: _ => true,
    [BOOLEAN]: v => !!v <= numberEmptyMatch,
    [NUMBER]: v => v <= numberEmptyMatch,
    [BIGINT]: v => v <= numberEmptyMatch,
    [STRING]: v => v.length <= numberEmptyMatch,
    [DEFAULT]: v => {
        const keys = Object.keys(v);
        if (keys.includes("length") && Number.isInteger(v.length)) return v.length <= numberEmptyMatch;
        if (keys.includes("size")) {
            const size = typeFunction(v.size) ? v.size() : v.size;
            if (Number.isInteger(size)) return size <= numberEmptyMatch;
        }
        return keys.length <= numberEmptyMatch
    },
});

/** Checks whether the value is not null/undefined. @param {*} it @returns {boolean} */
const isNotNully = it => it != null;
const isNotTruely = it => it != true;
const isNotFalsely = it => it != false;
/** Checks whether the value is not empty. @param {*} it @param {number} [numberEmptyMatch=0] @returns {boolean} */
const isNotEmpty = (it, numberEmptyMatch = 0) => !isEmpty(it, numberEmptyMatch);

/** Checks whether the value is null or empty. @param {*} it @param {number} [numberEmptyMatch=0] @returns {boolean} */
const isNullOrEmpty = (it, numberEmptyMatch = 0) => isNully(it) || isEmpty(it, numberEmptyMatch);
/**
 * Checks whether the value is not null and not empty. Aliased as `nne()` in alienese.
 * @param {*} it - Value to check.
 * @param {number} [numberEmptyMatch=0] - Values at or below this number are considered empty.
 * @returns {boolean} true if the value is meaningful.
 */
const isNotNullAndEmpty = (it, numberEmptyMatch = 0) => isNotNully(it) && isNotEmpty(it, numberEmptyMatch);


// quick execute by conditions constant
const ifNullOrEmpty = (val, work = () => {}, ornot = () => {}, numberEmptyMatch = 0) => executeIf(isNullOrEmpty(val, numberEmptyMatch), work, [], ornot);
const ifNotNullAndEmpty = (val, work = () => {}, ornot = () => {}, numberEmptyMatch = 0) => executeIf(isNotNullAndEmpty(val, numberEmptyMatch), work, [], ornot);


// do and return inline double takes
const doAndReturn = (does = (...args) => {}, returns, args = []) => { does(...args); return returns; };
const doAndReturnByExecute = (does = (...args) => {}, forReturns = (...args) => {}, args = []) => { does(...args); return forReturns(...arg); };


// object method shortcut constant
const keysOf = (object) => Object.keys(object);
const waysOf = keysOf;
const valuesOf = (object) => Object.values(object);
const looksOf = valuesOf;
const entriesOf = (object) => Object.entries(object);
const entireOf = entriesOf;
const countOf = (object) => keysOf(object).length;
const casesOf = countOf;

const checkCount = (object, checker = (k, v) => true) => {
    let count = 0;
    forin(entriesOf(object), ([k, v]) => executeIf(checker(k, v), _ => count++));
    return count;
};


// match case constant
const matchCase = (val, cases = { [DEFAULT]: val => {}, [FINALLY]: (more, returns, fore, val, key) => {} }, ignoreCase = false) => {
    let key, match;
    forin(cases, (k, v) => executeIf(k != DEFAULT && k != FORE_NOT_DEFAULT && k != MORE_NOT_DEFAULT && rx(k, ignoreCase ? "i" : "").test(val), () => doAndReturn(() => { key = k; match = v; }, true)));
    const isMatch = isNotNully(match);
    const foreNotDefault = FORE_NOT_DEFAULT in cases ? cases[FORE_NOT_DEFAULT] : (val => val);
    const moreNotDefault = MORE_NOT_DEFAULT in cases ? cases[MORE_NOT_DEFAULT] : (val => val);
    const defaultCase = cases[DEFAULT];
    const finallyCase = FINALLY in cases ? cases[FINALLY] : (val => val);
    const fore = isMatch ? (typeFunction(foreNotDefault) ? foreNotDefault(val) : foreNotDefault) : val;
    const returns = isMatch ? (typeFunction(match) ? match(fore, val) : match) : (typeFunction(defaultCase) ? defaultCase(val) : defaultCase);
    const more = isMatch ? (typeFunction(moreNotDefault) ? moreNotDefault(returns, fore, val, key) : moreNotDefault) : returns;
    const returnFinal = typeFunction(finallyCase) ? finallyCase(more, returns, fore, val, key) : finallyCase;
    return returnFinal;
};
const equalCase = (val, cases = { [DEFAULT]: val => {}, [FINALLY]: (more, returns, fore, val, key) => {} }, ignoreCase = false) => {
    let key, match;
    const vlc = typeOf(val) == STRING ? val.toLowerCase() : val;
    forin(cases, (k, v) => executeIf(k != DEFAULT && k != FORE_NOT_DEFAULT && k != MORE_NOT_DEFAULT && (ignoreCase ? (typeOf(k) == STRING ? k.toLowerCase() : k) == vlc : k == val), () => doAndReturn(() => { key = k; match = v; }, true)));
    const isMatch = isNotNully(match);
    const foreNotDefault = FORE_NOT_DEFAULT in cases ? cases[FORE_NOT_DEFAULT] : (val => val);
    const moreNotDefault = MORE_NOT_DEFAULT in cases ? cases[MORE_NOT_DEFAULT] : (val => val);
    const defaultCase = cases[DEFAULT];
    const finallyCase = FINALLY in cases ? cases[FINALLY] : (val => val);
    const fore = isMatch ? (typeFunction(foreNotDefault) ? foreNotDefault(val) : foreNotDefault) : val;
    const returns = isMatch ? (typeFunction(match) ? match(fore, val) : match) : (typeFunction(defaultCase) ? defaultCase(val) : defaultCase);
    const more = isMatch ? (typeFunction(moreNotDefault) ? moreNotDefault(returns, fore, val, key) : moreNotDefault) : returns;
    const returnFinal = typeFunction(finallyCase) ? finallyCase(more, returns, fore, val, key) : finallyCase;
    return returnFinal;
};
const exactCase = (val, cases = { [DEFAULT]: val => {}, [FINALLY]: (more, returns, fore, val) => {} }) => {
    const match = cases[val];
    const isMatch = isNotNully(match);
    const foreNotDefault = FORE_NOT_DEFAULT in cases ? cases[FORE_NOT_DEFAULT] : (val => val);
    const moreNotDefault = MORE_NOT_DEFAULT in cases ? cases[MORE_NOT_DEFAULT] : (val => val);
    const defaultCase = cases[DEFAULT];
    const finallyCase = FINALLY in cases ? cases[FINALLY] : (val => val);
    const fore = isMatch ? (typeFunction(foreNotDefault) ? foreNotDefault(val) : foreNotDefault) : val;
    const returns = isMatch ? (typeFunction(match) ? match(fore, val) : match) : (typeFunction(defaultCase) ? defaultCase(val) : defaultCase);
    const more = isMatch ? (typeFunction(moreNotDefault) ? moreNotDefault(returns, fore, val) : moreNotDefault) : returns;
    const returnFinal = typeFunction(finallyCase) ? finallyCase(more, returns, fore, val) : finallyCase;
    return returnFinal;
};
const typeCase = (variable, cases = { [DEFAULT]: variable => {}, [FINALLY]: (more, returns, fore, variable, type) => {} }) => {
    const type = typeOf(variable);
    const match = cases[type];
    const isMatch = isNotNully(match);
    const foreNotDefault = FORE_NOT_DEFAULT in cases ? cases[FORE_NOT_DEFAULT] : (variable => variable);
    const moreNotDefault = MORE_NOT_DEFAULT in cases ? cases[MORE_NOT_DEFAULT] : (variable => variable);
    const defaultCase = cases[DEFAULT];
    const finallyCase = FINALLY in cases ? cases[FINALLY] : (variable => variable);
    const fore = isMatch ? (typeFunction(foreNotDefault) ? foreNotDefault(variable) : foreNotDefault) : variable;
    const returns = isMatch ? (typeFunction(match) ? match(fore, variable) : match) : (typeFunction(defaultCase) ? defaultCase(variable) : defaultCase);
    const more = isMatch ? (typeFunction(moreNotDefault) ? moreNotDefault(returns, fore, variable, type) : moreNotDefault) : returns;
    const returnFinal = typeFunction(finallyCase) ? finallyCase(more, returns, fore, variable, type) : finallyCase;
    return returnFinal;
};
const classCase = (object, cases = { [DEFAULT]: object => {}, [FINALLY]: (more, returns, fore, object, className) => {} }) => {
    const className = object.constructor.name;
    const match = cases[className];
    const isMatch = isNotNully(match);
    const foreNotDefault = FORE_NOT_DEFAULT in cases ? cases[FORE_NOT_DEFAULT] : (object => object);
    const moreNotDefault = MORE_NOT_DEFAULT in cases ? cases[MORE_NOT_DEFAULT] : (object => object);
    const defaultCase = cases[DEFAULT];
    const finallyCase = FINALLY in cases ? cases[FINALLY] : (object => object);
    const fore = isMatch ? (typeFunction(foreNotDefault) ? foreNotDefault(object) : foreNotDefault) : object;
    const returns = isMatch ? (typeFunction(match) ? match(fore, object) : match) : (typeFunction(defaultCase) ? defaultCase(object) : defaultCase);
    const more = isMatch ? (typeFunction(moreNotDefault) ? moreNotDefault(returns, fore, object, className) : moreNotDefault) : returns;
    const returnFinal = typeFunction(finallyCase) ? finallyCase(more, returns, fore, object, className) : finallyCase;
    return returnFinal;
};
const kindCase = (kindFrom, cases = { [DEFAULT]: val => {}, [FINALLY]: (more, returns, fore, value, kind) => {} }) => typeCase(kindFrom, { ...cases, [OBJECT]: () => classCase(kindFrom, { ...cases, [FINALLY]: undefined }) });


/** variable data copy */
const copy = (from, dataOnly = true, primitiveOnly = false, recusive = true) => isNully(from) ? from : typeCase(from, {
    [OBJECT]: val => {
        const proto = Object.getPrototypeOf(val);
        if (proto != n && proto !== Object.prototype && !primitiveOnly) try {
            return structuredClone(val);
        } catch (e) {
            // structuredClone not supported
        }
        const object = new val.constructor();
        if (dataOnly || primitiveOnly) {
            for (const key in val) if (isNully(val) || typeCase(val[key], {
                [FUNCTION]: _ => !dataOnly,
                [OBJECT]: _ => !primitiveOnly,
                [DEFAULT]: _ => true
            })) object[key] = recusive ? copy(val[key], dataOnly, primitiveOnly, recusive) : val[key];
        } else for (const key in val) object[key] = copy(val[key], dataOnly, primitiveOnly);
        return object;
    },
    [DEFAULT]: val => val
});
/** Object data only shallow copy */
const mock = from => copy(from, true, false, true);
/** Object data only deep copy */
const mimic = from => copy(from, true, false, true);
/** Object functional shallow copy */
const twin = from => copy(from, false, false, false);
/** Object functional deep copy */
const clone = from => copy(from, false, false, true);

/** object data patch */
const patch = (to, from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) => {
    if (!append) for (const key in to) if (typeUndefined(from[key]) && typeCase(to[key], {
        [FUNCTION]: _ => !dataOnly,
        [OBJECT]: _ => !primitiveOnly,
        [DEFAULT]: _ => true
    })) delete to[key];
    for (const key in from) if (isNully(from[key])) to[key] = from[key];
    else typeCase(from[key], {
        [FUNCTION]: val => {
            if (!dataOnly) to[key] = val;
        },
        [OBJECT]: val => {
            if (!primitiveOnly) {
                if (recusive) {
                    if (isNully(to[key])) to[key] = from[key].constructor();
                    patch(to[key], val, dataOnly, primitiveOnly, recusive, append);
                } else to[key] = val;
            }
        },
        [DEFAULT]: val => to[key] = val
    });
    return to;
};
/** object data overwrite */
const overwrite = (to, from) => patch(to, from, false, false, true, false);
/** object data takeover */
const takeover = (to, from) => patch(to, from, false, false, true, true);
/** object data acquire */
const acquire = (to, from) => patch(to, from, true, false, true, false);
/** object data inherit */
const inherit = (to, from) => patch(to, from, true, false, true, true);

const revert = (to, from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) => {
    fromKeys = keysOf(from);
    toKeys = keysOf(to);
    scanKeys = exceptNew ? fromKeys : [...new Set([...fromKeys, ...toKeys])];
    for (const key of scanKeys) if (exceptNew || fromKeys.includes(key)) {
        if (isNully(from[key])) to[key] = from[key];
        else typeCase(from[key], {
            [FUNCTION]: val => {
                if (!dataOnly) to[key] = val;
            },
            [OBJECT]: val => {
                if (!primitiveOnly) {
                    if (recusive) revert(to[key], val, dataOnly, primitiveOnly, recusive, exceptNew);
                    else to[key] = val;
                }
            },
            [DEFAULT]: val => to[key] = val,
        });
    } else if (isNully(to[key]) || typeCase(to[key], {
        [FUNCTION]: _ => !dataOnly,
        [OBJECT]: _ => !primitiveOnly,
        [DEFAULT]: _ => true
    })) delete to[key];
};


/** run handle — async execution utilities */
/** Schedules a task on the microtask queue via setTimeout(process, 0). @param {Function} process @param {...*} args @returns {number} timer ID */
const postQueue = (process = (...args) => args[0], ...args) => setTimeout(process, 0, ...args);
/** Delayed execution via setTimeout(process, delay). @param {Function} process @param {number} [delay=100] @param {...*} args @returns {number} */
const postDelayed = (process = (...args) => args[0], delay = 100, ...args) => setTimeout(process, delay, ...args);
/** Wraps process(resolve, reject, ...args) in a Promise. @param {Function} process @param {...*} args @returns {Promise<*>} */
const postPromise = (process = (rs, rj, ...args) => rs(args[0]), ...args) => new Promise((rs, rj) => process(rs, rj, ...args));
/** Executes a Promise after a delay. @param {Function} process @param {number} [delay=100] @param {...*} args @returns {Promise<*>} */
const postBonded = (process = (rs, rj, ...args) => rs(args[0]), delay = 100, ...args) => new Promise((rs, rj) => setTimeout(process, delay, rs, rj, ...args));
/** setTimeout(0) + Promise combination. @param {Function} process @param {...*} args @returns {Promise<*>} */
const postPromiseQueue = (process = (rs, rj, ...args) => rs(args[0]), ...args) => new Promise((rs, rj) => setTimeout(process, 0, rs, rj, ...args));
/** Immediately executes an async function. @param {Function} process @param {...*} args @returns {Promise<*>} */
const postAsyncQueue = (process = async (...args) => args[0], ...args) => process(...args);
/** Executes an async function with await. @param {Function} process @param {...*} args @returns {Promise<*>} */
const postAwaitQueue = async (process = async (...args) => args[0], ...args) => await process(...args);
/** Executes on the next frame via requestAnimationFrame. @param {Function} process @param {...*} args @returns {number} */
const postFrameQueue = (process = (...args) => args[0], ...args) => requestAnimationFrame(() => process(...args));
/** requestAnimationFrame + Promise combination. @param {Function} process @param {...*} args @returns {Promise<*>} */
const postFramePromise = (process = (rs, rj, ...args) => rs(args[0]), ...args) => new Promise((rs, rj) => requestAnimationFrame(() => process(rs, rj, ...args)));


// Additional classes
class Time {
    static get dayMillis() { return 86400000; }
    static get hourMillis() { return 3600000; }
    static get minuteMillis() { return 60000; }
    static get secondMillis() { return 1000; }

    static get millisUnitsArray() { return [this.hourMillis, this.minuteMillis, this.secondMillis, 1]; }

    static fromDate(date) { return new Time(date); }
    static fromDateTime(date) { return new Time(date.time, null, null, null, date.zoneOffset); }
    static fromString(str) { return new Time(str); }
    static fromArray(arr) { return new Time(arr); }

    static get now() { return Time.fromDate(new Date()); }


    #time = 0;
    #timezoneOffset = 0;

    constructor(hours = 0, minutes = 0, seconds = 0, milliseconds = 0, timezoneOffset = (hours instanceof Date ? hours : Date.new).zoneOffset) {
        this.#timezoneOffset = timezoneOffset;
        kindCase(hours, {
            [_DATE]: date => {
                this.timeGMT = (((date.hours * 60) + date.minutes) * 60 + date.seconds) * 1000 + date.millis;
            },
            [_TIME]: time => {
                this.#time = time.time;
            },
            [_ARRAY]: arr => {
                const [h, m, s, ms] = arr;
                this.timeGMT = ((((h ?? 0) * 60) + (m ?? 0)) * 60 + (s ?? 0)) * 1000 + (ms ?? 0);
            },
            [STRING]: str => {
                let isNegative = false;
                if (str.startsWith("-")) {
                    isNegative = true;
                    str = str.slice(1);
                }
                let daysPart = 0;
                if (str.includes(" ")) {
                    const [daysStr, timeStr] = str.split(" ");
                    daysPart = Number(daysStr) * Time.dayMillis;
                    str = timeStr;
                }
                const [hms, ms] = str.split(".");
                const parts = hms.split(":").map(it => Number(it));
                const [h, m, s] = parts;
                this.timeGMT = (daysPart + (((h * 60) + m) * 60 + s) * 1000 + Number(ms)) * (isNegative ? -1 : 1);
            },
            [NUMBER]: _ => {
                if (isNully(minutes) && isNully(seconds) && isNully(milliseconds)) {
                    this.#time = hours;
                } else {
                    this.timeGMT = (((hours * 60) + minutes) * 60 + seconds) * 1000 + milliseconds;
                }
            },
            [NULL]: _ => {
                const now = new Date();
                this.timeGMT = (((now.hours * 60) + now.minutes) * 60 + now.seconds) * 1000 + now.millis;
            },
            [UNDEFINED]: _ => {
                const now = new Date();
                this.timeGMT = (((now.hours * 60) + now.minutes) * 60 + now.seconds) * 1000 + now.millis;
            },
            [DEFAULT]: _ => {
                console.warn("Time constructor received unsupported type:", typeOf(hours));
            },
        });
    }

    get time() { return this.#time; }
    set time(val) { this.#time = val; }

    get timeAbsolute() { return Math.abs(this.#time); }
    set timeAbsolute(val) {
        const valAbs = Math.abs(val);
        this.#time = this.isNegative ? -valAbs : valAbs;
    }
    get timeAbs() { return this.timeAbsolute; }
    set timeAbs(val) {
        const valAbs = Math.abs(val);
        this.#time = this.isNegative ? -valAbs : valAbs;
    }

    get timeGMT() { return this.#time + (this.#timezoneOffset * Time.minuteMillis); }
    set timeGMT(val) { this.#time = val - (this.#timezoneOffset * Time.minuteMillis); }

    get isNegative() { return this.timeGMT < 0; }
    set isNegative(val) {
        if (val && this.isPositive) this.timeGMT = -this.timeGMT;
        else if (!val && this.isNegative) this.timeGMT = -this.timeGMT;
    }
    get isPositive() { return this.timeGMT >= 0; }
    set isPositive(val) {
        if (val && this.isNegative) this.timeGMT = -this.timeGMT;
        else if (!val && this.isPositive) this.timeGMT = -this.timeGMT;
    }

    get negativePrefix() { return this.isNegative ? "-" : ""; }
    get positivePrefix() { return this.isPositive ? "+" : ""; }

    get dayAndMillis() { return [Math.floor(this.timeGMT / Time.dayMillis), this.timeGMT % Time.dayMillis]; }
    get hourAndMillis() { return [Math.floor(this.timeGMT / Time.hourMillis), this.timeGMT % Time.hourMillis]; }
    get minuteAndMillis() { return [Math.floor(this.timeGMT / Time.minuteMillis), this.timeGMT % Time.minuteMillis]; }
    get secondAndMillis() { return [Math.floor(this.timeGMT / Time.secondMillis), this.timeGMT % Time.secondMillis]; }

    get days() { return Math.floor(this.timeGMT / Time.dayMillis); }
    set days(val) { this.timeGMT = (val * Time.dayMillis) + this.millisInDay; }
    get daysAbs() { return Math.abs(this.days); }
    get millisInDay() { return this.timeGMT % Time.dayMillis; }
    set millisInDay(val) { this.timeGMT = (this.days * Time.dayMillis) + val; }

    get daysAndMillis() { return [this.days, this.millisInDay]; }
    set daysAndMillis(val) {
        const [days, millisInDay] = val;
        this.timeGMT = (days * Time.dayMillis) + millisInDay;
    }

    get hours() { return Math.floor(this.millisInDay / Time.dayMillis); }
    set hours(val) { this.timeGMT = (this.days * Time.dayMillis) + (val * Time.hourMillis) + this.millisInHour; }
    get hoursAbs() { return Math.abs(this.hours); }
    get hours12() { const hours = this.hours % 12; return hours == 0 ? (hours < 0 ? -12 : 12) : hours; }
    get hours12Abs() { return Math.abs(this.hours12); }
    get digitHours() { return this.hoursAbs.toString().padStart(2, "0"); }
    set digitHours(val) { this.hours = Number(val); }
    get digitHoursWithNegative() { return this.negativePrefix + this.digitHours; }
    get millisInHour() { return this.millisInDay % Time.hourMillis; }
    set millisInHour(val) { this.timeGMT = (this.days * Time.dayMillis) + (this.hours * Time.hourMillis) + val; }
    
    get hoursAndMillis() { return [this.hours, this.millisInHour]; }
    set hoursAndMillis(val) {
        const [hours, millisInHour] = val;
        this.timeGMT = (this.days * Time.dayMillis) + (hours * Time.hourMillis) + millisInHour;
    }

    get minutes() { return Math.floor(this.millisInHour / Time.minuteMillis); }
    set minutes(val) { this.timeGMT = (this.days * Time.dayMillis) + (this.hours * Time.hourMillis) + (val * Time.minuteMillis) + this.millisInMinute; }
    get minutesAbs() { return Math.abs(this.minutes); }
    get digitMinutes() { return this.minutesAbs.toString().padStart(2, "0"); }
    set digitMinutes(val) { this.minutes = Number(val); }
    get digitMinutesWithNegative() { return this.negativePrefix + this.digitMinutes; }
    get millisInMinute() { return this.millisInHour % Time.minuteMillis; }
    set millisInMinute(val) { this.timeGMT = (this.days * Time.dayMillis) + (this.hours * Time.hourMillis) + (this.minutes * Time.minuteMillis) + val; }

    get minutesAndMillis() { return [this.minutes, this.millisInMinute]; }
    set minutesAndMillis(val) {
        const [minutes, millisInMinute] = val;
        this.timeGMT = (this.days * Time.dayMillis) + (this.hours * Time.hourMillis) + (minutes * Time.minuteMillis) + millisInMinute;
    }

    get seconds() { return Math.floor(this.millisInMinute / Time.secondMillis); }
    set seconds(val) { this.timeGMT = (this.days * Time.dayMillis) + (this.hours * Time.hourMillis) + (this.minutes * Time.minuteMillis) + (val * Time.secondMillis) + this.milliseconds; }
    get secondsAbs() { return Math.abs(this.seconds); }
    get digitSeconds() { return this.secondsAbs.toString().padStart(2, "0"); }
    set digitSeconds(val) { this.seconds = Number(val); }
    get digitSecondsWithNegative() { return this.negativePrefix + this.digitSeconds; }

    get secondsAndMillis() { return [this.seconds, this.milliseconds]; }
    set secondsAndMillis(val) {
        const [seconds, milliseconds] = val;
        this.timeGMT = (this.days * Time.dayMillis) + (this.hours * Time.hourMillis) + (this.minutes * Time.minuteMillis) + (seconds * Time.secondMillis) + milliseconds;
    }

    get milliseconds() { return this.millisInMinute % Time.secondMillis; }
    set milliseconds(val) { this.timeGMT = (this.days * Time.dayMillis) + (this.hours * Time.hourMillis) + (this.minutes * Time.minuteMillis) + (this.seconds * Time.secondMillis) + val; }
    get millis() { return this.milliseconds; }
    set millis(val) { this.milliseconds = val; }
    get millisAbs() { return Math.abs(this.milliseconds); }
    get digitMillis() { return this.millisAbs.toString().padStart(3, "0"); }
    set digitMillis(val) { this.milliseconds = Number(val); }
    get digitMillisWithNegative() { return this.negativePrefix + this.digitMillis; }


    get array() {
        const [hm, mm, sm] = Time.millisUnitsArray;
        let totalMillis = this.timeAbsolute;
        const hours = Math.floor(totalMillis / hm);
        totalMillis -= hours * hm;
        const minutes = Math.floor(totalMillis / mm);
        totalMillis -= minutes * mm;
        const seconds = Math.floor(totalMillis / sm);
        const milliseconds = totalMillis - (seconds * sm);
        return [hours, minutes, seconds, milliseconds];
    }
    set array(val) {
        const [hours, minutes, seconds, milliseconds] = val;
        this.timeGMT = (((hours * 60) + minutes) * 60 + seconds) * 1000 + milliseconds;
    }
    
    get hourMinutesIntArray() { return [this.hours, this.minutes]; }
    get hourMinutesArray() { return [this.digitHours, this.digitMinutes]; }
    get hourMinutes() { return this.hourMinutesArray.join(":"); }
    get hourMinutesWithNegative() { return this.negativePrefix + this.hourMinutes; }
    get minuteSecondsIntArray() { return [this.minutes, this.seconds]; }
    get minuteSecondsArray() { return [this.digitMinutes, this.digitSeconds]; }
    get minuteSeconds() { return this.minuteSecondsArray.join(":"); }
    get minuteSecondsWithNegative() { return this.negativePrefix + this.minuteSeconds; }
    get secondMillisIntArray() { return [this.seconds, this.milliseconds]; }
    get secondMillisArray() { return [this.digitSeconds, this.digitMillis]; }
    get secondMillis() { return this.secondMillisArray.join("."); }
    get secondMillisWithNegative() { return this.negativePrefix + this.secondMillis; }

    get timeArray() { return [this.hours, this.minutes, this.seconds]; }
    get timeStringArray() { return [this.digitHours, this.digitMinutes, this.digitSeconds]; }
    get timeString() { return this.timeArray.join(":"); }
    get timeStringWithNegative() { return this.negativePrefix + this.timeString; }
    get hmsArray() { return this.timeArray; }
    get hhmmssArray() { return this.timeStringArray; }
    get hhmmss() { return this.timeString; }
    get hhmmssWithNegative() { return this.timeStringWithNegative; }
    get hhmmssAndMillis() { return [this.hhmmss, this.digitMillis]; }

    get timeArrayWithMillis() { return [this.hours, this.minutes, this.seconds, this.milliseconds]; }
    get timeStringArrayWithMillis() { return [this.digitHours, this.digitMinutes, this.digitSeconds, this.digitMillis]; }
    get timeStringWithMillis() { return this.timeString + "." + this.digitMillis; }
    get timeStringWithMillisWithNegative() { return this.negativePrefix + this.timeStringWithMillis; }
    get hmsmsArray() { return this.timeArrayWithMillis; }
    get hhmmssmsArray() { return this.timeStringArrayWithMillis; }
    get hhmmssms() { return this.timeStringWithMillis; }
    get hhmmssmsWithNegative() { return this.timeStringWithMillisWithNegative; }
    

    get digitArray() { return [this.digitHours, this.digitMinutes, this.digitSeconds, this.digitMillis]; }
    set digitArray(val) {
        const [hours, minutes, seconds, milliseconds] = val.map(it => Number(it));
        this.timeGMT = (((hours * 60) + minutes) * 60 + seconds) * 1000 + milliseconds;
    }

    get arrayWithDays() { return [this.days, ...this.timeArray, ]; }
    set arrayWithDays(val) {
        const [days, hours, minutes, seconds, milliseconds] = val;
        this.timeGMT = (days * Time.dayMillis) + (((hours * 60) + minutes) * 60 + seconds) * 1000 + milliseconds;
    }
    
    get digitArrayWithDays() { return [this.days.toString(), ...this.digitArray]; }
    set digitArrayWithDays(val) {
        const [days, hours, minutes, seconds, milliseconds] = val.map(it => Number(it));
        this.timeGMT = (days * Time.dayMillis) + (((hours * 60) + minutes) * 60 + seconds) * 1000 + milliseconds;
    }

    toString() {
        const days = this.daysAbs;
        return this.negativePrefix + (days > 0 ? days + " " : "") + this.hhmmssAndMillis.join(".");
    }
    toArray() { return this.array; }
    valueOf() { return this.toString(); }

    dateOn(baseDate = new Date()) {
        const date = new Date(baseDate);
        date.setHours(...this.timeArrayWithMillis);
        return date;
    }
    dateAddTo(baseDate = new Date()) {
        const date = new Date(baseDate.getTime() + this.timeGMT);
        return date;
    }
}



// Object function shortcut constants
const defineStaticProperty = (cls, name, value, wa = true, ca = true, ea = false, extras = {}) => Object.defineProperty(cls, name, {
    value,
    writable: wa,
    configurable: ca,
    enumerable: ea,
    ...extras,
});
const defineProperty = (cls, name, value, wa = true, ca = true, ea = false, extras = {}) => defineStaticProperty(cls.prototype, name, value, wa, ca, ea, extras);
// Object.defineProperty(cls.prototype, name, {
//     // get value() { return tc(value, {
//     //     // [FUNCTION]: it => it,//function (...args) { return (value.bind(this))(...args); },
//     //     // [DEFAULT]: it => cls(it),
//     //     [BOOLEAN]: it => Boolean(it),
//     //     [NUMBER]: it => Number(it),
//     //     [STRING]: it => String(it),
//     //     [BIGINT]: it => BigInt(it),
//     //     [DEFAULT]: it => it,
//     // }); },
//     value,
//     writable: wa,
//     configurable: ca,
//     enumerable: ea,
//     ...extras,
// });
const definePropertyPlex = (name, value, wa = true, ca = true, ea = false, classes = [Object, Function, String, Number, Boolean, BigInt], extras = {}) => forof(classes, cls => defineProperty(cls, name, value, wa, ca, ea, extras));
const ESTRE_MODERNISM_COMPATIBILITY_PREFIX = "__emcp_";
const defineStaticGetterAndSetter = (cls, name, gets, sets, ca = true, ea = false, extras = {}) => Object.defineProperty(cls, name, {
    "get": function () { return isNotUndefined(this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name]) ? this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name] : gets.bind(this)() },
    "set": function (val) { if (isUndefined(sets)) this[ESTRE_MODERNISM_COMPATIBILITY_PREFIX + name] = val; else sets.bind(this)(val); },
    configurable: ca,
    enumerable: ea,
    ...extras,
});
const defineGetterAndSetter = (cls, name, gets, sets, ca = true, ea = false, extras = {}) => defineStaticGetterAndSetter(cls.prototype, name, gets, sets, ca, ea, extras);
const defineGetterAndSetterPlex = (name, gets, sets, ca = true, ea = false, classes = [Object, Function, String, Number, Boolean, BigInt], extras = {}) => forof(classes, cls => defineGetterAndSetter(cls, name, gets, sets, ca, ea, extras));


// additional static function for classes
defineGetterAndSetter(Function, "new", function () { return new this(); });


// additional global prototype functions
defineGetterAndSetterPlex("it", function () { return classCase(this, { [_BOOLEAN]: it => it.valueOf(), [_NUMBER]: it => Number(it), [_STRING]: it => String(it), [_BIG_INT]: it => BigInt(it), [DEFAULT]: it => it }); });

definePropertyPlex("matchCase", function () { return matchCase(this.it, ...arguments); });
definePropertyPlex("equalCase", function () { return equalCase(this.it, ...arguments); });
definePropertyPlex("exactCase", function () { return exactCase(this.it, ...arguments); });
definePropertyPlex("typeCase", function () { return typeCase(this.it, ...arguments); });
definePropertyPlex("classCase", function () { return classCase(this.it, ...arguments); });
definePropertyPlex("kindCase", function () { return kindCase(this.it, ...arguments); });

definePropertyPlex("ifEmpty", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });
definePropertyPlex("ifNotEmpty", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isNotEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });

definePropertyPlex("doAndReturn", function (does = (it, args) => {}, returns, args = []) { return doAndReturn(does, returns, [this.it, ...args]); });
definePropertyPlex("doAndReturnByExecute", function (does = (it, args) => {}, forReturns, args = []) { return doAndReturnByExecute(does, forReturns, [this.it, ...args]); });

defineGetterAndSetter(Object, "ways", function () { return keysOf(this.it); });
defineGetterAndSetter(Object, "looks", function () { return valuesOf(this.it); });
defineGetterAndSetter(Object, "entire", function () { return entriesOf(this.it); });
defineGetterAndSetter(Object, "count", function () { return countOf(this.it); });
defineGetterAndSetter(Object, "checkCount", function () { return checkCount(this.it, (k, v) => true); });

defineProperty(Object, "forKeys", function (work = key => { return false; }) { return forof(this.it.ways, work); });
defineProperty(Object, "forWays", function (work = key => { return false; }) { return forof(this.it.ways, work); });
defineProperty(Object, "forValues", function (work = value => { return false; }) { return forof(this.it.looks, work); });
defineProperty(Object, "forLooks", function (work = value => { return false; }) { return forof(this.it.looks, work); });
defineProperty(Object, "forEntries", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });
defineProperty(Object, "forEntire", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });

defineProperty(Object, "keyOf", function (value) { for (const [key, val] of this.it.entire) if (val === value) return key; return undefined; });

defineProperty(Object, "takeIfWayOf", function (key, process = (value, key, host) => value, ornot = (key, host) => host[key]) { return key in this.it ? process(this.it[key], key, this.it) : ornot(key, this.it); });

defineProperty(Object, "copy", function (dataOnly = true, primitiveOnly = false, recusive = true) { return copy(this, dataOnly, primitiveOnly, recusive); });
defineGetterAndSetter(Object, "mock", function () { return mock(this); });
defineGetterAndSetter(Object, "mimic", function () { return mimic(this); });
defineGetterAndSetter(Object, "twin", function () { return twin(this); });
defineGetterAndSetter(Object, "clone", function () { return clone(this); });

defineProperty(Object, "patch", function (from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) { return patch(this.it, from, dataOnly, primitiveOnly, recusive, append); });
defineProperty(Object, "overwrite", function (from) { return overwrite(this.it, from); });
defineProperty(Object, "takeover", function (from) { return takeover(this.it, from); });
defineProperty(Object, "acquire", function (from) { return acquire(this.it, from); });
defineProperty(Object, "inherit", function (from) { return inherit(this.it, from); });

defineProperty(Object, "revert", function (from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) { return revert(this.it, from, dataOnly, primitiveOnly, recusive, exceptNew); });

// dpx("apply", function (process = it => it) { process.bind(this)(); return this.it; });
definePropertyPlex("also", function (process = it => it) { process(this.it); return this.it; });
// dpx("run", function (process = it => it) { return process.bind(this)(); });
definePropertyPlex("let", function (process = it => it) { return process(this.it); });
definePropertyPlex("wait", async function (process = async it => it) { return await process(this.it); });
definePropertyPlex("go", function (asyncProcess = (resolve, reject) => resolve(this.it)) { return new Promise(asyncProcess); });

definePropertyPlex("if", function (bool, process = it => it, ornot = it => {}) { return executeIf(bool, process, [this.it], ornot); });

definePropertyPlex("ifis", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it === that, process, [it], ornot)); });
definePropertyPlex("ifisnt", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it !== that, process, [it], ornot)); });

definePropertyPlex("ifEquals", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it == that, process, [it], ornot)); });
definePropertyPlex("ifNotEquals", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it != that, process, [it], ornot)); });


// additional primitive prototype functions
defineGetterAndSetter(Number, "abs", function () { return Math.abs(this.it); });
defineGetterAndSetter(Number, "int", function () { return parseInt(this.it); });
defineProperty(Number, "divided", function (by) { return this.it.let(it => [(it / by).int, it % by]); });
defineGetterAndSetter(Number, "string", function () { return this.it + ""; });
defineGetterAndSetter(Number, "pricision", function () { return this.it - this.int; });
defineGetterAndSetter(Number, "pricisionString", function () { return this.it.pricision.string.replace(/^0\./, ""); });
defineGetterAndSetter(Number, "pricisionInt", function () { return parseInt(this.it.pricisionString); });
defineGetterAndSetter(Number, "digit2", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(2, "0")); });
defineGetterAndSetter(Number, "digit3", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(3, "0")); });
defineGetterAndSetter(Number, "digit4", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(4, "0")); });
defineGetterAndSetter(Number, "digit5", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(5, "0")); });
defineGetterAndSetter(Number, "digit6", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(6, "0")); });
defineGetterAndSetter(Number, "digit7", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(7, "0")); });
defineGetterAndSetter(Number, "digit8", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(8, "0")); });
defineGetterAndSetter(Number, "digit9", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(9, "0")); });
defineGetterAndSetter(Number, "digit10", function () { return this.it.let(it => ((it < 0 ? "-" : "") + it.abs).padStart(10, "0")); });

defineGetterAndSetter(String, "lower", function () { return this.it.toLowerCase(); });
defineGetterAndSetter(String, "upper", function () { return this.it.toUpperCase(); });
defineGetterAndSetter(String, "capitalized", function () { return this.it.let(it => it[0].upper + it.substring(1)); });
defineGetterAndSetter(String, "int", function () { return parseInt(this.it); });
defineGetterAndSetter(String, "float", function () { return parseFloat(this.it); });
defineGetterAndSetter(String, "digit2", function () { return this.it.padStart(2, "0"); });
defineGetterAndSetter(String, "digit3", function () { return this.it.padStart(3, "0"); });
defineGetterAndSetter(String, "digit4", function () { return this.it.padStart(4, "0"); });
defineGetterAndSetter(String, "digit5", function () { return this.it.padStart(5, "0"); });
defineGetterAndSetter(String, "digit6", function () { return this.it.padStart(6, "0"); });
defineGetterAndSetter(String, "digit7", function () { return this.it.padStart(7, "0"); });
defineGetterAndSetter(String, "digit8", function () { return this.it.padStart(8, "0"); });
defineGetterAndSetter(String, "digit9", function () { return this.it.padStart(9, "0"); });
defineGetterAndSetter(String, "digit10", function () { return this.it.padStart(10, "0"); });

defineGetterAndSetter(Date, "year", function () { return this.getFullYear(); }, function (val) { this.setFullYear(val); });
defineGetterAndSetter(Date, "month0", function () { return this.getMonth(); }, function (val) { this.setMonth(val); });
defineGetterAndSetter(Date, "month", function () { return this.it.month0 + 1; }, function (val) { this.setMonth(val - 1); });
defineGetterAndSetter(Date, "date", function () { return this.getDate(); }, function (val) { this.setDate(val); });
defineGetterAndSetter(Date, "day", function () { return this.getDay(); }, function (val) { this.setDay(val); });
defineGetterAndSetter(Date, "dayEngChar2", function () { return ["su", "mo", "tu", "we", "th", "fr", "sa"][this.it.day]; });
defineGetterAndSetter(Date, "dayEngChar2Cap", function () { return this.it.dayEngChar2.capitalized; });
defineGetterAndSetter(Date, "dayEngChar2Up", function () { return this.it.dayEngChar2.upper; });
defineGetterAndSetter(Date, "dayEngShort", function () { return ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][this.it.day]; });
defineGetterAndSetter(Date, "dayEngShortCap", function () { return this.it.dayEngShort.capitalized; });
defineGetterAndSetter(Date, "dayEngShortUp", function () { return this.it.dayEngShort.upper; });
defineGetterAndSetter(Date, "dayEngPrefix", function () { return ["sun", "mon", "tues", "wednes", "thurs", "fri", "satur"][this.it.day]; });
defineGetterAndSetter(Date, "dayEngPrefixCap", function () { return this.it.dayEngPrefix.capitalized; });
defineGetterAndSetter(Date, "dayEngPrefixUp", function () { return this.it.dayEngPrefix.upper; });
defineGetterAndSetter(Date, "dayEng", function () { return this.it.dayEngPrefix + "day"; });
defineGetterAndSetter(Date, "dayEngCap", function () { return this.it.dayEng.capitalized; });
defineGetterAndSetter(Date, "dayEngUp", function () { return this.it.dayEng.upper; });
defineGetterAndSetter(Date, "dayKorShort", function () { return ["일", "월", "화", "수", "목", "금", "토"][this.it.day]; });
defineGetterAndSetter(Date, "dayKor", function () { return this.it.dayKorShort + "요일"; });
defineGetterAndSetter(Date, "dayHanjaShort", function () { return ["日", "月", "火", "水", "木", "金", "土"][this.it.day]; });
defineGetterAndSetter(Date, "dayHanja", function () { return this.it.dayHanjaShort + "曜日"; });
defineGetterAndSetter(Date, "dayJpnShort", function () { return ["日", "月", "火", "水", "木", "金", "土"][this.it.day]; });
defineGetterAndSetter(Date, "dayJpn", function () { return this.it.dayJpnShort + "曜日"; });
defineGetterAndSetter(Date, "dayChnShort", function () { return ["日", "一", "二", "三", "四", "五", "六"][this.it.day]; });
defineGetterAndSetter(Date, "dayChn", function () { return "周" + this.it.dayChnShort; });
defineGetterAndSetter(Date, "dayChnX", function () { return "星期" + this.it.dayChnShort; });
defineGetterAndSetter(Date, "dayCnT", function () { return "週" + this.it.dayChnShort; });
defineGetterAndSetter(Date, "dayCnTX", function () { return "星期" + this.it.dayChnShort; });
defineGetterAndSetter(Date, "yoil", function () { return this.it.dayKorShort; });
defineGetterAndSetter(Date, "YOIL", function () { return this.it.dayKor; });
defineGetterAndSetter(Date, "youbi", function () { return this.it.dayJpnShort; });
defineGetterAndSetter(Date, "YOUBI", function () { return this.it.dayJpn; });
defineGetterAndSetter(Date, "zhou", function () { return this.it.dayChn; });
defineGetterAndSetter(Date, "xingqi", function () { return this.it.dayChnX; });
defineGetterAndSetter(Date, "hours", function () { return this.getHours(); }, function (val) { this.setHours(val); });
defineGetterAndSetter(Date, "hours12", function () { const hours = this.getHours() % 12; return hours == 0 ? 12 : hours; });
defineGetterAndSetter(Date, "minutes", function () { return this.getMinutes(); }, function (val) { this.setMinutes(val); });
defineGetterAndSetter(Date, "seconds", function () { return this.getSeconds(); }, function (val) { this.setSeconds(val); });
defineGetterAndSetter(Date, "millis", function () { return this.getMilliseconds(); }, function (val) { this.setMilliseconds(val); });
defineGetterAndSetter(Date, "zoneOffset", function () { return this.getTimezoneOffset(); });
defineGetterAndSetter(Date, "zoneHours", function () { return this.it.zoneOffset / 60; });
defineGetterAndSetter(Date, "zoneMinutes", function () { return this.it.zoneOffset % 60; });
defineGetterAndSetter(Date, "isAM", function () { return this.it.hours < 12; }, function (val) { this.setHours(val); });
defineGetterAndSetter(Date, "isPM", function () { return this.it.hours >= 12; }, function (val) { this.setHours(val); });
defineGetterAndSetter(Date, "time", function () { return this.getTime(); }, function (val) { this.setTime(val); });
defineGetterAndSetter(Date, "unix", function () { return parseInt(this.it.time / 1000); });
defineGetterAndSetter(Date, "minutePoints", function () { return parseInt(this.it.unix / 60); });
defineGetterAndSetter(Date, "minutePointsLocal", function () { return this.it.let(it => it.minutePoints - it.zoneOffset); });
defineGetterAndSetter(Date, "hourPoints", function () { return parseInt(this.it.minutePoints / 60); });
defineGetterAndSetter(Date, "hourPointsLocal", function () { return this.it.let(it => it.hourPoints - it.zoneHours); });
defineGetterAndSetter(Date, "dateOffset", function () { return parseInt(this.it.hourPointsLocal / 24); });
defineGetterAndSetter(Date, "dayMinutes", function () { return this.it.let(it => (it.hours * 60) + it.minutes); });
defineGetterAndSetter(Date, "daySeconds", function () { return this.it.let(it => (it.dayMinutes * 60) + it.seconds); });
defineGetterAndSetter(Date, "dayMillis", function () { return this.it.let(it => (it.daySeconds * 1000) + it.millis); });
defineGetterAndSetter(Date, "yearMonthIntArray0", function () { return this.it.let(it => [it.year, it.month0]); });
defineGetterAndSetter(Date, "yearMonthIntArray", function () { return this.it.let(it => [it.year, it.month]); });
defineGetterAndSetter(Date, "yearMonthArray", function () { return this.it.let(it => [it.year.string, it.month.digit2]); });
defineGetterAndSetter(Date, "yearMonth", function () { return this.it.yearMonthArray.join("-"); });
defineGetterAndSetter(Date, "dateArray0", function () { return this.it.let(it => [it.year, it.month0, it.date]); });
defineGetterAndSetter(Date, "dateArray", function () { return this.it.let(it => [it.year, it.month, it.date]); });
defineGetterAndSetter(Date, "dateStringArray", function () { return this.it.let(it => [it.year.string, it.month.digit2, it.date.digit2]); });
defineGetterAndSetter(Date, "dateString", function () { return this.it.dateStringArray.join("-"); });
defineGetterAndSetter(Date, "hourMinutesIntArray", function () { return this.it.let(it => [it.hours, it.minutes]); });
defineGetterAndSetter(Date, "hourMinutesArray", function () { return this.it.hourMinutesIntArray.map(it => it.digit2); });
defineGetterAndSetter(Date, "hourMinutes", function () { return this.it.hourMinutesArray.join(":"); });
defineGetterAndSetter(Date, "timeArray", function () { return this.it.let(it => [it.hours, it.minutes, it.seconds]); });
defineGetterAndSetter(Date, "timeStringArray", function () { return this.it.timeArray.map(it => it.digit2); });
defineGetterAndSetter(Date, "timeString", function () { return this.it.timeStringArray.join(":"); });
defineGetterAndSetter(Date, "timePart", function () { return new Time(this.it); });
defineGetterAndSetter(Date, "asTime", function () { return Time.fromDateTime(this.it); });
defineProperty(Date, "setDayTime", function (time, m, s, ms) { return this.it.setHours(...(time instanceof Time ? time.timeArrayWithMillis : arguments)); });
defineProperty(Date, "addTime", function (time) { return this.it.time += time instanceof Time ? time.time : new Time(...arguments).time; });



// Bind to global when not a browser
if (typeof window === UNDEFINED) {
    defineGlobal("UNDEFINED", UNDEFINED);
    defineGlobal("NULL", NULL);
    defineGlobal("TRUE", TRUE);
    defineGlobal("FALSE", FALSE);
    
    defineGlobal("FUNCTION", FUNCTION);
    defineGlobal("BOOLEAN", BOOLEAN);
    defineGlobal("STRING", STRING);
    defineGlobal("SYMBOL", SYMBOL);
    defineGlobal("NUMBER", NUMBER);
    defineGlobal("BIGINT", BIGINT);
    defineGlobal("OBJECT", OBJECT);

    defineGlobal("_FUNCTION", _FUNCTION);
    defineGlobal("_BOOLEAN", _BOOLEAN);
    defineGlobal("_STRING", _STRING);
    defineGlobal("_SYMBOL", _SYMBOL);
    defineGlobal("_NUMBER", _NUMBER);
    defineGlobal("_BIG_INT", _BIG_INT);
    defineGlobal("_OBJECT", _OBJECT);
    
    defineGlobal("_DATE", _DATE);
    defineGlobal("_TIME", _TIME);

    defineGlobal("_ARRAY", _ARRAY);
    defineGlobal("_SET", _SET);
    defineGlobal("_MAP", _MAP);


    defineGlobal("DEFAULT", DEFAULT);
    defineGlobal("FINALLY", FINALLY);


    defineGlobal("executeIf", executeIf);
    defineGlobal("executeWhen", executeWhen);

    defineGlobal("ifReturn", ifReturn);

    defineGlobal("ifReturnOrEmptyNumber", ifReturnOrEmptyNumber);
    defineGlobal("ifReturnOrEmptyString", ifReturnOrEmptyString);
    defineGlobal("ifReturnOrEmptyArray", ifReturnOrEmptyArray);
    defineGlobal("ifReturnOrEmptyObject", ifReturnOrEmptyObject);

    defineGlobal("valet", valet);


    defineGlobal("forZeroToBefore", forZeroToBefore);
    defineGlobal("forZeroToReach", forZeroToReach);

    defineGlobal("forToZeroFrom", forToZeroFrom);
    defineGlobal("forToPrimeFrom", forToPrimeFrom);

    defineGlobal("forForward", forForward);
    defineGlobal("forBackward", forBackward);

    defineGlobal("forin", forin);
    defineGlobal("forinner", forinner);

    defineGlobal("forof", forof);
    defineGlobal("forkv", forkv);

    defineGlobal("whileIn", whileIn);
    defineGlobal("doWhileIn", doWhileIn);

    defineGlobal("typeOf", typeOf);

    defineGlobal("typeMatch", typeMatch);

    defineGlobal("typeUndefined", typeUndefined);
    defineGlobal("typeFunction", typeFunction);
    defineGlobal("typeBoolean", typeBoolean);
    defineGlobal("typeString", typeString);
    defineGlobal("typeSymbol", typeSymbol);
    defineGlobal("typeNumber", typeNumber);
    defineGlobal("typeBigint", typeBigint);
    defineGlobal("typeObject", typeObject);
    defineGlobal("typeNull", typeNull);

    defineGlobal("instanceMatch", instanceMatch);
    defineGlobal("isObject", isObject);
    defineGlobal("isArray", isArray);
    defineGlobal("isString", isString);
    defineGlobal("isNumber", isNumber);
    defineGlobal("isSet", isSet);
    defineGlobal("isMap", isMap);

    defineGlobal("same", same);
    defineGlobal("differ", differ);

    defineGlobal("exact", exact);
    defineGlobal("notExact", notExact);
    defineGlobal("exactlyNot", exactlyNot);
    defineGlobal("exactMatches", exactMatches);
    defineGlobal("notExactMatches", notExactMatches);
    defineGlobal("exactlyNotMatches", exactlyNotMatches);

    defineGlobal("equals", equals);
    defineGlobal("notEquals", notEquals);

    defineGlobal("gatherThan", gatherThan);
    defineGlobal("lessThan", lessThan);
    defineGlobal("notGatherThan", notGatherThan);
    defineGlobal("notLessThan", notLessThan);

    defineGlobal("gatherOrEquals", gatherOrEquals);
    defineGlobal("lessOrEquals", lessOrEquals);
    defineGlobal("notGatherAndEquals", notGatherAndEquals);
    defineGlobal("notLessAndEquals", notLessAndEquals);

    defineGlobal("isFalseCase", isFalseCase);
    defineGlobal("isTrueCase", isTrueCase);
    defineGlobal("isNotFalseCase", isNotFalseCase);

    defineGlobal("isUndefined", isUndefined);
    defineGlobal("isNull", isNull);
    defineGlobal("isExactTrue", isExactTrue);
    defineGlobal("isExactFalse", isExactFalse);

    defineGlobal("isNotUndefined", isNotUndefined);
    defineGlobal("isNotNull", isNotNull);
    defineGlobal("isNotTrue", isNotTrue);
    defineGlobal("isNotFalse", isNotFalse);

    defineGlobal("isNully", isNully);
    defineGlobal("isTruely", isTruely);
    defineGlobal("isFalsely", isFalsely);
    defineGlobal("isEmpty", isEmpty);

    defineGlobal("isNotNully", isNotNully);
    defineGlobal("isNotTruely", isNotTruely);
    defineGlobal("isNotFalsely", isNotFalsely);
    defineGlobal("isNotEmpty", isNotEmpty);

    defineGlobal("isNullOrEmpty", isNullOrEmpty);
    defineGlobal("isNotNullAndEmpty", isNotNullAndEmpty);


    defineGlobal("ifNullOrEmpty", ifNullOrEmpty);
    defineGlobal("ifNotNullAndEmpty", ifNotNullAndEmpty);


    defineGlobal("doAndReturn", doAndReturn);
    defineGlobal("doAndReturnByExecute", doAndReturnByExecute);


    defineGlobal("keysOf", keysOf);
    defineGlobal("waysOf", waysOf);
    defineGlobal("valuesOf", valuesOf);
    defineGlobal("looksOf", looksOf);
    defineGlobal("entriesOf", entriesOf);
    defineGlobal("entireOf", entireOf);
    defineGlobal("countOf", countOf);
    defineGlobal("casesOf", casesOf);

    defineGlobal("checkCount", checkCount);


    defineGlobal("matchCase", matchCase);
    defineGlobal("equalCase", equalCase);
    defineGlobal("exactCase", exactCase);
    defineGlobal("typeCase", typeCase);
    defineGlobal("classCase", classCase);
    defineGlobal("kindCase", kindCase);

    defineGlobal("copy", copy);
    defineGlobal("mock", mock);
    defineGlobal("mimic", mimic);
    defineGlobal("twin", twin);
    defineGlobal("clone", clone);

    defineGlobal("patch", patch);
    defineGlobal("overwrite", overwrite);
    defineGlobal("takeover", takeover);
    defineGlobal("acquire", acquire);
    defineGlobal("inherit", inherit);

    defineGlobal("revert", revert);


    defineGlobal("postQueue", postQueue);
    defineGlobal("postDelayed", postDelayed);
    defineGlobal("postPromise", postPromise);
    defineGlobal("postBonded", postBonded);
    defineGlobal("postPromiseQueue", postPromiseQueue);
    defineGlobal("postAsyncQueue", postAsyncQueue);
    defineGlobal("postAwaitQueue", postAwaitQueue);
    defineGlobal("postFrameQueue", postFrameQueue);
    defineGlobal("postFramePromise", postFramePromise);

    defineGlobal("defineStaticProperty", defineStaticProperty);
    defineGlobal("defineProperty", defineProperty);
    defineGlobal("definePropertyPlex", definePropertyPlex);
    defineGlobal("ESTRE_MODERNISM_COMPATIBILITY_PREFIX", ESTRE_MODERNISM_COMPATIBILITY_PREFIX);
    defineGlobal("defineStaticGetterAndSetter", defineStaticGetterAndSetter);
    defineGlobal("defineGetterAndSetter", defineGetterAndSetter);
    defineGlobal("defineGetterAndSetterPlex", defineGetterAndSetterPlex);
}

if (typeof module !== UNDEFINED && module.exports) {
    module.exports.Time = Time;
}