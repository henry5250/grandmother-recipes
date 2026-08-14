let allRecipes = [];
let currentCategory = 'All';

fetch('recipes.json')
    .then(res => res.json())
    .then(data => {
        allRecipes = data.sort((a, b) => a.title.localeCompare(b.title));
        setupCategories();
        displayRecipes(allRecipes);
    });

function setupCategories() {
    const tabs = document.getElementById('categoryTabs');
    const categories = ['All', ...new Set(allRecipes.map(r => r.category).filter(Boolean))].sort();
    tabs.innerHTML = categories.map(cat => `
        <div class="tab ${cat === 'All' ? 'active' : ''}" onclick="filterByCategory('${cat}', this)">${cat}</div>
    `).join('');
}

function filterByCategory(cat, el) {
    currentCategory = cat;
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');
    searchRecipes();
}

function searchRecipes() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = allRecipes.filter(r => {
        const mCat = currentCategory === 'All' || r.category === currentCategory;
        const mSearch = r.title.toLowerCase().includes(q) || 
                        r.ingredients.some(i => i.toLowerCase().includes(q)) ||
                        r.notes.toLowerCase().includes(q);
        return mCat && mSearch;
    });
    displayRecipes(filtered);
}

function displayRecipes(recipes) {
    const list = document.getElementById('recipeList');
    list.innerHTML = recipes.map(r => `
        <div class="recipe-item" onclick="openRecipe('${r.title.replace(/'/g, "\\'")}')">
            <h3>${r.title}</h3>
            <p>${r.category}</p>
        </div>
    `).join('');
}

function openRecipe(title) {
    const recipe = allRecipes.find(r => r.title === title);
    const modal = document.getElementById('recipeModal');
    const body = document.getElementById('modalBody');

    // Remove Note section if notes are missing or empty
    const notesHtml = (recipe.notes && recipe.notes.trim()) 
        ? `<div class="notes-section">
            <h4>Personal Notes</h4>
            <div class="content-text" style="font-family: Georgia, serif; font-style: italic; font-size:0.95rem;">${recipe.notes}</div>
           </div>` 
        : "";
    
    body.innerHTML = `
        <h1>${recipe.title}</h1>
        <div class="section-label">Ingredients</div>
        <div class="content-text">
            <ul>${recipe.ingredients.map(i => `<li>${i}</li>`).join('')}</ul>
        </div>
        <div class="section-label">Directions</div>
        <div class="content-text">
            <ol>${recipe.directions.map(d => `<li>${d}</li>`).join('')}</ol>
        </div>
        ${notesHtml}
        <a href="${recipe.pdfLink}" target="_blank" class="pdf-btn">View the Original Scanned Recipe</a>
    `;
    
    modal.style.display = "block";
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById('recipeModal').style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = e => { if(e.target.id == 'recipeModal') closeModal(); }
