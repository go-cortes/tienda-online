// Filtros de productos para la tienda de mascotas

// Variables globales para filtros
let productosFiltrados = [];
let productosMostrados = 6;

// Inicialización de la página de productos
document.addEventListener('DOMContentLoaded', function() {
    productosFiltrados = [...productos];
    mostrarProductos();
    configurarFiltros();
    configurarVista();
});

// Configurar event listeners para filtros
function configurarFiltros() {
    document.getElementById('search-input').addEventListener('input', filtrarProductos);
    document.getElementById('category-filter').addEventListener('change', filtrarProductos);
    document.getElementById('price-filter').addEventListener('change', filtrarProductos);
    document.getElementById('pet-type-filter').addEventListener('change', filtrarProductos);
}

/**
 * CONFIGURAR BOTONES DE VISTA (GRILLA/LISTA)
 * 
 * Esta función permite al usuario cambiar entre vista de grilla y vista de lista.
 * Cambia las clases CSS para mostrar los productos de diferentes maneras.
 */
function configurarVista() {
    // Obtener referencias a los elementos del DOM
    const gridView = document.getElementById('grid-view'); // Radio button para vista grilla
    const listView = document.getElementById('list-view'); // Radio button para vista lista
    const container = document.getElementById('products-container'); // Contenedor de productos
    
    // Configurar evento para vista de grilla
    gridView.addEventListener('change', function() {
        if (this.checked) {
            // Aplicar clases para vista de grilla (4 columnas en desktop)
            container.className = 'row g-4';
        }
    });
    
    // Configurar evento para vista de lista
    listView.addEventListener('change', function() {
        if (this.checked) {
            // Aplicar clases para vista de lista (1 columna)
            container.className = 'row g-2';
            
            // Cambiar todas las tarjetas para que ocupen el ancho completo
            const cards = container.querySelectorAll('.col-lg-3');
            cards.forEach(card => {
                card.className = 'col-12 mb-3'; // Una tarjeta por fila
            });
        }
    });
}

/**
 * FILTRAR PRODUCTOS SEGÚN CRITERIOS SELECCIONADOS
 * 
 * Esta es la función principal de filtrado. Toma todos los criterios
 * seleccionados por el usuario y filtra el arreglo de productos.
 * 
 * CRITERIOS DE FILTRADO:
 * - Búsqueda por texto (nombre y descripción)
 * - Categoría del producto
 * - Rango de precios
 * - Tipo de mascota
 */
function filtrarProductos() {
    // Obtener los valores de todos los filtros
    const busqueda = document.getElementById('search-input').value.toLowerCase();
    const categoria = document.getElementById('category-filter').value;
    const precio = document.getElementById('price-filter').value;
    const tipoMascota = document.getElementById('pet-type-filter').value;
    
    // Filtrar productos usando el método filter()
    productosFiltrados = productos.filter(producto => {
        // FILTRO DE BÚSQUEDA POR TEXTO
        // Busca en el nombre y descripción del producto
        const coincideBusqueda = !busqueda || 
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.descripcion.toLowerCase().includes(busqueda);
        
        // FILTRO DE CATEGORÍA
        // Si no hay categoría seleccionada, muestra todos
        const coincideCategoria = !categoria || producto.categoria === categoria;
        
        // FILTRO DE PRECIO
        let coincidePrecio = true;
        if (precio) {
            // Dividir el rango de precios (ej: "10000-20000" o "50000+")
            const [min, max] = precio.split('-').map(p => p === '+' ? Infinity : parseInt(p));
            
            if (max === undefined) {
                // Solo precio mínimo (ej: "50000+")
                coincidePrecio = producto.precio >= min;
            } else {
                // Rango de precios (ej: "10000-20000")
                coincidePrecio = producto.precio >= min && producto.precio <= max;
            }
        }
        
        // FILTRO DE TIPO DE MASCOTA
        // Incluye productos que coincidan con el tipo o que sean para "ambos"
        const coincideTipo = !tipoMascota || producto.tipo === tipoMascota || producto.tipo === 'ambos';
        
        // El producto pasa el filtro si cumple TODOS los criterios
        return coincideBusqueda && coincideCategoria && coincidePrecio && coincideTipo;
    });
    
    // Actualizar la vista con los productos filtrados
    mostrarProductos();
    actualizarContador();
}

