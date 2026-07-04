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

// DOCTRE.js - Document Object Cold Taste Refrigeration Effortlessness //
// 
// Cold(array object) assigning of HTML Tree for make to JSON string.
// 
// v1.1.2 / release 2026.04.18
// 
// cold = [] - Cold HTML child node list
// cold[0] - Tag name, classes, id, name, type = "tag.class1.class2#id@name$type" : string
// cold[1] - Content data = cold HCNL : Array / text or html codes or empty: string / node list : NodeList / element : Element / node : Node
// cold[2] - Style codes : string / styles : object
// cold[3] - Extra attributes : object
// cold[4] - Data attributes : object
//
//
// frost = '[["div.box.float#app@root", null], "text node or html code"]'
// 
// Match replace
// ex) Doctre.parse([["|tag|.|classes|#|id|", "empty content"], "|divider|"], { tag: () => isInline ? "span" | "div", classes: "test fixed", id: getId(), divider: it => '<hr class="' + it + '" />' })

// ──────────────────────────────────────────────
// @typedef — reusable type shapes
// ──────────────────────────────────────────────

/**
 * Extracted solidId components.
 * @typedef {Object} DoctreSolidId
 * @property {string} tagName - HTML tag name.
 * @property {string} [class] - Space-separated CSS class names.
 * @property {string} [id] - Element id.
 * @property {string} [name] - Element name attribute.
 * @property {string} [type] - Element type attribute.
 */

/**
 * A single cold element entry — serialized DOM node in array form.
 *
 * `[solidId, contentData, style, attrs, datas]`
 * @typedef {Array} DoctreColdElement
 * @property {string|DoctreSolidId} 0 - solidId string or extracted object.
 * @property {DoctreColdElement[]|string|null} [1] - Child content (cold array, text, or null).
 * @property {string|Object} [2] - Inline style string or style object.
 * @property {Object<string, string>} [3] - Regular HTML attributes (excluding id/name/type/class/style/data-*).
 * @property {Object<string, string>} [4] - data-* attributes.
 */

/**
 * Token replacement map used by Doctre.matchReplace.
 * Keys are token names (matched as `|key|`); values are replacement strings, functions, or objects.
 * @typedef {Object<string, string|Function|Object>} DoctreMatchReplacer
 * @property {string} [dataPlaceholder] - Default replacement for unmatched tokens.
 * @property {boolean} [coverReplaceable] - If true, replaces all unmatched tokens with dataPlaceholder.
 */

/**
 * Document Object Cold Taste Refrigeration Effortlessness — DOM serialization/deserialization engine.
 * Preserves and restores HTML trees using cold (array object) and frost (JSON string) formats.
 *
 * **cold format**: `[solidId, contentData, style, attrs, datas]`
 * - `solidId`: `"tag.class1.class2#id@name$type"` string or extracted object
 * - `contentData`: cold array / text string / NodeList / Element / Node
 * - `style`: style string or object
 * - `attrs`: regular attribute object
 * - `datas`: data-* attribute object
 *
 * **frost format**: JSON.stringify'd cold string
 *
 * **matchReplace**: replaces `|key|` tokens with values from the matchReplacer object
 * @class
 */
class Doctre {

    /**
     * Splits a solidId string into the tag name and remaining major attribute parts.
     * @param {string|Object} solidId - solidId string or `{ tagName, ... }` object.
     * @returns {[string, string|Object]} `[tagName, majorAttrs]` tuple.
     */
    static extractTagName(solidId) {
        let tagName, majorAttrs;
        if (typeof solidId == "string") {
            const tagFilter = /^[\w:-]+/;
            tagName = tagFilter.exec(solidId)[0];
            majorAttrs = solidId.replace(tagFilter, "");
        } else {
            tagName = solidId.tagName;
            delete solidId.tagName;
            majorAttrs = solidId;
        }
        return [tagName, majorAttrs];
    }

    /**
     * Parses the major attribute part (`.class#id@name$type`) of a solidId into an object.
     * @param {string} majorAttrs - Major attribute string.
     * @param {Object} [to={}] - Object to store results into.
     * @returns {Object} `{ class?, id?, name?, type? }` attribute object.
     */
    static extractMajorAttrs(majorAttrs, to = {}) {
        const process = (string, divider, attrName) => {
            const filter = new RegExp(divider + "[\\w.-]*");
            const match = filter.exec(string);
            if (match != null) {
                to[attrName] = match[0].replace(new RegExp("^" + divider), "");
                return string.replace(filter, "");
            } else return string;
        };
        const classIdName = process(majorAttrs, "\\$", "type");
        const classId = process(classIdName, "@", "name");
        const classes = process(classId, "#", "id");
        if (classes.length > 0) to["class"] = classes === "." ? "" : classes.replace(/^\./, "").replace(/\./g, " ").replace(/\s+/g, " ").replace(/[^\w\s-]/g, "");
        return to;
    }

