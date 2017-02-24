/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:8080/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _inferno = __webpack_require__(1);
	
	var _inferno2 = _interopRequireDefault(_inferno);
	
	__webpack_require__(3);
	
	var _infernoRouter = __webpack_require__(7);
	
	var _createBrowserHistory = __webpack_require__(12);
	
	var _createBrowserHistory2 = _interopRequireDefault(_createBrowserHistory);
	
	var _infernoRedux = __webpack_require__(22);
	
	var _store = __webpack_require__(45);
	
	var _store2 = _interopRequireDefault(_store);
	
	var _App = __webpack_require__(46);
	
	var _App2 = _interopRequireDefault(_App);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	// scss module
	if (false) {
	    require('inferno-devtools');
	}
	
	// app component
	
	
	// state modules
	
	
	// routing modules
	// inferno module
	
	
	var browserHistory = (0, _createBrowserHistory2.default)();
	
	var createVNode = _inferno2.default.createVNode;
	var routes = createVNode(16, _infernoRedux.Provider, {
	    'store': _store2.default,
	    children: createVNode(16, _infernoRouter.Router, {
	        'history': browserHistory,
	        children: createVNode(16, _infernoRouter.Route, {
	            'component': _App2.default
	        })
	    })
	});
	
	_inferno2.default.render(createVNode(16, _App2.default), document.getElementById('app-root'));
	
	if (false) {
	    module.hot.accept();
	}

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*!
	 * Inferno v1.3.0-rc.4
	 * (c) 2017 Dominic Gannaway'
	 * Released under the MIT License.
	 */
	
	(function (global, factory) {
	    ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports) :  true ? !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : factory(global.Inferno = global.Inferno || {});
	})(undefined, function (exports) {
	    'use strict';
	
	    var NO_OP = '$NO_OP';
	    var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
	    var isBrowser = typeof window !== 'undefined' && window.document;
	
	    // this is MUCH faster than .constructor === Array and instanceof Array
	    // in Node 7 and the later versions of V8, slower in older versions though
	    var isArray = Array.isArray;
	    function isStatefulComponent(o) {
	        return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
	    }
	    function isStringOrNumber(obj) {
	        var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
	        return type === 'string' || type === 'number';
	    }
	    function isNullOrUndef(obj) {
	        return isUndefined(obj) || isNull(obj);
	    }
	    function isInvalid(obj) {
	        return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
	    }
	    function isFunction(obj) {
	        return typeof obj === 'function';
	    }
	    function isAttrAnEvent(attr) {
	        return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
	    }
	    function isString(obj) {
	        return typeof obj === 'string';
	    }
	    function isNumber(obj) {
	        return typeof obj === 'number';
	    }
	    function isNull(obj) {
	        return obj === null;
	    }
	    function isTrue(obj) {
	        return obj === true;
	    }
	    function isUndefined(obj) {
	        return obj === undefined;
	    }
	    function isObject(o) {
	        return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
	    }
	    function throwError(message) {
	        if (!message) {
	            message = ERROR_MSG;
	        }
	        throw new Error("Inferno Error: " + message);
	    }
	    function warning(message) {
	        console.warn(message);
	    }
	    function Lifecycle() {
	        this.listeners = [];
	    }
	    Lifecycle.prototype.addListener = function addListener(callback) {
	        this.listeners.push(callback);
	    };
	    Lifecycle.prototype.trigger = function trigger() {
	        var this$1 = this;
	
	        for (var i = 0, len = this.listeners.length; i < len; i++) {
	            this$1.listeners[i]();
	        }
	    };
	    function copyPropsTo(copyFrom, copyTo) {
	        for (var prop in copyFrom) {
	            if (isUndefined(copyTo[prop])) {
	                copyTo[prop] = copyFrom[prop];
	            }
	        }
	    }
	
	    function applyKey(key, vNode) {
	        vNode.key = key;
	        return vNode;
	    }
	    function applyKeyIfMissing(key, vNode) {
	        if (isNumber(key)) {
	            key = "." + key;
	        }
	        if (isNull(vNode.key) || vNode.key[0] === '.') {
	            return applyKey(key, vNode);
	        }
	        return vNode;
	    }
	    function applyKeyPrefix(key, vNode) {
	        vNode.key = key + vNode.key;
	        return vNode;
	    }
	    function _normalizeVNodes(nodes, result, index, currentKey) {
	        for (var len = nodes.length; index < len; index++) {
	            var n = nodes[index];
	            var key = currentKey + "." + index;
	            if (!isInvalid(n)) {
	                if (isArray(n)) {
	                    _normalizeVNodes(n, result, 0, key);
	                } else {
	                    if (isStringOrNumber(n)) {
	                        n = createTextVNode(n);
	                    } else if (isVNode(n) && n.dom || n.key && n.key[0] === '.') {
	                        n = cloneVNode(n);
	                    }
	                    if (isNull(n.key) || n.key[0] === '.') {
	                        n = applyKey(key, n);
	                    } else {
	                        n = applyKeyPrefix(currentKey, n);
	                    }
	                    result.push(n);
	                }
	            }
	        }
	    }
	    function normalizeVNodes(nodes) {
	        var newNodes;
	        // we assign $ which basically means we've flagged this array for future note
	        // if it comes back again, we need to clone it, as people are using it
	        // in an immutable way
	        // tslint:disable
	        if (nodes['$']) {
	            nodes = nodes.slice();
	        } else {
	            nodes['$'] = true;
	        }
	        // tslint:enable
	        for (var i = 0, len = nodes.length; i < len; i++) {
	            var n = nodes[i];
	            if (isInvalid(n) || isArray(n)) {
	                var result = (newNodes || nodes).slice(0, i);
	                _normalizeVNodes(nodes, result, i, "");
	                return result;
	            } else if (isStringOrNumber(n)) {
	                if (!newNodes) {
	                    newNodes = nodes.slice(0, i);
	                }
	                newNodes.push(applyKeyIfMissing(i, createTextVNode(n)));
	            } else if (isVNode(n) && n.dom || isNull(n.key) && !(n.flags & 64 /* HasNonKeyedChildren */)) {
	                if (!newNodes) {
	                    newNodes = nodes.slice(0, i);
	                }
	                newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
	            } else if (newNodes) {
	                newNodes.push(applyKeyIfMissing(i, cloneVNode(n)));
	            }
	        }
	        return newNodes || nodes;
	    }
	    function normalizeChildren(children) {
	        if (isArray(children)) {
	            return normalizeVNodes(children);
	        } else if (isVNode(children) && children.dom) {
	            return cloneVNode(children);
	        }
	        return children;
	    }
	    function normalizeProps(vNode, props, children) {
	        if (!(vNode.flags & 28 /* Component */) && isNullOrUndef(children) && !isNullOrUndef(props.children)) {
	            vNode.children = props.children;
	        }
	        if (props.ref) {
	            vNode.ref = props.ref;
	            delete props.ref;
	        }
	        if (props.events) {
	            vNode.events = props.events;
	        }
	        if (!isNullOrUndef(props.key)) {
	            vNode.key = props.key;
	            delete props.key;
	        }
	    }
	    function normalizeElement(type, vNode) {
	        if (type === 'svg') {
	            vNode.flags = 128 /* SvgElement */;
	        } else if (type === 'input') {
	            vNode.flags = 512 /* InputElement */;
	        } else if (type === 'select') {
	            vNode.flags = 2048 /* SelectElement */;
	        } else if (type === 'textarea') {
	            vNode.flags = 1024 /* TextareaElement */;
	        } else if (type === 'media') {
	            vNode.flags = 256 /* MediaElement */;
	        } else {
	            vNode.flags = 2 /* HtmlElement */;
	        }
	    }
	    function normalize(vNode) {
	        var props = vNode.props;
	        var hasProps = !isNull(props);
	        var type = vNode.type;
	        var children = vNode.children;
	        // convert a wrongly created type back to element
	        if (isString(type) && vNode.flags & 28 /* Component */) {
	            normalizeElement(type, vNode);
	            if (hasProps && props.children) {
	                vNode.children = props.children;
	                children = props.children;
	            }
	        }
	        if (hasProps) {
	            normalizeProps(vNode, props, children);
	        }
	        if (!isInvalid(children)) {
	            vNode.children = normalizeChildren(children);
	        }
	        if (hasProps && !isInvalid(props.children)) {
	            props.children = normalizeChildren(props.children);
	        }
	        if (process.env.NODE_ENV !== 'production') {
	            // This code will be stripped out from production CODE
	            // It will help users to track errors in their applications.
	            var verifyKeys = function verifyKeys(vNodes) {
	                var keyValues = vNodes.map(function (vnode) {
	                    return vnode.key;
	                });
	                keyValues.some(function (item, idx) {
	                    var hasDuplicate = keyValues.indexOf(item) !== idx;
	                    if (hasDuplicate) {
	                        warning('Inferno normalisation(...): Encountered two children with same key, all keys must be unique within its siblings. Duplicated key is:' + item);
	                    }
	                    return hasDuplicate;
	                });
	            };
	            if (vNode.children && Array.isArray(vNode.children)) {
	                verifyKeys(vNode.children);
	            }
	        }
	    }
	
	    var options = {
	        recyclingEnabled: false,
	        findDOMNodeEnabled: false,
	        roots: null,
	        createVNode: null,
	        beforeRender: null,
	        afterRender: null,
	        afterMount: null,
	        afterUpdate: null,
	        beforeUnmount: null
	    };
	
	    function createVNode(flags, type, props, children, events, key, ref, noNormalise) {
	        if (flags & 16 /* ComponentUnknown */) {
	                flags = isStatefulComponent(type) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
	            }
	        var vNode = {
	            children: isUndefined(children) ? null : children,
	            dom: null,
	            events: events || null,
	            flags: flags,
	            key: isUndefined(key) ? null : key,
	            props: props || null,
	            ref: ref || null,
	            type: type
	        };
	        if (!noNormalise) {
	            normalize(vNode);
	        }
	        if (options.createVNode) {
	            options.createVNode(vNode);
	        }
	        return vNode;
	    }
	    function cloneVNode(vNodeToClone, props) {
	        var _children = [],
	            len$2 = arguments.length - 2;
	        while (len$2-- > 0) {
	            _children[len$2] = arguments[len$2 + 2];
	        }var children = _children;
	        if (_children.length > 0 && !isNull(_children[0])) {
	            if (!props) {
	                props = {};
	            }
	            if (_children.length === 1) {
	                children = _children[0];
	            }
	            if (isUndefined(props.children)) {
	                props.children = children;
	            } else {
	                if (isArray(children)) {
	                    if (isArray(props.children)) {
	                        props.children = props.children.concat(children);
	                    } else {
	                        props.children = [props.children].concat(children);
	                    }
	                } else {
	                    if (isArray(props.children)) {
	                        props.children.push(children);
	                    } else {
	                        props.children = [props.children];
	                        props.children.push(children);
	                    }
	                }
	            }
	        }
	        children = null;
	        var newVNode;
	        if (isArray(vNodeToClone)) {
	            var tmpArray = [];
	            for (var i = 0, len = vNodeToClone.length; i < len; i++) {
	                tmpArray.push(cloneVNode(vNodeToClone[i]));
	            }
	            newVNode = tmpArray;
	        } else {
	            var flags = vNodeToClone.flags;
	            var events = vNodeToClone.events || props && props.events || null;
	            var key = !isNullOrUndef(vNodeToClone.key) ? vNodeToClone.key : props ? props.key : null;
	            var ref = vNodeToClone.ref || (props ? props.ref : null);
	            if (flags & 28 /* Component */) {
	                    newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), null, events, key, ref, true);
	                    var newProps = newVNode.props;
	                    if (newProps) {
	                        var newChildren = newProps.children;
	                        // we need to also clone component children that are in props
	                        // as the children may also have been hoisted
	                        if (newChildren) {
	                            if (isArray(newChildren)) {
	                                for (var i$1 = 0, len$1 = newChildren.length; i$1 < len$1; i$1++) {
	                                    var child = newChildren[i$1];
	                                    if (!isInvalid(child) && isVNode(child)) {
	                                        newProps.children[i$1] = cloneVNode(child);
	                                    }
	                                }
	                            } else if (isVNode(newChildren)) {
	                                newProps.children = cloneVNode(newChildren);
	                            }
	                        }
	                    }
	                    newVNode.children = null;
	                } else if (flags & 3970 /* Element */) {
	                    children = props && props.children || vNodeToClone.children;
	                    newVNode = createVNode(flags, vNodeToClone.type, Object.assign({}, vNodeToClone.props, props), children, events, key, ref, !children);
	                } else if (flags & 1 /* Text */) {
	                    newVNode = createTextVNode(vNodeToClone.children);
	                }
	        }
	        return newVNode;
	    }
	    function createVoidVNode() {
	        return createVNode(4096 /* Void */);
	    }
	    function createTextVNode(text) {
	        return createVNode(1 /* Text */, null, null, text, null, null, null, true);
	    }
	    function isVNode(o) {
	        return !!o.flags;
	    }
	
	    function linkEvent(data, event) {
	        return { data: data, event: event };
	    }
	
	    function constructDefaults(string, object, value) {
	        /* eslint no-return-assign: 0 */
	        var array = string.split(',');
	        for (var i = 0, len = array.length; i < len; i++) {
	            object[array[i]] = value;
	        }
	    }
	    var xlinkNS = 'http://www.w3.org/1999/xlink';
	    var xmlNS = 'http://www.w3.org/XML/1998/namespace';
	    var svgNS = 'http://www.w3.org/2000/svg';
	    var strictProps = {};
	    var booleanProps = {};
	    var namespaces = {};
	    var isUnitlessNumber = {};
	    var skipProps = {};
	    var delegatedProps = {};
	    constructDefaults('xlink:href,xlink:arcrole,xlink:actuate,xlink:role,xlink:titlef,xlink:type', namespaces, xlinkNS);
	    constructDefaults('xml:base,xml:lang,xml:space', namespaces, xmlNS);
	    constructDefaults('volume,defaultChecked', strictProps, true);
	    constructDefaults('children,childrenType,defaultValue,ref,key,selected,checked,multiple', skipProps, true);
	    constructDefaults('onClick,onMouseDown,onMouseUp,onMouseMove,onSubmit,onDblClick,onKeyDown,onKeyUp,onKeyPress', delegatedProps, true);
	    constructDefaults('muted,scoped,loop,open,checked,default,capture,disabled,readOnly,required,autoplay,controls,seamless,reversed,allowfullscreen,novalidate,hidden', booleanProps, true);
	    constructDefaults('animationIterationCount,borderImageOutset,borderImageSlice,borderImageWidth,boxFlex,boxFlexGroup,boxOrdinalGroup,columnCount,flex,flexGrow,flexPositive,flexShrink,flexNegative,flexOrder,gridRow,gridColumn,fontWeight,lineClamp,lineHeight,opacity,order,orphans,tabSize,widows,zIndex,zoom,fillOpacity,floodOpacity,stopOpacity,strokeDasharray,strokeDashoffset,strokeMiterlimit,strokeOpacity,strokeWidth,', isUnitlessNumber, true);
	
	    var isiOS = isBrowser && !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
	    var delegatedEvents = new Map();
	    function handleEvent(name, lastEvent, nextEvent, dom) {
	        var delegatedRoots = delegatedEvents.get(name);
	        if (nextEvent) {
	            if (!delegatedRoots) {
	                delegatedRoots = { items: new Map(), count: 0, docEvent: null };
	                delegatedRoots.docEvent = attachEventToDocument(name, delegatedRoots);
	                delegatedEvents.set(name, delegatedRoots);
	            }
	            if (!lastEvent) {
	                delegatedRoots.count++;
	                if (isiOS && name === 'onClick') {
	                    trapClickOnNonInteractiveElement(dom);
	                }
	            }
	            delegatedRoots.items.set(dom, nextEvent);
	        } else if (delegatedRoots) {
	            if (delegatedRoots.items.has(dom)) {
	                delegatedRoots.count--;
	                delegatedRoots.items.delete(dom);
	                if (delegatedRoots.count === 0) {
	                    document.removeEventListener(normalizeEventName(name), delegatedRoots.docEvent);
	                    delegatedEvents.delete(name);
	                }
	            }
	        }
	    }
	    function dispatchEvent(event, dom, items, count, eventData) {
	        var eventsToTrigger = items.get(dom);
	        if (eventsToTrigger) {
	            count--;
	            // linkEvent object
	            eventData.dom = dom;
	            if (eventsToTrigger.event) {
	                eventsToTrigger.event(eventsToTrigger.data, event);
	            } else {
	                eventsToTrigger(event);
	            }
	            if (eventData.stopPropagation) {
	                return;
	            }
	        }
	        if (count > 0) {
	            var parentDom = dom.parentNode;
	            // Html Nodes can be nested fe: span inside button in that scenario browser does not handle disabled attribute on parent,
	            // because the event listener is on document.body
	            if (parentDom && parentDom.disabled !== true || parentDom === document.body) {
	                dispatchEvent(event, parentDom, items, count, eventData);
	            }
	        }
	    }
	    function normalizeEventName(name) {
	        return name.substr(2).toLowerCase();
	    }
	    function attachEventToDocument(name, delegatedRoots) {
	        var docEvent = function docEvent(event) {
	            var eventData = {
	                stopPropagation: false,
	                dom: document
	            };
	            // we have to do this as some browsers recycle the same Event between calls
	            // so we need to make the property configurable
	            Object.defineProperty(event, 'currentTarget', {
	                configurable: true,
	                get: function get() {
	                    return eventData.dom;
	                }
	            });
	            event.stopPropagation = function () {
	                eventData.stopPropagation = true;
	            };
	            var count = delegatedRoots.count;
	            if (count > 0) {
	                dispatchEvent(event, event.target, delegatedRoots.items, count, eventData);
	            }
	        };
	        document.addEventListener(normalizeEventName(name), docEvent);
	        return docEvent;
	    }
	    function emptyFn() {}
	    function trapClickOnNonInteractiveElement(dom) {
	        // Mobile Safari does not fire properly bubble click events on
	        // non-interactive elements, which means delegated click listeners do not
	        // fire. The workaround for this bug involves attaching an empty click
	        // listener on the target node.
	        // http://www.quirksmode.org/blog/archives/2010/09/click_event_del.html
	        // Just set it using the onclick property so that we don't have to manage any
	        // bookkeeping for it. Not sure if we need to clear it when the listener is
	        // removed.
	        // TODO: Only do this for the relevant Safaris maybe?
	        dom.onclick = emptyFn;
	    }
	
	    var componentPools = new Map();
	    var elementPools = new Map();
	    function recycleElement(vNode, lifecycle, context, isSVG) {
	        var tag = vNode.type;
	        var key = vNode.key;
	        var pools = elementPools.get(tag);
	        if (!isUndefined(pools)) {
	            var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
	            if (!isUndefined(pool)) {
	                var recycledVNode = pool.pop();
	                if (!isUndefined(recycledVNode)) {
	                    patchElement(recycledVNode, vNode, null, lifecycle, context, isSVG, true);
	                    return vNode.dom;
	                }
	            }
	        }
	        return null;
	    }
	    function poolElement(vNode) {
	        var tag = vNode.type;
	        var key = vNode.key;
	        var pools = elementPools.get(tag);
	        if (isUndefined(pools)) {
	            pools = {
	                nonKeyed: [],
	                keyed: new Map()
	            };
	            elementPools.set(tag, pools);
	        }
	        if (isNull(key)) {
	            pools.nonKeyed.push(vNode);
	        } else {
	            var pool = pools.keyed.get(key);
	            if (isUndefined(pool)) {
	                pool = [];
	                pools.keyed.set(key, pool);
	            }
	            pool.push(vNode);
	        }
	    }
	    function recycleComponent(vNode, lifecycle, context, isSVG) {
	        var type = vNode.type;
	        var key = vNode.key;
	        var pools = componentPools.get(type);
	        if (!isUndefined(pools)) {
	            var pool = key === null ? pools.nonKeyed : pools.keyed.get(key);
	            if (!isUndefined(pool)) {
	                var recycledVNode = pool.pop();
	                if (!isUndefined(recycledVNode)) {
	                    var flags = vNode.flags;
	                    var failed = patchComponent(recycledVNode, vNode, null, lifecycle, context, isSVG, flags & 4 /* ComponentClass */, true);
	                    if (!failed) {
	                        return vNode.dom;
	                    }
	                }
	            }
	        }
	        return null;
	    }
	    function poolComponent(vNode) {
	        var type = vNode.type;
	        var key = vNode.key;
	        var hooks = vNode.ref;
	        var nonRecycleHooks = hooks && (hooks.onComponentWillMount || hooks.onComponentWillUnmount || hooks.onComponentDidMount || hooks.onComponentWillUpdate || hooks.onComponentDidUpdate);
	        if (nonRecycleHooks) {
	            return;
	        }
	        var pools = componentPools.get(type);
	        if (isUndefined(pools)) {
	            pools = {
	                nonKeyed: [],
	                keyed: new Map()
	            };
	            componentPools.set(type, pools);
	        }
	        if (isNull(key)) {
	            pools.nonKeyed.push(vNode);
	        } else {
	            var pool = pools.keyed.get(key);
	            if (isUndefined(pool)) {
	                pool = [];
	                pools.keyed.set(key, pool);
	            }
	            pool.push(vNode);
	        }
	    }
	
	    function unmount(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
	        var flags = vNode.flags;
	        if (flags & 28 /* Component */) {
	                unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling);
	            } else if (flags & 3970 /* Element */) {
	                unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling);
	            } else if (flags & (1 /* Text */ | 4096 /* Void */)) {
	            unmountVoidOrText(vNode, parentDom);
	        }
	    }
	    function unmountVoidOrText(vNode, parentDom) {
	        if (parentDom) {
	            removeChild(parentDom, vNode.dom);
	        }
	    }
	    var alreadyUnmounted = new WeakMap();
	    function unmountComponent(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
	        var instance = vNode.children;
	        var flags = vNode.flags;
	        var isStatefulComponent$$1 = flags & 4;
	        var ref = vNode.ref;
	        var dom = vNode.dom;
	        if (alreadyUnmounted.has(vNode) && !isRecycling && !parentDom) {
	            return;
	        }
	        alreadyUnmounted.set(vNode, true);
	        if (!isRecycling) {
	            if (isStatefulComponent$$1) {
	                if (!instance._unmounted) {
	                    instance._ignoreSetState = true;
	                    options.beforeUnmount && options.beforeUnmount(vNode);
	                    instance.componentWillUnmount && instance.componentWillUnmount();
	                    if (ref && !isRecycling) {
	                        ref(null);
	                    }
	                    instance._unmounted = true;
	                    options.findDOMNodeEnabled && componentToDOMNodeMap.delete(instance);
	                    var subLifecycle = instance._lifecycle;
	                    unmount(instance._lastInput, null, subLifecycle, false, isRecycling);
	                }
	            } else {
	                if (!isNullOrUndef(ref)) {
	                    if (!isNullOrUndef(ref.onComponentWillUnmount)) {
	                        ref.onComponentWillUnmount(dom);
	                    }
	                }
	                unmount(instance, null, lifecycle, false, isRecycling);
	            }
	        }
	        if (parentDom) {
	            var lastInput = instance._lastInput;
	            if (isNullOrUndef(lastInput)) {
	                lastInput = instance;
	            }
	            removeChild(parentDom, dom);
	        }
	        if (options.recyclingEnabled && !isStatefulComponent$$1 && (parentDom || canRecycle)) {
	            poolComponent(vNode);
	        }
	    }
	    function unmountElement(vNode, parentDom, lifecycle, canRecycle, isRecycling) {
	        var dom = vNode.dom;
	        var ref = vNode.ref;
	        var events = vNode.events;
	        if (alreadyUnmounted.has(vNode) && !isRecycling && !parentDom) {
	            return;
	        }
	        alreadyUnmounted.set(vNode, true);
	        if (ref && !isRecycling) {
	            unmountRef(ref);
	        }
	        var children = vNode.children;
	        if (!isNullOrUndef(children)) {
	            unmountChildren$1(children, lifecycle, isRecycling);
	        }
	        if (!isNull(events)) {
	            for (var name in events) {
	                // do not add a hasOwnProperty check here, it affects performance
	                patchEvent(name, events[name], null, dom);
	                events[name] = null;
	            }
	        }
	        if (parentDom) {
	            removeChild(parentDom, dom);
	        }
	        if (options.recyclingEnabled && (parentDom || canRecycle)) {
	            poolElement(vNode);
	        }
	    }
	    function unmountChildren$1(children, lifecycle, isRecycling) {
	        if (isArray(children)) {
	            for (var i = 0, len = children.length; i < len; i++) {
	                var child = children[i];
	                if (!isInvalid(child) && isObject(child)) {
	                    unmount(child, null, lifecycle, false, isRecycling);
	                }
	            }
	        } else if (isObject(children)) {
	            unmount(children, null, lifecycle, false, isRecycling);
	        }
	    }
	    function unmountRef(ref) {
	        if (isFunction(ref)) {
	            ref(null);
	        } else {
	            if (isInvalid(ref)) {
	                return;
	            }
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
	            }
	            throwError();
	        }
	    }
	
	    // We need EMPTY_OBJ defined in one place.
	    // Its used for comparison so we cant inline it into shared
	    var EMPTY_OBJ = {};
	    if (process.env.NODE_ENV !== 'production') {
	        Object.freeze(EMPTY_OBJ);
	    }
	    function createClassComponentInstance(vNode, Component, props, context, isSVG) {
	        if (isUndefined(context)) {
	            context = EMPTY_OBJ; // Context should not be mutable
	        }
	        var instance = new Component(props, context);
	        instance.context = context;
	        if (instance.props === EMPTY_OBJ) {
	            instance.props = props;
	        }
	        instance._patch = patch;
	        if (options.findDOMNodeEnabled) {
	            instance._componentToDOMNodeMap = componentToDOMNodeMap;
	        }
	        instance._unmounted = false;
	        instance._pendingSetState = true;
	        instance._isSVG = isSVG;
	        if (isFunction(instance.componentWillMount)) {
	            instance.componentWillMount();
	        }
	        var childContext = instance.getChildContext();
	        if (isNullOrUndef(childContext)) {
	            instance._childContext = context;
	        } else {
	            instance._childContext = Object.assign({}, context, childContext);
	        }
	        options.beforeRender && options.beforeRender(instance);
	        var input = instance.render(props, instance.state, context);
	        options.afterRender && options.afterRender(instance);
	        if (isArray(input)) {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
	            }
	            throwError();
	        } else if (isInvalid(input)) {
	            input = createVoidVNode();
	        } else if (isStringOrNumber(input)) {
	            input = createTextVNode(input);
	        } else {
	            if (input.dom) {
	                input = cloneVNode(input);
	            }
	            if (input.flags & 28 /* Component */) {
	                    // if we have an input that is also a component, we run into a tricky situation
	                    // where the root vNode needs to always have the correct DOM entry
	                    // so we break monomorphism on our input and supply it our vNode as parentVNode
	                    // we can optimise this in the future, but this gets us out of a lot of issues
	                    input.parentVNode = vNode;
	                }
	        }
	        instance._pendingSetState = false;
	        instance._lastInput = input;
	        return instance;
	    }
	    function replaceLastChildAndUnmount(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling) {
	        replaceVNode(parentDom, mount(nextInput, null, lifecycle, context, isSVG), lastInput, lifecycle, isRecycling);
	    }
	    function replaceVNode(parentDom, dom, vNode, lifecycle, isRecycling) {
	        var shallowUnmount = false;
	        // we cannot cache nodeType here as vNode might be re-assigned below
	        if (vNode.flags & 28 /* Component */) {
	                // if we are accessing a stateful or stateless component, we want to access their last rendered input
	                // accessing their DOM node is not useful to us here
	                unmount(vNode, null, lifecycle, false, isRecycling);
	                vNode = vNode.children._lastInput || vNode.children;
	                shallowUnmount = true;
	            }
	        replaceChild(parentDom, dom, vNode.dom);
	        unmount(vNode, null, lifecycle, false, isRecycling);
	    }
	    function createFunctionalComponentInput(vNode, component, props, context) {
	        var input = component(props, context);
	        if (isArray(input)) {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
	            }
	            throwError();
	        } else if (isInvalid(input)) {
	            input = createVoidVNode();
	        } else if (isStringOrNumber(input)) {
	            input = createTextVNode(input);
	        } else {
	            if (input.dom) {
	                input = cloneVNode(input);
	            }
	            if (input.flags & 28 /* Component */) {
	                    // if we have an input that is also a component, we run into a tricky situation
	                    // where the root vNode needs to always have the correct DOM entry
	                    // so we break monomorphism on our input and supply it our vNode as parentVNode
	                    // we can optimise this in the future, but this gets us out of a lot of issues
	                    input.parentVNode = vNode;
	                }
	        }
	        return input;
	    }
	    function setTextContent(dom, text) {
	        if (text !== '') {
	            dom.textContent = text;
	        } else {
	            dom.appendChild(document.createTextNode(''));
	        }
	    }
	    function updateTextContent(dom, text) {
	        dom.firstChild.nodeValue = text;
	    }
	    function appendChild(parentDom, dom) {
	        parentDom.appendChild(dom);
	    }
	    function insertOrAppend(parentDom, newNode, nextNode) {
	        if (isNullOrUndef(nextNode)) {
	            appendChild(parentDom, newNode);
	        } else {
	            parentDom.insertBefore(newNode, nextNode);
	        }
	    }
	    function documentCreateElement(tag, isSVG) {
	        if (isSVG === true) {
	            return document.createElementNS(svgNS, tag);
	        } else {
	            return document.createElement(tag);
	        }
	    }
	    function replaceWithNewNode(lastNode, nextNode, parentDom, lifecycle, context, isSVG, isRecycling) {
	        unmount(lastNode, null, lifecycle, false, isRecycling);
	        var dom = mount(nextNode, null, lifecycle, context, isSVG);
	        nextNode.dom = dom;
	        replaceChild(parentDom, dom, lastNode.dom);
	    }
	    function replaceChild(parentDom, nextDom, lastDom) {
	        if (!parentDom) {
	            parentDom = lastDom.parentNode;
	        }
	        parentDom.replaceChild(nextDom, lastDom);
	    }
	    function removeChild(parentDom, dom) {
	        parentDom.removeChild(dom);
	    }
	    function removeAllChildren(dom, children, lifecycle, isRecycling) {
	        dom.textContent = '';
	        if (!options.recyclingEnabled || options.recyclingEnabled && !isRecycling) {
	            removeChildren(null, children, lifecycle, isRecycling);
	        }
	    }
	    function removeChildren(dom, children, lifecycle, isRecycling) {
	        for (var i = 0, len = children.length; i < len; i++) {
	            var child = children[i];
	            if (!isInvalid(child)) {
	                unmount(child, dom, lifecycle, true, isRecycling);
	            }
	        }
	    }
	    function isKeyed(lastChildren, nextChildren) {
	        return nextChildren.length && !isNullOrUndef(nextChildren[0]) && !isNullOrUndef(nextChildren[0].key) && lastChildren.length && !isNullOrUndef(lastChildren[0]) && !isNullOrUndef(lastChildren[0].key);
	    }
	
	    function isCheckedType(type) {
	        return type === 'checkbox' || type === 'radio';
	    }
	    function isControlled(props) {
	        var usesChecked = isCheckedType(props.type);
	        return usesChecked ? !isNullOrUndef(props.checked) : !isNullOrUndef(props.value);
	    }
	    function onTextInputChange(e) {
	        var vNode = this.vNode;
	        var events = vNode.events || EMPTY_OBJ;
	        var dom = vNode.dom;
	        if (events.onInput) {
	            var event = events.onInput;
	            if (event.event) {
	                event.event(event.data, e);
	            } else {
	                event(e);
	            }
	        } else if (events.oninput) {
	            events.oninput(e);
	        }
	        // the user may have updated the vNode from the above onInput events
	        // so we need to get it from the context of `this` again
	        applyValue(this.vNode, dom);
	    }
	    function wrappedOnChange(e) {
	        var vNode = this.vNode;
	        var events = vNode.events || EMPTY_OBJ;
	        var event = events.onChange;
	        if (event.event) {
	            event.event(event.data, e);
	        } else {
	            event(e);
	        }
	    }
	    function onCheckboxChange(e) {
	        var vNode = this.vNode;
	        var events = vNode.events || EMPTY_OBJ;
	        var dom = vNode.dom;
	        if (events.onClick) {
	            var event = events.onClick;
	            if (event.event) {
	                event.event(event.data, e);
	            } else {
	                event(e);
	            }
	        } else if (events.onclick) {
	            events.onclick(e);
	        }
	        // the user may have updated the vNode from the above onClick events
	        // so we need to get it from the context of `this` again
	        applyValue(this.vNode, dom);
	    }
	    function handleAssociatedRadioInputs(name) {
	        var inputs = document.querySelectorAll("input[type=\"radio\"][name=\"" + name + "\"]");
	        [].forEach.call(inputs, function (dom) {
	            var inputWrapper = wrappers.get(dom);
	            if (inputWrapper) {
	                var props = inputWrapper.vNode.props;
	                if (props) {
	                    dom.checked = inputWrapper.vNode.props.checked;
	                }
	            }
	        });
	    }
	    function processInput(vNode, dom) {
	        var props = vNode.props || EMPTY_OBJ;
	        applyValue(vNode, dom);
	        if (isControlled(props)) {
	            var inputWrapper = wrappers.get(dom);
	            if (!inputWrapper) {
	                inputWrapper = {
	                    vNode: vNode
	                };
	                if (isCheckedType(props.type)) {
	                    dom.onclick = onCheckboxChange.bind(inputWrapper);
	                    dom.onclick.wrapped = true;
	                } else {
	                    dom.oninput = onTextInputChange.bind(inputWrapper);
	                    dom.oninput.wrapped = true;
	                }
	                if (props.onChange) {
	                    dom.onchange = wrappedOnChange.bind(inputWrapper);
	                    dom.onchange.wrapped = true;
	                }
	                wrappers.set(dom, inputWrapper);
	            }
	            inputWrapper.vNode = vNode;
	            return true;
	        }
	        return false;
	    }
	    function applyValue(vNode, dom) {
	        var props = vNode.props || EMPTY_OBJ;
	        var type = props.type;
	        var value = props.value;
	        var checked = props.checked;
	        var multiple = props.multiple;
	        var defaultValue = props.defaultValue;
	        var hasValue = !isNullOrUndef(value);
	        if (type && type !== dom.type) {
	            dom.type = type;
	        }
	        if (multiple && multiple !== dom.multiple) {
	            dom.multiple = multiple;
	        }
	        if (!isNullOrUndef(defaultValue) && !hasValue) {
	            dom.defaultValue = defaultValue + '';
	        }
	        if (isCheckedType(type)) {
	            if (hasValue) {
	                dom.value = value;
	            }
	            dom.checked = checked;
	            if (type === 'radio' && props.name) {
	                handleAssociatedRadioInputs(props.name);
	            }
	        } else {
	            if (hasValue && dom.value !== value) {
	                dom.value = value;
	            } else if (!isNullOrUndef(checked)) {
	                dom.checked = checked;
	            }
	        }
	    }
	
	    function isControlled$1(props) {
	        return !isNullOrUndef(props.value);
	    }
	    function updateChildOptionGroup(vNode, value) {
	        var type = vNode.type;
	        if (type === 'optgroup') {
	            var children = vNode.children;
	            if (isArray(children)) {
	                for (var i = 0, len = children.length; i < len; i++) {
	                    updateChildOption(children[i], value);
	                }
	            } else if (isVNode(children)) {
	                updateChildOption(children, value);
	            }
	        } else {
	            updateChildOption(vNode, value);
	        }
	    }
	    function updateChildOption(vNode, value) {
	        var props = vNode.props || EMPTY_OBJ;
	        var dom = vNode.dom;
	        // we do this as multiple may have changed
	        dom.value = props.value;
	        if (isArray(value) && value.indexOf(props.value) !== -1 || props.value === value) {
	            dom.selected = true;
	        } else {
	            dom.selected = props.selected || false;
	        }
	    }
	    function onSelectChange(e) {
	        var vNode = this.vNode;
	        var events = vNode.events || EMPTY_OBJ;
	        var dom = vNode.dom;
	        if (events.onChange) {
	            var event = events.onChange;
	            if (event.event) {
	                event.event(event.data, e);
	            } else {
	                event(e);
	            }
	        } else if (events.onchange) {
	            events.onchange(e);
	        }
	        // the user may have updated the vNode from the above onChange events
	        // so we need to get it from the context of `this` again
	        applyValue$1(this.vNode, dom);
	    }
	    function processSelect(vNode, dom) {
	        var props = vNode.props || EMPTY_OBJ;
	        applyValue$1(vNode, dom);
	        if (isControlled$1(props)) {
	            var selectWrapper = wrappers.get(dom);
	            if (!selectWrapper) {
	                selectWrapper = {
	                    vNode: vNode
	                };
	                dom.onchange = onSelectChange.bind(selectWrapper);
	                dom.onchange.wrapped = true;
	                wrappers.set(dom, selectWrapper);
	            }
	            selectWrapper.vNode = vNode;
	            return true;
	        }
	        return false;
	    }
	    function applyValue$1(vNode, dom) {
	        var props = vNode.props || EMPTY_OBJ;
	        if (props.multiple !== dom.multiple) {
	            dom.multiple = props.multiple;
	        }
	        var children = vNode.children;
	        if (!isInvalid(children)) {
	            var value = props.value;
	            if (isArray(children)) {
	                for (var i = 0, len = children.length; i < len; i++) {
	                    updateChildOptionGroup(children[i], value);
	                }
	            } else if (isVNode(children)) {
	                updateChildOptionGroup(children, value);
	            }
	        }
	    }
	
	    function isControlled$2(props) {
	        return !isNullOrUndef(props.value);
	    }
	    function wrappedOnChange$1(e) {
	        var vNode = this.vNode;
	        var events = vNode.events || EMPTY_OBJ;
	        var event = events.onChange;
	        if (event.event) {
	            event.event(event.data, e);
	        } else {
	            event(e);
	        }
	    }
	    function onTextareaInputChange(e) {
	        var vNode = this.vNode;
	        var events = vNode.events || EMPTY_OBJ;
	        var dom = vNode.dom;
	        if (events.onInput) {
	            var event = events.onInput;
	            if (event.event) {
	                event.event(event.data, e);
	            } else {
	                event(e);
	            }
	        } else if (events.oninput) {
	            events.oninput(e);
	        }
	        // the user may have updated the vNode from the above onInput events
	        // so we need to get it from the context of `this` again
	        applyValue$2(this.vNode, dom, false);
	    }
	    function processTextarea(vNode, dom, mounting) {
	        var props = vNode.props || EMPTY_OBJ;
	        applyValue$2(vNode, dom, mounting);
	        var textareaWrapper = wrappers.get(dom);
	        if (isControlled$2(props)) {
	            if (!textareaWrapper) {
	                textareaWrapper = {
	                    vNode: vNode
	                };
	                dom.oninput = onTextareaInputChange.bind(textareaWrapper);
	                dom.oninput.wrapped = true;
	                if (props.onChange) {
	                    dom.onchange = wrappedOnChange$1.bind(textareaWrapper);
	                    dom.onchange.wrapped = true;
	                }
	                wrappers.set(dom, textareaWrapper);
	            }
	            textareaWrapper.vNode = vNode;
	            return true;
	        }
	        return false;
	    }
	    function applyValue$2(vNode, dom, mounting) {
	        var props = vNode.props || EMPTY_OBJ;
	        var value = props.value;
	        var domValue = dom.value;
	        if (isNullOrUndef(value)) {
	            if (mounting) {
	                var defaultValue = props.defaultValue;
	                if (!isNullOrUndef(defaultValue)) {
	                    if (defaultValue !== domValue) {
	                        dom.value = defaultValue;
	                    }
	                } else if (domValue !== '') {
	                    dom.value = '';
	                }
	            }
	        } else {
	            /* There is value so keep it controlled */
	            if (domValue !== value) {
	                dom.value = value;
	            }
	        }
	    }
	
	    var wrappers = new Map();
	    function processElement(flags, vNode, dom, mounting) {
	        if (flags & 512 /* InputElement */) {
	                return processInput(vNode, dom);
	            }
	        if (flags & 2048 /* SelectElement */) {
	                return processSelect(vNode, dom);
	            }
	        if (flags & 1024 /* TextareaElement */) {
	                return processTextarea(vNode, dom, mounting);
	            }
	        return false;
	    }
	
	    function patch(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
	        if (lastVNode !== nextVNode) {
	            var lastFlags = lastVNode.flags;
	            var nextFlags = nextVNode.flags;
	            if (nextFlags & 28 /* Component */) {
	                    if (lastFlags & 28 /* Component */) {
	                            patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, nextFlags & 4 /* ComponentClass */, isRecycling);
	                        } else {
	                        replaceVNode(parentDom, mountComponent(nextVNode, null, lifecycle, context, isSVG, nextFlags & 4 /* ComponentClass */), lastVNode, lifecycle, isRecycling);
	                    }
	                } else if (nextFlags & 3970 /* Element */) {
	                    if (lastFlags & 3970 /* Element */) {
	                            patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
	                        } else {
	                        replaceVNode(parentDom, mountElement(nextVNode, null, lifecycle, context, isSVG), lastVNode, lifecycle, isRecycling);
	                    }
	                } else if (nextFlags & 1 /* Text */) {
	                    if (lastFlags & 1 /* Text */) {
	                            patchText(lastVNode, nextVNode);
	                        } else {
	                        replaceVNode(parentDom, mountText(nextVNode, null), lastVNode, lifecycle, isRecycling);
	                    }
	                } else if (nextFlags & 4096 /* Void */) {
	                    if (lastFlags & 4096 /* Void */) {
	                            patchVoid(lastVNode, nextVNode);
	                        } else {
	                        replaceVNode(parentDom, mountVoid(nextVNode, null), lastVNode, lifecycle, isRecycling);
	                    }
	                } else {
	                // Error case: mount new one replacing old one
	                replaceLastChildAndUnmount(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
	            }
	        }
	    }
	    function unmountChildren(children, dom, lifecycle, isRecycling) {
	        if (isVNode(children)) {
	            unmount(children, dom, lifecycle, true, isRecycling);
	        } else if (isArray(children)) {
	            removeAllChildren(dom, children, lifecycle, isRecycling);
	        } else {
	            dom.textContent = '';
	        }
	    }
	    function patchElement(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling) {
	        var nextTag = nextVNode.type;
	        var lastTag = lastVNode.type;
	        if (lastTag !== nextTag) {
	            replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
	        } else {
	            var dom = lastVNode.dom;
	            var lastProps = lastVNode.props;
	            var nextProps = nextVNode.props;
	            var lastChildren = lastVNode.children;
	            var nextChildren = nextVNode.children;
	            var lastFlags = lastVNode.flags;
	            var nextFlags = nextVNode.flags;
	            var lastRef = lastVNode.ref;
	            var nextRef = nextVNode.ref;
	            var lastEvents = lastVNode.events;
	            var nextEvents = nextVNode.events;
	            nextVNode.dom = dom;
	            if (isSVG || nextFlags & 128 /* SvgElement */) {
	                isSVG = true;
	            }
	            if (lastChildren !== nextChildren) {
	                patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
	            }
	            var hasControlledValue = false;
	            if (!(nextFlags & 2 /* HtmlElement */)) {
	                hasControlledValue = processElement(nextFlags, nextVNode, dom, false);
	            }
	            // inlined patchProps  -- starts --
	            if (lastProps !== nextProps) {
	                var lastPropsOrEmpty = lastProps || EMPTY_OBJ;
	                var nextPropsOrEmpty = nextProps || EMPTY_OBJ;
	                if (nextPropsOrEmpty !== EMPTY_OBJ) {
	                    for (var prop in nextPropsOrEmpty) {
	                        // do not add a hasOwnProperty check here, it affects performance
	                        var nextValue = nextPropsOrEmpty[prop];
	                        var lastValue = lastPropsOrEmpty[prop];
	                        if (isNullOrUndef(nextValue)) {
	                            removeProp(prop, nextValue, dom);
	                        } else {
	                            patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue);
	                        }
	                    }
	                }
	                if (lastPropsOrEmpty !== EMPTY_OBJ) {
	                    for (var prop$1 in lastPropsOrEmpty) {
	                        // do not add a hasOwnProperty check here, it affects performance
	                        if (isNullOrUndef(nextPropsOrEmpty[prop$1])) {
	                            removeProp(prop$1, lastPropsOrEmpty[prop$1], dom);
	                        }
	                    }
	                }
	            }
	            // inlined patchProps  -- ends --
	            if (lastEvents !== nextEvents) {
	                patchEvents(lastEvents, nextEvents, dom);
	            }
	            if (nextRef) {
	                if (lastRef !== nextRef || isRecycling) {
	                    mountRef(dom, nextRef, lifecycle);
	                }
	            }
	        }
	    }
	    function patchChildren(lastFlags, nextFlags, lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
	        var patchArray = false;
	        var patchKeyed = false;
	        if (nextFlags & 64 /* HasNonKeyedChildren */) {
	                patchArray = true;
	            } else if (lastFlags & 32 /* HasKeyedChildren */ && nextFlags & 32 /* HasKeyedChildren */) {
	            patchKeyed = true;
	            patchArray = true;
	        } else if (isInvalid(nextChildren)) {
	            unmountChildren(lastChildren, dom, lifecycle, isRecycling);
	        } else if (isInvalid(lastChildren)) {
	            if (isStringOrNumber(nextChildren)) {
	                setTextContent(dom, nextChildren);
	            } else {
	                if (isArray(nextChildren)) {
	                    mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
	                } else {
	                    mount(nextChildren, dom, lifecycle, context, isSVG);
	                }
	            }
	        } else if (isStringOrNumber(nextChildren)) {
	            if (isStringOrNumber(lastChildren)) {
	                updateTextContent(dom, nextChildren);
	            } else {
	                unmountChildren(lastChildren, dom, lifecycle, isRecycling);
	                setTextContent(dom, nextChildren);
	            }
	        } else if (isArray(nextChildren)) {
	            if (isArray(lastChildren)) {
	                patchArray = true;
	                if (isKeyed(lastChildren, nextChildren)) {
	                    patchKeyed = true;
	                }
	            } else {
	                unmountChildren(lastChildren, dom, lifecycle, isRecycling);
	                mountArrayChildren(nextChildren, dom, lifecycle, context, isSVG);
	            }
	        } else if (isArray(lastChildren)) {
	            removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
	            mount(nextChildren, dom, lifecycle, context, isSVG);
	        } else if (isVNode(nextChildren)) {
	            if (isVNode(lastChildren)) {
	                patch(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
	            } else {
	                unmountChildren(lastChildren, dom, lifecycle, isRecycling);
	                mount(nextChildren, dom, lifecycle, context, isSVG);
	            }
	        }
	        if (patchArray) {
	            if (patchKeyed) {
	                patchKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
	            } else {
	                patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling);
	            }
	        }
	    }
	    function patchComponent(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isClass, isRecycling) {
	        var lastType = lastVNode.type;
	        var nextType = nextVNode.type;
	        var nextProps = nextVNode.props || EMPTY_OBJ;
	        var lastKey = lastVNode.key;
	        var nextKey = nextVNode.key;
	        var defaultProps = nextType.defaultProps;
	        if (!isUndefined(defaultProps)) {
	            // When defaultProps are used we need to create new Object
	            var props = nextVNode.props || {};
	            copyPropsTo(defaultProps, props);
	            nextVNode.props = props;
	        }
	        if (lastType !== nextType) {
	            if (isClass) {
	                replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
	            } else {
	                var lastInput = lastVNode.children._lastInput || lastVNode.children;
	                var nextInput = createFunctionalComponentInput(nextVNode, nextType, nextProps, context);
	                unmount(lastVNode, null, lifecycle, false, isRecycling);
	                patch(lastInput, nextInput, parentDom, lifecycle, context, isSVG, isRecycling);
	                var dom = nextVNode.dom = nextInput.dom;
	                nextVNode.children = nextInput;
	                mountFunctionalComponentCallbacks(nextVNode.ref, dom, lifecycle);
	            }
	        } else {
	            if (isClass) {
	                if (lastKey !== nextKey) {
	                    replaceWithNewNode(lastVNode, nextVNode, parentDom, lifecycle, context, isSVG, isRecycling);
	                    return false;
	                }
	                var instance = lastVNode.children;
	                if (instance._unmounted) {
	                    if (isNull(parentDom)) {
	                        return true;
	                    }
	                    replaceChild(parentDom, mountComponent(nextVNode, null, lifecycle, context, isSVG, nextVNode.flags & 4 /* ComponentClass */), lastVNode.dom);
	                } else {
	                    var lastState = instance.state;
	                    var nextState = instance.state;
	                    var lastProps = instance.props;
	                    var childContext = instance.getChildContext();
	                    nextVNode.children = instance;
	                    instance._isSVG = isSVG;
	                    instance._syncSetState = false;
	                    if (isNullOrUndef(childContext)) {
	                        childContext = context;
	                    } else {
	                        childContext = Object.assign({}, context, childContext);
	                    }
	                    var lastInput$1 = instance._lastInput;
	                    var nextInput$1 = instance._updateComponent(lastState, nextState, lastProps, nextProps, context, false, false);
	                    var didUpdate = true;
	                    instance._childContext = childContext;
	                    if (isInvalid(nextInput$1)) {
	                        nextInput$1 = createVoidVNode();
	                    } else if (nextInput$1 === NO_OP) {
	                        nextInput$1 = lastInput$1;
	                        didUpdate = false;
	                    } else if (isStringOrNumber(nextInput$1)) {
	                        nextInput$1 = createTextVNode(nextInput$1);
	                    } else if (isArray(nextInput$1)) {
	                        if (process.env.NODE_ENV !== 'production') {
	                            throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
	                        }
	                        throwError();
	                    } else if (isObject(nextInput$1) && nextInput$1.dom) {
	                        nextInput$1 = cloneVNode(nextInput$1);
	                    }
	                    if (nextInput$1.flags & 28 /* Component */) {
	                            nextInput$1.parentVNode = nextVNode;
	                        } else if (lastInput$1.flags & 28 /* Component */) {
	                            lastInput$1.parentVNode = nextVNode;
	                        }
	                    instance._lastInput = nextInput$1;
	                    instance._vNode = nextVNode;
	                    if (didUpdate) {
	                        patch(lastInput$1, nextInput$1, parentDom, lifecycle, childContext, isSVG, isRecycling);
	                        instance.componentDidUpdate(lastProps, lastState);
	                        options.afterUpdate && options.afterUpdate(nextVNode);
	                        options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, nextInput$1.dom);
	                    }
	                    instance._syncSetState = true;
	                    nextVNode.dom = nextInput$1.dom;
	                }
	            } else {
	                var shouldUpdate = true;
	                var lastProps$1 = lastVNode.props;
	                var nextHooks = nextVNode.ref;
	                var nextHooksDefined = !isNullOrUndef(nextHooks);
	                var lastInput$2 = lastVNode.children;
	                var nextInput$2 = lastInput$2;
	                nextVNode.dom = lastVNode.dom;
	                nextVNode.children = lastInput$2;
	                if (lastKey !== nextKey) {
	                    shouldUpdate = true;
	                } else {
	                    if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentShouldUpdate)) {
	                        shouldUpdate = nextHooks.onComponentShouldUpdate(lastProps$1, nextProps);
	                    }
	                }
	                if (shouldUpdate !== false) {
	                    if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentWillUpdate)) {
	                        nextHooks.onComponentWillUpdate(lastProps$1, nextProps);
	                    }
	                    nextInput$2 = nextType(nextProps, context);
	                    if (isInvalid(nextInput$2)) {
	                        nextInput$2 = createVoidVNode();
	                    } else if (isStringOrNumber(nextInput$2) && nextInput$2 !== NO_OP) {
	                        nextInput$2 = createTextVNode(nextInput$2);
	                    } else if (isArray(nextInput$2)) {
	                        if (process.env.NODE_ENV !== 'production') {
	                            throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
	                        }
	                        throwError();
	                    } else if (isObject(nextInput$2) && nextInput$2.dom) {
	                        nextInput$2 = cloneVNode(nextInput$2);
	                    }
	                    if (nextInput$2 !== NO_OP) {
	                        patch(lastInput$2, nextInput$2, parentDom, lifecycle, context, isSVG, isRecycling);
	                        nextVNode.children = nextInput$2;
	                        if (nextHooksDefined && !isNullOrUndef(nextHooks.onComponentDidUpdate)) {
	                            nextHooks.onComponentDidUpdate(lastProps$1, nextProps);
	                        }
	                        nextVNode.dom = nextInput$2.dom;
	                    }
	                }
	                if (nextInput$2.flags & 28 /* Component */) {
	                        nextInput$2.parentVNode = nextVNode;
	                    } else if (lastInput$2.flags & 28 /* Component */) {
	                        lastInput$2.parentVNode = nextVNode;
	                    }
	            }
	        }
	        return false;
	    }
	    function patchText(lastVNode, nextVNode) {
	        var nextText = nextVNode.children;
	        var dom = lastVNode.dom;
	        nextVNode.dom = dom;
	        if (lastVNode.children !== nextText) {
	            dom.nodeValue = nextText;
	        }
	    }
	    function patchVoid(lastVNode, nextVNode) {
	        nextVNode.dom = lastVNode.dom;
	    }
	    function patchNonKeyedChildren(lastChildren, nextChildren, dom, lifecycle, context, isSVG, isRecycling) {
	        var lastChildrenLength = lastChildren.length;
	        var nextChildrenLength = nextChildren.length;
	        var commonLength = lastChildrenLength > nextChildrenLength ? nextChildrenLength : lastChildrenLength;
	        var i = 0;
	        for (; i < commonLength; i++) {
	            var nextChild = nextChildren[i];
	            if (nextChild.dom) {
	                nextChild = nextChildren[i] = cloneVNode(nextChild);
	            }
	            patch(lastChildren[i], nextChild, dom, lifecycle, context, isSVG, isRecycling);
	        }
	        if (lastChildrenLength < nextChildrenLength) {
	            for (i = commonLength; i < nextChildrenLength; i++) {
	                var nextChild$1 = nextChildren[i];
	                if (nextChild$1.dom) {
	                    nextChild$1 = nextChildren[i] = cloneVNode(nextChild$1);
	                }
	                appendChild(dom, mount(nextChild$1, null, lifecycle, context, isSVG));
	            }
	        } else if (nextChildrenLength === 0) {
	            removeAllChildren(dom, lastChildren, lifecycle, isRecycling);
	        } else if (lastChildrenLength > nextChildrenLength) {
	            for (i = commonLength; i < lastChildrenLength; i++) {
	                unmount(lastChildren[i], dom, lifecycle, false, isRecycling);
	            }
	        }
	    }
	    function patchKeyedChildren(a, b, dom, lifecycle, context, isSVG, isRecycling) {
	        var aLength = a.length;
	        var bLength = b.length;
	        var aEnd = aLength - 1;
	        var bEnd = bLength - 1;
	        var aStart = 0;
	        var bStart = 0;
	        var i;
	        var j;
	        var aNode;
	        var bNode;
	        var nextNode;
	        var nextPos;
	        var node;
	        if (aLength === 0) {
	            if (bLength !== 0) {
	                mountArrayChildren(b, dom, lifecycle, context, isSVG);
	            }
	            return;
	        } else if (bLength === 0) {
	            removeAllChildren(dom, a, lifecycle, isRecycling);
	            return;
	        }
	        var aStartNode = a[aStart];
	        var bStartNode = b[bStart];
	        var aEndNode = a[aEnd];
	        var bEndNode = b[bEnd];
	        if (bStartNode.dom) {
	            b[bStart] = bStartNode = cloneVNode(bStartNode);
	        }
	        if (bEndNode.dom) {
	            b[bEnd] = bEndNode = cloneVNode(bEndNode);
	        }
	        // Step 1
	        /* eslint no-constant-condition: 0 */
	        outer: while (true) {
	            // Sync nodes with the same key at the beginning.
	            while (aStartNode.key === bStartNode.key) {
	                patch(aStartNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
	                aStart++;
	                bStart++;
	                if (aStart > aEnd || bStart > bEnd) {
	                    break outer;
	                }
	                aStartNode = a[aStart];
	                bStartNode = b[bStart];
	                if (bStartNode.dom) {
	                    b[bStart] = bStartNode = cloneVNode(bStartNode);
	                }
	            }
	            // Sync nodes with the same key at the end.
	            while (aEndNode.key === bEndNode.key) {
	                patch(aEndNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
	                aEnd--;
	                bEnd--;
	                if (aStart > aEnd || bStart > bEnd) {
	                    break outer;
	                }
	                aEndNode = a[aEnd];
	                bEndNode = b[bEnd];
	                if (bEndNode.dom) {
	                    b[bEnd] = bEndNode = cloneVNode(bEndNode);
	                }
	            }
	            // Move and sync nodes from right to left.
	            if (aEndNode.key === bStartNode.key) {
	                patch(aEndNode, bStartNode, dom, lifecycle, context, isSVG, isRecycling);
	                insertOrAppend(dom, bStartNode.dom, aStartNode.dom);
	                aEnd--;
	                bStart++;
	                aEndNode = a[aEnd];
	                bStartNode = b[bStart];
	                if (bStartNode.dom) {
	                    b[bStart] = bStartNode = cloneVNode(bStartNode);
	                }
	                continue;
	            }
	            // Move and sync nodes from left to right.
	            if (aStartNode.key === bEndNode.key) {
	                patch(aStartNode, bEndNode, dom, lifecycle, context, isSVG, isRecycling);
	                nextPos = bEnd + 1;
	                nextNode = nextPos < b.length ? b[nextPos].dom : null;
	                insertOrAppend(dom, bEndNode.dom, nextNode);
	                aStart++;
	                bEnd--;
	                aStartNode = a[aStart];
	                bEndNode = b[bEnd];
	                if (bEndNode.dom) {
	                    b[bEnd] = bEndNode = cloneVNode(bEndNode);
	                }
	                continue;
	            }
	            break;
	        }
	        if (aStart > aEnd) {
	            if (bStart <= bEnd) {
	                nextPos = bEnd + 1;
	                nextNode = nextPos < b.length ? b[nextPos].dom : null;
	                while (bStart <= bEnd) {
	                    node = b[bStart];
	                    if (node.dom) {
	                        b[bStart] = node = cloneVNode(node);
	                    }
	                    bStart++;
	                    insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
	                }
	            }
	        } else if (bStart > bEnd) {
	            while (aStart <= aEnd) {
	                unmount(a[aStart++], dom, lifecycle, false, isRecycling);
	            }
	        } else {
	            aLength = aEnd - aStart + 1;
	            bLength = bEnd - bStart + 1;
	            var sources = new Array(bLength);
	            // Mark all nodes as inserted.
	            for (i = 0; i < bLength; i++) {
	                sources[i] = -1;
	            }
	            var moved = false;
	            var pos = 0;
	            var patched = 0;
	            // When sizes are small, just loop them through
	            if (bLength <= 4 || aLength * bLength <= 16) {
	                for (i = aStart; i <= aEnd; i++) {
	                    aNode = a[i];
	                    if (patched < bLength) {
	                        for (j = bStart; j <= bEnd; j++) {
	                            bNode = b[j];
	                            if (aNode.key === bNode.key) {
	                                sources[j - bStart] = i;
	                                if (pos > j) {
	                                    moved = true;
	                                } else {
	                                    pos = j;
	                                }
	                                if (bNode.dom) {
	                                    b[j] = bNode = cloneVNode(bNode);
	                                }
	                                patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
	                                patched++;
	                                a[i] = null;
	                                break;
	                            }
	                        }
	                    }
	                }
	            } else {
	                var keyIndex = new Map();
	                // Map keys by their index in array
	                for (i = bStart; i <= bEnd; i++) {
	                    node = b[i];
	                    keyIndex.set(node.key, i);
	                }
	                // Try to patch same keys
	                for (i = aStart; i <= aEnd; i++) {
	                    aNode = a[i];
	                    if (patched < bLength) {
	                        j = keyIndex.get(aNode.key);
	                        if (!isUndefined(j)) {
	                            bNode = b[j];
	                            sources[j - bStart] = i;
	                            if (pos > j) {
	                                moved = true;
	                            } else {
	                                pos = j;
	                            }
	                            if (bNode.dom) {
	                                b[j] = bNode = cloneVNode(bNode);
	                            }
	                            patch(aNode, bNode, dom, lifecycle, context, isSVG, isRecycling);
	                            patched++;
	                            a[i] = null;
	                        }
	                    }
	                }
	            }
	            // fast-path: if nothing patched remove all old and add all new
	            if (aLength === a.length && patched === 0) {
	                removeAllChildren(dom, a, lifecycle, isRecycling);
	                while (bStart < bLength) {
	                    node = b[bStart];
	                    if (node.dom) {
	                        b[bStart] = node = cloneVNode(node);
	                    }
	                    bStart++;
	                    insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), null);
	                }
	            } else {
	                i = aLength - patched;
	                while (i > 0) {
	                    aNode = a[aStart++];
	                    if (!isNull(aNode)) {
	                        unmount(aNode, dom, lifecycle, true, isRecycling);
	                        i--;
	                    }
	                }
	                if (moved) {
	                    var seq = lis_algorithm(sources);
	                    j = seq.length - 1;
	                    for (i = bLength - 1; i >= 0; i--) {
	                        if (sources[i] === -1) {
	                            pos = i + bStart;
	                            node = b[pos];
	                            if (node.dom) {
	                                b[pos] = node = cloneVNode(node);
	                            }
	                            nextPos = pos + 1;
	                            nextNode = nextPos < b.length ? b[nextPos].dom : null;
	                            insertOrAppend(dom, mount(node, dom, lifecycle, context, isSVG), nextNode);
	                        } else {
	                            if (j < 0 || i !== seq[j]) {
	                                pos = i + bStart;
	                                node = b[pos];
	                                nextPos = pos + 1;
	                                nextNode = nextPos < b.length ? b[nextPos].dom : null;
	                                insertOrAppend(dom, node.dom, nextNode);
	                            } else {
	                                j--;
	                            }
	                        }
	                    }
	                } else if (patched !== bLength) {
	                    // when patched count doesn't match b length we need to insert those new ones
	                    // loop backwards so we can use insertBefore
	                    for (i = bLength - 1; i >= 0; i--) {
	                        if (sources[i] === -1) {
	                            pos = i + bStart;
	                            node = b[pos];
	                            if (node.dom) {
	                                b[pos] = node = cloneVNode(node);
	                            }
	                            nextPos = pos + 1;
	                            nextNode = nextPos < b.length ? b[nextPos].dom : null;
	                            insertOrAppend(dom, mount(node, null, lifecycle, context, isSVG), nextNode);
	                        }
	                    }
	                }
	            }
	        }
	    }
	    // // https://en.wikipedia.org/wiki/Longest_increasing_subsequence
	    function lis_algorithm(arr) {
	        var p = arr.slice(0);
	        var result = [0];
	        var i;
	        var j;
	        var u;
	        var v;
	        var c;
	        var len = arr.length;
	        for (i = 0; i < len; i++) {
	            var arrI = arr[i];
	            if (arrI === -1) {
	                continue;
	            }
	            j = result[result.length - 1];
	            if (arr[j] < arrI) {
	                p[i] = j;
	                result.push(i);
	                continue;
	            }
	            u = 0;
	            v = result.length - 1;
	            while (u < v) {
	                c = (u + v) / 2 | 0;
	                if (arr[result[c]] < arrI) {
	                    u = c + 1;
	                } else {
	                    v = c;
	                }
	            }
	            if (arrI < arr[result[u]]) {
	                if (u > 0) {
	                    p[i] = result[u - 1];
	                }
	                result[u] = i;
	            }
	        }
	        u = result.length;
	        v = result[u - 1];
	        while (u-- > 0) {
	            result[u] = v;
	            v = p[v];
	        }
	        return result;
	    }
	    function patchProp(prop, lastValue, nextValue, dom, isSVG, hasControlledValue) {
	        if (skipProps[prop] || hasControlledValue && prop === 'value') {
	            return;
	        }
	        if (booleanProps[prop]) {
	            dom[prop] = !!nextValue;
	        } else if (strictProps[prop]) {
	            var value = isNullOrUndef(nextValue) ? '' : nextValue;
	            if (dom[prop] !== value) {
	                dom[prop] = value;
	            }
	        } else if (lastValue !== nextValue) {
	            if (isAttrAnEvent(prop)) {
	                patchEvent(prop, lastValue, nextValue, dom);
	            } else if (isNullOrUndef(nextValue)) {
	                dom.removeAttribute(prop);
	            } else if (prop === 'className') {
	                if (isSVG) {
	                    dom.setAttribute('class', nextValue);
	                } else {
	                    dom.className = nextValue;
	                }
	            } else if (prop === 'style') {
	                patchStyle(lastValue, nextValue, dom);
	            } else if (prop === 'dangerouslySetInnerHTML') {
	                var lastHtml = lastValue && lastValue.__html;
	                var nextHtml = nextValue && nextValue.__html;
	                if (lastHtml !== nextHtml) {
	                    if (!isNullOrUndef(nextHtml)) {
	                        dom.innerHTML = nextHtml;
	                    }
	                }
	            } else {
	                var ns = namespaces[prop];
	                if (ns) {
	                    dom.setAttributeNS(ns, prop, nextValue);
	                } else {
	                    dom.setAttribute(prop, nextValue);
	                }
	            }
	        }
	    }
	    function patchEvents(lastEvents, nextEvents, dom) {
	        lastEvents = lastEvents || EMPTY_OBJ;
	        nextEvents = nextEvents || EMPTY_OBJ;
	        if (nextEvents !== EMPTY_OBJ) {
	            for (var name in nextEvents) {
	                // do not add a hasOwnProperty check here, it affects performance
	                patchEvent(name, lastEvents[name], nextEvents[name], dom);
	            }
	        }
	        if (lastEvents !== EMPTY_OBJ) {
	            for (var name$1 in lastEvents) {
	                // do not add a hasOwnProperty check here, it affects performance
	                if (isNullOrUndef(nextEvents[name$1])) {
	                    patchEvent(name$1, lastEvents[name$1], null, dom);
	                }
	            }
	        }
	    }
	    function patchEvent(name, lastValue, nextValue, dom) {
	        if (lastValue !== nextValue) {
	            var nameLowerCase = name.toLowerCase();
	            var domEvent = dom[nameLowerCase];
	            // if the function is wrapped, that means it's been controlled by a wrapper
	            if (domEvent && domEvent.wrapped) {
	                return;
	            }
	            if (delegatedProps[name]) {
	                handleEvent(name, lastValue, nextValue, dom);
	            } else {
	                if (lastValue !== nextValue) {
	                    if (!isFunction(nextValue) && !isNullOrUndef(nextValue)) {
	                        var linkEvent = nextValue.event;
	                        if (linkEvent && isFunction(linkEvent)) {
	                            if (!dom._data) {
	                                dom[nameLowerCase] = function (e) {
	                                    linkEvent(e.currentTarget._data, e);
	                                };
	                            }
	                            dom._data = nextValue.data;
	                        } else {
	                            if (process.env.NODE_ENV !== 'production') {
	                                throwError("an event on a VNode \"" + name + "\". was not a function or a valid linkEvent.");
	                            }
	                            throwError();
	                        }
	                    } else {
	                        dom[nameLowerCase] = nextValue;
	                    }
	                }
	            }
	        }
	    }
	    // We are assuming here that we come from patchProp routine
	    // -nextAttrValue cannot be null or undefined
	    function patchStyle(lastAttrValue, nextAttrValue, dom) {
	        if (isString(nextAttrValue)) {
	            dom.style.cssText = nextAttrValue;
	            return;
	        }
	        for (var style in nextAttrValue) {
	            // do not add a hasOwnProperty check here, it affects performance
	            var value = nextAttrValue[style];
	            if (isNumber(value) && !isUnitlessNumber[style]) {
	                dom.style[style] = value + 'px';
	            } else {
	                dom.style[style] = value;
	            }
	        }
	        if (!isNullOrUndef(lastAttrValue)) {
	            for (var style$1 in lastAttrValue) {
	                if (isNullOrUndef(nextAttrValue[style$1])) {
	                    dom.style[style$1] = '';
	                }
	            }
	        }
	    }
	    function removeProp(prop, lastValue, dom) {
	        if (prop === 'className') {
	            dom.removeAttribute('class');
	        } else if (prop === 'value') {
	            dom.value = '';
	        } else if (prop === 'style') {
	            dom.removeAttribute('style');
	        } else if (isAttrAnEvent(prop)) {
	            handleEvent(name, lastValue, null, dom);
	        } else {
	            dom.removeAttribute(prop);
	        }
	    }
	
	    function mount(vNode, parentDom, lifecycle, context, isSVG) {
	        var flags = vNode.flags;
	        if (flags & 3970 /* Element */) {
	                return mountElement(vNode, parentDom, lifecycle, context, isSVG);
	            } else if (flags & 28 /* Component */) {
	                return mountComponent(vNode, parentDom, lifecycle, context, isSVG, flags & 4 /* ComponentClass */);
	            } else if (flags & 4096 /* Void */) {
	                return mountVoid(vNode, parentDom);
	            } else if (flags & 1 /* Text */) {
	                return mountText(vNode, parentDom);
	            } else {
	            if (process.env.NODE_ENV !== 'production') {
	                if ((typeof vNode === 'undefined' ? 'undefined' : _typeof(vNode)) === 'object') {
	                    throwError("mount() received an object that's not a valid VNode, you should stringify it first. Object: \"" + JSON.stringify(vNode) + "\".");
	                } else {
	                    throwError("mount() expects a valid VNode, instead it received an object with the type \"" + (typeof vNode === 'undefined' ? 'undefined' : _typeof(vNode)) + "\".");
	                }
	            }
	            throwError();
	        }
	    }
	    function mountText(vNode, parentDom) {
	        var dom = document.createTextNode(vNode.children);
	        vNode.dom = dom;
	        if (parentDom) {
	            appendChild(parentDom, dom);
	        }
	        return dom;
	    }
	    function mountVoid(vNode, parentDom) {
	        var dom = document.createTextNode('');
	        vNode.dom = dom;
	        if (parentDom) {
	            appendChild(parentDom, dom);
	        }
	        return dom;
	    }
	    function mountElement(vNode, parentDom, lifecycle, context, isSVG) {
	        if (options.recyclingEnabled) {
	            var dom$1 = recycleElement(vNode, lifecycle, context, isSVG);
	            if (!isNull(dom$1)) {
	                if (!isNull(parentDom)) {
	                    appendChild(parentDom, dom$1);
	                }
	                return dom$1;
	            }
	        }
	        var tag = vNode.type;
	        var flags = vNode.flags;
	        if (isSVG || flags & 128 /* SvgElement */) {
	            isSVG = true;
	        }
	        var dom = documentCreateElement(tag, isSVG);
	        var children = vNode.children;
	        var props = vNode.props;
	        var events = vNode.events;
	        var ref = vNode.ref;
	        vNode.dom = dom;
	        if (!isNull(children)) {
	            if (isStringOrNumber(children)) {
	                setTextContent(dom, children);
	            } else if (isArray(children)) {
	                mountArrayChildren(children, dom, lifecycle, context, isSVG);
	            } else if (isVNode(children)) {
	                mount(children, dom, lifecycle, context, isSVG);
	            }
	        }
	        var hasControlledValue = false;
	        if (!(flags & 2 /* HtmlElement */)) {
	            hasControlledValue = processElement(flags, vNode, dom, true);
	        }
	        if (!isNull(props)) {
	            for (var prop in props) {
	                // do not add a hasOwnProperty check here, it affects performance
	                patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
	            }
	        }
	        if (!isNull(events)) {
	            for (var name in events) {
	                // do not add a hasOwnProperty check here, it affects performance
	                patchEvent(name, null, events[name], dom);
	            }
	        }
	        if (!isNull(ref)) {
	            mountRef(dom, ref, lifecycle);
	        }
	        if (!isNull(parentDom)) {
	            appendChild(parentDom, dom);
	        }
	        return dom;
	    }
	    function mountArrayChildren(children, dom, lifecycle, context, isSVG) {
	        for (var i = 0, len = children.length; i < len; i++) {
	            var child = children[i];
	            // TODO: Verify can string/number be here. might cause de-opt
	            if (!isInvalid(child)) {
	                if (child.dom) {
	                    children[i] = child = cloneVNode(child);
	                }
	                mount(children[i], dom, lifecycle, context, isSVG);
	            }
	        }
	    }
	    function mountComponent(vNode, parentDom, lifecycle, context, isSVG, isClass) {
	        if (options.recyclingEnabled) {
	            var dom$1 = recycleComponent(vNode, lifecycle, context, isSVG);
	            if (!isNull(dom$1)) {
	                if (!isNull(parentDom)) {
	                    appendChild(parentDom, dom$1);
	                }
	                return dom$1;
	            }
	        }
	        var type = vNode.type;
	        var defaultProps = type.defaultProps;
	        var props;
	        if (!isUndefined(defaultProps)) {
	            // When defaultProps are used we need to create new Object
	            props = vNode.props || {};
	            copyPropsTo(defaultProps, props);
	            vNode.props = props;
	        } else {
	            props = vNode.props || EMPTY_OBJ;
	        }
	        var ref = vNode.ref;
	        var dom;
	        if (isClass) {
	            var instance = createClassComponentInstance(vNode, type, props, context, isSVG);
	            var input = instance._lastInput;
	            instance._vNode = vNode;
	            vNode.dom = dom = mount(input, null, lifecycle, instance._childContext, isSVG);
	            if (!isNull(parentDom)) {
	                appendChild(parentDom, dom);
	            }
	            mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
	            options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
	            vNode.children = instance;
	        } else {
	            var input$1 = createFunctionalComponentInput(vNode, type, props, context);
	            vNode.dom = dom = mount(input$1, null, lifecycle, context, isSVG);
	            vNode.children = input$1;
	            mountFunctionalComponentCallbacks(ref, dom, lifecycle);
	            if (!isNull(parentDom)) {
	                appendChild(parentDom, dom);
	            }
	        }
	        return dom;
	    }
	    function mountClassComponentCallbacks(vNode, ref, instance, lifecycle) {
	        if (ref) {
	            if (isFunction(ref)) {
	                ref(instance);
	            } else {
	                if (process.env.NODE_ENV !== 'production') {
	                    if (isStringOrNumber(ref)) {
	                        throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
	                    } else if (isObject(ref) && vNode.flags & 4 /* ComponentClass */) {
	                        throwError('functional component lifecycle events are not supported on ES2015 class components.');
	                    } else {
	                        throwError("a bad value for \"ref\" was used on component: \"" + JSON.stringify(ref) + "\"");
	                    }
	                }
	                throwError();
	            }
	        }
	        var cDM = instance.componentDidMount;
	        var afterMount = options.afterMount;
	        if (!isUndefined(cDM) || !isNull(afterMount)) {
	            lifecycle.addListener(function () {
	                afterMount && afterMount(vNode);
	                cDM && instance.componentDidMount();
	                instance._syncSetState = true;
	            });
	        } else {
	            instance._syncSetState = true;
	        }
	    }
	    function mountFunctionalComponentCallbacks(ref, dom, lifecycle) {
	        if (ref) {
	            if (!isNullOrUndef(ref.onComponentWillMount)) {
	                ref.onComponentWillMount();
	            }
	            if (!isNullOrUndef(ref.onComponentDidMount)) {
	                lifecycle.addListener(function () {
	                    return ref.onComponentDidMount(dom);
	                });
	            }
	        }
	    }
	    function mountRef(dom, value, lifecycle) {
	        if (isFunction(value)) {
	            lifecycle.addListener(function () {
	                return value(dom);
	            });
	        } else {
	            if (isInvalid(value)) {
	                return;
	            }
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('string "refs" are not supported in Inferno 1.0. Use callback "refs" instead.');
	            }
	            throwError();
	        }
	    }
	
	    function normalizeChildNodes(parentDom) {
	        var dom = parentDom.firstChild;
	        while (dom) {
	            if (dom.nodeType === 8) {
	                if (dom.data === '!') {
	                    var placeholder = document.createTextNode('');
	                    parentDom.replaceChild(placeholder, dom);
	                    dom = dom.nextSibling;
	                } else {
	                    var lastDom = dom.previousSibling;
	                    parentDom.removeChild(dom);
	                    dom = lastDom || parentDom.firstChild;
	                }
	            } else {
	                dom = dom.nextSibling;
	            }
	        }
	    }
	    function hydrateComponent(vNode, dom, lifecycle, context, isSVG, isClass) {
	        var type = vNode.type;
	        var ref = vNode.ref;
	        vNode.dom = dom;
	        var defaultProps = type.defaultProps;
	        var props;
	        if (!isUndefined(defaultProps)) {
	            // When defaultProps are used we need to create new Object
	            props = vNode.props || {};
	            copyPropsTo(defaultProps, props);
	            vNode.props = props;
	        } else {
	            props = vNode.props || EMPTY_OBJ;
	        }
	        if (isClass) {
	            var _isSVG = dom.namespaceURI === svgNS;
	            var instance = createClassComponentInstance(vNode, type, props, context, _isSVG);
	            var input = instance._lastInput;
	            instance._vComponent = vNode;
	            instance._vNode = vNode;
	            hydrate(input, dom, lifecycle, instance._childContext, _isSVG);
	            mountClassComponentCallbacks(vNode, ref, instance, lifecycle);
	            options.findDOMNodeEnabled && componentToDOMNodeMap.set(instance, dom);
	            vNode.children = instance;
	        } else {
	            var input$1 = createFunctionalComponentInput(vNode, type, props, context);
	            hydrate(input$1, dom, lifecycle, context, isSVG);
	            vNode.children = input$1;
	            vNode.dom = input$1.dom;
	            mountFunctionalComponentCallbacks(ref, dom, lifecycle);
	        }
	        return dom;
	    }
	    function hydrateElement(vNode, dom, lifecycle, context, isSVG) {
	        var tag = vNode.type;
	        var children = vNode.children;
	        var props = vNode.props;
	        var events = vNode.events;
	        var flags = vNode.flags;
	        var ref = vNode.ref;
	        if (isSVG || flags & 128 /* SvgElement */) {
	            isSVG = true;
	        }
	        if (dom.nodeType !== 1 || dom.tagName.toLowerCase() !== tag) {
	            if (process.env.NODE_ENV !== 'production') {
	                warning('Inferno hydration: Server-side markup doesn\'t match client-side markup or Initial render target is not empty');
	            }
	            var newDom = mountElement(vNode, null, lifecycle, context, isSVG);
	            vNode.dom = newDom;
	            replaceChild(dom.parentNode, newDom, dom);
	            return newDom;
	        }
	        vNode.dom = dom;
	        if (children) {
	            hydrateChildren(children, dom, lifecycle, context, isSVG);
	        }
	        var hasControlledValue = false;
	        if (!(flags & 2 /* HtmlElement */)) {
	            hasControlledValue = processElement(flags, vNode, dom, false);
	        }
	        if (props) {
	            for (var prop in props) {
	                patchProp(prop, null, props[prop], dom, isSVG, hasControlledValue);
	            }
	        }
	        if (events) {
	            for (var name in events) {
	                patchEvent(name, null, events[name], dom);
	            }
	        }
	        if (ref) {
	            mountRef(dom, ref, lifecycle);
	        }
	        return dom;
	    }
	    function hydrateChildren(children, parentDom, lifecycle, context, isSVG) {
	        normalizeChildNodes(parentDom);
	        var dom = parentDom.firstChild;
	        if (isArray(children)) {
	            for (var i = 0, len = children.length; i < len; i++) {
	                var child = children[i];
	                if (!isNull(child) && isObject(child)) {
	                    if (dom) {
	                        dom = hydrate(child, dom, lifecycle, context, isSVG);
	                        dom = dom.nextSibling;
	                    } else {
	                        mount(child, parentDom, lifecycle, context, isSVG);
	                    }
	                }
	            }
	        } else if (isStringOrNumber(children)) {
	            if (dom && dom.nodeType === 3) {
	                if (dom.nodeValue !== children) {
	                    dom.nodeValue = children;
	                }
	            } else if (children) {
	                parentDom.textContent = children;
	            }
	            dom = dom.nextSibling;
	        } else if (isObject(children)) {
	            hydrate(children, dom, lifecycle, context, isSVG);
	            dom = dom.nextSibling;
	        }
	        // clear any other DOM nodes, there should be only a single entry for the root
	        while (dom) {
	            var nextSibling = dom.nextSibling;
	            parentDom.removeChild(dom);
	            dom = nextSibling;
	        }
	    }
	    function hydrateText(vNode, dom) {
	        if (dom.nodeType !== 3) {
	            var newDom = mountText(vNode, null);
	            vNode.dom = newDom;
	            replaceChild(dom.parentNode, newDom, dom);
	            return newDom;
	        }
	        var text = vNode.children;
	        if (dom.nodeValue !== text) {
	            dom.nodeValue = text;
	        }
	        vNode.dom = dom;
	        return dom;
	    }
	    function hydrateVoid(vNode, dom) {
	        vNode.dom = dom;
	        return dom;
	    }
	    function hydrate(vNode, dom, lifecycle, context, isSVG) {
	        var flags = vNode.flags;
	        if (flags & 28 /* Component */) {
	                return hydrateComponent(vNode, dom, lifecycle, context, isSVG, flags & 4 /* ComponentClass */);
	            } else if (flags & 3970 /* Element */) {
	                return hydrateElement(vNode, dom, lifecycle, context, isSVG);
	            } else if (flags & 1 /* Text */) {
	                return hydrateText(vNode, dom);
	            } else if (flags & 4096 /* Void */) {
	                return hydrateVoid(vNode, dom);
	            } else {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError("hydrate() expects a valid VNode, instead it received an object with the type \"" + (typeof vNode === 'undefined' ? 'undefined' : _typeof(vNode)) + "\".");
	            }
	            throwError();
	        }
	    }
	    function hydrateRoot(input, parentDom, lifecycle) {
	        var dom = parentDom && parentDom.firstChild;
	        if (dom) {
	            hydrate(input, dom, lifecycle, EMPTY_OBJ, false);
	            dom = parentDom.firstChild;
	            // clear any other DOM nodes, there should be only a single entry for the root
	            while (dom = dom.nextSibling) {
	                parentDom.removeChild(dom);
	            }
	            return true;
	        }
	        return false;
	    }
	
	    // rather than use a Map, like we did before, we can use an array here
	    // given there shouldn't be THAT many roots on the page, the difference
	    // in performance is huge: https://esbench.com/bench/5802a691330ab09900a1a2da
	    var roots = [];
	    var componentToDOMNodeMap = new Map();
	    options.roots = roots;
	    function findDOMNode(ref) {
	        if (!options.findDOMNodeEnabled) {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('findDOMNode() has been disabled, use Inferno.options.findDOMNodeEnabled = true; enabled findDOMNode(). Warning this can significantly impact performance!');
	            }
	            throwError();
	        }
	        var dom = ref && ref.nodeType ? ref : null;
	        return componentToDOMNodeMap.get(ref) || dom;
	    }
	    function getRoot(dom) {
	        for (var i = 0, len = roots.length; i < len; i++) {
	            var root = roots[i];
	            if (root.dom === dom) {
	                return root;
	            }
	        }
	        return null;
	    }
	    function setRoot(dom, input, lifecycle) {
	        var root = {
	            dom: dom,
	            input: input,
	            lifecycle: lifecycle
	        };
	        roots.push(root);
	        return root;
	    }
	    function removeRoot(root) {
	        for (var i = 0, len = roots.length; i < len; i++) {
	            if (roots[i] === root) {
	                roots.splice(i, 1);
	                return;
	            }
	        }
	    }
	    if (process.env.NODE_ENV !== 'production') {
	        if (isBrowser && document.body === null) {
	            warning('Inferno warning: you cannot initialize inferno without "document.body". Wait on "DOMContentLoaded" event, add script to bottom of body, or use async/defer attributes on script tag.');
	        }
	    }
	    var documentBody = isBrowser ? document.body : null;
	    function render(input, parentDom) {
	        if (documentBody === parentDom) {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('you cannot render() to the "document.body". Use an empty element as a container instead.');
	            }
	            throwError();
	        }
	        if (input === NO_OP) {
	            return;
	        }
	        var root = getRoot(parentDom);
	        if (isNull(root)) {
	            var lifecycle = new Lifecycle();
	            if (!isInvalid(input)) {
	                if (input.dom) {
	                    input = cloneVNode(input);
	                }
	                if (!hydrateRoot(input, parentDom, lifecycle)) {
	                    mount(input, parentDom, lifecycle, EMPTY_OBJ, false);
	                }
	                root = setRoot(parentDom, input, lifecycle);
	                lifecycle.trigger();
	            }
	        } else {
	            var lifecycle$1 = root.lifecycle;
	            lifecycle$1.listeners = [];
	            if (isNullOrUndef(input)) {
	                unmount(root.input, parentDom, lifecycle$1, false, false);
	                removeRoot(root);
	            } else {
	                if (input.dom) {
	                    input = cloneVNode(input);
	                }
	                patch(root.input, input, parentDom, lifecycle$1, EMPTY_OBJ, false, false);
	            }
	            lifecycle$1.trigger();
	            root.input = input;
	        }
	        if (root) {
	            var rootInput = root.input;
	            if (rootInput && rootInput.flags & 28 /* Component */) {
	                return rootInput.children;
	            }
	        }
	    }
	    function createRenderer(parentDom) {
	        return function renderer(lastInput, nextInput) {
	            if (!parentDom) {
	                parentDom = lastInput;
	            }
	            render(nextInput, parentDom);
	        };
	    }
	
	    if (process.env.NODE_ENV !== 'production') {
	        var testFunc = function testFn() {};
	        if ((testFunc.name || testFunc.toString()).indexOf('testFn') === -1) {
	            warning('It looks like you\'re using a minified copy of the development build ' + 'of Inferno. When deploying Inferno apps to production, make sure to use ' + 'the production build which skips development warnings and is faster. ' + 'See http://infernojs.org for more details.');
	        }
	    }
	    // This will be replaced by rollup
	    var version = '1.3.0-rc.4';
	    // we duplicate it so it plays nicely with different module loading systems
	    var index = {
	        linkEvent: linkEvent,
	        // core shapes
	        createVNode: createVNode,
	        // cloning
	        cloneVNode: cloneVNode,
	        // used to shared common items between Inferno libs
	        NO_OP: NO_OP,
	        EMPTY_OBJ: EMPTY_OBJ,
	        // DOM
	        render: render,
	        findDOMNode: findDOMNode,
	        createRenderer: createRenderer,
	        options: options,
	        version: version
	    };
	
	    exports.version = version;
	    exports['default'] = index;
	    exports.linkEvent = linkEvent;
	    exports.createVNode = createVNode;
	    exports.cloneVNode = cloneVNode;
	    exports.NO_OP = NO_OP;
	    exports.EMPTY_OBJ = EMPTY_OBJ;
	    exports.render = render;
	    exports.findDOMNode = findDOMNode;
	    exports.createRenderer = createRenderer;
	    exports.options = options;
	    exports.internal_isUnitlessNumber = isUnitlessNumber;
	    exports.internal_normalize = normalize;
	
	    Object.defineProperty(exports, '__esModule', { value: true });
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 2 */
/***/ function(module, exports) {

	'use strict';
	
	// shim for using process in browser
	var process = module.exports = {};
	
	// cached from whatever global is present so that test runners that stub it
	// don't break things.  But we need to wrap it in a try catch in case it is
	// wrapped in strict mode code which doesn't define any globals.  It's inside a
	// function because try/catches deoptimize in certain engines.
	
	var cachedSetTimeout;
	var cachedClearTimeout;
	
	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout() {
	    throw new Error('clearTimeout has not been defined');
	}
	(function () {
	    try {
	        if (typeof setTimeout === 'function') {
	            cachedSetTimeout = setTimeout;
	        } else {
	            cachedSetTimeout = defaultSetTimout;
	        }
	    } catch (e) {
	        cachedSetTimeout = defaultSetTimout;
	    }
	    try {
	        if (typeof clearTimeout === 'function') {
	            cachedClearTimeout = clearTimeout;
	        } else {
	            cachedClearTimeout = defaultClearTimeout;
	        }
	    } catch (e) {
	        cachedClearTimeout = defaultClearTimeout;
	    }
	})();
	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }
	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e) {
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e) {
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }
	}
	var queue = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;
	
	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue = currentQueue.concat(queue);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue.length) {
	        drainQueue();
	    }
	}
	
	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;
	
	    var len = queue.length;
	    while (len) {
	        currentQueue = queue;
	        queue = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	
	process.nextTick = function (fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue.push(new Item(fun, args));
	    if (queue.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	};
	
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	process.title = 'browser';
	process.browser = true;
	process.env = {};
	process.argv = [];
	process.version = ''; // empty string to avoid regexp issues
	process.versions = {};
	
	function noop() {}
	
	process.on = noop;
	process.addListener = noop;
	process.once = noop;
	process.off = noop;
	process.removeListener = noop;
	process.removeAllListeners = noop;
	process.emit = noop;
	
	process.binding = function (name) {
	    throw new Error('process.binding is not supported');
	};
	
	process.cwd = function () {
	    return '/';
	};
	process.chdir = function (dir) {
	    throw new Error('process.chdir is not supported');
	};
	process.umask = function () {
	    return 0;
	};

/***/ },
/* 3 */
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*!
	 * inferno-router v1.3.0-rc.5
	 * (c) 2017 Dominic Gannaway'
	 * Released under the MIT License.
	 */
	
	(function (global, factory) {
	    ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports, __webpack_require__(1), __webpack_require__(8), __webpack_require__(9), __webpack_require__(10)) :  true ? !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__(1), __webpack_require__(8), __webpack_require__(9), __webpack_require__(10)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : factory(global['inferno-router'] = global['inferno-router'] || {}, global.Inferno, global.Inferno.Component, global.Inferno.createElement, global.Inferno.pathToRegexp);
	})(undefined, function (exports, Inferno, Component, createElement, pathToRegExp) {
	    'use strict';
	
	    var Inferno__default = 'default' in Inferno ? Inferno['default'] : Inferno;
	    Component = 'default' in Component ? Component['default'] : Component;
	    createElement = 'default' in createElement ? createElement['default'] : createElement;
	    pathToRegExp = 'default' in pathToRegExp ? pathToRegExp['default'] : pathToRegExp;
	
	    var isBrowser = typeof window !== 'undefined' && window.document;
	    function toArray(children) {
	        return isArray(children) ? children : children ? [children] : children;
	    }
	    // this is MUCH faster than .constructor === Array and instanceof Array
	    // in Node 7 and the later versions of V8, slower in older versions though
	    var isArray = Array.isArray;
	
	    function isString(obj) {
	        return typeof obj === 'string';
	    }
	
	    var __rest = undefined && undefined.__rest || function (s, e) {
	        var t = {};
	        for (var p in s) {
	            if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) {
	                t[p] = s[p];
	            }
	        }
	        if (s != null && typeof Object.getOwnPropertySymbols === "function") {
	            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
	                if (e.indexOf(p[i]) < 0) {
	                    t[p[i]] = s[p[i]];
	                }
	            }
	        }
	        return t;
	    };
	    function Link(props, ref) {
	        var router = ref.router;
	
	        // TODO: Convert to object assign
	        var activeClassName = props.activeClassName;
	        var activeStyle = props.activeStyle;
	        var className = props.className;
	        var onClick = props.onClick;
	        var to = props.to;
	        var otherProps = __rest(props, ["activeClassName", "activeStyle", "className", "onClick", "to"]);
	        var elemProps = Object.assign({ href: isBrowser ? router.createHref({ pathname: to }) : router.location.baseUrl ? router.location.baseUrl + to : to }, otherProps);
	        if (className) {
	            elemProps.className = className;
	        }
	        if (router.location.pathname === to) {
	            if (activeClassName) {
	                elemProps.className = (className ? className + ' ' : '') + activeClassName;
	            }
	            if (activeStyle) {
	                elemProps.style = Object.assign({}, props.style, activeStyle);
	            }
	        }
	        elemProps.onclick = function navigate(e) {
	            if (e.button !== 0 || e.ctrlKey || e.altKey || e.metaKey || e.shiftKey) {
	                return;
	            }
	            e.preventDefault();
	            if (typeof onClick === 'function') {
	                onClick(e);
	            }
	            router.push(to, e.target.textContent);
	        };
	        return Inferno.createVNode(2 /* HtmlElement */, 'a', elemProps, props.children);
	    }
	
	    function IndexLink(props) {
	        props.to = '/';
	        return Inferno.createVNode(8 /* ComponentFunction */, Link, props);
	    }
	
	    var emptyObject = {};
	    function decode(val) {
	        return typeof val !== 'string' ? val : decodeURIComponent(val);
	    }
	    function isEmpty(children) {
	        return !children || !(isArray(children) ? children : Object.keys(children)).length;
	    }
	    function flatten(oldArray) {
	        var newArray = [];
	        flattenArray(oldArray, newArray);
	        return newArray;
	    }
	    function getURLString(location) {
	        return isString(location) ? location : location.pathname + location.search;
	    }
	    /**
	     * Maps a querystring to an object
	     * Supports arrays and utf-8 characters
	     * @param search
	     * @returns {any}
	     */
	    function mapSearchParams(search) {
	        if (search === '') {
	            return {};
	        }
	        // Create an object with no prototype
	        var map = Object.create(null);
	        var fragments = search.split('&');
	        for (var i = 0, len = fragments.length; i < len; i++) {
	            var fragment = fragments[i];
	            var ref = fragment.split('=').map(mapFragment);
	            var k = ref[0];
	            var v = ref[1];
	            if (map[k]) {
	                map[k] = isArray(map[k]) ? map[k] : [map[k]];
	                map[k].push(v);
	            } else {
	                map[k] = v;
	            }
	        }
	        return map;
	    }
	    /**
	     * Gets the relevant part of the URL for matching
	     * @param fullURL
	     * @param partURL
	     * @returns {string}
	     */
	    function toPartialURL(fullURL, partURL) {
	        if (fullURL.indexOf(partURL) === 0) {
	            return fullURL.substr(partURL.length);
	        }
	        return fullURL;
	    }
	    /**
	     * Simulates ... operator by returning first argument
	     * with the keys in the second argument excluded
	     * @param _args
	     * @param excluded
	     * @returns {{}}
	     */
	    function rest(_args, excluded) {
	        var t = {};
	        for (var p in _args) {
	            if (excluded.indexOf(p) < 0) {
	                t[p] = _args[p];
	            }
	        }
	        return t;
	    }
	    /**
	     * Sorts an array according to its `path` prop length
	     * @param a
	     * @param b
	     * @returns {number}
	     */
	    function pathRankSort(a, b) {
	        var aAttr = a.props || emptyObject;
	        var bAttr = b.props || emptyObject;
	        var diff = rank(bAttr.path) - rank(aAttr.path);
	        return diff || (bAttr.path && aAttr.path ? bAttr.path.length - aAttr.path.length : 0);
	    }
	    /**
	     * Helper function for parsing querystring arrays
	     */
	    function mapFragment(p, isVal) {
	        return decodeURIComponent(isVal | 0 ? p : p.replace('[]', ''));
	    }
	    function strip(url) {
	        return url.replace(/(^\/+|\/+$)/g, '');
	    }
	    function rank(url) {
	        if (url === void 0) url = '';
	
	        return (strip(url).match(/\/+/g) || '').length;
	    }
	    function flattenArray(oldArray, newArray) {
	        for (var i = 0, len = oldArray.length; i < len; i++) {
	            var item = oldArray[i];
	            if (isArray(item)) {
	                flattenArray(item, newArray);
	            } else {
	                newArray.push(item);
	            }
	        }
	    }
	
	    var Route = function (Component$$1) {
	        function Route(props, context) {
	            var this$1 = this;
	
	            Component$$1.call(this, props, context);
	            this._onComponentResolved = function (error, component) {
	                this$1.setState({
	                    asyncComponent: component
	                });
	            };
	            this.state = {
	                asyncComponent: null
	            };
	        }
	
	        if (Component$$1) Route.__proto__ = Component$$1;
	        Route.prototype = Object.create(Component$$1 && Component$$1.prototype);
	        Route.prototype.constructor = Route;
	        Route.prototype.componentWillMount = function componentWillMount() {
	            var this$1 = this;
	
	            var ref = this.props;
	            var onEnter = ref.onEnter;
	            var ref$1 = this.context;
	            var router = ref$1.router;
	            if (onEnter) {
	                Promise.resolve().then(function () {
	                    onEnter({ props: this$1.props, router: router });
	                });
	            }
	            var ref$2 = this.props;
	            var getComponent = ref$2.getComponent;
	            if (getComponent) {
	                Promise.resolve().then(function () {
	                    getComponent({ props: this$1.props, router: router }, this$1._onComponentResolved);
	                });
	            }
	        };
	        Route.prototype.onLeave = function onLeave(trigger) {
	            if (trigger === void 0) trigger = false;
	
	            var ref = this.props;
	            var onLeave = ref.onLeave;
	            var ref$1 = this.context;
	            var router = ref$1.router;
	            if (onLeave && trigger) {
	                onLeave({ props: this.props, router: router });
	            }
	        };
	        Route.prototype.onEnter = function onEnter(nextProps) {
	            var onEnter = nextProps.onEnter;
	            var ref = this.context;
	            var router = ref.router;
	            if (this.props.path !== nextProps.path && onEnter) {
	                onEnter({ props: nextProps, router: router });
	            }
	        };
	        Route.prototype.getComponent = function getComponent(nextProps) {
	            var getComponent = nextProps.getComponent;
	            var ref = this.context;
	            var router = ref.router;
	            if (this.props.path !== nextProps.path && getComponent) {
	                getComponent({ props: nextProps, router: router }, this._onComponentResolved);
	            }
	        };
	        Route.prototype.componentWillUnmount = function componentWillUnmount() {
	            this.onLeave(true);
	        };
	        Route.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	            this.getComponent(nextProps);
	            this.onEnter(nextProps);
	            this.onLeave(this.props.path !== nextProps.path);
	        };
	        Route.prototype.render = function render(_args) {
	            var component = _args.component;
	            var children = _args.children;
	            var props = rest(_args, ['component', 'children', 'path', 'getComponent']);
	            var ref = this.state;
	            var asyncComponent = ref.asyncComponent;
	            var resolvedComponent = component || asyncComponent;
	            if (!resolvedComponent) {
	                return null;
	            }
	            return createElement(resolvedComponent, props, children);
	        };
	
	        return Route;
	    }(Component);
	
	    var IndexRoute = function (Route$$1) {
	        function IndexRoute(props, context) {
	            Route$$1.call(this, props, context);
	            props.path = '/';
	        }
	
	        if (Route$$1) IndexRoute.__proto__ = Route$$1;
	        IndexRoute.prototype = Object.create(Route$$1 && Route$$1.prototype);
	        IndexRoute.prototype.constructor = IndexRoute;
	
	        return IndexRoute;
	    }(Route);
	
	    var Redirect = function (Route$$1) {
	        function Redirect(props, context) {
	            Route$$1.call(this, props, context);
	            if (!props.to) {
	                props.to = '/';
	            }
	        }
	
	        if (Route$$1) Redirect.__proto__ = Route$$1;
	        Redirect.prototype = Object.create(Route$$1 && Route$$1.prototype);
	        Redirect.prototype.constructor = Redirect;
	
	        return Redirect;
	    }(Route);
	
	    var cache = new Map();
	    /**
	     * Returns a node containing only the matched components
	     * @param routes
	     * @param currentURL
	     * @returns {any|VComponent}
	     */
	    function match(routes, currentURL) {
	        var location = getURLString(currentURL);
	        var renderProps = matchRoutes(toArray(routes), location, '/');
	        return renderProps;
	    }
	    /**
	     * Go through every route and create a new node
	     * with the matched components
	     * @param _routes
	     * @param currentURL
	     * @param parentPath
	     * @param redirect
	     * @returns {object}
	     */
	    function matchRoutes(_routes, currentURL, parentPath, redirect) {
	        if (currentURL === void 0) currentURL = '/';
	        if (parentPath === void 0) parentPath = '/';
	        if (redirect === void 0) redirect = false;
	
	        var routes = isArray(_routes) ? flatten(_routes) : toArray(_routes);
	        var ref = currentURL.split('?');
	        var pathToMatch = ref[0];if (pathToMatch === void 0) pathToMatch = '/';
	        var search = ref[1];if (search === void 0) search = '';
	        var params = mapSearchParams(search);
	        routes.sort(pathRankSort);
	        for (var i = 0, len = routes.length; i < len; i++) {
	            var route = routes[i];
	            var props = route.props || emptyObject;
	            var routePath = props.from || props.path || '/';
	            var location = parentPath + toPartialURL(routePath, parentPath).replace(/\/\//g, '/');
	            var isLast = isEmpty(props.children);
	            var matchBase = matchPath(isLast, location, pathToMatch);
	            if (matchBase) {
	                var children = props.children;
	                if (props.from) {
	                    redirect = props.to;
	                }
	                if (children) {
	                    var matchChild = matchRoutes(children, currentURL, location, redirect);
	                    if (matchChild) {
	                        if (matchChild.redirect) {
	                            return {
	                                location: location,
	                                redirect: matchChild.redirect
	                            };
	                        }
	                        children = matchChild.matched;
	                        Object.assign(params, children.props.params);
	                    } else {
	                        children = null;
	                    }
	                }
	                var matched = Inferno__default.cloneVNode(route, {
	                    params: Object.assign(params, matchBase.params),
	                    children: children
	                });
	                return {
	                    location: location,
	                    redirect: redirect,
	                    matched: matched
	                };
	            }
	        }
	    }
	    /**
	     * Converts path to a regex, if a match is found then we extract params from it
	     * @param end
	     * @param routePath
	     * @param pathToMatch
	     * @returns {any}
	     */
	    function matchPath(end, routePath, pathToMatch) {
	        var key = routePath + "|" + end;
	        var regexp = cache.get(key);
	        if (!regexp) {
	            var keys = [];
	            regexp = { pattern: pathToRegExp(routePath, keys, { end: end }), keys: keys };
	            cache.set(key, regexp);
	        }
	        var m = regexp.pattern.exec(pathToMatch);
	        if (!m) {
	            return null;
	        }
	        var path = m[0];
	        var params = Object.create(null);
	        for (var i = 1, len = m.length; i < len; i += 1) {
	            params[regexp.keys[i - 1].name] = decode(m[i]);
	        }
	        return {
	            path: path === '' ? '/' : path,
	            params: params
	        };
	    }
	
	    var RouterContext = function (Component$$1) {
	        function RouterContext(props, context) {
	            Component$$1.call(this, props, context);
	            if (process.env.NODE_ENV !== 'production') {
	                if (!props.location || !props.matched) {
	                    throw new TypeError('"inferno-router" requires a "location" and "matched" props passed');
	                }
	            }
	        }
	
	        if (Component$$1) RouterContext.__proto__ = Component$$1;
	        RouterContext.prototype = Object.create(Component$$1 && Component$$1.prototype);
	        RouterContext.prototype.constructor = RouterContext;
	        RouterContext.prototype.getChildContext = function getChildContext() {
	            return {
	                router: this.props.router || {
	                    location: {
	                        pathname: this.props.location,
	                        baseUrl: this.props.baseUrl
	                    }
	                }
	            };
	        };
	        RouterContext.prototype.render = function render(props) {
	            return props.matched;
	        };
	
	        return RouterContext;
	    }(Component);
	
	    function createrRouter(history) {
	        if (!history) {
	            throw new TypeError('Inferno: Error "inferno-router" requires a history prop passed');
	        }
	        return {
	            push: history.push,
	            replace: history.replace,
	            listen: history.listen,
	            createHref: history.createHref,
	            isActive: function isActive(url) {
	                return matchPath(true, url, this.url);
	            },
	            get location() {
	                return history.location.pathname !== 'blank' ? history.location : {
	                    pathname: '/',
	                    search: ''
	                };
	            },
	            get url() {
	                return this.location.pathname + this.location.search;
	            }
	        };
	    }
	    var Router = function (Component$$1) {
	        function Router(props, context) {
	            Component$$1.call(this, props, context);
	            this.router = createrRouter(props.history);
	            this.state = {
	                url: props.url || this.router.url
	            };
	        }
	
	        if (Component$$1) Router.__proto__ = Component$$1;
	        Router.prototype = Object.create(Component$$1 && Component$$1.prototype);
	        Router.prototype.constructor = Router;
	        Router.prototype.componentWillMount = function componentWillMount() {
	            var this$1 = this;
	
	            if (this.router) {
	                this.unlisten = this.router.listen(function () {
	                    this$1.routeTo(this$1.router.url);
	                });
	            }
	        };
	        Router.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	            this.setState({
	                url: nextProps.url
	            });
	        };
	        Router.prototype.componentWillUnmount = function componentWillUnmount() {
	            if (this.unlisten) {
	                this.unlisten();
	            }
	        };
	        Router.prototype.routeTo = function routeTo(url) {
	            this.setState({ url: url });
	        };
	        Router.prototype.render = function render(props) {
	            var this$1 = this;
	
	            var hit = match(props.children, this.state.url);
	            if (hit.redirect) {
	                setTimeout(function () {
	                    this$1.router.replace(hit.redirect);
	                }, 0);
	                return null;
	            }
	            return Inferno.createVNode(4 /* ComponentClass */, RouterContext, {
	                location: this.state.url,
	                router: this.router,
	                matched: hit.matched
	            });
	        };
	
	        return Router;
	    }(Component);
	
	    var index = {
	        Route: Route,
	        IndexRoute: IndexRoute,
	        Redirect: Redirect,
	        IndexRedirect: Redirect,
	        Router: Router,
	        RouterContext: RouterContext,
	        Link: Link,
	        IndexLink: IndexLink,
	        match: match
	    };
	
	    exports.Route = Route;
	    exports.IndexRoute = IndexRoute;
	    exports.Redirect = Redirect;
	    exports.IndexRedirect = Redirect;
	    exports.Router = Router;
	    exports.RouterContext = RouterContext;
	    exports.Link = Link;
	    exports.IndexLink = IndexLink;
	    exports.match = match;
	    exports['default'] = index;
	
	    Object.defineProperty(exports, '__esModule', { value: true });
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*!
	 * inferno-component v1.3.0-rc.5
	 * (c) 2017 Dominic Gannaway'
	 * Released under the MIT License.
	 */
	
	(function (global, factory) {
	    ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory(__webpack_require__(1)) :  true ? !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : global['inferno-component'] = factory(global.Inferno);
	})(undefined, function (inferno) {
	    'use strict';
	
	    var NO_OP = '$NO_OP';
	    var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
	    var isBrowser = typeof window !== 'undefined' && window.document;
	
	    // this is MUCH faster than .constructor === Array and instanceof Array
	    // in Node 7 and the later versions of V8, slower in older versions though
	    var isArray = Array.isArray;
	
	    function isStringOrNumber(obj) {
	        var type = typeof obj === 'undefined' ? 'undefined' : _typeof(obj);
	        return type === 'string' || type === 'number';
	    }
	    function isNullOrUndef(obj) {
	        return isUndefined(obj) || isNull(obj);
	    }
	    function isInvalid(obj) {
	        return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
	    }
	    function isFunction(obj) {
	        return typeof obj === 'function';
	    }
	
	    function isNull(obj) {
	        return obj === null;
	    }
	    function isTrue(obj) {
	        return obj === true;
	    }
	    function isUndefined(obj) {
	        return obj === undefined;
	    }
	
	    function throwError(message) {
	        if (!message) {
	            message = ERROR_MSG;
	        }
	        throw new Error("Inferno Error: " + message);
	    }
	
	    function Lifecycle() {
	        this.listeners = [];
	    }
	    Lifecycle.prototype.addListener = function addListener(callback) {
	        this.listeners.push(callback);
	    };
	    Lifecycle.prototype.trigger = function trigger() {
	        var this$1 = this;
	
	        for (var i = 0, len = this.listeners.length; i < len; i++) {
	            this$1.listeners[i]();
	        }
	    };
	
	    // Make sure u use EMPTY_OBJ from 'inferno', otherwise it'll be a different reference
	    var noOp = ERROR_MSG;
	    if (process.env.NODE_ENV !== 'production') {
	        noOp = 'Inferno Error: Can only update a mounted or mounting component. This usually means you called setState() or forceUpdate() on an unmounted component. This is a no-op.';
	    }
	    var componentCallbackQueue = new Map();
	    // when a components root VNode is also a component, we can run into issues
	    // this will recursively look for vNode.parentNode if the VNode is a component
	    function updateParentComponentVNodes(vNode, dom) {
	        if (vNode.flags & 28 /* Component */) {
	                var parentVNode = vNode.parentVNode;
	                if (parentVNode) {
	                    parentVNode.dom = dom;
	                    updateParentComponentVNodes(parentVNode, dom);
	                }
	            }
	    }
	    // this is in shapes too, but we don't want to import from shapes as it will pull in a duplicate of createVNode
	    function createVoidVNode() {
	        return inferno.createVNode(4096 /* Void */);
	    }
	    function createTextVNode(text) {
	        return inferno.createVNode(1 /* Text */, null, null, text);
	    }
	    function addToQueue(component, force, callback) {
	        // TODO this function needs to be revised and improved on
	        var queue = componentCallbackQueue.get(component);
	        if (!queue) {
	            queue = [];
	            componentCallbackQueue.set(component, queue);
	            Promise.resolve().then(function () {
	                componentCallbackQueue.delete(component);
	                applyState(component, force, function () {
	                    for (var i = 0, len = queue.length; i < len; i++) {
	                        queue[i]();
	                    }
	                });
	            });
	        }
	        if (callback) {
	            queue.push(callback);
	        }
	    }
	    function queueStateChanges(component, newState, callback, sync) {
	        if (isFunction(newState)) {
	            newState = newState(component.state, component.props, component.context);
	        }
	        for (var stateKey in newState) {
	            component._pendingState[stateKey] = newState[stateKey];
	        }
	        if (!component._pendingSetState && isBrowser && !(sync && component._blockRender)) {
	            if (sync || component._blockRender) {
	                component._pendingSetState = true;
	                applyState(component, false, callback);
	            } else {
	                addToQueue(component, false, callback);
	            }
	        } else {
	            Object.assign(component.state, component._pendingState);
	            component._pendingState = {};
	        }
	    }
	    function applyState(component, force, callback) {
	        if ((!component._deferSetState || force) && !component._blockRender && !component._unmounted) {
	            component._pendingSetState = false;
	            var pendingState = component._pendingState;
	            var prevState = component.state;
	            var nextState = Object.assign({}, prevState, pendingState);
	            var props = component.props;
	            var context = component.context;
	            component._pendingState = {};
	            var nextInput = component._updateComponent(prevState, nextState, props, props, context, force, true);
	            var didUpdate = true;
	            if (isInvalid(nextInput)) {
	                nextInput = createVoidVNode();
	            } else if (nextInput === NO_OP) {
	                nextInput = component._lastInput;
	                didUpdate = false;
	            } else if (isStringOrNumber(nextInput)) {
	                nextInput = createTextVNode(nextInput);
	            } else if (isArray(nextInput)) {
	                if (process.env.NODE_ENV !== 'production') {
	                    throwError('a valid Inferno VNode (or null) must be returned from a component render. You may have returned an array or an invalid object.');
	                }
	                throwError();
	            }
	            var lastInput = component._lastInput;
	            var vNode = component._vNode;
	            var parentDom = lastInput.dom && lastInput.dom.parentNode || (lastInput.dom = vNode.dom);
	            component._lastInput = nextInput;
	            if (didUpdate) {
	                var subLifecycle = component._lifecycle;
	                if (!subLifecycle) {
	                    subLifecycle = new Lifecycle();
	                } else {
	                    subLifecycle.listeners = [];
	                }
	                component._lifecycle = subLifecycle;
	                var childContext = component.getChildContext();
	                if (isNullOrUndef(childContext)) {
	                    childContext = component._childContext;
	                } else {
	                    childContext = Object.assign({}, context, component._childContext, childContext);
	                }
	                component._patch(lastInput, nextInput, parentDom, subLifecycle, childContext, component._isSVG, false);
	                subLifecycle.trigger();
	                component.componentDidUpdate(props, prevState);
	                inferno.options.afterUpdate && inferno.options.afterUpdate(vNode);
	            }
	            var dom = vNode.dom = nextInput.dom;
	            var componentToDOMNodeMap = component._componentToDOMNodeMap;
	            componentToDOMNodeMap && componentToDOMNodeMap.set(component, nextInput.dom);
	            updateParentComponentVNodes(vNode, dom);
	            if (!isNullOrUndef(callback)) {
	                callback();
	            }
	        } else if (!isNullOrUndef(callback)) {
	            callback();
	        }
	    }
	    var Component = function Component(props, context) {
	        this.state = {};
	        this.refs = {};
	        this._blockRender = false;
	        this._ignoreSetState = false;
	        this._blockSetState = false;
	        this._deferSetState = false;
	        this._pendingSetState = false;
	        this._syncSetState = true;
	        this._pendingState = {};
	        this._lastInput = null;
	        this._vNode = null;
	        this._unmounted = true;
	        this._lifecycle = null;
	        this._childContext = null;
	        this._patch = null;
	        this._isSVG = false;
	        this._componentToDOMNodeMap = null;
	        /** @type {object} */
	        this.props = props || inferno.EMPTY_OBJ;
	        /** @type {object} */
	        this.context = context || inferno.EMPTY_OBJ; // context should not be mutable
	    };
	    Component.prototype.render = function render(nextProps, nextState, nextContext) {};
	    Component.prototype.forceUpdate = function forceUpdate(callback) {
	        if (this._unmounted) {
	            return;
	        }
	        isBrowser && applyState(this, true, callback);
	    };
	    Component.prototype.setState = function setState(newState, callback) {
	        if (this._unmounted) {
	            return;
	        }
	        if (!this._blockSetState) {
	            if (!this._ignoreSetState) {
	                queueStateChanges(this, newState, callback, this._syncSetState);
	            }
	        } else {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('cannot update state via setState() in componentWillUpdate().');
	            }
	            throwError();
	        }
	    };
	    Component.prototype.setStateSync = function setStateSync(newState) {
	        if (this._unmounted) {
	            return;
	        }
	        if (!this._blockSetState) {
	            if (!this._ignoreSetState) {
	                queueStateChanges(this, newState, null, true);
	            }
	        } else {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError('cannot update state via setState() in componentWillUpdate().');
	            }
	            throwError();
	        }
	    };
	    Component.prototype.componentWillMount = function componentWillMount() {};
	    Component.prototype.componentDidUpdate = function componentDidUpdate(prevProps, prevState, prevContext) {};
	    Component.prototype.shouldComponentUpdate = function shouldComponentUpdate(nextProps, nextState, context) {
	        return true;
	    };
	    Component.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps, context) {};
	    Component.prototype.componentWillUpdate = function componentWillUpdate(nextProps, nextState, nextContext) {};
	    Component.prototype.getChildContext = function getChildContext() {};
	    Component.prototype._updateComponent = function _updateComponent(prevState, nextState, prevProps, nextProps, context, force, fromSetState) {
	        if (this._unmounted === true) {
	            if (process.env.NODE_ENV !== 'production') {
	                throwError(noOp);
	            }
	            throwError();
	        }
	        if (prevProps !== nextProps || nextProps === inferno.EMPTY_OBJ || prevState !== nextState || force) {
	            if (prevProps !== nextProps || nextProps === inferno.EMPTY_OBJ) {
	                if (!fromSetState) {
	                    this._blockRender = true;
	                    this.componentWillReceiveProps(nextProps, context);
	                    this._blockRender = false;
	                }
	                if (this._pendingSetState) {
	                    nextState = Object.assign({}, nextState, this._pendingState);
	                    this._pendingSetState = false;
	                    this._pendingState = {};
	                }
	            }
	            this.props = nextProps;
	            this.state = nextState;
	            this.context = context;
	            var shouldUpdate = this.shouldComponentUpdate(nextProps, nextState, context);
	            if (shouldUpdate || force) {
	                this._blockSetState = true;
	                this.componentWillUpdate(nextProps, nextState, context);
	                this._blockSetState = false;
	                inferno.options.beforeRender && inferno.options.beforeRender(this);
	                var render = this.render(nextProps, nextState, context);
	                inferno.options.afterRender && inferno.options.afterRender(this);
	                return render;
	            }
	        }
	        return NO_OP;
	    };
	
	    return Component;
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*!
	 * inferno-create-element v1.3.0-rc.5
	 * (c) 2017 Dominic Gannaway'
	 * Released under the MIT License.
	 */
	
	(function (global, factory) {
	    ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? module.exports = factory(__webpack_require__(1)) :  true ? !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : global['inferno-create-element'] = factory(global.Inferno);
	})(undefined, function (inferno) {
	    'use strict';
	
	    // this is MUCH faster than .constructor === Array and instanceof Array
	    // in Node 7 and the later versions of V8, slower in older versions though
	
	    function isStatefulComponent(o) {
	        return !isUndefined(o.prototype) && !isUndefined(o.prototype.render);
	    }
	
	    function isNullOrUndef(obj) {
	        return isUndefined(obj) || isNull(obj);
	    }
	    function isInvalid(obj) {
	        return isNull(obj) || obj === false || isTrue(obj) || isUndefined(obj);
	    }
	
	    function isAttrAnEvent(attr) {
	        return attr[0] === 'o' && attr[1] === 'n' && attr.length > 3;
	    }
	    function isString(obj) {
	        return typeof obj === 'string';
	    }
	
	    function isNull(obj) {
	        return obj === null;
	    }
	    function isTrue(obj) {
	        return obj === true;
	    }
	    function isUndefined(obj) {
	        return obj === undefined;
	    }
	    function isObject(o) {
	        return (typeof o === 'undefined' ? 'undefined' : _typeof(o)) === 'object';
	    }
	
	    var componentHooks = {
	        onComponentWillMount: true,
	        onComponentDidMount: true,
	        onComponentWillUnmount: true,
	        onComponentShouldUpdate: true,
	        onComponentWillUpdate: true,
	        onComponentDidUpdate: true
	    };
	    function createElement(name, props) {
	        var _children = [],
	            len$2 = arguments.length - 2;
	        while (len$2-- > 0) {
	            _children[len$2] = arguments[len$2 + 2];
	        }if (isInvalid(name) || isObject(name)) {
	            throw new Error('Inferno Error: createElement() name parameter cannot be undefined, null, false or true, It must be a string, class or function.');
	        }
	        var children = _children;
	        var ref = null;
	        var key = null;
	        var events = null;
	        var flags = 0;
	        if (_children) {
	            if (_children.length === 1) {
	                children = _children[0];
	            } else if (_children.length === 0) {
	                children = undefined;
	            }
	        }
	        if (isString(name)) {
	            switch (name) {
	                case 'svg':
	                    flags = 128 /* SvgElement */;
	                    break;
	                case 'input':
	                    flags = 512 /* InputElement */;
	                    break;
	                case 'textarea':
	                    flags = 1024 /* TextareaElement */;
	                    break;
	                case 'select':
	                    flags = 2048 /* SelectElement */;
	                    break;
	                default:
	                    flags = 2 /* HtmlElement */;
	                    break;
	            }
	            /*
	             This fixes de-optimisation:
	             uses object Keys for looping props to avoid deleting props of looped object
	             */
	            if (!isNullOrUndef(props)) {
	                var propKeys = Object.keys(props);
	                for (var i = 0, len = propKeys.length; i < len; i++) {
	                    var propKey = propKeys[i];
	                    if (propKey === 'key') {
	                        key = props.key;
	                        delete props.key;
	                    } else if (propKey === 'children' && isUndefined(children)) {
	                        children = props.children; // always favour children args, default to props
	                    } else if (propKey === 'ref') {
	                        ref = props.ref;
	                    } else if (isAttrAnEvent(propKey)) {
	                        if (!events) {
	                            events = {};
	                        }
	                        events[propKey] = props[propKey];
	                        delete props[propKey];
	                    }
	                }
	            }
	        } else {
	            flags = isStatefulComponent(name) ? 4 /* ComponentClass */ : 8 /* ComponentFunction */;
	            if (!isUndefined(children)) {
	                if (!props) {
	                    props = {};
	                }
	                props.children = children;
	                children = null;
	            }
	            if (!isNullOrUndef(props)) {
	                /*
	                 This fixes de-optimisation:
	                 uses object Keys for looping props to avoid deleting props of looped object
	                 */
	                var propKeys$1 = Object.keys(props);
	                for (var i$1 = 0, len$1 = propKeys$1.length; i$1 < len$1; i$1++) {
	                    var propKey$1 = propKeys$1[i$1];
	                    if (componentHooks[propKey$1]) {
	                        if (!ref) {
	                            ref = {};
	                        }
	                        ref[propKey$1] = props[propKey$1];
	                    } else if (propKey$1 === 'key') {
	                        key = props.key;
	                        delete props.key;
	                    }
	                }
	            }
	        }
	        return inferno.createVNode(flags, name, props, children, events, key, ref);
	    }
	
	    return createElement;
	});

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var pathToRegExp = __webpack_require__(11);
	
	/**
	 * Expose `pathToRegexp` as ES6 module
	 */
	module.exports = pathToRegExp;
	module.exports.parse = pathToRegExp.parse;
	module.exports.compile = pathToRegExp.compile;
	module.exports.tokensToFunction = pathToRegExp.tokensToFunction;
	module.exports.tokensToRegExp = pathToRegExp.tokensToRegExp;
	module.exports['default'] = module.exports;

