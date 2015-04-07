<?php

/**
 * @author		Bramus Van Damme <bramus@bram.us>
 * @copyright	Copyright (c), 2013 Bramus Van Damme
 */


namespace Bramus\Http;


class XmlResponse extends Response  {


	/**
	 * Constructor
	 */
	public function __construct() {

		// Don't Cache
		header('Cache-Control: no-cache, must-revalidate');
		header('Expires: Mon, 26 Jul 1997 05:00:00 GMT');

		// Tell it's XML
		header('Content-Type: application/xml');

		// Call parent constructor
		parent::__construct();
	}


	/**
	 * Convert an array to XML
	 * @url    http://stackoverflow.com/questions/1397036/how-to-convert-array-to-simplexml
	 * @param  Array            $array [description]
	 * @param  SimpleXMLElement $xml   [description]
	 * @return [type]                  [description]
	 */
	private function arrayToXML(Array $array, \SimpleXMLElement $xml) {

		foreach($array as $key => $value) {

			// None array
			if (!is_array($value)) {
				(is_numeric($key)) ? $xml->addChild("item$key", $value) : $xml->addChild($key, $value);
				continue;
			}

			// Array
			$xmlChild = (is_numeric($key)) ? $xml->addChild("item$key") : $xml->addChild($key);
			$this->arrayToXML($value, $xmlChild);

		}

		return $xml->asXML();

	}


	/**
	 * Display it all :-)
	 * @return void
	 */
	public function finish($jsonp = null) {

		// Output XML
		echo $this->arrayToXML(
			array(
				'status' => $this->status,
				'content' => $this->content
			),
			new \SimpleXMLElement('<response/>')
		);

		exit();

	}

}

// EOF