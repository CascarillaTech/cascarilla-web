// Xera o dossier de colaboración dun evento concreto (Un día con IA) en tres
// linguas, reutilizando o deseño de public/dossier/dossier.{css,js}.
//
//   node tools/build-event-dossier.mjs
//
// Saída (Astro serve estes .html tal cal):
//   src/pages/dossier/one-ai-day/index.html      /dossier/one-ai-day      (gl)
//   src/pages/dossier/one-ai-day/es/index.html   /dossier/one-ai-day/es/
//   src/pages/dossier/one-ai-day/en/index.html   /dossier/one-ai-day/en/
//
// Os textos viven neste ficheiro (obxecto CONTENT). Para outro evento, copia o
// script e cambia CONTENT + SLUG.

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SLUG = 'one-ai-day';
const EMAIL = 'asociacion@cascarillatech.org';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const LANGS = {
  gl: {
    path: `/dossier/${SLUG}/`, general: '/dossier/', label: 'Galego',
    ui: {
      langNav: 'Idioma do documento', pdf: 'Descargar PDF', navLabel: 'Índice do dossier',
      brand: 'Dossier<br>do evento', logoAlt: 'Logo de Cascarilla Tech',
      hint: 'Usa as frechas ou o índice para navegar',
      nav: ['Portada', 'O evento', 'Quen organiza', 'Que ofrecemos', 'Como achegar', 'Contacto'],
    },
    title: 'Un día con IA — Dossier de colaboración',
    description: 'Dossier para empresas que queiran colaborar en Un día con IA, a xornada tecnolóxica de Cascarilla Tech e Coruña JUG o 21 de novembro de 2026 na Cidade das TIC, A Coruña.',
    cover: {
      kicker: 'Dossier de colaboración', title: 'Un día con IA',
      subtitle: 'Xornada tecnolóxica para conectar comunidade, coñecemento e empresas de A Coruña.',
      meta: ['21 de novembro de 2026', 'Cidade das TIC, A Coruña'],
    },
    event: {
      eyebrow: 'O evento', title: 'Un día con IA',
      lead: 'Unha xornada completa, de 9:00 a 18:30, para xuntar a comunidade tecnolóxica da Coruña arredor da intelixencia artificial e do desenvolvemento de software.',
      cards: [
        ['Cando', 'Sábado, 21 de novembro de 2026', 'Horario', '9:00 – 18:30'],
        ['Onde', 'Cidade das TIC (Av. de Pedralonga, A Coruña)', 'Estado', 'Data e sede confirmadas'],
        ['Formato', 'Almorzo, keynote, charlas, comida e sobremesa de networking.', 'Público esperado', '50-75 persoas'],
        ['Organiza', 'Cascarilla Tech e Coruña JUG', 'Idioma', 'Castelán'],
      ],
      note: 'O programa de charlas vaise pechando: xa está confirmada a de Roberto Garcia Navarro («Code Is Cheap. Understanding the Business Isn’t.») e o resto de poñentes anunciaranse na páxina do evento.',
      link: 'Ver a páxina do evento', linkHref: '/events/one-ai-day',
    },
    about: {
      eyebrow: 'Quen organiza', title: 'Cascarilla Tech e Coruña JUG',
      paragraphs: [
        'Cascarilla Tech é unha asociación sen ánimo de lucro da Coruña que dá soporte xurídico e estrutural ás comunidades tecnolóxicas e organiza xornadas conxuntas coas empresas do sector. Traballamos de forma horizontal, con actividades abertas na medida do posible, e publicamos o noso material con licenzas abertas.',
        'Coruña JUG é a comunidade técnica arredor de Java e a JVM nacida na Coruña. Organiza charlas e meetups de forma recorrente e ten experiencia previa traballando con empresas colaboradoras. Un día con IA organízase xuntos.',
      ],
      more: 'Coñece a asociación no dossier xeral', moreHref: '/dossier/',
    },
    offer: {
      eyebrow: 'Que ofrecemos', title: 'O que recibe unha empresa colaboradora',
      lead: 'Non montamos categorías nin tarifas: queremos que a colaboración se note e que se agradeza en público. Isto é o que ofrecemos a quen se sume.',
      cards: [
        ['Agradecemento e mención nas charlas', 'Nomeamos e agradecemos a colaboración da empresa en voz alta durante a xornada, na apertura e no peche.'],
        ['Aparecer explicitamente como colaboradora', 'Logo e nome como entidade colaboradora na páxina do evento, no cartel, neste dossier e na comunicación de Un día con IA.'],
        ['Mención nas publicacións', 'Agradecemento nas redes sociais e na noticia do evento, tanto antes como despois da xornada.'],
        ['Roll-up na zona do evento', 'Posibilidade de colocar un roll-up da empresa nun lugar visible do espazo, o día do evento.'],
        ['Material propio para as persoas asistentes', 'Posibilidade de deixar folletos, merchandising ou un pequeno detalle na zona de acollida. Concretámolo xuntos.'],
        ['Calquera outra idea', 'Se se vos ocorre outra forma de aparecer ou de achegar valor á comunidade, sempre a podemos falar.'],
      ],
      stand: 'A priori non temos previsto stand. O evento é unha xornada de charlas, sen zona de exposición. Se a vosa empresa ten interese nun, estudámolo entre todos.',
    },
    give: {
      eyebrow: 'Como achegar', title: 'Como se pode colaborar',
      lead: 'Non fixamos importes: cada entidade achega o que considere oportuno, e calquera achega é benvida.',
      headers: ['Tipo de achega', 'Onde axuda'],
      rows: [
        ['Económica', 'Cobre os custos da xornada (xestión, material, cartelaría) e permite manter a entrada accesible.'],
        ['Comida, café ou bebida', 'Almorzo, café, xantar ou bebida para as persoas asistentes.'],
        ['Material e impresión', 'Cartelaría, acreditacións, roll-ups, papelaría ou merchandising para as persoas asistentes.'],
        ['Espazo ou equipamento', 'Xa está cuberto: Odeene encargouse da xestión do espazo.', 'Xa cuberto'],
        ['Outro tipo de colaboración', 'Estamos abertos a outras formas de colaborar que non estean nesta lista. Cóntanos a túa idea e falámolo.'],
      ],
      talks: 'As charlas do programa ofrécense de forma altruísta por parte de quen quere compartir coñecemento. Non están vinculadas a ningunha colaboración económica.',
      closing: 'Non vos prometemos miles de asistentes nin un evento de networking internacional. Ofrecémosvos entrar no xerme dunha comunidade tecnolóxica local que empeza a organizarse con vocación de crecer, e aparecer desde o primeiro día como quen o fixo posible.',
      logos: 'Grazas a quen xa colabora — e aínda queda sitio para máis.',
    },
    contact: {
      eyebrow: 'Falemos', title: 'Contacto',
      lead: 'Se queredes colaborar, propoñer unha idea ou coñecernos antes de decidir, escribídenos.',
      cta: 'Falemos',
    },
  },

  es: {
    path: `/dossier/${SLUG}/es/`, general: '/dossier/es/', label: 'Español',
    ui: {
      langNav: 'Idioma del documento', pdf: 'Descargar PDF', navLabel: 'Índice del dossier',
      brand: 'Dossier<br>del evento', logoAlt: 'Logo de Cascarilla Tech',
      hint: 'Usa las flechas o el índice para navegar',
      nav: ['Portada', 'El evento', 'Quién organiza', 'Qué ofrecemos', 'Cómo aportar', 'Contacto'],
    },
    title: 'Un día con IA — Dossier de colaboración',
    description: 'Dossier para empresas que quieran colaborar en Un día con IA, la jornada tecnológica de Cascarilla Tech y Coruña JUG el 21 de noviembre de 2026 en la Cidade das TIC, A Coruña.',
    cover: {
      kicker: 'Dossier de colaboración', title: 'Un día con IA',
      subtitle: 'Jornada tecnológica para conectar comunidad, conocimiento y empresas de A Coruña.',
      meta: ['21 de noviembre de 2026', 'Cidade das TIC, A Coruña'],
    },
    event: {
      eyebrow: 'El evento', title: 'Un día con IA',
      lead: 'Una jornada completa, de 9:00 a 18:30, para reunir a la comunidad tecnológica de A Coruña en torno a la inteligencia artificial y el desarrollo de software.',
      cards: [
        ['Cuándo', 'Sábado, 21 de noviembre de 2026', 'Horario', '9:00 – 18:30'],
        ['Dónde', 'Cidade das TIC (Av. de Pedralonga, A Coruña)', 'Estado', 'Fecha y sede confirmadas'],
        ['Formato', 'Desayuno, keynote, charlas, comida y sobremesa de networking.', 'Público esperado', '50-75 personas'],
        ['Organiza', 'Cascarilla Tech y Coruña JUG', 'Idioma', 'Castellano'],
      ],
      note: 'El programa de charlas se va cerrando: ya está confirmada la de Roberto Garcia Navarro («Code Is Cheap. Understanding the Business Isn’t.») y el resto de ponentes se anunciarán en la página del evento.',
      link: 'Ver la página del evento', linkHref: '/events/one-ai-day',
    },
    about: {
      eyebrow: 'Quién organiza', title: 'Cascarilla Tech y Coruña JUG',
      paragraphs: [
        'Cascarilla Tech es una asociación sin ánimo de lucro de A Coruña que da soporte jurídico y estructural a las comunidades tecnológicas y organiza jornadas conjuntas con las empresas del sector. Trabajamos de forma horizontal, con actividades abiertas dentro de lo posible, y publicamos nuestro material con licencias abiertas.',
        'Coruña JUG es la comunidad técnica en torno a Java y la JVM nacida en A Coruña. Organiza charlas y meetups de forma recurrente y tiene experiencia previa trabajando con empresas colaboradoras. Un día con IA se organiza en conjunto.',
      ],
      more: 'Conoce la asociación en el dossier general', moreHref: '/dossier/es/',
    },
    offer: {
      eyebrow: 'Qué ofrecemos', title: 'Lo que recibe una empresa colaboradora',
      lead: 'No montamos categorías ni tarifas: queremos que la colaboración se note y se agradezca en público. Esto es lo que ofrecemos a quien se sume.',
      cards: [
        ['Agradecimiento y mención en las charlas', 'Nombramos y agradecemos en voz alta la colaboración de la empresa durante la jornada, en la apertura y en el cierre.'],
        ['Aparecer explícitamente como colaboradora', 'Logo y nombre como entidad colaboradora en la página del evento, en el cartel, en este dossier y en la comunicación de Un día con IA.'],
        ['Mención en las publicaciones', 'Agradecimiento en redes sociales y en la noticia del evento, tanto antes como después de la jornada.'],
        ['Roll-up en la zona del evento', 'Posibilidad de colocar un roll-up de la empresa en un lugar visible del espacio el día del evento.'],
        ['Material propio para las personas asistentes', 'Posibilidad de dejar folletos, merchandising o un pequeño detalle en la zona de acogida. Lo concretamos juntos.'],
        ['Cualquier otra idea', 'Si se os ocurre otra forma de aparecer o de aportar valor a la comunidad, siempre podemos hablarlo.'],
      ],
      stand: 'A priori no tenemos previsto stand. El evento es una jornada de charlas, sin zona de exposición. Si vuestra empresa tiene interés en uno, lo estudiamos entre todos.',
    },
    give: {
      eyebrow: 'Cómo aportar', title: 'Cómo se puede colaborar',
      lead: 'No fijamos importes: cada entidad aporta lo que considere oportuno y cualquier aportación es bienvenida.',
      headers: ['Tipo de aportación', 'En qué ayuda'],
      rows: [
        ['Económica', 'Cubre los costes de la jornada (gestión, material, cartelería) y permite mantener la entrada accesible.'],
        ['Comida, café o bebida', 'Desayuno, café, comida o bebida para las personas asistentes.'],
        ['Material e impresión', 'Cartelería, acreditaciones, roll-ups, papelería o merchandising para las personas asistentes.'],
        ['Espacio o equipamiento', 'Ya está cubierto: Odeene se ha encargado de la gestión del espacio.', 'Ya cubierto'],
        ['Otro tipo de colaboración', 'Estamos abiertos a otras formas de colaborar que no estén en esta lista. Cuéntanos tu idea y lo hablamos.'],
      ],
      talks: 'Las charlas del programa se ofrecen de forma altruista por parte de quien quiere compartir conocimiento. No están vinculadas a ningún tipo de colaboración económica.',
      closing: 'No os prometemos miles de asistentes ni un gran evento de networking internacional. Os ofrecemos entrar en el germen de una comunidad tecnológica local que empieza a organizarse con vocación de crecer, y aparecer desde el primer día como quienes lo hicieron posible.',
      logos: 'Gracias a quien ya colabora con nosotros — y todavía queda sitio para más.',
    },
    contact: {
      eyebrow: 'Hablemos', title: 'Contacto',
      lead: 'Si queréis colaborar, proponer una idea o conocernos antes de decidir, escribidnos.',
      cta: 'Hablemos',
    },
  },

  en: {
    path: `/dossier/${SLUG}/en/`, general: '/dossier/en/', label: 'English',
    ui: {
      langNav: 'Document language', pdf: 'Download PDF', navLabel: 'Dossier index',
      brand: 'Event<br>dossier', logoAlt: 'Cascarilla Tech logo',
      hint: 'Use the arrow keys or the index to navigate',
      nav: ['Cover', 'The event', 'Who organises it', 'What we offer', 'How to contribute', 'Contact'],
    },
    title: 'One AI Day — Sponsorship dossier',
    description: 'Dossier for companies that want to collaborate on One AI Day (Un día con IA), the tech day by Cascarilla Tech and Coruña JUG on 21 November 2026 at Cidade das TIC, A Coruña.',
    cover: {
      kicker: 'Sponsorship dossier', title: 'One AI Day',
      subtitle: 'A tech day to connect community, knowledge and companies in A Coruña.',
      meta: ['21 November 2026', 'Cidade das TIC, A Coruña'],
    },
    event: {
      eyebrow: 'The event', title: 'One AI Day',
      lead: 'A full day, from 9:00 to 18:30, bringing the A Coruña tech community together around artificial intelligence and software development.',
      cards: [
        ['When', 'Saturday, 21 November 2026', 'Hours', '9:00 – 18:30'],
        ['Where', 'Cidade das TIC (Av. de Pedralonga, A Coruña)', 'Status', 'Date and venue confirmed'],
        ['Format', 'Breakfast, keynote, talks, lunch and a networking afternoon.', 'Expected audience', '50-75 people'],
        ['Organised by', 'Cascarilla Tech and Coruña JUG', 'Language', 'Spanish'],
      ],
      note: 'The talk programme is still being closed: Roberto Garcia Navarro’s talk (“Code Is Cheap. Understanding the Business Isn’t.”) is confirmed, and the remaining speakers will be announced on the event page.',
      link: 'See the event page', linkHref: '/events/one-ai-day',
    },
    about: {
      eyebrow: 'Who organises it', title: 'Cascarilla Tech and Coruña JUG',
      paragraphs: [
        'Cascarilla Tech is a non-profit association in A Coruña that provides legal and structural support to tech communities and organises joint events with companies in the sector. We work horizontally, keep our activities open wherever possible, and publish our material under open licences.',
        'Coruña JUG is the technical community around Java and the JVM born in A Coruña. It runs talks and meetups on a regular basis and has previous experience working with sponsoring companies. One AI Day is organised jointly.',
      ],
      more: 'Learn about the association in the general dossier', moreHref: '/dossier/en/',
    },
    offer: {
      eyebrow: 'What we offer', title: 'What a collaborating company receives',
      lead: 'We do not set up tiers or price lists: we want the collaboration to be visible and thanked in public. This is what we offer to anyone who joins.',
      cards: [
        ['Thanks and mention during the talks', 'We name and thank the company out loud during the day, at the opening and at the closing.'],
        ['Explicitly listed as a collaborator', 'Logo and name as a collaborating organisation on the event page, on the poster, in this dossier and in One AI Day communications.'],
        ['Mention in our publications', 'Thanks on social media and in the event news post, both before and after the day.'],
        ['Roll-up in the event area', 'The option to place a company roll-up somewhere visible in the venue on the day of the event.'],
        ['Your own material for attendees', 'The option to leave flyers, merchandising or a small giveaway at the welcome area. We work out the details together.'],
        ['Any other idea', 'If you can think of another way to appear or to add value to the community, we can always talk about it.'],
      ],
      stand: 'We do not plan to have booths, at least for now. The event is a day of talks, with no exhibition area. If your company is interested in one, we will look at it together.',
    },
    give: {
      eyebrow: 'How to contribute', title: 'Ways to collaborate',
      lead: 'We do not set amounts: each organisation contributes what it sees fit, and any contribution is welcome.',
      headers: ['Type of contribution', 'How it helps'],
      rows: [
        ['Financial', 'Covers the running costs of the day (ticketing, material, signage) and helps keep tickets affordable.'],
        ['Food, coffee or drinks', 'Breakfast, coffee, lunch or drinks for attendees.'],
        ['Material and printing', 'Signage, badges, roll-ups, stationery or merchandising for attendees.'],
        ['Space or equipment', 'Already covered: Odeene has taken care of managing the space.', 'Already covered'],
        ['Any other collaboration', 'We are open to other ways of collaborating that are not on this list. Tell us your idea and we will talk it over.'],
      ],
      talks: 'The talks in the programme are given altruistically by people who want to share knowledge. They are not tied to any financial collaboration.',
      closing: 'We will not promise thousands of attendees or a big international networking event. What we offer is a place in the seed of a local tech community that is starting to organise itself with the ambition to grow, and to appear from day one as the ones who made it possible.',
      logos: 'Thanks to those who already collaborate with us — and there is still room for more.',
    },
    contact: {
      eyebrow: 'Let’s talk', title: 'Contact',
      lead: 'If you want to collaborate, suggest an idea or get to know us before deciding, write to us.',
      cta: 'Let’s talk',
    },
  },
};

