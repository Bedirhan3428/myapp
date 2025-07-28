import React from "react";
import "./App.css";

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

const skipDays = [0, 1]; // Pazar ve Pazartesi günleri atlanır

// Sıra Mehmet Enes'ten başlasın diye offset'li doğru sıra hesaplama
function getValidDayIndex() {
  const startDate = new Date("2024-01-02");
  const today = new Date();
  let count = 0;
  let date = new Date(startDate);

  while (date <= today) {
    const day = date.getDay();
    if (!skipDays.includes(day)) {
      count++;
    }
    date.setDate(date.getDate() + 1);
  }

  // Mehmet Enes sıfırıncı indexte, sıra ona denk gelecek şekilde hiçbir offset vermeye gerek yok
  // Ancak farklı kişi başlayacaksa offset buraya eklenirdi
  return (count - 1) % people.length;
}

function getNextValidDate(fromDate) {
  const next = new Date(fromDate);
  next.setDate(next.getDate() + 1);
  while (skipDays.includes(next.getDay())) {
    next.setDate(next.getDate() + 1);
  }
  return next;
}

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
            ¯⁠\⁠_⁠(⁠ツ⁠)⁠_⁠/⁠¯
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
              Yarınki kişi 👉 <strong>{nextPerson}</strong>
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
                <span className="checkmark" title="Bugünkü kişi">✔</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;