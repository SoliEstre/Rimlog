// custom handles

// Custom handle implamentation

// Register my own handle




// Customize lifecycle actions for handles(component/container/article) on own pages
class AppPagesProvider {

    // Register my own external PID (page alias)
    static get pages() { return {
        //if writed html in sections in mains(#staticDoc and #instantDoc), can you show PIDs by command "pageManager.pages" on JS console

        //"own shorter id": "PID",

        "home": "&m=home",

    }; }


    // properties
    #pageManager = null;
    get pageManager() { return this.#pageManager; }


    constructor(pageManager) {
        this.#pageManager = pageManager;
    }

    
    //declare handler of pages

    //"own shorter id" = page handler implementation class from extends EstrePageHandler or empty class(function type constructor)
    "home" = class extends EstrePageHandler {};

}


// Implement example of my own custom page handler
class AppPageManager extends EstreUiCustomPageManager {

    // class property


    // static methods


    // constants
    

    // instance property

    constructor() {
        super();
    }


    /**
     * * must be initialized estreUi before call 
     */
    init(extPidMap, pageHandlers) {

        return super.init(extPidMap, pageHandlers);
    }

}

// Implement example of my own custom action handler
class AppActionManager {

    // class property


    // static methods


    // constants


    // instance property
    #serviceWorkerHandler = null;
    get swHandler() { return this.#serviceWorkerHandler; }
    #swUpdateChecker = null;
    #swUpdateBeforeAsk = t; // PWA update method selection (true: method 1, false: method 2)

    #pageManager = null;
    get pageManager() { return this.#pageManager; }

    get isApp() { return window.app != n && window.app.request != n; }

    constructor() {
        this.#pageManager = pageManager;
    }

    init(serviceWorkerHandler) {
        this.#serviceWorkerHandler = serviceWorkerHandler;

        this.initServiceWorker();
    }

    initServiceWorker() {
        const swHandler = this.swHandler;

        const waiting = swHandler.waiting;
        if (waiting != n) this.onWaitingNewServiceWorker(waiting);

        swHandler.setOnInstallingListener(worker => this.onInstallingNewServiceWorker(worker));
        swHandler.setOnWaitingListener(worker => this.onWaitingNewServiceWorker(worker));
        swHandler.setOnActivatedNewerListener(worker => this.onActivatedNewServiceWorker(worker));
        swHandler.setOnControllerChangeListener(event => this.onControllerChangedToNewServiceWorker(event));
    }

    async onReadyEstreUi() {
        const swHandler = this.swHandler;
        const installing = swHandler.installing;
        const waiting = swHandler.waiting;
        const activated = swHandler.activated;

        // Force press service worker stuck in still installing
        if (installing != n && installing.state == "installing") {
            navigator.serviceWorker.ready.then(reg => {
                const worker = reg?.active;
                if (window.isDebug) console.log("Force activate installing service worker: ", worker);
                else if (window.isLog) console.log("Force activate installing service worker: " + worker.scriptURL);
            });
        }

        // Force activate waiting service worker
        if (waiting != n && waiting != swHandler.controller) {
            const controller = swHandler.controller;
            let handled = f;
            if (controller != n) { // not the first install
                handled = t;
                await swHandler.clearCache(controller);
                waiting.addEventListener("statechange", e => {
                    if (waiting.state == "activated") {
                        if (window.isDebug) console.log("Apply activated service worker by reload: ", waiting);
                        else if (window.isLog) console.log("Apply activated service worker by reload: " + waiting.scriptURL);
                        location.reload();
                    }
                });
            }
            swHandler.skipWaiting(waiting);
            return handled;
        }

        // Force apply activated but not controlling service worker
        if (activated != n && activated != swHandler.controller) {
            const handled = await postPromise(resolve => {
                setTimeout(async _ => {
                    if (activated != swHandler.controller) {
                        if (swHandler.controller != n && (await swHandler.getApplicationCount()) < 2) {
                            window.location.reload();
                            resolve(t);
                            return;
                        }
                        this.onWaitingAnotherClientToClose(activated);
                        resolve(f);
                    } else resolve(f);
                }, 1000); // wait for a while to check apply to main controller
            });
            if (handled) return t;
        }

        if (swHandler.controller != n) this.setServiceWorkerControllerEvents();
    }

    async onInstallingNewServiceWorker(worker) {
        const swHandler = this.swHandler;

        if (this.#swUpdateBeforeAsk) {
            // vv Method 1: Install new service worker immediately and prompt user to restart app when activated new service worker
            if (!swHandler.isInitialSetup) {
                // this.controller?.let(it => this.clearCache(it));
                note("Now installing new version of app...");
            }
        }
    }

    async onWaitingNewServiceWorker(worker) {
        const swHandler = this.swHandler;

        if (this.#swUpdateBeforeAsk) {
            // vv Method 1: Install new service worker immediately and prompt user to restart app when activated new service worker
            if (!swHandler.isInitialSetup) {
                swHandler.skipWaiting(worker);
            }
        } else {
            // vv Method 2: Wait activate until user accepts to install new service worker and apply immediately when activated new service worker
            const isNewNative = await this.checkPostNewNativeAppVersion(worker);
            if (!isNewNative && !swHandler.isInitialSetup) estreToastConfirm({
                title: "New version of app is available",
                message: "A new version of the app is available<br />Would you like to update to the new version now?<br /><span class=\"font_sr12\">* The new version will be automatically applied when the app is restarted after closing<br />** Some functions may not work properly if the new version is not applied</span>",
                positive: "Update now",
                negative: "Later",
                callbackPositive: async _ => {
                    await swHandler.controller?.let(it => this.clearCache(it));
                    swHandler.skipWaiting(worker);
                },
            });
        }
    }

    async onActivatedNewServiceWorker(worker) {
        const swHandler = this.swHandler;

        if (this.#swUpdateBeforeAsk) {
            // vv Method 1: Install new service worker immediately and prompt user to restart app when activated new service worker
            const isNewNative = await this.checkPostNewNativeAppVersion(worker);
            if (!isNewNative && !swHandler.isInitialSetup) estreToastConfirm({
                title: "Request to restart app",
                message: "A new version of the app is ready<br />To apply it, the app needs to be restarted<br />Would you like to restart now?<br /><span class=\"font_sr12\">* The new version will be automatically applied when the app is restarted after closing<br />** Some functions may not work properly if the new version is not applied<br />When new version is installed to be reloaded every app window</span>",
                positive: "Apply now",
                negative: "Later",
                callbackPositive: _ => {
                    swHandler.clientsClaim(worker);
                    location.reload();
                },
            });
        } else {
            // vv Method 2: Wait activate until user accepts to install new service worker and apply immediately when activated new service worker
            if (!swHandler.isInitialSetup) {
                swHandler.clientsClaim(worker);
                location.reload();
            }
        }
    }

    onWaitingAnotherClientToClose(worker) {
        estreToastAlert({
            title: "Wait for other window save work",
            message: "New version of app is loaded<br />If you close this popup, to be reloaded a old version app windows<br />Please save your work and press OK to be applied new version of app in all windows",
            positive: "OK",
            callbackDissmiss: _ => {
                this.swHandler.clientsClaim(worker);
                setTimeout(_ => {
                    if (worker != this.swHandler.controller) location.reload();
                    else note("The new version of app is applied");
                }, 1000);
            },
        });
    }

    async onControllerChangedToNewServiceWorker(event) {
        const swHandler = this.swHandler;
        const version = await swHandler.getVersion();
        if (window.isLogging) console.log("New service worker controller is ready: v" + version);
        this.setServiceWorkerControllerEvents();
    }

    setServiceWorkerControllerEvents() {
        const swHandler = this.swHandler;
        const controller = swHandler.controller;
        controller.addEventListener("statechange", e => {
            if (controller.state == "redundant") {
                if (window.isDebug) console.log("Current service worker became redundant: ", controller);
                else if (window.isLog) console.log("Current service worker became redundant: " + controller.scriptURL);
                const reloadMessage = "To be reloaded the app to apply new service worker";
                if (swHandler.controller != n && swHandler.controller != controller) {
                    if (window.isLogging) console.log(reloadMessage);
                    location.reload();
                } else swHandler.service.addEventListener("controllerchange", e => {
                    if (window.isDebug) console.log("New service worker is controlling the app: ", swHandler.controller);
                    else if (window.isLog) console.log("New service worker is controlling the app: " + swHandler.controller.scriptURL);
                    if (window.isLogging) console.log(reloadMessage);
                    location.reload();
                });
            }
        });

        this.#swUpdateChecker = setInterval(async _ => {
            await swHandler.update();
        }, 60 * 60 * 1000);
        // ^^ Customize interval time for check update of service worker
    }

