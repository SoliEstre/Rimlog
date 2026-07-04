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

// Alienise.js - Estre javascript Alienese patch //
//
// A collection of aliases for shortening and simplifying JavaScript code.
// This patch aims to create smaller (quicker) and more concise (lighter) JavaScript code.
// It makes the code more implicit and serves as an alternative to obfuscation.
// 
// v0.7.2 / release 2026.04.18
// 
// * Must be loaded modernism.js before this script.
// 
// Author: Estre Soliette
// Established: 2025.01.05 / Extracted: 2025.03.15



// Auto-load modernism in Node.js environment
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
    try { require("modernism"); } catch (e) {}
}

const _gb = _global ?? (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined' ? window : global);
const dfg = defineGlobal ?? ((name, value) => Object.defineProperty(_gb, name, {
    value: value,
    writable: false,
    configurable: false,
    enumerable: false
}));


// common letter constants — single character constants `_0`~`_9`, `_a`~`_z`, `_A`~`_Z`
const _0 = "0";
const _1 = "1";
const _2 = "2";
const _3 = "3";
const _4 = "4";
const _5 = "5";
const _6 = "6";
const _7 = "7";
const _8 = "8";
const _9 = "9";

const _a = "a";
const _b = "b";
const _c = "c";
const _d = "d";
const _e = "e";
const _f = "f";
const _g = "g";
const _h = "h";
const _i = "i";
const _j = "j";
const _k = "k";
const _l = "l";
const _m = "m";
const _n = "n";
const _o = "o";
const _p = "p";
const _q = "q";
const _r = "r";
const _s = "s";
const _t = "t";
const _u = "u";
const _v = "v";
const _w = "w";
const _x = "x";
const _y = "y";
const _z = "z";

const _A = "A";
const _B = "B";
const _C = "C";
const _D = "D";
const _E = "E";
const _F = "F";
const _G = "G";
const _H = "H";
const _I = "I";
const _J = "J";
const _K = "K";
const _L = "L";
const _M = "M";
const _N = "N";
const _O = "O";
const _P = "P";
const _Q = "Q";
const _R = "R";
const _S = "S";
const _T = "T";
const _U = "U";
const _V = "V";
const _W = "W";
const _X = "X";
const _Y = "Y";
const _Z = "Z";


// common extra characters constants — symbol string aliases
/** @const {string} lr - left parenthesis `"("`. */ const lr = "(";
/** @const {string} rr - right parenthesis `")"`. */ const rr = ")";
/** @const {string} lc - left curly brace `"{"`. */ const lc = "{";
/** @const {string} rc - right curly brace `"}"`. */ const rc = "}";
/** @const {string} ls - left bracket `"["`. */ const ls = "[";
/** @const {string} rs - right bracket `"]"`. */ const rs = "]";
/** @const {string} lt - less than `"<"`. */ const lt = "<";
/** @const {string} gt - greater than `">"`. */ const gt = ">";
/** @const {string} ab - angle bracket open-close `"<>"`. */ const ab = lt + gt;
/** @const {string} cb - angle bracket close-open `"><"`. */ const cb = gt + lt;
/** @const {string} ti - tilde `"~"`. */ const ti = "~";
/** @const {string} ep - exclamation mark `"!"`. */ const ep = "!";
/** @const {string} em - exclamation alias (= ep). */ const em = ep;
/** @const {string} at - at sign `"@"`. */ const at = "@";
/** @const {string} ds - dollar sign `"$"`. */ const ds = "$";
/** @const {string} ms - ampersand `"&"`. */ const ms = "&";
/** @const {string} ps - percent `"%"`. */ const ps = "%";
/** @const {string} cf - caret `"^"`. */ const cf = "^";
/** @const {string} ak - asterisk `"*"`. */ const ak = "*";
/** @const {string} mp - multiply asterisk (= ak). */ const mp = ak;
/** @const {string} ad - plus `"+"`. */ const ad = "+";
/** @const {string} add - increment `"++"`. */ const add = ad + ad;
/** @const {string} hp - minus/hyphen `"-"`. */ const hp = "-";
/** @const {string} sr - minus alias (= hp). */ const sr = hp;
/** @const {string} srr - decrement `"--"`. */ const srr = sr + sr;
/** @const {string} us - underscore `"_"`. */ const us = "_";
/** @const {string} eq - equals sign `"="`. */ const eq = "=";
/** @const {string} vl - pipe `"|"`. */ const vl = "|";
/** @const {string} bs - backslash `"\\"`. */ const bs = "\\";
/** @const {string} ss - slash `"/"`. */ const ss = "/";
/** @const {string} dv - division slash (= ss). */ const dv = ss;
/** @const {string} qm - question mark `"?"`. */ const qm = "?";
/** @const {string} nl - not-equal sign `"!="`. */ const nl = ep + eq;
/** @const {string} le - less than or equal `"<="`. */ const le = lt + eq;
/** @const {string} ge - greater than or equal `">="`. */ const ge = gt + eq;
/** @const {string} fa - addition assignment `"+="`. */ const fa = ad + eq;
/** @const {string} fs - subtraction assignment `"-="`. */ const fs = sr + eq;
/** @const {string} fm - multiplication assignment `"*="`. */ const fm = mp + eq;
/** @const {string} fd - division assignment `"/="`. */ const fd = dv + eq;
/** @const {string} sq - single quote `"'"`. */ const sq = "'";
/** @const {string} dq - double quote `'"'`. */ const dq = '"';
/** @const {string} gv - backtick `` "`" ``. */ const gv = '`';
/** @const {string} cl - colon `":"`. */ const cl = ":";
/** @const {string} sc - semicolon `";"`. */ const sc = ";";
/** @const {string} cm - comma `","`. */ const cm = ",";
/** @const {string} es - empty string `""`. */ const es = "";
/** @const {string} l - comma (= cm). List separator. */ const l = cm;
/** @const {string} s - space `" "`. */ const s = " ";
/** @const {string} i - hash `"#"`. CSS ID selector prefix. */ const i = "#";
/** @const {string} d - dot `"."`. CSS class selector prefix and separator. */ const d = ".";

/** @const {string} cr - carriage return. */ const cr = "\r";
/** @const {string} lf - line feed. */ const lf = "\n";
/** @const {string} crlf - CR+LF line ending. */ const crlf = cr + lf;
/** @const {string} lfcr - LF+CR line ending. */ const lfcr = lf + cr;
/** @const {string} tab - tab character. */ const tab = "\t";

/** @const {string} ecr - escaped CR literal string. */ const ecr = "\\r";
/** @const {string} elf - escaped LF literal string. */ const elf = "\\n";
/** @const {string} ecrlf - escaped CRLF literal string. */ const ecrlf = ecr + elf;
/** @const {string} elfcr - escaped LFCR literal string. */ const elfcr = elf + ecr;
/** @const {string} etab - escaped tab literal string. */ const etab = "\\t";


// primitive types alias constant — primitive type aliases
/** @const {string} U - `"undefined"` string constant. For typeof comparison. */ const U = UNDEFINED;
/** @const {string} N - `"null"` string constant. */ const N = NULL;
/** @const {string} T - `"true"` string constant. */ const T = TRUE;
/** @const {string} F - `"false"` string constant. */ const F = FALSE;

/** @const {undefined} u - `undefined` alias. */ const u = undefined;
/** @const {null} n - `null` alias. */ const n = null;
/** @const {boolean} t - `true` alias. */ const t = true;
/** @const {boolean} f - `false` alias. */ const f = false;

// end point assigner constant — array/object end marker (= undefined)
/** @const {undefined} eoo - End Of Object. undefined as object end marker. */ const eoo = u;
/** @const {undefined} eoa - End Of Array. undefined as array end marker. */ const eoa = u;

// prototype of primitive types alias constant
/** @const {string} FNC - `"function"` type string. */ const FNC = FUNCTION;
/** @const {string} BLE - `"boolean"` type string. */ const BLE = BOOLEAN;
/** @const {string} STR - `"string"` type string. */ const STR = STRING;
/** @const {string} SYM - `"symbol"` type string. */ const SYM = SYMBOL;
/** @const {string} NUM - `"number"` type string. */ const NUM = NUMBER;
/** @const {string} BIG - `"bigint"` type string. */ const BIG = BIGINT;
/** @const {string} OBJ - `"object"` type string. */ const OBJ = OBJECT;

/** @const {FunctionConstructor} fun - `Function` alias. */ const fun = Function;
/** @const {BooleanConstructor} ble - `Boolean` alias. */ const ble = Boolean;
/** @const {StringConstructor} str - `String` alias. */ const str = String;
/** @const {Function} sym - `Symbol` alias. */ const sym = Symbol;
/** @const {NumberConstructor} num - `Number` alias. */ const num = Number;
/** @const {Function} big - `BigInt` alias. */ const big = BigInt;
/** @const {ObjectConstructor} obj - `Object` alias. */ const obj = Object;

// class names of primitive types constant
/** @const {string} FN - `"Function"` class name. */ const FN = _FUNCTION;
/** @const {string} BL - `"Boolean"` class name. */ const BL = _BOOLEAN;
/** @const {string} ST - `"String"` class name. */ const ST = _STRING;
/** @const {string} SY - `"Symbol"` class name. */ const SY = _SYMBOL;
/** @const {string} NO - `"Number"` class name. */ const NO = _NUMBER;
/** @const {string} BI - `"BigInt"` class name. */ const BI = _BIG_INT;
/** @const {string} OJ - `"Object"` class name. */ const OJ = _OBJECT;

/** @const {FunctionConstructor} fn - `Function` class ref (= fun). */ const fn = Function;
/** @const {BooleanConstructor} bl - `Boolean` class ref (= ble). */ const bl = Boolean;
/** @const {StringConstructor} sg - `String` class ref. */ const sg = String;
/** @const {Function} sl - `Symbol` class ref. */ const sl = Symbol;
/** @const {NumberConstructor} no - `Number` class ref. */ const no = Number;
/** @const {Function} bi - `BigInt` class ref. */ const bi = BigInt;
/** @const {ObjectConstructor} oj - `Object` class ref (= obj). */ const oj = Object;


// frequent object types alias constant
/** @const {string} DT - `"Date"` class name. */ const DT = _DATE;
/** @const {string} TT - `"Time"` class name. */ const TT = _TIME;

/** @const {string} RA - `"Array"` class name. */ const RA = _ARRAY;
/** @const {string} SA - `"Set"` class name. */ const SA = _SET;
/** @const {string} MA - `"Map"` class name. */ const MA = _MAP;

/** @const {DateConstructor} dt - `Date` constructor alias. */ const dt = Date;
/** @const {Function} tt - `Time` constructor alias. */ const tt = Time;

/** @const {ArrayConstructor} ra - `Array` constructor alias. */ const ra = Array;
/** @const {SetConstructor} sa - `Set` constructor alias. */ const sa = Set;
/** @const {MapConstructor} ma - `Map` constructor alias. */ const ma = Map;


// frequent assign types alias constant
/** @const {string} fnd - `FORE_NOT_DEFAULT` assign priority. */ const fnd = FORE_NOT_DEFAULT;
/** @const {string} mnd - `MORE_NOT_DEFAULT` assign priority. */ const mnd = MORE_NOT_DEFAULT;
/** @const {string} def - `DEFAULT` assign priority. */ const def = DEFAULT;
/** @const {string} fin - `FINALLY` assign priority. */ const fin = FINALLY;


// frequent object types empty object issuer alias constant
/** @const {Object} x - Empty instance issuer. `x.a` → Array, `x.d` → Date, `x.m` → Time, `x.t` → Set, `x.p` → Map. */
const x = {
    get a() { return new Array(); },
    get d() { return new Date(); },
    get m() { return new Time(); },
    get t() { return new Set(); },
    get p() { return new Map(); },
};


// bypass constant
/** @const {Function} ifx - `executeIf()` — conditional execution. */ const ifx = executeIf;
/** @const {Function} itx - `executeWhen()` — conditional execution variant. */ const itx = executeWhen;

/** @const {Function} ifr - `ifReturn()` — conditional return. */ const ifr = ifReturn;

/** @const {Function} roen - `ifReturnOrEmptyNumber()` — returns value or 0. */ const roen = ifReturnOrEmptyNumber;
/** @const {Function} roes - `ifReturnOrEmptyString()` — returns value or "". */ const roes = ifReturnOrEmptyString;
/** @const {Function} roea - `ifReturnOrEmptyArray()` — returns value or []. */ const roea = ifReturnOrEmptyArray;
/** @const {Function} roeo - `ifReturnOrEmptyObject()` — returns value or {}. */ const roeo = ifReturnOrEmptyObject;

/** @const {Function} val - `valet()` — value extraction helper. */ const val = valet;


// common process shortcut constant
/** @const {Function} f02b - `forZeroToBefore()` — loop 0 to n-1. */ const f02b = forZeroToBefore;
/** @const {Function} f02r - `forZeroToReach()` — loop 0 to n (inclusive). */ const f02r = forZeroToReach;

/** @const {Function} f20 - `forToZeroFrom()` — reverse loop to 0. */ const f20 = forToZeroFrom;
/** @const {Function} f21 - `forToPrimeFrom()` — reverse loop to 1. */ const f21 = forToPrimeFrom;

/** @const {Function} ff - `forForward()` — forward iteration. */ const ff = forForward;
/** @const {Function} fb - `forBackward()` — backward iteration. */ const fb = forBackward;

/** @const {Function} fi - `forin()` — for-in loop. */ const fi = forin;
/** @const {Function} fiv - `forinner()` — nested for-in loop. */ const fiv = forinner;

/** @const {Function} fo - `forof()` — for-of loop. */ const fo = forof;
/** @const {Function} fkv - `forkv()` — key-value iteration. */ const fkv = forkv;

/** @const {Function} w - `whileIn()` — while loop. */ const w = whileIn;
/** @const {Function} dw - `doWhileIn()` — do-while loop. */ const dw = doWhileIn;


// meaning comparator constant — type/value comparison function aliases
/** @const {Function} to - `typeOf()` alias. */ const to = typeOf;

/** @const {Function} tm - `typeMatch()` — typeof comparison. */ const tm = typeMatch;

/** @const {Function} tu - `typeUndefined()` — typeof === "undefined". */ const tu = typeUndefined;
/** @const {Function} tf - `typeFunction()` — typeof === "function". */ const tf = typeFunction;
/** @const {Function} tb - `typeBoolean()` — typeof === "boolean". */ const tb = typeBoolean;
/** @const {Function} ts - `typeString()` — typeof === "string". */ const ts = typeString;
/** @const {Function} ty - `typeSymbol()` — typeof === "symbol". */ const ty = typeSymbol;
/** @const {Function} tn - `typeNumber()` — typeof === "number". */ const tn = typeNumber;
/** @const {Function} tg - `typeBigint()` — typeof === "bigint". */ const tg = typeBigint;
/** @const {Function} tj - `typeObject()` — typeof === "object". */ const tj = typeObject;

/** @const {Function} im - `instanceMatch()` — instanceof check. */ const im = instanceMatch;
/** @const {Function} io - `isObject()` — is plain object. */ const io = isObject;
/** @const {Function} ia - `isArray()` — Array.isArray(). */ const ia = isArray;
/** @const {Function} ioa - `isArray()` alias (= ia). */ const ioa = isArray;
/** @const {Function} ios - `isString()` — is string type. */ const ios = isString;
/** @const {Function} ion - `isNumber()` — is number type. */ const ion = isNumber;
/** @const {Function} iot - `isSet()` — is Set instance. */ const iot = isSet;
/** @const {Function} iop - `isMap()` — is Map instance. */ const iop = isMap;

/** @const {Function} sm - `same()` — loose equality (==). */ const sm = same;
/** @const {Function} df - `differ()` — loose inequality (!=). */ const df = differ;

/** @const {Function} xv - `exact()` — strict equality (===). */ const xv = exact;
/** @const {Function} nxv - `notExact()` — strict inequality (!==). */ const nxv = notExact;
/** @const {Function} xnv - `exactlyNot()` — strictly not equal. */ const xnv = exactlyNot;
/** @const {Function} xm - `exactMatches()` — multi-value strict match. */ const xm = exactMatches;
/** @const {Function} nx - `notExactMatches()` — none match strictly. */ const nx = notExactMatches;
/** @const {Function} xnm - `exactlyNotMatches()` — all differ strictly. */ const xnm = exactlyNotMatches;

/** @const {Function} ev - `equals()` — deep equality. */ const ev = equals;
/** @const {Function} nev - `notEquals()` — deep inequality. */ const nev = notEquals;

/** @const {Function} gtv - `gatherThan()` — greater than (>). */ const gtv = gatherThan;
/** @const {Function} ltv - `lessThan()` — less than (<). */ const ltv = lessThan;
/** @const {Function} ngt - `notGatherThan()` — not greater than. */ const ngt = notGatherThan;
/** @const {Function} nlt - `notLessThan()` — not less than. */ const nlt = notLessThan;

/** @const {Function} gev - `gatherOrEquals()` — greater or equal (>=). */ const gev = gatherOrEquals;
/** @const {Function} lev - `lessOrEquals()` — less or equal (<=). */ const lev = lessOrEquals;
/** @const {Function} nge - `notGatherAndEquals()` — strictly less (<). */ const nge = notGatherAndEquals;
/** @const {Function} nle - `notLessAndEquals()` — strictly greater (>). */ const nle = notLessAndEquals;

/** @const {Function} fc - `isFalseCase()` — is falsy case. */ const fc = isFalseCase;
/** @const {Function} nfc - `isNotFalseCase()` — is truthy case. */ const nfc = isNotFalseCase;

/** @const {Function} xu - `isUndefined()` — === undefined. */ const xu = isUndefined;
/** @const {Function} xn - `isNull()` — === null. */ const xn = isNull;
/** @const {Function} xt - `isExactTrue()` — === true. */ const xt = isExactTrue;
/** @const {Function} xf - `isExactFalse()` — === false. */ const xf = isExactFalse;

/** @const {Function} nxu - `isNotUndefined()` — !== undefined. */ const nxu = isNotUndefined;
/** @const {Function} nxn - `isNotNull()` — !== null. */ const nxn = isNotNull;
/** @const {Function} nxt - `isNotTrue()` — !== true. */ const nxt = isNotTrue;
/** @const {Function} nxf - `isNotFalse()` — !== false. */ const nxf = isNotFalse;

/** @const {Function} en - `isNully()` — null or undefined. */ const en = isNully;
/** @const {Function} et - `isTruely()` — truthy. */ const et = isTruely;
/** @const {Function} ef - `isFalsely()` — falsy. */ const ef = isFalsely;
/** @const {Function} ee - `isEmpty()` — empty. */ const ee = isEmpty;

/** @const {Function} nn - `isNotNully()` — not null/undefined. */ const nn = isNotNully;
/** @const {Function} nt - `isNotTruely()`. */ const nt = isNotTruely;
/** @const {Function} nf - `isNotFalsely()`. */ const nf = isNotFalsely;
/** @const {Function} ne - `isNotEmpty()`. */ const ne = isNotEmpty;

/** @const {Function} noe - `isNullOrEmpty()` — null or empty. */ const noe = isNullOrEmpty;
/**
 * Checks whether the value is not null, not undefined, and not empty string.
 * @const {Function} nne - `isNotNullAndEmpty()`.
 * @param {*} value - Value to check.
 * @returns {boolean} `true` if the value is meaningful.
 */
const nne = isNotNullAndEmpty;


// quick execute by conditions constant
/** @const {Function} inoe - `ifNullOrEmpty()` — execute if null or empty. */ const inoe = ifNullOrEmpty;
/** @const {Function} inne - `ifNotNullAndEmpty()` — execute if not null/empty. */ const inne = ifNotNullAndEmpty;


// do and return inline double takes
/** @const {Function} dr - `doAndReturn()` — execute and return value. */ const dr = doAndReturn;
/** @const {Function} drx - `doAndReturnByExecute()` — execute and return result. */ const drx = doAndReturnByExecute;


// object method shortcut constant
/** @const {Function} ok - `keysOf()` — Object.keys(). */ const ok = keysOf;
/** @const {Function} ov - `valuesOf()` — Object.values(). */ const ov = valuesOf;
/** @const {Function} oe - `entriesOf()` — Object.entries(). */ const oe = entriesOf;
/** @const {Function} oc - `countOf()` — key count. */ const oc = countOf;

/** @const {Function} occ - `checkCount()` — filtered key count. */ const occ = checkCount;


// match case constant — pattern matching function aliases
/** @const {Function} mc - `matchCase()` — condition matching. */ const mc = matchCase;
/** @const {Function} ec - `equalCase()` — `==` based matching. */ const ec = equalCase;
/** @const {Function} xc - `exactCase()` — `===` based matching. */ const xc = exactCase;
/** @const {Function} tc - `typeCase()` — typeof based matching. */ const tc = typeCase;
/** @const {Function} cc - `classCase()` — class based matching. */ const cc = classCase;
/** @const {Function} kc - `kindCase()` — kind-based matching. */ const kc = kindCase;


/** variable data copy — object copy/merge utility aliases */
/** @const {Function} cp - `copy()` — deep copy. */ const cp = copy;
/** @const {Function} mk - `mock()` — shallow clone. */ const mk = mock;
/** @const {Function} mm - `mimic()` — structural clone. */ const mm = mimic;
/** @const {Function} tw - `twin()` — identical clone. */ const tw = twin;
/** @const {Function} cn - `clone()` — full clone. */ const cn = clone;

/** @const {Function} pc - `patch()` — property patch. */ const pc = patch;
/** @const {Function} ow - `overwrite()` — overwrite. */ const ow = overwrite;
/** @const {Function} tk - `takeover()` — takeover. */ const tk = takeover;
/** @const {Function} aq - `acquire()` — acquire. */ const aq = acquire;
/** @const {Function} ih - `inherit()` — inherit. */ const ih = inherit;

/** @const {Function} rv - `revert()` — revert. */ const rv = revert;


/** run handle — async execution utility aliases */
/** @const {Function} pq - `postQueue()` — schedules a task on the microtask queue. */ const pq = postQueue;
/** @const {Function} pd - `postDelayed()` — delayed execution. */ const pd = postDelayed;
/** @const {Function} pp - `postPromise()` — Promise wrapper. */ const pp = postPromise;
/** @const {Function} pb - `postBonded()` — bonded Promise. */ const pb = postBonded;
/** @const {Function} ppq - `postPromiseQueue()` — Promise queue. */ const ppq = postPromiseQueue;
/** @const {Function} paq - `postAsyncQueue()` — async queue. */ const paq = postAsyncQueue;
/** @const {Function} pwq - `postAwaitQueue()` — await queue. */ const pwq = postAwaitQueue;
/** @const {Function} pfq - `postFrameQueue()` — requestAnimationFrame queue. */ const pfq = postFrameQueue;
/** @const {Function} pfp - `postFramePromise()` — requestAnimationFrame Promise. */ const pfp = postFramePromise;


// Object function shortcut constants
/** @const {Function} dsp - `defineStaticProperty()`. */ const dsp = defineStaticProperty;
/** @const {Function} dp - `defineProperty()`. */ const dp = defineProperty;
/** @const {Function} dpx - `definePropertyPlex()`. */ const dpx = definePropertyPlex;
/** @const {Function} dspgs - `defineStaticGetterAndSetter()`. */ const dspgs = defineStaticGetterAndSetter;
/** @const {Function} dpgs - `defineGetterAndSetter()`. */ const dpgs = defineGetterAndSetter;
/** @const {Function} dpgsx - `defineGetterAndSetterPlex()`. */ const dpgsx = defineGetterAndSetterPlex;


// Regex builder alias
/** @const {Function} rx - RegExp builder with flags. */ const rx = (regex, flags) => new RegExp(regex, flags);
/** @const {Function} reg - `rx` alias. */ const reg = rx;
/** @const {Function} ri - RegExp with `"i"` flag. */ const ri = regex => new RegExp(regex, "i");
/** @const {Function} rg - RegExp with `"g"` flag. */ const rg = regex => new RegExp(regex, "g");
/** @const {Function} rm - RegExp with `"m"` flag. */ const rm = regex => new RegExp(regex, "m");
/** @const {Function} rig - RegExp with `"ig"` flags. */ const rig = regex => new RegExp(regex, "ig");
/** @const {Function} rim - RegExp with `"im"` flags. */ const rim = regex => new RegExp(regex, "im");
/** @const {Function} rgm - RegExp with `"gm"` flags. */ const rgm = regex => new RegExp(regex, "gm");
/** @const {Function} rigm - RegExp with `"igm"` flags. */ const rigm = regex => new RegExp(regex, "igm");


// additional static function for classes
defineGetterAndSetter(fn, "n", function () { return new this(); });
defineProperty(fn, "w", function () { return new this(...arguments); });

defineStaticGetterAndSetter(dt, "t", function () { return this.now(); });
defineStaticGetterAndSetter(dt, "ms", function () { return dt.n.millis; });
defineStaticGetterAndSetter(dt, "msd", function () { return this.ms.string.padStart(3, "0"); });

defineStaticGetterAndSetter(tt, "t", function () { return this.now(); });


// additional global prototype functions
definePropertyPlex("mc", function () { return matchCase(this.it, ...arguments); });
definePropertyPlex("ec", function () { return equalCase(this.it, ...arguments); });
definePropertyPlex("xc", function () { return exactCase(this.it, ...arguments); });
definePropertyPlex("tc", function () { return typeCase(this.it, ...arguments); });
definePropertyPlex("cc", function () { return classCase(this.it, ...arguments); });
definePropertyPlex("kc", function () { return kindCase(this.it, ...arguments); });

definePropertyPlex("ee", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });
definePropertyPlex("ne", function (process = it => it, ornot = it => it, numberEmptyMatch = 0) { return isNotEmpty(this.it, numberEmptyMatch) ? process(this.it) : ornot(this.it); });

