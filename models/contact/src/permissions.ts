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
}
