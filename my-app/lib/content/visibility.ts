/** Drafts stay with the owner. Everyone else only sees published rows. */
export function visibleToVisitor(published: boolean, owner: boolean) {
  return owner || published;
}
