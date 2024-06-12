let formatSelect;
let quantityInput;
let data;

async function getDatas() {
    const url = window.location.href;
    const id = new URL(url).searchParams.get('id');

    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`);
        data = await response.json();
        updatePageContent();
    } catch (error) {
        console.error('Erreur lors de la récupération des données :', error);
    }
}

function updatePageContent() {
    document.querySelector('h1').innerText = data.titre;
    document.querySelector('figure img').src = data.image;

    const aside = document.querySelector("aside h2");
    aside.innerText = `Description de l'œuvre : ${data.titre}`;

    const para = document.createElement("p");
    para.innerText = data.description;
    para.id = "short_desc";
    aside.insertAdjacentElement("afterend", para);

    const premierParagraphe = data.description.split("\n\n")[0];
    document.querySelector('#short_desc').innerText = premierParagraphe;

    const boutonAcheter = document.querySelector('.button-buy');
    boutonAcheter.innerText = `Acheter ${data.shorttitle}`;
    boutonAcheter.addEventListener('click', (event) => {
        addToCart(event);
        event.preventDefault();
        alert('Produit bien ajouté au panier');
    });

    const prixContainer = document.querySelector('.price .showprice');
    formatSelect = document.getElementById('format');

    data.declinaisons.forEach((declinaison) => {
        const option = document.createElement('option');
        option.value = declinaison.taille;
        option.innerText = declinaison.taille;
        formatSelect.appendChild(option);

        if (declinaison.taille === '20 x 20') {
            prixContainer.innerText = `${declinaison.prix}€`;
        }
    });

    formatSelect.addEventListener('change', (event) => {
        const tailleSelectionnee = event.target.value;
        const declinaisonSelectionnee = data.declinaisons.find(declinaison => declinaison.taille === tailleSelectionnee);
        if (declinaisonSelectionnee) {
            prixContainer.innerText = `${declinaisonSelectionnee.prix}€`;
        }
    });

    quantityInput = document.getElementById('quantity');
    quantityInput.addEventListener('input', (event) => {
        let quantite = parseInt(event.target.value);
        quantite = Math.max(1, Math.min(quantite, 100));
        event.target.value = quantite;
    });

    document.querySelector('title').innerHTML = `${data.titre} - GeniArtHub`; 
}

function addToCart() {
    const produit = {
        id: data._id,
        image: data.image,
        titre: data.titre,
        taille: formatSelect.value,
        quantite: quantityInput.value
    };

    if (parseInt(produit.quantite) > 100) {
        alert("La quantité maximale autorisée est de 100.");
        return;
    }

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const indexProduitExistant = cart.findIndex(item => item.id === produit.id && item.taille === produit.taille);

    if (indexProduitExistant !== -1) {
        cart[indexProduitExistant].quantite = Math.min(parseInt(cart[indexProduitExistant].quantite) + parseInt(produit.quantite), 100);
    } else {
        cart.push(produit);
    }

    localStorage.setItem('cart', JSON.stringify(cart));
}



getDatas();
