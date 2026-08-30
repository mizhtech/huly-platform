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
.password-form {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 29rem;
    margin: auto;
    padding: 2.25rem 2.6rem 1rem;
    color: #17203b;
  }
  .auth-mark {
    align-self: center;
    width: 4.25rem;
    height: 4.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 1rem;
    margin-bottom: 1.45rem;
    color: white;
    background: linear-gradient(145deg, #5d7cff, #8358ef);
    border: 1px solid rgba(255,255,255,.75);
    box-shadow: 0 12px 30px rgba(91, 91, 224, .2);
  }
  h1 { margin: 0; text-align: center; font-size: 1.85rem; line-height: 1.2; color:#121a33; }
  .subtitle { min-height: 1.35rem; margin: .6rem 0 2rem; text-align: center; color: #7b849c; font-size: .95rem; }
  .fields { display: flex; flex-direction: column; gap: .8rem; }
  .password-options { display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin: 1rem 0 .8rem; font-size: .84rem; }
  .remember { display: flex; align-items: center; gap: .55rem; color: #46516b; }
  .remember input { width: 1.05rem; height: 1.05rem; accent-color: #6170ef; }
  a { color: #665ee8; text-decoration: none; font-weight: 500; }
  a:hover { color:#5148d7; }
  .primary-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    width: 100%;
    min-height: 3.7rem;
    margin-top: .85rem;
    border: 0;
    border-radius: .8rem;
    background: linear-gradient(100deg, #4f6df5, #8357ee);
    box-shadow: 0 10px 24px rgba(95, 87, 227, .18);
    color: white;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  }
  .primary-action:hover:not(:disabled) { transform: translateY(-1px); box-shadow:0 14px 30px rgba(95,87,227,.24); }
  .primary-action:disabled { opacity: .48; cursor: default; box-shadow:none; }
  @media (max-width: 480px) { .password-form { padding: 1rem 1.25rem; } }
</style>
