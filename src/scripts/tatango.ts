import { ENGrid } from "@4site/engrid-scripts";

export function sendSupporterDataToTatango(): void {
  const country = ENGrid.getFieldValue("supporter.country");
  const phoneNumber = formatPhoneNumber(ENGrid.getFieldValue("supporter.phoneNumber2"))

  if (country !== "US" || !phoneNumber) {
    // Only send data for US supporters and valid phone numbers
    return;
  }

  fetch("https://pwo5v1kuzb.execute-api.us-east-1.amazonaws.com/Prod/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "1O4AqxKOIq7w37uyRBeOkalWiFxVzXOO61iqmwzX"
    },
    body: JSON.stringify({
      "phone_number": phoneNumber,
      "first_name": ENGrid.getFieldValue("supporter.firstName"),
      "last_name": ENGrid.getFieldValue("supporter.lastName"),
      "email": ENGrid.getFieldValue("supporter.emailAddress"),
      "zip_code": ENGrid.getFieldValue("supporter.postcode"),
    }),
  }).then(r => {})
}

export function formatPhoneNumber(phone: string): string | null {
  // Remove all non-digit characters from the phone number and get the last 10 digits
  // Matches the format expected by Tatango:
  // 10 digits, no country code, no spaces or special characters
  const cleaned = phone.replace(/\D/g, "").slice(-10);

  if (cleaned.length !== 10) {
    return null;
  }

  return cleaned;
}
