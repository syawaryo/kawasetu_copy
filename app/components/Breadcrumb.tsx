'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// パスに対応するパンくずリスト定義
const breadcrumbMap: Record<string, { label: string; parent?: string }> = {
  '/': { label: '機能マスタ' },
  '/from-template': { label: '機能テンプレート' },
  '/budget-form': { label: '実行予算作成', parent: '/from-template' },
  '/budget': { label: '実行予算登録', parent: '/from-template' },
  '/ocr': { label: '支払伝票入力', parent: '/from-template' },
  '/order-contract': { label: '外注発注', parent: '/from-template' },
  '/order-inquiry': { label: '注文伺書', parent: '/order-contract' },
  '/budget-ledger': { label: '工事実行予算台帳', parent: '/order-inquiry' },
  '/payment-slip': { label: '支払伝票', parent: '/ocr' },
  '/transfer-slip': { label: '振替伝票', parent: '/payment-slip' },
  '/history': { label: '申請履歴' },
  '/approval': { label: '承認履歴' },
  '/my-storage': { label: '保存履歴' },
  '/subcontract-order': { label: '(外注)発注契約登録', parent: '/' },
  '/budget-ledger-page': { label: '工事実行予算台帳', parent: '/' },
  '/order-schedule-page': { label: '発注予定表', parent: '/' },
  '/quote-request-page': { label: '見積依頼書', parent: '/' },
};

export default function Breadcrumb() {
  const pathname = usePathname();

  // パンくずリストを構築
  const buildBreadcrumbs = () => {
    const crumbs: { path: string; label: string }[] = [];
    let current = pathname;

    while (current && breadcrumbMap[current]) {
      const item = breadcrumbMap[current];
      crumbs.unshift({ path: current, label: item.label });
      current = item.parent || '';
    }

    return crumbs;
  };

  const crumbs = buildBreadcrumbs();

  // パンくずがない場合や1つだけの場合は表示しない
  if (crumbs.length <= 1) return null;

  return (
    <nav style={{ backgroundColor: '#fff', borderBottom: '1px solid #dde5f4', padding: '0.5rem 0' }}>
      <div style={{ maxWidth: '1160px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
        {crumbs.map((crumb, index) => (
          <span key={crumb.path} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {index > 0 && <span style={{ color: '#9ca3af' }}>&gt;</span>}
            {index === crumbs.length - 1 ? (
              <span style={{ color: '#1a1c20', fontWeight: 500 }}>{crumb.label}</span>
            ) : (
              <Link href={crumb.path} style={{ color: '#0d56c9', textDecoration: 'none' }}>
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </div>
    </nav>
  );
}
