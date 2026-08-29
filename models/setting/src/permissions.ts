import core from '@hcengineering/core'
import { type Builder } from '@hcengineering/model'
import setting from './plugin'

export function definePermissions (builder: Builder): void {
  builder.createDoc(core.class.Permission, core.space.Model, { label: setting.string.ForbidCreateEnumPermission, txClass: core.class.TxCreateDoc, objectClass: core.class.Enum, forbid: true, scope: 'workspace' }, setting.permission.ForbidCreateEnum)
  builder.createDoc(core.class.Permission, core.space.Model, { label: setting.string.ForbidUpdateEnumPermission, txClass: core.class.TxUpdateDoc, objectClass: core.class.Enum, forbid: true, scope: 'workspace' }, setting.permission.ForbidUpdateEnum)
  builder.createDoc(core.class.Permission, core.space.Model, { label: setting.string.ForbidRemoveEnumPermission, txClass: core.class.TxRemoveDoc, objectClass: core.class.Enum, forbid: true, scope: 'workspace' }, setting.permission.ForbidRemoveEnum)
}
