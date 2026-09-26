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

    loginForm.addEventListener("submit", async (event) => {

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


        // Clear previous error
        loginError.textContent = "";


        // ----------------------------
        // Selected role
        // ----------------------------

        const role = selectedRole.value;


        // ----------------------------
        // Login button state
        // ----------------------------

        const submitButton =
            loginForm.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
            submitButton.textContent = "Signing In...";
        }


        try {

            // ----------------------------
            // Call AccuGrade Backend
            // ----------------------------

            const response = await fetch(
                "https://accugrade-backend-production.up.railway.app/auth/login",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );


            const data = await response.json();


            // ----------------------------
            // Backend rejected login
            // ----------------------------

            if (!response.ok) {

                loginError.textContent =
                    data.detail ||
                    data.message ||
                    "Invalid email or password.";

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Sign In";
                }

                return;
            }


            // ----------------------------
            // Check selected role
            // ----------------------------

            if (data.user.role !== role) {

                loginError.textContent =
                    `This account is registered as ${data.user.role}. Please select the correct role.`;

                if (submitButton) {
                    submitButton.disabled = false;
                    submitButton.textContent = "Sign In";
                }

                return;
            }


            // ----------------------------
            // Save logged-in user
            // ----------------------------

            localStorage.setItem(
                "accuGradeCurrentUser",
                JSON.stringify(data.user)
            );


            // ----------------------------
            // Redirect
            // ----------------------------

            if (data.user.role === "admin") {

                window.location.href =
                    "admin.html";

            } else {

                window.location.href =
                    "evaluator.html";

            }

        } catch (error) {

            console.error(
                "Login error:",
                error
            );

            loginError.textContent =
                "Cannot connect to AccuGrade backend. Make sure the backend is running.";

            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = "Sign In";
            }

        }

    });

}