"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PDFDocument, TextAlignment } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { useAuth, DEMO_USERS } from "../contexts/AuthContext";
import { useData } from "../contexts/DataContext";
import Link from "next/link";

interface BudgetFormData {
  工番: string;
  工事名称: string;
  工期着工: string;
  工期竣工: string;
  期間: string;
  工事場所: string;
  作成日: string;
  受注形態: string;
  受注先名: string;
  施主: string;
  設計事務所: string;
  ゼネコン: string;
  建物用途: string;
  "受注金額/工期月数": string;
  電気: string;
  空調: string;
  衛生: string;
  受注金額: string;
  積算金額: string;
  積算金額CA: string;
  受注金額BA: string;
  見積No: string;
  積算日付: string;
  請求回数: string;
  支払条件: string;
  直接工事原価_基準原価: string;
  直接工事原価CB: string;
  直接工事原価_支社受受注前原価検討金: string;
  直接工事原価DB: string;
  直接工事原価_1回目予算金額: string;
  直接工事原価EB: string;
  実行予算金額_基準原価: string;
  実行予算金額CB: string;
  実行予算金額_支社受受注前原価検討金: string;
  実行予算金額DB: string;
  実行予算金額_1回目予算金額: string;
  実行予算金額EB: string;
  財務粗利益_基準原価: string;
  財務粗利益_CB: string;
  財務粗利益_支社受受注前原価検討金額: string;
  財務粗利益DB: string;
  財務粗利益_1回目予算金額: string;
  財務粗利益EB: string;
  材料費_基準原価: string;
  材料費_支社受注前原価検討金額: string;
  材料費_比率: string;
  材料費_1回目予算金額: string;
  材料費_構成比: string;
  機械他材料_基準原価: string;
  機械他材料_比率: string;
  機械他材料_支社受注前原価検討金額: string;
  機械他材料_材料: string;
  機械他材料_1回目予算金額: string;
  機械他材料_構成比: string;
}

const initialFormData: BudgetFormData = {
  工番: "2025-001",
  工事名称: "〇〇ビル空調設備工事",
  工期着工: "2025-04-01",
  工期竣工: "2026-03-31",
  期間: "12ヶ月",
  工事場所: "東京都千代田区丸の内1-1-1",
  作成日: new Date().toISOString().split("T")[0],
  受注形態: "元請・一式請負",
  受注先名: "株式会社サンプル建設",
  施主: "サンプル不動産株式会社",
  設計事務所: "サンプル設計事務所一級建築士事務所",
  ゼネコン: "株式会社サンプル建設",
  建物用途: "事務所ビル（地上10階・地下1階）",
  "受注金額/工期月数": "10,000",
  電気: "6,000",
  空調: "2,500",
  衛生: "1,000",
  受注金額: "120,000",
  積算金額: "110,000",
  積算金額CA: "72.7%",
  受注金額BA: "109.1%",
  見積No: "EST-2025-001",
  積算日付: "2025-03-01",
  請求回数: "12",
  支払条件: "月末締め翌月末払い",
  直接工事原価_基準原価: "80,000",
  直接工事原価CB: "66.7%",
  直接工事原価_支社受受注前原価検討金: "85,000",
  直接工事原価DB: "70.8%",
  直接工事原価_1回目予算金額: "90,000",
  直接工事原価EB: "75.0%",
  実行予算金額_基準原価: "82,000",
  実行予算金額CB: "68.3%",
  実行予算金額_支社受受注前原価検討金: "88,000",
  実行予算金額DB: "73.3%",
  実行予算金額_1回目予算金額: "95,000",
  実行予算金額EB: "79.2%",
  財務粗利益_基準原価: "38,000",
  財務粗利益_CB: "31.7%",
  財務粗利益_支社受受注前原価検討金額: "32,000",
  財務粗利益DB: "26.7%",
  財務粗利益_1回目予算金額: "25,000",
  財務粗利益EB: "20.8%",
  材料費_基準原価: "35,000",
  材料費_支社受注前原価検討金額: "37,000",
  材料費_比率: "43.8%",
  材料費_1回目予算金額: "40,000",
  材料費_構成比: "44.4%",
  機械他材料_基準原価: "15,000",
  機械他材料_比率: "18.8%",
  機械他材料_支社受注前原価検討金額: "16,000",
  機械他材料_材料: "18.8%",
  機械他材料_1回目予算金額: "18,000",
  機械他材料_構成比: "20.0%",
};

