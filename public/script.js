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

// Login
const form = document.getElementById("adminLogin");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    const res = await fetch("/admin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    console.log(result);

    if (result.success) {
      // ✅ Save token in browser localStorage
      localStorage.setItem("adminToken", result.token);

      alert("Login successful!");
      // Redirect to admin dashboard
      window.location.href = "/admin";
    } else if (!result.emailVerified) {
      // Show email verification alert
      const emailAlert = document.getElementById("emailAlert");
      if (emailAlert) {
        emailAlert.classList.add("show");
      }
      alert(result.message);
    } else {
      alert(result.message);
    }
  });
}
