let defaultPlan = 'Basic';
if (window.location.hash) {
    defaultPlan = window.location.hash.slice(1);
}

const pricing = [
    {
        name: 'Basic',
        price: 20,
    },
    {
        name: 'Pro',
        price: 35,
    },
    {
        name: 'Elite',
        price: 55,
    },
];

const planTextContainer = document.getElementById('plan');
const planDropdown = document.getElementById('planDropdown');
const priceContainers = document.getElementsByClassName('total');

// payment method inputs
const addressId = document.getElementById('addressId');

const inputAddress = document.getElementById('inputAddress');
const inputCity = document.getElementById('inputCity');
const inputProvince = document.getElementById('inputProvince');
const inputPostalCode = document.getElementById('inputPostalCode');

const addressModalErrorText = document.getElementById('addressModalError');

// address inputs
const paymentMethodId = document.getElementById('paymentMethodId');

const inputCardholder = document.getElementById('inputCardholder');
const inputCardNumber = document.getElementById('inputCardNumber');
const inputNickname = document.getElementById('inputNickname');
const inputExpiry = document.getElementById('inputExpiry');
const inputCvv = document.getElementById('inputCvv');

const paymentModalErrorText = document.getElementById('paymentModalError');

// order form
const orderForm = document.getElementById('orderForm');
const checkoutBtn = document.getElementById('checkoutBtn');
const orderErrorText = document.getElementById('orderErrorText');

// render order info base on default selected plan
planTextContainer.textContent = defaultPlan;
planDropdown.value = defaultPlan;
checkNumOfGamesOut(defaultPlan);

for (let container of priceContainers) {
    container.textContent = pricing.find(plan => plan.name === defaultPlan).price.toFixed(2);
}

// render address input values base on current user
if (user.addresses?.length) {
    const defaultAddress = user.addresses[0];
    addressId.value = defaultAddress._id;

    inputAddress.value = defaultAddress.street;
    inputCity.value = defaultAddress.city;
    inputProvince.value = defaultAddress.province;
    inputPostalCode.value = defaultAddress.postalCode;
}

// render payment method input values base on current user
if (user.paymentMethods?.length) {
    const defaultPaymentMethod = user.paymentMethods[0];
    paymentMethodId.value = defaultPaymentMethod._id;

    inputCardholder.value = defaultPaymentMethod.cardholder;
    inputCardNumber.value = '************' + defaultPaymentMethod.cardNumber.slice(-4);
    inputNickname.value = defaultPaymentMethod.nickname;
    inputExpiry.value = defaultPaymentMethod.expiry;
}

// changes order summary content when selected plan changes
planDropdown.addEventListener('change', e => {
    const selectedPlan = e.target.value;
    orderErrorText.textContent = '';
    checkoutBtn.classList.remove('disabled');

    // disable checkout btn if user selects the same plan as before
    if (selectedPlan) {
        if (user.plan === planDropdown.value) {
            orderErrorText.textContent = `You are already under ${selectedPlan} plan.`;
            checkoutBtn.classList.add('disabled');
        }

        // or the user has more games out than the selected plan allowed
        // (for example, an Elite user with 4 games out atm will not be allowed to downgrade the plan)
        checkNumOfGamesOut(selectedPlan);

        planTextContainer.textContent = selectedPlan;
        for (let container of priceContainers) {
            container.textContent = pricing
                .find(plan => plan.name === selectedPlan)
                .price.toFixed(2);
        }
    } else {
        planTextContainer.textContent = '';
        for (let container of priceContainers) {
            container.textContent = '0.00';
        }
    }
});

// on order submission
orderForm.addEventListener('submit', e => {
    e.preventDefault();

    // validate address and payment method
    try {
        if (
            validateAddress(
                inputPostalCode.value,
                inputAddress.value,
                inputCardholder.value,
                inputCity.value
            ) &&
            validatePaymentMethod(
                inputCardNumber.value,
                inputCardholder.value,
                inputCvv.value,
                inputExpiry.value
            )
        ) {
            // save address (if new)
            if (!user.addresses.filter(address => address._id == addressId.value).length) {
                user.addresses.push({
                    name: inputCardholder.value,
                    street: inputAddress.value,
                    city: inputCity.value,
                    province: inputProvince.value,
                    postalCode: inputPostalCode.value,
                });
            }
            // save payment method (if new)
            if (
                !user.paymentMethods.filter(
                    paymentMethod => paymentMethod._id == paymentMethodId.value
                ).length
            ) {
                user.paymentMethods.push({
                    nickname: inputNickname.value,
                    cardNumber: inputCardNumber.value,
                    cardholder: inputCardholder.value,
                    expiry: inputExpiry.value,
                });
            }

            // update user plan
            user.plan = planDropdown.value;
            user.rentals.forEach(rental => checkUserPlan(rental));

            //updating the user in the database
            fetch(`http://localhost:3000/users/${user._id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                },
                body: JSON.stringify({
                    user: user,
                }),
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(data => {
                    updateUser(data);
                    window.location.href = '/pages/en/user_space_en.html';
                })
                .catch(error => {
                    console.error('Error:', error);
                });
        }
    } catch (error) {
        orderErrorText.textContent = error;
    }
});

function checkNumOfGamesOut(selectedPlan) {
    switch (user.plan) {
        case 'Pro':
            if (selectedPlan === 'Basic') {
                const proUserCurrGameOut = user.rentals.filter(
                    rental => rental.status === 'out'
                ).length;
                if (proUserCurrGameOut > 1) {
                    orderErrorText.textContent = `You have ${proUserCurrGameOut} games out and cannot downgrade to ${selectedPlan} plan.`;
                    checkoutBtn.classList.add('disabled');
                }
            }
            break;
        case 'Elite':
            const eliteUserCurrGameOut = user.rentals.filter(
                rental => rental.status === 'out'
            ).length;
            if (
                (eliteUserCurrGameOut > 3 && selectedPlan === 'Pro') ||
                (eliteUserCurrGameOut > 1 && selectedPlan === 'Basic')
            ) {
                orderErrorText.textContent = `You have ${eliteUserCurrGameOut} games out and cannot downgrade to ${selectedPlan} plan.`;
                checkoutBtn.classList.add('disabled');
            }
            break;
    }
}
