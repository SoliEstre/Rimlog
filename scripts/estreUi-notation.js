/*
    EstreUI rimwork — Notation & Storage
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Notation & Storage -- EstreNotationManager, AsyncStorage,
//         NativeStorage, ES/EAS/EJS/EAJS, EstreUiParameterManager
// ======================================================================

class EstreNotationManager {

    // static
    static #page = "popNote";

    static #queue = [];
    static current = null;

    static postHandle = null;

    static get noInteraction() { return (intent) => {}; }

    static post(message, showTime = 3000, onTakeInteraction = this.noInteraction, options = {}) {
        if (message != null && !isNaN(showTime) && showTime > 0) {
            return new Promise((resolve) => {
                const it = new EstreNotationManager(message, showTime, onTakeInteraction, options, resolve);
                this.#queue.push(it);
                if (window.isDebug) console.log(this.#page + " posted: ", it);
                postQueue(_ => this.postHandler());
            });
        }
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

    static checkOut(intent) {
        if (intent.data.posted != null && this.postHandle == intent.data.posted) {
            if (this.current == intent) {
                this.current = null;
            }
            this.postHandle = null;
            if (window.isDebug) console.log(this.#page + " checked out: ", intent);
            postQueue(_ => this.postHandler());
        }
        intent.resolver?.(intent);
    }

    // instance property
    data = {
        posted: undefined,
        content: undefined,
        showTime: undefined,
        interactive: undefined,
        resolver: undefined,

        //options
        iconSrc: undefined,
        textSize: undefined,
        textWeight: undefined,
        textColor: undefined,
        bgColor: undefined,
    };

    onTakeInteraction = undefined;

    constructor(message, showTime = 3000, onTakeInteraction = EstreNotationManager.noInteraction, options = {}, resolver) {
        for (const item in options) this.data[item] = options[item];
        this.data.content = message;
        this.data.showTime = showTime;
        this.onTakeInteraction = onTakeInteraction;
        if (onTakeInteraction != EstreNotationManager.noInteraction) this.data.interactive = "";
        this.resolver = resolver;
    }
}

const note = function (message, showTime = 3000, onTakeInteraction = EstreNotationManager.noInteraction, options = {}) {
    return EstreNotationManager.post(...arguments);
}



// For Native storage 
class AsyncStorage {}
class NativeStorage extends AsyncStorage {

    constructor() {
        super();

        this.#getLength();
    }

    #length = 0;

    get length() {
        return this.#length;
    }

    async #getLength() {
        this.#length = await window.app?.request?.("getLengthOfNativeStorage") ?? 0;
        return this.#length;
    }

    async key(index) {
        return await window.app?.request?.("getFromNativeStorageAt", index);
    }

    async getItem(keyName) {
        return await window.app?.request?.("getFromNativeStorage", keyName);
    }

    async setItem(keyName, keyValue) {
        const returns = await window.app?.request?.("setToNativeStorage", keyName, keyValue);
        await this.#getLength();
        return returns;
    }

    async removeItem(keyName) {
        const returns = await window.app?.request?.("removeFromNativeStorage", keyName);
        await this.#getLength();
        return returns;
    }

    async clear() {
        const returns = await window.app?.request?.("clearNativeStorage");
        await this.#getLength();
        return returns;
    }

}
window.nativeStorage = new NativeStorage();

// Storage handler
const ES_PREFIX = "ESAF_";//Estre Syncretic Applicate Framework

/**
 * Estre Storage access handler
 */
class ES {

    _storage = null;
    _storagePrefix = null;

    get _prefix() { return ES_PREFIX + this._storagePrefix + "RAW_"; }


    _getFullKey(key) { return this._prefix + key; }



