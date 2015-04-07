<?php

// Bootstrap
require __DIR__ . DIRECTORY_SEPARATOR . 'bootstrap.php';

$app->error(function (\Exception $e, $code) use ($app) {

    if ($code == 404) {
        $response = new \Bramus\Http\RestResponse();
        $response->setStatus(404);
        return $response->finish();
    } else {
        $response = new \Bramus\Http\RestResponse();
        $response->setStatus(500);
        if ($app['debug'] === true) {
            $response->setContent($e->getMessage());
        }
        return $response->finish();
    }
});

// Mount our Controllers
$app->mount('/players', new Lennert\Provider\Controller\Players());
$app->mount('/games', new Lennert\Provider\Controller\Games());
$app->mount('/scores', new Lennert\Provider\Controller\Scores());