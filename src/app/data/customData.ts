export function useNavData(t: (key: string) => string) {
  const navItems = [
    {
      name: t("waro"),
      icon: "/waro-off.png",
      icon2: "/waro_on.png",
      path: "/waro",
    },
    {
      name: t("analytics"),
      icon: "/analytics-off.png",
      icon2: "/analytics-on.png",
      path: "/analytics",
    },
    {
      name: t("viewLoyaltyProgram"),
      icon: "/viewloyaltyoff.png",
      icon2: "/viewloyaltyon.png",
      path: "/loyalty-program",
    },
    {
      name: t("viewLoyalCustomers"),
      icon: "/loyal-customers-off.png",
      icon2: "/loyal-customers-on.png",
      path: "/loyal-customers",
    },
    {
      name: t("addRemoveLoyal"),
      icon: "/addorremoveloyal.png",
      icon2: "/addorremoveloyal-on.png",
      path: "/add-remove-loyal",
    },
    {
      name: t("sendEmail"),
      icon: "/email.png",
      icon2: "/email-on.png",
      path: "/send-email",
    },
    {
      name: t("adventCalendar"),
      icon: "/calendar.png",
      icon2: "/calendar-on.png",
      path: "/calendar",
    },
  ];
  const CustomerEmailData = [
    {
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
  ];

  
 
  const products = [
    { src: "grainbag.png", alt: "Grain Bag" },
    { src: "towel.png", alt: "Towel" },
    { src: "shawl.png", alt: "Shawl" },
    { src: "towel.png", alt: "Towel" }, // duplicate if needed
  ];
  const LoyaltyTableCustomers = [
    {
      id: 1,
      name: "Zeke Arton",
      img: "tableimg1.png",
      points: 539,
      orders: "$3430.05",
    },
    {
      id: 2,
      name: "Zed Rawe",
      img: "tableimg2.png",
      points: 473,
      orders: "$5218.22",
    },
    {
      id: 3,
      name: "Yank Luddy",
      img: "Background.png",
      points: 462,
      orders: "$9157.04",
    },
    {
      id: 4,
      name: "Yank Luddy",
      img: "Background.png",
      points: 462,
      orders: "$9157.04",
    },
    {
      id: 5,
      name: "Yank Luddy",
      img: "Background.png",
      points: 462,
      orders: "$9157.04",
    },
    {
      id: 6,
      name: "Yank Luddy",
      img: "Background.png",
      points: 462,
      orders: "$9157.04",
    },
    {
      id: 7,
      name: "Yank Luddy",
      img: "Background.png",
      points: 462,
      orders: "$9157.04",
    },
  ];
  const bottomItems = [
    {
      name: t("bottom.accountSettings"),
      icon: "/calendar.png",
      icon2: "/calendar-on.png",
      path: "/account-settings",
    },
    {
      name: t("bottom.logout"),
      icon: "/logout-off.png",
      icon2: "/logout-off.png",
      path: "/logout",
    },
  ];
  const rewards = [
    { count: "2", label: "10% OFF" },
    { count: "4", label: "15% OFF" },
    { count: "6", label: "20% OFF" },
  ];

  const LotaltyProgramCustomers = [
    { src: "profile.jpg", name: "Emily Mark", email: "Emilymark@mail.com" },
    {
      src: "christopher.jpg",
      name: "Christopher",
      email: "Christopher@mail.com",
    },
    { src: "zeyanda.jpg", name: "Zeyenda", email: "Zeyenda@mail.com" },
  ];

  const CustomersUsageChartData = [
    { date: "Jun 01 2025", customers: 120000 },
    { date: "Jun 08 2025", customers: 60000 },
    { date: "Jun 15 2025", customers: 95000 },
    { date: "Jun 22 2025", customers: 85000 },
    { date: "Jun 29 2025", customers: 20000 },
  ];

  const PieChartData = [
    { name: "Active Users", value: 85 },
    { name: "Inactive Users", value: 15 },
  ];

  const initialForm = {
    fullName: "",
    email: "",
    phone: "",
    currentPassword: "",
    password: "",
    confirmPassword: "",
    confirmNewPassword: "",
    tier: "",
    points: "",
    expiry: "",
    profilePic: "",
    notifications: {
      systemAlerts: false,
      notifications: false,
      weeklyReports: false,
    },
    language: "English",
  };

  // data/customData.ts
  const formSections = {
    personal: {
      title: t("personalDetails"),
      fields: [
        { type: "text", name: "fullName", label: t("fullName") },
        { type: "email", name: "email", label: t("emailAddress") },
        { type: "tel", name: "phone", label: t("phoneNumber") },
      ],
    },
    security: {
      title: t("security"),
      fields: [
        {
          type: "password",
          name: "password",
          label: t("currentPassword"),
        },
        {
          type: "password",
          name: "confirmPassword",
          label: t("newPassword"),
        },
        {
          type: "password",
          name: "confirmNewPassword",
          label: t("confirmNewPassword"),
        },
      ],
    },
    notifications: {
      title: "Notifications",
      toggles: [
        { name: "systemAlerts", label: t("notifications") },
        {
          name: "notifications",
          label: t("receiveNotifications"),
        },
        { name: "weeklyReports", label: t("weeklyReports") },
      ],
    },
    preferences: {
      title: t("preferences"),
      select: {
        name: "language",
        options: ["English", "French"],
      },
    },
  };

  return {
    PieChartData,
    CustomersUsageChartData,
    CustomerEmailData,
    products,
    LoyaltyTableCustomers,
    navItems,
    bottomItems,
    rewards,
    LotaltyProgramCustomers,
    initialForm,
    formSections,
  };
}
