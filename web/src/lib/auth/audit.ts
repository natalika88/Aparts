import { prisma } from "@/lib/prisma";

export async function writeAuditLog(params: {
  userId: string | null;
  entityType: string;
  entityId: string;
  action: string;
  before?: unknown;
  after?: unknown;
}) {
  await prisma.auditLog.create({
    data: {
      userId: params.userId,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      beforeJson: params.before ? JSON.stringify(params.before) : null,
      afterJson: params.after ? JSON.stringify(params.after) : null,
    },
  });
}
