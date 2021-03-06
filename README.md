# mage2stats

[![Build Status](https://travis-ci.org/convenient/mage2stats.svg?branch=master)](https://travis-ci.org/convenient/mage2stats)

http://www.mage2stats.com

This website aims to work as an addendum to the standard analytics available on GitHub.

The graphs and tables generated by this repository will allow us to track the flow of Issues and Pull Requests over time, and to easily gauge any improvements in GitHub activity. The graphs are grouped by month, this is to smooth out the data and allows us to spot trends a bit easier.

Pull Requests are welcome and if anyone wants to throw together a favicon that would also be neat ;)

If you like this repo/website/data then please give this a star, thanks!

## Running the monthly update

Handle your forking, branching, and merging as any normal PR.  

You can regenerate the data via the CLI, as GitHub does not allow more than 60 unauthenticated requests per hour you will need to provide a token.

```bash
cp config.json.sample config.json
#Go to https://github.com/settings/tokens and create a token, it requires no special permissions.
#edit config.json to contain your token
```

Run the data report, this will take a few minutes. Use the text output at the end of the script to update the `docs/index.html` file.
```bash
$ ./bin/generateDataWarehouse
Getting pull requests
Getting issues
Processing
####################################################################################################
Edit docs/index.html so that the meta data reads:
####################################################################################################
The stats for January. PRs 60 opened, 4 merged, 16 closed. Issues 288 opened, 163 closed.
####################################################################################################
```

Git add, commit, push, PR.
```bash
git add docs/js/DataWarehouse.js
git add docs/index.html
```

## Developer Notes

The entry point for the website is `docs/index.html`.

### Javascript

The following will build the javascript that is handled by browserify and uglify. 

```bash
$ npm install
$ npm run build

> mage2stats@1.0.0 build /src/mage2stats
> ./bin/build.sh
```

The remaining javascript lives in `docs/js/GoogleVizHandler.js` and is committed directly there. I didn't want to go down the rabbit hole of forcing Google Viz to do things it wasn't going to do easily.  

## Tests

The following will run both the mocha and the phpunit test suite.

```bash
$ composer install -o
$ npm install
$ npm test
```

## License

This project is licensed under the terms of the MIT license.
