// Данные программы тренировок
const workoutProgram = {
    A: {
        name: "День А - Тяжёлый жим",
        emoji: "🔥",
        exercises: [
            {
                id: "bench_press",
                name: "Жим штанги лёжа",
                emoji: "💪",
                sets: 4,
                reps: "6-10",
                technique: "Лёжа на скамье, ноги упёрты в пол. Опускай штангу к середине груди, локти под углом 45°. Мощно выжимай вверх, сводя лопатки. Держи ягодицы на скамье.",
                youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
                muscleGroups: "Грудь, трицепс, передние дельты"
            },
            {
                id: "leg_press",
                name: "Жим ногами в тренажёре",
                emoji: "🦵",
                sets: 3,
                reps: "8-12",
                technique: "Ступни на ширине плеч, в середине платформы. Опускай платформу до угла 90° в коленях. Выжимай пятками, не отрывая поясницу от спинки.",
                youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
                muscleGroups: "Квадрицепсы, ягодицы, приводящие"
            },
            {
                id: "lat_pulldown",
                name: "Тяга вертикального блока к груди",
                emoji: "🎯",
                sets: 3,
                reps: "8-12",
                technique: "Широкий хват, тяни локти вниз и назад к поясу. Своди лопатки в нижней точке. Контролируй негативную фазу.",
                youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
                muscleGroups: "Широчайшие спины, бицепс"
            },
            {
                id: "shoulder_press_machine",
                name: "Жим сидя в тренажёре для плеч",
                emoji: "🏋️",
                sets: 3,
                reps: "8-12",
                technique: "Сидя с опорой на спинку, выжимай рукоятки вверх. Контролируй опускание, не бросай вес.",
                youtubeUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
                muscleGroups: "Средние и передние дельты, трицепс"
            },
            {
                id: "tricep_pushdown",
                name: "Разгибания на трицепс в верхнем блоке",
                emoji: "⚡",
                sets: 3,
                reps: "10-15",
                technique: "Разгибай руки полностью, фиксируя локти. Медленно сгибай, чувствуя растяжение трицепса. Не разводи локти.",
                youtubeUrl: "https://www.youtube.com/watch?v=-Vyt2QdsR7E",
                muscleGroups: "Трицепс"
            },
            {
                id: "leg_curl",
                name: "Сгибания ног лёжа",
                emoji: "🔄",
                sets: 3,
                reps: "12-15",
                technique: "Сгибай ноги максимально, задержись в пиковом сокращении. Контролируй возврат в исходное положение.",
                youtubeUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
                muscleGroups: "Бицепс бедра"
            },
            {
                id: "calf_raise",
                name: "Икры в тренажёре",
                emoji: "🦿",
                sets: 3,
                reps: "12-15",
                technique: "Поднимайся на носки максимально высоко, задержись на секунду. Опускайся до полного растяжения икр.",
                youtubeUrl: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
                muscleGroups: "Икроножные мышцы"
            }
        ]
    },
    B: {
        name: "День Б - Объёмный жим + горизонтальная тяга",
        emoji: "💪",
        exercises: [
            {
                id: "bench_press_b",
                name: "Жим штанги лёжа",
                emoji: "💪",
                sets: 4,
                reps: "8-12",
                technique: "Лёжа на скамье, ноги упёрты в пол. Опускай штангу к середине груди, локти под углом 45°. Мощно выжимай вверх, сводя лопатки.",
                youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
                muscleGroups: "Грудь, трицепс, передние дельты"
            },
            {
                id: "leg_extension",
                name: "Разгибания ног в тренажёре",
                emoji: "⚡",
                sets: 4,
                reps: "12-15",
                technique: "Спина прижата к спинке, разгибай ноги полностью, задержись на секунду. Медленно опускай, не бросай вес.",
                youtubeUrl: "https://www.youtube.com/watch?v=YyvSfVjQeL0",
                muscleGroups: "Квадрицепсы"
            },
            {
                id: "cable_row",
                name: "Тяга горизонтального блока",
                emoji: "🎯",
                sets: 3,
                reps: "8-12",
                technique: "Тяни рукоятку к низу живота, сводя лопатки. Локти вдоль корпуса, спина прямая. Контролируй возврат.",
                youtubeUrl: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ",
                muscleGroups: "Широчайшие спины, ромбовидные, задние дельты"
            },
            {
                id: "pec_deck",
                name: "Сведение рук в «Бабочке» (Pec-Deck)",
                emoji: "🏋️",
                sets: 3,
                reps: "10-12",
                technique: "Своди рукоятки перед собой, напрягая грудь. Контролируй разведение, чувствуя растяжение.",
                youtubeUrl: "https://www.youtube.com/watch?v=eozdVDA78K0",
                muscleGroups: "Грудь, преимущественно внутренняя часть"
            },
            {
                id: "lateral_raise",
                name: "Махи в стороны на дельты",
                emoji: "🔥",
                sets: 3,
                reps: "12-15",
                technique: "Стоя, поднимай гантели через стороны до уровня плеч. Локти слегка согнуты, ведущие. Контролируй опускание.",
                youtubeUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
                muscleGroups: "Средние дельты"
            },
            {
                id: "barbell_curl",
                name: "Сгибания рук на бицепс со штангой",
                emoji: "💪",
                sets: 3,
                reps: "10-15",
                technique: "Стоя, сгибай руки, поднимая штангу к плечам. Локти зафиксированы, не раскачивайся. Контролируй опускание.",
                youtubeUrl: "https://www.youtube.com/watch?v=kwG2ipFRgfo",
                muscleGroups: "Бицепс"
            },
            {
                id: "hyperextension",
                name: "Гиперэкстензия",
                emoji: "🔄",
                sets: 3,
                reps: "12-15",
                technique: "Опускайся вниз до угла 90°, поднимайся до прямой линии тела. Не переразгибайся. Можно держать блин у груди.",
                youtubeUrl: "https://www.youtube.com/watch?v=ph3pddpKzzw",
                muscleGroups: "Нижняя часть спины, ягодицы, бицепс бедра"
            }
        ]
    },
    C: {
        name: "День В - Средний + акцент на ноги",
        emoji: "⚡",
        exercises: [
            {
                id: "bench_press_c",
                name: "Жим штанги лёжа",
                emoji: "💪",
                sets: 3,
                reps: "8-10",
                technique: "Лёжа на скамье, опускай штангу к середине груди. Выжимай плавно, без максимальных усилий. Фокус на технике.",
                youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
                muscleGroups: "Грудь, трицепс, передние дельты"
            },
            {
                id: "leg_press_c",
                name: "Жим ногами в тренажёре",
                emoji: "🦵",
                sets: 4,
                reps: "10-12",
                technique: "Ступни на ширине плеч. Опускай до 90°, выжимай пятками. Поясница прижата.",
                youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
                muscleGroups: "Квадрицепсы, ягодицы, приводящие"
            },
            {
                id: "lat_pulldown_c",
                name: "Тяга вертикального блока",
                emoji: "🎯",
                sets: 3,
                reps: "8-12",
                technique: "Обратный или широкий хват. Тяни к верху груди, сводя лопатки. Контролируй возврат.",
                youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
                muscleGroups: "Широчайшие спины, бицепс"
            },
            {
                id: "shoulder_press_machine_c",
                name: "Жим сидя в тренажёре для плеч",
                emoji: "🏋️",
                sets: 3,
                reps: "8-12",
                technique: "Сидя с опорой на спинку, выжимай рукоятки вверх. Контролируй опускание.",
                youtubeUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog",
                muscleGroups: "Средние и передние дельты, трицепс"
            },
            {
                id: "tricep_extension_c",
                name: "Разгибания на трицепс",
                emoji: "⚡",
                sets: 3,
                reps: "10-15",
                technique: "Разгибай руки полностью, фиксируя локти. Медленно сгибай, чувствуя растяжение трицепса.",
                youtubeUrl: "https://www.youtube.com/watch?v=-Vyt2QdsR7E",
                muscleGroups: "Трицепс"
            },
            {
                id: "leg_curl_c",
                name: "Сгибания ног лёжа",
                emoji: "🔄",
                sets: 3,
                reps: "12-15",
                technique: "Сгибай максимально, задержись в пике. Контролируй возврат.",
                youtubeUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
                muscleGroups: "Бицепс бедра"
            },
            {
                id: "shrugs",
                name: "Шраги",
                emoji: "🏋️",
                sets: 3,
                reps: "10-12",
                technique: "Держи гантели или штангу, поднимай плечи вверх. Задержись в верхней точке, медленно опускай.",
                youtubeUrl: "https://www.youtube.com/watch?v=cJRVVxmytaM",
                muscleGroups: "Трапеции"
            },
            {
                id: "calf_raise_c",
                name: "Икры в тренажёре",
                emoji: "🦿",
                sets: 3,
                reps: "12-15",
                technique: "Поднимайся максимально высоко, задержись. Опускайся до полного растяжения.",
                youtubeUrl: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
                muscleGroups: "Икроножные мышцы"
            }
        ]
    }
};

