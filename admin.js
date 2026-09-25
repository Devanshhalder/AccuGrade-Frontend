/* =========================================================
   PARIKSHA SETU — AI EXAMINATION COMMAND CENTER
   ADMIN DASHBOARD ENGINE
========================================================= */


/* =========================================================
   DOM
========================================================= */

const navLinks =
    document.querySelectorAll(".nav-link");

const pages =
    document.querySelectorAll(".page");

const pageButtons =
    document.querySelectorAll("[data-page]");


/* =========================================================
   GLOBAL STATE
========================================================= */

const batchState = {

    answerKey: null,

    answerSheets: [],

    evaluators: [],

    aiFeatures: {

        assistedMarking: true,

        uncheckedAnswers: true,

        markingAnomalies: true,

        unusualScoring: true

    }

};


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageId) {

    const selectedPage =
        document.getElementById(pageId);

    if (!selectedPage) {
        return;
    }


    /* Hide every page */

    pages.forEach((page) => {

        page.classList.remove("active");

    });


    /* Show selected page */

    selectedPage.classList.add("active");


    /* Update sidebar */

    navLinks.forEach((link) => {

        link.classList.toggle(
            "active",
            link.dataset.page === pageId
        );

    });


    /* Scroll to top */

    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });


    /* Small page-specific behaviour */

    if (pageId === "create-batch") {

        initialiseBatchPage();

    }

}


/* =========================================================
   SIDEBAR NAVIGATION
========================================================= */

navLinks.forEach((link) => {

    link.addEventListener("click", () => {

        const pageId =
            link.dataset.page;

        showPage(pageId);

    });

});


/* =========================================================
   ALL DATA-PAGE BUTTONS
========================================================= */

pageButtons.forEach((button) => {

    button.addEventListener("click", () => {

        const pageId =
            button.dataset.page;

        showPage(pageId);

    });

});


/* =========================================================
   CREATE BATCH PAGE
========================================================= */

let batchPageInitialised = false;


function initialiseBatchPage() {

    if (batchPageInitialised) {
        return;
    }

    batchPageInitialised = true;

    initialiseUploadZones();

    initialiseEvaluatorSelection();

    initialiseAIControls();

    initialiseLaunchButton();

}


/* =========================================================
   UPLOAD ZONES
========================================================= */

function initialiseUploadZones() {

    const zones =
        document.querySelectorAll(".dropzone");


    zones.forEach((zone, index) => {

        if (index === 0) {

            setupUploadZone({

                zone: zone,

                multiple: false,

                type: "answer-key"

            });

        }
        else {

            setupUploadZone({

                zone: zone,

                multiple: true,

                type: "answer-sheets"

            });

        }

    });

}


/* =========================================================
   SETUP INDIVIDUAL UPLOAD ZONE
========================================================= */

function setupUploadZone({
    zone,
    multiple,
    type
}) {

    if (!zone) {
        return;
    }


    /* Prevent duplicate initialisation */

    if (zone.dataset.initialised === "true") {
        return;
    }

    zone.dataset.initialised = "true";


    /* -----------------------------------------------------
       Hidden file input
    ----------------------------------------------------- */

    const fileInput =
        document.createElement("input");

    fileInput.type = "file";

    fileInput.accept =
        ".pdf,.png,.jpg,.jpeg";

    fileInput.multiple =
        multiple;

    fileInput.hidden = true;

    document.body.appendChild(fileInput);


    /* -----------------------------------------------------
       Browse button
    ----------------------------------------------------- */

    const browseButton =
        zone.querySelector("button");


    if (browseButton) {

        browseButton.addEventListener(
            "click",
            (event) => {

                event.stopPropagation();

                fileInput.click();

            }
        );

    }


    /* -----------------------------------------------------
       Click anywhere on dropzone
    ----------------------------------------------------- */

    zone.addEventListener(
        "click",
        (event) => {

            if (
                event.target.closest("button")
            ) {
                return;
            }

            fileInput.click();

        }
    );


    /* -----------------------------------------------------
       File selection
    ----------------------------------------------------- */

    fileInput.addEventListener(
        "change",
        () => {

            const files =
                Array.from(
                    fileInput.files || []
                );

            if (!files.length) {
                return;
            }

            handleFiles(
                files,
                zone,
                type
            );

        }
    );


    /* -----------------------------------------------------
       Drag over
    ----------------------------------------------------- */

    zone.addEventListener(
        "dragover",
        (event) => {

            event.preventDefault();

            zone.dataset.dragging = "true";

        }
    );


    /* -----------------------------------------------------
       Drag leave
    ----------------------------------------------------- */

    zone.addEventListener(
        "dragleave",
        () => {

            zone.dataset.dragging = "false";

        }
    );


    /* -----------------------------------------------------
       Drop
    ----------------------------------------------------- */

    zone.addEventListener(
        "drop",
        (event) => {

            event.preventDefault();

            zone.dataset.dragging = "false";


            const files =
                Array.from(
                    event.dataTransfer.files || []
                );


            if (!files.length) {
                return;
            }


            handleFiles(
                files,
                zone,
                type
            );

        }
    );

}


