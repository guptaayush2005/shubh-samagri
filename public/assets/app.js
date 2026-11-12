const fallbackProducts = [
  {id:'puja-kit',name:'Ghar Puja Essentials Kit',category:'Puja Kits',categoryId:'kits',price:549,mrp:699,icon:'🪔',color:'#eee2cf',badge:'Bestseller',short:'Roz ki pooja ki zaroori samagri',stock:24,description:'Ghar ki rozana pooja ke liye ek sundar, sochi-samjhi potli. Isme roli, chawal, haldi, kapoor, batti, chandan aur agarbatti shamil hain.',weight:'1 complete kit'},
  {id:'brass-diya',name:'Peetal Diya Jodi',category:'Puja Essentials',categoryId:'essentials',price:299,mrp:399,icon:'🪔',color:'#f0dfc2',badge:'Handpicked',short:'Haath se bana peetal · 2 pcs',stock:18,description:'Mazboot peetal se bana paramparik diya. Tyohar aur rozana aarti, dono ke liye badhiya.',weight:'2 diyas · 120 g'},
  {id:'cotton-wicks',name:'Rui Ki Batti',category:'Puja Essentials',categoryId:'essentials',price:79,mrp:99,icon:'🧵',color:'#efe9dc',badge:'',short:'Haath se bani · 100 batti',stock:65,description:'Saaf rui se pyaar se banayi gayi batti, jo pooja ke diye mein aaraam se jalti hai.',weight:'100 pcs'},
  {id:'camphor',name:'Shuddh Kapoor',category:'Puja Essentials',categoryId:'essentials',price:119,mrp:149,icon:'✨',color:'#ece6dc',badge:'Popular',short:'Pooja-grade · 100 g',stock:37,description:'Aarti aur pooja ke liye khushbudar kapoor. Hawa-band packet mein pack kiya gaya.',weight:'100 g'},
  {id:'havan-samagri',name:'Havan Samagri',category:'Havan & Aarti',categoryId:'havan',price:189,mrp:229,icon:'🔥',color:'#f2dfd2',badge:'',short:'Paramparik mishran · 250 g',stock:29,description:'Havan ke liye paramparik jadibootiyon aur lakdi ka sugandhit mishran.',weight:'250 g'},
  {id:'chandan-agarbatti',name:'Chandan Agarbatti',category:'Havan & Aarti',categoryId:'havan',price:99,mrp:129,icon:'🕯️',color:'#e9e3d5',badge:'Customer fave',short:'Komal khushboo · 2 packs',stock:41,description:'Pooja ke waqt ke liye shaant chandan sugandh wali agarbatti. 2 packs ka set.',weight:'2 packs · 40 sticks'},
  {id:'roli-chawal',name:'Roli Aur Akshat Set',category:'Puja Essentials',categoryId:'essentials',price:89,mrp:110,icon:'🔴',color:'#f1ded9',badge:'',short:'Kumkum, haldi aur akshat',stock:33,description:'Tilak aur pooja ke liye roli, haldi aur saaf akshat ka suvidhajanak set.',weight:'3 containers'},
  {id:'puja-thali',name:'Shubh Pooja Thali',category:'Puja Essentials',categoryId:'essentials',price:799,mrp:999,icon:'🌼',color:'#eee5cf',badge:'Handcrafted',short:'Decorated thali · 10 inch',stock:11,description:'Tyoharon aur pooja ke liye saja hua thali set. Gift dene ke liye bhi ek pyara vikalp.',weight:'10 inch thali set'},
  {id:'havan-kund',name:'Tamba Havan Kund',category:'Havan & Aarti',categoryId:'havan',price:649,mrp:799,icon:'🟠',color:'#f0dfd1',badge:'',short:'Tambe ka · ghar ke havan ke liye',stock:9,description:'Ghar par chhote havan ke liye mazboot tambe ka havan kund.',weight:'1 kund'},
  {id:'kalash',name:'Mangal Kalash',category:'Puja Essentials',categoryId:'essentials',price:449,mrp:549,icon:'🏺',color:'#e9dfd1',badge:'',short:'Paramparik peetal finish · 1 pc',stock:14,description:'Grih pravesh, tyohar aur shubh avsaron ke liye paramparik kalash.',weight:'1 kalash'},
  {id:'pooja-bell',name:'Aarti Ghanti',category:'Havan & Aarti',categoryId:'havan',price:349,mrp:449,icon:'🔔',color:'#efe2cb',badge:'',short:'Peetal finish · madhur awaaz',stock:16,description:'Aarti aur pooja ke liye madhur dhwani wali paramparik ghanti.',weight:'1 ghanti'},
  {id:'satyanarayan-kit',name:'Satyanarayan Katha Kit',category:'Puja Kits',categoryId:'kits',price:899,mrp:1099,icon:'📿',color:'#e9e2d3',badge:'Complete kit',short:'Katha ke liye chuni hui samagri',stock:8,description:'Satyanarayan katha aur pooja ke liye chuni hui samagri ka complete kit. Phal-phool sthaniya roop se lena behtar hai.',weight:'1 complete kit'}
];
let products = fallbackProducts;
const money = value => '₹' + Number(value || 0).toLocaleString('en-IN');
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const getCart = () => { try { return JSON.parse(localStorage.getItem('ss-cart') || '[]'); } catch { return []; } };
const saveCart = cart => { localStorage.setItem('ss-cart', JSON.stringify(cart)); updateCartCount(); };
const getFavorites = () => { try { return JSON.parse(localStorage.getItem('ss-favorites') || '[]'); } catch { return []; } };
async function loadProducts() {
  try { const response = await fetch('/api/products'); if (response.ok) products = await response.json(); }
  catch { /* A static preview still works with the starter catalog. */ }
  return products;
}
function toast(message) {
  let box = document.querySelector('.toast');
  if (!box) { box = document.createElement('div'); box.className = 'toast'; document.body.append(box); }
  box.textContent = message; box.classList.add('show'); clearTimeout(toast.timer); toast.timer = setTimeout(() => box.classList.remove('show'), 2400);
}
function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}
function renderHeader() {
  const header = document.getElementById('site-header'); if (!header) return;
  const current = document.body.dataset.page;
  header.innerHTML = `<div class="topline">✦ &nbsp;Delhi Ki Dukan (Arrah) · Shuddh Pooja, Hawan & Jadi Booti Samagri &nbsp;✦</div>
  <header class="site-header"><div class="head-main"><button class="mobile-menu-btn" id="mobile-menu-toggle" aria-label="Menu" aria-expanded="false">☰</button><a class="brand" href="index.html"><span class="brand-mark">ॐ</span><span><span class="brand-name">Delhi Ki Dukan</span><small class="brand-note">Chitra Toli Road · Arrah</small></span></a>
  <form class="searchbox" action="shop.html"><input name="q" placeholder="Diya, agarbatti, hawan samagri, puja kit..." aria-label="Search products"><button aria-label="Search" type="submit">⌕</button></form>
  <div class="head-actions"><a href="about.html" class="head-action"><b>✿</b><span class="label">Dukan & Pata</span></a><a href="admin.html" class="head-action" aria-label="Store Admin" title="Store Admin"><b>⚙️</b><span class="label">Admin</span></a><a href="cart.html" class="head-action cart-link" aria-label="Bag"><b>🛍️</b><span class="label">Bag</span><i class="cart-count">0</i></a></div></div>
  <div class="nav-row" id="site-nav"><nav class="main-nav"><a class="${current==='home'?'active':''}" href="index.html">Home</a><a class="${current==='shop'?'active':''}" href="shop.html">Saari samagri</a><a href="shop.html?category=kits">Puja kits</a><a href="shop.html?category=essentials">Daily pooja</a><a href="shop.html?category=havan">Havan & aarti</a><a class="${current==='about'?'active':''}" href="about.html">Dukan ka Pata & Sampark</a></nav></div></header>`;

  const btn = document.getElementById('mobile-menu-toggle');
  const nav = document.getElementById('site-nav');
  if (btn && nav) {
    btn.onclick = (e) => {
      e.stopPropagation();
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? '✕' : '☰';
    };
    nav.querySelectorAll('a').forEach(a => {
      a.onclick = () => {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '☰';
      };
    });
    document.addEventListener('click', (e) => {
      if (nav.classList.contains('open') && !nav.contains(e.target) && !btn.contains(e.target)) {
        nav.classList.remove('open');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '☰';
      }
    });
  }
}
function renderFooter() {
  const footer = document.getElementById('site-footer'); if (!footer) return;
  footer.innerHTML = `<footer class="site-footer"><div class="footer-grid"><div><a class="brand footer-brand" href="index.html"><span class="brand-mark">ॐ</span><span><span class="brand-name">Delhi Ki Dukan</span><small class="brand-note" style="color:#cdbbb0">Chitra Toli Road · Arrah</small></span></a><p class="footer-about"><strong>📍 Pata:</strong> Chitra Toli Rd, Imam Bara, Tari Mohalla, Arrah, Bihar 802301<br><strong>🕒 Timings:</strong> 10:00 AM – 8:30 PM (Som-Shani)<br><strong>📞 Phone / WhatsApp:</strong> <a href="tel:+918507648252" style="color:#f4ce82">+91 8507648252</a><br><a href="https://www.google.com/maps/search/?api=1&query=25.5648353,84.6705372" target="_blank" rel="noopener" style="color:#f4ce82;text-decoration:underline;display:inline-block;margin-top:6px">🗺️ Google Maps par Location ↗</a></p></div><div class="footer-col"><h3>Shop karein</h3><a href="shop.html">Saari samagri</a><a href="shop.html?category=kits">Puja kits</a><a href="shop.html?category=essentials">Daily pooja</a><a href="shop.html?category=havan">Havan & aarti</a></div><div class="footer-col"><h3>Madad & Admin</h3><a href="about.html#delivery">Delivery ki jaankari</a><a href="about.html#contact">Dukan Sampark</a><a href="cart.html">Aapka bag</a><a href="admin.html" style="color:#f0cd8d;font-weight:700">⚙️ Store Admin Panel</a></div><div class="footer-col"><h3>Ghar ki khushboo</h3><p>Naye products aur tyohar ki taiyaari ki khabrein paaen.</p><form class="newsletter-form" style="margin:0" onsubmit="event.preventDefault();toast('Dhanyavaad! Aapki email save ho gayi.')"><input required type="email" placeholder="Email address" aria-label="Email address"><button class="btn btn-small" type="submit">Join</button></form></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Delhi Ki Dukan (Arrah, Bihar) · Pooja, Hawan & Jadi Booti</span><span>Chitra Toli Road, Arrah · Online order delivery uplabdh</span></div></footer>`;
}
function productCard(product) {
  const favorite = getFavorites().includes(product.id);
  return `<article class="product-card"><div class="product-visual" style="--tile:${escapeHtml(product.color)}"><a class="product-image-link" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="${escapeHtml(product.name)} details"><span class="product-emblem">${escapeHtml(product.icon)}</span></a>${product.badge?`<span class="badge">${escapeHtml(product.badge)}</span>`:''}<button class="wish-btn ${favorite?'active':''}" aria-label="Favorite" data-favorite="${escapeHtml(product.id)}">${favorite?'♥':'♡'}</button><button class="quick-add" data-add="${escapeHtml(product.id)}">＋ &nbsp; BAG MEIN DALEIN</button></div><div class="product-info"><div class="product-category">${escapeHtml(product.category)}</div><h3 class="product-title"><a href="product.html?id=${encodeURIComponent(product.id)}">${escapeHtml(product.name)}</a></h3><p class="product-detail">${escapeHtml(product.short)}</p><div class="price-row"><span class="price">${money(product.price)}</span>${product.mrp>product.price?`<span class="mrp">${money(product.mrp)}</span>`:''}<span class="rating">★ 4.8 <span>(12)</span></span></div><button class="mobile-add" data-add="${escapeHtml(product.id)}">＋ &nbsp; Bag mein dalein</button></div></article>`;
}
function cards(items) { return items.map(productCard).join(''); }
function renderHome() {
  const target = document.getElementById('home-products'); if (target) target.innerHTML = cards(products.slice(0, 4));
  const target2 = document.getElementById('more-products'); if (target2) target2.innerHTML = cards(products.slice(4, 8));
}
function renderShop() {
  const params = new URLSearchParams(location.search); const category = params.get('category') || ''; const query = (params.get('q') || '').trim().toLowerCase();
  const labels = {kits:'Puja Kits',essentials:'Daily Pooja',havan:'Havan & Aarti'};
  const title = document.getElementById('shop-title'); if (title) title.textContent = labels[category] || (query ? `“${params.get('q')}” ke nateeje` : 'Saari Samagri');
  const count = document.getElementById('shop-count');
  const filtered = products.filter(product => (!category || product.categoryId === category) && (!query || `${product.name} ${product.category} ${product.short}`.toLowerCase().includes(query)));
  const sort = document.getElementById('sort-products')?.value;
  if (sort === 'low') filtered.sort((a,b)=>a.price-b.price); if (sort === 'high') filtered.sort((a,b)=>b.price-a.price); if (sort === 'name') filtered.sort((a,b)=>a.name.localeCompare(b.name));
  if (count) count.textContent = `${filtered.length} pyaar se chune products`;
  document.querySelectorAll('[data-product-count]').forEach(el => el.textContent = products.length);
  const grid = document.getElementById('shop-products'); if (grid) grid.innerHTML = filtered.length ? cards(filtered) : '<div class="empty-state"><div class="empty-icon">🔎</div><p>Is search mein koi item nahi mila. Dusra naam try karein.</p><a class="btn btn-small" href="shop.html">Saari samagri dekhein</a></div>';
  document.querySelectorAll('[data-filter]').forEach(link => link.classList.toggle('selected', (link.dataset.filter || '') === category));
}
function renderProduct() {
  const id = new URLSearchParams(location.search).get('id');
  const product = products.find(item => item.id === id) || products[0];
  const main = document.getElementById('product-detail'); if (!main || !product) return;
  document.title = `${product.name} | Shubh Samagri`;
  main.innerHTML = `<div class="breadcrumb"><a href="index.html">Home</a> &nbsp;›&nbsp; <a href="shop.html">Saari samagri</a> &nbsp;›&nbsp; ${escapeHtml(product.name)}</div><div class="product-detail-layout"><div class="product-detail-visual" style="--tile:${escapeHtml(product.color)}"><span>${escapeHtml(product.icon)}</span>${product.badge?`<i class="badge">${escapeHtml(product.badge)}</i>`:''}</div><div class="detail-copy"><div class="eyebrow">${escapeHtml(product.category)}</div><h1>${escapeHtml(product.name)}</h1><p class="product-detail">${escapeHtml(product.short)}</p><span class="rating">★ 4.8 <span>(12 grahak reviews)</span></span><div class="price-row"><span class="price">${money(product.price)}</span>${product.mrp>product.price?`<span class="mrp">${money(product.mrp)}</span><span class="rating">Bachayein ${money(product.mrp-product.price)}</span>`:''}</div><p class="desc">${escapeHtml(product.description)}</p><div class="detail-meta"><div>✓ &nbsp;${escapeHtml(product.weight)} · saaf-suthri packing</div><div style="margin-top:8px">✓ &nbsp;₹499 se upar ke order par free delivery</div><div style="margin-top:8px">✓ &nbsp;Cash on delivery available</div></div><div class="buy-row"><div class="quantity-control"><button data-qty="-1" aria-label="Decrease">−</button><span id="detail-quantity">1</span><button data-qty="1" aria-label="Increase">＋</button></div><button class="btn" data-add-detail="${escapeHtml(product.id)}">Bag mein dalein &nbsp;→</button></div><p style="font-size:10px;color:var(--muted);margin-top:13px">Stock: ${product.stock>0?'Available':'Filhaal sold out'}</p></div></div><div class="section" style="padding-top:10px"><div class="section-head"><div><div class="eyebrow">Aur bhi dekhein</div><h2>Iske saath yeh bhi</h2></div><a class="section-link" href="shop.html">Saare products →</a></div><div class="product-grid">${cards(products.filter(item=>item.id!==product.id).slice(0,4))}</div></div>`;
  let quantity = 1;
  main.querySelectorAll('[data-qty]').forEach(button => button.addEventListener('click', () => { quantity = Math.max(1, Math.min(99, quantity + Number(button.dataset.qty))); document.getElementById('detail-quantity').textContent = quantity; }));
  main.querySelector('[data-add-detail]')?.addEventListener('click', () => addToCart(product.id, quantity));
}
function totals(cart) {
  const subtotal = cart.reduce((sum, item) => { const product=products.find(p=>p.id===item.id); return sum+(product?product.price*item.quantity:0); },0);
  const shipping = subtotal===0 || subtotal>=499 ? 0 : 49;
  return {subtotal,shipping,total:subtotal+shipping};
}
function renderCart() {
  const host = document.getElementById('cart-content'); if (!host) return;
  const cart = getCart().filter(item => products.some(p=>p.id===item.id)); saveCart(cart);
  if (!cart.length) { host.innerHTML = `<div class="empty-state"><div class="empty-icon">🧺</div><h2>Aapka bag khaali hai</h2><p>Apni pooja ke liye kuch pyaari cheezein chunein.</p><a class="btn" href="shop.html">Samagri dekhein &nbsp;→</a></div>`; return; }
  const {subtotal,shipping,total} = totals(cart);
  host.innerHTML = `<div class="cart-layout"><div class="cart-table">${cart.map(item=>{const p=products.find(entry=>entry.id===item.id);return `<div class="cart-row"><div class="cart-product"><div class="cart-thumb" style="--tile:${escapeHtml(p.color)};background:${escapeHtml(p.color)}">${escapeHtml(p.icon)}</div><div><strong>${escapeHtml(p.name)}</strong><small>${escapeHtml(p.weight)}</small></div></div><div class="cart-qty"><button data-cart-qty="-1" data-id="${escapeHtml(p.id)}">−</button><span>${item.quantity}</span><button data-cart-qty="1" data-id="${escapeHtml(p.id)}">＋</button></div><div class="cart-line-price">${money(p.price*item.quantity)}</div><button class="remove-item" aria-label="Remove" data-remove="${escapeHtml(p.id)}">×</button></div>`}).join('')}<p style="margin-top:17px"><a class="section-link" href="shop.html">← &nbsp;Aur samagri dekhein</a></p></div><aside class="order-card"><h3>Order ka hisaab</h3><div class="summary-line"><span>Items ka total</span><span>${money(subtotal)}</span></div><div class="summary-line"><span>Delivery</span><span>${shipping?money(shipping):'Free'}</span></div>${subtotal<499?`<div class="notice">${money(499-subtotal)} aur add karein, delivery bilkul free!</div>`:''}<div class="summary-line summary-total"><span>Total</span><span>${money(total)}</span></div><a class="btn" href="checkout.html">Checkout karein &nbsp;→</a><small>Secure checkout · Cash on delivery bhi available</small></aside></div>`;
  host.querySelectorAll('[data-cart-qty]').forEach(button => button.addEventListener('click',()=>{const item=cart.find(entry=>entry.id===button.dataset.id);item.quantity=Math.max(1,Math.min(99,item.quantity+Number(button.dataset.cartQty)));saveCart(cart);renderCart();}));
  host.querySelectorAll('[data-remove]').forEach(button=>button.addEventListener('click',()=>{saveCart(cart.filter(item=>item.id!==button.dataset.remove));renderCart();}));
}
async function renderCheckout() {
  const host = document.getElementById('checkout-content'); if (!host) return;
  const cart = getCart().filter(item=>products.some(p=>p.id===item.id)); const summary=totals(cart);
  if (!cart.length) { host.innerHTML='<div class="empty-state"><div class="empty-icon">🧺</div><h2>Checkout ke liye bag mein items nahi hain</h2><a class="btn" href="shop.html">Samagri dekhein →</a></div>'; return; }
  let config={paymentsEnabled:false}; try { const response=await fetch('/api/config'); if(response.ok)config=await response.json(); } catch{}
  host.innerHTML=`<form id="place-order-form" class="checkout-layout"><div><section class="form-section"><div class="eyebrow">Aapka order</div><h2>Delivery details</h2><div class="form-grid"><label class="field"><span>Poora naam *</span><input required name="name" autocomplete="name" minlength="2" placeholder="Aapka naam"></label><label class="field"><span>Mobile number *</span><input required name="phone" autocomplete="tel" inputmode="tel" pattern="[0-9+ ()-]{10,20}" placeholder="10 digit mobile number"></label><label class="field full"><span>Email <small style="font-weight:400;color:var(--muted)">(optional)</small></span><input name="email" type="email" autocomplete="email" placeholder="naam@example.com"></label><label class="field full"><span>Poora address *</span><textarea required name="address" autocomplete="street-address" minlength="5" placeholder="House no., gali, area..."></textarea></label><label class="field"><span>Shehar *</span><input required name="city" autocomplete="address-level2" placeholder="Shehar"></label><label class="field"><span>PIN code *</span><input required name="pincode" autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5,10}" placeholder="PIN code"></label></div></section><section class="form-section"><div class="eyebrow">Payment</div><h2>Payment ka tareeka</h2>${config.paymentsEnabled?`<label class="payment-option"><input type="radio" name="paymentMethod" value="razorpay" checked><span><strong>Online payment</strong><small>UPI, cards, net banking ya wallets · Razorpay se secure payment</small></span></label>`:`<div class="notice">Online payment ko chalu karne ke liye admin ko Razorpay keys set karni hongi. Filhal Cash on Delivery chunein.</div>`}<label class="payment-option"><input type="radio" name="paymentMethod" value="cod" ${config.paymentsEnabled?'':'checked'}><span><strong>Cash on Delivery</strong><small>Parcel milne par payment karein</small></span></label></section><button class="btn" id="submit-order" type="submit">${config.paymentsEnabled?'Order karein aur payment par jaayein':'Cash on Delivery ka order dein'} &nbsp;→</button><p style="font-size:10px;color:var(--muted);margin-top:11px">Order details admin panel mein save hongi. Online payment Razorpay se verify hoti hai.</p></div><aside class="order-card"><h3>Aapki potli</h3><div class="checkout-items">${cart.map(item=>{const p=products.find(entry=>entry.id===item.id);return `<div class="checkout-item"><div class="cart-thumb" style="background:${escapeHtml(p.color)}">${escapeHtml(p.icon)}</div><div><strong>${escapeHtml(p.name)}</strong><small>${item.quantity} × ${money(p.price)}</small></div><span class="line-end">${money(p.price*item.quantity)}</span></div>`}).join('')}</div><div class="summary-line" style="margin-top:16px"><span>Items ka total</span><span>${money(summary.subtotal)}</span></div><div class="summary-line"><span>Delivery</span><span>${summary.shipping?money(summary.shipping):'Free'}</span></div><div class="summary-line summary-total"><span>Total</span><span>${money(summary.total)}</span></div><small>₹499 se upar ke order par free delivery</small></aside></form>`;
  host.querySelector('#place-order-form').addEventListener('submit', placeOrder);
}
async function placeOrder(event) {
  event.preventDefault(); const form=event.currentTarget; const submit=form.querySelector('#submit-order'); submit.disabled=true; submit.textContent='Order tayyar ho raha hai...';
  const data=new FormData(form); const customer={name:data.get('name'),phone:data.get('phone'),email:data.get('email'),address:data.get('address'),city:data.get('city'),pincode:data.get('pincode')};
  const paymentMethod=data.get('paymentMethod')||'cod'; const items=getCart(); const summary=totals(items);
  try {
    const response=await fetch('/api/payment/create-order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({customer,items,paymentMethod})}); const result=await response.json();
    if(!response.ok) throw new Error(result.error||'Order create nahi hua.');
    const meta = { customer, items, summary, whatsappNumber: result.whatsappNumber };
    if(result.mode==='cod'){ finishOrder(result.orderId,'Cash on Delivery', meta); return; }
    const script=document.createElement('script'); script.src='https://checkout.razorpay.com/v1/checkout.js'; script.onload=()=>{
      const gateway=new Razorpay({key:result.keyId,amount:result.amount,currency:result.currency,name:result.name,description:'Puja samagri order',order_id:result.gatewayOrderId,prefill:{name:customer.name,email:customer.email,contact:customer.phone},theme:{color:'#6e2924'},handler:async response=>{
        try{const verified=await fetch('/api/payment/verify',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(response)});const confirmation=await verified.json();if(!verified.ok)throw new Error(confirmation.error);finishOrder(confirmation.orderId,'Online payment', meta);}
        catch(error){toast(error.message||'Payment verify nahi hua.');submit.disabled=false;submit.textContent='Phir se koshish karein';}
      }});
      gateway.on('payment.failed',()=>{toast('Payment poora nahi hua. Aap dobara koshish kar sakte hain.');submit.disabled=false;submit.textContent='Phir se koshish karein';}); gateway.open();
    }; script.onerror=()=>{toast('Payment window load nahi hui. Internet connection check karein.');submit.disabled=false;submit.textContent='Phir se koshish karein';}; document.head.append(script);
  } catch(error){toast(error.message||'Kuch gadbad hui.');submit.disabled=false;submit.textContent='Order phir se bhejein';}
}
function formatWhatsAppOrder(orderId, method, meta) {
  const customer = meta?.customer || {};
  const items = meta?.items || [];
  const summary = meta?.summary || { total: 0 };
  const lines = [
    `*Namaste Delhi Ki Dukan (Arrah)!* 🙏`,
    `Mera naya order details:`,
    ``,
    `📦 *Order ID:* ${orderId}`,
    `👤 *Grahak:* ${customer.name || '-'}`,
    `📞 *Mobile:* ${customer.phone || '-'}`,
    `📍 *Pata:* ${customer.address || '-'}, ${customer.city || ''} - ${customer.pincode || ''}`,
    ``,
    `🛒 *Items:*`
  ];
  items.forEach(item => {
    const p = products.find(prod => prod.id === item.id) || item;
    lines.push(`• ${p.name || item.name} (${item.quantity} pcs) - ₹${((p.price || item.price || 0) * item.quantity).toLocaleString('en-IN')}`);
  });
  lines.push(``);
  lines.push(`💰 *Total Amount:* ₹${Number(summary.total || 0).toLocaleString('en-IN')}`);
  lines.push(`💳 *Payment Method:* ${method}`);
  lines.push(``);
  lines.push(`Kripya mera order confirm karein! 🪔`);
  return lines.join('\n');
}
function finishOrder(orderId, method, meta) {
  saveCart([]);
  const waNumber = String(meta?.whatsappNumber || localStorage.getItem('ss-whatsapp-number') || '919325890000').replace(/\D/g, '');
  const message = formatWhatsAppOrder(orderId, method, meta);
  const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  document.getElementById('checkout-content').innerHTML = `
    <div class="success-panel">
      <div class="success-icon">🪔</div>
      <div class="eyebrow">Order confirm ho gaya</div>
      <h1>Dhanyavaad, aapka order mil gaya!</h1>
      <p>Order number: <strong style="color:var(--wine)">${escapeHtml(orderId)}</strong></p>
      <p>${escapeHtml(method)} · Hamari team jald aapka parcel tayyar karegi.</p>

      <div class="whatsapp-box">
        <div style="font-size:36px;margin-bottom:8px">💬</div>
        <h3>Order WhatsApp par bhejein</h3>
        <p>Dukan wale ko apna order turant WhatsApp par bhej kar confirm karein!</p>
        <a class="btn btn-whatsapp" href="${waUrl}" target="_blank" rel="noopener">
          <span>💬</span> WhatsApp par Order Confirm Karein &nbsp;→
        </a>
      </div>

      <div style="margin-top:24px;display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
        <a class="btn secondary btn-small" href="shop.html">Aur samagri dekhein</a>
        <a class="btn secondary btn-small" href="admin.html">Store Admin dekhein</a>
      </div>
    </div>
  `;
  document.title = 'Order confirm · Shubh Samagri';
}
function addToCart(id, quantity=1) {
  const product=products.find(item=>item.id===id); if(!product)return;
  const cart=getCart(); const item=cart.find(entry=>entry.id===id); if(item)item.quantity=Math.min(99,item.quantity+quantity);else cart.push({id,quantity});
  saveCart(cart); toast(`${product.name} aapke bag mein aa gaya.`);
}
document.addEventListener('click', event=>{
  const add=event.target.closest('[data-add]'); if(add){event.preventDefault();event.stopPropagation();addToCart(add.dataset.add);}
  const favorite=event.target.closest('[data-favorite]'); if(favorite){event.preventDefault();event.stopPropagation();const current=getFavorites();const id=favorite.dataset.favorite;const next=current.includes(id)?current.filter(item=>item!==id):[...current,id];localStorage.setItem('ss-favorites',JSON.stringify(next));favorite.classList.toggle('active',next.includes(id));favorite.textContent=next.includes(id)?'♥':'♡';}
});
document.addEventListener('DOMContentLoaded',async()=>{
  renderHeader();renderFooter();await loadProducts();updateCartCount();
  const page=document.body.dataset.page;
  if(page==='home')renderHome();if(page==='shop'){renderShop();document.getElementById('sort-products')?.addEventListener('change',renderShop);}
  if(page==='product')renderProduct();if(page==='cart')renderCart();if(page==='checkout')await renderCheckout();
});

