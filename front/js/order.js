const cartContainer = document.querySelector('.container');
const itemsContainer = document.querySelector('.ligne');
const totalElement = document.querySelector('.total');
const cart = JSON.parse(localStorage.getItem('cart')) || [];

async function getDatas() {
    await populateData(cart);
}

async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`http://localhost:3000/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Erreur lors de la récupération des détails du produit');
        }
        return await response.json();
    } catch (error) {
        console.error('Une erreur s\'est produite lors de la récupération des détails du produit :', error.message);
        return null;
    }
}

async function populateData(cart) {
    let totalArticles = 0;
    let totalMontant = 0;

    itemsContainer.innerHTML = ''; // Supprimer le contenu précédent

    if (cart.length === 0) {
        totalElement.innerHTML = `<h3 class="fonte">Total de la commande</h3><p id="total-content">0 article pour un montant de 0€</p>`;
        itemsContainer.innerHTML = '<p>Votre panier est vide, veuillez ajouter au moins un article à votre panier</p>';
        return;
    }

    for (const product of cart) {
        const productDetails = await fetchProductDetails(product.id);
        if (!productDetails) {
            console.error('Détails du produit non trouvés');
            continue;
        }

        const selectedDeclinaison = productDetails.declinaisons.find(declinaison => declinaison.taille === product.taille);
        if (!selectedDeclinaison || !selectedDeclinaison.prix) {
            console.error('Prix non trouvé pour la taille spécifiée');
            continue;
        }

        const prix = parseFloat(selectedDeclinaison.prix);
        const quantite = parseInt(product.quantite);
        totalArticles += quantite;
        totalMontant += prix * quantite;

        const itemHtml = `
            <article class="item">
                <img class="img" src="${productDetails.image}" alt="image du produit">
                <h3 class="fonte">${productDetails.titre}</h3>
                <p>Format: ${product.taille}</p>
                <p>${prix.toFixed(2)}€</p>
                <p>Quantité : <input type="number" name="quantity" class="quantity-input" value="${quantite}" maxlength="3" data-index="${cart.indexOf(product)}"></p>
                <p class="sup">Supprimer</p>
            </article>
        `;
        itemsContainer.insertAdjacentHTML('afterend', itemHtml);
    }

    updateTotal();
    setupEventListeners();
}

function updateQuantity(event) {
    const index = parseInt(event.target.dataset.index);
    const newQuantity = parseInt(event.target.value);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart[index] && cart[index].hasOwnProperty('quantite')) {
        cart[index].quantite = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
        updateTotal();
    } else {
        console.error('La quantité de l\'élément du panier est indéfinie ou non définie');
    }
}

function enforceQuantityLimits(event) {
    let quantity = parseInt(event.target.value);
    if (isNaN(quantity) || quantity <= 0) {
        event.target.value = 1;
    } else if (quantity > 100) {
        event.target.value = 100;
    }
}

async function updateTotal() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    let totalArticles = 0;
    let totalMontant = 0;

    if (cart.length === 0) {
        itemsContainer.innerHTML = '<p>Votre panier est vide, veuillez ajouter au moins un article à votre panier</p>';
    }

    for (const product of cart) {
        const productDetails = await fetchProductDetails(product.id);
        if (!productDetails) {
            console.error('Détails du produit non trouvés');
            continue;
        }

        const selectedDeclinaison = productDetails.declinaisons.find(declinaison => declinaison.taille === product.taille);
        if (!selectedDeclinaison || !selectedDeclinaison.prix) {
            console.error('Prix non trouvé pour la taille spécifiée');
            continue;
        }

        const prix = parseFloat(selectedDeclinaison.prix);
        const quantite = parseInt(product.quantite);
        totalArticles += quantite;
        totalMontant += prix * quantite;
    }

    const totalContent = `${totalArticles} ${totalArticles === 1 ? 'article' : 'articles'} pour un montant de ${totalMontant.toFixed(2)}€`;
    totalElement.innerHTML = `<h3 class="fonte">Total de la commande</h3><p>${totalContent}</p>`;
}

function setupEventListeners() {
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        input.addEventListener('change', updateQuantity);
        input.addEventListener('input', enforceQuantityLimits);
    });

    cartContainer.addEventListener('click', async (event) => {
        if (event.target.classList.contains('sup')) {
            const index = parseInt(event.target.closest('.item').querySelector('.quantity-input').dataset.index);
            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart.splice(index, 1);
            localStorage.setItem('cart', JSON.stringify(cart));
            event.target.closest('.item').remove();
            updateTotal();
        }
    });
}

function validateForm() {
    const prenom = document.querySelector('#first_name').value;
    const nom = document.querySelector('#name').value;
    const adresse = document.querySelector('#Adresse').value;
    const ville = document.querySelector('#Ville').value;
    const email = document.querySelector('#mail').value;

    const regexLettres = /^[a-zA-Z]+$/;
    const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (prenom.length < 2 || !regexLettres.test(prenom)) {
        alert('Le prénom doit contenir au moins 2 lettres et ne doit pas contenir de caractères spéciaux.');
        return false;
    }
    if (nom.length < 2 || !regexLettres.test(nom)) {
        alert('Le nom doit contenir au moins 2 lettres et ne doit pas contenir de caractères spéciaux.');
        return false;
    }
    if (adresse.length < 10) {
        alert('L\'adresse doit contenir au moins 10 caractères.');
        return false;
    }
    if (ville.length < 3 || !regexLettres.test(ville)) {
        alert('La ville doit contenir au moins 3 lettres et ne doit pas contenir de chiffres.');
        return false;
    }
    if (!regexEmail.test(email)) {
        alert('Veuillez entrer une adresse email valide.');
        return false;
    }
    return true;
}

async function sendOrder() {
    if (!validateForm()) {
        return false;
    }

    const user = {
        firstName: document.querySelector("#first_name").value,
        lastName: document.querySelector("#name").value,
        address: document.querySelector("#Adresse").value,
        city: document.querySelector("#Ville").value,
        email: document.querySelector("#mail").value,
    };

    const productIds = cart.map(item => item.id);

    try {
        const response = await fetch("http://localhost:3000/api/products/order", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ contact: user, products: productIds })
        });
        if (!response.ok) {
            throw new Error('Erreur lors de l\'envoi de la commande');
        }
        const data = await response.json();
        alert(`Votre commande a bien été enregistrée\nVotre numéro de commande est : ${data.orderId}`);

        localStorage.removeItem('cart');
        cart = []; 
        itemsContainer.innerHTML = '<p>Votre commande a été envoyée avec succès!</p>';
        totalElement.innerHTML = ''; 
    } catch (error) {
        console.error('Une erreur s\'est produite lors de l\'envoi de la commande :', error.message);
        alert("Une erreur s'est produite lors de l'envoi de la commande. Veuillez réessayer plus tard.");
    }

    return false;
}

getDatas();