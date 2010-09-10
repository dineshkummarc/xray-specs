var xray_specs = (function(){
	
	var for_each = function(obj, fn, that) {
		for (var i = 0, l = obj.length; i < l; i++) {
			fn.call(this, obj[i]);
		}
	}
	
	var check_type = function(obj, type, callback) {
		if(type.indexOf("type::") === 0) {
			type = type.substring(6);

			if(typeof obj === type) {
				if(callback)
				  callback();
				
				return true;
			}
		}
	}
	
	return {
		
		stub: function(parent_object, method) {
			var real_method,
				stubbed_function,
				return_value,
				received_calls,
				called = 0;
				
			received_calls = (function() {
				return [];
			}());

			stubbed_function = function() {
				called++;
				received_calls.push(arguments);

				return return_value;
			}

			stubbed_function.reset = function() {
				parent_object[method] = real_method;
			}

			stubbed_function.returns = function(value) {
				return_value = value;
			}
			
			stubbed_function.called = function() {
				return called > 0 ? true : false;
			}

			stubbed_function.called_at_least = function(times) {
				return times <= called ? true : false;
			}

			stubbed_function.called_at_most = function(times) {
				return times >= called ? true : false;
			}

			stubbed_function.called_exactly = function(times) {
				return times === called ? true : false;
			}

			stubbed_function.called_with = function() {
				var status = false;
				
				for(var i = 0, l = received_calls.length; i < l; i++) {
					
					for_each(arguments, function(test_parameter) {					
						if([].indexOf.call(current_call, test_parameter) !== -1) {
							status = true;
						}
						else if(typeof test_parameter === "string") {
							for_each(current_call, function(param) {
								check_type(param, test_parameter, function() {
									status = true;
								});
							});
						}
					});
				}
				
				return status;
			}

			stubbed_function.called_with_exactly = function() {
				for(var i = 0; i < received_calls.length; i++) {
					var correct_calls = 0,
						current_call = received_calls[i];
					
					for(var j = 0, l = arguments.length; j < l; j++) {
						var received_parameter = current_call[j],
							test_parameter = arguments[j];
						
						if(received_parameter === test_parameter) {
							correct_calls++;
						}
						else if(typeof test_parameter === "string") {
							check_type(received_parameter, test_parameter, function() {
								correct_calls++;
							});
						}
					}
					
					if(correct_calls === arguments.length && arguments.length === current_call.length)
					  return true;
				}
				
				return false;
			}
			
			stubbed_function.always_called_with = function() {
				var correct_calls = 0;
				
				for(var i = 0; i < received_calls.length; i++) {
					var called = false;
					
					for(var j = 0, l = arguments.length; j < l; j++) {
						if([].indexOf.call(received_calls[i], arguments[j]) !== -1)
						  called = true;
					}
					
					if(called)
					  correct_calls++;
				}
				
				if(correct_calls === received_calls.length)
				  return true;
				
				return false;
			}
			
			stubbed_function.always_called_with_exactly = function() {
				var correct_calls = 0;
				
				for(var i = 0; i < received_calls.length; i++) {
					var calls = 0;
					
					for(var j = 0, l = received_calls[i].length; j < l; j++) {
						if(received_calls[i][j] === arguments[j])
						  calls++;
					}
					
					if(calls === received_calls[i].length)
					  correct_calls++
				}
				
				if(correct_calls === received_calls.length)
				  return true;
				
				return false;
			}

			if(parent_object) {
				real_method = parent_object[method];
				parent_object[method] = stubbed_function;
			}
			
			return stubbed_function;
		},
		
		mock: function(parent, name, inherits) {
			var real_object = parent[name],
				mock_object,
				that = this,
				create_mock,
				expectations;
			
			create_mock = (function() {
				var stub_methods;
				
				if(inherits && parent[name]) {
					mock_object = parent[name];
					
					for(var method in inherits) {
						mock_object[method] = inherits[method];
						that.stub(mock_object, method);
					}
				}
				else if(inherits) {
					mock_object = inherits;
				}
				else if(parent[name]) {
					mock_object = parent[name];
				}
				else {
					mock_object = {};
				}
				
				stub_methods = (function() {
					for(var method in mock_object) {
						that.stub(mock_object, method);
					}
				}());

				parent[name] = mock_object;
			}());
			
			expectations = (function(){
				var verifications = [],
					check_all_expectations;
					
				check_all_expectations = function() {
					for(var i = 0, l = verifications.length; i < l; i++) {
						var check = verifications[i].check;
						
						if(typeof check === 'function') {
							if(!check.apply(null, verifications[i].params))
							  return false;
						}
						else {
							return check;
						}
					}
				}
				
				return {
					
					add: function(check, params) {
						verifications.push({check: expectations.method[check], params: params});
					},
					
					verify: function() {
						if(verifications.length === 0)
						  this.add('called');
						
						return check_all_expectations() === false ? false : true;
					}
					
				}
				
			}());
			
			mock_object.reset = function() {
				parent[name] = real_object;
			}
			
			mock_object.expectations = {
				to_be_called: {
					times: function() {
						expectations.add('called_exactly', arguments);
						
						return mock_object.expectations;
					},
					
					at_least: function() {
						expectations.add('called_at_least', arguments);
						
						return mock_object.expectations;
					},
					
					at_most: function() {
						expectations.add('called_at_most', arguments);
						
						return mock_object.expectations;
					},
					
					between: function(min, max) {
						this.at_least(min);
						this.at_most(max);

						return mock_object.expectations;
					}
				},
				
				with_args: {
					matching: function() {
						expectations.add('called_with_exactly', arguments);
						
						return mock_object.expectations;
					},
					
					including: function() {
						expectations.add('called_with', arguments);
						
						return mock_object.expectations;
					},
					
					always_matching: function() {
						expectations.add('always_called_with_exactly', arguments);
						
						return mock_object.expectations;
					},
					
					always_including: function() {
						expectations.add('always_called_with', arguments);
						
						return mock_object.expectations;
					}
				},
				
				and_returns: function(value) {
					expectations.method.returns(value);
				}
				
			};
			
			mock_object.expects = function(spy_on) {
				if(!this[spy_on]) {
					xray_specs.stub(this, spy_on);
				}
				
				expectations.method = this[spy_on];
				
				return this.expectations;
			}
			
			mock_object.verify = function() {				
				return expectations.verify();
			}
		}
	}
}());