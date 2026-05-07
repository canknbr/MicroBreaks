(function () {
    var MONTHS_PER_YEAR = 12;
    var WEEKS_PER_MONTH = 52 / MONTHS_PER_YEAR;

    function clamp(value, min, max, fallback) {
        if (!Number.isFinite(value)) {
            return fallback;
        }

        return Math.min(max, Math.max(min, value));
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: value >= 1000 ? 0 : 0
        }).format(value);
    }

    function formatNumber(value, maximumFractionDigits) {
        return new Intl.NumberFormat('en-US', {
            maximumFractionDigits: maximumFractionDigits
        }).format(value);
    }

    function getPlan(teamSize) {
        if (teamSize <= 50) {
            return {
                id: 'team_pilot',
                name: 'Team Pilot',
                seats: 'up to 50 seats',
                price: 499
            };
        }

        return {
            id: 'growth_team',
            name: 'Growth Team',
            seats: 'up to 250 seats',
            price: 1499
        };
    }

    function buildModel(inputs) {
        var plan = getPlan(inputs.teamSize);
        var rawActiveParticipants = inputs.teamSize * (inputs.participationRate / 100);
        var activeParticipants = Math.max(1, Math.round(rawActiveParticipants));
        var recoveredHoursPerMonth = (rawActiveParticipants * inputs.recoveredMinutesPerWeek * WEEKS_PER_MONTH) / 60;
        var monthlyValue = recoveredHoursPerMonth * inputs.hourlyCost;
        var paybackMultiple = plan.price > 0 ? (monthlyValue / plan.price) : 0;
        var breakEvenMinutesPerWeek = (rawActiveParticipants > 0 && inputs.hourlyCost > 0)
            ? (plan.price * 60) / (rawActiveParticipants * inputs.hourlyCost * WEEKS_PER_MONTH)
            : 0;

        return {
            inputs: inputs,
            plan: plan,
            activeParticipants: activeParticipants,
            recoveredHoursPerMonth: recoveredHoursPerMonth,
            monthlyValue: monthlyValue,
            paybackMultiple: paybackMultiple,
            breakEvenMinutesPerWeek: breakEvenMinutesPerWeek
        };
    }

    function buildMailtoHref(model) {
        var lines = [
            'Team size: ' + model.inputs.teamSize,
            'Expected weekly participation: ' + model.inputs.participationRate + '%',
            'Recovered focus minutes per active teammate each week: ' + model.inputs.recoveredMinutesPerWeek,
            'Loaded hourly cost: ' + formatCurrency(model.inputs.hourlyCost),
            'Suggested plan: ' + model.plan.name + ' (' + formatCurrency(model.plan.price) + '/mo, ' + model.plan.seats + ')',
            'Active participants: ' + model.activeParticipants,
            'Recovered hours per month: ' + formatNumber(model.recoveredHoursPerMonth, 1),
            'Implied monthly value: ' + formatCurrency(model.monthlyValue),
            'Value vs plan cost: ' + formatNumber(model.paybackMultiple, 1) + 'x',
            'Break-even minutes per active teammate each week: ' + formatNumber(model.breakEvenMinutesPerWeek, 1)
        ];

        return 'mailto:support@microbreaks.app?subject='
            + encodeURIComponent('MicroBreaks Teams ROI Model')
            + '&body='
            + encodeURIComponent(lines.join('\n'));
    }

    function track(eventName, properties) {
        if (window.MicroBreaksWebAnalytics && typeof window.MicroBreaksWebAnalytics.track === 'function') {
            window.MicroBreaksWebAnalytics.track(eventName, properties);
        }
    }

    function init() {
        var teamSizeInput = document.getElementById('roi-team-size');
        var participationInput = document.getElementById('roi-participation-rate');
        var recoveredMinutesInput = document.getElementById('roi-recovered-minutes');
        var hourlyCostInput = document.getElementById('roi-hourly-cost');
        var roiCta = document.getElementById('roi-pilot-cta');

        if (!teamSizeInput || !participationInput || !recoveredMinutesInput || !hourlyCostInput || !roiCta) {
            return;
        }

        var firstInteractionTracked = false;

        function readInputs() {
            return {
                teamSize: clamp(Number(teamSizeInput.value), 15, 250, 40),
                participationRate: clamp(Number(participationInput.value), 25, 90, 55),
                recoveredMinutesPerWeek: clamp(Number(recoveredMinutesInput.value), 4, 30, 8),
                hourlyCost: clamp(Number(hourlyCostInput.value), 20, 250, 45)
            };
        }

        function setText(id, value) {
            var node = document.getElementById(id);
            if (node) {
                node.textContent = value;
            }
        }

        function render(trackUsage) {
            var model = buildModel(readInputs());

            teamSizeInput.value = String(model.inputs.teamSize);
            participationInput.value = String(model.inputs.participationRate);
            recoveredMinutesInput.value = String(model.inputs.recoveredMinutesPerWeek);
            hourlyCostInput.value = String(model.inputs.hourlyCost);

            setText('roi-team-size-value', model.inputs.teamSize + ' people');
            setText('roi-participation-rate-value', model.inputs.participationRate + '%');
            setText('roi-recovered-minutes-value', model.inputs.recoveredMinutesPerWeek + ' minutes');
            setText('roi-hourly-cost-value', formatCurrency(model.inputs.hourlyCost) + '/hour');

            setText('roi-active-participants', model.activeParticipants + ' teammates');
            setText('roi-recovered-hours', formatNumber(model.recoveredHoursPerMonth, 1) + ' hours');
            setText('roi-monthly-value', formatCurrency(model.monthlyValue));
            setText('roi-payback-multiple', formatNumber(model.paybackMultiple, 1) + 'x');
            setText('roi-plan-summary', model.plan.name + ' · ' + formatCurrency(model.plan.price) + '/mo · ' + model.plan.seats);
            setText(
                'roi-break-even-note',
                'The team needs roughly '
                    + formatNumber(model.breakEvenMinutesPerWeek, 1)
                    + ' recovered minutes per active teammate each week to cover the '
                    + model.plan.name.toLowerCase()
                    + '.'
            );

            roiCta.href = buildMailtoHref(model);

            if (trackUsage && !firstInteractionTracked) {
                firstInteractionTracked = true;
                track('teams_roi_calculator_used', {
                    page_type: 'teams',
                    team_size: model.inputs.teamSize,
                    participation_rate: model.inputs.participationRate,
                    recovered_minutes_per_week: model.inputs.recoveredMinutesPerWeek,
                    hourly_cost: model.inputs.hourlyCost,
                    suggested_plan: model.plan.id
                });
            }

            roiCta.dataset.analyticsLabel = 'request_pilot_from_roi_' + model.plan.id;
            roiCta.dataset.analyticsPlan = model.plan.id;
            roiCta.dataset.analyticsValue = String(Math.round(model.monthlyValue));
        }

        [teamSizeInput, participationInput, recoveredMinutesInput].forEach(function (input) {
            input.addEventListener('input', function () {
                render(true);
            });
        });

        hourlyCostInput.addEventListener('input', function () {
            render(true);
        });

        hourlyCostInput.addEventListener('blur', function () {
            render(false);
        });

        roiCta.addEventListener('click', function () {
            var model = buildModel(readInputs());

            track('teams_roi_model_sent', {
                page_type: 'teams',
                suggested_plan: model.plan.id,
                team_size: model.inputs.teamSize,
                participation_rate: model.inputs.participationRate,
                recovered_minutes_per_week: model.inputs.recoveredMinutesPerWeek,
                implied_monthly_value: Math.round(model.monthlyValue),
                payback_multiple: Number(formatNumber(model.paybackMultiple, 2))
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
