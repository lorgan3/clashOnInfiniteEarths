<?php

namespace Lennert\Provider\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Silex\ControllerCollection;

class Players extends CustomController {

    public function connect(Application $app) {

        // Create new ControllerCollection
        $controllers = $app['controllers_factory'];

        $controllers
            ->get('/', array($this, 'authToken'))
            ->before(array($this, 'authorise'))
            ->before(array($this, 'validateApiKey'));

        $controllers
            ->post('/', array($this, 'signIn'))
            ->before(array($this, 'validateApiKey'));

        $controllers
            ->post('/register', array($this, 'signUp'))
            ->before(array($this, 'validateApiKey'));

        return $controllers;

    }

    public function authToken(Application $app) {
        return $this->ok($app['user']);
    }

    public function signIn(Application $app) {
        $result = $this->validateInput(array('username' => '/^\\w+$/', 'password' => '/^[\\s\\S]+$/'));
        if (!is_array($result)) {
            return $result;
        }

        return $this->ok($app['db.players']->signIn($result['username'], $result['password']));
    }

    public function signUp(Application $app) {
        $result = $this->validateInput(array('username' => '/^\\w+$/', 'password' => '/^[\\s\\S]+$/'));
        if (!is_array($result)) {
            return $result;
        }

        return $this->ok($app['db.players']->signUp($result['username'], $result['password']));
    }
}