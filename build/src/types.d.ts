export interface ParsingOptions {
    lists?: ListOptions;
}
export interface ListOptions {
    checkboxPrefix?: (checked: boolean) => string;
}
