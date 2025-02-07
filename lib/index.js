"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _react = _interopRequireWildcard(require("react"));
var _elementResizeDetector = _interopRequireDefault(require("element-resize-detector"));
var _lodash = _interopRequireDefault(require("lodash.debounce"));
var _lodash2 = _interopRequireDefault(require("lodash.omit"));
var _propTypes = _interopRequireDefault(require("prop-types"));
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) if ("default" !== u && {}.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } return n.default = e, t && t.set(e, n), n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { (0, _defineProperty2.default)(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _callSuper(t, o, e) { return o = (0, _getPrototypeOf2.default)(o), (0, _possibleConstructorReturn2.default)(t, _isNativeReflectConstruct() ? Reflect.construct(o, e || [], (0, _getPrototypeOf2.default)(t).constructor) : o.apply(t, e)); }
function _isNativeReflectConstruct() { try { var t = !Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); } catch (t) {} return (_isNativeReflectConstruct = function _isNativeReflectConstruct() { return !!t; })(); }
var isBrowser = typeof window !== 'undefined';
var Masonry = isBrowser ? window.Masonry || require('masonry-layout') : null;
var imagesloaded = isBrowser ? require('imagesloaded') : null;
var MasonryComponent = /*#__PURE__*/function (_Component) {
  function MasonryComponent(props) {
    var _this;
    (0, _classCallCheck2.default)(this, MasonryComponent);
    _this = _callSuper(this, MasonryComponent, [props]);
    _this.masonry = false;
    _this.erd = undefined;
    _this.latestKnownDomChildren = [];
    _this.imagesLoadedCancelRef = undefined;
    _this.masonryContainer = undefined;
    _this.initializeMasonry = _this.initializeMasonry.bind(_this);
    _this.getCurrentDomChildren = _this.getCurrentDomChildren.bind(_this);
    _this.diffDomChildren = _this.diffDomChildren.bind(_this);
    _this.performLayout = _this.performLayout.bind(_this);
    _this.derefImagesLoaded = _this.derefImagesLoaded.bind(_this);
    _this.imagesLoaded = _this.imagesLoaded.bind(_this);
    _this.reloadLayout = _this.reloadLayout.bind(_this);
    _this.initializeResizableChildren = _this.initializeResizableChildren.bind(_this);
    _this.listenToElementResize = _this.listenToElementResize.bind(_this);
    _this.destroyErd = _this.destroyErd.bind(_this);
    return _this;
  }
  (0, _inherits2.default)(MasonryComponent, _Component);
  return (0, _createClass2.default)(MasonryComponent, [{
    key: "initializeMasonry",
    value: function initializeMasonry(force) {
      if (!this.masonry || force) {
        this.masonry = new Masonry(this.masonryContainer, this.props.options);
        if (this.props.onLayoutComplete) {
          this.masonry.on('layoutComplete', this.props.onLayoutComplete);
        }
        if (this.props.onRemoveComplete) {
          this.masonry.on('removeComplete', this.props.onRemoveComplete);
        }
        this.latestKnownDomChildren = this.getCurrentDomChildren();
      }
    }
  }, {
    key: "getCurrentDomChildren",
    value: function getCurrentDomChildren() {
      var node = this.masonryContainer;
      var children = this.props.options.itemSelector ? node.querySelectorAll(this.props.options.itemSelector) : node.children;
      return Array.prototype.slice.call(children);
    }
  }, {
    key: "diffDomChildren",
    value: function diffDomChildren() {
      var forceItemReload = false;
      var knownChildrenStillAttached = this.latestKnownDomChildren.filter(function (element) {
        /*
         * take only elements attached to DOM
         * (aka the parent is the masonry container, not null)
         * otherwise masonry would try to "remove it" again from the DOM
         */
        return !!element.parentNode;
      });

      /*
       * If not all known children are attached to the dom - we have no other way of notifying
       * masonry to remove the ones not still attached besides invoking a complete item reload.
       * basically all the rest of the code below does not matter in that case.
       */
      if (knownChildrenStillAttached.length !== this.latestKnownDomChildren.length) {
        forceItemReload = true;
      }
      var currentDomChildren = this.getCurrentDomChildren();

      /*
       * Since we are looking for a known child which is also attached to the dom AND
       * not attached to the dom at the same time - this would *always* produce an empty array.
       */
      var removed = knownChildrenStillAttached.filter(function (attachedKnownChild) {
        return !~currentDomChildren.indexOf(attachedKnownChild);
      });

      /*
       * This would get any children which are attached to the dom but are *unkown* to us
       * from previous renders
       */
      var newDomChildren = currentDomChildren.filter(function (currentChild) {
        return !~knownChildrenStillAttached.indexOf(currentChild);
      });
      var beginningIndex = 0;

      // get everything added to the beginning of the DOMNode list
      var prepended = newDomChildren.filter(function (newChild) {
        var prepend = beginningIndex === currentDomChildren.indexOf(newChild);
        if (prepend) {
          // increase the index
          beginningIndex++;
        }
        return prepend;
      });

      // we assume that everything else is appended
      var appended = newDomChildren.filter(function (el) {
        return prepended.indexOf(el) === -1;
      });

      /*
       * otherwise we reverse it because so we're going through the list picking off the items that
       * have been added at the end of the list. this complex logic is preserved in case it needs to be
       * invoked
       *
       * const endingIndex = currentDomChildren.length - 1
       *
       * newDomChildren.reverse().filter(function(newChild, i){
       *     const append = endingIndex == currentDomChildren.indexOf(newChild)
       *
       *     if (append) {
       *         endingIndex--
       *     }
       *
       *     return append
       * })
       */

      // get everything added to the end of the DOMNode list
      var moved = [];

      /*
       * This would always be true (see above about the lofic for "removed")
       */
      if (removed.length === 0) {
        /*
         * 'moved' will contain some random elements (if any) since the "knownChildrenStillAttached" is a filter
         * of the "known" children which are still attached - All indexes could basically change. (for example
         * if the first element is not attached)
         * Don't trust this array.
         */
        moved = knownChildrenStillAttached.filter(function (child, index) {
          return index !== currentDomChildren.indexOf(child);
        });
      }
      this.latestKnownDomChildren = currentDomChildren;
      return {
        old: knownChildrenStillAttached,
        // Not used
        new: currentDomChildren,
        // Not used
        removed: removed,
        appended: appended,
        prepended: prepended,
        moved: moved,
        forceItemReload: forceItemReload
      };
    }
  }, {
    key: "performLayout",
    value: function performLayout() {
      var diff = this.diffDomChildren();
      var reloadItems = diff.forceItemReload || diff.moved.length > 0;

      // Would never be true. (see comments of 'diffDomChildren' about 'removed')
      if (diff.removed.length > 0) {
        if (this.props.enableResizableChildren) {
          diff.removed.forEach(this.erd.removeAllListeners, this.erd);
        }
        this.masonry.remove(diff.removed);
        reloadItems = true;
      }
      if (diff.appended.length > 0) {
        this.masonry.appended(diff.appended);
        if (diff.prepended.length === 0) {
          reloadItems = true;
        }
        if (this.props.enableResizableChildren) {
          diff.appended.forEach(this.listenToElementResize, this);
        }
      }
      if (diff.prepended.length > 0) {
        if (!reloadItems) {
          this.masonry.prepended(diff.prepended);
        }
        if (this.props.enableResizableChildren) {
          diff.prepended.forEach(this.listenToElementResize, this);
        }
      }
      if (reloadItems) {
        this.masonry.reloadItems();
      }
      if (this.props.updateOnEachComponentUpdate || reloadItems) {
        this.reloadLayout();
      }
    }
  }, {
    key: "derefImagesLoaded",
    value: function derefImagesLoaded() {
      this.imagesLoadedCancelRef();
      this.imagesLoadedCancelRef = undefined;
    }
  }, {
    key: "imagesLoaded",
    value: function imagesLoaded() {
      if (this.props.disableImagesLoaded) {
        return;
      }
      if (this.imagesLoadedCancelRef) {
        this.derefImagesLoaded();
      }
      var event = this.props.updateOnEachImageLoad ? 'progress' : 'always';
      var handler = (0, _lodash.default)(function (instance) {
        if (this.props.onImagesLoaded) {
          this.props.onImagesLoaded(instance);
        }
        this.reloadLayout();
      }.bind(this), 100);
      var imgLoad = imagesloaded(this.masonryContainer, this.props.imagesLoadedOptions).on(event, handler);
      this.imagesLoadedCancelRef = function () {
        imgLoad.off(event, handler);
        handler.cancel();
      };
    }
  }, {
    key: "reloadLayout",
    value: function reloadLayout() {
      var _this2 = this;
      (0, _lodash.default)(function () {
        _this2.masonry.layout();
      }, 100, {
        leading: true
      });
    }
  }, {
    key: "initializeResizableChildren",
    value: function initializeResizableChildren() {
      if (!this.props.enableResizableChildren) {
        return;
      }
      this.erd = (0, _elementResizeDetector.default)({
        strategy: 'scroll'
      });
      this.latestKnownDomChildren.forEach(this.listenToElementResize, this);
    }
  }, {
    key: "listenToElementResize",
    value: function listenToElementResize(el) {
      this.erd.listenTo(el, this.reloadLayout);
    }
  }, {
    key: "destroyErd",
    value: function destroyErd() {
      if (this.erd) {
        this.latestKnownDomChildren.forEach(this.erd.uninstall, this.erd);
      }
    }
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {
      this.initializeMasonry();
      this.initializeResizableChildren();
      this.imagesLoaded();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate() {
      this.performLayout();
      this.imagesLoaded();
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      this.destroyErd();

      // unregister events
      if (this.props.onLayoutComplete) {
        this.masonry.off('layoutComplete', this.props.onLayoutComplete);
      }
      if (this.props.onRemoveComplete) {
        this.masonry.off('removeComplete', this.props.onRemoveComplete);
      }
      if (this.imagesLoadedCancelRef) {
        this.derefImagesLoaded();
      }
      this.masonry.destroy();
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;
      var props = (0, _lodash2.default)(this.props, Object.keys(MasonryComponent.propTypes));
      return /*#__PURE__*/_react.default.createElement(this.props.elementType, _objectSpread(_objectSpread({}, props), {}, {
        ref: function ref(n) {
          return _this3.masonryContainer = n;
        }
      }), this.props.children);
    }
  }]);
}(_react.Component);
module.exports = MasonryComponent;
module.exports.default = MasonryComponent;
MasonryComponent.defaultProps = {
  enableResizableChildren: false,
  disableImagesLoaded: false,
  updateOnEachImageLoad: false,
  options: {},
  imagesLoadedOptions: {},
  className: '',
  elementType: 'div',
  onLayoutComplete: function onLayoutComplete() {},
  onRemoveComplete: function onRemoveComplete() {},
  updateOnEachComponentUpdate: true
};
MasonryComponent.propTypes = {
  enableResizableChildren: _propTypes.default.bool,
  disableImagesLoaded: _propTypes.default.bool,
  onImagesLoaded: _propTypes.default.func,
  updateOnEachImageLoad: _propTypes.default.bool,
  options: _propTypes.default.object,
  imagesLoadedOptions: _propTypes.default.object,
  elementType: _propTypes.default.string,
  onLayoutComplete: _propTypes.default.func,
  onRemoveComplete: _propTypes.default.func,
  updateOnEachComponentUpdate: _propTypes.default.bool
};
//# sourceMappingURL=index.js.map