/* =========================================================
   FILE PROCESSING
========================================================= */

function handleFiles(
    files,
    zone,
    type
) {

    const validFiles =
        files.filter((file) => {

            return [

                "application/pdf",

                "image/png",

                "image/jpeg"

            ].includes(file.type);

        });


    if (!validFiles.length) {

        showUploadMessage(
            zone,
            "Unsupported file format"
        );

        return;

    }


    /* -----------------------------------------------------
       Answer Key
    ----------------------------------------------------- */

    if (type === "answer-key") {

        const file =
            validFiles[0];

        batchState.answerKey =
            file;

        updateUploadZone(
            zone,
            [
                file
            ],
            "Answer key ready"
        );

        return;

    }


    /* -----------------------------------------------------
       Answer Sheets
    ----------------------------------------------------- */

    if (type === "answer-sheets") {

        batchState.answerSheets =
            validFiles;

        updateUploadZone(
            zone,
            validFiles,
            "Answer sheets ready"
        );

    }

}


/* =========================================================
   UPDATE UPLOAD UI
========================================================= */

function updateUploadZone(
    zone,
    files,
    status
) {

    const title =
        zone.querySelector("strong");

    const subtitle =
        zone.querySelector("span");

    const button =
        zone.querySelector("button");


    if (title) {

        title.textContent =
            `${status} ✓`;

    }


    if (subtitle) {

        if (files.length === 1) {

            subtitle.textContent =
                files[0].name;

        }
        else {

            subtitle.textContent =
                `${files.length} files selected`;

        }

    }


    if (button) {

        button.textContent =
            "Change files";

    }


    zone.dataset.ready = "true";


    /* -----------------------------------------------------
       Temporary visual success state
    ----------------------------------------------------- */

    zone.style.borderColor =
        "#22c55e";

    zone.style.background =
        "#f0fdf4";


    setTimeout(() => {

        zone.style.borderColor =
            "";

        zone.style.background =
            "";

    }, 1400);

}


/* =========================================================
   UPLOAD ERROR
========================================================= */

function showUploadMessage(
    zone,
    message
) {

    const title =
        zone.querySelector("strong");

    if (!title) {
        return;
    }


    const original =
        title.textContent;


    title.textContent =
        message;


    zone.style.borderColor =
        "#ef4444";

    zone.style.background =
        "#fff5f5";


    setTimeout(() => {

        title.textContent =
            original;

        zone.style.borderColor =
            "";

        zone.style.background =
            "";

    }, 1800);

}


/* =========================================================
   EVALUATOR SELECTION
========================================================= */

function initialiseEvaluatorSelection() {

    const evaluatorCard =
        document.querySelector(".assign-card");

    if (!evaluatorCard) {
        return;
    }


    const checkboxes =
        evaluatorCard.querySelectorAll(
            'input[type="checkbox"]'
        );


    checkboxes.forEach((checkbox) => {

        checkbox.addEventListener(
            "change",
            () => {

                updateEvaluatorState(
                    checkboxes
                );

            }
        );

    });


    updateEvaluatorState(
        checkboxes
    );

}


/* =========================================================
   UPDATE EVALUATOR STATE
========================================================= */

function updateEvaluatorState(
    checkboxes
) {

    batchState.evaluators =
        Array.from(checkboxes)
            .filter(
                checkbox =>
                    checkbox.checked
            )
            .map(
                checkbox => {

                    const teacher =
                        checkbox
                            .closest(".teacher");

                    const name =
                        teacher
                            ?.querySelector(
                                "strong"
                            )
                            ?.textContent
                            .trim();

                    return name || "Evaluator";

                }
            );

}


