import React from "react";
import "./App.css"; // CSS dosyan

const people = [
  "Mehmet Enes",
  "Adil Caner",
  "Muhammet İsa(Syria)",
  "Ercan",
  "Mustafa",
  "Muhammed(Syria)",
  "Bedirhan",
  "Ali Taha",
  "Mehmet",
];

const skipDays = [0, 1]; // 0 = Pazar, 1 = Pazartesi

/**
 * Sıranın hangi kişide olduğunu hesaplar
 */
function getValidDayIndex() {
  const startDate = new Date("2024-01-01");
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

  // Mehmet Enes ilk kişi, 1 Ocak 2024'te o başlasın diye offset 0
  const offset = 0;
  return (count + offset) % people.length;
}

/**
 * Bir sonraki geçerli (skip edilmeyen) günü bulur
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
 * Tarihi Türkçe biçimlendirir
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
            Bugün (<span className="font-bold">{formatDate(today)}</span>) sıra yok. <hr />
            ¯⁠\\⁠_⁠(⁠ツ⁠)⁠_⁠/⁠¯
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
              Yarınki kişi (⁠　⁠･⁠ω⁠･⁠)⁠☞ <span>{nextPerson}</span>
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