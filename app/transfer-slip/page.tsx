"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, DEMO_USERS } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";

// 共通スタイル（payment-slipと同様）
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  fontSize: '0.85rem',
  border: '1px solid #dde5f4',
  borderRadius: '0.375rem',
  boxSizing: 'border-box',
};

const selectStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  fontSize: '0.85rem',
  border: '1px solid #dde5f4',
  borderRadius: '0.375rem',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: '0.375rem',
  fontSize: '0.8rem',
  fontWeight: 600,
  color: '#1a1c20',
};

const cardStyle: React.CSSProperties = {
  backgroundColor: '#fff',
  borderRadius: '0.625rem',
  border: '1px solid #dde5f4',
  marginBottom: '1.5rem',
};

const cardHeaderStyle: React.CSSProperties = {
  padding: '0.75rem 1rem',
  borderBottom: '1px solid #dde5f4',
  backgroundColor: '#f8f9fa',
};

const cardTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#1a1c20',
};

const buttonStyle: React.CSSProperties = {
  padding: '0.5rem 1rem',
  fontSize: '0.85rem',
  fontWeight: 600,
  border: 'none',
  borderRadius: '0.375rem',
  cursor: 'pointer',
};

function HeadBar({ left, right }: { left: string; right: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
      <div style={{
        backgroundColor: '#132942',
        padding: '0.5rem 0.75rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#fff',
        borderRadius: '0.25rem 0 0 0',
      }}>
        {left}
      </div>
      <div style={{
        backgroundColor: '#132942',
        padding: '0.5rem 0.75rem',
        fontSize: '0.8rem',
        fontWeight: 600,
        color: '#fff',
        borderRadius: '0 0.25rem 0 0',
      }}>
        {right}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      height: '2rem',
      backgroundColor: '#1e3a5f',
      padding: '0 0.75rem',
      fontSize: '0.8rem',
      fontWeight: 600,
      lineHeight: '2rem',
      color: '#fff',
    }}>
      {children}
    </div>
  );
}

function RangeRow({
  label,
  left,
  right,
}: {
  label: string;
  left: React.ReactNode;
  right: React.ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
      <div>
        <Label>{label}</Label>
      </div>
      <div>
        <div style={{ display: 'grid', gridTemplateColumns: '5fr 2fr 5fr', alignItems: 'center', gap: '0.5rem' }}>
          <div>{left}</div>
          <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#686e78' }}>〜</div>
          <div>{right}</div>
        </div>
      </div>
    </div>
  );
}

function SingleRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
      <div>
        <Label>{label}</Label>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.85rem' }}>
        {children}
      </div>
    </div>
  );
}

