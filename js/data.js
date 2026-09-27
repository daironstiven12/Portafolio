/* ==========================================================================
   data.js — Contenido editable del portafolio
   --------------------------------------------------------------------------
   Todo lo que se repite en la página (enlaces, áreas, proyectos, herramientas,
   trayectoria y certificados) se declara aquí. No hace falta tocar el HTML
   ni el CSS para añadir o quitar elementos.

   REGLAS
   · Un campo vacío ("") u obligatorio ausente => simplemente no se muestra.
   · Si un array queda vacío, su sección completa se oculta y desaparece
     del menú de navegación automáticamente.
   · No rellenes datos que no estén verificados: se prefiere el hueco
     honesto antes que el contenido inventado.

    GUÍA RÁPIDA DE EDICIÓN
    · Foto de perfil ......... profile.photo   (Perfil1.jpg)
    · Enlaces sociales ....... links           (rellena url para mostrarlos)
    · Áreas ................. areas
    · Proyectos ............. projects         (demoUrl / previewUrl / image)
    · Herramientas .......... tools
    · Formación y trayectoria timeline
    · Certificados .......... certificates     (Certificado-Imag/...)
   ========================================================================== */

window.SITE = {

    /* --------------------------- Perfil / foto --------------------------- */
    profile: {
        // Ruta relativa a la fotografía profesional. Vacío = sin fotografía.
        // Si se rellena, la ficha técnica del hero se sustituye por la imagen.
        photo: 'Perfil1.jpg',
        photoAlt: 'Dairon Orejuela'
    },

    /* ------------------------------- Enlaces ----------------------------- */
    // url vacía => el enlace no se renderiza (ni en el hero ni en contacto).
    // external: true añade target="_blank" + rel="noopener noreferrer".
    links: [
        { id: 'github',   label: 'GitHub',   url: '', icon: 'ri-github-fill',    external: true },
        { id: 'linkedin', label: 'LinkedIn', url: '', icon: 'ri-linkedin-fill',  external: true },
        { id: 'email',    label: 'Email',    url: 'mailto:stiven3222177@gmail.com', icon: 'ri-mail-fill', external: false },
        { id: 'vercel',   label: 'Vercel',   url: '', icon: 'ri-flashlight-line', external: true },
        { id: 'netlify',  label: 'Netlify',  url: '', icon: 'ri-global-line',     external: true },
        { id: 'cv',       label: 'CV',       url: '', icon: 'ri-article-line',    external: true }
    ],

    /* --------------------- Áreas de especialización ---------------------- */
    // La sección "Capacidades" se genera a partir de esta lista.
    areas: [
        {
            id: 'web',
            title: 'Web Development',
            description: 'Sitios y aplicaciones web construidos desde el marcado hasta la interacción, con foco en rendimiento y adaptación a cualquier pantalla.',
            items: ['HTML5', 'CSS3', 'JavaScript', 'Bootstrap'],
            note: ''
        },
        {
            id: 'ux',
            title: 'UX/UI Design',
            description: 'Wireframes, prototipos e interfaces pensadas para la usabilidad: diseño que se explica solo y no necesita manual de instrucciones.',
            items: ['Responsive Design', 'Wireframing', 'Prototipado', 'Usabilidad'],
            note: ''
        },
        {
            id: 'net',
            title: 'Telecommunications & Networking',
            description: 'Formación universitaria en curso en Ingeniería de Telecomunicaciones e Informática, base técnica sobre la que se apoya mi trabajo en software.',
            items: [],
            note: 'En curso'
        },
        {
            id: 'learning',
            title: 'Learning in Progress',
            description: 'Ruta de aprendizaje declarada hacia el desarrollo full-stack: siguiente etapa de estudio y de construcción de proyectos.',
            items: ['React', 'Node.js', 'Bases de datos'],
            note: ''
        }
    ],

    /* ------------------------------ Proyectos ---------------------------- */
    // · demoUrl     => preview como enlace, tarjeta destacada y botón "Ver proyecto".
    // · Toda tarjeta con demoUrl abre ese despliegue al hacer clic (pestaña nueva).
    // · previewUrl  => despliegue secundario del mismo proyecto (vista previa).
    // · NO hay botón de repositorio: el código fuente no forma parte de la
    //   experiencia pública de la sección de proyectos.
    // · image vacía => se pinta una placa tipográfica (previewIcon) en vez de foto.
    // · context      => etiqueta sobre la preview (p. ej. 'Hackathon Chocó').
    // · Sin demoUrl no se pinta ningún botón ni es enlace la tarjeta.
    // · El orden de este array es el orden de la sección.
    projects: [
        {
            id: 'web-contenedor-v2',
            title: 'Web Contenedor V2',
            context: '',
            description: 'Panel web para monitorear y gestionar contenedores inteligentes con visión artificial, con un modo de demostración interactiva que simula el flujo completo de reciclaje en un campus universitario.',
            category: 'Panel de administración',
            technologies: ['React', 'Vite', 'Tailwind CSS', 'Framer Motion', 'Recharts'],
            status: 'Activo',
            image: 'assets/projects/web-contenedor-v2.jpg',
            previewIcon: '',
            demoUrl: 'https://web-contenedor-v2.vercel.app/',
            year: ''
        },
        {
            id: 'hackathon-choco',
            title: 'AtratoCentinela AI',
            context: 'Hackathon Chocó',
            description: 'Sistema de monitoreo del Río Atrato: mapa de estaciones, panel de crisis, seguimiento de nodos y agente de vigilancia ambiental.',
            category: 'Monitoreo ambiental',
            technologies: ['React', 'TypeScript', 'Vite', 'Tailwind CSS', 'Google Maps'],
            status: '',
            image: 'assets/projects/hackathon-choco.jpg',
            previewIcon: '',
            demoUrl: 'https://hackathon-choc-quibd.vercel.app/',
            year: ''
        },
        {
            id: 'dedicacion-eterna',
            title: 'Dedicación Eterna',
            context: 'Libretas artesanales',
            description: 'Sitio para libretas artesanales personalizadas: colección, galería, testimonios, boletín y contacto por WhatsApp, con modo oscuro y animaciones de entrada.',
            category: 'Desarrollo web',
            technologies: ['HTML', 'CSS', 'JavaScript', 'AOS'],
            status: '',
            image: 'assets/projects/dedicacion-eterna.jpg',
            previewIcon: '',
            demoUrl: 'https://dedicacioneterna.netlify.app/',
            year: ''
        },
        {
            id: 'english-bot',
            title: 'English Bot',
            context: 'Proyecto de enseñanza',
            description: 'Bot de Telegram que envía la palabra del día en inglés: la genera con inteligencia artificial, la explica con un ejemplo corto y la lee en voz alta.',
            category: 'Automatización',
            technologies: ['Python', 'Telegram Bot API', 'Gemini', 'gTTS'],
            status: '',
            image: '',
            previewIcon: 'ri-robot-2-line',
            demoUrl: '',
            year: ''
        },
        {
            id: 'vocales-app',
            title: 'El Mundo de las Vocales',
            context: 'Proyecto de enseñanza',
            description: 'Aplicación web infantil para aprender las vocales con audio, video introductorio, ficha por vocal y barra de progreso con puntaje.',
            category: 'Aplicación educativa',
            technologies: ['HTML', 'CSS', 'JavaScript'],
            status: '',
            image: 'assets/projects/vocales-app.jpg',
            previewIcon: '',
            demoUrl: '',
            year: ''
        },
        {
            id: 'cavaltec',
            title: 'CAVALTEC',
            context: '',
            description: 'Autodiagnóstico de cumplimiento de la Ley 1581: evalúa la protección de datos de una organización, identifica brechas y propone recomendaciones con IA para cerrarlas.',
            category: 'Cumplimiento normativo',
            technologies: [],
            status: '',
            image: 'assets/projects/cavaltec.jpg',
            previewIcon: '',
            demoUrl: 'https://cavaltec-frontend.vercel.app/',
            previewUrl: 'https://cavaltec-frontend-n9c1mn262-ds-projects-684b7b77.vercel.app/',
            year: ''
        },
        {
            id: 'viajefamilia',
            title: 'ViajeFamilia',
            context: '',
            description: 'Plataforma para crear metas de ahorro colectivas en equipo y hacer realidad el viaje en familia: metas, seguimiento en tiempo real, chat familiar e información turística.',
            category: 'Aplicación web',
            technologies: [],
            status: '',
            image: 'assets/projects/viajefamilia.jpg',
            previewIcon: '',
            demoUrl: 'https://unique-truffle-ec8dc3.netlify.app/',
            year: ''
        },
        {
            id: 'tirso-evarista',
            title: 'Tirso & Evarista',
            context: 'Boda · 13 dic 2025',
            description: 'Sitio de boda con historia, galería de recuerdos, cuenta regresiva, detalles del evento y confirmación de asistencia.',
            category: 'Sitio de evento',
            technologies: [],
            status: '',
            image: 'assets/projects/tirso-evarista.jpg',
            previewIcon: '',
            demoUrl: 'https://tiny-tarsier-76837c.netlify.app/',
            year: ''
        },
        {
            id: 'aula-digital',
            title: 'Aula Digital',
            context: '',
            description: 'Plataforma educativa con materias, lecciones interactivas, quizzes y juegos, con seguimiento del progreso de cada estudiante.',
            category: 'Plataforma educativa',
            technologies: [],
            status: '',
            image: 'assets/projects/aula-digital.jpg',
            previewIcon: '',
            demoUrl: 'https://symphonious-salamander-28bf03.netlify.app/',
            year: ''
        },
        {
            id: 'binova-ia',
            title: 'BINOVA IA',
            context: '',
            description: 'Contenedores inteligentes que clasifican residuos con visión por computadora y registran historial y trazabilidad en un ecosistema web y móvil.',
            category: 'IA e IoT',
            technologies: ['React Native', 'OpenCV', 'TensorFlow', 'AWS'],
            status: '',
            image: 'assets/projects/binova-ia.jpg',
            previewIcon: '',
            demoUrl: 'https://gorgeous-gumption-576096.netlify.app/',
            year: ''
        },
        {
            id: 'py-logica',
            title: 'Py-lógica',
            context: '',
            description: 'Plataforma educativa para aprender lógica de programación y Python: 15 módulos, 35 lecciones, quizzes y un editor de código integrado.',
            category: 'Plataforma educativa',
            technologies: ['Expo', 'React Native', 'Angular', 'FastAPI', 'Python', 'MySQL', 'Docker'],
            status: '',
            image: 'assets/projects/py-logica.jpg',
            previewIcon: '',
            demoUrl: 'https://thunderous-kitten-3bb002.netlify.app/',
            year: ''
        }
    ],

    /* ---------------------------- Herramientas --------------------------- */
    // Cada ítem: key (assets/logos/<key>.svg + clase .lg-<key>), name y desc.
    // Regla: SOLO herramientas/tecnologías con evidencia real en los proyectos
    // (repositorios propios, package.json, requirements.txt, Dockerfile,
    // eas.json, despliegues publicados). Nada por moda.
    tools: [
        {
            group: 'IA y apoyo',
            icon: 'ri-openai-fill',
            note: 'La inteligencia artificial forma parte de mi flujo de trabajo como herramienta de apoyo; el análisis, las decisiones técnicas y el desarrollo siguen bajo mi responsabilidad.',
            items: [
                {
                    key: 'opencode', name: 'OpenCode', feature: true,
                    desc: 'Herramienta principal de desarrollo asistido por IA: trabajo con código, proyectos y automatización a partir de un agente en la terminal.'
                },
                {
                    key: 'openai', name: 'OpenAI / ChatGPT',
                    desc: 'Apoyo en investigación, análisis, generación y revisión de código, documentación, resolución de problemas y aprendizaje.'
                },
                {
                    key: 'googlegemini', name: 'Gemini',
                    desc: 'Herramienta de IA de apoyo durante el desarrollo; también usada como modelo en proyectos que consumen su API.'
                },
                {
                    key: 'openrouter', name: 'OpenRouter',
                    desc: 'Acceso a distintos modelos y APIs de inteligencia artificial desde un solo punto de integración.'
                }
            ]
        },
        {
            group: 'Desarrollo',
            icon: 'ri-terminal-box-line',
            note: '',
            items: [
                { key: 'vscode', name: 'Visual Studio Code', desc: 'Editor principal para HTML, CSS, JavaScript, TypeScript y Python.' },
                { key: 'powershell', name: 'Terminal / PowerShell', desc: 'Consola diaria en Windows: scripts, git y tareas de automatización.' },
                { key: 'git', name: 'Git', desc: 'Control de versiones: ramas, commits e historial en todos los proyectos.' },
                { key: 'github', name: 'GitHub', desc: 'Repositorios, revisión de código y fuente de verdad de mis proyectos.' },
                { key: 'docker', name: 'Docker', desc: 'Contenedores y docker-compose para levantar backends con base de datos de forma reproducible.' }
            ]
        },
        {
            group: 'Frontend',
            icon: 'ri-code-s-slash-line',
            note: '',
            items: [
                { key: 'html5', name: 'HTML5', desc: 'Estructura semántica y accesible de cada interfaz.' },
                { key: 'css', name: 'CSS3', desc: 'Diseño, layout, sistema de diseño y animaciones.' },
                { key: 'javascript', name: 'JavaScript', desc: 'Lógica de interfaz, eventos y comportamiento en cliente.' },
                { key: 'typescript', name: 'TypeScript', desc: 'Tipado estático en proyectos React de mayor tamaño.' },
                { key: 'react', name: 'React', desc: 'Interfaces componentizadas; base de la mayoría de mis proyectos web.' },
                { key: 'react', name: 'React Native', desc: 'Aplicaciones móviles multiplataforma con Expo.' },
                { key: 'angular', name: 'Angular', desc: 'Paneles y administradores web con Angular + Bootstrap.' },
                { key: 'vite', name: 'Vite', desc: 'Bundler y servidor de desarrollo con recarga instantánea.' },
                { key: 'tailwindcss', name: 'Tailwind CSS', desc: 'Sistema de estilos utilitario para interfaces consistentes.' },
                { key: 'bootstrap', name: 'Bootstrap', desc: 'Grid y componentes en proyectos con Bootstrap.' },
                { key: 'expo', name: 'Expo', desc: 'Toolchain de desarrollo y build para apps móviles.' }
            ]
        },
        {
            group: 'Backend y datos',
            icon: 'ri-stack-fill',
            note: '',
            items: [
                { key: 'python', name: 'Python', desc: 'Backend, scripts, bots y automatización.' },
                { key: 'fastapi', name: 'FastAPI', desc: 'APIs REST en Python con SQLAlchemy.' },
                { key: 'nodedotjs', name: 'Node.js', desc: 'Backend y herramientas en el ecosistema JavaScript.' },
                { key: 'nestjs', name: 'NestJS', desc: 'APIs estructuradas con módulos, guards, JWT y WebSockets.' },
                { key: 'postgresql', name: 'PostgreSQL', desc: 'Base de datos principal en los backends con psycopg2/SQLAlchemy.' },
                { key: 'prisma', name: 'Prisma', desc: 'ORM con esquema tipado y migraciones.' }
            ]
        },
        {
            group: 'Despliegue',
            icon: 'ri-global-line',
            note: 'No solo desarrollo aplicaciones: también trabajo los procesos de despliegue y publicación, desde el build hasta el dominio en producción.',
            items: [
                { key: 'vercel', name: 'Vercel', desc: 'Despliegue continuo de frontends con dominio propio.' },
                { key: 'netlify', name: 'Netlify', desc: 'Publicación de sitios estáticos con despliegue automático.' },
                { key: 'github', name: 'GitHub Pages', desc: 'Publicación directa desde el repositorio.' },
                { key: 'expo', name: 'Expo / EAS', desc: 'Compilación y distribución de apps móviles con EAS Build.' }
            ]
        }
    ],

    /* -------------------- Trayectoria: formación y más -------------------- */
    // type admite: 'formacion' | 'proyecto' | 'hackathon' | 'investigacion'
    // period u org vacíos => no se muestran.
    // href => convierte el título en enlace (p. ej. '#proyecto-mi-app').
    timeline: [
        {
            type: 'formacion',
            title: 'Ingeniería en Telecomunicaciones e Informática',
            org: '',
            period: 'En curso',
            description: 'Formación universitaria actual que combina la base de telecomunicaciones con el desarrollo de software.',
            href: '',
            tags: []
        },
        {
            type: 'formacion',
            title: 'Tecnólogo en Desarrollo de Software',
            org: 'SENA',
            period: '2022',
            description: 'Tecnología en Desarrollo de Software.',
            href: '',
            tags: []
        },
        {
            type: 'proyecto',
            title: 'Web Contenedor V2',
            org: 'Proyecto personal',
            period: '',
            description: '',
            href: '#proyecto-web-contenedor-v2',
            tags: []
        },
        {
            type: 'hackathon',
            title: 'AtratoCentinela AI',
            org: 'Hackathon Chocó',
            period: '',
            description: '',
            href: '#proyecto-hackathon-choco',
            tags: []
        },
        {
            type: 'proyecto',
            title: 'Dedicación Eterna',
            org: 'Proyecto personal',
            period: '',
            description: '',
            href: '#proyecto-dedicacion-eterna',
            tags: []
        },
        {
            type: 'proyecto',
            title: 'El Mundo de las Vocales',
            org: 'Proyecto de enseñanza',
            period: '',
            description: '',
            href: '#proyecto-vocales-app',
            tags: []
        }
    ],

    /* ----------------------------- Certificados -------------------------- */
    // Lista vacía => la sección no se muestra ni aparece en el menú.
    // Ordenado de más reciente a más antiguo.
    // Campos reales; lo que no exista se deja vacío y no se pinta:
    //     title:       'Nombre del certificado'
    //     institution: 'Institución emisora'
    //     date:        '11 de febrero de 2026'
    //     description: 'Descripción breve y verificable (aparece en el lightbox)'
    //     image:       'Certificado-Imag/Nombre-del-archivo.png'
    //     verifyUrl:   'https://...'
    certificates: [
        {
            title: 'Bootcamp Programación Nivel Básico',
            institution: 'Ministerio TIC · IU Training',
            date: '16 de julio de 2026',
            description: 'Bootcamp de 159 horas con IU Training, la Universidad de Antioquia, la Universidad de Caldas y Ubicua Technology.',
            image: 'Certificado-Imag/Imagen-Certificado-Uno.png',
            verifyUrl: ''
        },
        {
            title: 'Hackathon — Certificado de participación',
            institution: 'IU Training · Talento Tech Región 2',
            date: '26 y 27 de junio de 2026',
            description: 'Hackathon de 24 horas en modalidad presencial en Medellín y virtual en Caldas, Antioquia, Quindío, Chocó y Risaralda.',
            image: 'Certificado-Imag/Imagen-Certificado-cinco.png',
            verifyUrl: ''
        },
        {
            title: 'Colombia 5.0 — Agentes de IA y Automatización de Procesos',
            institution: 'Ministerio TIC · Canal Trece · UDISTAJE',
            date: '13 de mayo de 2026',
            description: 'Taller de 3 horas dentro del Encuentro de Ecosistemas de Innovación Digital – Colombia 5.0.',
            image: 'Certificado-Imag/Imagen-Certificado-tres.png',
            verifyUrl: ''
        },
        {
            title: 'Exploración de IoT con Cisco Packet Tracer',
            institution: 'Cisco Networking Academy',
            date: '11 de febrero de 2026',
            description: '',
            image: 'Certificado-Imag/Imagen-Certificado-six.png',
            verifyUrl: ''
        },
        {
            title: 'Explorando redes con Cisco Packet Tracer',
            institution: 'Cisco Networking Academy',
            date: '11 de febrero de 2026',
            description: '',
            image: 'Certificado-Imag/Imagen-Certificado-sexen.png',
            verifyUrl: ''
        },
        {
            title: 'Introducción a Cisco Packet Tracer',
            institution: 'Cisco Networking Academy',
            date: '11 de febrero de 2026',
            description: '',
            image: 'Certificado-Imag/Imagen-Certificado-Octavo.png',
            verifyUrl: ''
        },
        {
            title: 'Ética Profesional',
            institution: 'COPNIA — Consejo Profesional Nacional de Ingeniería',
            date: '1 de diciembre de 2022',
            description: 'Certificación de 36 horas.',
            image: 'Certificado-Imag/Imagen-Certificado-dos.png',
            verifyUrl: ''
        }
    ]
};
