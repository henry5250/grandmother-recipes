let allRecipes = [];
let currentCategory = 'All';

// Load the data
fetch('recipes.json')
    .then(response => response.json())
    .then(data => {
        // Alphabetize everything right at the start
        allRecipes = data.sort((a, b) => a.title.localeCompare(b.title));
        setupCategories();
        displayRecipes(allRecipes);
    });

function setupCategories() {
    const tabsContainer = document.getElementById('categoryTabs');
    
    // Get unique categories and alphabetize them
    const categories = ['All', ...new Set(allRecipes.map(r => r.category).filter(Boolean))];
    categories.sort();

    tabsContainer.innerHTML = categories.map(cat => `
        <div class="tab ${cat === 'All' ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">
            ${cat}
        </div>
    `).join('');
}

function filterByCategory(category, element) {
    currentCategory = category;
    
    // UI: Update active tab
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    element.classList.add('active');
    
    searchRecipes(); // Re-run search/filter logic
}

function displayRecipes(recipeArray) {
    const list = document.getElementById('recipeList');
    list.innerHTML = '';
    
    if (recipeArray.length === 0) {
        list.innerHTML = `<p style="text-align:center; margin-top:40px;">No recipes found in this category.</p>`;
        return;
    }

    recipeArray.forEach(recipe => {
        const div = document.createElement('div');
        div.className = 'recipe-item';
        div.innerHTML = `<h3>${recipe.title}</h3><p>${recipe.category}</p>`;
        div.onclick = () => openRecipe(recipe);
        list.appendChild(div);
    });
}

function searchRecipes() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    const filtered = allRecipes.filter(r => {
        const matchesCategory = (currentCategory === 'All' || r.category === currentCategory);
        const matchesSearch = (
            r.title.toLowerCase().includes(query) ||
            r.ingredients.some(i => i.toLowerCase().includes(query)) ||
            r.notes.toLowerCase().includes(query)
        );
        return matchesCategory && matchesSearch;
    });
    
    displayRecipes(filtered);
}

function openRecipe(recipe) {
    const modal = document.getElementById('recipeModal');
    const body = document.getElementById('modalBody');
    
    body.innerHTML = `
        <h1 class="recipe-title" style="text-align:left;">${recipe.title}</h1>
        <div style="border-bottom: 1px solid var(--accent); margin-bottom: 20px;"></div>
        
        <div class="section-label">Ingredients</div>
        <div class="content-text">
            <ul style="list-style-type: disc; padding-left: 20px;">
                ${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}
            </ul>
        </div>
        
        <div class="section-label">Directions</div>
        <div class="content-text">
            <ol style="padding-left: 20px;">
                ${recipe.directions.map(d => `<li>${d}</li>`).join('')}
            </ol>
        </div>
        
        <div class="section-label">Notes</div>
        <div class="notes-area content-text">
            ${recipe.notes}
        </div>
        
        <a href="${recipe.pdfLink}" target="_blank" class="pdf-block">VIEW ORIGINAL PDF SCAN</a>
    `;
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById('recipeModal').style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = (event) => {
    if (event.target == document.getElementById('recipeModal')) closeModal();
}
