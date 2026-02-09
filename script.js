let basket = JSON.parse(localStorage.getItem("basket")) || [];

document.querySelectorAll(".fresh button").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".fresh");

    const name = card.querySelector("h2").innerText;
    const priceText = card.querySelector("p").innerText;
    const img = card.querySelector("img[id='img']").src;

    const price = parseFloat(priceText.replace("$", "").replace(",", "."));

    addToBasket(name, price, img);
  });
});

document.querySelectorAll(".green #ilti").forEach(btn => {
  btn.addEventListener("click", () => {
    const card = btn.closest(".boroon");

    const name = card.querySelector("h2").innerText;
    const priceText = card.querySelector("p span").innerText;
    const price = parseFloat(priceText.replace("$", ""));
    const img = card.querySelector(".img2").src;

    addToBasket(name, price, img);
  });
});

function addToBasket(name, price, img) {
  let existing = basket.find(item => item.name === name);

  if (existing) {
    existing.qty += 1;
  } else {
    basket.push({
      id: Date.now(),
      name,
      price,
      qty: 1,
      img
    });
  }

  localStorage.setItem("basket", JSON.stringify(basket));
}

const cartIcon = document.getElementById("zakas");

const cartBox = document.createElement("div");
cartBox.style.position = "absolute";
cartBox.style.top = "90px";
cartBox.style.right = "40px";
cartBox.style.width = "300px";
cartBox.style.background = "#fff";
cartBox.style.border = "1px solid #ccc";
cartBox.style.padding = "10px";
cartBox.style.display = "none";
cartBox.style.zIndex = "9999";

document.body.appendChild(cartBox);

cartIcon.parentElement.addEventListener("click", e => {
  e.preventDefault();
  renderCart();
  cartBox.style.display =
    cartBox.style.display === "none" ? "block" : "none";
});

function renderCart() {
  cartBox.innerHTML = "<h3>Savat</h3>";

  if (basket.length === 0) {
    cartBox.innerHTML += "<p>Bo‘sh</p>";
    return;
  }

  basket.forEach(item => {
    cartBox.innerHTML += `
      <div style="display:flex;gap:10px;margin-bottom:10px;">
        <img src="${item.img}" width="50">
        <div>
          <h2 style="font-size:14px;margin:0">${item.name}</h2>
          <p style="margin:0;color:green">$${item.price} x ${item.qty}</p>
        </div>
      </div>
    `;
  });
}
