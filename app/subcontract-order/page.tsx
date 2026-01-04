"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useAuth, DEMO_USERS } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import {
  useOrderData,
  DetailRow,
  AdvanceRow,
  VendorRow,
  VendorFormData,
  OrderHeader,
} from "../contexts/OrderDataContext";

import { SubjectMaster } from "../order-contract/types";
import { calcPercent } from "../order-contract/utils";
import {
  OrderFormSection,
  OrderTabs,
} from "../order-contract/components";

export default function SubcontractOrderPage() {
  const { currentUser } = useAuth();
  const { addSubmission } = useData();

  // マスターデータ
  const [subjectMaster, setSubjectMaster] = useState<SubjectMaster[]>([]);

  // マスターデータを読み込み
  useEffect(() => {
    fetch('/subjectMaster.json')
      .then(res => res.json())
      .then(data => setSubjectMaster(data))
      .catch(err => console.error('マスターデータの読み込みに失敗:', err));
  }, []);

  // コンテキストから発注データを取得
  const {
    orders,
    currentOrderIndex,
    setCurrentOrderIndex,
    addOrder,
    removeOrder,
    updateOrder,
  } = useOrderData();

  // 現在の発注データへのアクセサ
  const currentOrder = orders[currentOrderIndex];
  const header = currentOrder.header;
  const rows = currentOrder.rows;
  const advanceRows = currentOrder.advanceRows;
  const vendorForm = currentOrder.vendorForm;
  const vendorRows = currentOrder.vendorRows;

  const setHeader = (updater: OrderHeader | ((h: OrderHeader) => OrderHeader)) => {
    const newHeader = typeof updater === 'function' ? updater(header) : updater;
    updateOrder(currentOrderIndex, { header: newHeader });
  };
  const setRows = (updater: DetailRow[] | ((r: DetailRow[]) => DetailRow[])) => {
    const newRows = typeof updater === 'function' ? updater(rows) : updater;
    updateOrder(currentOrderIndex, { rows: newRows });
  };
  const setAdvanceRows = (updater: AdvanceRow[] | ((r: AdvanceRow[]) => AdvanceRow[])) => {
    const newAdvanceRows = typeof updater === 'function' ? updater(advanceRows) : updater;
    updateOrder(currentOrderIndex, { advanceRows: newAdvanceRows });
  };
  const setVendorForm = (updater: VendorFormData | ((f: VendorFormData) => VendorFormData)) => {
    const newVendorForm = typeof updater === 'function' ? updater(vendorForm) : updater;
    updateOrder(currentOrderIndex, { vendorForm: newVendorForm });
  };
  const setVendorRows = (updater: VendorRow[] | ((r: VendorRow[]) => VendorRow[])) => {
    const newVendorRows = typeof updater === 'function' ? updater(vendorRows) : updater;
    updateOrder(currentOrderIndex, { vendorRows: newVendorRows });
  };

  // 新規発注を追加
  const handleAddNewOrder = () => {
    addOrder();
  };

  // 発注を削除
  const handleRemoveOrder = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    removeOrder(idx);
  };

  // 申請モーダル用
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [modalActiveTab, setModalActiveTab] = useState(0);

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  const percentByRow = useMemo(
    () => rows.map((r) => calcPercent(r.contractAmount, r.listPrice)),
    [rows]
  );

  // 申請モーダルを開く
  const handleOpenModal = () => {
    setShowModal(true);
    setIsSubmitted(false);
    setModalActiveTab(0);
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
      type: '発注契約',
      title: header.projectName || '工事名未設定',
      status: 'pending',
      data: {
        orderNo: header.orderNo,
        vendor: header.vendor,
        project: header.project,
        subject: header.subject,
        ordersCount: orders.length.toString(),
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
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>(外注)発注契約登録</h1>
          <button
            onClick={handleOpenModal}
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem',
              fontWeight: 600,
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              cursor: 'pointer',
            }}
          >
            申請
          </button>
        </div>
      </header>

      {/* 発注タブ（複数発注） */}
      <OrderTabs
        orders={orders}
        currentOrderIndex={currentOrderIndex}
        setCurrentOrderIndex={setCurrentOrderIndex}
        onAddOrder={handleAddNewOrder}
        onRemoveOrder={handleRemoveOrder}
      />

      {/* メインコンテンツ */}
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <main style={{ padding: '1.5rem 24px' }}>
          <OrderFormSection
            header={header}
            setHeader={setHeader}
            rows={rows}
            setRows={setRows}
            advanceRows={advanceRows}
            setAdvanceRows={setAdvanceRows}
            vendorForm={vendorForm}
            setVendorForm={setVendorForm}
            vendorRows={vendorRows}
            setVendorRows={setVendorRows}
            percentByRow={percentByRow}
            subjectMaster={subjectMaster}
          />
        </main>
      </div>

      {/* 申請モーダル */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '95%', maxWidth: '1000px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>(外注)発注契約登録 申請確認</h2>
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
                {/* 注文伺書タブ */}
                <div style={{ display: 'flex', borderBottom: '1px solid #dde5f4', overflowX: 'auto' }}>
                  {orders.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setModalActiveTab(idx)}
                      style={{
                        padding: '0.75rem 1rem',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        border: 'none',
                        backgroundColor: '#fff',
                        color: modalActiveTab === idx ? '#0d56c9' : '#686e78',
                        borderBottom: modalActiveTab === idx ? '2px solid #0d56c9' : '2px solid transparent',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      注文伺書({idx + 1})
                    </button>
                  ))}
                </div>

                {/* 注文伺書PDFプレビュー */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px' }}>
                    <iframe
                      src="/注文伺書（データ消し・サンプルデータ）.pdf"
                      style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                      title={`注文伺書(${modalActiveTab + 1})`}
                    />
                  </div>
                </div>

                {/* 工事名入力・申請先選択 */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', backgroundColor: '#f8f9fa', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>工事名 <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      value={header.projectName}
                      onChange={(e) => setHeader((h) => ({ ...h, projectName: e.target.value }))}
                      placeholder="工事名を入力してください"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '250px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>申請先を選択</label>
                    <select value={selectedApprover} onChange={(e) => setSelectedApprover(e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff' }}>
                      {approvers.map((approver) => (
                        <option key={approver.id} value={approver.id}>{approver.name}（{approver.department}）</option>
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
                  <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting ? 'not-allowed' : 'pointer' }} onClick={handleSubmit} disabled={isSubmitting || !selectedApprover}>
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
