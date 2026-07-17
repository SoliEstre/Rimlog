const INSTALLATION_VERSION_NAME = "1.5.1-rimlog-v4-server";
// ^^ Use for check new update "Native application(webview) version(or Android/iOS version combo) - PWA release version"
// ex) "1.0.1/1.0.0-r20251101k"

const INSTALLATION_FILE_LIST = [
    "./serviceWorker.js",
    "./fixedTop.html",
    "./fixedBottom.html",
    "./mainMenu.html",
    "./staticDoc.html",
    "./instantDoc.html",
    "./managedOverlay.html",
    "./overwatchPanel.html",
    "./customHandlePrototypes.html",


    "./styles/main.css",


    "./scripts/main.js",
    "./eux/dist/estreui/rimlog-app.js",
    "./eux/dist/estreuv/ai-insight-card.js",
];


// Common files cache - Be changes some time but, well not changed very often
const CACHE_NAME_COMMON_FILES = "common-files-cache-v1-20260717";

const COMMON_FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./serviceLoader.html",
    "./stockHandlePrototypes.html",
    "./webmanifest.json",


    "./styles/estreUiInitialize.css",
    "./styles/estreUiEmoji.css",
    "./styles/estreUiRoot.css",
    "./styles/estreUiCore.css",
    "./styles/estreUiCore2.css",
    "./styles/estreUiAliases.css",
    "./styles/estreUi.css",
    "./styles/estreUiHandles.css",
    "./styles/estreUiHandleUnical.css",


    "./scripts/lib/jcodd.js",
    "./scripts/lib/doctre.js",
    "./scripts/lib/modernism.js",
    "./scripts/lib/alienese.js",
    "./scripts/estreU0EEOZ.js",
    "./scripts/estreUi-core.js",
    "./scripts/estreUi-dialog.js",
    "./scripts/estreUi-notation.js",
    "./scripts/estreUi-notification.js",
    "./scripts/estreUi-pageModel.js",
    "./scripts/estreUi-pageManager.js",
    "./scripts/estreUi-handles.js",
    "./scripts/estreUi-interaction.js",
    "./scripts/estreUi-main.js",
];


// Static files cache - Rarely changes after release
const CACHE_NAME_STATIC_FILES = "static-files-cache-v1-20260524";

const STATIC_FILES_TO_CACHE = [
    "./favicon.ico",


    "https://raw.githack.com/googlefonts/noto-emoji/main/fonts/NotoColorEmoji.ttf",


    "./images/app_icon_16x16.png",
    "./images/app_icon_32x32.png",
    "./images/app_icon_48x48.png",
    "./images/app_icon_144x144.png",
    "./images/app_icon_167x167.png",
    "./images/app_icon_180x180.png",
    "./images/app_icon_192x192.png",
    "./images/app_icon_512x512.png",


    "https://fonts.googleapis.com/css2?family=Cute+Font&family=Noto+Sans+KR:wght@100..900&display=swap",


    // "https://code.jquery.com/jquery-3.7.1.js",
    // "https://code.jquery.com/jquery-4.0.0.slim.min.js",
    "https://code.jquery.com/jquery-4.0.0.min.js",
    "https://unpkg.com/@dotlottie/player-component@latest/dist/dotlottie-player.mjs",


    "./lotties/menu_and_back_btn.json",
    "./lotties/menu_and_close_btn.json",
    "./lotties/loading_circle.json",
    "./lotties/ptr_indic.json",
    "./lotties/progress_bar.json",

    "./vectors/more_vertical_slim_icon.svg",
    "./vectors/app_icon.svg",
    "./vectors/cover-icon-default-static.svg",
    "./vectors/cover-icon-default-instant.svg",
    "./vectors/cover-icon-default-overlay.svg",
];


// Stony files cache - Very frequently changes and heavy sized files (for background caching)
const CACHE_NAME_STONY_FILES = "stony-files-cache-v1-20251101b";

