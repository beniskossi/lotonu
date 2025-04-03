class LotonuApp {
    constructor() {
        this.categories = ['GH18', 'CIV10', 'CIV13', 'CIV16'];
        this.currentCategory = 'GH18';
        this.currentView = 'entrées';
        this.data = this.loadData();
        this.initUI();
        this.hideLoader();
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('lotonu-data');
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Vérifier que les données sont bien formées
                if (this.isValidData(parsedData)) {
                    console.log('Données chargées depuis localStorage :', parsedData);
                    return parsedData;
                }
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données depuis localStorage :', error);
        }
        // Si les données sont absentes ou corrompues, initialiser avec une structure par défaut
        const initialData = { GH18: [], CIV10: [], CIV13: [], CIV16: [] };
        this.saveData(initialData);
        return initialData;
    }

    isValidData(data) {
        // Vérifier que les données ont la structure attendue
        if (!data || typeof data !== 'object') return false;
        return this.categories.every(cat => Array.isArray(data[cat]));
    }

    saveData(data = this.data) {
        try {
            localStorage.setItem('lotonu-data', JSON.stringify(data));
            console.log('Données sauvegardées dans localStorage :', data);
        } catch (error) {
            console.error('Erreur lors de la sauvegarde des données dans localStorage :', error);
            alert('Erreur lors de la sauvegarde des données. Vérifiez la console pour plus de détails.');
        }
    }

    initUI() {
        this.renderCategories();
        this.renderSubmenus();
        this.renderView();
        this.addEventListeners();
    }

    renderCategories() {
        const nav = document.getElementById('categoryNav');
        if (!nav) return;
        nav.innerHTML = this.categories.map(cat => `
            <button class="category-btn ${cat === this.currentCategory ? 'active' : ''}" 
                    data-category="${cat}">${cat}</button>
        `).join('');
    }

    renderSubmenus() {
        const submenus = ['Entrées', 'Consult', 'Stats'];
        const nav = document.getElementById('submenuNav');
        if (!nav) return;
        nav.innerHTML = submenus.map(menu => `
            <button class="submenu-btn ${menu.toLowerCase() === this.currentView ? 'active' : ''}" 
                    data-view="${menu.toLowerCase()}">${menu}</button>
        `).join('');
    }

    renderView() {
        const views = {
            'entrées': this.renderEnterView.bind(this),
            'consult': this.renderConsultView.bind(this),
            'stats': this.renderStatsView.bind(this)
        };
        const content = document.getElementById('dynamicContent');
        if (!content) return;
        content.innerHTML = views[this.currentView]();
    }

    renderEnterView() {
        const entries = this.data[this.currentCategory] || [];
        return `
            <section class="entry-section">
                <h2>Entrées - ${this.currentCategory}</h2>
                <div class="entry-form">
                    <input type="text" id="entryNum" placeholder="Numéro (000-999)" pattern="\\d{1,3}" autocomplete="off">
                    <select id="entryPos">
                        ${Array.from({ length: 10 }, (_, i) => `<option value="${i}">P${i + 1}</option>`).join('')}
                    </select>
                    <input type="text" id="entryValue" placeholder="Valeur (0-9)" pattern="\\d{1}" autocomplete="off">
                    <button class="btn" onclick="app.saveEntry()">Enregistrer</button>
                </div>
                <div class="entry-feedback">
                    <h3>Entrées enregistrées (${entries.length}) :</h3>
                    <ul class="entries-list">${
                        entries.length > 0 
                            ? entries.map(entry => {
                                const values = Array.isArray(entry.values) ? entry.values.join(';') : 'Aucune valeur';
                                return `<li>Num ${String(entry.num).padStart(3, '0')}, P${entry.pos + 1} = ${values}</li>`;
                            }).join('')
                            : '<li>Aucune entrée</li>'
                    }</ul>
                </div>
            </section>
        `;
    }

    renderConsultView() {
        return `
            <section class="consult-section">
                <h2>Consultation - ${this.currentCategory}</h2>
                <div class="consult-form">
                    <input type="text" id="searchNum" placeholder="Rechercher (000-999)" pattern="\\d{1,3}" autocomplete="off">
                    <button class="btn" onclick="app.searchData()">Chercher</button>
                </div>
                <div id="consultResult" class="consult-result"></div>
            </section>
        `;
    }

    renderStatsView() {
        const entries = this.data[this.currentCategory] || [];
        const totalValues = entries.reduce((sum, entry) => sum + (Array.isArray(entry.values) ? entry.values.length : 0), 0);
        return `
            <section class="stats-section">
                <h2>Statistiques - ${this.currentCategory}</h2>
                <p>Positions remplies : ${entries.length}</p>
                <p>Total des valeurs : ${totalValues}</p>
            </section>
        `;
    }

    saveEntry() {
        const numInput = document.getElementById('entryNum').value;
        const pos = parseInt(document.getElementById('entryPos').value);
        const valueInput = document.getElementById('entryValue').value;

        const num = parseInt(numInput);
        const value = parseInt(valueInput);

        if (isNaN(num) || num < 0 || num > 999 || 
            isNaN(pos) || pos < 0 || pos > 9 || 
            isNaN(value) || value < 0 || value > 9) {
            alert('Veuillez entrer des valeurs valides : Num (000-999), Pos (P1-P10), Val (0-9)');
            return;
        }

        const entries = this.data[this.currentCategory] || [];
        const existingEntry = entries.find(e => e.num === num && e.pos === pos);
        if (existingEntry) {
            if (!Array.isArray(existingEntry.values)) {
                existingEntry.values = [];
            }
            existingEntry.values.push(value);
        } else {
            entries.push({ num, pos, values: [value] });
        }
        this.data[this.currentCategory] = entries;
        this.saveData();
        this.renderView();
    }

    searchData() {
        const numInput = document.getElementById('searchNum').value;
        const num = parseInt(numInput);
        if (isNaN(num) || num < 0 || num > 999) {
            document.getElementById('consultResult').innerHTML = '<p class="error">Numéro invalide.</p>';
            return;
        }
        const entries = this.data[this.currentCategory] || [];
        const filteredEntries = entries.filter(entry => entry.num === num);
        document.getElementById('consultResult').innerHTML = `
            <p>Numéro ${String(num).padStart(3, '0')} :</p>
            <ul>${
                filteredEntries.length > 0 
                    ? filteredEntries.map(entry => {
                        const values = Array.isArray(entry.values) ? entry.values.join(';') : 'Aucune valeur';
                        return `<li>P${entry.pos + 1}: ${values}</li>`;
                    }).join('')
                    : '<li>Aucune donnée pour ce numéro</li>'
            }</ul>
        `;
    }

    addEventListeners() {
        const categoryNav = document.getElementById('categoryNav');
        const submenuNav = document.getElementById('submenuNav');
        const entryNum = document.getElementById('entryNum');
        const entryValue = document.getElementById('entryValue');

        if (categoryNav) {
            categoryNav.addEventListener('click', (e) => {
                const cat = e.target.dataset.category;
                if (cat) {
                    this.currentCategory = cat;
                    this.renderCategories();
                    this.renderView();
                }
            });
        }

        if (submenuNav) {
            submenuNav.addEventListener('click', (e) => {
                const view = e.target.dataset.view;
                if (view) {
                    this.currentView = view;
                    this.renderSubmenus();
                    this.renderView();
                }
            });
        }

        if (entryNum) {
            entryNum.addEventListener('keypress', (e) => {
                console.log('Saisie dans entryNum :', e.key);
                if (e.key === 'Enter') this.saveEntry();
            });
            entryNum.addEventListener('input', (e) => {
                console.log('Valeur de entryNum :', e.target.value);
            });
        }
        if (entryValue) {
            entryValue.addEventListener('keypress', (e) => {
                console.log('Saisie dans entryValue :', e.key);
                if (e.key === 'Enter') this.saveEntry();
            });
            entryValue.addEventListener('input', (e) => {
                console.log('Valeur de entryValue :', e.target.value);
            });
        }
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (!loader) return;
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 300);
    }

    factoryReset() {
        if (confirm('Réinitialiser toutes les données ?')) {
            this.data = {};
            this.categories.forEach(cat => this.data[cat] = []);
            this.saveData();
            this.renderView();
        }
    }
}

let app;
window.addEventListener('load', () => {
    app = new LotonuApp();
});