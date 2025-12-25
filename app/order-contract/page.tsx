"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { PDFDocument, TextAlignment } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { useRouter } from "next/navigation";
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

import { DocType, DocItem, SubjectMaster, initialDocs, DocStatus } from "./types";
import { toNum, calcPercent, toHankaku } from "./utils";
import {
  OrderFormSection,
  DocumentTabs,
  OrderTabs,
  SubmissionModal,
  BudgetLedgerTab,
  OrderScheduleTab,
  OrderInquiryTab,
  PdfUploadTab,
} from "./components";

export default function OrderContractPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addSubmission } = useData();

  // 書類タブ
  const [docTab, setDocTab] = useState<DocType | 'order'>('order');

  // 書類状態
  const [docs, setDocs] = useState<DocItem[]>(initialDocs);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadTarget, setUploadTarget] = useState<DocType | null>(null);

  // 発注予定表の表示モード
  const [scheduleViewMode, setScheduleViewMode] = useState<'input' | 'pdf'>('input');
  // 工事実行予算台帳の表示モード
  const [ledgerViewMode, setLedgerViewMode] = useState<'input' | 'pdf'>('input');
  // 注文伺書の選択インデックス
  const [inquiryIndex, setInquiryIndex] = useState(0);
  // PDF生成中フラグ
  const [ledgerPdfLoading, setLedgerPdfLoading] = useState(false);
  // 生成されたPDFのBlobURL
  const [ledgerPdfUrl, setLedgerPdfUrl] = useState<string | null>(null);

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
    ledgerHeader,
    setLedgerHeader,
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

  // PDF添付
  const handleFileUpload = (type: DocType, file: File) => {
    const url = URL.createObjectURL(file);
    setDocs(prev => prev.map(d =>
      d.type === type ? { ...d, pdfFile: file, pdfUrl: url, status: 'pdf-attached' as DocStatus } : d
    ));
  };

  // 申請モーダル用
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  const percentByRow = useMemo(
    () => rows.map((r) => calcPercent(r.contractAmount, r.listPrice)),
    [rows]
  );

  // 工事実行予算台帳用：全発注の発注明細を集約
  const aggregatedLedgerRows = useMemo(() => {
    return orders.flatMap((order, orderIdx) =>
      order.rows
        .filter(row => row.workTypeCode || row.workType || row.execBudget || row.contractAmount)
        .map(row => ({
          orderLabel: `外注発注(${orderIdx + 1})`,
          vendor: order.header.vendor,
          workTypeCode: row.workTypeCode,
          workType: row.workType,
          execBudget: row.execBudget,
          contractAmount: row.contractAmount,
        }))
    );
  }, [orders]);

  // 工事実行予算台帳ヘッダーの自動計算
  const ledgerHeaderCalculated = useMemo(() => {
    const totalBudget = aggregatedLedgerRows.reduce((sum, row) => {
      const val = toNum(row.execBudget);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
    const totalOrder = aggregatedLedgerRows.reduce((sum, row) => {
      const val = toNum(row.contractAmount);
      return sum + (Number.isFinite(val) ? val : 0);
    }, 0);
    const plannedOrder = toNum(ledgerHeader.plannedOrder) || 0;
    const contractAmount = toNum(ledgerHeader.contractAmount) || 0;
    const budgetRemain = totalBudget - totalOrder - plannedOrder;
    const plannedProfit = contractAmount - totalOrder - plannedOrder;

    return {
      budgetAmount: totalBudget,
      orderAmount: totalOrder,
      budgetRemain,
      plannedProfit,
    };
  }, [aggregatedLedgerRows, ledgerHeader.plannedOrder, ledgerHeader.contractAmount]);

  // 工事実行予算台帳のPDF生成
  const generateLedgerPdf = async () => {
    setLedgerPdfLoading(true);
    if (ledgerPdfUrl) {
      URL.revokeObjectURL(ledgerPdfUrl);
    }
    try {
      const response = await fetch("/工事実行予算台帳入力欄あり.pdf");
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      pdfDoc.registerFontkit(fontkit);
      const fontResponse = await fetch("/fonts/NotoSansCJKjp-Regular.otf");
      const fontBytes = await fontResponse.arrayBuffer();
      const japaneseFont = await pdfDoc.embedFont(fontBytes);

      const form = pdfDoc.getForm();

      aggregatedLedgerRows.forEach((row, idx) => {
        const rowNum = idx + 1;
        let codeItemValue = '';
        if (row.workTypeCode && row.workType) {
          codeItemValue = `${toHankaku(row.workTypeCode)} ${row.workType}`;
        } else if (row.workTypeCode) {
          codeItemValue = toHankaku(row.workTypeCode);
        } else if (row.workType) {
          codeItemValue = row.workType;
        }

        const budget = toNum(row.execBudget);
        const contract = toNum(row.contractAmount);
        const balance = (Number.isFinite(budget) && Number.isFinite(contract))
          ? (budget - contract).toString()
          : '';

        const fieldMappings: { [key: string]: string } = {
          [`row${rowNum}_codeItem`]: codeItemValue,
          [`row${rowNum}_budgetAmount`]: toHankaku(row.execBudget || ''),
          [`row${rowNum}_orderAmount`]: toHankaku(row.contractAmount || ''),
          [`row${rowNum}_balance`]: toHankaku(balance),
        };

        Object.entries(fieldMappings).forEach(([fieldName, value]) => {
          try {
            const textField = form.getTextField(fieldName);
            textField.setFontSize(9);
            textField.setAlignment(TextAlignment.Center);
            textField.setText(value || "");
            textField.updateAppearances(japaneseFont);
          } catch {
            console.log(`Field not found: ${fieldName}`);
          }
        });
      });

      const headerFieldMappings: { [key: string]: string } = {
        'contractAmount': toHankaku(ledgerHeader.contractAmount || ''),
        'inProgressAmount': toHankaku(ledgerHeaderCalculated.budgetAmount.toString()),
        'orderAmount': toHankaku(ledgerHeaderCalculated.orderAmount.toString()),
        'plannedOrder': toHankaku(ledgerHeader.plannedOrder || ''),
        'budgetRemain': toHankaku(ledgerHeaderCalculated.budgetRemain.toString()),
        'plannedProfit': toHankaku(ledgerHeaderCalculated.plannedProfit.toString()),
      };

      Object.entries(headerFieldMappings).forEach(([fieldName, value]) => {
        try {
          const textField = form.getTextField(fieldName);
          textField.setFontSize(9);
          textField.setAlignment(TextAlignment.Center);
          textField.setText(value || "");
          textField.updateAppearances(japaneseFont);
        } catch {
          console.log(`Header field not found: ${fieldName}`);
        }
      });

      form.flatten();

      const filledPdfBytes = await pdfDoc.save();
      const ab = new ArrayBuffer(filledPdfBytes.byteLength);
      new Uint8Array(ab).set(filledPdfBytes);
      const blob = new Blob([ab], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      setLedgerPdfUrl(url);
      setLedgerViewMode('pdf');
    } catch (error) {
      console.error("PDF生成エラー:", error);
      alert("PDF生成に失敗しました");
    } finally {
      setLedgerPdfLoading(false);
    }
  };

  const closeLedgerPdfPreview = () => {
    setLedgerViewMode('input');
  };

  // 発注予定表用：全発注の発注明細を集約
  const aggregatedScheduleRows = useMemo(() => {
    return orders.flatMap((order) =>
      order.rows
        .filter(row => row.workTypeCode || row.workType || row.contractAmount)
        .map(row => ({
          workTypeCode: row.workTypeCode,
          workType: row.workType,
          vendor: order.header.vendor,
          amount: row.contractAmount,
        }))
    );
  }, [orders]);

  // 申請モーダルを開く
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

  const handleUploadClick = (type: DocType) => {
    setUploadTarget(type);
    fileInputRef.current?.click();
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1600px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>外注発注</h1>
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

      {/* 書類タブ */}
      <DocumentTabs docTab={docTab} setDocTab={setDocTab} docs={docs} />

      {/* 発注タブ（複数発注） */}
      {docTab === 'order' && (
        <OrderTabs
          orders={orders}
          currentOrderIndex={currentOrderIndex}
          setCurrentOrderIndex={setCurrentOrderIndex}
          onAddOrder={handleAddNewOrder}
          onRemoveOrder={handleRemoveOrder}
        />
      )}

      {/* メインコンテンツ */}
      <div style={{ maxWidth: '1600px', margin: '0 auto' }}>
        <main style={{ padding: '1.5rem 24px' }}>
          {/* 選択した書類を表示 */}
          {docTab !== 'order' ? (
            <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', padding: '2rem', textAlign: 'center' }}>
              {docTab === 'budget-ledger' && (
                <BudgetLedgerTab
                  ledgerViewMode={ledgerViewMode}
                  ledgerHeader={ledgerHeader}
                  setLedgerHeader={setLedgerHeader}
                  ledgerHeaderCalculated={ledgerHeaderCalculated}
                  aggregatedLedgerRows={aggregatedLedgerRows}
                  ledgerPdfLoading={ledgerPdfLoading}
                  ledgerPdfUrl={ledgerPdfUrl}
                  onGeneratePdf={generateLedgerPdf}
                  onClosePdfPreview={closeLedgerPdfPreview}
                />
              )}
              {docTab === 'order-inquiry' && (
                <OrderInquiryTab
                  orders={orders}
                  inquiryIndex={inquiryIndex}
                  setInquiryIndex={setInquiryIndex}
                />
              )}
              {docTab === 'order-schedule' && (
                <OrderScheduleTab
                  scheduleViewMode={scheduleViewMode}
                  setScheduleViewMode={setScheduleViewMode}
                  aggregatedScheduleRows={aggregatedScheduleRows}
                />
              )}
              {docTab === 'quote-request' && (
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1c20', marginBottom: '1rem' }}>見積依頼書</p>
                  <p style={{ fontSize: '0.85rem', color: '#686e78' }}>準備中です</p>
                </div>
              )}
              {(docTab === 'vendor-quote' || docTab === 'progress-invoice') && (
                <PdfUploadTab
                  docType={docTab}
                  docs={docs}
                  onUploadClick={() => handleUploadClick(docTab)}
                />
              )}
            </div>
          ) : (
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
          )}
        </main>
      </div>

      {/* 隠しファイル入力 */}
      <input
        type="file"
        accept=".pdf"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && uploadTarget) {
            handleFileUpload(uploadTarget, file);
            setUploadTarget(null);
          }
        }}
      />

      {/* 申請モーダル */}
      <SubmissionModal
        showModal={showModal}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isSubmitted={isSubmitted}
        header={header}
        setHeader={setHeader}
        orders={orders}
        docs={docs}
        ledgerPdfUrl={ledgerPdfUrl}
        selectedApprover={selectedApprover}
        setSelectedApprover={setSelectedApprover}
      />
    </div>
  );
}
