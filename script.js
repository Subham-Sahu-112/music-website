let currentSlide = 0;

function showCurrentSlide() {
  const slides = document.querySelectorAll(".slide");

  slides.forEach((slide, index) => {
    if (index === currentSlide) {
      slide.classList.add("active");
    } else {
      slide.classList.remove("active");
    }
  });
}

function changeSlide(direction) {
  const slides = document.querySelectorAll(".slide");
  const totalSlides = slides.length;

  currentSlide += direction;

  if (currentSlide < 0) currentSlide = totalSlides - 1;
  else if (currentSlide >= totalSlides) currentSlide = 0;

  showCurrentSlide();
}

document.addEventListener("DOMContentLoaded", () => {
  showCurrentSlide();

  // Hamburger menu functionality
  const hamburger = document.getElementById("hamburger");
  const navlist = document.querySelector(".navlist-container");

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      hamburger.classList.toggle("active");
      navlist.classList.toggle("active");
    });

    // Close menu when a link is clicked
    const navLinks = navlist.querySelectorAll("a");
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        hamburger.classList.remove("active");
        navlist.classList.remove("active");
      });
    });
  }
});
