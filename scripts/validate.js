#!/usr/bin/env node
/* ==========================================================================
   scripts/validate.js — validación estática de seguridad y recursos
   --------------------------------------------------------------------------
   Dependencias: NINGUNA (solo Node.js >= 18, módulos nativos).
   Uso: node scripts/validate.js
   Sale con código 1 si hay algún problema: pensado para CI/CD local o
   en GitHub Actions.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const problems = [];
const warnings = [];

function read(rel) {
    return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function exists(rel) {
    return fs.existsSync(path.join(ROOT, rel));
}

function problem(msg) { problems.push(msg); }
function warn(msg) { warnings.push(msg); }

/* ---------------------------------------------------------------- 1. archivos */
const REQUIRED = [
    'index.html',
    'css/main.css',
    'css/tokens.css',
    'js/main.js',
    'js/data.js',
    'js/theme-init.js',
    'robots.txt',
    'README.md',
    '.gitignore'
];

REQUIRED.forEach(function (f) {
    if (!exists(f)) problem('Falta un archivo requerido: ' + f);
});

const html = exists('index.html') ? read('index.html') : '';
const css = ['css/main.css', 'css/tokens.css'].filter(exists).map(read).join('\n');
const js = ['js/main.js', 'js/data.js', 'js/theme-init.js'].filter(exists).map(read).join('\n');

