/*
---

name: "Class.Events"

description: ""

license: "[GNU Lesser General Public License](http://opensource.org/licenses/lgpl-license.php)"

requires:
	- atom
	- atom.Class

inspiration:
  - "[MooTools](http://mootools.net)"

provides: atom.Class.Events

...
*/

new function () {

var Class = atom.Class;

var fire = function (name, fn, args, onfinish) {
	var result = fn.apply(this, args || []);
	if (typeof result == 'string' && result.toLowerCase() == 'removeevent') {
		onfinish.push(this.removeEvent.context(this, [name, fn]));
	}
};

var removeOn = function(string){
	return string.replace(/^on([A-Z])/, function(full, first){
		return first.toLowerCase();
	});
};

var nextTick = function (fn) {
	if (!nextTick.id) {
		nextTick.id = setTimeout(function () {
			nextTick.id = 0;
			nextTick.fn.invoke();
		}, 1);
	}
	nextTick.fn.push(fn);
};
nextTick.fn = [];
nextTick.id = 0;

atom.extend(Class, {
	Events: Class({
		events: { $ready: {} },

		addEvent: function(name, fn) {
			if (name == 'ready') {
				debugger;
			}
			var i, l, onfinish = [];
			if (arguments.length == 1 && typeof name != 'string') {
				for (i in name) {
					this.addEvent(i, name[i]);
				}
			} else if (Array.isArray(name)) {
				for (i = 0, l = name.length; i < l; i++) {
					this.addEvent(name[i], fn);
				}
			} else {
				name = removeOn(name);
				if (name == '$ready') {
					throw new TypeError('Event name «$ready» is reserved');
				} else if (!fn) {
					throw new TypeError('Function is empty');
				} else {
					Object.ifEmpty(this.events, name, []);

					this.events[name].include(fn);

					var ready = this.events.$ready[name];
					if (ready) fire.apply(this, [name, fn, ready, onfinish]);
					onfinish.invoke();
				}
			}
			return this;
		},
		removeEvent: function (name, fn) {
			if (arguments.length == 1 && typeof name != 'string') {
				for (i in name) {
					this.addEvent(i, name[i]);
				}
			} else if (Array.isArray(name)) {
				for (var i = name.length; i--;) {
					this.removeEvent(name[i], fn);
				}
				return this;
			} else {
				name = removeOn(name);
				if (name == '$ready') {
					throw new TypeError('Event name «$ready» is reserved');
				}
				if (arguments.length == 1) {
					this.events[name] = [];
				} else if (name in this.events) {
					this.events[name].erase(fn);
				}
			}
			return this;
		},

		fireEvent: function (name, args) {
			name = removeOn(name);
			var funcs = this.events[name];
			if (funcs) {
				var onfinish = [],
					l = funcs.length,
					i = 0;
				for (;i < l; i++) fire.call(this, name, funcs[i], args, onfinish);
				onfinish.invoke();
			}
			return this;
		},
		readyEvent: function (name, args) {
			name = removeOn(name);
			this.events.$ready[name] = args;
			nextTick(this.fireEvent.bind(this, name, args));
			return this;
		}
	})
});

}();