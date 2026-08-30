<!--
// Copyright © 2020 Anticrm Platform Contributors.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import type { Status } from '@hcengineering/platform'
  import { Severity } from '@hcengineering/platform'

  import { Status as StatusControl } from '@hcengineering/ui'

  export let status: Status
</script>

{#if status.severity !== Severity.OK}
  <div class="flex-row-center container" class:error={status.severity === Severity.ERROR}>
    <StatusControl {status} overflow={false} />
  </div>
{/if}

<style lang="scss">
.container {
    min-height: 3rem;
    padding: .65rem .9rem;
    color: #53607b;
    background: rgba(245, 247, 255, .85);
    border: 1px solid #dce1ee;
    border-radius: .75rem;
  }
  .error {
    color: var(--system-error-color);
    fill: var(--system-error-color);
    background: rgba(255, 245, 246, .92);
    border-color: var(--system-error-60-color);
  }
</style>
