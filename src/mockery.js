var mockery = {
	stub: function(object, method) {
		var original,
			returnValue,
			called = 0;
		
		var fn = function() {
			called++;
			fn.called = called;
			fn.wasCalled = true;
			fn.args = arguments;
			
			return returnValue;
		}
		
		fn.restore = function() {
			object[method] = original;
		}
		
		fn.returns = function(value) {
			returnValue = value;
		}
		
		fn.calledAtLeast = function(times) {
			return times <= called ? true : false;
		}
		
		fn.calledAtMost = function(times) {
			return times >= called ? true : false;
		}
		
		fn.calledExactly = function(times) {
			return times === called ? true : false;
		}
		
		fn.calledWith = function() {
			var contains = false;
			
			for(var i = 0; i < fn.args.length; i++) {
				for(var j = 0; j < arguments.length; j++) {
					if(fn.args[i] === arguments[j])
					  contains = true;
				}
			}
			
			return contains;
		}
		
		if(!object)
		  return fn;
		
		original = object[method];
		object[method] = fn;
	}
}