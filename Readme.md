
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


	
# Stubs and Spies



	