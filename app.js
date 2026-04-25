/**
 * PawHaven — sidebar, role guard, adopter vs admin UI.
 */
(function () {
    var ROLE_KEY = "pawhaven_role";
    /** Staff dashboard pages — admin only. */
    var ADMIN_ONLY = [
        "index.html",
        "addnew.html",
        "adoptions.html",
        "shelters.html",
        "volunteers.html",
        "volunteer-history.html",
        "donations.html",
        "reports.html"
    ];
    /** Logged-in adopters and admins can open these (guests → login). */
    var LOGIN_REQUIRED = ["medical.html"];

    function getRole() {
        try {
            return sessionStorage.getItem(ROLE_KEY) || "";
        } catch (e) {
            return "";
        }
    }

    function pathName() {
        var p = window.location.pathname.split("/").pop() || "";
        return p.toLowerCase();
    }

    /* medical.html: any logged-in user (adopter or admin). Staff pages: admin only. */
    (function guardPages() {
        var path = pathName();
        if (path === "") path = "index.html";
        var role = getRole();
        if (LOGIN_REQUIRED.indexOf(path) !== -1) {
            if (role !== "admin" && role !== "user") {
                window.location.replace("login.html");
            }
            return;
        }
        if (ADMIN_ONLY.indexOf(path) === -1) return;
        if (role === "admin") return;
        window.location.replace(role === "user" ? "pets.html" : "login.html");
    })();

    function toggleSidebar() {
        var el = document.getElementById("sidebar");
        if (el) el.classList.toggle("open");
    }

    window.toggleSidebar = toggleSidebar;

    function highlightActiveNav() {
        var path = pathName() || "index.html";
        document.querySelectorAll(".sidebar a[data-nav]").forEach(function (a) {
            var href = (a.getAttribute("href") || "").split("/").pop();
            if (href.toLowerCase() === path) a.classList.add("active");
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        document.addEventListener("click", function (e) {
            var a = e.target.closest && e.target.closest("a.nav-logout");
            if (!a) return;
            try {
                sessionStorage.removeItem(ROLE_KEY);
                sessionStorage.removeItem("pawhaven_staff_id");
                sessionStorage.removeItem("pawhaven_staff_password");
                sessionStorage.removeItem("pawhaven_adopter_id");
            } catch (err) {}
        });

        highlightActiveNav();
        if (document.body.getAttribute("data-page") === "pets") {
            applyPetsPageForRole();
            highlightActiveNav();
        }
        if (document.body.getAttribute("data-page") === "medical") {
            applyMedicalPageForRole();
            highlightActiveNav();
        }
    });

    function applyPetsPageForRole() {
        var role = getRole();
        if (role === "admin") return;

        var aside = document.getElementById("sidebar");
        var nav = aside && aside.querySelector("nav");
        var sub = aside && aside.querySelector(".brand-sub");
        if (sub) {
            sub.textContent =
                role === "user" ? "Adopter portal" : "Browse rescues";
        }
        if (nav) {
            if (role === "user") {
                nav.innerHTML =
                    '<a href="home.html" data-nav>🏠 Home</a>' +
                    '<a href="pets.html" data-nav>🐕 Browse pets</a>' +
                    '<a href="login.html" class="nav-logout" data-nav>🚪 Log out</a>';
            } else {
                nav.innerHTML =
                    '<a href="home.html" data-nav>🏠 Home</a>' +
                    '<a href="pets.html" data-nav>🐕 Browse pets</a>' +
                    '<a href="login.html" data-nav>🔐 Log in</a>';
            }
        }

        var title = document.getElementById("pets-heading");
        var desc = document.getElementById("pets-desc");
        if (title) title.textContent = "Browse pets";
        if (desc) {
            desc.textContent =
                "Available animals ready for adoption. Shelter and medical details are managed by staff only.";
        }

        var addBtn = document.getElementById("pets-add-btn");
        if (addBtn) addBtn.style.display = "none";

        var stats = document.getElementById("pets-stats-row");
        if (stats) stats.style.display = "none";

        document.querySelectorAll(".admin-only").forEach(function (el) {
            el.style.display = "none";
        });
    }

    function applyMedicalPageForRole() {
        var role = getRole();
        var aside = document.getElementById("sidebar");
        var nav = aside && aside.querySelector("nav");
        var sub = aside && aside.querySelector(".brand-sub");
        if (role === "admin") {
            if (sub) sub.textContent = "Clinical data";
            return;
        }
        if (sub) sub.textContent = "Your portal";
        if (nav) {
            nav.innerHTML =
                '<a href="home.html" data-nav>🏠 Home</a>' +
                '<a href="pets.html" data-nav>🐕 Browse pets</a>' +
                '<a href="medical.html" data-nav>🩺 Medical records</a>' +
                '<a href="login.html" class="nav-logout" data-nav>🚪 Log out</a>';
        }
        document.querySelectorAll(".admin-only").forEach(function (el) {
            el.style.display = "none";
        });
    }
})();
