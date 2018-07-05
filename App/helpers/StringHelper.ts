class StringHelper {
    static cleanString(string): string {
        return string.split('-').map((part: string) => (
            part[0].toUpperCase() + part.substr(1))
        ).join(' ');
    }
}

export = StringHelper;