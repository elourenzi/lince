export interface SpecFrontmatter {
  target?: string;
  mode?: string;
  repo?: string;
  approved?: boolean;
  [key: string]: unknown;
}

export interface SpecFile {
  id: string;
  filename: string;
  path: string;
  status: 'inbox' | 'running' | 'done' | 'failed';
  frontmatter: SpecFrontmatter;
  content: string;
  title: string;
  preview: string;
  resultTail?: string[];
  resultSize?: number;
  resultMtime?: number;
  resultFile?: string;
  mtime: number;
}

export interface SystemState {
  inbox: SpecFile[];
  running: SpecFile[];
  done: SpecFile[];
  failed: SpecFile[];
}
