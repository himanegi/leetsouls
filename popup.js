document.addEventListener("DOMContentLoaded", function () {
  const runeCircle = document.querySelector(".rune-circle");
  const supportButton = document.getElementById("supportButton");
  const qrModal = document.getElementById("qrModal");
  const closeModal = document.getElementById("closeModal");
  let angle = 0;

  function rotateRune() {
    angle += 0.2;
    runeCircle.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
    requestAnimationFrame(rotateRune);
  }

  rotateRune();

  const links = document.querySelectorAll(".link");
  links.forEach((link) => {
    link.addEventListener("mouseover", () => {
      link.style.textShadow = "0 0 10px #d4af37";
    });
    link.addEventListener("mouseout", () => {
      link.style.textShadow = "none";
    });
  });

  supportButton.addEventListener("click", (e) => {
    e.preventDefault();
    qrModal.style.display = "block";
  });

  closeModal.addEventListener("click", () => {
    qrModal.style.display = "none";
  });

  window.addEventListener("click", (e) => {
    if (e.target === qrModal) {
      qrModal.style.display = "none";
    }
  });
});
