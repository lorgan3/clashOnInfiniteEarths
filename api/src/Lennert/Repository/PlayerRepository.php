<?php

namespace Lennert\Repository;

class PlayerRepository extends LinkedRepository {
    /**
     * Returns the players table name.
     * @param  [Object] $app The application.
     * @return [string] the players table name.
     */
    public function getTableName() {
        return 'Players';
    }

    /**
     * Returns the authorised user.
     * @param  [string] $token The auth-token.
     * @return [Object]        The user.
     */
    public function authorise($token = null) {
        if ($token == null || $token == '') {
            return false;
        }

        return $this->db->fetchAssoc('SELECT id, name, joindate FROM Players WHERE token = ?', array($token));
    }

    /**
     * Signs a user in.
     * @param  [string]       $username The username
     * @param  [string]       $password The password
     * @return [Object|false]           The user or false on failure.
     */
    public function signIn($username = null, $password = null) {
        if ($username == null || $password == null) {
            return false;
        }

        $user = $this->db->fetchAssoc('SELECT id, name, joindate, password FROM Players WHERE name = ?', array($username));
        if ($user != false && crypt($password, $user['password']) === $user['password']) {
            unset($user['password']);
            $user['token'] = substr( md5(rand()), 0, 16);
            $this->db->update('PLayers', array('token' => $user['token']), array('id' => $user['id']));
            return $user;
        }
        return false;
    }

    /**
     * Signs a user up.
     * @param  [string]       $username The username
     * @param  [string]       $password The password
     * @return [Object|false]           The user or false on failure.
     */
    public function signUp($username = null, $password = null) {
        if ($username == null || $password == null || $this->db->fetchAssoc('SELECT id FROM Players WHERE name = ?', array($username)) != false) {
            return false;
        }

        $this->db->insert('Players', array('name' => $username, 'password' => crypt($password), 'joindate' => date('Y-m-d H:i:s')));
        return $this->signIn($username, $password);
    }
}