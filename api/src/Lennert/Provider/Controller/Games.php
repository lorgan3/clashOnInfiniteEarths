<?php

namespace Lennert\Provider\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Silex\ControllerCollection;

class Games extends CustomController {

    public function connect(Application $app) {

        // Create new ControllerCollection
        $controllers = $app['controllers_factory'];

        $controllers
            ->get('/', array($this, 'overview'))
            ->before(array($this, 'validateApiKey'));

        $controllers
            ->post('/', array($this, 'host'))
            ->before(array($this, 'validateApiKey'))
            ->before(array($this, 'authorise'));

        $controllers
            ->put('/', array($this, 'keepalive'))
            ->before(array($this, 'validateApiKey'))
            ->before(array($this, 'authorise'));

        $controllers
            ->delete('/', array($this, 'hide'))
            ->before(array($this, 'validateApiKey'))
            ->before(array($this, 'authorise'));


        return $controllers;
    }

    public function overview(Application $app) {
        return $this->ok($app['db.games']->findAll());
    }

    public function host(Application $app) {
        $result = $this->validateInput(array('token' => '/^\\w+$/'));
        if (!is_array($result)) {
            return $result;
        }
        return $this->ok($app['db.games']->host($result['token'], $app['user']));
    }

    public function keepalive(Application $app) {
        $result = $this->validateInput(array('token' => '/^\\w+$/', 'players' => '/^\\d$/'));
        if (!is_array($result)) {
            return $result;
        }
        return $this->ok($app['db.games']->keepalive(
            $result['token'],
            $result['players'],
            $app['user']) ? 'Success' : 'Failure');
    }

    public function hide(Application $app) {
        $result = $this->validateInput(array('token' => '/^\\w+$/'));
        if (!is_array($result)) {
            return $result;
        }
        return $this->ok($app['db.games']->hide($result['token'], $app['user']) ? 'Success' : 'Failure');
    }
}