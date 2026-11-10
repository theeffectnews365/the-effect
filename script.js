const API_URL = "https://script.google.com/macros/s/AKfycbwwIeOGkKq0mc6VJoeYG8l-pxO1NQ1rj3XnP6IBXguHvPAC4gRki3PsPjzlkiN8jWF6_w/exec";

let newsData = [];


/* =========================
   BANGLA DATE
========================= */

function updateBanglaDate() {
    const el = document.getElementById("banglaDate");
    if (!el) return;

    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: "Asia/Dhaka",
        year: "numeric",
        month: "numeric",
        day: "numeric"
    }).formatToParts(now);

    const get = type => Number(parts.find(p => p.type === type).value);

    const year = get("year");
    const month = get("month");
    const day = get("day");

    const months = [
        "বৈশাখ", "জ্যৈষ্ঠ", "আষাঢ়", "শ্রাবণ",
        "ভাদ্র", "আশ্বিন", "কার্তিক", "অগ্রহায়ণ",
        "পৌষ", "মাঘ", "ফাল্গুন", "চৈত্র"
    ];

    const lengths = [31,31,31,31,31,30,30,30,30,30,30,30];

    const start = Date.UTC(year, 3, 14);
    const current = Date.UTC(year, month - 1, day);

    let diff = Math.floor((current - start) / 86400000);
    let banglaYear = year - 593;

    if (diff < 0) {
        banglaYear--;
        diff += 365;
    }

    let banglaMonth = 0;

    while (banglaMonth < 11 && diff >= lengths[banglaMonth]) {
        diff -= lengths[banglaMonth];
        banglaMonth++;
    }

    el.textContent = `${diff + 1} ${months[banglaMonth]} ${banglaYear}`;
}


/* =========================
   ENGLISH DATE
========================= */

