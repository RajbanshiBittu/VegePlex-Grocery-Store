const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mysql@password25',
    database: 'VegePlexDB'
});

// Handle connection errors and reconnect
function handleDisconnect(connection) {
    connection.on('error', function(err) {
        console.log('Database error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect(connection);
        } else {
            throw err;
        }
    });
}

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database with connection id ' + connection.threadId);
});

handleDisconnect(connection);

module.exports = connection;
