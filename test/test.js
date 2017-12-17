var assert = require('assert');
// var request = require('request');
var shortUrl = require('../index.js');
var mysql = require('mysql');

var testConfig = {
    mysql: {
        hostname: 'localhost',
        username: 'root',
        password: '',
        schema: 'short_url',
        table: 'short_urls_test'
    },
    testTableName: 'short_urls_test',
    mainTableName: 'short_urls'
};

var connection = mysql.createConnection({
    host     : testConfig.mysql.hostname,
    user     : testConfig.mysql.username,
    password : testConfig.mysql.password,
    database : testConfig.mysql.schema
});


describe('Short URL', function () {

    before('setting up fixtures', function () {

        var createSchema = function(orig_schema, orig_table, next) {

                var sql = 'DROP TABLE IF EXISTS `?`.`?`';
                connection.query(sql, [testConfig.mysql.schema, testConfig.testTableName], function (err, results, fields) {
                    if (err) {
                        connection.end();
                        // console.log(err);
                        return;
                    }
                });
                // var sql = 'CREATE TABLE IF NOT EXISTS `' + testConfig.mysql.schema + '`.`' + testConfig.testTableName +'` SELECT * FROM `' + testConfig.mysql.schema + '`.`' + testConfig.mainTableName + '` WHERE 0';
                var sql = 'CREATE TABLE IF NOT EXISTS `' + testConfig.mysql.schema + '`.`' + testConfig.testTableName + '`'
                    + ' ( `url_hash_id` INT(11) UNSIGNED AUTO_INCREMENT,'
                    + '   `hash` VARCHAR(255) DEFAULT NULL,'
                    + '   `url` VARCHAR(1000) DEFAULT NULL,'
                    + '   `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,'
                    + '   PRIMARY KEY (`url_hash_id`),'
                    + '   UNIQUE KEY `hash` (`hash`),'
                    + '   UNIQUE KEY `url` (`url`)'
                    + ' ) ENGINE=INNODB DEFAULT CHARSET=utf8;';
                connection.query(sql, function (err, results, fields) {
                    if (err) {
                        connection.end();
                        return;
                    }

                    next();
                    return;
                });
            },
            volumize = function () {
                var sql = 'INSERT INTO `' + testConfig.mysql.schema + '`.`' + testConfig.testTableName + '` (url_hash_id, hash, url) VALUES (1, \'abcd\', \'http://google.com\');';
                connection.query(sql, function (err, results, fields) {
                    if (err) {
                        connection.end();
                        return;
                    }
                    return;
                })
            };

        shortUrl.configure(testConfig);
        connection.connect();
        createSchema('foo', 'bar', volumize);
    });

    after('cleaning up', function () {
        // connection.end();
    });


    describe('#config()', function() {

        it('should be a function', function () {
            assert.strictEqual(typeof shortUrl.config, 'function');
        });

        it('should return an object with attribute: mysql', function () {
            assert.ok(shortUrl.config().hasOwnProperty('mysql'));
        })
    });


    describe('#configure()', function () {
        it('should set the runtime mysql configuration', function () {
            shortUrl.configure(testConfig);
            assert.deepEqual(testConfig.mysql, shortUrl.config().mysql);
        });
    });


    // describe('promise test', function() {
    //     it('promise', function () {
    //         return new Promise( function (resolve, reject) {
    //             // resolve('promise resolved');
    //             reject(Error('promise fail'));
    //         })
    //         .then(function (result) {
    //             // done();
    //             assert.ok(true);
    //         }, function (err) {
    //             assert.ok(false, err);
    //         });
    //     });
    // });

    describe('#shortenUrl()', function () {

        it('should return a promise', function () {
            return shortUrl.shortenUrl('foo')
                .then(function (result) {
                    assert.ok(true);
                }, function (err) {
                    assert.ok(false, err);
                });
        });

        it('should resolve with a short code <= 10 characters', function () {
            return shortUrl.shortenUrl('foo2')
                .then(function (result) {
                        assert.strictEqual(typeof result, 'string', 'result is not a string');
                        assert.ok(result.length <= 10, 'result is longer than 10 characters');
                    }, function (err) {
                        assert.ok(false, err);
                    }
                );
        });

        it('should create a new short code for a unique URL', function () {
            return shortUrl.shortenUrl('http://google.com')
                .then(function (result) {
                        assert.strictEqual(typeof result, 'string', 'result is not a string');
                        assert.ok(result.length > 0, 'result an empty string');
                        assert.ok(result.length <= 10, 'result is longer than 10 characters');
                    }, function (err) {
                        assert.ok(false, err);
                    }
                );
        });

        it('should retrieve an existing code for a known URL', function () {
            return shortUrl.shortenUrl('http://google.com')
                .then(function (result) {
                        assert.strictEqual('abcd', result);
                    }, function (err) {
                        assert.ok(false, err);
                    }
                );
        });

    });

    describe('#fetchByHash()', function () {

        it('should return a promise', function () {
            var rval = shortUrl.fetchByHash('foo')
            assert.strictEqual(rval, Promise.resolve(rval));
            return rval;
        });



        it('`foo` should resolve to an empty array', function () {
            shortUrl.configure(testConfig);
            return shortUrl.fetchByHash('foo')
                    .then(function (result) {
                        assert.ok(result.hasOwnProperty('length'));
                        assert.strictEqual(result.length, 0);
                        }, function (err) {
                            assert.ok(false, err);
                        }, function (err) {
                            assert.ok(false, err);
                        }
                    );
        });

        it('`abcd` should resolve to http://google.com', function () {
            shortUrl.configure(testConfig);
            return shortUrl.fetchByHash('abcd')
                    .then(function (result) {
                        assert.ok(result.hasOwnProperty('length'));
                        assert.strictEqual(result.length, 1);
                        assert.strictEqual(result[0].url, 'http://google.com');
                    }, function () {
                        assert.ok(false, err);
                    }
                );
        });
    });
});

/*
mnrl.us/abcd --> track.monorail.io/visit/?a=1&b=2

request:
    url: mnrl.us/abcd
    ref: foo.com
response:
    code: 302
    redirect to: track.monorail.io/visit/?a=1&b=2&ref=foo.com


request:
    url: track.monorail.io/visit/?a=1&b=2&ref=foo.com
    ref: mnrl.us/abcd
response:
    code: 200
*/