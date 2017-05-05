var path = require('path'),
    rootPath = path.normalize(__dirname + '/..'),
    env = process.env.NODE_ENV || 'development';

var config = {
    development: {
        root: rootPath,
        app: {
            name: 'admin-module'
        },
        port: process.env.PORT || 3000,
        // database://user:password@database_address/database
        // see https://github.com/sequelize/cli
        db: 'mysql://root:root@127.0.0.1/nginx'
    },

    test: {
        root: rootPath,
        app: {
            name: 'admin-module'
        },
        port: process.env.PORT || 3000,
        db: 'mysql://localhost/admin-module-test'
    },

    production: {
        root: rootPath,
        app: {
            name: 'admin-module'
        },
        port: process.env.PORT || 3000,
        db: 'mysql://localhost/admin-module-production'
    }
};

module.exports = config[env];