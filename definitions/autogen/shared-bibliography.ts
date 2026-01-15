/**
 * shared-bibliography.xsd
 */

/** String Value */
export type ST_String255 = string;

/** Bibliographic Data Source Types */
export enum ST_SourceType {
    /** Article in a Periodical */
    ArticleInAPeriodical = "ArticleInAPeriodical",
    /** Book */
    Book = "Book",
    /** Book Section */
    BookSection = "BookSection",
    /** Journal Article */
    JournalArticle = "JournalArticle",
    /** Conference Proceedings */
    ConferenceProceedings = "ConferenceProceedings",
    /** Reporter */
    Report = "Report",
    /** Sound Recording */
    SoundRecording = "SoundRecording",
    /** Performance */
    Performance = "Performance",
    /** Art */
    Art = "Art",
    /** Document from Internet Site */
    DocumentFromInternetSite = "DocumentFromInternetSite",
    /** Internet Site */
    InternetSite = "InternetSite",
    /** Film */
    Film = "Film",
    /** Interview */
    Interview = "Interview",
    /** Patent */
    Patent = "Patent",
    /** Electronic Source */
    ElectronicSource = "ElectronicSource",
    /** Case */
    Case = "Case",
    /** Miscellaneous */
    Misc = "Misc",
}

/** Person */
export interface CT_NameListType {
    Person: CT_PersonType[];
}

/** Person's Last, or Family, Name */
export interface CT_PersonType {
    Last?: ST_String255[];
    First?: ST_String255[];
    Middle?: ST_String255[];
}

/** Name List */
export interface CT_NameType {
    NameList: CT_NameListType;
}

/** Corporate Author */
export interface CT_NameOrCorporateType {
    NameList: CT_NameListType;
    Corporate: any;
}

/** Artist */
export interface CT_AuthorType {
    Artist: CT_NameType;
    Author: CT_NameOrCorporateType;
    BookAuthor: CT_NameType;
    Compiler: CT_NameType;
    Composer: CT_NameType;
    Conductor: CT_NameType;
    Counsel: CT_NameType;
    Director: CT_NameType;
    Editor: CT_NameType;
    Interviewee: CT_NameType;
    Interviewer: CT_NameType;
    Inventor: CT_NameType;
    Performer: CT_NameOrCorporateType;
    ProducerName: CT_NameType;
    Translator: CT_NameType;
    Writer: CT_NameType;
}

/** Abbreviated Case Number */
export interface CT_SourceType {
    AbbreviatedCaseNumber: ST_String255;
    AlbumTitle: ST_String255;
    Author: CT_AuthorType;
    BookTitle: ST_String255;
    Broadcaster: ST_String255;
    BroadcastTitle: ST_String255;
    CaseNumber: ST_String255;
    ChapterNumber: ST_String255;
    City: ST_String255;
    Comments: ST_String255;
    ConferenceName: ST_String255;
    CountryRegion: ST_String255;
    Court: ST_String255;
    Day: ST_String255;
    DayAccessed: ST_String255;
    Department: ST_String255;
    Distributor: ST_String255;
    Edition: ST_String255;
    Guid: ST_String255;
    Institution: ST_String255;
    InternetSiteTitle: ST_String255;
    Issue: ST_String255;
    JournalName: ST_String255;
    LCID: ST_String255;
    Medium: ST_String255;
    Month: ST_String255;
    MonthAccessed: ST_String255;
    NumberVolumes: ST_String255;
    Pages: ST_String255;
    PatentNumber: ST_String255;
    PeriodicalTitle: ST_String255;
    ProductionCompany: ST_String255;
    PublicationTitle: ST_String255;
    Publisher: ST_String255;
    RecordingNumber: ST_String255;
    RefOrder: ST_String255;
    Reporter: ST_String255;
    SourceType: ST_SourceType;
    ShortTitle: ST_String255;
    StandardNumber: ST_String255;
    StateProvince: ST_String255;
    Station: ST_String255;
    Tag: ST_String255;
    Theater: ST_String255;
    ThesisType: ST_String255;
    Title: ST_String255;
    Type: ST_String255;
    URL: ST_String255;
    Version: ST_String255;
    Volume: ST_String255;
    Year: ST_String255;
    YearAccessed: ST_String255;
}

/** Source */
export interface CT_Sources {
    SelectedStyle?: ST_String255;
    StyleName?: ST_String255;
    URI?: ST_String255;
    Source?: CT_SourceType[];
}

