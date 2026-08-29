import core from '@hcengineering/core'
import { type Builder } from '@hcengineering/model'
import contact from './plugin'

export function definePermissions (builder: Builder): void {
  builder.createDoc(core.class.Permission, core.space.Model, {
    label: contact.string.ForbidCreateContactPermission,
    txClass: core.class.TxCreateDoc,
    objectClass: contact.class.Contact,
    forbid: true,
    scope: 'workspace'
  }, contact.permission.ForbidCreateContact)

  builder.createDoc(core.class.Permission, core.space.Model, {
    label: contact.string.ForbidCreateEmployeePermission,
    txClass: core.class.TxMixin,
    objectClass: contact.class.Person,
    txMatch: { mixin: contact.mixin.Employee },
    forbid: true,
    scope: 'workspace'
  }, contact.permission.ForbidCreateEmployee)

  builder.createDoc(core.class.Permission, core.space.Model, {
    label: contact.string.ForbidUpdateContactPermission,
    txClass: core.class.TxUpdateDoc,
    objectClass: contact.class.Contact,
    forbid: true,
    scope: 'workspace'
  }, contact.permission.ForbidUpdateContact)

  builder.createDoc(core.class.Permission, core.space.Model, {
    label: contact.string.ForbidRemoveContactPermission,
    txClass: core.class.TxRemoveDoc,
    objectClass: contact.class.Contact,
    forbid: true,
    scope: 'workspace'
  }, contact.permission.ForbidRemoveContact)
}
