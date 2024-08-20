const currentDate = new Date();
const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(currentDate.getMonth() - 2);

const PLATFORM_FILTER = `&platforms=${PLATFORM_ID_NS}, ${PLATFORM_ID_PS}, ${PLATFORM_ID_XBOX}`;
const TRENDING_TITLES_FILTER = PLATFORM_FILTER + "&ordering=-rating";
const NEW_RELEASES_FILTER = `${PLATFORM_FILTER}&dates=${
  twoMonthsAgo.toISOString().split("T")[0]
},${currentDate.toISOString().split("T")[0]}`;
const COMING_SOON_FILTER = PLATFORM_FILTER + "&ordering=-released";

// Fetch and render trending titles
fetchAndRenderGames("trending-titles", TRENDING_TITLES_FILTER, 1, 7);

// Fetch and render new releases
fetchAndRenderGames("new-releases", NEW_RELEASES_FILTER, 1, 7);

// Fetch and render coming soon titles
fetchAndRenderGames("coming-soon", COMING_SOON_FILTER, 1, 7, "Reserve");

// lucky draw countdown timer
//setting the timer to 3 hours in seconds
var countdownTime = 3 * 60 * 60;

window.addEventListener(
  "load",
  () => {
    setInterval(updateCounter, 1000);
    },
  false
);

function updateCounter() {
  let hours = Math.floor(countdownTime / 3600);
  let minutes = Math.floor((countdownTime % 3600) / 60);
  let seconds = countdownTime - hours * 3600 - minutes * 60;

  countdownTime--;

  let newHours = hours.toString().padStart(2, "0");
  let newMinutes = minutes.toString().padStart(2, "0");
  let newSeconds = seconds.toString().padStart(2, "0");

  document.getElementById(
    "countdown"
  ).innerHTML = `${newHours}:${newMinutes}:${newSeconds}`;
}

// lucky draw participation validation and confirmation
const participationModal = new bootstrap.Modal("#participationModal");
const participationBtn = document.getElementById("participationBtn");
const participationModalLabel = document.getElementById("participationModalLabel");
const participationModalBody = document.getElementById("participationModalBody");
const participationModalFooter = document.getElementById("participationModalFooter");

participationBtn.addEventListener("click", () => { 
  const dismissBtn = document.createElement("button");
  dismissBtn.textContent = "Close";
  dismissBtn.classList.add("btn", "btn-secondary");
  dismissBtn.setAttribute("type", "button");
  dismissBtn.setAttribute("data-bs-dismiss", "modal");

  if (!user) {
    participationModalLabel.textContent = "Oops...";
    participationModalBody.textContent = "You are not signed in.";

    const signInBtn = document.createElement("a");
    signInBtn.textContent = "Sign in";
    signInBtn.href = "/pages/en/sign_in_en.html";
    signInBtn.classList.add("btn", "btn-primary");

    participationModalFooter.appendChild(dismissBtn);
    participationModalFooter.appendChild(signInBtn);
  } else {
    if (user.plan && user.plan === "Elite") {
      participationModalLabel.textContent = "Good luck!";
      participationModalBody.textContent = "You will be contacted if you win.";
  
      participationModalFooter.appendChild(dismissBtn);
    } else {
      participationModalLabel.textContent = "Hmmm...";
      participationModalBody.textContent = "You are not qualified. Become an Elite user to participate.";
  
      const upgradeBtn = document.createElement("a");
      upgradeBtn.textContent = "Upgrade to Elite";
      upgradeBtn.href = "/pages/en/checkout_en.html#Elite";
      upgradeBtn.classList.add("btn", "btn-primary");

      participationModalFooter.appendChild(dismissBtn);
      participationModalFooter.appendChild(upgradeBtn);
    }
  }

  participationModal.show();
})

document.getElementById("participationModal").addEventListener("hidden.bs.modal", () => { 
  participationModalFooter.innerHTML = "";
})

// render lucky draw prize img and info
const PRIZE_GAME_ID = "22511";

// fetch game data
fetchGameById(PRIZE_GAME_ID)
  .then(data => {
    // render img
    const imgContainer = document.getElementById("prize-img-container");
    imgContainer.style.width = "10rem";
    imgContainer.style.overflowX = "hidden";

    const prizeImg = document.createElement("img");
    prizeImg.setAttribute("src", `${data.background_image}`);
    prizeImg.setAttribute("alt", `${data.slug}`);
    prizeImg.style.maxHeight = "13rem";
    prizeImg.style.objectFit = "cover";

    imgContainer.appendChild(prizeImg);

    // render title and platform
    const prizeInfo = document.getElementById("prize-info");
    const prizeTitle = document.createElement("h5");
    const prizePlatform = document.createElement("p");

    prizeTitle.textContent = data.name;
    prizePlatform.textContent = data.platforms[0].platform.name;

    prizeInfo.appendChild(prizeTitle);
    prizeInfo.appendChild(prizePlatform);
  })
  .catch(error => {
    console.error('There was a problem fetching the game data:', error);
  });

// set href on to game detail page
const prizeLinks = document.getElementsByClassName("prize-link");
for (let link of prizeLinks) {
  link.setAttribute("href", `/pages/en/game_detail_en.html?id=${PRIZE_GAME_ID}`);
}

// subscription form
const subscriptionModal = new bootstrap.Modal("#subscriptionConfirmationModal");
const subscriptionForm = document.getElementById("subscriptionForm");
subscriptionForm.addEventListener("submit", e => {
  e.preventDefault();
  errorText.textContent = "";

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // valid email regex
  if (emailRegex.test(e.target[0].value)) {
    subscriptionModal.show();
    subscriptionForm.reset();
  } else {
    errorText.textContent = "Please enter a valid email.";
  }
})