/* =========================================================
   AI CONFIGURATION
========================================================= */

function initialiseAIControls() {

    const controls =
        document.querySelectorAll(
            ".toggle-row input[type='checkbox']"
        );


    if (!controls.length) {
        return;
    }


    controls.forEach((control, index) => {

        control.addEventListener(
            "change",
            () => {

                const keys = [

                    "assistedMarking",

                    "uncheckedAnswers",

                    "markingAnomalies",

                    "unusualScoring"

                ];

                const key =
                    keys[index];


                if (key) {

                    batchState.aiFeatures[key] =
                        control.checked;

                }

            }
        );

    });

}


/* =========================================================
   LAUNCH EVALUATION BATCH
========================================================= */

function initialiseLaunchButton() {

    const launchButton =
        document.querySelector(
            ".launch-button"
        );


    if (!launchButton) {
        return;
    }


    if (
        launchButton.dataset.initialised ===
        "true"
    ) {
        return;
    }


    launchButton.dataset.initialised =
        "true";


    launchButton.addEventListener(
        "click",
        launchBatch
    );

}


/* =========================================================
   LAUNCH LOGIC
========================================================= */

function launchBatch() {

    const launchButton =
        document.querySelector(
            ".launch-button"
        );


    if (!launchButton) {
        return;
    }


    /* -----------------------------------------------------
       Get form values
    ----------------------------------------------------- */

    const inputs =
        document.querySelectorAll(
            ".form-grid input"
        );


    const batchName =
        inputs[0]?.value.trim();

    const subject =
        inputs[1]?.value.trim();

    const examination =
        inputs[2]?.value.trim();

    const maxMarks =
        inputs[3]?.value.trim();


    /* -----------------------------------------------------
       Validation
    ----------------------------------------------------- */

    if (
        !batchName ||
        !subject ||
        !examination ||
        !maxMarks
    ) {

        showLaunchError(
            launchButton,
            "Complete batch information first"
        );

        return;

    }


    if (!batchState.answerKey) {

        showLaunchError(
            launchButton,
            "Upload the official answer key"
        );

        return;

    }


    if (
        batchState.answerSheets.length === 0
    ) {

        showLaunchError(
            launchButton,
            "Upload student answer sheets"
        );

        return;

    }


    if (
        batchState.evaluators.length === 0
    ) {

        showLaunchError(
            launchButton,
            "Assign at least one evaluator"
        );

        return;

    }


    /* -----------------------------------------------------
       Processing state
    ----------------------------------------------------- */

    launchButton.disabled =
        true;

    launchButton.innerHTML =
        `
            <span>✦</span>
            Initialising AI evaluation pipeline...
        `;


    /* -----------------------------------------------------
       Simulated AI processing
    ----------------------------------------------------- */

    setTimeout(() => {

        launchButton.innerHTML =
            `
                <span>◌</span>
                Reading answer key...
            `;

    }, 900);


    setTimeout(() => {

        launchButton.innerHTML =
            `
                <span>◌</span>
                Processing answer sheets...
            `;

    }, 1800);


    setTimeout(() => {

        launchButton.innerHTML =
            `
                <span>✦</span>
                Assigning evaluation workload...
            `;

    }, 2700);


    setTimeout(() => {

        completeBatchCreation(
            batchName,
            subject,
            examination,
            maxMarks
        );

    }, 3600);

}


/* =========================================================
   BATCH CREATION SUCCESS
========================================================= */

function completeBatchCreation(
    batchName,
    subject,
    examination,
    maxMarks
) {

    const launchButton =
        document.querySelector(
            ".launch-button"
        );


    if (launchButton) {

        launchButton.disabled =
            true;

        launchButton.innerHTML =
            `
                <span>✓</span>
                Evaluation Pipeline Ready
                <b>✓</b>
            `;

        launchButton.style.background =
            "linear-gradient(120deg,#15803d,#22c55e)";

    }


    /* -----------------------------------------------------
       Add new batch to dashboard
    ----------------------------------------------------- */

    addBatchToDashboard(
        batchName,
        subject,
        examination
    );


    /* -----------------------------------------------------
       Show success message
    ----------------------------------------------------- */

    setTimeout(() => {

        alert(

            "Evaluation batch created successfully.\n\n" +

            `Batch: ${batchName}\n` +

            `Subject: ${subject}\n` +

            `Evaluators: ${batchState.evaluators.length}\n` +

            `Answer Sheets: ${batchState.answerSheets.length}\n\n` +

            "The AI evaluation pipeline is now ready."

        );


    }, 300);

}


