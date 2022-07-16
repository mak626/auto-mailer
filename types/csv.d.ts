export interface EventsCSV {
    EventName: string;
    CertificateName: string;
    FileType: string;
}

export interface MailCSV {
    MAIL: string;
    NAME: string;
}

export interface EventsCSVStream extends EventsCSV {
    FileName: string;
    DataDirectoryPath: string;
}
