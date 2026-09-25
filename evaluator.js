/* ============================================================
   PARIKSHA SETU — EVALUATOR WORKSPACE
   Functional Frontend Prototype
   Data persists using localStorage
============================================================ */

(() => {
    "use strict";

    const STORAGE_KEY = "parikshaEvaluatorState";
    const LANGUAGE_KEY = "parikshaLanguage";

    /* =========================================================
       QUESTION / RUBRIC DATA
    ========================================================= */

    const QUESTIONS = [
        {
            id: 1,
            text: "Define the concept and explain its significance.",
            maxMarks: 5,
            answer: "The candidate defines the concept correctly and explains its primary significance with relevant terminology."
        },
        {
            id: 2,
            text: "Explain the working principle with a suitable example.",
            maxMarks: 5,
            answer: "The response describes the working principle and includes an example that is relevant to the question."
        },
        {
            id: 3,
            text: "Compare the two approaches discussed in the question.",
            maxMarks: 5,
            answer: "The candidate identifies the major differences and compares the approaches using appropriate points."
        },
        {
            id: 4,
            text: "Describe the main steps involved in the process.",
            maxMarks: 5,
            answer: "The answer contains the main process steps in a logically correct order."
        },
        {
            id: 5,
            text: "Discuss the advantages and limitations.",
            maxMarks: 5,
            answer: "The response identifies multiple advantages and at least one relevant limitation."
        },
        {
            id: 6,
            text: "Solve the given problem and show the method used.",
            maxMarks: 5,
            answer: "The candidate follows a valid method and reaches a substantially correct result."
        },
        {
            id: 7,
            text: "Explain the result obtained in the previous question.",
            maxMarks: 5,
            answer: "The result is interpreted correctly and connected to the underlying concept."
        },
        {
            id: 8,
            text: "Write a short note on the practical application of the concept.",
            maxMarks: 5,
            answer: "The answer describes a practical application and explains why the concept is useful there."
        },
        {
            id: 9,
            text: "Identify the key factors affecting the outcome.",
            maxMarks: 5,
            answer: "The candidate identifies the principal factors and briefly explains their influence."
        },
        {
            id: 10,
            text: "Summarize the overall conclusion.",
            maxMarks: 5,
            answer: "The conclusion is consistent with the preceding answer and captures the essential finding."
        }
    ];

    /* =========================================================
       HELPERS
    ========================================================= */

    const $ = (selector, root = document) =>
        root.querySelector(selector);

    const $$ = (selector, root = document) =>
        [...root.querySelectorAll(selector)];

    const escapeHTML = value =>
        String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll('"', "&quot;")
            .replaceAll("'", "&#039;");

    /* =========================================================
       PAGE ELEMENTS
    ========================================================= */

    const els = {
        dashboard: null,
        assigned: null,
        completed: null,
        ai: null,
        nav: [],
        stats: [],
        dashboardTable: null,
        progressRing: null,
        progressValue: null,
        progressBar: null,
        notificationButton: null,
        logoutButton: null,
        openAssignedButton: null,
        viewAllButton: null,
        languageCurrent: null
    };

    function cacheElements() {
        els.dashboard = $("#dashboardSection");
        els.assigned = $("#assignedSection");
        els.completed = $("#completedSection");
        els.ai = $("#aiAssistanceSection");

        els.nav = $$(".nav-item");
        els.stats = $$(".stat-number");

        els.dashboardTable = $("#dashboardSection tbody");

        els.progressRing = $(".progress-ring");
        els.progressValue = $(".progress-ring-inner strong");
        els.progressBar = $(".progress-bar span");

        els.notificationButton = $("#notificationButton");
        els.logoutButton = $("#logoutButton");
        els.openAssignedButton = $("#openAssignedButton");
        els.viewAllButton = $("#viewAllButton");

        els.languageCurrent = $(".language-current");
    }

    /* =========================================================
       DEMO DATA
    ========================================================= */

    function createSheets() {
        const subjects = [
            "B.Tech Mathematics",
            "Engineering Physics",
            "Data Structures",
            "Digital Electronics"
        ];

        const sheets = [];

        for (let i = 0; i < 50; i++) {

            const candidate = String(10452 + i);
            const completed = i < 32;

            sheets.push({
                id: `SHEET-${candidate}`,
                candidate,
                subject: subjects[i % subjects.length],
                questions: 10,
                maxScore: 50,

                status: completed
                    ? "completed"
                    : "pending",

                score: completed
                    ? 32 + ((i * 3) % 17)
                    : null,

                aiAssisted: completed,

                submittedAt: completed
                    ? `2026-09-${String((i % 25) + 1).padStart(2, "0")}`
                    : null,

                answers: QUESTIONS.map((q, qIndex) => ({
                    questionId: q.id,

                    marks: completed
                        ? Math.min(
                            q.maxMarks,
                            Math.max(
                                0,
                                ((i + qIndex * 2) % 6)
                            )
                        )
                        : null,

                    answer: q.answer,
                    comment: ""
                }))
            });
        }

        return sheets;
    }

    function defaultState() {
        return {
            sheets: createSheets(),

            activeSheetId: null,

            notifications: [
                {
                    id: 1,
                    title: "New answer sheets assigned",
                    text: "18 sheets are awaiting evaluation.",
                    read: false
                },
                {
                    id: 2,
                    title: "AI engine ready",
                    text: "Rubric matching and answer analysis are available.",
                    read: false
                },
                {
                    id: 3,
                    title: "Evaluation workspace ready",
                    text: "Your current workload is synchronized locally.",
                    read: true
                }
            ]
        };
    }

    let state;

    function loadState() {
        try {
            const saved =
                JSON.parse(
                    localStorage.getItem(STORAGE_KEY)
                );

            if (
                saved &&
                Array.isArray(saved.sheets)
            ) {
                return saved;
            }

        } catch (error) {
            console.warn(
                "Could not load evaluator state.",
                error
            );
        }

        return defaultState();
    }

    function saveState() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(state)
        );
    }

    /* =========================================================
       DATA HELPERS
    ========================================================= */

    function getCompleted() {
        return state.sheets.filter(
            sheet => sheet.status === "completed"
        );
    }

    function getPending() {
        return state.sheets.filter(
            sheet => sheet.status !== "completed"
        );
    }

    function getProgress() {
        if (!state.sheets.length) return 0;

        return Math.round(
            getCompleted().length /
            state.sheets.length *
            100
        );
    }

    function getScore(answers) {
        return answers.reduce(
            (total, answer) =>
                total + (Number(answer.marks) || 0),
            0
        );
    }

    function getCandidateAvatar(candidate) {
        return String(candidate).slice(-2);
    }

    /* =========================================================
       DASHBOARD
    ========================================================= */

    function updateDashboard() {

        const assigned = state.sheets.length;
        const completed = getCompleted().length;
        const pending = assigned - completed;
        const aiAssisted =
            state.sheets.filter(
                sheet => sheet.aiAssisted
            ).length;

        const progress = getProgress();

        const values = [
            assigned,
            completed,
            pending,
            aiAssisted
        ];

        els.stats.forEach(
            (element, index) => {
                if (values[index] !== undefined) {
                    element.textContent =
                        values[index];
                }
            }
        );

        if (els.progressRing) {
            els.progressRing.style.setProperty(
                "--progress",
                `${progress * 3.6}deg`
            );
        }

        if (els.progressValue) {
            els.progressValue.textContent =
                `${progress}%`;
        }

        if (els.progressBar) {
            els.progressBar.style.width =
                `${progress}%`;
        }

        const progressValues = [
            assigned,
            completed,
            pending
        ];

        $$(".progress-row").forEach(
            (row, index) => {

                const number =
                    row.querySelector("strong");

                if (number) {
                    number.textContent =
                        progressValues[index];
                }
            }
        );

        renderDashboardTable();
    }

    function renderDashboardTable() {

        if (!els.dashboardTable) return;

        const sheets =
            state.sheets.slice(0, 3);

        els.dashboardTable.innerHTML =
            sheets.map(
                createSheetRow
            ).join("");

        bindSheetActions(
            els.dashboardTable
        );
    }

    function createSheetRow(sheet) {

        const completed =
            sheet.status === "completed";

        return `
            <tr data-sheet="${escapeHTML(sheet.id)}">

                <td>
                    <div class="candidate-cell">

                        <div class="candidate-avatar">
                            ${escapeHTML(
                                getCandidateAvatar(
                                    sheet.candidate
                                )
                            )}
                        </div>

                        <div>
                            <strong>
                                Candidate #${escapeHTML(
                                    sheet.candidate
                                )}
                            </strong>

                            <span>
                                Answer Sheet
                            </span>
                        </div>

                    </div>
                </td>

                <td>
                    ${escapeHTML(sheet.subject)}
                </td>

                <td>
                    ${sheet.questions}
                </td>

                <td>
                    <span class="status ${
                        completed
                            ? "completed"
                            : "pending"
                    }">
                        ${
                            completed
                                ? "Completed"
                                : "Pending"
                        }
                    </span>
                </td>

                <td>

                    <button
                        class="table-action ${
                            completed
                                ? "view-action"
                                : "evaluate-action"
                        }"
                        data-candidate="${
                            escapeHTML(
                                sheet.candidate
                            )
                        }"
                    >
                        ${
                            completed
                                ? "View →"
                                : "Evaluate →"
                        }
                    </button>

                </td>

            </tr>
        `;
    }

    function bindSheetActions(root = document) {

        $$(".evaluate-action, .view-action", root)
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const candidate =
                            button.dataset.candidate;

                        const sheet =
                            state.sheets.find(
                                item =>
                                    item.candidate ===
                                    candidate
                            );

                        if (!sheet) return;

                        openEvaluation(
                            sheet,
                            sheet.status ===
                                "completed"
                        );
                    }
                );
            });
    }

    /* =========================================================
       NAVIGATION
    ========================================================= */

    function navigate(section) {

        const sections = {
            dashboard: els.dashboard,
            assigned: els.assigned,
            completed: els.completed,
            "ai-assistance": els.ai
        };

        Object.entries(sections)
            .forEach(([name, sectionElement]) => {

                if (sectionElement) {
                    sectionElement.classList.toggle(
                        "active",
                        name === section
                    );
                }
            });

        els.nav.forEach(item => {

            item.classList.toggle(
                "active",
                item.dataset.section === section
            );

        });

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

        if (section === "assigned") {
            renderAssignedPage();
        }

        if (section === "completed") {
            renderCompletedPage();
        }

        if (section === "ai-assistance") {
            renderAIPage();
        }
    }

    /* =========================================================
       ASSIGNED SHEETS
    ========================================================= */

    function renderAssignedPage() {

        if (!els.assigned) return;

        els.assigned.innerHTML = `

            <div class="page-header simple">

                <div>

                    <div class="eyebrow">
                        WORK QUEUE
                    </div>

                    <h1>
                        Assigned
                        <span>Answer Sheets</span>
                    </h1>

                    <p>
                        Answer sheets currently assigned to you.
                    </p>

                </div>

            </div>

            <div class="panel">

                <div class="panel-header">

                    <div>

                        <span class="panel-eyebrow">
                            WORK QUEUE
                        </span>

                        <h2>
                            Assigned Answer Sheets
                        </h2>

                        <p id="assignedCountText">
                            ${getPending().length}
                            sheets awaiting evaluation.
                        </p>

                    </div>

                    <button
                        class="secondary-button"
                        id="refreshAssignedButton"
                    >
                        Refresh ↻
                    </button>

                </div>

                <div class="queue-toolbar">

                    <div class="queue-search">

                        <span>⌕</span>

                        <input
                            id="sheetSearch"
                            type="search"
                            placeholder="Search candidate or subject..."
                            autocomplete="off"
                        >

                    </div>

                    <select
                        id="sheetFilter"
                        class="queue-filter"
                    >
                        <option value="all">
                            All sheets
                        </option>

                        <option value="pending">
                            Pending
                        </option>

                        <option value="completed">
                            Completed
                        </option>
                    </select>

                </div>

                <div class="table-wrapper">

                    <table>

                        <thead>

                            <tr>
                                <th>CANDIDATE</th>
                                <th>EXAM</th>
                                <th>QUESTIONS</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>

                        </thead>

                        <tbody id="assignedTableBody">
                        </tbody>

                    </table>

                </div>

            </div>
        `;

        renderSheetList();

        $("#sheetSearch")
            ?.addEventListener(
                "input",
                renderSheetList
            );

        $("#sheetFilter")
            ?.addEventListener(
                "change",
                renderSheetList
            );

        $("#refreshAssignedButton")
            ?.addEventListener(
                "click",
                () => {

                    renderSheetList();

                    toast(
                        "Work queue refreshed"
                    );
                }
            );
    }

    function renderSheetList() {

        const body =
            $("#assignedTableBody");

        if (!body) return;

        const search =
            ($("#sheetSearch")?.value || "")
                .toLowerCase()
                .trim();

        const filter =
            $("#sheetFilter")?.value ||
            "all";

        const results =
            state.sheets.filter(sheet => {

                const matchesSearch =
                    !search ||
                    sheet.candidate
                        .toLowerCase()
                        .includes(search) ||
                    sheet.subject
                        .toLowerCase()
                        .includes(search);

                const matchesFilter =
                    filter === "all" ||
                    sheet.status === filter;

                return (
                    matchesSearch &&
                    matchesFilter
                );
            });

        body.innerHTML =
            results.length

                ? results
                    .map(createSheetRow)
                    .join("")

                : `
                    <tr>
                        <td colspan="5">
                            <div class="empty-inline">
                                No answer sheets match your search.
                            </div>
                        </td>
                    </tr>
                `;

        bindSheetActions(body);
    }

    /* =========================================================
       COMPLETED PAGE
    ========================================================= */

    function renderCompletedPage() {

        if (!els.completed) return;

        const completed =
            getCompleted();

        els.completed.innerHTML = `

            <div class="page-header simple">

                <div>

                    <div class="eyebrow">
                        EVALUATION HISTORY
                    </div>

                    <h1>
                        Completed
                        <span>Evaluations</span>
                    </h1>

                    <p>
                        Review evaluations that you have already submitted.
                    </p>

                </div>

            </div>

            <div class="panel">

                <div class="panel-header">

                    <div>

                        <span class="panel-eyebrow">
                            EVALUATION HISTORY
                        </span>

                        <h2>
                            Completed Evaluations
                        </h2>

                        <p>
                            ${completed.length}
                            evaluations submitted.
                        </p>

                    </div>

                    <button
                        class="secondary-button"
                        id="exportEvaluationsButton"
                    >
                        Export CSV ↓
                    </button>

                </div>

                <div class="table-wrapper">

                    <table>

                        <thead>

                            <tr>
                                <th>CANDIDATE</th>
                                <th>EXAM</th>
                                <th>SCORE</th>
                                <th>SUBMITTED</th>
                                <th>ACTION</th>
                            </tr>

                        </thead>

                        <tbody>

                            ${
                                completed.map(
                                    sheet => `
                                        <tr>

                                            <td>

                                                <div class="candidate-cell">

                                                    <div class="candidate-avatar">
                                                        ${getCandidateAvatar(
                                                            sheet.candidate
                                                        )}
                                                    </div>

                                                    <div>

                                                        <strong>
                                                            Candidate #${escapeHTML(
                                                                sheet.candidate
                                                            )}
                                                        </strong>

                                                        <span>
                                                            Answer Sheet
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    sheet.subject
                                                )}
                                            </td>

                                            <td>
                                                <strong>
                                                    ${sheet.score}/${sheet.maxScore}
                                                </strong>
                                            </td>

                                            <td>
                                                ${escapeHTML(
                                                    sheet.submittedAt ||
                                                    "—"
                                                )}
                                            </td>

                                            <td>

                                                <button
                                                    class="table-action view-action"
                                                    data-candidate="${escapeHTML(
                                                        sheet.candidate
                                                    )}"
                                                >
                                                    View →
                                                </button>

                                            </td>

                                        </tr>
                                    `
                                ).join("")
                            }

                        </tbody>

                    </table>

                </div>

            </div>
        `;

        bindSheetActions(
            els.completed
        );

        $("#exportEvaluationsButton")
            ?.addEventListener(
                "click",
                exportCSV
            );
    }

    /* =========================================================
       AI ASSISTANCE
    ========================================================= */

    function renderAIPage() {

        if (!els.ai) return;

        const cards =
            $$(".ai-tool-card", els.ai);

        cards.forEach((card, index) => {

            const oldButton =
                card.querySelector(
                    ".tool-action"
                );

            if (oldButton) {
                oldButton.remove();
            }

            const button =
                document.createElement("button");

            button.type = "button";
            button.className = "tool-action";

            button.textContent =
                index === 0
                    ? "Test Rubric →"
                    : index === 1
                        ? "Analyze Sample →"
                        : "Run Detection →";

            card.appendChild(button);

            button.addEventListener(
                "click",
                () => runAITool(index)
            );
        });
    }

    function runAITool(index) {

        const names = [
            "Rubric matching",
            "Answer analysis",
            "Marking anomaly detection"
        ];

        const results = [

            "Rubric matched against 10 evaluation criteria.",

            "Key concepts identified in the sample response.",

            "No critical anomaly detected in the current sample."
        ];

        showAIResult(
            names[index],
            results[index]
        );
    }

    function showAIResult(
        title,
        message
    ) {

        const modal =
            createModal(
                "AI Analysis Result",

                `
                    <div class="ai-result-box">

                        <div class="ai-result-icon">
                            ✦
                        </div>

                        <div>

                            <strong>
                                ${escapeHTML(title)}
                            </strong>

                            <p>
                                ${escapeHTML(message)}
                            </p>

                        </div>

                    </div>

                    <p class="modal-note">
                        This prototype result is advisory.
                        The evaluator remains responsible
                        for the final marks.
                    </p>
                `,

                [
                    {
                        label: "Close",
                        className:
                            "secondary-button",
                        action: closeModal
                    }
                ]
            );

        document.body.appendChild(modal);
    }

    /* =========================================================
       EVALUATION WORKSPACE
    ========================================================= */

    function openEvaluation(
        sheet,
        readOnly = false
    ) {

        state.activeSheetId =
            sheet.id;

        saveState();

        const overlay =
            document.createElement("div");

        overlay.className =
            "evaluation-overlay";

        overlay.id =
            "evaluationOverlay";

        const answers =
            sheet.answers ||
            QUESTIONS.map(q => ({
                questionId: q.id,
                marks: null,
                answer: q.answer,
                comment: ""
            }));

        overlay.innerHTML = `

            <div class="evaluation-modal">

                <div class="evaluation-modal-header">

                    <div>

                        <span class="panel-eyebrow">
                            EVALUATION WORKSPACE
                        </span>

                        <h2>
                            Candidate #${escapeHTML(
                                sheet.candidate
                            )}
                        </h2>

                        <p>
                            ${escapeHTML(
                                sheet.subject
                            )}
                            ·
                            ${sheet.questions}
                            questions
                            ·
                            ${
                                readOnly
                                    ? "Submitted evaluation"
                                    : "Pending evaluation"
                            }
                        </p>

                    </div>

                    <button
                        class="modal-close"
                        id="closeEvaluationButton"
                    >
                        ×
                    </button>

                </div>

                <div class="evaluation-meta">

                    <div>
                        <span>Candidate</span>
                        <strong>
                            #${escapeHTML(
                                sheet.candidate
                            )}
                        </strong>
                    </div>

                    <div>
                        <span>Maximum</span>
                        <strong>
                            ${sheet.maxScore}
                        </strong>
                    </div>

                    <div>
                        <span>Current score</span>
                        <strong id="currentScore">
                            ${getScore(answers)}
                        </strong>
                    </div>

                    <div>
                        <span>AI support</span>
                        <strong>
                            ${
                                sheet.aiAssisted
                                    ? "Used"
                                    : "Available"
                            }
                        </strong>
                    </div>

                </div>

                <div class="evaluation-layout">

                    <aside class="question-list">

                        <div class="question-list-title">
                            QUESTIONS
                        </div>

                        ${
                            QUESTIONS.map(
                                q => `
                                    <button
                                        class="question-nav ${
                                            q.id === 1
                                                ? "active"
                                                : ""
                                        }"
                                        data-question="${q.id}"
                                    >
                                        <span>
                                            Q${q.id}
                                        </span>

                                        <small>
                                            ${q.maxMarks} marks
                                        </small>
                                    </button>
                                `
                            ).join("")
                        }

                    </aside>

                    <section class="question-workspace">

                        <div id="questionWorkspace">
                        </div>

                    </section>

                </div>

                <div class="evaluation-footer">

                    <span id="evaluationStatus">
                        ${
                            readOnly
                                ? "Submitted"
                                : "Draft evaluation"
                        }
                    </span>

                    <div>

                        <button
                            class="secondary-button"
                            id="aiSuggestButton"
                        >
                            ✦ AI Suggest Marks
                        </button>

                        ${
                            readOnly
                                ? ""
                                : `
                                    <button
                                        class="primary-button"
                                        id="saveEvaluationButton"
                                    >
                                        Save Draft
                                    </button>

                                    <button
                                        class="primary-button submit-evaluation"
                                        id="submitEvaluationButton"
                                    >
                                        Submit Evaluation →
                                    </button>
                                `
                        }

                    </div>

                </div>

            </div>
        `;

        document.body.appendChild(
            overlay
        );

        let activeQuestion = 1;

        renderQuestion();

        $("#closeEvaluationButton")
            .addEventListener(
                "click",
                closeModal
            );

        overlay.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    overlay
                ) {
                    closeModal();
                }
            }
        );

        $$(".question-nav", overlay)
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        activeQuestion =
                            Number(
                                button.dataset.question
                            );

                        $$(".question-nav", overlay)
                            .forEach(
                                item =>
                                    item.classList.toggle(
                                        "active",
                                        item === button
                                    )
                            );

                        renderQuestion();
                    }
                );
            });

        $("#aiSuggestButton")
            .addEventListener(
                "click",
                suggestMarks
            );

        $("#saveEvaluationButton")
            ?.addEventListener(
                "click",
                saveDraft
            );

        $("#submitEvaluationButton")
            ?.addEventListener(
                "click",
                submitEvaluation
            );

        function currentAnswer() {

            return answers.find(
                answer =>
                    answer.questionId ===
                    activeQuestion
            );
        }

        function renderQuestion() {

            const question =
                QUESTIONS.find(
                    q =>
                        q.id ===
                        activeQuestion
                );

            const answer =
                currentAnswer();

            const marks =
                answer?.marks ??
                "";

            const disabled =
                readOnly
                    ? "disabled"
                    : "";

            $("#questionWorkspace")
                .innerHTML = `

                    <div class="question-head">

                        <div>

                            <span class="question-number">
                                QUESTION ${question.id}
                            </span>

                            <h3>
                                ${escapeHTML(
                                    question.text
                                )}
                            </h3>

                        </div>

                        <span class="max-mark-badge">
                            ${question.maxMarks}
                            marks
                        </span>

                    </div>

                    <div class="answer-paper">

                        <div class="answer-paper-label">
                            CANDIDATE RESPONSE
                        </div>

                        <p>
                            ${escapeHTML(
                                answer?.answer ||
                                "No response captured."
                            )}
                        </p>

                    </div>

                    <div class="marking-grid">

                        <div class="mark-box">

                            <label>
                                Award marks
                            </label>

                            <div class="marks-input-wrap">

                                <input
                                    id="marksInput"
                                    type="number"
                                    min="0"
                                    max="${question.maxMarks}"
                                    step="0.5"
                                    value="${marks}"
                                    ${disabled}
                                >

                                <span>
                                    / ${question.maxMarks}
                                </span>

                            </div>

                        </div>

                        <div class="ai-insight">

                            <span>
                                ✦ AI INSIGHT
                            </span>

                            <strong
                                id="aiInsightText"
                            >
                                Run AI assistance to
                                generate a marking suggestion.
                            </strong>

                        </div>

                    </div>

                    <div class="evaluation-comment">

                        <label>
                            Evaluator remarks
                            <span>
                                optional
                            </span>
                        </label>

                        <textarea
                            id="commentInput"
                            rows="4"
                            ${disabled}
                            placeholder="Add a concise reason for the awarded marks..."
                        >${escapeHTML(
                            answer?.comment || ""
                        )}</textarea>

                    </div>
                `;

            $("#marksInput")
                ?.addEventListener(
                    "input",
                    updateScore
                );

            $("#commentInput")
                ?.addEventListener(
                    "input",
                    event => {

                        if (answer) {
                            answer.comment =
                                event.target.value;
                        }
                    }
                );

            updateScore();
        }

        function updateScore() {

            const input =
                $("#marksInput");

            if (!input) return;

            const question =
                QUESTIONS.find(
                    q =>
                        q.id ===
                        activeQuestion
                );

            const answer =
                currentAnswer();

            const value =
                Number(input.value);

            if (
                input.value !== "" &&
                Number.isFinite(value)
            ) {

                answer.marks =
                    Math.max(
                        0,
                        Math.min(
                            question.maxMarks,
                            value
                        )
                    );

            } else {

                answer.marks = null;

            }

            $("#currentScore")
                .textContent =
                getScore(answers);
        }

        function suggestMarks() {

            const question =
                QUESTIONS.find(
                    q =>
                        q.id ===
                        activeQuestion
                );

            const answer =
                currentAnswer();

            const suggestion =
                Math.round(
                    question.maxMarks *
                    0.8 *
                    2
                ) / 2;

            answer.marks =
                suggestion;

            $("#marksInput").value =
                suggestion;

            $("#aiInsightText")
                .textContent =
                `Suggested ${suggestion}/${question.maxMarks} based on rubric coverage. Review before applying.`;

            $("#currentScore")
                .textContent =
                getScore(answers);

            sheet.aiAssisted = true;

            toast(
                "AI suggestion generated — examiner review required"
            );
        }

        function saveDraft() {

            sheet.answers =
                answers;

            state.evaluations =
                state.evaluations || {};

            state.evaluations[
                sheet.id
            ] = {
                status: "draft",
                answers,
                updatedAt:
                    new Date().toISOString()
            };

            saveState();

            $("#evaluationStatus")
                .textContent =
                "Draft saved";

            toast(
                "Evaluation draft saved"
            );
        }

        function submitEvaluation() {

            const incomplete =
                answers.some(
                    answer =>
                        answer.marks === null ||
                        answer.marks === undefined ||
                        answer.marks === ""
                );

            if (incomplete) {

                toast(
                    "Please award marks for all questions before submitting",
                    "error"
                );

                return;
            }

            const total =
                getScore(answers);

            sheet.answers =
                answers;

            sheet.score =
                total;

            sheet.status =
                "completed";

            sheet.submittedAt =
                new Date()
                    .toISOString()
                    .slice(0, 10);

            sheet.aiAssisted =
                sheet.aiAssisted || false;

            state.evaluations =
                state.evaluations || {};

            state.evaluations[
                sheet.id
            ] = {
                status: "submitted",
                answers,
                score: total,
                submittedAt:
                    sheet.submittedAt
            };

            state.notifications.unshift({

                id: Date.now(),

                title:
                    `Evaluation submitted for #${sheet.candidate}`,

                text:
                    `Final score: ${total}/${sheet.maxScore}.`,

                read: false
            });

            state.activeSheetId =
                null;

            saveState();

            updateDashboard();

            closeModal();

            toast(
                `Evaluation submitted — ${total}/${sheet.maxScore}`
            );

            navigate("completed");
        }
    }

    /* =========================================================
       MODALS
    ========================================================= */

    function closeModal() {

        $("#evaluationOverlay")
            ?.remove();

        $("#genericModal")
            ?.remove();
    }

    function createModal(
        title,
        body,
        buttons = []
    ) {

        const modal =
            document.createElement("div");

        modal.className =
            "evaluation-overlay";

        modal.id =
            "genericModal";

        modal.innerHTML = `

            <div class="evaluation-modal compact-modal">

                <div class="evaluation-modal-header">

                    <div>

                        <span class="panel-eyebrow">
                            PARIKSHA SETU AI
                        </span>

                        <h2>
                            ${escapeHTML(title)}
                        </h2>

                    </div>

                    <button
                        class="modal-close"
                    >
                        ×
                    </button>

                </div>

                <div class="modal-body">
                    ${body}
                </div>

                <div class="evaluation-footer">

                    <span></span>

                    <div class="modal-buttons">
                    </div>

                </div>

            </div>
        `;

        $(".modal-close", modal)
            .addEventListener(
                "click",
                closeModal
            );

        modal.addEventListener(
            "click",
            event => {

                if (
                    event.target ===
                    modal
                ) {
                    closeModal();
                }
            }
        );

        const buttonWrap =
            $(".modal-buttons", modal);

        buttons.forEach(config => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                config.className ||
                "secondary-button";

            button.textContent =
                config.label;

            button.addEventListener(
                "click",
                config.action
            );

            buttonWrap.appendChild(
                button
            );
        });

        return modal;
    }

    /* =========================================================
       NOTIFICATIONS
    ========================================================= */

    function showNotifications() {

        const existing =
            $("#notificationPanel");

        if (existing) {
            existing.remove();
            return;
        }

        const panel =
            document.createElement("div");

        panel.id =
            "notificationPanel";

        panel.className =
            "notification-panel";

        panel.innerHTML = `

            <div class="notification-panel-header">

                <strong>
                    Notifications
                </strong>

                <button
                    id="markNotificationsRead"
                >
                    Mark all read
                </button>

            </div>

            <div class="notification-list">

                ${
                    state.notifications.length

                        ? state.notifications
                            .map(
                                item => `
                                    <button
                                        class="notification-item ${
                                            item.read
                                                ? "read"
                                                : ""
                                        }"
                                        data-notification="${item.id}"
                                    >

                                        <span
                                            class="notification-dot"
                                        ></span>

                                        <span>

                                            <strong>
                                                ${escapeHTML(
                                                    item.title
                                                )}
                                            </strong>

                                            <small>
                                                ${escapeHTML(
                                                    item.text
                                                )}
                                            </small>

                                        </span>

                                    </button>
                                `
                            )
                            .join("")

                        : `
                            <div class="notification-empty">
                                You're all caught up.
                            </div>
                        `
                }

            </div>
        `;

        document.body.appendChild(
            panel
        );

        $("#markNotificationsRead")
            .addEventListener(
                "click",
                () => {

                    state.notifications
                        .forEach(
                            item =>
                                item.read = true
                        );

                    saveState();

                    panel.remove();

                    showNotifications();
                }
            );

        $$(".notification-item", panel)
            .forEach(item => {

                item.addEventListener(
                    "click",
                    () => {

                        const target =
                            state.notifications.find(
                                notification =>
                                    String(
                                        notification.id
                                    ) ===
                                    item.dataset.notification
                            );

                        if (target) {
                            target.read = true;
                        }

                        saveState();

                        item.classList.add(
                            "read"
                        );
                    }
                );
            });
    }

    /* =========================================================
       TOAST
    ========================================================= */

    function toast(
        message,
        type = "success"
    ) {

        $("#evaluatorToast")
            ?.remove();

        const element =
            document.createElement("div");

        element.id =
            "evaluatorToast";

        element.className =
            `evaluator-toast ${type}`;

        element.innerHTML = `
            <span>
                ${
                    type === "error"
                        ? "!"
                        : "✓"
                }
            </span>

            ${escapeHTML(message)}
        `;

        document.body.appendChild(
            element
        );

        requestAnimationFrame(
            () =>
                element.classList.add(
                    "show"
                )
        );

        setTimeout(
            () => {

                element.classList.remove(
                    "show"
                );

                setTimeout(
                    () =>
                        element.remove(),
                    250
                );

            },
            2800
        );
    }

    /* =========================================================
       EXPORT CSV
    ========================================================= */

    function exportCSV() {

        const rows = [
            [
                "Candidate",
                "Subject",
                "Status",
                "Score",
                "Maximum",
                "Submitted"
            ]
        ];

        getCompleted()
            .forEach(sheet => {

                rows.push([
                    sheet.candidate,
                    sheet.subject,
                    "Completed",
                    sheet.score,
                    sheet.maxScore,
                    sheet.submittedAt || ""
                ]);

            });

        const csv =
            rows
                .map(
                    row =>
                        row
                            .map(
                                value =>
                                    `"${String(value)
                                        .replaceAll(
                                            '"',
                                            '""'
                                        )}"`
                            )
                            .join(",")
                )
                .join("\n");

        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href =
            url;

        link.download =
            "pariksha-setu-evaluations.csv";

        document.body.appendChild(
            link
        );

        link.click();

        link.remove();

        URL.revokeObjectURL(url);

        toast(
            "Evaluation report exported"
        );
    }

    /* =========================================================
       LOGOUT
    ========================================================= */

    function logout() {

        state.activeSheetId =
            null;

        saveState();

        localStorage.removeItem(
            "parikshaEvaluatorSession"
        );

        window.location.href =
            "index.html";
    }

    /* =========================================================
       LANGUAGE
    ========================================================= */

    function syncLanguageLabel() {

        const languages = {

            en: "English",
            hi: "हिन्दी",
            pa: "ਪੰਜਾਬੀ",
            mr: "मराठी",
            gu: "ગુજરાતી",
            bn: "বাংলা",
            ta: "தமிழ்",
            te: "తెలుగు"

        };

        const selected =
            localStorage.getItem(
                LANGUAGE_KEY
            ) || "en";

        if (els.languageCurrent) {

            els.languageCurrent.textContent =
                languages[selected] ||
                "English";
        }
    }

    /* =========================================================
       FUNCTIONAL STYLES
       These styles are only for dynamically-created UI.
       Your main evaluator.css remains untouched.
    ========================================================= */

    function injectFunctionalStyles() {

        if (
            $("#evaluatorFunctionalStyles")
        ) {
            return;
        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "evaluatorFunctionalStyles";

        style.textContent = `

            .queue-toolbar {
                display:flex;
                gap:12px;
                align-items:center;
                margin:4px 0 20px;
                flex-wrap:wrap;
            }

            .queue-search {
                flex:1;
                min-width:240px;
                height:44px;
                display:flex;
                align-items:center;
                gap:8px;
                padding:0 14px;
                border:1px solid #dce7f7;
                border-radius:12px;
                background:#fff;
            }

            .queue-search input {
                border:0;
                outline:0;
                width:100%;
                font:inherit;
                color:#17233d;
                background:transparent;
            }

            .queue-filter {
                height:44px;
                padding:0 14px;
                border:1px solid #dce7f7;
                border-radius:12px;
                background:#fff;
                color:#17233d;
            }

            .empty-inline {
                text-align:center;
                padding:36px;
                color:#7b8da8;
            }

            .tool-action {
                margin-top:18px;
                border:0;
                border-radius:10px;
                padding:10px 14px;
                background:#edf4ff;
                color:#2563eb;
                font-weight:700;
                cursor:pointer;
            }

            .tool-action:hover {
                background:#dceaff;
            }

            .evaluation-overlay {
                position:fixed;
                inset:0;
                z-index:5000;
                background:rgba(10,25,55,.45);
                backdrop-filter:blur(10px);
                display:flex;
                align-items:center;
                justify-content:center;
                padding:22px;
                animation:evalFade .2s ease;
            }

            .evaluation-modal {
                width:min(1180px,96vw);
                max-height:92vh;
                overflow:auto;
                background:#fff;
                border:1px solid #dce7f7;
                border-radius:24px;
                box-shadow:
                    0 30px 100px
                    rgba(15,43,92,.28);
            }

            .compact-modal {
                width:min(560px,94vw);
            }

            .evaluation-modal-header {
                display:flex;
                justify-content:space-between;
                gap:20px;
                padding:24px 28px;
                border-bottom:1px solid #e8eef8;
            }

            .evaluation-modal-header h2 {
                margin:6px 0 4px;
                color:#12213c;
                font-size:25px;
            }

            .evaluation-modal-header p {
                margin:0;
                color:#7c8ea8;
            }

            .modal-close {
                width:38px;
                height:38px;
                border:0;
                border-radius:10px;
                background:#f2f6fc;
                color:#60728f;
                font-size:24px;
                cursor:pointer;
            }

            .evaluation-meta {
                display:grid;
                grid-template-columns:
                    repeat(4,1fr);
                gap:1px;
                background:#e7edf7;
            }

            .evaluation-meta > div {
                background:#fff;
                padding:14px 20px;
                display:flex;
                flex-direction:column;
                gap:5px;
            }

            .evaluation-meta span {
                font-size:10px;
                font-weight:800;
                letter-spacing:1.2px;
                color:#8a9ab1;
            }

            .evaluation-meta strong {
                color:#17243d;
            }

            .evaluation-layout {
                display:grid;
                grid-template-columns:
                    210px 1fr;
                min-height:470px;
            }

            .question-list {
                background:#f7faff;
                border-right:1px solid #e5ecf7;
                padding:18px;
            }

            .question-list-title {
                font-size:10px;
                font-weight:800;
                letter-spacing:1.4px;
                color:#8292aa;
                margin:4px 8px 12px;
            }

            .question-nav {
                width:100%;
                display:flex;
                justify-content:space-between;
                align-items:center;
                border:1px solid transparent;
                background:transparent;
                padding:12px;
                border-radius:10px;
                color:#526783;
                cursor:pointer;
                margin-bottom:5px;
            }

            .question-nav small {
                color:#96a4b8;
            }

            .question-nav.active {
                background:#eaf2ff;
                border-color:#cfe0ff;
                color:#2563eb;
                font-weight:800;
            }

            .question-workspace {
                padding:28px;
            }

            .question-head {
                display:flex;
                justify-content:space-between;
                gap:18px;
                align-items:flex-start;
            }

            .question-number {
                font-size:10px;
                font-weight:800;
                letter-spacing:1.5px;
                color:#2563eb;
            }

            .question-head h3 {
                font-size:22px;
                color:#17243d;
                line-height:1.35;
                margin:7px 0 0;
            }

            .max-mark-badge {
                white-space:nowrap;
                background:#edf4ff;
                color:#2563eb;
                padding:8px 11px;
                border-radius:9px;
                font-size:12px;
                font-weight:800;
            }

            .answer-paper {
                margin-top:24px;
                border:1px solid #e0e8f4;
                border-radius:15px;
                background:
                    linear-gradient(
                        180deg,
                        #fff,
                        #f9fbfe
                    );
                padding:20px;
            }

            .answer-paper-label {
                font-size:10px;
                font-weight:800;
                letter-spacing:1.2px;
                color:#8495ad;
                margin-bottom:10px;
            }

            .answer-paper p {
                margin:0;
                color:#435775;
                line-height:1.7;
            }

            .marking-grid {
                display:grid;
                grid-template-columns:
                    220px 1fr;
                gap:14px;
                margin-top:18px;
            }

            .mark-box,
            .ai-insight,
            .evaluation-comment {
                border:1px solid #e0e8f4;
                border-radius:14px;
                padding:16px;
            }

            .mark-box label,
            .evaluation-comment label {
                display:block;
                font-size:11px;
                font-weight:800;
                color:#647791;
                margin-bottom:9px;
            }

            .marks-input-wrap {
                display:flex;
                align-items:center;
                gap:8px;
            }

            .marks-input-wrap input {
                width:90px;
                height:44px;
                border:1px solid #cfdced;
                border-radius:10px;
                padding:0 12px;
                font-size:18px;
                font-weight:800;
                color:#17305a;
                outline:0;
            }

            .marks-input-wrap input:focus {
                border-color:#5d95ee;
                box-shadow:
                    0 0 0 3px #e8f1ff;
            }

            .ai-insight {
                background:#f7faff;
            }

            .ai-insight span {
                display:block;
                font-size:10px;
                font-weight:800;
                letter-spacing:1.2px;
                color:#2563eb;
                margin-bottom:7px;
            }

            .ai-insight strong {
                font-size:13px;
                line-height:1.5;
                color:#425a79;
            }

            .evaluation-comment {
                margin-top:14px;
            }

            .evaluation-comment label span {
                font-weight:500;
                color:#9aa8ba;
                margin-left:5px;
            }

            .evaluation-comment textarea {
                width:100%;
                box-sizing:border-box;
                border:1px solid #d7e1ee;
                border-radius:10px;
                resize:vertical;
                padding:12px;
                font:inherit;
                outline:0;
                color:#263b59;
            }

            .evaluation-footer {
                display:flex;
                justify-content:space-between;
                align-items:center;
                gap:15px;
                padding:18px 28px;
                border-top:1px solid #e6edf7;
                background:#fbfdff;
            }

            .evaluation-footer > div {
                display:flex;
                gap:10px;
                flex-wrap:wrap;
            }

            .evaluation-footer button {
                cursor:pointer;
            }

            .submit-evaluation {
                background:#2563eb !important;
                color:#fff !important;
            }

            .modal-note {
                padding:0 22px 10px;
                color:#71839e;
                line-height:1.6;
            }

            .ai-result-box {
                display:flex;
                gap:14px;
                align-items:center;
                margin:20px;
                padding:16px;
                border-radius:14px;
                background:#f5f9ff;
                border:1px solid #dce9fb;
            }

            .ai-result-icon {
                width:42px;
                height:42px;
                border-radius:12px;
                background:#2563eb;
                color:#fff;
                display:grid;
                place-items:center;
                font-size:20px;
            }

            .ai-result-box strong {
                color:#17305a;
            }

            .ai-result-box p {
                margin:5px 0 0;
                color:#71839e;
            }

            .notification-panel {
                position:fixed;
                top:82px;
                right:28px;
                width:min(
                    390px,
                    calc(100vw - 40px)
                );
                z-index:4500;
                background:#fff;
                border:1px solid #dce7f5;
                border-radius:16px;
                box-shadow:
                    0 22px 60px
                    rgba(20,46,88,.18);
                overflow:hidden;
            }

            .notification-panel-header {
                display:flex;
                justify-content:space-between;
                padding:16px;
                border-bottom:
                    1px solid #e9eef6;
            }

            .notification-panel-header button {
                border:0;
                background:none;
                color:#2563eb;
                font-size:11px;
                font-weight:800;
                cursor:pointer;
            }

            .notification-list {
                max-height:390px;
                overflow:auto;
            }

            .notification-item {
                width:100%;
                display:flex;
                gap:12px;
                text-align:left;
                border:0;
                background:#fff;
                padding:15px 16px;
                cursor:pointer;
                border-bottom:
                    1px solid #f0f3f8;
            }

            .notification-item:hover {
                background:#f8fbff;
            }

            .notification-item.read {
                opacity:.6;
            }

            .notification-dot {
                width:8px;
                height:8px;
                flex:0 0 8px;
                margin-top:5px;
                border-radius:50%;
                background:#2563eb;
            }

            .notification-item.read
            .notification-dot {
                background:#cbd5e1;
            }

            .notification-item strong,
            .notification-item small {
                display:block;
            }

            .notification-item strong {
                font-size:12px;
                color:#203552;
            }

            .notification-item small {
                margin-top:4px;
                color:#7d8da5;
                line-height:1.4;
            }

            .notification-empty {
                padding:30px;
                text-align:center;
                color:#8191a8;
            }

            .evaluator-toast {
                position:fixed;
                right:26px;
                bottom:26px;
                z-index:6000;
                display:flex;
                align-items:center;
                gap:10px;
                padding:13px 16px;
                background:#10284d;
                color:#fff;
                border-radius:12px;
                box-shadow:
                    0 15px 40px
                    rgba(9,31,67,.25);
                font-size:13px;
                transform:translateY(15px);
                opacity:0;
                transition:.25s ease;
            }

            .evaluator-toast.show {
                transform:translateY(0);
                opacity:1;
            }

            .evaluator-toast > span {
                width:20px;
                height:20px;
                border-radius:50%;
                display:grid;
                place-items:center;
                background:#2563eb;
            }

            .evaluator-toast.error > span {
                background:#e11d48;
            }

            @keyframes evalFade {
                from {
                    opacity:0;
                    transform:scale(.99);
                }

                to {
                    opacity:1;
                    transform:scale(1);
                }
            }

            @media(max-width:800px) {

                .evaluation-layout {
                    grid-template-columns:1fr;
                }

                .question-list {
                    border-right:0;
                    border-bottom:
                        1px solid #e5ecf7;
                    display:flex;
                    overflow:auto;
                    gap:6px;
                }

                .question-list-title {
                    display:none;
                }

                .question-nav {
                    min-width:95px;
                    margin:0;
                }

                .evaluation-meta {
                    grid-template-columns:
                        repeat(2,1fr);
                }

                .marking-grid {
                    grid-template-columns:1fr;
                }
            }

            @media(max-width:560px) {

                .evaluation-overlay {
                    padding:8px;
                }

                .evaluation-modal {
                    max-height:96vh;
                    border-radius:18px;
                }

                .evaluation-modal-header {
                    padding:18px;
                }

                .question-workspace {
                    padding:18px;
                }

                .evaluation-footer {
                    padding:14px 18px;
                    align-items:flex-start;
                    flex-direction:column;
                }

                .evaluation-footer > div {
                    width:100%;
                }

                .evaluation-footer button {
                    flex:1;
                }

                .evaluation-meta > div {
                    padding:11px 13px;
                }

                .notification-panel {
                    right:10px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =========================================================
       EVENTS
    ========================================================= */

    function bindEvents() {

        /* Sidebar */

        els.nav.forEach(item => {

            item.addEventListener(
                "click",
                () =>
                    navigate(
                        item.dataset.section
                    )
            );

        });

        /* Open assigned sheets */

        els.openAssignedButton
            ?.addEventListener(
                "click",
                () =>
                    navigate("assigned")
            );

        /* View all */

        els.viewAllButton
            ?.addEventListener(
                "click",
                () =>
                    navigate("assigned")
            );

        /* Notifications */

        els.notificationButton
            ?.addEventListener(
                "click",
                event => {

                    event.stopPropagation();

                    showNotifications();
                }
            );

        /* Logout */

        els.logoutButton
            ?.addEventListener(
                "click",
                logout
            );

        /* Existing dashboard buttons */

        bindSheetActions(
            document
        );

        /* Close notification when clicking outside */

        document.addEventListener(
            "click",
            event => {

                const panel =
                    $("#notificationPanel");

                if (
                    panel &&
                    !panel.contains(
                        event.target
                    ) &&
                    !els.notificationButton?.contains(
                        event.target
                    )
                ) {
                    panel.remove();
                }
            }
        );

        /* Sync between browser tabs */

        window.addEventListener(
            "storage",
            event => {

                if (
                    event.key ===
                    STORAGE_KEY
                ) {

                    state =
                        loadState();

                    updateDashboard();

                    if (
                        els.assigned.classList.contains(
                            "active"
                        )
                    ) {
                        renderAssignedPage();
                    }

                    if (
                        els.completed.classList.contains(
                            "active"
                        )
                    ) {
                        renderCompletedPage();
                    }
                }

                if (
                    event.key ===
                    LANGUAGE_KEY
                ) {
                    syncLanguageLabel();
                }
            }
        );
    }

    /* =========================================================
       BOOT
    ========================================================= */

    function boot() {

        state =
            loadState();

        cacheElements();

        injectFunctionalStyles();

        bindEvents();

        updateDashboard();

        syncLanguageLabel();

        renderAIPage();
    }

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            boot
        );

    } else {

        boot();

    }

})();