export default function TransferSlipPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addSubmission } = useData();

  const [v, setV] = useState({
    projectName: "",
    slipTitle: "振替伝票",
    inputUserFrom: "000001945",
    inputUserTo: "000001945",
    slipType: "支払伝票",
    slipNoFrom: "",
    slipNoTo: "",
    inputDateFrom: "",
    inputDateTo: "",
    deptFromCode: "0000",
    deptFromName: "全社",
    deptToCode: "",
    deptToName: "",
    approval: "unapproved",
    issue: "notIssued",
  });

  // 申請モーダル用
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTab, setActiveTab] = useState<'slip' | 'attachment'>('slip');

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  const handleBack = () => {
    router.push('/payment-slip');
  };

  // 申請モーダルを開く
  const handleOpenModal = () => {
    setShowModal(true);
    setIsSubmitted(false);
    if (approvers.length > 0) {
      setSelectedApprover(approvers[0].id);
    }
  };

  // 申請モーダルを閉じる
  const handleCloseModal = () => {
    setShowModal(false);
    setIsSubmitted(false);
  };

  // 申請を実行
  const handleSubmit = async () => {
    if (!selectedApprover || !currentUser) return;

    setIsSubmitting(true);

    addSubmission({
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      type: '振替伝票',
      title: v.projectName || '工事名未設定',
      status: 'pending',
      data: {
        formDataJson: JSON.stringify(v),
      },
      assignedTo: selectedApprover,
      approvalFlow: [
        { label: '支店', status: 'completed' },
        { label: '支社', status: 'current' },
        { label: '経理部', status: 'pending' },
        { label: '本社', status: 'pending' },
      ],
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      {/* ヘッダー */}
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: 36, height: 36, backgroundColor: '#0d56c9', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="20" height="20" fill="none" stroke="#fff" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>振替伝票入力</h1>
              <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.8 }}>Transfer Slip Entry</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={handleOpenModal}
              style={{ ...buttonStyle, backgroundColor: '#10b981', color: '#fff' }}
            >
              申請
            </button>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 24px' }}>
        <div style={cardStyle}>
          {/* 帳票タイトル */}
          <div style={{ ...cardHeaderStyle, borderBottom: '1px solid #dde5f4' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', alignItems: 'center', gap: '1rem' }}>
              <label style={labelStyle}>帳票タイトル</label>
              <input
                type="text"
                value={v.slipTitle}
                onChange={(e) => setV((x) => ({ ...x, slipTitle: e.target.value }))}
                style={{ ...inputStyle, maxWidth: '400px' }}
              />
            </div>
            <div style={{ marginTop: '0.75rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>
              出力条件項目
            </div>
          </div>

          {/* 条件テーブル */}
          <div style={{ padding: '1rem' }}>
            <HeadBar left="条件項目" right="条件範囲設定" />

            <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <RangeRow
                label="入力担当者"
                left={
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={v.inputUserFrom}
                      onChange={(e) => setV((x) => ({ ...x, inputUserFrom: e.target.value }))}
                      style={{ ...inputStyle, backgroundColor: '#fef9c3', paddingRight: '2rem' }}
                    />
                    <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#686e78', pointerEvents: 'none' }}>
                      ▾
                    </div>
                  </div>
                }
                right={
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={v.inputUserTo}
                      onChange={(e) => setV((x) => ({ ...x, inputUserTo: e.target.value }))}
                      style={{ ...inputStyle, paddingRight: '2rem' }}
                    />
                    <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#686e78', pointerEvents: 'none' }}>
                      ▾
                    </div>
                  </div>
                }
              />

              <RangeRow
                label="伝票区分"
                left={
                  <select
                    value={v.slipType}
                    onChange={(e) => setV((x) => ({ ...x, slipType: e.target.value }))}
                    style={selectStyle}
                  >
                    <option value="支払伝票">支払伝票</option>
                    <option value="振替伝票">振替伝票</option>
                    <option value="入金伝票">入金伝票</option>
                  </select>
                }
                right={<div style={{ fontSize: '0.8rem', color: '#9ca3af' }}> </div>}
              />

              <RangeRow
                label="伝票No."
                left={
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={v.slipNoFrom}
                      onChange={(e) => setV((x) => ({ ...x, slipNoFrom: e.target.value }))}
                      style={{ ...inputStyle, paddingRight: '2rem' }}
                    />
                    <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#686e78', pointerEvents: 'none' }}>
                      ▾
                    </div>
                  </div>
                }
                right={
                  <div style={{ position: 'relative' }}>
                    <input
                      type="text"
                      value={v.slipNoTo}
                      onChange={(e) => setV((x) => ({ ...x, slipNoTo: e.target.value }))}
                      style={{ ...inputStyle, paddingRight: '2rem' }}
                    />
                    <div style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: '#686e78', pointerEvents: 'none' }}>
                      ▾
                    </div>
                  </div>
                }
              />

              <RangeRow
                label="入力日付"
                left={
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="date"
                      value={v.inputDateFrom}
                      onChange={(e) => setV((x) => ({ ...x, inputDateFrom: e.target.value }))}
                      style={inputStyle}
                    />
                    <div style={{
                      height: '2rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #dde5f4',
                      backgroundColor: '#fff',
                      padding: '0 0.5rem',
                      fontSize: '0.8rem',
                      lineHeight: '2rem',
                      color: '#9ca3af',
                    }}>
                      年／月／日
                    </div>
                  </div>
                }
                right={
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                    <input
                      type="date"
                      value={v.inputDateTo}
                      onChange={(e) => setV((x) => ({ ...x, inputDateTo: e.target.value }))}
                      style={inputStyle}
                    />
                    <div style={{
                      height: '2rem',
                      borderRadius: '0.375rem',
                      border: '1px solid #dde5f4',
                      backgroundColor: '#fff',
                      padding: '0 0.5rem',
                      fontSize: '0.8rem',
                      lineHeight: '2rem',
                      color: '#9ca3af',
                    }}>
                      年／月／日
                    </div>
                  </div>
                }
              />

              <RangeRow
                label="入力部門"
                left={
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={v.deptFromCode}
                      onChange={(e) => setV((x) => ({ ...x, deptFromCode: e.target.value }))}
                      style={inputStyle}
                    />
                    <select
                      value={v.deptFromName}
                      onChange={(e) => setV((x) => ({ ...x, deptFromName: e.target.value }))}
                      style={selectStyle}
                    >
                      <option>全社</option>
                      <option>本社</option>
                      <option>東京支社</option>
                    </select>
                  </div>
                }
                right={
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '0.5rem' }}>
                    <input
                      type="text"
                      value={v.deptToCode}
                      onChange={(e) => setV((x) => ({ ...x, deptToCode: e.target.value }))}
                      style={inputStyle}
                    />
                    <select
                      value={v.deptToName}
                      onChange={(e) => setV((x) => ({ ...x, deptToName: e.target.value }))}
                      style={selectStyle}
                    >
                      <option value=""> </option>
                      <option>全社</option>
                      <option>本社</option>
                      <option>東京支社</option>
                    </select>
                  </div>
                }
              />

              {/* 承認状況 */}
              <SingleRow label="承認状況">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="approval"
                    checked={v.approval === "unapproved"}
                    onChange={() => setV((x) => ({ ...x, approval: "unapproved" }))}
                    style={{ width: 16, height: 16 }}
                  />
                  未承認
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="approval"
                    checked={v.approval === "approved"}
                    onChange={() => setV((x) => ({ ...x, approval: "approved" }))}
                    style={{ width: 16, height: 16 }}
                  />
                  承認
                </label>
              </SingleRow>

              {/* 発行状態 */}
              <SingleRow label="発行状態">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="issue"
                    checked={v.issue === "notIssued"}
                    onChange={() => setV((x) => ({ ...x, issue: "notIssued" }))}
                    style={{ width: 16, height: 16 }}
                  />
                  未発行
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="issue"
                    checked={v.issue === "issued"}
                    onChange={() => setV((x) => ({ ...x, issue: "issued" }))}
                    style={{ width: 16, height: 16 }}
                  />
                  発行済
                </label>
              </SingleRow>
            </div>
          </div>

          {/* ステータスバー */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid #dde5f4',
            backgroundColor: '#f8f9fa',
            padding: '0.5rem 1rem',
            fontSize: '0.75rem',
            color: '#686e78',
          }}>
            <div>{v.slipTitle}</div>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <span>カスタマイズ</span>
              <span>{new Date().toLocaleDateString('ja-JP')}</span>
              <span>{new Date().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </div>
        </div>
      </main>

      {/* フッター */}
      <footer style={{ borderTop: '1px solid #dde5f4', backgroundColor: '#fff', padding: '1rem 0' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#686e78' }}>振替伝票管理システム</p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#686e78' }}>ショートカット: F2=印刷 / F5=保存 / F12=検索</p>
        </div>
      </footer>

      {/* 申請モーダル */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>振替伝票 申請確認</h2>
              <button style={{ width: 32, height: 32, border: 'none', backgroundColor: 'transparent', fontSize: '1.5rem', cursor: 'pointer', color: '#686e78' }} onClick={handleCloseModal}>×</button>
            </div>

            {isSubmitted ? (
              <div style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ padding: '1rem', backgroundColor: '#d1fae5', borderRadius: '0.5rem', color: '#065f46', fontSize: '0.95rem' }}>
                  申請が完了しました。承認者に通知されました。
                </div>
              </div>
            ) : (
              <>
                {/* タブ */}
                <div style={{ display: 'flex', borderBottom: '1px solid #dde5f4', overflowX: 'auto' }}>
                  <button onClick={() => setActiveTab('slip')} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === 'slip' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'slip' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>振替伝票</button>
                  <button onClick={() => setActiveTab('attachment')} style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', fontWeight: 600, border: 'none', backgroundColor: '#fff', color: activeTab === 'attachment' ? '#0d56c9' : '#686e78', borderBottom: activeTab === 'attachment' ? '2px solid #0d56c9' : '2px solid transparent', cursor: 'pointer', whiteSpace: 'nowrap' }}>添付書類</button>
                </div>

                {/* PDFプレビュー */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {activeTab === 'slip' && (
                      <iframe
                        src="/支払伝票のみ.pdf"
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="振替伝票"
                      />
                    )}
                    {activeTab === 'attachment' && (
                      <div style={{ color: '#686e78', fontSize: '0.9rem' }}>添付書類がありません</div>
                    )}
                  </div>
                </div>

                {/* 工事名入力・申請先選択 */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', backgroundColor: '#f8f9fa', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>工事名 <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      value={v.projectName}
                      onChange={(e) => setV((x) => ({ ...x, projectName: e.target.value }))}
                      placeholder="工事名を入力してください"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>申請先を選択</label>
                    <select
                      value={selectedApprover}
                      onChange={(e) => setSelectedApprover(e.target.value)}
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}
                    >
                      {approvers.map((approver) => (
                        <option key={approver.id} value={approver.id}>
                          {approver.name}（{approver.department}）
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              {isSubmitted ? (
                <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>閉じる</button>
              ) : (
                <>
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#686e78', borderRadius: '0.375rem', cursor: 'pointer' }} onClick={handleCloseModal}>キャンセル</button>
                  <button
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedApprover}
                  >
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