definePropertyPlex("dr", function (does = (it, args) => {}, returns, args = []) { return doAndReturn(does, returns, [this.it, ...args]); });
definePropertyPlex("drx", function (does = (it, args) => {}, forReturns, args = []) { return doAndReturnByExecute(does, forReturns, [this.it, ...args]); });

defineGetterAndSetter(obj, "ok", function () { return keysOf(this.it); });
defineGetterAndSetter(obj, "ov", function () { return valuesOf(this.it); });
defineGetterAndSetter(obj, "oe", function () { return entriesOf(this.it); });
defineGetterAndSetter(obj, "oc", function () { return countOf(this.it); });
defineGetterAndSetter(obj, "occ", function () { return checkCount(this.it, (k, v) => true); });

defineProperty(obj, "fk", function (work = key => { return false; }) { return forof(this.it.ways, work); });
defineProperty(obj, "fv", function (work = value => { return false; }) { return forof(this.it.looks, work); });
defineProperty(obj, "fe", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });
defineProperty(obj, "fkv", function (work = (key, value) => { return false; }) { return forkv(this.it.entire, work); });

defineProperty(obj, "ko", function (value) { for (const [key, val] of this.it.entire) if (val === value) return key; return undefined; });

defineProperty(obj, "tiw", function (key, process = (value, key, host) => value, ornot = (key, host) => host[key]) { return key in this.it ? process(this.it[key], key, this.it) : ornot(key, this.it); });

