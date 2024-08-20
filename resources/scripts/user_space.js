// go to sign in page if not logged in
if (!user) {
    window.location.href = '/pages/en/sign_in_en.html';
} else if (!user.plan) {
    window.location.href = '/pages/en/pricing_en.html';
}

// const paymentFields = getKeysExcept(user.paymentMethods[0], "id");
// const addressFields = getKeysExcept(user.addresses[0], "id");
const paymentFields = ['nickname', 'cardholder', 'cardNumber', 'expiry'];
const addressFields = ['name', 'street', 'city', 'province', 'postalCode'];

// render user info
document.getElementById('userPlan').textContent = user.plan;
document.getElementById('registrationDate').textContent = user.registrationDate.split('T')[0];
document.getElementById('userDefaultPayment').textContent =
    user.paymentMethods[0].cardNumber.slice(-4);

document.addEventListener('DOMContentLoaded', function () {
    // add btn functionalities
    const addressTabBtn = document.getElementById('address');
    const paymentTabBtn = document.getElementById('payment');

    addressTabBtn.addEventListener('click', () => {
        addressTabBtn.classList.add('active');
        paymentTabBtn.classList.remove('active');

        renderTabContent('address', user.addresses, addressFields);
    });

    paymentTabBtn.addEventListener('click', () => {
        paymentTabBtn.classList.add('active');
        addressTabBtn.classList.remove('active');

        renderTabContent('payment', user.paymentMethods, paymentFields);
    });

    // render my rentals section
    renderRecentRentalSection();

    // render address tab by default
    renderTabContent('address', user.addresses, addressFields);
});

function renderRecentRentalSection() {
    const rentalsOut = user.rentals
        .filter(item => item.status === 'out')
        .sort((a, b) => b.dateOut - a.dateOut); // sort to newest first
    const container = document.getElementById('myRentals');
    container.innerHTML = '';

    if (!rentalsOut.length) {
        container.innerHTML =
            '<p class="text-center text-secondary w-100 align-self-center">You have no game out.</p>';
        return;
    }

    for (let i = 0; i < Math.min(2, rentalsOut.length); i++) {
        // renders 2 games max
        const rental = rentalsOut[i];
        renderRecentRental(container, rental);
    }
}

/**
 * renders a game in recent rental section
 * @param {object} container
 * @param {object} rental the rental object stored in user.rentals array
 */
function renderRecentRental(container, rental) {
    const gameContainer = document.createElement('div');
    gameContainer.classList.add(
        'col-6',
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
    imgLink.href = `/pages/en/game_detail_en.html?id=${rental.id}`;

    const gameImg = document.createElement('img');
    gameImg.src = rental.imgUrl;

    imgLink.appendChild(gameImg);
    imgContainer.appendChild(imgLink);

    const gameTitle = document.createElement('h5');
    const titleLink = document.createElement('a');
    titleLink.href = `/pages/en/game_detail_en.html?id=${rental.id}`;
    titleLink.textContent = rental.title;

    gameTitle.appendChild(titleLink);

    gameContainer.appendChild(imgContainer);
    gameContainer.appendChild(gameTitle);

    container.appendChild(gameContainer);
}

// functions for editing and adding address
const addressModal = new bootstrap.Modal('#addressModal');
const addressForm = document.getElementById('addressForm');
const addressId = document.getElementById('addressId');

const inputNameOnAddress = document.getElementById('inputNameOnAddress');
const inputAddress = document.getElementById('inputAddress');
const inputCity = document.getElementById('inputCity');
const inputProvince = document.getElementById('inputProvince');
const inputPostalCode = document.getElementById('inputPostalCode');

const addressModalErrorText = document.getElementById('addressModalError');

document.getElementById('addressModal').addEventListener('hidden.bs.modal', () => {
    addressModalErrorText.innerText = '';
    addressForm.reset();
});

addressForm.addEventListener('submit', async e => {
    e.preventDefault();

    let name = inputNameOnAddress.value;
    let street = inputAddress.value;
    let city = inputCity.value;
    let postalCode = inputPostalCode.value;

    try {
        if (validateAddress(postalCode, street, name, city)) {
            addressModal.hide();
            await saveAddress();
            renderTabContent('address', user.addresses, addressFields);
        }
    } catch (error) {
        addressModalErrorText.textContent = error;
    }
});

/**
 * fills inputs in address modal with values
 * @param {object} event a click event
 */
function fillAddressFormInfo(event) {
    let objId = event.target.getAttribute('data-id');

    let index = user.addresses.findIndex(obj => obj._id == objId);
    if (index !== -1) {
        addressId.value = objId;

        inputNameOnAddress.value = user.addresses[index].name;
        inputAddress.value = user.addresses[index].street;
        inputCity.value = user.addresses[index].city;
        inputProvince.value = user.addresses[index].province;
        inputPostalCode.value = user.addresses[index].postalCode;
    }
}

/**
 * updates or adds address
 */
async function saveAddress() {
    let addressIdValue = addressId.value;
    let name = inputNameOnAddress.value;
    let street = inputAddress.value;
    let city = inputCity.value;
    let province = inputProvince.value;
    let postalCode = inputPostalCode.value;

    await fetch(`http://localhost:3000/users/${user._id}/address`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            addressIdValue,
            name,
            street,
            city,
            province,
            postalCode,
        }),
    })
        .then(res => res.text())
        .then(res => {
            updateUser(res);
        })
        .catch(err => console.log(err));
}