    /**
     * Extracts both the tag name and major attributes from a solidId.
     * @param {string} solidId - solidId string.
     * @returns {Object} `{ tagName, class?, id?, name?, type? }`.
     */
    static extractTagAndMajorAttrs(solidId) {
        const [tagName, majorAttrs] = this.extractTagName(solidId);
        return this.extractMajorAttrs(majorAttrs, { tagName });
    }


    /**
     * Creates a DOM element from cold parameters.
     * @param {string|Array} [tagName="template"] - Tag name or cold array.
     * @param {string|Object} [majorAttrs] - Major attributes string/object.
     * @param {string|Array|NodeList|Node|Doctre|null} [contentData] - Child content.
     * @param {string|Object} [style={}] - Style.
     * @param {Object} [attrs={}] - Regular attributes.
     * @param {Object} [datas={}] - data-* attributes.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - `|key|` token replacement map.
     * @returns {Element} The created DOM element.
     */
    static createElement(tagName = "template", majorAttrs, contentData, style = {}, attrs = {}, datas = {}, matchReplacer = {}) {
        if (tagName instanceof Array) return this.createElement(...tagName);

        const element = document.createElement(this.matchReplace(tagName, matchReplacer));
        if (majorAttrs != null) {
            const extracted = typeof majorAttrs == "string" ? this.extractMajorAttrs(majorAttrs) : majorAttrs;
            for (const attrName in extracted) element.setAttribute(this.matchReplace(attrName, matchReplacer), this.matchReplace(extracted[attrName], matchReplacer));
        }
        if (attrs != null) for (let [key, value] of Object.entries(attrs)) {
            key = this.matchReplace(key, matchReplacer);
            value = this.matchReplace(value, matchReplacer);

            switch (key) {
                case "id":
                case "name":
                case "type":
                case "class":
                case "style":
                    break;

                default:
                    element.setAttribute(key, value);
                    break;
            }
        }
        if (datas != null) for (const [key, value] of Object.entries(datas)) element.dataset[this.matchReplace(key)] = this.matchReplace(value);//Object.assign(element.dataset, datas);//
        if (contentData != null) switch (typeof contentData) {
            case "string":
                element.innerHTML = this.matchReplace(contentData, matchReplacer);
                break;

            default:
                if (contentData instanceof Array) element.append(this.createFragment(contentData, matchReplacer));
                else if (contentData instanceof NodeList) for (const node of contentData) element.appendChild(node);
                else if (contentData instanceof Node) element.appendChild(contentData);
                else if (contentData instanceof Doctre) element.appendChild(contentData.fresh(matchReplacer));
                else element.append(contentData);
                break;
        };
        if (style != null) {
            if (typeof style == "string") element.setAttribute("style", this.matchReplace(style, matchReplacer));
            else for (const [key, value] of Object.entries(style)) {
                if (key.includes("-")) element.style.setProperty(this.matchReplace(key), this.matchReplace(value));
                else Object.assign(element.style, style);
            }
        }
        return element;
    }

    /**
     * createElement variant that takes matchReplacer as the first argument.
     * @param {DoctreMatchReplacer} matchReplacer - Token replacement map.
     * @param {string} tagName - Tag name.
     * @param {string|Object} [majorAttrs] - Major attributes.
     * @param {*} [contentData] - Child content.
     * @param {string|Object} [style={}] - Style.
     * @param {Object} [attrs={}] - Regular attributes.
     * @param {Object} [datas={}] - data-* attributes.
     * @param {DoctreMatchReplacer} [matchReplacerOrigin={}] - Fallback when matchReplacer is null.
     * @returns {Element}
     */
    static createElementReplaced(matchReplacer, tagName, majorAttrs, contentData, style = {}, attrs = {}, datas = {}, matchReplacerOrigin = {}) {
        return this.createElement(tagName, majorAttrs, contentData, style, attrs, datas, matchReplacer ?? matchReplacerOrigin);
    }

    /**
     * Creates an element from a solidId string. Automatically extracts tagName and majorAttrs from solidId.
     * @param {string|Array} solidId - solidId string or array.
     * @param {*} [contentData] - Child content.
     * @param {string|Object} [style={}] - Style.
     * @param {Object} [attrs={}] - Regular attributes.
     * @param {Object} [datas={}] - data-* attributes.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - Token replacement map.
     * @returns {Element}
     */
    static createElementBy(solidId, contentData, style = {}, attrs = {}, datas = {}, matchReplacer = {}) {
        if (solidId instanceof Array) return this.createElementBy(...solidId);

        let [tagName, majorAttrs] = this.extractTagName(this.matchReplace(solidId, matchReplacer));
        return this.createElement(tagName, majorAttrs, contentData, style, attrs, datas, matchReplacer);
    }

