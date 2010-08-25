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
			
			for(var i = 0; i < arguments.length; i++) {
				for(var j = 0; j < fn.args.length; j++) {
					return arguments[i] === fn.args[j] ? true : false
				}
			}
		}
		
		if(!object)
		  return fn;
		
		original = object[method];
		object[method] = fn;
	}
}