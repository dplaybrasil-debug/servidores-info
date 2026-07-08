// admin.js - Lógica AJAX do Painel Administrativo

document.addEventListener('DOMContentLoaded', () => {
    let categories = [];
    let apps = [];
    let activeTab = 'apps';

    // --- ELEMENTOS DO DOM ---
    const tabAppsBtn = document.getElementById('tabAppsBtn');
    const tabCategoriesBtn = document.getElementById('tabCategoriesBtn');
    const panelApps = document.getElementById('panelApps');
    const panelCategories = document.getElementById('panelCategories');

    const searchApps = document.getElementById('searchApps');
    const searchCategories = document.getElementById('searchCategories');

    const countAppsEl = document.getElementById('countApps');
    const countCategoriesEl = document.getElementById('countCategories');
    const countFeaturedEl = document.getElementById('countFeatured');

    const modalApp = document.getElementById('modalApp');
    const modalCategory = document.getElementById('modalCategory');

    // --- ALTERNÂNCIA DE ABAS ---
    const switchTab = (tab) => {
        activeTab = tab;
        tabAppsBtn.classList.toggle('active', tab === 'apps');
        tabCategoriesBtn.classList.toggle('active', tab === 'categories');
        panelApps.classList.toggle('active', tab === 'apps');
        panelCategories.classList.toggle('active', tab === 'categories');
    };

    tabAppsBtn.addEventListener('click', () => switchTab('apps'));
    tabCategoriesBtn.addEventListener('click', () => switchTab('categories'));

    // --- CARREGAMENTO DE DADOS ---
    const loadAllData = async () => {
        try {
            const resCats = await fetch('api.php?action=list_categories');
            categories = await resCats.json();

            const resApps = await fetch('api.php?action=list_apps');
            apps = await resApps.json();

            updateCounters();
            renderAppsTable();
            renderCategoriesTable();
        } catch (e) {
            console.error('Erro ao buscar dados da API:', e);
            alert('Não foi possível conectar à API. Verifique se o servidor PHP está ativo.');
        }
    };

    const updateCounters = () => {
        countAppsEl.textContent = apps.length;
        countCategoriesEl.textContent = categories.length;
        countFeaturedEl.textContent = apps.filter(a => a.is_featured == 1).length;
    };

    // --- RENDERIZAR CHECKBOXES DE CATEGORIAS NO MODAL ---
    const renderCategoryCheckboxes = (selectedIds = []) => {
        const container = document.getElementById('appCategoriesCheckboxes');
        if (!container) return;
        container.innerHTML = '';

        if (categories.length === 0) {
            container.innerHTML = '<span style="color:var(--text-muted); font-size:0.85rem; padding:0.4rem;">Nenhuma categoria cadastrada.</span>';
            return;
        }

        categories.forEach(cat => {
            const isChecked = selectedIds.map(String).includes(String(cat.id));
            const label = document.createElement('label');
            label.style.cssText = 'display:flex; align-items:center; gap:0.6rem; padding:0.35rem 0.5rem; border-radius:6px; cursor:pointer; transition:background 0.15s;';
            label.onmouseover = () => label.style.background = 'rgba(255,255,255,0.05)';
            label.onmouseout  = () => label.style.background = 'transparent';
            label.innerHTML = `
                <input type="checkbox" name="appCategoryIds" value="${cat.id}" ${isChecked ? 'checked' : ''}
                       style="width:16px; height:16px; accent-color:var(--primary); cursor:pointer;">
                <span style="font-size:0.9rem; color:var(--text);">${escapeHtml(cat.name)}</span>
            `;
            container.appendChild(label);
        });
    };

    // --- TABELA DE APLICATIVOS ---
    const renderAppsTable = () => {
        const tbody = document.getElementById('appsTableBody');
        tbody.innerHTML = '';

        const query = searchApps.value.toLowerCase().trim();
        let filtered = apps;

        if (query) {
            filtered = apps.filter(app =>
                app.name.toLowerCase().includes(query) ||
                (app.category_name || '').toLowerCase().includes(query)
            );
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);">Nenhum aplicativo cadastrado.</td></tr>`;
            return;
        }

        filtered.forEach(app => {
            const logoUrl = app.logo ? escapeHtml(app.logo) : '';
            const isFeaturedBadge = app.is_featured == 1
                ? '<span class="badge badge-warning">Sim</span>'
                : '<span class="badge badge-success" style="opacity:0.5">Não</span>';
            const statusBadge = app.status === 'active'
                ? '<span class="badge badge-success">Ativo</span>'
                : '<span class="badge badge-danger">Inativo</span>';

            // Exibe todas as categorias como tags separadas
            const categoryNames = (app.category_name || 'Geral').split(',').map(n => n.trim());
            const categoryTags = categoryNames.map(n =>
                `<span style="background:rgba(56,224,141,0.1); color:var(--primary); border:1px solid rgba(56,224,141,0.2); border-radius:50px; font-size:0.7rem; font-weight:700; padding:1px 7px;">${escapeHtml(n)}</span>`
            ).join(' ');

            tbody.innerHTML += `
                <tr>
                    <td>${app.id}</td>
                    <td class="td-app-name">
                        ${logoUrl
                            ? `<img class="table-logo" src="${logoUrl}" alt="${escapeHtml(app.name)}" referrerpolicy="no-referrer">`
                            : `<div class="table-logo" style="display:flex;align-items:center;justify-content:center;font-size:1.2rem;">🖥️</div>`}
                        <span>${escapeHtml(app.name)}</span>
                    </td>
                    <td><div style="display:flex; flex-wrap:wrap; gap:3px;">${categoryTags}</div></td>
                    <td><strong style="font-family:monospace;letter-spacing:0.05em;font-size:0.95rem;">${escapeHtml(app.downloader_code || '-')}</strong></td>
                    <td>${isFeaturedBadge}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="openEditApp(${app.id})" title="Editar">✏️</button>
                            <button class="btn-icon delete" onclick="deleteApp(${app.id})" title="Excluir">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    };

    // --- TABELA DE CATEGORIAS ---
    const renderCategoriesTable = () => {
        const tbody = document.getElementById('categoriesTableBody');
        tbody.innerHTML = '';

        const query = searchCategories.value.toLowerCase().trim();
        let filtered = categories;

        if (query) {
            filtered = categories.filter(cat => cat.name.toLowerCase().includes(query));
        }

        if (filtered.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">Nenhuma categoria cadastrada.</td></tr>`;
            return;
        }

        filtered.forEach(cat => {
            const iconUrl = cat.icon ? escapeHtml(cat.icon) : '';
            tbody.innerHTML += `
                <tr>
                    <td>${cat.id}</td>
                    <td>
                        <div style="display:flex;align-items:center;gap:0.5rem;">
                            ${iconUrl ? `<img src="${iconUrl}" style="width:24px;height:24px;object-fit:contain;" referrerpolicy="no-referrer">` : '📦'}
                            <strong>${escapeHtml(cat.name)}</strong>
                        </div>
                    </td>
                    <td><code>${escapeHtml(cat.slug)}</code></td>
                    <td>${cat.sort_order}</td>
                    <td>
                        <div class="table-actions">
                            <button class="btn-icon edit" onclick="openEditCategory(${cat.id})" title="Editar">✏️</button>
                            <button class="btn-icon delete" onclick="deleteCategory(${cat.id})" title="Excluir">🗑️</button>
                        </div>
                    </td>
                </tr>
            `;
        });
    };

    // --- EVENTOS DE PESQUISA ---
    searchApps.addEventListener('input', renderAppsTable);
    searchCategories.addEventListener('input', renderCategoriesTable);

    // --- CRUD APLICATIVOS ---
    window.openAddApp = () => {
        document.getElementById('appModalTitle').textContent = 'Cadastrar Novo Aplicativo';
        document.getElementById('appForm').reset();
        document.getElementById('appId').value = '';
        renderCategoryCheckboxes([]);
        modalApp.classList.add('active');
    };

    window.openEditApp = (id) => {
        const app = apps.find(a => a.id == id);
        if (!app) return;

        document.getElementById('appModalTitle').textContent = 'Editar Aplicativo';
        document.getElementById('appId').value = app.id;
        document.getElementById('appName').value = app.name;
        document.getElementById('appVersion').value = app.version || '';
        document.getElementById('appLogo').value = app.logo || '';
        document.getElementById('appUrl').value = app.download_url || '';
        document.getElementById('appCode').value = app.downloader_code || '';
        document.getElementById('appFeatured').checked = app.is_featured == 1;
        document.getElementById('appStatus').value = app.status;

        // Marca as checkboxes com as categorias atuais do app
        const selectedIds = (app.category_ids || '').split(',').map(s => s.trim()).filter(Boolean);
        renderCategoryCheckboxes(selectedIds);

        modalApp.classList.add('active');
    };

    window.closeAppModal = () => {
        modalApp.classList.remove('active');
    };

    document.getElementById('appForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('appId').value;

        // Coleta os IDs das checkboxes marcadas
        const checkedBoxes = document.querySelectorAll('input[name="appCategoryIds"]:checked');
        const categoryIds = Array.from(checkedBoxes).map(cb => parseInt(cb.value, 10));

        if (categoryIds.length === 0) {
            alert('Selecione pelo menos uma categoria para o aplicativo!');
            return;
        }

        const payload = {
            name: document.getElementById('appName').value,
            version: document.getElementById('appVersion').value,
            logo: document.getElementById('appLogo').value,
            download_url: document.getElementById('appUrl').value,
            downloader_code: document.getElementById('appCode').value,
            is_featured: document.getElementById('appFeatured').checked ? 1 : 0,
            status: document.getElementById('appStatus').value,
            category_ids: categoryIds
        };

        const action = id ? 'update_app' : 'create_app';
        if (id) payload.id = id;

        try {
            const res = await fetch(`api.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                closeAppModal();
                loadAllData();
            } else {
                alert('Erro ao salvar: ' + (result.error || 'Erro desconhecido'));
            }
        } catch (err) {
            console.error(err);
            alert('Erro de rede ao salvar o aplicativo.');
        }
    });

    window.deleteApp = async (id) => {
        if (!confirm('Deseja realmente excluir este aplicativo?')) return;
        try {
            const res = await fetch('api.php?action=delete_app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const result = await res.json();
            if (result.success) loadAllData();
            else alert('Erro ao excluir.');
        } catch (err) { console.error(err); }
    };

    // --- CRUD CATEGORIAS ---
    window.openAddCategory = () => {
        document.getElementById('categoryModalTitle').textContent = 'Cadastrar Nova Categoria';
        document.getElementById('categoryForm').reset();
        document.getElementById('categoryId').value = '';
        modalCategory.classList.add('active');
    };

    window.openEditCategory = (id) => {
        const cat = categories.find(c => c.id == id);
        if (!cat) return;
        document.getElementById('categoryModalTitle').textContent = 'Editar Categoria';
        document.getElementById('categoryId').value = cat.id;
        document.getElementById('categoryName').value = cat.name;
        document.getElementById('categoryIcon').value = cat.icon || '';
        document.getElementById('categoryOrder').value = cat.sort_order;
        modalCategory.classList.add('active');
    };

    window.closeCategoryModal = () => {
        modalCategory.classList.remove('active');
    };

    document.getElementById('categoryForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('categoryId').value;
        const payload = {
            name: document.getElementById('categoryName').value,
            icon: document.getElementById('categoryIcon').value,
            sort_order: parseInt(document.getElementById('categoryOrder').value, 10) || 0
        };
        const action = id ? 'update_category' : 'create_category';
        if (id) payload.id = id;

        try {
            const res = await fetch(`api.php?action=${action}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await res.json();
            if (result.success) {
                closeCategoryModal();
                loadAllData();
            } else {
                alert('Erro ao salvar categoria: ' + (result.error || 'Erro desconhecido'));
            }
        } catch (err) {
            console.error(err);
            alert('Erro de rede.');
        }
    });

    window.deleteCategory = async (id) => {
        if (!confirm('Ao excluir esta categoria, os aplicativos EXCLUSIVOS dela também serão desvinculados! Deseja continuar?')) return;
        try {
            const res = await fetch('api.php?action=delete_category', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });
            const result = await res.json();
            if (result.success) loadAllData();
            else alert('Erro ao excluir categoria.');
        } catch (err) { console.error(err); }
    };

    // --- EXPORTAR DADOS ESTÁTICOS ---
    window.exportData = async () => {
        const btn = document.getElementById('btnExport');
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '<div class="summary-icon" style="background:var(--primary-container); color:var(--primary);">⚙️</div><div class="summary-info"><h3>Exportar Dados</h3><p style="font-size:0.95rem; font-weight:700; color:var(--primary);">Exportando...</p></div>';
        btn.style.pointerEvents = 'none';

        try {
            await fetch('export_data.php');
            const alertArea = document.getElementById('alertArea');
            alertArea.innerHTML = `
                <div class="alert alert-success">
                    ✅ <strong>Sucesso!</strong> O arquivo estático <code>data.js</code> foi regenerado. Para subir online, execute:
                    <pre style="margin-top:0.5rem; background:rgba(0,0,0,0.3); padding:0.5rem; border-radius:4px; font-family:monospace; font-size:0.8rem;">git add data.js && git commit -m "update: apps atualizados" && git push origin main</pre>
                </div>`;
            alertArea.scrollIntoView({ behavior: 'smooth' });
        } catch (err) {
            alert('Erro ao exportar dados estáticos.');
        } finally {
            btn.innerHTML = originalHtml;
            btn.style.pointerEvents = 'auto';
        }
    };

    const escapeHtml = (str) => {
        return (str || '').replace(/[&<"'>]/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
        }[m]));
    };

    // --- INICIALIZAÇÃO ---
    loadAllData();
});
