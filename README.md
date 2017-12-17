# Short URL

This provides functionality to create a short alphanumeric hashes to be used as an alias for a URL. Hashes and URL associations are stored in a MySQL database.

## Getting Started

Create a database, and use the module to create short URIs, and to retrieve the original URLs from the database.

### Prerequisites

A MySQL server is required.

### Installing

Create the database
```sql
CREATE DATABASE short_url;
```

Create the data table
```sql
CREATE TABLE IF NOT EXISTS short_urls (
  `url_hash_id` INT(11) UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  `hash` VARCHAR(255),
  `url` VARCHAR(1000),
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(`hash`),
  UNIQUE(`url`)
);
```

## Usage
Load and configure
```js
var shortUrl = require('short-url');
```

Setting options, and configuring the database connection
```js
shortUrl.configure({
    mysql: {
        hostname: 'localhost',
        username: 'root',
        password: '',
        schema: 'short_url',
        table: 'short_urls'
    }
});
```

### Shorten a URL
*.shortenUrl(url)*
* param url string The long URL
* return Promise

This method will create a short code to be used as an alias for the long URL. The promise will return the code on success, or an error upon failure

Example:
```js
var url = 'https://my-long-url.com?params=many';

urlShortener.shortenUrl(url)
    .then(function (code) {
            // success! the code can be used as the URI
        })
    .catch(function (err) {
            // it failed - err is an instance of Error
        });
```

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

| Version | Release Date | Description |
| ------- | ------------ | ----------- |
| 1.0.0 | Nov 24, 2017 | Initial release |

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/pmorris/short-url/tags).

## Authors

* **Philip Morris** - *Initial work* - (https://github.com/pmorris)

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details
