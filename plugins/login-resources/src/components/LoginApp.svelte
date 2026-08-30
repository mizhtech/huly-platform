<!--
// Copyright © 2020, 2021 Anticrm Platform Contributors.
// Copyright © 2021, 2022 Hardcore Engineering Inc.
//
// Licensed under the Eclipse Public License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License. You may
// obtain a copy of the License at https://www.eclipse.org/legal/epl-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//
// See the License for the specific language governing permissions and
// limitations under the License.
-->
<script lang="ts">
  import { getMetadata, setMetadata } from '@hcengineering/platform'
  import presentation from '@hcengineering/presentation'
  import {
    Location,
    Popup,
    Label,
    Scroller,
    deviceOptionsStore as deviceInfo,
    fetchMetadataLocalStorage,
    getCurrentLocation,
    location,
    setMetadataLocalStorage,
    themeStore
  } from '@hcengineering/ui'
  import workbench from '@hcengineering/workbench'
  import { onDestroy, onMount } from 'svelte'
  import Auth from './Auth.svelte'
  import Confirmation from './Confirmation.svelte'
  import ConfirmationSend from './ConfirmationSend.svelte'
  import CreateWorkspaceForm from './CreateWorkspaceForm.svelte'
  import Join from './Join.svelte'
  import AutoJoin from './AutoJoin.svelte'
  import LoginForm from './LoginForm.svelte'
  import ProvidersOnlyForm from './ProvidersOnlyForm.svelte'
  import PasswordRequest from './PasswordRequest.svelte'
  import PasswordRestore from './PasswordRestore.svelte'
  import SelectWorkspace from './SelectWorkspace.svelte'
  import SignupForm from './SignupForm.svelte'
  import LoginTfaForm from './LoginTfaForm.svelte'
  import LoginIcon from './icons/LoginIcon.svelte'
  import { Pages, getAccount, pages } from '..'
  import login from '../plugin'

  import loginBack from '../../img/login_back.png'
  import loginBack2x from '../../img/login_back_2x.png'
  import loginBackAvif from '../../img/login_back.avif'
  import loginBack2xAvif from '../../img/login_back_2x.avif'
  import loginBackWebp from '../../img/login_back.webp'
  import loginBack2xWebp from '../../img/login_back_2x.webp'
  import AdminWorkspaces from './AdminWorkspaces.svelte'
  import ChangePassword from './ChangePassword.svelte'

  export let page: Pages = 'signup'

  const signUpDisabled = getMetadata(login.metadata.DisableSignUp) ?? false
  const localLoginHidden = getMetadata(login.metadata.HideLocalLogin) ?? false
  const useOTP = getMetadata(presentation.metadata.MailUrl) != null && getMetadata(presentation.metadata.MailUrl) !== ''
  let navigateUrl: string | undefined
  let tfaToken: string | undefined = undefined

  onDestroy(location.subscribe(updatePageLoc))

  function updatePageLoc (loc: Location): void {
    const token = getMetadata(presentation.metadata.Token)
    page = (loc.path[1] as Pages) ?? (token != null ? 'selectWorkspace' : 'login')
    if (page === 'join' && loc.query?.autoJoin !== undefined) {
      page = 'autoJoin'
    }

    const allowedUnauthPages: Pages[] = [
      'login',
      'signup',
      'password',
      'recovery',
      'join',
      'autoJoin',
      'confirm',
      'confirmationSend',
      'auth',
      'tfa'
    ]
    if (token === undefined ? !allowedUnauthPages.includes(page) : !pages.includes(page)) {
      const account = fetchMetadataLocalStorage(login.metadata.LastAccount)
      page = account != null ? 'login' : 'signup'
    }

    navigateUrl = loc.query?.navigateUrl ?? undefined
    tfaToken = loc.query?.token ?? undefined
  }

  async function chooseToken (): Promise<void> {
    if (page === 'auth') {
      // token handled by auth page
      return
    } else if (page === 'autoJoin') {
      // there's a separate workflow for auto join
      return
    }

    if (getMetadata(presentation.metadata.Token) == null) {
      const lastAccount = fetchMetadataLocalStorage(login.metadata.LastAccount)
      if (lastAccount != null) {
        try {
          const loginInfo = await getAccount(false)
          if (loginInfo != null) {
            setMetadata(presentation.metadata.Token, loginInfo.token)
            setMetadataLocalStorage(login.metadata.LoginAccount, loginInfo.account)
            updatePageLoc(getCurrentLocation())
          }
        } catch (err: any) {
          // do nothing
        }
      }
    }
  }

  onMount(chooseToken)
</script>

