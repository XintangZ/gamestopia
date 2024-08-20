document.addEventListener('DOMContentLoaded', () => {
    const signUpForm = document.getElementById('signUpForm');

    signUpForm.addEventListener('submit', async e => {
        e.preventDefault();
        const errorText = document.getElementById('errorText');
        errorText.innerHTML = '';

        let formData = Object.fromEntries(new FormData(signUpForm));
        const { email, username, password } = formData;

        try {
            validateEmail(email);
            validateUsername(username);
            validatePassword(password);
            if (!formData.agreeTC) {
                throw new Error("You must agree to the terms and conditions");
            }

            const response = await fetch('http://localhost:3000/users/new', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    username,
                    password: hashPassword(password),
                    
                })
            });
            
            const resText = await response.text();

            if (!response.ok) {
                throw new Error(resText);
            }

            sessionStorage.setItem("user", resText);   // store user in session storage
            window.location.href = "/pages/en/pricing_en.html";
        } catch (error) {
            errorText.textContent = error.message;
            console.log(error);
        }
    })
});