TestCase("stubbing", {
	setUp: function(){
		sut = {};
		xray_specs.stub(sut, "some_method");
	},
	"test that stubs are created on the target object": function(){
		assertEquals(typeof sut.some_method, "function");
	},
	"test that the stubbed function is removed when reset is called": function(){
		sut.some_method.reset();
		
		assertEquals("undefined", typeof sut.some_method);
	},
	"test that original functions are resetd": function(){
		var original = sut.another_method = function() {};
		xray_specs.stub(sut, "another_method");
		sut.another_method.reset();
		
		assertEquals(original, sut.another_method);
	},
	"test that it returns an anonymous function if no object reference is provided": function(){
		var anonStub = xray_specs.stub();
		
		assertEquals("function", typeof anonStub);
	},
	"test that a stub returns the supplied value": function(){
		sut.some_method.returns("hello");
		
		assertEquals("hello", sut.some_method());
	},
	"test that a stub records the number of times it is called": function(){
		sut.some_method();
		
		assertEquals(1, sut.some_method.called);
		
		sut.some_method();
		sut.some_method();
		
		assertEquals(3, sut.some_method.called);
	},
	"test that was_called returns true if called": function(){
		sut.some_method();
		assertTrue(sut.some_method.was_called);
	},
	"test that was_called returns false if not called": function(){
		assertFalse(sut.some_method.was_called);
	},
	"test that called_at_least returns true if below threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertTrue(sut.some_method.called_at_least(3));
	},
	"test that called_at_least returns false if above threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertFalse(sut.some_method.called_at_least(5));
	},
	"test that called_at_most returns true if call number is above threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertTrue(sut.some_method.called_at_most(3));
	},
	"test that called_at_most returns false if call number is below threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertFalse(sut.some_method.called_at_most(1));
	},
	"test called_exactly returns true if called that many times": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertTrue(sut.some_method.called_exactly(3));
	},
	"test called_exactly returns false if not called that many times": function(){
		sut.some_method();
		
		assertFalse(sut.some_method.called_exactly(3));
	},
	"test that a stub records the arguments that it is called with": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertEquals(["bread", "milk", "eggs"], sut.some_method.args);
	},
	"test that called_with returns true if any arguments match": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertTrue(sut.some_method.called_with("eggs"));
		assertTrue(sut.some_method.called_with("bread", "milk", "eggs"));
		assertTrue(sut.some_method.called_with("fire", "milk", "bread"));
	},
	"test that called with returns false if none of the arguments match": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse(sut.some_method.called_with("fire", "death"));
	},
	"test that called_with passes if arguments have been called at some point": function(){
		sut.some_method("bread", "milk", "eggs");
		sut.some_method("some", "other", "stuff");
		
		assertTrue(sut.some_method.called_with("bread", "milk", "eggs"));
	},
	"test that caled_with_exactly returns true if arguments are the same": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertTrue(sut.some_method.called_with_exactly('bread', 'milk', 'eggs'));
	},
	"test that caled_with_exactly returns false if arguments are not the same": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse(sut.some_method.called_with_exactly('bread', 'milk', 'flour'));
	},
	"test that caled_with_exactly returns false if not all arguments are present": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse(sut.some_method.called_with_exactly('bread', 'milk'));
	},
	"test that called_with_exactly returns false if arguments are not called in the same order": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse("message", sut.some_method.called_with_exactly('eggs', 'bread', 'milk'));
	},
	"test that called_with_exactly return true if arguments match exactly at some point": function(){
		sut.some_method("bread", "milk", "eggs");
		sut.some_method("some", "other", "stuff");
		
		assertTrue(sut.some_method.called_with_exactly("bread", "milk", "eggs"));
	},
	"test always_called_with returns true if arguments match for each call": function(){
		sut.some_method("bread", "milk", "eggs");
		sut.some_method("bread");
		sut.some_method("milk", "eggs");
		
		assertTrue(sut.some_method.always_called_with("bread", "milk", "eggs"));
	},
	"test always_called_with returns false if arguments don't match for every call": function(){
		sut.some_method("bread", "milk", "eggs");
		sut.some_method("some", "other", "stuff");
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse(sut.some_method.always_called_with("bread", "milk", "eggs"));
	},
	"test always_called_with_exactly returns true if arguments match exactly for every call made": function(){
		sut.some_method("bread", "milk", "eggs");
		sut.some_method("bread", "milk", "eggs");
		sut.some_method("bread", "milk", "eggs");
		
		assertTrue(sut.some_method.always_called_with_exactly("bread", "milk", "eggs"));
	},
	"test always_called_with_exactly returns false if arguments do not match exactly for every call made": function(){
		sut.some_method("bread", "milk", "eggs");
		sut.some_method("bread");
		sut.some_method("milk", "eggs");
		
		assertFalse(sut.some_method.always_called_with_exactly("bread", "milk", "eggs"));
	}
});

