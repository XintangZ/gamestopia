/* scripts used in all pages */

// check if user is logged in
let user = localStorage.getItem('user') ?? sessionStorage.getItem('user');
if (user) {
    user = JSON.parse(user);
}

if (user) {
    // render username if logged in
    const usernameContainers = document.getElementsByClassName('username');
    for (let container of usernameContainers) {
        container.innerHTML = `${user.username} `;

        const signOutBtn = document.createElement('i');
        signOutBtn.classList.add('fa-solid', 'fa-arrow-right-from-bracket', 'text-secondary');
        signOutBtn.style.fontSize = '1rem';

        signOutBtn.addEventListener('mouseover', () => {
            signOutBtn.classList.remove('text-secondary');
            signOutBtn.classList.add('text-danger');
        });

        signOutBtn.addEventListener('mouseout', () => {
            signOutBtn.classList.remove('text-danger');
            signOutBtn.classList.add('text-secondary');
        });

        signOutBtn.addEventListener('click', () => {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/index.html';
        });

        container.appendChild(signOutBtn);
    }
}

// RAWG api doc https://api.rawg.io/docs/

const RAWG_API_KEY = 'e7ce35cbba5e491897a8018eb539625f';

const PLATFORM_NAMES = ['Xbox', 'Nintendo', 'PlayStation'];
const PLATFORM_ID_XBOX = 80;
const PLATFORM_ID_PS = 27;
const PLATFORM_ID_NS = 7;

// fetch games information from RAWG API
async function fetchGamesInfo(filters, pageNumber = 1, pageSize = 20) {
    let url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}`;

    if (filters) {
        for (let filter of filters) {
            url += filter;
        }
    }

    url += `&page=${pageNumber}&page_size=${pageSize}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Failed to fetch data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return null;
    }
}

// fetch a game using id
function fetchGameById(gameId) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.rawg.io/api/games/${gameId}?key=${RAWG_API_KEY}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                resolve(data); // Resolve the promise with the game data
            })
            .catch(error => {
                reject(error); // Reject the promise with the error
            });
    });
}

