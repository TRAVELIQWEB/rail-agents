import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowDownToLine,
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileText,
  Globe,
  HelpCircle,
  Landmark,
  Mail,
  Phone,
  Radio,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";

const PAGE_SLUG = "irctc-principal-service-providers-updated-29-03-2025";
const PAGE_URL = `${siteConfig.url}/${PAGE_SLUG}`;
const OFFICIAL_PDF_HREF = "/irctc-authorised-principal-service-providers.pdf";
const CURRENT_IRCTC_PDF_HREF =
  "https://contents.irctc.co.in/en/IRCTC%20Authorised%20Principal%20Service%20Providers.pdf";

export const metadata: Metadata = {
  title: "IRCTC Principal Service Providers List (2025 Snapshot)",
  description:
    "Archived 29 March 2025 snapshot of IRCTC Principal Service Providers. Check the latest official IRCTC PDF for current provider listings and contact details.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "IRCTC Principal Service Providers List (2025 Snapshot) | RailAgents",
    description:
      "Browse an archived 29 March 2025 IRCTC provider directory snapshot. Follow the official IRCTC PDF for current listings and contacts.",
    url: PAGE_URL,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "article",
    images: [siteConfig.socialImage],
  },
  twitter: {
    card: "summary_large_image",
    title: "IRCTC Principal Service Providers List (2025 Snapshot) | RailAgents",
    description:
      "Archived IRCTC Principal Service Providers directory from 29 March 2025. Verify current provider listings with IRCTC's latest official PDF.",
    images: [siteConfig.socialImage],
  },
};

interface ProviderContactRow {
  sno: number;
  company: string;
  phone: string;
  email: string;
}

const b2bProviders: ProviderContactRow[] = [
  {
    sno: 1,
    company: "M/s Frequency Weekly Management Services, Delhi",
    phone: "9772424365",
    email: "support@fwmspl.com",
  },
  {
    sno: 2,
    company: "M/s Birdres Technologies P. Ltd., Delhi",
    phone: "9999094078, 0124-3073093",
    email: "manoj@birdres.com, gn@birdres.com",
  },
  {
    sno: 3,
    company: "M/s Ebix Travels Pvt Ltd., (VIA.COM), Bangalore",
    phone: "080-46414141",
    email: "care@via.com, railwaycell@via.com",
  },
  {
    sno: 4,
    company: "M/s Interactive Tradex India (P) Ltd. (ITIPL), Mumbai",
    phone: "022-61125757",
    email: "care@ebixcash.com",
  },
  {
    sno: 5,
    company: "M/s Jayaswal Enterprise P. Ltd., Ahmedabad",
    phone: "07961901100, 918866465566",
    email: "jagdish@aireo.in, vishal@aireo.in",
  },
  {
    sno: 6,
    company: "M/s Akbar Online Booking Co. Pvt. Ltd., Mumbai",
    phone: "9167251095, 704527536",
    email: "Raildata@akbartravelsonline.com",
  },
  {
    sno: 7,
    company: "M/s Pay Point India Network Private Limited, Mumbai",
    phone: "9987589259 / 022-28604343",
    email: "Naresh.rathod@paypointindia.com",
  },
  {
    sno: 8,
    company: "M/s RLTC Travel Pvt. Ltd., New Delhi",
    phone: "9643897492, 9643197492",
    email: "nitin.rltc@rlgroup.com, Rail.ggn@riya.travel",
  },
  {
    sno: 9,
    company: "M/s Simplyyatra Tour Travels Pvt. Ltd, Lucknow",
    phone: "8953982777",
    email: "ceo@simplyyatra.in, contactus@simplyyatra.in",
  },
  {
    sno: 10,
    company: "M/s Spice Money Limited, Noida",
    phone: "9136003023",
    email: "zagham.hussain@spicemoney.com",
  },
  {
    sno: 11,
    company: "M/s Payworld Digital Services Private Limited, Delhi",
    phone: "011-43758800 / 28753882",
    email: "preeti.sharma@payworldindia.com",
  },
  {
    sno: 12,
    company: "M/s TBO Tek Limited, Gurgaon",
    phone: "0124-4998999",
    email: "Railways@tbo.com",
  },
  {
    sno: 13,
    company: "M/s TSI Yatra Private Limited, Gurgaon",
    phone: "0120-6904820, 7838883264",
    email: "satyajit.mishra@tsi-yatra.com",
  },
  {
    sno: 14,
    company: "M/s Sunalpha Green Technologies Pvt. Ltd, Ahmedabad",
    phone: "9227079999, 9724000401",
    email: "railway@tripborn.com",
  },
  {
    sno: 15,
    company: "M/s Interactive Financial & Trading Services Pvt. Ltd. (IFTSPL), Mumbai",
    phone: "022-61125757",
    email: "care@ebixcash.com",
  },
  {
    sno: 16,
    company: "M/s RITCO Travels & Tours Pvt. Ltd, Jaipur",
    phone: "9350825876",
    email: "himanshu@transcorpint.com",
  },
  {
    sno: 17,
    company: "M/s Jai Steel Facilitation Pvt. Ltd., Delhi",
    phone: "7065222285",
    email: "Support_irctc@jaisteelfacilitation.com",
  },
  {
    sno: 18,
    company: "M/s Blue Star Air travel Services Pvt. Ltd., Mumbai",
    phone: "9819666668",
    email: "info@bookonbluestar.com",
  },
  {
    sno: 19,
    company: "M/s Easy Trip Planners Ltd, Delhi",
    phone: "011-43030303",
    email: "quality@easemytrip.com",
  },
  {
    sno: 20,
    company: "M/s Nearby Technology Pvt. Ltd., Mumbai",
    phone: "033-66909090",
    email: "travelsupport@paynearby.in",
  },
  {
    sno: 21,
    company: "M/s Sahaj Retail Ltd, Kolkata",
    phone: "7605014837",
    email: "IRCTCADMIN@Sahaj.co.in",
  },
  {
    sno: 22,
    company: "M/s Just Click Karo Services Pvt. Ltd., Delhi",
    phone: "9899005005",
    email: "admin@justclicktravels.com",
  },
  {
    sno: 23,
    company: "M/s Trip Jack Private Limited, Mumbai",
    phone: "8657738978",
    email: "madhusudhan.p@tripjack.com",
  },
  {
    sno: 24,
    company: "M/s Integra Micro Systems Pvt. Ltd. (IMSPL), Bangalore",
    phone: "22257027",
    email: "support@integramicro.com",
  },
  {
    sno: 25,
    company: "M/s Kafila Hospitality And Travels Private Limited, Delhi",
    phone: "011-45022249",
    email: "accounts@kafilatravel.com",
  },
  {
    sno: 26,
    company: "M/s Mos Utility Limited (Multilink), Mumbai",
    phone: "022-42383838",
    email: "info@multilinkworld.com",
  },
  {
    sno: 27,
    company: "M/s Alhind Tours & Travels P. Ltd, Delhi",
    phone: "8929014201",
    email: "delhi@alhindonline.com",
  },
  {
    sno: 28,
    company: "M/s Viand Research Private Limited, Ghaziabad",
    phone: "9650258747, 8851217534",
    email: "pradeep@tripmgt.com",
  },
  {
    sno: 29,
    company: "M/s ROINET Solution Pvt. Ltd., Gurgaon",
    phone: "1244154700, 9540055152",
    email: "contact@roinet.in",
  },
  {
    sno: 30,
    company: "M/s Neptune Travels India Pvt. Ltd, Bangalore",
    phone: "8287166555, 9686112984",
    email: "sksharma@neptunenext.com",
  },
  {
    sno: 31,
    company: "M/s Redmil Business Mall Private Limited, Noida",
    phone: "9151012248",
    email: "ojaswee.singh@redmil.in",
  },
  {
    sno: 32,
    company: "M/s Oxigen Services (India) Pvt. Ltd, Gurgaon",
    phone: "9953077077",
    email: "new@myoxigen.com",
  },
  {
    sno: 33,
    company: "M/s U&V Nexgen Exim Private Limited, Mumbai",
    phone: "8104339422",
    email: "anuragpandey1981@gmail.com",
  },
  {
    sno: 34,
    company: "M/s Richa World Travels, Ahmedabad, Gujarat",
    phone: "9825026299",
    email: "richatravels@yahoo.co.in",
  },
];

