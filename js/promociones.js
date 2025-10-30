document.addEventListener('DOMContentLoaded', () => 
    {
    const camposCantidad = document.querySelectorAll('.cantidad');
    camposCantidad.forEach(input => 
        {
        input.addEventListener('change', calcularPromociones);
        input.addEventListener('input', calcularPromociones); 
        }
    );
    
    const promoChecks = document.querySelectorAll('.promo-check');
    promoChecks.forEach(checkbox => 
        {
        checkbox.addEventListener('change', function() 
        {
            promoChecks.forEach(otherCheckbox => 
                {
                if (otherCheckbox !== this) 
                    {
                    otherCheckbox.checked = false;
                }
            });
            calcularPromociones();
        });
    });
    calcularPromociones(); 
}
);


function actualizarVisibilidad(idElemento, idCheckbox, montoDescuento) 
{
    const elemento = document.getElementById(idElemento);
    const checkbox = document.getElementById(idCheckbox);

    if (montoDescuento > 0) 
        {
        elemento.style.display = 'block'; 
        } 
        else 
        {
            elemento.style.display = 'none'; 
            if (checkbox.checked) 
            {
                checkbox.checked = false; 
            }
        }
}


function calcularPromociones() 
{
    const productosEnTabla = document.querySelectorAll('#productos-table tbody tr');
    let totalSinDescuento = 0;
    let descuentoAplicado = 0;
    const carrito = []; 
    const umbralGranCompra = 100000;

    productosEnTabla.forEach(fila => 
        {
        const precioUnitario = parseFloat(fila.dataset.precio); 
        const inputCantidad = fila.querySelector('.cantidad');
        const cantidad = parseInt(inputCantidad.value) || 0; 

        if (cantidad > 0) 
        {
            carrito.push({ nombre: fila.querySelector('td:first-child').textContent, precio: precioUnitario, cantidad });
            totalSinDescuento += precioUnitario * cantidad;
        }
        fila.querySelector('.subtotal').textContent = `$${(precioUnitario * cantidad).toLocaleString('es-AR')}`;
        }
    );


    // CALCULAR MONTOS POSIBLES Y ACTUALIZAR VISIBILIDAD DE CHECKS

    const res2x1 = aplicarPromocion2daUnidad50(carrito);
    const res3x2 = aplicarPromocion3x2(carrito);

    const posibleDescuentoGranCompra = (totalSinDescuento > umbralGranCompra) ? totalSinDescuento * 0.10 : 0;
    
    actualizarVisibilidad('opcion-2x1', 'check-2x1', res2x1.descuento);
    actualizarVisibilidad('opcion-3x2', 'check-3x2', res3x2.descuento);
    actualizarVisibilidad('opcion-mayor', 'check-mayor', posibleDescuentoGranCompra);

    // APLICAR DESCUENTO SELECCIONADO POR EL USUARIO
    
    let promoElegida = null;

    if (document.getElementById('check-2x1').checked) 
    {
        promoElegida = '2x1';
    } else if (document.getElementById('check-3x2').checked) 
    {
        promoElegida = '3x2';
    } else if (document.getElementById('check-mayor').checked) 
    {
        promoElegida = 'granCompra';
    }

    if (promoElegida) 
    {
        switch (promoElegida) 
        {
            case '2x1':
                descuentoAplicado = res2x1.descuento;
                break;
            case '3x2':
                descuentoAplicado = res3x2.descuento;
                break;
            case 'granCompra':
                if (posibleDescuentoGranCompra > 0) 
                { 
                    descuentoAplicado = posibleDescuentoGranCompra;
                } 
                break;
        }
    }

    let totalFinalConAhorro = totalSinDescuento - descuentoAplicado;
    if (totalFinalConAhorro < 0) totalFinalConAhorro = 0; 

    document.getElementById('total-sin-descuento').textContent = `$${totalSinDescuento.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    document.getElementById('descuento-aplicado').textContent = `$${descuentoAplicado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
    document.getElementById('total-final').textContent = `$${totalFinalConAhorro.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;

}

function aplicarPromocion3x2(carrito) 
{
    let descuento = 0;
    const itemsElegibles = [];

    carrito.forEach(item => 
        {
        for (let i = 0; i < item.cantidad; i++) 
            {
            itemsElegibles.push({ nombre: item.nombre, precio: item.precio });
        }
        }
    );

    itemsElegibles.sort((a, b) => a.precio - b.precio);

    for (let i = 0; i < Math.floor(itemsElegibles.length / 3); i++) 
    {
        descuento += itemsElegibles[i * 3].precio; 
    }

    return { descuento: descuento, itemsAplicados: [] }; 
}


function aplicarPromocion2daUnidad50(carrito) 
{
    let descuento = 0;

    carrito.forEach(item => 
    {
        if (item.cantidad >= 2) 
        {
            const numPares = Math.floor(item.cantidad / 2);
            descuento += numPares * (item.precio * 0.5);
        }
    }
    );

    return { descuento: descuento, itemsAplicados: [] };
}