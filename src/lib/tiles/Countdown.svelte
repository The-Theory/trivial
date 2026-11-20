<script lang="ts">
  import { formatDay, upcoming, type CountdownTile } from '../config'

  let { tile }: { tile: CountdownTile } = $props()

  // The count changes once a day: at local midnight, and whenever the tab comes back into view
  // (timers in background tabs can be held back, and the computer may have slept past midnight).
  let today = $state(new Date())
  $effect(() => {
    let timer = 0
    const refresh = () => {
      today = new Date()
      clearTimeout(timer)
      const midnight = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)
      timer = window.setTimeout(refresh, midnight.getTime() - today.getTime() + 1000)
    }
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    refresh()
    document.addEventListener('visibilitychange', onVisible)
    window.addEventListener('focus', refresh)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
      window.removeEventListener('focus', refresh)
    }
  })

  const list    = $derived(upcoming(tile.dates, today))
  const next    = $derived(list[0])
  const compact = $derived(tile.w === 1 || tile.h === 1)

  const name = (c: { label: string; date: string }) => c.label.trim() || formatDay(c.date)
  const left = (days: number) => (days === 0 ? 'Today' : days === 1 ? '1 day' : `${days} days`)
</script>

<div class="countdown" class:compact class:alone={list.length === 1}>
  {#if !tile.dates.some(c => c.date)}
    <p class="hint">No dates yet</p>
  {:else if !next}
    <p class="hint">Nothing coming up</p>
  {:else}
    <div class="next">
      {#if next.days === 0}
        <p class="days today">Today</p>
      {:else}
        <p class="days">{next.days}<span class="unit">{next.days === 1 ? 'day' : 'days'}</span></p>
      {/if}
      <p class="event">{name(next)}</p>
      {#if tile.showDates}<p class="when">{formatDay(next.date)}</p>{/if}
    </div>
    {#if list.length > 1 && !compact}
      <ul class="later">
        {#each list.slice(1) as c (c.id)}
          <li class="event">
            <span class="name">{name(c)}{#if tile.showDates}<span class="when">{formatDay(c.date)}</span>{/if}</span>
            <span class="left">{left(c.days)}</span>
          </li>
        {/each}
      </ul>
    {/if}
  {/if}
</div>
