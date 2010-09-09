
# Xray Specs

A simple, light-weight mocking library for javascript applications.

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
		
	namespace.collaborator("hello", "world") // PASS
	namespace.collaborator("hello") // FAIL
		
`including` is less strict and will pass if any arguments match the expectation.

	namespace.collaborator.expects("some_method")
		.with_args.matching("hello", "world");
		
	namespace.collaborator("hello", "world") // PASS
	namespace.collaborator("hello") // PASS
	namespace.collaborator() // FAIL
	
These methods can be chained on to call expectations, e.g.

	namespace.collaborator.expects("some_method")
		.to_be_called.at_least(3)
			.with_args.matching("hello", "world");

`matching` and `including` will pass if their expectations are met at least once. So the following would pass verification for the above expectations.
		
	namespace.collaborator("hello", "world");
	namespace.collaborator();
	namespace.collaborator();
	
If you want to check the same arguments are supplied every time then you can use the `always_metching` and `always_including` methods. Both work in the same way as the standard methods, but will only pass if their expectations are matched for each call.
	
# Stubs and Spies



	