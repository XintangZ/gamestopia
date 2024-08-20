// go to user space if user exists in local or session storage
if (user) {
    window.location.href = "/pages/en/user_space_en.html";
}

document.addEventListener('DOMContentLoaded', () => { 
    const signInForm = document.getElementById('signInForm');

    signInForm.addEventListener('submit', async e => {
        e.preventDefault();
        const errorText = document.getElementById('errorText');
        errorText.innerHTML = '';

        let formData = Object.fromEntries(new FormData(signInForm));
        const { email, password } = formData;

        try {
            validateEmail(email);

            const response = await fetch('http://localhost:3000/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password: hashPassword(password)
                })
            });
            
            const resText = await response.text();

            if (!response.ok) {
                throw new Error(resText);
            }

            if (formData.rememberMe) {
                localStorage.setItem("user", resText);     // if "remember me" is checked, store user in local storage
            } else {
                sessionStorage.setItem("user", resText);   // store user in session storage
            }

            window.location.href = "/pages/en/user_space_en.html";
        } catch (error) {
            errorText.textContent = error.message;
            console.log(error);
        }
    });
})