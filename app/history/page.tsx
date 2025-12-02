'use client';

import { useState, useEffect } from 'react';
import { PDFDocument, TextAlignment } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { useAuth } from '../contexts/AuthContext';
import { useData, Submission, SubmissionStatus } from '../contexts/DataContext';

// ステータスの表示用
const getStatusDisplay = (status: SubmissionStatus) => {
  switch (status) {
    case 'pending':
      return { label: '申請中', color: '#f59e0b', bgColor: '#fef3c7' };
    case 'approved':
      return { label: '承認済み', color: '#10b981', bgColor: '#d1fae5' };
    case 'rejected':
      return { label: '差戻し', color: '#ef4444', bgColor: '#fee2e2' };
  }
};

// 承認フローステッパー
const ApprovalStepper = ({ submission }: { submission: Submission }) => {
  const steps = [
    { label: '申請者', status: 'completed' as const },
    {
      label: '承認者',
      status: submission.status === 'approved'
        ? 'completed' as const
        : submission.status === 'rejected'
        ? 'rejected' as const
        : 'current' as const
    },
  ];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: '#f8f9fa', borderRadius: '0.5rem', marginTop: '0.5rem' }}>
      {steps.map((step, index) => {
        const isCompleted = step.status === 'completed';
        const isCurrent = step.status === 'current';
        const isRejected = step.status === 'rejected';

        const circleColor = isCompleted ? '#10b981' : isRejected ? '#ef4444' : isCurrent ? '#0d56c9' : '#dde5f4';
        const textColor = isCompleted || isCurrent || isRejected ? '#1a1c20' : '#686e78';

        return (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: circleColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700 }}>
                {isCompleted ? '✓' : isRejected ? '✕' : ''}
              </div>
              <span style={{ fontSize: '0.8rem', color: textColor, fontWeight: isCompleted || isCurrent ? 600 : 400 }}>{step.label}</span>
            </div>

            {index < steps.length - 1 && (
              <div style={{ width: 40, height: 2, backgroundColor: isCompleted ? '#10b981' : '#dde5f4' }} />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default function History() {
  const { currentUser } = useAuth();
  const { getMySubmissions, getReceivedRequests, updateSubmissionStatus } = useData();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pdfTab, setPdfTab] = useState<'order' | 'budget' | 'schedule' | 'invoice' | 'slip'>('order');
  const [budgetPdfUrl, setBudgetPdfUrl] = useState<string | null>(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // user=3（山田部長 / user-yamada）の時のみ承認者として扱う
  const isApprover = currentUser?.id === 'user-yamada';

  // 実行予算書のPDFを生成
  const generateBudgetPdf = async (formDataJson: string): Promise<string | null> => {
    try {
      const formData = JSON.parse(formDataJson);
      const response = await fetch('/予算書フォーマット.pdf');
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      pdfDoc.registerFontkit(fontkit);
      const fontResponse = await fetch('/fonts/NotoSansCJKjp-Regular.otf');
      const fontBytes = await fontResponse.arrayBuffer();
      const japaneseFont = await pdfDoc.embedFont(fontBytes);

      const form = pdfDoc.getForm();

      Object.entries(formData).forEach(([fieldName, value]) => {
        try {
          const textField = form.getTextField(fieldName);
          textField.setFontSize(11);
          textField.setAlignment(TextAlignment.Center);
          textField.setText(value as string);
          textField.updateAppearances(japaneseFont);
        } catch {
          console.log(`Field not found: ${fieldName}`);
        }
      });

      form.flatten();

      const filledPdfBytes = await pdfDoc.save();
      const ab = new ArrayBuffer(filledPdfBytes.byteLength);
      new Uint8Array(ab).set(filledPdfBytes);   
      const blob = new Blob([ab], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('PDF生成エラー:', error);
      return null;
    }
  };

  // モーダルが開かれたときにPDFを生成
  useEffect(() => {
    let currentUrl: string | null = null;

    if (showDetailModal && selectedSubmission?.type === '実行予算書' && selectedSubmission.data?.formDataJson) {
      setGeneratingPdf(true);
      setBudgetPdfUrl(null);
      generateBudgetPdf(selectedSubmission.data.formDataJson).then((url) => {
        currentUrl = url;
        setBudgetPdfUrl(url);
        setGeneratingPdf(false);
      });
    }

    return () => {
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [showDetailModal, selectedSubmission]);

  const handleOpenDetail = (submission: Submission) => {
    setSelectedSubmission(submission);
    setShowDetailModal(true);
    // タイプに応じて初期タブを設定
    if (submission.type === '支払伝票') {
      setPdfTab('invoice');
    } else {
      setPdfTab('order');
    }
  };

  const handleCloseDetail = () => {
    setSelectedSubmission(null);
    setShowDetailModal(false);
    if (budgetPdfUrl) {
      URL.revokeObjectURL(budgetPdfUrl);
      setBudgetPdfUrl(null);
    }
  };

  const parseBudgetRows = (data: Record<string, string>) => {
    try {
      if (data.rows) {
        return JSON.parse(data.rows);
      }
    } catch {
      // パース失敗
    }
    return [];
  };

  // 承認者の場合：受け取った申請、それ以外：自分の申請
  const allSubmissions = isApprover ? getReceivedRequests() : getMySubmissions();

  // 承認待ちの申請（承認者用）
  const pendingRequests = isApprover ? allSubmissions.filter(s => s.status === 'pending') : [];

  // 履歴用のフィルタリング（承認者の場合は処理済みのみ、申請者の場合は全て）
  const historySubmissions = isApprover
    ? allSubmissions.filter(s => s.status !== 'pending')
    : allSubmissions;

  const filteredSubmissions = historySubmissions.filter(s => {
    if (filter === 'all') return true;
    return s.status === filter;
  });

  const handleApprove = (id: string, fromModal = false) => {
    if (confirm('この申請を承認しますか？')) {
      updateSubmissionStatus(id, 'approved');
      if (fromModal) handleCloseDetail();
    }
  };

  const handleReject = (id: string, fromModal = false) => {
    if (confirm('この申請を差戻ししますか？')) {
      updateSubmissionStatus(id, 'rejected');
      if (fromModal) handleCloseDetail();
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#1a1c20' }}>申請履歴</h2>
      <p style={{ margin: '0 0 1.5rem 0', color: '#686e78', fontSize: '0.9rem' }}>
        {isApprover
          ? '申請の確認・承認と処理履歴を確認できます'
          : '過去の申請履歴を確認できます'}
      </p>

      {/* 承認依頼セクション（承認者のみ表示） */}
      {isApprover && (
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1a1c20', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              承認依頼
              {pendingRequests.length > 0 && (
                <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: '#fef3c7', color: '#f59e0b', borderRadius: '0.25rem', fontWeight: 600 }}>
                  {pendingRequests.length}件
                </span>
              )}
            </h3>
          </div>
          {pendingRequests.length === 0 ? (
            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#686e78', fontSize: '0.9rem' }}>
              承認待ちの申請はありません
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {pendingRequests.map((item) => (
                <div key={item.id} style={{ padding: '1rem', border: '1px solid #dde5f4', borderRadius: '0.5rem', backgroundColor: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '0.25rem', fontWeight: 600 }}>{item.type}</span>
                    <span style={{ fontSize: '0.75rem', color: '#686e78' }}>{item.date}</span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1c20', marginBottom: '0.25rem' }}>{item.title}</div>
                  <div style={{ fontSize: '0.8rem', color: '#686e78', marginBottom: '0.75rem' }}>申請者: {item.applicantName}</div>
                  <button style={{ width: '100%', padding: '0.5rem', fontSize: '0.8rem', backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={() => handleOpenDetail(item)}>
                    詳細を確認
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* フィルター */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600, color: '#1a1c20' }}>{isApprover ? '処理済み履歴' : '申請履歴'}</h3>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>ステータス</label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            style={{ width: '100%', maxWidth: '300px', padding: '0.625rem', fontSize: '0.9rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}
          >
            <option value="all">すべて</option>
            {!isApprover && <option value="pending">申請中</option>}
            <option value="approved">承認済み</option>
            <option value="rejected">差戻し</option>
          </select>
        </div>
      </div>

      {/* 申請リスト */}
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)' }}>
        {filteredSubmissions.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: '#686e78', fontSize: '0.9rem' }}>
            {filter === 'all' ? (isApprover ? '処理済みの申請がありません' : '申請データがありません') : '該当する申請がありません'}
          </div>
        ) : (
          filteredSubmissions.map((item) => {
            const statusDisplay = getStatusDisplay(item.status);
            const showFlow = item.status === 'pending';

            return (
              <div key={item.id} style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #f0f2f7' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '100px 80px 1fr 100px 80px', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', color: '#686e78' }}>{item.date}</div>
                  <div>
                    <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.7rem', backgroundColor: '#e0e7ff', color: '#4f46e5', borderRadius: '0.25rem', fontWeight: 600 }}>{item.type}</span>
                  </div>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem', color: '#1a1c20' }}>
                    {item.title}
                    {isApprover && (
                      <span style={{ fontSize: '0.75rem', color: '#686e78', marginLeft: '0.5rem' }}>({item.applicantName})</span>
                    )}
                  </div>
                  <div>
                    <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: statusDisplay.bgColor, color: statusDisplay.color, borderRadius: '0.25rem', fontWeight: 600 }}>
                      {statusDisplay.label}
                    </span>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <button style={{ padding: '0.375rem 0.75rem', fontSize: '0.8rem', backgroundColor: 'transparent', border: '1px solid #0d56c9', color: '#0d56c9', borderRadius: '0.25rem', cursor: 'pointer' }} onClick={() => handleOpenDetail(item)}>
                      詳細
                    </button>
                  </div>
                </div>

                {showFlow && (
                  <ApprovalStepper submission={item} />
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 詳細モーダル */}
      {showDetailModal && selectedSubmission && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseDetail}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '90%', maxWidth: '700px', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>申請詳細</h2>
              <button style={{ width: 32, height: 32, border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#686e78' }} onClick={handleCloseDetail}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {/* 基本情報 */}
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>基本情報</div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, width: '20%', border: '1px solid #dde5f4' }}>申請種別</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{selectedSubmission.type}</td>
                      <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, width: '20%', border: '1px solid #dde5f4' }}>申請日</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{selectedSubmission.date}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4' }}>申請者</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{selectedSubmission.applicantName}</td>
                      <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4' }}>ステータス</td>
                      <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>
                        <span style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', backgroundColor: getStatusDisplay(selectedSubmission.status).bgColor, color: getStatusDisplay(selectedSubmission.status).color, borderRadius: '0.25rem', fontWeight: 600 }}>
                          {getStatusDisplay(selectedSubmission.status).label}
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4' }}>タイトル</td>
                      <td colSpan={3} style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{selectedSubmission.title}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* 実行予算の場合は詳細データを表示 */}
              {selectedSubmission.type === '実行予算' && selectedSubmission.data && (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>予算情報</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, width: '20%', border: '1px solid #dde5f4' }}>工事コード</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{selectedSubmission.data.workCode || '-'}</td>
                          <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, width: '20%', border: '1px solid #dde5f4' }}>予算作成日</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{selectedSubmission.data.budgetDate || '-'}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4' }}>合計金額</td>
                          <td colSpan={3} style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>
                            {selectedSubmission.data.totalBudget
                              ? `${parseInt(selectedSubmission.data.totalBudget).toLocaleString()}円`
                              : '-'}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {parseBudgetRows(selectedSubmission.data).length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>予算明細</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                        <thead>
                          <tr>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4', textAlign: 'left' }}>No.</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4', textAlign: 'left' }}>工種コード</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4', textAlign: 'left' }}>工種名称</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4', textAlign: 'left' }}>費目</th>
                            <th style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4', textAlign: 'right' }}>実行予算</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parseBudgetRows(selectedSubmission.data).map((row: { no: number; workTypeCode: string; workTypeName: string; expenseItem: string; executionBudget: string }) => (
                            <tr key={row.no}>
                              <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.no.toString().padStart(5, '0')}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.workTypeCode}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.workTypeName}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.expenseItem}</td>
                              <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>
                                {parseInt(row.executionBudget).toLocaleString()}円
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              )}

              {/* 実行予算書の場合はformDataJsonからPDFを生成して表示 */}
              {selectedSubmission.type === '実行予算書' && selectedSubmission.data?.formDataJson && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>予算書プレビュー</div>
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {generatingPdf ? (
                      <div style={{ color: '#686e78', fontSize: '0.9rem' }}>PDFを生成中...</div>
                    ) : budgetPdfUrl ? (
                      <iframe
                        src={budgetPdfUrl}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="予算書プレビュー"
                      />
                    ) : (
                      <div style={{ color: '#686e78', fontSize: '0.9rem' }}>プレビューを読み込めませんでした</div>
                    )}
                  </div>
                </div>
              )}

              {/* 支払伝票の場合はPDFプレビューを表示 */}
              {selectedSubmission.type === '支払伝票' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>添付書類プレビュー</div>

                  {/* タブ */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #dde5f4', marginBottom: '1rem' }}>
                    <button
                      onClick={() => setPdfTab('invoice')}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        backgroundColor: pdfTab === 'invoice' ? '#fff' : '#f8f9fa',
                        color: pdfTab === 'invoice' ? '#0d56c9' : '#686e78',
                        borderBottom: pdfTab === 'invoice' ? '2px solid #0d56c9' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      請求書 {selectedSubmission.data?.invoiceFileName && <span style={{ fontWeight: 400 }}>({selectedSubmission.data.invoiceFileName})</span>}
                    </button>
                    <button
                      onClick={() => setPdfTab('slip')}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        backgroundColor: pdfTab === 'slip' ? '#fff' : '#f8f9fa',
                        color: pdfTab === 'slip' ? '#0d56c9' : '#686e78',
                        borderBottom: pdfTab === 'slip' ? '2px solid #0d56c9' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      支払伝票
                    </button>
                  </div>

                  {/* PDFプレビュー */}
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {pdfTab === 'invoice' && (
                      <div style={{ color: '#686e78', fontSize: '0.9rem' }}>請求書プレビュー（デモ用のため表示不可）</div>
                    )}
                    {pdfTab === 'slip' && (
                      <iframe
                        src="/支払伝票のみ.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="支払伝票"
                      />
                    )}
                  </div>
                </div>
              )}

              {/* 発注契約の場合はPDFプレビューを表示 */}
              {selectedSubmission.type === '発注契約' && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>添付書類プレビュー</div>

                  {/* タブ */}
                  <div style={{ display: 'flex', borderBottom: '1px solid #dde5f4', marginBottom: '1rem' }}>
                    <button
                      onClick={() => setPdfTab('order')}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        backgroundColor: pdfTab === 'order' ? '#fff' : '#f8f9fa',
                        color: pdfTab === 'order' ? '#0d56c9' : '#686e78',
                        borderBottom: pdfTab === 'order' ? '2px solid #0d56c9' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      注文伺書
                    </button>
                    <button
                      onClick={() => setPdfTab('budget')}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        backgroundColor: pdfTab === 'budget' ? '#fff' : '#f8f9fa',
                        color: pdfTab === 'budget' ? '#0d56c9' : '#686e78',
                        borderBottom: pdfTab === 'budget' ? '2px solid #0d56c9' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      工事実行予算台帳
                    </button>
                    <button
                      onClick={() => setPdfTab('schedule')}
                      style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        backgroundColor: pdfTab === 'schedule' ? '#fff' : '#f8f9fa',
                        color: pdfTab === 'schedule' ? '#0d56c9' : '#686e78',
                        borderBottom: pdfTab === 'schedule' ? '2px solid #0d56c9' : '2px solid transparent',
                        cursor: 'pointer',
                      }}
                    >
                      発注予定表
                    </button>
                  </div>

                  {/* PDFプレビュー */}
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px' }}>
                    {pdfTab === 'order' && (
                      <iframe
                        src="/注文伺書（データ消し・サンプルデータ）.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="注文伺書"
                      />
                    )}
                    {pdfTab === 'budget' && (
                      <iframe
                        src="/工事実行予算台帳（サンプルデータ）.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="工事実行予算台帳"
                      />
                    )}
                    {pdfTab === 'schedule' && (
                      <iframe
                        src="/発注予定（サンプルデータ）.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="発注予定表"
                      />
                    )}
                  </div>
                </div>
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {isApprover && selectedSubmission.status === 'pending' ? (
                <>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#686e78', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseDetail}>閉じる</button>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#f59e0b', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={() => alert('修正機能は現在開発中です')}>修正</button>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#ef4444', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={() => handleReject(selectedSubmission.id, true)}>差戻</button>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={() => handleApprove(selectedSubmission.id, true)}>承認</button>
                </>
              ) : (
                <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#686e78', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseDetail}>閉じる</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