/* =========================================================
   ADD NEW BATCH TO DASHBOARD
========================================================= */

function addBatchToDashboard(
    batchName,
    subject,
    examination
) {

    const batchList =
        document.querySelector(
            ".batches-panel .batch-list"
        );


    if (!batchList) {
        return;
    }


    const batch =
        document.createElement("div");


    batch.className =
        "batch-row";


    batch.innerHTML =
        `
            <div class="batch-main">

                <div class="subject-icon">
                    ${getInitial(subject)}
                </div>

                <div>

                    <strong>
                        ${escapeHTML(batchName)}
                    </strong>

                    <small>
                        ${escapeHTML(examination)}
                        · ${batchState.answerSheets.length}
                        sheets
                    </small>

                </div>

            </div>


            <div class="batch-progress">

                <div>

                    <span>
                        0%
                    </span>

                    <small>
                        0 /
                        ${batchState.answerSheets.length}
                    </small>

                </div>

                <div class="bar">

                    <i style="width:0%"></i>

                </div>

            </div>


            <span class="batch-status active-status">
                AI Ready
            </span>
        `;


    batchList.prepend(
        batch
    );


    /* -----------------------------------------------------
       Entrance animation
    ----------------------------------------------------- */

    batch.style.opacity =
        "0";

    batch.style.transform =
        "translateY(-12px)";


    requestAnimationFrame(() => {

        batch.style.transition =
            "all .5s cubic-bezier(.22,1,.36,1)";

        batch.style.opacity =
            "1";

        batch.style.transform =
            "translateY(0)";

    });

}


/* =========================================================
   INITIAL LETTER
========================================================= */

function getInitial(text) {

    if (!text) {
        return "E";
    }

    return text
        .trim()
        .charAt(0)
        .toUpperCase();

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}


/* =========================================================
   LAUNCH ERROR
========================================================= */

function showLaunchError(
    button,
    message
) {

    const original =
        button.innerHTML;


    button.innerHTML =
        `
            <span>!</span>
            ${message}
        `;


    button.style.background =
        "linear-gradient(120deg,#b91c1c,#ef4444)";


    setTimeout(() => {

        button.innerHTML =
            original;

        button.style.background =
            "";

    }, 2200);

}


/* =========================================================
   DASHBOARD NUMBER ANIMATION
========================================================= */

function animateNumbers() {

    const numbers =
        document.querySelectorAll(
            ".metric-card > strong"
        );


    numbers.forEach((element) => {

        const target =
            parseInt(
                element.textContent
                    .replace(/,/g, ""),
                10
            );


        if (
            Number.isNaN(target)
        ) {
            return;
        }


        let current = 0;

        const duration = 900;

        const start =
            performance.now();


        function update(time) {

            const progress =
                Math.min(
                    (time - start) /
                    duration,
                    1
                );


            const eased =
                1 -
                Math.pow(
                    1 - progress,
                    3
                );


            current =
                Math.floor(
                    target * eased
                );


            element.textContent =
                current.toLocaleString();


            if (progress < 1) {

                requestAnimationFrame(
                    update
                );

            }

        }


        requestAnimationFrame(
            update
        );

    });

}


/* =========================================================
   LIVE AI SYSTEM STATUS
========================================================= */

function startSystemPulse() {

    const status =
        document.querySelector(
            ".system-pill span"
        );


    if (!status) {
        return;
    }


    let active = true;


    setInterval(() => {

        active = !active;

        status.style.opacity =
            active ? "1" : ".35";

    }, 1100);

}


/* =========================================================
   AI ATTENTION CLICK
========================================================= */

function initialiseAttentionItems() {

    const items =
        document.querySelectorAll(
            ".feed-item"
        );


    items.forEach((item) => {

        item.addEventListener(
            "click",
            () => {

                showPage(
                    "ai-review"
                );

            }
        );

    });

}


