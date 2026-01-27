import { CT_ExtensionList, ST_Ref, ST_UnsignedIntHex, ST_Xstring } from './sml-baseTypes';
import { CT_Index, CT_PivotArea } from './sml-pivotTableShared';
import { ST_DataConsolidateFunction } from './sml-sheet';
import { ST_DxfId, ST_NumFmtId } from './sml-styles';

/**
 * sml-pivotTable.xsd
 */

/** PivotCache Type */
export enum ST_SourceType {
  /** Worksheet */
  worksheet = 'worksheet',
  /** External */
  external = 'external',
  /** Consolidation Ranges */
  consolidation = 'consolidation',
  /** Scenario Summary Report */
  scenario = 'scenario'
}

/** Values Group By */
export enum ST_GroupBy {
  /** Group By Numeric Ranges */
  range = 'range',
  /** Seconds */
  seconds = 'seconds',
  /** Minutes */
  minutes = 'minutes',
  /** Hours */
  hours = 'hours',
  /** Days */
  days = 'days',
  /** Months */
  months = 'months',
  /** Quarters */
  quarters = 'quarters',
  /** Years */
  years = 'years'
}

/** Set Sort Order */
export enum ST_SortType {
  /** None */
  none = 'none',
  /** Ascending */
  ascending = 'ascending',
  /** Descending */
  descending = 'descending',
  /** Ascending Alpha */
  ascendingAlpha = 'ascendingAlpha',
  /** Alphabetic Order Descending */
  descendingAlpha = 'descendingAlpha',
  /** Ascending Natural */
  ascendingNatural = 'ascendingNatural',
  /** Natural Order Descending */
  descendingNatural = 'descendingNatural'
}

/** Conditional Formatting Scope */
export enum ST_Scope {
  /** Selection */
  selection = 'selection',
  /** Data Fields */
  data = 'data',
  /** Field Intersections */
  field = 'field'
}

/** Top N Evaluation Type */
export enum ST_Type {
  /** Top N None */
  none = 'none',
  /** All */
  all = 'all',
  /** Row Top N */
  row = 'row',
  /** Column Top N */
  column = 'column'
}

/** Show Data As */
export enum ST_ShowDataAs {
  /** Normal Data Type */
  normal = 'normal',
  /** Difference */
  difference = 'difference',
  /** Percentage Of */
  percent = 'percent',
  /** Percentage Difference */
  percentDiff = 'percentDiff',
  /** Running Total */
  runTotal = 'runTotal',
  /** Percentage of Row */
  percentOfRow = 'percentOfRow',
  /** Percent of Column */
  percentOfCol = 'percentOfCol',
  /** Percentage of Total */
  percentOfTotal = 'percentOfTotal',
  /** Index */
  index = 'index'
}

/** PivotItem Type */
export enum ST_ItemType {
  /** Data */
  data = 'data',
  /** Default */
  default = 'default',
  /** Sum */
  sum = 'sum',
  /** CountA */
  countA = 'countA',
  /** Average */
  avg = 'avg',
  /** Max */
  max = 'max',
  /** Min */
  min = 'min',
  /** Product */
  product = 'product',
  /** Count */
  count = 'count',
  /** stdDev */
  stdDev = 'stdDev',
  /** StdDevP */
  stdDevP = 'stdDevP',
  /** Var */
  var = 'var',
  /** VarP */
  varP = 'varP',
  /** Grand Total Item */
  grand = 'grand',
  /** Blank Pivot Item */
  blank = 'blank'
}

/** PivotTable Format Types */
export enum ST_FormatAction {
  /** Blank */
  blank = 'blank',
  /** Formatting */
  formatting = 'formatting',
  /** Drill Type */
  drill = 'drill',
  /** Formula Type */
  formula = 'formula'
}

/** Field Sort Type */
export enum ST_FieldSortType {
  /** Manual Sort */
  manual = 'manual',
  /** Ascending */
  ascending = 'ascending',
  /** Descending */
  descending = 'descending'
}