// Full Body программа с акцентом на тренажёры и объём
const fullBodyPlusProgram = {
    A: {
        name: "Full Body A — силовой акцент",
        emoji: "🔥",
        exercises: [
            {
                id: "fb_plus_bench_press",
                name: "Жим штанги лёжа",
                emoji: "💪",
                sets: 3,
                reps: "6-10",
                technique: "Главный жим недели. Лопатки сведены, стопы упираются в пол, штанга идёт к середине груди.",
                youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg",
                muscleGroups: "Грудь, трицепс, передние дельты"
            },
            {
                id: "fb_plus_leg_press_a",
                name: "Жим ногами",
                emoji: "🦵",
                sets: 3,
                reps: "8-12",
                technique: "Не отрывай таз, поясница и ягодицы прижаты. Выжимай платформу пятками без рывков.",
                youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
                muscleGroups: "Квадрицепсы, ягодицы, приводящие"
            },
            {
                id: "fb_plus_lat_pulldown",
                name: "Тяга вертикального блока к груди",
                emoji: "🎯",
                sets: 3,
                reps: "8-12",
                technique: "Тяни локтями вниз, а не кистями. Внизу мягко своди лопатки и контролируй возврат.",
                youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
                muscleGroups: "Широчайшие спины, бицепс"
            },
            {
                id: "fb_plus_leg_curl_a",
                name: "Сгибание ног лёжа",
                emoji: "🔄",
                sets: 3,
                reps: "10-15",
                technique: "Контроль по всей амплитуде, без рывков. В верхней точке можно коротко зафиксировать сокращение.",
                youtubeUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
                muscleGroups: "Бицепс бедра"
            },
            {
                id: "fb_plus_lateral_raise",
                name: "Махи в стороны",
                emoji: "🏋️",
                sets: 3,
                reps: "12-20",
                technique: "Лучше легче, но чище. Поднимай через стороны без раскачки корпуса.",
                youtubeUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
                muscleGroups: "Средние дельты"
            },
            {
                id: "fb_plus_tricep_pushdown",
                name: "Разгибание на трицепс в блоке",
                emoji: "⚡",
                sets: 2,
                reps: "10-15",
                technique: "Без залома кистей. Локти держи рядом с корпусом и разгибай руки до конца.",
                youtubeUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU",
                muscleGroups: "Трицепс"
            },
            {
                id: "fb_plus_cable_crunch",
                name: "Скручивания на блоке",
                emoji: "🧘",
                sets: 3,
                reps: "10-15",
                technique: "Рёбра тяни к тазу, а не просто опускай руки. Держи пресс в постоянном напряжении.",
                muscleGroups: "Прямая мышца живота"
            }
        ]
    },
    B: {
        name: "Full Body B — спина/ноги/грудь в тренажёрах",
        emoji: "🎯",
        exercises: [
            {
                id: "fb_plus_chest_supported_row",
                name: "Тяга с упором грудью",
                emoji: "🎯",
                sets: 3,
                reps: "8-12",
                technique: "Главный акцент на спину. Не дёргай корпусом, тяни локти назад и своди лопатки.",
                muscleGroups: "Широчайшие, ромбовидные, задние дельты"
            },
            {
                id: "fb_plus_leg_extension",
                name: "Разгибание ног",
                emoji: "⚡",
                sets: 3,
                reps: "10-15",
                technique: "В верхней точке сделай паузу 1 секунду. Опускай вес плавно и не бросай.",
                youtubeUrl: "https://www.youtube.com/watch?v=YyvSfVjQeL0",
                muscleGroups: "Квадрицепсы"
            },
            {
                id: "fb_plus_hammer_press",
                name: "Жим в хаммере от груди",
                emoji: "💪",
                sets: 3,
                reps: "8-12",
                technique: "Жми без боли в кистях, подбери удобную ширину хвата и не выворачивай запястья.",
                youtubeUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
                muscleGroups: "Грудь, трицепс, передние дельты"
            },
            {
                id: "fb_plus_hyperextension",
                name: "Гиперэкстензия",
                emoji: "🔄",
                sets: 3,
                reps: "12-15",
                technique: "Работай ягодицами и спиной, но не ломай поясницу. Поднимайся до прямой линии корпуса.",
                youtubeUrl: "https://www.youtube.com/watch?v=ph3pddpKzzw",
                muscleGroups: "Разгибатели спины, ягодицы, бицепс бедра"
            },
            {
                id: "fb_plus_pec_deck",
                name: "Pec Deck",
                emoji: "🏋️",
                sets: 2,
                reps: "10-15",
                technique: "Контроль без глубокого провала. Своди руки перед собой и мягко растягивай грудь на возврате.",
                youtubeUrl: "https://www.youtube.com/watch?v=Z57CtFmRMxA",
                muscleGroups: "Грудь"
            },
            {
                id: "fb_plus_rope_hammer_curl",
                name: "Молотковые сгибания с канатом",
                emoji: "🔨",
                sets: 3,
                reps: "10-15",
                technique: "Хорошо для кистей: запястья нейтральные, локти у корпуса, движение без раскачки.",
                muscleGroups: "Бицепс, брахиалис, предплечья"
            },
            {
                id: "fb_plus_pallof_press",
                name: "Pallof press в кроссовере",
                emoji: "🧘",
                sets: 3,
                reps: "10-12 на сторону",
                technique: "Анти-ротация для кора: корпус неподвижен, таз стабилен, выжимай рукоять строго перед собой.",
                muscleGroups: "Кор, косые мышцы живота"
            }
        ]
    },
    C: {
        name: "Full Body C — объёмный акцент",
        emoji: "✨",
        exercises: [
            {
                id: "fb_plus_leg_press_c",
                name: "Жим ногами",
                emoji: "🦵",
                sets: 3,
                reps: "10-15",
                technique: "Чуть легче, чем в дне A. Спина прижата, движение плавное, без отбива внизу.",
                youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
                muscleGroups: "Квадрицепсы, ягодицы, приводящие"
            },
            {
                id: "fb_plus_seated_row",
                name: "Тяга горизонтального блока",
                emoji: "🎯",
                sets: 3,
                reps: "8-12",
                technique: "Сделай паузу в сведении лопаток. Не отклоняйся назад сильнее, чем нужно для контроля.",
                youtubeUrl: "https://www.youtube.com/watch?v=UCXxvVItLoM",
                muscleGroups: "Широчайшие, ромбовидные, задние дельты"
            },
            {
                id: "fb_plus_machine_chest_press",
                name: "Жим в хаммере / тренажёре",
                emoji: "💪",
                sets: 3,
                reps: "10-12",
                technique: "Не штанга: здесь нужен ровный объёмный жим с комфортной траекторией и полным контролем.",
                youtubeUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ",
                muscleGroups: "Грудь, трицепс"
            },
            {
                id: "fb_plus_leg_curl_c",
                name: "Сгибание ног лёжа",
                emoji: "🔄",
                sets: 2,
                reps: "12-15",
                technique: "Медленно вниз, без потери натяжения. Вверх поднимай только за счёт задней поверхности бедра.",
                youtubeUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs",
                muscleGroups: "Бицепс бедра"
            },
            {
                id: "fb_plus_reverse_pec_deck",
                name: "Обратный Pec Deck",
                emoji: "🏋️",
                sets: 3,
                reps: "12-20",
                technique: "Работай задней дельтой и осанкой, не поднимай плечи к ушам.",
                muscleGroups: "Задние дельты, верх спины"
            },
            {
                id: "fb_plus_calf_raise",
                name: "Икры в тренажёре",
                emoji: "🦿",
                sets: 3,
                reps: "12-15",
                technique: "Полная амплитуда: высокая фиксация наверху и хорошее растяжение внизу.",
                youtubeUrl: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
                muscleGroups: "Икроножные мышцы"
            },
            {
                id: "fb_plus_dead_bug",
                name: "Dead bug",
                emoji: "🧘",
                sets: 3,
                reps: "8-10 на сторону",
                technique: "Поясница прижата к полу. Двигай руками и ногами медленно, не теряя контроля корпуса.",
                muscleGroups: "Кор, пресс, стабилизаторы"
            }
        ]
    },
    D: {
        name: "Опциональный 4-й день — не силовой",
        emoji: "🚶",
        exercises: [
            {
                id: "fb_plus_incline_walk",
                name: "Прогулка или дорожка под наклоном",
                emoji: "🚶",
                sets: 1,
                reps: "30-45 мин",
                technique: "Это не ещё одна силовая тренировка. Иди в умеренном темпе 30-45 минут, чтобы разгрузить голову, спину и накопленную усталость."
            },
            {
                id: "fb_plus_plank",
                name: "Планка",
                emoji: "🧘",
                sets: 3,
                reps: "30-45 сек",
                technique: "Держи корпус прямым, не проваливай поясницу и не задирай таз.",
                muscleGroups: "Кор, пресс"
            },
            {
                id: "fb_plus_bird_dog",
                name: "Bird dog",
                emoji: "🎯",
                sets: 3,
                reps: "8-10 на сторону",
                technique: "Тянись рукой и ногой в разные стороны, поясница нейтральна, движение медленное и подконтрольное.",
                muscleGroups: "Кор, разгибатели спины, ягодицы"
            },
            {
                id: "fb_plus_face_pull_light",
                name: "Face pull легко",
                emoji: "🏋️",
                sets: 2,
                reps: "15-20",
                technique: "Лёгкий вес, локти высоко, лопатки своди мягко. Цель не убиться, а разгрузить плечевой пояс.",
                muscleGroups: "Задние дельты, верх спины"
            },
            {
                id: "fb_plus_mobility",
                name: "Растяжка грудных и сгибателей бедра",
                emoji: "✨",
                sets: 1,
                reps: "5-7 мин",
                technique: "Спокойная растяжка в конце. Если усталость высокая, можно оставить только прогулку.",
                muscleGroups: "Мобилизация и восстановление"
            }
        ]
    }
};

