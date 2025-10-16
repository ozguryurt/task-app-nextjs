import mysql from 'mysql2/promise';

// connection pool
const pool = mysql.createPool({
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'task-app-nextjs',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0
});

// Bağlantı testi
pool.getConnection()
    .then(connection => {
        console.log('✅ MySQL bağlantısı başarılı');
        connection.release();
    })
    .catch(err => {
        console.error('❌ MySQL bağlantı hatası:', err.message);
    });

export default pool;

