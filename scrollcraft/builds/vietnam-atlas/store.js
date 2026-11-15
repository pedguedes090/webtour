/* ==========================================================================
   Vietnam Atlas : Shared Reactive Store & Cross-Tab Sync (store.js)
   Wraps window.VIETNAM_ATLAS_DATA with localStorage ('vietnam_atlas_store_v1'),
   BroadcastChannel ('vietnam_atlas_sync'), CRUD, VI/EN & VND/USD helpers.
   ========================================================================== */
(function (global) {
  'use strict';

  var STORAGE_KEY = 'vietnam_atlas_store_v1';
  var CHANNEL_NAME = 'vietnam_atlas_sync';
  var VALID_COLLECTIONS = [
    'destinations',
    'stays',
    'tours',
    'flights',
    'esims',
    'giftcards',
    'bookings'
  ];

  var EN_DEST_MAP = {
    danang: {
      displayNameEn: 'Da Nang (incl. Hoi An, Ba Na)',
      shortNameEn: 'Da Nang · Hoi An',
      regionLabelEn: 'Central Vietnam',
      adminUnit2026En: 'Da Nang City (merged Da Nang + Quang Nam)',
      bestSeasonTextEn: 'Feb - Aug (clear sunny coast; May - Jul hot)',
      weatherWarningTextEn: 'Sep - Jan (heavy rain & typhoons peak Oct - Nov)',
      transferNoteEn: 'DAD airport is 3 km (5-10 min) from city center; 30 km (40-50 min) to Hoi An.',
      summaryEn: 'My Khe Beach, Son Tra Peninsula, Ba Na Hills, and Hoi An Ancient Town united under the 2026 Da Nang City administration.'
    },
    hoabinh: {
      displayNameEn: 'Hoa Binh (Mai Chau · Kim Boi · Thung Nai)',
      shortNameEn: 'Hoa Binh · Mai Chau',
      regionLabelEn: 'Northern Vietnam',
      adminUnit2026En: 'Phu Tho Province (merged Hoa Binh + Vinh Phuc + Phu Tho)',
      bestSeasonTextEn: 'Mar - May (blossoms, mild), Sep - Oct (golden rice), Nov - Feb (cloud hunting & mineral springs)',
      weatherWarningTextEn: 'May - Sep (warm, humid afternoon showers; mountain passes can be slick)',
      transferNoteEn: 'No local airport; fly into HAN and travel 135-150 km overland (~3.5-4.5 hrs to Mai Chau).',
      summaryEn: 'Da River reservoir in Thung Nai, Kim Boi natural thermal springs, and Thai stilt-house valleys in Mai Chau (Phu Tho Province 2026).'
    },
    nhatrang: {
      displayNameEn: 'Nha Trang',
      shortNameEn: 'Nha Trang',
      regionLabelEn: 'Central Coast',
      adminUnit2026En: 'Khanh Hoa Province (merged Khanh Hoa + Ninh Thuan)',
      bestSeasonTextEn: 'Jan - Aug (over 300 sunny days/year, calm bay for coral snorkeling)',
      weatherWarningTextEn: 'Sep - Dec (rain peaks Oct - Nov; island boats may suspend during rough seas)',
      transferNoteEn: 'Arrive via Cam Ranh Airport (CXR), ~30-35 km (35-50 min) along the coast.',
      summaryEn: 'Sun-drenched bay with 300+ bright days per year, speedboat 3-island routes, Hon Tam mud baths, and secluded Ninh Van Bay resorts.'
    },
    phuquoc: {
      displayNameEn: 'Phu Quoc',
      shortNameEn: 'Phu Quoc',
      regionLabelEn: 'Southern Vietnam',
      adminUnit2026En: 'Phu Quoc Special Zone, An Giang Province (merged Kien Giang + An Giang)',
      bestSeasonTextEn: 'Nov - Apr (calm turquoise water, low humidity)',
      weatherWarningTextEn: 'Jul - Sep (southwest monsoon swells; island boat trips may be paused)',
      transferNoteEn: 'From PQC airport, ~10 km (15-25 min) to Duong Dong center.',
      summaryEn: 'Phu Quoc Special Zone connecting An Thoi southern islands, Hon Thom cable car, and Bai Kem / Long Beach resorts.'
    },
    halong: {
      displayNameEn: 'Ha Long Bay',
      shortNameEn: 'Ha Long Bay',
      regionLabelEn: 'Northern Vietnam',
      adminUnit2026En: 'Quang Ninh Province (unchanged provincial boundary)',
      bestSeasonTextEn: 'Mar - May & Sep - Nov (mild breeze, calm water, clear visibility)',
      weatherWarningTextEn: 'Jun - Sep (typhoon/cyclone port closure risk); Dec - Feb (chilly and misty)',
      transferNoteEn: 'VDO airport is 50-60 km (50-70 min expressway); or via HPH / ~2.5 hr expressway from Hanoi.',
      summaryEn: 'Limestone karst seascape featuring Day Routes 1 & 2 and 5-6 star overnight cruises departing Tuan Chau Harbor.'
    },
    hanoi: {
      displayNameEn: 'Hanoi',
      shortNameEn: 'Hanoi',
      regionLabelEn: 'Northern Vietnam',
      adminUnit2026En: 'Hanoi Capital City (unchanged)',
      bestSeasonTextEn: 'Sep - Nov (autumn) & Mar - Apr',
      weatherWarningTextEn: 'May - Aug (peak summer heat & thunderstorms)',
      transferNoteEn: 'Noi Bai Airport (HAN) serves as Northern Vietnam domestic & international hub.',
      summaryEn: 'Northern gateway connecting Old Quarter heritage, West Lake, Ba Vi, and overland expeditions to Hoa Binh, Sa Pa, Ninh Binh, and Ha Long.'
    },
    sapa: {
      displayNameEn: 'Sa Pa',
      shortNameEn: 'Sa Pa',
      regionLabelEn: 'Northern Highlands',
      adminUnit2026En: 'Lao Cai Province (merged Lao Cai + Yen Bai)',
      bestSeasonTextEn: 'Mar - May & Sep - Oct (golden terraced rice)',
      weatherWarningTextEn: 'Jun - Aug (heavy rain); Dec - Feb (very cold, occasional frost)',
      transferNoteEn: 'No airport; expressway coach or overnight sleeper transfer from Hanoi.',
      summaryEn: 'Ta Van & Lao Chai rice terraces, Muong Hoa funicular, and Fansipan peak cable car.'
    },
    ninhbinh: {
      displayNameEn: 'Ninh Binh',
      shortNameEn: 'Ninh Binh',
      regionLabelEn: 'Northern Vietnam',
      adminUnit2026En: 'Ninh Binh Province (merged Ha Nam + Nam Dinh + Ninh Binh)',
      bestSeasonTextEn: 'Sep - Apr (best in spring Jan - Mar & Tam Coc rice May - Jun)',
      weatherWarningTextEn: 'Jul - Aug (warm with afternoon showers)',
      transferNoteEn: 'Road or rail from Hanoi (~90-100 km) or direct from HAN.',
      summaryEn: 'Trang An karst waterways by hand-rowed sampan, Tam Coc valley, and Hang Mua viewpoint.'
    },
    hue: {
      displayNameEn: 'Hue',
      shortNameEn: 'Hue',
      regionLabelEn: 'Central Vietnam',
      adminUnit2026En: 'Hue City (Central Municipality)',
      bestSeasonTextEn: 'Feb - Aug (dry weather ideal for imperial heritage)',
      weatherWarningTextEn: 'Sep - Jan (prolonged rains concentrated Oct - Nov)',
      transferNoteEn: 'Phu Bai Airport (HUI) is ~13-15 km (20-30 min) from city center.',
      summaryEn: 'Centrally governed Imperial Citadel, Perfume River, and royal Nguyen Dynasty tomb complex.'
    },
    dalat: {
      displayNameEn: 'Da Lat',
      shortNameEn: 'Da Lat',
      regionLabelEn: 'Central Highlands',
      adminUnit2026En: 'Lam Dong Province (merged Dak Nong + Lam Dong + Binh Thuan)',
      bestSeasonTextEn: 'Nov - Apr (gentle warmth by day, crisp nights, clear skies)',
      weatherWarningTextEn: 'May - Oct (afternoon rain showers; plan mornings outdoors)',
      transferNoteEn: 'Lien Khuong Airport (DLI) is ~30 km (30-40 min) to Da Lat center.',
      summaryEn: 'Trai Mat pine hills, sunrise cloud hunting, and Tuyen Lam heritage villas across merged Lam Dong.'
    },
    hcmc: {
      displayNameEn: 'Ho Chi Minh City',
      shortNameEn: 'Ho Chi Minh City',
      regionLabelEn: 'Southern Vietnam',
      adminUnit2026En: 'Ho Chi Minh City (merged HCMC + Binh Duong + Ba Ria - Vung Tau)',
      bestSeasonTextEn: 'Dec - Apr (dry season)',
      weatherWarningTextEn: 'May - Nov (short afternoon tropical showers)',
      transferNoteEn: 'Tan Son Nhat Airport (SGN) is Southern Vietnam domestic & international hub.',
      summaryEn: 'Southern metropolis uniting District 1-3 heritage, Cu Chi Tunnels, and Vung Tau beaches under the 2026 municipality.'
    }
  };

  var UI_DICT = {
    vi: {
      navPortal: 'Cổng đặt chỗ',
      navAdmin: 'Quản trị CMS',
      primaryCta: 'Lập hành trình',
      currencyVND: 'VNĐ',
      currencyUSD: 'USD',
      langLabel: 'VI',
      roundTrip: 'Khứ hồi (Round-Trip)',
      oneWay: 'Một chiều (One-way)',
      selectCity: 'Chọn khu vực (Select City)',
      allCities: 'Tất cả 11 điểm đến',
      departureDate: 'Ngày đi (Departure)',
      returnDate: 'Ngày về (Return)',
      budgetLabel: 'Ngân sách (Price / Budget)',
      addToDossier: 'Thêm vào hành trình',
      added: 'Đã thêm',
      goldenWindowLabel: 'Khung giờ vàng xuyên Việt (T3-T4)',
      goodSeasonLabel: 'Mùa đẹp',
      shoulderSeasonLabel: 'Chuyển mùa',
      cautionSeasonLabel: 'Lưu ý mùa mưa / bão',
      regionNorth: 'Miền Bắc',
      regionCentral: 'Miền Trung',
      regionSouth: 'Miền Nam',
      statusPending: 'Chờ xác nhận',
      statusConfirmed: 'Đã xác nhận',
      statusCompleted: 'Hoàn tất',
      statusCancelled: 'Đã hủy'
    },
    en: {
      navPortal: 'Booking Portal',
      navAdmin: 'Admin CMS',
      primaryCta: 'Build Trip',
      currencyVND: 'VNĐ',
      currencyUSD: 'USD',
      langLabel: 'EN',
      roundTrip: 'Round-Trip',
      oneWay: 'One-way',
      selectCity: 'Select City / Region',
      allCities: 'All 11 Destinations',
      departureDate: 'Departure Date',
      returnDate: 'Return Date',
      budgetLabel: 'Price / Budget',
      addToDossier: 'Add to Trip',
      added: 'Added',
      goldenWindowLabel: 'All-Vietnam Golden Window (Mar-Apr)',
      goodSeasonLabel: 'Best Season',
      shoulderSeasonLabel: 'Shoulder Season',
      cautionSeasonLabel: 'Monsoon / Storm Notice',
      regionNorth: 'Northern Vietnam',
      regionCentral: 'Central Vietnam',
      regionSouth: 'Southern Vietnam',
      statusPending: 'Pending',
      statusConfirmed: 'Confirmed',
      statusCompleted: 'Completed',
      statusCancelled: 'Cancelled'
    }
  };

  function clone(val) {
    return JSON.parse(JSON.stringify(val));
  }

  function makeId(prefix) {
    return (prefix || 'id') + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6);
  }

  function buildSeedGiftcardCatalog(seed) {
    var gc = seed.giftcards || {};
    var denoms = gc.denominationsVND || [500000, 1000000, 2000000, 5000000, 10000000];
    var themes = gc.themes || [];
    return denoms.map(function (amount, idx) {
      var theme = themes[idx % Math.max(themes.length, 1)] || {
        id: 'island',
        label: 'Nghỉ dưỡng Biển Đảo',
        sampleDest: 'Phú Quốc · Nha Trang · Đà Nẵng'
      };
      var themeEnMap = {
        island: 'Island & Beach Escape',
        northwest: 'Northwest Mountain Trail',
        halong: 'Ha Long Bay Cruise'
      };
      var formattedVND = Number(amount).toLocaleString('vi-VN') + ' VNĐ';
      return {
        id: 'gc-' + amount + '-' + theme.id,
        title: 'E-Giftcard ' + formattedVND + ' · ' + theme.label,
        titleEn: 'Travel E-Giftcard ' + formattedVND + ' · ' + (themeEnMap[theme.id] || theme.label),
        themeId: theme.id,
        themeLabel: theme.label,
        themeLabelEn: themeEnMap[theme.id] || theme.label,
        amountVND: amount,
        validityMonths: 18,
        sampleDest: theme.sampleDest,
        redeemScope: (gc.redeemScope || ['Hotels & Homes', 'Tours', 'eSIM', 'Flights']).slice(),
        termsSummary: 'Hiệu lực 12-24 tháng, trừ dần số dư, không quy đổi tiền mặt; hoàn trả vào ví tín dụng nếu hủy bất khả kháng.',
        termsSummaryEn: 'Valid 12-24 months with partial balance deduction, non-cashable, credited back on force-majeure cancellations.',
        photo: (seed.assets && seed.assets.editorialStills && seed.assets.editorialStills.giftcard) || 'assets/gen/giftcard-still.webp'
      };
    });
  }

  function buildSeedBookings() {
    return [
      {
        id: 'VA-2026-0318',
        isDemoSeed: true,
        sourcePage: 'explore.html',
        status: 'confirmed',
        customerName: 'Nguyễn Minh Anh',
        customerEmail: 'minhanh.nguyen@example.vn',
        customerPhone: '0904 318 220',
        travelerType: 'domestic',
        travelDate: '2026-03-18',
        returnDate: '2026-03-21',
        travelMonth: 3,
        guests: 2,
        currency: 'VND',
        lang: 'vi',
        items: [
          { id: 'flt-han-dad', kind: 'flight', title: 'HAN -> DAD (Vietnam Airlines, Khứ hồi)', priceVND: 2200000 },
          { id: 'stay-danang-4star', kind: 'stay', title: 'Brilliant Hotel / Mandila Beach (3 đêm)', priceVND: 5250000 },
          { id: 'tour-bana-buffet', kind: 'tour', title: 'Combo Bà Nà Hills Cáp treo + Buffet (2 khách)', priceVND: 2600000 },
          { id: 'esim-viettel-5g60t', kind: 'esim', title: 'Viettel 5G60T (5GB/ngày, 7N)', priceVND: 60000 }
        ],
        totalVND: 10110000,
        notes: 'Mẫu dữ liệu demo: khởi hành khung giờ vàng Tháng 3.',
        createdAt: '2026-02-20T09:15:00.000Z',
        updatedAt: '2026-02-20T11:30:00.000Z'
      },
      {
        id: 'VA-2026-0409',
        isDemoSeed: true,
        sourcePage: 'index.html',
        status: 'pending',
        customerName: 'Liam Bennett',
        customerEmail: 'liam.bennett@example.org',
        customerPhone: '+61 412 890 411',
        travelerType: 'international',
        travelDate: '2026-04-09',
        returnDate: '2026-04-12',
        travelMonth: 4,
        guests: 2,
        currency: 'USD',
        lang: 'en',
        items: [
          { id: 'stay-halong-catherine', kind: 'stay', title: 'Catherine Cruise 6-Star Indochine 2D1N (2 guests)', priceVND: 10800000 },
          { id: 'tour-maichau-kimboi-2n1d', kind: 'tour', title: 'Mai Chau - Kim Boi 2D1N Tour (2 guests)', priceVND: 2760000 },
          { id: 'esim-gigago-vn', kind: 'esim', title: 'Gigago Vietnam eSIM (+84, eKYC-free)', priceVND: 272500 }
        ],
        totalVND: 13832500,
        notes: 'Demo seed inquiry: April all-Vietnam dry window coastal & valley route.',
        createdAt: '2026-03-01T14:20:00.000Z',
        updatedAt: '2026-03-01T14:20:00.000Z'
      }
    ];
  }

  function buildInitialState(seed) {
    var s = seed || {};
    var destinations = clone(s.destinations || []).map(function (d) {
      var en = EN_DEST_MAP[d.id];
      if (en) {
        Object.keys(en).forEach(function (k) {
          if (d[k] === undefined) d[k] = en[k];
        });
      }
      return d;
    });

    return {
      version: 1,
      updatedAt: new Date().toISOString(),
      preferences: {
        lang: 'vi',
        currency: 'VND'
      },
      catalog: {
        destinations: destinations,
        stays: clone(s.stays || []),
        tours: clone(s.tours || []),
        flights: clone((s.flights && s.flights.routes) || []),
        esims: clone(s.esims || []),
        giftcards: buildSeedGiftcardCatalog(s)
      },
      draftDossier: {
        cityId: '',
        travelMonth: 3,
        tripType: 'round-trip',
        departureDate: '2026-03-18',
        returnDate: '2026-03-22',
        budgetTier: 'all',
        items: []
      },
      bookings: buildSeedBookings()
    };
  }

  var memoryFallbackState = null;

  function safeReadStorage() {
    try {
      var raw = global.localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && parsed.catalog) return parsed;
    } catch (e) {}
    return null;
  }

  function safeWriteStorage(state) {
    memoryFallbackState = state;
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function createStore() {
    var seed = global.VIETNAM_ATLAS_DATA;
    if (!seed) {
      console.warn('[VietnamAtlasStore] window.VIETNAM_ATLAS_DATA missing; load data.js before store.js.');
      seed = {};
    }

    var state = safeReadStorage();
    if (!state) {
      state = buildInitialState(seed);
      safeWriteStorage(state);
    } else {
      // Ensure any missing collection keys from older schema upgrades are filled
      var base = buildInitialState(seed);
      VALID_COLLECTIONS.forEach(function (col) {
        if (col === 'bookings') {
          if (!Array.isArray(state.bookings)) state.bookings = base.bookings;
        } else if (!Array.isArray(state.catalog[col])) {
          state.catalog[col] = base.catalog[col];
        }
      });
      if (!state.preferences) state.preferences = base.preferences;
      if (!state.draftDossier) state.draftDossier = base.draftDossier;
    }

    var listeners = [];
    var bc = null;
    if (typeof global.BroadcastChannel === 'function') {
      try {
        bc = new global.BroadcastChannel(CHANNEL_NAME);
      } catch (e) {
        bc = null;
      }
    }

    function buildSnapshot() {
      var s = clone(state);
      return {
        version: s.version,
        updatedAt: s.updatedAt,
        preferences: s.preferences,
        catalog: s.catalog,
        destinations: s.catalog.destinations,
        stays: s.catalog.stays,
        tours: s.catalog.tours,
        flights: s.catalog.flights,
        esims: s.catalog.esims,
        giftcards: s.catalog.giftcards,
        bookings: s.bookings,
        draftDossier: s.draftDossier,
        meta: clone(seed.meta || {}),
        flightMeta: {
          peakSurgeNotice: (seed.flights && seed.flights.peakSurgeNotice) || '',
          bookingWindowNote: (seed.flights && seed.flights.bookingWindowNote) || '',
          airlines: clone((seed.flights && seed.flights.airlines) || []),
          securityRule: (seed.flights && seed.flights.securityRule) || ''
        },
        giftcardMeta: clone(seed.giftcards || {}),
        supports: clone(seed.supports || {}),
        iaPillars: clone(seed.iaPillars || []),
        searchModes: clone(seed.searchModes || {}),
        budgetTiers: clone(seed.budgetTiers || []),
        airports: clone(seed.airports || []),
        assets: clone(seed.assets || {})
      };
    }

    function notify(meta) {
      var snap = buildSnapshot();
      for (var i = 0; i < listeners.length; i++) {
        try {
          listeners[i](snap, meta || { type: 'update' });
        } catch (err) {
          console.error('[VietnamAtlasStore] subscriber error:', err);
        }
      }
      try {
        global.dispatchEvent(new CustomEvent('vietnam-atlas:store', {
          detail: { state: snap, meta: meta || { type: 'update' } }
        }));
      } catch (e) {}
    }

    function commit(meta) {
      state.updatedAt = new Date().toISOString();
      safeWriteStorage(state);
      if (bc) {
        try {
          bc.postMessage({ key: STORAGE_KEY, meta: meta, updatedAt: state.updatedAt });
        } catch (e) {}
      }
      notify(meta);
    }

    function reloadFromExternal(meta) {
      var next = safeReadStorage();
      if (next) {
        state = next;
        applyHtmlLang(state.preferences && state.preferences.lang);
        notify(meta || { type: 'external-sync' });
      }
    }

    if (bc) {
      bc.addEventListener('message', function (ev) {
        if (ev && ev.data && ev.data.key === STORAGE_KEY) {
          reloadFromExternal({ type: 'broadcast', sourceMeta: ev.data.meta });
        }
      });
    }

    global.addEventListener('storage', function (ev) {
      if (ev && ev.key === STORAGE_KEY) {
        reloadFromExternal({ type: 'storage-event' });
      }
    });

    function applyHtmlLang(lang) {
      if (global.document && global.document.documentElement) {
        global.document.documentElement.lang = lang === 'en' ? 'en' : 'vi';
      }
    }
    applyHtmlLang(state.preferences && state.preferences.lang);

    function assertCollection(name) {
      if (VALID_COLLECTIONS.indexOf(name) === -1) {
        throw new Error('[VietnamAtlasStore] Unknown collection: ' + name);
      }
    }

    function getTargetArray(name) {
      assertCollection(name);
      return name === 'bookings' ? state.bookings : state.catalog[name];
    }

    function setTargetArray(name, arr) {
      assertCollection(name);
      if (name === 'bookings') state.bookings = arr;
      else state.catalog[name] = arr;
    }

    // ---- Public API -------------------------------------------------------
    var api = {
      STORAGE_KEY: STORAGE_KEY,
      CHANNEL_NAME: CHANNEL_NAME,

      getAll: function () {
        return buildSnapshot();
      },

      getCollection: function (name) {
        return clone(getTargetArray(name));
      },

      saveCollection: function (name, items) {
        assertCollection(name);
        if (!Array.isArray(items)) {
          throw new Error('[VietnamAtlasStore] saveCollection expects an array.');
        }
        setTargetArray(name, clone(items));
        commit({ type: 'saveCollection', collection: name });
        return clone(getTargetArray(name));
      },

      upsertItem: function (collection, item) {
        assertCollection(collection);
        if (!item || typeof item !== 'object') {
          throw new Error('[VietnamAtlasStore] upsertItem expects an object.');
        }
        var arr = getTargetArray(collection);
        var copy = clone(item);
        if (!copy.id) {
          var prefix = collection.slice(0, 4);
          copy.id = makeId(prefix);
        }
        var idx = -1;
        for (var i = 0; i < arr.length; i++) {
          if (arr[i].id === copy.id) { idx = i; break; }
        }
        if (idx >= 0) {
          arr[idx] = Object.assign({}, arr[idx], copy, { updatedAt: new Date().toISOString() });
          commit({ type: 'upsert', collection: collection, id: copy.id, action: 'update' });
          return clone(arr[idx]);
        } else {
          if (!copy.createdAt) copy.createdAt = new Date().toISOString();
          arr.unshift(copy);
          commit({ type: 'upsert', collection: collection, id: copy.id, action: 'create' });
          return clone(copy);
        }
      },

      deleteItem: function (collection, id) {
        assertCollection(collection);
        var arr = getTargetArray(collection);
        var before = arr.length;
        var next = arr.filter(function (row) { return row.id !== id; });
        if (next.length === before) return false;
        setTargetArray(collection, next);
        commit({ type: 'delete', collection: collection, id: id });
        return true;
      },

      addBooking: function (booking) {
        var b = clone(booking || {});
        var now = new Date().toISOString();
        var items = Array.isArray(b.items) ? b.items : [];
        var computedTotal = items.reduce(function (sum, it) {
          var qty = Number(it.qty || 1);
          var unit = Number(it.priceVND || 0);
          return sum + (qty * unit);
        }, 0);
        var record = {
          id: b.id || ('VA-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000))),
          isDemoSeed: false,
          sourcePage: b.sourcePage || 'web',
          status: b.status || 'pending',
          customerName: String(b.customerName || '').trim(),
          customerEmail: String(b.customerEmail || '').trim(),
          customerPhone: String(b.customerPhone || '').trim(),
          travelerType: b.travelerType || (state.preferences.lang === 'en' ? 'international' : 'domestic'),
          travelDate: b.travelDate || state.draftDossier.departureDate || '',
          returnDate: b.returnDate || state.draftDossier.returnDate || '',
          travelMonth: Number(b.travelMonth || state.draftDossier.travelMonth || 3),
          guests: Math.max(1, Number(b.guests || 1)),
          currency: b.currency || state.preferences.currency || 'VND',
          lang: b.lang || state.preferences.lang || 'vi',
          items: items,
          totalVND: typeof b.totalVND === 'number' && b.totalVND > 0 ? b.totalVND : computedTotal,
          notes: String(b.notes || '').trim(),
          createdAt: now,
          updatedAt: now
        };
        state.bookings.unshift(record);
        commit({ type: 'addBooking', id: record.id });
        return clone(record);
      },

      updateBookingStatus: function (bookingId, status) {
        var allowed = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (allowed.indexOf(status) === -1) {
          throw new Error('[VietnamAtlasStore] Invalid booking status: ' + status);
        }
        for (var i = 0; i < state.bookings.length; i++) {
          if (state.bookings[i].id === bookingId) {
            state.bookings[i].status = status;
            state.bookings[i].updatedAt = new Date().toISOString();
            commit({ type: 'updateBookingStatus', id: bookingId, status: status });
            return clone(state.bookings[i]);
          }
        }
        return null;
      },

      resetToSeed: function () {
        state = buildInitialState(seed);
        applyHtmlLang(state.preferences.lang);
        commit({ type: 'resetToSeed' });
        return buildSnapshot();
      },

      // ---- Draft Trip Dossier Sync ----------------------------------------
      getDraftDossier: function () {
        return clone(state.draftDossier);
      },

      saveDraftDossier: function (patch) {
        state.draftDossier = Object.assign({}, state.draftDossier, clone(patch || {}));
        commit({ type: 'draftDossier' });
        return clone(state.draftDossier);
      },

      addToDossier: function (item) {
        if (!item || typeof item !== 'object') return clone(state.draftDossier);
        var entry = clone(item);
        entry.id = entry.id || makeId('item');
        entry.qty = Math.max(1, Number(entry.qty || 1));
        entry.priceVND = Number(entry.priceVND || 0);
        var list = state.draftDossier.items || [];
        var found = false;
        for (var i = 0; i < list.length; i++) {
          if (list[i].id === entry.id) {
            list[i] = Object.assign({}, list[i], entry);
            found = true;
            break;
          }
        }
        if (!found) list.push(entry);
        state.draftDossier.items = list;
        commit({ type: 'addToDossier', itemId: entry.id });
        return clone(state.draftDossier);
      },

      removeFromDossier: function (itemId) {
        state.draftDossier.items = (state.draftDossier.items || []).filter(function (x) {
          return x.id !== itemId;
        });
        commit({ type: 'removeFromDossier', itemId: itemId });
        return clone(state.draftDossier);
      },

      clearDossier: function () {
        state.draftDossier.items = [];
        commit({ type: 'clearDossier' });
        return clone(state.draftDossier);
      },

      // ---- Language & Currency Helpers ------------------------------------
      getLang: function () {
        return (state.preferences && state.preferences.lang) === 'en' ? 'en' : 'vi';
      },

      setLang: function (lang) {
        var next = lang === 'en' ? 'en' : 'vi';
        state.preferences.lang = next;
        applyHtmlLang(next);
        commit({ type: 'lang', lang: next });
        return next;
      },

      getCurrency: function () {
        return (state.preferences && state.preferences.currency) === 'USD' ? 'USD' : 'VND';
      },

      setCurrency: function (currency) {
        var next = currency === 'USD' ? 'USD' : 'VND';
        state.preferences.currency = next;
        commit({ type: 'currency', currency: next });
        return next;
      },

      t: function (viOrObj, enText) {
        var lang = api.getLang();
        if (viOrObj && typeof viOrObj === 'object') {
          return lang === 'en' ? (viOrObj.en || viOrObj.vi || '') : (viOrObj.vi || viOrObj.en || '');
        }
        return lang === 'en' ? (enText !== undefined ? enText : viOrObj) : viOrObj;
      },

      getUIText: function (key, langOverride) {
        var lang = langOverride || api.getLang();
        var dict = UI_DICT[lang] || UI_DICT.vi;
        return dict[key] !== undefined ? dict[key] : (UI_DICT.vi[key] || key);
      },

      pickText: function (obj, viField, enField) {
        if (!obj) return '';
        if (api.getLang() === 'en' && enField && obj[enField]) return obj[enField];
        return obj[viField] || '';
      },

      vndToUsd: function (vndAmount) {
        var rate = (seed.meta && seed.meta.exchangeRateVNDPerUSD) || 25000;
        return Number(vndAmount || 0) / rate;
      },

      formatPrice: function (vndAmount, currencyOverride) {
        var cur = currencyOverride || api.getCurrency();
        var val = Number(vndAmount || 0);
        if (cur === 'USD') {
          var usd = api.vndToUsd(val);
          var decimals = usd < 10 ? 2 : 0;
          return '$' + usd.toLocaleString('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
          }) + ' USD';
        }
        return Math.round(val).toLocaleString('vi-VN') + ' VNĐ';
      },

      formatPriceDual: function (vndAmount) {
        var vndStr = api.formatPrice(vndAmount, 'VND');
        var usdStr = api.formatPrice(vndAmount, 'USD');
        return api.getCurrency() === 'USD'
          ? (usdStr + ' (' + vndStr + ')')
          : (vndStr + ' (~' + usdStr + ')');
      },

      formatPriceRange: function (minVND, maxVND, openEnded, currencyOverride) {
        var cur = currencyOverride || api.getCurrency();
        var plus = openEnded ? '+' : '';
        if (cur === 'USD') {
          var u1 = Math.round(api.vndToUsd(minVND));
          var u2 = Math.round(api.vndToUsd(maxVND));
          return '$' + u1 + ' - $' + u2 + plus + ' USD';
        }
        return Math.round(minVND).toLocaleString('vi-VN') + ' - ' + Math.round(maxVND).toLocaleString('vi-VN') + plus + ' VNĐ';
      },

      getSeasonStatus: function (destOrId, monthNum, langOverride) {
        var lang = langOverride || api.getLang();
        var m = Number(monthNum || (state.draftDossier && state.draftDossier.travelMonth) || 3);
        var dest = typeof destOrId === 'string'
          ? state.catalog.destinations.filter(function (d) { return d.id === destOrId; })[0]
          : destOrId;

        if (!dest) {
          var isGoldenAll = (m === 3 || m === 4);
          return {
            code: isGoldenAll ? 'golden' : 'good',
            label: isGoldenAll ? api.getUIText('goldenWindowLabel', lang) : api.getUIText('goodSeasonLabel', lang),
            note: isGoldenAll
              ? (lang === 'en' ? 'March to April is the golden dry window across North, Central, and South Vietnam.' : 'Tháng 3 đến Tháng 4 là khung giờ vàng khô ráo trên cả 3 miền Bắc, Trung, Nam.')
              : ''
          };
        }

        var inBest = Array.isArray(dest.bestMonths) && dest.bestMonths.indexOf(m) !== -1;
        var inRainy = Array.isArray(dest.rainyMonths) && dest.rainyMonths.indexOf(m) !== -1;

        if ((m === 3 || m === 4) && inBest && !inRainy) {
          return {
            code: 'golden',
            label: api.getUIText('goldenWindowLabel', lang),
            note: lang === 'en' ? (dest.bestSeasonTextEn || dest.bestSeasonText) : dest.bestSeasonText
          };
        }
        if (inBest && inRainy) {
          return {
            code: 'shoulder',
            label: api.getUIText('shoulderSeasonLabel', lang),
            note: lang === 'en' ? (dest.weatherWarningTextEn || dest.weatherWarningText) : dest.weatherWarningText
          };
        }
        if (inRainy) {
          return {
            code: 'caution',
            label: api.getUIText('cautionSeasonLabel', lang),
            note: lang === 'en' ? (dest.weatherWarningTextEn || dest.weatherWarningText) : dest.weatherWarningText
          };
        }
        return {
          code: 'good',
          label: api.getUIText('goodSeasonLabel', lang),
          note: lang === 'en' ? (dest.bestSeasonTextEn || dest.bestSeasonText) : dest.bestSeasonText
        };
      },

      subscribe: function (fn) {
        if (typeof fn !== 'function') return function () {};
        listeners.push(fn);
        return function () {
          listeners = listeners.filter(function (f) { return f !== fn; });
        };
      }
    };

    return api;
  }

  global.VietnamAtlasStore = createStore();
})(window);