/** Pivot Filter Types */
export enum ST_PivotFilterType {
  /** Unknown */
  unknown = 'unknown',
  /** Count */
  count = 'count',
  /** Percent */
  percent = 'percent',
  /** Sum */
  sum = 'sum',
  /** Caption Equals */
  captionEqual = 'captionEqual',
  /** Caption Not Equal */
  captionNotEqual = 'captionNotEqual',
  /** Caption Begins With */
  captionBeginsWith = 'captionBeginsWith',
  /** Caption Does Not Begin With */
  captionNotBeginsWith = 'captionNotBeginsWith',
  /** Caption Ends With */
  captionEndsWith = 'captionEndsWith',
  /** Caption Does Not End With */
  captionNotEndsWith = 'captionNotEndsWith',
  /** Caption Contains */
  captionContains = 'captionContains',
  /** Caption Does Not Contain */
  captionNotContains = 'captionNotContains',
  /** Caption Is Greater Than */
  captionGreaterThan = 'captionGreaterThan',
  /** Caption Is Greater Than Or Equal To */
  captionGreaterThanOrEqual = 'captionGreaterThanOrEqual',
  /** Caption Is Less Than */
  captionLessThan = 'captionLessThan',
  /** Caption Is Less Than Or Equal To */
  captionLessThanOrEqual = 'captionLessThanOrEqual',
  /** Caption Is Between */
  captionBetween = 'captionBetween',
  /** Caption Is Not Between */
  captionNotBetween = 'captionNotBetween',
  /** Value Equal */
  valueEqual = 'valueEqual',
  /** Value Not Equal */
  valueNotEqual = 'valueNotEqual',
  /** Value Greater Than */
  valueGreaterThan = 'valueGreaterThan',
  /** Value Greater Than Or Equal To */
  valueGreaterThanOrEqual = 'valueGreaterThanOrEqual',
  /** Value Less Than */
  valueLessThan = 'valueLessThan',
  /** Value Less Than Or Equal To */
  valueLessThanOrEqual = 'valueLessThanOrEqual',
  /** Value Between */
  valueBetween = 'valueBetween',
  /** Value Not Between */
  valueNotBetween = 'valueNotBetween',
  /** Date Equals */
  dateEqual = 'dateEqual',
  /** Date Does Not Equal */
  dateNotEqual = 'dateNotEqual',
  /** Date Older Than */
  dateOlderThan = 'dateOlderThan',
  /** Date Older Than Or Equal */
  dateOlderThanOrEqual = 'dateOlderThanOrEqual',
  /** Date Newer Than */
  dateNewerThan = 'dateNewerThan',
  /** Date Newer Than or Equal To */
  dateNewerThanOrEqual = 'dateNewerThanOrEqual',
  /** Date Between */
  dateBetween = 'dateBetween',
  /** Date Not Between */
  dateNotBetween = 'dateNotBetween',
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
  /** Year-To-Date */
  yearToDate = 'yearToDate',
  /** First Quarter */
  Q1 = 'Q1',
  /** Second Quarter */
  Q2 = 'Q2',
  /** Third Quarter */
  Q3 = 'Q3',
  /** Fourth Quarter */
  Q4 = 'Q4',
  /** January */
  M1 = 'M1',
  /** Dates in February */
  M2 = 'M2',
  /** Dates in March */
  M3 = 'M3',
  /** Dates in April */
  M4 = 'M4',
  /** Dates in May */
  M5 = 'M5',
  /** Dates in June */
  M6 = 'M6',
  /** Dates in July */
  M7 = 'M7',
  /** Dates in August */
  M8 = 'M8',
  /** Dates in September */
  M9 = 'M9',
  /** Dates in October */
  M10 = 'M10',
  /** Dates in November */
  M11 = 'M11',
  /** Dates in December */
  M12 = 'M12'
}

/** PivotCache Source Description */
export interface CT_PivotCacheDefinition {
  id: string;
  invalid?: boolean;
  saveData?: boolean;
  refreshOnLoad?: boolean;
  optimizeMemory?: boolean;
  enableRefresh?: boolean;
  refreshedBy?: ST_Xstring;
  refreshedDate?: number;
  backgroundQuery?: boolean;
  missingItemsLimit?: number;
  createdVersion?: number;
  refreshedVersion?: number;
  minRefreshableVersion?: number;
  recordCount?: number;
  upgradeOnRefresh?: boolean;
  tupleCache?: boolean | any;
  supportSubquery?: boolean;
  supportAdvancedDrill?: boolean;
  cacheSource: CT_CacheSource;
  cacheFields: CT_CacheFields;
  cacheHierarchies?: any;
  kpis?: any;
  calculatedItems?: any;
  calculatedMembers?: CT_CalculatedMembers;
  dimensions?: CT_Dimensions;
  measureGroups?: CT_MeasureGroups;
  maps?: CT_MeasureDimensionMaps;
  extLst?: any;
}

