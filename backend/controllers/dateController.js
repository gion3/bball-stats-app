const db = require('../db/database');

// Get the current date setting
const getCurrentDate = (req, res) => {
    const sql = `SELECT crt_date FROM app_settings WHERE id = 1`;
    
    db.get(sql, [], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            // If no date is set, return today's date
            const today = new Date().toISOString().split('T')[0];
            res.json({ currentDate: today });
            return;
        }
        res.json({ currentDate: row.crt_date });
    });
};

// Update the current date setting
const updateCurrentDate = (req, res) => {
    const { date } = req.body;
    
    if (!date) {
        res.status(400).json({ error: 'Date is required' });
        return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
        res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
        return;
    }

    const sql = `
        INSERT INTO app_settings (id, crt_date) 
        VALUES (1, ?) 
        ON CONFLICT(id) DO UPDATE SET crt_date = ?
    `;

    db.run(sql, [date, date], function(err) {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ 
            message: 'Date updated successfully',
            currentDate: date
        });
    });
};

module.exports = {
    getCurrentDate,
    updateCurrentDate
};