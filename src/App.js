import React from "react";
import "./App.css"; // Bu satırı ekledik!

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
  // Başlangıç tarihini 2024-01-11 olarak güncelledik.
  // Bu tarih, 29 Temmuz 2025'te S.mehmet'in sırasının gelmesini sağlayacak şekilde ayarlandı.
  const startDate = new Date("2024-01-09");
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
    <div className="app-container"> {/* Class adı güncellendi */}
      {/* İçerik kartı: Beyaz arka plan, yuvarlak köşeler, gölge, ortalanmış */}
      <div className="content-card"> {/* Class adı güncellendi */}
        {/* Başlık */}
        <h1 className="main-title"> {/* Class adı güncellendi */}
          Kola Sırası
        </h1>

        {/* Atlanacak gün mesajı */}
        {isSkipDay ? (
          <div className="skip-day-message"> {/* Class adı güncellendi */}
            Bugün (<span className="font-bold">{formatDate(today)}</span>) sıra yok.
          </div>
        ) : (
          // Bugünkü kişi bilgisi
          <div className="today-person-box"> {/* Class adı güncellendi */}
            <p>
              Bugünkü kişi: <strong>{todayPerson}</strong>
            </p>
            <p>({formatDate(today)})</p>
          </div>
        )}

        {/* Yarınki kişi bilgisi (eğer bugün atlanacak bir gün değilse) */}
        {!isSkipDay && (
          <div className="next-person-box"> {/* Class adı güncellendi */}
            <p>
              Yarınki kişi: <span>{nextPerson}</span>
            </p>
            <p>({formatDate(nextDate)})</p>
          </div>
        )}

        {/* Tüm sıra listesi başlığı */}
        <h2 className="list-title"> {/* Class adı güncellendi */}
          Tüm Sıra:
        </h2>
        {/* Tüm sıra listesi */}
        <ul className="people-list"> {/* Class adı güncellendi */}
          {people.map((person, index) => (
            <li key={index}>
              <span>{index + 1}.</span> {person}
              {/* Eğer bugünkü kişi ise yanında küçük bir işaret */}
              {index === currentIndex && !isSkipDay && (
                <span className="checkmark" title="Bugünkü kişi">
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