const icsProviders: ProviderContactRow[] = [
  {
    sno: 1,
    company: "M/s Frequency Weekly Management Services Pvt. Ltd., Delhi",
    phone: "9599550009",
    email: "support@saarthii.in",
  },
  {
    sno: 2,
    company: "M/s Webshlok Digital Services LLP, Gurgaon",
    phone: "9311950006",
    email: "info@webshlok.com, rajat.b@webshlok.com",
  },
  {
    sno: 3,
    company: "M/s GI Technology Private limited., Chennai",
    phone: "9500690514 / 044-42886000",
    email: "guna.g@hermes-it.in, irctc.support@gitechnology.in",
  },
  {
    sno: 4,
    company: "M/s Grameen Sanchar Society, Kolkata",
    phone: "9007885085, 033-23577075",
    email: "sdaschaudhuri@yahoo.co.in, Partha@praxissoftek.com",
  },
  {
    sno: 5,
    company: "M/s Make on Trips, Delhi",
    phone: "9015367279, 8076515415",
    email: "makeontrips@gmail.com",
  },
  {
    sno: 6,
    company: "M/s Interactive Tradex India (P) Ltd. (ITIPL), Mumbai",
    phone: "022-61125757",
    email: "care@ebixcash.com",
  },
  {
    sno: 7,
    company: "M/s Richa World Travels, Ahmedabad, Gujarat",
    phone: "9825026299, 9825326799",
    email: "richatravels@yahoo.co.in, jaymin@richaworldtravels.com",
  },
  {
    sno: 8,
    company: "M/s SC Infotech Pvt. Ltd, Delhi",
    phone: "9871777448",
    email: "info@scinfotech.com",
  },
  {
    sno: 9,
    company: "M/s Surabhi Travels, Kanpur",
    phone: "9026482028",
    email: "surabhitravels@live.com",
  },
  {
    sno: 10,
    company: "M/s Corequest Technologies Pvt Ltd, Hooghly",
    phone: "7050374082, 98755571333",
    email: "info@corequestsholidays.com, business@corequestsholidays.com",
  },
  {
    sno: 11,
    company: "M/s Ticket2Trip, New Delhi",
    phone: "9311640505 / 9311540505",
    email: "sunil.gautam@ticket2trip.in, info@ticket2trip.in",
  },
  {
    sno: 12,
    company: "M/s Quick E Solutions, New Delhi",
    phone: "011-65651977",
    email: "agent.airsamrat@gmail.com, agent@airsamrat.com",
  },
  {
    sno: 13,
    company: "M/s Dhanlaxmi Agencies, Mumbai",
    phone: "8898852222",
    email: "dhanlaxmiagencies64@gmail.com",
  },
  {
    sno: 14,
    company: "M/s Interactive Financial & Trading Services Pvt. Ltd. (IFTSPL), Mumbai",
    phone: "022-61125757",
    email: "care@ebixcash.com",
  },
  {
    sno: 15,
    company: "M/s Gayatri Travels, Assam",
    phone: "9435011700",
    email: "info@gayatritravels.in",
  },
  {
    sno: 16,
    company: "M/s Apptimate Software Pvt. Ltd., Odisha",
    phone: "09040019780, 09040017577",
    email: "admin@qubeinfosolutions.in",
  },
  {
    sno: 17,
    company: "M/s Flywidus.Com, Delhi",
    phone: "9911222666",
    email: "sevenseaz@flywidus.com",
  },
  {
    sno: 18,
    company: "M/s Aastha Travels, Meerut",
    phone: "9821561200, 8393004422",
    email: "careaasthatravels@gmail.com",
  },
  {
    sno: 19,
    company: "M/s RNFI Services Ltd., Delhi",
    phone: "011-45545350, 8470000012",
    email: "info@rnfiservices.com",
  },
  {
    sno: 20,
    company: "M/s Ezypay Online Services Pvt. Ltd., Asansol",
    phone: "9378440056, 9332997400",
    email: "support@ezypay.co.in",
  },
  {
    sno: 21,
    company: "M/s Equity Capital Advisors (India) Pvt. Ltd., Hyderabad",
    phone: "9513199983",
    email: "traveldesk@ecaps.in",
  },
  {
    sno: 22,
    company: "M/s Chennai Marcopia Travels Pvt. Ltd., Mumbai",
    phone: "076208 52969",
    email: "chennaimarcopia13@gmail.com",
  },
  {
    sno: 23,
    company: "M/s InstantPay India Limited, Delhi",
    phone: "011-40849944, 8125814414",
    email: "shailendra@instantpay.in, bops@instantpay.in",
  },
  {
    sno: 24,
    company: "M/s Fly Travel2Money Trek Private Limited, Delhi",
    phone: "011-41666554",
    email: "dilshad.ahmed@boomtravels.in",
  },
  {
    sno: 25,
    company: "M/s VS Travel Solutions, Meerut",
    phone: "7417001002 / 9319711717",
    email: "vstravelsolution@gmail.com",
  },
  {
    sno: 26,
    company: "M/s IPS E Services Private Limited, Mumbai",
    phone: "9324956397",
    email: "contact@ipsindia.co.in",
  },
  {
    sno: 27,
    company: "M/s DialMyTrip Tech Private Limited, Noida",
    phone: "0120-4151488, 9999354581",
    email: "help@dialmytrip.com",
  },
  {
    sno: 28,
    company: "M/s SI Online Technomart Pvt. Ltd., Ratlam",
    phone: "9425720753",
    email: "support@sionline.co.in",
  },
  {
    sno: 29,
    company: "M/s Apoorv Travels, Vadodara",
    phone: "9375072020, 9825072020",
    email: "apoorvtravels@gmail.com",
  },
  {
    sno: 30,
    company: "M/s Anupam Tour & Travels, Pvt. Ltd, Howrah",
    phone: "9883577816, 8100999727",
    email: "anupamtourandtravels@gmail.com",
  },
  {
    sno: 31,
    company: "M/s Travocare Worldwide Services Pvt. Ltd, Jammu",
    phone: "09419190628, 09018147979",
    email: "travocarejammu@gmail.com",
  },
  {
    sno: 32,
    company: "M/s Next Wave Travel & Trade Pvt. Ltd, Muzaffarpur, Bihar",
    phone: "8271716971, 9835864343",
    email: "admin@nextwavetravel.com",
  },
  {
    sno: 33,
    company: "M/s Appan Dukan Marketing & Services Pvt. Ltd, Mumbai",
    phone: "022-69595940",
    email: "adms.sales@gmail.com",
  },
  {
    sno: 34,
    company: "M/s Super Yatra Online Pvt. Ltd, Sikar",
    phone: "8824002020, 92144-55665",
    email: "info@superyatra.com",
  },
  {
    sno: 35,
    company: "M/s Prem Travels, Ludhiana",
    phone: "9653388000, 8360169301",
    email: "premtravelsldh@gmail.com",
  },
  {
    sno: 36,
    company: "M/s Krazy Trip, Guwahati",
    phone: "8811088992",
    email: "admin@krazytrip.com, rashid@krazytrip.com",
  },
  {
    sno: 37,
    company: "M/s Sarkar Travels, Mumbai",
    phone: "9820658477, 9869610454",
    email: "sarkartravels.parel@gmail.com",
  },
  {
    sno: 38,
    company: "M/s Trips King, Moradabad",
    phone: "9536615000, 9634980715",
    email: "support@tripsking.in",
  },
  {
    sno: 39,
    company: "M/s Religare Broking Ltd, Delhi",
    phone: "120-3391000, 011-46272400",
    email: "singh.harbhajan@religare.com",
  },
  {
    sno: 40,
    company: "M/s BLS E-Services Limited, Delhi",
    phone: "9619576633",
    email: "investors@blsinternational.net",
  },
  {
    sno: 41,
    company: "M/s Airtrips, Siliguri (West Bengal)",
    phone: "9609596096",
    email: "rail@airtripsonline.com, care@airtripsonline.com",
  },
  {
    sno: 42,
    company: "M/s Leisure & Lifestyle Global Services Pvt. Ltd, Noida",
    phone: "9871450349",
    email: "info@llgspl.in, llgspl2020@gmail.com",
  },
  {
    sno: 43,
    company: "M/s CGS Hospitality, Kolkata",
    phone: "+91 33 2529 5065, 9330900266",
    email: "mailtoanil8@gmail.com, anil@ktsclickworld.com",
  },
  {
    sno: 44,
    company: "M/s Mobisafar Services Private Limited, Ludhiana",
    phone: "9876713635",
    email: "care@mobisafar.com",
  },
  {
    sno: 45,
    company: "M/s Singla Enterprises, Ludhiana",
    phone: "9115112001",
    email: "admin@iflynpay.com",
  },
  {
    sno: 46,
    company: "M/s Book N Travel, Bhopal",
    phone: "7389908892",
    email: "bookntravelbpl@gmail.com",
  },
  {
    sno: 47,
    company: "M/s Peediakkal Agencies, Ernakulam Kerala",
    phone: "9037110110",
    email: "peediakkalagencies@yahoo.com",
  },
  {
    sno: 48,
    company: "M/s Roundpay Techno Media OPC P Ltd, Lucknow",
    phone: "0522-4069292",
    email: "support@roundpay.in, help@roundpay.in",
  },
  {
    sno: 49,
    company: "M/s U&V Nexgen Exim Private Limited, Mumbai",
    phone: "8104339422",
    email: "anuragpandey1981@gmail.com",
  },
  {
    sno: 50,
    company: "M/s Gandhi Services, Bareilly",
    phone: "7409717717",
    email: "gandhienterprises5@gmail.com",
  },
  {
    sno: 51,
    company: "M/s Upcurve Consumer Technologies Pvt. Ltd. (Udchalo) Pune",
    phone: "7499159789, 8208199634",
    email: "franchise@udchalo.com",
  },
  {
    sno: 52,
    company: "M/s Jasyatra Tours And Travels Private, Indore",
    phone: "07314795777",
    email: "sales@jasyatra.com, support@jasyatra.com",
  },
  {
    sno: 53,
    company: "M/s Viand Research Private Limited, Ghaziabad",
    phone: "9650258747, 8851217534",
    email: "pradeep@tripmgt.com",
  },
  {
    sno: 54,
    company: "M/s Rapipay Fintech Private Limited, Noida",
    phone: "7503245345",
    email: "ankur@rapipay.com",
  },
  {
    sno: 55,
    company: "M/s Isha Travels And Tours Pvt. Ltd, Delhi",
    phone: "9999757650",
    email: "ishatravel@yahoo.co.uk",
  },
  {
    sno: 56,
    company: "M/s Excel One Stop Solution Pvt. Ltd, Jodhpur",
    phone: "9214897703",
    email: "info@a2zsuvidhaa.com",
  },
  {
    sno: 57,
    company: "M/s Riseel Edugrow India Pvt. Ltd, Deoghar Jharkhand",
    phone: "7295816952, 6209303936",
    email: "abkvs123@gmail.com",
  },
  {
    sno: 58,
    company: "M/s Noble Web Studio Pvt. Ltd, Jaipur",
    phone: "7340019561, 7340019563",
    email: "ravi@noblewebstudio.com",
  },
  {
    sno: 59,
    company: "M/s Quicksun Technologies Pvt. Ltd., Gurgaon",
    phone: "9910779923",
    email: "ankur.gupta@quicksuntech.com, info@quicksuntech.com",
  },
  {
    sno: 60,
    company: "M/s AISECT Ltd., Bhopal",
    phone: "9111009112",
    email: "anilrawat@aisect.org, santonu@aisect.org",
  },
  {
    sno: 61,
    company: "M/s Mindsarray Network Pvt. Ltd, Maharashtra",
    phone: "8748946955",
    email: "railsupport@pay1.in",
  },
  {
    sno: 62,
    company: "M/s VK Venture Private Limited, Thane Maharashtra",
    phone: "9372612139",
    email: "vinay@biznext.in",
  },
  {
    sno: 63,
    company: "M/s Sec2Pay India E-Service Private Limited, Pune",
    phone: "9145157373",
    email: "support@indirail.in",
  },
  {
    sno: 64,
    company: "M/s Maddox Consultancy Services Private Limited, Delhi",
    phone: "9999026763",
    email: "niklank@maddox.co.in",
  },
  {
    sno: 65,
    company: "M/s Make My Trip India Private Limited, Gurgaon",
    phone: "7303335806",
    email: "Pawan.Chauhan@go-mmt.com",
  },
  {
    sno: 66,
    company: "M/s Encore Digitech Pvt. Ltd, Kolkata",
    phone: "9205177056",
    email: "jhasuman2007@gmail.com",
  },
  {
    sno: 67,
    company: "M/s Inbix Digital Pvt. Ltd, Lucknow",
    phone: "9651045666",
    email: "inbix.in@gmail.com",
  },
  {
    sno: 68,
    company: "M/s Jirawala Travels Private Limited, Ahmedabad",
    phone: "7922860799, 9998802711",
    email: "jirawalatravelspvtltd@gmail.com",
  },
  {
    sno: 69,
    company: "M/s Uselocator Advertising Private Limited, Bhopal",
    phone: "9200333344",
    email: "sanjay@uselocator.in",
  },
  {
    sno: 70,
    company: "M/s Quiick Yatra, Delhi",
    phone: "9650036716, 9999688375",
    email: "Sumit.sachdeva@quiickyatra.com",
  },
  {
    sno: 71,
    company: "M/s Stelling Technologies Pvt. Ltd., Noida",
    phone: "8590136938",
    email: "assistedbooking@railyatri.in",
  },
  {
    sno: 72,
    company: "M/s Travelink, Kolkata",
    phone: "9831112679",
    email: "travelinkrail@gmail.com",
  },
  {
    sno: 73,
    company: "M/s Mobifast Solutions Private Limited, Delhi",
    phone: "8447445497",
    email: "help@impsguru.com, preeti@impsguru.com",
  },
];

