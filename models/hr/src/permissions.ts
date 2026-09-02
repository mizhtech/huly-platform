import contact from '@hcengineering/contact'
import core from '@hcengineering/core'
import { type Builder } from '@hcengineering/model'
import hr from './plugin'

export function definePermissions (builder: Builder): void {
  builder.createDoc(core.class.Permission, core.space.Model, {
    label: hr.string.ForbidCreateDepartmentPermission,
    txClass: core.class.TxCreateDoc,
    objectClass: hr.class.Department,
    forbid: true,
    scope: 'workspace'
  }, hr.permission.ForbidCreateDepartment)

  builder.createDoc(core.class.Permission, core.space.Model, {
    label: hr.string.ForbidUpdateDepartmentPermission,
    txClass: core.class.TxUpdateDoc,
    objectClass: hr.class.Department,
    forbid: true,
    scope: 'workspace'
  }, hr.permission.ForbidUpdateDepartment)

  builder.createDoc(core.class.Permission, core.space.Model, {
    label: hr.string.ForbidRemoveDepartmentPermission,
    txClass: core.class.TxRemoveDoc,
    objectClass: hr.class.Department,
    forbid: true,
    scope: 'workspace'
  }, hr.permission.ForbidRemoveDepartment)

  builder.createDoc(core.class.Permission, core.space.Model, {
    label: hr.string.ForbidUpdateStaffDepartmentPermission,
    txClass: core.class.TxMixin,
    objectClass: contact.class.Person,
    txMatch: {
      mixin: hr.mixin.Staff,
      'attributes.department': { $exists: true }
    },
    forbid: true,
    scope: 'workspace'
  }, hr.permission.ForbidUpdateStaffDepartment)
}
