# Exercise 1 — What changed and why

Running notes for Advanced Web Engineering, Exercise 1. Use this file in class:
reproduction steps, root causes, and answers to the demo questions live here.

Original source of truth before the refactor: `app.js` (still in git history).
Current entry point: `js/main.js`, loaded as an ES module from `index.html`.

## Module map (Demo 1)

| Module | Responsibility | Public API (exported) |
|---|---|---|
| `js/state.js` | Shared application state | `state`, `viewRendered`, storage key constants |
| `js/utils.js` | Lookups, date formatting, badges, HTML escaping | named helpers only |
| `js/storage.js` | `localStorage` read/write for bookmarks, notes, hypothesis | load/save helpers |
| `js/router.js` | Hash navigation | `navigateTo` |
| `js/data.js` | Sequential `fetch` of JSON case files | `loadAllData` and the three loaders |
| `js/views/dashboard.js` | Dashboard rendering | `renderDashboard` |
| `js/views/evidence.js` | Catalogue, filters, sort, detail, bookmarks | render + listener setup |
| `js/views/people.js` | People / locations tabs | render + `switchPeopleTab` |
| `js/views/timeline.js` | Timeline + evidence quick-view modal | render + modal |
| `js/views/workspace.js` | Bookmarks list, notes, hypothesis form | render + `saveHypothesis` |
| `js/main.js` | Startup, hash routing, wiring listeners | nothing (entry point) |

What stays private: filter internals, card HTML builders, modal close helper,
search-request IDs, overlay helpers. Other modules never import those.

Inline `onclick="navigateTo(...)"` handlers were replaced with `addEventListener`
because module scripts do not put bindings on `window`. That is a required part
of the split, not a new feature.

---

## Demo 1 — Split into JS modules

### Questions

**Classic `<script>` vs `<script type="module">` (two differences that matter here)**

1. **Scope / globals.** A classic script shares the global object. `function navigateTo` became `window.navigateTo`, which is why the HTML `onclick` attributes worked. A module has its own scope. After the split, `navigateTo` is invisible to inline handlers unless we `export` it *and* import it, or assign it to `window`. We chose listeners instead of restoring globals.
2. **Strict mode + defer.** Modules are always strict (`this` at top level is `undefined`; assigning an undeclared variable throws). They are also deferred: the browser finishes parsing HTML, then runs the module. Combined with `fetch()`, both classic and module versions still need HTTP. The extra module-only restriction is CORS: browsers refuse ES modules from `file://` even when some classic scripts would run.

**`allEvidence` after the split**

Before: `var allEvidence` was a global, readable and writable from anywhere (and from the console).

After: it lives at `state.allEvidence` in `js/state.js`. Another module must `import { state } from "./state.js"`. If you forget the import and write `allEvidence`, you get `ReferenceError: allEvidence is not defined`. That error is useful: it fails immediately instead of silently creating an accidental global (classic sloppy mode) or reading stale data.

Imported ES-module bindings are *live* but *read-only* from the importing file. `import { allEvidence }` plus `allEvidence = []` would throw `TypeError: Assignment to constant variable`. Mutating through a shared object (`state.allEvidence = data`) is allowed, which is why state is one object rather than a pile of `export let` bindings.

**Named vs default export**

Everything here is a **named export**. Example: `export function renderDashboard()` in `dashboard.js`. A default export (`export default function...`) would imply “this module *is* one thing”. View modules export several functions (`renderEvidenceList`, `openEvidenceDetail`, `setupEvidenceListeners`), so named exports match the API. `navigateTo` is a named export from a one-function module on purpose — if we later add `replaceView()`, we will not have to rewrite every import from `import navigateTo from ...` to a namespace import.

**Why `file://` fails for `type="module"`**

Two separate reasons, both apply:

- `fetch("data/evidence.json")` is blocked as a cross-origin request from `file://` (classic scripts already had this problem).
- ES module graph loads use CORS. `file://` origins are opaque, so the browser will not load `js/main.js` as a module from disk.

Same symptom (blank / failed app), two mechanisms. A local HTTP server (`npx serve .` or `python -m http.server`) fixes both.

