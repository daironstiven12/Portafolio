/* ==========================================================================
   main.js — Comportamiento del portafolio
   --------------------------------------------------------------------------
   Sin dependencias. Orden de ejecución:
   1. Render del contenido declarado en js/data.js
   2. Ocultado de secciones vacías + podado del menú
   3. Interacciones (cabecera, menú, tema, reveal, formulario, lightbox)
   Si algo falla, se retarda la clase .js y la página queda completamente
   legible sin animaciones ni contenido dinámico.
   ========================================================================== */

(function () {
    'use strict';

    var root = document.documentElement;

    /* ------------------------------ utilidades --------------------------- */

    function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
    function qsa(sel, ctx) {
        return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
    }
    function val(v) { return typeof v === 'string' ? v.trim() : (v == null ? '' : String(v).trim()); }
    function arr(v) { return Array.isArray(v) ? v : []; }
    function has(v) { return val(v) !== ''; }

    function esc(v) {
        return val(v)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /* Entero positivo para atributos width/height; cualquier otra cosa => ''. */
    function num(v) {
        var n = parseInt(v, 10);
        return n > 0 ? String(n) : '';
    }

    function icon(name) {
        return has(name) ? '<i class="' + esc(name) + '" aria-hidden="true"></i>' : '';
    }

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    /* Helper de traducción (fallback a la clave si no existe). */
    function t(key) {
        if (window.I18N && typeof window.I18N.t === 'function') {
            return window.I18N.t(key);
        }
        return key;
    }

    /* Traduce una clave y, si no existe, usa el valor original de data.js. */
    function localized(key, fallback) {
        var text = t(key);
        return text === key ? val(fallback) : text;
    }

    function getLang() {
        if (window.I18N && typeof window.I18N.getLang === 'function') {
            return window.I18N.getLang();
        }
        return 'es';
    }

    var TYPE_LABELS = {};
    function typeLabel(type) {
        return t('timeline.type.' + type) || type;
    }

    var SITE = window.SITE || {};

    try {
        init();
        root.classList.add('js');
    } catch (err) {
        root.classList.remove('js');
        if (window.console && console.error) console.error('[portafolio]', err);
    }

    /* ============================== RENDER =============================== */

    function init() {
        renderLinks();
        renderAreas();
        renderProjects();
        renderTimeline();
        renderTools();
        setupTools();
        setupProjectCards();
        renderCertificates();
        renderPhoto();
        pruneEmptySections();
        stampYear();
        // El reveal de entrada ahora lo gestiona js/animations.js con GSAP.
        setupHeader();
        setupNav();
        setupTheme();
        setupScrollTop();
        setupForm();
        setupPrint();
        setupLightbox();
        setupLangToggle();
        translateStaticUI();

        // Re-pintar los bloques generados desde data.js al cambiar de idioma.
        document.addEventListener('languagechange', refreshDynamicContent);
    }

    /* --- Traducir elementos estáticos del HTML que tienen data-i18n --- */
    function translateStaticUI() {
        qsa('[data-i18n]').forEach(function (el) {
            var key = el.getAttribute('data-i18n');
            var attr = el.getAttribute('data-i18n-attr');
            if (attr) {
                el.setAttribute(attr, t(key));
            } else {
                el.textContent = t(key);
            }
        });
    }

    /* --- Enlaces (hero · contacto · pie) --- */
    function renderLinks() {
        var links = arr(SITE.links).filter(function (l) { return l && has(l.url); });

        qsa('[data-render="links"]').forEach(function (box) {
            var variant = box.getAttribute('data-variant') || 'hero';

            box.innerHTML = links.map(function (l) {
                var url = val(l.url);
                var label = val(l.label) || 'Enlace';
                var newTab = t('dialog.newtab');
                var attrs = l.external
                    ? ' target="_blank" rel="noopener noreferrer" title="' + esc(label) + ' ' + esc(newTab) + '"'
                    : '';

                if (variant === 'contact') {
                    var shown = url.replace(/^mailto:/i, '');
                    return '<a href="' + esc(url) + '"' + attrs +
                        ' aria-label="' + esc(label) + ': ' + esc(shown) + '">' +
                        icon(l.icon) +
                        '<span class="link-label">' + esc(label) + '</span>' +
                        '<span class="link-value">' + esc(shown) + '</span>' +
                        '</a>';
                }

                var reveal = variant === 'hero' ? ' data-reveal' : '';

                return '<a href="' + esc(url) + '"' + attrs + reveal +
                    ' aria-label="' + esc(label) + '">' + icon(l.icon) + '</a>';
            }).join('');
        });
    }

    /* --- Áreas de especialización --- */
    function renderAreas() {
        var box = qs('[data-render="areas"]');
        if (!box) return;

        // Mapeo de id de área -> clave base de traducción
        var areaKeyMap = {
            'web': 'area.web',
            'ux': 'area.ux',
            'net': 'area.net',
            'learning': 'area.learning'
        };

        box.innerHTML = arr(SITE.areas).map(function (a) {
            if (!a) return '';
            var baseKey = areaKeyMap[a.id] || ('area.' + a.id);

            // Traducir título y descripción si existen claves
            var title = t(baseKey + '.title');
            if (title === baseKey + '.title') title = val(a.title); // fallback al data.js

            var desc = t(baseKey + '.desc');
            if (desc === baseKey + '.desc') desc = val(a.description);

            var items = arr(a.items);
            // Traducir items si hay una clave de array
            var itemsKey = baseKey + '.items';
            if (window.I18N && window.I18N.TRANSLATIONS && window.I18N.TRANSLATIONS[itemsKey]) {
                var translatedItems = t(itemsKey);
                if (Array.isArray(translatedItems)) items = translatedItems;
            }

            var chips = items.filter(has).map(function (item) {
                return '<span class="chip">' + esc(item) + '</span>';
            }).join('');

            // Note
            var note = val(a.note);
            var noteKey = baseKey + '.note';
            if (t(noteKey) !== noteKey) note = t(noteKey);

            return '<article class="area" data-reveal>' +
                '<h3 class="area-title">' + esc(title) + '</h3>' +
                '<p class="area-desc">' + esc(desc) + '</p>' +
                (chips ? '<div class="area-items">' + chips + '</div>' : '') +
                (!chips && has(note) ? '<p class="area-note">' + esc(note) + '</p>' : '') +
                '</article>';
        }).join('');
    }

    /* --- Proyectos (tarjetas con preview) --- */
    function renderProjects() {
        var box = qs('[data-render="projects"]');
        if (!box) return;

        var projects = arr(SITE.projects).filter(function (p) { return p && has(p.title); });

        box.innerHTML = projects.map(function (p, i) {
            var id = has(p.id) ? 'proyecto-' + val(p.id) : 'proyecto-' + i;
            var demo = has(p.demoUrl) ? val(p.demoUrl) : '';
            var previewUrl = has(p.previewUrl) ? val(p.previewUrl) : '';
            var baseKey = 'project.' + (has(p.id) ? val(p.id) : i);
            var title = localized(baseKey + '.title', p.title);
            var description = localized(baseKey + '.desc', p.description);
            var category = localized(baseKey + '.category', p.category);
            var status = localized(baseKey + '.status', p.status);
            var context = localized(baseKey + '.context', p.context);

            /* --- Preview: imagen real si existe, si no placa tipográfica --- */
            var media = has(p.image)
                ? '<img src="' + esc(p.image) + '" alt="' + esc(t('project.media.preview')) + ' ' + esc(title) + '"' +
                  ' width="1200" height="750" loading="lazy" decoding="async">'
                : '<span class="project-plate">' +
                  '<i class="' + esc(has(p.previewIcon) ? val(p.previewIcon) : 'ri-code-box-line') +
                  '" aria-hidden="true"></i>' +
                  '<span class="project-plate-label">' + esc(title) + '</span>' +
                  '</span>';

            /* --- Etiqueta de contexto sobre la preview --- */
            var badge = has(context)
                ? '<span class="project-context">' + esc(context) + '</span>'
                : '';

            var preview = demo
                ? '<a class="project-media" href="' + esc(demo) + '"' +
                  ' target="_blank" rel="noopener noreferrer" data-loader' +
                  ' tabindex="-1" aria-hidden="true">' + badge + media +
                  '<span class="project-zoom"><i class="ri-fullscreen-line" aria-hidden="true"></i></span></a>'
                : '<div class="project-media">' + badge + media + '</div>';

            /* --- Línea de metadatos --- */
            var meta = '';
            if (has(category)) meta += '<span>' + esc(category) + '</span>';
            if (has(status)) meta += '<span class="status">' + esc(status) + '</span>';
            if (has(p.year)) meta += '<span>' + esc(p.year) + '</span>';

            /* --- Tecnologías confirmadas --- */
            var tech = arr(p.technologies).filter(has);

            /* --- Acciones: detalle siempre; despliegues solo si existen --- */
            var actions = '<button class="btn btn-ghost" type="button" data-project-detail>' +
                '<i class="ri-file-text-line" aria-hidden="true"></i> ' + esc(t('project.btn.detail')) + '</button>';
            if (demo) {
                actions += '<a class="btn btn-primary" href="' + esc(demo) + '"' +
                    ' target="_blank" rel="noopener noreferrer" data-loader>' + esc(t('project.btn.demo')) +
                    '<i class="ri-arrow-right-line" aria-hidden="true"></i></a>';
            }
            if (previewUrl) {
                actions += '<a class="btn btn-ghost" href="' + esc(previewUrl) + '"' +
                    ' target="_blank" rel="noopener noreferrer" data-loader>' + esc(t('project.btn.preview')) +
                    '</a>';
            }

            return '<article class="project-card"' +
                ' id="' + esc(id) + '"' +
                ' data-project="' + i + '"' +
                (demo ? ' data-demo="' + esc(demo) + '"' : '') +
                (has(p.filter) ? ' data-filter="' + esc(p.filter) + '"' : '') +
                ' data-reveal>' +
                preview +
                '<div class="project-body">' +
                '<div class="project-head">' +
                '<p class="project-index" aria-hidden="true">' + pad2(i + 1) + '</p>' +
                (meta ? '<p class="project-meta">' + meta + '</p>' : '') +
                '</div>' +
                '<h3 class="project-title">' +
                (demo
                    ? '<a href="' + esc(demo) + '" target="_blank" rel="noopener noreferrer" data-loader>' +
                      esc(title) + '</a>'
                    : esc(title)) +
                '</h3>' +
                (has(description) ? '<p class="project-desc">' + esc(description) + '</p>' : '') +
                (tech.length
                    ? '<ul class="project-tech">' + tech.map(function (x) {
                        return '<li class="chip">' + esc(x) + '</li>';
                    }).join('') + '</ul>'
                    : '') +
                (actions ? '<div class="project-actions">' + actions + '</div>' : '') +
                '</div>' +
                '</article>';
        }).join('');

        var count = qs('[data-count="projects"]');
        if (count) count.textContent = pad2(projects.length);
    }

    /* --- Clic sobre la tarjeta => abrir su detalle. El enlace del título,
       el botón «Detalle» y los botones de despliegue ya hacen lo suyo;
       aquí solo se cubre el resto de la tarjeta. El evento lo recoge
       js/project-dialog.js, que es quien gestiona el <dialog>. --- */
    function setupProjectCards() {
        var box = qs('[data-render="projects"]');
        if (!box) return;

        box.addEventListener('click', function (e) {
            if (!e.target || !e.target.closest) return;
            if (e.target.closest('a, button')) return;

            var sel = window.getSelection && window.getSelection();
            if (sel && String(sel).length) return;

            var card = e.target.closest('.project-card');
            if (!card) return;

            card.dispatchEvent(new CustomEvent('project:detail', { bubbles: true }));
        });
    }

    /* --- Trayectoria --- */
    function renderTimeline() {
        var box = qs('[data-render="timeline"]');
        if (!box) return;

        box.innerHTML = arr(SITE.timeline).map(function (tl, i) {
            if (!tl) return '';
            var type = val(tl.type) || 'proyecto';
            var label = typeLabel(type);
            var baseKey = 'timeline.' + i;
            var titleText = localized(baseKey + '.title', tl.title);
            var org = localized(baseKey + '.org', tl.org);
            var period = localized(baseKey + '.period', tl.period);
            var desc = localized(baseKey + '.desc', tl.description);

            var title = has(tl.href)
                ? '<a class="tl-title" href="' + esc(tl.href) + '">' + esc(titleText) +
                  '<i class="ri-arrow-right-line" aria-hidden="true"></i></a>'
                : '<h3 class="tl-title">' + esc(titleText) + '</h3>';

            var tags = arr(tl.tags).filter(has).map(function (x) {
                return '<span class="chip">' + esc(x) + '</span>';
            }).join('');

            return '<div class="tl-item" data-reveal>' +
                '<div class="tl-rail">' +
                (has(period) ? '<span class="tl-period">' + esc(period) + '</span>' : '') +
                '<span class="tl-badge tl-badge--' + esc(type) + '">' + esc(label) + '</span>' +
                '</div>' +
                '<div class="tl-body">' +
                title +
                (has(org) ? '<p class="tl-org">' + esc(org) + '</p>' : '') +
                (has(desc) ? '<p class="tl-desc">' + esc(desc) + '</p>' : '') +
                (tags ? '<div class="tl-tags">' + tags + '</div>' : '') +
                '</div>' +
                '</div>';
        }).join('');
    }

    /* --- Herramientas --- */
    function renderTools() {
        var box = qs('[data-render="tools"]');
        if (!box) return;

        var uid = 0;
        var LOGOS = window.SITE_LOGOS || {};

        // Mapa de group title -> clave de traducción
        var groupKeyMap = {
            'IA y apoyo': 'tools.group.ai',
            'Desarrollo': 'tools.group.dev',
            'Frontend': 'tools.group.frontend',
            'Backend y datos': 'tools.group.backend',
            'Despliegue': 'tools.group.deploy'
        };

        box.innerHTML = arr(SITE.tools).map(function (g) {
            if (!g) return '';
            var items = arr(g.items).filter(function (it) {
                return it && has(it.name) && has(it.key);
            });
            if (!items.length) return '';

            var groupKey = groupKeyMap[g.group];
            var groupTitle = groupKey ? t(groupKey) : val(g.group);
            if (groupTitle === groupKey) groupTitle = val(g.group);

            var label = (has(g.icon)
                ? '<i class="' + esc(g.icon) + '" aria-hidden="true"></i>'
                : '') + esc(groupTitle);

            // Note
            var note = val(g.note);
            if (groupKey) {
                var noteKey = groupKey + '.note';
                if (t(noteKey) !== noteKey) note = t(noteKey);
            }

            return '<section class="tool-cat" data-reveal>' +
                '<h3 class="tool-cat-head">' + label + '</h3>' +
                '<ul class="tool-grid">' + items.map(function (it) {
                    uid += 1;
                    var tipId = 'tool-tip-' + uid;
                    var tip = has(it.desc)
                        ? '<span class="tool-tip" role="tooltip" id="' + tipId + '">' +
                            esc(it.desc) + '</span>'
                        : '';
                    /* SVG embebido: sin logo fiable no se pinta el hueco,
                       mejor la tarjeta sin icono que un cuadro vacío. */
                    var svg = LOGOS[it.key];
                    var logo = (typeof svg === 'string' && svg.indexOf('<svg') === 0)
                        ? '<span class="tool-logo lg-' + esc(it.key) + '" aria-hidden="true">' +
                            svg + '</span>'
                        : '';

                    // Traducir nombre y desc
                    var nameKey = 'tool.' + it.key;
                    var descKey = 'tool.' + it.key + '.desc';
                    var name = t(nameKey);
                    if (name === nameKey) name = val(it.name);
                    var desc = t(descKey);
                    if (desc === descKey) desc = val(it.desc);

                    // Actualizar tip con desc traducido
                    if (has(desc)) {
                        tip = '<span class="tool-tip" role="tooltip" id="' + tipId + '">' +
                            esc(desc) + '</span>';
                    }

                    return '<li class="tool-card' + (it.feature ? ' tool-card--feature' : '') + '">' +
                        '<button class="tool-btn" type="button" aria-expanded="false">' +
                            logo +
                            '<span class="tool-name">' + esc(name) + '</span>' +
                            (it.feature
                                ? '<span class="tool-badge" aria-hidden="true">' + esc(t('tools.badge.main')) + '</span>'
                                : '') +
                        '</button>' + tip +
                        '</li>';
                }).join('') + '</ul>' +
                (has(note) ? '<p class="tool-note">' + esc(note) + '</p>' : '') +
                '</section>';
        }).join('');
    }

    /* --- Herramientas: tooltip en desktop, tap y teclado en móvil --- */
    function setupTools() {
        var box = qs('[data-render="tools"]');
        if (!box) return;

        function closeAll(keep) {
            qsa('.tool-card.is-open', box).forEach(function (card) {
                if (card === keep) return;
                card.classList.remove('is-open');
                var b = qs('.tool-btn', card);
                if (b) b.setAttribute('aria-expanded', 'false');
            });
        }

        function place(card) {
            var tip = qs('.tool-tip', card);
            if (!tip) return;

            var host = card.closest('.container') || document.documentElement;
            var cr = card.getBoundingClientRect();
            var hr = host.getBoundingClientRect();
            var half = tip.offsetWidth / 2;
            var center = cr.left + cr.width / 2;
            var min = hr.left + half + 4;
            var max = hr.right - half - 4;
            if (max < min) { max = min; }
            tip.style.left = (Math.min(Math.max(center, min), max) - cr.left) + 'px';

            card.classList.toggle('is-up',
                (cr.bottom + 14 + tip.offsetHeight) > window.innerHeight);
        }

        /* Coloca todos los tooltips al cargar y al redimensionar: así los que
           están ocultos no ensanchan la página (evita scroll horizontal). */
        function placeAll() {
            qsa('.tool-card', box).forEach(place);
        }

        box.addEventListener('click', function (e) {
            var btn = e.target.closest && e.target.closest('.tool-btn');
            if (!btn) return;
            var card = btn.closest('.tool-card');
            var open = card.classList.toggle('is-open');
            closeAll(card);
            btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            if (open) place(card);
        });

        box.addEventListener('focusin', function (e) {
            var btn = e.target.closest && e.target.closest('.tool-btn');
            if (!btn) return;
            var card = btn.closest('.tool-card');
            var tip = qs('.tool-tip', card);
            if (tip) btn.setAttribute('aria-describedby', tip.id);
            place(card);
        });

        box.addEventListener('focusout', function (e) {
            var btn = e.target.closest && e.target.closest('.tool-btn');
            if (btn) btn.removeAttribute('aria-describedby');
        });

        box.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closeAll(null);
        });

        document.addEventListener('click', function (e) {
            if (!e.target.closest || !e.target.closest('[data-render="tools"]')) closeAll(null);
        });

        box.addEventListener('pointerover', function (e) {
            var card = e.target.closest && e.target.closest('.tool-card');
            if (card) place(card);
        });

        window.addEventListener('resize', placeAll);
        /* js/tools-tabs.js lo despacha al mostrar un panel: los tooltips del
           panel recién visible se colocan con su medida real. */
        box.addEventListener('tools:relayout', placeAll);
        placeAll();
    }

    /* --- Certificados --- */
    function renderCertificates() {
        var box = qs('[data-render="certificates"]');
        if (!box) return;

        box.innerHTML = arr(SITE.certificates).map(function (c, i) {
            if (!c) return '';
            var baseKey = 'cert.' + i;
            var certTitle = localized(baseKey + '.title', c.title);
            var institution = localized(baseKey + '.institution', c.institution);
            var date = localized(baseKey + '.date', c.date);
            var meta = '';
            if (has(institution)) meta += esc(institution);
            if (has(date)) meta += (meta ? ' · ' : '') + '<span class="cert-date">' + esc(date) + '</span>';

            return '<button class="cert-card" type="button" data-reveal data-cert="' + i + '"' +
                ' aria-label="' + esc(t('cert.zoom')) + ': ' + esc(certTitle) + '">' +
                (has(c.image)
                    ? '<div class="cert-thumb"><img src="' + esc(c.image) + '" alt="' +
                      esc(certTitle) + '"' +
                      (has(c.imageWidth) ? ' width="' + num(c.imageWidth) + '"' : '') +
                      (has(c.imageHeight) ? ' height="' + num(c.imageHeight) + '"' : '') +
                      ' loading="lazy" decoding="async">' +
                      '<span class="cert-zoom" aria-hidden="true">' +
                      '<i class="ri-fullscreen-line"></i></span></div>'
                    : '') +
                '<div>' +
                '<h3 class="cert-title">' + esc(certTitle) + '</h3>' +
                (meta ? '<p class="cert-inst">' + meta + '</p>' : '') +
                '</div>' +
                '</button>';
        }).join('');
    }

    /* --- Fotografía de perfil (slot opcional) --- */
    function renderPhoto() {
        var photo = qs('[data-photo]');
        var spec = qs('[data-spec]');
        if (!photo || !SITE.profile || !has(SITE.profile.photo)) return;

        photo.innerHTML = '<img src="' + esc(SITE.profile.photo) + '" alt="' +
            esc(SITE.profile.photoAlt || SITE.profile.name || 'Dairon Orejuela') +
            '" width="1280" height="963" fetchpriority="high">';
        photo.hidden = false;
        if (spec) spec.hidden = true;
    }

    /* --- Secciones opcionales vacías + podado del menú --- */
    function pruneEmptySections() {
        qsa('[data-optional]').forEach(function (section) {
            var key = section.getAttribute('data-optional');
            var list = arr(SITE[key]);
            section.hidden = !list.length;
        });

        qsa('.nav-link, .footer-nav-link').forEach(function (link) {
            var href = val(link.getAttribute('href'));
            if (!href || href.charAt(0) !== '#') return;
            var target = qs(href);
            var item = link.closest('li');
            if (!target || target.hidden) {
                if (item && item.parentNode) item.parentNode.removeChild(item);
            }
        });
    }

    function stampYear() {
        var year = String(new Date().getFullYear());
        qsa('[data-year]').forEach(function (el) { el.textContent = year; });
    }

    function updateOtherTranslations() {
        // Update project counts
        var count = qs('[data-count="projects"]');
        if (count && SITE.projects) {
            count.textContent = pad2(SITE.projects.length);
        }
        
        // Update hero spec translations
        updateHeroSpecTranslations();
    }
    
    function updateHeroSpecTranslations() {
        var specHead = qs('.spec-head');
        if (specHead) {
            var focusSpan = specHead.querySelector('span:first-child');
            if (focusSpan) focusSpan.textContent = t('hero.spec.card');
            var profileSpan = specHead.querySelector('span:last-child');
            if (profileSpan) profileSpan.textContent = t('nav.perfil');
        }
        
        // Update spec rows
        var specRows = qsa('.spec-row');
        if (specRows.length >= 3) {
            specRows[0].querySelector('dt').textContent = t('hero.spec.focus');
            specRows[0].querySelector('dd').textContent = t('hero.spec.focus.value');
            specRows[1].querySelector('dt').textContent = t('hero.spec.location');
            specRows[1].querySelector('dd').textContent = t('hero.spec.location.value');
            specRows[2].querySelector('dt').textContent = t('hero.spec.status');
            specRows[2].querySelector('dd').textContent = t('hero.spec.status.value');
        }
        
        // Update hero spec CTA
        var specCta = qs('.spec-foot');
        if (specCta) {
            var ctaText = specCta.querySelector('span');
            if (ctaText) ctaText.textContent = t('hero.spec.cta');
        }
    }

    /* ============================= REVEAL ================================ */

    function setupReveal() {
        var items = qsa('[data-reveal]');
        if (!items.length) return;

        items.forEach(function (item) {
            var siblings = item.parentNode
                ? qsa('[data-reveal]', item.parentNode)
                : [];
            var idx = siblings.indexOf(item);
            item.style.setProperty('--d', Math.min(idx, 5) * 65 + 'ms');
        });

        if (!('IntersectionObserver' in window)) {
            items.forEach(function (i) { i.classList.add('is-revealed'); });
            return;
        }

        var io = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-revealed');
                    io.unobserve(entry.target);
                }
            });
        }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

        items.forEach(function (i) { io.observe(i); });
    }

    /* ============================ CABECERA =============================== */

    function setupHeader() {
        var header = qs('#site-header');
        if (!header) return;
        var ticking = false;

        function update() {
            header.classList.toggle('is-scrolled', window.scrollY > 24);
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });

        update();
    }

    /* ============================== MENÚ ================================= */

    function setupNav() {
        var toggle = qs('#nav-toggle');
        var nav = qs('#nav');
        var backdrop = qs('#nav-backdrop');
        if (!toggle || !nav) return;

        function setOpen(open) {
            toggle.setAttribute('aria-expanded', String(open));
            toggle.setAttribute('aria-label', open ? t('nav.close') : t('nav.open'));
            nav.classList.toggle('is-open', open);
            document.body.classList.toggle('nav-open', open);
            if (backdrop) backdrop.hidden = !open;
        }

        function isOpen() { return toggle.getAttribute('aria-expanded') === 'true'; }

        toggle.addEventListener('click', function () { setOpen(!isOpen()); });

        if (backdrop) {
            backdrop.addEventListener('click', function () { setOpen(false); });
        }

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && isOpen()) {
                setOpen(false);
                toggle.focus();
            }
        });

        qsa('.nav-link', nav).forEach(function (link) {
            link.addEventListener('click', function () { setOpen(false); });
        });

        window.addEventListener('resize', function () {
            if (window.innerWidth > 1080 && isOpen()) setOpen(false);
        });

        setupScrollSpy();
    }

    function setupScrollSpy() {
        var links = qsa('.nav-link');
        if (!links.length) return;

        var sections = qsa('main > section[id]').filter(function (s) { return !s.hidden; });
        if (!sections.length) return;

        var ticking = false;

        function update() {
            var offset = window.scrollY + (window.innerHeight * 0.32);
            var current = '';

            sections.forEach(function (s) {
                if (s.offsetTop <= offset) current = s.id;
            });

            links.forEach(function (l) {
                var active = val(l.getAttribute('href')) === '#' + current;
                l.classList.toggle('is-active', active);
                if (active) l.setAttribute('aria-current', 'true');
                else l.removeAttribute('aria-current');
            });

            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });

        window.addEventListener('resize', update);
        update();
    }

    /* ============================== TEMA ================================= */

    function setupTheme() {
        var btn = qs('#theme-toggle');
        if (!btn) return;
        var root = document.documentElement;
        var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
        var metas = qsa('meta[name="theme-color"]');

        function paintMeta(l) {
            metas.forEach(function (m) { m.setAttribute('content', l ? '#e6edfb' : '#0a0a0a'); });
        }
        function apply(l) {
            root.classList.toggle('light-theme', l);
            btn.setAttribute('aria-pressed', String(l));
            paintMeta(l);
        }
        function setTheme(l, fromBtn) {
            if (root.classList.contains('light-theme') === l) return;
            if (!(typeof document.startViewTransition === 'function' && !reduce.matches && fromBtn)) {
                apply(l); return;
            }
            var r = btn.getBoundingClientRect(),
                x = r.left + r.width / 2, y = r.top + r.height / 2,
                rad = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
            var vt = document.startViewTransition(function () { apply(l); });
            vt.ready.then(function () {
                root.animate(
                    { clipPath: ['circle(0px at ' + x + 'px ' + y + 'px)', 'circle(' + rad + 'px at ' + x + 'px ' + y + 'px)'] },
                    { duration: 650, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' }
                );
            }).catch(function () { /* noop */ });
        }

        btn.addEventListener('click', function () {
            var l = !root.classList.contains('light-theme');
            setTheme(l, true);
            try { localStorage.setItem('theme', l ? 'light' : 'dark'); } catch (e) { /* noop */ }
        });

        /* Sin elección guardada, sigue al tema del sistema */
        var sys = window.matchMedia('(prefers-color-scheme: light)');
        var onSys = function (e) {
            var saved = null;
            try { saved = localStorage.getItem('theme'); } catch (x) { /* noop */ }
            if (!saved) setTheme(e.matches, false);
        };
        if (sys.addEventListener) sys.addEventListener('change', onSys);

        var isLight = root.classList.contains('light-theme');
        btn.setAttribute('aria-pressed', String(isLight));
        paintMeta(isLight);
    }

    /* ========================= VOLVER ARRIBA ============================= */

    function setupScrollTop() {
        var btn = qs('#scroll-top');
        if (!btn) return;
        var ticking = false;

        function update() {
            btn.classList.toggle('is-visible', window.scrollY > 480);
            ticking = false;
        }

        window.addEventListener('scroll', function () {
            if (!ticking) {
                ticking = true;
                window.requestAnimationFrame(update);
            }
        }, { passive: true });

        btn.addEventListener('click', function () {
            var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
            var brand = qs('.brand');
            if (brand) brand.focus();
        });

        update();
    }

    /* ============================ FORMULARIO ============================= */

    function setupForm() {
        var form = qs('#contact-form');
        if (!form) return;

        var status = qs('#form-status');
        var emailEntry = arr(SITE.links).filter(function (l) {
            return l && /^mailto:/i.test(val(l.url));
        })[0];
        var destination = emailEntry ? val(emailEntry.url).replace(/^mailto:/i, '') : '';

        function setError(input, errorEl, message) {
            var invalid = Boolean(message);
            input.setAttribute('aria-invalid', String(invalid));
            if (errorEl) {
                errorEl.hidden = !invalid;
                if (message) errorEl.textContent = message;
            }
            return !invalid;
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            var name = qs('#name', form);
            var email = qs('#email', form);
            var subject = qs('#subject', form);
            var message = qs('#message', form);

            var ok = true;
            ok = setError(name, qs('#name-error', form),
                val(name.value) ? '' : t('form.error.name')) && ok;

            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val(email.value));
            ok = setError(email, qs('#email-error', form),
                emailOk ? '' : t('form.error.email')) && ok;

            ok = setError(message, qs('#message-error', form),
                val(message.value) ? '' : t('form.error.message')) && ok;

            if (!ok) {
                var firstInvalid = qs('[aria-invalid="true"]', form);
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            if (!destination) {
                if (status) {
                    status.hidden = false;
                    status.textContent = t('form.status.noemail');
                }
                return;
            }

            var body = val(message.value) +
                '\n\n— ' + val(name.value) + ' (' + val(email.value) + ')';

            var href = 'mailto:' + destination +
                '?subject=' + encodeURIComponent(val(subject.value) || 'Mensaje desde tu portafolio') +
                '&body=' + encodeURIComponent(body);

            window.location.href = href;

            if (status) {
                status.hidden = false;
                status.textContent = t('form.status.sent').replace('{email}', destination);
            }

            form.reset();
            qsa('[aria-invalid]', form).forEach(function (i) { i.setAttribute('aria-invalid', 'false'); });
        });
    }

    /* ============================== IMPRIMIR ============================= */

    function setupPrint() {
        qsa('[data-print]').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.preventDefault();
                window.print();
            });
        });
    }

    /* ============================= LIGHTBOX ============================== */

    function setupLightbox() {
        var dialog = qs('#cert-dialog');
        if (!dialog || typeof dialog.showModal !== 'function') return;

        var img = qs('#cert-dialog-img');
        var title = qs('#cert-dialog-title');
        var meta = qs('#cert-dialog-meta');
        var desc = qs('#cert-dialog-desc');
        var verify = qs('#cert-dialog-verify');

        document.addEventListener('click', function (e) {
            var card = e.target.closest ? e.target.closest('[data-cert]') : null;
            if (card) {
                var certIndex = Number(card.getAttribute('data-cert'));
                var c = arr(SITE.certificates)[certIndex];
                if (!c) return;

                var baseKey = 'cert.' + certIndex;
                var certTitle = localized(baseKey + '.title', c.title);
                var certDesc = localized(baseKey + '.desc', c.description);
                var institution = localized(baseKey + '.institution', c.institution);
                var date = localized(baseKey + '.date', c.date);

                var parts = [];
                if (has(institution)) parts.push(institution);
                if (has(date)) parts.push(date);
                meta.textContent = parts.join(' · ');
                meta.hidden = !parts.length;

                title.textContent = certTitle;
                desc.textContent = certDesc;
                desc.hidden = !has(certDesc);

                if (has(c.image)) {
                    img.src = c.image;
                    img.alt = certTitle;
                    if (has(c.imageWidth)) img.setAttribute('width', num(c.imageWidth));
                    else img.removeAttribute('width');
                    if (has(c.imageHeight)) img.setAttribute('height', num(c.imageHeight));
                    else img.removeAttribute('height');
                    img.parentNode.hidden = false;
                } else {
                    img.removeAttribute('src');
                    img.removeAttribute('width');
                    img.removeAttribute('height');
                    img.alt = '';
                    img.parentNode.hidden = true;
                }

                if (has(c.verifyUrl)) {
                    verify.href = c.verifyUrl;
                    verify.hidden = false;
                    verify.textContent = t('cert.verify');
                } else {
                    verify.removeAttribute('href');
                    verify.hidden = true;
                }

                dialog.showModal();
                return;
            }

            if (e.target.closest && e.target.closest('[data-dialog-close]')) {
                dialog.close();
            }
        });

        dialog.addEventListener('click', function (e) {
            if (e.target === dialog) dialog.close();
        });
    }

    /* ============================ IDIOMA ================================= */

    function setupLangToggle() {
        var btn = qs('#lang-toggle');
        if (!btn) return;

        var lang = getLang();
        var textSpan = qs('.lang-text', btn);
        if (textSpan) textSpan.textContent = lang.toUpperCase();

        btn.setAttribute('aria-label', t('lang.toggle'));
        btn.setAttribute('title', t('lang.toggle'));

        btn.addEventListener('click', function () {
            if (window.I18N && typeof window.I18N.toggleLang === 'function') {
                window.I18N.toggleLang();
            }
        });
    }

    /* Al cambiar de idioma, los bloques generados desde js/data.js deben
       volver a pintarse con las claves traducidas. Los listeners viven en
       los contenedores (no en las tarjetas), así que sobreviven al re-render. */
    function refreshDynamicContent() {
        renderLinks();
        renderAreas();
        renderProjects();
        renderTimeline();
        renderTools();
        renderCertificates();
        updateOtherTranslations();

        // Los nodos recién creados conservan [data-reveal], pero sus triggers
        // de GSAP ya no existen. Se fuerza la visibilidad (el CSS de
        // html.js [data-reveal] deja opacity:0) para no ocultar contenido.
        qsa('[data-reveal]').forEach(function (el) {
            el.style.opacity = '1';
            el.style.transform = 'none';
            el.style.visibility = '';
        });
        if (window.ScrollTrigger && typeof window.ScrollTrigger.refresh === 'function') {
            window.ScrollTrigger.refresh();
        }

        var toolsBox = qs('[data-render="tools"]');
        if (toolsBox) toolsBox.dispatchEvent(new CustomEvent('tools:relayout'));
    }

    /* ============================ NAVEGACIÓN ============================= */

    // Traducir los enlaces de navegación en el HTML
    (function translateNavLinks() {
        var navMap = {
            '#perfil': 'nav.perfil',
            '#capacidades': 'nav.capacidades',
            '#proyectos': 'nav.proyectos',
            '#trayectoria': 'nav.trayectoria',
            '#certificados': 'nav.certificados',
            '#herramientas': 'nav.herramientas',
            '#contacto': 'nav.contacto'
        };
        qsa('.nav-link, .footer-nav-link').forEach(function (link) {
            var href = val(link.getAttribute('href'));
            if (navMap[href]) {
                link.textContent = t(navMap[href]);
            }
        });
    })();

})();