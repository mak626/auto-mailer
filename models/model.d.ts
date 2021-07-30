export interface Person {
    NAME: string;
    MAIL: string;
}

export interface Event {
    EventName: string;
    FileName: string;
    DataDirectoryPath: string;
    data: Person[];
}

export interface Attachement {
    filename: ?string;
    path: ?string;
    cid: ?string;
}
