import type { Builder } from '@hcengineering/model'
import core from '@hcengineering/core'
import tracker from '@hcengineering/tracker'

export function definePermissions (builder: Builder): void {
  builder.createDoc(
    core.class.Permission,
    core.space.Model,
    {
      label: tracker.string.ForbidCreateProjectPermission,
      txClass: core.class.TxCreateDoc,
      objectClass: tracker.class.Project,
      forbid: true,
      scope: 'workspace',
      description: tracker.string.ForbidCreateProjectPermissionDescription
    },
    tracker.permission.ForbidCreateProject
  )

  builder.createDoc(core.class.Permission, core.space.Model, {
    label: tracker.string.ForbidUpdateProjectPermission,
    txClass: core.class.TxUpdateDoc,
    objectClass: tracker.class.Project,
    forbid: true,
    scope: 'workspace',
    txMatch: { operations: { $ne: { $inc: { sequence: 1 } } } }
  }, tracker.permission.ForbidUpdateProject)
  builder.createDoc(core.class.Permission, core.space.Model, {
    label: tracker.string.ForbidProjectMixinPermission,
    txClass: core.class.TxMixin,
    objectClass: tracker.class.Project,
    forbid: true,
    scope: 'workspace'
  }, tracker.permission.ForbidProjectMixin)
  builder.createDoc(core.class.Permission, core.space.Model, {
    label: tracker.string.ForbidRemoveProjectPermission,
    txClass: core.class.TxRemoveDoc,
    objectClass: tracker.class.Project,
    forbid: true,
    scope: 'workspace'
  }, tracker.permission.ForbidRemoveProject)
}
