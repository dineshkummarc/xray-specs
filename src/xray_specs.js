var xray_specs = (function(){
	
	return {
		stub: function(object, method) {
			var original,
				return_value,
				called = 0,
				called_with = [];

			var fn = function() {
				called++;
				fn.called = called;
				fn.was_called = true;
				called_with.push(arguments);
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
				for(var i = 0, l = called_with.length; i < l; i++) {
					for(var j = 0, l = arguments.length; j < l; j++) {
						if([].indexOf.call(called_with[i], arguments[j]) !== -1)
						  return true;
					}
				}
				
				return false;
			}

			fn.called_with_exactly = function() {
				for(var i = 0, l = called_with.length; i < l; i++) {
					var correct_call = 0;
					
					if(!called_with[i])
					  return false;
					
					for(var j = 0, l = called_with[i].length; j < l; j++) {
						if(called_with[i][j] === arguments[j])
						  correct_call++;
					}
					
					if(correct_call === called_with[i].length)
					  return true;
				}
				
				return false;
			}
			
			fn.always_called_with = function() {
				
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
						verifications.push({check: expectations.method[check], params: params});
					},
					verify: function() {
						for(var i = 0, l = this.num(); i < l; i++) {
							var check = verifications[i].check;
							
							if(typeof check === 'function') {
								if(!check.apply(this, verifications[i].params))
								  return false;
							}
							else {
								return check;
							}
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
				
				var api = {
					to_be_called: {
						times: function() {
							expectations.set('called_exactly', arguments);
							
							return api;
						},
						at_least: function() {
							expectations.set('called_at_least', arguments);
							
							return api;
						},
						at_most: function() {
							expectations.set('called_at_most', arguments);
							
							return api;
						},
						between: function(min, max) {
							this.at_least(min);
							this.at_most(max);

							return api;
						}
					},
					with_args: {
						that_match: function() {
							expectations.set('called_with_exactly', arguments);
						},
						that_include: function() {
							expectations.set('called_with', arguments);
						}
					}
				}
				
				return api;
			}
			
			mockObj.verify = function() {
				if(expectations.num() === 0)
				  expectations.set('was_called');
				
				var __return = expectations.verify();
				this.restore();
				
				return __return;
			}
		}
	}
}());