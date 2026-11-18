import { ITEMS } from "./data.js";
export function createCollectionStore(o) {
  let s = { items: null, hasNext: false, loading: true, fetching: false, loadingMore: false, error: null, total: null };
  const subs = []; const emit = () => subs.forEach(f => f(s));
  const run = (filters) => { const it = ITEMS.filter(i => !(filters||[]).length || filters.every(f => i[f.field] === f.value));
    setTimeout(() => { s = { ...s, items: it, total: it.length, loading: false, fetching: false }; emit(); }, 200); };
  return { subscribe: f => subs.push(f), getState: () => s, start: () => run([]),
    setQuery: q => { s = { ...s, fetching: true }; emit(); run(q.filters); }, loadMore() {}, retry() {}, refresh() {} };
}