/** PivotCache Field */
export interface CT_CacheFields {
  count?: number;
  cacheField?: CT_CacheField[];
}

/** Shared Items */
export interface CT_CacheField {
  name: ST_Xstring;
  caption?: ST_Xstring;
  propertyName?: ST_Xstring;
  serverField?: boolean;
  uniqueList?: boolean;
  numFmtId?: ST_NumFmtId;
  formula?: ST_Xstring;
  sqlType?: number;
  hierarchy?: number;
  level?: number;
  databaseField?: boolean;
  mappingCount?: number;
  memberPropertyField?: boolean;
  sharedItems?: CT_SharedItems;
  fieldGroup?: any;
  mpMap?: any[];
  extLst?: any;
}

/** Worksheet PivotCache Source */
export interface CT_CacheSource {
  type: ST_SourceType;
  connectionId?: number;
  worksheetSource: CT_WorksheetSource;
  consolidation: CT_Consolidation;
  extLst?: CT_ExtensionList;
}

/** Reference */
export interface CT_WorksheetSource {
  ref?: ST_Ref;
  name?: ST_Xstring;
  sheet?: ST_Xstring;
  id: string;
}

/** Page Item Values */
export interface CT_Consolidation {
  autoPage?: boolean;
  pages?: CT_Pages;
  rangeSets: CT_RangeSets;
}

/** Page Items */
export interface CT_Pages {
  count?: number;
  page: CT_PCDSCPage[];
}

/** Page Item */
export interface CT_PCDSCPage {
  count?: number;
  pageItem?: CT_PageItem[];
}

/** Page Item Name */
export interface CT_PageItem {
  name: ST_Xstring;
}

/** Range Set */
export interface CT_RangeSets {
  count?: number;
  rangeSet: CT_RangeSet[];
}

/** Field Item Index Page 1 */
export interface CT_RangeSet {
  i1?: number;
  i2?: number;
  i3?: number;
  i4?: number;
  ref?: ST_Ref;
  name?: ST_Xstring;
  sheet?: ST_Xstring;
  id: string;
}

/** No Value */
export interface CT_SharedItems {
  containsSemiMixedTypes?: boolean;
  containsNonDate?: boolean;
  containsDate?: boolean;
  containsString?: boolean;
  containsBlank?: boolean;
  containsMixedTypes?: boolean;
  containsNumber?: boolean;
  containsInteger?: boolean;
  minValue?: number;
  maxValue?: number;
  minDate?: any;
  maxDate?: any;
  count?: number;
  longText?: boolean;
  m: CT_Missing;
  n: CT_Number;
  b: CT_Boolean;
  e: CT_Error;
  s: CT_String;
  d: CT_DateTime;
}

/** Tuples */
export interface CT_Missing {
  u?: boolean;
  f?: boolean;
  c?: ST_Xstring;
  cp?: number;
  in?: number;
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
  tpls?: any[];
  x?: any[];
}

/** OLAP Members */
export interface CT_Number {
  v: any;
  u?: boolean;
  f?: boolean;
  c?: ST_Xstring;
  cp?: number;
  in?: number;
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
  tpls?: any[];
  x?: any[];
}

/** Member Property Indexes */
export interface CT_Boolean {
  v: any;
  u?: boolean;
  f?: boolean;
  c?: ST_Xstring;
  cp?: number;
  x?: any[];
}

/** Tuples */
export interface CT_Error {
  v: any;
  u?: boolean;
  f?: boolean;
  c?: ST_Xstring;
  cp?: number;
  in?: number;
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
  tpls?: any;
  x?: any[];
}

/** Tuples */
export interface CT_String {
  v: any;
  u?: boolean;
  f?: boolean;
  c?: ST_Xstring;
  cp?: number;
  in?: number;
  bc?: ST_UnsignedIntHex;
  fc?: ST_UnsignedIntHex;
  i?: boolean;
  un?: boolean;
  st?: boolean;
  b?: boolean;
  tpls?: any[];
  x?: any[];
}

