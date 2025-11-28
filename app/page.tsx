'use client';

import { useState } from 'react';

const menuData = [
  {
    id: 'project',
    name: '案件/工事管理',
    subMenus: [
      { id: 'project-mgmt', name: '案件管理', items: ['案件照会', '引合物件台帳', '受注状況一覧表'] },
      { id: 'order-mgmt', name: '受注管理', items: ['受注工事登録', '受注報告一覧表', '工事進捗予想一覧表', '工事進捗予想要入力一覧表'] },
      { id: 'budget-exec', name: '実行予算', items: ['実行予算登録', '実行予算書（明細）', '実行予算進捗表'] }
    ]
  },
  { id: 'billing', name: '請求/入金', subMenus: [] },
  { id: 'material', name: '材料/外注管理', subMenus: [] },
  {
    id: 'cost',
    name: '原価/財務管理',
    subMenus: [
      { id: 'slip-processing', name: '伝票処理', items: ['振替伝票入力', '振替伝票入力チェックリスト', '支払伝票', '振替伝票', '仕訳口起票', '総勘定元帳（照会）', '伝票データ出力'] },
      { id: 'cost-info-1', name: '原価情報1', items: ['工事原価管理総括表', '進行基準進捗率予実表', '交番別工事原価一覧表', '見積計算基礎資料入力', '見積計算基礎資料', '工事予想損益一覧表', '月別経費明細書', 'JV工事明細CSV出力', '原価台帳補助簿'] },
      { id: 'cost-info-2', name: '原価情報2', items: ['工事原価台帳', '工事補助台帳', '工事原価推移表', '発注元別利益管理表', '取引先別工事別原価集計表', '工事別取引先別原価集計表', '工事収支一覧表', '工事予算実績管理表', '工事発注原価管理表', '工事経歴書', '科目別残高表'] },
      { id: 'financial-info', name: '財務情報', items: ['財務照会', '日計表', '勘定内訳元帳', '送還業元帳', '科目別取引先別残高表', '取引先別科目別残高表', '勘定内訳残高表', '合計残高試算表'] },
      { id: 'settlement-info', name: '決算情報', items: ['完成工事伝票一覧表', '未完成工事支出金内訳書', '完成工事原価内訳書', '消費税計上チェックリスト', '消費税集計一覧表', '消費税集計表', '賃借対照表', '損益計算書'] },
      { id: 'budget-management', name: '予算管理', items: ['経費予算照会', '経費予算・実績CSV出力'] }
    ]
  },
  { id: 'bill', name: '手形/電債管理', subMenus: [] },
  { id: 'payment', name: '築地/決済処理', subMenus: [] },
  { id: 'attendance', name: '勤怠管理', subMenus: [] },
  { id: 'master', name: 'マスタ管理', subMenus: [] },
  { id: 'system', name: 'システム環境', subMenus: [] },
];

const FunctionIcon = ({ name }: { name: string }) => {
  const isEdit = name.includes('登録') || name.includes('照会');
  return (
    <div style={{ width: 32, height: 32, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '0.6rem', marginBottom: '0.5rem', backgroundColor: isEdit ? '#0d6efd' : '#dc3545' }}>
      {isEdit ? '編集' : 'PDF'}
    </div>
  );
};

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
      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '0.75rem 1.5rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {menuData.map((menu) => (
            <div key={menu.id} style={{ position: 'relative' }} onMouseEnter={() => setHoveredMenu(menu.id)} onMouseLeave={() => setHoveredMenu(null)}>
              <button style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 500, borderRadius: '0.625rem', cursor: 'pointer', transition: 'all 0.2s ease', whiteSpace: 'nowrap', border: 'none', background: selectedSubMenu?.menuId === menu.id ? '#0d56c9' : 'transparent', color: selectedSubMenu?.menuId === menu.id ? '#fff' : '#1a1c20' }}>
                {menu.name}
              </button>
              <DropdownMenu menu={menu} isOpen={hoveredMenu === menu.id} onSelectSubMenu={handleSelectSubMenu} onMouseEnter={() => setHoveredMenu(menu.id)} onMouseLeave={() => setHoveredMenu(null)} />
            </div>
          ))}
        </div>
      </div>

      {selectedSubMenu && selectedSub && (
        <div>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 700, margin: '0 0 0.625rem 0', color: '#1a1c20' }}>{selectedSub.name}</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '0.625rem' }}>
            {selectedSub.items.map((item, idx) => (
              <div key={idx} style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '0.625rem', cursor: 'pointer', transition: 'transform 0.2s ease, box-shadow 0.2s ease', border: '2px solid transparent', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }} onClick={() => alert(`${item}の詳細ページに遷移します`)} onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0px 10px 30px rgba(68, 73, 80, 0.15)'; e.currentTarget.style.borderColor = '#0d56c9'; }} onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0px 10px 40px rgb(68 73 80 / 10%)'; e.currentTarget.style.borderColor = 'transparent'; }}>
                <FunctionIcon name={item} />
                <h3 style={{ fontWeight: 600, fontSize: '0.75rem', margin: 0, color: '#1a1c20', lineHeight: 1.3 }}>{item}</h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
