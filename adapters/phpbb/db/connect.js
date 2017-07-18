const mysql = require('mysql2/promise')

module.exports = (config) => mysql.createConnection(config)
