let allRecipes = [];
let currentCategory = 'All';

// Fetch and Setup
fetch('recipes.json')
    .then(res => res.json())
    .then(data => {
        // High-end alphabetization
        allRecipes = data.sort((a, b) => a.title.localeCompare(b.title));
        setupCategories();
        displayRecipes(allRecipes);
    });

function setupCategories() {
    const tabsContainer = document.getElementById('categoryTabs');
    const categories = ['All', ...new Set(allRecipes.map(r => r.category).filter(Boolean))].sort();

    tabsContainer.innerHTML = categories.map(cat => `
        <div class="tab ${cat === 'All' ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">
            ${cat}
        </div>
    `).join('');
}

function filterByCategory(cat, el) {
    currentCategory = cat;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    searchRecipes();
}

function searchRecipes() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allRecipes.filter(r => {
        const matchCat = currentCategory === 'All' || r.category === currentCategory;
        const matchSearch = r.title.toLowerCase().includes(query) || 
                            r.ingredients.some(i => i.toLowerCase().includes(query)) ||
                            r.notes.toLowerCase().includes(query);
        return matchCat && matchSearch;
    });
    displayRecipes(filtered);
}

function displayRecipes(recipes) {
    const list = document.getElementById('recipeList');
    list.innerHTML = recipes.map(r => `
        <div class="recipe-item" onclick="openRecipe('${r.title}')">
            <h3>${r.title}</h3>
            <p>${r.category}</p>
        </div>
    `).join('');
}

function openRecipe(title) {
    const recipe = allRecipes.find(r => r.title === title);
    const modal = document.getElementById('recipeModal');
    const body = document.getElementById('modalBody');
    
    body.innerHTML = `
        <h1>${recipe.title}</h1>
        <div class="section-label">Ingredients</div>
        <div class="content-text">
            ${recipe.ingredients.map(i => `• ${i}<br>`).join('')}
        </div>
        <div class="section-label">Method</div>
        <div class="content-text">
            ${recipe.directions.map((d, i) => `${i+1}. ${d}<br><br>`).join('')}
        </div>
        <div class="section-label">Personal Notes</div>
        <div class="notes-area">${recipe.notes}</div>
        <a href="${recipe.pdfLink}" target="_blank" class="pdf-block">Original Family Document</a>
    `;
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById('recipeModal').style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = e => { if(e.target.id == 'recipeModal') closeModal(); }
