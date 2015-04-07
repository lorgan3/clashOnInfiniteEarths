<?php

namespace Lennert\Repository;

class ScoreRepository extendsLinkedRepository {
    /**
     * Returns the scores table name
     * @return [string] the scores table name.
     */
    public function getTableName() {
        return 'Scores';
    }
}