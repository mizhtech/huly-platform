import core, { AccountRole, type ModulePermissionGroup, type Permission, type Ref } from '@hcengineering/core'
import { type Builder } from '@hcengineering/model'

import inventory from './plugin'

export function createInventoryPermissions (builder: Builder): void {
  const userPermissions: Ref<Permission>[] = []

  for (const [id, txClass, objectClass] of [
    [inventory.permission.UserUpdateCategory, core.class.TxUpdateDoc, inventory.class.Category],
    [inventory.permission.UserRemoveCategory, core.class.TxRemoveDoc, inventory.class.Category],
    [inventory.permission.UserUpdateProduct, core.class.TxUpdateDoc, inventory.class.Product],
    [inventory.permission.UserRemoveProduct, core.class.TxRemoveDoc, inventory.class.Product],
    [inventory.permission.UserUpdateVariant, core.class.TxUpdateDoc, inventory.class.Variant],
    [inventory.permission.UserRemoveVariant, core.class.TxRemoveDoc, inventory.class.Variant]
  ] as const) {
    builder.createDoc(
      core.class.Permission,
      core.space.Model,
      {
        label: inventory.string.ConfigLabel,
        txClass,
        objectClass,
        forbid: true,
        allowCreator: true,
        includeAttached: id === inventory.permission.UserUpdateProduct
      },
      id
    )
    userPermissions.push(id)
  }

  builder.createDoc<ModulePermissionGroup>(
    core.class.ModulePermissionGroup,
    core.space.Model,
    {
      application: inventory.app.Inventory,
      role: AccountRole.User,
      permissions: userPermissions,
      enabled: true
    },
    inventory.permissionGroup.User
  )

  const guestPermissions: Ref<Permission>[] = []
  for (const [id, objectClass] of [
    [inventory.permission.GuestMutateCategory, inventory.class.Category],
    [inventory.permission.GuestMutateProduct, inventory.class.Product],
    [inventory.permission.GuestMutateVariant, inventory.class.Variant]
  ] as const) {
    builder.createDoc(
      core.class.Permission,
      core.space.Model,
      {
        label: inventory.string.ConfigLabel,
        objectClass,
        forbid: true
      },
      id
    )
    guestPermissions.push(id)
  }

  for (const [id, role] of [
    [inventory.permissionGroup.Guest, AccountRole.Guest],
    [inventory.permissionGroup.DocGuest, AccountRole.DocGuest],
    [inventory.permissionGroup.ReadOnlyGuest, AccountRole.ReadOnlyGuest]
  ] as const) {
    builder.createDoc<ModulePermissionGroup>(
      core.class.ModulePermissionGroup,
      core.space.Model,
      {
        application: inventory.app.Inventory,
        role,
        permissions: guestPermissions,
        enabled: true
      },
      id
    )
  }
}
