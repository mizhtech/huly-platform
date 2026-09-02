<!--
// Copyright © 2026 Hardcore Engineering Inc.
// SPDX-License-Identifier: EPL-2.0
-->
<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'
  import { Label } from '@hcengineering/ui'
  import type { IntlString } from '@hcengineering/platform'
  import tracker from '../../plugin'

  /**
   * Keyboard-shortcut help overlay. Triggered by `?` or `Shift+/`
   * from anywhere on the Gantt view. Lists every keyboard binding the
   * Gantt currently honours so power users don't have to discover them
   * by accident. Esc dismisses.
   */
  const dispatch = createEventDispatcher<{ close: undefined }>()

  function onKey (e: KeyboardEvent): void {
    if (e.key === 'Escape' || e.key === '?') {
      e.preventDefault()
      dispatch('close')
    }
  }
  onMount(() => {
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  })

  interface Row {
    key: string
    label: IntlString
  }
  const rows: Row[] = [
    { key: '?', label: tracker.string.GanttHelpShowHelp },
    { key: '←  →', label: tracker.string.GanttHelpMoveOneDay },
    { key: 'Shift+←  Shift+→', label: tracker.string.GanttHelpMoveSevenDays },
    { key: '+ / =', label: tracker.string.GanttHelpZoomIn },
    { key: '−', label: tracker.string.GanttHelpZoomOut },
    { key: 'T', label: tracker.string.GanttHelpJumpToday },
    { key: 'D', label: tracker.string.GanttHelpZoomDay },
    { key: 'W', label: tracker.string.GanttHelpZoomWeek },
    { key: 'M', label: tracker.string.GanttHelpZoomMonth },
    { key: 'Q', label: tracker.string.GanttHelpZoomQuarter },
    { key: 'E', label: tracker.string.GanttHelpExportPng },
    { key: 'Esc', label: tracker.string.GanttHelpCancelAction },
    { key: 'Alt + drag', label: tracker.string.GanttHelpBypassCascade }
  ]
</script>

<div class="help-popup">
  <div class="header">
    <Label label={tracker.string.GanttHelpTitle} />
  </div>
  <div class="body">
    {#each rows as r (r.key)}
      <div class="row">
        <kbd>{r.key}</kbd>
        <span><Label label={r.label} /></span>
      </div>
    {/each}
  </div>
  <div class="footer">
    <span class="hint"><Label label={tracker.string.GanttHelpEsc} /></span>
  </div>
</div>

<style lang="scss">
  .help-popup {
    background: var(--theme-popup-color);
    border: 1px solid var(--theme-popup-divider);
    border-radius: 8px;
    box-shadow: var(--theme-popup-shadow);
    color: var(--theme-content-color);
    width: 460px;
    padding: 16px;
  }
  .header {
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 12px;
  }
  .body {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .row {
    display: grid;
    grid-template-columns: 180px 1fr;
    align-items: center;
    gap: 12px;
    font-size: 12px;
  }
  kbd {
    display: inline-block;
    padding: 2px 6px;
    background: var(--theme-bg-color);
    border: 1px solid var(--theme-divider-color);
    border-radius: 3px;
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 11px;
    color: var(--theme-content-color);
  }
  .footer {
    margin-top: 14px;
    padding-top: 10px;
    border-top: 1px solid var(--theme-popup-divider);
    font-size: 11px;
    color: var(--theme-content-trans-color);
  }
</style>
