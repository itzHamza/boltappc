import React, { useState, useEffect } from "react";

// Collection of Islamic content
const islamicContent = [
  {
    type: "دعاء",
    title: "دعاء المغفرة الشاملة",
    englishTitle: "Comprehensive Forgiveness Dua",
    text: "اللهم اغفر لي ذنبي كله، دقه وجله، وأوله وآخره، وعلانيته وسره",
    translation:
      "O Allah, forgive me all my sins, the small and the great, the first and the last, the open and the secret.",
  },
  {
    type: "دعاء",
    title: "دعاء الصلاح والنجاة",
    englishTitle: "Dua for Righteousness and Protection",
    text: "اللهم إني أعوذ بك من غلبة الدين وغلبة العدو، اللهم إني أعوذ بك من جهد البلاء ومن درك الشقاء ومن سوء القضاء ومن شماتة الأعداء، اللهم أصلح لي ديني الذي هو عصمة أمري، وأصلح لي دنياي التي فيها معاشي، وأصلح لي آخرتي التي فيها معادي، واجعل الحياة زيادة لي في كل خير، واجعل الموت راحة لي من كل شر",
    translation:
      "O Allah, I seek refuge in You from being overwhelmed by debt and overpowered by enemies. O Allah, I seek refuge in You from the distress of calamity, from the misery of misfortune, from bad judgment, and from the gloating of enemies. O Allah, rectify my religion which is the safeguard of my affairs. Rectify my worldly life in which is my livelihood. Rectify my Hereafter in which is my return. Make life increase for me in every good and make death a rest for me from every evil.",
  },
  {
    type: "دعاء",
    title: "دعاء الصلاح في الأمور",
    englishTitle: "Dua for Rectification of Affairs",
    text: "اللهم أصلح لي ديني الذي هو عصمة أمري، وأصلح دنياي التي فيها معاشي، وأصلح لي آخرتي التي فيها معادي، واجعل الحياة زيادة لي في كل خير، واجعل الموت راحة لي من كل شر",
    translation:
      "O Allah, rectify my religion which is the safeguard of my affairs. Rectify my worldly life in which is my livelihood. Rectify my Hereafter in which is my return. Make life increase for me in every good and make death a rest for me from every evil.",
  },
  {
    type: "دعاء",
    title: "دعاء التعوذ من المصائب",
    englishTitle: "Dua for Seeking Refuge from Calamities",
    text: "اللهم إني أعوذ بك من جهد البلاء، ومن درك الشقاء، ومن سوء القضاء، ومن شماتة الأعداء، اللهم إني أعوذ بك من الهم والحزن، والعجز والكسل، والجذام، والجبن والبخل، ومن المأثم والمغرم، ومن غلبة الدين وقهر الرجال",
    translation:
      "O Allah, I seek refuge in You from the distress of calamity, from the misery of misfortune, from bad judgment, and from the gloating of enemies. O Allah, I seek refuge in You from grief and sadness, from weakness and laziness, from leprosy and miserliness, from sin and debt, and from being overwhelmed by debt and overpowered by men.",
  },
  {
    type: "دعاء",
    title: "دعاء الخير في الدنيا والآخرة",
    englishTitle: "Dua for Good in This Life and the Hereafter",
    text: "اللهم آتنا في الدنيا حسنة وفي الآخرة حسنة وقنا عذاب النار",
    translation:
      "O Allah, give us good in this world and good in the Hereafter, and protect us from the punishment of the Fire.",
  },
  {
    type: "دعاء",
    title: "دعاء المغفرة من الذنوب",
    englishTitle: "Dua for Forgiveness of Sins",
    text: "اللهم اغفر لي خطيئتي وجهلي، وإسرافي في أمري وما أنت أعلم به مني، اللهم اغفر لي جدي وهزلي وخطأي وعمدي وكل ذلك عندي",
    translation:
      "O Allah, forgive my sin, my ignorance, my immoderation in my affairs, and what You know better than I. O Allah, forgive my serious sins and my trivial sins, my mistakes and my intentional sins, all of that which I have committed.",
  },
  {
    type: "دعاء",
    title: "دعاء المغفرة الشاملة",
    englishTitle: "Comprehensive Forgiveness Dua",
    text: "اللهم اغفر لي ما قدمت وما أخرت، وما أسررت وما أعلنت وما أنت أعلم به مني، أنت المقدم وأنت المؤخر وأنت على كل شيء قدير",
    translation:
      "O Allah, forgive me what I have done in the past and what I will do in the future, what I have concealed and what I have revealed, and what You know better than I. You are the Bringer-Forward and You are the Delayer, and You have power over all things.",
  },
  {
    type: "دعاء",
    title: "دعاء الخير والشر",
    englishTitle: "Dua for Good and Protection from Evil",
    text: "اللهم إني أسألك من الخير كله عاجله وآجله، ما علمت منه، وما لم أعلم. وأعوذ بك من الشر كله، عاجله وآجله، ما علمت منه، وما لم أعلم.",
    translation:
      "O Allah, I ask You for all that is good, in this world and in the Hereafter, what I know and what I do not know. And I seek refuge in You from all evil, in this world and in the Hereafter, what I know and what I do not know.",
  },
  {
    type: "دعاء",
    title: "دعاء الجنة والنجاة من النار",
    englishTitle: "Dua for Paradise and Protection from Hellfire",
    text: "اللهم إني أسألك الجنة، وما قرب إليها من قول أو عمل، وأعوذ بك من النار، وما قرب إليها من قول أو عمل، وأسألك أن تجعل كل قضاء تقضيه لي خيرًا",
    translation:
      "O Allah, I ask You for Paradise and for that which brings one closer to it, in word and deed. And I seek refuge in You from Hellfire and from that which brings one closer to it, in word and deed. And I ask You to make every decree that You decree concerning me good.",
  },
  {
    type: "دعاء",
    title: "دعاء التعوذ من الفقر والظلم",
    englishTitle: "Dua for Protection from Poverty and Oppression",
    text: "اللهم إني أعوذ بك من الفقر، والقلة، والذلة، وأعوذ بك من أن أظلم أو أُظلم.",
    translation:
      "O Allah, I seek refuge in You from poverty, scarcity, and humiliation. And I seek refuge in You from oppressing or being oppressed.",
  },
  {
    type: "دعاء",
    title: "دعاء الثبات والرشاد",
    englishTitle: "Dua for Steadfastness and Guidance",
    text: "اللهم إني أسألك الثبات في الأمر، والعزيمة على الرشد، وأسألك موجبات رحمتك، وعزائم مغفرتك، وأسألك شكر نعمتك، وحسن عبادتك، وأسألك قلبا سليما، ولسانا صادقا، وأسألك من خير ما تعلم، وأعوذ بك من شر ما تعلم، وأستغفرك لما تعلم، إنك أنت علام الغيوب.",
    translation:
      "O Allah, I ask You for steadfastness in my affairs and determination in guidance. I ask You for the causes of Your mercy and the certainties of Your forgiveness. I ask You for gratitude for Your blessings and excellence in worshiping You. I ask You for a sound heart and a truthful tongue. I ask You for the best of what You know, and I seek refuge in You from the worst of what You know. And I seek Your forgiveness for what You know. Verily, You are the Knower of the unseen.",
  },
  {
    type: "دعاء",
    title: "دعاء الخشية واليقين",
    englishTitle: "Dua for Piety and Certainty",
    text: "اللهم اقسم لنا من خشيتك ما تحُول به بيننا وبين معاصيك، ومن طاعتك ما تبلغنا به جنتك، ومن اليقين ما تهون به علينا مصائب الدنيا، اللهم متعنا بأسماعنا، وأبصارنا، وقواتنا ما أحييتنا، واجعله الوارث منا، واجعل ثأرنا على من ظلمنا، وانصرنا على من عادانا، ولا تجعل مصيبتنا في ديننا، ولا تجعل الدنيا أكبر همنا، ولا مبلغ علمنا، ولا تسلط علينا من لا يرحمنا.",
    translation:
      "O Allah, apportion to us such fear of You as will come between us and acts of disobedience to You, such obedience to You as will bring us to Your Paradise, and such certainty as will make the calamities of this world easy for us. O Allah, let us enjoy our hearing, our sight, and our strength as long as You keep us alive, and make it the last thing taken from us. Give us vengeance against those who have wronged us, and grant us victory over those who oppose us. Do not make our calamity be in our religion. Do not make this world our greatest concern nor the limit of our knowledge. And do not give authority over us to those who will not have mercy on us.",
  },
  {
    type: "دعاء",
    title: "دعاء الحفظ في كل حال",
    englishTitle: "Dua for Protection in All States",
    text: "اللهم احفظني بالإسلام قائما، واحفظني بالإسلام قاعدا، واحفظني بالإسلام راقدا، ولا تشمت بي عدوا ولا حاسدا. اللهم إني أسألك من كل خير خزائنه بيدك، وأعوذ بك من كل شر خزائنه بيدك.",
    translation:
      "O Allah, protect me with Islam while standing, protect me with Islam while sitting, and protect me with Islam while lying down. And do not let any enemy or envious person rejoice at my expense. O Allah, I ask You for every good whose keys are in Your hand, and I seek refuge in You from every evil whose keys are in Your hand.",
  },
  {
    type: "دعاء",
    title: "دعاء الحساب اليسير",
    englishTitle: "Dua for Easy Reckoning",
    text: "اللهمَّ حاسِبنِي حِسابًا يَسِيرًا",
    translation: "O Allah, call me to an easy reckoning.",
  },
  {
    type: "ذكر",
    title: "تسبيح",
    englishTitle: "Tasbih",
    text: "سبحان الله وبحمده، سبحان الله العظيم",
    translation:
      "Glory be to Allah and praise Him, Glory be to Allah the Exalted.",
  },
  {
    type: "ذكر",
    title: "الاستغفار",
    englishTitle: "Istighfar",
    text: "أستغفر الله وأتوب إليه",
    translation: "I seek forgiveness from Allah and I repent to Him.",
  },
  {
    type: "ذكر",
    title: "التهليل",
    englishTitle: "Tahlil",
    text: "لا إله إلا الله وحده لا شريك له، له الملك وله الحمد، وهو على كل شيء قدير",
    translation:
      "There is no god but Allah alone, with no partner. His is the dominion and His is the praise, and He has power over all things.",
  },
  {
    type: "ذكر",
    title: "التكبير",
    englishTitle: "Takbir",
    text: "الله أكبر كبيرا، والحمد لله كثيرا، وسبحان الله بكرة وأصيلا",
    translation:
      "Allah is the Greatest, very great. Praise be to Allah, abundantly. Glory be to Allah, morning and evening.",
  },
  {
    type: "ذكر",
    title: "الحوقلة",
    englishTitle: "Hawqalah",
    text: "لا حول ولا قوة إلا بالله",
    translation: "There is no power and no strength except with Allah.",
  },
  {
    type: "ذكر",
    title: "ذكر قبل النوم",
    englishTitle: "Dhikr Before Sleeping",
    text: "باسمك اللهم أحيا وأموت",
    translation: "In Your name, O Allah, I live and I die.",
  },
  {
    type: "ذكر",
    title: "الصلاة على النبي",
    englishTitle: "Salat upon the Prophet",
    text: "اللهم صل وسلم وبارك على نبينا محمد",
    translation:
      "O Allah, send Your blessings and peace upon our Prophet Muhammad.",
  },
  {
    type: "آية",
    title: "سورة الفاتحة ١:١-٧",
    englishTitle: "Surah Al-Fatihah 1:1-7",
    text: "الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ ۝ الرَّحْمَٰنِ الرَّحِيمِ ۝ مَلِكِ يَوْمِ الدِّينِ ۝ إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ ۝ اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ ۝ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ",
    translation:
      "Praise be to Allah, the Lord of all the worlds, The Most Gracious, the Most Merciful, Master of the Day of Judgment. You alone we worship, and You alone we ask for help. Guide us on the Straight Path, The path of those who have received Your grace; not the path of those who have brought down wrath upon themselves, nor of those who have gone astray.",
  },
  {
    type: "آية",
    title: "سورة البقرة ٢:٢٥٥",
    englishTitle: "Surah Al-Baqarah 2:255 (Ayat Al-Kursi)",
    text: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ ۚ لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ ۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَ ۚ وَسِعَ كُرْسِيُّهُ السَّمَاوَاتِ وَالْأَرْضَ ۖ وَلَا يَئُودُهُ حِفْظُهُمَا ۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ",
    translation:
      "Allah! There is no deity except Him, the Ever-Living, the Sustainer of existence. Neither drowsiness overtakes Him nor sleep. To Him belongs whatever is in the heavens and whatever is on the earth. Who is it that can intercede with Him except by His permission? He knows what is before them and what will be after them, and they encompass nothing of His knowledge except for what He wills. His Kursi extends over the heavens and the earth, and their preservation tires Him not. And He is the Most High, the Most Great.",
  },
  {
    type: "آية",
    title: "سورة الإخلاص ١١٢:١-٤",
    englishTitle: "Surah Al-Ikhlas 112:1-4",
    text: "قُلْ هُوَ اللَّهُ أَحَدٌ ۝ اللَّهُ الصَّمَدُ ۝ لَمْ يَلِدْ وَلَمْ يُولَدْ ۝ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    translation:
      "Say, 'He is Allah, [who is] One, Allah, the Eternal Refuge. He neither begets nor is born, Nor is there to Him any equivalent.'",
  },
  {
    type: "آية",
    title: "سورة الفلق ١١٣:١-٥",
    englishTitle: "Surah Al-Falaq 113:1-5",
    text: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِنْ شَرِّ مَا خَلَقَ ۝ وَمِنْ شَرِّ غَاسِقٍ إِذَا وَقَبَ ۝ وَمِنْ شَرِّ النَّفَّاثَاتِ فِي الْعُقَدِ ۝ وَمِنْ شَرِّ حَاسِدٍ إِذَا حَسَدَ",
    translation:
      "Say, 'I seek refuge in the Lord of the daybreak, From the evil of what He has created, And from the evil of darkness when it settles, And from the evil of the blowers in knots, And from the evil of an envier when he envies.'",
  },
  {
    type: "آية",
    title: "سورة الناس ١١٤:١-٦",
    englishTitle: "Surah An-Nas 114:1-6",
    text: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ ۝ مَلِكِ النَّاسِ ۝ إِلَٰهِ النَّاسِ ۝ مِنْ شَرِّ الْوَسْوَاسِ الْخَنَّاسِ ۝ الَّذِي يُوَسْوِسُ فِي صُدُورِ النَّاسِ ۝ مِنَ الْجِنَّةِ وَالنَّاسِ",
    translation:
      "Say, 'I seek refuge in the Lord of mankind, The Sovereign of mankind, The God of mankind, From the evil of the retreating whisperer, Who whispers [evil] into the breasts of mankind, From among the jinn and mankind.'",
  },
  {
    type: "آية",
    title: "سورة الكهف ١٨:١٠",
    englishTitle: "Surah Al-Kahf 18:10",
    text: "إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِنْ لَدُنْكَ رَحْمَةً وَهَيِّئْ لَنَا مِنْ أَمْرِنَا رَشَدًا",
    translation:
      "When the youths took refuge in the cave and said, 'Our Lord, grant us from Yourself mercy and prepare for us from our affair right guidance.'",
  },
  {
    type: "آية",
    title: "سورة الأحزاب ٣٣:٧٠-٧١",
    englishTitle: "Surah Al-Ahzab 33:70-71",
    text: "يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَقُولُوا قَوْلًا سَدِيدًا ۝ يُصْلِحْ لَكُمْ أَعْمَالَكُمْ وَيَغْفِرْ لَكُمْ ذُنُوبَكُمْ ۗ وَمَنْ يُطِعِ اللَّهَ وَرَسُولَهُ فَقَدْ فَازَ فَوْزًا عَظِيمًا",
    translation:
      "O you who have believed, fear Allah and speak words of appropriate justice. He will [then] amend for you your deeds and forgive you your sins. And whoever obeys Allah and His Messenger has certainly attained a great attainment.",
  },
  {
    type: "آية",
    title: "سورة آل عمران ٣:١٣٣",
    englishTitle: "Surah Aal-E-Imran 3:133",
    text: "وَسَارِعُوا إِلَىٰ مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ أُعِدَّتْ لِلْمُتَّقِينَ",
    translation:
      "And hasten to forgiveness from your Lord and a garden as wide as the heavens and the earth, prepared for the righteous.",
  },
];

