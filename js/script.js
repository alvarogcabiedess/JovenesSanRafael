// Script para mostrar/ocultar un menú lateral si deseas
document.getElementById('menuToggle').addEventListener('click', () => {
  alert('Aquí podrías abrir un menú lateral con más opciones');
});

//Fecha actual
(function() {
  const el = document.getElementById('fechaActual');
  const now = new Date();
  const options = { weekday: 'long', day: 'numeric', month: 'long' };
  const dateStr = now.toLocaleDateString('es-ES', options);
  el.textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
})();

// Manejo de selección de botones de hora: click añade clase active y la quita de los demás
(function() {
  const botones = Array.from(document.querySelectorAll('.hora-btn'));
  if (!botones.length) return;

  botones.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Añadir clase active al elemento clicado y quitarla de los demás
      botones.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // Nota: no impedimos la navegación (si el enlace lleva a otra página)
    });
  });
})();

// Cargar evangelio (intenta fuente remota y cae a local si falla) y mostrar versículo en index
(function() {
  async function tryFetch(url) {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('HTTP ' + resp.status);
    return await resp.text();
  }

  async function loadEvangelio() {
    const fuentes = [
      'https://www.vaticannews.va/es/evangelio-de-hoy.html',
      'evangelio.html'
    ];

    let doc = null;
    for (const url of fuentes) {
      try {
        const html = await tryFetch(url);
        const parser = new DOMParser();
        doc = parser.parseFromString(html, 'text/html');
        // Buscamos la estructura esperada
        const head = doc.querySelector('.section__head h2');
        const contents = doc.querySelectorAll('.section__content');
        if (head && contents.length) {
          // Extraer versículo: buscamos un párrafo que contenga un patrón tipo "Lucas 19, 1-10"
          let verse = '';
          const ps = contents[0].querySelectorAll('p');
          for (const p of ps) {
            if (/\d+\s*,\s*\d+/.test(p.textContent)) { verse = p.textContent.trim(); break; }
          }
          if (!verse && ps.length >= 2) verse = ps[1].textContent.trim();

          // Poner versículo en index si existe el elemento
          const out = document.getElementById('versiculoHoy');
          if (out) out.textContent = verse || ps[0] && ps[0].textContent.trim() || '';

          // Si estamos en evangelio.html, inyectamos el contenido completo en #evangelioContent
          const localContainer = document.getElementById('evangelioContent');
          if (localContainer) {
            const headHtml = head.outerHTML;
            const contentHtml = Array.from(contents).map(c => c.outerHTML).join('\n');
            localContainer.innerHTML = headHtml + '\n' + contentHtml;
          }

          return; // éxito
        }
      } catch (err) {
        // continúo al siguiente origen
        console.warn('No se pudo cargar desde', url, err);
      }
    }

    // Si no se encontró nada, dejamos texto por defecto
    const out = document.getElementById('versiculoHoy');
    if (out) out.textContent = 'Versículo no disponible';
  }

  // Ejecutar tras carga del DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEvangelio);
  } else {
    loadEvangelio();
  }
})();
