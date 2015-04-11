<?php

namespace Lennert\Provider\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Silex\ControllerCollection;

abstract class CustomController implements ControllerProviderInterface {
    /**
     * Sends the data as a response
     * @param  [Object] $data The response content.
     * @return [Object]       The response.
     */
    public function ok($data) {
        $response = new \Bramus\Http\RestResponse();
        if ($data != false || is_array($data)) {
            $response->setContent($data);
        } else {
            $response->setStatus(404);
        }
        return $response->finish();
    }

    /**
     * Validates the input. Returns the parsed inputs on success, a restresponse otherwise.
     * example regexes: double: '/\d+(\\.\\d+)?/', string: '/[\\w ]+/'
     * @param  [array]        $values An associative array with the key and a regex it should match.
     * @return [array|Object]         An arrawy with the parsed input or a restresponse. (check with is_array())
     */
    public function validateInput($values) {
        $input = json_decode(file_get_contents('php://input'), true);
        $result = array();
        foreach ($values as $key => $regex) {
            $value = isset($input[$key]) ? $input[$key] : '';
            if (preg_match($regex, $value)) {
                $result[$key] = trim($value);
            } else {
                $response = new \Bramus\Http\RestResponse();
                $response->setStatus(412);
                $response->setContent($key . " is a required field and should match " . $regex . ".");
                return $response->finish();
            }
        }
        return $result;
    }

    /**
     * Validates an authorisation token in the header.
     * @param  \Symfony\Component\HttpFoundation\Request $request The request.
     * @param  Application                               $app     The application.
     * @return [type]                                             A 401 unauthorized if the token is invalid.
     */
    public function authorise(\Symfony\Component\HttpFoundation\Request $request, Application $app) {
        $token = $app['request']->headers->get('auth-token');
        $app['user'] = $app['db.players']->authorise($token);

        if ($app['user'] == false) {
            $response = new \Bramus\Http\RestResponse();
            $response->setStatus(401);
            $response->setContent("A valid authorisation token is required to call this route.");
            return $response->finish();
        }
    }

    /**
     * Validates an api key in the header.
     * @param  \Symfony\Component\HttpFoundation\Request $request The request.
     * @param  Application                               $app     The application.
     * @return [type]                                             A 401 unauthorized if no key is present.
     */
    public function validateApiKey(\Symfony\Component\HttpFoundation\Request $request, Application $app) {
        if ($app['request']->headers->get('X-Api-Key') === null) {
            $response = new \Bramus\Http\RestResponse();
            $response->setStatus(401);
            $response->setContent("An API key is required to call this API. Provide your API Key via an \"X-Api-Key\" header.");
            return $response->finish();
        }
    }
}