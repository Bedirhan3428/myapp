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

  return count % people.length;
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
    <div style={{ padding: 20, maxWidth: 500, margin: "auto", textAlign: "center" }}>
      <h1 style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>Kola Sırası</h1>

      {isSkipDay ? (
        <div style={{ color: "red", fontWeight: "600" }}>
          Bugün ({formatDate(today)}) sıra yok.
        </div>
      ) : (
        <div style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 20 }}>
            Bugünkü kişi: <strong>{todayPerson}</strong>
          </p>
          <p style={{ color: "gray" }}>({formatDate(today)})</p>
        </div>
      )}

      {!isSkipDay && (
        <div style={{ marginBottom: 30 }}>
          <p style={{ fontSize: 18 }}>
            Yarınki kişi: <span>{nextPerson}</span>
          </p>
          <p style={{ color: "gray" }}>({formatDate(nextDate)})</p>
        </div>
      )}

      <h2 style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Tüm Sıra:</h2>
      <ul style={{ background: "#f0f0f0", padding: 15, borderRadius: 10, textAlign: "left" }}>
        {people.map((person, index) => (
          <li key={index}>
            {index + 1}. {person}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;