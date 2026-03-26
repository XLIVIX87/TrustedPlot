import { Prisma } from '@prisma/client';
import { prisma } from './prisma';

export async function createAuditLog(params: {
  actorUserId: string;
  actionType: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      actionType: params.actionType,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata
        ? (params.metadata as Prisma.InputJsonValue)
        : undefined,
      ipAddress: params.ipAddress,
    },
  });
}
