import { ITEMS } from "./data.js";
export async function queryItems(c, o) { return { items: ITEMS.slice(0, (o&&o.limit)||50), hasNext: false, total: ITEMS.length }; }
export async function distinctValues(c, f) { return [...new Set(ITEMS.map(i => i[f]))]; }
