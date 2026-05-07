(function () {
    var TEAM_SIZE_PLAN_MAP = {
        '15_30': {
            teamSizeLabel: '15-30 people',
            planId: 'team_pilot',
            planSummary: 'Team Pilot · $499/mo · up to 50 seats',
            defaultLength: 'Start with a 2-week pilot'
        },
        '31_50': {
            teamSizeLabel: '31-50 people',
            planId: 'team_pilot',
            planSummary: 'Team Pilot · $499/mo · up to 50 seats',
            defaultLength: 'Start with a 2-week pilot'
        },
        '51_120': {
            teamSizeLabel: '51-120 people',
            planId: 'growth_team',
            planSummary: 'Growth Team · $1,499/mo · up to 250 seats',
            defaultLength: 'Start with a 4-week pilot'
        },
        '121_250': {
            teamSizeLabel: '121-250 people',
            planId: 'growth_team',
            planSummary: 'Growth Team · $1,499/mo · up to 250 seats',
            defaultLength: 'Start with a 4-week pilot'
        }
    };

    var STRAIN_MAP = {
        eye_strain: 'Screen-heavy eye strain recovery',
        neck_shoulders: 'Meeting-heavy neck and shoulder recovery',
        posture_fatigue: 'Posture fatigue across long desk blocks',
        focus_drop: 'Late-day focus recovery between work blocks'
    };

    var TIMELINE_FIT_MAP = {
        within_2_weeks: 'Good early-fit pilot',
        this_month: 'Good early-fit pilot',
        this_quarter: 'Needs stronger internal timing',
        exploratory: 'Exploratory lead, not a close-ready pilot'
    };

    function track(eventName, properties) {
        if (window.MicroBreaksWebAnalytics && typeof window.MicroBreaksWebAnalytics.track === 'function') {
            window.MicroBreaksWebAnalytics.track(eventName, properties);
        }
    }

    function getValue(id, fallback) {
        var node = document.getElementById(id);
        if (!node || typeof node.value !== 'string' || node.value === '') {
            return fallback;
        }

        return node.value;
    }

    function setText(id, value) {
        var node = document.getElementById(id);
        if (node) {
            node.textContent = value;
        }
    }

    function getModel() {
        var buyerRole = getValue('pilot-buyer-role', 'people_ops');
        var workStyle = getValue('pilot-work-style', 'remote');
        var seatBand = getValue('pilot-seat-band', '31_50');
        var strainPattern = getValue('pilot-strain-pattern', 'eye_strain');
        var timeline = getValue('pilot-timeline', 'this_month');
        var owner = getValue('pilot-owner', 'clear_owner');
        var context = getValue('pilot-context', '').trim();

        var plan = TEAM_SIZE_PLAN_MAP[seatBand] || TEAM_SIZE_PLAN_MAP['31_50'];
        var problemSummary = STRAIN_MAP[strainPattern] || STRAIN_MAP.eye_strain;
        var fitSummary = TIMELINE_FIT_MAP[timeline] || TIMELINE_FIT_MAP.this_month;
        var suggestedLength = plan.defaultLength;

        if (owner === 'needs_owner') {
            fitSummary = 'Needs owner alignment before a pilot';
        }

        if (timeline === 'exploratory') {
            suggestedLength = 'Start with a discovery call, not a priced pilot';
        }

        return {
            buyerRole: buyerRole,
            workStyle: workStyle,
            seatBand: seatBand,
            strainPattern: strainPattern,
            timeline: timeline,
            owner: owner,
            context: context,
            plan: plan,
            problemSummary: problemSummary,
            fitSummary: fitSummary,
            suggestedLength: suggestedLength
        };
    }

    function getLabelMaps() {
        return {
            buyerRole: {
                people_ops: 'People Ops / HR',
                founder_ops: 'Founder / Operations',
                team_manager: 'Team manager',
                it_workplace: 'IT / Workplace'
            },
            workStyle: {
                remote: 'Remote-first',
                hybrid: 'Hybrid',
                distributed_shift: 'Distributed shift team',
                office_heavy: 'Office-heavy'
            },
            timeline: {
                within_2_weeks: 'Within 2 weeks',
                this_month: 'This month',
                this_quarter: 'This quarter',
                exploratory: 'Exploratory only'
            },
            owner: {
                clear_owner: 'Clear owner identified',
                shared_owner: 'Shared between manager and ops',
                needs_owner: 'Still needs an owner'
            }
        };
    }

    function buildMailto(model) {
        var labelMaps = getLabelMaps();
        var lines = [
            'Buyer role: ' + (labelMaps.buyerRole[model.buyerRole] || model.buyerRole),
            'Work style: ' + (labelMaps.workStyle[model.workStyle] || model.workStyle),
            'Pilot team size: ' + model.plan.teamSizeLabel,
            'Main strain pattern: ' + model.problemSummary,
            'Timeline: ' + (labelMaps.timeline[model.timeline] || model.timeline),
            'Internal owner: ' + (labelMaps.owner[model.owner] || model.owner),
            'Suggested commercial shape: ' + model.plan.planSummary,
            'Qualification signal: ' + model.fitSummary,
            'Suggested pilot length: ' + model.suggestedLength
        ];

        if (model.context) {
            lines.push('Workday context: ' + model.context);
        }

        return 'mailto:support@microbreaks.app?subject='
            + encodeURIComponent('MicroBreaks Teams Pilot Brief')
            + '&body='
            + encodeURIComponent(lines.join('\n'));
    }

    function init() {
        var formIds = [
            'pilot-buyer-role',
            'pilot-work-style',
            'pilot-seat-band',
            'pilot-strain-pattern',
            'pilot-timeline',
            'pilot-owner',
            'pilot-context'
        ];
        var inputNodes = formIds
            .map(function (id) { return document.getElementById(id); })
            .filter(Boolean);
        var cta = document.getElementById('pilot-brief-cta');

        if (inputNodes.length !== formIds.length || !cta) {
            return;
        }

        var trackedFirstUse = false;

        function render(shouldTrack) {
            var model = getModel();

            setText('pilot-plan-summary', model.plan.planSummary);
            setText('pilot-fit-summary', model.fitSummary);
            setText('pilot-problem-summary', model.problemSummary);
            setText('pilot-length-summary', model.suggestedLength);

            cta.href = buildMailto(model);
            cta.dataset.analyticsLabel = 'send_pilot_brief_' + model.plan.planId;
            cta.dataset.analyticsPlan = model.plan.planId;
            cta.dataset.analyticsTimeline = model.timeline;

            if (shouldTrack && !trackedFirstUse) {
                trackedFirstUse = true;
                track('teams_intake_started', {
                    page_type: 'teams',
                    suggested_plan: model.plan.planId,
                    seat_band: model.seatBand,
                    strain_pattern: model.strainPattern,
                    timeline: model.timeline
                });
            }
        }

        inputNodes.forEach(function (node) {
            node.addEventListener('input', function () {
                render(true);
            });
            node.addEventListener('change', function () {
                render(true);
            });
        });

        cta.addEventListener('click', function () {
            var model = getModel();

            track('teams_pilot_brief_sent', {
                page_type: 'teams',
                suggested_plan: model.plan.planId,
                seat_band: model.seatBand,
                strain_pattern: model.strainPattern,
                timeline: model.timeline,
                owner: model.owner,
                has_context: model.context.length > 0
            });
        });

        render(false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
        return;
    }

    init();
})();
