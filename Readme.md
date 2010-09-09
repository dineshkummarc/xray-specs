
# Xray Specs

A simple, light-weight mocking library for javascript applications.

# Mocking

## Basic usage

	example = {
		sut: {}
	};

	xray_specs.mock(example, 'collaborating_object', {
		some_method: {},
		another_method: {}
	});



	