/** Member Property Index */
export interface CT_DateTime {
  v: any;
  u?: boolean;
  f?: boolean;
  c?: ST_Xstring;
  cp?: number;
  x?: any[];
}

/** Range Grouping Properties */
export interface CT_FieldGroup {
  par?: number;
  base?: number;
  rangePr?: any;
  discretePr?: any;
  groupItems?: any;
}

/** Source Data Set Beginning Range */
export interface CT_RangePr {
  autoStart?: boolean;
  autoEnd?: boolean;
  groupBy?: ST_GroupBy;
  startNum?: number;
  endNum?: number;
  startDate?: any;
  endDate?: any;
  groupInterval?: number;
}

/** Element Group */
export interface CT_DiscretePr {
  count?: number;
  x: any[];
}

/** No Value */
export interface CT_GroupItems {
  count?: number;
  m: CT_Missing;
  n: CT_Number;
  b: CT_Boolean;
  e: CT_Error;
  s: CT_String;
  d: CT_DateTime;
}

/** PivotCache Record */
export interface CT_PivotCacheRecords {
  count?: number;
  r?: any[];
  extLst?: any;
}

/** No Value */
export interface CT_Record {
  m: CT_Missing;
  n: CT_Number;
  b: CT_Boolean;
  e: CT_Error;
  s: CT_String;
  d: CT_DateTime;
  x: CT_Index;
}

/** OLAP KPI */
export interface CT_PCDKPIs {
  count?: number;
  kpi?: any[];
}

/** KPI Unique Name */
export interface CT_PCDKPI {
  uniqueName: any;
  caption?: any;
  displayFolder?: ST_Xstring;
  measureGroup?: ST_Xstring;
  parent?: ST_Xstring;
  value: any;
  goal?: ST_Xstring;
  status?: ST_Xstring;
  trend?: ST_Xstring;
  weight?: ST_Xstring;
  time?: ST_Xstring;
}

/** PivotCache Hierarchy */
export interface CT_CacheHierarchies {
  count?: number;
  cacheHierarchy?: any[];
}

/** Fields Usage */
export interface CT_CacheHierarchy {
  uniqueName: any;
  caption?: any;
  measure?: boolean;
  set?: boolean;
  parentSet?: number;
  iconSet?: number;
  attribute?: boolean;
  time?: boolean;
  keyAttribute?: boolean;
  defaultMemberUniqueName?: ST_Xstring;
  allUniqueName?: ST_Xstring;
  allCaption?: ST_Xstring;
  dimensionUniqueName?: ST_Xstring;
  displayFolder?: ST_Xstring;
  measureGroup?: ST_Xstring;
  measures?: boolean;
  count: any;
  oneField?: boolean;
  memberValueDatatype?: any;
  unbalanced?: any;
  unbalancedGroup?: any;
  hidden?: boolean;
  fieldsUsage?: any;
  groupLevels?: any;
  extLst?: any;
}

/** PivotCache Field Id */
export interface CT_FieldsUsage {
  count?: number;
  fieldUsage?: any[];
}

/** Field Index */
export interface CT_FieldUsage {
  x: any;
}

/** OLAP Grouping Levels */
export interface CT_GroupLevels {
  count?: number;
  groupLevel: any[];
}

/** OLAP Level Groups */
export interface CT_GroupLevel {
  uniqueName: any;
  caption: any;
  user?: boolean;
  customRollUp?: boolean;
  groups?: any;
  extLst?: any;
}

/** OLAP Group */
export interface CT_Groups {
  count?: number;
  group: any[];
}

/** OLAP Group Members */
export interface CT_LevelGroup {
  name: any;
  uniqueName: any;
  caption: any;
  uniqueParent?: ST_Xstring;
  id?: number;
  groupMembers: CT_GroupMembers;
}

/** OLAP Group Member */
export interface CT_GroupMembers {
  count?: number;
  groupMember: any[];
}

/** Group Member Unique Name */
export interface CT_GroupMember {
  uniqueName: any;
  group?: boolean;
}

/** Entries */
export interface CT_TupleCache {
  entries?: any;
  sets?: any;
  queryCache?: any;
  serverFormats?: any;
  extLst?: any;
}

/** Culture */
export interface CT_ServerFormat {
  culture?: any;
  format?: any;
}

/** Server Format */
export interface CT_ServerFormats {
  count?: number;
  serverFormat?: CT_ServerFormat[];
}

