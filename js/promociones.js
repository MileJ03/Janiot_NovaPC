// 1. ESTADO GLOBAL: Objeto para guardar los carritos de cada tarjeta por ID (1 a 6)
const carritos = {
    1: [], 2: [], 3: [], 4: [], 5: [], 6: []
};

// No necesitamos DOMContentLoaded para los event listeners porque los botones en el HTML 
// ya tienen el atributo onclick="agregar(1)", onclick="calcular('promo50', 1)", etc.

// --- FUNCIÓN PARA AGREGAR PRODUCTOS ---
function agregar(id) {
    // Seleccionamos los elementos basándonos en el ID de la tarjeta (1, 2, 3...)
    const select = document.getElementById(`select-${id}`);
    const inputCant = document.getElementById(`cant-${id}`);
    
    // Obtenemos valores
    const nombreProd = select.options[select.selectedIndex].text;
    const precioProd = parseFloat(select.value);
    const cantidad = parseInt(inputCant.value);

    // Validaciones
    if (!precioProd || isNaN(precioProd)) { 
        alert("Por favor, seleccioná un producto."); 
        return; 
    }
    if (cantidad < 1 || isNaN(cantidad)) { 
        alert("La cantidad debe ser al menos 1."); 
        return; 
    }

    // Agregamos al carrito específico de esa tarjeta
    carritos[id].push({ 
        nombre: nombreProd, 
        precio: precioProd, 
        cantidad: cantidad 
    });
    
    // Actualizamos la vista de esa tarjeta
    renderizarLista(id);
}

// --- FUNCIÓN PARA MOSTRAR LA LISTA ---
function renderizarLista(id) {
    const lista = document.getElementById(`list-${id}`);
    lista.innerHTML = ""; // Limpiar lista visual
    
    const carritoActual = carritos[id];

    if (carritoActual.length === 0) {
        // Opcional: Mostrar mensaje si está vacío
        return;
    }

    carritoActual.forEach(item => {
        const li = document.createElement('li');
        // Limpiamos el nombre para quitar el precio del texto (ej: "Mouse ($5000)" -> "Mouse")
        const nombreLimpio = item.nombre.split('($')[0];
        
        li.innerHTML = `
            <span>${item.cantidad}x ${nombreLimpio}</span>
            <span>$${(item.precio * item.cantidad).toLocaleString('es-AR')}</span>
        `;
        lista.appendChild(li);
    });
}

// --- FUNCIÓN PRINCIPAL DE CÁLCULO ---
function calcular(tipoPromo, id) {
    const carrito = carritos[id];
    
    if (carrito.length === 0) {
        alert("Agregá productos primero.");
        return;
    }

    // 1. AGRUPAR PRODUCTOS IGUALES (Tu lógica corregida)
    // Esto suma las cantidades si agregaste "Mouse" y luego otra vez "Mouse"
    let inventario = {};
    
    carrito.forEach(item => {
        // Usamos el nombre como clave
        if(!inventario[item.nombre]) {
            inventario[item.nombre] = { 
                precio: item.precio, 
                cantidad: 0 
            };
        }
        inventario[item.nombre].cantidad += item.cantidad;
    });

    let totalSinDesc = 0;
    let totalPagar = 0;

    // 2. APLICAR LÓGICA SEGÚN EL TIPO DE PROMO
    // Recorremos el inventario agrupado
    for (let key in inventario) {
        const prod = inventario[key];
        const precio = prod.precio;
        const cant = prod.cantidad;
        
        // Calculamos el subtotal base para saber cuánto ahorramos
        totalSinDesc += precio * cant;

        if (tipoPromo === 'promo50') {
            // === LÓGICA TARJETA 1: 2da al 50% ===
            const pares = Math.floor(cant / 2);
            const sobra = cant % 2;
            // (Precio * 1.5) es lo que cuestan 2 unidades con la promo (100% + 50%)
            totalPagar += (pares * (precio * 1.5)) + (sobra * precio);
        
        } else if (tipoPromo === 'promo3x2') {
            // === LÓGICA TARJETA 2: 3x2 ===
            const trios = Math.floor(cant / 3);
            const sobra = cant % 3;
            // Cada trío paga solo 2 unidades
            totalPagar += (trios * (precio * 2)) + (sobra * precio);

        } else if (tipoPromo === 'promo4x3') {
            // === LÓGICA TARJETA 5: 4x3 ===
            const grupos = Math.floor(cant / 4);
            const sobra = cant % 4;
            // Cada grupo de 4 paga solo 3
            totalPagar += (grupos * (precio * 3)) + (sobra * precio);
        
        } else {
            // Para las promos globales (10%, MP, Efectivo), primero sumamos todo normal
            totalPagar += precio * cant;
        }
    }

    // 3. APLICAR DESCUENTOS GLOBALES (Sobre el total)
    
    if (tipoPromo === 'promo100k') {
        // === TARJETA 3: 10% OFF si supera $100.000 ===
        if (totalPagar > 100000) {
            totalPagar = totalPagar * 0.90; // Resta 10%
        }
    } 
    else if (tipoPromo === 'promoMP') {
        // === TARJETA 4: 20% OFF con Mercado Pago ===
        const checkMP = document.getElementById(`check-mp-${id}`); // Busca el checkbox
        // Si el checkbox existe y está marcado
        if (checkMP && checkMP.checked) {
            totalPagar = totalPagar * 0.80; // Resta 20%
        }
    } 
    else if (tipoPromo === 'promoEfectivo') {
        // === TARJETA 6: 15% OFF Efectivo ===
        totalPagar = totalPagar * 0.85; // Resta 15%
    }

    // 4. MOSTRAR RESULTADOS
    const ahorro = totalSinDesc - totalPagar;

    document.getElementById(`total-${id}`).textContent = `$${totalPagar.toLocaleString('es-AR')}`;
    
    const msg = document.getElementById(`ahorro-${id}`);
    if (ahorro > 0) {
        msg.textContent = `¡Ahorraste $${ahorro.toLocaleString('es-AR')}!`;
    } else {
        msg.textContent = ""; // Limpiar si no hubo ahorro
    }
}

// --- FUNCIÓN PARA LIMPIAR ---
function limpiar(id) {
    carritos[id] = []; // Vaciar array de esa tarjeta
    renderizarLista(id); // Borrar lista visual
    
    // Resetear textos
    document.getElementById(`total-${id}`).textContent = "$0";
    document.getElementById(`ahorro-${id}`).textContent = "";
    
    // Resetear inputs
    document.getElementById(`select-${id}`).selectedIndex = 0;
    document.getElementById(`cant-${id}`).value = 1;
    
    // Si hay checkbox (Tarjeta 4), desmarcarlo
    const checkMP = document.getElementById(`check-mp-${id}`);
    if(checkMP) checkMP.checked = false;
}