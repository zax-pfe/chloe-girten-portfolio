// Every other page: no piece panel. Without it, a client-side navigation (navbar, close)
// would keep the last panel open, the slot keeping its previous state.
export default function NoModal() {
  return null;
}