/***/ },
/* 11 */
/***/ function(module, exports) {

	'use strict';
	
	/**
	 * Expose `pathtoRegexp`.
	 */
	
	module.exports = pathtoRegexp;
	
	/**
	 * Match matching groups in a regular expression.
	 */
	var MATCHING_GROUP_REGEXP = /\((?!\?)/g;
	
	/**
	 * Normalize the given path string,
	 * returning a regular expression.
	 *
	 * An empty array should be passed,
	 * which will contain the placeholder
	 * key names. For example "/user/:id" will
	 * then contain ["id"].
	 *
	 * @param  {String|RegExp|Array} path
	 * @param  {Array} keys
	 * @param  {Object} options
	 * @return {RegExp}
	 * @api private
	 */
	
	function pathtoRegexp(path, keys, options) {
	  options = options || {};
	  keys = keys || [];
	  var strict = options.strict;
	  var end = options.end !== false;
	  var flags = options.sensitive ? '' : 'i';
	  var extraOffset = 0;
	  var keysOffset = keys.length;
	  var i = 0;
	  var name = 0;
	  var m;
	
	  if (path instanceof RegExp) {
	    while (m = MATCHING_GROUP_REGEXP.exec(path.source)) {
	      keys.push({
	        name: name++,
	        optional: false,
	        offset: m.index
	      });
	    }
	
	    return path;
	  }
	
	  if (Array.isArray(path)) {
	    // Map array parts into regexps and return their source. We also pass
	    // the same keys and options instance into every generation to get
	    // consistent matching groups before we join the sources together.
	    path = path.map(function (value) {
	      return pathtoRegexp(value, keys, options).source;
	    });
	
	    return new RegExp('(?:' + path.join('|') + ')', flags);
	  }
	
	  path = ('^' + path + (strict ? '' : path[path.length - 1] === '/' ? '?' : '/?')).replace(/\/\(/g, '/(?:').replace(/([\/\.])/g, '\\$1').replace(/(\\\/)?(\\\.)?:(\w+)(\(.*?\))?(\*)?(\?)?/g, function (match, slash, format, key, capture, star, optional, offset) {
	    slash = slash || '';
	    format = format || '';
	    capture = capture || '([^\\/' + format + ']+?)';
	    optional = optional || '';
	
	    keys.push({
	      name: key,
	      optional: !!optional,
	      offset: offset + extraOffset
	    });
	
	    var result = '' + (optional ? '' : slash) + '(?:' + format + (optional ? slash : '') + capture + (star ? '((?:[\\/' + format + '].+?)?)' : '') + ')' + optional;
	
	    extraOffset += result.length - match.length;
	
	    return result;
	  }).replace(/\*/g, function (star, index) {
	    var len = keys.length;
	
	    while (len-- > keysOffset && keys[len].offset > index) {
	      keys[len].offset += 3; // Replacement length minus asterisk length.
	    }
	
	    return '(.*)';
	  });
	
	  // This is a workaround for handling unnamed matching groups.
	  while (m = MATCHING_GROUP_REGEXP.exec(path)) {
	    var escapeCount = 0;
	    var index = m.index;
	
	    while (path.charAt(--index) === '\\') {
	      escapeCount++;
	    }
	
	    // It's possible to escape the bracket.
	    if (escapeCount % 2 === 1) {
	      continue;
	    }
	
	    if (keysOffset + i === keys.length || keys[keysOffset + i].offset > m.index) {
	      keys.splice(keysOffset + i, 0, {
	        name: name++, // Unnamed matching groups must be consistently linear.
	        optional: false,
	        offset: m.index
	      });
	    }
	
	    i++;
	  }
	
	  // If the path is non-ending, match until the end or a slash.
	  path += end ? '$' : path[path.length - 1] === '/' ? '' : '(?=\\/|$)';
	
	  return new RegExp(path, flags);
	};

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.__esModule = true;
	
	var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
	};
	
	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }return target;
	};
	
	var _warning = __webpack_require__(13);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	var _invariant = __webpack_require__(14);
	
	var _invariant2 = _interopRequireDefault(_invariant);
	
	var _LocationUtils = __webpack_require__(15);
	
	var _PathUtils = __webpack_require__(18);
	
	var _createTransitionManager = __webpack_require__(19);
	
	var _createTransitionManager2 = _interopRequireDefault(_createTransitionManager);
	
	var _ExecutionEnvironment = __webpack_require__(20);
	
	var _DOMUtils = __webpack_require__(21);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}
	
	var PopStateEvent = 'popstate';
	var HashChangeEvent = 'hashchange';
	
	var getHistoryState = function getHistoryState() {
	  try {
	    return window.history.state || {};
	  } catch (e) {
	    // IE 11 sometimes throws when accessing window.history.state
	    // See https://github.com/mjackson/history/pull/289
	    return {};
	  }
	};
	
	/**
	 * Creates a history object that uses the HTML5 history API including
	 * pushState, replaceState, and the popstate event.
	 */
	var createBrowserHistory = function createBrowserHistory() {
	  var props = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	
	  !_ExecutionEnvironment.canUseDOM ? process.env.NODE_ENV !== 'production' ? (0, _invariant2.default)(false, 'Browser history needs a DOM') : (0, _invariant2.default)(false) : void 0;
	
	  var globalHistory = window.history;
	  var canUseHistory = (0, _DOMUtils.supportsHistory)();
	  var needsHashChangeListener = !(0, _DOMUtils.supportsPopStateOnHashChange)();
	
	  var _props$basename = props.basename,
	      basename = _props$basename === undefined ? '' : _props$basename,
	      _props$forceRefresh = props.forceRefresh,
	      forceRefresh = _props$forceRefresh === undefined ? false : _props$forceRefresh,
	      _props$getUserConfirm = props.getUserConfirmation,
	      getUserConfirmation = _props$getUserConfirm === undefined ? _DOMUtils.getConfirmation : _props$getUserConfirm,
	      _props$keyLength = props.keyLength,
	      keyLength = _props$keyLength === undefined ? 6 : _props$keyLength;
	
	  var getDOMLocation = function getDOMLocation(historyState) {
	    var _ref = historyState || {},
	        key = _ref.key,
	        state = _ref.state;
	
	    var _window$location = window.location,
	        pathname = _window$location.pathname,
	        search = _window$location.search,
	        hash = _window$location.hash;
	
	    var path = pathname + search + hash;
	
	    if (basename) path = (0, _PathUtils.stripPrefix)(path, basename);
	
	    return _extends({}, (0, _PathUtils.parsePath)(path), {
	      state: state,
	      key: key
	    });
	  };
	
	  var createKey = function createKey() {
	    return Math.random().toString(36).substr(2, keyLength);
	  };
	
	  var transitionManager = (0, _createTransitionManager2.default)();
	
	  var setState = function setState(nextState) {
	    _extends(history, nextState);
	
	    history.length = globalHistory.length;
	
	    transitionManager.notifyListeners(history.location, history.action);
	  };
	
	  var handlePopState = function handlePopState(event) {
	    // Ignore extraneous popstate events in WebKit.
	    if ((0, _DOMUtils.isExtraneousPopstateEvent)(event)) return;
	
	    handlePop(getDOMLocation(event.state));
	  };
	
	  var handleHashChange = function handleHashChange() {
	    handlePop(getDOMLocation(getHistoryState()));
	  };
	
	  var forceNextPop = false;
	
	  var handlePop = function handlePop(location) {
	    if (forceNextPop) {
	      forceNextPop = false;
	      setState();
	    } else {
	      (function () {
	        var action = 'POP';
	
	        transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	          if (ok) {
	            setState({ action: action, location: location });
	          } else {
	            revertPop(location);
	          }
	        });
	      })();
	    }
	  };
	
	  var revertPop = function revertPop(fromLocation) {
	    var toLocation = history.location;
	
	    // TODO: We could probably make this more reliable by
	    // keeping a list of keys we've seen in sessionStorage.
	    // Instead, we just default to 0 for keys we don't know.
	
	    var toIndex = allKeys.indexOf(toLocation.key);
	
	    if (toIndex === -1) toIndex = 0;
	
	    var fromIndex = allKeys.indexOf(fromLocation.key);
	
	    if (fromIndex === -1) fromIndex = 0;
	
	    var delta = toIndex - fromIndex;
	
	    if (delta) {
	      forceNextPop = true;
	      go(delta);
	    }
	  };
	
	  var initialLocation = getDOMLocation(getHistoryState());
	  var allKeys = [initialLocation.key];
	
	  // Public interface
	
	  var createHref = function createHref(location) {
	    return basename + (0, _PathUtils.createPath)(location);
	  };
	
	  var push = function push(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to push when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
	
	    var action = 'PUSH';
	    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      var href = createHref(location);
	      var key = location.key,
	          state = location.state;
	
	      if (canUseHistory) {
	        globalHistory.pushState({ key: key, state: state }, null, href);
	
	        if (forceRefresh) {
	          window.location.href = href;
	        } else {
	          var prevIndex = allKeys.indexOf(history.location.key);
	          var nextKeys = allKeys.slice(0, prevIndex === -1 ? 0 : prevIndex + 1);
	
	          nextKeys.push(location.key);
	          allKeys = nextKeys;
	
	          setState({ action: action, location: location });
	        }
	      } else {
	        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Browser history cannot push state in browsers that do not support HTML5 history') : void 0;
	
	        window.location.href = href;
	      }
	    });
	  };
	
	  var replace = function replace(path, state) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(!((typeof path === 'undefined' ? 'undefined' : _typeof(path)) === 'object' && path.state !== undefined && state !== undefined), 'You should avoid providing a 2nd state argument to replace when the 1st ' + 'argument is a location-like object that already has state; it is ignored') : void 0;
	
	    var action = 'REPLACE';
	    var location = (0, _LocationUtils.createLocation)(path, state, createKey(), history.location);
	
	    transitionManager.confirmTransitionTo(location, action, getUserConfirmation, function (ok) {
	      if (!ok) return;
	
	      var href = createHref(location);
	      var key = location.key,
	          state = location.state;
	
	      if (canUseHistory) {
	        globalHistory.replaceState({ key: key, state: state }, null, href);
	
	        if (forceRefresh) {
	          window.location.replace(href);
	        } else {
	          var prevIndex = allKeys.indexOf(history.location.key);
	
	          if (prevIndex !== -1) allKeys[prevIndex] = location.key;
	
	          setState({ action: action, location: location });
	        }
	      } else {
	        process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(state === undefined, 'Browser history cannot replace state in browsers that do not support HTML5 history') : void 0;
	
	        window.location.replace(href);
	      }
	    });
	  };
	
	  var go = function go(n) {
	    globalHistory.go(n);
	  };
	
	  var goBack = function goBack() {
	    return go(-1);
	  };
	
	  var goForward = function goForward() {
	    return go(1);
	  };
	
	  var listenerCount = 0;
	
	  var checkDOMListeners = function checkDOMListeners(delta) {
	    listenerCount += delta;
	
	    if (listenerCount === 1) {
	      (0, _DOMUtils.addEventListener)(window, PopStateEvent, handlePopState);
	
	      if (needsHashChangeListener) (0, _DOMUtils.addEventListener)(window, HashChangeEvent, handleHashChange);
	    } else if (listenerCount === 0) {
	      (0, _DOMUtils.removeEventListener)(window, PopStateEvent, handlePopState);
	
	      if (needsHashChangeListener) (0, _DOMUtils.removeEventListener)(window, HashChangeEvent, handleHashChange);
	    }
	  };
	
	  var isBlocked = false;
	
	  var block = function block() {
	    var prompt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
	
	    var unblock = transitionManager.setPrompt(prompt);
	
	    if (!isBlocked) {
	      checkDOMListeners(1);
	      isBlocked = true;
	    }
	
	    return function () {
	      if (isBlocked) {
	        isBlocked = false;
	        checkDOMListeners(-1);
	      }
	
	      return unblock();
	    };
	  };
	
	  var listen = function listen(listener) {
	    var unlisten = transitionManager.appendListener(listener);
	    checkDOMListeners(1);
	
	    return function () {
	      checkDOMListeners(-1);
	      return unlisten();
	    };
	  };
	
	  var history = {
	    length: globalHistory.length,
	    action: 'POP',
	    location: initialLocation,
	    createHref: createHref,
	    push: push,
	    replace: replace,
	    go: go,
	    goBack: goBack,
	    goForward: goForward,
	    block: block,
	    listen: listen
	  };
	
	  return history;
	};
	
	exports.default = createBrowserHistory;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2014-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	/**
	 * Similar to invariant but only logs a warning if the condition is not met.
	 * This can be used to log issues in development environments in critical
	 * paths. Removing the logging code for production environments will keep the
	 * same logic and follow the same code paths.
	 */
	
	var warning = function warning() {};
	
	if (process.env.NODE_ENV !== 'production') {
	  warning = function warning(condition, format, args) {
	    var len = arguments.length;
	    args = new Array(len > 2 ? len - 2 : 0);
	    for (var key = 2; key < len; key++) {
	      args[key - 2] = arguments[key];
	    }
	    if (format === undefined) {
	      throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
	    }
	
	    if (format.length < 10 || /^[s\W]*$/.test(format)) {
	      throw new Error('The warning format should be able to uniquely identify this ' + 'warning. Please, use a more descriptive format than: ' + format);
	    }
	
	    if (!condition) {
	      var argIndex = 0;
	      var message = 'Warning: ' + format.replace(/%s/g, function () {
	        return args[argIndex++];
	      });
	      if (typeof console !== 'undefined') {
	        console.error(message);
	      }
	      try {
	        // This error was thrown as a convenience so that you can use this stack
	        // to find the callsite that caused this warning to fire.
	        throw new Error(message);
	      } catch (x) {}
	    }
	  };
	}
	
	module.exports = warning;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {/**
	 * Copyright 2013-2015, Facebook, Inc.
	 * All rights reserved.
	 *
	 * This source code is licensed under the BSD-style license found in the
	 * LICENSE file in the root directory of this source tree. An additional grant
	 * of patent rights can be found in the PATENTS file in the same directory.
	 */
	
	'use strict';
	
	/**
	 * Use invariant() to assert state which your program assumes to be true.
	 *
	 * Provide sprintf-style format (only %s is supported) and arguments
	 * to provide information about what broke and what you were
	 * expecting.
	 *
	 * The invariant message will be stripped in production, but the invariant
	 * will remain to ensure logic does not differ in production.
	 */
	
	var invariant = function invariant(condition, format, a, b, c, d, e, f) {
	  if (process.env.NODE_ENV !== 'production') {
	    if (format === undefined) {
	      throw new Error('invariant requires an error message argument');
	    }
	  }
	
	  if (!condition) {
	    var error;
	    if (format === undefined) {
	      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
	    } else {
	      var args = [a, b, c, d, e, f];
	      var argIndex = 0;
	      error = new Error(format.replace(/%s/g, function () {
	        return args[argIndex++];
	      }));
	      error.name = 'Invariant Violation';
	    }
	
	    error.framesToPop = 1; // we don't care about invariant's own frame
	    throw error;
	  }
	};
	
	module.exports = invariant;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	exports.locationsAreEqual = exports.createLocation = undefined;
	
	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }return target;
	};
	
	var _resolvePathname = __webpack_require__(16);
	
	var _resolvePathname2 = _interopRequireDefault(_resolvePathname);
	
	var _valueEqual = __webpack_require__(17);
	
	var _valueEqual2 = _interopRequireDefault(_valueEqual);
	
	var _PathUtils = __webpack_require__(18);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}
	
	var createLocation = exports.createLocation = function createLocation(path, state, key, currentLocation) {
	  var location = void 0;
	  if (typeof path === 'string') {
	    // Two-arg form: push(path, state)
	    location = (0, _PathUtils.parsePath)(path);
	    location.state = state;
	  } else {
	    // One-arg form: push(location)
	    location = _extends({}, path);
	
	    if (location.pathname === undefined) location.pathname = '';
	
	    if (location.search) {
	      if (location.search.charAt(0) !== '?') location.search = '?' + location.search;
	    } else {
	      location.search = '';
	    }
	
	    if (location.hash) {
	      if (location.hash.charAt(0) !== '#') location.hash = '#' + location.hash;
	    } else {
	      location.hash = '';
	    }
	
	    if (state !== undefined && location.state === undefined) location.state = state;
	  }
	
	  location.key = key;
	
	  if (currentLocation) {
	    // Resolve incomplete/relative pathname relative to current location.
	    if (!location.pathname) {
	      location.pathname = currentLocation.pathname;
	    } else if (location.pathname.charAt(0) !== '/') {
	      location.pathname = (0, _resolvePathname2.default)(location.pathname, currentLocation.pathname);
	    }
	  }
	
	  return location;
	};
	
	var locationsAreEqual = exports.locationsAreEqual = function locationsAreEqual(a, b) {
	  return a.pathname === b.pathname && a.search === b.search && a.hash === b.hash && a.key === b.key && (0, _valueEqual2.default)(a.state, b.state);
	};

