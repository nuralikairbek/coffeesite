const whatsappPhone = "+77769804324";

function createWhatsAppLink(message) {
  const phone = whatsappPhone.replace(/\D/g, "");
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
}

const reservationButtons = document.querySelectorAll("[data-whatsapp-reservation]");
const contactButton = document.querySelector("[data-whatsapp-contact]");
const menuQuestionButton = document.querySelector("[data-whatsapp-menu-question]");
const nav = document.querySelector(".nav");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".nav-links a");
const reservationMessage = "Здравствуйте!\nЯ хочу забронировать столик в Coffee Space.";

reservationButtons.forEach(function (reservationButton) {
  reservationButton.href = createWhatsAppLink(reservationMessage);
  reservationButton.target = "_blank";
  reservationButton.rel = "noopener";
});

if (contactButton) {
  contactButton.href = createWhatsAppLink("Здравствуйте!\nХочу связаться с Coffee Space.");
  contactButton.target = "_blank";
  contactButton.rel = "noopener";
}

if (menuQuestionButton) {
  menuQuestionButton.href = createWhatsAppLink("Здравствуйте!\nХочу спросить о меню Coffee Space.");
  menuQuestionButton.target = "_blank";
  menuQuestionButton.rel = "noopener";
}

if (nav && navToggle) {
  navToggle.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("is-open");

    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });

  navLinks.forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
      navToggle.setAttribute("aria-label", "Открыть меню");
    });
  });
}

const menuFilter = document.querySelector(".menu-filter");
const filterIndicator = document.querySelector(".filter-indicator");
const filterButtons = document.querySelectorAll(".filter-button");
const menuCards = document.querySelectorAll(".menu-card[data-category]");
const menuAnimationDuration = 300;
let menuFilterTimer = null;

function moveFilterIndicator(activeButton) {
  if (!menuFilter || !filterIndicator || !activeButton) {
    return;
  }

  const filterRect = menuFilter.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  const left = buttonRect.left - filterRect.left + menuFilter.scrollLeft;

  filterIndicator.style.width = buttonRect.width + "px";
  filterIndicator.style.transform = "translateX(" + left + "px)";
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const filter = button.dataset.filter || "all";

    filterButtons.forEach(function (item) {
      item.classList.remove("active");
      item.setAttribute("aria-pressed", "false");
    });

    button.classList.add("active");
    button.setAttribute("aria-pressed", "true");
    moveFilterIndicator(button);

    window.clearTimeout(menuFilterTimer);

    menuCards.forEach(function (card) {
      card.classList.add("is-fading");
    });

    menuFilterTimer = window.setTimeout(function () {
      menuCards.forEach(function (card) {
        const shouldShow = filter === "all" || card.dataset.category === filter;

        card.classList.toggle("is-hidden", !shouldShow);
      });

      window.requestAnimationFrame(function () {
        menuCards.forEach(function (card) {
          if (!card.classList.contains("is-hidden")) {
            card.classList.remove("is-fading");
          }
        });
      });
    }, menuAnimationDuration);
  });
});

moveFilterIndicator(document.querySelector(".filter-button.active"));

window.addEventListener("resize", function () {
  moveFilterIndicator(document.querySelector(".filter-button.active"));
});

const tableStorageKey = "coffee-space-table-order";
const tableBar = document.querySelector(".table-bar");
const tableCount = document.querySelector("[data-table-count]");
const tableShowButton = document.querySelector(".table-show-button");
const tableModal = document.querySelector(".table-modal");
const tableList = document.querySelector("[data-table-list]");
const tableTotal = document.querySelector("[data-table-total]");
const tableClearButton = document.querySelector("[data-table-clear]");
const tableCloseButtons = document.querySelectorAll("[data-table-close]");
let tableOrder = {};

function formatTenge(value) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, " ") + " ₸";
}

