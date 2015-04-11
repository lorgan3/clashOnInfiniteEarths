<?php

namespace Lennert\Repository;

abstract class LinkedRepository extends \Knp\Repository {

    /**
     * Generates links for the array.
     * @param  [Array] $array An associative or sequential array to add links to, should contain id fields.
     * @param  [Array] $links An array with the links to add. ':<key>' will be replaced with the actual key.
     * @return [Array]        The resulting array.
     */
    public function link($array, $links) {
        // Associative array
        if (count(array_filter(array_keys($array), 'is_string')) == true) {
            $curLinks = [];
            $keys = $this->getArrayKeys($array);
            foreach ($links as $key => $value) {
                $curLinks[] = array('rel' => $key, 'href' => preg_replace($keys, $array, $value));
            }

            $array['links'] = $curLinks;
        } else {
            $array = array_map(function($e) use ($links) {
                $curLinks = [];
                $keys = $this->getArrayKeys($e);
                foreach ($links as $key => $value) {
                    $curLinks[] = array('rel' => $key, 'href' => preg_replace($keys, $e, $value));
                }

                $e['links'] = $curLinks;
                return $e;
            }, $array);
        }

        return $array;
    }

    /**
     * Get all keys from the array, delimit them with slashes and prefix them with a colon.
     * @param  [Array] $array The array.
     * @return [Array]        An array of delimited keys with a colon.
     */
    private function getArrayKeys($array) {
        return array_map(function($e) {
            return '/:' . $e . '/';
        }, array_keys($array));
    }
}