/* ------------------------------------------- 2. protocolo seguro (sin http://) */
// Se permite únicamente el espacio de nombres XML de W3C en SVG.
[html, css, js].forEach(function (src, i) {
    const name = ['index.html', 'css/*.css', 'js/*.js'][i];
    const insecure = src.match(/http:\/\/(?!www\.w3\.org)[^\s"'<>)]+/g) || [];
    insecure.forEach(function (u) {
        problem(name + ': recurso inseguro (http://) -> ' + u);
    });
});

/* --------------------------------------------- 3. sin scripts/estilos en línea */
// <script src="..."> y JSON-LD (type="application/ld+json") sí se permiten.
const scripts = html.match(/<script\b[^>]*>[\s\S]*?<\/script>/gi) || [];
scripts.forEach(function (s) {
    if (/\ssrc\s*=/.test(s)) return;
    if (/type\s*=\s*"application\/ld\+json"/i.test(s)) return;
    problem('index.html: <script> en línea (bloqueado por CSP script-src \'self\'); muévelo a un archivo externo');
});

if (/<style\b/i.test(html)) {
    problem('index.html: bloque <style> en línea (bloqueado por CSP style-src)');
}

if (/\sstyle\s*=\s*"/.test(html)) {
    problem('index.html: atributo style="" en línea (bloqueado por CSP style-src)');
}

// Atributos de evento: on* = ... (con límite de palabra para no confundir con "content=")
const events = html.match(/(?<![a-zA-Z-])on[a-z]+\s*=\s*["']/gi) || [];
events.forEach(function (e) {
    problem('index.html: manipulador de evento en línea -> ' + e.trim());
});

if (/<(?:iframe|object|embed)\b/i.test(html)) {
    problem('index.html: usa iframe/object/embed (CSP frame-src \'none\' lo bloquearía)');
}

/* ------------------------------------------------------- 4. URIs data: peligrosas */
const dataUris = (html + css).match(/data:\s*text\/html|data:\s*application\/javascript|data:\s*image\/svg\+xml/gi) || [];
dataUris.forEach(function (u) {
    problem('Se encontró un data: URI peligroso -> ' + u);
});

/* ------------------------------------------------------------ 5. CSP y referrer */
if (!/http-equiv\s*=\s*"Content-Security-Policy"/i.test(html)) {
    problem('index.html: falta la meta Content-Security-Policy');
}

if (/<meta http-equiv="Content-Security-Policy"[^>]*content="([^"]*)"/i.test(html)) {
    const csp = html.match(/<meta http-equiv="Content-Security-Policy"[^>]*content="([^"]*)"/i)[1];
    if (/'unsafe-inline'/.test(csp)) problem('CSP: contiene unsafe-inline (anula la política)');
    if (/'unsafe-eval'/.test(csp)) problem('CSP: contiene unsafe-eval (anula la política)');
    if (!/script-src/.test(csp)) problem('CSP: falta script-src explícito');
    if (/frame-ancestors/.test(csp)) {
        warn('CSP: frame-ancestors dentro de <meta> es ignorado por los navegadores (requiere cabecera HTTP)');
    }
}

if (!/<meta name="referrer"/i.test(html)) {
    problem('index.html: falta la meta name="referrer"');
}

/* ---------------------------------------- 6. SRI en recursos externos de CDN */
// Exención documentada: Google Fonts devuelve CSS distinto según el
// User-Agent del navegador, así que el hash de SRI nunca sería estable y
// el navegador rechazaría la hoja de estilos. Se comprueba en su lugar
// que se use HTTPS y preconnect con crossorigin.
const SRI_EXEMPT = [
    'fonts.googleapis.com'
];

const links = html.match(/<link\b[^>]*rel="stylesheet"[^>]*>/gi) || [];
links.forEach(function (l) {
    const href = (l.match(/href\s*=\s*"([^"]+)"/i) || [])[1] || '';
    if (!/^https?:/i.test(href)) return;
    const host = (href.match(/^https?:\/\/([^/]+)/i) || [])[1] || '';
    if (SRI_EXEMPT.some(function (h) { return host === h; })) {
        if (!/^https:/i.test(href)) problem('Recurso exento de SRI que no usa HTTPS: ' + href);
        return;
    }
    if (!/integrity\s*=/.test(l)) {
        problem('CDN sin SRI (integrity): ' + href);
    }
    if (!/crossorigin/i.test(l)) {
        problem('CDN con SRI pero sin crossorigin: ' + href);
    }
});

const preconnects = html.match(/<link\b[^>]*rel="preconnect"[^>]*>/gi) || [];
preconnects.forEach(function (l) {
    const href = (l.match(/href\s*=\s*"([^"]+)"/i) || [])[1] || '';
    if (/^http:/i.test(href)) problem('preconnect inseguro (http://): ' + href);
});

/* ------------------------------------- 7. recursos locales referenciados existen */
const refRe = /(?:src|href)\s*=\s*"([^"]+)"/gi;
let m;
while ((m = refRe.exec(html)) !== null) {
    const ref = m[1];
    if (/^(https?:|mailto:|tel:|#|data:|javascript:)/i.test(ref)) continue;
    const clean = ref.split('?')[0].split('#')[0];
    if (!clean) continue;
    if (!exists(clean)) problem('index.html referencia un archivo inexistente: ' + ref);
}

/* ------------------------------------------ 8. enlaces con pestaña nueva seguros */
const blanks = html.match(/target="_blank"[\s\S]{0,300}?rel="([^"]+)"/gi) || [];
let blankCount = (html.match(/target="_blank"/g) || []).length;
blanks.forEach(function (b) {
    const rel = (b.match(/rel="([^"]+)"/i) || [])[1] || '';
    if (!/\bnoopener\b/.test(rel)) problem('target="_blank" sin rel="noopener": ' + b.slice(0, 80));
    if (!/\bnoreferrer\b/.test(rel)) warn('target="_blank" sin rel="noreferrer": ' + b.slice(0, 80));
});
if (blanks.length < blankCount) {
    problem('Hay ' + (blankCount - blanks.length) + ' enlace(s) target="_blank" sin rel="noopener"');
}

/* --------------------------------------------------------- 9. secretos y claves */
const SECRET_PATTERNS = [
    [/AKIA[0-9A-Z]{16}/g, 'clave AWS Access Key'],
    [/ghp_[A-Za-z0-9]{36}/g, 'token de GitHub (ghp_)'],
    [/github_pat_[A-Za-z0-9_]{22,}/g, 'token de GitHub (fine-grained)'],
    [/-----BEGIN [A-Z ]*PRIVATE KEY-----/g, 'clave privada'],
    [/xox[baprs]-[A-Za-z0-9-]{10,}/g, 'token de Slack'],
    [/\bsk-[A-Za-z0-9_-]{20,}/g, 'clave secreta tipo sk-'],
    [/\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\./g, 'JWT embebido'],
    [/\b(api[_-]?key|secret|password|passwd|token)\s*[:=]\s*["'][^"']{8,}["']/gi, 'credencial embebida']
];

const scanTargets = [
    ['index.html', html],
    ['css/main.css', exists('css/main.css') ? read('css/main.css') : ''],
    ['css/tokens.css', exists('css/tokens.css') ? read('css/tokens.css') : ''],
    ['js/main.js', exists('js/main.js') ? read('js/main.js') : ''],
    ['js/data.js', exists('js/data.js') ? read('js/data.js') : '']
];

scanTargets.forEach(function (pair) {
    const file = pair[0];
    const body = pair[1];
    SECRET_PATTERNS.forEach(function (p) {
        // Se ignoran falsos positivos conocidos: tokens.css, aria-*, data-*
        const re = new RegExp(p[0].source, p[0].flags.replace('g', '') + 'g');
        let mm;
        while ((mm = re.exec(body)) !== null) {
            const around = body.slice(Math.max(0, mm.index - 40), mm.index + mm[0].length + 40);
            if (/tokens\.css|aria-|data-|font-|transition|--|ejemplo|placeholder|example/i.test(around)) continue;
            problem(file + ': posible ' + p[1] + ' -> ' + mm[0].slice(0, 60));
        }
    });
});

/* ------------------------------------------------- 10. gitignore y archivos .env */
if (exists('.gitignore')) {
    const gi = read('.gitignore');
    ['.env', 'node_modules/', '*.log', '.DS_Store'].forEach(function (rule) {
        if (!gi.includes(rule)) warn('.gitignore: falta la regla ' + rule);
    });
} else {
    problem('Falta .gitignore (riesgo de subir secretos o artefactos)');
}

const envFiles = [];
(function walk(dir) {
    fs.readdirSync(dir, { withFileTypes: true }).forEach(function (e) {
        if (e.name === '.git' || e.name === 'node_modules') return;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full);
        else if (/^\.env(\..+)?$/i.test(e.name)) envFiles.push(path.relative(ROOT, full));
    });
})(ROOT);

