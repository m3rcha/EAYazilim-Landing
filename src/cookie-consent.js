// src/cookie-consent.js

document.addEventListener('DOMContentLoaded', () => {
    const CONSENT_KEY = 'eayazilim_cookie_consent';
    const consentStatus = localStorage.getItem(CONSENT_KEY);

    if (consentStatus === 'accepted') {
        initializeGoogleAnalytics();
    } else if (consentStatus === null) {
        showCookieBanner();
    }

    function showCookieBanner() {
        // Create banner element
        const banner = document.createElement('div');
        banner.id = 'cookie-consent-banner';
        banner.className = 'fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-6 shadow-2xl z-[100] transform translate-y-full transition-transform duration-500 ease-in-out flex flex-col md:flex-row items-center justify-between gap-6';
        
        banner.innerHTML = `
            <div class="text-sm text-gray-600 flex-1">
                <p class="font-medium mb-1 text-gray-900">Çerez Bildirimi</p>
                Sitemizden en iyi şekilde faydalanabilmeniz için çerezler kullanılmaktadır. Sitemize giriş yaparak çerez kullanımını ve <a href="gizlilik-politikasi.html" class="text-blue-600 hover:underline">Gizlilik Politikamızı</a> kabul etmiş sayılırsınız.
            </div>
            <div class="flex gap-3 w-full md:w-auto">
                <button id="btn-reject-cookies" class="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors whitespace-nowrap">
                    Reddet
                </button>
                <button id="btn-accept-cookies" class="flex-1 md:flex-none px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap">
                    Kabul Et
                </button>
            </div>
        `;

        document.body.appendChild(banner);

        // Animate in
        setTimeout(() => {
            banner.classList.remove('translate-y-full');
        }, 100);

        // Event listeners
        document.getElementById('btn-accept-cookies').addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'accepted');
            hideBanner(banner);
            initializeGoogleAnalytics();
        });

        document.getElementById('btn-reject-cookies').addEventListener('click', () => {
            localStorage.setItem(CONSENT_KEY, 'rejected');
            hideBanner(banner);
        });
    }

    function hideBanner(banner) {
        banner.classList.add('translate-y-full');
        setTimeout(() => {
            banner.remove();
        }, 500);
    }

    function initializeGoogleAnalytics() {
        const trackingId = window.ENV?.GA_TRACKING_ID;
        if (!trackingId || trackingId === 'G-XXXXXXXXXX') {
            console.warn('Google Analytics Tracking ID is not set or is using the placeholder.');
            return;
        }

        // Dynamically load Google Analytics script
        const script = document.createElement('script');
        script.async = true;
        script.src = \`https://www.googletagmanager.com/gtag/js?id=\${trackingId}\`;
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', trackingId);
        
        console.log('Google Analytics initialized.');
    }
});
