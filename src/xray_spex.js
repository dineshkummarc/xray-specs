var xrayspex = (function(){
	
	return {
		stub: function(object, method) {
			var original,
				returnValue,
				called = 0;

			var fn = function() {
				called++;
				fn.called = called;
				fn.wasCalled = true;
				fn.args = arguments;
				
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
					for(var i = 0, l = arguments.length; i < l; i++) {
						return [].indexOf.call(fn.args, arguments[i]) !== -1 ? true : false;
					}
				}

				fn.calledWithExactly = function() {
					var callList = [];

					for(var i = 0, l = arguments.length; i < l; i++) {
						if([].indexOf.call(fn.args, arguments[i]) !== -1) {
							callList.push(arguments[i]);
						}
						else {
							return false;
						}
					}

					return callList.length === fn.args.length ? true : false;
				}

				return returnValue;
			}

			if(!object)
			  return fn;

			original = object[method];
			object[method] = fn;
		},
		mock: function() {

		}
	}
}());