TestCase("mock setup", {
	setUp: function(){
		namespace = {
			sut: {}
		};
		
		xray_specs.mock(namespace, 'collaborator', {
			some_method: function(){},
			another_method: function(){}
		});
	},
	"test that object is created when mocked": function(){
		assertObject(namespace.collaborator);
	},
	"test that the mock inherits the supplied object": function(){
		assertFunction(namespace.collaborator.some_method);
		assertFunction(namespace.collaborator.another_method);
	},
	"test that an empty object is created if no structure is defined": function(){
		xray_specs.mock(namespace, "anonymous");
		
		assertObject(namespace.anonymous);
	},
	"test that the mock is removed when reset is called": function(){
		namespace.collaborator.reset();
		
		assertUndefined(namespace.collaborator);
	},
	"test that reset is called when mock is verified": function(){
		namespace.collaborator.expects('some_method');
		namespace.collaborator.verify();
		
		assertUndefined(namespace.collaborator);
	},
	"test that an object is created with the originals structure if defined": function(){
		namespace.exisisting_object = {
			do_something: function(){},
			calculate: function(){}
		};
		
		xray_specs.mock(namespace, "exisisting_object");

		assertFunction(namespace.exisisting_object.do_something);
		assertFunction(namespace.exisisting_object.calculate);
	},
	"test that the original object is resetd when mock.reset is called": function(){
		namespace.exisisting_object = function(){
			// I'm already here.
		}
		
		var original = namespace.exisisting_object;
		
		xray_specs.mock(namespace, "exisisting_object", {
			some_method: function(){},
			another_method: function(){}
		});
		
		namespace.exisisting_object.reset();
		
		assertEquals(original, namespace.exisisting_object);
	}
});

