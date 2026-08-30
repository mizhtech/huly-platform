<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021, 2022 Hardcore Engineering Inc.
// Licensed under the Eclipse Public License, Version 2.0.
-->
<script lang="ts">
  import { type IntlString, Severity, Status } from '@hcengineering/platform'
  import { signupStore } from '@hcengineering/analytics-providers'
  import { Label } from '@hcengineering/ui'
  import { onMount } from 'svelte'
  import { type LoginInfo } from '@hcengineering/account-client'

  import { doLoginAsGuest, doLoginNavigate, LoginMethods } from '../index'
  import LoginPasswordForm from './LoginPasswordForm.svelte'
  import LoginOtpForm from './LoginOtpForm.svelte'
  import AuthActionRow from './AuthActionRow.svelte'
  import login from '../plugin'

  export let navigateUrl: string | undefined = undefined
  export let signUpDisabled = false
  export let useOTP = true
  export let email: string | undefined = undefined
  export let caption: IntlString | undefined = undefined
  export let subtitle: string | undefined = undefined
  export let onLogin: ((loginInfo: LoginInfo | null, status: Status) => void | Promise<void>) | undefined = undefined

  let method: LoginMethods = LoginMethods.Password

  onMount(() => signupStore.setSignUpFlow(false))

  async function guestLogin (): Promise<void> {
    let status = new Status(Severity.INFO, login.status.ConnectingToServer, {})
    const [loginStatus, result] = await doLoginAsGuest()
    status = loginStatus
    if (onLogin !== undefined) await onLogin(result, status)
    else await doLoginNavigate(result, (st) => (status = st), navigateUrl)
  }
</script>

<div class="login-flow">
  {#if method === LoginMethods.Otp}
    <LoginOtpForm {navigateUrl} {signUpDisabled} {email} {caption} {subtitle} {onLogin} on:change={(event) => (method = event.detail)} />
  {:else}
    <LoginPasswordForm {navigateUrl} {signUpDisabled} {email} caption={caption ?? login.string.LogIn} {subtitle} {onLogin} />
  {/if}

  <div class="alternate-actions">
    <div class="separator"><span></span><Label label={login.string.Or} /><span></span></div>
    {#if useOTP && method !== LoginMethods.Otp}
      <AuthActionRow label={login.string.LoginWithCode} icon="mail" on:click={() => (method = LoginMethods.Otp)} />
    {:else if method === LoginMethods.Otp}
      <AuthActionRow label={login.string.LoginWithPassword} icon="mail" on:click={() => (method = LoginMethods.Password)} />
    {/if}
    <AuthActionRow label={login.string.LoginAsGuest} icon="user" on:click={guestLogin} />
  </div>
</div>

<style lang="scss">
.login-flow { width: 100%; max-width: 29rem; margin: auto; }
  .alternate-actions { padding: 0 2.6rem 1rem; }
  .separator { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; gap: 1rem; margin: 1.35rem 0 .75rem; color: #98a0b4; font-size: .8rem; }
  .separator span { height: 1px; background: #e0e4ef; }
  @media (max-width: 480px) { .alternate-actions { padding: 0 1.25rem 1rem; } }
</style>
