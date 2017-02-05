<?php
class GithubStatsTest extends PHPUnit_Framework_TestCase
{
    /** @var  \Convenient\Mage2Stats\GithubApi */
    protected $stats;

    /**
     * @author Luke Rodgers <lukerodgers90@gmail.com>
     */
    public function setUp()
    {
        $auth = null;
        if (is_file(__DIR__ . '/../config.json')) {
            $config = json_decode(file_get_contents(__DIR__ . '/../../config.json'), true);
            $auth = $config['token'];
        }
        $this->stats = new \Convenient\Mage2Stats\GithubApi('magento', 'magento2', $auth);
    }

    /**
     * @author Luke Rodgers <lukerodgers90@gmail.com>
     */
    public function testGetPullRequests()
    {
        $prs = $this->stats->getPullRequests(2, 2);
        $this->assertCount(4, $prs, '2 pages of 2 pull requests should yield 4 pull requests');

        $this->assertArrayHasKey('closed_at', $prs[0]);
        $this->assertArrayHasKey('created_at', $prs[0]);
        $this->assertArrayHasKey('merged_at', $prs[0]);
        $this->assertArrayHasKey('number', $prs[0]);
        $this->assertArrayHasKey('user', $prs[0]);
        $this->assertInternalType('int', $prs[0]['number']);
        $this->assertInternalType('string', $prs[0]['user']['login']);
        $this->assertNotEmpty($prs[0]['user']);

        $this->assertArrayHasKey('closed_at', $prs[1]);
        $this->assertArrayHasKey('created_at', $prs[1]);
        $this->assertArrayHasKey('merged_at', $prs[1]);
        $this->assertArrayHasKey('number', $prs[1]);
        $this->assertArrayHasKey('user', $prs[1]);
        $this->assertInternalType('int', $prs[1]['number']);
        $this->assertInternalType('string', $prs[1]['user']['login']);
        $this->assertNotEmpty($prs[1]['user']);

        $this->assertArrayHasKey('closed_at', $prs[2]);
        $this->assertArrayHasKey('created_at', $prs[2]);
        $this->assertArrayHasKey('merged_at', $prs[2]);
        $this->assertArrayHasKey('number', $prs[2]);
        $this->assertArrayHasKey('user', $prs[2]);
        $this->assertInternalType('int', $prs[2]['number']);
        $this->assertInternalType('string', $prs[2]['user']['login']);
        $this->assertNotEmpty($prs[2]['user']);

        $this->assertArrayHasKey('closed_at', $prs[3]);
        $this->assertArrayHasKey('created_at', $prs[3]);
        $this->assertArrayHasKey('merged_at', $prs[3]);
        $this->assertArrayHasKey('number', $prs[3]);
        $this->assertArrayHasKey('user', $prs[3]);
        $this->assertInternalType('int', $prs[3]['number']);
        $this->assertInternalType('string', $prs[3]['user']['login']);
        $this->assertNotEmpty($prs[3]['user']);
    }
}
