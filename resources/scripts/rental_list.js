// go to sign in page if not logged in
if (!user) {
    window.location.href = '/pages/en/sign_in_en.html';
} else if (!user.plan) {
    window.location.href = '/pages/en/pricing_en.html';
}

let rentalsOut;
let rentalsPending;
let rentalsReturned;
sortRentals(); // sort to newest first

const container = document.getElementById('rentalList');

window.onload = () => {
    renderPageContent();
};

function renderPageContent() {
    container.innerHTML = '';

    if (user.rentals.length === 0) {
        const p = document.createElement('p');
        p.style.height = '34vh';
        p.classList.add('text-center', 'text-secondary');
        p.textContent = 'You have no rental yet.';

        container.appendChild(p);
        return;
    }

    renderRentalList(rentalsOut);
    renderRentalList(rentalsPending);
    renderRentalList(rentalsReturned);
}

function renderRentalList(rentals) {
    for (let rental of rentals) {
        const tr = document.createElement('tr');
        tr.classList.add('bg-light', 'border', 'rounded');

        const imgTd = document.createElement('td');
        imgTd.classList.add('col-2');

        const imgContainer = document.createElement('div');
        imgContainer.classList.add(
            'img-container',
            'mx-auto',
            'd-flex',
            'justify-content-center',
            'align-items-center'
        );

        const imgLink = document.createElement('a');
        imgLink.href = `/pages/en/game_detail_en.html?id=${rental.gameId}`;

        const img = document.createElement('img');
        img.src = rental.imgUrl;
        img.alt = rental.slug;

        imgLink.appendChild(img);
        imgContainer.appendChild(imgLink);
        imgTd.appendChild(imgContainer);

        const infoTd = document.createElement('td');
        infoTd.classList.add('col-9');

        const gameTitle = document.createElement('h4');
        gameTitle.classList.add('text-primary');
        gameTitle.style.background = 'none';

        const titleLink = document.createElement('a');
        titleLink.href = `/pages/en/game_detail_en.html?id=${rental.gameId}`;
        titleLink.textContent = rental.title;

        gameTitle.appendChild(titleLink);

        const date = document.createElement('p');
        date.classList.add('text-secondary');
        date.style.background = 'none';

        const status = document.createElement('p');
        status.style.background = 'none';
        status.textContent = `Status: ${rental.status}`;

        infoTd.appendChild(gameTitle);
        infoTd.appendChild(date);
        infoTd.appendChild(status);

        const btnTd = document.createElement('td');
        btnTd.classList.add('col-1');

        switch (rental.status) {
            case 'pending':
                date.textContent = `Date added: ${rental.dateAdded.split('T')[0]}`;
                status.classList.add('text-warning');
                break;
            case 'returned':
                date.textContent = `Date out: ${rental.dateOut.split('T')[0]}`;
                status.classList.add('text-secondary');
                break;
            default:
                date.textContent = `Date out: ${rental.dateOut.split('T')[0]}`;
                status.classList.add('text-success');

                const btn = document.createElement('button');
                btn.classList.add('btn', 'btn-primary');
                btn.setAttribute('type', 'button');
                // btn.setAttribute("data-id", rental.id);
                btn.textContent = 'Return';

                btnTd.appendChild(btn);

                btn.addEventListener('click', async () => {
                    const response = await fetch(`http://localhost:3000/users/${user._id}/rental`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                            gameId: rental.gameId,
                        }),
                    });
                    const updatedUser = await response.text();

                    updateUser(updatedUser);
                    sortRentals();
                    renderPageContent();
                });
                break;
        }

        tr.appendChild(imgTd);
        tr.appendChild(infoTd);
        tr.appendChild(btnTd);

        container.appendChild(tr);
    }
}

function renderRentalListRow(rental) {}

function sortRentals() {
    rentalsOut = user.rentals
        .filter(item => item.status === 'out')
        .sort((a, b) => b.dateOut - a.dateOut);
    rentalsPending = user.rentals
        .filter(item => item.status === 'pending')
        .sort((a, b) => b.dateAdded - a.dateAdded);
    rentalsReturned = user.rentals
        .filter(item => item.status === 'returned')
        .sort((a, b) => b.dateOut - a.dateOut);
}
