//
// Copyright © 2026 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { getEmbeddedLabel, type IntlString } from '@hcengineering/platform'
import task from '@hcengineering/task'
import type { IssueStatus } from '@hcengineering/tracker'

import tracker from '../plugin'

interface ClassicStatusLabel {
  canonicalName: string
  label: IntlString
}

const classicStatusLabels: Readonly<Record<string, ClassicStatusLabel>> = {
  [tracker.status.Backlog]: {
    canonicalName: 'Backlog',
    label: tracker.string.Backlog
  },
  [tracker.status.Todo]: {
    canonicalName: 'Todo',
    label: task.string.Todo
  },
  [tracker.status.InProgress]: {
    canonicalName: 'In Progress',
    label: tracker.string.InProgress
  },
  [tracker.status.Done]: {
    canonicalName: 'Done',
    label: task.string.TaskStateDone
  },
  [tracker.status.Canceled]: {
    canonicalName: 'Canceled',
    label: tracker.string.Canceled
  }
}

/**
 * Localizes unchanged classic Tracker statuses while preserving renamed
 * defaults and user-created statuses exactly as stored in the database.
 */
export function getIssueStatusLabel (status: IssueStatus): IntlString {
  const localized = classicStatusLabels[status._id]

  if (localized == null || localized.canonicalName !== status.name) {
    return getEmbeddedLabel(status.name)
  }

  return localized.label
}
