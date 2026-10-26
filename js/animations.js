/* ==========================================================================
   animations.js — Animaciones del portafolio con GSAP v3.15.0 (autohospedado)
   --------------------------------------------------------------------------
   Integración decidida para este proyecto estático (sin bundler):

   · Los scripts de GSAP y este archivo son locales (js/vendor/, js/), así
     que la CSP actual (script-src 'self') no necesita cambios ni 'unsafe-inline'.
   · GSAP se elige porque permite secuenciar la entrada del hero con una
     timeline, aplicar stagger moderado por grupo y revelar por scroll con
     ScrollTrigger, todo con control y limpieza. CSS se conserva para lo
     simple (hover de tarjetas, menú, botón volver arriba, transiciones de
     estado) ya que no aportaría ventaja animarlo con GSAP.
   · Se respeta prefers-reduced-motion: con movimiento reducido no se
     instala ninguna animación de entrada y todo el contenido se muestra.
   · Fallback: si GSAP no carga, todo el contenido queda visible (ver más
     abajo) para que nada quede oculto permanentemente.
   ========================================================================== */

(function () {
    'use strict';

    /* ---------------------------- Fallback sin GSAP ----------------------- */
    if (typeof window.gsap === 'undefined' || typeof window.ScrollTrigger === 'undefined') {
        var fallback = document.querySelectorAll('[data-reveal]');
        for (var f = 0; f < fallback.length; f++) {
            fallback[f].style.opacity = '1';
            fallback[f].style.transform = 'none';
            fallback[f].style.visibility = '';
        }
        return;
    }

    var gsap = window.gsap;
    var ScrollTrigger = window.ScrollTrigger;
    gsap.registerPlugin(ScrollTrigger);

    var EASE = 'power2.out';
    var DUR = 0.5;
    var START = 'top 82%';

    /* ============================== HERO ============================== */
    function heroIntro() {
        var hero = document.querySelector('.hero');
        if (!hero) return;

        var q = gsap.utils.selector(hero);

        var tl = gsap.timeline({
            defaults: { ease: EASE, duration: DUR }
        });

        tl.fromTo(q('.hero-eyebrow'), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1 })
          .fromTo(q('.hero-title'),   { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, '-=0.28')
          .fromTo(q('.hero-role'),    { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, '-=0.22')
          .fromTo(q('.hero-summary'), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, '-=0.18')
          .fromTo(q('.hero-actions .btn'), { y: 16, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.1 }, '-=0.14')
          .fromTo(q('.hero-links a'), { y: 14, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.09 }, '-=0.16')
          .fromTo(q('.hero-media'), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, '-=0.35');
    }

    /* ========================= REVELADO POR SECCIÓN ======================= */
    function revealGroup(triggerSel, targetsSel, stagger) {
        var trigger = document.querySelector(triggerSel);
        var targets = gsap.utils.toArray(targetsSel);
        if (!trigger || !targets.length) return;

        gsap.fromTo(targets, { autoAlpha: 0, y: 18 }, {
            autoAlpha: 1, y: 0,
            duration: DUR,
            ease: EASE,
            stagger: stagger || 0.1,
            scrollTrigger: {
                trigger: trigger,
                start: START,
                once: true
            }
        });
    }

    function sectionReveals() {
        revealGroup('#capacidades',   '#capacidades .area',    0.14);
        revealGroup('#trayectoria',   '#trayectoria .tl-item', 0.14);
        revealGroup('#certificados',  '#certificados .cert-card', 0.12);
        revealGroup('#herramientas',  '#herramientas .tool-cat', 0.14);
        revealGroup('#proyectos',     '#proyectos .project-card', 0.12);

        // Cabeceras de sección: aparición suave, una sola vez cada una.
        document.querySelectorAll('.section-head').forEach(function (head) {
            gsap.fromTo(head, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0,
                duration: DUR, ease: EASE,
                scrollTrigger: { trigger: head, start: START, once: true }
            });
        });

        // Contacto: dos columnas con ligero escalonamiento.
        var contact = document.querySelector('#contacto');
        if (contact) {
            gsap.fromTo(gsap.utils.toArray('#contacto .contact-info, #contacto .contact-form'),
                { autoAlpha: 0, y: 16 },
                { autoAlpha: 1, y: 0,
                    duration: DUR, ease: EASE,
                    stagger: 0.12,
                    scrollTrigger: { trigger: contact, start: START, once: true }
                });
        }

        // Pie de página: aparición sutil de sus columnas.
        var footer = document.querySelector('.site-footer');
        if (footer) {
            gsap.fromTo(gsap.utils.toArray('.footer-brand, .footer-col, .footer-bottom'),
                { autoAlpha: 0, y: 14 },
                { autoAlpha: 1, y: 0,
                    duration: DUR, ease: EASE,
                    stagger: 0.12,
                    scrollTrigger: { trigger: footer, start: 'top 88%', once: true }
                });
        }
    }

    /* ======================== PREFERENCIA DE MOVIMIENTO ==================== */
    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!reduceMotion) {
        // Movimiento normal: instalar animaciones de entrada y revelado por scroll.
        try {
            heroIntro();
            sectionReveals();
        } catch (err) {
            if (window.console && console.error) {
                console.error('[portafolio/animations] error al iniciar animaciones:', err);
            }
            // Garantizar visibilidad aunque fallen las animaciones.
            var all = document.querySelectorAll('[data-reveal]');
            for (var a = 0; a < all.length; a++) {
                all[a].style.opacity = '1';
                all[a].style.transform = 'none';
                all[a].style.visibility = '';
            }
        }

        // Refrescar ScrollTrigger cuando todos los recursos (imágenes, fuentes)
        // hayan terminado de cargar, para que las posiciones de los triggers
        // de sección sean correctas y los revelados al scroll funcionen.
        function refreshTriggers() {
            try { ScrollTrigger.refresh(); } catch (e) { /* noop */ }
        }
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(refreshTriggers);
        }
        window.addEventListener('load', refreshTriggers, { once: true });

        // Si el usuario activa movimiento reducido durante la sesión, matar
        // triggers y restaurar estilos para que todo quede visible.
        window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', function (e) {
            if (e.matches) {
                ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
                gsap.set('[data-reveal]', { clearProps: 'transform,opacity,visibility' });
                gsap.set('.hero-eyebrow, .hero-title, .hero-role, .hero-summary, .hero-actions .btn, .hero-links a, .hero-media', {
                    clearProps: 'transform,opacity,visibility'
                });
            }
        });
    }

    // Con prefers-reduced-motion: reduce no se instala ninguna animación de
    // entrada; el CSS (html.js [data-reveal] { opacity: 1 !important }) ya
    // muestra todo el contenido y no se registra ningún ScrollTrigger.
})();