    /**
     * createElementBy variant that takes matchReplacer as the first argument.
     * @param {DoctreMatchReplacer} matchReplacer - Token replacement map.
     * @param {string} solidId - solidId string.
     * @param {*} [contentData] - Child content.
     * @param {string|Object} [style={}] - Style.
     * @param {Object} [attrs={}] - Regular attributes.
     * @param {Object} [datas={}] - data-* attributes.
     * @param {DoctreMatchReplacer} [matchReplacerOrigin={}] - Fallback replacement map.
     * @returns {Element}
     */
    static createElementReplacedBy(matchReplacer, solidId, contentData, style = {}, attrs = {}, datas = {}, matchReplacerOrigin = {}) {
        return this.createElementBy(solidId, contentData, style, attrs, datas, matchReplacer ?? matchReplacerOrigin);
    }

    /**
     * Creates a DocumentFragment from a cold (HCNL) array.
     * @param {Array} hcnlArray - HTML Cold Node List array.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - Token replacement map.
     * @returns {DocumentFragment}
     */
    static createFragment(hcnlArray, matchReplacer = {}) {
        const df = document.createDocumentFragment();
        for (const val of hcnlArray) switch (typeof val) {
            case "string":
                const tmp = this.createElement();
                tmp.innerHTML = this.matchReplace(val, matchReplacer);
                const childNodes = tmp.content.childNodes;
                while (childNodes.length > 0) df.appendChild(childNodes[0]);
                break;

            case "object":
            default:
                if (val instanceof Node) df.appendChild(val);
                else if (val instanceof Doctre) df.appendChild(val.fresh(matchReplacer));
                else if (val instanceof Array) df.append(this.createElementReplacedBy(matchReplacer, val));
                else df.append(val);
                break;
        };
        return df;
    }

    /** @type {string} Current User-Agent string. */
    static get userAgent() { return navigator?.userAgent ?? ""; }
    /** @type {boolean} Whether newline/tab escaping is needed for Safari/iOS. */
    static get isRequiredEscape() {
        const userAgent = this.userAgent;
        return userAgent != "" && (userAgent.includes("iPad") || userAgent.includes("iPhone") || userAgent.includes("iPod") || (userAgent.includes("Macintosh") && !userAgent.includes("Chrome") && !userAgent.includes("Firefox") && !userAgent.includes("Edge") && !userAgent.includes("Opera")));
    }
    /**
     * Escapes newlines and tabs in JSON strings for Safari compatibility.
     * @param {string} jsonContent - JSON string.
     * @returns {string} Escaped string (returned as-is on non-Safari).
     */
    static crashBroker(jsonContent) {
        if (this.isRequiredEscape) jsonContent = jsonContent.replace(/\r\n/gm, "\\r\\n").replace(/\n\r/gm, "\\n\\r").replace(/\r/gm, "\\r").replace(/\n/gm, "\\n").replace(/\t/g, "\\t");
        return jsonContent;
    }

    /**
     * Copies only primitive-type values from an object. Used to avoid circular references.
     * @param {Object} obj - Source object.
     * @returns {Object} A new object containing only primitive values.
     */
    static copyPrimitives(obj) {
        return Object.fromEntries(
            Object.entries(obj).filter(([, v]) => v !== Object(v))
        );
    }

