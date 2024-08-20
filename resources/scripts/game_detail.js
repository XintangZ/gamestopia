'use strict';

var game_genre;
var idList = new Array(4);
let cards = document.getElementsByClassName('cardGame');

//initializing the content
let img = document.getElementById('detail-img');
let title = document.getElementById('gameTitle');
let game_platform = document.getElementById('platform');
let rentBtn = document.getElementById('btn');
let gamePublisher = document.getElementById('publisher');
let game_description = document.getElementById('description');
let game_rating = document.getElementById('ratingImg');
let infoText = document.getElementById('infoText');

//fetching the game id from the url
const searchParams = new URLSearchParams(window.location.search);
var game_id = searchParams.get('id') == null ? 339958 : searchParams.get('id');
let url = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}`;
let baseUrl = `https://api.rawg.io/api/games?key=${RAWG_API_KEY}`;

rentBtn.setAttribute('data-id', game_id);
rentBtn.onclick = async e => {
    if (!user) {
        window.location.href = '/pages/en/sign_in_en.html'; // require sign in
        return;
    } else if (!user.plan) {
        window.location.href = '/pages/en/pricing_en.html'; // require an active plan
        return;
    }

    rentBtn.disabled = true;

    await addToList(e, infoText);

    setTimeout(() => {
        rentBtn.disabled = false;
        rentBtn.textContent = 'Rent';
        infoText.textContent = '';
    }, 2000);
};

window.addEventListener('load', fetchAGame(game_id));

window.addEventListener(
    'load',
    () => {
        getSomeGames(game_genre, Math.floor(Math.random() * 100 + 1), 4)
            .then(data => {
                if (data) {
                    for (let j = 0; j < cards.length; j++) {
                        idList[j] = data.results[j].id;
                        console.log(cards[j].classList);
                        let image = cards[j].firstElementChild.firstElementChild.firstElementChild;
                        console.log(image.classList);
                        image.setAttribute('src', data.results[j].background_image);
                        let gameTitle = cards[j].firstElementChild.nextElementSibling;
                        gameTitle.textContent = data.results[j].name;
                        let gamePlatform = cards[j].children[2];
                        gamePlatform.innerHTML = data.results[j].platforms[0].platform.name;
                        let gameBtn = cards[j].children[3].firstElementChild;
                        gameBtn.addEventListener('click', e => {
                            if (!user) {
                                window.location.href = '/pages/en/sign_in_en.html'; // require sign in
                                return;
                            } else if (!user.plan) {
                                window.location.href = '/pages/en/pricing_en.html'; // require an active plan
                                return;
                            }

                            btn.disabled = true;

                            addToList(e, infoText);

                            setTimeout(() => (btn.disabled = false), 2000);
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    },
    false
);

function fetchAGame(id) {
    //fetching the image using the id
    fetchGameById(id)
        .then(res => {
            game_genre = document.getElementById('genre');

            renderGame(res);
        })
        .catch(error => {
            console.error('There was a problem fetching the game data:', error);
        });
}
/**
 * rounds a float number to the closest decimal value to either .5 or .0
 * @param {Double} number
 * @returns
 */
function customRound(number) {
    // Check if the decimal part is closer to 0.5 or 1.0
    var decimalPart = number - Math.floor(number);
    if (decimalPart < 0.25) {
        return Math.floor(number);
    } else if (decimalPart >= 0.75) {
        return Math.ceil(number);
    } else {
        return Math.floor(number) + 0.5;
    }
}

//displaying the content
function renderGame(gameObj) {
    console.log(gameObj);
    img.setAttribute('src', gameObj.background_image);
    title.innerHTML = gameObj.name;
    game_platform.innerHTML = gameObj.platforms[0].platform.name;
    game_genre.innerHTML = gameObj.genres[0].name;
    game_description.innerHTML = gameObj.description;
    gamePublisher.innerHTML = gameObj.publishers[0].name;

    let rating = !('rating' in gameObj) ? 0 : customRound(gameObj.rating);
    game_rating.setAttribute('src', `/resources/images/ratings/stars_regular_${rating}.png`);
}

//Fetching 4 random games that have the same genre as the main one
async function getSomeGames(genres, pageNumber, pageSize) {
    if (genres) {
        url += `&genres=${genres}`;
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

//adding an event listener to the cards and updating the pages content with ajax

for (let j = 0; j < cards.length; j++) {
    cards[j].addEventListener('click', () => {
        let request = new XMLHttpRequest();
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        request.open('GET', `https://api.rawg.io/api/games/${idList[j]}?key=${RAWG_API_KEY}`, true);

        request.onload = function () {
            var game = JSON.parse(request.responseText);
            if (request.status == 200) {
                renderGame(game);
            } else {
                console.log('error');
            }
        };

        request.onerror = function () {
            console.log('Connection error!');
        };

        request.send();
    });
}
