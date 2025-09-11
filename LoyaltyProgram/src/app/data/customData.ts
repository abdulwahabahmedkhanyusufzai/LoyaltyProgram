const navItems = [
  { name: "Waro", icon: "/waro-off.png", icon2: "/waro_on.png", path: "/waro" },
  { name: "Analytics", icon: "/analytics-off.png", icon2: "/analytics-on.png", path: "/analytics" },
  { name: "View the loyalty program", icon: "/viewloyaltyoff.png", icon2: "/viewloyaltyon.png", path: "/loyalty-program" },
  { name: "View the list of loyal customers", icon: "/loyal-customers-off.png", icon2: "/loyal-customers-on.png", path: "/loyal-customers" },
  { name: "Add or remove a loyal customer", icon: "/addorremoveloyal.png", icon2: "/addorremoveloyal-on.png", path: "/add-remove-loyal" },
  { name: "Send an email", icon: "/email.png", icon2: "/email-on.png", path: "/send-email" },
  { name: "Advent calendar", icon: "/calendar.png", icon2: "/calendar-on.png", path: "/calendar" },
];
const CustomerEmailData = [
    { name: "Lorem Ipsum", email: "johanne@yahoo.com", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "shleysyze@hotmail.com", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "nath.zolo@free.fr", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "christian_leveque@orange.fr", lastOrder: "-", points: "0 points", purchases: "€0.0", title: "Welcomed" },
    { name: "Lorem Ipsum", email: "maryse.guivarch@gmail.com", lastOrder: "03.11.2024", points: "4 points", purchases: "€48.9", title: "Welcomed" },
];
const tiers = [
  { label: "Welcomed: Less than 20 points", color: "#734A00" },
  { label: "Guest: Between 20 and 30 points", color: "#B47A11" },
  { label: "Host: Between 31 and 4500 points", color: "#402A00" },
  { label: "Test: More than 4500 points", color: "#384551" },
];
const rows = [
  {
    label: "Cashback per point",
    values: ["10 points = €10", "10 points = €10", "10 points = €13", "-"],
  },
  {
    label: "Free Delivery",
    values: [
      "From €400 spent over 2 years",
      "From €400 spent over 2 years",
      "From €400 spent over 2 years",
      "-",
    ],
  },
  {
    label: "Immediate Discount",
    values: [
      "5% on the first order",
      "10% cumulative",
      "15% + priority access",
      "-",
    ],
  },
  {
    label: "Product Suggestions",
    values: [
      "Offer suggestion if purchasing from category X",
      "Offer suggestion if purchasing from one or more categories",
      "Offer of your choice if purchasing from one or more categories",
      "-",
    ],
  },
  {
    label: "Loyalty Offer",
    values: ["No", "5% on the 3rd order", "5% on the 3rd order", "-"],
  },
  {
    label: "Birthday Offer",
    values: [
      "15% on the order of your choice (valid 45 days)",
      "15% on the order of your choice (valid 45 days)",
      "15% on the order of your choice (valid 45 days)",
      "-",
    ],
  },
];
const LoyalCustomer = [{
      name: "Lorem Ipsum",
      email: "johanne@yahoo.com",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "shleysyze@hotmail.com",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "nath.zolo@free.fr",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "christian_leveque@orange.fr",
      lastOrder: "-",
      points: "0 points",
      purchases: "€0.0",
      title: "Welcomed",
    },
    {
      name: "Lorem Ipsum",
      email: "maryse.guivarch@gmail.com",
      lastOrder: "03.11.2024",
      points: "4 points",
      purchases: "€48.9",
      title: "Welcomed",
    },
  ]
const products = [
  { src: 'grainbag.png', alt: 'Grain Bag' },
  { src: 'towel.png', alt: 'Towel' },
  { src: 'shawl.png', alt: 'Shawl' },
  { src: 'towel.png', alt: 'Towel' }, // duplicate if needed
];
 const LoyaltyTableCustomers = [
    { id: 1, name: "Zeke Arton", img: "tableimg1.png", points: 539, orders: "$3430.05" },
    { id: 2, name: "Zed Rawe", img: "tableimg2.png", points: 473, orders: "$5218.22" },
    { id: 3, name: "Yank Luddy", img: "Background.png", points: 462, orders: "$9157.04" },
    { id: 4, name: "Yank Luddy", img: "Background.png", points: 462, orders: "$9157.04" },
    { id: 5, name: "Yank Luddy", img: "Background.png", points: 462, orders: "$9157.04" },
    { id: 6, name: "Yank Luddy", img: "Background.png", points: 462, orders: "$9157.04" },
    { id: 7, name: "Yank Luddy", img: "Background.png", points: 462, orders: "$9157.04" },
  ];
  const bottomItems = [
  { name: "Account Settings", icon: "/calendar.png", icon2: "/calendar-on.png", path: "/account-settings" },
  { name: "Logout", icon: "/logout-off.png", icon2: "/logout-off.png", path: "/logout" },
];
const rewards = [
  { count: "2", label: "10% OFF" },
  { count: "4", label: "15% OFF" },
  { count: "6", label: "20% OFF" },
];
const offers = [
  {
    src: 'coins.jpg',
    alt: 'Cashback per point',
    title: 'Cashback per point',
    desc: 'Euro 10 = 01 Point',
  },
  {
    src: 'birthday.jpg',
    alt: 'Birthday Offer',
    title: 'Birthday Offer',
    desc: '15% on the order',
  },
  {
    src: 'loyaltyoffers.jpg',
    alt: 'Loyalty Offer',
    title: 'Loyalty Offer',
    desc: '5% on the 3rd order',
  },
];
const LotaltyProgramCustomers = [
    
    { src: "profile.jpg", name: "Emily Mark", email: "Emilymark@mail.com" },
    { src: "christopher.jpg", name: "Christopher", email: "Christopher@mail.com" },
    { src: "zeyanda.jpg", name: "Zeyenda", email: "Zeyenda@mail.com" },
 
];

const CustomersUsageChartData = [
  { date: "Jun 01 2025", customers: 120000 },
  { date: "Jun 08 2025", customers: 60000 },
  { date: "Jun 15 2025", customers: 95000 },
  { date: "Jun 22 2025", customers: 85000 },
  { date: "Jun 29 2025", customers: 20000 },
];

const PieChartData= [
  { name: "Active Users", value: 85 },
  { name: "Inactive Users", value: 15 },
];
export  {PieChartData,CustomersUsageChartData,CustomerEmailData,tiers,rows,LoyalCustomer,products,LoyaltyTableCustomers,navItems,bottomItems,rewards,offers,LotaltyProgramCustomers};