TestCase("mock call expectations", {
	setUp: function(){
		namespace = {
			sut: {}
		};
		
		xray_specs.mock(namespace, "collaborator", {
			some_method: function(){},
			another_method: function(){}
		});
	},
	"test that a stub is created if expects is called on undefined function": function(){		
		namespace.collaborator.expects("a_new_method");
		namespace.collaborator.a_new_method();
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that expects returns true if specified method is called": function(){
		namespace.collaborator.expects("another_method");
		namespace.collaborator.another_method();

		assertTrue(namespace.collaborator.verify());
	},
	"test that expects returns false if specified method is not called": function(){
		namespace.collaborator.expects("another_method");
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.times passes if called the correct number of times": function(){
		namespace.collaborator.expects("another_method").to_be_called.times(3);
		
		for(var i = 0; i < 3; i++) {
			namespace.collaborator.another_method();
		}
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that expects.times fails if called too few times": function(){
		namespace.collaborator.expects("another_method").to_be_called.times(3);
		
		for(var i = 0; i < 2; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.times fails if called too many times": function(){
		namespace.collaborator.expects("another_method").to_be_called.times(3);
		
		for(var i = 0; i < 5; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.atLeast() should returns false if not called enough times": function(){
		namespace.collaborator.expects("another_method").to_be_called.at_least(3);
		
		for(var i = 0; i < 2; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.atLeast() should returns true if not called enough times": function(){
		namespace.collaborator.expects("another_method").to_be_called.at_least(3);
		
		for(var i = 0; i < 4; i++) {
			namespace.collaborator.another_method();
		}
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that expects.atMost() returns true if called less than threshold": function(){
		namespace.collaborator.expects("another_method").to_be_called.at_most(3);
		
		for(var i = 0; i < 3; i++) {
			namespace.collaborator.another_method();
		}
		
		assertTrue(namespace.collaborator.verify());
	},
	"test description of functionality": function(){
		namespace.collaborator.expects("another_method").to_be_called.at_most(3);
		
		for(var i = 0; i < 5; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.between() to returns false if called less than minimum": function(){
		namespace.collaborator.expects("another_method").to_be_called.between(3, 5);
		
		for(var i = 0; i < 2; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.between() to returns false if called more than maximum": function(){
		namespace.collaborator.expects("another_method").to_be_called.between(3, 5);
		
		for(var i = 0; i < 7; i++) {
			namespace.collaborator.another_method();
		}		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.between() to returns true if called between minimum and maximum": function(){
		namespace.collaborator.expects("another_method").to_be_called.between(3, 5);
		
		for(var i = 0; i < 5; i++) {
			namespace.collaborator.another_method();
		}
		
		assertTrue(namespace.collaborator.verify());
	}
});

TestCase("mock argument expectations", {
	setUp: function(){
		namespace = {
			sut: {}
		};

		xray_specs.mock(namespace, 'collaborator', {
			some_method: function(){},
			another_method: function(){}
		});
	},
	"test that that_match returns true if verification matches called arguments": function(){
		namespace.collaborator.expects("some_method")
			.with_args.matching("so", "much", "style", "that", "it's", "wasting");
		
		namespace.collaborator.some_method("so", "much", "style", "that", "it's", "wasting");
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that that_match returns false if verification do not match called arguments": function(){
		namespace.collaborator.expects("some_method")
			.with_args.matching("so", "much", "style", "that", "it's", "wasting");
		
		namespace.collaborator.some_method("but", "you", "can", "never", "quarantine", "the", "past");
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that_match returns false if all arguments do not match": function(){
		namespace.collaborator.expects("some_method")
			.with_args.matching("so", "much", "style", "that", "it's", "wasting");
		
		namespace.collaborator.some_method("so", "much", "style");
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that_include returns true if any arguments match": function(){
		namespace.collaborator.expects('some_method')
			.with_args.including("so", "much", "style", "that", "it's", "wasting");
		
		namespace.collaborator.some_method("so", "much", "style");
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that_include returns false if all don't arguments match": function(){
		namespace.collaborator.expects('some_method')
			.with_args.including("so", "much", "style", "that", "it's", "wasting");
						
		namespace.collaborator.some_method("but", "you", "can");
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that it still fails if not called the correct number of times with the correct arguments": function(){
		namespace.collaborator.expects('some_method')
			.to_be_called.times(3)
				.with_args.matching("so", "much", "style", "that", "it's", "wasting");
		
		for (var i=0; i < 3; i++) {
			namespace.collaborator.some_method("so", "much", "style", "that", "it's", "wasting");
		};
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that it still fails if not called the correct number of times": function(){
		namespace.collaborator.expects('some_method')
			.to_be_called.times(3)
				.with_args.matching("so", "much", "style", "that", "it's", "wasting");
		
		for (var i=0; i < 2; i++) {
			namespace.collaborator.some_method("so", "much", "style", "that", "it's", "wasting");
		};
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that_match passes if matched for any call": function(){
		namespace.collaborator.expects('some_method')
			.to_be_called.times(3)
				.with_args.matching("so", "much", "style", "that", "it's", "wasting");
		
		namespace.collaborator.some_method("so", "much", "style", "that", "it's", "wasting");
		
		for (var i=0; i < 2; i++) {
			namespace.collaborator.some_method("but", "you", "can", "never", "quarantine", "the", "past");
		};
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that_match fails if not matched by any arguments called": function(){
		namespace.collaborator.expects('some_method')
			.to_be_called.times(3)
				.with_args.matching("so", "much", "style", "that", "it's", "wasting");
				
		for (var i=0; i < 3; i++) {
			namespace.collaborator.some_method("but", "you", "can", "never", "quarantine", "the", "past");
		};
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that always_matching passes if every call matches": function(){
		namespace.collaborator.expects('some_method')
			.to_be_called.times(3)
				.with_args.always_matching("so", "much", "style", "that", "it's", "wasting");
				
		for (var i=0; i < 3; i++) {
			namespace.collaborator.some_method("so", "much", "style", "that", "it's", "wasting");
		};
		
		assertTrue(namespace.collaborator.verify());
	}
});