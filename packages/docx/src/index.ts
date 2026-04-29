import { Logger } from '@opr/shared';

export const logger = new Logger('docx');

export * from './model';
export * from './parser';
export * from './layout';
export * from './navigation';
export * from './renderer';
