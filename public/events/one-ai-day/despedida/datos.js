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
        // Badges activos (sen reembolsados nin desactivados) a 20/11/2026
        { nome: 'Asistentes', valor: 72 },
        { nome: 'Ponentes',   valor: 4 },
        { nome: 'Staff',      valor: 9 },
    ],

    // Empresas e entidades representadas (badges: empresa do perfil, dominio do
    // correo e entradas de patrocinador). Sen as organizadoras. `logo` opcional;
    // `conNome` amosa tamén o nome ao lado do logo.
    empresas: [
        { nome: 'ABANCA', logo: '../keynote/assets/empresas/abanca.svg' },
        { nome: 'Altia', logo: '../keynote/assets/empresas/altia.svg' },
        { nome: 'Bahía Software', logo: '../keynote/assets/bahia-software-color.png' },
        { nome: 'BeTIC Technology', logo: '../keynote/assets/empresas/betic.png' },
        { nome: 'CPR Liceo La Paz', logo: '../keynote/assets/empresas/liceo-la-paz.png', conNome: true }, // o logo é cadrado e a letra non se le
        { nome: 'Deputación da Coruña', logo: '../keynote/assets/empresas/deputacion.png' },
        { nome: 'Docuten', logo: '../keynote/assets/empresas/docuten.svg' },
        { nome: 'EcoMT', logo: '../keynote/assets/empresas/ecomt.svg' },
        { nome: 'Factorial', logo: '../keynote/assets/empresas/factorial.svg' },
        { nome: 'Graforsa', logo: '../keynote/assets/empresas/graforsa.png' },
        { nome: 'Imatia', logo: '../keynote/assets/empresas/imatia.svg' },
        { nome: 'Inled Group', logo: '../keynote/assets/empresas/inled.png' },
        { nome: 'Northius', logo: '../keynote/assets/empresas/northius.svg' },
        { nome: 'NTT DATA', logo: '../keynote/assets/empresas/nttdata.png' },
        { nome: 'Odeene', logo: '../keynote/assets/odeene-color-horizontal.png' },
        { nome: 'Oesia' },
        { nome: 'Plexus Tech', logo: '../keynote/assets/empresas/plexus.png' },
        { nome: 'Prima Assicurazioni', logo: '../keynote/assets/empresas/prima.svg' },
        { nome: 'Statista', logo: '../keynote/assets/empresas/statista.svg' },
        { nome: 'Teimas', logo: '../keynote/assets/empresas/teimas.svg' },
        { nome: 'Vig-Sec Drone', logo: '../keynote/assets/empresas/vigsec.png' },
        { nome: 'Xunta de Galicia', logo: '../keynote/assets/empresas/xunta.svg' },
        { nome: '3MT Global Services', logo: '../keynote/assets/3mt-global-services.png' },
    ],

    // Ingresos: patrocinios + entradas (badges a 21/11/2026: 955 € brutos, dos que 94 € son a comisión de Eventbrite)
    ingresos: [
        { nome: 'Patrocinadores*', valor: 1200, nota: '* Máis o espazo' },
        { nome: 'Entradas', valor: 955 },
    ],

    // Gastos actualizados a 21/11/2026
    gastos: [
        { nome: 'Comida, bebida e menaxe', valor: 825 + 233 + 426 },
        { nome: 'Merchandising e material', valor: 20 + 55 + 16 + 26 + 329, detalle: 'camisetas de ponentes e staff, aparellos…' },
        { nome: 'Comisión de Eventbrite', valor: 94 },
        { nome: 'Acreditacións', valor: 30 + 20 },
        { nome: 'Espazo', valor: 0, texto: 'patrocinado por Odeene (grazas ❤️)' },
    ],
};