const b2cProviders: string[] = [
  "M/s. Swift Travel Solutions Private Limited, Bangalore (Confirm Tkt)",
  "M/s MakeMyTrip India Pvt. Ltd, Gurgaon (MMT)",
  "M/s Yatra Online Limited, Gurgaon (Yatra)",
  "M/s ICICI Bank Ltd., Mumbai (ICICI Bank)",
  "M/s One97 Communications Limited, Noida (Paytm)",
  "M/s Ibibo Group Pvt. Ltd., Gurgaon (Goibibo)",
  "M/s Le Travenues Technology Limited, Gurgaon (Ixigo)",
  "M/s Stark Enterprises Private Limited, Gurgaon (Trainman)",
  "M/s State Bank of India, Mumbai (SBI)",
  "M/s Easy Trip Planners Limited, Delhi (EaseMyTrip)",
  "M/s Stelling Technologies Private Limited, Noida (RailYatri)",
  "M/s Rewards 360° Global Services Private Limited, Bengaluru",
  "M/s Amazon Pay (India) Pvt. Ltd., Bangalore (Amazon)",
  "M/s Frost Interactive Private Limited, Mumbai (Railofy)",
  "M/s Airtel Payments Bank Limited, Gurgaon (Airtel)",
  "M/s Travel Path Private Limited, Bhopal (TripOzo)",
  "M/s Just Click Karo Services Private Limited, Delhi (Redbus)",
  "M/s Redbus India Private Limited, Bangalore (redRail)",
  "M/s Aeries Financial Technologies Private Limited, Mumbai",
  "M/s The Karur Vysya Bank Limited, Karur, Tamil Nadu",
  "M/s Prago Frequent Solutions Private Limited, Hyderabad",
  "M/s Remitap Payments Solutions Private Limited, Ernakulam, Kerala",
  "M/s Amazon Seller Services Private Limited, Bangalore",
  "M/s Bank of Baroda, Mumbai",
];

