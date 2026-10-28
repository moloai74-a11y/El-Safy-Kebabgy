/* منطق الموقع — البيانات والإعدادات في data.js */
const $ = s => document.querySelector(s);
let cart = {}, pick = {}, activeCat = "الكل", query = "";
try { cart = JSON.parse(localStorage.getItem("safi_cart")) || {}; } catch (e) { cart = {}; }
Object.keys(cart).forEach(id => { if (!PRODUCTS.find(p => p.id == id)) delete cart[id]; });

document.querySelectorAll("img[data-logo]").forEach(i => i.src = LOGO_SRC);
{ const l = document.createElement("link"); l.rel = "icon"; l.href = FAVICON; document.head.appendChild(l); }
const waNumber = () => { let n = RESTAURANT_PHONE.replace(/\D/g, ""); if (n.startsWith("00")) n = n.slice(2); if (n.startsWith("0")) n = "20" + n.slice(1); return n; };
$("#callLink").href = "tel:+" + waNumber(); $("#waLink").href = "https://wa.me/" + waNumber();
$("#footPhone").textContent = RESTAURANT_PHONE; $("#demo").hidden = !SHOW_DEMO_NOTICE;
const fee = typeof DELIVERY_FEE === "number" ? DELIVERY_FEE : 0;
document.querySelectorAll(".feeNote").forEach(n => n.textContent = fee ? `رسوم التوصيل ${fee} ${CURRENCY} مضافة للإجمالي.` : "رسوم التوصيل غير محسوبة.");

const money = n => `${n} ${CURRENCY}`;
const byId = id => PRODUCTS.find(p => p.id == id);
const isMobile = () => matchMedia("(max-width:860px)").matches;
const CARTIC = '<svg class="ic"><use href="#i-cart"/></svg>';
const ph = cat => "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 250"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#eef2fb"/><stop offset="1" stop-color="#d7e0f5"/></linearGradient></defs><rect width="400" height="250" fill="url(#g)"/><text x="200" y="160" font-size="100" text-anchor="middle">${EMOJI[cat] || "🍽️"}</text></svg>`);
const imgTag = p => `<img src="${p.img || ph(p.cat)}" alt="${p.name}" width="400" height="250" loading="lazy" onerror="this.onerror=null;this.src='${ph(p.cat)}'">`;
const TRASH = '<svg class="ic"><use href="#i-trash"/></svg>';
const norm = s => s.toLowerCase().replace(/\s+/g, " ").trim();
const save = () => { try { localStorage.setItem("safi_cart", JSON.stringify(cart)); } catch (e) {} };
const toEn = s => s.replace(/[٠-٩]/g, d => "٠١٢٣٤٥٦٧٨٩".indexOf(d));
function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("show"); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove("show"), 2600); }

/* ===== المنيو ===== */
function filterProducts() {
  const q = norm(query);
  return PRODUCTS.filter(p => (activeCat === "الكل" || p.cat === activeCat) && (!q || norm(p.name + " " + p.desc).includes(q)));
}
function renderProducts() {
  const list = filterProducts();
  $("#grid").innerHTML = list.map((p, i) => `<article class="card p" style="animation-delay:${Math.min(i, 10) * 35}ms">${imgTag(p)}
    <h3>${p.name}</h3><div class="price">${money(p.price)}</div>
    <div class="qty"><button data-a="pminus" data-id="${p.id}" aria-label="تقليل">−</button><span>${pick[p.id] || 1}</span><button data-a="pplus" data-id="${p.id}" aria-label="زيادة">+</button></div>
    <button class="btn red" data-a="add" data-id="${p.id}"><span>أضف إلى السلة</span>${CARTIC}</button></article>`).join("");
  $("#noRes").hidden = list.length > 0;
  $("#secTitle").textContent = activeCat === "الكل" ? "أشهر الأصناف" : activeCat;
}
function renderChips() {
  $("#chips").innerHTML = ["الكل", ...CATEGORIES].map(c => `<button class="chip ${c === activeCat ? "on" : ""}" data-cat="${c}"><svg class="ic"><use href="#i-${ICON[c]}"/></svg><span>${c}</span></button>`).join("");
}
function setCat(c) { activeCat = c; renderChips(); renderProducts(); }

