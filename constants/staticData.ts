
import { Badge, SpiritSnack } from '../types';

export const QUOTES: { text: string; keywords: string[] }[] = [
    // --- FITNESS & HABITS ---
    { text: "Your body becomes what your habits believe.", keywords: ["habits", "believe"] },
    { text: "Consistency is the quietest but strongest muscle.", keywords: ["Consistency", "strongest"] },
    { text: "Fitness is a mindset before it's a movement.", keywords: ["mindset", "movement"] },
    { text: "Strong habits outlast strong feelings.", keywords: ["habits", "outlast"] },
    { text: "Every workout is a prayer of gratitude.", keywords: ["gratitude"] },
    { text: "Health is built in silence, one choice at a time.", keywords: ["Health", "silence"] },
    { text: "A strong mind builds a stronger body.", keywords: ["strong mind", "stronger body"] },
    { text: "The strongest habit is showing up.", keywords: ["habit", "showing up"] },
    { text: "What you measure, you master.", keywords: ["measure", "master"] },
    { text: "Do the work — especially on the days you don’t feel like it.", keywords: ["Do the work"] },
    { text: "Every rep is a vote for the future you.", keywords: ["rep", "future you"] },
    { text: "Pain is temporary; strength is permanent.", keywords: ["Pain", "strength"] },
    { text: "Excuses weigh more than dumbbells — drop them.", keywords: ["Excuses", "drop them"] },
    { text: "Your body is a gift — train it, don’t waste it.", keywords: ["body", "gift"] },
    { text: "Fitness is not punishment; it’s preparation for your calling.", keywords: ["Fitness", "calling"] },
    { text: "Atomic progress is built on atomic habits.", keywords: ["Atomic progress", "atomic habits"] },
    { text: "Sweat is trust in motion.", keywords: ["Sweat", "trust"] },
    { text: "Rest is part of the training, not the reward.", keywords: ["Rest", "training"] },
    { text: "Your body is a temple — train it with honor, discipline, and gratitude.", keywords: ["temple", "honor"] },

    // --- MINDSET & FAITH ---
    { text: "Mindset shapes your life; choose thoughts that build strength, not excuses.", keywords: ["Mindset", "strength"] },
    { text: "Faith fuels growth when your muscles are tired and your soul feels weak.", keywords: ["Faith", "growth"] },
    { text: "In every struggle there is a seed of wisdom waiting to grow.", keywords: ["struggle", "wisdom"] },
    { text: "When you doubt your path, faith gently whispers: keep stepping.", keywords: ["faith", "keep stepping"] },
    { text: "Mindset is the soil; habits are seeds; your life is the harvest.", keywords: ["Mindset", "habits", "harvest"] },
    { text: "Strength is never just physical — it’s spirit, mind, and body aligned.", keywords: ["Strength", "aligned"] },
    { text: "What you feed your mind shapes your tomorrow more than what you eat.", keywords: ["mind", "shapes"] },
    { text: "Surrender your fear, and your strength will rise in its place.", keywords: ["Surrender", "strength"] },
    { text: "Your identity is more than performance — it’s rooted in purpose.", keywords: ["identity", "purpose"] },
    { text: "Let your faith be bigger than your fear — watch doors open.", keywords: ["faith", "fear"] },
    { text: "Healthy living is honoring the gift of your body, mind, and spirit.", keywords: ["Healthy living", "honoring"] },
    { text: "Faith anchors you when storms come — keep your roots deep.", keywords: ["Faith", "roots deep"] },
    { text: "You build strength by doing what’s hard until it’s natural.", keywords: ["strength", "natural"] },
    { text: "Faith opens your eyes to see beauty even in the middle of pain.", keywords: ["Faith", "beauty"] },
    { text: "Peace isn’t the absence of noise but the presence of inner alignment.", keywords: ["Peace", "alignment"] },
    { text: "Every breath is a reminder: life is a gift, not a guarantee.", keywords: ["life", "gift"] },
    { text: "Transformation happens quietly — in patience, repetition, and surrender.", keywords: ["Transformation", "patience"] },
    { text: "Healing starts when you give yourself permission to rest, not quit.", keywords: ["Healing", "rest"] },
    { text: "Faith gives meaning to movement; you’re not just working out, you’re worshiping.", keywords: ["Faith", "worshiping"] },
    { text: "Kindness to yourself is not weakness — it’s strength expressed with wisdom.", keywords: ["Kindness", "strength"] },
    { text: "Let gratitude interrupt worry — it shifts your chemistry instantly.", keywords: ["gratitude", "shifts"] },
    { text: "Faith teaches you to breathe again when life feels too heavy to carry.", keywords: ["Faith", "breathe"] },
    { text: "Your growth may be invisible to others but undeniable to your spirit.", keywords: ["growth", "spirit"] },
    { text: "Change happens the moment you stop criticizing yourself and start showing compassion.", keywords: ["Change", "compassion"] },

    // --- LEADERSHIP & DISCIPLINE ---
    { text: "Discipline is stronger than mood; keep showing up.", keywords: ["Discipline", "showing up"] },
    { text: "Growth begins where comfort ends.", keywords: ["Growth", "comfort ends"] },
    { text: "Don’t stop when you’re tired, stop when you’re transformed.", keywords: ["tired", "transformed"] },
    { text: "Small habits build big victories — start today, not someday.", keywords: ["Small habits", "victories"] },
    { text: "Discipline is the bridge between who you are and who you want to be.", keywords: ["Discipline", "bridge"] },
    { text: "Teams win when individuals choose service over spotlight.", keywords: ["Teams", "service"] },
    { text: "True leadership is not titles, but taking responsibility for the next move.", keywords: ["leadership", "responsibility"] },
    { text: "The greatest strength is self-control — train your spirit as much as your muscles.", keywords: ["self-control", "spirit"] },
    { text: "Leadership begins the moment you choose to lift someone else up.", keywords: ["Leadership", "lift"] },
    { text: "Excellence is not a moment; it’s a mindset.", keywords: ["Excellence", "mindset"] },
    { text: "Teamwork is multiplying strength; alone you can go fast, together you can go far.", keywords: ["Teamwork", "together"] },
    { text: "You can’t lead others until you first lead yourself.", keywords: ["lead others", "lead yourself"] },
    { text: "Greatness is not in finishing first, but in refusing to quit.", keywords: ["Greatness", "refusing to quit"] },
    { text: "A leader inspires not by words alone, but by walking the path first.", keywords: ["leader", "walking the path"] },
    { text: "Success is not speed but alignment — with your purpose, not the crowd.", keywords: ["Success", "alignment", "purpose"] },
    { text: "Silence often heals faster than explanations; stillness rebuilds strength.", keywords: ["Silence", "stillness"] },
    { text: "Fear whispers stop; courage shouts keep going.", keywords: ["Fear", "courage"] },
    { text: "Leadership is not a position but a decision.", keywords: ["Leadership", "decision"] },
    { text: "Every failure is feedback; use it as fuel.", keywords: ["failure", "fuel"] },
    { text: "Integrity is the foundation of self-leadership.", keywords: ["Integrity", "foundation"] },
    { text: "The mirror is your first classroom; who you are alone is who you truly lead.", keywords: ["mirror", "truly lead"] },
    { text: "Wisdom is knowing when to push and when to pause.", keywords: ["Wisdom", "pause"] },
];

