let allRecipes = [];
let currentCategory = 'All';

fetch('recipes.json')
    .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then(data => {
        allRecipes = data.sort((a, b) => a.title.localeCompare(b.title));
        setupCategories();
        displayRecipes(allRecipes);
    })
    .catch(err => {
        // This will now show us exactly why it failed in the browser console
        console.error("JSON PARSE ERROR: Check your recipes.json file for a missing comma or an unescaped quote mark.", err);
        document.getElementById('recipeList').innerHTML = `<p style="padding: 20px; color: var(--clay); text-align: center;">Unable to load recipes. There is a formatting error in your recipes.json file.</p>`;
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
                        (r.notes && (Array.isArray(r.notes) ? r.notes.join(" ") : r.notes).toLowerCase().includes(q));
        return mCat && mSearch;
    });
    displayRecipes(filtered);
}

function displayRecipes(recipes) {
    const list = document.getElementById('recipeList');
    if (recipes.length === 0) {
        list.innerHTML = `<p style="text-align: center; color: var(--clay); padding: 40px;">No matches found...</p>`;
        return;
    }
    list.innerHTML = recipes.map(r => {
        // Robust escaping for the title
        const titleSafe = r.title.replace(/'/g, "\\'").replace(/"/g, "&quot;");
        return `
            <div class="recipe-item" onclick="openRecipe('${titleSafe}')">
                <h3>${r.title}</h3>
                <p>${r.category || 'Uncategorized'}</p>
            </div>
        `;
    }).join('');
}

function openRecipe(title) {
    const recipe = allRecipes.find(r => r.title === title);
    const body = document.getElementById('modalBody');

    // Handle notes as either a String or an Array
    let notesText = "";
    if (recipe.notes) {
        notesText = Array.isArray(recipe.notes) ? recipe.notes.join("<br><br>") : recipe.notes;
    }

    const notesHtml = notesText.trim().length > 0 
        ? `<div class="notes-container">
            <span style="display:block; text-transform:uppercase; font-size:0.7rem; font-weight:bold; color:var(--clay); margin-bottom:10px; font-family:sans-serif; font-style:normal; letter-spacing:1px;">Personal Notes</span>
            ${notesText}
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
    document.body.style.overflow = "hidden";
}

function closeModal() {
    document.getElementById('recipeModal').style.display = "none";
    document.body.style.overflow = "auto";
}

window.onclick = e => { if(e.target.id == 'recipeModal') closeModal(); }
