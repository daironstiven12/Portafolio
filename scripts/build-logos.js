#!/usr/bin/env node
/* ==========================================================================
   scripts/build-logos.js — genera assets/logos/*.svg
   --------------------------------------------------------------------------
   Descarga los logos oficiales de fuentes reconocidas y los deja en el
   repositorio para que el sitio NO dependa de ningún CDN ni de internet
   en tiempo de ejecución.

   Fuentes:
     · Simple Icons  -> https://simpleicons.org  (marcas, SVG monocromos)
     · Devicon       -> https://devicon.dev      (marcas sin versión en SI)
     · OpenCode      -> https://opencode.ai      (favicon SVG oficial)

   Uso:  node scripts/build-logos.js
   La caché local (scripts/logos-cache.json) permite regenerar sin red.
   ========================================================================== */
'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'assets', 'logos');
const CACHE = path.join(__dirname, 'logos-cache.json');

const SI = 'https://cdn.jsdelivr.net/npm/simple-icons@15/icons/';
const DV = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/';

/** slug final -> url de origen (sin extensión .svg) */
const SOURCES = {
    // --- IA ---
    opencode: 'https://opencode.ai/favicon',
    openai: SI + 'openai',
    googlegemini: SI + 'googlegemini',
    openrouter: SI + 'openrouter',
    // --- desarrollo ---
    vscode: DV + 'vscode/vscode-plain',
    powershell: DV + 'powershell/powershell-plain',
    git: SI + 'git',
    github: SI + 'github',
    docker: SI + 'docker',
    // --- frontend ---
    html5: SI + 'html5',
    css: SI + 'css',
    javascript: SI + 'javascript',
    typescript: SI + 'typescript',
    react: SI + 'react',
    angular: SI + 'angular',
    vite: SI + 'vite',
    tailwindcss: SI + 'tailwindcss',
    bootstrap: SI + 'bootstrap',
    expo: SI + 'expo',
    // --- backend y datos ---
    python: SI + 'python',
    fastapi: SI + 'fastapi',
    nodedotjs: SI + 'nodedotjs',
    nestjs: SI + 'nestjs',
    postgresql: SI + 'postgresql',
    prisma: SI + 'prisma',
    // --- despliegue ---
    vercel: SI + 'vercel',
    netlify: SI + 'netlify'
};

function get(url) {
    return new Promise(function (resolve, reject) {
        const mod = url.startsWith('https:') ? https : require('http');
        const req = mod.get(url, { headers: { 'User-Agent': 'portfolio-build' } }, function (res) {
            if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
                res.resume();
                return resolve(get(res.headers.location));
            }
            if (res.statusCode !== 200) {
                res.resume();
                return reject(new Error(res.statusCode + ' ' + url));
            }
            let data = '';
            res.setEncoding('utf8');
            res.on('data', function (c) { data += c; });
            res.on('end', function () { resolve(data); });
        });
        req.on('error', reject);
        req.setTimeout(30000, function () { req.destroy(new Error('timeout ' + url)); });
    });
}

