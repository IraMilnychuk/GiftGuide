new Vue({
  el: '#app',
  data: {
    // === НАВІГАЦІЯ ===
    currentPage: 'home',
    searchQuery: '',
    showSuggestions: false,
    selectedFilters: {
      'Кому': [],
      'Привід': [],
      'Інтереси': [],
      'Тип подарунка': [],
      'Стосунки': []
    },

    // === АВТОРИЗАЦІЯ ===
    isLoggedIn: false,
    userName: '',
    authEmail: '',
    authPassword: '',
    authName: '',
    token: null,

    // === ТОВАРИ ===
    allProducts: [],
    loading: false,
    activeIndex: 1,
    autoInterval: null,
    favoriteIds: [],          // список ID обраних товарів з бекенду

    // === ФІЛЬТРИ (горизонтальні) ===
    filters: [
      { label: 'Кому', options: ['Для неї', 'Для нього', 'Дітям', 'Батькам', 'Друзям', 'Колегам'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Привід', options: ['День народження', 'Новий рік', 'Річниця', 'День святого Валентина', '8 Березня', 'Подарунок без приводу', 'Весілля', 'Ювілей'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Інтереси', options: ['Спорт', 'Книги', 'Технології', 'Краса та догляд', 'Кулінарія', 'Подорожі', 'Ігри', 'Музика'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Тип подарунка', options: ['Практичний', 'Емоційний (враження)', 'Сувенірний', 'Романтичний', 'Оригінальний'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Стосунки', options: ['Коханий / Кохана', 'Друг / Подруга', 'Чоловік / Дружина', 'Мама / Тато', 'Брат / Сестра', 'Колега', 'Керівник'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Ідеї', options: ['Популярні подарунки', 'Новинки', 'Недорогі подарунки', 'Подарунки до 500 грн', 'Оригінальні ідеї', 'Сертифікати', 'Випадковий подарунок'], selected: '', isOpen: false, closeTimer: null }
    ],

    // === КАТЕГОРІЇ НА ГОЛОВНІЙ ===
    categoryList: ['Для неї', 'Для нього', 'Друзям', 'Колегам', 'Дітям', 'Батькам'],

    // === ФІЛЬТРИ ДЛЯ БІЧНОЇ ПАНЕЛІ (МОДАЛЬНЕ ВІКНО ПІДБОРУ) ===
    modalFilters: [
      { label: 'Кому', options: ['Для неї', 'Для нього', 'Дітям', 'Батькам', 'Друзям', 'Колегам'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Привід', options: ['День народження', 'Новий рік', 'Річниця', 'День святого Валентина', '8 Березня', 'Подарунок без приводу', 'Весілля', 'Ювілей'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Інтереси', options: ['Спорт', 'Книги', 'Технології', 'Краса та догляд', 'Кулінарія', 'Подорожі', 'Ігри', 'Музика'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Тип подарунка', options: ['Практичний', 'Емоційний (враження)', 'Сувенірний', 'Романтичний', 'Оригінальний'], selected: '', isOpen: false, closeTimer: null },
      { label: 'Стосунки', options: ['Коханий / Кохана', 'Друг / Подруга', 'Чоловік / Дружина', 'Мама / Тато', 'Брат / Сестра', 'Колега', 'Керівник'], selected: '', isOpen: false, closeTimer: null }
    ],

    // === МОДАЛЬНІ ВІКНА ===
    showModal: false,
    showAuthModal: false,
    authMode: 'login',
    showProductModal: false,
    selectedProduct: null,
    currentImageIndex: 0,
    showCabinetModal: false,
    favorites: []         // для відображення в кабінеті (об'єкти товарів)
  },

  computed: {
    // Всі товари для каталогу (з фільтрами)
    filteredProducts() {
      let products = this.allProducts;
      // Фільтрація за обраними чекбоксами в бічній панелі (локально)
      for (let filterKey in this.selectedFilters) {
        const selectedValues = this.selectedFilters[filterKey];
        if (selectedValues && selectedValues.length) {
          const fieldMap = {
            'Кому': 'recipient_name',
            'Привід': 'occasion_name',
            'Інтереси': 'interests_name',
            'Тип подарунка': 'gift_type_name',
            'Стосунки': 'relationship_name'
          };
          const field = fieldMap[filterKey];
          if (field && products[0] && products[0][field]) {
            products = products.filter(p => selectedValues.includes(p[field]));
          } else {
            const idField = field.replace('_name', '_id');
            const idMap = {
              'recipient_id': this.getRecipientIdMap(),
              'occasion_id': this.getOccasionIdMap(),
              'gift_type_id': this.getGiftTypeIdMap(),
              'relationship_id': this.getRelationshipIdMap()
            };
            const map = idMap[idField];
            if (map) {
              const ids = selectedValues.map(v => map[v]).filter(id => id);
              if (ids.length) {
                products = products.filter(p => ids.includes(p[idField]));
              }
            }
          }
        }
      }
      // Пошук за назвою
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        products = products.filter(p => p.title.toLowerCase().includes(q));
      }
      return products;
    },

    // Тільки ті товари, які мають зображення 1.png…10.png (популярні)
    popularProducts() {
      const popularImages = ['1.png', '2.png', '3.png', '4.png', '5.png', '6.png', '7.png', '8.png', '9.png', '10.png'];
      return this.allProducts.filter(p => popularImages.includes(p.image));
    },

    // 3 картки для каруселі (з популярних)
    popularCards() {
      if (!this.popularProducts.length) return [];
      const total = this.popularProducts.length;
      const left = this.popularProducts[(this.activeIndex - 1 + total) % total];
      const center = this.popularProducts[this.activeIndex];
      const right = this.popularProducts[(this.activeIndex + 1) % total];
      return [left, center, right];
    },

    // Підказки для пошуку
    searchSuggestions() {
      if (!this.searchQuery.trim()) return [];
      const query = this.searchQuery.toLowerCase();
      const matches = this.allProducts.filter(p => p.title.toLowerCase().includes(query));
      return matches.slice(0, 5);
    }
  },

  mounted() {
    this.startAutoSlide();
    document.addEventListener('click', this.handleClickOutside);
    this.loadToken();
    this.fetchProducts();
    if (this.token) this.loadFavorites();
  },

  beforeDestroy() {
    clearInterval(this.autoInterval);
    document.removeEventListener('click', this.handleClickOutside);
  },

  methods: {
    // === РОБОТА З ТОКЕНОМ ===
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

    // === ЗАВАНТАЖЕННЯ ТОВАРІВ ===
    async fetchProducts() {
      this.loading = true;
      try {
        const headers = this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
        const response = await fetch('http://localhost:5000/api/products', { headers });
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        this.allProducts = data.map(p => ({
          id: p.id,
          title: p.title,
          description: p.description,
          price: parseFloat(p.price),
          oldPrice: p.old_price ? parseFloat(p.old_price) : null,
          rating: parseFloat(p.rating),
          image: p.image,
          images: (Array.isArray(p.images) ? p.images : (p.images ? JSON.parse(p.images) : []))
                   .map(img => 'img/' + img),
          link: p.link,
          recipient_id: p.recipient_id,
          occasion_id: p.occasion_id,
          gift_type_id: p.gift_type_id,
          relationship_id: p.relationship_id,
          age_range_id: p.age_range_id,
          gender_id: p.gender_id,
          recipient_name: this.getRecipientNameById(p.recipient_id),
          occasion_name: this.getOccasionNameById(p.occasion_id),
          gift_type_name: this.getGiftTypeNameById(p.gift_type_id),
          relationship_name: this.getRelationshipNameById(p.relationship_id)
        }));
        console.log('Завантажено товарів:', this.allProducts.length);
      } catch (error) {
        console.error('Помилка завантаження товарів:', error);
        alert('Не вдалося завантажити товари. Перевірте сервер.');
      } finally {
        this.loading = false;
      }
    },

    // === ЗАВАНТАЖЕННЯ ОБРАНОГО ===
    async loadFavorites() {
      if (!this.token) return;
      try {
        const response = await fetch('http://localhost:5000/api/favorites', {
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (response.ok) {
          const data = await response.json();
          this.favoriteIds = data.favorites || [];
          this.favorites = this.allProducts.filter(p => this.favoriteIds.includes(p.id));
        }
      } catch (err) {
        console.error('Помилка завантаження обраного:', err);
      }
    },

    // === ОБРАНЕ ===
    async addToFavorites(product) {
      if (!this.isLoggedIn) { this.promptLogin(); return; }
      if (this.favoriteIds.includes(product.id)) {
        alert('Цей товар вже у вашому списку обраних.');
        return;
      }
      try {
        const response = await fetch('http://localhost:5000/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.token}`
          },
          body: JSON.stringify({ productId: product.id })
        });
        if (response.ok) {
          this.favoriteIds.push(product.id);
          this.favorites.push(product);
          alert('Товар додано в обране!');
        } else {
          const err = await response.json();
          alert(err.message || 'Помилка додавання');
        }
      } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання');
      }
    },
    async removeFromFavorites(product) {
      if (!this.isLoggedIn) return;
      try {
        const response = await fetch(`http://localhost:5000/api/favorites/${product.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.token}` }
        });
        if (response.ok) {
          const idx = this.favoriteIds.indexOf(product.id);
          if (idx !== -1) this.favoriteIds.splice(idx, 1);
          const favIdx = this.favorites.findIndex(f => f.id === product.id);
          if (favIdx !== -1) this.favorites.splice(favIdx, 1);
          alert('Товар видалено з обраного.');
        } else {
          alert('Помилка видалення');
        }
      } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання');
      }
    },

    // === ОЦІНКИ ===
    async updateRating(product, star) {
      if (!this.isLoggedIn) { this.promptLogin(); return; }
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
          product.rating = data.average;
          alert(`Ви оцінили товар на ${star} зірок. Середній рейтинг: ${data.average}`);
          this.$forceUpdate();
        } else {
          const err = await response.json();
          alert(err.message || 'Помилка оцінювання');
        }
      } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання');
      }
    },

    // === АВТОРИЗАЦІЯ ===
    async submitAuth() {
      const url = this.authMode === 'login'
        ? 'http://localhost:5000/api/auth/login'
        : 'http://localhost:5000/api/auth/register';
      const body = this.authMode === 'login'
        ? { email: this.authEmail, password: this.authPassword }
        : { name: this.authName, email: this.authEmail, password: this.authPassword };
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });
        const data = await response.json();
        if (response.ok) {
          this.saveToken(data.token, data.user);
          alert(this.authMode === 'login' ? 'Вхід виконано' : 'Реєстрація виконана');
          this.closeAuthModal();
          await this.fetchProducts();
          await this.loadFavorites();
        } else {
          alert(data.message || 'Помилка');
        }
      } catch (err) {
        console.error(err);
        alert('Помилка з\'єднання з сервером');
      }
    },
    logout() {
      this.clearToken();
      this.favorites = [];
      this.favoriteIds = [];
      alert('Ви вийшли з облікового запису.');
      this.goHome();
    },

    // === ДОПОМІЖНІ МЕТОДИ ДЛЯ НАЗВ ===
    getRecipientNameById(id) {
      const map = {1:'Для неї',2:'Для нього',3:'Дітям',4:'Батькам',5:'Друзям',6:'Колегам'};
      return map[id] || '';
    },
    getOccasionNameById(id) {
      const map = {1:'День народження',2:'Новий рік',3:'Річниця',4:'День святого Валентина',5:'8 Березня',6:'Подарунок без приводу',7:'Весілля',8:'Ювілей'};
      return map[id] || '';
    },
    getGiftTypeNameById(id) {
      const map = {1:'Практичний',2:'Емоційний (враження)',3:'Сувенірний',4:'Романтичний',5:'Оригінальний',6:'DIY / handmade'};
      return map[id] || '';
    },
    getRelationshipNameById(id) {
      const map = {1:'Коханий / Кохана',2:'Друг / Подруга',3:'Чоловік / Дружина',4:'Мама / Тато',5:'Брат / Сестра',6:'Колега',7:'Керівник',8:'Знайомий'};
      return map[id] || '';
    },
    getRecipientIdMap() {
      return {'Для неї':1,'Для нього':2,'Дітям':3,'Батькам':4,'Друзям':5,'Колегам':6};
    },
    getOccasionIdMap() {
      return {'День народження':1,'Новий рік':2,'Річниця':3,'День святого Валентина':4,'8 Березня':5,'Подарунок без приводу':6,'Весілля':7,'Ювілей':8};
    },
    getGiftTypeIdMap() {
      return {'Практичний':1,'Емоційний (враження)':2,'Сувенірний':3,'Романтичний':4,'Оригінальний':5,'DIY / handmade':6};
    },
    getRelationshipIdMap() {
      return {'Коханий / Кохана':1,'Друг / Подруга':2,'Чоловік / Дружина':3,'Мама / Тато':4,'Брат / Сестра':5,'Колега':6,'Керівник':7,'Знайомий':8};
    },

    // === НАВІГАЦІЯ ===
    goHome() {
      this.currentPage = 'home';
      this.searchQuery = '';
    },
    goToCatalogWithFilter(filterType, value) {
      this.selectedFilters = {
        'Кому': [], 'Привід': [], 'Інтереси': [], 'Тип подарунка': [], 'Стосунки': []
      };
      if (filterType === 'recipient') this.selectedFilters['Кому'] = [value];
      this.currentPage = 'catalog';
    },
    applyFilterAndGoToCatalog(idx, option) {
      const label = this.filters[idx].label;
      this.selectedFilters = {
        'Кому': [], 'Привід': [], 'Інтереси': [], 'Тип подарунка': [], 'Стосунки': []
      };
      this.selectedFilters[label] = [option];
      this.currentPage = 'catalog';
      this.closeAllDropdowns();
    },
    applyFilters() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    applySearch() {
      if (this.searchQuery.trim()) this.currentPage = 'catalog';
    },
    closeAllDropdowns() {
      this.filters.forEach(f => {
        f.isOpen = false;
        if (f.closeTimer) clearTimeout(f.closeTimer);
      });
    },
    onSearchInput() {
      this.showSuggestions = true;
    },
    hideSuggestionsDelayed() {
      setTimeout(() => { this.showSuggestions = false; }, 200);
    },
    selectSearchSuggestion(title) {
      this.searchQuery = title;
      this.showSuggestions = false;
      this.applySearch();
    },

    // === КАРУСЕЛЬ ===
    nextCard() {
      if (this.popularProducts.length === 0) return;
      this.activeIndex++;
      if (this.activeIndex >= this.popularProducts.length) this.activeIndex = 0;
    },
    prevCard() {
      if (this.popularProducts.length === 0) return;
      this.activeIndex--;
      if (this.activeIndex < 0) this.activeIndex = this.popularProducts.length - 1;
    },
    startAutoSlide() {
      if (this.autoInterval) clearInterval(this.autoInterval);
      this.autoInterval = setInterval(() => this.nextCard(), 4000);
    },
    pauseAutoSlide() {
      clearInterval(this.autoInterval);
      this.autoInterval = null;
    },

    // === ЗІРКИ (відображення) ===
    getStarClass(rating, starIndex) {
      if (rating >= starIndex) return 'full';
      if (rating >= starIndex - 0.5 && rating < starIndex) return 'half';
      return '';
    },

    // === ПРОПОЗИЦІЯ ВХОДУ ===
    promptLogin() {
      alert('Ця функція доступна тільки для зареєстрованих користувачів. Будь ласка, увійдіть або зареєструйтесь.');
      this.openAuthModal('login');
    },

    // === ФІЛЬТРИ (випадаючі) ===
    openDropdown(index) {
      this.filters.forEach((f, i) => {
        if (i !== index && f.isOpen) {
          clearTimeout(f.closeTimer);
          f.isOpen = false;
        }
      });
      if (this.filters[index].closeTimer) clearTimeout(this.filters[index].closeTimer);
      this.filters[index].isOpen = true;
    },
    scheduleClose(index) {
      this.filters[index].closeTimer = setTimeout(() => {
        this.filters[index].isOpen = false;
      }, 200);
    },
    cancelClose(index) {
      if (this.filters[index].closeTimer) clearTimeout(this.filters[index].closeTimer);
    },
    selectOption(index, option) {
      this.filters[index].selected = option;
      this.filters[index].isOpen = false;
    },
    handleClickOutside(event) {
      if (!event.target.closest('.filter-item')) {
        this.filters.forEach(f => {
          if (f.isOpen) f.isOpen = false;
          if (f.closeTimer) clearTimeout(f.closeTimer);
        });
      }
    },

    // === МОДАЛЬНЕ ВІКНО ПІДБОРУ ===
    openModal() {
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.modalFilters.forEach(f => {
        if (f.isOpen) f.isOpen = false;
        if (f.closeTimer) clearTimeout(f.closeTimer);
      });
    },
    findGift() {
      const selected = this.modalFilters.map(f => f.selected).filter(s => s);
      alert('Функція пошуку в розробці! Вибрано: ' + (selected.length ? selected.join(', ') : 'жодного фільтра'));
      this.closeModal();
    },
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

    // === МОДАЛЬНЕ ВІКНО АВТОРИЗАЦІЇ ===
    openAuthModal(mode) {
      this.authMode = mode;
      this.authName = '';
      this.authEmail = '';
      this.authPassword = '';
      this.showAuthModal = true;
    },
    closeAuthModal() {
      this.showAuthModal = false;
    },
    forgotPassword() {
      alert('Інструкції з відновлення пароля надіслано на ваш email (демо-режим).');
    },

    // === ОСОБИСТИЙ КАБІНЕТ ===
    openCabinetModal() {
      this.showCabinetModal = true;
    },
    closeCabinetModal() {
      this.showCabinetModal = false;
    },

    // === ДЕТАЛЬНЕ МОДАЛЬНЕ ВІКНО ТОВАРУ ===
    openProductModal(product) {
      this.selectedProduct = product;
      this.currentImageIndex = 0;
      this.showProductModal = true;
    },
    closeProductModal() {
      this.showProductModal = false;
      this.selectedProduct = null;
      this.currentImageIndex = 0;
    },
    nextImage() {
      if (this.selectedProduct && this.selectedProduct.images && this.selectedProduct.images.length > 1) {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.selectedProduct.images.length;
      }
    },
    prevImage() {
      if (this.selectedProduct && this.selectedProduct.images && this.selectedProduct.images.length > 1) {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.selectedProduct.images.length) % this.selectedProduct.images.length;
      }
    }
  }
});