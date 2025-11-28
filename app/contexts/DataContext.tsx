'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth, DEMO_USERS } from './AuthContext';

// 申請ステータス
export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

// 申請データ
export interface Submission {
  id: string;
  applicantId: string;
  applicantName: string;
  type: string;
  title: string;
  date: string;
  status: SubmissionStatus;
  data: Record<string, string>;
  assignedTo: string; // 承認者のID
}

// 保存ファイル
export interface StoredFile {
  id: string;
  ownerId: string;
  name: string;
  type: 'excel' | 'pdf' | 'image' | 'other';
  size: string;
  date: string;
  submissionId?: string; // 関連する申請ID（あれば）
}

interface DataContextType {
  // 申請関連
  submissions: Submission[];
  addSubmission: (submission: Omit<Submission, 'id' | 'date'>) => string;
  getMySubmissions: () => Submission[];
  getReceivedRequests: () => Submission[];
  updateSubmissionStatus: (id: string, status: SubmissionStatus) => void;

  // ファイル関連
  files: StoredFile[];
  addFile: (file: Omit<StoredFile, 'id' | 'date'>) => void;
  getMyFiles: () => StoredFile[];
  deleteFile: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// デモ用の初期申請データ
const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    applicantId: 'user-tanaka',
    applicantName: '田中 太郎',
    type: '工事申請',
    title: '給排水設備更新工事',
    date: '2025-01-18',
    status: 'pending',
    data: {},
    assignedTo: 'user-yamada',
  },
  {
    id: 'sub-2',
    applicantId: 'user-suzuki',
    applicantName: '鈴木 花子',
    type: '機材申請',
    title: 'エアコン3台購入申請',
    date: '2025-01-15',
    status: 'pending',
    data: {},
    assignedTo: 'user-yamada',
  },
  {
    id: 'sub-3',
    applicantId: 'user-tanaka',
    applicantName: '田中 太郎',
    type: '工事申請',
    title: '配管補修工事',
    date: '2025-01-08',
    status: 'approved',
    data: {},
    assignedTo: 'user-yamada',
  },
];

// デモ用の初期ファイルデータ
const INITIAL_FILES: StoredFile[] = [
  {
    id: 'file-1',
    ownerId: 'user-tanaka',
    name: '工事申請書_2024Q4.xlsx',
    type: 'excel',
    size: '245 KB',
    date: '2024-11-15 14:32',
  },
  {
    id: 'file-2',
    ownerId: 'user-tanaka',
    name: '点検報告書_202411.pdf',
    type: 'pdf',
    size: '1.2 MB',
    date: '2024-11-13 16:45',
  },
  {
    id: 'file-3',
    ownerId: 'user-suzuki',
    name: '機材リスト.xlsx',
    type: 'excel',
    size: '128 KB',
    date: '2024-11-14 09:15',
  },
  {
    id: 'file-4',
    ownerId: 'user-suzuki',
    name: '現場写真_001.jpg',
    type: 'image',
    size: '3.4 MB',
    date: '2024-11-12 11:20',
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // localStorageから復元
  useEffect(() => {
    const savedSubmissions = localStorage.getItem('kawasaki-demo-submissions');
    const savedFiles = localStorage.getItem('kawasaki-demo-files');

    if (savedSubmissions) {
      setSubmissions(JSON.parse(savedSubmissions));
    } else {
      setSubmissions(INITIAL_SUBMISSIONS);
    }

    if (savedFiles) {
      setFiles(JSON.parse(savedFiles));
    } else {
      setFiles(INITIAL_FILES);
    }

    setIsLoaded(true);
  }, []);

  // 変更時にlocalStorageに保存
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('kawasaki-demo-submissions', JSON.stringify(submissions));
    }
  }, [submissions, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('kawasaki-demo-files', JSON.stringify(files));
    }
  }, [files, isLoaded]);

  // 申請を追加
  const addSubmission = (submission: Omit<Submission, 'id' | 'date'>): string => {
    const id = `sub-${Date.now()}`;
    const newSubmission: Submission = {
      ...submission,
      id,
      date: new Date().toISOString().split('T')[0],
    };
    setSubmissions(prev => [newSubmission, ...prev]);
    return id;
  };

  // 自分が出した申請を取得
  const getMySubmissions = (): Submission[] => {
    if (!currentUser) return [];
    return submissions.filter(s => s.applicantId === currentUser.id);
  };

  // 自分宛ての申請依頼を取得（承認者向け）
  const getReceivedRequests = (): Submission[] => {
    if (!currentUser) return [];
    // 承認者の場合、自分に割り当てられた申請を返す
    if (currentUser.role === 'manager') {
      return submissions.filter(s => s.assignedTo === currentUser.id);
    }
    return [];
  };

  // 申請ステータスを更新
  const updateSubmissionStatus = (id: string, status: SubmissionStatus) => {
    setSubmissions(prev =>
      prev.map(s => (s.id === id ? { ...s, status } : s))
    );
  };

  // ファイルを追加
  const addFile = (file: Omit<StoredFile, 'id' | 'date'>) => {
    const newFile: StoredFile = {
      ...file,
      id: `file-${Date.now()}`,
      date: new Date().toLocaleString('ja-JP'),
    };
    setFiles(prev => [newFile, ...prev]);
  };

  // 自分のファイルを取得
  const getMyFiles = (): StoredFile[] => {
    if (!currentUser) return [];
    return files.filter(f => f.ownerId === currentUser.id);
  };

  // ファイルを削除
  const deleteFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <DataContext.Provider
      value={{
        submissions,
        addSubmission,
        getMySubmissions,
        getReceivedRequests,
        updateSubmissionStatus,
        files,
        addFile,
        getMyFiles,
        deleteFile,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
