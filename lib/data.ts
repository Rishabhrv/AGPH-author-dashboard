// Shared mock data for the Intelly dashboard recreation.

export type NavItem = {
  label: string;
  href: string;
  icon: string;
};

export const generalNav: NavItem[] = [
  { label: "Dashboard", href: "/", icon: "dashboard" },
  { label: "Schedule", href: "/schedule", icon: "schedule" },
  { label: "Patients", href: "/patients", icon: "patients" },
  { label: "Statistics & reports", href: "/statistics", icon: "statistics" },
  { label: "Education", href: "/education", icon: "education" },
  { label: "My articles", href: "/articles", icon: "articles" },
];

export const toolsNav: NavItem[] = [
  { label: "Chats & calls", href: "/chats", icon: "chats" },
  { label: "Billing", href: "/billing", icon: "billing" },
  { label: "Documents base", href: "/documents", icon: "documents" },
  { label: "Settings", href: "/settings", icon: "settings" },
];


// ---------- Dashboard (home) ----------

export const visitsSummary = [
  { time: "10:30", minutes: 12 },
  { time: "11:00", minutes: 18 },
  { time: "11:30", minutes: 15 },
  { time: "12:00", minutes: 24 },
  { time: "12:30", minutes: 20 },
  { time: "13:00", minutes: 16 },
  { time: "13:30", minutes: 22 },
];

export const patientsByAge = [
  { label: "22-32 Y.O", value: 14 },
  { label: "32-45 Y.O", value: 5 },
  { label: "45+ Y.O", value: 2 },
];

export const conditionBreakdown = [
  { label: "Stable", value: 14, color: "#4E6B2F" },
  { label: "Fair", value: 5, color: "#8FAE63" },
  { label: "Critical", value: 1, color: "#D8E6C4" },
];

export const patientsList = [
  {
    id: "1EG4-TES-MK72",
    name: "Taigo Wilkinson",
    type: "Emergency Visit",
    time: "09:15 AM",
    avatarColor: "bg-pink-soft",
    gender: "Male",
    age: "38 Years 5 Months",
    lastChecked: "Dr Everly on 21 April 2021",
    prescriptionId: "#2J9B3KT0",
    observation: "High fever and cough at normal hemoglobin levels.",
    tags: ["Fever", "Cough", "Heart Burn"],
    prescription: ["Paracetamol - 2 times a day", "Diazepam - Day and Night before meal"],
  },
  {
    id: "2",
    name: "Samantha Williams",
    type: "Routine Check-Up",
    time: "09:15 AM",
    avatarColor: "bg-blue-soft",
  },
  {
    id: "3",
    name: "Amy White",
    type: "Video Consultation",
    time: "09:15 AM",
    avatarColor: "bg-pink-soft",
  },
  {
    id: "4",
    name: "Tyler Young",
    type: "Report",
    time: "09:45 AM",
    avatarColor: "bg-sage-soft",
  },
];

export const calendarEvents = [
  {
    time: "07:00",
    duration: "07:00 - 07:30",
    title: "Emergency visit",
    location: "West camp, Room 312",
    color: "bg-pink-soft",
  },
  {
    time: "07:30",
    duration: "07:30 - 07:55",
    title: "Diagnostic test",
    location: "East camp, Laboratory floor 5",
    color: "bg-blue-soft",
  },
  {
    time: "08:00",
    duration: "08:00 - 08:30",
    title: "Team daily planning",
    location: "East camp, Room 200",
    color: "bg-yellow-soft",
    participants: ["TK", "AB", "TY", "SS"],
    participantsExtra: 3,
  },
  {
    time: "09:00",
    duration: "—",
    title: "Emergency visit",
    location: "West camp, Room 312",
    color: "bg-pink-soft",
  },
];

// ---------- Billing ----------

export const waitingForBills = [
  {
    name: "Samantha Williams",
    detail: "12KL - Routine Check-Up",
    time: "09 : 15 AM",
    avatarColor: "bg-pink-soft",
    icon: "heart",
  },
  {
    name: "Amy White",
    detail: "1200 - Video Consultation",
    time: "09 : 45 AM",
    avatarColor: "bg-blue-soft",
    icon: "video",
  },
];

export const latestTransactions = [
  { id: "#3586895", payer: "121177 GEICO", note: "IntellyMed", amount: "+ $568.56", time: "15 min ago" },
  { id: "#1244657", payer: "Wilkinson T.", note: "24285 Dr.Olivia Ave, Suite 4567", amount: "+ $465.4", time: "15 min ago" },
  { id: "#5476856", payer: "121177 GEICO", note: "324343 IntellyMed", amount: "+ $465.4", time: "15 min ago" },
];

export const billingStats = [
  { label: "Payments received", value: "$ 14,568", change: "+13%", trend: "up", note: "Total receipts value", color: "bg-pink-soft" },
  { label: "Payments requested", value: "$ 6,234", change: "-6%", trend: "down", note: "Total waiting payments value", color: "bg-blue-soft" },
  { label: "Non insurance payments", value: "$ 3,786", change: "-17%", trend: "down", note: "Total value of non covered by insurance payments", color: "bg-yellow-soft" },
];

export const transactionTabs = ["All", "Telemedicine", "In clinic", "Insurance"];

export const transactions = [
  { type: "Telemedicine", sendDate: "12/12/24", name: "Rachel Mayers", amount: "$345.55", recipient: "123456 American Family Insurance", dueDate: "12/12/24", status: "Requested" },
  { type: "In clinic", sendDate: "12/12/24", name: "Samantha Williams", amount: "$345.55", recipient: "Samantha Williams", dueDate: "-", status: "Paid" },
  { type: "Insurance", sendDate: "12/12/24", name: "Amy White", amount: "$345.55", recipient: "323324 GEICO", dueDate: "-", status: "Sent" },
  { type: "In clinic", sendDate: "12/12/24", name: "Tyler Young", amount: "$345.55", recipient: "Tyler Young", dueDate: "12/12/24", status: "Paid" },
  { type: "In clinic", sendDate: "12/12/24", name: "Amy White", amount: "$345.55", recipient: "123456 GEICO", dueDate: "12/12/24", status: "Paid" },
  { type: "Telemedicine", sendDate: "12/12/24", name: "Rachel Mayers", amount: "$345.55", recipient: "123456 American Family Insurance", dueDate: "-", status: "Requested" },
  { type: "Insurance", sendDate: "12/12/24", name: "Amy White", amount: "$345.55", recipient: "323324 GEICO", dueDate: "12/12/24", status: "Paid" },
] as const;

export type Transaction = (typeof transactions)[number];
