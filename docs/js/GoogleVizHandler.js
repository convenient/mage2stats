"use strict";

var method = GoogleVisHandler.prototype;

function GoogleVisHandler(id_prefix, pull_request_details, pull_requests_by_date, defaultViewDate, defaultViewDistance, type) {
    this.id_prefix = id_prefix;

    //Init google charts data fromatting wrapper
    this.wrapper = new window.mage2stats.GoogleDataTableFormatter(
        pull_request_details, pull_requests_by_date, defaultViewDate, defaultViewDistance
    );

    //Client side query-able table containing all pull requests data
    this.flatTable = null;
    this.chart = null;
    this.chartData = null;

    this.type = type;
}

method.drawChart = function (dateStart, dateEnd) {

    var dataView = new google.visualization.DataView(this.chartData);
    dataView.setRows(this.chartData.getFilteredRows(
        [{
            column: 0,
            minValue: dateStart,
            maxValue: dateEnd
        }]
    ));

    var seriesColours = {
        0: {targetAxisIndex: 1, type: "line"},
        1: {targetAxisIndex: 0, color: '#bd2c00'},
        2: {targetAxisIndex: 0, color: '#6e5494'},
        3: {targetAxisIndex: 0, color: '#6CC644'}
    };
    if (this.type === 'issues') {
        //do not show the "merged" entry as it has nothing in it for issues
        dataView.setColumns([0, 1, 2, 4]);

        seriesColours = {
            0: {targetAxisIndex: 1, type: "line"},
            1: {targetAxisIndex: 0, color: '#bd2c00'},
            2: {targetAxisIndex: 0, color: '#6CC644'}
        };
    }


    this.chart.draw(
        dataView,
        {
            isStacked: true,
            seriesType: "bars",
            series: seriesColours,
            vAxes: {
                0: {title: 'Activity', minValue: 0},
                1: {title: 'Total Open', minValue: 0}
            },
            hAxis: {
                format: 'MMM y'
            }
        }
    );

    this.populatePullRequestUserTable(dateStart, dateEnd, 0, 10, 'created', this.type + '-open.png');
    if (this.type === 'pulls') {
        this.populatePullRequestUserTable(dateStart, dateEnd, 1, 10, 'merged', this.type + '-merged.png');
    }
    this.populatePullRequestUserTable(dateStart, dateEnd, 2, 10, 'closed', this.type + '-closed.png');
};

method.yyyymmdd = function(date) {
    var mm = date.getMonth() + 1;
    var dd = date.getDate();

    return [date.getFullYear(),
        (mm>9 ? '' : '0') + mm,
        (dd>9 ? '' : '0') + dd
    ].join('-');
};

