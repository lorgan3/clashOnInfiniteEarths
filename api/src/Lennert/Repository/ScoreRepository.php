<?php

namespace Lennert\Repository;

class ScoreRepository extends LinkedRepository {
    /**
     * Returns the scores table name
     * @return [string] the scores table name.
     */
    public function getTableName() {
        return 'Scores';
    }

    /**
     * Returns an array with 1 page of highscores.
     * @param  [number] $page    Which page that should be fetched.
     * @param  [number] $perpage The amount of results per page.
     * @return [Array]           The results.
     */
    public function pagedHighscores($page = 0, $perpage = 20) {
        $result = $this->db->fetchAll('SELECT id, name, quickestRound, playersKilled, asteroidsKilled, asteroidsKilled1Round, multiplayerWins, singleplayerWins, singleplayerTries, multiplayerTries FROM Players ORDER BY (singleplayerWins + multiplayerWins) DESC LIMIT ?,?', array($page*$perpage, $perpage));
        if (count($result) === 0) {
            $page = 0;
            $result = $this->db->fetchAll('SELECT id, name, quickestRound, playersKilled, asteroidsKilled, asteroidsKilled1Round, multiplayerWins, singleplayerWins, singleplayerTries, multiplayerTries FROM Players ORDER BY (singleplayerWins + multiplayerWins) DESC LIMIT 0,?', array($perpage));
        }

        return $this->link($result, array('self' => '#/scores/?p=' . $page));
    }

    /**
     * Retuns the highscores for the player.
     * @param  [number] $id The player.
     * @return [Array]      His scores.
     */
    public function scores($id) {
        return $this->link($this->db->fetchAssoc('SELECT id, name, quickestRound, playersKilled, asteroidsKilled, asteroidsKilled1Round, multiplayerWins, singleplayerWins, singleplayerTries, multiplayerTries FROM Players WHERE id = ?', array($id)),
            array('self' => '#/scores/' . $id . '/'));
    }

    /**
     * Updates the highscores for the player.
     * @param  [number] $time            The time of the round.
     * @param  [number] $playersKilled   The amount of killed players.
     * @param  [number] $asteroidsKilled The amount of destroyed asteroids.
     * @param  [boolean] $won            Was the player the winner?
     * @param  [boolean] $singleplayer   Was this a singleplayer round?
     * @param  [Object] $user            The current user
     * @return [boolean]                 true on success
     */
    public function updateScores($time, $playersKilled, $asteroidsKilled, $won, $singleplayer, $user) {
        $data = $this->db->fetchAssoc('SELECT id, name, quickestRound, playersKilled, asteroidsKilled, asteroidsKilled1Round, multiplayerWins, singleplayerWins, singleplayerTries, multiplayerTries FROM Players WHERE id = ?', array($user['id']));

        return $this->db->update('Players',
            array('quickestRound' => $time != -1 ? min($data['quickestRound'], $time) : null,
                'playersKilled' => $data['playersKilled'] + $playersKilled,
                'asteroidsKilled' => $data['asteroidsKilled'] + $asteroidsKilled,
                'asteroidsKilled1Round' => max($data['asteroidsKilled1Round'], $asteroidsKilled),
                'singleplayerWins' => ($singleplayer && $won) ? $data['singleplayerWins'] + 1 : $data['singleplayerWins'],
                'multiplayerWins' => (!$singleplayer && $won) ? $data['multiplayerWins'] + 1 : $data['multiplayerWins'],
                'singleplayerTries' => $singleplayer ? $data['singleplayerTries'] + 1 : $data['singleplayerTries'],
                'multiplayerTries' => !$singleplayer ? $data['multiplayerTries'] + 1 : $data['multiplayerTries']),
            array('id' => $user['id']));
    }
}
