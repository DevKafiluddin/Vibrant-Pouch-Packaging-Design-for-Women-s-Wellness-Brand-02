(function() {
    const a = document.createElement("link").relList;
    if (a && a.supports && a.supports("modulepreload"))
        return;
    for (const c of document.querySelectorAll('link[rel="modulepreload"]'))
        u(c);
    new MutationObserver(c => {
        for (const f of c)
            if (f.type === "childList")
                for (const d of f.addedNodes)
                    d.tagName === "LINK" && d.rel === "modulepreload" && u(d)
    }
    ).observe(document, {
        childList: !0,
        subtree: !0
    });
    function r(c) {
        const f = {};
        return c.integrity && (f.integrity = c.integrity),
        c.referrerPolicy && (f.referrerPolicy = c.referrerPolicy),
        c.crossOrigin === "use-credentials" ? f.credentials = "include" : c.crossOrigin === "anonymous" ? f.credentials = "omit" : f.credentials = "same-origin",
        f
    }
    function u(c) {
        if (c.ep)
            return;
        c.ep = !0;
        const f = r(c);
        fetch(c.href, f)
    }
}
)();
const Ns = [];
let dg = !0;
const hg = console.error;
function tm(i) {
    Ns.length > 5 || !dg || Ns.push(i)
}
function mg(i) {
    Ns.push({
        type: "runtime",
        args: i
    })
}
function gg(i) {
    i.preventDefault()
}
function H0(i) {
    try {
        const a = i.find(r => r instanceof Error);
        if (a && a.stack)
            tm({
                type: "console.error",
                args: a
            });
        else if (i.length > 0) {
            const r = i.map(c => typeof c == "object" ? JSON.stringify(c) : String(c)).join(" ")
              , u = new Error(r);
            tm({
                type: "console.error",
                args: u
            })
        }
    } catch (a) {
        console.warn(a)
    }
}
window.addEventListener("error", mg);
window.addEventListener("unhandledrejection", gg);
console.error = function(...a) {
    H0(a),
    hg.apply(this, a)
}
;
function B0() {
    return window.removeEventListener("error", mg),
    window.removeEventListener("unhandledrejection", gg),
    console.error = hg,
    dg = !1,
    Ns
}
const q0 = 1e3
  , nm = Symbol("postMessageResponseTimeout");
let xs = 0;
const lo = "*";
class Xl {
    client;
    baseTimeout;
    waitRes = new Map;
    removeListeners = new Set;
    clear;
    constructor(a, r) {
        this.client = a,
        this.baseTimeout = r?.timeout || q0;
        const u = this.emitResponse.bind(this);
        this.clear = () => {
            window.removeEventListener("message", u)
        }
        ,
        window.addEventListener("message", u)
    }
    destroy() {
        this.clear(),
        this.removeListeners.forEach(a => a())
    }
    isTimeout(a) {
        return a === nm
    }
    post(a, r, u) {
        xs++;
        const {timeout: c, origin: f=lo} = u || {};
        return this.client.postMessage({
            data: r,
            id: xs,
            type: a
        }, f),
        new Promise(d => {
            this.waitRes.set(xs, m => {
                d(m)
            }
            ),
            setTimeout( () => {
                this.waitRes.delete(xs),
                d(nm)
            }
            , c || this.baseTimeout)
        }
        )
    }
    on(a, r, u) {
        const {once: c, origin: f=lo} = u || {}
          , d = async g => {
            const {id: p, type: b, data: v} = g.data;
            let S;
            b === a && (S = await r(v),
            console.log(a, c, S, v),
            (p && f === g.origin || f === lo) && g.source?.postMessage({
                fromType: a,
                id: p,
                data: S
            }, g.origin),
            c && m())
        }
        ;
        window.addEventListener("message", d);
        const m = () => {
            window.removeEventListener("message", d),
            this.removeListeners.delete(m)
        }
        ;
        return this.removeListeners.add(m),
        m
    }
    emitResponse(a) {
        const r = a.data
          , {id: u, data: c} = r
          , f = this.waitRes.get(u);
        f && f(c)
    }
}
class G0 {
    #e = new WeakMap;
    #n;
    #l;
    #t = !1;
    constructor() {
        this.#n = HTMLElement.prototype.addEventListener,
        this.#l = HTMLElement.prototype.removeEventListener
    }
    patch() {
        if (this.#t)
            return;
        const a = this;
        HTMLElement.prototype.addEventListener = function(r, u, c) {
            return a.#a(this, r, u),
            a.#n.call(this, r, u, c)
        }
        ,
        HTMLElement.prototype.removeEventListener = function(r, u, c) {
            return a.#i(this, r, u),
            a.#l.call(this, r, u, c)
        }
        ,
        this.#t = !0,
        console.log("[EventListenerRegistry] ✅ addEventListener patched")
    }
    unpatch() {
        this.#t && (HTMLElement.prototype.addEventListener = this.#n,
        HTMLElement.prototype.removeEventListener = this.#l,
        this.#t = !1,
        console.log("[EventListenerRegistry] ⚠️ addEventListener unpatched"))
    }
    #a(a, r, u) {
        let c = this.#e.get(a);
        c || (c = new Map,
        this.#e.set(a, c));
        let f = c.get(r);
        f || (f = new Set,
        c.set(r, f)),
        f.add(u)
    }
    #i(a, r, u) {
        const c = this.#e.get(a);
        if (!c)
            return;
        const f = c.get(r);
        f && (f.delete(u),
        f.size === 0 && c.delete(r))
    }
    hasListeners(a, r) {
        const u = this.#e.get(a);
        return !u || u.size === 0 ? !1 : r ? r.some(c => {
            const f = u.get(c);
            return f && f.size > 0
        }
        ) : !0
    }
    getEventTypes(a) {
        const r = this.#e.get(a);
        return r ? Array.from(r.keys()) : []
    }
    getListenerCount(a, r) {
        const u = this.#e.get(a);
        if (!u)
            return 0;
        const c = u.get(r);
        return c ? c.size : 0
    }
    getDebugInfo() {
        return {
            patched: this.#t,
            note: "WeakMap is used for automatic memory cleanup. Cannot enumerate elements."
        }
    }
    getElementDebugInfo(a) {
        const r = this.#e.get(a);
        return r ? {
            element: a,
            tag: a.tagName,
            className: a.className,
            hasListeners: !0,
            eventTypes: Array.from(r.keys()),
            totalListeners: Array.from(r.values()).reduce( (u, c) => u + c.size, 0)
        } : {
            element: a,
            hasListeners: !1,
            eventTypes: [],
            totalListeners: 0
        }
    }
}
const kl = new G0
  , pg = ["click", "dblclick", "contextmenu", "mousedown", "mouseup", "mousemove", "mouseenter", "mouseleave", "mouseover", "mouseout", "touchstart", "touchmove", "touchend", "touchcancel", "pointerdown", "pointerup", "pointermove", "pointerenter", "pointerleave", "pointerover", "pointerout", "pointercancel"];
function Ho(i) {
    return kl.hasListeners(i, pg)
}
function yg(i) {
    return kl.getEventTypes(i).filter(r => pg.includes(r))
}
function vg(i) {
    const a = yg(i)
      , r = {};
    return a.forEach(u => {
        r[u] = kl.getListenerCount(i, u)
    }
    ),
    {
        hasEvents: a.length > 0,
        eventTypes: a,
        listeners: r
    }
}
function Y0(i) {
    return kl.getElementDebugInfo(i)
}
function bg(i=window) {
    kl.patch(),
    i.__eventListenerRegistry__ = {
        hasListeners: Ho,
        getEventTypes: yg,
        getDetail: vg,
        getDebugInfo: () => kl.getDebugInfo(),
        getElementDebugInfo: Y0
    },
    console.log("[EnhancedEventDetector] ✅ Initialized and patched addEventListener")
}
typeof window < "u" && bg(window);
const Bo = ["onClick", "onDoubleClick", "onContextMenu", "onMouseDown", "onMouseUp", "onPointerDown", "onPointerUp", "onTouchStart", "onTouchEnd", "onDragStart", "onDrop", "onChange", "onSubmit", "onKeyDown", "onKeyUp"];
function qo(i) {
    const a = Object.keys(i).find(r => r.startsWith("__reactFiber$") || r.startsWith("__reactInternalInstance$"));
    return a ? i[a] : null
}
function xg(i) {
    return !i || typeof i != "object" ? !1 : Bo.some(a => typeof i[a] == "function")
}
function V0(i) {
    return !i || typeof i != "object" ? [] : Bo.filter(a => typeof i[a] == "function")
}
function Sg(i) {
    let a = qo(i);
    for (; a; ) {
        if (a.memoizedProps && xg(a.memoizedProps))
            return !0;
        a = a.return || null
    }
    return !1
}
function Eg(i) {
    const a = {
        hasEvents: !1,
        events: []
    };
    let r = qo(i);
    for (; r; ) {
        if (r.memoizedProps) {
            const u = V0(r.memoizedProps);
            if (u.length > 0) {
                a.hasEvents = !0;
                const c = r.type?.displayName || r.type?.name || r.elementType?.name || "Unknown";
                a.events.push({
                    componentName: c,
                    eventNames: u,
                    props: r.memoizedProps
                })
            }
        }
        r = r.return || null
    }
    return a
}
function wg(i) {
    const a = qo(i);
    return !a || !a.memoizedProps ? !1 : xg(a.memoizedProps)
}
function _g(i=window) {
    i.__reactEventDetector__ = {
        hasReactInteractionEvents: Sg,
        getReactInteractionEventsDetail: Eg,
        hasReactInteractionEventsOnSelf: wg,
        REACT_EVENT_PROPS: Bo
    },
    console.log("[ReactEventDetector] Injected to window.__reactEventDetector__")
}
typeof window < "u" && _g(window);
function Cg(i) {
    return i ? Sg(i) || Ho(i) : !1
}
function Q0(i) {
    return i ? wg(i) || Ho(i) : !1
}
function Go(i) {
    const a = Eg(i)
      , r = vg(i);
    return {
        hasEvents: a.hasEvents || r.hasEvents,
        react: a,
        native: r
    }
}
function Yo(i) {
    if (!i)
        return {
            error: "selector is required"
        };
    const a = document.querySelector(i);
    if (!a)
        return {
            error: "Element not found",
            selector: i
        };
    const r = Go(a);
    return {
        selector: i,
        hasEvents: r.hasEvents
    }
}
function Tg(i, a) {
    if (typeof i != "number" || typeof a != "number")
        return {
            error: "x and y must be numbers"
        };
    const r = document.elementFromPoint(i, a);
    if (!r)
        return {
            error: "No element at point",
            x: i,
            y: a
        };
    const u = Go(r);
    return {
        x: i,
        y: a,
        hasEvents: u.hasEvents
    }
}
function k0(i) {
    return i.map(a => ({
        element: a,
        hasEvents: Cg(a)
    }))
}
function Og(i) {
    return i.map(a => ({
        selector: a,
        result: Yo(a)
    }))
}
const lm = "1.0.0";
function X0() {
    window.__interactionDetector__ = {
        hasInteractionEvents: Cg,
        hasInteractionEventsOnSelf: Q0,
        getDetail: Go,
        checkBySelector: Yo,
        checkByPoint: Tg,
        checkMultiple: k0,
        checkMultipleSelectors: Og,
        version: lm
    },
    console.log(`[InteractionDetector] Global API initialized (v${lm})`)
}
function Z0() {
    const i = new Xl(window.parent);
    i.on("checkInteraction", a => {
        const {selector: r, x: u, y: c} = a || {};
        return r ? Yo(r) : typeof u == "number" && typeof c == "number" ? Tg(u, c) : {
            error: "Invalid params: need selector or (x, y)"
        }
    }
    ),
    i.on("checkMultipleSelectors", a => {
        const {selectors: r} = a || {};
        return !r || !Array.isArray(r) ? {
            error: "selectors array is required"
        } : Og(r)
    }
    ),
    console.log("[InteractionDetector] PostMessage listener initialized")
}
function K0() {
    bg(),
    _g(),
    X0(),
    Z0(),
    console.log("[Continue] Module fully initialized")
}
function F0(i) {
    return i && i.__esModule && Object.prototype.hasOwnProperty.call(i, "default") ? i.default : i
}
function J0(i) {
    if (Object.prototype.hasOwnProperty.call(i, "__esModule"))
        return i;
    var a = i.default;
    if (typeof a == "function") {
        var r = function u() {
            var c = !1;
            try {
                c = this instanceof u
            } catch {}
            return c ? Reflect.construct(a, arguments, this.constructor) : a.apply(this, arguments)
        };
        r.prototype = a.prototype
    } else
        r = {};
    return Object.defineProperty(r, "__esModule", {
        value: !0
    }),
    Object.keys(i).forEach(function(u) {
        var c = Object.getOwnPropertyDescriptor(i, u);
        Object.defineProperty(r, u, c.get ? c : {
            enumerable: !0,
            get: function() {
                return i[u]
            }
        })
    }),
    r
}
var Ga = {}, ao = {}, io = {}, so = {}, am;
function $0() {
    if (am)
        return so;
    am = 1;
    const i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    return so.encode = function(a) {
        if (0 <= a && a < i.length)
            return i[a];
        throw new TypeError("Must be between 0 and 63: " + a)
    }
    ,
    so
}
var im;
function Ag() {
    if (im)
        return io;
    im = 1;
    const i = $0()
      , a = 5
      , r = 1 << a
      , u = r - 1
      , c = r;
    function f(d) {
        return d < 0 ? (-d << 1) + 1 : (d << 1) + 0
    }
    return io.encode = function(m) {
        let g = "", p, b = f(m);
        do
            p = b & u,
            b >>>= a,
            b > 0 && (p |= c),
            g += i.encode(p);
        while (b > 0);
        return g
    }
    ,
    io
}
var zt = {};
const W0 = {}
  , P0 = Object.freeze(Object.defineProperty({
    __proto__: null,
    default: W0
}, Symbol.toStringTag, {
    value: "Module"
}))
  , I0 = J0(P0);
var ro, sm;
function ev() {
    return sm || (sm = 1,
    ro = typeof URL == "function" ? URL : I0.URL),
    ro
}
var rm;
function Ms() {
    if (rm)
        return zt;
    rm = 1;
    const i = ev();
    function a(Q, X, K) {
        if (X in Q)
            return Q[X];
        if (arguments.length === 3)
            return K;
        throw new Error('"' + X + '" is a required argument.')
    }
    zt.getArg = a;
    const r = (function() {
        return !("__proto__"in Object.create(null))
    }
    )();
    function u(Q) {
        return Q
    }
    function c(Q) {
        return d(Q) ? "$" + Q : Q
    }
    zt.toSetString = r ? u : c;
    function f(Q) {
        return d(Q) ? Q.slice(1) : Q
    }
    zt.fromSetString = r ? u : f;
    function d(Q) {
        if (!Q)
            return !1;
        const X = Q.length;
        if (X < 9 || Q.charCodeAt(X - 1) !== 95 || Q.charCodeAt(X - 2) !== 95 || Q.charCodeAt(X - 3) !== 111 || Q.charCodeAt(X - 4) !== 116 || Q.charCodeAt(X - 5) !== 111 || Q.charCodeAt(X - 6) !== 114 || Q.charCodeAt(X - 7) !== 112 || Q.charCodeAt(X - 8) !== 95 || Q.charCodeAt(X - 9) !== 95)
            return !1;
        for (let K = X - 10; K >= 0; K--)
            if (Q.charCodeAt(K) !== 36)
                return !1;
        return !0
    }
    function m(Q, X) {
        return Q === X ? 0 : Q === null ? 1 : X === null ? -1 : Q > X ? 1 : -1
    }
    function g(Q, X) {
        let K = Q.generatedLine - X.generatedLine;
        return K !== 0 || (K = Q.generatedColumn - X.generatedColumn,
        K !== 0) || (K = m(Q.source, X.source),
        K !== 0) || (K = Q.originalLine - X.originalLine,
        K !== 0) || (K = Q.originalColumn - X.originalColumn,
        K !== 0) ? K : m(Q.name, X.name)
    }
    zt.compareByGeneratedPositionsInflated = g;
    function p(Q) {
        return JSON.parse(Q.replace(/^\)]}'[^\n]*\n/, ""))
    }
    zt.parseSourceMapInput = p;
    const b = "http:"
      , v = `${b}//host`;
    function S(Q) {
        return X => {
            const K = D(X)
              , ne = A(X)
              , oe = new i(X,ne);
            Q(oe);
            const fe = oe.toString();
            return K === "absolute" ? fe : K === "scheme-relative" ? fe.slice(b.length) : K === "path-absolute" ? fe.slice(v.length) : G(ne, fe)
        }
    }
    function x(Q, X) {
        return new i(Q,X).toString()
    }
    function E(Q, X) {
        let K = 0;
        do {
            const ne = Q + K++;
            if (X.indexOf(ne) === -1)
                return ne
        } while (!0)
    }
    function A(Q) {
        const X = Q.split("..").length - 1
          , K = E("p", Q);
        let ne = `${v}/`;
        for (let oe = 0; oe < X; oe++)
            ne += `${K}/`;
        return ne
    }
    const _ = /^[A-Za-z0-9\+\-\.]+:/;
    function D(Q) {
        return Q[0] === "/" ? Q[1] === "/" ? "scheme-relative" : "path-absolute" : _.test(Q) ? "absolute" : "path-relative"
    }
    function G(Q, X) {
        typeof Q == "string" && (Q = new i(Q)),
        typeof X == "string" && (X = new i(X));
        const K = X.pathname.split("/")
          , ne = Q.pathname.split("/");
        for (ne.length > 0 && !ne[ne.length - 1] && ne.pop(); K.length > 0 && ne.length > 0 && K[0] === ne[0]; )
            K.shift(),
            ne.shift();
        return ne.map( () => "..").concat(K).join("/") + X.search + X.hash
    }
    const V = S(Q => {
        Q.pathname = Q.pathname.replace(/\/?$/, "/")
    }
    )
      , F = S(Q => {
        Q.href = new i(".",Q.toString()).toString()
    }
    )
      , W = S(Q => {}
    );
    zt.normalize = W;
    function ue(Q, X) {
        const K = D(X)
          , ne = D(Q);
        if (Q = V(Q),
        K === "absolute")
            return x(X, void 0);
        if (ne === "absolute")
            return x(X, Q);
        if (K === "scheme-relative")
            return W(X);
        if (ne === "scheme-relative")
            return x(X, x(Q, v)).slice(b.length);
        if (K === "path-absolute")
            return W(X);
        if (ne === "path-absolute")
            return x(X, x(Q, v)).slice(v.length);
        const oe = A(X + Q)
          , fe = x(X, x(Q, oe));
        return G(oe, fe)
    }
    zt.join = ue;
    function P(Q, X) {
        const K = ye(Q, X);
        return typeof K == "string" ? K : W(X)
    }
    zt.relative = P;
    function ye(Q, X) {
        if (D(Q) !== D(X))
            return null;
        const ne = A(Q + X)
          , oe = new i(Q,ne)
          , fe = new i(X,ne);
        try {
            new i("",fe.toString())
        } catch {
            return null
        }
        return fe.protocol !== oe.protocol || fe.user !== oe.user || fe.password !== oe.password || fe.hostname !== oe.hostname || fe.port !== oe.port ? null : G(oe, fe)
    }
    function Ce(Q, X, K) {
        Q && D(X) === "path-absolute" && (X = X.replace(/^\//, ""));
        let ne = W(X || "");
        return Q && (ne = ue(Q, ne)),
        K && (ne = ue(F(K), ne)),
        ne
    }
    return zt.computeSourceURL = Ce,
    zt
}
var uo = {}, um;
function Ng() {
    if (um)
        return uo;
    um = 1;
    class i {
        constructor() {
            this._array = [],
            this._set = new Map
        }
        static fromArray(r, u) {
            const c = new i;
            for (let f = 0, d = r.length; f < d; f++)
                c.add(r[f], u);
            return c
        }
        size() {
            return this._set.size
        }
        add(r, u) {
            const c = this.has(r)
              , f = this._array.length;
            (!c || u) && this._array.push(r),
            c || this._set.set(r, f)
        }
        has(r) {
            return this._set.has(r)
        }
        indexOf(r) {
            const u = this._set.get(r);
            if (u >= 0)
                return u;
            throw new Error('"' + r + '" is not in the set.')
        }
        at(r) {
            if (r >= 0 && r < this._array.length)
                return this._array[r];
            throw new Error("No element indexed by " + r)
        }
        toArray() {
            return this._array.slice()
        }
    }
    return uo.ArraySet = i,
    uo
}
var oo = {}, om;
function tv() {
    if (om)
        return oo;
    om = 1;
    const i = Ms();
    function a(u, c) {
        const f = u.generatedLine
          , d = c.generatedLine
          , m = u.generatedColumn
          , g = c.generatedColumn;
        return d > f || d == f && g >= m || i.compareByGeneratedPositionsInflated(u, c) <= 0
    }
    class r {
        constructor() {
            this._array = [],
            this._sorted = !0,
            this._last = {
                generatedLine: -1,
                generatedColumn: 0
            }
        }
        unsortedForEach(c, f) {
            this._array.forEach(c, f)
        }
        add(c) {
            a(this._last, c) ? (this._last = c,
            this._array.push(c)) : (this._sorted = !1,
            this._array.push(c))
        }
        toArray() {
            return this._sorted || (this._array.sort(i.compareByGeneratedPositionsInflated),
            this._sorted = !0),
            this._array
        }
    }
    return oo.MappingList = r,
    oo
}
var cm;
function Rg() {
    if (cm)
        return ao;
    cm = 1;
    const i = Ag()
      , a = Ms()
      , r = Ng().ArraySet
      , u = tv().MappingList;
    class c {
        constructor(d) {
            d || (d = {}),
            this._file = a.getArg(d, "file", null),
            this._sourceRoot = a.getArg(d, "sourceRoot", null),
            this._skipValidation = a.getArg(d, "skipValidation", !1),
            this._sources = new r,
            this._names = new r,
            this._mappings = new u,
            this._sourcesContents = null
        }
        static fromSourceMap(d) {
            const m = d.sourceRoot
              , g = new c({
                file: d.file,
                sourceRoot: m
            });
            return d.eachMapping(function(p) {
                const b = {
                    generated: {
                        line: p.generatedLine,
                        column: p.generatedColumn
                    }
                };
                p.source != null && (b.source = p.source,
                m != null && (b.source = a.relative(m, b.source)),
                b.original = {
                    line: p.originalLine,
                    column: p.originalColumn
                },
                p.name != null && (b.name = p.name)),
                g.addMapping(b)
            }),
            d.sources.forEach(function(p) {
                let b = p;
                m != null && (b = a.relative(m, p)),
                g._sources.has(b) || g._sources.add(b);
                const v = d.sourceContentFor(p);
                v != null && g.setSourceContent(p, v)
            }),
            g
        }
        addMapping(d) {
            const m = a.getArg(d, "generated")
              , g = a.getArg(d, "original", null);
            let p = a.getArg(d, "source", null)
              , b = a.getArg(d, "name", null);
            this._skipValidation || this._validateMapping(m, g, p, b),
            p != null && (p = String(p),
            this._sources.has(p) || this._sources.add(p)),
            b != null && (b = String(b),
            this._names.has(b) || this._names.add(b)),
            this._mappings.add({
                generatedLine: m.line,
                generatedColumn: m.column,
                originalLine: g && g.line,
                originalColumn: g && g.column,
                source: p,
                name: b
            })
        }
        setSourceContent(d, m) {
            let g = d;
            this._sourceRoot != null && (g = a.relative(this._sourceRoot, g)),
            m != null ? (this._sourcesContents || (this._sourcesContents = Object.create(null)),
            this._sourcesContents[a.toSetString(g)] = m) : this._sourcesContents && (delete this._sourcesContents[a.toSetString(g)],
            Object.keys(this._sourcesContents).length === 0 && (this._sourcesContents = null))
        }
        applySourceMap(d, m, g) {
            let p = m;
            if (m == null) {
                if (d.file == null)
                    throw new Error(`SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`);
                p = d.file
            }
            const b = this._sourceRoot;
            b != null && (p = a.relative(b, p));
            const v = this._mappings.toArray().length > 0 ? new r : this._sources
              , S = new r;
            this._mappings.unsortedForEach(function(x) {
                if (x.source === p && x.originalLine != null) {
                    const _ = d.originalPositionFor({
                        line: x.originalLine,
                        column: x.originalColumn
                    });
                    _.source != null && (x.source = _.source,
                    g != null && (x.source = a.join(g, x.source)),
                    b != null && (x.source = a.relative(b, x.source)),
                    x.originalLine = _.line,
                    x.originalColumn = _.column,
                    _.name != null && (x.name = _.name))
                }
                const E = x.source;
                E != null && !v.has(E) && v.add(E);
                const A = x.name;
                A != null && !S.has(A) && S.add(A)
            }, this),
            this._sources = v,
            this._names = S,
            d.sources.forEach(function(x) {
                const E = d.sourceContentFor(x);
                E != null && (g != null && (x = a.join(g, x)),
                b != null && (x = a.relative(b, x)),
                this.setSourceContent(x, E))
            }, this)
        }
        _validateMapping(d, m, g, p) {
            if (m && typeof m.line != "number" && typeof m.column != "number")
                throw new Error("original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values.");
            if (!(d && "line"in d && "column"in d && d.line > 0 && d.column >= 0 && !m && !g && !p)) {
                if (!(d && "line"in d && "column"in d && m && "line"in m && "column"in m && d.line > 0 && d.column >= 0 && m.line > 0 && m.column >= 0 && g))
                    throw new Error("Invalid mapping: " + JSON.stringify({
                        generated: d,
                        source: g,
                        original: m,
                        name: p
                    }))
            }
        }
        _serializeMappings() {
            let d = 0, m = 1, g = 0, p = 0, b = 0, v = 0, S = "", x, E, A, _;
            const D = this._mappings.toArray();
            for (let G = 0, V = D.length; G < V; G++) {
                if (E = D[G],
                x = "",
                E.generatedLine !== m)
                    for (d = 0; E.generatedLine !== m; )
                        x += ";",
                        m++;
                else if (G > 0) {
                    if (!a.compareByGeneratedPositionsInflated(E, D[G - 1]))
                        continue;
                    x += ","
                }
                x += i.encode(E.generatedColumn - d),
                d = E.generatedColumn,
                E.source != null && (_ = this._sources.indexOf(E.source),
                x += i.encode(_ - v),
                v = _,
                x += i.encode(E.originalLine - 1 - p),
                p = E.originalLine - 1,
                x += i.encode(E.originalColumn - g),
                g = E.originalColumn,
                E.name != null && (A = this._names.indexOf(E.name),
                x += i.encode(A - b),
                b = A)),
                S += x
            }
            return S
        }
        _generateSourcesContent(d, m) {
            return d.map(function(g) {
                if (!this._sourcesContents)
                    return null;
                m != null && (g = a.relative(m, g));
                const p = a.toSetString(g);
                return Object.prototype.hasOwnProperty.call(this._sourcesContents, p) ? this._sourcesContents[p] : null
            }, this)
        }
        toJSON() {
            const d = {
                version: this._version,
                sources: this._sources.toArray(),
                names: this._names.toArray(),
                mappings: this._serializeMappings()
            };
            return this._file != null && (d.file = this._file),
            this._sourceRoot != null && (d.sourceRoot = this._sourceRoot),
            this._sourcesContents && (d.sourcesContent = this._generateSourcesContent(d.sources, d.sourceRoot)),
            d
        }
        toString() {
            return JSON.stringify(this.toJSON())
        }
    }
    return c.prototype._version = 3,
    ao.SourceMapGenerator = c,
    ao
}
var Ya = {}, co = {}, fm;
function nv() {
    return fm || (fm = 1,
    (function(i) {
        i.GREATEST_LOWER_BOUND = 1,
        i.LEAST_UPPER_BOUND = 2;
        function a(r, u, c, f, d, m) {
            const g = Math.floor((u - r) / 2) + r
              , p = d(c, f[g], !0);
            return p === 0 ? g : p > 0 ? u - g > 1 ? a(g, u, c, f, d, m) : m === i.LEAST_UPPER_BOUND ? u < f.length ? u : -1 : g : g - r > 1 ? a(r, g, c, f, d, m) : m == i.LEAST_UPPER_BOUND ? g : r < 0 ? -1 : r
        }
        i.search = function(u, c, f, d) {
            if (c.length === 0)
                return -1;
            let m = a(-1, c.length, u, c, f, d || i.GREATEST_LOWER_BOUND);
            if (m < 0)
                return -1;
            for (; m - 1 >= 0 && f(c[m], c[m - 1], !0) === 0; )
                --m;
            return m
        }
    }
    )(co)),
    co
}
var Ss = {
    exports: {}
}, dm;
function Lg() {
    if (dm)
        return Ss.exports;
    dm = 1;
    let i = null;
    return Ss.exports = function() {
        if (typeof i == "string")
            return fetch(i).then(r => r.arrayBuffer());
        if (i instanceof ArrayBuffer)
            return Promise.resolve(i);
        throw new Error("You must provide the string URL or ArrayBuffer contents of lib/mappings.wasm by calling SourceMapConsumer.initialize({ 'lib/mappings.wasm': ... }) before using SourceMapConsumer")
    }
    ,
    Ss.exports.initialize = a => {
        i = a
    }
    ,
    Ss.exports
}
var fo, hm;
function lv() {
    if (hm)
        return fo;
    hm = 1;
    const i = Lg();
    function a() {
        this.generatedLine = 0,
        this.generatedColumn = 0,
        this.lastGeneratedColumn = null,
        this.source = null,
        this.originalLine = null,
        this.originalColumn = null,
        this.name = null
    }
    let r = null;
    return fo = function() {
        if (r)
            return r;
        const c = [];
        return r = i().then(f => WebAssembly.instantiate(f, {
            env: {
                mapping_callback(d, m, g, p, b, v, S, x, E, A) {
                    const _ = new a;
                    _.generatedLine = d + 1,
                    _.generatedColumn = m,
                    g && (_.lastGeneratedColumn = p - 1),
                    b && (_.source = v,
                    _.originalLine = S + 1,
                    _.originalColumn = x,
                    E && (_.name = A)),
                    c[c.length - 1](_)
                },
                start_all_generated_locations_for() {
                    console.time("all_generated_locations_for")
                },
                end_all_generated_locations_for() {
                    console.timeEnd("all_generated_locations_for")
                },
                start_compute_column_spans() {
                    console.time("compute_column_spans")
                },
                end_compute_column_spans() {
                    console.timeEnd("compute_column_spans")
                },
                start_generated_location_for() {
                    console.time("generated_location_for")
                },
                end_generated_location_for() {
                    console.timeEnd("generated_location_for")
                },
                start_original_location_for() {
                    console.time("original_location_for")
                },
                end_original_location_for() {
                    console.timeEnd("original_location_for")
                },
                start_parse_mappings() {
                    console.time("parse_mappings")
                },
                end_parse_mappings() {
                    console.timeEnd("parse_mappings")
                },
                start_sort_by_generated_location() {
                    console.time("sort_by_generated_location")
                },
                end_sort_by_generated_location() {
                    console.timeEnd("sort_by_generated_location")
                },
                start_sort_by_original_location() {
                    console.time("sort_by_original_location")
                },
                end_sort_by_original_location() {
                    console.timeEnd("sort_by_original_location")
                }
            }
        })).then(f => ({
            exports: f.instance.exports,
            withMappingCallback: (d, m) => {
                c.push(d);
                try {
                    m()
                } finally {
                    c.pop()
                }
            }
        })).then(null, f => {
            throw r = null,
            f
        }
        ),
        r
    }
    ,
    fo
}
var mm;
function av() {
    if (mm)
        return Ya;
    mm = 1;
    const i = Ms()
      , a = nv()
      , r = Ng().ArraySet;
    Ag();
    const u = Lg()
      , c = lv()
      , f = Symbol("smcInternal");
    class d {
        constructor(S, x) {
            return S == f ? Promise.resolve(this) : p(S, x)
        }
        static initialize(S) {
            u.initialize(S["lib/mappings.wasm"])
        }
        static fromSourceMap(S, x) {
            return b(S, x)
        }
        static async with(S, x, E) {
            const A = await new d(S,x);
            try {
                return await E(A)
            } finally {
                A.destroy()
            }
        }
        eachMapping(S, x, E) {
            throw new Error("Subclasses must implement eachMapping")
        }
        allGeneratedPositionsFor(S) {
            throw new Error("Subclasses must implement allGeneratedPositionsFor")
        }
        destroy() {
            throw new Error("Subclasses must implement destroy")
        }
    }
    d.prototype._version = 3,
    d.GENERATED_ORDER = 1,
    d.ORIGINAL_ORDER = 2,
    d.GREATEST_LOWER_BOUND = 1,
    d.LEAST_UPPER_BOUND = 2,
    Ya.SourceMapConsumer = d;
    class m extends d {
        constructor(S, x) {
            return super(f).then(E => {
                let A = S;
                typeof S == "string" && (A = i.parseSourceMapInput(S));
                const _ = i.getArg(A, "version")
                  , D = i.getArg(A, "sources").map(String)
                  , G = i.getArg(A, "names", [])
                  , V = i.getArg(A, "sourceRoot", null)
                  , F = i.getArg(A, "sourcesContent", null)
                  , W = i.getArg(A, "mappings")
                  , ue = i.getArg(A, "file", null)
                  , P = i.getArg(A, "x_google_ignoreList", null);
                if (_ != E._version)
                    throw new Error("Unsupported version: " + _);
                return E._sourceLookupCache = new Map,
                E._names = r.fromArray(G.map(String), !0),
                E._sources = r.fromArray(D, !0),
                E._absoluteSources = r.fromArray(E._sources.toArray().map(function(ye) {
                    return i.computeSourceURL(V, ye, x)
                }), !0),
                E.sourceRoot = V,
                E.sourcesContent = F,
                E._mappings = W,
                E._sourceMapURL = x,
                E.file = ue,
                E.x_google_ignoreList = P,
                E._computedColumnSpans = !1,
                E._mappingsPtr = 0,
                E._wasm = null,
                c().then(ye => (E._wasm = ye,
                E))
            }
            )
        }
        _findSourceIndex(S) {
            const x = this._sourceLookupCache.get(S);
            if (typeof x == "number")
                return x;
            const E = i.computeSourceURL(null, S, this._sourceMapURL);
            if (this._absoluteSources.has(E)) {
                const _ = this._absoluteSources.indexOf(E);
                return this._sourceLookupCache.set(S, _),
                _
            }
            const A = i.computeSourceURL(this.sourceRoot, S, this._sourceMapURL);
            if (this._absoluteSources.has(A)) {
                const _ = this._absoluteSources.indexOf(A);
                return this._sourceLookupCache.set(S, _),
                _
            }
            return -1
        }
        static fromSourceMap(S, x) {
            return new m(S.toString())
        }
        get sources() {
            return this._absoluteSources.toArray()
        }
        _getMappingsPtr() {
            return this._mappingsPtr === 0 && this._parseMappings(),
            this._mappingsPtr
        }
        _parseMappings() {
            const S = this._mappings
              , x = S.length
              , E = this._wasm.exports.allocate_mappings(x) >>> 0
              , A = new Uint8Array(this._wasm.exports.memory.buffer,E,x);
            for (let D = 0; D < x; D++)
                A[D] = S.charCodeAt(D);
            const _ = this._wasm.exports.parse_mappings(E);
            if (!_) {
                const D = this._wasm.exports.get_last_error();
                let G = `Error parsing mappings (code ${D}): `;
                switch (D) {
                case 1:
                    G += "the mappings contained a negative line, column, source index, or name index";
                    break;
                case 2:
                    G += "the mappings contained a number larger than 2**32";
                    break;
                case 3:
                    G += "reached EOF while in the middle of parsing a VLQ";
                    break;
                case 4:
                    G += "invalid base 64 character while parsing a VLQ";
                    break;
                default:
                    G += "unknown error code";
                    break
                }
                throw new Error(G)
            }
            this._mappingsPtr = _
        }
        eachMapping(S, x, E) {
            const A = x || null
              , _ = E || d.GENERATED_ORDER;
            this._wasm.withMappingCallback(D => {
                D.source !== null && (D.source = this._absoluteSources.at(D.source),
                D.name !== null && (D.name = this._names.at(D.name))),
                this._computedColumnSpans && D.lastGeneratedColumn === null && (D.lastGeneratedColumn = 1 / 0),
                S.call(A, D)
            }
            , () => {
                switch (_) {
                case d.GENERATED_ORDER:
                    this._wasm.exports.by_generated_location(this._getMappingsPtr());
                    break;
                case d.ORIGINAL_ORDER:
                    this._wasm.exports.by_original_location(this._getMappingsPtr());
                    break;
                default:
                    throw new Error("Unknown order of iteration.")
                }
            }
            )
        }
        allGeneratedPositionsFor(S) {
            let x = i.getArg(S, "source");
            const E = i.getArg(S, "line")
              , A = S.column || 0;
            if (x = this._findSourceIndex(x),
            x < 0)
                return [];
            if (E < 1)
                throw new Error("Line numbers must be >= 1");
            if (A < 0)
                throw new Error("Column numbers must be >= 0");
            const _ = [];
            return this._wasm.withMappingCallback(D => {
                let G = D.lastGeneratedColumn;
                this._computedColumnSpans && G === null && (G = 1 / 0),
                _.push({
                    line: D.generatedLine,
                    column: D.generatedColumn,
                    lastColumn: G
                })
            }
            , () => {
                this._wasm.exports.all_generated_locations_for(this._getMappingsPtr(), x, E - 1, "column"in S, A)
            }
            ),
            _
        }
        destroy() {
            this._mappingsPtr !== 0 && (this._wasm.exports.free_mappings(this._mappingsPtr),
            this._mappingsPtr = 0)
        }
        computeColumnSpans() {
            this._computedColumnSpans || (this._wasm.exports.compute_column_spans(this._getMappingsPtr()),
            this._computedColumnSpans = !0)
        }
        originalPositionFor(S) {
            const x = {
                generatedLine: i.getArg(S, "line"),
                generatedColumn: i.getArg(S, "column")
            };
            if (x.generatedLine < 1)
                throw new Error("Line numbers must be >= 1");
            if (x.generatedColumn < 0)
                throw new Error("Column numbers must be >= 0");
            let E = i.getArg(S, "bias", d.GREATEST_LOWER_BOUND);
            E == null && (E = d.GREATEST_LOWER_BOUND);
            let A;
            if (this._wasm.withMappingCallback(_ => A = _, () => {
                this._wasm.exports.original_location_for(this._getMappingsPtr(), x.generatedLine - 1, x.generatedColumn, E)
            }
            ),
            A && A.generatedLine === x.generatedLine) {
                let _ = i.getArg(A, "source", null);
                _ !== null && (_ = this._absoluteSources.at(_));
                let D = i.getArg(A, "name", null);
                return D !== null && (D = this._names.at(D)),
                {
                    source: _,
                    line: i.getArg(A, "originalLine", null),
                    column: i.getArg(A, "originalColumn", null),
                    name: D
                }
            }
            return {
                source: null,
                line: null,
                column: null,
                name: null
            }
        }
        hasContentsOfAllSources() {
            return this.sourcesContent ? this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(S) {
                return S == null
            }) : !1
        }
        sourceContentFor(S, x) {
            if (!this.sourcesContent)
                return null;
            const E = this._findSourceIndex(S);
            if (E >= 0)
                return this.sourcesContent[E];
            if (x)
                return null;
            throw new Error('"' + S + '" is not in the SourceMap.')
        }
        generatedPositionFor(S) {
            let x = i.getArg(S, "source");
            if (x = this._findSourceIndex(x),
            x < 0)
                return {
                    line: null,
                    column: null,
                    lastColumn: null
                };
            const E = {
                source: x,
                originalLine: i.getArg(S, "line"),
                originalColumn: i.getArg(S, "column")
            };
            if (E.originalLine < 1)
                throw new Error("Line numbers must be >= 1");
            if (E.originalColumn < 0)
                throw new Error("Column numbers must be >= 0");
            let A = i.getArg(S, "bias", d.GREATEST_LOWER_BOUND);
            A == null && (A = d.GREATEST_LOWER_BOUND);
            let _;
            if (this._wasm.withMappingCallback(D => _ = D, () => {
                this._wasm.exports.generated_location_for(this._getMappingsPtr(), E.source, E.originalLine - 1, E.originalColumn, A)
            }
            ),
            _ && _.source === E.source) {
                let D = _.lastGeneratedColumn;
                return this._computedColumnSpans && D === null && (D = 1 / 0),
                {
                    line: i.getArg(_, "generatedLine", null),
                    column: i.getArg(_, "generatedColumn", null),
                    lastColumn: D
                }
            }
            return {
                line: null,
                column: null,
                lastColumn: null
            }
        }
    }
    m.prototype.consumer = d,
    Ya.BasicSourceMapConsumer = m;
    class g extends d {
        constructor(S, x) {
            return super(f).then(E => {
                let A = S;
                typeof S == "string" && (A = i.parseSourceMapInput(S));
                const _ = i.getArg(A, "version")
                  , D = i.getArg(A, "sections");
                if (_ != E._version)
                    throw new Error("Unsupported version: " + _);
                let G = {
                    line: -1,
                    column: 0
                };
                return Promise.all(D.map(V => {
                    if (V.url)
                        throw new Error("Support for url field in sections not implemented.");
                    const F = i.getArg(V, "offset")
                      , W = i.getArg(F, "line")
                      , ue = i.getArg(F, "column");
                    if (W < G.line || W === G.line && ue < G.column)
                        throw new Error("Section offsets must be ordered and non-overlapping.");
                    return G = F,
                    new d(i.getArg(V, "map"),x).then(ye => ({
                        generatedOffset: {
                            generatedLine: W + 1,
                            generatedColumn: ue + 1
                        },
                        consumer: ye
                    }))
                }
                )).then(V => (E._sections = V,
                E))
            }
            )
        }
        get sources() {
            const S = [];
            for (let x = 0; x < this._sections.length; x++)
                for (let E = 0; E < this._sections[x].consumer.sources.length; E++)
                    S.push(this._sections[x].consumer.sources[E]);
            return S
        }
        originalPositionFor(S) {
            const x = {
                generatedLine: i.getArg(S, "line"),
                generatedColumn: i.getArg(S, "column")
            }
              , E = a.search(x, this._sections, function(_, D) {
                const G = _.generatedLine - D.generatedOffset.generatedLine;
                return G || _.generatedColumn - (D.generatedOffset.generatedColumn - 1)
            })
              , A = this._sections[E];
            return A ? A.consumer.originalPositionFor({
                line: x.generatedLine - (A.generatedOffset.generatedLine - 1),
                column: x.generatedColumn - (A.generatedOffset.generatedLine === x.generatedLine ? A.generatedOffset.generatedColumn - 1 : 0),
                bias: S.bias
            }) : {
                source: null,
                line: null,
                column: null,
                name: null
            }
        }
        hasContentsOfAllSources() {
            return this._sections.every(function(S) {
                return S.consumer.hasContentsOfAllSources()
            })
        }
        sourceContentFor(S, x) {
            for (let E = 0; E < this._sections.length; E++) {
                const _ = this._sections[E].consumer.sourceContentFor(S, !0);
                if (_)
                    return _
            }
            if (x)
                return null;
            throw new Error('"' + S + '" is not in the SourceMap.')
        }
        _findSectionIndex(S) {
            for (let x = 0; x < this._sections.length; x++) {
                const {consumer: E} = this._sections[x];
                if (E._findSourceIndex(S) !== -1)
                    return x
            }
            return -1
        }
        generatedPositionFor(S) {
            const x = this._findSectionIndex(i.getArg(S, "source"))
              , E = x >= 0 ? this._sections[x] : null
              , A = x >= 0 && x + 1 < this._sections.length ? this._sections[x + 1] : null
              , _ = E && E.consumer.generatedPositionFor(S);
            if (_ && _.line !== null) {
                const D = E.generatedOffset.generatedLine - 1
                  , G = E.generatedOffset.generatedColumn - 1;
                return _.line === 1 && (_.column += G,
                typeof _.lastColumn == "number" && (_.lastColumn += G)),
                _.lastColumn === 1 / 0 && A && _.line === A.generatedOffset.generatedLine && (_.lastColumn = A.generatedOffset.generatedColumn - 2),
                _.line += D,
                _
            }
            return {
                line: null,
                column: null,
                lastColumn: null
            }
        }
        allGeneratedPositionsFor(S) {
            const x = this._findSectionIndex(i.getArg(S, "source"))
              , E = x >= 0 ? this._sections[x] : null
              , A = x >= 0 && x + 1 < this._sections.length ? this._sections[x + 1] : null;
            return E ? E.consumer.allGeneratedPositionsFor(S).map(_ => {
                const D = E.generatedOffset.generatedLine - 1
                  , G = E.generatedOffset.generatedColumn - 1;
                return _.line === 1 && (_.column += G,
                typeof _.lastColumn == "number" && (_.lastColumn += G)),
                _.lastColumn === 1 / 0 && A && _.line === A.generatedOffset.generatedLine && (_.lastColumn = A.generatedOffset.generatedColumn - 2),
                _.line += D,
                _
            }
            ) : []
        }
        eachMapping(S, x, E) {
            this._sections.forEach( (A, _) => {
                const D = _ + 1 < this._sections.length ? this._sections[_ + 1] : null
                  , {generatedOffset: G} = A
                  , V = G.generatedLine - 1
                  , F = G.generatedColumn - 1;
                A.consumer.eachMapping(function(W) {
                    W.generatedLine === 1 && (W.generatedColumn += F,
                    typeof W.lastGeneratedColumn == "number" && (W.lastGeneratedColumn += F)),
                    W.lastGeneratedColumn === 1 / 0 && D && W.generatedLine === D.generatedOffset.generatedLine && (W.lastGeneratedColumn = D.generatedOffset.generatedColumn - 2),
                    W.generatedLine += V,
                    S.call(this, W)
                }, x, E)
            }
            )
        }
        computeColumnSpans() {
            for (let S = 0; S < this._sections.length; S++)
                this._sections[S].consumer.computeColumnSpans()
        }
        destroy() {
            for (let S = 0; S < this._sections.length; S++)
                this._sections[S].consumer.destroy()
        }
    }
    Ya.IndexedSourceMapConsumer = g;
    function p(v, S) {
        let x = v;
        typeof v == "string" && (x = i.parseSourceMapInput(v));
        const E = x.sections != null ? new g(x,S) : new m(x,S);
        return Promise.resolve(E)
    }
    function b(v, S) {
        return m.fromSourceMap(v, S)
    }
    return Ya
}
var ho = {}, gm;
function iv() {
    if (gm)
        return ho;
    gm = 1;
    const i = Rg().SourceMapGenerator
      , a = Ms()
      , r = /(\r?\n)/
      , u = 10
      , c = "$$$isSourceNode$$$";
    class f {
        constructor(m, g, p, b, v) {
            this.children = [],
            this.sourceContents = {},
            this.line = m ?? null,
            this.column = g ?? null,
            this.source = p ?? null,
            this.name = v ?? null,
            this[c] = !0,
            b != null && this.add(b)
        }
        static fromStringWithSourceMap(m, g, p) {
            const b = new f
              , v = m.split(r);
            let S = 0;
            const x = function() {
                const V = W()
                  , F = W() || "";
                return V + F;
                function W() {
                    return S < v.length ? v[S++] : void 0
                }
            };
            let E = 1, A = 0, _ = null, D;
            return g.eachMapping(function(V) {
                if (_ !== null)
                    if (E < V.generatedLine)
                        G(_, x()),
                        E++,
                        A = 0;
                    else {
                        D = v[S] || "";
                        const F = D.substr(0, V.generatedColumn - A);
                        v[S] = D.substr(V.generatedColumn - A),
                        A = V.generatedColumn,
                        G(_, F),
                        _ = V;
                        return
                    }
                for (; E < V.generatedLine; )
                    b.add(x()),
                    E++;
                A < V.generatedColumn && (D = v[S] || "",
                b.add(D.substr(0, V.generatedColumn)),
                v[S] = D.substr(V.generatedColumn),
                A = V.generatedColumn),
                _ = V
            }, this),
            S < v.length && (_ && G(_, x()),
            b.add(v.splice(S).join(""))),
            g.sources.forEach(function(V) {
                const F = g.sourceContentFor(V);
                F != null && (p != null && (V = a.join(p, V)),
                b.setSourceContent(V, F))
            }),
            b;
            function G(V, F) {
                if (V === null || V.source === void 0)
                    b.add(F);
                else {
                    const W = p ? a.join(p, V.source) : V.source;
                    b.add(new f(V.originalLine,V.originalColumn,W,F,V.name))
                }
            }
        }
        add(m) {
            if (Array.isArray(m))
                m.forEach(function(g) {
                    this.add(g)
                }, this);
            else if (m[c] || typeof m == "string")
                m && this.children.push(m);
            else
                throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + m);
            return this
        }
        prepend(m) {
            if (Array.isArray(m))
                for (let g = m.length - 1; g >= 0; g--)
                    this.prepend(m[g]);
            else if (m[c] || typeof m == "string")
                this.children.unshift(m);
            else
                throw new TypeError("Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + m);
            return this
        }
        walk(m) {
            let g;
            for (let p = 0, b = this.children.length; p < b; p++)
                g = this.children[p],
                g[c] ? g.walk(m) : g !== "" && m(g, {
                    source: this.source,
                    line: this.line,
                    column: this.column,
                    name: this.name
                })
        }
        join(m) {
            let g, p;
            const b = this.children.length;
            if (b > 0) {
                for (g = [],
                p = 0; p < b - 1; p++)
                    g.push(this.children[p]),
                    g.push(m);
                g.push(this.children[p]),
                this.children = g
            }
            return this
        }
        replaceRight(m, g) {
            const p = this.children[this.children.length - 1];
            return p[c] ? p.replaceRight(m, g) : typeof p == "string" ? this.children[this.children.length - 1] = p.replace(m, g) : this.children.push("".replace(m, g)),
            this
        }
        setSourceContent(m, g) {
            this.sourceContents[a.toSetString(m)] = g
        }
        walkSourceContents(m) {
            for (let p = 0, b = this.children.length; p < b; p++)
                this.children[p][c] && this.children[p].walkSourceContents(m);
            const g = Object.keys(this.sourceContents);
            for (let p = 0, b = g.length; p < b; p++)
                m(a.fromSetString(g[p]), this.sourceContents[g[p]])
        }
        toString() {
            let m = "";
            return this.walk(function(g) {
                m += g
            }),
            m
        }
        toStringWithSourceMap(m) {
            const g = {
                code: "",
                line: 1,
                column: 0
            }
              , p = new i(m);
            let b = !1
              , v = null
              , S = null
              , x = null
              , E = null;
            return this.walk(function(A, _) {
                g.code += A,
                _.source !== null && _.line !== null && _.column !== null ? ((v !== _.source || S !== _.line || x !== _.column || E !== _.name) && p.addMapping({
                    source: _.source,
                    original: {
                        line: _.line,
                        column: _.column
                    },
                    generated: {
                        line: g.line,
                        column: g.column
                    },
                    name: _.name
                }),
                v = _.source,
                S = _.line,
                x = _.column,
                E = _.name,
                b = !0) : b && (p.addMapping({
                    generated: {
                        line: g.line,
                        column: g.column
                    }
                }),
                v = null,
                b = !1);
                for (let D = 0, G = A.length; D < G; D++)
                    A.charCodeAt(D) === u ? (g.line++,
                    g.column = 0,
                    D + 1 === G ? (v = null,
                    b = !1) : b && p.addMapping({
                        source: _.source,
                        original: {
                            line: _.line,
                            column: _.column
                        },
                        generated: {
                            line: g.line,
                            column: g.column
                        },
                        name: _.name
                    })) : g.column++
            }),
            this.walkSourceContents(function(A, _) {
                p.setSourceContent(A, _)
            }),
            {
                code: g.code,
                map: p
            }
        }
    }
    return ho.SourceNode = f,
    ho
}
var pm;
function sv() {
    return pm || (pm = 1,
    Ga.SourceMapGenerator = Rg().SourceMapGenerator,
    Ga.SourceMapConsumer = av().SourceMapConsumer,
    Ga.SourceNode = iv().SourceNode),
    Ga
}
var jo = sv();
function rv(i, a, r) {
    const u = i[a];
    if (!u)
        return {
            lineIndex: a,
            column: r
        };
    const c = u.trim()
      , f = /^<\/[A-Za-z][A-Za-z0-9\-_.]*\s*>$/.test(c)
      , d = /<\/[A-Za-z][A-Za-z0-9\-_.]*\s*>$/.test(c);
    let m = !1;
    if (r != null) {
        const g = u.substring(0, r);
        m = /<\/[A-Za-z][A-Za-z0-9\-_.]*\s*>$/.test(g)
    }
    if (f || d || m) {
        if (r != null) {
            const g = u.substring(r)
              , p = g.match(/<([A-Za-z][A-Za-z0-9\-_.]*)/);
            if (p && g[p.index + 1] !== "/")
                return {
                    lineIndex: a,
                    column: r + p.index + 1
                }
        }
        for (let g = a + 1; g < i.length && g < a + 50; g++) {
            const p = i[g]
              , b = p.match(/<([A-Za-z][A-Za-z0-9\-_.]*)/);
            if (b && p[b.index + 1] !== "/")
                return {
                    lineIndex: g,
                    column: b.index + 1
                }
        }
    }
    return {
        lineIndex: a,
        column: r
    }
}
function Vo(i, a, r) {
    let u = 0;
    for (let c = a; c < i.length; c++) {
        const f = i[c]
          , d = c === a ? r : 0;
        for (let m = d; m < f.length; m++) {
            const g = f[m];
            if (g === "{")
                u++;
            else if (g === "}")
                u--;
            else if (u === 0) {
                if (g === "/" && f[m + 1] === ">")
                    return {
                        lineIndex: c,
                        columnEnd: m + 2,
                        isSelfClosing: !0
                    };
                if (g === ">")
                    return {
                        lineIndex: c,
                        columnEnd: m + 1,
                        isSelfClosing: !1
                    }
            }
        }
    }
}
function jg(i, a, r, u) {
    let c = 1;
    const f = new RegExp(`<${a}(?=\\s|>|/>)`,"g")
      , d = new RegExp(`</${a}\\s*>`,"g");
    for (let m = r; m < i.length; m++) {
        const g = m === r ? u : 0
          , p = i[m].substring(g)
          , b = [];
        let v;
        for (f.lastIndex = 0; (v = f.exec(p)) !== null; ) {
            const S = Vo([p], 0, v.index + v[0].length);
            S && !S.isSelfClosing && b.push({
                type: "open",
                index: v.index,
                length: v[0].length
            })
        }
        for (d.lastIndex = 0; (v = d.exec(p)) !== null; )
            b.push({
                type: "close",
                index: v.index,
                length: v[0].length
            });
        b.sort( (S, x) => S.index - x.index);
        for (const S of b)
            if (S.type === "open")
                c++;
            else if (S.type === "close" && (c--,
            c === 0))
                return {
                    lineIndex: m,
                    columnEnd: g + S.index + S.length
                }
    }
}
function ym(i, a, r) {
    let u;
    for (let c = a; c >= 0; c--) {
        const f = i[c]
          , d = /<([A-Za-z][A-Za-z0-9\-_.]*)/g;
        let m;
        for (; (m = d.exec(f)) !== null; ) {
            const g = m.index
              , p = m[1];
            if (f[g + 1] === "/" || !(c < a || c === a && g <= (r ?? f.length)))
                continue;
            const v = g + m[0].length
              , S = Vo(i, c, v);
            if (!S)
                continue;
            let x = c
              , E = S.columnEnd;
            if (!S.isSelfClosing) {
                const _ = jg(i, p, c, S.columnEnd);
                if (!_)
                    continue;
                x = _.lineIndex,
                E = _.columnEnd
            }
            (c < a || c === a && g <= (r ?? f.length)) && (x > a || x === a && E >= (r ?? 0)) && (!u || x - c < u.closeLineIndex - u.lineIndex || x - c === u.closeLineIndex - u.lineIndex && E - g < u.closeColumnEnd - u.columnStart) && (u = {
                tagName: p,
                lineIndex: c,
                columnStart: g,
                columnEnd: S.columnEnd,
                isSelfClosing: S.isSelfClosing,
                closeLineIndex: x,
                closeColumnEnd: E
            })
        }
    }
    return u
}
function uv(i, a, r) {
    const u = new RegExp(`<(${r})(?=\\s|>|/>)`,"i");
    for (let c = a + 1; c < i.length && c < a + 50; c++) {
        const f = i[c]
          , d = u.exec(f);
        if (d) {
            const m = d.index
              , g = d[1]
              , p = m + d[0].length
              , b = Vo(i, c, p);
            if (!b)
                continue;
            let v = c
              , S = b.columnEnd;
            if (!b.isSelfClosing) {
                const x = jg(i, g, c, b.columnEnd);
                if (!x)
                    continue;
                v = x.lineIndex,
                S = x.columnEnd
            }
            return {
                tagName: g,
                lineIndex: c,
                columnStart: m,
                columnEnd: b.columnEnd,
                isSelfClosing: b.isSelfClosing,
                closeLineIndex: v,
                closeColumnEnd: S
            }
        }
    }
}
function ov(i, a, r, u, c) {
    if (a === u)
        return i[a].substring(r, c);
    let f = i[a].substring(r);
    for (let d = a + 1; d < u; d++)
        f += `
` + i[d];
    return f += `
` + i[u].substring(0, c),
    f
}
function cv(i, a, r=10) {
    const u = i.split(`
`)
      , c = Math.max(0, a - r - 1)
      , f = Math.min(u.length - 1, a + r - 1)
      , d = [];
    for (let m = c; m <= f; m++) {
        const g = m + 1
          , v = `${g === a ? ">>>" : "   "} ${g.toString().padStart(4, " ")} | ${u[m] || ""}`;
        d.push(v)
    }
    return d.join(`
`)
}
async function fv(i) {
    try {
        const a = await fetch(i);
        if (!a.ok)
            throw new Error(`Failed to load source map: ${a.status}`);
        return await a.json()
    } catch (a) {
        const r = a instanceof Error ? a.message : String(a);
        console.warn("Error loading source map from", i, r)
    }
}
let mo = !1;
const Ql = new Map
  , dv = 300 * 1e3
  , hv = 1e3;
setInterval( () => {
    const i = Date.now();
    for (const [a,r] of Ql.entries())
        i - r.timestamp > dv && Ql.delete(a)
}
, 6e4);
async function mv() {
    if (!mo)
        try {
            await jo.SourceMapConsumer.initialize({
                "lib/mappings.wasm": "https://unpkg.com/source-map@0.7.6/lib/mappings.wasm"
            }),
            mo = !0
        } catch (i) {
            console.warn("Failed to initialize SourceMapConsumer:", i);
            try {
                await jo.SourceMapConsumer.initialize({}),
                mo = !0
            } catch (a) {
                throw console.error("SourceMapConsumer initialization failed completely:", a),
                a
            }
        }
}
function gv(i) {
    if (!i || !i.stack)
        return `no-stack-${i?.message || "unknown"}`;
    const u = i.stack.split(`
`).slice(0, 6).map(c => c.replace(/\?t=\d+/g, "").replace(/\?v=[\w\d]+/g, "").replace(/\d{13,}/g, "TIMESTAMP"));
    return `${i.name || "Error"}-${i.message}-${u.join("|")}`
}
const pv = "preview-inject/";
async function Za(i, a=10, r) {
    if (!i || !i.stack)
        return {
            errorMessage: i?.message || "",
            mappedStack: i?.stack || "",
            sourceContext: []
        };
    const u = gv(i);
    if (Ql.has(u)) {
        const v = Ql.get(u);
        return console.log("Using cached error mapping for:", u),
        v
    }
    if (Ql.size >= hv)
        return null;
    await mv();
    const c = i.stack.split(`
`)
      , f = []
      , d = []
      , m = new Map
      , g = new Map;
    let p = 0;
    for (const v of c) {
        const S = v.match(/at\s+(.+?)\s+\((.+?):(\d+):(\d+)\)|at\s+(.+?):(\d+):(\d+)|([^@]*)@(.+?):(\d+):(\d+)/);
        if (!S) {
            f.push(v);
            continue
        }
        let x, E, A, _;
        S[1] ? (x = S[1],
        E = S[2],
        A = parseInt(S[3]),
        _ = parseInt(S[4])) : S[5] ? (x = "<anonymous>",
        E = S[5],
        A = parseInt(S[6]),
        _ = parseInt(S[7])) : (x = S[8],
        E = S[9],
        A = parseInt(S[10]),
        _ = parseInt(S[11]));
        try {
            const D = `${E}.map`;
            let G = m.get(D);
            if (!G) {
                const F = await fv(D);
                G = await new jo.SourceMapConsumer(F),
                m.set(D, G)
            }
            const V = G.originalPositionFor({
                line: A,
                column: _
            });
            if (V.source) {
                if (V.source.includes(pv))
                    continue;
                const F = V.source.split("/").filter(P => P !== "..").join("/")
                  , ue = `    at ${V.name || x} (${F}:${V.line}:${V.column})`;
                if (f.push(ue),
                V.line && V.column && p < a) {
                    p++;
                    try {
                        const P = await yv(G, V.source, g);
                        if (P) {
                            const ye = F.includes("node_modules")
                              , Ce = /\.(tsx|jsx)$/.test(F);
                            let Q;
                            if (!ye && Ce) {
                                const K = vv(P, V.line, V.column, r);
                                K && (Q = {
                                    tagName: K.tagName,
                                    code: K.code,
                                    context: K.context,
                                    startLine: K.startLine,
                                    endLine: K.endLine
                                })
                            }
                            const X = cv(P, V.line, ye ? 1 : 10);
                            d.push({
                                file: F,
                                line: V.line,
                                column: V.column,
                                context: X,
                                closedBlock: Q
                            })
                        }
                    } catch (P) {
                        console.warn("Failed to extract source context:", P)
                    }
                }
            } else
                f.push(v)
        } catch (D) {
            console.warn("Failed to map stack line:", v, D),
            f.push(v)
        }
    }
    for (const v of m.values())
        v.destroy();
    const b = {
        errorMessage: i?.message || "",
        mappedStack: f.join(`
`),
        sourceContext: d
    };
    return b.timestamp = Date.now(),
    Ql.set(u, b),
    b
}
async function yv(i, a, r) {
    if (r.has(a))
        return r.get(a) || null;
    const u = i.sourceContentFor(a);
    return u ? (r.set(a, u),
    u) : null
}
function vv(i, a, r, u) {
    const c = i.split(`
`);
    let f = a - 1;
    if (f < 0 || f >= c.length)
        return;
    let d = ym(c, f, r);
    if (u && d) {
        const x = u.toLowerCase()
          , E = d.tagName.toLowerCase();
        if (x !== E) {
            const A = uv(c, f, x);
            A && (d = A)
        }
    } else if (!d) {
        const x = rv(c, f, r);
        d = ym(c, x.lineIndex, x.column)
    }
    if (!d)
        return;
    const {tagName: m, lineIndex: g, columnStart: p, closeLineIndex: b, closeColumnEnd: v, isSelfClosing: S} = d;
    return {
        tagName: m,
        code: ov(c, g, p, b, v),
        context: c.slice(g, b + 1).join(`
`),
        startLine: g + 1,
        endLine: b + 1,
        isSelfClosing: S
    }
}
class bv {
    client;
    originalConsoleError;
    constructor() {
        const a = B0();
        a.length > 0 && a.forEach(r => {
            r.type === "console.error" ? this.handleConsoleError(r.args) : r.type === "runtime" && this.handleError(r.args)
        }
        ),
        this.client = new Xl(window.parent),
        this.originalConsoleError = console.error,
        this.initErrorHandlers()
    }
    initErrorHandlers() {
        window.addEventListener("error", this.handleError.bind(this)),
        window.addEventListener("unhandledrejection", this.handlePromiseRejection.bind(this)),
        this.interceptConsoleError()
    }
    async handleError(a) {
        const r = a.target;
        if (!(r && r instanceof HTMLElement && r.tagName && ["IMG", "SCRIPT", "LINK", "VIDEO", "AUDIO", "SOURCE", "IFRAME"].includes(r.tagName)) && a.error && a.error.stack)
            try {
                const u = await Za(a.error);
                this.sendError(u)
            } catch (u) {
                console.warn("Failed to map error stack:", u)
            }
    }
    async handlePromiseRejection(a) {
        const r = a.reason instanceof Error ? a.reason : new Error(String(a.reason));
        if (r.stack)
            try {
                const u = await Za(r);
                this.sendError(u)
            } catch (u) {
                console.warn("Failed to map promise rejection stack:", u)
            }
    }
    interceptConsoleError() {
        console.error = (...a) => {
            this.originalConsoleError.apply(console, a);
            const r = a.find(u => u instanceof Error);
            if (r && r.stack)
                this.handleConsoleError(r);
            else if (a.length > 0) {
                const u = a.map(f => typeof f == "object" ? JSON.stringify(f) : String(f)).join(" ")
                  , c = new Error(u);
                this.handleConsoleError(c)
            }
        }
    }
    async handleConsoleError(a) {
        try {
            const r = await Za(a);
            this.sendError(r)
        } catch (r) {
            console.warn("Failed to map console error stack:", r)
        }
    }
    reportError(a) {
        this.handleReactError(a)
    }
    async handleReactError(a) {
        try {
            const r = await Za(a);
            this.sendError(r)
        } catch (r) {
            console.warn("Failed to map React error stack:", r)
        }
    }
    async sendError(a) {
        if (!a) {
            console.warn("error is too many");
            return
        }
        if (a.sourceContext.length !== 0)
            try {
                await this.client.post("runtime-error", a)
            } catch (r) {
                console.warn("Failed to send error to parent:", r)
            }
    }
    destroy() {
        console.error = this.originalConsoleError,
        this.client.destroy()
    }
}
function xv() {
    const i = new bv;
    return window.runtimeErrorCollector = i,
    i
}
class Sv {
    _client;
    constructor() {
        this._client = new Xl(window.parent),
        this._domContentLoadedListener()
    }
    _domContentLoadedListener() {
        const a = () => {
            console.log("DOMContentLoaded"),
            this._client.post("DOMContentLoaded"),
            document.removeEventListener("DOMContentLoaded", a)
        }
        ;
        document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", a) : (console.log("DOMContentLoaded"),
        this._client.post("DOMContentLoaded"))
    }
}
function Ev() {
    return new Sv
}
const Qo = i => {
    const a = "/preview/77c4cc08-a436-49c8-b40f-f3c523d34553/7315782";
    return i.startsWith(a) ? i.replaceAll(a, "") || "/" : i || "/"
}
  , wv = "modulepreload"
  , _v = function(i) {
    return "/preview/77c4cc08-a436-49c8-b40f-f3c523d34553/7315782/" + i
}
  , vm = {}
  , Dg = function(a, r, u) {
    let c = Promise.resolve();
    if (r && r.length > 0) {
        let p = function(b) {
            return Promise.all(b.map(v => Promise.resolve(v).then(S => ({
                status: "fulfilled",
                value: S
            }), S => ({
                status: "rejected",
                reason: S
            }))))
        };
        var d = p;
        document.getElementsByTagName("link");
        const m = document.querySelector("meta[property=csp-nonce]")
          , g = m?.nonce || m?.getAttribute("nonce");
        c = p(r.map(b => {
            if (b = _v(b),
            b in vm)
                return;
            vm[b] = !0;
            const v = b.endsWith(".css")
              , S = v ? '[rel="stylesheet"]' : "";
            if (document.querySelector(`link[href="${b}"]${S}`))
                return;
            const x = document.createElement("link");
            if (x.rel = v ? "stylesheet" : wv,
            v || (x.as = "script"),
            x.crossOrigin = "",
            x.href = b,
            g && x.setAttribute("nonce", g),
            document.head.appendChild(x),
            v)
                return new Promise( (E, A) => {
                    x.addEventListener("load", E),
                    x.addEventListener("error", () => A(new Error(`Unable to preload CSS for ${b}`)))
                }
                )
        }
        ))
    }
    function f(m) {
        const g = new Event("vite:preloadError",{
            cancelable: !0
        });
        if (g.payload = m,
        window.dispatchEvent(g),
        !g.defaultPrevented)
            throw m
    }
    return c.then(m => {
        for (const g of m || [])
            g.status === "rejected" && f(g.reason);
        return a().catch(f)
    }
    )
};
async function Cv() {
    await await Dg( () => Promise.resolve().then( () => Mx), []).then(a => a.navigatePromise).catch(a => (console.error(a),
    Promise.resolve( () => {}
    ))),
    window.REACT_APP_ROUTER = {
        push: (a, r) => {
            window.REACT_APP_NAVIGATE(a, r)
        }
        ,
        replace: (a, r, u) => {
            window.REACT_APP_NAVIGATE(a, {
                replace: !0,
                ...u
            })
        }
        ,
        forward: () => {
            window.REACT_APP_NAVIGATE(1)
        }
        ,
        back: () => {
            window.REACT_APP_NAVIGATE(-1)
        }
        ,
        refresh: () => {
            window.REACT_APP_NAVIGATE(0)
        }
        ,
        prefetch: (a, r) => {
            window.REACT_APP_NAVIGATE(a, r)
        }
    }
}
const Mg = new Promise(i => {
    Cv().then( () => {
        i(window.REACT_APP_ROUTER)
    }
    )
}
)
  , ko = () => window.REACT_APP_ROUTER
  , Xo = new Xl(window.parent)
  , Do = async (i, a) => {
    await Xo.post("routeWillChange", {
        next: Qo(i)
    }, a)
}
;
function Tv(i) {
    const a = document.querySelector(i);
    a && a.scrollIntoView({
        behavior: "smooth"
    })
}
function Ov() {
    const i = window.open;
    return window.open = function(a, r, u) {
        return a && typeof a == "string" && a.startsWith("#") ? (Tv(a),
        null) : (i(a, "_blank", u),
        null)
    }
    ,
    () => {
        window.open = i
    }
}
function Av() {
    const i = async a => {
        const u = a.target.closest("a");
        if (!u || u.tagName !== "A")
            return;
        const c = u.getAttribute("href");
        if (c && !["#", "javascript:void(0)", ""].includes(c) && !c.startsWith("#")) {
            if (a.preventDefault(),
            c.startsWith("/")) {
                const f = ko();
                await Do(c, {
                    timeout: 500
                });
                const d = Qo(c);
                f.push(d);
                return
            }
            window.open(u.href, "_blank")
        }
    }
    ;
    return window.addEventListener("click", i, !0),
    () => {
        window.removeEventListener("click", i, !0)
    }
}
const bm = i => i.startsWith("http://") || i.startsWith("https://");
function Nv(i) {
    return !i || typeof i != "string" ? !1 : i.indexOf("accounts.google.com") !== -1 || i.indexOf("googleapis.com/oauth") !== -1 || i.indexOf("/auth/") !== -1 && i.indexOf("provider=google") !== -1
}
function Rv() {
    const i = () => {
        const a = ko()
          , r = a.push;
        a.push = async function(c, f, d) {
            return bm(c) ? (window.open(c, "_blank"),
            Promise.resolve(!1)) : (await Do(c, {
                timeout: 500
            }),
            r.call(this, c, f, d))
        }
        ;
        const u = a.replace;
        a.replace = async function(c, f, d) {
            return bm(c) ? (window.open(c, "_blank"),
            Promise.resolve(!1)) : (await Do(c, {
                timeout: 500
            }),
            u.call(this, c, f, d))
        }
    }
    ;
    return window.addEventListener("load", i),
    () => {
        window.removeEventListener("load", i)
    }
}
function Lv() {
    if (!("navigation"in window))
        return () => {}
        ;
    const i = a => {
        Nv(a.destination.url) && Xo.post("google-auth-blocked", {
            url: a.destination.url || ""
        })
    }
    ;
    return window.navigation.addEventListener("navigate", i),
    () => {
        window.navigation.removeEventListener("navigate", i)
    }
}
async function jv() {
    await Mg;
    const i = Ov()
      , a = Av()
      , r = Rv()
      , u = Lv();
    return () => {
        Xo.destroy(),
        i(),
        a(),
        r(),
        u()
    }
}
async function Dv() {
    const i = await Dg( () => Promise.resolve().then( () => jx), void 0).then(f => f.default).catch(f => []);
    let a = []
      , r = 0;
    function u(f, d) {
        const {path: m="", children: g, index: p} = f;
        r++;
        const b = p === !0 || m === ""
          , v = m && m[0] === "/"
          , S = b ? d.path : `${d.path}/${m}`
          , x = v && !b ? m : S
          , E = {
            id: r,
            parentId: d.id,
            path: "/" + x.split("/").filter(Boolean).join("/")
        };
        /\*/.test(E.path) || a.push(E),
        g && g.forEach(A => u(A, E))
    }
    i.forEach(f => u(f, {
        id: 0,
        path: ""
    }));
    const c = new Set;
    return a = a.filter(f => c.has(f.path) ? !1 : (c.add(f.path),
    !0)),
    a
}
async function Mv() {
    const i = new Xl(window.parent)
      , a = await Dv();
    window.REACT_APP_ROUTES = a,
    i.post("routes", {
        routes: a
    }),
    i.on("getRouteInfo", async v => a),
    await Mg,
    i.on("routeAction", async v => {
        const S = ko()
          , {action: x, route: E} = v;
        switch (x) {
        case "goForward":
            S.forward();
            break;
        case "goBack":
            S.back();
            break;
        case "refresh":
            S.refresh();
            break;
        case "goTo":
            E && S.push(E);
            break;
        default:
            console.warn("Unknown action:", x)
        }
    }
    );
    function r() {
        const v = window.history.state?.index ?? 0
          , S = window.history.length > v + 1
          , x = v > 0
          , E = window.location.pathname;
        i.post("updateNavigationState", {
            canGoForward: S,
            canGoBack: x,
            currentRoute: Qo(E)
        })
    }
    function u() {
        const v = new MutationObserver(x => {
            x.forEach(E => {
                (E.type === "childList" || E.type === "characterData") && i.post("titleChanged", {
                    title: document.title
                })
            }
            )
        }
        )
          , S = document.querySelector("title");
        return i.post("titleChanged", {
            title: document.title
        }),
        S && v.observe(S, {
            childList: !0,
            characterData: !0,
            subtree: !0
        }),
        v
    }
    let c = u();
    function f() {
        c.disconnect(),
        setTimeout( () => {
            c = u()
        }
        , 100)
    }
    const d = window.history.pushState
      , m = window.history.replaceState
      , g = window.history.go
      , p = window.history.back
      , b = window.history.forward;
    return window.history.pushState = function(v, S, x) {
        d.apply(this, arguments),
        r(),
        f()
    }
    ,
    window.history.replaceState = function(v, S, x) {
        m.apply(this, arguments),
        r(),
        f()
    }
    ,
    window.history.go = function(v) {
        g.apply(this, arguments),
        setTimeout( () => {
            r(),
            f()
        }
        , 100)
    }
    ,
    window.history.back = function() {
        p.apply(this, arguments),
        setTimeout( () => {
            r(),
            f()
        }
        , 100)
    }
    ,
    window.history.forward = function() {
        b.apply(this, arguments),
        setTimeout( () => {
            r(),
            f()
        }
        , 100)
    }
    ,
    {
        destroy: () => {
            i.destroy(),
            c.disconnect()
        }
    }
}
var go = {
    exports: {}
}
  , ie = {};
var xm;
function zv() {
    if (xm)
        return ie;
    xm = 1;
    var i = Symbol.for("react.transitional.element")
      , a = Symbol.for("react.portal")
      , r = Symbol.for("react.fragment")
      , u = Symbol.for("react.strict_mode")
      , c = Symbol.for("react.profiler")
      , f = Symbol.for("react.consumer")
      , d = Symbol.for("react.context")
      , m = Symbol.for("react.forward_ref")
      , g = Symbol.for("react.suspense")
      , p = Symbol.for("react.memo")
      , b = Symbol.for("react.lazy")
      , v = Symbol.for("react.activity")
      , S = Symbol.iterator;
    function x(T) {
        return T === null || typeof T != "object" ? null : (T = S && T[S] || T["@@iterator"],
        typeof T == "function" ? T : null)
    }
    var E = {
        isMounted: function() {
            return !1
        },
        enqueueForceUpdate: function() {},
        enqueueReplaceState: function() {},
        enqueueSetState: function() {}
    }
      , A = Object.assign
      , _ = {};
    function D(T, B, Z) {
        this.props = T,
        this.context = B,
        this.refs = _,
        this.updater = Z || E
    }
    D.prototype.isReactComponent = {},
    D.prototype.setState = function(T, B) {
        if (typeof T != "object" && typeof T != "function" && T != null)
            throw Error("takes an object of state variables to update or a function which returns an object of state variables.");
        this.updater.enqueueSetState(this, T, B, "setState")
    }
    ,
    D.prototype.forceUpdate = function(T) {
        this.updater.enqueueForceUpdate(this, T, "forceUpdate")
    }
    ;
    function G() {}
    G.prototype = D.prototype;
    function V(T, B, Z) {
        this.props = T,
        this.context = B,
        this.refs = _,
        this.updater = Z || E
    }
    var F = V.prototype = new G;
    F.constructor = V,
    A(F, D.prototype),
    F.isPureReactComponent = !0;
    var W = Array.isArray;
    function ue() {}
    var P = {
        H: null,
        A: null,
        T: null,
        S: null
    }
      , ye = Object.prototype.hasOwnProperty;
    function Ce(T, B, Z) {
        var J = Z.ref;
        return {
            $$typeof: i,
            type: T,
            key: B,
            ref: J !== void 0 ? J : null,
            props: Z
        }
    }
    function Q(T, B) {
        return Ce(T.type, B, T.props)
    }
    function X(T) {
        return typeof T == "object" && T !== null && T.$$typeof === i
    }
    function K(T) {
        var B = {
            "=": "=0",
            ":": "=2"
        };
        return "$" + T.replace(/[=:]/g, function(Z) {
            return B[Z]
        })
    }
    var ne = /\/+/g;
    function oe(T, B) {
        return typeof T == "object" && T !== null && T.key != null ? K("" + T.key) : B.toString(36)
    }
    function fe(T) {
        switch (T.status) {
        case "fulfilled":
            return T.value;
        case "rejected":
            throw T.reason;
        default:
            switch (typeof T.status == "string" ? T.then(ue, ue) : (T.status = "pending",
            T.then(function(B) {
                T.status === "pending" && (T.status = "fulfilled",
                T.value = B)
            }, function(B) {
                T.status === "pending" && (T.status = "rejected",
                T.reason = B)
            })),
            T.status) {
            case "fulfilled":
                return T.value;
            case "rejected":
                throw T.reason
            }
        }
        throw T
    }
    function z(T, B, Z, J, se) {
        var de = typeof T;
        (de === "undefined" || de === "boolean") && (T = null);
        var _e = !1;
        if (T === null)
            _e = !0;
        else
            switch (de) {
            case "bigint":
            case "string":
            case "number":
                _e = !0;
                break;
            case "object":
                switch (T.$$typeof) {
                case i:
                case a:
                    _e = !0;
                    break;
                case b:
                    return _e = T._init,
                    z(_e(T._payload), B, Z, J, se)
                }
            }
        if (_e)
            return se = se(T),
            _e = J === "" ? "." + oe(T, 0) : J,
            W(se) ? (Z = "",
            _e != null && (Z = _e.replace(ne, "$&/") + "/"),
            z(se, B, Z, "", function(Kl) {
                return Kl
            })) : se != null && (X(se) && (se = Q(se, Z + (se.key == null || T && T.key === se.key ? "" : ("" + se.key).replace(ne, "$&/") + "/") + _e)),
            B.push(se)),
            1;
        _e = 0;
        var nt = J === "" ? "." : J + ":";
        if (W(T))
            for (var He = 0; He < T.length; He++)
                J = T[He],
                de = nt + oe(J, He),
                _e += z(J, B, Z, de, se);
        else if (He = x(T),
        typeof He == "function")
            for (T = He.call(T),
            He = 0; !(J = T.next()).done; )
                J = J.value,
                de = nt + oe(J, He++),
                _e += z(J, B, Z, de, se);
        else if (de === "object") {
            if (typeof T.then == "function")
                return z(fe(T), B, Z, J, se);
            throw B = String(T),
            Error("Objects are not valid as a React child (found: " + (B === "[object Object]" ? "object with keys {" + Object.keys(T).join(", ") + "}" : B) + "). If you meant to render a collection of children, use an array instead.")
        }
        return _e
    }
    function k(T, B, Z) {
        if (T == null)
            return T;
        var J = []
          , se = 0;
        return z(T, J, "", "", function(de) {
            return B.call(Z, de, se++)
        }),
        J
    }
    function te(T) {
        if (T._status === -1) {
            var B = T._result;
            B = B(),
            B.then(function(Z) {
                (T._status === 0 || T._status === -1) && (T._status = 1,
                T._result = Z)
            }, function(Z) {
                (T._status === 0 || T._status === -1) && (T._status = 2,
                T._result = Z)
            }),
            T._status === -1 && (T._status = 0,
            T._result = B)
        }
        if (T._status === 1)
            return T._result.default;
        throw T._result
    }
    var be = typeof reportError == "function" ? reportError : function(T) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
            var B = new window.ErrorEvent("error",{
                bubbles: !0,
                cancelable: !0,
                message: typeof T == "object" && T !== null && typeof T.message == "string" ? String(T.message) : String(T),
                error: T
            });
            if (!window.dispatchEvent(B))
                return
        } else if (typeof process == "object" && typeof process.emit == "function") {
            process.emit("uncaughtException", T);
            return
        }
        console.error(T)
    }
      , we = {
        map: k,
        forEach: function(T, B, Z) {
            k(T, function() {
                B.apply(this, arguments)
            }, Z)
        },
        count: function(T) {
            var B = 0;
            return k(T, function() {
                B++
            }),
            B
        },
        toArray: function(T) {
            return k(T, function(B) {
                return B
            }) || []
        },
        only: function(T) {
            if (!X(T))
                throw Error("React.Children.only expected to receive a single React element child.");
            return T
        }
    };
    return ie.Activity = v,
    ie.Children = we,
    ie.Component = D,
    ie.Fragment = r,
    ie.Profiler = c,
    ie.PureComponent = V,
    ie.StrictMode = u,
    ie.Suspense = g,
    ie.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = P,
    ie.__COMPILER_RUNTIME = {
        __proto__: null,
        c: function(T) {
            return P.H.useMemoCache(T)
        }
    },
    ie.cache = function(T) {
        return function() {
            return T.apply(null, arguments)
        }
    }
    ,
    ie.cacheSignal = function() {
        return null
    }
    ,
    ie.cloneElement = function(T, B, Z) {
        if (T == null)
            throw Error("The argument must be a React element, but you passed " + T + ".");
        var J = A({}, T.props)
          , se = T.key;
        if (B != null)
            for (de in B.key !== void 0 && (se = "" + B.key),
            B)
                !ye.call(B, de) || de === "key" || de === "__self" || de === "__source" || de === "ref" && B.ref === void 0 || (J[de] = B[de]);
        var de = arguments.length - 2;
        if (de === 1)
            J.children = Z;
        else if (1 < de) {
            for (var _e = Array(de), nt = 0; nt < de; nt++)
                _e[nt] = arguments[nt + 2];
            J.children = _e
        }
        return Ce(T.type, se, J)
    }
    ,
    ie.createContext = function(T) {
        return T = {
            $$typeof: d,
            _currentValue: T,
            _currentValue2: T,
            _threadCount: 0,
            Provider: null,
            Consumer: null
        },
        T.Provider = T,
        T.Consumer = {
            $$typeof: f,
            _context: T
        },
        T
    }
    ,
    ie.createElement = function(T, B, Z) {
        var J, se = {}, de = null;
        if (B != null)
            for (J in B.key !== void 0 && (de = "" + B.key),
            B)
                ye.call(B, J) && J !== "key" && J !== "__self" && J !== "__source" && (se[J] = B[J]);
        var _e = arguments.length - 2;
        if (_e === 1)
            se.children = Z;
        else if (1 < _e) {
            for (var nt = Array(_e), He = 0; He < _e; He++)
                nt[He] = arguments[He + 2];
            se.children = nt
        }
        if (T && T.defaultProps)
            for (J in _e = T.defaultProps,
            _e)
                se[J] === void 0 && (se[J] = _e[J]);
        return Ce(T, de, se)
    }
    ,
    ie.createRef = function() {
        return {
            current: null
        }
    }
    ,
    ie.forwardRef = function(T) {
        return {
            $$typeof: m,
            render: T
        }
    }
    ,
    ie.isValidElement = X,
    ie.lazy = function(T) {
        return {
            $$typeof: b,
            _payload: {
                _status: -1,
                _result: T
            },
            _init: te
        }
    }
    ,
    ie.memo = function(T, B) {
        return {
            $$typeof: p,
            type: T,
            compare: B === void 0 ? null : B
        }
    }
    ,
    ie.startTransition = function(T) {
        var B = P.T
          , Z = {};
        P.T = Z;
        try {
            var J = T()
              , se = P.S;
            se !== null && se(Z, J),
            typeof J == "object" && J !== null && typeof J.then == "function" && J.then(ue, be)
        } catch (de) {
            be(de)
        } finally {
            B !== null && Z.types !== null && (B.types = Z.types),
            P.T = B
        }
    }
    ,
    ie.unstable_useCacheRefresh = function() {
        return P.H.useCacheRefresh()
    }
    ,
    ie.use = function(T) {
        return P.H.use(T)
    }
    ,
    ie.useActionState = function(T, B, Z) {
        return P.H.useActionState(T, B, Z)
    }
    ,
    ie.useCallback = function(T, B) {
        return P.H.useCallback(T, B)
    }
    ,
    ie.useContext = function(T) {
        return P.H.useContext(T)
    }
    ,
    ie.useDebugValue = function() {}
    ,
    ie.useDeferredValue = function(T, B) {
        return P.H.useDeferredValue(T, B)
    }
    ,
    ie.useEffect = function(T, B) {
        return P.H.useEffect(T, B)
    }
    ,
    ie.useEffectEvent = function(T) {
        return P.H.useEffectEvent(T)
    }
    ,
    ie.useId = function() {
        return P.H.useId()
    }
    ,
    ie.useImperativeHandle = function(T, B, Z) {
        return P.H.useImperativeHandle(T, B, Z)
    }
    ,
    ie.useInsertionEffect = function(T, B) {
        return P.H.useInsertionEffect(T, B)
    }
    ,
    ie.useLayoutEffect = function(T, B) {
        return P.H.useLayoutEffect(T, B)
    }
    ,
    ie.useMemo = function(T, B) {
        return P.H.useMemo(T, B)
    }
    ,
    ie.useOptimistic = function(T, B) {
        return P.H.useOptimistic(T, B)
    }
    ,
    ie.useReducer = function(T, B, Z) {
        return P.H.useReducer(T, B, Z)
    }
    ,
    ie.useRef = function(T) {
        return P.H.useRef(T)
    }
    ,
    ie.useState = function(T) {
        return P.H.useState(T)
    }
    ,
    ie.useSyncExternalStore = function(T, B, Z) {
        return P.H.useSyncExternalStore(T, B, Z)
    }
    ,
    ie.useTransition = function() {
        return P.H.useTransition()
    }
    ,
    ie.version = "19.2.4",
    ie
}
var Sm;
function Zo() {
    return Sm || (Sm = 1,
    go.exports = zv()),
    go.exports
}
var H = Zo();
const Em = F0(H);
var po = {
    exports: {}
}
  , Va = {};
var wm;
function Uv() {
    if (wm)
        return Va;
    wm = 1;
    var i = Symbol.for("react.transitional.element")
      , a = Symbol.for("react.fragment");
    function r(u, c, f) {
        var d = null;
        if (f !== void 0 && (d = "" + f),
        c.key !== void 0 && (d = "" + c.key),
        "key"in c) {
            f = {};
            for (var m in c)
                m !== "key" && (f[m] = c[m])
        } else
            f = c;
        return c = f.ref,
        {
            $$typeof: i,
            type: u,
            key: d,
            ref: c !== void 0 ? c : null,
            props: f
        }
    }
    return Va.Fragment = a,
    Va.jsx = r,
    Va.jsxs = r,
    Va
}
var _m;
function Hv() {
    return _m || (_m = 1,
    po.exports = Uv()),
    po.exports
}
var w = Hv()
  , yo = {
    exports: {}
}
  , Es = {};
var Cm;
function Bv() {
    if (Cm)
        return Es;
    Cm = 1;
    var i = Symbol.for("react.fragment");
    return Es.Fragment = i,
    Es.jsxDEV = void 0,
    Es
}
var Tm;
function qv() {
    return Tm || (Tm = 1,
    yo.exports = Bv()),
    yo.exports
}
var Om = qv();
class zg {
    static getFiberFromDOMNode(a) {
        if (!a)
            return null;
        const r = Object.keys(a).find(u => u.startsWith("__reactFiber$") || u.startsWith("__reactInternalInstance$"));
        return r ? a[r] : null
    }
}
const Ug = new WeakMap
  , Hg = new WeakMap
  , Am = new WeakMap
  , vo = new WeakMap
  , Nm = new WeakMap
  , Rm = new WeakMap
  , bo = (i, a) => {
    try {
        Hg.set(i, a);
        const r = zg.getFiberFromDOMNode(i);
        r && Ug.set(r, a)
    } catch {}
}
  , ws = (i, a) => {
    if (!i)
        return r => {
            r instanceof HTMLElement && bo(r, a)
        }
        ;
    if (typeof i == "function") {
        let r = vo.get(i);
        r || (r = [],
        vo.set(i, r)),
        r.push(a);
        let u = Am.get(i);
        return u || (u = c => {
            if (c instanceof HTMLElement) {
                const f = vo.get(i);
                if (f && f.length > 0) {
                    const d = f.shift();
                    bo(c, d)
                }
            }
            i(c)
        }
        ,
        Am.set(i, u)),
        u
    }
    if (i && typeof i == "object" && "current"in i) {
        Rm.set(i, a);
        let r = Nm.get(i);
        return r || (r = u => {
            if (u instanceof HTMLElement) {
                const c = Rm.get(i);
                c && bo(u, c)
            }
            i.current = u
        }
        ,
        Nm.set(i, r)),
        r
    }
}
;
function Gv() {
    const i = Em.createElement
      , a = w.jsx
      , r = w.jsxs
      , u = Om.jsxDEV
      , c = () => {
        const d = new Error;
        return () => d
    }
      , f = d => typeof d == "string";
    Em.createElement = function(d, m, ...g) {
        if (!f(d) && typeof d != "function")
            return i(d, m, ...g);
        const p = c()
          , b = m ? {
            ...m
        } : {}
          , v = ws(b.ref, p);
        return v && (b.ref = v),
        i(d, b, ...g)
    }
    ,
    w.jsx = function(d, m, g) {
        if (!f(d) && typeof d != "function")
            return a(d, m, g);
        const p = c()
          , b = m ? {
            ...m
        } : {}
          , v = ws(b.ref, p);
        return v && (b.ref = v),
        a(d, b, g)
    }
    ,
    w.jsxs = function(d, m, g) {
        if (!f(d) && typeof d != "function")
            return r(d, m, g);
        const p = c()
          , b = m ? {
            ...m
        } : {}
          , v = ws(b.ref, p);
        return v && (b.ref = v),
        r(d, b, g)
    }
    ,
    u && (Om.jsxDEV = function(d, m, g, p, b, v) {
        if (!f(d) && typeof d != "function")
            return u(d, m, g, p, b, v);
        const S = c()
          , x = m ? {
            ...m
        } : {}
          , E = ws(x.ref, S);
        return E && (x.ref = E),
        u(d, x, g, p, b, v)
    }
    )
}
function Yv(i) {
    const a = document.querySelector(i);
    if (!a)
        return null;
    const r = a.tagName.toLowerCase()
      , u = Hg.get(a);
    if (u)
        return {
            element: a,
            tagName: r,
            debugError: u()
        };
    const c = zg.getFiberFromDOMNode(a);
    if (c) {
        const f = Ug.get(c);
        if (f)
            return {
                element: a,
                tagName: r,
                debugError: f()
            }
    }
    return null
}
Gv();
function Vv() {
    const i = new WeakMap
      , a = new Xl(window.parent);
    return a.on("get-element-source", async ({selector: r}) => {
        const u = Yv(r);
        if (!u)
            return null;
        const {element: c, tagName: f, debugError: d} = u;
        if (i.has(c))
            return i.get(c);
        const m = await Za(d, 10, f);
        if (!m)
            return null;
        const p = {
            ...m.sourceContext.filter(b => !b.file.includes("node_modules"))[0],
            domInfo: {
                tagName: c.tagName,
                textContent: c.textContent.slice(0, 300)
            }
        };
        return i.set(c, p),
        p
    }
    ),
    () => {
        a.destroy()
    }
}
const Qv = !0;
console.log("Is preview build:", Qv);
async function kv() {
    K0(),
    xv(),
    jv(),
    Ev(),
    Mv(),
    Vv()
}
kv();
const Xv = "phc_V7JMHB0fVJGRu8UHyrsj6pSL1BS76P5zD8qCi7lrTTV"
  , Fe = {
    colors: {
        text: "#5D5D5D",
        white: "#FFFFFF",
        border: "rgba(0, 10, 36, 0.08)"
    },
    font: {
        family: '"Geist"',
        weight: "600",
        size: {
            normal: "14px",
            button: "18px"
        },
        lineHeight: "20px"
    },
    button: {
        gradient: "linear-gradient(180deg, #A797FF 0%, #7057FF 100%)"
    },
    shadow: "0px 8px 12px 0px rgba(9, 10, 20, 0.06)",
    zIndex: `${Number.MAX_SAFE_INTEGER}`
}
  , Lm = {
    close: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2D303D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>')}`,
    generate: `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" fill="none" width="16" height="16" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M4.87 4.94c.227-.71 1.21-.723 1.456-.02l1.177 3.378 3.101 1.013c.708.231.714 1.216.01 1.455l-3.183 1.082-1.105 3.17c-.245.704-1.23.69-1.455-.02l-.989-3.107-3.367-1.203c-.702-.25-.68-1.234.04-1.455l3.282-1.016 1.043-3.277Z" fill="#FFF"/><path fill-rule="evenodd" d="M12.238 1.3c.167-.667 1.1-.667 1.266 0l.388 1.551 1.55.388c.666.166.667 1.1 0 1.266l-1.55.388-.388 1.55c-.167.666-1.1.667-1.266 0l-.388-1.55-1.55-.388c-.667-.166-.667-1.1 0-1.266l1.55-.388.388-1.551Z" fill="#FFF"/></svg>')}`
}
  
  , jm = {
    en: {
        prefix: "This Website is Made with",
        suffix: ". You can also get one like this in minutes",
        button: "Get one for FREE"
    },
    zh: {
        prefix: "本网站来自",
        suffix: "你也可以在几分钟内拥有同样的页面",
        button: "立即免费拥有"
    }
}
  , Zv = () => navigator.language?.toLowerCase().startsWith("zh") ?? !1
  , xo = () => Zv() ? jm.zh : jm.en
  , Kv = () => window.innerWidth > 768 && !("ontouchstart"in window)
  , Fv = () => {
    const i = window.location.hostname;
    
;
function Jv() {
    if (window.posthog)
        return;
    const i = document.createElement("script");
    i.src = Ka.posthogCDN,
    i.async = !0,
    i.onload = () => {
        window.posthog?.init(Xv, {
            api_host: "https://us.i.posthog.com",
            autocapture: !1,
            capture_pageview: !1,
            capture_pageleave: !1,
            disable_session_recording: !0,
            disable_scroll_properties: !0,
            capture_performance: {
                web_vitals: !1
            },
            rageclick: !1,
            loaded: function(a) {
                a.sessionRecording && a.sessionRecording.stopRecording()
            }
        })
    }
    ,
    document.head.appendChild(i)
}
function Dm(i, a) {
    window.posthog?.capture(i, {
        ...a,
        version: 2
    })
}
function Gt(i, a) {
    Object.assign(i.style, a)
}
function So(i, a="0") {
    Gt(i, {
        color: Fe.colors.text,
        fontFamily: Fe.font.family,
        fontSize: Fe.font.size.normal,
        lineHeight: Fe.font.lineHeight,
        fontWeight: Fe.font.weight,
        whiteSpace: "nowrap",
        marginRight: a
    })
}
function _s(i, a="row") {
    Gt(i, {
        display: "flex",
        flexDirection: a,
        alignItems: "center",
        justifyContent: "center"
    })
}
function $v() {
    if (Fv())
        return;
    const i = 
      , a = "77c4cc08-a436-49c8-b40f-f3c523d34553";
    async function r(x) {
        try {
            return !(await (await fetch(`${i}?projectId=${x}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            })).json()).data.is_free
        } catch {
            return !0
        }
    }
    function u() {
        document.querySelector('link[rel="icon"]')?.remove();
        const x = document.createElement("link");
        x.type = "image/png",
        x.rel = "icon",
        x.href = Ka,
        document.head.appendChild(x);
        const E = document.createElement("link");
        E.rel = "stylesheet",
        E.href = Ka.fontStylesheet,
        document.head.appendChild(E)
    }
    function c(x) {
        Dm(x),
        window.open(Ka., "_blank")
    }
    function f() {
        const x = document.createElement("div");
        x.id = "close-button",
        Gt(x, {
            position: "absolute",
            top: "-12px",
            right: "-12px",
            width: "32px",
            height: "32px",
            backgroundColor: Fe.colors.white,
            borderRadius: "50%",
            borderStyle: "solid",
            borderWidth: "1px",
            borderColor: Fe.colors.border,
            cursor: "pointer",
            boxShadow: Fe.shadow
        }),
        _s(x);
        const E = document.createElement("img");
        return E.src = Lm.close,
        Gt(E, {
            width: "24px",
            height: "24px"
        }),
        x.appendChild(E),
        x.addEventListener("click", A => {
            A.stopPropagation(),
            Dm("watermark_close_button_click"),
            document.getElementById("watermark")?.remove()
        }
        ),
        x
    }
    function d(x) {
        const E = document.createElement("div");
        E.id = "generate-button",
        Gt(E, {
            padding: x ? "8px 16px" : "10px 20px",
            background: Fe.button.gradient,
            borderRadius: "999px",
            border: "none",
            gap: "6px",
            cursor: "pointer",
            marginLeft: x ? "12px" : "0",
            whiteSpace: "nowrap",
            width: x ? "auto" : "100%"
        }),
        _s(E);
        const A = document.createElement("img");
        A.src = Lm.generate,
        Gt(A, {
            width: "16px",
            height: "16px",
            flexShrink: "0"
        });
        const _ = document.createElement("span");
        return _.textContent = xo().button,
        Gt(_, {
            color: Fe.colors.white,
            fontFamily: Fe.font.family,
            fontSize: Fe.font.size.button,
            fontWeight: Fe.font.weight,
            lineHeight: Fe.font.lineHeight
        }),
        E.append(A, _),
        E.addEventListener("click", D => {
            D.stopPropagation(),
            c("watermark_create_button_click")
        }
        ),
        E
    }
    function m() {
        const x = document.createElement("img");
        return x.src = Ka.watermarkLogo,
        Gt(x, {
            width: "92px",
            height: "auto",
            paddingLeft: "8px",
            flexShrink: "0"
        }),
        x
    }
    function g(x) {
        const E = xo()
          , A = document.createElement("div");
        A.textContent = E.prefix,
        So(A);
        const _ = m()
          , D = document.createElement("div");
        D.textContent = E.suffix,
        So(D, "12px"),
        x.append(A, _, D, d(!0))
    }
    function p(x, E) {
        const A = document.createElement("div");
        return A.textContent = x,
        So(A),
        E && Gt(A, E),
        A
    }
    function b(x) {
        const {prefix: E, suffix: A} = xo()
          , [_,D] = A.startsWith(".") ? [".", A.slice(1).trim()] : ["", A]
          , G = document.createElement("div");
        _s(G),
        G.style.marginBottom = "4px",
        G.append(p(E, {
            marginRight: "6px"
        }), m(), ..._ ? [p(_)] : []),
        x.append(G, p(D, {
            textAlign: "center",
            marginBottom: "12px"
        }), d(!1))
    }
    function v() {
        const x = Kv()
          , E = document.createElement("div");
        return E.id = "watermark",
        Gt(E, {
            zIndex: Fe.zIndex,
            position: "fixed",
            bottom: "24px",
            left: "50%",
            transform: "translateX(-50%)",
            width: x ? "fit-content" : "calc(100% - 32px)",
            maxWidth: x ? "none" : "100%",
            backgroundColor: Fe.colors.white,
            borderStyle: "solid",
            borderWidth: "1px",
            borderRadius: x ? "999px" : "36px",
            borderColor: Fe.colors.border,
            padding: x ? "12px 20px" : "16px",
            boxShadow: Fe.shadow,
            cursor: "pointer"
        }),
        _s(E, x ? "row" : "column"),
        E.appendChild(f()),
        x ? g(E) : b(E),
        E.addEventListener("click", A => {
            A.target.closest("#generate-button, #close-button") || c("watermark_create_button_click")
        }
        ),
        E
    }
    function S(x) {
        const E = document.getElementById("watermark");
        !E && !x ? (document.body.appendChild(v()),
        u(),
        Jv()) : x && E && E.remove()
    }
    r(a).then(S)
}
$v();
const ae = i => typeof i == "string"
  , Qa = () => {
    let i, a;
    const r = new Promise( (u, c) => {
        i = u,
        a = c
    }
    );
    return r.resolve = i,
    r.reject = a,
    r
}
  , Mm = i => i == null ? "" : "" + i
  , Wv = (i, a, r) => {
    i.forEach(u => {
        a[u] && (r[u] = a[u])
    }
    )
}
  , Pv = /###/g
  , zm = i => i && i.indexOf("###") > -1 ? i.replace(Pv, ".") : i
  , Um = i => !i || ae(i)
  , Ja = (i, a, r) => {
    const u = ae(a) ? a.split(".") : a;
    let c = 0;
    for (; c < u.length - 1; ) {
        if (Um(i))
            return {};
        const f = zm(u[c]);
        !i[f] && r && (i[f] = new r),
        Object.prototype.hasOwnProperty.call(i, f) ? i = i[f] : i = {},
        ++c
    }
    return Um(i) ? {} : {
        obj: i,
        k: zm(u[c])
    }
}
  , Hm = (i, a, r) => {
    const {obj: u, k: c} = Ja(i, a, Object);
    if (u !== void 0 || a.length === 1) {
        u[c] = r;
        return
    }
    let f = a[a.length - 1]
      , d = a.slice(0, a.length - 1)
      , m = Ja(i, d, Object);
    for (; m.obj === void 0 && d.length; )
        f = `${d[d.length - 1]}.${f}`,
        d = d.slice(0, d.length - 1),
        m = Ja(i, d, Object),
        m?.obj && typeof m.obj[`${m.k}.${f}`] < "u" && (m.obj = void 0);
    m.obj[`${m.k}.${f}`] = r
}
  , Iv = (i, a, r, u) => {
    const {obj: c, k: f} = Ja(i, a, Object);
    c[f] = c[f] || [],
    c[f].push(r)
}
  , Rs = (i, a) => {
    const {obj: r, k: u} = Ja(i, a);
    if (r && Object.prototype.hasOwnProperty.call(r, u))
        return r[u]
}
  , e1 = (i, a, r) => {
    const u = Rs(i, r);
    return u !== void 0 ? u : Rs(a, r)
}
  , Bg = (i, a, r) => {
    for (const u in a)
        u !== "__proto__" && u !== "constructor" && (u in i ? ae(i[u]) || i[u]instanceof String || ae(a[u]) || a[u]instanceof String ? r && (i[u] = a[u]) : Bg(i[u], a[u], r) : i[u] = a[u]);
    return i
}
  , nl = i => i.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
var t1 = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;"
};
const n1 = i => ae(i) ? i.replace(/[&<>"'\/]/g, a => t1[a]) : i;
class l1 {
    constructor(a) {
        this.capacity = a,
        this.regExpMap = new Map,
        this.regExpQueue = []
    }
    getRegExp(a) {
        const r = this.regExpMap.get(a);
        if (r !== void 0)
            return r;
        const u = new RegExp(a);
        return this.regExpQueue.length === this.capacity && this.regExpMap.delete(this.regExpQueue.shift()),
        this.regExpMap.set(a, u),
        this.regExpQueue.push(a),
        u
    }
}
const a1 = [" ", ",", "?", "!", ";"]
  , i1 = new l1(20)
  , s1 = (i, a, r) => {
    a = a || "",
    r = r || "";
    const u = a1.filter(d => a.indexOf(d) < 0 && r.indexOf(d) < 0);
    if (u.length === 0)
        return !0;
    const c = i1.getRegExp(`(${u.map(d => d === "?" ? "\\?" : d).join("|")})`);
    let f = !c.test(i);
    if (!f) {
        const d = i.indexOf(r);
        d > 0 && !c.test(i.substring(0, d)) && (f = !0)
    }
    return f
}
  , Mo = (i, a, r=".") => {
    if (!i)
        return;
    if (i[a])
        return Object.prototype.hasOwnProperty.call(i, a) ? i[a] : void 0;
    const u = a.split(r);
    let c = i;
    for (let f = 0; f < u.length; ) {
        if (!c || typeof c != "object")
            return;
        let d, m = "";
        for (let g = f; g < u.length; ++g)
            if (g !== f && (m += r),
            m += u[g],
            d = c[m],
            d !== void 0) {
                if (["string", "number", "boolean"].indexOf(typeof d) > -1 && g < u.length - 1)
                    continue;
                f += g - f + 1;
                break
            }
        c = d
    }
    return c
}
  , Wa = i => i?.replace("_", "-")
  , r1 = {
    type: "logger",
    log(i) {
        this.output("log", i)
    },
    warn(i) {
        this.output("warn", i)
    },
    error(i) {
        this.output("error", i)
    },
    output(i, a) {
        console?.[i]?.apply?.(console, a)
    }
};
class Ls {
    constructor(a, r={}) {
        this.init(a, r)
    }
    init(a, r={}) {
        this.prefix = r.prefix || "i18next:",
        this.logger = a || r1,
        this.options = r,
        this.debug = r.debug
    }
    log(...a) {
        return this.forward(a, "log", "", !0)
    }
    warn(...a) {
        return this.forward(a, "warn", "", !0)
    }
    error(...a) {
        return this.forward(a, "error", "")
    }
    deprecate(...a) {
        return this.forward(a, "warn", "WARNING DEPRECATED: ", !0)
    }
    forward(a, r, u, c) {
        return c && !this.debug ? null : (ae(a[0]) && (a[0] = `${u}${this.prefix} ${a[0]}`),
        this.logger[r](a))
    }
    create(a) {
        return new Ls(this.logger,{
            prefix: `${this.prefix}:${a}:`,
            ...this.options
        })
    }
    clone(a) {
        return a = a || this.options,
        a.prefix = a.prefix || this.prefix,
        new Ls(this.logger,a)
    }
}
var Yt = new Ls;
class zs {
    constructor() {
        this.observers = {}
    }
    on(a, r) {
        return a.split(" ").forEach(u => {
            this.observers[u] || (this.observers[u] = new Map);
            const c = this.observers[u].get(r) || 0;
            this.observers[u].set(r, c + 1)
        }
        ),
        this
    }
    off(a, r) {
        if (this.observers[a]) {
            if (!r) {
                delete this.observers[a];
                return
            }
            this.observers[a].delete(r)
        }
    }
    emit(a, ...r) {
        this.observers[a] && Array.from(this.observers[a].entries()).forEach( ([c,f]) => {
            for (let d = 0; d < f; d++)
                c(...r)
        }
        ),
        this.observers["*"] && Array.from(this.observers["*"].entries()).forEach( ([c,f]) => {
            for (let d = 0; d < f; d++)
                c.apply(c, [a, ...r])
        }
        )
    }
}
class Bm extends zs {
    constructor(a, r={
        ns: ["translation"],
        defaultNS: "translation"
    }) {
        super(),
        this.data = a || {},
        this.options = r,
        this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
        this.options.ignoreJSONStructure === void 0 && (this.options.ignoreJSONStructure = !0)
    }
    addNamespaces(a) {
        this.options.ns.indexOf(a) < 0 && this.options.ns.push(a)
    }
    removeNamespaces(a) {
        const r = this.options.ns.indexOf(a);
        r > -1 && this.options.ns.splice(r, 1)
    }
    getResource(a, r, u, c={}) {
        const f = c.keySeparator !== void 0 ? c.keySeparator : this.options.keySeparator
          , d = c.ignoreJSONStructure !== void 0 ? c.ignoreJSONStructure : this.options.ignoreJSONStructure;
        let m;
        a.indexOf(".") > -1 ? m = a.split(".") : (m = [a, r],
        u && (Array.isArray(u) ? m.push(...u) : ae(u) && f ? m.push(...u.split(f)) : m.push(u)));
        const g = Rs(this.data, m);
        return !g && !r && !u && a.indexOf(".") > -1 && (a = m[0],
        r = m[1],
        u = m.slice(2).join(".")),
        g || !d || !ae(u) ? g : Mo(this.data?.[a]?.[r], u, f)
    }
    addResource(a, r, u, c, f={
        silent: !1
    }) {
        const d = f.keySeparator !== void 0 ? f.keySeparator : this.options.keySeparator;
        let m = [a, r];
        u && (m = m.concat(d ? u.split(d) : u)),
        a.indexOf(".") > -1 && (m = a.split("."),
        c = r,
        r = m[1]),
        this.addNamespaces(r),
        Hm(this.data, m, c),
        f.silent || this.emit("added", a, r, u, c)
    }
    addResources(a, r, u, c={
        silent: !1
    }) {
        for (const f in u)
            (ae(u[f]) || Array.isArray(u[f])) && this.addResource(a, r, f, u[f], {
                silent: !0
            });
        c.silent || this.emit("added", a, r, u)
    }
    addResourceBundle(a, r, u, c, f, d={
        silent: !1,
        skipCopy: !1
    }) {
        let m = [a, r];
        a.indexOf(".") > -1 && (m = a.split("."),
        c = u,
        u = r,
        r = m[1]),
        this.addNamespaces(r);
        let g = Rs(this.data, m) || {};
        d.skipCopy || (u = JSON.parse(JSON.stringify(u))),
        c ? Bg(g, u, f) : g = {
            ...g,
            ...u
        },
        Hm(this.data, m, g),
        d.silent || this.emit("added", a, r, u)
    }
    removeResourceBundle(a, r) {
        this.hasResourceBundle(a, r) && delete this.data[a][r],
        this.removeNamespaces(r),
        this.emit("removed", a, r)
    }
    hasResourceBundle(a, r) {
        return this.getResource(a, r) !== void 0
    }
    getResourceBundle(a, r) {
        return r || (r = this.options.defaultNS),
        this.getResource(a, r)
    }
    getDataByLanguage(a) {
        return this.data[a]
    }
    hasLanguageSomeTranslations(a) {
        const r = this.getDataByLanguage(a);
        return !!(r && Object.keys(r) || []).find(c => r[c] && Object.keys(r[c]).length > 0)
    }
    toJSON() {
        return this.data
    }
}
var qg = {
    processors: {},
    addPostProcessor(i) {
        this.processors[i.name] = i
    },
    handle(i, a, r, u, c) {
        return i.forEach(f => {
            a = this.processors[f]?.process(a, r, u, c) ?? a
        }
        ),
        a
    }
};
const Gg = Symbol("i18next/PATH_KEY");
function u1() {
    const i = []
      , a = Object.create(null);
    let r;
    return a.get = (u, c) => (r?.revoke?.(),
    c === Gg ? i : (i.push(c),
    r = Proxy.revocable(u, a),
    r.proxy)),
    Proxy.revocable(Object.create(null), a).proxy
}
function zo(i, a) {
    const {[Gg]: r} = i(u1());
    return r.join(a?.keySeparator ?? ".")
}
const qm = {}
  , Eo = i => !ae(i) && typeof i != "boolean" && typeof i != "number";
class js extends zs {
    constructor(a, r={}) {
        super(),
        Wv(["resourceStore", "languageUtils", "pluralResolver", "interpolator", "backendConnector", "i18nFormat", "utils"], a, this),
        this.options = r,
        this.options.keySeparator === void 0 && (this.options.keySeparator = "."),
        this.logger = Yt.create("translator")
    }
    changeLanguage(a) {
        a && (this.language = a)
    }
    exists(a, r={
        interpolation: {}
    }) {
        const u = {
            ...r
        };
        if (a == null)
            return !1;
        const c = this.resolve(a, u);
        if (c?.res === void 0)
            return !1;
        const f = Eo(c.res);
        return !(u.returnObjects === !1 && f)
    }
    extractFromKey(a, r) {
        let u = r.nsSeparator !== void 0 ? r.nsSeparator : this.options.nsSeparator;
        u === void 0 && (u = ":");
        const c = r.keySeparator !== void 0 ? r.keySeparator : this.options.keySeparator;
        let f = r.ns || this.options.defaultNS || [];
        const d = u && a.indexOf(u) > -1
          , m = !this.options.userDefinedKeySeparator && !r.keySeparator && !this.options.userDefinedNsSeparator && !r.nsSeparator && !s1(a, u, c);
        if (d && !m) {
            const g = a.match(this.interpolator.nestingRegexp);
            if (g && g.length > 0)
                return {
                    key: a,
                    namespaces: ae(f) ? [f] : f
                };
            const p = a.split(u);
            (u !== c || u === c && this.options.ns.indexOf(p[0]) > -1) && (f = p.shift()),
            a = p.join(c)
        }
        return {
            key: a,
            namespaces: ae(f) ? [f] : f
        }
    }
    translate(a, r, u) {
        let c = typeof r == "object" ? {
            ...r
        } : r;
        if (typeof c != "object" && this.options.overloadTranslationOptionHandler && (c = this.options.overloadTranslationOptionHandler(arguments)),
        typeof c == "object" && (c = {
            ...c
        }),
        c || (c = {}),
        a == null)
            return "";
        typeof a == "function" && (a = zo(a, {
            ...this.options,
            ...c
        })),
        Array.isArray(a) || (a = [String(a)]);
        const f = c.returnDetails !== void 0 ? c.returnDetails : this.options.returnDetails
          , d = c.keySeparator !== void 0 ? c.keySeparator : this.options.keySeparator
          , {key: m, namespaces: g} = this.extractFromKey(a[a.length - 1], c)
          , p = g[g.length - 1];
        let b = c.nsSeparator !== void 0 ? c.nsSeparator : this.options.nsSeparator;
        b === void 0 && (b = ":");
        const v = c.lng || this.language
          , S = c.appendNamespaceToCIMode || this.options.appendNamespaceToCIMode;
        if (v?.toLowerCase() === "cimode")
            return S ? f ? {
                res: `${p}${b}${m}`,
                usedKey: m,
                exactUsedKey: m,
                usedLng: v,
                usedNS: p,
                usedParams: this.getUsedParamsDetails(c)
            } : `${p}${b}${m}` : f ? {
                res: m,
                usedKey: m,
                exactUsedKey: m,
                usedLng: v,
                usedNS: p,
                usedParams: this.getUsedParamsDetails(c)
            } : m;
        const x = this.resolve(a, c);
        let E = x?.res;
        const A = x?.usedKey || m
          , _ = x?.exactUsedKey || m
          , D = ["[object Number]", "[object Function]", "[object RegExp]"]
          , G = c.joinArrays !== void 0 ? c.joinArrays : this.options.joinArrays
          , V = !this.i18nFormat || this.i18nFormat.handleAsObject
          , F = c.count !== void 0 && !ae(c.count)
          , W = js.hasDefaultValue(c)
          , ue = F ? this.pluralResolver.getSuffix(v, c.count, c) : ""
          , P = c.ordinal && F ? this.pluralResolver.getSuffix(v, c.count, {
            ordinal: !1
        }) : ""
          , ye = F && !c.ordinal && c.count === 0
          , Ce = ye && c[`defaultValue${this.options.pluralSeparator}zero`] || c[`defaultValue${ue}`] || c[`defaultValue${P}`] || c.defaultValue;
        let Q = E;
        V && !E && W && (Q = Ce);
        const X = Eo(Q)
          , K = Object.prototype.toString.apply(Q);
        if (V && Q && X && D.indexOf(K) < 0 && !(ae(G) && Array.isArray(Q))) {
            if (!c.returnObjects && !this.options.returnObjects) {
                this.options.returnedObjectHandler || this.logger.warn("accessing an object - but returnObjects options is not enabled!");
                const ne = this.options.returnedObjectHandler ? this.options.returnedObjectHandler(A, Q, {
                    ...c,
                    ns: g
                }) : `key '${m} (${this.language})' returned an object instead of string.`;
                return f ? (x.res = ne,
                x.usedParams = this.getUsedParamsDetails(c),
                x) : ne
            }
            if (d) {
                const ne = Array.isArray(Q)
                  , oe = ne ? [] : {}
                  , fe = ne ? _ : A;
                for (const z in Q)
                    if (Object.prototype.hasOwnProperty.call(Q, z)) {
                        const k = `${fe}${d}${z}`;
                        W && !E ? oe[z] = this.translate(k, {
                            ...c,
                            defaultValue: Eo(Ce) ? Ce[z] : void 0,
                            joinArrays: !1,
                            ns: g
                        }) : oe[z] = this.translate(k, {
                            ...c,
                            joinArrays: !1,
                            ns: g
                        }),
                        oe[z] === k && (oe[z] = Q[z])
                    }
                E = oe
            }
        } else if (V && ae(G) && Array.isArray(E))
            E = E.join(G),
            E && (E = this.extendTranslation(E, a, c, u));
        else {
            let ne = !1
              , oe = !1;
            !this.isValidLookup(E) && W && (ne = !0,
            E = Ce),
            this.isValidLookup(E) || (oe = !0,
            E = m);
            const z = (c.missingKeyNoValueFallbackToKey || this.options.missingKeyNoValueFallbackToKey) && oe ? void 0 : E
              , k = W && Ce !== E && this.options.updateMissing;
            if (oe || ne || k) {
                if (this.logger.log(k ? "updateKey" : "missingKey", v, p, m, k ? Ce : E),
                d) {
                    const T = this.resolve(m, {
                        ...c,
                        keySeparator: !1
                    });
                    T && T.res && this.logger.warn("Seems the loaded translations were in flat JSON format instead of nested. Either set keySeparator: false on init or make sure your translations are published in nested format.")
                }
                let te = [];
                const be = this.languageUtils.getFallbackCodes(this.options.fallbackLng, c.lng || this.language);
                if (this.options.saveMissingTo === "fallback" && be && be[0])
                    for (let T = 0; T < be.length; T++)
                        te.push(be[T]);
                else
                    this.options.saveMissingTo === "all" ? te = this.languageUtils.toResolveHierarchy(c.lng || this.language) : te.push(c.lng || this.language);
                const we = (T, B, Z) => {
                    const J = W && Z !== E ? Z : z;
                    this.options.missingKeyHandler ? this.options.missingKeyHandler(T, p, B, J, k, c) : this.backendConnector?.saveMissing && this.backendConnector.saveMissing(T, p, B, J, k, c),
                    this.emit("missingKey", T, p, B, E)
                }
                ;
                this.options.saveMissing && (this.options.saveMissingPlurals && F ? te.forEach(T => {
                    const B = this.pluralResolver.getSuffixes(T, c);
                    ye && c[`defaultValue${this.options.pluralSeparator}zero`] && B.indexOf(`${this.options.pluralSeparator}zero`) < 0 && B.push(`${this.options.pluralSeparator}zero`),
                    B.forEach(Z => {
                        we([T], m + Z, c[`defaultValue${Z}`] || Ce)
                    }
                    )
                }
                ) : we(te, m, Ce))
            }
            E = this.extendTranslation(E, a, c, x, u),
            oe && E === m && this.options.appendNamespaceToMissingKey && (E = `${p}${b}${m}`),
            (oe || ne) && this.options.parseMissingKeyHandler && (E = this.options.parseMissingKeyHandler(this.options.appendNamespaceToMissingKey ? `${p}${b}${m}` : m, ne ? E : void 0, c))
        }
        return f ? (x.res = E,
        x.usedParams = this.getUsedParamsDetails(c),
        x) : E
    }
    extendTranslation(a, r, u, c, f) {
        if (this.i18nFormat?.parse)
            a = this.i18nFormat.parse(a, {
                ...this.options.interpolation.defaultVariables,
                ...u
            }, u.lng || this.language || c.usedLng, c.usedNS, c.usedKey, {
                resolved: c
            });
        else if (!u.skipInterpolation) {
            u.interpolation && this.interpolator.init({
                ...u,
                interpolation: {
                    ...this.options.interpolation,
                    ...u.interpolation
                }
            });
            const g = ae(a) && (u?.interpolation?.skipOnVariables !== void 0 ? u.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables);
            let p;
            if (g) {
                const v = a.match(this.interpolator.nestingRegexp);
                p = v && v.length
            }
            let b = u.replace && !ae(u.replace) ? u.replace : u;
            if (this.options.interpolation.defaultVariables && (b = {
                ...this.options.interpolation.defaultVariables,
                ...b
            }),
            a = this.interpolator.interpolate(a, b, u.lng || this.language || c.usedLng, u),
            g) {
                const v = a.match(this.interpolator.nestingRegexp)
                  , S = v && v.length;
                p < S && (u.nest = !1)
            }
            !u.lng && c && c.res && (u.lng = this.language || c.usedLng),
            u.nest !== !1 && (a = this.interpolator.nest(a, (...v) => f?.[0] === v[0] && !u.context ? (this.logger.warn(`It seems you are nesting recursively key: ${v[0]} in key: ${r[0]}`),
            null) : this.translate(...v, r), u)),
            u.interpolation && this.interpolator.reset()
        }
        const d = u.postProcess || this.options.postProcess
          , m = ae(d) ? [d] : d;
        return a != null && m?.length && u.applyPostProcessor !== !1 && (a = qg.handle(m, a, r, this.options && this.options.postProcessPassResolved ? {
            i18nResolved: {
                ...c,
                usedParams: this.getUsedParamsDetails(u)
            },
            ...u
        } : u, this)),
        a
    }
    resolve(a, r={}) {
        let u, c, f, d, m;
        return ae(a) && (a = [a]),
        a.forEach(g => {
            if (this.isValidLookup(u))
                return;
            const p = this.extractFromKey(g, r)
              , b = p.key;
            c = b;
            let v = p.namespaces;
            this.options.fallbackNS && (v = v.concat(this.options.fallbackNS));
            const S = r.count !== void 0 && !ae(r.count)
              , x = S && !r.ordinal && r.count === 0
              , E = r.context !== void 0 && (ae(r.context) || typeof r.context == "number") && r.context !== ""
              , A = r.lngs ? r.lngs : this.languageUtils.toResolveHierarchy(r.lng || this.language, r.fallbackLng);
            v.forEach(_ => {
                this.isValidLookup(u) || (m = _,
                !qm[`${A[0]}-${_}`] && this.utils?.hasLoadedNamespace && !this.utils?.hasLoadedNamespace(m) && (qm[`${A[0]}-${_}`] = !0,
                this.logger.warn(`key "${c}" for languages "${A.join(", ")}" won't get resolved as namespace "${m}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!")),
                A.forEach(D => {
                    if (this.isValidLookup(u))
                        return;
                    d = D;
                    const G = [b];
                    if (this.i18nFormat?.addLookupKeys)
                        this.i18nFormat.addLookupKeys(G, b, D, _, r);
                    else {
                        let F;
                        S && (F = this.pluralResolver.getSuffix(D, r.count, r));
                        const W = `${this.options.pluralSeparator}zero`
                          , ue = `${this.options.pluralSeparator}ordinal${this.options.pluralSeparator}`;
                        if (S && (r.ordinal && F.indexOf(ue) === 0 && G.push(b + F.replace(ue, this.options.pluralSeparator)),
                        G.push(b + F),
                        x && G.push(b + W)),
                        E) {
                            const P = `${b}${this.options.contextSeparator || "_"}${r.context}`;
                            G.push(P),
                            S && (r.ordinal && F.indexOf(ue) === 0 && G.push(P + F.replace(ue, this.options.pluralSeparator)),
                            G.push(P + F),
                            x && G.push(P + W))
                        }
                    }
                    let V;
                    for (; V = G.pop(); )
                        this.isValidLookup(u) || (f = V,
                        u = this.getResource(D, _, V, r))
                }
                ))
            }
            )
        }
        ),
        {
            res: u,
            usedKey: c,
            exactUsedKey: f,
            usedLng: d,
            usedNS: m
        }
    }
    isValidLookup(a) {
        return a !== void 0 && !(!this.options.returnNull && a === null) && !(!this.options.returnEmptyString && a === "")
    }
    getResource(a, r, u, c={}) {
        return this.i18nFormat?.getResource ? this.i18nFormat.getResource(a, r, u, c) : this.resourceStore.getResource(a, r, u, c)
    }
    getUsedParamsDetails(a={}) {
        const r = ["defaultValue", "ordinal", "context", "replace", "lng", "lngs", "fallbackLng", "ns", "keySeparator", "nsSeparator", "returnObjects", "returnDetails", "joinArrays", "postProcess", "interpolation"]
          , u = a.replace && !ae(a.replace);
        let c = u ? a.replace : a;
        if (u && typeof a.count < "u" && (c.count = a.count),
        this.options.interpolation.defaultVariables && (c = {
            ...this.options.interpolation.defaultVariables,
            ...c
        }),
        !u) {
            c = {
                ...c
            };
            for (const f of r)
                delete c[f]
        }
        return c
    }
    static hasDefaultValue(a) {
        const r = "defaultValue";
        for (const u in a)
            if (Object.prototype.hasOwnProperty.call(a, u) && r === u.substring(0, r.length) && a[u] !== void 0)
                return !0;
        return !1
    }
}
class Gm {
    constructor(a) {
        this.options = a,
        this.supportedLngs = this.options.supportedLngs || !1,
        this.logger = Yt.create("languageUtils")
    }
    getScriptPartFromCode(a) {
        if (a = Wa(a),
        !a || a.indexOf("-") < 0)
            return null;
        const r = a.split("-");
        return r.length === 2 || (r.pop(),
        r[r.length - 1].toLowerCase() === "x") ? null : this.formatLanguageCode(r.join("-"))
    }
    getLanguagePartFromCode(a) {
        if (a = Wa(a),
        !a || a.indexOf("-") < 0)
            return a;
        const r = a.split("-");
        return this.formatLanguageCode(r[0])
    }
    formatLanguageCode(a) {
        if (ae(a) && a.indexOf("-") > -1) {
            let r;
            try {
                r = Intl.getCanonicalLocales(a)[0]
            } catch {}
            return r && this.options.lowerCaseLng && (r = r.toLowerCase()),
            r || (this.options.lowerCaseLng ? a.toLowerCase() : a)
        }
        return this.options.cleanCode || this.options.lowerCaseLng ? a.toLowerCase() : a
    }
    isSupportedCode(a) {
        return (this.options.load === "languageOnly" || this.options.nonExplicitSupportedLngs) && (a = this.getLanguagePartFromCode(a)),
        !this.supportedLngs || !this.supportedLngs.length || this.supportedLngs.indexOf(a) > -1
    }
    getBestMatchFromCodes(a) {
        if (!a)
            return null;
        let r;
        return a.forEach(u => {
            if (r)
                return;
            const c = this.formatLanguageCode(u);
            (!this.options.supportedLngs || this.isSupportedCode(c)) && (r = c)
        }
        ),
        !r && this.options.supportedLngs && a.forEach(u => {
            if (r)
                return;
            const c = this.getScriptPartFromCode(u);
            if (this.isSupportedCode(c))
                return r = c;
            const f = this.getLanguagePartFromCode(u);
            if (this.isSupportedCode(f))
                return r = f;
            r = this.options.supportedLngs.find(d => {
                if (d === f)
                    return d;
                if (!(d.indexOf("-") < 0 && f.indexOf("-") < 0) && (d.indexOf("-") > 0 && f.indexOf("-") < 0 && d.substring(0, d.indexOf("-")) === f || d.indexOf(f) === 0 && f.length > 1))
                    return d
            }
            )
        }
        ),
        r || (r = this.getFallbackCodes(this.options.fallbackLng)[0]),
        r
    }
    getFallbackCodes(a, r) {
        if (!a)
            return [];
        if (typeof a == "function" && (a = a(r)),
        ae(a) && (a = [a]),
        Array.isArray(a))
            return a;
        if (!r)
            return a.default || [];
        let u = a[r];
        return u || (u = a[this.getScriptPartFromCode(r)]),
        u || (u = a[this.formatLanguageCode(r)]),
        u || (u = a[this.getLanguagePartFromCode(r)]),
        u || (u = a.default),
        u || []
    }
    toResolveHierarchy(a, r) {
        const u = this.getFallbackCodes((r === !1 ? [] : r) || this.options.fallbackLng || [], a)
          , c = []
          , f = d => {
            d && (this.isSupportedCode(d) ? c.push(d) : this.logger.warn(`rejecting language code not found in supportedLngs: ${d}`))
        }
        ;
        return ae(a) && (a.indexOf("-") > -1 || a.indexOf("_") > -1) ? (this.options.load !== "languageOnly" && f(this.formatLanguageCode(a)),
        this.options.load !== "languageOnly" && this.options.load !== "currentOnly" && f(this.getScriptPartFromCode(a)),
        this.options.load !== "currentOnly" && f(this.getLanguagePartFromCode(a))) : ae(a) && f(this.formatLanguageCode(a)),
        u.forEach(d => {
            c.indexOf(d) < 0 && f(this.formatLanguageCode(d))
        }
        ),
        c
    }
}
const Ym = {
    zero: 0,
    one: 1,
    two: 2,
    few: 3,
    many: 4,
    other: 5
}
  , Vm = {
    select: i => i === 1 ? "one" : "other",
    resolvedOptions: () => ({
        pluralCategories: ["one", "other"]
    })
};
class o1 {
    constructor(a, r={}) {
        this.languageUtils = a,
        this.options = r,
        this.logger = Yt.create("pluralResolver"),
        this.pluralRulesCache = {}
    }
    clearCache() {
        this.pluralRulesCache = {}
    }
    getRule(a, r={}) {
        const u = Wa(a === "dev" ? "en" : a)
          , c = r.ordinal ? "ordinal" : "cardinal"
          , f = JSON.stringify({
            cleanedCode: u,
            type: c
        });
        if (f in this.pluralRulesCache)
            return this.pluralRulesCache[f];
        let d;
        try {
            d = new Intl.PluralRules(u,{
                type: c
            })
        } catch {
            if (typeof Intl > "u")
                return this.logger.error("No Intl support, please use an Intl polyfill!"),
                Vm;
            if (!a.match(/-|_/))
                return Vm;
            const g = this.languageUtils.getLanguagePartFromCode(a);
            d = this.getRule(g, r)
        }
        return this.pluralRulesCache[f] = d,
        d
    }
    needsPlural(a, r={}) {
        let u = this.getRule(a, r);
        return u || (u = this.getRule("dev", r)),
        u?.resolvedOptions().pluralCategories.length > 1
    }
    getPluralFormsOfKey(a, r, u={}) {
        return this.getSuffixes(a, u).map(c => `${r}${c}`)
    }
    getSuffixes(a, r={}) {
        let u = this.getRule(a, r);
        return u || (u = this.getRule("dev", r)),
        u ? u.resolvedOptions().pluralCategories.sort( (c, f) => Ym[c] - Ym[f]).map(c => `${this.options.prepend}${r.ordinal ? `ordinal${this.options.prepend}` : ""}${c}`) : []
    }
    getSuffix(a, r, u={}) {
        const c = this.getRule(a, u);
        return c ? `${this.options.prepend}${u.ordinal ? `ordinal${this.options.prepend}` : ""}${c.select(r)}` : (this.logger.warn(`no plural rule found for: ${a}`),
        this.getSuffix("dev", r, u))
    }
}
const Qm = (i, a, r, u=".", c=!0) => {
    let f = e1(i, a, r);
    return !f && c && ae(r) && (f = Mo(i, r, u),
    f === void 0 && (f = Mo(a, r, u))),
    f
}
  , wo = i => i.replace(/\$/g, "$$$$");
class km {
    constructor(a={}) {
        this.logger = Yt.create("interpolator"),
        this.options = a,
        this.format = a?.interpolation?.format || (r => r),
        this.init(a)
    }
    init(a={}) {
        a.interpolation || (a.interpolation = {
            escapeValue: !0
        });
        const {escape: r, escapeValue: u, useRawValueToEscape: c, prefix: f, prefixEscaped: d, suffix: m, suffixEscaped: g, formatSeparator: p, unescapeSuffix: b, unescapePrefix: v, nestingPrefix: S, nestingPrefixEscaped: x, nestingSuffix: E, nestingSuffixEscaped: A, nestingOptionsSeparator: _, maxReplaces: D, alwaysFormat: G} = a.interpolation;
        this.escape = r !== void 0 ? r : n1,
        this.escapeValue = u !== void 0 ? u : !0,
        this.useRawValueToEscape = c !== void 0 ? c : !1,
        this.prefix = f ? nl(f) : d || "{{",
        this.suffix = m ? nl(m) : g || "}}",
        this.formatSeparator = p || ",",
        this.unescapePrefix = b ? "" : v || "-",
        this.unescapeSuffix = this.unescapePrefix ? "" : b || "",
        this.nestingPrefix = S ? nl(S) : x || nl("$t("),
        this.nestingSuffix = E ? nl(E) : A || nl(")"),
        this.nestingOptionsSeparator = _ || ",",
        this.maxReplaces = D || 1e3,
        this.alwaysFormat = G !== void 0 ? G : !1,
        this.resetRegExp()
    }
    reset() {
        this.options && this.init(this.options)
    }
    resetRegExp() {
        const a = (r, u) => r?.source === u ? (r.lastIndex = 0,
        r) : new RegExp(u,"g");
        this.regexp = a(this.regexp, `${this.prefix}(.+?)${this.suffix}`),
        this.regexpUnescape = a(this.regexpUnescape, `${this.prefix}${this.unescapePrefix}(.+?)${this.unescapeSuffix}${this.suffix}`),
        this.nestingRegexp = a(this.nestingRegexp, `${this.nestingPrefix}((?:[^()"']+|"[^"]*"|'[^']*'|\\((?:[^()]|"[^"]*"|'[^']*')*\\))*?)${this.nestingSuffix}`)
    }
    interpolate(a, r, u, c) {
        let f, d, m;
        const g = this.options && this.options.interpolation && this.options.interpolation.defaultVariables || {}
          , p = x => {
            if (x.indexOf(this.formatSeparator) < 0) {
                const D = Qm(r, g, x, this.options.keySeparator, this.options.ignoreJSONStructure);
                return this.alwaysFormat ? this.format(D, void 0, u, {
                    ...c,
                    ...r,
                    interpolationkey: x
                }) : D
            }
            const E = x.split(this.formatSeparator)
              , A = E.shift().trim()
              , _ = E.join(this.formatSeparator).trim();
            return this.format(Qm(r, g, A, this.options.keySeparator, this.options.ignoreJSONStructure), _, u, {
                ...c,
                ...r,
                interpolationkey: A
            })
        }
        ;
        this.resetRegExp();
        const b = c?.missingInterpolationHandler || this.options.missingInterpolationHandler
          , v = c?.interpolation?.skipOnVariables !== void 0 ? c.interpolation.skipOnVariables : this.options.interpolation.skipOnVariables;
        return [{
            regex: this.regexpUnescape,
            safeValue: x => wo(x)
        }, {
            regex: this.regexp,
            safeValue: x => this.escapeValue ? wo(this.escape(x)) : wo(x)
        }].forEach(x => {
            for (m = 0; f = x.regex.exec(a); ) {
                const E = f[1].trim();
                if (d = p(E),
                d === void 0)
                    if (typeof b == "function") {
                        const _ = b(a, f, c);
                        d = ae(_) ? _ : ""
                    } else if (c && Object.prototype.hasOwnProperty.call(c, E))
                        d = "";
                    else if (v) {
                        d = f[0];
                        continue
                    } else
                        this.logger.warn(`missed to pass in variable ${E} for interpolating ${a}`),
                        d = "";
                else
                    !ae(d) && !this.useRawValueToEscape && (d = Mm(d));
                const A = x.safeValue(d);
                if (a = a.replace(f[0], A),
                v ? (x.regex.lastIndex += d.length,
                x.regex.lastIndex -= f[0].length) : x.regex.lastIndex = 0,
                m++,
                m >= this.maxReplaces)
                    break
            }
        }
        ),
        a
    }
    nest(a, r, u={}) {
        let c, f, d;
        const m = (g, p) => {
            const b = this.nestingOptionsSeparator;
            if (g.indexOf(b) < 0)
                return g;
            const v = g.split(new RegExp(`${nl(b)}[ ]*{`));
            let S = `{${v[1]}`;
            g = v[0],
            S = this.interpolate(S, d);
            const x = S.match(/'/g)
              , E = S.match(/"/g);
            ((x?.length ?? 0) % 2 === 0 && !E || (E?.length ?? 0) % 2 !== 0) && (S = S.replace(/'/g, '"'));
            try {
                d = JSON.parse(S),
                p && (d = {
                    ...p,
                    ...d
                })
            } catch (A) {
                return this.logger.warn(`failed parsing options string in nesting for key ${g}`, A),
                `${g}${b}${S}`
            }
            return d.defaultValue && d.defaultValue.indexOf(this.prefix) > -1 && delete d.defaultValue,
            g
        }
        ;
        for (; c = this.nestingRegexp.exec(a); ) {
            let g = [];
            d = {
                ...u
            },
            d = d.replace && !ae(d.replace) ? d.replace : d,
            d.applyPostProcessor = !1,
            delete d.defaultValue;
            const p = /{.*}/.test(c[1]) ? c[1].lastIndexOf("}") + 1 : c[1].indexOf(this.formatSeparator);
            if (p !== -1 && (g = c[1].slice(p).split(this.formatSeparator).map(b => b.trim()).filter(Boolean),
            c[1] = c[1].slice(0, p)),
            f = r(m.call(this, c[1].trim(), d), d),
            f && c[0] === a && !ae(f))
                return f;
            ae(f) || (f = Mm(f)),
            f || (this.logger.warn(`missed to resolve ${c[1]} for nesting ${a}`),
            f = ""),
            g.length && (f = g.reduce( (b, v) => this.format(b, v, u.lng, {
                ...u,
                interpolationkey: c[1].trim()
            }), f.trim())),
            a = a.replace(c[0], f),
            this.regexp.lastIndex = 0
        }
        return a
    }
}
const c1 = i => {
    let a = i.toLowerCase().trim();
    const r = {};
    if (i.indexOf("(") > -1) {
        const u = i.split("(");
        a = u[0].toLowerCase().trim();
        const c = u[1].substring(0, u[1].length - 1);
        a === "currency" && c.indexOf(":") < 0 ? r.currency || (r.currency = c.trim()) : a === "relativetime" && c.indexOf(":") < 0 ? r.range || (r.range = c.trim()) : c.split(";").forEach(d => {
            if (d) {
                const [m,...g] = d.split(":")
                  , p = g.join(":").trim().replace(/^'+|'+$/g, "")
                  , b = m.trim();
                r[b] || (r[b] = p),
                p === "false" && (r[b] = !1),
                p === "true" && (r[b] = !0),
                isNaN(p) || (r[b] = parseInt(p, 10))
            }
        }
        )
    }
    return {
        formatName: a,
        formatOptions: r
    }
}
  , Xm = i => {
    const a = {};
    return (r, u, c) => {
        let f = c;
        c && c.interpolationkey && c.formatParams && c.formatParams[c.interpolationkey] && c[c.interpolationkey] && (f = {
            ...f,
            [c.interpolationkey]: void 0
        });
        const d = u + JSON.stringify(f);
        let m = a[d];
        return m || (m = i(Wa(u), c),
        a[d] = m),
        m(r)
    }
}
  , f1 = i => (a, r, u) => i(Wa(r), u)(a);
class d1 {
    constructor(a={}) {
        this.logger = Yt.create("formatter"),
        this.options = a,
        this.init(a)
    }
    init(a, r={
        interpolation: {}
    }) {
        this.formatSeparator = r.interpolation.formatSeparator || ",";
        const u = r.cacheInBuiltFormats ? Xm : f1;
        this.formats = {
            number: u( (c, f) => {
                const d = new Intl.NumberFormat(c,{
                    ...f
                });
                return m => d.format(m)
            }
            ),
            currency: u( (c, f) => {
                const d = new Intl.NumberFormat(c,{
                    ...f,
                    style: "currency"
                });
                return m => d.format(m)
            }
            ),
            datetime: u( (c, f) => {
                const d = new Intl.DateTimeFormat(c,{
                    ...f
                });
                return m => d.format(m)
            }
            ),
            relativetime: u( (c, f) => {
                const d = new Intl.RelativeTimeFormat(c,{
                    ...f
                });
                return m => d.format(m, f.range || "day")
            }
            ),
            list: u( (c, f) => {
                const d = new Intl.ListFormat(c,{
                    ...f
                });
                return m => d.format(m)
            }
            )
        }
    }
    add(a, r) {
        this.formats[a.toLowerCase().trim()] = r
    }
    addCached(a, r) {
        this.formats[a.toLowerCase().trim()] = Xm(r)
    }
    format(a, r, u, c={}) {
        const f = r.split(this.formatSeparator);
        if (f.length > 1 && f[0].indexOf("(") > 1 && f[0].indexOf(")") < 0 && f.find(m => m.indexOf(")") > -1)) {
            const m = f.findIndex(g => g.indexOf(")") > -1);
            f[0] = [f[0], ...f.splice(1, m)].join(this.formatSeparator)
        }
        return f.reduce( (m, g) => {
            const {formatName: p, formatOptions: b} = c1(g);
            if (this.formats[p]) {
                let v = m;
                try {
                    const S = c?.formatParams?.[c.interpolationkey] || {}
                      , x = S.locale || S.lng || c.locale || c.lng || u;
                    v = this.formats[p](m, x, {
                        ...b,
                        ...c,
                        ...S
                    })
                } catch (S) {
                    this.logger.warn(S)
                }
                return v
            } else
                this.logger.warn(`there was no format function for ${p}`);
            return m
        }
        , a)
    }
}
const h1 = (i, a) => {
    i.pending[a] !== void 0 && (delete i.pending[a],
    i.pendingCount--)
}
;
class m1 extends zs {
    constructor(a, r, u, c={}) {
        super(),
        this.backend = a,
        this.store = r,
        this.services = u,
        this.languageUtils = u.languageUtils,
        this.options = c,
        this.logger = Yt.create("backendConnector"),
        this.waitingReads = [],
        this.maxParallelReads = c.maxParallelReads || 10,
        this.readingCalls = 0,
        this.maxRetries = c.maxRetries >= 0 ? c.maxRetries : 5,
        this.retryTimeout = c.retryTimeout >= 1 ? c.retryTimeout : 350,
        this.state = {},
        this.queue = [],
        this.backend?.init?.(u, c.backend, c)
    }
    queueLoad(a, r, u, c) {
        const f = {}
          , d = {}
          , m = {}
          , g = {};
        return a.forEach(p => {
            let b = !0;
            r.forEach(v => {
                const S = `${p}|${v}`;
                !u.reload && this.store.hasResourceBundle(p, v) ? this.state[S] = 2 : this.state[S] < 0 || (this.state[S] === 1 ? d[S] === void 0 && (d[S] = !0) : (this.state[S] = 1,
                b = !1,
                d[S] === void 0 && (d[S] = !0),
                f[S] === void 0 && (f[S] = !0),
                g[v] === void 0 && (g[v] = !0)))
            }
            ),
            b || (m[p] = !0)
        }
        ),
        (Object.keys(f).length || Object.keys(d).length) && this.queue.push({
            pending: d,
            pendingCount: Object.keys(d).length,
            loaded: {},
            errors: [],
            callback: c
        }),
        {
            toLoad: Object.keys(f),
            pending: Object.keys(d),
            toLoadLanguages: Object.keys(m),
            toLoadNamespaces: Object.keys(g)
        }
    }
    loaded(a, r, u) {
        const c = a.split("|")
          , f = c[0]
          , d = c[1];
        r && this.emit("failedLoading", f, d, r),
        !r && u && this.store.addResourceBundle(f, d, u, void 0, void 0, {
            skipCopy: !0
        }),
        this.state[a] = r ? -1 : 2,
        r && u && (this.state[a] = 0);
        const m = {};
        this.queue.forEach(g => {
            Iv(g.loaded, [f], d),
            h1(g, a),
            r && g.errors.push(r),
            g.pendingCount === 0 && !g.done && (Object.keys(g.loaded).forEach(p => {
                m[p] || (m[p] = {});
                const b = g.loaded[p];
                b.length && b.forEach(v => {
                    m[p][v] === void 0 && (m[p][v] = !0)
                }
                )
            }
            ),
            g.done = !0,
            g.errors.length ? g.callback(g.errors) : g.callback())
        }
        ),
        this.emit("loaded", m),
        this.queue = this.queue.filter(g => !g.done)
    }
    read(a, r, u, c=0, f=this.retryTimeout, d) {
        if (!a.length)
            return d(null, {});
        if (this.readingCalls >= this.maxParallelReads) {
            this.waitingReads.push({
                lng: a,
                ns: r,
                fcName: u,
                tried: c,
                wait: f,
                callback: d
            });
            return
        }
        this.readingCalls++;
        const m = (p, b) => {
            if (this.readingCalls--,
            this.waitingReads.length > 0) {
                const v = this.waitingReads.shift();
                this.read(v.lng, v.ns, v.fcName, v.tried, v.wait, v.callback)
            }
            if (p && b && c < this.maxRetries) {
                setTimeout( () => {
                    this.read.call(this, a, r, u, c + 1, f * 2, d)
                }
                , f);
                return
            }
            d(p, b)
        }
          , g = this.backend[u].bind(this.backend);
        if (g.length === 2) {
            try {
                const p = g(a, r);
                p && typeof p.then == "function" ? p.then(b => m(null, b)).catch(m) : m(null, p)
            } catch (p) {
                m(p)
            }
            return
        }
        return g(a, r, m)
    }
    prepareLoading(a, r, u={}, c) {
        if (!this.backend)
            return this.logger.warn("No backend was added via i18next.use. Will not load resources."),
            c && c();
        ae(a) && (a = this.languageUtils.toResolveHierarchy(a)),
        ae(r) && (r = [r]);
        const f = this.queueLoad(a, r, u, c);
        if (!f.toLoad.length)
            return f.pending.length || c(),
            null;
        f.toLoad.forEach(d => {
            this.loadOne(d)
        }
        )
    }
    load(a, r, u) {
        this.prepareLoading(a, r, {}, u)
    }
    reload(a, r, u) {
        this.prepareLoading(a, r, {
            reload: !0
        }, u)
    }
    loadOne(a, r="") {
        const u = a.split("|")
          , c = u[0]
          , f = u[1];
        this.read(c, f, "read", void 0, void 0, (d, m) => {
            d && this.logger.warn(`${r}loading namespace ${f} for language ${c} failed`, d),
            !d && m && this.logger.log(`${r}loaded namespace ${f} for language ${c}`, m),
            this.loaded(a, d, m)
        }
        )
    }
    saveMissing(a, r, u, c, f, d={}, m= () => {}
    ) {
        if (this.services?.utils?.hasLoadedNamespace && !this.services?.utils?.hasLoadedNamespace(r)) {
            this.logger.warn(`did not save key "${u}" as the namespace "${r}" was not yet loaded`, "This means something IS WRONG in your setup. You access the t function before i18next.init / i18next.loadNamespace / i18next.changeLanguage was done. Wait for the callback or Promise to resolve before accessing it!!!");
            return
        }
        if (!(u == null || u === "")) {
            if (this.backend?.create) {
                const g = {
                    ...d,
                    isUpdate: f
                }
                  , p = this.backend.create.bind(this.backend);
                if (p.length < 6)
                    try {
                        let b;
                        p.length === 5 ? b = p(a, r, u, c, g) : b = p(a, r, u, c),
                        b && typeof b.then == "function" ? b.then(v => m(null, v)).catch(m) : m(null, b)
                    } catch (b) {
                        m(b)
                    }
                else
                    p(a, r, u, c, m, g)
            }
            !a || !a[0] || this.store.addResource(a[0], r, u, c)
        }
    }
}
const _o = () => ({
    debug: !1,
    initAsync: !0,
    ns: ["translation"],
    defaultNS: ["translation"],
    fallbackLng: ["dev"],
    fallbackNS: !1,
    supportedLngs: !1,
    nonExplicitSupportedLngs: !1,
    load: "all",
    preload: !1,
    simplifyPluralSuffix: !0,
    keySeparator: ".",
    nsSeparator: ":",
    pluralSeparator: "_",
    contextSeparator: "_",
    partialBundledLanguages: !1,
    saveMissing: !1,
    updateMissing: !1,
    saveMissingTo: "fallback",
    saveMissingPlurals: !0,
    missingKeyHandler: !1,
    missingInterpolationHandler: !1,
    postProcess: !1,
    postProcessPassResolved: !1,
    returnNull: !1,
    returnEmptyString: !0,
    returnObjects: !1,
    joinArrays: !1,
    returnedObjectHandler: !1,
    parseMissingKeyHandler: !1,
    appendNamespaceToMissingKey: !1,
    appendNamespaceToCIMode: !1,
    overloadTranslationOptionHandler: i => {
        let a = {};
        if (typeof i[1] == "object" && (a = i[1]),
        ae(i[1]) && (a.defaultValue = i[1]),
        ae(i[2]) && (a.tDescription = i[2]),
        typeof i[2] == "object" || typeof i[3] == "object") {
            const r = i[3] || i[2];
            Object.keys(r).forEach(u => {
                a[u] = r[u]
            }
            )
        }
        return a
    }
    ,
    interpolation: {
        escapeValue: !0,
        format: i => i,
        prefix: "{{",
        suffix: "}}",
        formatSeparator: ",",
        unescapePrefix: "-",
        nestingPrefix: "$t(",
        nestingSuffix: ")",
        nestingOptionsSeparator: ",",
        maxReplaces: 1e3,
        skipOnVariables: !0
    },
    cacheInBuiltFormats: !0
})
  , Zm = i => (ae(i.ns) && (i.ns = [i.ns]),
ae(i.fallbackLng) && (i.fallbackLng = [i.fallbackLng]),
ae(i.fallbackNS) && (i.fallbackNS = [i.fallbackNS]),
i.supportedLngs?.indexOf?.("cimode") < 0 && (i.supportedLngs = i.supportedLngs.concat(["cimode"])),
typeof i.initImmediate == "boolean" && (i.initAsync = i.initImmediate),
i)
  , Cs = () => {}
  , g1 = i => {
    Object.getOwnPropertyNames(Object.getPrototypeOf(i)).forEach(r => {
        typeof i[r] == "function" && (i[r] = i[r].bind(i))
    }
    )
}
  , Yg = "__i18next_supportNoticeShown"
  , p1 = () => typeof globalThis < "u" && !!globalThis[Yg]
  , y1 = () => {
    typeof globalThis < "u" && (globalThis[Yg] = !0)
}
  , v1 = i => !!(i?.modules?.backend?.name?.indexOf("Locize") > 0 || i?.modules?.backend?.constructor?.name?.indexOf("Locize") > 0 || i?.options?.backend?.backends && i.options.backend.backends.some(a => a?.name?.indexOf("Locize") > 0 || a?.constructor?.name?.indexOf("Locize") > 0) || i?.options?.backend?.projectId || i?.options?.backend?.backendOptions && i.options.backend.backendOptions.some(a => a?.projectId));
class $a extends zs {
    constructor(a={}, r) {
        if (super(),
        this.options = Zm(a),
        this.services = {},
        this.logger = Yt,
        this.modules = {
            external: []
        },
        g1(this),
        r && !this.isInitialized && !a.isClone) {
            if (!this.options.initAsync)
                return this.init(a, r),
                this;
            setTimeout( () => {
                this.init(a, r)
            }
            , 0)
        }
    }
    init(a={}, r) {
        this.isInitializing = !0,
        typeof a == "function" && (r = a,
        a = {}),
        a.defaultNS == null && a.ns && (ae(a.ns) ? a.defaultNS = a.ns : a.ns.indexOf("translation") < 0 && (a.defaultNS = a.ns[0]));
        const u = _o();
        this.options = {
            ...u,
            ...this.options,
            ...Zm(a)
        },
        this.options.interpolation = {
            ...u.interpolation,
            ...this.options.interpolation
        },
        a.keySeparator !== void 0 && (this.options.userDefinedKeySeparator = a.keySeparator),
        a.nsSeparator !== void 0 && (this.options.userDefinedNsSeparator = a.nsSeparator),
        typeof this.options.overloadTranslationOptionHandler != "function" && (this.options.overloadTranslationOptionHandler = u.overloadTranslationOptionHandler),
        this.options.showSupportNotice !== !1 && !v1(this) && !p1() && (typeof console < "u" && typeof console.info < "u" && console.info("🌐 i18next is maintained with support from Locize — consider powering your project with managed localization (AI, CDN, integrations): https://locize.com 💙"),
        y1());
        const c = p => p ? typeof p == "function" ? new p : p : null;
        if (!this.options.isClone) {
            this.modules.logger ? Yt.init(c(this.modules.logger), this.options) : Yt.init(null, this.options);
            let p;
            this.modules.formatter ? p = this.modules.formatter : p = d1;
            const b = new Gm(this.options);
            this.store = new Bm(this.options.resources,this.options);
            const v = this.services;
            v.logger = Yt,
            v.resourceStore = this.store,
            v.languageUtils = b,
            v.pluralResolver = new o1(b,{
                prepend: this.options.pluralSeparator,
                simplifyPluralSuffix: this.options.simplifyPluralSuffix
            }),
            this.options.interpolation.format && this.options.interpolation.format !== u.interpolation.format && this.logger.deprecate("init: you are still using the legacy format function, please use the new approach: https://www.i18next.com/translation-function/formatting"),
            p && (!this.options.interpolation.format || this.options.interpolation.format === u.interpolation.format) && (v.formatter = c(p),
            v.formatter.init && v.formatter.init(v, this.options),
            this.options.interpolation.format = v.formatter.format.bind(v.formatter)),
            v.interpolator = new km(this.options),
            v.utils = {
                hasLoadedNamespace: this.hasLoadedNamespace.bind(this)
            },
            v.backendConnector = new m1(c(this.modules.backend),v.resourceStore,v,this.options),
            v.backendConnector.on("*", (x, ...E) => {
                this.emit(x, ...E)
            }
            ),
            this.modules.languageDetector && (v.languageDetector = c(this.modules.languageDetector),
            v.languageDetector.init && v.languageDetector.init(v, this.options.detection, this.options)),
            this.modules.i18nFormat && (v.i18nFormat = c(this.modules.i18nFormat),
            v.i18nFormat.init && v.i18nFormat.init(this)),
            this.translator = new js(this.services,this.options),
            this.translator.on("*", (x, ...E) => {
                this.emit(x, ...E)
            }
            ),
            this.modules.external.forEach(x => {
                x.init && x.init(this)
            }
            )
        }
        if (this.format = this.options.interpolation.format,
        r || (r = Cs),
        this.options.fallbackLng && !this.services.languageDetector && !this.options.lng) {
            const p = this.services.languageUtils.getFallbackCodes(this.options.fallbackLng);
            p.length > 0 && p[0] !== "dev" && (this.options.lng = p[0])
        }
        !this.services.languageDetector && !this.options.lng && this.logger.warn("init: no languageDetector is used and no lng is defined"),
        ["getResource", "hasResourceBundle", "getResourceBundle", "getDataByLanguage"].forEach(p => {
            this[p] = (...b) => this.store[p](...b)
        }
        ),
        ["addResource", "addResources", "addResourceBundle", "removeResourceBundle"].forEach(p => {
            this[p] = (...b) => (this.store[p](...b),
            this)
        }
        );
        const m = Qa()
          , g = () => {
            const p = (b, v) => {
                this.isInitializing = !1,
                this.isInitialized && !this.initializedStoreOnce && this.logger.warn("init: i18next is already initialized. You should call init just once!"),
                this.isInitialized = !0,
                this.options.isClone || this.logger.log("initialized", this.options),
                this.emit("initialized", this.options),
                m.resolve(v),
                r(b, v)
            }
            ;
            if (this.languages && !this.isInitialized)
                return p(null, this.t.bind(this));
            this.changeLanguage(this.options.lng, p)
        }
        ;
        return this.options.resources || !this.options.initAsync ? g() : setTimeout(g, 0),
        m
    }
    loadResources(a, r=Cs) {
        let u = r;
        const c = ae(a) ? a : this.language;
        if (typeof a == "function" && (u = a),
        !this.options.resources || this.options.partialBundledLanguages) {
            if (c?.toLowerCase() === "cimode" && (!this.options.preload || this.options.preload.length === 0))
                return u();
            const f = []
              , d = m => {
                if (!m || m === "cimode")
                    return;
                this.services.languageUtils.toResolveHierarchy(m).forEach(p => {
                    p !== "cimode" && f.indexOf(p) < 0 && f.push(p)
                }
                )
            }
            ;
            c ? d(c) : this.services.languageUtils.getFallbackCodes(this.options.fallbackLng).forEach(g => d(g)),
            this.options.preload?.forEach?.(m => d(m)),
            this.services.backendConnector.load(f, this.options.ns, m => {
                !m && !this.resolvedLanguage && this.language && this.setResolvedLanguage(this.language),
                u(m)
            }
            )
        } else
            u(null)
    }
    reloadResources(a, r, u) {
        const c = Qa();
        return typeof a == "function" && (u = a,
        a = void 0),
        typeof r == "function" && (u = r,
        r = void 0),
        a || (a = this.languages),
        r || (r = this.options.ns),
        u || (u = Cs),
        this.services.backendConnector.reload(a, r, f => {
            c.resolve(),
            u(f)
        }
        ),
        c
    }
    use(a) {
        if (!a)
            throw new Error("You are passing an undefined module! Please check the object you are passing to i18next.use()");
        if (!a.type)
            throw new Error("You are passing a wrong module! Please check the object you are passing to i18next.use()");
        return a.type === "backend" && (this.modules.backend = a),
        (a.type === "logger" || a.log && a.warn && a.error) && (this.modules.logger = a),
        a.type === "languageDetector" && (this.modules.languageDetector = a),
        a.type === "i18nFormat" && (this.modules.i18nFormat = a),
        a.type === "postProcessor" && qg.addPostProcessor(a),
        a.type === "formatter" && (this.modules.formatter = a),
        a.type === "3rdParty" && this.modules.external.push(a),
        this
    }
    setResolvedLanguage(a) {
        if (!(!a || !this.languages) && !(["cimode", "dev"].indexOf(a) > -1)) {
            for (let r = 0; r < this.languages.length; r++) {
                const u = this.languages[r];
                if (!(["cimode", "dev"].indexOf(u) > -1) && this.store.hasLanguageSomeTranslations(u)) {
                    this.resolvedLanguage = u;
                    break
                }
            }
            !this.resolvedLanguage && this.languages.indexOf(a) < 0 && this.store.hasLanguageSomeTranslations(a) && (this.resolvedLanguage = a,
            this.languages.unshift(a))
        }
    }
    changeLanguage(a, r) {
        this.isLanguageChangingTo = a;
        const u = Qa();
        this.emit("languageChanging", a);
        const c = m => {
            this.language = m,
            this.languages = this.services.languageUtils.toResolveHierarchy(m),
            this.resolvedLanguage = void 0,
            this.setResolvedLanguage(m)
        }
          , f = (m, g) => {
            g ? this.isLanguageChangingTo === a && (c(g),
            this.translator.changeLanguage(g),
            this.isLanguageChangingTo = void 0,
            this.emit("languageChanged", g),
            this.logger.log("languageChanged", g)) : this.isLanguageChangingTo = void 0,
            u.resolve( (...p) => this.t(...p)),
            r && r(m, (...p) => this.t(...p))
        }
          , d = m => {
            !a && !m && this.services.languageDetector && (m = []);
            const g = ae(m) ? m : m && m[0]
              , p = this.store.hasLanguageSomeTranslations(g) ? g : this.services.languageUtils.getBestMatchFromCodes(ae(m) ? [m] : m);
            p && (this.language || c(p),
            this.translator.language || this.translator.changeLanguage(p),
            this.services.languageDetector?.cacheUserLanguage?.(p)),
            this.loadResources(p, b => {
                f(b, p)
            }
            )
        }
        ;
        return !a && this.services.languageDetector && !this.services.languageDetector.async ? d(this.services.languageDetector.detect()) : !a && this.services.languageDetector && this.services.languageDetector.async ? this.services.languageDetector.detect.length === 0 ? this.services.languageDetector.detect().then(d) : this.services.languageDetector.detect(d) : d(a),
        u
    }
    getFixedT(a, r, u) {
        const c = (f, d, ...m) => {
            let g;
            typeof d != "object" ? g = this.options.overloadTranslationOptionHandler([f, d].concat(m)) : g = {
                ...d
            },
            g.lng = g.lng || c.lng,
            g.lngs = g.lngs || c.lngs,
            g.ns = g.ns || c.ns,
            g.keyPrefix !== "" && (g.keyPrefix = g.keyPrefix || u || c.keyPrefix);
            const p = this.options.keySeparator || ".";
            let b;
            return g.keyPrefix && Array.isArray(f) ? b = f.map(v => (typeof v == "function" && (v = zo(v, {
                ...this.options,
                ...d
            })),
            `${g.keyPrefix}${p}${v}`)) : (typeof f == "function" && (f = zo(f, {
                ...this.options,
                ...d
            })),
            b = g.keyPrefix ? `${g.keyPrefix}${p}${f}` : f),
            this.t(b, g)
        }
        ;
        return ae(a) ? c.lng = a : c.lngs = a,
        c.ns = r,
        c.keyPrefix = u,
        c
    }
    t(...a) {
        return this.translator?.translate(...a)
    }
    exists(...a) {
        return this.translator?.exists(...a)
    }
    setDefaultNamespace(a) {
        this.options.defaultNS = a
    }
    hasLoadedNamespace(a, r={}) {
        if (!this.isInitialized)
            return this.logger.warn("hasLoadedNamespace: i18next was not initialized", this.languages),
            !1;
        if (!this.languages || !this.languages.length)
            return this.logger.warn("hasLoadedNamespace: i18n.languages were undefined or empty", this.languages),
            !1;
        const u = r.lng || this.resolvedLanguage || this.languages[0]
          , c = this.options ? this.options.fallbackLng : !1
          , f = this.languages[this.languages.length - 1];
        if (u.toLowerCase() === "cimode")
            return !0;
        const d = (m, g) => {
            const p = this.services.backendConnector.state[`${m}|${g}`];
            return p === -1 || p === 0 || p === 2
        }
        ;
        if (r.precheck) {
            const m = r.precheck(this, d);
            if (m !== void 0)
                return m
        }
        return !!(this.hasResourceBundle(u, a) || !this.services.backendConnector.backend || this.options.resources && !this.options.partialBundledLanguages || d(u, a) && (!c || d(f, a)))
    }
    loadNamespaces(a, r) {
        const u = Qa();
        return this.options.ns ? (ae(a) && (a = [a]),
        a.forEach(c => {
            this.options.ns.indexOf(c) < 0 && this.options.ns.push(c)
        }
        ),
        this.loadResources(c => {
            u.resolve(),
            r && r(c)
        }
        ),
        u) : (r && r(),
        Promise.resolve())
    }
    loadLanguages(a, r) {
        const u = Qa();
        ae(a) && (a = [a]);
        const c = this.options.preload || []
          , f = a.filter(d => c.indexOf(d) < 0 && this.services.languageUtils.isSupportedCode(d));
        return f.length ? (this.options.preload = c.concat(f),
        this.loadResources(d => {
            u.resolve(),
            r && r(d)
        }
        ),
        u) : (r && r(),
        Promise.resolve())
    }
    dir(a) {
        if (a || (a = this.resolvedLanguage || (this.languages?.length > 0 ? this.languages[0] : this.language)),
        !a)
            return "rtl";
        try {
            const c = new Intl.Locale(a);
            if (c && c.getTextInfo) {
                const f = c.getTextInfo();
                if (f && f.direction)
                    return f.direction
            }
        } catch {}
        const r = ["ar", "shu", "sqr", "ssh", "xaa", "yhd", "yud", "aao", "abh", "abv", "acm", "acq", "acw", "acx", "acy", "adf", "ads", "aeb", "aec", "afb", "ajp", "apc", "apd", "arb", "arq", "ars", "ary", "arz", "auz", "avl", "ayh", "ayl", "ayn", "ayp", "bbz", "pga", "he", "iw", "ps", "pbt", "pbu", "pst", "prp", "prd", "ug", "ur", "ydd", "yds", "yih", "ji", "yi", "hbo", "men", "xmn", "fa", "jpr", "peo", "pes", "prs", "dv", "sam", "ckb"]
          , u = this.services?.languageUtils || new Gm(_o());
        return a.toLowerCase().indexOf("-latn") > 1 ? "ltr" : r.indexOf(u.getLanguagePartFromCode(a)) > -1 || a.toLowerCase().indexOf("-arab") > 1 ? "rtl" : "ltr"
    }
    static createInstance(a={}, r) {
        const u = new $a(a,r);
        return u.createInstance = $a.createInstance,
        u
    }
    cloneInstance(a={}, r=Cs) {
        const u = a.forkResourceStore;
        u && delete a.forkResourceStore;
        const c = {
            ...this.options,
            ...a,
            isClone: !0
        }
          , f = new $a(c);
        if ((a.debug !== void 0 || a.prefix !== void 0) && (f.logger = f.logger.clone(a)),
        ["store", "services", "language"].forEach(m => {
            f[m] = this[m]
        }
        ),
        f.services = {
            ...this.services
        },
        f.services.utils = {
            hasLoadedNamespace: f.hasLoadedNamespace.bind(f)
        },
        u) {
            const m = Object.keys(this.store.data).reduce( (g, p) => (g[p] = {
                ...this.store.data[p]
            },
            g[p] = Object.keys(g[p]).reduce( (b, v) => (b[v] = {
                ...g[p][v]
            },
            b), g[p]),
            g), {});
            f.store = new Bm(m,c),
            f.services.resourceStore = f.store
        }
        if (a.interpolation) {
            const g = {
                ..._o().interpolation,
                ...this.options.interpolation,
                ...a.interpolation
            }
              , p = {
                ...c,
                interpolation: g
            };
            f.services.interpolator = new km(p)
        }
        return f.translator = new js(f.services,c),
        f.translator.on("*", (m, ...g) => {
            f.emit(m, ...g)
        }
        ),
        f.init(c, r),
        f.translator.options = c,
        f.translator.backendConnector.services.utils = {
            hasLoadedNamespace: f.hasLoadedNamespace.bind(f)
        },
        f
    }
    toJSON() {
        return {
            options: this.options,
            store: this.store,
            language: this.language,
            languages: this.languages,
            resolvedLanguage: this.resolvedLanguage
        }
    }
}
const tt = $a.createInstance();
tt.createInstance;
tt.dir;
tt.init;
tt.loadResources;
tt.reloadResources;
tt.use;
tt.changeLanguage;
tt.getFixedT;
tt.t;
tt.exists;
tt.setDefaultNamespace;
tt.hasLoadedNamespace;
tt.loadNamespaces;
tt.loadLanguages;
const b1 = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34|nbsp|#160|copy|#169|reg|#174|hellip|#8230|#x2F|#47);/g
  , x1 = {
    "&amp;": "&",
    "&#38;": "&",
    "&lt;": "<",
    "&#60;": "<",
    "&gt;": ">",
    "&#62;": ">",
    "&apos;": "'",
    "&#39;": "'",
    "&quot;": '"',
    "&#34;": '"',
    "&nbsp;": " ",
    "&#160;": " ",
    "&copy;": "©",
    "&#169;": "©",
    "&reg;": "®",
    "&#174;": "®",
    "&hellip;": "…",
    "&#8230;": "…",
    "&#x2F;": "/",
    "&#47;": "/"
}
  , S1 = i => x1[i]
  , E1 = i => i.replace(b1, S1);
let Km = {
    bindI18n: "languageChanged",
    bindI18nStore: "",
    transEmptyNodeValue: "",
    transSupportBasicHtmlNodes: !0,
    transWrapTextNodes: "",
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "p"],
    useSuspense: !0,
    unescape: E1
};
const w1 = (i={}) => {
    Km = {
        ...Km,
        ...i
    }
}
  , _1 = {
    type: "3rdParty",
    init(i) {
        w1(i.options.react)
    }
}
  , C1 = H.createContext();
function T1({i18n: i, defaultNS: a, children: r}) {
    const u = H.useMemo( () => ({
        i18n: i,
        defaultNS: a
    }), [i, a]);
    return H.createElement(C1.Provider, {
        value: u
    }, r)
}
const {slice: O1, forEach: A1} = [];
function N1(i) {
    return A1.call(O1.call(arguments, 1), a => {
        if (a)
            for (const r in a)
                i[r] === void 0 && (i[r] = a[r])
    }
    ),
    i
}
function R1(i) {
    return typeof i != "string" ? !1 : [/<\s*script.*?>/i, /<\s*\/\s*script\s*>/i, /<\s*img.*?on\w+\s*=/i, /<\s*\w+\s*on\w+\s*=.*?>/i, /javascript\s*:/i, /vbscript\s*:/i, /expression\s*\(/i, /eval\s*\(/i, /alert\s*\(/i, /document\.cookie/i, /document\.write\s*\(/i, /window\.location/i, /innerHTML/i].some(r => r.test(i))
}
const Fm = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/
  , L1 = function(i, a) {
    const u = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {
        path: "/"
    }
      , c = encodeURIComponent(a);
    let f = `${i}=${c}`;
    if (u.maxAge > 0) {
        const d = u.maxAge - 0;
        if (Number.isNaN(d))
            throw new Error("maxAge should be a Number");
        f += `; Max-Age=${Math.floor(d)}`
    }
    if (u.domain) {
        if (!Fm.test(u.domain))
            throw new TypeError("option domain is invalid");
        f += `; Domain=${u.domain}`
    }
    if (u.path) {
        if (!Fm.test(u.path))
            throw new TypeError("option path is invalid");
        f += `; Path=${u.path}`
    }
    if (u.expires) {
        if (typeof u.expires.toUTCString != "function")
            throw new TypeError("option expires is invalid");
        f += `; Expires=${u.expires.toUTCString()}`
    }
    if (u.httpOnly && (f += "; HttpOnly"),
    u.secure && (f += "; Secure"),
    u.sameSite)
        switch (typeof u.sameSite == "string" ? u.sameSite.toLowerCase() : u.sameSite) {
        case !0:
            f += "; SameSite=Strict";
            break;
        case "lax":
            f += "; SameSite=Lax";
            break;
        case "strict":
            f += "; SameSite=Strict";
            break;
        case "none":
            f += "; SameSite=None";
            break;
        default:
            throw new TypeError("option sameSite is invalid")
        }
    return u.partitioned && (f += "; Partitioned"),
    f
}
  , Jm = {
    create(i, a, r, u) {
        let c = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : {
            path: "/",
            sameSite: "strict"
        };
        r && (c.expires = new Date,
        c.expires.setTime(c.expires.getTime() + r * 60 * 1e3)),
        u && (c.domain = u),
        document.cookie = L1(i, a, c)
    },
    read(i) {
        const a = `${i}=`
          , r = document.cookie.split(";");
        for (let u = 0; u < r.length; u++) {
            let c = r[u];
            for (; c.charAt(0) === " "; )
                c = c.substring(1, c.length);
            if (c.indexOf(a) === 0)
                return c.substring(a.length, c.length)
        }
        return null
    },
    remove(i, a) {
        this.create(i, "", -1, a)
    }
};
var j1 = {
    name: "cookie",
    lookup(i) {
        let {lookupCookie: a} = i;
        if (a && typeof document < "u")
            return Jm.read(a) || void 0
    },
    cacheUserLanguage(i, a) {
        let {lookupCookie: r, cookieMinutes: u, cookieDomain: c, cookieOptions: f} = a;
        r && typeof document < "u" && Jm.create(r, i, u, c, f)
    }
}
  , D1 = {
    name: "querystring",
    lookup(i) {
        let {lookupQuerystring: a} = i, r;
        if (typeof window < "u") {
            let {search: u} = window.location;
            !window.location.search && window.location.hash?.indexOf("?") > -1 && (u = window.location.hash.substring(window.location.hash.indexOf("?")));
            const f = u.substring(1).split("&");
            for (let d = 0; d < f.length; d++) {
                const m = f[d].indexOf("=");
                m > 0 && f[d].substring(0, m) === a && (r = f[d].substring(m + 1))
            }
        }
        return r
    }
}
  , M1 = {
    name: "hash",
    lookup(i) {
        let {lookupHash: a, lookupFromHashIndex: r} = i, u;
        if (typeof window < "u") {
            const {hash: c} = window.location;
            if (c && c.length > 2) {
                const f = c.substring(1);
                if (a) {
                    const d = f.split("&");
                    for (let m = 0; m < d.length; m++) {
                        const g = d[m].indexOf("=");
                        g > 0 && d[m].substring(0, g) === a && (u = d[m].substring(g + 1))
                    }
                }
                if (u)
                    return u;
                if (!u && r > -1) {
                    const d = c.match(/\/([a-zA-Z-]*)/g);
                    return Array.isArray(d) ? d[typeof r == "number" ? r : 0]?.replace("/", "") : void 0
                }
            }
        }
        return u
    }
};
let Yl = null;
const $m = () => {
    if (Yl !== null)
        return Yl;
    try {
        if (Yl = typeof window < "u" && window.localStorage !== null,
        !Yl)
            return !1;
        const i = "i18next.translate.boo";
        window.localStorage.setItem(i, "foo"),
        window.localStorage.removeItem(i)
    } catch {
        Yl = !1
    }
    return Yl
}
;
var z1 = {
    name: "localStorage",
    lookup(i) {
        let {lookupLocalStorage: a} = i;
        if (a && $m())
            return window.localStorage.getItem(a) || void 0
    },
    cacheUserLanguage(i, a) {
        let {lookupLocalStorage: r} = a;
        r && $m() && window.localStorage.setItem(r, i)
    }
};
let Vl = null;
const Wm = () => {
    if (Vl !== null)
        return Vl;
    try {
        if (Vl = typeof window < "u" && window.sessionStorage !== null,
        !Vl)
            return !1;
        const i = "i18next.translate.boo";
        window.sessionStorage.setItem(i, "foo"),
        window.sessionStorage.removeItem(i)
    } catch {
        Vl = !1
    }
    return Vl
}
;
var U1 = {
    name: "sessionStorage",
    lookup(i) {
        let {lookupSessionStorage: a} = i;
        if (a && Wm())
            return window.sessionStorage.getItem(a) || void 0
    },
    cacheUserLanguage(i, a) {
        let {lookupSessionStorage: r} = a;
        r && Wm() && window.sessionStorage.setItem(r, i)
    }
}
  , H1 = {
    name: "navigator",
    lookup(i) {
        const a = [];
        if (typeof navigator < "u") {
            const {languages: r, userLanguage: u, language: c} = navigator;
            if (r)
                for (let f = 0; f < r.length; f++)
                    a.push(r[f]);
            u && a.push(u),
            c && a.push(c)
        }
        return a.length > 0 ? a : void 0
    }
}
  , B1 = {
    name: "htmlTag",
    lookup(i) {
        let {htmlTag: a} = i, r;
        const u = a || (typeof document < "u" ? document.documentElement : null);
        return u && typeof u.getAttribute == "function" && (r = u.getAttribute("lang")),
        r
    }
}
  , q1 = {
    name: "path",
    lookup(i) {
        let {lookupFromPathIndex: a} = i;
        if (typeof window > "u")
            return;
        const r = window.location.pathname.match(/\/([a-zA-Z-]*)/g);
        return Array.isArray(r) ? r[typeof a == "number" ? a : 0]?.replace("/", "") : void 0
    }
}
  , G1 = {
    name: "subdomain",
    lookup(i) {
        let {lookupFromSubdomainIndex: a} = i;
        const r = typeof a == "number" ? a + 1 : 1
          , u = typeof window < "u" && window.location?.hostname?.match(/^(\w{2,5})\.(([a-z0-9-]{1,63}\.[a-z]{2,6})|localhost)/i);
        if (u)
            return u[r]
    }
};
let Vg = !1;
try {
    document.cookie,
    Vg = !0
} catch {}
const Qg = ["querystring", "cookie", "localStorage", "sessionStorage", "navigator", "htmlTag"];
Vg || Qg.splice(1, 1);
const Y1 = () => ({
    order: Qg,
    lookupQuerystring: "lng",
    lookupCookie: "i18next",
    lookupLocalStorage: "i18nextLng",
    lookupSessionStorage: "i18nextLng",
    caches: ["localStorage"],
    excludeCacheFor: ["cimode"],
    convertDetectedLanguage: i => i
});
class kg {
    constructor(a) {
        let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        this.type = "languageDetector",
        this.detectors = {},
        this.init(a, r)
    }
    init() {
        let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {
            languageUtils: {}
        }
          , r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {}
          , u = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        this.services = a,
        this.options = N1(r, this.options || {}, Y1()),
        typeof this.options.convertDetectedLanguage == "string" && this.options.convertDetectedLanguage.indexOf("15897") > -1 && (this.options.convertDetectedLanguage = c => c.replace("-", "_")),
        this.options.lookupFromUrlIndex && (this.options.lookupFromPathIndex = this.options.lookupFromUrlIndex),
        this.i18nOptions = u,
        this.addDetector(j1),
        this.addDetector(D1),
        this.addDetector(z1),
        this.addDetector(U1),
        this.addDetector(H1),
        this.addDetector(B1),
        this.addDetector(q1),
        this.addDetector(G1),
        this.addDetector(M1)
    }
    addDetector(a) {
        return this.detectors[a.name] = a,
        this
    }
    detect() {
        let a = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.options.order
          , r = [];
        return a.forEach(u => {
            if (this.detectors[u]) {
                let c = this.detectors[u].lookup(this.options);
                c && typeof c == "string" && (c = [c]),
                c && (r = r.concat(c))
            }
        }
        ),
        r = r.filter(u => u != null && !R1(u)).map(u => this.options.convertDetectedLanguage(u)),
        this.services && this.services.languageUtils && this.services.languageUtils.getBestMatchFromCodes ? r : r.length > 0 ? r[0] : null
    }
    cacheUserLanguage(a) {
        let r = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : this.options.caches;
        r && (this.options.excludeCacheFor && this.options.excludeCacheFor.indexOf(a) > -1 || r.forEach(u => {
            this.detectors[u] && this.detectors[u].cacheUserLanguage(a, this.options)
        }
        ))
    }
}
kg.type = "languageDetector";
const Pm = Object.assign({})
  , Fa = {};
Object.keys(Pm).forEach(i => {
    const a = i.match(/\.\/([^/]+)\/([^/]+)\.ts$/);
    if (a) {
        const [,r] = a
          , u = Pm[i];
        Fa[r] || (Fa[r] = {
            translation: {}
        }),
        u.default && (Fa[r].translation = {
            ...Fa[r].translation,
            ...u.default
        })
    }
}
);
tt.use(kg).use(_1).init({
    lng: "en",
    fallbackLng: "en",
    debug: !1,
    resources: Fa,
    interpolation: {
        escapeValue: !1
    }
});
var Co = {
    exports: {}
}
  , ka = {}
  , To = {
    exports: {}
}
  , Oo = {};
var Im;
function V1() {
    return Im || (Im = 1,
    (function(i) {
        function a(z, k) {
            var te = z.length;
            z.push(k);
            e: for (; 0 < te; ) {
                var be = te - 1 >>> 1
                  , we = z[be];
                if (0 < c(we, k))
                    z[be] = k,
                    z[te] = we,
                    te = be;
                else
                    break e
            }
        }
        function r(z) {
            return z.length === 0 ? null : z[0]
        }
        function u(z) {
            if (z.length === 0)
                return null;
            var k = z[0]
              , te = z.pop();
            if (te !== k) {
                z[0] = te;
                e: for (var be = 0, we = z.length, T = we >>> 1; be < T; ) {
                    var B = 2 * (be + 1) - 1
                      , Z = z[B]
                      , J = B + 1
                      , se = z[J];
                    if (0 > c(Z, te))
                        J < we && 0 > c(se, Z) ? (z[be] = se,
                        z[J] = te,
                        be = J) : (z[be] = Z,
                        z[B] = te,
                        be = B);
                    else if (J < we && 0 > c(se, te))
                        z[be] = se,
                        z[J] = te,
                        be = J;
                    else
                        break e
                }
            }
            return k
        }
        function c(z, k) {
            var te = z.sortIndex - k.sortIndex;
            return te !== 0 ? te : z.id - k.id
        }
        if (i.unstable_now = void 0,
        typeof performance == "object" && typeof performance.now == "function") {
            var f = performance;
            i.unstable_now = function() {
                return f.now()
            }
        } else {
            var d = Date
              , m = d.now();
            i.unstable_now = function() {
                return d.now() - m
            }
        }
        var g = []
          , p = []
          , b = 1
          , v = null
          , S = 3
          , x = !1
          , E = !1
          , A = !1
          , _ = !1
          , D = typeof setTimeout == "function" ? setTimeout : null
          , G = typeof clearTimeout == "function" ? clearTimeout : null
          , V = typeof setImmediate < "u" ? setImmediate : null;
        function F(z) {
            for (var k = r(p); k !== null; ) {
                if (k.callback === null)
                    u(p);
                else if (k.startTime <= z)
                    u(p),
                    k.sortIndex = k.expirationTime,
                    a(g, k);
                else
                    break;
                k = r(p)
            }
        }
        function W(z) {
            if (A = !1,
            F(z),
            !E)
                if (r(g) !== null)
                    E = !0,
                    ue || (ue = !0,
                    K());
                else {
                    var k = r(p);
                    k !== null && fe(W, k.startTime - z)
                }
        }
        var ue = !1
          , P = -1
          , ye = 5
          , Ce = -1;
        function Q() {
            return _ ? !0 : !(i.unstable_now() - Ce < ye)
        }
        function X() {
            if (_ = !1,
            ue) {
                var z = i.unstable_now();
                Ce = z;
                var k = !0;
                try {
                    e: {
                        E = !1,
                        A && (A = !1,
                        G(P),
                        P = -1),
                        x = !0;
                        var te = S;
                        try {
                            t: {
                                for (F(z),
                                v = r(g); v !== null && !(v.expirationTime > z && Q()); ) {
                                    var be = v.callback;
                                    if (typeof be == "function") {
                                        v.callback = null,
                                        S = v.priorityLevel;
                                        var we = be(v.expirationTime <= z);
                                        if (z = i.unstable_now(),
                                        typeof we == "function") {
                                            v.callback = we,
                                            F(z),
                                            k = !0;
                                            break t
                                        }
                                        v === r(g) && u(g),
                                        F(z)
                                    } else
                                        u(g);
                                    v = r(g)
                                }
                                if (v !== null)
                                    k = !0;
                                else {
                                    var T = r(p);
                                    T !== null && fe(W, T.startTime - z),
                                    k = !1
                                }
                            }
                            break e
                        } finally {
                            v = null,
                            S = te,
                            x = !1
                        }
                        k = void 0
                    }
                } finally {
                    k ? K() : ue = !1
                }
            }
        }
        var K;
        if (typeof V == "function")
            K = function() {
                V(X)
            }
            ;
        else if (typeof MessageChannel < "u") {
            var ne = new MessageChannel
              , oe = ne.port2;
            ne.port1.onmessage = X,
            K = function() {
                oe.postMessage(null)
            }
        } else
            K = function() {
                D(X, 0)
            }
            ;
        function fe(z, k) {
            P = D(function() {
                z(i.unstable_now())
            }, k)
        }
        i.unstable_IdlePriority = 5,
        i.unstable_ImmediatePriority = 1,
        i.unstable_LowPriority = 4,
        i.unstable_NormalPriority = 3,
        i.unstable_Profiling = null,
        i.unstable_UserBlockingPriority = 2,
        i.unstable_cancelCallback = function(z) {
            z.callback = null
        }
        ,
        i.unstable_forceFrameRate = function(z) {
            0 > z || 125 < z ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : ye = 0 < z ? Math.floor(1e3 / z) : 5
        }
        ,
        i.unstable_getCurrentPriorityLevel = function() {
            return S
        }
        ,
        i.unstable_next = function(z) {
            switch (S) {
            case 1:
            case 2:
            case 3:
                var k = 3;
                break;
            default:
                k = S
            }
            var te = S;
            S = k;
            try {
                return z()
            } finally {
                S = te
            }
        }
        ,
        i.unstable_requestPaint = function() {
            _ = !0
        }
        ,
        i.unstable_runWithPriority = function(z, k) {
            switch (z) {
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
                break;
            default:
                z = 3
            }
            var te = S;
            S = z;
            try {
                return k()
            } finally {
                S = te
            }
        }
        ,
        i.unstable_scheduleCallback = function(z, k, te) {
            var be = i.unstable_now();
            switch (typeof te == "object" && te !== null ? (te = te.delay,
            te = typeof te == "number" && 0 < te ? be + te : be) : te = be,
            z) {
            case 1:
                var we = -1;
                break;
            case 2:
                we = 250;
                break;
            case 5:
                we = 1073741823;
                break;
            case 4:
                we = 1e4;
                break;
            default:
                we = 5e3
            }
            return we = te + we,
            z = {
                id: b++,
                callback: k,
                priorityLevel: z,
                startTime: te,
                expirationTime: we,
                sortIndex: -1
            },
            te > be ? (z.sortIndex = te,
            a(p, z),
            r(g) === null && z === r(p) && (A ? (G(P),
            P = -1) : A = !0,
            fe(W, te - be))) : (z.sortIndex = we,
            a(g, z),
            E || x || (E = !0,
            ue || (ue = !0,
            K()))),
            z
        }
        ,
        i.unstable_shouldYield = Q,
        i.unstable_wrapCallback = function(z) {
            var k = S;
            return function() {
                var te = S;
                S = k;
                try {
                    return z.apply(this, arguments)
                } finally {
                    S = te
                }
            }
        }
    }
    )(Oo)),
    Oo
}
var eg;
function Q1() {
    return eg || (eg = 1,
    To.exports = V1()),
    To.exports
}
var Ao = {
    exports: {}
}
  , et = {};
var tg;
function k1() {
    if (tg)
        return et;
    tg = 1;
    var i = Zo();
    function a(g) {
        var p = "https://react.dev/errors/" + g;
        if (1 < arguments.length) {
            p += "?args[]=" + encodeURIComponent(arguments[1]);
            for (var b = 2; b < arguments.length; b++)
                p += "&args[]=" + encodeURIComponent(arguments[b])
        }
        return "Minified React error #" + g + "; visit " + p + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    }
    function r() {}
    var u = {
        d: {
            f: r,
            r: function() {
                throw Error(a(522))
            },
            D: r,
            C: r,
            L: r,
            m: r,
            X: r,
            S: r,
            M: r
        },
        p: 0,
        findDOMNode: null
    }
      , c = Symbol.for("react.portal");
    function f(g, p, b) {
        var v = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
        return {
            $$typeof: c,
            key: v == null ? null : "" + v,
            children: g,
            containerInfo: p,
            implementation: b
        }
    }
    var d = i.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;
    function m(g, p) {
        if (g === "font")
            return "";
        if (typeof p == "string")
            return p === "use-credentials" ? p : ""
    }
    return et.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE = u,
    et.createPortal = function(g, p) {
        var b = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
        if (!p || p.nodeType !== 1 && p.nodeType !== 9 && p.nodeType !== 11)
            throw Error(a(299));
        return f(g, p, null, b)
    }
    ,
    et.flushSync = function(g) {
        var p = d.T
          , b = u.p;
        try {
            if (d.T = null,
            u.p = 2,
            g)
                return g()
        } finally {
            d.T = p,
            u.p = b,
            u.d.f()
        }
    }
    ,
    et.preconnect = function(g, p) {
        typeof g == "string" && (p ? (p = p.crossOrigin,
        p = typeof p == "string" ? p === "use-credentials" ? p : "" : void 0) : p = null,
        u.d.C(g, p))
    }
    ,
    et.prefetchDNS = function(g) {
        typeof g == "string" && u.d.D(g)
    }
    ,
    et.preinit = function(g, p) {
        if (typeof g == "string" && p && typeof p.as == "string") {
            var b = p.as
              , v = m(b, p.crossOrigin)
              , S = typeof p.integrity == "string" ? p.integrity : void 0
              , x = typeof p.fetchPriority == "string" ? p.fetchPriority : void 0;
            b === "style" ? u.d.S(g, typeof p.precedence == "string" ? p.precedence : void 0, {
                crossOrigin: v,
                integrity: S,
                fetchPriority: x
            }) : b === "script" && u.d.X(g, {
                crossOrigin: v,
                integrity: S,
                fetchPriority: x,
                nonce: typeof p.nonce == "string" ? p.nonce : void 0
            })
        }
    }
    ,
    et.preinitModule = function(g, p) {
        if (typeof g == "string")
            if (typeof p == "object" && p !== null) {
                if (p.as == null || p.as === "script") {
                    var b = m(p.as, p.crossOrigin);
                    u.d.M(g, {
                        crossOrigin: b,
                        integrity: typeof p.integrity == "string" ? p.integrity : void 0,
                        nonce: typeof p.nonce == "string" ? p.nonce : void 0
                    })
                }
            } else
                p == null && u.d.M(g)
    }
    ,
    et.preload = function(g, p) {
        if (typeof g == "string" && typeof p == "object" && p !== null && typeof p.as == "string") {
            var b = p.as
              , v = m(b, p.crossOrigin);
            u.d.L(g, b, {
                crossOrigin: v,
                integrity: typeof p.integrity == "string" ? p.integrity : void 0,
                nonce: typeof p.nonce == "string" ? p.nonce : void 0,
                type: typeof p.type == "string" ? p.type : void 0,
                fetchPriority: typeof p.fetchPriority == "string" ? p.fetchPriority : void 0,
                referrerPolicy: typeof p.referrerPolicy == "string" ? p.referrerPolicy : void 0,
                imageSrcSet: typeof p.imageSrcSet == "string" ? p.imageSrcSet : void 0,
                imageSizes: typeof p.imageSizes == "string" ? p.imageSizes : void 0,
                media: typeof p.media == "string" ? p.media : void 0
            })
        }
    }
    ,
    et.preloadModule = function(g, p) {
        if (typeof g == "string")
            if (p) {
                var b = m(p.as, p.crossOrigin);
                u.d.m(g, {
                    as: typeof p.as == "string" && p.as !== "script" ? p.as : void 0,
                    crossOrigin: b,
                    integrity: typeof p.integrity == "string" ? p.integrity : void 0
                })
            } else
                u.d.m(g)
    }
    ,
    et.requestFormReset = function(g) {
        u.d.r(g)
    }
    ,
    et.unstable_batchedUpdates = function(g, p) {
        return g(p)
    }
    ,
    et.useFormState = function(g, p, b) {
        return d.H.useFormState(g, p, b)
    }
    ,
    et.useFormStatus = function() {
        return d.H.useHostTransitionStatus()
    }
    ,
    et.version = "19.2.4",
    et
}
var ng;
function X1() {
    if (ng)
        return Ao.exports;
    ng = 1;
    function i() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i)
            } catch (a) {
                console.error(a)
            }
    }
    return i(),
    Ao.exports = k1(),
    Ao.exports
}
var lg;
function Z1() {
    if (lg)
        return ka;
    lg = 1;
    var i = Q1()
      , a = Zo()
      , r = X1();
    function u(e) {
        var t = "https://react.dev/errors/" + e;
        if (1 < arguments.length) {
            t += "?args[]=" + encodeURIComponent(arguments[1]);
            for (var n = 2; n < arguments.length; n++)
                t += "&args[]=" + encodeURIComponent(arguments[n])
        }
        return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings."
    }
    function c(e) {
        return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11)
    }
    function f(e) {
        var t = e
          , n = e;
        if (e.alternate)
            for (; t.return; )
                t = t.return;
        else {
            e = t;
            do
                t = e,
                (t.flags & 4098) !== 0 && (n = t.return),
                e = t.return;
            while (e)
        }
        return t.tag === 3 ? n : null
    }
    function d(e) {
        if (e.tag === 13) {
            var t = e.memoizedState;
            if (t === null && (e = e.alternate,
            e !== null && (t = e.memoizedState)),
            t !== null)
                return t.dehydrated
        }
        return null
    }
    function m(e) {
        if (e.tag === 31) {
            var t = e.memoizedState;
            if (t === null && (e = e.alternate,
            e !== null && (t = e.memoizedState)),
            t !== null)
                return t.dehydrated
        }
        return null
    }
    function g(e) {
        if (f(e) !== e)
            throw Error(u(188))
    }
    function p(e) {
        var t = e.alternate;
        if (!t) {
            if (t = f(e),
            t === null)
                throw Error(u(188));
            return t !== e ? null : e
        }
        for (var n = e, l = t; ; ) {
            var s = n.return;
            if (s === null)
                break;
            var o = s.alternate;
            if (o === null) {
                if (l = s.return,
                l !== null) {
                    n = l;
                    continue
                }
                break
            }
            if (s.child === o.child) {
                for (o = s.child; o; ) {
                    if (o === n)
                        return g(s),
                        e;
                    if (o === l)
                        return g(s),
                        t;
                    o = o.sibling
                }
                throw Error(u(188))
            }
            if (n.return !== l.return)
                n = s,
                l = o;
            else {
                for (var h = !1, y = s.child; y; ) {
                    if (y === n) {
                        h = !0,
                        n = s,
                        l = o;
                        break
                    }
                    if (y === l) {
                        h = !0,
                        l = s,
                        n = o;
                        break
                    }
                    y = y.sibling
                }
                if (!h) {
                    for (y = o.child; y; ) {
                        if (y === n) {
                            h = !0,
                            n = o,
                            l = s;
                            break
                        }
                        if (y === l) {
                            h = !0,
                            l = o,
                            n = s;
                            break
                        }
                        y = y.sibling
                    }
                    if (!h)
                        throw Error(u(189))
                }
            }
            if (n.alternate !== l)
                throw Error(u(190))
        }
        if (n.tag !== 3)
            throw Error(u(188));
        return n.stateNode.current === n ? e : t
    }
    function b(e) {
        var t = e.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6)
            return e;
        for (e = e.child; e !== null; ) {
            if (t = b(e),
            t !== null)
                return t;
            e = e.sibling
        }
        return null
    }
    var v = Object.assign
      , S = Symbol.for("react.element")
      , x = Symbol.for("react.transitional.element")
      , E = Symbol.for("react.portal")
      , A = Symbol.for("react.fragment")
      , _ = Symbol.for("react.strict_mode")
      , D = Symbol.for("react.profiler")
      , G = Symbol.for("react.consumer")
      , V = Symbol.for("react.context")
      , F = Symbol.for("react.forward_ref")
      , W = Symbol.for("react.suspense")
      , ue = Symbol.for("react.suspense_list")
      , P = Symbol.for("react.memo")
      , ye = Symbol.for("react.lazy")
      , Ce = Symbol.for("react.activity")
      , Q = Symbol.for("react.memo_cache_sentinel")
      , X = Symbol.iterator;
    function K(e) {
        return e === null || typeof e != "object" ? null : (e = X && e[X] || e["@@iterator"],
        typeof e == "function" ? e : null)
    }
    var ne = Symbol.for("react.client.reference");
    function oe(e) {
        if (e == null)
            return null;
        if (typeof e == "function")
            return e.$$typeof === ne ? null : e.displayName || e.name || null;
        if (typeof e == "string")
            return e;
        switch (e) {
        case A:
            return "Fragment";
        case D:
            return "Profiler";
        case _:
            return "StrictMode";
        case W:
            return "Suspense";
        case ue:
            return "SuspenseList";
        case Ce:
            return "Activity"
        }
        if (typeof e == "object")
            switch (e.$$typeof) {
            case E:
                return "Portal";
            case V:
                return e.displayName || "Context";
            case G:
                return (e._context.displayName || "Context") + ".Consumer";
            case F:
                var t = e.render;
                return e = e.displayName,
                e || (e = t.displayName || t.name || "",
                e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"),
                e;
            case P:
                return t = e.displayName || null,
                t !== null ? t : oe(e.type) || "Memo";
            case ye:
                t = e._payload,
                e = e._init;
                try {
                    return oe(e(t))
                } catch {}
            }
        return null
    }
    var fe = Array.isArray
      , z = a.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
      , k = r.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE
      , te = {
        pending: !1,
        data: null,
        method: null,
        action: null
    }
      , be = []
      , we = -1;
    function T(e) {
        return {
            current: e
        }
    }
    function B(e) {
        0 > we || (e.current = be[we],
        be[we] = null,
        we--)
    }
    function Z(e, t) {
        we++,
        be[we] = e.current,
        e.current = t
    }
    var J = T(null)
      , se = T(null)
      , de = T(null)
      , _e = T(null);
    function nt(e, t) {
        switch (Z(de, t),
        Z(se, e),
        Z(J, null),
        t.nodeType) {
        case 9:
        case 11:
            e = (e = t.documentElement) && (e = e.namespaceURI) ? _h(e) : 0;
            break;
        default:
            if (e = t.tagName,
            t = t.namespaceURI)
                t = _h(t),
                e = Ch(t, e);
            else
                switch (e) {
                case "svg":
                    e = 1;
                    break;
                case "math":
                    e = 2;
                    break;
                default:
                    e = 0
                }
        }
        B(J),
        Z(J, e)
    }
    function He() {
        B(J),
        B(se),
        B(de)
    }
    function Kl(e) {
        e.memoizedState !== null && Z(_e, e);
        var t = J.current
          , n = Ch(t, e.type);
        t !== n && (Z(se, e),
        Z(J, n))
    }
    function ni(e) {
        se.current === e && (B(J),
        B(se)),
        _e.current === e && (B(_e),
        Ua._currentValue = te)
    }
    var qs, Io;
    function Hn(e) {
        if (qs === void 0)
            try {
                throw Error()
            } catch (n) {
                var t = n.stack.trim().match(/\n( *(at )?)/);
                qs = t && t[1] || "",
                Io = -1 < n.stack.indexOf(`
    at`) ? " (<anonymous>)" : -1 < n.stack.indexOf("@") ? "@unknown:0:0" : ""
            }
        return `
` + qs + e + Io
    }
    var Gs = !1;
    function Ys(e, t) {
        if (!e || Gs)
            return "";
        Gs = !0;
        var n = Error.prepareStackTrace;
        Error.prepareStackTrace = void 0;
        try {
            var l = {
                DetermineComponentFrameRoot: function() {
                    try {
                        if (t) {
                            var Y = function() {
                                throw Error()
                            };
                            if (Object.defineProperty(Y.prototype, "props", {
                                set: function() {
                                    throw Error()
                                }
                            }),
                            typeof Reflect == "object" && Reflect.construct) {
                                try {
                                    Reflect.construct(Y, [])
                                } catch (M) {
                                    var j = M
                                }
                                Reflect.construct(e, [], Y)
                            } else {
                                try {
                                    Y.call()
                                } catch (M) {
                                    j = M
                                }
                                e.call(Y.prototype)
                            }
                        } else {
                            try {
                                throw Error()
                            } catch (M) {
                                j = M
                            }
                            (Y = e()) && typeof Y.catch == "function" && Y.catch(function() {})
                        }
                    } catch (M) {
                        if (M && j && typeof M.stack == "string")
                            return [M.stack, j.stack]
                    }
                    return [null, null]
                }
            };
            l.DetermineComponentFrameRoot.displayName = "DetermineComponentFrameRoot";
            var s = Object.getOwnPropertyDescriptor(l.DetermineComponentFrameRoot, "name");
            s && s.configurable && Object.defineProperty(l.DetermineComponentFrameRoot, "name", {
                value: "DetermineComponentFrameRoot"
            });
            var o = l.DetermineComponentFrameRoot()
              , h = o[0]
              , y = o[1];
            if (h && y) {
                var C = h.split(`
`)
                  , L = y.split(`
`);
                for (s = l = 0; l < C.length && !C[l].includes("DetermineComponentFrameRoot"); )
                    l++;
                for (; s < L.length && !L[s].includes("DetermineComponentFrameRoot"); )
                    s++;
                if (l === C.length || s === L.length)
                    for (l = C.length - 1,
                    s = L.length - 1; 1 <= l && 0 <= s && C[l] !== L[s]; )
                        s--;
                for (; 1 <= l && 0 <= s; l--,
                s--)
                    if (C[l] !== L[s]) {
                        if (l !== 1 || s !== 1)
                            do
                                if (l--,
                                s--,
                                0 > s || C[l] !== L[s]) {
                                    var U = `
` + C[l].replace(" at new ", " at ");
                                    return e.displayName && U.includes("<anonymous>") && (U = U.replace("<anonymous>", e.displayName)),
                                    U
                                }
                            while (1 <= l && 0 <= s);
                        break
                    }
            }
        } finally {
            Gs = !1,
            Error.prepareStackTrace = n
        }
        return (n = e ? e.displayName || e.name : "") ? Hn(n) : ""
    }
    function mp(e, t) {
        switch (e.tag) {
        case 26:
        case 27:
        case 5:
            return Hn(e.type);
        case 16:
            return Hn("Lazy");
        case 13:
            return e.child !== t && t !== null ? Hn("Suspense Fallback") : Hn("Suspense");
        case 19:
            return Hn("SuspenseList");
        case 0:
        case 15:
            return Ys(e.type, !1);
        case 11:
            return Ys(e.type.render, !1);
        case 1:
            return Ys(e.type, !0);
        case 31:
            return Hn("Activity");
        default:
            return ""
        }
    }
    function ec(e) {
        try {
            var t = ""
              , n = null;
            do
                t += mp(e, n),
                n = e,
                e = e.return;
            while (e);
            return t
        } catch (l) {
            return `
Error generating stack: ` + l.message + `
` + l.stack
        }
    }
    var Vs = Object.prototype.hasOwnProperty
      , Qs = i.unstable_scheduleCallback
      , ks = i.unstable_cancelCallback
      , gp = i.unstable_shouldYield
      , pp = i.unstable_requestPaint
      , ft = i.unstable_now
      , yp = i.unstable_getCurrentPriorityLevel
      , tc = i.unstable_ImmediatePriority
      , nc = i.unstable_UserBlockingPriority
      , li = i.unstable_NormalPriority
      , vp = i.unstable_LowPriority
      , lc = i.unstable_IdlePriority
      , bp = i.log
      , xp = i.unstable_setDisableYieldValue
      , Fl = null
      , dt = null;
    function dn(e) {
        if (typeof bp == "function" && xp(e),
        dt && typeof dt.setStrictMode == "function")
            try {
                dt.setStrictMode(Fl, e)
            } catch {}
    }
    var ht = Math.clz32 ? Math.clz32 : wp
      , Sp = Math.log
      , Ep = Math.LN2;
    function wp(e) {
        return e >>>= 0,
        e === 0 ? 32 : 31 - (Sp(e) / Ep | 0) | 0
    }
    var ai = 256
      , ii = 262144
      , si = 4194304;
    function Bn(e) {
        var t = e & 42;
        if (t !== 0)
            return t;
        switch (e & -e) {
        case 1:
            return 1;
        case 2:
            return 2;
        case 4:
            return 4;
        case 8:
            return 8;
        case 16:
            return 16;
        case 32:
            return 32;
        case 64:
            return 64;
        case 128:
            return 128;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
            return e & 261888;
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return e & 3932160;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            return e & 62914560;
        case 67108864:
            return 67108864;
        case 134217728:
            return 134217728;
        case 268435456:
            return 268435456;
        case 536870912:
            return 536870912;
        case 1073741824:
            return 0;
        default:
            return e
        }
    }
    function ri(e, t, n) {
        var l = e.pendingLanes;
        if (l === 0)
            return 0;
        var s = 0
          , o = e.suspendedLanes
          , h = e.pingedLanes;
        e = e.warmLanes;
        var y = l & 134217727;
        return y !== 0 ? (l = y & ~o,
        l !== 0 ? s = Bn(l) : (h &= y,
        h !== 0 ? s = Bn(h) : n || (n = y & ~e,
        n !== 0 && (s = Bn(n))))) : (y = l & ~o,
        y !== 0 ? s = Bn(y) : h !== 0 ? s = Bn(h) : n || (n = l & ~e,
        n !== 0 && (s = Bn(n)))),
        s === 0 ? 0 : t !== 0 && t !== s && (t & o) === 0 && (o = s & -s,
        n = t & -t,
        o >= n || o === 32 && (n & 4194048) !== 0) ? t : s
    }
    function Jl(e, t) {
        return (e.pendingLanes & ~(e.suspendedLanes & ~e.pingedLanes) & t) === 0
    }
    function _p(e, t) {
        switch (e) {
        case 1:
        case 2:
        case 4:
        case 8:
        case 64:
            return t + 250;
        case 16:
        case 32:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
            return t + 5e3;
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            return -1;
        case 67108864:
        case 134217728:
        case 268435456:
        case 536870912:
        case 1073741824:
            return -1;
        default:
            return -1
        }
    }
    function ac() {
        var e = si;
        return si <<= 1,
        (si & 62914560) === 0 && (si = 4194304),
        e
    }
    function Xs(e) {
        for (var t = [], n = 0; 31 > n; n++)
            t.push(e);
        return t
    }
    function $l(e, t) {
        e.pendingLanes |= t,
        t !== 268435456 && (e.suspendedLanes = 0,
        e.pingedLanes = 0,
        e.warmLanes = 0)
    }
    function Cp(e, t, n, l, s, o) {
        var h = e.pendingLanes;
        e.pendingLanes = n,
        e.suspendedLanes = 0,
        e.pingedLanes = 0,
        e.warmLanes = 0,
        e.expiredLanes &= n,
        e.entangledLanes &= n,
        e.errorRecoveryDisabledLanes &= n,
        e.shellSuspendCounter = 0;
        var y = e.entanglements
          , C = e.expirationTimes
          , L = e.hiddenUpdates;
        for (n = h & ~n; 0 < n; ) {
            var U = 31 - ht(n)
              , Y = 1 << U;
            y[U] = 0,
            C[U] = -1;
            var j = L[U];
            if (j !== null)
                for (L[U] = null,
                U = 0; U < j.length; U++) {
                    var M = j[U];
                    M !== null && (M.lane &= -536870913)
                }
            n &= ~Y
        }
        l !== 0 && ic(e, l, 0),
        o !== 0 && s === 0 && e.tag !== 0 && (e.suspendedLanes |= o & ~(h & ~t))
    }
    function ic(e, t, n) {
        e.pendingLanes |= t,
        e.suspendedLanes &= ~t;
        var l = 31 - ht(t);
        e.entangledLanes |= t,
        e.entanglements[l] = e.entanglements[l] | 1073741824 | n & 261930
    }
    function sc(e, t) {
        var n = e.entangledLanes |= t;
        for (e = e.entanglements; n; ) {
            var l = 31 - ht(n)
              , s = 1 << l;
            s & t | e[l] & t && (e[l] |= t),
            n &= ~s
        }
    }
    function rc(e, t) {
        var n = t & -t;
        return n = (n & 42) !== 0 ? 1 : Zs(n),
        (n & (e.suspendedLanes | t)) !== 0 ? 0 : n
    }
    function Zs(e) {
        switch (e) {
        case 2:
            e = 1;
            break;
        case 8:
            e = 4;
            break;
        case 32:
            e = 16;
            break;
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
            e = 128;
            break;
        case 268435456:
            e = 134217728;
            break;
        default:
            e = 0
        }
        return e
    }
    function Ks(e) {
        return e &= -e,
        2 < e ? 8 < e ? (e & 134217727) !== 0 ? 32 : 268435456 : 8 : 2
    }
    function uc() {
        var e = k.p;
        return e !== 0 ? e : (e = window.event,
        e === void 0 ? 32 : Fh(e.type))
    }
    function oc(e, t) {
        var n = k.p;
        try {
            return k.p = e,
            t()
        } finally {
            k.p = n
        }
    }
    var hn = Math.random().toString(36).slice(2)
      , Je = "__reactFiber$" + hn
      , at = "__reactProps$" + hn
      , ll = "__reactContainer$" + hn
      , Fs = "__reactEvents$" + hn
      , Tp = "__reactListeners$" + hn
      , Op = "__reactHandles$" + hn
      , cc = "__reactResources$" + hn
      , Wl = "__reactMarker$" + hn;
    function Js(e) {
        delete e[Je],
        delete e[at],
        delete e[Fs],
        delete e[Tp],
        delete e[Op]
    }
    function al(e) {
        var t = e[Je];
        if (t)
            return t;
        for (var n = e.parentNode; n; ) {
            if (t = n[ll] || n[Je]) {
                if (n = t.alternate,
                t.child !== null || n !== null && n.child !== null)
                    for (e = jh(e); e !== null; ) {
                        if (n = e[Je])
                            return n;
                        e = jh(e)
                    }
                return t
            }
            e = n,
            n = e.parentNode
        }
        return null
    }
    function il(e) {
        if (e = e[Je] || e[ll]) {
            var t = e.tag;
            if (t === 5 || t === 6 || t === 13 || t === 31 || t === 26 || t === 27 || t === 3)
                return e
        }
        return null
    }
    function Pl(e) {
        var t = e.tag;
        if (t === 5 || t === 26 || t === 27 || t === 6)
            return e.stateNode;
        throw Error(u(33))
    }
    function sl(e) {
        var t = e[cc];
        return t || (t = e[cc] = {
            hoistableStyles: new Map,
            hoistableScripts: new Map
        }),
        t
    }
    function Ze(e) {
        e[Wl] = !0
    }
    var fc = new Set
      , dc = {};
    function qn(e, t) {
        rl(e, t),
        rl(e + "Capture", t)
    }
    function rl(e, t) {
        for (dc[e] = t,
        e = 0; e < t.length; e++)
            fc.add(t[e])
    }
    var Ap = RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$")
      , hc = {}
      , mc = {};
    function Np(e) {
        return Vs.call(mc, e) ? !0 : Vs.call(hc, e) ? !1 : Ap.test(e) ? mc[e] = !0 : (hc[e] = !0,
        !1)
    }
    function ui(e, t, n) {
        if (Np(t))
            if (n === null)
                e.removeAttribute(t);
            else {
                switch (typeof n) {
                case "undefined":
                case "function":
                case "symbol":
                    e.removeAttribute(t);
                    return;
                case "boolean":
                    var l = t.toLowerCase().slice(0, 5);
                    if (l !== "data-" && l !== "aria-") {
                        e.removeAttribute(t);
                        return
                    }
                }
                e.setAttribute(t, "" + n)
            }
    }
    function oi(e, t, n) {
        if (n === null)
            e.removeAttribute(t);
        else {
            switch (typeof n) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(t);
                return
            }
            e.setAttribute(t, "" + n)
        }
    }
    function kt(e, t, n, l) {
        if (l === null)
            e.removeAttribute(n);
        else {
            switch (typeof l) {
            case "undefined":
            case "function":
            case "symbol":
            case "boolean":
                e.removeAttribute(n);
                return
            }
            e.setAttributeNS(t, n, "" + l)
        }
    }
    function St(e) {
        switch (typeof e) {
        case "bigint":
        case "boolean":
        case "number":
        case "string":
        case "undefined":
            return e;
        case "object":
            return e;
        default:
            return ""
        }
    }
    function gc(e) {
        var t = e.type;
        return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio")
    }
    function Rp(e, t, n) {
        var l = Object.getOwnPropertyDescriptor(e.constructor.prototype, t);
        if (!e.hasOwnProperty(t) && typeof l < "u" && typeof l.get == "function" && typeof l.set == "function") {
            var s = l.get
              , o = l.set;
            return Object.defineProperty(e, t, {
                configurable: !0,
                get: function() {
                    return s.call(this)
                },
                set: function(h) {
                    n = "" + h,
                    o.call(this, h)
                }
            }),
            Object.defineProperty(e, t, {
                enumerable: l.enumerable
            }),
            {
                getValue: function() {
                    return n
                },
                setValue: function(h) {
                    n = "" + h
                },
                stopTracking: function() {
                    e._valueTracker = null,
                    delete e[t]
                }
            }
        }
    }
    function $s(e) {
        if (!e._valueTracker) {
            var t = gc(e) ? "checked" : "value";
            e._valueTracker = Rp(e, t, "" + e[t])
        }
    }
    function pc(e) {
        if (!e)
            return !1;
        var t = e._valueTracker;
        if (!t)
            return !0;
        var n = t.getValue()
          , l = "";
        return e && (l = gc(e) ? e.checked ? "true" : "false" : e.value),
        e = l,
        e !== n ? (t.setValue(e),
        !0) : !1
    }
    function ci(e) {
        if (e = e || (typeof document < "u" ? document : void 0),
        typeof e > "u")
            return null;
        try {
            return e.activeElement || e.body
        } catch {
            return e.body
        }
    }
    var Lp = /[\n"\\]/g;
    function Et(e) {
        return e.replace(Lp, function(t) {
            return "\\" + t.charCodeAt(0).toString(16) + " "
        })
    }
    function Ws(e, t, n, l, s, o, h, y) {
        e.name = "",
        h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" ? e.type = h : e.removeAttribute("type"),
        t != null ? h === "number" ? (t === 0 && e.value === "" || e.value != t) && (e.value = "" + St(t)) : e.value !== "" + St(t) && (e.value = "" + St(t)) : h !== "submit" && h !== "reset" || e.removeAttribute("value"),
        t != null ? Ps(e, h, St(t)) : n != null ? Ps(e, h, St(n)) : l != null && e.removeAttribute("value"),
        s == null && o != null && (e.defaultChecked = !!o),
        s != null && (e.checked = s && typeof s != "function" && typeof s != "symbol"),
        y != null && typeof y != "function" && typeof y != "symbol" && typeof y != "boolean" ? e.name = "" + St(y) : e.removeAttribute("name")
    }
    function yc(e, t, n, l, s, o, h, y) {
        if (o != null && typeof o != "function" && typeof o != "symbol" && typeof o != "boolean" && (e.type = o),
        t != null || n != null) {
            if (!(o !== "submit" && o !== "reset" || t != null)) {
                $s(e);
                return
            }
            n = n != null ? "" + St(n) : "",
            t = t != null ? "" + St(t) : n,
            y || t === e.value || (e.value = t),
            e.defaultValue = t
        }
        l = l ?? s,
        l = typeof l != "function" && typeof l != "symbol" && !!l,
        e.checked = y ? e.checked : !!l,
        e.defaultChecked = !!l,
        h != null && typeof h != "function" && typeof h != "symbol" && typeof h != "boolean" && (e.name = h),
        $s(e)
    }
    function Ps(e, t, n) {
        t === "number" && ci(e.ownerDocument) === e || e.defaultValue === "" + n || (e.defaultValue = "" + n)
    }
    function ul(e, t, n, l) {
        if (e = e.options,
        t) {
            t = {};
            for (var s = 0; s < n.length; s++)
                t["$" + n[s]] = !0;
            for (n = 0; n < e.length; n++)
                s = t.hasOwnProperty("$" + e[n].value),
                e[n].selected !== s && (e[n].selected = s),
                s && l && (e[n].defaultSelected = !0)
        } else {
            for (n = "" + St(n),
            t = null,
            s = 0; s < e.length; s++) {
                if (e[s].value === n) {
                    e[s].selected = !0,
                    l && (e[s].defaultSelected = !0);
                    return
                }
                t !== null || e[s].disabled || (t = e[s])
            }
            t !== null && (t.selected = !0)
        }
    }
    function vc(e, t, n) {
        if (t != null && (t = "" + St(t),
        t !== e.value && (e.value = t),
        n == null)) {
            e.defaultValue !== t && (e.defaultValue = t);
            return
        }
        e.defaultValue = n != null ? "" + St(n) : ""
    }
    function bc(e, t, n, l) {
        if (t == null) {
            if (l != null) {
                if (n != null)
                    throw Error(u(92));
                if (fe(l)) {
                    if (1 < l.length)
                        throw Error(u(93));
                    l = l[0]
                }
                n = l
            }
            n == null && (n = ""),
            t = n
        }
        n = St(t),
        e.defaultValue = n,
        l = e.textContent,
        l === n && l !== "" && l !== null && (e.value = l),
        $s(e)
    }
    function ol(e, t) {
        if (t) {
            var n = e.firstChild;
            if (n && n === e.lastChild && n.nodeType === 3) {
                n.nodeValue = t;
                return
            }
        }
        e.textContent = t
    }
    var jp = new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));
    function xc(e, t, n) {
        var l = t.indexOf("--") === 0;
        n == null || typeof n == "boolean" || n === "" ? l ? e.setProperty(t, "") : t === "float" ? e.cssFloat = "" : e[t] = "" : l ? e.setProperty(t, n) : typeof n != "number" || n === 0 || jp.has(t) ? t === "float" ? e.cssFloat = n : e[t] = ("" + n).trim() : e[t] = n + "px"
    }
    function Sc(e, t, n) {
        if (t != null && typeof t != "object")
            throw Error(u(62));
        if (e = e.style,
        n != null) {
            for (var l in n)
                !n.hasOwnProperty(l) || t != null && t.hasOwnProperty(l) || (l.indexOf("--") === 0 ? e.setProperty(l, "") : l === "float" ? e.cssFloat = "" : e[l] = "");
            for (var s in t)
                l = t[s],
                t.hasOwnProperty(s) && n[s] !== l && xc(e, s, l)
        } else
            for (var o in t)
                t.hasOwnProperty(o) && xc(e, o, t[o])
    }
    function Is(e) {
        if (e.indexOf("-") === -1)
            return !1;
        switch (e) {
        case "annotation-xml":
        case "color-profile":
        case "font-face":
        case "font-face-src":
        case "font-face-uri":
        case "font-face-format":
        case "font-face-name":
        case "missing-glyph":
            return !1;
        default:
            return !0
        }
    }
    var Dp = new Map([["acceptCharset", "accept-charset"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"], ["crossOrigin", "crossorigin"], ["accentHeight", "accent-height"], ["alignmentBaseline", "alignment-baseline"], ["arabicForm", "arabic-form"], ["baselineShift", "baseline-shift"], ["capHeight", "cap-height"], ["clipPath", "clip-path"], ["clipRule", "clip-rule"], ["colorInterpolation", "color-interpolation"], ["colorInterpolationFilters", "color-interpolation-filters"], ["colorProfile", "color-profile"], ["colorRendering", "color-rendering"], ["dominantBaseline", "dominant-baseline"], ["enableBackground", "enable-background"], ["fillOpacity", "fill-opacity"], ["fillRule", "fill-rule"], ["floodColor", "flood-color"], ["floodOpacity", "flood-opacity"], ["fontFamily", "font-family"], ["fontSize", "font-size"], ["fontSizeAdjust", "font-size-adjust"], ["fontStretch", "font-stretch"], ["fontStyle", "font-style"], ["fontVariant", "font-variant"], ["fontWeight", "font-weight"], ["glyphName", "glyph-name"], ["glyphOrientationHorizontal", "glyph-orientation-horizontal"], ["glyphOrientationVertical", "glyph-orientation-vertical"], ["horizAdvX", "horiz-adv-x"], ["horizOriginX", "horiz-origin-x"], ["imageRendering", "image-rendering"], ["letterSpacing", "letter-spacing"], ["lightingColor", "lighting-color"], ["markerEnd", "marker-end"], ["markerMid", "marker-mid"], ["markerStart", "marker-start"], ["overlinePosition", "overline-position"], ["overlineThickness", "overline-thickness"], ["paintOrder", "paint-order"], ["panose-1", "panose-1"], ["pointerEvents", "pointer-events"], ["renderingIntent", "rendering-intent"], ["shapeRendering", "shape-rendering"], ["stopColor", "stop-color"], ["stopOpacity", "stop-opacity"], ["strikethroughPosition", "strikethrough-position"], ["strikethroughThickness", "strikethrough-thickness"], ["strokeDasharray", "stroke-dasharray"], ["strokeDashoffset", "stroke-dashoffset"], ["strokeLinecap", "stroke-linecap"], ["strokeLinejoin", "stroke-linejoin"], ["strokeMiterlimit", "stroke-miterlimit"], ["strokeOpacity", "stroke-opacity"], ["strokeWidth", "stroke-width"], ["textAnchor", "text-anchor"], ["textDecoration", "text-decoration"], ["textRendering", "text-rendering"], ["transformOrigin", "transform-origin"], ["underlinePosition", "underline-position"], ["underlineThickness", "underline-thickness"], ["unicodeBidi", "unicode-bidi"], ["unicodeRange", "unicode-range"], ["unitsPerEm", "units-per-em"], ["vAlphabetic", "v-alphabetic"], ["vHanging", "v-hanging"], ["vIdeographic", "v-ideographic"], ["vMathematical", "v-mathematical"], ["vectorEffect", "vector-effect"], ["vertAdvY", "vert-adv-y"], ["vertOriginX", "vert-origin-x"], ["vertOriginY", "vert-origin-y"], ["wordSpacing", "word-spacing"], ["writingMode", "writing-mode"], ["xmlnsXlink", "xmlns:xlink"], ["xHeight", "x-height"]])
      , Mp = /^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;
    function fi(e) {
        return Mp.test("" + e) ? "javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')" : e
    }
    function Xt() {}
    var er = null;
    function tr(e) {
        return e = e.target || e.srcElement || window,
        e.correspondingUseElement && (e = e.correspondingUseElement),
        e.nodeType === 3 ? e.parentNode : e
    }
    var cl = null
      , fl = null;
    function Ec(e) {
        var t = il(e);
        if (t && (e = t.stateNode)) {
            var n = e[at] || null;
            e: switch (e = t.stateNode,
            t.type) {
            case "input":
                if (Ws(e, n.value, n.defaultValue, n.defaultValue, n.checked, n.defaultChecked, n.type, n.name),
                t = n.name,
                n.type === "radio" && t != null) {
                    for (n = e; n.parentNode; )
                        n = n.parentNode;
                    for (n = n.querySelectorAll('input[name="' + Et("" + t) + '"][type="radio"]'),
                    t = 0; t < n.length; t++) {
                        var l = n[t];
                        if (l !== e && l.form === e.form) {
                            var s = l[at] || null;
                            if (!s)
                                throw Error(u(90));
                            Ws(l, s.value, s.defaultValue, s.defaultValue, s.checked, s.defaultChecked, s.type, s.name)
                        }
                    }
                    for (t = 0; t < n.length; t++)
                        l = n[t],
                        l.form === e.form && pc(l)
                }
                break e;
            case "textarea":
                vc(e, n.value, n.defaultValue);
                break e;
            case "select":
                t = n.value,
                t != null && ul(e, !!n.multiple, t, !1)
            }
        }
    }
    var nr = !1;
    function wc(e, t, n) {
        if (nr)
            return e(t, n);
        nr = !0;
        try {
            var l = e(t);
            return l
        } finally {
            if (nr = !1,
            (cl !== null || fl !== null) && (Pi(),
            cl && (t = cl,
            e = fl,
            fl = cl = null,
            Ec(t),
            e)))
                for (t = 0; t < e.length; t++)
                    Ec(e[t])
        }
    }
    function Il(e, t) {
        var n = e.stateNode;
        if (n === null)
            return null;
        var l = n[at] || null;
        if (l === null)
            return null;
        n = l[t];
        e: switch (t) {
        case "onClick":
        case "onClickCapture":
        case "onDoubleClick":
        case "onDoubleClickCapture":
        case "onMouseDown":
        case "onMouseDownCapture":
        case "onMouseMove":
        case "onMouseMoveCapture":
        case "onMouseUp":
        case "onMouseUpCapture":
        case "onMouseEnter":
            (l = !l.disabled) || (e = e.type,
            l = !(e === "button" || e === "input" || e === "select" || e === "textarea")),
            e = !l;
            break e;
        default:
            e = !1
        }
        if (e)
            return null;
        if (n && typeof n != "function")
            throw Error(u(231, t, typeof n));
        return n
    }
    var Zt = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u")
      , lr = !1;
    if (Zt)
        try {
            var ea = {};
            Object.defineProperty(ea, "passive", {
                get: function() {
                    lr = !0
                }
            }),
            window.addEventListener("test", ea, ea),
            window.removeEventListener("test", ea, ea)
        } catch {
            lr = !1
        }
    var mn = null
      , ar = null
      , di = null;
    function _c() {
        if (di)
            return di;
        var e, t = ar, n = t.length, l, s = "value"in mn ? mn.value : mn.textContent, o = s.length;
        for (e = 0; e < n && t[e] === s[e]; e++)
            ;
        var h = n - e;
        for (l = 1; l <= h && t[n - l] === s[o - l]; l++)
            ;
        return di = s.slice(e, 1 < l ? 1 - l : void 0)
    }
    function hi(e) {
        var t = e.keyCode;
        return "charCode"in e ? (e = e.charCode,
        e === 0 && t === 13 && (e = 13)) : e = t,
        e === 10 && (e = 13),
        32 <= e || e === 13 ? e : 0
    }
    function mi() {
        return !0
    }
    function Cc() {
        return !1
    }
    function it(e) {
        function t(n, l, s, o, h) {
            this._reactName = n,
            this._targetInst = s,
            this.type = l,
            this.nativeEvent = o,
            this.target = h,
            this.currentTarget = null;
            for (var y in e)
                e.hasOwnProperty(y) && (n = e[y],
                this[y] = n ? n(o) : o[y]);
            return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? mi : Cc,
            this.isPropagationStopped = Cc,
            this
        }
        return v(t.prototype, {
            preventDefault: function() {
                this.defaultPrevented = !0;
                var n = this.nativeEvent;
                n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1),
                this.isDefaultPrevented = mi)
            },
            stopPropagation: function() {
                var n = this.nativeEvent;
                n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0),
                this.isPropagationStopped = mi)
            },
            persist: function() {},
            isPersistent: mi
        }),
        t
    }
    var Gn = {
        eventPhase: 0,
        bubbles: 0,
        cancelable: 0,
        timeStamp: function(e) {
            return e.timeStamp || Date.now()
        },
        defaultPrevented: 0,
        isTrusted: 0
    }, gi = it(Gn), ta = v({}, Gn, {
        view: 0,
        detail: 0
    }), zp = it(ta), ir, sr, na, pi = v({}, ta, {
        screenX: 0,
        screenY: 0,
        clientX: 0,
        clientY: 0,
        pageX: 0,
        pageY: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        getModifierState: ur,
        button: 0,
        buttons: 0,
        relatedTarget: function(e) {
            return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget
        },
        movementX: function(e) {
            return "movementX"in e ? e.movementX : (e !== na && (na && e.type === "mousemove" ? (ir = e.screenX - na.screenX,
            sr = e.screenY - na.screenY) : sr = ir = 0,
            na = e),
            ir)
        },
        movementY: function(e) {
            return "movementY"in e ? e.movementY : sr
        }
    }), Tc = it(pi), Up = v({}, pi, {
        dataTransfer: 0
    }), Hp = it(Up), Bp = v({}, ta, {
        relatedTarget: 0
    }), rr = it(Bp), qp = v({}, Gn, {
        animationName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    }), Gp = it(qp), Yp = v({}, Gn, {
        clipboardData: function(e) {
            return "clipboardData"in e ? e.clipboardData : window.clipboardData
        }
    }), Vp = it(Yp), Qp = v({}, Gn, {
        data: 0
    }), Oc = it(Qp), kp = {
        Esc: "Escape",
        Spacebar: " ",
        Left: "ArrowLeft",
        Up: "ArrowUp",
        Right: "ArrowRight",
        Down: "ArrowDown",
        Del: "Delete",
        Win: "OS",
        Menu: "ContextMenu",
        Apps: "ContextMenu",
        Scroll: "ScrollLock",
        MozPrintableKey: "Unidentified"
    }, Xp = {
        8: "Backspace",
        9: "Tab",
        12: "Clear",
        13: "Enter",
        16: "Shift",
        17: "Control",
        18: "Alt",
        19: "Pause",
        20: "CapsLock",
        27: "Escape",
        32: " ",
        33: "PageUp",
        34: "PageDown",
        35: "End",
        36: "Home",
        37: "ArrowLeft",
        38: "ArrowUp",
        39: "ArrowRight",
        40: "ArrowDown",
        45: "Insert",
        46: "Delete",
        112: "F1",
        113: "F2",
        114: "F3",
        115: "F4",
        116: "F5",
        117: "F6",
        118: "F7",
        119: "F8",
        120: "F9",
        121: "F10",
        122: "F11",
        123: "F12",
        144: "NumLock",
        145: "ScrollLock",
        224: "Meta"
    }, Zp = {
        Alt: "altKey",
        Control: "ctrlKey",
        Meta: "metaKey",
        Shift: "shiftKey"
    };
    function Kp(e) {
        var t = this.nativeEvent;
        return t.getModifierState ? t.getModifierState(e) : (e = Zp[e]) ? !!t[e] : !1
    }
    function ur() {
        return Kp
    }
    var Fp = v({}, ta, {
        key: function(e) {
            if (e.key) {
                var t = kp[e.key] || e.key;
                if (t !== "Unidentified")
                    return t
            }
            return e.type === "keypress" ? (e = hi(e),
            e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Xp[e.keyCode] || "Unidentified" : ""
        },
        code: 0,
        location: 0,
        ctrlKey: 0,
        shiftKey: 0,
        altKey: 0,
        metaKey: 0,
        repeat: 0,
        locale: 0,
        getModifierState: ur,
        charCode: function(e) {
            return e.type === "keypress" ? hi(e) : 0
        },
        keyCode: function(e) {
            return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
        },
        which: function(e) {
            return e.type === "keypress" ? hi(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0
        }
    })
      , Jp = it(Fp)
      , $p = v({}, pi, {
        pointerId: 0,
        width: 0,
        height: 0,
        pressure: 0,
        tangentialPressure: 0,
        tiltX: 0,
        tiltY: 0,
        twist: 0,
        pointerType: 0,
        isPrimary: 0
    })
      , Ac = it($p)
      , Wp = v({}, ta, {
        touches: 0,
        targetTouches: 0,
        changedTouches: 0,
        altKey: 0,
        metaKey: 0,
        ctrlKey: 0,
        shiftKey: 0,
        getModifierState: ur
    })
      , Pp = it(Wp)
      , Ip = v({}, Gn, {
        propertyName: 0,
        elapsedTime: 0,
        pseudoElement: 0
    })
      , ey = it(Ip)
      , ty = v({}, pi, {
        deltaX: function(e) {
            return "deltaX"in e ? e.deltaX : "wheelDeltaX"in e ? -e.wheelDeltaX : 0
        },
        deltaY: function(e) {
            return "deltaY"in e ? e.deltaY : "wheelDeltaY"in e ? -e.wheelDeltaY : "wheelDelta"in e ? -e.wheelDelta : 0
        },
        deltaZ: 0,
        deltaMode: 0
    })
      , ny = it(ty)
      , ly = v({}, Gn, {
        newState: 0,
        oldState: 0
    })
      , ay = it(ly)
      , iy = [9, 13, 27, 32]
      , or = Zt && "CompositionEvent"in window
      , la = null;
    Zt && "documentMode"in document && (la = document.documentMode);
    var sy = Zt && "TextEvent"in window && !la
      , Nc = Zt && (!or || la && 8 < la && 11 >= la)
      , Rc = " "
      , Lc = !1;
    function jc(e, t) {
        switch (e) {
        case "keyup":
            return iy.indexOf(t.keyCode) !== -1;
        case "keydown":
            return t.keyCode !== 229;
        case "keypress":
        case "mousedown":
        case "focusout":
            return !0;
        default:
            return !1
        }
    }
    function Dc(e) {
        return e = e.detail,
        typeof e == "object" && "data"in e ? e.data : null
    }
    var dl = !1;
    function ry(e, t) {
        switch (e) {
        case "compositionend":
            return Dc(t);
        case "keypress":
            return t.which !== 32 ? null : (Lc = !0,
            Rc);
        case "textInput":
            return e = t.data,
            e === Rc && Lc ? null : e;
        default:
            return null
        }
    }
    function uy(e, t) {
        if (dl)
            return e === "compositionend" || !or && jc(e, t) ? (e = _c(),
            di = ar = mn = null,
            dl = !1,
            e) : null;
        switch (e) {
        case "paste":
            return null;
        case "keypress":
            if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
                if (t.char && 1 < t.char.length)
                    return t.char;
                if (t.which)
                    return String.fromCharCode(t.which)
            }
            return null;
        case "compositionend":
            return Nc && t.locale !== "ko" ? null : t.data;
        default:
            return null
        }
    }
    var oy = {
        color: !0,
        date: !0,
        datetime: !0,
        "datetime-local": !0,
        email: !0,
        month: !0,
        number: !0,
        password: !0,
        range: !0,
        search: !0,
        tel: !0,
        text: !0,
        time: !0,
        url: !0,
        week: !0
    };
    function Mc(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return t === "input" ? !!oy[e.type] : t === "textarea"
    }
    function zc(e, t, n, l) {
        cl ? fl ? fl.push(l) : fl = [l] : cl = l,
        t = is(t, "onChange"),
        0 < t.length && (n = new gi("onChange","change",null,n,l),
        e.push({
            event: n,
            listeners: t
        }))
    }
    var aa = null
      , ia = null;
    function cy(e) {
        vh(e, 0)
    }
    function yi(e) {
        var t = Pl(e);
        if (pc(t))
            return e
    }
    function Uc(e, t) {
        if (e === "change")
            return t
    }
    var Hc = !1;
    if (Zt) {
        var cr;
        if (Zt) {
            var fr = "oninput"in document;
            if (!fr) {
                var Bc = document.createElement("div");
                Bc.setAttribute("oninput", "return;"),
                fr = typeof Bc.oninput == "function"
            }
            cr = fr
        } else
            cr = !1;
        Hc = cr && (!document.documentMode || 9 < document.documentMode)
    }
    function qc() {
        aa && (aa.detachEvent("onpropertychange", Gc),
        ia = aa = null)
    }
    function Gc(e) {
        if (e.propertyName === "value" && yi(ia)) {
            var t = [];
            zc(t, ia, e, tr(e)),
            wc(cy, t)
        }
    }
    function fy(e, t, n) {
        e === "focusin" ? (qc(),
        aa = t,
        ia = n,
        aa.attachEvent("onpropertychange", Gc)) : e === "focusout" && qc()
    }
    function dy(e) {
        if (e === "selectionchange" || e === "keyup" || e === "keydown")
            return yi(ia)
    }
    function hy(e, t) {
        if (e === "click")
            return yi(t)
    }
    function my(e, t) {
        if (e === "input" || e === "change")
            return yi(t)
    }
    function gy(e, t) {
        return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t
    }
    var mt = typeof Object.is == "function" ? Object.is : gy;
    function sa(e, t) {
        if (mt(e, t))
            return !0;
        if (typeof e != "object" || e === null || typeof t != "object" || t === null)
            return !1;
        var n = Object.keys(e)
          , l = Object.keys(t);
        if (n.length !== l.length)
            return !1;
        for (l = 0; l < n.length; l++) {
            var s = n[l];
            if (!Vs.call(t, s) || !mt(e[s], t[s]))
                return !1
        }
        return !0
    }
    function Yc(e) {
        for (; e && e.firstChild; )
            e = e.firstChild;
        return e
    }
    function Vc(e, t) {
        var n = Yc(e);
        e = 0;
        for (var l; n; ) {
            if (n.nodeType === 3) {
                if (l = e + n.textContent.length,
                e <= t && l >= t)
                    return {
                        node: n,
                        offset: t - e
                    };
                e = l
            }
            e: {
                for (; n; ) {
                    if (n.nextSibling) {
                        n = n.nextSibling;
                        break e
                    }
                    n = n.parentNode
                }
                n = void 0
            }
            n = Yc(n)
        }
    }
    function Qc(e, t) {
        return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Qc(e, t.parentNode) : "contains"in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1
    }
    function kc(e) {
        e = e != null && e.ownerDocument != null && e.ownerDocument.defaultView != null ? e.ownerDocument.defaultView : window;
        for (var t = ci(e.document); t instanceof e.HTMLIFrameElement; ) {
            try {
                var n = typeof t.contentWindow.location.href == "string"
            } catch {
                n = !1
            }
            if (n)
                e = t.contentWindow;
            else
                break;
            t = ci(e.document)
        }
        return t
    }
    function dr(e) {
        var t = e && e.nodeName && e.nodeName.toLowerCase();
        return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true")
    }
    var py = Zt && "documentMode"in document && 11 >= document.documentMode
      , hl = null
      , hr = null
      , ra = null
      , mr = !1;
    function Xc(e, t, n) {
        var l = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
        mr || hl == null || hl !== ci(l) || (l = hl,
        "selectionStart"in l && dr(l) ? l = {
            start: l.selectionStart,
            end: l.selectionEnd
        } : (l = (l.ownerDocument && l.ownerDocument.defaultView || window).getSelection(),
        l = {
            anchorNode: l.anchorNode,
            anchorOffset: l.anchorOffset,
            focusNode: l.focusNode,
            focusOffset: l.focusOffset
        }),
        ra && sa(ra, l) || (ra = l,
        l = is(hr, "onSelect"),
        0 < l.length && (t = new gi("onSelect","select",null,t,n),
        e.push({
            event: t,
            listeners: l
        }),
        t.target = hl)))
    }
    function Yn(e, t) {
        var n = {};
        return n[e.toLowerCase()] = t.toLowerCase(),
        n["Webkit" + e] = "webkit" + t,
        n["Moz" + e] = "moz" + t,
        n
    }
    var ml = {
        animationend: Yn("Animation", "AnimationEnd"),
        animationiteration: Yn("Animation", "AnimationIteration"),
        animationstart: Yn("Animation", "AnimationStart"),
        transitionrun: Yn("Transition", "TransitionRun"),
        transitionstart: Yn("Transition", "TransitionStart"),
        transitioncancel: Yn("Transition", "TransitionCancel"),
        transitionend: Yn("Transition", "TransitionEnd")
    }
      , gr = {}
      , Zc = {};
    Zt && (Zc = document.createElement("div").style,
    "AnimationEvent"in window || (delete ml.animationend.animation,
    delete ml.animationiteration.animation,
    delete ml.animationstart.animation),
    "TransitionEvent"in window || delete ml.transitionend.transition);
    function Vn(e) {
        if (gr[e])
            return gr[e];
        if (!ml[e])
            return e;
        var t = ml[e], n;
        for (n in t)
            if (t.hasOwnProperty(n) && n in Zc)
                return gr[e] = t[n];
        return e
    }
    var Kc = Vn("animationend")
      , Fc = Vn("animationiteration")
      , Jc = Vn("animationstart")
      , yy = Vn("transitionrun")
      , vy = Vn("transitionstart")
      , by = Vn("transitioncancel")
      , $c = Vn("transitionend")
      , Wc = new Map
      , pr = "abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
    pr.push("scrollEnd");
    function jt(e, t) {
        Wc.set(e, t),
        qn(t, [e])
    }
    var vi = typeof reportError == "function" ? reportError : function(e) {
        if (typeof window == "object" && typeof window.ErrorEvent == "function") {
            var t = new window.ErrorEvent("error",{
                bubbles: !0,
                cancelable: !0,
                message: typeof e == "object" && e !== null && typeof e.message == "string" ? String(e.message) : String(e),
                error: e
            });
            if (!window.dispatchEvent(t))
                return
        } else if (typeof process == "object" && typeof process.emit == "function") {
            process.emit("uncaughtException", e);
            return
        }
        console.error(e)
    }
      , wt = []
      , gl = 0
      , yr = 0;
    function bi() {
        for (var e = gl, t = yr = gl = 0; t < e; ) {
            var n = wt[t];
            wt[t++] = null;
            var l = wt[t];
            wt[t++] = null;
            var s = wt[t];
            wt[t++] = null;
            var o = wt[t];
            if (wt[t++] = null,
            l !== null && s !== null) {
                var h = l.pending;
                h === null ? s.next = s : (s.next = h.next,
                h.next = s),
                l.pending = s
            }
            o !== 0 && Pc(n, s, o)
        }
    }
    function xi(e, t, n, l) {
        wt[gl++] = e,
        wt[gl++] = t,
        wt[gl++] = n,
        wt[gl++] = l,
        yr |= l,
        e.lanes |= l,
        e = e.alternate,
        e !== null && (e.lanes |= l)
    }
    function vr(e, t, n, l) {
        return xi(e, t, n, l),
        Si(e)
    }
    function Qn(e, t) {
        return xi(e, null, null, t),
        Si(e)
    }
    function Pc(e, t, n) {
        e.lanes |= n;
        var l = e.alternate;
        l !== null && (l.lanes |= n);
        for (var s = !1, o = e.return; o !== null; )
            o.childLanes |= n,
            l = o.alternate,
            l !== null && (l.childLanes |= n),
            o.tag === 22 && (e = o.stateNode,
            e === null || e._visibility & 1 || (s = !0)),
            e = o,
            o = o.return;
        return e.tag === 3 ? (o = e.stateNode,
        s && t !== null && (s = 31 - ht(n),
        e = o.hiddenUpdates,
        l = e[s],
        l === null ? e[s] = [t] : l.push(t),
        t.lane = n | 536870912),
        o) : null
    }
    function Si(e) {
        if (50 < Na)
            throw Na = 0,
            Ou = null,
            Error(u(185));
        for (var t = e.return; t !== null; )
            e = t,
            t = e.return;
        return e.tag === 3 ? e.stateNode : null
    }
    var pl = {};
    function xy(e, t, n, l) {
        this.tag = e,
        this.key = n,
        this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null,
        this.index = 0,
        this.refCleanup = this.ref = null,
        this.pendingProps = t,
        this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null,
        this.mode = l,
        this.subtreeFlags = this.flags = 0,
        this.deletions = null,
        this.childLanes = this.lanes = 0,
        this.alternate = null
    }
    function gt(e, t, n, l) {
        return new xy(e,t,n,l)
    }
    function br(e) {
        return e = e.prototype,
        !(!e || !e.isReactComponent)
    }
    function Kt(e, t) {
        var n = e.alternate;
        return n === null ? (n = gt(e.tag, t, e.key, e.mode),
        n.elementType = e.elementType,
        n.type = e.type,
        n.stateNode = e.stateNode,
        n.alternate = e,
        e.alternate = n) : (n.pendingProps = t,
        n.type = e.type,
        n.flags = 0,
        n.subtreeFlags = 0,
        n.deletions = null),
        n.flags = e.flags & 65011712,
        n.childLanes = e.childLanes,
        n.lanes = e.lanes,
        n.child = e.child,
        n.memoizedProps = e.memoizedProps,
        n.memoizedState = e.memoizedState,
        n.updateQueue = e.updateQueue,
        t = e.dependencies,
        n.dependencies = t === null ? null : {
            lanes: t.lanes,
            firstContext: t.firstContext
        },
        n.sibling = e.sibling,
        n.index = e.index,
        n.ref = e.ref,
        n.refCleanup = e.refCleanup,
        n
    }
    function Ic(e, t) {
        e.flags &= 65011714;
        var n = e.alternate;
        return n === null ? (e.childLanes = 0,
        e.lanes = t,
        e.child = null,
        e.subtreeFlags = 0,
        e.memoizedProps = null,
        e.memoizedState = null,
        e.updateQueue = null,
        e.dependencies = null,
        e.stateNode = null) : (e.childLanes = n.childLanes,
        e.lanes = n.lanes,
        e.child = n.child,
        e.subtreeFlags = 0,
        e.deletions = null,
        e.memoizedProps = n.memoizedProps,
        e.memoizedState = n.memoizedState,
        e.updateQueue = n.updateQueue,
        e.type = n.type,
        t = n.dependencies,
        e.dependencies = t === null ? null : {
            lanes: t.lanes,
            firstContext: t.firstContext
        }),
        e
    }
    function Ei(e, t, n, l, s, o) {
        var h = 0;
        if (l = e,
        typeof e == "function")
            br(e) && (h = 1);
        else if (typeof e == "string")
            h = C0(e, n, J.current) ? 26 : e === "html" || e === "head" || e === "body" ? 27 : 5;
        else
            e: switch (e) {
            case Ce:
                return e = gt(31, n, t, s),
                e.elementType = Ce,
                e.lanes = o,
                e;
            case A:
                return kn(n.children, s, o, t);
            case _:
                h = 8,
                s |= 24;
                break;
            case D:
                return e = gt(12, n, t, s | 2),
                e.elementType = D,
                e.lanes = o,
                e;
            case W:
                return e = gt(13, n, t, s),
                e.elementType = W,
                e.lanes = o,
                e;
            case ue:
                return e = gt(19, n, t, s),
                e.elementType = ue,
                e.lanes = o,
                e;
            default:
                if (typeof e == "object" && e !== null)
                    switch (e.$$typeof) {
                    case V:
                        h = 10;
                        break e;
                    case G:
                        h = 9;
                        break e;
                    case F:
                        h = 11;
                        break e;
                    case P:
                        h = 14;
                        break e;
                    case ye:
                        h = 16,
                        l = null;
                        break e
                    }
                h = 29,
                n = Error(u(130, e === null ? "null" : typeof e, "")),
                l = null
            }
        return t = gt(h, n, t, s),
        t.elementType = e,
        t.type = l,
        t.lanes = o,
        t
    }
    function kn(e, t, n, l) {
        return e = gt(7, e, l, t),
        e.lanes = n,
        e
    }
    function xr(e, t, n) {
        return e = gt(6, e, null, t),
        e.lanes = n,
        e
    }
    function ef(e) {
        var t = gt(18, null, null, 0);
        return t.stateNode = e,
        t
    }
    function Sr(e, t, n) {
        return t = gt(4, e.children !== null ? e.children : [], e.key, t),
        t.lanes = n,
        t.stateNode = {
            containerInfo: e.containerInfo,
            pendingChildren: null,
            implementation: e.implementation
        },
        t
    }
    var tf = new WeakMap;
    function _t(e, t) {
        if (typeof e == "object" && e !== null) {
            var n = tf.get(e);
            return n !== void 0 ? n : (t = {
                value: e,
                source: t,
                stack: ec(t)
            },
            tf.set(e, t),
            t)
        }
        return {
            value: e,
            source: t,
            stack: ec(t)
        }
    }
    var yl = []
      , vl = 0
      , wi = null
      , ua = 0
      , Ct = []
      , Tt = 0
      , gn = null
      , Ut = 1
      , Ht = "";
    function Ft(e, t) {
        yl[vl++] = ua,
        yl[vl++] = wi,
        wi = e,
        ua = t
    }
    function nf(e, t, n) {
        Ct[Tt++] = Ut,
        Ct[Tt++] = Ht,
        Ct[Tt++] = gn,
        gn = e;
        var l = Ut;
        e = Ht;
        var s = 32 - ht(l) - 1;
        l &= ~(1 << s),
        n += 1;
        var o = 32 - ht(t) + s;
        if (30 < o) {
            var h = s - s % 5;
            o = (l & (1 << h) - 1).toString(32),
            l >>= h,
            s -= h,
            Ut = 1 << 32 - ht(t) + s | n << s | l,
            Ht = o + e
        } else
            Ut = 1 << o | n << s | l,
            Ht = e
    }
    function Er(e) {
        e.return !== null && (Ft(e, 1),
        nf(e, 1, 0))
    }
    function wr(e) {
        for (; e === wi; )
            wi = yl[--vl],
            yl[vl] = null,
            ua = yl[--vl],
            yl[vl] = null;
        for (; e === gn; )
            gn = Ct[--Tt],
            Ct[Tt] = null,
            Ht = Ct[--Tt],
            Ct[Tt] = null,
            Ut = Ct[--Tt],
            Ct[Tt] = null
    }
    function lf(e, t) {
        Ct[Tt++] = Ut,
        Ct[Tt++] = Ht,
        Ct[Tt++] = gn,
        Ut = t.id,
        Ht = t.overflow,
        gn = e
    }
    var $e = null
      , je = null
      , ve = !1
      , pn = null
      , Ot = !1
      , _r = Error(u(519));
    function yn(e) {
        var t = Error(u(418, 1 < arguments.length && arguments[1] !== void 0 && arguments[1] ? "text" : "HTML", ""));
        throw oa(_t(t, e)),
        _r
    }
    function af(e) {
        var t = e.stateNode
          , n = e.type
          , l = e.memoizedProps;
        switch (t[Je] = e,
        t[at] = l,
        n) {
        case "dialog":
            me("cancel", t),
            me("close", t);
            break;
        case "iframe":
        case "object":
        case "embed":
            me("load", t);
            break;
        case "video":
        case "audio":
            for (n = 0; n < La.length; n++)
                me(La[n], t);
            break;
        case "source":
            me("error", t);
            break;
        case "img":
        case "image":
        case "link":
            me("error", t),
            me("load", t);
            break;
        case "details":
            me("toggle", t);
            break;
        case "input":
            me("invalid", t),
            yc(t, l.value, l.defaultValue, l.checked, l.defaultChecked, l.type, l.name, !0);
            break;
        case "select":
            me("invalid", t);
            break;
        case "textarea":
            me("invalid", t),
            bc(t, l.value, l.defaultValue, l.children)
        }
        n = l.children,
        typeof n != "string" && typeof n != "number" && typeof n != "bigint" || t.textContent === "" + n || l.suppressHydrationWarning === !0 || Eh(t.textContent, n) ? (l.popover != null && (me("beforetoggle", t),
        me("toggle", t)),
        l.onScroll != null && me("scroll", t),
        l.onScrollEnd != null && me("scrollend", t),
        l.onClick != null && (t.onclick = Xt),
        t = !0) : t = !1,
        t || yn(e, !0)
    }
    function sf(e) {
        for ($e = e.return; $e; )
            switch ($e.tag) {
            case 5:
            case 31:
            case 13:
                Ot = !1;
                return;
            case 27:
            case 3:
                Ot = !0;
                return;
            default:
                $e = $e.return
            }
    }
    function bl(e) {
        if (e !== $e)
            return !1;
        if (!ve)
            return sf(e),
            ve = !0,
            !1;
        var t = e.tag, n;
        if ((n = t !== 3 && t !== 27) && ((n = t === 5) && (n = e.type,
        n = !(n !== "form" && n !== "button") || Vu(e.type, e.memoizedProps)),
        n = !n),
        n && je && yn(e),
        sf(e),
        t === 13) {
            if (e = e.memoizedState,
            e = e !== null ? e.dehydrated : null,
            !e)
                throw Error(u(317));
            je = Lh(e)
        } else if (t === 31) {
            if (e = e.memoizedState,
            e = e !== null ? e.dehydrated : null,
            !e)
                throw Error(u(317));
            je = Lh(e)
        } else
            t === 27 ? (t = je,
            Ln(e.type) ? (e = Ku,
            Ku = null,
            je = e) : je = t) : je = $e ? Nt(e.stateNode.nextSibling) : null;
        return !0
    }
    function Xn() {
        je = $e = null,
        ve = !1
    }
    function Cr() {
        var e = pn;
        return e !== null && (ot === null ? ot = e : ot.push.apply(ot, e),
        pn = null),
        e
    }
    function oa(e) {
        pn === null ? pn = [e] : pn.push(e)
    }
    var Tr = T(null)
      , Zn = null
      , Jt = null;
    function vn(e, t, n) {
        Z(Tr, t._currentValue),
        t._currentValue = n
    }
    function $t(e) {
        e._currentValue = Tr.current,
        B(Tr)
    }
    function Or(e, t, n) {
        for (; e !== null; ) {
            var l = e.alternate;
            if ((e.childLanes & t) !== t ? (e.childLanes |= t,
            l !== null && (l.childLanes |= t)) : l !== null && (l.childLanes & t) !== t && (l.childLanes |= t),
            e === n)
                break;
            e = e.return
        }
    }
    function Ar(e, t, n, l) {
        var s = e.child;
        for (s !== null && (s.return = e); s !== null; ) {
            var o = s.dependencies;
            if (o !== null) {
                var h = s.child;
                o = o.firstContext;
                e: for (; o !== null; ) {
                    var y = o;
                    o = s;
                    for (var C = 0; C < t.length; C++)
                        if (y.context === t[C]) {
                            o.lanes |= n,
                            y = o.alternate,
                            y !== null && (y.lanes |= n),
                            Or(o.return, n, e),
                            l || (h = null);
                            break e
                        }
                    o = y.next
                }
            } else if (s.tag === 18) {
                if (h = s.return,
                h === null)
                    throw Error(u(341));
                h.lanes |= n,
                o = h.alternate,
                o !== null && (o.lanes |= n),
                Or(h, n, e),
                h = null
            } else
                h = s.child;
            if (h !== null)
                h.return = s;
            else
                for (h = s; h !== null; ) {
                    if (h === e) {
                        h = null;
                        break
                    }
                    if (s = h.sibling,
                    s !== null) {
                        s.return = h.return,
                        h = s;
                        break
                    }
                    h = h.return
                }
            s = h
        }
    }
    function xl(e, t, n, l) {
        e = null;
        for (var s = t, o = !1; s !== null; ) {
            if (!o) {
                if ((s.flags & 524288) !== 0)
                    o = !0;
                else if ((s.flags & 262144) !== 0)
                    break
            }
            if (s.tag === 10) {
                var h = s.alternate;
                if (h === null)
                    throw Error(u(387));
                if (h = h.memoizedProps,
                h !== null) {
                    var y = s.type;
                    mt(s.pendingProps.value, h.value) || (e !== null ? e.push(y) : e = [y])
                }
            } else if (s === _e.current) {
                if (h = s.alternate,
                h === null)
                    throw Error(u(387));
                h.memoizedState.memoizedState !== s.memoizedState.memoizedState && (e !== null ? e.push(Ua) : e = [Ua])
            }
            s = s.return
        }
        e !== null && Ar(t, e, n, l),
        t.flags |= 262144
    }
    function _i(e) {
        for (e = e.firstContext; e !== null; ) {
            if (!mt(e.context._currentValue, e.memoizedValue))
                return !0;
            e = e.next
        }
        return !1
    }
    function Kn(e) {
        Zn = e,
        Jt = null,
        e = e.dependencies,
        e !== null && (e.firstContext = null)
    }
    function We(e) {
        return rf(Zn, e)
    }
    function Ci(e, t) {
        return Zn === null && Kn(e),
        rf(e, t)
    }
    function rf(e, t) {
        var n = t._currentValue;
        if (t = {
            context: t,
            memoizedValue: n,
            next: null
        },
        Jt === null) {
            if (e === null)
                throw Error(u(308));
            Jt = t,
            e.dependencies = {
                lanes: 0,
                firstContext: t
            },
            e.flags |= 524288
        } else
            Jt = Jt.next = t;
        return n
    }
    var Sy = typeof AbortController < "u" ? AbortController : function() {
        var e = []
          , t = this.signal = {
            aborted: !1,
            addEventListener: function(n, l) {
                e.push(l)
            }
        };
        this.abort = function() {
            t.aborted = !0,
            e.forEach(function(n) {
                return n()
            })
        }
    }
      , Ey = i.unstable_scheduleCallback
      , wy = i.unstable_NormalPriority
      , Ge = {
        $$typeof: V,
        Consumer: null,
        Provider: null,
        _currentValue: null,
        _currentValue2: null,
        _threadCount: 0
    };
    function Nr() {
        return {
            controller: new Sy,
            data: new Map,
            refCount: 0
        }
    }
    function ca(e) {
        e.refCount--,
        e.refCount === 0 && Ey(wy, function() {
            e.controller.abort()
        })
    }
    var fa = null
      , Rr = 0
      , Sl = 0
      , El = null;
    function _y(e, t) {
        if (fa === null) {
            var n = fa = [];
            Rr = 0,
            Sl = Du(),
            El = {
                status: "pending",
                value: void 0,
                then: function(l) {
                    n.push(l)
                }
            }
        }
        return Rr++,
        t.then(uf, uf),
        t
    }
    function uf() {
        if (--Rr === 0 && fa !== null) {
            El !== null && (El.status = "fulfilled");
            var e = fa;
            fa = null,
            Sl = 0,
            El = null;
            for (var t = 0; t < e.length; t++)
                (0,
                e[t])()
        }
    }
    function Cy(e, t) {
        var n = []
          , l = {
            status: "pending",
            value: null,
            reason: null,
            then: function(s) {
                n.push(s)
            }
        };
        return e.then(function() {
            l.status = "fulfilled",
            l.value = t;
            for (var s = 0; s < n.length; s++)
                (0,
                n[s])(t)
        }, function(s) {
            for (l.status = "rejected",
            l.reason = s,
            s = 0; s < n.length; s++)
                (0,
                n[s])(void 0)
        }),
        l
    }
    var of = z.S;
    z.S = function(e, t) {
        Zd = ft(),
        typeof t == "object" && t !== null && typeof t.then == "function" && _y(e, t),
        of !== null && of(e, t)
    }
    ;
    var Fn = T(null);
    function Lr() {
        var e = Fn.current;
        return e !== null ? e : Le.pooledCache
    }
    function Ti(e, t) {
        t === null ? Z(Fn, Fn.current) : Z(Fn, t.pool)
    }
    function cf() {
        var e = Lr();
        return e === null ? null : {
            parent: Ge._currentValue,
            pool: e
        }
    }
    var wl = Error(u(460))
      , jr = Error(u(474))
      , Oi = Error(u(542))
      , Ai = {
        then: function() {}
    };
    function ff(e) {
        return e = e.status,
        e === "fulfilled" || e === "rejected"
    }
    function df(e, t, n) {
        switch (n = e[n],
        n === void 0 ? e.push(t) : n !== t && (t.then(Xt, Xt),
        t = n),
        t.status) {
        case "fulfilled":
            return t.value;
        case "rejected":
            throw e = t.reason,
            mf(e),
            e;
        default:
            if (typeof t.status == "string")
                t.then(Xt, Xt);
            else {
                if (e = Le,
                e !== null && 100 < e.shellSuspendCounter)
                    throw Error(u(482));
                e = t,
                e.status = "pending",
                e.then(function(l) {
                    if (t.status === "pending") {
                        var s = t;
                        s.status = "fulfilled",
                        s.value = l
                    }
                }, function(l) {
                    if (t.status === "pending") {
                        var s = t;
                        s.status = "rejected",
                        s.reason = l
                    }
                })
            }
            switch (t.status) {
            case "fulfilled":
                return t.value;
            case "rejected":
                throw e = t.reason,
                mf(e),
                e
            }
            throw $n = t,
            wl
        }
    }
    function Jn(e) {
        try {
            var t = e._init;
            return t(e._payload)
        } catch (n) {
            throw n !== null && typeof n == "object" && typeof n.then == "function" ? ($n = n,
            wl) : n
        }
    }
    var $n = null;
    function hf() {
        if ($n === null)
            throw Error(u(459));
        var e = $n;
        return $n = null,
        e
    }
    function mf(e) {
        if (e === wl || e === Oi)
            throw Error(u(483))
    }
    var _l = null
      , da = 0;
    function Ni(e) {
        var t = da;
        return da += 1,
        _l === null && (_l = []),
        df(_l, e, t)
    }
    function ha(e, t) {
        t = t.props.ref,
        e.ref = t !== void 0 ? t : null
    }
    function Ri(e, t) {
        throw t.$$typeof === S ? Error(u(525)) : (e = Object.prototype.toString.call(t),
        Error(u(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e)))
    }
    function gf(e) {
        function t(N, O) {
            if (e) {
                var R = N.deletions;
                R === null ? (N.deletions = [O],
                N.flags |= 16) : R.push(O)
            }
        }
        function n(N, O) {
            if (!e)
                return null;
            for (; O !== null; )
                t(N, O),
                O = O.sibling;
            return null
        }
        function l(N) {
            for (var O = new Map; N !== null; )
                N.key !== null ? O.set(N.key, N) : O.set(N.index, N),
                N = N.sibling;
            return O
        }
        function s(N, O) {
            return N = Kt(N, O),
            N.index = 0,
            N.sibling = null,
            N
        }
        function o(N, O, R) {
            return N.index = R,
            e ? (R = N.alternate,
            R !== null ? (R = R.index,
            R < O ? (N.flags |= 67108866,
            O) : R) : (N.flags |= 67108866,
            O)) : (N.flags |= 1048576,
            O)
        }
        function h(N) {
            return e && N.alternate === null && (N.flags |= 67108866),
            N
        }
        function y(N, O, R, q) {
            return O === null || O.tag !== 6 ? (O = xr(R, N.mode, q),
            O.return = N,
            O) : (O = s(O, R),
            O.return = N,
            O)
        }
        function C(N, O, R, q) {
            var ee = R.type;
            return ee === A ? U(N, O, R.props.children, q, R.key) : O !== null && (O.elementType === ee || typeof ee == "object" && ee !== null && ee.$$typeof === ye && Jn(ee) === O.type) ? (O = s(O, R.props),
            ha(O, R),
            O.return = N,
            O) : (O = Ei(R.type, R.key, R.props, null, N.mode, q),
            ha(O, R),
            O.return = N,
            O)
        }
        function L(N, O, R, q) {
            return O === null || O.tag !== 4 || O.stateNode.containerInfo !== R.containerInfo || O.stateNode.implementation !== R.implementation ? (O = Sr(R, N.mode, q),
            O.return = N,
            O) : (O = s(O, R.children || []),
            O.return = N,
            O)
        }
        function U(N, O, R, q, ee) {
            return O === null || O.tag !== 7 ? (O = kn(R, N.mode, q, ee),
            O.return = N,
            O) : (O = s(O, R),
            O.return = N,
            O)
        }
        function Y(N, O, R) {
            if (typeof O == "string" && O !== "" || typeof O == "number" || typeof O == "bigint")
                return O = xr("" + O, N.mode, R),
                O.return = N,
                O;
            if (typeof O == "object" && O !== null) {
                switch (O.$$typeof) {
                case x:
                    return R = Ei(O.type, O.key, O.props, null, N.mode, R),
                    ha(R, O),
                    R.return = N,
                    R;
                case E:
                    return O = Sr(O, N.mode, R),
                    O.return = N,
                    O;
                case ye:
                    return O = Jn(O),
                    Y(N, O, R)
                }
                if (fe(O) || K(O))
                    return O = kn(O, N.mode, R, null),
                    O.return = N,
                    O;
                if (typeof O.then == "function")
                    return Y(N, Ni(O), R);
                if (O.$$typeof === V)
                    return Y(N, Ci(N, O), R);
                Ri(N, O)
            }
            return null
        }
        function j(N, O, R, q) {
            var ee = O !== null ? O.key : null;
            if (typeof R == "string" && R !== "" || typeof R == "number" || typeof R == "bigint")
                return ee !== null ? null : y(N, O, "" + R, q);
            if (typeof R == "object" && R !== null) {
                switch (R.$$typeof) {
                case x:
                    return R.key === ee ? C(N, O, R, q) : null;
                case E:
                    return R.key === ee ? L(N, O, R, q) : null;
                case ye:
                    return R = Jn(R),
                    j(N, O, R, q)
                }
                if (fe(R) || K(R))
                    return ee !== null ? null : U(N, O, R, q, null);
                if (typeof R.then == "function")
                    return j(N, O, Ni(R), q);
                if (R.$$typeof === V)
                    return j(N, O, Ci(N, R), q);
                Ri(N, R)
            }
            return null
        }
        function M(N, O, R, q, ee) {
            if (typeof q == "string" && q !== "" || typeof q == "number" || typeof q == "bigint")
                return N = N.get(R) || null,
                y(O, N, "" + q, ee);
            if (typeof q == "object" && q !== null) {
                switch (q.$$typeof) {
                case x:
                    return N = N.get(q.key === null ? R : q.key) || null,
                    C(O, N, q, ee);
                case E:
                    return N = N.get(q.key === null ? R : q.key) || null,
                    L(O, N, q, ee);
                case ye:
                    return q = Jn(q),
                    M(N, O, R, q, ee)
                }
                if (fe(q) || K(q))
                    return N = N.get(R) || null,
                    U(O, N, q, ee, null);
                if (typeof q.then == "function")
                    return M(N, O, R, Ni(q), ee);
                if (q.$$typeof === V)
                    return M(N, O, R, Ci(O, q), ee);
                Ri(O, q)
            }
            return null
        }
        function $(N, O, R, q) {
            for (var ee = null, xe = null, I = O, ce = O = 0, pe = null; I !== null && ce < R.length; ce++) {
                I.index > ce ? (pe = I,
                I = null) : pe = I.sibling;
                var Se = j(N, I, R[ce], q);
                if (Se === null) {
                    I === null && (I = pe);
                    break
                }
                e && I && Se.alternate === null && t(N, I),
                O = o(Se, O, ce),
                xe === null ? ee = Se : xe.sibling = Se,
                xe = Se,
                I = pe
            }
            if (ce === R.length)
                return n(N, I),
                ve && Ft(N, ce),
                ee;
            if (I === null) {
                for (; ce < R.length; ce++)
                    I = Y(N, R[ce], q),
                    I !== null && (O = o(I, O, ce),
                    xe === null ? ee = I : xe.sibling = I,
                    xe = I);
                return ve && Ft(N, ce),
                ee
            }
            for (I = l(I); ce < R.length; ce++)
                pe = M(I, N, ce, R[ce], q),
                pe !== null && (e && pe.alternate !== null && I.delete(pe.key === null ? ce : pe.key),
                O = o(pe, O, ce),
                xe === null ? ee = pe : xe.sibling = pe,
                xe = pe);
            return e && I.forEach(function(Un) {
                return t(N, Un)
            }),
            ve && Ft(N, ce),
            ee
        }
        function le(N, O, R, q) {
            if (R == null)
                throw Error(u(151));
            for (var ee = null, xe = null, I = O, ce = O = 0, pe = null, Se = R.next(); I !== null && !Se.done; ce++,
            Se = R.next()) {
                I.index > ce ? (pe = I,
                I = null) : pe = I.sibling;
                var Un = j(N, I, Se.value, q);
                if (Un === null) {
                    I === null && (I = pe);
                    break
                }
                e && I && Un.alternate === null && t(N, I),
                O = o(Un, O, ce),
                xe === null ? ee = Un : xe.sibling = Un,
                xe = Un,
                I = pe
            }
            if (Se.done)
                return n(N, I),
                ve && Ft(N, ce),
                ee;
            if (I === null) {
                for (; !Se.done; ce++,
                Se = R.next())
                    Se = Y(N, Se.value, q),
                    Se !== null && (O = o(Se, O, ce),
                    xe === null ? ee = Se : xe.sibling = Se,
                    xe = Se);
                return ve && Ft(N, ce),
                ee
            }
            for (I = l(I); !Se.done; ce++,
            Se = R.next())
                Se = M(I, N, ce, Se.value, q),
                Se !== null && (e && Se.alternate !== null && I.delete(Se.key === null ? ce : Se.key),
                O = o(Se, O, ce),
                xe === null ? ee = Se : xe.sibling = Se,
                xe = Se);
            return e && I.forEach(function(U0) {
                return t(N, U0)
            }),
            ve && Ft(N, ce),
            ee
        }
        function Re(N, O, R, q) {
            if (typeof R == "object" && R !== null && R.type === A && R.key === null && (R = R.props.children),
            typeof R == "object" && R !== null) {
                switch (R.$$typeof) {
                case x:
                    e: {
                        for (var ee = R.key; O !== null; ) {
                            if (O.key === ee) {
                                if (ee = R.type,
                                ee === A) {
                                    if (O.tag === 7) {
                                        n(N, O.sibling),
                                        q = s(O, R.props.children),
                                        q.return = N,
                                        N = q;
                                        break e
                                    }
                                } else if (O.elementType === ee || typeof ee == "object" && ee !== null && ee.$$typeof === ye && Jn(ee) === O.type) {
                                    n(N, O.sibling),
                                    q = s(O, R.props),
                                    ha(q, R),
                                    q.return = N,
                                    N = q;
                                    break e
                                }
                                n(N, O);
                                break
                            } else
                                t(N, O);
                            O = O.sibling
                        }
                        R.type === A ? (q = kn(R.props.children, N.mode, q, R.key),
                        q.return = N,
                        N = q) : (q = Ei(R.type, R.key, R.props, null, N.mode, q),
                        ha(q, R),
                        q.return = N,
                        N = q)
                    }
                    return h(N);
                case E:
                    e: {
                        for (ee = R.key; O !== null; ) {
                            if (O.key === ee)
                                if (O.tag === 4 && O.stateNode.containerInfo === R.containerInfo && O.stateNode.implementation === R.implementation) {
                                    n(N, O.sibling),
                                    q = s(O, R.children || []),
                                    q.return = N,
                                    N = q;
                                    break e
                                } else {
                                    n(N, O);
                                    break
                                }
                            else
                                t(N, O);
                            O = O.sibling
                        }
                        q = Sr(R, N.mode, q),
                        q.return = N,
                        N = q
                    }
                    return h(N);
                case ye:
                    return R = Jn(R),
                    Re(N, O, R, q)
                }
                if (fe(R))
                    return $(N, O, R, q);
                if (K(R)) {
                    if (ee = K(R),
                    typeof ee != "function")
                        throw Error(u(150));
                    return R = ee.call(R),
                    le(N, O, R, q)
                }
                if (typeof R.then == "function")
                    return Re(N, O, Ni(R), q);
                if (R.$$typeof === V)
                    return Re(N, O, Ci(N, R), q);
                Ri(N, R)
            }
            return typeof R == "string" && R !== "" || typeof R == "number" || typeof R == "bigint" ? (R = "" + R,
            O !== null && O.tag === 6 ? (n(N, O.sibling),
            q = s(O, R),
            q.return = N,
            N = q) : (n(N, O),
            q = xr(R, N.mode, q),
            q.return = N,
            N = q),
            h(N)) : n(N, O)
        }
        return function(N, O, R, q) {
            try {
                da = 0;
                var ee = Re(N, O, R, q);
                return _l = null,
                ee
            } catch (I) {
                if (I === wl || I === Oi)
                    throw I;
                var xe = gt(29, I, null, N.mode);
                return xe.lanes = q,
                xe.return = N,
                xe
            }
        }
    }
    var Wn = gf(!0)
      , pf = gf(!1)
      , bn = !1;
    function Dr(e) {
        e.updateQueue = {
            baseState: e.memoizedState,
            firstBaseUpdate: null,
            lastBaseUpdate: null,
            shared: {
                pending: null,
                lanes: 0,
                hiddenCallbacks: null
            },
            callbacks: null
        }
    }
    function Mr(e, t) {
        e = e.updateQueue,
        t.updateQueue === e && (t.updateQueue = {
            baseState: e.baseState,
            firstBaseUpdate: e.firstBaseUpdate,
            lastBaseUpdate: e.lastBaseUpdate,
            shared: e.shared,
            callbacks: null
        })
    }
    function xn(e) {
        return {
            lane: e,
            tag: 0,
            payload: null,
            callback: null,
            next: null
        }
    }
    function Sn(e, t, n) {
        var l = e.updateQueue;
        if (l === null)
            return null;
        if (l = l.shared,
        (Ee & 2) !== 0) {
            var s = l.pending;
            return s === null ? t.next = t : (t.next = s.next,
            s.next = t),
            l.pending = t,
            t = Si(e),
            Pc(e, null, n),
            t
        }
        return xi(e, l, t, n),
        Si(e)
    }
    function ma(e, t, n) {
        if (t = t.updateQueue,
        t !== null && (t = t.shared,
        (n & 4194048) !== 0)) {
            var l = t.lanes;
            l &= e.pendingLanes,
            n |= l,
            t.lanes = n,
            sc(e, n)
        }
    }
    function zr(e, t) {
        var n = e.updateQueue
          , l = e.alternate;
        if (l !== null && (l = l.updateQueue,
        n === l)) {
            var s = null
              , o = null;
            if (n = n.firstBaseUpdate,
            n !== null) {
                do {
                    var h = {
                        lane: n.lane,
                        tag: n.tag,
                        payload: n.payload,
                        callback: null,
                        next: null
                    };
                    o === null ? s = o = h : o = o.next = h,
                    n = n.next
                } while (n !== null);
                o === null ? s = o = t : o = o.next = t
            } else
                s = o = t;
            n = {
                baseState: l.baseState,
                firstBaseUpdate: s,
                lastBaseUpdate: o,
                shared: l.shared,
                callbacks: l.callbacks
            },
            e.updateQueue = n;
            return
        }
        e = n.lastBaseUpdate,
        e === null ? n.firstBaseUpdate = t : e.next = t,
        n.lastBaseUpdate = t
    }
    var Ur = !1;
    function ga() {
        if (Ur) {
            var e = El;
            if (e !== null)
                throw e
        }
    }
    function pa(e, t, n, l) {
        Ur = !1;
        var s = e.updateQueue;
        bn = !1;
        var o = s.firstBaseUpdate
          , h = s.lastBaseUpdate
          , y = s.shared.pending;
        if (y !== null) {
            s.shared.pending = null;
            var C = y
              , L = C.next;
            C.next = null,
            h === null ? o = L : h.next = L,
            h = C;
            var U = e.alternate;
            U !== null && (U = U.updateQueue,
            y = U.lastBaseUpdate,
            y !== h && (y === null ? U.firstBaseUpdate = L : y.next = L,
            U.lastBaseUpdate = C))
        }
        if (o !== null) {
            var Y = s.baseState;
            h = 0,
            U = L = C = null,
            y = o;
            do {
                var j = y.lane & -536870913
                  , M = j !== y.lane;
                if (M ? (ge & j) === j : (l & j) === j) {
                    j !== 0 && j === Sl && (Ur = !0),
                    U !== null && (U = U.next = {
                        lane: 0,
                        tag: y.tag,
                        payload: y.payload,
                        callback: null,
                        next: null
                    });
                    e: {
                        var $ = e
                          , le = y;
                        j = t;
                        var Re = n;
                        switch (le.tag) {
                        case 1:
                            if ($ = le.payload,
                            typeof $ == "function") {
                                Y = $.call(Re, Y, j);
                                break e
                            }
                            Y = $;
                            break e;
                        case 3:
                            $.flags = $.flags & -65537 | 128;
                        case 0:
                            if ($ = le.payload,
                            j = typeof $ == "function" ? $.call(Re, Y, j) : $,
                            j == null)
                                break e;
                            Y = v({}, Y, j);
                            break e;
                        case 2:
                            bn = !0
                        }
                    }
                    j = y.callback,
                    j !== null && (e.flags |= 64,
                    M && (e.flags |= 8192),
                    M = s.callbacks,
                    M === null ? s.callbacks = [j] : M.push(j))
                } else
                    M = {
                        lane: j,
                        tag: y.tag,
                        payload: y.payload,
                        callback: y.callback,
                        next: null
                    },
                    U === null ? (L = U = M,
                    C = Y) : U = U.next = M,
                    h |= j;
                if (y = y.next,
                y === null) {
                    if (y = s.shared.pending,
                    y === null)
                        break;
                    M = y,
                    y = M.next,
                    M.next = null,
                    s.lastBaseUpdate = M,
                    s.shared.pending = null
                }
            } while (!0);
            U === null && (C = Y),
            s.baseState = C,
            s.firstBaseUpdate = L,
            s.lastBaseUpdate = U,
            o === null && (s.shared.lanes = 0),
            Tn |= h,
            e.lanes = h,
            e.memoizedState = Y
        }
    }
    function yf(e, t) {
        if (typeof e != "function")
            throw Error(u(191, e));
        e.call(t)
    }
    function vf(e, t) {
        var n = e.callbacks;
        if (n !== null)
            for (e.callbacks = null,
            e = 0; e < n.length; e++)
                yf(n[e], t)
    }
    var Cl = T(null)
      , Li = T(0);
    function bf(e, t) {
        e = sn,
        Z(Li, e),
        Z(Cl, t),
        sn = e | t.baseLanes
    }
    function Hr() {
        Z(Li, sn),
        Z(Cl, Cl.current)
    }
    function Br() {
        sn = Li.current,
        B(Cl),
        B(Li)
    }
    var pt = T(null)
      , At = null;
    function En(e) {
        var t = e.alternate;
        Z(Be, Be.current & 1),
        Z(pt, e),
        At === null && (t === null || Cl.current !== null || t.memoizedState !== null) && (At = e)
    }
    function qr(e) {
        Z(Be, Be.current),
        Z(pt, e),
        At === null && (At = e)
    }
    function xf(e) {
        e.tag === 22 ? (Z(Be, Be.current),
        Z(pt, e),
        At === null && (At = e)) : wn()
    }
    function wn() {
        Z(Be, Be.current),
        Z(pt, pt.current)
    }
    function yt(e) {
        B(pt),
        At === e && (At = null),
        B(Be)
    }
    var Be = T(0);
    function ji(e) {
        for (var t = e; t !== null; ) {
            if (t.tag === 13) {
                var n = t.memoizedState;
                if (n !== null && (n = n.dehydrated,
                n === null || Xu(n) || Zu(n)))
                    return t
            } else if (t.tag === 19 && (t.memoizedProps.revealOrder === "forwards" || t.memoizedProps.revealOrder === "backwards" || t.memoizedProps.revealOrder === "unstable_legacy-backwards" || t.memoizedProps.revealOrder === "together")) {
                if ((t.flags & 128) !== 0)
                    return t
            } else if (t.child !== null) {
                t.child.return = t,
                t = t.child;
                continue
            }
            if (t === e)
                break;
            for (; t.sibling === null; ) {
                if (t.return === null || t.return === e)
                    return null;
                t = t.return
            }
            t.sibling.return = t.return,
            t = t.sibling
        }
        return null
    }
    var Wt = 0
      , re = null
      , Ae = null
      , Ye = null
      , Di = !1
      , Tl = !1
      , Pn = !1
      , Mi = 0
      , ya = 0
      , Ol = null
      , Ty = 0;
    function ze() {
        throw Error(u(321))
    }
    function Gr(e, t) {
        if (t === null)
            return !1;
        for (var n = 0; n < t.length && n < e.length; n++)
            if (!mt(e[n], t[n]))
                return !1;
        return !0
    }
    function Yr(e, t, n, l, s, o) {
        return Wt = o,
        re = t,
        t.memoizedState = null,
        t.updateQueue = null,
        t.lanes = 0,
        z.H = e === null || e.memoizedState === null ? ld : nu,
        Pn = !1,
        o = n(l, s),
        Pn = !1,
        Tl && (o = Ef(t, n, l, s)),
        Sf(e),
        o
    }
    function Sf(e) {
        z.H = xa;
        var t = Ae !== null && Ae.next !== null;
        if (Wt = 0,
        Ye = Ae = re = null,
        Di = !1,
        ya = 0,
        Ol = null,
        t)
            throw Error(u(300));
        e === null || Ve || (e = e.dependencies,
        e !== null && _i(e) && (Ve = !0))
    }
    function Ef(e, t, n, l) {
        re = e;
        var s = 0;
        do {
            if (Tl && (Ol = null),
            ya = 0,
            Tl = !1,
            25 <= s)
                throw Error(u(301));
            if (s += 1,
            Ye = Ae = null,
            e.updateQueue != null) {
                var o = e.updateQueue;
                o.lastEffect = null,
                o.events = null,
                o.stores = null,
                o.memoCache != null && (o.memoCache.index = 0)
            }
            z.H = ad,
            o = t(n, l)
        } while (Tl);
        return o
    }
    function Oy() {
        var e = z.H
          , t = e.useState()[0];
        return t = typeof t.then == "function" ? va(t) : t,
        e = e.useState()[0],
        (Ae !== null ? Ae.memoizedState : null) !== e && (re.flags |= 1024),
        t
    }
    function Vr() {
        var e = Mi !== 0;
        return Mi = 0,
        e
    }
    function Qr(e, t, n) {
        t.updateQueue = e.updateQueue,
        t.flags &= -2053,
        e.lanes &= ~n
    }
    function kr(e) {
        if (Di) {
            for (e = e.memoizedState; e !== null; ) {
                var t = e.queue;
                t !== null && (t.pending = null),
                e = e.next
            }
            Di = !1
        }
        Wt = 0,
        Ye = Ae = re = null,
        Tl = !1,
        ya = Mi = 0,
        Ol = null
    }
    function lt() {
        var e = {
            memoizedState: null,
            baseState: null,
            baseQueue: null,
            queue: null,
            next: null
        };
        return Ye === null ? re.memoizedState = Ye = e : Ye = Ye.next = e,
        Ye
    }
    function qe() {
        if (Ae === null) {
            var e = re.alternate;
            e = e !== null ? e.memoizedState : null
        } else
            e = Ae.next;
        var t = Ye === null ? re.memoizedState : Ye.next;
        if (t !== null)
            Ye = t,
            Ae = e;
        else {
            if (e === null)
                throw re.alternate === null ? Error(u(467)) : Error(u(310));
            Ae = e,
            e = {
                memoizedState: Ae.memoizedState,
                baseState: Ae.baseState,
                baseQueue: Ae.baseQueue,
                queue: Ae.queue,
                next: null
            },
            Ye === null ? re.memoizedState = Ye = e : Ye = Ye.next = e
        }
        return Ye
    }
    function zi() {
        return {
            lastEffect: null,
            events: null,
            stores: null,
            memoCache: null
        }
    }
    function va(e) {
        var t = ya;
        return ya += 1,
        Ol === null && (Ol = []),
        e = df(Ol, e, t),
        t = re,
        (Ye === null ? t.memoizedState : Ye.next) === null && (t = t.alternate,
        z.H = t === null || t.memoizedState === null ? ld : nu),
        e
    }
    function Ui(e) {
        if (e !== null && typeof e == "object") {
            if (typeof e.then == "function")
                return va(e);
            if (e.$$typeof === V)
                return We(e)
        }
        throw Error(u(438, String(e)))
    }
    function Xr(e) {
        var t = null
          , n = re.updateQueue;
        if (n !== null && (t = n.memoCache),
        t == null) {
            var l = re.alternate;
            l !== null && (l = l.updateQueue,
            l !== null && (l = l.memoCache,
            l != null && (t = {
                data: l.data.map(function(s) {
                    return s.slice()
                }),
                index: 0
            })))
        }
        if (t == null && (t = {
            data: [],
            index: 0
        }),
        n === null && (n = zi(),
        re.updateQueue = n),
        n.memoCache = t,
        n = t.data[t.index],
        n === void 0)
            for (n = t.data[t.index] = Array(e),
            l = 0; l < e; l++)
                n[l] = Q;
        return t.index++,
        n
    }
    function Pt(e, t) {
        return typeof t == "function" ? t(e) : t
    }
    function Hi(e) {
        var t = qe();
        return Zr(t, Ae, e)
    }
    function Zr(e, t, n) {
        var l = e.queue;
        if (l === null)
            throw Error(u(311));
        l.lastRenderedReducer = n;
        var s = e.baseQueue
          , o = l.pending;
        if (o !== null) {
            if (s !== null) {
                var h = s.next;
                s.next = o.next,
                o.next = h
            }
            t.baseQueue = s = o,
            l.pending = null
        }
        if (o = e.baseState,
        s === null)
            e.memoizedState = o;
        else {
            t = s.next;
            var y = h = null
              , C = null
              , L = t
              , U = !1;
            do {
                var Y = L.lane & -536870913;
                if (Y !== L.lane ? (ge & Y) === Y : (Wt & Y) === Y) {
                    var j = L.revertLane;
                    if (j === 0)
                        C !== null && (C = C.next = {
                            lane: 0,
                            revertLane: 0,
                            gesture: null,
                            action: L.action,
                            hasEagerState: L.hasEagerState,
                            eagerState: L.eagerState,
                            next: null
                        }),
                        Y === Sl && (U = !0);
                    else if ((Wt & j) === j) {
                        L = L.next,
                        j === Sl && (U = !0);
                        continue
                    } else
                        Y = {
                            lane: 0,
                            revertLane: L.revertLane,
                            gesture: null,
                            action: L.action,
                            hasEagerState: L.hasEagerState,
                            eagerState: L.eagerState,
                            next: null
                        },
                        C === null ? (y = C = Y,
                        h = o) : C = C.next = Y,
                        re.lanes |= j,
                        Tn |= j;
                    Y = L.action,
                    Pn && n(o, Y),
                    o = L.hasEagerState ? L.eagerState : n(o, Y)
                } else
                    j = {
                        lane: Y,
                        revertLane: L.revertLane,
                        gesture: L.gesture,
                        action: L.action,
                        hasEagerState: L.hasEagerState,
                        eagerState: L.eagerState,
                        next: null
                    },
                    C === null ? (y = C = j,
                    h = o) : C = C.next = j,
                    re.lanes |= Y,
                    Tn |= Y;
                L = L.next
            } while (L !== null && L !== t);
            if (C === null ? h = o : C.next = y,
            !mt(o, e.memoizedState) && (Ve = !0,
            U && (n = El,
            n !== null)))
                throw n;
            e.memoizedState = o,
            e.baseState = h,
            e.baseQueue = C,
            l.lastRenderedState = o
        }
        return s === null && (l.lanes = 0),
        [e.memoizedState, l.dispatch]
    }
    function Kr(e) {
        var t = qe()
          , n = t.queue;
        if (n === null)
            throw Error(u(311));
        n.lastRenderedReducer = e;
        var l = n.dispatch
          , s = n.pending
          , o = t.memoizedState;
        if (s !== null) {
            n.pending = null;
            var h = s = s.next;
            do
                o = e(o, h.action),
                h = h.next;
            while (h !== s);
            mt(o, t.memoizedState) || (Ve = !0),
            t.memoizedState = o,
            t.baseQueue === null && (t.baseState = o),
            n.lastRenderedState = o
        }
        return [o, l]
    }
    function wf(e, t, n) {
        var l = re
          , s = qe()
          , o = ve;
        if (o) {
            if (n === void 0)
                throw Error(u(407));
            n = n()
        } else
            n = t();
        var h = !mt((Ae || s).memoizedState, n);
        if (h && (s.memoizedState = n,
        Ve = !0),
        s = s.queue,
        $r(Tf.bind(null, l, s, e), [e]),
        s.getSnapshot !== t || h || Ye !== null && Ye.memoizedState.tag & 1) {
            if (l.flags |= 2048,
            Al(9, {
                destroy: void 0
            }, Cf.bind(null, l, s, n, t), null),
            Le === null)
                throw Error(u(349));
            o || (Wt & 127) !== 0 || _f(l, t, n)
        }
        return n
    }
    function _f(e, t, n) {
        e.flags |= 16384,
        e = {
            getSnapshot: t,
            value: n
        },
        t = re.updateQueue,
        t === null ? (t = zi(),
        re.updateQueue = t,
        t.stores = [e]) : (n = t.stores,
        n === null ? t.stores = [e] : n.push(e))
    }
    function Cf(e, t, n, l) {
        t.value = n,
        t.getSnapshot = l,
        Of(t) && Af(e)
    }
    function Tf(e, t, n) {
        return n(function() {
            Of(t) && Af(e)
        })
    }
    function Of(e) {
        var t = e.getSnapshot;
        e = e.value;
        try {
            var n = t();
            return !mt(e, n)
        } catch {
            return !0
        }
    }
    function Af(e) {
        var t = Qn(e, 2);
        t !== null && ct(t, e, 2)
    }
    function Fr(e) {
        var t = lt();
        if (typeof e == "function") {
            var n = e;
            if (e = n(),
            Pn) {
                dn(!0);
                try {
                    n()
                } finally {
                    dn(!1)
                }
            }
        }
        return t.memoizedState = t.baseState = e,
        t.queue = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: Pt,
            lastRenderedState: e
        },
        t
    }
    function Nf(e, t, n, l) {
        return e.baseState = n,
        Zr(e, Ae, typeof l == "function" ? l : Pt)
    }
    function Ay(e, t, n, l, s) {
        if (Gi(e))
            throw Error(u(485));
        if (e = t.action,
        e !== null) {
            var o = {
                payload: s,
                action: e,
                next: null,
                isTransition: !0,
                status: "pending",
                value: null,
                reason: null,
                listeners: [],
                then: function(h) {
                    o.listeners.push(h)
                }
            };
            z.T !== null ? n(!0) : o.isTransition = !1,
            l(o),
            n = t.pending,
            n === null ? (o.next = t.pending = o,
            Rf(t, o)) : (o.next = n.next,
            t.pending = n.next = o)
        }
    }
    function Rf(e, t) {
        var n = t.action
          , l = t.payload
          , s = e.state;
        if (t.isTransition) {
            var o = z.T
              , h = {};
            z.T = h;
            try {
                var y = n(s, l)
                  , C = z.S;
                C !== null && C(h, y),
                Lf(e, t, y)
            } catch (L) {
                Jr(e, t, L)
            } finally {
                o !== null && h.types !== null && (o.types = h.types),
                z.T = o
            }
        } else
            try {
                o = n(s, l),
                Lf(e, t, o)
            } catch (L) {
                Jr(e, t, L)
            }
    }
    function Lf(e, t, n) {
        n !== null && typeof n == "object" && typeof n.then == "function" ? n.then(function(l) {
            jf(e, t, l)
        }, function(l) {
            return Jr(e, t, l)
        }) : jf(e, t, n)
    }
    function jf(e, t, n) {
        t.status = "fulfilled",
        t.value = n,
        Df(t),
        e.state = n,
        t = e.pending,
        t !== null && (n = t.next,
        n === t ? e.pending = null : (n = n.next,
        t.next = n,
        Rf(e, n)))
    }
    function Jr(e, t, n) {
        var l = e.pending;
        if (e.pending = null,
        l !== null) {
            l = l.next;
            do
                t.status = "rejected",
                t.reason = n,
                Df(t),
                t = t.next;
            while (t !== l)
        }
        e.action = null
    }
    function Df(e) {
        e = e.listeners;
        for (var t = 0; t < e.length; t++)
            (0,
            e[t])()
    }
    function Mf(e, t) {
        return t
    }
    function zf(e, t) {
        if (ve) {
            var n = Le.formState;
            if (n !== null) {
                e: {
                    var l = re;
                    if (ve) {
                        if (je) {
                            t: {
                                for (var s = je, o = Ot; s.nodeType !== 8; ) {
                                    if (!o) {
                                        s = null;
                                        break t
                                    }
                                    if (s = Nt(s.nextSibling),
                                    s === null) {
                                        s = null;
                                        break t
                                    }
                                }
                                o = s.data,
                                s = o === "F!" || o === "F" ? s : null
                            }
                            if (s) {
                                je = Nt(s.nextSibling),
                                l = s.data === "F!";
                                break e
                            }
                        }
                        yn(l)
                    }
                    l = !1
                }
                l && (t = n[0])
            }
        }
        return n = lt(),
        n.memoizedState = n.baseState = t,
        l = {
            pending: null,
            lanes: 0,
            dispatch: null,
            lastRenderedReducer: Mf,
            lastRenderedState: t
        },
        n.queue = l,
        n = ed.bind(null, re, l),
        l.dispatch = n,
        l = Fr(!1),
        o = tu.bind(null, re, !1, l.queue),
        l = lt(),
        s = {
            state: t,
            dispatch: null,
            action: e,
            pending: null
        },
        l.queue = s,
        n = Ay.bind(null, re, s, o, n),
        s.dispatch = n,
        l.memoizedState = e,
        [t, n, !1]
    }
    function Uf(e) {
        var t = qe();
        return Hf(t, Ae, e)
    }
    function Hf(e, t, n) {
        if (t = Zr(e, t, Mf)[0],
        e = Hi(Pt)[0],
        typeof t == "object" && t !== null && typeof t.then == "function")
            try {
                var l = va(t)
            } catch (h) {
                throw h === wl ? Oi : h
            }
        else
            l = t;
        t = qe();
        var s = t.queue
          , o = s.dispatch;
        return n !== t.memoizedState && (re.flags |= 2048,
        Al(9, {
            destroy: void 0
        }, Ny.bind(null, s, n), null)),
        [l, o, e]
    }
    function Ny(e, t) {
        e.action = t
    }
    function Bf(e) {
        var t = qe()
          , n = Ae;
        if (n !== null)
            return Hf(t, n, e);
        qe(),
        t = t.memoizedState,
        n = qe();
        var l = n.queue.dispatch;
        return n.memoizedState = e,
        [t, l, !1]
    }
    function Al(e, t, n, l) {
        return e = {
            tag: e,
            create: n,
            deps: l,
            inst: t,
            next: null
        },
        t = re.updateQueue,
        t === null && (t = zi(),
        re.updateQueue = t),
        n = t.lastEffect,
        n === null ? t.lastEffect = e.next = e : (l = n.next,
        n.next = e,
        e.next = l,
        t.lastEffect = e),
        e
    }
    function qf() {
        return qe().memoizedState
    }
    function Bi(e, t, n, l) {
        var s = lt();
        re.flags |= e,
        s.memoizedState = Al(1 | t, {
            destroy: void 0
        }, n, l === void 0 ? null : l)
    }
    function qi(e, t, n, l) {
        var s = qe();
        l = l === void 0 ? null : l;
        var o = s.memoizedState.inst;
        Ae !== null && l !== null && Gr(l, Ae.memoizedState.deps) ? s.memoizedState = Al(t, o, n, l) : (re.flags |= e,
        s.memoizedState = Al(1 | t, o, n, l))
    }
    function Gf(e, t) {
        Bi(8390656, 8, e, t)
    }
    function $r(e, t) {
        qi(2048, 8, e, t)
    }
    function Ry(e) {
        re.flags |= 4;
        var t = re.updateQueue;
        if (t === null)
            t = zi(),
            re.updateQueue = t,
            t.events = [e];
        else {
            var n = t.events;
            n === null ? t.events = [e] : n.push(e)
        }
    }
    function Yf(e) {
        var t = qe().memoizedState;
        return Ry({
            ref: t,
            nextImpl: e
        }),
        function() {
            if ((Ee & 2) !== 0)
                throw Error(u(440));
            return t.impl.apply(void 0, arguments)
        }
    }
    function Vf(e, t) {
        return qi(4, 2, e, t)
    }
    function Qf(e, t) {
        return qi(4, 4, e, t)
    }
    function kf(e, t) {
        if (typeof t == "function") {
            e = e();
            var n = t(e);
            return function() {
                typeof n == "function" ? n() : t(null)
            }
        }
        if (t != null)
            return e = e(),
            t.current = e,
            function() {
                t.current = null
            }
    }
    function Xf(e, t, n) {
        n = n != null ? n.concat([e]) : null,
        qi(4, 4, kf.bind(null, t, e), n)
    }
    function Wr() {}
    function Zf(e, t) {
        var n = qe();
        t = t === void 0 ? null : t;
        var l = n.memoizedState;
        return t !== null && Gr(t, l[1]) ? l[0] : (n.memoizedState = [e, t],
        e)
    }
    function Kf(e, t) {
        var n = qe();
        t = t === void 0 ? null : t;
        var l = n.memoizedState;
        if (t !== null && Gr(t, l[1]))
            return l[0];
        if (l = e(),
        Pn) {
            dn(!0);
            try {
                e()
            } finally {
                dn(!1)
            }
        }
        return n.memoizedState = [l, t],
        l
    }
    function Pr(e, t, n) {
        return n === void 0 || (Wt & 1073741824) !== 0 && (ge & 261930) === 0 ? e.memoizedState = t : (e.memoizedState = n,
        e = Fd(),
        re.lanes |= e,
        Tn |= e,
        n)
    }
    function Ff(e, t, n, l) {
        return mt(n, t) ? n : Cl.current !== null ? (e = Pr(e, n, l),
        mt(e, t) || (Ve = !0),
        e) : (Wt & 42) === 0 || (Wt & 1073741824) !== 0 && (ge & 261930) === 0 ? (Ve = !0,
        e.memoizedState = n) : (e = Fd(),
        re.lanes |= e,
        Tn |= e,
        t)
    }
    function Jf(e, t, n, l, s) {
        var o = k.p;
        k.p = o !== 0 && 8 > o ? o : 8;
        var h = z.T
          , y = {};
        z.T = y,
        tu(e, !1, t, n);
        try {
            var C = s()
              , L = z.S;
            if (L !== null && L(y, C),
            C !== null && typeof C == "object" && typeof C.then == "function") {
                var U = Cy(C, l);
                ba(e, t, U, xt(e))
            } else
                ba(e, t, l, xt(e))
        } catch (Y) {
            ba(e, t, {
                then: function() {},
                status: "rejected",
                reason: Y
            }, xt())
        } finally {
            k.p = o,
            h !== null && y.types !== null && (h.types = y.types),
            z.T = h
        }
    }
    function Ly() {}
    function Ir(e, t, n, l) {
        if (e.tag !== 5)
            throw Error(u(476));
        var s = $f(e).queue;
        Jf(e, s, t, te, n === null ? Ly : function() {
            return Wf(e),
            n(l)
        }
        )
    }
    function $f(e) {
        var t = e.memoizedState;
        if (t !== null)
            return t;
        t = {
            memoizedState: te,
            baseState: te,
            baseQueue: null,
            queue: {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: Pt,
                lastRenderedState: te
            },
            next: null
        };
        var n = {};
        return t.next = {
            memoizedState: n,
            baseState: n,
            baseQueue: null,
            queue: {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: Pt,
                lastRenderedState: n
            },
            next: null
        },
        e.memoizedState = t,
        e = e.alternate,
        e !== null && (e.memoizedState = t),
        t
    }
    function Wf(e) {
        var t = $f(e);
        t.next === null && (t = e.alternate.memoizedState),
        ba(e, t.next.queue, {}, xt())
    }
    function eu() {
        return We(Ua)
    }
    function Pf() {
        return qe().memoizedState
    }
    function If() {
        return qe().memoizedState
    }
    function jy(e) {
        for (var t = e.return; t !== null; ) {
            switch (t.tag) {
            case 24:
            case 3:
                var n = xt();
                e = xn(n);
                var l = Sn(t, e, n);
                l !== null && (ct(l, t, n),
                ma(l, t, n)),
                t = {
                    cache: Nr()
                },
                e.payload = t;
                return
            }
            t = t.return
        }
    }
    function Dy(e, t, n) {
        var l = xt();
        n = {
            lane: l,
            revertLane: 0,
            gesture: null,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        },
        Gi(e) ? td(t, n) : (n = vr(e, t, n, l),
        n !== null && (ct(n, e, l),
        nd(n, t, l)))
    }
    function ed(e, t, n) {
        var l = xt();
        ba(e, t, n, l)
    }
    function ba(e, t, n, l) {
        var s = {
            lane: l,
            revertLane: 0,
            gesture: null,
            action: n,
            hasEagerState: !1,
            eagerState: null,
            next: null
        };
        if (Gi(e))
            td(t, s);
        else {
            var o = e.alternate;
            if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer,
            o !== null))
                try {
                    var h = t.lastRenderedState
                      , y = o(h, n);
                    if (s.hasEagerState = !0,
                    s.eagerState = y,
                    mt(y, h))
                        return xi(e, t, s, 0),
                        Le === null && bi(),
                        !1
                } catch {}
            if (n = vr(e, t, s, l),
            n !== null)
                return ct(n, e, l),
                nd(n, t, l),
                !0
        }
        return !1
    }
    function tu(e, t, n, l) {
        if (l = {
            lane: 2,
            revertLane: Du(),
            gesture: null,
            action: l,
            hasEagerState: !1,
            eagerState: null,
            next: null
        },
        Gi(e)) {
            if (t)
                throw Error(u(479))
        } else
            t = vr(e, n, l, 2),
            t !== null && ct(t, e, 2)
    }
    function Gi(e) {
        var t = e.alternate;
        return e === re || t !== null && t === re
    }
    function td(e, t) {
        Tl = Di = !0;
        var n = e.pending;
        n === null ? t.next = t : (t.next = n.next,
        n.next = t),
        e.pending = t
    }
    function nd(e, t, n) {
        if ((n & 4194048) !== 0) {
            var l = t.lanes;
            l &= e.pendingLanes,
            n |= l,
            t.lanes = n,
            sc(e, n)
        }
    }
    var xa = {
        readContext: We,
        use: Ui,
        useCallback: ze,
        useContext: ze,
        useEffect: ze,
        useImperativeHandle: ze,
        useLayoutEffect: ze,
        useInsertionEffect: ze,
        useMemo: ze,
        useReducer: ze,
        useRef: ze,
        useState: ze,
        useDebugValue: ze,
        useDeferredValue: ze,
        useTransition: ze,
        useSyncExternalStore: ze,
        useId: ze,
        useHostTransitionStatus: ze,
        useFormState: ze,
        useActionState: ze,
        useOptimistic: ze,
        useMemoCache: ze,
        useCacheRefresh: ze
    };
    xa.useEffectEvent = ze;
    var ld = {
        readContext: We,
        use: Ui,
        useCallback: function(e, t) {
            return lt().memoizedState = [e, t === void 0 ? null : t],
            e
        },
        useContext: We,
        useEffect: Gf,
        useImperativeHandle: function(e, t, n) {
            n = n != null ? n.concat([e]) : null,
            Bi(4194308, 4, kf.bind(null, t, e), n)
        },
        useLayoutEffect: function(e, t) {
            return Bi(4194308, 4, e, t)
        },
        useInsertionEffect: function(e, t) {
            Bi(4, 2, e, t)
        },
        useMemo: function(e, t) {
            var n = lt();
            t = t === void 0 ? null : t;
            var l = e();
            if (Pn) {
                dn(!0);
                try {
                    e()
                } finally {
                    dn(!1)
                }
            }
            return n.memoizedState = [l, t],
            l
        },
        useReducer: function(e, t, n) {
            var l = lt();
            if (n !== void 0) {
                var s = n(t);
                if (Pn) {
                    dn(!0);
                    try {
                        n(t)
                    } finally {
                        dn(!1)
                    }
                }
            } else
                s = t;
            return l.memoizedState = l.baseState = s,
            e = {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: e,
                lastRenderedState: s
            },
            l.queue = e,
            e = e.dispatch = Dy.bind(null, re, e),
            [l.memoizedState, e]
        },
        useRef: function(e) {
            var t = lt();
            return e = {
                current: e
            },
            t.memoizedState = e
        },
        useState: function(e) {
            e = Fr(e);
            var t = e.queue
              , n = ed.bind(null, re, t);
            return t.dispatch = n,
            [e.memoizedState, n]
        },
        useDebugValue: Wr,
        useDeferredValue: function(e, t) {
            var n = lt();
            return Pr(n, e, t)
        },
        useTransition: function() {
            var e = Fr(!1);
            return e = Jf.bind(null, re, e.queue, !0, !1),
            lt().memoizedState = e,
            [!1, e]
        },
        useSyncExternalStore: function(e, t, n) {
            var l = re
              , s = lt();
            if (ve) {
                if (n === void 0)
                    throw Error(u(407));
                n = n()
            } else {
                if (n = t(),
                Le === null)
                    throw Error(u(349));
                (ge & 127) !== 0 || _f(l, t, n)
            }
            s.memoizedState = n;
            var o = {
                value: n,
                getSnapshot: t
            };
            return s.queue = o,
            Gf(Tf.bind(null, l, o, e), [e]),
            l.flags |= 2048,
            Al(9, {
                destroy: void 0
            }, Cf.bind(null, l, o, n, t), null),
            n
        },
        useId: function() {
            var e = lt()
              , t = Le.identifierPrefix;
            if (ve) {
                var n = Ht
                  , l = Ut;
                n = (l & ~(1 << 32 - ht(l) - 1)).toString(32) + n,
                t = "_" + t + "R_" + n,
                n = Mi++,
                0 < n && (t += "H" + n.toString(32)),
                t += "_"
            } else
                n = Ty++,
                t = "_" + t + "r_" + n.toString(32) + "_";
            return e.memoizedState = t
        },
        useHostTransitionStatus: eu,
        useFormState: zf,
        useActionState: zf,
        useOptimistic: function(e) {
            var t = lt();
            t.memoizedState = t.baseState = e;
            var n = {
                pending: null,
                lanes: 0,
                dispatch: null,
                lastRenderedReducer: null,
                lastRenderedState: null
            };
            return t.queue = n,
            t = tu.bind(null, re, !0, n),
            n.dispatch = t,
            [e, t]
        },
        useMemoCache: Xr,
        useCacheRefresh: function() {
            return lt().memoizedState = jy.bind(null, re)
        },
        useEffectEvent: function(e) {
            var t = lt()
              , n = {
                impl: e
            };
            return t.memoizedState = n,
            function() {
                if ((Ee & 2) !== 0)
                    throw Error(u(440));
                return n.impl.apply(void 0, arguments)
            }
        }
    }
      , nu = {
        readContext: We,
        use: Ui,
        useCallback: Zf,
        useContext: We,
        useEffect: $r,
        useImperativeHandle: Xf,
        useInsertionEffect: Vf,
        useLayoutEffect: Qf,
        useMemo: Kf,
        useReducer: Hi,
        useRef: qf,
        useState: function() {
            return Hi(Pt)
        },
        useDebugValue: Wr,
        useDeferredValue: function(e, t) {
            var n = qe();
            return Ff(n, Ae.memoizedState, e, t)
        },
        useTransition: function() {
            var e = Hi(Pt)[0]
              , t = qe().memoizedState;
            return [typeof e == "boolean" ? e : va(e), t]
        },
        useSyncExternalStore: wf,
        useId: Pf,
        useHostTransitionStatus: eu,
        useFormState: Uf,
        useActionState: Uf,
        useOptimistic: function(e, t) {
            var n = qe();
            return Nf(n, Ae, e, t)
        },
        useMemoCache: Xr,
        useCacheRefresh: If
    };
    nu.useEffectEvent = Yf;
    var ad = {
        readContext: We,
        use: Ui,
        useCallback: Zf,
        useContext: We,
        useEffect: $r,
        useImperativeHandle: Xf,
        useInsertionEffect: Vf,
        useLayoutEffect: Qf,
        useMemo: Kf,
        useReducer: Kr,
        useRef: qf,
        useState: function() {
            return Kr(Pt)
        },
        useDebugValue: Wr,
        useDeferredValue: function(e, t) {
            var n = qe();
            return Ae === null ? Pr(n, e, t) : Ff(n, Ae.memoizedState, e, t)
        },
        useTransition: function() {
            var e = Kr(Pt)[0]
              , t = qe().memoizedState;
            return [typeof e == "boolean" ? e : va(e), t]
        },
        useSyncExternalStore: wf,
        useId: Pf,
        useHostTransitionStatus: eu,
        useFormState: Bf,
        useActionState: Bf,
        useOptimistic: function(e, t) {
            var n = qe();
            return Ae !== null ? Nf(n, Ae, e, t) : (n.baseState = e,
            [e, n.queue.dispatch])
        },
        useMemoCache: Xr,
        useCacheRefresh: If
    };
    ad.useEffectEvent = Yf;
    function lu(e, t, n, l) {
        t = e.memoizedState,
        n = n(l, t),
        n = n == null ? t : v({}, t, n),
        e.memoizedState = n,
        e.lanes === 0 && (e.updateQueue.baseState = n)
    }
    var au = {
        enqueueSetState: function(e, t, n) {
            e = e._reactInternals;
            var l = xt()
              , s = xn(l);
            s.payload = t,
            n != null && (s.callback = n),
            t = Sn(e, s, l),
            t !== null && (ct(t, e, l),
            ma(t, e, l))
        },
        enqueueReplaceState: function(e, t, n) {
            e = e._reactInternals;
            var l = xt()
              , s = xn(l);
            s.tag = 1,
            s.payload = t,
            n != null && (s.callback = n),
            t = Sn(e, s, l),
            t !== null && (ct(t, e, l),
            ma(t, e, l))
        },
        enqueueForceUpdate: function(e, t) {
            e = e._reactInternals;
            var n = xt()
              , l = xn(n);
            l.tag = 2,
            t != null && (l.callback = t),
            t = Sn(e, l, n),
            t !== null && (ct(t, e, n),
            ma(t, e, n))
        }
    };
    function id(e, t, n, l, s, o, h) {
        return e = e.stateNode,
        typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(l, o, h) : t.prototype && t.prototype.isPureReactComponent ? !sa(n, l) || !sa(s, o) : !0
    }
    function sd(e, t, n, l) {
        e = t.state,
        typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, l),
        typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, l),
        t.state !== e && au.enqueueReplaceState(t, t.state, null)
    }
    function In(e, t) {
        var n = t;
        if ("ref"in t) {
            n = {};
            for (var l in t)
                l !== "ref" && (n[l] = t[l])
        }
        if (e = e.defaultProps) {
            n === t && (n = v({}, n));
            for (var s in e)
                n[s] === void 0 && (n[s] = e[s])
        }
        return n
    }
    function rd(e) {
        vi(e)
    }
    function ud(e) {
        console.error(e)
    }
    function od(e) {
        vi(e)
    }
    function Yi(e, t) {
        try {
            var n = e.onUncaughtError;
            n(t.value, {
                componentStack: t.stack
            })
        } catch (l) {
            setTimeout(function() {
                throw l
            })
        }
    }
    function cd(e, t, n) {
        try {
            var l = e.onCaughtError;
            l(n.value, {
                componentStack: n.stack,
                errorBoundary: t.tag === 1 ? t.stateNode : null
            })
        } catch (s) {
            setTimeout(function() {
                throw s
            })
        }
    }
    function iu(e, t, n) {
        return n = xn(n),
        n.tag = 3,
        n.payload = {
            element: null
        },
        n.callback = function() {
            Yi(e, t)
        }
        ,
        n
    }
    function fd(e) {
        return e = xn(e),
        e.tag = 3,
        e
    }
    function dd(e, t, n, l) {
        var s = n.type.getDerivedStateFromError;
        if (typeof s == "function") {
            var o = l.value;
            e.payload = function() {
                return s(o)
            }
            ,
            e.callback = function() {
                cd(t, n, l)
            }
        }
        var h = n.stateNode;
        h !== null && typeof h.componentDidCatch == "function" && (e.callback = function() {
            cd(t, n, l),
            typeof s != "function" && (On === null ? On = new Set([this]) : On.add(this));
            var y = l.stack;
            this.componentDidCatch(l.value, {
                componentStack: y !== null ? y : ""
            })
        }
        )
    }
    function My(e, t, n, l, s) {
        if (n.flags |= 32768,
        l !== null && typeof l == "object" && typeof l.then == "function") {
            if (t = n.alternate,
            t !== null && xl(t, n, s, !0),
            n = pt.current,
            n !== null) {
                switch (n.tag) {
                case 31:
                case 13:
                    return At === null ? Ii() : n.alternate === null && Ue === 0 && (Ue = 3),
                    n.flags &= -257,
                    n.flags |= 65536,
                    n.lanes = s,
                    l === Ai ? n.flags |= 16384 : (t = n.updateQueue,
                    t === null ? n.updateQueue = new Set([l]) : t.add(l),
                    Ru(e, l, s)),
                    !1;
                case 22:
                    return n.flags |= 65536,
                    l === Ai ? n.flags |= 16384 : (t = n.updateQueue,
                    t === null ? (t = {
                        transitions: null,
                        markerInstances: null,
                        retryQueue: new Set([l])
                    },
                    n.updateQueue = t) : (n = t.retryQueue,
                    n === null ? t.retryQueue = new Set([l]) : n.add(l)),
                    Ru(e, l, s)),
                    !1
                }
                throw Error(u(435, n.tag))
            }
            return Ru(e, l, s),
            Ii(),
            !1
        }
        if (ve)
            return t = pt.current,
            t !== null ? ((t.flags & 65536) === 0 && (t.flags |= 256),
            t.flags |= 65536,
            t.lanes = s,
            l !== _r && (e = Error(u(422), {
                cause: l
            }),
            oa(_t(e, n)))) : (l !== _r && (t = Error(u(423), {
                cause: l
            }),
            oa(_t(t, n))),
            e = e.current.alternate,
            e.flags |= 65536,
            s &= -s,
            e.lanes |= s,
            l = _t(l, n),
            s = iu(e.stateNode, l, s),
            zr(e, s),
            Ue !== 4 && (Ue = 2)),
            !1;
        var o = Error(u(520), {
            cause: l
        });
        if (o = _t(o, n),
        Aa === null ? Aa = [o] : Aa.push(o),
        Ue !== 4 && (Ue = 2),
        t === null)
            return !0;
        l = _t(l, n),
        n = t;
        do {
            switch (n.tag) {
            case 3:
                return n.flags |= 65536,
                e = s & -s,
                n.lanes |= e,
                e = iu(n.stateNode, l, e),
                zr(n, e),
                !1;
            case 1:
                if (t = n.type,
                o = n.stateNode,
                (n.flags & 128) === 0 && (typeof t.getDerivedStateFromError == "function" || o !== null && typeof o.componentDidCatch == "function" && (On === null || !On.has(o))))
                    return n.flags |= 65536,
                    s &= -s,
                    n.lanes |= s,
                    s = fd(s),
                    dd(s, e, n, l),
                    zr(n, s),
                    !1
            }
            n = n.return
        } while (n !== null);
        return !1
    }
    var su = Error(u(461))
      , Ve = !1;
    function Pe(e, t, n, l) {
        t.child = e === null ? pf(t, null, n, l) : Wn(t, e.child, n, l)
    }
    function hd(e, t, n, l, s) {
        n = n.render;
        var o = t.ref;
        if ("ref"in l) {
            var h = {};
            for (var y in l)
                y !== "ref" && (h[y] = l[y])
        } else
            h = l;
        return Kn(t),
        l = Yr(e, t, n, h, o, s),
        y = Vr(),
        e !== null && !Ve ? (Qr(e, t, s),
        It(e, t, s)) : (ve && y && Er(t),
        t.flags |= 1,
        Pe(e, t, l, s),
        t.child)
    }
    function md(e, t, n, l, s) {
        if (e === null) {
            var o = n.type;
            return typeof o == "function" && !br(o) && o.defaultProps === void 0 && n.compare === null ? (t.tag = 15,
            t.type = o,
            gd(e, t, o, l, s)) : (e = Ei(n.type, null, l, t, t.mode, s),
            e.ref = t.ref,
            e.return = t,
            t.child = e)
        }
        if (o = e.child,
        !mu(e, s)) {
            var h = o.memoizedProps;
            if (n = n.compare,
            n = n !== null ? n : sa,
            n(h, l) && e.ref === t.ref)
                return It(e, t, s)
        }
        return t.flags |= 1,
        e = Kt(o, l),
        e.ref = t.ref,
        e.return = t,
        t.child = e
    }
    function gd(e, t, n, l, s) {
        if (e !== null) {
            var o = e.memoizedProps;
            if (sa(o, l) && e.ref === t.ref)
                if (Ve = !1,
                t.pendingProps = l = o,
                mu(e, s))
                    (e.flags & 131072) !== 0 && (Ve = !0);
                else
                    return t.lanes = e.lanes,
                    It(e, t, s)
        }
        return ru(e, t, n, l, s)
    }
    function pd(e, t, n, l) {
        var s = l.children
          , o = e !== null ? e.memoizedState : null;
        if (e === null && t.stateNode === null && (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null
        }),
        l.mode === "hidden") {
            if ((t.flags & 128) !== 0) {
                if (o = o !== null ? o.baseLanes | n : n,
                e !== null) {
                    for (l = t.child = e.child,
                    s = 0; l !== null; )
                        s = s | l.lanes | l.childLanes,
                        l = l.sibling;
                    l = s & ~o
                } else
                    l = 0,
                    t.child = null;
                return yd(e, t, o, n, l)
            }
            if ((n & 536870912) !== 0)
                t.memoizedState = {
                    baseLanes: 0,
                    cachePool: null
                },
                e !== null && Ti(t, o !== null ? o.cachePool : null),
                o !== null ? bf(t, o) : Hr(),
                xf(t);
            else
                return l = t.lanes = 536870912,
                yd(e, t, o !== null ? o.baseLanes | n : n, n, l)
        } else
            o !== null ? (Ti(t, o.cachePool),
            bf(t, o),
            wn(),
            t.memoizedState = null) : (e !== null && Ti(t, null),
            Hr(),
            wn());
        return Pe(e, t, s, n),
        t.child
    }
    function Sa(e, t) {
        return e !== null && e.tag === 22 || t.stateNode !== null || (t.stateNode = {
            _visibility: 1,
            _pendingMarkers: null,
            _retryCache: null,
            _transitions: null
        }),
        t.sibling
    }
    function yd(e, t, n, l, s) {
        var o = Lr();
        return o = o === null ? null : {
            parent: Ge._currentValue,
            pool: o
        },
        t.memoizedState = {
            baseLanes: n,
            cachePool: o
        },
        e !== null && Ti(t, null),
        Hr(),
        xf(t),
        e !== null && xl(e, t, l, !0),
        t.childLanes = s,
        null
    }
    function Vi(e, t) {
        return t = ki({
            mode: t.mode,
            children: t.children
        }, e.mode),
        t.ref = e.ref,
        e.child = t,
        t.return = e,
        t
    }
    function vd(e, t, n) {
        return Wn(t, e.child, null, n),
        e = Vi(t, t.pendingProps),
        e.flags |= 2,
        yt(t),
        t.memoizedState = null,
        e
    }
    function zy(e, t, n) {
        var l = t.pendingProps
          , s = (t.flags & 128) !== 0;
        if (t.flags &= -129,
        e === null) {
            if (ve) {
                if (l.mode === "hidden")
                    return e = Vi(t, l),
                    t.lanes = 536870912,
                    Sa(null, e);
                if (qr(t),
                (e = je) ? (e = Rh(e, Ot),
                e = e !== null && e.data === "&" ? e : null,
                e !== null && (t.memoizedState = {
                    dehydrated: e,
                    treeContext: gn !== null ? {
                        id: Ut,
                        overflow: Ht
                    } : null,
                    retryLane: 536870912,
                    hydrationErrors: null
                },
                n = ef(e),
                n.return = t,
                t.child = n,
                $e = t,
                je = null)) : e = null,
                e === null)
                    throw yn(t);
                return t.lanes = 536870912,
                null
            }
            return Vi(t, l)
        }
        var o = e.memoizedState;
        if (o !== null) {
            var h = o.dehydrated;
            if (qr(t),
            s)
                if (t.flags & 256)
                    t.flags &= -257,
                    t = vd(e, t, n);
                else if (t.memoizedState !== null)
                    t.child = e.child,
                    t.flags |= 128,
                    t = null;
                else
                    throw Error(u(558));
            else if (Ve || xl(e, t, n, !1),
            s = (n & e.childLanes) !== 0,
            Ve || s) {
                if (l = Le,
                l !== null && (h = rc(l, n),
                h !== 0 && h !== o.retryLane))
                    throw o.retryLane = h,
                    Qn(e, h),
                    ct(l, e, h),
                    su;
                Ii(),
                t = vd(e, t, n)
            } else
                e = o.treeContext,
                je = Nt(h.nextSibling),
                $e = t,
                ve = !0,
                pn = null,
                Ot = !1,
                e !== null && lf(t, e),
                t = Vi(t, l),
                t.flags |= 4096;
            return t
        }
        return e = Kt(e.child, {
            mode: l.mode,
            children: l.children
        }),
        e.ref = t.ref,
        t.child = e,
        e.return = t,
        e
    }
    function Qi(e, t) {
        var n = t.ref;
        if (n === null)
            e !== null && e.ref !== null && (t.flags |= 4194816);
        else {
            if (typeof n != "function" && typeof n != "object")
                throw Error(u(284));
            (e === null || e.ref !== n) && (t.flags |= 4194816)
        }
    }
    function ru(e, t, n, l, s) {
        return Kn(t),
        n = Yr(e, t, n, l, void 0, s),
        l = Vr(),
        e !== null && !Ve ? (Qr(e, t, s),
        It(e, t, s)) : (ve && l && Er(t),
        t.flags |= 1,
        Pe(e, t, n, s),
        t.child)
    }
    function bd(e, t, n, l, s, o) {
        return Kn(t),
        t.updateQueue = null,
        n = Ef(t, l, n, s),
        Sf(e),
        l = Vr(),
        e !== null && !Ve ? (Qr(e, t, o),
        It(e, t, o)) : (ve && l && Er(t),
        t.flags |= 1,
        Pe(e, t, n, o),
        t.child)
    }
    function xd(e, t, n, l, s) {
        if (Kn(t),
        t.stateNode === null) {
            var o = pl
              , h = n.contextType;
            typeof h == "object" && h !== null && (o = We(h)),
            o = new n(l,o),
            t.memoizedState = o.state !== null && o.state !== void 0 ? o.state : null,
            o.updater = au,
            t.stateNode = o,
            o._reactInternals = t,
            o = t.stateNode,
            o.props = l,
            o.state = t.memoizedState,
            o.refs = {},
            Dr(t),
            h = n.contextType,
            o.context = typeof h == "object" && h !== null ? We(h) : pl,
            o.state = t.memoizedState,
            h = n.getDerivedStateFromProps,
            typeof h == "function" && (lu(t, n, h, l),
            o.state = t.memoizedState),
            typeof n.getDerivedStateFromProps == "function" || typeof o.getSnapshotBeforeUpdate == "function" || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (h = o.state,
            typeof o.componentWillMount == "function" && o.componentWillMount(),
            typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount(),
            h !== o.state && au.enqueueReplaceState(o, o.state, null),
            pa(t, l, o, s),
            ga(),
            o.state = t.memoizedState),
            typeof o.componentDidMount == "function" && (t.flags |= 4194308),
            l = !0
        } else if (e === null) {
            o = t.stateNode;
            var y = t.memoizedProps
              , C = In(n, y);
            o.props = C;
            var L = o.context
              , U = n.contextType;
            h = pl,
            typeof U == "object" && U !== null && (h = We(U));
            var Y = n.getDerivedStateFromProps;
            U = typeof Y == "function" || typeof o.getSnapshotBeforeUpdate == "function",
            y = t.pendingProps !== y,
            U || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (y || L !== h) && sd(t, o, l, h),
            bn = !1;
            var j = t.memoizedState;
            o.state = j,
            pa(t, l, o, s),
            ga(),
            L = t.memoizedState,
            y || j !== L || bn ? (typeof Y == "function" && (lu(t, n, Y, l),
            L = t.memoizedState),
            (C = bn || id(t, n, C, l, j, L, h)) ? (U || typeof o.UNSAFE_componentWillMount != "function" && typeof o.componentWillMount != "function" || (typeof o.componentWillMount == "function" && o.componentWillMount(),
            typeof o.UNSAFE_componentWillMount == "function" && o.UNSAFE_componentWillMount()),
            typeof o.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308),
            t.memoizedProps = l,
            t.memoizedState = L),
            o.props = l,
            o.state = L,
            o.context = h,
            l = C) : (typeof o.componentDidMount == "function" && (t.flags |= 4194308),
            l = !1)
        } else {
            o = t.stateNode,
            Mr(e, t),
            h = t.memoizedProps,
            U = In(n, h),
            o.props = U,
            Y = t.pendingProps,
            j = o.context,
            L = n.contextType,
            C = pl,
            typeof L == "object" && L !== null && (C = We(L)),
            y = n.getDerivedStateFromProps,
            (L = typeof y == "function" || typeof o.getSnapshotBeforeUpdate == "function") || typeof o.UNSAFE_componentWillReceiveProps != "function" && typeof o.componentWillReceiveProps != "function" || (h !== Y || j !== C) && sd(t, o, l, C),
            bn = !1,
            j = t.memoizedState,
            o.state = j,
            pa(t, l, o, s),
            ga();
            var M = t.memoizedState;
            h !== Y || j !== M || bn || e !== null && e.dependencies !== null && _i(e.dependencies) ? (typeof y == "function" && (lu(t, n, y, l),
            M = t.memoizedState),
            (U = bn || id(t, n, U, l, j, M, C) || e !== null && e.dependencies !== null && _i(e.dependencies)) ? (L || typeof o.UNSAFE_componentWillUpdate != "function" && typeof o.componentWillUpdate != "function" || (typeof o.componentWillUpdate == "function" && o.componentWillUpdate(l, M, C),
            typeof o.UNSAFE_componentWillUpdate == "function" && o.UNSAFE_componentWillUpdate(l, M, C)),
            typeof o.componentDidUpdate == "function" && (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof o.componentDidUpdate != "function" || h === e.memoizedProps && j === e.memoizedState || (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && j === e.memoizedState || (t.flags |= 1024),
            t.memoizedProps = l,
            t.memoizedState = M),
            o.props = l,
            o.state = M,
            o.context = C,
            l = U) : (typeof o.componentDidUpdate != "function" || h === e.memoizedProps && j === e.memoizedState || (t.flags |= 4),
            typeof o.getSnapshotBeforeUpdate != "function" || h === e.memoizedProps && j === e.memoizedState || (t.flags |= 1024),
            l = !1)
        }
        return o = l,
        Qi(e, t),
        l = (t.flags & 128) !== 0,
        o || l ? (o = t.stateNode,
        n = l && typeof n.getDerivedStateFromError != "function" ? null : o.render(),
        t.flags |= 1,
        e !== null && l ? (t.child = Wn(t, e.child, null, s),
        t.child = Wn(t, null, n, s)) : Pe(e, t, n, s),
        t.memoizedState = o.state,
        e = t.child) : e = It(e, t, s),
        e
    }
    function Sd(e, t, n, l) {
        return Xn(),
        t.flags |= 256,
        Pe(e, t, n, l),
        t.child
    }
    var uu = {
        dehydrated: null,
        treeContext: null,
        retryLane: 0,
        hydrationErrors: null
    };
    function ou(e) {
        return {
            baseLanes: e,
            cachePool: cf()
        }
    }
    function cu(e, t, n) {
        return e = e !== null ? e.childLanes & ~n : 0,
        t && (e |= bt),
        e
    }
    function Ed(e, t, n) {
        var l = t.pendingProps, s = !1, o = (t.flags & 128) !== 0, h;
        if ((h = o) || (h = e !== null && e.memoizedState === null ? !1 : (Be.current & 2) !== 0),
        h && (s = !0,
        t.flags &= -129),
        h = (t.flags & 32) !== 0,
        t.flags &= -33,
        e === null) {
            if (ve) {
                if (s ? En(t) : wn(),
                (e = je) ? (e = Rh(e, Ot),
                e = e !== null && e.data !== "&" ? e : null,
                e !== null && (t.memoizedState = {
                    dehydrated: e,
                    treeContext: gn !== null ? {
                        id: Ut,
                        overflow: Ht
                    } : null,
                    retryLane: 536870912,
                    hydrationErrors: null
                },
                n = ef(e),
                n.return = t,
                t.child = n,
                $e = t,
                je = null)) : e = null,
                e === null)
                    throw yn(t);
                return Zu(e) ? t.lanes = 32 : t.lanes = 536870912,
                null
            }
            var y = l.children;
            return l = l.fallback,
            s ? (wn(),
            s = t.mode,
            y = ki({
                mode: "hidden",
                children: y
            }, s),
            l = kn(l, s, n, null),
            y.return = t,
            l.return = t,
            y.sibling = l,
            t.child = y,
            l = t.child,
            l.memoizedState = ou(n),
            l.childLanes = cu(e, h, n),
            t.memoizedState = uu,
            Sa(null, l)) : (En(t),
            fu(t, y))
        }
        var C = e.memoizedState;
        if (C !== null && (y = C.dehydrated,
        y !== null)) {
            if (o)
                t.flags & 256 ? (En(t),
                t.flags &= -257,
                t = du(e, t, n)) : t.memoizedState !== null ? (wn(),
                t.child = e.child,
                t.flags |= 128,
                t = null) : (wn(),
                y = l.fallback,
                s = t.mode,
                l = ki({
                    mode: "visible",
                    children: l.children
                }, s),
                y = kn(y, s, n, null),
                y.flags |= 2,
                l.return = t,
                y.return = t,
                l.sibling = y,
                t.child = l,
                Wn(t, e.child, null, n),
                l = t.child,
                l.memoizedState = ou(n),
                l.childLanes = cu(e, h, n),
                t.memoizedState = uu,
                t = Sa(null, l));
            else if (En(t),
            Zu(y)) {
                if (h = y.nextSibling && y.nextSibling.dataset,
                h)
                    var L = h.dgst;
                h = L,
                l = Error(u(419)),
                l.stack = "",
                l.digest = h,
                oa({
                    value: l,
                    source: null,
                    stack: null
                }),
                t = du(e, t, n)
            } else if (Ve || xl(e, t, n, !1),
            h = (n & e.childLanes) !== 0,
            Ve || h) {
                if (h = Le,
                h !== null && (l = rc(h, n),
                l !== 0 && l !== C.retryLane))
                    throw C.retryLane = l,
                    Qn(e, l),
                    ct(h, e, l),
                    su;
                Xu(y) || Ii(),
                t = du(e, t, n)
            } else
                Xu(y) ? (t.flags |= 192,
                t.child = e.child,
                t = null) : (e = C.treeContext,
                je = Nt(y.nextSibling),
                $e = t,
                ve = !0,
                pn = null,
                Ot = !1,
                e !== null && lf(t, e),
                t = fu(t, l.children),
                t.flags |= 4096);
            return t
        }
        return s ? (wn(),
        y = l.fallback,
        s = t.mode,
        C = e.child,
        L = C.sibling,
        l = Kt(C, {
            mode: "hidden",
            children: l.children
        }),
        l.subtreeFlags = C.subtreeFlags & 65011712,
        L !== null ? y = Kt(L, y) : (y = kn(y, s, n, null),
        y.flags |= 2),
        y.return = t,
        l.return = t,
        l.sibling = y,
        t.child = l,
        Sa(null, l),
        l = t.child,
        y = e.child.memoizedState,
        y === null ? y = ou(n) : (s = y.cachePool,
        s !== null ? (C = Ge._currentValue,
        s = s.parent !== C ? {
            parent: C,
            pool: C
        } : s) : s = cf(),
        y = {
            baseLanes: y.baseLanes | n,
            cachePool: s
        }),
        l.memoizedState = y,
        l.childLanes = cu(e, h, n),
        t.memoizedState = uu,
        Sa(e.child, l)) : (En(t),
        n = e.child,
        e = n.sibling,
        n = Kt(n, {
            mode: "visible",
            children: l.children
        }),
        n.return = t,
        n.sibling = null,
        e !== null && (h = t.deletions,
        h === null ? (t.deletions = [e],
        t.flags |= 16) : h.push(e)),
        t.child = n,
        t.memoizedState = null,
        n)
    }
    function fu(e, t) {
        return t = ki({
            mode: "visible",
            children: t
        }, e.mode),
        t.return = e,
        e.child = t
    }
    function ki(e, t) {
        return e = gt(22, e, null, t),
        e.lanes = 0,
        e
    }
    function du(e, t, n) {
        return Wn(t, e.child, null, n),
        e = fu(t, t.pendingProps.children),
        e.flags |= 2,
        t.memoizedState = null,
        e
    }
    function wd(e, t, n) {
        e.lanes |= t;
        var l = e.alternate;
        l !== null && (l.lanes |= t),
        Or(e.return, t, n)
    }
    function hu(e, t, n, l, s, o) {
        var h = e.memoizedState;
        h === null ? e.memoizedState = {
            isBackwards: t,
            rendering: null,
            renderingStartTime: 0,
            last: l,
            tail: n,
            tailMode: s,
            treeForkCount: o
        } : (h.isBackwards = t,
        h.rendering = null,
        h.renderingStartTime = 0,
        h.last = l,
        h.tail = n,
        h.tailMode = s,
        h.treeForkCount = o)
    }
    function _d(e, t, n) {
        var l = t.pendingProps
          , s = l.revealOrder
          , o = l.tail;
        l = l.children;
        var h = Be.current
          , y = (h & 2) !== 0;
        if (y ? (h = h & 1 | 2,
        t.flags |= 128) : h &= 1,
        Z(Be, h),
        Pe(e, t, l, n),
        l = ve ? ua : 0,
        !y && e !== null && (e.flags & 128) !== 0)
            e: for (e = t.child; e !== null; ) {
                if (e.tag === 13)
                    e.memoizedState !== null && wd(e, n, t);
                else if (e.tag === 19)
                    wd(e, n, t);
                else if (e.child !== null) {
                    e.child.return = e,
                    e = e.child;
                    continue
                }
                if (e === t)
                    break e;
                for (; e.sibling === null; ) {
                    if (e.return === null || e.return === t)
                        break e;
                    e = e.return
                }
                e.sibling.return = e.return,
                e = e.sibling
            }
        switch (s) {
        case "forwards":
            for (n = t.child,
            s = null; n !== null; )
                e = n.alternate,
                e !== null && ji(e) === null && (s = n),
                n = n.sibling;
            n = s,
            n === null ? (s = t.child,
            t.child = null) : (s = n.sibling,
            n.sibling = null),
            hu(t, !1, s, n, o, l);
            break;
        case "backwards":
        case "unstable_legacy-backwards":
            for (n = null,
            s = t.child,
            t.child = null; s !== null; ) {
                if (e = s.alternate,
                e !== null && ji(e) === null) {
                    t.child = s;
                    break
                }
                e = s.sibling,
                s.sibling = n,
                n = s,
                s = e
            }
            hu(t, !0, n, null, o, l);
            break;
        case "together":
            hu(t, !1, null, null, void 0, l);
            break;
        default:
            t.memoizedState = null
        }
        return t.child
    }
    function It(e, t, n) {
        if (e !== null && (t.dependencies = e.dependencies),
        Tn |= t.lanes,
        (n & t.childLanes) === 0)
            if (e !== null) {
                if (xl(e, t, n, !1),
                (n & t.childLanes) === 0)
                    return null
            } else
                return null;
        if (e !== null && t.child !== e.child)
            throw Error(u(153));
        if (t.child !== null) {
            for (e = t.child,
            n = Kt(e, e.pendingProps),
            t.child = n,
            n.return = t; e.sibling !== null; )
                e = e.sibling,
                n = n.sibling = Kt(e, e.pendingProps),
                n.return = t;
            n.sibling = null
        }
        return t.child
    }
    function mu(e, t) {
        return (e.lanes & t) !== 0 ? !0 : (e = e.dependencies,
        !!(e !== null && _i(e)))
    }
    function Uy(e, t, n) {
        switch (t.tag) {
        case 3:
            nt(t, t.stateNode.containerInfo),
            vn(t, Ge, e.memoizedState.cache),
            Xn();
            break;
        case 27:
        case 5:
            Kl(t);
            break;
        case 4:
            nt(t, t.stateNode.containerInfo);
            break;
        case 10:
            vn(t, t.type, t.memoizedProps.value);
            break;
        case 31:
            if (t.memoizedState !== null)
                return t.flags |= 128,
                qr(t),
                null;
            break;
        case 13:
            var l = t.memoizedState;
            if (l !== null)
                return l.dehydrated !== null ? (En(t),
                t.flags |= 128,
                null) : (n & t.child.childLanes) !== 0 ? Ed(e, t, n) : (En(t),
                e = It(e, t, n),
                e !== null ? e.sibling : null);
            En(t);
            break;
        case 19:
            var s = (e.flags & 128) !== 0;
            if (l = (n & t.childLanes) !== 0,
            l || (xl(e, t, n, !1),
            l = (n & t.childLanes) !== 0),
            s) {
                if (l)
                    return _d(e, t, n);
                t.flags |= 128
            }
            if (s = t.memoizedState,
            s !== null && (s.rendering = null,
            s.tail = null,
            s.lastEffect = null),
            Z(Be, Be.current),
            l)
                break;
            return null;
        case 22:
            return t.lanes = 0,
            pd(e, t, n, t.pendingProps);
        case 24:
            vn(t, Ge, e.memoizedState.cache)
        }
        return It(e, t, n)
    }
    function Cd(e, t, n) {
        if (e !== null)
            if (e.memoizedProps !== t.pendingProps)
                Ve = !0;
            else {
                if (!mu(e, n) && (t.flags & 128) === 0)
                    return Ve = !1,
                    Uy(e, t, n);
                Ve = (e.flags & 131072) !== 0
            }
        else
            Ve = !1,
            ve && (t.flags & 1048576) !== 0 && nf(t, ua, t.index);
        switch (t.lanes = 0,
        t.tag) {
        case 16:
            e: {
                var l = t.pendingProps;
                if (e = Jn(t.elementType),
                t.type = e,
                typeof e == "function")
                    br(e) ? (l = In(e, l),
                    t.tag = 1,
                    t = xd(null, t, e, l, n)) : (t.tag = 0,
                    t = ru(null, t, e, l, n));
                else {
                    if (e != null) {
                        var s = e.$$typeof;
                        if (s === F) {
                            t.tag = 11,
                            t = hd(null, t, e, l, n);
                            break e
                        } else if (s === P) {
                            t.tag = 14,
                            t = md(null, t, e, l, n);
                            break e
                        }
                    }
                    throw t = oe(e) || e,
                    Error(u(306, t, ""))
                }
            }
            return t;
        case 0:
            return ru(e, t, t.type, t.pendingProps, n);
        case 1:
            return l = t.type,
            s = In(l, t.pendingProps),
            xd(e, t, l, s, n);
        case 3:
            e: {
                if (nt(t, t.stateNode.containerInfo),
                e === null)
                    throw Error(u(387));
                l = t.pendingProps;
                var o = t.memoizedState;
                s = o.element,
                Mr(e, t),
                pa(t, l, null, n);
                var h = t.memoizedState;
                if (l = h.cache,
                vn(t, Ge, l),
                l !== o.cache && Ar(t, [Ge], n, !0),
                ga(),
                l = h.element,
                o.isDehydrated)
                    if (o = {
                        element: l,
                        isDehydrated: !1,
                        cache: h.cache
                    },
                    t.updateQueue.baseState = o,
                    t.memoizedState = o,
                    t.flags & 256) {
                        t = Sd(e, t, l, n);
                        break e
                    } else if (l !== s) {
                        s = _t(Error(u(424)), t),
                        oa(s),
                        t = Sd(e, t, l, n);
                        break e
                    } else
                        for (e = t.stateNode.containerInfo,
                        e.nodeType === 9 ? e = e.body : e = e.nodeName === "HTML" ? e.ownerDocument.body : e,
                        je = Nt(e.firstChild),
                        $e = t,
                        ve = !0,
                        pn = null,
                        Ot = !0,
                        n = pf(t, null, l, n),
                        t.child = n; n; )
                            n.flags = n.flags & -3 | 4096,
                            n = n.sibling;
                else {
                    if (Xn(),
                    l === s) {
                        t = It(e, t, n);
                        break e
                    }
                    Pe(e, t, l, n)
                }
                t = t.child
            }
            return t;
        case 26:
            return Qi(e, t),
            e === null ? (n = Uh(t.type, null, t.pendingProps, null)) ? t.memoizedState = n : ve || (n = t.type,
            e = t.pendingProps,
            l = ss(de.current).createElement(n),
            l[Je] = t,
            l[at] = e,
            Ie(l, n, e),
            Ze(l),
            t.stateNode = l) : t.memoizedState = Uh(t.type, e.memoizedProps, t.pendingProps, e.memoizedState),
            null;
        case 27:
            return Kl(t),
            e === null && ve && (l = t.stateNode = Dh(t.type, t.pendingProps, de.current),
            $e = t,
            Ot = !0,
            s = je,
            Ln(t.type) ? (Ku = s,
            je = Nt(l.firstChild)) : je = s),
            Pe(e, t, t.pendingProps.children, n),
            Qi(e, t),
            e === null && (t.flags |= 4194304),
            t.child;
        case 5:
            return e === null && ve && ((s = l = je) && (l = d0(l, t.type, t.pendingProps, Ot),
            l !== null ? (t.stateNode = l,
            $e = t,
            je = Nt(l.firstChild),
            Ot = !1,
            s = !0) : s = !1),
            s || yn(t)),
            Kl(t),
            s = t.type,
            o = t.pendingProps,
            h = e !== null ? e.memoizedProps : null,
            l = o.children,
            Vu(s, o) ? l = null : h !== null && Vu(s, h) && (t.flags |= 32),
            t.memoizedState !== null && (s = Yr(e, t, Oy, null, null, n),
            Ua._currentValue = s),
            Qi(e, t),
            Pe(e, t, l, n),
            t.child;
        case 6:
            return e === null && ve && ((e = n = je) && (n = h0(n, t.pendingProps, Ot),
            n !== null ? (t.stateNode = n,
            $e = t,
            je = null,
            e = !0) : e = !1),
            e || yn(t)),
            null;
        case 13:
            return Ed(e, t, n);
        case 4:
            return nt(t, t.stateNode.containerInfo),
            l = t.pendingProps,
            e === null ? t.child = Wn(t, null, l, n) : Pe(e, t, l, n),
            t.child;
        case 11:
            return hd(e, t, t.type, t.pendingProps, n);
        case 7:
            return Pe(e, t, t.pendingProps, n),
            t.child;
        case 8:
            return Pe(e, t, t.pendingProps.children, n),
            t.child;
        case 12:
            return Pe(e, t, t.pendingProps.children, n),
            t.child;
        case 10:
            return l = t.pendingProps,
            vn(t, t.type, l.value),
            Pe(e, t, l.children, n),
            t.child;
        case 9:
            return s = t.type._context,
            l = t.pendingProps.children,
            Kn(t),
            s = We(s),
            l = l(s),
            t.flags |= 1,
            Pe(e, t, l, n),
            t.child;
        case 14:
            return md(e, t, t.type, t.pendingProps, n);
        case 15:
            return gd(e, t, t.type, t.pendingProps, n);
        case 19:
            return _d(e, t, n);
        case 31:
            return zy(e, t, n);
        case 22:
            return pd(e, t, n, t.pendingProps);
        case 24:
            return Kn(t),
            l = We(Ge),
            e === null ? (s = Lr(),
            s === null && (s = Le,
            o = Nr(),
            s.pooledCache = o,
            o.refCount++,
            o !== null && (s.pooledCacheLanes |= n),
            s = o),
            t.memoizedState = {
                parent: l,
                cache: s
            },
            Dr(t),
            vn(t, Ge, s)) : ((e.lanes & n) !== 0 && (Mr(e, t),
            pa(t, null, null, n),
            ga()),
            s = e.memoizedState,
            o = t.memoizedState,
            s.parent !== l ? (s = {
                parent: l,
                cache: l
            },
            t.memoizedState = s,
            t.lanes === 0 && (t.memoizedState = t.updateQueue.baseState = s),
            vn(t, Ge, l)) : (l = o.cache,
            vn(t, Ge, l),
            l !== s.cache && Ar(t, [Ge], n, !0))),
            Pe(e, t, t.pendingProps.children, n),
            t.child;
        case 29:
            throw t.pendingProps
        }
        throw Error(u(156, t.tag))
    }
    function en(e) {
        e.flags |= 4
    }
    function gu(e, t, n, l, s) {
        if ((t = (e.mode & 32) !== 0) && (t = !1),
        t) {
            if (e.flags |= 16777216,
            (s & 335544128) === s)
                if (e.stateNode.complete)
                    e.flags |= 8192;
                else if (Pd())
                    e.flags |= 8192;
                else
                    throw $n = Ai,
                    jr
        } else
            e.flags &= -16777217
    }
    function Td(e, t) {
        if (t.type !== "stylesheet" || (t.state.loading & 4) !== 0)
            e.flags &= -16777217;
        else if (e.flags |= 16777216,
        !Yh(t))
            if (Pd())
                e.flags |= 8192;
            else
                throw $n = Ai,
                jr
    }
    function Xi(e, t) {
        t !== null && (e.flags |= 4),
        e.flags & 16384 && (t = e.tag !== 22 ? ac() : 536870912,
        e.lanes |= t,
        jl |= t)
    }
    function Ea(e, t) {
        if (!ve)
            switch (e.tailMode) {
            case "hidden":
                t = e.tail;
                for (var n = null; t !== null; )
                    t.alternate !== null && (n = t),
                    t = t.sibling;
                n === null ? e.tail = null : n.sibling = null;
                break;
            case "collapsed":
                n = e.tail;
                for (var l = null; n !== null; )
                    n.alternate !== null && (l = n),
                    n = n.sibling;
                l === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : l.sibling = null
            }
    }
    function De(e) {
        var t = e.alternate !== null && e.alternate.child === e.child
          , n = 0
          , l = 0;
        if (t)
            for (var s = e.child; s !== null; )
                n |= s.lanes | s.childLanes,
                l |= s.subtreeFlags & 65011712,
                l |= s.flags & 65011712,
                s.return = e,
                s = s.sibling;
        else
            for (s = e.child; s !== null; )
                n |= s.lanes | s.childLanes,
                l |= s.subtreeFlags,
                l |= s.flags,
                s.return = e,
                s = s.sibling;
        return e.subtreeFlags |= l,
        e.childLanes = n,
        t
    }
    function Hy(e, t, n) {
        var l = t.pendingProps;
        switch (wr(t),
        t.tag) {
        case 16:
        case 15:
        case 0:
        case 11:
        case 7:
        case 8:
        case 12:
        case 9:
        case 14:
            return De(t),
            null;
        case 1:
            return De(t),
            null;
        case 3:
            return n = t.stateNode,
            l = null,
            e !== null && (l = e.memoizedState.cache),
            t.memoizedState.cache !== l && (t.flags |= 2048),
            $t(Ge),
            He(),
            n.pendingContext && (n.context = n.pendingContext,
            n.pendingContext = null),
            (e === null || e.child === null) && (bl(t) ? en(t) : e === null || e.memoizedState.isDehydrated && (t.flags & 256) === 0 || (t.flags |= 1024,
            Cr())),
            De(t),
            null;
        case 26:
            var s = t.type
              , o = t.memoizedState;
            return e === null ? (en(t),
            o !== null ? (De(t),
            Td(t, o)) : (De(t),
            gu(t, s, null, l, n))) : o ? o !== e.memoizedState ? (en(t),
            De(t),
            Td(t, o)) : (De(t),
            t.flags &= -16777217) : (e = e.memoizedProps,
            e !== l && en(t),
            De(t),
            gu(t, s, e, l, n)),
            null;
        case 27:
            if (ni(t),
            n = de.current,
            s = t.type,
            e !== null && t.stateNode != null)
                e.memoizedProps !== l && en(t);
            else {
                if (!l) {
                    if (t.stateNode === null)
                        throw Error(u(166));
                    return De(t),
                    null
                }
                e = J.current,
                bl(t) ? af(t) : (e = Dh(s, l, n),
                t.stateNode = e,
                en(t))
            }
            return De(t),
            null;
        case 5:
            if (ni(t),
            s = t.type,
            e !== null && t.stateNode != null)
                e.memoizedProps !== l && en(t);
            else {
                if (!l) {
                    if (t.stateNode === null)
                        throw Error(u(166));
                    return De(t),
                    null
                }
                if (o = J.current,
                bl(t))
                    af(t);
                else {
                    var h = ss(de.current);
                    switch (o) {
                    case 1:
                        o = h.createElementNS("http://www.w3.org/2000/svg", s);
                        break;
                    case 2:
                        o = h.createElementNS("http://www.w3.org/1998/Math/MathML", s);
                        break;
                    default:
                        switch (s) {
                        case "svg":
                            o = h.createElementNS("http://www.w3.org/2000/svg", s);
                            break;
                        case "math":
                            o = h.createElementNS("http://www.w3.org/1998/Math/MathML", s);
                            break;
                        case "script":
                            o = h.createElement("div"),
                            o.innerHTML = "<script><\/script>",
                            o = o.removeChild(o.firstChild);
                            break;
                        case "select":
                            o = typeof l.is == "string" ? h.createElement("select", {
                                is: l.is
                            }) : h.createElement("select"),
                            l.multiple ? o.multiple = !0 : l.size && (o.size = l.size);
                            break;
                        default:
                            o = typeof l.is == "string" ? h.createElement(s, {
                                is: l.is
                            }) : h.createElement(s)
                        }
                    }
                    o[Je] = t,
                    o[at] = l;
                    e: for (h = t.child; h !== null; ) {
                        if (h.tag === 5 || h.tag === 6)
                            o.appendChild(h.stateNode);
                        else if (h.tag !== 4 && h.tag !== 27 && h.child !== null) {
                            h.child.return = h,
                            h = h.child;
                            continue
                        }
                        if (h === t)
                            break e;
                        for (; h.sibling === null; ) {
                            if (h.return === null || h.return === t)
                                break e;
                            h = h.return
                        }
                        h.sibling.return = h.return,
                        h = h.sibling
                    }
                    t.stateNode = o;
                    e: switch (Ie(o, s, l),
                    s) {
                    case "button":
                    case "input":
                    case "select":
                    case "textarea":
                        l = !!l.autoFocus;
                        break e;
                    case "img":
                        l = !0;
                        break e;
                    default:
                        l = !1
                    }
                    l && en(t)
                }
            }
            return De(t),
            gu(t, t.type, e === null ? null : e.memoizedProps, t.pendingProps, n),
            null;
        case 6:
            if (e && t.stateNode != null)
                e.memoizedProps !== l && en(t);
            else {
                if (typeof l != "string" && t.stateNode === null)
                    throw Error(u(166));
                if (e = de.current,
                bl(t)) {
                    if (e = t.stateNode,
                    n = t.memoizedProps,
                    l = null,
                    s = $e,
                    s !== null)
                        switch (s.tag) {
                        case 27:
                        case 5:
                            l = s.memoizedProps
                        }
                    e[Je] = t,
                    e = !!(e.nodeValue === n || l !== null && l.suppressHydrationWarning === !0 || Eh(e.nodeValue, n)),
                    e || yn(t, !0)
                } else
                    e = ss(e).createTextNode(l),
                    e[Je] = t,
                    t.stateNode = e
            }
            return De(t),
            null;
        case 31:
            if (n = t.memoizedState,
            e === null || e.memoizedState !== null) {
                if (l = bl(t),
                n !== null) {
                    if (e === null) {
                        if (!l)
                            throw Error(u(318));
                        if (e = t.memoizedState,
                        e = e !== null ? e.dehydrated : null,
                        !e)
                            throw Error(u(557));
                        e[Je] = t
                    } else
                        Xn(),
                        (t.flags & 128) === 0 && (t.memoizedState = null),
                        t.flags |= 4;
                    De(t),
                    e = !1
                } else
                    n = Cr(),
                    e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = n),
                    e = !0;
                if (!e)
                    return t.flags & 256 ? (yt(t),
                    t) : (yt(t),
                    null);
                if ((t.flags & 128) !== 0)
                    throw Error(u(558))
            }
            return De(t),
            null;
        case 13:
            if (l = t.memoizedState,
            e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
                if (s = bl(t),
                l !== null && l.dehydrated !== null) {
                    if (e === null) {
                        if (!s)
                            throw Error(u(318));
                        if (s = t.memoizedState,
                        s = s !== null ? s.dehydrated : null,
                        !s)
                            throw Error(u(317));
                        s[Je] = t
                    } else
                        Xn(),
                        (t.flags & 128) === 0 && (t.memoizedState = null),
                        t.flags |= 4;
                    De(t),
                    s = !1
                } else
                    s = Cr(),
                    e !== null && e.memoizedState !== null && (e.memoizedState.hydrationErrors = s),
                    s = !0;
                if (!s)
                    return t.flags & 256 ? (yt(t),
                    t) : (yt(t),
                    null)
            }
            return yt(t),
            (t.flags & 128) !== 0 ? (t.lanes = n,
            t) : (n = l !== null,
            e = e !== null && e.memoizedState !== null,
            n && (l = t.child,
            s = null,
            l.alternate !== null && l.alternate.memoizedState !== null && l.alternate.memoizedState.cachePool !== null && (s = l.alternate.memoizedState.cachePool.pool),
            o = null,
            l.memoizedState !== null && l.memoizedState.cachePool !== null && (o = l.memoizedState.cachePool.pool),
            o !== s && (l.flags |= 2048)),
            n !== e && n && (t.child.flags |= 8192),
            Xi(t, t.updateQueue),
            De(t),
            null);
        case 4:
            return He(),
            e === null && Hu(t.stateNode.containerInfo),
            De(t),
            null;
        case 10:
            return $t(t.type),
            De(t),
            null;
        case 19:
            if (B(Be),
            l = t.memoizedState,
            l === null)
                return De(t),
                null;
            if (s = (t.flags & 128) !== 0,
            o = l.rendering,
            o === null)
                if (s)
                    Ea(l, !1);
                else {
                    if (Ue !== 0 || e !== null && (e.flags & 128) !== 0)
                        for (e = t.child; e !== null; ) {
                            if (o = ji(e),
                            o !== null) {
                                for (t.flags |= 128,
                                Ea(l, !1),
                                e = o.updateQueue,
                                t.updateQueue = e,
                                Xi(t, e),
                                t.subtreeFlags = 0,
                                e = n,
                                n = t.child; n !== null; )
                                    Ic(n, e),
                                    n = n.sibling;
                                return Z(Be, Be.current & 1 | 2),
                                ve && Ft(t, l.treeForkCount),
                                t.child
                            }
                            e = e.sibling
                        }
                    l.tail !== null && ft() > $i && (t.flags |= 128,
                    s = !0,
                    Ea(l, !1),
                    t.lanes = 4194304)
                }
            else {
                if (!s)
                    if (e = ji(o),
                    e !== null) {
                        if (t.flags |= 128,
                        s = !0,
                        e = e.updateQueue,
                        t.updateQueue = e,
                        Xi(t, e),
                        Ea(l, !0),
                        l.tail === null && l.tailMode === "hidden" && !o.alternate && !ve)
                            return De(t),
                            null
                    } else
                        2 * ft() - l.renderingStartTime > $i && n !== 536870912 && (t.flags |= 128,
                        s = !0,
                        Ea(l, !1),
                        t.lanes = 4194304);
                l.isBackwards ? (o.sibling = t.child,
                t.child = o) : (e = l.last,
                e !== null ? e.sibling = o : t.child = o,
                l.last = o)
            }
            return l.tail !== null ? (e = l.tail,
            l.rendering = e,
            l.tail = e.sibling,
            l.renderingStartTime = ft(),
            e.sibling = null,
            n = Be.current,
            Z(Be, s ? n & 1 | 2 : n & 1),
            ve && Ft(t, l.treeForkCount),
            e) : (De(t),
            null);
        case 22:
        case 23:
            return yt(t),
            Br(),
            l = t.memoizedState !== null,
            e !== null ? e.memoizedState !== null !== l && (t.flags |= 8192) : l && (t.flags |= 8192),
            l ? (n & 536870912) !== 0 && (t.flags & 128) === 0 && (De(t),
            t.subtreeFlags & 6 && (t.flags |= 8192)) : De(t),
            n = t.updateQueue,
            n !== null && Xi(t, n.retryQueue),
            n = null,
            e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool),
            l = null,
            t.memoizedState !== null && t.memoizedState.cachePool !== null && (l = t.memoizedState.cachePool.pool),
            l !== n && (t.flags |= 2048),
            e !== null && B(Fn),
            null;
        case 24:
            return n = null,
            e !== null && (n = e.memoizedState.cache),
            t.memoizedState.cache !== n && (t.flags |= 2048),
            $t(Ge),
            De(t),
            null;
        case 25:
            return null;
        case 30:
            return null
        }
        throw Error(u(156, t.tag))
    }
    function By(e, t) {
        switch (wr(t),
        t.tag) {
        case 1:
            return e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 3:
            return $t(Ge),
            He(),
            e = t.flags,
            (e & 65536) !== 0 && (e & 128) === 0 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 26:
        case 27:
        case 5:
            return ni(t),
            null;
        case 31:
            if (t.memoizedState !== null) {
                if (yt(t),
                t.alternate === null)
                    throw Error(u(340));
                Xn()
            }
            return e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 13:
            if (yt(t),
            e = t.memoizedState,
            e !== null && e.dehydrated !== null) {
                if (t.alternate === null)
                    throw Error(u(340));
                Xn()
            }
            return e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 19:
            return B(Be),
            null;
        case 4:
            return He(),
            null;
        case 10:
            return $t(t.type),
            null;
        case 22:
        case 23:
            return yt(t),
            Br(),
            e !== null && B(Fn),
            e = t.flags,
            e & 65536 ? (t.flags = e & -65537 | 128,
            t) : null;
        case 24:
            return $t(Ge),
            null;
        case 25:
            return null;
        default:
            return null
        }
    }
    function Od(e, t) {
        switch (wr(t),
        t.tag) {
        case 3:
            $t(Ge),
            He();
            break;
        case 26:
        case 27:
        case 5:
            ni(t);
            break;
        case 4:
            He();
            break;
        case 31:
            t.memoizedState !== null && yt(t);
            break;
        case 13:
            yt(t);
            break;
        case 19:
            B(Be);
            break;
        case 10:
            $t(t.type);
            break;
        case 22:
        case 23:
            yt(t),
            Br(),
            e !== null && B(Fn);
            break;
        case 24:
            $t(Ge)
        }
    }
    function wa(e, t) {
        try {
            var n = t.updateQueue
              , l = n !== null ? n.lastEffect : null;
            if (l !== null) {
                var s = l.next;
                n = s;
                do {
                    if ((n.tag & e) === e) {
                        l = void 0;
                        var o = n.create
                          , h = n.inst;
                        l = o(),
                        h.destroy = l
                    }
                    n = n.next
                } while (n !== s)
            }
        } catch (y) {
            Oe(t, t.return, y)
        }
    }
    function _n(e, t, n) {
        try {
            var l = t.updateQueue
              , s = l !== null ? l.lastEffect : null;
            if (s !== null) {
                var o = s.next;
                l = o;
                do {
                    if ((l.tag & e) === e) {
                        var h = l.inst
                          , y = h.destroy;
                        if (y !== void 0) {
                            h.destroy = void 0,
                            s = t;
                            var C = n
                              , L = y;
                            try {
                                L()
                            } catch (U) {
                                Oe(s, C, U)
                            }
                        }
                    }
                    l = l.next
                } while (l !== o)
            }
        } catch (U) {
            Oe(t, t.return, U)
        }
    }
    function Ad(e) {
        var t = e.updateQueue;
        if (t !== null) {
            var n = e.stateNode;
            try {
                vf(t, n)
            } catch (l) {
                Oe(e, e.return, l)
            }
        }
    }
    function Nd(e, t, n) {
        n.props = In(e.type, e.memoizedProps),
        n.state = e.memoizedState;
        try {
            n.componentWillUnmount()
        } catch (l) {
            Oe(e, t, l)
        }
    }
    function _a(e, t) {
        try {
            var n = e.ref;
            if (n !== null) {
                switch (e.tag) {
                case 26:
                case 27:
                case 5:
                    var l = e.stateNode;
                    break;
                case 30:
                    l = e.stateNode;
                    break;
                default:
                    l = e.stateNode
                }
                typeof n == "function" ? e.refCleanup = n(l) : n.current = l
            }
        } catch (s) {
            Oe(e, t, s)
        }
    }
    function Bt(e, t) {
        var n = e.ref
          , l = e.refCleanup;
        if (n !== null)
            if (typeof l == "function")
                try {
                    l()
                } catch (s) {
                    Oe(e, t, s)
                } finally {
                    e.refCleanup = null,
                    e = e.alternate,
                    e != null && (e.refCleanup = null)
                }
            else if (typeof n == "function")
                try {
                    n(null)
                } catch (s) {
                    Oe(e, t, s)
                }
            else
                n.current = null
    }
    function Rd(e) {
        var t = e.type
          , n = e.memoizedProps
          , l = e.stateNode;
        try {
            e: switch (t) {
            case "button":
            case "input":
            case "select":
            case "textarea":
                n.autoFocus && l.focus();
                break e;
            case "img":
                n.src ? l.src = n.src : n.srcSet && (l.srcset = n.srcSet)
            }
        } catch (s) {
            Oe(e, e.return, s)
        }
    }
    function pu(e, t, n) {
        try {
            var l = e.stateNode;
            s0(l, e.type, n, t),
            l[at] = t
        } catch (s) {
            Oe(e, e.return, s)
        }
    }
    function Ld(e) {
        return e.tag === 5 || e.tag === 3 || e.tag === 26 || e.tag === 27 && Ln(e.type) || e.tag === 4
    }
    function yu(e) {
        e: for (; ; ) {
            for (; e.sibling === null; ) {
                if (e.return === null || Ld(e.return))
                    return null;
                e = e.return
            }
            for (e.sibling.return = e.return,
            e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
                if (e.tag === 27 && Ln(e.type) || e.flags & 2 || e.child === null || e.tag === 4)
                    continue e;
                e.child.return = e,
                e = e.child
            }
            if (!(e.flags & 2))
                return e.stateNode
        }
    }
    function vu(e, t, n) {
        var l = e.tag;
        if (l === 5 || l === 6)
            e = e.stateNode,
            t ? (n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n).insertBefore(e, t) : (t = n.nodeType === 9 ? n.body : n.nodeName === "HTML" ? n.ownerDocument.body : n,
            t.appendChild(e),
            n = n._reactRootContainer,
            n != null || t.onclick !== null || (t.onclick = Xt));
        else if (l !== 4 && (l === 27 && Ln(e.type) && (n = e.stateNode,
        t = null),
        e = e.child,
        e !== null))
            for (vu(e, t, n),
            e = e.sibling; e !== null; )
                vu(e, t, n),
                e = e.sibling
    }
    function Zi(e, t, n) {
        var l = e.tag;
        if (l === 5 || l === 6)
            e = e.stateNode,
            t ? n.insertBefore(e, t) : n.appendChild(e);
        else if (l !== 4 && (l === 27 && Ln(e.type) && (n = e.stateNode),
        e = e.child,
        e !== null))
            for (Zi(e, t, n),
            e = e.sibling; e !== null; )
                Zi(e, t, n),
                e = e.sibling
    }
    function jd(e) {
        var t = e.stateNode
          , n = e.memoizedProps;
        try {
            for (var l = e.type, s = t.attributes; s.length; )
                t.removeAttributeNode(s[0]);
            Ie(t, l, n),
            t[Je] = e,
            t[at] = n
        } catch (o) {
            Oe(e, e.return, o)
        }
    }
    var tn = !1
      , Qe = !1
      , bu = !1
      , Dd = typeof WeakSet == "function" ? WeakSet : Set
      , Ke = null;
    function qy(e, t) {
        if (e = e.containerInfo,
        Gu = hs,
        e = kc(e),
        dr(e)) {
            if ("selectionStart"in e)
                var n = {
                    start: e.selectionStart,
                    end: e.selectionEnd
                };
            else
                e: {
                    n = (n = e.ownerDocument) && n.defaultView || window;
                    var l = n.getSelection && n.getSelection();
                    if (l && l.rangeCount !== 0) {
                        n = l.anchorNode;
                        var s = l.anchorOffset
                          , o = l.focusNode;
                        l = l.focusOffset;
                        try {
                            n.nodeType,
                            o.nodeType
                        } catch {
                            n = null;
                            break e
                        }
                        var h = 0
                          , y = -1
                          , C = -1
                          , L = 0
                          , U = 0
                          , Y = e
                          , j = null;
                        t: for (; ; ) {
                            for (var M; Y !== n || s !== 0 && Y.nodeType !== 3 || (y = h + s),
                            Y !== o || l !== 0 && Y.nodeType !== 3 || (C = h + l),
                            Y.nodeType === 3 && (h += Y.nodeValue.length),
                            (M = Y.firstChild) !== null; )
                                j = Y,
                                Y = M;
                            for (; ; ) {
                                if (Y === e)
                                    break t;
                                if (j === n && ++L === s && (y = h),
                                j === o && ++U === l && (C = h),
                                (M = Y.nextSibling) !== null)
                                    break;
                                Y = j,
                                j = Y.parentNode
                            }
                            Y = M
                        }
                        n = y === -1 || C === -1 ? null : {
                            start: y,
                            end: C
                        }
                    } else
                        n = null
                }
            n = n || {
                start: 0,
                end: 0
            }
        } else
            n = null;
        for (Yu = {
            focusedElem: e,
            selectionRange: n
        },
        hs = !1,
        Ke = t; Ke !== null; )
            if (t = Ke,
            e = t.child,
            (t.subtreeFlags & 1028) !== 0 && e !== null)
                e.return = t,
                Ke = e;
            else
                for (; Ke !== null; ) {
                    switch (t = Ke,
                    o = t.alternate,
                    e = t.flags,
                    t.tag) {
                    case 0:
                        if ((e & 4) !== 0 && (e = t.updateQueue,
                        e = e !== null ? e.events : null,
                        e !== null))
                            for (n = 0; n < e.length; n++)
                                s = e[n],
                                s.ref.impl = s.nextImpl;
                        break;
                    case 11:
                    case 15:
                        break;
                    case 1:
                        if ((e & 1024) !== 0 && o !== null) {
                            e = void 0,
                            n = t,
                            s = o.memoizedProps,
                            o = o.memoizedState,
                            l = n.stateNode;
                            try {
                                var $ = In(n.type, s);
                                e = l.getSnapshotBeforeUpdate($, o),
                                l.__reactInternalSnapshotBeforeUpdate = e
                            } catch (le) {
                                Oe(n, n.return, le)
                            }
                        }
                        break;
                    case 3:
                        if ((e & 1024) !== 0) {
                            if (e = t.stateNode.containerInfo,
                            n = e.nodeType,
                            n === 9)
                                ku(e);
                            else if (n === 1)
                                switch (e.nodeName) {
                                case "HEAD":
                                case "HTML":
                                case "BODY":
                                    ku(e);
                                    break;
                                default:
                                    e.textContent = ""
                                }
                        }
                        break;
                    case 5:
                    case 26:
                    case 27:
                    case 6:
                    case 4:
                    case 17:
                        break;
                    default:
                        if ((e & 1024) !== 0)
                            throw Error(u(163))
                    }
                    if (e = t.sibling,
                    e !== null) {
                        e.return = t.return,
                        Ke = e;
                        break
                    }
                    Ke = t.return
                }
    }
    function Md(e, t, n) {
        var l = n.flags;
        switch (n.tag) {
        case 0:
        case 11:
        case 15:
            ln(e, n),
            l & 4 && wa(5, n);
            break;
        case 1:
            if (ln(e, n),
            l & 4)
                if (e = n.stateNode,
                t === null)
                    try {
                        e.componentDidMount()
                    } catch (h) {
                        Oe(n, n.return, h)
                    }
                else {
                    var s = In(n.type, t.memoizedProps);
                    t = t.memoizedState;
                    try {
                        e.componentDidUpdate(s, t, e.__reactInternalSnapshotBeforeUpdate)
                    } catch (h) {
                        Oe(n, n.return, h)
                    }
                }
            l & 64 && Ad(n),
            l & 512 && _a(n, n.return);
            break;
        case 3:
            if (ln(e, n),
            l & 64 && (e = n.updateQueue,
            e !== null)) {
                if (t = null,
                n.child !== null)
                    switch (n.child.tag) {
                    case 27:
                    case 5:
                        t = n.child.stateNode;
                        break;
                    case 1:
                        t = n.child.stateNode
                    }
                try {
                    vf(e, t)
                } catch (h) {
                    Oe(n, n.return, h)
                }
            }
            break;
        case 27:
            t === null && l & 4 && jd(n);
        case 26:
        case 5:
            ln(e, n),
            t === null && l & 4 && Rd(n),
            l & 512 && _a(n, n.return);
            break;
        case 12:
            ln(e, n);
            break;
        case 31:
            ln(e, n),
            l & 4 && Hd(e, n);
            break;
        case 13:
            ln(e, n),
            l & 4 && Bd(e, n),
            l & 64 && (e = n.memoizedState,
            e !== null && (e = e.dehydrated,
            e !== null && (n = Fy.bind(null, n),
            m0(e, n))));
            break;
        case 22:
            if (l = n.memoizedState !== null || tn,
            !l) {
                t = t !== null && t.memoizedState !== null || Qe,
                s = tn;
                var o = Qe;
                tn = l,
                (Qe = t) && !o ? an(e, n, (n.subtreeFlags & 8772) !== 0) : ln(e, n),
                tn = s,
                Qe = o
            }
            break;
        case 30:
            break;
        default:
            ln(e, n)
        }
    }
    function zd(e) {
        var t = e.alternate;
        t !== null && (e.alternate = null,
        zd(t)),
        e.child = null,
        e.deletions = null,
        e.sibling = null,
        e.tag === 5 && (t = e.stateNode,
        t !== null && Js(t)),
        e.stateNode = null,
        e.return = null,
        e.dependencies = null,
        e.memoizedProps = null,
        e.memoizedState = null,
        e.pendingProps = null,
        e.stateNode = null,
        e.updateQueue = null
    }
    var Me = null
      , st = !1;
    function nn(e, t, n) {
        for (n = n.child; n !== null; )
            Ud(e, t, n),
            n = n.sibling
    }
    function Ud(e, t, n) {
        if (dt && typeof dt.onCommitFiberUnmount == "function")
            try {
                dt.onCommitFiberUnmount(Fl, n)
            } catch {}
        switch (n.tag) {
        case 26:
            Qe || Bt(n, t),
            nn(e, t, n),
            n.memoizedState ? n.memoizedState.count-- : n.stateNode && (n = n.stateNode,
            n.parentNode.removeChild(n));
            break;
        case 27:
            Qe || Bt(n, t);
            var l = Me
              , s = st;
            Ln(n.type) && (Me = n.stateNode,
            st = !1),
            nn(e, t, n),
            Da(n.stateNode),
            Me = l,
            st = s;
            break;
        case 5:
            Qe || Bt(n, t);
        case 6:
            if (l = Me,
            s = st,
            Me = null,
            nn(e, t, n),
            Me = l,
            st = s,
            Me !== null)
                if (st)
                    try {
                        (Me.nodeType === 9 ? Me.body : Me.nodeName === "HTML" ? Me.ownerDocument.body : Me).removeChild(n.stateNode)
                    } catch (o) {
                        Oe(n, t, o)
                    }
                else
                    try {
                        Me.removeChild(n.stateNode)
                    } catch (o) {
                        Oe(n, t, o)
                    }
            break;
        case 18:
            Me !== null && (st ? (e = Me,
            Ah(e.nodeType === 9 ? e.body : e.nodeName === "HTML" ? e.ownerDocument.body : e, n.stateNode),
            Gl(e)) : Ah(Me, n.stateNode));
            break;
        case 4:
            l = Me,
            s = st,
            Me = n.stateNode.containerInfo,
            st = !0,
            nn(e, t, n),
            Me = l,
            st = s;
            break;
        case 0:
        case 11:
        case 14:
        case 15:
            _n(2, n, t),
            Qe || _n(4, n, t),
            nn(e, t, n);
            break;
        case 1:
            Qe || (Bt(n, t),
            l = n.stateNode,
            typeof l.componentWillUnmount == "function" && Nd(n, t, l)),
            nn(e, t, n);
            break;
        case 21:
            nn(e, t, n);
            break;
        case 22:
            Qe = (l = Qe) || n.memoizedState !== null,
            nn(e, t, n),
            Qe = l;
            break;
        default:
            nn(e, t, n)
        }
    }
    function Hd(e, t) {
        if (t.memoizedState === null && (e = t.alternate,
        e !== null && (e = e.memoizedState,
        e !== null))) {
            e = e.dehydrated;
            try {
                Gl(e)
            } catch (n) {
                Oe(t, t.return, n)
            }
        }
    }
    function Bd(e, t) {
        if (t.memoizedState === null && (e = t.alternate,
        e !== null && (e = e.memoizedState,
        e !== null && (e = e.dehydrated,
        e !== null))))
            try {
                Gl(e)
            } catch (n) {
                Oe(t, t.return, n)
            }
    }
    function Gy(e) {
        switch (e.tag) {
        case 31:
        case 13:
        case 19:
            var t = e.stateNode;
            return t === null && (t = e.stateNode = new Dd),
            t;
        case 22:
            return e = e.stateNode,
            t = e._retryCache,
            t === null && (t = e._retryCache = new Dd),
            t;
        default:
            throw Error(u(435, e.tag))
        }
    }
    function Ki(e, t) {
        var n = Gy(e);
        t.forEach(function(l) {
            if (!n.has(l)) {
                n.add(l);
                var s = Jy.bind(null, e, l);
                l.then(s, s)
            }
        })
    }
    function rt(e, t) {
        var n = t.deletions;
        if (n !== null)
            for (var l = 0; l < n.length; l++) {
                var s = n[l]
                  , o = e
                  , h = t
                  , y = h;
                e: for (; y !== null; ) {
                    switch (y.tag) {
                    case 27:
                        if (Ln(y.type)) {
                            Me = y.stateNode,
                            st = !1;
                            break e
                        }
                        break;
                    case 5:
                        Me = y.stateNode,
                        st = !1;
                        break e;
                    case 3:
                    case 4:
                        Me = y.stateNode.containerInfo,
                        st = !0;
                        break e
                    }
                    y = y.return
                }
                if (Me === null)
                    throw Error(u(160));
                Ud(o, h, s),
                Me = null,
                st = !1,
                o = s.alternate,
                o !== null && (o.return = null),
                s.return = null
            }
        if (t.subtreeFlags & 13886)
            for (t = t.child; t !== null; )
                qd(t, e),
                t = t.sibling
    }
    var Dt = null;
    function qd(e, t) {
        var n = e.alternate
          , l = e.flags;
        switch (e.tag) {
        case 0:
        case 11:
        case 14:
        case 15:
            rt(t, e),
            ut(e),
            l & 4 && (_n(3, e, e.return),
            wa(3, e),
            _n(5, e, e.return));
            break;
        case 1:
            rt(t, e),
            ut(e),
            l & 512 && (Qe || n === null || Bt(n, n.return)),
            l & 64 && tn && (e = e.updateQueue,
            e !== null && (l = e.callbacks,
            l !== null && (n = e.shared.hiddenCallbacks,
            e.shared.hiddenCallbacks = n === null ? l : n.concat(l))));
            break;
        case 26:
            var s = Dt;
            if (rt(t, e),
            ut(e),
            l & 512 && (Qe || n === null || Bt(n, n.return)),
            l & 4) {
                var o = n !== null ? n.memoizedState : null;
                if (l = e.memoizedState,
                n === null)
                    if (l === null)
                        if (e.stateNode === null) {
                            e: {
                                l = e.type,
                                n = e.memoizedProps,
                                s = s.ownerDocument || s;
                                t: switch (l) {
                                case "title":
                                    o = s.getElementsByTagName("title")[0],
                                    (!o || o[Wl] || o[Je] || o.namespaceURI === "http://www.w3.org/2000/svg" || o.hasAttribute("itemprop")) && (o = s.createElement(l),
                                    s.head.insertBefore(o, s.querySelector("head > title"))),
                                    Ie(o, l, n),
                                    o[Je] = e,
                                    Ze(o),
                                    l = o;
                                    break e;
                                case "link":
                                    var h = qh("link", "href", s).get(l + (n.href || ""));
                                    if (h) {
                                        for (var y = 0; y < h.length; y++)
                                            if (o = h[y],
                                            o.getAttribute("href") === (n.href == null || n.href === "" ? null : n.href) && o.getAttribute("rel") === (n.rel == null ? null : n.rel) && o.getAttribute("title") === (n.title == null ? null : n.title) && o.getAttribute("crossorigin") === (n.crossOrigin == null ? null : n.crossOrigin)) {
                                                h.splice(y, 1);
                                                break t
                                            }
                                    }
                                    o = s.createElement(l),
                                    Ie(o, l, n),
                                    s.head.appendChild(o);
                                    break;
                                case "meta":
                                    if (h = qh("meta", "content", s).get(l + (n.content || ""))) {
                                        for (y = 0; y < h.length; y++)
                                            if (o = h[y],
                                            o.getAttribute("content") === (n.content == null ? null : "" + n.content) && o.getAttribute("name") === (n.name == null ? null : n.name) && o.getAttribute("property") === (n.property == null ? null : n.property) && o.getAttribute("http-equiv") === (n.httpEquiv == null ? null : n.httpEquiv) && o.getAttribute("charset") === (n.charSet == null ? null : n.charSet)) {
                                                h.splice(y, 1);
                                                break t
                                            }
                                    }
                                    o = s.createElement(l),
                                    Ie(o, l, n),
                                    s.head.appendChild(o);
                                    break;
                                default:
                                    throw Error(u(468, l))
                                }
                                o[Je] = e,
                                Ze(o),
                                l = o
                            }
                            e.stateNode = l
                        } else
                            Gh(s, e.type, e.stateNode);
                    else
                        e.stateNode = Bh(s, l, e.memoizedProps);
                else
                    o !== l ? (o === null ? n.stateNode !== null && (n = n.stateNode,
                    n.parentNode.removeChild(n)) : o.count--,
                    l === null ? Gh(s, e.type, e.stateNode) : Bh(s, l, e.memoizedProps)) : l === null && e.stateNode !== null && pu(e, e.memoizedProps, n.memoizedProps)
            }
            break;
        case 27:
            rt(t, e),
            ut(e),
            l & 512 && (Qe || n === null || Bt(n, n.return)),
            n !== null && l & 4 && pu(e, e.memoizedProps, n.memoizedProps);
            break;
        case 5:
            if (rt(t, e),
            ut(e),
            l & 512 && (Qe || n === null || Bt(n, n.return)),
            e.flags & 32) {
                s = e.stateNode;
                try {
                    ol(s, "")
                } catch ($) {
                    Oe(e, e.return, $)
                }
            }
            l & 4 && e.stateNode != null && (s = e.memoizedProps,
            pu(e, s, n !== null ? n.memoizedProps : s)),
            l & 1024 && (bu = !0);
            break;
        case 6:
            if (rt(t, e),
            ut(e),
            l & 4) {
                if (e.stateNode === null)
                    throw Error(u(162));
                l = e.memoizedProps,
                n = e.stateNode;
                try {
                    n.nodeValue = l
                } catch ($) {
                    Oe(e, e.return, $)
                }
            }
            break;
        case 3:
            if (os = null,
            s = Dt,
            Dt = rs(t.containerInfo),
            rt(t, e),
            Dt = s,
            ut(e),
            l & 4 && n !== null && n.memoizedState.isDehydrated)
                try {
                    Gl(t.containerInfo)
                } catch ($) {
                    Oe(e, e.return, $)
                }
            bu && (bu = !1,
            Gd(e));
            break;
        case 4:
            l = Dt,
            Dt = rs(e.stateNode.containerInfo),
            rt(t, e),
            ut(e),
            Dt = l;
            break;
        case 12:
            rt(t, e),
            ut(e);
            break;
        case 31:
            rt(t, e),
            ut(e),
            l & 4 && (l = e.updateQueue,
            l !== null && (e.updateQueue = null,
            Ki(e, l)));
            break;
        case 13:
            rt(t, e),
            ut(e),
            e.child.flags & 8192 && e.memoizedState !== null != (n !== null && n.memoizedState !== null) && (Ji = ft()),
            l & 4 && (l = e.updateQueue,
            l !== null && (e.updateQueue = null,
            Ki(e, l)));
            break;
        case 22:
            s = e.memoizedState !== null;
            var C = n !== null && n.memoizedState !== null
              , L = tn
              , U = Qe;
            if (tn = L || s,
            Qe = U || C,
            rt(t, e),
            Qe = U,
            tn = L,
            ut(e),
            l & 8192)
                e: for (t = e.stateNode,
                t._visibility = s ? t._visibility & -2 : t._visibility | 1,
                s && (n === null || C || tn || Qe || el(e)),
                n = null,
                t = e; ; ) {
                    if (t.tag === 5 || t.tag === 26) {
                        if (n === null) {
                            C = n = t;
                            try {
                                if (o = C.stateNode,
                                s)
                                    h = o.style,
                                    typeof h.setProperty == "function" ? h.setProperty("display", "none", "important") : h.display = "none";
                                else {
                                    y = C.stateNode;
                                    var Y = C.memoizedProps.style
                                      , j = Y != null && Y.hasOwnProperty("display") ? Y.display : null;
                                    y.style.display = j == null || typeof j == "boolean" ? "" : ("" + j).trim()
                                }
                            } catch ($) {
                                Oe(C, C.return, $)
                            }
                        }
                    } else if (t.tag === 6) {
                        if (n === null) {
                            C = t;
                            try {
                                C.stateNode.nodeValue = s ? "" : C.memoizedProps
                            } catch ($) {
                                Oe(C, C.return, $)
                            }
                        }
                    } else if (t.tag === 18) {
                        if (n === null) {
                            C = t;
                            try {
                                var M = C.stateNode;
                                s ? Nh(M, !0) : Nh(C.stateNode, !1)
                            } catch ($) {
                                Oe(C, C.return, $)
                            }
                        }
                    } else if ((t.tag !== 22 && t.tag !== 23 || t.memoizedState === null || t === e) && t.child !== null) {
                        t.child.return = t,
                        t = t.child;
                        continue
                    }
                    if (t === e)
                        break e;
                    for (; t.sibling === null; ) {
                        if (t.return === null || t.return === e)
                            break e;
                        n === t && (n = null),
                        t = t.return
                    }
                    n === t && (n = null),
                    t.sibling.return = t.return,
                    t = t.sibling
                }
            l & 4 && (l = e.updateQueue,
            l !== null && (n = l.retryQueue,
            n !== null && (l.retryQueue = null,
            Ki(e, n))));
            break;
        case 19:
            rt(t, e),
            ut(e),
            l & 4 && (l = e.updateQueue,
            l !== null && (e.updateQueue = null,
            Ki(e, l)));
            break;
        case 30:
            break;
        case 21:
            break;
        default:
            rt(t, e),
            ut(e)
        }
    }
    function ut(e) {
        var t = e.flags;
        if (t & 2) {
            try {
                for (var n, l = e.return; l !== null; ) {
                    if (Ld(l)) {
                        n = l;
                        break
                    }
                    l = l.return
                }
                if (n == null)
                    throw Error(u(160));
                switch (n.tag) {
                case 27:
                    var s = n.stateNode
                      , o = yu(e);
                    Zi(e, o, s);
                    break;
                case 5:
                    var h = n.stateNode;
                    n.flags & 32 && (ol(h, ""),
                    n.flags &= -33);
                    var y = yu(e);
                    Zi(e, y, h);
                    break;
                case 3:
                case 4:
                    var C = n.stateNode.containerInfo
                      , L = yu(e);
                    vu(e, L, C);
                    break;
                default:
                    throw Error(u(161))
                }
            } catch (U) {
                Oe(e, e.return, U)
            }
            e.flags &= -3
        }
        t & 4096 && (e.flags &= -4097)
    }
    function Gd(e) {
        if (e.subtreeFlags & 1024)
            for (e = e.child; e !== null; ) {
                var t = e;
                Gd(t),
                t.tag === 5 && t.flags & 1024 && t.stateNode.reset(),
                e = e.sibling
            }
    }
    function ln(e, t) {
        if (t.subtreeFlags & 8772)
            for (t = t.child; t !== null; )
                Md(e, t.alternate, t),
                t = t.sibling
    }
    function el(e) {
        for (e = e.child; e !== null; ) {
            var t = e;
            switch (t.tag) {
            case 0:
            case 11:
            case 14:
            case 15:
                _n(4, t, t.return),
                el(t);
                break;
            case 1:
                Bt(t, t.return);
                var n = t.stateNode;
                typeof n.componentWillUnmount == "function" && Nd(t, t.return, n),
                el(t);
                break;
            case 27:
                Da(t.stateNode);
            case 26:
            case 5:
                Bt(t, t.return),
                el(t);
                break;
            case 22:
                t.memoizedState === null && el(t);
                break;
            case 30:
                el(t);
                break;
            default:
                el(t)
            }
            e = e.sibling
        }
    }
    function an(e, t, n) {
        for (n = n && (t.subtreeFlags & 8772) !== 0,
        t = t.child; t !== null; ) {
            var l = t.alternate
              , s = e
              , o = t
              , h = o.flags;
            switch (o.tag) {
            case 0:
            case 11:
            case 15:
                an(s, o, n),
                wa(4, o);
                break;
            case 1:
                if (an(s, o, n),
                l = o,
                s = l.stateNode,
                typeof s.componentDidMount == "function")
                    try {
                        s.componentDidMount()
                    } catch (L) {
                        Oe(l, l.return, L)
                    }
                if (l = o,
                s = l.updateQueue,
                s !== null) {
                    var y = l.stateNode;
                    try {
                        var C = s.shared.hiddenCallbacks;
                        if (C !== null)
                            for (s.shared.hiddenCallbacks = null,
                            s = 0; s < C.length; s++)
                                yf(C[s], y)
                    } catch (L) {
                        Oe(l, l.return, L)
                    }
                }
                n && h & 64 && Ad(o),
                _a(o, o.return);
                break;
            case 27:
                jd(o);
            case 26:
            case 5:
                an(s, o, n),
                n && l === null && h & 4 && Rd(o),
                _a(o, o.return);
                break;
            case 12:
                an(s, o, n);
                break;
            case 31:
                an(s, o, n),
                n && h & 4 && Hd(s, o);
                break;
            case 13:
                an(s, o, n),
                n && h & 4 && Bd(s, o);
                break;
            case 22:
                o.memoizedState === null && an(s, o, n),
                _a(o, o.return);
                break;
            case 30:
                break;
            default:
                an(s, o, n)
            }
            t = t.sibling
        }
    }
    function xu(e, t) {
        var n = null;
        e !== null && e.memoizedState !== null && e.memoizedState.cachePool !== null && (n = e.memoizedState.cachePool.pool),
        e = null,
        t.memoizedState !== null && t.memoizedState.cachePool !== null && (e = t.memoizedState.cachePool.pool),
        e !== n && (e != null && e.refCount++,
        n != null && ca(n))
    }
    function Su(e, t) {
        e = null,
        t.alternate !== null && (e = t.alternate.memoizedState.cache),
        t = t.memoizedState.cache,
        t !== e && (t.refCount++,
        e != null && ca(e))
    }
    function Mt(e, t, n, l) {
        if (t.subtreeFlags & 10256)
            for (t = t.child; t !== null; )
                Yd(e, t, n, l),
                t = t.sibling
    }
    function Yd(e, t, n, l) {
        var s = t.flags;
        switch (t.tag) {
        case 0:
        case 11:
        case 15:
            Mt(e, t, n, l),
            s & 2048 && wa(9, t);
            break;
        case 1:
            Mt(e, t, n, l);
            break;
        case 3:
            Mt(e, t, n, l),
            s & 2048 && (e = null,
            t.alternate !== null && (e = t.alternate.memoizedState.cache),
            t = t.memoizedState.cache,
            t !== e && (t.refCount++,
            e != null && ca(e)));
            break;
        case 12:
            if (s & 2048) {
                Mt(e, t, n, l),
                e = t.stateNode;
                try {
                    var o = t.memoizedProps
                      , h = o.id
                      , y = o.onPostCommit;
                    typeof y == "function" && y(h, t.alternate === null ? "mount" : "update", e.passiveEffectDuration, -0)
                } catch (C) {
                    Oe(t, t.return, C)
                }
            } else
                Mt(e, t, n, l);
            break;
        case 31:
            Mt(e, t, n, l);
            break;
        case 13:
            Mt(e, t, n, l);
            break;
        case 23:
            break;
        case 22:
            o = t.stateNode,
            h = t.alternate,
            t.memoizedState !== null ? o._visibility & 2 ? Mt(e, t, n, l) : Ca(e, t) : o._visibility & 2 ? Mt(e, t, n, l) : (o._visibility |= 2,
            Nl(e, t, n, l, (t.subtreeFlags & 10256) !== 0 || !1)),
            s & 2048 && xu(h, t);
            break;
        case 24:
            Mt(e, t, n, l),
            s & 2048 && Su(t.alternate, t);
            break;
        default:
            Mt(e, t, n, l)
        }
    }
    function Nl(e, t, n, l, s) {
        for (s = s && ((t.subtreeFlags & 10256) !== 0 || !1),
        t = t.child; t !== null; ) {
            var o = e
              , h = t
              , y = n
              , C = l
              , L = h.flags;
            switch (h.tag) {
            case 0:
            case 11:
            case 15:
                Nl(o, h, y, C, s),
                wa(8, h);
                break;
            case 23:
                break;
            case 22:
                var U = h.stateNode;
                h.memoizedState !== null ? U._visibility & 2 ? Nl(o, h, y, C, s) : Ca(o, h) : (U._visibility |= 2,
                Nl(o, h, y, C, s)),
                s && L & 2048 && xu(h.alternate, h);
                break;
            case 24:
                Nl(o, h, y, C, s),
                s && L & 2048 && Su(h.alternate, h);
                break;
            default:
                Nl(o, h, y, C, s)
            }
            t = t.sibling
        }
    }
    function Ca(e, t) {
        if (t.subtreeFlags & 10256)
            for (t = t.child; t !== null; ) {
                var n = e
                  , l = t
                  , s = l.flags;
                switch (l.tag) {
                case 22:
                    Ca(n, l),
                    s & 2048 && xu(l.alternate, l);
                    break;
                case 24:
                    Ca(n, l),
                    s & 2048 && Su(l.alternate, l);
                    break;
                default:
                    Ca(n, l)
                }
                t = t.sibling
            }
    }
    var Ta = 8192;
    function Rl(e, t, n) {
        if (e.subtreeFlags & Ta)
            for (e = e.child; e !== null; )
                Vd(e, t, n),
                e = e.sibling
    }
    function Vd(e, t, n) {
        switch (e.tag) {
        case 26:
            Rl(e, t, n),
            e.flags & Ta && e.memoizedState !== null && T0(n, Dt, e.memoizedState, e.memoizedProps);
            break;
        case 5:
            Rl(e, t, n);
            break;
        case 3:
        case 4:
            var l = Dt;
            Dt = rs(e.stateNode.containerInfo),
            Rl(e, t, n),
            Dt = l;
            break;
        case 22:
            e.memoizedState === null && (l = e.alternate,
            l !== null && l.memoizedState !== null ? (l = Ta,
            Ta = 16777216,
            Rl(e, t, n),
            Ta = l) : Rl(e, t, n));
            break;
        default:
            Rl(e, t, n)
        }
    }
    function Qd(e) {
        var t = e.alternate;
        if (t !== null && (e = t.child,
        e !== null)) {
            t.child = null;
            do
                t = e.sibling,
                e.sibling = null,
                e = t;
            while (e !== null)
        }
    }
    function Oa(e) {
        var t = e.deletions;
        if ((e.flags & 16) !== 0) {
            if (t !== null)
                for (var n = 0; n < t.length; n++) {
                    var l = t[n];
                    Ke = l,
                    Xd(l, e)
                }
            Qd(e)
        }
        if (e.subtreeFlags & 10256)
            for (e = e.child; e !== null; )
                kd(e),
                e = e.sibling
    }
    function kd(e) {
        switch (e.tag) {
        case 0:
        case 11:
        case 15:
            Oa(e),
            e.flags & 2048 && _n(9, e, e.return);
            break;
        case 3:
            Oa(e);
            break;
        case 12:
            Oa(e);
            break;
        case 22:
            var t = e.stateNode;
            e.memoizedState !== null && t._visibility & 2 && (e.return === null || e.return.tag !== 13) ? (t._visibility &= -3,
            Fi(e)) : Oa(e);
            break;
        default:
            Oa(e)
        }
    }
    function Fi(e) {
        var t = e.deletions;
        if ((e.flags & 16) !== 0) {
            if (t !== null)
                for (var n = 0; n < t.length; n++) {
                    var l = t[n];
                    Ke = l,
                    Xd(l, e)
                }
            Qd(e)
        }
        for (e = e.child; e !== null; ) {
            switch (t = e,
            t.tag) {
            case 0:
            case 11:
            case 15:
                _n(8, t, t.return),
                Fi(t);
                break;
            case 22:
                n = t.stateNode,
                n._visibility & 2 && (n._visibility &= -3,
                Fi(t));
                break;
            default:
                Fi(t)
            }
            e = e.sibling
        }
    }
    function Xd(e, t) {
        for (; Ke !== null; ) {
            var n = Ke;
            switch (n.tag) {
            case 0:
            case 11:
            case 15:
                _n(8, n, t);
                break;
            case 23:
            case 22:
                if (n.memoizedState !== null && n.memoizedState.cachePool !== null) {
                    var l = n.memoizedState.cachePool.pool;
                    l != null && l.refCount++
                }
                break;
            case 24:
                ca(n.memoizedState.cache)
            }
            if (l = n.child,
            l !== null)
                l.return = n,
                Ke = l;
            else
                e: for (n = e; Ke !== null; ) {
                    l = Ke;
                    var s = l.sibling
                      , o = l.return;
                    if (zd(l),
                    l === n) {
                        Ke = null;
                        break e
                    }
                    if (s !== null) {
                        s.return = o,
                        Ke = s;
                        break e
                    }
                    Ke = o
                }
        }
    }
    var Yy = {
        getCacheForType: function(e) {
            var t = We(Ge)
              , n = t.data.get(e);
            return n === void 0 && (n = e(),
            t.data.set(e, n)),
            n
        },
        cacheSignal: function() {
            return We(Ge).controller.signal
        }
    }
      , Vy = typeof WeakMap == "function" ? WeakMap : Map
      , Ee = 0
      , Le = null
      , he = null
      , ge = 0
      , Te = 0
      , vt = null
      , Cn = !1
      , Ll = !1
      , Eu = !1
      , sn = 0
      , Ue = 0
      , Tn = 0
      , tl = 0
      , wu = 0
      , bt = 0
      , jl = 0
      , Aa = null
      , ot = null
      , _u = !1
      , Ji = 0
      , Zd = 0
      , $i = 1 / 0
      , Wi = null
      , On = null
      , ke = 0
      , An = null
      , Dl = null
      , rn = 0
      , Cu = 0
      , Tu = null
      , Kd = null
      , Na = 0
      , Ou = null;
    function xt() {
        return (Ee & 2) !== 0 && ge !== 0 ? ge & -ge : z.T !== null ? Du() : uc()
    }
    function Fd() {
        if (bt === 0)
            if ((ge & 536870912) === 0 || ve) {
                var e = ii;
                ii <<= 1,
                (ii & 3932160) === 0 && (ii = 262144),
                bt = e
            } else
                bt = 536870912;
        return e = pt.current,
        e !== null && (e.flags |= 32),
        bt
    }
    function ct(e, t, n) {
        (e === Le && (Te === 2 || Te === 9) || e.cancelPendingCommit !== null) && (Ml(e, 0),
        Nn(e, ge, bt, !1)),
        $l(e, n),
        ((Ee & 2) === 0 || e !== Le) && (e === Le && ((Ee & 2) === 0 && (tl |= n),
        Ue === 4 && Nn(e, ge, bt, !1)),
        qt(e))
    }
    function Jd(e, t, n) {
        if ((Ee & 6) !== 0)
            throw Error(u(327));
        var l = !n && (t & 127) === 0 && (t & e.expiredLanes) === 0 || Jl(e, t)
          , s = l ? Xy(e, t) : Nu(e, t, !0)
          , o = l;
        do {
            if (s === 0) {
                Ll && !l && Nn(e, t, 0, !1);
                break
            } else {
                if (n = e.current.alternate,
                o && !Qy(n)) {
                    s = Nu(e, t, !1),
                    o = !1;
                    continue
                }
                if (s === 2) {
                    if (o = t,
                    e.errorRecoveryDisabledLanes & o)
                        var h = 0;
                    else
                        h = e.pendingLanes & -536870913,
                        h = h !== 0 ? h : h & 536870912 ? 536870912 : 0;
                    if (h !== 0) {
                        t = h;
                        e: {
                            var y = e;
                            s = Aa;
                            var C = y.current.memoizedState.isDehydrated;
                            if (C && (Ml(y, h).flags |= 256),
                            h = Nu(y, h, !1),
                            h !== 2) {
                                if (Eu && !C) {
                                    y.errorRecoveryDisabledLanes |= o,
                                    tl |= o,
                                    s = 4;
                                    break e
                                }
                                o = ot,
                                ot = s,
                                o !== null && (ot === null ? ot = o : ot.push.apply(ot, o))
                            }
                            s = h
                        }
                        if (o = !1,
                        s !== 2)
                            continue
                    }
                }
                if (s === 1) {
                    Ml(e, 0),
                    Nn(e, t, 0, !0);
                    break
                }
                e: {
                    switch (l = e,
                    o = s,
                    o) {
                    case 0:
                    case 1:
                        throw Error(u(345));
                    case 4:
                        if ((t & 4194048) !== t)
                            break;
                    case 6:
                        Nn(l, t, bt, !Cn);
                        break e;
                    case 2:
                        ot = null;
                        break;
                    case 3:
                    case 5:
                        break;
                    default:
                        throw Error(u(329))
                    }
                    if ((t & 62914560) === t && (s = Ji + 300 - ft(),
                    10 < s)) {
                        if (Nn(l, t, bt, !Cn),
                        ri(l, 0, !0) !== 0)
                            break e;
                        rn = t,
                        l.timeoutHandle = Th($d.bind(null, l, n, ot, Wi, _u, t, bt, tl, jl, Cn, o, "Throttled", -0, 0), s);
                        break e
                    }
                    $d(l, n, ot, Wi, _u, t, bt, tl, jl, Cn, o, null, -0, 0)
                }
            }
            break
        } while (!0);
        qt(e)
    }
    function $d(e, t, n, l, s, o, h, y, C, L, U, Y, j, M) {
        if (e.timeoutHandle = -1,
        Y = t.subtreeFlags,
        Y & 8192 || (Y & 16785408) === 16785408) {
            Y = {
                stylesheets: null,
                count: 0,
                imgCount: 0,
                imgBytes: 0,
                suspenseyImages: [],
                waitingForImages: !0,
                waitingForViewTransition: !1,
                unsuspend: Xt
            },
            Vd(t, o, Y);
            var $ = (o & 62914560) === o ? Ji - ft() : (o & 4194048) === o ? Zd - ft() : 0;
            if ($ = O0(Y, $),
            $ !== null) {
                rn = o,
                e.cancelPendingCommit = $(ah.bind(null, e, t, o, n, l, s, h, y, C, U, Y, null, j, M)),
                Nn(e, o, h, !L);
                return
            }
        }
        ah(e, t, o, n, l, s, h, y, C)
    }
    function Qy(e) {
        for (var t = e; ; ) {
            var n = t.tag;
            if ((n === 0 || n === 11 || n === 15) && t.flags & 16384 && (n = t.updateQueue,
            n !== null && (n = n.stores,
            n !== null)))
                for (var l = 0; l < n.length; l++) {
                    var s = n[l]
                      , o = s.getSnapshot;
                    s = s.value;
                    try {
                        if (!mt(o(), s))
                            return !1
                    } catch {
                        return !1
                    }
                }
            if (n = t.child,
            t.subtreeFlags & 16384 && n !== null)
                n.return = t,
                t = n;
            else {
                if (t === e)
                    break;
                for (; t.sibling === null; ) {
                    if (t.return === null || t.return === e)
                        return !0;
                    t = t.return
                }
                t.sibling.return = t.return,
                t = t.sibling
            }
        }
        return !0
    }
    function Nn(e, t, n, l) {
        t &= ~wu,
        t &= ~tl,
        e.suspendedLanes |= t,
        e.pingedLanes &= ~t,
        l && (e.warmLanes |= t),
        l = e.expirationTimes;
        for (var s = t; 0 < s; ) {
            var o = 31 - ht(s)
              , h = 1 << o;
            l[o] = -1,
            s &= ~h
        }
        n !== 0 && ic(e, n, t)
    }
    function Pi() {
        return (Ee & 6) === 0 ? (Ra(0),
        !1) : !0
    }
    function Au() {
        if (he !== null) {
            if (Te === 0)
                var e = he.return;
            else
                e = he,
                Jt = Zn = null,
                kr(e),
                _l = null,
                da = 0,
                e = he;
            for (; e !== null; )
                Od(e.alternate, e),
                e = e.return;
            he = null
        }
    }
    function Ml(e, t) {
        var n = e.timeoutHandle;
        n !== -1 && (e.timeoutHandle = -1,
        o0(n)),
        n = e.cancelPendingCommit,
        n !== null && (e.cancelPendingCommit = null,
        n()),
        rn = 0,
        Au(),
        Le = e,
        he = n = Kt(e.current, null),
        ge = t,
        Te = 0,
        vt = null,
        Cn = !1,
        Ll = Jl(e, t),
        Eu = !1,
        jl = bt = wu = tl = Tn = Ue = 0,
        ot = Aa = null,
        _u = !1,
        (t & 8) !== 0 && (t |= t & 32);
        var l = e.entangledLanes;
        if (l !== 0)
            for (e = e.entanglements,
            l &= t; 0 < l; ) {
                var s = 31 - ht(l)
                  , o = 1 << s;
                t |= e[s],
                l &= ~o
            }
        return sn = t,
        bi(),
        n
    }
    function Wd(e, t) {
        re = null,
        z.H = xa,
        t === wl || t === Oi ? (t = hf(),
        Te = 3) : t === jr ? (t = hf(),
        Te = 4) : Te = t === su ? 8 : t !== null && typeof t == "object" && typeof t.then == "function" ? 6 : 1,
        vt = t,
        he === null && (Ue = 1,
        Yi(e, _t(t, e.current)))
    }
    function Pd() {
        var e = pt.current;
        return e === null ? !0 : (ge & 4194048) === ge ? At === null : (ge & 62914560) === ge || (ge & 536870912) !== 0 ? e === At : !1
    }
    function Id() {
        var e = z.H;
        return z.H = xa,
        e === null ? xa : e
    }
    function eh() {
        var e = z.A;
        return z.A = Yy,
        e
    }
    function Ii() {
        Ue = 4,
        Cn || (ge & 4194048) !== ge && pt.current !== null || (Ll = !0),
        (Tn & 134217727) === 0 && (tl & 134217727) === 0 || Le === null || Nn(Le, ge, bt, !1)
    }
    function Nu(e, t, n) {
        var l = Ee;
        Ee |= 2;
        var s = Id()
          , o = eh();
        (Le !== e || ge !== t) && (Wi = null,
        Ml(e, t)),
        t = !1;
        var h = Ue;
        e: do
            try {
                if (Te !== 0 && he !== null) {
                    var y = he
                      , C = vt;
                    switch (Te) {
                    case 8:
                        Au(),
                        h = 6;
                        break e;
                    case 3:
                    case 2:
                    case 9:
                    case 6:
                        pt.current === null && (t = !0);
                        var L = Te;
                        if (Te = 0,
                        vt = null,
                        zl(e, y, C, L),
                        n && Ll) {
                            h = 0;
                            break e
                        }
                        break;
                    default:
                        L = Te,
                        Te = 0,
                        vt = null,
                        zl(e, y, C, L)
                    }
                }
                ky(),
                h = Ue;
                break
            } catch (U) {
                Wd(e, U)
            }
        while (!0);
        return t && e.shellSuspendCounter++,
        Jt = Zn = null,
        Ee = l,
        z.H = s,
        z.A = o,
        he === null && (Le = null,
        ge = 0,
        bi()),
        h
    }
    function ky() {
        for (; he !== null; )
            th(he)
    }
    function Xy(e, t) {
        var n = Ee;
        Ee |= 2;
        var l = Id()
          , s = eh();
        Le !== e || ge !== t ? (Wi = null,
        $i = ft() + 500,
        Ml(e, t)) : Ll = Jl(e, t);
        e: do
            try {
                if (Te !== 0 && he !== null) {
                    t = he;
                    var o = vt;
                    t: switch (Te) {
                    case 1:
                        Te = 0,
                        vt = null,
                        zl(e, t, o, 1);
                        break;
                    case 2:
                    case 9:
                        if (ff(o)) {
                            Te = 0,
                            vt = null,
                            nh(t);
                            break
                        }
                        t = function() {
                            Te !== 2 && Te !== 9 || Le !== e || (Te = 7),
                            qt(e)
                        }
                        ,
                        o.then(t, t);
                        break e;
                    case 3:
                        Te = 7;
                        break e;
                    case 4:
                        Te = 5;
                        break e;
                    case 7:
                        ff(o) ? (Te = 0,
                        vt = null,
                        nh(t)) : (Te = 0,
                        vt = null,
                        zl(e, t, o, 7));
                        break;
                    case 5:
                        var h = null;
                        switch (he.tag) {
                        case 26:
                            h = he.memoizedState;
                        case 5:
                        case 27:
                            var y = he;
                            if (h ? Yh(h) : y.stateNode.complete) {
                                Te = 0,
                                vt = null;
                                var C = y.sibling;
                                if (C !== null)
                                    he = C;
                                else {
                                    var L = y.return;
                                    L !== null ? (he = L,
                                    es(L)) : he = null
                                }
                                break t
                            }
                        }
                        Te = 0,
                        vt = null,
                        zl(e, t, o, 5);
                        break;
                    case 6:
                        Te = 0,
                        vt = null,
                        zl(e, t, o, 6);
                        break;
                    case 8:
                        Au(),
                        Ue = 6;
                        break e;
                    default:
                        throw Error(u(462))
                    }
                }
                Zy();
                break
            } catch (U) {
                Wd(e, U)
            }
        while (!0);
        return Jt = Zn = null,
        z.H = l,
        z.A = s,
        Ee = n,
        he !== null ? 0 : (Le = null,
        ge = 0,
        bi(),
        Ue)
    }
    function Zy() {
        for (; he !== null && !gp(); )
            th(he)
    }
    function th(e) {
        var t = Cd(e.alternate, e, sn);
        e.memoizedProps = e.pendingProps,
        t === null ? es(e) : he = t
    }
    function nh(e) {
        var t = e
          , n = t.alternate;
        switch (t.tag) {
        case 15:
        case 0:
            t = bd(n, t, t.pendingProps, t.type, void 0, ge);
            break;
        case 11:
            t = bd(n, t, t.pendingProps, t.type.render, t.ref, ge);
            break;
        case 5:
            kr(t);
        default:
            Od(n, t),
            t = he = Ic(t, sn),
            t = Cd(n, t, sn)
        }
        e.memoizedProps = e.pendingProps,
        t === null ? es(e) : he = t
    }
    function zl(e, t, n, l) {
        Jt = Zn = null,
        kr(t),
        _l = null,
        da = 0;
        var s = t.return;
        try {
            if (My(e, s, t, n, ge)) {
                Ue = 1,
                Yi(e, _t(n, e.current)),
                he = null;
                return
            }
        } catch (o) {
            if (s !== null)
                throw he = s,
                o;
            Ue = 1,
            Yi(e, _t(n, e.current)),
            he = null;
            return
        }
        t.flags & 32768 ? (ve || l === 1 ? e = !0 : Ll || (ge & 536870912) !== 0 ? e = !1 : (Cn = e = !0,
        (l === 2 || l === 9 || l === 3 || l === 6) && (l = pt.current,
        l !== null && l.tag === 13 && (l.flags |= 16384))),
        lh(t, e)) : es(t)
    }
    function es(e) {
        var t = e;
        do {
            if ((t.flags & 32768) !== 0) {
                lh(t, Cn);
                return
            }
            e = t.return;
            var n = Hy(t.alternate, t, sn);
            if (n !== null) {
                he = n;
                return
            }
            if (t = t.sibling,
            t !== null) {
                he = t;
                return
            }
            he = t = e
        } while (t !== null);
        Ue === 0 && (Ue = 5)
    }
    function lh(e, t) {
        do {
            var n = By(e.alternate, e);
            if (n !== null) {
                n.flags &= 32767,
                he = n;
                return
            }
            if (n = e.return,
            n !== null && (n.flags |= 32768,
            n.subtreeFlags = 0,
            n.deletions = null),
            !t && (e = e.sibling,
            e !== null)) {
                he = e;
                return
            }
            he = e = n
        } while (e !== null);
        Ue = 6,
        he = null
    }
    function ah(e, t, n, l, s, o, h, y, C) {
        e.cancelPendingCommit = null;
        do
            ts();
        while (ke !== 0);
        if ((Ee & 6) !== 0)
            throw Error(u(327));
        if (t !== null) {
            if (t === e.current)
                throw Error(u(177));
            if (o = t.lanes | t.childLanes,
            o |= yr,
            Cp(e, n, o, h, y, C),
            e === Le && (he = Le = null,
            ge = 0),
            Dl = t,
            An = e,
            rn = n,
            Cu = o,
            Tu = s,
            Kd = l,
            (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? (e.callbackNode = null,
            e.callbackPriority = 0,
            $y(li, function() {
                return oh(),
                null
            })) : (e.callbackNode = null,
            e.callbackPriority = 0),
            l = (t.flags & 13878) !== 0,
            (t.subtreeFlags & 13878) !== 0 || l) {
                l = z.T,
                z.T = null,
                s = k.p,
                k.p = 2,
                h = Ee,
                Ee |= 4;
                try {
                    qy(e, t, n)
                } finally {
                    Ee = h,
                    k.p = s,
                    z.T = l
                }
            }
            ke = 1,
            ih(),
            sh(),
            rh()
        }
    }
    function ih() {
        if (ke === 1) {
            ke = 0;
            var e = An
              , t = Dl
              , n = (t.flags & 13878) !== 0;
            if ((t.subtreeFlags & 13878) !== 0 || n) {
                n = z.T,
                z.T = null;
                var l = k.p;
                k.p = 2;
                var s = Ee;
                Ee |= 4;
                try {
                    qd(t, e);
                    var o = Yu
                      , h = kc(e.containerInfo)
                      , y = o.focusedElem
                      , C = o.selectionRange;
                    if (h !== y && y && y.ownerDocument && Qc(y.ownerDocument.documentElement, y)) {
                        if (C !== null && dr(y)) {
                            var L = C.start
                              , U = C.end;
                            if (U === void 0 && (U = L),
                            "selectionStart"in y)
                                y.selectionStart = L,
                                y.selectionEnd = Math.min(U, y.value.length);
                            else {
                                var Y = y.ownerDocument || document
                                  , j = Y && Y.defaultView || window;
                                if (j.getSelection) {
                                    var M = j.getSelection()
                                      , $ = y.textContent.length
                                      , le = Math.min(C.start, $)
                                      , Re = C.end === void 0 ? le : Math.min(C.end, $);
                                    !M.extend && le > Re && (h = Re,
                                    Re = le,
                                    le = h);
                                    var N = Vc(y, le)
                                      , O = Vc(y, Re);
                                    if (N && O && (M.rangeCount !== 1 || M.anchorNode !== N.node || M.anchorOffset !== N.offset || M.focusNode !== O.node || M.focusOffset !== O.offset)) {
                                        var R = Y.createRange();
                                        R.setStart(N.node, N.offset),
                                        M.removeAllRanges(),
                                        le > Re ? (M.addRange(R),
                                        M.extend(O.node, O.offset)) : (R.setEnd(O.node, O.offset),
                                        M.addRange(R))
                                    }
                                }
                            }
                        }
                        for (Y = [],
                        M = y; M = M.parentNode; )
                            M.nodeType === 1 && Y.push({
                                element: M,
                                left: M.scrollLeft,
                                top: M.scrollTop
                            });
                        for (typeof y.focus == "function" && y.focus(),
                        y = 0; y < Y.length; y++) {
                            var q = Y[y];
                            q.element.scrollLeft = q.left,
                            q.element.scrollTop = q.top
                        }
                    }
                    hs = !!Gu,
                    Yu = Gu = null
                } finally {
                    Ee = s,
                    k.p = l,
                    z.T = n
                }
            }
            e.current = t,
            ke = 2
        }
    }
    function sh() {
        if (ke === 2) {
            ke = 0;
            var e = An
              , t = Dl
              , n = (t.flags & 8772) !== 0;
            if ((t.subtreeFlags & 8772) !== 0 || n) {
                n = z.T,
                z.T = null;
                var l = k.p;
                k.p = 2;
                var s = Ee;
                Ee |= 4;
                try {
                    Md(e, t.alternate, t)
                } finally {
                    Ee = s,
                    k.p = l,
                    z.T = n
                }
            }
            ke = 3
        }
    }
    function rh() {
        if (ke === 4 || ke === 3) {
            ke = 0,
            pp();
            var e = An
              , t = Dl
              , n = rn
              , l = Kd;
            (t.subtreeFlags & 10256) !== 0 || (t.flags & 10256) !== 0 ? ke = 5 : (ke = 0,
            Dl = An = null,
            uh(e, e.pendingLanes));
            var s = e.pendingLanes;
            if (s === 0 && (On = null),
            Ks(n),
            t = t.stateNode,
            dt && typeof dt.onCommitFiberRoot == "function")
                try {
                    dt.onCommitFiberRoot(Fl, t, void 0, (t.current.flags & 128) === 128)
                } catch {}
            if (l !== null) {
                t = z.T,
                s = k.p,
                k.p = 2,
                z.T = null;
                try {
                    for (var o = e.onRecoverableError, h = 0; h < l.length; h++) {
                        var y = l[h];
                        o(y.value, {
                            componentStack: y.stack
                        })
                    }
                } finally {
                    z.T = t,
                    k.p = s
                }
            }
            (rn & 3) !== 0 && ts(),
            qt(e),
            s = e.pendingLanes,
            (n & 261930) !== 0 && (s & 42) !== 0 ? e === Ou ? Na++ : (Na = 0,
            Ou = e) : Na = 0,
            Ra(0)
        }
    }
    function uh(e, t) {
        (e.pooledCacheLanes &= t) === 0 && (t = e.pooledCache,
        t != null && (e.pooledCache = null,
        ca(t)))
    }
    function ts() {
        return ih(),
        sh(),
        rh(),
        oh()
    }
    function oh() {
        if (ke !== 5)
            return !1;
        var e = An
          , t = Cu;
        Cu = 0;
        var n = Ks(rn)
          , l = z.T
          , s = k.p;
        try {
            k.p = 32 > n ? 32 : n,
            z.T = null,
            n = Tu,
            Tu = null;
            var o = An
              , h = rn;
            if (ke = 0,
            Dl = An = null,
            rn = 0,
            (Ee & 6) !== 0)
                throw Error(u(331));
            var y = Ee;
            if (Ee |= 4,
            kd(o.current),
            Yd(o, o.current, h, n),
            Ee = y,
            Ra(0, !1),
            dt && typeof dt.onPostCommitFiberRoot == "function")
                try {
                    dt.onPostCommitFiberRoot(Fl, o)
                } catch {}
            return !0
        } finally {
            k.p = s,
            z.T = l,
            uh(e, t)
        }
    }
    function ch(e, t, n) {
        t = _t(n, t),
        t = iu(e.stateNode, t, 2),
        e = Sn(e, t, 2),
        e !== null && ($l(e, 2),
        qt(e))
    }
    function Oe(e, t, n) {
        if (e.tag === 3)
            ch(e, e, n);
        else
            for (; t !== null; ) {
                if (t.tag === 3) {
                    ch(t, e, n);
                    break
                } else if (t.tag === 1) {
                    var l = t.stateNode;
                    if (typeof t.type.getDerivedStateFromError == "function" || typeof l.componentDidCatch == "function" && (On === null || !On.has(l))) {
                        e = _t(n, e),
                        n = fd(2),
                        l = Sn(t, n, 2),
                        l !== null && (dd(n, l, t, e),
                        $l(l, 2),
                        qt(l));
                        break
                    }
                }
                t = t.return
            }
    }
    function Ru(e, t, n) {
        var l = e.pingCache;
        if (l === null) {
            l = e.pingCache = new Vy;
            var s = new Set;
            l.set(t, s)
        } else
            s = l.get(t),
            s === void 0 && (s = new Set,
            l.set(t, s));
        s.has(n) || (Eu = !0,
        s.add(n),
        e = Ky.bind(null, e, t, n),
        t.then(e, e))
    }
    function Ky(e, t, n) {
        var l = e.pingCache;
        l !== null && l.delete(t),
        e.pingedLanes |= e.suspendedLanes & n,
        e.warmLanes &= ~n,
        Le === e && (ge & n) === n && (Ue === 4 || Ue === 3 && (ge & 62914560) === ge && 300 > ft() - Ji ? (Ee & 2) === 0 && Ml(e, 0) : wu |= n,
        jl === ge && (jl = 0)),
        qt(e)
    }
    function fh(e, t) {
        t === 0 && (t = ac()),
        e = Qn(e, t),
        e !== null && ($l(e, t),
        qt(e))
    }
    function Fy(e) {
        var t = e.memoizedState
          , n = 0;
        t !== null && (n = t.retryLane),
        fh(e, n)
    }
    function Jy(e, t) {
        var n = 0;
        switch (e.tag) {
        case 31:
        case 13:
            var l = e.stateNode
              , s = e.memoizedState;
            s !== null && (n = s.retryLane);
            break;
        case 19:
            l = e.stateNode;
            break;
        case 22:
            l = e.stateNode._retryCache;
            break;
        default:
            throw Error(u(314))
        }
        l !== null && l.delete(t),
        fh(e, n)
    }
    function $y(e, t) {
        return Qs(e, t)
    }
    var ns = null
      , Ul = null
      , Lu = !1
      , ls = !1
      , ju = !1
      , Rn = 0;
    function qt(e) {
        e !== Ul && e.next === null && (Ul === null ? ns = Ul = e : Ul = Ul.next = e),
        ls = !0,
        Lu || (Lu = !0,
        Py())
    }
    function Ra(e, t) {
        if (!ju && ls) {
            ju = !0;
            do
                for (var n = !1, l = ns; l !== null; ) {
                    if (e !== 0) {
                        var s = l.pendingLanes;
                        if (s === 0)
                            var o = 0;
                        else {
                            var h = l.suspendedLanes
                              , y = l.pingedLanes;
                            o = (1 << 31 - ht(42 | e) + 1) - 1,
                            o &= s & ~(h & ~y),
                            o = o & 201326741 ? o & 201326741 | 1 : o ? o | 2 : 0
                        }
                        o !== 0 && (n = !0,
                        gh(l, o))
                    } else
                        o = ge,
                        o = ri(l, l === Le ? o : 0, l.cancelPendingCommit !== null || l.timeoutHandle !== -1),
                        (o & 3) === 0 || Jl(l, o) || (n = !0,
                        gh(l, o));
                    l = l.next
                }
            while (n);
            ju = !1
        }
    }
    function Wy() {
        dh()
    }
    function dh() {
        ls = Lu = !1;
        var e = 0;
        Rn !== 0 && u0() && (e = Rn);
        for (var t = ft(), n = null, l = ns; l !== null; ) {
            var s = l.next
              , o = hh(l, t);
            o === 0 ? (l.next = null,
            n === null ? ns = s : n.next = s,
            s === null && (Ul = n)) : (n = l,
            (e !== 0 || (o & 3) !== 0) && (ls = !0)),
            l = s
        }
        ke !== 0 && ke !== 5 || Ra(e),
        Rn !== 0 && (Rn = 0)
    }
    function hh(e, t) {
        for (var n = e.suspendedLanes, l = e.pingedLanes, s = e.expirationTimes, o = e.pendingLanes & -62914561; 0 < o; ) {
            var h = 31 - ht(o)
              , y = 1 << h
              , C = s[h];
            C === -1 ? ((y & n) === 0 || (y & l) !== 0) && (s[h] = _p(y, t)) : C <= t && (e.expiredLanes |= y),
            o &= ~y
        }
        if (t = Le,
        n = ge,
        n = ri(e, e === t ? n : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1),
        l = e.callbackNode,
        n === 0 || e === t && (Te === 2 || Te === 9) || e.cancelPendingCommit !== null)
            return l !== null && l !== null && ks(l),
            e.callbackNode = null,
            e.callbackPriority = 0;
        if ((n & 3) === 0 || Jl(e, n)) {
            if (t = n & -n,
            t === e.callbackPriority)
                return t;
            switch (l !== null && ks(l),
            Ks(n)) {
            case 2:
            case 8:
                n = nc;
                break;
            case 32:
                n = li;
                break;
            case 268435456:
                n = lc;
                break;
            default:
                n = li
            }
            return l = mh.bind(null, e),
            n = Qs(n, l),
            e.callbackPriority = t,
            e.callbackNode = n,
            t
        }
        return l !== null && l !== null && ks(l),
        e.callbackPriority = 2,
        e.callbackNode = null,
        2
    }
    function mh(e, t) {
        if (ke !== 0 && ke !== 5)
            return e.callbackNode = null,
            e.callbackPriority = 0,
            null;
        var n = e.callbackNode;
        if (ts() && e.callbackNode !== n)
            return null;
        var l = ge;
        return l = ri(e, e === Le ? l : 0, e.cancelPendingCommit !== null || e.timeoutHandle !== -1),
        l === 0 ? null : (Jd(e, l, t),
        hh(e, ft()),
        e.callbackNode != null && e.callbackNode === n ? mh.bind(null, e) : null)
    }
    function gh(e, t) {
        if (ts())
            return null;
        Jd(e, t, !0)
    }
    function Py() {
        c0(function() {
            (Ee & 6) !== 0 ? Qs(tc, Wy) : dh()
        })
    }
    function Du() {
        if (Rn === 0) {
            var e = Sl;
            e === 0 && (e = ai,
            ai <<= 1,
            (ai & 261888) === 0 && (ai = 256)),
            Rn = e
        }
        return Rn
    }
    function ph(e) {
        return e == null || typeof e == "symbol" || typeof e == "boolean" ? null : typeof e == "function" ? e : fi("" + e)
    }
    function yh(e, t) {
        var n = t.ownerDocument.createElement("input");
        return n.name = t.name,
        n.value = t.value,
        e.id && n.setAttribute("form", e.id),
        t.parentNode.insertBefore(n, t),
        e = new FormData(e),
        n.parentNode.removeChild(n),
        e
    }
    function Iy(e, t, n, l, s) {
        if (t === "submit" && n && n.stateNode === s) {
            var o = ph((s[at] || null).action)
              , h = l.submitter;
            h && (t = (t = h[at] || null) ? ph(t.formAction) : h.getAttribute("formAction"),
            t !== null && (o = t,
            h = null));
            var y = new gi("action","action",null,l,s);
            e.push({
                event: y,
                listeners: [{
                    instance: null,
                    listener: function() {
                        if (l.defaultPrevented) {
                            if (Rn !== 0) {
                                var C = h ? yh(s, h) : new FormData(s);
                                Ir(n, {
                                    pending: !0,
                                    data: C,
                                    method: s.method,
                                    action: o
                                }, null, C)
                            }
                        } else
                            typeof o == "function" && (y.preventDefault(),
                            C = h ? yh(s, h) : new FormData(s),
                            Ir(n, {
                                pending: !0,
                                data: C,
                                method: s.method,
                                action: o
                            }, o, C))
                    },
                    currentTarget: s
                }]
            })
        }
    }
    for (var Mu = 0; Mu < pr.length; Mu++) {
        var zu = pr[Mu]
          , e0 = zu.toLowerCase()
          , t0 = zu[0].toUpperCase() + zu.slice(1);
        jt(e0, "on" + t0)
    }
    jt(Kc, "onAnimationEnd"),
    jt(Fc, "onAnimationIteration"),
    jt(Jc, "onAnimationStart"),
    jt("dblclick", "onDoubleClick"),
    jt("focusin", "onFocus"),
    jt("focusout", "onBlur"),
    jt(yy, "onTransitionRun"),
    jt(vy, "onTransitionStart"),
    jt(by, "onTransitionCancel"),
    jt($c, "onTransitionEnd"),
    rl("onMouseEnter", ["mouseout", "mouseover"]),
    rl("onMouseLeave", ["mouseout", "mouseover"]),
    rl("onPointerEnter", ["pointerout", "pointerover"]),
    rl("onPointerLeave", ["pointerout", "pointerover"]),
    qn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" ")),
    qn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" ")),
    qn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]),
    qn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" ")),
    qn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" ")),
    qn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
    var La = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" ")
      , n0 = new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(La));
    function vh(e, t) {
        t = (t & 4) !== 0;
        for (var n = 0; n < e.length; n++) {
            var l = e[n]
              , s = l.event;
            l = l.listeners;
            e: {
                var o = void 0;
                if (t)
                    for (var h = l.length - 1; 0 <= h; h--) {
                        var y = l[h]
                          , C = y.instance
                          , L = y.currentTarget;
                        if (y = y.listener,
                        C !== o && s.isPropagationStopped())
                            break e;
                        o = y,
                        s.currentTarget = L;
                        try {
                            o(s)
                        } catch (U) {
                            vi(U)
                        }
                        s.currentTarget = null,
                        o = C
                    }
                else
                    for (h = 0; h < l.length; h++) {
                        if (y = l[h],
                        C = y.instance,
                        L = y.currentTarget,
                        y = y.listener,
                        C !== o && s.isPropagationStopped())
                            break e;
                        o = y,
                        s.currentTarget = L;
                        try {
                            o(s)
                        } catch (U) {
                            vi(U)
                        }
                        s.currentTarget = null,
                        o = C
                    }
            }
        }
    }
    function me(e, t) {
        var n = t[Fs];
        n === void 0 && (n = t[Fs] = new Set);
        var l = e + "__bubble";
        n.has(l) || (bh(t, e, 2, !1),
        n.add(l))
    }
    function Uu(e, t, n) {
        var l = 0;
        t && (l |= 4),
        bh(n, e, l, t)
    }
    var as = "_reactListening" + Math.random().toString(36).slice(2);
    function Hu(e) {
        if (!e[as]) {
            e[as] = !0,
            fc.forEach(function(n) {
                n !== "selectionchange" && (n0.has(n) || Uu(n, !1, e),
                Uu(n, !0, e))
            });
            var t = e.nodeType === 9 ? e : e.ownerDocument;
            t === null || t[as] || (t[as] = !0,
            Uu("selectionchange", !1, t))
        }
    }
    function bh(e, t, n, l) {
        switch (Fh(t)) {
        case 2:
            var s = R0;
            break;
        case 8:
            s = L0;
            break;
        default:
            s = Pu
        }
        n = s.bind(null, t, n, e),
        s = void 0,
        !lr || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (s = !0),
        l ? s !== void 0 ? e.addEventListener(t, n, {
            capture: !0,
            passive: s
        }) : e.addEventListener(t, n, !0) : s !== void 0 ? e.addEventListener(t, n, {
            passive: s
        }) : e.addEventListener(t, n, !1)
    }
    function Bu(e, t, n, l, s) {
        var o = l;
        if ((t & 1) === 0 && (t & 2) === 0 && l !== null)
            e: for (; ; ) {
                if (l === null)
                    return;
                var h = l.tag;
                if (h === 3 || h === 4) {
                    var y = l.stateNode.containerInfo;
                    if (y === s)
                        break;
                    if (h === 4)
                        for (h = l.return; h !== null; ) {
                            var C = h.tag;
                            if ((C === 3 || C === 4) && h.stateNode.containerInfo === s)
                                return;
                            h = h.return
                        }
                    for (; y !== null; ) {
                        if (h = al(y),
                        h === null)
                            return;
                        if (C = h.tag,
                        C === 5 || C === 6 || C === 26 || C === 27) {
                            l = o = h;
                            continue e
                        }
                        y = y.parentNode
                    }
                }
                l = l.return
            }
        wc(function() {
            var L = o
              , U = tr(n)
              , Y = [];
            e: {
                var j = Wc.get(e);
                if (j !== void 0) {
                    var M = gi
                      , $ = e;
                    switch (e) {
                    case "keypress":
                        if (hi(n) === 0)
                            break e;
                    case "keydown":
                    case "keyup":
                        M = Jp;
                        break;
                    case "focusin":
                        $ = "focus",
                        M = rr;
                        break;
                    case "focusout":
                        $ = "blur",
                        M = rr;
                        break;
                    case "beforeblur":
                    case "afterblur":
                        M = rr;
                        break;
                    case "click":
                        if (n.button === 2)
                            break e;
                    case "auxclick":
                    case "dblclick":
                    case "mousedown":
                    case "mousemove":
                    case "mouseup":
                    case "mouseout":
                    case "mouseover":
                    case "contextmenu":
                        M = Tc;
                        break;
                    case "drag":
                    case "dragend":
                    case "dragenter":
                    case "dragexit":
                    case "dragleave":
                    case "dragover":
                    case "dragstart":
                    case "drop":
                        M = Hp;
                        break;
                    case "touchcancel":
                    case "touchend":
                    case "touchmove":
                    case "touchstart":
                        M = Pp;
                        break;
                    case Kc:
                    case Fc:
                    case Jc:
                        M = Gp;
                        break;
                    case $c:
                        M = ey;
                        break;
                    case "scroll":
                    case "scrollend":
                        M = zp;
                        break;
                    case "wheel":
                        M = ny;
                        break;
                    case "copy":
                    case "cut":
                    case "paste":
                        M = Vp;
                        break;
                    case "gotpointercapture":
                    case "lostpointercapture":
                    case "pointercancel":
                    case "pointerdown":
                    case "pointermove":
                    case "pointerout":
                    case "pointerover":
                    case "pointerup":
                        M = Ac;
                        break;
                    case "toggle":
                    case "beforetoggle":
                        M = ay
                    }
                    var le = (t & 4) !== 0
                      , Re = !le && (e === "scroll" || e === "scrollend")
                      , N = le ? j !== null ? j + "Capture" : null : j;
                    le = [];
                    for (var O = L, R; O !== null; ) {
                        var q = O;
                        if (R = q.stateNode,
                        q = q.tag,
                        q !== 5 && q !== 26 && q !== 27 || R === null || N === null || (q = Il(O, N),
                        q != null && le.push(ja(O, q, R))),
                        Re)
                            break;
                        O = O.return
                    }
                    0 < le.length && (j = new M(j,$,null,n,U),
                    Y.push({
                        event: j,
                        listeners: le
                    }))
                }
            }
            if ((t & 7) === 0) {
                e: {
                    if (j = e === "mouseover" || e === "pointerover",
                    M = e === "mouseout" || e === "pointerout",
                    j && n !== er && ($ = n.relatedTarget || n.fromElement) && (al($) || $[ll]))
                        break e;
                    if ((M || j) && (j = U.window === U ? U : (j = U.ownerDocument) ? j.defaultView || j.parentWindow : window,
                    M ? ($ = n.relatedTarget || n.toElement,
                    M = L,
                    $ = $ ? al($) : null,
                    $ !== null && (Re = f($),
                    le = $.tag,
                    $ !== Re || le !== 5 && le !== 27 && le !== 6) && ($ = null)) : (M = null,
                    $ = L),
                    M !== $)) {
                        if (le = Tc,
                        q = "onMouseLeave",
                        N = "onMouseEnter",
                        O = "mouse",
                        (e === "pointerout" || e === "pointerover") && (le = Ac,
                        q = "onPointerLeave",
                        N = "onPointerEnter",
                        O = "pointer"),
                        Re = M == null ? j : Pl(M),
                        R = $ == null ? j : Pl($),
                        j = new le(q,O + "leave",M,n,U),
                        j.target = Re,
                        j.relatedTarget = R,
                        q = null,
                        al(U) === L && (le = new le(N,O + "enter",$,n,U),
                        le.target = R,
                        le.relatedTarget = Re,
                        q = le),
                        Re = q,
                        M && $)
                            t: {
                                for (le = l0,
                                N = M,
                                O = $,
                                R = 0,
                                q = N; q; q = le(q))
                                    R++;
                                q = 0;
                                for (var ee = O; ee; ee = le(ee))
                                    q++;
                                for (; 0 < R - q; )
                                    N = le(N),
                                    R--;
                                for (; 0 < q - R; )
                                    O = le(O),
                                    q--;
                                for (; R--; ) {
                                    if (N === O || O !== null && N === O.alternate) {
                                        le = N;
                                        break t
                                    }
                                    N = le(N),
                                    O = le(O)
                                }
                                le = null
                            }
                        else
                            le = null;
                        M !== null && xh(Y, j, M, le, !1),
                        $ !== null && Re !== null && xh(Y, Re, $, le, !0)
                    }
                }
                e: {
                    if (j = L ? Pl(L) : window,
                    M = j.nodeName && j.nodeName.toLowerCase(),
                    M === "select" || M === "input" && j.type === "file")
                        var xe = Uc;
                    else if (Mc(j))
                        if (Hc)
                            xe = my;
                        else {
                            xe = dy;
                            var I = fy
                        }
                    else
                        M = j.nodeName,
                        !M || M.toLowerCase() !== "input" || j.type !== "checkbox" && j.type !== "radio" ? L && Is(L.elementType) && (xe = Uc) : xe = hy;
                    if (xe && (xe = xe(e, L))) {
                        zc(Y, xe, n, U);
                        break e
                    }
                    I && I(e, j, L),
                    e === "focusout" && L && j.type === "number" && L.memoizedProps.value != null && Ps(j, "number", j.value)
                }
                switch (I = L ? Pl(L) : window,
                e) {
                case "focusin":
                    (Mc(I) || I.contentEditable === "true") && (hl = I,
                    hr = L,
                    ra = null);
                    break;
                case "focusout":
                    ra = hr = hl = null;
                    break;
                case "mousedown":
                    mr = !0;
                    break;
                case "contextmenu":
                case "mouseup":
                case "dragend":
                    mr = !1,
                    Xc(Y, n, U);
                    break;
                case "selectionchange":
                    if (py)
                        break;
                case "keydown":
                case "keyup":
                    Xc(Y, n, U)
                }
                var ce;
                if (or)
                    e: {
                        switch (e) {
                        case "compositionstart":
                            var pe = "onCompositionStart";
                            break e;
                        case "compositionend":
                            pe = "onCompositionEnd";
                            break e;
                        case "compositionupdate":
                            pe = "onCompositionUpdate";
                            break e
                        }
                        pe = void 0
                    }
                else
                    dl ? jc(e, n) && (pe = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (pe = "onCompositionStart");
                pe && (Nc && n.locale !== "ko" && (dl || pe !== "onCompositionStart" ? pe === "onCompositionEnd" && dl && (ce = _c()) : (mn = U,
                ar = "value"in mn ? mn.value : mn.textContent,
                dl = !0)),
                I = is(L, pe),
                0 < I.length && (pe = new Oc(pe,e,null,n,U),
                Y.push({
                    event: pe,
                    listeners: I
                }),
                ce ? pe.data = ce : (ce = Dc(n),
                ce !== null && (pe.data = ce)))),
                (ce = sy ? ry(e, n) : uy(e, n)) && (pe = is(L, "onBeforeInput"),
                0 < pe.length && (I = new Oc("onBeforeInput","beforeinput",null,n,U),
                Y.push({
                    event: I,
                    listeners: pe
                }),
                I.data = ce)),
                Iy(Y, e, L, n, U)
            }
            vh(Y, t)
        })
    }
    function ja(e, t, n) {
        return {
            instance: e,
            listener: t,
            currentTarget: n
        }
    }
    function is(e, t) {
        for (var n = t + "Capture", l = []; e !== null; ) {
            var s = e
              , o = s.stateNode;
            if (s = s.tag,
            s !== 5 && s !== 26 && s !== 27 || o === null || (s = Il(e, n),
            s != null && l.unshift(ja(e, s, o)),
            s = Il(e, t),
            s != null && l.push(ja(e, s, o))),
            e.tag === 3)
                return l;
            e = e.return
        }
        return []
    }
    function l0(e) {
        if (e === null)
            return null;
        do
            e = e.return;
        while (e && e.tag !== 5 && e.tag !== 27);
        return e || null
    }
    function xh(e, t, n, l, s) {
        for (var o = t._reactName, h = []; n !== null && n !== l; ) {
            var y = n
              , C = y.alternate
              , L = y.stateNode;
            if (y = y.tag,
            C !== null && C === l)
                break;
            y !== 5 && y !== 26 && y !== 27 || L === null || (C = L,
            s ? (L = Il(n, o),
            L != null && h.unshift(ja(n, L, C))) : s || (L = Il(n, o),
            L != null && h.push(ja(n, L, C)))),
            n = n.return
        }
        h.length !== 0 && e.push({
            event: t,
            listeners: h
        })
    }
    var a0 = /\r\n?/g
      , i0 = /\u0000|\uFFFD/g;
    function Sh(e) {
        return (typeof e == "string" ? e : "" + e).replace(a0, `
`).replace(i0, "")
    }
    function Eh(e, t) {
        return t = Sh(t),
        Sh(e) === t
    }
    function Ne(e, t, n, l, s, o) {
        switch (n) {
        case "children":
            typeof l == "string" ? t === "body" || t === "textarea" && l === "" || ol(e, l) : (typeof l == "number" || typeof l == "bigint") && t !== "body" && ol(e, "" + l);
            break;
        case "className":
            oi(e, "class", l);
            break;
        case "tabIndex":
            oi(e, "tabindex", l);
            break;
        case "dir":
        case "role":
        case "viewBox":
        case "width":
        case "height":
            oi(e, n, l);
            break;
        case "style":
            Sc(e, l, o);
            break;
        case "data":
            if (t !== "object") {
                oi(e, "data", l);
                break
            }
        case "src":
        case "href":
            if (l === "" && (t !== "a" || n !== "href")) {
                e.removeAttribute(n);
                break
            }
            if (l == null || typeof l == "function" || typeof l == "symbol" || typeof l == "boolean") {
                e.removeAttribute(n);
                break
            }
            l = fi("" + l),
            e.setAttribute(n, l);
            break;
        case "action":
        case "formAction":
            if (typeof l == "function") {
                e.setAttribute(n, "javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");
                break
            } else
                typeof o == "function" && (n === "formAction" ? (t !== "input" && Ne(e, t, "name", s.name, s, null),
                Ne(e, t, "formEncType", s.formEncType, s, null),
                Ne(e, t, "formMethod", s.formMethod, s, null),
                Ne(e, t, "formTarget", s.formTarget, s, null)) : (Ne(e, t, "encType", s.encType, s, null),
                Ne(e, t, "method", s.method, s, null),
                Ne(e, t, "target", s.target, s, null)));
            if (l == null || typeof l == "symbol" || typeof l == "boolean") {
                e.removeAttribute(n);
                break
            }
            l = fi("" + l),
            e.setAttribute(n, l);
            break;
        case "onClick":
            l != null && (e.onclick = Xt);
            break;
        case "onScroll":
            l != null && me("scroll", e);
            break;
        case "onScrollEnd":
            l != null && me("scrollend", e);
            break;
        case "dangerouslySetInnerHTML":
            if (l != null) {
                if (typeof l != "object" || !("__html"in l))
                    throw Error(u(61));
                if (n = l.__html,
                n != null) {
                    if (s.children != null)
                        throw Error(u(60));
                    e.innerHTML = n
                }
            }
            break;
        case "multiple":
            e.multiple = l && typeof l != "function" && typeof l != "symbol";
            break;
        case "muted":
            e.muted = l && typeof l != "function" && typeof l != "symbol";
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "defaultValue":
        case "defaultChecked":
        case "innerHTML":
        case "ref":
            break;
        case "autoFocus":
            break;
        case "xlinkHref":
            if (l == null || typeof l == "function" || typeof l == "boolean" || typeof l == "symbol") {
                e.removeAttribute("xlink:href");
                break
            }
            n = fi("" + l),
            e.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", n);
            break;
        case "contentEditable":
        case "spellCheck":
        case "draggable":
        case "value":
        case "autoReverse":
        case "externalResourcesRequired":
        case "focusable":
        case "preserveAlpha":
            l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(n, "" + l) : e.removeAttribute(n);
            break;
        case "inert":
        case "allowFullScreen":
        case "async":
        case "autoPlay":
        case "controls":
        case "default":
        case "defer":
        case "disabled":
        case "disablePictureInPicture":
        case "disableRemotePlayback":
        case "formNoValidate":
        case "hidden":
        case "loop":
        case "noModule":
        case "noValidate":
        case "open":
        case "playsInline":
        case "readOnly":
        case "required":
        case "reversed":
        case "scoped":
        case "seamless":
        case "itemScope":
            l && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(n, "") : e.removeAttribute(n);
            break;
        case "capture":
        case "download":
            l === !0 ? e.setAttribute(n, "") : l !== !1 && l != null && typeof l != "function" && typeof l != "symbol" ? e.setAttribute(n, l) : e.removeAttribute(n);
            break;
        case "cols":
        case "rows":
        case "size":
        case "span":
            l != null && typeof l != "function" && typeof l != "symbol" && !isNaN(l) && 1 <= l ? e.setAttribute(n, l) : e.removeAttribute(n);
            break;
        case "rowSpan":
        case "start":
            l == null || typeof l == "function" || typeof l == "symbol" || isNaN(l) ? e.removeAttribute(n) : e.setAttribute(n, l);
            break;
        case "popover":
            me("beforetoggle", e),
            me("toggle", e),
            ui(e, "popover", l);
            break;
        case "xlinkActuate":
            kt(e, "http://www.w3.org/1999/xlink", "xlink:actuate", l);
            break;
        case "xlinkArcrole":
            kt(e, "http://www.w3.org/1999/xlink", "xlink:arcrole", l);
            break;
        case "xlinkRole":
            kt(e, "http://www.w3.org/1999/xlink", "xlink:role", l);
            break;
        case "xlinkShow":
            kt(e, "http://www.w3.org/1999/xlink", "xlink:show", l);
            break;
        case "xlinkTitle":
            kt(e, "http://www.w3.org/1999/xlink", "xlink:title", l);
            break;
        case "xlinkType":
            kt(e, "http://www.w3.org/1999/xlink", "xlink:type", l);
            break;
        case "xmlBase":
            kt(e, "http://www.w3.org/XML/1998/namespace", "xml:base", l);
            break;
        case "xmlLang":
            kt(e, "http://www.w3.org/XML/1998/namespace", "xml:lang", l);
            break;
        case "xmlSpace":
            kt(e, "http://www.w3.org/XML/1998/namespace", "xml:space", l);
            break;
        case "is":
            ui(e, "is", l);
            break;
        case "innerText":
        case "textContent":
            break;
        default:
            (!(2 < n.length) || n[0] !== "o" && n[0] !== "O" || n[1] !== "n" && n[1] !== "N") && (n = Dp.get(n) || n,
            ui(e, n, l))
        }
    }
    function qu(e, t, n, l, s, o) {
        switch (n) {
        case "style":
            Sc(e, l, o);
            break;
        case "dangerouslySetInnerHTML":
            if (l != null) {
                if (typeof l != "object" || !("__html"in l))
                    throw Error(u(61));
                if (n = l.__html,
                n != null) {
                    if (s.children != null)
                        throw Error(u(60));
                    e.innerHTML = n
                }
            }
            break;
        case "children":
            typeof l == "string" ? ol(e, l) : (typeof l == "number" || typeof l == "bigint") && ol(e, "" + l);
            break;
        case "onScroll":
            l != null && me("scroll", e);
            break;
        case "onScrollEnd":
            l != null && me("scrollend", e);
            break;
        case "onClick":
            l != null && (e.onclick = Xt);
            break;
        case "suppressContentEditableWarning":
        case "suppressHydrationWarning":
        case "innerHTML":
        case "ref":
            break;
        case "innerText":
        case "textContent":
            break;
        default:
            if (!dc.hasOwnProperty(n))
                e: {
                    if (n[0] === "o" && n[1] === "n" && (s = n.endsWith("Capture"),
                    t = n.slice(2, s ? n.length - 7 : void 0),
                    o = e[at] || null,
                    o = o != null ? o[n] : null,
                    typeof o == "function" && e.removeEventListener(t, o, s),
                    typeof l == "function")) {
                        typeof o != "function" && o !== null && (n in e ? e[n] = null : e.hasAttribute(n) && e.removeAttribute(n)),
                        e.addEventListener(t, l, s);
                        break e
                    }
                    n in e ? e[n] = l : l === !0 ? e.setAttribute(n, "") : ui(e, n, l)
                }
        }
    }
    function Ie(e, t, n) {
        switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
            break;
        case "img":
            me("error", e),
            me("load", e);
            var l = !1, s = !1, o;
            for (o in n)
                if (n.hasOwnProperty(o)) {
                    var h = n[o];
                    if (h != null)
                        switch (o) {
                        case "src":
                            l = !0;
                            break;
                        case "srcSet":
                            s = !0;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            throw Error(u(137, t));
                        default:
                            Ne(e, t, o, h, n, null)
                        }
                }
            s && Ne(e, t, "srcSet", n.srcSet, n, null),
            l && Ne(e, t, "src", n.src, n, null);
            return;
        case "input":
            me("invalid", e);
            var y = o = h = s = null
              , C = null
              , L = null;
            for (l in n)
                if (n.hasOwnProperty(l)) {
                    var U = n[l];
                    if (U != null)
                        switch (l) {
                        case "name":
                            s = U;
                            break;
                        case "type":
                            h = U;
                            break;
                        case "checked":
                            C = U;
                            break;
                        case "defaultChecked":
                            L = U;
                            break;
                        case "value":
                            o = U;
                            break;
                        case "defaultValue":
                            y = U;
                            break;
                        case "children":
                        case "dangerouslySetInnerHTML":
                            if (U != null)
                                throw Error(u(137, t));
                            break;
                        default:
                            Ne(e, t, l, U, n, null)
                        }
                }
            yc(e, o, y, C, L, h, s, !1);
            return;
        case "select":
            me("invalid", e),
            l = h = o = null;
            for (s in n)
                if (n.hasOwnProperty(s) && (y = n[s],
                y != null))
                    switch (s) {
                    case "value":
                        o = y;
                        break;
                    case "defaultValue":
                        h = y;
                        break;
                    case "multiple":
                        l = y;
                    default:
                        Ne(e, t, s, y, n, null)
                    }
            t = o,
            n = h,
            e.multiple = !!l,
            t != null ? ul(e, !!l, t, !1) : n != null && ul(e, !!l, n, !0);
            return;
        case "textarea":
            me("invalid", e),
            o = s = l = null;
            for (h in n)
                if (n.hasOwnProperty(h) && (y = n[h],
                y != null))
                    switch (h) {
                    case "value":
                        l = y;
                        break;
                    case "defaultValue":
                        s = y;
                        break;
                    case "children":
                        o = y;
                        break;
                    case "dangerouslySetInnerHTML":
                        if (y != null)
                            throw Error(u(91));
                        break;
                    default:
                        Ne(e, t, h, y, n, null)
                    }
            bc(e, l, s, o);
            return;
        case "option":
            for (C in n)
                n.hasOwnProperty(C) && (l = n[C],
                l != null) && (C === "selected" ? e.selected = l && typeof l != "function" && typeof l != "symbol" : Ne(e, t, C, l, n, null));
            return;
        case "dialog":
            me("beforetoggle", e),
            me("toggle", e),
            me("cancel", e),
            me("close", e);
            break;
        case "iframe":
        case "object":
            me("load", e);
            break;
        case "video":
        case "audio":
            for (l = 0; l < La.length; l++)
                me(La[l], e);
            break;
        case "image":
            me("error", e),
            me("load", e);
            break;
        case "details":
            me("toggle", e);
            break;
        case "embed":
        case "source":
        case "link":
            me("error", e),
            me("load", e);
        case "area":
        case "base":
        case "br":
        case "col":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "track":
        case "wbr":
        case "menuitem":
            for (L in n)
                if (n.hasOwnProperty(L) && (l = n[L],
                l != null))
                    switch (L) {
                    case "children":
                    case "dangerouslySetInnerHTML":
                        throw Error(u(137, t));
                    default:
                        Ne(e, t, L, l, n, null)
                    }
            return;
        default:
            if (Is(t)) {
                for (U in n)
                    n.hasOwnProperty(U) && (l = n[U],
                    l !== void 0 && qu(e, t, U, l, n, void 0));
                return
            }
        }
        for (y in n)
            n.hasOwnProperty(y) && (l = n[y],
            l != null && Ne(e, t, y, l, n, null))
    }
    function s0(e, t, n, l) {
        switch (t) {
        case "div":
        case "span":
        case "svg":
        case "path":
        case "a":
        case "g":
        case "p":
        case "li":
            break;
        case "input":
            var s = null
              , o = null
              , h = null
              , y = null
              , C = null
              , L = null
              , U = null;
            for (M in n) {
                var Y = n[M];
                if (n.hasOwnProperty(M) && Y != null)
                    switch (M) {
                    case "checked":
                        break;
                    case "value":
                        break;
                    case "defaultValue":
                        C = Y;
                    default:
                        l.hasOwnProperty(M) || Ne(e, t, M, null, l, Y)
                    }
            }
            for (var j in l) {
                var M = l[j];
                if (Y = n[j],
                l.hasOwnProperty(j) && (M != null || Y != null))
                    switch (j) {
                    case "type":
                        o = M;
                        break;
                    case "name":
                        s = M;
                        break;
                    case "checked":
                        L = M;
                        break;
                    case "defaultChecked":
                        U = M;
                        break;
                    case "value":
                        h = M;
                        break;
                    case "defaultValue":
                        y = M;
                        break;
                    case "children":
                    case "dangerouslySetInnerHTML":
                        if (M != null)
                            throw Error(u(137, t));
                        break;
                    default:
                        M !== Y && Ne(e, t, j, M, l, Y)
                    }
            }
            Ws(e, h, y, C, L, U, o, s);
            return;
        case "select":
            M = h = y = j = null;
            for (o in n)
                if (C = n[o],
                n.hasOwnProperty(o) && C != null)
                    switch (o) {
                    case "value":
                        break;
                    case "multiple":
                        M = C;
                    default:
                        l.hasOwnProperty(o) || Ne(e, t, o, null, l, C)
                    }
            for (s in l)
                if (o = l[s],
                C = n[s],
                l.hasOwnProperty(s) && (o != null || C != null))
                    switch (s) {
                    case "value":
                        j = o;
                        break;
                    case "defaultValue":
                        y = o;
                        break;
                    case "multiple":
                        h = o;
                    default:
                        o !== C && Ne(e, t, s, o, l, C)
                    }
            t = y,
            n = h,
            l = M,
            j != null ? ul(e, !!n, j, !1) : !!l != !!n && (t != null ? ul(e, !!n, t, !0) : ul(e, !!n, n ? [] : "", !1));
            return;
        case "textarea":
            M = j = null;
            for (y in n)
                if (s = n[y],
                n.hasOwnProperty(y) && s != null && !l.hasOwnProperty(y))
                    switch (y) {
                    case "value":
                        break;
                    case "children":
                        break;
                    default:
                        Ne(e, t, y, null, l, s)
                    }
            for (h in l)
                if (s = l[h],
                o = n[h],
                l.hasOwnProperty(h) && (s != null || o != null))
                    switch (h) {
                    case "value":
                        j = s;
                        break;
                    case "defaultValue":
                        M = s;
                        break;
                    case "children":
                        break;
                    case "dangerouslySetInnerHTML":
                        if (s != null)
                            throw Error(u(91));
                        break;
                    default:
                        s !== o && Ne(e, t, h, s, l, o)
                    }
            vc(e, j, M);
            return;
        case "option":
            for (var $ in n)
                j = n[$],
                n.hasOwnProperty($) && j != null && !l.hasOwnProperty($) && ($ === "selected" ? e.selected = !1 : Ne(e, t, $, null, l, j));
            for (C in l)
                j = l[C],
                M = n[C],
                l.hasOwnProperty(C) && j !== M && (j != null || M != null) && (C === "selected" ? e.selected = j && typeof j != "function" && typeof j != "symbol" : Ne(e, t, C, j, l, M));
            return;
        case "img":
        case "link":
        case "area":
        case "base":
        case "br":
        case "col":
        case "embed":
        case "hr":
        case "keygen":
        case "meta":
        case "param":
        case "source":
        case "track":
        case "wbr":
        case "menuitem":
            for (var le in n)
                j = n[le],
                n.hasOwnProperty(le) && j != null && !l.hasOwnProperty(le) && Ne(e, t, le, null, l, j);
            for (L in l)
                if (j = l[L],
                M = n[L],
                l.hasOwnProperty(L) && j !== M && (j != null || M != null))
                    switch (L) {
                    case "children":
                    case "dangerouslySetInnerHTML":
                        if (j != null)
                            throw Error(u(137, t));
                        break;
                    default:
                        Ne(e, t, L, j, l, M)
                    }
            return;
        default:
            if (Is(t)) {
                for (var Re in n)
                    j = n[Re],
                    n.hasOwnProperty(Re) && j !== void 0 && !l.hasOwnProperty(Re) && qu(e, t, Re, void 0, l, j);
                for (U in l)
                    j = l[U],
                    M = n[U],
                    !l.hasOwnProperty(U) || j === M || j === void 0 && M === void 0 || qu(e, t, U, j, l, M);
                return
            }
        }
        for (var N in n)
            j = n[N],
            n.hasOwnProperty(N) && j != null && !l.hasOwnProperty(N) && Ne(e, t, N, null, l, j);
        for (Y in l)
            j = l[Y],
            M = n[Y],
            !l.hasOwnProperty(Y) || j === M || j == null && M == null || Ne(e, t, Y, j, l, M)
    }
    function wh(e) {
        switch (e) {
        case "css":
        case "script":
        case "font":
        case "img":
        case "image":
        case "input":
        case "link":
            return !0;
        default:
            return !1
        }
    }
    function r0() {
        if (typeof performance.getEntriesByType == "function") {
            for (var e = 0, t = 0, n = performance.getEntriesByType("resource"), l = 0; l < n.length; l++) {
                var s = n[l]
                  , o = s.transferSize
                  , h = s.initiatorType
                  , y = s.duration;
                if (o && y && wh(h)) {
                    for (h = 0,
                    y = s.responseEnd,
                    l += 1; l < n.length; l++) {
                        var C = n[l]
                          , L = C.startTime;
                        if (L > y)
                            break;
                        var U = C.transferSize
                          , Y = C.initiatorType;
                        U && wh(Y) && (C = C.responseEnd,
                        h += U * (C < y ? 1 : (y - L) / (C - L)))
                    }
                    if (--l,
                    t += 8 * (o + h) / (s.duration / 1e3),
                    e++,
                    10 < e)
                        break
                }
            }
            if (0 < e)
                return t / e / 1e6
        }
        return navigator.connection && (e = navigator.connection.downlink,
        typeof e == "number") ? e : 5
    }
    var Gu = null
      , Yu = null;
    function ss(e) {
        return e.nodeType === 9 ? e : e.ownerDocument
    }
    function _h(e) {
        switch (e) {
        case "http://www.w3.org/2000/svg":
            return 1;
        case "http://www.w3.org/1998/Math/MathML":
            return 2;
        default:
            return 0
        }
    }
    function Ch(e, t) {
        if (e === 0)
            switch (t) {
            case "svg":
                return 1;
            case "math":
                return 2;
            default:
                return 0
            }
        return e === 1 && t === "foreignObject" ? 0 : e
    }
    function Vu(e, t) {
        return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.children == "bigint" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null
    }
    var Qu = null;
    function u0() {
        var e = window.event;
        return e && e.type === "popstate" ? e === Qu ? !1 : (Qu = e,
        !0) : (Qu = null,
        !1)
    }
    var Th = typeof setTimeout == "function" ? setTimeout : void 0
      , o0 = typeof clearTimeout == "function" ? clearTimeout : void 0
      , Oh = typeof Promise == "function" ? Promise : void 0
      , c0 = typeof queueMicrotask == "function" ? queueMicrotask : typeof Oh < "u" ? function(e) {
        return Oh.resolve(null).then(e).catch(f0)
    }
    : Th;
    function f0(e) {
        setTimeout(function() {
            throw e
        })
    }
    function Ln(e) {
        return e === "head"
    }
    function Ah(e, t) {
        var n = t
          , l = 0;
        do {
            var s = n.nextSibling;
            if (e.removeChild(n),
            s && s.nodeType === 8)
                if (n = s.data,
                n === "/$" || n === "/&") {
                    if (l === 0) {
                        e.removeChild(s),
                        Gl(t);
                        return
                    }
                    l--
                } else if (n === "$" || n === "$?" || n === "$~" || n === "$!" || n === "&")
                    l++;
                else if (n === "html")
                    Da(e.ownerDocument.documentElement);
                else if (n === "head") {
                    n = e.ownerDocument.head,
                    Da(n);
                    for (var o = n.firstChild; o; ) {
                        var h = o.nextSibling
                          , y = o.nodeName;
                        o[Wl] || y === "SCRIPT" || y === "STYLE" || y === "LINK" && o.rel.toLowerCase() === "stylesheet" || n.removeChild(o),
                        o = h
                    }
                } else
                    n === "body" && Da(e.ownerDocument.body);
            n = s
        } while (n);
        Gl(t)
    }
    function Nh(e, t) {
        var n = e;
        e = 0;
        do {
            var l = n.nextSibling;
            if (n.nodeType === 1 ? t ? (n._stashedDisplay = n.style.display,
            n.style.display = "none") : (n.style.display = n._stashedDisplay || "",
            n.getAttribute("style") === "" && n.removeAttribute("style")) : n.nodeType === 3 && (t ? (n._stashedText = n.nodeValue,
            n.nodeValue = "") : n.nodeValue = n._stashedText || ""),
            l && l.nodeType === 8)
                if (n = l.data,
                n === "/$") {
                    if (e === 0)
                        break;
                    e--
                } else
                    n !== "$" && n !== "$?" && n !== "$~" && n !== "$!" || e++;
            n = l
        } while (n)
    }
    function ku(e) {
        var t = e.firstChild;
        for (t && t.nodeType === 10 && (t = t.nextSibling); t; ) {
            var n = t;
            switch (t = t.nextSibling,
            n.nodeName) {
            case "HTML":
            case "HEAD":
            case "BODY":
                ku(n),
                Js(n);
                continue;
            case "SCRIPT":
            case "STYLE":
                continue;
            case "LINK":
                if (n.rel.toLowerCase() === "stylesheet")
                    continue
            }
            e.removeChild(n)
        }
    }
    function d0(e, t, n, l) {
        for (; e.nodeType === 1; ) {
            var s = n;
            if (e.nodeName.toLowerCase() !== t.toLowerCase()) {
                if (!l && (e.nodeName !== "INPUT" || e.type !== "hidden"))
                    break
            } else if (l) {
                if (!e[Wl])
                    switch (t) {
                    case "meta":
                        if (!e.hasAttribute("itemprop"))
                            break;
                        return e;
                    case "link":
                        if (o = e.getAttribute("rel"),
                        o === "stylesheet" && e.hasAttribute("data-precedence"))
                            break;
                        if (o !== s.rel || e.getAttribute("href") !== (s.href == null || s.href === "" ? null : s.href) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin) || e.getAttribute("title") !== (s.title == null ? null : s.title))
                            break;
                        return e;
                    case "style":
                        if (e.hasAttribute("data-precedence"))
                            break;
                        return e;
                    case "script":
                        if (o = e.getAttribute("src"),
                        (o !== (s.src == null ? null : s.src) || e.getAttribute("type") !== (s.type == null ? null : s.type) || e.getAttribute("crossorigin") !== (s.crossOrigin == null ? null : s.crossOrigin)) && o && e.hasAttribute("async") && !e.hasAttribute("itemprop"))
                            break;
                        return e;
                    default:
                        return e
                    }
            } else if (t === "input" && e.type === "hidden") {
                var o = s.name == null ? null : "" + s.name;
                if (s.type === "hidden" && e.getAttribute("name") === o)
                    return e
            } else
                return e;
            if (e = Nt(e.nextSibling),
            e === null)
                break
        }
        return null
    }
    function h0(e, t, n) {
        if (t === "")
            return null;
        for (; e.nodeType !== 3; )
            if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !n || (e = Nt(e.nextSibling),
            e === null))
                return null;
        return e
    }
    function Rh(e, t) {
        for (; e.nodeType !== 8; )
            if ((e.nodeType !== 1 || e.nodeName !== "INPUT" || e.type !== "hidden") && !t || (e = Nt(e.nextSibling),
            e === null))
                return null;
        return e
    }
    function Xu(e) {
        return e.data === "$?" || e.data === "$~"
    }
    function Zu(e) {
        return e.data === "$!" || e.data === "$?" && e.ownerDocument.readyState !== "loading"
    }
    function m0(e, t) {
        var n = e.ownerDocument;
        if (e.data === "$~")
            e._reactRetry = t;
        else if (e.data !== "$?" || n.readyState !== "loading")
            t();
        else {
            var l = function() {
                t(),
                n.removeEventListener("DOMContentLoaded", l)
            };
            n.addEventListener("DOMContentLoaded", l),
            e._reactRetry = l
        }
    }
    function Nt(e) {
        for (; e != null; e = e.nextSibling) {
            var t = e.nodeType;
            if (t === 1 || t === 3)
                break;
            if (t === 8) {
                if (t = e.data,
                t === "$" || t === "$!" || t === "$?" || t === "$~" || t === "&" || t === "F!" || t === "F")
                    break;
                if (t === "/$" || t === "/&")
                    return null
            }
        }
        return e
    }
    var Ku = null;
    function Lh(e) {
        e = e.nextSibling;
        for (var t = 0; e; ) {
            if (e.nodeType === 8) {
                var n = e.data;
                if (n === "/$" || n === "/&") {
                    if (t === 0)
                        return Nt(e.nextSibling);
                    t--
                } else
                    n !== "$" && n !== "$!" && n !== "$?" && n !== "$~" && n !== "&" || t++
            }
            e = e.nextSibling
        }
        return null
    }
    function jh(e) {
        e = e.previousSibling;
        for (var t = 0; e; ) {
            if (e.nodeType === 8) {
                var n = e.data;
                if (n === "$" || n === "$!" || n === "$?" || n === "$~" || n === "&") {
                    if (t === 0)
                        return e;
                    t--
                } else
                    n !== "/$" && n !== "/&" || t++
            }
            e = e.previousSibling
        }
        return null
    }
    function Dh(e, t, n) {
        switch (t = ss(n),
        e) {
        case "html":
            if (e = t.documentElement,
            !e)
                throw Error(u(452));
            return e;
        case "head":
            if (e = t.head,
            !e)
                throw Error(u(453));
            return e;
        case "body":
            if (e = t.body,
            !e)
                throw Error(u(454));
            return e;
        default:
            throw Error(u(451))
        }
    }
    function Da(e) {
        for (var t = e.attributes; t.length; )
            e.removeAttributeNode(t[0]);
        Js(e)
    }
    var Rt = new Map
      , Mh = new Set;
    function rs(e) {
        return typeof e.getRootNode == "function" ? e.getRootNode() : e.nodeType === 9 ? e : e.ownerDocument
    }
    var un = k.d;
    k.d = {
        f: g0,
        r: p0,
        D: y0,
        C: v0,
        L: b0,
        m: x0,
        X: E0,
        S: S0,
        M: w0
    };
    function g0() {
        var e = un.f()
          , t = Pi();
        return e || t
    }
    function p0(e) {
        var t = il(e);
        t !== null && t.tag === 5 && t.type === "form" ? Wf(t) : un.r(e)
    }
    var Hl = typeof document > "u" ? null : document;
    function zh(e, t, n) {
        var l = Hl;
        if (l && typeof t == "string" && t) {
            var s = Et(t);
            s = 'link[rel="' + e + '"][href="' + s + '"]',
            typeof n == "string" && (s += '[crossorigin="' + n + '"]'),
            Mh.has(s) || (Mh.add(s),
            e = {
                rel: e,
                crossOrigin: n,
                href: t
            },
            l.querySelector(s) === null && (t = l.createElement("link"),
            Ie(t, "link", e),
            Ze(t),
            l.head.appendChild(t)))
        }
    }
    function y0(e) {
        un.D(e),
        zh("dns-prefetch", e, null)
    }
    function v0(e, t) {
        un.C(e, t),
        zh("preconnect", e, t)
    }
    function b0(e, t, n) {
        un.L(e, t, n);
        var l = Hl;
        if (l && e && t) {
            var s = 'link[rel="preload"][as="' + Et(t) + '"]';
            t === "image" && n && n.imageSrcSet ? (s += '[imagesrcset="' + Et(n.imageSrcSet) + '"]',
            typeof n.imageSizes == "string" && (s += '[imagesizes="' + Et(n.imageSizes) + '"]')) : s += '[href="' + Et(e) + '"]';
            var o = s;
            switch (t) {
            case "style":
                o = Bl(e);
                break;
            case "script":
                o = ql(e)
            }
            Rt.has(o) || (e = v({
                rel: "preload",
                href: t === "image" && n && n.imageSrcSet ? void 0 : e,
                as: t
            }, n),
            Rt.set(o, e),
            l.querySelector(s) !== null || t === "style" && l.querySelector(Ma(o)) || t === "script" && l.querySelector(za(o)) || (t = l.createElement("link"),
            Ie(t, "link", e),
            Ze(t),
            l.head.appendChild(t)))
        }
    }
    function x0(e, t) {
        un.m(e, t);
        var n = Hl;
        if (n && e) {
            var l = t && typeof t.as == "string" ? t.as : "script"
              , s = 'link[rel="modulepreload"][as="' + Et(l) + '"][href="' + Et(e) + '"]'
              , o = s;
            switch (l) {
            case "audioworklet":
            case "paintworklet":
            case "serviceworker":
            case "sharedworker":
            case "worker":
            case "script":
                o = ql(e)
            }
            if (!Rt.has(o) && (e = v({
                rel: "modulepreload",
                href: e
            }, t),
            Rt.set(o, e),
            n.querySelector(s) === null)) {
                switch (l) {
                case "audioworklet":
                case "paintworklet":
                case "serviceworker":
                case "sharedworker":
                case "worker":
                case "script":
                    if (n.querySelector(za(o)))
                        return
                }
                l = n.createElement("link"),
                Ie(l, "link", e),
                Ze(l),
                n.head.appendChild(l)
            }
        }
    }
    function S0(e, t, n) {
        un.S(e, t, n);
        var l = Hl;
        if (l && e) {
            var s = sl(l).hoistableStyles
              , o = Bl(e);
            t = t || "default";
            var h = s.get(o);
            if (!h) {
                var y = {
                    loading: 0,
                    preload: null
                };
                if (h = l.querySelector(Ma(o)))
                    y.loading = 5;
                else {
                    e = v({
                        rel: "stylesheet",
                        href: e,
                        "data-precedence": t
                    }, n),
                    (n = Rt.get(o)) && Fu(e, n);
                    var C = h = l.createElement("link");
                    Ze(C),
                    Ie(C, "link", e),
                    C._p = new Promise(function(L, U) {
                        C.onload = L,
                        C.onerror = U
                    }
                    ),
                    C.addEventListener("load", function() {
                        y.loading |= 1
                    }),
                    C.addEventListener("error", function() {
                        y.loading |= 2
                    }),
                    y.loading |= 4,
                    us(h, t, l)
                }
                h = {
                    type: "stylesheet",
                    instance: h,
                    count: 1,
                    state: y
                },
                s.set(o, h)
            }
        }
    }
    function E0(e, t) {
        un.X(e, t);
        var n = Hl;
        if (n && e) {
            var l = sl(n).hoistableScripts
              , s = ql(e)
              , o = l.get(s);
            o || (o = n.querySelector(za(s)),
            o || (e = v({
                src: e,
                async: !0
            }, t),
            (t = Rt.get(s)) && Ju(e, t),
            o = n.createElement("script"),
            Ze(o),
            Ie(o, "link", e),
            n.head.appendChild(o)),
            o = {
                type: "script",
                instance: o,
                count: 1,
                state: null
            },
            l.set(s, o))
        }
    }
    function w0(e, t) {
        un.M(e, t);
        var n = Hl;
        if (n && e) {
            var l = sl(n).hoistableScripts
              , s = ql(e)
              , o = l.get(s);
            o || (o = n.querySelector(za(s)),
            o || (e = v({
                src: e,
                async: !0,
                type: "module"
            }, t),
            (t = Rt.get(s)) && Ju(e, t),
            o = n.createElement("script"),
            Ze(o),
            Ie(o, "link", e),
            n.head.appendChild(o)),
            o = {
                type: "script",
                instance: o,
                count: 1,
                state: null
            },
            l.set(s, o))
        }
    }
    function Uh(e, t, n, l) {
        var s = (s = de.current) ? rs(s) : null;
        if (!s)
            throw Error(u(446));
        switch (e) {
        case "meta":
        case "title":
            return null;
        case "style":
            return typeof n.precedence == "string" && typeof n.href == "string" ? (t = Bl(n.href),
            n = sl(s).hoistableStyles,
            l = n.get(t),
            l || (l = {
                type: "style",
                instance: null,
                count: 0,
                state: null
            },
            n.set(t, l)),
            l) : {
                type: "void",
                instance: null,
                count: 0,
                state: null
            };
        case "link":
            if (n.rel === "stylesheet" && typeof n.href == "string" && typeof n.precedence == "string") {
                e = Bl(n.href);
                var o = sl(s).hoistableStyles
                  , h = o.get(e);
                if (h || (s = s.ownerDocument || s,
                h = {
                    type: "stylesheet",
                    instance: null,
                    count: 0,
                    state: {
                        loading: 0,
                        preload: null
                    }
                },
                o.set(e, h),
                (o = s.querySelector(Ma(e))) && !o._p && (h.instance = o,
                h.state.loading = 5),
                Rt.has(e) || (n = {
                    rel: "preload",
                    as: "style",
                    href: n.href,
                    crossOrigin: n.crossOrigin,
                    integrity: n.integrity,
                    media: n.media,
                    hrefLang: n.hrefLang,
                    referrerPolicy: n.referrerPolicy
                },
                Rt.set(e, n),
                o || _0(s, e, n, h.state))),
                t && l === null)
                    throw Error(u(528, ""));
                return h
            }
            if (t && l !== null)
                throw Error(u(529, ""));
            return null;
        case "script":
            return t = n.async,
            n = n.src,
            typeof n == "string" && t && typeof t != "function" && typeof t != "symbol" ? (t = ql(n),
            n = sl(s).hoistableScripts,
            l = n.get(t),
            l || (l = {
                type: "script",
                instance: null,
                count: 0,
                state: null
            },
            n.set(t, l)),
            l) : {
                type: "void",
                instance: null,
                count: 0,
                state: null
            };
        default:
            throw Error(u(444, e))
        }
    }
    function Bl(e) {
        return 'href="' + Et(e) + '"'
    }
    function Ma(e) {
        return 'link[rel="stylesheet"][' + e + "]"
    }
    function Hh(e) {
        return v({}, e, {
            "data-precedence": e.precedence,
            precedence: null
        })
    }
    function _0(e, t, n, l) {
        e.querySelector('link[rel="preload"][as="style"][' + t + "]") ? l.loading = 1 : (t = e.createElement("link"),
        l.preload = t,
        t.addEventListener("load", function() {
            return l.loading |= 1
        }),
        t.addEventListener("error", function() {
            return l.loading |= 2
        }),
        Ie(t, "link", n),
        Ze(t),
        e.head.appendChild(t))
    }
    function ql(e) {
        return '[src="' + Et(e) + '"]'
    }
    function za(e) {
        return "script[async]" + e
    }
    function Bh(e, t, n) {
        if (t.count++,
        t.instance === null)
            switch (t.type) {
            case "style":
                var l = e.querySelector('style[data-href~="' + Et(n.href) + '"]');
                if (l)
                    return t.instance = l,
                    Ze(l),
                    l;
                var s = v({}, n, {
                    "data-href": n.href,
                    "data-precedence": n.precedence,
                    href: null,
                    precedence: null
                });
                return l = (e.ownerDocument || e).createElement("style"),
                Ze(l),
                Ie(l, "style", s),
                us(l, n.precedence, e),
                t.instance = l;
            case "stylesheet":
                s = Bl(n.href);
                var o = e.querySelector(Ma(s));
                if (o)
                    return t.state.loading |= 4,
                    t.instance = o,
                    Ze(o),
                    o;
                l = Hh(n),
                (s = Rt.get(s)) && Fu(l, s),
                o = (e.ownerDocument || e).createElement("link"),
                Ze(o);
                var h = o;
                return h._p = new Promise(function(y, C) {
                    h.onload = y,
                    h.onerror = C
                }
                ),
                Ie(o, "link", l),
                t.state.loading |= 4,
                us(o, n.precedence, e),
                t.instance = o;
            case "script":
                return o = ql(n.src),
                (s = e.querySelector(za(o))) ? (t.instance = s,
                Ze(s),
                s) : (l = n,
                (s = Rt.get(o)) && (l = v({}, n),
                Ju(l, s)),
                e = e.ownerDocument || e,
                s = e.createElement("script"),
                Ze(s),
                Ie(s, "link", l),
                e.head.appendChild(s),
                t.instance = s);
            case "void":
                return null;
            default:
                throw Error(u(443, t.type))
            }
        else
            t.type === "stylesheet" && (t.state.loading & 4) === 0 && (l = t.instance,
            t.state.loading |= 4,
            us(l, n.precedence, e));
        return t.instance
    }
    function us(e, t, n) {
        for (var l = n.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'), s = l.length ? l[l.length - 1] : null, o = s, h = 0; h < l.length; h++) {
            var y = l[h];
            if (y.dataset.precedence === t)
                o = y;
            else if (o !== s)
                break
        }
        o ? o.parentNode.insertBefore(e, o.nextSibling) : (t = n.nodeType === 9 ? n.head : n,
        t.insertBefore(e, t.firstChild))
    }
    function Fu(e, t) {
        e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
        e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
        e.title == null && (e.title = t.title)
    }
    function Ju(e, t) {
        e.crossOrigin == null && (e.crossOrigin = t.crossOrigin),
        e.referrerPolicy == null && (e.referrerPolicy = t.referrerPolicy),
        e.integrity == null && (e.integrity = t.integrity)
    }
    var os = null;
    function qh(e, t, n) {
        if (os === null) {
            var l = new Map
              , s = os = new Map;
            s.set(n, l)
        } else
            s = os,
            l = s.get(n),
            l || (l = new Map,
            s.set(n, l));
        if (l.has(e))
            return l;
        for (l.set(e, null),
        n = n.getElementsByTagName(e),
        s = 0; s < n.length; s++) {
            var o = n[s];
            if (!(o[Wl] || o[Je] || e === "link" && o.getAttribute("rel") === "stylesheet") && o.namespaceURI !== "http://www.w3.org/2000/svg") {
                var h = o.getAttribute(t) || "";
                h = e + h;
                var y = l.get(h);
                y ? y.push(o) : l.set(h, [o])
            }
        }
        return l
    }
    function Gh(e, t, n) {
        e = e.ownerDocument || e,
        e.head.insertBefore(n, t === "title" ? e.querySelector("head > title") : null)
    }
    function C0(e, t, n) {
        if (n === 1 || t.itemProp != null)
            return !1;
        switch (e) {
        case "meta":
        case "title":
            return !0;
        case "style":
            if (typeof t.precedence != "string" || typeof t.href != "string" || t.href === "")
                break;
            return !0;
        case "link":
            if (typeof t.rel != "string" || typeof t.href != "string" || t.href === "" || t.onLoad || t.onError)
                break;
            return t.rel === "stylesheet" ? (e = t.disabled,
            typeof t.precedence == "string" && e == null) : !0;
        case "script":
            if (t.async && typeof t.async != "function" && typeof t.async != "symbol" && !t.onLoad && !t.onError && t.src && typeof t.src == "string")
                return !0
        }
        return !1
    }
    function Yh(e) {
        return !(e.type === "stylesheet" && (e.state.loading & 3) === 0)
    }
    function T0(e, t, n, l) {
        if (n.type === "stylesheet" && (typeof l.media != "string" || matchMedia(l.media).matches !== !1) && (n.state.loading & 4) === 0) {
            if (n.instance === null) {
                var s = Bl(l.href)
                  , o = t.querySelector(Ma(s));
                if (o) {
                    t = o._p,
                    t !== null && typeof t == "object" && typeof t.then == "function" && (e.count++,
                    e = cs.bind(e),
                    t.then(e, e)),
                    n.state.loading |= 4,
                    n.instance = o,
                    Ze(o);
                    return
                }
                o = t.ownerDocument || t,
                l = Hh(l),
                (s = Rt.get(s)) && Fu(l, s),
                o = o.createElement("link"),
                Ze(o);
                var h = o;
                h._p = new Promise(function(y, C) {
                    h.onload = y,
                    h.onerror = C
                }
                ),
                Ie(o, "link", l),
                n.instance = o
            }
            e.stylesheets === null && (e.stylesheets = new Map),
            e.stylesheets.set(n, t),
            (t = n.state.preload) && (n.state.loading & 3) === 0 && (e.count++,
            n = cs.bind(e),
            t.addEventListener("load", n),
            t.addEventListener("error", n))
        }
    }
    var $u = 0;
    function O0(e, t) {
        return e.stylesheets && e.count === 0 && ds(e, e.stylesheets),
        0 < e.count || 0 < e.imgCount ? function(n) {
            var l = setTimeout(function() {
                if (e.stylesheets && ds(e, e.stylesheets),
                e.unsuspend) {
                    var o = e.unsuspend;
                    e.unsuspend = null,
                    o()
                }
            }, 6e4 + t);
            0 < e.imgBytes && $u === 0 && ($u = 62500 * r0());
            var s = setTimeout(function() {
                if (e.waitingForImages = !1,
                e.count === 0 && (e.stylesheets && ds(e, e.stylesheets),
                e.unsuspend)) {
                    var o = e.unsuspend;
                    e.unsuspend = null,
                    o()
                }
            }, (e.imgBytes > $u ? 50 : 800) + t);
            return e.unsuspend = n,
            function() {
                e.unsuspend = null,
                clearTimeout(l),
                clearTimeout(s)
            }
        }
        : null
    }
    function cs() {
        if (this.count--,
        this.count === 0 && (this.imgCount === 0 || !this.waitingForImages)) {
            if (this.stylesheets)
                ds(this, this.stylesheets);
            else if (this.unsuspend) {
                var e = this.unsuspend;
                this.unsuspend = null,
                e()
            }
        }
    }
    var fs = null;
    function ds(e, t) {
        e.stylesheets = null,
        e.unsuspend !== null && (e.count++,
        fs = new Map,
        t.forEach(A0, e),
        fs = null,
        cs.call(e))
    }
    function A0(e, t) {
        if (!(t.state.loading & 4)) {
            var n = fs.get(e);
            if (n)
                var l = n.get(null);
            else {
                n = new Map,
                fs.set(e, n);
                for (var s = e.querySelectorAll("link[data-precedence],style[data-precedence]"), o = 0; o < s.length; o++) {
                    var h = s[o];
                    (h.nodeName === "LINK" || h.getAttribute("media") !== "not all") && (n.set(h.dataset.precedence, h),
                    l = h)
                }
                l && n.set(null, l)
            }
            s = t.instance,
            h = s.getAttribute("data-precedence"),
            o = n.get(h) || l,
            o === l && n.set(null, s),
            n.set(h, s),
            this.count++,
            l = cs.bind(this),
            s.addEventListener("load", l),
            s.addEventListener("error", l),
            o ? o.parentNode.insertBefore(s, o.nextSibling) : (e = e.nodeType === 9 ? e.head : e,
            e.insertBefore(s, e.firstChild)),
            t.state.loading |= 4
        }
    }
    var Ua = {
        $$typeof: V,
        Provider: null,
        Consumer: null,
        _currentValue: te,
        _currentValue2: te,
        _threadCount: 0
    };
    function N0(e, t, n, l, s, o, h, y, C) {
        this.tag = 1,
        this.containerInfo = e,
        this.pingCache = this.current = this.pendingChildren = null,
        this.timeoutHandle = -1,
        this.callbackNode = this.next = this.pendingContext = this.context = this.cancelPendingCommit = null,
        this.callbackPriority = 0,
        this.expirationTimes = Xs(-1),
        this.entangledLanes = this.shellSuspendCounter = this.errorRecoveryDisabledLanes = this.expiredLanes = this.warmLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0,
        this.entanglements = Xs(0),
        this.hiddenUpdates = Xs(null),
        this.identifierPrefix = l,
        this.onUncaughtError = s,
        this.onCaughtError = o,
        this.onRecoverableError = h,
        this.pooledCache = null,
        this.pooledCacheLanes = 0,
        this.formState = C,
        this.incompleteTransitions = new Map
    }
    function Vh(e, t, n, l, s, o, h, y, C, L, U, Y) {
        return e = new N0(e,t,n,h,C,L,U,Y,y),
        t = 1,
        o === !0 && (t |= 24),
        o = gt(3, null, null, t),
        e.current = o,
        o.stateNode = e,
        t = Nr(),
        t.refCount++,
        e.pooledCache = t,
        t.refCount++,
        o.memoizedState = {
            element: l,
            isDehydrated: n,
            cache: t
        },
        Dr(o),
        e
    }
    function Qh(e) {
        return e ? (e = pl,
        e) : pl
    }
    function kh(e, t, n, l, s, o) {
        s = Qh(s),
        l.context === null ? l.context = s : l.pendingContext = s,
        l = xn(t),
        l.payload = {
            element: n
        },
        o = o === void 0 ? null : o,
        o !== null && (l.callback = o),
        n = Sn(e, l, t),
        n !== null && (ct(n, e, t),
        ma(n, e, t))
    }
    function Xh(e, t) {
        if (e = e.memoizedState,
        e !== null && e.dehydrated !== null) {
            var n = e.retryLane;
            e.retryLane = n !== 0 && n < t ? n : t
        }
    }
    function Wu(e, t) {
        Xh(e, t),
        (e = e.alternate) && Xh(e, t)
    }
    function Zh(e) {
        if (e.tag === 13 || e.tag === 31) {
            var t = Qn(e, 67108864);
            t !== null && ct(t, e, 67108864),
            Wu(e, 67108864)
        }
    }
    function Kh(e) {
        if (e.tag === 13 || e.tag === 31) {
            var t = xt();
            t = Zs(t);
            var n = Qn(e, t);
            n !== null && ct(n, e, t),
            Wu(e, t)
        }
    }
    var hs = !0;
    function R0(e, t, n, l) {
        var s = z.T;
        z.T = null;
        var o = k.p;
        try {
            k.p = 2,
            Pu(e, t, n, l)
        } finally {
            k.p = o,
            z.T = s
        }
    }
    function L0(e, t, n, l) {
        var s = z.T;
        z.T = null;
        var o = k.p;
        try {
            k.p = 8,
            Pu(e, t, n, l)
        } finally {
            k.p = o,
            z.T = s
        }
    }
    function Pu(e, t, n, l) {
        if (hs) {
            var s = Iu(l);
            if (s === null)
                Bu(e, t, l, ms, n),
                Jh(e, l);
            else if (D0(s, e, t, n, l))
                l.stopPropagation();
            else if (Jh(e, l),
            t & 4 && -1 < j0.indexOf(e)) {
                for (; s !== null; ) {
                    var o = il(s);
                    if (o !== null)
                        switch (o.tag) {
                        case 3:
                            if (o = o.stateNode,
                            o.current.memoizedState.isDehydrated) {
                                var h = Bn(o.pendingLanes);
                                if (h !== 0) {
                                    var y = o;
                                    for (y.pendingLanes |= 2,
                                    y.entangledLanes |= 2; h; ) {
                                        var C = 1 << 31 - ht(h);
                                        y.entanglements[1] |= C,
                                        h &= ~C
                                    }
                                    qt(o),
                                    (Ee & 6) === 0 && ($i = ft() + 500,
                                    Ra(0))
                                }
                            }
                            break;
                        case 31:
                        case 13:
                            y = Qn(o, 2),
                            y !== null && ct(y, o, 2),
                            Pi(),
                            Wu(o, 2)
                        }
                    if (o = Iu(l),
                    o === null && Bu(e, t, l, ms, n),
                    o === s)
                        break;
                    s = o
                }
                s !== null && l.stopPropagation()
            } else
                Bu(e, t, l, null, n)
        }
    }
    function Iu(e) {
        return e = tr(e),
        eo(e)
    }
    var ms = null;
    function eo(e) {
        if (ms = null,
        e = al(e),
        e !== null) {
            var t = f(e);
            if (t === null)
                e = null;
            else {
                var n = t.tag;
                if (n === 13) {
                    if (e = d(t),
                    e !== null)
                        return e;
                    e = null
                } else if (n === 31) {
                    if (e = m(t),
                    e !== null)
                        return e;
                    e = null
                } else if (n === 3) {
                    if (t.stateNode.current.memoizedState.isDehydrated)
                        return t.tag === 3 ? t.stateNode.containerInfo : null;
                    e = null
                } else
                    t !== e && (e = null)
            }
        }
        return ms = e,
        null
    }
    function Fh(e) {
        switch (e) {
        case "beforetoggle":
        case "cancel":
        case "click":
        case "close":
        case "contextmenu":
        case "copy":
        case "cut":
        case "auxclick":
        case "dblclick":
        case "dragend":
        case "dragstart":
        case "drop":
        case "focusin":
        case "focusout":
        case "input":
        case "invalid":
        case "keydown":
        case "keypress":
        case "keyup":
        case "mousedown":
        case "mouseup":
        case "paste":
        case "pause":
        case "play":
        case "pointercancel":
        case "pointerdown":
        case "pointerup":
        case "ratechange":
        case "reset":
        case "resize":
        case "seeked":
        case "submit":
        case "toggle":
        case "touchcancel":
        case "touchend":
        case "touchstart":
        case "volumechange":
        case "change":
        case "selectionchange":
        case "textInput":
        case "compositionstart":
        case "compositionend":
        case "compositionupdate":
        case "beforeblur":
        case "afterblur":
        case "beforeinput":
        case "blur":
        case "fullscreenchange":
        case "focus":
        case "hashchange":
        case "popstate":
        case "select":
        case "selectstart":
            return 2;
        case "drag":
        case "dragenter":
        case "dragexit":
        case "dragleave":
        case "dragover":
        case "mousemove":
        case "mouseout":
        case "mouseover":
        case "pointermove":
        case "pointerout":
        case "pointerover":
        case "scroll":
        case "touchmove":
        case "wheel":
        case "mouseenter":
        case "mouseleave":
        case "pointerenter":
        case "pointerleave":
            return 8;
        case "message":
            switch (yp()) {
            case tc:
                return 2;
            case nc:
                return 8;
            case li:
            case vp:
                return 32;
            case lc:
                return 268435456;
            default:
                return 32
            }
        default:
            return 32
        }
    }
    var to = !1
      , jn = null
      , Dn = null
      , Mn = null
      , Ha = new Map
      , Ba = new Map
      , zn = []
      , j0 = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");
    function Jh(e, t) {
        switch (e) {
        case "focusin":
        case "focusout":
            jn = null;
            break;
        case "dragenter":
        case "dragleave":
            Dn = null;
            break;
        case "mouseover":
        case "mouseout":
            Mn = null;
            break;
        case "pointerover":
        case "pointerout":
            Ha.delete(t.pointerId);
            break;
        case "gotpointercapture":
        case "lostpointercapture":
            Ba.delete(t.pointerId)
        }
    }
    function qa(e, t, n, l, s, o) {
        return e === null || e.nativeEvent !== o ? (e = {
            blockedOn: t,
            domEventName: n,
            eventSystemFlags: l,
            nativeEvent: o,
            targetContainers: [s]
        },
        t !== null && (t = il(t),
        t !== null && Zh(t)),
        e) : (e.eventSystemFlags |= l,
        t = e.targetContainers,
        s !== null && t.indexOf(s) === -1 && t.push(s),
        e)
    }
    function D0(e, t, n, l, s) {
        switch (t) {
        case "focusin":
            return jn = qa(jn, e, t, n, l, s),
            !0;
        case "dragenter":
            return Dn = qa(Dn, e, t, n, l, s),
            !0;
        case "mouseover":
            return Mn = qa(Mn, e, t, n, l, s),
            !0;
        case "pointerover":
            var o = s.pointerId;
            return Ha.set(o, qa(Ha.get(o) || null, e, t, n, l, s)),
            !0;
        case "gotpointercapture":
            return o = s.pointerId,
            Ba.set(o, qa(Ba.get(o) || null, e, t, n, l, s)),
            !0
        }
        return !1
    }
    function $h(e) {
        var t = al(e.target);
        if (t !== null) {
            var n = f(t);
            if (n !== null) {
                if (t = n.tag,
                t === 13) {
                    if (t = d(n),
                    t !== null) {
                        e.blockedOn = t,
                        oc(e.priority, function() {
                            Kh(n)
                        });
                        return
                    }
                } else if (t === 31) {
                    if (t = m(n),
                    t !== null) {
                        e.blockedOn = t,
                        oc(e.priority, function() {
                            Kh(n)
                        });
                        return
                    }
                } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
                    e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
                    return
                }
            }
        }
        e.blockedOn = null
    }
    function gs(e) {
        if (e.blockedOn !== null)
            return !1;
        for (var t = e.targetContainers; 0 < t.length; ) {
            var n = Iu(e.nativeEvent);
            if (n === null) {
                n = e.nativeEvent;
                var l = new n.constructor(n.type,n);
                er = l,
                n.target.dispatchEvent(l),
                er = null
            } else
                return t = il(n),
                t !== null && Zh(t),
                e.blockedOn = n,
                !1;
            t.shift()
        }
        return !0
    }
    function Wh(e, t, n) {
        gs(e) && n.delete(t)
    }
    function M0() {
        to = !1,
        jn !== null && gs(jn) && (jn = null),
        Dn !== null && gs(Dn) && (Dn = null),
        Mn !== null && gs(Mn) && (Mn = null),
        Ha.forEach(Wh),
        Ba.forEach(Wh)
    }
    function ps(e, t) {
        e.blockedOn === t && (e.blockedOn = null,
        to || (to = !0,
        i.unstable_scheduleCallback(i.unstable_NormalPriority, M0)))
    }
    var ys = null;
    function Ph(e) {
        ys !== e && (ys = e,
        i.unstable_scheduleCallback(i.unstable_NormalPriority, function() {
            ys === e && (ys = null);
            for (var t = 0; t < e.length; t += 3) {
                var n = e[t]
                  , l = e[t + 1]
                  , s = e[t + 2];
                if (typeof l != "function") {
                    if (eo(l || n) === null)
                        continue;
                    break
                }
                var o = il(n);
                o !== null && (e.splice(t, 3),
                t -= 3,
                Ir(o, {
                    pending: !0,
                    data: s,
                    method: n.method,
                    action: l
                }, l, s))
            }
        }))
    }
    function Gl(e) {
        function t(C) {
            return ps(C, e)
        }
        jn !== null && ps(jn, e),
        Dn !== null && ps(Dn, e),
        Mn !== null && ps(Mn, e),
        Ha.forEach(t),
        Ba.forEach(t);
        for (var n = 0; n < zn.length; n++) {
            var l = zn[n];
            l.blockedOn === e && (l.blockedOn = null)
        }
        for (; 0 < zn.length && (n = zn[0],
        n.blockedOn === null); )
            $h(n),
            n.blockedOn === null && zn.shift();
        if (n = (e.ownerDocument || e).$$reactFormReplay,
        n != null)
            for (l = 0; l < n.length; l += 3) {
                var s = n[l]
                  , o = n[l + 1]
                  , h = s[at] || null;
                if (typeof o == "function")
                    h || Ph(n);
                else if (h) {
                    var y = null;
                    if (o && o.hasAttribute("formAction")) {
                        if (s = o,
                        h = o[at] || null)
                            y = h.formAction;
                        else if (eo(s) !== null)
                            continue
                    } else
                        y = h.action;
                    typeof y == "function" ? n[l + 1] = y : (n.splice(l, 3),
                    l -= 3),
                    Ph(n)
                }
            }
    }
    function Ih() {
        function e(o) {
            o.canIntercept && o.info === "react-transition" && o.intercept({
                handler: function() {
                    return new Promise(function(h) {
                        return s = h
                    }
                    )
                },
                focusReset: "manual",
                scroll: "manual"
            })
        }
        function t() {
            s !== null && (s(),
            s = null),
            l || setTimeout(n, 20)
        }
        function n() {
            if (!l && !navigation.transition) {
                var o = navigation.currentEntry;
                o && o.url != null && navigation.navigate(o.url, {
                    state: o.getState(),
                    info: "react-transition",
                    history: "replace"
                })
            }
        }
        if (typeof navigation == "object") {
            var l = !1
              , s = null;
            return navigation.addEventListener("navigate", e),
            navigation.addEventListener("navigatesuccess", t),
            navigation.addEventListener("navigateerror", t),
            setTimeout(n, 100),
            function() {
                l = !0,
                navigation.removeEventListener("navigate", e),
                navigation.removeEventListener("navigatesuccess", t),
                navigation.removeEventListener("navigateerror", t),
                s !== null && (s(),
                s = null)
            }
        }
    }
    function no(e) {
        this._internalRoot = e
    }
    vs.prototype.render = no.prototype.render = function(e) {
        var t = this._internalRoot;
        if (t === null)
            throw Error(u(409));
        var n = t.current
          , l = xt();
        kh(n, l, e, t, null, null)
    }
    ,
    vs.prototype.unmount = no.prototype.unmount = function() {
        var e = this._internalRoot;
        if (e !== null) {
            this._internalRoot = null;
            var t = e.containerInfo;
            kh(e.current, 2, null, e, null, null),
            Pi(),
            t[ll] = null
        }
    }
    ;
    function vs(e) {
        this._internalRoot = e
    }
    vs.prototype.unstable_scheduleHydration = function(e) {
        if (e) {
            var t = uc();
            e = {
                blockedOn: null,
                target: e,
                priority: t
            };
            for (var n = 0; n < zn.length && t !== 0 && t < zn[n].priority; n++)
                ;
            zn.splice(n, 0, e),
            n === 0 && $h(e)
        }
    }
    ;
    var em = a.version;
    if (em !== "19.2.4")
        throw Error(u(527, em, "19.2.4"));
    k.findDOMNode = function(e) {
        var t = e._reactInternals;
        if (t === void 0)
            throw typeof e.render == "function" ? Error(u(188)) : (e = Object.keys(e).join(","),
            Error(u(268, e)));
        return e = p(t),
        e = e !== null ? b(e) : null,
        e = e === null ? null : e.stateNode,
        e
    }
    ;
    var z0 = {
        bundleType: 0,
        version: "19.2.4",
        rendererPackageName: "react-dom",
        currentDispatcherRef: z,
        reconcilerVersion: "19.2.4"
    };
    if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
        var bs = __REACT_DEVTOOLS_GLOBAL_HOOK__;
        if (!bs.isDisabled && bs.supportsFiber)
            try {
                Fl = bs.inject(z0),
                dt = bs
            } catch {}
    }
    return ka.createRoot = function(e, t) {
        if (!c(e))
            throw Error(u(299));
        var n = !1
          , l = ""
          , s = rd
          , o = ud
          , h = od;
        return t != null && (t.unstable_strictMode === !0 && (n = !0),
        t.identifierPrefix !== void 0 && (l = t.identifierPrefix),
        t.onUncaughtError !== void 0 && (s = t.onUncaughtError),
        t.onCaughtError !== void 0 && (o = t.onCaughtError),
        t.onRecoverableError !== void 0 && (h = t.onRecoverableError)),
        t = Vh(e, 1, !1, null, null, n, l, null, s, o, h, Ih),
        e[ll] = t.current,
        Hu(e),
        new no(t)
    }
    ,
    ka.hydrateRoot = function(e, t, n) {
        if (!c(e))
            throw Error(u(299));
        var l = !1
          , s = ""
          , o = rd
          , h = ud
          , y = od
          , C = null;
        return n != null && (n.unstable_strictMode === !0 && (l = !0),
        n.identifierPrefix !== void 0 && (s = n.identifierPrefix),
        n.onUncaughtError !== void 0 && (o = n.onUncaughtError),
        n.onCaughtError !== void 0 && (h = n.onCaughtError),
        n.onRecoverableError !== void 0 && (y = n.onRecoverableError),
        n.formState !== void 0 && (C = n.formState)),
        t = Vh(e, 1, !0, t, n ?? null, l, s, C, o, h, y, Ih),
        t.context = Qh(null),
        n = t.current,
        l = xt(),
        l = Zs(l),
        s = xn(l),
        s.callback = null,
        Sn(n, s, l),
        n = l,
        t.current.lanes = n,
        $l(t, n),
        qt(t),
        e[ll] = t.current,
        Hu(e),
        new vs(t)
    }
    ,
    ka.version = "19.2.4",
    ka
}
var ag;
function K1() {
    if (ag)
        return Co.exports;
    ag = 1;
    function i() {
        if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
            try {
                __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(i)
            } catch (a) {
                console.error(a)
            }
    }
    return i(),
    Co.exports = Z1(),
    Co.exports
}
var F1 = K1();
var ig = "popstate";
function sg(i) {
    return typeof i == "object" && i != null && "pathname"in i && "search"in i && "hash"in i && "state"in i && "key"in i
}
function J1(i={}) {
    function a(u, c) {
        let f = c.state?.masked
          , {pathname: d, search: m, hash: g} = f || u.location;
        return Uo("", {
            pathname: d,
            search: m,
            hash: g
        }, c.state && c.state.usr || null, c.state && c.state.key || "default", f ? {
            pathname: u.location.pathname,
            search: u.location.search,
            hash: u.location.hash
        } : void 0)
    }
    function r(u, c) {
        return typeof c == "string" ? c : Pa(c)
    }
    return W1(a, r, null, i)
}
function Xe(i, a) {
    if (i === !1 || i === null || typeof i > "u")
        throw new Error(a)
}
function Qt(i, a) {
    if (!i) {
        typeof console < "u" && console.warn(a);
        try {
            throw new Error(a)
        } catch {}
    }
}
function $1() {
    return Math.random().toString(36).substring(2, 10)
}
function rg(i, a) {
    return {
        usr: i.state,
        key: i.key,
        idx: a,
        masked: i.unstable_mask ? {
            pathname: i.pathname,
            search: i.search,
            hash: i.hash
        } : void 0
    }
}
function Uo(i, a, r=null, u, c) {
    return {
        pathname: typeof i == "string" ? i : i.pathname,
        search: "",
        hash: "",
        ...typeof a == "string" ? Ia(a) : a,
        state: r,
        key: a && a.key || u || $1(),
        unstable_mask: c
    }
}
function Pa({pathname: i="/", search: a="", hash: r=""}) {
    return a && a !== "?" && (i += a.charAt(0) === "?" ? a : "?" + a),
    r && r !== "#" && (i += r.charAt(0) === "#" ? r : "#" + r),
    i
}
function Ia(i) {
    let a = {};
    if (i) {
        let r = i.indexOf("#");
        r >= 0 && (a.hash = i.substring(r),
        i = i.substring(0, r));
        let u = i.indexOf("?");
        u >= 0 && (a.search = i.substring(u),
        i = i.substring(0, u)),
        i && (a.pathname = i)
    }
    return a
}
function W1(i, a, r, u={}) {
    let {window: c=document.defaultView, v5Compat: f=!1} = u
      , d = c.history
      , m = "POP"
      , g = null
      , p = b();
    p == null && (p = 0,
    d.replaceState({
        ...d.state,
        idx: p
    }, ""));
    function b() {
        return (d.state || {
            idx: null
        }).idx
    }
    function v() {
        m = "POP";
        let _ = b()
          , D = _ == null ? null : _ - p;
        p = _,
        g && g({
            action: m,
            location: A.location,
            delta: D
        })
    }
    function S(_, D) {
        m = "PUSH";
        let G = sg(_) ? _ : Uo(A.location, _, D);
        p = b() + 1;
        let V = rg(G, p)
          , F = A.createHref(G.unstable_mask || G);
        try {
            d.pushState(V, "", F)
        } catch (W) {
            if (W instanceof DOMException && W.name === "DataCloneError")
                throw W;
            c.location.assign(F)
        }
        f && g && g({
            action: m,
            location: A.location,
            delta: 1
        })
    }
    function x(_, D) {
        m = "REPLACE";
        let G = sg(_) ? _ : Uo(A.location, _, D);
        p = b();
        let V = rg(G, p)
          , F = A.createHref(G.unstable_mask || G);
        d.replaceState(V, "", F),
        f && g && g({
            action: m,
            location: A.location,
            delta: 0
        })
    }
    function E(_) {
        return P1(_)
    }
    let A = {
        get action() {
            return m
        },
        get location() {
            return i(c, d)
        },
        listen(_) {
            if (g)
                throw new Error("A history only accepts one active listener");
            return c.addEventListener(ig, v),
            g = _,
            () => {
                c.removeEventListener(ig, v),
                g = null
            }
        },
        createHref(_) {
            return a(c, _)
        },
        createURL: E,
        encodeLocation(_) {
            let D = E(_);
            return {
                pathname: D.pathname,
                search: D.search,
                hash: D.hash
            }
        },
        push: S,
        replace: x,
        go(_) {
            return d.go(_)
        }
    };
    return A
}
function P1(i, a=!1) {
    let r = "http://localhost";
    typeof window < "u" && (r = window.location.origin !== "null" ? window.location.origin : window.location.href),
    Xe(r, "No window.location.(origin|href) available to create URL");
    let u = typeof i == "string" ? i : Pa(i);
    return u = u.replace(/ $/, "%20"),
    !a && u.startsWith("//") && (u = r + u),
    new URL(u,r)
}
function Xg(i, a, r="/") {
    return I1(i, a, r, !1)
}
function I1(i, a, r, u) {
    let c = typeof a == "string" ? Ia(a) : a
      , f = on(c.pathname || "/", r);
    if (f == null)
        return null;
    let d = Zg(i);
    eb(d);
    let m = null;
    for (let g = 0; m == null && g < d.length; ++g) {
        let p = fb(f);
        m = ob(d[g], p, u)
    }
    return m
}
function Zg(i, a=[], r=[], u="", c=!1) {
    let f = (d, m, g=c, p) => {
        let b = {
            relativePath: p === void 0 ? d.path || "" : p,
            caseSensitive: d.caseSensitive === !0,
            childrenIndex: m,
            route: d
        };
        if (b.relativePath.startsWith("/")) {
            if (!b.relativePath.startsWith(u) && g)
                return;
            Xe(b.relativePath.startsWith(u), `Absolute route path "${b.relativePath}" nested under path "${u}" is not valid. An absolute child route path must start with the combined path of all its parent routes.`),
            b.relativePath = b.relativePath.slice(u.length)
        }
        let v = Vt([u, b.relativePath])
          , S = r.concat(b);
        d.children && d.children.length > 0 && (Xe(d.index !== !0, `Index routes must not have child routes. Please remove all child routes from route path "${v}".`),
        Zg(d.children, a, S, v, g)),
        !(d.path == null && !d.index) && a.push({
            path: v,
            score: rb(v, d.index),
            routesMeta: S
        })
    }
    ;
    return i.forEach( (d, m) => {
        if (d.path === "" || !d.path?.includes("?"))
            f(d, m);
        else
            for (let g of Kg(d.path))
                f(d, m, !0, g)
    }
    ),
    a
}
function Kg(i) {
    let a = i.split("/");
    if (a.length === 0)
        return [];
    let[r,...u] = a
      , c = r.endsWith("?")
      , f = r.replace(/\?$/, "");
    if (u.length === 0)
        return c ? [f, ""] : [f];
    let d = Kg(u.join("/"))
      , m = [];
    return m.push(...d.map(g => g === "" ? f : [f, g].join("/"))),
    c && m.push(...d),
    m.map(g => i.startsWith("/") && g === "" ? "/" : g)
}
function eb(i) {
    i.sort( (a, r) => a.score !== r.score ? r.score - a.score : ub(a.routesMeta.map(u => u.childrenIndex), r.routesMeta.map(u => u.childrenIndex)))
}
var tb = /^:[\w-]+$/
  , nb = 3
  , lb = 2
  , ab = 1
  , ib = 10
  , sb = -2
  , ug = i => i === "*";
function rb(i, a) {
    let r = i.split("/")
      , u = r.length;
    return r.some(ug) && (u += sb),
    a && (u += lb),
    r.filter(c => !ug(c)).reduce( (c, f) => c + (tb.test(f) ? nb : f === "" ? ab : ib), u)
}
function ub(i, a) {
    return i.length === a.length && i.slice(0, -1).every( (u, c) => u === a[c]) ? i[i.length - 1] - a[a.length - 1] : 0
}
function ob(i, a, r=!1) {
    let {routesMeta: u} = i
      , c = {}
      , f = "/"
      , d = [];
    for (let m = 0; m < u.length; ++m) {
        let g = u[m]
          , p = m === u.length - 1
          , b = f === "/" ? a : a.slice(f.length) || "/"
          , v = Ds({
            path: g.relativePath,
            caseSensitive: g.caseSensitive,
            end: p
        }, b)
          , S = g.route;
        if (!v && p && r && !u[u.length - 1].route.index && (v = Ds({
            path: g.relativePath,
            caseSensitive: g.caseSensitive,
            end: !1
        }, b)),
        !v)
            return null;
        Object.assign(c, v.params),
        d.push({
            params: c,
            pathname: Vt([f, v.pathname]),
            pathnameBase: gb(Vt([f, v.pathnameBase])),
            route: S
        }),
        v.pathnameBase !== "/" && (f = Vt([f, v.pathnameBase]))
    }
    return d
}
function Ds(i, a) {
    typeof i == "string" && (i = {
        path: i,
        caseSensitive: !1,
        end: !0
    });
    let[r,u] = cb(i.path, i.caseSensitive, i.end)
      , c = a.match(r);
    if (!c)
        return null;
    let f = c[0]
      , d = f.replace(/(.)\/+$/, "$1")
      , m = c.slice(1);
    return {
        params: u.reduce( (p, {paramName: b, isOptional: v}, S) => {
            if (b === "*") {
                let E = m[S] || "";
                d = f.slice(0, f.length - E.length).replace(/(.)\/+$/, "$1")
            }
            const x = m[S];
            return v && !x ? p[b] = void 0 : p[b] = (x || "").replace(/%2F/g, "/"),
            p
        }
        , {}),
        pathname: f,
        pathnameBase: d,
        pattern: i
    }
}
function cb(i, a=!1, r=!0) {
    Qt(i === "*" || !i.endsWith("*") || i.endsWith("/*"), `Route path "${i}" will be treated as if it were "${i.replace(/\*$/, "/*")}" because the \`*\` character must always follow a \`/\` in the pattern. To get rid of this warning, please change the route path to "${i.replace(/\*$/, "/*")}".`);
    let u = []
      , c = "^" + i.replace(/\/*\*?$/, "").replace(/^\/*/, "/").replace(/[\\.*+^${}|()[\]]/g, "\\$&").replace(/\/:([\w-]+)(\?)?/g, (d, m, g, p, b) => {
        if (u.push({
            paramName: m,
            isOptional: g != null
        }),
        g) {
            let v = b.charAt(p + d.length);
            return v && v !== "/" ? "/([^\\/]*)" : "(?:/([^\\/]*))?"
        }
        return "/([^\\/]+)"
    }
    ).replace(/\/([\w-]+)\?(\/|$)/g, "(/$1)?$2");
    return i.endsWith("*") ? (u.push({
        paramName: "*"
    }),
    c += i === "*" || i === "/*" ? "(.*)$" : "(?:\\/(.+)|\\/*)$") : r ? c += "\\/*$" : i !== "" && i !== "/" && (c += "(?:(?=\\/|$))"),
    [new RegExp(c,a ? void 0 : "i"), u]
}
function fb(i) {
    try {
        return i.split("/").map(a => decodeURIComponent(a).replace(/\//g, "%2F")).join("/")
    } catch (a) {
        return Qt(!1, `The URL path "${i}" could not be decoded because it is a malformed URL segment. This is probably due to a bad percent encoding (${a}).`),
        i
    }
}
function on(i, a) {
    if (a === "/")
        return i;
    if (!i.toLowerCase().startsWith(a.toLowerCase()))
        return null;
    let r = a.endsWith("/") ? a.length - 1 : a.length
      , u = i.charAt(r);
    return u && u !== "/" ? null : i.slice(r) || "/"
}
var db = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;
function hb(i, a="/") {
    let {pathname: r, search: u="", hash: c=""} = typeof i == "string" ? Ia(i) : i, f;
    return r ? (r = r.replace(/\/\/+/g, "/"),
    r.startsWith("/") ? f = og(r.substring(1), "/") : f = og(r, a)) : f = a,
    {
        pathname: f,
        search: pb(u),
        hash: yb(c)
    }
}
function og(i, a) {
    let r = a.replace(/\/+$/, "").split("/");
    return i.split("/").forEach(c => {
        c === ".." ? r.length > 1 && r.pop() : c !== "." && r.push(c)
    }
    ),
    r.length > 1 ? r.join("/") : "/"
}
function No(i, a, r, u) {
    return `Cannot include a '${i}' character in a manually specified \`to.${a}\` field [${JSON.stringify(u)}].  Please separate it out to the \`to.${r}\` field. Alternatively you may provide the full path as a string in <Link to="..."> and the router will parse it for you.`
}
function mb(i) {
    return i.filter( (a, r) => r === 0 || a.route.path && a.route.path.length > 0)
}
function Fg(i) {
    let a = mb(i);
    return a.map( (r, u) => u === a.length - 1 ? r.pathname : r.pathnameBase)
}
function Ko(i, a, r, u=!1) {
    let c;
    typeof i == "string" ? c = Ia(i) : (c = {
        ...i
    },
    Xe(!c.pathname || !c.pathname.includes("?"), No("?", "pathname", "search", c)),
    Xe(!c.pathname || !c.pathname.includes("#"), No("#", "pathname", "hash", c)),
    Xe(!c.search || !c.search.includes("#"), No("#", "search", "hash", c)));
    let f = i === "" || c.pathname === "", d = f ? "/" : c.pathname, m;
    if (d == null)
        m = r;
    else {
        let v = a.length - 1;
        if (!u && d.startsWith("..")) {
            let S = d.split("/");
            for (; S[0] === ".."; )
                S.shift(),
                v -= 1;
            c.pathname = S.join("/")
        }
        m = v >= 0 ? a[v] : "/"
    }
    let g = hb(c, m)
      , p = d && d !== "/" && d.endsWith("/")
      , b = (f || d === ".") && r.endsWith("/");
    return !g.pathname.endsWith("/") && (p || b) && (g.pathname += "/"),
    g
}
var Vt = i => i.join("/").replace(/\/\/+/g, "/")
  , gb = i => i.replace(/\/+$/, "").replace(/^\/*/, "/")
  , pb = i => !i || i === "?" ? "" : i.startsWith("?") ? i : "?" + i
  , yb = i => !i || i === "#" ? "" : i.startsWith("#") ? i : "#" + i
  , vb = class {
    constructor(i, a, r, u=!1) {
        this.status = i,
        this.statusText = a || "",
        this.internal = u,
        r instanceof Error ? (this.data = r.toString(),
        this.error = r) : this.data = r
    }
}
;
function bb(i) {
    return i != null && typeof i.status == "number" && typeof i.statusText == "string" && typeof i.internal == "boolean" && "data"in i
}
function xb(i) {
    return i.map(a => a.route.path).filter(Boolean).join("/").replace(/\/\/*/g, "/") || "/"
}
var Jg = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
function $g(i, a) {
    let r = i;
    if (typeof r != "string" || !db.test(r))
        return {
            absoluteURL: void 0,
            isExternal: !1,
            to: r
        };
    let u = r
      , c = !1;
    if (Jg)
        try {
            let f = new URL(window.location.href)
              , d = r.startsWith("//") ? new URL(f.protocol + r) : new URL(r)
              , m = on(d.pathname, a);
            d.origin === f.origin && m != null ? r = m + d.search + d.hash : c = !0
        } catch {
            Qt(!1, `<Link to="${r}"> contains an invalid URL which will probably break when clicked - please update to a valid URL path.`)
        }
    return {
        absoluteURL: u,
        isExternal: c,
        to: r
    }
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
var Wg = ["POST", "PUT", "PATCH", "DELETE"];
new Set(Wg);
var Sb = ["GET", ...Wg];
new Set(Sb);
var Zl = H.createContext(null);
Zl.displayName = "DataRouter";
var Us = H.createContext(null);
Us.displayName = "DataRouterState";
var Eb = H.createContext(!1)
  , Pg = H.createContext({
    isTransitioning: !1
});
Pg.displayName = "ViewTransition";
var wb = H.createContext(new Map);
wb.displayName = "Fetchers";
var _b = H.createContext(null);
_b.displayName = "Await";
var Lt = H.createContext(null);
Lt.displayName = "Navigation";
var Hs = H.createContext(null);
Hs.displayName = "Location";
var cn = H.createContext({
    outlet: null,
    matches: [],
    isDataRoute: !1
});
cn.displayName = "Route";
var Fo = H.createContext(null);
Fo.displayName = "RouteError";
var Ig = "REACT_ROUTER_ERROR"
  , Cb = "REDIRECT"
  , Tb = "ROUTE_ERROR_RESPONSE";
function Ob(i) {
    if (i.startsWith(`${Ig}:${Cb}:{`))
        try {
            let a = JSON.parse(i.slice(28));
            if (typeof a == "object" && a && typeof a.status == "number" && typeof a.statusText == "string" && typeof a.location == "string" && typeof a.reloadDocument == "boolean" && typeof a.replace == "boolean")
                return a
        } catch {}
}
function Ab(i) {
    if (i.startsWith(`${Ig}:${Tb}:{`))
        try {
            let a = JSON.parse(i.slice(40));
            if (typeof a == "object" && a && typeof a.status == "number" && typeof a.statusText == "string")
                return new vb(a.status,a.statusText,a.data)
        } catch {}
}
function Nb(i, {relative: a}={}) {
    Xe(ei(), "useHref() may be used only in the context of a <Router> component.");
    let {basename: r, navigator: u} = H.useContext(Lt)
      , {hash: c, pathname: f, search: d} = ti(i, {
        relative: a
    })
      , m = f;
    return r !== "/" && (m = f === "/" ? r : Vt([r, f])),
    u.createHref({
        pathname: m,
        search: d,
        hash: c
    })
}
function ei() {
    return H.useContext(Hs) != null
}
function fn() {
    return Xe(ei(), "useLocation() may be used only in the context of a <Router> component."),
    H.useContext(Hs).location
}
var ep = "You should call navigate() in a React.useEffect(), not when your component is first rendered.";
function tp(i) {
    H.useContext(Lt).static || H.useLayoutEffect(i)
}
function np() {
    let {isDataRoute: i} = H.useContext(cn);
    return i ? Vb() : Rb()
}
function Rb() {
    Xe(ei(), "useNavigate() may be used only in the context of a <Router> component.");
    let i = H.useContext(Zl)
      , {basename: a, navigator: r} = H.useContext(Lt)
      , {matches: u} = H.useContext(cn)
      , {pathname: c} = fn()
      , f = JSON.stringify(Fg(u))
      , d = H.useRef(!1);
    return tp( () => {
        d.current = !0
    }
    ),
    H.useCallback( (g, p={}) => {
        if (Qt(d.current, ep),
        !d.current)
            return;
        if (typeof g == "number") {
            r.go(g);
            return
        }
        let b = Ko(g, JSON.parse(f), c, p.relative === "path");
        i == null && a !== "/" && (b.pathname = b.pathname === "/" ? a : Vt([a, b.pathname])),
        (p.replace ? r.replace : r.push)(b, p.state, p)
    }
    , [a, r, f, c, i])
}
H.createContext(null);
function ti(i, {relative: a}={}) {
    let {matches: r} = H.useContext(cn)
      , {pathname: u} = fn()
      , c = JSON.stringify(Fg(r));
    return H.useMemo( () => Ko(i, JSON.parse(c), u, a === "path"), [i, c, u, a])
}
function Lb(i, a) {
    return lp(i)
}
function lp(i, a, r) {
    Xe(ei(), "useRoutes() may be used only in the context of a <Router> component.");
    let {navigator: u} = H.useContext(Lt)
      , {matches: c} = H.useContext(cn)
      , f = c[c.length - 1]
      , d = f ? f.params : {}
      , m = f ? f.pathname : "/"
      , g = f ? f.pathnameBase : "/"
      , p = f && f.route;
    {
        let _ = p && p.path || "";
        ip(m, !p || _.endsWith("*") || _.endsWith("*?"), `You rendered descendant <Routes> (or called \`useRoutes()\`) at "${m}" (under <Route path="${_}">) but the parent route path has no trailing "*". This means if you navigate deeper, the parent won't match anymore and therefore the child routes will never render.

Please change the parent <Route path="${_}"> to <Route path="${_ === "/" ? "*" : `${_}/*`}">.`)
    }
    let b = fn(), v;
    v = b;
    let S = v.pathname || "/"
      , x = S;
    if (g !== "/") {
        let _ = g.replace(/^\//, "").split("/");
        x = "/" + S.replace(/^\//, "").split("/").slice(_.length).join("/")
    }
    let E = Xg(i, {
        pathname: x
    });
    return Qt(p || E != null, `No routes matched location "${v.pathname}${v.search}${v.hash}" `),
    Qt(E == null || E[E.length - 1].route.element !== void 0 || E[E.length - 1].route.Component !== void 0 || E[E.length - 1].route.lazy !== void 0, `Matched leaf route at location "${v.pathname}${v.search}${v.hash}" does not have an element or Component. This means it will render an <Outlet /> with a null value by default resulting in an "empty" page.`),
    Ub(E && E.map(_ => Object.assign({}, _, {
        params: Object.assign({}, d, _.params),
        pathname: Vt([g, u.encodeLocation ? u.encodeLocation(_.pathname.replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : _.pathname]),
        pathnameBase: _.pathnameBase === "/" ? g : Vt([g, u.encodeLocation ? u.encodeLocation(_.pathnameBase.replace(/\?/g, "%3F").replace(/#/g, "%23")).pathname : _.pathnameBase])
    })), c, r)
}
function jb() {
    let i = Yb()
      , a = bb(i) ? `${i.status} ${i.statusText}` : i instanceof Error ? i.message : JSON.stringify(i)
      , r = i instanceof Error ? i.stack : null
      , u = "rgba(200,200,200, 0.5)"
      , c = {
        padding: "0.5rem",
        backgroundColor: u
    }
      , f = {
        padding: "2px 4px",
        backgroundColor: u
    }
      , d = null;
    return console.error("Error handled by React Router default ErrorBoundary:", i),
    d = H.createElement(H.Fragment, null, H.createElement("p", null, "💿 Hey developer 👋"), H.createElement("p", null, "You can provide a way better UX than this when your app throws errors by providing your own ", H.createElement("code", {
        style: f
    }, "ErrorBoundary"), " or", " ", H.createElement("code", {
        style: f
    }, "errorElement"), " prop on your route.")),
    H.createElement(H.Fragment, null, H.createElement("h2", null, "Unexpected Application Error!"), H.createElement("h3", {
        style: {
            fontStyle: "italic"
        }
    }, a), r ? H.createElement("pre", {
        style: c
    }, r) : null, d)
}
var Db = H.createElement(jb, null)
  , ap = class extends H.Component {
    constructor(i) {
        super(i),
        this.state = {
            location: i.location,
            revalidation: i.revalidation,
            error: i.error
        }
    }
    static getDerivedStateFromError(i) {
        return {
            error: i
        }
    }
    static getDerivedStateFromProps(i, a) {
        return a.location !== i.location || a.revalidation !== "idle" && i.revalidation === "idle" ? {
            error: i.error,
            location: i.location,
            revalidation: i.revalidation
        } : {
            error: i.error !== void 0 ? i.error : a.error,
            location: a.location,
            revalidation: i.revalidation || a.revalidation
        }
    }
    componentDidCatch(i, a) {
        this.props.onError ? this.props.onError(i, a) : console.error("React Router caught the following error during render", i)
    }
    render() {
        let i = this.state.error;
        if (this.context && typeof i == "object" && i && "digest"in i && typeof i.digest == "string") {
            const r = Ab(i.digest);
            r && (i = r)
        }
        let a = i !== void 0 ? H.createElement(cn.Provider, {
            value: this.props.routeContext
        }, H.createElement(Fo.Provider, {
            value: i,
            children: this.props.component
        })) : this.props.children;
        return this.context ? H.createElement(Mb, {
            error: i
        }, a) : a
    }
}
;
ap.contextType = Eb;
var Ro = new WeakMap;
function Mb({children: i, error: a}) {
    let {basename: r} = H.useContext(Lt);
    if (typeof a == "object" && a && "digest"in a && typeof a.digest == "string") {
        let u = Ob(a.digest);
        if (u) {
            let c = Ro.get(a);
            if (c)
                throw c;
            let f = $g(u.location, r);
            if (Jg && !Ro.get(a))
                if (f.isExternal || u.reloadDocument)
                    window.location.href = f.absoluteURL || f.to;
                else {
                    const d = Promise.resolve().then( () => window.__reactRouterDataRouter.navigate(f.to, {
                        replace: u.replace
                    }));
                    throw Ro.set(a, d),
                    d
                }
            return H.createElement("meta", {
                httpEquiv: "refresh",
                content: `0;url=${f.absoluteURL || f.to}`
            })
        }
    }
    return i
}
function zb({routeContext: i, match: a, children: r}) {
    let u = H.useContext(Zl);
    return u && u.static && u.staticContext && (a.route.errorElement || a.route.ErrorBoundary) && (u.staticContext._deepestRenderedBoundaryId = a.route.id),
    H.createElement(cn.Provider, {
        value: i
    }, r)
}
function Ub(i, a=[], r) {
    let u = r?.state;
    if (i == null) {
        if (!u)
            return null;
        if (u.errors)
            i = u.matches;
        else if (a.length === 0 && !u.initialized && u.matches.length > 0)
            i = u.matches;
        else
            return null
    }
    let c = i
      , f = u?.errors;
    if (f != null) {
        let b = c.findIndex(v => v.route.id && f?.[v.route.id] !== void 0);
        Xe(b >= 0, `Could not find a matching route for errors on route IDs: ${Object.keys(f).join(",")}`),
        c = c.slice(0, Math.min(c.length, b + 1))
    }
    let d = !1
      , m = -1;
    if (r && u) {
        d = u.renderFallback;
        for (let b = 0; b < c.length; b++) {
            let v = c[b];
            if ((v.route.HydrateFallback || v.route.hydrateFallbackElement) && (m = b),
            v.route.id) {
                let {loaderData: S, errors: x} = u
                  , E = v.route.loader && !S.hasOwnProperty(v.route.id) && (!x || x[v.route.id] === void 0);
                if (v.route.lazy || E) {
                    r.isStatic && (d = !0),
                    m >= 0 ? c = c.slice(0, m + 1) : c = [c[0]];
                    break
                }
            }
        }
    }
    let g = r?.onError
      , p = u && g ? (b, v) => {
        g(b, {
            location: u.location,
            params: u.matches?.[0]?.params ?? {},
            unstable_pattern: xb(u.matches),
            errorInfo: v
        })
    }
    : void 0;
    return c.reduceRight( (b, v, S) => {
        let x, E = !1, A = null, _ = null;
        u && (x = f && v.route.id ? f[v.route.id] : void 0,
        A = v.route.errorElement || Db,
        d && (m < 0 && S === 0 ? (ip("route-fallback", !1, "No `HydrateFallback` element provided to render during initial hydration"),
        E = !0,
        _ = null) : m === S && (E = !0,
        _ = v.route.hydrateFallbackElement || null)));
        let D = a.concat(c.slice(0, S + 1))
          , G = () => {
            let V;
            return x ? V = A : E ? V = _ : v.route.Component ? V = H.createElement(v.route.Component, null) : v.route.element ? V = v.route.element : V = b,
            H.createElement(zb, {
                match: v,
                routeContext: {
                    outlet: b,
                    matches: D,
                    isDataRoute: u != null
                },
                children: V
            })
        }
        ;
        return u && (v.route.ErrorBoundary || v.route.errorElement || S === 0) ? H.createElement(ap, {
            location: u.location,
            revalidation: u.revalidation,
            component: A,
            error: x,
            children: G(),
            routeContext: {
                outlet: null,
                matches: D,
                isDataRoute: !0
            },
            onError: p
        }) : G()
    }
    , null)
}
function Jo(i) {
    return `${i} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
}
function Hb(i) {
    let a = H.useContext(Zl);
    return Xe(a, Jo(i)),
    a
}
function Bb(i) {
    let a = H.useContext(Us);
    return Xe(a, Jo(i)),
    a
}
function qb(i) {
    let a = H.useContext(cn);
    return Xe(a, Jo(i)),
    a
}
function $o(i) {
    let a = qb(i)
      , r = a.matches[a.matches.length - 1];
    return Xe(r.route.id, `${i} can only be used on routes that contain a unique "id"`),
    r.route.id
}
function Gb() {
    return $o("useRouteId")
}
function Yb() {
    let i = H.useContext(Fo)
      , a = Bb("useRouteError")
      , r = $o("useRouteError");
    return i !== void 0 ? i : a.errors?.[r]
}
function Vb() {
    let {router: i} = Hb("useNavigate")
      , a = $o("useNavigate")
      , r = H.useRef(!1);
    return tp( () => {
        r.current = !0
    }
    ),
    H.useCallback(async (c, f={}) => {
        Qt(r.current, ep),
        r.current && (typeof c == "number" ? await i.navigate(c) : await i.navigate(c, {
            fromRouteId: a,
            ...f
        }))
    }
    , [i, a])
}
var cg = {};
function ip(i, a, r) {
    !a && !cg[i] && (cg[i] = !0,
    Qt(!1, r))
}
H.memo(Qb);
function Qb({routes: i, future: a, state: r, isStatic: u, onError: c}) {
    return lp(i, void 0, {
        state: r,
        isStatic: u,
        onError: c
    })
}
function kb({basename: i="/", children: a=null, location: r, navigationType: u="POP", navigator: c, static: f=!1, unstable_useTransitions: d}) {
    Xe(!ei(), "You cannot render a <Router> inside another <Router>. You should never have more than one in your app.");
    let m = i.replace(/^\/*/, "/")
      , g = H.useMemo( () => ({
        basename: m,
        navigator: c,
        static: f,
        unstable_useTransitions: d,
        future: {}
    }), [m, c, f, d]);
    typeof r == "string" && (r = Ia(r));
    let {pathname: p="/", search: b="", hash: v="", state: S=null, key: x="default", unstable_mask: E} = r
      , A = H.useMemo( () => {
        let _ = on(p, m);
        return _ == null ? null : {
            location: {
                pathname: _,
                search: b,
                hash: v,
                state: S,
                key: x,
                unstable_mask: E
            },
            navigationType: u
        }
    }
    , [m, p, b, v, S, x, u, E]);
    return Qt(A != null, `<Router basename="${m}"> is not able to match the URL "${p}${b}${v}" because it does not start with the basename, so the <Router> won't render anything.`),
    A == null ? null : H.createElement(Lt.Provider, {
        value: g
    }, H.createElement(Hs.Provider, {
        children: a,
        value: A
    }))
}
var Os = "get"
  , As = "application/x-www-form-urlencoded";
function Bs(i) {
    return typeof HTMLElement < "u" && i instanceof HTMLElement
}
function Xb(i) {
    return Bs(i) && i.tagName.toLowerCase() === "button"
}
function Zb(i) {
    return Bs(i) && i.tagName.toLowerCase() === "form"
}
function Kb(i) {
    return Bs(i) && i.tagName.toLowerCase() === "input"
}
function Fb(i) {
    return !!(i.metaKey || i.altKey || i.ctrlKey || i.shiftKey)
}
function Jb(i, a) {
    return i.button === 0 && (!a || a === "_self") && !Fb(i)
}
var Ts = null;
function $b() {
    if (Ts === null)
        try {
            new FormData(document.createElement("form"),0),
            Ts = !1
        } catch {
            Ts = !0
        }
    return Ts
}
var Wb = new Set(["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"]);
function Lo(i) {
    return i != null && !Wb.has(i) ? (Qt(!1, `"${i}" is not a valid \`encType\` for \`<Form>\`/\`<fetcher.Form>\` and will default to "${As}"`),
    null) : i
}
function Pb(i, a) {
    let r, u, c, f, d;
    if (Zb(i)) {
        let m = i.getAttribute("action");
        u = m ? on(m, a) : null,
        r = i.getAttribute("method") || Os,
        c = Lo(i.getAttribute("enctype")) || As,
        f = new FormData(i)
    } else if (Xb(i) || Kb(i) && (i.type === "submit" || i.type === "image")) {
        let m = i.form;
        if (m == null)
            throw new Error('Cannot submit a <button> or <input type="submit"> without a <form>');
        let g = i.getAttribute("formaction") || m.getAttribute("action");
        if (u = g ? on(g, a) : null,
        r = i.getAttribute("formmethod") || m.getAttribute("method") || Os,
        c = Lo(i.getAttribute("formenctype")) || Lo(m.getAttribute("enctype")) || As,
        f = new FormData(m,i),
        !$b()) {
            let {name: p, type: b, value: v} = i;
            if (b === "image") {
                let S = p ? `${p}.` : "";
                f.append(`${S}x`, "0"),
                f.append(`${S}y`, "0")
            } else
                p && f.append(p, v)
        }
    } else {
        if (Bs(i))
            throw new Error('Cannot submit element that is not <form>, <button>, or <input type="submit|image">');
        r = Os,
        u = null,
        c = As,
        d = i
    }
    return f && c === "text/plain" && (d = f,
    f = void 0),
    {
        action: u,
        method: r.toLowerCase(),
        encType: c,
        formData: f,
        body: d
    }
}
Object.getOwnPropertyNames(Object.prototype).sort().join("\0");
function Wo(i, a) {
    if (i === !1 || i === null || typeof i > "u")
        throw new Error(a)
}
function Ib(i, a, r, u) {
    let c = typeof i == "string" ? new URL(i,typeof window > "u" ? "server://singlefetch/" : window.location.origin) : i;
    return r ? c.pathname.endsWith("/") ? c.pathname = `${c.pathname}_.${u}` : c.pathname = `${c.pathname}.${u}` : c.pathname === "/" ? c.pathname = `_root.${u}` : a && on(c.pathname, a) === "/" ? c.pathname = `${a.replace(/\/$/, "")}/_root.${u}` : c.pathname = `${c.pathname.replace(/\/$/, "")}.${u}`,
    c
}
async function ex(i, a) {
    if (i.id in a)
        return a[i.id];
    try {
        let r = await import(i.module);
        return a[i.id] = r,
        r
    } catch (r) {
        return console.error(`Error loading route module \`${i.module}\`, reloading page...`),
        console.error(r),
        window.__reactRouterContext && window.__reactRouterContext.isSpaMode,
        window.location.reload(),
        new Promise( () => {}
        )
    }
}
function tx(i) {
    return i == null ? !1 : i.href == null ? i.rel === "preload" && typeof i.imageSrcSet == "string" && typeof i.imageSizes == "string" : typeof i.rel == "string" && typeof i.href == "string"
}
async function nx(i, a, r) {
    let u = await Promise.all(i.map(async c => {
        let f = a.routes[c.route.id];
        if (f) {
            let d = await ex(f, r);
            return d.links ? d.links() : []
        }
        return []
    }
    ));
    return sx(u.flat(1).filter(tx).filter(c => c.rel === "stylesheet" || c.rel === "preload").map(c => c.rel === "stylesheet" ? {
        ...c,
        rel: "prefetch",
        as: "style"
    } : {
        ...c,
        rel: "prefetch"
    }))
}
function fg(i, a, r, u, c, f) {
    let d = (g, p) => r[p] ? g.route.id !== r[p].route.id : !0
      , m = (g, p) => r[p].pathname !== g.pathname || r[p].route.path?.endsWith("*") && r[p].params["*"] !== g.params["*"];
    return f === "assets" ? a.filter( (g, p) => d(g, p) || m(g, p)) : f === "data" ? a.filter( (g, p) => {
        let b = u.routes[g.route.id];
        if (!b || !b.hasLoader)
            return !1;
        if (d(g, p) || m(g, p))
            return !0;
        if (g.route.shouldRevalidate) {
            let v = g.route.shouldRevalidate({
                currentUrl: new URL(c.pathname + c.search + c.hash,window.origin),
                currentParams: r[0]?.params || {},
                nextUrl: new URL(i,window.origin),
                nextParams: g.params,
                defaultShouldRevalidate: !0
            });
            if (typeof v == "boolean")
                return v
        }
        return !0
    }
    ) : []
}
function lx(i, a, {includeHydrateFallback: r}={}) {
    return ax(i.map(u => {
        let c = a.routes[u.route.id];
        if (!c)
            return [];
        let f = [c.module];
        return c.clientActionModule && (f = f.concat(c.clientActionModule)),
        c.clientLoaderModule && (f = f.concat(c.clientLoaderModule)),
        r && c.hydrateFallbackModule && (f = f.concat(c.hydrateFallbackModule)),
        c.imports && (f = f.concat(c.imports)),
        f
    }
    ).flat(1))
}
function ax(i) {
    return [...new Set(i)]
}
function ix(i) {
    let a = {}
      , r = Object.keys(i).sort();
    for (let u of r)
        a[u] = i[u];
    return a
}
function sx(i, a) {
    let r = new Set;
    return new Set(a),
    i.reduce( (u, c) => {
        let f = JSON.stringify(ix(c));
        return r.has(f) || (r.add(f),
        u.push({
            key: f,
            link: c
        })),
        u
    }
    , [])
}
function sp() {
    let i = H.useContext(Zl);
    return Wo(i, "You must render this element inside a <DataRouterContext.Provider> element"),
    i
}
function rx() {
    let i = H.useContext(Us);
    return Wo(i, "You must render this element inside a <DataRouterStateContext.Provider> element"),
    i
}
var Po = H.createContext(void 0);
Po.displayName = "FrameworkContext";
function rp() {
    let i = H.useContext(Po);
    return Wo(i, "You must render this element inside a <HydratedRouter> element"),
    i
}
function ux(i, a) {
    let r = H.useContext(Po)
      , [u,c] = H.useState(!1)
      , [f,d] = H.useState(!1)
      , {onFocus: m, onBlur: g, onMouseEnter: p, onMouseLeave: b, onTouchStart: v} = a
      , S = H.useRef(null);
    H.useEffect( () => {
        if (i === "render" && d(!0),
        i === "viewport") {
            let A = D => {
                D.forEach(G => {
                    d(G.isIntersecting)
                }
                )
            }
              , _ = new IntersectionObserver(A,{
                threshold: .5
            });
            return S.current && _.observe(S.current),
            () => {
                _.disconnect()
            }
        }
    }
    , [i]),
    H.useEffect( () => {
        if (u) {
            let A = setTimeout( () => {
                d(!0)
            }
            , 100);
            return () => {
                clearTimeout(A)
            }
        }
    }
    , [u]);
    let x = () => {
        c(!0)
    }
      , E = () => {
        c(!1),
        d(!1)
    }
    ;
    return r ? i !== "intent" ? [f, S, {}] : [f, S, {
        onFocus: Xa(m, x),
        onBlur: Xa(g, E),
        onMouseEnter: Xa(p, x),
        onMouseLeave: Xa(b, E),
        onTouchStart: Xa(v, x)
    }] : [!1, S, {}]
}
function Xa(i, a) {
    return r => {
        i && i(r),
        r.defaultPrevented || a(r)
    }
}
function ox({page: i, ...a}) {
    let {router: r} = sp()
      , u = H.useMemo( () => Xg(r.routes, i, r.basename), [r.routes, i, r.basename]);
    return u ? H.createElement(fx, {
        page: i,
        matches: u,
        ...a
    }) : null
}
function cx(i) {
    let {manifest: a, routeModules: r} = rp()
      , [u,c] = H.useState([]);
    return H.useEffect( () => {
        let f = !1;
        return nx(i, a, r).then(d => {
            f || c(d)
        }
        ),
        () => {
            f = !0
        }
    }
    , [i, a, r]),
    u
}
function fx({page: i, matches: a, ...r}) {
    let u = fn()
      , {future: c, manifest: f, routeModules: d} = rp()
      , {basename: m} = sp()
      , {loaderData: g, matches: p} = rx()
      , b = H.useMemo( () => fg(i, a, p, f, u, "data"), [i, a, p, f, u])
      , v = H.useMemo( () => fg(i, a, p, f, u, "assets"), [i, a, p, f, u])
      , S = H.useMemo( () => {
        if (i === u.pathname + u.search + u.hash)
            return [];
        let A = new Set
          , _ = !1;
        if (a.forEach(G => {
            let V = f.routes[G.route.id];
            !V || !V.hasLoader || (!b.some(F => F.route.id === G.route.id) && G.route.id in g && d[G.route.id]?.shouldRevalidate || V.hasClientLoader ? _ = !0 : A.add(G.route.id))
        }
        ),
        A.size === 0)
            return [];
        let D = Ib(i, m, c.unstable_trailingSlashAwareDataRequests, "data");
        return _ && A.size > 0 && D.searchParams.set("_routes", a.filter(G => A.has(G.route.id)).map(G => G.route.id).join(",")),
        [D.pathname + D.search]
    }
    , [m, c.unstable_trailingSlashAwareDataRequests, g, u, f, b, a, i, d])
      , x = H.useMemo( () => lx(v, f), [v, f])
      , E = cx(v);
    return H.createElement(H.Fragment, null, S.map(A => H.createElement("link", {
        key: A,
        rel: "prefetch",
        as: "fetch",
        href: A,
        ...r
    })), x.map(A => H.createElement("link", {
        key: A,
        rel: "modulepreload",
        href: A,
        ...r
    })), E.map( ({key: A, link: _}) => H.createElement("link", {
        key: A,
        nonce: r.nonce,
        ..._,
        crossOrigin: _.crossOrigin ?? r.crossOrigin
    })))
}
function dx(...i) {
    return a => {
        i.forEach(r => {
            typeof r == "function" ? r(a) : r != null && (r.current = a)
        }
        )
    }
}
var hx = typeof window < "u" && typeof window.document < "u" && typeof window.document.createElement < "u";
try {
    hx && (window.__reactRouterVersion = "7.13.1")
} catch {}
function mx({basename: i, children: a, unstable_useTransitions: r, window: u}) {
    let c = H.useRef();
    c.current == null && (c.current = J1({
        window: u,
        v5Compat: !0
    }));
    let f = c.current
      , [d,m] = H.useState({
        action: f.action,
        location: f.location
    })
      , g = H.useCallback(p => {
        r === !1 ? m(p) : H.startTransition( () => m(p))
    }
    , [r]);
    return H.useLayoutEffect( () => f.listen(g), [f, g]),
    H.createElement(kb, {
        basename: i,
        children: a,
        location: d.location,
        navigationType: d.action,
        navigator: f,
        unstable_useTransitions: r
    })
}
var up = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i
  , op = H.forwardRef(function({onClick: a, discover: r="render", prefetch: u="none", relative: c, reloadDocument: f, replace: d, unstable_mask: m, state: g, target: p, to: b, preventScrollReset: v, viewTransition: S, unstable_defaultShouldRevalidate: x, ...E}, A) {
    let {basename: _, navigator: D, unstable_useTransitions: G} = H.useContext(Lt)
      , V = typeof b == "string" && up.test(b)
      , F = $g(b, _);
    b = F.to;
    let W = Nb(b, {
        relative: c
    })
      , ue = fn()
      , P = null;
    if (m) {
        let fe = Ko(m, [], ue.unstable_mask ? ue.unstable_mask.pathname : "/", !0);
        _ !== "/" && (fe.pathname = fe.pathname === "/" ? _ : Vt([_, fe.pathname])),
        P = D.createHref(fe)
    }
    let[ye,Ce,Q] = ux(u, E)
      , X = vx(b, {
        replace: d,
        unstable_mask: m,
        state: g,
        target: p,
        preventScrollReset: v,
        relative: c,
        viewTransition: S,
        unstable_defaultShouldRevalidate: x,
        unstable_useTransitions: G
    });
    function K(fe) {
        a && a(fe),
        fe.defaultPrevented || X(fe)
    }
    let ne = !(F.isExternal || f)
      , oe = H.createElement("a", {
        ...E,
        ...Q,
        href: (ne ? P : void 0) || F.absoluteURL || W,
        onClick: ne ? K : a,
        ref: dx(A, Ce),
        target: p,
        "data-discover": !V && r === "render" ? "true" : void 0
    });
    return ye && !V ? H.createElement(H.Fragment, null, oe, H.createElement(ox, {
        page: W
    })) : oe
});
op.displayName = "Link";
var gx = H.forwardRef(function({"aria-current": a="page", caseSensitive: r=!1, className: u="", end: c=!1, style: f, to: d, viewTransition: m, children: g, ...p}, b) {
    let v = ti(d, {
        relative: p.relative
    })
      , S = fn()
      , x = H.useContext(Us)
      , {navigator: E, basename: A} = H.useContext(Lt)
      , _ = x != null && wx(v) && m === !0
      , D = E.encodeLocation ? E.encodeLocation(v).pathname : v.pathname
      , G = S.pathname
      , V = x && x.navigation && x.navigation.location ? x.navigation.location.pathname : null;
    r || (G = G.toLowerCase(),
    V = V ? V.toLowerCase() : null,
    D = D.toLowerCase()),
    V && A && (V = on(V, A) || V);
    const F = D !== "/" && D.endsWith("/") ? D.length - 1 : D.length;
    let W = G === D || !c && G.startsWith(D) && G.charAt(F) === "/", ue = V != null && (V === D || !c && V.startsWith(D) && V.charAt(D.length) === "/"), P = {
        isActive: W,
        isPending: ue,
        isTransitioning: _
    }, ye = W ? a : void 0, Ce;
    typeof u == "function" ? Ce = u(P) : Ce = [u, W ? "active" : null, ue ? "pending" : null, _ ? "transitioning" : null].filter(Boolean).join(" ");
    let Q = typeof f == "function" ? f(P) : f;
    return H.createElement(op, {
        ...p,
        "aria-current": ye,
        className: Ce,
        ref: b,
        style: Q,
        to: d,
        viewTransition: m
    }, typeof g == "function" ? g(P) : g)
});
gx.displayName = "NavLink";
var px = H.forwardRef( ({discover: i="render", fetcherKey: a, navigate: r, reloadDocument: u, replace: c, state: f, method: d=Os, action: m, onSubmit: g, relative: p, preventScrollReset: b, viewTransition: v, unstable_defaultShouldRevalidate: S, ...x}, E) => {
    let {unstable_useTransitions: A} = H.useContext(Lt)
      , _ = Sx()
      , D = Ex(m, {
        relative: p
    })
      , G = d.toLowerCase() === "get" ? "get" : "post"
      , V = typeof m == "string" && up.test(m)
      , F = W => {
        if (g && g(W),
        W.defaultPrevented)
            return;
        W.preventDefault();
        let ue = W.nativeEvent.submitter
          , P = ue?.getAttribute("formmethod") || d
          , ye = () => _(ue || W.currentTarget, {
            fetcherKey: a,
            method: P,
            navigate: r,
            replace: c,
            state: f,
            relative: p,
            preventScrollReset: b,
            viewTransition: v,
            unstable_defaultShouldRevalidate: S
        });
        A && r !== !1 ? H.startTransition( () => ye()) : ye()
    }
    ;
    return H.createElement("form", {
        ref: E,
        method: G,
        action: D,
        onSubmit: u ? g : F,
        ...x,
        "data-discover": !V && i === "render" ? "true" : void 0
    })
}
);
px.displayName = "Form";
function yx(i) {
    return `${i} must be used within a data router.  See https://reactrouter.com/en/main/routers/picking-a-router.`
}
function cp(i) {
    let a = H.useContext(Zl);
    return Xe(a, yx(i)),
    a
}
function vx(i, {target: a, replace: r, unstable_mask: u, state: c, preventScrollReset: f, relative: d, viewTransition: m, unstable_defaultShouldRevalidate: g, unstable_useTransitions: p}={}) {
    let b = np()
      , v = fn()
      , S = ti(i, {
        relative: d
    });
    return H.useCallback(x => {
        if (Jb(x, a)) {
            x.preventDefault();
            let E = r !== void 0 ? r : Pa(v) === Pa(S)
              , A = () => b(i, {
                replace: E,
                unstable_mask: u,
                state: c,
                preventScrollReset: f,
                relative: d,
                viewTransition: m,
                unstable_defaultShouldRevalidate: g
            });
            p ? H.startTransition( () => A()) : A()
        }
    }
    , [v, b, S, r, u, c, a, i, f, d, m, g, p])
}
var bx = 0
  , xx = () => `__${String(++bx)}__`;
function Sx() {
    let {router: i} = cp("useSubmit")
      , {basename: a} = H.useContext(Lt)
      , r = Gb()
      , u = i.fetch
      , c = i.navigate;
    return H.useCallback(async (f, d={}) => {
        let {action: m, method: g, encType: p, formData: b, body: v} = Pb(f, a);
        if (d.navigate === !1) {
            let S = d.fetcherKey || xx();
            await u(S, r, d.action || m, {
                unstable_defaultShouldRevalidate: d.unstable_defaultShouldRevalidate,
                preventScrollReset: d.preventScrollReset,
                formData: b,
                body: v,
                formMethod: d.method || g,
                formEncType: d.encType || p,
                flushSync: d.flushSync
            })
        } else
            await c(d.action || m, {
                unstable_defaultShouldRevalidate: d.unstable_defaultShouldRevalidate,
                preventScrollReset: d.preventScrollReset,
                formData: b,
                body: v,
                formMethod: d.method || g,
                formEncType: d.encType || p,
                replace: d.replace,
                state: d.state,
                fromRouteId: r,
                flushSync: d.flushSync,
                viewTransition: d.viewTransition
            })
    }
    , [u, c, a, r])
}
function Ex(i, {relative: a}={}) {
    let {basename: r} = H.useContext(Lt)
      , u = H.useContext(cn);
    Xe(u, "useFormAction must be used inside a RouteContext");
    let[c] = u.matches.slice(-1)
      , f = {
        ...ti(i || ".", {
            relative: a
        })
    }
      , d = fn();
    if (i == null) {
        f.search = d.search;
        let m = new URLSearchParams(f.search)
          , g = m.getAll("index");
        if (g.some(b => b === "")) {
            m.delete("index"),
            g.filter(v => v).forEach(v => m.append("index", v));
            let b = m.toString();
            f.search = b ? `?${b}` : ""
        }
    }
    return (!i || i === ".") && c.route.index && (f.search = f.search ? f.search.replace(/^\?/, "?index&") : "?index"),
    r !== "/" && (f.pathname = f.pathname === "/" ? r : Vt([r, f.pathname])),
    Pa(f)
}
function wx(i, {relative: a}={}) {
    let r = H.useContext(Pg);
    Xe(r != null, "`useViewTransitionState` must be used within `react-router-dom`'s `RouterProvider`.  Did you accidentally import `RouterProvider` from `react-router`?");
    let {basename: u} = cp("useViewTransitionState")
      , c = ti(i, {
        relative: a
    });
    if (!r.isTransitioning)
        return !1;
    let f = on(r.currentLocation.pathname, u) || r.currentLocation.pathname
      , d = on(r.nextLocation.pathname, u) || r.nextLocation.pathname;
    return Ds(c.pathname, d) != null || Ds(c.pathname, f) != null
}
function _x() {
    const i = fn();
    return w.jsxs("div", {
        className: "relative flex flex-col items-center justify-center h-screen text-center px-4",
        children: [w.jsx("h1", {
            className: "absolute bottom-0 text-9xl md:text-[12rem] font-black text-gray-50 select-none pointer-events-none z-0",
            children: "404"
        }), w.jsxs("div", {
            className: "relative z-10",
            children: [w.jsx("h1", {
                className: "text-xl md:text-2xl font-semibold mt-6",
                children: "This page has not been generated"
            }), w.jsx("p", {
                className: "mt-2 text-base text-gray-400 font-mono",
                children: i.pathname
            }), w.jsx("p", {
                className: "mt-4 text-lg md:text-xl text-gray-500",
                children: "Tell me more about this page, so I can generate it"
            })]
        })]
    })
}
function Cx() {
    const [i,a] = H.useState(!1);
    return H.useEffect( () => {
        const r = () => {
            a(window.scrollY > 50)
        }
        ;
        return window.addEventListener("scroll", r),
        () => window.removeEventListener("scroll", r)
    }
    , []),
    w.jsxs("section", {
        className: "relative min-h-screen flex items-center overflow-hidden",
        children: [w.jsx("nav", {
            className: `fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${i ? "bg-white shadow-md" : "bg-transparent"}`,
            children: w.jsxs("div", {
                className: "max-w-7xl mx-auto px-8 py-6 flex items-center justify-between",
                children: [w.jsxs("div", {
                    className: "flex items-center gap-2",
                    children: [w.jsx("div", {
                        className: "w-10 h-10 flex items-center justify-center",
                        children: w.jsx("img", {
                            
                            className: "w-10 h-10 object-contain",
                            style: {
                                filter: i ? "none" : "brightness(0) invert(1)"
                            }
                        })
                    }), w.jsx("span", {
                        className: `text-xl font-bold tracking-tight ${i ? "text-gray-900" : "text-white"}`,
                        children: "HERBAL QUEEN"
                    })]
                }), w.jsxs("div", {
                    className: "hidden md:flex items-center gap-8",
                    children: [w.jsx("a", {
                        href: "#benefits",
                        className: `text-sm font-medium hover:opacity-70 transition-opacity ${i ? "text-gray-700" : "text-white"}`,
                        children: "BENEFITS"
                    }), w.jsx("a", {
                        href: "#ingredients",
                        className: `text-sm font-medium hover:opacity-70 transition-opacity ${i ? "text-gray-700" : "text-white"}`,
                        children: "INGREDIENTS"
                    }), w.jsx("a", {
                        href: "#reviews",
                        className: `text-sm font-medium hover:opacity-70 transition-opacity ${i ? "text-gray-700" : "text-white"}`,
                        children: "REVIEWS"
                    }), w.jsx("button", {
                        className: "px-6 py-3 rounded-full font-medium text-sm text-white whitespace-nowrap transition-all hover:scale-105",
                        style: {
                            backgroundColor: "#D0226F"
                        },
                        children: "SHOP NOW"
                    })]
                })]
            })
        }), w.jsxs("div", {
            className: "w-full flex flex-col lg:flex-row min-h-screen",
            children: [w.jsxs("div", {
                className: "lg:w-[40%] relative flex items-center justify-center py-32 lg:py-0",
                style: {
                    background: "linear-gradient(180deg, #D0226F 0%, #E84A8A 100%)"
                },
                children: [w.jsxs("div", {
                    className: "absolute inset-0 opacity-10 overflow-hidden",
                    children: [w.jsx("div", {
                        className: "absolute top-10 left-10 w-96 h-96",
                        children: w.jsx("i", {
                            className: "ri-leaf-line text-[400px] text-white transform -rotate-12"
                        })
                    }), w.jsx("div", {
                        className: "absolute bottom-20 right-10 w-80 h-80",
                        children: w.jsx("i", {
                            className: "ri-plant-line text-[350px] text-white transform rotate-45"
                        })
                    })]
                }), w.jsxs("div", {
                    className: "relative z-10 text-center px-8",
                    children: [w.jsx("div", {
                        className: "flex justify-center mb-6",
                        children: w.jsx("div", {
                            className: "w-28 h-28 flex items-center justify-center",
                            children: w.jsx("img", {
                                
                                alt: "Herbal Queen Crown",
                                className: "w-28 h-28 object-contain",
                                style: {
                                    filter: "brightness(0) invert(1)"
                                }
                            })
                        })
                    }), w.jsxs("h1", {
                        className: "text-white mb-6",
                        children: [w.jsx("div", {
                            className: "text-6xl lg:text-7xl font-bold tracking-tight mb-2",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "HERBAL"
                        }), w.jsx("div", {
                            className: "text-6xl lg:text-7xl font-bold tracking-tight",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "QUEEN"
                        })]
                    }), w.jsx("p", {
                        className: "text-white text-sm tracking-[0.15em] font-light uppercase",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "5 Sacred Ayurvedic Herbs for Women"
                    })]
                })]
            }), w.jsxs("div", {
                className: "lg:w-[60%] relative flex items-center justify-center bg-white py-24 lg:py-0 px-8",
                children: [w.jsxs("div", {
                    className: "absolute inset-0 overflow-hidden pointer-events-none",
                    children: [w.jsx("div", {
                        className: "absolute top-20 left-20 w-2 h-2 rounded-full animate-float",
                        style: {
                            backgroundColor: "#D0226F",
                            opacity: .3,
                            animationDelay: "0s"
                        }
                    }), w.jsx("div", {
                        className: "absolute top-40 right-32 w-2 h-2 rounded-full animate-float",
                        style: {
                            backgroundColor: "#D0226F",
                            opacity: .2,
                            animationDelay: "1s"
                        }
                    }), w.jsx("div", {
                        className: "absolute bottom-32 left-40 w-2 h-2 rounded-full animate-float",
                        style: {
                            backgroundColor: "#D0226F",
                            opacity: .25,
                            animationDelay: "2s"
                        }
                    }), w.jsx("div", {
                        className: "absolute top-60 right-20 w-2 h-2 rounded-full animate-float",
                        style: {
                            backgroundColor: "#D0226F",
                            opacity: .3,
                            animationDelay: "1.5s"
                        }
                    })]
                }), w.jsx("div", {
                    className: "absolute top-16 right-8 lg:right-16 w-64 h-96 lg:w-80 lg:h-[480px] transform rotate-[15deg] hover:rotate-[10deg] transition-transform duration-500",
                    children: w.jsx("img", {
                        
                        alt: "Herbal Queen Supplement Pouch",
                        className: "w-full h-full object-contain drop-shadow-2xl"
                    })
                }), w.jsxs("div", {
                    className: "relative z-10 max-w-md",
                    children: [w.jsxs("h2", {
                        className: "text-5xl lg:text-6xl leading-tight mb-8",
                        style: {
                            fontFamily: "Playfair Display, serif",
                            color: "#1a1a1a"
                        },
                        children: [w.jsx("div", {
                            children: "Radiance."
                        }), w.jsx("div", {
                            children: "Balance."
                        }), w.jsx("div", {
                            children: "Power."
                        })]
                    }), w.jsxs("div", {
                        className: "flex flex-col sm:flex-row gap-4",
                        children: [w.jsxs("button", {
                            className: "px-8 py-4 rounded-full font-semibold text-sm text-white whitespace-nowrap transition-all hover:scale-105 hover:shadow-lg flex items-center justify-center gap-2",
                            style: {
                                backgroundColor: "#D0226F"
                            },
                            children: ["SHOP NOW", w.jsx("i", {
                                className: "ri-arrow-right-line text-lg"
                            })]
                        }), w.jsx("button", {
                            className: "px-8 py-4 rounded-full font-semibold text-sm whitespace-nowrap transition-all hover:scale-105 border-2 hover:bg-gray-50",
                            style: {
                                borderColor: "#D0226F",
                                color: "#D0226F"
                            },
                            children: "LEARN MORE"
                        })]
                    })]
                })]
            })]
        }), w.jsx("style", {
            children: `
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `
        })]
    })
}
function Tx() {
    const i = [{
        name: "Ashwagandha",
        icon: "ri-leaf-line"
    }, {
        name: "Shatavari",
        icon: "ri-plant-line"
    }, {
        name: "Brahmi",
        icon: "ri-seedling-line"
    }, {
        name: "Turmeric",
        icon: "ri-flower-line"
    }, {
        name: "Holy Basil",
        icon: "ri-leaf-fill"
    }];
    return w.jsxs("section", {
        className: "relative py-32 overflow-hidden bg-white",
        children: [w.jsxs("div", {
            className: "absolute inset-0",
            children: [w.jsx("div", {
                className: "absolute inset-0 bg-white",
                style: {
                    clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 60%)"
                }
            }), w.jsx("div", {
                className: "absolute inset-0",
                style: {
                    background: "#D0226F",
                    clipPath: "polygon(0 60%, 100% 45%, 100% 100%, 0 100%)"
                }
            })]
        }), w.jsxs("div", {
            className: "relative z-10 max-w-7xl mx-auto px-8",
            children: [w.jsx("div", {
                className: "mb-48",
                children: w.jsxs("div", {
                    className: "relative",
                    children: [w.jsx("div", {
                        className: "absolute -top-8 left-0 text-[200px] font-bold leading-none opacity-10",
                        style: {
                            color: "#D0226F",
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "01"
                    }), w.jsxs("div", {
                        className: "relative pt-24",
                        children: [w.jsx("h2", {
                            className: "text-5xl font-bold mb-12 text-gray-900",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "ANCIENT WISDOM"
                        }), w.jsx("div", {
                            className: "flex items-center gap-8 flex-wrap",
                            children: i.map( (a, r) => w.jsxs("div", {
                                className: "flex flex-col items-center gap-3",
                                children: [w.jsx("div", {
                                    className: "w-20 h-20 rounded-full flex items-center justify-center bg-white shadow-lg border-2 hover:scale-110 transition-transform cursor-pointer",
                                    style: {
                                        borderColor: "#D0226F"
                                    },
                                    children: w.jsx("i", {
                                        className: `${a.icon} text-3xl`,
                                        style: {
                                            color: "#D0226F"
                                        }
                                    })
                                }), w.jsx("span", {
                                    className: "text-xs text-gray-600 font-medium text-center",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: a.name
                                }), r < i.length - 1 && w.jsx("div", {
                                    className: "hidden lg:block absolute h-0.5 w-16 left-full top-10 ml-4",
                                    style: {
                                        backgroundColor: "#D0226F"
                                    }
                                })]
                            }, r))
                        })]
                    })]
                })
            }), w.jsx("div", {
                className: "text-right",
                children: w.jsxs("div", {
                    className: "inline-block text-left max-w-2xl",
                    children: [w.jsx("h2", {
                        className: "text-5xl font-bold mb-8 text-white",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "MEETS MODERN SCIENCE"
                    }), w.jsxs("p", {
                        className: "text-white text-lg leading-relaxed mb-6",
                        style: {
                            fontFamily: "Poppins, sans-serif",
                            lineHeight: "1.8"
                        },
                        children: ["Our proprietary blend combines ", w.jsx("strong", {
                            children: "5 sacred Ayurvedic herbs"
                        }), " used for centuries in traditional wellness practices, now validated by modern clinical research. Each capsule delivers the perfect synergy of nature's wisdom and scientific precision."]
                    }), w.jsxs("p", {
                        className: "text-white text-lg leading-relaxed",
                        style: {
                            fontFamily: "Poppins, sans-serif",
                            lineHeight: "1.8"
                        },
                        children: ["Formulated specifically for women's unique wellness needs, ", w.jsx("strong", {
                            children: "Herbal Queen"
                        }), " supports hormonal balance, stress resilience, and natural vitality without synthetic additives or harsh chemicals."]
                    }), w.jsx("p", {
                        className: "text-white text-xs mt-6 opacity-60",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "*These statements have not been evaluated by the FDA. This product is not intended to diagnose, treat, cure, or prevent any disease."
                    })]
                })
            }),
    })
}
function Ox() {
    const i = [{
        icon: "ri-heart-pulse-line",
        title: "ANXIETY & STRESS*",
        description: "Adaptogenic herbs help your body naturally manage stress responses and promote emotional balance throughout your day.",
        bgColor: "#D0226F",
        textColor: "white"
    }, {
        icon: "ri-scales-3-line",
        title: "WEIGHT SUPPORT*",
        description: "Support healthy metabolism and natural weight management through hormonal balance and stress reduction.",
        bgColor: "white",
        textColor: "#D0226F"
    }, {
        icon: "ri-moon-line",
        title: "RESTFUL SLEEP*",
        description: "Calming botanicals promote deeper, more restorative sleep cycles so you wake refreshed and energized.",
        bgColor: "white",
        textColor: "#D0226F"
    }, {
        icon: "ri-flashlight-line",
        title: "ENERGY & FOCUS*",
        description: "Natural vitality without jitters or crashes. Experience sustained mental clarity and physical stamina.",
        bgColor: "#D0226F",
        textColor: "white"
    }];
    return w.jsx("section", {
        id: "benefits",
        className: "py-32 px-8",
        style: {
            backgroundColor: "#FAFAF8"
        },
        children: w.jsxs("div", {
            className: "max-w-7xl mx-auto",
            children: [w.jsxs("div", {
                className: "text-center mb-20",
                children: [w.jsx("h2", {
                    className: "text-5xl lg:text-6xl font-bold mb-6 text-gray-900",
                    style: {
                        fontFamily: "Poppins, sans-serif"
                    },
                    children: "Transform Your Wellness"
                }), w.jsxs("p", {
                    className: "text-xl text-gray-600 max-w-3xl mx-auto",
                    style: {
                        fontFamily: "Poppins, sans-serif"
                    },
                    children: ["Experience the power of ", w.jsx("strong", {
                        children: "5 sacred Ayurvedic herbs"
                    }), " working in harmony to support your body's natural balance and vitality."]
                })]
            }), w.jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-2 gap-8",
                children: [w.jsx("div", {
                    className: "flex flex-col gap-8",
                    children: i.slice(0, 2).map( (a, r) => w.jsxs("div", {
                        className: "rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer relative overflow-hidden group",
                        style: {
                            backgroundColor: a.bgColor,
                            minHeight: r === 0 ? "400px" : "350px"
                        },
                        children: [w.jsx("div", {
                            className: "absolute inset-0 opacity-10 overflow-hidden",
                            children: w.jsx("i", {
                                className: `ri-leaf-line text-[300px] absolute -bottom-20 -right-20 transform rotate-12 ${a.bgColor === "white" ? "text-gray-300" : "text-white"}`
                            })
                        }), w.jsxs("div", {
                            className: "relative z-10",
                            children: [w.jsx("div", {
                                className: "w-16 h-16 flex items-center justify-center mb-6",
                                children: w.jsx("i", {
                                    className: `${a.icon} text-5xl`,
                                    style: {
                                        color: a.textColor === "white" ? "white" : "#D0226F"
                                    }
                                })
                            }), w.jsx("h3", {
                                className: "text-3xl font-bold mb-4",
                                style: {
                                    fontFamily: "Poppins, sans-serif",
                                    color: a.textColor === "white" ? "white" : "#D0226F"
                                },
                                children: a.title
                            }), w.jsx("p", {
                                className: "text-base leading-relaxed mb-6",
                                style: {
                                    fontFamily: "Poppins, sans-serif",
                                    color: a.textColor === "white" ? "white" : "#1a1a1a",
                                    lineHeight: "1.6"
                                },
                                children: a.description
                            }), w.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [w.jsx("div", {
                                    className: "w-2 h-2 rounded-full",
                                    style: {
                                        backgroundColor: a.textColor === "white" ? "white" : "#D0226F"
                                    }
                                }), w.jsx("span", {
                                    className: "text-xs font-medium",
                                    style: {
                                        fontFamily: "Poppins, sans-serif",
                                        color: a.textColor === "white" ? "white" : "#D0226F"
                                    },
                                    children: "CLINICALLY STUDIED*"
                                })]
                            })]
                        })]
                    }, r))
                }), w.jsx("div", {
                    className: "flex flex-col gap-8",
                    children: i.slice(2, 4).map( (a, r) => w.jsxs("div", {
                        className: "rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer relative overflow-hidden group",
                        style: {
                            backgroundColor: a.bgColor,
                            minHeight: "350px"
                        },
                        children: [w.jsx("div", {
                            className: "absolute inset-0 opacity-10 overflow-hidden",
                            children: w.jsx("i", {
                                className: `ri-plant-line text-[280px] absolute -top-20 -left-20 transform -rotate-12 ${a.bgColor === "white" ? "text-gray-300" : "text-white"}`
                            })
                        }), w.jsxs("div", {
                            className: "relative z-10",
                            children: [w.jsx("div", {
                                className: "w-16 h-16 flex items-center justify-center mb-6",
                                children: w.jsx("i", {
                                    className: `${a.icon} text-5xl`,
                                    style: {
                                        color: a.textColor === "white" ? "white" : "#D0226F"
                                    }
                                })
                            }), w.jsx("h3", {
                                className: "text-3xl font-bold mb-4",
                                style: {
                                    fontFamily: "Poppins, sans-serif",
                                    color: a.textColor === "white" ? "white" : "#D0226F"
                                },
                                children: a.title
                            }), w.jsx("p", {
                                className: "text-base leading-relaxed mb-6",
                                style: {
                                    fontFamily: "Poppins, sans-serif",
                                    color: a.textColor === "white" ? "white" : "#1a1a1a",
                                    lineHeight: "1.6"
                                },
                                children: a.description
                            }), w.jsxs("div", {
                                className: "flex items-center gap-2",
                                children: [w.jsx("div", {
                                    className: "w-2 h-2 rounded-full",
                                    style: {
                                        backgroundColor: a.textColor === "white" ? "white" : "#D0226F"
                                    }
                                }), w.jsx("span", {
                                    className: "text-xs font-medium",
                                    style: {
                                        fontFamily: "Poppins, sans-serif",
                                        color: a.textColor === "white" ? "white" : "#D0226F"
                                    },
                                    children: "CLINICALLY STUDIED*"
                                })]
                            })]
                        })]
                    }, r))
                })]
            })]
        })
    })
}

    return H.useEffect( () => {
        const c = () => {
            if (i.current) {
                const {scrollLeft: d, scrollWidth: m, clientWidth: g} = i.current
                  , p = d / (m - g) * 100;
                r(p)
            }
        }
          , f = i.current;
        if (f)
            return f.addEventListener("scroll", c),
            () => f.removeEventListener("scroll", c)
    }
    , []),
    w.jsxs("section", {
        id: "ingredients",
        className: "relative py-32 overflow-hidden bg-white",
        children: [w.jsxs("div", {
            className: "flex h-[600px]",
            children: [w.jsxs("div", {
                className: "w-full lg:w-1/4 flex items-center justify-center relative",
                style: {
                    backgroundColor: "#B01D5F"
                },
                children: [w.jsx("div", {
                    className: "absolute left-12 top-1/2 transform -translate-y-1/2 -rotate-90 origin-center",
                    children: w.jsx("h2", {
                        className: "text-3xl font-bold text-white whitespace-nowrap tracking-wider",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "INSIDE EVERY CAPSULE"
                    })
                }), w.jsxs("div", {
                    className: "text-center",
                    children: [w.jsx("div", {
                        className: "text-[180px] font-bold leading-none text-white",
                        style: {
                            fontFamily: "Poppins, sans-serif",
                            WebkitTextStroke: "2px white",
                            WebkitTextFillColor: "transparent"
                        },
                        children: "60"
                    }), w.jsx("p", {
                        className: "text-white text-sm font-medium tracking-wider",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "CAPSULES"
                    })]
                }), w.jsx("button", {
                    className: "absolute bottom-12 left-1/2 transform -translate-x-1/2 w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg",
                    style: {
                        color: "#D0226F"
                    },
                    children: w.jsx("i", {
                        className: "ri-add-line text-3xl"
                    })
                })]
            }), w.jsxs("div", {
                className: "w-full lg:w-3/4 relative",
                children: [w.jsx("div", {
                    ref: i,
                    className: "flex gap-6 overflow-x-auto h-full px-8 py-12 scrollbar-hide",
                    style: {
                        scrollBehavior: "smooth"
                    },
                    children: u.map( (c, f) => w.jsxs("div", {
                        className: "flex-shrink-0 w-[400px] bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer",
                        children: [w.jsxs("div", {
                            className: "h-[280px] w-full overflow-hidden relative",
                            children: [w.jsx("img", {
                                src: c.image,
                                alt: c.name,
                                className: "w-full h-full object-cover",
                                style: {
                                    objectPosition: "center"
                                }
                            }), w.jsx("div", {
                                className: "absolute inset-0 bg-gradient-to-b from-transparent to-black/20"
                            })]
                        }), w.jsxs("div", {
                            className: "p-8 bg-white",
                            children: [w.jsx("h3", {
                                className: "text-2xl font-bold mb-2 text-gray-900",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: c.name
                            }), w.jsx("p", {
                                className: "text-sm italic text-gray-500 mb-4",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: c.sanskrit
                            }), w.jsx("p", {
                                className: "text-sm text-gray-700 leading-relaxed",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: c.benefit
                            })]
                        })]
                    }, f))
                }), w.jsx("div", {
                    className: "absolute bottom-0 left-0 right-0 h-1",
                    style: {
                        backgroundColor: "#f0f0f0"
                    },
                    children: w.jsx("div", {
                        className: "h-full transition-all duration-200",
                        style: {
                            backgroundColor: "#D0226F",
                            width: `${a}%`
                        }
                    })
                })]
            })]
        }), w.jsx("style", {
            children: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `
        })]
    })
}
function Nx() {
    return w.jsxs("section", {
        id: "reviews",
        className: "relative py-32 overflow-hidden",
        children: [w.jsxs("div", {
            className: "absolute inset-0",
            children: [w.jsx("img", {
                
                alt: "Customer Testimonial",
                className: "w-full h-full object-cover object-center"
            }), w.jsx("div", {
                className: "absolute inset-0 bg-gradient-to-r from-white/95 via-white/70 to-transparent"
            })]
        }), w.jsx("div", {
            className: "relative z-10 max-w-7xl mx-auto px-8",
            children: w.jsxs("div", {
                className: "max-w-2xl",
                children: [w.jsx("blockquote", {
                    className: "text-5xl lg:text-6xl leading-tight mb-8 text-gray-900",
                    style: {
                        fontFamily: "Playfair Display, serif"
                    },
                    children: '"I feel like the best version of myself"'
                }), w.jsx("p", {
                    className: "text-lg text-gray-600 mb-6",
                    style: {
                        fontFamily: "Poppins, sans-serif"
                    },
                    children: "— Sarah M., Verified Customer"
                }), w.jsxs("div", {
                    className: "flex items-center gap-3 mb-12",
                    children: [w.jsx("div", {
                        className: "flex gap-1",
                        children: [1, 2, 3, 4, 5].map(i => w.jsx("i", {
                            className: "ri-star-fill text-2xl",
                            style: {
                                color: "#D0226F"
                            }
                        }, i))
                    }), w.jsx("span", {
                        className: "text-sm text-gray-600",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "4.9/5 from 2,847 reviews"
                    })]
                }), w.jsxs("div", {
                    className: "bg-white/80 backdrop-blur-sm rounded-3xl p-10 shadow-xl",
                    children: [w.jsx("h3", {
                        className: "text-xl font-bold mb-8",
                        style: {
                            fontFamily: "Poppins, sans-serif",
                            color: "#D0226F"
                        },
                        children: "REAL RESULTS"
                    }), w.jsxs("div", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-8",
                        children: [w.jsxs("div", {
                            children: [w.jsx("div", {
                                className: "text-5xl font-bold text-gray-900 mb-2",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: "87%"
                            }), w.jsx("p", {
                                className: "text-sm text-gray-600",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: "Feel More Balanced*"
                            })]
                        }), w.jsxs("div", {
                            children: [w.jsx("div", {
                                className: "text-5xl font-bold text-gray-900 mb-2",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: "92%"
                            }), w.jsx("p", {
                                className: "text-sm text-gray-600",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: "Notice Better Sleep*"
                            })]
                        }), w.jsxs("div", {
                            children: [w.jsx("div", {
                                className: "text-5xl font-bold text-gray-900 mb-2",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: "4 weeks"
                            }), w.jsx("p", {
                                className: "text-sm text-gray-600",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                children: "Average Time to Results*"
                            })]
                        })]
                    })]
                })]
            })
        }), w.jsx("button", {
            className: "absolute bottom-12 right-12 px-10 py-5 rounded-full font-semibold text-sm text-white whitespace-nowrap shadow-2xl hover:scale-110 transition-all animate-pulse-slow",
            style: {
                backgroundColor: "#D0226F"
            },
            children: "SHOP NOW"
        }), w.jsx("style", {
            children: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `
        })]
    })
}
function Rx() {
    const [i,a] = H.useState("")
      , r = u => {
        u.preventDefault(),
        alert("Thank you for subscribing!"),
        a("")
    }
    ;
    return w.jsxs("footer", {
        className: "relative py-20 overflow-hidden",
        style: {
            backgroundColor: "#8F1554"
        },
        children: [w.jsx("div", {
            className: "absolute inset-0 opacity-10 overflow-hidden pointer-events-none",
            children: w.jsx("i", {
                className: "ri-plant-line absolute bottom-0 left-1/2 transform -translate-x-1/2 text-[800px] text-white"
            })
        }), w.jsxs("div", {
            className: "relative z-10 max-w-7xl mx-auto px-8",
            children: [w.jsxs("div", {
                className: "grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16",
                children: [w.jsxs("div", {
                    className: "lg:col-span-4",
                    children: [w.jsxs("div", {
                        className: "flex items-center gap-2 mb-8",
                        children: [w.jsx("div", {
                            className: "w-10 h-10 flex items-center justify-center",
                            children: w.jsx("img", {
                            
                                alt: "Herbal Queen Logo",
                                className: "w-10 h-10 object-contain",
                                style: {
                                    filter: "brightness(0) invert(1)"
                                }
                            })
                        }), w.jsx("span", {
                            className: "text-2xl font-bold text-white tracking-tight",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "HERBAL QUEEN"
                        })]
                    }), w.jsx("form", {
                        onSubmit: r,
                        className: "mb-6",
                        children: w.jsxs("div", {
                            className: "flex gap-3",
                            children: [w.jsx("input", {
                                type: "email",
                                value: i,
                                onChange: u => a(u.target.value),
                                placeholder: "Enter your email",
                                className: "flex-1 px-6 py-4 rounded-full bg-transparent border-2 border-white/50 text-white placeholder-white/60 focus:outline-none focus:border-white transition-colors",
                                style: {
                                    fontFamily: "Poppins, sans-serif"
                                },
                                required: !0
                            }), w.jsx("button", {
                                type: "submit",
                                className: "w-14 h-14 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform",
                                style: {
                                    color: "#8F1554"
                                },
                                children: w.jsx("i", {
                                    className: "ri-notification-line text-xl"
                                })
                            })]
                        })
                    }), w.jsxs("h3", {
                        className: "text-3xl font-medium text-white leading-tight",
                        style: {
                            fontFamily: "Playfair Display, serif"
                        },
                        children: ["JOIN 50K+", w.jsx("br", {}), "QUEENS"]
                    })]
                }), w.jsxs("div", {
                    className: "lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-8",
                    children: [w.jsxs("div", {
                        children: [w.jsx("h4", {
                            className: "text-sm font-bold text-white mb-4 tracking-wider",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "SHOP"
                        }), w.jsxs("ul", {
                            className: "space-y-3",
                            children: [w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "All Products"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Bundles"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Subscribe & Save"
                                })
                            })]
                        })]
                    }), w.jsxs("div", {
                        children: [w.jsx("h4", {
                            className: "text-sm font-bold text-white mb-4 tracking-wider",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "LEARN"
                        }), w.jsxs("ul", {
                            className: "space-y-3",
                            children: [w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Our Story"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Ingredients"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Blog"
                                })
                            })]
                        })]
                    }), w.jsxs("div", {
                        children: [w.jsx("h4", {
                            className: "text-sm font-bold text-white mb-4 tracking-wider",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "SUPPORT"
                        }), w.jsxs("ul", {
                            className: "space-y-3",
                            children: [w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "FAQ"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Contact Us"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Shipping"
                                })
                            })]
                        })]
                    }), w.jsxs("div", {
                        children: [w.jsx("h4", {
                            className: "text-sm font-bold text-white mb-4 tracking-wider",
                            style: {
                                fontFamily: "Poppins, sans-serif"
                            },
                            children: "CONNECT"
                        }), w.jsxs("ul", {
                            className: "space-y-3",
                            children: [w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Instagram"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Community"
                                })
                            }), w.jsx("li", {
                                children: w.jsx("a", {
                                    href: "#",
                                    className: "text-sm text-white/80 hover:text-white transition-colors",
                                    style: {
                                        fontFamily: "Poppins, sans-serif"
                                    },
                                    children: "Affiliate"
                                })
                            })]
                        })]
                    })]
                })]
            }), w.jsxs("div", {
                className: "pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-6",
                children: [w.jsx("p", {
                    className: "text-xs text-white/80",
                    style: {
                        fontFamily: "Poppins, sans-serif"
                    },
                    children: "© 2025 Herbal Queen. All rights reserved."
                }), w.jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [w.jsx("a", {
                        href: "#",
                        className: "w-10 h-10 rounded-lg border-2 border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#8F1554] transition-all",
                        children: w.jsx("i", {
                            className: "ri-instagram-line text-lg"
                        })
                    }), w.jsx("a", {
                        href: "#",
                        className: "w-10 h-10 rounded-lg border-2 border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#8F1554] transition-all",
                        children: w.jsx("i", {
                            className: "ri-tiktok-line text-lg"
                        })
                    }), w.jsx("a", {
                        href: "#",
                        className: "w-10 h-10 rounded-lg border-2 border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#8F1554] transition-all",
                        children: w.jsx("i", {
                            className: "ri-pinterest-line text-lg"
                        })
                    }), w.jsx("a", {
                        href: "#",
                        className: "w-10 h-10 rounded-lg border-2 border-white/50 flex items-center justify-center text-white hover:bg-white hover:text-[#8F1554] transition-all",
                        children: w.jsx("i", {
                            className: "ri-facebook-line text-lg"
                        })
                    })]
                }), w.jsxs("div", {
                    className: "flex items-center gap-4",
                    children: [w.jsx("a", {
                        href: "#",
                        className: "text-xs text-white/80 hover:text-white transition-colors",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "Privacy Policy"
                    }), w.jsx("span", {
                        className: "text-white/40",
                        children: "|"
                    }), w.jsx("a", {
                        href: "#",
                        className: "text-xs text-white/80 hover:text-white transition-colors",
                        style: {
                            fontFamily: "Poppins, sans-serif"
                        },
                        children: "Terms"
                    })]
                })]
            })]
        })]
    })
}
function Lx() {
    return w.jsxs("div", {
        className: "min-h-screen bg-white",
        children: [w.jsx(Cx, {}), w.jsx(Tx, {}), w.jsx(Ox, {}), w.jsx(Ax, {}), w.jsx(Nx, {}), w.jsx(Rx, {})]
    })
}
const fp = [{
    path: "/",
    element: w.jsx(Lx, {})
}, {
    path: "*",
    element: w.jsx(_x, {})
}]
  , jx = Object.freeze(Object.defineProperty({
    __proto__: null,
    default: fp
}, Symbol.toStringTag, {
    value: "Module"
}));
let dp;
const Dx = new Promise(i => {
    dp = i
}
);
function hp() {
    const i = Lb(fp)
      , a = np();
    return H.useEffect( () => {
        window.REACT_APP_NAVIGATE = a,
        dp(window.REACT_APP_NAVIGATE)
    }
    ),
    i
}
const Mx = Object.freeze(Object.defineProperty({
    __proto__: null,
    AppRoutes: hp,
    navigatePromise: Dx
}, Symbol.toStringTag, {
    value: "Module"
}));
function zx() {
    return w.jsx(T1, {
        i18n: tt,
        children: w.jsx(mx, {
            basename: "/preview/77c4cc08-a436-49c8-b40f-f3c523d34553/7315782",
            children: w.jsx(hp, {})
        })
    })
}
F1.createRoot(document.getElementById("root")).render(w.jsx(H.StrictMode, {
    children: w.jsx(zx, {})
}));
//# sourceMappingURL=index-C0BA2wco.js.map
