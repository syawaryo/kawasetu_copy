'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const menuData = [
  {
    id: 'project',
    name: '案件/工事管理',
    subMenus: [
      { id: 'project-mgmt', name: '案件管理', items: [
        { name: '案件照会', description: '案件情報の照会・検索' },
        { name: '引合物件台帳', description: '引合物件の一覧管理' },
        { name: '受注状況一覧表', description: '受注状況の確認' }
      ]},
      { id: 'order-mgmt', name: '受注管理', items: [
        { name: '受注工事登録', description: '新規受注工事の登録' },
        { name: '受注報告一覧表', description: '受注報告の一覧' },
        { name: '工事進捗予想一覧表', description: '工事進捗の予想確認' },
        { name: '工事進捗予想要入力一覧表', description: '入力が必要な工事一覧' }
      ]},
      { id: 'budget-exec', name: '実行予算', items: [
        { name: '実行予算登録', description: '実行予算の登録・申請' },
        { name: '実行予算書（明細）', description: '予算明細の確認' },
        { name: '実行予算進捗表', description: '予算進捗の確認' }
      ]}
    ]
  },
  { id: 'billing', name: '請求/入金', subMenus: [] },
  {
    id: 'material',
    name: '材料/外注管理',
    subMenus: [
      { id: 'order-mgmt', name: '発注管理', items: [
        { name: '(材料)発注契約登録', description: '材料の発注契約登録' },
        { name: '(外注)発注契約登録', description: '外注の発注契約登録' },
        { name: '注文伺書', description: '注文伺書の作成' },
        { name: '発注照会', description: '発注情報の照会' },
        { name: '注文書No.一覧表', description: '注文書番号の一覧' },
        { name: '承認状況照会', description: '承認状況の確認' }
      ]},
      { id: 'receiving', name: '入庫/出来高', items: [
        { name: '出来高査定入力チェックリスト', description: '出来高査定の入力確認' },
        { name: '入庫連動入力', description: '入庫連動の入力' }
      ]},
      { id: 'payment', name: '支払', items: [
        { name: '引去確認リスト', description: '引去確認の一覧' },
        { name: '支払通知書', description: '支払通知書の発行' },
        { name: '工事別支払先別月別支払管理表', description: '支払管理表の確認' },
        { name: '支払残高一覧表', description: '支払残高の一覧' },
        { name: '支払先宛名シール', description: '宛名シールの発行' }
      ]},
      { id: 'reports', name: '各種帳票', items: [] }
    ]
  },
  {
    id: 'cost',
    name: '原価/財務管理',
    subMenus: [
      { id: 'slip-processing', name: '伝票処理', items: [
        { name: '振替伝票入力', description: '振替伝票の入力' },
        { name: '振替伝票入力チェックリスト', description: '入力内容のチェック' },
        { name: '支払伝票', description: '支払伝票の作成' },
        { name: '振替伝票', description: '振替伝票の確認' },
        { name: '仕訳口起票', description: '仕訳の起票' },
        { name: '総勘定元帳（照会）', description: '元帳の照会' },
        { name: '伝票データ出力', description: '伝票データのエクスポート' }
      ]},
      { id: 'cost-info-1', name: '原価情報1', items: [
        { name: '工事原価管理総括表', description: '原価管理の総括' },
        { name: '進行基準進捗率予実表', description: '進捗率の予実管理' },
        { name: '交番別工事原価一覧表', description: '交番別原価一覧' },
        { name: '見積計算基礎資料入力', description: '見積基礎資料の入力' },
        { name: '見積計算基礎資料', description: '見積基礎資料の確認' },
        { name: '工事予想損益一覧表', description: '予想損益の一覧' },
        { name: '月別経費明細書', description: '月別経費の明細' },
        { name: 'JV工事明細CSV出力', description: 'JV工事データ出力' },
        { name: '原価台帳補助簿', description: '原価台帳の補助簿' }
      ]},
      { id: 'cost-info-2', name: '原価情報2', items: [
        { name: '工事原価台帳', description: '工事原価の台帳' },
        { name: '工事補助台帳', description: '工事の補助台帳' },
        { name: '工事原価推移表', description: '原価推移の確認' },
        { name: '発注元別利益管理表', description: '発注元別利益管理' },
        { name: '取引先別工事別原価集計表', description: '取引先別原価集計' },
        { name: '工事別取引先別原価集計表', description: '工事別原価集計' },
        { name: '工事収支一覧表', description: '工事収支の一覧' },
        { name: '工事予算実績管理表', description: '予算実績の管理' },
        { name: '工事発注原価管理表', description: '発注原価の管理' },
        { name: '工事経歴書', description: '工事の経歴確認' },
        { name: '科目別残高表', description: '科目別残高の確認' }
      ]},
      { id: 'financial-info', name: '財務情報', items: [
        { name: '財務照会', description: '財務情報の照会' },
        { name: '日計表', description: '日次集計の確認' },
        { name: '勘定内訳元帳', description: '勘定内訳の元帳' },
        { name: '送還業元帳', description: '送還業の元帳' },
        { name: '科目別取引先別残高表', description: '科目別残高確認' },
        { name: '取引先別科目別残高表', description: '取引先別残高確認' },
        { name: '勘定内訳残高表', description: '勘定内訳の残高' },
        { name: '合計残高試算表', description: '試算表の確認' }
      ]},
      { id: 'settlement-info', name: '決算情報', items: [
        { name: '完成工事伝票一覧表', description: '完成工事伝票一覧' },
        { name: '未完成工事支出金内訳書', description: '未完成工事の内訳' },
        { name: '完成工事原価内訳書', description: '完成工事原価内訳' },
        { name: '消費税計上チェックリスト', description: '消費税チェック' },
        { name: '消費税集計一覧表', description: '消費税集計一覧' },
        { name: '消費税集計表', description: '消費税の集計' },
        { name: '賃借対照表', description: '貸借対照表の確認' },
        { name: '損益計算書', description: '損益計算書の確認' }
      ]},
      { id: 'budget-management', name: '予算管理', items: [
        { name: '経費予算照会', description: '経費予算の照会' },
        { name: '経費予算・実績CSV出力', description: '予算実績データ出力' }
      ]}
    ]
  },
  { id: 'bill', name: '手形/電債管理', subMenus: [] },
  { id: 'payment', name: '築地/決済処理', subMenus: [] },
  { id: 'attendance', name: '勤怠管理', subMenus: [] },
  { id: 'master', name: 'マスタ管理', subMenus: [] },
  { id: 'system', name: 'システム環境', subMenus: [] },
];

