const pool = require('../config/database');

const logAudit = async (userId, userName, actionType, description, entityType = null, entityId = null, req = null, metadata = null) => {
  try {
    // Check if IDs are integers
    const safeUserId = Number.isInteger(Number(userId)) ? userId : 0;
    const safeEntityId = Number.isInteger(Number(entityId)) ? entityId : null;

    // If IDs are strings, store them in metadata
    const enhancedMetadata = {
      ...(metadata || {}),
      originalUserId: userId,
      originalEntityId: entityId
    };

    await pool.query(
      `INSERT INTO audit_logs (user_id, user_name, action_type, action_description, entity_type, entity_id, ip_address, user_agent, metadata)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        safeUserId,
        userName,
        actionType,
        description,
        entityType,
        safeEntityId,
        req?.ip || req?.connection?.remoteAddress,
        req?.get('user-agent'),
        JSON.stringify(enhancedMetadata)
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

const auditMiddleware = (actionType) => {
  return async (req, res, next) => {
    const originalJson = res.json.bind(res);

    res.json = function (data) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const user = req.user || req.body || {};
        const userId = user.id || req.body.id || null;
        const userName = user.name || user.email || 'System';

        let description = `${actionType} - ${req.method} ${req.originalUrl}`;
        let entityType = null;
        let entityId = null;

        if (req.params.id) entityId = req.params.id;
        if (req.originalUrl.includes('/jobs')) entityType = 'job';
        if (req.originalUrl.includes('/candidates')) entityType = 'candidate';
        if (req.originalUrl.includes('/users')) entityType = 'user';
        if (req.originalUrl.includes('/accounts')) entityType = 'account';

        logAudit(userId, userName, actionType, description, entityType, entityId, req, req.body);
      }
      return originalJson(data);
    };

    next();
  };
};

module.exports = { logAudit, auditMiddleware };
