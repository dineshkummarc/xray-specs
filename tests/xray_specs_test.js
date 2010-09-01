TestCase("stubbing", {
	setUp: function(){
		sut = {};
		xray_specs.stub(sut, "some_method");
	},
	"test that stubs are created on the target object": function(){
		assertEquals(typeof sut.some_method, "function");
	},
	"test that the stubbed function is removed when restore is called": function(){
		sut.some_method.restore();
		
		assertEquals("undefined", typeof sut.some_method);
	},
	"test that original functions are restored": function(){
		var original = sut.another_method = function() {};
		xray_specs.stub(sut, "another_method");
		sut.another_method.restore();
		
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
	"test that wasCalled returns true if called": function(){
		sut.some_method();
		assertTrue(sut.some_method.wasCalled);
	},
	"test that wasCalled returns false if not called": function(){
		assertFalse(sut.some_method.wasCalled);
	},
	"test that calledAtLeast returns true if below threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertTrue(sut.some_method.calledAtLeast(3));
	},
	"test that calledAtLeast returns false if above threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertFalse(sut.some_method.calledAtLeast(5));
	},
	"test that calledAtMost returns true if call number is above threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertTrue(sut.some_method.calledAtMost(3));
	},
	"test that calledAtMost returns false if call number is below threshold": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertFalse(sut.some_method.calledAtMost(1));
	},
	"test calledExactly returns true if called that many times": function(){
		sut.some_method();
		sut.some_method();
		sut.some_method();
		
		assertTrue(sut.some_method.calledExactly(3));
	},
	"test calledExactly returns false if not called that many times": function(){
		sut.some_method();
		
		assertFalse(sut.some_method.calledExactly(3));
	},
	"test that a stub records the arguments that it is called with": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertEquals(["bread", "milk", "eggs"], sut.some_method.args);
	},
	"test that calledWith returns true if any arguments match": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertTrue(sut.some_method.calledWith("bread", "eggs"));
		assertTrue(sut.some_method.calledWith("bread", "milk", "eggs"));
	},
	"test that called with returns false if arguments aren't found": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse(sut.some_method.calledWith("fire", "death"));
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
	"test that the mock is removed when restore is called": function(){
		namespace.collaborator.restore();
		
		assertUndefined(namespace.collaborator);
	},
	"test that restore is called when mock is verified": function(){
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
	"test that the original object is restored when mock.restore is called": function(){
		namespace.exisisting_object = function(){
			// I'm already here.
		}
		
		var original = namespace.exisisting_object;
		
		xray_specs.mock(namespace, "exisisting_object", {
			some_method: function(){},
			another_method: function(){}
		});
		
		namespace.exisisting_object.restore();
		
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
	"test that expects allow for a number of times to be specified": function(){
		namespace.collaborator.expects("another_method").toBeCalled.times(3);
		
		for(var i = 0; i < 5; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.atLeast() should returns false if not called enough times": function(){
		namespace.collaborator.expects("another_method").toBeCalled.atLeast(3);
		
		for(var i = 0; i < 2; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.atLeast() should returns true if not called enough times": function(){
		namespace.collaborator.expects("another_method").toBeCalled.atLeast(3);
		
		for(var i = 0; i < 4; i++) {
			namespace.collaborator.another_method();
		}
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that expects.atMost() returns true if called less than threshold": function(){
		namespace.collaborator.expects("another_method").toBeCalled.atMost(3);
		
		for(var i = 0; i < 3; i++) {
			namespace.collaborator.another_method();
		}
		
		assertTrue(namespace.collaborator.verify());
	},
	"test description of functionality": function(){
		namespace.collaborator.expects("another_method").toBeCalled.atMost(3);
		
		for(var i = 0; i < 5; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.between() to returns false if called less than minimum": function(){
		namespace.collaborator.expects("another_method").toBeCalled.between(3, 5);
		
		for(var i = 0; i < 2; i++) {
			namespace.collaborator.another_method();
		}
		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.between() to returns false if called more than maximum": function(){
		namespace.collaborator.expects("another_method").toBeCalled.between(3, 5);
		
		for(var i = 0; i < 7; i++) {
			namespace.collaborator.another_method();
		}		
		assertFalse(namespace.collaborator.verify());
	},
	"test that expects.between() to returns true if called between minimum and maximum": function(){
		namespace.collaborator.expects("another_method").toBeCalled.between(3, 5);
		
		for(var i = 0; i < 5; i++) {
			namespace.collaborator.another_method();
		}
		
		assertTrue(namespace.collaborator.verify());
	},
	"test that you can chain atLeast and atMost calls": function(){
		namespace.collaborator.expects("another_method").toBeCalled.atLeast(3).atMost(5);

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
	"test that withExactArguments returns true if verification matches called arguments": function(){
		namespace.collaborator.expects("some_method").withExactArguments("so", "much", "style", "that", "it's", "wasting");
		namespace.collaborator.some_method("so", "much", "style", "that", "it's", "wasting");
		
		assertTrue(namespace.collaborator.verify());
	}
});