defineProperty(obj, "cp", function (dataOnly = true, primitiveOnly = false, recusive = true) { return copy(this, dataOnly, primitiveOnly, recusive); });
defineGetterAndSetter(obj, "mk", function () { return mock(this); });
defineGetterAndSetter(obj, "mm", function () { return mimic(this); });
defineGetterAndSetter(obj, "tw", function () { return twin(this); });
defineGetterAndSetter(obj, "cl", function () { return clone(this); });

defineProperty(obj, "pc", function (from, dataOnly = true, primitiveOnly = false, recusive = true, append = false) { return patch(this.it, from, dataOnly, primitiveOnly, recusive, append); });
defineProperty(obj, "ow", function (from) { return overwrite(this.it, from); });
defineProperty(obj, "tk", function (from) { return takeover(this.it, from); });
defineProperty(obj, "aq", function (from) { return acquire(this.it, from); });
defineProperty(obj, "ih", function (from) { return inherit(this.it, from); });

defineProperty(obj, "rv", function (from, dataOnly = true, primitiveOnly = false, recusive = true, exceptNew = false) { return revert(this.it, from, dataOnly, primitiveOnly, recusive, exceptNew); });

definePropertyPlex("ifeq", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it == that, process, [it], ornot)); });
definePropertyPlex("ifneq", function (that, process = it => it, ornot = it => {}) { return this.let(it => executeIf(it != that, process, [it], ornot)); });


