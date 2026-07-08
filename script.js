const whatsappPhone = "+77769804324";

function createWhatsAppLink(message) {
  const phone = whatsappPhone.replace(/\D/g, "");
  return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);
}

const reservationButtons = document.querySelectorAll("[data-whatsapp-reservation]");
const contactButton = document.querySelector("[data-whatsapp-contact]");
const menuQuestionButton = document.querySelector("[data-whatsapp-menu-question]");
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
  const left = buttonRect.left - filterRect.left;

  filterIndicator.style.width = buttonRect.width + "px";
  filterIndicator.style.transform = "translateX(" + left + "px)";
}

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const filter = button.dataset.filter || "all";

    filterButtons.forEach(function (item) {
      item.classList.remove("active");
    });

    button.classList.add("active");
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
