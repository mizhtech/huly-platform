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
.workspace-create { width:100%; max-width:30rem; margin:auto; padding:2.4rem 2.6rem 1.2rem; color:#17203b; }
  .welcome { font-size:.92rem; font-weight:500; color:#59647d; }
  h1 { margin:.4rem 0 .5rem; font-size:1.9rem; line-height:1.15; color:#141c35; }
  .subtitle { margin:0 0 1.8rem; color:#7b849c; }
  .form-fields { display:flex; flex-direction:column; gap:.8rem; }
  .demo-toggle { display:flex; align-items:center; min-height:4rem; gap:.9rem; padding:0 1rem; border:1px solid #dce1ee; border-radius:.82rem; background:rgba(255,255,255,.68); cursor:pointer; box-shadow:0 4px 14px rgba(79,91,139,.03); }
  .demo-toggle:hover { background:rgba(255,255,255,.9); }
  .field-icon { display:flex; color:#6672e6; }
  .demo-label { flex:1; color:#39445f; font-size:.88rem; font-weight:500; }
  .region-selector { padding:.65rem 1rem; border:1px solid #dce1ee; border-radius:.82rem; background:rgba(255,255,255,.68); }
  .primary-action { display:flex; align-items:center; justify-content:center; gap:.75rem; width:100%; min-height:3.75rem; margin-top:1.2rem; border:0; border-radius:.8rem; background:linear-gradient(100deg,#4f6df5,#8357ee); box-shadow:0 10px 24px rgba(95,87,227,.18); color:white; font:inherit; font-weight:600; cursor:pointer; transition:transform .15s ease,box-shadow .15s ease; }
  .primary-action:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 14px 30px rgba(95,87,227,.24)}
  .primary-action:disabled{opacity:.48;box-shadow:none}
  .divider { display:grid; grid-template-columns:1fr auto 1fr; align-items:center; gap:1rem; margin:1.45rem 0; color:#9aa2b5; font-size:.8rem }
  .divider span{height:1px;background:#e0e4ef}
  .have-workspace { text-align:center; color:#7b849c; font-size:.82rem }
  .have-workspace button{border:0;background:none;color:#665ee8;font:inherit;font-weight:500;cursor:pointer}
  .support-footer { display:flex; justify-content:space-between; margin-top:3.25rem; padding-top:1.1rem; border-top:1px solid #e3e6ef; color:#7b849c; font-size:.8rem }
  @media(max-width:480px){.workspace-create{padding:1rem 1.25rem}.support-footer{margin-top:2rem}}
</style>
