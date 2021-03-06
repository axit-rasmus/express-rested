'use strict';

const test = require('tape');
const createServer = require('./helpers/server');
const rested = require('..');


test('No rights', function (t) {
	const options = {
		rights: {
			create: false,
			// read: false, (everything should default to false, so test one without value)
			update() {
				return false;
			},
			delete: false
		}
	};

	let server, collection, http, route, Beer;

	t.test('Start REST server (without body parser)', function (t) {
		createServer(t, options, function (_server, _collection, _http, _route) {
			server = _server;
			collection = _collection;
			http = _http;
			route = _route;
			Beer = collection.Class;
			t.end();
		});
	});

	const heineken = {
		name: 'Heineken',
		rating: 1
	};

	const id = 'Heineken';

	t.test('Injecting Heineken into collection through the backdoor', function (t) {
		const resource = new Beer(id, heineken);
		collection.set(id, resource, function (error) {
			t.ifError(error, 'No error');
			t.ok(collection.has(id), 'Heineken in collection');
			t.end();
		});
	});

	t.test('GET /rest/beer/Heineken', function (t) {
		http.get(t, '/rest/beer/Heineken', function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('POST /rest/beer (Heineken)', function (t) {
		http.post(t, '/rest/beer', heineken, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('PUT /rest/beer/FooBar', function (t) {
		http.put(t, '/rest/beer/FooBar', heineken, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('PUT /rest/beer/Heineken', function (t) {
		http.put(t, '/rest/beer/Heineken', heineken, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('PATCH /rest/beer/Heineken', function (t) {
		http.patch(t, '/rest/beer/Heineken', heineken, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('PUT /rest/beer (update)', function (t) {
		http.put(t, '/rest/beer', { Heineken: heineken }, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('PUT /rest/beer (new)', function (t) {
		http.put(t, '/rest/beer', { foobar: heineken }, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('PUT /rest/beer (removal)', function (t) {
		http.put(t, '/rest/beer', {}, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('DELETE /rest/beer/Heineken', function (t) {
		http.delete(t, '/rest/beer/Heineken', function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('DELETE /rest/beer', function (t) {
		http.delete(t, '/rest/beer', function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not found)');
			t.end();
		});
	});

	t.test('GET /rest/beer-no-read/Heineken (no read allowed)', function (t) {
		route(collection, '/beer-no-read', {
			rights: {
				read: false,
				create: true,
				update: true,
				delete: true
			}
		});

		collection.loadOne(id, heineken);

		http.get(t, '/rest/beer-no-read/Heineken', function (data, res) {
			t.equal(res.statusCode, 405, 'HTTP status 405 (Method Not Allowed)');
			t.equal(res.headers.allow, 'POST, PUT, PATCH, DELETE', 'Allow methods conveyed');
			t.end();
		});
	});

	t.test('POST /rest/beer-no-create (no create allowed)', function (t) {
		collection.del(id);

		route(collection, '/beer-no-create', {
			rights: {
				read: true,
				create: false,
				update: true,
				delete: true
			}
		});

		http.post(t, '/rest/beer-no-create', heineken, function (data, res) {
			t.equal(res.statusCode, 405, 'HTTP status 405 (Method Not Allowed)');
			t.equal(res.headers.allow, 'GET, HEAD, PUT, PATCH, DELETE', 'Allow methods conveyed');
			t.end();
		});
	});

	t.test('PUT /rest/beer-no-create2/Heineken (no create allowed)', function (t) {
		collection.del(id);

		route(collection, '/beer-no-create2', {
			rights: {
				read: true,
				create: false,
				update: true,
				delete: true
			}
		});

		http.put(t, '/rest/beer-no-create2/' + id, heineken, function (data, res) {
			t.equal(res.statusCode, 405, 'HTTP status 405 (Method Not Allowed)');
			t.equal(res.headers.allow, 'GET, HEAD, PUT, PATCH, DELETE', 'Allow methods conveyed');
			t.end();
		});
	});

	t.test('PUT /rest/beer-no-update/Heineken (no update allowed)', function (t) {
		route(collection, '/beer-no-update', {
			rights: {
				read: true,
				create: true,
				update: false,
				delete: true
			}
		});

		collection.loadOne(id, heineken);

		http.put(t, '/rest/beer-no-update/' + id, heineken, function (data, res) {
			t.equal(res.statusCode, 405, 'HTTP status 405 (Method Not Allowed)');
			t.equal(res.headers.allow, 'GET, HEAD, POST, PUT, DELETE', 'Allow methods conveyed');
			t.end();
		});
	});

	t.test('PATCH /rest/beer-no-update/Heineken (no update allowed)', function (t) {
		route(collection, '/beer-no-update', {
			rights: {
				read: true,
				create: true,
				update: false,
				delete: true
			}
		});

		collection.loadOne(id, heineken);

		http.patch(t, '/rest/beer-no-update/' + id, heineken, function (data, res) {
			t.equal(res.statusCode, 405, 'HTTP status 405 (Method Not Allowed)');
			t.equal(res.headers.allow, 'GET, HEAD, POST, PUT, DELETE', 'Allow methods conveyed');
			t.end();
		});
	});

	t.test('DELETE /rest/beer-no-delete/Heineken (no delete allowed)', function (t) {
		route(collection, '/beer-no-delete', {
			rights: {
				read: true,
				create: true,
				update: true,
				delete: false
			}
		});

		collection.loadOne(id, heineken);

		http.delete(t, '/rest/beer-no-delete/' + id, function (data, res) {
			t.equal(res.statusCode, 405, 'HTTP status 405 (Method Not Allowed)');
			t.equal(res.headers.allow, 'GET, HEAD, POST, PUT, PATCH', 'Allow methods conveyed');
			t.end();
		});
	});

	t.test('Error handling', function (t) {
		let errors = 0;

		rested.on('error', function (error) {
			if (!error) {
				t.fail('No Error object when "error" emitted');
			}
			errors += 1;
		});

		function explode() {
			throw new Error('Whoops!');
		}

		route(collection, '/beer-explode', {
			rights: {
				create: explode,
				read: explode,
				update: explode,
				delete: explode
			}
		});

		collection.loadOne(id, heineken);

		http.get(t, '/rest/beer-explode/' + id, function (data, res) {
			t.equal(res.statusCode, 404, 'HTTP status 404 (Not Found)');

			http.post(t, '/rest/beer-explode', {}, function (data, res) {
				t.equal(res.statusCode, 404, 'HTTP status 404 (Not Found)');

				http.put(t, '/rest/beer-explode/' + id, {}, function (data, res) {
					t.equal(res.statusCode, 404, 'HTTP status 404 (Not Found)');

					http.patch(t, '/rest/beer-explode/' + id, {}, function (data, res) {
						t.equal(res.statusCode, 404, 'HTTP status 404 (Not Found)');

						http.delete(t, '/rest/beer-explode/' + id, function (data, res) {
							t.equal(res.statusCode, 404, 'HTTP status 404 (Not Found)');

							t.equal(errors, 4, 'Four errors emitted');

							rested.removeAllListeners();
							t.end();
						});
					});
				});
			});
		});
	});

	t.test('Close REST server', function (t) {
		server.close(function () {
			t.end();
		});
	});
});