const g2gEntities: string[] = [
  "Controller General of Defense Accounts (CGDA)",
  "Central Reserve Police Force (CRPF)",
  "National Disaster Response Force (NDRF)",
  "Directorate General Assam Rifles",
  "Central Industrial Security Force (CISF)",
  "Border Security Force (BSF)",
  "National Security Guard (NSG)",
  "Indo-Tibetan Border Police (ITBP)",
  "India Post Payments Bank Limited (IPPB)",
];

const tiesEntities: string[] = [
  "M/s Google India Pvt. Ltd. (Where is My Train App)",
  "M/s Google India Pvt. Ltd. (Google Search)",
  "M/s Google India Pvt. Ltd. (Google Maps)",
  "M/s Guerrilla Infra Solutions Pvt. Ltd. (OYO)",
  "M/s Google India Pvt. Ltd. (Google Assistant)",
];

const overseasGsas: { name: string; location: string }[] = [
  { name: "M/s Global Holiday Co. Ltd.", location: "Bangkok, Thailand" },
  { name: "M/s President Travel & Tours P. Ltd.", location: "Kathmandu, Nepal" },
  { name: "M/s Global Union", location: "Safat, Kuwait" },
  { name: "M/s Cut Price Travels Pvt. Ltd.", location: "Dhaka, Bangladesh" },
  { name: "M/s Travel Center", location: "Dhaka, Bangladesh" },
  { name: "M/s Cross World Tours & Travels", location: "Dhaka, Bangladesh" },
  { name: "M/s Touch Sky Aviation Service", location: "Chittagong, Bangladesh" },
  { name: "M/s Be Fresh Limited", location: "Chittagong, Bangladesh" },
  { name: "M/s Air Speed Pvt. Ltd.", location: "Dhaka, Bangladesh" },
  { name: "M/s Saimon Overseas Ltd.", location: "Dhaka, Bangladesh" },
  { name: "M/svictory Travels Ltd.", location: "Sylhet, Bangladesh" },
  { name: "M/s International Travel Corporation", location: "Dhaka, Bangladesh" },
  { name: "M/s Journey Plus", location: "Dhaka, Bangladesh" },
  { name: "M/s24x7 Travel Services Pvt. Ltd.", location: "Kathmandu, Nepal" },
  { name: "M/s Lexpo International Limited", location: "Dhaka, Bangladesh" },
  { name: "M/s Dynamic Travels", location: "Dhaka, Bangladesh" },
  { name: "M/s Discovery Tours & Logistic", location: "Dhaka, Bangladesh" },
];

