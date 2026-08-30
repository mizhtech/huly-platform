<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021, 2022 Hardcore Engineering Inc.
// Licensed under the Eclipse Public License, Version 2.0.
-->
<script lang="ts">
  import { OK, Severity, Status } from '@hcengineering/platform'
  import { Label } from '@hcengineering/ui'
  import { logIn } from '@hcengineering/workbench'
  import { signupStore } from '@hcengineering/analytics-providers'
  import { onMount } from 'svelte'

  import login from '../plugin'
  import { goTo } from '../utils'
  import { OtpLoginSteps, signUp, signUpOtp } from '../index'
  import AuthField from './AuthField.svelte'
  import AuthIcons from './icons/AuthIcons.svelte'
  import OtpForm from './OtpForm.svelte'

  export let signUpDisabled = false
  export let localLoginHidden = false
  export let navigateUrl: string | undefined = undefined
  export let useOTP = true

  let withPassword = !useOTP
  let status: Status<any> = OK
  let step = OtpLoginSteps.Email
  let otpRetryOn = 0
  let submitting = false

  const object = { first: '', last: '', username: '', password: '', password2: '' }

  $: passwordMismatch = withPassword && object.password2 !== '' && object.password !== object.password2
  $: canSubmit = object.first.trim() !== '' && object.last.trim() !== '' && object.username.trim() !== '' &&
    (!withPassword || (object.password !== '' && object.password2 !== '' && !passwordMismatch)) && !submitting

  if (signUpDisabled || localLoginHidden) goTo('login')

  onMount(() => signupStore.setSignUpFlow(true))

  async function submit (): Promise<void> {
    if (!canSubmit) return
    submitting = true
    try {
      if (useOTP && !withPassword) {
        status = new Status(Severity.INFO, login.status.ConnectingToServer, {})
        const [otpStatus, result] = await signUpOtp(object.username, object.first, object.last)
        status = otpStatus
        if (result?.sent === true && otpStatus === OK) {
          step = OtpLoginSteps.Otp
          otpRetryOn = result.retryOn
        }
      } else {
        const [loginStatus, result] = await signUp(object.username, object.password, object.first, object.last)
        status = loginStatus
        if (result != null) {
          if (result.token != null) await logIn(result)
          goTo('confirmationSend')
        }
      }
    } finally {
      submitting = false
    }
  }

  function handleStep (event: CustomEvent<OtpLoginSteps>): void {
    step = event.detail
  }
</script>

{#if step === OtpLoginSteps.Email}
  <form class="signup" on:submit|preventDefault={submit} data-testid="signup-form">
    <div class="signup__hero">
      <div class="signup__mark"><AuthIcons name="sparkles" size={28} /></div>
      <h1><Label label={login.string.SignupTitle} /></h1>
      <p><Label label={login.string.SignupSubtitle} /></p>
    </div>

    <div class="signup__names">
      <AuthField bind:value={object.last} name="last" label={login.string.LastName} icon="user" autocomplete="family-name" />
      <AuthField bind:value={object.first} name="first" label={login.string.FirstName} icon="user" autocomplete="given-name" />
    </div>
    <AuthField bind:value={object.username} name="username" label={login.string.Email} icon="mail" type="email" autocomplete="email" />

    {#if withPassword}
      <AuthField bind:value={object.password} name="password" label={login.string.Password} icon="lock" type="password" autocomplete="new-password" />
      <AuthField bind:value={object.password2} name="password2" label={login.string.PasswordRepeat} icon="lock" type="password" autocomplete="new-password" />
      {#if passwordMismatch}<div class="signup__error"><Label label={login.status.FieldsDoNotMatch} params={{ field: 'password', field2: 'password2' }} /></div>{/if}
    {/if}

    <button class="signup__submit" type="submit" disabled={!canSubmit}>
      <span><Label label={login.string.SignupTitle} /></span><AuthIcons name="arrow" size={19} />
    </button>

    {#if useOTP}
      <button class="signup__mode" type="button" on:click={() => (withPassword = !withPassword)}>
        <Label label={withPassword ? login.string.SetPasswordLater : login.string.SetPasswordNow} />
      </button>
    {/if}

    <div class="signup__divider"><span /><Label label={login.string.Or} /><span /></div>
    <button class="signup__login" type="button" on:click={() => goTo('login')}>
      <AuthIcons name="user" size={20} />
      <span><Label label={login.string.AlreadyHaveAccount} /> <strong><Label label={login.string.LogIn} /></strong></span>
      <AuthIcons name="chevron" size={18} />
    </button>
  </form>
{/if}

{#if step === OtpLoginSteps.Otp && object.username !== ''}
  <OtpForm email={object.username} {signUpDisabled} {navigateUrl} loginState="signup" password={object.password} retryOn={otpRetryOn} on:step={handleStep} />
{/if}

<style lang="scss">
  .signup { display:flex; flex-direction:column; gap:.7rem; width:100%; padding:1.35rem 2.25rem 1rem; color:#17203b; }
  .signup__hero { text-align:center; margin-bottom:.1rem; }
  .signup__mark { display:flex; align-items:center; justify-content:center; width:3.75rem; height:3.75rem; margin:0 auto .7rem; border-radius:.95rem; color:white; background:linear-gradient(145deg,#6475f4,#8c4ff0); box-shadow:0 10px 24px rgba(105,79,231,.22); }
  h1 { margin:0; font-size:1.7rem; line-height:1.15; font-weight:700; letter-spacing:-.025em; }
  p { margin:.35rem 0 0; color:#8991a6; font-size:.9rem; }
  .signup__names { display:grid; grid-template-columns:1fr 1fr; gap:.75rem; }
  .signup__submit { display:flex; align-items:center; justify-content:center; gap:.8rem; min-height:3.35rem; margin-top:.05rem; border:0; border-radius:.82rem; color:white; font:inherit; font-weight:600; cursor:pointer; background:linear-gradient(100deg,#8194f5,#a36ce9); box-shadow:0 10px 24px rgba(112,93,224,.14); }
  .signup__submit:disabled { opacity:.5; cursor:default; box-shadow:none; }
  .signup__mode { align-self:center; padding:.05rem .4rem; border:0; background:transparent; color:#6670d8; cursor:pointer; font:inherit; font-size:.82rem; }
  .signup__divider { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:.8rem; color:#a2a9ba; font-size:.8rem; }
  .signup__divider span { height:1px; background:#e3e6ef; }
  .signup__login { display:grid; grid-template-columns:auto 1fr auto; align-items:center; gap:.8rem; padding:.25rem .15rem; border:0; background:transparent; color:#52607b; text-align:left; cursor:pointer; font:inherit; }
  .signup__login > :global(svg) { color:#6972db; }
  .signup__login strong { color:#6b65dc; font-weight:500; }
  .signup__error { margin-top:-.45rem; color:#c84f62; font-size:.78rem; }
  @media (max-width:768px) { .signup { max-width:32rem; margin:auto; padding:1.25rem; } }
  @media (max-width:480px) { .signup__names { grid-template-columns:1fr; } .signup { padding:1rem; } }
</style>
