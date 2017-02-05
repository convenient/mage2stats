var assert = require('assert');
var GoogleDataTableFormatter = require('./../../src/GoogleDataTableFormatter.js');

suite('GoogleDataTableFormatter', function() {

    suite('#getGraphStartAndEndDate()', function() {
        test('get_start_and_end_date', function() {
            var formatter = new GoogleDataTableFormatter({}, {}, '2017-03-25', 2);

            var expectedStart = new Date(2017, 0, 1);
            var expectedEnd = new Date(2017, 2, 1);

            assert.deepEqual(formatter.getStartDate(), expectedStart);
            assert.deepEqual(formatter.getEndDate(), expectedEnd);
        });
        test('get_start_and_end_date_over_year_1', function() {
            var formatter = new GoogleDataTableFormatter({}, {}, '2017-03-25', 3);

            var expectedStart = new Date(2016, 11, 1);
            var expectedEnd = new Date(2017, 2, 1);

            assert.deepEqual(formatter.getStartDate(), expectedStart);
            assert.deepEqual(formatter.getEndDate(), expectedEnd);
        });
        test('get_start_and_end_date_over_year_2', function() {
            var formatter = new GoogleDataTableFormatter({}, {}, '2017-03-25', 6);

            var expectedStart = new Date(2016, 8, 1);
            var expectedEnd = new Date(2017, 2, 1);

            assert.deepEqual(formatter.getStartDate(), expectedStart);
            assert.deepEqual(formatter.getEndDate(), expectedEnd);
        });
    });


    suite('#formatGraphTable()', function() {
        test('fully_formed_entry', function() {

            var formatter = new GoogleDataTableFormatter({}, {}, '2017-01-01', 1);

            var inputData = {
                '2017-01-01': {
                    'c' : 1,
                    'x' : 2,
                    'm' : 3,
                    't' : 4
                },
                '2017-02-01': {
                    'c' : 5,
                    'x' : 6,
                    'm' : 7,
                    't' : 8
                }
            };

            //Total, Closed, Merged, Created
            var expected = [
                [new Date('2017', '00', '01'), 4, 2, 3, 1],
                [new Date('2017', '01', '01'), 8, 6, 7, 5]
            ];

            assert.deepEqual(formatter.formatGraphTable(inputData), expected);
        });
    });

    suite('#groupCountPullRequests()', function() {
        test('fully_formed_entry', function() {
            var input =[
                {'user': 'luke', 'number': '1', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '3', 'avatar': 'image.png'},
                {'user': 'bob', 'number': '4', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '5', 'avatar': 'image.png'},
                {'user': 'bob', 'number': '6', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '7', 'avatar': 'image.png'},
                {'user': 'charlie', 'number': '8', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '9', 'avatar': 'image.png'},
                {'user': 'daniel', 'number': '10', 'avatar': 'image.png'},
                {'user': 'alice', 'number': '2', 'avatar': 'image.png'}
            ];

            var expected = [
                {'user': 'luke', 'avatar': 'image.png', 'count': 5, 'numbers': ['1', '3', '5', '7', '9']},
                {'user': 'bob', 'avatar': 'image.png', 'count': 2, 'numbers': ['4', '6']},
                {'user': 'alice', 'avatar': 'image.png', 'count': 1, 'numbers': ['2']}
            ];

            var formatter = new GoogleDataTableFormatter({}, {}, '2017-01-01', 1);

            var results = formatter.groupCountPullRequests(input, 3);

            assert.deepEqual(results, expected, "We should only show the top 3 pull requesters, alphabetically");
        });
        test('fully_formed_entry_equal_limit_entries', function() {
            var input =[
                {'user': 'luke', 'number': '1', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '3', 'avatar': 'image.png'},
                {'user': 'bob', 'number': '4', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '5', 'avatar': 'image.png'},
                {'user': 'bob', 'number': '6', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '7', 'avatar': 'image.png'},
                {'user': 'charlie', 'number': '8', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '9', 'avatar': 'image.png'},
                {'user': 'daniel', 'number': '10', 'avatar': 'image.png'},
                {'user': 'alice', 'number': '2', 'avatar': 'image.png'}
            ];

            var expected = [
                {'user': 'luke', 'avatar': 'image.png', 'count': 5, 'numbers': ['1', '3', '5', '7', '9']},
                {'user': 'bob', 'avatar': 'image.png', 'count': 2, 'numbers': ['4', '6']},
                {'user': 'alice', 'avatar': 'image.png', 'count': 1, 'numbers': ['2']},
                {'user': 'charlie', 'avatar': 'image.png', 'count': 1, 'numbers': ['8']},
                {'user': 'daniel', 'avatar': 'image.png', 'count': 1, 'numbers': ['10']}
            ];

            var formatter = new GoogleDataTableFormatter({}, {}, '2017-01-01', 1);

            var results = formatter.groupCountPullRequests(input, 5);

            assert.deepEqual(results, expected, "We should only show the top 3 pull requesters, alphabetically");
        });
        test('fully_formed_entry_too_few_limit_entries', function() {
            var input =[
                {'user': 'luke', 'number': '1', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '3', 'avatar': 'image.png'},
                {'user': 'bob', 'number': '4', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '5', 'avatar': 'image.png'},
                {'user': 'bob', 'number': '6', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '7', 'avatar': 'image.png'},
                {'user': 'charlie', 'number': '8', 'avatar': 'image.png'},
                {'user': 'luke', 'number': '9', 'avatar': 'image.png'},
                {'user': 'daniel', 'number': '10', 'avatar': 'image.png'},
                {'user': 'alice', 'number': '2', 'avatar': 'image.png'}
            ];

            var expected = [
                {'user': 'luke', 'avatar': 'image.png', 'count': 5, 'numbers': ['1', '3', '5', '7', '9']},
                {'user': 'bob', 'avatar': 'image.png', 'count': 2, 'numbers': ['4', '6']},
                {'user': 'alice', 'avatar': 'image.png', 'count': 1, 'numbers': ['2']},
                {'user': 'charlie', 'avatar': 'image.png', 'count': 1, 'numbers': ['8']},
                {'user': 'daniel', 'avatar': 'image.png', 'count': 1, 'numbers': ['10']}
            ];

            var formatter = new GoogleDataTableFormatter({}, {}, '2017-01-01', 1);

            var results = formatter.groupCountPullRequests(input, 6);

            assert.deepEqual(results, expected, "We should only show the top 3 pull requesters, alphabetically");
        });
    });

    suite('#formatFlatTable()', function() {
        test('fully_formed_entry', function() {
            var formatter = new GoogleDataTableFormatter({}, {}, '2017-01-01', 1);

            var inputData = {
                '123456': {
                    'a' : 'https://avatars.githubusercontent.com/u/600190?v=3',
                    'c' : '2017-03-01',
                    'x' : '2017-04-01',
                    'm' : '2017-05-01',
                    'u' : 'convenient'
                }
            };

            var expected = [
                [
                    new Date('2017', '02', '01'),   //created
                    new Date('2017', '04', '01'),   //merged
                    new Date('2017', '03', '01'),   //closed
                    'convenient',
                    'https://avatars.githubusercontent.com/u/600190?v=3',
                    '123456'
                ]
            ];

            assert.deepEqual(formatter.formatFlatTable(inputData), expected);
        });
        test('missing_dates', function() {
            var formatter = new GoogleDataTableFormatter({}, {}, '2017-01-01', 1);

            var inputData = {
                '123456': {
                    'a' : 'https://avatars.githubusercontent.com/u/600190?v=3',
                    'u' : 'convenient'
                }
            };

            var expected = [
                [
                    new Date('2099', '00', '01'),   //created
                    new Date('2099', '00', '01'),   //merged
                    new Date('2099', '00', '01'),   //closed
                    'convenient',
                    'https://avatars.githubusercontent.com/u/600190?v=3',
                    '123456'
                ]
            ];

            assert.deepEqual(formatter.formatFlatTable(inputData), expected);
        });
    });
});