/* ===== السلة ===== */
function addToCart(id, n = 1) { cart[id] = (cart[id] || 0) + n; save(); renderCart(); }
function updateQuantity(id, d) { cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id]; save(); renderCart(); }
function removeFromCart(id) { delete cart[id]; save(); renderCart(); }
const items = () => Object.keys(cart).map(id => { const p = byId(id); return {p, q: cart[id], t: p.price * cart[id]}; });
const calculateSubtotal = () => items().reduce((s, i) => s + i.t, 0);
const grand = () => calculateSubtotal() + (calculateSubtotal() ? fee : 0);
const pieces = () => items().reduce((s, i) => s + i.q, 0);
function renderCart() {
  const its = items(), pcs = pieces();
  $("#badge").textContent = pcs; $("#badge").classList.add("pop"); setTimeout(() => $("#badge").classList.remove("pop"), 200);
  $("#mCount").textContent = pcs; $("#mTotal").textContent = money(grand());
  $("#mbar").hidden = !its.length || !isMobile(); document.body.classList.toggle("pad", its.length > 0 && isMobile());
  $("#cKinds").textContent = its.length; $("#cPcs").textContent = pcs; $("#cTotal").textContent = money(grand());
  $("#cartFoot").hidden = !its.length;
  $("#cartBody").innerHTML = its.length ? its.map(({p, q, t}) => `<div class="ci">${imgTag(p)}<div><b>${p.name}</b><span class="price">${money(p.price)}</span>
    <div class="row"><div class="qty"><button data-a="minus" data-id="${p.id}" aria-label="تقليل">−</button><span>${q}</span><button data-a="plus" data-id="${p.id}" aria-label="زيادة">+</button></div><b>${money(t)}</b></div></div>
    <button class="del" data-a="del" data-id="${p.id}" aria-label="حذف ${p.name}">${TRASH}</button></div>`).join("")
    : `<div class="mt"><svg class="ic" style="width:3.5rem;height:3.5rem;color:#bbb"><use href="#i-cart"/></svg><p>سلة الطلبات فارغة</p><button class="btn red" data-close style="margin-top:12px">تصفح المنيو</button></div>`;
  if (!$("#checkout").hidden) renderCheckout();
}
function openCart() { $("#cart").hidden = false; $("#overlay").hidden = false; }
function closeCart() { $("#cart").hidden = true; $("#checkout").hidden = true; $("#overlay").hidden = true; $("#nav").classList.remove("open"); document.body.style.overflow = ""; }
function cancelOrder() {
  if (pieces() && !confirm("هل تريد إلغاء الطلب ومسح كل الأصناف من السلة؟")) return;
  cart = {}; save(); closeCart(); $("#form").reset(); clearErrors(); renderCart(); toast("تم إلغاء الطلب");
}

