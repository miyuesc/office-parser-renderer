import { CT_ExtensionList, ST_Xstring } from './common-types';
import { ST_Ref } from './sml-baseTypes';
import { ST_DxfId } from './sml-styles';
/**
 * sml-autoFilter.xsd
 */
/** Filter Operator */
export enum ST_FilterOperator {
  /** Equal */
  equal = 'equal',
  /** Less Than */
  lessThan = 'lessThan',
  /** Less Than Or Equal */
  lessThanOrEqual = 'lessThanOrEqual',
  /** Not Equal */
  notEqual = 'notEqual',
  /** Greater Than Or Equal */
  greaterThanOrEqual = 'greaterThanOrEqual',
  /** Greater Than */
  greaterThan = 'greaterThan'
}
/** Dynamic Filter */
export enum ST_DynamicFilterType {
  /** Null */
  null = 'null',
  /** Above Average */
  aboveAverage = 'aboveAverage',
  /** Below Average */
  belowAverage = 'belowAverage',
  /** Tomorrow */
  tomorrow = 'tomorrow',
  /** Today */
  today = 'today',
  /** Yesterday */
  yesterday = 'yesterday',
  /** Next Week */
  nextWeek = 'nextWeek',
  /** This Week */
  thisWeek = 'thisWeek',
  /** Last Week */
  lastWeek = 'lastWeek',
  /** Next Month */
  nextMonth = 'nextMonth',
  /** This Month */
  thisMonth = 'thisMonth',
  /** Last Month */
  lastMonth = 'lastMonth',
  /** Next Quarter */
  nextQuarter = 'nextQuarter',
  /** This Quarter */
  thisQuarter = 'thisQuarter',
  /** Last Quarter */
  lastQuarter = 'lastQuarter',
  /** Next Year */
  nextYear = 'nextYear',
  /** This Year */
  thisYear = 'thisYear',
  /** Last Year */
  lastYear = 'lastYear',
  /** Year To Date */
  yearToDate = 'yearToDate',
  /** 1st Quarter */
  Q1 = 'Q1',
  /** 2nd Quarter */
  Q2 = 'Q2',
  /** 3rd Quarter */
  Q3 = 'Q3',
  /** 4th Quarter */
  Q4 = 'Q4',
  /** 1st Month */
  M1 = 'M1',
  /** 2nd Month */
  M2 = 'M2',
  /** 3rd Month */
  M3 = 'M3',
  /** 4th Month */
  M4 = 'M4',
  /** 5th Month */
  M5 = 'M5',
  /** 6th Month */
  M6 = 'M6',
  /** 7th Month */
  M7 = 'M7',
  /** 8th Month */
  M8 = 'M8',
  /** 9th Month */
  M9 = 'M9',
  /** 10th Month */
  M10 = 'M10',
  /** 11th Month */
  M11 = 'M11',
  /** 12th Month */
  M12 = 'M12'
}
/** Icon Set Type */
export enum ST_IconSetType {
  /** 3 Arrows */
  _3Arrows = '3Arrows',
  /** 3 Arrows  (Gray) */
  _3ArrowsGray = '3ArrowsGray',
  /** 3 Flags */
  _3Flags = '3Flags',
  /** 3 Traffic Lights */
  _3TrafficLights1 = '3TrafficLights1',
  /** 3 Traffic Lights Black */
  _3TrafficLights2 = '3TrafficLights2',
  /** 3 Signs */
  _3Signs = '3Signs',
  /** 3 Symbols Circled */
  _3Symbols = '3Symbols',
  /** 3 Symbols */
  _3Symbols2 = '3Symbols2',
  /** 4 Arrows */
  _4Arrows = '4Arrows',
  /** 4 Arrows (Gray) */
  _4ArrowsGray = '4ArrowsGray',
  /** 4 Red To Black */
  _4RedToBlack = '4RedToBlack',
  /** 4 Ratings */
  _4Rating = '4Rating',
  /** 4 Traffic Lights */
  _4TrafficLights = '4TrafficLights',
  /** 5 Arrows */
  _5Arrows = '5Arrows',
  /** 5 Arrows (Gray) */
  _5ArrowsGray = '5ArrowsGray',
  /** 5 Ratings Icon Set */
  _5Rating = '5Rating',
  /** 5 Quarters */
  _5Quarters = '5Quarters'
}
/** Sort By */
export enum ST_SortBy {
  /** Value */
  value = 'value',
  /** Sort by Cell Color */
  cellColor = 'cellColor',
  /** Sort by Font Color */
  fontColor = 'fontColor',
  /** Sort by Icon */
  icon = 'icon'
}
/** Sort Method */
export enum ST_SortMethod {
  /** Sort by Stroke */
  stroke = 'stroke',
  /** PinYin Sort */
  pinYin = 'pinYin',
  /** None */
  none = 'none'
}
/** Calendar Type */
export enum ST_CalendarType {
  /** No Calendar Type */
  none = 'none',
  /** Gregorian */
  gregorian = 'gregorian',
  /** Gregorian (U.S.) Calendar */
  gregorianUs = 'gregorianUs',
  /** Japanese Emperor Era Calendar */
  japan = 'japan',
  /** Taiwan Era Calendar */
  taiwan = 'taiwan',
  /** Korean Tangun Era Calendar */
  korea = 'korea',
  /** Hijri (Arabic Lunar) Calendar */
  hijri = 'hijri',
  /** Thai Calendar */
  thai = 'thai',
  /** Hebrew (Lunar) Calendar */
  hebrew = 'hebrew',
  /** Gregorian Middle East French Calendar */
  gregorianMeFrench = 'gregorianMeFrench',
  /** Gregorian Arabic Calendar */
  gregorianArabic = 'gregorianArabic',
  /** Gregorian Transliterated English Calendar */
  gregorianXlitEnglish = 'gregorianXlitEnglish',
  /** Gregorian Transliterated French Calendar */
  gregorianXlitFrench = 'gregorianXlitFrench'
}
/** Date Time Grouping */
export enum ST_DateTimeGrouping {
  /** Group by Year */
  year = 'year',
  /** Month */
  month = 'month',
  /** Day */
  day = 'day',
  /** Group by Hour */
  hour = 'hour',
  /** Group by Minute */
  minute = 'minute',
  /** Second */
  second = 'second'
}
/** AutoFilter Column */
export interface CT_AutoFilter {
  ref?: ST_Ref;
  filterColumn?: any[];
  sortState?: any;
  extLst?: CT_ExtensionList;
}
/** Filter Criteria */
export interface CT_FilterColumn {
  colId: number;
  hiddenButton?: boolean;
  showButton?: boolean;
  filters?: CT_Filters;
  top10?: CT_Top10;
  customFilters?: CT_CustomFilters;
  dynamicFilter?: CT_DynamicFilter;
  colorFilter?: CT_ColorFilter;
  iconFilter?: any;
  extLst?: CT_ExtensionList;
}
/** Filter */
export interface CT_Filters {
  blank?: boolean;
  calendarType?: ST_CalendarType;
  filter?: CT_Filter[];
  dateGroupItem?: CT_DateGroupItem[];
}
/** Filter Value */
export interface CT_Filter {
  val?: ST_Xstring;
}
/** Custom Filter Criteria */
export interface CT_CustomFilters {
  and?: boolean;
  customFilter: CT_CustomFilter[];
}
/** Filter Comparison Operator */
export interface CT_CustomFilter {
  operator?: ST_FilterOperator;
  val?: ST_Xstring;
}
/** Top */
export interface CT_Top10 {
  top?: boolean;
  percent?: boolean;
  val: number;
  filterVal?: number;
}
/** Differential Format Record Id */
export interface CT_ColorFilter {
  dxfId?: ST_DxfId;
  cellColor?: boolean;
}
/** Icon Set */
export interface CT_IconFilter {
  iconSet: ST_IconSetType;
  iconId?: number;
}
/** Dynamic filter type */
export interface CT_DynamicFilter {
  type: ST_DynamicFilterType;
  val?: number;
  maxVal?: number;
}
/** Sort Condition */
export interface CT_SortState {
  columnSort?: boolean;
  caseSensitive?: boolean;
  sortMethod?: ST_SortMethod;
  ref: ST_Ref;
  sortCondition?: any[];
  extLst?: CT_ExtensionList;
}
/** Descending */
export interface CT_SortCondition {
  descending?: boolean;
  sortBy?: ST_SortBy;
  ref: ST_Ref;
  customList?: ST_Xstring;
  dxfId?: ST_DxfId;
  iconSet?: ST_IconSetType;
  iconId?: number;
}
/** Year */
export interface CT_DateGroupItem {
  year: number;
  month?: number;
  day?: number;
  hour?: number;
  minute?: number;
  second?: number;
  dateTimeGrouping: ST_DateTimeGrouping;
}
