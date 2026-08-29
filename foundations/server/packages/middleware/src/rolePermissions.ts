import core, {
  AccountRole,
  matchQuery,
  type Class,
  type Doc,
  type MeasureContext,
  type ModulePermissionGroup,
  type Permission,
  type Ref,
  type SessionData,
  type Tx,
  type TxApplyIf,
  type TxCUD,
  TxProcessor
} from '@hcengineering/core'
import platform, { PlatformError, Severity, Status } from '@hcengineering/platform'
import { BaseMiddleware, type Middleware, type PipelineContext, type TxMiddlewareResult } from '@hcengineering/server-core'
import { isSystem } from './utils'

const protectedPolicyClasses: Ref<Class<Doc>>[] = [
  core.class.Permission,
  core.class.ClassPermission,
  core.class.AttributePermission,
  core.class.ModulePermissionGroup
]

export class RolePermissionsMiddleware extends BaseMiddleware implements Middleware {
  static async create (
    ctx: MeasureContext,
    context: PipelineContext,
    next: Middleware | undefined
  ): Promise<RolePermissionsMiddleware> {
    return new RolePermissionsMiddleware(context, next)
  }

  async tx (ctx: MeasureContext<SessionData>, txes: Tx[]): Promise<TxMiddlewareResult> {
    const account = ctx.contextData.account
    const privileged =
      isSystem(account, ctx) || ctx.contextData.admin === true || account.role === AccountRole.Admin

    for (const tx of txes) {
      await this.checkTx(ctx, tx, privileged)
    }

    return await this.provideTx(ctx, txes)
  }

  private async checkTx (ctx: MeasureContext<SessionData>, tx: Tx, privileged: boolean): Promise<void> {
    if (tx._class === core.class.TxApplyIf) {
      for (const inner of (tx as TxApplyIf).txes) await this.checkTx(ctx, inner, privileged)
      return
    }
    if (!TxProcessor.isExtendsCUD(tx._class)) return

    const cud = tx as TxCUD<Doc>
    if (this.isPolicyClass(cud.objectClass) && !this.canManagePolicy(ctx, privileged)) this.forbidden()
    if (privileged) return

    const groups = this.context.modelDb.findAllSync(core.class.ModulePermissionGroup, {
      role: ctx.contextData.account.role
    }) as ModulePermissionGroup[]
    const permissions = this.context.modelDb.findAllSync(core.class.Permission, {}) as Permission[]
    const byId = new Map(permissions.map((p) => [p._id, p]))

    for (const group of groups) {
      if (group.enabled === false) continue
      const disabled = new Set(group.disabledPermissions ?? [])
      for (const id of group.permissions) {
        if (disabled.has(id)) continue
        const permission = byId.get(id)
        if (permission?.forbid !== true) continue
        if (!this.matches(cud, permission)) continue
        this.forbidden()
      }
    }
  }

  private canManagePolicy (ctx: MeasureContext<SessionData>, privileged: boolean): boolean {
    return privileged || ctx.contextData.account.role === AccountRole.Owner
  }

  private isPolicyClass (objectClass: Ref<Class<Doc>>): boolean {
    return protectedPolicyClasses.some((target) => this.context.hierarchy.isDerived(objectClass, target))
  }

  private matches (tx: TxCUD<Doc>, permission: Permission): boolean {
    if (permission.txClass !== undefined && tx._class !== permission.txClass) return false
    if (
      permission.objectClass !== undefined &&
      !this.context.hierarchy.isDerived(tx.objectClass, permission.objectClass)
    ) return false
    if (permission.txMatch !== undefined) {
      return matchQuery([tx], permission.txMatch, tx._class, this.context.hierarchy, true).length > 0
    }
    return true
  }

  private forbidden (): never {
    throw new PlatformError(new Status(Severity.ERROR, platform.status.Forbidden, {}))
  }
}