---

## Demo 2 — Mutation / reference bug

### Reproduction (original `app.js`)

1. Open the app, wait for the dashboard. Note “Recent evidence”: last five items in file order (E17… around E13), not alphabetical.
2. Go to **Evidence**. Change **Sort** to **Title (A–Z)**.
3. Go back to **Dashboard**.

**Expected:** dashboard “recent evidence” still means newest-in-file / chronological tail.

**Actual:** the dashboard list is now the last five titles in A–Z order. Sorting the catalogue mutated the master array.

### Root cause

```js
filteredEvidence = allEvidence;          // same array reference, not a copy
filteredEvidence.sort(...);              // sorts allEvidence too
```

`handleSortChange` sorted `filteredEvidence` in place. After load, that variable pointed at the **same** array object as `allEvidence`. Arrays are reference values: sorting one name sorts the other. `renderEvidenceList` then called `getFilteredEvidence()`, which walked `allEvidence` in the already-sorted order, so the UI looked “sorted” while the canonical data was corrupted.

### Fix

- Copy on load: `state.filteredEvidence = state.allEvidence.slice()`.
- Sort a copy inside `sortEvidenceCopy(items)` and never call `.sort()` on `state.allEvidence`.
- `handleSortChange` only re-renders; `getFilteredEvidence` applies the current sort to a fresh filter result.

### Questions

**Reference vs copy.** A variable holding an object/array stores a pointer to the heap object, not a snapshot. `b = a` makes two names for one array. `a.slice()` / `[...a]` makes a new array (shallow: the evidence *objects* inside are still shared, which is what we want for status edits). The bug was “two names, one array”.

**Could you have found it by reading top-to-bottom?** You could *suspect* it from `filteredEvidence = allEvidence` plus `.sort()`, but the user-visible damage is on another view after a later click. Running the app is how you notice the dashboard is lying; the code read is how you confirm why.

---

## Demo 3 — Async / Promise-handling bug

### Reproduction (original)

1. Open DevTools → Console, then load the app.
2. Click **Evidence**.

**Expected:** evidence cards after JSON has loaded.

**Actual:** the spinner “Loading evidence…” never goes away. The catalogue stays empty even though `evidence.json` returned 200 in the Network tab.

### Root cause

`evidenceViewLoading` is set to `true` and **never set back to `false`** when `loadEvidenceData()`’s Promise resolves. `renderEvidenceList` bails out while that flag is true. The async operation succeeded; the UI never observed the success.

Related (same family): `loadAllData()` did not wait for evidence (`loadEvidenceData()` was fired and forgotten). `handleHashChange()` could run on `#evidence` while the flag was still true, set `viewRendered.evidence = true`, and then never retry except for the `if (currentPage === "evidence")` branch inside the fetch callback — which still saw `evidenceViewLoading === true` and returned.

Also: `initApp` logged `loadNoteAsync("E01")` **without awaiting**. The console showed a pending Promise object, not the note string.

### Fix

- Set `state.evidenceViewLoading = false` after evidence JSON is applied (and in the `catch` so a failure does not spin forever).
- Then render if the user is already on the evidence view.
- `await loadNoteAsync("E01")` in `initApp`.
- Data loaders rewritten with `async`/`await` (Demo 9) so the “when does this flag flip” line sits next to the `await`, not buried in a nested `.then()`.

### Question

The operation is `fetch("data/evidence.json")` → `res.json()`. The bug is **on success** (and would also bite on failure): the Promise callback updated `allEvidence` but not `evidenceViewLoading`. Confirmed in Network (200 + JSON body) plus a breakpoint on `renderEvidenceList`: the function ran, hit the `if (evidenceViewLoading) return` branch, and never painted cards.

---

## Demo 4 — Silent (console-only) bug

### Reproduction (original)

1. Open DevTools → Console **before** clicking anything.
2. Click **Dashboard**, **Evidence**, **Timeline**, … in the header.

**UI:** navigation still works (inline `onclick="navigateTo(...)"`).

**Console:**

```
Uncaught TypeError: Cannot read properties of undefined (reading 'getAttribute')
```