export default function BudgetFormPage() {
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addSubmission } = useData();
  const [formData, setFormData] = useState<BudgetFormData>(initialFormData);
  const [loading, setLoading] = useState(false);

  // 申請モーダル用
  const [showModal, setShowModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState("");
  const [projectName, setProjectName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  const approvers = DEMO_USERS.filter(u => u.role === 'manager');

  const handleChange = (field: keyof BudgetFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // PDFを生成してBlobURLを返す
  const generatePdfBlob = async (): Promise<string> => {
    const response = await fetch("/予算書フォーマット.pdf");
    const pdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);

    pdfDoc.registerFontkit(fontkit);
    const fontResponse = await fetch("/fonts/NotoSansCJKjp-Regular.otf");
    const fontBytes = await fontResponse.arrayBuffer();
    const japaneseFont = await pdfDoc.embedFont(fontBytes);

    const form = pdfDoc.getForm();

    Object.entries(formData).forEach(([fieldName, value]) => {
      try {
        const textField = form.getTextField(fieldName);
        textField.setFontSize(11);
        textField.setAlignment(TextAlignment.Center);
        textField.setText(value);
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
  };

  const handleOpenModal = async () => {
    setShowModal(true);
    setIsSubmitted(false);
    setProjectName("");
    setGeneratingPreview(true);
    if (approvers.length > 0) {
      setSelectedApprover(approvers[0].id);
    }

    try {
      const url = await generatePdfBlob();
      setPreviewPdfUrl(url);
    } catch (error) {
      console.error("プレビュー生成エラー:", error);
    } finally {
      setGeneratingPreview(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setIsSubmitted(false);
    if (previewPdfUrl) {
      URL.revokeObjectURL(previewPdfUrl);
      setPreviewPdfUrl(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedApprover || !currentUser || !projectName) return;

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    // フォームデータをJSON文字列で保存（承認側で再生成用）
    addSubmission({
      applicantId: currentUser.id,
      applicantName: currentUser.name,
      type: '実行予算書',
      title: projectName,
      status: 'pending',
      data: {
        projectName,
        formDataJson: JSON.stringify(formData),
      },
      assignedTo: selectedApprover,
      approvalFlow: [
        { label: '自分', status: 'completed' },
        { label: '工事部長', status: 'current' },
      ],
    });

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const handleSave = async () => {
    console.log(JSON.stringify(formData, null, 2));
    setLoading(true);
    try {
      const response = await fetch("/予算書フォーマット.pdf");
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      pdfDoc.registerFontkit(fontkit);
      const fontResponse = await fetch("/fonts/NotoSansCJKjp-Regular.otf");
      const fontBytes = await fontResponse.arrayBuffer();
      const japaneseFont = await pdfDoc.embedFont(fontBytes);

      const form = pdfDoc.getForm();

      Object.entries(formData).forEach(([fieldName, value]) => {
        try {
          const textField = form.getTextField(fieldName);
          textField.setFontSize(11);
          textField.setAlignment(TextAlignment.Center);
          textField.setText(value);
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `実行予算書_${formData.工番 || "未設定"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF出力エラー:", error);
      alert("PDF出力に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    console.log(JSON.stringify(formData, null, 2));
    setLoading(true);
    try {
      const response = await fetch("/予算書フォーマット.pdf");
      const pdfBytes = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);

      pdfDoc.registerFontkit(fontkit);
      const fontResponse = await fetch("/fonts/NotoSansCJKjp-Regular.otf");
      const fontBytes = await fontResponse.arrayBuffer();
      const japaneseFont = await pdfDoc.embedFont(fontBytes);

      const form = pdfDoc.getForm();

      Object.entries(formData).forEach(([fieldName, value]) => {
        try {
          const textField = form.getTextField(fieldName);
          textField.setFontSize(11);
          textField.setAlignment(TextAlignment.Center);
          textField.setText(value);
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
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `実行予算書_${formData.工番 || "未設定"}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF出力エラー:", error);
      alert("PDF出力に失敗しました");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f0f2f7' }}>
      <header style={{ backgroundColor: '#132942', color: '#fff', padding: '0.75rem 0', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>実行予算書 作成</h1>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={handleSave} disabled={loading} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#6b7280', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? "保存中..." : "保存"}
            </button>
            <button onClick={handleOpenModal} style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>
              申請
            </button>
          </div>
        </div>
      </header>

      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '1.5rem 24px' }}>
        {/* 基本情報 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>基本情報</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工番</label>
                <input type="text" value={formData.工番} onChange={(e) => handleChange("工番", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>作成日</label>
                <input type="date" value={formData.作成日} onChange={(e) => handleChange("作成日", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工事名称</label>
                <input type="text" value={formData.工事名称} onChange={(e) => handleChange("工事名称", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工事場所</label>
                <input type="text" value={formData.工事場所} onChange={(e) => handleChange("工事場所", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工期（着工）</label>
                <input type="date" value={formData.工期着工} onChange={(e) => handleChange("工期着工", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>工期（竣工）</label>
                <input type="date" value={formData.工期竣工} onChange={(e) => handleChange("工期竣工", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>期間</label>
                <input type="text" value={formData.期間} onChange={(e) => handleChange("期間", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 受注情報 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>受注情報</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>受注形態</label>
                <input type="text" value={formData.受注形態} onChange={(e) => handleChange("受注形態", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>受注先名（No.）</label>
                <input type="text" value={formData.受注先名} onChange={(e) => handleChange("受注先名", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>施主</label>
                <input type="text" value={formData.施主} onChange={(e) => handleChange("施主", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>設計事務所</label>
                <input type="text" value={formData.設計事務所} onChange={(e) => handleChange("設計事務所", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>ゼネコン</label>
                <input type="text" value={formData.ゼネコン} onChange={(e) => handleChange("ゼネコン", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 建物・金額情報 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>建物・金額情報</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>建物用途</label>
                <input type="text" value={formData.建物用途} onChange={(e) => handleChange("建物用途", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>受注金額/工期月数</label>
                <input type="text" value={formData["受注金額/工期月数"]} onChange={(e) => handleChange("受注金額/工期月数", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>電気</label>
                <input type="text" value={formData.電気} onChange={(e) => handleChange("電気", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>空調</label>
                <input type="text" value={formData.空調} onChange={(e) => handleChange("空調", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>衛生</label>
                <input type="text" value={formData.衛生} onChange={(e) => handleChange("衛生", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>受注金額</label>
                <input type="text" value={formData.受注金額} onChange={(e) => handleChange("受注金額", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>積算金額</label>
                <input type="text" value={formData.積算金額} onChange={(e) => handleChange("積算金額", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>C/A</label>
                <input type="text" value={formData.積算金額CA} onChange={(e) => handleChange("積算金額CA", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>B/A</label>
                <input type="text" value={formData.受注金額BA} onChange={(e) => handleChange("受注金額BA", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>見積No</label>
                <input type="text" value={formData.見積No} onChange={(e) => handleChange("見積No", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>積算日付</label>
                <input type="date" value={formData.積算日付} onChange={(e) => handleChange("積算日付", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>請求回数</label>
                <input type="text" value={formData.請求回数} onChange={(e) => handleChange("請求回数", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.375rem', fontSize: '0.8rem', fontWeight: 600, color: '#1a1c20' }}>支払条件</label>
                <input type="text" value={formData.支払条件} onChange={(e) => handleChange("支払条件", e.target.value)} style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', boxSizing: 'border-box' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 原価情報 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>原価情報</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>費目</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>基準原価</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>C/B</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>支社受注前原価検討金額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>D/B</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>1回目予算金額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>E/B</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>直接工事原価</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.直接工事原価_基準原価} onChange={(e) => handleChange("直接工事原価_基準原価", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.直接工事原価CB} onChange={(e) => handleChange("直接工事原価CB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.直接工事原価_支社受受注前原価検討金} onChange={(e) => handleChange("直接工事原価_支社受受注前原価検討金", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.直接工事原価DB} onChange={(e) => handleChange("直接工事原価DB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.直接工事原価_1回目予算金額} onChange={(e) => handleChange("直接工事原価_1回目予算金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.直接工事原価EB} onChange={(e) => handleChange("直接工事原価EB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>実行予算金額</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.実行予算金額_基準原価} onChange={(e) => handleChange("実行予算金額_基準原価", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.実行予算金額CB} onChange={(e) => handleChange("実行予算金額CB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.実行予算金額_支社受受注前原価検討金} onChange={(e) => handleChange("実行予算金額_支社受受注前原価検討金", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.実行予算金額DB} onChange={(e) => handleChange("実行予算金額DB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.実行予算金額_1回目予算金額} onChange={(e) => handleChange("実行予算金額_1回目予算金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.実行予算金額EB} onChange={(e) => handleChange("実行予算金額EB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>財務粗利益</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.財務粗利益_基準原価} onChange={(e) => handleChange("財務粗利益_基準原価", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.財務粗利益_CB} onChange={(e) => handleChange("財務粗利益_CB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.財務粗利益_支社受受注前原価検討金額} onChange={(e) => handleChange("財務粗利益_支社受受注前原価検討金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.財務粗利益DB} onChange={(e) => handleChange("財務粗利益DB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.財務粗利益_1回目予算金額} onChange={(e) => handleChange("財務粗利益_1回目予算金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.財務粗利益EB} onChange={(e) => handleChange("財務粗利益EB", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 材料費 */}
        <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', border: '1px solid #dde5f4', marginBottom: '1.5rem' }}>
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #dde5f4', backgroundColor: '#f8f9fa' }}>
            <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#1a1c20' }}>材料費</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'left', borderBottom: '1px solid #dde5f4' }}>費目</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>基準原価</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>比率</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>支社受注前原価検討金額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>1回目予算金額</th>
                  <th style={{ padding: '0.75rem', backgroundColor: '#f8f9fa', fontWeight: 600, textAlign: 'right', borderBottom: '1px solid #dde5f4' }}>構成比</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>材料費(A1+A2)</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.材料費_基準原価} onChange={(e) => handleChange("材料費_基準原価", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.材料費_比率} onChange={(e) => handleChange("材料費_比率", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.材料費_支社受注前原価検討金額} onChange={(e) => handleChange("材料費_支社受注前原価検討金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.材料費_1回目予算金額} onChange={(e) => handleChange("材料費_1回目予算金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.材料費_構成比} onChange={(e) => handleChange("材料費_構成比", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
                <tr>
                  <td style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f0f2f7' }}>機械他材料(A3+A4)</td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.機械他材料_基準原価} onChange={(e) => handleChange("機械他材料_基準原価", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.機械他材料_比率} onChange={(e) => handleChange("機械他材料_比率", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.機械他材料_支社受注前原価検討金額} onChange={(e) => handleChange("機械他材料_支社受注前原価検討金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.機械他材料_1回目予算金額} onChange={(e) => handleChange("機械他材料_1回目予算金額", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                  <td style={{ padding: '0.25rem', borderBottom: '1px solid #f0f2f7' }}><input type="text" value={formData.機械他材料_構成比} onChange={(e) => handleChange("機械他材料_構成比", e.target.value)} style={{ width: '100%', padding: '0.375rem', fontSize: '0.85rem', textAlign: 'right', border: '1px solid #dde5f4', borderRadius: '0.25rem', boxSizing: 'border-box' }} /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* 申請モーダル */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={handleCloseModal}>
          <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', width: '95%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #dde5f4', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 700, color: '#1a1c20' }}>実行予算書 申請確認</h2>
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
                {/* PDFプレビュー */}
                <div style={{ flex: 1, overflow: 'auto', padding: '1rem' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1a1c20', marginBottom: '0.75rem' }}>予算書プレビュー</div>
                  <div style={{ backgroundColor: '#f0f2f7', borderRadius: '0.5rem', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {generatingPreview ? (
                      <div style={{ color: '#686e78', fontSize: '0.9rem' }}>PDFを生成中...</div>
                    ) : previewPdfUrl ? (
                      <iframe
                        src={previewPdfUrl}
                        style={{ width: '100%', height: '100%', border: 'none', borderRadius: '0.5rem' }}
                        title="予算書プレビュー"
                      />
                    ) : (
                      <div style={{ color: '#686e78', fontSize: '0.9rem' }}>プレビューを読み込めませんでした</div>
                    )}
                  </div>
                </div>

                {/* 工事名と申請先選択 */}
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid #dde5f4', backgroundColor: '#f8f9fa', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 600, color: '#1a1c20' }}>工事名 <span style={{ color: '#ef4444' }}>*</span></label>
                    <input
                      type="text"
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="工事名を入力"
                      style={{ width: '100%', padding: '0.5rem', fontSize: '0.85rem', border: '1px solid #dde5f4', borderRadius: '0.375rem', backgroundColor: '#fff', boxSizing: 'border-box' }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '200px' }}>
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
                    style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', backgroundColor: isSubmitting || !selectedApprover || !projectName ? '#9ca3af' : '#10b981', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: isSubmitting || !selectedApprover || !projectName ? 'not-allowed' : 'pointer' }}
                    onClick={handleSubmit}
                    disabled={isSubmitting || !selectedApprover || !projectName}
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
