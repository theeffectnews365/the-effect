const API_URL = "https://script.google.com/macros/s/AKfycbwwIeOGkKq0mc6VJoeYG8l-pxO1NQ1rj3XnP6IBXguHvPAC4gRki3PsPjzlkiN8jWF6_w/exec";

let newsData = [];

/* =========================
   BANGLA DATE
========================= */

function updateBanglaDate() {
    const banglaDateElement = document.getElementById("banglaDate");

    if (!banglaDateElement) return;

    const today = new Date();

    const referenceDate = new Date("2026-09-16T00:00:00");
    const referenceBanglaDay = 1;
    const referenceBanglaMonth = 6;
    const referenceBanglaYear = 1433;

    const difference =
        Math.floor(
            (today - referenceDate) / (1000 * 60 * 60 * 24)
        );

    const monthNames = [
        "বৈশাখ",
        "জ্যৈষ্ঠ",
        "আষাঢ়",
        "শ্রাবণ",
        "ভাদ্র",
        "আশ্বিন",
        "কার্তিক",
        "অগ্রহায়ণ",
        "পৌষ",
        "মাঘ",
        "ফাল্গুন",
        "চৈত্র"
    ];

    const monthLengths = [
        31,
        31,
        31,
        31,
        30,
        30,
        30,
        30,
        30,
        30,
        30,
        30
    ];

    let day = referenceBanglaDay + difference;
    let month = referenceBanglaMonth;
    let year = referenceBanglaYear;

    while (day > monthLengths[month]) {
        day -= monthLengths[month];
        month++;

        if (month >= 12) {
            month = 0;
            year++;
        }
    }

    while (day <= 0) {
        month--;

        if (month < 0) {
            month = 11;
            year--;
        }

        day += monthLengths[month];
    }

    banglaDateElement.textContent =
        `${day} ${monthNames[month]} ${year}`;
}


/* =========================
   ENGLISH DATE
========================= */

function updateEnglishDate() {

    const englishDateElement =
        document.getElementById("englishDate");

    if (!englishDateElement) return;

    const today = new Date();

    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric"
    };

    englishDateElement.textContent =
        today.toLocaleDateString("en-US", options);
}


/* =========================
   LIVE TIME
========================= */

function updateTime() {

    const timeElement =
        document.getElementById("currentTime");

    if (!timeElement) return;

    const now = new Date();

    const timeString =
        now.toLocaleTimeString("en-US", {
            timeZone: "Asia/Dhaka",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true
        });

    timeElement.textContent = timeString + " BST";
}


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
