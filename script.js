// Susantojos - script.js
// Flujo simple: agregar productos desde modal Productos. Revisar/editar y enviar desde modal Pedidos.
// WhatsApp objetivo:
const WHATSAPP = '573184468410';
const DEST_LAT = 5.058221994897297, DEST_LON = -73.9821692898724;

// Productos de muestra (edítalos)
const PRODUCTS = [
  { id: 'p1', name: 'Chocolatina Jet pequeña', price: 1200, img: 'https://via.placeholder.com/400x300?text=Jet+peq' },
  { id: 'p2', name: 'Chocolatina Jet mediana', price: 2500, img: 'https://via.placeholder.com/400x300?text=Jet+med' },
  { id: 'p3', name: 'Gomitas Trululu', price: 2500, img: 'https://via.placeholder.com/400x300?text=Gomitas' },
  { id: 'p4', name: 'Ositos de gelatina', price: 3000, img: 'https://via.placeholder.com/400x300?text=Ositos' }
];

// Estado: carrito simple { productId -> qty }
let cart = {};

// Helpers DOM
const modalProducts = document.getElementById('modalProducts');
const modalOrders = document.getElementById('modalOrders');
const productsList = document.getElementById('productsList');
const orderList = document.getElementById('orderList');
const orderTotalEl = document.getElementById('orderTotal');

// Abrir / cerrar modales
function openModal(el){ el.style.display='flex'; el.setAttribute('aria-hidden','false'); }
function closeModal(el){ el.style.display='none'; el.setAttribute('aria-hidden','true'); }
document.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', ()=> {
  closeModal(modalProducts); closeModal(modalOrders);
}));

// Botones principales
document.getElementById('btnProducts').addEventListener('click', ()=> {
  renderProductsModal(); openModal(modalProducts);
});
document.getElementById('btnOrders').addEventListener('click', ()=> {
  renderOrderModal(); openModal(modalOrders);
});
document.getElementById('btnContact').addEventListener('click', ()=> {
  document.getElementById('howGet')?.scrollIntoView({behavior:'smooth', block:'center'});
});

// Render productos en modal
function renderProductsModal(){
  productsList.innerHTML = '';
  PRODUCTS.forEach(p=>{
    const card = document.createElement('div'); card.className='product-card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.name}">
      <div class="name">${p.name}</div>
      <div class="price">$${p.price}</div>
      <div style="display:flex;gap:8px;width:100%;align-items:center">
        <input type="number" min="1" value="1" class="mini-qty" data-id="${p.id}" style="width:64px;padding:6px;border-radius:8px;border:1px solid #eee">
        <button class="btn add-mini" data-id="${p.id}">Agregar</button>
      </div>
    `;
    productsList.appendChild(card);
  });
  // listeners
  document.querySelectorAll('.add-mini').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const qtyInput = document.querySelector(`.mini-qty[data-id="${id}"]`);
      const qty = Math.max(1, parseInt(qtyInput.value) || 1);
      addToCart(id, qty);
      qtyInput.value = 1;
      flash('Agregado al pedido');
    });
  });
}

// Añadir al carrito
function addToCart(id, qty=1){
  cart[id] = (cart[id] || 0) + qty;
}

// Render modal pedidos (lista, cantidades, total)
function renderOrderModal(){
  orderList.innerHTML = '';
  const keys = Object.keys(cart);
  if(keys.length === 0){
    orderList.innerHTML = '<p class="small">No has agregado productos. Ve a Productos para añadir.</p>';
    orderTotalEl.textContent = '0';
    return;
  }
  let total = 0;
  keys.forEach(id=>{
    const p = PRODUCTS.find(x=>x.id === id);
    const qty = cart[id];
    const subtotal = p.price * qty;
    total += subtotal;
    const row = document.createElement('div'); row.className='order-item';
    row.innerHTML = `
      <div style="flex:1">
        <div style="font-weight:700">${p.name}</div>
        <small>$${p.price} c/u</small>
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <input type="number" min="1" value="${qty}" data-id="${id}">
        <div style="font-weight:700">$${subtotal}</div>
        <button class="btn" data-remove="${id}">Eliminar</button>
      </div>
    `;
    orderList.appendChild(row);
  });

  // attach events
  orderList.querySelectorAll('input[type="number"]').forEach(inp=>{
    inp.addEventListener('change', e=>{
      const id = e.target.dataset.id;
      const v = Math.max(1, parseInt(e.target.value) || 1);
      cart[id] = v;
      renderOrderModal();
    });
  });
  orderList.querySelectorAll('[data-remove]').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.remove;
      delete cart[id];
      renderOrderModal();
    });
  });

  orderTotalEl.textContent = total;
}

// Enviar por WhatsApp
document.getElementById('sendWhats').addEventListener('click', ()=>{
  const name = document.getElementById('custName').value.trim();
  const phone = document.getElementById('custPhone').value.trim();
  const address = document.getElementById('custAddress').value.trim();
  const pay = document.getElementById('custPay').value;

  if(!phone || !address){ alert('Completa teléfono y dirección.'); return; }
  const items = Object.keys(cart).map(id=>{
    const p = PRODUCTS.find(x=>x.id===id);
    return { name: p.name, qty: cart[id], subtotal: p.price * cart[id] };
  });
  if(items.length === 0){ alert('No hay productos en el pedido.'); return; }

  let text = `Hola Susantojos 👋%0AQuiero hacer un pedido:%0A%0A`;
  let total = 0;
  items.forEach(i=> { text += `- ${i.name} x${i.qty}: $${i.subtotal}%0A`; total += i.subtotal; });
  text += `%0A💰 Total: $${total}%0A%0A`;
  if(name) text += `Nombre: ${encodeURIComponent(name)}%0A`;
  text += `Dirección: ${encodeURIComponent(address)}%0A`;
  text += `Teléfono: ${encodeURIComponent(phone)}%0A`;
  text += `Pago: ${encodeURIComponent(pay)}`;

  window.open(`https://wa.me/${WHATSAPP}?text=${text}`, '_blank');

  // limpiar
  cart = {};
  renderOrderModal();
  closeModal(modalOrders);
});

// Cómo llegar (geolocalización)
document.getElementById('howGet').addEventListener('click', ()=>{
  if(!navigator.geolocation) {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${DEST_LAT},${DEST_LON}`, '_blank');
    return;
  }
  navigator.geolocation.getCurrentPosition(pos=>{
    const origin = `${pos.coords.latitude},${pos.coords.longitude}`;
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${DEST_LAT},${DEST_LON}`, '_blank');
  }, ()=> {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${DEST_LAT},${DEST_LON}`, '_blank');
  }, { timeout: 10000 });
});

// pequeña notificación
function flash(msg){
  const el = document.createElement('div'); el.textContent = msg;
  Object.assign(el.style,{position:'fixed',right:'16px',bottom:'20px',background:'#000',color:'#fff',padding:'8px 12px',borderRadius:'8px',zIndex:200});
  document.body.appendChild(el);
  setTimeout(()=> el.remove(),1200);
}

// init: año y handlers close
document.getElementById('year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-close]').forEach(b=> b.addEventListener('click', ()=> { closeModal(modalProducts); closeModal(modalOrders); }));

// Close modals on background click
document.querySelectorAll('.modal').forEach(m=>{
  m.addEventListener('click', (e)=> { if(e.target === m){ closeModal(m); } });
});
