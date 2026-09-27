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

    function icon(name) {
        return has(name) ? '<i class="' + esc(name) + '" aria-hidden="true"></i>' : '';
    }

    function pad2(n) { return n < 10 ? '0' + n : String(n); }

    var TYPE_LABELS = {
        formacion: 'Formación',
        proyecto: 'Proyecto',
        hackathon: 'Hackathon',
        investigacion: 'Investigación'
    };

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
        setupReveal();
        setupHeader();
        setupNav();
        setupTheme();
        setupScrollTop();
        setupForm();
        setupPrint();
        setupLightbox();
    }

    /* --- Enlaces (hero · contacto · pie) --- */
    function renderLinks() {
        var links = arr(SITE.links).filter(function (l) { return l && has(l.url); });

        qsa('[data-render="links"]').forEach(function (box) {
            var variant = box.getAttribute('data-variant') || 'hero';

            box.innerHTML = links.map(function (l) {
                var url = val(l.url);
                var label = val(l.label) || 'Enlace';
                var attrs = l.external
                    ? ' target="_blank" rel="noopener noreferrer" title="' + esc(label) + ' (se abre en una pestaña nueva)"'
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

                return '<a href="' + esc(url) + '"' + attrs +
                    ' aria-label="' + esc(label) + '">' + icon(l.icon) + '</a>';
            }).join('');
        });
    }

    /* --- Áreas de especialización --- */
    function renderAreas() {
        var box = qs('[data-render="areas"]');
        if (!box) return;

        box.innerHTML = arr(SITE.areas).map(function (a) {
            if (!a) return '';
            var chips = arr(a.items).filter(has).map(function (t) {
                return '<span class="chip">' + esc(t) + '</span>';
            }).join('');

            return '<article class="area" data-reveal>' +
                '<h3 class="area-title">' + esc(a.title) + '</h3>' +
                '<p class="area-desc">' + esc(a.description) + '</p>' +
                (chips ? '<div class="area-items">' + chips + '</div>' : '') +
                (!chips && has(a.note) ? '<p class="area-note">' + esc(a.note) + '</p>' : '') +
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

            /* --- Preview: imagen real si existe, si no placa tipográfica --- */
            var media = has(p.image)
                ? '<img src="' + esc(p.image) + '" alt="Vista previa de ' + esc(p.title) + '"' +
                  ' width="1200" height="750" loading="lazy" decoding="async">'
                : '<span class="project-plate">' +
                  '<i class="' + esc(has(p.previewIcon) ? val(p.previewIcon) : 'ri-code-box-line') +
                  '" aria-hidden="true"></i>' +
                  '<span class="project-plate-label">' + esc(p.title) + '</span>' +
                  '</span>';

            /* --- Etiqueta de contexto sobre la preview --- */
            var badge = has(p.context)
                ? '<span class="project-context">' + esc(p.context) + '</span>'
                : '';

            var preview = demo
                ? '<a class="project-media" href="' + esc(demo) + '"' +
                  ' target="_blank" rel="noopener noreferrer"' +
                  ' tabindex="-1" aria-hidden="true">' + badge + media +
                  '<span class="project-zoom"><i class="ri-fullscreen-line" aria-hidden="true"></i></span></a>'
                : '<div class="project-media">' + badge + media + '</div>';

            /* --- Línea de metadatos --- */
            var meta = '';
            if (has(p.category)) meta += '<span>' + esc(p.category) + '</span>';
            if (has(p.status)) meta += '<span class="status">' + esc(p.status) + '</span>';
            if (has(p.year)) meta += '<span>' + esc(p.year) + '</span>';

            /* --- Tecnologías confirmadas --- */
            var tech = arr(p.technologies).filter(has);

            /* --- Acciones: solo despliegues reales, nunca repositorios --- */
            var actions = '';
            if (demo) {
                actions += '<a class="btn btn-primary" href="' + esc(demo) + '"' +
                    ' target="_blank" rel="noopener noreferrer">Ver proyecto' +
                    '<i class="ri-arrow-right-line" aria-hidden="true"></i>' +
                    '<span class="sr-only"> (se abre en una pestaña nueva)</span></a>';
            }
            if (previewUrl) {
                actions += '<a class="btn btn-ghost" href="' + esc(previewUrl) + '"' +
                    ' target="_blank" rel="noopener noreferrer">Vista previa del despliegue' +
                    '<span class="sr-only"> (se abre en una pestaña nueva)</span></a>';
            }

            return '<article class="project-card"' +
                ' id="' + esc(id) + '"' +
                (demo ? ' data-demo="' + esc(demo) + '"' : '') +
                ' data-reveal>' +
                preview +
                '<div class="project-body">' +
                '<div class="project-head">' +
                '<p class="project-index" aria-hidden="true">' + pad2(i + 1) + '</p>' +
                (meta ? '<p class="project-meta">' + meta + '</p>' : '') +
                '</div>' +
                '<h3 class="project-title">' +
                (demo
                    ? '<a href="' + esc(demo) + '" target="_blank" rel="noopener noreferrer">' +
                      esc(p.title) + '<span class="sr-only"> (se abre en una pestaña nueva)</span></a>'
                    : esc(p.title)) +
                '</h3>' +
                (has(p.description) ? '<p class="project-desc">' + esc(p.description) + '</p>' : '') +
                (tech.length
                    ? '<ul class="project-tech">' + tech.map(function (t) {
                        return '<li class="chip">' + esc(t) + '</li>';
                    }).join('') + '</ul>'
                    : '') +
                (actions ? '<div class="project-actions">' + actions + '</div>' : '') +
                '</div>' +
                '</article>';
        }).join('');

        var count = qs('[data-count="projects"]');
        if (count) count.textContent = pad2(projects.length);
    }

    /* --- Clic sobre la tarjeta => abrir el despliegue en pestaña nueva.
       El enlace del título y los botones ya navegan por su cuenta; aquí solo
       se cubre el resto de la tarjeta. Sin demoUrl no hay data-demo. --- */
    function setupProjectCards() {
        var box = qs('[data-render="projects"]');
        if (!box) return;

        box.addEventListener('click', function (e) {
            if (!e.target || !e.target.closest) return;
            if (e.target.closest('a, button')) return;

            var sel = window.getSelection && window.getSelection();
            if (sel && String(sel).length) return;

            var card = e.target.closest('.project-card[data-demo]');
            if (!card) return;

            window.open(card.getAttribute('data-demo'), '_blank', 'noopener,noreferrer');
        });
    }

    /* --- Trayectoria --- */
    function renderTimeline() {
        var box = qs('[data-render="timeline"]');
        if (!box) return;

        box.innerHTML = arr(SITE.timeline).map(function (t) {
            if (!t) return '';
            var type = val(t.type) || 'proyecto';
            var label = TYPE_LABELS[type] || type;
            var title = has(t.href)
                ? '<a class="tl-title" href="' + esc(t.href) + '">' + esc(t.title) +
                  '<i class="ri-arrow-right-line" aria-hidden="true"></i></a>'
                : '<h3 class="tl-title">' + esc(t.title) + '</h3>';

            var tags = arr(t.tags).filter(has).map(function (x) {
                return '<span class="chip">' + esc(x) + '</span>';
            }).join('');

            return '<div class="tl-item" data-reveal>' +
                '<div class="tl-rail">' +
                (has(t.period) ? '<span class="tl-period">' + esc(t.period) + '</span>' : '') +
                '<span class="tl-badge tl-badge--' + esc(type) + '">' + esc(label) + '</span>' +
                '</div>' +
                '<div class="tl-body">' +
                title +
                (has(t.org) ? '<p class="tl-org">' + esc(t.org) + '</p>' : '') +
                (has(t.description) ? '<p class="tl-desc">' + esc(t.description) + '</p>' : '') +
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

        box.innerHTML = arr(SITE.tools).map(function (g) {
            if (!g) return '';
            var items = arr(g.items).filter(function (it) {
                return it && has(it.name) && has(it.key);
            });
            if (!items.length) return '';

            var label = (has(g.icon)
                ? '<i class="' + esc(g.icon) + '" aria-hidden="true"></i>'
                : '') + esc(g.group);

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
                    return '<li class="tool-card' + (it.feature ? ' tool-card--feature' : '') + '">' +
                        '<button class="tool-btn" type="button" aria-expanded="false">' +
                            logo +
                            '<span class="tool-name">' + esc(it.name) + '</span>' +
                            (it.feature
                                ? '<span class="tool-badge" aria-hidden="true">Principal</span>'
                                : '') +
                        '</button>' + tip +
                        '</li>';
                }).join('') + '</ul>' +
                (has(g.note) ? '<p class="tool-note">' + esc(g.note) + '</p>' : '') +
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
        placeAll();
    }

    /* --- Certificados --- */
    function renderCertificates() {
        var box = qs('[data-render="certificates"]');
        if (!box) return;

        box.innerHTML = arr(SITE.certificates).map(function (c, i) {
            if (!c) return '';
            var meta = '';
            if (has(c.institution)) meta += esc(c.institution);
            if (has(c.date)) meta += (meta ? ' · ' : '') + '<span class="cert-date">' + esc(c.date) + '</span>';

            return '<button class="cert-card" type="button" data-reveal data-cert="' + i + '"' +
                ' aria-label="Ampliar: ' + esc(c.title) + '">' +
                (has(c.image)
                    ? '<div class="cert-thumb"><img src="' + esc(c.image) + '" alt="' +
                      esc(c.title) + '" loading="lazy" decoding="async">' +
                      '<span class="cert-zoom" aria-hidden="true">' +
                      '<i class="ri-fullscreen-line"></i></span></div>'
                    : '') +
                '<div>' +
                '<h3 class="cert-title">' + esc(c.title) + '</h3>' +
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
            toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
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

        function sync() {
            var isLight = document.documentElement.classList.contains('light-theme');
            btn.setAttribute('aria-pressed', String(isLight));
        }

        btn.addEventListener('click', function () {
            var isLight = document.documentElement.classList.toggle('light-theme');
            btn.setAttribute('aria-pressed', String(isLight));
            try { localStorage.setItem('theme', isLight ? 'light' : 'dark'); } catch (e) { /* noop */ }
        });

        sync();
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
                val(name.value) ? '' : 'Indica tu nombre.') && ok;

            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val(email.value));
            ok = setError(email, qs('#email-error', form),
                emailOk ? '' : 'Introduce un correo válido.') && ok;

            ok = setError(message, qs('#message-error', form),
                val(message.value) ? '' : 'Escribe un mensaje.') && ok;

            if (!ok) {
                var firstInvalid = qs('[aria-invalid="true"]', form);
                if (firstInvalid) firstInvalid.focus();
                return;
            }

            if (!destination) {
                if (status) {
                    status.hidden = false;
                    status.textContent = 'No hay un correo configurado todavía en js/data.js.';
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
                status.textContent = 'Tu aplicación de correo debería haberse abierto con el mensaje listo. ' +
                    'Si no fue así, escribe directamente a ' + destination + '.';
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
                var c = arr(SITE.certificates)[Number(card.getAttribute('data-cert'))];
                if (!c) return;

                var parts = [];
                if (has(c.institution)) parts.push(c.institution);
                if (has(c.date)) parts.push(c.date);
                meta.textContent = parts.join(' · ');
                meta.hidden = !parts.length;

                title.textContent = val(c.title);
                desc.textContent = val(c.description);
                desc.hidden = !has(c.description);

                if (has(c.image)) {
                    img.src = c.image;
                    img.alt = val(c.title);
                    img.parentNode.hidden = false;
                } else {
                    img.removeAttribute('src');
                    img.alt = '';
                    img.parentNode.hidden = true;
                }

                if (has(c.verifyUrl)) {
                    verify.href = c.verifyUrl;
                    verify.hidden = false;
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

})();
