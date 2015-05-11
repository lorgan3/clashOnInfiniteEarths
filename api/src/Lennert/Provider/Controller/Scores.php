<?php

namespace Lennert\Provider\Controller;

use Silex\Application;
use Silex\ControllerProviderInterface;
use Silex\ControllerCollection;

class Scores extends CustomController {

    public function connect(Application $app) {

        // Create new ControllerCollection
        $controllers = $app['controllers_factory'];

        $controllers
            ->get('/', array($this, 'highscores'))
            ->before(array($this, 'validateApiKey'));

        $controllers
            ->get('/{id}/', array($this, 'scores'))
            ->assert('id', '\d+')
            ->before(array($this, 'validateApiKey'))
            ->before(array($this, 'authorise'));

        $controllers
            ->put('/', array($this, 'putScores'))
            ->before(array($this, 'validateApiKey'))
            ->before(array($this, 'authorise'));

        return $controllers;

    }

    public function highscores(Application $app) {
        return $this->ok($app['db.scores']->pagedHighscores(isset($_GET['p']) ? $_GET['p'] : 0));
    }

    public function scores(Application $app, $id) {
        if ($app['user']['id'] != $id) {
            $response = new \Bramus\Http\RestResponse();
            $response->setStatus(403);
            $response->setContent("You can only view your own scores.");
            return $response->finish();
        }

        return $this->ok($app['db.scores']->scores($id));
    }

    public function putScores(Application $app) {
        $result = $this->validateInput(array('time' => '/^-?\\d+$/', 'playersKilled' => '/^\\d+$/', 'asteroidsKilled' => '/^\\d+$/', 'won' => '/^\\d$/', 'singleplayer' => '/^\\d$/'));
        if (!is_array($result)) {
            return $result;
        }
        return $this->ok($app['db.scores']->updateScores(
            $result['time'],
            $result['playersKilled'],
            $result['asteroidsKilled'],
            $result['won'] == 1 ? true : false,
            $result['singleplayer'] == 1 ? true : false,
            $app['user']) ? 'Success' : 'Failure');
    }
}