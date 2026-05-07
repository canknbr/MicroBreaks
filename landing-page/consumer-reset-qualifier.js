(function () {
    var SYMPTOM_MAP = {
        eye_strain: {
            pack: 'Eye Rescue',
            session: {
                two_minutes: '2-minute visual reset',
                three_minutes: '3-minute eye rescue',
                five_minutes: '5-minute screen recovery'
            },
            trigger: {
                deep_work: 'After each long focus block',
                meeting_heavy: 'After every 2 to 3 meetings',
                all_day_screen: 'Mid-morning and mid-afternoon',
                late_day_crash: 'Before the late-day blur hits'
            }
        },
        neck_shoulders: {
            pack: 'Desk Neck Reset',
            session: {
                two_minutes: '2-minute shoulder release',
                three_minutes: '3-minute desk neck reset',
                five_minutes: '5-minute upper-body reset'
            },
            trigger: {
                deep_work: 'Between deep-work blocks',
                meeting_heavy: 'Right after back-to-back meetings',
                all_day_screen: 'Every long seated stretch',
                late_day_crash: 'When tension starts climbing late in the day'
            }
        },
        posture_fatigue: {
            pack: 'Posture Rescue',
            session: {
                two_minutes: '2-minute posture wake-up',
                three_minutes: '3-minute desk mobility reset',
                five_minutes: '5-minute posture recovery'
            },
            trigger: {
                deep_work: 'After long seated concentration',
                meeting_heavy: 'After a dense meeting block',
                all_day_screen: 'At the first sign of collapse',
                late_day_crash: 'Before the afternoon slump locks in'
            }
        },
        focus_drop: {
            pack: 'Focus Reset',
            session: {
                two_minutes: '2-minute focus re-entry',
                three_minutes: '3-minute mental reset',
                five_minutes: '5-minute calm re-entry'
            },
            trigger: {
                deep_work: 'When re-entering after a hard task',
                meeting_heavy: 'Between meetings and deep work',
                all_day_screen: 'When attention starts fragmenting',
                late_day_crash: 'At the first attention dip'
            }
        },
        energy_dip: {
            pack: 'Energy Lift',
            session: {
                two_minutes: '2-minute energy lift',
                three_minutes: '3-minute posture and breath lift',
                five_minutes: '5-minute afternoon reset'
            },
            trigger: {
                deep_work: 'Before a heavy second work block',
                meeting_heavy: 'Between dense meetings',
                all_day_screen: 'When the whole day feels flat',
                late_day_crash: 'At the start of the 3 PM drop'
            }
        }
    };

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

    function track(eventName, properties) {
        if (window.MicroBreaksWebAnalytics && typeof window.MicroBreaksWebAnalytics.track === 'function') {
            window.MicroBreaksWebAnalytics.track(eventName, properties);
        }
    }

    function getRhythm(goal, symptom, workday, windowKey) {
        if (goal === 'relief') {
            return 'Start with 1 ' + windowKey.replace('_', ' ') + ' session at the heaviest point of the day';
        }

        if (goal === 'consistency') {
            if (workday === 'meeting_heavy') {
                return 'Anchor 1 reset after the busiest meeting block every day';
            }

            if (workday === 'all_day_screen') {
                return 'Use 2 scheduled resets: one before lunch and one late afternoon';
            }

            return 'Tie 1 daily reset to the same work block until it becomes automatic';
        }

        if (symptom === 'focus_drop' || symptom === 'energy_dip') {
            return 'Use the reset before re-entry so attention comes back cleaner, not later';
        }

        return 'Relieve the strain first, then reuse the same trigger tomorrow';
    }

    function getInputs() {
        return {
            symptom: getValue('qualifier-symptom', 'eye_strain'),
            workday: getValue('qualifier-workday', 'deep_work'),
            windowKey: getValue('qualifier-window', 'two_minutes'),
            goal: getValue('qualifier-goal', 'relief')
        };
    }

    function buildModel(inputs) {
        var symptomConfig = SYMPTOM_MAP[inputs.symptom] || SYMPTOM_MAP.eye_strain;
        var pack = symptomConfig.pack;
        var session = symptomConfig.session[inputs.windowKey] || symptomConfig.session.two_minutes;
        var trigger = symptomConfig.trigger[inputs.workday] || symptomConfig.trigger.deep_work;
        var rhythm = getRhythm(inputs.goal, inputs.symptom, inputs.workday, inputs.windowKey);

        return {
            inputs: inputs,
            pack: pack,
            session: session,
            trigger: trigger,
            rhythm: rhythm
        };
    }

    function getReadableValues(model) {
        return {
            symptom: {
                eye_strain: 'Eyes burn or blur',
                neck_shoulders: 'Neck and shoulders tighten',
                posture_fatigue: 'Posture collapses after sitting',
                focus_drop: 'Focus drops after long work blocks',
                energy_dip: 'Energy falls apart in the afternoon'
            }[model.inputs.symptom] || model.inputs.symptom,
            workday: {
                deep_work: 'Long deep-work blocks',
                meeting_heavy: 'Back-to-back meetings',
                all_day_screen: 'All-day screen time',
                late_day_crash: 'Late-day fatigue'
            }[model.inputs.workday] || model.inputs.workday,
            window: {
                two_minutes: '2 minutes',
                three_minutes: '3 minutes',
                five_minutes: '5 minutes'
            }[model.inputs.windowKey] || model.inputs.windowKey,
            goal: {
                relief: 'Fast physical relief',
                consistency: 'A repeatable work rhythm',
                focus: 'Cleaner focus re-entry'
            }[model.inputs.goal] || model.inputs.goal
        };
    }

    function buildMailto(model) {
        var readable = getReadableValues(model);
        var lines = [
            'Primary symptom: ' + readable.symptom,
            'Workday pattern: ' + readable.workday,
            'Typical reset window: ' + readable.window,
            'Main goal: ' + readable.goal,
            'Recommended pack: ' + model.pack,
            'Best first session: ' + model.session,
            'Best workday trigger: ' + model.trigger,
            'Starter rhythm: ' + model.rhythm
        ];

        return 'mailto:support@microbreaks.app?subject='
            + encodeURIComponent('MicroBreaks launch updates - ' + model.pack)
            + '&body='
            + encodeURIComponent(lines.join('\n'));
    }

    function init() {
        var ids = [
            'qualifier-symptom',
            'qualifier-workday',
            'qualifier-window',
            'qualifier-goal'
        ];
        var nodes = ids
            .map(function (id) { return document.getElementById(id); })
            .filter(Boolean);
        var cta = document.getElementById('qualifier-cta');

        if (nodes.length !== ids.length || !cta) {
            return;
        }

        var trackedFirstUse = false;

        function render(shouldTrack) {
            var model = buildModel(getInputs());

            setText('qualifier-pack', model.pack);
            setText('qualifier-session', model.session);
            setText('qualifier-trigger', model.trigger);
            setText('qualifier-rhythm', model.rhythm);
            cta.href = buildMailto(model);
            cta.dataset.analyticsLabel = 'launch_updates_from_qualifier_' + model.pack.toLowerCase().replace(/\s+/g, '_');

            if (shouldTrack && !trackedFirstUse) {
                trackedFirstUse = true;
                track('landing_qualifier_started', {
                    page_type: 'consumer',
                    symptom: model.inputs.symptom,
                    workday: model.inputs.workday,
                    time_window: model.inputs.windowKey,
                    goal: model.inputs.goal,
                    recommended_pack: model.pack
                });
            }
        }

        nodes.forEach(function (node) {
            node.addEventListener('input', function () {
                render(true);
            });
            node.addEventListener('change', function () {
                render(true);
            });
        });

        cta.addEventListener('click', function () {
            var model = buildModel(getInputs());

            track('landing_qualifier_lead_sent', {
                page_type: 'consumer',
                symptom: model.inputs.symptom,
                workday: model.inputs.workday,
                time_window: model.inputs.windowKey,
                goal: model.inputs.goal,
                recommended_pack: model.pack
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
