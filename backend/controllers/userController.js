const admin = require('firebase-admin');
const db = require('../db/database');

const serviceAccount = require('../config/bball-stats-app-firebase-adminsdk-fbsvc-fce168dafa.json'); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

/**
 * @desc Synchronizes Firebase user with local database
 * @route POST /api/users/sync
 * @access Private (requires Firebase ID token)
 */
exports.syncUser = async (req, res) => {
  console.log('--- syncUser endpoint hit ---');
  const { token } = req.body;

  if (!token) {
    console.log('Error: No token provided.');
    return res.status(401).json({ message: 'Authorization token not found.' });
  }
  console.log('Token received.');

  try {
    console.log('Verifying Firebase token...');
    // Verify the ID token - NOTE: This will fail until the Admin SDK is initialized
    const decodedToken = await admin.auth().verifyIdToken(token);
    const { uid, email, name } = decodedToken;
    console.log('Token verified successfully. UID:', uid);

    // Check if user exists in our local DB
    console.log('Checking for user in local DB...');
    db.get('SELECT * FROM users WHERE firebase_uid = ?', [uid], (err, user) => {
      if (err) {
        console.error('Database error during user check:', err.message);
        return res.status(500).json({ message: 'Database error', error: err.message });
      }

      if (!user) {
        // User does not exist, insert them
        console.log('User not found. Inserting new user...');
        const stmt = db.prepare('INSERT INTO users (firebase_uid, email, display_name) VALUES (?, ?, ?)');
        stmt.run(uid, email, name || null, function(err) {
          if (err) {
            console.error('Database error during user insert:', err.message);
            return res.status(500).json({ message: 'Failed to create user', error: err.message });
          }
          console.log('User created successfully. New user ID:', this.lastID);
          res.status(201).json({ message: 'User created and synced', userId: this.lastID });
        });
        stmt.finalize();
      } else {
        // User exists. Check if we need to update their display name.
        if (!user.display_name && name) {
            console.log('User found, but display_name is missing. Updating...');
            db.run('UPDATE users SET display_name = ? WHERE firebase_uid = ?', [name, uid], (updateErr) => {
                if (updateErr) {
                    console.error('Database error during display_name update:', updateErr.message);
                } else {
                    console.log('Display name updated successfully for user:', uid);
                }
                // Respond after attempting update. The main goal (sync) was successful.
                res.status(200).json({ message: 'User synced and display name updated', userId: user.id });
            });
        } else {
            // User exists and display_name is already set, or no new name to set.
            console.log('User already exists in DB. User ID:', user.id);
            res.status(200).json({ message: 'User already synced', userId: user.id });
        }
      }
    });
  } catch (error) {
    console.error('--- Error in syncUser catch block ---');
    console.error('Error verifying token:', error.message);
    res.status(401).json({ message: 'Invalid token or authentication failed.', error: error.message });
  }
}; 