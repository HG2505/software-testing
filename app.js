'use strict';
const express    = require('express');
const { engine } = require('express-handlebars');
const path       = require('path');

// ── Session store (in-memory, shared across tests via module cache) ──────────
const sessions = {};

function createApp() {
  const app = express();

  // ── Handlebars ────────────────────────────────────────────────
  app.engine('hbs', engine({
    extname:       '.hbs',
    defaultLayout: 'main',
    layoutsDir:    path.join(__dirname, 'views/layouts'),
    partialsDir:   path.join(__dirname, 'views/partials'),
    helpers: {
      eq:         (a, b) => a === b,
      gt:         (a, b) => a > b,
      add:        (a, b) => +(a + b).toFixed(2),
      currency:   v      => '$' + Number(v).toFixed(2),
      times:      (a, b) => +(a * b).toFixed(2),
      formatDate: d      => d ? new Date(d).toLocaleDateString('vi-VN') : '',
      badgeClass: badge  => {
        const map = { Bestseller:'badge-gold', New:'badge-teal', Sale:'badge-red', Limited:'badge-purple' };
        return map[badge] || 'badge-gray';
      },
    },
  }));
  app.set('view engine', 'hbs');
  app.set('views', path.join(__dirname, 'views'));

  // ── Body parsers ──────────────────────────────────────────────
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // ── Session middleware ─────────────────────────────────────────
  app.use((req, res, next) => {
    let sid = null;
    const cookieHeader = req.headers.cookie || '';
    const match = cookieHeader.match(/(?:^|;\s*)sid=([^;]+)/);
    if (match) sid = match[1];

    if (!sid || !sessions[sid]) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessions[sid] = {};
    }

    req.session    = sessions[sid];
    res.locals.user = req.session.user || null;
    res.setHeader('Set-Cookie', `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
    next();
  });

  // ── Static files ──────────────────────────────────────────────
  app.use(express.static(path.join(__dirname, 'public')));

  // ── Routes ────────────────────────────────────────────────────
  app.use('/', require('./routes/index'));

  // ── Error handler ─────────────────────────────────────────────
  app.use((err, req, res, _next) => {
    console.error(err.stack);
    res.status(500).send('<h2>Something went wrong</h2><pre>' + err.message + '</pre>');
  });

  return app;
}

module.exports = createApp;

// ── Start when run directly ───────────────────────────────────
if (require.main === module) {
  const app  = createApp();
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`\nSwagStore → http://localhost:${PORT}\n`));
}
