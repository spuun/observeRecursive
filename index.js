"use strict";
(() => {
	var observedObjects = new Map();

	Object.unobserveRecursive = (obj, cb) => {
		if (!observedObjects.has(obj))
			return;
		var observers = observedObjects.get(obj);
		observedObjects.delete(observers);
		if (!observers.has(cb))
			return;
		var observersForCallback = observers.get(cb);
		observers.delete(cb);
		observersForCallback.forEach((k,i) => {
			Object.unobserve(i, k);	
			observersForCallback.delete(k);
		});
	};

	Object.observeRecursive = (obj, cb) => {
		var notifier = Object.getNotifier(obj);
		var observers = new Map();
		if (!observedObjects.has(obj)) 
			observedObjects.set(obj, new Map());
		observedObjects.get(obj).set(cb, observers);
		
		var isObj = item => typeof(item) === 'object';	
		var copyChange = (change, path) => {
			var changeCopy = {
				type: change.type,
				object: obj,
				name: [...path, change.name].join('.')
			};
			if (change.oldValue !== undefined)
				changeCopy.oldValue = change.oldValue;
			return changeCopy;
		}
		var unobserve = obj => {
			if (!isObj(obj)) return;
			Object.keys(obj).forEach(key => isObj(obj[key]) && unobserve(obj[key]));
			if (observers.has(obj)) {
				var observer = observers.get(obj);
				Object.unobserve(obj, observer);
				observers.delete(obj);
			}
		};
		var observe = (obj, path) => {
			if (!isObj(obj)) return;
			var observer = changes => {
				changes.forEach(change => {
					if (change.type === 'add' && isObj(change.object[change.name])) {
						observe(change.object[change.name], [...path, change.name]);
					} else if (change.type === 'update') {
						unobserve(change.oldValue);
						observe(change.object[change.name], [...path, change.name]);
					} else if (change.type === 'delete') {
						unobserve(change.oldValue);
					}
				});
				if (path.length == 0)
					return cb(changes);
				else 
					changes.forEach(change => notifier.notify(copyChange(change, path)));
			};
			Object.observe(obj, observer);
			observers.set(obj, observer);
			Object.keys(obj).forEach(key => observe(obj[key], [...path, key])); 
		}
		observe(obj, []);
	};
})();
/*
var obja = {};
var objb = {};
var objc = {};
Object.observe(objb, changes =>	console.log(this, 'objb', changes));
Object.observe(objc, changes => console.log('objc', changes));
var objAObserver = changes => console.log(changes);
Object.observeRecursive(obja, objAObserver);
obja.b = 1;
obja.c = 2;
obja.sub = objb;
delete obja.b;
var acts = [
	() => { objb.suba = 'aaaa'; },
	() => { obja.sub = objc; },
	() => { objc.csub = 'scscscs'; },
	() => { objb.test = 'hej'; },
	() => { objc.addedsub = { subsub:{}}; },
	() => { objc.addedsub.subsub.subsubsub = 'hej subba'; },
	() => { delete obja.sub.addedsub.subsub; },
	() => { Object.unobserveRecursive(obja, objAObserver); },
	() => { obja.b = 100; },
	() => { obja.sub.addafterunobserver = 'ok'; },

	() => { console.log(obja, objb, objc) } 
];

for (let i=0;i<acts.length;++i) {
	 setTimeout(() => {acts[i]();}, 10+i*10);
}
*/