function parsePrice(value) {
  return Number(String(value).replace(/[^\d]/g, "")) || 0;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getPluralPosition(count) {
  const absCount = Math.abs(count);
  const lastTwo = absCount % 100;
  const last = absCount % 10;

  if (lastTwo >= 11 && lastTwo <= 14) {
    return "позиций";
  }

  if (last === 1) {
    return "позиция";
  }

  if (last >= 2 && last <= 4) {
    return "позиции";
  }

  return "позиций";
}

function loadTableOrder() {
  try {
    const savedOrder = window.localStorage.getItem(tableStorageKey);
    tableOrder = savedOrder ? JSON.parse(savedOrder) : {};
  } catch (error) {
    tableOrder = {};
  }
}

function saveTableOrder() {
  try {
    window.localStorage.setItem(tableStorageKey, JSON.stringify(tableOrder));
  } catch (error) {
    return;
  }
}

function getTableTotals() {
  return Object.keys(tableOrder).reduce(
    function (totals, id) {
      const item = tableOrder[id];
      totals.count += item.quantity;
      totals.sum += item.quantity * item.price;
      return totals;
    },
    { count: 0, sum: 0 }
  );
}

function closeTableModal() {
  if (!tableModal || !tableShowButton) {
    return;
  }

  tableModal.classList.remove("is-open");
  tableModal.setAttribute("aria-hidden", "true");
  tableShowButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("table-modal-open");
}

function openTableModal() {
  const totals = getTableTotals();

  if (!tableModal || !tableShowButton || totals.count === 0) {
    return;
  }

  tableModal.classList.add("is-open");
  tableModal.setAttribute("aria-hidden", "false");
  tableShowButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("table-modal-open");
  tableModal.focus();
}

function renderTableOrder() {
  if (!tableBar || !tableCount || !tableList || !tableTotal) {
    return;
  }

  const totals = getTableTotals();
  const hasItems = totals.count > 0;

  tableBar.classList.toggle("is-visible", hasItems);
  tableBar.setAttribute("aria-hidden", String(!hasItems));
  document.body.classList.toggle("has-table-bar", hasItems);
  tableCount.textContent = totals.count + " " + getPluralPosition(totals.count);
  tableTotal.textContent = formatTenge(totals.sum);

  tableList.innerHTML = "";

  Object.keys(tableOrder).forEach(function (id) {
    const item = tableOrder[id];
    const row = document.createElement("div");
    row.className = "table-order-item";
    row.dataset.itemId = id;

    row.innerHTML =
      '<img src="' +
      escapeHtml(item.image) +
      '" alt="' +
      escapeHtml(item.title) +
      '">' +
      '<div class="table-order-info">' +
      "<strong>" +
      escapeHtml(item.title) +
      "</strong>" +
      "<span>" +
      formatTenge(item.price) +
      "</span>" +
      "</div>" +
      '<div class="table-order-controls">' +
      '<button class="table-qty-button" type="button" data-table-decrease="' +
      escapeHtml(id) +
      '" aria-label="Уменьшить количество: ' +
      escapeHtml(item.title) +
      '">−</button>' +
      '<span class="table-item-quantity">' +
      item.quantity +
      "</span>" +
      '<button class="table-qty-button" type="button" data-table-increase="' +
      escapeHtml(id) +
      '" aria-label="Увеличить количество: ' +
      escapeHtml(item.title) +
      '">+</button>' +
      '<button class="table-remove-button" type="button" data-table-remove="' +
      escapeHtml(id) +
      '" aria-label="Удалить позицию: ' +
      escapeHtml(item.title) +
      '">×</button>' +
      "</div>";

    tableList.appendChild(row);
  });

  if (!hasItems) {
    closeTableModal();
  }
}

function changeTableItem(id, delta) {
  if (!tableOrder[id]) {
    return;
  }

  tableOrder[id].quantity += delta;

  if (tableOrder[id].quantity <= 0) {
    delete tableOrder[id];
  }

  saveTableOrder();
  renderTableOrder();
}

function addTableItem(card, button) {
  const id = card.dataset.tableId;
  const title = card.querySelector("h3").textContent.trim();
  const price = parsePrice(card.querySelector(".price").textContent);
  const image = card.querySelector("img").src;

  if (!tableOrder[id]) {
    tableOrder[id] = {
      title: title,
      price: price,
      image: image,
      quantity: 0
    };
  }

  tableOrder[id].quantity += 1;
  saveTableOrder();
  renderTableOrder();

  button.classList.add("is-added");
  window.setTimeout(function () {
    button.classList.remove("is-added");
  }, 180);
}

if (menuCards.length && tableBar && tableModal) {
  loadTableOrder();

  menuCards.forEach(function (card, index) {
    const title = card.querySelector("h3").textContent.trim();
    const id = "item-" + index;
    const footer = card.querySelector(".card-footer");
    const addButton = document.createElement("button");

    card.dataset.tableId = id;
    addButton.className = "menu-add-button";
    addButton.type = "button";
    addButton.textContent = "+";
    addButton.setAttribute("aria-label", "Добавить в Ваш стол: " + title);

    addButton.addEventListener("click", function () {
      addTableItem(card, addButton);
    });

    footer.appendChild(addButton);
  });

  renderTableOrder();
}

if (tableShowButton) {
  tableShowButton.addEventListener("click", openTableModal);
}

if (tableList) {
  tableList.addEventListener("click", function (event) {
    if (!event.target.closest) {
      return;
    }

    const decreaseButton = event.target.closest("[data-table-decrease]");
    const increaseButton = event.target.closest("[data-table-increase]");
    const removeButton = event.target.closest("[data-table-remove]");

    if (decreaseButton) {
      changeTableItem(decreaseButton.dataset.tableDecrease, -1);
    }

    if (increaseButton) {
      changeTableItem(increaseButton.dataset.tableIncrease, 1);
    }

    if (removeButton) {
      delete tableOrder[removeButton.dataset.tableRemove];
      saveTableOrder();
      renderTableOrder();
    }
  });
}

if (tableClearButton) {
  tableClearButton.addEventListener("click", function () {
    tableOrder = {};
    saveTableOrder();
    renderTableOrder();
  });
}

tableCloseButtons.forEach(function (button) {
  button.addEventListener("click", closeTableModal);
});

window.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    closeTableModal();
  }
});
