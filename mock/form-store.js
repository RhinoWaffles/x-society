export const FORM_ERROR = "$form";
const fields = [
 {target:"first_name_a",label:"First name",control:"text",required:true,identifier:"CONTACTS_FIRST_NAME",showLabel:true},
 {target:"last_name_b",label:"Last name",control:"text",required:false,identifier:"CONTACTS_LAST_NAME",showLabel:true},
 {target:"email_c",label:"Email",control:"email",required:true,identifier:"CONTACTS_EMAIL",showLabel:true},
 {target:"company_d",label:"Brand / Company",control:"text",required:true,identifier:"CONTACTS_COMPANY",showLabel:true},
 {target:"budget_e",label:"Budget",control:"select",required:false,showLabel:true,choices:["Under $10K","$10K - $25K","$25K - $50K","$50K+"].map(v=>({value:v,label:v}))},
 {target:"cities_f",label:"Cities",control:"checkboxGroup",required:false,showLabel:true,choices:["Atlanta","Chicago","Brooklyn","Louisville","Austin"].map(v=>({value:v,label:v}))},
 {target:"campaign_g",label:"Tell us about your campaign",control:"textarea",required:false,showLabel:true,validation:{maxLength:1000}}];
export function createFormStore() {
  let s = { form: null, values: {}, errors: {}, step: 0, loading: true, outcome: null, closed: false };
  const subs = []; const emit = () => subs.forEach(f => f(s));
  const check = t => { const f = fields.find(x => x.target === t); return f && f.required && !s.values[t] ? "Enter a value." : null; };
  return { subscribe: f => subs.push(f), getState: () => s,
    start() { setTimeout(() => { s = { ...s, loading: false, form: { fields, steps: [{ id: "s1" }], submitText: "Send it", requiredIndicator: "ASTERISK" } }; emit(); }, 150); },
    setValue(t, v) { s = { ...s, values: { ...s.values, [t]: v } }; emit(); },
    validate(t) { const e = check(t); const errors = { ...s.errors }; if (e) errors[t] = e; else delete errors[t]; s = { ...s, errors }; emit(); },
    submit(e) { e && e.preventDefault(); const errors = {}; fields.forEach(f => { const m = check(f.target); if (m) errors[f.target] = m; }); s = { ...s, errors }; emit();
      if (Object.keys(errors).length) return false; s = { ...s, outcome: { message: "" } }; emit(); },
    next() {}, previous() {}, reset() {} };
}
