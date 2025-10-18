// --- POPUP DE BIENVENIDA ---
window.addEventListener('load', () => {
  const popup = document.getElementById('popup');
  setTimeout(() => {
    popup.style.display = 'none';
  }, 3000); // se oculta tras 3 segundos
});

// --- FORMULARIO DE PEDIDO ---
document.getElementById('pedidoForm').addEventListener('submit', function(e) {
  e.preventDefault();

  // Captura de datos
  const producto = document.getElementById('producto').value;
  const nombre = document.getElementById('nombre').value.trim();
  const telefono = document.getElementById('telefono').value.trim();
  const direccion = document.getElementById('direccion').value.trim();
  const pago = document.getElementById('pago').value;

  // Validación básica
  if (!producto || !nombre || !telefono || !direccion || !pago) {
    alert("Por favor, completa todos los campos antes de enviar tu pedido.");
    return;
  }

  // Crear mensaje de pedido
  const mensaje = `¡Hola! Quiero hacer un pedido:
  🛍 Producto: ${producto}
  👤 Nombre: ${nombre}
  📞 Teléfono: ${telefono}
  📍 Dirección: ${direccion}
  💳 Forma de pago: ${pago}`;

  const url = `https://wa.me/573184468410?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
});

