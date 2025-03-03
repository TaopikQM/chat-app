import PrayerTimesTable from "../components/PrayerTimesTable";
import timehijr from "../components/timehijr";

export default function Home() {
  return (
    <>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <PrayerTimesTable />
    </div>
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <timehijr />
    </div>
    </>
  );
}
