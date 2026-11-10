export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te';

export interface LanguageOption {
  code: Language;
  label: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', label: 'Telugu', nativeName: 'తెలుగు' }
];

export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Nav
    'nav.home': 'Home',
    'nav.explore': 'Explore',
    'nav.orders': 'Orders',
    'nav.account': 'Account',

    // Header & Search
    'header.search_placeholder': 'Search products & local services...',
    'header.special_req': 'Special Req',
    'header.fast_delivery': '10-25 Min Delivery',

    // Actions & Buttons
    'action.add': 'ADD',
    'action.view_cart': 'View Cart',
    'action.book_now': 'Book Service',
    'action.buy_now': 'Buy Now',
    'action.cancel_order': 'Cancel Order',
    'action.cancel_booking': 'Cancel Booking',
    'action.invoice': 'Invoice',
    'action.track': 'Track',
    'action.rate_now': 'Rate Now',
    'action.move_to_cart': 'Move to Cart',
    'action.wishlist': 'My Wishlist',
    'action.restart_tour': 'Restart Splash Flow',

    // Section Titles
    'home.flash_deals': 'Lightning Flash Deals',
    'home.explore_categories': 'Shop by Category',
    'home.verified_services': 'Top Verified Services & Repairs',
    'home.speed_all': 'All Services',
    'home.speed_instant': '⚡ 25-Min Instant',
    'home.speed_scheduled': '📅 Scheduled Slot',

    // Account & Status
    'account.quick_actions': 'Quick Actions',
    'account.select_language': 'Change Language',
    'account.logout': 'Sign Out',
    'status.confirmed': 'Confirmed',
    'status.packed': 'Packed',
    'status.shipped': 'Shipped',
    'status.out_for_delivery': 'Out for Delivery',
    'status.delivered': 'Delivered',
    'status.cancelled': 'Cancelled (Refunded)'
  },
  hi: {
    // Nav
    'nav.home': 'होम',
    'nav.explore': 'खोजें',
    'nav.orders': 'ऑर्डर',
    'nav.account': 'खाता',

    // Header & Search
    'header.search_placeholder': 'सामान और सेवाएं खोजें...',
    'header.special_req': 'विशेष अनुरोध',
    'header.fast_delivery': '10-25 मिनट में डिलीवरी',

    // Actions & Buttons
    'action.add': 'जोड़ें',
    'action.view_cart': 'कार्ट देखें',
    'action.book_now': 'सेवा बुक करें',
    'action.buy_now': 'अभी खरीदें',
    'action.cancel_order': 'ऑर्डर रद्द करें',
    'action.cancel_booking': 'बुकिंग रद्द करें',
    'action.invoice': 'बिल / इनवॉयस',
    'action.track': 'ट्रैक करें',
    'action.rate_now': 'रेटिंग दें',
    'action.move_to_cart': 'कार्ट में डालें',
    'action.wishlist': 'मेरी विशलिस्ट',
    'action.restart_tour': 'सफर पुनः शुरू करें',

    // Section Titles
    'home.flash_deals': 'सुपर फ्लैश डील्स',
    'home.explore_categories': 'श्रेणियों के अनुसार खरीदें',
    'home.verified_services': 'सत्यापित होम सेवाएं व मरम्मत',
    'home.speed_all': 'सभी सेवाएं',
    'home.speed_instant': '⚡ 25-मिनट तत्काल',
    'home.speed_scheduled': '📅 समय अनुसार',

    // Account & Status
    'account.quick_actions': 'त्वरित विकल्प',
    'account.select_language': 'भाषा बदलें',
    'account.logout': 'लॉग आउट',
    'status.confirmed': 'स्वीकृत',
    'status.packed': 'पैक हुआ',
    'status.shipped': 'भेज दिया',
    'status.out_for_delivery': 'डिलीवरी के लिए निकला',
    'status.delivered': 'पहुंच गया',
    'status.cancelled': 'रद्द (रिफंड हुआ)'
  },
  kn: {
    // Nav
    'nav.home': 'ಮುಖಪುಟ',
    'nav.explore': 'ಅನ್ವೇಷಿಸಿ',
    'nav.orders': 'ಆರ್ಡರ್‌ಗಳು',
    'nav.account': 'ಖಾತೆ',

    // Header & Search
    'header.search_placeholder': 'ಉತ್ಪನ್ನಗಳು ಮತ್ತು ಸೇವೆಗಳನ್ನು ಹುಡುಕಿ...',
    'header.special_req': 'ವಿಶೇಷ ವಿನಂತಿ',
    'header.fast_delivery': '10-25 ನಿಮಿಷ ಡೆಲಿವರಿ',

    // Actions & Buttons
    'action.add': 'ಸೇರಿಸಿ',
    'action.view_cart': 'ಕಾರ್ಟ್ ನೋಡಿ',
    'action.book_now': 'ಸೇವೆ ಬುಕ್ ಮಾಡಿ',
    'action.buy_now': 'ಈಗಲೇ ಖರೀದಿಸಿ',
    'action.cancel_order': 'ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ',
    'action.cancel_booking': 'ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ',
    'action.invoice': 'ಇನ್‌ವಾಯ್ಸ್',
    'action.track': 'ಟ್ರ್ಯಾಕ್ ಮಾಡಿ',
    'action.rate_now': 'ರೇಟಿಂಗ್ ನೀಡಿ',
    'action.move_to_cart': 'ಕಾರ್ಟ್‌ಗೆ ಸರಿಸಿ',
    'action.wishlist': 'ನನ್ನ ಇಷ್ಟಪಟ್ಟಿ',
    'action.restart_tour': 'ಮತ್ತೆ ಪ್ರಾರಂಭಿಸಿ',

    // Section Titles
    'home.flash_deals': 'ಮಿಂಚಿನ ಡೀಲ್‌ಗಳು',
    'home.explore_categories': 'ವರ್ಗಗಳ ಪ್ರಕಾರ ಶಾಪಿಂಗ್',
    'home.verified_services': 'ಪರಿಶೀಲಿಸಿದ ಗೃಹ ಸೇವೆಗಳು',
    'home.speed_all': 'ಎಲ್ಲಾ ಸೇವೆಗಳು',
    'home.speed_instant': '⚡ 25-ನಿಮಿಷ ತ್ವರಿತ',
    'home.speed_scheduled': '📅 ನಿಗದಿತ ಸಮಯ',

    // Account & Status
    'account.quick_actions': 'ತ್ವರಿತ ಕ್ರಿಯೆಗಳು',
    'account.select_language': 'ಭಾಷೆ ಬದಲಾಯಿಸಿ',
    'account.logout': 'ಲಾಗ್ ಔಟ್',
    'status.confirmed': 'ಖಚಿತಪಟ್ಟಿದೆ',
    'status.packed': 'ಪ್ಯಾಕ್ ಆಗಿದೆ',
    'status.shipped': 'ರವಾನಿಸಲಾಗಿದೆ',
    'status.out_for_delivery': 'ವಿತರಣೆಯಲ್ಲಿದೆ',
    'status.delivered': 'ತಲುಪಿಸಲಾಗಿದೆ',
    'status.cancelled': 'ರದ್ದಾಗಿದೆ (ಮರುಪಾವತಿ)'
  },
  ta: {
    // Nav
    'nav.home': 'முகப்பு',
    'nav.explore': 'ஆராய்வு',
    'nav.orders': 'ஆர்டர்கள்',
    'nav.account': 'கணக்கு',

    // Header & Search
    'header.search_placeholder': 'பொருட்கள் & சேவைகளைத் தேடுங்கள்...',
    'header.special_req': 'சிறப்பு கோரிக்கை',
    'header.fast_delivery': '10-25 நிமிட டெலிவரி',

    // Actions & Buttons
    'action.add': 'சேர்',
    'action.view_cart': 'கார்ட்டைப் பார்',
    'action.book_now': 'சேவை முன்பதிவு',
    'action.buy_now': 'உடனே வாங்கு',
    'action.cancel_order': 'ஆர்டரை ரத்து செய்',
    'action.cancel_booking': 'முன்பதிவை ரத்து செய்',
    'action.invoice': 'ரசீது',
    'action.track': 'டிராக்கிங்',
    'action.rate_now': 'மதிப்பீடு செய்',
    'action.move_to_cart': 'கார்ட்டில் சேர்',
    'action.wishlist': 'விருப்பப்பட்டியல்',
    'action.restart_tour': 'மீண்டும் தொடங்கு',

    // Section Titles
    'home.flash_deals': 'மின்னல் சலுகைகள்',
    'home.explore_categories': 'பிரிவுகள்',
    'home.verified_services': 'சரிபார்க்கப்பட்ட சேவைகள்',
    'home.speed_all': 'அனைத்து சேவைகள்',
    'home.speed_instant': '⚡ 25-நிமிட விரைவு',
    'home.speed_scheduled': '📅 முன்பதிவு நேரம்',

    // Account & Status
    'account.quick_actions': 'விரைவு செயல்கள்',
    'account.select_language': 'மொழியை மாற்று',
    'account.logout': 'வெளியேறு',
    'status.confirmed': 'உறுதியானது',
    'status.packed': 'பேக் செய்யப்பட்டது',
    'status.shipped': 'அனுப்பப்பட்டது',
    'status.out_for_delivery': 'டெலிவரிக்காக வெளியே',
    'status.delivered': 'டெலிவரி செய்யப்பட்டது',
    'status.cancelled': 'ரத்தானது (பணம் திரும்பியது)'
  },
  te: {
    // Nav
    'nav.home': 'హోమ్',
    'nav.explore': 'శోధన',
    'nav.orders': 'ఆర్డర్లు',
    'nav.account': 'ఖాతా',

    // Header & Search
    'header.search_placeholder': 'వస్తువులు & సేవలను శోధించండి...',
    'header.special_req': 'ప్రత్యేక అభ్యర్థన',
    'header.fast_delivery': '10-25 నిమిషాల డెలివరీ',

    // Actions & Buttons
    'action.add': 'జోడించు',
    'action.view_cart': 'కార్ట్ చూడండి',
    'action.book_now': 'సేవ బుక్ చేయండి',
    'action.buy_now': 'ఇప్పుడే కొనండి',
    'action.cancel_order': 'ఆర్డర్ రద్దు చేయండి',
    'action.cancel_booking': 'బుకింగ్ రద్దు చేయండి',
    'action.invoice': 'ఇన్వాయిస్',
    'action.track': 'ట్రాక్ చేయండి',
    'action.rate_now': 'రేటింగ్ ఇవ్వండి',
    'action.move_to_cart': 'కార్ట్‌కి తరలించు',
    'action.wishlist': 'నా కోరికల జాబితా',
    'action.restart_tour': 'మళ్ళీ ప్రారంభించు',

    // Section Titles
    'home.flash_deals': 'మెరుపు డీల్స్',
    'home.explore_categories': 'కేటగిరీల వారీగా',
    'home.verified_services': 'ధృవీకరించబడిన సేవలు',
    'home.speed_all': 'అన్ని సేవలు',
    'home.speed_instant': '⚡ 25-నిమిషాల తక్షణ',
    'home.speed_scheduled': '📅 నిర్ణీత సమయం',

    // Account & Status
    'account.quick_actions': 'త్వరిత చర్యలు',
    'account.select_language': 'భాషను మార్చండి',
    'account.logout': 'లాగ్ అవుట్',
    'status.confirmed': 'ధృవీకరించబడింది',
    'status.packed': 'ప్యాక్ చేయబడింది',
    'status.shipped': 'రవాణా చేయబడింది',
    'status.out_for_delivery': 'డెలివరీ కోసం బయలుదేరింది',
    'status.delivered': 'చేరింది',
    'status.cancelled': 'రద్దు చేయబడింది (రీఫండ్)'
  }
};
