var xray_specs = (function(){
	
	return {
		
		stub: function(object, method) {
			var real_object,
				return_value,
				called_with = [],
				fn;

			fn = function() {
				fn.called++;
				fn.was_called = true;
				called_with.push(arguments);
				fn.args = arguments;

				return return_value;
			}
			
			fn.called = 0;
			fn.was_called = false;

			fn.reset = function() {
				object[method] = real_object;
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

			real_object = object[method];
			object[method] = fn;
		},
		
		mock: function(parent, name, inherits) {
			var real_object = parent[name],
				mock_object,
				that = this,
				create_mock,
				expectations;
			
			create_mock = (function() {
				var stub_methods;
				
				if(inherits) {
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