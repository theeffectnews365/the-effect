/* =========================================================
   THE EFFECT
   MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   GOOGLE SHEETS / APPS SCRIPT API
   ========================================================= */

const API_URL =
    "https://script.google.com/macros/s/AKfycbwwIeOGkKq0mc6VJoeYG8l-pxO1NQ1rj3XnP6IBXguHvPAC4gRki3PsPjzlkiN8jWF6_w/exec";


/* =========================================================
   GLOBAL NEWS DATA
   ========================================================= */

let newsData = [];


/* =========================================================
   BANGLA DATE
   ========================================================= */

function getBanglaDate() {

    const now = new Date();

    const banglaWeekdays = [
        "রবিবার",
        "সোমবার",
        "মঙ্গলবার",
        "বুধবার",
        "বৃহস্পতিবার",
        "শুক্রবার",
        "শনিবার"
    ];

    const months = [
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

    /*
       ২০২৬ সালের ১৬ সেপ্টেম্বর
       = ১ আশ্বিন ১৪৩৩
    */

    const referenceDate =
        new Date(2026, 8, 16);

    const currentDate =
        new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

    const difference =
        Math.floor(
            (
                currentDate -
                referenceDate
            ) /
            (1000 * 60 * 60 * 24)
        );

    let banglaYear = 1433;
    let banglaMonth = 5;
    let banglaDay = difference + 1;

    /*
       ২০২৬ সালের ১৬ সেপ্টেম্বরের
       আগে হলে সাধারণ fallback
    */

    if (banglaDay < 1) {

        banglaYear =
            now.getFullYear() - 593;

        banglaMonth = 0;
        banglaDay = 1;
    }

    const monthLengths = [
        31, // বৈশাখ
        31, // জ্যৈষ্ঠ
        31, // আষাঢ়
        31, // শ্রাবণ
        31, // ভাদ্র
        30, // আশ্বিন
        30, // কার্তিক
        30, // অগ্রহায়ণ
        30, // পৌষ
        30, // মাঘ
        30, // ফাল্গুন
        30  // চৈত্র
    ];

    while (
        banglaDay >
        monthLengths[banglaMonth]
    ) {

        banglaDay -=
            monthLengths[banglaMonth];

        banglaMonth++;

        if (banglaMonth > 11) {

            banglaMonth = 0;
            banglaYear++;
        }
    }

    return (
        banglaWeekdays[now.getDay()] +
        " " +
        banglaDay +
        " " +
        months[banglaMonth] +
        " " +
        banglaYear
    );
}


/* =========================================================
   ENGLISH DATE
   ========================================================= */

function getEnglishDate() {

    const now = new Date();

    return now.toLocaleDateString(
        "en-GB",
        {
            day: "2-digit",
            month: "long",
            year: "numeric"
        }
    );
}


/* =========================================================
   UPDATE TIME
   ========================================================= */

function updateTime() {

    const timeElement =
        document.getElementById(
            "englishTime"
        );

    if (!timeElement) {
        return;
    }

    const now = new Date();

    const hours =
        String(
            now.getHours()
        ).padStart(2, "0");

    const minutes =
        String(
            now.getMinutes()
        ).padStart(2, "0");

    const seconds =
        String(
            now.getSeconds()
        ).padStart(2, "0");

    timeElement.textContent =
        hours +
        ":" +
        minutes +
        ":" +
        seconds;
}


/* =========================================================
   UPDATE DATE
   ========================================================= */

function updateDate() {

    const banglaDateElement =
        document.getElementById(
            "banglaDate"
        );

    const englishDateElement =
        document.getElementById(
            "englishDate"
        );

    if (banglaDateElement) {

        banglaDateElement.textContent =
            getBanglaDate();
    }

    if (englishDateElement) {

        englishDateElement.textContent =
            getEnglishDate();
    }
}


/* =========================================================
   SEARCH SETUP
   ========================================================= */

function setupSearch() {

    const searchButton =
        document.getElementById(
            "searchButton"
        );

    const searchPanel =
        document.getElementById(
            "searchPanel"
        );

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    const searchSubmit =
        document.getElementById(
            "searchSubmit"
        );

    if (
        !searchButton ||
        !searchPanel
    ) {
        return;
    }

    searchButton.addEventListener(
        "click",
        function () {

            searchPanel.classList.toggle(
                "show"
            );

            if (
                searchPanel.classList.contains(
                    "show"
                ) &&
                searchInput
            ) {

                searchInput.focus();
            }
        }
    );

    if (searchSubmit) {

        searchSubmit.addEventListener(
            "click",
            function () {

                performSearch();
            }
        );
    }

    if (searchInput) {

        searchInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter"
                ) {

                    performSearch();
                }
            }
        );
    }
}


