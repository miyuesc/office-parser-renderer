import { CT_OfficeArtExtensionList } from './dml-baseTypes';

/**
 * dml-audioVideo.xsd
 */

/** Linked Relationship ID */
export interface CT_AudioFile {
  link: any;
  extLst?: CT_OfficeArtExtensionList;
}

/** Linked Relationship ID */
export interface CT_VideoFile {
  link: any;
  extLst?: CT_OfficeArtExtensionList;
}

/** Linked Relationship ID */
export interface CT_QuickTimeFile {
  link: any;
  extLst?: CT_OfficeArtExtensionList;
}

/** Track */
export interface CT_AudioCDTime {
  track: number;
  time?: number;
}

/** Audio Start Time */
export interface CT_AudioCD {
  st: CT_AudioCDTime;
  end: CT_AudioCDTime;
  extLst?: CT_OfficeArtExtensionList;
}
