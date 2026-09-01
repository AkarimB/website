//import geoMagFactory from '../geomag.js';

//'use strict';
//console.log(window.location.href);

//console.log(window.location.origin);
var sound = new Audio("https://archive.org/download/dhikr_islam/adhan.mp3");
var soundFj = new Audio("https://archive.org/download/dhikr_islam/adhan-fajr.mp3");
sound.preload = "auto";
soundFj.preload = "auto";

var loc = document.getElementById("loc");
var srch = document.getElementById("srch");
var timetable = document.getElementById("timetable");
var arrowTab = document.getElementById("arrowTab");
var explainText = document.getElementById("explainText");

var viq = document.getElementById("viq");
var vim = document.getElementById("vim");
var tmsg = document.getElementById("tmsg");
var abuton = document.getElementById("abuton");
var adrr = document.getElementById("adrr");

var clickMAr = document.getElementById("clickMAr");
var clickMFr = document.getElementById("clickMFr");
var clickMEn = document.getElementById("clickMEn");
var infoNextPrayer = document.getElementById("infoNextPrayer");
var clickHideMessage = document.getElementById("clickHideMessage");
var monthList, lang, langR = "en-US", heritance, appDownload, title, inputHolder, after, midNightChange, isNow, noLocationNote, nightDuration, midNight, thirdNight, lastThirdNight;

var metaDesc = document.getElementsByTagName('meta')[0]
var tagInput = document.getElementsByTagName('input')[0]

var tinfo = document.getElementById("tinfo");
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const langParam = urlParams.get('lang')
//console.log(tagInput)
//var meta = document.createElement('meta');
//meta.name = "description" ;

if (navigator.language == 'fr' || navigator.language.slice(0, -3) == 'fr' || langParam == 'fr') {
    nightDuration = "Durée de la nuit"
    midNight = "Milieu de la nuit"
    thirdNight = "Tiers de la nuit";
    lastThirdNight = "Dernier tiers de la nuit"
    noLocationNote = "recherchez un lieu ou localisez vous";
    after = 'après';
    midNightChange = 'Les horaires des Prières changent à minuit';
    isNow = 'est maintenant';
    title = 'Horaires des prières et qiblah des villes à travers le monde';
    inputHolder = "Saisir une adresse ou un lieu";
    loc.innerHTML = 'Me Localiser';
    srch.innerHTML = 'Rechercher';
    lang = 'fr';
    langR = 'fr-FR';
    viq.innerHTML = 'Plan Qiblah';
    vim.innerHTML = 'Horaires du mois';
    abuton.innerHTML = 'Paramètres';
    clickHideMessage.innerHTML = 'Masquer';
    tmsg.innerHTML = 'Infos Islamiques';
    document.getElementById("tunePrayer").innerHTML = "Ajuster les Horaires";
    document.getElementById("dhuhrTuneLabel").innerHTML = "Dhouhr";
    monthList = ["Mouḥarram", "Ṣafar", "Rabī`ou l-‘awwal", "Rabī`ou al-‘ākhir", "Joumāda l-‘Oūlā", "Joumāda al-‘ākhirah",
        "Rajab", "Cha`bān", "Ramaḍān", "Chawwāl", "dhou l-Qa`dah", "dhou l-Ḥijjah"];

    heritance = '<p style="text-align: center;"><a href="../mirath/fr/index.html">Calcul Héritage</a></p>';
    appDownload = '<h2 style="text-align: center;">Télécharger application des horaires de la prière et la Qiblah: <a href="https://play.google.com/store/apps/details?id=net.sunnite.qiblasalat" rel="noreferrer" target="_blank">Qibla Salat Android</a> | <a href="https://apps.apple.com/us/app/islam-ms-prayer-times-qibla/id1003021268" rel="noreferrer" target="_blank">Qibla Salat IPhone</a></h2>';
    window.onload = clickMessage(lang, true);

} else if (navigator.language == 'ar' || navigator.language.slice(0, -3) == 'ar' || langParam == 'ar') {
    nightDuration = "مدة الليل"
    midNight = "منتصف الليل"
    thirdNight = "ثلث الليل";
    lastThirdNight = "الثلث الأخير من الليل"
    noLocationNote = "ابحث عن مكان أو حدد موقعك";
    midNightChange = 'مواقيت الصلوات تتغير عند منتصف الليل';
    after = 'بعد';
    isNow = 'الآن';
    title = 'أوقات الصلاة واتجاه القبلة لمدن العالم';
    inputHolder = "أدخل عنوان أو موقع";
    loc.innerHTML = 'حدد موقعي';
    srch.innerHTML = 'بحث';
    lang = 'ar';
    langR = 'ar-TN';
    viq.innerHTML = 'خريطة القبلة';
    vim.innerHTML = 'أوقات الشهر';
    abuton.innerHTML = 'الإعدادات';
    clickHideMessage.innerHTML = 'إخفاء';
    tmsg.innerHTML = 'معلومات دينية';
    document.getElementById("ishaLabel").innerHTML = "زاوية العشاء";
    document.getElementById("fajrLabel").innerHTML = "زاوية الفجر";
    document.getElementById("tunePrayer").innerHTML = "تعديل الأوقات";

    document.getElementById("fajrTuneLabel").innerHTML = "فجر";
    document.getElementById("dhuhrTuneLabel").innerHTML = "ظهر";
    document.getElementById("asrTuneLabel").innerHTML = "عصر";
    document.getElementById("maghribTuneLabel").innerHTML = "مغرب";
    document.getElementById("ishaTuneLabel").innerHTML = "عشاء";
    document.getElementById("elevationLabel").innerHTML = "الارتفاع";

    heritance = '<p style="text-align: center; direction: rtl;"><a href="../mirath/index.html">حساب الميراث</a></p>';
    appDownload = '<h2 style="text-align: center;">برنامج أوقات الصلاة والقبلة: <a href="https://play.google.com/store/apps/details?id=net.sunnite.qiblasalat" rel="noreferrer" target="_blank">Qibla Salat Android</a> | <a href="https://apps.apple.com/us/app/islam-ms-prayer-times-qibla/id1003021268" rel="noreferrer" target="_blank">Qibla Salat IPhone</a></h2>';
    monthList = ["محرم", "صفر", "ربيع الأول", "ربيع الآخر", "جمادى الأولى", "جمادى الآخرة",
        "رجب", "شعبان", "رمضان", "شوال", "ذو القعدة", "ذو الحجة"];
    window.onload = clickMessage(lang, true);
    //tinfo.style.direction = "rtl";
    //timetable.style.direction = "rtl";
    //arrowTab.style.direction = "rtl";
    // explainText.style.direction = "rtl";
    explainText.style.fontSize = "20px";
    explainText.style.lineHeight = "29px";
    //infoNextPrayer.style.fontSize = "20px";
    document.getElementsByTagName('body')[0].style.direction = "rtl";
    document.getElementsByTagName('body')[0].style.fontSize = "18px";
} else {
    nightDuration = "Night duration"
    midNight = "Middle of the night"
    thirdNight = "Third of the night";
    lastThirdNight = "Last third of the night"

    noLocationNote = "search Place or locate yourself";
    midNightChange = 'Prayers Times change at midnight';
    after = 'after';
    isNow = 'is now';
    title = 'Accurate Prayer Times and qiblah cities around the world';
    inputHolder = "Enter address or location"
    //meta.content = "Accurate Prayer Times and qiblah cities around the world";
    loc.innerHTML = 'Locate Me';
    srch.innerHTML = 'Search';
    lang = 'en';
    langR = 'en-US';
    viq.innerHTML = 'Qiblah Maps';
    vim.innerHTML = 'Month time table';
    abuton.innerHTML = 'Settings';
    tmsg.innerHTML = 'Islamic Infos';
    clickHideMessage.innerHTML = 'Hide';
    heritance = '<p style="text-align: center;"><a href="../mirath/en/index.html">Inheritance Calculation</a></p>';
    appDownload = '<h2 style="text-align: center;">Download Application for Prayer Times and Qiblah: <a href="https://play.google.com/store/apps/details?id=net.sunnite.qiblasalat" rel="noreferrer" target="_blank">Qibla Salat Android</a> | <a href="https://apps.apple.com/us/app/islam-ms-prayer-times-qibla/id1003021268" rel="noreferrer" target="_blank">Qibla Salat IPhone</a></h2>'
    monthList = ["Muḥarram", "Ṣafar", "Rabī`u l-‘awwal", "Rabī`u al-‘ākhir", "Jumāda l-‘Ūlā", "Jumāda al-‘ākhirah",
        "Rajab", "Cha`bān", "Ramaḍān", "Chawwāl", "dhu l-Qa`dah", "dhu l-Ḥijjah"];
    window.onload = clickMessage(lang, true);
}