const eGovProviders: ProviderContactRow[] = [
  {
    sno: 1,
    company: "M/s CSC e-Governance Services India Ltd., New Delhi",
    phone: "011-49754923, 011-49754924",
    email: "SHdixit@csc.gov.in",
  },
  {
    sno: 2,
    company: "M/s Rajcomp Info Services Pvt. Ltd., Jaipur",
    phone: "0141-5103223 / 2224855",
    email: "helpdesk.emitra@rajasthan.gov.in",
  },
];

const summaryStats = [
  {
    count: "73",
    label: "ICS PSP Providers",
    sublabel: "Internet Cafe Scheme",
    href: "#ics-scheme",
  },
  {
    count: "34",
    label: "B2B Scheme Providers",
    sublabel: "Web Services / Portal PSPs",
    href: "#b2b-scheme",
  },
  {
    count: "25",
    label: "B2C Providers",
    sublabel: "Consumer Apps & Banks",
    href: "#b2c-scheme",
  },
  {
    count: "17",
    label: "GSAs Overseas",
    sublabel: "International Sales Agents",
    href: "#gsa-scheme",
  },
];

const sectionJumpLinks = [
  { label: "Official PDF", href: "#official-pdf" },
  { label: "1. B2B Providers (34)", href: "#b2b-scheme" },
  { label: "2. ICS Providers (73)", href: "#ics-scheme" },
  { label: "3. B2C Providers (25)", href: "#b2c-scheme" },
  { label: "4. G2G Scheme (9)", href: "#g2g-scheme" },
  { label: "5. TIES Scheme (5)", href: "#ties-scheme" },
  { label: "6. Overseas GSAs (17)", href: "#gsa-scheme" },
  { label: "7. E-Governance (2)", href: "#egov-scheme" },
];

function renderEmailLinks(emailField: string) {
  const parts = emailField
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return (
    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
      {parts.map((email, idx) => (
        <span key={email} className="inline-flex items-center">
          <a
            href={`mailto:${email}`}
            className="text-orange-700 hover:text-orange-800 hover:underline font-medium break-all transition-colors"
          >
            {email}
          </a>
          {idx < parts.length - 1 ? <span className="text-slate-400 ml-0.5">,</span> : null}
        </span>
      ))}
    </div>
  );
}

export default function IrctcPrincipalServiceProvidersPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteConfig.url,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "List of IRCTC Principal Service Providers (Updated 29-03-2025)",
        item: PAGE_URL,
      },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "List of IRCTC Principal Service Providers (Updated 29-03-2025)",
    description:
      "Complete reference directory of IRCTC Authorized Principal Service Providers (PSPs) across B2B, Internet Cafe Scheme (ICS), B2C, G2G, TIES, Overseas GSA, and E-Governance schemes.",
    url: PAGE_URL,
    dateModified: "2025-03-29",
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      url: siteConfig.url,
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F6] text-slate-900">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <Header />

      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#0B192C] pt-10 pb-28 md:pt-14 md:pb-32">
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero-station-bg.jpg"
              alt="IRCTC Principal Service Providers Directory"
              fill
              priority
              sizes="100vw"
              className="object-cover object-right md:object-center opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0B192C] via-[#0B192C]/92 to-[#0B192C]/65" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-transparent to-[#0B192C]/40" />
          </div>

          <div className="site-container relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-8">
                {/* Breadcrumb */}
                <nav
                  aria-label="Breadcrumb"
                  className="flex flex-wrap items-center gap-2 text-xs sm:text-sm font-medium text-slate-300/90 mb-5"
                >
                  <Link href="/" className="hover:text-white transition-colors">
                    Home
                  </Link>
                  <span className="text-slate-500">/</span>
                  <span className="text-orange-400">
                    List of IRCTC Principal Service Providers (Updated 29-03-2025)
                  </span>
                </nav>

                {/* Badge */}
                <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/35 bg-orange-500/15 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-300 mb-5">
                  <ShieldCheck className="h-3.5 w-3.5 text-orange-400" />
                  IRCTC Service Provider Directory • 2025 snapshot
                </div>

                {/* H1 Heading */}
                <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-extrabold tracking-tight text-white leading-[1.14] mb-5">
                  List Of IRCTC{" "}
                  <span className="text-[#F36B21]">Principal Service Providers</span>
                </h1>

                <p className="text-base sm:text-lg text-slate-200/90 leading-relaxed mb-8 max-w-2xl">
                  The following is a list of all the Principal Service Providers of IRCTC, together
                  with their available contact information across B2B, Internet Cafe Scheme (ICS),
                  B2C, G2G, TIES, Overseas GSAs, and E-Governance schemes.
                </p>

                <div className="mb-6 max-w-2xl rounded-xl border border-amber-200/30 bg-amber-950/25 p-4 text-sm leading-relaxed text-amber-50">
                  <p className="font-bold">This directory is an archived 29 March 2025 snapshot.</p>
                  <p className="mt-1 text-amber-100/90">
                    IRCTC has published a newer March 2026 provider PDF. Check it for current listings and contact details.
                  </p>
                  <a
                    href={CURRENT_IRCTC_PDF_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex min-h-10 items-center gap-1.5 font-bold text-white underline decoration-orange-300 underline-offset-4 hover:text-orange-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-300"
                  >
                    Open latest official IRCTC PDF <ExternalLink aria-hidden="true" className="h-4 w-4" />
                  </a>
                </div>

                {/* CTA & PDF Jump Actions */}
                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    href="/irctc-agent-registration"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F36B21] hover:bg-[#F36B21] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-950/30 transition-all"
                  >
                    Become an IRCTC Agent
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <a
                    href="#official-pdf"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 hover:bg-white/15 backdrop-blur-sm px-5 py-3.5 text-sm font-semibold text-white transition-all"
                  >
                    <FileText className="h-4 w-4 text-orange-400" />
                    Jump to Official PDF
                  </a>

                  <a
                    href={OFFICIAL_PDF_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/35 bg-orange-500/15 hover:bg-orange-500/25 px-5 py-3.5 text-sm font-semibold text-orange-200 transition-all"
                  >
                    View Official PDF
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Right Column Hero Summary Card */}
              <div className="lg:col-span-4">
                <div className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md p-6 text-white shadow-xl">
                  <div className="flex items-center justify-between border-b border-white/15 pb-3.5 mb-4">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/20 text-orange-400 border border-orange-400/30">
                        <FileText className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-wider text-orange-300">
                          Official Reference
                        </p>
                        <p className="text-sm font-extrabold text-white">
                          IRCTC PSP Master List
                        </p>
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                          2025 snapshot
                    </span>
                  </div>

                  <ul className="space-y-2.5 text-xs sm:text-sm text-slate-200 mb-5">
                    <li className="flex items-center justify-between py-1 border-b border-white/10">
                      <span className="text-slate-300">B2B Web Services PSPs</span>
                      <span className="font-bold text-white">34 Providers</span>
                    </li>
                    <li className="flex items-center justify-between py-1 border-b border-white/10">
                      <span className="text-slate-300">Internet Cafe Scheme (ICS)</span>
                      <span className="font-bold text-white">73 Providers</span>
                    </li>
                    <li className="flex items-center justify-between py-1 border-b border-white/10">
                      <span className="text-slate-300">B2C, G2G, TIES &amp; E-Gov</span>
                      <span className="font-bold text-white">41 Entities</span>
                    </li>
                    <li className="flex items-center justify-between py-1">
                      <span className="text-slate-300">Overseas GSAs</span>
                      <span className="font-bold text-white">17 Partners</span>
                    </li>
                  </ul>

                  <a
                    href={OFFICIAL_PDF_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-white text-[#0F2747] hover:bg-orange-50 px-4 py-2.5 text-xs sm:text-sm font-extrabold transition-colors"
                  >
                    <FileText className="h-4 w-4 text-[#F36B21]" />
                    Open Official IRCTC PDF
                    <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Overlapping Summary Stat Cards */}
        <section className="relative z-20 -mt-14 pb-6">
          <div className="site-container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {summaryStats.map((stat) => (
                <a
                  key={stat.label}
                  href={stat.href}
                  className="group bg-white rounded-2xl p-5 md:p-6 shadow-md hover:shadow-lg border border-slate-200/90 hover:border-orange-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="text-3xl md:text-4xl font-extrabold text-[#0F2747] group-hover:text-[#F36B21] transition-colors mb-1">
                      {stat.count}
                    </div>
                    <div className="text-xs md:text-sm font-bold text-slate-700 uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <span>{stat.sublabel}</span>
                    <span className="font-semibold text-[#F36B21] group-hover:translate-x-0.5 transition-transform">
                      Jump →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Section Jump Bar */}
        <section className="py-3">
          <div className="site-container">
            <div className="rounded-2xl bg-white border border-slate-200/90 px-4 py-3 shadow-xs flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
                Quick Jump:
              </span>
              {sectionJumpLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                    item.href === "#official-pdf"
                      ? "bg-orange-50 text-[#F36B21] border border-orange-200 hover:bg-orange-100"
                      : "bg-slate-50 text-slate-700 border border-slate-200/70 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {item.href === "#official-pdf" ? <FileText className="h-3.5 w-3.5" /> : null}
                  {item.label}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Directory Overview & Official PDF Jump Section */}
        <section className="py-8 md:py-10">
          <div className="site-container">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 md:p-10 shadow-xs">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Directory Explanation */}
                <div className="lg:col-span-7">
                  <span className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#F36B21]">
                    <Building2 className="h-3.5 w-3.5" />
                    Directory Overview
                  </span>
                  <h2 className="mt-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                    IRCTC Authorized Service Providers (Agents) Directory
                  </h2>
                  <p className="mt-4 text-base leading-relaxed text-slate-600">
                    Because IRCTC does not appoint individual retail agents directly, anyone wishing
                    to operate as an authorized railway ticket booking agent must register through an
                    empaneled{" "}
                    <strong className="font-semibold text-slate-900">
                      Principal Service Provider (PSP)
                    </strong>
                    . These companies are authorized by IRCTC to onboard retail agents, verify KYC
                    documents, issue hardware/software credentials, and provide booking and compliance
                    support.
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">
                    Use the categorized tables below to review authorized providers under the{" "}
                    <strong className="font-semibold text-slate-800">B2B Web Services Scheme</strong>{" "}
                    and{" "}
                    <strong className="font-semibold text-slate-800">
                      Internet Cafe Scheme (ICS)
                    </strong>
                    , or inspect the official IRCTC reference PDF directly.
                  </p>
                  <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-medium text-slate-600 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>
                      Updated reference snapshot (29-03-2025) • Verify current details through
                      official IRCTC notices before applying
                    </span>
                  </div>
                </div>

                {/* Right Column: Official PDF Jump Target (#official-pdf) */}
                <div
                  id="official-pdf"
                  className="lg:col-span-5 scroll-mt-28 rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50/70 via-white to-amber-50/40 p-6 shadow-xs"
                >
                  <div className="inline-flex items-center gap-2 rounded-lg bg-orange-100/80 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#F36B21]">
                    <FileText className="h-3.5 w-3.5" />
                    Reference Document
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold text-slate-900">
                    IRCTC Principal Service Providers PDF (Updated 29-03-2025)
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    View or download the official IRCTC Principal Service Providers PDF snapshot
                    containing the scheme-wise list of authorized PSPs and admin contact details.
                  </p>

                  <div className="mt-5 flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-3">
                    <a
                      href={OFFICIAL_PDF_HREF}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#F36B21] hover:bg-[#B84307] px-4 py-3 text-sm font-bold text-white shadow-xs transition-colors"
                    >
                      View Source PDF
                      <ExternalLink className="h-4 w-4" />
                    </a>
                    <a
                      href={OFFICIAL_PDF_HREF}
                      download="IRCTC-Authorised-Principal-Service-Providers-29-03-2025.pdf"
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-800 transition-colors"
                    >
                      <ArrowDownToLine className="h-4 w-4 text-slate-600" />
                      Download PDF
                    </a>
                  </div>

                  <p className="mt-3 text-xs text-slate-500">
                    Opens in a new browser tab or downloads directly for offline verification.
                  </p>
                </div>
              </div>

              {/* 4 Key Guidance Cards */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-slate-200/90 bg-[#FBF9F6] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F36B21]">
                    What a PSP does
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900">
                    Bridges IRCTC and retail booking agents
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Principal Service Providers handle agent KYC verification, digital certificate /
                    dongle or OTP authentication setup, wallet top-ups, and day-to-day technical
                    support for authorized railway ticket booking.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-[#FBF9F6] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F36B21]">
                    Why selection matters
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900">
                    Affects onboarding speed and daily operations
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    The PSP you choose determines your portal usability, wallet settlement speed,
                    renewal charges, and helpdesk responsiveness when handling cancellations or TDR
                    filings.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-[#FBF9F6] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F36B21]">
                    How to verify
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900">
                    Cross-check company name and scheme category
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Always confirm that the company onboarding you is listed under the B2B or ICS
                    scheme in the official IRCTC directory, and verify all fee breakdowns in writing
                    before paying registration charges.
                  </p>
                </div>

                <div className="rounded-2xl border border-slate-200/90 bg-[#FBF9F6] p-5">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#F36B21]">
                    RailAgents’ role
                  </div>
                  <h3 className="mt-1.5 text-base font-bold text-slate-900">
                    Independent guidance, rules & railway tools
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    Explore our{" "}
                    <Link
                      href="/irctc-agent-registration"
                      className="font-semibold text-[#F36B21] hover:underline"
                    >
                      IRCTC Agent Registration & Compliance Guide
                    </Link>
                    ,{" "}
                    <Link
                      href="/guides/become-irctc-agent"
                      className="font-semibold text-[#F36B21] hover:underline"
                    >
                      Step-by-Step Onboarding Guide
                    </Link>
                    , or{" "}
                    <Link
                      href="/ask-nihal"
                      className="font-semibold text-[#F36B21] hover:underline"
                    >
                      Ask Nihal Singh
                    </Link>{" "}
                    for practical clarity on rules and agent operations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Directory Sections */}
        <section className="py-8 md:py-12">
          <div className="site-container space-y-16">
            {/* 1. B2B Principal Service Providers */}
            <div id="b2b-scheme" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#F36B21] shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      1. List of B2B Principal Service Providers
                    </h2>
                    <p className="text-sm text-slate-500">
                      Authorized B2B Web Services / Portal Scheme Providers (34 Entities)
                    </p>
                  </div>
                </div>
                <a
                  href="#official-pdf"
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:text-[#F36B21] transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#F36B21]" />
                  Jump to Official PDF
                </a>
              </div>

              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-5 font-semibold w-16">S.No</th>
                        <th className="py-3.5 px-5 font-semibold">Company Name &amp; City</th>
                        <th className="py-3.5 px-5 font-semibold">Admin Contact Details</th>
                        <th className="py-3.5 px-5 font-semibold">Admin Email Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {b2bProviders.map((row) => (
                        <tr
                          key={row.sno}
                          className="hover:bg-orange-50/40 transition-colors"
                        >
                          <td className="py-3.5 px-5 font-semibold text-slate-500">
                            {row.sno}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-slate-900">
                            {row.company}
                          </td>
                          <td className="py-3.5 px-5 text-slate-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {row.phone}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-start gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-1" />
                              {renderEmailLinks(row.email)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 2. Internet Cafe Scheme (ICS) Principal Service Providers */}
            <div id="ics-scheme" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#F36B21] shrink-0">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      2. List of Internet Cafe Scheme (ICS) Principal Service Providers
                    </h2>
                    <p className="text-sm text-slate-500">
                      Authorized Internet Cafe Scheme (ICS) Providers ({icsProviders.length} Entities)
                    </p>
                  </div>
                </div>
                <a
                  href="#official-pdf"
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:text-[#F36B21] transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#F36B21]" />
                  Jump to Official PDF
                </a>
              </div>

              <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white text-xs uppercase tracking-wider">
                        <th className="py-3.5 px-5 font-semibold w-16">S.No</th>
                        <th className="py-3.5 px-5 font-semibold">Company Name &amp; City</th>
                        <th className="py-3.5 px-5 font-semibold">Admin Contact Details</th>
                        <th className="py-3.5 px-5 font-semibold">Admin Email Address</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {icsProviders.map((row) => (
                        <tr
                          key={row.sno}
                          className="hover:bg-orange-50/40 transition-colors"
                        >
                          <td className="py-3.5 px-5 font-semibold text-slate-500">
                            {row.sno}
                          </td>
                          <td className="py-3.5 px-5 font-semibold text-slate-900">
                            {row.company}
                          </td>
                          <td className="py-3.5 px-5 text-slate-700 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              {row.phone}
                            </span>
                          </td>
                          <td className="py-3.5 px-5">
                            <div className="flex items-start gap-1.5">
                              <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-1" />
                              {renderEmailLinks(row.email)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* 3. B2C Principal Service Providers */}
            <div id="b2c-scheme" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#F36B21] shrink-0">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      3. B2C Principal Service Providers
                    </h2>
                    <p className="text-sm text-slate-500">
                      Business-to-Consumer Apps, OTAs &amp; Banking Platforms
                    </p>
                  </div>
                </div>
                <a
                  href="#official-pdf"
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:text-[#F36B21] transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#F36B21]" />
                  Jump to Official PDF
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {b2cProviders.map((provider, idx) => (
                  <div
                    key={provider}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3 hover:border-orange-300 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200/70 flex items-center justify-center text-[#F36B21] font-bold text-xs shrink-0">
                      {idx + 1}
                    </div>
                    <span className="text-slate-800 font-medium text-sm">{provider}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. G2G Scheme & 5. TIES Scheme */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 4. G2G Scheme */}
              <div id="g2g-scheme" className="scroll-mt-28">
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-200">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#F36B21] shrink-0">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      4. G2G Scheme (Government to Government)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Authorized Government &amp; Defense Organizations (9 Entities)
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
                  {g2gEntities.map((entity, idx) => (
                    <div
                      key={entity}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60"
                    >
                      <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium text-sm">{entity}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 5. TIES Scheme */}
              <div id="ties-scheme" className="scroll-mt-28">
                <div className="flex items-center gap-3.5 mb-6 pb-4 border-b border-slate-200">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#F36B21] shrink-0">
                    <Radio className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">
                      5. TIES Scheme (Train Information Enquiry Service)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Authorized Train Enquiry Information Partners (5 Entities)
                    </p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-2.5">
                  {tiesEntities.map((entity, idx) => (
                    <div
                      key={entity}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/60"
                    >
                      <span className="w-6 h-6 rounded-full bg-[#F36B21] text-white text-xs flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </span>
                      <span className="text-slate-800 font-medium text-sm">{entity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 6. GSAs Abroad - Internet Cafe Scheme */}
            <div id="gsa-scheme" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#F36B21] shrink-0">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      6. GSAs Abroad - Internet Cafe Scheme
                    </h2>
                    <p className="text-sm text-slate-500">
                      Authorized Overseas General Sales Agents (17 Entities)
                    </p>
                  </div>
                </div>
                <a
                  href="#official-pdf"
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:text-[#F36B21] transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#F36B21]" />
                  Jump to Official PDF
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {overseasGsas.map((gsa, idx) => (
                  <div
                    key={`${gsa.name}-${idx}`}
                    className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-start gap-3 hover:border-orange-300 transition-colors"
                  >
                    <Globe className="h-5 w-5 text-[#F36B21] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-slate-900 font-bold text-sm">{gsa.name}</div>
                      <div className="text-slate-500 text-xs mt-0.5">{gsa.location}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 7. E-Governance Scheme Working PSPs */}
            <div id="egov-scheme" className="scroll-mt-28">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
                <div className="flex items-center gap-3.5">
                  <div className="w-11 h-11 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-[#F36B21] shrink-0">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                      7. E-Governance Scheme Working PSPs
                    </h2>
                    <p className="text-sm text-slate-500">
                      Citizen Service Center &amp; State E-Governance Partners (2 Entities)
                    </p>
                  </div>
                </div>
                <a
                  href="#official-pdf"
                  className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-orange-300 hover:text-[#F36B21] transition-colors"
                >
                  <FileText className="h-3.5 w-3.5 text-[#F36B21]" />
                  Jump to Official PDF
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {eGovProviders.map((provider) => (
                  <div
                    key={provider.sno}
                    className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs"
                  >
                    <div className="inline-flex items-center gap-1.5 rounded-md bg-orange-50 px-2.5 py-1 text-xs font-bold text-[#F36B21] mb-3">
                      E-Governance Partner #{provider.sno}
                    </div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">{provider.company}</h3>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                        <span>{provider.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                        {renderEmailLinks(provider.email)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-12 md:py-16">
          <div className="site-container">
            <div className="rounded-3xl bg-slate-900 text-white p-8 md:p-12 shadow-xl relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/15 border border-orange-400/30 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-orange-300 mb-4">
                  <HelpCircle className="h-3.5 w-3.5 text-orange-400" />
                  Practical Railway Agent Guidance
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-3">
                  Need Help Understanding IRCTC Agent Registration &amp; Rules?
                </h2>
                <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-7">
                  Learn how authorized PSP onboarding works, documents required for KYC,
                  permissible service charges, Tatkal booking timings, and cancellation OTP
                  compliance before you apply.
                </p>
                <div className="flex flex-wrap items-center gap-3.5">
                  <Link
                    href="/irctc-agent-registration"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F36B21] hover:bg-[#B84307] px-6 py-3.5 text-sm font-bold text-white transition-colors"
                  >
                    IRCTC Agent Registration Guide
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/ask-nihal"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 hover:bg-white/15 px-5 py-3.5 text-sm font-semibold text-white transition-colors"
                  >
                    Ask Nihal Singh
                  </Link>
                  <a
                    href={OFFICIAL_PDF_HREF}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-400/30 bg-orange-500/10 hover:bg-orange-500/20 px-5 py-3.5 text-sm font-semibold text-orange-200 transition-colors"
                  >
                    Open Official PSP PDF
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

