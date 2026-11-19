// Turns the current tab into a new tab: opens one in its place and closes the old one, like ⌘T then ⌘W.
// No `tabs` permission needed: creating, closing and finding the active tab don't read any page.
const api = globalThis.browser ?? globalThis.chrome

api.commands.onCommand.addListener(async command => {
  if (command !== 'replace-tab') return
  const [tab] = await api.tabs.query({ active: true, lastFocusedWindow: true })
  if (!tab) return
  await api.tabs.create({ windowId: tab.windowId, index: tab.index + 1 })
  await api.tabs.remove(tab.id)
})

// A web tile keeps its own site inside the tile, but a link to a different site takes the whole tab
// there: the tile is a window onto one page, and most sites refuse to be shown inside another page.
// Only frames sitting directly on the new tab page count, so ads and embeds inside a tile are left alone.
const newTabPages = ['about:newtab', 'about:home', 'chrome://newtab/']
const isNewTabPage = url => !!url && (url.startsWith(api.runtime.getURL('')) || newTabPages.includes(url))
const site = url => new URL(url).hostname.split('.').slice(-2).join('.') // ponytail: last two labels, so foo.co.uk and bar.co.uk count as one site

api.webNavigation.onBeforeNavigate.addListener(async ({ tabId, frameId, parentFrameId, url }) => {
  if (parentFrameId !== 0) return
  const [page, frame] = await Promise.all([
    api.webNavigation.getFrame({ tabId, frameId: 0 }),
    api.webNavigation.getFrame({ tabId, frameId }),
  ]).catch(() => [])
  if (!isNewTabPage(page?.url) || !frame?.url.startsWith('http')) return
  if (site(frame.url) !== site(url)) api.tabs.update(tabId, { url })
}, { url: [{ schemes: ['http', 'https'] }] })
