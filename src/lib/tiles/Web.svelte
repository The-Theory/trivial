<script lang="ts">
  import { safeUrl, type WebTile } from '../config'
  import { app } from '../state.svelte'

  let { tile }: { tile: WebTile } = $props()

  let online = $state(navigator.onLine)

  // Keys typed after clicking into the site go to the site, so Escape and the other page keys stop
  // working. Moving off the tile hands the keyboard back to the page: the page only sees the pointer
  // move once it's outside the site's frame (leave events don't arrive from inside it).
  let frame = $state<HTMLIFrameElement>()
  const release = () => frame?.blur()
</script>

<svelte:window ononline={() => (online = true)} onoffline={() => (online = false)} onpointermove={release} />

<div class="web zoom-{tile.zoom}">
  {#if !tile.url}
    <p class="hint padded">No address set</p>
  {:else if !online}
    <p class="offline">{tile.offline || 'Offline'}</p>
  {:else}
    <!-- Sandboxed so the site can't navigate the new tab page away on its own; a click on a link meant for the whole tab (target=_top) still can. Out of the tab order while editing. -->
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <iframe
      bind:this={frame}
      src={safeUrl(tile.url)}
      title={tile.url}
      referrerpolicy="no-referrer"
      sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-modals allow-downloads allow-top-navigation-by-user-activation"
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      tabindex={app.editing ? -1 : undefined}
    ></iframe>
  {/if}
</div>
