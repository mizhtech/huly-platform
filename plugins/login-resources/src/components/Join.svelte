<!--
// Copyright © 2026 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
-->
<script lang="ts">
  import { Analytics } from '@hcengineering/analytics'
  import { signupStore } from '@hcengineering/analytics-providers'
  import { OK, PlatformError, Severity, Status, getMetadata, setMetadata, translate } from '@hcengineering/platform'
  import presentation from '@hcengineering/presentation'
  import {
    Label,
    Loading,
    Location,
    getCurrentLocation,
    navigate,
    themeStore
  } from '@hcengineering/ui'
  import { logIn, workbenchId } from '@hcengineering/workbench'
  import { onMount } from 'svelte'

  import {
    checkJoined,
    getInviteWorkspaceName,
    getLoginInfo,
    join,
    joinByToken,
    setLoginInfo,
    signUpJoin
  } from '../utils'
  import login from '../plugin'
  import AuthField from './AuthField.svelte'
  import StatusControl from './StatusControl.svelte'

  const location = getCurrentLocation()
  Analytics.handleEvent('invite_link_activated', { invite_id: location.query?.inviteId })

  const token = getMetadata(presentation.metadata.Token)
  let page: 'login' | 'signUp' = token != null ? 'login' : 'signUp'
  let checking = true
  let showJoinWithAccount = false
  let currentAccountName: string | undefined
  let joiningWithAccount = false
  let submitting = false
  let inviteWorkspaceName: string | undefined
  let confirmationSentEmail: string | undefined

  let first = ''
  let last = ''
  let username = ''
  let password = ''
  let password2 = ''
  let status = OK

  $: signupStore.setSignUpFlow(page === 'signUp')

  onMount(() => {
    void check()
  })

  async function check (): Promise<void> {
    if (location.query?.inviteId == null) {
      checking = false
      return
    }

    checking = true
    status = new Status(Severity.INFO, login.status.ConnectingToServer, {})

    const inviteId = location.query.inviteId
    const [result, workspaceName] = await Promise.all([checkJoined(inviteId), getInviteWorkspaceName(inviteId)])
    inviteWorkspaceName = workspaceName
    status = OK

    if (result != null) {
      setLoginInfo(result)
      navigateToResult(result)
      return
    }

    try {
      const info = await getLoginInfo()
      if (info != null) {
        showJoinWithAccount = true
        currentAccountName = info.name
        if (info.token != null) setMetadata(presentation.metadata.Token, info.token)
      }
    } catch {
      // No active account session.
    }

    checking = false
  }

  function navigateToResult (result: { workspaceUrl: string }): void {
    if (location.query?.navigateUrl != null) {
      try {
        const loc = JSON.parse(decodeURIComponent(location.query.navigateUrl)) as Location
        if (loc.path[1] === result.workspaceUrl) {
          navigate(loc)
          return
        }
      } catch {
        // Invalid optional navigateUrl can be ignored.
      }
    }
    navigate({ path: [workbenchId, result.workspaceUrl] })
  }

  async function validate (): Promise<boolean> {
    const language = $themeStore.language

    if (page === 'signUp') {
      if (first.trim() === '') return setRequired(login.string.FirstName, language)
      if (last.trim() === '') return setRequired(login.string.LastName, language)
    }
    if (username.trim() === '') return setRequired(login.string.Email, language)
    if (password.trim() === '') return setRequired(login.string.Password, language)

    if (page === 'signUp') {
      if (password2.trim() === '') return setRequired(login.string.PasswordRepeat, language)
      if (password !== password2) {
        status = new Status(Severity.INFO, login.status.FieldsDoNotMatch, {
          field: await translate(login.string.Password, {}, language),
          field2: await translate(login.string.PasswordRepeat, {}, language)
        })
        return false
      }
    }

    status = OK
    return true
  }

  async function setRequired (field: any, language: string): Promise<false> {
    status = new Status(Severity.INFO, login.status.RequiredField, {
      field: await translate(field, {}, language)
    })
    return false
  }

  async function submit (): Promise<void> {
    if (submitting || !(await validate())) return

    submitting = true
    status = new Status(Severity.INFO, login.status.ConnectingToServer, {})

    try {
      const [loginStatus, result] =
        page === 'login'
          ? await join(username.trim(), password, location.query?.inviteId ?? '', location.query?.workspace ?? '')
          : await signUpJoin(
            username.trim(),
            password,
            first.trim(),
            last.trim(),
            location.query?.inviteId ?? '',
            location.query?.workspace ?? ''
          )

      status = loginStatus

      if (result == null) return

      if (page === 'signUp' && !('workspaceUrl' in result)) {
        confirmationSentEmail = username.trim()
        return
      }

      if ('workspaceUrl' in result) {
        await logIn(result)
        setLoginInfo(result)
        navigateToResult(result)
      }
    } finally {
      submitting = false
    }
  }

  async function handleJoinWithThisAccount (): Promise<void> {
    const inviteId = location.query?.inviteId
    if (inviteId == null) return

    joiningWithAccount = true
    status = new Status(Severity.INFO, login.status.ConnectingToServer, {})

    try {
      const result = await joinByToken(inviteId)
      await logIn(result)
      setLoginInfo(result)
      navigateToResult(result)
    } catch (err: any) {
      status =
        err instanceof PlatformError ? err.status : new Status(Severity.ERROR, login.status.ConnectingToServer, {})
    } finally {
      joiningWithAccount = false
    }
  }

  function handleUseDifferentAccount (): void {
    setMetadata(presentation.metadata.Token, null)
    showJoinWithAccount = false
    status = OK
    page = 'login'
  }

  function switchPage (target: 'login' | 'signUp'): void {
    confirmationSentEmail = undefined
    status = OK
    page = target
  }

  function handleKeydown (event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault()
      void submit()
    }
  }
