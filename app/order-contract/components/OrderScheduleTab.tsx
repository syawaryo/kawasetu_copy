"use client";

interface AggregatedScheduleRow {
  workTypeCode: string;
  workType: string;
  vendor: string;
  amount: string;
}

interface OrderScheduleTabProps {
  scheduleViewMode: 'input' | 'pdf';
  setScheduleViewMode: (mode: 'input' | 'pdf') => void;
  aggregatedScheduleRows: AggregatedScheduleRow[];
}

export default function OrderScheduleTab({
  scheduleViewMode,
  setScheduleViewMode,
  aggregatedScheduleRows,
}: OrderScheduleTabProps) {
  return (
    <div style={{ textAlign: 'left' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', margin: 0 }}>発注予定表</p>
          <button
            onClick={() => setScheduleViewMode(scheduleViewMode === 'input' ? 'pdf' : 'input')}
            style={{
              padding: '0.375rem 0.75rem',
              fontSize: '0.8rem',
              fontWeight: 500,
              backgroundColor: '#fff',
              color: '#0d56c9',
              border: '1px solid #0d56c9',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            {scheduleViewMode === 'input' ? 'PDFプレビュー' : '発注明細に戻る'}
          </button>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#686e78' }}>
          ※ 発注登録の発注明細から自動反映されます
        </span>
      </div>

      {/* 発注明細からの自動生成テーブル */}
      {scheduleViewMode === 'input' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', width: '100px', color: '#1a1c20' }}>工種コード</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>工種</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', border: '1px solid #dde5f4', color: '#1a1c20' }}>発注予定業者</th>
                <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', border: '1px solid #dde5f4', width: '150px', color: '#1a1c20' }}>発注予定金額</th>
              </tr>
            </thead>
            <tbody>
              {aggregatedScheduleRows.length > 0 ? (
                aggregatedScheduleRows.map((row, idx) => (
                  <tr key={idx}>
                    <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4' }}>{row.workTypeCode}</td>
                    <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4' }}>{row.workType}</td>
                    <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4' }}>{row.vendor}</td>
                    <td style={{ padding: '0.5rem 0.75rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{row.amount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ padding: '2rem', border: '1px solid #dde5f4', textAlign: 'center', color: '#686e78' }}>
                    発注登録の発注明細にデータを入力すると、ここに反映されます
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* PDFプレビューモード */}
      {scheduleViewMode === 'pdf' && (
        <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '600px' }}>
          <iframe
            src="/発注予定（サンプルデータ）.pdf"
            style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
            title="発注予定表"
          />
        </div>
      )}
    </div>
  );
}
