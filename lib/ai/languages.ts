export type LanguageConfig = {
  id: string;
  name: string;
  nativeName: string;
  speechLocale: string;
  direction?: "ltr" | "rtl";
  countries: string[];
  greeting: string;
  askName: string;
  askBusiness: string;
  askRequirement: string;
  askBudget: string;
  askDemoTime: string;
  completion: string;
};

export const AUTO_LANGUAGE_ID = "auto";

export const supportedLanguages: LanguageConfig[] = [
  { id: "en", name: "English", nativeName: "English", speechLocale: "en-US", countries: ["United States", "United Kingdom", "Australia", "Canada"], greeting: "Hello", askName: "May I know your name?", askBusiness: "What kind of business do you run?", askRequirement: "What are you trying to solve right now?", askBudget: "What budget range should we plan around?", askDemoTime: "What demo time works best for you?", completion: "Perfect, the lead profile is complete." },
  { id: "hi", name: "Hindi", nativeName: "हिन्दी", speechLocale: "hi-IN", countries: ["India"], greeting: "नमस्ते", askName: "स्टेप 1: आपका नाम क्या है?", askBusiness: "स्टेप 2: आपका बिज़नेस किस प्रकार का है?", askRequirement: "स्टेप 3: आपको किस चीज़ में मदद चाहिए?", askBudget: "स्टेप 4: आपका बजट कितना है?", askDemoTime: "स्टेप 5: डेमो के लिए आपका पसंदीदा समय क्या है?", completion: "बहुत अच्छा, लीड प्रोफाइल पूरी हो गई है।" },
  { id: "hinglish", name: "Hinglish", nativeName: "Hinglish", speechLocale: "hi-IN", countries: ["India"], greeting: "Namaste", askName: "Aapka naam kya hai?", askBusiness: "Aap kis type ka business run karte ho?", askRequirement: "Abhi aapko kis cheez mein help chahiye?", askBudget: "Budget range kya plan kar rahe ho?", askDemoTime: "Demo ke liye kaunsa time best rahega?", completion: "Perfect, lead profile complete ho gayi hai." },
  { id: "ur", name: "Urdu", nativeName: "اردو", speechLocale: "ur-PK", direction: "rtl", countries: ["Pakistan", "India"], greeting: "السلام علیکم", askName: "مرحلہ 1: آپ کا نام کیا ہے؟", askBusiness: "مرحلہ 2: آپ کا کاروبار کس قسم کا ہے؟", askRequirement: "مرحلہ 3: آپ کو کس چیز میں مدد چاہیے؟", askBudget: "مرحلہ 4: آپ کا بجٹ کیا ہے؟", askDemoTime: "مرحلہ 5: ڈیمو کے لیے پسندیدہ وقت کیا ہے؟", completion: "بہت اچھا، لیڈ پروفائل مکمل ہو گئی ہے۔" },
  { id: "ar", name: "Arabic", nativeName: "العربية", speechLocale: "ar-SA", direction: "rtl", countries: ["Saudi Arabia", "United Arab Emirates", "Egypt"], greeting: "مرحبا", askName: "الخطوة 1: ما اسمك؟", askBusiness: "الخطوة 2: ما نوع عملك؟", askRequirement: "الخطوة 3: ما الذي تحتاج المساعدة فيه؟", askBudget: "الخطوة 4: ما الميزانية المتوقعة؟", askDemoTime: "الخطوة 5: ما وقت العرض المناسب لك؟", completion: "رائع، تم اكتمال ملف العميل المحتمل." },
  { id: "fr", name: "French", nativeName: "Français", speechLocale: "fr-FR", countries: ["France", "Canada"], greeting: "Bonjour", askName: "Étape 1 : Quel est votre nom ?", askBusiness: "Étape 2 : Quel type d'entreprise dirigez-vous ?", askRequirement: "Étape 3 : De quoi avez-vous besoin ?", askBudget: "Étape 4 : Quel budget devons-nous prévoir ?", askDemoTime: "Étape 5 : Quel créneau préférez-vous pour une démo ?", completion: "Parfait, le profil du prospect est complet." },
  { id: "de", name: "German", nativeName: "Deutsch", speechLocale: "de-DE", countries: ["Germany", "Austria", "Switzerland"], greeting: "Hallo", askName: "Schritt 1: Wie heißen Sie?", askBusiness: "Schritt 2: Welche Art von Unternehmen führen Sie?", askRequirement: "Schritt 3: Wobei benötigen Sie Hilfe?", askBudget: "Schritt 4: Welches Budget sollen wir einplanen?", askDemoTime: "Schritt 5: Wann passt Ihnen eine Demo?", completion: "Perfekt, das Lead-Profil ist vollständig." },
  { id: "es", name: "Spanish", nativeName: "Español", speechLocale: "es-ES", countries: ["Spain", "Mexico", "United States"], greeting: "Hola", askName: "Paso 1: ¿Cuál es tu nombre?", askBusiness: "Paso 2: ¿Qué tipo de negocio tienes?", askRequirement: "Paso 3: ¿En qué necesitas ayuda?", askBudget: "Paso 4: ¿Qué presupuesto debemos considerar?", askDemoTime: "Paso 5: ¿Cuál es tu horario preferido para una demo?", completion: "Perfecto, el perfil del lead está completo." },
  { id: "pt", name: "Portuguese", nativeName: "Português", speechLocale: "pt-BR", countries: ["Brazil", "Portugal"], greeting: "Olá", askName: "Etapa 1: Qual é o seu nome?", askBusiness: "Etapa 2: Qual é o tipo do seu negócio?", askRequirement: "Etapa 3: Em que você precisa de ajuda?", askBudget: "Etapa 4: Qual orçamento devemos considerar?", askDemoTime: "Etapa 5: Qual horário prefere para uma demonstração?", completion: "Perfeito, o perfil do lead está completo." },
  { id: "it", name: "Italian", nativeName: "Italiano", speechLocale: "it-IT", countries: ["Italy"], greeting: "Ciao", askName: "Passo 1: Come ti chiami?", askBusiness: "Passo 2: Che tipo di attività gestisci?", askRequirement: "Passo 3: Di cosa hai bisogno?", askBudget: "Passo 4: Quale budget dobbiamo considerare?", askDemoTime: "Passo 5: Qual è l'orario preferito per una demo?", completion: "Perfetto, il profilo del lead è completo." },
  { id: "nl", name: "Dutch", nativeName: "Nederlands", speechLocale: "nl-NL", countries: ["Netherlands", "Belgium"], greeting: "Hallo", askName: "Stap 1: Wat is uw naam?", askBusiness: "Stap 2: Wat voor soort bedrijf heeft u?", askRequirement: "Stap 3: Waarmee heeft u hulp nodig?", askBudget: "Stap 4: Welk budget moeten we aanhouden?", askDemoTime: "Stap 5: Wanneer wilt u een demo?", completion: "Perfect, het leadprofiel is compleet." },
  { id: "ru", name: "Russian", nativeName: "Русский", speechLocale: "ru-RU", countries: ["Russia"], greeting: "Здравствуйте", askName: "Шаг 1: Как вас зовут?", askBusiness: "Шаг 2: Какой у вас тип бизнеса?", askRequirement: "Шаг 3: В чем вам нужна помощь?", askBudget: "Шаг 4: Какой бюджет планировать?", askDemoTime: "Шаг 5: Когда вам удобно провести демо?", completion: "Отлично, профиль лида заполнен." },
  { id: "tr", name: "Turkish", nativeName: "Türkçe", speechLocale: "tr-TR", countries: ["Turkey"], greeting: "Merhaba", askName: "Adım 1: Adınız nedir?", askBusiness: "Adım 2: İşletme türünüz nedir?", askRequirement: "Adım 3: Hangi konuda yardıma ihtiyacınız var?", askBudget: "Adım 4: Hangi bütçeyi planlamalıyız?", askDemoTime: "Adım 5: Demo için tercih ettiğiniz zaman nedir?", completion: "Harika, müşteri adayı profili tamamlandı." },
  { id: "ja", name: "Japanese", nativeName: "日本語", speechLocale: "ja-JP", countries: ["Japan"], greeting: "こんにちは", askName: "ステップ1: お名前を教えてください。", askBusiness: "ステップ2: どのような事業ですか？", askRequirement: "ステップ3: 何をお手伝いできますか？", askBudget: "ステップ4: ご予算はどのくらいですか？", askDemoTime: "ステップ5: デモの希望時間を教えてください。", completion: "完了しました。リード情報が揃いました。" },
  { id: "ko", name: "Korean", nativeName: "한국어", speechLocale: "ko-KR", countries: ["South Korea"], greeting: "안녕하세요", askName: "1단계: 성함이 어떻게 되시나요?", askBusiness: "2단계: 어떤 비즈니스를 운영하시나요?", askRequirement: "3단계: 어떤 도움이 필요하신가요?", askBudget: "4단계: 예산 범위는 어떻게 되나요?", askDemoTime: "5단계: 데모 선호 시간은 언제인가요?", completion: "좋습니다. 리드 프로필이 완료되었습니다." },
  { id: "zh-CN", name: "Chinese (Simplified)", nativeName: "简体中文", speechLocale: "zh-CN", countries: ["China", "Singapore"], greeting: "你好", askName: "第 1 步：请问您的姓名？", askBusiness: "第 2 步：您的业务类型是什么？", askRequirement: "第 3 步：您需要什么帮助？", askBudget: "第 4 步：预算范围是多少？", askDemoTime: "第 5 步：您希望什么时候演示？", completion: "很好，线索资料已完整。" },
  { id: "zh-TW", name: "Chinese (Traditional)", nativeName: "繁體中文", speechLocale: "zh-TW", countries: ["Taiwan", "Hong Kong"], greeting: "你好", askName: "第 1 步：請問您的姓名？", askBusiness: "第 2 步：您的業務類型是什麼？", askRequirement: "第 3 步：您需要什麼協助？", askBudget: "第 4 步：預算範圍是多少？", askDemoTime: "第 5 步：您希望何時進行示範？", completion: "很好，潛在客戶資料已完整。" },
  { id: "th", name: "Thai", nativeName: "ไทย", speechLocale: "th-TH", countries: ["Thailand"], greeting: "สวัสดี", askName: "ขั้นตอนที่ 1: คุณชื่ออะไร?", askBusiness: "ขั้นตอนที่ 2: ธุรกิจของคุณเป็นประเภทใด?", askRequirement: "ขั้นตอนที่ 3: คุณต้องการความช่วยเหลือเรื่องอะไร?", askBudget: "ขั้นตอนที่ 4: งบประมาณของคุณคือเท่าไร?", askDemoTime: "ขั้นตอนที่ 5: เวลาที่สะดวกสำหรับเดโมคือเมื่อไร?", completion: "ยอดเยี่ยม โปรไฟล์ลีดครบถ้วนแล้ว" },
  { id: "vi", name: "Vietnamese", nativeName: "Tiếng Việt", speechLocale: "vi-VN", countries: ["Vietnam"], greeting: "Xin chào", askName: "Bước 1: Tên của bạn là gì?", askBusiness: "Bước 2: Bạn kinh doanh loại hình gì?", askRequirement: "Bước 3: Bạn cần hỗ trợ điều gì?", askBudget: "Bước 4: Ngân sách dự kiến là bao nhiêu?", askDemoTime: "Bước 5: Bạn muốn demo vào thời gian nào?", completion: "Tuyệt vời, hồ sơ khách hàng tiềm năng đã hoàn chỉnh." },
  { id: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", speechLocale: "id-ID", countries: ["Indonesia"], greeting: "Halo", askName: "Langkah 1: Siapa nama Anda?", askBusiness: "Langkah 2: Jenis bisnis Anda apa?", askRequirement: "Langkah 3: Anda butuh bantuan apa?", askBudget: "Langkah 4: Berapa kisaran anggaran Anda?", askDemoTime: "Langkah 5: Kapan waktu demo yang Anda pilih?", completion: "Sempurna, profil lead sudah lengkap." },
  { id: "ms", name: "Malay", nativeName: "Bahasa Melayu", speechLocale: "ms-MY", countries: ["Malaysia"], greeting: "Halo", askName: "Langkah 1: Apakah nama anda?", askBusiness: "Langkah 2: Apakah jenis perniagaan anda?", askRequirement: "Langkah 3: Apa bantuan yang anda perlukan?", askBudget: "Langkah 4: Berapakah bajet anda?", askDemoTime: "Langkah 5: Bilakah masa demo pilihan anda?", completion: "Sempurna, profil prospek sudah lengkap." },
  { id: "bn", name: "Bengali", nativeName: "বাংলা", speechLocale: "bn-IN", countries: ["India", "Bangladesh"], greeting: "নমস্কার", askName: "ধাপ 1: আপনার নাম কী?", askBusiness: "ধাপ 2: আপনার ব্যবসার ধরন কী?", askRequirement: "ধাপ 3: আপনার কী সাহায্য দরকার?", askBudget: "ধাপ 4: আপনার বাজেট কত?", askDemoTime: "ধাপ 5: ডেমোর জন্য আপনার পছন্দের সময় কী?", completion: "চমৎকার, লিড প্রোফাইল সম্পূর্ণ হয়েছে।" },
  { id: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ", speechLocale: "pa-IN", countries: ["India"], greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ", askName: "ਕਦਮ 1: ਤੁਹਾਡਾ ਨਾਮ ਕੀ ਹੈ?", askBusiness: "ਕਦਮ 2: ਤੁਹਾਡਾ ਕਾਰੋਬਾਰ ਕਿਹੜੀ ਕਿਸਮ ਦਾ ਹੈ?", askRequirement: "ਕਦਮ 3: ਤੁਹਾਨੂੰ ਕਿਸ ਚੀਜ਼ ਵਿੱਚ ਮਦਦ ਚਾਹੀਦੀ ਹੈ?", askBudget: "ਕਦਮ 4: ਤੁਹਾਡਾ ਬਜਟ ਕਿੰਨਾ ਹੈ?", askDemoTime: "ਕਦਮ 5: ਡੈਮੋ ਲਈ ਤੁਹਾਡਾ ਪਸੰਦੀਦਾ ਸਮਾਂ ਕੀ ਹੈ?", completion: "ਵਧੀਆ, ਲੀਡ ਪ੍ਰੋਫਾਈਲ ਪੂਰੀ ਹੋ ਗਈ ਹੈ।" },
  { id: "gu", name: "Gujarati", nativeName: "ગુજરાતી", speechLocale: "gu-IN", countries: ["India"], greeting: "નમસ્તે", askName: "પગલું 1: તમારું નામ શું છે?", askBusiness: "પગલું 2: તમારો બિઝનેસ કયા પ્રકારનો છે?", askRequirement: "પગલું 3: તમને શેમાં મદદ જોઈએ છે?", askBudget: "પગલું 4: તમારો બજેટ કેટલો છે?", askDemoTime: "પગલું 5: ડેમો માટે તમારો પસંદગીનો સમય કયો છે?", completion: "સરસ, લીડ પ્રોફાઇલ પૂર્ણ થઈ ગઈ છે." },
  { id: "mr", name: "Marathi", nativeName: "मराठी", speechLocale: "mr-IN", countries: ["India"], greeting: "नमस्कार", askName: "पायरी 1: तुमचे नाव काय आहे?", askBusiness: "पायरी 2: तुमचा व्यवसाय कोणत्या प्रकारचा आहे?", askRequirement: "पायरी 3: तुम्हाला कशात मदत हवी आहे?", askBudget: "पायरी 4: तुमचे बजेट किती आहे?", askDemoTime: "पायरी 5: डेमोसाठी तुमचा पसंतीचा वेळ कोणता?", completion: "छान, लीड प्रोफाइल पूर्ण झाले आहे." },
  { id: "ta", name: "Tamil", nativeName: "தமிழ்", speechLocale: "ta-IN", countries: ["India", "Sri Lanka"], greeting: "வணக்கம்", askName: "படி 1: உங்கள் பெயர் என்ன?", askBusiness: "படி 2: உங்கள் தொழில் வகை என்ன?", askRequirement: "படி 3: உங்களுக்கு எந்த உதவி தேவை?", askBudget: "படி 4: உங்கள் பட்ஜெட் எவ்வளவு?", askDemoTime: "படி 5: டெமோக்கு விருப்பமான நேரம் என்ன?", completion: "சிறப்பு, லீட் விவரம் முழுமையாக உள்ளது." },
  { id: "te", name: "Telugu", nativeName: "తెలుగు", speechLocale: "te-IN", countries: ["India"], greeting: "నమస్తే", askName: "దశ 1: మీ పేరు ఏమిటి?", askBusiness: "దశ 2: మీ వ్యాపారం ఏ రకమైనది?", askRequirement: "దశ 3: మీకు ఏ విషయంలో సహాయం కావాలి?", askBudget: "దశ 4: మీ బడ్జెట్ ఎంత?", askDemoTime: "దశ 5: డెమోకు మీకు అనుకూలమైన సమయం ఏమిటి?", completion: "బాగుంది, లీడ్ ప్రొఫైల్ పూర్తయింది." },
  { id: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ", speechLocale: "kn-IN", countries: ["India"], greeting: "ನಮಸ್ಕಾರ", askName: "ಹಂತ 1: ನಿಮ್ಮ ಹೆಸರು ಏನು?", askBusiness: "ಹಂತ 2: ನಿಮ್ಮ ವ್ಯವಹಾರ ಯಾವ ಪ್ರಕಾರದ್ದು?", askRequirement: "ಹಂತ 3: ನಿಮಗೆ ಯಾವ ಸಹಾಯ ಬೇಕು?", askBudget: "ಹಂತ 4: ನಿಮ್ಮ ಬಜೆಟ್ ಎಷ್ಟು?", askDemoTime: "ಹಂತ 5: ಡೆಮೊಗೆ ನಿಮ್ಮ ಇಷ್ಟದ ಸಮಯ ಯಾವುದು?", completion: "ಚೆನ್ನಾಗಿದೆ, ಲೀಡ್ ಪ್ರೊಫೈಲ್ ಪೂರ್ಣವಾಗಿದೆ." },
  { id: "ml", name: "Malayalam", nativeName: "മലയാളം", speechLocale: "ml-IN", countries: ["India"], greeting: "നമസ്കാരം", askName: "ഘട്ടം 1: നിങ്ങളുടെ പേര് എന്താണ്?", askBusiness: "ഘട്ടം 2: നിങ്ങളുടെ ബിസിനസ് ഏത് തരത്തിലുള്ളതാണ്?", askRequirement: "ഘട്ടം 3: നിങ്ങൾക്ക് എന്തിൽ സഹായം വേണം?", askBudget: "ഘട്ടം 4: നിങ്ങളുടെ ബജറ്റ് എത്രയാണ്?", askDemoTime: "ഘട്ടം 5: ഡെമോയ്ക്ക് നിങ്ങൾക്ക് സൗകര്യപ്രദമായ സമയം ഏത്?", completion: "നന്നായി, ലീഡ് പ്രൊഫൈൽ പൂർത്തിയായി." },
  { id: "or", name: "Odia", nativeName: "ଓଡ଼ିଆ", speechLocale: "or-IN", countries: ["India"], greeting: "ନମସ୍କାର", askName: "ପଦକ୍ରମ 1: ଆପଣଙ୍କ ନାମ କଣ?", askBusiness: "ପଦକ୍ରମ 2: ଆପଣଙ୍କ ବ୍ୟବସାୟ କେଉଁ ପ୍ରକାରର?", askRequirement: "ପଦକ୍ରମ 3: ଆପଣଙ୍କୁ କେଉଁ ସହାୟତା ଦରକାର?", askBudget: "ପଦକ୍ରମ 4: ଆପଣଙ୍କ ବଜେଟ କେତେ?", askDemoTime: "ପଦକ୍ରମ 5: ଡେମୋ ପାଇଁ ଆପଣଙ୍କ ପସନ୍ଦର ସମୟ କଣ?", completion: "ଭଲ, ଲିଡ୍ ପ୍ରୋଫାଇଲ୍ ସମ୍ପୂର୍ଣ୍ଣ ହୋଇଛି।" },
  { id: "ne", name: "Nepali", nativeName: "नेपाली", speechLocale: "ne-NP", countries: ["Nepal"], greeting: "नमस्ते", askName: "चरण 1: तपाईंको नाम के हो?", askBusiness: "चरण 2: तपाईंको व्यवसाय कुन प्रकारको हो?", askRequirement: "चरण 3: तपाईंलाई के सहयोग चाहिन्छ?", askBudget: "चरण 4: तपाईंको बजेट कति हो?", askDemoTime: "चरण 5: डेमोका लागि तपाईंको मनपर्ने समय के हो?", completion: "ठीक छ, लिड प्रोफाइल पूरा भयो।" },
  { id: "si", name: "Sinhala", nativeName: "සිංහල", speechLocale: "si-LK", countries: ["Sri Lanka"], greeting: "ආයුබෝවන්", askName: "පියවර 1: ඔබගේ නම කුමක්ද?", askBusiness: "පියවර 2: ඔබගේ ව්‍යාපාර වර්ගය කුමක්ද?", askRequirement: "පියවර 3: ඔබට අවශ්‍ය උදව් කුමක්ද?", askBudget: "පියවර 4: ඔබගේ බජට් එක කීයද?", askDemoTime: "පියවර 5: ඩෙමෝව සඳහා කැමති වේලාව කුමක්ද?", completion: "හොඳයි, ලීඩ් පැතිකඩ සම්පූර්ණයි." },
];

export const voiceLanguageOptions = [
  { id: "en-IN", label: "Indian English", languageId: "en", speechLocale: "en-IN", accent: "Indian", speed: 0.98 },
  { id: "hi-IN", label: "Hindi", languageId: "hi", speechLocale: "hi-IN", accent: "Indian", speed: 0.92 },
  { id: "hinglish-IN", label: "Hinglish", languageId: "hinglish", speechLocale: "hi-IN", accent: "Indian", speed: 0.94 },
  { id: "ar-SA", label: "Arabic", languageId: "ar", speechLocale: "ar-SA", accent: "Gulf", speed: 0.9 },
  { id: "fr-FR", label: "French", languageId: "fr", speechLocale: "fr-FR", accent: "France", speed: 0.95 },
  { id: "de-DE", label: "German", languageId: "de", speechLocale: "de-DE", accent: "Germany", speed: 0.95 },
  { id: "es-ES", label: "Spanish", languageId: "es", speechLocale: "es-ES", accent: "Spain", speed: 0.96 },
  { id: "ja-JP", label: "Japanese", languageId: "ja", speechLocale: "ja-JP", accent: "Japan", speed: 0.9 },
  { id: "zh-CN", label: "Chinese", languageId: "zh-CN", speechLocale: "zh-CN", accent: "Mandarin", speed: 0.9 },
  { id: "pt-BR", label: "Portuguese", languageId: "pt", speechLocale: "pt-BR", accent: "Brazil", speed: 0.96 },
] as const;

export function getLanguageById(id?: string) {
  return supportedLanguages.find((language) => language.id === id) ?? supportedLanguages[0];
}

export function detectLanguage(text: string, override = AUTO_LANGUAGE_ID) {
  if (override && override !== AUTO_LANGUAGE_ID) return getLanguageById(override);
  const normalized = text.toLowerCase();

  if (/[\u0900-\u097F]/.test(text)) return getLanguageById("hi");
  if (/[\u0600-\u06FF]/.test(text)) return getLanguageById(/مرحبا|شكرا|العربية/.test(text) ? "ar" : "ur");
  if (/[\u0980-\u09FF]/.test(text)) return getLanguageById("bn");
  if (/[\u0A00-\u0A7F]/.test(text)) return getLanguageById("pa");
  if (/[\u0A80-\u0AFF]/.test(text)) return getLanguageById("gu");
  if (/[\u0B00-\u0B7F]/.test(text)) return getLanguageById("or");
  if (/[\u0B80-\u0BFF]/.test(text)) return getLanguageById("ta");
  if (/[\u0C00-\u0C7F]/.test(text)) return getLanguageById("te");
  if (/[\u0C80-\u0CFF]/.test(text)) return getLanguageById("kn");
  if (/[\u0D00-\u0D7F]/.test(text)) return getLanguageById("ml");
  if (/[\u0D80-\u0DFF]/.test(text)) return getLanguageById("si");
  if (/[\u3040-\u30FF]/.test(text)) return getLanguageById("ja");
  if (/[\uAC00-\uD7AF]/.test(text)) return getLanguageById("ko");
  if (/[\u4E00-\u9FFF]/.test(text)) return getLanguageById("zh-CN");
  if (/[\u0E00-\u0E7F]/.test(text)) return getLanguageById("th");

  if (/\b(hola|gracias|empresa|presupuesto|demostraci[oó]n)\b/.test(normalized)) return getLanguageById("es");
  if (/\b(bonjour|merci|entreprise|budget|d[ée]mo)\b/.test(normalized)) return getLanguageById("fr");
  if (/\b(hallo|danke|unternehmen|budget|demo)\b/.test(normalized)) return getLanguageById("de");
  if (/\b(ol[aá]|obrigado|empresa|or[cç]amento)\b/.test(normalized)) return getLanguageById("pt");
  if (/\b(ciao|grazie|azienda|bilancio|demo)\b/.test(normalized)) return getLanguageById("it");
  if (/\b(merhaba|te[sş]ekk[uü]r|b[üu]t[cç]e)\b/.test(normalized)) return getLanguageById("tr");
  if (/\b(xin ch[aà]o|c[aả]m [oơ]n|ng[aâ]n s[aá]ch)\b/.test(normalized)) return getLanguageById("vi");
  if (/\b(namaste|aap|kya|hai|chahiye|budget)\b/.test(normalized)) return getLanguageById("hinglish");
  if (/\b(saya|anda|bisnis|anggaran|demo)\b/.test(normalized)) return getLanguageById("id");

  return getLanguageById("en");
}

export function questionForField(field: "name" | "business" | "requirement" | "budget" | "demoTime", languageId?: string) {
  const language = getLanguageById(languageId);
  if (language.id === "hi") {
    const questions = {
      name: "Aapka naam kya hai?",
      business: "Aap kis type ka business run karte hain?",
      requirement: "Abhi aapko kis cheez mein help chahiye?",
      budget: "Iske liye budget range kya hai?",
      demoTime: "Demo ke liye kaunsa time convenient rahega?",
    };
    return questions[field];
  }
  if (language.id === "hinglish") {
    const questions = {
      name: "Aapka naam kya hai?",
      business: "Aap kis type ka business run karte ho?",
      requirement: "Abhi aapko kis cheez mein help chahiye?",
      budget: "Budget range kya plan kar rahe ho?",
      demoTime: "Demo ke liye kaunsa time best rahega?",
    };
    return questions[field];
  }
  if (language.id === "en") {
    const questions = {
      name: "May I know your name?",
      business: "What kind of business do you run?",
      requirement: "What are you trying to solve right now?",
      budget: "What budget range should we plan around?",
      demoTime: "What demo time works best for you?",
    };
    return questions[field];
  }
  const map = {
    name: language.askName,
    business: language.askBusiness,
    requirement: language.askRequirement,
    budget: language.askBudget,
    demoTime: language.askDemoTime,
  };
  return map[field];
}
