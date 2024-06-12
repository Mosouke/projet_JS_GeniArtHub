document.addEventListener('DOMContentLoaded', async () => {
    const url = 'http://localhost:3000/api/products/';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        const products_section = document.getElementById('aiartshop').getElementsByClassName('products')[0];
    

        // supresion des article dans le html
        while (products_section.firstChild) {
            products_section.firstChild.remove();
        }

        for (const element of data) {
            const article = document.createElement('article');
            const img = document.createElement('img');
            img.src = element.image;
            img.alt = element.title;
            article.appendChild(img);

            const a = document.createElement('a');
            a.href = `product.html?id=${element._id}`;
            a.textContent = "Buy " + element.shorttitle;
            article.appendChild(a);

            products_section.appendChild(article);
        }
    } catch (error) {
        console.error('Une erreur s\'est produite :', error);
    }
});
