const heroImage = document.getElementById("hero-changing-image");

const heroImages = [
    "../asset/image/eiliv-aceron-ZuIDLSz3XLg-unsplash.jpg",
    "../asset/image/luisa-brimble-2RrBE90w0T8-unsplash.jpg",
    "../asset/image/anh-nguyen-kcA-c3f_3FE-unsplash.jpg",
    "../asset/image/ellie-ellien-wg2xU_UNiVc-unsplash.jpg",
    "../asset/image/taylor-kiser-EvoIiaIVRzU-unsplash.jpg",
    "../asset/image/odiseo-castrejon-1SPu0KT-Ejg-unsplash.jpg",
    "../asset/image/mariana-medvedeva-usfIE5Yc7PY-unsplash.jpg",
    "../asset/image/eiliv-aceron-uzdfBCKwKTk-unsplash.jpg",
    "../asset/image/joseph-gonzalez-fdlZBWIP0aM-unsplash.jpg",
    "../asset/image/davey-gravy-4WPcz_5RVMk-unsplash.jpg",
    "../asset/image/eiliv-aceron-w0JzqJZYX_E-unsplash.jpg"
];

let imageIndex = 0;

setInterval(() => {
    imageIndex++;

    if (imageIndex >= heroImages.length) {
        imageIndex = 0;
    }

    heroImage.style.transform = "scale(0.96)";

    setTimeout(() => {
        heroImage.src = heroImages[imageIndex];
        heroImage.style.transform = "scale(1)";
    }, 1200);
}, 5000);


const counters = document.querySelectorAll(".count");

function countUp(counter) {
    const target = Number(counter.dataset.target);
    const hasPlus = counter.textContent.includes("+");
    let current = 0;
    const speed = 100;
    const increment = target / speed;

    const updateCounter = () => {
        current += increment;

        if (current < target) {
            counter.textContent = Math.ceil(current) + (hasPlus ? "+" : "");
            requestAnimationFrame(updateCounter);
        } else {
            counter.textContent = target + (hasPlus ? "+" : "");
        }
    };

    updateCounter();
}

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            countUp(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.5
});

counters.forEach((counter) => {
    observer.observe(counter);
});