export const ClaimFields = {
  USER_NAME: "name",
  GIVEN_NAME: "given_name",
  SUR_NAME: "family_name",
  STREET_ADDRESS: "streetAddress",
  CITY: "city",
  STATE: "state",
  POSTAL_CODE: "postalCode",
  COUNTRY: "country",
  EMAILS: "emails"
}

export class UserData {
    UserName: string = '';
    givenName: string = '';
    surName: string = '';
    streetAddress: string = '';
    city: string = '';
    state: string = '';
    postalCode: string = '';
    country: string = '';
    Emails: string[] = []; 
}
