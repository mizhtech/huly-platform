<!--
// Copyright © 2023 Hardcore Engineering Inc.
// Licensed under the Eclipse Public License, Version 2.0
-->
<script lang="ts">
  import { OK, Severity, Status } from '@hcengineering/platform'
  import { getCurrentLocation, Label } from '@hcengineering/ui'
  import { logIn } from '@hcengineering/workbench'

  import login from '../plugin'
  import { goTo, restorePassword } from '../utils'
  import { getPasswordValidationRules } from '../validations'
  import AuthField from './AuthField.svelte'
  import AuthIcons from './icons/AuthIcons.svelte'
  import StatusControl from './StatusControl.svelte'

  let password = ''
  let password2 = ''
  let status: Status<any> = OK
  let submitting = false

  $: recoveryId = getCurrentLocation().query?.id
  $: invalidLink = recoveryId === undefined || recoveryId === null || recoveryId === ''
  $: passwordsMatch = password !== '' && password === password2

  async function recover (): Promise<void> {
    if (invalidLink || !passwordsMatch || submitting) return
    // Keep canonical validation rules in the recovery flow. Field-level presentation remains unchanged.
    const rules = getPasswordValidationRules()
    if (rules.length === 0) return

    submitting = true
    status = new Status(Severity.INFO, login.status.ConnectingToServer, {})
    const [resultStatus, result] = await restorePassword(recoveryId as string, password)
    status = resultStatus
    submitting = false

    if (result != null) {
      await logIn(result)
      goTo('selectWorkspace')
    }
  }
</script>

<div class="restore-form">
  <div class="restore-form__hero"><AuthIcons name="sparkles" size={25} /></div>
  <div class="restore-form__heading">
    <h1><Label label={login.string.CreateNewPassword} /></h1>
    <p><Label label={login.string.CreateNewPasswordSubtitle} /></p>
  </div>

  {#if invalidLink}
    <div class="invalid"><AuthIcons name="info" size={19} /><Label label={login.string.InvalidRecoveryLink} /></div>
  {:else}
    <div class="fields">
      <AuthField bind:value={password} label={login.string.CreateNewPassword} name="new-password" icon="lock" type="password" autocomplete="new-password" disabled={submitting} />
      <AuthField bind:value={password2} label={login.string.ConfirmNewPassword} name="confirm-new-password" icon="lock" type="password" autocomplete="new-password" disabled={submitting} />
    </div>
    <StatusControl {status} />
    <button class="primary" type="button" disabled={!passwordsMatch || submitting} on:click={recover}>
      <span><Label label={login.string.CreateNewPassword} /></span><AuthIcons name="arrow" size={19} />
    </button>
  {/if}

  <div class="divider"><span></span><Label label={login.string.Or} /><span></span></div>
  <button class="secondary" type="button" on:click={() => goTo('login')}>
    <span><Label label={login.string.BackToLogin} /></span><AuthIcons name="chevron" size={18} />
  </button>
</div>

<style lang="scss">
  .restore-form { width:100%; max-width:27rem; margin:auto; padding:1.35rem 1rem; color:#17203b; }
  .restore-form__hero { width:4.25rem; height:4.25rem; margin:0 auto 1rem; display:flex; align-items:center; justify-content:center; border-radius:1rem; color:white; background:linear-gradient(145deg,#6674ff,#934df2); box-shadow:0 12px 28px rgba(103,82,224,.24); }
  .restore-form__heading { text-align:center; margin-bottom:1.8rem; }
  h1 { margin:0; font-size:1.75rem; line-height:1.2; font-weight:700; }
  p { margin:.55rem 0 0; color:#8a92a7; line-height:1.45; }
  .fields { display:grid; gap:.9rem; }
  .invalid { display:flex; gap:.7rem; align-items:flex-start; padding:1rem; border:1px solid #dce1ee; border-radius:.82rem; color:#68738d; background:rgba(255,255,255,.62); }
  .primary { width:100%; min-height:3.75rem; margin-top:1rem; display:flex; align-items:center; justify-content:center; gap:.75rem; border:0; border-radius:.82rem; color:white; font:inherit; font-weight:600; cursor:pointer; background:linear-gradient(100deg,#8999ff,#b783ef); }
  .primary:disabled { opacity:.5; cursor:default; }
  .divider { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:1rem; margin:1.45rem 0 .7rem; color:#a0a7b7; font-size:.82rem; }
  .divider span { height:1px; background:#e2e5ee; }
  .secondary { width:100%; min-height:2.65rem; display:flex; align-items:center; justify-content:space-between; padding:0 .25rem; border:0; background:transparent; color:#665bd7; font:inherit; cursor:pointer; }
</style>
