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
    const nav = document.getElementById('categoryTabs');
    const categories = ['All', ...new Set(allRecipes.map(r => r.category).filter(Boolean))].sort();
    nav.innerHTML = categories.map(cat => `
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
                        (r.notes && r.notes.toLowerCase().includes(q));
        return mCat && mSearch;
    });
    displayRecipes(filtered);
}

function displayRecipes(recipes) {
    const list = document.getElementById('recipeList');
    list.innerHTML = recipes.map(r => {
        // Cleanly escape both single and double quotes for the inline onclick attribute
        const escapedTitle = r.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        return `
            <div class="recipe-item" onclick="openRecipe('${escapedTitle}')">
                <h3>${r.title}</h3>
                <p>${r.category}</p>
            </div>
        `;
    }).join('');
}

function openRecipe(title) {
    const recipe = allRecipes.find(r => r.title === title);
    const body = document.getElementById('modalBody');

    // UX Decision: Check if notes exist. Only inject the div if content is present.
    const hasNotes = recipe.notes && recipe.notes.trim().length > 0;
    const notesHtml = hasNotes 
        ? `<div class="notes-container">
            <span style="display:block; text-transform:uppercase; font-size:0.7rem; font-weight:bold; color:var(--clay); margin-bottom:10px; font-family:sans-serif; font-style:normal; letter-spacing:1px;">Personal Notes</span>
            ${recipe.notes}
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
    
    document.getElementById('recipeModal').style.display = "block";
    document.body.style.overflow = "hidden"; // Prevent background scroll
}

function closeModal() {
    document.getElementById('recipeModal').style.display = "none";
    document.body.style.overflow = "auto";
}

// Global click-out to close
window.onclick = e => { if(e.target.id == 'recipeModal') closeModal(); }
