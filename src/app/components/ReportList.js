
  const ReportList = ({ chatWith, currentUser }) => {
  // Data contoh laporan transaksi BCA
  const reports = [
    {
      id: 1,
      bank: 'BCA',
      amount: 5000000,
      status: 'Sudah Diproses',
      date: '2024-01-15',
      description: 'Transfer gaji bulanan'
    },
    {
      id: 2,
      bank: 'BCA',
      amount: 2500000,
      status: 'Sudah Diproses',
      date: '2024-01-14',
      description: 'Pembayaran invoice #123'
    },
    {
      id: 3,
      bank: 'BCA',
      amount: 1000000,
      status: 'Sudah Diproses',
      date: '2024-01-13',
      description: 'Retur pembayaran'
    }
  ];

  // Filter hanya bank BCA yang sudah diproses
  const bcaProcessedReports = reports.filter(
    report => report.bank === 'BCA' && report.status === 'Sudah Diproses'
  );

  return (
    <div className="w-full overflow-y-auto px-2 sm:px-4">
      <div className="bg-white rounded-lg shadow">
        {/* Header Laporan */}
        <div className="px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Laporan Transaksi BCA - Sudah Diproses
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Total: {bcaProcessedReports.length} transaksi
          </p>
        </div>

        {/* List Laporan */}
        <div className="divide-y divide-gray-200">
          {bcaProcessedReports.map((report) => (
            <div key={report.id} className="px-4 py-3 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                      BCA
                    </span>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                      {report.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-900 font-medium">
                    Rp {report.amount.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {report.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {new Date(report.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </p>
                  <button className="mt-2 text-xs text-blue-600 hover:text-blue-800">
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}

          {bcaProcessedReports.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-sm text-gray-500">
                Tidak ada laporan BCA yang sudah diproses
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