// additional primitive prototype functions
defineProperty(num, "div", function (by) { return this.it.divided(by); });
defineGetterAndSetter(num, "str", function () { return this.it.string; });
defineGetterAndSetter(num, "prc", function () { return this.it.pricision; });
defineGetterAndSetter(num, "prs", function () { return this.it.pricisionString; });
defineGetterAndSetter(num, "pri", function () { return this.it.pricisionInt; });
defineGetterAndSetter(num, "d00", function () { return this.it.digit2; });
defineGetterAndSetter(num, "d000", function () { return this.it.digit3; });
defineGetterAndSetter(num, "d0000", function () { return this.it.digit4; });

defineGetterAndSetter(str, "low", function () { return this.it.lower; });
defineGetterAndSetter(str, "upp", function () { return this.it.upper; });
defineGetterAndSetter(str, "cap", function () { return this.it.capitalized; });
defineGetterAndSetter(str, "d00", function () { return this.it.digit2; });
defineGetterAndSetter(str, "d000", function () { return this.it.digit3; });
defineGetterAndSetter(str, "d0000", function () { return this.it.digit4; });

defineGetterAndSetter(dt, "YYYY", function () { return this.it.year.d0000; });
defineGetterAndSetter(dt, "yyyy", function () { return this.it.year; });
defineGetterAndSetter(dt, "y", function () { return this.it.yyyy; });
defineGetterAndSetter(dt, "yy", function () { return (this.it.yyyy % 100).d00; });
defineGetterAndSetter(dt, "M0", function () { return this.it.month0; });
defineGetterAndSetter(dt, "M", function () { return this.it.month; });
defineGetterAndSetter(dt, "MM", function () { return this.it.M.d00; });
defineGetterAndSetter(dt, "d", function () { return this.it.date; });
defineGetterAndSetter(dt, "dd", function () { return this.it.d.d00; });
defineGetterAndSetter(dt, "U", function () { return this.it.day; });
defineGetterAndSetter(dt, "u", function () { return this.it.U.let(it => it == 0 ? 7 : it); });
defineGetterAndSetter(dt, "uu", function () { return this.it.dayEngChar2; });
defineGetterAndSetter(dt, "Uu", function () { return this.it.dayEngChar2Cap; });
defineGetterAndSetter(dt, "UU", function () { return this.it.dayEngChar2Up; });
defineGetterAndSetter(dt, "uuu", function () { return this.it.dayEngShort; });
defineGetterAndSetter(dt, "Uuu", function () { return this.it.dayEngShortCap; });
defineGetterAndSetter(dt, "UUU", function () { return this.it.dayEngShortUp; });
defineGetterAndSetter(dt, "uuuu", function () { return this.it.dayEngPrefix; });
defineGetterAndSetter(dt, "Uuuu", function () { return this.it.dayEngPrefixCap; });
defineGetterAndSetter(dt, "UUUU", function () { return this.it.dayEngPrefixUp; });
defineGetterAndSetter(dt, "wd", function () { return this.it.dayEng + "day"; });
defineGetterAndSetter(dt, "Wd", function () { return this.it.dayEng.cap; });
defineGetterAndSetter(dt, "WD", function () { return this.it.dayEng.upp; });
defineGetterAndSetter(dt, "yi", function () { return this.it.dayKorShort; });
defineGetterAndSetter(dt, "YI", function () { return this.it.dayKor; });
defineGetterAndSetter(dt, "yb", function () { return this.it.dayJpnShort; });
defineGetterAndSetter(dt, "YB", function () { return this.it.dayJpn; });
defineGetterAndSetter(dt, "zh", function () { return this.it.dayChn; });
defineGetterAndSetter(dt, "xq", function () { return this.it.dayChnX; });
defineGetterAndSetter(dt, "zt", function () { return this.it.dayCnT; });
defineGetterAndSetter(dt, "xqt", function () { return this.it.dayCnTX; });
defineGetterAndSetter(dt, "H", function () { return this.it.hours; });
defineGetterAndSetter(dt, "HH", function () { return this.it.H.d00; });
defineGetterAndSetter(dt, "a", function () { return this.it.H < 12 ? _A : _P; });
defineGetterAndSetter(dt, "aa", function () { return this.it.a + _M; });
defineGetterAndSetter(dt, "h", function () { return this.it.hours12; });
defineGetterAndSetter(dt, "hh", function () { return this.it.h.d00; });
defineGetterAndSetter(dt, "m", function () { return this.it.minutes; });
defineGetterAndSetter(dt, "mm", function () { return this.it.m.d00; });
defineGetterAndSetter(dt, "s", function () { return this.it.seconds; });
defineGetterAndSetter(dt, "ss", function () { return this.it.s.d00; });
defineGetterAndSetter(dt, "ms", function () { return this.it.millis; });
defineGetterAndSetter(dt, "S", function () { return this.it.ms; });
defineGetterAndSetter(dt, "SSS", function () { return this.it.S.d000; });
defineGetterAndSetter(dt, "zone0", function () { return this.it.zoneOffset; });
defineGetterAndSetter(dt, "O", function () { return this.it.zone0; });
defineGetterAndSetter(dt, "Z", function () { return this.it.zoneHours; });
defineGetterAndSetter(dt, "Zm", function () { return this.it.zoneMinutes; });
defineGetterAndSetter(dt, "Zmm", function () { return this.it.Zm.d00; });
defineGetterAndSetter(dt, "Zh", function () { return this.it.Z.int; });
defineGetterAndSetter(dt, "Zhh", function () { return this.it.Zh.d00; });
defineGetterAndSetter(dt, "X", function () { return this.it.let(it => it.Zhh + cl + it.Zmm); });
defineGetterAndSetter(dt, "t", function () { return this.it.time; });
defineGetterAndSetter(dt, "ut", function () { return this.it.unix; });
defineGetterAndSetter(dt, "mo", function () { return this.it.let(it => it.y * 12 + it.M0); });
defineGetterAndSetter(dt, "do", function () { return this.it.dateOffset; });
defineGetterAndSetter(dt, "ymia0", function () { return this.it.yearMonthIntArray0; });
defineGetterAndSetter(dt, "ymia", function () { return this.it.yearMonthIntArray; });
defineGetterAndSetter(dt, "yma", function () { return this.it.yearMonthArray; });
defineGetterAndSetter(dt, "ym", function () { return this.it.yearMonth; });
defineGetterAndSetter(dt, "da0", function () { return this.it.dateArray0; });
defineGetterAndSetter(dt, "da", function () { return this.it.dateArray; });
defineGetterAndSetter(dt, "ymda", function () { return this.it.dateStringArray; });
defineGetterAndSetter(dt, "ymd", function () { return this.it.dateString; });
defineGetterAndSetter(dt, "hmia", function () { return this.it.hourMinutesIntArray; });
defineGetterAndSetter(dt, "hma", function () { return this.it.hourMinutesArray; });
defineGetterAndSetter(dt, "hm", function () { return this.it.hourMinutes; });
defineGetterAndSetter(dt, "ta", function () { return this.it.timeArray; });
defineGetterAndSetter(dt, "hmsa", function () { return this.it.timeStringArray; });
defineGetterAndSetter(dt, "hms", function () { return this.it.timeString; });
defineGetterAndSetter(dt, "tp", function () { return this.it.timePart; });
defineGetterAndSetter(dt, "tt", function () { return this.it.asTime; });
defineProperty(dt, "sdt", function (time, m, s, ms) { return this.it.setDayTime(time, m, s, ms); });
defineProperty(dt, "at", function (time) { return this.it.addTime(time); });