// Программа для ягодиц и ног
const glutesProgram = {
    A: {
        name: "День А - Акцент на Ягодицы + Задняя поверхность бедра",
        emoji: "🍑",
        exercises: [
            {
                id: "glute_bridge",
                name: "Ягодичный мост",
                emoji: "🍑",
                sets: 4,
                reps: "10-12",
                technique: "Со штангой или в тренажёре. Вверху сильно сжимай ягодицы 2 сек.",
                youtubeUrl: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E",
                muscleGroups: "Большая ягодичная, задняя поверхность бедра"
            },
            {
                id: "romanian_deadlift",
                name: "Румынская тяга",
                emoji: "💪",
                sets: 4,
                reps: "10-12",
                technique: "Лёгкий наклон вперёд, спина ровная. Чувствуй растяжение задней поверхности.",
                youtubeUrl: "https://www.youtube.com/watch?v=SHsUIZiNdeY",
                muscleGroups: "Задняя поверхность бедра, ягодицы"
            },
            {
                id: "bulgarian_split",
                name: "Болгарские приседания",
                emoji: "🦵",
                sets: 3,
                reps: "10-12 на каждую",
                technique: "Задняя нога на скамье. Опускайся до параллели, акцент на переднюю ногу.",
                youtubeUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
                muscleGroups: "Ягодицы, квадрицепсы"
            },
            {
                id: "kickback",
                name: "Отведение ноги назад",
                emoji: "🎯",
                sets: 3,
                reps: "12-15 на каждую",
                technique: "В кроссовере или тренажёре. С лёгким наклоном корпуса.",
                youtubeUrl: "https://www.youtube.com/watch?v=SFl2iMJRJYQ",
                muscleGroups: "Большая ягодичная мышца"
            },
            {
                id: "calf_raise",
                name: "Подъём на носки",
                emoji: "🦿",
                sets: 3,
                reps: "15-20",
                technique: "Можно с весом. Максимальная амплитуда.",
                youtubeUrl: "https://www.youtube.com/watch?v=gwLzBJYoWlI",
                muscleGroups: "Икры"
            }
        ]
    },
    B: {
        name: "День Б - Акцент на Квадрицепсы + Боковая поверхность",
        emoji: "🔥",
        exercises: [
            {
                id: "leg_press",
                name: "Жим ногами в тренажёре",
                emoji: "🦵",
                sets: 4,
                reps: "10-12",
                technique: "Ноги на середине платформы. Опускай до 90°, выжимай пятками.",
                youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
                muscleGroups: "Квадрицепсы, ягодицы, задняя поверхность бедра"
            },
            {
                id: "sumo_squat",
                name: "Приседание с отведением таза (sumo-style)",
                emoji: "💪",
                sets: 4,
                reps: "10-12",
                technique: "Широкая постановка ног, носки в стороны. Отводи таз назад.",
                youtubeUrl: "https://www.youtube.com/watch?v=0YXdgBRUcJQ",
                muscleGroups: "Внутренняя поверхность бедра, ягодицы, квадрицепсы"
            },
            {
                id: "bulgarian_split_b",
                name: "Болгарские приседания",
                emoji: "🎯",
                sets: 3,
                reps: "10-12 на ногу",
                technique: "Задняя нога на скамье. Фокус на квадрицепс передней ноги.",
                youtubeUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE",
                muscleGroups: "Ягодицы, квадрицепсы"
            },
            {
                id: "leg_abduction",
                name: "Разведения ног в тренажёре",
                emoji: "⚡",
                sets: 3,
                reps: "12-15",
                technique: "В тренажёре. Разводи ноги в стороны, контролируй возврат.",
                youtubeUrl: "https://www.youtube.com/watch?v=wtRHHHQVLlg",
                muscleGroups: "Средняя ягодичная и отводящие мышцы"
            },
            {
                id: "side_leg_raise",
                name: "Отведение ноги в сторону",
                emoji: "🔄",
                sets: 3,
                reps: "12-15 на каждую",
                technique: "В кроссовере, стоя. Контролируй движение.",
                youtubeUrl: "https://www.youtube.com/watch?v=izV5th7AQHM",
                muscleGroups: "Средняя ягодичная мышца"
            }
        ]
    },
    C: {
        name: "День В - Акцент на Форму + Стабилизация",
        emoji: "✨",
        exercises: [
            {
                id: "glute_bridge_c",
                name: "Ягодичный мост",
                emoji: "🍑",
                sets: 4,
                reps: "12-15",
                technique: "Можно делать с одной ногой (single-leg). Задержка вверху.",
                youtubeUrl: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E",
                muscleGroups: "Ягодицы, задняя поверхность бедра"
            },
            {
                id: "leg_press_high",
                name: "Жим ногами",
                emoji: "🦵",
                sets: 3,
                reps: "12-15",
                technique: "Чуть выше на платформе (акцент на ягодицы).",
                youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ",
                muscleGroups: "Ягодицы + квадрицепсы"
            },
            {
                id: "romanian_deadlift_light",
                name: "Румынская тяга",
                emoji: "💪",
                sets: 3,
                reps: "12",
                technique: "Легче, чем в День А. Фокус на технике.",
                youtubeUrl: "https://www.youtube.com/watch?v=SHsUIZiNdeY",
                muscleGroups: "Задняя поверхность бедра, ягодицы"
            },
            {
                id: "leg_adduction",
                name: "Сведения ног в тренажёре",
                emoji: "🎯",
                sets: 3,
                reps: "12-15",
                technique: "В тренажёре. Своди ноги вместе, контролируй движение.",
                youtubeUrl: "https://www.youtube.com/watch?v=wEH9wEOGs0Y",
                muscleGroups: "Внутренняя поверхность бедра"
            },
            {
                id: "kickback_c",
                name: "Отведение ноги назад",
                emoji: "🔥",
                sets: 3,
                reps: "12-15 на каждую",
                technique: "В кроссовере или тренажёре. С лёгким наклоном корпуса.",
                youtubeUrl: "https://www.youtube.com/watch?v=SFl2iMJRJYQ",
                muscleGroups: "Большая ягодичная мышца"
            },
            {
                id: "side_leg_raise_c",
                name: "Отведение ноги в сторону",
                emoji: "🎯",
                sets: 3,
                reps: "12-15 на каждую",
                technique: "В кроссовере, стоя. Контролируй движение.",
                youtubeUrl: "https://www.youtube.com/watch?v=izV5th7AQHM",
                muscleGroups: "Средняя ягодичная мышца"
            },
            {
                id: "leg_abduction_final",
                name: "Разведения ног",
                emoji: "⚡",
                sets: 3,
                reps: "15",
                technique: "Финальный памп. Медленно и контролируемо.",
                youtubeUrl: "https://www.youtube.com/watch?v=wtRHHHQVLlg",
                muscleGroups: "Средняя ягодичная мышца"
            }
        ]
    }
};