function updateEnglishDate() {
    const el = document.getElementById("englishDate");
    if (!el) return;

    el.textContent = new Date().toLocaleDateString("en-GB", {
        timeZone: "Asia/Dhaka",
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}


/* =========================
   LIVE TIME
========================= */

function updateTime() {
    const el = document.getElementById("englishTime");
    if (!el) return;

    el.textContent = new Date().toLocaleTimeString("en-GB", {
        timeZone: "Asia/Dhaka",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false
    });
}


/* =========================
   START DATE & TIME
========================= */

function updateDateTime() {
    updateBanglaDate();
    updateEnglishDate();
    updateTime();
}

updateDateTime();

setInterval(updateTime, 1000);
setInterval(updateDateTime, 60000);


/* =========================
   SEARCH
========================= */

function setupSearch() {

    const searchInput =
        document.getElementById("searchInput");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {

        const keyword =
            this.value.trim().toLowerCase();

        if (!keyword) {
            displayNews(newsData);
            return;
        }

        const filtered =
            newsData.filter(news => {

                return (
                    String(news.title || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(news.short_description || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(news.content || "")
                        .toLowerCase()
                        .includes(keyword) ||

                    String(news.category || "")
                        .toLowerCase()
                        .includes(keyword)
                );

            });

        displayNews(filtered);
    });
}


/* =========================
   NAVIGATION
========================= */

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(".nav-link");

    navLinks.forEach(link => {

        link.addEventListener("click", function (event) {

            event.preventDefault();

            const category =
                this.textContent.trim();

            navLinks.forEach(item =>
                item.classList.remove("active")
            );

            this.classList.add("active");

            if (
                category === "প্রচ্ছদ" ||
                category === "সর্বশেষ"
            ) {
                displayNews(newsData);
                return;
            }

            const filtered =
                newsData.filter(news =>
                    String(news.category || "").trim() === category
                );

            displayNews(filtered);
        });
    });
}


/* =========================
   LOAD NEWS
========================= */

async function loadNews() {

    const container =
        document.getElementById("newsContainer");

    if (!container) return;

    try {

        const response =
            await fetch(API_URL + "?t=" + Date.now());

        if (!response.ok) {
            throw new Error("Network error");
        }

        const data =
            await response.json();

        if (!Array.isArray(data)) {
            throw new Error("Invalid data");
        }

        newsData = data.reverse();

        displayNews(newsData);
        displayPopularNews(newsData);
        updateBreakingNews(newsData);

    } catch (error) {

        console.error(error);

        container.innerHTML = `
            <div class="empty-news">
                সংবাদ লোড করা যাচ্ছে না।
            </div>
        `;
    }
}


/* =========================
   GET IMAGE
========================= */

function getImageURL(image) {

    if (!image) return "";

    return String(image).trim();
}


/* =========================
   DISPLAY NEWS
========================= */

function displayNews(data) {

    const container =
        document.getElementById("newsContainer");

    if (!container) return;

    if (!data.length) {

        container.innerHTML = `
            <div class="empty-news">
                কোনো সংবাদ পাওয়া যায়নি।
            </div>
        `;

        return;
    }

    container.innerHTML =
        data.map(news => {

            const imageURL =
                getImageURL(news.image);

            const imageHTML =
                imageURL
                    ? `
                        <img
                            src="${escapeHTML(imageURL)}"
                            alt="${escapeHTML(news.title || "")}"
                            class="news-image"
                        >
                    `
                    : "";

            return `
                <article
                    class="news-card"
                    onclick="openNews('${encodeURIComponent(String(news.id || ""))}')"
                    style="cursor:pointer;"
                >

                    ${imageHTML}

                    <div class="news-card-content">

                        <div class="news-category">
                            ${escapeHTML(news.category || "সংবাদ")}
                        </div>

                        <h2 class="news-title">
                            ${escapeHTML(news.title || "")}
                        </h2>

                        <p class="news-description">
                            ${escapeHTML(news.short_description || "")}
                        </p>

                        <div class="news-meta">

                            <span>
                                ${escapeHTML(news.author || "THE EFFECT")}
                            </span>

                            <span>
                                ${escapeHTML(news.date || "")}
                            </span>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
}


/* =========================
   OPEN NEWS ARTICLE
========================= */

function openNews(id) {

    if (!id) return;

    window.location.href =
        "news.html?id=" + id;
}


/* =========================
   POPULAR NEWS
========================= */

function displayPopularNews(data) {

    const popularContainer =
        document.getElementById("popularNews");

    if (!popularContainer) return;

    const popular =
        data.slice(0, 5);

    popularContainer.innerHTML =
        popular.map((news, index) => {

            return `
                <div
                    class="popular-item"
                    onclick="openNews('${encodeURIComponent(String(news.id || ""))}')"
                    style="cursor:pointer;"
                >

                    <span class="popular-number">
                        ${index + 1}
                    </span>

                    <span class="popular-title">
                        ${escapeHTML(news.title || "")}
                    </span>

                </div>
            `;

        }).join("");
}


/* =========================
   BREAKING NEWS
========================= */

function updateBreakingNews(data) {

    const breakingContainer =
        document.getElementById("breakingNews");

    if (!breakingContainer) return;

    const latest =
        data.slice(0, 5);

    breakingContainer.innerHTML =
        latest.map(news => {

            return `
                <span
                    class="breaking-item"
                    onclick="openNews('${encodeURIComponent(String(news.id || ""))}')"
                    style="cursor:pointer;"
                >
                    ${escapeHTML(news.title || "")}
                </span>
            `;

        }).join(" • ");
}


/* =========================
   ESCAPE HTML
========================= */

function escapeHTML(text) {

    if (
        text === null ||
        text === undefined
    ) {
        return "";
    }

    return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        updateBanglaDate();
        updateEnglishDate();
        updateTime();

        setInterval(
            updateTime,
            1000
        );

        setupSearch();
        setupNavigation();
        loadNews();

        const yearElement =
            document.getElementById("footerYear");

        if (yearElement) {
            yearElement.textContent =
                new Date().getFullYear();
        }

    }
);