// functions for editing and adding payment method
const paymentModal = new bootstrap.Modal('#paymentModal');
const paymentMethodForm = document.getElementById('paymentMethodForm');
const paymentMethodId = document.getElementById('paymentMethodId');

const inputCardholder = document.getElementById('inputCardholder');
const inputCardNumber = document.getElementById('inputCardNumber');
const inputNickname = document.getElementById('inputNickname');
const inputExpiry = document.getElementById('inputExpiry');
const inputCvv = document.getElementById('inputCvv');

const paymentModalErrorText = document.getElementById('paymentModalError');

document.getElementById('paymentModal').addEventListener('hidden.bs.modal', () => {
    paymentModalErrorText.innerText = '';
    paymentMethodForm.reset();
});

paymentMethodForm.addEventListener('submit', async e => {
    e.preventDefault();

    let cardNumber = inputCardNumber.value;
    let cardholder = inputCardholder.value;
    let expiryDate = inputExpiry.value;
    let cvv = inputCvv.value;

    try {
        if (validatePaymentMethod(cardNumber, cardholder, cvv, expiryDate)) {
            paymentModal.hide();
            await savePaymentMethod();
            renderTabContent('payment', user.paymentMethods, paymentFields);
        }
    } catch (error) {
        paymentModalErrorText.textContent = error;
    }
});

/**
 * fills inputs in payment modal with values
 * @param {object} event a click event
 */
function fillPaymentFormInfo(event) {
    let objId = event.target.getAttribute('data-id');

    let index = user.paymentMethods.findIndex(obj => obj._id == objId);
    if (index !== -1) {
        paymentMethodId.value = objId;

        inputCardholder.value = user.paymentMethods[index].cardholder;
        inputCardNumber.value = '************' + user.paymentMethods[index].cardNumber.slice(-4);
        inputNickname.value = user.paymentMethods[index].nickname;
        inputExpiry.value = user.paymentMethods[index].expiry;
    }
}

/**
 * updates or adds payment method
 */
async function savePaymentMethod() {
    let paymentIdValue = paymentMethodId.value;
    let nickname = inputNickname.value;
    let cardNumber = inputCardNumber.value;
    let cardholder = inputCardholder.value;
    let expiry = inputExpiry.value;

    await fetch(`http://localhost:3000/users/${user._id}/payment`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            paymentIdValue,
            nickname,
            cardNumber,
            cardholder,
            expiry,
        }),
    })
        .then(res => res.text())
        .then(data => {
            updateUser(data);
        })
        .catch(err => console.log(err));
}

/**
 * deletes a certain object from an Array base on click event
 * @param {object} event a click event
 * @param {Array} objs the Array to delete object from
 */
