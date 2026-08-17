document.addEventListener('DOMContentLoaded', () => {
    // --- NAVEGAÇÃO ENTRE PÁGINAS ---
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('data-target');
            
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            pages.forEach(page => page.classList.remove('active'));
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- CONTROLE DE MODAIS ---
    window.openModal = (id) => document.getElementById(id).classList.add('active');
    window.closeModal = (id) => {
        const modal = document.getElementById(id);
        modal.classList.remove('active');
        const form = modal.querySelector('form');
        if(form) form.reset();
    };

    // --- CARREGAMENTO DE DADOS ---
    const loadAllData = async () => {
        await loadServers();
        await loadApps();
    }    // --- LÓGICA DE SERVIDORES ---
    const loadServers = async () => {
        const res = await fetch('api.php?action=list_servers');
        const servers = await res.json();
        window.allServers = servers || [];
        window._srvActiveFilter = window._srvActiveFilter || 'all';
        document.getElementById('totalServers').innerText = window.allServers.length;
        // Debug: mostra o campo screens dos servidores no console
        console.log('[DEBUG screens]', window.allServers.map(s => ({ name: s.name, screens: s.screens, tipo: typeof s.screens })));
        updateServerFilterCounts(window.allServers);
        applyServerFilters();
        renderContentGrid(window.allServers);
    };

    const renderServersGrid = (servers) => {
        const gridSrv = document.getElementById('serversGrid');
        gridSrv.innerHTML = '';
        if (servers.length === 0) {
            gridSrv.innerHTML = '<p>Nenhum servidor encontrado.</p>';
            return;
        }

        servers.forEach(srv => {
            const badgeClass = srv.status === 'active' ? 'bg-active' : 'bg-inactive';
            const badgeText = srv.status === 'active' ? 'Ativo' : 'Inativo';
            gridSrv.innerHTML += `
                <div class="card glass-panel" onclick="editServer(${srv.id})" style="aspect-ratio: 1; padding: 0; position: relative; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Clique para editar">
                    ${srv.logo ? '<img src="' + escapeHtml(extractImageUrl(srv.logo)) + '" style="width: 100%; height: 100%; object-fit: cover;">' : '<span style="font-size: 3rem;">🖥️</span>'}
                    
                    <!-- Tarja com o Nome -->
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 6px; text-align: center; font-size: 0.85rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-top: 1px solid rgba(255,255,255,0.1);">
                        ${escapeHtml(srv.name)}
                    </div>
                    
                    <!-- Indicador de Status -->
                    <div onclick="event.stopPropagation(); toggleStatus('server', ${srv.id}, '${srv.status}')" style="position: absolute; top: 5px; right: 5px; background: ${srv.status === 'active' ? 'var(--success)' : 'var(--danger)'}; color: white; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 12px; cursor: pointer; border: 1px solid rgba(0,0,0,0.5); z-index: 2; transition: filter 0.2s;" onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'" title="Clique para alternar status">
                        ${srv.status === 'active' ? 'Ativo' : 'Inativo'}
                    </div>
                </div>
            `;
        });
    };

    const renderContentGrid = (servers) => {
        const gridContent = document.getElementById('contentGrid');
        gridContent.innerHTML = '';
        if (servers.length === 0) {
            gridContent.innerHTML = '<p>Nenhum servidor encontrado.</p>';
            updateFilterCounts([]);
            return;
        }

        // Classificar cada servidor por status de atualização
        const classified = servers.map(srv => {
            const updatedAt = srv.updated_at || srv.created_at;
            let statusKey = 'never';
            let colorHex = '#888';
            let borderColor = 'rgba(150,150,150,0.4)';
            let glowColor = 'transparent';
            let dateLabel = 'Nunca atualizado';
            let diffDays = null;

            // Se todos os conteúdos estão zerados, nunca foi atualizado de verdade
            const totalContent = Number(srv.channels || 0) + Number(srv.movies || 0) + Number(srv.series || 0);
            const hasContent = totalContent > 0;

            if (hasContent && updatedAt) {
                const updateDate = new Date(updatedAt.replace(' ', 'T') + 'Z');
                const now = new Date();
                diffDays = Math.floor(Math.abs(now - updateDate) / 86400000);
                const dateStr = updateDate.toLocaleDateString('pt-BR');
                const timeStr = updateDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
                const diasLabel = diffDays === 0 ? 'Hoje' : `Há ${diffDays}d`;
                dateLabel = `${dateStr} ${timeStr} (${diasLabel})`;

                if (diffDays > 15) {
                    statusKey = 'danger';
                    colorHex = '#e74c3c';
                    borderColor = 'rgba(231,76,60,0.7)';
                    glowColor = 'rgba(231,76,60,0.3)';
                } else if (diffDays >= 7) {
                    statusKey = 'warn';
                    colorHex = '#3498db';
                    borderColor = 'rgba(52,152,219,0.7)';
                    glowColor = 'rgba(52,152,219,0.2)';
                } else {
                    statusKey = 'ok';
                    colorHex = '#2ecc71';
                    borderColor = 'rgba(46,204,113,0.7)';
                    glowColor = 'rgba(46,204,113,0.2)';
                }
            } else if (!hasContent) {
                // Conteúdo zerado — ignorar data, forçar "Nunca"
                dateLabel = 'Conteúdo zerado';
            }
            return { srv, statusKey, colorHex, borderColor, glowColor, dateLabel, diffDays };
        });

        // Guardar para filtros
        window._contentClassified = classified;
        updateFilterCounts(classified);
        renderClassifiedCards(classified);
    };

    const renderClassifiedCards = (classified) => {
        const gridContent = document.getElementById('contentGrid');
        gridContent.innerHTML = '';

        if (classified.length === 0) {
            gridContent.innerHTML = '<p style="color:var(--text-muted); grid-column:1/-1; text-align:center; padding: 2rem;">Nenhum servidor nesta categoria.</p>';
            return;
        }

        classified.forEach(({ srv, statusKey, colorHex, borderColor, glowColor, dateLabel }) => {

            const statusEmoji = { ok: '✅', warn: '🕐', danger: '🔴', never: '⚫' }[statusKey];
            const statusLabel = { ok: 'Atualizado', warn: 'Atenção', danger: 'Atrasado', never: 'Nunca' }[statusKey];

            gridContent.innerHTML += `
                <div class="card glass-panel" data-status="${statusKey}"
                    onclick="openContentModal(${srv.id})"
                    style="aspect-ratio: 1; padding: 0; position: relative; overflow: hidden; cursor: pointer;
                           display: flex; align-items: center; justify-content: center;
                           transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
                           border: 2px solid ${borderColor};
                           box-shadow: 0 0 12px ${glowColor};"
                    onmouseover="this.style.transform='scale(1.05)'; this.style.borderColor='rgba(59,130,246,0.9)'; this.style.boxShadow='0 0 22px rgba(59,130,246,0.55)';"
                    onmouseout="this.style.transform='scale(1)'; this.style.borderColor='${borderColor}'; this.style.boxShadow='0 0 12px ${glowColor}';"
                    title="Clique para ver conteúdos de ${escapeHtml(srv.name)} — ${statusLabel}">

                    ${srv.logo
                        ? `<img src="${escapeHtml(extractImageUrl(srv.logo))}" style="width:100%; height:100%; object-fit:cover;">`
                        : `<span style="font-size:3rem;">🖥️</span>`}

                    <!-- Badge de Status (canto superior esquerdo) -->
                    <div style="position:absolute; top:5px; left:5px; font-size:0.9rem;
                                padding:2px 5px; border-radius:8px; z-index:2;
                                background:${colorHex}CC; border:1px solid ${borderColor};"
                         title="${statusLabel}">
                        ${statusEmoji}
                    </div>

                    <!-- Tarja com Nome + Acessar + Data -->
                    <div style="position:absolute; bottom:0; left:0; right:0; background:rgba(0,0,0,0.88);
                                padding:5px 6px 5px; text-align:center; border-top:2px solid ${borderColor};">
                        <div style="font-size:0.82rem; color:white; white-space:nowrap; overflow:hidden;
                                    text-overflow:ellipsis; font-weight:600;">${escapeHtml(srv.name)}</div>
                        <div style="font-size:0.68rem; color:rgba(180,180,180,0.7); margin-top:1px;
                                    letter-spacing:0.05em; text-transform:uppercase; font-weight:500;">Acessar</div>
                        <div style="font-size:0.62rem; color:${colorHex}; margin-top:2px; white-space:nowrap;
                                    overflow:hidden; text-overflow:ellipsis;">${dateLabel}</div>
                    </div>
                </div>
            `;
        });
    };

    const updateFilterCounts = (classified) => {
        const counts = { all: classified.length, ok: 0, warn: 0, danger: 0, never: 0 };
        classified.forEach(({ statusKey }) => { if (counts[statusKey] !== undefined) counts[statusKey]++; });
        ['all','ok','warn','danger','never'].forEach(k => {
            const el = document.getElementById(`cnt-${k}`);
            if (el) el.textContent = counts[k];
        });
    };

    window.filterContent = (status) => {
        // Highlight pill ativo
        ['filterAll','filterOk','filterWarn','filterDanger','filterNever'].forEach(id => {
            const btn = document.getElementById(id);
            if (btn) btn.style.outline = 'none';
        });
        const activeMap = { all:'filterAll', ok:'filterOk', warn:'filterWarn', danger:'filterDanger', never:'filterNever' };
        const activeBtn = document.getElementById(activeMap[status]);
        if (activeBtn) activeBtn.style.outline = '2px solid currentColor';

        const classified = window._contentClassified || [];
        const filtered = status === 'all' ? classified : classified.filter(c => c.statusKey === status);
        renderClassifiedCards(filtered);
    };



    // --- LÓGICA DE APPS PARCEIROS ---
    const loadApps = async () => {
        const res = await fetch('api.php?action=list_apps');
        const apps = await res.json();
        window.allApps = apps || [];
        document.getElementById('totalApps').innerText = window.allApps.length;
        renderAppsGrid(window.allApps);
    };

    const renderAppsGrid = (apps) => {
        const grid = document.getElementById('appsGrid');
        grid.innerHTML = '';
        if (apps.length === 0) {
            grid.innerHTML = '<p>Nenhum aplicativo encontrado.</p>';
            return;
        }

        apps.forEach(app => {
            const badgeClass = app.status === 'active' ? 'bg-active' : 'bg-inactive';
            const badgeText = app.status === 'active' ? 'Ativo' : 'Inativo';
            grid.innerHTML += `
                <div class="card glass-panel" onclick="editApp(${app.id})" style="aspect-ratio: 1; padding: 0; position: relative; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'" title="Clique para editar">
                    ${app.logo ? '<img src="' + escapeHtml(extractImageUrl(app.logo)) + '" style="width: 100%; height: 100%; object-fit: cover;">' : '<span style="font-size: 3rem;">📱</span>'}
                    
                    <!-- Tarja com o Nome -->
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 6px; text-align: center; font-size: 0.85rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-top: 1px solid rgba(255,255,255,0.1);">
                        ${escapeHtml(app.name)}
                    </div>
                    
                    <!-- Indicador de Status -->
                    <div onclick="event.stopPropagation(); toggleStatus('app', ${app.id}, '${app.status}')" style="position: absolute; top: 5px; right: 5px; background: ${app.status === 'active' ? 'var(--success)' : 'var(--danger)'}; color: white; font-size: 0.7rem; font-weight: bold; padding: 3px 8px; border-radius: 12px; cursor: pointer; border: 1px solid rgba(0,0,0,0.5); z-index: 2; transition: filter 0.2s;" onmouseover="this.style.filter='brightness(1.2)'" onmouseout="this.style.filter='brightness(1)'" title="Clique para alternar status">
                        ${app.status === 'active' ? 'Ativo' : 'Inativo'}
                    </div>
                </div>
            `;
        });
    };

    // --- FILTROS DE PESQUISA ---
    document.getElementById('searchServers')?.addEventListener('input', () => applyServerFilters());

    // Atualiza contadores dos pills de filtro de servidores
    const updateServerFilterCounts = (servers) => {
        const total   = servers.length;
        const screens = servers.filter(s => parseInt(s.screens, 10) >= 2).length;
        const android = servers.filter(s => (s.server_type || 'hybrid') === 'android').length;
        const el = (id) => document.getElementById(id);
        if (el('srvCnt-all'))     el('srvCnt-all').textContent     = total;
        if (el('srvCnt-screens')) el('srvCnt-screens').textContent = screens;
        if (el('srvCnt-android')) el('srvCnt-android').textContent = android;
    };

    // Aplica filtro ativo + termo de busca
    const applyServerFilters = () => {
        const term   = (document.getElementById('searchServers')?.value || '').toLowerCase();
        const filter = window._srvActiveFilter || 'all';
        let result   = window.allServers || [];

        // Filtro de tipo
        if (filter === 'screens') {
            result = result.filter(s => parseInt(s.screens, 10) >= 2);
        } else if (filter === 'android') {
            result = result.filter(s => (s.server_type || 'hybrid') === 'android');
        }

        // Filtro de texto — pesquisa nome + quantidade de telas (ex: "2 telas", "telas", "3 tela")
        if (term) result = result.filter(s => {
            const sc = parseInt(s.screens, 10) || 1;
            const telaLabel = `${sc} tela${sc >= 2 ? 's' : ''}`;
            const searchable = `${s.name} ${telaLabel}`.toLowerCase();
            return searchable.includes(term);
        });

        renderServersGrid(result);

        // Highlight do pill ativo
        const pills = {
            all:     document.getElementById('srvFilterAll'),
            screens: document.getElementById('srvFilterScreens'),
            android: document.getElementById('srvFilterAndroid'),
        };
        const outlines = {
            all:     '2px solid rgba(255,255,255,0.6)',
            screens: '2px solid #a5b4fc',
            android: '2px solid #6ee7b7',
        };
        Object.keys(pills).forEach(k => {
            if (pills[k]) pills[k].style.outline = k === filter ? outlines[k] : 'none';
        });
    };

    window.filterServers = (type) => {
        window._srvActiveFilter = type;
        applyServerFilters();
    };


    document.getElementById('searchApps')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = window.allApps.filter(a => a.name.toLowerCase().includes(term));
        renderAppsGrid(filtered);
    });

    document.getElementById('searchContent')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const filtered = window.allServers.filter(s => s.name.toLowerCase().includes(term));
        renderContentGrid(filtered);
    });

    document.getElementById('searchServerApps')?.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const labels = document.querySelectorAll('#appsChecklist label');
        labels.forEach(label => {
            const name = label.getAttribute('title').toLowerCase();
            if (name.includes(term)) {
                label.style.display = 'flex';
            } else {
                label.style.display = 'none';
            }
        });
    });

    // --- SUBMITS DE FORMS ---
    document.getElementById('formServer').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('srvId').value;
        const action = id ? 'update_server' : 'create_server';
        const payload = {
            name: document.getElementById('srvName').value,
            url: document.getElementById('srvUrl').value,
            logo: document.getElementById('srvLogo').value,
            table_image_url: document.getElementById('srvTableImg').value,
            panel_url: document.getElementById('srvPanelUrl').value,
            app_store_url: document.getElementById('srvAppStoreUrl').value,
            status: document.getElementById('srvStatus').value,
            screens: document.getElementById('srvScreens').value,
            server_type: document.getElementById('srvType').value,
            description: document.getElementById('srvDesc').value
        };
        if (id) payload.id = id;

        await postData(`api.php?action=${action}`, payload);
        closeModal('modalServer');
        loadServers();
    });

    document.getElementById('formApp').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('appId') ? document.getElementById('appId').value : null;
        const action = id ? 'update_app' : 'create_app';
        const payload = {
            name: document.getElementById('appName').value,
            url: document.getElementById('appUrl').value,
            logo: document.getElementById('appLogo').value,
            status: document.getElementById('appStatus').value
        };
        if(id) payload.id = id;

        await postData(`api.php?action=${action}`, payload);
        closeModal('modalApp');
        loadApps();
    });

    document.getElementById('formContent').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cleanNumber = (val) => val ? val.replace(/\D/g, '') : '0';
        
        await postData('api.php?action=update_content', {
            id: document.getElementById('contentSrvId').value,
            movies: cleanNumber(document.getElementById('cMovies').value),
            series: cleanNumber(document.getElementById('cSeries').value),
            channels: cleanNumber(document.getElementById('cChannels').value)
        });
        closeModal('modalContent');
        loadServers(); // Recarrega para atualizar os cards de conteúdo
    });

    // --- FUNÇÕES AUXILIARES ---
    window.openNewServerModal = () => {
        document.getElementById('formServer').reset();
        document.getElementById('srvId').value = '';
        document.querySelector('#modalServer h2').textContent = 'Adicionar Servidor';
        document.getElementById('srvPanelUrl').value = '';
        document.getElementById('srvAppStoreUrl').value = '';
        document.getElementById('btnDeleteServer').style.display = 'none';
        document.getElementById('btnManageApps').style.display = 'none';
        openModal('modalServer');
    };

    window.editServer = (id) => {
        const srv = window.allServers.find(s => s.id == id);
        if(!srv) return;
        document.getElementById('srvId').value = srv.id;
        document.getElementById('srvName').value = srv.name;
        document.getElementById('srvUrl').value = srv.url;
        document.getElementById('srvLogo').value = srv.logo || '';
        document.getElementById('srvTableImg').value = srv.table_image_url || '';
        document.getElementById('srvPanelUrl').value = srv.panel_url || '';
        document.getElementById('srvAppStoreUrl').value = srv.app_store_url || '';
        document.getElementById('srvStatus').value = srv.status;
        document.getElementById('srvScreens').value = srv.screens || 1;
        document.getElementById('srvType').value = srv.server_type || 'hybrid';
        document.getElementById('srvDesc').value = srv.description || '';
        document.querySelector('#modalServer h2').textContent = 'Editar Servidor';
        document.getElementById('btnDeleteServer').style.display = 'block';
        document.getElementById('btnManageApps').style.display = 'inline-block';
        openModal('modalServer');
    };

    // --- PLANOS DO SERVIDOR ---
    window.openManagePlans = () => {
        const srvId = document.getElementById('srvId').value;
        const srvName = document.getElementById('srvName').value;
        if(!srvId) return;
        document.getElementById('plansServerName').innerText = srvName;
        loadPlans(srvId);
        openModal('modalPlans');
    };

    const loadPlans = async (serverId) => {
        const tbody = document.getElementById('plansTableBody');
        tbody.innerHTML = '<tr><td colspan="4">Carregando...</td></tr>';
        
        const res = await fetch(`api.php?action=list_plans&server_id=${serverId}`);
        const plans = await res.json();
        
        tbody.innerHTML = '';
        if(plans.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:1rem; opacity:0.6;">Nenhum plano cadastrado.</td></tr>';
            return;
        }

        plans.forEach(plan => {
            tbody.innerHTML += `
                <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <td style="padding: 0.5rem;">${escapeHtml(plan.name)}</td>
                    <td style="padding: 0.5rem; font-weight: bold; color: var(--primary);">${escapeHtml(plan.price)}</td>
                    <td style="padding: 0.5rem;"><button type="button" class="btn-icon" style="color:var(--danger);" onclick="deletePlan(${plan.id}, ${serverId})">✕</button></td>
                </tr>
            `;
        });
    };

    document.getElementById('formAddPlan').addEventListener('submit', async (e) => {
        e.preventDefault();
        const serverId = document.getElementById('srvId').value;
        
        const min = document.getElementById('planMin').value;
        const max = document.getElementById('planMax').value;
        const nameFormatted = `${min} a ${max}`;

        const rawPrice = parseFloat(document.getElementById('planPrice').value);
        const priceFormatted = rawPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

        const data = {
            server_id: serverId,
            name: nameFormatted,
            screens: '-', // Campo não mais utilizado para o formato revenda
            price: priceFormatted
        };
        await fetch('api.php?action=create_plan', {
            method: 'POST', body: JSON.stringify(data)
        });
        document.getElementById('formAddPlan').reset();
        loadPlans(serverId);
    });

    window.deletePlan = async (planId, serverId) => {
        if(confirm('Excluir este plano?')) {
            await fetch('api.php?action=delete_plan', {
                method: 'POST', body: JSON.stringify({id: planId})
            });
            loadPlans(serverId);
        }
    };

    // --- VINCULAR APPS ---
    window.openManageApps = async () => {
        const srvId = document.getElementById('srvId').value;
        const srvName = document.getElementById('srvName').value;
        if(!srvId) return;
        
        document.getElementById('appsServerName').innerText = srvName;
        document.getElementById('searchServerApps').value = ''; // Limpa a pesquisa
        const container = document.getElementById('appsChecklist');
        container.innerHTML = '<p style="color: white; opacity: 0.5;">Carregando aplicativos...</p>';
        openModal('modalServerApps');

        // Buscar apps vinculados atualmente
        const res = await fetch(`api.php?action=get_server_apps&server_id=${srvId}`);
        const linkedAppIds = await res.json(); // array de strings/ints

        container.innerHTML = '';
        if(window.allApps.length === 0) {
            container.innerHTML = '<p style="color: white; opacity: 0.5;">Nenhum aplicativo parceiro cadastrado no sistema.</p>';
            return;
        }

        window.allApps.forEach(app => {
            const isChecked = linkedAppIds.includes(String(app.id)) || linkedAppIds.includes(Number(app.id));
            const appLogoUrl = app.logo ? extractImageUrl(app.logo) : '';
            const logoHtml = appLogoUrl 
                ? `<img src="${escapeHtml(appLogoUrl)}" style="width: 50px; height: 50px; border-radius: 12px; object-fit: cover;">` 
                : `<div style="width: 50px; height: 50px; border-radius: 12px; background: rgba(255,255,255,0.1); display: flex; align-items: center; justify-content: center; font-size: 1.5rem;">📱</div>`;

            // A lógica de clique altera os estilos visuais da thumbnail dinamicamente
            const activeStyle = `border-color: var(--primary); background: rgba(220, 20, 60, 0.2); opacity: 1; transform: scale(1.05);`;
            const inactiveStyle = `border-color: transparent; background: transparent; opacity: 0.4; transform: scale(1);`;

            container.innerHTML += `
                <label style="display: flex; flex-direction: column; align-items: center; gap: 0.5rem; cursor: pointer; color: white; text-align: center; position: relative;" title="${escapeHtml(app.name)}">
                    <input type="checkbox" name="linked_apps" value="${app.id}" ${isChecked ? 'checked' : ''} style="display: none;" 
                           onchange="const div = this.nextElementSibling; if(this.checked) { div.style.cssText = 'transition: all 0.2s; border: 2px solid; border-radius: 14px; padding: 4px; ${activeStyle}'; } else { div.style.cssText = 'transition: all 0.2s; border: 2px solid; border-radius: 14px; padding: 4px; ${inactiveStyle}'; }">
                    <div style="transition: all 0.2s; border: 2px solid; border-radius: 14px; padding: 4px; ${isChecked ? activeStyle : inactiveStyle}">
                        ${logoHtml}
                    </div>
                    <span style="font-size: 0.75rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${escapeHtml(app.name)}</span>
                </label>
            `;
        });
    };

    document.getElementById('formServerApps').addEventListener('submit', async (e) => {
        e.preventDefault();
        const serverId = document.getElementById('srvId').value;
        const checkboxes = document.querySelectorAll('input[name="linked_apps"]:checked');
        const appIds = Array.from(checkboxes).map(cb => cb.value);

        await fetch('api.php?action=update_server_apps', {
            method: 'POST', 
            body: JSON.stringify({ server_id: serverId, app_ids: appIds })
        });
        
        closeModal('modalServerApps');
        alert('Apps vinculados com sucesso!');
    });

    window.openNewAppModal = () => {
        document.getElementById('formApp').reset();
        if(document.getElementById('appId')) document.getElementById('appId').value = '';
        document.querySelector('#modalApp h2').textContent = 'Adicionar App Parceiro';
        document.getElementById('btnDeleteApp').style.display = 'none';
        openModal('modalApp');
    };

    window.editApp = (id) => {
        const app = window.allApps.find(a => a.id == id);
        if(!app) return;
        if(!document.getElementById('appId')) {
            const hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.id = 'appId';
            document.getElementById('formApp').prepend(hidden);
        }
        document.getElementById('appId').value = app.id;
        document.getElementById('appName').value = app.name;
        document.getElementById('appUrl').value = app.url;
        document.getElementById('appLogo').value = app.logo || '';
        document.getElementById('appStatus').value = app.status;
        document.querySelector('#modalApp h2').textContent = 'Editar App Parceiro';
        document.getElementById('btnDeleteApp').style.display = 'block';
        openModal('modalApp');
    };

    window.openContentModal = (id) => {
        const srv = window.allServers.find(s => s.id == id);
        if (!srv) return;

        // Sempre abre em modo VISUALIZAÇÃO
        document.getElementById('contentViewMode').style.display = 'block';
        document.getElementById('contentEditMode').style.display = 'none';

        document.getElementById('contentSrvId').value = srv.id;
        document.getElementById('contentTitle').textContent = srv.name;
        
        // Logo
        const logoEl = document.getElementById('contentSrvLogo');
        if (logoEl) {
            if (srv.logo) {
                logoEl.src = extractImageUrl(srv.logo);
                logoEl.style.display = 'block';
            } else {
                logoEl.style.display = 'none';
            }
        }

        // Valores de visualização
        document.getElementById('viewMovies').textContent  = Number(srv.movies  || 0).toLocaleString('pt-BR');
        document.getElementById('viewSeries').textContent  = Number(srv.series  || 0).toLocaleString('pt-BR');
        document.getElementById('viewChannels').textContent = Number(srv.channels || 0).toLocaleString('pt-BR');

        // Badge de data
        const badge = document.getElementById('viewUpdateBadge');
        const updatedAt = srv.updated_at || srv.created_at;
        if (updatedAt) {
            const d = new Date(updatedAt.replace(' ', 'T') + 'Z');
            const diffDays = Math.floor(Math.abs(new Date() - d) / 86400000);
            let colorHex = diffDays > 15 ? '#e74c3c' : diffDays >= 7 ? '#3498db' : '#2ecc71';
            const dateStr = d.toLocaleDateString('pt-BR');
            const timeStr = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            const diasText = diffDays === 0 ? 'Hoje' : `Há ${diffDays} dia(s)`;
            badge.innerHTML = `Última atualização: <strong style="color:${colorHex}">${dateStr} às ${timeStr} (${diasText})</strong>`;
            badge.style.borderColor = colorHex + '55';
            badge.style.display = 'block';
        } else {
            badge.textContent = 'Sem registro de atualização';
            badge.style.display = 'block';
        }

        // Valores para o formulário de edição
        document.getElementById('cMovies').value   = srv.movies   ? Number(srv.movies).toLocaleString('pt-BR')   : '0';
        document.getElementById('cSeries').value   = srv.series   ? Number(srv.series).toLocaleString('pt-BR')   : '0';
        document.getElementById('cChannels').value = srv.channels ? Number(srv.channels).toLocaleString('pt-BR') : '0';

        openModal('modalContent');
    };

    window.enableContentEdit = () => {
        document.getElementById('contentViewMode').style.display = 'none';
        document.getElementById('contentEditMode').style.display = 'block';
    };

    window.disableContentEdit = () => {
        document.getElementById('contentEditMode').style.display = 'none';
        document.getElementById('contentViewMode').style.display = 'block';
    };

    // Formatação de números ao digitar (Adiciona pontuação . )
    const formatNumberInput = (e) => {
        let val = e.target.value.replace(/\D/g, ''); // Remove tudo que não for número
        if (val === '') {
            e.target.value = '';
            return;
        }
        e.target.value = Number(val).toLocaleString('pt-BR');
    };

    document.getElementById('cMovies')?.addEventListener('input', formatNumberInput);
    document.getElementById('cSeries')?.addEventListener('input', formatNumberInput);
    document.getElementById('cChannels')?.addEventListener('input', formatNumberInput);

    window.deleteItem = async (type, id) => {
        if(confirm('Tem certeza que deseja remover este item permanentemente?')) {
            const action = type === 'server' ? 'delete_server' : 'delete_app';
            await postData(`api.php?action=${action}`, { id });
            if(type === 'server') {
                closeModal('modalServer');
                loadServers(); 
            } else {
                closeModal('modalApp');
                loadApps();
            }
        }
    };

    window.deleteCurrent = (type) => {
        const idStr = type === 'server' ? document.getElementById('srvId').value : document.getElementById('appId').value;
        if(idStr) deleteItem(type, parseInt(idStr));
    };

    window.toggleStatus = async (type, id, currentStatus) => {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        const action = type === 'server' ? 'toggle_server_status' : 'toggle_app_status';
        await postData(`api.php?action=${action}`, { id, status: newStatus });
        if(type === 'server') loadServers(); else loadApps();
    };

    const postData = async (url, data) => {
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return await res.json();
        } catch(e) { console.error('Erro na requisição', e); }
    };

    const escapeHtml = (str) => {
        return (str || '').replace(/[&<"'>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    };

    const extractImageUrl = (str) => {
        if (!str) return '';
        return str.replace(/\[\/?\bimg\b\]/gi, '').trim();
    };

    // --- LÓGICA DE CONTATOS DE APOIO ---
    const contactTypeConfig = {
        whatsapp:  { label: 'WhatsApp',  emoji: '📱', color: '#25D366', placeholder: 'https://wa.me/5511999999999' },
        telegram:  { label: 'Telegram',  emoji: '✈️', color: '#2AABEE', placeholder: 'https://t.me/seucanal' },
        email:     { label: 'E-mail',    emoji: '📧', color: '#EA4335', placeholder: 'suporte@email.com' },
        phone:     { label: 'Telefone',  emoji: '📞', color: '#8b5cf6', placeholder: '(11) 99999-9999' },
        instagram: { label: 'Instagram', emoji: '📸', color: '#E1306C', placeholder: 'https://instagram.com/perfil' },
        youtube:   { label: 'YouTube',   emoji: '▶️', color: '#FF0000', placeholder: 'https://youtube.com/@canal' },
        site:      { label: 'Site',      emoji: '🌐', color: '#3b82f6', placeholder: 'https://seusite.com.br' },
        other:     { label: 'Outro',     emoji: '💬', color: '#94a3b8', placeholder: 'Link ou informação de contato' },
    };

    const loadContacts = async () => {
        const res = await fetch('api.php?action=list_contacts&active_only=0');
        const contacts = await res.json();
        window.allContacts = contacts || [];
        document.getElementById('totalContacts').innerText = contacts.length;
        renderContactsList(contacts);
    };

    const renderContactsList = (contacts) => {
        const list = document.getElementById('contactsList');
        list.innerHTML = '';
        if (contacts.length === 0) {
            list.innerHTML = '<p style="color:var(--text-muted); padding:1rem;">Nenhum contato cadastrado. Clique em "+ Novo Contato" para adicionar.</p>';
            return;
        }
        contacts.forEach(ct => {
            const cfg = contactTypeConfig[ct.type] || contactTypeConfig.other;
            list.innerHTML += `
                <div class="glass-panel" style="display:flex; align-items:center; gap:1rem; padding:1rem 1.25rem;
                     border-left:4px solid ${cfg.color}; border-radius:12px;">
                    <div style="font-size:1.8rem; min-width:40px; text-align:center;">${cfg.emoji}</div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:700; font-size:0.95rem; color:white;">${escapeHtml(ct.name)}</div>
                        <div style="font-size:0.8rem; color:${cfg.color}; margin-top:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                            ${escapeHtml(ct.value)}
                        </div>
                        ${ct.description ? `<div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${escapeHtml(ct.description)}</div>` : ''}
                    </div>
                    <div style="display:flex; align-items:center; gap:0.5rem; flex-shrink:0;">
                        <span style="padding:2px 10px; border-radius:10px; font-size:0.75rem; font-weight:600;
                                     background:${ct.active == 1 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)'};
                                     color:${ct.active == 1 ? 'var(--success)' : 'var(--danger)'};">
                            ${ct.active == 1 ? 'Ativo' : 'Inativo'}
                        </span>
                        <button class="btn-icon" onclick="editContact(${ct.id})" title="Editar">✏️</button>
                    </div>
                </div>`;
        });
    };

    window.openNewContactModal = () => {
        document.getElementById('contactModalTitle').textContent = 'Novo Contato';
        document.getElementById('ctId').value = '';
        document.getElementById('ctType').value = 'whatsapp';
        document.getElementById('ctName').value = '';
        document.getElementById('ctValue').value = '';
        document.getElementById('ctDesc').value = '';
        document.getElementById('ctOrder').value = '0';
        document.getElementById('btnDeleteContact').style.display = 'none';
        updateContactPlaceholder();
        document.getElementById('modalContact').classList.add('active');
    };

    window.editContact = (id) => {
        const ct = window.allContacts.find(c => c.id == id);
        if (!ct) return;
        document.getElementById('contactModalTitle').textContent = 'Editar Contato';
        document.getElementById('ctId').value = ct.id;
        document.getElementById('ctType').value = ct.type;
        document.getElementById('ctName').value = ct.name;
        document.getElementById('ctValue').value = ct.value;
        document.getElementById('ctDesc').value = ct.description || '';
        document.getElementById('ctOrder').value = ct.sort_order || 0;
        document.getElementById('btnDeleteContact').style.display = 'inline-block';
        updateContactPlaceholder();
        document.getElementById('modalContact').classList.add('active');
    };

    window.deleteCurrentContact = async () => {
        const id = document.getElementById('ctId').value;
        if (!id || !confirm('Excluir este contato?')) return;
        await postData('api.php?action=delete_contact', { id });
        closeModal('modalContact');
        loadContacts();
    };

    window.updateContactPlaceholder = () => {
        const type = document.getElementById('ctType').value;
        const cfg = contactTypeConfig[type] || contactTypeConfig.other;
        document.getElementById('ctValue').placeholder = cfg.placeholder;
    };

    document.getElementById('formContact').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('ctId').value;
        const payload = {
            name:        document.getElementById('ctName').value,
            type:        document.getElementById('ctType').value,
            value:       document.getElementById('ctValue').value,
            description: document.getElementById('ctDesc').value,
            sort_order:  document.getElementById('ctOrder').value,
        };
        if (id) {
            payload.id = id;
            await postData('api.php?action=update_contact', payload);
        } else {
            await postData('api.php?action=create_contact', payload);
        }
        closeModal('modalContact');
        loadContacts();
    });

    // Iniciar
    loadAllData();
    loadContacts();

    // --- BOTÃO × NOS CAMPOS DE PESQUISA ---
    const addClearBtn = (inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        // Cria wrapper relativo em volta do input
        const wrapper = document.createElement('div');
        wrapper.style.cssText = `position:relative; display:inline-flex; align-items:center; width:${input.style.width || '100%'}; max-width:${input.style.maxWidth || 'none'};`;
        if (input.style.maxWidth) { wrapper.style.maxWidth = input.style.maxWidth; input.style.maxWidth = ''; }
        input.style.width = '100%';
        input.style.paddingRight = '2rem';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        // Cria botão ×
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '×';
        btn.title = 'Limpar pesquisa';
        btn.style.cssText = [
            'position:absolute', 'right:9px', 'top:50%', 'transform:translateY(-50%)',
            'background:none', 'border:none', 'cursor:pointer',
            'color:rgba(255,255,255,0.4)', 'font-size:1.25rem', 'line-height:1',
            'padding:0 2px', 'display:none', 'transition:color 0.2s', 'z-index:5'
        ].join(';');
        btn.onmouseover = () => btn.style.color = 'rgba(255,255,255,0.9)';
        btn.onmouseout  = () => btn.style.color = 'rgba(255,255,255,0.4)';
        btn.onclick = () => {
            input.value = '';
            btn.style.display = 'none';
            input.dispatchEvent(new Event('input'));
            input.focus();
        };
        wrapper.appendChild(btn);

        // Exibe/oculta × conforme o usuário digita
        input.addEventListener('input', () => {
            btn.style.display = input.value.length > 0 ? 'block' : 'none';
        });
    };

    addClearBtn('searchServers');
    addClearBtn('searchApps');
    addClearBtn('searchContent');
});
