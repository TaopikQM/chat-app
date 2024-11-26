import UploadData from '../components/UploadData';
import DataTable from '../components/DataTable';

export default function HomePage() {
  return (
    <div>
      <h1>Manajemen Data Kehadiran</h1>
      <UploadData />
      <DataTable />
    </div>
  );
}
