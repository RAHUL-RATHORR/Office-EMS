const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, './db/database.sqlite');
const db = new sqlite3.Database(dbPath);

const empId = 7; // Rahul's ID

console.log('--- STARTING MANUAL DELETE TEST FOR ID:', empId);

db.serialize(() => {
    db.run("DELETE FROM attendance WHERE employee_id = ?", [empId], (err) => {
        if (err) console.error('Error deleting attendance:', err);
        else console.log('Attendance deleted');
    });

    db.run("DELETE FROM leaves WHERE employee_id = ?", [empId], (err) => {
        if (err) console.error('Error deleting leaves:', err);
        else console.log('Leaves deleted');
    });

    db.run("DELETE FROM work_reports WHERE employee_id = ?", [empId], (err) => {
        if (err) console.error('Error deleting reports:', err);
        else console.log('Reports deleted');
    });

    db.run("DELETE FROM employees WHERE id = ?", [empId], function(err) {
        if (err) {
            console.error('CRITICAL ERROR DELETING EMPLOYEE:', err);
        } else {
            console.log('EMPLOYEE DELETED! Changes:', this.changes);
        }
        db.close();
    });
});
