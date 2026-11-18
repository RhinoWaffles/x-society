/* Contact page: the Wix form, rendered from its schema */
import { createFormStore, FORM_ERROR } from "/js/wix/form-store.js";
import { esc } from "/js/format.js";

var FORM_ID = "afa94c12-49af-4368-a49a-eeab37640347";
var root = document.getElementById("form-root");
var store = createFormStore({ formId: FORM_ID });
var builtKey = "";
var formEl = null;

function inputType(c) {
  return { email: "email", url: "url", phone: "tel", password: "password", number: "number",
    date: "date", time: "time", datetime: "datetime-local" }[c] || "text";
}

function reqMark(f, s) {
  if (!f.required || (s.form && s.form.requiredIndicator === "NONE")) return "";
  return s.form && s.form.requiredIndicator === "TEXT" ? ' <span class="req">(required)</span>' : '<span class="req" aria-hidden="true">*</span>';
}

function fieldHtml(f, s) {
  var v = s.values[f.target];
  var id = "f-" + f.target;
  var half = /^(text|email|phone|url|number|date|time|select)$/.test(f.control) && !/campaign|message|about/i.test(f.label);
  var cls = "field" + (half ? " half" : "");
  var label = f.showLabel === false ? '<span class="sr-only">' + esc(f.label) + "</span>" : esc(f.label) + reqMark(f, s);
  var help = f.description ? '<span class="help">' + esc(f.description) + "</span>" : "";
  var err = '<span class="err" id="' + id + '-err" role="alert" data-err="' + esc(f.target) + '" hidden></span>';
  var dis = f.readOnly ? " disabled" : "";
  var req = f.required ? " required" : "";
  var ph = f.placeholder ? ' placeholder="' + esc(f.placeholder) + '"' : "";

  switch (f.control) {
    case "textarea":
      var max = f.validation && f.validation.maxLength ? ' maxlength="' + f.validation.maxLength + '"' : "";
      return '<div class="' + cls + '"><label for="' + id + '">' + label + '</label><textarea id="' + id + '" name="' + esc(f.target) + '"' + max + ph + req + dis + ' aria-describedby="' + id + '-err">' + esc(v || "") + "</textarea>" + help + err + "</div>";
    case "select":
      var opts = '<option value="">Choose one</option>' + (f.choices || []).map(function (c) {
        return '<option value="' + esc(c.value) + '"' + (v === c.value ? " selected" : "") + ">" + esc(c.label) + "</option>";
      }).join("");
      return '<div class="' + cls + '"><label for="' + id + '">' + label + '</label><select id="' + id + '" name="' + esc(f.target) + '"' + req + dis + ' aria-describedby="' + id + '-err">' + opts + "</select>" + help + err + "</div>";
    case "radio":
    case "checkboxGroup":
    case "tags":
      var multi = f.control !== "radio";
      var arr = Array.isArray(v) ? v : (v ? [v] : []);
      var boxes = (f.choices || []).map(function (c) {
        return '<label><input type="' + (multi ? "checkbox" : "radio") + '" name="' + esc(f.target) + '" value="' + esc(c.value) + '"' + (arr.indexOf(c.value) > -1 ? " checked" : "") + dis + ">" + esc(c.label) + "</label>";
      }).join("");
      return '<fieldset class="field" aria-describedby="' + id + '-err"><legend>' + label + '</legend><div class="check-group" data-group="' + esc(f.target) + '" data-multi="' + multi + '">' + boxes + "</div>" + help + err + "</fieldset>";
    case "checkbox":
      return '<div class="field"><label class="check-single"><input type="checkbox" id="' + id + '" name="' + esc(f.target) + '"' + (v === true ? " checked" : "") + dis + ' aria-describedby="' + id + '-err"><span>' + label + "</span></label>" + help + err + "</div>";
    case "payment":
    case "appointment":
    case "unknown":
    case "address":
    case "file":
    case "signature":
      return '<div class="field"><span>' + esc(f.label) + '</span><span class="help">This part of the form isn\'t available here. Email us instead.</span></div>';
    default:
      return '<div class="' + cls + '"><label for="' + id + '">' + label + '</label><input id="' + id + '" name="' + esc(f.target) + '" type="' + inputType(f.control) + '" value="' + esc(v == null ? "" : v) + '"' + ph + req + dis + ' aria-describedby="' + id + '-err" autocomplete="' + autocomplete(f) + '">' + help + err + "</div>";
  }
}

function autocomplete(f) {
  var id = f.identifier || "";
  if (/FIRST_NAME/.test(id)) return "given-name";
  if (/LAST_NAME/.test(id)) return "family-name";
  if (/EMAIL/.test(id) || f.control === "email") return "email";
  if (/COMPANY/.test(id)) return "organization";
  if (/PHONE/.test(id) || f.control === "phone") return "tel";
  return "off";
}

function currentFields(s) {
  var step = s.form.steps && s.form.steps[s.step];
  return s.form.fields.filter(function (f) { return !step || !f.stepId || f.stepId === step.id; });
}