    async checkPostNewNativeAppVersion(worker = this.swHandler.worker, userConfirmCallback = async isPositive => {}) {
        if (!this.isApp) return u;
        const swHandler = this.swHandler;
        const version = await swHandler.getVersion(worker);
        const [native, web] = version.split(hp);
        const [android, ios] = native.includes(ss) ? native.split(ss) : [native, native];
        const currentNative = this.sessionManager.appVersion;
        
        if (window.isLogging) console.log("Check service Worker version: " + version + "\n - Android: " + android + "\n - iOS: " + ios + "\n - web: ", web);
        
        let isNewNative = f;
        const [major, minor, patch] = currentNative.split(".").map(it => it[0] == t0 ? 0 : parseInt(it));
        const [newMajor, newMinor, newPatch] = (isAndroid ? android : ios).split(".").map(it => parseInt(it));
    
        if (newMajor > major) isNewNative = t;
        else if (newMajor == major && newMinor > minor) isNewNative = t;
        else if (newMajor == major && newMinor == minor && newPatch > patch) isNewNative = t;

        if (isNewNative) {
            const isAccepted = await postPromise(resolve => {
                const title = "Notice of important update";
                const messagePreset = "A new version of the app is available in |storeName|<br />Please proceed with the update<br /><span class=\"font_sr12\">* Some functions may not work properly if the app is not updated to the latest version</span>";
                const storeName = isAndroid ? "Play Store" : "App Store";
                const message = messagePreset.replace("|storeName|", storeName);
                const positive = "Go to Store";
                const negative = "Later";
                let isPositive = u;
                estreToastConfirm({
                    title, message, positive, negative,
                    callbackPositive: async _ => {
                        isPositive = t;
                        if (worker != swHandler.controller && !this.#swUpdateBeforeAsk) {
                            await swHandler.controller?.let(it => this.clearCache(it));
                            swHandler.skipWaiting(worker);
                        }
                        window.app.request("openStoreForUpdate");
                        resolve(t);
                    },
                    callbackNegative: _ => {
                        isPositive = f;
                    },
                    callbackDissmiss: _ => {
                        if (!isPositive) {
                            if (tu(isPositive)) isPositive = n;
                            resolve(isPositive);
                        }
                    },
                });
            });
            await userConfirmCallback?.(isAccepted);
        }

        return isNewNative;
    }

