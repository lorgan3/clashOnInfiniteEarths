var app = angular.module('l3game')

.factory('Players', function($resource, apiPath, apiKey) {
    // A hack with the 2 backslashes so the regular slash doesn't get stripped. The api requires routes with a slash.
    return $resource(apiPath + '/players\\/', {}, {
        sendToken: {
            method: 'GET',
            transformResponse: function(data) { return angular.fromJson(data).content; },
            headers: { 'X-Api-Key': apiKey, 'auth-token': getCookie('token') }
        },
        signIn: {
            method: 'POST',
            transformResponse: function(data) { return angular.fromJson(data).content; },
            headers: { 'X-Api-Key': apiKey }
        },
        signUp: {
            method: 'POST',
            url: apiPath + '/players/register\\/',
            transformResponse: function(data) { return angular.fromJson(data).content; },
            headers: { 'X-Api-Key': apiKey }
        }
    });
})

.factory('Games', function($resource, apiPath, apiKey) {
    // A hack with the 2 backslashes so the regular slash doesn't get stripped. The api requires routes with a slash.
    return $resource(apiPath + '/games\\/', {}, {
        query: {
            method: 'GET',
            isArray: true,
            transformResponse: function(data) { return angular.fromJson(data).content; },
            headers: { 'X-Api-Key': apiKey }
        },
        save: {
            method: 'POST',
            transformResponse: function(data) { return angular.fromJson(data).content; },
            headers: { 'X-Api-Key': apiKey, 'auth-token': getCookie('token') }
        },
        update: {
            method: 'PUT',
            transformResponse: function(data) { return angular.fromJson(data).content; },
            headers: { 'X-Api-Key': apiKey, 'auth-token': getCookie('token') }
        },
        remove: {
            method: 'DELETE',
            transformResponse: function(data) { return angular.fromJson(data).content; },
            headers: { 'X-Api-Key': apiKey, 'auth-token': getCookie('token') }
        }
    });
});

