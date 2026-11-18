/* Creators page: Influencers collection with a city filter */
import { createCollectionStore } from "/js/wix/collection-store.js";
import { distinctValues } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { esc, compact, cityName } from "/js/format.js";

var COLLECTION = "Influencers";
var SORT = [{ field: "order", direction: "asc" }];
var grid = document.getElementById("roster");
var chipsEl = document.getElementById("chips");
var moreEl = document.getElementById("more");
var countEl = document.getElementById("count");
var active = null;
var cities = [];

var store = createCollectionStore({ collectionId: COLLECTION, sort: SORT, limit: 9, withTotal: true });

function renderChips() {
  if (cities.length < 2) { chipsEl.innerHTML = ""; return; }
  var html = '<button class="chip" type="button" data-city="" aria-pressed="' + (active === null) + '">All cities</button>';
  cities.forEach(function (c) {
    html += '<button class="chip" type="button" data-city="' + esc(c) + '" aria-pressed="' + (active === c) + '">' + esc(cityName(c)) + "</button>";
  });
  chipsEl.innerHTML = html;
}

function card(it) {
  var photo = it.photo
    ? '<img src="' + imgSrc(it.photo, 720, 900) + '" alt="Portrait of ' + esc(it.name) + '" loading="lazy">'
    : "";
  var stats = "";
  var cells = [
    ["TikTok", compact(it.tiktokFollowers)],
    ["Instagram", compact(it.instagramFollowers)],
    ["Engagement", typeof it.engagement === "number" ? it.engagement + "%" : ""]
  ].filter(function (c) { return c[1]; });
  if (cells.length) {
    stats = '<dl class="stats">' + cells.map(function (c) { return "<div><dt>" + c[0] + "</dt><dd>" + esc(c[1]) + "</dd></div>"; }).join("") + "</dl>";
  }
  var tags = Array.isArray(it.specialties) && it.specialties.length
    ? '<div class="tags">' + it.specialties.map(function (t) { return "<span>" + esc(t) + "</span>"; }).join("") + "</div>"
    : "";
  return '<article class="creator reveal" id="' + esc(it.slug || "") + '">' +
    '<div class="creator-photo">' + photo +
      (it.city ? '<span class="chip static">' + esc(it.city) + "</span>" : "") +
      '<h2 class="name">' + esc(it.name) + "</h2></div>" +
    '<div class="creator-body">' +
      '<div class="creator-top">' + (it.handle ? '<span class="handle">' + esc(it.handle) + "</span>" : "") +
        (it.niche ? '<span class="niche">' + esc(it.niche) + "</span>" : "") + "</div>" +
      stats +
      (it.bio ? '<p class="creator-bio">' + esc(it.bio) + "</p>" : "") +
      tags +
      '<a class="btn btn-lime btn-sm creator-cta" href="/contact.html">Book ' + esc(String(it.name || "").split(" ")[0]) + ' <span class="arrow" aria-hidden="true">→</span></a>' +
    "</div></article>";
}

var scrolledToHash = false;
function render(s) {
  grid.setAttribute("aria-busy", String(s.loading || s.items === null));
  grid.classList.toggle("dim", !!s.fetching);
  moreEl.hidden = !s.hasNext;
  moreEl.disabled = !!s.loadingMore;
  moreEl.textContent = s.loadingMore ? "Loading…" : "Load more";

  if (s.error && !s.items) {
    grid.innerHTML = '<div class="state-msg">We couldn\'t load the roster. <button class="btn btn-ghost btn-sm" type="button" data-retry>Try again</button></div>';
    return;
  }
  if (s.items === null) return; // skeletons stay
  if (!s.items.length) {
    grid.innerHTML = '<p class="state-msg">No creators in this city yet.</p>';
  } else {
    grid.innerHTML = s.items.map(card).join("");
    if (window.xsObserve) window.xsObserve(grid);
  }
  if (typeof s.total === "number") {
    countEl.hidden = false;
    countEl.querySelector("span").textContent = s.total + (s.total === 1 ? " creator" : " creators") + (active ? " in " + cityName(active) : " on the roster");
  }
  if (!scrolledToHash && location.hash.length > 1) {
    scrolledToHash = true;
    var target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (target) setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 150);
  }
}

chipsEl.addEventListener("click", function (e) {
  var b = e.target.closest("button[data-city]");
  if (!b) return;
  active = b.dataset.city || null;
  renderChips();
  store.setQuery({ filters: active ? [{ field: "city", op: "eq", value: active }] : [], sort: SORT });
});
moreEl.addEventListener("click", function () { store.loadMore(); });
grid.addEventListener("click", function (e) { if (e.target.closest("[data-retry]")) store.retry(); });

distinctValues(COLLECTION, "city").then(function (values) {
  cities = (values || []).slice().sort();
  renderChips();
}).catch(function () {});

store.subscribe(render);
render(store.getState());
store.start();