// Расширенный справочник упражнений
const allExercises = [
    // Грудь (Пекторальные мышцы)
    { name: "Жим штанги лёжа (классический)", emoji: "💪", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=rT7DgCr-3pg", muscleGroups: "Грудь, трицепс, передние дельты" },
    { name: "Жим штанги лёжа на наклонной скамье", emoji: "💪", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=DbFgADa2PL8", muscleGroups: "Верхняя часть груди" },
    { name: "Жим штанги лёжа на обратной наклонной скамье", emoji: "💪", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=0G2_XV7slIg", muscleGroups: "Нижняя часть груди" },
    { name: "Жим гантелей лёжа", emoji: "🏋️", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=VmB1G1K7v94", muscleGroups: "Грудь, трицепс" },
    { name: "Жим гантелей на наклонной скамье", emoji: "🏋️", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8", muscleGroups: "Верхняя часть груди" },
    { name: "Разводка гантелей лёжа", emoji: "🔥", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=eozdVDA78K0", muscleGroups: "Грудь, растяжка" },
    { name: "Сведение рук в тренажёре «Бабочка» (Pec-Deck)", emoji: "🎯", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=Z57CtFmRMxA", muscleGroups: "Грудь, внутренняя часть" },
    { name: "Жим в тренажёре (Chest Press)", emoji: "⚡", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=xUm0BiZCWlQ", muscleGroups: "Грудь, трицепс" },
    { name: "Отжимания от пола / на брусьях", emoji: "💪", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=2z8JmcrW-As", muscleGroups: "Грудь, трицепс" },
    { name: "Пуловер", emoji: "🔥", category: "Грудь", youtubeUrl: "https://www.youtube.com/watch?v=FK1AH_hXSZ4", muscleGroups: "Грудь, широчайшие" },

    // Спина
    { name: "Подтягивания на турнике", emoji: "🏋️", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g", muscleGroups: "Широчайшие спины, бицепс" },
    { name: "Тяга верхнего блока к груди", emoji: "⚡", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc", muscleGroups: "Широчайшие спины, бицепс" },
    { name: "Тяга горизонтального блока сидя", emoji: "🎯", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=UCXxvVItLoM", muscleGroups: "Широчайшие, ромбовидные, задние дельты" },
    { name: "Тяга штанги в наклоне", emoji: "💪", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=FWJR5Ve8bnQ", muscleGroups: "Широчайшие, ромбовидные" },
    { name: "Тяга гантели одной рукой в наклоне", emoji: "🔥", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=roCP6wCXPqo", muscleGroups: "Широчайшие, ромбовидные" },
    { name: "Тяга Т-грифа", emoji: "💪", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=j3Igk5nyZE4", muscleGroups: "Широчайшие спины" },
    { name: "Мёртвая тяга", emoji: "🔥", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=op9kVnSso6Q", muscleGroups: "Спина, ягодицы, бицепс бедра, разгибатели спины" },
    { name: "Румынская тяга", emoji: "💪", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=SHsUIZiNdeY", muscleGroups: "Нижняя часть спины, бицепс бедра, ягодицы" },
    { name: "Гиперэкстензия", emoji: "🎯", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=ph3pddpKzzw", muscleGroups: "Разгибатели спины, ягодицы, бицепс бедра" },
    { name: "Шраги", emoji: "🏋️", category: "Спина", youtubeUrl: "https://www.youtube.com/watch?v=cJRVVxmytaM", muscleGroups: "Верхняя часть трапеций" },

    // Плечи (Дельтовидные мышцы)
    { name: "Жим штанги сидя / стоя (армейский жим)", emoji: "💪", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDI", muscleGroups: "Передние и средние дельты, трицепс" },
    { name: "Жим гантелей сидя / стоя", emoji: "🏋️", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=qEwKCR5JCog", muscleGroups: "Все пучки дельт" },
    { name: "Жим в тренажёре для плеч", emoji: "⚡", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=8iPEnn-ltC8", muscleGroups: "Средние и передние дельты" },
    { name: "Махи гантелями в стороны", emoji: "🔥", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo", muscleGroups: "Средние дельты" },
    { name: "Махи гантелями вперёд", emoji: "💪", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=qkx-RjbND34", muscleGroups: "Передние дельты" },
    { name: "Махи в стороны в кроссовере", emoji: "🎯", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=PPrzBWZDOhA", muscleGroups: "Средние дельты" },
    { name: "Обратные махи в наклоне", emoji: "🔥", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=ttvfGg9d76c", muscleGroups: "Задние дельты" },
    { name: "Обратные махи в кроссовере / тренажёре", emoji: "🎯", category: "Плечи", youtubeUrl: "https://www.youtube.com/watch?v=6yMdhi2DVao", muscleGroups: "Задние дельты" },

    // Трицепс
    { name: "Французский жим", emoji: "🔥", category: "Трицепс", youtubeUrl: "https://www.youtube.com/watch?v=-Vyt2QdsR7E", muscleGroups: "Трицепс, длинная головка" },
    { name: "Разгибания рук в верхнем блоке", emoji: "⚡", category: "Трицепс", youtubeUrl: "https://www.youtube.com/watch?v=2-LAMcpzODU", muscleGroups: "Трицепс" },
    { name: "Жим на брусьях (акцент на трицепс)", emoji: "💪", category: "Трицепс", youtubeUrl: "https://www.youtube.com/watch?v=2z8JmcrW-As", muscleGroups: "Трицепс, грудь" },
    { name: "Разгибания одной руки над головой", emoji: "🏋️", category: "Трицепс", youtubeUrl: "https://www.youtube.com/watch?v=_gsUck-7M74", muscleGroups: "Трицепс, длинная головка" },
    { name: "Жим штанги лёжа узким хватом", emoji: "🎯", category: "Трицепс", youtubeUrl: "https://www.youtube.com/watch?v=nEF0bv2FW94", muscleGroups: "Трицепс, грудь" },
    { name: "Отжимания узким хватом", emoji: "💪", category: "Трицепс", youtubeUrl: "https://www.youtube.com/watch?v=hsaH_e-7KOg", muscleGroups: "Трицепс" },

    // Бицепс
    { name: "Сгибания рук со штангой", emoji: "💪", category: "Бицепс", youtubeUrl: "https://www.youtube.com/watch?v=ykJmrZ5v0Oo", muscleGroups: "Бицепс" },
    { name: "Сгибания рук с гантелями", emoji: "🏋️", category: "Бицепс", youtubeUrl: "https://www.youtube.com/watch?v=sAq_ocpRh_I", muscleGroups: "Бицепс" },
    { name: "Сгибания на скамье Скотта", emoji: "🎯", category: "Бицепс", youtubeUrl: "https://www.youtube.com/watch?v=m5RwWNaFAPQ", muscleGroups: "Бицепс" },
    { name: "Концентрированные сгибания", emoji: "🔥", category: "Бицепс", youtubeUrl: "https://www.youtube.com/watch?v=Jvj2wV0vOYU", muscleGroups: "Бицепс" },
    { name: "Молотковые сгибания", emoji: "🔨", category: "Бицепс", youtubeUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4", muscleGroups: "Бицепс + брахиалис" },

    // Предплечья и кисти
    { name: "Сгибания запястий со штангой", emoji: "💪", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=_pAqKT8SXzI", muscleGroups: "Сгибатели предплечий" },
    { name: "Разгибания запястий (Reverse Wrist Curls)", emoji: "🔥", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ", muscleGroups: "Разгибатели предплечий" },
    { name: "Молотковые сгибания", emoji: "🔨", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=zC3nLlEvin4", muscleGroups: "Предплечья + брахиалис" },
    { name: "Сгибания запястий за спиной", emoji: "🎯", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=nRgxYX2Ve9w", muscleGroups: "Сгибатели предплечий" },
    { name: "Вращения запястий с гантелью", emoji: "🔄", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=CLtmh7GqwRg", muscleGroups: "Предплечья" },
    { name: "Роллер для запястий", emoji: "⚡", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=GGWhVPRdBCQ", muscleGroups: "Предплечья и хват" },
    { name: "Щипки с плитами (Plate Pinches)", emoji: "🏋️", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ", muscleGroups: "Предплечья, хват" },
    { name: "Фармерская прогулка", emoji: "🚶", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=rt14aRJh-8E", muscleGroups: "Предплечья, хват, кор" },
    { name: "Вис на турнике с толстым грифом", emoji: "🎯", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g", muscleGroups: "Хват, предплечья" },
    { name: "Сжатие кистевого экспандера", emoji: "✊", category: "Предплечья", youtubeUrl: "https://www.youtube.com/watch?v=FGuVJAj96SE", muscleGroups: "Хват, предплечья" },

    // Ноги — Квадрицепсы
    { name: "Приседания со штангой", emoji: "💪", category: "Ноги - Квадрицепсы", youtubeUrl: "https://www.youtube.com/watch?v=ultWZbUMPL8", muscleGroups: "Квадрицепсы, ягодицы" },
    { name: "Жим ногами в тренажёре", emoji: "🦵", category: "Ноги - Квадрицепсы", youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ", muscleGroups: "Квадрицепсы, ягодицы" },
    { name: "Разгибания ног в тренажёре", emoji: "⚡", category: "Ноги - Квадрицепсы", youtubeUrl: "https://www.youtube.com/watch?v=YyvSfVjQeL0", muscleGroups: "Квадрицепсы" },
    { name: "Выпады", emoji: "🏋️", category: "Ноги - Квадрицепсы", youtubeUrl: "https://www.youtube.com/watch?v=QOVaHwm-Q6U", muscleGroups: "Квадрицепсы, ягодицы" },
    { name: "Болгарские выпады", emoji: "🎯", category: "Ноги - Квадрицепсы", youtubeUrl: "https://www.youtube.com/watch?v=2C-uNgKwPLE", muscleGroups: "Квадрицепсы, ягодицы" },
    { name: "Гакк-приседания", emoji: "🔥", category: "Ноги - Квадрицепсы", youtubeUrl: "https://www.youtube.com/watch?v=EdtaJRBqwes", muscleGroups: "Квадрицепсы" },

    // Ноги — Ягодицы и Бицепс бедра
    { name: "Румынская тяга", emoji: "💪", category: "Ноги - Ягодицы и Бицепс бедра", youtubeUrl: "https://www.youtube.com/watch?v=SHsUIZiNdeY", muscleGroups: "Бицепс бедра, ягодицы, разгибатели спины" },
    { name: "Сгибания ног лёжа / сидя", emoji: "🔄", category: "Ноги - Ягодицы и Бицепс бедра", youtubeUrl: "https://www.youtube.com/watch?v=1Tq3QdYUuHs", muscleGroups: "Бицепс бедра" },
    { name: "Гиперэкстензия", emoji: "🎯", category: "Ноги - Ягодицы и Бицепс бедра", youtubeUrl: "https://www.youtube.com/watch?v=ph3pddpKzzw", muscleGroups: "Бицепс бедра, ягодицы, разгибатели спины" },
    { name: "Ягодичный мостик", emoji: "🍑", category: "Ноги - Ягодицы и Бицепс бедра", youtubeUrl: "https://www.youtube.com/watch?v=OUgsJ8-Vi0E", muscleGroups: "Ягодицы" },
    { name: "Отведение ноги назад в кроссовере с манжетой", emoji: "🔥", category: "Ноги - Ягодицы и Бицепс бедра", youtubeUrl: "https://www.youtube.com/watch?v=SFl2iMJRJYQ", muscleGroups: "Большая ягодичная" },
    { name: "Отведение ноги в сторону в кроссовере с манжетой", emoji: "⚡", category: "Ноги - Ягодицы и Бицепс бедра", youtubeUrl: "https://www.youtube.com/watch?v=izV5th7AQHM", muscleGroups: "Средняя ягодичная" },

    // Икры
    { name: "Подъёмы на носки стоя", emoji: "🦿", category: "Икры", youtubeUrl: "https://www.youtube.com/watch?v=gwLzBJYoWlI", muscleGroups: "Икроножные" },
    { name: "Подъёмы на носки сидя", emoji: "🦵", category: "Икры", youtubeUrl: "https://www.youtube.com/watch?v=JbyjNymZOt0", muscleGroups: "Камбаловидные" },
    { name: "Подъёмы на носки в жиме ногами", emoji: "⚡", category: "Икры", youtubeUrl: "https://www.youtube.com/watch?v=IZxyjW7MPJQ", muscleGroups: "Икроножные" },

    // Пресс и Core
    { name: "Скручивания", emoji: "🔄", category: "Пресс и Core", youtubeUrl: "https://www.youtube.com/watch?v=Xyd_fa5zoEU", muscleGroups: "Прямая мышца живота" },
    { name: "Подъём ног в висе", emoji: "⚡", category: "Пресс и Core", youtubeUrl: "https://www.youtube.com/watch?v=Pr1ieGZ5atk", muscleGroups: "Нижняя часть пресса" },
    { name: "Планка", emoji: "🧘", category: "Пресс и Core", youtubeUrl: "https://www.youtube.com/watch?v=ASdvN_XEl_c", muscleGroups: "Пресс, кор" },
    { name: "Русские twists", emoji: "🔥", category: "Пресс и Core", youtubeUrl: "https://www.youtube.com/watch?v=wkD8rjkodUI", muscleGroups: "Косые мышцы живота" },
    { name: "Колёсико для пресса", emoji: "🎯", category: "Пресс и Core", youtubeUrl: "https://www.youtube.com/watch?v=5pZEOOlRdg8", muscleGroups: "Пресс, кор" },
    { name: "Вакуум живота", emoji: "💨", category: "Пресс и Core", youtubeUrl: "https://www.youtube.com/watch?v=et4NjZ0RfNE", muscleGroups: "Поперечная мышца живота" }
];