/***/ },
/* 16 */
/***/ function(module, exports) {

	'use strict';
	
	var isAbsolute = function isAbsolute(pathname) {
	  return pathname.charAt(0) === '/';
	};
	
	// About 1.5x faster than the two-arg version of Array#splice()
	var spliceOne = function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1) {
	    list[i] = list[k];
	  }list.pop();
	};
	
	// This implementation is based heavily on node's url.parse
	var resolvePathname = function resolvePathname(to) {
	  var from = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];
	
	  var toParts = to && to.split('/') || [];
	  var fromParts = from && from.split('/') || [];
	
	  var isToAbs = to && isAbsolute(to);
	  var isFromAbs = from && isAbsolute(from);
	  var mustEndAbs = isToAbs || isFromAbs;
	
	  if (to && isAbsolute(to)) {
	    // to is absolute
	    fromParts = toParts;
	  } else if (toParts.length) {
	    // to is relative, drop the filename
	    fromParts.pop();
	    fromParts = fromParts.concat(toParts);
	  }
	
	  if (!fromParts.length) return '/';
	
	  var hasTrailingSlash = void 0;
	  if (fromParts.length) {
	    var last = fromParts[fromParts.length - 1];
	    hasTrailingSlash = last === '.' || last === '..' || last === '';
	  } else {
	    hasTrailingSlash = false;
	  }
	
	  var up = 0;
	  for (var i = fromParts.length; i >= 0; i--) {
	    var part = fromParts[i];
	
	    if (part === '.') {
	      spliceOne(fromParts, i);
	    } else if (part === '..') {
	      spliceOne(fromParts, i);
	      up++;
	    } else if (up) {
	      spliceOne(fromParts, i);
	      up--;
	    }
	  }
	
	  if (!mustEndAbs) for (; up--; up) {
	    fromParts.unshift('..');
	  }if (mustEndAbs && fromParts[0] !== '' && (!fromParts[0] || !isAbsolute(fromParts[0]))) fromParts.unshift('');
	
	  var result = fromParts.join('/');
	
	  if (hasTrailingSlash && result.substr(-1) !== '/') result += '/';
	
	  return result;
	};
	
	module.exports = resolvePathname;

