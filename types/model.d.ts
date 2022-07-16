export interface Person {
    NAME: string;
    MAIL: string;
}

export interface Event {
    EventName: string;
    FileName: string;
    FileType: string;
    CertificateName: string;
    DataDirectoryPath: string;
    data: Person[];
}
