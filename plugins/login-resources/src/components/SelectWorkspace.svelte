<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021, 2022 Hardcore Engineering Inc.
// Licensed under the Eclipse Public License, Version 2.0.
-->
<script lang="ts">
  import { WorkspaceInfoWithStatus, isArchivingMode, isRestoringMode, isUpgradingMode } from '@hcengineering/core'
  import { LoginInfo } from '@hcengineering/login'
  import { OK, Severity, Status } from '@hcengineering/platform'
  import { MessageBox, isAdminUser, reduceCalls } from '@hcengineering/presentation'
  import { Label, SearchEdit, Spinner, showPopup, ticker } from '@hcengineering/ui'
  import { logOut } from '@hcengineering/workbench'
  import { onMount } from 'svelte'

  import login from '../plugin'
  import { getAccount, getAccountDisplayName, getWorkspaces, goTo, isReadOnlyGuestAccount, navigateToWorkspace, selectWorkspace, unArchive } from '../utils'
  import StatusControl from './StatusControl.svelte'
  import WorkspaceListItem from './WorkspaceListItem.svelte'
  import AuthIcons from './icons/AuthIcons.svelte'

  export let navigateUrl: string | undefined = undefined

  let workspaces: WorkspaceInfoWithStatus[] = []
  let status = OK
  let accountPromise: Promise<LoginInfo | null>
  let account: LoginInfo | null | undefined
  let isReadOnlyGuest = true
  let flagToUpdateWorkspaces = false
  let search = ''
  let connectingWorkspace: string | undefined

  async function loadAccount (): Promise<void> {
    accountPromise = getAccount()
    account = await accountPromise
    isReadOnlyGuest = await isReadOnlyGuestAccount(account)
  }

  const updateWorkspaces = reduceCalls(async function updateWorkspaces (_time?: number): Promise<void> {
    try { workspaces = await getWorkspaces() } catch {}
  })
  $: if (flagToUpdateWorkspaces) void updateWorkspaces($ticker)
  onMount(() => void loadAccount())

  async function select (workspaceUrl: string): Promise<void> {
    connectingWorkspace = workspaceUrl
    status = new Status(Severity.INFO, login.status.ConnectingToServer, {})
    try {
      const [loginStatus, result] = await selectWorkspace(workspaceUrl)
      const ws = workspaces.find((it) => it.uuid === result?.workspace)
      if (ws != null && isArchivingMode(ws.mode) && result?.workspace !== undefined) {
        showPopup(MessageBox, {
          label: login.string.SelectWorkspace,
          message: login.string.WorkspaceArchivedDesc,
          canSubmit: true,
          params: {},
          okLabel: login.string.RestoreArchivedWorkspace,
          action: async () => {
            if (await unArchive(ws.uuid, result.token)) {
              workspaces = await getWorkspaces()
              let info = workspaces.find((it) => it.uuid === ws.uuid)
              while (isRestoringMode(info?.mode) || isUpgradingMode(info?.mode)) {
                await new Promise<void>((resolve) => setTimeout(resolve, 5000))
                workspaces = await getWorkspaces()
                info = workspaces.find((it) => it.uuid === ws.uuid)
              }
            }
          }
        })
        status = loginStatus
        return
      }
      status = loginStatus
      navigateToWorkspace(workspaceUrl, result, navigateUrl)
    } finally {
      connectingWorkspace = undefined
    }
  }

  async function loadWorkspaces (): Promise<void> {
    try {
      const res = await getWorkspaces()
      await accountPromise
      if (res.length === 0 && account?.token == null) goTo('confirmationSend')
      workspaces = res
      await updateWorkspaces()
      flagToUpdateWorkspaces = true
    } catch (err) {
      await logOut()
      goTo('login')
      throw err
    }
  }

  $: filtered = workspaces.filter((it) => search === '' || (it.name?.toLowerCase().includes(search.toLowerCase()) ?? false) || it.url.toLowerCase().includes(search.toLowerCase())).slice(0, 500)
</script>

<div class="workspace-select">
  <div class="account-name">{#if account != null}{getAccountDisplayName(account)}{:else}<Label label={login.string.LoadingAccount} />{/if}</div>
  <h1><Label label={login.string.SelectWorkspace} /></h1>
  <p class="subtitle"><Label label={login.string.SelectWorkspaceSubtitle} /></p>
  <StatusControl {status} />

  {#if workspaces.length > 10}<div class="search"><SearchEdit bind:value={search} width="100%" /></div>{/if}

  {#await loadWorkspaces()}
    <div class="loader"><Spinner /></div>
  {:then}
    <div class="workspace-list">
      {#each filtered as workspace (workspace.uuid)}
        <WorkspaceListItem {workspace} loading={connectingWorkspace === workspace.url} on:click={() => select(workspace.url)} />
      {/each}
    </div>

    {#if workspaces.length === 0 && account?.token != null && isReadOnlyGuest}
      <div class="empty"><Label label={login.string.SignUpToCreateWorkspace} /></div>
    {/if}

    {#if !isReadOnlyGuest && isAdminUser()}
      <button class="add-workspace" type="button" on:click={() => goTo('createWorkspace')}><AuthIcons name="plus" size={22} /><Label label={login.string.AddWorkspace} /></button>
    {:else if workspaces.length === 0 && isReadOnlyGuest}
      <button class="add-workspace" type="button" on:click={() => goTo('signup')}><AuthIcons name="plus" size={22} /><Label label={login.string.SignUp} /></button>
    {/if}

    <div class="account-switch"><span><Label label={login.string.NotSeeingWorkspace} /></span><button type="button" on:click={async () => { await logOut(); goTo('login') }}><Label label={login.string.ChangeAccount} /></button></div>
  {/await}
</div>

<style lang="scss">
.workspace-select { width:100%; max-width:32rem; margin:auto; padding:2.4rem 2.6rem 1.5rem; color:#17203b; overflow:auto; }
  .account-name{font-size:.9rem;color:#59647d}
  h1{margin:.4rem 0 .4rem;font-size:1.9rem;color:#141c35}
  .subtitle{margin:0 0 1.55rem;color:#7b849c}
  .search{margin-bottom:.9rem}
  .loader{min-height:14rem;display:flex;align-items:center;justify-content:center}
  .workspace-list{display:flex;flex-direction:column;gap:.72rem;max-height:26rem;overflow:auto;padding:.1rem}
  .add-workspace{display:flex;align-items:center;justify-content:center;gap:.75rem;width:100%;min-height:4.2rem;margin-top:.9rem;border:1px dashed #c9d0e2;border-radius:.9rem;background:rgba(255,255,255,.46);color:#545fca;font:inherit;font-weight:600;cursor:pointer;transition:background .15s ease,border-color .15s ease}
  .add-workspace:hover{background:rgba(255,255,255,.82);border-color:#aeb8d5}
  .account-switch{margin-top:2rem;padding-top:1.5rem;border-top:1px solid #e3e6ef;text-align:center;color:#8a93a8;font-size:.83rem}
  .account-switch button{display:block;margin:.4rem auto 0;border:0;background:none;color:#665ee8;font:inherit;font-weight:600;cursor:pointer}
  .empty{margin:1rem 0;color:#7b849c}
  @media(max-width:480px){.workspace-select{padding:1rem 1.25rem}.workspace-list{max-height:none}}
</style>