    async checkUpdate() {
        const worker = await (this.swHandler ?? serviceWorkerHandler).update();
        if (worker) return worker;
        else if (worker == n) note("Application is not ready for service");
        else if (!(await this.checkPostNewNativeAppVersion())) note("The current app is up to date");
    }

    async clearCache() {
        if (this.isApp) await window.app.request("clearCache");
        if (this.swHandler.controller != n) await (this.swHandler ?? serviceWorkerHandler).clearCache();
    }

    async forceReload() {
        wait();
        await this.clearCache();
        location.reload();
    }

    async checkUpdateAndForceReload() {
        wait();
        await this.clearCache();
        await postPromise(async resolve => {
            const swHandler = this.swHandler ?? serviceWorkerHandler;
            try {
                const worker = await swHandler.update();
                if (worker) {
                    if (window.isLogging) console.log("New service worker state: " + worker.state);
                    if (worker.state == "activated") resolve(worker);
                    else if (worker.state == "redundant") resolve();
                    else {
                        if (!this.#swUpdateBeforeAsk) swHandler.skipWaiting(worker);
                        worker.addEventListener("statechange", e => {
                            if (window.isLogging) console.log("New service worker changed state: " + worker.state);
                            if (worker.state == "activated") {
                                swHandler.clientsClaim(worker);
                                resolve(worker);
                            } else if (worker.state == "redundant") resolve();
                        });
                    }
                }
                else resolve(worker);
            } catch (exc) {
                console.error(exc);
                resolve();
            }
        });
        location.reload();
    }
}


// setup instances
const appPageManager = new AppPageManager();

const appActionManager = new AppActionManager(appPageManager);


// custom handle callbacks


// Own application and EstreUI initializing
$(document).ready((e) => setTimeout(_ => {

    //<= to do implement my own initializing



    //something do while intializes on splash page
    appPageManager.init(AppPagesProvider.pages, new AppPagesProvider(appPageManager));
    //initialize scheduleDateSet with own data handler
    // scheduleDataSet.init(appDataHandler);
    //initialize Estre UI after checked user session
    estreUi.init(false);

    appActionManager.init(serviceWorkerHandler);

    appActionManager.onReadyEstreUi().then(handled => {
        if (!handled) {
            appPageManager.bringPage("home");

            postQueue(_ => estreUi.checkOnReady());
        }
    });
}, 1));
