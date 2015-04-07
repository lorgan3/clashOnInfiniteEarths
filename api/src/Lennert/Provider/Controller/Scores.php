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
            ->get('/{id}/', array($this, 'peopleDetail'))
            ->assert('id', '\d+')
            ->before(array($this, 'validateApiKey'));

        return $controllers;

    }

    public function peopleDetail(Application $app, $id) {
        $response = new \Bramus\Http\RestResponse();
        //$people = $app['db.people']->details($id, $app);
        //if ($people == false) {
            $response->setStatus(404);
        //} else {
        //  $response->setContent($people);
        //}
        return $response->finish();
    }
}