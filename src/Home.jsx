import React from "react";
import dayjs from "dayjs"; 
import "dayjs/locale/tr"; dayjs.locale("tr");

const people = [ "Muhammed", "Bedirhan", "Taha", "Mehmet", "S.mehmet", "Caner", "M.İsa", "Ercan abi", "Mustafa abi", ];

const skipDays = [0, 1]; // 0 = Sunday, 1 = Monday

// Calculate how many valid days have passed since a fixed start date function getValidDayIndex() { const startDate = dayjs("2024-01-01"); let today = dayjs(); let count = 0; let date = startDate; while (date.isBefore(today, 'day')) { if (!skipDays.includes(date.day())) count++; date = date.add(1, 'day'); } return count % people.length; }

function getNextValidDay(fromDate) { let date = fromDate.add(1, 'day'); while (skipDays.includes(date.day())) { date = date.add(1, 'day'); } return date; }

function App() { const today = dayjs(); const isSkipDay = skipDays.includes(today.day()); const currentIndex = getValidDayIndex(); const todayPerson = people[currentIndex]; const nextIndex = (currentIndex + 1) % people.length; const nextPerson = people[nextIndex]; const nextDate = getNextValidDay(today);

return ( <div className="p-4 max-w-md mx-auto text-center text-gray-800"> <h1 className="text-2xl font-bold mb-4">Kola Sırası</h1>

{isSkipDay ? (
    <div className="text-red-500 font-semibold">
      Bugün ({today.format("dddd, DD MMMM")}) sıra yok.
    </div>
  ) : (
    <div className="mb-4">
      <p className="text-xl">
        Bugünkü kişi: <span className="font-bold">{todayPerson}</span>
      </p>
      <p className="text-sm text-gray-600">
        ({today.format("dddd, DD MMMM")})
      </p>
    </div>
  )}

  {!isSkipDay && (
    <div className="mb-6">
      <p className="text-lg">
        Yarınki kişi: <span className="font-medium">{nextPerson}</span>
      </p>
      <p className="text-sm text-gray-600">
        ({nextDate.format("dddd, DD MMMM")})
      </p>
    </div>
  )}

  <h2 className="text-lg font-semibold mt-6 mb-2">Tüm Sıra:</h2>
  <ul className="bg-gray-100 rounded-xl py-2 px-4 text-left">
    {people.map((person, idx) => (
      <li key={idx}>
        {idx + 1}. {person}
      </li>
    ))}
  </ul>
</div>

); }

export default App;

