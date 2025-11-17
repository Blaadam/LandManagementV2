function getUserIdFromString(content: string): string | null {
    // (\d+) creates a capturing group for the sequence of digits (the ID)
    const regex = /<@(\d+)>/;

    const match = content.match(regex);

    if (match && match[1]) {
        return match[1];
    }

    return null;
}

export { getUserIdFromString };