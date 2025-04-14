import {
  Options,
  App,
  DonationAmount,
  DonationFrequency,
  EnForm,
} from "@4site/engrid-scripts"; // Uses ENGrid via NPM
// import { Options, App } from "../../engrid/packages/scripts"; // Uses ENGrid via Visual Studio Workspace

import "./sass/main.scss";
import DonationLightboxForm from "./scripts/donation-lightbox-form";
import { customScript } from "./scripts/main";

const vgsCss = {
  '@font-face': {
    'font-family': 'GraphikSemiBold',
    'src': `url('https://acb0a5d73b67fccd4bbe-c2d8138f0ea10a18dd4c43ec3aa4240a.ssl.cf5.rackcdn.com/10146/Graphik-Semibold-Web.woff')`,
    'font-display': 'swap'
  }
};
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
  VGS: {
    "transaction.ccnumber": {
      css: vgsCss      
    },
    "transaction.ccvv": {
      css: vgsCss
    }
  },
  Debug: App.getUrlParameter("debug") == "true" ? true : false,
  
  onLoad: () => {
    (<any>window).DonationLightboxForm = DonationLightboxForm;
    new DonationLightboxForm(DonationAmount, DonationFrequency, App);
    customScript(App, EnForm);
  },
  onResize: () => App.log("Starter Theme Window Resized"),
};
new App(options);
