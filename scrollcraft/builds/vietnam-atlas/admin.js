/* ==========================================================================
   Vietnam Atlas CMS · Editorial Content & Booking Admin Logic (admin.js)
   Backed by window.VietnamAtlasStore (localStorage + BroadcastChannel sync).
   ========================================================================== */
(function (global) {
  'use strict';

  var store = global.VietnamAtlasStore;
  if (!store) {
    console.error('[VietnamAtlasCMS] window.VietnamAtlasStore not found. Ensure data.js and store.js load before admin.js.');
    return;
  }

  // Sunlit coastal fallback landscape SVG for pending or custom image URLs
  var FALLBACK_SVG =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 180">' +
      '<rect width="320" height="180" fill="#EDF3F0"/>' +
      '<circle cx="252" cy="48" r="22" fill="#FFFFFF"/>' +
      '<path d="M0 142 Q62 104 128 128 T260 112 L320 132 L320 180 L0 180 Z" fill="#D4E4DD"/>' +
      '<path d="M0 156 Q96 122 184 146 T320 140 L320 180 L0 180 Z" fill="#096B5C" opacity="0.22"/>' +
      '<text x="16" y="34" font-family="sans-serif" font-size="12" font-weight="600" fill="#435A56">Vietnam Atlas Media</text>' +
      '</svg>'
    );

  var PHOTO_PRESETS = [
    { group: 'Ảnh điểm đến (assets/photos/)', groupEn: 'Destination Photos (assets/photos/)', items: [
      { label: 'Đà Nẵng · Hội An (danang.webp)', value: 'assets/photos/danang.webp' },
      { label: 'Hòa Bình · Mai Châu (hoabinh.webp)', value: 'assets/photos/hoabinh.webp' },
      { label: 'Nha Trang (nhatrang.webp)', value: 'assets/photos/nhatrang.webp' },
      { label: 'Phú Quốc (phuquoc.webp)', value: 'assets/photos/phuquoc.webp' },
      { label: 'Vịnh Hạ Long (halong.webp)', value: 'assets/photos/halong.webp' },
      { label: 'Hà Nội (hanoi.webp)', value: 'assets/photos/hanoi.webp' },
      { label: 'Sa Pa (sapa.webp)', value: 'assets/photos/sapa.webp' },
      { label: 'Ninh Bình (ninhbinh.webp)', value: 'assets/photos/ninhbinh.webp' },
      { label: 'Huế (hue.webp)', value: 'assets/photos/hue.webp' },
      { label: 'Đà Lạt (dalat.webp)', value: 'assets/photos/dalat.webp' },
      { label: 'TP. Hồ Chí Minh (hcmc.webp)', value: 'assets/photos/hcmc.webp' }
    ]},
    { group: 'Ảnh lưu trú & hoạt động (assets/photos/)', groupEn: 'Hospitality & Tour Photos (assets/photos/)', items: [
      { label: 'Hồ bơi Resort (resort-pool.webp)', value: 'assets/photos/resort-pool.webp' },
      { label: 'Phòng Suite Khách sạn (hotel-suite.webp)', value: 'assets/photos/hotel-suite.webp' },
      { label: 'Cabin Du thuyền (cruise-cabin.webp)', value: 'assets/photos/cruise-cabin.webp' },
      { label: 'Lặn biển & Đảo (island-snorkeling.webp)', value: 'assets/photos/island-snorkeling.webp' },
      { label: 'Homestay Mai Châu (maichau-homestay.webp)', value: 'assets/photos/maichau-homestay.webp' }
    ]},
    { group: 'Ảnh biên tập (assets/gen/)', groupEn: 'Editorial Stills (assets/gen/)', items: [
      { label: 'Bình minh Hòa Bình (hoabinh-dawn.webp)', value: 'assets/gen/hoabinh-dawn.webp' },
      { label: 'eSIM Flatlay (esim-still.webp)', value: 'assets/gen/esim-still.webp' },
      { label: 'Giftcard Flatlay (giftcard-still.webp)', value: 'assets/gen/giftcard-still.webp' }
    ]}
  ];

  var AIRLINES_LIST = [
    'Vietnam Airlines',
    'Vietjet Air',
    'Bamboo Airways',
    'Vietravel Airlines',
    'Sun PhuQuoc Airways'
  ];

  var GIFTCARD_THEMES = [
    { id: 'island', vi: 'Nghỉ dưỡng Biển Đảo', en: 'Island & Beach Escape', sampleDest: 'Phú Quốc · Nha Trang · Đà Nẵng' },
    { id: 'northwest', vi: 'Khám phá Tây Bắc', en: 'Northwest Mountain Trail', sampleDest: 'Hòa Bình · Mai Châu · Sa Pa' },
    { id: 'halong', vi: 'Du thuyền Hạ Long', en: 'Ha Long Bay Cruise', sampleDest: 'Vịnh Hạ Long · Quảng Ninh' }
  ];

  var REDEEM_SCOPE_ALL = ['Hotels & Homes', 'Tours', 'eSIM', 'Flights'];

  var uiState = {
    activeTab: 'overview',
    activeSubtab: 'flights',
    overviewMonth: 3,
    filters: {
      destSearch: '',
      destRegion: 'all',
      staySearch: '',
      stayDest: 'all',
      stayCat: 'all',
      stayTier: 'all',
      tourSearch: '',
      tourDest: 'all',
      tourWeather: 'all',
      flightSearch: '',
      esimSearch: '',
      giftcardSearch: '',
      bookingStatus: 'all',
      bookingSearch: ''
    },
    lastSyncLabel: '--:--',
    modalAction: null,
    lastFocusedBeforeOverlay: null
  };

  var I18N = {
    vi: {
      docTitle: 'Vietnam Atlas · Quản trị CMS & Điều phối Đặt chỗ',
      skipLink: 'Chuyển tới nội dung CMS',
      brandTag: 'Quản trị CMS',
      siteHome: 'Trang chủ',
      sitePortal: 'Web Đặt dịch vụ',
      siteAdmin: 'Quản trị CMS',
      btnExport: 'Xuất JSON',
      btnImport: 'Nhập JSON',
      btnReset: 'Khôi phục mẫu',
      mobileSitesTitle: 'Hệ sinh thái Vietnam Atlas',
      mobileToolsTitle: 'Công cụ dữ liệu',
      storeKeyLabel: 'Kho dữ liệu:',
      syncChannelLabel: 'Kênh đồng bộ:',
      mastheadTitle: 'Biên tập Nội dung & Điều phối Đặt chỗ',
      mastheadSub: 'Mọi thay đổi về điểm đến, giá phòng, tour, chuyến bay, eSIM, thẻ quà tặng và trạng thái đơn hàng được lưu vào localStorage và đồng bộ tức thì tới trang chủ và cổng đặt dịch vụ.',
      previewLanding: 'Xem Trang chủ',
      previewPortal: 'Xem Web Đặt dịch vụ',
      tabOverview: 'Tổng quan',
      tabDestinations: 'Điểm đến',
      tabStays: 'Hotels & Homes',
      tabTours: 'Tours & Vé',
      tabCatalogOps: 'Flights · eSIM · Giftcards',
      tabBookings: 'Đơn đặt chỗ & Hỗ trợ',
      ovRecentTitle: 'Đơn đặt chỗ & Yêu cầu hỗ trợ mới nhất',
      ovRecentDesc: 'Cập nhật tự động khi khách đặt từ index.html hoặc explore.html.',
      ovManageAll: 'Quản lý tất cả',
      ovPreviewTitle: 'Liên kết xem trước trực tiếp',
      ovPreviewDesc: 'Mở trang khách trong tab mới để kiểm chứng đồng bộ BroadcastChannel.',
      ovLinkPortalTitle: 'Xem trước trên Cổng Đặt dịch vụ (explore.html)',
      ovLinkPortalSub: 'Kiểm tra bản đồ, tìm kiếm, lưu trú, chuyến bay, eSIM, thẻ quà tặng',
      ovLinkLandingTitle: 'Xem trước trên Trang chủ (index.html)',
      ovLinkLandingSub: 'Kiểm tra trang giới thiệu hành trình Scroll-Craft và hồ sơ mẫu',
      ovSeasonTitle: 'Kiểm tra mùa khô & cảnh báo thời tiết 11 điểm',
      ovSeasonDesc: 'Chọn tháng bất kỳ để đối chiếu bảng bestMonths và rainyMonths.',
      filterAllRegions: 'Tất cả 3 miền',
      regionNorth: 'Miền Bắc',
      regionCentral: 'Miền Trung',
      regionSouth: 'Miền Nam',
      btnAddDestination: '+ Thêm điểm đến',
      stayCatAll: 'Tất cả loại hình',
      tierAll: 'Tất cả phân khúc',
      btnAddStay: '+ Thêm lưu trú',
      colStayName: 'Cơ sở lưu trú & Khu vực',
      colDestination: 'Điểm đến',
      colCategoryTier: 'Loại & Phân khúc',
      colPrice: 'Giá / đêm',
      colAmenities: 'Tiện ích',
      colActions: 'Thao tác',
      tourWeatherAll: 'Mọi điều kiện thời tiết',
      tourWeatherSensitive: 'Nhạy cảm thời tiết / Cảng vụ',
      btnAddTour: '+ Thêm Tour & Vé',
      colTourTitle: 'Tour / Vé tham quan',
      colDuration: 'Thời lượng & Điểm đón',
      colWeather: 'Thời tiết',
      colTourPrice: 'Giá tham khảo',
      subFlights: 'Chuyến bay (Flights)',
      subEsims: 'eSIM Du lịch',
      subGiftcards: 'Thẻ quà tặng (Giftcards)',
      btnAddFlight: '+ Thêm đường bay',
      colRoute: 'Tuyến bay',
      colFlightTime: 'Thời gian bay',
      colOneWay: 'Một chiều (One-way)',
      colRoundTrip: 'Khứ hồi (Round-Trip)',
      colAirlines: 'Hãng khai thác',
      btnAddEsim: '+ Thêm gói eSIM',
      colProvider: 'Nhà cung cấp & Mã gói',
      colData: 'Dung lượng',
      colValidity: 'Hiệu lực',
      colLocalNum: 'Số +84',
      colEsimPrice: 'Giá bán',
      btnAddGiftcard: '+ Thêm mẫu Giftcard',
      btnAddBooking: '+ Tạo đơn test / Hỗ trợ',
      colBookingId: 'Mã đơn & Nguồn',
      colCustomer: 'Khách hàng',
      colDates: 'Lịch trình & Thời tiết',
      colItems: 'Dịch vụ / Ghi chú',
      colTotal: 'Tổng ước tính',
      colStatus: 'Trạng thái & Cập nhật nhanh',
      footerNote: 'Vietnam Atlas 2025-2026 · Quản trị tập trung 34 đơn vị hành chính, lưu trú, tour, đường bay, eSIM, thẻ quà tặng & đơn đặt chỗ.',
      syncLive: 'Đồng bộ trực tiếp',
      syncExternal: 'Đồng bộ tab ngoài',
      edit: 'Sửa',
      del: 'Xóa',
      inspect: 'Chi tiết',
      preview: 'Xem trước',
      save: 'Lưu thay đổi',
      create: 'Tạo mới',
      cancel: 'Hủy',
      confirm: 'Xác nhận',
      allDestinations: 'Tất cả điểm đến',
      allStatuses: 'Tất cả',
      statusPending: 'Chờ xác nhận',
      statusConfirmed: 'Đã xác nhận',
      statusCompleted: 'Hoàn tất',
      statusCancelled: 'Đã hủy',
      noAirport: 'Không có sân bay',
      monthPrefix: 'Tháng ',
      daysSuffix: ' ngày',
      guestsSuffix: ' khách',
      weatherSensitiveYes: 'Nhạy cảm thời tiết',
      weatherSensitiveNo: 'Ổn định quanh năm',
      hasLocalYes: 'Có số +84',
      hasLocalNo: 'Data-only',
      emptyResult: 'Không tìm thấy dữ liệu phù hợp bộ lọc hiện tại.',
      resetConfirmTitle: 'Khôi phục dữ liệu mẫu gốc?',
      resetConfirmDesc: 'Thao tác này sẽ đưa toàn bộ điểm đến, lưu trú, tour, chuyến bay, eSIM, thẻ quà tặng và đơn đặt chỗ về bộ dữ liệu mẫu ban đầu của Vietnam Atlas và phát tín hiệu đồng bộ sang index.html và explore.html.',
      deleteConfirmTitle: 'Xác nhận xóa mục này?',
      deleteConfirmDesc: 'Dữ liệu sau khi xóa sẽ được cập nhật ngay trên localStorage và đồng bộ tới các tab đang mở.',
      toastSaved: 'Đã lưu vào localStorage và phát tín hiệu đồng bộ sang index.html & explore.html.',
      toastDeleted: 'Đã xóa mục và đồng bộ sang các trang liên kết.',
      toastStatusUpdated: 'Đã cập nhật trạng thái đơn và đồng bộ thời gian thực.',
      toastReset: 'Đã khôi phục toàn bộ dữ liệu mẫu và phát tín hiệu đồng bộ.',
      toastExported: 'Đã xuất file JSON sao lưu toàn bộ kho dữ liệu Vietnam Atlas.',
      toastImported: 'Đã nhập {items} bản ghi từ file JSON và đồng bộ sang các trang liên kết.',
      toastImportError: 'File JSON không hợp lệ hoặc không chứa dữ liệu danh mục Vietnam Atlas.',
      importConfirmTitle: 'Xác nhận nhập dữ liệu JSON?',
      importConfirmDesc: 'Thao tác này sẽ ghi đè {cols} bảng dữ liệu ({items} bản ghi) từ tệp JSON vừa chọn và đồng bộ tức thì sang Trang chủ và Web Đặt dịch vụ.',
      toastExternalBooking: 'Vừa nhận đơn mới / cập nhật đồng bộ từ tab khác!',
      toastExternalSync: 'Dữ liệu vừa được cập nhật từ tab khác qua BroadcastChannel.',
      searchPlaceholders: {
        dest: 'Tìm điểm đến, tỉnh 2026, mã sân bay...',
        stay: 'Tìm khách sạn, villa, du thuyền, khu vực...',
        tour: 'Tìm tên tour, vé tham quan, điểm đón...',
        flight: 'Tìm mã sân bay (HAN, DAD, PQC...) hoặc hãng bay...',
        esim: 'Tìm nhà mạng, mã gói (5G60T, Gigago, Airalo)...',
        giftcard: 'Tìm chủ đề hoặc mệnh giá thẻ quà tặng...',
        booking: 'Tìm mã đơn, tên khách, SĐT, email...'
      }
    },
    en: {
      docTitle: 'Vietnam Atlas · Editorial CMS & Booking Admin',
      skipLink: 'Skip to CMS workspace',
      brandTag: 'Editorial CMS',
      siteHome: 'Showcase',
      sitePortal: 'Booking Portal',
      siteAdmin: 'Admin CMS',
      btnExport: 'Export JSON',
      btnImport: 'Import JSON',
      btnReset: 'Reset Seed',
      mobileSitesTitle: 'Vietnam Atlas Ecosystem',
      mobileToolsTitle: 'Data Tools',
      storeKeyLabel: 'Store:',
      syncChannelLabel: 'Sync:',
      mastheadTitle: 'Editorial Content & Booking Admin CMS',
      mastheadSub: 'Every edit to destinations, stays, tours, flights, eSIMs, giftcards, and booking statuses saves to localStorage and broadcasts live to the Showcase and Booking Portal.',
      previewLanding: 'Preview on Landing',
      previewPortal: 'Preview on Booking Portal',
      tabOverview: 'Overview',
      tabDestinations: 'Destinations',
      tabStays: 'Hotels & Homes',
      tabTours: 'Tours & Tickets',
      tabCatalogOps: 'Flights · eSIM · Giftcards',
      tabBookings: 'Bookings & Support',
      ovRecentTitle: 'Latest Bookings & Support Tickets',
      ovRecentDesc: 'Streams automatically whenever guests submit from index.html or explore.html.',
      ovManageAll: 'Manage All',
      ovPreviewTitle: 'Direct Cross-Site Previews',
      ovPreviewDesc: 'Open linked surfaces in a new tab to verify BroadcastChannel synchronization.',
      ovLinkPortalTitle: 'Preview on Booking Portal (explore.html)',
      ovLinkPortalSub: 'Inspect Map, Search, Stays, Flights, eSIM, Giftcards, and Supports',
      ovLinkLandingTitle: 'Preview on Landing (index.html)',
      ovLinkLandingSub: 'Inspect Scroll-Craft coastal showcase and Trip Dossier',
      ovSeasonTitle: 'Seasonal Dry-Window & Monsoon Audit',
      ovSeasonDesc: 'Choose any travel month to evaluate bestMonths vs rainyMonths across all hubs.',
      filterAllRegions: 'All 3 Regions',
      regionNorth: 'Northern Vietnam',
      regionCentral: 'Central Vietnam',
      regionSouth: 'Southern Vietnam',
      btnAddDestination: '+ Add Destination',
      stayCatAll: 'All Categories',
      tierAll: 'All Tiers',
      btnAddStay: '+ Add Stay',
      colStayName: 'Property & Zone',
      colDestination: 'Destination',
      colCategoryTier: 'Category & Tier',
      colPrice: 'Nightly Rate',
      colAmenities: 'Amenities',
      colActions: 'Actions',
      tourWeatherAll: 'All Weather Profiles',
      tourWeatherSensitive: 'Weather / Harbor Sensitive',
      btnAddTour: '+ Add Tour / Ticket',
      colTourTitle: 'Tour / Attraction Ticket',
      colDuration: 'Duration & Pickup',
      colWeather: 'Weather',
      colTourPrice: 'Reference Fare',
      subFlights: 'Flights',
      subEsims: 'Travel eSIMs',
      subGiftcards: 'Giftcards',
      btnAddFlight: '+ Add Flight Route',
      colRoute: 'Route Corridor',
      colFlightTime: 'Flight Time',
      colOneWay: 'One-way Fare',
      colRoundTrip: 'Round-Trip Fare',
      colAirlines: 'Airlines',
      btnAddEsim: '+ Add eSIM Plan',
      colProvider: 'Provider & Plan Code',
      colData: 'Data Allowance',
      colValidity: 'Validity',
      colLocalNum: '+84 Number',
      colEsimPrice: 'Price',
      btnAddGiftcard: '+ Add Giftcard Preset',
      btnAddBooking: '+ Add Test Order / Ticket',
      colBookingId: 'Booking ID & Source',
      colCustomer: 'Traveler',
      colDates: 'Dates & Season Check',
      colItems: 'Items / Notes',
      colTotal: 'Estimated Total',
      colStatus: 'Status & Quick Update',
      footerNote: 'Vietnam Atlas 2025-2026 · Unified CMS managing 34 provinces, stays, tours, flights, eSIMs, giftcards & bookings.',
      syncLive: 'Live Sync Active',
      syncExternal: 'External Tab Synced',
      edit: 'Edit',
      del: 'Delete',
      inspect: 'Details',
      preview: 'Preview',
      save: 'Save Changes',
      create: 'Create Item',
      cancel: 'Cancel',
      confirm: 'Confirm',
      allDestinations: 'All Destinations',
      allStatuses: 'All',
      statusPending: 'Pending',
      statusConfirmed: 'Confirmed',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled',
      noAirport: 'Overland / No Airport',
      monthPrefix: 'Month ',
      daysSuffix: ' days',
      guestsSuffix: ' guests',
      weatherSensitiveYes: 'Weather-sensitive',
      weatherSensitiveNo: 'All-year stable',
      hasLocalYes: 'Includes +84',
      hasLocalNo: 'Data-only',
      emptyResult: 'No records match your current filter criteria.',
      resetConfirmTitle: 'Reset all data to seed defaults?',
      resetConfirmDesc: 'This restores destinations, stays, tours, flights, eSIMs, giftcards, and demo bookings to the initial Vietnam Atlas dataset and broadcasts the reset to index.html and explore.html.',
      deleteConfirmTitle: 'Confirm deleting this item?',
      deleteConfirmDesc: 'The deletion saves immediately to localStorage and broadcasts to open tabs.',
      toastSaved: 'Saved to localStorage and broadcast to index.html & explore.html.',
      toastDeleted: 'Item deleted and synced across linked tabs.',
      toastStatusUpdated: 'Booking status updated and synced in real time.',
      toastReset: 'Store reset to seed defaults and broadcast across tabs.',
      toastExported: 'Exported full Vietnam Atlas JSON snapshot.',
      toastImported: 'Imported {items} records from JSON and synced across linked tabs.',
      toastImportError: 'Invalid JSON file or no Vietnam Atlas catalog collections found.',
      importConfirmTitle: 'Confirm JSON data import?',
      importConfirmDesc: 'This will replace {cols} collections ({items} records) from the selected JSON file and broadcast the update to the Showcase and Booking Portal.',
      toastExternalBooking: 'New booking or status update synced from another tab!',
      toastExternalSync: 'Catalog updated from another tab via BroadcastChannel.',
      searchPlaceholders: {
        dest: 'Search destination, 2026 admin unit, IATA...',
        stay: 'Search hotel, villa, cruise, zone...',
        tour: 'Search tour title, ticket, departure...',
        flight: 'Search IATA (HAN, DAD, PQC...) or airline...',
        esim: 'Search provider, plan code (5G60T, Gigago, Airalo)...',
        giftcard: 'Search giftcard theme or denomination...',
        booking: 'Search booking ID, guest name, phone, email...'
      }
    }
  };

  // ---- Utilities -----------------------------------------------------------
  function lang() {
    return store.getLang();
  }

  function msg(key) {
    var d = I18N[lang()] || I18N.vi;
    return d[key] !== undefined ? d[key] : (I18N.vi[key] || key);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeImgSrc(url) {
    var raw = String(url || '').trim();
    if (!raw) return FALLBACK_SVG;
    if (/^(assets\/|https?:\/\/|data:image\/)/i.test(raw)) return raw;
    return FALLBACK_SVG;
  }

  function formatTimeShort(isoOrNow) {
    var d = isoOrNow ? new Date(isoOrNow) : new Date();
    if (isNaN(d.getTime())) d = new Date();
    return String(d.getHours()).padStart(2, '0') + ':' +
      String(d.getMinutes()).padStart(2, '0') + ':' +
      String(d.getSeconds()).padStart(2, '0');
  }

  function formatVndPlain(amount) {
    return Math.round(Number(amount || 0)).toLocaleString('vi-VN') + ' VNĐ';
  }

  function normalizeStayCategory(stay) {
    var c = String((stay && stay.category) || '').toLowerCase();
    var acc = String((stay && stay.accommodationType) || '').toLowerCase();
    if (c === 'cruise' || acc.indexOf('cruise') !== -1) return 'cruise';
    if (c === 'home' || c === 'homestay' || acc.indexOf('home') !== -1 || acc.indexOf('villa') !== -1) return 'home';
    return 'hotel';
  }

  function categoryToAccommodationType(cat) {
    if (cat === 'cruise') return 'Cruises';
    if (cat === 'home') return 'Homes & Villas';
    return 'Hotels';
  }

  function getStayPriceVND(stay) {
    if (!stay) return 0;
    if (typeof stay.pricePerNightVND === 'number' && !isNaN(stay.pricePerNightVND)) return stay.pricePerNightVND;
    if (typeof stay.priceVND === 'number' && !isNaN(stay.priceVND)) return stay.priceVND;
    return 0;
  }

  function getStatusMeta(status) {
    var map = {
      pending: { cls: 'cms-badge--warn', label: msg('statusPending') },
      confirmed: { cls: 'cms-badge--good', label: msg('statusConfirmed') },
      completed: { cls: 'cms-badge--info', label: msg('statusCompleted') },
      cancelled: { cls: 'cms-badge--danger', label: msg('statusCancelled') }
    };
    return map[status] || { cls: 'cms-badge--neutral', label: status || 'pending' };
  }

  function getSeasonBadgeClass(code) {
    if (code === 'golden' || code === 'good') return 'cms-badge--good';
    if (code === 'shoulder') return 'cms-badge--warn';
    if (code === 'caution') return 'cms-badge--danger';
    return 'cms-badge--neutral';
  }

  function getDestLabel(destId, snap) {
    var d = (snap.destinations || []).filter(function (x) { return x.id === destId; })[0];
    if (!d) return destId || '-';
    return lang() === 'en' ? (d.shortNameEn || d.displayNameEn || d.shortName || d.displayName) : (d.shortName || d.displayName);
  }

  function showToast(text, variant) {
    var stack = document.getElementById('cms-toasts');
    if (!stack) return;
    while (stack.children.length >= 2) {
      stack.removeChild(stack.firstElementChild);
    }
    var el = document.createElement('div');
    el.className = 'cms-toast' + (variant ? ' cms-toast--' + variant : '');
    el.setAttribute('role', 'status');

    var span = document.createElement('span');
    span.textContent = text;

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'cms-btn cms-btn--sm cms-btn--ghost';
    close.textContent = '×';
    close.setAttribute('aria-label', 'Đóng thông báo');
    close.addEventListener('click', function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    });

    el.appendChild(span);
    el.appendChild(close);
    stack.appendChild(el);

    global.setTimeout(function () {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 3400);
  }

  function flashSyncIndicator(isExternal) {
    var pill = document.getElementById('sync-indicator');
    var labelEl = document.getElementById('sync-status-text');
    var timeEl = document.getElementById('sync-status-time');
    if (!pill) return;

    uiState.lastSyncLabel = formatTimeShort();
    if (timeEl) timeEl.textContent = uiState.lastSyncLabel;
    if (labelEl) labelEl.textContent = isExternal ? msg('syncExternal') : msg('syncLive');

    pill.classList.add('is-flashing');
    global.setTimeout(function () {
      pill.classList.remove('is-flashing');
      if (labelEl) labelEl.textContent = msg('syncLive');
    }, 1600);
  }

  function buildPhotoOptionsHtml(selectedVal) {
    var l = lang();
    var found = false;
    var html = '<option value="">' + (l === 'en' ? '-- Choose preset photo --' : '-- Chọn nhanh ảnh có sẵn --') + '</option>';
    PHOTO_PRESETS.forEach(function (grp) {
      html += '<optgroup label="' + escapeHtml(l === 'en' ? grp.groupEn : grp.group) + '">';
      grp.items.forEach(function (it) {
        var sel = selectedVal === it.value ? ' selected' : '';
        if (sel) found = true;
        html += '<option value="' + escapeHtml(it.value) + '"' + sel + '>' + escapeHtml(it.label) + '</option>';
      });
      html += '</optgroup>';
    });
    if (selectedVal && !found) {
      html += '<option value="' + escapeHtml(selectedVal) + '" selected>' + escapeHtml(selectedVal) + '</option>';
    }
    return html;
  }

  function wireImageFallbacks(container) {
    if (!container) return;
    var imgs = container.querySelectorAll('img[data-fallback]');
    for (var i = 0; i < imgs.length; i++) {
      (function (img) {
        img.addEventListener('error', function onErr() {
          img.onerror = null;
          if (img.src !== FALLBACK_SVG) {
            img.src = FALLBACK_SVG;
          }
        }, { once: true });
      })(imgs[i]);
    }
  }

  // ---- Header / Bilingual / Currency / Export / Reset ----------------------
  function syncStaticI18n() {
    var l = lang();
    var c = store.getCurrency();
    document.title = msg('docTitle');
    var nodes = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < nodes.length; i++) {
      var key = nodes[i].getAttribute('data-i18n');
      nodes[i].textContent = msg(key);
    }

    var ph = (I18N[l] || I18N.vi).searchPlaceholders;
    var mapPh = {
      'dest-search': ph.dest,
      'stay-search': ph.stay,
      'tour-search': ph.tour,
      'flight-search': ph.flight,
      'esim-search': ph.esim,
      'giftcard-search': ph.giftcard,
      'booking-search': ph.booking
    };
    Object.keys(mapPh).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.placeholder = mapPh[id];
    });

    var langBtns = document.querySelectorAll('[data-lang-btn]');
    for (var j = 0; j < langBtns.length; j++) {
      var activeL = langBtns[j].getAttribute('data-lang-btn') === l;
      langBtns[j].classList.toggle('is-active', activeL);
      langBtns[j].setAttribute('aria-pressed', activeL ? 'true' : 'false');
    }

    var curBtns = document.querySelectorAll('[data-currency-btn]');
    for (var k = 0; k < curBtns.length; k++) {
      var activeC = curBtns[k].getAttribute('data-currency-btn') === c;
      curBtns[k].classList.toggle('is-active', activeC);
      curBtns[k].setAttribute('aria-pressed', activeC ? 'true' : 'false');
    }

    var syncText = document.getElementById('sync-status-text');
    if (syncText) syncText.textContent = msg('syncLive');
  }

  function updateBadges(snap) {
    var destCount = (snap.destinations || []).length;
    var staysCount = (snap.stays || []).length;
    var toursCount = (snap.tours || []).length;
    var flightsCount = (snap.flights || []).length;
    var esimsCount = (snap.esims || []).length;
    var gcCount = (snap.giftcards || []).length;
    var bookings = snap.bookings || [];
    var pendingCount = bookings.filter(function (b) { return b.status === 'pending'; }).length;

    var map = {
      'badge-destinations': destCount,
      'badge-stays': staysCount,
      'badge-tours': toursCount,
      'badge-catalog-ops': flightsCount + esimsCount + gcCount,
      'badge-flights': flightsCount,
      'badge-esims': esimsCount,
      'badge-giftcards': gcCount,
      'badge-bookings': pendingCount > 0 ? (pendingCount + ' / ' + bookings.length) : String(bookings.length)
    };
    Object.keys(map).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = map[id];
    });
  }

  function populateDestSelectFilter(selectId, destinations, currentVal) {
    var sel = document.getElementById(selectId);
    if (!sel) return;
    var l = lang();
    var html = '<option value="all">' + escapeHtml(msg('allDestinations')) + '</option>';
    (destinations || []).forEach(function (d) {
      var label = l === 'en' ? (d.shortNameEn || d.displayNameEn || d.shortName || d.displayName) : (d.shortName || d.displayName);
      var selected = currentVal === d.id ? ' selected' : '';
      html += '<option value="' + escapeHtml(d.id) + '"' + selected + '>' + escapeHtml(label) + '</option>';
    });
    sel.innerHTML = html;
  }

  // ---- Tab Switching -------------------------------------------------------
  function switchTab(tabName) {
    uiState.activeTab = tabName;
    var tabs = document.querySelectorAll('.cms-tab');
    for (var i = 0; i < tabs.length; i++) {
      var t = tabs[i];
      var isActive = t.getAttribute('data-tab') === tabName;
      t.classList.toggle('is-active', isActive);
      t.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }

    var panels = document.querySelectorAll('.cms-panel');
    for (var j = 0; j < panels.length; j++) {
      var p = panels[j];
      var match = p.id === ('panel-' + tabName);
      p.classList.toggle('is-active', match);
      p.hidden = !match;
    }
  }

  function switchSubtab(subName) {
    uiState.activeSubtab = subName;
    var btns = document.querySelectorAll('.cms-subtab');
    for (var i = 0; i < btns.length; i++) {
      var isActive = btns[i].getAttribute('data-subtab') === subName;
      btns[i].classList.toggle('is-active', isActive);
      btns[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    var panels = document.querySelectorAll('.cms-subpanel');
    for (var j = 0; j < panels.length; j++) {
      var match = panels[j].id === ('subpanel-' + subName);
      panels[j].classList.toggle('is-active', match);
      panels[j].hidden = !match;
    }
  }

  // ---- Overview Renderer ---------------------------------------------------
  function renderOverview(snap) {
    var l = lang();
    var dests = snap.destinations || [];
    var stays = snap.stays || [];
    var tours = snap.tours || [];
    var flights = snap.flights || [];
    var esims = snap.esims || [];
    var giftcards = snap.giftcards || [];
    var bookings = snap.bookings || [];

    var pending = bookings.filter(function (b) { return b.status === 'pending'; }).length;
    var activeRevenueVND = bookings
      .filter(function (b) { return b.status !== 'cancelled'; })
      .reduce(function (sum, b) { return sum + Number(b.totalVND || 0); }, 0);

    var hotelCnt = stays.filter(function (s) { return normalizeStayCategory(s) === 'hotel'; }).length;
    var homeCnt = stays.filter(function (s) { return normalizeStayCategory(s) === 'home'; }).length;
    var cruiseCnt = stays.filter(function (s) { return normalizeStayCategory(s) === 'cruise'; }).length;
    var weatherTours = tours.filter(function (t) { return !!t.weatherSensitive; }).length;

    var kpis = [
      {
        tab: 'destinations',
        label: l === 'en' ? 'Destinations (2026)' : 'Điểm đến (34 tỉnh 2026)',
        value: dests.length,
        meta: l === 'en' ? 'Core & expanded hubs' : 'Bao gồm 5 trọng điểm & 6 mở rộng'
      },
      {
        tab: 'stays',
        label: 'Hotels & Homes',
        value: stays.length,
        meta: hotelCnt + ' Hotel · ' + homeCnt + ' Home · ' + cruiseCnt + ' Cruise'
      },
      {
        tab: 'tours',
        label: l === 'en' ? 'Tours & Tickets' : 'Tours & Vé tham quan',
        value: tours.length,
        meta: weatherTours + (l === 'en' ? ' weather-sensitive routes' : ' tuyến cần theo dõi thời tiết')
      },
      {
        tab: 'catalog-ops',
        subtab: 'flights',
        label: l === 'en' ? 'Flight Routes' : 'Đường bay nội địa',
        value: flights.length,
        meta: (snap.airports || []).length + (l === 'en' ? ' gateway airports' : ' sân bay cửa ngõ')
      },
      {
        tab: 'catalog-ops',
        subtab: 'esims',
        label: l === 'en' ? 'eSIM Plans' : 'Gói eSIM du lịch',
        value: esims.length,
        meta: 'Viettel · VinaPhone · Gigago · Airalo'
      },
      {
        tab: 'catalog-ops',
        subtab: 'giftcards',
        label: 'Giftcards',
        value: giftcards.length,
        meta: l === 'en' ? '500k - 10M VNĐ vouchers' : 'Mệnh giá 500k - 10tr VNĐ'
      },
      {
        tab: 'bookings',
        highlight: true,
        label: l === 'en' ? 'Bookings & Inquiries' : 'Đơn đặt chỗ & Hỗ trợ',
        value: bookings.length,
        meta: (pending > 0 ? pending + (l === 'en' ? ' pending · ' : ' chờ duyệt · ') : '') + store.formatPrice(activeRevenueVND)
      }
    ];

    var kpiEl = document.getElementById('overview-kpis');
    if (kpiEl) {
      kpiEl.innerHTML = kpis.map(function (k) {
        return (
          '<button type="button" class="cms-kpi' + (k.highlight ? ' cms-kpi--highlight' : '') + '"' +
          ' data-jump-tab="' + escapeHtml(k.tab) + '"' +
          (k.subtab ? ' data-jump-subtab="' + escapeHtml(k.subtab) + '"' : '') + '>' +
          '<span class="cms-kpi__label">' + escapeHtml(k.label) + '</span>' +
          '<span class="cms-kpi__value">' + escapeHtml(k.value) + '</span>' +
          '<span class="cms-kpi__meta">' + escapeHtml(k.meta) + '</span>' +
          '</button>'
        );
      }).join('');
    }

    // Recent bookings list
    var recentEl = document.getElementById('overview-recent-bookings');
    if (recentEl) {
      if (!bookings.length) {
        recentEl.innerHTML = '<div class="cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</div>';
      } else {
        recentEl.innerHTML = '<div class="cms-recent-list">' + bookings.slice(0, 5).map(function (b) {
          var sm = getStatusMeta(b.status);
          var firstItems = (b.items || []).slice(0, 2).map(function (it) { return it.title; }).join(' · ');
          return (
            '<div class="cms-recent-item">' +
            '  <div class="cms-recent-item__main">' +
            '    <div class="cms-recent-item__top">' +
            '      <strong class="sc-nums">' + escapeHtml(b.id) + '</strong>' +
            '      <span>' + escapeHtml(b.customerName || '-') + '</span>' +
            '      <span class="cms-badge cms-badge--mono">' + escapeHtml(b.sourcePage || 'web') + '</span>' +
            '      <span class="cms-badge ' + sm.cls + '">' + escapeHtml(sm.label) + '</span>' +
            '    </div>' +
            '    <div class="cms-recent-item__sub">' + escapeHtml(firstItems || b.notes || '-') + '</div>' +
            '  </div>' +
            '  <div class="cms-recent-item__right">' +
            '    <strong class="sc-nums">' + escapeHtml(store.formatPrice(b.totalVND || 0)) + '</strong>' +
            (b.status === 'pending'
              ? '<button type="button" class="cms-btn cms-btn--primary cms-btn--sm" data-quick-status="' + escapeHtml(b.id) + '" data-next-status="confirmed">' + escapeHtml(l === 'en' ? 'Confirm' : 'Duyệt đơn') + '</button>'
              : '') +
            '    <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-inspect-booking="' + escapeHtml(b.id) + '">' + escapeHtml(msg('inspect')) + '</button>' +
            '  </div>' +
            '</div>'
          );
        }).join('') + '</div>';
      }
    }

    // Month selector & seasonal readiness matrix
    var monthSel = document.getElementById('overview-month-select');
    if (monthSel && !monthSel.options.length) {
      var mHtml = '';
      for (var m = 1; m <= 12; m++) {
        mHtml += '<option value="' + m + '"' + (m === uiState.overviewMonth ? ' selected' : '') + '>' + escapeHtml(msg('monthPrefix') + m) + '</option>';
      }
      monthSel.innerHTML = mHtml;
    } else if (monthSel) {
      monthSel.value = String(uiState.overviewMonth);
    }

    var seasonEl = document.getElementById('overview-season-matrix');
    if (seasonEl) {
      seasonEl.innerHTML = dests.map(function (d) {
        var st = store.getSeasonStatus(d, uiState.overviewMonth, l);
        var cls = getSeasonBadgeClass(st.code);
        var name = l === 'en' ? (d.shortNameEn || d.shortName || d.displayName) : (d.shortName || d.displayName);
        return (
          '<div class="cms-season-row">' +
          '  <span class="cms-season-row__name">' + escapeHtml(name) + '</span>' +
          '  <span class="cms-badge ' + cls + '">' + escapeHtml(st.label) + '</span>' +
          '</div>'
        );
      }).join('');
    }
  }

  // ---- Destinations Renderer -----------------------------------------------
  function renderDestinations(snap) {
    var l = lang();
    var q = uiState.filters.destSearch.trim().toLowerCase();
    var region = uiState.filters.destRegion;
    var list = (snap.destinations || []).filter(function (d) {
      if (region !== 'all' && d.region !== region) return false;
      if (!q) return true;
      var hay = [d.id, d.displayName, d.displayNameEn, d.shortName, d.adminUnit2026, d.gatewayAirport, d.summary].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var container = document.getElementById('destinations-list');
    if (!container) return;

    if (!list.length) {
      container.innerHTML = '<div class="cms-card cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</div>';
      return;
    }

    container.innerHTML = list.map(function (d) {
      var name = l === 'en' ? (d.displayNameEn || d.displayName) : d.displayName;
      var admin = l === 'en' ? (d.adminUnit2026En || d.adminUnit2026) : d.adminUnit2026;
      var transfer = l === 'en' ? (d.transferNoteEn || d.transferNote) : d.transferNote;
      var summary = l === 'en' ? (d.summaryEn || d.summary) : d.summary;
      var regionLbl = l === 'en' ? (d.regionLabelEn || d.regionLabel || d.region) : (d.regionLabel || d.region);
      var airportLabel = d.gatewayAirport ? d.gatewayAirport : msg('noAirport');

      var monthCells = '';
      for (var m = 1; m <= 12; m++) {
        var inBest = Array.isArray(d.bestMonths) && d.bestMonths.indexOf(m) !== -1;
        var inRainy = Array.isArray(d.rainyMonths) && d.rainyMonths.indexOf(m) !== -1;
        var mCls = 'cms-month-cell';
        if (inBest && inRainy) mCls += ' is-both';
        else if (inBest) mCls += ' is-best';
        else if (inRainy) mCls += ' is-rainy';
        monthCells += '<span class="' + mCls + '" title="' + escapeHtml(msg('monthPrefix') + m) + '">T' + m + '</span>';
      }

      return (
        '<article class="cms-dest-card">' +
        '  <div class="cms-dest-card__media">' +
        '    <img src="' + escapeHtml(safeImgSrc(d.photo)) + '" alt="' + escapeHtml(name) + '" data-fallback="1" loading="lazy">' +
        '  </div>' +
        '  <div class="cms-dest-card__body">' +
        '    <div class="cms-dest-card__meta">' +
        '      <span class="cms-dest-card__airport">' + escapeHtml(airportLabel) + '</span>' +
        '      <span class="cms-dest-card__region">' + escapeHtml(regionLbl) + '</span>' +
        '    </div>' +
        '    <h2 class="cms-dest-card__title">' + escapeHtml(name) + '</h2>' +
        '    <p class="cms-dest-card__admin">' + escapeHtml(admin || '-') + '</p>' +
        '    <p class="cms-dest-card__text">' + escapeHtml(summary || '') + '</p>' +
        '    <p class="cms-dest-card__transfer">' + escapeHtml(transfer || '') + '</p>' +
        '    <div class="cms-month-strip" aria-label="Bản đồ mùa 12 tháng">' + monthCells + '</div>' +
        '  </div>' +
        '  <div class="cms-dest-card__foot">' +
        '    <a class="cms-btn cms-btn--ghost cms-btn--sm" href="explore.html?city=' + encodeURIComponent(d.id) + '" target="_blank" rel="noopener">' + escapeHtml(msg('preview')) + '</a>' +
        '    <div class="cms-row-actions">' +
        '      <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" data-edit-dest="' + escapeHtml(d.id) + '">' + escapeHtml(msg('edit')) + '</button>' +
        '    </div>' +
        '  </div>' +
        '</article>'
      );
    }).join('');

    wireImageFallbacks(container);
  }

  // ---- Stays Renderer ------------------------------------------------------
  function renderStays(snap) {
    populateDestSelectFilter('stay-dest-filter', snap.destinations, uiState.filters.stayDest);

    var q = uiState.filters.staySearch.trim().toLowerCase();
    var destF = uiState.filters.stayDest;
    var catF = uiState.filters.stayCat;
    var tierF = uiState.filters.stayTier;

    var list = (snap.stays || []).filter(function (s) {
      if (destF !== 'all' && s.destinationId !== destF) return false;
      if (catF !== 'all' && normalizeStayCategory(s) !== catF) return false;
      if (tierF !== 'all' && s.tier !== tierF) return false;
      if (!q) return true;
      var hay = [s.id, s.name, s.zone, s.destinationId, (s.amenities || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var tbody = document.getElementById('stays-tbody');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(function (s) {
      var cat = normalizeStayCategory(s);
      var catLabel = cat === 'cruise' ? 'Cruise' : (cat === 'home' ? 'Home & Villa' : 'Hotel');
      var tierCls = s.tier === 'luxury' ? 'cms-badge--info' : (s.tier === 'mid' ? 'cms-badge--good' : 'cms-badge--neutral');
      var priceVND = getStayPriceVND(s);
      var amenities = Array.isArray(s.amenities) ? s.amenities : [];

      return (
        '<tr>' +
        '  <td>' +
        '    <div class="cms-row-media">' +
        '      <img class="cms-thumb" src="' + escapeHtml(safeImgSrc(s.photo || s.image)) + '" alt="" data-fallback="1" loading="lazy">' +
        '      <div>' +
        '        <div class="cms-row-title">' + escapeHtml(s.name) + '</div>' +
        '        <div class="cms-row-sub">' + escapeHtml(s.zone || '') + '</div>' +
        '      </div>' +
        '    </div>' +
        '  </td>' +
        '  <td><span class="cms-badge cms-badge--mono">' + escapeHtml(getDestLabel(s.destinationId, snap)) + '</span></td>' +
        '  <td>' +
        '    <div class="cms-tag-list">' +
        '      <span class="cms-badge cms-badge--neutral">' + escapeHtml(catLabel) + '</span>' +
        '      <span class="cms-badge ' + tierCls + '">' + escapeHtml(s.tier || 'mid') + '</span>' +
        '    </div>' +
        '  </td>' +
        '  <td>' +
        '    <strong class="sc-nums">' + escapeHtml(store.formatPrice(priceVND)) + '</strong>' +
        '    <div class="cms-row-sub">' + escapeHtml(s.unitLabel || '') + '</div>' +
        '  </td>' +
        '  <td>' +
        '    <div class="cms-tag-list">' +
        amenities.slice(0, 3).map(function (a) { return '<span class="cms-tag">' + escapeHtml(a) + '</span>'; }).join('') +
        (amenities.length > 3 ? '<span class="cms-tag">+' + (amenities.length - 3) + '</span>' : '') +
        '    </div>' +
        '  </td>' +
        '  <td class="cms-td-actions">' +
        '    <div class="cms-row-actions">' +
        '      <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-edit-stay="' + escapeHtml(s.id) + '">' + escapeHtml(msg('edit')) + '</button>' +
        '      <button type="button" class="cms-btn cms-btn--danger-ghost cms-btn--sm" data-delete-item="stays" data-delete-id="' + escapeHtml(s.id) + '">' + escapeHtml(msg('del')) + '</button>' +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    }).join('');

    wireImageFallbacks(tbody);
  }

  // ---- Tours Renderer ------------------------------------------------------
  function renderTours(snap) {
    populateDestSelectFilter('tour-dest-filter', snap.destinations, uiState.filters.tourDest);

    var q = uiState.filters.tourSearch.trim().toLowerCase();
    var destF = uiState.filters.tourDest;
    var weatherF = uiState.filters.tourWeather;

    var list = (snap.tours || []).filter(function (t) {
      if (destF !== 'all' && t.destinationId !== destF) return false;
      if (weatherF === 'sensitive' && !t.weatherSensitive) return false;
      if (!q) return true;
      var hay = [t.id, t.title, t.departureFrom, t.highlights, t.pricingBreakdown, t.destinationId].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var tbody = document.getElementById('tours-tbody');
    if (!tbody) return;

    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(function (t) {
      var highlights = t.highlights || t.pricingBreakdown || '';
      var durText = t.durationLabel || (t.durationDays ? (t.durationDays + msg('daysSuffix')) : '1');
      return (
        '<tr>' +
        '  <td>' +
        '    <div class="cms-row-media">' +
        '      <img class="cms-thumb" src="' + escapeHtml(safeImgSrc(t.photo || t.image)) + '" alt="" data-fallback="1" loading="lazy">' +
        '      <div>' +
        '        <div class="cms-row-title">' + escapeHtml(t.title) + '</div>' +
        '        <div class="cms-row-sub">' + escapeHtml(highlights.slice(0, 120)) + (highlights.length > 120 ? '...' : '') + '</div>' +
        '      </div>' +
        '    </div>' +
        '  </td>' +
        '  <td><span class="cms-badge cms-badge--mono">' + escapeHtml(getDestLabel(t.destinationId, snap)) + '</span></td>' +
        '  <td>' +
        '    <div class="cms-row-title">' + escapeHtml(durText) + '</div>' +
        '    <div class="cms-row-sub">' + escapeHtml(t.departureFrom || '-') + '</div>' +
        '  </td>' +
        '  <td>' +
        (t.weatherSensitive
          ? '<span class="cms-badge cms-badge--warn">' + escapeHtml(msg('weatherSensitiveYes')) + '</span>'
          : '<span class="cms-badge cms-badge--good">' + escapeHtml(msg('weatherSensitiveNo')) + '</span>') +
        '  </td>' +
        '  <td><strong class="sc-nums">' + escapeHtml(store.formatPrice(t.priceVND || 0)) + '</strong></td>' +
        '  <td class="cms-td-actions">' +
        '    <div class="cms-row-actions">' +
        '      <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-edit-tour="' + escapeHtml(t.id) + '">' + escapeHtml(msg('edit')) + '</button>' +
        '      <button type="button" class="cms-btn cms-btn--danger-ghost cms-btn--sm" data-delete-item="tours" data-delete-id="' + escapeHtml(t.id) + '">' + escapeHtml(msg('del')) + '</button>' +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    }).join('');

    wireImageFallbacks(tbody);
  }

  // ---- Flights · eSIM · Giftcards Renderers --------------------------------
  function renderFlights(snap) {
    var q = uiState.filters.flightSearch.trim().toLowerCase();
    var list = (snap.flights || []).filter(function (f) {
      if (!q) return true;
      var hay = [f.from, f.to, f.fromCity, f.toCity, f.routeNote, (f.airlines || []).join(' ')].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var tbody = document.getElementById('flights-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(function (f) {
      var ow = Array.isArray(f.lccOneWayVND) && f.lccOneWayVND.length >= 2
        ? store.formatPriceRange(f.lccOneWayVND[0], f.lccOneWayVND[1], false)
        : (f.oneWayRangeLabel || '-');
      var rt = Array.isArray(f.roundTripRangeVND) && f.roundTripRangeVND.length >= 2
        ? store.formatPriceRange(f.roundTripRangeVND[0], f.roundTripRangeVND[1], false)
        : (f.roundTripLabel || '-');
      return (
        '<tr>' +
        '  <td>' +
        '    <div class="cms-row-title sc-nums">' + escapeHtml(f.from + ' -> ' + f.to) + '</div>' +
        '    <div class="cms-row-sub">' + escapeHtml((f.fromCity || f.from) + ' -> ' + (f.toCity || f.to)) + '</div>' +
        '  </td>' +
        '  <td>' +
        '    <div class="cms-row-title sc-nums">' + escapeHtml(f.durationText || '-') + '</div>' +
        '    <div class="cms-row-sub">' + escapeHtml(f.routeNote || '') + '</div>' +
        '  </td>' +
        '  <td class="sc-nums">' + escapeHtml(ow) + '</td>' +
        '  <td class="sc-nums"><strong>' + escapeHtml(rt) + '</strong></td>' +
        '  <td><div class="cms-tag-list">' + (f.airlines || []).map(function (a) { return '<span class="cms-tag">' + escapeHtml(a) + '</span>'; }).join('') + '</div></td>' +
        '  <td class="cms-td-actions">' +
        '    <div class="cms-row-actions">' +
        '      <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-edit-flight="' + escapeHtml(f.id) + '">' + escapeHtml(msg('edit')) + '</button>' +
        '      <button type="button" class="cms-btn cms-btn--danger-ghost cms-btn--sm" data-delete-item="flights" data-delete-id="' + escapeHtml(f.id) + '">' + escapeHtml(msg('del')) + '</button>' +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderEsims(snap) {
    var q = uiState.filters.esimSearch.trim().toLowerCase();
    var list = (snap.esims || []).filter(function (e) {
      if (!q) return true;
      var hay = [e.provider, e.providerGroup, e.planCode, e.dataAllowance, e.recommendedFor].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var tbody = document.getElementById('esims-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="6" class="cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</td></tr>';
      return;
    }

    tbody.innerHTML = list.map(function (e) {
      return (
        '<tr>' +
        '  <td>' +
        '    <div class="cms-row-title">' + escapeHtml(e.provider || e.providerGroup) + ' · <span class="cms-badge cms-badge--mono">' + escapeHtml(e.planCode) + '</span></div>' +
        '    <div class="cms-row-sub">' + escapeHtml(e.recommendedFor || '') + '</div>' +
        '  </td>' +
        '  <td><strong>' + escapeHtml(e.dataAllowance || '-') + '</strong></td>' +
        '  <td class="sc-nums">' + escapeHtml(e.validityDays ? (e.validityDays + msg('daysSuffix')) : (e.validityRangeLabel || '-')) + '</td>' +
        '  <td>' +
        (e.hasLocalNumber
          ? '<span class="cms-badge cms-badge--good">' + escapeHtml(msg('hasLocalYes')) + '</span>'
          : '<span class="cms-badge cms-badge--neutral">' + escapeHtml(msg('hasLocalNo')) + '</span>') +
        '  </td>' +
        '  <td>' +
        '    <strong class="sc-nums">' + escapeHtml(store.formatPrice(e.priceVND || 0)) + '</strong>' +
        (e.priceUSD ? '<div class="cms-row-sub sc-nums">$' + Number(e.priceUSD).toFixed(2) + ' USD ref</div>' : '') +
        '  </td>' +
        '  <td class="cms-td-actions">' +
        '    <div class="cms-row-actions">' +
        '      <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-edit-esim="' + escapeHtml(e.id) + '">' + escapeHtml(msg('edit')) + '</button>' +
        '      <button type="button" class="cms-btn cms-btn--danger-ghost cms-btn--sm" data-delete-item="esims" data-delete-id="' + escapeHtml(e.id) + '">' + escapeHtml(msg('del')) + '</button>' +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    }).join('');
  }

  function renderGiftcards(snap) {
    var l = lang();
    var q = uiState.filters.giftcardSearch.trim().toLowerCase();
    var list = (snap.giftcards || []).filter(function (g) {
      if (!q) return true;
      var hay = [g.title, g.titleEn, g.themeLabel, g.themeLabelEn, g.sampleDest, g.amountVND].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var container = document.getElementById('giftcards-list');
    if (!container) return;
    if (!list.length) {
      container.innerHTML = '<div class="cms-card cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</div>';
      return;
    }

    container.innerHTML = list.map(function (g) {
      var title = l === 'en' ? (g.titleEn || g.title) : g.title;
      var themeLbl = l === 'en' ? (g.themeLabelEn || g.themeLabel) : g.themeLabel;
      var terms = l === 'en' ? (g.termsSummaryEn || g.termsSummary) : g.termsSummary;
      return (
        '<article class="cms-dest-card">' +
        '  <div class="cms-dest-card__media">' +
        '    <img src="' + escapeHtml(safeImgSrc(g.photo)) + '" alt="' + escapeHtml(title) + '" data-fallback="1" loading="lazy">' +
        '  </div>' +
        '  <div class="cms-dest-card__body">' +
        '    <div class="cms-dest-card__meta">' +
        '      <span class="cms-dest-card__airport sc-nums">' + escapeHtml(store.formatPrice(g.amountVND || 0)) + '</span>' +
        '      <span class="cms-dest-card__region">' + escapeHtml(themeLbl || g.themeId) + '</span>' +
        '    </div>' +
        '    <h2 class="cms-dest-card__title">' + escapeHtml(title) + '</h2>' +
        '    <p class="cms-dest-card__admin">' + escapeHtml((g.validityMonths || 18) + (l === 'en' ? ' months validity · ' : ' tháng hiệu lực · ') + (g.sampleDest || '')) + '</p>' +
        '    <p class="cms-dest-card__text">' + escapeHtml(terms || '') + '</p>' +
        '    <div class="cms-tag-list">' + (g.redeemScope || []).map(function (s) { return '<span class="cms-tag">' + escapeHtml(s) + '</span>'; }).join('') + '</div>' +
        '  </div>' +
        '  <div class="cms-dest-card__foot">' +
        '    <a class="cms-btn cms-btn--ghost cms-btn--sm" href="explore.html?mode=giftcards" target="_blank" rel="noopener">' + escapeHtml(msg('preview')) + '</a>' +
        '    <div class="cms-row-actions">' +
        '      <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-edit-giftcard="' + escapeHtml(g.id) + '">' + escapeHtml(msg('edit')) + '</button>' +
        '      <button type="button" class="cms-btn cms-btn--danger-ghost cms-btn--sm" data-delete-item="giftcards" data-delete-id="' + escapeHtml(g.id) + '">' + escapeHtml(msg('del')) + '</button>' +
        '    </div>' +
        '  </div>' +
        '</article>'
      );
    }).join('');

    wireImageFallbacks(container);
  }

  // ---- Bookings & Support Tickets Renderer ---------------------------------
  function renderBookings(snap) {
    var l = lang();
    var all = snap.bookings || [];
    var counts = {
      all: all.length,
      pending: all.filter(function (b) { return b.status === 'pending'; }).length,
      confirmed: all.filter(function (b) { return b.status === 'confirmed'; }).length,
      completed: all.filter(function (b) { return b.status === 'completed'; }).length,
      cancelled: all.filter(function (b) { return b.status === 'cancelled'; }).length
    };

    var pillsEl = document.getElementById('booking-status-pills');
    if (pillsEl) {
      var pillDefs = [
        { id: 'all', label: msg('allStatuses') },
        { id: 'pending', label: msg('statusPending') },
        { id: 'confirmed', label: msg('statusConfirmed') },
        { id: 'completed', label: msg('statusCompleted') },
        { id: 'cancelled', label: msg('statusCancelled') }
      ];
      pillsEl.innerHTML = pillDefs.map(function (p) {
        var active = uiState.filters.bookingStatus === p.id;
        return (
          '<button type="button" class="cms-filter-pill' + (active ? ' is-active' : '') + '" data-booking-filter="' + p.id + '">' +
          '<span>' + escapeHtml(p.label) + '</span>' +
          '<span class="sc-nums">(' + counts[p.id] + ')</span>' +
          '</button>'
        );
      }).join('');
    }

    var q = uiState.filters.bookingSearch.trim().toLowerCase();
    var stFilter = uiState.filters.bookingStatus;
    var list = all.filter(function (b) {
      if (stFilter !== 'all' && b.status !== stFilter) return false;
      if (!q) return true;
      var itemStr = (b.items || []).map(function (it) { return it.title; }).join(' ');
      var hay = [b.id, b.customerName, b.customerEmail, b.customerPhone, b.sourcePage, b.notes, itemStr].join(' ').toLowerCase();
      return hay.indexOf(q) !== -1;
    });

    var tbody = document.getElementById('bookings-tbody');
    if (!tbody) return;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="7" class="cms-empty-state">' + escapeHtml(msg('emptyResult')) + '</td></tr>';
      return;
    }

    var statusButtons = [
      { code: 'pending', vi: 'Chờ', en: 'Pending' },
      { code: 'confirmed', vi: 'Xác nhận', en: 'Confirm' },
      { code: 'completed', vi: 'Hoàn tất', en: 'Complete' },
      { code: 'cancelled', vi: 'Hủy', en: 'Cancel' }
    ];

    tbody.innerHTML = list.map(function (b) {
      var sm = getStatusMeta(b.status);
      var season = store.getSeasonStatus(null, b.travelMonth || 3, l);
      var items = Array.isArray(b.items) ? b.items : [];
      var itemText = items.map(function (it) { return it.title; }).join(' · ');
      var travelerLabel = b.travelerType === 'international'
        ? (l === 'en' ? 'International' : 'Quốc tế')
        : (l === 'en' ? 'Domestic' : 'Nội địa');

      return (
        '<tr>' +
        '  <td>' +
        '    <div class="cms-row-title sc-nums">' + escapeHtml(b.id) + '</div>' +
        '    <div class="cms-tag-list" style="margin-top:0.25rem">' +
        '      <span class="cms-badge cms-badge--mono">' + escapeHtml(b.sourcePage || 'web') + '</span>' +
        (b.isDemoSeed ? '<span class="cms-badge cms-badge--neutral">demo</span>' : '') +
        '    </div>' +
        '  </td>' +
        '  <td>' +
        '    <div class="cms-row-title">' + escapeHtml(b.customerName || '-') + '</div>' +
        '    <div class="cms-row-sub">' + escapeHtml(b.customerPhone || '') + ' · ' + escapeHtml(b.customerEmail || '') + '</div>' +
        '    <span class="cms-tag" style="margin-top:0.25rem">' + escapeHtml(travelerLabel) + '</span>' +
        '  </td>' +
        '  <td>' +
        '    <div class="cms-row-title sc-nums">' + escapeHtml((b.travelDate || '-') + (b.returnDate ? ' -> ' + b.returnDate : '')) + '</div>' +
        '    <div class="cms-row-sub sc-nums">' + escapeHtml((b.guests || 1) + msg('guestsSuffix')) + '</div>' +
        '    <span class="cms-badge ' + getSeasonBadgeClass(season.code) + '" style="margin-top:0.25rem">' + escapeHtml(season.label) + '</span>' +
        '  </td>' +
        '  <td>' +
        '    <div class="cms-row-title">' + escapeHtml(itemText || (l === 'en' ? 'Support Inquiry' : 'Yêu cầu hỗ trợ')) + '</div>' +
        (b.notes ? '<div class="cms-row-sub">' + escapeHtml(b.notes) + '</div>' : '') +
        '  </td>' +
        '  <td>' +
        '    <strong class="sc-nums">' + escapeHtml(store.formatPrice(b.totalVND || 0)) + '</strong>' +
        '    <div class="cms-row-sub sc-nums">' + escapeHtml(store.formatPrice(b.totalVND || 0, store.getCurrency() === 'USD' ? 'VND' : 'USD')) + '</div>' +
        '  </td>' +
        '  <td>' +
        '    <span class="cms-badge ' + sm.cls + '">' + escapeHtml(sm.label) + '</span>' +
        '    <div class="cms-quick-status">' +
        statusButtons.map(function (sb) {
          var isCur = b.status === sb.code;
          return '<button type="button" class="cms-status-btn' + (isCur ? ' is-current' : '') + '"' +
            ' data-quick-status="' + escapeHtml(b.id) + '" data-next-status="' + sb.code + '"' +
            (isCur ? ' disabled' : '') + '>' + escapeHtml(l === 'en' ? sb.en : sb.vi) + '</button>';
        }).join('') +
        '    </div>' +
        '  </td>' +
        '  <td class="cms-td-actions">' +
        '    <div class="cms-row-actions">' +
        '      <button type="button" class="cms-btn cms-btn--ghost cms-btn--sm" data-inspect-booking="' + escapeHtml(b.id) + '">' + escapeHtml(msg('inspect')) + '</button>' +
        '      <button type="button" class="cms-btn cms-btn--danger-ghost cms-btn--sm" data-delete-item="bookings" data-delete-id="' + escapeHtml(b.id) + '">' + escapeHtml(msg('del')) + '</button>' +
        '    </div>' +
        '  </td>' +
        '</tr>'
      );
    }).join('');
  }

  // ---- Master Render -------------------------------------------------------
  function renderAll() {
    var snap = store.getAll();
    syncStaticI18n();
    updateBadges(snap);
    renderOverview(snap);
    renderDestinations(snap);
    renderStays(snap);
    renderTours(snap);
    renderFlights(snap);
    renderEsims(snap);
    renderGiftcards(snap);
    renderBookings(snap);
  }

  // ---- Drawer & Modal Helpers ----------------------------------------------
  function openDrawer(eyebrow, title, bodyHtml, onReady) {
    uiState.lastFocusedBeforeOverlay = document.activeElement;
    var backdrop = document.getElementById('cms-drawer-backdrop');
    var drawer = document.getElementById('cms-drawer');
    document.getElementById('drawer-eyebrow').textContent = eyebrow;
    document.getElementById('drawer-title').textContent = title;
    var body = document.getElementById('drawer-body');
    body.innerHTML = bodyHtml;
    backdrop.hidden = false;
    wireImageFallbacks(body);
    if (typeof onReady === 'function') onReady(body);
    drawer.focus();
  }

  function closeDrawer() {
    var backdrop = document.getElementById('cms-drawer-backdrop');
    if (backdrop && !backdrop.hidden) {
      backdrop.hidden = true;
      document.getElementById('drawer-body').innerHTML = '';
      if (uiState.lastFocusedBeforeOverlay && typeof uiState.lastFocusedBeforeOverlay.focus === 'function') {
        uiState.lastFocusedBeforeOverlay.focus();
      }
    }
  }

  function openConfirmModal(title, desc, onConfirm) {
    uiState.lastFocusedBeforeOverlay = document.activeElement;
    uiState.modalAction = onConfirm;
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-desc').textContent = desc;
    document.getElementById('modal-cancel-btn').textContent = msg('cancel');
    document.getElementById('modal-confirm-btn').textContent = msg('confirm');
    var backdrop = document.getElementById('cms-modal-backdrop');
    backdrop.hidden = false;
    document.getElementById('cms-modal').focus();
  }

  function closeConfirmModal() {
    var backdrop = document.getElementById('cms-modal-backdrop');
    if (backdrop && !backdrop.hidden) {
      backdrop.hidden = true;
      uiState.modalAction = null;
      if (uiState.lastFocusedBeforeOverlay && typeof uiState.lastFocusedBeforeOverlay.focus === 'function') {
        uiState.lastFocusedBeforeOverlay.focus();
      }
    }
  }

  function bindPhotoPickerAndPreview(root, inputId, selectId, previewId) {
    var inp = root.querySelector('#' + inputId);
    var sel = root.querySelector('#' + selectId);
    var img = root.querySelector('#' + previewId);
    if (!inp || !sel || !img) return;

    function syncPreview(val) {
      img.onerror = function () {
        img.onerror = null;
        img.src = FALLBACK_SVG;
      };
      img.src = safeImgSrc(val);
    }

    sel.addEventListener('change', function () {
      if (sel.value) {
        inp.value = sel.value;
        syncPreview(sel.value);
      }
    });
    inp.addEventListener('input', function () {
      syncPreview(inp.value);
    });
  }

  // ---- Destination CRUD Form -----------------------------------------------
  function openDestinationEditor(destId) {
    var snap = store.getAll();
    var l = lang();
    var isNew = !destId;
    var existing = isNew
      ? {
          id: '',
          displayName: '',
          displayNameEn: '',
          shortName: '',
          region: 'central',
          regionLabel: 'Miền Trung',
          adminUnit2026: '',
          gatewayAirport: 'DAD',
          transferNote: '',
          bestMonths: [3, 4],
          rainyMonths: [9, 10],
          bestSeasonText: '',
          weatherWarningText: '',
          summary: '',
          photo: 'assets/photos/danang.webp'
        }
      : (snap.destinations || []).filter(function (d) { return d.id === destId; })[0];

    if (!existing) return;

    var airportCodes = ['', 'HAN', 'VDO', 'HPH', 'HUI', 'DAD', 'CXR', 'DLI', 'SGN', 'PQC'];
    var curAirport = existing.gatewayAirport || '';
    var airportOptions = airportCodes.map(function (code) {
      var lbl = code ? code : (l === 'en' ? 'None (Overland)' : 'Không có sân bay');
      return '<option value="' + escapeHtml(code) + '"' + (curAirport === code ? ' selected' : '') + '>' + escapeHtml(lbl) + '</option>';
    }).join('');

    function monthButtonsHtml(prefix, selectedArr) {
      var arr = Array.isArray(selectedArr) ? selectedArr : [];
      var cls = prefix === 'best' ? 'is-selected-best' : 'is-selected-rainy';
      var out = '';
      for (var m = 1; m <= 12; m++) {
        var on = arr.indexOf(m) !== -1;
        out += '<button type="button" class="cms-month-btn' + (on ? ' ' + cls : '') + '" data-month-toggle="' + prefix + '" data-month="' + m + '" aria-pressed="' + (on ? 'true' : 'false') + '">T' + m + '</button>';
      }
      return out;
    }

    var formHtml =
      '<form class="cms-form" id="dest-form" method="post" novalidate>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-id-inp">ID Slug</label>' +
      '      <input class="cms-input" id="dest-id-inp" name="id" required value="' + escapeHtml(existing.id) + '" ' + (isNew ? 'placeholder="e.g. condaos"' : 'readonly') + '>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-region-inp">' + (l === 'en' ? 'Region' : 'Miền') + '</label>' +
      '      <select class="cms-select" id="dest-region-inp" name="region">' +
      '        <option value="north"' + (existing.region === 'north' ? ' selected' : '') + '>' + escapeHtml(msg('regionNorth')) + '</option>' +
      '        <option value="central"' + (existing.region === 'central' ? ' selected' : '') + '>' + escapeHtml(msg('regionCentral')) + '</option>' +
      '        <option value="south"' + (existing.region === 'south' ? ' selected' : '') + '>' + escapeHtml(msg('regionSouth')) + '</option>' +
      '      </select>' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-name-inp">displayName (VI)</label>' +
      '      <input class="cms-input" id="dest-name-inp" name="displayName" required value="' + escapeHtml(existing.displayName || '') + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-name-en-inp">displayNameEn (EN)</label>' +
      '      <input class="cms-input" id="dest-name-en-inp" name="displayNameEn" value="' + escapeHtml(existing.displayNameEn || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="dest-admin-inp">adminUnit2026 (' + (l === 'en' ? '2026 Admin Unit' : 'Đơn vị hành chính 2026') + ')</label>' +
      '    <input class="cms-input" id="dest-admin-inp" name="adminUnit2026" required value="' + escapeHtml(existing.adminUnit2026 || '') + '">' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-airport-sel">gatewayAirport</label>' +
      '      <select class="cms-select" id="dest-airport-sel" name="gatewayAirport">' + airportOptions + '</select>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-short-inp">shortName</label>' +
      '      <input class="cms-input" id="dest-short-inp" name="shortName" value="' + escapeHtml(existing.shortName || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="dest-transfer-inp">transferNote</label>' +
      '    <textarea class="cms-textarea" id="dest-transfer-inp" name="transferNote">' + escapeHtml(existing.transferNote || '') + '</textarea>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <span class="cms-label">bestMonths (' + (l === 'en' ? 'Click months 1-12' : 'Chọn tháng mùa đẹp 1-12') + ')</span>' +
      '    <div class="cms-month-picker-grid" id="dest-best-months">' + monthButtonsHtml('best', existing.bestMonths) + '</div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <span class="cms-label">rainyMonths (' + (l === 'en' ? 'Click rainy/storm months' : 'Chọn tháng mưa / bão') + ')</span>' +
      '    <div class="cms-month-picker-grid" id="dest-rainy-months">' + monthButtonsHtml('rainy', existing.rainyMonths) + '</div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-best-txt">bestSeasonText</label>' +
      '      <input class="cms-input" id="dest-best-txt" name="bestSeasonText" value="' + escapeHtml(existing.bestSeasonText || '') + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="dest-warn-txt">weatherWarningText</label>' +
      '      <input class="cms-input" id="dest-warn-txt" name="weatherWarningText" value="' + escapeHtml(existing.weatherWarningText || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="dest-summary-inp">summary</label>' +
      '    <textarea class="cms-textarea" id="dest-summary-inp" name="summary">' + escapeHtml(existing.summary || '') + '</textarea>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="dest-photo-sel">' + (l === 'en' ? 'Quick Pick Photo (assets/photos/*.webp)' : 'Chọn nhanh ảnh có sẵn (assets/photos/*.webp)') + '</label>' +
      '    <select class="cms-select" id="dest-photo-sel">' + buildPhotoOptionsHtml(existing.photo) + '</select>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="dest-photo-inp">photo URL / Path</label>' +
      '    <div class="cms-photo-preview-box">' +
      '      <img id="dest-photo-preview" src="' + escapeHtml(safeImgSrc(existing.photo)) + '" alt="Preview" data-fallback="1">' +
      '      <input class="cms-input" id="dest-photo-inp" name="photo" value="' + escapeHtml(existing.photo || '') + '" placeholder="assets/photos/danang.webp">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__footer">' +
      (!isNew ? '<button type="button" class="cms-btn cms-btn--danger-ghost" id="drawer-delete-btn">' + escapeHtml(msg('del')) + '</button>' : '') +
      '    <div class="cms-form__footer-right">' +
      '      <button type="button" class="cms-btn cms-btn--ghost" id="drawer-cancel-btn">' + escapeHtml(msg('cancel')) + '</button>' +
      '      <button type="submit" class="cms-btn cms-btn--primary">' + escapeHtml(isNew ? msg('create') : msg('save')) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</form>';

    openDrawer('destinations', isNew ? msg('btnAddDestination') : (existing.displayName || existing.id), formHtml, function (body) {
      var bestSet = new Set(existing.bestMonths || []);
      var rainySet = new Set(existing.rainyMonths || []);

      body.addEventListener('click', function (ev) {
        var mBtn = ev.target.closest('[data-month-toggle]');
        if (!mBtn) return;
        var kind = mBtn.getAttribute('data-month-toggle');
        var mNum = Number(mBtn.getAttribute('data-month'));
        var setRef = kind === 'best' ? bestSet : rainySet;
        var cls = kind === 'best' ? 'is-selected-best' : 'is-selected-rainy';
        if (setRef.has(mNum)) {
          setRef.delete(mNum);
          mBtn.classList.remove(cls);
          mBtn.setAttribute('aria-pressed', 'false');
        } else {
          setRef.add(mNum);
          mBtn.classList.add(cls);
          mBtn.setAttribute('aria-pressed', 'true');
        }
      });

      bindPhotoPickerAndPreview(body, 'dest-photo-inp', 'dest-photo-sel', 'dest-photo-preview');
      body.querySelector('#drawer-cancel-btn').addEventListener('click', closeDrawer);

      var delBtn = body.querySelector('#drawer-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
            store.deleteItem('destinations', existing.id);
            closeConfirmModal();
            closeDrawer();
            showToast(msg('toastDeleted'));
          });
        });
      }

      body.querySelector('#dest-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        var slug = String(f.id.value || '').trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-');
        if (!slug) {
          slug = 'dest-' + Date.now().toString(36);
        }
        var regionVal = f.region.value || 'central';
        var regionLabelMap = { north: 'Miền Bắc', central: 'Miền Trung', south: 'Miền Nam' };
        var regionLabelEnMap = { north: 'Northern Vietnam', central: 'Central Vietnam', south: 'Southern Vietnam' };

        var payload = {
          id: slug,
          displayName: String(f.displayName.value || '').trim() || slug,
          displayNameEn: String(f.displayNameEn.value || '').trim(),
          shortName: String(f.shortName.value || '').trim() || String(f.displayName.value || '').trim(),
          region: regionVal,
          regionLabel: regionLabelMap[regionVal] || 'Miền Trung',
          regionLabelEn: regionLabelEnMap[regionVal] || 'Central Vietnam',
          adminUnit2026: String(f.adminUnit2026.value || '').trim(),
          gatewayAirport: f.gatewayAirport.value || null,
          transferNote: String(f.transferNote.value || '').trim(),
          bestMonths: Array.from(bestSet).sort(function (a, b) { return a - b; }),
          rainyMonths: Array.from(rainySet).sort(function (a, b) { return a - b; }),
          bestSeasonText: String(f.bestSeasonText.value || '').trim(),
          weatherWarningText: String(f.weatherWarningText.value || '').trim(),
          summary: String(f.summary.value || '').trim(),
          photo: String(f.photo.value || '').trim() || 'assets/photos/danang.webp'
        };

        store.upsertItem('destinations', payload);
        closeDrawer();
        showToast(msg('toastSaved'));
      });
    });
  }

  // ---- Stay CRUD Form ------------------------------------------------------
  function openStayEditor(stayId) {
    var snap = store.getAll();
    var l = lang();
    var isNew = !stayId;
    var existing = isNew
      ? {
          id: '',
          name: '',
          destinationId: (snap.destinations[0] && snap.destinations[0].id) || 'danang',
          zone: '',
          category: 'hotel',
          tier: 'mid',
          pricePerNightVND: 1500000,
          unitLabel: 'phòng/đêm',
          amenities: ['Wifi', 'Ăn sáng'],
          photo: 'assets/photos/resort-pool.webp'
        }
      : (snap.stays || []).filter(function (s) { return s.id === stayId; })[0];

    if (!existing) return;
    var normCat = normalizeStayCategory(existing);
    var priceVal = getStayPriceVND(existing);
    var destOpts = (snap.destinations || []).map(function (d) {
      var lbl = l === 'en' ? (d.shortNameEn || d.displayNameEn || d.shortName) : (d.shortName || d.displayName);
      return '<option value="' + escapeHtml(d.id) + '"' + (existing.destinationId === d.id ? ' selected' : '') + '>' + escapeHtml(lbl) + '</option>';
    }).join('');

    var formHtml =
      '<form class="cms-form" id="stay-form" method="post" novalidate>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="stay-name-inp">' + (l === 'en' ? 'Property Name' : 'Tên khách sạn / Homestay / Du thuyền') + '</label>' +
      '    <input class="cms-input" id="stay-name-inp" name="name" required value="' + escapeHtml(existing.name || '') + '">' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="stay-dest-inp">destinationId</label>' +
      '      <select class="cms-select" id="stay-dest-inp" name="destinationId">' + destOpts + '</select>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="stay-zone-inp">zone</label>' +
      '      <input class="cms-input" id="stay-zone-inp" name="zone" required value="' + escapeHtml(existing.zone || '') + '" placeholder="Biển Mỹ Khê, Bãi Cháy...">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="stay-cat-inp">category</label>' +
      '      <select class="cms-select" id="stay-cat-inp" name="category">' +
      '        <option value="hotel"' + (normCat === 'hotel' ? ' selected' : '') + '>hotel (Hotel / Resort)</option>' +
      '        <option value="home"' + (normCat === 'home' ? ' selected' : '') + '>home (Home &amp; Villa)</option>' +
      '        <option value="cruise"' + (normCat === 'cruise' ? ' selected' : '') + '>cruise (Du thuyền)</option>' +
      '      </select>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="stay-tier-inp">tier</label>' +
      '      <select class="cms-select" id="stay-tier-inp" name="tier">' +
      '        <option value="budget"' + (existing.tier === 'budget' ? ' selected' : '') + '>budget</option>' +
      '        <option value="mid"' + (existing.tier === 'mid' ? ' selected' : '') + '>mid</option>' +
      '        <option value="luxury"' + (existing.tier === 'luxury' ? ' selected' : '') + '>luxury</option>' +
      '      </select>' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="stay-price-inp">priceVND (VNĐ)</label>' +
      '      <input type="number" min="0" step="50000" class="cms-input sc-nums" id="stay-price-inp" name="priceVND" required value="' + escapeHtml(priceVal) + '">' +
      '      <span class="cms-hint sc-nums" id="stay-usd-hint">~ ' + escapeHtml(store.formatPrice(priceVal, 'USD')) + '</span>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="stay-unit-inp">unitLabel</label>' +
      '      <input class="cms-input" id="stay-unit-inp" name="unitLabel" value="' + escapeHtml(existing.unitLabel || 'phòng/đêm') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="stay-amenities-inp">amenities (' + (l === 'en' ? 'comma separated' : 'ngăn cách bằng dấu phẩy') + ')</label>' +
      '    <textarea class="cms-textarea" id="stay-amenities-inp" name="amenities">' + escapeHtml((existing.amenities || []).join(', ')) + '</textarea>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="stay-photo-sel">' + (l === 'en' ? 'Quick Pick Photo' : 'Chọn nhanh ảnh có sẵn') + '</label>' +
      '    <select class="cms-select" id="stay-photo-sel">' + buildPhotoOptionsHtml(existing.photo || existing.image) + '</select>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="stay-photo-inp">photo</label>' +
      '    <div class="cms-photo-preview-box">' +
      '      <img id="stay-photo-preview" src="' + escapeHtml(safeImgSrc(existing.photo || existing.image)) + '" alt="Preview" data-fallback="1">' +
      '      <input class="cms-input" id="stay-photo-inp" name="photo" value="' + escapeHtml(existing.photo || existing.image || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__footer">' +
      (!isNew ? '<button type="button" class="cms-btn cms-btn--danger-ghost" id="drawer-delete-btn">' + escapeHtml(msg('del')) + '</button>' : '') +
      '    <div class="cms-form__footer-right">' +
      '      <button type="button" class="cms-btn cms-btn--ghost" id="drawer-cancel-btn">' + escapeHtml(msg('cancel')) + '</button>' +
      '      <button type="submit" class="cms-btn cms-btn--primary">' + escapeHtml(isNew ? msg('create') : msg('save')) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</form>';

    openDrawer('stays', isNew ? msg('btnAddStay') : existing.name, formHtml, function (body) {
      bindPhotoPickerAndPreview(body, 'stay-photo-inp', 'stay-photo-sel', 'stay-photo-preview');
      var priceInp = body.querySelector('#stay-price-inp');
      var usdHint = body.querySelector('#stay-usd-hint');
      priceInp.addEventListener('input', function () {
        usdHint.textContent = '~ ' + store.formatPrice(Number(priceInp.value || 0), 'USD');
      });
      body.querySelector('#drawer-cancel-btn').addEventListener('click', closeDrawer);

      var delBtn = body.querySelector('#drawer-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
            store.deleteItem('stays', existing.id);
            closeConfirmModal();
            closeDrawer();
            showToast(msg('toastDeleted'));
          });
        });
      }

      body.querySelector('#stay-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        var priceNum = Math.max(0, Number(f.priceVND.value || 0));
        var catVal = f.category.value || 'hotel';
        var unitLbl = String(f.unitLabel.value || '').trim() || 'phòng/đêm';
        var amenitiesArr = String(f.amenities.value || '')
          .split(',')
          .map(function (s) { return s.trim(); })
          .filter(Boolean);
        var photoPath = String(f.photo.value || '').trim() || 'assets/photos/resort-pool.webp';

        var payload = {
          id: existing.id || undefined,
          name: String(f.name.value || '').trim(),
          destinationId: f.destinationId.value,
          zone: String(f.zone.value || '').trim(),
          category: catVal,
          accommodationType: categoryToAccommodationType(catVal),
          tier: f.tier.value || 'mid',
          pricePerNightVND: priceNum,
          priceVND: priceNum,
          priceLabel: formatVndPlain(priceNum) + '/' + unitLbl,
          unitLabel: unitLbl,
          checkInTime: existing.checkInTime || '14:00',
          checkOutTime: existing.checkOutTime || '12:00',
          amenities: amenitiesArr,
          photo: photoPath
        };
        store.upsertItem('stays', payload);
        closeDrawer();
        showToast(msg('toastSaved'));
      });
    });
  }

  // ---- Tour CRUD Form ------------------------------------------------------
  function openTourEditor(tourId) {
    var snap = store.getAll();
    var l = lang();
    var isNew = !tourId;
    var existing = isNew
      ? {
          id: '',
          title: '',
          destinationId: (snap.destinations[0] && snap.destinations[0].id) || 'danang',
          durationDays: 1,
          durationLabel: '1 Ngày',
          type: 'tour',
          tier: 'mid',
          priceVND: 750000,
          departureFrom: 'Hà Nội',
          highlights: '',
          pricingBreakdown: '',
          weatherSensitive: false,
          weatherNote: '',
          photo: 'assets/photos/danang.webp'
        }
      : (snap.tours || []).filter(function (t) { return t.id === tourId; })[0];

    if (!existing) return;
    var destOpts = (snap.destinations || []).map(function (d) {
      var lbl = l === 'en' ? (d.shortNameEn || d.displayNameEn || d.shortName) : (d.shortName || d.displayName);
      return '<option value="' + escapeHtml(d.id) + '"' + (existing.destinationId === d.id ? ' selected' : '') + '>' + escapeHtml(lbl) + '</option>';
    }).join('');

    var formHtml =
      '<form class="cms-form" id="tour-form" method="post" novalidate>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="tour-title-inp">title</label>' +
      '    <input class="cms-input" id="tour-title-inp" name="title" required value="' + escapeHtml(existing.title || '') + '">' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="tour-dest-inp">destinationId</label>' +
      '      <select class="cms-select" id="tour-dest-inp" name="destinationId">' + destOpts + '</select>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="tour-dep-inp">departureFrom</label>' +
      '      <input class="cms-input" id="tour-dep-inp" name="departureFrom" value="' + escapeHtml(existing.departureFrom || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="tour-days-inp">durationDays</label>' +
      '      <input type="number" min="1" max="15" class="cms-input sc-nums" id="tour-days-inp" name="durationDays" value="' + escapeHtml(existing.durationDays || 1) + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="tour-dur-lbl">durationLabel</label>' +
      '      <input class="cms-input" id="tour-dur-lbl" name="durationLabel" value="' + escapeHtml(existing.durationLabel || '1 Ngày') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="tour-price-inp">priceVND (VNĐ)</label>' +
      '      <input type="number" min="0" step="25000" class="cms-input sc-nums" id="tour-price-inp" name="priceVND" required value="' + escapeHtml(existing.priceVND || 0) + '">' +
      '      <span class="cms-hint sc-nums" id="tour-usd-hint">~ ' + escapeHtml(store.formatPrice(existing.priceVND || 0, 'USD')) + '</span>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="tour-type-inp">type / tier</label>' +
      '      <select class="cms-select" id="tour-type-inp" name="type">' +
      '        <option value="tour"' + (existing.type === 'tour' ? ' selected' : '') + '>tour</option>' +
      '        <option value="ticket"' + (existing.type === 'ticket' ? ' selected' : '') + '>ticket (Vé tham quan)</option>' +
      '        <option value="combo"' + (existing.type === 'combo' ? ' selected' : '') + '>combo</option>' +
      '      </select>' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="tour-highlights-inp">highlights</label>' +
      '    <textarea class="cms-textarea" id="tour-highlights-inp" name="highlights">' + escapeHtml(existing.highlights || existing.pricingBreakdown || '') + '</textarea>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-check-row" for="tour-weather-chk">' +
      '      <input type="checkbox" id="tour-weather-chk" name="weatherSensitive"' + (existing.weatherSensitive ? ' checked' : '') + '>' +
      '      <span>weatherSensitive (' + (l === 'en' ? 'Subject to sea/storm port authority advisories' : 'Phụ thuộc thời tiết / lệnh cấm tàu cảng vụ') + ')</span>' +
      '    </label>' +
      '    <input class="cms-input" id="tour-weather-note" name="weatherNote" placeholder="Ghi chú cảnh báo thời tiết..." value="' + escapeHtml(existing.weatherNote || '') + '">' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="tour-photo-sel">' + (l === 'en' ? 'Quick Pick Photo' : 'Chọn nhanh ảnh có sẵn') + '</label>' +
      '    <select class="cms-select" id="tour-photo-sel">' + buildPhotoOptionsHtml(existing.photo || existing.image) + '</select>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="tour-photo-inp">image / photo</label>' +
      '    <div class="cms-photo-preview-box">' +
      '      <img id="tour-photo-preview" src="' + escapeHtml(safeImgSrc(existing.photo || existing.image)) + '" alt="Preview" data-fallback="1">' +
      '      <input class="cms-input" id="tour-photo-inp" name="photo" value="' + escapeHtml(existing.photo || existing.image || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__footer">' +
      (!isNew ? '<button type="button" class="cms-btn cms-btn--danger-ghost" id="drawer-delete-btn">' + escapeHtml(msg('del')) + '</button>' : '') +
      '    <div class="cms-form__footer-right">' +
      '      <button type="button" class="cms-btn cms-btn--ghost" id="drawer-cancel-btn">' + escapeHtml(msg('cancel')) + '</button>' +
      '      <button type="submit" class="cms-btn cms-btn--primary">' + escapeHtml(isNew ? msg('create') : msg('save')) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</form>';

    openDrawer('tours', isNew ? msg('btnAddTour') : existing.title, formHtml, function (body) {
      bindPhotoPickerAndPreview(body, 'tour-photo-inp', 'tour-photo-sel', 'tour-photo-preview');
      var priceInp = body.querySelector('#tour-price-inp');
      var usdHint = body.querySelector('#tour-usd-hint');
      priceInp.addEventListener('input', function () {
        usdHint.textContent = '~ ' + store.formatPrice(Number(priceInp.value || 0), 'USD');
      });
      body.querySelector('#drawer-cancel-btn').addEventListener('click', closeDrawer);

      var delBtn = body.querySelector('#drawer-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
            store.deleteItem('tours', existing.id);
            closeConfirmModal();
            closeDrawer();
            showToast(msg('toastDeleted'));
          });
        });
      }

      body.querySelector('#tour-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        var priceNum = Math.max(0, Number(f.priceVND.value || 0));
        var hl = String(f.highlights.value || '').trim();
        var tierGuess = priceNum < 800000 ? 'budget' : (priceNum >= 2500000 ? 'luxury' : 'mid');

        var payload = {
          id: existing.id || undefined,
          title: String(f.title.value || '').trim(),
          destinationId: f.destinationId.value,
          durationDays: Math.max(1, Number(f.durationDays.value || 1)),
          durationLabel: String(f.durationLabel.value || '').trim() || '1 Ngày',
          type: f.type.value || 'tour',
          tier: existing.tier || tierGuess,
          priceVND: priceNum,
          departureFrom: String(f.departureFrom.value || '').trim(),
          highlights: hl,
          pricingBreakdown: hl || existing.pricingBreakdown || '',
          weatherSensitive: !!f.weatherSensitive.checked,
          weatherNote: String(f.weatherNote.value || '').trim(),
          photo: String(f.photo.value || '').trim() || 'assets/photos/danang.webp'
        };

        store.upsertItem('tours', payload);
        closeDrawer();
        showToast(msg('toastSaved'));
      });
    });
  }

  // ---- Flight CRUD Form ----------------------------------------------------
  function openFlightEditor(flightId) {
    var snap = store.getAll();
    var l = lang();
    var isNew = !flightId;
    var existing = isNew
      ? {
          id: '',
          from: 'HAN',
          to: 'DAD',
          fromCity: 'Hà Nội',
          toCity: 'Đà Nẵng',
          durationText: '~1h 20p',
          durationMinutes: 80,
          lccOneWayVND: [600000, 1100000],
          roundTripRangeVND: [1200000, 2200000],
          tripTypesSupported: ['round-trip', 'one-way'],
          airlines: ['Vietnam Airlines', 'Vietjet Air'],
          routeNote: ''
        }
      : (snap.flights || []).filter(function (f) { return f.id === flightId; })[0];

    if (!existing) return;
    var owMin = (existing.lccOneWayVND && existing.lccOneWayVND[0]) || 600000;
    var owMax = (existing.lccOneWayVND && existing.lccOneWayVND[1]) || 1200000;
    var rtMin = (existing.roundTripRangeVND && existing.roundTripRangeVND[0]) || owMin * 2;
    var rtMax = (existing.roundTripRangeVND && existing.roundTripRangeVND[1]) || owMax * 2;

    var formHtml =
      '<form class="cms-form" id="flight-form" method="post" novalidate>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-from">From IATA</label>' +
      '      <input class="cms-input sc-nums" id="flt-from" name="from" maxlength="4" required value="' + escapeHtml(existing.from || '') + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-from-city">From City</label>' +
      '      <input class="cms-input" id="flt-from-city" name="fromCity" required value="' + escapeHtml(existing.fromCity || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-to">To IATA</label>' +
      '      <input class="cms-input sc-nums" id="flt-to" name="to" maxlength="4" required value="' + escapeHtml(existing.to || '') + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-to-city">To City</label>' +
      '      <input class="cms-input" id="flt-to-city" name="toCity" required value="' + escapeHtml(existing.toCity || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-dur-txt">durationText</label>' +
      '      <input class="cms-input" id="flt-dur-txt" name="durationText" value="' + escapeHtml(existing.durationText || '~1h 20p') + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-dur-min">durationMinutes</label>' +
      '      <input type="number" min="20" class="cms-input sc-nums" id="flt-dur-min" name="durationMinutes" value="' + escapeHtml(existing.durationMinutes || 80) + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-ow-min">One-way Min (VNĐ)</label>' +
      '      <input type="number" min="0" step="50000" class="cms-input sc-nums" id="flt-ow-min" name="owMin" value="' + escapeHtml(owMin) + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-ow-max">One-way Max (VNĐ)</label>' +
      '      <input type="number" min="0" step="50000" class="cms-input sc-nums" id="flt-ow-max" name="owMax" value="' + escapeHtml(owMax) + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-rt-min">Round-Trip Min (VNĐ)</label>' +
      '      <input type="number" min="0" step="50000" class="cms-input sc-nums" id="flt-rt-min" name="rtMin" value="' + escapeHtml(rtMin) + '">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="flt-rt-max">Round-Trip Max (VNĐ)</label>' +
      '      <input type="number" min="0" step="50000" class="cms-input sc-nums" id="flt-rt-max" name="rtMax" value="' + escapeHtml(rtMax) + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <span class="cms-label">airlines</span>' +
      '    <div class="cms-check-grid">' +
      AIRLINES_LIST.map(function (al) {
        var checked = (existing.airlines || []).indexOf(al) !== -1 ? ' checked' : '';
        return '<label class="cms-check-row"><input type="checkbox" name="airline" value="' + escapeHtml(al) + '"' + checked + '><span>' + escapeHtml(al) + '</span></label>';
      }).join('') +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="flt-note">routeNote</label>' +
      '    <input class="cms-input" id="flt-note" name="routeNote" value="' + escapeHtml(existing.routeNote || '') + '">' +
      '  </div>' +
      '  <div class="cms-form__footer">' +
      (!isNew ? '<button type="button" class="cms-btn cms-btn--danger-ghost" id="drawer-delete-btn">' + escapeHtml(msg('del')) + '</button>' : '') +
      '    <div class="cms-form__footer-right">' +
      '      <button type="button" class="cms-btn cms-btn--ghost" id="drawer-cancel-btn">' + escapeHtml(msg('cancel')) + '</button>' +
      '      <button type="submit" class="cms-btn cms-btn--primary">' + escapeHtml(isNew ? msg('create') : msg('save')) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</form>';

    openDrawer('flights', isNew ? msg('btnAddFlight') : (existing.from + ' -> ' + existing.to), formHtml, function (body) {
      body.querySelector('#drawer-cancel-btn').addEventListener('click', closeDrawer);

      var delBtn = body.querySelector('#drawer-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
            store.deleteItem('flights', existing.id);
            closeConfirmModal();
            closeDrawer();
            showToast(msg('toastDeleted'));
          });
        });
      }

      body.querySelector('#flight-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        var fromCode = String(f.from.value || '').trim().toUpperCase();
        var toCode = String(f.to.value || '').trim().toUpperCase();
        var oMin = Math.max(0, Number(f.owMin.value || 0));
        var oMax = Math.max(oMin, Number(f.owMax.value || 0));
        var rMin = Math.max(0, Number(f.rtMin.value || 0));
        var rMax = Math.max(rMin, Number(f.rtMax.value || 0));
        var airlines = Array.prototype.slice.call(f.querySelectorAll('input[name="airline"]:checked')).map(function (c) { return c.value; });

        var payload = {
          id: existing.id || ('flt-' + fromCode.toLowerCase() + '-' + toCode.toLowerCase() + '-' + Date.now().toString(36).slice(-3)),
          from: fromCode,
          to: toCode,
          fromCity: String(f.fromCity.value || '').trim() || fromCode,
          toCity: String(f.toCity.value || '').trim() || toCode,
          durationText: String(f.durationText.value || '').trim() || '~1h 15p',
          durationMinutes: Math.max(20, Number(f.durationMinutes.value || 75)),
          tripTypesSupported: ['round-trip', 'one-way'],
          lccOneWayVND: [oMin, oMax],
          roundTripRangeVND: [rMin, rMax],
          oneWayRangeLabel: oMin.toLocaleString('vi-VN') + ' - ' + oMax.toLocaleString('vi-VN') + ' VNĐ',
          roundTripLabel: rMin.toLocaleString('vi-VN') + ' - ' + rMax.toLocaleString('vi-VN') + ' VNĐ',
          airlines: airlines.length ? airlines : ['Vietnam Airlines'],
          routeNote: String(f.routeNote.value || '').trim()
        };

        store.upsertItem('flights', payload);
        closeDrawer();
        showToast(msg('toastSaved'));
      });
    });
  }

  // ---- eSIM CRUD Form ------------------------------------------------------
  function openEsimEditor(esimId) {
    var snap = store.getAll();
    var l = lang();
    var isNew = !esimId;
    var existing = isNew
      ? {
          id: '',
          provider: 'Viettel Direct',
          providerGroup: 'Viettel (Direct)',
          planCode: '5G90T',
          dataAllowance: '5 GB/ngày',
          validityDays: 15,
          priceVND: 90000,
          priceUSD: 3.60,
          hasLocalNumber: true,
          recommendedFor: ''
        }
      : (snap.esims || []).filter(function (e) { return e.id === esimId; })[0];

    if (!existing) return;

    var formHtml =
      '<form class="cms-form" id="esim-form" method="post" novalidate>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="esim-provider">provider</label>' +
      '      <input class="cms-input" id="esim-provider" name="provider" required value="' + escapeHtml(existing.provider || existing.providerGroup || '') + '" placeholder="Viettel Direct, Gigago, Airalo...">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="esim-code">planCode</label>' +
      '      <input class="cms-input sc-nums" id="esim-code" name="planCode" required value="' + escapeHtml(existing.planCode || '') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="esim-data">dataAllowance</label>' +
      '      <input class="cms-input" id="esim-data" name="dataAllowance" required value="' + escapeHtml(existing.dataAllowance || '') + '" placeholder="5 GB/ngày">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="esim-days">validityDays</label>' +
      '      <input type="number" min="1" max="365" class="cms-input sc-nums" id="esim-days" name="validityDays" required value="' + escapeHtml(existing.validityDays || 7) + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="esim-vnd">priceVND (VNĐ)</label>' +
      '      <input type="number" min="0" step="5000" class="cms-input sc-nums" id="esim-vnd" name="priceVND" required value="' + escapeHtml(existing.priceVND || 0) + '">' +
      '      <span class="cms-hint sc-nums" id="esim-usd-hint">~ ' + escapeHtml(store.formatPrice(existing.priceVND || 0, 'USD')) + '</span>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="esim-local-check">hasLocalNumber (+84)</label>' +
      '      <label class="cms-check-row" style="margin-top:0.35rem">' +
      '        <input type="checkbox" id="esim-local-check" name="hasLocalNumber"' + (existing.hasLocalNumber ? ' checked' : '') + '>' +
      '        <span>' + escapeHtml(l === 'en' ? 'Includes Vietnamese +84 phone number' : 'Có số điện thoại +84 nhận SMS') + '</span>' +
      '      </label>' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="esim-rec">recommendedFor</label>' +
      '    <textarea class="cms-textarea" id="esim-rec" name="recommendedFor">' + escapeHtml(existing.recommendedFor || '') + '</textarea>' +
      '  </div>' +
      '  <div class="cms-form__footer">' +
      (!isNew ? '<button type="button" class="cms-btn cms-btn--danger-ghost" id="drawer-delete-btn">' + escapeHtml(msg('del')) + '</button>' : '') +
      '    <div class="cms-form__footer-right">' +
      '      <button type="button" class="cms-btn cms-btn--ghost" id="drawer-cancel-btn">' + escapeHtml(msg('cancel')) + '</button>' +
      '      <button type="submit" class="cms-btn cms-btn--primary">' + escapeHtml(isNew ? msg('create') : msg('save')) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</form>';

    openDrawer('esims', isNew ? msg('btnAddEsim') : (existing.provider + ' · ' + existing.planCode), formHtml, function (body) {
      var vndInp = body.querySelector('#esim-vnd');
      var hint = body.querySelector('#esim-usd-hint');
      vndInp.addEventListener('input', function () {
        hint.textContent = '~ ' + store.formatPrice(Number(vndInp.value || 0), 'USD');
      });
      body.querySelector('#drawer-cancel-btn').addEventListener('click', closeDrawer);

      var delBtn = body.querySelector('#drawer-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
            store.deleteItem('esims', existing.id);
            closeConfirmModal();
            closeDrawer();
            showToast(msg('toastDeleted'));
          });
        });
      }

      body.querySelector('#esim-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        var priceNum = Math.max(0, Number(f.priceVND.value || 0));
        var hasNum = !!f.hasLocalNumber.checked;
        var prov = String(f.provider.value || '').trim();

        var payload = {
          id: existing.id || undefined,
          provider: prov,
          providerGroup: prov,
          planCode: String(f.planCode.value || '').trim(),
          dataAllowance: String(f.dataAllowance.value || '').trim(),
          validityDays: Math.max(1, Number(f.validityDays.value || 7)),
          priceVND: priceNum,
          priceUSD: Number(store.vndToUsd(priceNum).toFixed(2)),
          hasLocalNumber: hasNum,
          localNumberNote: hasNum ? 'Có số +84' : 'Không (Data-only)',
          recommendedFor: String(f.recommendedFor.value || '').trim()
        };

        store.upsertItem('esims', payload);
        closeDrawer();
        showToast(msg('toastSaved'));
      });
    });
  }

  // ---- Giftcard CRUD Form --------------------------------------------------
  function openGiftcardEditor(gcId) {
    var snap = store.getAll();
    var l = lang();
    var isNew = !gcId;
    var existing = isNew
      ? {
          id: '',
          title: '',
          titleEn: '',
          themeId: 'island',
          themeLabel: 'Nghỉ dưỡng Biển Đảo',
          themeLabelEn: 'Island & Beach Escape',
          amountVND: 2000000,
          validityMonths: 18,
          sampleDest: 'Phú Quốc · Nha Trang · Đà Nẵng',
          redeemScope: REDEEM_SCOPE_ALL.slice(),
          termsSummary: 'Hiệu lực 12-24 tháng, trừ dần số dư, không quy đổi tiền mặt; hoàn trả vào ví tín dụng nếu hủy bất khả kháng.',
          photo: 'assets/gen/giftcard-still.webp'
        }
      : (snap.giftcards || []).filter(function (g) { return g.id === gcId; })[0];

    if (!existing) return;

    var themeOpts = GIFTCARD_THEMES.map(function (t) {
      return '<option value="' + escapeHtml(t.id) + '"' + (existing.themeId === t.id ? ' selected' : '') + '>' + escapeHtml(l === 'en' ? t.en : t.vi) + '</option>';
    }).join('');

    var formHtml =
      '<form class="cms-form" id="gc-form" method="post" novalidate>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="gc-theme">themeId</label>' +
      '      <select class="cms-select" id="gc-theme" name="themeId">' + themeOpts + '</select>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="gc-amount">amountVND (VNĐ)</label>' +
      '      <input type="number" min="100000" step="100000" class="cms-input sc-nums" id="gc-amount" name="amountVND" required value="' + escapeHtml(existing.amountVND || 1000000) + '">' +
      '      <span class="cms-hint sc-nums" id="gc-usd-hint">~ ' + escapeHtml(store.formatPrice(existing.amountVND || 1000000, 'USD')) + '</span>' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="gc-title">title (VI)</label>' +
      '      <input class="cms-input" id="gc-title" name="title" value="' + escapeHtml(existing.title || '') + '" placeholder="Tự tạo nếu để trống">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="gc-months">validityMonths</label>' +
      '      <input type="number" min="6" max="36" class="cms-input sc-nums" id="gc-months" name="validityMonths" value="' + escapeHtml(existing.validityMonths || 18) + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="gc-dest">sampleDest</label>' +
      '    <input class="cms-input" id="gc-dest" name="sampleDest" value="' + escapeHtml(existing.sampleDest || '') + '">' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <span class="cms-label">redeemScope</span>' +
      '    <div class="cms-check-grid">' +
      REDEEM_SCOPE_ALL.map(function (sc) {
        var checked = (existing.redeemScope || REDEEM_SCOPE_ALL).indexOf(sc) !== -1 ? ' checked' : '';
        return '<label class="cms-check-row"><input type="checkbox" name="scope" value="' + escapeHtml(sc) + '"' + checked + '><span>' + escapeHtml(sc) + '</span></label>';
      }).join('') +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="gc-terms">termsSummary</label>' +
      '    <textarea class="cms-textarea" id="gc-terms" name="termsSummary">' + escapeHtml(existing.termsSummary || '') + '</textarea>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="gc-photo-sel">' + (l === 'en' ? 'Quick Pick Photo' : 'Chọn nhanh ảnh có sẵn') + '</label>' +
      '    <select class="cms-select" id="gc-photo-sel">' + buildPhotoOptionsHtml(existing.photo) + '</select>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="gc-photo-inp">photo</label>' +
      '    <div class="cms-photo-preview-box">' +
      '      <img id="gc-photo-preview" src="' + escapeHtml(safeImgSrc(existing.photo)) + '" alt="Preview" data-fallback="1">' +
      '      <input class="cms-input" id="gc-photo-inp" name="photo" value="' + escapeHtml(existing.photo || 'assets/gen/giftcard-still.webp') + '">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__footer">' +
      (!isNew ? '<button type="button" class="cms-btn cms-btn--danger-ghost" id="drawer-delete-btn">' + escapeHtml(msg('del')) + '</button>' : '') +
      '    <div class="cms-form__footer-right">' +
      '      <button type="button" class="cms-btn cms-btn--ghost" id="drawer-cancel-btn">' + escapeHtml(msg('cancel')) + '</button>' +
      '      <button type="submit" class="cms-btn cms-btn--primary">' + escapeHtml(isNew ? msg('create') : msg('save')) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</form>';

    openDrawer('giftcards', isNew ? msg('btnAddGiftcard') : (existing.title || existing.id), formHtml, function (body) {
      bindPhotoPickerAndPreview(body, 'gc-photo-inp', 'gc-photo-sel', 'gc-photo-preview');
      var amtInp = body.querySelector('#gc-amount');
      var hint = body.querySelector('#gc-usd-hint');
      amtInp.addEventListener('input', function () {
        hint.textContent = '~ ' + store.formatPrice(Number(amtInp.value || 0), 'USD');
      });
      body.querySelector('#drawer-cancel-btn').addEventListener('click', closeDrawer);

      var delBtn = body.querySelector('#drawer-delete-btn');
      if (delBtn) {
        delBtn.addEventListener('click', function () {
          openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
            store.deleteItem('giftcards', existing.id);
            closeConfirmModal();
            closeDrawer();
            showToast(msg('toastDeleted'));
          });
        });
      }

      body.querySelector('#gc-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        var amount = Math.max(100000, Number(f.amountVND.value || 500000));
        var tId = f.themeId.value || 'island';
        var tObj = GIFTCARD_THEMES.filter(function (x) { return x.id === tId; })[0] || GIFTCARD_THEMES[0];
        var formatted = formatVndPlain(amount);
        var titleVi = String(f.title.value || '').trim() || ('E-Giftcard ' + formatted + ' · ' + tObj.vi);
        var scopes = Array.prototype.slice.call(f.querySelectorAll('input[name="scope"]:checked')).map(function (c) { return c.value; });

        var payload = {
          id: existing.id || undefined,
          title: titleVi,
          titleEn: existing.titleEn || ('Travel E-Giftcard ' + formatted + ' · ' + tObj.en),
          themeId: tId,
          themeLabel: tObj.vi,
          themeLabelEn: tObj.en,
          amountVND: amount,
          validityMonths: Math.max(6, Number(f.validityMonths.value || 18)),
          sampleDest: String(f.sampleDest.value || '').trim() || tObj.sampleDest,
          redeemScope: scopes.length ? scopes : REDEEM_SCOPE_ALL.slice(),
          termsSummary: String(f.termsSummary.value || '').trim(),
          photo: String(f.photo.value || '').trim() || 'assets/gen/giftcard-still.webp'
        };

        store.upsertItem('giftcards', payload);
        closeDrawer();
        showToast(msg('toastSaved'));
      });
    });
  }

  // ---- Booking Detail & Test Order Creator ---------------------------------
  function openBookingInspector(bookingId) {
    var snap = store.getAll();
    var l = lang();
    var b = (snap.bookings || []).filter(function (x) { return x.id === bookingId; })[0];
    if (!b) return;

    var sm = getStatusMeta(b.status);
    var items = Array.isArray(b.items) ? b.items : [];
    var season = store.getSeasonStatus(null, b.travelMonth || 3, l);

    var html =
      '<div class="cms-detail-block">' +
      '  <h3>' + (l === 'en' ? 'Order Summary' : 'Thông tin đơn') + '</h3>' +
      '  <p style="margin:0 0 0.4rem"><strong class="sc-nums">' + escapeHtml(b.id) + '</strong> · <span class="cms-badge ' + sm.cls + '">' + escapeHtml(sm.label) + '</span> · <span class="cms-badge cms-badge--mono">' + escapeHtml(b.sourcePage || 'web') + '</span></p>' +
      '  <p class="cms-row-sub">' + escapeHtml(b.customerName) + ' · ' + escapeHtml(b.customerPhone) + ' · ' + escapeHtml(b.customerEmail) + '</p>' +
      '  <p class="cms-row-sub sc-nums">' + escapeHtml((b.travelDate || '-') + (b.returnDate ? ' -> ' + b.returnDate : '')) + ' · ' + escapeHtml((b.guests || 1) + msg('guestsSuffix')) + '</p>' +
      '  <p style="margin:0.45rem 0 0"><span class="cms-badge ' + getSeasonBadgeClass(season.code) + '">' + escapeHtml(season.label) + '</span></p>' +
      '</div>' +
      '<div class="cms-detail-block">' +
      '  <h3>' + (l === 'en' ? 'Line Items' : 'Chi tiết dịch vụ') + '</h3>' +
      (items.length
        ? '<div class="cms-detail-items">' + items.map(function (it) {
            return '<div class="cms-detail-item"><span>' + escapeHtml(it.title) + (it.qty && it.qty > 1 ? ' x' + it.qty : '') + '</span><strong class="sc-nums">' + escapeHtml(store.formatPrice(it.priceVND || 0)) + '</strong></div>';
          }).join('') + '</div>'
        : '<p class="cms-row-sub">' + (l === 'en' ? 'Support ticket / general inquiry' : 'Phiếu hỗ trợ / tư vấn tuyến') + '</p>') +
      '  <div class="cms-detail-item" style="margin-top:0.6rem;padding-top:0.5rem;border-top:1px solid var(--sc-hairline)">' +
      '    <strong>' + (l === 'en' ? 'Estimated Total' : 'Tổng ước tính') + '</strong>' +
      '    <strong class="sc-nums" style="color:var(--sc-accent)">' + escapeHtml(store.formatPriceDual(b.totalVND || 0)) + '</strong>' +
      '  </div>' +
      '</div>' +
      (b.notes ? '<div class="cms-detail-block"><h3>' + (l === 'en' ? 'Notes' : 'Ghi chú') + '</h3><p style="margin:0;font-size:0.86rem">' + escapeHtml(b.notes) + '</p></div>' : '') +
      '<div class="cms-detail-block">' +
      '  <h3>' + (l === 'en' ? 'Update Status' : 'Cập nhật trạng thái') + '</h3>' +
      '  <div class="cms-quick-status">' +
      ['pending', 'confirmed', 'completed', 'cancelled'].map(function (st) {
        var meta = getStatusMeta(st);
        var cur = b.status === st;
        return '<button type="button" class="cms-btn cms-btn--sm ' + (cur ? 'cms-btn--primary' : 'cms-btn--ghost') + '" data-inspector-status="' + st + '">' + escapeHtml(meta.label) + '</button>';
      }).join('') +
      '  </div>' +
      '</div>' +
      '<div class="cms-form__footer">' +
      '  <button type="button" class="cms-btn cms-btn--danger-ghost" id="inspector-delete">' + escapeHtml(msg('del')) + '</button>' +
      '  <div class="cms-form__footer-right">' +
      '    <button type="button" class="cms-btn cms-btn--ghost" id="inspector-close">' + escapeHtml(msg('cancel')) + '</button>' +
      '  </div>' +
      '</div>';

    openDrawer('bookings', b.id, html, function (body) {
      var stBtns = body.querySelectorAll('[data-inspector-status]');
      for (var i = 0; i < stBtns.length; i++) {
        stBtns[i].addEventListener('click', function () {
          var nextSt = this.getAttribute('data-inspector-status');
          store.updateBookingStatus(b.id, nextSt);
          showToast(msg('toastStatusUpdated'));
          openBookingInspector(b.id);
        });
      }
      body.querySelector('#inspector-close').addEventListener('click', closeDrawer);
      body.querySelector('#inspector-delete').addEventListener('click', function () {
        openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
          store.deleteItem('bookings', b.id);
          closeConfirmModal();
          closeDrawer();
          showToast(msg('toastDeleted'));
        });
      });
    });
  }

  function openNewBookingEditor() {
    var snap = store.getAll();
    var l = lang();
    var stayOpts = (snap.stays || []).slice(0, 12).map(function (s) {
      var price = getStayPriceVND(s);
      return '<option value="stay:' + escapeHtml(s.id) + ':' + price + '">' + escapeHtml('[Stay] ' + s.name + ' (' + store.formatPrice(price) + ')') + '</option>';
    }).join('');
    var tourOpts = (snap.tours || []).slice(0, 12).map(function (t) {
      return '<option value="tour:' + escapeHtml(t.id) + ':' + (t.priceVND || 0) + '">' + escapeHtml('[Tour] ' + t.title + ' (' + store.formatPrice(t.priceVND || 0) + ')') + '</option>';
    }).join('');

    var html =
      '<form class="cms-form" id="booking-form" method="post" novalidate>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-name">' + (l === 'en' ? 'Customer Name' : 'Tên khách hàng') + '</label>' +
      '      <input class="cms-input" id="bk-name" name="customerName" required value="Trần Hoàng Nam">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-type">' + (l === 'en' ? 'Traveler Type' : 'Phân loại khách') + '</label>' +
      '      <select class="cms-select" id="bk-type" name="travelerType">' +
      '        <option value="domestic">' + (l === 'en' ? 'Domestic (Nội địa)' : 'Nội địa') + '</option>' +
      '        <option value="international">' + (l === 'en' ? 'International (Quốc tế)' : 'Quốc tế') + '</option>' +
      '      </select>' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-phone">' + (l === 'en' ? 'Phone' : 'Số điện thoại') + '</label>' +
      '      <input class="cms-input" id="bk-phone" name="customerPhone" value="0912 456 789">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-email">Email</label>' +
      '      <input type="email" class="cms-input" id="bk-email" name="customerEmail" value="hoangnam.tran@example.vn">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-dep">' + (l === 'en' ? 'Departure Date' : 'Ngày khởi hành') + '</label>' +
      '      <input type="date" class="cms-input sc-nums" id="bk-dep" name="travelDate" value="2026-03-22">' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-guests">' + (l === 'en' ? 'Guests' : 'Số khách') + '</label>' +
      '      <input type="number" min="1" max="50" class="cms-input sc-nums" id="bk-guests" name="guests" value="2">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="bk-item">' + (l === 'en' ? 'Attach Catalog Service' : 'Chọn nhanh dịch vụ hoặc Phiếu hỗ trợ') + '</label>' +
      '    <select class="cms-select" id="bk-item" name="presetItem">' +
      '      <option value="support:custom:0">' + (l === 'en' ? '[Support Ticket] General consultation / Storm inquiry' : '[Phiếu hỗ trợ] Tư vấn lịch trình / Kiểm tra thời tiết') + '</option>' +
      stayOpts + tourOpts +
      '    </select>' +
      '  </div>' +
      '  <div class="cms-form__row">' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-status">' + (l === 'en' ? 'Initial Status' : 'Trạng thái ban đầu') + '</label>' +
      '      <select class="cms-select" id="bk-status" name="status">' +
      '        <option value="pending">' + escapeHtml(msg('statusPending')) + '</option>' +
      '        <option value="confirmed">' + escapeHtml(msg('statusConfirmed')) + '</option>' +
      '      </select>' +
      '    </div>' +
      '    <div class="cms-form__group">' +
      '      <label class="cms-label" for="bk-total">totalVND (VNĐ)</label>' +
      '      <input type="number" min="0" step="50000" class="cms-input sc-nums" id="bk-total" name="totalVND" value="0">' +
      '    </div>' +
      '  </div>' +
      '  <div class="cms-form__group">' +
      '    <label class="cms-label" for="bk-notes">' + (l === 'en' ? 'Notes / Support Message' : 'Ghi chú / Nội dung hỗ trợ') + '</label>' +
      '    <textarea class="cms-textarea" id="bk-notes" name="notes">Đơn test tạo trực tiếp từ Admin CMS để kiểm tra đồng bộ.</textarea>' +
      '  </div>' +
      '  <div class="cms-form__footer">' +
      '    <div class="cms-form__footer-right">' +
      '      <button type="button" class="cms-btn cms-btn--ghost" id="drawer-cancel-btn">' + escapeHtml(msg('cancel')) + '</button>' +
      '      <button type="submit" class="cms-btn cms-btn--primary">' + escapeHtml(msg('create')) + '</button>' +
      '    </div>' +
      '  </div>' +
      '</form>';

    openDrawer('bookings', msg('btnAddBooking'), html, function (body) {
      var itemSel = body.querySelector('#bk-item');
      var totalInp = body.querySelector('#bk-total');
      var guestsInp = body.querySelector('#bk-guests');

      function updateEstimated() {
        var parts = String(itemSel.value || '').split(':');
        var unit = Number(parts[2] || 0);
        var g = Math.max(1, Number(guestsInp.value || 1));
        totalInp.value = parts[0] === 'tour' ? (unit * g) : unit;
      }

      itemSel.addEventListener('change', updateEstimated);
      guestsInp.addEventListener('input', updateEstimated);
      body.querySelector('#drawer-cancel-btn').addEventListener('click', closeDrawer);

      body.querySelector('#booking-form').addEventListener('submit', function (ev) {
        ev.preventDefault();
        var f = ev.target;
        var selOpt = itemSel.options[itemSel.selectedIndex];
        var parts = String(itemSel.value || '').split(':');
        var depVal = String(f.travelDate.value || '2026-03-22');
        var mNum = Number(depVal.split('-')[1] || 3) || 3;
        var total = Math.max(0, Number(f.totalVND.value || 0));

        var items = parts[0] === 'support'
          ? [{ id: 'support-ticket', kind: 'support', title: selOpt ? selOpt.textContent : 'Support Inquiry', priceVND: total }]
          : [{ id: parts[1], kind: parts[0], title: selOpt ? selOpt.textContent : 'Booking Item', priceVND: total, qty: 1 }];

        store.addBooking({
          sourcePage: 'admin.html',
          status: f.status.value || 'pending',
          customerName: String(f.customerName.value || '').trim() || 'Guest',
          customerEmail: String(f.customerEmail.value || '').trim(),
          customerPhone: String(f.customerPhone.value || '').trim(),
          travelerType: f.travelerType.value || 'domestic',
          travelDate: depVal,
          travelMonth: mNum,
          guests: Math.max(1, Number(f.guests.value || 1)),
          currency: store.getCurrency(),
          lang: store.getLang(),
          items: items,
          totalVND: total,
          notes: String(f.notes.value || '').trim()
        });

        closeDrawer();
        showToast(msg('toastSaved'));
      });
    });
  }

  // ---- Export & Reset ------------------------------------------------------
  function handleExportJson() {
    var payload = store.getAll();
    var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    var dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = 'vietnam-atlas-cms-' + dateStr + '.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    global.setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    showToast(msg('toastExported'));
  }

  function handleImportFile(file, inputEl) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      if (inputEl) inputEl.value = '';
      var parsed = null;
      try {
        parsed = JSON.parse(String(reader.result || ''));
      } catch (err) {
        showToast(msg('toastImportError'), 'danger');
        return;
      }
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        showToast(msg('toastImportError'), 'danger');
        return;
      }

      var IMPORT_COLLECTIONS = ['destinations', 'stays', 'tours', 'flights', 'esims', 'giftcards', 'bookings'];
      var catalog = parsed.catalog && typeof parsed.catalog === 'object' && !Array.isArray(parsed.catalog)
        ? parsed.catalog
        : null;
      var updates = [];
      var totalItems = 0;

      IMPORT_COLLECTIONS.forEach(function (col) {
        var list = Array.isArray(parsed[col])
          ? parsed[col]
          : (catalog && Array.isArray(catalog[col]) ? catalog[col] : null);
        if (list) {
          updates.push({ col: col, items: list });
          totalItems += list.length;
        }
      });

      if (!updates.length) {
        showToast(msg('toastImportError'), 'danger');
        return;
      }

      var prefs = parsed.preferences && typeof parsed.preferences === 'object' ? parsed.preferences : parsed;
      var confirmDesc = msg('importConfirmDesc')
        .replace('{cols}', String(updates.length))
        .replace('{items}', String(totalItems));
      openConfirmModal(msg('importConfirmTitle'), confirmDesc, function () {
        updates.forEach(function (entry) {
          store.saveCollection(entry.col, entry.items);
        });
        if (prefs.lang === 'vi' || prefs.lang === 'en') {
          store.setLang(prefs.lang);
        }
        if (prefs.currency === 'VND' || prefs.currency === 'USD') {
          store.setCurrency(prefs.currency);
        }
        closeConfirmModal();
        closeDrawer();
        showToast(msg('toastImported').replace('{items}', String(totalItems)));
      });
    };
    reader.onerror = function () {
      if (inputEl) inputEl.value = '';
      showToast(msg('toastImportError'), 'danger');
    };
    reader.readAsText(file, 'utf-8');
  }

  function handleResetSeed() {
    openConfirmModal(msg('resetConfirmTitle'), msg('resetConfirmDesc'), function () {
      store.resetToSeed();
      closeConfirmModal();
      closeDrawer();
      showToast(msg('toastReset'), 'warn');
    });
  }

  // ---- Event Wiring --------------------------------------------------------
  function bindEvents() {
    // Primary Tabs
    var tabBtns = document.querySelectorAll('.cms-tab');
    for (var i = 0; i < tabBtns.length; i++) {
      tabBtns[i].addEventListener('click', function () {
        switchTab(this.getAttribute('data-tab'));
      });
    }

    // Subtabs
    var subBtns = document.querySelectorAll('.cms-subtab');
    for (var j = 0; j < subBtns.length; j++) {
      subBtns[j].addEventListener('click', function () {
        switchSubtab(this.getAttribute('data-subtab'));
      });
    }

    // Language & Currency Toggles
    var langBtns = document.querySelectorAll('[data-lang-btn]');
    for (var k = 0; k < langBtns.length; k++) {
      langBtns[k].addEventListener('click', function () {
        store.setLang(this.getAttribute('data-lang-btn'));
      });
    }
    var curBtns = document.querySelectorAll('[data-currency-btn]');
    for (var m = 0; m < curBtns.length; m++) {
      curBtns[m].addEventListener('click', function () {
        store.setCurrency(this.getAttribute('data-currency-btn'));
      });
    }

    // Mobile drawer toggle
    var menuBtn = document.getElementById('mobile-menu-toggle');
    var mobileDrawer = document.getElementById('mobile-drawer');
    if (menuBtn && mobileDrawer) {
      menuBtn.addEventListener('click', function () {
        var nextOpen = mobileDrawer.hidden;
        mobileDrawer.hidden = !nextOpen;
        menuBtn.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
      });
    }

    function closeMobileDrawer() {
      if (mobileDrawer) mobileDrawer.hidden = true;
      if (menuBtn) menuBtn.setAttribute('aria-expanded', 'false');
    }

    // Export, Import & Reset buttons (desktop + mobile)
    var importFileEl = document.getElementById('cms-import-file');
    ['btn-import-json', 'btn-import-json-mobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el && importFileEl) {
        el.addEventListener('click', function () {
          closeMobileDrawer();
          importFileEl.click();
        });
      }
    });
    if (importFileEl) {
      importFileEl.addEventListener('change', function () {
        var file = importFileEl.files && importFileEl.files[0];
        handleImportFile(file, importFileEl);
      });
    }
    ['btn-export-json', 'btn-export-json-mobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', function () {
          closeMobileDrawer();
          handleExportJson();
        });
      }
    });
    ['btn-reset-seed', 'btn-reset-seed-mobile'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('click', function () {
          closeMobileDrawer();
          handleResetSeed();
        });
      }
    });

    // Overview shortcuts
    document.getElementById('ov-goto-bookings').addEventListener('click', function () {
      switchTab('bookings');
    });
    document.getElementById('overview-month-select').addEventListener('change', function () {
      uiState.overviewMonth = Number(this.value || 3);
      renderOverview(store.getAll());
    });

    // Filter inputs
    function bindFilter(id, key, eventName, renderFn) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener(eventName, function () {
        uiState.filters[key] = el.value;
        renderFn(store.getAll());
      });
    }
    bindFilter('dest-search', 'destSearch', 'input', renderDestinations);
    bindFilter('dest-region-filter', 'destRegion', 'change', renderDestinations);
    bindFilter('stay-search', 'staySearch', 'input', renderStays);
    bindFilter('stay-dest-filter', 'stayDest', 'change', renderStays);
    bindFilter('stay-cat-filter', 'stayCat', 'change', renderStays);
    bindFilter('stay-tier-filter', 'stayTier', 'change', renderStays);
    bindFilter('tour-search', 'tourSearch', 'input', renderTours);
    bindFilter('tour-dest-filter', 'tourDest', 'change', renderTours);
    bindFilter('tour-weather-filter', 'tourWeather', 'change', renderTours);
    bindFilter('flight-search', 'flightSearch', 'input', renderFlights);
    bindFilter('esim-search', 'esimSearch', 'input', renderEsims);
    bindFilter('giftcard-search', 'giftcardSearch', 'input', renderGiftcards);
    bindFilter('booking-search', 'bookingSearch', 'input', renderBookings);

    // Add buttons
    document.getElementById('btn-add-destination').addEventListener('click', function () { openDestinationEditor(null); });
    document.getElementById('btn-add-stay').addEventListener('click', function () { openStayEditor(null); });
    document.getElementById('btn-add-tour').addEventListener('click', function () { openTourEditor(null); });
    document.getElementById('btn-add-flight').addEventListener('click', function () { openFlightEditor(null); });
    document.getElementById('btn-add-esim').addEventListener('click', function () { openEsimEditor(null); });
    document.getElementById('btn-add-giftcard').addEventListener('click', function () { openGiftcardEditor(null); });
    document.getElementById('btn-add-booking').addEventListener('click', openNewBookingEditor);

    // Delegated panel clicks (KPI jumps, Edit, Delete, Quick Status, Booking Inspector)
    document.getElementById('cms-main').addEventListener('click', function (ev) {
      var jump = ev.target.closest('[data-jump-tab]');
      if (jump) {
        switchTab(jump.getAttribute('data-jump-tab'));
        var sub = jump.getAttribute('data-jump-subtab');
        if (sub) switchSubtab(sub);
        return;
      }

      var bFilter = ev.target.closest('[data-booking-filter]');
      if (bFilter) {
        uiState.filters.bookingStatus = bFilter.getAttribute('data-booking-filter');
        renderBookings(store.getAll());
        return;
      }

      var qStatus = ev.target.closest('[data-quick-status]');
      if (qStatus) {
        var bId = qStatus.getAttribute('data-quick-status');
        var nextSt = qStatus.getAttribute('data-next-status');
        store.updateBookingStatus(bId, nextSt);
        showToast(msg('toastStatusUpdated'));
        return;
      }

      var inspectBtn = ev.target.closest('[data-inspect-booking]');
      if (inspectBtn) {
        openBookingInspector(inspectBtn.getAttribute('data-inspect-booking'));
        return;
      }

      var editDest = ev.target.closest('[data-edit-dest]');
      if (editDest) { openDestinationEditor(editDest.getAttribute('data-edit-dest')); return; }

      var editStay = ev.target.closest('[data-edit-stay]');
      if (editStay) { openStayEditor(editStay.getAttribute('data-edit-stay')); return; }

      var editTour = ev.target.closest('[data-edit-tour]');
      if (editTour) { openTourEditor(editTour.getAttribute('data-edit-tour')); return; }

      var editFlt = ev.target.closest('[data-edit-flight]');
      if (editFlt) { openFlightEditor(editFlt.getAttribute('data-edit-flight')); return; }

      var editEsim = ev.target.closest('[data-edit-esim]');
      if (editEsim) { openEsimEditor(editEsim.getAttribute('data-edit-esim')); return; }

      var editGc = ev.target.closest('[data-edit-giftcard]');
      if (editGc) { openGiftcardEditor(editGc.getAttribute('data-edit-giftcard')); return; }

      var delBtn = ev.target.closest('[data-delete-item]');
      if (delBtn) {
        var col = delBtn.getAttribute('data-delete-item');
        var id = delBtn.getAttribute('data-delete-id');
        openConfirmModal(msg('deleteConfirmTitle'), msg('deleteConfirmDesc'), function () {
          store.deleteItem(col, id);
          closeConfirmModal();
          showToast(msg('toastDeleted'));
        });
      }
    });

    // Drawer close events
    document.getElementById('drawer-close-btn').addEventListener('click', closeDrawer);
    document.getElementById('cms-drawer-backdrop').addEventListener('click', function (ev) {
      if (ev.target === this) closeDrawer();
    });

    // Modal close & confirm events
    document.getElementById('modal-cancel-btn').addEventListener('click', closeConfirmModal);
    document.getElementById('modal-confirm-btn').addEventListener('click', function () {
      if (typeof uiState.modalAction === 'function') uiState.modalAction();
    });
    document.getElementById('cms-modal-backdrop').addEventListener('click', function (ev) {
      if (ev.target === this) closeConfirmModal();
    });

    // Global Escape key
    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') {
        var modalBd = document.getElementById('cms-modal-backdrop');
        if (modalBd && !modalBd.hidden) {
          closeConfirmModal();
          return;
        }
        closeDrawer();
      }
    });

    // Subscribe to real-time cross-tab & internal store updates
    store.subscribe(function (snap, meta) {
      var isExternal = meta && (meta.type === 'broadcast' || meta.type === 'storage-event');
      renderAll();
      flashSyncIndicator(isExternal);

      if (isExternal) {
        var sourceType = meta.sourceMeta && meta.sourceMeta.type;
        if (sourceType === 'addBooking') {
          showToast(msg('toastExternalBooking'));
        } else {
          showToast(msg('toastExternalSync'));
        }
      }
    });
  }

  // ---- Init ----------------------------------------------------------------
  function init() {
    var timeEl = document.getElementById('sync-status-time');
    if (timeEl) timeEl.textContent = formatTimeShort();
    bindEvents();
    renderAll();

    // Support optional ?tab=... deep link into CMS
    try {
      var params = new URLSearchParams(global.location.search);
      var reqTab = params.get('tab');
      if (reqTab && document.getElementById('panel-' + reqTab)) {
        switchTab(reqTab);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
