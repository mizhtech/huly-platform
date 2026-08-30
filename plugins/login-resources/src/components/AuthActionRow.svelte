<script lang="ts">
  import type { IntlString } from '@hcengineering/platform'
  import { Label } from '@hcengineering/ui'
  import AuthIcons from './icons/AuthIcons.svelte'
  export let label: IntlString
  export let icon: 'user' | 'mail' = 'user'
  export let disabled = false
</script>
<button type="button" class="action-row" {disabled} on:click>
  <span class="action-row__icon"><AuthIcons name={icon} size={20} /></span>
  <span class="action-row__label"><Label {label} /></span>
  <AuthIcons name="chevron" size={18} />
</button>
<style lang="scss">
.action-row {
    display: flex;
    align-items: center;
    width: 100%;
    min-height: 3.05rem;
    gap: .9rem;
    padding: 0 .45rem;
    border: 0;
    border-radius: .65rem;
    background: transparent;
    color: #35415d;
    cursor: pointer;
    font: inherit;
    text-align: left;
    transition: background .15s ease, color .15s ease;
  }
  .action-row:hover:not(:disabled) { color: #202a47; background: rgba(92, 103, 196, .055); }
  .action-row__icon { width: 2rem; display: flex; justify-content: center; color:#6872d7; }
  .action-row__label { flex: 1; }
</style>
