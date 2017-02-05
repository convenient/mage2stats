<?php
namespace Convenient\Mage2Stats;

class GithubApi
{
    private $organisation;
    private $repository;
    private $authentication;

    private static $client = null;

    /**
     * GithubStats constructor.
     * @param $organisation
     * @param $repository
     * @param null $authenticationToken
     */
    public function __construct($organisation, $repository, $authenticationToken = null)
    {
        $this->organisation = $organisation;
        $this->repository = $repository;
        $this->authentication = $authenticationToken;
    }

    /**
     * @param int $pageSize
     * @param null $pageLimit
     *
     * @return array
     * @author Luke Rodgers <lukerodgers90@gmail.com>
     */
    public function getPullRequests($pageSize = 100, $pageLimit = null)
    {
        $options = [
            'state' => 'all',
            'per_page' => $pageSize,
            'page' => 1
        ];

        $pullRequestData = [];
        do {
            $pullRequests = $this->getClient()->pullRequests()->all($this->organisation, $this->repository, $options);
            foreach ($pullRequests as $pr) {
                $pullRequestData[] = $pr;
            }
            $options['page']++;
            if ($pageLimit !== null && $options['page'] > $pageLimit) {
                break;
            }
        } while (!empty($pullRequests));

        return $pullRequestData;
    }

    /**
     * @param int $pageSize
     * @param null $pageLimit
     *
     * @return array
     * @author Luke Rodgers <lukerodgers90@gmail.com>
     */
    public function getIssues($pageSize = 100, $pageLimit = null)
    {
        $options = [
            'state' => 'all',
            'per_page' => $pageSize,
            'page' => 1
        ];

        $issuesData = [];
        do {
            $issues = $this->getClient()->issues()->all($this->organisation, $this->repository, $options);
            foreach ($issues as $issue) {
                if (!isset($issue['pull_request'])) {
                    //I only want pure issues, no pull requests
                    $issuesData[] = $issue;
                }
            }
            $options['page']++;
            if ($pageLimit !== null && $options['page'] > $pageLimit) {
                break;
            }
        } while (!empty($issues));

        return $issuesData;
    }

    /**
     * @return \Github\Client
     * @author Luke Rodgers <lukerodgers90@gmail.com>
     */
    public function getClient()
    {
        if (is_null(self::$client)) {
            $client = new \Github\Client();
            if ($this->authentication !== null) {
                $client->authenticate($this->authentication, null, \Github\Client::AUTH_HTTP_TOKEN);
            }
            self::$client = $client;
        }
        return self::$client;
    }
}
