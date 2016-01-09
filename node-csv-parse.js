// node-csv-parse.js
// Created by Caleb Everett <everettcaleb95@gmail.com>
// Licensed under GPL-2.0
"use strict";
!()=>{
    // ========================
    // Library
    // ========================

    // Generator function for strings that yields one character at a time
    // str: String to iterate through
    function *stringGen(str) {
        yield* str;
    }

    // Yields one token at a time (value, '\n', or undefined)
    // gen: Generator that returns one character at a time
    // separator: The separator character, use ',' for CSV and '\t' for TAB
    function *tokenize(gen, separator) {
        var t = '',
            n = null,
            inQuotes = false;

        while(true) {
            n = gen.next();
            if(n.done) {
                if(inQuotes) {
                    switch(n.value) {
                        case '"':
                            inQuotes = false;
                            return t;
                        default:
                            t += n.value;
                            return t;
                    }
                }
                else {
                    switch(n.value) {
                        case separator:
                            if(t.length) {
                                return t;
                            }
                            return undefined;
                        case '"':
                            return;
                        case '\n':
                            if(t.length) {
                                yield t;
                            }
                            return '\n';
                        default:
                            t += n.value;
                            return t;
                    }
                }
            }
            else {
                if(inQuotes) {
                    switch(n.value) {
                        case '"':
                            inQuotes = false;
                            yield t;
                            t = '';
                            break;
                        default:
                            t += n.value;
                    }
                }
                else {
                    switch(n.value) {
                        case separator:
                            yield t;
                            t = '';
                            break;
                        case '"':
                            inQuotes = true;
                            break;
                        case '\n':
                            if(t.length) {
                                yield t;
                                t = '';
                            }
                            yield '\n';
                            break;
                        default:
                            t += n.value;
                    }
                }
            }
        }
    }

    // Yields one row (in array form) at a time
    // gent: The token generator, should return a token for gent.next()
    function *buildRow(gent) {
        var a = [],
            n = null,
            doneWithRow = false;

        while(true) {
            n = gent.next();

            switch(n.value) {
                case undefined:
                    break;
                case '\n':
                    doneWithRow = true;
                    break;
                default:
                    a.push(n.value.trim());
            }

            if(n.done) {
                return a;
            }
            else if(doneWithRow) {
                yield a;
                a = [];
                doneWithRow = false;
            }
        }
    }

    // Yields one row (in array form) at a time (including header row)
    // str: The CSV/TAB string
    // separator: The separator character, use ',' for CSV and '\t' for TAB
    function *generateRows(str, separator) {
        yield* buildRow(tokenize(stringGen(str), separator));
    }

    // Yields one row (in object form) at a time (excludes header row)
    // str: The CSV/TAB string
    // separator: The separator character, use ',' for CSV and '\t' for TAB
    function *generateRowsAsObject(str, separator) {
        var gen = buildRow(tokenize(stringGen(str), separator)),
            n = gen.next(),
            r = {},
            header = n.value;

        if(n.done) {
            return {};
        }

        while(true) {
            r = {};
            n = gen.next();
            n.value.forEach((c, i) => {
                r[header[i]] = c;
            });

            if(n.done) {
                return r;
            }
            else {
                yield r;
            }
        }
    }

    // Parses a CSV/TAB file as an array of rows (where each row is an array of values)
    // str: The CSV/TAB string
    // separator: The separator character, use ',' for CSV and '\t' for TAB
    function parseAsRows(str, separator) {
        var rows = [];
        for(let row of buildRow(tokenize(stringGen(str), separator))) {
            rows.push(row);
        }
        return rows;
    }

    // Parses a CSV/TAB file as an array of row objects (header row names the fields of the row objects)
    // str: The CSV/TAB string
    // separator: The separator character, use ',' for CSV and '\t' for TAB
    function parseAsObjects(str, separator) {
        var rows = parseAsRows(str, separator),
            header = rows[0];

        return rows.slice(1).map((row) => {
            var r = {};
            row.forEach((c, i) => {
                r[header[i]] = c;
            });
            return r;
        });
    }

    // ========================
    // Exports
    // ========================

    // Simple utility function for parsing that returns bound short-hand functions
    // str: The CSV/TAB string
    // separator: The separator character, use ',' for CSV and '\t' for TAB, optional: defaults to ','
    // EXAMPLE:
    //   var csv = require('node-csv-parse')(data).asRows();
    // - or -
    //   var tabfile = require('node-csv-parse')(data, '\t').asObjects();
    // END EXAMPLE
    module.exports = function(str, separator) {
        separator = separator || ',';
        return {
            asRows: parseAsRows.bind(null, str, separator),
            asObjects: parseAsObjects.bind(null, str, separator)
        };
    };

    module.exports.parseAsRows = parseAsRows;
    module.exports.parseAsObjects = parseAsObjects;
    module.exports.generateRows = generateRows;
    module.exports.generateRowsAsObject = generateRowsAsObject;
}();