export const LATEST_MESSAGE = {
    title: "Welcome to Hey Life",
    videoId: "M7lc1UVf-VE",
    thumbnail: "https://i.ytimg.com/vi/M7lc1UVf-VE/hqdefault.jpg"
};

export const ALL_BADGES: Omit<Badge, 'dateEarned'>[] = [
    {
        id: 'foundation_graduate',
        name: 'Foundation Graduate',
        icon: 'GraduationCap',
        description: 'Completed all lessons in the "Foundations of Faith" course.',
    },
    {
        id: 'prayer_warrior',
        name: 'Prayer Warrior',
        icon: 'Shield',
        description: 'Prayed for 50 requests on the Prayer Wall.',
    },
    {
        id: 'challenge_champion',
        name: 'Challenge Champion',
        icon: 'Trophy',
        description: 'Successfully completed 10 challenges.',
    },
    {
        id: 'community_builder',
        name: 'Community Builder',
        icon: 'Users',
        description: 'Made 10 posts in the Community Feed.',
    },
    {
        id: 'hey_gym_regular',
        name: 'Heygym Regular',
        icon: 'Dumbbell',
        description: 'Completed 4 weeks of a Heygym workout plan.',
    },
     {
        id: 'first_step',
        name: 'First Step',
        icon: 'Footprints',
        description: 'Completed your first lesson in the Academy.',
    },
    {
        id: 'soul_scribe',
        name: 'Soul Scribe',
        icon: 'BookOpen',
        description: 'Maintained a 3-day journaling streak.',
    },
    {
        id: 'iron_will',
        name: 'Iron Will',
        icon: 'Dumbbell',
        description: 'Completed 5 workouts in your plan.',
    },
];