/**
 * MOSTRAR LOS PRODUCTOS FILTRADOS
 * 
 * Esta función se encarga de mostrar los productos en la página.
 * Incluye lógica para paginación y manejo de casos sin resultados.
 */
function mostrarProductos() {
    // Obtener referencias a los elementos del DOM
    const container = document.getElementById('products-container'); // Contenedor principal
    const noResults = document.getElementById('no-results'); // Mensaje de "sin resultados"
    const loadMoreContainer = document.getElementById('load-more-container'); // Botón "Cargar más"
    
    // Limpiar el contenedor antes de mostrar nuevos productos
    container.innerHTML = '';
    
    // Verificar si hay productos que mostrar
    if (productosFiltrados.length === 0) {
        // Mostrar mensaje de "no se encontraron resultados"
        noResults.style.display = 'block';
        loadMoreContainer.style.display = 'none';
        return; // Terminar la función aquí
    }
    
    // Ocultar mensaje de "sin resultados" si hay productos
    noResults.style.display = 'none';
    
    // PAGINACIÓN: Mostrar solo una cantidad limitada de productos inicialmente
    // slice(0, productosMostrados) toma solo los primeros N productos
    const productosAMostrar = productosFiltrados.slice(0, productosMostrados);
    
    // Crear y mostrar cada producto
    productosAMostrar.forEach(producto => {
        const tarjetaProducto = crearTarjetaProducto(producto);
        container.appendChild(tarjetaProducto);
    });
    
    // Mostrar u ocultar botón "Cargar más" según si hay más productos
    if (productosFiltrados.length > productosMostrados) {
        // Hay más productos, mostrar el botón
        loadMoreContainer.style.display = 'block';
        document.getElementById('load-more-btn').onclick = cargarMasProductos;
    } else {
        // No hay más productos, ocultar el botón
        loadMoreContainer.style.display = 'none';
    }
}

/**
 * CREAR TARJETA DE PRODUCTO
 * 
 * Esta función crea el HTML completo de una tarjeta de producto.
 * Es idéntica a la función del script principal, pero está duplicada
 * aquí para que funcione independientemente en la página de productos.
 * 
 * ¿POR QUÉ ESTÁ DUPLICADA?
 * - Cada página necesita su propia versión de la función
 * - Evita dependencias entre archivos
 * - Permite personalizaciones específicas por página
 */
function crearTarjetaProducto(producto) {
    // Crear el contenedor principal de la tarjeta
    const columna = document.createElement('div');
    
    // Asignar clases de Bootstrap para el layout responsivo
    columna.className = 'col-lg-3 col-md-6 mb-4';
    
    // Formatear el precio como moneda chilena
    const precioFormateado = formatearPrecio(producto.precio);
    
    // Determinar el ícono según el tipo de mascota
    const iconoTipo = producto.tipo === 'perro' ? 'bi-dog' : 
                     producto.tipo === 'gato' ? 'bi-cat' : 'bi-heart-pulse-fill';
    
    // Determinar el color según el tipo de mascota
    const colorTipo = producto.tipo === 'perro' ? '#ff6b35' : 
                     producto.tipo === 'gato' ? '#4ecdc4' : '#45b7d1';
    
    // Crear el HTML completo de la tarjeta usando template literals
    columna.innerHTML = `
        <div class="card h-100">
            <div class="position-relative">
                <!-- Imagen del producto con fallback -->
                <img src="${producto.imagen}" 
                     class="card-img-top" 
                     alt="${producto.nombre}"
                     onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlbiBubyBkaXNwb25pYmxlPC90ZXh0Pjwvc3ZnPg=='">
                
                <!-- Badge de tipo de mascota (esquina superior derecha) -->
                <div class="position-absolute top-0 end-0 m-2">
                    <span class="badge rounded-pill" style="background: ${colorTipo}; color: white;">
                        <i class="bi ${iconoTipo} me-1"></i>
                        ${producto.tipo.charAt(0).toUpperCase() + producto.tipo.slice(1)}
                    </span>
                </div>
                
                <!-- Badge de categoría (esquina superior izquierda) -->
                <div class="position-absolute top-0 start-0 m-2">
                    <span class="badge rounded-pill bg-warning text-dark">
                        <i class="bi bi-tag me-1"></i>
                        ${producto.categoria.charAt(0).toUpperCase() + producto.categoria.slice(1)}
                    </span>
                </div>
            </div>
            
            <!-- Cuerpo de la tarjeta -->
            <div class="card-body d-flex flex-column">
                <h5 class="card-title fw-bold">${producto.nombre}</h5>
                <p class="card-text text-muted flex-grow-1">${producto.descripcion}</p>
                
                <!-- Sección inferior (precio, estrellas y botón) -->
                <div class="mt-auto">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <span class="h4 mb-0" style="color: ${colorTipo}; font-weight: 700;">${precioFormateado}</span>
                        <div class="d-flex">
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            <i class="bi bi-star-fill text-warning me-1"></i>
                            <i class="bi bi-star-fill text-warning"></i>
                        </div>
                    </div>
                    <button class="btn btn-primary btn-producto w-100" 
                            onclick="agregarAlCarrito(${producto.id})"
                            style="background: linear-gradient(45deg, ${colorTipo}, ${colorTipo}dd);">
                        <i class="bi bi-cart-plus me-2"></i>
                        Añadir al Carrito
                    </button>
                </div>
            </div>
        </div>
    `;
    
    return columna;
}

