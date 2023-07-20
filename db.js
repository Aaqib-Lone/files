const mysql = require('mysql2/promise');

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'support_desk',
      port: 3306
    });

    console.log('Connected to MySQL database!');
    return connection;
  } catch (err) {
    console.error('Error connecting to MySQL database:', err);
    throw err;
  }
};

module.exports = createConnection;
