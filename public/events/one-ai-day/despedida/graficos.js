// Debuxa os gráficos da despedida a partir de window.DATOS (datos.js).
// Barras horizontais en HTML+CSS: nada de librarías, funciona sen internet.
(() => {
    const D = window.DATOS;
    const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)'];
    const n = (v) => v.toLocaleString('gl-ES');
    const eur = (v) => `${n(v)} €`;
    const sum = (rows) => rows.reduce((a, r) => a + r.valor, 0);
    const pct = (v, total) => (total ? Math.round((v / total) * 100) : 0);

    // rows: [{nome, valor}] · fmt: formato do valor · color: fixa (unha serie)
    // ou null (unha cor por categoría, sempre na mesma orde)
    function bars(el, rows, { fmt = n, color = null, max = null } = {}) {
        const total = sum(rows);
        const top = max ?? Math.max(...rows.map((r) => r.valor), 1);
        el.innerHTML = rows.map((r, i) => `
            <dt class="bar-label">${r.nome}${r.detalle ? `<small class="bar-detalle">${r.detalle}</small>` : ''}</dt>
            <dd class="bar-track" style="margin:0">
                <span class="bar" style="width:${(r.valor / top) * 100 * 0.72}%;--n:${i};--bar-color:${color ?? COLORS[i % COLORS.length]}"></span>
                <span class="bar-value">${r.texto ? `<b>${r.texto}</b>` : `<b>${fmt(r.valor)}</b>${max === null ? ` <span>· ${pct(r.valor, total)} %</span>` : ''}`}</span>
            </dd>`).join('');
    }

    const $ = (id) => document.getElementById(id);
    const ingresos = sum(D.ingresos);
    const gastos = sum(D.gastos);
    const saldo = ingresos - gastos;

    // 3 · Asistentes
    $('asistentes-total').textContent = n(sum(D.asistentes));
    bars($('asistentes-bars'), D.asistentes);

    // 4 · Ingresos e gastos (mesmo eixo para as dúas barras)
    bars($('balance-bars'), [
        { nome: 'Ingresos' + (D.nota ? '*' : ''), valor: ingresos },
        { nome: 'Gastos' + (D.nota ? '*' : ''), valor: gastos },
    ], { fmt: eur, max: Math.max(ingresos, gastos) });
    $('saldo').textContent = `${saldo >= 0 ? '+' : '−'}${eur(Math.abs(saldo))}`;

    // 5 e 6 · Reparto (unha cor por diapositiva: ingresos terracota, gastos ocre)
    bars($('ingresos-bars'), D.ingresos, { fmt: eur, color: 'var(--c1)' });
    bars($('gastos-bars'), D.gastos, { fmt: eur, color: 'var(--c2)' });
    const ast = D.nota ? '*' : '';
    $('ingresos-total').textContent = eur(ingresos) + ast;
    $('gastos-total').textContent = eur(gastos) + ast;
    $('saldo').textContent += ast;
    if (D.nota) {
        ['saldo', 'ingresos-total', 'gastos-total'].forEach((id) => {
            const extra = id === 'ingresos-total' ? D.ingresos.filter((r) => r.nota).map((r) => r.nota) : [];
            $(id).closest('section').insertAdjacentHTML('beforeend', [D.nota, ...extra].map((t) => `<p class="nota-pe">${t}</p>`).join(''));
        });
    }

    // Empresas representadas: logo se o hai, se non o nome
    $('empresas-total').textContent = D.empresas.length;
    $('empresas-grid').innerHTML = D.empresas.map((e) => e.logo
        ? `<li class="empresa empresa--logo"><img src="${e.logo}" alt="${e.nome}" /></li>`
        : `<li class="empresa">${e.nome}</li>`).join('');

    if (D.exemplo) {
        document.querySelectorAll('[data-chart]').forEach((s) => {
            if (s.querySelector('#asistentes-bars, #empresas-grid')) return; // asistentes xa son reais
            s.insertAdjacentHTML('beforeend', '<span class="placeholder-badge">Datos de exemplo</span>');
        });
    }
})();
