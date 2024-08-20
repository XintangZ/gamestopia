const selectPlanBtns = document.getElementsByClassName("select-plan-btn");

for (let btn of selectPlanBtns) {
    if (user) {
        if (btn.dataset.id === user.plan) {
            
            btn.textContent = "Current plan";
            btn.classList.add("disabled");
        }
    }

    btn.addEventListener("click",() => { 
        if (user) {
            window.location.href = `/pages/en/checkout_en.html#${btn.dataset.id}`;
        } else {
            window.location.href = "/pages/en/sign_in_en.html";
        }
    })
}