# Portafolio.Ds — Dairon Orejuela

Portafolio web estático. **HTML + CSS + JavaScript puro**, sin frameworks ni
pasos de compilación: se abre directo en el navegador o con cualquier servidor
estático (GitHub Pages, Netlify, Vercel…).

## Estructura

```
index.html          Página única: head (CSP/SEO/JSON-LD), secciones, lightbox
robots.txt          Permite indexación
css/tokens.css      Sistema de diseño: color, tipografía, espaciado, tema claro/oscuro
css/main.css        Estilos de componentes + responsive + impresión (CV A4)
js/theme-init.js    Aplica el tema antes del primer pintado (externo: la CSP lo exige)
js/data.js          ← ÚNICO archivo que necesitas editar para cambiar contenido
js/main.js          Renderizado, menú, tema, scroll-spy, reveal, formulario, lightbox
assets/favicon.svg  Favicon (monograma "D")
assets/logos/       27 SVG normalizados de la sección de herramientas
assets/projects/    Capturas reales de los proyectos (JPEG 1200×750)
Perfil1.jpg         Fotografía profesional (1280×963)
Certificado-Imag/   Escaneados de los certificados (PNG)
scripts/            validate.js (CI) + build-logos.js y logos-cache.json
.github/            CI (validate + node --check) y Dependabot (github-actions)
```

Los archivos antiguos (`Portafolio.html`, `portafolio.css`, `Variable.css`,
`portafolio.js`) fueron eliminados y sustituidos por los de arriba.

## Cómo verlo

```powershell
python -m http.server 8000
# http://localhost:8000
```

## Cómo editar el contenido

Todo lo repetible vive en **`js/data.js`**. No hace falta tocar HTML ni CSS.

| Qué | Dónde |
| --- | --- |
| Foto de perfil | `profile.photo` (ahora `Perfil1.jpg`) |
| GitHub / LinkedIn / Vercel / Netlify / CV | `links[].url` |
| Áreas de especialización | `areas` |
| Proyectos (demo, vista previa, imagen, año) | `projects` |
| Certificados | `certificates` |
| Herramientas | `tools` |
| Formación y trayectoria | `timeline` |

Reglas del archivo:

- Campo vacío `""` ⇒ simplemente no se muestra (sin placeholders falsos).
- Array vacío ⇒ la sección completa se oculta **y desaparece del menú**.
- **No rellenes datos que no estén verificados.** Se prefiere el hueco honesto
  antes que contenido inventado.

### Proyectos

Cada entrada de `projects` genera una tarjeta con preview, contexto, tecnologías
y acciones:

- `demoUrl` ⇒ la preview se convierte en enlace, aparece el botón **Ver
  proyecto** y **toda la tarjeta abre ese despliegue al hacer clic** (pestaña
  nueva); la tarjeta expone `data-demo`.
- `previewUrl` ⇒ botón secundario **Vista previa del despliegue** para un
  segundo despliegue del mismo proyecto (vista previa de Vercel de CAVALTEC).
- `image` ⇒ captura real (`assets/projects/*.jpg`, 1200×750). Si está vacía se
  dibuja una placa tipográfica con `previewIcon`.
- `context` ⇒ etiqueta sobre la preview (p. ej. *Hackathon Chocó*).
- **Sin `demoUrl` no se pinta ningún botón ni es enlace la tarjeta.** Nunca un
  botón sin destino real.
- **No hay botón de repositorio** en las tarjetas: el código fuente no forma
  parte de la experiencia pública de la sección de proyectos. GitHub sigue
  estando, cuando toque, en `links` (contacto/perfil).

Rejilla uniforme: 2 tarjetas por fila desde 760 px y 1 por debajo. Todas las
tarjetas comparten la altura de su fila, la misma área de imagen (`aspect-ratio:
16/10` + `object-fit: cover`) y las acciones ancladas al pie del cuerpo.

