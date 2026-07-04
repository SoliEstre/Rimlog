/*
    EstreUI rimwork — Swipe / Draggable handlers
    Part of the split from estreUi.js (roadmap #002 phase 2).

    This file is loaded as a plain <script> tag and shares the global scope
    with the other estreUi-*.js files. Load order matters: see index.html.
*/

// MODULE: Interaction -- EstreSwipeHandler, EstreDraggableHandler
// ======================================================================

/**
 * Attachable swipe handler
 */
class EstreSwipeHandler {

    // constants
    static mouseTrigger = "mousedown";
    static pointerTrigger = "pointerdown";
    static touchTrigger = "touchstart";

    static mouseUpTriggerSet = ["mouseup"];
    static pointerUpTriggerSet = ["pointercancel", "pointerup"];
    static touchUpTriggerSet = ["touchcancel", "touchend"];

    static mouseHandleSet = ["mouseup", "mousemove"];
    static pointerHandleSet = ["pointercancel", "pointerup", "pointermove"];
    static touchHandleSet = ["touchcancel", "touchend", "touchmove"];

    defaultThreshold = 80;//80px //20;//20px

    // statics
    static handlers = [];
    static register(instance) { return this.handlers.push(instance) - 1; }

    // open property
    stopPropagation = false;
    preventDefault = false;

    preventDown = false;
    preventCancel = false;
    preventUp = false;
    preventMove = false;

    thresholdX = -1;
    thresholdY = -1;

    dropStrayed = false;

    onDown = null;
    onMove = null;
    onCancel = null;
    onUp = null;

    isDebug = false;
    debugDisplay = null;

    cancelDelay = 200;


    // enclosed property
    #handleIndex = null;
    #handleId = null;

    #bound = null;
    #$bound = null;
    #data = null;
    #$responseBound = null;
    #$outerBound = null;

    #triggerEventAllowed = new Set();
    #triggerUpEventAllowed = new Set();
    #handleEventAllowed = new Set();

    #isMoving = false;
    #eventOrigin = null;
    #directed = null;

    #startX = null;
    #startY = null;

    #shiftX = null;
    #shiftY = null;

    #lastX = null;
    #lastY = null;

    #grabX = null;
    #grabY = null;

    #pointerType = null;
    #eventType = null;

    #grabMarker = null;
    

