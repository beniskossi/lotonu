class LotonuApp {
    constructor() {
        this.categories = ['GH18', 'CIV10', 'CIV13', 'CIV16'];
        this.currentCategory = 'GH18';
        this.currentView = 'entrées';
        this.data = this.loadData();
        this.installPrompt = null; // Pour l’invite d’installation
        this.initUI();
        this.hideLoader();
        this.setupInstallPrompt(); // Gestion de l’installation
    }

    loadData() {
        try {
            const savedData = localStorage.getItem('lotonu-data');
            if (savedData && this.isValidData(JSON.parse(savedData))) {
                return JSON.parse(savedData);
            }
        } catch (error) {
            console.error('Erreur chargement localStorage :', error);
        }
        const initialData = { GH18: [], CIV10: [], CIV13: [], CIV16: [] };
        this.saveData(initialData);
        return initialData;
    }

    isValidData(data) {
        return data && typeof data === 'object' && this.categories.every(cat => Array.isArray(data[cat]));
    }

    saveData(data = this.data) {
        try {
            localStorage.setItem('lotonu-data', JSON.stringify(data));
        } catch (error) {
            console.error('Erreur sauvegarde localStorage :', error);
            alert('Erreur sauvegarde données.');
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
        if (nav) nav.innerHTML = this.categories.map(cat => `
            <button class="category-btn ${cat === this.currentCategory ? 'active' : ''}" 
                    data-category="${cat}">${cat}</button>
        `).join('');
    }

    renderSubmenus() {
        const submenus = ['Entrées', 'Consult', 'Stats'];
        const nav = document.getElementById('submenuNav');
        if (nav) nav.innerHTML = submenus.map(menu => `
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
        if (content) content.innerHTML = views[this.currentView]();
    }

    renderEnterView() {
        const entries = this.data[this.currentCategory] || [];
        return `
            <section class="entry-section">
                <h2>Entrées - ${this.currentCategory}</h2>
                <div class="entry-form">
                    <input type="text" id="entryNum" placeholder="Numéro (000-999)" pattern="\\d{1,3}" autocomplete="off">
                    <select id="entryPos">${Array.from({ length: 10 }, (_, i) => `<option value="${i}">P${i + 1}</option>`).join('')}</select>
                    <input type="text" id="entryValue" placeholder="Valeur (0-9)" pattern="\\d{1}" autocomplete="off">
                    <button class="btn" onclick="app.saveEntry()">Enregistrer</button>
                </div>
                <div class="entry-feedback">
                    <h3>Entrées enregistrées (${entries.length}) :</h3>
                    <ul class="entries-list">${
                        entries.length > 0 
                            ? entries.map(entry => `<li>Num ${String(entry.num).padStart(3, '0')}, P${entry.pos + 1} = ${entry.values.join(';')}</li>`).join('')
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
        const totalValues = entries.reduce((sum, entry) => sum + entry.values.length, 0);
        return `
            <section class="stats-section">
                <h2>Statistiques - ${this.currentCategory}</h2>
                <p>Positions remplies : ${entries.length}</p>
                <p>Total des valeurs : ${totalValues}</p>
            </section>
        `;
    }

    saveEntry() {
        const num = parseInt(document.getElementById('entryNum').value);
        const pos = parseInt(document.getElementById('entryPos').value);
        const value = parseInt(document.getElementById('entryValue').value);
        if (isNaN(num) || num < 0 || num > 999 || isNaN(pos) || pos < 0 || pos > 9 || isNaN(value) || value < 0 || value > 9) {
            alert('Valeurs invalides : Num (000-999), Pos (P1-P10), Val (0-9)');
            return;
        }
        const entries = this.data[this.currentCategory] || [];
        const existingEntry = entries.find(e => e.num === num && e.pos === pos);
        if (existingEntry) {
            existingEntry.values.push(value);
        } else {
            entries.push({ num, pos, values: [value] });
        }
        this.data[this.currentCategory] = entries;
        this.saveData();
        this.renderView();
    }

    searchData() {
        const num = parseInt(document.getElementById('searchNum').value);
        if (isNaN(num) || num < 0 || num > 999) {
            document.getElementById('consultResult').innerHTML = '<p class="error">Numéro invalide.</p>';
            return;
        }
        const entries = this.data[this.currentCategory] || [];
        const filtered = entries.filter(entry => entry.num === num);
        document.getElementById('consultResult').innerHTML = `
            <p>Numéro ${String(num).padStart(3, '0')} :</p>
            <ul>${filtered.length > 0 ? filtered.map(entry => `<li>P${entry.pos + 1}: ${entry.values.join(';')}</li>`).join('') : '<li>Aucune donnée</li>'}</ul>
        `;
    }

    addEventListeners() {
        document.getElementById('categoryNav')?.addEventListener('click', (e) => {
            const cat = e.target.dataset.category;
            if (cat) {
                this.currentCategory = cat;
                this.renderCategories();
                this.renderView();
            }
        });
        document.getElementById('submenuNav')?.addEventListener('click', (e) => {
            const view = e.target.dataset.view;
            if (view) {
                this.currentView = view;
                this.renderSubmenus();
                this.renderView();
            }
        });
        document.getElementById('entryNum')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.saveEntry(); });
        document.getElementById('entryValue')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') this.saveEntry(); });
    }

    hideLoader() {
        const loader = document.getElementById('loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => loader.style.display = 'none', 300);
        }
    }

    factoryReset() {
        if (confirm('Réinitialiser toutes les données ?')) {
            this.data = { GH18: [], CIV10: [], CIV13: [], CIV16: [] };
            this.saveData();
            this.renderView();
        }
    }

    setupInstallPrompt() {
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.installPrompt = e;
            const installBtn = document.getElementById('installBtn');
            if (installBtn) installBtn.style.display = 'block';
        });
        const installBtn = document.getElementById('installBtn');
        if (installBtn) {
            installBtn.addEventListener('click', () => {
                if (this.installPrompt) {
                    this.installPrompt.prompt();
                    this.installPrompt.userChoice.then((choiceResult) => {
                        console.log(choiceResult.outcome === 'accepted' ? 'PWA installée' : 'Installation refusée');
                        this.installPrompt = null;
                        installBtn.style.display = 'none';
                    });
                }
            });
        }
    }
}

window.addEventListener('load', () => {
    app = new LotonuApp();
});