/**
 * FORMATEAR PRECIO COMO MONEDA CHILENA
 * 
 * Convierte un número en formato de moneda chilena.
 * Ejemplo: 29990 → "$29.990"
 */
function formatearPrecio(precio) {
    return '$' + precio.toLocaleString('es-CL');
}

/**
 * CARGAR MÁS PRODUCTOS (PAGINACIÓN)
 * 
 * Esta función se ejecuta cuando el usuario hace clic en "Cargar más".
 * Aumenta la cantidad de productos mostrados y actualiza la vista.
 */
function cargarMasProductos() {
    // Aumentar la cantidad de productos a mostrar
    productosMostrados += 6;
    
    // Actualizar la vista con más productos
    mostrarProductos();
    
    // Actualizar el contador de resultados
    actualizarContador();
}

/**
 * ACTUALIZAR CONTADOR DE RESULTADOS
 * 
 * Actualiza el número que muestra cuántos productos se encontraron
 * después de aplicar los filtros.
 */
function actualizarContador() {
    const contador = document.getElementById('results-count');
    contador.textContent = productosFiltrados.length;
}

/**
 * LIMPIAR TODOS LOS FILTROS
 * 
 * Esta función resetea todos los filtros a su estado inicial
 * y muestra todos los productos nuevamente.
 */
function clearFilters() {
    // Limpiar el campo de búsqueda
    document.getElementById('search-input').value = '';
    
    // Resetear todos los dropdowns a su valor por defecto
    document.getElementById('category-filter').value = '';
    document.getElementById('price-filter').value = '';
    document.getElementById('pet-type-filter').value = '';
    
    // Resetear la paginación
    productosMostrados = 6;
    
    // Aplicar los filtros (que ahora están vacíos, así que muestra todos)
    filtrarProductos();
}

/**
 * AGREGAR PRODUCTO AL CARRITO
 * 
 * Esta función maneja el evento de agregar un producto al carrito.
 * Es idéntica a la función del script principal.
 */
function agregarAlCarrito(productoId) {
    // Buscar el producto por su ID
    const producto = productos.find(p => p.id === productoId);
    
    if (producto) {
        // Mostrar mensaje de confirmación
        mostrarMensaje(`¡${producto.nombre} agregado al carrito!`, 'success');
        
        // Registrar en consola para debugging
        console.log('Producto agregado al carrito:', producto);
    }
}

/**
 * MOSTRAR MENSAJE TEMPORAL
 * 
 * Esta función muestra un mensaje temporal al usuario.
 * Es idéntica a la función del script principal.
 */
function mostrarMensaje(mensaje, tipo = 'info') {
    // Crear elemento div para el mensaje
    const mensajeElement = document.createElement('div');
    
    // Asignar clases de Bootstrap según el tipo
    mensajeElement.className = `alert alert-${tipo === 'success' ? 'success' : tipo === 'error' ? 'danger' : 'info'} alert-dismissible fade show position-fixed`;
    
    // Posicionar en la esquina superior derecha
    mensajeElement.style.cssText = 'top: 100px; right: 20px; z-index: 9999; min-width: 300px;';
    
    // Crear el contenido HTML del mensaje
    mensajeElement.innerHTML = `
        ${mensaje}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    // Agregar el mensaje al body
    document.body.appendChild(mensajeElement);
    
    // Remover automáticamente después de 3 segundos
    setTimeout(() => {
        if (mensajeElement.parentNode) {
            mensajeElement.remove();
        }
    }, 3000);
}