// Utility to get random content
const getRandomContent = () => {
  const randomIndex = Math.floor(Math.random() * islamicContent.length);
  return islamicContent[randomIndex];
};

// Function to manage notification timing
const useNotificationTiming = () => {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // Check if this is a new session or if an hour has passed
    const checkNotificationStatus = () => {
      const lastShown = localStorage.getItem("lastNotificationTime");
      const currentTime = new Date().getTime();

      // Show if never shown before or if an hour has passed
      if (!lastShown || currentTime - parseInt(lastShown) > 60 * 60 * 1000) {
        setShouldShow(true);
        localStorage.setItem("lastNotificationTime", currentTime.toString());
      }
    };

    // Initial check
    checkNotificationStatus();

    // Set up hourly interval
    const interval = setInterval(() => {
      setShouldShow(true);
      localStorage.setItem(
        "lastNotificationTime",
        new Date().getTime().toString()
      );
    }, 60 * 60 * 1000);

    // Clean up
    return () => clearInterval(interval);
  }, []);

  return { shouldShow, setShouldShow };
};

const IslamicNotification = () => {
  const [content, setContent] = useState(getRandomContent());
  const { shouldShow, setShouldShow } = useNotificationTiming();
  const [isVisible, setIsVisible] = useState(false);

  // Animation effect
  useEffect(() => {
    if (shouldShow) {
      setIsVisible(true);
      // Auto close after 15 seconds
      const timeout = setTimeout(() => {
        handleClose();
      }, 15000);
      return () => clearTimeout(timeout);
    }
  }, [shouldShow]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setShouldShow(false);
      // Get new content for next time
      setContent(getRandomContent());
    }, 300); // Wait for fade out animation
  };

  if (!shouldShow) return null;

  return (
    <div
      className={`fixed z-50 inset-0 overflow-y-auto ${
        isVisible ? "opacity-100" : "opacity-0"
      } transition-opacity duration-300`}
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="flex items-center justify-center min-h-screen px-4 text-center">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-middle bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <div className="flex justify-between items-center">
                  {/* Arabic title section */}
                  <h3
                    className="text-lg leading-6 font-medium text-blue-900"
                    id="modal-title"
                    style={{ color: "#1e40af" }}
                    dir="rtl"
                    lang="ar"
                  >
                    <span className="font-rubik font-bold">
                      {content.type}: {content.title}
                    </span>
                    <span
                      className="block text-xs mt-1 text-gray-500 font-normal"
                      dir="ltr"
                    >
                      {content.englishTitle}
                    </span>
                  </h3>
                  <button
                    onClick={handleClose}
                    className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>

                {/* Arabic Text */}
                <div className="mt-4 mb-3">
                  <p
                    className="text-xl text-right font-rubik font-bold"
                    dir="rtl"
                    lang="ar"
                  >
                    {content.text}
                  </p>
                </div>

                {/* Translation */}
                <div className="mt-2">
                  <p className="text-sm text-gray-700">{content.translation}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse justify-center">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 text-base font-medium text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              style={{ backgroundColor: "#1e40af" }}
              onClick={handleClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IslamicNotification;
