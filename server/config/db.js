const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../db/database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to SQLite database at:', dbPath);
  }
});

// Wrapper to mimic pg.query interface
module.exports = {
  query: (text, params = []) => {
    // Convert $1, $2, etc. to ? for SQLite
    const sql = text.replace(/\$\d+/g, () => '?');
    // console.log('SQL generated:', sql); // Debug log
    
    return new Promise((resolve, reject) => {
      if (sql.trim().toLowerCase().startsWith('select') || sql.toUpperCase().includes('RETURNING')) {
        db.all(sql, params, (err, rows) => {
          if (err) reject(err);
          else resolve({ rows });
        });
      } else {
        db.run(sql, params, function(err) {
          if (err) reject(err);
          else resolve({ rows: [], lastID: this.lastID, changes: this.changes });
        });
      }
    });
  },
  db // Export raw db if needed
};
