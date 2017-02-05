<?php
namespace Convenient\Mage2Stats;

use Convenient\Mage2Stats\Constants;

class DataGenerator
{
    /**
     * @param array $pullRequestData
     * @param array $issuesData
     * @return array
     */
    public function getDataBlob($pullRequestData = [], $issuesData = [])
    {
        $prByDate = [];
        $prByNumber = [];
        $issueByDate = [];
        $issueByNumber = [];
        $this->generateData($pullRequestData, $prByNumber, $prByDate);
        $this->generateData($issuesData, $issueByNumber, $issueByDate);

        $data = [
            'pull_requests' => [
                'date' => $prByDate,
                'detail' => $prByNumber
            ],
            'issues' => [
                'date' => $issueByDate,
                'detail' => $issueByNumber,
            ]
        ];

        return $data;
    }

    /**
     * @param $data
     * @param $byNumber
     * @param $byDate
     * @throws \Exception
     */
    public function generateData($data, &$byNumber, &$byDate)
    {
        foreach ($data as $id => $pr) {
            $this->parsePullRequest($pr, $byNumber, $byDate);
        }

        ksort($byDate);
        ksort($byNumber);

        /*
         * Calculate the daily total of open pull requests
         */
        $totalOpen = 0;
        foreach ($byDate as $date => $pullRequestGroups) {
            $closed = $created = $merged = 0;

            if (isset($pullRequestGroups[Constants::CODE_CLOSED])) {
                $closed = $pullRequestGroups[Constants::CODE_CLOSED];
            }
            if (isset($pullRequestGroups[Constants::CODE_MERGED])) {
                $merged = $pullRequestGroups[Constants::CODE_MERGED];
            }
            if (isset($pullRequestGroups[Constants::CODE_OPENED])) {
                $created = $pullRequestGroups[Constants::CODE_OPENED];
            }

            $totalOpen += ($created - ($closed + $merged));

            $byDate[$date][Constants::CODE_TOTAL_OPEN] = $totalOpen;
        }
    }

    /**
     * @param $pr
     * @param $byNumber
     * @param $byDate
     * @throws \Exception
     */
    private function parsePullRequest(&$pr, &$byNumber, &$byDate)
    {
        $mini = [];

        /*
         * Parse and prepare date data
         */
        $createdAt = $this->parseDate($pr['created_at']);
        $mini[Constants::CODE_OPENED] = $createdAt;

        if (isset($pr['merged_at']) && $pr['merged_at']) {
            $mergedAt = $this->parseDate($pr['merged_at']);
            $mini[Constants::CODE_MERGED] = $mergedAt;
        }

        if (isset($pr['closed_at']) && $pr['closed_at']) {
            $closedAt = $this->parseDate($pr['closed_at']);
        }

        /*
         * Initialise counters for the available dates
         * Including the running total open counter
         */
        if (!isset($byDate[$createdAt][Constants::CODE_OPENED])) {
            $byDate[$createdAt][Constants::CODE_OPENED] = 0;
            $byDate[$createdAt][Constants::CODE_TOTAL_OPEN] = 0;
        }
        if (isset($mergedAt) && !isset($byDate[$mergedAt][Constants::CODE_MERGED])) {
            $byDate[$mergedAt][Constants::CODE_MERGED] = 0;
            $byDate[$mergedAt][Constants::CODE_TOTAL_OPEN] = 0;
        }
        if (isset($closedAt) && !isset($byDate[$closedAt][Constants::CODE_CLOSED])) {
            $byDate[$closedAt][Constants::CODE_CLOSED] = 0;
            $byDate[$closedAt][Constants::CODE_TOTAL_OPEN] = 0;
        }

        /*
         * Increment counters for the available dates
         */
        $byDate[$createdAt][Constants::CODE_OPENED]++;

        if (isset($mergedAt)) {
            if (isset($closedAt) && $closedAt !== $mergedAt) {
                throw new \Exception("Merged and closed on different days?!");
            }
            $byDate[$mergedAt][Constants::CODE_MERGED]++;
        } elseif (isset($closedAt)) {
            $byDate[$closedAt][Constants::CODE_CLOSED]++;
            $mini[Constants::CODE_CLOSED] = $closedAt;
        }

        $mini[Constants::CODE_USER] = $pr['user']['login'];
        //Pass down the id instead, can generate the url on the frontend
        //$mini[Constants::CODE_USER_AVATAR] = $pr['user']['avatar_url'];
        $mini[Constants::CODE_USER_AVATAR] = (string)$pr['user']['id'];

        $byNumber[$pr['number']] = $mini;
    }

    /**
     * Transforms date strings
     *
     * from:    2017-05-15T11:22:34Z
     * to:      2017-05-01
     *
     * This should allow us to group it by month on the frontend.
     *
     * @param $string
     * @return string
     * @author Luke Rodgers <lukerodgers90@gmail.com>
     */
    private function parseDate($string)
    {
        $parsed = date_parse($string);
        $day = '01';
        $month = sprintf("%02d", $parsed['month']);
        $year = $parsed['year'];

        if (!(empty($parsed['warnings']) && empty($parsed['errors']))) {
            throw new \InvalidArgumentException("Invalid time stamp on $string");
        }

        return implode('-', [$year, $month, $day]);
    }
}
