let allRecipes = [];
let currentCategory = 'All';

// Load the data from recipes.json
fetch('recipes.json')
    .then(res => {
        if (!res.ok) throw new Error("Could not load recipes.json");
        return res.json();
    })
    .then(data => {
        allRecipes = data.sort((a, b) => a.title.localeCompare(b.title));
        setupCategories();
        displayRecipes(allRecipes);
    })
    .catch(err => console.error("Error loading recipes:", err));

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
    list.innerHTML = recipes.map((r, index) => {
        // Use the INDEX of the array instead of the title to avoid "quoting" errors
        return `
            <div class="recipe-item" onclick="openRecipe(${index})">
                <h3>${r.title}</h3>
                <p>${r.category}</p>
            </div>
        `;
    }).join('');
}

function openRecipe(index) {
    const recipe = allRecipes[index];
    const body = document.getElementById('modalBody');

    // SMART NOTES CHECK: This prevents the site from crashing if notes are formatted weirdly
    let notesText = "";
    if (recipe.notes) {
        if (Array.isArray(recipe.notes)) {
            notesText = recipe.notes.join(" "); // If it's a list, turn it into a paragraph
        } else {
            notesText = recipe.notes; // If it's already a string, use it
        }
    }

    const notesHtml = (notesText.trim().length > 0) 
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