/***/ },
/* 17 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof2 = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.__esModule = true;
	
	var _typeof = typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof2(obj);
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof2(obj);
	};
	
	var valueEqual = function valueEqual(a, b) {
	  if (a === b) return true;
	
	  if (a == null || b == null) return false;
	
	  if (Array.isArray(a)) {
	    if (!Array.isArray(b) || a.length !== b.length) return false;
	
	    return a.every(function (item, index) {
	      return valueEqual(item, b[index]);
	    });
	  }
	
	  var aType = typeof a === 'undefined' ? 'undefined' : _typeof(a);
	  var bType = typeof b === 'undefined' ? 'undefined' : _typeof(b);
	
	  if (aType !== bType) return false;
	
	  if (aType === 'object') {
	    var aValue = a.valueOf();
	    var bValue = b.valueOf();
	
	    if (aValue !== a || bValue !== b) return valueEqual(aValue, bValue);
	
	    var aKeys = Object.keys(a);
	    var bKeys = Object.keys(b);
	
	    if (aKeys.length !== bKeys.length) return false;
	
	    return aKeys.every(function (key) {
	      return valueEqual(a[key], b[key]);
	    });
	  }
	
	  return false;
	};
	
	exports.default = valueEqual;

/***/ },
/* 18 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	var addLeadingSlash = exports.addLeadingSlash = function addLeadingSlash(path) {
	  return path.charAt(0) === '/' ? path : '/' + path;
	};
	
	var stripLeadingSlash = exports.stripLeadingSlash = function stripLeadingSlash(path) {
	  return path.charAt(0) === '/' ? path.substr(1) : path;
	};
	
	var stripPrefix = exports.stripPrefix = function stripPrefix(path, prefix) {
	  return path.indexOf(prefix) === 0 ? path.substr(prefix.length) : path;
	};
	
	var parsePath = exports.parsePath = function parsePath(path) {
	  var pathname = path || '/';
	  var search = '';
	  var hash = '';
	
	  var hashIndex = pathname.indexOf('#');
	  if (hashIndex !== -1) {
	    hash = pathname.substr(hashIndex);
	    pathname = pathname.substr(0, hashIndex);
	  }
	
	  var searchIndex = pathname.indexOf('?');
	  if (searchIndex !== -1) {
	    search = pathname.substr(searchIndex);
	    pathname = pathname.substr(0, searchIndex);
	  }
	
	  return {
	    pathname: pathname,
	    search: search === '?' ? '' : search,
	    hash: hash === '#' ? '' : hash
	  };
	};
	
	var createPath = exports.createPath = function createPath(location) {
	  var pathname = location.pathname,
	      search = location.search,
	      hash = location.hash;
	
	  var path = pathname || '/';
	
	  if (search && search !== '?') path += search.charAt(0) === '?' ? search : '?' + search;
	
	  if (hash && hash !== '#') path += hash.charAt(0) === '#' ? hash : '#' + hash;
	
	  return path;
	};

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	
	var _warning = __webpack_require__(13);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { default: obj };
	}
	
	var createTransitionManager = function createTransitionManager() {
	  var prompt = null;
	
	  var setPrompt = function setPrompt(nextPrompt) {
	    process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(prompt == null, 'A history supports only one prompt at a time') : void 0;
	
	    prompt = nextPrompt;
	
	    return function () {
	      if (prompt === nextPrompt) prompt = null;
	    };
	  };
	
	  var confirmTransitionTo = function confirmTransitionTo(location, action, getUserConfirmation, callback) {
	    // TODO: If another transition starts while we're still confirming
	    // the previous one, we may end up in a weird state. Figure out the
	    // best way to handle this.
	    if (prompt != null) {
	      var result = typeof prompt === 'function' ? prompt(location, action) : prompt;
	
	      if (typeof result === 'string') {
	        if (typeof getUserConfirmation === 'function') {
	          getUserConfirmation(result, callback);
	        } else {
	          process.env.NODE_ENV !== 'production' ? (0, _warning2.default)(false, 'A history needs a getUserConfirmation function in order to use a prompt message') : void 0;
	
	          callback(true);
	        }
	      } else {
	        // Return false from a transition hook to cancel the transition.
	        callback(result !== false);
	      }
	    } else {
	      callback(true);
	    }
	  };
	
	  var listeners = [];
	
	  var appendListener = function appendListener(fn) {
	    var isActive = true;
	
	    var listener = function listener() {
	      if (isActive) fn.apply(undefined, arguments);
	    };
	
	    listeners.push(listener);
	
	    return function () {
	      isActive = false;
	      listeners = listeners.filter(function (item) {
	        return item !== listener;
	      });
	    };
	  };
	
	  var notifyListeners = function notifyListeners() {
	    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
	      args[_key] = arguments[_key];
	    }
	
	    listeners.forEach(function (listener) {
	      return listener.apply(undefined, args);
	    });
	  };
	
	  return {
	    setPrompt: setPrompt,
	    confirmTransitionTo: confirmTransitionTo,
	    appendListener: appendListener,
	    notifyListeners: notifyListeners
	  };
	};
	
	exports.default = createTransitionManager;
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 20 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	var canUseDOM = exports.canUseDOM = !!(typeof window !== 'undefined' && window.document && window.document.createElement);

/***/ },
/* 21 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	var addEventListener = exports.addEventListener = function addEventListener(node, event, listener) {
	  return node.addEventListener ? node.addEventListener(event, listener, false) : node.attachEvent('on' + event, listener);
	};
	
	var removeEventListener = exports.removeEventListener = function removeEventListener(node, event, listener) {
	  return node.removeEventListener ? node.removeEventListener(event, listener, false) : node.detachEvent('on' + event, listener);
	};
	
	var getConfirmation = exports.getConfirmation = function getConfirmation(message, callback) {
	  return callback(window.confirm(message));
	}; // eslint-disable-line no-alert
	
	/**
	 * Returns true if the HTML5 history API is supported. Taken from Modernizr.
	 *
	 * https://github.com/Modernizr/Modernizr/blob/master/LICENSE
	 * https://github.com/Modernizr/Modernizr/blob/master/feature-detects/history.js
	 * changed to avoid false negatives for Windows Phones: https://github.com/reactjs/react-router/issues/586
	 */
	var supportsHistory = exports.supportsHistory = function supportsHistory() {
	  var ua = window.navigator.userAgent;
	
	  if ((ua.indexOf('Android 2.') !== -1 || ua.indexOf('Android 4.0') !== -1) && ua.indexOf('Mobile Safari') !== -1 && ua.indexOf('Chrome') === -1 && ua.indexOf('Windows Phone') === -1) return false;
	
	  return window.history && 'pushState' in window.history;
	};
	
	/**
	 * Returns true if browser fires popstate on hash change.
	 * IE10 and IE11 do not.
	 */
	var supportsPopStateOnHashChange = exports.supportsPopStateOnHashChange = function supportsPopStateOnHashChange() {
	  return window.navigator.userAgent.indexOf('Trident') === -1;
	};
	
	/**
	 * Returns false if using go(n) with hash history causes a full page reload.
	 */
	var supportsGoWithoutReloadUsingHash = exports.supportsGoWithoutReloadUsingHash = function supportsGoWithoutReloadUsingHash() {
	  return window.navigator.userAgent.indexOf('Firefox') === -1;
	};
	
	/**
	 * Returns true if a given popstate event is an extraneous WebKit event.
	 * Accounts for the fact that Chrome on iOS fires real popstate events
	 * containing undefined state when pressing the back button.
	 */
	var isExtraneousPopstateEvent = exports.isExtraneousPopstateEvent = function isExtraneousPopstateEvent(event) {
	  return event.state === undefined && navigator.userAgent.indexOf('CriOS') === -1;
	};

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/*!
	 * inferno-redux v1.3.0-rc.5
	 * (c) 2017 Dominic Gannaway'
	 * Released under the MIT License.
	 */
	
	(function (global, factory) {
	    ( false ? 'undefined' : _typeof(exports)) === 'object' && typeof module !== 'undefined' ? factory(exports, __webpack_require__(8), __webpack_require__(23), __webpack_require__(44), __webpack_require__(9)) :  true ? !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__(8), __webpack_require__(23), __webpack_require__(44), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__)) : factory(global['inferno-redux'] = global['inferno-redux'] || {}, global.Inferno.Component, global.redux, global.hoistStatics, global.Inferno.createElement);
	})(undefined, function (exports, Component, redux, hoistStatics, createElement) {
	    'use strict';
	
	    Component = 'default' in Component ? Component['default'] : Component;
	    hoistStatics = 'default' in hoistStatics ? hoistStatics['default'] : hoistStatics;
	    createElement = 'default' in createElement ? createElement['default'] : createElement;
	
	    var ERROR_MSG = 'a runtime error occured! Use Inferno in development environment to find the error.';
	
	    function toArray(children) {
	        return isArray(children) ? children : children ? [children] : children;
	    }
	    // this is MUCH faster than .constructor === Array and instanceof Array
	    // in Node 7 and the later versions of V8, slower in older versions though
	    var isArray = Array.isArray;
	
	    function isNullOrUndef(obj) {
	        return isUndefined(obj) || isNull(obj);
	    }
	
	    function isFunction(obj) {
	        return typeof obj === 'function';
	    }
	
	    function isNull(obj) {
	        return obj === null;
	    }
	
	    function isUndefined(obj) {
	        return obj === undefined;
	    }
	
	    function throwError(message) {
	        if (!message) {
	            message = ERROR_MSG;
	        }
	        throw new Error("Inferno Error: " + message);
	    }
	
	    /**
	     * Prints a warning in the console if it exists.
	     *
	     * @param {String} message The warning message.
	     * @returns {void}
	     */
	    function warning$1(message) {
	        /* eslint-disable no-console */
	        if (typeof console !== 'undefined' && typeof console.error === 'function') {
	            console.error(message);
	        }
	        /* eslint-enable no-console */
	        try {
	            // This error was thrown as a convenience so that if you enable
	            // "break on all exceptions" in your console,
	            // it would pause the execution at this line.
	            throw new Error(message);
	            /* eslint-disable no-empty */
	        } catch (e) {}
	        /* eslint-enable no-empty */
	    }
	    function shallowEqual(objA, objB) {
	        if (objA === objB) {
	            return true;
	        }
	        var keysA = Object.keys(objA);
	        var keysB = Object.keys(objB);
	        if (keysA.length !== keysB.length) {
	            return false;
	        }
	        // Test for A's keys different from B.
	        var hasOwn = Object.prototype.hasOwnProperty;
	        for (var i = 0, len = keysA.length; i < len; i++) {
	            var key = keysA[i];
	            if (!hasOwn.call(objB, key) || objA[key] !== objB[key]) {
	                return false;
	            }
	        }
	        return true;
	    }
	    function wrapActionCreators(actionCreators) {
	        return function (dispatch) {
	            return redux.bindActionCreators(actionCreators, dispatch);
	        };
	    }
	
	    var didWarnAboutReceivingStore = false;
	    function warnAboutReceivingStore() {
	        if (didWarnAboutReceivingStore) {
	            return;
	        }
	        didWarnAboutReceivingStore = true;
	        warning$1('<Provider> does not support changing `store` on the fly.');
	    }
	    var Provider = function (Component$$1) {
	        function Provider(props, context) {
	            Component$$1.call(this, props, context);
	            this.store = props.store;
	        }
	
	        if (Component$$1) Provider.__proto__ = Component$$1;
	        Provider.prototype = Object.create(Component$$1 && Component$$1.prototype);
	        Provider.prototype.constructor = Provider;
	        Provider.prototype.getChildContext = function getChildContext() {
	            return { store: this.store };
	        };
	        Provider.prototype.render = function render() {
	            if (isNullOrUndef(this.props.children) || toArray(this.props.children).length !== 1) {
	                throw Error('Inferno Error: Only one child is allowed within the `Provider` component');
	            }
	            return this.props.children;
	        };
	
	        return Provider;
	    }(Component);
	
	    if (process.env.NODE_ENV !== 'production') {
	        Provider.prototype.componentWillReceiveProps = function (nextProps) {
	            var ref = this;
	            var store = ref.store;
	            var nextStore = nextProps.store;
	            if (store !== nextStore) {
	                warnAboutReceivingStore();
	            }
	        };
	    }
	
	    // From https://github.com/lodash/lodash/blob/es
	    function overArg(func, transform) {
	        return function (arg) {
	            return func(transform(arg));
	        };
	    }
	    var getPrototype = overArg(Object.getPrototypeOf, Object);
	    function isObjectLike(value) {
	        return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object';
	    }
	    var objectTag = '[object Object]';
	    var funcProto = Function.prototype;
	    var objectProto = Object.prototype;
	    var funcToString = funcProto.toString;
	    var hasOwnProperty = objectProto.hasOwnProperty;
	    var objectCtorString = funcToString.call(Object);
	    var objectToString = objectProto.toString;
	    function isPlainObject(value) {
	        if (!isObjectLike(value) || objectToString.call(value) !== objectTag) {
	            return false;
	        }
	        var proto = getPrototype(value);
	        if (proto === null) {
	            return true;
	        }
	        var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	        return typeof Ctor === 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) === objectCtorString;
	    }
	
	    var errorObject = { value: null };
	    var defaultMapStateToProps = function defaultMapStateToProps(state) {
	        return {};
	    }; // eslint-disable-line no-unused-vars
	    var defaultMapDispatchToProps = function defaultMapDispatchToProps(dispatch) {
	        return { dispatch: dispatch };
	    };
	    var defaultMergeProps = function defaultMergeProps(stateProps, dispatchProps, parentProps) {
	        return Object.assign({}, parentProps, stateProps, dispatchProps);
	    };
	    function tryCatch(fn, ctx) {
	        try {
	            return fn.apply(ctx);
	        } catch (e) {
	            errorObject.value = e;
	            return errorObject;
	        }
	    }
	    function getDisplayName(WrappedComponent) {
	        return WrappedComponent.displayName || WrappedComponent.name || 'Component';
	    }
	    // Helps track hot reloading.
	    var nextVersion = 0;
	    function connect(mapStateToProps, mapDispatchToProps, mergeProps, options) {
	        if (options === void 0) options = {};
	
	        var shouldSubscribe = Boolean(mapStateToProps);
	        var mapState = mapStateToProps || defaultMapStateToProps;
	        var mapDispatch;
	        if (isFunction(mapDispatchToProps)) {
	            mapDispatch = mapDispatchToProps;
	        } else if (!mapDispatchToProps) {
	            mapDispatch = defaultMapDispatchToProps;
	        } else {
	            mapDispatch = wrapActionCreators(mapDispatchToProps);
	        }
	        var finalMergeProps = mergeProps || defaultMergeProps;
	        var pure = options.pure;if (pure === void 0) pure = true;
	        var withRef = options.withRef;if (withRef === void 0) withRef = false;
	        var checkMergedEquals = pure && finalMergeProps !== defaultMergeProps;
	        // Helps track hot reloading.
	        var version = nextVersion++;
	        return function wrapWithConnect(WrappedComponent) {
	            var connectDisplayName = "Connect(" + getDisplayName(WrappedComponent) + ")";
	            function checkStateShape(props, methodName) {
	                if (!isPlainObject(props)) {
	                    warning$1(methodName + "() in " + connectDisplayName + " must return a plain object. " + "Instead received " + props + ".");
	                }
	            }
	            function computeMergedProps(stateProps, dispatchProps, parentProps) {
	                var mergedProps = finalMergeProps(stateProps, dispatchProps, parentProps);
	                if (process.env.NODE_ENV !== 'production') {
	                    checkStateShape(mergedProps, 'mergeProps');
	                }
	                return mergedProps;
	            }
	            var Connect = function (Component$$1) {
	                function Connect(props, context) {
	                    var this$1 = this;
	
	                    Component$$1.call(this, props, context);
	                    this.version = version;
	                    this.wrappedInstance = null;
	                    this.store = props && props.store || context && context.store;
	                    this.componentDidMount = function () {
	                        this$1.trySubscribe();
	                    };
	                    if (!this.store) {
	                        throwError('Could not find "store" in either the context or ' + "props of \"" + connectDisplayName + "\". " + 'Either wrap the root component in a <Provider>, ' + "or explicitly pass \"store\" as a prop to \"" + connectDisplayName + "\".");
	                    }
	                    var storeState = this.store.getState();
	                    this.state = { storeState: storeState };
	                    this.clearCache();
	                }
	
	                if (Component$$1) Connect.__proto__ = Component$$1;
	                Connect.prototype = Object.create(Component$$1 && Component$$1.prototype);
	                Connect.prototype.constructor = Connect;
	                Connect.prototype.shouldComponentUpdate = function shouldComponentUpdate() {
	                    return !pure || this.haveOwnPropsChanged || this.hasStoreStateChanged;
	                };
	                Connect.prototype.computeStateProps = function computeStateProps(store, props) {
	                    if (!this.finalMapStateToProps) {
	                        return this.configureFinalMapState(store, props);
	                    }
	                    var state = store.getState();
	                    var stateProps = this.doStatePropsDependOnOwnProps ? this.finalMapStateToProps(state, props) : this.finalMapStateToProps(state);
	                    return stateProps;
	                };
	                Connect.prototype.configureFinalMapState = function configureFinalMapState(store, props) {
	                    var mappedState = mapState(store.getState(), props);
	                    var isFactory = isFunction(mappedState);
	                    this.finalMapStateToProps = isFactory ? mappedState : mapState;
	                    this.doStatePropsDependOnOwnProps = this.finalMapStateToProps.length !== 1;
	                    if (isFactory) {
	                        return this.computeStateProps(store, props);
	                    }
	                    return mappedState;
	                };
	                Connect.prototype.computeDispatchProps = function computeDispatchProps(store, props) {
	                    if (!this.finalMapDispatchToProps) {
	                        return this.configureFinalMapDispatch(store, props);
	                    }
	                    var dispatch = store.dispatch;
	                    var dispatchProps = this.doDispatchPropsDependOnOwnProps ? this.finalMapDispatchToProps(dispatch, props) : this.finalMapDispatchToProps(dispatch);
	                    return dispatchProps;
	                };
	                Connect.prototype.configureFinalMapDispatch = function configureFinalMapDispatch(store, props) {
	                    var mappedDispatch = mapDispatch(store.dispatch, props);
	                    var isFactory = isFunction(mappedDispatch);
	                    this.finalMapDispatchToProps = isFactory ? mappedDispatch : mapDispatch;
	                    this.doDispatchPropsDependOnOwnProps = this.finalMapDispatchToProps.length !== 1;
	                    if (isFactory) {
	                        return this.computeDispatchProps(store, props);
	                    }
	                    return mappedDispatch;
	                };
	                Connect.prototype.updateStatePropsIfNeeded = function updateStatePropsIfNeeded() {
	                    var nextStateProps = this.computeStateProps(this.store, this.props);
	                    if (this.stateProps && shallowEqual(nextStateProps, this.stateProps)) {
	                        return false;
	                    }
	                    this.stateProps = nextStateProps;
	                    return true;
	                };
	                Connect.prototype.updateDispatchPropsIfNeeded = function updateDispatchPropsIfNeeded() {
	                    var nextDispatchProps = this.computeDispatchProps(this.store, this.props);
	                    if (this.dispatchProps && shallowEqual(nextDispatchProps, this.dispatchProps)) {
	                        return false;
	                    }
	                    this.dispatchProps = nextDispatchProps;
	                    return true;
	                };
	                Connect.prototype.updateMergedPropsIfNeeded = function updateMergedPropsIfNeeded() {
	                    var nextMergedProps = computeMergedProps(this.stateProps, this.dispatchProps, this.props);
	                    if (this.mergedProps && checkMergedEquals && shallowEqual(nextMergedProps, this.mergedProps)) {
	                        return false;
	                    }
	                    this.mergedProps = nextMergedProps;
	                    return true;
	                };
	                Connect.prototype.isSubscribed = function isSubscribed() {
	                    return isFunction(this.unsubscribe);
	                };
	                Connect.prototype.trySubscribe = function trySubscribe() {
	                    if (shouldSubscribe && !this.unsubscribe) {
	                        this.unsubscribe = this.store.subscribe(this.handleChange.bind(this));
	                        this.handleChange();
	                    }
	                };
	                Connect.prototype.tryUnsubscribe = function tryUnsubscribe() {
	                    if (this.unsubscribe) {
	                        this.unsubscribe();
	                        this.unsubscribe = null;
	                    }
	                };
	                Connect.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
	                    if (!pure || !shallowEqual(nextProps, this.props)) {
	                        this.haveOwnPropsChanged = true;
	                    }
	                };
	                Connect.prototype.componentWillUnmount = function componentWillUnmount() {
	                    this.tryUnsubscribe();
	                    this.clearCache();
	                };
	                Connect.prototype.clearCache = function clearCache() {
	                    this.dispatchProps = null;
	                    this.stateProps = null;
	                    this.mergedProps = null;
	                    this.haveOwnPropsChanged = true;
	                    this.hasStoreStateChanged = true;
	                    this.haveStatePropsBeenPrecalculated = false;
	                    this.statePropsPrecalculationError = null;
	                    this.renderedElement = null;
	                    this.finalMapDispatchToProps = null;
	                    this.finalMapStateToProps = null;
	                };
	                Connect.prototype.handleChange = function handleChange() {
	                    if (!this.unsubscribe) {
	                        return;
	                    }
	                    var storeState = this.store.getState();
	                    var prevStoreState = this.state.storeState;
	                    if (pure && prevStoreState === storeState) {
	                        return;
	                    }
	                    if (pure && !this.doStatePropsDependOnOwnProps) {
	                        var haveStatePropsChanged = tryCatch(this.updateStatePropsIfNeeded, this);
	                        if (!haveStatePropsChanged) {
	                            return;
	                        }
	                        if (haveStatePropsChanged === errorObject) {
	                            this.statePropsPrecalculationError = errorObject.value;
	                        }
	                        this.haveStatePropsBeenPrecalculated = true;
	                    }
	                    this.hasStoreStateChanged = true;
	                    this.setState({ storeState: storeState });
	                };
	                Connect.prototype.getWrappedInstance = function getWrappedInstance() {
	                    return this.wrappedInstance;
	                };
	                Connect.prototype.render = function render() {
	                    var this$1 = this;
	
	                    var ref = this;
	                    var haveOwnPropsChanged = ref.haveOwnPropsChanged;
	                    var hasStoreStateChanged = ref.hasStoreStateChanged;
	                    var haveStatePropsBeenPrecalculated = ref.haveStatePropsBeenPrecalculated;
	                    var statePropsPrecalculationError = ref.statePropsPrecalculationError;
	                    var renderedElement = ref.renderedElement;
	                    this.haveOwnPropsChanged = false;
	                    this.hasStoreStateChanged = false;
	                    this.haveStatePropsBeenPrecalculated = false;
	                    this.statePropsPrecalculationError = null;
	                    if (statePropsPrecalculationError) {
	                        throw statePropsPrecalculationError;
	                    }
	                    var shouldUpdateStateProps = true;
	                    var shouldUpdateDispatchProps = true;
	                    if (pure && renderedElement) {
	                        shouldUpdateStateProps = hasStoreStateChanged || haveOwnPropsChanged && this.doStatePropsDependOnOwnProps;
	                        shouldUpdateDispatchProps = haveOwnPropsChanged && this.doDispatchPropsDependOnOwnProps;
	                    }
	                    var haveStatePropsChanged = false;
	                    var haveDispatchPropsChanged = false;
	                    if (haveStatePropsBeenPrecalculated) {
	                        haveStatePropsChanged = true;
	                    } else if (shouldUpdateStateProps) {
	                        haveStatePropsChanged = this.updateStatePropsIfNeeded();
	                    }
	                    if (shouldUpdateDispatchProps) {
	                        haveDispatchPropsChanged = this.updateDispatchPropsIfNeeded();
	                    }
	                    var haveMergedPropsChanged = true;
	                    if (haveStatePropsChanged || haveDispatchPropsChanged || haveOwnPropsChanged) {
	                        haveMergedPropsChanged = this.updateMergedPropsIfNeeded();
	                    } else {
	                        haveMergedPropsChanged = false;
	                    }
	                    if (!haveMergedPropsChanged && renderedElement) {
	                        return renderedElement;
	                    }
	                    if (withRef) {
	                        this.renderedElement = createElement(WrappedComponent, Object.assign({}, this.mergedProps, { ref: function ref(instance) {
	                                return this$1.wrappedInstance = instance;
	                            } }));
	                    } else {
	                        this.renderedElement = createElement(WrappedComponent, this.mergedProps);
	                    }
	                    return this.renderedElement;
	                };
	
	                return Connect;
	            }(Component);
	            Connect.displayName = connectDisplayName;
	            Connect.WrappedComponent = WrappedComponent;
	            if (process.env.NODE_ENV !== 'production') {
	                Connect.prototype.componentWillUpdate = function componentWillUpdate() {
	                    if (this.version === version) {
	                        return;
	                    }
	                    // We are hot reloading!
	                    this.version = version;
	                    this.trySubscribe();
	                    this.clearCache();
	                };
	            }
	            return hoistStatics(Connect, WrappedComponent);
	        };
	    }
	
	    var index = {
	        Provider: Provider,
	        connect: connect
	    };
	
	    exports['default'] = index;
	    exports.Provider = Provider;
	    exports.connect = connect;
	
	    Object.defineProperty(exports, '__esModule', { value: true });
	});
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports.compose = exports.applyMiddleware = exports.bindActionCreators = exports.combineReducers = exports.createStore = undefined;
	
	var _createStore = __webpack_require__(24);
	
	var _createStore2 = _interopRequireDefault(_createStore);
	
	var _combineReducers = __webpack_require__(39);
	
	var _combineReducers2 = _interopRequireDefault(_combineReducers);
	
	var _bindActionCreators = __webpack_require__(41);
	
	var _bindActionCreators2 = _interopRequireDefault(_bindActionCreators);
	
	var _applyMiddleware = __webpack_require__(42);
	
	var _applyMiddleware2 = _interopRequireDefault(_applyMiddleware);
	
	var _compose = __webpack_require__(43);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	var _warning = __webpack_require__(40);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { 'default': obj };
	}
	
	/*
	* This is a dummy function to check if the function name has been altered by minification.
	* If the function has been minified and NODE_ENV !== 'production', warn the user.
	*/
	function isCrushed() {}
	
	if (process.env.NODE_ENV !== 'production' && typeof isCrushed.name === 'string' && isCrushed.name !== 'isCrushed') {
	  (0, _warning2['default'])('You are currently using minified code outside of NODE_ENV === \'production\'. ' + 'This means that you are running a slower development build of Redux. ' + 'You can use loose-envify (https://github.com/zertosh/loose-envify) for browserify ' + 'or DefinePlugin for webpack (http://stackoverflow.com/questions/30030031) ' + 'to ensure you have the correct code for your production build.');
	}
	
	exports.createStore = _createStore2['default'];
	exports.combineReducers = _combineReducers2['default'];
	exports.bindActionCreators = _bindActionCreators2['default'];
	exports.applyMiddleware = _applyMiddleware2['default'];
	exports.compose = _compose2['default'];
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.__esModule = true;
	exports.ActionTypes = undefined;
	exports['default'] = createStore;
	
	var _isPlainObject = __webpack_require__(25);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _symbolObservable = __webpack_require__(35);
	
	var _symbolObservable2 = _interopRequireDefault(_symbolObservable);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { 'default': obj };
	}
	
	/**
	 * These are private action types reserved by Redux.
	 * For any unknown actions, you must return the current state.
	 * If the current state is undefined, you must return the initial state.
	 * Do not reference these action types directly in your code.
	 */
	var ActionTypes = exports.ActionTypes = {
	  INIT: '@@redux/INIT'
	};
	
	/**
	 * Creates a Redux store that holds the state tree.
	 * The only way to change the data in the store is to call `dispatch()` on it.
	 *
	 * There should only be a single store in your app. To specify how different
	 * parts of the state tree respond to actions, you may combine several reducers
	 * into a single reducer function by using `combineReducers`.
	 *
	 * @param {Function} reducer A function that returns the next state tree, given
	 * the current state tree and the action to handle.
	 *
	 * @param {any} [preloadedState] The initial state. You may optionally specify it
	 * to hydrate the state from the server in universal apps, or to restore a
	 * previously serialized user session.
	 * If you use `combineReducers` to produce the root reducer function, this must be
	 * an object with the same shape as `combineReducers` keys.
	 *
	 * @param {Function} enhancer The store enhancer. You may optionally specify it
	 * to enhance the store with third-party capabilities such as middleware,
	 * time travel, persistence, etc. The only store enhancer that ships with Redux
	 * is `applyMiddleware()`.
	 *
	 * @returns {Store} A Redux store that lets you read the state, dispatch actions
	 * and subscribe to changes.
	 */
	function createStore(reducer, preloadedState, enhancer) {
	  var _ref2;
	
	  if (typeof preloadedState === 'function' && typeof enhancer === 'undefined') {
	    enhancer = preloadedState;
	    preloadedState = undefined;
	  }
	
	  if (typeof enhancer !== 'undefined') {
	    if (typeof enhancer !== 'function') {
	      throw new Error('Expected the enhancer to be a function.');
	    }
	
	    return enhancer(createStore)(reducer, preloadedState);
	  }
	
	  if (typeof reducer !== 'function') {
	    throw new Error('Expected the reducer to be a function.');
	  }
	
	  var currentReducer = reducer;
	  var currentState = preloadedState;
	  var currentListeners = [];
	  var nextListeners = currentListeners;
	  var isDispatching = false;
	
	  function ensureCanMutateNextListeners() {
	    if (nextListeners === currentListeners) {
	      nextListeners = currentListeners.slice();
	    }
	  }
	
	  /**
	   * Reads the state tree managed by the store.
	   *
	   * @returns {any} The current state tree of your application.
	   */
	  function getState() {
	    return currentState;
	  }
	
	  /**
	   * Adds a change listener. It will be called any time an action is dispatched,
	   * and some part of the state tree may potentially have changed. You may then
	   * call `getState()` to read the current state tree inside the callback.
	   *
	   * You may call `dispatch()` from a change listener, with the following
	   * caveats:
	   *
	   * 1. The subscriptions are snapshotted just before every `dispatch()` call.
	   * If you subscribe or unsubscribe while the listeners are being invoked, this
	   * will not have any effect on the `dispatch()` that is currently in progress.
	   * However, the next `dispatch()` call, whether nested or not, will use a more
	   * recent snapshot of the subscription list.
	   *
	   * 2. The listener should not expect to see all state changes, as the state
	   * might have been updated multiple times during a nested `dispatch()` before
	   * the listener is called. It is, however, guaranteed that all subscribers
	   * registered before the `dispatch()` started will be called with the latest
	   * state by the time it exits.
	   *
	   * @param {Function} listener A callback to be invoked on every dispatch.
	   * @returns {Function} A function to remove this change listener.
	   */
	  function subscribe(listener) {
	    if (typeof listener !== 'function') {
	      throw new Error('Expected listener to be a function.');
	    }
	
	    var isSubscribed = true;
	
	    ensureCanMutateNextListeners();
	    nextListeners.push(listener);
	
	    return function unsubscribe() {
	      if (!isSubscribed) {
	        return;
	      }
	
	      isSubscribed = false;
	
	      ensureCanMutateNextListeners();
	      var index = nextListeners.indexOf(listener);
	      nextListeners.splice(index, 1);
	    };
	  }
	
	  /**
	   * Dispatches an action. It is the only way to trigger a state change.
	   *
	   * The `reducer` function, used to create the store, will be called with the
	   * current state tree and the given `action`. Its return value will
	   * be considered the **next** state of the tree, and the change listeners
	   * will be notified.
	   *
	   * The base implementation only supports plain object actions. If you want to
	   * dispatch a Promise, an Observable, a thunk, or something else, you need to
	   * wrap your store creating function into the corresponding middleware. For
	   * example, see the documentation for the `redux-thunk` package. Even the
	   * middleware will eventually dispatch plain object actions using this method.
	   *
	   * @param {Object} action A plain object representing “what changed”. It is
	   * a good idea to keep actions serializable so you can record and replay user
	   * sessions, or use the time travelling `redux-devtools`. An action must have
	   * a `type` property which may not be `undefined`. It is a good idea to use
	   * string constants for action types.
	   *
	   * @returns {Object} For convenience, the same action object you dispatched.
	   *
	   * Note that, if you use a custom middleware, it may wrap `dispatch()` to
	   * return something else (for example, a Promise you can await).
	   */
	  function dispatch(action) {
	    if (!(0, _isPlainObject2['default'])(action)) {
	      throw new Error('Actions must be plain objects. ' + 'Use custom middleware for async actions.');
	    }
	
	    if (typeof action.type === 'undefined') {
	      throw new Error('Actions may not have an undefined "type" property. ' + 'Have you misspelled a constant?');
	    }
	
	    if (isDispatching) {
	      throw new Error('Reducers may not dispatch actions.');
	    }
	
	    try {
	      isDispatching = true;
	      currentState = currentReducer(currentState, action);
	    } finally {
	      isDispatching = false;
	    }
	
	    var listeners = currentListeners = nextListeners;
	    for (var i = 0; i < listeners.length; i++) {
	      listeners[i]();
	    }
	
	    return action;
	  }
	
	  /**
	   * Replaces the reducer currently used by the store to calculate the state.
	   *
	   * You might need this if your app implements code splitting and you want to
	   * load some of the reducers dynamically. You might also need this if you
	   * implement a hot reloading mechanism for Redux.
	   *
	   * @param {Function} nextReducer The reducer for the store to use instead.
	   * @returns {void}
	   */
	  function replaceReducer(nextReducer) {
	    if (typeof nextReducer !== 'function') {
	      throw new Error('Expected the nextReducer to be a function.');
	    }
	
	    currentReducer = nextReducer;
	    dispatch({ type: ActionTypes.INIT });
	  }
	
	  /**
	   * Interoperability point for observable/reactive libraries.
	   * @returns {observable} A minimal observable of state changes.
	   * For more information, see the observable proposal:
	   * https://github.com/zenparsing/es-observable
	   */
	  function observable() {
	    var _ref;
	
	    var outerSubscribe = subscribe;
	    return _ref = {
	      /**
	       * The minimal observable subscription method.
	       * @param {Object} observer Any object that can be used as an observer.
	       * The observer object should have a `next` method.
	       * @returns {subscription} An object with an `unsubscribe` method that can
	       * be used to unsubscribe the observable from the store, and prevent further
	       * emission of values from the observable.
	       */
	      subscribe: function subscribe(observer) {
	        if ((typeof observer === 'undefined' ? 'undefined' : _typeof(observer)) !== 'object') {
	          throw new TypeError('Expected the observer to be an object.');
	        }
	
	        function observeState() {
	          if (observer.next) {
	            observer.next(getState());
	          }
	        }
	
	        observeState();
	        var unsubscribe = outerSubscribe(observeState);
	        return { unsubscribe: unsubscribe };
	      }
	    }, _ref[_symbolObservable2['default']] = function () {
	      return this;
	    }, _ref;
	  }
	
	  // When a store is created, an "INIT" action is dispatched so that every
	  // reducer returns their initial state. This effectively populates
	  // the initial state tree.
	  dispatch({ type: ActionTypes.INIT });
	
	  return _ref2 = {
	    dispatch: dispatch,
	    subscribe: subscribe,
	    getState: getState,
	    replaceReducer: replaceReducer
	  }, _ref2[_symbolObservable2['default']] = observable, _ref2;
	}

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var baseGetTag = __webpack_require__(26),
	    getPrototype = __webpack_require__(32),
	    isObjectLike = __webpack_require__(34);
	
	/** `Object#toString` result references. */
	var objectTag = '[object Object]';
	
	/** Used for built-in method references. */
	var funcProto = Function.prototype,
	    objectProto = Object.prototype;
	
	/** Used to resolve the decompiled source of functions. */
	var funcToString = funcProto.toString;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/** Used to infer the `Object` constructor. */
	var objectCtorString = funcToString.call(Object);
	
	/**
	 * Checks if `value` is a plain object, that is, an object created by the
	 * `Object` constructor or one with a `[[Prototype]]` of `null`.
	 *
	 * @static
	 * @memberOf _
	 * @since 0.8.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
	 * @example
	 *
	 * function Foo() {
	 *   this.a = 1;
	 * }
	 *
	 * _.isPlainObject(new Foo);
	 * // => false
	 *
	 * _.isPlainObject([1, 2, 3]);
	 * // => false
	 *
	 * _.isPlainObject({ 'x': 0, 'y': 0 });
	 * // => true
	 *
	 * _.isPlainObject(Object.create(null));
	 * // => true
	 */
	function isPlainObject(value) {
	  if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
	    return false;
	  }
	  var proto = getPrototype(value);
	  if (proto === null) {
	    return true;
	  }
	  var Ctor = hasOwnProperty.call(proto, 'constructor') && proto.constructor;
	  return typeof Ctor == 'function' && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
	}
	
	module.exports = isPlainObject;

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(27),
	    getRawTag = __webpack_require__(30),
	    objectToString = __webpack_require__(31);
	
	/** `Object#toString` result references. */
	var nullTag = '[object Null]',
	    undefinedTag = '[object Undefined]';
	
	/** Built-in value references. */
	var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
	
	/**
	 * The base implementation of `getTag` without fallbacks for buggy environments.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the `toStringTag`.
	 */
	function baseGetTag(value) {
	    if (value == null) {
	        return value === undefined ? undefinedTag : nullTag;
	    }
	    return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
	}
	
	module.exports = baseGetTag;

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var root = __webpack_require__(28);
	
	/** Built-in value references. */
	var _Symbol = root.Symbol;
	
	module.exports = _Symbol;

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	var freeGlobal = __webpack_require__(29);
	
	/** Detect free variable `self`. */
	var freeSelf = (typeof self === 'undefined' ? 'undefined' : _typeof(self)) == 'object' && self && self.Object === Object && self;
	
	/** Used as a reference to the global object. */
	var root = freeGlobal || freeSelf || Function('return this')();
	
	module.exports = root;

