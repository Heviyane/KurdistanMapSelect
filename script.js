class KurdistanMap {
  constructor() {
    this.provinces = document.querySelectorAll('#map-container path[id]');
    this.tooltip = document.getElementById('tooltip');
    this.selectedCounter = document.getElementById('selected-counter');
    this.selectedCount = 0;
    this.langBtn = document.getElementById('lang-btn');
    this.langDropdown = document.getElementById('lang-dropdown');
    this.langOptions = document.querySelectorAll('.lang-option');
    this.translations = {
      en: {
        exportBtn: 'Download Map',
        eraseAllBtn: 'Erase All',
        langBtn: 'Language',
        selectedText: 'Provinces Selected'
      },
      nkb: {
        exportBtn: 'Nexşeyê Daxin',
        eraseAllBtn: 'Hemû Jê Bibin',
        langBtn: 'Ziman',
        selectedText: 'Parêzgehên Bijartibû'
      },
      ckb: {
        exportBtn: 'نەخشە دابەزێنە',
        eraseAllBtn: 'هەمووی بسڕەوە',
        langBtn: 'زمان‎ ',
        selectedText: ' پارێزگا هەڵبژێردراون'
      },
      diq: {
        exportBtn: 'Nexşı Biyarê',
        eraseAllBtn: 'Pêro Besterê',
        langBtn: 'Zıwan',
        selectedText: 'Wılayeti kı weçineyênê'
      },
      tr: {
        exportBtn: 'Haritayı İndir',
        eraseAllBtn: 'Hepsini Sil',
        langBtn: 'Dil',
        selectedText: 'Seçilen Iller'
      }
    };

    this.initEventListeners();
  }

  initEventListeners() {
    this.provinces.forEach(province => {
      province.addEventListener('click', this.handleProvinceClick.bind(this, province));
      province.addEventListener('touchend', this.handleProvinceTouchEnd.bind(this, province));
      province.addEventListener('mousemove', this.handleProvinceMouseMove.bind(this, province));
      province.addEventListener('mouseout', this.handleProvinceMouseOut.bind(this, province));
      province.addEventListener('touchmove', this.handleProvinceTouchMove.bind(this, province));
      province.addEventListener('touchcancel', this.handleProvinceTouchCancel.bind(this, province));
    });

    this.langBtn.addEventListener('click', this.toggleLangDropdown.bind(this));
    this.langOptions.forEach(option => {
      option.addEventListener('click', this.handleLangOptionClick.bind(this, option));
    });

    document.getElementById('export-btn').addEventListener('click', this.exportMap.bind(this));
    document.getElementById('erase-all-btn').addEventListener('click', this.eraseAll.bind(this));
  }

  handleProvinceClick(province, event) {
    if (event.shiftKey) {
      province.classList.remove('selected');
      this.selectedCount--;
    } else {
      province.classList.toggle('selected');
      if (province.classList.contains('selected')) {
        this.selectedCount++;
      } else {
        this.selectedCount--;
      }
    }
    this.updateSelectedCounter();
    this.saveSelectedProvinces();
  }

  handleProvinceTouchEnd(province, event) {
    event.preventDefault();
    province.classList.toggle('selected');
    if (province.classList.contains('selected')) {
      this.selectedCount++;
    } else {
      this.selectedCount--;
    }
    this.updateSelectedCounter();
    this.saveSelectedProvinces();
  }

  handleProvinceMouseMove(province, event) {
    const provinceName = province.getAttribute('id');
    this.tooltip.textContent = provinceName;
    this.tooltip.style.top = `${event.clientY - 20}px`;
    this.tooltip.style.left = `${event.clientX + 10}px`;
    this.tooltip.style.visibility = 'visible';
  }

  handleProvinceMouseOut(province, event) {
    this.tooltip.style.visibility = 'hidden';
  }

  handleProvinceTouchMove(province, event) {
    const provinceName = province.getAttribute('id');
    this.tooltip.textContent = provinceName;
    this.tooltip.style.top = `${event.touches[0].clientY - 20}px`;
    this.tooltip.style.left = `${event.touches[0].clientX + 10}px`;
    this.tooltip.style.visibility = 'visible';
  }

  handleProvinceTouchCancel(province, event) {
    this.tooltip.style.visibility = 'hidden';
  }

  toggleLangDropdown() {
    this.langDropdown.style.display = this.langDropdown.style.display === 'block' ? 'none' : 'block';
  }

  handleLangOptionClick(option, event) {
    const lang = option.getAttribute('data-lang');
    this.translatePage(lang);
    this.saveLanguage(lang);
    this.langDropdown.style.display = 'none';
  }

  updateSelectedCounter() {
    this.selectedCounter.textContent = this.selectedCount;
  }

  exportMap() {
    const mapContainer = document.getElementById('map-container');
    const clone = mapContainer.cloneNode(true);
    const watermark = document.createElement('div');
    watermark.textContent = 'https://heviyane.github.io/KurdistanMapSelect/';
    watermark.style.position = 'absolute';
    watermark.style.bottom = '10px';
    watermark.style.left = '10px';
    watermark.style.fontSize = '20px';
    watermark.style.fontWeight = 'bold';
    watermark.style.color = 'black';
    clone.appendChild(watermark);

    const scale = 5;
    clone.style.width = mapContainer.offsetWidth + 'px';
    clone.style.height = mapContainer.offsetHeight + 'px';
    clone.style.position = 'absolute';
    clone.style.left = '-1000px'; // Move it off screen
    document.body.appendChild(clone);

    html2canvas(clone, {
      scale: scale,
      useCORS: true,
      logging: true
    }).then(canvas => {
      const link = document.createElement('a');
      link.download = 'kurdistan-map.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      document.body.removeChild(clone); // Remove the clone
    });
  }

  eraseAll() {
    this.provinces.forEach(province => {
      province.classList.remove('selected');
    });
    this.selectedCount = 0;
    this.updateSelectedCounter();
    this.saveSelectedProvinces();
  }

  translatePage(lang) {
    document.getElementById('export-btn').textContent = this.translations[lang].exportBtn;
    document.getElementById('erase-all-btn').textContent = this.translations[lang].eraseAllBtn;
    document.getElementById('lang-btn').textContent = this.translations[lang].langBtn;
    document.getElementById('selected-text').textContent = this.translations[lang].selectedText;
  }

  saveSelectedProvinces() {
    const selectedProvinces = Array.from(this.provinces)
      .filter(province => province.classList.contains('selected'))
      .map(province => province.getAttribute('id'));
    localStorage.setItem('selectedProvinces', JSON.stringify(selectedProvinces));
  }

  loadSelectedProvinces() {
    const selectedProvinces = JSON.parse(localStorage.getItem('selectedProvinces'));
    if (selectedProvinces) {
      selectedProvinces.forEach(provinceId => {
        const province = document.getElementById(provinceId);
        if (province) {
          province.classList.add('selected');
          this.selectedCount++;
        }
      });
      this.updateSelectedCounter();
    }
  }

  saveLanguage(lang) {
    localStorage.setItem('language', lang);
  }

  loadLanguage() {
    const lang = localStorage.getItem('language');
    if (lang) {
      this.translatePage(lang);
    } else {
      this.translatePage('en');
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const kurdistanMap = new KurdistanMap();
  kurdistanMap.loadSelectedProvinces();
  kurdistanMap.loadLanguage();
});
