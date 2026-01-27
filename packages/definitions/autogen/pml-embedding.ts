import { CT_ExtensionList } from './common-types';
/**
 * pml-embedding.xsd
 */
/** OLE Object to Follow Color Scheme */
export enum ST_OleObjectFollowColorScheme {
  /** None */
  none = 'none',
  /** Full */
  full = 'full',
  /** Text and Background */
  textAndBackground = 'textAndBackground'
}
/** Color Scheme Properties for OLE Object */
export interface CT_OleObjectEmbed {
  followColorScheme?: ST_OleObjectFollowColorScheme;
  extLst?: CT_ExtensionList;
}
/** Update Linked OLE Objects Automatically */
export interface CT_OleObjectLink {
  updateAutomatic?: boolean;
  extLst?: CT_ExtensionList;
}
/** Embedded OLE Object or Control */
export interface CT_OleObject {
  progId?: string;
  embed: CT_OleObjectEmbed;
  link: CT_OleObjectLink;
}
export interface CT_Control {
  extLst?: CT_ExtensionList;
}
/** Embedded Control */
export interface CT_ControlList {
  control?: CT_Control[];
}