{#if page === 'admin'}
  <AdminWorkspaces />
{:else}
  <div
    class="w-full h-full backd"
    class:paneld={$deviceInfo.docWidth <= 768}
    class:white={!$themeStore.dark}
  >
    <div class="bg-image clear-mins" class:back={$deviceInfo.docWidth > 768} class:p-4={$deviceInfo.docWidth > 768}>
      <picture>
        <source srcset={`${loginBackAvif}, ${loginBack2xAvif} 2x`} type="image/avif" />
        <source srcset={`${loginBackWebp}, ${loginBack2xWebp} 2x`} type="image/webp" />

        <img
          class="back-image"
          src={loginBack}
          style:display={$deviceInfo.docWidth <= 768 ? 'none' : 'block'}
          srcset={`${loginBack} 1x, ${loginBack2x} 2x`}
          alt=""
        />
      </picture>

      <div
        style:position="fixed"
        style:left={$deviceInfo.docWidth <= 480 ? '.75rem' : '1.75rem'}
        style:top={'calc(3rem + var(--huly-top-indent, 0rem))'}
        class="platform-brand flex-row-center"
      >
        <LoginIcon /><span class="fs-title ml-2">{getMetadata(workbench.metadata.PlatformTitle)}</span>
      </div>

      <div class="panel-base" class:panel={$deviceInfo.docWidth > 768} class:white={!$themeStore.dark} class:onboarding={page === 'login' || page === 'signup' || page === 'password' || page === 'recovery' || page === 'createWorkspace' || page === 'selectWorkspace'}>
        <Scroller padding={page === 'signup' || page === 'password' || page === 'recovery' ? '.5rem 0' : '1rem 0'}>
          <div class="form-content">
            {#if page === 'login'}
              {#if localLoginHidden}
                <ProvidersOnlyForm />
              {:else}
                <LoginForm {navigateUrl} {signUpDisabled} {useOTP} />
              {/if}
            {:else if page === 'signup'}
              <SignupForm {navigateUrl} {signUpDisabled} {localLoginHidden} {useOTP} />
            {:else if page === 'createWorkspace'}
              <CreateWorkspaceForm />
            {:else if page === 'password'}
              <PasswordRequest {signUpDisabled} />
            {:else if page === 'recovery'}
              <PasswordRestore />
            {:else if page === 'selectWorkspace'}
              <SelectWorkspace {navigateUrl} />
            {:else if page === 'join'}
              <Join />
            {:else if page === 'autoJoin'}
              <AutoJoin />
            {:else if page === 'confirm'}
              <Confirmation />
            {:else if page === 'confirmationSend'}
              <ConfirmationSend />
            {:else if page === 'auth'}
              <Auth />
            {:else if page === 'changePassword'}
              <ChangePassword />
            {:else if page === 'tfa'}
              <LoginTfaForm {navigateUrl} token={tfaToken} on:back={() => (page = 'login')} />
            {/if}
          </div>
        </Scroller>
      </div>

      {#if $deviceInfo.docWidth > 768 && (page === 'login' || page === 'signup' || page === 'password' || page === 'recovery' || page === 'createWorkspace' || page === 'selectWorkspace')}
        <div class="brand-footer">
          <span><Label label={login.string.Security} /></span><i>•</i>
          <span><Label label={login.string.Reliability} /></span><i>•</i>
          <span><Label label={login.string.Performance} /></span>
        </div>
      {/if}

      <Popup />
    </div>
  </div>
{/if}

<style lang="scss">
.back-image {
    position: fixed;
    top: 32px;
    left: 0;
    width: 100%;
    height: calc(100% - 32px);
    object-fit: cover;
    object-position: center center;
    user-select: none;
    pointer-events: none;
  }

  .backd {
    position: relative;
    overflow: hidden;
    background: #f7f8ff;
    color: #17203b;

    .bg-image {
      position: relative;
      display: flex;
      flex-direction: row-reverse;
      align-items: center;
      width: 100%;
      height: 100%;
      padding-right: clamp(2rem, 5vw, 6.5rem) !important;
    }

    &.paneld {
      background: linear-gradient(145deg, #f9faff 0%, #eef2ff 100%);

      .panel-base {
        padding-top: 5rem;
        padding-bottom: 1rem;
        width: 100%;
      }
    }
  }

  .platform-brand {
    color: #17203b;
    z-index: 3;
  }

  .panel {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: min(31rem, 42vw);
    min-width: 29rem;
    max-width: 32rem;
    max-height: calc(100dvh - 7rem);
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(125, 136, 182, 0.2);
    border-radius: 1.4rem;
    box-shadow: 0 24px 70px rgba(75, 86, 145, 0.14);
    backdrop-filter: blur(28px) saturate(115%);
    -webkit-backdrop-filter: blur(28px) saturate(115%);

    &::before {
      position: absolute;
      content: '';
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.85);
    }
  }

  .backd.paneld::after,
  .panel::after {
    display: none;
  }

  .form-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    flex-grow: 1;
    height: max-content;
  }

  .brand-footer {
    position: fixed;
    left: 2.5rem;
    bottom: 2rem;
    display: flex;
    align-items: center;
    gap: .85rem;
    color: #75809b;
    font-size: .8rem;
    z-index: 2;
  }
  .brand-footer i { font-style: normal; opacity: .5; }

  .panel.onboarding {
    width: min(31rem, 42vw);
    min-width: 29rem;
    max-width: 32rem;
  }

  @media (max-width: 1100px) {
    .backd .bg-image { padding-right: 2rem !important; }
    .panel,
    .panel.onboarding { width: min(30rem, 48vw); min-width: 27rem; }
  }

  @media (max-width: 768px) {
    .back-image { display: none !important; }
    .backd .bg-image { padding: 0 !important; }
    .platform-brand { color: #17203b; }
    .panel-base { background: transparent; box-shadow: none; border: 0; backdrop-filter: none; }
  }
</style>
