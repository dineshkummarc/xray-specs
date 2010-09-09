# Xray Specs

Simple mocking and stub library. I decided to write my own library because I couldn't find support for the following:

+ Create mocks and stubs on undefined objects
+ Verification by type
+ Custom expectations

See below for more information about these topics.

Full API documentation coming soon...

# Mock Objects

Mocks are used to help keep unit tests focused solely on one section of code. They do this by replacing any dependencies with intelligent objects that can record any interaction with the object under test.

## Basic usage

The following code will create a new object called `collaborator` within `example`. The third parameter is used to specify the functions that the mock will include, each of these will be replaced by a stub allowing for interactions to be recorded.

	example = {
		sut: {}
	};

	xray_specs.mock(example, 'collaborator', {
		some_method: {},
		another_method: {}
	});
	
This can then be used by telling the mock to expect a certain method call. Finally, calling verify will return true or false depending on whether all expectations have been met. In this case it will return true because `some_method` has been called.

	namespace.collaborator.expects("some_method");
	namespace.collaborator.some_method();
	
	assertTrue(namespace.collaborator.verify());
	
## Set up

There are a few different ways to set up mock objects.

Create a mock for an object that doesn't currently exist.

	example = {};

	xray_specs.mock(example, 'collaborator', {
		some_method: {},
		another_method: {}
	});
	
Create a mock based on an existing object.

	example = {
		collaborator: {
			some_method: {},
			another_method: {}
		}
	};

	xray_specs.mock(example, 'collaborator');
	
Create a mock that inherits an existing object and adds additional methods.

	example = {
		collaborator: {
			some_method: {},
			another_method: {}
		}
	};

	xray_specs.mock(example, 'collaborator', {
		do_something: {}
	});

You can also create an empty mock and dynamically add new stubbed methods as expectations are called (see below for more details).

	example = {};

	xray_specs.mock(example, 'collaborator');
	
	...
	
	namespace.collaborator.expects("a_new_method");
	
## Reset

**Mocks need to be reset after use** so that normal functionality is not permanently changed

	namespace.collaborator.reset()
	
I decided to make this a manual call because automatically resetting on verification can lead to issues when sharing mocks across tests.
	
## Call expectations

The most basic possible expectation is

	namespace.collaborator.expects("some_method");
	
which simply states that it expects `some_method` to be called at least once with any arguments.

You can also specify the number of calls that a method should receive.

	namespace.collaborator.expects("some_method")
		.to_be_called.times(3);
		
	namespace.collaborator.expects("some_method")
		.to_be_called.at_least(2);
		
	namespace.collaborator.expects("some_method")
		.to_be_called.at_most(3);
		
	namespace.collaborator.expects("some_method")
		.to_be_called.between(3, 5);
		
## Argument expectations		

Arguments that are received can also be specified. 

`matching` will only pass if all the arguments match exactly.

	namespace.collaborator.expects("some_method")
		.with_args.matching("hello", "world");
		
	namespace.collaborator.some_method("hello", "world") // PASS
	namespace.collaborator.some_method("hello") // FAIL
		
`including` is less strict and will pass if any arguments match the expectation.

	namespace.collaborator.expects("some_method")
		.with_args.matching("hello", "world");
		
	namespace.collaborator.some_method("hello", "world") // PASS
	namespace.collaborator.some_method("hello") // PASS
	namespace.collaborator.some_method() // FAIL
	
These methods can be chained on to call expectations, e.g.

	namespace.collaborator.expects("some_method")
		.to_be_called.at_least(3)
			.with_args.matching("hello", "world");

`matching` and `including` will pass if their expectations are met at least once. So the following would pass verification for the above expectations.
		
	namespace.collaborator.some_method("hello", "world");
	namespace.collaborator.some_method();
	namespace.collaborator.some_method();
	
If you want to check the same arguments are supplied every time then you can use the `always_metching` and `always_including` methods. Both work in the same way as the standard methods, but will only pass if their expectations are matched for each call.

It is also possible to check parameters by type. For example, if you want to make sure that a callback function is passed, but don't want to tie in a specific function then you could do the following:

	namespace.collaborator.expects("some_method")
		.with_args.matching("type::function");
		
	namespace.collaborator.some_method(function() {
		// I'm an anonymous function!
	});
	
The type check is initiated is the string "type::" is found. Any valid javascript type can then be supplied. This is an initial attempt at implementing type-checking and may well change, use with care.

## Custom expectations

You can also create custom expectations to make your tests more readable.

	var hello_three_times = function() {
		this.to_be_called.times(3).with_args.matching("hello");
	};

	namespace.collaborator.expectations.called_with_hello_3_times = hello_three_times;
	
	...
	
	namespace.collaborator.expects('some_method')
		.called_with_hello_3_times();

## Return values

If you need the mock to return a value after it's called you can chain a call at the end of the expectation list

	namespace.collaborator.expects('some_method')
		.and_returns("hello");
		
	var return_value = namespace.collaborator.some_method();
	
	assertEquals("hello", return_value); // PASS
	
# Stubs and Spies

The mocks in xray_specs use stubs to replace each of the methods in the target object. If you don't need to create an entire mock object you can also stub single function directly and monitor their behaviour in a similar way.

## Set up

Create a stub function on an object

	sut = {};
	xray_specs.stub(sut, "some_method");
	
Replace an existing function with a stub

	sut = {
		another_method: function() {
			
		}
	};
	
	xray_specs.stub(sut, "another_method");
	
You can also create anonymous stubs that can be passed as callbacks, etc.

	var anonStub = xray_specs.stub();

## Reset

As with mocks, **stubs must be reset after use** to ensure original state is maintained.

	sut.another_method.reset();

## Calls

Coming soon...

## Arguments

Coming soon...

## Returns

Coming soon...
	