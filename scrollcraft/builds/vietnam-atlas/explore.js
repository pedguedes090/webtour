/* ==========================================================================
   Vietnam Atlas · Web 2 Main Travel Booking Portal (explore.js)
   Requires: data.js -> store.js -> window.VietnamAtlasStore
   ========================================================================== */
(function (global) {
  'use strict';

  var Store = global.VietnamAtlasStore;
  if (!Store) {
    console.error('[VietnamAtlas Portal] window.VietnamAtlasStore is missing. Load data.js and store.js first.');
    return;
  }

  var FALLBACK_PHOTO = 'assets/gen/hoabinh-dawn.webp';
  var VALID_MODES = ['stays', 'map', 'flights', 'esim', 'tours', 'giftcards', 'supports'];

  var uiState = {
    mode: 'stays',
    cityId: '',
    mapFocusCityId: 'danang',
    tripType: 'round-trip',
    departureDate: '2026-03-18',
    returnDate: '2026-03-22',
    travelMonth: 3,
    budgetTier: 'all',
    budgetCapVND: 10000000,
    staySubType: 'all',
    stayKeyword: '',
    staySort: 'featured',
    flightOrigin: 'ALL',
    flightDest: 'ALL',
    flightFareClass: 'lcc',
    esimProvider: 'all',
    esimDays: 'all',
    tourDuration: 'all',
    tourType: 'all',
    tourKeyword: '',
    gcThemeId: 'island',
    gcAmountVND: 2000000,
    gcRecipient: '',
    gcSender: '',
    gcNote: ''
  };

  var lastSnap = Store.getAll();
  var toastTimer = null;
  var lastFocusedBeforeDrawer = null;

  /* ------------------------------------------------------------------------
     Bilingual Dictionary (VI / EN)
     ------------------------------------------------------------------------ */
  var COPY = {
    vi: {
      pageTitle: 'Vietnam Atlas · Cổng đặt dịch vụ du lịch 2025-2026',
      skipLink: 'Chuyển tới khu vực đặt dịch vụ',
      siteHome: 'Trang chủ',
      sitePortal: 'Đặt dịch vụ',
      siteAdmin: 'Quản trị CMS',
      siteNavHeading: 'Hệ sinh thái Vietnam Atlas',
      dossierBtn: 'Giỏ hành trình',
      openDossierCta: 'Mở giỏ & Đặt chỗ',
      factHubs: 'Vùng điểm đến',
      factProvinces: 'Tỉnh/TP 2026',
      factGolden: 'Khung vàng',
      portalTitle: 'Đặt dịch vụ xuyên Việt theo mùa nắng đẹp',
      portalSubtitle: 'Vietnam Atlas 2025-2026 (34 đơn vị hành chính): đồng bộ thời tiết 11 vùng điểm đến, lưu trú Hotels & Homes, chuyến bay nội địa, eSIM và tour bản địa trong một giỏ hành trình.',
      tripModeLabel: 'Hình thức hành trình',
      roundTrip: 'Round-Trip (Khứ hồi)',
      oneWay: 'One-way (Một chiều)',
      selectCityLabel: 'Select City (Chọn khu vực)',
      allCities: 'Tất cả 11 điểm đến',
      departureLabel: 'Ngày đi (Departure)',
      returnLabel: 'Ngày về (Return)',
      budgetLabel: 'Ngân sách / đơn vị (Price / Budget)',
      budgetUnlimited: 'Tất cả mức giá',
      budgetMaxPrefix: 'Tối đa ',
      tierAll: 'Tất cả',
      tierBudget: 'Budget (<800k)',
      tierMid: 'Mid-range (800k-2.5M)',
      tierLuxury: 'Luxury (2.5M+)',
      resetFilters: 'Đặt lại bộ lọc',
      staysHeading: 'Hotels & Homes · Lưu trú, Biệt thự & Du thuyền',
      staySubAll: 'Tất cả',
      staySubHotels: 'Hotels & Resorts',
      staySubHomes: 'Homes & Villas',
      staySubCruises: 'Cruises',
      searchKeyword: 'Tìm theo tên, khu vực, tiện ích',
      staysPlaceholder: 'Tìm theo tên khách sạn, bãi biển, bản làng...',
      sortLabel: 'Sắp xếp',
      sortFeatured: 'Đề xuất chuẩn Atlas',
      sortAsc: 'Giá thấp đến cao',
      sortDesc: 'Giá cao đến thấp',
      mapHeading: 'Bản đồ 11 vùng điểm đến & Cửa ngõ hàng không 2026',
      mapDesc: 'Tọa độ thực từ Sa Pa (22.34°N) tới Phú Quốc (10.22°N). Chọn điểm đến hoặc đổi tháng để kiểm tra mùa khô, mưa bão và sân bay kết nối.',
      legendGolden: 'Khung vàng (T3-T4)',
      legendGood: 'Mùa đẹp',
      legendShoulder: 'Chuyển mùa',
      legendCaution: 'Lưu ý mưa / bão',
      legendAirport: 'Sân bay cửa ngõ (IATA)',
      flightsHeading: 'Chuyến bay nội địa & Quy chuẩn hành lý Việt Nam',
      originLabel: 'Điểm đi (From)',
      destLabel: 'Điểm đến (To)',
      allAirportsOrigin: 'Tất cả sân bay đi',
      allAirportsDest: 'Tất cả sân bay đến',
      cabinTierLabel: 'Hạng vé tính giá',
      airlinesHeading: 'Quy định hành lý & thủ tục các hãng nội địa',
      esimHeading: 'eSIM Du lịch Việt Nam (eKYC-free & Số +84)',
      esimDesc: 'Kết nối tức thì 4G / 5G xuyên Việt, kích hoạt qua mã QR trước khi hạ cánh. Lựa chọn nhà mạng trực tiếp Viettel Direct phủ sóng vùng núi sâu và đảo xa, VinaPhone/MobiFone, Gigago kèm số +84 đặt Grab không cần xếp hàng eKYC, hoặc Airalo cho hành trình đa quốc gia.',
      allProviders: 'Tất cả nhà mạng',
      allDurations: 'Mọi thời hạn',
      esim7d: '7 ngày',
      esim15d: '10 - 15 ngày',
      esim30d: '30 ngày',
      toursHeading: '23 Tour trải nghiệm & Vé tham quan xác thực',
      durAll: 'Tất cả',
      dur1d: 'Trong ngày (<=1N)',
      dur2d: '2N1Đ',
      dur3d: '3N2Đ+',
      typeAll: 'Tất cả loại hình',
      typeTour: 'Tour trọn tuyến',
      typeTicket: 'Vé tham quan',
      typeCombo: 'Combo',
      searchTour: 'Tìm tour hoặc điểm tham quan',
      toursPlaceholder: 'Tìm Bà Nà, Thung Nai, Hòn Thơm, Tràng An...',
      giftcardsHeading: 'Giftcards Studio · Quà tặng hành trình Việt Nam',
      giftcardsDesc: 'Tùy chỉnh mệnh giá từ 500.000 đến 10.000.000+ VNĐ, chọn chủ đề 3 miền và viết lời chúc cá nhân hóa.',
      gcTo: 'Gửi tới:',
      gcFrom: 'Từ:',
      gcConfigTitle: 'Thiết kế E-Giftcard của bạn',
      gcThemeLabel: '1. Chọn chủ đề vùng miền',
      gcAmountLabel: '2. Chọn mệnh giá (500.000 - 10.000.000+ VNĐ)',
      gcCustomLabel: 'Hoặc nhập mệnh giá tùy chọn (VNĐ)',
      gcRecipientLabel: 'Tên người nhận',
      gcSenderLabel: 'Tên người tặng',
      gcNoteLabel: 'Lời chúc cá nhân hóa',
      gcAddBtn: '+ Thêm E-Giftcard vào hành trình',
      gcCatalogHeading: 'Mẫu E-Giftcard phát hành sẵn',
      supportsHeading: 'Hỗ trợ khẩn cấp, Chính sách bão & Yêu cầu tư vấn',
      supportsDesc: 'Đầu số khẩn cấp toàn quốc, quy trình hoàn hủy lệnh cấm tàu Vịnh Hạ Long, quy định sân bay và gửi yêu cầu trực tiếp về CMS.',
      hotlinesHeading: 'Đầu số khẩn cấp tại Việt Nam',
      stormMatrixHeading: 'Ma trận xử lý thời tiết, bão & hoàn tiền Cảng vụ',
      airportRulesHeading: 'Quy chuẩn thủ tục hàng không & Pin Lithium',
      supportFormHeading: 'Gửi yêu cầu hỗ trợ, đổi lịch hoặc hoàn hủy thời tiết',
      supportFormDesc: 'Mọi yêu cầu được lưu ngay vào hệ thống VietnamAtlasStore để bộ phận điều hành xử lý trực tiếp trong Quản trị CMS.',
      formName: 'Họ và tên *',
      formEmail: 'Email liên hệ *',
      formPhone: 'Số điện thoại / WhatsApp *',
      formTravelerType: 'Nhóm du khách',
      formGuests: 'Số khách',
      formNotes: 'Ghi chú hành trình',
      supTopicLabel: 'Chủ đề hỗ trợ',
      supDateLabel: 'Ngày khởi hành liên quan',
      supDetailsLabel: 'Nội dung chi tiết *',
      supSubmitBtn: 'Gửi yêu cầu hỗ trợ',
      viewInAdmin: 'Mở Quản trị CMS (admin.html)',
      footerDesc: 'Hệ sinh thái bản đồ khí hậu, lưu trú, chuyến bay, tour và eSIM đồng bộ 34 đơn vị hành chính Việt Nam 2026.',
      dossierTitle: 'Giỏ hành trình & Xác nhận đặt chỗ',
      dossierSub: 'Đồng bộ trực tiếp với VietnamAtlasStore & Quản trị CMS.',
      selectedItemsLabel: 'Dịch vụ đã chọn',
      clearAll: 'Xóa tất cả',
      estimatedTotal: 'Tổng dự toán',
      checkoutTitle: 'Thông tin du khách & Lưu đơn',
      confirmBookingBtn: 'Xác nhận lưu hành trình',
      viewDossier: 'Xem giỏ',
      addBtn: '+ Thêm vào hành trình',
      addedBtn: 'Đã trong hành trình',
      emptyFilter: 'Không tìm thấy kết quả khớp bộ lọc hiện tại. Hãy nới ngân sách hoặc chuyển khu vực.',
      emptyDossier: 'Giỏ hành trình đang trống. Hãy thêm lưu trú, chuyến bay, tour, eSIM hoặc giftcard để lập lịch trình.',
      nightsSuffix: 'đêm',
      monthPrefix: 'Tháng '
    },
    en: {
      pageTitle: 'Vietnam Atlas · Travel Booking Portal 2025-2026',
      skipLink: 'Skip to booking workspace',
      siteHome: 'Showcase',
      sitePortal: 'Booking Portal',
      siteAdmin: 'Admin CMS',
      siteNavHeading: 'Vietnam Atlas Ecosystem',
      dossierBtn: 'Trip Dossier',
      openDossierCta: 'View Dossier & Book',
      factHubs: 'Destinations',
      factProvinces: '2026 Units',
      factGolden: 'Golden Window',
      portalTitle: 'Book Vietnam by dry-season climate & live fares',
      portalSubtitle: 'Vietnam Atlas 2025-2026 (34 administrative units): sync 11 destination seasons, Hotels & Homes, domestic flights, eSIMs, and verified tours in one connected Trip Dossier.',
      tripModeLabel: 'Trip / Stay Mode',
      roundTrip: 'Round-Trip',
      oneWay: 'One-way',
      selectCityLabel: 'Select City / Region',
      allCities: 'All 11 Destinations',
      departureLabel: 'Departure Date',
      returnLabel: 'Return Date',
      budgetLabel: 'Price / Budget Cap',
      budgetUnlimited: 'All price tiers',
      budgetMaxPrefix: 'Up to ',
      tierAll: 'All Tiers',
      tierBudget: 'Budget (<800k)',
      tierMid: 'Mid-range (800k-2.5M)',
      tierLuxury: 'Luxury (2.5M+)',
      resetFilters: 'Reset filters',
      staysHeading: 'Hotels & Homes · Resorts, Villas & Cruises',
      staySubAll: 'All Stays',
      staySubHotels: 'Hotels & Resorts',
      staySubHomes: 'Homes & Villas',
      staySubCruises: 'Cruises',
      searchKeyword: 'Search by property, zone, or amenity',
      staysPlaceholder: 'Search hotel, beach, valley, or cruise...',
      sortLabel: 'Sort',
      sortFeatured: 'Atlas Featured',
      sortAsc: 'Price: Low to High',
      sortDesc: 'Price: High to Low',
      mapHeading: '11-Hub Interactive Climate & Airport Gateway Map',
      mapDesc: 'Plotted by true latitude/longitude from Sa Pa (22.34°N) to Phu Quoc (10.22°N). Select a hub or month to inspect seasons and airports.',
      legendGolden: 'Golden Window (Mar-Apr)',
      legendGood: 'Best Season',
      legendShoulder: 'Shoulder Season',
      legendCaution: 'Monsoon / Storm Notice',
      legendAirport: 'Gateway Airport (IATA)',
      flightsHeading: 'Domestic Flights & Vietnam Baggage Rules',
      originLabel: 'Origin (From)',
      destLabel: 'Destination (To)',
      allAirportsOrigin: 'All Origin Airports',
      allAirportsDest: 'All Destination Airports',
      cabinTierLabel: 'Fare Basis',
      airlinesHeading: 'Carrier Baggage Allowances & Check-in Matrix',
      esimHeading: 'Vietnam Travel eSIM (eKYC-free & +84 Number)',
      esimDesc: 'Instant 4G / 5G across Vietnam, activated via QR before landing. Choose Viettel Direct for mountain and offshore coverage, VinaPhone/MobiFone, Gigago with a +84 local number (eKYC-free) for Grab/drivers, or Airalo for multi-country trips.',
      allProviders: 'All Providers',
      allDurations: 'All Durations',
      esim7d: '7 days',
      esim15d: '10 - 15 days',
      esim30d: '30 days',
      toursHeading: '23 Verified Vietnam Tours & Attraction Tickets',
      durAll: 'All Durations',
      dur1d: 'Day Trips (<=1D)',
      dur2d: '2D1N',
      dur3d: '3D2N+',
      typeAll: 'All Categories',
      typeTour: 'Guided Tours',
      typeTicket: 'Attraction Tickets',
      typeCombo: 'Combos',
      searchTour: 'Search tours or attractions',
      toursPlaceholder: 'Search Ba Na Hills, Thung Nai, Hon Thom, Trang An...',
      giftcardsHeading: 'Giftcards Studio · Sunlit Vietnam Travel Vouchers',
      giftcardsDesc: 'Customize denominations from 500,000 to 10,000,000+ VND, pick one of 3 regional themes, and write a personal note.',
      gcTo: 'To:',
      gcFrom: 'From:',
      gcConfigTitle: 'Design Your E-Giftcard',
      gcThemeLabel: '1. Select Regional Theme',
      gcAmountLabel: '2. Select Denomination (500,000 - 10,000,000+ VND)',
      gcCustomLabel: 'Or enter custom amount (VND)',
      gcRecipientLabel: 'Recipient Name',
      gcSenderLabel: 'Sender Name',
      gcNoteLabel: 'Personalized Greeting Note',
      gcAddBtn: '+ Add E-Giftcard to Dossier',
      gcCatalogHeading: 'Ready-to-Issue Giftcard Catalog',
      supportsHeading: 'Emergency Hotlines, Storm Refund Matrix & Support Desk',
      supportsDesc: 'Nationwide emergency numbers, Ha Long Port Authority storm refund matrix, airport security rules, and live inquiry desk.',
      hotlinesHeading: 'Vietnam Emergency Hotlines',
      stormMatrixHeading: 'Weather, Storm & Port Authority Refund Matrix',
      airportRulesHeading: 'Domestic Check-in & Lithium Battery Checklist',
      supportFormHeading: 'Submit a Support, Reschedule or Storm Refund Inquiry',
      supportFormDesc: 'Every inquiry writes directly to VietnamAtlasStore so coordinators see and manage it immediately in Admin CMS.',
      formName: 'Full Name *',
      formEmail: 'Email *',
      formPhone: 'Phone / WhatsApp *',
      formTravelerType: 'Traveler Type',
      formGuests: 'Guests',
      formNotes: 'Trip Notes',
      supTopicLabel: 'Inquiry Topic',
      supDateLabel: 'Related Travel Date',
      supDetailsLabel: 'Details *',
      supSubmitBtn: 'Submit Support Inquiry',
      viewInAdmin: 'Open Admin CMS (admin.html)',
      footerDesc: 'Climate-synced Vietnam stays, flights, tours, eSIMs and giftcards aligned with the 2026 34-province map.',
      dossierTitle: 'Trip Dossier & Booking Checkout',
      dossierSub: 'Synced directly with VietnamAtlasStore & Admin CMS.',
      selectedItemsLabel: 'Selected Services',
      clearAll: 'Clear all',
      estimatedTotal: 'Estimated Total',
      checkoutTitle: 'Traveler Details & Confirm Booking',
      confirmBookingBtn: 'Confirm & Save Booking',
      viewDossier: 'Open Dossier',
      addBtn: '+ Add to Dossier',
      addedBtn: 'In Dossier',
      emptyFilter: 'No services match the current filter combination. Try widening your budget or selecting All Destinations.',
      emptyDossier: 'Your Trip Dossier is empty. Add stays, flights, tours, eSIMs, or giftcards to build your trip.',
      nightsSuffix: 'nights',
      monthPrefix: 'Month '
    }
  };

  /* ------------------------------------------------------------------------
     Utility Helpers
     ------------------------------------------------------------------------ */
  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function lang() {
    return Store.getLang();
  }

  function copy(key) {
    var l = lang();
    return (COPY[l] && COPY[l][key]) || COPY.vi[key] || key;
  }

  function formatDualShort(vnd) {
    var cur = Store.getCurrency();
    var primary = Store.formatPrice(vnd, cur);
    var other = cur === 'USD' ? Store.formatPrice(vnd, 'VND') : ('~ ' + Store.formatPrice(vnd, 'USD'));
    return { primary: primary, secondary: other };
  }

  function parseMonthFromDate(dateStr, fallback) {
    if (!dateStr || typeof dateStr !== 'string') return fallback || 3;
    var parts = dateStr.split('-');
    if (parts.length >= 2) {
      var m = parseInt(parts[1], 10);
      if (m >= 1 && m <= 12) return m;
    }
    return fallback || 3;
  }

  function calcNights() {
    if (uiState.tripType === 'one-way') return 1;
    var d1 = new Date(uiState.departureDate);
    var d2 = new Date(uiState.returnDate);
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 1;
    var diff = Math.round((d2.getTime() - d1.getTime()) / 86400000);
    return Math.max(1, Math.min(30, diff));
  }

  function destLabel(destId) {
    var d = lastSnap.destinations.filter(function (x) { return x.id === destId; })[0];
    if (!d) return destId || '';
    return Store.pickText(d, 'shortName', 'shortNameEn') || Store.pickText(d, 'displayName', 'displayNameEn');
  }

  function destFull(destId) {
    var d = lastSnap.destinations.filter(function (x) { return x.id === destId; })[0];
    if (!d) return null;
    return d;
  }

  function inDossierMap() {
    var map = {};
    var items = (lastSnap.draftDossier && lastSnap.draftDossier.items) || [];
    items.forEach(function (it) { map[it.id] = it; });
    return map;
  }

  function matchesBudget(minPrice, maxPrice, itemTier) {
    var cap = Number(uiState.budgetCapVND || 10000000);
    var tier = uiState.budgetTier;
    var lo = Number(minPrice || 0);
    var hi = Number(maxPrice || lo);

    if (tier === 'budget') {
      return itemTier === 'budget' || lo <= 800000;
    }
    if (tier === 'mid') {
      return itemTier === 'mid' || (lo <= 2500000 && hi >= 800000);
    }
    if (tier === 'luxury') {
      return itemTier === 'luxury' || hi >= 2500000;
    }
    if (tier === 'custom') {
      return lo <= cap;
    }
    if (cap < 10000000) {
      return lo <= cap;
    }
    return true;
  }

  function showToast(msg) {
    var toast = document.getElementById('portal-toast');
    var msgEl = document.getElementById('portal-toast-msg');
    if (!toast || !msgEl) return;
    msgEl.textContent = msg;
    toast.hidden = false;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.hidden = true;
    }, 3600);
  }

  function addItemToDossier(item) {
    Store.addToDossier(item);
    lastSnap = Store.getAll();
    renderHeaderDossier();
    renderActiveModule();
    renderDossierDrawer();
    showToast((lang() === 'en' ? 'Added: ' : 'Đã thêm: ') + item.title);
  }

  function syncUrlState() {
    if (!global.history || !global.history.replaceState) return;
    var params = new URLSearchParams();
    params.set('mode', uiState.mode);
    if (uiState.cityId) params.set('city', uiState.cityId);
    params.set('trip', uiState.tripType);
    if (uiState.departureDate) params.set('dep', uiState.departureDate);
    if (uiState.tripType === 'round-trip' && uiState.returnDate) params.set('ret', uiState.returnDate);
    if (uiState.budgetTier && uiState.budgetTier !== 'all') params.set('budget', uiState.budgetTier);
    var nextUrl = global.location.pathname + '?' + params.toString();
    try {
      global.history.replaceState(null, '', nextUrl);
    } catch (e) {}
  }

  function hydrateFromUrlAndDraft() {
    var params = new URLSearchParams(global.location.search);
    var draft = Store.getDraftDossier() || {};

    var rawMode = (params.get('mode') || '').toLowerCase();
    var hashMode = (global.location.hash || '').replace('#', '').replace(/^panel-/, '').toLowerCase();
    var modeMap = {
      hotels: 'stays',
      stays: 'stays',
      map: 'map',
      flights: 'flights',
      esim: 'esim',
      tours: 'tours',
      giftcards: 'giftcards',
      supports: 'supports'
    };
    if (modeMap[rawMode]) uiState.mode = modeMap[rawMode];
    else if (modeMap[hashMode]) uiState.mode = modeMap[hashMode];

    var cityRaw = params.has('city') ? (params.get('city') || '') : (draft.cityId || '');
    var cityParam = cityRaw.toLowerCase();
    var cityExists = lastSnap.destinations.some(function (d) { return d.id === cityParam; });
    uiState.cityId = cityExists ? cityParam : '';
    uiState.mapFocusCityId = uiState.cityId || 'danang';

    var tripParam = (params.get('trip') || params.get('tripType') || draft.tripType || 'round-trip').toLowerCase();
    uiState.tripType = tripParam === 'one-way' ? 'one-way' : 'round-trip';

    var depParam = params.get('dep') || params.get('depart') || params.get('departDate') || draft.departureDate || '2026-03-18';
    var retParam = params.get('ret') || params.get('return') || params.get('returnDate') || draft.returnDate || '2026-03-22';
    uiState.departureDate = depParam;
    uiState.returnDate = retParam;

    var mParam = parseInt(params.get('month') || '', 10);
    uiState.travelMonth = (mParam >= 1 && mParam <= 12)
      ? mParam
      : parseMonthFromDate(depParam, draft.travelMonth || 3);

    var fallbackBudget = (params.has('mode') || params.has('city')) ? 'all' : (draft.budgetTier || 'all');
    var bParam = (params.get('budget') || params.get('tier') || fallbackBudget).toLowerCase();
    if (bParam === 'budget') {
      uiState.budgetTier = 'budget';
      uiState.budgetCapVND = 800000;
    } else if (bParam === 'mid' || bParam === 'mid-range') {
      uiState.budgetTier = 'mid';
      uiState.budgetCapVND = 2500000;
    } else if (bParam === 'luxury') {
      uiState.budgetTier = 'luxury';
      uiState.budgetCapVND = 10000000;
    } else {
      var numericCap = parseInt(bParam, 10);
      if (!isNaN(numericCap) && numericCap >= 300000 && numericCap < 10000000) {
        uiState.budgetTier = 'custom';
        uiState.budgetCapVND = numericCap;
      } else {
        uiState.budgetTier = 'all';
        uiState.budgetCapVND = 10000000;
      }
    }

    var kwParam = (params.get('q') || params.get('keyword') || '').trim();
    if (kwParam) {
      if (uiState.mode === 'tours') uiState.tourKeyword = kwParam;
      else if (uiState.mode === 'stays') uiState.stayKeyword = kwParam;
    }

    // Link initial flight destination to gateway airport if city selected
    if (uiState.cityId) {
      var d = destFull(uiState.cityId);
      if (d && d.gatewayAirport) {
        uiState.flightDest = d.gatewayAirport;
      }
    }
  }

  function persistSearchDraft() {
    Store.saveDraftDossier({
      cityId: uiState.cityId,
      tripType: uiState.tripType,
      departureDate: uiState.departureDate,
      returnDate: uiState.returnDate,
      travelMonth: uiState.travelMonth,
      budgetTier: uiState.budgetTier === 'custom' ? 'all' : uiState.budgetTier
    });
  }

  /* ------------------------------------------------------------------------
     Static Copy Translation + Global Header / Search Bar Rendering
     ------------------------------------------------------------------------ */
  function applyStaticCopy() {
    document.title = copy('pageTitle');
    var skip = document.getElementById('skip-link');
    if (skip) skip.textContent = copy('skipLink');

    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var key = els[i].getAttribute('data-i18n');
      if (key) els[i].textContent = copy(key);
    }

    var stayKw = document.getElementById('stays-keyword');
    if (stayKw) stayKw.placeholder = copy('staysPlaceholder');
    var tourKw = document.getElementById('tours-keyword');
    if (tourKw) tourKw.placeholder = copy('toursPlaceholder');

    var staysSort = document.getElementById('stays-sort');
    if (staysSort && staysSort.options.length >= 3) {
      staysSort.options[0].textContent = copy('sortFeatured');
      staysSort.options[1].textContent = copy('sortAsc');
      staysSort.options[2].textContent = copy('sortDesc');
    }

    var curLang = lang();
    var isEn = curLang === 'en';
    ['sup-traveler-type', 'chk-traveler-type'].forEach(function (id) {
      var sel = document.getElementById(id);
      if (sel && sel.options.length >= 2) {
        sel.options[0].textContent = isEn ? 'Domestic Traveler' : 'Khách nội địa (Domestic)';
        sel.options[1].textContent = isEn ? 'International Traveler' : 'Khách quốc tế (International)';
      }
    });
    var supTopic = document.getElementById('sup-topic');
    if (supTopic && supTopic.options.length >= 5) {
      supTopic.options[0].textContent = isEn ? 'Storm Refund / Date Change (Ha Long, Islands)' : 'Hoàn hủy / Dời ngày do bão (Hạ Long, Đảo)';
      supTopic.options[1].textContent = isEn ? 'Flight Schedule / Baggage Change' : 'Thay đổi lịch bay / Hành lý nội địa';
      supTopic.options[2].textContent = isEn ? 'Custom 2026 Route Design' : 'Thiết kế lịch trình riêng (34 tỉnh 2026)';
      supTopic.options[3].textContent = isEn ? 'eSIM / +84 Number Support' : 'Hỗ trợ kích hoạt eSIM / Số +84';
      supTopic.options[4].textContent = isEn ? 'General Travel Advisory' : 'Tư vấn thông tin chung';
    }

    // Update bilingual toggle buttons
    var curCurrency = Store.getCurrency();
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-lang-btn') === curLang;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-currency-btn]').forEach(function (btn) {
      var active = btn.getAttribute('data-currency-btn') === curCurrency;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderCityOptions() {
    var select = document.getElementById('search-city-select');
    if (!select) return;
    var current = uiState.cityId;
    var html = '<option value="">' + escHtml(copy('allCities')) + '</option>';
    lastSnap.destinations.forEach(function (d) {
      var label = Store.pickText(d, 'displayName', 'displayNameEn');
      var adminShort = Store.pickText(d, 'adminUnit2026', 'adminUnit2026En');
      if (d.id === 'hoabinh' || d.id === 'phuquoc') {
        label += ' · ' + adminShort.split('(')[0].trim();
      }
      html += '<option value="' + escHtml(d.id) + '">' + escHtml(label) + '</option>';
    });
    select.innerHTML = html;
    select.value = current;
  }

  function renderSearchBarState() {
    // Trip mode toggles
    document.querySelectorAll('[data-trip-type]').forEach(function (btn) {
      var active = btn.getAttribute('data-trip-type') === uiState.tripType;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Cleanly hide Return Date on One-way
    var isOneWay = uiState.tripType === 'one-way';
    var searchGrid = document.querySelector('.va-search-grid');
    if (searchGrid) searchGrid.classList.toggle('is-one-way', isOneWay);

    var retWrap = document.getElementById('search-return-wrap');
    var retInput = document.getElementById('search-return-date');
    if (retWrap && retInput) {
      retWrap.hidden = isOneWay;
      retInput.disabled = isOneWay;
      retInput.value = uiState.returnDate;
    }
    var depInput = document.getElementById('search-depart-date');
    if (depInput) depInput.value = uiState.departureDate;

    var chkRetWrap = document.getElementById('chk-return-wrap');
    var chkRetInput = document.getElementById('chk-return');
    if (chkRetWrap && chkRetInput) {
      chkRetWrap.hidden = isOneWay;
      chkRetInput.disabled = isOneWay;
    }

    // Budget slider & pills
    var slider = document.getElementById('search-budget-slider');
    var readout = document.getElementById('search-budget-readout');
    if (slider) slider.value = String(uiState.budgetCapVND);

    document.querySelectorAll('[data-budget-tier]').forEach(function (btn) {
      var active = btn.getAttribute('data-budget-tier') === uiState.budgetTier;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    if (readout) {
      if (uiState.budgetTier === 'all' && uiState.budgetCapVND >= 10000000) {
        readout.textContent = copy('budgetUnlimited');
      } else if (uiState.budgetTier === 'budget') {
        readout.textContent = '< ' + Store.formatPrice(800000);
      } else if (uiState.budgetTier === 'mid') {
        readout.textContent = Store.formatPriceRange(800000, 2500000, false);
      } else if (uiState.budgetTier === 'luxury') {
        readout.textContent = Store.formatPrice(2500000) + '+';
      } else {
        readout.textContent = copy('budgetMaxPrefix') + Store.formatPrice(uiState.budgetCapVND);
      }
    }

    // Seasonal Advisory Banner
    var banner = document.getElementById('season-advisory-banner');
    if (banner) {
      var l = lang();
      var targetDest = uiState.cityId ? destFull(uiState.cityId) : null;
      var status = Store.getSeasonStatus(targetDest || null, uiState.travelMonth, l);
      banner.className = 'va-season-banner va-season-banner--' + status.code;

      var monthLabel = l === 'en' ? ('Month ' + uiState.travelMonth) : ('Tháng ' + uiState.travelMonth);
      var nightsInfo = uiState.tripType === 'round-trip'
        ? (calcNights() + ' ' + copy('nightsSuffix'))
        : copy('oneWay');

      var metaText = '';
      var monthNoteAll = '';
      if (targetDest) {
        var adminText = Store.pickText(targetDest, 'adminUnit2026', 'adminUnit2026En');
        var transfer = Store.pickText(targetDest, 'transferNote', 'transferNoteEn');
        metaText = adminText + ' | ' + transfer;
      } else {
        var mNum = Number(uiState.travelMonth || 3);
        if (mNum === 3 || mNum === 4) {
          monthNoteAll = l === 'en'
            ? 'March to April is the nationwide dry window across North, Central, and South Vietnam.'
            : 'Tháng 3 đến Tháng 4 là khung giờ vàng khô ráo trên cả 3 miền Bắc, Trung, Nam.';
        } else if (mNum >= 5 && mNum <= 8) {
          monthNoteAll = l === 'en'
            ? 'Central beaches (Da Nang, Nha Trang, Hue) shine sunny; North/South see afternoon showers and Ha Long Port Authority monitors summer storms.'
            : 'Biển Miền Trung (Đà Nẵng, Nha Trang, Huế) nắng đẹp; Miền Bắc & Nam có mưa rào chiều, Cảng vụ Hạ Long theo dõi áp thấp/bão.';
        } else if (mNum >= 9 && mNum <= 11) {
          monthNoteAll = l === 'en'
            ? 'Central coast enters typhoon peak (Oct-Nov); Northern mountains (Sa Pa, Hoa Binh, Hanoi) enjoy autumn crispness and Southern dry season begins Nov.'
            : 'Miền Trung bước vào mùa mưa bão (cao điểm T10-11); Miền Bắc (Hà Nội, Hòa Bình, Sa Pa) thu mát đẹp và Phú Quốc vào mùa khô từ T11.';
        } else {
          monthNoteAll = l === 'en'
            ? 'Southern Vietnam, Phu Quoc & Da Lat enjoy prime dry sun; Northern hubs (Hanoi, Ha Long, Sa Pa) are crisp and misty.'
            : 'Miền Nam, Phú Quốc & Đà Lạt nắng khô rực rỡ; Miền Bắc (Hà Nội, Hạ Long, Sa Pa) se lạnh và có sương mù núi.';
        }
      }

      banner.innerHTML =
        '<div class="va-season-banner__main">' +
          '<span class="va-season-badge va-nums">' + escHtml(monthLabel + ' · ' + nightsInfo) + '</span>' +
          '<strong>' + escHtml(status.label) + ':</strong> ' +
          '<span>' + escHtml(status.note || monthNoteAll) + '</span>' +
        '</div>' +
        '<div class="va-season-banner__meta">' + escHtml(targetDest ? metaText : '') + '</div>';
    }
  }

  function renderHeaderDossier() {
    var items = (lastSnap.draftDossier && lastSnap.draftDossier.items) || [];
    var totalCount = items.reduce(function (sum, it) { return sum + Number(it.qty || 1); }, 0);
    var totalVND = items.reduce(function (sum, it) {
      return sum + (Number(it.qty || 1) * Number(it.priceVND || 0));
    }, 0);

    var countEl = document.getElementById('header-dossier-count');
    var totalEl = document.getElementById('header-dossier-total');
    var mobTotalEl = document.getElementById('mobile-bar-total');
    if (countEl) countEl.textContent = String(totalCount);
    if (totalEl) totalEl.textContent = totalCount > 0 ? Store.formatPrice(totalVND) : '';
    if (mobTotalEl) {
      mobTotalEl.textContent = totalCount > 0
        ? (totalCount + ' · ' + Store.formatPrice(totalVND))
        : Store.formatPrice(0);
    }
  }

  function updateModeTabsAndBadges() {
    var activeTabEl = null;
    document.querySelectorAll('.va-mode-tab').forEach(function (tab) {
      var m = tab.getAttribute('data-mode');
      var active = m === uiState.mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-selected', active ? 'true' : 'false');
      if (active) activeTabEl = tab;
    });

    if (activeTabEl && activeTabEl.parentElement) {
      var tabList = activeTabEl.parentElement;
      if (tabList.scrollWidth > tabList.clientWidth) {
        var targetLeft = activeTabEl.offsetLeft - Math.max(0, (tabList.clientWidth - activeTabEl.offsetWidth) / 2);
        tabList.scrollLeft = Math.max(0, targetLeft);
      }
    }

    VALID_MODES.forEach(function (m) {
      var panel = document.getElementById('panel-' + m);
      if (panel) panel.hidden = (m !== uiState.mode);
    });

    var staysFiltered = getFilteredStays();
    var toursFiltered = getFilteredTours();
    var flightsFiltered = getFilteredFlights();

    var cStays = document.getElementById('count-stays');
    var cMap = document.getElementById('count-map');
    var cFlights = document.getElementById('count-flights');
    var cEsim = document.getElementById('count-esim');
    var cTours = document.getElementById('count-tours');

    if (cStays) cStays.textContent = String(staysFiltered.length);
    if (cMap) cMap.textContent = String(lastSnap.destinations.length);
    if (cFlights) cFlights.textContent = String(flightsFiltered.length);
    if (cEsim) cEsim.textContent = String(lastSnap.esims.length);
    if (cTours) cTours.textContent = String(toursFiltered.length);
  }

  /* ------------------------------------------------------------------------
     Module 1: Hotels & Homes
     ------------------------------------------------------------------------ */
  function getFilteredStays() {
    var kw = uiState.stayKeyword.trim().toLowerCase();
    var list = lastSnap.stays.filter(function (s) {
      if (uiState.cityId && s.destinationId !== uiState.cityId) return false;
      if (uiState.staySubType !== 'all' && s.accommodationType !== uiState.staySubType) return false;
      var range = s.priceRangeVND || [s.pricePerNightVND, s.pricePerNightVND];
      if (!matchesBudget(range[0], range[1], s.tier)) return false;
      if (kw) {
        var hay = [s.name, s.zone, destLabel(s.destinationId), (s.amenities || []).join(' ')].join(' ').toLowerCase();
        if (hay.indexOf(kw) === -1) return false;
      }
      return true;
    });

    if (uiState.staySort === 'price-asc') {
      list.sort(function (a, b) { return (a.pricePerNightVND || 0) - (b.pricePerNightVND || 0); });
    } else if (uiState.staySort === 'price-desc') {
      list.sort(function (a, b) { return (b.pricePerNightVND || 0) - (a.pricePerNightVND || 0); });
    }
    return list;
  }

  function renderStaysModule() {
    var grid = document.getElementById('stays-grid');
    var summary = document.getElementById('stays-summary');
    if (!grid) return;

    document.querySelectorAll('[data-stay-type]').forEach(function (btn) {
      var active = btn.getAttribute('data-stay-type') === uiState.staySubType;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var stays = getFilteredStays();
    var nights = calcNights();
    var l = lang();
    var inDossier = inDossierMap();

    if (summary) {
      var cityText = uiState.cityId ? destLabel(uiState.cityId) : copy('allCities');
      summary.textContent = l === 'en'
        ? ('Showing ' + stays.length + ' verified stays in ' + cityText + (nights > 1 ? (' (' + nights + ' nights selected)') : '') + '.')
        : ('Hiển thị ' + stays.length + ' điểm lưu trú xác thực tại ' + cityText + (nights > 1 ? (' (' + nights + ' đêm dự kiến)') : '') + '.');
    }

    if (stays.length === 0) {
      grid.innerHTML = '<div class="va-empty-state"><p>' + escHtml(copy('emptyFilter')) + '</p>' +
        '<button type="button" class="va-btn va-btn--ghost" data-action="reset-all">' + escHtml(copy('resetFilters')) + '</button></div>';
      return;
    }

    var tierNames = {
      vi: { budget: 'Tiết kiệm', mid: 'Trung cấp', luxury: 'Cao cấp' },
      en: { budget: 'Budget', mid: 'Mid-range', luxury: 'Luxury' }
    };

    grid.innerHTML = stays.map(function (s) {
      var dest = destFull(s.destinationId);
      var season = Store.getSeasonStatus(dest || s.destinationId, uiState.travelMonth, l);
      var isCruise = s.accommodationType === 'Cruises';
      var unitQty = isCruise ? 1 : nights;
      var estTotal = Number(s.pricePerNightVND || 0) * unitQty;
      var prices = formatDualShort(s.pricePerNightVND || 0);
      var estFormatted = Store.formatPrice(estTotal);
      var added = Boolean(inDossier[s.id]);
      var amenities = (s.amenities || []).slice(0, 4).map(function (a) {
        return '<span class="va-chip-mini">' + escHtml(a) + '</span>';
      }).join('');

      var stayTitle = s.name;
      var unitHint = isCruise
        ? (l === 'en' ? 'per guest (2D1N package)' : (s.unitLabel || 'khách (2N1Đ)'))
        : (l === 'en' ? 'per night' : (s.unitLabel || 'phòng/đêm'));

      return '' +
        '<article class="va-card" data-stay-id="' + escHtml(s.id) + '">' +
          '<div class="va-card__media">' +
            '<img src="' + escHtml(s.photo || FALLBACK_PHOTO) + '" alt="' + escHtml(stayTitle) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + FALLBACK_PHOTO + '\';">' +
          '</div>' +
          '<div class="va-card__body">' +
            '<div class="va-card__meta-top">' +
              '<span class="va-card__loc">' + escHtml(destLabel(s.destinationId)) + '</span>' +
              '<div class="va-card__tags">' +
                '<span class="va-tag va-tag--jade">' + escHtml(s.accommodationType || 'Hotels') + '</span>' +
                '<span class="va-tag">' + escHtml((tierNames[l] && tierNames[l][s.tier]) || s.tier) + '</span>' +
                '<span class="va-tag va-tag--soft">' + escHtml(season.label) + '</span>' +
              '</div>' +
            '</div>' +
            '<h3 class="va-card__title">' + escHtml(stayTitle) + '</h3>' +
            '<p class="va-card__zone">' + escHtml(s.zone || '') + ' · ' + escHtml((l === 'en' ? 'In ' : 'Nhận ') + (s.checkInTime || '14:00') + ' / ' + (l === 'en' ? 'Out ' : 'Trả ') + (s.checkOutTime || '12:00')) + '</p>' +
            '<div class="va-card__chips">' + amenities + '</div>' +
            (s.comboNote ? '<p class="va-card__note">' + escHtml(s.comboNote) + '</p>' : '') +
            '<div class="va-card__foot">' +
              '<div class="va-price-block">' +
                '<span class="va-price-main va-nums">' + escHtml(prices.primary) + '</span>' +
                '<span class="va-price-sub va-nums">' + escHtml(prices.secondary + ' · ' + unitHint) + '</span>' +
                (unitQty > 1 ? '<span class="va-price-sub va-nums">' + escHtml(unitQty + ' ' + copy('nightsSuffix') + ': ' + estFormatted) + '</span>' : '') +
              '</div>' +
              '<button type="button" class="va-btn ' + (added ? 'va-btn--added' : 'va-btn--primary') + '" data-add-stay="' + escHtml(s.id) + '">' +
                escHtml(added ? copy('addedBtn') : copy('addBtn')) +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ------------------------------------------------------------------------
     Module 2: Interactive SVG Vietnam Map (11 Hubs by True Lat/Lng)
     ------------------------------------------------------------------------ */
  function latLngToSvg(lat, lng) {
    return {
      x: Number((60 + (lng - 102.0) * 42).toFixed(1)),
      y: Number((44 + (23.5 - lat) * 42).toFixed(1))
    };
  }

  function airportCoordsFor(airport) {
    if (airport.lat && airport.lng) return { lat: airport.lat, lng: airport.lng };
    if (airport.code === 'HAN') return { lat: 21.2212, lng: 105.8072 };
    if (airport.code === 'SGN') return { lat: 10.8188, lng: 106.6519 };
    if (airport.code === 'HPH') return { lat: 20.8194, lng: 106.7247 };
    return null;
  }

  function renderMapModule() {
    var monthStrip = document.getElementById('map-month-strip');
    var hubChips = document.getElementById('map-hub-chips');
    var hubsLayer = document.getElementById('map-hubs-layer');
    var airportsLayer = document.getElementById('map-airports-layer');
    var scurvePath = document.getElementById('map-scurve-path');
    var sidePanel = document.getElementById('map-side-panel');
    if (!hubsLayer || !sidePanel) return;

    var l = lang();
    var m = uiState.travelMonth;

    if (monthStrip) {
      var mHtml = '';
      for (var i = 1; i <= 12; i++) {
        mHtml += '<button type="button" class="va-month-btn va-nums' + (i === m ? ' is-active' : '') + '" data-map-month="' + i + '">' +
          (l === 'en' ? ('M' + i) : ('T' + i)) + '</button>';
      }
      monthStrip.innerHTML = mHtml;
    }

    var focusId = uiState.mapFocusCityId || uiState.cityId || 'danang';
    var focusDest = destFull(focusId) || lastSnap.destinations[0];

    if (hubChips) {
      hubChips.innerHTML = lastSnap.destinations.map(function (d) {
        var active = focusDest && d.id === focusDest.id;
        return '<button type="button" class="va-pill' + (active ? ' is-active' : '') + '" data-map-city="' + escHtml(d.id) + '">' +
          escHtml(destLabel(d.id)) + '</button>';
      }).join('');
    }

    // S-curve spine north-to-south across hubs
    var sortedByLat = lastSnap.destinations.slice().sort(function (a, b) { return (b.lat || 0) - (a.lat || 0); });
    if (scurvePath && sortedByLat.length > 1) {
      var dStr = sortedByLat.map(function (dest, idx) {
        var pt = latLngToSvg(dest.lat, dest.lng);
        return (idx === 0 ? 'M ' : 'L ') + pt.x + ',' + pt.y;
      }).join(' ');
      scurvePath.setAttribute('d', dStr);
    }

    // Airport pins
    if (airportsLayer) {
      airportsLayer.innerHTML = (lastSnap.airports || []).map(function (ap) {
        var c = airportCoordsFor(ap);
        if (!c) return '';
        var pt = latLngToSvg(c.lat, c.lng);
        var offsetX = ap.code === 'HUI' ? -27 : (ap.code === 'DLI' ? -26 : 9);
        var offsetY = ap.code === 'HPH' ? 12 : (ap.code === 'HUI' ? 11 : -6);
        return '<g class="va-map-airport-node" transform="translate(' + pt.x + ',' + pt.y + ')">' +
          '<rect x="-3.5" y="-3.5" width="7" height="7" transform="rotate(45)" fill="#102421" stroke="#FFFFFF" stroke-width="1"/>' +
          '<text x="' + offsetX + '" y="' + offsetY + '">' + escHtml(ap.code) + '</text>' +
        '</g>';
      }).join('');
    }

    // 11 Destination Hubs colored by live seasonal climate
    var colorMap = {
      golden: '#096B5C',
      good: '#16A34A',
      shoulder: '#D97706',
      caution: '#DC2626'
    };

    var labelShift = {
      hanoi: { dx: -44, dy: -8 },
      hoabinh: { dx: -76, dy: 4 },
      halong: { dx: 11, dy: -6 },
      ninhbinh: { dx: -72, dy: 14 },
      sapa: { dx: 10, dy: -4 },
      hue: { dx: -34, dy: -6 },
      danang: { dx: 11, dy: 10 },
      nhatrang: { dx: 10, dy: 4 },
      dalat: { dx: -52, dy: 4 },
      hcmc: { dx: -52, dy: 12 },
      phuquoc: { dx: -68, dy: 6 }
    };

    hubsLayer.innerHTML = lastSnap.destinations.map(function (dest) {
      var pt = latLngToSvg(dest.lat, dest.lng);
      var status = Store.getSeasonStatus(dest, m, l);
      var fill = colorMap[status.code] || '#096B5C';
      var isSelected = focusDest && dest.id === focusDest.id;
      var sh = labelShift[dest.id] || { dx: 10, dy: 4 };
      var shortLbl = Store.pickText(dest, 'shortName', 'shortNameEn');

      return '<g class="va-map-hub-node" role="button" tabindex="0" data-map-city="' + escHtml(dest.id) + '" aria-label="' + escHtml(shortLbl + ' - ' + status.label) + '" transform="translate(' + pt.x + ',' + pt.y + ')">' +
        (isSelected ? '<circle r="15" fill="' + fill + '" fill-opacity="0.18" stroke="' + fill + '" stroke-width="1.5"/>' : '') +
        '<circle r="' + (isSelected ? '7.5' : '6') + '" fill="' + fill + '" stroke="#FFFFFF" stroke-width="2"/>' +
        '<text class="va-map-hub-label" x="' + sh.dx + '" y="' + sh.dy + '">' + escHtml(shortLbl) + '</text>' +
      '</g>';
    }).join('');

    // Render Right Side Panel for focused destination
    if (!focusDest) return;
    var season = Store.getSeasonStatus(focusDest, m, l);
    var gatewayAp = (lastSnap.airports || []).filter(function (a) { return a.code === focusDest.gatewayAirport; })[0];
    var matchingStays = lastSnap.stays.filter(function (s) { return s.destinationId === focusDest.id; }).slice(0, 3);
    var matchingTours = lastSnap.tours.filter(function (t) { return t.destinationId === focusDest.id; }).slice(0, 3);
    var inDossier = inDossierMap();

    var subCoordsHtml = '';
    if (focusDest.subCoordinates && focusDest.subCoordinates.hoaBinhCity && focusDest.subCoordinates.maiChau) {
      var hb = focusDest.subCoordinates.hoaBinhCity;
      var mc = focusDest.subCoordinates.maiChau;
      subCoordsHtml = ' · TP. Hòa Bình ' + hb.lat + '°N, ' + hb.lng + '°E · Mai Châu ' + mc.lat + '°N, ' + mc.lng + '°E';
    }

    var gatewayHtml = '';
    if (gatewayAp) {
      gatewayHtml = '<div class="va-map-side__box">' +
        '<strong>' + (l === 'en' ? 'Gateway Airport: ' : 'Sân bay cửa ngõ: ') + escHtml(gatewayAp.code + ' - ' + gatewayAp.name) + '</strong>' +
        '<p style="margin:0.3rem 0 0;color:var(--va-ink-soft);">' + escHtml(Store.pickText(focusDest, 'transferNote', 'transferNoteEn')) + '</p>' +
      '</div>';
    } else {
      gatewayHtml = '<div class="va-map-side__box">' +
        '<strong>' + (l === 'en' ? 'Overland Access via HAN' : 'Di chuyển đường bộ từ Hà Nội / HAN') + '</strong>' +
        '<p style="margin:0.3rem 0 0;color:var(--va-ink-soft);">' + escHtml(Store.pickText(focusDest, 'transferNote', 'transferNoteEn')) + '</p>' +
      '</div>';
    }

    var zonesHtml = (focusDest.zones || []).map(function (z) {
      return '<span class="va-chip-mini">' + escHtml(z) + '</span>';
    }).join('');

    var staysListHtml = matchingStays.map(function (s) {
      var added = Boolean(inDossier[s.id]);
      return '<div class="va-mini-item">' +
        '<div class="va-mini-item__info">' +
          '<p class="va-mini-item__title">' + escHtml(s.name) + '</p>' +
          '<span class="va-mini-item__sub va-nums">' + escHtml(s.zone + ' · ' + Store.formatPrice(s.pricePerNightVND)) + '</span>' +
        '</div>' +
        '<button type="button" class="va-btn ' + (added ? 'va-btn--added' : 'va-btn--ghost') + '" data-add-stay="' + escHtml(s.id) + '">' +
          escHtml(added ? copy('addedBtn') : '+') +
        '</button>' +
      '</div>';
    }).join('');

    var toursListHtml = matchingTours.map(function (t) {
      var added = Boolean(inDossier[t.id]);
      return '<div class="va-mini-item">' +
        '<div class="va-mini-item__info">' +
          '<p class="va-mini-item__title">' + escHtml(t.title) + '</p>' +
          '<span class="va-mini-item__sub va-nums">' + escHtml(t.durationLabel + ' · ' + Store.formatPrice(t.priceVND)) + '</span>' +
        '</div>' +
        '<button type="button" class="va-btn ' + (added ? 'va-btn--added' : 'va-btn--ghost') + '" data-add-tour="' + escHtml(t.id) + '">' +
          escHtml(added ? copy('addedBtn') : '+') +
        '</button>' +
      '</div>';
    }).join('');

    sidePanel.innerHTML =
      '<div class="va-map-side__hero">' +
        '<img src="' + escHtml(focusDest.photo || FALLBACK_PHOTO) + '" alt="' + escHtml(Store.pickText(focusDest, 'displayName', 'displayNameEn')) + '" onerror="this.onerror=null;this.src=\'' + FALLBACK_PHOTO + '\';">' +
      '</div>' +
      '<div class="va-map-side__body">' +
        '<div>' +
          '<div class="va-card__meta-top" style="margin-bottom:0.45rem;">' +
            '<span class="va-tag va-tag--jade">' + escHtml(Store.pickText(focusDest, 'regionLabel', 'regionLabelEn')) + '</span>' +
            '<span class="va-tag va-tag--soft">' + escHtml(season.label) + '</span>' +
          '</div>' +
          '<h3 class="va-display" style="font-size:1.35rem;">' + escHtml(Store.pickText(focusDest, 'displayName', 'displayNameEn')) + '</h3>' +
          '<div class="va-map-side__coords va-nums">' + escHtml(focusDest.lat.toFixed(4) + '°N, ' + focusDest.lng.toFixed(4) + '°E' + subCoordsHtml) + '</div>' +
          '<p style="margin:0.35rem 0 0;font-size:0.86rem;color:var(--va-accent-deep);font-weight:600;">' + escHtml(Store.pickText(focusDest, 'adminUnit2026', 'adminUnit2026En')) + '</p>' +
          '<p style="margin:0.45rem 0 0;font-size:0.88rem;color:var(--va-ink-soft);">' + escHtml(Store.pickText(focusDest, 'summary', 'summaryEn')) + '</p>' +
        '</div>' +
        '<div class="va-season-banner va-season-banner--' + season.code + '">' +
          '<div><strong>' + (l === 'en' ? 'Best: ' : 'Mùa đẹp: ') + '</strong>' + escHtml(Store.pickText(focusDest, 'bestSeasonText', 'bestSeasonTextEn')) + '<br>' +
          '<strong>' + (l === 'en' ? 'Caution: ' : 'Lưu ý: ') + '</strong>' + escHtml(Store.pickText(focusDest, 'weatherWarningText', 'weatherWarningTextEn')) + '</div>' +
        '</div>' +
        gatewayHtml +
        '<div><span class="va-field-label">' + (l === 'en' ? 'Sub-zones' : 'Phân khu du lịch') + '</span><div class="va-card__chips" style="margin-top:0.35rem;">' + zonesHtml + '</div></div>' +
        '<div><span class="va-field-label">' + (l === 'en' ? 'Matching Stays' : 'Lưu trú gợi ý') + '</span><div class="va-map-side__list" style="margin-top:0.4rem;">' + staysListHtml + '</div></div>' +
        '<div><span class="va-field-label">' + (l === 'en' ? 'Matching Tours' : 'Tour & Vé nổi bật') + '</span><div class="va-map-side__list" style="margin-top:0.4rem;">' + toursListHtml + '</div></div>' +
        '<div class="va-map-side__actions">' +
          '<button type="button" class="va-btn va-btn--primary" data-jump-city="' + escHtml(focusDest.id) + '" data-jump-mode="stays">' + (l === 'en' ? 'Explore Stays' : 'Xem tất cả Lưu trú') + '</button>' +
          '<button type="button" class="va-btn va-btn--ghost" data-jump-city="' + escHtml(focusDest.id) + '" data-jump-mode="tours">' + (l === 'en' ? 'Explore Tours' : 'Xem tất cả Tour') + '</button>' +
          '<button type="button" class="va-btn va-btn--ghost" data-jump-city="' + escHtml(focusDest.id) + '" data-jump-mode="flights">' + (l === 'en' ? 'Flights' : 'Tìm chuyến bay') + '</button>' +
        '</div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------------
     Module 3: Flights
     ------------------------------------------------------------------------ */
  function getFilteredFlights() {
    var list = (lastSnap.flights || []).filter(function (r) {
      if (uiState.flightOrigin !== 'ALL' && r.from !== uiState.flightOrigin) return false;
      if (uiState.flightDest !== 'ALL' && r.to !== uiState.flightDest) return false;

      var range = uiState.tripType === 'round-trip'
        ? (r.roundTripRangeVND || [1200000, 3500000])
        : (r.lccOneWayVND || [600000, 1500000]);
      if (!matchesBudget(range[0], range[1], '')) return false;
      return true;
    });
    return list;
  }

  function populateFlightAirportSelects() {
    var originSel = document.getElementById('flight-origin-select');
    var destSel = document.getElementById('flight-dest-select');
    if (!originSel || !destSel) return;

    var airports = lastSnap.airports || [];
    var oHtml = '<option value="ALL">' + escHtml(copy('allAirportsOrigin')) + '</option>';
    var dHtml = '<option value="ALL">' + escHtml(copy('allAirportsDest')) + '</option>';
    airports.forEach(function (ap) {
      var label = ap.code + ' - ' + ap.city;
      oHtml += '<option value="' + escHtml(ap.code) + '">' + escHtml(label) + '</option>';
      dHtml += '<option value="' + escHtml(ap.code) + '">' + escHtml(label) + '</option>';
    });
    originSel.innerHTML = oHtml;
    destSel.innerHTML = dHtml;
    originSel.value = uiState.flightOrigin;
    destSel.value = uiState.flightDest;
  }

  function renderFlightsModule() {
    populateFlightAirportSelects();
    var l = lang();
    var fm = lastSnap.flightMeta || {};

    document.querySelectorAll('[data-flight-fare]').forEach(function (btn) {
      var active = btn.getAttribute('data-flight-fare') === uiState.flightFareClass;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var winNote = document.getElementById('flights-window-note');
    if (winNote) {
      winNote.textContent = (l === 'en'
        ? 'Reference fares booked 1-3 weeks ahead on weekdays. Surge applies on Tet, Apr 30 - May 1, and Jun - Aug peak summer.'
        : (fm.bookingWindowNote + ' ' + fm.peakSurgeNotice));
    }

    var gwBox = document.getElementById('flights-gateway-notice');
    if (gwBox) {
      var activeDest = uiState.cityId ? destFull(uiState.cityId) : null;
      if (activeDest && (!activeDest.gatewayAirport || activeDest.id === 'hoabinh' || activeDest.id === 'sapa' || activeDest.id === 'ninhbinh' || activeDest.id === 'halong')) {
        gwBox.innerHTML = '<div class="va-notice-strip va-notice-strip--jade">' +
          '<strong>' + escHtml(Store.pickText(activeDest, 'displayName', 'displayNameEn')) + ':</strong> ' +
          escHtml(Store.pickText(activeDest, 'transferNote', 'transferNoteEn')) +
        '</div>';
      } else {
        gwBox.innerHTML = '';
      }
    }

    var cutoff = document.getElementById('flights-cutoff-banner');
    if (cutoff) {
      cutoff.innerHTML = l === 'en'
        ? '<strong>Domestic Check-in Cutoff:</strong> Arrive 90-120 min early. Counters open 2 hrs prior, <strong>close strictly 40 min before departure</strong>, boarding gate closes 15 min prior. Power banks & Lithium batteries MUST travel in carry-on luggage only.'
        : '<strong>Quy định giờ đóng quầy nội địa:</strong> Có mặt trước 90-120 phút. Quầy mở trước 2 giờ, <strong>đóng quầy đúng 40 phút trước giờ bay</strong>, đóng cửa ra tàu bay trước 15 phút. ' + escHtml(fm.securityRule || '');
    }

    var grid = document.getElementById('flights-grid');
    if (grid) {
      var routes = getFilteredFlights();
      var inDossier = inDossierMap();
      if (routes.length === 0) {
        grid.innerHTML = '<div class="va-empty-state"><p>' + escHtml(copy('emptyFilter')) + '</p>' +
          '<button type="button" class="va-btn va-btn--ghost" data-action="reset-flights">' + escHtml(copy('resetFilters')) + '</button></div>';
      } else {
        grid.innerHTML = routes.map(function (r) {
          var isRound = uiState.tripType === 'round-trip';
          var isFull = uiState.flightFareClass === 'full';
          var baseOneWay = (isFull && r.fullServiceOneWayVND) ? r.fullServiceOneWayVND : (r.lccOneWayVND || [700000, 1200000]);
          var fullRoundMult = isFull ? 1.35 : 1;
          var rtRange = r.roundTripRangeVND || [baseOneWay[0] * 2, baseOneWay[1] * 2];

          var activeRange = isRound
            ? [Math.round(rtRange[0] * fullRoundMult), Math.round(rtRange[1] * fullRoundMult)]
            : baseOneWay;

          var unitFare = Math.round((activeRange[0] + activeRange[1]) / 2);
          var fareId = r.id + '-' + uiState.tripType + '-' + uiState.flightFareClass;
          var added = Boolean(inDossier[fareId]);
          var rangeStr = Store.formatPriceRange(activeRange[0], activeRange[1], false);
          var unitStr = formatDualShort(unitFare);

          var airlineChips = (r.airlines || []).map(function (a) {
            return '<span class="va-chip-mini">' + escHtml(a) + '</span>';
          }).join('');

          return '' +
            '<article class="va-flight-card">' +
              '<div class="va-flight-card__route">' +
                '<div>' +
                  '<div class="va-iata-pair va-nums">' + escHtml(r.from) + ' <span class="va-iata-arrow">' + (isRound ? '<->' : '->') + '</span> ' + escHtml(r.to) + '</div>' +
                  '<div class="va-flight-card__cities">' + escHtml(r.fromCity + ' - ' + r.toCity) + '</div>' +
                '</div>' +
                '<span class="va-tag va-tag--jade va-nums">' + escHtml(r.durationText) + '</span>' +
              '</div>' +
              '<div class="va-card__chips">' + airlineChips + '</div>' +
              '<div class="va-flight-card__fares">' +
                '<div class="va-fare-box">' +
                  '<span>' + escHtml((isRound ? copy('roundTrip') : copy('oneWay')) + ' · ' + (isFull ? 'Full-Service' : 'Eco / LCC')) + '</span>' +
                  '<strong class="va-nums">' + escHtml(rangeStr) + '</strong>' +
                '</div>' +
                '<div class="va-fare-box">' +
                  '<span>' + (l === 'en' ? 'Estimated Booking Unit' : 'Giá ước tính chốt vé') + '</span>' +
                  '<strong class="va-nums">' + escHtml(unitStr.primary) + '</strong>' +
                '</div>' +
              '</div>' +
              '<p class="va-card__zone">' + escHtml(r.routeNote || '') + '</p>' +
              '<div class="va-card__foot">' +
                '<span class="va-price-sub va-nums">' + escHtml(unitStr.secondary) + '</span>' +
                '<button type="button" class="va-btn ' + (added ? 'va-btn--added' : 'va-btn--primary') + '" data-add-flight="' + escHtml(r.id) + '">' +
                  escHtml(added ? copy('addedBtn') : (l === 'en' ? '+ Add Flight' : '+ Thêm vé bay')) +
                '</button>' +
              '</div>' +
            '</article>';
        }).join('');
      }
    }

    var airlinesGrid = document.getElementById('flights-airlines-grid');
    if (airlinesGrid) {
      airlinesGrid.innerHTML = (fm.airlines || []).map(function (al) {
        return '<div class="va-airline-card">' +
          '<h4>' + escHtml(al.name) + '</h4>' +
          '<div><strong>' + (l === 'en' ? 'Carry-on: ' : 'Xách tay: ') + '</strong>' + escHtml(al.carryOn) + '</div>' +
          '<div><strong>' + (l === 'en' ? 'Checked: ' : 'Ký gửi: ') + '</strong>' + escHtml(al.checkedBaggage) + '</div>' +
          '<div style="color:var(--va-ink-soft);">' + escHtml(al.rulesNote) + '</div>' +
        '</div>';
      }).join('');
    }
  }

  /* ------------------------------------------------------------------------
     Module 4: eSIM
     ------------------------------------------------------------------------ */
  function renderEsimModule() {
    var l = lang();

    document.querySelectorAll('[data-esim-provider]').forEach(function (btn) {
      var active = btn.getAttribute('data-esim-provider') === uiState.esimProvider;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-esim-days]').forEach(function (btn) {
      var active = btn.getAttribute('data-esim-days') === uiState.esimDays;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // Auto-recommendation banner for selected city
    var recBox = document.getElementById('esim-recommendation-box');
    if (recBox) {
      var city = uiState.cityId;
      var recText = '';
      if (city === 'hoabinh' || city === 'sapa') {
        recText = l === 'en'
          ? ('Recommended for ' + destLabel(city) + ': Viettel Direct (5G60T / 5G80T) provides the strongest 4G/5G signal in northern valleys and mountain passes.')
          : ('Gợi ý tối ưu cho ' + destLabel(city) + ': Chọn Viettel Direct (5G60T / 5G80T) để đảm bảo sóng 5G/4G ổn định nhất tại thung lũng và đường đèo.');
      } else if (city === 'phuquoc' || city === 'halong' || city === 'nhatrang') {
        recText = l === 'en'
          ? ('Recommended for ' + destLabel(city) + ': Viettel Direct (5G60T / 5G80T) holds reliable coastal offshore coverage, or Gigago (+84) if international travelers need SMS/Grab without airport eKYC lines.')
          : ('Gợi ý cho ' + destLabel(city) + ': Viettel Direct (5G60T / 5G80T) mạnh trên tuyến đảo/vịnh, hoặc Gigago (+84, miễn xếp hàng eKYC) cho du khách quốc tế đặt Grab và liên hệ tàu.');
      } else {
        recText = l === 'en'
          ? 'Smart Match: Choose Viettel Direct (from 60,000 VND) for widest nationwide coverage, or Gigago (+84 local number, eKYC-free) for international visitors.'
          : 'Gợi ý thông minh: Chọn Viettel Direct (từ 60.000 VNĐ) nếu ưu tiên vùng phủ rộng nhất, hoặc Gigago (+84 không cần xếp hàng eKYC) cho khách quốc tế.';
      }
      recBox.innerHTML = '<strong>' + (l === 'en' ? 'Auto-Recommendation: ' : 'Đề xuất theo điểm đến: ') + '</strong>' + escHtml(recText);
    }

    var grid = document.getElementById('esim-grid');
    if (!grid) return;
    var inDossier = inDossierMap();

    var plans = (lastSnap.esims || []).filter(function (p) {
      if (uiState.esimProvider !== 'all' && (p.providerGroup + ' ' + p.provider).indexOf(uiState.esimProvider) === -1) {
        return false;
      }
      if (uiState.esimDays !== 'all') {
        var targetD = Number(uiState.esimDays);
        if (targetD === 7 && p.validityDays !== 7 && (!p.validityOptions || p.validityOptions.indexOf(7) === -1)) return false;
        if (targetD === 15 && p.validityDays !== 15 && p.validityDays !== 10 && (!p.validityOptions || p.validityOptions.indexOf(15) === -1)) return false;
        if (targetD === 30 && p.validityDays !== 30 && (!p.validityOptions || p.validityOptions.indexOf(30) === -1)) return false;
      }
      return true;
    });

    if (plans.length === 0) {
      grid.innerHTML = '<div class="va-empty-state"><p>' + escHtml(copy('emptyFilter')) + '</p></div>';
      return;
    }

    grid.innerHTML = plans.map(function (p) {
      var prices = formatDualShort(p.priceVND || (p.priceUSD * 25000));
      var added = Boolean(inDossier[p.id]);
      var numBadge = p.hasLocalNumber
        ? '<span class="va-tag va-tag--jade">' + escHtml(p.localNumberNote || '+84') + '</span>'
        : '<span class="va-tag va-tag--soft">' + escHtml(p.localNumberNote || 'Data-only') + '</span>';

      return '' +
        '<article class="va-card va-esim-card">' +
          '<div class="va-card__meta-top">' +
            '<span class="va-esim-code">' + escHtml(p.planCode) + '</span>' +
            numBadge +
          '</div>' +
          '<h3 class="va-card__title" style="margin-top:0.4rem;">' + escHtml(p.providerGroup) + '</h3>' +
          '<div class="va-card__chips">' +
            '<span class="va-chip-mini va-nums">' + escHtml(p.dataAllowance) + '</span>' +
            '<span class="va-chip-mini va-nums">' + escHtml(p.validityRangeLabel || (p.validityDays + (l === 'en' ? ' days' : ' ngày'))) + '</span>' +
          '</div>' +
          '<p class="va-card__zone" style="margin-top:0.25rem;">' + escHtml(p.recommendedFor) + '</p>' +
          (p.pricingExamples ? '<p class="va-card__note">' + escHtml(p.pricingExamples) + '</p>' : '') +
          '<div class="va-card__foot">' +
            '<div class="va-price-block">' +
              '<span class="va-price-main va-nums">' + escHtml(prices.primary) + '</span>' +
              '<span class="va-price-sub va-nums">' + escHtml(prices.secondary) + '</span>' +
            '</div>' +
            '<button type="button" class="va-btn ' + (added ? 'va-btn--added' : 'va-btn--primary') + '" data-add-esim="' + escHtml(p.id) + '">' +
              escHtml(added ? copy('addedBtn') : copy('addBtn')) +
            '</button>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ------------------------------------------------------------------------
     Module 5: Tours (All 23 Verified Vietnam Tours & Attraction Tickets)
     ------------------------------------------------------------------------ */
  function getFilteredTours() {
    var kw = uiState.tourKeyword.trim().toLowerCase();
    return (lastSnap.tours || []).filter(function (t) {
      if (uiState.cityId && t.destinationId !== uiState.cityId) return false;
      if (uiState.tourDuration !== 'all') {
        var d = Number(t.durationDays || 1);
        if (uiState.tourDuration === '1' && d > 1) return false;
        if (uiState.tourDuration === '2' && d !== 2) return false;
        if (uiState.tourDuration === '3' && d < 3) return false;
      }
      if (uiState.tourType !== 'all' && t.type !== uiState.tourType) return false;
      var range = t.priceRangeVND || [t.priceVND, t.priceVND];
      if (!matchesBudget(range[0], range[1], t.tier)) return false;
      if (kw) {
        var hay = [t.title, t.departureFrom, t.pricingBreakdown, destLabel(t.destinationId)].join(' ').toLowerCase();
        if (hay.indexOf(kw) === -1) return false;
      }
      return true;
    });
  }

  function renderToursModule() {
    var grid = document.getElementById('tours-grid');
    var summary = document.getElementById('tours-summary');
    if (!grid) return;

    document.querySelectorAll('[data-tour-duration]').forEach(function (btn) {
      var active = btn.getAttribute('data-tour-duration') === uiState.tourDuration;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    document.querySelectorAll('[data-tour-type]').forEach(function (btn) {
      var active = btn.getAttribute('data-tour-type') === uiState.tourType;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    var tours = getFilteredTours();
    var totalCount = (lastSnap.tours || []).length;
    var l = lang();
    var inDossier = inDossierMap();

    if (summary) {
      var cityText = uiState.cityId ? destLabel(uiState.cityId) : copy('allCities');
      summary.textContent = l === 'en'
        ? ('Showing ' + tours.length + ' of ' + totalCount + ' verified tours & tickets in ' + cityText + '.')
        : ('Hiển thị ' + tours.length + ' / ' + totalCount + ' tour & vé tham quan xác thực tại ' + cityText + '.');
    }

    if (tours.length === 0) {
      grid.innerHTML = '<div class="va-empty-state"><p>' + escHtml(copy('emptyFilter')) + '</p>' +
        '<button type="button" class="va-btn va-btn--ghost" data-action="reset-all">' + escHtml(copy('resetFilters')) + '</button></div>';
      return;
    }

    var typeNames = {
      vi: { tour: 'Tour', ticket: 'Vé tham quan', combo: 'Combo' },
      en: { tour: 'Tour', ticket: 'Ticket', combo: 'Combo' }
    };

    grid.innerHTML = tours.map(function (t) {
      var prices = formatDualShort(t.priceVND || 0);
      var added = Boolean(inDossier[t.id]);
      return '' +
        '<article class="va-card">' +
          '<div class="va-card__media">' +
            '<img src="' + escHtml(t.photo || FALLBACK_PHOTO) + '" alt="' + escHtml(t.title) + '" loading="lazy" onerror="this.onerror=null;this.src=\'' + FALLBACK_PHOTO + '\';">' +
          '</div>' +
          '<div class="va-card__body">' +
            '<div class="va-card__meta-top">' +
              '<span class="va-card__loc">' + escHtml(destLabel(t.destinationId)) + '</span>' +
              '<div class="va-card__tags">' +
                '<span class="va-tag va-tag--jade va-nums">' + escHtml(t.durationLabel) + '</span>' +
                '<span class="va-tag">' + escHtml((typeNames[l] && typeNames[l][t.type]) || t.type) + '</span>' +
              '</div>' +
            '</div>' +
            '<h3 class="va-card__title">' + escHtml(t.title) + '</h3>' +
            '<p class="va-card__departure">' + escHtml((l === 'en' ? 'From: ' : 'Đón: ') + t.departureFrom) + '</p>' +
            '<p class="va-card__zone">' + escHtml(t.pricingBreakdown || '') + '</p>' +
            (t.weatherSensitive && t.weatherNote
              ? '<p class="va-card__note va-card__note--warn">' + escHtml(t.weatherNote) + '</p>'
              : '') +
            '<div class="va-card__foot">' +
              '<div class="va-price-block">' +
                '<span class="va-price-main va-nums">' + escHtml(prices.primary) + '</span>' +
                '<span class="va-price-sub va-nums">' + escHtml(prices.secondary + (l === 'en' ? ' / guest' : ' / khách')) + '</span>' +
              '</div>' +
              '<button type="button" class="va-btn ' + (added ? 'va-btn--added' : 'va-btn--primary') + '" data-add-tour="' + escHtml(t.id) + '">' +
                escHtml(added ? copy('addedBtn') : copy('addBtn')) +
              '</button>' +
            '</div>' +
          '</div>' +
        '</article>';
    }).join('');
  }

  /* ------------------------------------------------------------------------
     Module 6: Giftcards Interactive Studio
     ------------------------------------------------------------------------ */
  function renderGiftcardsModule() {
    var gcMeta = lastSnap.giftcardMeta || {};
    var themes = gcMeta.themes || [];
    var denoms = gcMeta.denominationsVND || [500000, 1000000, 2000000, 5000000, 10000000];
    var l = lang();

    var themeEnMap = {
      island: 'Island & Beach Escape',
      northwest: 'Northwest Mountain Trail',
      halong: 'Ha Long Bay Cruise'
    };

    var themeBtns = document.getElementById('gc-theme-buttons');
    if (themeBtns) {
      themeBtns.innerHTML = themes.map(function (th) {
        var active = th.id === uiState.gcThemeId;
        var label = l === 'en' ? (themeEnMap[th.id] || th.label) : th.label;
        return '<button type="button" class="va-theme-btn' + (active ? ' is-active' : '') + '" data-gc-theme="' + escHtml(th.id) + '">' +
          '<strong>' + escHtml(label) + '</strong>' +
          '<span>' + escHtml(th.sampleDest) + '</span>' +
        '</button>';
      }).join('');
    }

    var denomBtns = document.getElementById('gc-denom-buttons');
    if (denomBtns) {
      denomBtns.innerHTML = denoms.map(function (amt) {
        var active = Number(uiState.gcAmountVND) === Number(amt);
        return '<button type="button" class="va-pill va-nums' + (active ? ' is-active' : '') + '" data-gc-denom="' + amt + '">' +
          escHtml(Store.formatPrice(amt)) +
        '</button>';
      }).join('');
    }

    var customInput = document.getElementById('gc-custom-amount');
    if (customInput && document.activeElement !== customInput) {
      customInput.value = String(uiState.gcAmountVND);
    }

    // Update live preview card
    var selectedTheme = themes.filter(function (th) { return th.id === uiState.gcThemeId; })[0] || themes[0];
    var themeLabel = selectedTheme ? (l === 'en' ? (themeEnMap[selectedTheme.id] || selectedTheme.label) : selectedTheme.label) : '';
    var prices = formatDualShort(uiState.gcAmountVND || 2000000);

    var pTheme = document.getElementById('gc-preview-theme');
    var pAmt = document.getElementById('gc-preview-amount');
    var pUsd = document.getElementById('gc-preview-usd');
    var pNote = document.getElementById('gc-preview-note');
    var pRec = document.getElementById('gc-preview-recipient');
    var pSen = document.getElementById('gc-preview-sender');

    if (pTheme) pTheme.textContent = themeLabel;
    if (pAmt) pAmt.textContent = prices.primary;
    if (pUsd) pUsd.textContent = prices.secondary;
    if (pNote) {
      pNote.textContent = uiState.gcNote.trim() || (l === 'en'
        ? 'Wishing you sunlit mornings and effortless journeys across Vietnam.'
        : 'Chúc bạn một hành trình nắng đẹp qua những miền di sản Việt Nam.');
    }
    if (pRec) pRec.textContent = uiState.gcRecipient.trim() || (l === 'en' ? 'Dear Traveler' : 'Bạn thân');
    if (pSen) pSen.textContent = uiState.gcSender.trim() || 'Vietnam Atlas Guest';

    // Scope & terms
    var scopeEl = document.getElementById('gc-redeem-scope');
    if (scopeEl) {
      var scopeTags = (gcMeta.redeemScope || ['Hotels & Homes', 'Tours', 'eSIM', 'Flights']).map(function (sc) {
        return '<span class="va-chip-mini">' + escHtml(sc) + '</span>';
      }).join('');
      scopeEl.innerHTML = '<span>' + (l === 'en' ? 'Redeemable for: ' : 'Áp dụng cho: ') + '</span>' + scopeTags;
    }

    var termsEl = document.getElementById('gc-terms-list');
    if (termsEl) {
      var terms = gcMeta.terms || [];
      termsEl.innerHTML = terms.map(function (tm) {
        return '<div class="va-term-card"><h4>' + escHtml(tm.title) + '</h4><p>' + escHtml(tm.detail) + '</p></div>';
      }).join('');
    }

    // Catalog Presets from store.getCollection('giftcards')
    var catGrid = document.getElementById('gc-catalog-grid');
    if (catGrid) {
      var inDossier = inDossierMap();
      catGrid.innerHTML = (lastSnap.giftcards || []).map(function (gc) {
        var added = Boolean(inDossier[gc.id]);
        var gPrices = formatDualShort(gc.amountVND);
        return '<div class="va-mini-item">' +
          '<div class="va-mini-item__info">' +
            '<p class="va-mini-item__title">' + escHtml(Store.pickText(gc, 'title', 'titleEn')) + '</p>' +
            '<span class="va-mini-item__sub va-nums">' + escHtml(gPrices.primary + ' (' + gPrices.secondary + ')') + '</span>' +
          '</div>' +
          '<button type="button" class="va-btn ' + (added ? 'va-btn--added' : 'va-btn--ghost') + '" data-add-giftcard="' + escHtml(gc.id) + '">' +
            escHtml(added ? copy('addedBtn') : '+') +
          '</button>' +
        '</div>';
      }).join('');
    }
  }

  /* ------------------------------------------------------------------------
     Module 7: Supports & Emergency Hotlines
     ------------------------------------------------------------------------ */
  function renderSupportsModule() {
    var sup = lastSnap.supports || {};
    var l = lang();

    var langNoteEl = document.getElementById('supports-lang-note');
    if (langNoteEl) {
      langNoteEl.textContent = l === 'en'
        ? 'Emergency lines operate primarily in Vietnamese; international travelers should ask hotel reception or use a translation app when calling.'
        : (sup.languageNote || '');
    }

    var hotGrid = document.getElementById('supports-hotlines-grid');
    if (hotGrid) {
      var nums = sup.emergencyNumbers || [];
      var enHotMap = {
        '112': { label: 'National Search & Rescue', detail: 'Storms, floods, landslides, and maritime incidents.' },
        '113': { label: 'Police', detail: 'Theft, public security, and serious traffic accidents.' },
        '114': { label: 'Fire & Rescue', detail: 'Fire emergencies and rescue operations.' },
        '115': { label: 'Medical Emergency', detail: 'Ambulance dispatch and trauma emergency.' },
        '111': { label: 'National Child Protection Hotline', detail: '24/7 emergency child safety support.' },
        '1080': { label: 'General Directory Hotline', detail: 'Local information and service inquiries.' }
      };
      hotGrid.innerHTML = nums.map(function (n) {
        var lbl = (l === 'en' && enHotMap[n.number]) ? enHotMap[n.number].label : n.label;
        var det = (l === 'en' && enHotMap[n.number]) ? enHotMap[n.number].detail : n.detail;
        return '<a class="va-hotline-card" href="tel:' + escHtml(n.number) + '">' +
          '<span class="va-hotline-num va-nums">' + escHtml(n.number) + '</span>' +
          '<div><h4>' + escHtml(lbl) + '</h4><p>' + escHtml(det) + '</p></div>' +
        '</a>';
      }).join('');
    }

    var polGrid = document.getElementById('supports-policies-grid');
    if (polGrid) {
      var policies = sup.weatherPolicies || [];
      var enPolList = [
        {
          region: 'Ha Long Bay (Quang Ninh)',
          authority: 'Quang Ninh Inland Waterway Port Authority & Ha Long Bay Management',
          rules: [
            'Cruise bans are issued during storms, tropical depressions, or high winds (often announced morning or noon of departure).',
            'Cancellation before leaving Hanoi (no services used): 100% refund or free date reschedule.',
            'Cancellation after arriving in Ha Long or early mid-cruise return (2D1N): billed only for used transfers/meals/night 1; remainder refunded.'
          ]
        },
        {
          region: 'Phu Quoc (Jul-Sep) & Nha Trang (Oct-Nov)',
          authority: 'Local Maritime Port Authority',
          rules: [
            'Island speedboats may pause during rough seas (Phu Quoc SW monsoon Jul-Sep, Nha Trang rainy peak Oct-Nov) per Port Authority directives.'
          ]
        },
        {
          region: 'OTA vs Direct Booking',
          authority: 'Refund Reconciliation Workflow',
          rules: [
            'Bookings made through third-party OTAs require OTA customer-service reconciliation with cruise/hotel operators, which adds processing time.'
          ]
        }
      ];
      polGrid.innerHTML = policies.map(function (p, idx) {
        var src = (l === 'en' && enPolList[idx]) ? enPolList[idx] : p;
        var rules = (src.rules || []).map(function (r) { return '<li>' + escHtml(r) + '</li>'; }).join('');
        return '<div class="va-policy-card">' +
          '<h4>' + escHtml(src.region) + '</h4>' +
          '<div class="va-policy-card__auth">' + escHtml(src.authority) + '</div>' +
          '<ul>' + rules + '</ul>' +
        '</div>';
      }).join('');
    }

    var chkGrid = document.getElementById('supports-checklist-grid');
    if (chkGrid) {
      var checks = sup.passengerChecklist || [];
      var enChecks = [
        {
          title: 'Domestic Aviation Check-in Windows',
          detail: 'Arrive 90-120 min early. Counters open 2 hours prior, close strictly 40 min before departure, and boarding gates close 15 min prior.'
        },
        {
          title: 'Power Banks & Domestic Liquids',
          detail: 'Power banks and Lithium batteries MUST go in carry-on baggage only (strictly banned in checked bags). Domestic Vietnam flights allow liquids within cabin weight limits (7 kg LCC Eco / 10 kg Vietnam Airlines).'
        }
      ];
      chkGrid.innerHTML = checks.map(function (c, idx) {
        var src = (l === 'en' && enChecks[idx]) ? enChecks[idx] : c;
        return '<div class="va-policy-card">' +
          '<h4>' + escHtml(src.title) + '</h4>' +
          '<p style="margin:0;font-size:0.86rem;color:var(--va-ink-soft);">' + escHtml(src.detail) + '</p>' +
        '</div>';
      }).join('');
    }
  }

  /* ------------------------------------------------------------------------
     Active Module Dispatcher
     ------------------------------------------------------------------------ */
  function renderActiveModule() {
    updateModeTabsAndBadges();
    if (uiState.mode === 'stays') renderStaysModule();
    else if (uiState.mode === 'map') renderMapModule();
    else if (uiState.mode === 'flights') renderFlightsModule();
    else if (uiState.mode === 'esim') renderEsimModule();
    else if (uiState.mode === 'tours') renderToursModule();
    else if (uiState.mode === 'giftcards') renderGiftcardsModule();
    else if (uiState.mode === 'supports') renderSupportsModule();
  }

  /* ------------------------------------------------------------------------
     Trip Dossier Drawer & Booking Checkout
     ------------------------------------------------------------------------ */
  function renderDossierDrawer() {
    var l = lang();
    var items = (lastSnap.draftDossier && lastSnap.draftDossier.items) || [];
    var totalVND = items.reduce(function (sum, it) {
      return sum + (Number(it.qty || 1) * Number(it.priceVND || 0));
    }, 0);

    // Weather Audit
    var weatherBox = document.getElementById('dossier-weather-audit');
    if (weatherBox) {
      var targetDest = uiState.cityId ? destFull(uiState.cityId) : null;
      var st = Store.getSeasonStatus(targetDest || null, uiState.travelMonth, l);
      weatherBox.className = 'va-drawer-weather va-season-banner--' + st.code;
      weatherBox.innerHTML = '<strong>' + (l === 'en' ? 'Climate Check (' + copy('monthPrefix') + uiState.travelMonth + '): ' : 'Kiểm tra khí hậu (Tháng ' + uiState.travelMonth + '): ') +
        escHtml(st.label) + '</strong><br><span>' + escHtml(st.note || '') + '</span>';
    }

    // Items list
    var listEl = document.getElementById('dossier-items-list');
    if (listEl) {
      if (items.length === 0) {
        listEl.innerHTML = '<div class="va-empty-state" style="padding:1.35rem;"><p style="margin:0;">' + escHtml(copy('emptyDossier')) + '</p></div>';
      } else {
        listEl.innerHTML = items.map(function (it) {
          var lineVND = Number(it.qty || 1) * Number(it.priceVND || 0);
          return '<div class="va-dossier-item">' +
            '<div class="va-dossier-item__top">' +
              '<div>' +
                '<span class="va-tag va-tag--soft">' + escHtml(String(it.kind || 'item').toUpperCase()) + '</span>' +
                '<p class="va-dossier-item__title">' + escHtml(it.title) + '</p>' +
              '</div>' +
              '<button type="button" class="va-btn-text" data-remove-dossier="' + escHtml(it.id) + '">' + (l === 'en' ? 'Remove' : 'Xóa') + '</button>' +
            '</div>' +
            '<div class="va-dossier-item__bottom">' +
              '<div class="va-qty-stepper">' +
                '<button type="button" data-qty-delta="-1" data-qty-id="' + escHtml(it.id) + '" aria-label="Decrease quantity">-</button>' +
                '<span class="va-nums">' + escHtml(it.qty || 1) + '</span>' +
                '<button type="button" data-qty-delta="1" data-qty-id="' + escHtml(it.id) + '" aria-label="Increase quantity">+</button>' +
              '</div>' +
              '<strong class="va-nums">' + escHtml(Store.formatPrice(lineVND)) + '</strong>' +
            '</div>' +
          '</div>';
        }).join('');
      }
    }

    var pTotal = document.getElementById('dossier-total-primary');
    var sTotal = document.getElementById('dossier-total-secondary');
    var dual = formatDualShort(totalVND);
    if (pTotal) pTotal.textContent = dual.primary;
    if (sTotal) sTotal.textContent = dual.secondary;

    var chkDep = document.getElementById('chk-depart');
    var chkRet = document.getElementById('chk-return');
    if (chkDep && !chkDep.dataset.dirty) chkDep.value = uiState.departureDate;
    if (chkRet && !chkRet.dataset.dirty) chkRet.value = uiState.returnDate;
  }

  function openDossierDrawer() {
    var drawer = document.getElementById('dossier-drawer');
    var backdrop = document.getElementById('dossier-backdrop');
    if (!drawer || !backdrop) return;
    var toast = document.getElementById('portal-toast');
    if (toast) toast.hidden = true;
    lastFocusedBeforeDrawer = document.activeElement;
    renderDossierDrawer();
    backdrop.hidden = false;
    drawer.hidden = false;
    var closeBtn = document.getElementById('close-dossier-btn');
    if (closeBtn) closeBtn.focus();
  }

  function closeDossierDrawer() {
    var drawer = document.getElementById('dossier-drawer');
    var backdrop = document.getElementById('dossier-backdrop');
    if (!drawer || !backdrop) return;
    drawer.hidden = true;
    backdrop.hidden = true;
    if (lastFocusedBeforeDrawer && typeof lastFocusedBeforeDrawer.focus === 'function') {
      lastFocusedBeforeDrawer.focus();
    }
  }

  /* ------------------------------------------------------------------------
     Event Wiring
     ------------------------------------------------------------------------ */
  function bindEvents() {
    // 7 IA Mode tabs
    document.querySelectorAll('.va-mode-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var next = tab.getAttribute('data-mode');
        if (VALID_MODES.indexOf(next) !== -1 && next !== uiState.mode) {
          uiState.mode = next;
          syncUrlState();
          renderActiveModule();
        }
      });
    });

    // Mobile drawer menu toggle
    var menuToggle = document.getElementById('mobile-menu-toggle');
    var mobileDrawer = document.getElementById('mobile-nav-drawer');
    if (menuToggle && mobileDrawer) {
      menuToggle.addEventListener('click', function () {
        var nextOpen = mobileDrawer.hidden;
        mobileDrawer.hidden = !nextOpen;
        menuToggle.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      });
    }

    // VI / EN toggle
    document.querySelectorAll('[data-lang-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        Store.setLang(btn.getAttribute('data-lang-btn'));
      });
    });

    // VND / USD toggle
    document.querySelectorAll('[data-currency-btn]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        Store.setCurrency(btn.getAttribute('data-currency-btn'));
      });
    });

    // Search form prevent default GET reload
    var searchForm = document.getElementById('portal-search-form');
    if (searchForm) {
      searchForm.addEventListener('submit', function (e) { e.preventDefault(); });
    }

    // Trip mode (Round-Trip / One-way)
    document.querySelectorAll('[data-trip-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.tripType = btn.getAttribute('data-trip-type') === 'one-way' ? 'one-way' : 'round-trip';
        persistSearchDraft();
        syncUrlState();
        renderSearchBarState();
        renderActiveModule();
        renderDossierDrawer();
      });
    });

    // City select
    var citySelect = document.getElementById('search-city-select');
    if (citySelect) {
      citySelect.addEventListener('change', function () {
        uiState.cityId = citySelect.value;
        if (uiState.cityId) {
          uiState.mapFocusCityId = uiState.cityId;
          var d = destFull(uiState.cityId);
          uiState.flightDest = (d && d.gatewayAirport) ? d.gatewayAirport : 'ALL';
        } else {
          uiState.flightDest = 'ALL';
        }
        persistSearchDraft();
        syncUrlState();
        renderSearchBarState();
        renderActiveModule();
      });
    }

    // Departure / Return dates
    var depInput = document.getElementById('search-depart-date');
    var retInput = document.getElementById('search-return-date');
    if (depInput) {
      depInput.addEventListener('change', function () {
        uiState.departureDate = depInput.value || '2026-03-18';
        uiState.travelMonth = parseMonthFromDate(uiState.departureDate, uiState.travelMonth);
        if (retInput && uiState.returnDate < uiState.departureDate) {
          uiState.returnDate = uiState.departureDate;
        }
        persistSearchDraft();
        syncUrlState();
        renderSearchBarState();
        renderActiveModule();
      });
    }
    if (retInput) {
      retInput.addEventListener('change', function () {
        if (retInput.value && retInput.value < uiState.departureDate) {
          retInput.value = uiState.departureDate;
        }
        uiState.returnDate = retInput.value || uiState.departureDate;
        persistSearchDraft();
        syncUrlState();
        renderSearchBarState();
        renderActiveModule();
      });
    }

    // Budget slider & pills
    var budgetSlider = document.getElementById('search-budget-slider');
    if (budgetSlider) {
      budgetSlider.addEventListener('input', function () {
        var val = Number(budgetSlider.value || 10000000);
        uiState.budgetCapVND = val;
        uiState.budgetTier = val >= 10000000 ? 'all' : 'custom';
        syncUrlState();
        renderSearchBarState();
        renderActiveModule();
      });
    }

    document.querySelectorAll('[data-budget-tier]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var t = btn.getAttribute('data-budget-tier');
        uiState.budgetTier = t;
        if (t === 'budget') uiState.budgetCapVND = 800000;
        else if (t === 'mid') uiState.budgetCapVND = 2500000;
        else uiState.budgetCapVND = 10000000;
        persistSearchDraft();
        syncUrlState();
        renderSearchBarState();
        renderActiveModule();
      });
    });

    var resetBtn = document.getElementById('reset-filters-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', resetAllFilters);
    }

    // Stays controls
    document.querySelectorAll('[data-stay-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.staySubType = btn.getAttribute('data-stay-type');
        renderStaysModule();
      });
    });
    var stayKw = document.getElementById('stays-keyword');
    if (stayKw) {
      stayKw.addEventListener('input', function () {
        uiState.stayKeyword = stayKw.value;
        renderStaysModule();
      });
    }
    var staySort = document.getElementById('stays-sort');
    if (staySort) {
      staySort.addEventListener('change', function () {
        uiState.staySort = staySort.value;
        renderStaysModule();
      });
    }

    // Flights selectors
    var flOrigin = document.getElementById('flight-origin-select');
    var flDest = document.getElementById('flight-dest-select');
    if (flOrigin) {
      flOrigin.addEventListener('change', function () {
        uiState.flightOrigin = flOrigin.value;
        renderFlightsModule();
      });
    }
    if (flDest) {
      flDest.addEventListener('change', function () {
        uiState.flightDest = flDest.value;
        renderFlightsModule();
      });
    }
    document.querySelectorAll('[data-flight-fare]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.flightFareClass = btn.getAttribute('data-flight-fare');
        renderFlightsModule();
      });
    });

    // eSIM filters
    document.querySelectorAll('[data-esim-provider]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.esimProvider = btn.getAttribute('data-esim-provider');
        renderEsimModule();
      });
    });
    document.querySelectorAll('[data-esim-days]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.esimDays = btn.getAttribute('data-esim-days');
        renderEsimModule();
      });
    });

    // Tours filters
    document.querySelectorAll('[data-tour-duration]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.tourDuration = btn.getAttribute('data-tour-duration');
        renderToursModule();
      });
    });
    document.querySelectorAll('[data-tour-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        uiState.tourType = btn.getAttribute('data-tour-type');
        renderToursModule();
      });
    });
    var tourKw = document.getElementById('tours-keyword');
    if (tourKw) {
      tourKw.addEventListener('input', function () {
        uiState.tourKeyword = tourKw.value;
        renderToursModule();
      });
    }

    // Giftcard Studio live inputs
    var gcCustom = document.getElementById('gc-custom-amount');
    var gcRec = document.getElementById('gc-recipient-input');
    var gcSen = document.getElementById('gc-sender-input');
    var gcNote = document.getElementById('gc-note-input');
    var gcAddBtn = document.getElementById('gc-add-btn');

    if (gcCustom) {
      gcCustom.addEventListener('input', function () {
        var v = Math.max(500000, Math.min(50000000, Number(gcCustom.value || 500000)));
        uiState.gcAmountVND = v;
        renderGiftcardsModule();
      });
    }
    if (gcRec) {
      gcRec.addEventListener('input', function () {
        uiState.gcRecipient = gcRec.value;
        renderGiftcardsModule();
      });
    }
    if (gcSen) {
      gcSen.addEventListener('input', function () {
        uiState.gcSender = gcSen.value;
        renderGiftcardsModule();
      });
    }
    if (gcNote) {
      gcNote.addEventListener('input', function () {
        uiState.gcNote = gcNote.value;
        renderGiftcardsModule();
      });
    }
    if (gcAddBtn) {
      gcAddBtn.addEventListener('click', function () {
        var themes = (lastSnap.giftcardMeta && lastSnap.giftcardMeta.themes) || [];
        var th = themes.filter(function (x) { return x.id === uiState.gcThemeId; })[0] || { id: 'island', label: 'Nghỉ dưỡng Biển Đảo' };
        var amt = Math.max(500000, Number(uiState.gcAmountVND || 2000000));
        var rec = uiState.gcRecipient.trim() || (lang() === 'en' ? 'Traveler' : 'Quý khách');
        addItemToDossier({
          id: 'gc-custom-' + th.id + '-' + amt + '-' + Date.now().toString(36).slice(-4),
          kind: 'giftcard',
          title: 'E-Giftcard ' + Store.formatPrice(amt, 'VND') + ' (' + th.label + ' -> ' + rec + ')',
          priceVND: amt,
          qty: 1
        });
      });
    }

    // Delegated clicks inside workspace (Add Stay, Tour, Flight, eSIM, Map select, Jump mode, Giftcards)
    var workspace = document.getElementById('portal-workspace');
    if (workspace) {
      workspace.addEventListener('click', function (e) {
        var target = e.target;
        var el;

        if ((el = target.closest('[data-add-stay]'))) {
          var sid = el.getAttribute('data-add-stay');
          var s = lastSnap.stays.filter(function (x) { return x.id === sid; })[0];
          if (s) {
            var nights = s.accommodationType === 'Cruises' ? 1 : calcNights();
            addItemToDossier({
              id: s.id,
              kind: 'stay',
              destinationId: s.destinationId,
              title: s.name + ' (' + destLabel(s.destinationId) + ')',
              priceVND: Number(s.pricePerNightVND || 0),
              qty: nights
            });
          }
          return;
        }

        if ((el = target.closest('[data-add-tour]'))) {
          var tid = el.getAttribute('data-add-tour');
          var t = lastSnap.tours.filter(function (x) { return x.id === tid; })[0];
          if (t) {
            addItemToDossier({
              id: t.id,
              kind: 'tour',
              destinationId: t.destinationId,
              title: t.title,
              priceVND: Number(t.priceVND || 0),
              qty: 1
            });
          }
          return;
        }

        if ((el = target.closest('[data-add-flight]'))) {
          var fid = el.getAttribute('data-add-flight');
          var r = lastSnap.flights.filter(function (x) { return x.id === fid; })[0];
          if (r) {
            var isRound = uiState.tripType === 'round-trip';
            var isFull = uiState.flightFareClass === 'full';
            var baseOneWay = (isFull && r.fullServiceOneWayVND) ? r.fullServiceOneWayVND : (r.lccOneWayVND || [700000, 1200000]);
            var rtRange = r.roundTripRangeVND || [baseOneWay[0] * 2, baseOneWay[1] * 2];
            var range = isRound
              ? [Math.round(rtRange[0] * (isFull ? 1.35 : 1)), Math.round(rtRange[1] * (isFull ? 1.35 : 1))]
              : baseOneWay;
            var fare = Math.round((range[0] + range[1]) / 2);
            addItemToDossier({
              id: r.id + '-' + uiState.tripType + '-' + uiState.flightFareClass,
              kind: 'flight',
              title: r.from + ' -> ' + r.to + ' (' + (isRound ? copy('roundTrip') : copy('oneWay')) + ', ' + (isFull ? 'Full-Service' : 'Eco/LCC') + ')',
              priceVND: fare,
              qty: 1
            });
          }
          return;
        }

        if ((el = target.closest('[data-add-esim]'))) {
          var eid = el.getAttribute('data-add-esim');
          var es = lastSnap.esims.filter(function (x) { return x.id === eid; })[0];
          if (es) {
            addItemToDossier({
              id: es.id,
              kind: 'esim',
              title: es.providerGroup + ' · ' + es.planCode + ' (' + es.dataAllowance + ')',
              priceVND: Number(es.priceVND || Math.round((es.priceUSD || 5) * 25000)),
              qty: 1
            });
          }
          return;
        }

        if ((el = target.closest('[data-add-giftcard]'))) {
          var gid = el.getAttribute('data-add-giftcard');
          var gc = lastSnap.giftcards.filter(function (x) { return x.id === gid; })[0];
          if (gc) {
            addItemToDossier({
              id: gc.id,
              kind: 'giftcard',
              title: Store.pickText(gc, 'title', 'titleEn'),
              priceVND: Number(gc.amountVND || 0),
              qty: 1
            });
          }
          return;
        }

        if ((el = target.closest('[data-gc-theme]'))) {
          uiState.gcThemeId = el.getAttribute('data-gc-theme');
          renderGiftcardsModule();
          return;
        }

        if ((el = target.closest('[data-gc-denom]'))) {
          uiState.gcAmountVND = Number(el.getAttribute('data-gc-denom'));
          renderGiftcardsModule();
          return;
        }

        if ((el = target.closest('[data-map-month]'))) {
          uiState.travelMonth = Number(el.getAttribute('data-map-month'));
          persistSearchDraft();
          renderSearchBarState();
          renderMapModule();
          return;
        }

        if ((el = target.closest('[data-map-city]'))) {
          uiState.mapFocusCityId = el.getAttribute('data-map-city');
          renderMapModule();
          return;
        }

        if ((el = target.closest('[data-jump-city]'))) {
          var nextCity = el.getAttribute('data-jump-city');
          var nextMode = el.getAttribute('data-jump-mode') || 'stays';
          uiState.cityId = nextCity;
          uiState.mapFocusCityId = nextCity;
          var destObj = destFull(nextCity);
          uiState.flightDest = (destObj && destObj.gatewayAirport) ? destObj.gatewayAirport : 'ALL';
          uiState.mode = nextMode;
          var sel = document.getElementById('search-city-select');
          if (sel) sel.value = nextCity;
          persistSearchDraft();
          syncUrlState();
          renderSearchBarState();
          renderActiveModule();
          global.scrollTo({ top: 0, behavior: 'smooth' });
          return;
        }

        if ((el = target.closest('[data-action="reset-all"]'))) {
          resetAllFilters();
          return;
        }
        if ((el = target.closest('[data-action="reset-flights"]'))) {
          uiState.flightOrigin = 'ALL';
          uiState.flightDest = 'ALL';
          uiState.budgetTier = 'all';
          uiState.budgetCapVND = 10000000;
          renderSearchBarState();
          renderFlightsModule();
        }
      });

      // Keyboard selection for SVG map hub nodes
      workspace.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          var hub = e.target.closest('[data-map-city]');
          if (hub) {
            e.preventDefault();
            uiState.mapFocusCityId = hub.getAttribute('data-map-city');
            renderMapModule();
          }
        }
      });
    }

    // Dossier Drawer open/close/actions
    var openBtn = document.getElementById('open-dossier-btn');
    var mobOpenBtn = document.getElementById('mobile-bar-open-btn');
    var closeBtn = document.getElementById('close-dossier-btn');
    var backdrop = document.getElementById('dossier-backdrop');
    var toastAction = document.getElementById('portal-toast-action');

    if (openBtn) openBtn.addEventListener('click', openDossierDrawer);
    if (mobOpenBtn) mobOpenBtn.addEventListener('click', openDossierDrawer);
    if (closeBtn) closeBtn.addEventListener('click', closeDossierDrawer);
    if (backdrop) backdrop.addEventListener('click', closeDossierDrawer);
    if (toastAction) toastAction.addEventListener('click', openDossierDrawer);

    document.addEventListener('keydown', function (e) {
      var drawer = document.getElementById('dossier-drawer');
      if (e.key === 'Escape' && drawer && !drawer.hidden) {
        closeDossierDrawer();
      }
    });

    var clearBtn = document.getElementById('clear-dossier-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', function () {
        Store.clearDossier();
        lastSnap = Store.getAll();
        renderHeaderDossier();
        renderDossierDrawer();
        renderActiveModule();
      });
    }

    var drawerItems = document.getElementById('dossier-items-list');
    if (drawerItems) {
      drawerItems.addEventListener('click', function (e) {
        var rem = e.target.closest('[data-remove-dossier]');
        if (rem) {
          Store.removeFromDossier(rem.getAttribute('data-remove-dossier'));
          lastSnap = Store.getAll();
          renderHeaderDossier();
          renderDossierDrawer();
          renderActiveModule();
          return;
        }
        var qtyBtn = e.target.closest('[data-qty-delta]');
        if (qtyBtn) {
          var qId = qtyBtn.getAttribute('data-qty-id');
          var delta = Number(qtyBtn.getAttribute('data-qty-delta'));
          var curItems = (lastSnap.draftDossier && lastSnap.draftDossier.items) || [];
          var item = curItems.filter(function (x) { return x.id === qId; })[0];
          if (item) {
            var nextQty = Number(item.qty || 1) + delta;
            if (nextQty <= 0) Store.removeFromDossier(qId);
            else Store.addToDossier(Object.assign({}, item, { qty: nextQty }));
            lastSnap = Store.getAll();
            renderHeaderDossier();
            renderDossierDrawer();
            renderActiveModule();
          }
        }
      });
    }

    // Checkout form validation & submission via Store.addBooking (POST/JS only)
    var chkForm = document.getElementById('dossier-checkout-form');
    if (chkForm) {
      var chkDep = document.getElementById('chk-depart');
      var chkRet = document.getElementById('chk-return');
      if (chkDep) chkDep.addEventListener('change', function () { chkDep.dataset.dirty = '1'; });
      if (chkRet) chkRet.addEventListener('change', function () { chkRet.dataset.dirty = '1'; });

      chkForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var l = lang();
        var errBox = document.getElementById('checkout-error');
        var receiptBox = document.getElementById('booking-receipt');
        if (errBox) { errBox.hidden = true; errBox.textContent = ''; }
        if (receiptBox) { receiptBox.hidden = true; receiptBox.innerHTML = ''; }

        var items = (lastSnap.draftDossier && lastSnap.draftDossier.items) || [];
        var name = document.getElementById('chk-name').value.trim();
        var email = document.getElementById('chk-email').value.trim();
        var phone = document.getElementById('chk-phone').value.trim();
        var guests = Math.max(1, Number(document.getElementById('chk-guests').value || 1));
        var travelerType = document.getElementById('chk-traveler-type').value;
        var travelDate = document.getElementById('chk-depart').value || uiState.departureDate;
        var returnDate = uiState.tripType === 'one-way' ? '' : (document.getElementById('chk-return').value || uiState.returnDate);
        var notes = document.getElementById('chk-notes').value.trim();

        var errors = [];
        if (items.length === 0) {
          errors.push(l === 'en' ? 'Please add at least one service before confirming.' : 'Vui lòng chọn ít nhất một dịch vụ vào giỏ hành trình trước khi xác nhận.');
        }
        if (name.length < 2) {
          errors.push(l === 'en' ? 'Enter traveler full name.' : 'Vui lòng nhập họ và tên.');
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          errors.push(l === 'en' ? 'Enter a valid email address.' : 'Vui lòng nhập email hợp lệ.');
        }
        if (phone.length < 7) {
          errors.push(l === 'en' ? 'Enter a valid phone or WhatsApp number.' : 'Vui lòng nhập số điện thoại / WhatsApp hợp lệ.');
        }

        if (errors.length > 0) {
          if (errBox) {
            errBox.textContent = errors.join(' ');
            errBox.hidden = false;
          }
          return;
        }

        var totalVND = items.reduce(function (sum, it) {
          return sum + (Number(it.qty || 1) * Number(it.priceVND || 0));
        }, 0);

        var booking = Store.addBooking({
          sourcePage: 'explore.html',
          status: 'pending',
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          travelerType: travelerType,
          travelDate: travelDate,
          returnDate: returnDate,
          travelMonth: parseMonthFromDate(travelDate, uiState.travelMonth),
          guests: guests,
          currency: Store.getCurrency(),
          lang: l,
          items: items,
          totalVND: totalVND,
          notes: notes
        });

        Store.clearDossier();
        lastSnap = Store.getAll();
        renderHeaderDossier();
        renderDossierDrawer();
        renderActiveModule();

        if (receiptBox) {
          receiptBox.hidden = false;
          receiptBox.innerHTML =
            '<strong>' + (l === 'en' ? 'Booking Confirmed in Store: ' : 'Đã lưu hành trình thành công: ') + escHtml(booking.id) + '</strong>' +
            '<div>' + escHtml(booking.customerName + ' · ' + booking.guests + (l === 'en' ? ' guests · ' : ' khách · ') + Store.formatPriceDual(booking.totalVND)) + '</div>' +
            '<div class="va-booking-receipt__actions">' +
              '<a class="va-btn va-btn--primary" href="admin.html">' + escHtml(copy('viewInAdmin')) + '</a>' +
              '<button type="button" class="va-btn va-btn--ghost" id="download-receipt-json">' + (l === 'en' ? 'Export JSON' : 'Tải JSON đơn') + '</button>' +
            '</div>';

          var dlBtn = document.getElementById('download-receipt-json');
          if (dlBtn) {
            dlBtn.addEventListener('click', function () {
              var blob = new Blob([JSON.stringify(booking, null, 2)], { type: 'application/json' });
              var url = URL.createObjectURL(blob);
              var a = document.createElement('a');
              a.href = url;
              a.download = booking.id + '.json';
              a.click();
              URL.revokeObjectURL(url);
            });
          }
        }
      });
    }

    // Working Support Inquiry Form (saves via Store.addBooking)
    var supForm = document.getElementById('support-inquiry-form');
    if (supForm) {
      supForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var l = lang();
        var fb = document.getElementById('support-form-feedback');
        if (fb) { fb.hidden = true; fb.className = 'va-form-feedback'; fb.textContent = ''; }

        var name = document.getElementById('sup-name').value.trim();
        var email = document.getElementById('sup-email').value.trim();
        var phone = document.getElementById('sup-phone').value.trim();
        var travelerType = document.getElementById('sup-traveler-type').value;
        var topicSel = document.getElementById('sup-topic');
        var topicLabel = topicSel.options[topicSel.selectedIndex] ? topicSel.options[topicSel.selectedIndex].textContent : topicSel.value;
        var travelDate = document.getElementById('sup-date').value || uiState.departureDate;
        var details = document.getElementById('sup-notes').value.trim();

        var errors = [];
        if (name.length < 2) errors.push(l === 'en' ? 'Enter your name.' : 'Nhập họ tên.');
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push(l === 'en' ? 'Enter a valid email.' : 'Nhập email hợp lệ.');
        if (phone.length < 7) errors.push(l === 'en' ? 'Enter phone or WhatsApp.' : 'Nhập số điện thoại.');
        if (details.length < 5) errors.push(l === 'en' ? 'Enter inquiry details.' : 'Nhập nội dung yêu cầu.');

        if (errors.length > 0) {
          if (fb) {
            fb.hidden = false;
            fb.className = 'va-form-feedback is-error';
            fb.textContent = errors.join(' ');
          }
          return;
        }

        var record = Store.addBooking({
          sourcePage: 'explore.html#supports',
          status: 'pending',
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          travelerType: travelerType,
          travelDate: travelDate,
          travelMonth: parseMonthFromDate(travelDate, uiState.travelMonth),
          guests: 1,
          currency: Store.getCurrency(),
          lang: l,
          items: [
            {
              id: 'sup-' + topicSel.value + '-' + Date.now().toString(36).slice(-4),
              kind: 'support',
              title: '[' + (l === 'en' ? 'Support' : 'Hỗ trợ') + '] ' + topicLabel,
              priceVND: 0,
              qty: 1
            }
          ],
          totalVND: 0,
          notes: details
        });

        supForm.reset();
        if (fb) {
          fb.hidden = false;
          fb.className = 'va-form-feedback is-success';
          fb.innerHTML =
            '<strong>' + (l === 'en' ? 'Support Inquiry Logged: ' : 'Đã ghi nhận yêu cầu hỗ trợ: ') + escHtml(record.id) + '</strong> · ' +
            (l === 'en' ? 'Visible immediately inside ' : 'Đã đồng bộ trực tiếp vào ') +
            '<a href="admin.html" style="font-weight:700;color:inherit;">admin.html</a>.';
        }
      });
    }
  }

  function resetAllFilters() {
    uiState.cityId = '';
    uiState.budgetTier = 'all';
    uiState.budgetCapVND = 10000000;
    uiState.staySubType = 'all';
    uiState.stayKeyword = '';
    uiState.staySort = 'featured';
    uiState.flightOrigin = 'ALL';
    uiState.flightDest = 'ALL';
    uiState.esimProvider = 'all';
    uiState.esimDays = 'all';
    uiState.tourDuration = 'all';
    uiState.tourType = 'all';
    uiState.tourKeyword = '';

    var citySelect = document.getElementById('search-city-select');
    if (citySelect) citySelect.value = '';
    var stayKw = document.getElementById('stays-keyword');
    if (stayKw) stayKw.value = '';
    var tourKw = document.getElementById('tours-keyword');
    if (tourKw) tourKw.value = '';
    var staySort = document.getElementById('stays-sort');
    if (staySort) staySort.value = 'featured';

    persistSearchDraft();
    syncUrlState();
    renderSearchBarState();
    renderActiveModule();
  }

  /* ------------------------------------------------------------------------
     Reactive Store Subscription (Cross-Tab CMS & Showcase Sync)
     ------------------------------------------------------------------------ */
  Store.subscribe(function (snap, meta) {
    lastSnap = snap;
    if (meta && (meta.type === 'lang' || meta.type === 'broadcast' || meta.type === 'storage-event' || meta.type === 'resetToSeed')) {
      applyStaticCopy();
      renderCityOptions();
    } else if (meta && meta.collection === 'destinations') {
      renderCityOptions();
    }
    renderSearchBarState();
    renderHeaderDossier();
    renderActiveModule();
    var drawer = document.getElementById('dossier-drawer');
    if (drawer && !drawer.hidden) {
      renderDossierDrawer();
    }
  });

  /* ------------------------------------------------------------------------
     Boot
     ------------------------------------------------------------------------ */
  function init() {
    hydrateFromUrlAndDraft();
    applyStaticCopy();
    renderCityOptions();
    var stayKw = document.getElementById('stays-keyword');
    if (stayKw && uiState.stayKeyword) stayKw.value = uiState.stayKeyword;
    var tourKw = document.getElementById('tours-keyword');
    if (tourKw && uiState.tourKeyword) tourKw.value = uiState.tourKeyword;
    renderSearchBarState();
    renderHeaderDossier();
    renderActiveModule();
    bindEvents();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