(Firefox: `navButtons[i] is undefined`.)

### Root cause

```js
for (var i = 0; i < navButtons.length; i++) {
  navButtons[i].addEventListener("click", function () {
    var targetView = navButtons[i].getAttribute("data-view");
    console.log("nav clicked:", targetView);
  });
}
```

`var i` is function-scoped. Every listener closes over the **same** `i`. After the loop, `i === navButtons.length`, so `navButtons[i]` is `undefined`. The extra listener was only a debug log; navigation used a different path, so the UI looked fine.

### Fix

Removed the broken debug listeners. Navigation is `document.querySelectorAll("[data-view]")` + `addEventListener` with the button captured by the arrow callback (`btn.getAttribute("data-view")`). `let` in a `for` loop would also have fixed the closure; deleting dead code is cleaner.

### Question

Nothing looked broken because the TypeError happened in a listener that did not own navigation. “Looks fine” only means the happy path of the UI; the console is part of the product’s health. A later refactor that removed the `onclick` attributes would have made this the *only* click handler — then navigation would have died.

---

## Demo 5 — Full walkthrough (additional bugs)

| # | Repro | Expected | Actual | Cause | Fix | Verify |
|---|---|---|---|---|---|---|
| A | Filter or search on Evidence, then click the star | Bookmark toggles once | After N re-renders, star toggles N times (even N → appears stuck) | `renderEvidenceList` called `addEventListener("click", …)` every time | Bind the delegated listener once in `setupEvidenceListeners` | Filter several times, bookmark E01; star and workspace stay in sync |
| B | Timeline → open the same evidence modal 3×, then “Open full evidence” | One navigation | Multiple hash changes / duplicate opens; console `modal opened, active close listeners: 3` | New click listener on the modal every open; never removed | Bind one listener when the modal element is created | Open/close 5×, then Open full — single detail view |
| C | Timeline event “Location:” | Human-readable place names | `[object Object]` | `eventLocationNames.push(evtLoc)` pushed the whole location object | Push `evtLoc.id + " - " + evtLoc.name` | Every event shows `L0x - …` |
| D | Application tab: set `remotion_notes` or `remotion_hypothesis` to `not-json`, reload | App still starts | Notes parse threw; hypothesis `JSON.parse` threw; init aborted | `loadNotesFromStorage` / `loadHypothesisFromStorage` had no `try/catch` (bookmarks already did) | Catch, warn, start empty / skip draft | Corrupt key, reload, dashboard appears |
| E | Evidence note: `<img src=x onerror=alert(1)>`, save, look at preview + Workspace notes | Text shown as text | Preview executed HTML (`innerHTML`) | User notes written with `innerHTML` | `textContent` / `escapeHtml` | Payload shows as characters, no alert |
| F | Hash change | One view update | `handleHashChange` ran twice | Listener registered in `setupEventListeners` **and** again at the bottom of `app.js` | Register once in `main.js` | Breakpoint in `handleHashChange` fires once per navigation |
| G | Status filter: change the dropdown | List filters once | Could fire twice | Both `addEventListener("change")` and `setAttribute("onchange", "renderEvidenceList()")` | Only `addEventListener` | Change Unreviewed → one render |
| I | Bookmark an item, then open Dashboard | Bookmarked stat increments | Stat stayed at 0 | Dashboard rendered once (`viewRendered.dashboard`) and never again | Re-render dashboard every time that view is shown | Bookmark E01, open Dashboard, stat is 1 |
| H | Network: fail `case.json` | Overlay eventually hides | Overlay could stick (`loadingStepsRemaining` never decremented on core failure) | Nested fetch had no `catch`; only timeline `finally` decremented | `try/catch` around core load + `hideLoadingStep`; `readJson` throws on `!res.ok` | (DevTools block URL, reload — overlay clears) |

**Live demo pick:** Demo 3 (evidence spinner) is the clearest before/after. Demo 2 (sort mutates dashboard) is the best “reference vs copy” story. Commit the parent of the bugfix (original `app.js`) and diff against this tree.

**Did one fix affect another?** Yes, slightly:

