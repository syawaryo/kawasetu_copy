'use client'

import { useEffect, useState } from 'react'
import '@univerjs/preset-sheets-core/lib/index.css'
import './styles.css'

// ExcelJSのWorkbookをUniver IWorkbookData形式に変換
function convertExcelJSToUniverData(workbook: any): any {
  const sheets: Record<string, any> = {}
  const sheetOrder: string[] = []

  workbook.eachSheet((worksheet: any, sheetIndex: number) => {
    const sheetId = `sheet_${sheetIndex}`
    sheetOrder.push(sheetId)

    const cellData: Record<number, Record<number, any>> = {}
    const mergeData: any[] = []
    const columnData: Record<number, any> = {}
    const rowData: Record<number, any> = {}

    // 列幅を取得
    worksheet.columns?.forEach((col: any, index: number) => {
      if (col.width) {
        columnData[index] = { w: col.width * 7 } // ExcelJSの幅をピクセルに変換（おおよその係数）
      }
    })

    // 行と列の最大値を追跡
    let maxRow = 0
    let maxCol = 0

    // 各行を処理
    worksheet.eachRow({ includeEmpty: false }, (row: any, rowNumber: number) => {
      const rowIndex = rowNumber - 1 // 0-indexed
      cellData[rowIndex] = {}
      maxRow = Math.max(maxRow, rowIndex)

      // 行高を取得
      if (row.height) {
        rowData[rowIndex] = { h: row.height }
      }

      row.eachCell({ includeEmpty: false }, (cell: any, colNumber: number) => {
        const colIndex = colNumber - 1 // 0-indexed
        maxCol = Math.max(maxCol, colIndex)

        // セルの値を取得
        let value = cell.value
        let cellType = 1 // デフォルトは文字列

        // リッチテキストや数式などの特殊な値を処理
        if (value !== null && typeof value === 'object') {
          if (value.richText) {
            // リッチテキストはプレーンテキストに変換
            value = value.richText.map((rt: any) => rt.text).join('')
          } else if (value.formula) {
            // 数式は結果値を使用
            value = value.result ?? value.formula
          } else if (value.error) {
            value = value.error
          } else if (value instanceof Date) {
            value = value.toLocaleDateString()
          } else {
            value = String(value)
          }
        }

        if (typeof value === 'number') {
          cellType = 2
        }

        // スタイル情報を取得
        const style: any = {}

        if (cell.font) {
          style.ff = cell.font.name // fontFamily
          style.fs = cell.font.size // fontSize
          style.bl = cell.font.bold ? 1 : 0 // bold
          style.it = cell.font.italic ? 1 : 0 // italic
          if (cell.font.color?.argb) {
            style.cl = { rgb: cell.font.color.argb.slice(2) } // color (ARGBからRGBに)
          }
        }

        if (cell.fill && cell.fill.fgColor?.argb) {
          style.bg = { rgb: cell.fill.fgColor.argb.slice(2) } // background
        }

        if (cell.alignment) {
          // 水平配置
          const hMap: Record<string, number> = { left: 0, center: 1, right: 2 }
          if (cell.alignment.horizontal) {
            style.ht = hMap[cell.alignment.horizontal] ?? 0
          }
          // 垂直配置
          const vMap: Record<string, number> = { top: 0, middle: 1, bottom: 2 }
          if (cell.alignment.vertical) {
            style.vt = vMap[cell.alignment.vertical] ?? 1
          }
        }

        // 罫線情報
        if (cell.border) {
          style.bd = {}
          const borderStyleMap: Record<string, number> = {
            thin: 1, medium: 2, thick: 3, dotted: 4, dashed: 5,
          }
          if (cell.border.top) style.bd.t = { s: borderStyleMap[cell.border.top.style] || 1 }
          if (cell.border.bottom) style.bd.b = { s: borderStyleMap[cell.border.bottom.style] || 1 }
          if (cell.border.left) style.bd.l = { s: borderStyleMap[cell.border.left.style] || 1 }
          if (cell.border.right) style.bd.r = { s: borderStyleMap[cell.border.right.style] || 1 }
        }

        cellData[rowIndex][colIndex] = {
          v: value ?? '',
          t: cellType,
          s: Object.keys(style).length > 0 ? style : null,
        }
      })
    })

    // マージセルを取得
    // @ts-ignore - ExcelJSの型定義が不完全
    const merges = worksheet._merges || worksheet.model?.merges || []
    Object.keys(merges).forEach((key: string) => {
      const merge = merges[key]
      if (merge) {
        // merge.model には {top, left, bottom, right} がある
        const model = merge.model || merge
        mergeData.push({
          startRow: model.top - 1,
          startColumn: model.left - 1,
          endRow: model.bottom - 1,
          endColumn: model.right - 1,
        })
      }
    })

    sheets[sheetId] = {
      id: sheetId,
      name: worksheet.name,
      cellData,
      mergeData,
      columnData,
      rowData,
      rowCount: Math.max(maxRow + 10, 100),
      columnCount: Math.max(maxCol + 5, 52), // AZまで
    }
  })

  return {
    id: 'workbook_exceljs',
    name: workbook.title || 'Workbook',
    appVersion: '1.0.0',
    locale: 'en-US',
    styles: {},
    sheetOrder,
    sheets,
  }
}