    constructor(storage, storagePrefix) {
        this._storage = storage;
        this._storagePrefix = storagePrefix;
    }

    
    #get(key, type = "string", def) {
        if (key == null | key == "") return;
        const value = this._storage.getItem(this._getFullKey(key));
        return this._getBy(type, value, def);
    }

    _getBy(type, value, def) {
        switch (type) {

            case "boolean":
                if (value == "true") return true;
                else if (value == "false") return false;
                else if (value == "null") return null;
                else return def;

            case "int":
                if (isNaN(value)) return def;
                else return parseInt(value);

            case "float":
                if (isNaN(value)) return def;
                else return parseFloat(value);

            case "object":
                if (value == null || value == "") return def;
                else try {
                    return JSON.parse(value);
                } catch (ex) {
                    if (window.isLogging) console.error("[" + ex.name + "]" + ex.message);
                    if (window.isDebug) console.error(value);
                    return def;
                }

            case "binary":
                if (value == null || value == "") return def;
                else try {
                    return atob(value);
                } catch (ex) {
                    if (window.isLogging) console.error("[" + ex.name + "]" + ex.message);
                    if (window.isDebug) console.error(value);
                    return def;
                }

            case "bytes":
                if (value == null || value == "") return def;
                else try {
                    return Uint8Array.from(atob(value), (m) => m.codePointAt(0));
                } catch (ex) {
                    if (window.isLogging) console.error("[" + ex.name + "]" + ex.message);
                    if (window.isDebug) console.error(value);
                    return def;
                }

            case "string":
            default:
                return value == null ? def : value;
        }
    }

    getBoolean(key, def) { return this.#get(key, "boolean", def); }
    getInt(key, def) { return this.#get(key, "int", def); }
    getFloat(key, def) { return this.#get(key, "float", def); }
    getString(key, def) { return this.#get(key, "string", def); }
    getBinary(key, def) { return this.#get(key, "binary", def); }
    getBytes(key, def) { return this.#get(key, "bytes", def); }
    getObject(key, def) { return this.#get(key, "object", def); }

    get(key, def) { return this.getString(key, def); }
        

    #set(key, type = "string", value) {
        if (key == null | key == "") return undefined;
        let valueString = this._stringifyBy(type, value);
        if (valueString === false) return false;

        return this._storage.setItem(this._getFullKey(key), valueString == null ? "" : valueString);
    }

    _stringifyBy(type, value) {
        let valueString = null;
        switch (type) {

            case "object":
                try {
                    valueString = JSON.stringify(value);
                } catch (ex) {
                    if (window.isLogging) console.error("[" + ex.name + "]" + ex.message);
                    if (window.isDebug) console.error(value);
                    return false;
                }
                break;

            case "binary":
                try {
                    valueString = btoa(value);
                } catch (ex) {
                    if (window.isLogging) console.error("[" + ex.name + "]" + ex.message);
                    if (window.isDebug) console.error(value);
                    return false;
                }
                break;

            case "bytes":
                try {
                    valueString = btoa(Array.from(value, (x) => String.fromCodePoint(x)).join(""));
                } catch (ex) {
                    if (window.isLogging) console.error("[" + ex.name + "]" + ex.message);
                    if (window.isDebug) console.error(value);
                    return false;
                }
                break;

            case "string":
                valueString = value;
                break;

            case "boolean":
            case "int":
            case "float":
            default:
                valueString = "" + value;
                break;
        }

        return valueString;
    }

    setBoolean(key, value) { return this.#set(key, "boolean", value); }
    setInt(key, value) { return this.#set(key, "int", value); }
    setFloat(key, value) { return this.#set(key, "float", value); }
    setString(key, value) { return this.#set(key, "string", value); }
    setBinary(key, value) { return this.#set(key, "binary", value); }
    setBytes(key, value) { return this.#set(key, "bytes", value); }
    setObject(key, value) { return this.#set(key, "object", value); }
    
    set(key, value) { return this.setString(key, value); }

    
    #remove(key) {
        if (key == null | key == "") return undefined;
        return this._storage.removeItem(this._getFullKey(key));
    }

    remove(key) { return this.#remove(key); }
}

/**
 * Estre Async Storage access handler
 */
class EAS extends ES {

    constructor(storage, storagePrefix) {
        super(storage, storagePrefix);
    }

    async #get(key, type = "string", def) {
        if (key == null | key == "") return;
        const value = await this._storage.getItem(this._getFullKey(key));
        return this._getBy(type, value, def);
    }

    async getBoolean(key, def) { return await this.#get(key, "boolean", def); }
    async getInt(key, def) { return await this.#get(key, "int", def); }
    async getFloat(key, def) { return await this.#get(key, "float", def); }
    async getString(key, def) { return await this.#get(key, "string", def); }
    async getBinary(key, def) { return await this.#get(key, "binary", def); }
    async getBytes(key, def) { return await this.#get(key, "bytes", def); }
    async getObject(key, def) { return await this.#get(key, "object", def); }

    async get(key, def) { return await this.getString(key, def); }


    async #set(key, type = "string", value) {
        if (key == null | key == "") return undefined;
        let valueString = this._stringifyBy(type, value);
        if (valueString === false) return false;

        return await this._storage.setItem(this._getFullKey(key), valueString == null ? "" : valueString);
    }

    async setBoolean(key, value) { return await this.#set(key, "boolean", value); }
    async setInt(key, value) { return await this.#set(key, "int", value); }
    async setFloat(key, value) { return await this.#set(key, "float", value); }
    async setString(key, value) { return await this.#set(key, "string", value); }
    async setBinary(key, value) { return await this.#set(key, "binary", value); }
    async setBytes(key, value) { return await this.#set(key, "bytes", value); }
    async setObject(key, value) { return await this.#set(key, "object", value); }
    
    async set(key, value) { return await this.setString(key, value); }


    async #remove(key) {
        if (key == null | key == "") return undefined;
        return await this._storage.removeItem(this._getFullKey(key));
    }

    async remove(key) { return await this.#remove(key); }

}


/**
 * Estre JSON/JCODD Storage access handler
 */
class EJS {

    get _typePrefix() { return equalCase(this._codeType, {
        json: "JSON_",
        jcodd: "JCODD_",
    }); }

    _storage = null;
    _storagePrefix = null;

    _codeType;

    get _prefix() { return ES_PREFIX + this._storagePrefix + this._typePrefix; }


    _getFullKey(key) { return this._prefix + key; }

    constructor(storage, storagePrefix, codeType = "jcodd") {
        this._storage = storage;
        this._storagePrefix = storagePrefix;
        this._codeType = codeType.toLowerCase();
    }

    get(key, def) {
        if (key == null | key == "") return;
        const value = this._storage.getItem(this._getFullKey(key));
        return value == null ? def : equalCase(this._codeType, {
            json: _ => JSON.parse(value),
            jcodd: _ => Jcodd.parse(value),
        });
    }

    set(key, value) {
        if (key == null | key == "") return undefined;
        let valueString
        try {
        valueString = equalCase(this._codeType, {
            json: _ => JSON.stringify(value),
            jcodd: _ => Jcodd.coddify(value),
        });
        } catch (ex) {
            if (window.isLogging) console.error(ex);
        }            
        return this._storage.setItem(this._getFullKey(key), valueString == null ? "" : valueString);
    }

}

/**
 * Estre Async JSON/JCODD Storage access handler
 */
class EAJS extends EJS {

    constructor(storage, storagePrefix, codeType) {
        super(storage, storagePrefix, codeType);
    }

    async get(key, def) {
        if (key == null | key == "") return;
        const value = await this._storage.getItem(this._getFullKey(key));
        return value == null ? def : equalCase(this._codeType, {
            json: _ => JSON.parse(value),
            jcodd: _ => Jcodd.parse(value),
        });
    }

    async set(key, value) {
        if (key == null | key == "") return undefined;
        let valueString
        try {
        valueString = equalCase(this._codeType, {
            json: _ => JSON.stringify(value),
            jcodd: _ => Jcodd.coddify(value),
        });
        } catch (ex) {
            if (window.isLogging) console.error(ex);
        }            
        return await this._storage.setItem(this._getFullKey(key), valueString == null ? "" : valueString);
    }

}
    


/**
 * Session storage handler
 */
const ESS = new ES(sessionStorage, "SS_");

/**
 * Local storage handler
 */
const ELS = new ES(localStorage, "LS_");

/**
 * Native storage handler
 */
const ENS = new EAS(nativeStorage, "NS_");




/**
 * Codded Session storage handler
 */
const ECSS = new EJS(sessionStorage, "SS_");

/**
 * Codded Local storage handler
 */
const ECLS = new EJS(localStorage, "LS_");

/**
 * Codded Native storage handler
 */
const ECNS = new EAJS(nativeStorage, "NS_");





/***
 * Parameter manager
 */
class EstreUiParameterManager {

    get ssPrefix() { return this.#prefix + "PARAMETER_MANAGER_"; }
    
    get forLS() { return {

    }; }

    get forSS() { return {
        get page() { return "requestPage"; },
        get origin() { return "requestOrigin"; },
    }; }

    // class property
    #prefix;
    #params;

    #lsMatch = {};
    #ssMatch = {};

    constructor(prefix = "", lsMatch = {}, ssMatch = {}, search = location.search) {
        this.#prefix = prefix ?? "";
        this.#params = new URLSearchParams(search);
        this.#lsMatch = lsMatch ?? {};
        this.#ssMatch = ssMatch ?? {};
    }
    

    init() {
        for (const [key, value] of this.#params) {
            let keyName = this.#lsMatch[key] ?? this.forLS[key];
            if (keyName != null) {
                ELS.setString(keyName.length > 0 ? keyName : this.ssPrefix + key, value);
            } else {
                keyName = this.#ssMatch[key] ?? this.forSS[key];
                ESS.setString(keyName != null && keyName.length > 0 ? keyName : this.ssPrefix + key, value);
            }
        }

        return this;
    }

    get(key) {
        let keyName = this.#lsMatch[key] ?? this.forLS[key];
        if (keyName != null) {
            return ELS.getString(keyName.length > 0 ? keyName : this.ssPrefix + key);
        } else {
            keyName = this.#ssMatch[key] ?? this.forSS[key];
            return ESS.getString(keyName != null && keyName.length > 0 ? keyName : this.ssPrefix + key);
        }
    }
}


/**
 * Async works manager
 */
class EstreAsyncManager {

    static works = new Set();
    static onClears = new Set();

    static get workIs() { return Array.from(this.works).length; }
    
    static beginWork(specifier, host, just = Date.now()) {
        const id = just + "@" + host + "#" + specifier;

        this.works.add(id);

        return id;
    }
    
    static endOfWork(id) {
        this.works.delete(id);

        const lefts = this.workIs
        if (lefts < 1) this.bringFinishCallback();

        return lefts;
    }

    static setOnFinishedCurrentWorks(callback) {
        if (this.workIs < 1) callback(0);
        else this.onClears.add(callback);
    }

    static removeOnFinishedCurrentWorks(callback) {
        this.onClears.delete(callback);
    }

    static bringFinishCallback() {
        const callbacks = Array.from(this.onClears);
        const lefts = this.workIs;

        for (var callback of callbacks) callback(lefts);
    }
}



// ======================================================================