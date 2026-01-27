import { ST_Guid, ST_Xstring } from './common-types';
import { ST_Ref } from './sml-baseTypes';
import { CT_Rst } from './sml-sharedStringTable';
/**
 * sml-comments.xsd
 */
/** Authors */
export interface CT_Comments {
  authors: CT_Authors;
  commentList: CT_CommentList;
  extLst?: any;
}
/** Author */
export interface CT_Authors {
  author?: ST_Xstring[];
}
/** Comment */
export interface CT_CommentList {
  comment?: CT_Comment[];
}
/** Comment Text */
export interface CT_Comment {
  ref: ST_Ref;
  authorId: number;
  guid?: ST_Guid;
  text: CT_Rst;
}