/***/ },
/* 29 */
/***/ function(module, exports) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/** Detect free variable `global` from Node.js. */
	var freeGlobal = (typeof global === 'undefined' ? 'undefined' : _typeof(global)) == 'object' && global && global.Object === Object && global;
	
	module.exports = freeGlobal;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var _Symbol = __webpack_require__(27);
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/** Used to check objects for own properties. */
	var hasOwnProperty = objectProto.hasOwnProperty;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;
	
	/** Built-in value references. */
	var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;
	
	/**
	 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
	 *
	 * @private
	 * @param {*} value The value to query.
	 * @returns {string} Returns the raw `toStringTag`.
	 */
	function getRawTag(value) {
	  var isOwn = hasOwnProperty.call(value, symToStringTag),
	      tag = value[symToStringTag];
	
	  try {
	    value[symToStringTag] = undefined;
	    var unmasked = true;
	  } catch (e) {}
	
	  var result = nativeObjectToString.call(value);
	  if (unmasked) {
	    if (isOwn) {
	      value[symToStringTag] = tag;
	    } else {
	      delete value[symToStringTag];
	    }
	  }
	  return result;
	}
	
	module.exports = getRawTag;

/***/ },
/* 31 */
/***/ function(module, exports) {

	"use strict";
	
	/** Used for built-in method references. */
	var objectProto = Object.prototype;
	
	/**
	 * Used to resolve the
	 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
	 * of values.
	 */
	var nativeObjectToString = objectProto.toString;
	
	/**
	 * Converts `value` to a string using `Object.prototype.toString`.
	 *
	 * @private
	 * @param {*} value The value to convert.
	 * @returns {string} Returns the converted string.
	 */
	function objectToString(value) {
	  return nativeObjectToString.call(value);
	}
	
	module.exports = objectToString;

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var overArg = __webpack_require__(33);
	
	/** Built-in value references. */
	var getPrototype = overArg(Object.getPrototypeOf, Object);
	
	module.exports = getPrototype;

/***/ },
/* 33 */
/***/ function(module, exports) {

	"use strict";
	
	/**
	 * Creates a unary function that invokes `func` with its argument transformed.
	 *
	 * @private
	 * @param {Function} func The function to wrap.
	 * @param {Function} transform The argument transform.
	 * @returns {Function} Returns the new function.
	 */
	function overArg(func, transform) {
	  return function (arg) {
	    return func(transform(arg));
	  };
	}
	
	module.exports = overArg;

/***/ },
/* 34 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	/**
	 * Checks if `value` is object-like. A value is object-like if it's not `null`
	 * and has a `typeof` result of "object".
	 *
	 * @static
	 * @memberOf _
	 * @since 4.0.0
	 * @category Lang
	 * @param {*} value The value to check.
	 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
	 * @example
	 *
	 * _.isObjectLike({});
	 * // => true
	 *
	 * _.isObjectLike([1, 2, 3]);
	 * // => true
	 *
	 * _.isObjectLike(_.noop);
	 * // => false
	 *
	 * _.isObjectLike(null);
	 * // => false
	 */
	function isObjectLike(value) {
	  return value != null && (typeof value === 'undefined' ? 'undefined' : _typeof(value)) == 'object';
	}
	
	module.exports = isObjectLike;

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	module.exports = __webpack_require__(36);

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global, module) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _ponyfill = __webpack_require__(38);
	
	var _ponyfill2 = _interopRequireDefault(_ponyfill);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { 'default': obj };
	}
	
	var root; /* global window */
	
	if (typeof self !== 'undefined') {
	  root = self;
	} else if (typeof window !== 'undefined') {
	  root = window;
	} else if (typeof global !== 'undefined') {
	  root = global;
	} else if (true) {
	  root = module;
	} else {
	  root = Function('return this')();
	}
	
	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }()), __webpack_require__(37)(module)))

