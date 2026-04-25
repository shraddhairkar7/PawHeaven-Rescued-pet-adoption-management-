/**
 * PawHaven API client — targets Express on port 3000.
 * Adjust column names in buildPetPayload / buildAdopterPayload if your MySQL schema differs.
 */
(function () {
    /**
     * API lives on port 3000 (npm start). Same port → relative URLs.
     * Otherwise use same hostname as the page (Live Server, file://) on :3000.
     */
    function apiBase() {
        var h = window.location.hostname;
        var p = String(window.location.port || "");
        if (window.location.protocol === "file:") {
            return "http://127.0.0.1:3000";
        }
        if (p === "3000") return "";
        /* Same-origin when proxied (e.g. Cloudflare quick tunnel, nginx): no :3000 suffix */
        if (p === "" || p === "443" || p === "80") return "";
        var host = h && h !== "" ? h : "127.0.0.1";
        var proto =
            window.location.protocol === "https:" ? "https:" : "http:";
        return proto + "//" + host + ":3000";
    }

    function url(path) {
        var b = apiBase();
        if (!path.startsWith("/")) path = "/" + path;
        return b + path;
    }

    /** Admin pages send staff credentials so the API can allow POST/PUT/DELETE. */
    function staffHeaders() {
        try {
            if (sessionStorage.getItem("pawhaven_role") !== "admin") return {};
            var id = sessionStorage.getItem("pawhaven_staff_id") || "";
            var pw = sessionStorage.getItem("pawhaven_staff_password") || "";
            if (!id || !pw) return {};
            return {
                "X-Staff-Id": id,
                "X-Staff-Password": pw,
            };
        } catch (e) {
            return {};
        }
    }

    function fetchJSON(path, options) {
        options = options || {};
        var method = (options.method || "GET").toUpperCase();
        var opts = {
            method: method,
            headers: Object.assign({}, options.headers || {}),
        };
        if (options.body !== undefined) {
            opts.body =
                typeof options.body === "string"
                    ? options.body
                    : JSON.stringify(options.body);
            opts.headers["Content-Type"] = "application/json";
        }
        var mutating =
            method !== "GET" &&
            method !== "HEAD" &&
            method !== "OPTIONS";
        if (
            mutating &&
            path !== "/auth/login" &&
            !options.skipStaffAuth
        ) {
            Object.assign(opts.headers, staffHeaders());
        }
        var fullUrl = url(path);
        return fetch(fullUrl, {
            method: opts.method,
            headers: opts.headers,
            body: opts.body,
            cache: "no-store",
        })
            .then(function (res) {
                var ct = (res.headers.get("content-type") || "").toLowerCase();
                var parse =
                    ct.indexOf("application/json") !== -1
                        ? res.json().catch(function () {
                              return res.text().then(function (t) {
                                  return { _parseError: t };
                              });
                          })
                        : res.text().then(function (t) {
                              return { _text: t };
                          });
                return parse.then(function (data) {
                    if (!res.ok) {
                        var msg =
                            (data && data.error) ||
                            (data && data._text) ||
                            (data && data._parseError) ||
                            res.statusText;
                        throw new Error(String(msg));
                    }
                    return data;
                });
            })
            .catch(function (err) {
                var m = String((err && err.message) || err || "");
                if (
                    err &&
                    (err.name === "TypeError" ||
                        /failed to fetch|networkerror|load failed|aborted/i.test(
                            m
                        ))
                ) {
                    throw new Error(
                        "Cannot reach the API at " +
                            fullUrl +
                            ". Start the backend (npm start), then open the app from http://localhost:3000/… so the page and API share the same origin, or keep using port 3000 for the API from Live Server."
                    );
                }
                throw err;
            });
    }

    function firstDefined(obj, keys) {
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            if (obj[k] !== undefined && obj[k] !== null && obj[k] !== "")
                return obj[k];
        }
        return "";
    }

    function petDisplayName(row) {
        return firstDefined(row, ["Pet_Name", "Name", "PetName", "pet_name"]);
    }

    /** Matches `pet.Adoption_status` in animal_shelter.sql (MySQL returns exact column names). */
    function petAdoptionStatus(row) {
        return firstDefined(row, [
            "Adoption_status",
            "Adoption_Status",
            "adoption_status",
        ]);
    }

    function shelterDisplayName(row) {
        return firstDefined(row, [
            "Shelter_Name",
            "Name",
            "ShelterName",
            "shelter_name",
        ]);
    }

    /** Map add-pet form → `pet` table (animal_shelter.sql). */
    function buildPetPayload(form) {
        var sid = (form.shelter && form.shelter.value) || "";
        var img =
            (form.photoUrl && String(form.photoUrl.value || "").trim()) || "";
        var genderEl = form.gender;
        var gender =
            genderEl && genderEl.value ? String(genderEl.value) : "";
        var out = {
            Pet_Name: (form.petName && form.petName.value) || "",
            Species: (form.species && form.species.value) || "",
            Breed: (form.breed && form.breed.value) || "",
            Age: form.age && form.age.value !== "" ? Number(form.age.value) : null,
            Adoption_status:
                (form.adoptionStatus && form.adoptionStatus.value) || "Available",
            Shelter_ID: sid || null,
        };
        if (gender) out.Gender = gender;
        if (img) out.Image_URL = img;
        return out;
    }

    /** Map form → `medical_record` (Vet_Name, Treatment_Details, Checkup_Date, Vaccine_Name, Pet_ID). */
    function buildMedicalPayload(petId, form) {
        return {
            Pet_ID: petId,
            Vet_Name: "",
            Treatment_Details: (form.health && form.health.value) || "",
            Checkup_Date: (form.checkup && form.checkup.value) || null,
            Vaccine_Name:
                (form.vaccination && form.vaccination.value) || "Pending",
        };
    }

    window.PawHavenAPI = {
        apiBase: apiBase,
        url: url,
        fetchJSON: fetchJSON,
        petDisplayName: petDisplayName,
        petAdoptionStatus: petAdoptionStatus,
        shelterDisplayName: shelterDisplayName,
        buildPetPayload: buildPetPayload,
        buildMedicalPayload: buildMedicalPayload,
    };
})();
