<!--
// Copyright © 2022 Hardcore Engineering Inc.
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
  import type { WorkspaceInfoWithStatus } from '@hcengineering/core'
  import login, { loginId } from '@hcengineering/login'
  import { getResource } from '@hcengineering/platform'
  import { isAdminUser } from '@hcengineering/presentation'
  import {
    closePopup,
    getCurrentLocation,
    IconAdd,
    IconCheck,
    isSameSegments,
    Label,
    Loading,
    type Location,
    locationStorageKeyId,
    locationToUrl,
    navigate,
    resolvedLocationStore
  } from '@hcengineering/ui'
  import { workbenchId } from '@hcengineering/workbench'
  import { onMount } from 'svelte'

  import { workspacesStore } from '../utils'

  onMount(() => {
    void getResource(login.function.GetWorkspaces).then(async (f) => {
      $workspacesStore = await f()
    })
  })

  function getWorkspaceLink (ws: WorkspaceInfoWithStatus): string {
    const loc: Location = { path: [workbenchId, ws.url] }
    return locationToUrl(loc)
  }

  function workspaceInitials (ws: WorkspaceInfoWithStatus): string {
    const code = ws.url.trim()
    if (code === '') return 'WS'
    const parts = code.split(/[^a-zA-Z0-9]+/).filter(Boolean)
    if (parts.length > 1) return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase()
    return code.slice(0, 2).toUpperCase()
  }

  function workspaceColor (ws: WorkspaceInfoWithStatus): string {
    let hash = 0
    for (const char of ws.uuid) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
    return `hsl(${hash % 360} 55% 48%)`
  }

  async function clickHandler (e: MouseEvent, wsUrl: string): Promise<void> {
    if (!e.metaKey && !e.ctrlKey) {
      e.preventDefault()
      closePopup()
      const current = getCurrentLocation()
      if (wsUrl !== current.path[1]) {
        let last: Location | undefined
        try {
          last = JSON.parse(localStorage.getItem(`${locationStorageKeyId}_${wsUrl}`) ?? '')
        } catch (err: any) {
          // Ignore invalid stored location.
        }
        if (last != null && isSameSegments(last, current, 2)) navigate(last)
        else navigate({ path: [workbenchId, wsUrl] })
      }
    }
  }

  function createWorkspace (): void {
    closePopup()
    navigate({ path: [loginId, 'createWorkspace'] })
  }

  let activeElement: HTMLElement
  const btns: HTMLElement[] = []

  function focusTarget (target: HTMLElement): void {
    activeElement = target
  }

  const keyDown = (ev: KeyboardEvent): void => {
    if (ev.key === 'Tab') {
      ev.preventDefault()
      ev.stopPropagation()
    }
    const n = btns.indexOf(activeElement)
    if (ev.key === 'ArrowDown' && n < btns.length - 1) {
      activeElement = btns[Math.max(0, n + 1)]
      activeElement?.focus()
      ev.preventDefault()
      ev.stopPropagation()
    }
    if (ev.key === 'ArrowUp' && n > 0) {
      activeElement = btns[n - 1]
      activeElement?.focus()
      ev.preventDefault()
      ev.stopPropagation()
    }
  }

  $: isAdmin = isAdminUser()
</script>

{#if $workspacesStore.length}
  <!-- svelte-ignore a11y-no-static-element-interactions -->
  <div class="antiPopup workspace-switcher" on:keydown={keyDown}>
    <div class="workspace-list">
      {#each $workspacesStore.slice(0, 500) as ws, i}
        {@const selected = $resolvedLocationStore.path[1] === ws.url}
        <a
          class="stealth workspace-link"
          href={getWorkspaceLink(ws)}
          on:click={async (e) => {
            await clickHandler(e, ws.url)
          }}
        >
          <button
            bind:this={btns[i]}
            class="workspace-item"
            class:selected
            class:hover={btns[i] === activeElement}
            on:mousemove={() => focusTarget(btns[i])}
            on:focus={() => focusTarget(btns[i])}
          >
            <div class="workspace-avatar" style:background-color={workspaceColor(ws)}>
              {workspaceInitials(ws)}
            </div>
            <div class="workspace-info">
              <span class="workspace-code">{ws.url.toUpperCase()}</span>
              <span class="workspace-name">{ws.name ?? ws.url}</span>
            </div>
            <div class="workspace-check">
              {#if selected}<IconCheck size={'small'} />{/if}
            </div>
          </button>
        </a>
      {/each}
    </div>

    {#if isAdmin}
      <div class="workspace-action">
        <button class="add-workspace" on:click={createWorkspace}>
          <IconAdd size={'small'} />
          <Label label={login.string.AddWorkspace} />
        </button>
      </div>
    {/if}
  </div>
{:else}
  <div class="antiPopup workspace-switcher"><Loading /></div>
{/if}

<style lang="scss">
  .workspace-switcher {
    width: 22rem;
    max-width: calc(100vw - 1rem);
    padding: 0.5rem;
  }

  .workspace-list {
    max-height: min(28rem, calc(100vh - 10rem));
    overflow-y: auto;
  }

  .workspace-link {
    display: block;
  }

  .workspace-item,
  .add-workspace {
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  .workspace-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 4.25rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    text-align: left;
  }

  .workspace-item:hover,
  .workspace-item.hover,
  .workspace-item.selected {
    background-color: var(--theme-button-hovered);
  }

  .workspace-avatar {
    display: flex;
    flex: 0 0 2.75rem;
    width: 2.75rem;
    height: 2.75rem;
    align-items: center;
    justify-content: center;
    border-radius: 0.5rem;
    color: white;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .workspace-info {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 0.125rem;
  }

  .workspace-code,
  .workspace-name {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .workspace-code {
    font-size: 0.9375rem;
    font-weight: 600;
  }

  .workspace-name {
    color: var(--theme-content-color);
    font-size: 0.8125rem;
  }

  .workspace-check {
    display: flex;
    width: 1.5rem;
    flex: 0 0 1.5rem;
    align-items: center;
    justify-content: center;
  }

  .workspace-action {
    margin-top: 0.5rem;
    padding-top: 0.5rem;
    border-top: 1px solid var(--theme-divider-color);
  }

  .add-workspace {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    min-height: 2.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    text-align: left;
  }

  .add-workspace:hover {
    background-color: var(--theme-button-hovered);
  }
</style>
