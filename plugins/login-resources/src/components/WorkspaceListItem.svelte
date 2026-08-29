<script lang="ts">
  import type { WorkspaceInfoWithStatus } from '@hcengineering/core'
  import { isActiveMode, isArchivingMode } from '@hcengineering/core'
  import presentation from '@hcengineering/presentation'
  import { Label } from '@hcengineering/ui'
  import AuthIcons from './icons/AuthIcons.svelte'
  export let workspace: WorkspaceInfoWithStatus
  export let loading = false

  const palette = ['#ef5a34', '#1aa65a', '#6941c6', '#3765d8', '#c77919']
  $: source = (workspace.url || workspace.name || 'WS').toUpperCase()
  $: initials = source.replace(/[^A-Z0-9]/g, '').slice(0, 2) || 'WS'
  $: hash = [...workspace.uuid].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  $: color = palette[hash % palette.length]
</script>
<button type="button" class="workspace-item" disabled={loading} on:click>
  <span class="workspace-avatar" style:background={color}>{initials}</span>
  <span class="workspace-copy">
    <span class="workspace-name">{workspace.name ?? workspace.url}</span>
    <span class="workspace-meta">
      {#if isArchivingMode(workspace.mode)}<Label label={presentation.string.Archived} />{:else if !isActiveMode(workspace.mode)}{workspace.processingProgress}%{:else}{workspace.url.toUpperCase()}{/if}
    </span>
  </span>
  <AuthIcons name="chevron" size={21} />
</button>
<style lang="scss">
  .workspace-item { display:flex; align-items:center; width:100%; min-height:6rem; padding:1rem 1.15rem; gap:1rem; border:1px solid rgba(255,255,255,.11); border-radius:1rem; background:rgba(25,37,102,.2); color:white; text-align:left; cursor:pointer; }
  .workspace-item:hover:not(:disabled) { background:rgba(57,70,158,.28); border-color:rgba(255,255,255,.2); }
  .workspace-avatar { flex:0 0 4.1rem; height:4.1rem; border-radius:.75rem; display:flex; align-items:center; justify-content:center; font-size:1.45rem; font-weight:600; }
  .workspace-copy { flex:1; min-width:0; display:flex; flex-direction:column; gap:.42rem; }
  .workspace-name { display:flex; align-items:center; gap:.7rem; font-size:1.1rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .workspace-meta { font-size:.82rem; color:rgba(255,255,255,.56); }
</style>
