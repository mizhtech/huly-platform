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
  type TxCreateDoc,
  type TxMixin,
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
        const permissionTarget = await this.getPermissionTarget(ctx, cud, permission)
        if (permissionTarget === undefined) continue
        if (this.isCreatorAllowed(ctx, permissionTarget, permission)) continue
        if (await this.isIdentityUpdate(ctx, cud)) continue
        this.forbidden()
      }
    }
  }

  private async getPermissionTarget (
    ctx: MeasureContext<SessionData>,
    tx: TxCUD<Doc>,
    permission: Permission
  ): Promise<Doc | null | undefined> {
    if (
      (permission.txClass === undefined || tx._class === permission.txClass) &&
      (permission.objectClass === undefined ||
        this.context.hierarchy.isDerived(tx.objectClass, permission.objectClass)) &&
      this.matchesQuery(tx, permission)
    ) {
      if (permission.allowCreator !== true) return null
      if (tx._class === core.class.TxCreateDoc) return null
      return (await this.findAll(ctx, tx.objectClass, { _id: tx.objectId }, { limit: 1 }))[0] ?? null
    }

    if (permission.includeAttached !== true || permission.objectClass === undefined) return undefined

    const attached = await this.getAttachedTarget(ctx, tx)
    if (
      attached === undefined ||
      !this.context.hierarchy.isDerived(attached.attachedToClass, permission.objectClass)
    ) return undefined

    const parent = (
      await this.findAll(ctx, attached.attachedToClass, { _id: attached.attachedTo }, { limit: 1 })
    )[0]
    return parent ?? null
  }

  private async getAttachedTarget (
    ctx: MeasureContext<SessionData>,
    tx: TxCUD<Doc>
  ): Promise<{ attachedTo: Ref<Doc>, attachedToClass: Ref<Class<Doc>> } | undefined> {
    if (tx._class === core.class.TxCreateDoc) {
      const attributes = (tx as TxCreateDoc<Doc>).attributes as {
        attachedTo?: Ref<Doc>
        attachedToClass?: Ref<Class<Doc>>
      }
      if (attributes.attachedTo === undefined || attributes.attachedToClass === undefined) return undefined
      return { attachedTo: attributes.attachedTo, attachedToClass: attributes.attachedToClass }
    }

    const target = (
      await this.findAll(ctx, tx.objectClass, { _id: tx.objectId }, { limit: 1 })
    )[0] as (Doc & { attachedTo?: Ref<Doc>, attachedToClass?: Ref<Class<Doc>> }) | undefined
    if (target?.attachedTo === undefined || target.attachedToClass === undefined) return undefined
    return { attachedTo: target.attachedTo, attachedToClass: target.attachedToClass }
  }

  private isCreatorAllowed (
    ctx: MeasureContext<SessionData>,
    target: Doc | null,
    permission: Permission
  ): boolean {
    if (permission.allowCreator !== true || target?.createdBy === undefined) return false

    const account = ctx.contextData.account
    return target.createdBy === account.primarySocialId || account.socialIds.includes(target.createdBy)
  }

  private async isIdentityUpdate (ctx: MeasureContext<SessionData>, tx: TxCUD<Doc>): Promise<boolean> {
    if (
      tx._class !== core.class.TxCreateDoc &&
      tx._class !== core.class.TxUpdateDoc &&
      tx._class !== core.class.TxMixin
    ) return false

    const access = this.context.hierarchy.classHierarchyMixin(tx.objectClass, core.mixin.TxAccessLevel)
    if (access?.isIdentity !== true) return false

    if (tx._class === core.class.TxCreateDoc) {
      const createTx = tx as TxCreateDoc<Doc>
      const personUuid = (createTx.attributes as { personUuid?: string }).personUuid
      if (personUuid !== ctx.contextData.account.uuid) return false

      const existing = await this.findAll(ctx, tx.objectClass, { personUuid }, { limit: 1 })
      return existing.length === 0
    }

    const docs = await this.findAll(ctx, tx.objectClass, { _id: tx.objectId }, { limit: 1 })
    const target = docs[0] as (Doc & { personUuid?: string }) | undefined
    if (target?.personUuid !== ctx.contextData.account.uuid) return false

    if (tx._class === core.class.TxMixin) {
      const mixinTx = tx as TxMixin<Doc, Doc>
      if (this.context.hierarchy.hasMixin(target, mixinTx.mixin)) return true

      // A newly joined workspace member must be able to bootstrap identity mixins
      // on their own identity document. Role permissions still prevent applying
      // the same mixin to another person's identity.
      return true
    }

    return true
  }

  private canManagePolicy (ctx: MeasureContext<SessionData>, privileged: boolean): boolean {
    return privileged || ctx.contextData.account.role === AccountRole.Owner
  }

  private isPolicyClass (objectClass: Ref<Class<Doc>>): boolean {
    return protectedPolicyClasses.some((target) => this.context.hierarchy.isDerived(objectClass, target))
  }

  private matchesQuery (tx: TxCUD<Doc>, permission: Permission): boolean {
    if (permission.txMatch === undefined) return true
    return matchQuery([tx], permission.txMatch, tx._class, this.context.hierarchy, true).length > 0
  }

  private forbidden (): never {
    throw new PlatformError(new Status(Severity.ERROR, platform.status.Forbidden, {}))
  }
}