</script>

{#if checking}
  <div class="join-state join-state--loading">
    <div class="join-loader"><Loading size="small" shrink={true} /></div>
    <div>
      <div class="join-title"><Label label={login.string.ProcessingInvite} /></div>
      <div class="join-subtitle"><Label label={login.string.JoinLoadingSubtitle} /></div>
    </div>
  </div>
{:else if showJoinWithAccount}
  <div class="join-state">
    <div class="join-heading">
      <div class="join-mark">✓</div>
      <div class="join-title">
        <Label label={login.string.JoinWorkspace} params={{ workspaceName: inviteWorkspaceName ?? '' }} />
      </div>
      <div class="join-subtitle"><Label label={login.string.JoinCurrentAccountSubtitle} /></div>
    </div>

    {#if currentAccountName}
      <div class="account-card">
        <div class="account-avatar">{currentAccountName.slice(0, 1).toUpperCase()}</div>
        <div class="account-copy">
          <span class="account-label"><Label label={login.string.SignedInAs} params={{ name: currentAccountName }} /></span>
          <strong>{currentAccountName}</strong>
        </div>
      </div>
    {/if}

    {#if status.severity !== Severity.OK}
      <StatusControl {status} />
    {/if}

    <button class="primary-action" type="button" disabled={joiningWithAccount} on:click={() => void handleJoinWithThisAccount()}>
      {#if joiningWithAccount}<Loading size="small" shrink={true} />{/if}
      <Label label={login.string.JoinWithThisAccount} />
    </button>
    <button class="secondary-action" type="button" disabled={joiningWithAccount} on:click={handleUseDifferentAccount}>
      <Label label={login.string.UseDifferentAccount} />
    </button>
  </div>
{:else if confirmationSentEmail != null}
  <div class="join-state join-state--confirmation">
    <div class="join-heading">
      <div class="join-mark join-mark--mail">✉</div>
      <div class="join-title"><Label label={login.string.JoinConfirmationTitle} /></div>
      <div class="join-subtitle"><Label label={login.string.ConfirmationSent} /></div>
    </div>

    <div class="confirmation-email">{confirmationSentEmail}</div>
    <div class="confirmation-note"><Label label={login.string.ConfirmationSent2} /></div>

    <button class="primary-action" type="button" on:click={() => switchPage('login')}>
      <Label label={login.string.BackToLogin} />
    </button>
    <button class="secondary-action" type="button" on:click={() => switchPage('signUp')}>
      <Label label={login.string.ChangeEmail} />
    </button>
  </div>
{:else}
  <form class="join-state" on:keydown={handleKeydown}>
    <div class="join-heading">
      <div class="join-title">
        <Label label={login.string.JoinWorkspace} params={{ workspaceName: inviteWorkspaceName ?? '' }} />
      </div>
      <div class="join-subtitle">
        <Label label={page === 'login' ? login.string.JoinLoginSubtitle : login.string.JoinSignupSubtitle} />
      </div>
    </div>

    <div class="join-fields">
      {#if page === 'signUp'}
        <div class="name-grid">
          <AuthField bind:value={first} label={login.string.FirstName} name="first" icon="user" autocomplete="given-name" disabled={submitting} />
          <AuthField bind:value={last} label={login.string.LastName} name="last" icon="user" autocomplete="family-name" disabled={submitting} />
        </div>
      {/if}

      <AuthField bind:value={username} label={login.string.Email} name="email" icon="mail" type="email" autocomplete="email" disabled={submitting} />
      <AuthField bind:value={password} label={login.string.Password} name="password" icon="lock" type="password" autocomplete={page === 'login' ? 'current-password' : 'new-password'} disabled={submitting} />
      {#if page === 'signUp'}
        <AuthField bind:value={password2} label={login.string.PasswordRepeat} name="password2" icon="lock" type="password" autocomplete="new-password" disabled={submitting} />
      {/if}
    </div>

    {#if status.severity !== Severity.OK}
      <StatusControl {status} />
    {/if}

    <button class="primary-action" type="button" disabled={submitting} on:click={() => void submit()}>
      {#if submitting}<Loading size="small" shrink={true} />{/if}
      <Label label={page === 'login' ? login.string.LogInAndJoin : login.string.SignUpAndJoin} />
    </button>

    <div class="join-divider"><span></span><Label label={login.string.Or} /><span></span></div>

    <button
      class="secondary-action"
      type="button"
      disabled={submitting}
      on:click={() => switchPage(page === 'login' ? 'signUp' : 'login')}
    >
      <Label label={page === 'login' ? login.string.CreateNewAccount : login.string.HaveAccount} />
    </button>

    <div class="join-footer">
      {#if page === 'login'}
        <span><Label label={login.string.ForgotPassword} /></span>
        <button type="button" on:click={() => navigate({ path: [location.path[0], 'password'] })}>
          <Label label={login.string.Recover} />
        </button>
      {:else}
        <span><Label label={login.string.AlreadyHaveAccount} /></span>
        <button type="button" on:click={() => switchPage('login')}><Label label={login.string.LogIn} /></button>
      {/if}
    </div>
  </form>
{/if}

<style lang="scss">
  .join-state {
    width: 100%;
    max-width: 29rem;
    margin: auto;
    padding: 2.45rem 2.6rem 2.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    color: #17203b;
  }

  .join-state--loading {
    min-height: 14rem;
    align-items: center;
    justify-content: center;
    flex-direction: row;
    gap: 1rem;
  }

  .join-loader {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.7rem;
    height: 2.7rem;
    border-radius: .82rem;
    background: rgba(99, 108, 232, .09);
  }

  .join-heading {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: .45rem;
    margin-bottom: .35rem;
  }

  .join-title {
    font-size: 1.55rem;
    line-height: 1.2;
    font-weight: 650;
    letter-spacing: -.02em;
    color: #17203b;
  }

  .join-subtitle {
    max-width: 25rem;
    color: #7a849e;
    font-size: .9rem;
    line-height: 1.55;
  }

  .join-mark {
    display: grid;
    place-items: center;
    width: 3rem;
    height: 3rem;
    margin-bottom: .4rem;
    border-radius: 1rem;
    background: linear-gradient(145deg, rgba(99, 108, 232, .15), rgba(126, 91, 238, .08));
    color: #6068de;
    font-size: 1.15rem;
    font-weight: 700;
  }

  .join-mark--mail {
    font-size: 1.2rem;
  }

  .join-fields {
    display: flex;
    flex-direction: column;
    gap: .85rem;
  }

  .name-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: .85rem;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
    min-height: 3.35rem;
    border-radius: .82rem;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition: transform .15s ease, box-shadow .15s ease, border-color .15s ease, opacity .15s ease;
  }

  .primary-action {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: .55rem;
    border: 0;
    color: white;
    background: linear-gradient(100deg, #5f6be8 0%, #7656e9 100%);
    box-shadow: 0 10px 22px rgba(91, 92, 207, .18);
  }

  .primary-action:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 12px 26px rgba(91, 92, 207, .24);
  }

  .secondary-action {
    border: 1px solid #dce1ee;
    color: #45516d;
    background: rgba(255, 255, 255, .62);
  }

  .secondary-action:hover:not(:disabled) {
    background: rgba(255, 255, 255, .9);
    border-color: #cbd2e4;
  }

  .primary-action:disabled,
  .secondary-action:disabled {
    cursor: default;
    opacity: .58;
  }

  .join-divider {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 1rem;
    margin: .15rem 0 -.1rem;
    color: #98a0b4;
    font-size: .8rem;
  }

  .join-divider span {
    height: 1px;
    background: #e0e4ef;
  }

  .join-footer {
    display: flex;
    justify-content: center;
    gap: .3rem;
    margin-top: .15rem;
    color: #98a0b4;
    font-size: .82rem;
  }

  .join-footer button {
    padding: 0;
    border: 0;
    background: transparent;
    color: #626bdc;
    font: inherit;
    cursor: pointer;
  }

  .join-footer button:hover {
    text-decoration: underline;
  }

  .account-card {
    display: flex;
    align-items: center;
    gap: .85rem;
    padding: .9rem 1rem;
    border: 1px solid #dce1ee;
    border-radius: .85rem;
    background: rgba(255, 255, 255, .68);
  }

  .account-avatar {
    display: grid;
    place-items: center;
    width: 2.65rem;
    height: 2.65rem;
    flex: 0 0 auto;
    border-radius: .82rem;
    background: linear-gradient(145deg, #6672eb, #825ce8);
    color: white;
    font-weight: 700;
  }

  .account-copy {
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: .15rem;
  }

  .account-copy strong {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: #25304c;
  }

  .account-label {
    color: #8b94aa;
    font-size: .76rem;
  }

  .confirmation-email {
    overflow-wrap: anywhere;
    padding: .9rem 1rem;
    border-radius: .82rem;
    background: rgba(99, 108, 232, .07);
    color: #5c66d7;
    font-weight: 600;
    text-align: center;
  }

  .confirmation-note {
    margin: -.2rem 0 .25rem;
    color: #7a849e;
    font-size: .85rem;
    line-height: 1.5;
    text-align: center;
  }

  .join-state--confirmation .join-heading {
    align-items: center;
    text-align: center;
  }

  @media (max-width: 480px) {
    .join-state {
      padding: 1.5rem 1.25rem;
    }

    .name-grid {
      grid-template-columns: 1fr;
    }

    .join-title {
      font-size: 1.35rem;
    }
  }
</style>