defineGetterAndSetter(tt, "d", function () { return this.it.days; });
defineGetterAndSetter(tt, "dd", function () { return this.it.d.d00; });
defineGetterAndSetter(tt, "H", function () { return this.it.hours; });
defineGetterAndSetter(tt, "HH", function () { return this.it.H.d00; });
defineGetterAndSetter(tt, "a", function () { return this.it.H < 12 ? _A : _P; });
defineGetterAndSetter(tt, "aa", function () { return this.it.a + _M; });
defineGetterAndSetter(tt, "h", function () { return (this.it.H % 12).let(it => it == 0 ? 12 : it); });
defineGetterAndSetter(tt, "hh", function () { return this.it.h.d00; });
defineGetterAndSetter(tt, "m", function () { return this.it.minutes; });
defineGetterAndSetter(tt, "mm", function () { return this.it.m.d00; });
defineGetterAndSetter(tt, "s", function () { return this.it.seconds; });
defineGetterAndSetter(tt, "ss", function () { return this.it.s.d00; });
defineGetterAndSetter(tt, "ms", function () { return this.it.millis; });
defineGetterAndSetter(tt, "S", function () { return this.it.ms; });
defineGetterAndSetter(tt, "SSS", function () { return this.it.S.d000; });
defineGetterAndSetter(tt, "hmia", function () { return this.it.hourMinutesIntArray; });
defineGetterAndSetter(tt, "hma", function () { return this.it.hourMinutesArray; });
defineGetterAndSetter(tt, "hm", function () { return this.it.hourMinutes; });
defineGetterAndSetter(tt, "ta", function () { return this.it.timeArray; });
defineGetterAndSetter(tt, "hmsa", function () { return this.it.timeStringArray; });
defineGetterAndSetter(tt, "hms", function () { return this.it.timeString; });