/** No Value */
export interface CT_PCDSDTCEntries {
  count?: number;
  m: CT_Missing;
  n: CT_Number;
  e: CT_Error;
  s: CT_String;
}

/** Tuple */
export interface CT_Tuples {
  c?: number;
  tpl: CT_Tuple[];
}

/** Field Index */
export interface CT_Tuple {
  fld?: number;
  hier?: number;
  item: number;
}

/** OLAP Set */
export interface CT_Sets {
  count?: number;
  set: any[];
}

/** Tuples */
export interface CT_Set {
  count?: number;
  maxRank: any;
  setDefinition: any;
  sortType?: ST_SortType;
  queryFailed?: boolean;
  tpls?: any[];
  sortByTuple?: any;
}

/** Query */
export interface CT_QueryCache {
  count?: number;
  query: any[];
}

/** Tuples */
export interface CT_Query {
  mdx: any;
  tpls?: any;
}

/** Calculated Item */
export interface CT_CalculatedItems {
  count?: number;
  calculatedItem: any[];
}

/** Calculated Item Location */
export interface CT_CalculatedItem {
  field?: number;
  formula?: ST_Xstring;
  pivotArea: CT_PivotArea;
  extLst?: any;
}

/** Calculated Member */
export interface CT_CalculatedMembers {
  count?: number;
  calculatedMember: any[];
}

/** Future Feature Data Storage Area */
export interface CT_CalculatedMember {
  name: any;
  mdx: any;
  memberName?: ST_Xstring;
  hierarchy?: ST_Xstring;
  parent?: ST_Xstring;
  solveOrder?: number;
  set?: boolean;
  extLst?: any;
}

/** PivotTable Location */
export interface CT_pivotTableDefinition {
  name: any;
  cacheId: any;
  dataOnRows?: boolean;
  dataPosition?: number;
  dataCaption: any;
  grandTotalCaption?: ST_Xstring;
  errorCaption?: ST_Xstring;
  showError?: boolean;
  missingCaption?: ST_Xstring;
  showMissing?: boolean;
  pageStyle?: ST_Xstring;
  pivotTableStyle?: ST_Xstring;
  vacatedStyle?: ST_Xstring;
  tag?: ST_Xstring;
  updatedVersion?: number;
  minRefreshableVersion?: number;
  asteriskTotals?: boolean;
  showItems?: boolean;
  editData?: boolean;
  disableFieldList?: boolean;
  showCalcMbrs?: boolean;
  visualTotals?: boolean;
  showMultipleLabel?: boolean;
  showDataDropDown?: boolean;
  showDrill?: boolean;
  printDrill?: boolean;
  showMemberPropertyTips?: boolean;
  showDataTips?: boolean;
  enableWizard?: boolean;
  enableDrill?: boolean;
  enableFieldProperties?: boolean;
  preserveFormatting?: boolean;
  useAutoFormatting?: boolean;
  pageWrap?: number;
  pageOverThenDown?: boolean;
  subtotalHiddenItems?: boolean;
  rowGrandTotals?: boolean;
  colGrandTotals?: boolean;
  fieldPrintTitles?: boolean;
  itemPrintTitles?: boolean;
  mergeItem?: boolean;
  showDropZones?: boolean;
  createdVersion?: number;
  indent?: number;
  showEmptyRow?: boolean;
  showEmptyCol?: boolean;
  showHeaders?: boolean;
  compact?: boolean;
  outline?: boolean;
  outlineData?: boolean;
  compactData?: boolean;
  published?: boolean;
  gridDropZones?: boolean;
  immersive?: boolean;
  multipleFieldFilters?: boolean;
  chartFormat?: number;
  rowHeaderCaption?: ST_Xstring;
  colHeaderCaption?: ST_Xstring;
  fieldListSortAscending?: boolean;
  mdxSubqueries?: boolean;
  customListSort?: boolean;
  location: CT_Location;
  pivotFields?: CT_PivotFields;
  rowFields?: CT_RowFields;
  rowItems?: CT_rowItems;
  colFields?: CT_ColFields;
  colItems?: CT_colItems;
  pageFields?: CT_PageFields;
  dataFields?: CT_DataFields;
  formats?: CT_Formats;
  conditionalFormats?: CT_ConditionalFormats;
  chartFormats?: CT_ChartFormats;
  pivotHierarchies?: CT_PivotHierarchies;
  pivotTableStyleInfo?: any;
  filters?: any;
  rowHierarchiesUsage?: CT_RowHierarchiesUsage;
  colHierarchiesUsage?: CT_ColHierarchiesUsage;
  extLst?: any;
}