/* =========================================================
   CREATE BATCH BUTTON
========================================================= */

function initialiseCreateBatchButtons() {

    const buttons =
        document.querySelectorAll(
            ".create-batch-btn, .big-action"
        );


    buttons.forEach((button) => {

        button.addEventListener(
            "click",
            () => {

                showPage(
                    "create-batch"
                );

            }
        );

    });

}


/* =========================================================
   RESET BATCH FORM
========================================================= */

function resetBatchState() {

    batchState.answerKey =
        null;

    batchState.answerSheets =
        [];

    batchState.evaluators =
        [];

    batchState.aiFeatures = {

        assistedMarking:true,

        uncheckedAnswers:true,

        markingAnomalies:true,

        unusualScoring:true

    };

}


/* =========================================================
   INITIAL PAGE SETUP
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /* Dashboard */

        animateNumbers();


        /* Live system */

        startSystemPulse();


        /* AI feed */

        initialiseAttentionItems();


        /* Create batch shortcuts */

        initialiseCreateBatchButtons();


        /* Initialise batch page */

        initialiseBatchPage();

    }
);


/* =========================================================
   INITIAL DASHBOARD STATE
========================================================= */

showPage("dashboard");


/* =========================================================
   LANGUAGE SELECTOR
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const languageButton =
        document.getElementById("languageButton");

    const languageMenu =
        document.getElementById("languageMenu");

    const languageSelector =
        document.getElementById("languageSelector");

    const languageCurrent =
        document.querySelector(".language-current");

    const languageOptions =
        document.querySelectorAll(".language-option");


    if (
        !languageButton ||
        !languageMenu ||
        !languageSelector
    ) {
        return;
    }


    /* -----------------------------------------
       LANGUAGE NAMES
    ----------------------------------------- */

    const languageNames = {
        en: "English",
        hi: "हिन्दी",
        pa: "ਪੰਜਾਬੀ",
        mr: "मराठी",
        gu: "ગુજરાતી",
        bn: "বাংলা",
        ta: "தமிழ்",
        te: "తెలుగు"
    };


    /* -----------------------------------------
       GET SAVED LANGUAGE
    ----------------------------------------- */

    let currentLanguage =
        localStorage.getItem("parikshaLanguage") || "en";


    /* -----------------------------------------
       UPDATE SELECTED LANGUAGE
    ----------------------------------------- */

    function updateLanguageUI(language) {

        if (languageCurrent) {

            languageCurrent.textContent =
                languageNames[language] ||
                languageNames.en;

        }


        languageOptions.forEach((option) => {

            option.classList.toggle(
                "active",
                option.dataset.language === language
            );

        });

    }


    /* -----------------------------------------
       OPEN / CLOSE MENU
    ----------------------------------------- */

    


    /* -----------------------------------------
       SELECT LANGUAGE
    ----------------------------------------- */

    languageOptions.forEach((option) => {

        option.addEventListener(
            "click",
            () => {

                const language =
                    option.dataset.language;


                if (!language) {
                    return;
                }


                currentLanguage =
                    language;


                /* Save globally */

                localStorage.setItem(
                    "parikshaLanguage",
                    language
                );


                /* Update selector */

                updateLanguageUI(
                    language
                );


                /* Close menu */

                languageMenu.classList.remove(
                    "open"
                );

                languageSelector.classList.remove(
                    "open"
                );

                languageButton.setAttribute(
                    "aria-expanded",
                    "false"
                );


                /*
                   Tell language.js to update
                   the dashboard immediately.
                */

                document.dispatchEvent(
                    new CustomEvent(
                        "parikshaLanguageChanged",
                        {
                            detail: {
                                language:
                                    language
                            }
                        }
                    )
                );

            }
        );

    });


    /* -----------------------------------------
       CLOSE WHEN CLICKING OUTSIDE
    ----------------------------------------- */

    document.addEventListener(
        "click",
        () => {

            languageMenu.classList.remove(
                "open"
            );

            languageSelector.classList.remove(
                "open"
            );

            languageButton.setAttribute(
                "aria-expanded",
                "false"
            );

        }
    );


    /* -----------------------------------------
       INITIAL STATE
    ----------------------------------------- */

    updateLanguageUI(
        currentLanguage
    );

});