const STONY_FILES_TO_CACHE = [

];


const CHECK_ALWAYS_NEWER_FILE_LIST = [
    "./serviceWorker.js",
];


const EMPTY_RESPONSE = new Response(null, {
    status: 200,
    headers: {
        "Content-Type": "octet/stream",
        "Content-Length": "0",
    }
});

self.isLog = true;
self.isDebug = false;
self.isVerbose = false;
Object.defineProperty(self, "isLogging", {
    "get": function () { return this.isLog || this.isDebug; },
    configurable: true,
    enumerable: false,
});
Object.defineProperty(self, "isVerbosely", {
    "get": function () { return this.isDebug && this.isVerbose; },
    configurable: true,
    enumerable: false,
});

self.addEventListener("install", (event) => {
    if (self.isLogging) console.log("Service Worker - Install service worker with cache list" + INSTALLATION_VERSION_NAME);
    const scope = self.registration.scope;
    // vv When use for force installing the new service worker always (not recommended)
    //self.skipWaiting();
    event.waitUntil(
        caches.keys().then(async keyList => {
            const loaders = [];
            if (!keyList.includes(CACHE_NAME_COMMON_FILES)) {
                if (self.isLogging) console.log("Service Worker - Caching common files - " + CACHE_NAME_COMMON_FILES);
                loaders.push(caches.open(CACHE_NAME_COMMON_FILES).then((cache) => cache.addAll(COMMON_FILES_TO_CACHE.map(it => it.replace(/^\.\//, scope)))));
            }
            if (!keyList.includes(CACHE_NAME_STATIC_FILES)) {
                if (self.isLogging) console.log("Service Worker - Caching static files - " + CACHE_NAME_STATIC_FILES);
                loaders.push(caches.open(CACHE_NAME_STATIC_FILES).then((cache) => cache.addAll(STATIC_FILES_TO_CACHE.map(it => it.replace(/^\.\//, scope)))));
            }
            if (!keyList.includes(INSTALLATION_VERSION_NAME)) {
                if (self.isLogging) console.log("Service Worker - Caching application files - " + INSTALLATION_VERSION_NAME);
                loaders.push(caches.open(INSTALLATION_VERSION_NAME).then((cache) => cache.addAll(INSTALLATION_FILE_LIST.map(it => it.replace(/^\.\//, scope)))));
            }
            await Promise.all(loaders);
            if (self.isLogging) console.log("Service Worker - All required files are cached");

            if (!keyList.includes(CACHE_NAME_STATIC_FILES)) (async _ => {
                if (self.isLogging) console.log("Service Worker - Caching static files - " + CACHE_NAME_STATIC_FILES);
                await caches.open(CACHE_NAME_STATIC_FILES).then((cache) => cache.addAll(STATIC_FILES_TO_CACHE.map(it => it.replace(/^\.\//, scope))));
                if (self.isLogging) console.log("Service Worker - Static files are cached");
            })();

            return;
        })
    );
});

self.addEventListener("activate", (event) => {
    if (self.isLogging) console.log("Service Worker - Begin service worker with " + INSTALLATION_VERSION_NAME);
    event.waitUntil(
        caches.keys().then((keyList) =>
            Promise.all(
                keyList.map((key) => {
                    if (CACHE_NAME_COMMON_FILES !== key && CACHE_NAME_STATIC_FILES !== key && INSTALLATION_VERSION_NAME !== key && CACHE_NAME_STONY_FILES !== key) {
                        if (self.isLogging) console.log("Service Worker - Clear older cached - " + key);
                        return caches.delete(key);
                    }
                })
            )
        )
    );
    // vv When use for force alternate the fetch interceptor of new service worker without reload page always (not recommended)
    // event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
    const scope = self.registration.scope;
    const urlString = event.request.url;
    const url = new URL(urlString);
    const pathname = url.pathname;
    const fullpath = url.origin + pathname;
    if (CHECK_ALWAYS_NEWER_FILE_LIST.find(it => fullpath == it.replace(/^\.\//, scope))) {
        event.respondWith(
            fetch(event.request).catch(async (error) => {
                if (self.isLogging) console.log("Service Worker - Return cached file by error on fetch: ", event.request.url);
                return (await caches.match(event.request)) ?? error;
            })
        );
    } else if (pathname.includes("/|") || pathname.includes("/%7C")) event.respondWith(EMPTY_RESPONSE);
    else if (COMMON_FILES_TO_CACHE.find(it => fullpath == it.replace(/^\.\//, scope)) || INSTALLATION_FILE_LIST.find(it => fullpath == it.replace(/^\.\//, scope)) || STATIC_FILES_TO_CACHE.find(it => fullpath == it.replace(/^\.\//, scope)) || STONY_FILES_TO_CACHE.find(it => fullpath == it.replace(/^\.\//, scope))) {
        event.respondWith((async () => {
            // if (self.isLogging) console.log("Service Worker - Fetch intercepted for: ", urlString);
            // Try to get the response from a cache.
            const cachedResponse = await caches.match(event.request);
            // Return it if we found one.
            if (cachedResponse) {
                if (self.isLogging) console.log("Service Worker - Return cached file: ", event.request.url);
                return cachedResponse;
            } else {
                // If we didn't find a match in the cache, use the network.
                if (self.isLogging) console.log("Service Worker - Not in cache list, try fetch directly: ", event.request.url);
                return fetch(event.request).catch(async (error) => {
                    if (self.isLogging) console.log("Service Worker - Return cached file by error on fetch: ", event.request.url);
                    return (await caches.match(event.request)) ?? error;
                });
            }
        })());
    }
});

self.addEventListener("message", async (event) => {
    let response = null;
    switch (event.data.type) {
        case "SKIP_WAITING":
            if (self.isLogging) console.log('Service Worker: SKIP_WAITING received');
            self.skipWaiting();
            // Never call source for alternate old service worker
            return;

        case "CLIENTS_CLAIM":
            if (self.isLogging) console.log('Service Worker: CLIENTS_CLAIM received');
            self.clients.claim();
            // Never call source for alternate old service worker
            return;

        case "clearCache":
            response = await caches.delete(INSTALLATION_VERSION_NAME).then(() => {
                if (self.isLogging) console.log("Cache cleared: ", INSTALLATION_VERSION_NAME);
            });
            break;

        case "clearCommonCache":
            response = await caches.delete(CACHE_NAME_COMMON_FILES).then(returns => {
                if (self.isLogging) console.log("Service Worker - Common Cache cleared: ", CACHE_NAME_COMMON_FILES);
                return returns;
            });
            break;

        case "clearStaticCache":
            response = await caches.delete(CACHE_NAME_STATIC_FILES).then(returns => {
                if (self.isLogging) console.log("Service Worker - Static Cache cleared: ", CACHE_NAME_STATIC_FILES);
                return returns;
            });
            break;

        case "clearStonyCache":
            response = await caches.delete(CACHE_NAME_STONY_FILES).then(returns => {
                if (self.isLogging) console.log("Service Worker - Stony Cache cleared: ", CACHE_NAME_STONY_FILES);
                return returns;
            });
            break;

        case "clearAllCaches":
            response = await caches.keys().then(async keyList => {
                if (self.isLogging) console.log("Service Worker - Clear all caches");
                const deletions = [];
                keyList.forEach(key => {
                    if (self.isLogging) console.log("Service Worker - Clear cached: " + key);
                    deletions.push(caches.delete(key));
                });
                return Promise.all(deletions);
            });
            break;

        case "getVersion":
            response = INSTALLATION_VERSION_NAME;
            break;

        case "getApplicationCount":
            response = await self.clients.matchAll({
                includeUncontrolled: false,
                type: 'window'
            }).then(clients => clients.length);
            break;
    }
    event.source.postMessage({ type: "worked", request: event.data, response });
});
