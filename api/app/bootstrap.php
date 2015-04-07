<?php

// Require Composer Autoloader
require_once __DIR__ . DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'vendor' . DIRECTORY_SEPARATOR . 'autoload.php';

// Create new Silex App
$app = new Silex\Application();

// App Configuration
$app['debug'] = true;
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL);

// Use Doctrine — @note: Be sure to install Doctrine via Composer first!
$app->register(new Silex\Provider\DoctrineServiceProvider(), array(
	'db.options' => array(
		'driver'   => 'pdo_sqlite',
		'path'     => __DIR__ .  DIRECTORY_SEPARATOR . '..' . DIRECTORY_SEPARATOR . 'resources' . DIRECTORY_SEPARATOR . 'app.db',
	)
));

// Use Repository Service Provider — @note: Be sure to install KNP RSP via Composer first!
$app->register(new Knp\Provider\RepositoryServiceProvider(), array(
	'repository.repositories' => array(
		'db.players' => 'Lennert\\Repository\\PlayerRepository',
		'db.games' => 'Lennert\\Repository\\GameRepository',
		'db.scores' => 'Lennert\\Repository\\ScoreRepository'
	)
));