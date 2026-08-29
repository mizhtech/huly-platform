<!--
// Copyright © 2024 Hardcore Engineering Inc.
// Licensed under the Eclipse Public License, Version 2.0.
-->
<script lang="ts">
  import { type IntlString, OK, Severity, Status } from '@hcengineering/platform'
  import { type LoginInfo } from '@hcengineering/account-client'
  import { Label } from '@hcengineering/ui'

  import { doLogin, doLoginNavigate, goTo, setRememberLoginAccount } from '../utils'
  import login from '../plugin'
  import AuthField from './AuthField.svelte'
  import AuthIcons from './icons/AuthIcons.svelte'
  import StatusControl from './StatusControl.svelte'

  export let navigateUrl: string | undefined = undefined
  export let signUpDisabled = false
  export let email: string | undefined = undefined
  export let caption: IntlString = login.string.LogIn
  export let subtitle: string | undefined = undefined
  export let onLogin: ((loginInfo: LoginInfo | null, status: Status) => void | Promise<void>) | undefined = undefined

  let username = email ?? ''
  let password = ''
  let remember = true
  let status = OK
  let isLoading = false

  $: if (email !== undefined && email !== '' && username === '') username = email
  $: canSubmit = username.trim() !== '' && password !== '' && !isLoading

  async function submit (): Promise<void> {
    if (!canSubmit) return
    isLoading = true
    setRememberLoginAccount(remember)
    try {
      status = new Status(Severity.INFO, login.status.ConnectingToServer, {})
      const [loginStatus, result] = await doLogin(username, password)
      status = loginStatus
      if (onLogin !== undefined) {
        await onLogin(result, status)
      } else {
        await doLoginNavigate(result, (st) => (status = st), navigateUrl)
      }
    } finally {
      isLoading = false
    }
  }
</script>

<form class="password-form" on:submit|preventDefault={submit}>
  <div class="auth-mark"><AuthIcons name="sparkles" size={28} /></div>
  <h1><Label label={caption} /></h1>
  <p class="subtitle">{#if subtitle !== undefined}{subtitle}{:else}<Label label={login.string.LoginSubtitle} />{/if}</p>

  <div class="fields">
    <AuthField bind:value={username} name="email" label={login.string.Email} type="email" icon="mail" autocomplete="username" disabled={email !== undefined && email !== ''} />
    <AuthField bind:value={password} name="current-password" label={login.string.Password} type="password" icon="lock" autocomplete="current-password" />
  </div>

  <div class="password-options">
    <label class="remember"><input type="checkbox" bind:checked={remember} /><span><Label label={login.string.RememberLogin} /></span></label>
    <a href="/login/password" on:click|preventDefault={() => goTo('password')}><Label label={login.string.ForgotPassword} /></a>
  </div>

  <StatusControl {status} />

  <button class="primary-action" type="submit" disabled={!canSubmit}>
    <span><Label label={login.string.LogIn} /></span><AuthIcons name="arrow" size={22} />
  </button>
</form>

<style lang="scss">
  .password-form { display:flex; flex-direction:column; width:100%; max-width:35rem; margin:auto; padding:2rem 3rem 1rem; color:white; }
  .auth-mark { align-self:center; width:4.8rem; height:4.8rem; display:flex; align-items:center; justify-content:center; border-radius:1rem; margin-bottom:1.7rem; background:linear-gradient(145deg,rgba(80,87,218,.65),rgba(38,42,128,.4)); border:1px solid rgba(255,255,255,.12); }
  h1 { margin:0; text-align:center; font-size:2rem; line-height:1.2; }
  .subtitle { min-height:1.4rem; margin:.75rem 0 2.5rem; text-align:center; color:rgba(255,255,255,.62); font-size:1rem; }
  .fields { display:flex; flex-direction:column; gap:1rem; }
  .password-options { display:flex; align-items:center; justify-content:space-between; gap:1rem; margin:1.15rem 0; font-size:.86rem; }
  .remember { display:flex; align-items:center; gap:.55rem; color:rgba(255,255,255,.86); }
  .remember input { width:1.1rem; height:1.1rem; accent-color:#5965ff; }
  a { color:#7d75ff; text-decoration:none; }
  .primary-action { display:flex; align-items:center; justify-content:center; gap:1rem; width:100%; min-height:4rem; margin-top:1rem; border:0; border-radius:.8rem; background:linear-gradient(100deg,#3949db,#6847ef); color:white; font:inherit; font-weight:600; cursor:pointer; }
  .primary-action:disabled { opacity:.5; cursor:default; }
  @media (max-width: 480px) { .password-form { padding:1rem 1.25rem; } }
</style>