function build(s) {
  var fields = currentFields(s);
  var steps = s.form.steps || [];
  var last = s.step >= steps.length - 1;
  var progress = steps.length > 1 ? '<p class="help" style="grid-column:1/-1">Step ' + (s.step + 1) + " of " + steps.length + (steps[s.step] && steps[s.step].name ? " · " + esc(steps[s.step].name) : "") + "</p>" : "";
  var html = '<form class="form-grid" novalidate>' + progress + fields.map(function (f) { return fieldHtml(f, s); }).join("") +
    '<div class="form-error" data-form-error role="alert" hidden></div>' +
    '<div class="form-actions">' +
      (s.step > 0 ? '<button class="btn btn-ghost" type="button" data-prev>' + esc(s.form.previousText || "Back") + "</button>" : '<span class="note">We never share your info.</span>') +
      '<button class="btn btn-lime" type="submit" data-primary>' + esc(last ? (s.form.submitText || "Send it") : (s.form.nextText || "Next")) + ' <span class="arrow" aria-hidden="true">→</span></button>' +
    "</div></form>";
  root.innerHTML = html;
  formEl = root.querySelector("form");
  wire();
}

function wire() {
  formEl.addEventListener("input", function (e) {
    var t = e.target;
    var group = t.closest("[data-group]");
    if (group) {
      if (group.dataset.multi === "true") {
        var vals = Array.prototype.map.call(group.querySelectorAll("input:checked"), function (i) { return i.value; });
        store.setValue(group.dataset.group, vals);
      } else {
        store.setValue(group.dataset.group, t.value);
      }
      return;
    }
    if (!t.name) return;
    if (t.type === "checkbox") store.setValue(t.name, t.checked);
    else if (t.type === "number") store.setValue(t.name, t.value === "" ? "" : Number(t.value));
    else store.setValue(t.name, t.value);
  });
  formEl.addEventListener("change", function (e) {
    if (e.target.tagName === "SELECT") store.setValue(e.target.name, e.target.value);
  });
  formEl.addEventListener("focusout", function (e) {
    var group = e.target.closest("[data-group]");
    var name = group ? group.dataset.group : e.target.name;
    if (name) store.validate(name);
  });
  formEl.addEventListener("submit", function (e) {
    var s = store.getState();
    if (s.form && s.step < s.form.steps.length - 1) store.next(e);
    else store.submit(e);
  });
  formEl.addEventListener("click", function (e) {
    if (e.target.closest("[data-prev]")) store.previous();
  });
}

function update(s) {
  if (!formEl) return;
  formEl.querySelectorAll("[data-err]").forEach(function (el) {
    var msg = s.errors[el.dataset.err];
    el.hidden = !msg;
    el.textContent = msg || "";
    var ctrl = formEl.querySelector('[name="' + CSS.escape(el.dataset.err) + '"]');
    if (ctrl) {
      if (msg) ctrl.setAttribute("aria-invalid", "true"); else ctrl.removeAttribute("aria-invalid");
    }
  });
  var fe = formEl.querySelector("[data-form-error]");
  fe.hidden = !s.errors[FORM_ERROR];
  fe.textContent = s.errors[FORM_ERROR] || "";
  var btn = formEl.querySelector("[data-primary]");
  btn.disabled = !!s.loading;
  btn.setAttribute("aria-busy", String(!!s.loading));
}

function thanks(outcome) {
  var lines = outcome.message ? String(outcome.message).split("\n").filter(Boolean) : ["Got it. Someone from X Society will hit you back within 48 hours."];
  root.innerHTML = '<div class="thanks" role="status"><div class="big">Brief received</div>' +
    lines.map(function (l) { return "<p>" + esc(l) + "</p>"; }).join("") +
    '<a class="btn btn-ghost" href="/influencers.html">Browse the roster <span class="arrow" aria-hidden="true">→</span></a></div>';
  formEl = null;
  builtKey = "";
  if (outcome.durationSeconds) setTimeout(function () { store.reset(); }, outcome.durationSeconds * 1000);
}

function render(s) {
  if (s.outcome) {
    if (s.outcome.url) {
      if (s.outcome.newTab) window.open(s.outcome.url, "_blank", "noopener"); else location.href = s.outcome.url;
      return;
    }
    thanks(s.outcome);
    return;
  }
  if (!s.form) {
    root.innerHTML = s.errors[FORM_ERROR]
      ? '<p class="form-error">' + esc(s.errors[FORM_ERROR]) + ' You can also email <a href="mailto:hello@xsociety.com">hello@xsociety.com</a>.</p>'
      : '<p class="form-loading">Loading the form…</p>';
    builtKey = "";
    formEl = null;
    return;
  }
  if (s.closed) {
    root.innerHTML = '<p class="form-loading">' + esc(s.form.disabledMessage || "We're not taking new briefs through the form right now. Email hello@xsociety.com.") + "</p>";
    formEl = null;
    return;
  }
  var key = s.step + "|" + currentFields(s).map(function (f) { return f.target + ":" + f.required + ":" + (f.choices || []).length; }).join(",");
  if (key !== builtKey) {
    builtKey = key;
    build(s);
  }
  update(s);
}

store.subscribe(render);
render(store.getState());
store.start();
