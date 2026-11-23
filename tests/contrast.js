// WCAG contrast of key text colours on their usual backgrounds, light and dark.
const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
const lin = c => c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
const L = h => { const [r, g, b] = hex(h).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const cr = (a, b) => { const x = L(a), y = L(b); return ((Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)).toFixed(2); };
const mix = (a, b, p) => { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round((v * p + B[i] * (1 - p)) * 255).toString(16).padStart(2, '0')).join(''); };
const modes = {
  light: { surface: '#FFFFFF', bg: '#EEF2F8', ink: '#0D1829', ink2: '#34425A', muted: '#5E6C83', faint: '#8692A8', wait: '#5B55E8', fu: '#CF6A0E', done: '#0E8653', danger: '#D93D42', ua: '#2F6BFF', ab: '#0A8A73', field: '#FFFFFF', fieldLine: '#D8DFEA', raise: '#FFFFFF', soft: '#F3F6FB', pct: .11, onAcc: '#FFFFFF' },
  dark: { surface: '#111A27', bg: '#0A0F18', ink: '#E8EDF5', ink2: '#BDC7D5', muted: '#8C99AD', faint: '#67748B', wait: '#918BFF', fu: '#FFA65A', done: '#3FCC92', danger: '#FF6E73', ua: '#6492FF', ab: '#2DC5A8', field: '#0C1420', fieldLine: '#283750', raise: '#22314A', soft: '#162131', pct: .18, onAcc: '#07101E' }
};
for (const [m, c] of Object.entries(modes)) {
  const out = [];
  for (const k of ['ink', 'ink2', 'muted', 'faint', 'wait', 'fu', 'done', 'danger', 'ua', 'ab']) out.push(`${k}/surface ${cr(c[k], c.surface)}`);
  out.push(`ua on ua-soft ${cr(c.ua, mix(c.ua, c.surface, c.pct))}`);
  out.push(`fu-pill text ${cr(mix(c.fu, c.ink, .78), mix(c.fu, c.surface, .14))}`);
  out.push(`field vs surface ${cr(c.field, c.surface)} | fieldLine vs field ${cr(c.fieldLine, c.field)} | raise vs soft ${cr(c.raise, c.soft)}`);
  out.push(`btn text on ua ${cr(c.onAcc, c.ua)} | on ab ${cr(c.onAcc, c.ab)} | badge ${cr('#1A1004', c.fu)}`);
  console.log(m + ':\n  ' + out.join('\n  '));
}
