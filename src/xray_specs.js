var xray_specs = (function(){
	
	return {
		stub: function(object, method) {
			var original,
				return_value,
				called = 0;

			var fn = function() {
				called++;
				fn.called = called;
				fn.was_called = true;
				fn.args = arguments;

				return return_value;
			}
			
			fn.was_called = false;

			fn.restore = function() {
				object[method] = original;
			}

			fn.returns = function(value) {
				return_value = value;
			}

			fn.called_at_least = function(times) {
				return times <= called ? true : false;
			}

			fn.called_at_most = function(times) {
				return times >= called ? true : false;
			}

			fn.called_exactly = function(times) {
				return times === called ? true : false;
			}

			fn.called_with = function() {
				for(var i = 0, l = arguments.length; i < l; i++) {
					return [].indexOf.call(fn.args, arguments[i]) !== -1 ? true : false;
				}
			}

			fn.called_with_exactly = function() {
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
		mock: function(parent, name, inherits) {
			var original = parent[name];
			var mockObj = {};
			
			if(inherits) {
				mockObj = inherits;
			}
			else if(parent[name]) {
				mockObj = parent[name];
			}
			
			for(var method in mockObj) {
				this.stub(mockObj, method);
			}
			
			parent[name] = mockObj;
			
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
				if(!this[methodName]) {
					xray_specs.stub(this, methodName);
				}
				
				expectations.method = this[methodName];
				
				return {
					to_be_called: {
						times: function(num) {
							expectations.set('called_exactly', num);
						},
						at_least: function(min) {
							expectations.set('called_at_least', min);
							return this;
						},
						at_most: function(max) {
							expectations.set('called_at_most', max);
							return this;
						},
						between: function(min, max) {
							this.at_least(min);
							this.at_most(max);
						}
					},
					with_args: function() {
						var methods = {
							that_match_exactly: function() {
								expectations.set('called_with_exactly', arguments);
							}
						}
						
						if(arguments) {
							methods.that_match_exactly(arguments);
						}
						else {
							return methods;
						}
					}
				}
			}
			
			mockObj.verify = function() {
				if(expectations.num() === 0)
				  expectations.set('called_at_least', 1);
				
				var __return = expectations.verify();
				this.restore();
				
				return __return;
			}
		}
	}
}());