export default function ExcelExcelJSPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)
  const [univerAPI, setUniverAPI] = useState<any>(null)
  const [univerInstance, setUniverInstance] = useState<any>(null)
  const [debugInfo, setDebugInfo] = useState<string>('')
  const [loadedSheets, setLoadedSheets] = useState<string[]>([])

  useEffect(() => {
    const appElement = document.getElementById('app-exceljs')
    if (!appElement) {
      console.error('App element not found')
      return
    }

    let localUniver: any = null

    ;(async () => {
      const { createUniver, LocaleType } = await import('@univerjs/presets')
      const { UniverSheetsCorePreset } = await import('@univerjs/preset-sheets-core')
      const UniverPresetSheetsCoreEnUS = (await import('@univerjs/preset-sheets-core/locales/en-US')).default

      const { univerAPI, univer } = createUniver({
        locale: LocaleType.EN_US,
        locales: {
          [LocaleType.EN_US]: UniverPresetSheetsCoreEnUS,
        },
        presets: [
          UniverSheetsCorePreset({
            container: 'app-exceljs',
          }),
        ],
      })

      localUniver = univer
      setUniverAPI(univerAPI)
      setUniverInstance(univer)

      setIsInitialized(true)
      setDebugInfo('OSS版 Univer 初期化完了 - ExcelJSで変換します')

      // 予算書フォーマットを自動読み込み
      await loadBudgetTemplate(univerAPI)
    })().catch((error) => {
      console.error('Univer initialization error:', error)
      setDebugInfo(`初期化エラー: ${error.message}`)
    })

    async function loadBudgetTemplate(api: any) {
      setIsLoading(true)
      setDebugInfo('予算書フォーマット.xlsx を読み込み中...')

      try {
        // ExcelJSを動的インポート
        const ExcelJS = (await import('exceljs')).default

        // ファイルを取得
        const response = await fetch('/予算書フォーマット.xlsx')
        const arrayBuffer = await response.arrayBuffer()

        // ExcelJSで読み込み
        const workbook = new ExcelJS.Workbook()
        await workbook.xlsx.load(arrayBuffer)

        setDebugInfo(`ExcelJS読み込み完了: ${workbook.worksheets.length}シート`)
        setLoadedSheets(workbook.worksheets.map((ws: any) => ws.name))

        // 読み込んだワークブックの情報をログ
        console.log('ExcelJS Workbook:', workbook)
        workbook.eachSheet((sheet: any, id: number) => {
          console.log(`Sheet ${id}: ${sheet.name}, rows: ${sheet.rowCount}, cols: ${sheet.columnCount}`)
        })

        // IWorkbookData形式に変換
        const univerData = convertExcelJSToUniverData(workbook)
        console.log('変換後のUniverデータ:', univerData)

        // Univerで表示
        api.createWorkbook(univerData)

        setDebugInfo(`読み込み成功: ${workbook.worksheets.length}シート`)
      } catch (error: any) {
        console.error('読み込みエラー:', error)
        setDebugInfo(`エラー: ${error.message}`)

        // エラー時は空のワークブックを作成
        api.createWorkbook({
          id: 'workbook_empty',
          name: 'Empty',
          sheetOrder: ['sheet_0'],
          sheets: {
            sheet_0: {
              id: 'sheet_0',
              name: 'Sheet1',
              cellData: {},
              rowCount: 100,
              columnCount: 26,
            },
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    return () => {
      try {
        if (localUniver) {
          localUniver.dispose()
        }
      } catch (error) {
        console.error('Failed to dispose univer:', error)
      }
    }
  }, [])

  // 任意のExcelファイルを読み込み
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !univerAPI) return

    setIsLoading(true)
    setDebugInfo(`${file.name} を読み込み中...`)

    try {
      const ExcelJS = (await import('exceljs')).default
      const arrayBuffer = await file.arrayBuffer()

      const workbook = new ExcelJS.Workbook()
      await workbook.xlsx.load(arrayBuffer)

      setDebugInfo(`ExcelJS読み込み完了: ${workbook.worksheets.length}シート`)
      setLoadedSheets(workbook.worksheets.map((ws: any) => ws.name))

      console.log('ExcelJS Workbook:', workbook)

      const univerData = convertExcelJSToUniverData(workbook)
      console.log('変換後のUniverデータ:', univerData)

      univerAPI.createWorkbook(univerData)

      setDebugInfo(`${file.name} 読み込み成功`)
    } catch (error: any) {
      console.error('ファイル読み込みエラー:', error)
      setDebugInfo(`エラー: ${error.message}`)
      alert('ファイルの読み込みに失敗しました: ' + error.message)
    } finally {
      setIsLoading(false)
    }
  }

  // Excelとしてエクスポート
  const handleExportExcel = async () => {
    if (!univerAPI) return

    try {
      const ExcelJS = (await import('exceljs')).default
      const workbook = univerAPI.getActiveWorkbook()
      if (!workbook) {
        alert('ワークブックが見つかりません')
        return
      }

      const snapshot = workbook.getSnapshot()
      console.log('Univerスナップショット:', snapshot)

      // ExcelJSのワークブックを作成
      const excelWorkbook = new ExcelJS.Workbook()

      if (snapshot.sheets) {
        Object.values(snapshot.sheets).forEach((sheetData: any) => {
          const worksheet = excelWorkbook.addWorksheet(sheetData.name || 'Sheet')

          if (sheetData.cellData) {
            Object.entries(sheetData.cellData).forEach(([rowIndexStr, rowCells]: [string, any]) => {
              const rowIndex = parseInt(rowIndexStr) + 1 // ExcelJSは1-indexed
              Object.entries(rowCells).forEach(([colIndexStr, cell]: [string, any]) => {
                const colIndex = parseInt(colIndexStr) + 1
                const excelCell = worksheet.getCell(rowIndex, colIndex)
                excelCell.value = cell.v

                // スタイルを適用
                if (cell.s) {
                  if (cell.s.bl) excelCell.font = { ...excelCell.font, bold: true }
                  if (cell.s.it) excelCell.font = { ...excelCell.font, italic: true }
                  if (cell.s.bg?.rgb) {
                    excelCell.fill = {
                      type: 'pattern',
                      pattern: 'solid',
                      fgColor: { argb: 'FF' + cell.s.bg.rgb },
                    }
                  }
                }
              })
            })
          }

          // マージセルを適用
          if (sheetData.mergeData) {
            sheetData.mergeData.forEach((merge: any) => {
              worksheet.mergeCells(
                merge.startRow + 1,
                merge.startColumn + 1,
                merge.endRow + 1,
                merge.endColumn + 1
              )
            })
          }
        })
      }

      // ダウンロード
      const buffer = await excelWorkbook.xlsx.writeBuffer()
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'export.xlsx'
      a.click()
      URL.revokeObjectURL(url)

      setDebugInfo('Excelファイルをダウンロードしました')
    } catch (error: any) {
      console.error('エクスポートエラー:', error)
      setDebugInfo(`エクスポートエラー: ${error.message}`)
      alert('エクスポートに失敗しました: ' + error.message)
    }
  }

  const handleShowSnapshot = () => {
    if (!univerAPI) return

    try {
      const workbook = univerAPI.getActiveWorkbook()
      if (!workbook) {
        alert('ワークブックが見つかりません')
        return
      }

      const snapshot = workbook.getSnapshot()
      console.log('現在のスナップショット:', snapshot)
      alert('コンソールにスナップショットを出力しました。F12で確認してください。')
    } catch (error: any) {
      console.error('スナップショット取得エラー:', error)
    }
  }

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        padding: '1rem',
        backgroundColor: '#fef3c7',
        borderBottom: '1px solid #f59e0b',
      }}>
        <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem', color: '#92400e' }}>
          OSS Univer + ExcelJS テスト
        </h2>
        <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#a16207' }}>
          ExcelJSでスタイル込みで読み込み → Univerで表示（予算書フォーマット.xlsx 自動読み込み）
        </p>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{
            padding: '0.5rem 1rem',
            backgroundColor: isInitialized ? '#f59e0b' : '#ccc',
            color: 'white',
            borderRadius: '4px',
            cursor: isInitialized ? 'pointer' : 'not-allowed',
            fontWeight: 500,
          }}>
            {isLoading ? '読み込み中...' : '別のExcelファイルを開く'}
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
              disabled={isLoading || !isInitialized}
            />
          </label>

          <button
            onClick={handleExportExcel}
            disabled={!isInitialized}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: isInitialized ? '#16a34a' : '#ccc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
              fontWeight: 500,
            }}
          >
            Excelとして保存
          </button>

          <button
            onClick={handleShowSnapshot}
            disabled={!isInitialized}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isInitialized ? 'pointer' : 'not-allowed',
            }}
          >
            スナップショット
          </button>
        </div>

        {debugInfo && (
          <div style={{
            marginTop: '0.5rem',
            padding: '0.5rem',
            backgroundColor: '#fde68a',
            borderRadius: '4px',
            fontSize: '0.85rem',
            fontFamily: 'monospace',
          }}>
            {debugInfo}
          </div>
        )}

        {loadedSheets.length > 0 && (
          <div style={{
            marginTop: '0.5rem',
            fontSize: '0.85rem',
            color: '#92400e',
          }}>
            シート: {loadedSheets.join(', ')}
          </div>
        )}
      </div>

      <div id="app-exceljs" style={{ flex: 1 }} />
    </div>
  )
}
