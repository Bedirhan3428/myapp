import React from "react";
import "./App.css"; // Bu satırı ekledik!

const people = [
  "Mehmet Enes",
  "Adil Caner",
  "Muhammet İsa(Syria)",
  "Ercan abi",
  "Mustafa abi",
  "Muhammed(Syria)",
  "Bedirhan",
  "Ali Taha",
  "Mehmet",
];

const skipDays = [0, 1]; // 0 = Pazar, 1 = Pazartesi

/**
 * Belirli bir başlangıç tarihinden bugüne kadar atlanmayan gün sayısını hesaplar
 * ve bu sayının kişi listesi uzunluğuna göre modunu alarak geçerli kişi indeksini döndürür.
 */
function getValidDayIndex() {
  const startDate = new Date("2025-07-17"); // Mehmet Enes'ten başlayacak şekilde ayarlandı
  const today = new Date();

  let count = 0;
  let date = new Date(startDate);

  while (date < today) {
    const day = date.getDay();
    if (!skipDays.includes(day)) {
      count++;
    }
    date.setDate(date.getDate() + 1);
  }

  return count % people.length;
}

/**
 * Verilen bir tarihten sonraki ilk geçerli günü bulur.
 */
function getNextValidDate(fromDate) {
  const next = new Date(fromDate);
  next.setDate(next.getDate() + 1);

  while (skipDays.includes(next.getDay())) {
    next.setDate(next.getDate() + 1);
  }

  return next;
}

/**
 * Bir Date nesnesini "haftanın günü, gün ay" formatında Türkçe olarak biçimlendirir.
 */
function formatDate(date) {
  return date.toLocaleDateString("tr-TR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

function App() {
  const today = new Date();
  const isSkipDay = skipDays.includes(today.getDay());
  const currentIndex = getValidDayIndex();
  const todayPerson = people[currentIndex];
  const nextIndex = (currentIndex + 1) % people.length;
  const nextPerson = people[nextIndex];
  const nextDate = getNextValidDate(today);

  return (
    <div className="app-container">
      <div className="content-card">
        <h1 className="main-title">Kola Sırası</h1>

        {isSkipDay ? (
          <div className="skip-day-message">
            Bugün (<span className="font-bold">{formatDate(today)}</span>) sıra yok.
          </div>
        ) : (
          <div className="today-person-box">
            <p>
              Bugünkü kişi: <strong>{todayPerson}</strong>
            </p>
            <p>({formatDate(today)})</p>
          </div>
        )}

        {!isSkipDay && (
          <div className="next-person-box">
            <p>
              Yarınki kişi: <span>{nextPerson}</span>
            </p>
            <p>({formatDate(nextDate)})</p>
          </div>
        )}

        <h2 className="list-title">Tüm Sıra</h2>
        <ul className="people-list">
          {people.map((person, index) => (
            <li key={index}>
              <span>{index + 1}.</span> {person}
              {index === currentIndex && !isSkipDay && (
                <span className="checkmark" title="Bugünkü kişi">
                  &#10003;
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