/***/ },
/* 37 */
/***/ function(module, exports) {

	"use strict";
	
	module.exports = function (module) {
		if (!module.webpackPolyfill) {
			module.deprecate = function () {};
			module.paths = [];
			// module.parent = undefined by default
			module.children = [];
			module.webpackPolyfill = 1;
		}
		return module;
	};

/***/ },
/* 38 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;
	
		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}
	
		return result;
	};

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(process) {'use strict';
	
	exports.__esModule = true;
	exports['default'] = combineReducers;
	
	var _createStore = __webpack_require__(24);
	
	var _isPlainObject = __webpack_require__(25);
	
	var _isPlainObject2 = _interopRequireDefault(_isPlainObject);
	
	var _warning = __webpack_require__(40);
	
	var _warning2 = _interopRequireDefault(_warning);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { 'default': obj };
	}
	
	function getUndefinedStateErrorMessage(key, action) {
	  var actionType = action && action.type;
	  var actionName = actionType && '"' + actionType.toString() + '"' || 'an action';
	
	  return 'Given action ' + actionName + ', reducer "' + key + '" returned undefined. ' + 'To ignore an action, you must explicitly return the previous state.';
	}
	
	function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
	  var reducerKeys = Object.keys(reducers);
	  var argumentName = action && action.type === _createStore.ActionTypes.INIT ? 'preloadedState argument passed to createStore' : 'previous state received by the reducer';
	
	  if (reducerKeys.length === 0) {
	    return 'Store does not have a valid reducer. Make sure the argument passed ' + 'to combineReducers is an object whose values are reducers.';
	  }
	
	  if (!(0, _isPlainObject2['default'])(inputState)) {
	    return 'The ' + argumentName + ' has unexpected type of "' + {}.toString.call(inputState).match(/\s([a-z|A-Z]+)/)[1] + '". Expected argument to be an object with the following ' + ('keys: "' + reducerKeys.join('", "') + '"');
	  }
	
	  var unexpectedKeys = Object.keys(inputState).filter(function (key) {
	    return !reducers.hasOwnProperty(key) && !unexpectedKeyCache[key];
	  });
	
	  unexpectedKeys.forEach(function (key) {
	    unexpectedKeyCache[key] = true;
	  });
	
	  if (unexpectedKeys.length > 0) {
	    return 'Unexpected ' + (unexpectedKeys.length > 1 ? 'keys' : 'key') + ' ' + ('"' + unexpectedKeys.join('", "') + '" found in ' + argumentName + '. ') + 'Expected to find one of the known reducer keys instead: ' + ('"' + reducerKeys.join('", "') + '". Unexpected keys will be ignored.');
	  }
	}
	
	function assertReducerSanity(reducers) {
	  Object.keys(reducers).forEach(function (key) {
	    var reducer = reducers[key];
	    var initialState = reducer(undefined, { type: _createStore.ActionTypes.INIT });
	
	    if (typeof initialState === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined during initialization. ' + 'If the state passed to the reducer is undefined, you must ' + 'explicitly return the initial state. The initial state may ' + 'not be undefined.');
	    }
	
	    var type = '@@redux/PROBE_UNKNOWN_ACTION_' + Math.random().toString(36).substring(7).split('').join('.');
	    if (typeof reducer(undefined, { type: type }) === 'undefined') {
	      throw new Error('Reducer "' + key + '" returned undefined when probed with a random type. ' + ('Don\'t try to handle ' + _createStore.ActionTypes.INIT + ' or other actions in "redux/*" ') + 'namespace. They are considered private. Instead, you must return the ' + 'current state for any unknown actions, unless it is undefined, ' + 'in which case you must return the initial state, regardless of the ' + 'action type. The initial state may not be undefined.');
	    }
	  });
	}
	
	/**
	 * Turns an object whose values are different reducer functions, into a single
	 * reducer function. It will call every child reducer, and gather their results
	 * into a single state object, whose keys correspond to the keys of the passed
	 * reducer functions.
	 *
	 * @param {Object} reducers An object whose values correspond to different
	 * reducer functions that need to be combined into one. One handy way to obtain
	 * it is to use ES6 `import * as reducers` syntax. The reducers may never return
	 * undefined for any action. Instead, they should return their initial state
	 * if the state passed to them was undefined, and the current state for any
	 * unrecognized action.
	 *
	 * @returns {Function} A reducer function that invokes every reducer inside the
	 * passed object, and builds a state object with the same shape.
	 */
	function combineReducers(reducers) {
	  var reducerKeys = Object.keys(reducers);
	  var finalReducers = {};
	  for (var i = 0; i < reducerKeys.length; i++) {
	    var key = reducerKeys[i];
	
	    if (process.env.NODE_ENV !== 'production') {
	      if (typeof reducers[key] === 'undefined') {
	        (0, _warning2['default'])('No reducer provided for key "' + key + '"');
	      }
	    }
	
	    if (typeof reducers[key] === 'function') {
	      finalReducers[key] = reducers[key];
	    }
	  }
	  var finalReducerKeys = Object.keys(finalReducers);
	
	  if (process.env.NODE_ENV !== 'production') {
	    var unexpectedKeyCache = {};
	  }
	
	  var sanityError;
	  try {
	    assertReducerSanity(finalReducers);
	  } catch (e) {
	    sanityError = e;
	  }
	
	  return function combination() {
	    var state = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
	    var action = arguments[1];
	
	    if (sanityError) {
	      throw sanityError;
	    }
	
	    if (process.env.NODE_ENV !== 'production') {
	      var warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
	      if (warningMessage) {
	        (0, _warning2['default'])(warningMessage);
	      }
	    }
	
	    var hasChanged = false;
	    var nextState = {};
	    for (var i = 0; i < finalReducerKeys.length; i++) {
	      var key = finalReducerKeys[i];
	      var reducer = finalReducers[key];
	      var previousStateForKey = state[key];
	      var nextStateForKey = reducer(previousStateForKey, action);
	      if (typeof nextStateForKey === 'undefined') {
	        var errorMessage = getUndefinedStateErrorMessage(key, action);
	        throw new Error(errorMessage);
	      }
	      nextState[key] = nextStateForKey;
	      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
	    }
	    return hasChanged ? nextState : state;
	  };
	}
	/* WEBPACK VAR INJECTION */}.call(exports, __webpack_require__(2)))