method.populatePullRequestUserTable = function (dateStart, dateEnd, columnIndex, limit, type, imagepath) {

    var table_div_id = this.id_prefix + '_' + type + '_table';

    /*
     * Get the created_at pull requests generated during this time window
     */
    var filteredFlatTable = new google.visualization.DataView(this.flatTable);
    filteredFlatTable.setRows(this.flatTable.getFilteredRows(
        [{
            column: columnIndex,
            minValue: dateStart,
            maxValue: dateEnd
        }]
    ));

    /*
     *  Squash down the filtered data into an array so that it can be grouped, and counted
     */
    var sortedRows = filteredFlatTable.getSortedRows(3);
    var prs = [];
    for (var i = 0; i < sortedRows.length; i++) {
        var rowId = sortedRows[i];

        prs.push({
            'user': filteredFlatTable.getValue(rowId, 3),
            'avatar': filteredFlatTable.getValue(rowId, 4),
            'number': filteredFlatTable.getValue(rowId, 5)
        });
    }

    /*
     * Prepare the data table for rendering
     */
    var groupedData = this.wrapper.groupCountPullRequests(prs, limit);

    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', '');//Avatar
    dataTable.addColumn('string', 'User');
    dataTable.addColumn('number', '<img src="images/' + imagepath + '" class="table-state" />');

    for (var j = 0; j < groupedData.length; j++) {
        var prUser = groupedData[j];
        dataTable.addRow([prUser['avatar'], prUser['user'], prUser['count']]);
    }

    /*
     * Data has been properly grouped, apply custom renderers.
     */
    var avatarFormatter = new google.visualization.PatternFormat('<img style="width: 25px;" src="https://avatars.githubusercontent.com/u/{0}?v=3&s=25"/>');
    avatarFormatter.format(dataTable, [0]);

    var isoDateStart = this.yyyymmdd(dateStart);

    //Bump the endDate to the last date of the month, so that we view all PRs in this period
    var dateEndTemp = new Date(dateEnd);
    dateEndTemp.setMonth(dateEndTemp.getMonth() +1);
    dateEndTemp.setDate(dateEndTemp.getDate() -1);
    var isoDateEnd = this.yyyymmdd(dateEndTemp);

    //The numbers here may not match the link, PRs that are closed and opened can mess up the results on github.
    //However when you view the page, look and check the state of the pull request

    var filtertype = 'pulls';
    if (this.type == 'issues') {
        filtertype = 'issue';
    }

    var formatterString =
        '<a href="https://github.com/magento/magento2/' + this.type + '?q=author%3A{1}%20' +
        'type%3A' + filtertype +
        '%20' +
        type +
        '%3A' +
        isoDateStart +
        '..' +
        isoDateEnd +
        '">{0}</a>';

    var countFormatter = new google.visualization.PatternFormat(formatterString);
    countFormatter.format(dataTable, [2, 1]);

    var usernameFormatter = new google.visualization.PatternFormat('<a href="https://github.com/{0}/">{0}</a>');
    usernameFormatter.format(dataTable, [1]);

    var table = new google.visualization.Table(document.getElementById(table_div_id));
    table.draw(dataTable, {showRowNumber: true, allowHtml: true});

};

method.initChart = function () {

    if (this.chart !== null) {
        alert("Init should only be called once!");
        return;
    }

    /*
     * Date slider init, we can't use the one bundled into google charts because it doesnt work on mobile
     * There's probably a more modern way that "self = this", but, y'know.
     */
    var self = this;

    //The end date is actually the first date for the next month, as my queries are < rather than <=
    //Bump this date back one day to push it to the end of the previous month.
    var sliderEndDate = this.wrapper.getEndDate();
    sliderEndDate.setDate(sliderEndDate.getDate()-1);

    $("#" + this.id_prefix + "_slider").dateRangeSlider({
        formatter: function (date) {
            return date.toLocaleString('en-us', {month: "short"}) + " " + date.getFullYear();
        },
        bounds: {
            min: new Date(2011, 11, 1),
            max: sliderEndDate
        },
        defaultValues: {
            min: this.wrapper.getStartDate(),
            max: sliderEndDate
        },
        step: {
            months: 1
        },
        valueLabels:"change",
        durationIn: 1500,
        durationOut: 1500,
        arrows: true
    }).bind('valuesChanged', function (e, data) {
        self.drawChart(data.values.min, data.values.max);
    });

    /*
     * Flat PR data for PR tables
     */
    this.flatTable = new google.visualization.DataTable();
    this.flatTable.addColumn('date', 'Date Created');
    this.flatTable.addColumn('date', 'Date Merged');
    this.flatTable.addColumn('date', 'Date Closed');
    this.flatTable.addColumn('string', 'User');
    this.flatTable.addColumn('string', 'User Avatar');
    this.flatTable.addColumn('string', 'Number');
    this.flatTable.addRows(this.wrapper.getFlatTable());

    /*
     * Chart data
     */
    this.chartData = new google.visualization.DataTable();
    this.chartData.addColumn('date', 'Date');
    this.chartData.addColumn('number', 'Total Open');
    this.chartData.addColumn('number', 'Closed');
    this.chartData.addColumn('number', 'Merged');
    this.chartData.addColumn('number', 'Created');
    this.chartData.addRows(this.wrapper.getGraphTable());

    var date_formatter = new google.visualization.DateFormat({pattern: "MMM yyyy"});
    date_formatter.format(this.chartData, 0);

    /*
     * Chart
     */
    this.chart = new google.visualization.ComboChart(document.getElementById(this.id_prefix + '_main_chart'));

    this.drawChart(this.wrapper.getStartDate(), this.wrapper.getEndDate());
};