const FLAGS = {
  gl: '<rect width="60" height="40" fill="#FFFFFF"/><path d="M0 0 L0 7 L53 40 L60 40 L60 33 L7 0 Z" fill="#0057B7"/>',
  es: '<rect width="60" height="40" fill="#AA151B"/><rect y="10" width="60" height="20" fill="#F1BF00"/>',
  en: '<rect width="60" height="40" fill="#012169"/><path d="M0 0 L60 40 M60 0 L0 40" stroke="#FFFFFF" stroke-width="8"/><path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" stroke-width="4"/><path d="M30 0 V40 M0 20 H60" stroke="#FFFFFF" stroke-width="13"/><path d="M30 0 V40 M0 20 H60" stroke="#C8102E" stroke-width="8"/>',
};

function langLink(code, current) {
  const l = LANGS[code];
  const cur = code === current ? ' aria-current="true"' : '';
  return `    <a class="lang__link" href="${l.path}" hreflang="${code}" lang="${code}"${cur} title="${l.label}">
      <svg class="lang__flag" viewBox="0 0 60 40" role="img" aria-hidden="true" focusable="false">${FLAGS[code]}</svg>
      <span class="lang__code">${code.toUpperCase()}</span>
      <span class="visually-hidden">${l.label}</span>
    </a>`;
}

