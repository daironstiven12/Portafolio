/* ==========================================================================
   tools-tabs.js — Pestañas Tecnologías / Herramientas
   --------------------------------------------------------------------------
   · Reparte los grupos de js/data.js por su campo `kind` ('tech' | 'tool')
     y mueve cada .tool-cat renderizado por main.js a su panel.
   · role="tablist" + role="tab" + role="tabpanel" con activation automática
     al recibir el foco y flechas / Home / End para moverse.
   · Píldora deslizante (mismo lenguaje visual que la barra y los filtros).
   · Si solo hay una pestaña con contenido no se muestra ningún control.
   · Al cambiar de pestaña se re-colocan los tooltips: main.js escucha el
     evento 'tools:relayout' sobre su propio contenedor.
   ========================================================================== */
(function () {
    'use strict';

    var host = document.querySelector('[data-tool-tabs]');
    var rows = document.querySelector('[data-render="tools"]');
    if (!host || !rows) return;

    var KIND_LABELS = { tech: 'Tecnologías', tool: 'Herramientas' };
    var SITE = window.SITE || {};
    var groups = Array.isArray(SITE.tools) ? SITE.tools : [];
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

    function val(v) {
        return typeof v === 'string' ? v.trim() : (v == null ? '' : String(v).trim());
    }

    function esc(v) {
        return val(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* Identificador seguro para ids de ARIA (los kinds vienen de data.js) */
    function slug(v) {
        return val(v).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '') || 'x';
    }

    /* Mismo filtro que aplica main.js al renderizar: solo grupos con ítems */
    var usable = groups.filter(function (g) {
        return g && Array.isArray(g.items) && g.items.some(function (it) {
            return it && has(it.name) && has(it.key);
        });
    });

    function has(v) { return val(v) !== ''; }

    var cats = Array.prototype.slice.call(rows.querySelectorAll('.tool-cat'));
    if (!usable.length || cats.length !== usable.length) return;

    /* --- Reparto por kind, en orden de aparición --- */
    var kinds = [];
    var panels = {};
    usable.forEach(function (g, i) {
        var kind = val(g.kind) || 'tech';
        if (!panels[kind]) {
            panels[kind] = [];
            kinds.push(kind);
        }
        panels[kind].push(cats[i]);
    });

    /* Una sola pestaña => sin controles, todo junto como hasta ahora */
    if (kinds.length < 2) {
        host.hidden = true;
        return;
    }

    /* --- Paneles --- */
    rows.innerHTML = '';
    kinds.forEach(function (kind, i) {
        var panel = document.createElement('div');
        panel.className = 'tool-panel';
        panel.id = 'tool-panel-' + slug(kind);
        panel.setAttribute('role', 'tabpanel');
        panel.setAttribute('aria-labelledby', 'tool-tab-' + slug(kind));
        panels[kind].forEach(function (cat) { panel.appendChild(cat); });
        if (i > 0) panel.hidden = true;
        rows.appendChild(panel);
    });

    /* --- Pestañas --- */
    host.innerHTML =
        '<span class="tool-tabs-pill" aria-hidden="true"></span>' +
        kinds.map(function (kind, i) {
            return '<button class="tool-tab' + (i === 0 ? ' is-active' : '') + '"' +
                ' type="button" role="tab" id="tool-tab-' + slug(kind) + '"' +
                ' aria-controls="tool-panel-' + slug(kind) + '"' +
                ' aria-selected="' + (i === 0 ? 'true' : 'false') + '"' +
                ' tabindex="' + (i === 0 ? '0' : '-1') + '"' +
                ' data-kind="' + esc(kind) + '">' +
                esc(KIND_LABELS[kind] || kind) + '</button>';
        }).join('');

    var pill = host.querySelector('.tool-tabs-pill');
    var tabs = Array.prototype.slice.call(host.querySelectorAll('.tool-tab'));
    var active = 0;

    function panelFor(kind) {
        return rows.querySelector('#tool-panel-' + slug(kind));
    }

    /* --- Píldora deslizante --- */
    function place() {
        var tab = tabs[active];
        if (!tab || !pill) return;
        var h = host.getBoundingClientRect();
        var r = tab.getBoundingClientRect();
        pill.style.width = r.width + 'px';
        pill.style.height = r.height + 'px';
        pill.style.transform = 'translate(' + (r.left - h.left) + 'px,' + (r.top - h.top) + 'px)';
        pill.classList.add('is-ready');
    }

    /* --- Selección --- */
    function select(index, moveFocus) {
        if (index < 0 || index >= tabs.length) return;
        var prev = tabs[active];
        active = index;

        tabs.forEach(function (t, i) {
            var on = i === index;
            t.classList.toggle('is-active', on);
            t.setAttribute('aria-selected', String(on));
            t.setAttribute('tabindex', on ? '0' : '-1');
            var panel = panelFor(t.getAttribute('data-kind'));
            if (panel) panel.hidden = !on;
        });

        if (prev !== tabs[index]) place();

        var panel = panelFor(tabs[index].getAttribute('data-kind'));
        if (panel && !reduce.matches && window.gsap) {
            window.gsap.fromTo(panel, { opacity: 0, y: 8 }, {
                opacity: 1, y: 0, duration: 0.3, ease: 'power2.out', overwrite: true
            });
        }

        /* main.js re-coloca los tooltips del panel recién mostrado */
        rows.dispatchEvent(new CustomEvent('tools:relayout'));

        if (moveFocus) tabs[index].focus();
    }

    tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(i, false); });
        tab.addEventListener('focus', function () { if (i !== active) select(i, false); });
    });

    host.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (active + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (active - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        select(next, true);
    });

    window.addEventListener('resize', place);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(place);
    window.addEventListener('load', place);
    place();
})();
