"use strict";

const CODE_OPENED = 'c';
const CODE_MERGED = 'm';
const CODE_CLOSED = 'x';
const CODE_TOTAL_OPEN = 't';
const CODE_USER = 'u';
const CODE_USER_AVATAR = 'a';

var method = GoogleDataTableFormatter.prototype;

function GoogleDataTableFormatter(pullRequestDataDetails, pullRequestDataByDate, endDateString, startDateStringMonthsApart) {
    var startAndEndDate = this.getGraphStartAndEndDate(endDateString, startDateStringMonthsApart);
    this.startDate = startAndEndDate[0];
    this.endDate = startAndEndDate[1];
    this.flatTableData = this.formatFlatTable(pullRequestDataDetails);
    this.graphTableData = this.formatGraphTable(pullRequestDataByDate);
}

method.getGraphTable = function () {
    return this.graphTableData;
};

method.getFlatTable = function () {
    return this.flatTableData;
};

method.getEndDate = function () {
    return this.endDate;
};

method.getStartDate = function () {
    return this.startDate;
};

method.getGraphStartAndEndDate = function (datestring, monthsApart) {

    var endDateParts = datestring.split('-');
    var endDate = new Date(endDateParts[0], endDateParts[1]-1, endDateParts[2]);
    endDate.setDate(1);

    var startDate = new Date(endDate);
    startDate.setDate(1);
    startDate.setMonth(endDate.getMonth() - monthsApart);

    return [startDate, endDate];
};

method.formatGraphTable = function (origData) {
    var reformedData = [];

    Object.keys(origData).forEach(function(date) {

        var created = 0;
        var merged = 0;
        var closed = 0;
        var totalOpen = 0;

        if (CODE_OPENED in origData[date]) {
            created = origData[date][CODE_OPENED];
        }
        if (CODE_CLOSED in origData[date]) {
            closed = origData[date][CODE_CLOSED];
        }
        if (CODE_MERGED in origData[date]) {
            merged = origData[date][CODE_MERGED];
        }
        if (CODE_TOTAL_OPEN in origData[date]) {
            totalOpen = origData[date][CODE_TOTAL_OPEN];
        }

        var dateParts = date.split("-");
        reformedData.push([new Date(dateParts[0], (dateParts[1]-1), dateParts[2]), totalOpen, closed, merged, created]);
    });

    return reformedData;
};

method.formatFlatTable = function(origData) {

    var reformedData = [];

    Object.keys(origData).forEach(function(number) {
        var pr = origData[number];
        //This will do for a default date...
        //This will get avoided by our bounded filters
        var created = new Date(2099, 0, 1);
        var closed  = new Date(2099, 0, 1);
        var merged  = new Date(2099, 0, 1);

        if (CODE_OPENED in pr) {
            var dateParts = pr[CODE_OPENED].split("-");
            created = new Date(dateParts[0], (dateParts[1]-1), dateParts[2]);
        }
        if (CODE_CLOSED in pr) {
            dateParts = pr[CODE_CLOSED].split("-");
            closed = new Date(dateParts[0], (dateParts[1]-1), dateParts[2]);
        }
        if (CODE_MERGED in pr) {
            dateParts = pr[CODE_MERGED].split("-");
            merged = new Date(dateParts[0], (dateParts[1]-1), dateParts[2]);
        }

        reformedData.push(
            [created, merged, closed, pr[CODE_USER], pr[CODE_USER_AVATAR], number]
        );
    });

    return reformedData;
};

method.groupCountPullRequests = function(pullRequests, limit) {

    //Group pull requests by user
    var grouped = {};
    for (var i=0; i<pullRequests.length; i++) {
        var pr = pullRequests[i];
        var number = pr['number'];
        var username = pr['user'];
        delete pr['number'];

        if (!(username in grouped)) {
            pr['count'] = 0;
            pr['numbers'] = [];
            grouped[username] = pr;
        }

        grouped[username]['numbers'].push(number);
        grouped[username]['count'] = grouped[username]['numbers'].length;
    }

    //Sort by count so that highest PRs are at the top of the array, then alphabetically by username
    var sortArray = [];
    Object.keys(grouped).forEach(function(username) {
        sortArray.push(grouped[username]);
    });
    function sortPullRequests() {
        return function(a,b){
            if (a['count'] === b['count']) {
                if (a['user'] < b['user']) return -1;
                if (a['user'] > b['user']) return 1;
                return 0;
            } else {
                if (a['count'] > b['count']) return -1;
                if (a['count'] < b['count']) return 1;
                return 0;
            }
        }
    }
    sortArray.sort(sortPullRequests());

    //Slice the array to return the required limit
    if (sortArray.length > limit) {
        sortArray = sortArray.slice(0, limit);
    }

    return sortArray;
};

module.exports = GoogleDataTableFormatter;