/* =========================================================
   SEARCH
   ========================================================= */

function performSearch() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );

    if (!searchInput) {
        return;
    }

    const query =
        searchInput.value
            .trim()
            .toLowerCase();

    if (!query) {

        displayNews(newsData);

        return;
    }

    const results =
        newsData.filter(
            function (news) {

                const title =
                    String(
                        news.title || ""
                    ).toLowerCase();

                const description =
                    String(
                        news.short_description || ""
                    ).toLowerCase();

                const content =
                    String(
                        news.content || ""
                    ).toLowerCase();

                const category =
                    String(
                        news.category || ""
                    ).toLowerCase();

                return (
                    title.includes(query) ||
                    description.includes(query) ||
                    content.includes(query) ||
                    category.includes(query)
                );
            }
        );

    displayNews(results);
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    const navItems =
        document.querySelectorAll(
            ".nav-item"
        );

    navItems.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    navItems.forEach(
                        function (nav) {

                            nav.classList.remove(
                                "active"
                            );
                        }
                    );

                    item.classList.add(
                        "active"
                    );

                    const category =
                        item.textContent.trim();

                    /*
                       প্রচ্ছদ এবং সর্বশেষ
                       সব সংবাদ দেখাবে
                    */

                    if (
                        category === "প্রচ্ছদ" ||
                        category === "সর্বশেষ"
                    ) {

                        displayNews(
                            newsData
                        );

                        return;
                    }

                    /*
                       নির্দিষ্ট category
                    */

                    const filteredNews =
                        newsData.filter(
                            function (news) {

                                return (
                                    String(
                                        news.category || ""
                                    )
                                    .trim()
                                    .toLowerCase()
                                    ===
                                    category
                                    .toLowerCase()
                                );
                            }
                        );

                    displayNews(
                        filteredNews
                    );
                }
            );
        }
    );
}


/* =========================================================
   LOAD NEWS FROM GOOGLE SHEETS
   ========================================================= */

async function loadNews() {

    try {

        const response =
            await fetch(
                API_URL +
                "?t=" +
                Date.now()
            );

        if (!response.ok) {

            throw new Error(
                "HTTP error: " +
                response.status
            );
        }

        const data =
            await response.json();

        console.log(
            "THE EFFECT NEWS:",
            data
        );

        if (
            !Array.isArray(data)
        ) {

            throw new Error(
                "Invalid news data"
            );
        }

        /*
           সর্বশেষ news আগে দেখানো
        */

        newsData =
            [...data].reverse();

        displayNews(
            newsData
        );

        displayPopularNews();

        updateBreakingNews();

    } catch (error) {

        console.error(
            "THE EFFECT NEWS ERROR:",
            error
        );

        const newsContainer =
            document.getElementById(
                "newsContainer"
            );

        const emptyNews =
            document.getElementById(
                "emptyNews"
            );

        if (newsContainer) {

            newsContainer.innerHTML = "";
        }

        if (emptyNews) {

            emptyNews.style.display =
                "block";

            emptyNews.innerHTML = `
                <h2>
                    সংবাদ লোড করা যাচ্ছে না
                </h2>

                <p>
                    Google Sheets-এর সঙ্গে
                    সংযোগ পরীক্ষা করুন।
                </p>
            `;
        }
    }
}


/* =========================================================
   IMAGE URL
   ========================================================= */

function getImageURL(imagePath) {

    if (!imagePath) {

        return "";
    }

    const image =
        String(
            imagePath
        ).trim();

    if (
        image.startsWith("http://") ||
        image.startsWith("https://")
    ) {

        return image;
    }

    return image;
}