//document.getElementsByTagName('head')[0].appendChild(meta);
document.getElementsByTagName('html')[0].setAttribute("lang", lang);
metaDesc.setAttribute("content", title)
tagInput.setAttribute("placeholder", inputHolder)
tagInput.setAttribute("aria-label", inputHolder)

document.title = title;
var regex = /qibla[.](com|pro)/g;
var heritAppend = appDownload;//window.location.origin.match(regex) ? appDownload : heritance;

function openSearch() {
    var element = document.getElementById("search");

    if (element.style.display == "block") {
        element.style.display = "none";
    } else { element.style.display = "block"; }
}

function displayDate(visualDate) {
    var day, lunarMonth, month, fullDate;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    var currentDate = new Date().toLocaleDateString(langR, options);
    fullDate = currentDate;

    if (visualDate) {
        var listD = visualDate.split(" ");
        var dateV = listD[2];
        var year = listD[1];
        let daysDif = daysDiff(dateV);

        if (daysDif == 0) {
            day = 1;
            lunarMonth = parseInt(listD[0]) - 1;
            month = monthList[lunarMonth];
            fullDate = day + " " + month + " " + year + " " + currentDate;
        } else if (daysDif < 0) {
            day = (parseInt(listD[3]) + daysDif + 1).toString()

            if (listD[0] == "1") {
                lunarMonth = 12 - 1;
                year--;
            } else {
                lunarMonth = parseInt(listD[0]) - 2;
            }

            month = monthList[lunarMonth];
            fullDate = day + " " + month + " " + year + " " + currentDate;

        } else if (daysDif < 29) {
            day = daysDif + 1;
            lunarMonth = parseInt(listD[0]) - 1;
            month = monthList[lunarMonth];
            fullDate = day + " " + month + " " + year + " " + currentDate;
        }
    }

    document.getElementById("tdate").innerHTML = fullDate;
}

function daysDiff(date) {
    if (date) {
        var dt1 = new Date(date.split('/').reverse().join('/'));
        var dt2 = new Date();
        return Math.floor((Date.UTC(dt2.getFullYear(), dt2.getMonth(), dt2.getDate()) - Date.UTC(dt1.getFullYear(), dt1.getMonth(), dt1.getDate())) / (1000 * 60 * 60 * 24));
    }
}

var visualDate = localStorage.nbm;
displayDate(visualDate);

var explanation = "";

var listPrayerNames, itemsP;
var monthName;

