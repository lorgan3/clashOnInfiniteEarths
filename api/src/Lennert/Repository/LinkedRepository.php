<?php

namespace Lennert\Repository;

abstract class LinkedRepository extends \Knp\Repository {

	/**
	 * Generates links for the array.
	 * @param  [Array] $array An associative or sequential array to add links to, should contain id fields.
	 * @param  [Array] $links An array with the links to add. ':id' will be replaced with the actual.
	 * @return [Array]        The resulting array.
	 */
	public function link($array, $links) {
		// Associative array
		if (count(array_filter(array_keys($array), 'is_string')) == true) {
			$curLinks = [];
			foreach ($links as $key => $value) {
				$curLinks = array('rel' => $key, 'href' => str_replace(':id', $array['id'], $value));
			}

			$array['links'] = $curLinks;
		} else {
			$array = array_map(function($e) use ($links) {
				$curLinks = [];
				foreach ($links as $key => $value) {
					$curLinks = array('rel' => $key, 'href' => str_replace(':id', $e['id'], $value));
				}

				$e['links'] = $curLinks;
				return $e;
			}, $array);
		}

		return $array;
	}
}