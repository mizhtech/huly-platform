<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021, 2022 Hardcore Engineering Inc.
// Licensed under the Eclipse Public License, Version 2.0.
-->
<script lang="ts">
  import { type RegionInfo } from '@hcengineering/account-client'
  import { OK, Severity, Status, getEmbeddedLabel } from '@hcengineering/platform'
  import { LoginInfo } from '@hcengineering/login'
  import { isAdminUser } from '@hcengineering/presentation'
  import { ButtonMenu, Label, MiniToggle, getCurrentLocation, navigate } from '@hcengineering/ui'
  import { workbenchId } from '@hcengineering/workbench'
  import { onMount } from 'svelte'
  import login from '../plugin'
  import { createWorkspace, getAccount, getRegionInfo, goTo, setLoginInfo, getAccountDisplayName } from '../utils'
  import AuthField from './AuthField.svelte'
  import AuthIcons from './icons/AuthIcons.svelte'
  import StatusControl from './StatusControl.svelte'

  let workspace = ''
  let status: Status<any> = OK
  let loginInfo: LoginInfo | null | undefined
  let regions: RegionInfo[] = []
  let selectedRegion = ''
  let withDemoContent = true
  let isLoading = false

  onMount(async () => {
    loginInfo = await getAccount()
    if (!isAdminUser()) {
      goTo('selectWorkspace')
      return
    }
    regions = (await getRegionInfo())?.filter((it) => it.name.length > 0) ?? []
    selectedRegion = regions[0]?.region ?? ''
    if (loginInfo?.token == null) {
      const loc = getCurrentLocation()
      loc.path[1] = 'confirmationSend'
      loc.path.length = 2
      navigate(loc)
    }
  })

  async function submit (): Promise<void> {
    if (workspace.trim() === '' || isLoading) return
    isLoading = true
    try {
      status = new Status(Severity.INFO, login.status.ConnectingToServer, {})
      const [loginStatus, result] = await createWorkspace(workspace.trim(), selectedRegion, { withDemoContent })
      status = loginStatus
      if (result != null) {
        setLoginInfo(result as any)
        navigate({ path: [workbenchId, result.workspaceUrl] })
      }
    } finally {
      isLoading = false
    }
  }
</script>

<form class="workspace-create" on:submit|preventDefault={submit}>
  <div class="welcome"><Label label={login.string.WelcomeBack} /></div>
  <h1>{getAccountDisplayName(loginInfo)}</h1>
  <p class="subtitle"><Label label={login.string.CreateWorkspaceSubtitle} /></p>

  <div class="form-fields">
    <AuthField bind:value={workspace} name="workspace" label={login.string.Workspace} icon="briefcase" autocomplete="organization" />

    <label class="demo-toggle">
      <span class="field-icon"><AuthIcons name="layers" size={20} /></span>
      <span class="demo-label"><Label label={login.string.CreateSampleProjects} /></span>
      <MiniToggle bind:on={withDemoContent} />
    </label>

    {#if regions.length > 1}
      <div class="region-selector">
        <ButtonMenu
          bind:selected={selectedRegion}
          autoSelectionIfOne
          title={regions.find((it) => it.region === selectedRegion)?.name}
          items={regions.map((it) => ({ id: it.region, label: getEmbeddedLabel(it.name) }))}
          on:selected={(it) => (selectedRegion = it.detail)}
        />
      </div>
    {/if}

    <StatusControl {status} />
  </div>

  <button class="primary-action" type="submit" disabled={workspace.trim() === '' || isLoading}>
    <AuthIcons name="sparkles" size={20} /><Label label={login.string.CreateWorkspace} />
  </button>

  <div class="divider"><span></span><Label label={login.string.Or} /><span></span></div>
  <div class="have-workspace"><Label label={login.string.HaveWorkspace} /> <button type="button" on:click={() => goTo('selectWorkspace')}><Label label={login.string.SelectWorkspace} /></button></div>

  <div class="support-footer">
    <span><Label label={login.string.Documentation} /></span>
    <span><Label label={login.string.ContactSupport} /></span>
  </div>
</form>

<style lang="scss">
  .workspace-create { width:100%; max-width:35rem; margin:auto; padding:2.2rem 3rem 1rem; color:white; }
  .welcome { font-size:.96rem; font-weight:500; color:rgba(255,255,255,.88); }
  h1 { margin:.45rem 0 .6rem; font-size:2rem; line-height:1.15; }
  .subtitle { margin:0 0 2rem; color:rgba(255,255,255,.58); }
  .form-fields { display:flex; flex-direction:column; gap:1rem; }
  .demo-toggle { display:flex; align-items:center; min-height:4rem; gap:1rem; padding:0 1.1rem; border:1px solid rgba(255,255,255,.13); border-radius:.8rem; background:rgba(10,17,55,.18); cursor:pointer; }
  .field-icon { display:flex; color:#7180ff; }.demo-label{flex:1;color:rgba(255,255,255,.82);font-size:.9rem}.region-selector{padding:.65rem 1rem;border:1px solid rgba(255,255,255,.11);border-radius:.8rem}
  .primary-action { display:flex; align-items:center; justify-content:center; gap:.75rem; width:100%; min-height:4rem; margin-top:1.4rem; border:0; border-radius:.8rem; background:linear-gradient(100deg,#4458ff,#5e55f1); color:white; font:inherit; font-weight:600; cursor:pointer; }.primary-action:disabled{opacity:.5}
  .divider { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:1rem; margin:1.6rem 0; color:rgba(255,255,255,.45); font-size:.82rem }.divider span{height:1px;background:rgba(255,255,255,.11)}
  .have-workspace { text-align:center; color:rgba(255,255,255,.55); font-size:.84rem }.have-workspace button{border:0;background:none;color:#8178ff;font:inherit;cursor:pointer}
  .support-footer { display:flex; justify-content:space-between; margin-top:4rem; padding-top:1.25rem; border-top:1px solid rgba(255,255,255,.09); color:rgba(255,255,255,.55); font-size:.82rem }
  @media(max-width:480px){.workspace-create{padding:1rem 1.25rem}.support-footer{margin-top:2rem}}
</style>
