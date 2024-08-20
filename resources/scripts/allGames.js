const hashValue = window.location.hash.slice(1)
const filter = window.location.hash ? `&platform=${hashValue}` : '';

const allGamesTitle = document.getElementById('allGamesTitle')
const allGames = document.getElementById('allGames')


// set All games header
if (!filter) {
    allGamesTitle.innerText = 'All Games'
} 
else if (hashValue === 'nintendoswitch'){
    allGamesTitle.innerText = `Nintendo Switch Games`
}
else if(hashValue === 'playstation') {
    allGamesTitle.innerText = `PlayStation Games`
}
else {
    allGamesTitle.innerText = `Xbox Games`
}
 
const pagesButtons = document.getElementsByClassName('page-item');

let currentPage = 1;

/**
 * calls the games api based on which page youre viewing, also controls the pagination
 * @param {Event} e 
 */
const setPage = e => {
    const max = 3;
    const min = 1;
    
    if (e.target.innerText == '»') {
        if (currentPage >= max) {
            return;
        }
        currentPage++
    } else if (e.target.innerText =='«') {
        if (currentPage <= min) {
            return;
        }
        currentPage--
    } else {
        currentPage = e.target.innerText;

    }

    allGames.innerHTML = ''
    fetchAndRenderGames('allGames', filter, currentPage, 12);
}

for (let button of pagesButtons) {
    button.addEventListener('click', e => setPage(e))
}

window.onload = () => fetchAndRenderGames('allGames', filter, currentPage, 12);

$(window).on("hashchange", () => window.location.reload(true));


// &search_precise=true