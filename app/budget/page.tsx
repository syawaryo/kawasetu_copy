"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_USERS } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

type BudgetRow = {
  no: number;
  workTypeCode: string;
  workTypeName: string;
  expenseItem: string;
  executionBudget: string;
};

export default function BudgetPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addSubmission } = useData();
  const [workCode, setWorkCode] = useState("00001234");
  const [budgetDate, setBudgetDate] = useState(new Date().toISOString().split('T')[0]);
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [rows, setRows] = useState<BudgetRow[]>([
    { no: 1, workTypeCode: "E01", workTypeName: "電気設備工事", expenseItem: "直接工事費", executionBudget: "72000" },
    { no: 2, workTypeCode: "A01", workTypeName: "空調設備工事", expenseItem: "直接工事費", executionBudget: "30000" },
    { no: 3, workTypeCode: "S01", workTypeName: "衛生設備工事", expenseItem: "直接工事費", executionBudget: "12000" },
    { no: 4, workTypeCode: "O01", workTypeName: "その他工事", expenseItem: "直接工事費", executionBudget: "6000" },
    { no: 5, workTypeCode: "", workTypeName: "", expenseItem: "", executionBudget: "" },
    { no: 6, workTypeCode: "", workTypeName: "", expenseItem: "", executionBudget: "" },
    { no: 7, workTypeCode: "", workTypeName: "", expenseItem: "", executionBudget: "" },
    { no: 8, workTypeCode: "", workTypeName: "", expenseItem: "", executionBudget: "" },
  ]);

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');
  const filledRows = rows.filter(row => row.workTypeCode && row.workTypeName);
  const totalBudget = filledRows.reduce((sum, row) => sum + (parseInt(row.executionBudget) || 0), 0);

  const handleOpenModal = () => {
    setShowModal(true);
    setIsSubmitted(false);
    if (approvers.length > 0) {
      setSelectedApprover(approvers[0].id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSubmitted(false);
  };

  const handleSubmit = async () => {
    if (!selectedApprover || !currentUser) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));

    addSubmission({
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      type: '実行予算',
      title: `工事コード: ${workCode} 実行予算申請`,
      status: 'pending',
      data: {
        workCode,
        budgetDate,
        totalBudget: totalBudget.toString(),
        rows: JSON.stringify(filledRows),
      },
      assignedTo: selectedApprover,
      approvalFlow: [
        { label: '自分', status: 'completed' },
        { label: '工事部長', status: 'current' },
        { label: '本社', status: 'pending' },
      ],
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>実行予算登録</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleOpenModal} disabled={filledRows.length === 0} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: filledRows.length === 0 ? '#ccc' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: filledRows.length === 0 ? 'not-allowed' : 'pointer' }}>
              申請
            </button>
            <button onClick={() => router.push('/order-contract')} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
              発注契約登録へ
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 24px' }}>
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工事コード</label>
                <input type="text" value={workCode} onChange={(e) => setWorkCode(e.target.value)} placeholder="例: 00001234" style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>予算作成日付</label>
                <input type="date" value={budgetDate} onChange={(e) => setBudgetDate(e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>予算単位</label>
                <select style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option value="">工種単位</option>
                  <option value="cost">原価単位</option>
                  <option value="project">工事単位</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>明細表示順</label>
                <select style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option value="input">入力順</option>
                  <option value="code">工種コード順</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>予算区分</label>
                <select style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}>
                  <option value="company">自社</option>
                  <option value="sub">協力会社</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>予算明細</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '80px' }}>No.</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '112px' }}>工種コード</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>工種名称</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4', width: '144px' }}>費目</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4', width: '144px' }}>実行予算</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={row.no}>
                    <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>{row.no.toString().padStart(5, "0")}</td>
                    <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                      <input type="text" value={row.workTypeCode} onChange={(e) => { const next = [...rows]; next[idx].workTypeCode = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} />
                    </td>
                    <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                      <input type="text" value={row.workTypeName} onChange={(e) => { const next = [...rows]; next[idx].workTypeName = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} />
                    </td>
                    <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                      <input type="text" value={row.expenseItem} onChange={(e) => { const next = [...rows]; next[idx].expenseItem = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} />
                    </td>
                    <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}>
                      <input type="number" value={row.executionBudget} onChange={(e) => { const next = [...rows]; next[idx].executionBudget = e.target.value; setRows(next); }} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 申請モーダル */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '90%', maxWidth: '600px', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>実行予算 申請確認</h2>
              <button style={{ width: 32, height: 32, border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#686e78' }} onClick={handleCloseModal}>×</button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              {isSubmitted ? (
                <div style={{ padding: '2rem', textAlign: 'center', backgroundColor: '#d1fae5', color: '#10b981', borderRadius: '0.5rem', fontWeight: 600 }}>
                  申請が完了しました。承認者に通知されました。
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>基本情報</div>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                      <tbody>
                        <tr>
                          <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, width: '25%', border: '1px solid #dde5f4' }}>工事コード</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{workCode}</td>
                          <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, width: '25%', border: '1px solid #dde5f4' }}>予算作成日</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{budgetDate}</td>
                        </tr>
                        <tr>
                          <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4' }}>申請者</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{currentUser?.name || '-'}</td>
                          <td style={{ padding: '0.5rem', backgroundColor: '#f8f9fa', fontWeight: 600, border: '1px solid #dde5f4' }}>部署</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{currentUser?.department || '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

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
                        {filledRows.map((row) => (
                          <tr key={row.no}>
                            <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.no.toString().padStart(5, "0")}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.workTypeCode}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.workTypeName}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dde5f4' }}>{row.expenseItem}</td>
                            <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>
                              {parseInt(row.executionBudget).toLocaleString()}円
                            </td>
                          </tr>
                        ))}
                        <tr style={{ backgroundColor: '#f8f9fa', fontWeight: 600 }}>
                          <td colSpan={4} style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>合計</td>
                          <td style={{ padding: '0.5rem', border: '1px solid #dde5f4', textAlign: 'right' }}>{totalBudget.toLocaleString()}円</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>申請先を選択</label>
                    <select value={selectedApprover} onChange={(e) => setSelectedApprover(e.target.value)} style={{ width: '100%', padding: '0.625rem', fontSize: '0.9rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}>
                      {approvers.map((approver) => (
                        <option key={approver.id} value={approver.id}>
                          {approver.name}（{approver.department}）
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              )}
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {isSubmitted ? (
                <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>閉じる</button>
              ) : (
                <>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#686e78', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>キャンセル</button>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting || !selectedApprover ? '#ccc' : '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting || !selectedApprover ? 'not-allowed' : 'pointer' }} onClick={handleSubmit} disabled={isSubmitting || !selectedApprover}>
                    {isSubmitting ? '申請中...' : '申請する'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
