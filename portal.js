document.addEventListener('DOMContentLoaded', () => {
    let activeServers = [];
    let activeApps = [];
    let currentTab = 'servers';

    // Mapa de hash <-> tab interna (para roteamento por URL)
    const hashToTab = { '#servidores': 'servers', '#apps': 'apps', '#apoio': 'support' };
    const tabToHash = { 'servers': '#servidores', 'apps': '#apps', 'support': '#apoio' };

    // --- FUNÇÕES DE LIMPEZA E FORMATAÇÃO ---
    const escapeHtml = (str) => {
        return (str || '').replace(/[&<"'>]/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m]));
    };

    const extractImageUrl = (str) => {
        if (!str) return '';
        return str.replace(/\[\/?img\]/gi, '').trim();
    };

    // --- CARREGAMENTO DE DADOS ---
    const loadAllData = async () => {
        try {
            // Tenta usar a API PHP (servidor local)
            const resSrv = await fetch('api.php?action=list_servers');
            if (!resSrv.ok) throw new Error('API indisponível');
            const servers = await resSrv.json();
            activeServers = servers.filter(s => s.status === 'active');
            
            // Carrega Apps
            const resApp = await fetch('api.php?action=list_apps');
            const apps = await resApp.json();
            activeApps = apps.filter(a => a.status === 'active');

            // Atualiza Contadores nas Abas
            document.getElementById('btnServidores').innerText = `Servidores (${activeServers.length})`;
            document.getElementById('btnApps').innerText = `Apps Parceiros (${activeApps.length})`;

            // Atualiza contadores dos pills
            updatePublicFilterCounts();

            renderServers(activeServers);
            renderApps(activeApps);

            // Verifica a aba via hash na URL (ex: #servidores, #apps, #apoio)
            const initialHash = window.location.hash;
            const initialTab = hashToTab[initialHash];
            if (initialTab) {
                switchTab(initialTab, false);
            } else {
                // Compatibilidade: verifica query string antiga
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('tab') === 'support' || urlParams.get('page') === 'support') {
                    switchTab('support');
                }
            }
        } catch(e) {
            // --- FALLBACK: Dados estáticos (GitHub Pages) ---
            console.warn('API indisponível, usando dados estáticos (data.js)', e);
            if (window.STATIC_DATA) {
                activeServers = (window.STATIC_DATA.servers || []).filter(s => s.status === 'active');
                activeApps    = (window.STATIC_DATA.apps    || []).filter(a => a.status === 'active');

                document.getElementById('btnServidores').innerText = `Servidores (${activeServers.length})`;
                document.getElementById('btnApps').innerText = `Apps Parceiros (${activeApps.length})`;

                updatePublicFilterCounts();
                renderServers(activeServers);
                renderApps(activeApps);

                // Verifica a aba via hash na URL
                const initialHashFb = window.location.hash;
                const initialTabFb = hashToTab[initialHashFb];
                if (initialTabFb) {
                    switchTab(initialTabFb, false);
                } else {
                    const urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.get('tab') === 'support' || urlParams.get('page') === 'support') {
                        switchTab('support');
                    }
                }
                return; // Sucesso com dados estáticos
            }
            // Nenhum dado disponível
            console.error('Nenhum dado disponível:', e);
            const errorHtml = '<div style="color: var(--danger); text-align: center; width: 100%; grid-column: 1 / -1; padding: 2rem; background: rgba(0,0,0,0.5); border-radius: 12px;"><h3>Erro de Conexão</h3><p>As informações não puderam ser carregadas.</p><p>Se você abriu este arquivo dando dois cliques (file:///), ele não vai funcionar. Você precisa acessar pelo endereço: <b>http://localhost:8000/index.html</b></p><p style="font-size:0.8rem; margin-top:1rem; opacity:0.7;">Detalhe técnico: ' + e.message + '</p></div>';
            document.getElementById('publicServersGrid').innerHTML = errorHtml;
            document.getElementById('publicAppsGrid').innerHTML = errorHtml;
        }
    };

    // --- RENDERIZAÇÃO ---
    const renderServers = (serversList) => {
        const grid = document.getElementById('publicServersGrid');
        grid.innerHTML = '';
        if(serversList.length === 0) {
            grid.innerHTML = '<p style="color: white;">Nenhum servidor disponível no momento.</p>';
            return;
        }

        // Configurações de tipo de servidor
        const typeConfig = {
            hybrid:  { label: 'Híbrido',  emoji: '🔀', color: 'rgba(251,191,36,0.92)',  border: 'rgba(251,191,36,0.6)' },
            iptv:    { label: 'IPTV',     emoji: '📡', color: 'rgba(99,102,241,0.92)',  border: 'rgba(99,102,241,0.6)' },
            android: { label: 'Android',  emoji: '🤖', color: 'rgba(52,211,153,0.92)',  border: 'rgba(52,211,153,0.6)' },
        };

        serversList.forEach(srv => {
            const logoUrl = extractImageUrl(srv.logo);
            const screens = parseInt(srv.screens, 10) || 1;
            const screensBadge = screens >= 2
                ? `<div style="position:absolute; top:7px; right:7px; background:rgba(59,130,246,0.92);
                              color:white; font-size:0.65rem; font-weight:700; padding:2px 7px;
                              border-radius:10px; z-index:2; backdrop-filter:blur(4px);
                              border:1px solid rgba(255,255,255,0.25);">
                       📺 ${screens} telas
                   </div>`
                : '';

            const srvType = srv.server_type || 'hybrid';
            const tc = typeConfig[srvType] || typeConfig.hybrid;
            const typeBadge = `<div style="position:absolute; top:7px; left:7px; background:${tc.color};
                              color:white; font-size:0.65rem; font-weight:700; padding:2px 7px;
                              border-radius:10px; z-index:2; backdrop-filter:blur(4px);
                              border:1px solid rgba(255,255,255,0.25);">
                       ${tc.emoji} ${tc.label}
                   </div>`;

            const desc = (srv.description || '').trim();

            grid.innerHTML += `
                <div style="border-radius:14px; overflow:hidden; cursor:pointer;
                             background:rgba(20,25,40,0.85); border:2px solid rgba(255,255,255,0.07);
                             box-shadow:0 4px 15px rgba(0,0,0,0.4);
                             transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s;
                             display:flex; flex-direction:column;"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='${tc.border}'; this.style.boxShadow='0 8px 28px rgba(59,130,246,0.35)';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.07)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.4)';"
                     onclick="window.location.href='server.html?id=${srv.id}'">

                    <!-- Imagem / Logo -->
                    <div style="position:relative; width:100%; height:130px; overflow:hidden; background:#0d1117; flex-shrink:0;">
                        ${logoUrl
                            ? `<img src="${escapeHtml(logoUrl)}" style="width:100%; height:100%; object-fit:cover; display:block;">`
                            : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:3rem;">🖥️</div>`}
                        ${typeBadge}
                        ${screensBadge}
                    </div>

                    <!-- Info Panel -->
                    <div style="padding:10px 12px 11px; display:flex; flex-direction:column; gap:4px; flex:1;">
                        <div style="font-size:0.88rem; color:white; font-weight:700;
                                    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
                             title="${escapeHtml(srv.name)}">
                            ${escapeHtml(srv.name)}
                        </div>
                        ${desc ? `<div style="font-size:0.75rem; color:rgba(160,170,190,0.85); line-height:1.35;
                                              overflow:hidden; display:-webkit-box; -webkit-line-clamp:2;
                                              -webkit-box-orient:vertical;">${escapeHtml(desc)}</div>` : ''}
                        <a href="server.html?id=${srv.id}"
                           onclick="event.stopPropagation();"
                           style="display:inline-flex; align-items:center; gap:4px; margin-top:4px;
                                  font-size:0.75rem; color:rgba(96,165,250,0.9); text-decoration:none;
                                  font-weight:600; transition:color 0.2s;"
                           onmouseover="this.style.color='rgb(147,197,253)'"
                           onmouseout="this.style.color='rgba(96,165,250,0.9)'">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Acessar
                        </a>
                    </div>
                </div>
            `;
        });
    };

    const renderApps = (appsList) => {
        const grid = document.getElementById('publicAppsGrid');
        grid.innerHTML = '';
        if(appsList.length === 0) {
            grid.innerHTML = '<p style="color: white;">Nenhum aplicativo disponível no momento.</p>';
            return;
        }

        appsList.forEach(app => {
            const logoUrl = extractImageUrl(app.logo);

            grid.innerHTML += `
                <div class="card glass-panel" onclick="openAppInfo(${app.id})" style="aspect-ratio: 1; padding: 0; position: relative; overflow: hidden; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                    ${logoUrl ? '<img src="' + escapeHtml(logoUrl) + '" style="width: 100%; height: 100%; object-fit: cover;">' : '<span style="font-size: 3rem;">📱</span>'}
                    
                    <!-- Tarja com o Nome -->
                    <div style="position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.8); padding: 6px; text-align: center; font-size: 0.85rem; color: white; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-top: 1px solid rgba(255,255,255,0.1);">
                        ${escapeHtml(app.name)}
                    </div>
                </div>
            `;
        });
    };

    // --- HELPER DE CLIQUES ---
    window.openServerInfo = (id) => {
        window.location.href = `server.html?id=${id}`;
    };

    window.openAppInfo = async (id) => {
        const app = activeApps.find(a => a.id == id);
        if(!app) return;
        
        try {
            const res = await fetch(`api.php?action=get_app_details&id=${id}`);
            if (!res.ok) throw new Error('API indisponível');
            const data = await res.json();
            
            openInfoModal('app', data.name, extractImageUrl(data.logo), data.url, '', 0, 0, 0, data.linked_servers || []);
        } catch(e) {
            // --- FALLBACK: Dados estáticos (GitHub Pages) ---
            console.warn('API indisponível para app, usando dados estáticos', e);
            let linked_servers = [];
            if (window.STATIC_DATA && window.STATIC_DATA.server_apps) {
                const serverIds = window.STATIC_DATA.server_apps
                    .filter(sa => String(sa.app_id) === String(id))
                    .map(sa => sa.server_id);
                linked_servers = (window.STATIC_DATA.servers || [])
                    .filter(s => serverIds.includes(s.id) && s.status === 'active')
                    .map(s => ({ id: s.id, name: s.name, logo: s.logo }));
            }
            openInfoModal('app', app.name, extractImageUrl(app.logo), app.url, '', 0, 0, 0, linked_servers);
        }
    };

    // --- MODAL DE INFORMAÇÕES ---
    window.openInfoModal = (type, name, logo, url, desc, movies, series, channels, linked_items = []) => {
        document.getElementById('infoTitle').textContent = name;
        
        // Logo
        const img = document.getElementById('infoLogo');
        if(logo) {
            img.src = logo;
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
            img.src = '';
        }

        // Descrição
        const descEl = document.getElementById('infoDesc');
        if(desc && desc.trim() !== 'undefined' && desc.trim() !== '') {
            descEl.textContent = desc;
            descEl.style.display = 'block';
        } else {
            descEl.style.display = 'none';
        }

        // Estatísticas (só para Servidores)
        const statsEl = document.getElementById('infoStatsContainer');
        if(type === 'server') {
            document.getElementById('infoMovies').textContent = movies;
            document.getElementById('infoSeries').textContent = series;
            document.getElementById('infoChannels').textContent = channels;
            statsEl.style.display = 'flex';
        } else {
            statsEl.style.display = 'none';
        }

        // Itens Vinculados (Servidores Compatíveis)
        const linkedContainer = document.getElementById('infoLinkedContainer');
        const linkedGrid = document.getElementById('infoLinkedGrid');
        
        if (type === 'app' && linked_items && linked_items.length > 0) {
            linkedGrid.innerHTML = '';
            document.getElementById('infoLinkedTitle').innerHTML = `Servidores Parceiros Compatíveis <span style="background: var(--primary); color: white; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem; font-weight: bold; vertical-align: middle; margin-left: 0.5rem; box-shadow: 0 2px 5px rgba(59, 130, 246, 0.4);">${linked_items.length}</span>`;
            linked_items.forEach(item => {
                const itemLogo = extractImageUrl(item.logo);
                linkedGrid.innerHTML += `
                <div style="border-radius:14px; overflow:hidden; cursor:pointer; text-align: left;
                             background:rgba(20,25,40,0.85); border:2px solid rgba(255,255,255,0.07);
                             box-shadow:0 4px 15px rgba(0,0,0,0.4);
                             transition:transform 0.2s, box-shadow 0.2s, border-color 0.2s;
                             display:flex; flex-direction:column;"
                     onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='rgba(59,130,246,0.8)'; this.style.boxShadow='0 8px 28px rgba(59,130,246,0.35)';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.07)'; this.style.boxShadow='0 4px 15px rgba(0,0,0,0.4)';"
                     onclick="openServerInfo(${item.id})">

                    <!-- Imagem / Logo -->
                    <div style="position:relative; width:100%; height:130px; overflow:hidden; background:#0d1117; flex-shrink:0;">
                        ${itemLogo
                            ? `<img src="${escapeHtml(itemLogo)}" style="width:100%; height:100%; object-fit:cover; display:block;">`
                            : `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; font-size:3rem;">🖥️</div>`}
                    </div>

                    <!-- Info Panel -->
                    <div style="padding:10px 12px 11px; display:flex; flex-direction:column; gap:4px; flex:1;">
                        <div style="font-size:0.88rem; color:white; font-weight:700;
                                    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;"
                             title="${escapeHtml(item.name)}">
                            ${escapeHtml(item.name)}
                        </div>
                        <div style="display:inline-flex; align-items:center; gap:4px; margin-top:4px;
                                   font-size:0.75rem; color:rgba(96,165,250,0.9); font-weight:600;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            Acessar
                        </div>
                    </div>
                </div>
                `;
            });
            linkedContainer.style.display = 'block';
        } else {
            linkedContainer.style.display = 'none';
        }

        // Botão de Acesso
        const btnLink = document.getElementById('infoLink');
        const noLinkMsg = document.getElementById('noLinkMsg');
        
        if(url && url.trim() !== 'undefined' && url.trim() !== '') {
            let finalUrl = url;
            if(!finalUrl.startsWith('http')) {
                finalUrl = 'http://' + finalUrl;
            }
            btnLink.href = finalUrl;
            btnLink.style.display = 'inline-block';
            noLinkMsg.style.display = 'none';
        } else {
            btnLink.style.display = 'none';
            noLinkMsg.style.display = 'block';
        }

        document.getElementById('modalInfo').classList.add('active');
    };

    window.closeModal = (id) => {
        document.getElementById(id).classList.remove('active');
    };

    // --- NAVEGAÇÃO DE ABAS ---

    window.switchTab = (tab, updateHash = true) => {
        currentTab = tab;
        document.getElementById('btnServidores').classList.toggle('active', tab === 'servers');
        document.getElementById('btnApps').classList.toggle('active', tab === 'apps');
        document.getElementById('btnApoio').classList.toggle('active', tab === 'support');

        document.getElementById('section-servers').style.display = tab === 'servers' ? 'block' : 'none';
        document.getElementById('section-apps').style.display   = tab === 'apps'    ? 'block' : 'none';
        document.getElementById('section-support').style.display = tab === 'support' ? 'block' : 'none';

        // Ocultar busca e pills na aba Apoio
        const searchBox = document.getElementById('searchInput');
        const filterBar = document.getElementById('publicServerFilterBar');
        if (searchBox) searchBox.style.display = tab === 'support' ? 'none' : 'block';
        if (filterBar) filterBar.style.display  = tab === 'servers'  ? 'flex' : 'none';

        // Limpar pesquisa e filtro ao trocar de aba
        document.getElementById('searchInput').value = '';
        window._pubSrvFilter = 'all';
        updatePublicFilterHighlight();
        renderServers(activeServers);
        renderApps(activeApps);

        // Atualizar o endereço no navegador (hash)
        if (updateHash && tabToHash[tab]) {
            window.location.hash = tabToHash[tab];
        }
    };

    // Escuta o botão voltar/avançar do navegador
    window.addEventListener('hashchange', () => {
        const tab = hashToTab[window.location.hash] || 'servers';
        if (tab !== currentTab) {
            switchTab(tab, false);
        }
    });

    // --- CONTATOS DE APOIO (Portal Público) ---
    const contactTypeColors = {
        whatsapp: '#25D366', telegram: '#2AABEE', email: '#EA4335',
        phone: '#8b5cf6', instagram: '#E1306C', youtube: '#FF0000',
        site: '#3b82f6', other: '#94a3b8'
    };
    const contactTypeEmojis = {
        whatsapp: '📱', telegram: '✈️', email: '📧',
        phone: '📞', instagram: '📸', youtube: '▶️',
        site: '🌐', other: '💬'
    };

    const loadContacts = async () => {
        try {
            const res = await fetch('api.php?action=list_contacts');
            if (!res.ok) throw new Error('API indisponível');
            const contacts = await res.json();
            renderContacts(contacts);
        } catch(e) {
            // Fallback estático
            if (window.STATIC_DATA && window.STATIC_DATA.contacts) {
                renderContacts(window.STATIC_DATA.contacts);
            } else {
                console.error('Erro ao carregar contatos', e);
            }
        }
    };

    const renderContacts = (contacts) => {
        const grid = document.getElementById('publicContactsGrid');
        grid.innerHTML = '';

        if (!contacts || contacts.length === 0) {
            grid.innerHTML = `<p style="color:rgba(255,255,255,0.5); text-align:center; padding:2rem; grid-column: 1/-1;">
                Nenhum canal de apoio disponível no momento.</p>`;
            return;
        }

        const icons = {
            whatsapp: `<svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>`,
            telegram: `<svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.14-.26.26-.53.26l.204-3.04 5.54-5.006c.24-.21-.054-.33-.375-.12l-6.85 4.314-2.94-.92c-.64-.2-.65-.64.134-.946l11.5-4.43c.53-.2.99.11.817.906z"/></svg>`,
            email: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
            other: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
            phone: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`,
            instagram: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
            youtube: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.42 5.58a2.78 2.78 0 0 0 1.94 2c1.72.42 8.6.42 8.6.42s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg>`,
            site: `<svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>`
        };

        const btnLabels = {
            whatsapp: 'INICIAR CONVERSA',
            telegram: 'CHAMAR NO TELEGRAM',
            email: 'ENVIAR E-MAIL',
            phone: 'LIGAR AGORA',
            instagram: 'VER INSTAGRAM',
            youtube: 'VER CANAL',
            site: 'ACESSAR SITE',
            other: 'ENTRAR EM CONTATO'
        };

        contacts.forEach(ct => {
            const color = contactTypeColors[ct.type] || '#94a3b8';
            const icon = icons[ct.type] || icons.other;
            const btnLabel = btnLabels[ct.type] || btnLabels.other;
            
            let href = ct.value;
            if (ct.type === 'whatsapp' && !href.startsWith('http')) {
                href = 'https://wa.me/' + href.replace(/\D/g, '');
            } else if (ct.type === 'email' && !href.startsWith('mailto:')) {
                href = 'mailto:' + href;
            } else if (ct.type === 'phone' && !href.startsWith('tel:') && !href.startsWith('http')) {
                href = 'tel:' + href.replace(/\D/g, '');
            } else if (ct.type === 'telegram' && !href.startsWith('http')) {
                href = 'https://t.me/' + href.replace('@', '');
            }

            grid.innerHTML += `
                <div style="background: rgba(13, 17, 23, 0.95); border: 2px solid rgba(255, 255, 255, 0.05);
                             border-radius: 24px; padding: 2.5rem 1.5rem; display: flex; flex-direction: column;
                             align-items: center; text-align: center; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                             box-shadow: 0 10px 30px rgba(0,0,0,0.5); position: relative; overflow: hidden;"
                     onmouseover="this.style.transform='translateY(-10px)'; this.style.borderColor='rgba(255,255,255,0.15)'; this.style.boxShadow='0 20px 50px rgba(0,0,0,0.8)';"
                     onmouseout="this.style.transform='translateY(0)'; this.style.borderColor='rgba(255,255,255,0.05)'; this.style.boxShadow='0 10px 30px rgba(0,0,0,0.5)';"
                     onclick="window.open('${escapeHtml(href)}', '_blank')">

                    <div style="color: ${color}; margin-bottom: 2rem; filter: drop-shadow(0 0 10px ${color}44); transition: transform 0.3s;"
                         onmouseover="this.style.transform='scale(1.1)'"
                         onmouseout="this.style.transform='scale(1)'">
                        ${icon}
                    </div>

                    <h3 style="font-size: 1.6rem; font-weight: 800; color: white; margin: 0 0 1rem;
                               text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Outfit', sans-serif;">
                        ${escapeHtml(ct.name)}
                    </h3>

                    <p style="font-size: 0.95rem; color: rgba(160, 170, 190, 0.8); line-height: 1.5;
                              margin: 0 0 2.5rem; flex-grow: 1; max-width: 240px;">
                        ${escapeHtml(ct.description || 'Estamos prontos para te atender e tirar todas as suas dúvidas.')}
                    </p>

                    <button style="width: 100%; padding: 0.9rem; border-radius: 50px; border: none;
                                   background: ${ct.type === 'other' ? 'transparent' : color};
                                   color: white; font-weight: 800; font-size: 0.85rem; cursor: pointer;
                                   text-transform: uppercase; letter-spacing: 0.05em;
                                   display: flex; align-items: center; justify-content: center; gap: 8px;
                                   box-shadow: ${ct.type === 'other' ? 'none' : `0 8px 20px ${color}33`};
                                   border: ${ct.type === 'other' ? '2px solid rgba(255,255,255,0.15)' : 'none'};
                                   transition: all 0.2s;"
                            onmouseover="this.style.filter='brightness(1.1)'; this.style.transform='scale(1.02)'"
                            onmouseout="this.style.filter='brightness(1)'; this.style.transform='scale(1)'">
                        ${btnLabel} 
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                    </button>
                </div>`;
        });
    };

    // --- FILTROS PÚBLICOS DE SERVIDORES ---
    window._pubSrvFilter = 'all';

    const updatePublicFilterCounts = () => {
        const total   = activeServers.length;
        const hybrid  = activeServers.filter(s => (s.server_type || 'hybrid') === 'hybrid').length;
        const iptv    = activeServers.filter(s => (s.server_type || 'hybrid') === 'iptv').length;
        const android = activeServers.filter(s => (s.server_type || 'hybrid') === 'android').length;
        const el = (id) => document.getElementById(id);
        if (el('pubSrvCnt-all'))     el('pubSrvCnt-all').textContent     = total;
        if (el('pubSrvCnt-hybrid'))  el('pubSrvCnt-hybrid').textContent  = hybrid;
        if (el('pubSrvCnt-iptv'))    el('pubSrvCnt-iptv').textContent    = iptv;
        if (el('pubSrvCnt-android')) el('pubSrvCnt-android').textContent = android;
        updatePublicFilterHighlight();
    };

    const updatePublicFilterHighlight = () => {
        const f = window._pubSrvFilter || 'all';
        const pills = {
            all:     document.getElementById('pubSrvFilterAll'),
            hybrid:  document.getElementById('pubSrvFilterHybrid'),
            iptv:    document.getElementById('pubSrvFilterIptv'),
            android: document.getElementById('pubSrvFilterAndroid'),
        };
        const outlines = {
            all:     '2px solid rgba(255,255,255,0.6)',
            hybrid:  '2px solid #fde68a',
            iptv:    '2px solid #a5b4fc',
            android: '2px solid #6ee7b7',
        };
        Object.keys(pills).forEach(k => {
            if (pills[k]) pills[k].style.outline = k === f ? outlines[k] : 'none';
        });
    };

    const applyPublicServerFilters = () => {
        const term   = (document.getElementById('searchInput')?.value || '').toLowerCase();
        const filter = window._pubSrvFilter || 'all';
        let result   = activeServers;

        if (filter === 'hybrid' || filter === 'iptv' || filter === 'android') {
            result = result.filter(s => (s.server_type || 'hybrid') === filter);
        }

        if (term) result = result.filter(s => {
            const sc = parseInt(s.screens, 10) || 1;
            const telaLabel = `${sc} tela${sc >= 2 ? 's' : ''}`;
            const typeLabels = { hybrid: 'híbrido p2p iptv', iptv: 'iptv', android: 'android' };
            const typeLabel  = typeLabels[s.server_type || 'hybrid'] || '';
            return `${s.name} ${telaLabel} ${typeLabel}`.toLowerCase().includes(term);
        });

        renderServers(result);
    };

    window.filterPublicServers = (type) => {
        window._pubSrvFilter = type;
        updatePublicFilterHighlight();
        applyPublicServerFilters();
    };

    // --- PESQUISA ---
    document.getElementById('searchInput').addEventListener('input', () => {
        const term = (document.getElementById('searchInput').value || '').toLowerCase();
        if (currentTab === 'servers') {
            applyPublicServerFilters();
        } else {
            const filtered = activeApps.filter(a => a.name.toLowerCase().includes(term));
            renderApps(filtered);
        }
    });

    // Inicia o App
    loadAllData();
    loadContacts();

    // --- BOTÃO × NO CAMPO DE PESQUISA ---
    const addClearBtn = (inputId) => {
        const input = document.getElementById(inputId);
        if (!input) return;

        const wrapper = document.createElement('div');
        wrapper.style.cssText = `position:relative; display:inline-flex; align-items:center; width:100%; max-width:${input.style.maxWidth || input.getAttribute('style')?.match(/max-width:\s*([^;]+)/)?.[1] || '600px'};`;
        input.style.width = '100%';
        input.style.maxWidth = '';
        input.style.paddingRight = '2.5rem';
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = '×';
        btn.title = 'Limpar pesquisa';
        btn.style.cssText = [
            'position:absolute', 'right:14px', 'top:50%', 'transform:translateY(-50%)',
            'background:none', 'border:none', 'cursor:pointer',
            'color:rgba(255,255,255,0.35)', 'font-size:1.4rem', 'line-height:1',
            'padding:0 2px', 'display:none', 'transition:color 0.2s', 'z-index:5'
        ].join(';');
        btn.onmouseover = () => btn.style.color = 'rgba(255,255,255,0.9)';
        btn.onmouseout  = () => btn.style.color = 'rgba(255,255,255,0.35)';
        btn.onclick = () => {
            input.value = '';
            btn.style.display = 'none';
            input.dispatchEvent(new Event('input'));
            input.focus();
        };
        wrapper.appendChild(btn);

        input.addEventListener('input', () => {
            btn.style.display = input.value.length > 0 ? 'block' : 'none';
        });
    };

    addClearBtn('searchInput');
});
