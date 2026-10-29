// Motor de plantillas minimalista: reemplaza {{variable}} por su valor.
// Los valores se escapan para evitar inyección de HTML (XSS).
const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function render(template, vars = {}) {
  return String(template).replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) =>
    key in vars ? escapeHtml(vars[key]) : `<em class="missing">{{${key}}}</em>`
  );
}

module.exports = { render, escapeHtml };