function fetchAndRenderGames(containerId, filter, page, pageSize, btnText = 'Rent') {
    fetchGamesInfo(filter, page, pageSize)
        .then(data => {
            if (data) {
                console.log('Games information:', data.results);

                for (let game of data.results) {
                    renderGame(containerId, game, btnText);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

/**
 * renders game img, title, and button with data-id = game id
 * @param {string} containerId the id of a DOM element to render games to
 * @param {object} game the game object to render
 * @param {string} btnText the text to render in the button
 */
function renderGame(containerId, game, btnText = 'Rent') {
    let container = document.getElementById(containerId);

    let gamePlatform = '';

    for (let platform of game.parent_platforms) {
        for (let name of PLATFORM_NAMES) {
            if (platform.platform.name === name) {
                // only display xbox, nintendo, or playstation
                gamePlatform += platform.platform.name + '/';
            }
        }
    }

    gamePlatform = gamePlatform.slice(0, -1); // remove the last "/"

    if (game.background_image === null) {
        // skip resluts without valid img
        return;
    }

    const gameContainer = document.createElement('div');
    gameContainer.classList.add(
        'col-6',
        'col-md-4',
        'col-lg-3',
        'd-flex',
        'flex-column',
        'justify-content-between',
        'align-items-center'
    );

    const imgContainer = document.createElement('div');
    imgContainer.classList.add(
        'img-container',
        'd-flex',
        'justify-content-center',
        'align-items-center'
    );

    const imgLink = document.createElement('a');
    imgLink.href = `/pages/en/game_detail_en.html?id=${game.id}`;

    const gameImg = document.createElement('img');
    gameImg.src = game.background_image;
    gameImg.alt = game.slug;

    imgLink.appendChild(gameImg);
    imgContainer.appendChild(imgLink);

    const gameTitle = document.createElement('h5');
    const titleLink = document.createElement('a');
    titleLink.href = `/pages/en/game_detail_en.html?id=${game.id}`;
    titleLink.textContent = game.name;

    gameTitle.appendChild(titleLink);

    const platform = document.createElement('p');
    platform.textContent = gamePlatform;

    const btn = document.createElement('button');
    btn.classList.add('btn', 'btn-primary');
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-id', game.id);
    btn.textContent = btnText;

    const infoText = document.createElement('p');
    infoText.style.height = '1rem';
    infoText.classList.add('text-center', 'text-secondary');

    btn.addEventListener('click', async e => {
        if (!user) {
            window.location.href = '/pages/en/sign_in_en.html'; // require sign in
            return;
        } else if (!user.plan) {
            window.location.href = '/pages/en/pricing_en.html'; // require an active plan
            return;
        }

        btn.disabled = true;

        await addToList(e, infoText);

        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = btnText;
            infoText.textContent = '';
        }, 2000);
    });

    gameContainer.appendChild(imgContainer);
    gameContainer.appendChild(gameTitle);
    gameContainer.appendChild(platform);
    gameContainer.appendChild(btn);
    gameContainer.appendChild(infoText);

    container.appendChild(gameContainer);
}

// scrolling toggle event
const navigationContainer = document.getElementsByTagName('main')[0];
navigationContainer.addEventListener('click', function (event) {
    // Check if the clicked element is a scroll button
    const scrollLeftButton = event.target.closest('.scroll-left');
    const scrollRightButton = event.target.closest('.scroll-right');

    if (scrollLeftButton) {
        // Handle left scroll button click
        const scrollableContent =
            scrollLeftButton.parentElement.parentElement.querySelector('.horizontal-scroller');
        scrollableContent.scrollBy({
            left: -200,
            behavior: 'smooth',
        });
    } else if (scrollRightButton) {
        // Handle right scroll button click
        const scrollableContent =
            scrollRightButton.parentElement.parentElement.querySelector('.horizontal-scroller');
        scrollableContent.scrollBy({
            left: 200,
            behavior: 'smooth',
        });
    }
});

/**
 * add a game to user's rental list
 * @param {object} e a click event on a "Rent" or "Reserve" button
 * @param {object} infoText a DOM element to render text to
 */
async function addToList(e, infoText) {
    try {
        const data = await fetchGameById(e.target.dataset.id);
        const btnText = e.target.textContent;

        if (btnText === 'Reserve' && user.plan !== 'Elite') {
            // if it's reservation, check if the user is an Elite member
            e.target.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            infoText.textContent = 'Elite members only';
        } else {
            // check if the game is already in user's rental list
            if (
                user.rentals.some(
                    rental => rental.gameId == data.id && rental.status !== 'returned'
                )
            ) {
                e.target.innerHTML = '<i class="fa-solid fa-xmark"></i>';
                infoText.textContent = 'The game is already in your list';
            } else {
                const newRental = checkUserPlan({
                    gameId: data.id,
                    title: data.name,
                    imgUrl: data.background_image,
                });

                console.log(newRental);

                const response = await fetch(`http://localhost:3000/users/${user._id}/rental`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(newRental),
                });

                const updatedUser = await response.text();

                updateUser(updatedUser);
                e.target.innerHTML = '<i class="fa-solid fa-check"></i>';
                infoText.textContent = 'The game is added to your list';
            }
        }
    } catch (error) {
        console.error('error: ', error);
    }
}

/**
 * checks user plan to decide if to ship out a new rental
 * @param {object} rental
 * @returns the checked rental
 */
function checkUserPlan(rental) {
    switch (user.plan) {
        case 'Basic': // 1 game out at a time
            if (user.rentals.filter(item => item.status === 'out').length < 1) {
                rental.status = 'out';
                rental.dateOut = new Date();
            }
            break;
        case 'Pro': // 3 games out at a time
            if (user.rentals.filter(item => item.status === 'out').length < 3) {
                rental.status = 'out';
                rental.dateOut = new Date();
            }
            break;
        case 'Elite': // 5 games out at a time
            if (user.rentals.filter(item => item.status === 'out').length < 5) {
                rental.status = 'out';
                rental.dateOut = new Date();
            }
            break;
        default:
            console.error('Plan must be "Basic", "Pro" or "Elite".');
            break;
    }
    return rental;
}

/**
 * updates user info
 * @param {object} user
 */
function updateUser(updatedUser) {
    user = JSON.parse(updatedUser);
    if (sessionStorage.getItem('user')) {
        sessionStorage.setItem('user', updatedUser);
    } else if (localStorage.getItem('user')) {
        localStorage.setItem('user', updatedUser);
    }
}

// validations
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // valid email regex

    if (!emailRegex.test(email)) {
        // checks if the email input maches the regex
        throw new Error('Please enter a valid email.');
    }

    return true;
}

function validateUsername(username) {
    const usernameRegex = /^\S{1,12}$/; // username <= 12 characters with no white spaces

    if (!usernameRegex.test(username)) {
        throw Error(
            'Please enter a username that is up to 12 characters long and contains no whitespace'
        );
    }

    return true;
}

function validatePassword(password) {
    const passwordRegex =
        /^(?=.*[!@#$%^&*()-_=+\\|{}[\]:;"'<>,.?/])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,}$/; // password >= 8 1 or more (special, capital, miniscule, number)

    if (!passwordRegex.test(password)) {
        throw Error(
            'Please enter a password that is at least 8 characters long and includes at least one special character, one uppercase letter, one lowercase letter, and one digit'
        );
    }

    return true;
}

function hashPassword(password) {
    // Hash the password using SHA-256
    var hash = CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex);
    return hash;
}

const validatePaymentMethod = (CN, CH, CVV, ED) => {
    const creditCardRegex = /^\d{14,16}$/;
    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
    const CVVRegex = /^\d{3}$/;
    const expiryDateRegex = /^\d{2}\/\d{2}$/;

    if (!creditCardRegex.test(CN)) {
        throw Error('Invalid card number entered');
    }

    if (!nameRegex.test(CH)) {
        throw Error('Invalid name entered');
    }

    if (!CVVRegex.test(CVV)) {
        throw Error('Invalid cvv entered');
    }
    if (!expiryDateRegex.test(ED)) {
        throw Error('Invalid expiry date entered');
    }

    return true;
};

const validateAddress = (postalCode, street, name, city) => {
    const postalCodeRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/;
    const addressRegex = /^\d+\s[A-Za-z]+(?: [A-Za-z]+)*$/;
    const nameRegex = /^[A-Za-z]+(?: [A-Za-z]+)+$/;
    const cityRegex = /^[a-zA-Z\s]+$/;

    if (!postalCodeRegex.test(postalCode)) {
        throw Error('Invalid postal code entered is invalid');
    }

    if (!addressRegex.test(street)) {
        throw Error('Invalid address entered is invalid');
    }

    if (!nameRegex.test(name)) {
        throw Error('Invalid name entered is invalid');
    }

    if (!cityRegex.test(city)) {
        throw Error('Invalid city entered is invalid');
    }

    return true;
};