    // getter and setter
    #$wind = $(window);
    get $wind() { return this.#$wind }

    get allowedDirection() { return this.allowedDirectionX ? (this.allowedDirectionY ? "both": "horizontal") : (this.allowedDirectionY ? "vertical" : "neither"); }
    get allowedDirectionX() { return this.thresholdX > -1; }
    get allowedDirectionY() { return this.thresholdY > -1; }
    get directionFix() { return this.directionFixX ? (this.directionFixY ? "both" : "horizontal") : (this.directionFixY ? "vertical" : "neither"); }
    get directionFixX() { return this.thresholdX > 0; }
    get directionFixY() { return this.thresholdY > 0; }
    get directtion() { return this.grabX > this.grabY ? this.directionX : this.directionY; }
    get directionX() { return this.grabX < 0 ? "left" : (this.grabX > 0 ? "right" : null); }
    get directionY() { return this.grabY < 0 ? "up" : (this.grabY > 0 ? "down" : null); }
    get handledDirection() { 
        if (this.isMoving) switch (this.directionFix) {
            case "both":
                if (this.directed != null) {
                    const moveX = this.moveX;
                    const moveY = this.moveY;
                    if (moveX > moveY) {
                        if (this.exceedX && moveX - moveY > this.thresholdX) return this.directionX;
                    } else if (moveX < moveY) {
                        if (this.exceedY && moveY - moveX > this.thresholdY) return this.directionY;
                    }
                }

            case "horizontal":
                if (this.directed == "horizontal" && this.exceedX) return this.directionX;

            case "vertical":
                if (this.directed == "vertical" && this.exceedY) return this.directionY;

            case "neither":
                if (this.allowedDirectionX && this.grabX != null) return this.directionX;
                if (this.allowedDirectionY && this.grabY != null) return this.directionY;
        }
        return null;
    }
    get handled() {
        if (!this.isMoving) return false;
        else {
            switch (this.directionFix) {
                case "both":
                    return this.directed != null && (this.exceedX || this.exceedY);

                case "horizontal":
                    return this.directed == "horizontal" && this.exceedX;

                case "vertical":
                    return this.directed == "vertical" && this.exceedY;

                case "neither":
                    return (this.allowedDirectionX && this.grabX != null) || (this.allowedDirectionY && this.grabY != null);
            }
        }
    }
    get moveX() { return Math.abs(this.lastX - this.startX); }
    get moveY() { return Math.abs(this.lastY - this.startY); }
    get exceedX() { return this.directionFixX && this.moveX > this.thresholdX; }
    get exceedY() { return this.directionFixY && this.moveY > this.thresholdY; }
    get strayedX() { return this.directionFixX && this.moveY > this.thresholdX * 2; }
    get strayedY() { return this.directionFixY && this.moveX > this.thresholdY * 2; }

    get #triggers() { return Array.from(this.#triggerEventAllowed).join(" "); }
    get #upTriggers() { return Array.from(this.#triggerUpEventAllowed).join(" "); }
    get #upDownTriggers() { return [...Array.from(this.#triggerEventAllowed), ...Array.from(this.#triggerUpEventAllowed)].join(" "); }
    get #handles() { return Array.from(this.#handleEventAllowed).join(" "); }
    get #events() { return [...Array.from(this.#triggerEventAllowed), ...Array.from(this.#triggerUpEventAllowed), ...Array.from(this.#handleEventAllowed)].join(" "); }

    get isMoving() { return this.#isMoving; }
    get eventOrigin() { return this.#eventOrigin; }
    get directed() { return this.#directed; }
    get startX() { return this.#startX; }
    get startY() { return this.#startY; }
    get shiftX() { return this.#shiftX; }
    get shiftY() { return this.#shiftY; }
    get lastX() { return this.#lastX; }
    get lastY() { return this.#lastY; }
    get grabX() { return this.#grabX; }
    get grabY() { return this.#grabY; }
    get pointerType() { return this.#pointerType; }
    get eventType() { return this.#eventType; }


    /**
     * Set swipe handler for element
     * 
     * if need stopPropagation or preventDefault to be set each property.
     * and custom event callbacks to be set methods.
     * 
     * @param {Element} element is target element
     * @param {boolean} [onMouse=true] allow mouse handle (must be allowed one in three options)
     * @param {boolean} [onPointer=true] allow pointer handle (must be allowed one in three options)
     * @param {boolean} [onTouch=true] allow touch handle (must be allowed one in three options)
     * @param {number} [thresholdX=this.defaultThreshold] fix direction threshold px - 0 = unuse direction fix, -1 = unallowed horizontal swipe
     * @param {number} [thresholdY=this.defaultThreshold] fix direction threshold px - 0 = unuse direction fix, -1 = unallowed vertical swipe
     * @param {boolean} [debug=false] show event triggers and values when true
     */
    constructor (element, onMouse = true, onPointer = true, onTouch = true, thresholdX = this.defaultThreshold, thresholdY = this.defaultThreshold, debug = false) {
        this.#setHandleId();

        this.isDebug = debug;

        this.setEventMouse(onMouse, false);
        this.setEventPointer(onPointer, false);
        this.setEventTouch(onTouch, false);

        this.setThresholdX(thresholdX);
        this.setThresholdY(thresholdY);

        this.setDropStrayed();

        this.setElement(element);
    }

    #setHandleId() {
        this.#handleIndex = EstreSwipeHandler.register(this);
        this.#handleId = this.constructor.name + "@" + Date.now() + "#" + this.#handleIndex;
    }

    #dropHandle() {
        setTimeout(_ => this.$wind.attr(eds.onSwipe, null), 0);
        //this.#$outerBound.off(this.#upTriggers, null, this.#onClick);
        this.#$bound.off(this.#handles, null, this.#onEvent);
        this.$wind.off(this.#handles, null, this.#onEvent);
        this.#isMoving = false;
        this.#directed = null;
        this.#startX = null;
        this.#startY = null;
        this.#shiftX = null;
        this.#shiftY = null;
        this.#lastX = null;
        this.#lastY = null;
        this.#grabX = null;
        this.#grabY = null;
        this.#pointerType = null;
        this.#eventType = null;
    }

    #clearBound() {
        this.#$responseBound.css("--grab-x", "0px");
        this.#$responseBound.css("--grab-y", "0px");
        this.#$responseBound.attr(eds.onGrab, "");
    }
    
    release() {
        this.#dropHandle();
        this.#clearBound();
        this.#$responseBound = null;
        //this.#$outerBound.off(this.#triggers, null, this.#onClick);
        this.#$outerBound = null;
        const $blockTarget = this.#$bound.find(uis.blockSwipe);
        $blockTarget.off(this.#events, this.#onBlock);
        this.#$bound.css("user-select", "");
        this.#$bound.off("click", null, this.#onClick);
        //this.#$bound.off(this.#handles, null, this.#onHandle);
        this.#$bound = null;
        if (this.#bound.swipeHandler == this) delete this.#bound.swipeHandler;
        this.#bound = null;
        this.#data = null;
        delete EstreSwipeHandler.handlers[this.#handleIndex];
        
        return this;
    }


    setEventMouse(enable = true, byUser = true) {
        if (enable) {
            this.#triggerEventAllowed.add(EstreSwipeHandler.mouseTrigger);
            EstreSwipeHandler.mouseUpTriggerSet.forEach(item => this.#triggerUpEventAllowed.add(item));
            EstreSwipeHandler.mouseHandleSet.forEach(item => this.#handleEventAllowed.add(item));
        } else {
            this.#triggerEventAllowed.delete(EstreSwipeHandler.mouseTrigger);
            EstreSwipeHandler.mouseUpTriggerSet.forEach(item => this.#handleEventAllowed.delete(item));
            EstreSwipeHandler.mouseHandleSet.forEach(item => this.#handleEventAllowed.delete(item));
        }

        if (byUser) this.setElement();

        return this;
    }

    setEventPointer(enable = true, byUser = true) {
        if (enable) {
            this.#triggerEventAllowed.add(EstreSwipeHandler.pointerTrigger);
            EstreSwipeHandler.pointerUpTriggerSet.forEach(item => this.#triggerUpEventAllowed.add(item));
            EstreSwipeHandler.pointerHandleSet.forEach(item => this.#handleEventAllowed.add(item));
        } else {
            this.#triggerEventAllowed.delete(EstreSwipeHandler.pointerTrigger);
            EstreSwipeHandler.pointerUpTriggerSet.forEach(item => this.#triggerUpEventAllowed.delete(item));
            EstreSwipeHandler.pointerHandleSet.forEach(item => this.#handleEventAllowed.delete(item));
        }

        if (byUser) this.setElement();

        return this;
    }

    setEventTouch(enable = true, byUser = true) {
        if (enable) {
            this.#triggerEventAllowed.add(EstreSwipeHandler.touchTrigger);
            EstreSwipeHandler.touchUpTriggerSet.forEach(item => this.#triggerUpEventAllowed.add(item));
            EstreSwipeHandler.touchHandleSet.forEach(item => this.#handleEventAllowed.add(item));
        } else {
            this.#triggerEventAllowed.delete(EstreSwipeHandler.touchTrigger);
            EstreSwipeHandler.touchUpTriggerSet.forEach(item => this.#triggerUpEventAllowed.delete(item));
            EstreSwipeHandler.touchHandleSet.forEach(item => this.#handleEventAllowed.delete(item));
        }

        if (byUser) this.setElement();

        return this;
    }


    setThresholdX(threshold = this.thresholdX) {
        this.thresholdX = threshold;

        return this;
    }

    setThresholdY(threshold = this.thresholdY) {
        this.thresholdY = threshold;

        return this;
    }

    unuseDirectionFixX() {
        this.thresholdX = 0;

        return this;
    }

    unuseDriectionFixY() {
        this.thresholdY = 0;

        return this;
    }

    unuseX() {
        this.thresholdX = -1;

        return this;
    }

    unuseY() {
        this.thresholdY = -1;

        return this;
    }


    setDropStrayed(enable = true) {
        this.dropStrayed = enable;

        return this;
    }


    //custom setters
    setResponseBound(bound = this.#$bound) {
        this.#$responseBound = bound instanceof jQuery ? bound : $(bound);
        return this;
    }

    setOuterBound(bound = this.#$bound.parent()) {
        //if (this.#$outerBound != null) this.#$outerBound.off(this.#triggers, null, this.#onClick);
        this.#$outerBound = bound instanceof jQuery ? bound : $(bound);
        //bound.on(this.#triggers, null, this.#onClick);
        return this;
    }

    setStopPropagation(enable = true) {
        this.stopPropagation = enable;
        return this;
    }

    setPreventDefault(enable = true) {
        this.preventDefault = enable;
        return this;
    }

    setPreventDown(enable = true) {
        this.preventDown = enable;
        return this;
    }

    setPreventCancel(enable = true) {
        this.preventCancel = enable;
        return this;
    }

    setPreventUp(enable = true) {
        this.preventUp = enable;
        return this;
    }

    setPreventMove(enable = true) {
        this.preventMove = enable;
        return this;
    }

    setPreventAll(enable = true) {
        return this.setPreventDown(enable).setPreventUp(enable).setPreventCancel(enable).setPreventMove(enable);
    }

    setDebug(enable = true) {
        this.isDebug = enable;
        return this;
    }

    setDebugDisplay(element = null) {
        this.debugDisplay = element;
        return this;
    }

    setCancelDelay(delay = 200) {
        this.cancelDelay = delay;
        return this;
    }


    setOnDown(callback) {
        this.onDown = callback;

        return this;
    }

    setOnMove(callback) {
        this.onMove = callback;

        return this;
    }

    setOnCancel(callback) {
        this.onCancel = callback;

        return this;
    }

    setOnUp(callback) {
        this.onUp = callback;

        return this;
    }

    //---


    #onEvent = (e) => {
        const isSelf = e.target == e.delegateTarget;
        var isBlocked = false;
        var curElem = e.target;
        if (!isSelf) do {
            const $curElem = $(curElem);
            if ($curElem.is(uis.allowSwipe)) break;
            else if ($curElem.is(uis.blockSwipe)) {
                isBlocked = true;
                break;
            }
            curElem = curElem.parentElement;
        } while (curElem != document.body && curElem != e.delegateTarget);
        if (isBlocked) return;

        const isTouch = e.type.indexOf("touch") > -1;
        const isMouse = e.type.indexOf("mouse") > -1;
        const isPointer = e.type.indexOf("pointer") > -1;
        const screenX = isTouch ? (e.touches.length > 0 ? e.touches[0].screenX : null) : e.screenX;
        const screenY = isTouch ? (e.touches.length > 0 ? e.touches[0].screenY : null) : e.screenY;
        const pointerType = isTouch ? "touch" : (isMouse ? "mouse" : (isPointer ? "pointer" : "extra"));

        var canceled = false;
        switch(e.type) {
            case "pointerdown":
                break;
            case "mousedown":
                if (isMouse && e.button !== 0) break;
            case "touchstart":
                if (this.isMoving) {
                    if (this.preventDown) {
                        if (this.preventDefault) e.preventDefault();
                        if (this.stopPropagation) e.stopPropagation();
                        if (this.preventDefault) return false;
                    }
                }
                this.#eventType = "down";
                this.#isMoving = true;
                this.#eventOrigin = e.target;
                this.#pointerType = pointerType;
                this.#lastX = screenX;
                this.#lastY = screenY;
                if (this.shiftX == null) this.#shiftX = 0;
                if (this.shiftY == null) this.#shiftY = 0;
                
                if (this.startX != null) {
                    this.#shiftX += screenX - this.startX;
                    if (this.grabX != null) this.#grabX = this.shiftX;
                } else this.#startX = screenX;
                if (this.startY != null) {
                    this.#shiftY += screenY - this.startY;
                    if (this.grabY != null) this.grabY = this.shiftY;
                } else this.#startY = screenY;

                if (this.isDebug) {
                    var log = "start: " + f4f(this.startX) + ", " + f4f(this.startY) + " / shift: " + f4f(this.shiftX) + ", " + f4f(this.shiftY) + " / last: " + f4f(this.lastX) + ", " + f4f(this.lastY) + " / grab: " + f4f(grabX) + ", " + f4f(grabY);
                    console.log(e.type + " - " + log);
                    if (this.debugDisplay != null) this.debugDisplay.prepend(e.type + " - " + log + "<br />");
                }

                this.#$responseBound.css("--grab-x", this.shiftX + "px");
                this.#$responseBound.css("--grab-y", this.shiftY + "px");
                if (this.onDown != null) this.onDown(this.startX, this.startY);
                this.$wind.on(this.#handles, null, this.#onEvent);
                this.#$bound.on(this.#handles, null, this.#onEvent);
                //this.#$outerBound.on(this.#upTriggers, null, this.#onClick);
                //$(this.eventOrigin).on("click", null, this.#onClick);
                if (this.preventDown) {
                    if (this.preventDefault) e.preventDefault();
                    if (this.stopPropagation) e.stopPropagation();
                    if (this.preventDefault) return false;
                }
                break;
				
            case "pointercancel":
            case "touchcancel":
                if (!this.isMoving) break;
                if (this.#pointerType != pointerType || this.eventType == "cancel") {
                    if (this.handled) {
                        if (this.preventCancel) {
                            if (this.preventDefault) e.preventDefault();
                            if (this.stopPropagation) e.stopPropagation();
                            if (this.preventDefault) return false;
                        }
                    }
                    break;
                }
                canceled = true;
                this.#eventType = "cancel";
                if (this.isDebug) console.log("canceled");
                if (this.onCancel != null) this.onCancel();
            case "pointerup":
            case "mouseup":
            case "touchend":
                if (!this.isMoving) break;
                if (this.eventType == "up") {
                    if (this.handled) {
                        if (this.preventUp) {
                            if (this.preventDefault) e.preventDefault();
                            if (this.stopPropagation) e.stopPropagation();
                            if (this.preventDefault) return false;
                        }
                    }
                    break;
                }
                if (!canceled) {
                    if (this.#pointerType != pointerType) {
                        if (this.handled) {
                            if (this.preventUp) {
                                if (this.preventDefault) e.preventDefault();
                                if (this.stopPropagation) e.stopPropagation();
                                if (this.preventDefault) return false;
                            }
                        }
                        break;
                    }
                    this.#eventType = "up";
                }
                if (this.isDebug) {
                    var log = "directed: " + this.directed + ", start: " + f4f(this.startX) + ", " + f4f(this.startY) + " / shift: " + f4f(this.shiftX) + ", " + f4f(this.shiftY) + " / last: " + f4f(this.lastX) + ", " + f4f(this.lastY) + " / grab: " + f4f(this.grabX) + ", " + f4f(this.grabY);
                    console.log(e.type + " - " + log);
                    if (this.debugDisplay != null) this.debugDisplay.prepend(e.type + " - " + log + "<br />");
                }
                const clear = () => {
                    const grabX = this.#lastX - this.startX + this.#shiftX;
                    const grabY = this.#lastY - this.startY + this.#shiftY;
                    if (this.isDebug) {
                        var log = "directed: " + this.directed + ", start: " + f4f(this.startX) + ", " + f4f(this.startY) + " / shift: " + f4f(this.shiftX) + ", " + f4f(this.shiftY) + " / last: " + f4f(this.lastX) + ", " + f4f(this.lastY) + " / grab: " + f4f(grabX) + ", " + f4f(grabY);
                        console.log(e.type + " delayed - " + log);
                        if (this.debugDisplay != null) this.debugDisplay.prepend(e.type + " delayed - " + log + "<br />");
                    }
                    const handled = this.handled;
                    var onClearBound = null;
                    if (this.onUp != null) onClearBound = this.onUp(grabX, grabY, handled, canceled, this.directed);
                    this.#dropHandle();
                    if (onClearBound == null) this.#clearBound();
                    else if (onClearBound.delay == null) {
                        this.#clearBound();
                        if (onClearBound.callback != null) onClearBound.callback();
                    } else setTimeout(_ => {
                        this.#clearBound();
                        if (onClearBound.callback != null) onClearBound.callback();
                    }, onClearBound.delay);
                    if (this.isDebug) {
                        console.log("cleared" + (handled ? " with handled" : ""));
                        if (this.debugDisplay != null) this.debugDisplay.prepend("cleared<br/>");
                    }
                    //$(this.eventOrigin).off("click", null, this.#onClick);
                    //if (!handled && this.eventOrigin != null) this.eventOrigin.click();
                    this.#eventOrigin = null;
                    return handled;
                };
                var handled = true;
                if (canceled) setTimeout(_ => { clear(); }, this.cancelDelay);
                else handled = clear();
                if (handled) {
                    if (this.preventUp) {
                        if (this.preventDefault) e.preventDefault();
                        if (this.stopPropagation) e.stopPropagation();
                        //if (!canceled && !handled && this.eventOrigin != null) this.eventOrigin.click();
                        if (this.preventDefault) return false;
                    }
                }
                break;
				
            case "pointermove":
            case "mousemove":
            case "touchmove":
                if (this.#bound != null) {
                    if (this.preventMove && this.stopPropagation) e.stopPropagation();
                    if (this.pointerType != pointerType) {
                        if (this.preventMove && this.preventDefault) {
                            e.preventDefault();
                            return false;
                        }
                        break;
                    }
                    this.#eventType = "move";
                    this.#lastX = screenX;
                    this.#lastY = screenY;
                    const allowedX = this.allowedDirectionX;
                    const allowedY = this.allowedDirectionY;
                    var grabX = 0;
                    var grabY = 0;
                    if (allowedX) grabX = screenX - this.startX + this.shiftX;
                    if (allowedY) grabY = screenY - this.startY + this.shiftY;
                    const moveX = this.moveX;
                    const moveY = this.moveY;
                    const exceedX = moveX > this.thresholdX;
                    const exceedY = moveY > this.thresholdY;
                    const strayedX = moveY > this.thresholdX * 2;
                    const strayedY = moveX > this.thresholdY * 2;
                    var handled = false;
                    var applyX = false;
                    var applyY = false;
                    var fixX = false;
                    var fixY = false;
                    var dropped = false;
                    switch (this.directionFix) {
                        case "both":
                            if (this.directed != null) {
                                handled = true;
                                switch (this.directed) {
                                    case "horizontal":
                                        applyX = true;
                                        break;

                                    case "vertical":
                                        applyY = true;
                                        break;
                                }
                            } else if (exceedX || exceedY) {
                                handled = true;
                                if (exceedX) {
                                    applyX = true;
                                    fixX = true;
                                } else if (exceedY) {
                                    applyY = true;
                                    fixY = true;
                                }
                            }
                            break;

                        case "horizontal":
                            if (this.directed == "horizontal") {
                                handled = true;
                                applyX = true;
                            } else if (this.dropStrayed && strayedX) {
                                dropped = true;
                            } else if (exceedX) {
                                handled = true;
                                applyX = true;
                                fixX = true;
                            }
                            break;

                        case "vertical":
                            if (this.directed == "vertical") {
                                handled = true;
                                applyY = true;
                            } else if (this.dropStrayed && strayedY) {
                                dropped = true;
                            } else if (exceedY) {
                                handled = true;
                                applyY = true;
                                fixY = true;
                            }
                            break;

                        case "neither":
                            if (allowedX || allowedY) {
                                handled = true;
                                if (allowedX) applyX = true;
                                if (allowedY) applyY = true;
                            } else if (!allowedX && !allowedY) {
                                dropped = true;
                            }
                            break;
                    }

                    const onSwipe = handled ? t1 : "";
                    if (this.$wind.attr(eds.onSwipe) != onSwipe) this.$wind.attr(eds.onSwipe, onSwipe);
                    if (handled) {
                        if (applyX) {
                            this.#grabX = grabX;
                            this.#$responseBound.css("--grab-x", grabX + "px");
                        }
                        if (applyY) {
                            this.#grabY = grabY;
                            this.#$responseBound.css("--grab-y", grabY + "px");
                        }
                        if (fixX) this.#directed = "horizontal";
                        if (fixY) this.#directed = "vertical";
                    }
                    if (this.isDebug) {
                        var log = "directed: " + this.directed + ", start: " + f4f(this.startX) + ", " + f4f(this.startY) + " / shift: " + f4f(this.shiftX) + ", " + f4f(this.shiftY) + " / last: " + f4f(this.lastX) + ", " + f4f(this.lastY) + " / grab: " + f4f(grabX) + ", " + f4f(grabY);
                        console.log(e.type + " - " + log);
                        if (this.debugDisplay != null) this.debugDisplay.prepend(e.type + " - " + log + "<br />");
                    }
                    if (this.onMove != null) this.onMove(grabX, grabY, handled, dropped, this.directed);
                    if (dropped) {
                        if (this.isDebug) console.log("dropped");
                        this.#dropHandle();
                        this.#clearBound();
                        //$(this.eventOrigin).off("click", null, this.#onClick);
                        //if (!handled && this.eventOrigin != null) this.eventOrigin.click();
                        this.#eventOrigin = null;
                    } else if (handled) {
                        if (this.isDebug) console.log("handled");
                        if (this.#grabMarker == null) this.#grabMarker = setTimeout(_ => {
                            if (this.handled && this.#$responseBound.attr(eds.onGrab) != t1) {
                                this.#$responseBound.attr(eds.onGrab, t1);
                            }
                            this.#grabMarker = null;
                        }, 0);
                        if (this.preventMove) {
                            if (this.preventDefault) e.preventDefault();
                            if (this.stopPropagation) e.stopPropagation();
                            if (this.preventDefault) return false;
                        }
                    } else {
                        if (this.isDebug) console.log("ignored");
                        this.#clearBound();
                    }
				}
                break;
				
		}
    }

    #onHandle = (e) => {
        if (this.handled) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    #onClick = (e) => {
        //e.preventDefault();
        e.stopPropagation();
        //return false;
    }

    #onBlock = (e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    setElement(element = this.element) {
        const $responseBound = this.#$responseBound;
        const $outerBound = this.#$outerBound;
        if (this.#bound != null) this.release();
        if (element instanceof jQuery) {
            this.#$bound = element;
            this.#bound = element[0];
        } else {
            this.#bound = element;
            this.#$bound = $(element);
        }
        this.#data = this.#bound.dataset;
        this.#bound.swipeHandler = this;

        this.#$bound.on(this.#triggers, null, this.#onEvent);
        //this.#$bound.on(this.#handles, null, this.#onHandle);
        this.#$bound.on("click", null, this.#onClick);
        this.#$bound.css("user-select", "none");

        this.#$responseBound = $responseBound != null ? $responseBound : this.#$bound;
        if ($outerBound != null) this.setOuterBound($outerBound);

        const $blockTarget = this.#$bound.find(uis.blockSwipe);
        $blockTarget.on(this.#events, this.#onBlock);

        return this;
    }

}



class EstreDraggableHandler {

    // enclosed property
    #isEnabledTouch = f;

    // open property
    $bound;
    bound;

    draggableAxis = "vertical"; // "both", "horizontal", "vertical"
    // currently supports only vertical

    useTouchSupport = n; // null is auto


    // getter and setter
    get isTouchSupported() { return "ontouchstart" in window ||
        navigator.maxTouchPoints > 0 ||
        navigator.msMaxTouchPoints > 0 ||
        window.DocumentTouch && document instanceof DocumentTouch; }


    // instant methods
    startTouch = _ => {};
    getDragDistance = _ => {};
    shouldMoveDraggingItem = _ => {};
    performDragMove = _ => {};
    startDragging = _ => {};
    endDragging = _ => {};
    clearGhost = _ => {};


    constructor($bound, axis = "vertical", useTouchSupport = n) {
        this.useTouchSupport = useTouchSupport;
        if (useTouchSupport || (useTouchSupport == n && this.isTouchSupported && !isAndroid)) this.#isEnabledTouch = t;
        this.draggableAxis = axis;
        this.$bound = $bound;
        this.bound = $bound[0];
        for (const bound of $bound) bound.draggableHandler = this;
        this.init();
    }

    release() {
        $(document).off('touchstart.dragHandler');
        this.endDragging();
        for (const bound of this.$bound) delete bound.draggableHandler;

        if (this.$blockingBound != null && this.eventBlocker != null) {
            this.$blockingBound.off("click touchstart touchmove touchend touchcancel", this.eventBlocker);
            this.$blockingBound = null;
            this.eventBlocker = null;
        }
    }

    init() {
        const handler = this;

        const $draggables = this.$bound.find(aiv("draggable", "true"));
        const $containers = this.$bound.find(aiv("droppable", "true"));

        let $topScrollerPad = this.$bound.find(aiv("scroller-pad", "top"));
        let $bottomScrollerPad = this.$bound.find(aiv("scroller-pad", "bottom"));
        if (this.draggableAxis == "both" || this.draggableAxis == "vertical") {
            if ($topScrollerPad.length < 1) {
                const topPad = doc.ce(div, n, n, n, { "scroller-pad": "top" });
                this.$bound.append(topPad);
                $topScrollerPad = this.$bound.find(aiv("scroller-pad", "top"));
            }
            if ($bottomScrollerPad.length < 1) {
                const bottomPad = doc.ce(div, n, n, n, { "scroller-pad": "bottom" });
                this.$bound.append(bottomPad);
                $bottomScrollerPad = this.$bound.find(aiv("scroller-pad", "bottom"));
            }
        }

        // Remove existing events
        $draggables.off("dragstart dragend touchstart touchmove touchend touchcancel");
        $containers.off("dragover dragleave drop touchmove touchend touchcancel");
        $topScrollerPad.off("dragover dragleave drop touchmove touchend touchcancel");
        $bottomScrollerPad.off("dragover dragleave drop touchmove touchend touchcancel");
        
        const scrollDistance = 10;
        const scrollTerminal = 16; // ~60fps
        let topScrollInterval = n;
        let bottomScrollInterval = n;

        let draggingItem = n;
        let isDragging = false;
        let touchData = { 
            startX: 0, 
            startY: 0, 
            currentX: 0, 
            currentY: 0,
            startTime: 0,
            moved: false,
            dragThreshold: 10 // Drag start threshold in pixels
        };
        let ghostElement = null;
        let dragStartTimeout = null;
        let lastDragPosition = { container: null, afterElement: null, timestamp: 0 };
        let dragMoveThrottle = null;

        // Helper function for touch start
        this.startTouch = (element, touch) => {
            touchData.startX = touch.clientX;
            touchData.startY = touch.clientY;
            touchData.currentX = touch.clientX;
            touchData.currentY = touch.clientY;
            touchData.startTime = Date.now();
            touchData.moved = false;
            draggingItem = element;
            this.clearGhost();
        };

        // Calculate drag distance
        this.getDragDistance = () => {
            const deltaX = touchData.currentX - touchData.startX;
            const deltaY = touchData.currentY - touchData.startY;
            return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        };

        // Check if element position needs to be changed
        this.shouldMoveDraggingItem = (targetContainer, afterElement) => {
            const currentParent = draggingItem.parentNode;
            const currentNext = draggingItem.nextSibling;
            
            // Different container - always move
            if (currentParent !== targetContainer) {
                return true;
            }
            
            // Same container - check if position actually changes
            if (afterElement === null) {
                // Moving to end - only move if not already at end
                return currentNext !== null;
            } else {
                // Moving before specific element - only move if not already before it
                return currentNext !== afterElement;
            }
        };

        // Perform DOM move with throttling to prevent excessive operations
        this.performDragMove = (targetContainer, afterElement) => {
            const now = Date.now();
            
            // Check if this is the same position as last move (within 50ms)
            if (lastDragPosition.container === targetContainer && 
                lastDragPosition.afterElement === afterElement && 
                (now - lastDragPosition.timestamp) < 50) {
                return;
            }
            
            // Check if actual move is needed
            if (!this.shouldMoveDraggingItem(targetContainer, afterElement)) {
                return;
            }
            
            // Clear any pending throttled move
            if (dragMoveThrottle) {
                clearTimeout(dragMoveThrottle);
                dragMoveThrottle = null;
            }
            
            // Throttle the move operation
            dragMoveThrottle = setTimeout(() => {
                if (draggingItem && targetContainer) {
                    try {
                        if (afterElement === null) {
                            targetContainer.appendChild(draggingItem);
                        } else {
                            targetContainer.insertBefore(draggingItem, afterElement);
                        }
                        
                        // Update last position
                        lastDragPosition = {
                            container: targetContainer,
                            afterElement: afterElement,
                            timestamp: Date.now()
                        };
                    } catch (error) {
                        console.warn('Drag move operation failed:', error);
                    }
                }
                dragMoveThrottle = null;
            }, 16); // ~60fps throttling
        };

        // Handle drag start
        this.startDragging = (element) => {
            if (isDragging) return;
            
            isDragging = true;
            this.$bound.attr("data-dragging", t1);
            element.dataset.dragging = t1;
            
            // Create ghost element for visual feedback
            ghostElement = element.cloneNode(true);
            ghostElement.classList.add('ghost-element');
            ghostElement.style.cssText = `
                position: fixed !important;
                z-index: 9999 !important;
                left: ${touchData.currentX - 200}px !important;
                top: ${touchData.currentY - 25}px !important;
                border-radius: 8px !important;
                box-shadow: 0 8px 16px var(--color-boundary-o20) !important;
                opacity: 0.8 !important;
                pointer-events: none !important;
                transform: rotate(5deg) scale(1.05) !important;
                transition-duration: 0s;
            `;
            document.body.appendChild(ghostElement);
        };

        // Handle drag end
        this.endDragging = () => {
            // Clear drag timeout
            if (dragStartTimeout) {
                clearTimeout(dragStartTimeout);
                dragStartTimeout = null;
            }
            
            // Clear drag move timeout
            if (dragMoveThrottle) {
                clearTimeout(dragMoveThrottle);
                dragMoveThrottle = null;
            }
            
            // Clear scroll intervals
            if (topScrollInterval != n) {
                clearInterval(topScrollInterval);
                topScrollInterval = n;
            }
            if (bottomScrollInterval != n) {
                clearInterval(bottomScrollInterval);
                bottomScrollInterval = n;
            }
            
            // Remove ghost element
            this.clearGhost();
            
            // Remove all highlights
            setTimeout(_ => {
                $containers.removeAttr("data-highlight");
            }, 200);
            
            if (!isDragging) return;
            
            isDragging = false;
            this.$bound.removeAttr("data-dragging");
            
            // Remove drag state
            if (draggingItem) {
                draggingItem.dataset.dragging = n;
                draggingItem = n;
            }
            
            // Reset position tracking
            lastDragPosition = { container: null, afterElement: null, timestamp: 0 };
        };

        this.clearGhost = () => {
            if (ghostElement && ghostElement.parentNode) {
                ghostElement.parentNode.removeChild(ghostElement);
                ghostElement = null;
            }
            $(doc.b).find(c.c + cls + "ghost-element").remove();
        };

        // Touch start event
        if (this.#isEnabledTouch) $draggables.on({
            "touchstart": function (e) {
                const touch = e.originalEvent.touches[0];
                handler.startTouch(this, touch);
                
                // Set delayed timeout for drag start
                dragStartTimeout = setTimeout(() => {
                    if (draggingItem === this && !isDragging && !touchData.moved) {
                        handler.startDragging(this);
                    }
                }, 150); // Start drag mode after 150ms hold
            },

            // Touch move event
            "touchmove": function (e) {
                const touch = e.originalEvent.touches[0];
                touchData.currentX = touch.clientX;
                touchData.currentY = touch.clientY;
                
                // Detect movement
                if (!touchData.moved) {
                    const distance = handler.getDragDistance();
                    if (distance > touchData.dragThreshold) {
                        if (isDragging) {
                            touchData.moved = true;
                        } else {
                            handler.endDragging();
                        }
                    }
                }
                
                // Do not process if not dragging
                if (!isDragging) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                // Update ghost element position
                if (ghostElement) {
                    ghostElement.style.left = (touchData.currentX - 200) + 'px';
                    ghostElement.style.top = (touchData.currentY - 25) + 'px';
                }
                
                // Find drop target from touch position
                const elementBelow = document.elementFromPoint(touchData.currentX, touchData.currentY);
                const container = elementBelow?.closest(aiv("droppable", "true"));
                const topScrollPad = elementBelow?.closest(aiv("scroller-pad", "top"));
                const bottomScrollPad = elementBelow?.closest(aiv("scroller-pad", "bottom"));
                
                // Handle auto-scrolling for touch drag
                if (topScrollPad) {
                    if (topScrollInterval == n) {
                        topScrollInterval = setInterval(() => {
                            handler.bound.scrollTop = handler.bound.scrollTop - scrollDistance;
                        }, scrollTerminal);
                    }
                } else if (bottomScrollPad) {
                    if (bottomScrollInterval == n) {
                        bottomScrollInterval = setInterval(() => {
                            handler.bound.scrollTop = handler.bound.scrollTop + scrollDistance;
                        }, scrollTerminal);
                    }
                } else {
                    // Stop scrolling when not on scroll pads
                    if (topScrollInterval != n) {
                        clearInterval(topScrollInterval);
                        topScrollInterval = n;
                    }
                    if (bottomScrollInterval != n) {
                        clearInterval(bottomScrollInterval);
                        bottomScrollInterval = n;
                    }
                }
                
                if (container) {
                    // Remove highlights from all containers
                    $containers.removeAttr("data-highlight");
                    
                    // Apply highlight to current container
                    container.dataset.highlight = t1;
                    
                    // Use improved drag move logic
                    const afterElement = handler.getDragAfterElement(container, touchData.currentY);
                    handler.performDragMove(container, afterElement);
                } else {
                    // Remove highlight when outside containers
                    $containers.removeAttr("data-highlight");
                }
            },

            // Touch end event
            "touchend": function (e) {
                // Clear scroll intervals on touch end
                if (topScrollInterval != n) {
                    clearInterval(topScrollInterval);
                    topScrollInterval = n;
                }
                if (bottomScrollInterval != n) {
                    clearInterval(bottomScrollInterval);
                    bottomScrollInterval = n;
                }
                
                // Treat as click if touch is short and movement is minimal
                const touchDuration = Date.now() - touchData.startTime;
                const dragDistance = handler.getDragDistance();
                
                if (!isDragging && touchDuration < 200 && dragDistance < touchData.dragThreshold) {
                    // Handle as regular click - allow default behavior
                    handler.endDragging();
                    return;
                }
                
                e.preventDefault();
                e.stopPropagation();
                
                handler.endDragging();
            },

            // Touch cancel event
            "touchcancel": function (e) {
                // Clear scroll intervals on touch cancel
                if (topScrollInterval != n) {
                    clearInterval(topScrollInterval);
                    topScrollInterval = n;
                }
                if (bottomScrollInterval != n) {
                    clearInterval(bottomScrollInterval);
                    bottomScrollInterval = n;
                }
                
                handler.endDragging();
            },
        });

         // Desktop drag events
        $draggables.on({
            "dragstart": function (e) {
                draggingItem = this;
                isDragging = true;
                handler.$bound.attr("data-dragging", t1);
                postQueue(_ => { this.dataset.dragging = t1; });
                const event = e.originalEvent;
                event.dataTransfer.effectAllowed = "move";
                event.dataTransfer.setDragImage(this, e.offsetX, e.offsetY);
            },

            "dragend": function (e) {
                draggingItem = n;
                isDragging = false;
                handler.$bound.removeAttr("data-dragging");
                this.dataset.dragging = n;
                $containers.removeAttr("data-highlight");
            },
        });

       // Desktop container events
        $containers.on({
            "dragover": function (e) {
                e.preventDefault();

                $containers.removeAttr("data-highlight");
                this.dataset.highlight = t1;
                const event = e.originalEvent;
                event.dataTransfer.dropEffect = "move";
                
                // Use improved drag move logic
                const afterElement = handler.getDragAfterElement(this, e.clientY);
                if (handler.#isEnabledTouch) handler.performDragMove(this, afterElement);
                else if (afterElement === null) this.appendChild(draggingItem);
                else this.insertBefore(draggingItem, afterElement);

                return false;
            },

            "dragleave": function (e) {
                // Prevent dragleave from being triggered incorrectly by child elements
                const rect = this.getBoundingClientRect();
                const isOutside = e.clientX < rect.left || e.clientX > rect.right || 
                                e.clientY < rect.top || e.clientY > rect.bottom;
                
                if (isOutside) {
                    delete this.dataset.highlight;
                }
            },

            "drop": function (e) {
                e.preventDefault();
                
                delete this.dataset.highlight;

                return false;
            },
        });


        $topScrollerPad.on({
            "dragover": function (e) {
                e.preventDefault();

                if (topScrollInterval == n) {
                    topScrollInterval = setInterval(() => {
                        handler.bound.scrollTop = handler.bound.scrollTop - scrollDistance;
                    }, scrollTerminal);
                }

                return false;
            },

            "dragleave": function (e) {
                if (topScrollInterval != n) {
                    clearInterval(topScrollInterval);
                    topScrollInterval = n;
                }
            },

            "drop": function (e) {
                e.preventDefault();

                if (topScrollInterval != n) {
                    clearInterval(topScrollInterval);
                    topScrollInterval = n;
                }

                return false;
            },
        });
        $bottomScrollerPad.on({
            "dragover": function (e) {
                e.preventDefault();

                if (bottomScrollInterval == n) {
                    bottomScrollInterval = setInterval(() => {
                        handler.bound.scrollTop = handler.bound.scrollTop + scrollDistance;
                    }, scrollTerminal);
                }

                return false;
            },

            "dragleave": function (e) {
                if (bottomScrollInterval != n) {
                    clearInterval(bottomScrollInterval);
                    bottomScrollInterval = n;
                }
            },

            "drop": function (e) {
                e.preventDefault();

                if (bottomScrollInterval != n) {
                    clearInterval(bottomScrollInterval);
                    bottomScrollInterval = n;
                }

                return false;
            },
        });

        // Global touch event to handle drag end during scroll
        $(document).on('touchstart.dragHandler', function(e) {
            if (isDragging && !$(e.target).closest(aiv("draggable", "true")).length) {
                handler.endDragging();
            }
        });
    }

    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(li + aiv("draggable", "true") + naiv("data-dragging", t1))];
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) return { offset: offset, element: child };
            else return closest;
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    blockEventLeaks($closestBound = this.$bound) {
        if (this.$blockingBound != null && this.eventBlocker != null) {
            this.$blockingBound.off("click touchstart touchmove touchend touchcancel", this.eventBlocker);
        }

        this.eventBlocker = function (e) {
            // e.preventDefault();
            e.stopPropagation();

            // return false;
        }

        this.$blockingBound = $closestBound;

        $closestBound.on("click touchstart touchmove touchend touchcancel", this.eventBlocker);

        return this;
    }
}


// ======================================================================