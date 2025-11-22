
// 1. FUNCIONALIDAD MENÚ HAMBURGUESA (MÓVIL)
document.addEventListener('DOMContentLoaded', () => 
    {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (menuToggle) 
        {
            menuToggle.addEventListener('click', () => 
            {
                navLinks.classList.toggle('active');
            });
        }
});


// 2. FUNCIONALIDAD CARRUSEL 
function scrollCarousel(containerId, direction) 
{
    const container = document.getElementById(containerId);
    if (container) 
    {
        const scrollAmount = 275;        
        if (direction === 1) 
        {
            container.scrollLeft += scrollAmount;
        } 
        else 
        {
            container.scrollLeft -= scrollAmount;
        }
    }
}

// 3. LÓGICA DE AJUSTES Y ACCESIBILIDAD
document.addEventListener('DOMContentLoaded', () => 
{
    
    const btnSettings = document.getElementById('btn-settings');
    const menuSettings = document.getElementById('settings-menu');

    if (btnSettings && menuSettings) 
    {
        btnSettings.addEventListener('click', (e) => 
        {
            e.stopPropagation(); 
            menuSettings.classList.toggle('show');
        });
    }

    document.addEventListener('click', (e) => 
    {
        if (menuSettings && menuSettings.classList.contains('show')) 
        {
            if (!menuSettings.contains(e.target) && e.target !== btnSettings) 
            {
                menuSettings.classList.remove('show');
            }
        }
    });

    // --- B. Aumentar / Disminuir Letra (Zoom) ---
   const btnIncrease = document.getElementById('btn-increase-font');
    const btnDecrease = document.getElementById('btn-decrease-font');

    let currentZoom = parseFloat(localStorage.getItem('siteZoom')) || 1;

    function applyZoom() 
    {
        document.body.style.zoom = currentZoom;
        localStorage.setItem('siteZoom', currentZoom);
    }

    applyZoom();

    if (btnIncrease) 
    {
        btnIncrease.addEventListener('click', (e) => 
        {
            e.stopPropagation(); 
            if (currentZoom < 1.5) 
            { 
                currentZoom += 0.1; 
                applyZoom();
            }
        });
    }

    if (btnDecrease) 
    {
        btnDecrease.addEventListener('click', (e) => 
        {
            e.stopPropagation(); 
            if (currentZoom > 0.8) 
            { 
                currentZoom -= 0.1; 
                applyZoom();
            }
        });
    }

    // --- C. Toggle Modo Claro / Oscuro ---

    const btnTheme = document.getElementById('btn-theme-toggle');
    if (btnTheme) 
    {
        btnTheme.addEventListener('click', (e) => 
        {
            // Evitamos que se cierre el menú al hacer clic para poder ver el cambio
            e.stopPropagation(); 
            
            // Alternamos la clase en el body
            document.body.classList.toggle('light-mode');
            
            // Guardamos la preferencia en el navegador (localStorage)
            // Así, si vas a "Contacto" o "Monitores", se mantiene el modo.
            if (document.body.classList.contains('light-mode')) 
            {
                localStorage.setItem('theme', 'light');
            } else 
            {
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    // Cargar tema guardado al iniciar la página (Esto va al final del ready)
    if (localStorage.getItem('theme') === 'light') 
        {
        document.body.classList.add('light-mode');
}
});