    /**
     * Replaces `|key|` tokens in a string with values from the matchReplacer. Delegates to matchReplaceObject for objects.
     * @param {string|Object} frostOrString - String or object to apply replacements to.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - `{ key: value }` replacement map. Values can be string/function/object.
     *   - `dataPlaceholder`: default replacement for unmatched tokens.
     *   - `coverReplaceable`: if true, replaces all unmatched tokens with dataPlaceholder.
     * @returns {string|Object} The replaced result.
     */
    static matchReplace(frostOrString, matchReplacer = {}) {
        if (typeof frostOrString != "string") return this.matchReplaceObject(frostOrString, matchReplacer);

        if (matchReplacer != null) {
            for (const key in matchReplacer) {
                let replacer = matchReplacer[key];
                const regex = new RegExp("\\|" + key + "\\|", "g");
                if (replacer == null) {
                    if (matchReplacer.dataPlaceholder == null) continue;
                    else replacer = matchReplacer.dataPlaceholder;
                }
                let forReplaced;
                switch (typeof replacer) {
                    case "string":
                        forReplaced = replacer;
                        break;
                    case "function":
                        forReplaced = replacer(key);
                        break;
                    case "object":
                        try {
                            forReplaced = JSON.stringify(replacer);
                        } catch (error) {
                            forReplaced = JSON.stringify(this.copyPrimitives(replacer));
                        }
                        break;
                    default:
                        forReplaced = "" + replacer;
                        break;
                }
                frostOrString = frostOrString.replace(regex, this.crashBroker(forReplaced));
            }
            if (matchReplacer.coverReplaceable && matchReplacer.dataPlaceholder != null) {
                const replacer = matchReplacer.dataPlaceholder;
                const regex = /\|([^\|]+)\|/g;
                const matches = frostOrString.match(regex);
                if (matches != null) {
                    for (const match of matches) {
                        let forReplaced;
                        switch (typeof replacer) {
                            case "string":
                                forReplaced = replacer;
                                break;
                            case "function":
                                forReplaced = replacer(match);
                                break;
                            case "object":
                                try {
                                    forReplaced = JSON.stringify(replacer);
                                } catch (error) {
                                    forReplaced = JSON.stringify(this.copyPrimitives(replacer));
                                }
                                break;
                            default:
                                forReplaced = "" + replacer;
                                break;
                        }
                        frostOrString = frostOrString.replace(match, this.crashBroker(forReplaced));
                    }
                }
            }
        }
        return frostOrString;
    }

    /**
     * Recursively applies matchReplace to both keys and values of an object.
     * @param {Object} object - Object to apply replacements to.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - Replacement map.
     * @returns {Object} A new object with replacements applied.
     */
    static matchReplaceObject(object, matchReplacer = {}) {
        const replaced = object.constructor();
        for (const key in object) replaced[this.matchReplace(key, matchReplacer)] = this.matchReplace(object[key], matchReplacer);
        return replaced;
    }