| Proyecto | Despliegue |
| --- | --- |
| Web Contenedor V2 | `https://web-contenedor-v2.vercel.app/` |
| AtratoCentinela AI (Hackathon Chocó) | `https://hackathon-choc-quibd.vercel.app/` |
| Dedicación Eterna | `https://dedicacioneterna.netlify.app/` |
| English Bot | — (sin web desplegada) |
| El Mundo de las Vocales | — (sin web desplegada) |
| CAVALTEC | `https://cavaltec-frontend.vercel.app/` (+ `previewUrl`, vista previa de Vercel) |
| ViajeFamilia | `https://unique-truffle-ec8dc3.netlify.app/` |
| Tirso & Evarista | `https://tiny-tarsier-76837c.netlify.app/` |
| Aula Digital | `https://symphonious-salamander-28bf03.netlify.app/` |
| BINOVA IA | `https://gorgeous-gumption-576096.netlify.app/` |
| Py-lógica | `https://thunderous-kitten-3bb002.netlify.app/` |

### Anclas de proyecto

Si en `timeline` usas `href: '#proyecto-mi-app'`, el id del proyecto se genera
como `proyecto-` + `projects[].id`. Mantén ambos en sincronía.

## Tema claro/oscuro

`css/tokens.css` define el tema oscuro en `:root` y el claro en `.light-theme`.
La elección se guarda en `localStorage.theme` y se aplica antes del primer
pintado desde **`js/theme-init.js`**, cargado en `<head>`: no puede ser un
script en línea porque la CSP exige `script-src 'self'`.

## SEO y metadatos

Están en el `<head>` de `index.html`: `title`, `description`, `robots`,
`theme-color`, Open Graph, Twitter Card y **JSON-LD** (`Person`, solo datos
verificados en este repositorio).

## Herramientas y tecnologías

`tools` es una lista de **grupos**; cada grupo genera un bloque con título,
rejilla de tarjetas y un párrafo de nota opcional.

```js
{
    title: 'IA y apoyo',
    icon: 'ri-sparkling-2-line',          // clase remixicon del título
    items: [{ key: 'opencode', name: 'OpenCode', desc: '…', feature: true }],
    note: 'La inteligencia artificial forma parte de mi flujo…'
}
```

| Campo | Efecto |
| --- | --- |
| `key` | Busca `assets/logos/<key>.svg` y aplica la clase `.lg-<key>` |
| `name` | Texto visible de la tarjeta |
| `desc` | Tooltip/popover: **cómo lo uso yo**, no marketing |
| `feature` | Tarjeta destacada (borde azul + distintivo "Principal"). Solo OpenCode |
| `note` | Párrafo bajo el grupo (solo IA y Despliegue) |

- Los logos son **SVG monocromos** pintados con `currentColor` mediante
  `mask-image`, así que funcionan igual en tema claro y oscuro. Vienen de
  fuentes oficiales (Simple Icons, Devicon, opencode.ai) y se auto-hospedan en
  `assets/logos/` para no depender de un CDN en tiempo de ejecución.
- Comportamiento: en **desktop** el tooltip se abre al pasar el cursor o al
  enfocar la tarjeta con el teclado (`aria-describedby`); en **móvil** con un
  toque y se cierra con `Escape`, con otro toque o tocando fuera. `place()`
  mantiene el tooltip dentro del contenedor: no genera scroll horizontal.
- React Native, GitHub Pages y Expo / EAS reutilizan el logo de React, GitHub
  y Expo: **no existe un logo oficial propio** para esas tres.

Para añadir una herramienta nueva hacen falta tres cosas, y los validadores
las comprueban: `assets/logos/<key>.svg`, `.lg-<key>` en `css/main.css` y un
`desc` cierto.

## Seguridad (estático, sin backend)

Medidas aplicadas y verificables en el repositorio:

- **CSP en `<meta>`**: `default-src 'self'`, `script-src 'self'` (sin
  `unsafe-inline` ni `unsafe-eval`), `frame-src 'none'`, `object-src 'none'`,
  `base-uri 'self'`, `form-action 'self'`, `img-src 'self'`,
  `connect-src 'self'` y `upgrade-insecure-requests`.
