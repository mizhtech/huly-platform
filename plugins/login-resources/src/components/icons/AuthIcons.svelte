<script lang="ts">
  export let name: 'mail' | 'lock' | 'eye' | 'eye-off' | 'arrow' | 'user' | 'briefcase' | 'layers' | 'sparkles' | 'chevron' | 'plus' | 'info' = 'user'
  export let size = 20
</script>

<svg
  width={size}
  height={size}
  viewBox="0 0 24 24"
  fill="none"
  xmlns="http://www.w3.org/2000/svg"
  aria-hidden="true"
>
  {#if name === 'mail'}
    <path d="M3 6.5h18v11H3v-11Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
    <path d="m4 7 8 6 8-6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
  {:else if name === 'lock'}
    <rect x="5" y="10" width="14" height="11" rx="2" stroke="currentColor" stroke-width="1.7" />
    <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" stroke-width="1.7" />
  {:else if name === 'eye' || name === 'eye-off'}
    <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" stroke="currentColor" stroke-width="1.7" />
    <circle cx="12" cy="12" r="2.3" stroke="currentColor" stroke-width="1.7" />
    {#if name === 'eye-off'}<path d="M4 4 20 20" stroke="currentColor" stroke-width="1.7" />{/if}
  {:else if name === 'arrow'}
    <path d="M5 12h13M14 7l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  {:else if name === 'briefcase'}
    <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" stroke-width="1.7" />
    <path d="M8 7V5h8v2M3 12h18" stroke="currentColor" stroke-width="1.7" />
  {:else if name === 'layers'}
    <path d="m12 3 9 5-9 5-9-5 9-5Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
    <path d="m3 12 9 5 9-5M3 16l9 5 9-5" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round" />
  {:else if name === 'sparkles'}
    <path d="m12 3 1.3 3.7L17 8l-3.7 1.3L12 13l-1.3-3.7L7 8l3.7-1.3L12 3ZM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z" fill="currentColor" />
  {:else if name === 'chevron'}
    <path d="m9 5 7 7-7 7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
  {:else if name === 'plus'}
    <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  {:else if name === 'info'}
    <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.7" /><path d="M12 10v6M12 7h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
  {:else}
    <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="1.7" /><path d="M4 21a8 8 0 0 1 16 0" stroke="currentColor" stroke-width="1.7" />
  {/if}
</svg>
