
export const translations: { [key: string]: { [key: string]: string } } = {
  English: {
    // Welcome Screen
    'welcome.tagline': 'Grow in Spirit, Soul and Body',
    'welcome.vision': 'to see how God shapes our city through you',
    'welcome.select_language': 'Select your language',
    'welcome.join': 'Join the Family',
    'welcome.signin': 'Sign In',

    // Navigation & Header
    'nav.home': 'Home',
    'nav.academy': 'Academy',
    'nav.challenges': 'Challenges',
    'nav.community': 'Community',
    'nav.my_plan': 'My Plan',
    'header.dashboard': 'Dashboard',

    // Home
    'home.greeting.morning': 'Good Morning',
    'home.greeting.afternoon': 'Good Afternoon',
    'home.greeting.evening': 'Good Evening',

    // Academy Paths
    'path.church_home.title': 'Your Church Home',
    'path.church_home.desc': 'Discover our vision, values, and family.',
    'path.foundation.title': 'Foundation',
    'path.foundation.desc': 'What do I believe?',
    'path.next_steps.title': 'Next Steps',
    'path.next_steps.desc': 'How do I live it?',
    'path.habits.title': 'Spiritual Habits',
    'path.habits.desc': 'How do I stay consistent?',
    'path.self_leadership.title': 'Self-Leadership',
    'path.self_leadership.desc': 'How do I grow inner strength?',
    'path.theology.title': 'Theology',
    'path.theology.desc': 'Why do I believe it?',
    'path.worldview.title': 'World View',
    'path.worldview.desc': 'Faith in society.',
    'path.deep_dive.title': 'Deep Dive',
    'path.deep_dive.desc': "God's big plan.",
    'path.hey_shots.title': 'Hey Shots',
    'path.hey_shots.desc': 'Quick Q&A Reels',

    // Challenges
    'challenge.so_01.title': '3-Day Gratitude Journal',
    'challenge.so_01.desc': "Spend a few minutes each day writing down three things you're grateful for.",
    'challenge.so_01.why': "Cultivating gratitude shifts your perspective and increases joy, connecting you more deeply with God's blessings.",
    
    'challenge.so_02.title': '7 Days of Encouragement',
    'challenge.so_02.desc': 'Each day, intentionally send an encouraging message or compliment to a different person.',
    'challenge.so_02.why': 'Being an encourager builds up the body of Christ and reflects God\'s love to others.',
    
    'challenge.so_03.title': '14-Day Daniel Fast',
    'challenge.so_03.desc': 'Commit to a Daniel Fast, eating only fruits, vegetables, and whole grains.',
    'challenge.so_03.why': 'Fasting is a way to humble yourself before God, sharpen your focus, and create space to hear from Him.',
    
    'challenge.so_04.title': '21 Days of Prayer & Fasting',
    'challenge.so_04.desc': 'Commit to 21 days of focused prayer and a weekly 24-hour water fast.',
    'challenge.so_04.why': 'Dedicated seasons of prayer and fasting can lead to significant spiritual breakthroughs.',

    'challenge.so_05.title': '3-Day Device-Free Dinner',
    'challenge.so_05.desc': 'Eat together as a family (or with friends) at least once per week – without any screens at the table.',
    'challenge.so_05.why': 'Enjoy a joint meal without phones or screens – for real conversations and deep connection.',

    // Journal
    'journal.title': 'Spiritual Journal',
    'journal.save': 'SAVE ENTRY',
    'journal.listening': 'Listening...',
    'journal.write.placeholder': 'Start writing...',
    'journal.prompt.label': 'New Entry',
    'journal.history': 'History',
    'journal.mood.question': 'How are you feeling?',
    'journal.ai_insight': 'AI Mentor Insights',
    'journal.ai_insight_desc': 'Write 3 entries to unlock a monthly spiritual reflection from your mentor.',
    'journal.generate': 'Generate Reflection',
    'journal.empty': 'Your journal is empty. Start your first entry today!',
    'journal.prompt.energy_drain': 'What drained your energy today?',
    'journal.prompt.positive_impact': 'Who did you have a positive impact on today?',
    'journal.prompt.courage': 'Where did you see God working today?',
    'journal.prompt.gratitude': 'What are 3 things you are grateful for?',

    // Challenges Page UI
    'challenges.title': '',
    'challenges.subtitle': 'Grow through out of the Comfort zone',
    'challenges.days': '{{count}} Days',
    'challenges.loading': 'Finding active quests...',

    // Community Page
    'community.title': 'Community',
    'community.tab_feed': 'Feed',
    'community.tab_prayer': 'Prayer',
    'community.tab_fams': 'Fams',
    'community.tab_leaderboard': 'Ranks',
    'community.post_placeholder': 'What is God doing in your life, {{name}}?',
    'community.post_button': 'Post Update',
    'community.loading_feed': 'Loading the latest...',
    'community.prayer.title': 'Prayer Requests',
    'community.prayer.placeholder': 'How can we pray for you?',
    'community.prayer.anonymous': 'Post Anonymously',
    'community.prayer.submit': 'Send Request',
    'community.prayer.loading': 'Gathering requests...',
    'community.prayer.empty_title': 'No prayer requests yet.',
    'community.prayer.prayed_for': '{{count}} prayed',
    'community.prayer.prayed': 'Prayed',
    'community.prayer.i_prayed': 'I Prayed',
    'community.fams.title': 'Hey Fams',
    'community.fams.loading': 'Looking for groups...',
    'community.fams.empty': 'No groups found.',
    'community.leaderboard.title': 'Leaderboard',
    'community.leaderboard.loading': 'Calculating ranks...',
    'community.leaderboard.all_time': 'All Time',
    'community.leaderboard.my_fams': 'My Fams',

    // My Plan / Profile Page
    'my_plan.member_since': 'Member since {{date}}',
    'my_plan.journal.title': 'Spiritual Journal',
    'my_plan.journal.subtitle': 'Reflect on your walk with God.',
    'my_plan.journal.open': 'Open Journal',
    'my_plan.workout.title': 'Hey Gym',
    'my_plan.workout.view_plan': 'View Plan',
    'my_plan.workout.create_plan': 'Start Training',
    'my_plan.workout.active_title': '{{duration}} Week Plan',
    'my_plan.workout.active_subtitle': 'Week {{current}} of {{duration}}',
    'my_plan.workout.inactive_subtitle': 'Create your performance plan.',
    'my_plan.stats.points': 'Faith Points',
    'my_plan.ai.title': 'Growth Journey',
    'my_plan.ai.subtitle': 'Enter a spiritual goal to get an AI-powered plan.',
    'my_plan.ai.placeholder': 'e.g., Deepen my prayer life',
    'my_plan.ai.go': 'Plan',
    'my_plan.ai.generating': 'Thinking...',
    'my_plan.help_link': 'Need help? Contact Support',

    // Settings
    'settings.title': 'Settings',
    'settings.menu.admin': 'Admin Dashboard',
    'settings.menu.leader': 'Leader Dashboard',
    'settings.menu.giving': 'Giving & Generosity',
    'settings.menu.notifications': 'Notifications',
    'settings.menu.logout': 'Sign Out',
    'settings.menu.support': 'Report a Problem',
    'support.body_template': 'Please describe the problem you encountered:\n\n\n\n--- Technical Details (Do not delete) ---\nUser: {{name}}\nID: {{id}}\nPlatform: {{platform}}',

    // Assessment
    'assessment.start': 'Begin Assessment',
    'assessment.not_at_all': 'Not at all',
    'assessment.totally_true': 'Totally True',
    'assessment.intro.why.desc': 'Understand your spiritual landscape to grow deeper.',
    'assessment.intro.what.desc': 'A comprehensive view of your current faith habits.',
    'assessment.intro.how.desc': 'Honest answers lead to the most accurate growth map.',
    'q.daily_walk.1': 'I spend time daily in prayer and God\'s Word.',
    'q.daily_walk.2': 'I feel God\'s presence in my daily activities.',
    'q.relationships.1': 'I have a circle of friends who challenge my faith.',
    'q.relationships.2': 'I am honest about my struggles with others.',
    'q.serve.1': 'I use my gifts to serve the church and community.',
    'q.serve.2': 'I prioritize others\' needs above my own.',
    'q.mission.1': 'I actively share my faith with people around me.',
    'q.mission.2': 'I am praying for specific people to know God.',
    'q.generosity.1': 'I am a regular and cheerful giver to God\'s work.',
    'q.generosity.2': 'I trust God with my finances completely.',

    // Legal
    'legal.view_privacy': 'Privacy Policy',
    'legal.view_terms': 'Terms of Use',
    'legal.view_impressum': 'Impressum',
    'legal.checkbox.terms': 'I accept the Terms and Privacy Policy.',
    'legal.checkbox.tracking': 'I allow anonymous usage tracking to improve the app.',
    'legal.checkbox.journal': 'I understand my journal entries are private and I should not share sensitive medical info.',
    'legal.journal.short': 'Journal Privacy',
    'legal.journal.short_desc': 'Your reflections are between you and God.',
    'legal.error_accept_terms': 'Please accept the legal terms to continue.',

    // --- SPIRIT SNACKS (ENGLISH ESV - FULL VERSES) ---
    'snack.C.title': 'GOD COMES NEAR',
    'snack.C.verse': 'Behold, the virgin shall conceive and bear a son, and they shall call his name Immanuel (which means, God with us).',
    'snack.C.prayer': 'I welcome Your presence in my home and heart today. You are with me.',
    
    'snack.E.title': 'HE IS RISEN',
    'snack.E.verse': 'He is not here; for he has risen, as he said. Come, see the place where he lay.',
    'snack.E.prayer': 'I stand in resurrection life today. Victory reigns in my spirit because Jesus lives.',
    
    'snack.P.title': 'SUPERNATURAL POWER',
    'snack.P.verse': 'But you will receive power when the Holy Spirit has come upon you, and you will be my witnesses in Jerusalem and in all Judea and Samaria, and to the end of the earth.',
    'snack.P.prayer': 'I am filled with strength beyond my natural ability. Your power makes me bold.',

    'snack.1.title': 'DIVINE FAVOR',
    'snack.1.verse': 'For you bless the righteous, O Lord; you cover him with favor as with a shield.',
    'snack.1.prayer': 'I declare that Your favor surrounds me today like a shield in every situation.',
    
    'snack.2.title': 'TOTAL PROVISION',
    'snack.2.verse': 'And my God will supply every need of yours according to his riches in glory in Christ Jesus.',
    'snack.2.prayer': 'I reject the lie of lack. My life is held in the hands of a faithful Provider.',
    
    'snack.3.title': 'UNSHAKEABLE PEACE',
    'snack.3.verse': 'You keep him in perfect peace whose mind is stayed on you, because he trusts in you.',
    'snack.3.prayer': 'I fix my mind on You. I receive Your perfect peace over my thoughts and heart.',
    
    'snack.4.title': 'EVERLASTING MERCIES',
    'snack.4.verse': 'The steadfast love of the Lord never ceases; his mercies never come to an end; they are new every morning; great is your faithfulness.',
    'snack.4.prayer': 'Thank You for a fresh start today. Your mercies are new and Your faithfulness is great.',
    
    'snack.5.title': 'RENEWED STRENGTH',
    'snack.5.verse': 'But they who wait for the Lord shall renew their strength; they shall mount up with wings like eagles; they shall run and not be weary; they shall walk and not faint.',
    'snack.5.prayer': 'My strength is renewed as I wait on You. I will rise above every challenge.',
    
    'snack.6.title': 'THE MOUNTAIN MOVER',
    'snack.6.verse': 'For truly, I say to you, if you have faith like a grain of mustard seed, you will say to this mountain, "Move from here to there," and it will move, and nothing will be impossible for you.',
    'snack.6.prayer': 'I speak to the obstacles in my life with faith. Nothing is impossible with You.',
    
    'snack.7.title': 'THE GOOD SHEPHERD',
    'snack.7.verse': 'The Lord is my shepherd; I shall not want. He makes me lie down in green pastures. He leads me beside still waters.',
    'snack.7.prayer': 'You are my Shepherd. I have everything I need. Lead me into Your rest today.',
    
    'snack.8.title': 'CONFIDENCE IN GOD',
    'snack.8.verse': 'The Lord is my light and my salvation; whom shall I fear? The Lord is the stronghold of my life; of whom shall I be afraid?',
    'snack.8.prayer': 'I will not be afraid. You are my light and my stronghold. I am safe in You.',
    
    'snack.9.title': 'VICTORY IN CHRIST',
    'snack.9.verse': 'But thanks be to God, who gives us the victory through our Lord Jesus Christ.',
    'snack.9.prayer': 'I stand in the victory of Jesus. Every weapon formed against me shall not prosper.',
    
    'snack.10.title': 'PURPOSEFUL GROWTH',
    'snack.10.verse': 'And we know that for those who love God all things work together for good, for those who are called according to his purpose.',
    'snack.10.prayer': 'I trust that You are working everything out for my good and Your glory.',
    
    'snack.11.title': 'DIVINE WISDOM',
    'snack.11.verse': 'If any of you lacks wisdom, let him ask God, who gives generously to all without reproach, and it will be given him.',
    'snack.11.prayer': 'I ask for Your wisdom today. Lead my decisions and guide my steps.',
    
    'snack.12.title': 'GRACE IN WEAKNESS',
    'snack.12.verse': 'But he said to me, "My grace is sufficient for you, for my power is made perfect in weakness." Therefore I will boast all the more gladly of my weaknesses, so that the power of Christ may rest upon me.',
    'snack.12.prayer': 'Your grace is enough for me. Let Your power be made perfect in my limitations.',
    
    'snack.13.title': 'HEAVENLY FOCUS',
    'snack.13.verse': 'Set your minds on things that are above, not on things that are on earth.',
    'snack.13.prayer': 'I lift my eyes to You. I choose to focus on Your kingdom rather than my problems.',
    
    'snack.14.title': 'LIVING HOPE',
    'snack.14.verse': 'According to his great mercy, he has caused us to be born again to a living hope through the resurrection of Jesus Christ from the dead.',
    'snack.14.prayer': 'I have a living hope because Jesus is alive. My future is bright in You.',
    
    'snack.15.title': 'UNCONDITIONAL LOVE',
    'snack.15.verse': 'For God so loved the world, that he gave his only Son, that whoever believes in him should not perish but have eternal life.',
    'snack.15.prayer': 'Thank You for Your immense love. I believe in You and receive Your life.',
    
    'snack.16.title': 'GOD OUR SHIELD',
    'snack.16.verse': 'For you bless the righteous, O Lord; you cover him with favor as with a shield.',
    'snack.16.prayer': 'I walk covered by Your protection. No evil shall come near my dwelling.',
    
    'snack.17.title': 'PLANS FOR PEACE',
    'snack.17.verse': 'For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.',
    'snack.17.prayer': 'I trust Your plans for me. My future is filled with hope and peace.',
    
    'snack.18.title': 'COURAGEOUS FAITH',
    'snack.18.verse': 'Have I not commanded you? Be strong and courageous. Do not be frightened, and do not be dismayed, for the Lord your God is with you wherever you go.',
    'snack.18.prayer': 'I step out in courage. I am not alone; You are with me every step of the way.',
    
    'snack.19.title': 'TRUSTING THE PATH',
    'snack.19.verse': 'Trust in the Lord with all your heart, and do not lean on your own understanding. In all your ways acknowledge him, and he will make straight your paths.',
    'snack.19.prayer': 'I surrender my plans to You. Make my path straight and guide my decisions.',
    
    'snack.20.title': 'ABOUNDING HOPE',
    'snack.20.verse': 'May the God of hope fill you with all joy and peace in believing, so that by the power of the Holy Spirit you may abound in hope.',
    'snack.20.prayer': 'Fill me with Your joy and peace. I choose to abound in hope through Your Spirit.',
    
    'snack.21.title': 'GOD OUR REFUGE',
    'snack.21.verse': 'God is our refuge and strength, a very present help in trouble.',
    'snack.21.prayer': 'You are my safe place and my source of strength. Thank You for being with me.',
    
    'snack.22.title': 'REST FOR THE SOUL',
    'snack.22.verse': 'Come to me, all who labor and are heavy laden, and I will give you rest.',
    'snack.22.prayer': 'I bring my burdens to You. I receive Your rest for my soul today.',
    
    'snack.23.title': 'SPIRIT OF BOLDNESS',
    'snack.23.verse': 'For God gave us a spirit not of fear but of power and love and self-control.',
    'snack.23.prayer': 'I walk in power, love, and a sound mind today.',
    
    'snack.24.title': 'TASTE GOD\'S GOODNESS',
    'snack.24.verse': 'Oh, taste and see that the Lord is good! Blessed is the man who takes refuge in him!',
    'snack.24.prayer': 'I experience Your goodness today. Thank You for being my refuge.',
    
    'snack.25.title': 'THE LORD\'S BLESSING',
    'snack.25.verse': 'The Lord bless you and keep you; the Lord make his face to shine upon you and be gracious to you; the Lord lift up his countenance upon you and give you peace.',
    'snack.25.prayer': 'I receive Your blessing and Your peace over my life and my family.',
    
    'snack.26.title': 'FAITH IN ACTION',
    'snack.26.verse': 'Now faith is the assurance of things hoped for, the conviction of things not seen.',
    'snack.26.prayer': 'I walk by faith and not by sight. I am convinced of Your promises.',
    
    'snack.27.title': 'A LAMP TO MY FEET',
    'snack.27.verse': 'Your word is a lamp to my feet and a light to my path.',
    'snack.27.prayer': 'Let Your word guide my every decision. Illuminate the path ahead of me.',
    
    'snack.28.title': 'BEYOND IMAGINATION',
    'snack.28.verse': 'Now to him who is able to do far more abundantly than all that we ask or think, according to the power at work within us.',
    'snack.28.prayer': 'I believe for the "more" today. Work through me beyond what I can imagine.',
    
    'snack.29.title': 'FRUIT OF THE SPIRIT',
    'snack.29.verse': 'But the fruit of the Spirit is love, joy, peace, patience, kindness, goodness, faithfulness, gentleness, self-control; against such things there is no law.',
    'snack.29.prayer': 'Holy Spirit, produce Your beautiful fruit in my character today.',
    
    'snack.30.title': 'ALL-SUFFICIENT STRENGTH',
    'snack.30.verse': 'I can do all things through him who strengthens me.',
    'snack.30.prayer': 'I am empowered for everything ahead of me because You are my strength.',
    
    'snack.31.title': 'BLESS THE LORD',
    'snack.31.verse': 'Bless the Lord, O my soul, and all that is within me, bless his holy name!',
    'snack.31.prayer': 'I choose to worship You with everything I am. Your name is holy.',
  },
  German: {
    // Welcome Screen
    'welcome.tagline': 'Wachse in Geist, Seele und Körper',
    'welcome.vision': 'Um zu sehen wie Gott unsere Stadt durch Dich formt',
    'welcome.select_language': 'Wähle deine Sprache',
    'welcome.join': 'Werde Teil der Familie',
    'welcome.signin': 'Anmelden',

    // Navigation & Header
    'nav.home': 'Home',
    'nav.academy': 'Akademie',
    'nav.challenges': 'Challenges',
    'nav.community': 'Community',
    'nav.my_plan': 'Mein Plan',
    'header.dashboard': 'Dashboard',

    // Home
    'home.greeting.morning': 'Guten Morgen',
    'home.greeting.afternoon': 'Guten Tag',
    'home.greeting.evening': 'Guten Abend',

    // Academy Paths
    'path.church_home.title': 'Deine Kirche',
    'path.church_home.desc': 'Entdecke unsere Vision, Werte und Familie.',
    'path.foundation.title': 'Dein Fundament',
    'path.foundation.desc': 'Was glaube ich eigentlich?',
    'path.next_steps.title': 'Next Steps',
    'path.next_steps.desc': 'Wie lebe ich das im Alltag?',
    'path.habits.title': 'Geistliche Gewohnheiten',
    'path.habits.desc': 'Wie bleibe ich beständig?',
    'path.self_leadership.title': 'Leiterschaft',
    'path.self_leadership.desc': 'Wie wachse ich innerlich?',
    'path.theology.title': 'Theologie',
    'path.theology.desc': 'Warum glaube ich das?',
    'path.worldview.title': 'Weltbild',
    'path.worldview.desc': 'Glaube in der Gesellschaft.',
    'path.deep_dive.title': 'Deep Dive',
    'path.deep_dive.desc': "Gottes großer Plan.",
    'path.hey_shots.title': 'Hey Shots',
    'path.hey_shots.desc': 'Kurze Q&A Reels',

    // Challenges
    'challenge.so_01.title': '3 Tage Dankbarkeits-Journal',
    'challenge.so_01.desc': 'Schreibe jeden Tag drei Dinge auf, für die du Gott dankbar bist.',
    'challenge.so_01.why': 'Dankbarkeit verändert deine Perspektive und bringt neue Freude in dein Leben.',
    
    'challenge.so_02.title': '7 Tage Ermutigung',
    'challenge.so_02.desc': 'Sende jeden Tag eine ermutigende Nachricht an eine andere Person.',
    'challenge.so_02.why': 'Anderen Mut zuzusprechen baut Gottes Familie auf und spiegelt Seine Liebe wider.',
    
    'challenge.so_03.title': '14 Tage Daniel Fasten',
    'challenge.so_03.desc': 'Verzichte 14 Tage auf Fleisch und Zucker und esse nur Gemüse, Obst und Vollkorn.',
    'challenge.so_03.why': 'Fasten demütigt uns vor Gott und schärft unseren geistlichen Fokus auf Ihn.',
    
    'challenge.so_04.title': '21 Tage Gebet & Fasten',
    'challenge.so_04.desc': 'Committe dich zu 21 Tagen intensivem Gebet und wöchentlichem 24-Stunden-Wasserfasten.',
    'challenge.so_04.why': 'Bewusste Zeiten des Gebets führen oft zu großen geistlichen Durchbrüchen.',

    'challenge.so_05.title': '3 Tage Device Frei Dinner',
    'challenge.so_05.desc': 'Esst mindestens einmal pro Woche als Familie gemeinsam – ohne Bildschirme am Tisch.',
    'challenge.so_05.why': 'Genießt ein gemeinsames Familienessen ohne Handys oder Screens – für echte Gespräche und tiefe Verbindung.',

    // Journal
    'journal.title': 'Geistliches Journal',
    'journal.save': 'EINTRAG SPEICHERN',
    'journal.listening': 'Höre zu...',
    'journal.write.placeholder': 'Schreibe hier...',
    'journal.prompt.label': 'Neuer Eintrag',
    'journal.history': 'Verlauf',
    'journal.mood.question': 'Wie fühlst du dich heute?',
    'journal.ai_insight': 'AI Mentor Einblicke',
    'journal.ai_insight_desc': 'Schreibe 3 Einträge, um eine monatliche Reflexion von deinem Mentor freizuschalten.',
    'journal.generate': 'Reflexion generieren',
    'journal.empty': 'Dein Journal ist noch leer. Starte heute deinen ersten Eintrag!',
    'journal.prompt.energy_drain': 'Was hat dir heute Energie raubt?',
    'journal.prompt.positive_impact': 'Auf wen hattest du heute einen positiven Einfluss?',
    'journal.prompt.courage': 'Wo hast du Gott heute wirken sehen?',
    'journal.prompt.gratitude': 'Nenne 3 Dinge, für die du heute dankbar bist.',

    // Challenges Page UI
    'challenges.title': '',
    'challenges.subtitle': 'Wachse über deine Komfortzone hinaus',
    'challenges.days': '{{count}} Tage',
    'challenges.loading': 'Suche nach Quests...',

    // Community Page
    'community.title': 'Community',
    'community.tab_feed': 'Feed',
    'community.tab_prayer': 'Gebet',
    'community.tab_fams': 'Fams',
    'community.tab_leaderboard': 'Ränge',
    'community.post_placeholder': 'Was tut Gott gerade in deinem Leben, {{name}}?',
    'community.post_button': 'Update posten',
    'community.loading_feed': 'Lade Aktuelles...',
    'community.prayer.title': 'Gebetsanliegen',
    'community.prayer.placeholder': 'Wie können wir für dich beten?',
    'community.prayer.anonymous': 'Anonym posten',
    'community.prayer.submit': 'Anliegen senden',
    'community.prayer.loading': 'Lade Gebete...',
    'community.prayer.empty_title': 'Noch keine Gebetsanliegen.',
    'community.prayer.prayed_for': '{{count}} haben gebetet',
    'community.prayer.prayed': 'Gebetet',
    'community.prayer.i_prayed': 'Ich habe gebetet',
    'community.fams.title': 'Hey Fams',
    'community.fams.loading': 'Suche nach Gruppen...',
    'community.fams.empty': 'Keine Gruppen gefunden.',
    'community.leaderboard.title': 'Bestenliste',
    'community.leaderboard.loading': 'Berechne Ränge...',
    'community.leaderboard.all_time': 'Gesamt',
    'community.leaderboard.my_fams': 'Meine Fams',

    // My Plan / Profile Page
    'my_plan.member_since': 'Dabei seit {{date}}',
    'my_plan.journal.title': 'Geistliches Journal',
    'my_plan.journal.subtitle': 'Reflektiere deinen Weg mit Gott.',
    'my_plan.journal.open': 'Journal öffnen',
    'my_plan.workout.title': 'Hey Gym',
    'my_plan.workout.view_plan': 'Plan ansehen',
    'my_plan.workout.create_plan': 'Training starten',
    'my_plan.workout.active_title': '{{duration}} Wochen Plan',
    'my_plan.workout.active_subtitle': 'Woche {{current}} von {{duration}}',
    'my_plan.workout.inactive_subtitle': 'Erstelle deinen Trainingsplan.',
    'my_plan.stats.points': 'Glaubens-Punkte',
    'my_plan.ai.title': 'Wachstums-Reise',
    'my_plan.ai.subtitle': 'Nenne ein Ziel für einen KI-basierten Plan.',
    'my_plan.ai.placeholder': 'z.B. Mein Gebetsleben vertiefen',
    'my_plan.ai.go': 'Planen',
    'my_plan.ai.generating': 'Denke nach...',
    'my_plan.help_link': 'Hilfe benötigt? Support kontaktieren',

    // Settings
    'settings.title': 'Einstellungen',
    'settings.menu.admin': 'Admin Dashboard',
    'settings.menu.leader': 'Leiter Dashboard',
    'settings.menu.giving': 'Geben & Großzüigkeit',
    'settings.menu.notifications': 'Benachrichtigungen',
    'settings.menu.logout': 'Abmelden',
    'settings.menu.support': 'Problem melden',
    'support.body_template': 'Bitte beschreibe das Problem, das aufgetreten ist:\n\n\n\n--- Technische Details (Nicht löschen) ---\nNutzer: {{name}}\nID: {{id}}\nPlattform: {{platform}}',

    // Assessment
    'assessment.start': 'Test starten',
    'assessment.not_at_all': 'Gar nicht',
    'assessment.totally_true': 'Trifft voll zu',
    'assessment.intro.why.desc': 'Verstehe deine geistliche Landschaft, um tiefer zu wachsen.',
    'assessment.intro.what.desc': 'Ein umfassender Blick auf deine aktuellen Glaubensgewohnheiten.',
    'assessment.intro.how.desc': 'Ehrliche Antworten führen zur genauesten Wachstumskarte.',
    'q.daily_walk.1': 'Ich verbringe täglich Zeit im Gebet und Gottes Wort.',
    'q.daily_walk.2': 'Ich erlebe Gottes Gegenwart in meinem Alltag.',
    'q.relationships.1': 'Ich habe Freunde, die mich in meinem Glauben herausfordern.',
    'q.relationships.2': 'Ich bin ehrlich über meine Kämpfe gegenüber anderen.',
    'q.serve.1': 'Ich setze meine Gaben ein, um der Kirche und Stadt zu dienen.',
    'q.serve.2': 'Ich stelle die Bedürfnisse anderer über meine eigenen.',
    'q.mission.1': 'Ich teile meinen Glauben aktiv mit Menschen in meinem Umfeld.',
    'q.mission.2': 'Ich bete gezielt für Menschen, damit sie Gott kennenlernen.',
    'q.generosity.1': 'Ich gebe regelmäßig und fröhlich für Gottes Werk.',
    'q.generosity.2': 'Ich vertraue Gott meine Finanzen vollständig an.',

    // Legal
    'legal.view_privacy': 'Datenschutz',
    'legal.view_terms': 'Nutzungsbedingungen',
    'legal.view_impressum': 'Impressum',
    'legal.checkbox.terms': 'Ich akzeptiere die Bedingungen und den Datenschutz.',
    'legal.checkbox.tracking': 'Ich erlaube anonymes Tracking zur Verbesserung der App.',
    'legal.checkbox.journal': 'Ich verstehe, dass meine Einträge privat sind und teile keine sensiblen Gesundheitsdaten.',
    'legal.journal.short': 'Journal Datenschutz',
    'legal.journal.short_desc': 'Deine Gedanken sind zwischen dir und Gott.',
    'legal.error_accept_terms': 'Bitte akzeptiere die Bedingungen, um fortfahren.',

    // --- GERMAN HFA ---
    'snack.C.title': 'GOTT KOMMT NAHE',
    'snack.C.verse': '»Die Jungfrau wird schwanger werden und einen Sohn zur Welt bringen. Den wird man Immanuel nennen.« (Das heißt: »Gott ist mit uns«.)',
    'snack.C.prayer': 'Ich heiße Deine Gegenwart heute in meinem Haus willkommen. Du bist bei mir.',
    
    'snack.E.title': 'ER IST AUFERSTANDEN',
    'snack.E.verse': 'Er ist nicht hier, er ist auferstanden, wie er gesagt hat. Kommt her und seht die Stätte, wo er gelegen hat.',
    'snack.E.prayer': 'Ich proklamiere den Sieg! Weil Jesus lebt, lebe auch ich heute in Seiner Kraft.',
    
    'snack.P.title': 'ÜBERNATÜRLICHE KRAFT',
    'snack.P.verse': 'Aber wenn der Heilige Geist auf euch herabkommt, werdet ihr mit seiner Kraft ausgerüstet werden. Dann werdet ihr meine Zeugen sein.',
    'snack.P.prayer': 'Ich bin mit Kraft erfüllt, die über meine Fähigkeiten hinausgeht. Deine Macht macht mich kühn.',

    'snack.1.title': 'GÖTTLICHE GUNST',
    'snack.1.verse': 'Denn du, Herr, segnest die Gerechten; du deckst sie mit Gunst wie mit einem Schilde.',
    'snack.1.prayer': 'Ich proklamiere, dass Deine Gunst mich heute wie ein Schutzschild umgibt.',
    
    'snack.2.title': 'VOLLSTÄNDIGE VERSORGUNG',
    'snack.2.verse': 'Mein Gott aber wird all eurem Mangel abhelfen nach seinem Richtum in Herrlichkeit in Christus Jesus.',
    'snack.2.prayer': 'Ich weise den Mangel zurück. Mein Leben liegt in den Händen eines treuen Versorgers.',
    
    'snack.3.title': 'TIEFER FRIEDE',
    'snack.3.verse': 'Wer festen Herzens ist, dem bewahrst du Frieden; denn er verlässt sich auf dich.',
    'snack.3.prayer': 'Ich richte meine Gedanken auf Dich und empfange heute Deinen vollkommenen Frieden.',
    
    'snack.4.title': 'NEUE GNADE',
    'snack.4.verse': 'Die Gütigkeit des Herrn ist\'s, dass wir nicht gar aus sind, seine Barmherzigkeit hat noch kein Ende, sondern sie ist alle Morgen neu, und deine Treue ist groß.',
    'snack.4.prayer': 'Danke für diesen neuen Morgen. Deine Gnade ist neu und Deine Treue ist unendlich groß.',
    
    'snack.5.title': 'FRISCHE KRAFT',
    'snack.5.verse': 'Aber die auf den Herrn harren, kriegen neue Kraft, dass sie auffahren mit Flügeln wie Adler, dass sie laufen und nicht matt werden, dass sie wandeln und nicht müde werden.',
    'snack.5.prayer': 'Meine Kraft wird heute erneuert. Ich erhebe mich über jede Schwere wie ein Adler.',
    
    'snack.6.title': 'GLAUBE BEWEGT BERGE',
    'snack.6.verse': 'Wenn euer Glaube nur so groß wäre wie ein Senfkorn, könntet ihr zu diesem Berg sagen: ›Rück an eine andere Stelle!‹, und er würde es tun. Nichts wäre euch dann unmöglich.',
    'snack.6.prayer': 'Mit Glauben spreche ich heute zu den Hindernissen in meinem Leben. Nichts ist unmöglich.',
    
    'snack.7.title': 'DER GUTE HIRTE',
    'snack.7.verse': 'Der Herr ist mein Hirte, mir wird nichts mangeln. Er weidet mich auf einer grünen Aue und führet mich zum frischen Wasser.',
    'snack.7.prayer': 'Du bist mein Hirte. Ich habe alles, was ich brauche. Führe mich heute in Deine Ruhe.',
    
    'snack.8.title': 'KEINE ANGST',
    'snack.8.verse': 'Der Herr ist mein Licht und mein Heil; vor wem sollte ich mich fürchten? Der Herr ist meines Lebens Kraft; vor wem sollte mir grauen?',
    'snack.8.prayer': 'Ich werde mich nicht fürchten. Du bist mein Licht und meine Festung. Ich bin sicher bei Dir.',
    
    'snack.9.title': 'SIEG DURCH JESUS',
    'snack.9.verse': 'Gott aber sei Dank, der uns den Sieg gibt durch unsern Herrn Jesus Christus!',
    'snack.9.prayer': 'Ich stehe im Sieg von Jesus. Jede Waffe, die gegen mich geschmiedet wird, wird versagen.',
    
    'snack.10.title': 'ALLES DIENT ZUM GUTEN',
    'snack.10.verse': 'Wir wissen aber, dass denen, die Gott lieben, alle Dinge zum Besten dienen, denen, die nach seinem Ratschluss berufen sind.',
    'snack.10.prayer': 'Ich vertraue darauf, dass Du alles zu meinem Besten und zu Deiner Ehre wirkst.',
    
    'snack.11.title': 'GÖTTLICHE WEISHEIT',
    'snack.11.verse': 'Wenn es aber jemandem unter euch an Weisheit mangelt, so erbitte er sie von Gott, der allen gern gibt und niemanden schilt; so wird sie ihm gegeben werden.',
    'snack.11.prayer': 'Schenke mir heute Deine Weisheit für meine Entscheidungen. Leite jeden meiner Schritte.',
    
    'snack.12.title': 'KRAFT IN SCHWACHHEIT',
    'snack.12.verse': 'Er hat zu mir gesagt: »Lass dir an meiner Gnade genügen; denn meine Kraft ist in den Schwachen mächtig.«',
    'snack.12.prayer': 'Deine Gnade reicht mir völlig aus. Lass Deine Kraft in meiner Schwachheit sichtbar werden.',
    
    'snack.13.title': 'HIMMLISCHE AUSRICHTUNG',
    'snack.13.verse': 'Ja, richtet eure Gedanken auf Gottes himmlische Welt und nicht auf das, was diese irdische Welt ausmacht.',
    'snack.13.prayer': 'Ich hebe meine Augen zu Dir. Ich wähle heute Deine Perspektive über meine Probleme.',
    
    'snack.14.title': 'LEBENDIGE HOFFNUNG',
    'snack.14.verse': 'In seiner großen Barmherzigkeit hat er uns neu geboren und uns eine lebendige Hoffnung geschenkt durch die Auferstehung von Jesus Christus.',
    'snack.14.prayer': 'Ich habe eine lebendige Hoffnung, weil Jesus lebt. Meine Zukunft ist hell in Dir.',
    
    'snack.15.title': 'UNENDLICHE LIEBE',
    'snack.15.verse': 'Denn also hat Gott die Welt geliebt, dass er seinen eingeborenen Sohn gab, damit alle, die an ihn glauben, nicht verloren werden, sondern das ewige Leben haben.',
    'snack.15.prayer': 'Danke für Deine unfassbare Liebe. Ich glaube an Dich und empfange heute Dein Leben.',
    
    'snack.16.title': 'SCHUTZ DES HERRN',
    'snack.16.verse': 'Denn du, Herr, segnest die Gerechten; du deckst sie mit Gunst wie mit einem Schilde.',
    'snack.16.prayer': 'Ich gehe heute unter Deinem Schutz. Kein Übel wird meiner Wohnung nahen.',
    
    'snack.17.title': 'ZUKUNFT UND HOFFNUNG',
    'snack.17.verse': 'Denn ich weiß wohl, was ich für Gedanken über euch habe, spricht der Herr: Gedanken des Friedens und nicht des Leides, dass ich euch gebe Zukunft und Hoffnung.',
    'snack.17.prayer': 'Ich vertraue Deinen Plänen. Meine Zukunft ist erfüllt von Hoffnung und Frieden.',
    
    'snack.18.title': 'MUTIG UND STARK',
    'snack.18.verse': 'Habe ich dir nicht geboten: Sei getrost und unverzagt? Lass dir nicht grauen und erschrick nicht; denn der Herr, dein Gott, ist mit dir in allem, was du tun wirst.',
    'snack.18.prayer': 'Ich bin heute mutig und stark. Ich bin nicht allein; Du bist bei mir, wo immer ich hingehe.',
    
    'snack.19.title': 'VERTRAUEN AUF DEN HERRN',
    'snack.19.verse': 'Verlass dich auf den Herrn von ganzem Herzen, und verlass dich nicht auf deinen Verstand, sondern gedenke an ihn in allen deinen Wegen, so wird er dich recht führen.',
    'snack.19.prayer': 'Ich lege meine Wege in Deine Hände. Ebne mir den Weg und leite mein Herz.',
    
    'snack.20.title': 'HOFFNUNG DURCH DEN GEIST',
    'snack.20.verse': 'Der Gott der Hoffnung aber erfülle euch mit aller Freude und Frieden im Glauben, dass ihr abgrundtiefe Hoffnung habt durch die Kraft des Heiligen Geistes.',
    'snack.20.prayer': 'Erfülle mich neu mit Freude und Frieden. Ich wähle die Hoffnung durch Deine Kraft.',
    
    'snack.21.title': 'ZUFLUCHT IN GOTT',
    'snack.21.verse': 'Gott ist unsere Zuversicht und Stärke, eine Hilfe in den großen Nöten, die uns getroffen haben.',
    'snack.21.prayer': 'Du bist mein sicherer Ort und meine Kraftquelle. Danke, dass Du mir heute hilfst.',
    
    'snack.22.title': 'RUHE FÜR DIE SEELE',
    'snack.22.verse': 'Kommt her zu mir, alle, die ihr mühselig und beladen seid; ich will euch erquicken.',
    'snack.22.prayer': 'Ich bringe Dir meine Lasten. Ich empfange heute Deine göttliche Ruhe für meine Seele.',
    
    'snack.23.title': 'GEIST DER KRAFT',
    'snack.23.verse': 'Denn Gott hat uns nicht gegeben den Geist der Furcht, sondern der Kraft und der Liebe und der Besonnenheit.',
    'snack.23.prayer': 'Ich weise jede Angst zurück. Ich wandle in Kraft, Liebe und Besonnenheit.',
    
    'snack.24.title': 'SCHMECKE DIE GÜTE',
    'snack.24.verse': 'Schmecket und sehet, wie freundlich der Herr ist. Wohl dem, der auf ihn trauet!',
    'snack.24.prayer': 'Ich erlebe heute Deine Freundlichkeit. Danke, dass ich bei Dir geborgen bin.',
    
    'snack.25.title': 'DER SEGEN GOTTES',
    'snack.25.verse': 'Der Herr segne dich und behüte dich; der Herr lasse sein Angesicht leuchten über dir und sei dir gnädig; der Herr hebe sein Angesicht über dich und gebe dir Frieden.',
    'snack.25.prayer': 'Ich empfange Deinen Segen und Deinen Frieden für mein Leben und meine Familie.',
    
    'snack.26.title': 'FESTES VERTRAUEN',
    'snack.26.verse': 'Es ist aber der Glaube eine feste Zuversicht auf das, was man hofft, und ein Nichtzweifeln an dem, was man nicht sieht.',
    'snack.26.prayer': 'Ich wandle im Glauben und nicht im Schauen. Ich bin von Deinen Zusagen überzeugt.',
    
    'snack.27.title': 'LICHT AUF MEINEM WEG',
    'snack.27.verse': 'Dein Wort ist meines Fußes Leuchte und ein Licht auf meinem Wege.',
    'snack.27.prayer': 'Lass Dein Wort jede meiner Entscheidungen leiten. Erhelle den Weg vor mir.',
    
    'snack.28.title': 'ÜBER JEDES MASS HINAUS',
    'snack.28.verse': 'Dem aber, der überschwänglich tun kann über alles hinaus, was wir bitten oder verstehen, nach der Kraft, die in uns wirkt.',
    'snack.28.prayer': 'Ich glaube heute an das Unmögliche. Wirke durch mich weit über das hinaus, was ich mir vorstellen kann.',
    
    'snack.29.title': 'DIE FRUCHT DES GEISTES',
    'snack.29.verse': 'Die Frucht aber des Geistes ist Liebe, Freude, Friede, Geduld, Freundlichkeit, Gütigkeit, Treue, Sanftmut, Keuschheit; gegen all dies ist das Gesetz nicht.',
    'snack.29.prayer': 'Heiliger Geist, bringe heute Deine wunderschöne Frucht in meinem Charakter hervor.',
    
    'snack.30.title': 'ALLES IST MÖGLICH',
    'snack.30.verse': 'Ich vermag alles durch den, der mich mächtig macht, Christus.',
    'snack.30.prayer': 'Ich bin bereit für alles, was kommt, denn Du bist meine tägliche Kraftquelle.',
    
    'snack.31.title': 'LOBE DEN HERRN',
    'snack.31.verse': 'Lobe den Herrn, meine Seele, und was in mir ist, seinen heiligen Namen!',
    'snack.31.prayer': 'Ich wähle heute die Anbetung. Mit allem, was ich bin, ehre ich Deinen heiligen Namen.',
  }
};
