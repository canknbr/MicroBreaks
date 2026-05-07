(function () {
    function getConfig() {
        return Object.assign({
            defaults: {},
            debugConsole: false
        }, window.MICROBREAKS_EXPERIMENTS || {});
    }

    function log() {
        var config = getConfig();
        if (!config.debugConsole || typeof console === 'undefined') {
            return;
        }

        var args = Array.prototype.slice.call(arguments);
        args.unshift('[MicroBreaks Web Experiments]');
        console.log.apply(console, args);
    }

    function setText(id, value) {
        var node = document.getElementById(id);
        if (!node || typeof value !== 'string') {
            return;
        }
        node.textContent = value;
    }

    function trackExposure(experimentName, variantId, pageType) {
        try {
            if (window.MicroBreaksWebAnalytics && typeof window.MicroBreaksWebAnalytics.track === 'function') {
                window.MicroBreaksWebAnalytics.track('web_copy_variant_seen', {
                    experiment_name: experimentName,
                    variant_id: variantId,
                    page_type: pageType
                });
            }
        } catch (error) {
            log('track exposure failed', experimentName, variantId, error);
        }
    }

    var experiments = {
        consumer_hero_message: {
            pageType: 'consumer',
            variants: {
                control: {
                    eyebrow: 'Desk recovery for remote and hybrid work',
                    title: '2-minute resets for eyes, neck, posture, and focus.',
                    body: 'MicroBreaks helps desk workers interrupt screen strain before it turns into stiff shoulders, tired eyes, and a wrecked afternoon.'
                },
                pain: {
                    eyebrow: 'Interrupt workday strain early',
                    title: 'Interrupt screen strain before it wrecks your afternoon.',
                    body: 'MicroBreaks gives desk workers short guided resets for the moment eyes burn, shoulders tighten, posture collapses, or focus starts slipping.'
                },
                category: {
                    eyebrow: 'Desk recovery for remote and hybrid work',
                    title: 'Desk recovery for screen-heavy workdays.',
                    body: 'MicroBreaks turns eye strain, neck tension, posture fatigue, and focus drops into guided 2 to 5 minute recovery moments you can actually fit into the day.'
                }
            },
            apply: function (variant) {
                setText('consumer-hero-eyebrow', variant.eyebrow);
                setText('consumer-hero-title', variant.title);
                setText('consumer-hero-body', variant.body);
            }
        },
        teams_hero_message: {
            pageType: 'teams',
            variants: {
                control: {
                    eyebrow: 'Pilot-ready desk recovery for remote and hybrid teams',
                    title: 'Help your team recover from screen-heavy work without killing focus.',
                    body: 'MicroBreaks for Teams is the B2B layer on top of the desk-recovery product: guided resets for strain, plus weekly recovery visibility for people, ops, and team leads.'
                },
                manager: {
                    eyebrow: 'A calmer recovery layer for teams',
                    title: 'Reduce screen strain across the team without adding more noise.',
                    body: 'MicroBreaks for Teams gives employees guided recovery resets while giving managers and people teams a weekly view of whether the rhythm is actually forming.'
                },
                pilot: {
                    eyebrow: 'Pilot-ready for remote and hybrid teams',
                    title: 'Run a desk-recovery pilot your team will actually use.',
                    body: 'Start with a small team, prove the recovery habit, and review the weekly rhythm before asking anyone to believe a broad enterprise wellness story.'
                }
            },
            apply: function (variant) {
                setText('teams-hero-eyebrow', variant.eyebrow);
                setText('teams-hero-title', variant.title);
                setText('teams-hero-body', variant.body);
            }
        }
    };

    function getVariantId(experimentName) {
        var config = getConfig();
        var params = new URLSearchParams(window.location.search);
        var paramKey = 'exp_' + experimentName;
        return params.get(paramKey) || config.defaults[experimentName] || 'control';
    }

    function init(options) {
        var settings = Object.assign({
            pageType: 'unknown'
        }, options || {});

        Object.keys(experiments).forEach(function (experimentName) {
            var experiment = experiments[experimentName];
            if (experiment.pageType !== settings.pageType) {
                return;
            }

            var variantId = getVariantId(experimentName);
            var variant = experiment.variants[variantId] || experiment.variants.control;
            var resolvedVariantId = experiment.variants[variantId] ? variantId : 'control';

            experiment.apply(variant);
            trackExposure(experimentName, resolvedVariantId, settings.pageType);
            log('applied', experimentName, resolvedVariantId);
        });
    }

    window.MicroBreaksWebExperiments = {
        init: init
    };
})();
