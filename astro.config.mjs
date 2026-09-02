// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
    // Dominio final do sitio (o mesmo que declara o CNAME). Astro só carga
    // a configuración da raíz do proxecto, así que este é o único sitio
    // onde ten efecto: de aquí saen as URLs absolutas (canonical, Open
    // Graph, sitemap, feeds…) e o valor de import.meta.env.SITE.
    site: 'https://cascarillatech.org',
});
