# I shipped a PWA from two pages of spec: the Rimlog build story

I built a small app and put it online. [Rimlog](https://soliestre.github.io/Rimlog/) is a reading log: when something in a book or a YouTube video sticks with you, you jot down the passage and your own thought, and an AI finds the past note that connects to it and asks you one question back. It works offline, and the data lives only in your browser. There is no server, so there is no sign-up either.

The app itself is honestly ordinary. The reason I'm writing this is that the way it was built was a little strange. I barely wrote any of its code. Instead I wrote two pages of spec, in Korean.

## How a spec becomes code

There are two files in the [repository](https://github.com/SoliEstre/Rimlog)'s `eux/` folder. [`rimlog-app.eux`](https://github.com/SoliEstre/Rimlog/blob/main/eux/rimlog-app.eux) is about 40 lines, and it describes the whole app in plain sentences: how the three pages are laid out and behave, what goes into local storage, when the AI gets called and what happens when it fails. A line reads like this (translated from the Korean original):

> saveCapture: save the capture form (source name, quote, my thought, tags). Insert at the front of captures, persist to local storage, show a "Saved" toast, switch to the log tab.

Feed this file to a tool called [EstreUX](https://github.com/SoliEstre/EstreUX.js) and code comes out. The process is called brew. The generated code carries a hash of the spec, so if someone edits the spec without regenerating the code, or the other way around, the commit is blocked.

Why bother? If you have ever had an AI write code for you, you know the problem: the code survives, but the conversation that produced it evaporates. Three months later there is nowhere to ask "why is this code the way it is?" Keeping the spec in git and treating the code as build output gives that question a place to land. At least, that is the hypothesis this experiment is testing.

## Two frameworks under the hood

The big frame of Rimlog, page transitions, back-button handling, the service worker, is handled by [EstreUI](https://github.com/SoliEstre/EstreUI.js). It has a lifecycle similar to Android activities, so each page gets hooks like onShow and onHide. The first spec file brews into this side.

The purple AI card is built with [EstreUV](https://github.com/SoliEstre/EstreUV.js), a web-component library. The second spec file becomes a custom element called `<ai-insight-card>`, which sits inside an EstreUI page. It is isolated behind shadow DOM, and the host passes light-and-dark theming down through CSS variables.

One spec can also brew into different targets. A [word-chain demo](https://github.com/SoliEstre/EstreUX.js/tree/main/examples) I made earlier produced three versions from a single spec: EstreUI alone, web components alone, and the two combined. Which means if I ever migrate frameworks, the spec stays put and I just brew a different target.

I also measured the savings. I took components that already existed in the framework, a numeric keypad and a collapsible block, and distilled them back into specs. The lines a human has to maintain dropped by 60 to 82 percent; a 152-line keypad became a 28-line spec. The generated code itself sometimes ends up longer than the original. What shrinks is the part a person reads and edits. The [measurement log](https://github.com/SoliEstre/EstreUX/blob/main/docs/phase-b-usage-metrics.md) is in the repo.

## Try it

The live app is at https://soliestre.github.io/Rimlog/. Open it in a mobile browser and add it to your home screen, and it behaves like an app. For the AI connection, paste in an API key to use a real model, or skip it and a simple tag-overlap fallback fills in. The key stays in your browser session and disappears when you close it.

If you read the [repository](https://github.com/SoliEstre/Rimlog)'s commit history from the beginning, the whole sequence is there in order: scaffold, spec, generation, polish. If you are curious about the spec format, the [EstreUX repo](https://github.com/SoliEstre/EstreUX.js) has the docs.

I am still not sure that keeping the spec and treating code as build output is the right direction. What I can say is that a verifiable app came out of it, and the whole process is preserved in the repo. Opinions welcome, in the issues or wherever you found this.

---

*Korean original: [명세 두 장으로 PWA 앱을 하나 만들었습니다 — Rimlog 빌드 기록](https://estreui.tistory.com/5)*
