// Navegación, escalado e impresión das diapositivas (compartido coa despedida).
(() => {
    const deck = document.getElementById('deck');
    const slides = [...deck.querySelectorAll('.slide')];
    const counter = document.getElementById('counter');
    const progress = document.getElementById('progress');
    let current = 0;

    // Escalar o lenzo 1200x675 para encher a pantalla mantendo o 16:9
    function fit() {
        const s = Math.min(innerWidth / 1200, innerHeight / 675);
        deck.style.setProperty('--scale', s);
    }

    function go(i) {
        current = Math.max(0, Math.min(slides.length - 1, i));
        slides.forEach((el, k) => {
            el.classList.toggle('is-active', k === current);
            el.classList.toggle('is-past', k < current);
        });
        counter.textContent = `${current + 1} / ${slides.length}`;
        progress.style.width = `${((current + 1) / slides.length) * 100}%`;
        history.replaceState(null, '', `#${current + 1}`);
    }

    addEventListener('keydown', (e) => {
        if (e.altKey || e.ctrlKey || e.metaKey) return;
        switch (e.key) {
            case 'ArrowRight': case 'ArrowDown': case 'PageDown': case ' ': case 'Enter':
                go(current + 1); break;
            case 'ArrowLeft': case 'ArrowUp': case 'PageUp': case 'Backspace':
                go(current - 1); break;
            case 'Home': go(0); break;
            case 'End': go(slides.length - 1); break;
            case 'f': case 'F':
                document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
                break;
            default: return;
        }
        e.preventDefault();
    });

    addEventListener('click', (e) => go(current + (e.button === 0 ? 1 : -1)));
    addEventListener('contextmenu', (e) => { e.preventDefault(); go(current - 1); });
    addEventListener('resize', fit);

    // Imprimir / PDF: copia da cabeceira e do pé en cada diapositiva
    addEventListener('beforeprint', () => {
        const header = deck.querySelector(':scope > .deck-header');
        const footer = deck.querySelector(':scope > .deck-footer');
        slides.forEach((el, k) => {
            const h = header.cloneNode(true);
            const f = footer.cloneNode(true);
            f.querySelector('.slide-counter').textContent = `${k + 1} / ${slides.length}`;
            h.classList.add('print-copy');
            f.classList.add('print-copy');
            el.append(h, f);
        });
    });
    addEventListener('afterprint', () => deck.querySelectorAll('.print-copy').forEach((n) => n.remove()));

    fit();
    go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
