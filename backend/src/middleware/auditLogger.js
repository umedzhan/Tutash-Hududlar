import AuditLog from '../models/AuditLog.js';

export async function logAction({ req, action, entity, entityId, diff }) {
  try {
    await AuditLog.create({
      userId: req.user?.id || null,
      action,
      entity,
      entityId,
      diff,
      ip: req.ip,
    });
  } catch (err) {
    console.error('[auditLogger] yozib bo\'lmadi:', err.message);
  }
}
