'use strict';

var mysql = require('mysql');
var moment = require('moment');

function createHash() {
    var time = moment.utc().valueOf().toString(36),
        rand = Math.floor((Math.random() * 36 * 36)).toString(36);
    return rand.length === 1 ? time + '0' + rand : time + rand;
}

var config = {
    'mysql': {
        hostname: 'localhost',
        username: '',
        password: '',
        schema: '',
        table: ''
    }
};

exports.configure = function (options) {
    if (options.mysql) {
        config.mysql.hostname = options.mysql.hostname;
        config.mysql.username = options.mysql.username;
        config.mysql.password = options.mysql.password;
        config.mysql.schema = options.mysql.schema;
        config.mysql.table = options.mysql.table;
    }
}

exports.config = function () { return config; }

exports.shortenUrl = function (url) {
    return new Promise(function (resolve, reject) {

        // get URL from datastore
        var hash = createHash(),
            connection = mysql.createConnection({
                host     : config.mysql.hostname,
                user     : config.mysql.username,
                password : config.mysql.password,
                database : config.mysql.schema
            }),
            sql = 'SELECT * FROM `' + config.mysql. table + '` WHERE `url` = ? LIMIT 1';

        connection.connect();

        // check for existing entry
        connection.query(sql, [url], function (err, results, fields) {
            if (err) {
                connection.end();
                reject(err);
                return;
            }

            if (results.length >= 1) {
                // record found, return existing code
                resolve(results[0].hash);
                connection.end();
                return;
            }

            sql = 'INSERT INTO `' + config.mysql.table + '` (`url`, `hash`) VALUES (?, ?)';
            connection.query(sql, [url, hash], function (err, results, fields) {
                if (err) {
                    connection.end();
                    reject(err);
                    return;
                }

                if (connection.rowsAffected === 1) {
                    // success, record inserted
                    connection.end();
                    resolve(hash);
                    return;
                }
            });
        });
    });
};

exports.fetchByHash = function (hash) {
    return new Promise(function (resolve, reject) {

        // get a hash from the datastore
        var connection = mysql.createConnection({
                host     : config.mysql.hostname,
                user     : config.mysql.username,
                password : config.mysql.password,
                database : config.mysql.schema
            }),
            sql = 'SELECT * FROM `' + config.mysql.table + '` WHERE `hash` = ? LIMIT 1';

        connection.connect();

        connection.query(sql, [hash], function (err, results, fields) {
            if (err) {
                connection.end();
                reject(err);
                return;
            }

            resolve(results);
            connection.end();
            return;
        });

    });
}