/* =========================================================
   DISPLAY NEWS
   ========================================================= */

function displayNews(newsList) {

    const newsContainer =
        document.getElementById(
            "newsContainer"
        );

    const emptyNews =
        document.getElementById(
            "emptyNews"
        );

    if (!newsContainer) {

        return;
    }

    newsContainer.innerHTML = "";

    /*
       কোনো news না থাকলে
    */

    if (
        !newsList ||
        newsList.length === 0
    ) {

        if (emptyNews) {

            emptyNews.style.display =
                "block";
        }

        return;
    }

    if (emptyNews) {

        emptyNews.style.display =
            "none";
    }

    newsList.forEach(
        function (news) {

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "news-card";

            const imageURL =
                getImageURL(
                    news.image
                );

            let imageHTML = "";

            if (imageURL) {

                imageHTML = `
                    <img
                        class="news-image"
                        src="${escapeHTML(imageURL)}"
                        alt="${escapeHTML(
                            news.title ||
                            "THE EFFECT"
                        )}"
                        loading="lazy"
                    >
                `;
            }

            article.innerHTML = `

                ${imageHTML}

                <div class="news-card-content">

                    <div class="news-category">
                        ${escapeHTML(
                            news.category || ""
                        )}
                    </div>

                    <h2 class="news-title">
                        ${escapeHTML(
                            news.title || ""
                        )}
                    </h2>

                    <p class="news-description">
                        ${escapeHTML(
                            news.short_description || ""
                        )}
                    </p>

                    <div class="news-meta">

                        <span>
                            ${escapeHTML(
                                news.author ||
                                "THE EFFECT"
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                news.date || ""
                            )}
                        </span>

                    </div>

                </div>
            `;

            newsContainer.appendChild(
                article
            );
        }
    );
}


/* =========================================================
   POPULAR NEWS
   ========================================================= */

function displayPopularNews() {

    const popularContainer =
        document.getElementById(
            "popularNews"
        );

    if (!popularContainer) {

        return;
    }

    popularContainer.innerHTML = "";

    newsData
        .slice(0, 5)
        .forEach(
            function (news, index) {

                const item =
                    document.createElement(
                        "div"
                    );

                item.className =
                    "popular-item";

                item.innerHTML = `

                    <span class="popular-number">
                        ${index + 1}
                    </span>

                    <div class="popular-content">

                        <h3 class="popular-title">
                            ${escapeHTML(
                                news.title || ""
                            )}
                        </h3>

                        <span>
                            ${escapeHTML(
                                news.date || ""
                            )}
                        </span>

                    </div>

                `;

                popularContainer.appendChild(
                    item
                );
            }
        );
}


/* =========================================================
   BREAKING NEWS
   ========================================================= */

function updateBreakingNews() {

    const breakingTrack =
        document.getElementById(
            "breakingTrack"
        );

    if (!breakingTrack) {

        return;
    }

    if (
        !newsData ||
        newsData.length === 0
    ) {

        breakingTrack.innerHTML =
            "<span>এই মুহূর্তে কোনো ব্রেকিং নিউজ নেই</span>";

        return;
    }

    const latestNews =
        newsData.slice(0, 5);

    breakingTrack.innerHTML =
        latestNews
            .map(
                function (news) {

                    return `
                        <span>
                            ${escapeHTML(
                                news.title || ""
                            )}
                        </span>
                    `;
                }
            )
            .join("");
}


/* =========================================================
   SECURITY / HTML ESCAPE
   ========================================================= */

function escapeHTML(value) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   PAGE START
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        /*
           Date
        */

        updateDate();

        /*
           Time
        */

        updateTime();

        /*
           প্রতি ১ সেকেন্ডে time update
        */

        setInterval(
            updateTime,
            1000
        );

        /*
           Search
        */

        setupSearch();

        /*
           Navigation
        */

        setupNavigation();

        /*
           Google Sheets থেকে news
        */

        loadNews();

        /*
           Footer year
        */

        const currentYear =
            document.getElementById(
                "currentYear"
            );

        if (currentYear) {

            currentYear.textContent =
                new Date()
                    .getFullYear();
        }

    }
);