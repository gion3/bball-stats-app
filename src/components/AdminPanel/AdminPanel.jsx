import { useState, useEffect } from 'react';
import './AdminPanel.css';

const AdminPanel = () => {
    const [currentDate, setCurrentDate] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        fetchCurrentDate();
    }, []);

    const fetchCurrentDate = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/current-date');
            const data = await response.json();
            if (data.currentDate) {
                setCurrentDate(data.currentDate);
            }
        } catch (err) {
            console.error('Error fetching current date:', err);
            setMessage('Error fetching current date');
        }
    };

    const handleDateUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/admin/current-date', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ date: currentDate }),
            });

            const data = await response.json();
            setMessage('Date updated successfully');
        } catch (err) {
            console.error('Error updating date:', err);
            setMessage('Error updating date');
        }
    };

    return (
        <div className="admin-panel">
            <h2>Admin Panel</h2>
            <div className="admin-section">
                <h3>Set Current Date</h3>
                <form onSubmit={handleDateUpdate}>
                    <div className="form-group">
                        <label htmlFor="currentDate">Current Date:</label>
                        <input
                            type="date"
                            id="currentDate"
                            value={currentDate}
                            onChange={(e) => setCurrentDate(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit">Update Date</button>
                </form>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default AdminPanel;