// 青いアイコンコンポーネント
const FlowIcon = () => (
  <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, #0d56c9 0%, #1e88e5 100%)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  </div>
);

const DropdownMenu = ({ menu, isOpen, onSelectSubMenu, onMouseEnter, onMouseLeave }: { menu: typeof menuData[0], isOpen: boolean, onSelectSubMenu: (menuId: string, subMenuId: string) => void, onMouseEnter: () => void, onMouseLeave: () => void }) => {
  if (!isOpen || menu.subMenus.length === 0) return null;
  return (
    <div style={{ position: 'absolute', top: '100%', left: 0, paddingTop: '0.25rem', zIndex: 1000 }} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      <div style={{ backgroundColor: '#fff', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', borderRadius: '0.625rem', padding: '0.625rem', display: 'flex', gap: '0.5rem' }}>
        {menu.subMenus.map((subMenu) => (
          <button key={subMenu.id} style={{ padding: '0.625rem 1rem', fontSize: '0.85rem', color: '#1a1c20', cursor: 'pointer', borderRadius: 4, transition: 'background-color 0.2s ease', fontWeight: 500, whiteSpace: 'nowrap', border: 'none', background: 'transparent' }} onClick={(e) => { e.stopPropagation(); onSelectSubMenu(menu.id, subMenu.id); }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f0f2f7')} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}>
            {subMenu.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const router = useRouter();
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState<{ menuId: string, subMenuId: string } | null>({ menuId: 'project', subMenuId: 'project-mgmt' });

  const selectedMenu = selectedSubMenu ? menuData.find(m => m.id === selectedSubMenu.menuId) : null;
  const selectedSub = selectedMenu?.subMenus.find(s => s.id === selectedSubMenu?.subMenuId);

  const handleSelectSubMenu = (menuId: string, subMenuId: string) => {
    setSelectedSubMenu({ menuId, subMenuId });
    setHoveredMenu(null);
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#1a1c20' }}>機能マスタ</h2>

      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '0.75rem 1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {menuData.map((menu) => (
            <div key={menu.id} style={{ position: 'relative' }} onMouseEnter={() => setHoveredMenu(menu.id)} onMouseLeave={() => setHoveredMenu(null)}>
              <button
                onClick={() => {
                  if (menu.subMenus.length === 0) {
                    setSelectedSubMenu({ menuId: menu.id, subMenuId: '' });
                    setHoveredMenu(null);
                  }
                }}
                style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 500, borderRadius: '0.625rem', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap', border: 'none', background: selectedSubMenu?.menuId === menu.id ? '#0d56c9' : 'transparent', color: selectedSubMenu?.menuId === menu.id ? '#fff' : '#1a1c20' }}>
                {menu.name}
              </button>
              <DropdownMenu menu={menu} isOpen={hoveredMenu === menu.id} onSelectSubMenu={handleSelectSubMenu} onMouseEnter={() => setHoveredMenu(menu.id)} onMouseLeave={() => setHoveredMenu(null)} />
            </div>
          ))}
        </div>
      </div>

      {selectedSubMenu && selectedSub && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 1rem 0', color: '#1a1c20' }}>{selectedSub.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.5rem' }}>
            {selectedSub.items.map((item, idx) => (
              <div
                key={idx}
                style={{ backgroundColor: '#fff', borderRadius: '0.5rem', boxShadow: '0px 2px 8px rgb(68 73 80 / 6%)', padding: '0.75rem 1rem', cursor: 'pointer', transition: 'all 0.2s ease', border: '1px solid transparent', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
                onClick={() => {
                  if (item.name === '(外注)発注契約登録') {
                    router.push('/order-inquiry');
                  } else {
                    alert(`${item.name}の詳細ページに遷移します`);
                  }
                }}
                onMouseOver={(e) => { e.currentTarget.style.borderColor = '#0d56c9'; e.currentTarget.style.backgroundColor = '#fafbfc'; }}
                onMouseOut={(e) => { e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.backgroundColor = '#fff'; }}
              >
                <FlowIcon />
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1c20' }}>{item.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#686e78' }}>{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
