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
.workspace-item { display:flex; align-items:center; width:100%; min-height:5.25rem; padding:.9rem 1rem; gap:.9rem; border:1px solid #dfe3ed; border-radius:.9rem; background:rgba(255,255,255,.72); color:#1b2540; text-align:left; cursor:pointer; box-shadow:0 5px 16px rgba(75,86,132,.035); transition:transform .15s ease,box-shadow .15s ease,border-color .15s ease,background .15s ease; }
  .workspace-item:hover:not(:disabled) { transform:translateY(-1px); background:#fff; border-color:#cfd5e5; box-shadow:0 10px 24px rgba(75,86,132,.08); }
  .workspace-avatar { flex:0 0 3.65rem; height:3.65rem; border-radius:.72rem; display:flex; align-items:center; justify-content:center; color:white; font-size:1.25rem; font-weight:650; box-shadow:inset 0 1px 0 rgba(255,255,255,.24); }
  .workspace-copy { flex:1; min-width:0; display:flex; flex-direction:column; gap:.34rem; }
  .workspace-name { display:flex; align-items:center; gap:.7rem; font-size:1rem; font-weight:650; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .workspace-meta { font-size:.78rem; color:#858ea3; letter-spacing:.01em; }
</style>
