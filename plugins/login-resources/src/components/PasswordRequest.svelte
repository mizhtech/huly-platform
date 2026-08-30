<!--
// Copyright © 2023 Hardcore Engineering Inc.
// Licensed under the Eclipse Public License, Version 2.0
-->
<script lang="ts">
  import { OK, Severity, Status } from '@hcengineering/platform'
  import { Label } from '@hcengineering/ui'

  import login from '../plugin'
  import { goTo, requestPassword } from '../utils'
  import AuthField from './AuthField.svelte'
  import AuthIcons from './icons/AuthIcons.svelte'
  import StatusControl from './StatusControl.svelte'

  export let signUpDisabled = false

  let email = ''
  let status: Status<any> = OK
  let sent = false
  let submitting = false

  async function recover (): Promise<void> {
    if (email.trim() === '' || submitting) return
    submitting = true
    status = new Status(Severity.INFO, login.status.ConnectingToServer, {})
    const result = await requestPassword(email.trim())
    status = result
    sent = result === OK
    submitting = false
  }
</script>

<div class="recovery-form">
  <div class="recovery-form__hero"><AuthIcons name="sparkles" size={25} /></div>

  {#if sent}
    <div class="recovery-form__heading">
      <h1><Label label={login.string.RecoveryEmailSent} /></h1>
      <p><Label label={login.string.RecoveryEmailSentDescription} /></p>
    </div>
    <button class="primary" type="button" on:click={() => goTo('login')}>
      <span><Label label={login.string.BackToLogin} /></span><AuthIcons name="arrow" size={19} />
    </button>
  {:else}
    <div class="recovery-form__heading">
      <h1><Label label={login.string.PasswordRecovery} /></h1>
      <p><Label label={login.string.ForgotPasswordSubtitle} /></p>
    </div>

    <AuthField bind:value={email} label={login.string.EnterAccountEmail} name="email" icon="mail" type="email" autocomplete="email" disabled={submitting} />
    <StatusControl {status} />

    <button class="primary" type="button" disabled={email.trim() === '' || submitting} on:click={recover}>
      <span><Label label={login.string.SendRecoveryLink} /></span><AuthIcons name="arrow" size={19} />
    </button>
  {/if}

  <div class="divider"><span></span><Label label={login.string.Or} /><span></span></div>
  <button class="secondary" type="button" on:click={() => goTo('login')}>
    <span><Label label={login.string.KnowPassword} /> <b><Label label={login.string.LogIn} /></b></span><AuthIcons name="chevron" size={18} />
  </button>
  {#if !signUpDisabled}
    <button class="secondary" type="button" on:click={() => goTo('signup')}>
      <span><Label label={login.string.DoNotHaveAnAccount} /> <b><Label label={login.string.SignUp} /></b></span><AuthIcons name="chevron" size={18} />
    </button>
  {/if}
</div>

<style lang="scss">
  .recovery-form { width:100%; max-width:27rem; margin:auto; padding:1.35rem 1rem; color:#17203b; }
  .recovery-form__hero { width:4.25rem; height:4.25rem; margin:0 auto 1rem; display:flex; align-items:center; justify-content:center; border-radius:1rem; color:white; background:linear-gradient(145deg,#6674ff,#934df2); box-shadow:0 12px 28px rgba(103,82,224,.24); }
  .recovery-form__heading { text-align:center; margin-bottom:1.8rem; }
  h1 { margin:0; font-size:1.75rem; line-height:1.2; font-weight:700; }
  p { margin:.55rem 0 0; color:#8a92a7; line-height:1.45; }
  .primary { width:100%; min-height:3.75rem; margin-top:1rem; display:flex; align-items:center; justify-content:center; gap:.75rem; border:0; border-radius:.82rem; color:white; font:inherit; font-weight:600; cursor:pointer; background:linear-gradient(100deg,#8999ff,#b783ef); }
  .primary:disabled { opacity:.5; cursor:default; }
  .divider { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:1rem; margin:1.45rem 0 .7rem; color:#a0a7b7; font-size:.82rem; }
  .divider span { height:1px; background:#e2e5ee; }
  .secondary { width:100%; min-height:2.65rem; display:flex; align-items:center; justify-content:space-between; padding:0 .25rem; border:0; background:transparent; color:#667085; font:inherit; cursor:pointer; text-align:left; }
  .secondary b { color:#665bd7; font-weight:500; }
</style>
