# Example
```
require('objectRecursive');
var myObj = {
	prop: {
		subvalue: 3
	}
};
Object.objectRecursive(changes => changes.forEach(change => console.log(change)));
myObj.prop.subvalue = 4;
```
