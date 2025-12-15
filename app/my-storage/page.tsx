'use client';

import { useAuth } from '../contexts/AuthContext';
import { useData, StoredFile } from '../contexts/DataContext';

// ファイルタイプアイコンコンポーネント
const FileIcon = ({ type }: { type: StoredFile['type'] }) => {
  const getColor = () => {
    switch (type) {
      case 'excel': return '#217346';
      case 'pdf': return '#dc3545';
      case 'image': return '#0d6efd';
      default: return '#686e78';
    }
  };

  const getText = () => {
    switch (type) {
      case 'excel': return 'XLS';
      case 'pdf': return 'PDF';
      case 'image': return 'IMG';
      default: return 'FILE';
    }
  };

  return (
    <div style={{ width: 40, height: 40, borderRadius: 6, backgroundColor: getColor(), color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>
      {getText()}
    </div>
  );
};

export default function MyStorage() {
  const { currentUser } = useAuth();
  const { getMyFiles, deleteFile } = useData();

  const files = getMyFiles();

  const handleDelete = (file: StoredFile) => {
    if (confirm(`「${file.name}」を削除しますか？`)) {
      deleteFile(file.id);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: '0 0 0.5rem 0', color: '#1a1c20' }}>保存履歴</h2>
      <p style={{ margin: '0 0 1.5rem 0', color: '#686e78', fontSize: '0.9rem' }}>
        {currentUser?.name}さんの保存ファイルと書類を管理します
      </p>

      <div style={{ backgroundColor: '#fff', borderRadius: '0.625rem', boxShadow: '0px 10px 40px rgb(68 73 80 / 10%)', padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600, color: '#1a1c20' }}>ファイル一覧</h3>
          <button
            style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, backgroundColor: '#0d56c9', color: '#fff', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}
            onClick={() => alert('新規アップロード機能（デモ）')}
          >
            新規アップロード
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {files.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#686e78', fontSize: '0.9rem' }}>
              保存されたファイルがありません
            </div>
          ) : (
            files.map((file) => (
              <div key={file.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', borderRadius: '0.5rem', backgroundColor: '#f8f9fa', transition: 'background-color 0.2s ease' }}>
                <FileIcon type={file.type} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1a1c20', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</div>
                  {file.submissionId && (
                    <div style={{ fontSize: '0.75rem', color: '#686e78' }}>申請データに紐付き</div>
                  )}
                </div>

                <div style={{ fontSize: '0.8rem', color: '#686e78', whiteSpace: 'nowrap' }}>{file.size}</div>
                <div style={{ fontSize: '0.8rem', color: '#686e78', whiteSpace: 'nowrap' }}>{file.date}</div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid #dde5f4', color: '#0d56c9', borderRadius: '0.25rem', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      alert(`${file.name}をダウンロード（デモ）`);
                    }}
                  >
                    DL
                  </button>
                  <button
                    style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem', backgroundColor: 'transparent', border: '1px solid #dc3545', color: '#dc3545', borderRadius: '0.25rem', cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                  >
                    削除
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
