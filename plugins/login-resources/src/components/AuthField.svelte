<script lang="ts">
  import type { IntlString } from '@hcengineering/platform'
  import { Label } from '@hcengineering/ui'
  import AuthIcons from './icons/AuthIcons.svelte'

  export let value = ''
  export let label: IntlString
  export let name: string
  export let icon: 'mail' | 'lock' | 'user' | 'briefcase' = 'mail'
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
.auth-field {
    position: relative;
    display: flex;
    align-items: center;
    min-height: 4rem;
    border: 1px solid #dce1ee;
    border-radius: .82rem;
    background: rgba(255,255,255,.72);
    color: #53607b;
    overflow: hidden;
    box-shadow: 0 4px 14px rgba(79, 91, 139, .035);
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
  }
  .auth-field:hover { background: rgba(255,255,255,.9); border-color:#cfd6e7; }
  .auth-field:focus-within { border-color: #8a91ee; box-shadow: 0 0 0 3px rgba(99, 108, 232, .1); background:white; }
  .auth-field__icon { width: 3.8rem; display: flex; justify-content: center; color:#6270d9; }
  .auth-field__label { position: absolute; left: 3.8rem; pointer-events: none; color: #99a1b4; }
  input { flex: 1; align-self: stretch; min-width: 0; padding: 1.15rem 3rem 1.15rem 0; border: 0; outline: 0; background: transparent; color: #1d2742; font: inherit; }
  .auth-field__reveal { position: absolute; right: .85rem; display: flex; padding: .45rem; border: 0; background: transparent; color: #77819b; cursor: pointer; }
  .auth-field__reveal:hover { color:#5862ba; }
  .disabled { opacity: .6; }
</style>
