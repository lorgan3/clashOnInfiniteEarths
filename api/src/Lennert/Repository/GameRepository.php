<?php

namespace Lennert\Repository;

class GameRepository extends LinkedRepository {
    /**
     * Returns the games table name
     * @param  [Object] $app The application
     * @return [string] the games table name.
     */
    public function getTableName() {
        return 'Games';
    }

    /**
     * Returns a list of valid public gameservers.
     * @return [array] The gameservers.
     */
    public function findAll() {
        // Clean the database from old data.
        $this->db->executeQuery('DELETE FROM Games WHERE lastContact < ? OR players >= maxPlayers', array(date('Y-m-d H:i:s', time()-40)));

        return $this->link($this->db->fetchAll(
            'SELECT g.id, g.key, g.players, g.name, g.maxPlayers, g.peerServer, g.peerPort, p.name AS owner FROM Games AS g INNER JOIN Players as p ON g.owner = p.id'),
            array('self' => '#/play/:key'));
    }

    /**
     * Adds a gameserver to the list.
     * @param  [string] $token The token of the peer.
     * @param  [Object] $user  The host.
     * @return [number]        The id of this server.
     */
    public function host($token, $user, $name, $maxplayers, $peerserver, $peerport) {
        $this->db->insert('Games', array('key' => $token, 'lastContact' => date('Y-m-d H:i:s'), 'owner' => $user['id'], 'name' => $name, 'maxPlayers' => $maxplayers, 'peerServer' => $peerserver, 'peerPort' => $peerport));
        return $this->db->lastInsertId();
    }

    /**
     * Updates the lastContact value.
     * @param  [string] $token   The token of the peer.
     * @param  [number] $players The amount of players in the server.
     * @param  [Object] $user    The host.
     * @return [boolean]         True on success.
     */
    public function keepalive($token, $players, $user) {
        if ($players >= 4) {
            $this->hide($token, $user);
            return false;
        } else {
            return $this->db->update('Games',
                array('lastContact' => date('Y-m-d H:i:s'), 'players' => $players),
                array('owner' => $user['id'], 'key' => $token));
        }
    }

    /**
     * Hides the gameserver.
     * @param  [string] $token The token.
     * @param  [number] $user  The host.
     */
    public function hide($token, $user) {
        return $this->db->delete('Games', array('owner' => $user['id'], 'key' => $token));
    }
}