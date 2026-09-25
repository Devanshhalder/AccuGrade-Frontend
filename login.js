// ================================
// ROLE SELECTION
// ================================

const roleOptions = document.querySelectorAll(".role-option");

roleOptions.forEach((option) => {
    option.addEventListener("click", () => {

        // Remove active state
        roleOptions.forEach((item) => {
            item.classList.remove("active");
        });

        // Add active state
        option.classList.add("active");

        // Select radio button
        const radio = option.querySelector('input[type="radio"]');

        if (radio) {
            radio.checked = true;
        }
    });
});


// ================================
// PASSWORD SHOW / HIDE
// ================================

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (togglePassword && passwordInput) {

    togglePassword.addEventListener("click", () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";
            togglePassword.textContent = "Hide";

        } else {

            passwordInput.type = "password";
            togglePassword.textContent = "Show";

        }

    });

}


// ================================
// LOGIN FORM
// ================================

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (loginForm) {

    loginForm.addEventListener("submit", (event) => {

        event.preventDefault();

        const email = document
            .getElementById("email")
            .value
            .trim();

        const password = passwordInput.value;

        const selectedRole = document.querySelector(
            'input[name="role"]:checked'
        );


        // ----------------------------
        // Validate role
        // ----------------------------

        if (!selectedRole) {

            loginError.textContent =
                "Please select Admin or Evaluator.";

            return;
        }


        // ----------------------------
        // Validate email
        // ----------------------------

        if (!email) {

            loginError.textContent =
                "Please enter your email address.";

            return;
        }


        // ----------------------------
        // Validate password
        // ----------------------------

        if (!password) {

            loginError.textContent =
                "Please enter your password.";

            return;
        }


        // Clear error
        loginError.textContent = "";


        // ----------------------------
        // Selected role
        // ----------------------------

        const role = selectedRole.value;


        // ----------------------------
        // TEMPORARY DEMO LOGIN
        // ----------------------------

        if (role === "admin") {

            window.location.href = "admin.html";

        } else if (role === "evaluator") {

            window.location.href = "evaluator.html";

        }

    });

}


// ================================
// FORGOT PASSWORD
// ================================

const forgotPassword =
    document.getElementById("forgotPassword");

if (forgotPassword) {

    forgotPassword.addEventListener("click", (event) => {

        event.preventDefault();

        alert(
            "Password recovery will be connected after the backend is added."
        );

    });

}