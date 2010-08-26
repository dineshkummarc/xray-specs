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
				
				returns {
					set: function(type, params) {
						verifications.push({check: expectations.method[type], params: params});
					},
					check: function(index) {
						return verifications[index].check(verifications[index].params);
					},
					num: function() {
						return verifications.length;
					}
				}
			}());
			
			mockObj.restore = function() {
				parent[name] = original;
			}
			
			mockObj.expects = function(method) {
				expectations.method = this[method];
				
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
						//expectations.verifications.push({call: expectations.method['calledWith'], params: arguments})
					}
				}
			}
			
			mockObj.verify = function() {
				if(expectations.num === 0) {
					expectations.set('calledExactly', 1);
				}
				
				for(var i = 0; i < expectations.num; i++) {
					if(!expectations.check(i))
					  return false;
				}
				
				return true;
			}
		}
	}
}());