envFiles.forEach(function (f) { problem('Archivo de entorno presente en el repositorio: ' + f); });

/* --------------------------------------------------------- 11. sintaxis de JS */
const { execFileSync } = require('child_process');
['js/main.js', 'js/data.js', 'js/theme-init.js', 'scripts/validate.js'].forEach(function (f) {
    if (!exists(f)) return;
    try {
        execFileSync(process.execPath, ['--check', path.join(ROOT, f)], { stdio: 'pipe' });
    } catch (e) {
        problem(f + ': error de sintaxis -> ' + String(e.stderr || e.message).split('\n')[0]);
    }
});

/* -------------------------------------------------------------- 12. robots.txt */
if (exists('robots.txt')) {
    const r = read('robots.txt');
    if (/^\s*Disallow:\s*\/\s*$/mi.test(r)) warn('robots.txt: bloquea todo el sitio (Disallow: /)');
}

/* ------------------------------------------------------------------ reporte ---- */
if (warnings.length) {
    console.log('Avisos (' + warnings.length + '):');
    warnings.forEach(function (w) { console.log('  ! ' + w); });
    console.log('');
}

if (problems.length) {
    console.error('Problemas (' + problems.length + '):');
    problems.forEach(function (p) { console.error('  x ' + p); });
    console.error('\nValidacion: FALLIDA');
    process.exit(1);
}

console.log('Validacion: OK — 0 problemas, ' + warnings.length + ' aviso(s).');
