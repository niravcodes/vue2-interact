'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var Vue = _interopDefault(require('vue'));
var interact = _interopDefault(require('interact.js'));

var InteractEventBus = new Vue();

//

var script = {
  name: "Vue2InteractDraggable",

  props: {
    interactBlockDragDown: {
      type: Boolean,
      default: false
    },
    interactBlockDragLeft: {
      type: Boolean,
      default: false
    },
    interactBlockDragRight: {
      type: Boolean,
      default: false
    },
    interactBlockDragUp: {
      type: Boolean,
      default: false
    },
    interactEventBusEvents: {
      type: Object,
      default: () => {}
    },
    interactMaxRotation: {
      type: Number,
      default: 0
    },
    interactLockXAxis: {
      type: Boolean,
      default: false
    },
    interactLockYAxis: {
      type: Boolean,
      default: false
    },
    interactLockSwipeDown: {
      type: Boolean,
      default: false
    },
    interactLockSwipeLeft: {
      type: Boolean,
      default: false
    },
    interactLockSwipeRight: {
      type: Boolean,
      default: false
    },
    interactLockSwipeUp: {
      type: Boolean,
      default: false
    },
    interactOutOfSightXCoordinate: {
      type: Number,
      default: 500
    },
    interactOutOfSightYCoordinate: {
      type: Number,
      default: 1000
    },
    interactXThreshold: {
      type: Number,
      default: 200
    },
    interactYThreshold: {
      type: Number,
      default: 300
    }
  },

  data() {
    return {
      interactIsAnimating: true,
      interactDragged: null,
      interactPosition: {
        x: 0,
        y: 0,
        rotation: 0
      }
    };
  },

  computed: {
    interactTransformString() {
      if (!this.interactIsAnimating || this.interactDragged) {
        const { x, y, rotation } = this.interactPosition;
        return `translate3D(${x}px, ${y}px, 0) rotate(${rotation}deg)`;
      }

      return null;
    },

    interactTransitionString() {
      if (this.interactIsAnimating) return "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)";

      return null;
    }
  },

  watch: {
    interactEventBusEvents(val) {
      this.interactSetEventBusEvents();
    }
  },

  mounted() {
    this.interactSetEventBusEvents();

    const element = this.$refs.interactElement;

    interact(element).draggable({
      onstart: () => {
        this.interactIsAnimating = false;
      },

      onmove: event => {
        let x = 0;
        let y = 0;

        if (this.interactLockSwipeLeft && event.dx < 0) x = 0;else if (this.interactLockSwipeRight && event.dx > 0) x = 0;else x = this.interactLockXAxis ? 0 : (this.interactPosition.x || 0) + event.dx;

        if (this.interactLockSwipeUp && event.dy < 0) y = 0;else if (this.interactLockSwipeDown && event.dy > 0) y = 0;else y = this.interactLockYAxis ? 0 : (this.interactPosition.y || 0) + event.dy;

        let rotation = this.interactMaxRotation * (x / this.interactXThreshold);

        if (rotation > this.interactMaxRotation) rotation = this.interactMaxRotation;else if (rotation < -this.interactMaxRotation) rotation = -this.interactMaxRotation;

        this.interactSetPosition({ x, y, rotation });
        this.$emit("moving", { x, y, rotation });
      },

      onend: () => {
        const { x: cardPositionX, y: cardPositionY } = this.interactPosition;
        const { interactXThreshold, interactYThreshold } = this;
        this.interactIsAnimating = true;

        if (cardPositionX > interactXThreshold) this.interactDraggedRight();else if (cardPositionX < -interactXThreshold) this.interactDraggedLeft();else if (cardPositionY > interactYThreshold) this.interactDraggedDown();else if (cardPositionY < -interactYThreshold) this.interactDraggedUp();else this.interactResetCardPosition();
      }
    });
  },

  beforeDestroy() {
    interact(this.$refs.interactElement).unset();
    this.interactUnsetEventBusEvents();
  },

  methods: {
    interactDraggedDown() {
      if (this.interactBlockDragDown) {
        this.interactResetCardPosition();
        return;
      }
      this.interactUnsetElement();
      this.interactSetPosition({ y: this.interactOutOfSightYCoordinate });
      this.$emit("draggedDown");
    },

    interactDraggedLeft() {
      if (this.interactBlockDragLeft) {
        this.interactResetCardPosition();
        return;
      }
      this.interactUnsetElement();
      this.interactSetPosition({
        x: -this.interactOutOfSightXCoordinate,
        rotation: -this.interactMaxRotation
      });
      this.$emit("draggedLeft");
    },

    interactDraggedRight() {
      if (this.interactBlockDragRight) {
        this.interactResetCardPosition();
        return;
      }
      this.interactUnsetElement();
      this.interactSetPosition({
        x: this.interactOutOfSightXCoordinate,
        rotation: this.interactMaxRotation
      });
      this.$emit("draggedRight");
    },

    interactDraggedUp() {
      if (this.interactBlockDragUp) {
        this.interactResetCardPosition();
        return;
      }
      this.interactUnsetElement();
      this.interactSetPosition({ y: -this.interactOutOfSightYCoordinate });
      this.$emit("draggedUp");
    },

    interactSetEventBusEvents() {
      if (this.interactEventBusEvents) {
        if (this.interactEventBusEvents.draggedDown) {
          InteractEventBus.$on(this.interactEventBusEvents.draggedDown, this.interactDraggedDown);
        }

        if (this.interactEventBusEvents.draggedLeft) {
          InteractEventBus.$on(this.interactEventBusEvents.draggedLeft, this.interactDraggedLeft);
        }

        if (this.interactEventBusEvents.draggedRight) {
          InteractEventBus.$on(this.interactEventBusEvents.draggedRight, this.interactDraggedRight);
        }

        if (this.interactEventBusEvents.draggedUp) {
          InteractEventBus.$on(this.interactEventBusEvents.draggedUp, this.interactDraggedUp);
        }
      }
    },

    interactSetPosition(coordinates) {
      const { x = 0, y = 0, rotation = 0 } = coordinates;

      this.interactPosition = { x, y, rotation };
    },

    interactUnsetElement() {
      interact(this.$refs.interactElement).unset();
      this.interactDragged = true;
    },

    interactUnsetEventBusEvents() {
      if (this.interactEventBusEvents) {
        if (this.interactEventBusEvents.draggedDown) {
          InteractEventBus.$off(this.interactEventBusEvents.draggedDown, this.draggedDown);
        }

        if (this.interactEventBusEvents.draggedLeft) {
          InteractEventBus.$off(this.interactEventBusEvents.draggedLeft, this.draggedLeft);
        }

        if (this.interactEventBusEvents.draggedRight) {
          InteractEventBus.$off(this.interactEventBusEvents.draggedRight, this.draggedRight);
        }

        if (this.interactEventBusEvents.draggedUp) {
          InteractEventBus.$off(this.interactEventBusEvents.draggedUp, this.draggedUp);
        }
      }
    },

    interactResetCardPosition() {
      this.interactSetPosition({ x: 0, y: 0, rotation: 0 });
      this.$emit("resetPosition");
    }
  }
};

