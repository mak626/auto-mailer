export const getProperFirstName = (givenName: string) => {
    const name = givenName
        .replace(/[^a-zA-Z]/g, ' ') // Remove special chars
        .trim()
        .split(' ')
        .filter((e) => e.length > 2);

    return name[0] ?? givenName.split(' ')[0];
};

export const checkHeaders = (headers: string[], data: any) => {
    for (const header of headers) {
        if (data[header] === undefined) {
            return false;
        }
    }

    return true;
};