/* ===== إتمام الطلب ===== */
function renderCheckout() {
  $("#coItems").innerHTML = items().map(({p, q, t}) => `<div class="ci">${imgTag(p)}<div><b>${p.name}</b><span>${q} × ${money(p.price)}</span></div><b class="price">${money(t)}</b></div>`).join("");
  $("#coTotal").textContent = money(grand());
  $("#preview").textContent = buildWhatsAppMessage();
}
function openCheckout() {
  if (!pieces()) return toast("السلة فارغة، أضف أصنافًا أولًا");
  $("#cart").hidden = true; $("#checkout").hidden = false; $("#overlay").hidden = true; document.body.style.overflow = "hidden"; renderCheckout();
}
function clearErrors() { ["eName", "ePhone", "eAddr"].forEach(i => $("#" + i).textContent = ""); }
function validateCheckoutForm() {
  clearErrors(); let ok = true;
  const name = $("#fName").value.trim(), phone = toEn($("#fPhone").value).replace(/[\s-]/g, ""), addr = $("#fAddr").value.trim();
  if (name.length < 3) { $("#eName").textContent = "من فضلك أدخل اسمك الكامل"; ok = false; }
  if (!phone) { $("#ePhone").textContent = "من فضلك أدخل رقم الهاتف"; ok = false; }
  else if (!/^(?:\+?20|0)?1[0125]\d{8}$/.test(phone)) { $("#ePhone").textContent = "رقم الهاتف غير صالح (مثال: 01012345678)"; ok = false; }
  if (addr.length < 8) { $("#eAddr").textContent = "من فضلك أدخل عنوان التوصيل بالتفصيل"; ok = false; }
  return ok;
}
function buildWhatsAppMessage() {
  const g = id => $(id).value.trim();
  const lines = items().map(({p, q, t}) => `${p.name}\nالكمية: ${q} | سعر الوحدة: ${p.price} ${CURRENCY}\nإجمالي الصنف: ${t} ${CURRENCY}`);
  return [`طلب جديد من ${RESTAURANT_NAME}`, ``, `بيانات العميل:`, `الاسم: ${g("#fName") || "—"}`, `رقم الهاتف: ${toEn(g("#fPhone")) || "—"}`, `العنوان: ${g("#fAddr") || "—"}`, ``,
    `تفاصيل الطلب:`, lines.join("\n\n"), ``, `عدد القطع: ${pieces()}`,
    ...(fee ? [`رسوم التوصيل: ${fee} ${CURRENCY}`] : []),
    `الإجمالي: ${grand()} ${CURRENCY}${fee ? "" : " (بدون رسوم التوصيل)"}`,
    ...(g("#fNote") ? [``, `ملاحظات: ${g("#fNote")}`] : []), ``, `رسالة مُجهَّزة من موقع ${RESTAURANT_NAME}.`].join("\n");
}
async function sendOrderToWhatsApp(e) {
  e.preventDefault();
  if (!pieces()) return toast("لا يمكن إتمام طلب فارغ");
  if (!validateCheckoutForm()) return;
  const msg = buildWhatsAppMessage(), url = `https://wa.me/${waNumber()}?text=${encodeURIComponent(msg)}`;
  const w = window.open(url, "_blank", "noopener");
  if (w) return toast("تم فتح واتساب — اضغط «إرسال» هناك لإرسال طلبك");
  try { await navigator.clipboard.writeText(msg); toast("تعذّر فتح واتساب تلقائيًا — تم نسخ تفاصيل الطلب لإرسالها يدويًا"); } catch (er) { toast("تعذّر فتح واتساب تلقائيًا"); }
  location.href = url;
}

/* ===== الأحداث ===== */
document.addEventListener("click", e => {
  const el = e.target.closest("button,a"); if (!el) return;
  const id = el.dataset.id, a = el.dataset.a;
  if (el.dataset.cat) { setCat(el.dataset.cat); if (el.tagName === "A") { e.preventDefault(); $("#nav").classList.remove("open"); $("#overlay").hidden = true; $("#menu").scrollIntoView(); } }
  else if (a === "pplus") { pick[id] = (pick[id] || 1) + 1; el.parentNode.querySelector("span").textContent = pick[id]; }
  else if (a === "pminus") { pick[id] = Math.max(1, (pick[id] || 1) - 1); el.parentNode.querySelector("span").textContent = pick[id]; }
  else if (a === "add") { addToCart(id, pick[id] || 1); const s = el.querySelector("span"); s.textContent = "تمت الإضافة ✓"; setTimeout(() => s.textContent = "أضف إلى السلة", 900); toast(`تمت إضافة ${byId(id).name}`); }
  else if (a === "plus") updateQuantity(id, 1);
  else if (a === "minus") updateQuantity(id, -1);
  else if (a === "del") removeFromCart(id);
  else if (el.dataset.cancel !== undefined) cancelOrder();
  else if (el.dataset.close !== undefined) { closeCart(); if (el.closest("#cartBody")) $("#menu").scrollIntoView(); }
  else if (el.id === "cartBtn" || el.id === "mbar" || el.id === "ordersLink") { e.preventDefault(); $("#nav").classList.remove("open"); openCart(); }
  else if (el.id === "checkoutBtn") openCheckout();
  else if (el.id === "backCart" || el.id === "backTop") { $("#checkout").hidden = true; document.body.style.overflow = ""; openCart(); }
  else if (el.id === "menuBtn") { $("#nav").classList.add("open"); $("#overlay").hidden = false; }
  else if (el.hasAttribute("data-go")) { $("#nav").classList.remove("open"); $("#overlay").hidden = true; }
});
$("#overlay").onclick = closeCart;
$("#search").oninput = e => { query = e.target.value; renderProducts(); };
$("#form").onsubmit = sendOrderToWhatsApp;
["#fName", "#fPhone", "#fAddr", "#fNote"].forEach(s => $(s).addEventListener("input", () => { if (!$("#checkout").hidden) $("#preview").textContent = buildWhatsAppMessage(); }));
document.addEventListener("keydown", e => { if (e.key === "Escape") closeCart(); });
addEventListener("resize", renderCart);
renderChips(); renderProducts(); renderCart();