/** Normaliza un SVG para uso como máscara monocroma. */
function normalize(svg, key) {
    // 1) Se usa el primer <svg> que tenga viewBox: algunos favicons envuelven
    //    el gráfico real en un <svg> exterior sin viewBox (solo width/height).
    const openTags = svg.match(/<svg[^>]*>/gi) || [];
    let openTag = null;
    let vb = null;
    for (const t of openTags) {
        const v = (t.match(/viewBox\s*=\s*"([^"]+)"/i) || [])[1];
        if (v) { openTag = t; vb = v; break; }
    }
    if (!openTag) throw new Error(key + ': sin elemento <svg con viewBox>');

    let inner = svg.slice(svg.indexOf(openTag) + openTag.length);
    inner = inner.slice(0, inner.indexOf('</svg>') >= 0 ? inner.indexOf('</svg>') : inner.length);

    // fuera metadatos, estilos y scripts
    inner = inner.replace(/<title[\s\S]*?<\/title>/gi, '');
    inner = inner.replace(/<desc[\s\S]*?<\/desc>/gi, '');
    inner = inner.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
    inner = inner.replace(/<script[\s\S]*?<\/script>/gi, '');
    inner = inner.replace(/<style[\s\S]*?<\/style>/gi, '');
    inner = inner.replace(/\sclass="[^"]*"/g, '');

    // 2) Rectángulo de fondo a sangre: como máscara convertiría el logo en
    //    un cuadrado macizo. Se elimina si cubre exactamente el viewBox.
    const vbParts = vb.split(/[\s,]+/).map(Number);
    const vbW = vbParts[2];
    const vbH = vbParts[3];
    inner = inner.replace(/<rect\b[^>]*\/?>(?:<\/rect>)?/gi, function (tag) {
        const w = Number((tag.match(/\bwidth="([^"]+)"/i) || [])[1]);
        const h = Number((tag.match(/\bheight="([^"]+)"/i) || [])[1]);
        const x = (tag.match(/\bx="([^"]+)"/i) || [])[1];
        const y = (tag.match(/\by="([^"]+)"/i) || [])[1];
        const full = (w === vbW && h === vbH && (x === undefined || Number(x) === 0) && (y === undefined || Number(y) === 0));
        return full ? '' : tag;
    });

    // 3) colores: para la máscara solo importa la alfa, no el color
    inner = inner.replace(/\s(?:fill|stroke)="(?!none)[^"]*"/gi, '');
    inner = inner.replace(/\s{2,}/g, ' ').trim();

    if (!inner) throw new Error(key + ': SVG vacío tras normalizar');
    if (/<script/i.test(inner)) throw new Error(key + ': SVG con <script>');
    if (/<svg/i.test(inner)) throw new Error(key + ': SVG anidado sin resolver');

    return { viewBox: vb, body: inner };
}

(async function () {
    if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

    let cache = {};
    if (fs.existsSync(CACHE)) {
        try { cache = JSON.parse(fs.readFileSync(CACHE, 'utf8')); } catch (e) { cache = {}; }
    }

    const keys = Object.keys(SOURCES);
    let ok = 0;
    const failed = [];

    for (const key of keys) {
        const base = SOURCES[key];
        const url = base + '.svg';
        let svg = cache[url];

        if (!svg) {
            try {
                svg = await get(url);
                cache[url] = svg;
            } catch (e) {
                failed.push(key + ' -> ' + e.message);
                continue;
            }
        }

        try {
            const norm = normalize(svg, key);
            const out = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' + norm.viewBox +
                '" fill="currentColor" aria-hidden="true" focusable="false">' + norm.body + '</svg>';
            fs.writeFileSync(path.join(OUT, key + '.svg'), out, 'utf8');
            ok++;
        } catch (e) {
            failed.push(e.message);
        }
    }

    fs.writeFileSync(CACHE, JSON.stringify(cache), 'utf8');

    /* js/logos.js — SVG embebidos.
       El navegador bloquea mask-image al abrir index.html con doble clic
       (file://, origen opaco) y los logos desaparecían dejando el hueco
       vacío de la tarjeta. Con el SVG dentro del DOM no hay petición. */
    const inline = {};
    for (const key of Object.keys(SOURCES)) {
        const f = path.join(OUT, key + '.svg');
        if (fs.existsSync(f)) inline[key] = fs.readFileSync(f, 'utf8').trim();
    }
    fs.writeFileSync(path.join(ROOT, 'js', 'logos.js'),
        '/* Generado por scripts/build-logos.js. SVG embebidos: no editar a mano. */\n' +
        'window.SITE_LOGOS = ' + JSON.stringify(inline) + ';\n', 'utf8');

    console.log('Logos generados: ' + ok + '/' + keys.length + ' (+ js/logos.js con ' + Object.keys(inline).length + ' embebidos)');
    if (failed.length) {
        console.error('Fallidos:');
        failed.forEach(function (f) { console.error('  x ' + f); });
        process.exitCode = 1;
    }
})();
