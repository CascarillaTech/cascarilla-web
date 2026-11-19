// ============================================================
// NÚMEROS DA DESPEDIDA — cambiar só isto.
// Mentres `exemplo` sexa true, as diapositivas amosan un aviso
// vermello "Datos de exemplo". Poñelo a false cos números reais.
// ============================================================
window.DATOS = {
    exemplo: false,

    // Ingresos e gastos levan * e esta nota mentres falte algún dato
    nota: '* Falta o prezo do espazo, que está patrocinado',

    asistentes: [
        // Confirmados en badges (activos, sen reembolsados) a 19/11/2026
        { nome: 'Asistentes', valor: 70 }, // 69 en badges + 1 que falta
        { nome: 'Ponentes',   valor: 4 },
        { nome: 'Staff',      valor: 9 },
    ],

    // Empresas e entidades representadas (badges: empresa do perfil, dominio do
    // correo e entradas de patrocinador). Sen as organizadoras. `logo` opcional.
    empresas: [
        { nome: 'ABANCA', logo: '../keynote/assets/empresas/abanca.svg' },
        { nome: 'Altia', logo: '../keynote/assets/empresas/altia.svg' },
        { nome: 'Bahía Software', logo: '../keynote/assets/bahia-software-color.png' },
        { nome: 'BeTIC Technology' },
        { nome: 'CPR Liceo La Paz' },
        { nome: 'Deputación da Coruña' },
        { nome: 'Docuten' },
        { nome: 'EcoMT' },
        { nome: 'Factorial' },
        { nome: 'Graforsa', logo: '../keynote/assets/empresas/graforsa.png' },
        { nome: 'Imatia', logo: '../keynote/assets/empresas/imatia.svg' },
        { nome: 'Inled Group' },
        { nome: 'Northius', logo: '../keynote/assets/empresas/northius.svg' },
        { nome: 'NTT DATA' },
        { nome: 'Odeene', logo: '../keynote/assets/odeene-color-horizontal.png' },
        { nome: 'Oesia' },
        { nome: 'Plexus Tech', logo: '../keynote/assets/empresas/plexus.png' },
        { nome: 'Prima Assicurazioni' },
        { nome: 'Statista' },
        { nome: 'Teimas', logo: '../keynote/assets/empresas/teimas.svg' },
        { nome: 'Vig-Sec Drone' },
        { nome: 'Xunta de Galicia' },
        { nome: '3MT Global Services', logo: '../keynote/assets/3mt-global-services.png' },
    ],

    // Da folla Cuentas.ods (19/11/2026). Fee de Eventbrite segundo badges.
    ingresos: [
        { nome: 'Patrocinadores*', valor: 1200, nota: '* Máis o espazo' },
        { nome: 'Entradas', valor: 860 + 94.31 }, // 860 netos + fee de Eventbrite
    ],

    gastos: [
        // Matilda + Lamastelle + Empanadería + Alcampo (estimado: 500)
        { nome: 'Comida, bebida e menaxe', valor: 664.05 + 232.75 + 91 + 500 },
        // NFC + chaveiros, PLA, auriculares, roll-ups
        { nome: 'Merchandising e material', valor: 19.16 + 55.92 + 15.99 + 348.58, detalle: 'camisetas de ponentes e staff, aparellos…' },
        { nome: 'Comisión de Eventbrite', valor: 94.31 },
        // Etiquetas + Sucopia
        { nome: 'Acreditacións', valor: 29.99 + 20 },
        { nome: 'Espazo', valor: 0, texto: 'patrocinado por Odeene (grazas ❤️)' },
    ],
};
