import PrayerTimesTable from "../components/PrayerTimesTable";
import TimeHijr from "../components/TimeHijr";

export default function Home() {
  return (
    <>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <PrayerTimesTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
    </div>
    </>
  );
}

      // <TimeHijr />