export const JOURNAL_PROMPTS = [
    'journal.prompt.energy_drain',
    'journal.prompt.positive_impact',
    'journal.prompt.courage',
    'journal.prompt.gratitude',
    'journal.prompt.anxiety',
    'journal.prompt.joy',
    'journal.prompt.gods_voice',
    'journal.prompt.learning',
];

// --- SPIRIT SNACK / PRAYER GUIDE LOGIC ---

// FIX: Removed SpiritSnack interface definition from here as it was moved to types.ts to resolve import errors.

// Helper to split long prayer text into animated lines
export const getPrayerLines = (fullText: string): string[] => {
    // Split by period, exclamation, or question mark, but keep the punctuation
    return fullText.match(/[^.!?]+[.!?]+/g)?.map(s => s.trim()) || [fullText];
};

// --- DATA SOURCE (Based on PDF) ---
// Note: In a production app, this list would be 400+ items long.
// We are implementing the start of General, plus the specific seasonal ones requested.

export const SPIRIT_SNACKS: SpiritSnack[] = [
    // --- GENERAL (1-10 Sample) ---
    { id: '1', season: 'General', titleKey: 'snack.1.title', reference: 'Isaiah 41:10', verseKey: 'snack.1.verse', prayerKey: 'snack.1.prayer' },
    { id: '2', season: 'General', titleKey: 'snack.2.title', reference: 'Philippians 4:19', verseKey: 'snack.2.verse', prayerKey: 'snack.2.prayer' },
    { id: '3', season: 'General', titleKey: 'snack.3.title', reference: 'John 14:27', verseKey: 'snack.3.verse', prayerKey: 'snack.3.prayer' },
    { id: '4', season: 'General', titleKey: 'snack.4.title', reference: 'Isaiah 53:5', verseKey: 'snack.4.verse', prayerKey: 'snack.4.prayer' },
    { id: '5', season: 'General', titleKey: 'snack.5.title', reference: 'Psalm 32:8', verseKey: 'snack.5.verse', prayerKey: 'snack.5.prayer' },
    { id: '6', season: 'General', titleKey: 'snack.6.title', reference: 'Isaiah 40:31', verseKey: 'snack.6.verse', prayerKey: 'snack.6.prayer' },
    { id: '7', season: 'General', titleKey: 'snack.7.title', reference: '1 John 1:9', verseKey: 'snack.7.verse', prayerKey: 'snack.7.prayer' },
    { id: '8', season: 'General', titleKey: 'snack.8.title', reference: 'Psalm 91:4', verseKey: 'snack.8.verse', prayerKey: 'snack.8.prayer' },
    { id: '9', season: 'General', titleKey: 'snack.9.title', reference: 'Psalm 5:12', verseKey: 'snack.9.verse', prayerKey: 'snack.9.prayer' },
    { id: '10', season: 'General', titleKey: 'snack.10.title', reference: '2 Corinthians 5:17', verseKey: 'snack.10.verse', prayerKey: 'snack.10.prayer' },

    // --- CHRISTMAS (C1-C10) ---
    { id: 'C1', season: 'Christmas', titleKey: 'snack.C1.title', reference: 'Matthew 1:23', verseKey: 'snack.C1.verse', prayerKey: 'snack.C1.prayer' },
    { id: 'C2', season: 'Christmas', titleKey: 'snack.C2.title', reference: 'Isaiah 9:2', verseKey: 'snack.C2.verse', prayerKey: 'snack.C2.prayer' },
    { id: 'C3', season: 'Christmas', titleKey: 'snack.C3.title', reference: 'Luke 2:14', verseKey: 'snack.C3.verse', prayerKey: 'snack.C3.prayer' },
    { id: 'C4', season: 'Christmas', titleKey: 'snack.C4.title', reference: 'Galatians 4:4', verseKey: 'snack.C4.verse', prayerKey: 'snack.C4.prayer' },
    { id: 'C5', season: 'Christmas', titleKey: 'snack.C5.title', reference: 'Luke 2:10', verseKey: 'snack.C5.verse', prayerKey: 'snack.C5.prayer' },
    
    // --- EASTER (E1-E10) ---
    { id: 'E1', season: 'Easter', titleKey: 'snack.E1.title', reference: '1 Corinthians 15:54', verseKey: 'snack.E1.verse', prayerKey: 'snack.E1.prayer' },
    { id: 'E2', season: 'Easter', titleKey: 'snack.E2.title', reference: 'Revelation 21:5', verseKey: 'snack.E2.verse', prayerKey: 'snack.E2.prayer' },
    { id: 'E3', season: 'Easter', titleKey: 'snack.E3.title', reference: 'Isaiah 53:5', verseKey: 'snack.E3.verse', prayerKey: 'snack.E3.prayer' },
    { id: 'E4', season: 'Easter', titleKey: 'snack.E4.title', reference: 'Romans 8:11', verseKey: 'snack.E4.verse', prayerKey: 'snack.E4.prayer' },
    { id: 'E5', season: 'Easter', titleKey: 'snack.E5.title', reference: 'Hebrews 9:12', verseKey: 'snack.E5.verse', prayerKey: 'snack.E5.prayer' },

    // --- PENTECOST (P1-P10) ---
    { id: 'P1', season: 'Pentecost', titleKey: 'snack.P1.title', reference: 'Acts 1:8', verseKey: 'snack.P1.verse', prayerKey: 'snack.P1.prayer' },
    { id: 'P2', season: 'Pentecost', titleKey: 'snack.P2.title', reference: 'Ezekiel 37:14', verseKey: 'snack.P2.verse', prayerKey: 'snack.P2.prayer' },
    { id: 'P3', season: 'Pentecost', titleKey: 'snack.P3.title', reference: 'Luke 24:32', verseKey: 'snack.P3.verse', prayerKey: 'snack.P3.prayer' },
    { id: 'P4', season: 'Pentecost', titleKey: 'snack.P4.title', reference: '1 Corinthians 12:13', verseKey: 'snack.P4.verse', prayerKey: 'snack.P4.prayer' },
    { id: 'P5', season: 'Pentecost', titleKey: 'snack.P5.title', reference: 'Acts 4:31', verseKey: 'snack.P5.verse', prayerKey: 'snack.P5.prayer' },
];

