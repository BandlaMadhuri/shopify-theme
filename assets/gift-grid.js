class GiftGuideGrid {
  constructor() {
    this.popup = null;
    this.init();
  }

  init() {
    this.createPopup();
    this.bindEvents();
  }

  createPopup() {
    this.popup = document.createElement("div");
    this.popup.classList.add("gift-popup");
    this.popup.innerHTML = `
      <div class="gift-popup-content">
        <button class="gift-popup-close">&times;</button>
        <div class="gift-popup-body">
          <h2 class="popup-title"></h2>
          <p class="popup-price"></p>
          <div class="popup-description"></div>
          <div class="popup-variants"></div>
          <button class="popup-add-to-cart">Add to Cart</button>
        </div>
      </div>
    `;
    document.body.appendChild(this.popup);
  }

  bindEvents() {
    document.querySelectorAll(".view-product").forEach((btn) => {
      btn.addEventListener("click", () => this.openPopup(btn.dataset.handle));
    });

    this.popup.querySelector(".gift-popup-close").addEventListener("click", () => {
      this.closePopup();
    });
    
    this.popup.addEventListener("click", (e) => {
      if (e.target === this.popup) this.closePopup();
    });

    this.popup.querySelector(".popup-add-to-cart").addEventListener("click", () => {
      this.addToCart();
    });
  }

  async openPopup(handle) {
    try {
      const res = await fetch(`/products/${handle}.js`);
      const product = await res.json();

      this.currentProduct = product;

      this.popup.querySelector(".popup-title").textContent = product.title;
      this.popup.querySelector(".popup-price").textContent = this.formatMoney(product.price);
      this.popup.querySelector(".popup-description").innerHTML = product.description || "";
     
      const variantContainer = this.popup.querySelector(".popup-variants");
      variantContainer.innerHTML = "";
      if (product.variants.length > 1) {
        product.variants.forEach((variant) => {
          const option = document.createElement("button");
          option.classList.add("variant-option");
          option.dataset.id = variant.id;
          option.textContent = variant.title;
          option.addEventListener("click", () => {
            this.selectVariant(option, variant);
          });
          variantContainer.appendChild(option);
        });
      }

      this.selectedVariant = product.variants[0];

      this.popup.classList.add("active");
    } catch (err) {
      console.error("Error loading product:", err);
    }
  }
  closePopup() {
    this.popup.classList.remove("active");
  }

  selectVariant(button, variant) {
    this.selectedVariant = variant;

    this.popup.querySelectorAll(".variant-option").forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
  }

  async addToCart() {
    if (!this.selectedVariant) return;

    try {
      await fetch("/cart/add.js", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: this.selectedVariant.id, quantity: 1 }),
      });

      if (
        this.selectedVariant.title.includes("Black") &&
        this.selectedVariant.title.includes("Medium")
      ) {
        const bonus = window.softWinterJacketId; // store Soft Winter Jacket variant ID
        if (bonus) {
          await fetch("/cart/add.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: bonus, quantity: 1 }),
          });
        }
      }

      alert("Added to cart!");
      this.closePopup();
    } catch (err) {
      console.error("Add to cart error:", err);
    }
  }

  formatMoney(cents) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(cents / 100);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  new GiftGuideGrid();
});
