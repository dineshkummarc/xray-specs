var xray_specs = (function(){
	
	return {
		
		stub: function(parent_object, method) {
			var real_method,
				stubbed_method,
				return_value,
				recorded_calls = [],
				called = 0;

			stubbed_method = function() {
				called++;
				stubbed_method.was_called = true;
				recorded_calls.push(arguments);
				stubbed_method.args = arguments;

				return return_value;
			}
			
			stubbed_method.was_called = false;

			stubbed_method.reset = function() {
				parent_object[method] = real_method;
			}

			stubbed_method.returns = function(value) {
				return_value = value;
			}

			stubbed_method.called_at_least = function(times) {
				return times <= called ? true : false;
			}

			stubbed_method.called_at_most = function(times) {
				return times >= called ? true : false;
			}

			stubbed_method.called_exactly = function(times) {
				return times === called ? true : false;
			}

			stubbed_method.called_with = function() {
				for(var i = 0, l = recorded_calls.length; i < l; i++) {
					for(var j = 0, l = arguments.length; j < l; j++) {
						if([].indexOf.call(recorded_calls[i], arguments[j]) !== -1) {
							return true;
						}
						else if(typeof arguments[j] === "string") {
							if(arguments[j].indexOf("type::") === 0) {
								var type = arguments[j].substring(6);

								for(var k = 0; k < recorded_calls[i].length; k++) {
									if(typeof recorded_calls[i][k] === type)
									  return true;
								}
							}
						}
					}
				}
				
				return false;
			}

			stubbed_method.called_with_exactly = function() {
				for(var i = 0; i < recorded_calls.length; i++) {
					var correct_call = 0;
					
					for(var j = 0, l = arguments.length; j < l; j++) {
						if(recorded_calls[i][j] === arguments[j]) {
							correct_call++;
						}
						else if(typeof arguments[j] === "string") {
							if(arguments[j].indexOf("type::") === 0) {
								var type = arguments[j].substring(6);
								
								if(typeof recorded_calls[i][j] === type)
								  correct_call++;
							}
						}
					}
					
					if(correct_call === arguments.length && arguments.length === recorded_calls[i].length)
					  return true;
				}
				
				return false;
			}
			
			stubbed_method.always_called_with = function() {
				var correct_calls = 0;
				
				for(var i = 0; i < recorded_calls.length; i++) {
					var called = false;
					
					for(var j = 0, l = arguments.length; j < l; j++) {
						if([].indexOf.call(recorded_calls[i], arguments[j]) !== -1)
						  called = true;
					}
					
					if(called)
					  correct_calls++;
				}
				
				if(correct_calls === recorded_calls.length)
				  return true;
				
				return false;
			}
			
			stubbed_method.always_called_with_exactly = function() {
				var correct_calls = 0;
				
				for(var i = 0; i < recorded_calls.length; i++) {
					var calls = 0;
					
					for(var j = 0, l = recorded_calls[i].length; j < l; j++) {
						if(recorded_calls[i][j] === arguments[j])
						  calls++;
					}
					
					if(calls === recorded_calls[i].length)
					  correct_calls++
				}
				
				if(correct_calls === recorded_calls.length)
				  return true;
				
				return false;
			}

			if(!parent_object)
			  return stubbed_method;

			real_method = parent_object[method];
			parent_object[method] = stubbed_method;
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
							if(!check.apply(this, verifications[i].params))
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
						  this.add('was_called');
						
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