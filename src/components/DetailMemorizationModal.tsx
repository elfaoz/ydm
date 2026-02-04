
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { MemorizationRecord } from '@/contexts/MemorizationContext';

interface DetailMemorizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: MemorizationRecord | null;
}

const getStatusIndonesian = (status: string) => {
  switch (status) {
    case 'Fully Achieved': return 'Tercapai Penuh';
    case 'Achieved': return 'Tercapai';
    case 'Not Achieved': return 'Tidak Tercapai';
    default: return status;
  }
};

const DetailMemorizationModal: React.FC<DetailMemorizationModalProps> = ({
  isOpen,
  onClose,
  record
}) => {
  if (!record) return null;

  const hasData = record.memorizationDetail && 
    (record.memorizationDetail.juz > 0 || 
     record.target > 0 || 
     record.actual > 0 ||
     (record.memorizationDetail.surahDetails && record.memorizationDetail.surahDetails.length > 0));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Detail Hafalan - {record.studentName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <span className="text-sm font-medium text-gray-600">Tanggal:</span>
              <p className="text-gray-900">{new Date(record.date).toLocaleDateString('id-ID', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}</p>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-600">Status:</span>
              <div className="mt-1">
                <Badge className={
                  record.percentage >= 100 ? 'bg-green-100 text-green-800' :
                  record.percentage >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-red-100 text-red-800'
                }>
                  {getStatusIndonesian(record.status)}
                </Badge>
              </div>
            </div>
          </div>

          {hasData ? (
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-800 border-b pb-2">Detail Hafalan</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Juz:</span>
                    <p className="text-gray-900">Juz {record.memorizationDetail?.juz || '-'}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Halaman:</span>
                    <p className="text-gray-900">
                      {record.memorizationDetail?.pageFrom || '-'} - {record.memorizationDetail?.pageTo || '-'}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Target Harian:</span>
                    <p className="text-gray-900">{record.target} halaman</p>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium text-gray-600">Pencapaian:</span>
                    <p className="text-gray-900">{record.actual} halaman</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t">
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-600">Detail Surat:</span>
                  {record.memorizationDetail?.surahDetails && record.memorizationDetail.surahDetails.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {record.memorizationDetail.surahDetails.map((detail, idx) => (
                        <div key={idx} className="p-2 bg-white rounded border border-gray-200">
                          <p className="text-gray-900 font-medium">{detail.surahName}</p>
                          <p className="text-sm text-gray-600">
                            Ayat {detail.ayahFrom} - {detail.ayahTo}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 mt-1">Tidak ada detail surat</p>
                  )}
                </div>
              </div>

              <div className="flex justify-center pt-4">
                <div className="text-center">
                  <span className="text-2xl font-bold text-blue-600">{record.percentage}%</span>
                  <p className="text-sm text-gray-600">Persentase Pencapaian</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-600">Belum ada data hafalan untuk tanggal ini.</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DetailMemorizationModal;
