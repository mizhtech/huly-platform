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
  .action-row { display:flex; align-items:center; width:100%; min-height:3.2rem; gap:.9rem; padding:0 .3rem; border:0; background:transparent; color:rgba(255,255,255,.9); cursor:pointer; font:inherit; text-align:left; }
  .action-row:hover:not(:disabled) { color:white; }
  .action-row__icon { width:2rem; display:flex; justify-content:center; }
  .action-row__label { flex:1; }
</style>
