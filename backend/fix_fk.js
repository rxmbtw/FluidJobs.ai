const pool = require('./config/database');

async function fixFk() {
    try {
        await pool.query('ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_user_id_fkey');
        console.log('✅ Dropped account_users_user_id_fkey constraint');
        await pool.query('ALTER TABLE account_users DROP CONSTRAINT IF EXISTS account_users_account_id_fkey');
        console.log('✅ Dropped account_users_account_id_fkey constraint');
    } catch (e) {
        console.error('Error dropping constraint:', e);
    } finally {
        pool.end();
    }
}

fixFk();
