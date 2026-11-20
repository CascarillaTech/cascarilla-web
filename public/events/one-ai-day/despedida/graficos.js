// Debuxa os gráficos da despedida a partir de window.DATOS (datos.js).
// Barras horizontais en HTML+CSS: nada de librarías, funciona sen internet.
(() => {
    const D = window.DATOS;
    const COLORS = ['var(--c1)', 'var(--c2)', 'var(--c3)', 'var(--c4)'];
    const n = (v) => Math.round(v).toLocaleString('gl-ES');
    const eur = (v) => `${n(v)} €`;
    const sum = (rows) => rows.reduce((a, r) => a + r.valor, 0);
    // Porcentaxes que suman sempre 100 (maior resto): redondear cada un por separado pode dar 99 ou 101
    const pcts = (rows) => {
        const total = sum(rows);
        if (!total) return rows.map(() => 0);
        const raw = rows.map((r) => (r.valor / total) * 100);
        const out = raw.map(Math.floor);
        const order = raw.map((v, i) => [v - out[i], i]).sort((a, b) => b[0] - a[0]);
        const missing = 100 - out.reduce((a, b) => a + b, 0);
        for (let k = 0; k < missing; k++) out[order[k][1]]++;
        return out;
    };

    // rows: [{nome, valor}] · fmt: formato do valor · color: fixa (unha serie)
    // ou null (unha cor por categoría, sempre na mesma orde)
    function bars(el, rows, { fmt = n, color = null, max = null } = {}) {
        const pc = pcts(rows);
        const top = max ?? Math.max(...rows.map((r) => r.valor), 1);
        el.innerHTML = rows.map((r, i) => `
            <dt class="bar-label">${r.nome}${r.detalle ? `<small class="bar-detalle">${r.detalle}</small>` : ''}</dt>
            <dd class="bar-track" style="margin:0">
                <span class="bar" style="width:${(r.valor / top) * 100 * 0.72}%;--n:${i};--bar-color:${color ?? COLORS[i % COLORS.length]}"></span>
                <span class="bar-value">${r.texto ? `<b>${r.texto}</b>` : `<b>${fmt(r.valor)}</b>${max === null ? ` <span>· ${pc[i] === 0 && r.valor > 0 ? '&lt; 1' : pc[i]} %</span>` : ''}`}</span>
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
    const s0 = Math.round(saldo);
    $('saldo').textContent = s0 === 0 ? eur(0) : `${s0 > 0 ? '+' : '−'}${eur(Math.abs(saldo))}`;

    // 5 e 6 · Reparto: barras + quesito coas mesmas cores por categoría.
    // (No balance non hai quesito: alí compáranse dúas cantidades, non partes dun todo.)
    function quesito(id, rows) {
        const vis = rows.filter((r) => r.valor > 0);
        const total = sum(vis);
        let acc = 0;
        const stops = vis.map((r, i) => {
            const from = (acc / total) * 100; acc += r.valor;
            return `${COLORS[rows.indexOf(r) % COLORS.length]} ${from}% ${(acc / total) * 100}%`;
        });
        const hero = $(id).closest('.hero');
        hero.innerHTML = `<div class="quesito" style="background:conic-gradient(${stops.join(',')})" aria-hidden="true"></div><div>${hero.innerHTML}</div>`;
    }
    bars($('ingresos-bars'), D.ingresos, { fmt: eur });
    bars($('gastos-bars'), D.gastos, { fmt: eur });
    quesito('ingresos-total', D.ingresos);
    quesito('gastos-total', D.gastos);
    const ast = D.nota ? '*' : '';
    $('ingresos-total').textContent = eur(ingresos);
    $('gastos-total').textContent = eur(gastos) + ast;
    $('saldo').textContent += ast;
    if (D.nota) {
        ['saldo', 'ingresos-total', 'gastos-total'].forEach((id) => {
            const notas = id === 'ingresos-total' ? D.ingresos.filter((r) => r.nota).map((r) => r.nota) : [D.nota];
            $(id).closest('section').insertAdjacentHTML('beforeend', notas.map((t) => `<p class="nota-pe">${t}</p>`).join(''));
        });
    }

    // Empresas representadas: logo se o hai, se non o nome
    $('empresas-total').textContent = D.empresas.length;
    $('empresas-grid').innerHTML = D.empresas.map((e) => e.logo
        ? (e.conNome
            ? `<li class="empresa empresa--logo empresa--con-nome"><img src="${e.logo}" alt="" />${e.nome}</li>`
            : `<li class="empresa empresa--logo"><img src="${e.logo}" alt="${e.nome}" /></li>`)
        : `<li class="empresa">${e.nome}</li>`).join('');

    if (D.exemplo) {
        document.querySelectorAll('[data-chart]').forEach((s) => {
            if (s.querySelector('#asistentes-bars, #empresas-grid')) return; // asistentes xa son reais
            s.insertAdjacentHTML('beforeend', '<span class="placeholder-badge">Datos de exemplo</span>');
        });
    }
})();
