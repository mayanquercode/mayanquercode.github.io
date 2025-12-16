
const openBtn = document.getElementById('open-search-modal');
const closeBtn = document.getElementById('close-search-modal');
const modal = document.getElementById('search-modal');

// Función para abrir el modal (desliza hacia abajo)
openBtn.addEventListener('click', () => {
    modal.classList.add('is-active');
    modal.classList.remove('opacity-0', 'pointer-events-none');
});

// Función para cerrar el modal (desliza hacia arriba)
closeBtn.addEventListener('click', () => {
    modal.classList.remove('is-active');
    // Retrasamos la ocultación para permitir que la animación se complete
    setTimeout(() => {
        modal.classList.add('opacity-0', 'pointer-events-none');
    }, 300); // 300ms debe coincidir con la duración de la transición CSS
});
