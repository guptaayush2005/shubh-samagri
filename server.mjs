import http from 'node:http';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { readFile, writeFile, access } from 'node:fs/promises';

const root = path.dirname(fileURLToPath(import.meta.url));
const dataPath = path.join(root, 'data');
const productsFile = path.join(dataPath, 'products.json');
const ordersFile = path.join(dataPath, 'orders.json');
const mime = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8', '.json':'application/json; charset=utf-8', '.png':'image/png', '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon' };

async function loadEnv() {
  try {
    const raw = await readFile(path.join(root, '.env'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (match && !match[1].startsWith('#') && process.env[match[1]] === undefined) {
        process.env[match[1]] = match[2].replace(/^(["'])(.*)\1$/, '$2');
      }
    }
  } catch {}
}
await loadEnv();
const port = Number(process.env.PORT || 3000);
const adminPassword = process.env.ADMIN_PASSWORD || 'shubh1234';
const razorpayKeyId = process.env.RAZORPAY_KEY_ID || '';
const razorpayKeySecret = process.env.RAZORPAY_KEY_SECRET || '';
const sessions = new Set();
const pending = new Map();

let memoryProducts = null;
let memoryOrders = null;

async function readJson(file, fallback) {
  if (file === productsFile && memoryProducts) return memoryProducts;
  if (file === ordersFile && memoryOrders) return memoryOrders;
  try {
    const raw = await readFile(file, 'utf8');
    const data = JSON.parse(raw.replace(/^\uFEFF/, ''));
    if (file === productsFile) memoryProducts = data;
    if (file === ordersFile) memoryOrders = data;
    return data;
  } catch {
    return fallback;
  }
}
async function writeJson(file, value) {
  if (file === productsFile) memoryProducts = value;
  if (file === ordersFile) memoryOrders = value;
  try {
    await writeFile(file, JSON.stringify(value, null, 2) + '\n', 'utf8');
  } catch {
    // In serverless / read-only filesystem environments (like Vercel), in-memory cache holds state
  }
}
function send(res, status, value) {
  const body = JSON.stringify(value);
  res.writeHead(status, { 'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
  res.end(body);
}
function equalSecret(a, b) {
  const left = Buffer.from(String(a)); const right = Buffer.from(String(b));
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}
function isAdmin(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  return token.length > 0 && sessions.has(token);
}
async function body(req) {
  let raw = ''; for await (const chunk of req) { raw += chunk; if (raw.length > 1_000_000) throw new Error('Request is too large'); }
  try { return raw ? JSON.parse(raw) : {}; } catch { throw new Error('Invalid JSON body'); }
}
function safeProduct(input) {
  const text = value => String(value ?? '').trim().slice(0, 500);
  return {
    id: text(input.id).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50),
    name: text(input.name).slice(0, 100),
    category: text(input.category).slice(0, 60),
    categoryId: text(input.categoryId).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 30),
    price: Math.max(0, Math.round(Number(input.price) || 0)),
    mrp: Math.max(0, Math.round(Number(input.mrp) || 0)),
    icon: text(input.icon).slice(0, 8) || '🪔',
    color: /^#[0-9a-f]{6}$/i.test(input.color) ? input.color : '#eee2cf',
    badge: text(input.badge).slice(0, 30),
    short: text(input.short).slice(0, 120),
    stock: Math.max(0, Math.floor(Number(input.stock) || 0)),
    description: text(input.description),
    weight: text(input.weight).slice(0, 80)
  };
}
async function catalog() { return readJson(productsFile, []); }
async function allOrders() { return readJson(ordersFile, []); }
function totalFor(products, inputItems) {
  if (!Array.isArray(inputItems) || inputItems.length < 1) throw new Error('Cart is empty');
  const lookup = new Map(products.map(product => [product.id, product]));
  const items = inputItems.map(item => {
    const product = lookup.get(String(item.id));
    const quantity = Math.floor(Number(item.quantity));
    if (!product || quantity < 1 || quantity > 99) throw new Error('One of the selected products is unavailable');
    if (product.stock < quantity) throw new Error(`${product.name} is out of stock at this quantity`);
    return { id:product.id, name:product.name, quantity, price:product.price, lineTotal:product.price * quantity };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const shipping = subtotal >= 499 ? 0 : 49;
  return { items, subtotal, shipping, total:subtotal + shipping };
}
function customerFields(input) {
  const customer = input.customer || {};
  const name = String(customer.name || '').trim().slice(0, 100);
  const phone = String(customer.phone || '').replace(/[^\d+\s-]/g, '').trim().slice(0, 22);
  const address = String(customer.address || '').trim().slice(0, 300);
  const city = String(customer.city || '').trim().slice(0, 80);
  const pincode = String(customer.pincode || '').replace(/\D/g, '').slice(0, 10);
  if (name.length < 2 || phone.replace(/\D/g, '').length < 10 || address.length < 5 || city.length < 2 || pincode.length < 5) throw new Error('Please enter valid delivery details');
  return { name, phone, email:String(customer.email || '').trim().slice(0, 150), address, city, pincode };
}
async function createLocalOrder(customer, totals, paymentMethod, paymentStatus, paymentId = null) {
  const order = {
    id:`SS-${Date.now().toString().slice(-8)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`,
    createdAt:new Date().toISOString(), customer, ...totals, paymentMethod, paymentStatus, paymentId,
    status:paymentMethod === 'cod' ? 'New' : 'Paid'
  };
  const orders = await allOrders(); orders.unshift(order); await writeJson(ordersFile, orders);
  const products = await catalog();
  for (const item of totals.items) { const product = products.find(entry => entry.id === item.id); if (product) product.stock = Math.max(0, product.stock - item.quantity); }
  await writeJson(productsFile, products);
  return order;
}

async function handle(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const pathname = decodeURIComponent(url.pathname);
  if (pathname.startsWith('/api/')) {
    if (req.method === 'GET' && pathname === '/api/products') return send(res, 200, await catalog());
    if (req.method === 'GET' && pathname === '/api/config') return send(res, 200, { paymentsEnabled:Boolean(razorpayKeyId && razorpayKeySecret), razorpayKeyId:razorpayKeyId || null });
    if (req.method === 'POST' && pathname === '/api/admin/login') {
      const input = await body(req);
      if (!equalSecret(input.password || '', adminPassword)) return send(res, 401, { error:'Password sahi nahi hai.' });
      const token = crypto.randomBytes(32).toString('hex'); sessions.add(token);
      return send(res, 200, { token });
    }
    if (req.method === 'POST' && pathname === '/api/admin/logout') {
      const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, ''); sessions.delete(token); return send(res, 200, { ok:true });
    }
    if (pathname.startsWith('/api/admin/') && !isAdmin(req)) return send(res, 401, { error:'Admin login zaroori hai.' });
    if (req.method === 'PATCH' && pathname === '/api/admin/products') {
      const input = await body(req);
      if (!Array.isArray(input.products)) return send(res, 400, { error:'Product list bhejein.' });
      const products = input.products.map(safeProduct);
      if (products.some(product => !product.id || !product.name || !product.category || product.price <= 0) || new Set(products.map(product => product.id)).size !== products.length) return send(res, 400, { error:'Products ke naam, ID aur rates check karein.' });
      await writeJson(productsFile, products); return send(res, 200, products);
    }
    if (req.method === 'GET' && pathname === '/api/admin/orders') return send(res, 200, await allOrders());
    if (req.method === 'PATCH' && pathname.startsWith('/api/admin/orders/')) {
      const id = pathname.split('/').at(-1); const input = await body(req);
      const allowed = ['New','Processing','Packed','Shipped','Delivered','Cancelled'];
      if (!allowed.includes(input.status)) return send(res, 400, { error:'Order status valid nahi hai.' });
      const orders = await allOrders(); const order = orders.find(item => item.id === id);
      if (!order) return send(res, 404, { error:'Order nahi mila.' });
      order.status = input.status; await writeJson(ordersFile, orders); return send(res, 200, order);
    }
    if (req.method === 'POST' && pathname === '/api/payment/create-order') {
      const input = await body(req); const customer = customerFields(input); const totals = totalFor(await catalog(), input.items);
      if (input.paymentMethod === 'cod') {
        const order = await createLocalOrder(customer, totals, 'cod', 'cash-on-delivery');
        return send(res, 201, { mode:'cod', orderId:order.id });
      }
      if (!razorpayKeyId || !razorpayKeySecret) return send(res, 503, { error:'Online payment abhi set up nahi hua. Admin ko Razorpay keys add karni hongi.' });
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64') },
        body:JSON.stringify({ amount:totals.total * 100, currency:'INR', receipt:`ss_${Date.now()}`, notes:{ shop:'Shubh Samagri' } })
      });
      const gateway = await response.json();
      if (!response.ok) return send(res, 502, { error:'Payment provider se order create nahi hua. Gateway credentials check karein.' });
      pending.set(gateway.id, { customer, totals, createdAt:Date.now() });
      return send(res, 201, { mode:'razorpay', keyId:razorpayKeyId, gatewayOrderId:gateway.id, amount:gateway.amount, currency:gateway.currency, name:'Shubh Samagri' });
    }
    if (req.method === 'POST' && pathname === '/api/payment/verify') {
      const input = await body(req); const checkout = pending.get(input.razorpay_order_id);
      if (!checkout || Date.now() - checkout.createdAt > 30 * 60 * 1000) return send(res, 400, { error:'Payment session expire ho gaya. Checkout phir se shuru karein.' });
      const expected = crypto.createHmac('sha256', razorpayKeySecret).update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`).digest('hex');
      if (!equalSecret(expected, input.razorpay_signature || '')) return send(res, 400, { error:'Payment verify nahi hua.' });
      if (!/^pay_[A-Za-z0-9]+$/.test(input.razorpay_payment_id || '')) return send(res, 400, { error:'Payment ID valid nahi hai.' });
      const authorization = 'Basic ' + Buffer.from(`${razorpayKeyId}:${razorpayKeySecret}`).toString('base64');
      const paymentResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(input.razorpay_payment_id)}`, { headers:{ 'Authorization':authorization } });
      let payment = await paymentResponse.json();
      if (!paymentResponse.ok || payment.order_id !== input.razorpay_order_id || payment.amount !== checkout.totals.total * 100 || payment.currency !== 'INR') return send(res, 400, { error:'Payment ka amount ya order match nahi hua.' });
      if (payment.status === 'authorized') {
        const captureResponse = await fetch(`https://api.razorpay.com/v1/payments/${encodeURIComponent(input.razorpay_payment_id)}/capture`, {
          method:'POST', headers:{ 'Content-Type':'application/json', 'Authorization':authorization },
          body:JSON.stringify({ amount:payment.amount, currency:'INR' })
        });
        payment = await captureResponse.json();
        if (!captureResponse.ok) return send(res, 502, { error:'Payment authorize hua par capture nahi ho saka. Order ko admin se check karein.' });
      }
      if (payment.status !== 'captured' || payment.captured !== true) return send(res, 409, { error:'Payment abhi capture nahi hua. Store admin se sampark karein.' });
      const order = await createLocalOrder(checkout.customer, checkout.totals, 'razorpay', 'paid', input.razorpay_payment_id); pending.delete(input.razorpay_order_id);
      return send(res, 200, { ok:true, orderId:order.id });
    }
    return send(res, 404, { error:'API route nahi mila.' });
  }
  let filePath = pathname === '/' ? path.join(root, 'index.html') : path.resolve(root, `.${pathname}`);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) return send(res, 403, { error:'Forbidden' });
  const publicFiles = new Set([
    'index.html','shop.html','product.html','cart.html','checkout.html','about.html','admin.html',
    'assets/styles.css','assets/admin.css','assets/app.js','assets/admin.js','assets/puja-hero.png'
  ]);
  const relativePath = path.relative(root, filePath).split(path.sep).join('/');
  if (!publicFiles.has(relativePath)) return send(res, 404, { error:'Page nahi mila.' });
  try {
    await access(filePath);
    const content = await readFile(filePath);
    res.writeHead(200, { 'Content-Type':mime[path.extname(filePath).toLowerCase()] || 'application/octet-stream', 'Cache-Control':'no-store', 'X-Content-Type-Options':'nosniff' });
    res.end(content);
  } catch { res.writeHead(404, { 'Content-Type':'text/plain; charset=utf-8' }); res.end('Page nahi mila.'); }
}

export { handle };
export default handle;

const isEntrypoint = process.argv[1] && path.resolve(process.argv[1]).toLowerCase() === fileURLToPath(import.meta.url).toLowerCase();
if (isEntrypoint) {
  const server = http.createServer((req, res) => handle(req, res).catch(error => {
    if (!res.headersSent) send(res, 400, { error:error.message || 'Request process nahi hua.' });
    else res.end();
  }));
  server.listen(port, () => console.log(`Shubh Samagri is running at http://localhost:${port}`));
}
