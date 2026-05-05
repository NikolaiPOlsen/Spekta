export enum ParameterTypeName {
    Genre = "genre", // api request param, is generic return
    Actor = "actor", // api request param, not generic return
    Runtime = "runtime", // api request param, not generic return
    ReleaseDate = "release_date", // api request param, is generic return
    Keyword = "keyword" // api request param, not generic return
}

export const parameterTypeNames = Object.values(ParameterTypeName);