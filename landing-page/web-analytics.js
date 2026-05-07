(function () {
    var state = {
        pageInitialized: false,
        seenSections: {},
        observer: null
    };

    function getConfig() {
        return Object.assign({
            ga4MeasurementId: '',
            plausibleDomain: '',
            plausibleScriptSrc: 'https://plausible.io/js/script.js',
            enableDebugConsole: false
        }, window.MICROBREAKS_ANALYTICS_CONFIG || {});
    }

    function log() {
        var config = getConfig();
        if (!config.enableDebugConsole || typeof console === 'undefined') {
            return;
        }

        var args = Array.prototype.slice.call(arguments);
        args.unshift('[MicroBreaks Web Analytics]');
        console.log.apply(console, args);
    }

    function appendScriptOnce(scriptId, src, attributes) {
        if (!src || document.getElementById(scriptId)) {
            return;
        }

        var script = document.createElement('script');
        script.id = scriptId;
        script.async = true;
        script.src = src;

        Object.keys(attributes || {}).forEach(function (key) {
            if (attributes[key] === undefined || attributes[key] === null || attributes[key] === '') {
                return;
            }
            script.setAttribute(key, String(attributes[key]));
        });

        document.head.appendChild(script);
    }

    function ensureGa4(config) {
        if (!config.ga4MeasurementId) {
            return;
        }

        window.dataLayer = window.dataLayer || [];
        window.gtag = window.gtag || function () {
            window.dataLayer.push(arguments);
        };

        window.gtag('js', new Date());
        window.gtag('config', config.ga4MeasurementId, {
            anonymize_ip: true,
            send_page_view: false
        });

        appendScriptOnce(
            'microbreaks-ga4',
            'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(config.ga4MeasurementId)
        );

        log('GA4 enabled', config.ga4MeasurementId);
    }

    function ensurePlausible(config) {
        if (!config.plausibleDomain) {
            return;
        }

        window.plausible = window.plausible || function () {
            (window.plausible.q = window.plausible.q || []).push(arguments);
        };

        appendScriptOnce('microbreaks-plausible', config.plausibleScriptSrc, {
            'data-domain': config.plausibleDomain,
            defer: 'defer'
        });

        log('Plausible enabled', config.plausibleDomain);
    }

    function buildPayload(eventName, properties) {
        return Object.assign({
            event: eventName,
            page_path: window.location.pathname,
            page_title: document.title,
            timestamp: Date.now()
        }, properties || {});
    }

    function safeTrack(eventName, properties) {
        if (!eventName) {
            return;
        }

        try {
            var payload = buildPayload(eventName, properties);

            window.microbreaksAnalyticsQueue = window.microbreaksAnalyticsQueue || [];
            window.microbreaksAnalyticsQueue.push(payload);

            if (Array.isArray(window.dataLayer)) {
                window.dataLayer.push(payload);
            }

            if (typeof window.gtag === 'function') {
                window.gtag('event', eventName, payload);
            }

            if (typeof window.plausible === 'function') {
                window.plausible(eventName, { props: payload });
            }

            log('Tracked', eventName, payload);
        } catch (error) {
            log('Track failed', eventName, error);
        }
    }

    function bindClickTracking() {
        var clickableNodes = document.querySelectorAll('[data-analytics-event]');
        clickableNodes.forEach(function (node) {
            if (node.__microbreaksClickBound) {
                return;
            }

            node.__microbreaksClickBound = true;
            node.addEventListener('click', function () {
                safeTrack(node.getAttribute('data-analytics-event'), {
                    cta_label: node.getAttribute('data-analytics-label') || '',
                    href: node.getAttribute('href') || '',
                    link_text: (node.textContent || '').trim()
                });
            });
        });
    }

    function bindSectionTracking(sectionViewEvent, pageType) {
        var sectionNodes = document.querySelectorAll('[data-analytics-section]');

        if (!('IntersectionObserver' in window) || sectionNodes.length === 0) {
            return;
        }

        if (state.observer) {
            state.observer.disconnect();
        }

        state.seenSections = {};
        state.observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) {
                    return;
                }

                var sectionName = entry.target.getAttribute('data-analytics-section');
                if (!sectionName || state.seenSections[sectionName]) {
                    return;
                }

                state.seenSections[sectionName] = true;
                safeTrack(sectionViewEvent, {
                    section_name: sectionName,
                    page_type: pageType
                });
            });
        }, { threshold: 0.45 });

        sectionNodes.forEach(function (node) {
            state.observer.observe(node);
        });
    }

    function init(options) {
        var settings = Object.assign({
            pageType: 'unknown',
            pageViewEvent: 'page_viewed',
            sectionViewEvent: 'section_viewed'
        }, options || {});

        ensureGa4(getConfig());
        ensurePlausible(getConfig());

        bindClickTracking();
        bindSectionTracking(settings.sectionViewEvent, settings.pageType);

        if (!state.pageInitialized || state.lastPageViewEvent !== settings.pageViewEvent) {
            safeTrack(settings.pageViewEvent, { page_type: settings.pageType });
            state.pageInitialized = true;
            state.lastPageViewEvent = settings.pageViewEvent;
        }
    }

    window.MicroBreaksWebAnalytics = {
        init: init,
        track: safeTrack,
        getConfig: getConfig
    };
})();
