// 民俗学术语库核心应用模块
var FolkloreApp = (function() {
    'use strict';
    
    // 配置
    var config = {
        batchSize: 30,
        animationDelay: 20,
        suggestionLimit: 8,
        historyLimit: 10,
        categories: ['民俗事象', '学科概念', '理论术语', '研究关键词', '研究方法', '学者与学术体制'],
        colors: {
            '民俗事象': '#B8403D',
            '学科概念': '#4B4D9E',
            '理论术语': '#2E6DA4',
            '研究关键词': '#3D8B68',
            '研究方法': '#9B7B2C',
            '学者与学术体制': '#8B3A5E'
        },
        icons: {
            '民俗事象': '🏛',
            '学科概念': '📐',
            '理论术语': '📖',
            '研究关键词': '🔑',
            '研究方法': '🔬',
            '学者与学术体制': '🎓'
        }
    };
    
    // 状态
    var state = {
        data: [],
        filtered: [],
        cat: null,
        sub: null,
        t3: null,
        query: '',
        view: 'grid',
        sort: 'name',
        loaded: 0,
        history: [],
        favorites: []
    };
    
    // 工具函数
    function $(id) { return document.getElementById(id); }
    function $$(sel) { return document.querySelectorAll(sel); }
    
    function highlight(text, query) {
        if (!query || !text) return text;
        var regex = new RegExp('(' + query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // 数据操作
    function filterData() {
        var result = state.data;
        
        if (state.cat) {
            result = result.filter(function(t) { return t[3] === state.cat; });
        }
        if (state.sub) {
            result = result.filter(function(t) { return t[4] === state.sub; });
        }
        if (state.t3) {
            result = result.filter(function(t) { return t[5] === state.t3; });
        }
        if (state.query) {
            var q = state.query.toLowerCase();
            result = result.filter(function(t) {
                return t[0].toLowerCase().indexOf(q) !== -1 ||
                       (t[1] || '').toLowerCase().indexOf(q) !== -1 ||
                       t[2].toLowerCase().indexOf(q) !== -1 ||
                       t[3].indexOf(q) !== -1 ||
                       t[4].indexOf(q) !== -1 ||
                       t[5].indexOf(q) !== -1;
            });
        }
        
        state.filtered = result;
        
        if (state.sort === 'name') {
            result = result.slice().sort(function(a, b) {
                return a[0].localeCompare(b[0], 'zh');
            });
        } else if (state.sort === 'category') {
            result = result.slice().sort(function(a, b) {
                return (a[3] + a[4] + a[5]).localeCompare(b[3] + b[4] + b[5], 'zh');
            });
        }
        
        return result;
    }
    
    // 渲染函数
    function renderCards(resetScroll) {
        var filtered = filterData();
        var total = filtered.length;
        var end = Math.min(state.loaded, total);
        var items = filtered.slice(0, end);
        
        // 更新信息
        var ctx = (state.cat || '') + (state.sub ? ' › ' + state.sub : '') + (state.query ? ' "' + state.query + '"' : '');
        if (ctx) ctx += ' · ';
        $('result-info').innerHTML = ctx + '<strong>' + total + '</strong> 条术语' + 
            (total > 0 && end < total ? ' · 已显示 <strong>' + end + '</strong> 条' : '');
        
        if (total > 0 && end >= total) {
            $('result-info').innerHTML += ' <span style="font-size:11px;opacity:.5">(已全部加载)</span>';
        }
        
        // 面包屑
        renderBreadcrumb();
        
        // 分布图
        var isHome = !state.cat && !state.sub && !state.t3 && !state.query;
        $('distro').style.display = isHome ? 'block' : 'none';
        
        // 网格
        var grid = $('term-grid');
        grid.className = 'term-grid' + (state.view === 'list' ? ' list' : '') + (state.view === 'compact' ? ' compact' : '');
        
        if (!items.length) {
            grid.innerHTML = '<div class="empty-state"><div class="empty-icon">📭</div><p>没有匹配的术语</p><p class="empty-hint">试试调整筛选条件或换个关键词</p></div>';
            $('load-more').innerHTML = '';
            return;
        }
        
        // 构建卡片
        var existing = grid.children.length;
        var html = '';
        var q = state.query;
        
        for (var i = existing; i < items.length; i++) {
            var t = items[i];
            var cn = t[0], en = t[1] || '', df = t[2] || '暂无释义';
            var cat = t[3], sub = t[4], t3 = t[5];
            var clr = config.colors[cat] || '#999';
            var cnH = q ? highlight(cn, q) : cn;
            var enH = q ? highlight(en, q) : en;
            var dfH = q ? highlight(df, q) : df;
            var isFav = state.favorites.indexOf(cn) !== -1;
            
            html += '<div class="term-card" onclick="FolkloreApp.toggleCard(this)">';
            html += '<div class="color-bar" style="background:' + clr + '"></div>';
            
            if (state.view !== 'compact') {
                html += '<div class="term-actions">';
                html += '<button class="term-action' + (isFav ? ' favorited' : '') + '" onclick="event.stopPropagation();FolkloreApp.toggleFav(this,\'' + cn.replace(/'/g, "\\'") + '\')" title="收藏">♥</button>';
                html += '<button class="term-action" onclick="event.stopPropagation();FolkloreApp.copyCard(this)" title="复制">📋</button>';
                html += '</div>';
            }
            
            html += '<div class="term-name">' + cnH + (enH ? ' <span class="term-en">' + enH + '</span>' : '') + '</div>';
            html += '<div class="term-breadcrumb">';
            html += '<span class="cat-link" onclick="event.stopPropagation();FolkloreApp.selectCat(\'' + cat + '\')">' + cat + '</span>';
            html += '<span class="sep">›</span>';
            html += '<span class="cat-link" onclick="event.stopPropagation();FolkloreApp.selectSub(\'' + sub + '\')">' + sub + '</span>';
            html += '<span class="sep">›</span>';
            html += '<span>' + t3 + '</span>';
            html += '</div>';
            html += '<div class="term-def">' + dfH + '</div>';
            html += '</div>';
        }
        
        grid.insertAdjacentHTML('beforeend', html);
        
        // 加载更多按钮
        if (end < total) {
            var remaining = total - end;
            $('load-more').innerHTML = '<button class="load-more-btn">加载更多 <span style="opacity:.5;font-size:12px">(剩余 ' + remaining + ' 条)</span></button>';
        } else if (total > 0) {
            $('load-more').innerHTML = '<div class="loaded-all">— 已显示全部 ' + total + ' 条 —</div>';
        } else {
            $('load-more').innerHTML = '';
        }
        
        if (resetScroll) window.scrollTo({ top: 0, behavior: 'instant' });
    }
    
    function renderBreadcrumb() {
        var bc = '';
        if (state.cat || state.query) {
            bc += '<span class="bc-link" onclick="FolkloreApp.resetAll()">全部</span>';
            if (state.cat) {
                bc += ' <span class="bc-sep">›</span> ';
                bc += '<span class="bc-link" onclick="FolkloreApp.selectCat(\'' + state.cat + '\')">' + state.cat + '</span>';
                if (state.sub) {
                    bc += ' <span class="bc-sep">›</span> ';
                    bc += '<span class="bc-link" onclick="FolkloreApp.selectSub(\'' + state.sub + '\')">' + state.sub + '</span>';
                    if (state.t3) {
                        bc += ' <span class="bc-sep">›</span> ';
                        bc += '<span class="bc-current">' + state.t3 + '</span>';
                    }
                }
            }
            if (state.query) {
                bc += ' <span class="bc-sep">·</span> <span style="color:var(--ink)">"' + state.query + '"</span>';
            }
        }
        $('breadcrumb').innerHTML = bc;
    }
    
    function renderCategories() {
        var counts = {};
        for (var i = 0; i < state.data.length; i++) {
            counts[state.data[i][3]] = (counts[state.data[i][3]] || 0) + 1;
        }
        
        var html = '<button class="cat-pill' + (state.cat === null ? ' active' : '') + '" onclick="FolkloreApp.selectCat(null)">全部<span class="count">' + state.data.length + '</span></button>';
        
        for (var i = 0; i < config.categories.length; i++) {
            var c = config.categories[i];
            var a = state.cat === c;
            html += '<button class="cat-pill' + (a ? ' active' : '') + '" onclick="FolkloreApp.selectCat(\'' + c + '\')"';
            if (a) html += ' style="background:' + config.colors[c] + '"';
            html += '>' + config.icons[c] + ' ' + c + '<span class="count">' + (counts[c] || 0) + '</span></button>';
        }
        
        $('cat-pills').innerHTML = html;
    }
    
    function renderSubcategories() {
        if (!state.cat) {
            $('sub-filters').innerHTML = '';
            return;
        }
        
        var subs = {};
        for (var i = 0; i < state.data.length; i++) {
            if (state.data[i][3] === state.cat) {
                subs[state.data[i][4]] = (subs[state.data[i][4]] || 0) + 1;
            }
        }
        
        var keys = Object.keys(subs).sort();
        var html = '<button class="sub-filter' + (state.sub === null ? ' active' : '') + '" onclick="FolkloreApp.selectSub(null)">全部子类</button>';
        
        for (var i = 0; i < keys.length; i++) {
            var s = keys[i];
            var a = state.sub === s;
            html += '<button class="sub-filter' + (a ? ' active' : '') + '" onclick="FolkloreApp.selectSub(\'' + s + '\')">' + s + ' (' + subs[s] + ')</button>';
        }
        
        $('sub-filters').innerHTML = html;
    }
    
    function renderT3() {
        if (!state.sub) {
            $('t3-filters').innerHTML = '';
            return;
        }
        
        var t3s = {};
        for (var i = 0; i < state.data.length; i++) {
            if (state.data[i][3] === state.cat && state.data[i][4] === state.sub) {
                t3s[state.data[i][5]] = (t3s[state.data[i][5]] || 0) + 1;
            }
        }
        
        var keys = Object.keys(t3s).sort();
        var html = '<button class="t3-filter' + (state.t3 === null ? ' active' : '') + '" onclick="FolkloreApp.selectT3(null)">全部</button>';
        
        for (var i = 0; i < keys.length; i++) {
            var s = keys[i];
            var a = state.t3 === s;
            html += '<button class="t3-filter' + (a ? ' active' : '') + '" onclick="FolkloreApp.selectT3(\'' + s + '\')">' + s + ' (' + t3s[s] + ')</button>';
        }
        
        $('t3-filters').innerHTML = html;
    }
    
    function renderViewButtons() {
        $$('.view-btn').forEach(function(b) {
            b.classList.toggle('active', b.id === state.view + '-btn');
        });
        $$('.view-toggle').forEach(function(b) {
            b.classList.toggle('active', b.dataset.view === state.view);
        });
    }
    
    function fullRender() {
        state.loaded = Math.min(config.batchSize, state.filtered.length || state.data.length);
        $('term-grid').innerHTML = '';
        renderCards(true);
        renderViewButtons();
        renderSubcategories();
        renderT3();
    }
    
    // 历史和收藏
    function addToHistory(query) {
        if (!query) return;
        state.history = state.history.filter(function(h) { return h !== query; });
        state.history.unshift(query);
        if (state.history.length > config.historyLimit) state.history.pop();
        try {
            localStorage.setItem('fhist', JSON.stringify(state.history));
        } catch (e) {}
    }
    
    function loadHistory() {
        try {
            var h = localStorage.getItem('fhist');
            if (h) state.history = JSON.parse(h);
        } catch (e) {}
    }
    
    function loadFavorites() {
        try {
            var f = localStorage.getItem('ffavs');
            if (f) state.favorites = JSON.parse(f);
        } catch (e) {}
    }
    
    function saveFavorites() {
        try {
            localStorage.setItem('ffavs', JSON.stringify(state.favorites));
        } catch (e) {}
    }
    
    // 搜索建议
    function renderSuggestions(query) {
        var sug = $('search-suggestions');
        if (!query) {
            sug.classList.remove('show');
            return;
        }
        
        var ql = query.toLowerCase();
        var results = [];
        
        for (var i = 0; i < state.data.length && results.length < config.suggestionLimit; i++) {
            var t = state.data[i];
            if (t[0].toLowerCase().indexOf(ql) !== -1 ||
                (t[1] || '').toLowerCase().indexOf(ql) !== -1 ||
                t[2].toLowerCase().indexOf(ql) !== -1) {
                results.push(t);
            }
        }
        
        if (!results.length) {
            sug.classList.remove('show');
            return;
        }
        
        var html = '';
        for (var i = 0; i < results.length; i++) {
            var t = results[i];
            html += '<div class="suggestion-item" onclick="FolkloreApp.selectSuggestion(\'' + t[0].replace(/'/g, "\\'") + '\')">';
            html += '<span class="suggestion-cn">' + highlight(t[0], query) + '</span>';
            if (t[1]) html += '<span class="suggestion-en">' + highlight(t[1], query) + '</span>';
            html += '<span class="suggestion-cat">' + t[3] + '</span>';
            html += '</div>';
        }
        
        sug.innerHTML = html;
        sug.classList.add('show');
    }
    
    // 导出功能
    function exportCSV() {
        var filtered = filterData();
        var csv = '中文名,英文名,定义,大类,子类,三级分类\n';
        
        filtered.forEach(function(t) {
            csv += '"' + t[0] + '","' + (t[1] || '') + '","' + (t[2] || '').replace(/"/g, '""') + '","' + t[3] + '","' + t[4] + '","' + t[5] + '"\n';
        });
        
        var blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '民俗学术语库.csv';
        a.click();
        toast('已导出 CSV');
        $('export-menu').classList.remove('show');
    }
    
    function exportJSON() {
        var filtered = filterData();
        var json = JSON.stringify(filtered, null, 2);
        
        var blob = new Blob([json], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '民俗学术语库.json';
        a.click();
        toast('已导出 JSON');
        $('export-menu').classList.remove('show');
    }
    
    function exportMarkdown() {
        var filtered = filterData();
        var md = '# 中国民俗学术语库\n\n';
        md += '共收录 ' + filtered.length + ' 条术语\n\n';
        
        var currentCat = '';
        filtered.forEach(function(t) {
            if (t[3] !== currentCat) {
                currentCat = t[3];
                md += '## ' + currentCat + '\n\n';
            }
            md += '### ' + t[0];
            if (t[1]) md += ' (' + t[1] + ')';
            md += '\n\n' + (t[2] || '暂无释义') + '\n\n';
            md += '分类：' + t[3] + ' › ' + t[4] + ' › ' + t[5] + '\n\n';
        });
        
        var blob = new Blob([md], { type: 'text/markdown' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = '民俗学术语库.md';
        a.click();
        toast('已导出 Markdown');
        $('export-menu').classList.remove('show');
    }
    
    // 提示
    function toast(msg) {
        var t = $('toast');
        t.textContent = msg;
        t.classList.add('show');
        clearTimeout(t._tid);
        t._tid = setTimeout(function() { t.classList.remove('show'); }, 1800);
    }
    
    // 术语对比功能
    function compareTerms(terms) {
        if (!terms || terms.length < 2) {
            toast('请选择至少两个术语进行对比');
            return;
        }
        
        var compareHtml = '<div class="compare-modal" id="compare-modal">';
        compareHtml += '<div class="compare-content">';
        compareHtml += '<div class="compare-header">';
        compareHtml += '<h3>术语对比</h3>';
        compareHtml += '<button class="compare-close" onclick="FolkloreApp.closeCompare()">×</button>';
        compareHtml += '</div>';
        compareHtml += '<div class="compare-body">';
        
        terms.forEach(function(term) {
            compareHtml += '<div class="compare-item">';
            compareHtml += '<div class="compare-name">' + term[0] + '</div>';
            if (term[1]) compareHtml += '<div class="compare-en">' + term[1] + '</div>';
            compareHtml += '<div class="compare-def">' + (term[2] || '暂无释义') + '</div>';
            compareHtml += '<div class="compare-cat">' + term[3] + ' › ' + term[4] + ' › ' + term[5] + '</div>';
            compareHtml += '</div>';
        });
        
        compareHtml += '</div>';
        compareHtml += '</div>';
        compareHtml += '</div>';
        
        document.body.insertAdjacentHTML('beforeend', compareHtml);
        
        var modal = document.getElementById('compare-modal');
        modal.addEventListener('click', function(e) {
            if (e.target === modal) FolkloreApp.closeCompare();
        });
    }
    
    // API接口功能
    function getAPIEndpoint() {
        var baseUrl = window.location.origin + window.location.pathname;
        return {
            all: baseUrl + 'api/terms',
            search: baseUrl + 'api/terms?q=',
            category: baseUrl + 'api/terms?category=',
            stats: baseUrl + 'api/stats'
        };
    }
    
    // 获取术语统计
    function getStats() {
        var stats = {
            total: state.data.length,
            categories: {},
            subcategories: {},
            recentSearches: state.history,
            favorites: state.favorites
        };
        
        state.data.forEach(function(t) {
            stats.categories[t[3]] = (stats.categories[t[3]] || 0) + 1;
            var key = t[3] + ' > ' + t[4];
            stats.subcategories[key] = (stats.subcategories[key] || 0) + 1;
        });
        
        return stats;
    }
    
    // 初始化
    function init(data) {
        state.data = data;
        loadHistory();
        loadFavorites();
        
        // 设置事件监听
        setupEventListeners();
        
        // 渲染
        renderCategories();
        renderStats();
        renderDistribution();
        
        state.loaded = config.batchSize;
        renderCards(true);
        
        // 隐藏加载动画
        setTimeout(function() {
            var loading = $('loading');
            if (loading) {
                loading.classList.add('hidden');
                setTimeout(function() { loading.remove(); }, 300);
            }
        }, 300);
    }
    
    function renderStats() {
        $('stats').innerHTML = '<div class="stat-item">📚 <strong>' + state.data.length.toLocaleString() + '</strong> 条术语</div>' +
            '<div class="stat-item">📂 <strong>6</strong> 个大类</div>' +
            '<div class="stat-item">🔤 中英双语</div>';
        $('total-count').textContent = state.data.length.toLocaleString();
    }
    
    function renderDistribution() {
        var counts = {};
        for (var i = 0; i < state.data.length; i++) {
            var c = state.data[i][3];
            counts[c] = (counts[c] || 0) + 1;
        }
        
        var html = '';
        for (var i = 0; i < config.categories.length; i++) {
            var c = config.categories[i];
            var cnt = counts[c] || 0;
            var pct = Math.round(cnt / state.data.length * 100);
            html += '<div class="distro-row"><div class="distro-label">' + c + '</div><div class="distro-bar-wrap"><div class="distro-bar" style="width:' + pct + '%;background:' + config.colors[c] + '"><span>' + cnt.toLocaleString() + ' (' + pct + '%)</span></div></div></div>';
        }
        
        $('distro').innerHTML = html;
    }
    
    function setupEventListeners() {
        // 搜索
        var searchTimeout;
        $('search').addEventListener('input', function() {
            var v = this.value;
            $('search-clear').classList.toggle('show', v.length > 0);
            
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(function() {
                state.query = v;
                if (v) renderSuggestions(v);
                else $('search-suggestions').classList.remove('show');
                fullRender();
            }, 200);
        });
        
        $('search').addEventListener('focus', function() {
            if (this.value) renderSuggestions(this.value);
        });
        
        $('search-clear').addEventListener('click', function() {
            $('search').value = '';
            this.classList.remove('show');
            $('search-suggestions').classList.remove('show');
            state.query = '';
            fullRender();
            $('search').focus();
        });
        
        // 点击外部关闭建议
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-suggestions') && !e.target.closest('.search-wrap')) {
                $('search-suggestions').classList.remove('show');
            }
            if (!e.target.closest('.export-dropdown')) {
                $('export-menu').classList.remove('show');
            }
            if (!e.target.closest('.term-card')) {
                $$('.term-card.expanded').forEach(function(c) { c.classList.remove('expanded'); });
            }
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', function(e) {
            var tg = e.target.tagName;
            if (tg === 'INPUT' || tg === 'TEXTAREA') {
                if (e.key === 'Escape') {
                    $('search').value = '';
                    $('search-clear').classList.remove('show');
                    $('search-suggestions').classList.remove('show');
                    state.query = '';
                    fullRender();
                    $('search').blur();
                }
                return;
            }
            
            if (e.key === '/') { e.preventDefault(); $('search').focus(); }
            if (e.key === 'Escape') FolkloreApp.resetAll();
            if (e.key === 'd' || e.key === 'D') FolkloreApp.toggleTheme();
            if (e.key === 'g' || e.key === 'G') FolkloreApp.toggleView('grid');
            if (e.key === 'l' || e.key === 'L') FolkloreApp.toggleView('list');
            if (e.key === 'c' || e.key === 'C') FolkloreApp.toggleView('compact');
            if (e.key === 's' || e.key === 'S') { e.preventDefault(); FolkloreApp.toggleSort(); }
            if (e.key === '?') { e.preventDefault(); FolkloreApp.toggleHelp(); }
        });
        
        // 滚动加载
        var scrollTimer;
        window.addEventListener('scroll', function() {
            $('back-top').classList.toggle('show', window.scrollY > 600);
            
            var btn = $('load-more').querySelector('.load-more-btn');
            if (!btn || btn.disabled) return;
            
            var rect = btn.getBoundingClientRect();
            if (rect.top < window.innerHeight + 300) {
                clearTimeout(scrollTimer);
                scrollTimer = setTimeout(doLoadMore, 200);
            }
        }, { passive: true });
        
        // 加载更多
        $('load-more').addEventListener('click', function(e) {
            if (e.target.closest('.load-more-btn')) doLoadMore();
        });
    }
    
    function doLoadMore() {
        var btn = $('load-more').querySelector('.load-more-btn');
        if (!btn || btn.disabled) return;
        
        btn.disabled = true;
        btn.textContent = '加载中…';
        state.loaded = Math.min(state.loaded + config.batchSize, state.filtered.length);
        renderCards(false);
    }
    
    // 公开API
    return {
        init: init,
        selectCat: function(c) {
            state.cat = c;
            state.sub = null;
            state.t3 = null;
            renderCategories();
            renderSubcategories();
            renderT3();
            fullRender();
        },
        selectSub: function(s) {
            state.sub = s;
            state.t3 = null;
            renderSubcategories();
            renderT3();
            fullRender();
        },
        selectT3: function(t) {
            state.t3 = t;
            renderT3();
            fullRender();
        },
        toggleCard: function(card) {
            var was = card.classList.contains('expanded');
            $$('.term-card.expanded').forEach(function(c) {
                if (c !== card) c.classList.remove('expanded');
            });
            if (!was) card.classList.add('expanded');
            else card.classList.remove('expanded');
        },
        toggleView: function(v) {
            state.view = v;
            fullRender();
            $('sort-btn').style.display = (v === 'compact' ? 'none' : '');
        },
        toggleSort: function() {
            state.sort = state.sort === 'name' ? 'category' : 'name';
            $('sort-label').textContent = state.sort === 'name' ? '名称' : '分类';
            fullRender();
        },
        toggleTheme: function() {
            var r = document.documentElement;
            r.classList.toggle('dark');
            var is = r.classList.contains('dark');
            localStorage.setItem('ftheme', is ? 'dark' : 'light');
            $('theme-btn').textContent = is ? '☀' : '🌙';
        },
        toggleHelp: function() {
            var h = $('kbd-hint');
            var was = h.classList.contains('show');
            h.classList.toggle('show', !was);
            if (!was) setTimeout(function() { h.classList.remove('show'); }, 3000);
        },
        toggleFav: function(btn, cn) {
            var idx = state.favorites.indexOf(cn);
            if (idx === -1) {
                state.favorites.push(cn);
                btn.classList.add('favorited');
                toast('已收藏');
            } else {
                state.favorites.splice(idx, 1);
                btn.classList.remove('favorited');
                toast('已取消收藏');
            }
            saveFavorites();
        },
        copyCard: function(btn) {
            var card = btn.closest('.term-card');
            var cn = card.querySelector('.term-name').childNodes[0].textContent.trim();
            var found = state.data.find(function(t) { return t[0] === cn; });
            if (!found) return;
            
            var text = found[0] + (found[1] ? ' (' + found[1] + ')' : '') + '\n' + found[2] + '\n\n——' + found[3] + ' › ' + found[4] + ' › ' + found[5];
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function() {
                    btn.classList.add('copied');
                    btn.textContent = '✓';
                    setTimeout(function() {
                        btn.classList.remove('copied');
                        btn.textContent = '📋';
                    }, 1500);
                    toast('已复制到剪贴板');
                });
            }
        },
        selectSuggestion: function(cn) {
            $('search').value = cn;
            $('search-suggestions').classList.remove('show');
            addToHistory(cn);
            state.query = cn;
            fullRender();
        },
        toggleExportMenu: function() {
            $('export-menu').classList.toggle('show');
        },
        exportCSV: exportCSV,
        exportJSON: exportJSON,
        exportMarkdown: exportMarkdown,
        toast: toast,
        compareTerms: compareTerms,
        closeCompare: function() {
            var modal = document.getElementById('compare-modal');
            if (modal) modal.remove();
        },
        getAPIEndpoint: getAPIEndpoint,
        getStats: getStats,
        resetAll: function() {
            state.cat = null;
            state.sub = null;
            state.t3 = null;
            state.query = '';
            state.loaded = config.batchSize;
            $('search').value = '';
            $('search-clear').classList.remove('show');
            $('search-suggestions').classList.remove('show');
            renderCategories();
            renderSubcategories();
            renderT3();
            $('term-grid').innerHTML = '';
            renderCards(true);
        }
    };
})();