// Bind to global when not a browser
if (typeof window === U) {
    dfg("_0", _0);
    dfg("_1", _1);
    dfg("_2", _2);
    dfg("_3", _3);
    dfg("_4", _4);
    dfg("_5", _5);
    dfg("_6", _6);
    dfg("_7", _7);
    dfg("_8", _8);
    dfg("_9", _9);

    dfg("_a", _a);
    dfg("_b", _b);
    dfg("_c", _c);
    dfg("_d", _d);
    dfg("_e", _e);
    dfg("_f", _f);
    dfg("_g", _g);
    dfg("_h", _h);
    dfg("_i", _i);
    dfg("_j", _j);
    dfg("_k", _k);
    dfg("_l", _l);
    dfg("_m", _m);
    dfg("_n", _n);
    dfg("_o", _o);
    dfg("_p", _p);
    dfg("_q", _q);
    dfg("_r", _r);
    dfg("_s", _s);
    dfg("_t", _t);
    dfg("_u", _u);
    dfg("_v", _v);
    dfg("_w", _w);
    dfg("_x", _x);
    dfg("_y", _y);
    dfg("_z", _z);

    dfg("_A", _A);
    dfg("_B", _B);
    dfg("_C", _C);
    dfg("_D", _D);
    dfg("_E", _E);
    dfg("_F", _F);
    dfg("_G", _G);
    dfg("_H", _H);
    dfg("_I", _I);
    dfg("_J", _J);
    dfg("_K", _K);
    dfg("_L", _L);
    dfg("_M", _M);
    dfg("_N", _N);
    dfg("_O", _O);
    dfg("_P", _P);
    dfg("_Q", _Q);
    dfg("_R", _R);
    dfg("_S", _S);
    dfg("_T", _T);
    dfg("_U", _U);
    dfg("_V", _V);
    dfg("_W", _W);
    dfg("_X", _X);
    dfg("_Y", _Y);
    dfg("_Z", _Z);


    dfg("lr", lr);
    dfg("rr", rr);
    dfg("lc", lc);
    dfg("rc", rc);
    dfg("ls", ls);
    dfg("rs", rs);
    dfg("lt", lt);
    dfg("gt", gt);
    dfg("ab", ab);
    dfg("cb", cb);
    dfg("ti", ti);
    dfg("ep", ep);
    dfg("em", em);
    dfg("at", at);
    dfg("ds", ds);
    dfg("ms", ms);
    dfg("ps", ps);
    dfg("cf", cf);
    dfg("ak", ak);
    dfg("mp", mp);
    dfg("ad", ad);
    dfg("add", add);
    dfg("hp", hp);
    dfg("sr", sr);
    dfg("srr", srr);
    dfg("us", us);
    dfg("eq", eq);
    dfg("vl", vl);
    dfg("bs", bs);
    dfg("ss", ss);
    dfg("dv", dv);
    dfg("qm", qm);
    dfg("nl", nl);
    dfg("le", le);
    dfg("ge", ge);
    dfg("fa", fa);
    dfg("fs", fs);
    dfg("fm", fm);
    dfg("fd", fd);
    dfg("sq", sq);
    dfg("dq", dq);
    dfg("gv", gv);
    dfg("cl", cl);
    dfg("sc", sc);
    dfg("cm", cm);
    dfg("es", es);
    dfg("l", l);
    dfg("s", s);
    dfg("i", i);
    dfg("d", d);

    dfg("cr", cr);
    dfg("lf", lf);
    dfg("crlf", crlf);
    dfg("lfcr", lfcr);
    dfg("tab", tab);

    dfg("ecr", ecr);
    dfg("elf", elf);
    dfg("ecrlf", ecrlf);
    dfg("elfcr", elfcr);
    dfg("etab", etab);


    dfg("U", U);
    dfg("N", N);
    dfg("T", T);
    dfg("F", F);

    dfg("u", u);
    dfg("n", n);
    dfg("t", t);
    dfg("f", f);

    dfg("eoo", eoo);
    dfg("eoa", eoa);

    dfg("FNC", FNC);
    dfg("BLE", BLE);
    dfg("STR", STR);
    dfg("SYM", SYM);
    dfg("NUM", NUM);
    dfg("BIG", BIG);
    dfg("OBJ", OBJ);

    dfg("fun", fun);
    dfg("ble", ble);
    dfg("str", str);
    dfg("sym", sym);
    dfg("num", num);
    dfg("big", big);
    dfg("obj", obj);

    dfg("FN", FN);
    dfg("BL", BL);
    dfg("ST", ST);
    dfg("SY", SY);
    dfg("NO", NO);
    dfg("BI", BI);
    dfg("OJ", OJ);

    dfg("fn", fn);
    dfg("bl", bl);
    dfg("sg", sg);
    dfg("sl", sl);
    dfg("no", no);
    dfg("bi", bi);
    dfg("oj", oj);


    dfg("DT", DT);

    dfg("RA", RA);
    dfg("SA", SA);
    dfg("MA", MA);

    dfg("dt", dt);
    dfg("tt", tt);

    dfg("ra", ra);
    dfg("sa", sa);
    dfg("ma", ma);


    dfg("def", def);
    dfg("fin", fin);


    dfg("x", x);


    dfg("ifx", ifx);
    dfg("itx", itx);

    dfg("ifr", ifr);

    dfg("roen", roen);
    dfg("roes", roes);
    dfg("roea", roea);
    dfg("roeo", roeo);

    dfg("val", val);


    dfg("f02b", f02b);
    dfg("f02r", f02r);

    dfg("f20", f20);
    dfg("f21", f21);

    dfg("ff", ff);
    dfg("fb", fb);

    dfg("fi", fi);
    dfg("fiv", fiv);

    dfg("fo", fo);
    dfg("fkv", fkv);

    dfg("w", w);
    dfg("dw", dw);


    dfg("to", to);

    dfg("tm", tm);

    dfg("tu", tu);
    dfg("tf", tf);
    dfg("tb", tb);
    dfg("ts", ts);
    dfg("ty", ty);
    dfg("tn", tn);
    dfg("tg", tg);
    dfg("tj", tj);

    dfg("im", im);
    dfg("io", io);
    dfg("ia", ia);
    dfg("ioa", ioa);
    dfg("ios", ios);
    dfg("ion", ion);
    dfg("iot", iot);
    dfg("iop", iop);

    dfg("sm", sm);
    dfg("df", df);

    dfg("xv", xv);
    dfg("nxv", nxv);
    dfg("xnv", xnv);
    dfg("xm", xm);
    dfg("nx", nx);
    dfg("xnm", xnm);

    dfg("ev", ev);
    dfg("nev", nev);

    dfg("gtv", gtv);
    dfg("ltv", ltv);
    dfg("ngt", ngt);
    dfg("nlt", nlt);

    dfg("gev", gev);
    dfg("lev", lev);
    dfg("nge", nge);
    dfg("nle", nle);

    dfg("fc", fc);
    dfg("nfc", nfc);

    dfg("xu", xu);
    dfg("xn", xn);
    dfg("xt", xt);
    dfg("xf", xf);

    dfg("nxu", nxu);
    dfg("nxn", nxn);
    dfg("nxt", nxt);
    dfg("nxf", nxf);

    dfg("en", en);
    dfg("et", et);
    dfg("ef", ef);
    dfg("ee", ee);

    dfg("nn", nn);
    dfg("nt", nt);
    dfg("nf", nf);
    dfg("ne", ne);

    dfg("noe", noe);
    dfg("nne", nne);


    dfg("inoe", inoe);
    dfg("inne", inne);


    dfg("dr", dr);
    dfg("drx", drx);


    dfg("ok", ok);
    dfg("ov", ov);
    dfg("oe", oe);
    dfg("oc", oc);

    dfg("occ", occ);

    dfg("mc", mc);
    dfg("ec", ec);
    dfg("xc", xc);
    dfg("tc", tc);
    dfg("cc", cc);
    dfg("kc", kc);


    dfg("cp", cp);
    dfg("mk", mk);
    dfg("mm", mm);
    dfg("tw", tw);
    dfg("cn", cn);

    dfg("pc", pc);
    dfg("ow", ow);
    dfg("tk", tk);
    dfg("aq", aq);
    dfg("ih", ih);

    dfg("rv", rv);


    dfg("pq", pq);
    dfg("pd", pd);
    dfg("pp", pp);
    dfg("pb", pb);
    dfg("ppq", ppq);
    dfg("paq", paq);
    dfg("pwq", pwq);
    dfg("pfq", pfq);
    dfg("pfp", pfp);


    dfg("dsp", dsp);
    dfg("dp", dp);
    dfg("dpx", dpx);
    dfg("dspgs", dspgs);
    dfg("dpgs", dpgs);
    dfg("dpgsx", dpgsx);


    dfg("rx", rx);
    dfg("reg", reg);
    dfg("ri", ri);
    dfg("rg", rg);
    dfg("rm", rm);
    dfg("rig", rig);
    dfg("rim", rim);
    dfg("rgm", rgm);
    dfg("rigm", rigm);
}