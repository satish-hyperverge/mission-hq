import { Employee, LocationStatus } from "./types";

const TEAMS = ["Engineering", "Design", "GTM", "Product", "Operations"];

const PEOPLE: { name: string; email: string; team: string }[] = [
  { name: "Satish Daraboina", email: "satish.d@hyperverge.co", team: "Engineering" },
  { name: "Krishna Teja", email: "krishna.t@hyperverge.co", team: "Engineering" },
  { name: "Priya Sharma", email: "priya.s@hyperverge.co", team: "Design" },
  { name: "Rahul Mehta", email: "rahul.m@hyperverge.co", team: "GTM" },
  { name: "Ananya Reddy", email: "ananya.r@hyperverge.co", team: "Product" },
  { name: "Vikram Singh", email: "vikram.s@hyperverge.co", team: "Engineering" },
  { name: "Sneha Patel", email: "sneha.p@hyperverge.co", team: "Design" },
  { name: "Arjun Nair", email: "arjun.n@hyperverge.co", team: "GTM" },
  { name: "Deepika Joshi", email: "deepika.j@hyperverge.co", team: "Operations" },
  { name: "Karthik Rao", email: "karthik.r@hyperverge.co", team: "Engineering" },
  { name: "Meera Gupta", email: "meera.g@hyperverge.co", team: "Product" },
  { name: "Rohit Kumar", email: "rohit.k@hyperverge.co", team: "GTM" },
  { name: "Isha Verma", email: "isha.v@hyperverge.co", team: "Engineering" },
  { name: "Amit Deshmukh", email: "amit.d@hyperverge.co", team: "Operations" },
  { name: "Neha Kulkarni", email: "neha.k@hyperverge.co", team: "Design" },
  { name: "Suresh Babu", email: "suresh.b@hyperverge.co", team: "Engineering" },
  { name: "Pooja Iyer", email: "pooja.i@hyperverge.co", team: "Product" },
  { name: "Manish Agarwal", email: "manish.a@hyperverge.co", team: "GTM" },
  { name: "Divya Menon", email: "divya.m@hyperverge.co", team: "Operations" },
  { name: "Rajesh Pillai", email: "rajesh.p@hyperverge.co", team: "Engineering" },
];

const STATUSES: LocationStatus[] = ["Office", "Home", "Client Location", "Split Day", "Travel", "Leave"];

function getWeekday(date: Date): boolean {
  const day = date.getDay();
  return day !== 0 && day !== 6;
}

function randomStatus(biasOffice: boolean = true): LocationStatus {
  // Bias towards office to make data realistic
  const rand = Math.random();
  if (biasOffice) {
    if (rand < 0.45) return "Office";
    if (rand < 0.65) return "Home";
    if (rand < 0.75) return "Client Location";
    if (rand < 0.82) return "Split Day";
    if (rand < 0.88) return "Travel";
    if (rand < 0.95) return "Leave";
    return "Pending";
  }
  return STATUSES[Math.floor(Math.random() * STATUSES.length)];
}

export function generateDummyData(): { employees: Employee[]; dates: string[] } {
  const dates: string[] = [];
  const today = new Date();

  // Generate dates for the last 3 months
  for (let i = 90; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    if (getWeekday(date)) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      dates.push(`${yyyy}-${mm}-${dd}`);
    }
  }

  const employees: Employee[] = PEOPLE.map((person) => {
    const statuses: Record<string, string> = {};

    // Some people are more office-oriented, some less
    const officePreference = Math.random();

    dates.forEach((date, idx) => {
      // Leave some recent ones as Pending
      if (idx === dates.length - 1 && Math.random() < 0.3) {
        statuses[date] = "Pending";
      } else {
        statuses[date] = randomStatus(officePreference > 0.3);
      }
    });

    return {
      name: person.name,
      email: person.email,
      team: person.team,
      statuses,
    };
  });

  return { employees, dates };
}

export function getTeams(): string[] {
  return TEAMS;
}