/** Reference */
export interface CT_Location {
  ref: any;
  firstHeaderRow: any;
  firstDataRow: any;
  firstDataCol: any;
  rowPageCount?: number;
  colPageCount?: number;
}

/** PivotTable Field */
export interface CT_PivotFields {
  count?: number;
  pivotField: any[];
}

/** Field Items */
export interface CT_PivotField {
  name?: ST_Xstring;
  axis?: any;
  dataField?: boolean;
  subtotalCaption?: ST_Xstring;
  showDropDowns?: boolean;
  hiddenLevel?: boolean;
  uniqueMemberProperty?: ST_Xstring;
  compact?: boolean;
  allDrilled?: boolean;
  numFmtId?: ST_NumFmtId;
  outline?: boolean;
  subtotalTop?: boolean;
  dragToRow?: boolean;
  dragToCol?: boolean;
  multipleItemSelectionAllowed?: boolean;
  dragToPage?: boolean;
  dragToData?: boolean;
  dragOff?: boolean;
  showAll?: boolean;
  insertBlankRow?: boolean;
  serverField?: boolean;
  insertPageBreak?: boolean;
  autoShow?: boolean;
  topAutoShow?: boolean;
  hideNewItems?: boolean;
  measureFilter?: boolean;
  includeNewItemsInFilter?: boolean;
  itemPageCount?: number;
  sortType?: ST_FieldSortType;
  dataSourceSort?: boolean;
  nonAutoSortDefault?: boolean;
  rankBy?: number;
  defaultSubtotal?: boolean;
  sumSubtotal?: boolean;
  countASubtotal?: boolean;
  avgSubtotal?: boolean;
  maxSubtotal?: boolean;
  minSubtotal?: boolean;
  productSubtotal?: boolean;
  countSubtotal?: boolean;
  stdDevSubtotal?: boolean;
  stdDevPSubtotal?: boolean;
  varSubtotal?: boolean;
  varPSubtotal?: boolean;
  showPropCell?: boolean;
  showPropTip?: boolean;
  showPropAsCaption?: boolean;
  defaultAttributeDrillState?: boolean;
  items?: any;
  autoSortScope?: any;
  extLst?: any;
}

/** Auto Sort Scope */
export interface CT_AutoSortScope {
  pivotArea: CT_PivotArea;
}

/** PivotTable Field Item */
export interface CT_Items {
  count?: number;
  item: any[];
}

/** Item User Caption */
export interface CT_Item {
  n?: ST_Xstring;
  t?: ST_ItemType;
  h?: boolean;
  s?: boolean;
  sd?: boolean;
  f?: boolean;
  m?: boolean;
  c?: boolean;
  x?: number;
  d?: boolean;
  e?: boolean;
}

/** Page Field */
export interface CT_PageFields {
  count?: number;
  pageField: any[];
}

/** Future Feature Data Storage Area */
export interface CT_PageField {
  fld: any;
  item?: any;
  hier?: number;
  name?: ST_Xstring;
  cap?: ST_Xstring;
  extLst?: any;
}

/** Data Field Item */
export interface CT_DataFields {
  count?: number;
  dataField: any[];
}

/** Future Feature Data Storage Area */
export interface CT_DataField {
  name?: any;
  fld: number;
  subtotal?: ST_DataConsolidateFunction;
  showDataAs?: ST_ShowDataAs;
  baseField?: number;
  baseItem?: number;
  numFmtId?: ST_NumFmtId;
  extLst?: any;
}

/** Row Items */
export interface CT_rowItems {
  count?: number;
  i: any[];
}

/** Column Items */
export interface CT_colItems {
  count?: number;
  i: any[];
}

/** Row / Column Item Index */
export interface CT_I {
  t?: ST_ItemType;
  r?: number;
  i?: number;
  x?: any[];
}

/** Shared Items Index */
export interface CT_X {
  v?: number;
}

/** Row Items */
export interface CT_RowFields {
  count?: number;
  field: any[];
}

/** Field */
export interface CT_ColFields {
  count?: number;
  field: any[];
}

