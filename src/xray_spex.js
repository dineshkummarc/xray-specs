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
			
			var expectations = (function(){
				var verifications = [];
				
				return {
					set: function(check, params) {
						verifications.push({fn: expectations.method[check], params: params});
					},
					verify: function() {
						for(var i = 0, l = this.num(); i < l; i++) {
							if(!verifications[i].fn(verifications[i].params))
							  return false;
						}
						
						return true;
					},
					num: function() {
						return verifications.length;
					}
				}
			}());
			
			mockObj.restore = function() {
				parent[name] = original;
			}
			
			mockObj.expects = function(methodName) {
				expectations.method = this[methodName];
				
				return {
					toBeCalled: {
						times: function(num) {
							expectations.set('calledExactly', num);
						},
						atLeast: function(min) {
							expectations.set('calledAtLeast', min);
							return this;
						},
						atMost: function(max) {
							expectations.set('calledAtMost', max);
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
				if(expectations.num() === 0)
				  expectations.set('calledAtLeast', 1);
				
				return expectations.verify();
			}
		}
	}
}());