import core, {
  AccountRole,
  getCurrentAccount,
  type Class,
  type Doc,
  type ModulePermissionGroup,
  type Permission,
  type Ref,
  type Tx
} from '@hcengineering/core'
import { getClient } from '@hcengineering/presentation'

export function isRoleActionForbidden (txClass: Ref<Class<Tx>>, objectClass: Ref<Class<Doc>>): boolean {
  const account = getCurrentAccount()
  if (account.role === AccountRole.Admin) return false
  const client = getClient()
  const model = client.getModel()
  const hierarchy = client.getHierarchy()
  const groups = model.findAllSync(core.class.ModulePermissionGroup, { role: account.role }) as ModulePermissionGroup[]
  const permissions = model.findAllSync(core.class.Permission, {}) as Permission[]
  const byId = new Map(permissions.map((p) => [p._id, p]))

  return groups.some((group) => {
    if (group.enabled === false) return false
    const disabled = new Set(group.disabledPermissions ?? [])
    return group.permissions.some((id) => {
      if (disabled.has(id)) return false
      const permission = byId.get(id)
      return permission?.forbid === true &&
        permission.txClass === txClass &&
        (permission.objectClass === undefined || hierarchy.isDerived(objectClass, permission.objectClass))
    })
  })
}

export function isRoleUpdateForbidden (doc: Doc): boolean {
  if (!isRoleActionForbidden(core.class.TxUpdateDoc, doc._class)) return false

  const account = getCurrentAccount()
  const hierarchy = getClient().getHierarchy()
  const access = hierarchy.classHierarchyMixin(doc._class, core.mixin.TxAccessLevel)
  if (access?.isIdentity === true && (doc as Doc & { personUuid?: string }).personUuid === account.uuid) return false

  return true
}
