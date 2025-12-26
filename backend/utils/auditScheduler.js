const cron = require('node-cron');
const pool = require('../config/database');

// Run daily at 2 AM to purge old audit logs
const startAuditLogPurgeScheduler = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🗑️ Running scheduled audit log purge...');
      
      const settings = await pool.query('SELECT retention_days, auto_purge_enabled FROM audit_settings LIMIT 1');
      
      if (settings.rows.length === 0 || !settings.rows[0].auto_purge_enabled) {
        console.log('⏭️ Auto-purge disabled, skipping...');
        return;
      }
      
      const retentionDays = settings.rows[0].retention_days;
      
      const result = await pool.query(
        'DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL \'1 day\' * $1 RETURNING id',
        [retentionDays]
      );
      
      console.log(`✅ Purged ${result.rowCount} old audit logs (older than ${retentionDays} days)`);
    } catch (error) {
      console.error('❌ Error purging audit logs:', error);
    }
  });
  
  console.log('📅 Audit log purge scheduler started (runs daily at 2 AM)');
};

module.exports = { startAuditLogPurgeScheduler };
