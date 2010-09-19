var xray_specs = (function(){
	
	var for_each = function(obj, fn, that) {
		for (var i = 0, l = obj.length; i < l; i++) {
			fn.call(this, obj[i]);
		}
	}
	
	return {
		
		stub: function(parent_object, method) {
			
			var real_method, 
				stubbed_function,	
				return_value,
				received,
				called = 0;
				
			received = (function() {
				
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
					calls: [],
					includes: function(params) {
						var correct = 0;
						
						for(var i = 0, l = this.calls.length; i < l; i++) {
							var current_call = this.calls[i],
								call_includes = 0;

							for_each(params, function(test_parameter) {

								if([].indexOf.call(current_call, test_parameter) !== -1) {
									call_includes++;
								}
								else if(typeof test_parameter === "string") {

									for_each(current_call, function(param) {
										check_type(param, test_parameter, function() {
											call_includes++;
										});
									});

								}
							});
							
							if (call_includes) {
								correct++;
							};
						}
						
						return correct;
					},
					matches: function(params) {
						var correct = 0;
						
						for(var i = 0; i < this.calls.length; i++) {
							var matches = 0,
								current_call = this.calls[i],
								count = 0;
								
							for_each(params, function(test_parameter) {

								if(current_call[count] === test_parameter) {
									matches++;
								}
								else if(typeof test_parameter === "string") {
									check_type(current_call[count], test_parameter, function() {
										matches++;
									});
								}
								
								count++;
							});

							if(matches === params.length && params.length === current_call.length)
							  correct++;
						}
						
						return correct;
					}
				}
			}());

			stubbed_function = function() {
				called++;
				received.calls.push(arguments);

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
				return received.includes(arguments) > 0 ? true : false;
			}
			
			stubbed_function.always_called_with = function() {		
				return received.includes(arguments) === received.calls.length ? true : false;
			}

			stubbed_function.called_with_exactly = function() {
				return received.matches(arguments) > 0 ? true : false;
			}
			
			stubbed_function.always_called_with_exactly = function() {
				return received.matches(arguments) === received.calls.length ? true : false;
			}

			if(parent_object) {
				real_method = parent_object[method];
				parent_object[method] = stubbed_function;
			}
			
			return stubbed_function;
		},
		
		
		mock: function(parent, name, inherits) {
			var real_object = parent[name],
				mock_object = inherits || {},
				that = this,
				create_mock,
				expectations;
			
			create_mock = (function() {
				
				for(var method in parent[name]) {
					mock_object[method] = real_object[method];
				}
				
				for(var method in mock_object) {
					that.stub(mock_object, method);
				}
				
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

if (typeof Object.create !== 'function') {
    Object.create = function (o) {
        function F() {}
        F.prototype = o;
        return new F();
    };
}
