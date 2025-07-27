import React from "react";

const people = [
  "Muhammed",
  "Bedirhan",
  "Taha",
  "Mehmet",
  "S.mehmet",
  "Caner",
  "M.İsa",
  "Ercan abi",
  "Mustafa abi",
];

const skipDays = [0, 1]; // 0 = Pazar, 1 = Pazartesi

/**
 * Belirli bir başlangıç tarihinden bugüne kadar atlanmayan gün sayısını hesaplar
 * ve bu sayının kişi listesi uzunluğuna göre modunu alarak geçerli kişi indeksini döndürür.
 * Bu, sıranın hangi kişide olduğunu belirler.
 * @returns {number} Geçerli gün için kişi listesindeki indeks.
 */
function getValidDayIndex() {
  const startDate = new Date("2024-01-01"); // Sıranın başlangıç tarihi
  const today = new Date(); // Bugünün tarihi

  let count = 0; // Geçerli gün sayacı
  let date = new Date(startDate); // Başlangıç tarihinden itibaren döngü için kullanılacak tarih

  // Başlangıç tarihinden bugüne kadar olan her günü kontrol et
  while (date < today) {
    const day = date.getDay(); // Günün haftanın kaçıncı günü olduğunu al (0=Pazar, 1=Pazartesi, ...)
    if (!skipDays.includes(day)) {
      // Eğer gün atlanacak günler arasında değilse sayacı artır
      count++;
    }
    date.setDate(date.getDate() + 1); // Bir sonraki güne geç
  }

  return count % people.length; // Toplam geçerli gün sayısının kişi listesi uzunluğuna göre modunu al
}

/**
 * Verilen bir tarihten sonraki ilk geçerli günü bulur.
 * Atlanacak günleri (skipDays) pas geçer.
 * @param {Date} fromDate - Başlangıç tarihi.
 * @returns {Date} Bir sonraki geçerli tarih.
 */
function getNextValidDate(fromDate) {
  const next = new Date(fromDate); // Başlangıç tarihini kopyala
  next.setDate(next.getDate() + 1); // Bir sonraki güne geç

  // Atlanacak günler arasında olduğu sürece bir sonraki güne geçmeye devam et
  while (skipDays.includes(next.getDay())) {
    next.setDate(next.getDate() + 1);
  }
  return next; // Bulunan geçerli tarihi döndür
}

/**
 * Bir Date nesnesini "haftanın günü, gün ay" formatında Türkçe olarak biçimlendirir.
 * Örnek: "Salı, 25 Temmuz"
 * @param {Date} date - Biçimlendirilecek Date nesnesi.
 * @returns {string} Biçimlendirilmiş tarih dizesi.
 */
function formatDate(date) {
  return date.toLocaleDateString("tr-TR", {
    weekday: "long", // Haftanın günü (örn: Salı)
    day: "2-digit", // Gün (örn: 01, 25)
    month: "long", // Ayın tam adı (örn: Temmuz)
  });
}

function App() {
  const today = new Date(); // Bugünün tarihi
  const isSkipDay = skipDays.includes(today.getDay()); // Bugün atlanacak bir gün mü?
  const currentIndex = getValidDayIndex(); // Bugünkü kişi için indeks
  const todayPerson = people[currentIndex]; // Bugünkü kişi
  const nextIndex = (currentIndex + 1) % people.length; // Yarınki kişi için indeks
  const nextPerson = people[nextIndex]; // Yarınki kişi
  const nextDate = getNextValidDate(today); // Yarınki geçerli tarih

  return (
    // Ana kapsayıcı: Ekranın ortasında, mavi tonlu arka plan, esnek düzen
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-800 p-4 sm:p-6 md:p-8 font-inter">
      {/* İçerik kartı: Beyaz arka plan, yuvarlak köşeler, gölge, ortalanmış */}
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-md w-full space-y-6 transform transition-all duration-300 hover:scale-105">
        {/* Başlık */}
        <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 mb-6 text-center tracking-tight">
          Kola Sırası
        </h1>

        {/* Atlanacak gün mesajı */}
        {isSkipDay ? (
          <div className="bg-red-50 border border-red-200 text-red-700 font-semibold text-lg py-3 px-5 rounded-xl text-center shadow-md">
            Bugün (<span className="font-bold">{formatDate(today)}</span>) sıra yok.
          </div>
        ) : (
          // Bugünkü kişi bilgisi
          <div className="bg-blue-50 border border-blue-200 mb-6 p-5 rounded-2xl shadow-lg transform transition-all duration-200 hover:shadow-xl">
            <p className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">
              Bugünkü kişi: <strong className="text-blue-700">{todayPerson}</strong>
            </p>
            <p className="text-gray-600 text-base sm:text-lg">({formatDate(today)})</p>
          </div>
        )}

        {/* Yarınki kişi bilgisi (eğer bugün atlanacak bir gün değilse) */}
        {!isSkipDay && (
          <div className="bg-blue-100 border border-blue-300 mb-8 p-5 rounded-2xl shadow-lg transform transition-all duration-200 hover:shadow-xl">
            <p className="text-2xl sm:text-3xl text-blue-800 mb-2">
              Yarınki kişi: <span className="font-semibold text-blue-600">{nextPerson}</span>
            </p>
            <p className="text-gray-500 text-base sm:text-lg">({formatDate(nextDate)})</p>
          </div>
        )}

        {/* Tüm sıra listesi başlığı */}
        <h2 className="text-2xl sm:text-3xl font-bold text-blue-700 mb-4 text-center border-b-2 border-blue-300 pb-2">
          Tüm Sıra:
        </h2>
        {/* Tüm sıra listesi */}
        <ul className="bg-blue-50 p-5 rounded-2xl shadow-inner text-left space-y-3 border border-blue-200">
          {people.map((person, index) => (
            <li key={index} className="text-gray-700 text-lg sm:text-xl flex items-center">
              <span className="font-bold text-blue-600 mr-2">{index + 1}.</span> {person}
              {/* Eğer bugünkü kişi ise yanında küçük bir işaret */}
              {index === currentIndex && !isSkipDay && (
                <span className="ml-2 text-green-500 text-xl" title="Bugünkü kişi">
                  &#10003; {/* Checkmark icon */}
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;