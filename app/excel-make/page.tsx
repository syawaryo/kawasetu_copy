'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import './styles.css'

export default function ExcelMakePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [univerAPI, setUniverAPI] = useState<any>(null)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const STORAGE_KEY = 'kawasaki-excel-snapshot'

  useEffect(() => {
    // DOM要素が確実に存在することを確認
    const appElement = document.getElementById('app')
    if (!appElement) {
      console.error('App element not found')
      return
    }

    let currentUnitId: string | null = null
    let localUniver: any = null
    let localAPI: any = null

    ;(async () => {
      const module = await import('../main')
      const { createUniverInstance } = module

      const { univer, univerAPI } = createUniverInstance()
      localUniver = univer
      localAPI = univerAPI
      setUniverAPI(univerAPI)

      // 少し待ってからワークブックを作成（DOMの準備を確実にする）
      await new Promise(resolve => setTimeout(resolve, 100))

      // LocalStorageから保存されたデータを確認
      const savedSnapshot = localStorage.getItem(STORAGE_KEY)
      const template = searchParams.get('template')

      if (savedSnapshot) {
        // 保存されたスナップショットがある場合は復元
        setIsLoading(true)
        try {
          const snapshot = JSON.parse(savedSnapshot)
          const workbook = localAPI.createWorkbook(snapshot)
          currentUnitId = workbook?.getId() || null
          const savedTime = localStorage.getItem(STORAGE_KEY + '_time')
          if (savedTime) {
            setLastSaved(new Date(savedTime))
          }
          console.log('保存されたデータを復元しました', currentUnitId)
        } catch (error) {
          console.error('データ復元エラー:', error)
          localStorage.removeItem(STORAGE_KEY)
          localStorage.removeItem(STORAGE_KEY + '_time')
          // 復元失敗時はテンプレートまたは空白を読み込む
          if (template === 'yosan') {
            await loadTemplate()
          } else {
            const workbook = localAPI.createWorkbook({})
            currentUnitId = workbook?.getId() || null
          }
        } finally {
          setIsLoading(false)
        }
      } else if (template === 'yosan') {
        // 予算書テンプレートを自動読み込み
        await loadTemplate()
      } else {
        // 通常は初期空白ワークブックを作成
        const workbook = localAPI.createWorkbook({})
        currentUnitId = workbook?.getId() || null
      }

      async function loadTemplate() {
        setIsLoading(true)
        try {
          const response = await fetch('/予算書フォーマット.xlsx')
          const blob = await response.blob()
          const file = new File([blob], '予算書フォーマット.xlsx', {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          })

          const snapshot = await localAPI.importXLSXToSnapshotAsync(file)

          if (!snapshot) {
            throw new Error('Failed to import template: snapshot is undefined')
          }

          const workbook = localAPI.createWorkbook(snapshot)
          currentUnitId = workbook?.getId() || null
          console.log('予算書テンプレートを読み込みました', currentUnitId)

          // デフォルトデータを設定
          await setDefaultData(workbook)
        } catch (error) {
          console.error('テンプレート読み込みエラー:', error)
          alert('テンプレートの読み込みに失敗しました。Univer Serverが起動しているか確認してください。')
          // エラー時は空白ワークブックを作成
          const workbook = localAPI.createWorkbook({})
          currentUnitId = workbook?.getId() || null
        } finally {
          setIsLoading(false)
        }
      }

      async function setDefaultData(workbook: any) {
        try {
          const activeSheet = workbook.getActiveSheet()
          if (!activeSheet) return

          // 工番
          activeSheet.getRange('A14').setValue('2025-001')

          // 工事名称
          activeSheet.getRange('M14').setValue('〇〇ビル新築電気・空調設備工事')

          // 工期 - 着工
          activeSheet.getRange('AI14').setValue('2025/04/01')

          // 工期 - 竣工
          activeSheet.getRange('AI15').setValue('2026/03/31')

          // 期間
          activeSheet.getRange('AQ14').setValue('12ヶ月')

          // 受注形態
          activeSheet.getRange('A17').setValue('元請・一式請負')

          // 受注先名
          activeSheet.getRange('L17').setValue('株式会社サンプル建設（No. 015）')

          // 施主
          activeSheet.getRange('Y17').setValue('サンプル不動産株式会社')

          // 設計事務所
          activeSheet.getRange('AF17').setValue('サンプル設計事務所一級建築士事務所')

          // ゼネコン
          activeSheet.getRange('AT17').setValue('株式会社サンプル建設（受注先と同じ）')

          // 建物用途
          activeSheet.getRange('A20').setValue('事務所ビル（地上10階・地下1階）')

          // 受注金額/工期月数
          activeSheet.getRange('N20').setValue('10,000 / 12')

          // 電気
          activeSheet.getRange('Y20').setValue('6,000')

          // 空調
          activeSheet.getRange('AF20').setValue('2,500')

          // 衛生
          activeSheet.getRange('AM20').setValue('1,000')

          console.log('デフォルトデータを設定しました')
        } catch (error) {
          console.error('デフォルトデータ設定エラー:', error)
        }
      }

      setIsInitialized(true)
    })().catch((error) => {
      console.error('Univer initialization error:', error)
    })

    // クリーンアップ: ページ離脱時にワークブックを破棄
    return () => {
      try {
        if (localUniver) {
          localUniver.dispose()
          console.log('Univer instance disposed')
        }
      } catch (error) {
        console.error('Failed to dispose univer:', error)
      }
    }
  }, [searchParams])

  // 自動保存機能 - データ変更時に保存
  useEffect(() => {
    if (!univerAPI || !isInitialized) return

    let saveTimeout: NodeJS.Timeout | null = null

    // Univerの変更イベントをリスン
    const handleChange = () => {
      // デバウンス: 最後の変更から1秒後に保存
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }

      saveTimeout = setTimeout(() => {
        try {
          const workbook = univerAPI.getActiveWorkbook()
          if (!workbook) return

          const snapshot = workbook.getSnapshot()
          if (snapshot) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
            localStorage.setItem(STORAGE_KEY + '_time', new Date().toISOString())
            setLastSaved(new Date())
            console.log('自動保存しました')
          }
        } catch (error) {
          console.error('自動保存エラー:', error)
        }
      }, 1000) // 1秒のデバウンス
    }

    // Univerのコマンド実行イベントを監視
    try {
      univerAPI.onCommandExecuted(() => {
        handleChange()
      })
    } catch (error) {
      console.error('イベントリスナー登録エラー:', error)
    }

    return () => {
      if (saveTimeout) {
        clearTimeout(saveTimeout)
      }
    }
  }, [univerAPI, isInitialized])

  const handleSave = async () => {
    if (!univerAPI) return

    try {
      // 現在のワークブックのスナップショットを取得
      const workbook = univerAPI.getActiveWorkbook()
      if (!workbook) return

      const snapshot = workbook.getSnapshot()

      if (snapshot) {
        // LocalStorageに保存
        localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
        localStorage.setItem(STORAGE_KEY + '_time', new Date().toISOString())
        setLastSaved(new Date())
        console.log('データを保存しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      alert('データの保存に失敗しました')
    }
  }

  const handleClearSaved = () => {
    if (confirm('保存されたデータを削除しますか？')) {
      localStorage.removeItem(STORAGE_KEY)
      localStorage.removeItem(STORAGE_KEY + '_time')
      setLastSaved(null)
      alert('保存データを削除しました。ページをリロードすると初期状態に戻ります。')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !univerAPI) return

    setIsLoading(true)
    try {
      // Pro版のimportXLSXToSnapshotを使ってExcelをインポート
      // これでスタイルも含めて完全にインポートされる
      const snapshot = await univerAPI.importXLSXToSnapshot(file)

      if (!snapshot) {
        throw new Error('Failed to import Excel file: snapshot is undefined')
      }

      // snapshotからワークブックを作成
      univerAPI.createUniverSheet(snapshot)

      console.log('Excel file imported successfully with styles!')
    } catch (error) {
      console.error('ファイル読み込みエラー:', error)
      alert('ファイルの読み込みに失敗しました。Univer Serverが起動しているか確認してください。')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePrint = () => {
    if (!univerAPI) return
    // TODO: 印刷機能の実装
    console.log('印刷機能')
    alert('印刷機能は準備中です')
  }

  const handleExportCSV = () => {
    if (!univerAPI) return
    // TODO: CSV出力機能の実装
    console.log('CSV出力機能')
    alert('CSV出力機能は準備中です')
  }

  const handleExportJSON = () => {
    if (!univerAPI) return

    try {
      const workbook = univerAPI.getActiveWorkbook()
      if (!workbook) {
        alert('ワークブックがありません')
        return
      }

      const snapshot = workbook.getSnapshot()
      if (!snapshot) {
        alert('スナップショットを取得できませんでした')
        return
      }

      // JSONをダウンロード
      const jsonString = JSON.stringify(snapshot, null, 2)
      const blob = new Blob([jsonString], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'budget-template.json'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      console.log('JSONをエクスポートしました')
    } catch (error) {
      console.error('JSONエクスポートエラー:', error)
      alert('JSONのエクスポートに失敗しました')
    }
  }

  const handleRegisterBudget = () => {
    router.push('/budget')
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '1rem',
        backgroundColor: 'var(--color-ui-white)',
        borderBottom: '1px solid var(--color-ui-border)',
        display: 'flex',
        gap: '1rem',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <label style={{
          padding: '0.5rem 1rem',
          backgroundColor: isInitialized ? 'var(--color-vi-blue)' : '#ccc',
          color: 'white',
          borderRadius: 'var(--radius-card)',
          cursor: isInitialized ? 'pointer' : 'not-allowed',
          fontWeight: 500,
          fontSize: 'var(--fz-root)'
        }}>
          {isLoading ? '読み込み中...' : 'Excelファイルを開く'}
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            disabled={isLoading || !isInitialized}
          />
        </label>

        {lastSaved && (
          <span style={{
            fontSize: 'var(--fz-small)',
            color: 'var(--color-ui-subtext)'
          }}>
            自動保存: {lastSaved.toLocaleTimeString()}
          </span>
        )}

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={handlePrint}
            disabled={!isInitialized}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: isInitialized ? 'var(--color-vi-blue)' : '#999',
              border: `1px solid ${isInitialized ? 'var(--color-vi-blue)' : '#ccc'}`,
              borderRadius: '4px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 400,
              fontSize: 'var(--fz-root)'
            }}
          >
            印刷
          </button>

          <button
            onClick={handleExportCSV}
            disabled={!isInitialized}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: isInitialized ? 'var(--color-vi-blue)' : '#999',
              border: `1px solid ${isInitialized ? 'var(--color-vi-blue)' : '#ccc'}`,
              borderRadius: '4px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 400,
              fontSize: 'var(--fz-root)'
            }}
          >
            CSV出力
          </button>

          <button
            onClick={handleExportJSON}
            disabled={!isInitialized}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isInitialized ? '#10b981' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 500,
              fontSize: 'var(--fz-root)'
            }}
          >
            JSONエクスポート
          </button>

          <button
            onClick={handleRegisterBudget}
            disabled={!isInitialized}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: 'transparent',
              color: isInitialized ? 'var(--color-vi-blue)' : '#999',
              border: `1px solid ${isInitialized ? 'var(--color-vi-blue)' : '#ccc'}`,
              borderRadius: '4px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 400,
              fontSize: 'var(--fz-root)'
            }}
          >
            実行予算登録に移行
          </button>
        </div>
      </div>
      <div id="app" style={{ flex: 1 }} />
    </div>
  )
}
