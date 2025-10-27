document.addEventListener('DOMContentLoaded', () => {
    // 1. Asignar listeners a los inputs de cantidad (para el cálculo de subtotales)
    const camposCantidad = document.querySelectorAll('.cantidad');
    camposCantidad.forEach(input => {
        input.addEventListener('change', calcularPromociones);
        input.addEventListener('input', calcularPromociones); 
    });
    
    // 2. Asignar listeners a los inputs de promociones (para la selección del descuento)
    const promoChecks = document.querySelectorAll('.promo-check');
    promoChecks.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            // Lógica para asegurar que solo una casilla esté marcada (excluyente)
            promoChecks.forEach(otherCheckbox => {
                if (otherCheckbox !== this) {
                    otherCheckbox.checked = false;
                }
            });
            calcularPromociones();
        });
    });

    // 3. Ejecutar el cálculo inicial
    calcularPromociones(); 
});


// Función auxiliar para mostrar/ocultar y desmarcar si es necesario
function actualizarVisibilidad(idElemento, idCheckbox, montoDescuento) {
    const elemento = document.getElementById(idElemento);
    const checkbox = document.getElementById(idCheckbox);

    if (montoDescuento > 0) {
        elemento.style.display = 'block'; // Mostrar si aplica
    } else {
        elemento.style.display = 'none'; // Ocultar si NO aplica
        if (checkbox.checked) {
            checkbox.checked = false; // Desmarcar si se oculta
        }
    }
}


// Función principal que se llama cada vez que cambia la cantidad o la selección de promoción
function calcularPromociones() 
{
    const productosEnTabla = document.querySelectorAll('#productos-table tbody tr');
    let totalSinDescuento = 0;
    let descuentoAplicado = 0;
    const carrito = []; 
    const umbralGranCompra = 100000;

    // 1. Recopilar datos y calcular subtotal sin descuento
    productosEnTabla.forEach(fila => {
        const precioUnitario = parseFloat(fila.dataset.precio); 
        const inputCantidad = fila.querySelector('.cantidad');
        const cantidad = parseInt(inputCantidad.value) || 0; 

        if (cantidad > 0) {
            carrito.push({ nombre: fila.querySelector('td:first-child').textContent, precio: precioUnitario, cantidad });
            totalSinDescuento += precioUnitario * cantidad;
        }
        fila.querySelector('.subtotal').textContent = `$${(precioUnitario * cantidad).toLocaleString('es-AR')}`;
    });


    // =======================================================
    // 2. CALCULAR MONTOS POSIBLES Y ACTUALIZAR VISIBILIDAD DE CHECKS
    // =======================================================
    
    const res2x1 = aplicarPromocion2daUnidad50(carrito);
    const res3x2 = aplicarPromocion3x2(carrito);
    // Calcular el posible descuento por Gran Compra
    const posibleDescuentoGranCompra = (totalSinDescuento > umbralGranCompra) ? totalSinDescuento * 0.10 : 0;
    
    // Actualizar visibilidad de los checks
    actualizarVisibilidad('opcion-2x1', 'check-2x1', res2x1.descuento);
    actualizarVisibilidad('opcion-3x2', 'check-3x2', res3x2.descuento);
    actualizarVisibilidad('opcion-mayor', 'check-mayor', posibleDescuentoGranCompra);


    // =======================================================
    // 3. APLICAR DESCUENTO SELECCIONADO POR EL USUARIO
    // =======================================================
    
    let promoElegida = null;

    // A. Revisar qué checkbox está marcado por el cliente
    if (document.getElementById('check-2x1').checked) {
        promoElegida = '2x1';
    } else if (document.getElementById('check-3x2').checked) {
        promoElegida = '3x2';
    } else if (document.getElementById('check-mayor').checked) {
        promoElegida = 'granCompra';
    }

    // B. Aplicar el descuento
    if (promoElegida) {
        switch (promoElegida) {
            case '2x1':
                descuentoAplicado = res2x1.descuento;
                break;
            case '3x2':
                descuentoAplicado = res3x2.descuento;
                break;
            case 'granCompra':
                // Aquí usamos el valor ya calculado de posibleDescuentoGranCompra
                if (posibleDescuentoGranCompra > 0) { // Validamos nuevamente para robustez
                    descuentoAplicado = posibleDescuentoGranCompra;
                } 
                break;
        }
    }


    // 4. Finalizar cálculo
    let totalFinalConAhorro = totalSinDescuento - descuentoAplicado;
    if (totalFinalConAhorro < 0) totalFinalConAhorro = 0; 

    // 5. Actualizar la interfaz de usuario
    document.getElementById('total-sin-descuento').textContent = `$${totalSinDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    document.getElementById('descuento-aplicado').textContent = `$${descuentoAplicado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    document.getElementById('total-final').textContent = `$${totalFinalConAhorro.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

}


// *** Funciones auxiliares de cálculo (SIN CAMBIOS) ***

function aplicarPromocion3x2(carrito) 
{
    let descuento = 0;
    const itemsElegibles = [];

    carrito.forEach(item => {
        for (let i = 0; i < item.cantidad; i++) {
            itemsElegibles.push({ nombre: item.nombre, precio: item.precio });
        }
    });

    itemsElegibles.sort((a, b) => a.precio - b.precio);

    for (let i = 0; i < Math.floor(itemsElegibles.length / 3); i++) {
        descuento += itemsElegibles[i * 3].precio; 
    }

    return { descuento: descuento, itemsAplicados: [] }; 
}


function aplicarPromocion2daUnidad50(carrito) 
{
    let descuento = 0;

    carrito.forEach(item => {
        if (item.cantidad >= 2) {
            const numPares = Math.floor(item.cantidad / 2);
            descuento += numPares * (item.precio * 0.5);
        }
    });

    return { descuento: descuento, itemsAplicados: [] };
}