var assert = require('assert');
require('../index.js');

describe('Object', () => {
	describe('#observeRecursive', () => {
		var obj;

		var _test = (act, assert) => {
			return (done) => {
				Object.observeRecursive(obj, (changes) => {
					assert(changes);
					done();
				});
				act();
			}
		};
		

		beforeEach(() => {
			obj = {
				prop1: 1,
				prop2: 'two',
				subobj: {
					subprop1: 'sub one',
					subprop2: 'sub two',
				}
			};
		});
	
		it('should trigger add on level 1', _test(
			() => obj.prop3 = 'new property',
			(changes) => assert.deepEqual(changes[0], {
				type: 'add',
				name: 'prop3', 
				object: obj 
			})
		));

		it('should trigger update on level 1', _test(
		 ()	=> obj.prop1 = 2,
		 (changes) => assert.deepEqual(changes[0], {
			 type: 'update',
			 name: 'prop1',
			 object: obj,
			 oldValue: 1
		 })
		));

		it('should trigger delete on level 1', _test(
		 ()	=> delete obj.prop1,
		 (changes) => assert.deepEqual(changes[0], {
		 	type: 'delete',
			name: 'prop1',
			object: obj,
			oldValue: 1
		 })
		));

		it ('should trigger add on level 2', _test(
			() => obj.subobj.subprop3 = 'new property',
			(changes) => assert.deepEqual(changes[0], {
				type: 'add',
				name: 'subobj.subprop3',
				object: obj
			})
		));
		
		it ('should trigger update on level 2', _test(
			() => obj.subobj.subprop2 = 'new value',
			(changes) => assert.deepEqual(changes[0], {
				type: 'update',
				name: 'subobj.subprop2',
				object: obj,
				oldValue: 'sub two'
			})
		));

		it ('should trigger delete on level 2', _test(
			() => delete obj.subobj.subprop2,
			(changes) => assert.deepEqual(changes[0], {
				type: 'delete',
				name: 'subobj.subprop2',
				object: obj,
				oldValue: 'sub two'
			})
		));

	});
});
