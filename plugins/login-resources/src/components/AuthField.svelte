<script lang="ts">
  import type { IntlString } from '@hcengineering/platform'
  import { Label } from '@hcengineering/ui'
  import AuthIcons from './icons/AuthIcons.svelte'

  export let value = ''
  export let label: IntlString
  export let name: string
  export let icon: 'mail' | 'lock' | 'briefcase' = 'mail'
  export let type: 'text' | 'email' | 'password' = 'text'
  export let autocomplete: string | undefined = undefined
  export let disabled = false

  let reveal = false
</script>

<label class="auth-field" class:disabled>
  <span class="auth-field__icon"><AuthIcons name={icon} size={21} /></span>
  {#if value === ''}<span class="auth-field__label"><Label {label} /></span>{/if}
  {#if type === 'password'}
    {#if reveal}
      <input bind:value {name} type="text" {autocomplete} {disabled} aria-label={name} />
    {:else}
      <input bind:value {name} type="password" {autocomplete} {disabled} aria-label={name} />
    {/if}
  {:else if type === 'email'}
    <input bind:value {name} type="email" {autocomplete} {disabled} aria-label={name} />
  {:else}
    <input bind:value {name} type="text" {autocomplete} {disabled} aria-label={name} />
  {/if}
  {#if type === 'password'}
    <button class="auth-field__reveal" type="button" on:click={() => (reveal = !reveal)} aria-label="Toggle password visibility">
      <AuthIcons name={reveal ? 'eye' : 'eye-off'} size={20} />
    </button>
  {/if}
</label>

<style lang="scss">
  .auth-field { position: relative; display:flex; align-items:center; min-height:4.6rem; border:1px solid rgba(255,255,255,.14); border-radius:.85rem; background:rgba(10,17,55,.18); color:rgba(255,255,255,.78); overflow:hidden; }
  .auth-field:focus-within { border-color:rgba(101,113,255,.75); box-shadow:0 0 0 2px rgba(76,88,255,.12); }
  .auth-field__icon { width:4.2rem; display:flex; justify-content:center; opacity:.9; }
  .auth-field__label { position:absolute; left:4.2rem; pointer-events:none; color:rgba(255,255,255,.48); }
  input { flex:1; align-self:stretch; min-width:0; padding:1.35rem 3.2rem 1.35rem 0; border:0; outline:0; background:transparent; color:white; font:inherit; }
  .auth-field__reveal { position:absolute; right:1rem; display:flex; padding:.45rem; border:0; background:transparent; color:rgba(255,255,255,.7); cursor:pointer; }
  .disabled { opacity:.6; }
</style>
