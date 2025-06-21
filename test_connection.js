const mysql = require('mysql');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Mysql@password25',
    database: 'VegePlexDB'
});

connection.connect(function(err) {
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + connection.threadId);
    
    // Test query
    connection.query('SELECT 1 + 1 AS solution', function (error, results, fields) {
        if (error) {
            console.error('Error in query:', error);
        } else {
            console.log('Test query result:', results[0].solution);
        }
        
        // Close the connection
        connection.end(function(err) {
            if (err) {
                console.error('Error closing connection:', err);
            } else {
                console.log('Connection closed successfully');
            }
        });
    });
}); 