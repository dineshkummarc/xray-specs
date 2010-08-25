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

				return returnValue;
			}
			
			fn.wasCalled = false;

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

			if(!object)
			  return fn;

			original = object[method];
			object[method] = fn;
		},
		mock: function(parent, name, object) {
			var original = parent[name];
			var mockObj = parent[name] = object || {};
			
			for(var method in mockObj) {
				this.stub(mockObj, method);
			}
			
			var expectations = {
				verifications: []
			};
			
			mockObj.restore = function() {
				parent[name] = original;
			}
			
			mockObj.expects = function(method) {
				expectations.method = this[method];
				
				return {
					toBeCalled: {
						times: function(num) {
							expectations.verifications.push({call: expectations.method['calledExactly'], params: num});
						},
						atLeast: function(min) {
							expectations.verifications.push({call: expectations.method['calledAtLeast'], params: min});
							return this;
						},
						atMost: function(max) {
							expectations.verifications.push({call: expectations.method['calledAtMost'], params: max});
							return this;
						},
						between: function(min, max) {
							this.atLeast(min);
							this.atMost(max);
						}
					},
					withArguments: function() {
						
					}
				}
			}
			
			mockObj.verify = function() {
				if(expectations.verifications.length === 0) {
					expectations.verifications = [{call: expectations.method['calledExactly'], params: 1}]
				}
				
				for(var i = 0; i < expectations.verifications.length; i++) {
					if(!expectations.verifications[i].call(expectations.verifications[i].params))
					  return false;
				}
				
				return true;
			}
		}
	}
}());