/** Field Index */
export interface CT_Field {
  x: number;
}

/** PivotTable Format */
export interface CT_Formats {
  count?: number;
  format: any[];
}

/** Pivot Table Location */
export interface CT_Format {
  action?: ST_FormatAction;
  dxfId?: ST_DxfId;
  pivotArea: CT_PivotArea;
  extLst?: any;
}

/** Conditional Formatting */
export interface CT_ConditionalFormats {
  count?: number;
  conditionalFormat: any[];
}

/** Pivot Areas */
export interface CT_ConditionalFormat {
  scope?: ST_Scope;
  type?: ST_Type;
  priority: any;
  pivotAreas: CT_PivotAreas;
  extLst?: any;
}

/** Pivot Area */
export interface CT_PivotAreas {
  count?: number;
  pivotArea?: any[];
}

/** PivotChart Format */
export interface CT_ChartFormats {
  count?: number;
  chartFormat: any[];
}

/** Pivot Table Location Rule */
export interface CT_ChartFormat {
  chart: any;
  format: any;
  series?: boolean;
  pivotArea: CT_PivotArea;
}

/** OLAP Hierarchy */
export interface CT_PivotHierarchies {
  count?: number;
  pivotHierarchy: any[];
}

/** OLAP Member Properties */
export interface CT_PivotHierarchy {
  outline?: boolean;
  multipleItemSelectionAllowed?: boolean;
  subtotalTop?: boolean;
  showInFieldList?: boolean;
  dragToRow?: boolean;
  dragToCol?: boolean;
  dragToPage?: boolean;
  dragToData?: boolean;
  dragOff?: boolean;
  includeNewItemsInFilter?: boolean;
  caption?: ST_Xstring;
  mps?: any;
  members?: any[];
  extLst?: any;
}

/** Row OLAP Hierarchies */
export interface CT_RowHierarchiesUsage {
  count?: number;
  rowHierarchyUsage: any[];
}

/** Column OLAP Hierarchies */
export interface CT_ColHierarchiesUsage {
  count?: number;
  colHierarchyUsage: any[];
}

/** Hierarchy Usage */
export interface CT_HierarchyUsage {
  hierarchyUsage: number;
}

/** OLAP Member Property */
export interface CT_MemberProperties {
  count?: number;
  mp: any[];
}

/** OLAP Member Property Unique Name */
export interface CT_MemberProperty {
  name?: ST_Xstring;
  showCell?: boolean;
  showTip?: boolean;
  showAsCaption?: boolean;
  nameLen?: number;
  pPos?: number;
  pLen?: number;
  level?: number;
  field: any;
}

/** Member */
export interface CT_Members {
  count?: number;
  level?: any;
  member: any[];
}

/** Hidden Item Name */
export interface CT_Member {
  name: any;
}

/** OLAP Dimension */
export interface CT_Dimensions {
  count?: number;
  dimension?: any[];
}

/** Measure */
export interface CT_PivotDimension {
  measure?: boolean;
  name: any;
  uniqueName: any;
  caption: any;
}

/** OLAP Measure Group */
export interface CT_MeasureGroups {
  count?: number;
  measureGroup?: any[];
}

/** OLAP Measure Group */
export interface CT_MeasureDimensionMaps {
  count?: number;
  map?: any[];
}

/** Measure Group Name */
export interface CT_MeasureGroup {
  name: any;
  caption: any;
}

/** Measure Group Id */
export interface CT_MeasureDimensionMap {
  measureGroup?: any;
  dimension?: any;
}

/** Table Style Name */
export interface CT_PivotTableStyle {
  name?: string;
  showRowHeaders?: boolean;
  showColHeaders?: boolean;
  showRowStripes?: boolean;
  showColStripes?: boolean;
  showLastColumn?: boolean;
}

/** PivotTable Advanced Filter */
export interface CT_PivotFilters {
  count?: number;
  filter?: any[];
}

/** Auto Filter */
export interface CT_PivotFilter {
  fld: any;
  mpFld?: number;
  type: any;
  evalOrder?: any;
  id: string;
  iMeasureHier?: any;
  iMeasureFld?: any;
  name?: ST_Xstring;
  description?: ST_Xstring;
  stringValue1?: ST_Xstring;
  stringValue2?: ST_Xstring;
  autoFilter: any;
  extLst?: any;
}
