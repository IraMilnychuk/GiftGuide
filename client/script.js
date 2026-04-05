new Vue({
  el: '#app',
  data: {
    // === НАВІГАЦІЯ ===
    appLoaded: false,
    currentPage: 'home',
    searchQuery: '',
    showSuggestions: false,
    randomMode: false,
    randomProduct: null,
    selectedFilters: {
      'Кому': [],
      'Привід': [],
      'Інтереси': [],
      'Тип подарунка': [],
      'Стосунки': [],
      'Ідеї': []
    },
    priceMin: null,
    priceMax: null,
    selectedAge: null,
    ageRanges: [],

    // Довідники для модального вікна
    genders: [],
    occasions: [],
    interestsList: [],
    giftTypes: [],
    relationships: [],
    tags: [],

    // Вибрані значення для модального вікна
    selectedAgeId: null,
    selectedAgeName: '',
    selectedGenderId: null,
    selectedGenderName: '',
    selectedPriceRange: null,
    selectedPriceMin: null,
    selectedPriceMax: null,
    selectedOccasionId: null,
    selectedOccasionName: '',
    selectedInterestId: null,
    selectedInterestName: '',
    selectedGiftTypeId: null,
    selectedGiftTypeName: '',
    selectedRelationshipId: null,
    selectedRelationshipName: '',
    selectedTagId: null,
    selectedTagName: '',

    // Стани відкриття dropdown
    ageDropdownOpen: false,
    genderDropdownOpen: false,
    priceDropdownOpen: false,
    occasionDropdownOpen: false,
    interestDropdownOpen: false,
    giftTypeDropdownOpen: false,
    relationshipDropdownOpen: false,
    tagDropdownOpen: false,

    // Таймери
    ageCloseTimer: null,
    genderCloseTimer: null,
    priceCloseTimer: null,
    occasionCloseTimer: null,
    interestCloseTimer: null,
    giftTypeCloseTimer: null,
    relationshipCloseTimer: null,
    tagCloseTimer: null,

    searchResults: [],
    searchAttempted: false,
    searchResultsMode: false,

    // Авторизація
    isLoggedIn: false,
    userName: '',
    authEmail: '',
    authPassword: '',
    authName: '',
    token: null,

    // Товари
    allProducts: [],
    loading: false,
    activeIndex: 1,
    autoInterval: null,
    favoriteIds: [],
    favorites: [],

    // Відгуки
    reviewComment: '',
    reviewRating: 0,
    productReviews: [],

    // Горизонтальні фільтри
    filters: [
      { label: 'Кому', options: ['Для неї', 'Для нього', 'Дітям', 'Батькам', 'Друзям', 'Колегам'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Привід', options: ['День народження', 'Новий рік', 'Річниця', 'День святого Валентина', '8 Березня', 'Подарунок без приводу', 'Весілля', 'Ювілей'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Інтереси', options: ['Спорт', 'Книги', 'Технології', 'Краса та догляд', 'Кулінарія', 'Подорожі', 'Ігри', 'Музика'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Тип подарунка', options: ['Практичний', 'Емоційний (враження)', 'Сувенірний', 'Романтичний', 'Оригінальний', 'DIY / handmade'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Стосунки', options: ['Коханий / Кохана', 'Друг / Подруга', 'Чоловік / Дружина', 'Мама / Тато', 'Брат / Сестра', 'Колега', 'Керівник'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Ідеї', options: ['Популярні подарунки', 'Новинки', 'Недорогі подарунки', 'Подарунки до 500 грн', 'Оригінальні ідеї', 'Сертифікати', 'Випадковий подарунок'], selected: '', isOpen: false, closeTimer: null }
    ],

    categoryList: ['Для неї', 'Для нього', 'Друзям', 'Колегам', 'Дітям', 'Батькам'],

    modalFilters: [
      { label: 'Кому', options: ['Для неї', 'Для нього', 'Дітям', 'Батькам', 'Друзям', 'Колегам'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Привід', options: ['День народження', 'Новий рік', 'Річниця', 'День святого Валентина', '8 Березня', 'Подарунок без приводу', 'Весілля', 'Ювілей'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Інтереси', options: ['Спорт', 'Книги', 'Технології', 'Краса та догляд', 'Кулінарія', 'Подорожі', 'Ігри', 'Музика'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Тип подарунка', options: ['Практичний', 'Емоційний (враження)', 'Сувенірний', 'Романтичний', 'Оригінальний', 'DIY / handmade'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Стосунки', options: ['Коханий / Кохана', 'Друг / Подруга', 'Чоловік / Дружина', 'Мама / Тато', 'Брат / Сестра', 'Колега', 'Керівник'], selected: '', isOpen: false, closeTimer: null }
    ],

    showModal: false,
    showAuthModal: false,
    authMode: 'login',
    showProductModal: false,
    selectedProduct: null,
    currentImageIndex: 0
  },

  computed: {
    filteredProducts() {
      if (this.randomMode && this.randomProduct) return [this.randomProduct];
      let products = [...this.allProducts];
      for (let filterKey in this.selectedFilters) {
        const selectedValues = this.selectedFilters[filterKey];
        if (selectedValues && selectedValues.length) {
          if (filterKey === 'Ідеї') {
            for (let idea of selectedValues) {
              if (idea === 'Випадковий подарунок') continue;
              switch (idea) {
                case 'Популярні подарунки': products = products.filter(p => p.rating >= 4.5); break;
                case 'Новинки': const maxId = Math.max(...products.map(p => p.id)); products = products.filter(p => p.id > maxId - 10); break;
                case 'Недорогі подарунки': products = products.filter(p => p.price < 500); break;
                case 'Подарунки до 500 грн': products = products.filter(p => p.price <= 500); break;
                case 'Оригінальні ідеї': products = products.filter(p => p.gift_type_ids && p.gift_type_ids.includes(5)); break;
                case 'Сертифікати': products = products.filter(p => p.title.toLowerCase().includes('сертифікат')); break;
              }
            }
          } else {
            const fieldMap = { 'Кому':'recipient_ids', 'Привід':'occasion_ids', 'Інтереси':'interest_ids', 'Тип подарунка':'gift_type_ids', 'Стосунки':'relationship_ids' };
            const arrayField = fieldMap[filterKey];
            if (arrayField) {
              let idMap;
              switch (filterKey) {
                case 'Кому': idMap = this.getRecipientIdMap(); break;
                case 'Привід': idMap = this.getOccasionIdMap(); break;
                case 'Інтереси': idMap = this.getInterestIdMap(); break;
                case 'Тип подарунка': idMap = this.getGiftTypeIdMap(); break;
                case 'Стосунки': idMap = this.getRelationshipIdMap(); break;
                default: idMap = {};
              }
              const selectedIds = selectedValues.map(v => idMap[v]).filter(id => id);
              if (selectedIds.length) products = products.filter(p => { const productIds = p[arrayField] || []; return selectedIds.some(id => productIds.includes(id)); });
            }
          }
        }
      }
      if (this.priceMin !== null && this.priceMin !== '') products = products.filter(p => p.price >= this.priceMin);
      if (this.priceMax !== null && this.priceMax !== '') products = products.filter(p => p.price <= this.priceMax);
      if (this.selectedAge) products = products.filter(p => p.age_range_ids && p.age_range_ids.includes(parseInt(this.selectedAge)));
      if (this.searchQuery) { const q = this.searchQuery.toLowerCase(); products = products.filter(p => p.title.toLowerCase().includes(q)); }
      return products;
    },
    popularProducts() {
      const targetImages = ['1.png','2.png','3.png','4.png','5.png','6.png','7.png','8.png','9.png','10.png'];
      const result = [];
      for (const img of targetImages) { const product = this.allProducts.find(p => p.image === img); if (product) result.push(product); }
      return result;
    },
    popularCards() {
      if (!this.popularProducts.length) return [];
      const total = this.popularProducts.length;
      const left = this.popularProducts[(this.activeIndex - 1 + total) % total];
      const center = this.popularProducts[this.activeIndex];
      const right = this.popularProducts[(this.activeIndex + 1) % total];
      return [left, center, right];
    },
    searchSuggestions() {
      if (!this.searchQuery.trim()) return [];
      const query = this.searchQuery.toLowerCase();
      const matches = this.allProducts.filter(p => p.title.toLowerCase().includes(query));
      return matches.slice(0, 5);
    }
  },

  async mounted() {
    this.restoreState();
    this.startAutoSlide();
    document.addEventListener('click', this.handleClickOutside);
    this.loadToken();
    await this.fetchProducts();
    await this.loadAllReferenceData();
    if (this.token) await this.loadFavorites();
    this.appLoaded = true;
  },

  beforeDestroy() {
    clearInterval(this.autoInterval);
    document.removeEventListener('click', this.handleClickOutside);
    this.saveState();
  },

  methods: {
    // === ЗБЕРЕЖЕННЯ ТА ВІДНОВЛЕННЯ СТАНУ ===
    saveState() {
      const state = {
        currentPage: this.currentPage,
        searchQuery: this.searchQuery,
        selectedFilters: this.selectedFilters,
        priceMin: this.priceMin,
        priceMax: this.priceMax,
        selectedAge: this.selectedAge,
        randomMode: this.randomMode,
        randomProduct: this.randomProduct ? { id: this.randomProduct.id } : null
      };
      localStorage.setItem('giftguide_state', JSON.stringify(state));
    },
    restoreState() {
      const saved = localStorage.getItem('giftguide_state');
      if (saved) {
        try {
          const state = JSON.parse(saved);
          this.currentPage = state.currentPage || 'home';
          this.searchQuery = state.searchQuery || '';
          this.selectedFilters = state.selectedFilters || { 'Кому': [], 'Привід': [], 'Інтереси': [], 'Тип подарунка': [], 'Стосунки': [], 'Ідеї': [] };
          this.priceMin = state.priceMin;
          this.priceMax = state.priceMax;
          this.selectedAge = state.selectedAge;
          this.randomMode = state.randomMode || false;
          if (state.randomProduct && this.randomMode) {
            this.randomProductId = state.randomProduct.id;
          }
        } catch(e) { console.error('Помилка відновлення стану', e); }
      }
    },
    afterProductsLoaded() {
      if (this.randomMode && this.randomProductId) {
        const product = this.allProducts.find(p => p.id === this.randomProductId);
        if (product) this.randomProduct = product;
        this.randomProductId = null;
      }
    },

    // === ЗАВАНТАЖЕННЯ ДОВІДНИКІВ ===
    async loadAllReferenceData() {
      const endpoints = [
        { name: 'ageRanges', url: 'http://localhost:5000/api/admin/age-ranges', target: 'ageRanges' },
        { name: 'genders', url: 'http://localhost:5000/api/admin/genders', target: 'genders' },
        { name: 'occasions', url: 'http://localhost:5000/api/admin/occasions', target: 'occasions' },
        { name: 'interests', url: 'http://localhost:5000/api/admin/interests', target: 'interestsList' },
        { name: 'giftTypes', url: 'http://localhost:5000/api/admin/gift-types', target: 'giftTypes' },
        { name: 'relationships', url: 'http://localhost:5000/api/admin/relationships', target: 'relationships' },
        { name: 'tags', url: 'http://localhost:5000/api/admin/tags', target: 'tags' }
      ];
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep.url);
          if (res.ok) this[ep.target] = await res.json();
          else console.error(`Помилка завантаження ${ep.name}: статус ${res.status}`);
        } catch(e) { console.error(`Помилка завантаження ${ep.name}:`, e); }
      }
    },

    loadToken() {
      const token = localStorage.getItem('token');
      if (token) {
        this.token = token;
        this.isLoggedIn = true;
        this.userName = localStorage.getItem('userName') || 'Користувач';
        this.authEmail = localStorage.getItem('userEmail') || '';
      }
    },
    saveToken(token, user) {
      this.token = token;
      this.isLoggedIn = true;
      this.userName = user.name;
      this.authEmail = user.email;
      localStorage.setItem('token', token);
      localStorage.setItem('userName', user.name);
      localStorage.setItem('userEmail', user.email);
    },
    clearToken() {
      this.token = null;
      this.isLoggedIn = false;
      this.userName = '';
      this.authEmail = '';
      localStorage.removeItem('token');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
    },

    async fetchProducts() {
      this.loading = true;
      try {
        const headers = this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
        const response = await fetch('http://localhost:5000/api/products', { headers });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        this.allProducts = data.map(p => ({
          id: p.id, title: p.title, description: p.description, price: parseFloat(p.price), oldPrice: p.old_price ? parseFloat(p.old_price) : null, rating: parseFloat(p.rating), image: p.image,
          images: (Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : [])).map(img => 'img/' + img), link: p.link,
          recipient_ids: p.recipient_ids || [], occasion_ids: p.occasion_ids || [], gift_type_ids: p.gift_type_ids || [], relationship_ids: p.relationship_ids || [],
          age_range_ids: p.age_range_ids || [], gender_ids: p.gender_ids || [], character_ids: p.character_ids || [], interest_ids: p.interest_ids || [], tag_ids: p.tag_ids || [], created_at: p.created_at
        }));
        console.log('Завантажено товарів:', this.allProducts.length);
        this.afterProductsLoaded();
        this.saveState();
      } catch (error) { console.error('Помилка завантаження товарів:', error); alert('Не вдалося завантажити товари. Перевірте сервер.'); } finally { this.loading = false; }
    },

    async loadFavorites() { if (!this.token) return; try { const response = await fetch('http://localhost:5000/api/favorites', { headers: { 'Authorization': `Bearer ${this.token}` } }); if (response.ok) { const data = await response.json(); this.favoriteIds = data.favorites || []; this.favorites = this.allProducts.filter(p => this.favoriteIds.includes(p.id)); } } catch (err) { console.error(err); } },
    async addToFavorites(product) { if (!this.isLoggedIn) { this.promptLogin(); return; } if (this.favoriteIds.includes(product.id)) { alert('Цей товар вже у вашому списку обраних.'); return; } try { const response = await fetch('http://localhost:5000/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` }, body: JSON.stringify({ productId: product.id }) }); if (response.ok) { this.favoriteIds.push(product.id); this.favorites.push(product); alert('Товар додано в обране!'); } else { const err = await response.json(); alert(err.message || 'Помилка додавання'); } } catch (err) { console.error(err); alert('Помилка з\'єднання'); } },
    async removeFromFavorites(product) { if (!this.isLoggedIn) return; try { const response = await fetch(`http://localhost:5000/api/favorites/${product.id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${this.token}` } }); if (response.ok) { const idx = this.favoriteIds.indexOf(product.id); if (idx !== -1) this.favoriteIds.splice(idx, 1); const favIdx = this.favorites.findIndex(f => f.id === product.id); if (favIdx !== -1) this.favorites.splice(favIdx, 1); alert('Товар видалено з обраного.'); } else { alert('Помилка видалення'); } } catch (err) { console.error(err); alert('Помилка з\'єднання'); } },

    async updateRating(product, star) {
      if (!this.isLoggedIn) {
        this.promptLogin();
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/ratings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ productId: product.id, rating: star })
        });
        if (response.ok) {
          const data = await response.json();
          const newAverage = parseFloat(data.average);
          product.rating = newAverage;
          const originalProduct = this.allProducts.find(p => p.id === product.id);
          if (originalProduct) originalProduct.rating = newAverage;
          this.$forceUpdate();
          alert(`Ви оцінили товар на ${star} зірок. Середній рейтинг: ${newAverage}`);
        } else {
          const err = await response.json();
          alert(err.message || 'Помилка оцінювання');
        }
      } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання');
      }
    },

    async fetchReviews(productId) { try { const response = await fetch(`http://localhost:5000/api/reviews/${productId}`); if (response.ok) this.productReviews = await response.json(); else this.productReviews = []; } catch (err) { console.error(err); this.productReviews = []; } },
    async submitReview() { if (!this.isLoggedIn) { this.promptLogin(); return; } if (!this.reviewRating || !this.reviewComment.trim()) { alert('Будь ласка, поставте оцінку та напишіть коментар.'); return; } try { const response = await fetch('http://localhost:5000/api/reviews', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.token}` }, body: JSON.stringify({ productId: this.selectedProduct.id, rating: this.reviewRating, comment: this.reviewComment.trim() }) }); if (response.ok) { alert('Відгук додано!'); this.reviewComment = ''; this.reviewRating = 0; await this.fetchReviews(this.selectedProduct.id); await this.fetchProducts(); } else { const err = await response.json(); alert(err.message || 'Помилка додавання відгуку'); } } catch (err) { console.error(err); alert('Помилка з\'єднання'); } },

    async submitAuth() {
      const url = this.authMode === 'login' ? 'http://localhost:5000/api/auth/login' : 'http://localhost:5000/api/auth/register';
      const body = this.authMode === 'login' ? { email: this.authEmail, password: this.authPassword } : { name: this.authName, email: this.authEmail, password: this.authPassword };
      try {
        const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        const data = await response.json();
        if (response.ok) {
          this.saveToken(data.token, data.user);
          alert(this.authMode === 'login' ? 'Вхід виконано' : 'Реєстрація виконана');
          this.closeAuthModal();
          await this.fetchProducts();
          await this.loadFavorites();
          this.saveState();
        } else {
          alert(data.message || 'Помилка');
        }
      } catch (err) { console.error(err); alert('Помилка з\'єднання з сервером'); }
    },
    logout() {
      this.clearToken();
      this.favorites = [];
      this.favoriteIds = [];
      alert('Ви вийшли з облікового запису.');
      this.currentPage = 'home';
      this.goHome();
    },

    getRecipientIdMap() { return {'Для неї':1,'Для нього':2,'Дітям':3,'Батькам':4,'Друзям':5,'Колегам':6}; },
    getOccasionIdMap() { return {'День народження':1,'Новий рік':2,'Річниця':3,'День святого Валентина':4,'8 Березня':5,'Подарунок без приводу':6,'Весілля':7,'Ювілей':8}; },
    getGiftTypeIdMap() { return {'Практичний':1,'Емоційний (враження)':2,'Сувенірний':3,'Романтичний':4,'Оригінальний':5,'DIY / handmade':6}; },
    getRelationshipIdMap() { return {'Коханий / Кохана':1,'Друг / Подруга':2,'Чоловік / Дружина':3,'Мама / Тато':4,'Брат / Сестра':5,'Колега':6,'Керівник':7}; },
    getInterestIdMap() { return {'Спорт':1,'Книги':2,'Технології':3,'Краса та догляд':4,'Кулінарія':5,'Подорожі':6,'Ігри':7,'Музика':8}; },

    goHome() {
      this.currentPage = 'home';
      this.searchQuery = '';
      this.randomMode = false;
      this.randomProduct = null;
      this.selectedFilters = { 'Кому': [], 'Привід': [], 'Інтереси': [], 'Тип подарунка': [], 'Стосунки': [], 'Ідеї': [] };
      this.priceMin = null; this.priceMax = null; this.selectedAge = null;
      this.saveState();
    },
    goToCabinet() {
      if (!this.isLoggedIn) {
        this.promptLogin();
        return;
      }
      this.currentPage = 'cabinet';
    },
    clearRandomMode() { this.randomMode = false; this.randomProduct = null; this.selectedFilters['Ідеї'] = []; this.saveState(); this.$forceUpdate(); },
    
    goToCatalogWithFilter(filterType, value) {
      this.selectedFilters = { 'Кому': [], 'Привід': [], 'Інтереси': [], 'Тип подарунка': [], 'Стосунки': [], 'Ідеї': [] };
      this.randomMode = false; this.randomProduct = null; this.priceMin = null; this.priceMax = null; this.selectedAge = null;
      if (filterType === 'recipient') this.selectedFilters['Кому'] = [value];
      this.currentPage = 'catalog';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.saveState();
    },
    
    applyFilterAndGoToCatalog(idx, option) {
      const label = this.filters[idx].label;
      if (label === 'Ідеї' && option === 'Випадковий подарунок') {
        this.selectedFilters = { 'Кому': [], 'Привід': [], 'Інтереси': [], 'Тип подарунка': [], 'Стосунки': [], 'Ідеї': [] };
        if (this.allProducts.length > 0) this.randomProduct = this.allProducts[Math.floor(Math.random() * this.allProducts.length)];
        else this.randomProduct = null;
        this.randomMode = true; this.currentPage = 'catalog';
      } else {
        this.randomMode = false; this.randomProduct = null;
        this.selectedFilters = { 'Кому': [], 'Привід': [], 'Інтереси': [], 'Тип подарунка': [], 'Стосунки': [], 'Ідеї': [] };
        this.selectedFilters[label] = [option];
        this.currentPage = 'catalog';
      }
      this.closeAllDropdowns();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      this.saveState();
    },
    
    applyFilters() { 
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      this.saveState(); 
    },
    
    applySearch() { if (this.searchQuery.trim()) this.currentPage = 'catalog'; this.saveState(); },
    closeAllDropdowns() { this.filters.forEach(f => { f.isOpen = false; if (f.closeTimer) clearTimeout(f.closeTimer); }); },
    onSearchInput() { this.showSuggestions = true; },
    hideSuggestionsDelayed() { setTimeout(() => { this.showSuggestions = false; }, 200); },
    
    // ВИПРАВЛЕНИЙ МЕТОД selectSearchSuggestion
    selectSearchSuggestion(title) {
        this.searchQuery = title;
        this.showSuggestions = false;
       
        this.selectedFilters = {
            'Кому': [],
            'Привід': [],
            'Інтереси': [],
            'Тип подарунка': [],
            'Стосунки': [],
            'Ідеї': []
        };
        this.priceMin = null;
        this.priceMax = null;
        this.selectedAge = null;
        this.randomMode = false;
        this.randomProduct = null;
        this.currentPage = 'catalog';
        this.saveState();
        this.$nextTick(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    },

    nextCard() { if (this.popularProducts.length === 0) return; this.activeIndex++; if (this.activeIndex >= this.popularProducts.length) this.activeIndex = 0; },
    prevCard() { if (this.popularProducts.length === 0) return; this.activeIndex--; if (this.activeIndex < 0) this.activeIndex = this.popularProducts.length - 1; },
    startAutoSlide() { if (this.autoInterval) clearInterval(this.autoInterval); this.autoInterval = setInterval(() => this.nextCard(), 4000); },
    pauseAutoSlide() { clearInterval(this.autoInterval); this.autoInterval = null; },

    getStarClass(rating, starIndex) {
      if (rating >= starIndex) return 'full';
      if (rating >= starIndex - 0.5 && rating < starIndex) return 'half';
      return '';
    },

    promptLogin() { alert('Ця функція доступна тільки для зареєстрованих користувачів. Будь ласка, увійдіть або зареєструйтесь.'); this.openAuthModal('login'); },

    openDropdown(index) {
      this.filters.forEach((f, i) => { if (i !== index && f.isOpen) { clearTimeout(f.closeTimer); f.isOpen = false; } });
      if (this.filters[index].closeTimer) clearTimeout(this.filters[index].closeTimer);
      this.filters[index].isOpen = true;
    },
    scheduleClose(index) { this.filters[index].closeTimer = setTimeout(() => { this.filters[index].isOpen = false; }, 200); },
    cancelClose(index) { if (this.filters[index].closeTimer) clearTimeout(this.filters[index].closeTimer); },
    selectOption(index, option) { this.filters[index].selected = option; this.filters[index].isOpen = false; this.saveState(); },

    handleClickOutside(event) {
      if (!event.target.closest('.filter-item')) { this.filters.forEach(f => { if (f.isOpen) f.isOpen = false; if (f.closeTimer) clearTimeout(f.closeTimer); }); }
      if (!event.target.closest('.modal-filter-item')) {
        this.ageDropdownOpen = false; this.genderDropdownOpen = false; this.priceDropdownOpen = false; this.occasionDropdownOpen = false;
        this.interestDropdownOpen = false; this.giftTypeDropdownOpen = false; this.relationshipDropdownOpen = false; this.tagDropdownOpen = false;
        if (this.ageCloseTimer) clearTimeout(this.ageCloseTimer); if (this.genderCloseTimer) clearTimeout(this.genderCloseTimer);
        if (this.priceCloseTimer) clearTimeout(this.priceCloseTimer); if (this.occasionCloseTimer) clearTimeout(this.occasionCloseTimer);
        if (this.interestCloseTimer) clearTimeout(this.interestCloseTimer); if (this.giftTypeCloseTimer) clearTimeout(this.giftTypeCloseTimer);
        if (this.relationshipCloseTimer) clearTimeout(this.relationshipCloseTimer); if (this.tagCloseTimer) clearTimeout(this.tagCloseTimer);
      }
      if (!event.target.closest('.header-search')) this.showSuggestions = false;
    },

    // === DROPDOWN МОДАЛЬНОГО ВІКНА (основні фільтри) ===
    openModalDropdown(idx) {
      this.modalFilters.forEach((f, i) => {
        if (i !== idx && f.isOpen) {
          clearTimeout(f.closeTimer);
          f.isOpen = false;
        }
      });
      if (this.modalFilters[idx].closeTimer) clearTimeout(this.modalFilters[idx].closeTimer);
      this.modalFilters[idx].isOpen = true;
    },
    scheduleModalClose(idx) {
      this.modalFilters[idx].closeTimer = setTimeout(() => {
        this.modalFilters[idx].isOpen = false;
      }, 200);
    },
    cancelModalClose(idx) {
      if (this.modalFilters[idx].closeTimer) clearTimeout(this.modalFilters[idx].closeTimer);
    },
    selectModalOption(idx, option) {
      this.modalFilters[idx].selected = option;
      this.modalFilters[idx].isOpen = false;
    },

    // Дропдауни для ціни та віку
    openPriceDropdown() {
      if (this.priceCloseTimer) clearTimeout(this.priceCloseTimer);
      this.priceDropdownOpen = true;
    },
    schedulePriceClose() {
      this.priceCloseTimer = setTimeout(() => {
        this.priceDropdownOpen = false;
      }, 200);
    },
    cancelPriceClose() {
      if (this.priceCloseTimer) clearTimeout(this.priceCloseTimer);
    },
    selectPriceRange(rangeText) {
      this.selectedPriceRange = rangeText;
      if (!rangeText) {
        this.selectedPriceMin = null;
        this.selectedPriceMax = null;
      } else if (rangeText === 'до 500 грн') {
        this.selectedPriceMin = 0; this.selectedPriceMax = 500;
      } else if (rangeText === '500-1000 грн') {
        this.selectedPriceMin = 500; this.selectedPriceMax = 1000;
      } else if (rangeText === '1000-2000 грн') {
        this.selectedPriceMin = 1000; this.selectedPriceMax = 2000;
      } else if (rangeText === '2000+ грн') {
        this.selectedPriceMin = 2000; this.selectedPriceMax = null;
      }
      this.priceDropdownOpen = false;
    },

    openAgeDropdown() {
      if (this.ageCloseTimer) clearTimeout(this.ageCloseTimer);
      this.ageDropdownOpen = true;
    },
    scheduleAgeClose() {
      this.ageCloseTimer = setTimeout(() => {
        this.ageDropdownOpen = false;
      }, 200);
    },
    cancelAgeClose() {
      if (this.ageCloseTimer) clearTimeout(this.ageCloseTimer);
    },
    selectAgeRange(id, name) {
      this.selectedAgeId = id;
      this.selectedAgeName = name || '';
      this.ageDropdownOpen = false;
    },

    // Дропдауни для інших фільтрів
    openGenderDropdown() { if (this.genderCloseTimer) clearTimeout(this.genderCloseTimer); this.genderDropdownOpen = true; },
    scheduleGenderClose() { this.genderCloseTimer = setTimeout(() => { this.genderDropdownOpen = false; }, 200); },
    cancelGenderClose() { if (this.genderCloseTimer) clearTimeout(this.genderCloseTimer); },
    selectGender(id, name) { this.selectedGenderId = id; this.selectedGenderName = name || ''; this.genderDropdownOpen = false; },

    openOccasionDropdown() { if (this.occasionCloseTimer) clearTimeout(this.occasionCloseTimer); this.occasionDropdownOpen = true; },
    scheduleOccasionClose() { this.occasionCloseTimer = setTimeout(() => { this.occasionDropdownOpen = false; }, 200); },
    cancelOccasionClose() { if (this.occasionCloseTimer) clearTimeout(this.occasionCloseTimer); },
    selectOccasion(id, name) { this.selectedOccasionId = id; this.selectedOccasionName = name || ''; this.occasionDropdownOpen = false; },

    openInterestDropdown() { if (this.interestCloseTimer) clearTimeout(this.interestCloseTimer); this.interestDropdownOpen = true; },
    scheduleInterestClose() { this.interestCloseTimer = setTimeout(() => { this.interestDropdownOpen = false; }, 200); },
    cancelInterestClose() { if (this.interestCloseTimer) clearTimeout(this.interestCloseTimer); },
    selectInterest(id, name) { this.selectedInterestId = id; this.selectedInterestName = name || ''; this.interestDropdownOpen = false; },

    openGiftTypeDropdown() { if (this.giftTypeCloseTimer) clearTimeout(this.giftTypeCloseTimer); this.giftTypeDropdownOpen = true; },
    scheduleGiftTypeClose() { this.giftTypeCloseTimer = setTimeout(() => { this.giftTypeDropdownOpen = false; }, 200); },
    cancelGiftTypeClose() { if (this.giftTypeCloseTimer) clearTimeout(this.giftTypeCloseTimer); },
    selectGiftType(id, name) { this.selectedGiftTypeId = id; this.selectedGiftTypeName = name || ''; this.giftTypeDropdownOpen = false; },

    openRelationshipDropdown() { if (this.relationshipCloseTimer) clearTimeout(this.relationshipCloseTimer); this.relationshipDropdownOpen = true; },
    scheduleRelationshipClose() { this.relationshipCloseTimer = setTimeout(() => { this.relationshipDropdownOpen = false; }, 200); },
    cancelRelationshipClose() { if (this.relationshipCloseTimer) clearTimeout(this.relationshipCloseTimer); },
    selectRelationship(id, name) { this.selectedRelationshipId = id; this.selectedRelationshipName = name || ''; this.relationshipDropdownOpen = false; },

    openTagDropdown() { if (this.tagCloseTimer) clearTimeout(this.tagCloseTimer); this.tagDropdownOpen = true; },
    scheduleTagClose() { this.tagCloseTimer = setTimeout(() => { this.tagDropdownOpen = false; }, 200); },
    cancelTagClose() { if (this.tagCloseTimer) clearTimeout(this.tagCloseTimer); },
    selectTag(id, name) { this.selectedTagId = id; this.selectedTagName = name || ''; this.tagDropdownOpen = false; },

    // Модальне вікно підбору
    openModal() {
      this.selectedAgeId = null; this.selectedAgeName = '';
      this.selectedGenderId = null; this.selectedGenderName = '';
      this.selectedPriceRange = null; this.selectedPriceMin = null; this.selectedPriceMax = null;
      this.selectedOccasionId = null; this.selectedOccasionName = '';
      this.selectedInterestId = null; this.selectedInterestName = '';
      this.selectedGiftTypeId = null; this.selectedGiftTypeName = '';
      this.selectedRelationshipId = null; this.selectedRelationshipName = '';
      this.selectedTagId = null; this.selectedTagName = '';
      this.searchResults = [];
      this.searchAttempted = false;
      this.searchResultsMode = false;
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.searchResults = [];
      this.searchAttempted = false;
      this.searchResultsMode = false;
      this.ageDropdownOpen = false; this.genderDropdownOpen = false; this.priceDropdownOpen = false; this.occasionDropdownOpen = false;
      this.interestDropdownOpen = false; this.giftTypeDropdownOpen = false; this.relationshipDropdownOpen = false; this.tagDropdownOpen = false;
    },

    backToFilters() { this.searchResultsMode = false; },

    findGift() {
      let results = [...this.allProducts];
      if (this.selectedPriceMin !== null || this.selectedPriceMax !== null) {
        results = results.filter(p => {
          if (this.selectedPriceMin !== null && p.price < this.selectedPriceMin) return false;
          if (this.selectedPriceMax !== null && p.price > this.selectedPriceMax) return false;
          return true;
        });
      }
      if (this.selectedAgeId) results = results.filter(p => p.age_range_ids && p.age_range_ids.includes(this.selectedAgeId));
      if (this.selectedGenderId) results = results.filter(p => p.gender_ids && p.gender_ids.includes(this.selectedGenderId));
      if (results.length === 0) {
        this.searchResults = [];
        this.searchAttempted = true;
        this.searchResultsMode = true;
        return;
      }
      const productScores = results.map(product => {
        let score = 0;
        if (this.selectedOccasionId && product.occasion_ids && product.occasion_ids.includes(this.selectedOccasionId)) score++;
        if (this.selectedInterestId && product.interest_ids && product.interest_ids.includes(this.selectedInterestId)) score++;
        if (this.selectedGiftTypeId && product.gift_type_ids && product.gift_type_ids.includes(this.selectedGiftTypeId)) score++;
        if (this.selectedRelationshipId && product.relationship_ids && product.relationship_ids.includes(this.selectedRelationshipId)) score++;
        if (this.selectedTagId && product.tag_ids && product.tag_ids.includes(this.selectedTagId)) score++;
        return { product, score };
      });
      productScores.sort((a, b) => {
        if (a.score !== b.score) return b.score - a.score;
        else return b.product.rating - a.product.rating;
      });
      const topCount = Math.min(10, productScores.length);
      this.searchResults = productScores.slice(0, topCount).map(item => item.product);
      this.searchAttempted = true;
      this.searchResultsMode = true;
    },

    generateRandomGift() {
      if (!this.allProducts.length) {
        alert('Товари ще завантажуються, спробуйте пізніше.');
        return;
      }
      const randomIndex = Math.floor(Math.random() * this.allProducts.length);
      const randomProduct = this.allProducts[randomIndex];
      this.openProductModal(randomProduct);
    },

    openAuthModal(mode) { this.authMode = mode; this.authName = ''; this.authEmail = ''; this.authPassword = ''; this.showAuthModal = true; },
    closeAuthModal() { this.showAuthModal = false; },
    forgotPassword() {
      const email = prompt('Введіть ваш email для відновлення пароля:');
      if (!email) return;
      fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      .then(res => res.json())
      .then(data => { alert(data.message); })
      .catch(err => { console.error(err); alert('Помилка з\'єднання'); });
    },
    openProductModal(product) { this.selectedProduct = product; this.currentImageIndex = 0; this.reviewComment = ''; this.reviewRating = 0; this.showProductModal = true; this.fetchReviews(product.id); },
    closeProductModal() { this.showProductModal = false; this.selectedProduct = null; this.currentImageIndex = 0; this.productReviews = []; },
    nextImage() { if (this.selectedProduct && this.selectedProduct.images && this.selectedProduct.images.length > 1) this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedProduct.images.length; },
    prevImage() { if (this.selectedProduct && this.selectedProduct.images && this.selectedProduct.images.length > 1) this.currentImageIndex = (this.currentImageIndex - 1 + this.selectedProduct.images.length) % this.selectedProduct.images.length; }
  }
});