- **SRI + `crossorigin`** en el CSS de remixicon. Google Fonts queda exento a
  propósito (varía según el `User-Agent`); la excepción está declarada en
  `scripts/validate.js`.
- **`<meta name="referrer" content="no-referrer">`**.
- Anti-arrastre de imágenes/SVG en CSS, sin recursos `http://`, sin
  dependencias de npm, sin `.env` ni claves en el árbol.
- **CI**: `.github/workflows/ci.yml` corre `node scripts/validate.js` en cada
  push/PR (archivos, CSP, SRI, referencias locales, `noopener`, secretos,
  `node --check`). Dependabot revisa el ecosistema `github-actions`.

### Límites de GitHub Pages

GitHub Pages **no permite definir cabeceras HTTP propias**, así que aquí no
existen `X-Content-Type-Options`, `Permissions-Policy`, `X-Frame-Options` ni
`frame-ancestors` (este último además no puede ir en `<meta>`). Para
habilitarlos hay que servir el sitio desde un proveedor que sí controle las
cabeceras (Cloudflare, Netlify, Vercel…) o un dominio propio. **Ninguna de
estas medidas convierte un sitio estático en "seguro al 100 %"**: solo reduce
la superficie de ataque.

## Pendiente (datos que faltan y no se inventan)

- URLs reales de GitHub, LinkedIn, Vercel/Netlify → `links[].url`.
- Web desplegada de **English Bot** y **El Mundo de las Vocales** →
  `projects[].demoUrl` (hoy no se pinta ningún botón ni es enlace la tarjeta).
- **Imagen social 1200×630** → añadir `og:image` (+ `twitter:image`) cuando exista.
- **Dominio definitivo** → añadir `<link rel="canonical">`, `og:url` y la línea `Sitemap:` en `robots.txt`.

## Validaciones ejecutadas

- `node scripts/validate.js` → **0 problemas, 0 avisos** (estructura, sin
  `http://`, sin `<script>`/`<style>`/`style=` en línea, CSP y SRI, referencias
  locales, `rel="noopener"`, ausencia de secretos y de `.env`, `node --check`).
- Analizador estático → **0 problemas** (anclas, ids, clases CSS sin estilo,
  `alt`, `rel=noopener`, un solo `h1`, sin `noindex`, sin anti-copia, y un
  aviso informativo sobre los iconos remixicon usados).
- Pruebas en tiempo de ejecución con **jsdom**: **86 comprobaciones, 0
  fallos**, incluidas las de la sección de herramientas (5 grupos, 30
  tarjetas, 30 tooltips, logo SVG en cada una, `aria-expanded` inicial,
  OpenCode destacado, monograma en cabecera y pie), las de proyectos (11
  tarjetas, ningún botón de repositorio, clic que abre el despliegue) y las de
  que **no** aparezcan tecnologías sin evidencia (Supabase, Next.js, Claude
  Code, Antigravity, Gemini CLI).
- Rejilla de proyectos medida en navegador: **2 tarjetas por fila** a 1440,
  1024 y 768 px y **1 por fila** a 390 px; todas las tarjetas con la **misma
  altura** (692 / 652 / 623 / 632 px), misma área de imagen (`aspect-ratio:
  16/10` + `object-fit: cover`), acciones ancladas al pie y
  `scrollWidth === clientWidth` en los cuatro anchos. Los **10 despliegues**
  publicados están enlazados y ninguna tarjeta enlaza a un repositorio.
- Pruebas en navegador real (Edge headless): **0 violaciones de CSP, 0 errores
  de consola, 0 peticiones fallidas**; los 30 logos de tecnologías van
  embebidos en `js/logos.js` (sin peticiones a `/assets/logos/` ni a ningún
  CDN), y clic/`Escape`/foco/tap verificados sobre los tooltips.
- Contraste: en el tema claro `--primary` es `#0a58ca` (5.8:1) en lugar de
  `#0d6efd` (4.06:1) para cumplir WCAG AA.