async function deleteRecord(event, objs) {
    let objId = event.target.getAttribute('data-id');
    let type = event.target.getAttribute('data-type');

    if (objs.length === 1) {
        // user must keep at least 1 address and payment method
        alert('You must keep at least 1 address and payment method.');
        return;
    }

    let index = objs.findIndex(obj => obj._id == objId);
    if (index !== -1) {
        try {
            await fetch(`http://localhost:3000/users/${user._id}/${type}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    objId,
                }),
            })
                .then(res => res.text())
                .then(res => {
                    updateUser(res);
                })
                .catch(err => console.log(err));
        } catch (e) {
            console.error('error: ' + e);
        }
    }
}

/**
 * renders contents for address or payment method tab
 * @param {string} type "address" or "payment"
 * @param {Array} objs addresses or payment methods to be rendered
 * @param {Array} fields the object keys to be rendered
 */
function renderTabContent(type, objs, fields) {
    const columnNames = fields.map(field => toTitleCase(field));
    const table = document.getElementsByTagName('table')[0];

    table.innerHTML = '';
    renderThead(table, columnNames);

    if (objs.length) {
        const tbody = document.createElement('tbody');
        tbody.classList.add('table-group-divider');
        table.appendChild(tbody);

        renderTbody(type, tbody, objs, fields);
    }

    renderAddBtn(type);
}

/**
 * renders heading line to an existing table
 * @param {object} table
 * @param {Array} columnNames
 */
function renderThead(table, columnNames) {
    const thead = document.createElement('thead');
    table.appendChild(thead);

    const tr = document.createElement('tr');
    thead.appendChild(tr);

    for (let columnName of columnNames) {
        const th = document.createElement('th');

        th.setAttribute('scope', 'col');
        th.classList.add('align-middle');
        th.textContent = columnName;

        tr.appendChild(th);
    }

    const th = document.createElement('th');
    th.setAttribute('scope', 'col');

    tr.appendChild(th);
}

/**
 * renders address or payment info to an existing tbody
 * @param {string} type "address" or "payment"
 * @param {object} tbody a tbody element
 * @param {Array} objs  addresses or payment methods to be rendered
 * @param {Array} fields the keys for the values to be rendered
 */
function renderTbody(type, tbody, objs, fields) {
    tbody.innerHTML = '';

    for (let obj of objs) {
        const tr = document.createElement('tr');
        tbody.appendChild(tr);

        for (let field of fields) {
            const td = document.createElement('td');

            if (field === 'cardNumber') {
                td.textContent = '************' + obj[field].slice(-4);
            } else {
                td.textContent = obj[field];
            }

            tr.appendChild(td);
        }

        const td = document.createElement('td');

        const editBtn = createBtn('Edit');
        editBtn.setAttribute('data-id', obj._id);
        editBtn.classList.add('text-primary');

        switch (type) {
            case 'address':
                // onclick render address modal body
                editBtn.addEventListener('click', e => {
                    fillAddressFormInfo(e);
                    addressModal.show();
                });
                break;
            case 'payment':
                editBtn.addEventListener('click', e => {
                    fillPaymentFormInfo(e);
                    paymentModal.show();
                });
                break;
            default:
                console.error('Type must be either "address" or "payment".');
                return;
        }

        const deleteBtn = createBtn('Delete');
        deleteBtn.setAttribute('data-id', obj._id);
        deleteBtn.setAttribute('data-type', type);
        deleteBtn.classList.add('text-danger');

        deleteBtn.addEventListener('click', async e => {
            await deleteRecord(e, objs);
            tbody.innerHTML = '';

            switch (type) {
                case 'address':
                    renderTbody(type, tbody, user.addresses, fields);
                    break;
                case 'payment':
                    renderTbody(type, tbody, user.paymentMethods, fields);
                    document.getElementById('userDefaultPayment').textContent =
                        user.paymentMethods[0].cardNumber.slice(-4);
                    break;
                default:
                    console.error('Type must be either "address" or "payment".');
                    return;
            }
        });

        td.appendChild(editBtn, deleteBtn);
        td.appendChild(deleteBtn);

        tr.appendChild(td);
    }
}

/**
 * renders btn to add a new address or payment method
 * @param {string} type "address" or "payment"
 */
function renderAddBtn(type) {
    const addBtn = document.createElement('a');
    addBtn.setAttribute('type', 'button');
    addBtn.innerHTML = `<u>Add new ${type}</u>`;

    const deleteBtn = document.createElement('a');
    deleteBtn.setAttribute('type', 'button');
    deleteBtn.innerHTML = '<u>Delete my account</u>';
    deleteBtn.setAttribute('class', 'text-danger');

    switch (type) {
        case 'address':
            addBtn.addEventListener('click', () => addressModal.show());
            break;
        case 'payment':
            addBtn.addEventListener('click', () => paymentModal.show());
            break;
        default:
            console.error('Type must be either "address" or "payment".');
            return;
    }

    deleteBtn.addEventListener('click', deleteUser);

    const container = document.getElementById('addBtnContainer');
    container.innerHTML = '';
    container.appendChild(addBtn);
    container.appendChild(deleteBtn);
}

/**
 * creates an anchor element that acts as a button
 * @param {string} innerContent
 * @returns object
 */
function createBtn(innerContent) {
    let btn = document.createElement('a');
    // btn.setAttribute("type", "button");
    btn.classList.add('btn');

    btn.innerHTML = innerContent;
    return btn;
}

/**
 * Asynchronous function deletes a user from the server and clears sessionStorage and localStorage. It then redirects the user to the index page.
 */

async function deleteUser() {
    if (confirm('Are you sure to delete this account? This action cannot be undone.')) {
        try {
            fetch(`http://localhost:3000/users/${user._id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            sessionStorage.clear();
            localStorage.clear();

            window.location.href = '/index.html';
        } catch (e) {
            console.error('error: ' + e);
        }
    }
}

/**
 * converts a camel case string into title case
 * @param {string} str a string in camel case
 * @returns formatted string in title case
 */
function toTitleCase(str) {
    const formatted = str.replace(/([A-Z])/g, ' $1');
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * gets keys from an object
 * @param {object} obj
 * @param {Array} excludeKeys the keys to exclude
 * @returns an Array of keys
 */
function getKeysExcept(obj, excludeKeys = []) {
    return Object.keys(obj).filter(key => !excludeKeys.includes(key));
}
