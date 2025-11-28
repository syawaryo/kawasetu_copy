'use client'

import { useState } from 'react'
import { PDFDocument, TextAlignment } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

export default function PdfTestPage() {
  const [fields, setFields] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // フォームフィールド一覧を取得
  const handleCheckFields = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/予算書フォーマット.pdf')
      const pdfBytes = await response.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)

      const form = pdfDoc.getForm()
      const allFields = form.getFields()

      const fieldNames = allFields.map(field => {
        const type = field.constructor.name
        const name = field.getName()
        return `${name} (${type})`
      })

      setFields(fieldNames)
      setMessage(`${fieldNames.length}個のフィールドが見つかりました`)
    } catch (error) {
      console.error('Error:', error)
      setMessage(`エラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  // サンプルデータを埋め込んでダウンロード
  const handleFillAndDownload = async () => {
    setLoading(true)
    setMessage('')
    try {
      const response = await fetch('/予算書フォーマット.pdf')
      const pdfBytes = await response.arrayBuffer()
      const pdfDoc = await PDFDocument.load(pdfBytes)

      // fontkitを登録（日本語フォント用）
      pdfDoc.registerFontkit(fontkit)

      // 日本語フォントを読み込む（Noto Sans JP）
      const fontResponse = await fetch('/fonts/NotoSansCJKjp-Regular.otf')
      const fontBytes = await fontResponse.arrayBuffer()
      const japaneseFont = await pdfDoc.embedFont(fontBytes)

      const form = pdfDoc.getForm()

      // 全フィールドを取得してログ出力
      const allFields = form.getFields()
      console.log('All fields:', allFields.map(f => f.getName()))

      // サンプルデータを埋め込む（フィールド名は実際のものに合わせて調整）
      // まずは試しにいくつかのフィールドに値を入れてみる
      for (let index = 0; index < allFields.length; index++) {
        const field = allFields[index]
        try {
          const name = field.getName()
          const type = field.constructor.name

          if (type === 'PDFTextField') {
            const textField = form.getTextField(name)
            // フォントサイズ 11px
            textField.setFontSize(11)
            // 中央揃え
            textField.setAlignment(TextAlignment.Center)
            // テキストを設定
            textField.setText(`テスト値${index + 1}`)
            // フォントを適用
            textField.updateAppearances(japaneseFont)
          }
        } catch (e) {
          console.log(`Skip field: ${field.getName()}`, e)
        }
      }

      // フォームをフラット化（編集不可のテキストに変換）
      form.flatten()

      // PDFを保存
      const filledPdfBytes = await pdfDoc.save()

      // ダウンロード
      const ab = new ArrayBuffer(filledPdfBytes.byteLength);
      new Uint8Array(ab).set(filledPdfBytes);   
      const blob = new Blob([ab], { type: "application/pdf" });
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'filled-budget.pdf'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage('PDFをダウンロードしました')
    } catch (error) {
      console.error('Error:', error)
      setMessage(`エラー: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1>PDF-lib テスト</h1>
      <p>予算書フォーマットform付.pdf のフォームフィールドをテストします</p>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <button
          onClick={handleCheckFields}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '処理中...' : 'フィールド一覧を取得'}
        </button>

        <button
          onClick={handleFillAndDownload}
          disabled={loading}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? '処理中...' : 'テストデータを埋め込んでダウンロード'}
        </button>
      </div>

      {message && (
        <p style={{ marginTop: '1rem', color: message.includes('エラー') ? 'red' : 'green' }}>
          {message}
        </p>
      )}

      {fields.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>フォームフィールド一覧</h2>
          <ul style={{
            backgroundColor: '#f5f5f5',
            padding: '1rem',
            borderRadius: '4px',
            maxHeight: '400px',
            overflow: 'auto'
          }}>
            {fields.map((field, i) => (
              <li key={i} style={{ fontFamily: 'monospace', marginBottom: '0.5rem' }}>
                {field}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
