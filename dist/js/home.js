/* Home: roster filmstrip read from the Influencers collection */
import { queryItems } from "/js/wix/items.js";
import { imgSrc } from "/js/wix/media.js";
import { esc, cityName } from "/js/format.js";

var film = document.getElementById("film");

function render(items) {
  if (!items.length) {
    film.innerHTML = '<p class="state-msg">The roster is being updated. Check back soon.</p>';
    return;
  }
  film.innerHTML = items.map(function (it) {
    var img = it.photo ? '<img src="' + imgSrc(it.photo, 360, 800) + '" alt="' + esc(it.name) + ", " + esc(it.niche || "creator") + '" loading="lazy">' : "";
    return '<a href="/influencers.html#' + esc(it.slug || "") + '">' + img +
      '<span class="meta"><strong>' + esc(it.name) + "</strong><span>" + esc(cityName(it.city)) + (it.niche ? " · " + esc(it.niche) : "") + "</span></span></a>";
  }).join("");
}

queryItems("Influencers", { sort: [{ field: "order", direction: "asc" }], limit: 6 })
  .then(function (res) { render(res.items || []); })
  .catch(function () {
    film.innerHTML = '<p class="state-msg">We couldn\'t load the roster right now. <a href="/influencers.html">Try the creators page</a>.</p>';
  });
