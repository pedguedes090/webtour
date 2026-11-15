(function () {
  'use strict';

  var Store = window.VietnamAtlasStore;
  if (!Store) {
    console.error('VietnamAtlasStore not found.');
    return;
  }

  /* ---------- Exact Airport Lat/Lng Coordinates (supplements HAN/HPH/SGN) ---------- */
  var AIRPORT_COORDS = {
    HAN: [21.2212, 105.8072],
    VDO: [21.1158, 107.3917],
    HPH: [20.8194, 106.7250],
    HUI: [16.4014, 107.7028],
    DAD: [16.0439, 108.1994],
    CXR: [11.9981, 109.2192],
    DLI: [11.7486, 108.3828],
    SGN: [10.8188, 106.6519],
    PQC: [10.1656, 103.9922]
  };

  var AIRPORT_TO_DEST = {
    HAN: 'hanoi',
    VDO: 'halong',
    HPH: 'halong',
    HUI: 'hue',
    DAD: 'danang',
    CXR: 'nhatrang',
    DLI: 'dalat',
    SGN: 'hcmc',
    PQC: 'phuquoc'
  };

  /* ---------- Bilingual UI Dictionary (VI / EN, zero em dashes) ---------- */
  var I18N = {
    vi: {
      skipLink: 'Chuyển tới bản đồ & đặt dịch vụ',
      siteHome: 'Khám phá',
      sitePortal: 'Đặt dịch vụ',
      siteAdmin: 'Quản trị CMS',
      dossierShort: 'Hồ sơ',
      primaryCta: 'Lập hành trình',

      heroTitle: 'Một dải chữ S, trọn nhịp nắng đẹp.',
      heroLede: 'Bản đồ 11 vùng Việt Nam 2026: đồng bộ mùa nắng, chuyến bay, lưu trú và eSIM.',
      roundTripOpt: 'Round-Trip (Khứ hồi)',
      oneWayOpt: 'One-way (Một chiều)',
      openPortalLink: 'Mở Cổng đặt chỗ →',
      fieldSelectCity: 'Select City (Chọn khu vực)',
      fieldDepart: 'Ngày đi',
      fieldReturn: 'Ngày về',
      fieldBudget: 'Price / Budget',

      exploreTitle: 'Bản đồ 11 vùng đất & Đặt dịch vụ',
      exploreSubtitle: 'Cập nhật cấu trúc 34 đơn vị hành chính 2026, đồng bộ sân bay cửa ngõ, mùa nắng mưa và giá vé thời điểm.',
      wbOpenFullPortal: 'Xem toàn bộ trên Portal',
      fieldTripType: 'Hành trình bay',
      fieldDepartFull: 'Ngày khởi hành',
      fieldReturnFull: 'Ngày về',
      budgetAll: 'Tất cả',
      subAllStays: 'Tất cả lưu trú',
      mapResetBtn: 'Xem tất cả 11 điểm',

      silenceEyebrow: 'ACT 03 · 0 M BIỂN ĐÔNG → 1.487 M ĐỈNH BÀ NÀ',
      silenceLine: 'Biển lặng trước khi mây mở lối lên ngàn.',
      silenceFact: '0 m Vịnh Hạ Long -> 1.150 m Đèo Thung Khe · Cầu nối 3 mùa nắng đẹp Bắc - Trung - Nam',
      silenceCta: 'Khám phá Tour chọn lọc →',
      silenceCard1Title: 'Vịnh Hạ Long · 0 m',
      silenceCard1Tag: 'T3-5 & T9-11',
      silenceCard1Desc: 'Mặt vịnh ngọc lặng sóng · Du thuyền ngủ đêm & chèo kayak hang Luồn',
      silenceCard2Title: 'Mai Châu - Hòa Bình · 550 m',
      silenceCard2Tag: 'Đèo Thung Khe',
      silenceCard2Desc: 'Thung lũng lúa xanh & nhà sàn Bản Lác · Tắm khoáng nóng Kim Bôi',
      silenceCard3Title: 'Đà Nẵng - Bà Nà · 1.487 m',
      silenceCard3Tag: 'Mùa khô T2-8',
      silenceCard3Desc: 'Biển Mỹ Khê nối đỉnh Cầu Vàng · Cửa ngõ di sản Hội An - Huế',
      mapGeoMeta: 'Sa Pa đến Phú Quốc · 22.34°N - 10.22°N',

      peakTitle: 'Từ vịnh ngọc lên thung lũng mây Mai Châu',
      peakPriceLine: 'Tour tuyến Bắc 2N1Đ · Từ 1.450.000 VNĐ/khách · Đón Hà Nội',
      peakDesc: 'Vượt đèo Thung Khe 135 km từ Hà Nội để chạm mặt hồ sông Đà ở Thung Nai, tắm khoáng nóng Kim Bôi và nghỉ đêm nhà sàn Bản Lác.',
      peakAddTour: '+ Thêm Tour Mai Châu 2N1Đ',
      peakAddedTour: '✓ Đã thêm Tour Mai Châu 2N1Đ',
      peakBrowseTours: 'Xem bộ sưu tập Tour ↓',

      railTitle: 'Tour chọn lọc theo mùa nắng',
      railDesc: 'Chọn vùng bên dưới hoặc lướt ngang 12 tuyến Bắc - Trung - Nam để thêm trực tiếp vào Hồ sơ chuyến đi.',
      filterAll: 'Tất cả',
      filterOther: 'Vùng khác',
      railPortalBtn: 'Mở đủ 23 Tour trên Portal →',

      utilityTitle: 'eSIM phủ sóng 5G & Thẻ quà tặng điện tử',
      utilityDesc: 'Cài đặt dữ liệu di động trước giờ bay theo tuyến vùng núi hay biển đảo, hoặc gửi tặng E-Giftcard linh hoạt từ 500.000 VNĐ.',
      esimTitle: 'eSIM Du lịch Việt Nam',
      esimSubtitle: 'Gợi ý tự động theo điểm đến đang chọn trên bản đồ.',
      esimMetaQR: 'QR < 2 phút',
      esimVisualNote: 'Phủ sóng liền mạch từ vùng cao Sa Pa - Đèo Thung Khe ra tới vịnh Hạ Long, Đà Nẵng và Phú Quốc qua 34 ĐVHC.',
      days7: '7 ngày',
      days15: '15 ngày',
      days30: '30 ngày',
      esimIntlLabel: 'Khách quốc tế (ưu tiên +84 hoặc không cần eKYC sân bay)',
      giftTitle: 'Thẻ quà tặng E-Giftcard',
      giftSubtitle: 'Quy đổi cho Hotels & Homes, Tours, eSIM và Flights trên toàn quốc, trừ dần số dư trong 12 đến 24 tháng.',
      giftMetaTerm: 'Hạn 12-24 tháng',
      giftMetaBalance: 'Trừ dần số dư',
      giftMetaScope: 'Hotels · Flights · Tours',
      giftVisualNote: 'Thẻ điện tử gửi qua email kèm mã quy đổi đa dịch vụ và hoàn giữ giá trị nếu hoãn tàu vì thời tiết.',
      giftDenomLabel: 'Mệnh giá',
      giftThemeLabel: 'Chủ đề thiết kế',
      giftRecipientLabel: 'Tên người nhận',
      giftMsgLabel: 'Lời nhắn gửi',
      addGiftBtn: 'Thêm thẻ quà tặng',
      openGiftPortal: 'Cấu hình thêm tại Portal',
      giftTermsSummary: 'Điều khoản minh bạch: Hạn dùng, ngày cao điểm & hoàn tiền bão Hạ Long',

      supportsGroundTag: 'ACT 07 · QUY CHUẨN THỰC ĐỊA & CỨU HỘ',
      supportsTitle1: 'Số liệu thực, không ước lượng',
      metric34: 'Đơn vị hành chính cấp tỉnh Việt Nam 2026 (28 tỉnh và 6 thành phố trực thuộc Trung ương).',
      metric40: 'Mốc đóng quầy làm thủ tục bay nội địa trước giờ khởi hành (mở trước 2h, đóng cửa tàu bay trước 15 phút).',
      metric100: 'Hoàn tiền hoặc dời ngày miễn phí khi Cảng vụ Quảng Ninh cấm tàu trước giờ khởi hành từ Hà Nội.',
      unitMin: ' phút',
      supportsTitle2: 'Đầu số 112-115 & Chính sách thời tiết biển',

      dossierTitle: 'Hồ sơ chuyến đi của bạn',
      dossierDesc: 'Mọi chặng bay, lưu trú, tour, eSIM và thẻ quà tặng được tổng hợp trực tiếp vào VietnamAtlasStore, liên thông với Đặt dịch vụ (explore.html) và Quản trị CMS (admin.html).',
      dossierItemsHeading: 'Danh mục đã chọn',
      presetGolden: 'Điền mẫu Mùa Vàng T3-T4',
      presetNorth: 'Điền mẫu Tây Bắc & Hạ Long',
      clearBtn: 'Xóa trống',
      totalVNDLabel: 'Tổng ước tính (VNĐ)',
      totalUSDLabel: 'Quy đổi tham khảo (1 USD = 25.000 VNĐ)',
      datesLabel: 'Khung ngày dự kiến',
      formName: 'Họ tên người lập hành trình',
      formEmail: 'Email liên hệ',
      formPhone: 'Số điện thoại / WhatsApp',
      formNote: 'Ghi chú đoàn / Trẻ em hoặc người cao tuổi',
      exportJson: 'Tải JSON lịch trình',
      printBrief: 'In hồ sơ',
      gotoPortalFull: 'Mở đầy đủ trên Đặt dịch vụ (explore.html) →',
      gotoAdminCMS: 'Kiểm tra đơn trong Quản trị CMS (admin.html) →',
      colophonNote: 'Hệ sinh thái du lịch Việt Nam 2025-2026 (34 đơn vị hành chính). Giao diện trình diễn đồng bộ qua localStorage & BroadcastChannel (chế độ mô phỏng).',
      footerTop: 'Đỉnh trang',
      collapseBtn: 'Thu gọn',
      openDossierBtn: 'Mở Hồ sơ chuyến đi'
    },
    en: {
      skipLink: 'Skip to map and booking workbench',
      siteHome: 'Showcase',
      sitePortal: 'Booking Portal',
      siteAdmin: 'Admin CMS',
      dossierShort: 'Dossier',
      primaryCta: 'Build Trip',

      heroTitle: 'Vietnam Expedition Atlas.',
      heroLede: '11 Vietnam hubs mapped with 2026 administrative units, real monsoon windows, domestic flights, and eSIM data.',
      roundTripOpt: 'Round-Trip',
      oneWayOpt: 'One-way',
      openPortalLink: 'Open Booking Portal →',
      fieldSelectCity: 'Select City',
      fieldDepart: 'Departure',
      fieldReturn: 'Return Date',
      fieldBudget: 'Price / Budget',

      exploreTitle: 'Interactive Vietnam Map & Booking Workbench',
      exploreSubtitle: 'Updated for the 34 administrative units of 2026, paired with gateway airports, seasonal climate rules, and real pricing.',
      wbOpenFullPortal: 'Explore all listings in Portal',
      fieldTripType: 'Flight Leg Type',
      fieldDepartFull: 'Departure Date',
      fieldReturnFull: 'Return Date',
      budgetAll: 'All Tiers',
      subAllStays: 'All Stays',
      mapResetBtn: 'Show all 11 hubs',

      silenceEyebrow: 'ACT 03 · 0 M EAST SEA → 1,487 M BA NA RIDGE',
      silenceLine: 'Calm water before mountain mist opens the pass.',
      silenceFact: '0 m Ha Long Bay -> 1,150 m Thung Khe Pass · Linking North, Central & South sunny windows',
      silenceCta: 'Explore Featured Tours →',
      silenceCard1Title: 'Ha Long Bay · 0 m',
      silenceCard1Tag: 'Mar-May & Sep-Nov',
      silenceCard1Desc: 'Calm jade bay water · Overnight cruises & Luon Cave kayaking',
      silenceCard2Title: 'Mai Chau - Hoa Binh · 550 m',
      silenceCard2Tag: 'Thung Khe Pass',
      silenceCard2Desc: 'Terraced valleys & Ban Lac stilt houses · Kim Boi hot springs',
      silenceCard3Title: 'Da Nang - Ba Na · 1,487 m',
      silenceCard3Tag: 'Dry Feb-Aug',
      silenceCard3Desc: 'My Khe coast up to Golden Bridge · Gateway to Hoi An & Hue',
      mapGeoMeta: 'Sa Pa to Phu Quoc · 22.34°N - 10.22°N',

      peakTitle: 'From emerald bays to Mai Chau mist',
      peakPriceLine: 'Northern 2D1N Route · From 1,450,000 VNĐ / guest · Hanoi pickup',
      peakDesc: 'Cross Thung Khe Pass 135 km from Hanoi to reach Thung Nai reservoir, Kim Boi hot springs, and stilt-house valleys.',
      peakAddTour: '+ Add Mai Chau 2D1N Tour',
      peakAddedTour: '✓ Added Mai Chau 2D1N Tour',
      peakBrowseTours: 'Browse Tour Collection ↓',

      railTitle: 'Sunny-Season Curated Tours',
      railDesc: 'Filter by region below or pan across 12 North-to-South routes to add directly into your Trip Dossier.',
      filterAll: 'All',
      filterOther: 'Other Regions',
      railPortalBtn: 'Open All 23 Tours in Portal →',

      utilityTitle: '5G eSIM Advisor & Digital Giftcards',
      utilityDesc: 'Pick highland or island data coverage before departure, or customize flexible VND e-giftcards.',
      esimTitle: 'Vietnam Travel eSIM',
      esimSubtitle: 'Auto-matched to the hub currently selected on your map.',
      esimMetaQR: 'QR < 2 mins',
      esimVisualNote: 'Continuous 5G coverage from Sa Pa & Thung Khe Pass out to Ha Long Bay, Da Nang, and Phu Quoc across all 34 provinces.',
      days7: '7 days',
      days15: '15 days',
      days30: '30 days',
      esimIntlLabel: 'International visitor (prefer +84 number or eKYC-free setup)',
      giftTitle: 'Vietnam Atlas E-Giftcard',
      giftSubtitle: 'Redeemable across Hotels & Homes, Tours, eSIM, and Flights nationwide for 12–24 months.',
      giftMetaTerm: '12–24 Months',
      giftMetaBalance: 'Split Balance',
      giftMetaScope: 'Hotels · Flights · Tours',
      giftVisualNote: 'Delivered instantly by email with multi-service redemption code and weather credit protection.',
      giftDenomLabel: 'Denomination',
      giftThemeLabel: 'Card Artwork Theme',
      giftRecipientLabel: 'Recipient Name',
      giftMsgLabel: 'Personal Note',
      addGiftBtn: 'Add Giftcard',
      openGiftPortal: 'Configure more in Portal',
      giftTermsSummary: 'Transparent terms: validity, peak blackout dates & Ha Long storm refund credit',

      supportsGroundTag: 'ACT 07 · FIELD & EMERGENCY PROTOCOLS',
      supportsTitle1: 'Ground-truth figures, zero guesswork',
      metric34: 'Merged 2026 provincial-level units (28 provinces & 6 centrally governed cities).',
      metric40: 'Domestic flight check-in closing cutoff prior to departure (opens 2h early; boarding gate closes 15 min prior).',
      metric100: 'Pre-departure refund or free date move when Quang Ninh Port Authority bans sailing due to storms.',
      unitMin: ' min',
      supportsTitle2: 'National Hotlines 112–115 & Storm Policies',

      dossierTitle: 'Your Vietnam Trip Dossier',
      dossierDesc: 'Every flight, stay, tour, eSIM, and giftcard stays synced with the Booking Portal (explore.html) and Admin CMS (admin.html).',
      dossierItemsHeading: 'Selected Services',
      presetGolden: 'Load Golden Window Mar–Apr',
      presetNorth: 'Load Northwest & Ha Long',
      clearBtn: 'Clear All',
      totalVNDLabel: 'Estimated Total (VNĐ)',
      totalUSDLabel: 'Reference USD (1 USD = 25,000 VNĐ)',
      datesLabel: 'Target Dates',
      formName: 'Traveler Full Name',
      formEmail: 'Contact Email',
      formPhone: 'Phone / WhatsApp',
      formNote: 'Group notes (children, senior discounts, bedding)',
      exportJson: 'Download JSON',
      printBrief: 'Print Brief',
      gotoPortalFull: 'Continue in Booking Portal (explore.html) →',
      gotoAdminCMS: 'Inspect order in Admin CMS (admin.html) →',
      colophonNote: 'Vietnam Atlas 2025–2026 ecosystem (34 administrative units). Local simulation via localStorage & BroadcastChannel, no live payment gateway.',
      footerTop: 'Back to top',
      collapseBtn: 'Collapse',
      openDossierBtn: 'Open Trip Dossier'
    }
  };

  /* ---------- Exact Equirectangular Projection [8.4..23.6N, 102.0..112.6E] into 440x760 ---------- */
  var LAT_MAX = 23.6;
  var LAT_MIN = 8.4;
  var LNG_MIN = 102.0;
  var LNG_MAX = 112.6;

  function project(lat, lng) {
    var x = 34 + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * 372;
    var y = 26 + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * 708;
    return [Number(x.toFixed(1)), Number(y.toFixed(1))];
  }

  var LANDMASS_COORDS = [
    [22.6, 102.3], [22.8, 104.2], [23.3, 105.4], [22.9, 106.5],
    [21.9, 107.0], [21.5, 108.0], [20.95, 107.07], [20.7, 106.7],
    [20.0, 106.1], [18.7, 105.8], [18.0, 106.4], [17.4, 106.7],
    [16.5, 107.7], [16.1, 108.3], [15.1, 108.9], [13.8, 109.25],
    [13.0, 109.35], [12.24, 109.2], [11.55, 109.1], [10.9, 108.3],
    [10.35, 107.1], [9.6, 106.4], [8.6, 104.7], [9.8, 104.9],
    [10.38, 104.48], [11.0, 105.4], [11.5, 106.0], [12.6, 107.6],
    [14.5, 107.6], [16.5, 106.6], [17.9, 105.7], [19.3, 104.1],
    [21.2, 103.0]
  ];

  var LABEL_OFFSETS = {
    sapa: { anchor: 'start', dx: 10, dy: 4 },
    hoabinh: { anchor: 'end', dx: -10, dy: 4 },
    hanoi: { anchor: 'end', dx: -9, dy: -7 },
    halong: { anchor: 'start', dx: 10, dy: 4 },
    ninhbinh: { anchor: 'start', dx: 9, dy: 11 },
    hue: { anchor: 'start', dx: 9, dy: -5 },
    danang: { anchor: 'start', dx: 10, dy: 6 },
    dalat: { anchor: 'end', dx: -10, dy: -2 },
    nhatrang: { anchor: 'start', dx: 10, dy: 4 },
    hcmc: { anchor: 'start', dx: 9, dy: 8 },
    phuquoc: { anchor: 'end', dx: -10, dy: 5 }
  };

  var SIGNATURE_TOUR_IDS = [
    'tour-bana-buffet',
    'tour-hoian-coconut-cham',
    'tour-maichau-kimboi-2n1d',
    'tour-nhatrang-3islands-vip',
    'tour-phuquoc-4islands-honthom',
    'tour-halong-route2',
    'tour-hanoi-city-1d',
    'tour-sapa-from-hanoi',
    'tour-ninhbinh-trangan-ticket',
    'tour-hue-citadel',
    'tour-dalat-cloud-3n2d',
    'tour-cuchi-tunnels'
  ];

  var PEAK_TOUR_ID = 'tour-maichau-kimboi-2n1d';

  var state = {
    city: 'all',
    mode: 'stays', // stays | map | flights | tours
    staySub: 'all', // all | Hotels | Homes & Villas | Cruises
    railRegion: 'all', // all | danang | hoabinh | nhatrang | phuquoc | halong | other
    tripType: 'round-trip',
    departDate: '2026-03-18',
    returnDate: '2026-03-22',
    budgetTier: 'all',
    budgetMaxVND: 10000000,
    esimDays: 'all',
    esimRequireIntl: false,
    giftAmount: 2000000,
    giftTheme: 'island',
    giftRecipient: '',
    giftMessage: ''
  };

  var scInstance = null;

  function esc(str) {
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

  function getTravelMonth() {
    var d = state.departDate ? new Date(state.departDate + 'T00:00:00') : new Date('2026-03-18T00:00:00');
    return isNaN(d.getTime()) ? 3 : d.getMonth() + 1;
  }

  function getAirportCoords(airportObj) {
    if (airportObj && typeof airportObj.lat === 'number' && typeof airportObj.lng === 'number') {
      return [airportObj.lat, airportObj.lng];
    }
    if (airportObj && AIRPORT_COORDS[airportObj.code]) {
      return AIRPORT_COORDS[airportObj.code];
    }
    return null;
  }

  function buildPortalUrl(overrideMode) {
    var params = new URLSearchParams();
    var modeVal = overrideMode || state.mode;
    if (state.city && state.city !== 'all') params.set('city', state.city);
    if (modeVal) params.set('mode', modeVal);
    params.set('trip', state.tripType);
    if (state.departDate) params.set('dep', state.departDate);
    if (state.tripType === 'round-trip' && state.returnDate) params.set('ret', state.returnDate);
    if (state.budgetTier && state.budgetTier !== 'all') params.set('budget', state.budgetTier);
    var qs = params.toString();
    return 'explore.html' + (qs ? '?' + qs : '');
  }

  function renderWorkbenchMoreBanner(shown, total, modeKey, l) {
    var href = buildPortalUrl(modeKey);
    var msg = l === 'en'
      ? 'Showing ' + shown + ' of ' + total + ' curated options on Showcase.'
      : 'Đang hiển thị ' + shown + ' / ' + total + ' gợi ý tiêu biểu trên trang giới thiệu.';
    var cta = l === 'en' ? 'Browse All ' + total + ' in Portal →' : 'Mở toàn bộ ' + total + ' trên Cổng đặt chỗ →';
    return '<div class="va-workbench-more">' +
      '<span>' + esc(msg) + '</span>' +
      '<a class="va-btn va-btn--ghost va-btn--xs" href="' + esc(href) + '">' + esc(cta) + '</a>' +
    '</div>';
  }

  function getFlightRoutes(allData) {
    if (!allData) return [];
    if (Array.isArray(allData.flights)) return allData.flights;
    if (allData.flights && Array.isArray(allData.flights.routes)) return allData.flights.routes;
    return [];
  }

  function syncDraftToStore() {
    Store.saveDraftDossier({
      cityId: state.city === 'all' ? '' : state.city,
      travelMonth: getTravelMonth(),
      tripType: state.tripType,
      departureDate: state.departDate,
      returnDate: state.returnDate,
      budgetTier: state.budgetTier
    });
  }

  function applyBudgetTierMax(tier) {
    if (tier === 'budget') state.budgetMaxVND = 800000;
    else if (tier === 'mid') state.budgetMaxVND = 2500000;
    else state.budgetMaxVND = 10000000;
  }

  function hydrateStateFromStoreAndUrl() {
    var draft = Store.getDraftDossier();
    if (draft) {
      state.city = draft.cityId || draft.selectedCity || 'all';
      state.tripType = draft.tripType === 'one-way' ? 'one-way' : 'round-trip';
      state.departDate = draft.departureDate || draft.departDate || '2026-03-18';
      state.returnDate = draft.returnDate || '2026-03-22';
      state.budgetTier = draft.budgetTier || 'all';
    }
    var params = new URLSearchParams(window.location.search);
    if (params.get('city')) state.city = params.get('city');
    if (params.get('mode')) state.mode = params.get('mode');
    if (params.get('trip') === 'one-way') state.tripType = 'one-way';
    if (params.get('dep')) state.departDate = params.get('dep');
    if (params.get('ret')) state.returnDate = params.get('ret');
    if (params.get('budget')) state.budgetTier = params.get('budget');
    applyBudgetTierMax(state.budgetTier);
  }

  /* ---------- Kinetic-Safe Bilingual Translation ---------- */
  function applyLanguage(remountScrollCraft) {
    var l = lang();
    var dict = I18N[l] || I18N.vi;
    document.documentElement.lang = l === 'en' ? 'en' : 'vi';

    if (remountScrollCraft && scInstance && typeof scInstance.destroy === 'function') {
      scInstance.destroy();
      scInstance = null;
    }

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key]) {
        if (el.hasAttribute('data-sc-kinetic')) {
          el.__scSplit = null;
          el.classList.remove('sc-is-split');
        }
        el.textContent = dict[key];
      }
    });

    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      var active = btn.getAttribute('data-lang') === l;
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });
    document.querySelectorAll('[data-currency]').forEach(function (btn) {
      var active = btn.getAttribute('data-currency') === Store.getCurrency();
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      btn.classList.toggle('is-active', active);
    });

    if (remountScrollCraft && window.ScrollCraft) {
      scInstance = window.ScrollCraft.mount(document.body);
    }
    requestAnimationFrame(syncSegmentedThumbs);
  }

  /* ---------- Controls Sync ---------- */
  function populateCitySelects() {
    var dests = Store.getAll().destinations || [];
    var l = lang();
    var heroSel = document.getElementById('hero-city-select');
    var wbSel = document.getElementById('wb-city-select');

    [heroSel, wbSel].forEach(function (sel, idx) {
      if (!sel) return;
      var html = '<option value="all">' + esc(l === 'en' ? 'All Vietnam (11 hubs)' : 'Tất cả 11 vùng Việt Nam') + '</option>';
      dests.forEach(function (d) {
        var name = Store.pickText(d, 'displayName', 'displayNameEn');
        var label = idx === 1 && d.adminUnit2026 ? name + ' (' + d.adminUnit2026 + ')' : name;
        html += '<option value="' + esc(d.id) + '">' + esc(label) + '</option>';
      });
      sel.innerHTML = html;
      sel.value = state.city;
    });
  }

  function syncSegmentedThumbs() {
    document.querySelectorAll('.va-segmented').forEach(function (seg) {
      var thumb = seg.querySelector('.va-segmented__thumb');
      if (!thumb) {
        thumb = document.createElement('span');
        thumb.className = 'va-segmented__thumb';
        thumb.setAttribute('aria-hidden', 'true');
        seg.insertBefore(thumb, seg.firstChild);
      }
      var activeBtn = seg.querySelector('.va-segmented__btn.is-active, .va-segmented__btn[aria-pressed="true"]');
      if (activeBtn && activeBtn.offsetWidth > 0) {
        thumb.style.width = activeBtn.offsetWidth + 'px';
        thumb.style.transform = 'translateX(' + activeBtn.offsetLeft + 'px)';
        seg.classList.add('has-thumb');
      } else {
        seg.classList.remove('has-thumb');
      }
    });
  }

  function syncControlsUI() {
    var isOneWay = state.tripType === 'one-way';

    document.querySelectorAll('[data-trip-type]').forEach(function (btn) {
      var act = btn.getAttribute('data-trip-type') === state.tripType;
      btn.setAttribute('aria-pressed', act ? 'true' : 'false');
      btn.classList.toggle('is-active', act);
    });

    var heroFields = document.querySelector('.hero-launcher__fields');
    var wbRow = document.querySelector('#workbench-filters .va-filter-row');
    if (heroFields) heroFields.classList.toggle('is-one-way', isOneWay);
    if (wbRow) wbRow.classList.toggle('is-one-way', isOneWay);

    var heroRetWrap = document.getElementById('hero-return-wrap');
    var wbRetWrap = document.getElementById('wb-return-wrap');
    if (heroRetWrap) {
      heroRetWrap.classList.toggle('is-collapsed', isOneWay);
      heroRetWrap.setAttribute('aria-hidden', isOneWay ? 'true' : 'false');
    }
    if (wbRetWrap) {
      wbRetWrap.classList.toggle('is-collapsed', isOneWay);
      wbRetWrap.setAttribute('aria-hidden', isOneWay ? 'true' : 'false');
    }

    var heroRet = document.getElementById('hero-return-date');
    var wbRet = document.getElementById('wb-return-date');
    if (heroRet) {
      heroRet.disabled = isOneWay;
      heroRet.tabIndex = isOneWay ? -1 : 0;
      heroRet.value = state.returnDate;
    }
    if (wbRet) {
      wbRet.disabled = isOneWay;
      wbRet.tabIndex = isOneWay ? -1 : 0;
      wbRet.value = state.returnDate;
    }

    requestAnimationFrame(syncSegmentedThumbs);

    var heroDep = document.getElementById('hero-depart-date');
    var wbDep = document.getElementById('wb-depart-date');
    if (heroDep) heroDep.value = state.departDate;
    if (wbDep) wbDep.value = state.departDate;

    var heroCity = document.getElementById('hero-city-select');
    var wbCity = document.getElementById('wb-city-select');
    if (heroCity) heroCity.value = state.city;
    if (wbCity) wbCity.value = state.city;

    var heroBudget = document.getElementById('hero-budget-select');
    if (heroBudget) heroBudget.value = state.budgetTier;

    document.querySelectorAll('[data-budget]').forEach(function (btn) {
      var act = btn.getAttribute('data-budget') === state.budgetTier;
      btn.setAttribute('aria-pressed', act ? 'true' : 'false');
      btn.classList.toggle('is-active', act);
    });

    var slider = document.getElementById('wb-budget-slider');
    var readout = document.getElementById('wb-budget-readout');
    if (slider) slider.value = String(state.budgetMaxVND);
    if (readout) {
      if (state.budgetMaxVND >= 10000000) {
        readout.textContent = lang() === 'en' ? 'All tiers' : 'Tất cả mức giá';
      } else {
        readout.textContent = '<= ' + Store.formatPrice(state.budgetMaxVND);
      }
    }

    document.querySelectorAll('.va-mode-tab[data-mode]').forEach(function (tab) {
      var act = tab.getAttribute('data-mode') === state.mode;
      tab.setAttribute('aria-selected', act ? 'true' : 'false');
      tab.classList.toggle('is-active', act);
    });

    var subtabsWrap = document.getElementById('stays-subtabs');
    if (subtabsWrap) subtabsWrap.hidden = state.mode !== 'stays';
    document.querySelectorAll('[data-stay-sub]').forEach(function (st) {
      var act = st.getAttribute('data-stay-sub') === state.staySub;
      st.setAttribute('aria-pressed', act ? 'true' : 'false');
      st.classList.toggle('is-active', act);
    });

    var portalUrl = buildPortalUrl();
    ['nav-portal-link', 'mobile-portal-link', 'hero-open-portal', 'wb-portal-handoff', 'rail-portal-btn', 'dossier-portal-link'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.href = portalUrl;
    });

    updateSeasonFeedback();
  }

  function updateSeasonFeedback() {
    var dests = Store.getAll().destinations || [];
    var l = lang();
    var m = getTravelMonth();
    var activeDest = dests.find(function (d) { return d.id === state.city; }) || dests[0];
    if (!activeDest) return;

    var status = state.city === 'all'
      ? (m === 3 || m === 4
          ? { code: 'golden', label: l === 'en' ? 'T3–T4 Golden Window nationwide' : 'T3–T4: Khung vàng khô ráo toàn quốc', note: '' }
          : Store.getSeasonStatus(activeDest, m, l))
      : Store.getSeasonStatus(activeDest, m, l);

    var heroPill = document.getElementById('hero-season-pill');
    if (heroPill) {
      heroPill.className = 'hero-launcher__tip is-' + status.code;
      var hasMonthPrefix = l !== 'en' && /^T\d/.test(status.label);
      heroPill.textContent = hasMonthPrefix ? status.label : ((l === 'en' ? 'Month ' : 'T') + m + ' · ' + status.label);
    }

    var banner = document.getElementById('climate-banner');
    if (banner) {
      banner.className = 'va-climate-banner is-' + status.code;
      var prefix = state.city === 'all'
        ? (l === 'en' ? 'Climate check Month ' + m + ':' : 'Thời tiết tháng ' + m + ':')
        : Store.pickText(activeDest, 'shortName', 'shortNameEn') + ' (' + (l === 'en' ? 'Month ' : 'Tháng ') + m + '):';
      var detail = status.note || (l === 'en'
        ? 'Da Nang/Hue rainy T10–T11; Ha Long storms T6–T9; Phu Quoc west swell T7–T9.'
        : 'Đà Nẵng–Huế mưa bão T10–T11 · Hạ Long bão T6–T9 · Phú Quốc biển động T7–T9.');
      banner.innerHTML = '<strong>' + esc(prefix) + '</strong> ' + esc(status.label) + ' · ' + esc(detail);
    }
  }

  /* ---------- Interactive SVG Vietnam S-Curve Map (viewBox 440x760) ---------- */
  function renderSvgMap() {
    var allData = Store.getAll();
    var dests = allData.destinations || [];
    var airports = allData.airports || [];
    var routes = getFlightRoutes(allData);
    var l = lang();
    var month = getTravelMonth();

    var gratGroup = document.getElementById('map-graticule');
    if (gratGroup && !gratGroup.hasChildNodes()) {
      var gHtml = '';
      [10, 14, 18, 22].forEach(function (lat) {
        var p1 = project(lat, 102.2);
        var p2 = project(lat, 112.2);
        gHtml += '<line class="va-map-gridline" x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" />';
      });
      [104, 106, 108, 110].forEach(function (lng) {
        var p1 = project(23.4, lng);
        var p2 = project(8.6, lng);
        gHtml += '<line class="va-map-gridline" x1="' + p1[0] + '" y1="' + p1[1] + '" x2="' + p2[0] + '" y2="' + p2[1] + '" />';
      });
      gratGroup.innerHTML = gHtml;
    }

    var landGroup = document.getElementById('map-landmass');
    if (landGroup && !landGroup.hasChildNodes()) {
      var pts = LANDMASS_COORDS.map(function (c) {
        return project(c[0], c[1]).join(',');
      }).join(' ');
      var pq = project(10.22, 103.96);
      var cb = project(20.73, 107.04);
      var cd = project(8.68, 106.60);
      landGroup.innerHTML =
        '<polygon class="va-map-land" points="' + pts + '" />' +
        '<ellipse class="va-map-land" cx="' + pq[0] + '" cy="' + pq[1] + '" rx="7" ry="12" transform="rotate(-14 ' + pq[0] + ' ' + pq[1] + ')" />' +
        '<circle class="va-map-land" cx="' + cb[0] + '" cy="' + cb[1] + '" r="4.5" />' +
        '<circle class="va-map-land" cx="' + cd[0] + '" cy="' + cd[1] + '" r="3.5" />';
    }

    var archGroup = document.getElementById('map-archipelagos');
    if (archGroup && !archGroup.hasChildNodes()) {
      var hs = project(16.5, 111.3);
      var ts = project(10.6, 111.7);
      archGroup.innerHTML =
        '<g>' +
          '<circle cx="' + hs[0] + '" cy="' + hs[1] + '" r="2.2" fill="#096B5C" opacity="0.65" />' +
          '<circle cx="' + (hs[0] + 7) + '" cy="' + (hs[1] + 5) + '" r="1.6" fill="#096B5C" opacity="0.65" />' +
          '<text x="' + hs[0] + '" y="' + (hs[1] - 7) + '" text-anchor="middle" font-size="8.5" fill="#435A56">' + (l === 'en' ? 'Hoang Sa' : 'Quần đảo Hoàng Sa') + '</text>' +
          '<circle cx="' + ts[0] + '" cy="' + ts[1] + '" r="2.2" fill="#096B5C" opacity="0.65" />' +
          '<circle cx="' + (ts[0] + 6) + '" cy="' + (ts[1] + 7) + '" r="1.6" fill="#096B5C" opacity="0.65" />' +
          '<text x="' + ts[0] + '" y="' + (ts[1] - 7) + '" text-anchor="middle" font-size="8.5" fill="#435A56">' + (l === 'en' ? 'Truong Sa' : 'Quần đảo Trường Sa') + '</text>' +
        '</g>';
    }

    var airportByCode = {};
    airports.forEach(function (a) {
      var coords = getAirportCoords(a);
      if (coords) airportByCode[a.code] = { code: a.code, lat: coords[0], lng: coords[1] };
    });

    var activeDestObj = dests.find(function (d) { return d.id === state.city; });
    var activeAirport = activeDestObj ? activeDestObj.gatewayAirport : null;

    var arcsGroup = document.getElementById('map-flight-arcs');
    if (arcsGroup) {
      arcsGroup.innerHTML = routes.map(function (r) {
        var fromA = airportByCode[r.from];
        var toA = airportByCode[r.to];
        if (!fromA || !toA) return '';
        var p1 = project(fromA.lat, fromA.lng);
        var p2 = project(toA.lat, toA.lng);
        var cx = Math.max(p1[0], p2[0]) + 46;
        var cy = (p1[1] + p2[1]) / 2;
        var isHit = activeAirport && (r.from === activeAirport || r.to === activeAirport);
        return '<path class="va-map-arc' + (isHit ? ' is-active' : '') + '" d="M ' + p1[0] + ' ' + p1[1] + ' Q ' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ' ' + p2[0] + ' ' + p2[1] + '" />';
      }).join('');
    }

    var apGroup = document.getElementById('map-airports');
    if (apGroup) {
      apGroup.innerHTML = airports.map(function (a) {
        var c = getAirportCoords(a);
        if (!c) return '';
        var p = project(c[0], c[1]);
        return '<g transform="translate(' + p[0] + ' ' + p[1] + ')">' +
          '<rect class="va-map-airport-dot" x="-3.5" y="-3.5" width="7" height="7" rx="1.5" />' +
          '<text class="va-map-airport-code" x="7" y="2.5">' + esc(a.code) + '</text>' +
        '</g>';
      }).join('');
    }

    var pinsGroup = document.getElementById('map-city-pins');
    if (pinsGroup) {
      pinsGroup.innerHTML = dests.map(function (d) {
        if (typeof d.lat !== 'number' || typeof d.lng !== 'number') return '';
        var p = project(d.lat, d.lng);
        var off = LABEL_OFFSETS[d.id] || { anchor: 'start', dx: 10, dy: 4 };
        var isAct = state.city === d.id;
        var shortLabel = Store.pickText(d, 'shortName', 'shortNameEn');
        return '<g class="va-map-pin' + (isAct ? ' is-active' : '') + '" tabindex="0" role="button" aria-pressed="' + isAct + '" data-map-city="' + esc(d.id) + '" aria-label="' + esc(shortLabel) + '">' +
          '<circle class="va-map-pin__halo" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (isAct ? 15 : 10) + '" />' +
          '<circle class="va-map-pin__dot" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (isAct ? 6 : 4.5) + '" />' +
          '<text class="va-map-label' + (isAct ? ' is-active' : '') + '" x="' + (p[0] + off.dx) + '" y="' + (p[1] + off.dy) + '" text-anchor="' + off.anchor + '">' + esc(shortLabel) + '</text>' +
        '</g>';
      }).join('');

      pinsGroup.querySelectorAll('[data-map-city]').forEach(function (pin) {
        pin.addEventListener('click', function () {
          selectCity(pin.getAttribute('data-map-city'));
        });
        pin.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            selectCity(pin.getAttribute('data-map-city'));
          }
        });
      });
    }

    var titleEl = document.getElementById('map-hub-title');
    var detailEl = document.getElementById('map-hub-detail');
    var inspectDest = activeDestObj || dests[0];
    if (titleEl) {
      titleEl.textContent = state.city === 'all'
        ? (l === 'en' ? 'All 11 Vietnam Hubs' : 'Toàn tuyến 11 điểm đến')
        : Store.pickText(inspectDest, 'displayName', 'displayNameEn');
    }

    if (detailEl && inspectDest) {
      var st = Store.getSeasonStatus(inspectDest, month, l);
      var zones = (inspectDest.zones || []).map(function (z) {
        return '<span class="va-zone-chip">' + esc(z) + '</span>';
      }).join('');

      var strip = '';
      for (var m = 1; m <= 12; m++) {
        var ms = Store.getSeasonStatus(inspectDest, m, l);
        strip += '<div class="va-climate-cell is-' + ms.code + (m === month ? ' is-selected' : '') + '" title="T' + m + ': ' + esc(ms.label) + '">T' + m + '</div>';
      }

      detailEl.innerHTML =
        '<div><strong>' + esc(Store.pickText(inspectDest, 'displayName', 'displayNameEn')) + '</strong> · ' +
          '<span style="color:var(--va-accent-deep);font-weight:600">' + esc(inspectDest.adminUnit2026) + '</span>' +
        '</div>' +
        '<div style="margin-top:4px;color:var(--va-ink-soft)">' +
          esc(l === 'en' ? 'Gateway Airport: ' : 'Sân bay cửa ngõ: ') +
          '<strong style="font-family:var(--sc-font-mono)">' + esc(inspectDest.gatewayAirport || 'HAN') + '</strong> · ' +
          esc(inspectDest.transferNote || '') +
        '</div>' +
        '<p style="margin:6px 0 0;color:var(--va-ink-soft);font-size:0.81rem">' + esc(st.note || inspectDest.bestSeasonText) + '</p>' +
        '<div class="va-zone-chips">' + zones + '</div>' +
        '<div class="va-climate-strip">' + strip + '</div>';
    }
  }

  /* ---------- Act 2 Workbench Results ---------- */
  function filterByBudget(priceVND) {
    if (state.budgetTier === 'budget' && priceVND >= 800000) return false;
    if (state.budgetTier === 'mid' && (priceVND < 800000 || priceVND > 2500000)) return false;
    if (state.budgetTier === 'luxury' && priceVND < 2500000) return false;
    if (state.budgetMaxVND < 10000000 && priceVND > state.budgetMaxVND) return false;
    return true;
  }

  function renderWorkbenchResults() {
    var container = document.getElementById('workbench-results');
    if (!container) return;

    var allData = Store.getAll();
    var destById = {};
    (allData.destinations || []).forEach(function (d) { destById[d.id] = d; });
    var l = lang();

    if (state.mode === 'flights') {
      container.classList.add('is-single-col');
      renderFlightsResults(container, allData, destById, l);
      return;
    }

    container.classList.remove('is-single-col');

    if (state.mode === 'tours') {
      renderToursResults(container, allData, destById, l);
      return;
    }

    renderStaysResults(container, allData, destById, l);
  }

  function renderStaysResults(container, allData, destById, l) {
    var stays = (allData.stays || []).filter(function (s) {
      if (state.city !== 'all' && s.destinationId !== state.city) return false;
      if (state.staySub !== 'all' && s.accommodationType !== state.staySub) return false;
      var price = s.priceRangeVND ? s.priceRangeVND[0] : (s.pricePerNightVND || 1000000);
      return filterByBudget(price);
    });

    if (!stays.length) {
      container.innerHTML = '<div class="va-dossier-empty">' +
        esc(l === 'en' ? 'No stays match these filters. Try resetting to All Tiers or All 11 Hubs.' : 'Không có lưu trú khớp bộ lọc hiện tại. Hãy chọn Tất cả phân khúc hoặc 11 vùng.') +
      '</div>';
      return;
    }

    var previewStays = stays.slice(0, 2);
    container.innerHTML = previewStays.map(function (s) {
      var dest = destById[s.destinationId] || {};
      var fallbackImg = dest.photo || 'assets/gen/hoabinh-dawn.webp';
      var imgSrc = s.photo || fallbackImg;
      var priceRangeStr = s.priceRangeVND
        ? Store.formatPriceRange(s.priceRangeVND[0], s.priceRangeVND[1], Boolean(s.openEnded))
        : Store.formatPrice(s.pricePerNightVND || 1000000);
      var destName = Store.pickText(dest, 'shortName', 'shortNameEn');
      var highlight = (s.amenities && s.amenities.length) ? s.amenities.slice(0, 3).join(' · ') : '';

      return '<article class="va-card">' +
        '<div class="va-card__media">' +
          '<img src="' + esc(imgSrc) + '" alt="' + esc(s.name) + '" loading="lazy" />' +
        '</div>' +
        '<div class="va-card__body">' +
          '<div class="va-card__meta-row">' +
            '<span class="va-card__meta">' + esc(destName) + (s.zone ? ' · ' + esc(s.zone) : '') + '</span>' +
            '<span class="va-card__tag">' + esc(s.accommodationType || 'Hotels') + '</span>' +
          '</div>' +
          '<h3 class="va-card__title">' + esc(s.name) + '</h3>' +
          '<p class="va-card__desc">' + esc(highlight) + '</p>' +
          '<div class="va-card__foot">' +
            '<div class="va-price-block">' +
              '<span class="va-price-main">' + esc(priceRangeStr) + '</span>' +
              '<span class="va-price-sub">' + esc(s.unitLabel || (l === 'en' ? '/ night' : '/ đêm')) + '</span>' +
            '</div>' +
            '<button type="button" class="va-btn va-btn--primary va-btn--xs" data-add-item="stay" data-item-id="' + esc(s.id) + '">' +
              esc(l === 'en' ? '+ Add Stay' : '+ Thêm vào hành trình') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('') + renderWorkbenchMoreBanner(previewStays.length, stays.length, 'stays', l);
  }

  function renderToursResults(container, allData, destById, l) {
    var tours = (allData.tours || []).filter(function (t) {
      if (state.city !== 'all' && t.destinationId !== state.city) return false;
      var p = t.priceRangeVND ? t.priceRangeVND[0] : (t.priceVND || 600000);
      return filterByBudget(p);
    });

    if (!tours.length) {
      container.innerHTML = '<div class="va-dossier-empty">' +
        esc(l === 'en' ? 'No tours match these filters.' : 'Không có tour phù hợp mức giá/vùng đang chọn.') +
      '</div>';
      return;
    }

    var previewTours = tours.slice(0, 2);
    container.innerHTML = previewTours.map(function (t) {
      var dest = destById[t.destinationId] || {};
      var imgSrc = t.photo || dest.photo || 'assets/gen/hoabinh-dawn.webp';
      var priceStr = t.priceRangeVND
        ? Store.formatPriceRange(t.priceRangeVND[0], t.priceRangeVND[1], false)
        : Store.formatPrice(t.priceVND || 600000);
      var destName = Store.pickText(dest, 'shortName', 'shortNameEn');

      return '<article class="va-card">' +
        '<div class="va-card__media">' +
          '<img src="' + esc(imgSrc) + '" alt="' + esc(t.title) + '" loading="lazy" />' +
        '</div>' +
        '<div class="va-card__body">' +
          '<div class="va-card__meta-row">' +
            '<span class="va-card__meta">' + esc(destName) + ' · ' + esc(t.departureFrom || '') + '</span>' +
            '<span class="va-card__tag">' + esc(t.durationLabel || '1 Ngày') + '</span>' +
          '</div>' +
          '<h3 class="va-card__title">' + esc(t.title) + '</h3>' +
          '<p class="va-card__desc">' + esc(t.weatherNote || t.pricingBreakdown || '') + '</p>' +
          '<div class="va-card__foot">' +
            '<div class="va-price-block">' +
              '<span class="va-price-main">' + esc(priceStr) + '</span>' +
              '<span class="va-price-sub">' + esc(l === 'en' ? 'per guest' : '/ khách') + '</span>' +
            '</div>' +
            '<button type="button" class="va-btn va-btn--primary va-btn--xs" data-add-item="tour" data-item-id="' + esc(t.id) + '">' +
              esc(l === 'en' ? '+ Add Tour' : '+ Thêm tour') +
            '</button>' +
          '</div>' +
        '</div>' +
      '</article>';
    }).join('') + renderWorkbenchMoreBanner(previewTours.length, tours.length, 'tours', l);
  }

  function renderFlightsResults(container, allData, destById, l) {
    var routes = getFlightRoutes(allData);
    var flightMeta = allData.flightMeta || (!Array.isArray(allData.flights) ? allData.flights : {}) || {};
    var airlines = flightMeta.airlines || [];
    var activeDest = destById[state.city];
    var targetAirport = activeDest ? activeDest.gatewayAirport : null;
    var filtered = routes.filter(function (r) {
      if (!targetAirport) return true;
      return r.from === targetAirport || r.to === targetAirport;
    });
    if (!filtered.length) filtered = routes;

    var isRoundTrip = state.tripType === 'round-trip';
    var ruleSummary = '<div class="va-esim-row" style="background:var(--va-accent-soft);border-color:rgba(11,122,105,0.24)">' +
      '<div><strong>' + esc(l === 'en' ? 'Domestic Rules & Check-in:' : 'Quy tắc bay nội địa:') + '</strong> ' +
        esc(flightMeta.securityRule || 'Đóng quầy 40 phút trước giờ bay; pin sạc dự phòng mang xách tay.') +
      '</div>' +
    '</div>';

    var previewRoutes = filtered.slice(0, 2);
    var cards = previewRoutes.map(function (r) {
      var rangeArr = isRoundTrip ? r.roundTripRangeVND : r.lccOneWayVND;
      var priceStr = rangeArr ? Store.formatPriceRange(rangeArr[0], rangeArr[1], false) : Store.formatPrice(1500000);
      var baseAdd = rangeArr ? rangeArr[0] : 1500000;
      var airlineHtml = (r.airlines || []).map(function (alName) {
        var alObj = airlines.find(function (a) { return alName.indexOf(a.name) >= 0 || a.name.indexOf(alName) >= 0; });
        var bagTip = alObj ? (' (' + alObj.carryOn.split('(')[0].trim() + ')') : '';
        return '<span class="va-airline-pill">' + esc(alName + bagTip) + '</span>';
      }).join('');

      return '<article class="va-flight-card">' +
        '<div>' +
          '<div class="va-flight-route">' +
            '<span class="va-flight-airports"><span>' + esc(r.from) + '</span> → <span>' + esc(r.to) + '</span></span>' +
          '</div>' +
          '<div style="font-size:0.78rem;color:var(--va-ink-soft);margin-top:4px">' +
            esc(r.fromCity + ' → ' + r.toCity + ' · ' + r.durationText) +
          '</div>' +
        '</div>' +
        '<div>' +
          '<div style="font-weight:600;font-size:0.86rem">' + esc(r.routeNote || '') + '</div>' +
          '<div class="va-flight-tags">' + airlineHtml + '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">' +
          '<div class="va-price-block">' +
            '<span class="va-price-main">' + esc(priceStr) + '</span>' +
            '<span class="va-price-sub">' + esc(isRoundTrip ? (l === 'en' ? 'Round-Trip ref' : 'Khứ hồi tham khảo') : (l === 'en' ? 'One-way ref' : 'Một chiều tham khảo')) + '</span>' +
          '</div>' +
          '<button type="button" class="va-btn va-btn--primary va-btn--xs" data-add-item="flight" data-item-id="' + esc(r.id) + '">' +
            esc(l === 'en' ? '+ Add Flight' : '+ Thêm vé bay') +
          '</button>' +
        '</div>' +
      '</article>';
    }).join('');

    container.innerHTML = ruleSummary + cards + renderWorkbenchMoreBanner(previewRoutes.length, filtered.length, 'flights', l);
  }

  /* ---------- Act 4 & Act 5: Peak Bookable Button & Featured Tours Showcase Rail ---------- */
  function getDossierQtyById() {
    var draft = Store.getDraftDossier();
    var map = {};
    (draft.items || []).forEach(function (it) {
      map[it.id] = (map[it.id] || 0) + (Number(it.qty) || 1);
    });
    return map;
  }

  function syncPeakTourButton() {
    var btn = document.getElementById('peak-add-tour-btn');
    if (!btn) return;
    var l = lang();
    var dict = I18N[l] || I18N.vi;
    var qtyMap = getDossierQtyById();
    var added = (qtyMap[PEAK_TOUR_ID] || 0) > 0;
    btn.classList.toggle('is-added', added);
    btn.classList.toggle('va-btn--added', added);
    btn.classList.toggle('va-btn--primary', !added);
    btn.setAttribute('aria-pressed', added ? 'true' : 'false');
    btn.textContent = added ? dict.peakAddedTour : dict.peakAddTour;
  }

  function renderRegionalRail() {
    var rail = document.getElementById('regional-rail');
    if (!rail) return;

    var allData = Store.getAll();
    var dests = allData.destinations || [];
    var allTours = allData.tours || [];
    var destById = {};
    dests.forEach(function (d) { destById[d.id] = d; });

    var l = lang();
    var m = getTravelMonth();
    var cur = Store.getCurrency();
    var qtyMap = getDossierQtyById();

    var regionLabels = {
      danang: l === 'en' ? 'Da Nang' : 'Đà Nẵng',
      hoabinh: l === 'en' ? 'Hoa Binh' : 'Hòa Bình',
      nhatrang: 'Nha Trang',
      phuquoc: l === 'en' ? 'Phu Quoc' : 'Phú Quốc',
      halong: l === 'en' ? 'Ha Long' : 'Hạ Long'
    };

    document.querySelectorAll('[data-rail-region]').forEach(function (btn) {
      var key = btn.getAttribute('data-rail-region');
      var active = state.railRegion === key;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
      if (regionLabels[key]) btn.textContent = regionLabels[key];
    });

    var leadSlot = rail.querySelector('.va-rail__slot--lead');
    Array.from(rail.children).forEach(function (child) {
      if (child !== leadSlot) rail.removeChild(child);
    });

    var primaryIds = { danang: true, hoabinh: true, nhatrang: true, phuquoc: true, halong: true };
    var tourById = {};
    allTours.forEach(function (t) { tourById[t.id] = t; });

    var visibleTours;
    if (state.railRegion === 'all') {
      visibleTours = SIGNATURE_TOUR_IDS
        .map(function (id) { return tourById[id]; })
        .filter(Boolean);
      if (visibleTours.length < 11) {
        visibleTours = allTours.slice(0, 12);
      }
    } else if (state.railRegion === 'other') {
      visibleTours = allTours.filter(function (t) { return !primaryIds[t.destinationId]; });
    } else {
      visibleTours = allTours.filter(function (t) { return t.destinationId === state.railRegion; });
    }

    visibleTours.forEach(function (t, idx) {
      var slot = document.createElement('div');
      slot.className = 'va-rail__slot';
      slot.style.setProperty('--slot-i', String(idx));

      var dest = destById[t.destinationId] || {};
      var imgSrc = t.photo || dest.photo || 'assets/gen/hoabinh-dawn.webp';
      var destName = Store.pickText(dest, 'shortName', 'shortNameEn');
      var st = Store.getSeasonStatus(dest, m, l);
      var isWindWatch = st.code === 'caution' || (Boolean(t.weatherSensitive) && st.code !== 'golden');
      var seasonLabel = isWindWatch
        ? (l === 'en' ? 'Watch Sea Winds' : 'Theo dõi gió biển')
        : (l === 'en' ? 'Sunny Season' : 'Mùa nắng đẹp');

      var baseVND = t.priceVND || (t.priceRangeVND ? t.priceRangeVND[0] : 600000);
      var primaryPrice = cur === 'USD' ? Store.formatPrice(baseVND, 'USD') : Store.formatPrice(baseVND, 'VND');
      var secondaryPrice = cur === 'USD' ? Store.formatPrice(baseVND, 'VND') : Store.formatPrice(baseVND, 'USD');
      var pickupText = t.departureFrom
        ? (l === 'en' ? 'Pickup: ' + t.departureFrom : 'Đón: ' + t.departureFrom)
        : (dest.gatewayAirport || '');
      var noteText = t.weatherNote ? (pickupText ? pickupText + ' · ' + t.weatherNote : t.weatherNote) : pickupText;

      var qty = qtyMap[t.id] || 0;
      var btnLabel = qty > 0
        ? (qty > 1 ? (l === 'en' ? '✓ Added (' + qty + ')' : '✓ Đã thêm (' + qty + ')') : (l === 'en' ? '✓ Added' : '✓ Đã thêm'))
        : (l === 'en' ? '+ Add Tour' : '+ Thêm Tour');
      var detailHref = 'explore.html?mode=tours&city=' + encodeURIComponent(t.destinationId || '');

      slot.innerHTML =
        '<article class="va-rail-card">' +
          '<div class="va-rail-card__media">' +
            '<img src="' + esc(imgSrc) + '" alt="' + esc(t.title) + '" />' +
          '</div>' +
          '<div class="va-rail-card__body">' +
            '<div class="va-rail-card__meta-row">' +
              '<span class="va-rail-card__meta">' + esc(destName + ' · ' + (t.durationLabel || '1 Ngày')) + '</span>' +
              '<span class="va-season-pill ' + (isWindWatch ? 'is-caution' : 'is-good') + '">' + esc(seasonLabel) + '</span>' +
            '</div>' +
            '<h3 class="va-rail-card__title">' + esc(t.title) + '</h3>' +
            '<p class="va-rail-card__note">' + esc(noteText) + '</p>' +
            '<div class="va-rail-card__foot">' +
              '<div class="va-price-block sc-nums">' +
                '<span class="va-price-main">' + esc(primaryPrice) + '</span>' +
                '<span class="va-price-sub">' + esc(secondaryPrice + (l === 'en' ? ' / guest' : ' / khách')) + '</span>' +
              '</div>' +
              '<div class="va-rail-card__actions">' +
                '<button type="button" class="va-btn va-btn--xs ' + (qty > 0 ? 'va-btn--added' : 'va-btn--primary') + '" data-add-item="tour" data-item-id="' + esc(t.id) + '" aria-pressed="' + (qty > 0 ? 'true' : 'false') + '">' +
                  esc(btnLabel) +
                '</button>' +
                '<a class="va-inline-portal-link" href="' + esc(detailHref) + '">' +
                  esc(l === 'en' ? 'Details →' : 'Chi tiết →') +
                '</a>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</article>';

      rail.appendChild(slot);
    });

    if (rail.scrollWidth <= window.innerWidth) {
      rail.style.transform = '';
    }
    if (scInstance && typeof scInstance.read === 'function') {
      scInstance.read();
    }
  }

  /* ---------- Act 6: eSIM Advisor & Giftcard Configurator ---------- */
  function renderEsimStudio() {
    var esims = Store.getAll().esims || [];
    var l = lang();

    document.querySelectorAll('[data-esim-days]').forEach(function (b) {
      var val = b.getAttribute('data-esim-days');
      var act = String(state.esimDays) === val;
      b.setAttribute('aria-pressed', act ? 'true' : 'false');
      b.classList.toggle('is-active', act);
    });
    requestAnimationFrame(syncSegmentedThumbs);

    var highMountainCities = ['hoabinh', 'sapa', 'ninhbinh', 'dalat', 'halong'];
    var needsMountainCarrier = highMountainCities.indexOf(state.city) >= 0;

    var advisorNote = document.getElementById('esim-advisor-note');
    if (advisorNote) {
      if (state.esimRequireIntl) {
        advisorNote.textContent = l === 'en'
          ? 'Advisor: International traveler needing +84 number or eKYC-free setup -> recommending Gigago or Airalo.'
          : 'Tư vấn: Khách quốc tế cần số +84 / nhận OTP không cần xếp hàng eKYC -> ưu tiên Gigago.';
      } else if (needsMountainCarrier) {
        advisorNote.textContent = l === 'en'
          ? 'Advisor: Highland/karst terrain selected -> recommending Viettel 5G for strongest rural signal.'
          : 'Tư vấn tuyến núi/đảo (Hòa Bình, Sa Pa, Hạ Long): Viettel có độ phủ 5G/4G mạnh nhất.';
      } else {
        advisorNote.textContent = l === 'en'
          ? 'Advisor: Direct Viettel, VinaPhone/MobiFone, Gigago, and Airalo plans ready to compare.'
          : 'So sánh trực tiếp Viettel, VinaPhone/MobiFone, Gigago và Airalo theo số ngày lưu trú.';
      }
    }

    var filtered = esims.filter(function (p) {
      if (state.esimRequireIntl && p.provider.indexOf('Gigago') < 0 && p.provider.indexOf('Airalo') < 0) return false;
      if (state.esimDays !== 'all' && Number(p.validityDays) !== Number(state.esimDays)) return false;
      return true;
    });
    if (!filtered.length) filtered = esims;

    var recPlan = filtered.find(function (p) {
      if (state.esimRequireIntl) return p.provider.indexOf('Gigago') >= 0;
      if (needsMountainCarrier) return p.provider.indexOf('Viettel') >= 0;
      return true;
    }) || filtered[0];

    var recBox = document.getElementById('esim-recommendation');
    if (recBox && recPlan) {
      recBox.innerHTML =
        '<div>' +
          '<div style="font-size:0.75rem;font-weight:700;color:var(--va-accent-deep);text-transform:uppercase">' +
            esc(l === 'en' ? 'Recommended Plan' : 'Đề xuất tối ưu') +
          '</div>' +
          '<div style="font-weight:700;font-size:0.96rem">' + esc(recPlan.provider + ' · ' + recPlan.planCode) + '</div>' +
          '<div style="font-size:0.85rem;color:var(--va-ink-soft)">' + esc(recPlan.dataAllowance + ' · ' + recPlan.validityDays + (l === 'en' ? 'd · ' : ' ngày · ') + recPlan.recommendedFor) + '</div>' +
        '</div>' +
        '<div style="display:flex;align-items:center;gap:10px">' +
          '<strong>' + esc(Store.formatPrice(recPlan.priceVND)) + '</strong>' +
          '<button type="button" class="va-btn va-btn--primary va-btn--xs" data-add-item="esim" data-item-id="' + esc(recPlan.id) + '">' +
            esc(l === 'en' ? 'Add eSIM' : 'Thêm eSIM') +
          '</button>' +
        '</div>';
    }

    var listBox = document.getElementById('esim-list');
    if (listBox) {
      listBox.innerHTML = filtered.map(function (p) {
        return '<div class="va-esim-row">' +
          '<div style="min-width:0;flex:1 1 200px">' +
            '<div style="font-weight:700;font-size:0.92rem">' + esc(p.provider) + ' <span style="font-family:var(--sc-font-mono);font-size:0.85rem">[' + esc(p.planCode) + ']</span></div>' +
            '<div style="font-size:0.85rem;color:var(--va-ink-soft)">' + esc(p.dataAllowance + ' · ' + p.validityDays + (l === 'en' ? 'd · ' : 'N · ') + (p.localNumberNote || '')) + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;gap:8px">' +
            '<strong style="font-size:0.88rem">' + esc(Store.formatPrice(p.priceVND)) + '</strong>' +
            '<button type="button" class="va-btn va-btn--sm" data-add-item="esim" data-item-id="' + esc(p.id) + '">+</button>' +
          '</div>' +
        '</div>';
      }).join('');
    }
  }

  function renderGiftcardStudio() {
    var gcObj = Store.getAll().giftcards || {};
    var denoms = gcObj.denominationsVND || [500000, 1000000, 2000000, 5000000, 10000000];
    var themes = gcObj.themes || [
      { id: 'island', label: 'Nghỉ dưỡng Biển Đảo', sampleDest: 'Phú Quốc · Nha Trang' },
      { id: 'northwest', label: 'Khám phá Tây Bắc', sampleDest: 'Hòa Bình · Sa Pa' },
      { id: 'halong', label: 'Du thuyền Hạ Long', sampleDest: 'Vịnh Hạ Long' }
    ];
    var l = lang();

    var denomGroup = document.getElementById('gift-denom-group');
    if (denomGroup) {
      denomGroup.innerHTML = denoms.map(function (amt) {
        var act = Number(amt) === Number(state.giftAmount);
        return '<button type="button" class="va-chip' + (act ? ' is-active' : '') + '" aria-pressed="' + act + '" data-gift-amt="' + amt + '">' +
          esc(Store.formatPrice(amt)) +
        '</button>';
      }).join('');
    }

    var themeGroup = document.getElementById('gift-theme-group');
    if (themeGroup) {
      themeGroup.innerHTML = themes.map(function (t) {
        var act = t.id === state.giftTheme;
        return '<button type="button" class="va-chip' + (act ? ' is-active' : '') + '" aria-pressed="' + act + '" data-gift-theme="' + esc(t.id) + '">' +
          esc(t.label) +
        '</button>';
      }).join('');
    }

    var preview = document.getElementById('gift-preview');
    if (preview) {
      preview.setAttribute('data-theme', state.giftTheme);
      var recText = state.giftRecipient ? state.giftRecipient : (l === 'en' ? 'Vietnam Traveler' : 'Quý khách Việt Nam');
      var msgText = state.giftMessage ? state.giftMessage : (l === 'en' ? 'Wishing a sunny coastal voyage.' : 'Chúc chuyến đi nắng đẹp dọc chữ S.');
      preview.innerHTML =
        '<div style="display:flex;justify-content:space-between;font-size:0.75rem;font-weight:700;color:var(--va-accent-deep);letter-spacing:0.06em">' +
          '<span>VIETNAM ATLAS E-GIFTCARD</span><span>12–24M · STORM CREDIT</span>' +
        '</div>' +
        '<div style="font-family:var(--sc-font-display);font-size:1.5rem;font-weight:700">' + esc(Store.formatPrice(state.giftAmount)) + '</div>' +
        '<div style="font-size:0.86rem;font-weight:600">' + esc((l === 'en' ? 'To: ' : 'Người nhận: ') + recText) + '</div>' +
        '<p style="margin:0;font-size:0.85rem;color:var(--va-ink-soft);font-style:italic">“' + esc(msgText) + '”</p>';
    }

    var termsList = document.getElementById('gift-terms-list');
    if (termsList) {
      termsList.innerHTML = (gcObj.terms || []).map(function (t) {
        return '<li><strong>' + esc(t.title) + ':</strong> ' + esc(t.detail) + '</li>';
      }).join('');
    }
  }

  /* ---------- Act 7: Supports, Aviation Checklist & Weather Policies ---------- */
  function renderSupports() {
    var supports = Store.getAll().supports || {};
    var checklist = document.getElementById('aviation-checklist');
    if (checklist) {
      checklist.innerHTML = (supports.passengerChecklist || []).map(function (item) {
        return '<div class="va-checklist-item"><strong>' + esc(item.title) + ':</strong> ' + esc(item.detail) + '</div>';
      }).join('');
    }

    var eBar = document.getElementById('emergency-bar');
    if (eBar) {
      eBar.innerHTML = (supports.emergencyNumbers || []).map(function (item) {
        return '<a class="va-emergency-pill" href="tel:' + esc(item.number) + '">' +
          '<span class="va-emergency-pill__num">' + esc(item.number) + '</span>' +
          '<span class="va-emergency-pill__label">' + esc(item.label) + '</span>' +
        '</a>';
      }).join('');
    }

    var langNote = document.getElementById('emergency-lang-note');
    if (langNote && supports.languageNote) {
      langNote.textContent = supports.languageNote;
    }

    var policiesGrid = document.getElementById('weather-policies-grid');
    if (policiesGrid) {
      policiesGrid.innerHTML = (supports.weatherPolicies || []).map(function (p) {
        var rulesHtml = (p.rules || []).map(function (r) {
          return '<li>' + esc(r) + '</li>';
        }).join('');
        return '<article class="va-policy-card">' +
          '<h3>' + esc(p.region) + '</h3>' +
          '<ul>' + rulesHtml + '</ul>' +
        '</article>';
      }).join('');
    }
  }

  /* ---------- Act 8: Trip Dossier & Persistent S-Curve Ledger ---------- */
  function renderDossierAndLedger() {
    var draft = Store.getDraftDossier();
    var items = draft.items || [];
    var l = lang();
    var month = getTravelMonth();
    var totalVND = items.reduce(function (sum, it) {
      return sum + (Number(it.priceVND) || 0) * (Number(it.qty) || 1);
    }, 0);

    var badgeCount = document.getElementById('header-dossier-count');
    if (badgeCount) badgeCount.textContent = String(items.length);

    var ledgerCity = document.getElementById('ledger-active-city');
    var ledgerSummary = document.getElementById('ledger-summary-line');
    var allDests = Store.getAll().destinations || [];
    var activeDest = allDests.find(function (d) { return d.id === state.city; });
    if (ledgerCity) {
      ledgerCity.textContent = activeDest
        ? Store.pickText(activeDest, 'shortName', 'shortNameEn')
        : (l === 'en' ? '11 Vietnam Hubs' : '11 vùng Việt Nam');
    }
    if (ledgerSummary) {
      ledgerSummary.textContent = items.length + ' ' + (l === 'en' ? 'items' : 'mục') + ' · ' + Store.formatPrice(totalVND);
    }

    var drawerBody = document.getElementById('ledger-drawer-body');
    if (drawerBody) {
      drawerBody.innerHTML = items.length
        ? items.map(function (it) {
            var title = l === 'en' && it.titleEn ? it.titleEn : it.title;
            return '<div class="va-ledger-row">' +
              '<div style="min-width:0"><strong style="display:block;font-size:0.85rem">' + esc(title) + '</strong>' +
                '<span style="font-size:0.78rem;color:var(--va-ink-soft)">' + esc(Store.formatPrice(it.priceVND)) + '</span>' +
              '</div>' +
              '<button type="button" class="va-btn va-btn--xs" data-remove-dossier="' + esc(it.id) + '" aria-label="Remove">×</button>' +
            '</div>';
          }).join('')
        : '<p style="margin:6px 0;font-size:0.85rem;color:var(--va-ink-soft)">' +
            esc(l === 'en' ? 'Your dossier is empty. Add stays, tours, flights, or eSIMs above.' : 'Chưa có mục nào. Chọn dịch vụ ở bản đồ hoặc xưởng eSIM phía trên.') +
          '</p>';
    }

    var countBadge = document.getElementById('dossier-item-count');
    if (countBadge) countBadge.textContent = String(items.length);

    var listEl = document.getElementById('dossier-items-list');
    if (listEl) {
      listEl.innerHTML = items.length
        ? items.map(function (it) {
            var title = l === 'en' && it.titleEn ? it.titleEn : it.title;
            var lineTotal = (Number(it.priceVND) || 0) * (Number(it.qty) || 1);
            return '<div class="va-dossier-item">' +
              '<div>' +
                '<div style="font-size:0.75rem;font-weight:700;text-transform:uppercase;color:var(--va-accent-deep)">' + esc(it.kind || 'item') + '</div>' +
                '<div style="font-weight:700;font-size:0.94rem">' + esc(title) + '</div>' +
                '<div style="font-size:0.85rem;color:var(--va-ink-soft)">' + esc(it.meta || '') + '</div>' +
              '</div>' +
              '<div style="display:flex;align-items:center;gap:10px">' +
                '<strong>' + esc(Store.formatPrice(lineTotal)) + '</strong>' +
                '<button type="button" class="va-btn va-btn--xs" data-remove-dossier="' + esc(it.id) + '">' +
                  esc(l === 'en' ? 'Remove' : 'Xóa') +
                '</button>' +
              '</div>' +
            '</div>';
          }).join('')
        : '<div class="va-dossier-empty">' +
            esc(l === 'en' ? 'Dossier is empty. Use a preset button or + Add on stays, flights, tours, eSIMs, or giftcards.' : 'Hồ sơ trống. Hãy chọn nút điền mẫu hoặc bấm + Thêm vào hành trình ở các mục phía trên.') +
          '</div>';
    }

    var auditEl = document.getElementById('dossier-audit');
    if (auditEl) {
      var cautionMsgs = [];
      var seenDest = {};
      items.forEach(function (it) {
        if (!it.destinationId || seenDest[it.destinationId]) return;
        seenDest[it.destinationId] = true;
        var dObj = allDests.find(function (d) { return d.id === it.destinationId; });
        if (dObj) {
          var s = Store.getSeasonStatus(dObj, month, l);
          if (s.code === 'caution') {
            cautionMsgs.push(Store.pickText(dObj, 'shortName', 'shortNameEn') + ': ' + s.label);
          }
        }
      });
      if (cautionMsgs.length) {
        auditEl.className = 'va-dossier-audit is-caution';
        auditEl.innerHTML = '<strong>' + esc(l === 'en' ? 'Storm / Rain Advisory:' : 'Lưu ý thời tiết tuyến đã chọn:') + '</strong> ' + esc(cautionMsgs.join(' · '));
      } else {
        auditEl.className = 'va-dossier-audit';
        auditEl.textContent = l === 'en'
          ? 'Weather Audit (Month ' + month + '): Selected hubs match dry/favorable windows.'
          : 'Kiểm tra khí hậu tháng ' + month + ': Các điểm đã chọn đều trong ngưỡng thời tiết thuận lợi.';
      }
    }

    var vndEl = document.getElementById('dossier-total-vnd');
    var usdEl = document.getElementById('dossier-total-usd');
    var datesEl = document.getElementById('dossier-dates-summary');
    if (vndEl) vndEl.textContent = Store.formatPrice(totalVND, 'VND');
    if (usdEl) usdEl.textContent = Store.formatPrice(totalVND, 'USD');
    if (datesEl) {
      datesEl.textContent = state.tripType === 'one-way'
        ? (state.departDate + ' (' + (l === 'en' ? 'One-way' : 'Một chiều') + ')')
        : (state.departDate + ' → ' + state.returnDate);
    }
  }

  /* ---------- Actions & Presets ---------- */
  function selectCity(cityId) {
    state.city = cityId || 'all';
    syncDraftToStore();
    syncControlsUI();
    renderSvgMap();
    renderWorkbenchResults();
    renderEsimStudio();
    renderDossierAndLedger();
  }

  function handleAddItem(kind, itemId) {
    var allData = Store.getAll();

    if (kind === 'stay') {
      var s = (allData.stays || []).find(function (x) { return x.id === itemId; });
      if (!s) return;
      Store.addToDossier({
        id: s.id,
        kind: s.accommodationType || 'stay',
        title: s.name,
        titleEn: s.name,
        destinationId: s.destinationId,
        priceVND: s.pricePerNightVND || (s.priceRangeVND ? s.priceRangeVND[0] : 1200000),
        qty: 1,
        meta: s.zone || ''
      });
    } else if (kind === 'tour') {
      var t = (allData.tours || []).find(function (x) { return x.id === itemId; });
      if (!t) return;
      Store.addToDossier({
        id: t.id,
        kind: 'tour',
        title: t.title,
        titleEn: t.title,
        destinationId: t.destinationId,
        priceVND: t.priceVND || (t.priceRangeVND ? t.priceRangeVND[0] : 600000),
        qty: 1,
        meta: t.durationLabel || ''
      });
    } else if (kind === 'flight') {
      var routes = getFlightRoutes(allData);
      var r = routes.find(function (x) { return x.id === itemId; });
      if (!r) return;
      var rangeArr = state.tripType === 'round-trip' ? r.roundTripRangeVND : r.lccOneWayVND;
      var price = rangeArr ? rangeArr[0] : 1200000;
      Store.addToDossier({
        id: r.id + '-' + state.tripType,
        kind: 'flight',
        title: r.from + ' → ' + r.to + ' (' + r.fromCity + ' → ' + r.toCity + ')',
        titleEn: r.from + ' → ' + r.to + ' (' + (state.tripType === 'round-trip' ? 'Round-Trip' : 'One-way') + ')',
        destinationId: AIRPORT_TO_DEST[r.to] || '',
        priceVND: price,
        qty: 1,
        meta: r.durationText || ''
      });
    } else if (kind === 'esim') {
      var e = (allData.esims || []).find(function (x) { return x.id === itemId; });
      if (!e) return;
      Store.addToDossier({
        id: e.id,
        kind: 'esim',
        title: e.provider + ' ' + e.planCode + ' (' + e.validityDays + 'd)',
        titleEn: e.provider + ' ' + e.planCode + ' (' + e.validityDays + ' days)',
        destinationId: state.city !== 'all' ? state.city : '',
        priceVND: e.priceVND || 120000,
        qty: 1,
        meta: e.dataAllowance || ''
      });
    }

    renderDossierAndLedger();
    renderRegionalRail();
    syncPeakTourButton();
  }

  function applyPreset(which) {
    var allData = Store.getAll();
    var routes = getFlightRoutes(allData);
    Store.clearDossier();
    if (which === 'golden') {
      state.departDate = '2026-03-18';
      state.returnDate = '2026-03-22';
      var fl = routes.find(function (r) { return r.to === 'DAD'; }) || routes[0];
      var dnStay = (allData.stays || []).find(function (s) { return s.destinationId === 'danang'; });
      var dnTour = (allData.tours || []).find(function (t) { return t.destinationId === 'danang'; });
      var es = (allData.esims || [])[0];
      if (fl) handleAddItem('flight', fl.id);
      if (dnStay) handleAddItem('stay', dnStay.id);
      if (dnTour) handleAddItem('tour', dnTour.id);
      if (es) handleAddItem('esim', es.id);
    } else {
      state.departDate = '2026-04-04';
      state.returnDate = '2026-04-08';
      var hbStay = (allData.stays || []).find(function (s) { return s.destinationId === 'hoabinh'; });
      var hlCruise = (allData.stays || []).find(function (s) { return s.destinationId === 'halong' && s.accommodationType === 'Cruises'; });
      var esV = (allData.esims || []).find(function (e) { return e.provider.indexOf('Viettel') >= 0; });
      if (hbStay) handleAddItem('stay', hbStay.id);
      if (hlCruise) handleAddItem('stay', hlCruise.id);
      if (esV) handleAddItem('esim', esV.id);
    }
    syncDraftToStore();
    syncControlsUI();
    renderDossierAndLedger();
    renderRegionalRail();
    syncPeakTourButton();
  }

  /* ---------- Event Binding ---------- */
  function bindEvents() {
    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-lang');
        if (next === Store.getLang()) return;
        Store.setLang(next);
        applyLanguage(true);
        populateCitySelects();
        syncControlsUI();
        renderSvgMap();
        renderWorkbenchResults();
        renderRegionalRail();
        syncPeakTourButton();
        renderEsimStudio();
        renderGiftcardStudio();
        renderSupports();
        renderDossierAndLedger();
      });
    });

    document.querySelectorAll('[data-currency]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var next = btn.getAttribute('data-currency');
        if (next === Store.getCurrency()) return;
        Store.setCurrency(next);
        document.querySelectorAll('[data-currency]').forEach(function (b) {
          var act = b.getAttribute('data-currency') === next;
          b.setAttribute('aria-pressed', act ? 'true' : 'false');
          b.classList.toggle('is-active', act);
        });
        syncControlsUI();
        renderWorkbenchResults();
        renderRegionalRail();
        renderEsimStudio();
        renderGiftcardStudio();
        renderDossierAndLedger();
      });
    });

    var menuToggle = document.getElementById('mobile-menu-toggle');
    var drawer = document.getElementById('mobile-nav-drawer');
    if (menuToggle && drawer) {
      menuToggle.addEventListener('click', function () {
        var willOpen = drawer.hidden;
        drawer.hidden = !willOpen;
        menuToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
      drawer.querySelectorAll('a, button').forEach(function (el) {
        el.addEventListener('click', function () {
          drawer.hidden = true;
          menuToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    // Smooth jump & mode select for all 7 IA pillar buttons (desktop + mobile)
    document.querySelectorAll('[data-nav-target]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var targetId = btn.getAttribute('data-nav-target');
        var mode = btn.getAttribute('data-nav-mode');
        var focus = btn.getAttribute('data-nav-focus');
        if (mode) {
          state.mode = mode;
          syncControlsUI();
          renderWorkbenchResults();
        }
        var scrollTargetId = focus === 'esim' ? 'utility-esim' : (focus === 'giftcards' ? 'utility-giftcards' : targetId);
        var el = document.getElementById(scrollTargetId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    });

    document.querySelectorAll('[data-trip-type]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.tripType = btn.getAttribute('data-trip-type');
        syncDraftToStore();
        syncControlsUI();
        if (state.mode === 'flights') renderWorkbenchResults();
        renderDossierAndLedger();
      });
    });

    ['hero-city-select', 'wb-city-select'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', function () {
          selectCity(el.value);
        });
      }
    });

    ['hero-depart-date', 'wb-depart-date'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', function () {
          state.departDate = el.value;
          syncDraftToStore();
          syncControlsUI();
          renderSvgMap();
          renderRegionalRail();
          renderDossierAndLedger();
        });
      }
    });

    ['hero-return-date', 'wb-return-date'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', function () {
          state.returnDate = el.value;
          syncDraftToStore();
          syncControlsUI();
          renderDossierAndLedger();
        });
      }
    });

    var heroBudget = document.getElementById('hero-budget-select');
    if (heroBudget) {
      heroBudget.addEventListener('change', function () {
        state.budgetTier = heroBudget.value;
        applyBudgetTierMax(state.budgetTier);
        syncDraftToStore();
        syncControlsUI();
        renderWorkbenchResults();
      });
    }

    document.querySelectorAll('[data-budget]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.budgetTier = btn.getAttribute('data-budget');
        applyBudgetTierMax(state.budgetTier);
        syncDraftToStore();
        syncControlsUI();
        renderWorkbenchResults();
      });
    });

    var budgetSlider = document.getElementById('wb-budget-slider');
    if (budgetSlider) {
      budgetSlider.addEventListener('input', function () {
        state.budgetMaxVND = Number(budgetSlider.value);
        state.budgetTier = state.budgetMaxVND >= 10000000 ? 'all' : state.budgetTier;
        syncControlsUI();
        renderWorkbenchResults();
      });
    }

    var heroForm = document.getElementById('hero-search-form');
    if (heroForm) {
      heroForm.addEventListener('submit', function (e) {
        e.preventDefault();
        syncDraftToStore();
        var target = document.getElementById('act-explore');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    }

    document.querySelectorAll('.va-mode-tab[data-mode]').forEach(function (tab) {
      tab.addEventListener('click', function () {
        state.mode = tab.getAttribute('data-mode');
        syncControlsUI();
        renderWorkbenchResults();
      });
    });

    document.querySelectorAll('[data-stay-sub]').forEach(function (sub) {
      sub.addEventListener('click', function () {
        state.staySub = sub.getAttribute('data-stay-sub');
        syncControlsUI();
        renderWorkbenchResults();
      });
    });

    var resetBtn = document.getElementById('map-reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', function () { selectCity('all'); });
    }

    var peakAddBtn = document.getElementById('peak-add-tour-btn');
    if (peakAddBtn) {
      peakAddBtn.addEventListener('click', function () {
        handleAddItem('tour', PEAK_TOUR_ID);
      });
    }

    document.addEventListener('click', function (e) {
      var railFilterBtn = e.target.closest('[data-rail-region]');
      if (railFilterBtn) {
        state.railRegion = railFilterBtn.getAttribute('data-rail-region') || 'all';
        renderRegionalRail();
        return;
      }

      var jumpBtn = e.target.closest('[data-jump-city]');
      if (jumpBtn) {
        selectCity(jumpBtn.getAttribute('data-jump-city'));
        var exp = document.getElementById('act-explore');
        if (exp) exp.scrollIntoView({ behavior: 'smooth' });
        return;
      }

      var addBtn = e.target.closest('[data-add-item]');
      if (addBtn) {
        handleAddItem(addBtn.getAttribute('data-add-item'), addBtn.getAttribute('data-item-id'));
        return;
      }

      var remBtn = e.target.closest('[data-remove-dossier]');
      if (remBtn) {
        Store.removeFromDossier(remBtn.getAttribute('data-remove-dossier'));
        renderDossierAndLedger();
        renderRegionalRail();
        syncPeakTourButton();
        return;
      }

      var amtBtn = e.target.closest('[data-gift-amt]');
      if (amtBtn) {
        state.giftAmount = Number(amtBtn.getAttribute('data-gift-amt'));
        renderGiftcardStudio();
        return;
      }

      var themeBtn = e.target.closest('[data-gift-theme]');
      if (themeBtn) {
        state.giftTheme = themeBtn.getAttribute('data-gift-theme');
        renderGiftcardStudio();
      }
    });

    document.addEventListener('focusin', function (e) {
      var targetEl = e.target;
      if (!targetEl || targetEl === document.body) return;
      var cue = targetEl.closest('[data-sc-cue]');
      var act = targetEl.closest('[data-sc-act="pin"], [data-sc-act="scrub"]');
      if (!cue || !act) return;

      var op = parseFloat(getComputedStyle(cue).opacity);
      if (!isNaN(op) && op >= 0.85) return;

      var nums = (cue.getAttribute('data-sc-cue') || '0 1').trim().split(/\s+/).map(parseFloat);
      var from = isNaN(nums[0]) ? 0 : nums[0];
      var to = (nums.length > 1 && !isNaN(nums[1])) ? nums[1] : 1;
      var rIn = (nums.length > 2 && !isNaN(nums[2])) ? nums[2] : 0.3;
      var targetP = rIn === 0
        ? Math.min(to - 0.04, Math.max(from + 0.24, from + (to - from) * 0.45))
        : (from + to) * 0.5;
      targetP = Math.max(0.01, Math.min(0.94, targetP));

      requestAnimationFrame(function () {
        var r = act.getBoundingClientRect();
        var actTop = window.scrollY + r.top;
        var travel = Math.max(1, act.offsetHeight - window.innerHeight);
        window.scrollTo({ top: Math.round(actTop + travel * targetP), behavior: 'instant' });
      });
    });

    document.querySelectorAll('[data-esim-days]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-esim-days');
        state.esimDays = v === 'all' ? 'all' : Number(v);
        renderEsimStudio();
      });
    });

    var intlChk = document.getElementById('esim-intl-toggle');
    if (intlChk) {
      intlChk.addEventListener('change', function () {
        state.esimRequireIntl = Boolean(intlChk.checked);
        renderEsimStudio();
      });
    }

    var recInput = document.getElementById('gift-recipient');
    var msgInput = document.getElementById('gift-message');
    if (recInput) {
      recInput.addEventListener('input', function () {
        state.giftRecipient = recInput.value;
        renderGiftcardStudio();
      });
    }
    if (msgInput) {
      msgInput.addEventListener('input', function () {
        state.giftMessage = msgInput.value;
        renderGiftcardStudio();
      });
    }

    var addGiftBtn = document.getElementById('add-giftcard-btn');
    if (addGiftBtn) {
      addGiftBtn.addEventListener('click', function () {
        var l = lang();
        Store.addToDossier({
          id: 'gc-' + state.giftAmount + '-' + state.giftTheme,
          kind: 'giftcard',
          title: (l === 'en' ? 'Vietnam Atlas Giftcard ' : 'Thẻ quà tặng ') + Store.formatPrice(state.giftAmount),
          titleEn: 'Vietnam Atlas Giftcard ' + Store.formatPrice(state.giftAmount),
          destinationId: '',
          priceVND: state.giftAmount,
          qty: 1,
          meta: (state.giftRecipient || 'E-Voucher') + ' · ' + state.giftTheme
        });
        renderDossierAndLedger();
      });
    }

    var goldenBtn = document.getElementById('preset-golden-btn');
    var northBtn = document.getElementById('preset-north-btn');
    var clearBtn = document.getElementById('clear-dossier-btn');
    if (goldenBtn) goldenBtn.addEventListener('click', function () { applyPreset('golden'); });
    if (northBtn) northBtn.addEventListener('click', function () { applyPreset('north'); });
    if (clearBtn) clearBtn.addEventListener('click', function () {
      Store.clearDossier();
      renderDossierAndLedger();
      renderRegionalRail();
      syncPeakTourButton();
    });

    var dossierForm = document.getElementById('dossier-form');
    if (dossierForm) {
      dossierForm.addEventListener('submit', function (e) {
        e.preventDefault();
        var l = lang();
        var feedback = document.getElementById('dossier-form-feedback');
        var name = (document.getElementById('traveler-name').value || '').trim();
        var email = (document.getElementById('traveler-email').value || '').trim();
        var phone = (document.getElementById('traveler-phone').value || '').trim();
        var note = (document.getElementById('traveler-note').value || '').trim();
        var draft = Store.getDraftDossier();
        var items = draft.items || [];

        if (!items.length) {
          feedback.className = 'va-form-feedback is-error';
          feedback.textContent = l === 'en'
            ? 'Please add at least one stay, flight, tour, eSIM, or giftcard before saving.'
            : 'Vui lòng thêm ít nhất 1 dịch vụ trước khi lưu.';
          return;
        }
        if (name.length < 2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          feedback.className = 'va-form-feedback is-error';
          feedback.textContent = l === 'en'
            ? 'Please enter a valid traveler name and email address.'
            : 'Vui lòng nhập họ tên và email hợp lệ.';
          return;
        }

        var totalVND = items.reduce(function (s, it) {
          return s + (Number(it.priceVND) || 0) * (Number(it.qty) || 1);
        }, 0);

        var booking = Store.addBooking({
          cityId: state.city === 'all' ? '' : state.city,
          tripType: state.tripType,
          travelDate: state.departDate,
          returnDate: state.tripType === 'round-trip' ? state.returnDate : '',
          travelMonth: getTravelMonth(),
          items: items,
          totalVND: totalVND,
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          notes: note,
          sourcePage: 'index.html'
        });

        var bookingRef = (booking && (booking.id || booking.code)) || 'VA-2026';
        feedback.className = 'va-form-feedback';
        feedback.textContent = l === 'en'
          ? 'Saved demo itinerary ' + bookingRef + ' (' + Store.formatPrice(totalVND) + '). Synced across Portal & Admin CMS.'
          : 'Đã lưu hồ sơ mô phỏng ' + bookingRef + ' (' + Store.formatPrice(totalVND) + '). Đồng bộ sang Đặt dịch vụ & Quản trị CMS.';
      });
    }

    var exportBtn = document.getElementById('dossier-export-json');
    if (exportBtn) {
      exportBtn.addEventListener('click', function () {
        var payload = {
          app: 'Vietnam Atlas',
          generatedAt: new Date().toISOString(),
          currency: Store.getCurrency(),
          language: lang(),
          schedule: {
            city: state.city,
            tripType: state.tripType,
            departDate: state.departDate,
            returnDate: state.tripType === 'round-trip' ? state.returnDate : null
          },
          dossier: Store.getDraftDossier()
        };
        var blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'vietnam-atlas-itinerary.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    }

    var printBtn = document.getElementById('dossier-print-btn');
    if (printBtn) {
      printBtn.addEventListener('click', function () {
        window.print();
      });
    }

    var ledgerToggle = document.getElementById('ledger-toggle-btn');
    var ledgerDrawer = document.getElementById('ledger-drawer');
    var ledgerClose = document.getElementById('ledger-close-btn');

    function setDrawerOpen(open) {
      if (!ledgerDrawer || !ledgerToggle) return;
      ledgerDrawer.hidden = !open;
      ledgerToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    if (ledgerToggle) {
      ledgerToggle.addEventListener('click', function () {
        setDrawerOpen(ledgerDrawer.hidden);
      });
    }
    if (ledgerClose) {
      ledgerClose.addEventListener('click', function () {
        setDrawerOpen(false);
      });
    }

    var tracePath = document.getElementById('ledger-progress-path');
    var ledgerRoot = document.getElementById('route-ledger');
    var headerRoot = document.getElementById('site-header');
    var pathLen = 120;
    if (tracePath && typeof tracePath.getTotalLength === 'function') {
      pathLen = tracePath.getTotalLength() || 120;
      tracePath.style.strokeDasharray = String(pathLen);
      tracePath.style.strokeDashoffset = String(pathLen);
    }

    var traceRafPending = false;
    var lastInHero = null;
    function flushScrollTrace() {
      traceRafPending = false;
      var docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var p = Math.min(1, Math.max(0, window.scrollY / docH));
      if (tracePath) {
        tracePath.style.strokeDashoffset = String((pathLen * (1 - p)).toFixed(2));
      }
      var inHero = window.scrollY < window.innerHeight * 0.55;
      if (inHero !== lastInHero) {
        lastInHero = inHero;
        if (ledgerRoot) ledgerRoot.classList.toggle('is-in-hero', inHero);
        if (headerRoot) headerRoot.classList.toggle('is-in-hero', inHero);
      }
    }
    function onScrollTrace() {
      if (traceRafPending) return;
      traceRafPending = true;
      requestAnimationFrame(flushScrollTrace);
    }
    window.addEventListener('scroll', onScrollTrace, { passive: true });
    window.addEventListener('resize', function () {
      requestAnimationFrame(syncSegmentedThumbs);
    }, { passive: true });
    flushScrollTrace();

    Store.subscribe(function () {
      applyLanguage(false);
      populateCitySelects();
      syncControlsUI();
      renderSvgMap();
      renderWorkbenchResults();
      renderRegionalRail();
      syncPeakTourButton();
      renderEsimStudio();
      renderGiftcardStudio();
      renderSupports();
      renderDossierAndLedger();
    });
  }

  function initAutoReveals() {
    var nodes = document.querySelectorAll('[data-auto-reveal]');
    if (!nodes.length) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof IntersectionObserver === 'undefined') {
      nodes.forEach(function (el) { el.classList.add('is-revealed'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    nodes.forEach(function (el) { io.observe(el); });
  }

  function initAutoCounters() {
    var counters = document.querySelectorAll('[data-auto-count]');
    if (!counters.length) return;
    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function setFinal(el) {
      el.textContent = String(Number(el.getAttribute('data-auto-count')) || 0);
    }

    if (reduced || typeof IntersectionObserver === 'undefined') {
      counters.forEach(setFinal);
      return;
    }

    function animateOne(el) {
      if (el.dataset.counted === '1') return;
      el.dataset.counted = '1';
      var target = Number(el.getAttribute('data-auto-count')) || 0;
      var duration = 1050;
      var start = performance.now();
      function frame(now) {
        var t = Math.min(1, (now - start) / duration);
        var eased = 1 - Math.pow(1 - t, 3);
        el.textContent = String(Math.round(target * eased));
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          el.textContent = String(target);
        }
      }
      requestAnimationFrame(frame);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateOne(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });

    counters.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Boot ---------- */
  function init() {
    hydrateStateFromStoreAndUrl();
    applyLanguage(false);
    populateCitySelects();
    syncControlsUI();
    renderSvgMap();
    renderWorkbenchResults();
    renderRegionalRail();
    syncPeakTourButton();
    renderEsimStudio();
    renderGiftcardStudio();
    renderSupports();
    renderDossierAndLedger();
    bindEvents();
    initAutoReveals();
    initAutoCounters();

    if (window.ScrollCraft && typeof window.ScrollCraft.mount === 'function') {
      scInstance = window.ScrollCraft.mount(document.body);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
