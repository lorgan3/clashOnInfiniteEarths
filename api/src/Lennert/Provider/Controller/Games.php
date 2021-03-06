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
        $result = $this->validateInput(array('token' => '/^\\w+$/', 'name' => '/^.*$/', 'maxplayers' => '/^\d{1,2}$/', 'peerserver' => '/^(\S*|)$/', 'peerport' => '/^(\d{1,5}|)$/' ));
        if (!is_array($result)) {
            return $result;
        }
        return $this->ok($app['db.games']->host($result['token'], $app['user'], $result['name'], $result['maxplayers'], $result['peerserver'], $result['peerport']));
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
        $token = isset($_GET['token']) ? $_GET['token'] : '';
        if (!preg_match('/^\\w+$/', $token)) {
            $response = new \Bramus\Http\RestResponse();
            $response->setStatus(412);
            $response->setContent("token is a required field and should match /^\\w+$/.");
            return $response;
        }
        return $this->ok($app['db.games']->hide($token, $app['user']) ? 'Success' : 'Failure');
    }
}