// --- DATE CALCULATION LOGIC ---

// Calculates Easter Sunday for a given year (Western Church)
function getEasterDate(year: number): Date {
    const f = Math.floor,
        G = year % 19,
        C = f(year / 100),
        H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
        I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
        J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
        L = I - J,
        month = 3 + f((L + 40) / 44),
        day = L + 28 - 31 * f(month / 4);

    return new Date(year, month - 1, day);
}

// Determines which snack to show based on the date
export const getDailySpiritSnack = (): SpiritSnack => {
    const today = new Date();
    const year = today.getFullYear();
    const dayOfYear = Math.floor((today.getTime() - new Date(year, 0, 0).getTime()) / 86400000);

    // 1. Calculate Holidays
    const easter = getEasterDate(year);
    const pentecost = new Date(easter.getTime() + (49 * 24 * 60 * 60 * 1000)); // 49 days after Easter
    
    // 2. Define Seasons (10 days before)
    
    // Christmas: Dec 15 - Dec 31
    const christmasStart = new Date(year, 11, 15); // Dec 15 (Month is 0-indexed)
    const christmasEnd = new Date(year, 11, 31);

    // Easter: 10 days before Easter Sunday -> Easter Monday
    const easterStart = new Date(easter.getTime() - (10 * 24 * 60 * 60 * 1000));
    const easterEnd = new Date(easter.getTime() + (1 * 24 * 60 * 60 * 1000));

    // Pentecost: 10 days before Pentecost -> Pentecost Monday
    const pentecostStart = new Date(pentecost.getTime() - (10 * 24 * 60 * 60 * 1000));
    const pentecostEnd = new Date(pentecost.getTime() + (1 * 24 * 60 * 60 * 1000));

    // 3. Check Date Ranges
    let seasonalPool: SpiritSnack[] = [];

    if (today >= christmasStart && today <= christmasEnd) {
        seasonalPool = SPIRIT_SNACKS.filter(s => s.season === 'Christmas');
    } else if (today >= easterStart && today <= easterEnd) {
        seasonalPool = SPIRIT_SNACKS.filter(s => s.season === 'Easter');
    } else if (today >= pentecostStart && today <= pentecostEnd) {
        seasonalPool = SPIRIT_SNACKS.filter(s => s.season === 'Pentecost');
    }

    if (seasonalPool.length > 0) {
        // Pick one based on the day to rotate through the seasonal list
        const index = dayOfYear % seasonalPool.length;
        return seasonalPool[index];
    }

    // 4. Default / General Season
    const generalPool = SPIRIT_SNACKS.filter(s => s.season === 'General');
    const generalIndex = dayOfYear % generalPool.length;
    return generalPool[generalIndex];
};
