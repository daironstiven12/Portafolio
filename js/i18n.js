/* ==========================================================================
   i18n.js — Internacionalización ES/EN
   --------------------------------------------------------------------------
   Diccionario plano: clave -> { es: "...", en: "..." }.
   Uso: i18n.t('clave') devuelve el texto en el idioma actual.
   El cambio de idioma recarga la página y persiste en localStorage.
   ========================================================================== */

(function () {
    'use strict';

    var TRANSLATIONS = {
        // ===== UI general / fijos =====
        'nav.perfil': { es: 'Perfil', en: 'Profile' },
        'nav.capacidades': { es: 'Capacidades', en: 'Skills' },
        'nav.proyectos': { es: 'Proyectos', en: 'Projects' },
        'nav.trayectoria': { es: 'Trayectoria', en: 'Journey' },
        'nav.certificados': { es: 'Certificados', en: 'Certificates' },
        'nav.herramientas': { es: 'Herramientas', en: 'Tools' },
        'nav.contacto': { es: 'Contacto', en: 'Contact' },

        'hero.eyebrow': { es: 'Portafolio · Colombia', en: 'Portfolio · Colombia' },
        'hero.title': { es: 'Dairon Orejuela.', en: 'Dairon Orejuela.' },
        'hero.role': { es: 'Estudiante de Ingeniería de Telecomunicaciones e Informática', en: 'Telecommunications & Computer Engineering Student' },
        'hero.summary': { es: 'Orientado al desarrollo de software: aplicaciones web, interfaces y experiencias digitales. Construyo proyectos reales y documento lo que aprendo en el camino.', en: 'Focused on software development: web applications, interfaces and digital experiences. I build real projects and document what I learn along the way.' },
        'hero.btn.projects': { es: 'Ver proyectos', en: 'View projects' },
        'hero.btn.contact': { es: 'Contacto', en: 'Contact' },
        'hero.btn.cv': { es: 'Descargar CV', en: 'Download CV' },

        'hero.spec.card': { es: 'Ficha técnica', en: 'Technical card' },
        'hero.spec.focus': { es: 'Focus', en: 'Focus' },
        'hero.spec.focus.value': { es: 'Web · UX/UI · Software', en: 'Web · UX/UI · Software' },
        'hero.spec.location': { es: 'Ubicación', en: 'Location' },
        'hero.spec.location.value': { es: 'Colombia', en: 'Colombia' },
        'hero.spec.status': { es: 'Estado', en: 'Status' },
        'hero.spec.status.value': { es: 'Estudiante · Desarrollador en formación', en: 'Student · Developer in training' },
        'hero.spec.cta': { es: 'Ver trayectoria', en: 'View journey' },

        'section.perfil': { es: 'Perfil', en: 'Profile' },
        'section.perfil.title': { es: 'Quién está detrás del código', en: 'Who is behind the code' },
        'section.capacidades': { es: 'Capacidades', en: 'Skills' },
        'section.capacidades.title': { es: 'Áreas de especialización', en: 'Areas of expertise' },
        'section.capacidades.lede': { es: 'Agrupadas por disciplina, no por logo. Cada área resume qué sé hacer y con qué tecnología lo aplico.', en: 'Grouped by discipline, not by logo. Each area summarizes what I can do and the technology I apply it with.' },
        'section.proyectos': { es: 'Proyectos', en: 'Projects' },
        'section.proyectos.title': { es: 'Trabajo seleccionado', en: 'Selected work' },
        'section.proyectos.lede': { es: 'Proyectos reales: aplicaciones desplegadas, proyectos de hackathon, comercio web y material de enseñanza. Cada tarjeta abre su detalle; desde ahí accedes al proyecto publicado.', en: 'Real projects: deployed applications, hackathon projects, web commerce and teaching material. Each card opens its detail; from there you access the published project.' },
        'section.trayectoria': { es: 'Trayectoria', en: 'Journey' },
        'section.trayectoria.title': { es: 'Formación y experiencia', en: 'Education & experience' },
        'section.trayectoria.lede': { es: 'Academia y proyectos diferenciados por tipo. Sin experiencia laboral inventada: solo lo que está documentado.', en: 'Academia and projects differentiated by type. No made-up work experience: only what is documented.' },
        'section.certificados': { es: 'Certificados', en: 'Certificates' },
        'section.certificados.title': { es: 'Certificaciones', en: 'Certifications' },
        'section.certificados.lede': { es: 'Certificados emitidos por instituciones y programas oficiales, con su institución y fecha. Selecciona uno para verlo ampliado.', en: 'Certificates issued by official institutions and programs, with their institution and date. Select one to enlarge.' },
        'section.herramientas': { es: 'Herramientas', en: 'Tools' },
        'section.herramientas.title': { es: 'Herramientas y tecnologías', en: 'Tools & technologies' },
        'section.herramientas.lede': { es: 'Herramientas, tecnologías y plataformas con las que construyo y publico proyectos, agrupadas por función. Pasa el cursor o toca una tarjeta para ver en qué la utilizo.', en: 'Tools, technologies and platforms I build and ship projects with, grouped by function. Hover or tap a card to see how I use it.' },
        'section.contacto': { es: 'Contacto', en: 'Contact' },
        'section.contacto.title': { es: 'Hablemos del siguiente proyecto', en: "Let's talk about the next project" },
        'section.contacto.lede': { es: '¿Una colaboración, una duda o una oportunidad? Escríbeme y te respondo lo antes posible.', en: 'A collaboration, a question or an opportunity? Write to me and I will reply as soon as possible.' },

        // Perfil
        'perfil.lead': { es: 'Estudiante de Ingeniería de Telecomunicaciones e Informática, orientado al desarrollo de software, aplicaciones web, backend, bases de datos, inteligencia artificial y UX/UI.', en: 'Telecommunications & Computer Engineering student, focused on software development, web applications, backend, databases, artificial intelligence and UX/UI.' },
        'perfil.p2': { es: 'Combino la formación universitaria con la creación de interfaces y sitios web funcionales. Antes de la universidad obtuve el Tecnólogo en Desarrollo de Software (SENA, 2022), la base sobre la que sigo construyendo proyecto a proyecto.', en: 'I combine university education with the creation of functional interfaces and websites. Before university I earned the Technologist in Software Development (SENA, 2022), the foundation on which I keep building project by project.' },
        'perfil.p3': { es: 'Mi forma de trabajar es directa: entender el problema, diseñar la solución, construirla y volver a revisarla. El siguiente tramo de mi camino apunta a React, Node.js y bases de datos para completar el desarrollo full-stack.', en: 'My way of working is straightforward: understand the problem, design the solution, build it and review it again. The next stretch of my path points to React, Node.js and databases to complete full-stack development.' },
        'perfil.quote': { es: '«El aprendizaje es un viaje continuo. Cada proyecto es una oportunidad para mejorar y cada error, una lección.»', en: '«Learning is a continuous journey. Every project is an opportunity to improve and every mistake, a lesson.»' },
        'perfil.quote.author': { es: 'Dairon Orejuela', en: 'Dairon Orejuela' },

        // Capacidades (áreas)
        'area.web.title': { es: 'Web Development', en: 'Web Development' },
        'area.web.desc': { es: 'Sitios y aplicaciones web construidos desde el marcado hasta la interacción, con foco en rendimiento y adaptación a cualquier pantalla.', en: 'Websites and web applications built from markup to interaction, focused on performance and adaptation to any screen.' },
        'area.web.items': { es: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'], en: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'] },
        'area.ux.title': { es: 'UX/UI Design', en: 'UX/UI Design' },
        'area.ux.desc': { es: 'Wireframes, prototipos e interfaces pensadas para la usabilidad: diseño que se explica solo y no necesita manual de instrucciones.', en: 'Wireframes, prototypes and interfaces designed for usability: design that explains itself and needs no manual.' },
        'area.ux.items': { es: ['Responsive Design', 'Wireframing', 'Prototyping', 'Usability'], en: ['Responsive Design', 'Wireframing', 'Prototyping', 'Usability'] },
        'area.net.title': { es: 'Telecommunications & Networking', en: 'Telecommunications & Networking' },
        'area.net.desc': { es: 'Formación universitaria en curso en Ingeniería de Telecomunicaciones e Informática, base técnica sobre la que se apoya mi trabajo en software.', en: 'Ongoing university education in Telecommunications & Computer Engineering, the technical foundation supporting my software work.' },
        'area.learning.title': { es: 'Learning in Progress', en: 'Learning in Progress' },
        'area.learning.desc': { es: 'Ruta de aprendizaje declarada hacia el desarrollo full-stack: siguiente etapa de estudio y de construcción de proyectos.', en: 'Declared learning path towards full-stack development: next stage of study and project building.' },
        'area.learning.items': { es: ['React', 'Node.js', 'Bases de datos'], en: ['React', 'Node.js', 'Databases'] },
        'area.learning.note': { es: 'En curso', en: 'In progress' },

        // Proyectos: filtros, meta, botones
        'projects.filter.all': { es: 'Todos', en: 'All' },
        'projects.count.label': { es: '', en: '' }, // se usa solo el número
        'projects.note': { es: 'Solo aparecen proyectos verificados con sus tecnologías reales. Aquellos con versión desplegada abren el sitio publicado en una pestaña nueva.', en: 'Only verified projects with their real technologies appear. Those with a deployed version open the published site in a new tab.' },
        'project.badge.main': { es: 'Principal', en: 'Main' },
        'project.btn.detail': { es: 'Detalle', en: 'Detail' },
        'project.btn.demo': { es: 'Ver proyecto', en: 'View project' },
        'project.btn.preview': { es: 'Vista previa del despliegue', en: 'Deployment preview' },
        'project.media.zoom': { es: 'Ampliar', en: 'Zoom' },

        // Trayectoria
        'timeline.type.formacion': { es: 'Formación', en: 'Education' },
        'timeline.type.proyecto': { es: 'Proyecto', en: 'Project' },
        'timeline.type.hackathon': { es: 'Hackathon', en: 'Hackathon' },
        'timeline.type.investigacion': { es: 'Investigación', en: 'Research' },

        // Herramientas
        'tools.tab.tech': { es: 'Tecnologías', en: 'Technologies' },
        'tools.tab.tool': { es: 'Herramientas', en: 'Tools' },
        'tools.view.grid': { es: 'Cuadrícula', en: 'Grid' },
        'tools.view.wheel': { es: 'Ruleta', en: 'Wheel' },
        'tools.badge.main': { es: 'Principal', en: 'Main' },

        // Grupos de herramientas (group titles + notes)
        'tools.group.ai': { es: 'IA y apoyo', en: 'AI & assistance' },
        'tools.group.ai.note': { es: 'La inteligencia artificial forma parte de mi flujo de trabajo como herramienta de apoyo; el análisis, las decisiones técnicas y el desarrollo siguen bajo mi responsabilidad.', en: 'Artificial intelligence is part of my workflow as an assistance tool; analysis, technical decisions and development remain under my responsibility.' },
        'tools.group.dev': { es: 'Desarrollo', en: 'Development' },
        'tools.group.frontend': { es: 'Frontend', en: 'Frontend' },
        'tools.group.backend': { es: 'Backend y datos', en: 'Backend & data' },
        'tools.group.deploy': { es: 'Despliegue', en: 'Deployment' },
        'tools.group.deploy.note': { es: 'No solo desarrollo aplicaciones: también trabajo los procesos de despliegue y publicación, desde el build hasta el dominio en producción.', en: "I don't just develop applications: I also work on deployment and publishing processes, from build to production domain." },

        // Items de herramientas (keys coinciden con data.js)
        'tool.opencode': { es: 'OpenCode', en: 'OpenCode' },
        'tool.opencode.desc': { es: 'Herramienta principal de desarrollo asistido por IA: trabajo con código, proyectos y automatización a partir de un agente en la terminal.', en: 'Main AI-assisted development tool: work with code, projects and automation from a terminal agent.' },
        'tool.openai': { es: 'OpenAI / ChatGPT', en: 'OpenAI / ChatGPT' },
        'tool.openai.desc': { es: 'Apoyo en investigación, análisis, generación y revisión de código, documentación, resolución de problemas y aprendizaje.', en: 'Assistance in research, analysis, code generation and review, documentation, problem solving and learning.' },
        'tool.googlegemini': { es: 'Gemini', en: 'Gemini' },
        'tool.googlegemini.desc': { es: 'Herramienta de IA de apoyo durante el desarrollo; también usada como modelo en proyectos que consumen su API.', en: 'AI assistance tool during development; also used as a model in projects consuming its API.' },
        'tool.openrouter': { es: 'OpenRouter', en: 'OpenRouter' },
        'tool.openrouter.desc': { es: 'Acceso a distintos modelos y APIs de inteligencia artificial desde un solo punto de integración.', en: 'Access to different AI models and APIs from a single integration point.' },
        'tool.vscode': { es: 'Visual Studio Code', en: 'Visual Studio Code' },
        'tool.vscode.desc': { es: 'Editor principal para HTML, CSS, JavaScript, TypeScript y Python.', en: 'Main editor for HTML, CSS, JavaScript, TypeScript and Python.' },
        'tool.powershell': { es: 'Terminal / PowerShell', en: 'Terminal / PowerShell' },
        'tool.powershell.desc': { es: 'Consola diaria en Windows: scripts, git y tareas de automatización.', en: 'Daily console on Windows: scripts, git and automation tasks.' },
        'tool.git': { es: 'Git', en: 'Git' },
        'tool.git.desc': { es: 'Control de versiones: ramas, commits e historial en todos los proyectos.', en: 'Version control: branches, commits and history in all projects.' },
        'tool.github': { es: 'GitHub', en: 'GitHub' },
        'tool.github.desc': { es: 'Repositorios, revisión de código y fuente de verdad de mis proyectos.', en: 'Repositories, code review and source of truth for my projects.' },
        'tool.docker': { es: 'Docker', en: 'Docker' },
        'tool.docker.desc': { es: 'Contenedores y docker-compose para levantar backends con base de datos de forma reproducible.', en: 'Containers and docker-compose to spin up backends with databases reproducibly.' },
        'tool.html5': { es: 'HTML5', en: 'HTML5' },
        'tool.html5.desc': { es: 'Estructura semántica y accesible de cada interfaz.', en: 'Semantic and accessible structure of every interface.' },
        'tool.css': { es: 'CSS3', en: 'CSS3' },
        'tool.css.desc': { es: 'Diseño, layout, sistema de diseño y animaciones.', en: 'Design, layout, design system and animations.' },
        'tool.javascript': { es: 'JavaScript', en: 'JavaScript' },
        'tool.javascript.desc': { es: 'Lógica de interfaz, eventos y comportamiento en cliente.', en: 'Interface logic, events and client-side behavior.' },
        'tool.typescript': { es: 'TypeScript', en: 'TypeScript' },
        'tool.typescript.desc': { es: 'Tipado estático en proyectos React de mayor tamaño.', en: 'Static typing in larger React projects.' },
        'tool.react': { es: 'React', en: 'React' },
        'tool.react.desc': { es: 'Interfaces componentizadas; base de la mayoría de mis proyectos web.', en: 'Componentized interfaces; base of most of my web projects.' },
        'tool.react-native': { es: 'React Native', en: 'React Native' },
        'tool.react-native.desc': { es: 'Aplicaciones móviles multiplataforma con Expo.', en: 'Cross-platform mobile apps with Expo.' },
        'tool.angular': { es: 'Angular', en: 'Angular' },
        'tool.angular.desc': { es: 'Paneles y administradores web con Angular + Bootstrap.', en: 'Web panels and admins with Angular + Bootstrap.' },
        'tool.vite': { es: 'Vite', en: 'Vite' },
        'tool.vite.desc': { es: 'Bundler y servidor de desarrollo con recarga instantánea.', en: 'Bundler and dev server with instant reload.' },
        'tool.tailwindcss': { es: 'Tailwind CSS', en: 'Tailwind CSS' },
        'tool.tailwindcss.desc': { es: 'Sistema de estilos utilitario para interfaces consistentes.', en: 'Utility-first styling system for consistent interfaces.' },
        'tool.bootstrap': { es: 'Bootstrap', en: 'Bootstrap' },
        'tool.bootstrap.desc': { es: 'Grid y componentes en proyectos con Bootstrap.', en: 'Grid and components in Bootstrap projects.' },
        'tool.expo': { es: 'Expo', en: 'Expo' },
        'tool.expo.desc': { es: 'Toolchain de desarrollo y build para apps móviles.', en: 'Development toolchain and build for mobile apps.' },
        'tool.python': { es: 'Python', en: 'Python' },
        'tool.python.desc': { es: 'Backend, scripts, bots y automatización.', en: 'Backend, scripts, bots and automation.' },
        'tool.fastapi': { es: 'FastAPI', en: 'FastAPI' },
        'tool.fastapi.desc': { es: 'APIs REST en Python con SQLAlchemy.', en: 'REST APIs in Python with SQLAlchemy.' },
        'tool.nodedotjs': { es: 'Node.js', en: 'Node.js' },
        'tool.nodedotjs.desc': { es: 'Backend y herramientas en el ecosistema JavaScript.', en: 'Backend and tooling in the JavaScript ecosystem.' },
        'tool.nestjs': { es: 'NestJS', en: 'NestJS' },
        'tool.nestjs.desc': { es: 'APIs estructuradas con módulos, guards, JWT y WebSockets.', en: 'Structured APIs with modules, guards, JWT and WebSockets.' },
        'tool.postgresql': { es: 'PostgreSQL', en: 'PostgreSQL' },
        'tool.postgresql.desc': { es: 'Base de datos principal en los backends con psycopg2/SQLAlchemy.', en: 'Main database in backends with psycopg2/SQLAlchemy.' },
        'tool.prisma': { es: 'Prisma', en: 'Prisma' },
        'tool.prisma.desc': { es: 'ORM con esquema tipado y migraciones.', en: 'ORM with typed schema and migrations.' },
        'tool.vercel': { es: 'Vercel', en: 'Vercel' },
        'tool.vercel.desc': { es: 'Despliegue continuo de frontends con dominio propio.', en: 'Continuous frontend deployment with custom domain.' },
        'tool.netlify': { es: 'Netlify', en: 'Netlify' },
        'tool.netlify.desc': { es: 'Publicación de sitios estáticos con despliegue automático.', en: 'Static site publishing with automatic deployment.' },
        'tool.github-pages': { es: 'GitHub Pages', en: 'GitHub Pages' },
        'tool.github-pages.desc': { es: 'Publicación directa desde el repositorio.', en: 'Direct publishing from the repository.' },
        'tool.eas': { es: 'Expo / EAS', en: 'Expo / EAS' },
        'tool.eas.desc': { es: 'Compilación y distribución de apps móviles con EAS Build.', en: 'Mobile app compilation and distribution with EAS Build.' },

        // Certificados
        'cert.zoom': { es: 'Ampliar', en: 'Enlarge' },
        'cert.verify': { es: 'Verificar certificado', en: 'Verify certificate' },

        // Contacto
        'contact.lead': { es: 'El canal más directo es el correo. También encuentras el resto de perfiles cuando están publicados.', en: 'The most direct channel is email. You also find the rest of profiles when they are published.' },
        'contact.fact.location': { es: 'Ubicación', en: 'Location' },
        'contact.fact.location.value': { es: 'Colombia', en: 'Colombia' },
        'contact.fact.profile': { es: 'Perfil', en: 'Profile' },
        'contact.fact.profile.value': { es: 'Estudiante · Desarrollador en formación', en: 'Student · Developer in training' },
        'form.label.name': { es: 'Nombre', en: 'Name' },
        'form.label.email': { es: 'Correo', en: 'Email' },
        'form.label.subject': { es: 'Asunto', en: 'Subject' },
        'form.label.message': { es: 'Mensaje', en: 'Message' },
        'form.error.name': { es: 'Indica tu nombre.', en: 'Enter your name.' },
        'form.error.email': { es: 'Introduce un correo válido.', en: 'Enter a valid email.' },
        'form.error.message': { es: 'Escribe un mensaje.', en: 'Write a message.' },
        'form.btn.submit': { es: 'Preparar mensaje', en: 'Prepare message' },
        'form.hint': { es: 'Se abrirá tu aplicación de correo con el mensaje ya escrito. Nada se envía hasta que tú lo confirmes.', en: 'Your email app will open with the message ready. Nothing is sent until you confirm.' },
        'form.status.noemail': { es: 'No hay un correo configurado todavía en js/data.js.', en: 'No email configured yet in js/data.js.' },
        'form.status.sent': { es: 'Tu aplicación de correo debería haberse abierto con el mensaje listo. Si no fue así, escribe directamente a {email}.', en: 'Your email app should have opened with the message ready. If not, write directly to {email}.' },

        // Footer
        'footer.tagline': { es: 'Estudiante de Telecomunicaciones e Informática. Desarrollo web, UX/UI y software en construcción constante.', en: 'Telecommunications & Computer Engineering student. Web development, UX/UI and software under constant construction.' },
        'footer.sections': { es: 'Secciones', en: 'Sections' },
        'footer.work': { es: 'Trabajo', en: 'Work' },
        'footer.work.projects': { es: 'Proyectos publicados', en: 'Published projects' },
        'footer.work.skills': { es: 'Áreas de especialización', en: 'Areas of expertise' },
        'footer.work.journey': { es: 'Formación', en: 'Education' },
        'footer.work.cv': { es: 'Descargar CV', en: 'Download CV' },
        'footer.copyright': { es: 'Todos los derechos reservados.', en: 'All rights reserved.' },
        'footer.stack': { es: 'HTML · CSS · JavaScript — sin frameworks.', en: 'HTML · CSS · JavaScript — no frameworks.' },

        // Scroll top
        'scrolltop.label': { es: 'Volver arriba', en: 'Back to top' },

        // Skip link
        'skip.link': { es: 'Saltar al contenido', en: 'Skip to content' },

        // Lightbox / dialogs
        'dialog.close': { es: 'Cerrar', en: 'Close' },
        'dialog.close.detail': { es: 'Cerrar detalle', en: 'Close detail' },
        'dialog.demo': { es: 'Ver demo', en: 'View demo' },
        'dialog.repo': { es: 'Código', en: 'Code' },
        'dialog.preview': { es: 'Vista previa del despliegue', en: 'Deployment preview' },
        'dialog.newtab': { es: '(se abre en una pestaña nueva)', en: '(opens in a new tab)' },

        // SEO / meta
        'meta.title': { es: 'Dairon Orejuela — Portafolio de desarrollo web y software', en: 'Dairon Orejuela — Web & software development portfolio' },
        'meta.description': { es: 'Portafolio de Dairon Orejuela, estudiante de Ingeniería de Telecomunicaciones e Informática orientado al desarrollo web, UX/UI y software.', en: 'Portfolio of Dairon Orejuela, Telecommunications & Computer Engineering student focused on web development, UX/UI and software.' },
        'meta.og.title': { es: 'Dairon Orejuela — Portafolio de desarrollo web y software', en: 'Dairon Orejuela — Web & software development portfolio' },
        'meta.og.description': { es: 'Estudiante de Ingeniería de Telecomunicaciones e Informática orientado al desarrollo web, UX/UI y software. Proyectos, capacidades y contacto.', en: 'Telecommunications & Computer Engineering student focused on web development, UX/UI and software. Projects, skills and contact.' },
        'og.locale': { es: 'es_CO', en: 'en_US' },

        // Language switcher
        'lang.current': { es: 'ES', en: 'EN' },
        'lang.toggle': { es: 'Cambiar a inglés', en: 'Switch to Spanish' },
    };

    // Idioma actual (por defecto ES, o el guardado)
    function getInitialLang() {
        try {
            var saved = localStorage.getItem('lang');
            if (saved === 'es' || saved === 'en') return saved;
        } catch (e) { /* noop */ }
        // Fallback: preferencia del navegador
        var nav = (navigator.language || navigator.userLanguage || 'es').toLowerCase();
        return nav.startsWith('en') ? 'en' : 'es';
    }

    var currentLang = getInitialLang();

    function setLang(lang) {
        if (lang !== 'es' && lang !== 'en') return;
        currentLang = lang;
        try { localStorage.setItem('lang', lang); } catch (e) { /* noop */ }
        
        // Start loading animation
        showLanguageLoader();
        
        // Update all translated elements immediately
        updatePageTranslations();
        
        // Update document language
        if (typeof document !== 'undefined') {
            document.documentElement.lang = lang;
        }
        
        // Update meta tags
        updateMetaTags();
        
        // Update language toggle button text
        updateLanguageToggle();
        
        // Hide loading animation after short delay
        setTimeout(() => {
            hideLanguageLoader();
        }, 300);
    }

    function toggleLang() {
        setLang(currentLang === 'es' ? 'en' : 'es');
    }

    function t(key) {
        var entry = TRANSLATIONS[key];
        if (!entry) return key;
        return entry[currentLang] || entry.es || key;
    }
    
    function updatePageTranslations() {
        if (typeof document === 'undefined') return;
        
        // Update all elements with data-i18n attribute
        var i18nElements = document.querySelectorAll('[data-i18n]');
        i18nElements.forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            var attr = el.getAttribute('data-i18n-attr');
            
            if (attr) {
                el.setAttribute(attr, t(key));
            } else {
                el.textContent = t(key);
            }
        });
        
        // Update navigation links
        updateNavigationTranslations();
        
        // Update hero spec translations
        updateHeroSpecTranslations();
        
        // Update project filters
        updateProjectFiltersTranslations();
        
        // Update tool tabs
        updateToolTabsTranslations();
        
        // Update footer translations
        updateFooterTranslations();
        
        // Update form translations
        updateFormTranslations();
        
        // Update other dynamic elements
        updateOtherDynamicTranslations();
    }
    
    function updateNavigationTranslations() {
        var navMap = {
            '#perfil': 'nav.perfil',
            '#capacidades': 'nav.capacidades',
            '#proyectos': 'nav.proyectos',
            '#trayectoria': 'nav.trayectoria',
            '#certificados': 'nav.certificados',
            '#herramientas': 'nav.herramientas',
            '#contacto': 'nav.contacto'
        };
        
        var navLinks = document.querySelectorAll('.nav-link, .footer-nav-link');
        navLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (navMap[href]) {
                link.textContent = t(navMap[href]);
            }
        });
    }
    
    function updateHeroSpecTranslations() {
        var specHead = document.querySelector('.spec-head');
        if (specHead) {
            var focusSpan = specHead.querySelector('span:first-child');
            if (focusSpan) focusSpan.textContent = t('hero.spec.card');
            var profileSpan = specHead.querySelector('span:last-child');
            if (profileSpan) profileSpan.textContent = t('nav.perfil');
        }
        
        var specRows = document.querySelectorAll('.spec-row');
        if (specRows.length >= 3) {
            specRows[0].querySelector('dt').textContent = t('hero.spec.focus');
            specRows[0].querySelector('dd').textContent = t('hero.spec.focus.value');
            specRows[1].querySelector('dt').textContent = t('hero.spec.location');
            specRows[1].querySelector('dd').textContent = t('hero.spec.location.value');
            specRows[2].querySelector('dt').textContent = t('hero.spec.status');
            specRows[2].querySelector('dd').textContent = t('hero.spec.status.value');
        }
        
        var specCta = document.querySelector('.spec-foot');
        if (specCta) {
            var ctaText = specCta.querySelector('span');
            if (ctaText) ctaText.textContent = t('hero.spec.cta');
        }
    }
    
    function updateProjectFiltersTranslations() {
        // Project filters are generated dynamically by js/project-filters.js
        // This function would update any existing filter text
    }
    
    function updateToolTabsTranslations() {
        // Tool tabs are generated dynamically by js/tools-tabs.js
        // This function would update any existing tab text
    }
    
    function updateFooterTranslations() {
        var footerSections = document.querySelectorAll('[data-i18n="footer.sections"]');
        footerSections.forEach(function(el) {
            el.textContent = t('footer.sections');
        });
        
        var footerWork = document.querySelectorAll('[data-i18n="footer.work"]');
        footerWork.forEach(function(el) {
            el.textContent = t('footer.work');
        });
    }
    
    function updateFormTranslations() {
        var formLabels = document.querySelectorAll('[data-i18n^="form.label"]');
        formLabels.forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
        
        var formErrors = document.querySelectorAll('[data-i18n^="form.error"]');
        formErrors.forEach(function(el) {
            var key = el.getAttribute('data-i18n');
            el.textContent = t(key);
        });
    }
    
    function updateOtherDynamicTranslations() {
        // Update project count
        var count = document.querySelector('[data-count="projects"]');
        if (count && window.SITE && window.SITE.projects) {
            count.textContent = pad2(window.SITE.projects.length);
        }
        
        // Update hero spec translations
        updateHeroSpecTranslations();
    }
    
    function updateMetaTags() {
        var ogLocale = document.querySelector('meta[property="og:locale"]');
        if (ogLocale) ogLocale.setAttribute('content', t('og.locale'));

        var title = document.querySelector('title');
        if (title) title.textContent = t('meta.title');

        var desc = document.querySelector('meta[name="description"]');
        if (desc) desc.setAttribute('content', t('meta.description'));

        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', t('meta.og.title'));

        var ogDesc = document.querySelector('meta[property="og:description"]');
        if (ogDesc) ogDesc.setAttribute('content', t('meta.og.description'));
    }
    
    function updateLanguageToggle() {
        var langText = document.querySelector('.lang-text');
        if (langText) {
            langText.textContent = currentLang.toUpperCase();
        }
        
        var langToggle = document.querySelector('#lang-toggle');
        if (langToggle) {
            var opposite = currentLang === 'es' ? 'en' : 'es';
            langToggle.setAttribute('aria-label', currentLang === 'es' ? t('lang.toggle') : t('lang.toggle'));
            langToggle.setAttribute('title', currentLang === 'es' ? 'Cambiar a inglés' : 'Switch to Spanish');
        }
    }
    
    function showLanguageLoader() {
        if (typeof document === 'undefined') return;
        
        var loader = document.getElementById('lang-loader');
        if (!loader) {
            var loaderHtml = `
                <div id="lang-loader" class="lang-loader">
                    <div class="lang-loader-content">
                        <div class="lang-loader-spinner"></div>
                        <div class="lang-loader-text">Cambiando idioma...</div>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', loaderHtml);
            loader = document.getElementById('lang-loader');
        }
        
        loader.classList.add('is-active');
    }
    
    function hideLanguageLoader() {
        if (typeof document === 'undefined') return;
        
        var loader = document.getElementById('lang-loader');
        if (loader) {
            loader.classList.remove('is-active');
            
            setTimeout(() => {
                if (loader.parentNode) {
                    loader.parentNode.removeChild(loader);
                }
            }, 300);
        }
    }

    function getLang() {
        return currentLang;
    }

    function getOppositeLang() {
        return currentLang === 'es' ? 'en' : 'es';
    }

    // Exponer API global
    window.I18N = {
        t: t,
        getLang: getLang,
        setLang: setLang,
        toggleLang: toggleLang,
        getOppositeLang: getOppositeLang,
        TRANSLATIONS: TRANSLATIONS
    };

    // Solo ejecutar el código del lado del cliente
    if (typeof document !== 'undefined' && document.readyState === 'complete' || document.readyState !== 'loading') {
        // Ejecutar después de que DOM esté listo
        (function() {
            // Exponer API global
            window.I18N = {
                t: t,
                getLang: getLang,
                setLang: setLang,
                toggleLang: toggleLang,
                getOppositeLang: getOppositeLang,
                TRANSLATIONS: TRANSLATIONS,
                updatePageTranslations: updatePageTranslations,
                updateNavigationTranslations: updateNavigationTranslations,
                updateHeroSpecTranslations: updateHeroSpecTranslations,
                updateMetaTags: updateMetaTags,
                updateLanguageToggle: updateLanguageToggle,
                showLanguageLoader: showLanguageLoader,
                hideLanguageLoader: hideLanguageLoader
            };

            // Aplicar idioma al HTML
            document.documentElement.lang = currentLang;

            // Esperar a que el DOM esté completamente cargado
            if (document.readyState === 'complete') {
                updateMetaTags();
            } else {
                document.addEventListener('DOMContentLoaded', updateMetaTags);
            }
        })();
    }

    // Ejecutar al cargar (antes del render principal)
    updateMetaTags();

})();