/***/ },
/* 40 */
/***/ function(module, exports) {

	'use strict';
	
	exports.__esModule = true;
	exports['default'] = warning;
	/**
	 * Prints a warning in the console if it exists.
	 *
	 * @param {String} message The warning message.
	 * @returns {void}
	 */
	function warning(message) {
	  /* eslint-disable no-console */
	  if (typeof console !== 'undefined' && typeof console.error === 'function') {
	    console.error(message);
	  }
	  /* eslint-enable no-console */
	  try {
	    // This error was thrown as a convenience so that if you enable
	    // "break on all exceptions" in your console,
	    // it would pause the execution at this line.
	    throw new Error(message);
	    /* eslint-disable no-empty */
	  } catch (e) {}
	  /* eslint-enable no-empty */
	}

/***/ },
/* 41 */
/***/ function(module, exports) {

	'use strict';
	
	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };
	
	exports.__esModule = true;
	exports['default'] = bindActionCreators;
	function bindActionCreator(actionCreator, dispatch) {
	  return function () {
	    return dispatch(actionCreator.apply(undefined, arguments));
	  };
	}
	
	/**
	 * Turns an object whose values are action creators, into an object with the
	 * same keys, but with every function wrapped into a `dispatch` call so they
	 * may be invoked directly. This is just a convenience method, as you can call
	 * `store.dispatch(MyActionCreators.doSomething())` yourself just fine.
	 *
	 * For convenience, you can also pass a single function as the first argument,
	 * and get a function in return.
	 *
	 * @param {Function|Object} actionCreators An object whose values are action
	 * creator functions. One handy way to obtain it is to use ES6 `import * as`
	 * syntax. You may also pass a single function.
	 *
	 * @param {Function} dispatch The `dispatch` function available on your Redux
	 * store.
	 *
	 * @returns {Function|Object} The object mimicking the original object, but with
	 * every action creator wrapped into the `dispatch` call. If you passed a
	 * function as `actionCreators`, the return value will also be a single
	 * function.
	 */
	function bindActionCreators(actionCreators, dispatch) {
	  if (typeof actionCreators === 'function') {
	    return bindActionCreator(actionCreators, dispatch);
	  }
	
	  if ((typeof actionCreators === 'undefined' ? 'undefined' : _typeof(actionCreators)) !== 'object' || actionCreators === null) {
	    throw new Error('bindActionCreators expected an object or a function, instead received ' + (actionCreators === null ? 'null' : typeof actionCreators === 'undefined' ? 'undefined' : _typeof(actionCreators)) + '. ' + 'Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?');
	  }
	
	  var keys = Object.keys(actionCreators);
	  var boundActionCreators = {};
	  for (var i = 0; i < keys.length; i++) {
	    var key = keys[i];
	    var actionCreator = actionCreators[key];
	    if (typeof actionCreator === 'function') {
	      boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
	    }
	  }
	  return boundActionCreators;
	}

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	exports.__esModule = true;
	
	var _extends = Object.assign || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }return target;
	};
	
	exports['default'] = applyMiddleware;
	
	var _compose = __webpack_require__(43);
	
	var _compose2 = _interopRequireDefault(_compose);
	
	function _interopRequireDefault(obj) {
	  return obj && obj.__esModule ? obj : { 'default': obj };
	}
	
	/**
	 * Creates a store enhancer that applies middleware to the dispatch method
	 * of the Redux store. This is handy for a variety of tasks, such as expressing
	 * asynchronous actions in a concise manner, or logging every action payload.
	 *
	 * See `redux-thunk` package as an example of the Redux middleware.
	 *
	 * Because middleware is potentially asynchronous, this should be the first
	 * store enhancer in the composition chain.
	 *
	 * Note that each middleware will be given the `dispatch` and `getState` functions
	 * as named arguments.
	 *
	 * @param {...Function} middlewares The middleware chain to be applied.
	 * @returns {Function} A store enhancer applying the middleware.
	 */
	function applyMiddleware() {
	  for (var _len = arguments.length, middlewares = Array(_len), _key = 0; _key < _len; _key++) {
	    middlewares[_key] = arguments[_key];
	  }
	
	  return function (createStore) {
	    return function (reducer, preloadedState, enhancer) {
	      var store = createStore(reducer, preloadedState, enhancer);
	      var _dispatch = store.dispatch;
	      var chain = [];
	
	      var middlewareAPI = {
	        getState: store.getState,
	        dispatch: function dispatch(action) {
	          return _dispatch(action);
	        }
	      };
	      chain = middlewares.map(function (middleware) {
	        return middleware(middlewareAPI);
	      });
	      _dispatch = _compose2['default'].apply(undefined, chain)(store.dispatch);
	
	      return _extends({}, store, {
	        dispatch: _dispatch
	      });
	    };
	  };
	}