- Fixing the sort mutation (Demo 2) did **not** hide the spinner (Demo 3); they touch different variables.
- Removing extra evidence click listeners (A) made bookmark-after-sort reliable; before that, Demo 2’s re-render could make Demo A worse (more listeners after each sort).
- Modal listener leak (B) was independent of the nav `var i` leak (Demo 4). Same *class* of bug (listener lifetime), different objects.
- Isolated by reproducing each bug on a clean reload after each fix.

---

## Demo 6 — Debugger (do this live)

Use the **original** spinner bug or the sort bug.

1. Sources → `js/views/evidence.js` → breakpoint on the first line of `renderEvidenceList` (or `js/data.js` inside `loadEvidenceData` after `await readJson`).
2. Reload. **Step over** the DOM lookups, **step into** `getFilteredEvidence` / `sortEvidenceCopy`, **step out** back to the renderer.
3. Call stack while paused in `sortEvidenceCopy`: `getFilteredEvidence` ← `renderEvidenceList` ← `handleHashChange` / `loadEvidenceData`. That tells you *who* asked for a list and whether evidence had finished loading.
4. Conditional breakpoint on the `for (const item of state.allEvidence)` loop: `item.id === "E04"` (E04 stores a person *name* instead of an id — good probe for `evidenceMentionsPerson`).
5. While paused, Watch `state.evidenceViewLoading`. In the original code it stays `true`; flip it to `false` in the console to test the hypothesis before editing the source.

### Questions

**Step over vs step into.** Over runs a call as one step; into enters it. Stepping *into* `formatDate` from a timeline loop wastes time — you already trust date formatting. Step into `getFilteredEvidence` when you care why an item disappeared.

**Call stack.** The list of frames that have not returned yet. It answers “why am I in this function *now*?” For the spinner: `renderEvidenceList` was called from `handleHashChange` *before* the evidence Promise resolved.

**Conditional breakpoint.** Pauses only when the expression is true. Faster than hitting Resume 16 times until `id === "E04"`.

**DevTools breakpoint vs `debugger;`.** UI breakpoints are local to your machine and can be conditional/logpoints. `debugger;` is in source, hits for everyone, easy to forget in a commit. Prefer UI breakpoints for investigation; use `debugger;` only for a short, shared “pause here” that you will delete.

**When `console.log` is not enough.** Logging `evidenceViewLoading` shows `true` forever, but not *which caller* rendered the empty list. The stack plus stepping shows `handleHashChange` painting too early and the fetch callback painting again still with the flag true.

---

## Demo 7 — DevTools tour (do this live)

**Console.** Filter Errors only → the old nav `TypeError`. Filter Warnings → bookmark/notes parse warnings after a corrupt key. Text filter `timeline`. Preserve log: messages survive reload; without it, the boot log vanishes.

**Network.** Reload: `case.json`, `people.json`, `locations.json`, `evidence.json`, `timeline.json`. One of them: Status 200, Type `json` / `fetch`, Time (ms). Slow 3G: overlay stays longer; dashboard stats fill in stages (people/locations first, evidence count 0 → N, timeline last/parallel-ish). Order matters because `loadCorePeopleAndLocations` is sequential, then evidence is **not** awaited, then timeline is awaited — dashboard can show 0 evidence briefly.

**Application / Storage.** Keys:

| Key | Purpose |
|---|---|
| `remotion_bookmarks` | JSON array of evidence ids |
| `remotion_notes` | JSON object `{ evidenceId: text }` |
| `remotion_hypothesis` | JSON draft of the workspace form |

Edit a bookmark id, reload → star state changes. Replace `remotion_notes` with `nope` → `JSON.parse` used to throw (init died); now a `console.warn` and empty notes. That is exactly the `try/catch` in `loadNotesFromStorage`.

**Elements.** Inspect an evidence card: `.evidence-card[data-id="E01"]`. Built in `renderEvidenceCardHTML` in `js/views/evidence.js`.

### Questions

**`log` / `warn` / `error`.** Not just colour: filtering, severity, and (in some browsers) a pause-on-error / ignored-warning distinction. `console.error` in `loadEvidenceData` is the right channel for a failed case file; the old timeline loader used `console.log` for a failure, which hides under “Errors only”.

