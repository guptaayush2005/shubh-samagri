const $ = selector => document.querySelector(selector);
const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

let products = [];
let orders = [];
let settings = { whatsappNumber: '919325890000', storeName: 'Shubh Samagri' };
let section = 'overview';

const token = () => sessionStorage.getItem('ss-admin-token') || '';

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token()}`,
      ...options.headers
    }
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (response.status === 401) {
      sessionStorage.removeItem('ss-admin-token');
      showLogin();
    }
    throw new Error(result.error || 'Request poora nahi hua.');
  }
  return result;
}

function notify(message) {
  let node = $('.admin-toast');
  if (!node) {
    node = document.createElement('div');
    node.className = 'admin-toast';
    document.body.append(node);
  }
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => node.classList.remove('show'), 2600);
}

function showLogin() {
  $('#login-screen').hidden = false;
  $('#admin-app').hidden = true;
}

async function showAdmin() {
  try {
    products = await api('/api/products');
    orders = await api('/api/admin/orders');
    try {
      settings = await api('/api/settings');
    } catch {}
    
    // Save to localStorage as backup
    localStorage.setItem('ss-admin-products-cache', JSON.stringify(products));
    localStorage.setItem('ss-admin-orders-cache', JSON.stringify(orders));
    if (settings.whatsappNumber) {
      localStorage.setItem('ss-whatsapp-number', settings.whatsappNumber);
    }

    $('#login-screen').hidden = true;
    $('#admin-app').hidden = false;
    render();
  } catch (error) {
    notify(error.message);
    if (!token()) showLogin();
  }
}

function setSection(next) {
  section = next;
  document.querySelectorAll('[data-section]').forEach(button => {
    button.classList.toggle('active', button.dataset.section === next);
  });
  document.querySelectorAll('.admin-section').forEach(block => {
    block.classList.toggle('active', block.id === `section-${next}`);
  });
}

function render() {
  renderStats();
  renderProducts();
  renderOrders();
  renderSettings();
  setSection(section);
}

function renderSettings() {
  const input = $('#setting-whatsapp');
  if (input) {
    input.value = settings.whatsappNumber || localStorage.getItem('ss-whatsapp-number') || '919325890000';
  }
}

function renderStats() {
  $('#stat-products').textContent = products.length;
  $('#stat-orders').textContent = orders.length;
  const sales = orders
    .filter(order => order.paymentStatus === 'paid' || order.paymentStatus === 'cash-on-delivery')
    .reduce((sum, order) => sum + (order.total || 0), 0);
  $('#stat-sales').textContent = money(sales);
  $('#stat-pending').textContent = orders.filter(order => !['Delivered', 'Cancelled'].includes(order.status)).length;
}

function renderProducts() {
  const query = ($('#product-search')?.value || '').trim().toLowerCase();
  const filtered = products.filter(product => `${product.name} ${product.category}`.toLowerCase().includes(query));
  const tbody = $('#products-table tbody');
  if (!tbody) return;

  tbody.innerHTML = filtered.length ? filtered.map(product => `
    <tr>
      <td>
        <div class="admin-product">
          <span class="admin-emoji" style="background:${escapeHtml(product.color)}">${escapeHtml(product.icon)}</span>
          <span>
            <strong>${escapeHtml(product.name)}</strong>
            <small>${escapeHtml(product.id)}</small>
          </span>
        </div>
      </td>
      <td><span style="font-size:11px;background:#f0ebe3;padding:3px 8px;border-radius:4px">${escapeHtml(product.category)}</span></td>
      <td>
        <strong>${money(product.price)}</strong>
        ${product.mrp > product.price ? `<small style="color:#9b8d83;text-decoration:line-through;margin-left:6px">${money(product.mrp)}</small>` : ''}
      </td>
      <td class="${product.stock < 5 ? 'stock-low' : ''}">${product.stock} pcs</td>
      <td>
        <div class="admin-row-actions">
          <button data-edit="${escapeHtml(product.id)}">Edit</button>
          <button data-delete="${escapeHtml(product.id)}" style="color:#b45136">Hataein</button>
        </div>
      </td>
    </tr>
  `).join('') : '<tr><td colspan="5" class="admin-empty">Koi product nahi mila.</td></tr>';
}

function renderOrders() {
  const tbody = $('#orders-table tbody');
  if (!tbody) return;

  tbody.innerHTML = orders.length ? orders.map(order => {
    const cust = order.customer || {};
    const rawPhone = String(cust.phone || '').replace(/\D/g, '');
    const waPhone = rawPhone.startsWith('91') ? rawPhone : (rawPhone.length === 10 ? '91' + rawPhone : rawPhone);
    const waText = `*Namaste ${cust.name || 'Grahak'} ji!* 🙏\nShubh Samagri se aapka order *${order.id}* receive ho chuka hai.\n*Status:* ${order.status}\n*Total:* ${money(order.total)}\nAapka parcel jald dispatch hoga. Dhanyavaad! 🪔`;
    const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;

    return `
      <tr>
        <td>
          <strong style="color:var(--wine)">${escapeHtml(order.id)}</strong>
          <small style="display:block;color:#8a7b72;margin-top:3px">${new Date(order.createdAt).toLocaleDateString('en-IN')}</small>
        </td>
        <td>
          <strong>${escapeHtml(cust.name || '-')}</strong>
          <small style="display:block;color:#8a7b72;margin-top:3px">${escapeHtml(cust.phone || '-')}</small>
        </td>
        <td style="max-width:200px;white-space:normal;font-size:11px;color:#5a4a42">
          ${escapeHtml(cust.address || '-')}, ${escapeHtml(cust.city || '')} - ${escapeHtml(cust.pincode || '')}
        </td>
        <td style="font-size:11px;line-height:1.4">
          ${(order.items || []).map(item => `• ${escapeHtml(item.name)} × <b>${item.quantity}</b>`).join('<br>')}
        </td>
        <td>
          <strong>${money(order.total)}</strong>
          <small style="display:block;color:#8a7b72;margin-top:3px">${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Paid'}</small>
        </td>
        <td>
          <select data-order-status="${escapeHtml(order.id)}" style="font-weight:600;padding:6px;border-radius:4px">
            ${['New', 'Processing', 'Packed', 'Shipped', 'Delivered', 'Cancelled'].map(st => `
              <option ${order.status === st ? 'selected' : ''}>${st}</option>
            `).join('')}
          </select>
        </td>
        <td>
          <a class="admin-wa-btn" href="${waUrl}" target="_blank" rel="noopener" title="Customer ko WhatsApp karein">
            <span>💬</span> WhatsApp
          </a>
        </td>
      </tr>
    `;
  }).join('') : '<tr><td colspan="7" class="admin-empty">Abhi koi order nahi aaya. Customer ka naya order yahan dikhega.</td></tr>';

  tbody.querySelectorAll('[data-order-status]').forEach(select => {
    select.addEventListener('change', async () => {
      try {
        const updated = await api(`/api/admin/orders/${encodeURIComponent(select.dataset.orderStatus)}`, {
          method: 'PATCH',
          body: JSON.stringify({ status: select.value })
        });
        orders = orders.map(order => order.id === updated.id ? updated : order);
        localStorage.setItem('ss-admin-orders-cache', JSON.stringify(orders));
        renderStats();
        notify('Order status update ho gaya.');
      } catch (error) {
        notify(error.message);
      }
    });
  });
}

function openProduct(product) {
  const form = $('#product-form');
  form.reset();
  form.elements.id.value = product?.id || '';
  form.elements.name.value = product?.name || '';
  form.elements.category.value = product?.category || 'Puja Essentials';
  form.elements.categoryId.value = product?.categoryId || 'essentials';
  form.elements.price.value = product?.price ?? '';
  form.elements.mrp.value = product?.mrp ?? '';
  form.elements.stock.value = product?.stock ?? 20;
  form.elements.icon.value = product?.icon || '🪔';
  form.elements.color.value = product?.color || '#eee2cf';
  form.elements.badge.value = product?.badge || '';
  form.elements.short.value = product?.short || '';
  form.elements.description.value = product?.description || '';
  form.elements.weight.value = product?.weight || '';
  $('#modal-title').textContent = product ? 'Product badlein' : 'Naya product jodein';
  $('#product-dialog').showModal();
}

async function saveProducts(next) {
  const saved = await api('/api/admin/products', {
    method: 'PATCH',
    body: JSON.stringify({ products: next })
  });
  products = saved;
  localStorage.setItem('ss-admin-products-cache', JSON.stringify(products));
  render();
  notify('Product details save ho gayi.');
}

// LOGIN HANDLER
$('#login-form').addEventListener('submit', async event => {
  event.preventDefault();
  $('#login-error').textContent = '';
  const button = $('#login-submit');
  button.disabled = true;
  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: $('#admin-password').value })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Login nahi hua.');
    sessionStorage.setItem('ss-admin-token', result.token);
    await showAdmin();
  } catch (error) {
    $('#login-error').textContent = error.message;
  } finally {
    button.disabled = false;
  }
});

// WHATSAPP SETTINGS HANDLER
$('#whatsapp-settings-form')?.addEventListener('submit', async event => {
  event.preventDefault();
  const input = $('#setting-whatsapp');
  const number = (input.value || '').replace(/\D/g, '');
  if (number.length < 10) {
    notify('Valid WhatsApp number daalein.');
    return;
  }
  try {
    const updated = await api('/api/admin/settings', {
      method: 'PATCH',
      body: JSON.stringify({ whatsappNumber: number })
    });
    settings = updated;
    localStorage.setItem('ss-whatsapp-number', number);
    notify('Dukan ka WhatsApp number save ho gaya!');
  } catch (error) {
    notify(error.message);
  }
});

document.querySelectorAll('[data-section]').forEach(button => {
  button.addEventListener('click', () => setSection(button.dataset.section));
});

$('#product-search').addEventListener('input', renderProducts);
$('#add-product').addEventListener('click', () => openProduct(null));

$('#refresh-orders').addEventListener('click', async () => {
  try {
    orders = await api('/api/admin/orders');
    localStorage.setItem('ss-admin-orders-cache', JSON.stringify(orders));
    renderOrders();
    renderStats();
    notify('Orders refresh ho gaye.');
  } catch (error) {
    notify(error.message);
  }
});

$('#logout-admin').addEventListener('click', async () => {
  try {
    await api('/api/admin/logout', { method: 'POST' });
  } catch {}
  sessionStorage.removeItem('ss-admin-token');
  showLogin();
});

$('#product-dialog').addEventListener('click', event => {
  if (event.target === event.currentTarget) event.currentTarget.close();
});

$('#product-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const oldId = String(form.get('id') || '');
  const id = oldId || (String(form.get('name')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4));
  const product = {
    id,
    name: String(form.get('name')).trim(),
    category: String(form.get('category')).trim(),
    categoryId: String(form.get('categoryId')).trim(),
    price: Number(form.get('price')),
    mrp: Number(form.get('mrp') || form.get('price')),
    stock: Number(form.get('stock')),
    icon: String(form.get('icon') || '🪔'),
    color: String(form.get('color') || '#eee2cf'),
    badge: String(form.get('badge')).trim(),
    short: String(form.get('short')).trim(),
    description: String(form.get('description')).trim(),
    weight: String(form.get('weight')).trim()
  };
  const next = oldId ? products.map(item => item.id === oldId ? product : item) : [product, ...products];
  try {
    await saveProducts(next);
    $('#product-dialog').close();
  } catch (error) {
    notify(error.message);
  }
});

$('#products-table').addEventListener('click', async event => {
  const edit = event.target.closest('[data-edit]');
  const del = event.target.closest('[data-delete]');
  if (edit) {
    openProduct(products.find(product => product.id === edit.dataset.edit));
  }
  if (del) {
    const product = products.find(item => item.id === del.dataset.delete);
    if (!product) return;
    if (!confirm(`“${product.name}” ko catalog se hata dein?`)) return;
    try {
      await saveProducts(products.filter(item => item.id !== product.id));
    } catch (error) {
      notify(error.message);
    }
  }
});

// Auto-login check
if (token()) showAdmin();
else showLogin();
