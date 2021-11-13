module.exports = {
    // Urls:
    dexcomBaseUrl: "https://share2.dexcom.com/ShareWebServices/Services",
    dexcomBaseUrlOus: "https://shareous1.dexcom.com/ShareWebServices/Services",
    // Endpoints:
    dexcomLoginEndpoint: "/General/LoginPublisherAccountByName",
    dexcomAuthenticateEndpoint: "/General/AuthenticatePublisherAccount",
    dexcomVerifySerialNumberEndpoint:
        "/Publisher/CheckMonitoredReceiverAssignmentStatus",
    dexcomGlucoseReadingsEndpoint: "/Publisher/ReadPublisherLatestGlucoseValues",
    // Application ID:
    dexcomApplicationId: "d89443d2-327c-4a6f-89e5-496bbb0317db",
    // Error messages:
    accountErrorUsernameNullEmpty: "Username null or empty",
    accountErrorPasswordNullEmpty: "Password null or empty",
    accountErrorAccountNotFound: "Account not found",
    accountErrorPasswordInvalid: "Password not valid",
    accountErrorUnknown: "Account error",
    sessionErrorSessionIdNull: "Session ID null",
    sessionErrorSessionIdDefault: "Session ID default",
    sessionErrorSessionNotValid: "Session ID not valid",
    sessionErrorSessionNotFound: "Session ID not found",
    arguementErrorMinutesInvalid: "Minutes must be between 1 and 1440",
    arguementErrorMaxCountInvalid: "Max count must be between 1 and 288",
    arguementErrorSerialNumberNullEmpty: "Serial number null or empty",
    // Trend descriptions:
    dexcomTrendDescriptions: [
        "",
        "rising quickly",
        "rising",
        "rising slightly",
        "steady",
        "falling slightly",
        "falling",
        "falling quickly",
        "unable to determine trend",
        "trend unavailable",
    ],
    dexcomTrendArrows: ["", "↑↑", "↑", "↗", "→", "↘", "↓", "↓↓", "?", "-"],
    // Default session ID:
    defaultSessionId: "00000000-0000-0000-0000-000000000000",
    // Conversion factors:
    mmolLConvertionFactor: 0.0555, // (mmol/L) = (mg/dl) * 0.0555
}