if (navigator.language == 'fr' || navigator.language.slice(0, -3) == 'fr' || langParam == 'fr') {
    explanation = "<p>Allâh ta`âlâ dit : <strong>{ إِنَّ الصَّلاَةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا }</strong>[sôurat An-Niçâ’] qui signifie : « <strong>Certes la prière a été prescrite pour les croyants dans son temps</strong>». Il est un devoir de vérifier les temps des prières par l’observation et il ne suffit pas de se fier à un calendrier basé sur le simple calcul. Voir <a target='_blank' rel='help' title='Explication des temps de prière. Horaires pour un mois' href='https://www.islam.ms/horaires-prieres-direction-qiblah-mecque'>Explication des Temps de Prières.</a></p><p>Le Fajr, son temps commence à l'apparition de la lueur blanche transversale à l'horizon Est et dure jusqu'à l'apparition de la première partie du soleil.</p><p>Le Dhouhr, son temps commence lorsque le soleil s'écarte du milieu du ciel et finit lorsque l'ombre d’une chose quelconque atteint une longueur égale à celle de la chose elle-même plus la longueur de l'ombre qu’elle avait quand le soleil était au plus haut dans le ciel.</p><p>Le Asr, son temps commence à la fin du temps du Dhouhr et dure jusqu'au Maghrib.</p><p>Le Maghrib, son temps commence après la disparition de la totalité du disque solaire, et dure jusqu'au Isha.</p><p>Le Isha, son temps commence à la disparition de la lueur rouge de l'horizon Ouest, et à la disparition de lueur blanche selon les Hanafiyy ; et dure jusqu'au Fajr.</p><p>Cinq minutes de précaution ont été ajoutées à chaque prière.</p> <p>Pour nous contacter, poser des questions sur l'Islam ou faire une demande de cours islamiques gratuits, veuillez nous envoyer un email à <a title='info@islam.ms' href='mailto:info@islam.ms'>info@islam.ms</a></p> <p style='text-align: center;'><a target='_blank' title='Apprendre l'islam selon la voie sunnite. Informations sur la religion musulmane' href='https://www.islam.ms'>Islam.ms</a></p>";

    var srchtmz = 'Fuseau horaire:';
    listPrayerNames = ['Imsak', 'Fajr', 'Lever', 'Dhouhr', 'Asr', 'Maghrib', 'Isha'];

    monthName = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    itemsP = {
        day: 'Jour',
        imsak: 'Imsak',
        fajr: 'Fajr',
        sunrise: 'Lever',
        dhuhr: 'Dhouhr',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha'
    };

} else if (navigator.language == 'ar' || navigator.language.slice(0, -3) == 'ar' || langParam == 'ar') {

    explanation = '<p>قال الله تبارك وتعالى: { إِنَّ الصَّلوةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا } [سورة النساء]. روى الطبراني بالإسناد الصحيح المتصل أن رسول الله صلى الله عليه وسلم قال:  « إن خيار عباد الله الذين يراعون الشمس والقمر والأظلة لذكر الله » رواه الطبراني، والمراد بذكر الله هنا الصلاة. فلا بد من المراقبة العيانية للتحقّق من دخول وقت الصلاة، ولا يكفي الاعتماد على مجرّد الحساب. أنظر: <a target="_blank" title=" rel="help" أحْكَام الصَّلاة" href="https://www.islam.ms/ar/%D8%A3%D9%88%D9%82%D8%A7%D8%AA-%D8%B5%D9%84%D8%A7%D8%A9-%D8%A7%D8%AA%D8%AC%D8%A7%D9%87-%D9%82%D8%A8%D9%84%D8%A9"> أحْكَام الصَّلاة.</a></p><p> الصبح يبدأ وقته بطلوع الفجر الصادق وينتهي بطلوع أول جزء من الشمس باعتبار الأرض المستوية. </p><p> الظهر يبدأ وقته بزوال الشمس أي ميلها عن وسط السماء إلى جهة المغرب، ويخرج وقتها عندما يصير ظل كل شيء مثله زيادة على ظل الإستواء.</p<p> العصر يبدأ وقته بانتهاء وقت الظهر، وينتهي بغروب كامل قرص الشمس. </p><p> المغرب يبدأ وقته بمغيب الشمس وينتهي بغياب الشفق الأحمر، والشفق الأحمر هو الحمرة التي تُرى في جهة المغرب بعد غروب الشمس. </p><p> العشاء يبدأ وقته بعد مغيب الشفق الأحمر، وبعد مغيب الشفق الأبيض عند الحنفية، وينتهي بطلوع الفجر الصادق وهو البياض المعترض في الأفق الشرقي. </p> <p>للاتّصال بنا أو طرح أسئلة دينية أو طلب دروس دينية مجانية الرّجاء إرسال رسالة عبر البريد التّالي: <a title="info@islam.ms" href="mailto:info@islam.ms">info@islam.ms</a></p> <p> خمس دقائق احتياطا أضيفت لكل صلاة.</p> <p style="text-align: center;"><a target="_blank" title="علم الدين على مذهب أهل السنة والجماعة. عقيدة المسلمين" href="https://www.islam.ms/ar/">Islam.ms</a></p>';

    var srchtmz = 'منطقة زمنية:';
    listPrayerNames = ['إمساك', 'فجر', 'شروق', 'ظهر', 'عصر', 'مغرب', 'عشاء'];
    monthName = ['جانفي', 'فيفري', 'مارس', 'أفريل', 'ماي', 'جوان', 'جويلية', 'أوت', 'سبتمبر', 'أكتور', 'نوفمبر', 'ديسمبر'];
    itemsP = {
        day: 'يوم',
        imsak: 'إمساك',
        fajr: 'فجر',
        sunrise: 'شروق',
        dhuhr: 'ظهر',
        asr: 'عصر',
        maghrib: 'مغرب',
        isha: 'عشاء'
    };

} else {
    explanation = '<p>Allâh ta`âlâ said : <strong>{ إِنَّ الصَّلاَةَ كَانَتْ عَلَى الْمُؤْمِنِينَ كِتَابًا مَّوْقُوتًا }</strong>[sôurat An-Niçâ’] which means: « <strong>Certainly the prayer was prescribed for believers in his time</strong>». It is a duty to check the times of prayers by observation and it is not enough to rely on a schedule based on the simple calculation. See <a target="_blank" rel="help" title="Explanation of prayer times" href="https://www.islam.ms/en/islamic-prayer-times">Explanation of prayer times.</a></p><p>Fajr time begins when appears the true dawn in the east horizon until sunrise.</p><p>Dhuhr time begins when the Sun begins to decline after reaching its highest point in the sky, until Asr.</p><p>Asr time begins when the length of any object\'s shadow equals the length of the object itself plus the length of that object\'s shadow at solar noon, until Maghrib.</p><p>Maghrib time begins when the sun disappears below the west horizon, until Isha.</p><p>Isha time begins when the red glow disappears from the west horizon, and when the white glow disappears from the west horizon according to the Hanafiyy, until Fajr.</p> <p>Five minutes of precaution has been added for each prayer.</p><p>To contact us, ask about Islam or apply for islamic free courses, please send us an email to: <a title="info@islam.ms" href="mailto:info@islam.ms">info@islam.ms</a></p>  <p style="text-align: center;"><a target="_blank" title="Learn Islam according to the Sunni Way. Information about Islam" href="https://www.islam.ms/en/">Islam.ms</a></p>';

    var srchtmz = 'Time zone:';
    listPrayerNames = ['Imsak', 'Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];
    monthName = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    itemsP = {
        day: 'Day',
        imsak: 'Imsak',
        fajr: 'Fajr',
        sunrise: 'Sunrise',
        dhuhr: 'Dhuhr',
        asr: 'Asr',
        maghrib: 'Maghrib',
        isha: 'Isha'
    };
}

explainText.innerHTML = explanation + appDownload;
const placeParam = urlParams.get('place')
const latParam = urlParams.get('lat')
const lonParam = urlParams.get('lon')
var defaultPlace, defaultLat, defaultLon;
console.log("query: " + queryString)
if (queryString) viq.setAttribute('onclick', "location.href='map.html" + queryString + "';");

defaultPlace = placeParam ? placeParam : "";
defaultLat = latParam ? latParam : 1000.0;
defaultLon = lonParam ? lonParam : 1000.0;

var jDate;
var Format12;
var elev, lat, lng, mecalat = 21.422484, mecalng = 39.826151;

if (localStorage.lat == null || localStorage.lng == null) {
    lat = Number(defaultLat);
    lng = Number(defaultLon);
} else {
    lat = Number(localStorage.lat);
    lng = Number(localStorage.lng);
}

Format12 = localStorage.format12 == 'format12' ? true : false;

if (localStorage.elev == null) { localStorage.elev = 0 }
elev = Number(localStorage.elev)

if (localStorage.ishaAngle == null) { localStorage.ishaAngle = 16 }
if (localStorage.fajrAngle == null) { localStorage.fajrAngle = 18 }

if (localStorage.fajrTune == null) { localStorage.fajrTune = 5 }
if (localStorage.dhuhrTune == null) { localStorage.dhuhrTune = 5 }
if (localStorage.asrTune == null) { localStorage.asrTune = 5 }
if (localStorage.maghribTune == null) { localStorage.maghribTune = 5 }
if (localStorage.ishaTune == null) { localStorage.ishaTune = 0 }
if (localStorage.addressName == null) { localStorage.addressName = defaultPlace }

var DMath = {

    dtr: function (d) {
        return (d * Math.PI) / 180.0;
    },
    rtd: function (r) {
        return (r * 180.0) / Math.PI;
    },

    sin: function (d) {
        return Math.sin(this.dtr(d));
    },
    cos: function (d) {
        return Math.cos(this.dtr(d));
    },
    tan: function (d) {
        return Math.tan(this.dtr(d));
    },

    arcsin: function (d) {
        return this.rtd(Math.asin(d));
    },
    arccos: function (d) {
        return this.rtd(Math.acos(d));
    },
    arctan: function (d) {
        return this.rtd(Math.atan(d));
    },

    arccot: function (x) {
        return this.rtd(Math.atan(1 / x));
    },
    arctan2: function (y, x) {
        return this.rtd(Math.atan2(y, x));
    },

    fixAngle: function (a) {
        return this.fix(a, 360);
    },
    fixHour: function (a) {
        return this.fix(a, 24);
    },

    fix: function (a, b) {
        a = a - b * (Math.floor(a / b));
        return (a < 0) ? a + b : a;
    }
}

function timeDiff(time1, time2) {
    return DMath.fixHour(time2 - time1);
}

function sunPosition(jd) {
    var D = jd - 2451545.0;
    var g = DMath.fixAngle(357.529 + 0.98560028 * D);
    var q = DMath.fixAngle(280.459 + 0.98564736 * D);
    var L = DMath.fixAngle(q + 1.915 * DMath.sin(g) + 0.020 * DMath.sin(2 * g));

    var R = 1.00014 - 0.01671 * DMath.cos(g) - 0.00014 * DMath.cos(2 * g);
    var e = 23.439 - 0.00000036 * D;

    var RA = DMath.arctan2(DMath.cos(e) * DMath.sin(L), DMath.cos(L)) / 15;
    var eqt = q / 15 - DMath.fixHour(RA);
    var decl = DMath.arcsin(DMath.sin(e) * DMath.sin(L));

    return {
        declination: decl,
        equation: eqt
    };
}

function midDay(time) {
    var eqt = sunPosition(jDate + time).equation;
    var noon = DMath.fixHour(12 - eqt);
    return noon;
}

function sunAngleTime(angle, time) {
    var decl = sunPosition(jDate + time).declination;
    var noon = midDay(time);
    var t = 1 / 15 * DMath.arccos((-DMath.sin(angle) - DMath.sin(decl) * DMath.sin(lat)) /
        (DMath.cos(decl) * DMath.cos(lat)));
    return noon + (angle > 90 ? -t : t);
}

function julian(year, month, day) {
    if (month <= 2) {
        year -= 1;
        month += 12;
    };
    var A = Math.floor(year / 100);
    var B = 2 - A + Math.floor(A / 4);

    var JD = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;

    return JD;
}

function computeAsr(factor, time) {
    var decl = sunPosition(jDate + time).declination;
    var angle = -DMath.arccot(factor + DMath.tan(Math.abs(lat - decl)));
    return sunAngleTime(angle, time);
}

function fajrTime(angle, timezone) {
    return sunAngleTime(180 - (Number(angle) + elevAngle()), timezone / 24);
}

function sunriseTime(timezone) {
    return sunAngleTime(180 - (0.833 + elevAngle()), timezone / 24);
}

function dhuhrTime(timezone) {
    return midDay(timezone / 24);
}

function asrTime(step, timezone) {
    return computeAsr(step, timezone / 24);
}

function maghribTime(timezone) {
    return sunAngleTime(0.833 + elevAngle(), timezone / 24);
}

function ishaTime(angle, timezone) {
    console.log("Fixed Angle:", angle);
    console.log("elevAngle() :", elevAngle());
    return sunAngleTime(Number(angle) + elevAngle(), timezone / 24);
}

function elevAngle() {
    return 0.0347 * Math.sqrt(elev); // Approximate height correction
}

function floattoHourMinute(time) {
    const totalMinutes = Math.floor(time * 60);
    let hours = Math.floor(totalMinutes / 60) % 24; // Wrap around 24h
    const minutes = totalMinutes % 60;
    return { hours, minutes };
}

function floattoTime(time) {
    let { hours, minutes } = floattoHourMinute(time);

    // Handle 24-hour overflow (24 → 0, 25 → 1, etc.)
    hours = hours % 24;

    // Handle 12-hour format (but keep 12 as 12, not 0)
    if (Format12) {
        hours = hours % 12 || 12; // Converts 0 → 12, 13 → 1, etc.
    }

    return addZero(hours) + ":" + addZero(minutes);
}

function getPrayerTimes(date, latitude, longitude, timezone) {
    elev = Number(localStorage.elev)
    lat = latitude;
    lng = longitude;
    var tune = 0.0833;
    var Hanafi = false;
    var ishaAngle = 16, fajrAngle = 18, asrStep = 1, fajrTune = tune, dhuhrTune = tune, asrTune = tune, maghribTune = tune, ishaTune = 0;

    fajrTune = Number(localStorage.fajrTune) / 60;
    dhuhrTune = Number(localStorage.dhuhrTune) / 60;
    asrTune = Number(localStorage.asrTune) / 60;
    maghribTune = Number(localStorage.maghribTune) / 60;
    ishaTune = Number(localStorage.ishaTune) / 60;

    ishaAngle = localStorage.ishaAngle;
    fajrAngle = localStorage.fajrAngle;
    Hanafi = localStorage.hanafi == "true" ? true : false

    asrStep = Hanafi ? 2 : 1;

    var lonDiff = longitude / (15.0 * 24.0);
    jDate = julian(date.getFullYear(), date.getMonth() + 1, date.getDate()) - lonDiff;

    var imsakD, fajrD, fajrDi, dhuhrD, asrD, maghribD, ishaD, sunD;
    fajrD = fajrTime(fajrAngle, timezone) + fajrTune + timezone - longitude / 15;
    fajrDi = fajrTime(18, timezone) + timezone - longitude / 15;
    dhuhrD = dhuhrTime(timezone) + 0.018 + dhuhrTune + timezone - longitude / 15;
    asrD = asrTime(asrStep, timezone) + asrTune + timezone - longitude / 15;
    maghribD = maghribTime(timezone) + 0.018 + maghribTune + timezone - longitude / 15;
    ishaD = ishaTime(ishaAngle, timezone) + 0.018 + ishaTune + timezone - longitude / 15;
    sunD = sunriseTime(timezone) + timezone - longitude / 15;

    var nightTime = timeDiff(maghribD, sunD);
    var midNight = 0.5 * nightTime;

    if (isNaN(fajrD) || timeDiff(fajrD, sunD) > midNight) {
        fajrD = sunD - midNight;
        fajrDi = sunD - midNight;
    }

    if (isNaN(ishaD) || timeDiff(maghribD, ishaD) > midNight) {
        ishaD = maghribD + midNight;
    }

    if (isNaN(maghribD) || timeDiff(maghribD, maghribD) > midNight) {
        maghribD = maghribD + midNight;
    }

    var nightDuration = timeDiff(maghribD, fajrDi);
    var secondMidNight = maghribD + (nightDuration / 2);
    var thirdNight = maghribD + (nightDuration / 3);
    var lastThirdNight = maghribD + ((nightDuration / 3) * 2);

    imsakD = fajrDi - 0.25;
    var times = [imsakD, fajrD, sunD, dhuhrD, asrD, maghribD, ishaD, nightDuration, secondMidNight, thirdNight, lastThirdNight];
    return times;
}


function prayDay(latitude, longitude) {
    var date = new Date();
    var timezone = -(date.getTimezoneOffset() / 60);
    var decHour, tuneFa, tuneDh, tuneAs, tuneMa, tuneIs;
    var times = getPrayerTimes(date, latitude, longitude, timezone);

    decHour = date.getHours() + (date.getMinutes() / 60);
    console.log("decHour: " + decHour)

    // Check if Isha is after Maghrib (normal) or before Maghrib (crosses midnight)
    var ishaAfterMaghrib = times[6] > times[5];

    if (ishaAfterMaghrib && decHour > times[6]) {
        // After Isha - need next day's times
        date.setDate(date.getDate() + 1)
        times = getPrayerTimes(date, latitude, longitude, timezone);
    }

    let { nextPrayerName, nextPrayerTime } = getNextPrayer(times, decHour);

    var backgroundColor = nextPrayerName == listPrayerNames[2] ? 'green' : '';
    document.getElementById('churuqDigit').style.backgroundColor = backgroundColor;

    var diffTime = nextPrayerTime - decHour;
    var totalMinutes = Math.floor(diffTime * 60);

    var textHour = "";
    if (totalMinutes <= 0) {
        textHour = nextPrayerName + " " + isNow;
    } else {
        var objHour = floattoHourMinute(diffTime);
        var diffHour = objHour.hours;
        var diffMinutes = objHour.minutes;

        const suffixH = String(diffHour).padStart(2, '0');
        const suffixM = String(diffMinutes).padStart(2, '0');
        textHour = nextPrayerName + " " + after + " " + suffixH + ":" + suffixM;
    }

    infoNextPrayer.innerHTML = textHour;

    tuneFa = Number(localStorage.fajrTune) >= 0 ? "+" + localStorage.fajrTune : "" + localStorage.fajrTune;
    tuneDh = Number(localStorage.dhuhrTune) >= 0 ? "+" + localStorage.dhuhrTune : "" + localStorage.dhuhrTune;
    tuneAs = Number(localStorage.asrTune) >= 0 ? "+" + localStorage.asrTune : "" + localStorage.asrTune;
    tuneMa = Number(localStorage.maghribTune) >= 0 ? "+" + localStorage.maghribTune : "" + localStorage.maghribTune;
    tuneIs = Number(localStorage.ishaTune) >= 0 ? "+" + localStorage.ishaTune : "" + localStorage.ishaTune;

    var listTune = [tuneFa, tuneDh, tuneAs, tuneMa, tuneIs];

    var htmlPrayer = ``;
    let listPrayer = [listPrayerNames[1], listPrayerNames[3], listPrayerNames[4], listPrayerNames[5], listPrayerNames[6]];
    let prayersTime = [times[1], times[3], times[4], times[5], times[6]];

    for (var i in listPrayer) {
        var append = listPrayer[i] == nextPrayerName ? 'style="background-color: green;"' : '';
        htmlPrayer += `<div ${append} class="prayerDigit"><div class="prayerText">${listPrayer[i]}</div><div class="prayDigit">${floattoTime(prayersTime[i])}</div><div class="prayerTune">${listTune[i]}</div></div>`;
    }

    document.getElementById('tablePrayer').innerHTML = htmlPrayer;

    var nightText = `${nightDuration} : ${floattoTime(times[7])}<br/>
        ${midNight} : ${floattoTime(times[8])}<br/>
        ${thirdNight} : ${floattoTime(times[9])}<br/>
        ${lastThirdNight} : ${floattoTime(times[10])}`;

    document.getElementById('nightInfo').innerHTML = nightText;

    document.getElementById('imsakText').innerText = listPrayerNames[0];
    document.getElementById('churuqText').innerText = listPrayerNames[2];
    document.getElementById('imsakTime').innerText = floattoTime(times[0]);
    document.getElementById('churuqTime').innerText = floattoTime(times[2]);

}


function getNextPrayer(times, decHour) {
    let ishaAfterMaghrib = times[6] > times[5];
    let prayerTimes;
    let prayerNames;

    // Standard prayer order (always the same)
    prayerNames = [listPrayerNames[1], listPrayerNames[2], listPrayerNames[3], listPrayerNames[4], listPrayerNames[5], listPrayerNames[6]];
    prayerTimes = [times[1], times[2], times[3], times[4], times[5], times[6]];

    // Find the next prayer
    let nextPrayerName = listPrayerNames[1];
    let nextPrayerTime = times[1];

    if (ishaAfterMaghrib) {
        // Normal case: Isha is before midnight
        for (let i = 0; i < prayerTimes.length; i++) {
            if (decHour <= prayerTimes[i]) {
                nextPrayerName = prayerNames[i];
                nextPrayerTime = prayerTimes[i];
                break;
            }
        }
        // If no prayer found (past Isha), next is Fajr tomorrow
        if (nextPrayerName === listPrayerNames[1] && decHour > times[6]) {
            nextPrayerTime = times[1] + 24;
        }
    } else {
        // Isha crosses midnight (e.g., Isha at 00:30)

        if (decHour <= times[6]) {
            // Before wrapped Isha (e.g., 00:30 and Isha is 01:00)
            nextPrayerName = listPrayerNames[6];
            nextPrayerTime = times[6];
        } else if (decHour < times[1]) {
            // After wrapped Isha, before Fajr (e.g., 02:00, Isha was 01:00, Fajr is 05:00)
            nextPrayerName = listPrayerNames[1];
            nextPrayerTime = times[1];
        } else {
            // During the day - use normal loop to find next prayer
            for (let i = 0; i < prayerTimes.length; i++) {
                if (decHour <= prayerTimes[i]) {
                    nextPrayerName = prayerNames[i];
                    nextPrayerTime = prayerTimes[i];
                    break;
                }
            }
            // If no prayer found (after Maghrib), next is wrapped Isha tomorrow
            if (nextPrayerName === listPrayerNames[1] && decHour > times[5]) {
                nextPrayerName = listPrayerNames[6];
                nextPrayerTime = times[6] + 24;
            }
        }
    }
    return { nextPrayerName, nextPrayerTime };
}

function displayClock() {
    var dt = new Date();
    var hh = ("0" + dt.getHours()).slice(-2);
    var mm = ("0" + dt.getMinutes()).slice(-2);
    var ss = ("0" + dt.getSeconds()).slice(-2);
    var date_string = hh + ":" + mm + ":" + ss;
    document.getElementById("clock").innerHTML = date_string;

    // Update prayer times and check for adhan at the start of each minute (when seconds = 0)
    if (ss === "00" && lat <= 90 && lng <= 180) {
        prayDay(lat, lng);
        adhanTimer();
    }
}

setInterval(function () { displayClock() }, 1000);

if (!localStorage.adr) {
    adrr.innerHTML = noLocationNote;
    infoNextPrayer.innerHTML = noLocationNote;
} else {
    adrr.innerHTML = localStorage.adr;
}

if (lat <= 90 && lng <= 180) {
    prayDay(lat, lng);
    tinfo = document.getElementById("tinfo");
    tinfo.innerHTML = displayTinfo(lat, lng);
    document.getElementById("address_name").innerHTML = localStorage.addressName;
}


function adhanf() {
    if (!localStorage.faCh) {
        document.getElementById("fajr").innerHTML = 'Fajr OFF';
    } else {
        document.getElementById("fajr").innerHTML = localStorage.faCh;
    }

    if (!localStorage.dhCh) {
        document.getElementById("dhuhr").innerHTML = 'Dhuhr OFF';
    } else {
        document.getElementById("dhuhr").innerHTML = localStorage.dhCh;
    }

    if (!localStorage.asCh) {
        document.getElementById("asr").innerHTML = 'Asr OFF';
    } else {
        document.getElementById("asr").innerHTML = localStorage.asCh;
    }

    if (!localStorage.maCh) {
        document.getElementById("maghrib").innerHTML = 'Maghrib OFF';
    } else {
        document.getElementById("maghrib").innerHTML = localStorage.maCh;
    }

    if (!localStorage.isCh) {
        document.getElementById("isha").innerHTML = 'Isha OFF';

    } else {
        document.getElementById("isha").innerHTML = localStorage.isCh;
    }

    if (localStorage.hanafi == "true") {
        document.getElementById("hanafi").innerHTML = 'Asr Hanafi';
    } else {
        document.getElementById("hanafi").innerHTML = 'Asr Shafi`i';
    }

    if (localStorage.format12 == 'format12') {
        document.getElementById("format12").innerHTML = 'Format 12';
    } else {
        document.getElementById("format12").innerHTML = 'Format 24';
    }

    document.getElementById('ishaAngle').value = localStorage.ishaAngle;
    document.getElementById('fajrAngle').value = localStorage.fajrAngle;

    document.getElementById('fajrTune').value = localStorage.fajrTune;
    document.getElementById('dhuhrTune').value = localStorage.dhuhrTune;
    document.getElementById('asrTune').value = localStorage.asrTune;
    document.getElementById('maghribTune').value = localStorage.maghribTune;
    document.getElementById('ishaTune').value = localStorage.ishaTune;
    document.getElementById('elevation').value = localStorage.elev;

    openMenu('dadhan')
}

function askNotificationPermission() {
    if (Notification.permission != "granted") {
        Notification.requestPermission().then(function (result) {
            console.log(result);
        });
    }
}

function acFajr() {

    if (localStorage.faCh == 'Fajr ON') {
        document.getElementById("fajr").innerHTML = 'Fajr OFF';
        localStorage.faCh = 'Fajr OFF';
    } else {
        document.getElementById("fajr").innerHTML = 'Fajr ON';
        localStorage.faCh = 'Fajr ON';
        askNotificationPermission();
    }
}

function acDhuhr() {

    if (localStorage.dhCh == 'Dhuhr ON') {
        document.getElementById("dhuhr").innerHTML = 'Dhuhr OFF';
        localStorage.dhCh = 'Dhuhr OFF';

    } else {
        document.getElementById("dhuhr").innerHTML = 'Dhuhr ON';
        localStorage.dhCh = 'Dhuhr ON';
        askNotificationPermission();
    }
}

function acAsr() {

    if (localStorage.asCh == 'Asr ON') {
        document.getElementById("asr").innerHTML = 'Asr OFF';
        localStorage.asCh = 'Asr OFF';
    } else {
        document.getElementById("asr").innerHTML = 'Asr ON';
        localStorage.asCh = 'Asr ON';
        askNotificationPermission();
    }
}

function acMaghrib() {

    if (localStorage.maCh == 'Maghrib ON') {
        document.getElementById("maghrib").innerHTML = 'Maghrib OFF';
        localStorage.maCh = 'Maghrib OFF';

    } else {
        document.getElementById("maghrib").innerHTML = 'Maghrib ON';
        localStorage.maCh = 'Maghrib ON';
        askNotificationPermission();
    }
}

function acIsha() {

    if (localStorage.isCh == 'Isha ON') {
        document.getElementById("isha").innerHTML = 'Isha OFF';
        localStorage.isCh = 'Isha OFF';

    } else {
        document.getElementById("isha").innerHTML = 'Isha ON';
        localStorage.isCh = 'Isha ON';
        askNotificationPermission();
    }
}

function setAngle() {
    localStorage.ishaAngle = document.getElementById('ishaAngle').value;
    localStorage.fajrAngle = document.getElementById('fajrAngle').value;

    localStorage.fajrTune = document.getElementById('fajrTune').value;
    localStorage.dhuhrTune = document.getElementById('dhuhrTune').value;
    localStorage.asrTune = document.getElementById('asrTune').value;
    localStorage.maghribTune = document.getElementById('maghribTune').value;
    localStorage.ishaTune = document.getElementById('ishaTune').value;
    localStorage.elev = document.getElementById('elevation').value;

    prayDay(lat, lng);
    viewMonth(0);
}

function acHanafi() {

    if (localStorage.hanafi == "true") {
        localStorage.hanafi = 'false';
        document.getElementById("hanafi").innerHTML = 'Asr Shafi`i';
        prayDay(lat, lng);
        viewMonth(0);
        //alert('OFF');
    } else {
        localStorage.hanafi = 'true';
        document.getElementById("hanafi").innerHTML = 'Asr Hanafi';
        prayDay(lat, lng);
        viewMonth(0);
        //alert('ON');
    }
}

function openMenu(element) {
    var element = document.getElementById(element);
    if (element.style.display == "block") {
        element.style.display = "none";
    } else { element.style.display = "block"; }
}

function setFormat() {

    if (localStorage.format12 == 'format12') {
        Format12 = false;
        document.getElementById("format12").innerHTML = 'Format 24';
        localStorage.format12 = 'format24';
        prayDay(lat, lng);
        viewMonth(0);
        //alert('OFF');

    } else {
        Format12 = true;
        document.getElementById("format12").innerHTML = 'Format 12';
        localStorage.format12 = 'format12';
        prayDay(lat, lng);
        viewMonth(0);
        //alert('ON');
    }
}

function addZero(num) {
    return String(num).padStart(2, '0');
}


setInterval(function () { displayDate(visualDate) }, 24 * 60 * 60 * 1000);

function adhanTimer() {

    var date = new Date();
    var timezone = -(date.getTimezoneOffset() / 60);
    var h = addZero(date.getHours());
    var m = addZero(date.getMinutes());
    var x = h + ":" + m;

    var times = getPrayerTimes(date, lat, lng, timezone);

    var decHour = date.getHours() + (date.getMinutes() / 60);

    if (decHour > times[6]) {
        date.setDate(date.getDate() + 1)
        times = getPrayerTimes(date, lat, lng, timezone);
    }

    var fa = floattoTime(times[1]);
    var dh = floattoTime(times[3]);
    var asr = floattoTime(times[4]);
    var ma = floattoTime(times[5]);
    var is = floattoTime(times[6]);


    if (fa == x) {
        if (localStorage.faCh == 'Fajr ON') {
            soundFj.play();
            playNotification('Salat al-Fajr  صلاة الفجر')
        }
    }

    if (dh == x) {
        if (localStorage.dhCh == 'Dhuhr ON') {
            sound.play();
            playNotification('Salat adh-Dhuhr  صلاة الظهر')
        }
    }

    if (asr == x) {
        if (localStorage.asCh == 'Asr ON') {
            sound.play();
            playNotification('Salat al-Asr  صلاة العصر')
        }
    }

    if (ma == x) {
        if (localStorage.maCh == 'Maghrib ON') {
            sound.play();
            playNotification('Salat al-Maghrib  صلاة المغرب')
        }
    }

    if (is == x) {
        if (localStorage.isCh == 'Isha ON') {
            sound.play();
            playNotification('Salat al-Ishaa  صلاة العشاء')
        }
    }
}

function playNotification(title) {
    if (Notification.permission == 'granted') {
        let img = 'favicon.png';
        let text = title;
        let notification = new Notification('Islam.ms', { body: text, icon: img });
    }
}
// view monthly timetable
var currentDate = new Date();
function viewMonth(offset) {

    currentDate.setMonth(currentDate.getMonth() + 1 * offset);
    var month = currentDate.getMonth();
    var year = currentDate.getFullYear();
    var title = monthName[month] + ' ' + year;
    $$('table-title').innerHTML = title;
    makeTable(year, month);
}

// make monthly timetable
function makeTable(year, month) {
    var date = new Date();
    var timezone = -(date.getTimezoneOffset() / 60);

    var tbody = document.createElement('tbody');

    tbody.appendChild(makeTableRow(itemsP, itemsP, 'head-row'));

    var date = new Date(year, month, 1);
    var endDate = new Date(year, month + 1, 1);

    while (date < endDate) {
        var times = getPrayerTimes(date, lat, lng, timezone);
        var elements = {
            day: date.getDate(),
            imsak: floattoTime(times[0]),
            fajr: floattoTime(times[1]),
            sunrise: floattoTime(times[2]),
            dhuhr: floattoTime(times[3]),
            asr: floattoTime(times[4]),
            maghrib: floattoTime(times[5]),
            isha: floattoTime(times[6])
        };

        var today = new Date();
        var isToday = (date.getMonth() == today.getMonth()) && (date.getDate() == today.getDate());
        var klass = isToday ? 'today-row' : '';
        tbody.appendChild(makeTableRow(elements, itemsP, klass));
        //console.log(times);
        date.setDate(date.getDate() + 1);
        // next day
    }
    removeAllChild($$('timetable'));
    $$('timetable').appendChild(tbody);
}

// make a table row
function makeTableRow(data, itemsP, klass) {
    var row = document.createElement('tr');
    //console.log(data);

    for (var i in itemsP) {
        var cell = document.createElement('td');
        cell.innerHTML = data[i];
        cell.style.width = i == 'day' ? '2.5em' : '3.7em';
        row.appendChild(cell);
    }

    row.className = klass;
    return row;
}

// remove all children of a node
function removeAllChild(node) {
    if (node == undefined || node == null)
        return;
    while (node.firstChild)
        node.removeChild(node.firstChild);
}

// update table
function update() {
    viewMonth(0);
}

function $$(id) {
    return document.getElementById(id);
}

function displayMonthTable() {
    if (lat <= 90 && lng <= 180) {
        viewMonth(0);
        openMenu('tmonth')
    }
}

function getElevation() {
    // Retrieve latitude and longitude from localStorage
    lat = localStorage.lat;
    lng = localStorage.lng;

    // Validate latitude and longitude
    if (lat <= 90 && lng <= 180) {
        // Construct the API request URL
        const link = `https://api.islam.ms/elevation?lat=${lat}&lng=${lng}`;

        // Fetch elevation data from the API
        fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(objJSON => {
                // Check if the API returned a valid response
                if (objJSON.status === "OK" && objJSON.results && objJSON.results.length > 0) {
                    // Extract elevation from the first result
                    const elevation = objJSON.results[0].elevation;
                    console.log("Elevation:", elevation, "meters");

                    localStorage.elev = elevation.toFixed(2);
                    elev = elevation.toFixed(2);
                    document.getElementById('elevation').value = elevation.toFixed(2);
                    setAngle();
                } else {
                    console.error("No elevation data found.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    } else {
        console.error("Invalid latitude or longitude.");
    }
}

function searchAddress(address) {

    if (address) {
        var link = `https://nominatim.openstreetmap.org/search?q=${address}&polygon_geojson=1&format=jsonv2`;

        fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(objJSON => {
                if (objJSON[0]?.lat && objJSON[0]?.lon) {
                    lat = Number(objJSON[0].lat);
                    lng = Number(objJSON[0].lon);
                    var addressName = objJSON[0]?.display_name ?? "";
                    localStorage.lat = lat;
                    localStorage.lng = lng;
                    localStorage.addressName = addressName;
                    document.getElementById("address_name").innerHTML = addressName;
                    var date = new Date();
                    var timezone = -(date.getTimezoneOffset() / 60);
                    localStorage.tmz = timezone;
                    prayDay(lat, lng);
                    viewMonth(0);
                    document.getElementById('adrr').innerHTML = address;
                    localStorage.adr = address;
                    var tinfo = document.getElementById("tinfo");
                    tinfo.innerHTML = displayTinfo(lat, lng);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}


function InitMyPosition() {

    var options = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 };

    navigator.geolocation.getCurrentPosition(function (position) {
        lat = position.coords.latitude;
        lng = position.coords.longitude;
        console.log(lng)
        localStorage.lat = lat;
        localStorage.lng = lng;
        var date = new Date();
        var timezone = -(date.getTimezoneOffset() / 60);
        localStorage.tmz = timezone;
        prayDay(lat, lng);
        viewMonth(0);
        ReverseGeoCoding(lat, lng);
        var tinfo = document.getElementById("tinfo");
        tinfo.innerHTML = displayTinfo(lat, lng);

    }, function (error) {
        console.log("InitMyPosition: " + error)
    }, options);
}

function CalculateHeading(latitude, longitude) {
    var lat1 = (latitude * Math.PI) / 180;
    var lon1 = (longitude * Math.PI) / 180;
    var lat2 = (mecalat * Math.PI) / 180;
    var lon2 = (mecalng * Math.PI) / 180;
    var dLon = lon2 - lon1;
    var dPhi = Math.log(Math.tan(lat2 / 2.0 + Math.PI / 4.0) / Math.tan(lat1 / 2.0 + Math.PI / 4.0));
    if (Math.abs(dLon) > Math.PI)
        dLon = (dLon > 0) ? -(2 * Math.PI - dLon) : (2 * Math.PI + dLon);
    var azimuthRadians = Math.atan2(dLon, dPhi);
    var capb1 = (azimuthRadians * 180) / Math.PI;
    var capb = (capb1 >= 0) ? capb1 : (capb1 + 360);

    return capb;
}

function CalculateDeviation(latitude, longitude) {
    var date = new Date();
    var geoMag = geoMagFactory();
    return geoMag(latitude, longitude, elev * 3.28084, date).dec;
}

function getCompassNumber360(latitude, longitude) {
    var Heading = CalculateHeading(latitude, longitude);
    var magnetic = CalculateDeviation(latitude, longitude);
    return 360 - (Heading - (magnetic));
}

function GetQiblaMagnetic(lat, lng) {
    var Heading = CalculateHeading(lat, lng);
    var magnetic = CalculateDeviation(lat, lng);
    return Heading - (magnetic);
}

function getCompassNumber400(latitude, longitude) {
    return ((getCompassNumber360(latitude, longitude)) / 360) * 400;
}

function ReverseGeoCoding(lat, lon) {
    var link = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&zoom=18&format=jsonv2`;

    fetch(link)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(objJSON => {
            console.log(objJSON.address);

            if (objJSON.address) {
                var addObject = objJSON.address;
                var road, houseNumber, county, postcode;
                houseNumber = addObject.house_number ?? "";
                road = addObject.road ?? "";
                county = addObject.county ?? "";
                postcode = addObject.postcode ?? "";
                county = addObject.city ?? county;

                var address = `${houseNumber} ${road} ${county} ${postcode}`;
                document.getElementById("address_name").innerHTML = address;
                localStorage.addressName = address;
                localStorage.lat = lat;
                localStorage.lng = lon;
                document.getElementById('adrr').innerHTML = address;
                localStorage.adr = address;
                //displayTinfo(lat, lon);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('adrr').innerHTML = `Lat: ${lat.toFixed(3)} / Lng: ${lon.toFixed(3)}`;
            localStorage.adr = `Lat: ${lat.toFixed(3)} / Lng: ${lon.toFixed(3)}`;
        });
}


function displayTinfo(latitude, longitude) {
    var lat1 = latitude.toFixed(3);
    var long1 = longitude.toFixed(3);
    var latMeca = mecalat.toFixed(3);
    var longMeca = mecalng.toFixed(3);
    var decMag = CalculateDeviation(latitude, longitude).toFixed(3);
    var qiblaC = CalculateHeading(latitude, longitude).toFixed(3);
    var qiblaM = GetQiblaMagnetic(latitude, longitude).toFixed(3);
    var b360 = getCompassNumber360(latitude, longitude).toFixed(3);
    var b400 = getCompassNumber400(latitude, longitude).toFixed(3);

    if (navigator.language == 'fr' || navigator.language.slice(0, -3) == 'fr' || langParam == 'fr') {

        var srchlat = 'Lieu: Latitude:';
        var srchlong = 'Longitude:';
        var srchlatm = 'Ka`bah Lat:';
        var srchmag = 'Déviation Magnétique:';
        var srchqib = 'Qiblah, Cap:';
        var srchqibm = 'Qiblah magnétique:';
        var srchcom3 = 'Numéro boussole 360:';
        var srchcom4 = 'Numéro boussole 400:';

    } else if (navigator.language == 'ar' || navigator.language.slice(0, -3) == 'ar' || langParam == 'ar') {
        var srchlat = 'خط العرض:';
        var srchlong = 'خط الطول:';
        var srchlatm = 'الكعبة خط العرض:';
        var srchmag = 'الانحراف المغناطيسي:';
        var srchqib = 'قبلة:';
        var srchqibm = 'قبلة المغناطيسية:';
        var srchcom3 = 'رقم بوصلة 360:';
        var srchcom4 = 'رقم بوصلة 400:';

    } else {
        var srchlat = 'Latitude:';
        var srchlong = 'Longitude:';
        var srchlatm = 'Ka`bah Lat:';
        var srchmag = 'Magnetic Deviation:';
        var srchqib = 'Qiblah, Heading:';
        var srchqibm = 'Qiblah magnetic:';
        var srchcom3 = 'Compass 360 number:';
        var srchcom4 = 'Compass 400 number:';
    }

    var message = `${srchlat} ${lat1} ${srchlong} ${long1}<br/>
        ${srchlatm} ${latMeca} ${srchlong} ${longMeca}<br/>
        ${srchtmz} ${localStorage.tmz}<br/>
        ${srchmag} ${decMag}<br/>
        ${srchqib} ${qiblaC}<br/>
        ${srchqibm} ${qiblaM}<br/>
        ${srchcom3} ${b360}<br/>
        ${srchcom4} ${b400}`;

    localStorage.message = message;
    return message;

}

//window.onload = mainMessage(lang);
const messages = "dars";
//var listElm = document.querySelector('#tmessage');
const listElm = document.getElementById('tmessage');
var db;
var id, idFr, idAr, idEn;
var now = new Date();
var ndate = now.toLocaleDateString('fr-FR');
var dateMs, dateFr, dateAr, dateEn;

function openAndUpgradeDB() {
    var DBOpenRequest = window.indexedDB.open('QiblaSalatDB', 3);

    DBOpenRequest.onerror = function (event) {
        console.error('Error opening database:', event);
    };

    DBOpenRequest.onupgradeneeded = function (event) {
        var db = event.target.result;

        // Create or modify the database structure in this event handler
        var objectStore = db.createObjectStore(messages, { keyPath: 'id', autoIncrement: true });

        // Create indexes or perform other upgrade actions
        objectStore.createIndex('title', 'title', { unique: false });
        objectStore.createIndex('message', 'message', { unique: false });
        objectStore.createIndex('lang', 'lang', { unique: false });
        objectStore.createIndex('audio', 'audio', { unique: false });
        objectStore.createIndex('ord', 'ord', { unique: false });
        objectStore.createIndex('ver', 'ver', { unique: false });
        objectStore.createIndex('type', 'type', { unique: false });

        objectStore.createIndex('typeLang', ['type', 'lang'], { unique: false });

        // Additional upgrade actions can be added here
    };

    return new Promise(function (resolve, reject) {
        DBOpenRequest.onsuccess = function (event) {
            var db = event.target.result;

            // Resolve the promise with the database instance
            resolve(db);
        };

        DBOpenRequest.onerror = function (event) {
            // Reject the promise with the error event
            reject(event);
        };
    });
}

/*
openAndUpgradeDB()
    .then(function (db) {
        // Use the opened database
        console.log('Database opened successfully:', db);
 
        // Perform other actions using the database
    })
    .catch(function (error) {
        console.error('Error opening database:', error);
    });
*/

function clickMessageH() {
    document.getElementById('tmessage').style.display = 'none';
}

function clickMessage(lang, limit) {
    let type = "dars", transaction, objectStore, index, keyRange, request
    document.getElementById('tmessage').innerHTML = "";
    let id = 0, ids = 0
    openAndUpgradeDB()
        .then(function (db) {
            transaction = db.transaction(messages, "readonly");
            objectStore = transaction.objectStore(messages);
            index = objectStore.index("typeLang");
            keyRange = IDBKeyRange.only([type, lang]);
            request = index.openCursor(keyRange, 'prev');
            request.onsuccess = function (event) {
                var cursor = event.target.result;
                if (cursor) {
                    id = cursor.value.ord
                }
                id++;
                loadMessages(lang, limit, false)
                getMessage(lang, id)

                console.log("id value: ", id)

                document.getElementById('tmessage').style.display = 'block';
            }

            transaction.oncomplete = function (event) {
                console.log("transaction.oncomplete: " + event);
                type = "date"
                transaction = db.transaction(messages, "readonly");
                objectStore = transaction.objectStore(messages);
                index = objectStore.index("typeLang");
                keyRange = IDBKeyRange.only([type, lang]);
                request = index.openCursor(keyRange, 'prev');
                request.onsuccess = function (event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        ids = cursor.value.ord
                    }

                    loadMessages(lang, limit, false)
                    getMessageDate(lang, ids)

                    console.log("ids value: ", ids)

                    document.getElementById('tmessage').style.display = 'block';
                }
                if (db) {
                    db.close
                    console.log("db closed")
                }
            };
        })
        .catch(function (error) {
            console.error('Error opening database:', error);
        });
}


function addToDB(lang, newItem) {

    openAndUpgradeDB()
        .then(function (db) {
            // Use the opened database
            console.log('Database opened successfully:', db);

            var transaction = db.transaction([messages], "readwrite");

            transaction.oncomplete = function (event) {
                console.log("transaction.oncomplete: " + event);

            };

            transaction.onerror = function (event) {
                console.log("transaction.onerror: " + event);
            };

            var objectStore = transaction.objectStore(messages);
            var objectStoreRequest = objectStore.add(newItem[0]);
            objectStoreRequest.onsuccess = function (event) {

                loadMessages(lang, false, true)
            };
        })
        .catch(function (error) {
            console.error('Error opening database:', error);
        });

};

function loadMessages(lang, limit, one) {
    openAndUpgradeDB()
        .then(function (db) {
            // Use the opened database
            console.log('Database opened successfully:', db);
            var i = 0;
            var transaction = db.transaction(messages, "readonly");
            var objectStore = transaction.objectStore(messages);
            var index = objectStore.index("lang");
            var singleKeyRange = IDBKeyRange.only(lang);
            var request = index.openCursor(singleKeyRange, 'prev');
            request.onsuccess = function (event) {
                var cursor = event.target.result;
                var div = document.createElement("div");
                if (cursor) {

                    if (lang == "ar") div.setAttribute("class", "tmessageAr"); else div.setAttribute("class", "tmessage")
                    let h1 = ""
                    let content = "", mediaContent = ""
                    let media;
                    let divContent = ""

                    h1 = `<h1>${cursor.value.title}</h1>`;

                    if (cursor.value.audio) {

                        if (cursor.value.audio.charAt(cursor.value.audio.length - 1) == "4") {
                            media = "video";
                        } else {
                            media = "audio";
                        }

                        mediaContent = `<${media} controls="controls" preload="none" src="${cursor.value.audio}"></${media}>`
                    }

                    content = cursor.value.message;

                    divContent = h1 + mediaContent + content
                    div.innerHTML = divContent;
                    if (one) {
                        listElm.insertBefore(div, listElm.childNodes[0]);
                    } else listElm.appendChild(div);

                    if (!one) {
                        i++;
                        console.log("i value: " + i)
                        if (!limit) {
                            cursor.continue()
                        } else if (i <= 2) { cursor.continue(); }
                    }

                } else {

                }
            };

        })
        .catch(function (error) {
            console.error('Error opening database:', error);
        });
}

function getMessage(lang, id) {
    console.log("getMessage: ")
    const type = "dars"
    if (true) {
        var link = `https://api.islam.ms/dars/${lang}/${id}`;

        fetch(link)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                return response.json();
            })
            .then(objJSON => {
                if (objJSON.length >= 4) {
                    const message = objJSON[2];
                    const title = objJSON[1];
                    const audio = objJSON[3] ?? "";
                    const ver = objJSON[5] ?? 0;

                    const newItem = [{ message: message, title: title, audio: audio, lang: lang, ord: id, ver: ver, type: type }]

                    addToDB(lang, newItem);
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

}

function getMessageDate(lang, ids) {
    const type = "date"
    // const ids = Number(localStorage.getItem("ids"+lang)) ?? 0

    const link = `https://api.islam.ms/nmbr/${lang}/1`;

    fetch(link)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(objJSON => {
            if (objJSON.length >= 4) {
                const nb = objJSON[1];
                const nbd = objJSON[2];
                const nbm = objJSON[3];

                if (nbm) {
                    localStorage.nbm = nbm;
                    displayDate(nbm);
                }

                if (nb > ids) {
                    const dateLink = `https://api.islam.ms/date/${lang}/${nbd}`;

                    fetch(dateLink)
                        .then(dateResponse => {
                            if (!dateResponse.ok) {
                                throw new Error(`HTTP error! Status: ${dateResponse.status}`);
                            }
                            return dateResponse.json();
                        })
                        .then(dateObjJSON => {
                            if (dateObjJSON.length >= 4) {
                                const message = dateObjJSON[2];
                                const title = dateObjJSON[1];
                                const audio = dateObjJSON[3] ?? "";
                                const ver = dateObjJSON[5] ?? 0;

                                const newItem = [{ message: message, title: title, audio: audio, lang: lang, ord: nb, ver: ver, type: type }]

                                addToDB(lang, newItem);
                            }
                        })
                        .catch(dateError => {
                            console.error('Date Error:', dateError);
                        });
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
