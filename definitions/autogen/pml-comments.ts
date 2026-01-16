import { CT_Point2D } from './dml-baseTypes';
import { CT_ExtensionListModify, ST_Index, ST_Name } from './pml-baseTypes';
import { CT_ExtensionList } from './sml-baseTypes';

/**
 * pml-comments.xsd
 */

/** Comment Author ID */
export interface CT_CommentAuthor {
  id: number;
  name: ST_Name;
  initials: ST_Name;
  lastIdx: number;
  clrIdx: number;
  extLst?: CT_ExtensionList;
}

/** Comment Author */
export interface CT_CommentAuthorList {
  cmAuthor?: CT_CommentAuthor[];
}

/** Comment Position */
export interface CT_Comment {
  authorId: number;
  dt?: any;
  idx: ST_Index;
  pos: CT_Point2D;
  text: string;
  extLst?: CT_ExtensionListModify;
}

/** Comment */
export interface CT_CommentList {
  cm?: CT_Comment[];
}