/***/ },
/* 43 */
/***/ function(module, exports) {

	"use strict";
	
	exports.__esModule = true;
	exports["default"] = compose;
	/**
	 * Composes single-argument functions from right to left. The rightmost
	 * function can take multiple arguments as it provides the signature for
	 * the resulting composite function.
	 *
	 * @param {...Function} funcs The functions to compose.
	 * @returns {Function} A function obtained by composing the argument functions
	 * from right to left. For example, compose(f, g, h) is identical to doing
	 * (...args) => f(g(h(...args))).
	 */
	
	function compose() {
	  for (var _len = arguments.length, funcs = Array(_len), _key = 0; _key < _len; _key++) {
	    funcs[_key] = arguments[_key];
	  }
	
	  if (funcs.length === 0) {
	    return function (arg) {
	      return arg;
	    };
	  }
	
	  if (funcs.length === 1) {
	    return funcs[0];
	  }
	
	  var last = funcs[funcs.length - 1];
	  var rest = funcs.slice(0, -1);
	  return function () {
	    return rest.reduceRight(function (composed, f) {
	      return f(composed);
	    }, last.apply(undefined, arguments));
	  };
	}

/***/ },
/* 44 */
/***/ function(module, exports) {

	'use strict';
	
	var INFERNO_STATICS = {
	    childContextTypes: true,
	    contextTypes: true,
	    defaultProps: true,
	    displayName: true,
	    getDefaultProps: true,
	    propTypes: true,
	    type: true
	};
	
	var KNOWN_STATICS = {
	    name: true,
	    length: true,
	    prototype: true,
	    caller: true,
	    arguments: true,
	    arity: true
	};
	
	var isGetOwnPropertySymbolsAvailable = typeof Object.getOwnPropertySymbols === 'function';
	
	function hoistNonReactStatics(targetComponent, sourceComponent, customStatics) {
	    if (typeof sourceComponent !== 'string') {
	        // don't hoist over string (html) components
	        var keys = Object.getOwnPropertyNames(sourceComponent);
	
	        /* istanbul ignore else */
	        if (isGetOwnPropertySymbolsAvailable) {
	            keys = keys.concat(Object.getOwnPropertySymbols(sourceComponent));
	        }
	
	        for (var i = 0; i < keys.length; ++i) {
	            if (!INFERNO_STATICS[keys[i]] && !KNOWN_STATICS[keys[i]] && (!customStatics || !customStatics[keys[i]])) {
	                try {
	                    targetComponent[keys[i]] = sourceComponent[keys[i]];
	                } catch (error) {}
	            }
	        }
	    }
	
	    return targetComponent;
	};
	
	module.exports = hoistNonReactStatics;
	module.exports.default = module.exports;

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _redux = __webpack_require__(23);
	
	var initialState = {};
	
	function reducer() {
	    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
	    var action = arguments[1];
	
	    switch (action.type) {
	        default:
	            {
	                console.log("Action type '%s' unrecognised", action.type);
	                return state;
	            }
	    }
	}
	
	var store = (0, _redux.createStore)(reducer, window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__());
	
	exports.default = store;

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();
	
	var _inferno = __webpack_require__(1);
	
	var _inferno2 = _interopRequireDefault(_inferno);
	
	var _infernoComponent = __webpack_require__(8);
	
	var _infernoComponent2 = _interopRequireDefault(_infernoComponent);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }
	
	function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }
	
	var createVNode = _inferno2.default.createVNode;
	
	var App = function (_Component) {
	    _inherits(App, _Component);
	
	    function App() {
	        _classCallCheck(this, App);
	
	        return _possibleConstructorReturn(this, (App.__proto__ || Object.getPrototypeOf(App)).apply(this, arguments));
	    }
	
	    _createClass(App, [{
	        key: 'render',
	        value: function render() {
	            return createVNode(2, 'p', null, 'This is an application');
	        }
	    }]);
	
	    return App;
	}(_infernoComponent2.default);
	
	exports.default = App;

/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map