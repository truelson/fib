


(function() {

  var dojo = {};
  exports.dojo = dojo;

	var _getParts = function(arr, obj, cb){
		return [ 
			(dojo.isString(arr) ? arr.split("") : arr), 
			(obj||dojo.global),
			// FIXME: cache the anonymous functions we create here?
			(dojo.isString(cb) ? (new Function("item", "index", "array", cb)) : cb)
		];
	}

  dojo.isString = function(/*anything*/ it){
    // summary:	Return true if it is a String
    return typeof it == "string" || it instanceof String; // Boolean
  }

  dojo.isArray = function(/*anything*/ it){
    // summary: Return true if it is an Array
    return it && it instanceof Array || typeof it == "array" ||
      (dojo.NodeList && it instanceof dojo.NodeList); // Boolean
  }

  /*=====
  dojo.isFunction = function(it){
    // summary: Return true if it is a Function
    // it: anything
  }
  =====*/

  dojo.isFunction = (function(){
    var _isFunction = function(/*anything*/ it){
      return typeof it == "function" || it instanceof Function; // Boolean
    };

    return dojo.isSafari ?
      // only slow this down w/ gratuitious casting in Safari since it's what's b0rken
      function(/*anything*/ it){
        if(typeof it == "function" && it == "[object NodeList]"){ return false; }
        return _isFunction(it); // Boolean
      } : _isFunction;
  })();

  dojo.isObject = function(/*anything*/ it){
    // summary: 
    //		Returns true if it is a JavaScript object (or an Array, a Function or null)
    return it !== undefined &&
      (it === null || typeof it == "object" || dojo.isArray(it) || dojo.isFunction(it)); // Boolean
  }

  dojo.isArrayLike = function(/*anything*/ it){
    // return:
    //		If it walks like a duck and quicks like a duck, return true
    var d = dojo;
    return it && it !== undefined &&
      // keep out built-in constructors (Number, String, ...) which have length
      // properties
      !d.isString(it) && !d.isFunction(it) &&
      !(it.tagName && it.tagName.toLowerCase() == 'form') &&
      (d.isArray(it) || isFinite(it.length)); // Boolean
  }

  dojo.isAlien = function(/*anything*/ it){
    // summary: 
    //		Returns true if it is a built-in function or some other kind of
    //		oddball that *should* report as a function but doesn't
    return it && !dojo.isFunction(it) && /\{\s*\[native code\]\s*\}/.test(String(it)); // Boolean
  }

  dojo._mixin = function(/*Object*/ obj, /*Object*/ props){
    // summary:
    //		Adds all properties and methods of props to obj. This addition is
    //		"prototype extension safe", so that instances of objects will not
    //		pass along prototype defaults.
    var tobj = {};
    for(var x in props){
      // the "tobj" condition avoid copying properties in "props"
      // inherited from Object.prototype.  For example, if obj has a custom
      // toString() method, don't overwrite it with the toString() method
      // that props inherited from Object.prototype
      if(tobj[x] === undefined || tobj[x] != props[x]){
        obj[x] = props[x];
      }
    }
    // IE doesn't recognize custom toStrings in for..in
    if(dojo.isIE && props){
      var p = props.toString;
      if(typeof p == "function" && p != obj.toString && p != tobj.toString &&
        p != "\nfunction toString() {\n    [native code]\n}\n"){
          obj.toString = props.toString;
      }
    }
    return obj; // Object
  }

  dojo.mixin = function(/*Object*/obj, /*Object...*/props){
    // summary:	Adds all properties and methods of props to obj. 
    for(var i=1, l=arguments.length; i<l; i++){
      dojo._mixin(obj, arguments[i]);
    }
    return obj; // Object
  }

  dojo.extend = function(/*Object*/ constructor, /*Object...*/ props){
    // summary:
    //		Adds all properties and methods of props to constructor's
    //		prototype, making them available to all instances created with
    //		constructor.
    for(var i=1, l=arguments.length; i<l; i++){
      dojo._mixin(constructor.prototype, arguments[i]);
    }
    return constructor; // Object
  }

  dojo._hitchArgs = function(scope, method /*,...*/){
    var pre = dojo._toArray(arguments, 2);
    var named = dojo.isString(method);
    return function(){
      // arrayify arguments
      var args = dojo._toArray(arguments);
      // locate our method
      var f = named ? (scope||dojo.global)[method] : method;
      // invoke with collected args
      return f && f.apply(scope || this, pre.concat(args)); // Any
    } // Function
  }

  dojo.hitch = function(/*Object*/scope, /*Function|String*/method /*,...*/){
    // summary: 
    //		Returns a function that will only ever execute in the a given scope. 
    //		This allows for easy use of object member functions
    //		in callbacks and other places in which the "this" keyword may
    //		otherwise not reference the expected scope. 
    //		Any number of default positional arguments may be passed as parameters 
    //		beyond "method".
    //		Each of these values will be used to "placehold" (similar to curry)
    //		for the hitched function. 
    // scope: 
    //		The scope to use when method executes. If method is a string, 
    //		scope is also the object containing method.
    // method:
    //		A function to be hitched to scope, or the name of the method in
    //		scope to be hitched.
    // usage:
    //		dojo.hitch(foo, "bar")(); // runs foo.bar() in the scope of foo
    //		dojo.hitch(foo, myFunction); // returns a function that runs myFunction in the scope of foo
    if(arguments.length > 2){
      return dojo._hitchArgs.apply(dojo, arguments); // Function
    }
    if(!method){
      method = scope;
      scope = null;
    }
    if(dojo.isString(method)){
      scope = scope || dojo.global;
      if(!scope[method]){ throw(['dojo.hitch: scope["', method, '"] is null (scope="', scope, '")'].join('')); }
      return function(){ return scope[method].apply(scope, arguments || []); }; // Function
    }
    return !scope ? method : function(){ return method.apply(scope, arguments || []); }; // Function
  }

  dojo._delegate = function(obj, props){
    // boodman/crockford delegation
    function TMP(){};
    TMP.prototype = obj;
    var tmp = new TMP();
    if(props){
      dojo.mixin(tmp, props);
    }
    return tmp; // Object
  }

  dojo.partial = function(/*Function|String*/method /*, ...*/){
    // summary:
    //		similar to hitch() except that the scope object is left to be
    //		whatever the execution context eventually becomes. This is the
    //		functional equivalent of calling:
    //		dojo.hitch(null, funcName, ...);
    var arr = [ null ];
    return dojo.hitch.apply(dojo, arr.concat(dojo._toArray(arguments))); // Function
  }

  dojo._toArray = function(/*Object*/obj, /*Number?*/offset){
    // summary:
    //		Converts an array-like object (i.e. arguments, DOMCollection)
    //		to an array. Returns a new Array object.
    var arr = [];
    for(var x = offset || 0; x < obj.length; x++){
      arr.push(obj[x]);
    }
    return arr; // Array
  }

  dojo.clone = function(/*anything*/ o){
    // summary:
    //		Clones objects (including DOM nodes) and all children.
    //		Warning: do not clone cyclic structures.
    if(!o){ return o; }
    if(dojo.isArray(o)){
      var r = [];
      for(var i = 0; i < o.length; ++i){
        r.push(dojo.clone(o[i]));
      }
      return r; // Array
    }else if(dojo.isObject(o)){
      if(o.nodeType && o.cloneNode){ // isNode
        return o.cloneNode(true); // Node
      }else{
        var r = new o.constructor(); // specific to dojo.declare()'d classes!
        for(var i in o){
          if(!(i in r) || r[i] != o[i]){
            r[i] = dojo.clone(o[i]);
          }
        }
        return r; // Object
      }
    }
    return o; /*anything*/
  }

  dojo.trim = function(/*String*/ str){
    // summary: trims whitespaces from both sides of the string
    // description:
    //	This version of trim() was selected for inclusion into the base
    //	due to its compact size and relatively good performance (see Steven Levithan's blog: 
    //	http://blog.stevenlevithan.com/archives/faster-trim-javascript).
    //	The fastest but longest version of this function is going to be placed in dojo.string.
    return str.replace(/^\s\s*/, '').replace(/\s\s*$/, '');	// String
  }

	dojo.mixin(dojo, {
		indexOf: function(	/*Array*/		array, 
							/*Object*/		value,
							/*Integer?*/	fromIndex,
							/*Boolean?*/	findLast){
			// summary:
			//		locates the first index of the provided value in the
			//		passed array. If the value is not found, -1 is returned.
			// description:
			//		For details on this method, see:
			// 			http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:indexOf

			var i = 0, step = 1, end = array.length;
			if(findLast){
				i = end - 1;
				step = end = -1;
			}
			for(i = fromIndex || i; i != end; i += step){
				if(array[i] == value){ return i; }
			}
			return -1;	// number
		},

		lastIndexOf: function(/*Array*/array, /*Object*/value, /*Integer?*/fromIndex){
			// summary:
			//		locates the last index of the provided value in the passed array. 
			//		If the value is not found, -1 is returned.
			// description:
			//		For details on this method, see:
			// 			http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:lastIndexOf
			return dojo.indexOf(array, value, fromIndex, true); // number
		},

		forEach: function(/*Array*/arr, /*Function*/callback, /*Object?*/obj){
			// summary:
			//		for every item in arr, call callback with that item as its
			//		only parameter.
			// description:
			//		Return values are ignored. This function
			//		corresponds (and wraps) the JavaScript 1.6 forEach method. For
			//		more details, see:
			//			http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:forEach

			// match the behavior of the built-in forEach WRT empty arrs
			if(!arr || !arr.length){ return; }

			// FIXME: there are several ways of handilng thisObject. Is
			// dojo.global always the default context?
			var _p = _getParts(arr, obj, callback); arr = _p[0];
			for(var i=0,l=_p[0].length; i<l; i++){ 
				_p[2].call(_p[1], arr[i], i, arr);
			}
		},

		_everyOrSome: function(/*Boolean*/every, /*Array*/arr, /*Function*/callback, /*Object?*/obj){
			var _p = _getParts(arr, obj, callback); arr = _p[0];
			for(var i = 0, l = arr.length; i < l; i++){
				var result = !!_p[2].call(_p[1], arr[i], i, arr);
				if(every ^ result){
					return result; // Boolean
				}
			}
			return every; // Boolean
		},

		every: function(/*Array*/arr, /*Function*/callback, /*Object?*/thisObject){
			// summary:
			//		determines whether or not every item in the array satisfies the
			//		condition implemented by callback. thisObject may be used to
			//		scope the call to callback. The function signature is derived
			//		from the JavaScript 1.6 Array.every() function. More
			//		information on this can be found here:
			//			http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:every
			// usage:
			//		dojo.every([1, 2, 3, 4], function(item){ return item>1; });
			//		// returns false
			//		dojo.every([1, 2, 3, 4], function(item){ return item>0; });
			//		// returns true 
			return this._everyOrSome(true, arr, callback, thisObject); // Boolean
		},

		some: function(/*Array*/arr, /*Function*/callback, /*Object?*/thisObject){
			// summary:
			//		determines whether or not any item in the array satisfies the
			//		condition implemented by callback. thisObject may be used to
			//		scope the call to callback. The function signature is derived
			//		from the JavaScript 1.6 Array.some() function. More
			//		information on this can be found here:
			//			http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:some
			// examples:
			//		dojo.some([1, 2, 3, 4], function(item){ return item>1; });
			//		// returns true
			//		dojo.some([1, 2, 3, 4], function(item){ return item<1; });
			//		// returns false
			return this._everyOrSome(false, arr, callback, thisObject); // Boolean
		},

		map: function(/*Array*/arr, /*Function*/func, /*Function?*/obj){
			// summary:
			//		applies a function to each element of an Array and creates
			//		an Array with the results
			// description:
			//		Returns a new array constituted from the return values of
			//		passing each element of arr into unary_func. The obj parameter
			//		may be passed to enable the passed function to be called in
			//		that scope.  In environments that support JavaScript 1.6, this
			//		function is a passthrough to the built-in map() function
			//		provided by Array instances. For details on this, see:
			// 			http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:map
			// usage:
			//		dojo.map([1, 2, 3, 4], function(item){ return item+1 });
			//		// returns [2, 3, 4, 5]
			var _p = _getParts(arr, obj, func); arr = _p[0];
			var outArr = ((arguments[3]) ? (new arguments[3]()) : []);
			for(var i=0;i<arr.length;++i){
				outArr.push(_p[2].call(_p[1], arr[i], i, arr));
			}
			return outArr; // Array
		},

		filter: function(/*Array*/arr, /*Function*/callback, /*Object?*/obj){
			// summary:
			//		returns a new Array with those items from arr that match the
			//		condition implemented by callback. ob may be used to
			//		scope the call to callback. The function signature is derived
			//		from the JavaScript 1.6 Array.filter() function.
			//
			//		More information on the JS 1.6 API can be found here:
			//			http://developer.mozilla.org/en/docs/Core_JavaScript_1.5_Reference:Global_Objects:Array:filter
			// examples:
			//		dojo.filter([1, 2, 3, 4], function(item){ return item>1; });
			//		// returns [2, 3, 4]

			var _p = _getParts(arr, obj, callback); arr = _p[0];
			var outArr = [];
			for(var i = 0; i < arr.length; i++){
				if(_p[2].call(_p[1], arr[i], i, arr)){
					outArr.push(arr[i]);
				}
			}
			return outArr; // Array
		}
	});

  dojo.fromJson = function(/*String*/ json){
    // summary:
    // 		evaluates the passed string-form of a JSON object
    // json: 
    //		a string literal of a JSON item, for instance:
    //			'{ "foo": [ "bar", 1, { "baz": "thud" } ] }'
    // return:
    //		the result of the evaluation

    // FIXME: should this accept mozilla's optional second arg?
    try {
      return eval("(" + json + ")");
    }catch(e){
      console.debug(e);
      return json;
    }
  }

  dojo._escapeString = function(/*String*/str){
    //summary:
    //		Adds escape sequences for non-visual characters, double quote and
    //		backslash and surrounds with double quotes to form a valid string
    //		literal.
    return ('"' + str.replace(/(["\\])/g, '\\$1') + '"'
      ).replace(/[\f]/g, "\\f"
      ).replace(/[\b]/g, "\\b"
      ).replace(/[\n]/g, "\\n"
      ).replace(/[\t]/g, "\\t"
      ).replace(/[\r]/g, "\\r"); // string
  }

  dojo.toJsonIndentStr = "\t";
  dojo.toJson = function(/*Object*/ it, /*Boolean?*/ prettyPrint, /*String?*/ _indentStr){
    // summary:
    //		Create a JSON serialization of an object. 
    //		Note that this doesn't check for infinite recursion, so don't do that!
    //
    // it:
    //		an object to be serialized. Objects may define their own
    //		serialization via a special "__json__" or "json" function
    //		property. If a specialized serializer has been defined, it will
    //		be used as a fallback.
    //
    // prettyPrint:
    //		if true, we indent objects and arrays to make the output prettier.
    //		The variable dojo.toJsonIndentStr is used as the indent string 
    //		-- to use something other than the default (tab), 
    //		change that variable before calling dojo.toJson().
    //
    // _indentStr:
    //		private variable for recursive calls when pretty printing, do not use.
    //		
    // return:
    //		a String representing the serialized version of the passed object.

    _indentStr = _indentStr || "";
    var nextIndent = (prettyPrint ? _indentStr + dojo.toJsonIndentStr : "");
    var newLine = (prettyPrint ? "\n" : "");
    var objtype = typeof(it);
    if(objtype == "undefined"){
      return "undefined";
    }else if((objtype == "number")||(objtype == "boolean")){
      return it + "";
    }else if(it === null){
      return "null";
    }
    if(objtype == "string"){ return dojo._escapeString(it); }
    // recurse
    var recurse = arguments.callee;
    // short-circuit for objects that support "json" serialization
    // if they return "self" then just pass-through...
    var newObj;
    if(typeof it.__json__ == "function"){
      newObj = it.__json__();
      if(it !== newObj){
        return recurse(newObj, prettyPrint, nextIndent);
      }
    }
    if(typeof it.json == "function"){
      newObj = it.json();
      if(it !== newObj){
        return recurse(newObj, prettyPrint, nextIndent);
      }
    }
    // array
    if(dojo.isArray(it)){
      var res = [];
      for(var i = 0; i < it.length; i++){
        var val = recurse(it[i], prettyPrint, nextIndent);
        if(typeof(val) != "string"){
          val = "undefined";
        }
        res.push(newLine + nextIndent + val);
      }
      return "[" + res.join(", ") + newLine + _indentStr + "]";
    }
    /*
    // look in the registry
    try {
      window.o = it;
      newObj = dojo.json.jsonRegistry.match(it);
      return recurse(newObj, prettyPrint, nextIndent);
    }catch(e){
      // console.debug(e);
    }
    // it's a function with no adapter, skip it
    */
    if(objtype == "function"){
      return null;
    }
    // generic object code path
    var output = [];
    for(var key in it){
      var keyStr;
      if(typeof(key) == "number"){
        keyStr = '"' + key + '"';
      }else if(typeof(key) == "string"){
        keyStr = dojo._escapeString(key);
      }else{
        // skip non-string or number keys
        continue;
      }
      val = recurse(it[key], prettyPrint, nextIndent);
      if(typeof(val) != "string"){
        // skip non-serializable values
        continue;
      }
      // FIXME: use += on Moz!!
      //	 MOW NOTE: using += is a pain because you have to account for the dangling comma...
      output.push(newLine + nextIndent + keyStr + ": " + val);
    }
    return "{" + output.join(", ") + newLine + _indentStr + "}";
  }
})();
