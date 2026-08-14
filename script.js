let recipes = [];

// Load the data
fetch('recipes.json')
    .then(response => response.json())
    .then(data => {
        recipes = data;
        displayRecipes(recipes);
    });

function displayRecipes(recipeArray) {
    const list = document.getElementById('recipeList');
    list.innerHTML = '';
    
    recipeArray.forEach(recipe => {
        const div = document.createElement('div');
        div.className = 'recipe-item';
        div.innerHTML = `<h3>${recipe.title}</h3><p>${recipe.category || ''}</p>`;
        div.onclick = () => openRecipe(recipe);
        list.appendChild(div);
    });
}

function searchRecipes() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = recipes.filter(r => 
        r.title.toLowerCase().includes(query) ||
        r.ingredients.some(i => i.toLowerCase().includes(query)) ||
        r.notes.toLowerCase().includes(query)
    );
    displayRecipes(filtered);
}

function openRecipe(recipe) {
    const modal = document.getElementById('recipeModal');
    const body = document.getElementById('modalBody');
    
    body.innerHTML = `
        <h1 class="recipe-title">${recipe.title}</h1>
        <div class="divider"></div>
        <h3>Ingredients</h3>
        <ul class="ingredients-list">
            ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
        </ul>
        <h3>Directions</h3>
        <ol class="directions-list">
            ${recipe.directions.map(d => `<li>${d}</li>`).join('')}
        </ol>
        <div class="notes-area">
            <strong>Notes:</strong> ${recipe.notes}
        </div>
        <a href="${recipe.pdfLink}" target="_blank" class="pdf-block">VIEW ORIGINAL PDF SCAN</a>
    `;
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden"; // Stop scrolling background
}

function closeModal() {
    document.getElementById('recipeModal').style.display = "none";
    document.body.style.overflow = "auto";
}

// Close modal if clicking outside the box
window.onclick = function(event) {
    let modal = document.getElementById('recipeModal');
    if (event.target == modal) closeModal();
}
