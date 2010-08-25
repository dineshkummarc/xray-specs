TestCase("stubbing", {
	setUp: function(){
		sut = {};
		xrayspex.stub(sut, "some_method");
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
		xrayspex.stub(sut, "another_method");
		sut.another_method.restore();
		
		assertEquals(original, sut.another_method);
	},
	"test that it returns an anonymous function if no object reference is provided": function(){
		var anonStub = xrayspex.stub();
		
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
	"test that calledWith returns false if arguments aren't found": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse(sut.some_method.calledWith("fire", "death"));
	},
	"test that callWithExactly returns true if arguments match exactly": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertTrue(sut.some_method.calledWithExactly("bread", "milk", "eggs"));
	},
	"test that callWithExactly returns false if arguments do not match exactly": function(){
		sut.some_method("bread", "milk", "eggs");
		
		assertFalse(sut.some_method.calledWithExactly("bread", "eggs", "fire"));
		assertFalse(sut.some_method.calledWithExactly("bread", "eggs"));
	}
});
