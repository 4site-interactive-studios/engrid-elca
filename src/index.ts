import {
  Options,
  App,
  DonationAmount,
  DonationFrequency,
  EnForm,
} from "@4site/engrid-scripts"; // Uses ENGrid via NPM
// import {
//   Options,
//   App,
//   DonationAmount,
//   DonationFrequency,
//   EnForm,
// } from "../../engrid/packages/scripts"; // Uses ENGrid via Visual Studio Workspace

import "./sass/main.scss";
import DonationLightboxForm from "./scripts/donation-lightbox-form";
import { customScript } from "./scripts/main";
import { sendSupporterDataToTatango } from "./scripts/tatango";

const options: Options = {
  applePay: false,
  CapitalizeFields: true,
  ClickToExpand: true,
  CurrencySymbol: "$",
  DecimalSeparator: ".",
  ThousandsSeparator: ",",
  MediaAttribution: true,
  SkipToMainContentLink: true,
  SrcDefer: true,
  ProgressBar: true,
  NeverBounceAPI: "public_1dd5a3d244c7ce5138d9a13c2d6c7bd9",
  NeverBounceDateField: "supporter.NOT_TAGGED_100",
  NeverBounceStatusField: "supporter.NOT_TAGGED_99",
  NeverBounceDateFormat: "YYYYMMDD",
  TidyContact: {
    cid: "c475d648-4393-44a8-8582-e710a046b597",
    us_zip_divider: "-",
    record_field: "supporter.NOT_TAGGED_107",
    date_field: "supporter.NOT_TAGGED_104",
    status_field: "supporter.NOT_TAGGED_105",
    phone_enable: true,
    phone_preferred_countries: ["us"],
    phone_record_field: "supporter.NOT_TAGGED_113",
    phone_date_field: "supporter.NOT_TAGGED_112",
    phone_status_field: "supporter.NOT_TAGGED_109",
  },
  Debug: App.getUrlParameter("debug") === "true",
  Placeholders: {
    ".en__field--donationAmt.en__field--withOther .en__field__input--other":
      "Custom Amount",
    "input#en__field_supporter_phoneNumber2": "Phone Number (Optional)",
  },
  onLoad: () => {
    (<any>window).DonationLightboxForm = DonationLightboxForm;
    new DonationLightboxForm(DonationAmount, DonationFrequency, App);
    customScript(App, EnForm);
  },
  onResize: () => App.log("Starter Theme Window Resized"),
  VGS: {
    "transaction.ccnumber": {
      showCardIcon: {
        right: "20px",
      },
    },
  },
  onSubmit: () => {
    sendSupporterDataToTatango();
  },
};
new App(options);
