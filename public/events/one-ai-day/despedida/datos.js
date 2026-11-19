// ============================================================
// NÚMEROS DA DESPEDIDA — cambiar só isto.
// Mentres `exemplo` sexa true, as diapositivas amosan un aviso
// vermello "Datos de exemplo". Poñelo a false cos números reais.
// ============================================================
window.DATOS = {
    exemplo: false,

    // Ingresos e gastos levan * e esta nota mentres falte algún dato
    nota: '* Hai un dato que aínda non temos',

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

    ingresos: [
        // ~3000 € en total. Entradas = bruto real de Eventbrite (badges); patrocinadores aproximado
        { nome: 'Patrocinadores', valor: 2050 },
        { nome: 'Entradas',       valor: 955 },
    ],

    gastos: [
        // ~2900 € provisional; reparto proporcional ao exemplo anterior
        { nome: 'Comida',         valor: 1970 },
        { nome: 'Merchandising',  valor: 490 },
        { nome: 'Espazo',         valor: 440 },
    ],
};