**Status / Type / Time.** Status = HTTP code; Type = how DevTools classified the request; Time = duration. A 404: `fetch` does **not** reject. Original code called `res.json()` on the 404 HTML page, which rejects, then evidence `.catch` alerted. Timeline `.catch` only logged. Core load had no catch. Current `readJson` throws on `!res.ok` so HTTP errors are explicit.

**Throttle observation.** Core JSON (case → people → locations) is sequential, so people/locations appear together after three round trips. Evidence starts after core finishes but is not awaited; with Slow 3G the dashboard can paint “0 evidence” then jump. Timeline `finally` hides the overlay even if evidence is still in flight — overlay-gone ≠ all data ready.

---

## Demo 8 — Clean coding

### Original top-level `var`s

`allEvidence`, `filteredEvidence`, `selectedEvidence`, `bookmarks`, `currentPage`, `allPeople`, `allLocations`, `allTimeline`, `caseData`, `currentPeopleTab`, `loadingStepsRemaining`, `evidenceViewLoading`, `viewRendered`, `notesStore`, `modalCloseListenerCount`, `STORAGE_KEY_*`, `latestSearchRequestId`.

If two features both used `bookmarks` as a name (e.g. a future “bookmark timestamp” helper), the global `var` would share one binding. The module split already prevents that: storage and evidence import `state.bookmarks`; a new module that forgets to import gets a `ReferenceError` instead of aliasing the array. `viewRendered` as a shared object still *can* be mutated from anywhere that imports it — modules stop *accidental* globals, not *intentional* shared state.

### `var` → `const` / `let`

Replaced throughout. `const` unless the binding is reassigned (`let hash`, `let html`, `let matches`). Loop iterators are `const` in `for...of`.

### Extra smells (fixed)

1. **Inline `onclick` + globals.** Tight coupling to `window`. Replaced with `addEventListener` in the view modules.
2. **Unsafe `innerHTML` for investigator notes.** XSS. Now `textContent` / `escapeHtml`.
3. **Listener leaks** (evidence list, modal, duplicate `hashchange`).
4. **Dead debug `console.log`** on every nav click.

### Questions

**`var` / `let` / `const`.** `var`: function scope, hoisted, can redeclare, can reassign. `let`: block scope, TDZ, reassign OK. `const`: block scope, no reassignment (object contents still mutable). The nav loop bug is the textbook `var` case: `let i` would have given each listener its own `i`. `const` would not fit because `i++` reassigns.

**Accidental global.** In sloppy mode, `bookmarks = []` without `var`/`let`/`const` writes `window.bookmarks`. Modules are strict: that assignment throws `ReferenceError`.

**Works vs clean.** The evidence grid “worked” while registering another click handler on every filter change. Cost: intermittent bookmark bug, painful reviews (“why is this listener inside render?”), onboarding time. Cleaning it did not add a feature; it removed a class of Heisenbugs.

---

## Demo 9 — Nested Promises → `async`/`await`

### Original shape (`loadCorePeopleAndLocations`)

Four nested `.then()` levels, **sequential** (each `fetch` starts only after the previous JSON parsed):

```
fetch case.json
  └ then json
      └ fetch people.json
          └ then json
              └ fetch locations.json
                  └ then json → hide overlay step, render, dropdowns
```

Evidence and timeline were separate chains. `loadAllData` awaited core, then started evidence without awaiting it, then returned the timeline Promise.

### After

`loadCorePeopleAndLocations` / `loadEvidenceData` / `loadTimelineData` / `loadAllData` are `async` functions using `await readJson(...)`. Still sequential inside core (no `Promise.all` — later exercise). `loadAllData` still does not `await loadEvidenceData()` so overlay timing stays as designed.

Second conversion: `handleSearchInput` now `await simulateAsyncSearch(...)` instead of `.then()`, keeping the `requestId` race guard. `loadNoteAsync` is `async` and awaited in `initApp`.

Error handling: evidence still `try/catch` + `alert`; timeline `try/catch` + `console.error` + `finally { hideLoadingStep() }`; core wrapped in `loadAllData`.