const SECTION_IDS = ['sec-cover', 'sec-event', 'sec-about', 'sec-offer', 'sec-give', 'sec-contact'];

function eyebrow(n, text) {
  return `<p class="eyebrow"><span class="eyebrow__num">${String(n).padStart(2, '0')}</span><span>${esc(text)}</span></p>`;
}

function build(code) {
  const L = LANGS[code];
  const t = L.ui;
  const navItems = SECTION_IDS.map((id, i) => `    <li>
      <a class="deck-nav__link" href="#${id}"${i === 0 ? ' aria-current="true"' : ''}>
        <span class="deck-nav__thumb" aria-hidden="true"></span>
        <span class="deck-nav__meta"><span class="deck-nav__num">${String(i + 1).padStart(2, '0')}</span><span class="deck-nav__label">${esc(t.nav[i])}</span></span>
      </a>
    </li>`).join('\n');

  const eventCards = L.event.cards.map(([k1, v1, k2, v2]) => `        <article class="activity">
          <p class="activity__audience" style="border-top:0;padding-top:0"><span class="activity__audience-label">${esc(k1)}</span></p>
          <h3 class="activity__title">${esc(v1)}</h3>
          <p class="activity__audience"><span class="activity__audience-label">${esc(k2)}</span><span>${esc(v2)}</span></p>
        </article>`).join('\n');

  const offerCards = L.offer.cards.map(([h, p]) => `        <article class="activity">
          <h3 class="activity__title">${esc(h)}</h3>
          <p class="activity__desc" style="margin-bottom:0">${esc(p)}</p>
        </article>`).join('\n');

  const giveRows = L.give.rows.map(([a, b, badge]) => `          <tr>
            <td><p class="collab-table__title">${esc(a)}</p>${badge ? `<span style="display:inline-block;padding:.1rem .5rem;border-radius:999px;background:var(--color-background-logo);color:var(--color-dark-logo);font-size:.68rem;font-weight:700;letter-spacing:.06em;text-transform:uppercase">${esc(badge)}</span>` : ''}</td>
            <td><p class="collab-table__text">${esc(b)}</p></td>
          </tr>`).join('\n');

  const c = L.cover;
  return `<!DOCTYPE html>
<html lang="${code}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(L.title)}</title>
<meta name="description" content="${esc(L.description)}">
<link rel="canonical" href="https://cascarillatech.org${L.path}">
<meta property="og:title" content="${esc(L.title)}">
<meta property="og:description" content="${esc(L.description)}">
<meta property="og:image" content="https://cascarillatech.org/images/poster/generated/one-ai-day.png">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="stylesheet" href="/dossier/dossier.css">
<!--
  Xerado por tools/build-event-dossier.mjs — non editar a man: edita o script
  (obxecto CONTENT) e volve executalo. Comparte CSS/JS co dossier xeral
  (public/dossier/).
-->
<script>window.__dossierImgPath = '/images/';</script>
<script src="/dossier/dossier-head.js"></script>
</head>
<body>

<div class="toolbar">
  <nav class="lang" aria-label="${esc(t.langNav)}">
${['gl', 'es', 'en'].map((k) => langLink(k, code)).join('\n')}
  </nav>
  <span class="toolbar__sep" aria-hidden="true"></span>
  <button type="button" class="print-btn" id="print-btn">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 3v12"/><path d="m7 11 5 5 5-5"/><path d="M4 21h16"/></svg>
    <span class="print-btn__long">${esc(t.pdf)}</span>
    <span class="print-btn__short">PDF</span>
  </button>
</div>

<nav class="deck-nav" id="deck-nav" aria-label="${esc(t.navLabel)}">
  <div class="deck-nav__brand">
    <img src="/images/cascarillatech-logo.svg" alt="${esc(t.logoAlt)}" width="46" height="29">
    <span class="deck-nav__brand-text">${t.brand}</span>
  </div>
  <ol class="deck-nav__list">
${navItems}
  </ol>
  <p class="deck-nav__hint">${esc(t.hint)}</p>
</nav>

<main class="deck" id="deck">

  <!-- 01 · PORTADA -->
  <section class="slide cover" id="sec-cover" tabindex="-1" aria-labelledby="cover-title">
    <div class="slide__inner">
      <img class="cover__logo" src="/images/cascarillatech-logo.svg" alt="${esc(t.logoAlt)}" width="230" height="145">
      <p class="cover__kicker">${esc(c.kicker)}</p>
      <h1 id="cover-title">${esc(c.title)}</h1>
      <div class="cover__rule" aria-hidden="true"></div>
      <p class="cover__subtitle">${esc(c.subtitle)}</p>
      <p class="cover__meta"><span>${esc(c.meta[0])}</span><span>${esc(c.meta[1])}</span></p>
    </div>
  </section>

  <!-- 02 · O EVENTO -->
  <section class="slide slide--alt" id="sec-event" tabindex="-1" aria-labelledby="event-title">
    <div class="slide__inner">
      ${eyebrow(1, L.event.eyebrow)}
      <h2 id="event-title">${esc(L.event.title)}</h2>
      <div class="rule" aria-hidden="true"></div>
      <p class="lead">${esc(L.event.lead)}</p>
      <div class="activities">
${eventCards}
      </div>
      <p class="collab-note">${esc(L.event.note)} <a href="${L.event.linkHref}">${esc(L.event.link)} &rarr;</a></p>
    </div>
  </section>

  <!-- 03 · QUEN ORGANIZA -->
  <section class="slide" id="sec-about" tabindex="-1" aria-labelledby="about-title">
    <div class="slide__inner">
      ${eyebrow(2, L.about.eyebrow)}
      <h2 id="about-title">${esc(L.about.title)}</h2>
      <div class="rule" aria-hidden="true"></div>
      <div class="about__text">
${L.about.paragraphs.map((p) => `        <p>${esc(p)}</p>`).join('\n')}
        <p><a href="${L.about.moreHref}">${esc(L.about.more)} &rarr;</a></p>
      </div>
    </div>
  </section>

  <!-- 04 · QUE OFRECEMOS -->
  <section class="slide slide--alt" id="sec-offer" tabindex="-1" aria-labelledby="offer-title">
    <div class="slide__inner">
      ${eyebrow(3, L.offer.eyebrow)}
      <h2 id="offer-title">${esc(L.offer.title)}</h2>
      <div class="rule" aria-hidden="true"></div>
      <p class="lead">${esc(L.offer.lead)}</p>
      <div class="activities">
${offerCards}
      </div>
      <p class="collab-note">${esc(L.offer.stand)}</p>
    </div>
  </section>

  <!-- 05 · COMO ACHEGAR -->
  <section class="slide" id="sec-give" tabindex="-1" aria-labelledby="give-title">
    <div class="slide__inner">
      ${eyebrow(4, L.give.eyebrow)}
      <h2 id="give-title">${esc(L.give.title)}</h2>
      <div class="rule" aria-hidden="true"></div>
      <p class="lead">${esc(L.give.lead)}</p>
      <table class="collab-table" aria-label="${esc(L.give.title)}">
        <thead>
          <tr><th scope="col">${esc(L.give.headers[0])}</th><th scope="col">${esc(L.give.headers[1])}</th></tr>
        </thead>
        <tbody>
${giveRows}
        </tbody>
      </table>
      <p class="collab-note">${esc(L.give.talks)}</p>
      <p class="collab-closing">${esc(L.give.closing)}</p>
      <div class="logos">
        <p class="logos__label">${esc(L.give.logos)}</p>
        <div class="logos__row">
          <div class="logo-slot">
            <a href="https://odeene.es/" target="_blank" rel="noopener noreferrer"><img src="/images/colaboradoras/odeene-color-horizontal.png" alt="Odeene" width="180" height="45"></a>
          </div>
          <div class="logo-slot"><img src="/images/company-placeholder.svg" alt="" width="180" height="90" onerror="dossierLogoFallback(this);"></div>
          <div class="logo-slot"><img src="/images/company-placeholder.svg" alt="" width="180" height="90" onerror="dossierLogoFallback(this);"></div>
        </div>
      </div>
    </div>
  </section>

  <!-- 06 · CONTACTO -->
  <section class="slide" id="sec-contact" tabindex="-1" aria-labelledby="contact-title">
    <div class="slide__inner">
      ${eyebrow(5, L.contact.eyebrow)}
      <h2 id="contact-title">${esc(L.contact.title)}</h2>
      <div class="rule" aria-hidden="true"></div>
      <p class="lead">${esc(L.contact.lead)}</p>
      <a class="contact__email" href="mailto:${EMAIL}">${EMAIL}</a>
      <p class="contact__cta">${esc(L.contact.cta)}</p>
    </div>
  </section>

</main>

<script src="/dossier/dossier.js"></script>

</body>
</html>
`;
}

const OUT = { gl: '', es: 'es', en: 'en' };
for (const code of Object.keys(LANGS)) {
  const dir = join(ROOT, 'src', 'pages', 'dossier', SLUG, OUT[code]);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), build(code), 'utf8');
  console.log('escrito', join(dir, 'index.html'));
}
