<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin - Gestão do Portal</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="layout">
        <!-- Menu Lateral -->
        <aside class="sidebar glass-panel">
            <div class="logo">
                <img src="assets/logo-central-v2.png" alt="Central de Servidores" style="width: 100%; height: auto; filter: drop-shadow(0 0 5px rgba(0,255,255,0.3));">
            </div>
            <nav class="nav-menu">
                <a href="#" class="nav-item active" data-target="page-servers">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect><rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect><line x1="6" y1="6" x2="6.01" y2="6"></line><line x1="6" y1="18" x2="6.01" y2="18"></line></svg>
                    Servidores
                </a>
                <a href="#" class="nav-item" data-target="page-apps">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                    App Parceiros
                </a>
                <a href="#" class="nav-item" data-target="page-content">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    Conteúdos
                </a>
                <a href="#" class="nav-item" data-target="page-support">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 11a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 0h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 7.91a16 16 0 0 0 6 6l1.27-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    Apoio
                </a>
            </nav>
        </aside>

        <!-- Conteúdo Principal -->
        <main class="main-content">
            
            <!-- PÁGINA SERVIDORES -->
            <section id="page-servers" class="page active">
                <header class="page-header" style="flex-wrap: wrap; gap: 1rem; align-items: center;">
                    <div style="flex: 1; min-width: 250px;">
                        <h1 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            Gerenciar Servidores
                            <span id="totalServers" style="font-size: 0.9rem; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 12px; font-weight: normal;">0</span>
                        </h1>
                        <input type="text" id="searchServers" class="search-input" placeholder="Pesquisar servidor por nome..." style="width: 100%; max-width: 350px; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: white;">
                        <!-- Filtros rápidos de Servidores -->
                        <div id="serverFilterBar" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.75rem;">
                            <button id="srvFilterAll" onclick="filterServers('all')"
                                style="display:flex; align-items:center; gap:0.4rem; padding:0.35rem 0.9rem; border-radius:20px; border:none; cursor:pointer; font-size:0.82rem; font-weight:600; background:rgba(255,255,255,0.18); color:white; outline:2px solid rgba(255,255,255,0.5); transition:all 0.2s;">
                                🔍 Todos <span id="srvCnt-all" style="background:rgba(255,255,255,0.2); padding:1px 7px; border-radius:10px;">0</span>
                            </button>
                            <button id="srvFilterScreens" onclick="filterServers('screens')"
                                style="display:flex; align-items:center; gap:0.4rem; padding:0.35rem 0.9rem; border-radius:20px; border:none; cursor:pointer; font-size:0.82rem; font-weight:600; background:rgba(99,102,241,0.15); color:#a5b4fc; outline:none; transition:all 0.2s;">
                                🖥️ +1 Tela <span id="srvCnt-screens" style="background:rgba(99,102,241,0.25); padding:1px 7px; border-radius:10px;">0</span>
                            </button>
                            <button id="srvFilterAndroid" onclick="filterServers('android')"
                                style="display:flex; align-items:center; gap:0.4rem; padding:0.35rem 0.9rem; border-radius:20px; border:none; cursor:pointer; font-size:0.82rem; font-weight:600; background:rgba(52,211,153,0.15); color:#6ee7b7; outline:none; transition:all 0.2s;">
                                🤖 Android <span id="srvCnt-android" style="background:rgba(52,211,153,0.25); padding:1px 7px; border-radius:10px;">0</span>
                            </button>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="openNewServerModal()">Novo Servidor</button>
                </header>
                <div class="grid" id="serversGrid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1.5rem;"></div>
            </section>

            <!-- PÁGINA APP PARCEIROS -->
            <section id="page-apps" class="page">
                <header class="page-header" style="flex-wrap: wrap; gap: 1rem; align-items: center;">
                    <div style="flex: 1; min-width: 250px;">
                        <h1 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            Aplicativos Parceiros
                            <span id="totalApps" style="font-size: 0.9rem; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 12px; font-weight: normal;">0</span>
                        </h1>
                        <input type="text" id="searchApps" class="search-input" placeholder="Pesquisar aplicativo..." style="width: 100%; max-width: 350px; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: white;">
                    </div>
                    <button class="btn-primary" onclick="openNewAppModal()">Novo App Parceiro</button>
                </header>
                <div class="grid" id="appsGrid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1.5rem;"></div>
            </section>

            <!-- PÁGINA CONTEÚDOS -->
            <section id="page-content" class="page">
                <header class="page-header" style="flex-wrap: wrap; gap: 1rem; align-items: center;">
                    <div style="flex: 1; min-width: 250px;">
                        <h1 style="margin-bottom: 0.5rem;">Quantidade de Conteúdos</h1>
                        <p style="color: var(--text-muted); margin-bottom: 0.75rem; font-size: 0.9rem;">Atualize a quantidade de Canais, Filmes e Séries para cada servidor.</p>
                        <input type="text" id="searchContent" class="search-input" placeholder="Pesquisar servidor..." style="width: 100%; max-width: 350px; padding: 0.6rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: white;">
                    </div>
                </header>

                <!-- BARRA DE STATUS / FILTROS -->
                <div id="contentStatusBar" style="display: flex; flex-wrap: wrap; gap: 0.6rem; margin-bottom: 1.5rem; align-items: center;">
                    <button onclick="filterContent('all')" id="filterAll" class="filter-pill active-pill"
                        style="display:flex; align-items:center; gap:0.4rem; padding:0.4rem 1rem; border-radius:20px; border:none; cursor:pointer; font-size:0.85rem; font-weight:600; background:rgba(255,255,255,0.12); color:white; transition:all 0.2s;">
                        🔍 Todos <span id="cnt-all" style="background:rgba(255,255,255,0.2); padding:1px 7px; border-radius:10px;">0</span>
                    </button>
                    <button onclick="filterContent('ok')" id="filterOk"
                        style="display:flex; align-items:center; gap:0.4rem; padding:0.4rem 1rem; border-radius:20px; border:none; cursor:pointer; font-size:0.85rem; font-weight:600; background:rgba(46,204,113,0.15); color:#2ecc71; transition:all 0.2s;">
                        ✅ Atualizado <span id="cnt-ok" style="background:rgba(46,204,113,0.25); padding:1px 7px; border-radius:10px;">0</span>
                    </button>
                    <button onclick="filterContent('warn')" id="filterWarn"
                        style="display:flex; align-items:center; gap:0.4rem; padding:0.4rem 1rem; border-radius:20px; border:none; cursor:pointer; font-size:0.85rem; font-weight:600; background:rgba(52,152,219,0.15); color:#3498db; transition:all 0.2s;">
                        🕐 Atenção <span id="cnt-warn" style="background:rgba(52,152,219,0.25); padding:1px 7px; border-radius:10px;">0</span>
                    </button>
                    <button onclick="filterContent('danger')" id="filterDanger"
                        style="display:flex; align-items:center; gap:0.4rem; padding:0.4rem 1rem; border-radius:20px; border:none; cursor:pointer; font-size:0.85rem; font-weight:600; background:rgba(231,76,60,0.15); color:#e74c3c; transition:all 0.2s;">
                        🔴 Atrasado <span id="cnt-danger" style="background:rgba(231,76,60,0.25); padding:1px 7px; border-radius:10px;">0</span>
                    </button>
                    <button onclick="filterContent('never')" id="filterNever"
                        style="display:flex; align-items:center; gap:0.4rem; padding:0.4rem 1rem; border-radius:20px; border:none; cursor:pointer; font-size:0.85rem; font-weight:600; background:rgba(150,150,150,0.15); color:#aaa; transition:all 0.2s;">
                        ⚫ Nunca <span id="cnt-never" style="background:rgba(150,150,150,0.2); padding:1px 7px; border-radius:10px;">0</span>
                    </button>
                </div>

                <div class="grid" id="contentGrid" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 1.5rem;"></div>
            </section>

            <!-- PÁGINA APOIO -->
            <section id="page-support" class="page">
                <header class="page-header" style="flex-wrap: wrap; gap: 1rem; align-items: center;">
                    <div style="flex: 1; min-width: 250px;">
                        <h1 style="margin-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
                            Meios de Apoio
                            <span id="totalContacts" style="font-size: 0.9rem; padding: 4px 10px; background: rgba(255,255,255,0.1); border-radius: 12px; font-weight: normal;">0</span>
                        </h1>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">Gerencie os canais de suporte exibidos no portal público.</p>
                    </div>
                    <button class="btn-primary" onclick="openNewContactModal()">+ Novo Contato</button>
                </header>

                <div style="display: flex; flex-direction: column; gap: 0.75rem;" id="contactsList"></div>
            </section>
        </main>
    </div>

    <!-- MODAL SERVIDOR -->
    <div class="modal-overlay" id="modalServer">
        <div class="modal glass-panel">
            <div class="modal-header">
                <h2>Adicionar Servidor</h2>
                <button class="close-btn" onclick="closeModal('modalServer')">&times;</button>
            </div>
            <form id="formServer">
                <input type="hidden" id="srvId">
                <div class="form-group"><label>Nome</label><input type="text" id="srvName" required></div>
                <div class="form-group"><label>URL (Opcional)</label><input type="text" id="srvUrl"></div>
                <div class="form-group"><label>URL da Imagem/Logo (Opcional)</label><input type="text" id="srvLogo"></div>
                <div class="form-group"><label>Imagem da Tabela de Preços (Link Imgur ou similar)</label><input type="text" id="srvTableImg" placeholder="https://..."></div>
                <div class="form-group"><label>Status</label>
                    <select id="srvStatus">
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>
                </div>
                <div class="form-group"><label>Número de Telas Simultâneas</label>
                    <select id="srvScreens">
                        <option value="1">1 Tela</option>
                        <option value="2">2 Telas</option>
                        <option value="3">3 Telas</option>
                        <option value="4">4 Telas</option>
                    </select>
                </div>
                <div class="form-group"><label>Tipo do Servidor</label>
                    <select id="srvType">
                        <option value="hybrid">🔀 Híbrido (P2P e IPTV)</option>
                        <option value="iptv">📡 Somente IPTV</option>
                        <option value="android">🤖 Android</option>
                    </select>
                </div>
                <div class="form-group"><label>URL da Imagem da Tabela (Opcional)</label><input type="text" id="srvTableImg"></div>
                <div class="form-group"><label>URL do Painel (Opcional)</label><input type="text" id="srvPanelUrl" placeholder="Ex: http://painel.exemplo.com"></div>
                <div class="form-group"><label>URL da Loja de Apps (Opcional)</label><input type="text" id="srvAppStoreUrl" placeholder="Ex: http://loja.exemplo.com"></div>
                <div class="form-group"><label>Descrição</label><textarea id="srvDesc" rows="2"></textarea></div>
                <div class="form-actions" style="display:flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                    <div>
                        <button type="button" class="btn-icon delete" id="btnDeleteServer" style="display:none; color: var(--danger); font-size: 0.9rem;" onclick="deleteCurrent('server')">Excluir Servidor</button>
                        <button type="button" class="btn-secondary" id="btnManageApps" style="display:none; font-size: 0.9rem;" onclick="openManageApps()">Apps Suportados</button>
                    </div>
                    <div style="margin-left: auto;">
                        <button type="button" class="btn-secondary" onclick="closeModal('modalServer')">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL APP PARCEIRO -->
    <div class="modal-overlay" id="modalApp">
        <div class="modal glass-panel">
            <div class="modal-header">
                <h2>Adicionar App Parceiro</h2>
                <button class="close-btn" onclick="closeModal('modalApp')">&times;</button>
            </div>
            <form id="formApp">
                <div class="form-group"><label>Nome do App</label><input type="text" id="appName" required></div>
                <div class="form-group"><label>Link de Download / URL (Opcional)</label><input type="text" id="appUrl"></div>
                <div class="form-group"><label>URL da Imagem/Logo (Opcional)</label><input type="text" id="appLogo"></div>
                <div class="form-group"><label>Status</label>
                    <select id="appStatus">
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                    </select>
                </div>
                <div class="form-actions" style="display:flex; justify-content: space-between; align-items: center;">
                    <button type="button" class="btn-icon delete" id="btnDeleteApp" style="display:none; color: var(--danger); font-size: 0.9rem;" onclick="deleteCurrent('app')">Excluir App</button>
                    <div style="margin-left: auto;">
                        <button type="button" class="btn-secondary" onclick="closeModal('modalApp')">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL CONTEÚDOS -->
    <div class="modal-overlay" id="modalContent">
        <div class="modal glass-panel">
            <div class="modal-header">
                <h2 id="contentTitle">Conteúdo do Servidor</h2>
                <button class="close-btn" onclick="closeModal('modalContent')">&times;</button>
            </div>

            <!-- Logo -->
            <div style="text-align: center; margin-bottom: 1.2rem;">
                <img id="contentSrvLogo" src="" style="width: 80px; height: 80px; object-fit: cover; border-radius: 16px; display: none; margin: 0 auto; box-shadow: 0 5px 15px rgba(0,0,0,0.5);">
            </div>

            <!-- MODO VISUALIZAÇÃO -->
            <div id="contentViewMode">
                <div style="display: grid; grid-template-columns: repeat(3,1fr); gap: 0.75rem; margin-bottom: 1rem;">
                    <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:1rem; text-align:center;">
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.3rem;">📡 Canais</div>
                        <div id="viewChannels" style="font-size:1.4rem; font-weight:700; color:white;">0</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:1rem; text-align:center;">
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.3rem;">🎬 Filmes</div>
                        <div id="viewMovies" style="font-size:1.4rem; font-weight:700; color:white;">0</div>
                    </div>
                    <div style="background:rgba(0,0,0,0.3); border-radius:12px; padding:1rem; text-align:center;">
                        <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:0.3rem;">📺 Séries</div>
                        <div id="viewSeries" style="font-size:1.4rem; font-weight:700; color:white;">0</div>
                    </div>
                </div>
                <!-- Badge de data -->
                <div id="viewUpdateBadge" style="text-align:center; font-size:0.8rem; padding:0.5rem 1rem; border-radius:20px; background:rgba(0,0,0,0.3); margin-bottom:1.2rem;"></div>
                <!-- Botão Editar -->
                <button onclick="enableContentEdit()" class="btn-primary" style="width:100%; display:flex; align-items:center; justify-content:center; gap:0.5rem;">✏️ Editar Quantidades</button>
            </div>

            <!-- MODO EDIÇÃO (oculto por padrão) -->
            <div id="contentEditMode" style="display:none;">
                <form id="formContent">
                    <input type="hidden" id="contentSrvId">
                    <div class="form-group"><label>Canais (Ao Vivo)</label><input type="text" id="cChannels" required placeholder="0"></div>
                    <div class="form-group"><label>Filmes</label><input type="text" id="cMovies" required placeholder="0"></div>
                    <div class="form-group"><label>Séries</label><input type="text" id="cSeries" required placeholder="0"></div>
                    <div class="modal-actions">
                        <button type="button" class="btn-secondary" onclick="disableContentEdit()">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    </div>

    <!-- MODAL PLANOS DO SERVIDOR -->
    <div class="modal-overlay" id="modalPlans">
        <div class="modal glass-panel" style="max-width: 600px;">
            <div class="modal-header">
                <h2>Planos - <span id="plansServerName"></span></h2>
                <button class="close-btn" onclick="closeModal('modalPlans')">&times;</button>
            </div>
            
            <div style="background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                <h3 style="font-size: 1rem; margin-bottom: 1rem;">Adicionar Nova Faixa de Preço</h3>
                <form id="formAddPlan" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <div class="form-group" style="flex: 1; min-width: 80px;"><label style="font-size:0.8rem; margin-bottom:4px;">De (Qtd)</label><input type="number" id="planMin" placeholder="Ex: 10" required></div>
                    <div class="form-group" style="flex: 1; min-width: 80px;"><label style="font-size:0.8rem; margin-bottom:4px;">Até (Qtd)</label><input type="number" id="planMax" placeholder="Ex: 49" required></div>
                    <div class="form-group" style="flex: 1; min-width: 100px;"><label style="font-size:0.8rem; margin-bottom:4px;">Valor Unitário</label><input type="number" id="planPrice" step="0.01" placeholder="Ex: 6.50" required></div>
                    <button type="submit" class="btn-primary" style="height: 42px; margin-top: auto; margin-bottom: 1rem;">Adicionar</button>
                </form>
            </div>

            <div style="max-height: 300px; overflow-y: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left; color: white;">
                    <thead>
                        <tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">
                            <th style="padding: 0.5rem;">Quantidade</th>
                            <th style="padding: 0.5rem;">Valor Unitário</th>
                            <th style="padding: 0.5rem; width: 50px;">Ação</th>
                        </tr>
                    </thead>
                    <tbody id="plansTableBody">
                    </tbody>
                </table>
            </div>

            <div class="modal-actions" style="margin-top: 1rem;">
                <button type="button" class="btn-secondary" onclick="closeModal('modalPlans')">Fechar</button>
            </div>
        </div>
    </div>

    <!-- MODAL VINCULAR APPS -->
    <div class="modal-overlay" id="modalServerApps">
        <div class="modal glass-panel" style="max-width: 1000px; width: 98%;">
            <div class="modal-header">
                <h2>Apps Suportados - <span id="appsServerName"></span></h2>
                <button class="close-btn" onclick="closeModal('modalServerApps')">&times;</button>
            </div>
            
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; align-items: center; flex-wrap: wrap;">
                <p style="margin: 0; color: var(--text-muted); font-size: 0.9rem; flex: 1; min-width: 250px;">
                    Marque abaixo todos os aplicativos que são compatíveis com este servidor.
                </p>
                <input type="text" id="searchServerApps" placeholder="Pesquisar app..." style="padding: 0.5rem 1rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.3); color: white; width: 100%; max-width: 250px;">
            </div>

            <form id="formServerApps">
                <div id="appsChecklist" style="max-height: 75vh; overflow-y: auto; display: grid; grid-template-columns: repeat(auto-fill, minmax(65px, 1fr)); gap: 0.8rem; background: rgba(0,0,0,0.3); padding: 1rem; border-radius: 8px;">
                    <!-- Miniaturas serão geradas aqui -->
                </div>

                <div class="modal-actions" style="margin-top: 1.5rem;">
                    <button type="button" class="btn-secondary" onclick="closeModal('modalServerApps')">Cancelar</button>
                    <button type="submit" class="btn-primary">Salvar Vínculos</button>
                </div>
            </form>
        </div>
    </div>

    <!-- MODAL CONTATO DE APOIO -->
    <div class="modal-overlay" id="modalContact">
        <div class="modal glass-panel" style="max-width:420px;">
            <div class="modal-header">
                <h2 id="contactModalTitle">Novo Contato</h2>
                <button class="close-btn" onclick="closeModal('modalContact')">&times;</button>
            </div>
            <form id="formContact">
                <input type="hidden" id="ctId">
                <div class="form-group">
                    <label>Tipo</label>
                    <select id="ctType" onchange="updateContactPlaceholder()">
                        <option value="whatsapp">📱 WhatsApp</option>
                        <option value="telegram">✈️ Telegram</option>
                        <option value="email">📧 E-mail</option>
                        <option value="phone">📞 Telefone</option>
                        <option value="instagram">📸 Instagram</option>
                        <option value="youtube">▶️ YouTube</option>
                        <option value="site">🌐 Site</option>
                        <option value="other">💬 Outro</option>
                    </select>
                </div>
                <div class="form-group"><label>Nome / Rótulo</label><input type="text" id="ctName" placeholder="Ex: Suporte via WhatsApp" required></div>
                <div class="form-group"><label>Link ou Valor</label><input type="text" id="ctValue" placeholder="https://wa.me/5500000000000" required></div>
                <div class="form-group"><label>Descrição (opcional)</label><textarea id="ctDesc" rows="2" placeholder="Atendimento de segunda a sexta..."></textarea></div>
                <div class="form-group"><label>Ordem de exibição</label><input type="number" id="ctOrder" value="0" min="0" style="width:100px;"></div>
                <div class="modal-actions" style="display:flex; justify-content:space-between; align-items:center; margin-top:1.5rem;">
                    <button type="button" class="btn-icon delete" id="btnDeleteContact" style="display:none; color:var(--danger);" onclick="deleteCurrentContact()">Excluir</button>
                    <div style="margin-left:auto; display:flex; gap:0.75rem;">
                        <button type="button" class="btn-secondary" onclick="closeModal('modalContact')">Cancelar</button>
                        <button type="submit" class="btn-primary">Salvar</button>
                    </div>
                </div>
            </form>
        </div>
    </div>

    <script src="script.js?v=24"></script>

</body>
</html>
