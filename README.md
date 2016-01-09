# node-csv-parse
A simple JavaScript library that uses generators to parse CSV/tab-delimited files. No dependencies except mocha for testing.
Currently only tested in Node v5.0.0. With a few light modifications, it may work in browsers that support ES6 Generators.

### Getting Started

Install via npm

    npm install --save node-csv-parse

Use in your code like this

    var parser = require('node-csv-parse'),
        fs = require('fs');

    fs.readFile('test.csv', 'utf8', (err, data) => {
        if(err) { throw err; }
        console.log(parser(data).asObjects());
    });

### Known Issues

See [here](https://github.com/everettcaleb/node-csv-parse/issues).

### License

Licensed under [GPL-2.0](LICENSE).

### Credits

Created by Caleb Everett