    /**
     * Parses a frost (JSON string) and restores it as a DocumentFragment.
     * @param {string} frost - Frost format JSON string.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - Token replacement map.
     * @returns {DocumentFragment}
     */
    static parse(frost, matchReplacer = {}) {
        frost = this.crashBroker(frost);
        const trimmedFrost = frost.trim();
        if (trimmedFrost.startsWith("[['") || trimmedFrost.startsWith("['")) frost = frost.replace(/\'/g, '"');
        const replaced = this.matchReplace(frost, matchReplacer);
        let parsed;
        try {
            parsed = JSON.parse(replaced);
        } catch (error) {
            try {
                parsed = this.matchReplaceObject(JSON.parse(frost), matchReplacer);
            } catch (error) {
                console.error("Doctre.parse - Frozen JSON parse error: ", error);
            }
        }
        return this.createFragment(parsed);
    }

    /**
     * Restores frost (string) or cold (array) to a live DOM (DocumentFragment).
     * @param {string|Array} frostOrCold - Frost string or cold array.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - Token replacement map.
     * @returns {DocumentFragment}
     */
    static live(frostOrCold, matchReplacer = {}) {
        if (typeof frostOrCold == "string") return this.parse(frostOrCold, matchReplacer);
        else return this.createFragment(frostOrCold);
    }

    /**
     * Wraps frost/cold in a template element and returns it.
     * @param {string|Array} frostOrCold - Frost or cold data.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - Token replacement map.
     * @returns {Element} Template element containing the content.
     */
    static takeOut(frostOrCold, matchReplacer = {}) {
        const element = this.createElement();
        element.append(this.live(frostOrCold, matchReplacer));
        return element;
    }


    /**
     * Assembles a solidId string from tag name and major attributes.
     * @param {string} tagName - Tag name.
     * @param {string} [className] - CSS classes (space-separated).
     * @param {string} [id] - ID.
     * @param {string} [name] - name attribute.
     * @param {string} [type] - type attribute.
     * @returns {string} solidId string (e.g. `"div.box.float#app@root$text"`).
     */
    static getSolidId(tagName, className, id, name, type) {
        let solidId = tagName;
        if (className != null) solidId += "." + className.replace(/ /g, ".");
        if (id != null) solidId += "#" + id;
        if (name != null) solidId += "@" + name;
        if (type != null) solidId += "$" + type;
        return solidId;
    }

    /**
     * Extracts the tag name and major attributes (class, id, name, type) from a DOM element.
     * @param {Element} element - Target element.
     * @param {boolean} [asSolidId=false] - If true returns solidId string, if false returns object.
     * @returns {string|Object} solidId string or `{ tagName, class?, id?, name?, type? }`.
     */
    static packTagAndMajorAttrs(element, asSolidId = false) {
        const tagName = element.tagName.toLowerCase();
        const className = element.getAttribute("class");
        const id = element.getAttribute("id");
        const name = element.getAttribute("name");
        const type = element.getAttribute("type");

        if (asSolidId) return this.getSolidId(tagName, className, id, name, type);
        else {
            const extracted = { tagName };
            if (className != null) extracted["class"] = className;
            if (id != null) extracted["id"] = id;
            if (name != null) extracted["name"] = name;
            if (type != null) extracted["type"] = type;
            return extracted;
        }
    }

    /**
     * Parses a CSS style string into a `{ property: value }` object.
     * @param {string} style - Inline style string.
     * @returns {Object<string, string>}
     */
    static getStyleObject(style) {
        const styles = {};
        const divided = style.split(";");
        for (var item of divided) {
            let [key, value] = item.split(":");
            key = key.trim();
            if (key == "") continue;
            value = value.trim();
            if (key && value) styles[key] = value;
        }
        return styles;
    }

    /**
     * Extracts attributes from a NamedNodeMap, excluding id/name/type/class/style/data-*.
     * @param {NamedNodeMap} attrs - Element's attributes.
     * @returns {Object<string, string>}
     */
    static packAttributes(attrs) {
        const pack = {};
        for (const attr of attrs) {
            const name = attr.name;
            switch (name) {
                case "id":
                case "name":
                case "type":
                case "class":
                case "style":
                    break;

                default:
                    if (!name.startsWith("data-")) pack[name] = attr.value;
                    break;
            }
        }
        return pack;
    }

    /**
     * Copies a DOMStringMap (dataset) to a plain object.
     * @param {DOMStringMap} dataset - Element's dataset.
     * @returns {Object<string, string>}
     */
    static getDataObject(dataset) {
        const datas = {};
        for (const key in dataset) datas[key] = dataset[key];
        return datas;
    }


    /**
     * Removes trailing empty entries (null, empty string, empty array, empty object) from an HECP (cold element array).
     * @param {Array} hecp - Cold element array `[solidId, content, style, attrs, datas]`.
     * @returns {Array} The trimmed array (mutates the original).
     */
    static trimHecp(hecp) {
        for (var i = hecp.length - 1; i > 0; i--) {
            if (hecp[i] == null) delete hecp[i];
            else if (typeof hecp[i] == "string" || hecp[i] instanceof Array) {
                if (hecp[i].length == 0) hecp.pop();
                else break;
            } else {
                const count = Object.keys(hecp[i]).length;
                if (count == 0) hecp.pop();
                else break;
            }
        }
        return hecp;
    }

    /**
     * Serializes a DOM element into a cold array.
     * @param {Element} element - Target element.
     * @param {boolean} [trimBobbleNode=false] - Remove whitespace-only text nodes.
     * @param {boolean} [trimHecp=false] - Trim trailing empty entries.
     * @param {boolean} [styleToObject=!trimHecp] - Convert style to object.
     * @param {boolean} [trimIndent=trimHecp] - Trim text indentation.
     * @param {boolean} [elementAsDoctre=!trimHecp] - Preserve child elements as Doctre instances.
     * @returns {Array} Cold array.
     */
    static frostElement(element, trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        const frozen = [];
        frozen.push(this.packTagAndMajorAttrs(element, !elementAsDoctre));
        frozen.push(this.coldify(element.childNodes, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre));
        const style = element.getAttribute("style");
        if (styleToObject && style != null) frozen.push(this.getStyleObject(style));
        else frozen.push(style ?? {});
        frozen.push(this.packAttributes(element.attributes));
        frozen.push(this.getDataObject(element.dataset));
        return trimHecp ? this.trimHecp(frozen) : frozen;
    }

    /**
     * Trims leading/trailing whitespace from each line of text.
     * @param {string} text - Source text.
     * @param {boolean} [trimIndent=false] - If true, fully removes indentation; if false, collapses to single space.
     * @returns {string}
     */
    static trimTextIndent(text, trimIndent = false) {
        return text.split("\n").map(line => {
            let std = line.trimStart();
            if (!trimIndent && std.length != line.length) std = " " + std;
            let etd = std.trimEnd();
            if (!trimIndent && etd.lenth != std.length) etd += " ";
            return etd;
        }).join("\n");
    }

    /**
     * Serializes a single node to cold format. Branches by node type.
     * @param {Node|Doctre|Array} node - Target node.
     * @param {boolean} [trimBobbleNode=false] - Remove whitespace text nodes.
     * @param {boolean} [trimHecp=false] - Trim trailing empty entries.
     * @param {boolean} [styleToObject=!trimHecp] - Convert style to object.
     * @param {boolean} [trimIndent=trimHecp] - Trim text indentation.
     * @param {boolean} [elementAsDoctre=!trimHecp] - Preserve child elements as Doctre.
     * @returns {Array|Doctre|string} Cold array, Doctre instance, or text string.
     */
    static frostNode(node, trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        if (node instanceof Doctre) return elementAsDoctre ? node : node.frost(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
        else if (node instanceof DocumentFragment) return this.coldify(node.childNodes, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
        else if (node instanceof Element) return this.frostElement(node, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
        else if (node instanceof Array) return elementAsDoctre ? new Doctre(...node) : (trimHecp ? this.trimHecp(node) : node);
        else {
            const textValue = typeof node == "string" ? node : (node.nodeName == "#comment" ? "<!--" + node.nodeValue + "-->" : node.nodeValue);
            return trimIndent ? this.trimTextIndent(textValue, trimIndent) : textValue;
        }
    }

    /**
     * Serializes a node or node list into a cold array.
     * @param {Node|NodeList|Doctre|string} nodeOrList - Target node/list.
     * @param {boolean} [trimBobbleNode=false] - Remove whitespace text nodes.
     * @param {boolean} [trimHecp=false] - Trim trailing empty entries.
     * @param {boolean} [styleToObject=!trimHecp] - Convert style to object.
     * @param {boolean} [trimIndent=trimHecp] - Trim text indentation.
     * @param {boolean} [elementAsDoctre=!trimHecp] - Preserve child elements as Doctre.
     * @returns {Array} Cold array.
     */
    static coldify(nodeOrList, trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        if (typeof nodeOrList == "string") return this.coldify([nodeOrList], trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);

        const cold = [];
        if (nodeOrList instanceof Doctre) cold.push(elementAsDoctre ? nodeOrList : nodeOrList.frost(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre));
        else if (nodeOrList instanceof Node) cold.push(this.frostNode(nodeOrList, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre));
        else for (const node of nodeOrList) {
            let frozen = this.frostNode(node, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
            if (!trimBobbleNode || typeof frozen != "string" || frozen.replace(/[\s\t\v\r\n]+/g, "").length > 0) cold.push(frozen);
        }
        return cold;
    }

    /**
     * Serializes node/list/cold to frost (JSON string).
     * @param {Node|NodeList|Array} nodeOrListOrCold - Target.
     * @param {boolean|number} [prettyJson=false] - If true or a number (indent), produces pretty-printed JSON.
     * @param {boolean} [trimBobbleNode=false] - Remove whitespace text nodes.
     * @param {boolean} [trimHecp=true] - Trim trailing empty entries.
     * @param {boolean} [styleToObject=!trimHecp] - Convert style to object.
     * @param {boolean} [trimIndent=trimHecp] - Trim text indentation.
     * @returns {string} Frost JSON string.
     */
    static stringify(nodeOrListOrCold, prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        const cold = this.coldify(nodeOrListOrCold, trimBobbleNode, trimHecp, styleToObject, trimIndent, false);

        if (prettyJson == null || prettyJson === false) return JSON.stringify(cold);
        else return JSON.stringify(cold, null, typeof prettyJson == "number" ? prettyJson : 2);
    }


    /**
     * Injects Doctre convenience methods into Node, NodeList, Element, and jQuery prototypes.
     *
     * **NodeList/Node**: `coldify`, `coldified`, `stringify`, `stringified`
     * **Element**: `cold`, `takeCold`, `frozen`, `takeFrozen`,
     *   `alive`(append), `alone`(replace+append),
     *   `freeze`(→data-frozen), `solid`(freeze+clear),
     *   `hot`(data-frozen→fragment), `worm`(hot+append), `melt`(clear+worm),
     *   `burn`(hot+delete data), `wormOut`(worm+delete), `meltOut`(clear+wormOut)
     * **jQuery**: `coldify`, `coldified`, `stringify`, `stringified` (only when jQuery is available)
     */
    static patch() {
        const attach = (cls, name, value) => Object.defineProperty(cls.prototype, name, { value, writable: true, configurable: true, enumerable: false });
        const attachGS = (cls, name, getter, setter) => Object.defineProperty(cls.prototype, name, { getter, setter, configurable: true, enumerable: false });

        attach(NodeList, "coldify", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return Doctre.coldify(this, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
        attach(NodeList, "stringify", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return Doctre.stringify(this, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });

        attach(Node, "coldify", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return Doctre.coldify(this, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
        attach(Node, "coldified", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { const cold = this.coldify(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); this.remove(); return cold; });

        attach(Node, "stringify", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return Doctre.stringify(this, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });
        attach(Node, "stringified", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { const frost = this.stringify(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); this.remove(); return frost; });

        if (typeof jQuery != "undefined") {
            attach(jQuery, "coldify", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return Doctre.coldify(this, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
            attach(jQuery, "coldified", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { const cold = this.coldify(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); this.remove(); return cold; });

            attach(jQuery, "stringify", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return Doctre.stringify(this, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });
            attach(jQuery, "stringified", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { const frost = this.stringify(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); this.remove(); return frost; });
        }

        attach(Element, "cold", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { return this.childNodes.coldify(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); });
        attach(Element, "takeCold", function (trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) { const cold = this.cold(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre); this.innerHTML = ""; return cold; });

        attach(Element, "frozen", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { return this.childNodes.stringify(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); });
        attach(Element, "takeFrozen", function (prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) { const frozen = this.frozen(prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent); this.innerHTML = ""; return frozen; });

        attach(Element, "alive", function (frostOrCold, matchReplacer = {}) { const live = Doctre.live(frostOrCold, matchReplacer); const nodeArray = live == null ? null : NodeArray.box(live); if (live != null) this.append(live); return nodeArray; });
        attach(Element, "alone", function (frostOrCold, matchReplacer = {}) { this.innerHTML = ""; return this.alive(frostOrCold, matchReplacer); });

        attach(Element, "freeze", function (dataName = "frozen", trimBobbleNode = true) { this.dataset[dataName] = this.childNodes.stringify(false, trimBobbleNode); return this; });
        attach(Element, "solid", function (dataName = "frozen", trimBobbleNode = true) { this.freeze(dataName, trimBobbleNode); this.innerHTML = ""; return this; });

        attach(Element, "hot", function (matchReplacer = {}, dataName = "frozen") { const frozen = this.dataset[dataName]; return frozen == null || frozen.trim().length < 2 ? null : Doctre.live(frozen, matchReplacer); });
        attach(Element, "worm", function (matchReplacer = {}, dataName = "frozen") { const live = this.hot(matchReplacer, dataName); const nodeArray = live == null ? null : NodeArray.box(live); if (live != null) this.append(live); return nodeArray; });
        attach(Element, "melt", function (matchReplacer = {}, dataName = "frozen") { this.innerHTML = ""; return this.worm(matchReplacer, dataName); });

        attach(Element, "burn", function (matchReplacer = {}, dataName = "frozen") { const live = this.hot(matchReplacer, dataName); delete this.dataset.frozen; return live; });
        attach(Element, "wormOut", function (matchReplacer = {}, dataName = "frozen") { const nodeArray = this.worm(frozen, matchReplacer); delete this.dataset.frozen; return nodeArray; });
        attach(Element, "meltOut", function (matchReplacer = {}, dataName = "frozen") { this.innerHTML = ""; return this.wormOut(matchReplacer, dataName); });
    }


    /** @type {string} Tag name. */
    tagName;
    /** @type {string[]} CSS class array. */
    classes;
    /** @type {string|undefined} ID. */
    id;
    /** @type {string|undefined} name attribute. */
    name;
    /** @type {string|undefined} type attribute. */
    type;
    /** @type {Array} Child cold array (Doctre instances or strings). */
    childDoctres;
    /** @type {string|Object} Style. */
    style;
    /** @type {Object} Regular attributes. */
    attrs;
    /** @type {Object} data-* attributes. */
    datas;
    /** @type {DoctreMatchReplacer} Default token replacement map. */
    matchReplacer;

    /**
     * @param {string|Object|Array} [solidIdOrExtracted] - solidId string, extracted object, or cold array.
     * @param {*} [contentData] - Child content.
     * @param {string|Object} [style={}] - Style.
     * @param {Object} [attrs={}] - Regular attributes.
     * @param {Object} [datas={}] - data-* attributes.
     * @param {DoctreMatchReplacer} [matchReplacer={}] - Token replacement map.
     */
    constructor(solidIdOrExtracted, contentData, style = {}, attrs = {}, datas = {}, matchReplacer = {}) {
        if (solidIdOrExtracted instanceof Array) {
            solidIdOrExtracted = solidIdOrExtracted[0];
            contentData = solidIdOrExtracted[1];
            style = solidIdOrExtracted[2];
            attrs = solidIdOrExtracted[3];
            datas = solidIdOrExtracted[4];
            matchReplacer = solidIdOrExtracted[5];
        }

        if (solidIdOrExtracted != null) {
            const extracted = typeof solidIdOrExtracted == "string" ? Doctre.extractTagAndMajorAttrs(solidIdOrExtracted) : solidIdOrExtracted;
            this.tagName = extracted.tagName;
            this.classes = extracted.class?.split(" ") ?? [];
            this.id = extracted.id;
            this.name = extracted.name;
            this.type = extracted.type;
        } else {
            this.tagName = "tamplate";
            this.classes = [];
        }

        if (contentData != null) this.childDoctres = Doctre.coldify(contentData, true, false, true);
        else this.contentDoctres = [];

        this.style = style ?? {};
        this.attrs = attrs ?? {};
        this.datas = datas ?? {};
        this.matchReplacer = matchReplacer ?? {};
    }

    /** @type {string} Space-separated class string. */
    get className() { return this.classes.join(" "); }
    set className(value) { this.classes = value.split(" "); }

    /** @type {Object} Major attributes object `{ class, id, name, type }`. */
    get majorAttrs() {
        return {
            class: this.className,
            id: this.id,
            name: this.name,
            type: this.type,
        };
    }

    /** @type {string} solidId string for this instance. */
    get solidId() { return Doctre.getSolidId(this.tagName, this.className, this.id, this.name, this.type); }


    /** @type {Element} Creates a live DOM element from this Doctre (without default matchReplacer). */
    get live() { return Doctre.createElement(this.tagName, this.majorAttrs, this.childDoctres, this.style, this.attrs, this.datas); }

    /**
     * Creates a live DOM element with the applied matchReplacer.
     * @param {DoctreMatchReplacer} [matchReplacer] - Token replacement map. Uses instance default if omitted.
     * @returns {Element}
     */
    fresh(matchReplacer) { return Doctre.createElement(this.tagName, this.majorAttrs, this.childDoctres, this.style, this.attrs, this.datas, matchReplacer ?? this.matchReplacer ?? {}); }

    /**
     * Serializes this Doctre to a cold array.
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=false]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @param {boolean} [elementAsDoctre=!trimHecp]
     * @returns {Array} Cold array.
     */
    frost(trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        const hecp = [[this.solidId, this.cold(trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre), this.style, this.attrs, this.datas]];
        return trimHecp ? Doctre.trimHecp(hecp) : hecp;
    }

    /** @type {Array} Compact (trimmed) frost — `frost(false, true, false, false)`. */
    get icy() { return this.frost(false, true, false, false); }

    /**
     * Serializes this Doctre to a frost JSON string.
     * @param {boolean|number} [prettyJson=false]
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=true]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @returns {string} Frost JSON string.
     */
    toString(prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        const hecp = this.frost(trimBobbleNode, trimHecp, styleToObject, trimIndent, false);
        if (prettyJson == null || prettyJson === false) return JSON.stringify(hecp);
        return JSON.stringify(hecp, null, typeof prettyJson == "number" ? prettyJson : 2);
    }



    /** @type {DocumentFragment} Restores child cold to a live DocumentFragment. */
    get chill() { return Doctre.createFragment(this.childDoctres); }

    /**
     * Serializes child content to a cold array.
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=false]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @param {boolean} [elementAsDoctre=!trimHecp]
     * @returns {Array}
     */
    cold(trimBobbleNode = false, trimHecp = false, styleToObject = !trimHecp, trimIndent = trimHecp, elementAsDoctre = !trimHecp) {
        return Doctre.coldify(this.childDoctres, trimBobbleNode, trimHecp, styleToObject, trimIndent, elementAsDoctre);
    }

    /**
     * Serializes child content to a frost JSON string.
     * @param {boolean|number} [prettyJson=false]
     * @param {boolean} [trimBobbleNode=false]
     * @param {boolean} [trimHecp=true]
     * @param {boolean} [styleToObject=!trimHecp]
     * @param {boolean} [trimIndent=trimHecp]
     * @returns {string}
     */
    frozen(prettyJson = false, trimBobbleNode = false, trimHecp = true, styleToObject = !trimHecp, trimIndent = trimHecp) {
        return Doctre.stringify(this.childDoctres, prettyJson, trimBobbleNode, trimHecp, styleToObject, trimIndent);
    }
}

/**
 * Node array extending Array. Preserves nodes from DocumentFragment or NodeList as an array.
 * Since a Fragment loses its children when appended to the DOM, use NodeArray to maintain references.
 * @class
 * @extends Array
 */
class NodeArray extends Array {

    /**
     * Copies nodes from a DocumentFragment or NodeList into a NodeArray.
     * @param {DocumentFragment|NodeList} fragmentOrNodeList - Source.
     * @param {NodeArray} [into=new NodeArray()] - Array to store results into.
     * @returns {NodeArray}
     */
    static box(fragmentOrNodeList, into = new NodeArray()) {
        const nodeList = fragmentOrNodeList instanceof DocumentFragment ? fragmentOrNodeList.childNodes : fragmentOrNodeList;
        for (const node of nodeList) into.push(node);
        return into;
    }

}

if (typeof module !== 'undefined') module.exports = Doctre;
