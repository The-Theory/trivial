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