### Questions

**Why nested `.then()` is harder.** Control flow is indented by callback, not by time. Error handling needs a `.catch` per chain. `async`/`await` reads top-to-bottom like the sequential dependency that actually exists.

**What `await` does.** It pauses **that async function**, returning a Promise to the caller. The rest of the program (UI, other listeners, other fetches already started) keeps running. It does not block the JS thread like `sleep()`.

**Async functions always return a Promise.** `const p = loadEvidenceData(); p.then(x => console.log(x))` logs `undefined` (the function has no `return` value) after the load finishes — not the JSON. The JSON is in `state.allEvidence`. Proves the call is asynchronous even when you `return;` nothing.

**Equivalent of `.catch()`.** `try/catch` around `await`. If you omit it and the `await`ed Promise rejects, the async function’s returned Promise rejects. An `await loadAllData()` without `try` in `initApp` would surface as an unhandled rejection and skip `handleHashChange()`.

**Is it faster?** No. Same sequence of microtasks and network. Readability only. Parallelism would be `Promise.all` (out of scope).

**Remove one `await`.** `const data = readJson("data/evidence.json")` (no await) assigns a Promise to `state.allEvidence`. `.filter` / `.length` then blow up or show nonsense. Same family as Demo 3 / the una awaited `loadNoteAsync` log: treating a Promise as already-resolved data.

---

## Demo 10 — Arrow functions

### Converted (good candidates)

- Lookups and formatters in `utils.js` (`findEvidenceById`, `formatDate`, …) — no `this`, no `arguments`, expression-shaped.
- Storage helpers in `storage.js`.
- `navigateTo`, `statCardHTML`, `populateEvidenceDropdowns`, `saveHypothesis`.
- Event callbacks: `btn.addEventListener("click", () => navigateTo(...))`, status `<select>` `change` handlers, people “view” links, timeline links, confidence slider.

### Not converted (on purpose)

**`function initApp()` and `function handleHashChange()`** stay function declarations.

Reasons we would refuse an arrow here / in similar spots:

1. **`this`.** Arrow functions close over lexical `this`. A handler written as `function () { this.classList.add("active"); }` (element as `this`) would break as an arrow (`this` would be `undefined` in the module). We do not use that pattern now; that is exactly why it is the example we would refuse if asked to convert *every* function.
2. **Constructors / `arguments`.** No `new` usage in this app; the limitation did not block conversions. `arguments` is unused; we use rest params / explicit args.
3. **Hoisting.** `function initApp() {}` is hoisted in its module. `const initApp = async () => {}` is in the TDZ until that line. We register `initApp` *after* its definition, so hoisting did not bite — but keeping the declaration makes the entry point obvious in the Call Stack (named function).

### Questions

**`this`.** Regular functions: `this` depends on the call site (`obj.method()`, `fn.call`, DOM handler). Arrows: `this` from the enclosing scope. Risky as object methods (`const api = { render: () => this.el }` — `this` is not `api`). Preferable as callbacks inside modules, where you want the enclosing scope (or do not use `this` at all).

**Constructors / `arguments`.** Did not block us; nothing is constructed with `new`, nothing reads `arguments`.

**Hoisting.** Did not force a rewrite order because `main.js` defines `handleHashChange` / `initApp` before registering listeners. If someone moved `addEventListener("hashchange", handleHashChange)` above a `const handleHashChange = () => {}`, they would get a TDZ `ReferenceError`. Declarations would still work. That is a reason to keep the two control-flow functions as declarations.

**Before/after (behaviour).**

```js
function formatDate(ts) { ... }
export const formatDate = (ts) => { ... };
```

Same result for the same input: no `this`, no `new`, no `arguments`. Pure style / module export shape.

**Team rule.** Use **function declarations** for exported view/entry functions that show up in the debugger (`renderDashboard`, `initApp`). Use **arrow functions** for short callbacks and pure helpers. Never use arrows as methods that rely on dynamic `this`. Do not mix `onclick` attributes with either style.

---

## How to run

Same as the README: serve the folder over HTTP, then open the printed localhost URL.

```bash
npx serve .
```