function normalizeComponent(template, style, script, scopeId, isFunctionalTemplate, moduleIdentifier /* server only */, shadowMode, createInjector, createInjectorSSR, createInjectorShadow) {
    if (typeof shadowMode !== 'boolean') {
        createInjectorSSR = createInjector;
        createInjector = shadowMode;
        shadowMode = false;
    }
    // Vue.extend constructor export interop.
    const options = typeof script === 'function' ? script.options : script;
    // render functions
    if (template && template.render) {
        options.render = template.render;
        options.staticRenderFns = template.staticRenderFns;
        options._compiled = true;
        // functional template
        if (isFunctionalTemplate) {
            options.functional = true;
        }
    }
    // scopedId
    if (scopeId) {
        options._scopeId = scopeId;
    }
    let hook;
    if (moduleIdentifier) {
        // server build
        hook = function (context) {
            // 2.3 injection
            context =
                context || // cached call
                    (this.$vnode && this.$vnode.ssrContext) || // stateful
                    (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext); // functional
            // 2.2 with runInNewContext: true
            if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
                context = __VUE_SSR_CONTEXT__;
            }
            // inject component styles
            if (style) {
                style.call(this, createInjectorSSR(context));
            }
            // register component module identifier for async chunk inference
            if (context && context._registeredComponents) {
                context._registeredComponents.add(moduleIdentifier);
            }
        };
        // used by ssr in case component is cached and beforeCreate
        // never gets called
        options._ssrRegister = hook;
    }
    else if (style) {
        hook = shadowMode
            ? function (context) {
                style.call(this, createInjectorShadow(context, this.$root.$options.shadowRoot));
            }
            : function (context) {
                style.call(this, createInjector(context));
            };
    }
    if (hook) {
        if (options.functional) {
            // register for functional component in vue file
            const originalRender = options.render;
            options.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context);
            };
        }
        else {
            // inject component registration as beforeCreate hook
            const existing = options.beforeCreate;
            options.beforeCreate = existing ? [].concat(existing, hook) : [hook];
        }
    }
    return script;
}

/* script */
const __vue_script__ = script;

/* template */
var __vue_render__ = function () {
  var _vm = this;var _h = _vm.$createElement;var _c = _vm._self._c || _h;return _c('div', { ref: "interactElement", class: { 'vue-interact-animated': _vm.interactIsAnimating }, style: {
      transform: _vm.interactTransformString,
      transition: _vm.interactTransitionString
    } }, [_vm._t("default")], 2);
};
var __vue_staticRenderFns__ = [];

/* style */
const __vue_inject_styles__ = undefined;
/* scoped */
const __vue_scope_id__ = undefined;
/* module identifier */
const __vue_module_identifier__ = undefined;
/* functional template */
const __vue_is_functional_template__ = false;
/* style inject */

/* style inject SSR */

/* style inject shadow dom */

const __vue_component__ = normalizeComponent({ render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ }, __vue_inject_styles__, __vue_script__, __vue_scope_id__, __vue_is_functional_template__, __vue_module_identifier__, false, undefined, undefined, undefined);

const plugin = {
  install(Vue$$1) {
    Vue$$1.component('Vue2InteractDraggable', __vue_component__);
  }
};

// Auto-install
let GlobalVue = null;
if (typeof window !== 'undefined') {
  GlobalVue = window.Vue;
} else if (typeof global !== 'undefined') {
  GlobalVue = global.Vue;
}
if (GlobalVue) {
  GlobalVue.use(plugin);
}

exports.Vue2InteractDraggable = __vue_component__;
exports.InteractEventBus = InteractEventBus;
