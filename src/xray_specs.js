var xray_specs = (function(){
	
	return {
		stub: function(object, method) {
			var original,
				return_value,
				called_with = [];

			var fn = function() {
				fn.called++;
				fn.was_called = true;
				called_with.push(arguments);
				fn.args = arguments;

				return return_value;
			}
			
			fn.called = 0;
			fn.was_called = false;

			fn.reset = function() {
				object[method] = original;
			}

			fn.returns = function(value) {
				return_value = value;
			}

			fn.called_at_least = function(times) {
				return times <= fn.called ? true : false;
			}

			fn.called_at_most = function(times) {
				return times >= fn.called ? true : false;
			}

			fn.called_exactly = function(times) {
				return times === fn.called ? true : false;
			}

			fn.called_with = function() {
				for(var i = 0, l = called_with.length; i < l; i++) {
					for(var j = 0, l = arguments.length; j < l; j++) {
						if([].indexOf.call(called_with[i], arguments[j]) !== -1) {
							return true;
						}
						else if(typeof arguments[j] === "string") {
							if(arguments[j].indexOf("type::") === 0) {
								var type = arguments[j].substring(6);

								for(var k = 0; k < called_with[i].length; k++) {
									if(typeof called_with[i][k] === type)
									  return true;
								}
							}
						}
					}
				}
				
				return false;
			}

			fn.called_with_exactly = function() {
				for(var i = 0; i < called_with.length; i++) {
					var correct_call = 0;
					
					for(var j = 0, l = arguments.length; j < l; j++) {
						if(called_with[i][j] === arguments[j]) {
							correct_call++;
						}
						else if(typeof arguments[j] === "string") {
							if(arguments[j].indexOf("type::") === 0) {
								var type = arguments[j].substring(6);
								
								if(typeof called_with[i][j] === type)
								  correct_call++;
							}
						}
					}
					
					if(correct_call === arguments.length && arguments.length === called_with[i].length)
					  return true;
				}
				
				return false;
			}
			
			fn.always_called_with = function() {
				var correct_calls = 0;
				
				for(var i = 0; i < called_with.length; i++) {
					var called = false;
					
					for(var j = 0, l = arguments.length; j < l; j++) {
						if([].indexOf.call(called_with[i], arguments[j]) !== -1)
						  called = true;
					}
					
					if(called)
					  correct_calls++;
				}
				
				if(correct_calls === called_with.length)
				  return true;
				
				return false;
			}
			
			fn.always_called_with_exactly = function() {
				var correct_calls = 0;
				
				for(var i = 0; i < called_with.length; i++) {
					var calls = 0;
					
					if(!called_with[i]) {
						jstestdriver.console.log(called_with, i);
						return false;
					}
					
					for(var j = 0, l = called_with[i].length; j < l; j++) {
						if(called_with[i][j] === arguments[j])
						  calls++;
					}
					
					if(calls === called_with[i].length)
					  correct_calls++
				}
				
				if(correct_calls === called_with.length)
				  return true;
				
				return false;
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
					add: function(check, params) {
						verifications.push({check: expectations.method[check], params: params});
					},
					verify: function() {
						if(verifications.length === 0)
						  this.add('was_called');
						
						for(var i = 0, l = verifications.length; i < l; i++) {
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
					}
				}
			}());
			
			mockObj.reset = function() {
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
							expectations.add('called_exactly', arguments);
							
							return api;
						},
						at_least: function() {
							expectations.add('called_at_least', arguments);
							
							return api;
						},
						at_most: function() {
							expectations.add('called_at_most', arguments);
							
							return api;
						},
						between: function(min, max) {
							this.at_least(min);
							this.at_most(max);

							return api;
						}
					},
					with_args: {
						matching: function() {
							expectations.add('called_with_exactly', arguments);
						},
						including: function() {
							expectations.add('called_with', arguments);
						},
						always_matching: function() {
							expectations.add('always_called_with_exactly', arguments);
						},
						always_including: function() {
							expectations.add('always_called_with', arguments);
						}
					}
				}
				
				return api;
			}
			
			mockObj.verify = function() {				
				var __return = expectations.verify();
				this.reset();
				
				return __return;
			}
		}
	}
}());