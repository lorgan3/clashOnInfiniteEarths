<?php

/**
 * @author		Bramus Van Damme <bramus@bram.us>
 * @copyright	Copyright (c), 2013 Bramus Van Damme
 */


namespace Bramus\Http;


class RestResponse extends Response  {


	/**
	 * Constructor
	 */
	public function __construct() {

		// Don't Cache
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

		// Tell it's JSON
		header('Content-type: application/json');

		// Call parent constructor
		parent::__construct();

	}


	/**
	 * Display it all :-)
	 * @return void
	 */
	public function finish() {

		// Output the JSON string
		echo json_encode(
			array(
				'status' => $this->status,
				'content' => $this->content
			)
		);

		exit();

	}

}

// EOF